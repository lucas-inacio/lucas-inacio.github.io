---
title: Dicas para usar libserialport
date: 2022-02-05 19:45:40
---
Dicas valiosas para quem quer utilizar essa biblioteca para comunicação serial.
<!-- more -->
## O que é a libserialport
É uma biblioteca multiplataforma escrita em C destinada a facilitar o desenvolvimento de programas que utilizam comunicação serial. Ela é desenvolvida e mantida pela [Sigrok](https://sigrok.org/).

## Problemas encontrados
Ao utilizar a biblioteca eu enfrentei dois desafios. Um deles foi a ausência de dados recebidos ao tentar se conectar a uma Raspberry Pi Pico. O outro estava relacionado com a detecção de desconexão. Abaixo é relatada a forma como eu os resolvi.

#### Ausência de dados
Após realizar a abertura da porta desejada e configurá-la não havia dados de entrada. A configuração utilizada segue abaixo:

```cpp
// Os erros não são checados neste exemplo apenas para diminuir o tamanho do código
sp_port *port;
sp_get_port_by_name("COM3", &port);
sp_open(port, SP_MODE_READ_WRITE);

sp_port_config *config;
sp_new_config(&config);
sp_set_config_baudrate(config, 9600);
sp_set_config_bits(config, 8);
sp_set_config_flowcontrol(config, SP_FLOWCONTROL_NONE);
sp_set_config_parity(config, SP_PARITY_NONE);
sp_set_config_stopbits(config, 1);
sp_set_config(port, config);
sp_free_config(config);

char buffer;
// Nunca recebe nada a não ser que a porta já tenha sido aberta por outro programa
// que a configura corretamente.
sp_blocking_read(port, &buffer, 1, 0);
sp_close(port);
sp_free_port(port);
```

Graças a [essa resposta](https://stackoverflow.com/a/8910167) foi possível resolver o problema.
O código completo segue abaixo com a inclusão da configuração necessária:
```cpp
// Os erros não são checados neste exemplo apenas para diminuir o tamanho do código
sp_port *port;
sp_get_port_by_name("COM3", &port);
sp_open(port, SP_MODE_READ_WRITE);

sp_port_config *config;
sp_new_config(&config);
sp_set_config_baudrate(config, 9600);
sp_set_config_bits(config, 8);
sp_set_config_flowcontrol(config, SP_FLOWCONTROL_NONE);
sp_set_config_parity(config, SP_PARITY_NONE);
sp_set_config_stopbits(config, 1);

// As duas linhas abaixo são a chave.
sp_set_config_dtr(config, SP_DTR_ON);
sp_set_config_rts(config, SP_RTS_ON);

sp_set_config(port, config);
sp_free_config(config);

char buffer;
// Agora funciona.
sp_blocking_read(port, &buffer, 1, 0);
sp_close(port);
sp_free_port(port);
```
Este problema nunca acontecia com um Arduino Nano, por exemplo. Aparentemente apenas alguns dispositivos se comportam dessa maneira.

#### Detectar desconexão
A maioria das funções da biblioteca libserialport retorna um valor do tipo enum sp_return. A constante SP_OK significa sucesso na operação. Outros valores podem signifcar erros (valores negativos) ou ainda ter outros siginificados dependendo da função chamada.
No entanto sp_blocking_read e sp_nonblocking_read não retornam nenhum erro se a porta for desconectada após aberta. Utilizei um hack para detectar o evento:
```cpp
bool SerialPort::checkConnected() const {
    sp_signal signals;
    // sp_get_signals falhará se a porta for desconectada
    if (sp_get_signals(mPort, &signals) == SP_OK) {
        return true;
    }
    return false;
}
```
A função sp_get_signals falha ao desconectar a porta. Com isso é possível checar periodicamente se a porta ainda está disponível.

#### Problemas resolvidos
Os detalhes descritos podem ser úteis se estiver escrevendo uma aplicação que necessite se comunicar pela porta serial. A última solução é mais um "hack", mas resolveu o problema. Espero que a informação auxilie no seu próximo projeto.

