---
title: Usando o ADC do ESP32 para gravar áudio
date: 2023-05-24 19:38:45
categories:
- Microcontroladores
---
Como utilizar o ADC do ESP32 com alta taxa de captura
<!-- more -->
## Motivação
O núcleo do Arduino para o ESP32 facilita muito a criação de pequenos projetos. Porém as abstrações criadas pela API do
Arduino acabam sacrificando o desempenho pela acessibilidade. Aplicações onde o velocidade é um fator importante exigem que nos aprofundemos sobre o funcionamento do hardware e em como utilizar suas ferramentas oficiais. É o caso da captura de áudio onde altas taxas de amostragem se fazem necessárias para atingir um grau de fidelidade. O ESP32 possui um SDK oficial chamado ESP-IDF. Ele permite explorar toda a capacidade do SoC. A solução apresentada configura o ADC para operar no modo de aquisição contínua utilizando os recursos de acesso direto à memória (DMA).

## Conversor Analógico/Digital (ADC)
O ESP32 possui dois módulos ADC que podem ser utilizados por cinco controladores diferentes. No entando somente o ADC1 pode ser usado em DMA. A resolução máxima é de 12 bits.

![](sar-adc-depiction.jpg)

Configurar o ADC para operar no modo DMA significa que ele realizará capturas em intervalos fixos e os escreverá diretamente na memória, sem intervenção da CPU.

### Configuração
O código abaixo foi adaptado do [exemplo](https://github.com/espressif/esp-idf/tree/release/v4.4/examples/peripherals/adc/dma_read) disponibilizado pelo repositório oficial do ESP-IDF no GitHub.

Primeiramente o driver do ADC é inicializado utilizando o controlador digital. Nesse momento são especificados os tamanhos dos buffers, o ADC utilizado e os canais.

Depois uma estrutura ```adc_digi_pattern_config_t``` deve ser criada para configurar cada canal indepentendemente. Nesse caso somente o canal 7 (GPIO35) é configurado.

Finalmente a taxa de amostragem desejada é indicada com o uso da estrutura ```adc_digi_configuration_t```. 44,1kHz é um valor comum para áudio.

A função ```continuous_adc_init``` é chamada na função ```setup``` em seguida.

```cpp
// Referente a configurações do ADC
#define ADC_BUFFER       1024
#define ADC_NUM_BYTES    512 // 256 amostras de 16 bits

static void continuous_adc_init(void)
{
    // Inicializa o driver ADC
    adc_digi_init_config_t adc_dma_config = {
        .max_store_buf_size = 1024,
        .conv_num_each_intr = ADC_NUM_BYTES,
        .adc1_chan_mask = BIT(7), // Canal 7 (pino 35 do ESP32)
        .adc2_chan_mask = ADC_UNIT_1,
    };
    ESP_ERROR_CHECK(adc_digi_initialize(&adc_dma_config));

    // Configura o canal 7 do ADC1 (GPIO35)
    adc_digi_pattern_config_t adc_pattern = {
        .atten = ADC_ATTEN_DB_11,
        .channel = ADC1_CHANNEL_7,
        .unit = 0,
        .bit_width = SOC_ADC_DIGI_MAX_BITWIDTH, // 12 bits
    };

    // Configura o ADC para operar no modo DMA
    adc_digi_configuration_t dig_cfg = {
        .conv_limit_en = 1, // Esse valor deve ser 1 para ESP32
        .conv_limit_num = 250,
        .pattern_num = 1, // Apenas um canal é utilizado
        .adc_pattern = &adc_pattern,
        .sample_freq_hz = 44100, // Amostragem a 44,1kS/s (áudio a 44,1kHz)
        .conv_mode = ADC_CONV_SINGLE_UNIT_1,
        .format = ADC_DIGI_OUTPUT_FORMAT_TYPE1,
    };
    ESP_ERROR_CHECK(adc_digi_controller_configure(&dig_cfg));
}

void setup() {
    continuous_adc_init();
    adc_digi_start(); // Inicia a captura
}

void loop() {

}
```
## Capturando os dados
Agora o ESP32 está capturando as amostras do ADC a uma taxa de aproximadamente 44,1kHz. Porém o buffer de 1024 bytes configurado anteriormente logo será preenchido. Caso as amostras não sejam lidas a tempo o buffer será sobrescrito. Como, então, deve-se ler esses dados?

### Leitura das amostras
No ```loop``` pode-se utilizar a função ```adc_digi_read_bytes``` para obter acesso às amostras lidas pelo ADC. Ela espera pelo tempo especificado ou até que as amostras estejam prontas.

Contanto que os dados sejam lidos suficientemente rápido todas as amostras serão obtidas.

É responsabilidade do ```loop``` ler os dados rapidamente. Isso significa que não é possível realizar operações lentas nessa função. Se o objetivo for, por exemplo, gravar os dados em um cartão SD, será necessário delegar este trabalho a outra tarefa.

```cpp
void loop() {
    esp_err_t ret;
    uint32_t ret_num = 0;
    uint8_t result[ADC_NUM_BYTES];

    // Espera pelos resultados do ADC por até 1 segundo
    ret = adc_digi_read_bytes(result, ADC_NUM_BYTES, &ret_num, 1000);
    if(ret == ESP_OK) {
        // Faça alguma coisa com as amostras

    } else if (ret != ESP_ERR_TIMEOUT) {
        Serial.println("Erro inesperado!");
        ESP.restart();
    }
}
```
## Processando os dados
Para este exemplo as amostras serão gravadas em um cartão SD. As amostras serão convertidas para oito bits e escritas em um arquivo .wav. O uso da classe ```Wav8BitLoader``` é empregado para facilitar o processo.

### Funcionamento
A função ```setup``` deve ser modificada para criar uma tarefa (task) que será responsável por gravar os dados no cartão SD. Essa tarefa terá um pilha de ```EXCHANGE_BUFFER_SIZE``` bytes.

A cada aquisição o ```loop``` preenche um dos buffers. Quando houver dados o suficiente (4096 bytes nesse caso) o buffer é trocado, permitindo que ```storeTask``` manipule os dados novos sem interrupção.

```cpp
// Dupla de buffers. Eles são trocados sempre que há dados suficientes para escrita.
// O tamanho deve ser um múltiplo de ADC_NUM_BYTES / 2
#define EXCHANGE_BUFFER_SIZE 4096
uint8_t buffer1[EXCHANGE_BUFFER_SIZE];
uint8_t buffer2[EXCHANGE_BUFFER_SIZE];
size_t loopCounter = 0;
volatile uint8_t *loopPointer = buffer1;  // usado no loop
volatile uint8_t *storePointer = buffer2; // usado na tarefa de gravação

TaskHandle_t storeTaskHandle;

void swap_buffers() {
    volatile uint8_t *tmp = loopPointer;
    loopPointer = storePointer;
    storePointer = tmp;
}

Wav8BitLoader *wav = nullptr;
void storeTask(void *param) {
    while(true) {
        // Espera indefinidamente pelos dados
        uint32_t taskCount = ulTaskNotifyTake(pdFALSE, portMAX_DELAY);
        wav->writeData((uint8_t *)storePointer, EXCHANGE_BUFFER_SIZE);
    }
}

void setup() {
    Serial.begin(115200);
    if(!SD.begin(SS, SPI, 10000000)) {
        Serial.println("Erro ao inicializar SD!");
        ESP.restart();
    }

    wav = new Wav8BitLoader(SD, "/novo.wav");
    if(wav->header.chunkSize == 0) {
        Serial.println("Erro ao ler arquivo!");
        ESP.restart();
    }

    // Cria tarefa de gravação
    xTaskCreate(
        storeTask, "SD task", EXCHANGE_BUFFER_SIZE, nullptr, 1, &storeTaskHandle);
    if(storeTaskHandle == nullptr) {
        Serial.println("Falha ao criar tarefa");
        ESP.restart();
    }

    continuous_adc_init();

    Serial.println("Iniciando captura de som");
    adc_digi_start();
}

void loop() {
    esp_err_t ret;
    uint32_t ret_num = 0;
    uint8_t result[ADC_NUM_BYTES];

    // Espera pelos resultados do ADC por até 1 segundo
    ret = adc_digi_read_bytes(result, ADC_NUM_BYTES, &ret_num, 1000);
    if(ret == ESP_OK) {
        for(size_t i = 0; i < ret_num; i += 2) {
            adc_digi_output_data_t *data =
                reinterpret_cast<adc_digi_output_data_t*>(&result[i]);
            uint8_t value = (data->type1.data >> 4) | ((data->type1.data >> 4) & 0x07);
            loopPointer[loopCounter++] = value;
        }

        // Observe que ADC_NUM_BYTES devem ser lidos por vez de forma que o
        // teste abaixo funcione.
        // Como cada amostra tem 2 bytes temos ADC_NUM_BYTES / 2 (256) amostras por vez.
        // Quando houver 2048 amostras notifica storeTask para gravar os dados.
        if(loopCounter == EXCHANGE_BUFFER_SIZE) {
            loopCounter = 0;
            // Troca os buffers para poder continuar capturando os dados do ADC
            // enquanto a tarefa storeTask grava os bytes no cartão SD
            swap_buffers();
            // Notifica storeTask que há dados a serem gravados
            xTaskNotifyGive(storeTaskHandle);
        }

    } else if (ret != ESP_ERR_TIMEOUT) {
        Serial.println("Erro inesperado!");
        ESP.restart();
    }
}
```
O [código completo](https://github.com/lucas-inacio/esp32_wav_recorder) está disponível no Gitub. Incluindo a implementação da classe ```Wav8BitLoader```.
## Conclusão
É comum utilizar o periférico I2S do ESP32 para ler/escrever áudio no formato digital. Ou ainda utilizá-lo para ler do ADC. A abordagem apresentada utiliza somente o ADC e suas APIs. O código é mais simples e pode servir para diversas aplicações além de áudio.

## Referências
[Guia da API do ESP32 v4.4.4](https://docs.espressif.com/projects/esp-idf/en/v4.4.4/esp32/api-reference/peripherals/adc.html)
[Manual de Referência do ESP32](https://www.espressif.com/sites/default/files/documentation/esp32_technical_reference_manual_en.pdf)
[Exemplo oficial da Espressif utilizando o ADC no modo DMA](https://github.com/espressif/esp-idf/tree/release/v4.4/examples/peripherals/adc/dma_read)