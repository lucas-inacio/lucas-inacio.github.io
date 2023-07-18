---
title: Usando FLTK com as ferramentas de build do Visual Studio e CMake
date: 2023-07-15 13:45:44
categories:
- C++
---
Como compilar e utilizar a biblioteca FLTK (e a ferramenta Fluid) com CMake
<!-- more -->
## FLTK e seu processo de compilação
A FLTK é uma biblioteca para criação de interfaces gráficas com C++. Ela vem acompanhada de uma ferramenta chamada Fluid que permite o desenvolvimento da interface de forma visual. As instruções presentes no repositório oficial da FLTK recomendam abrir a solução .sln do Visual Studio para concluir a construção da biblioteca. Mas se você tiver apenas as ferramentas de build (não a IDE) do Visual Studio? Aqui seguem as instruções detalhadas.

### Ferramentas necessárias
- Git
- CMake
- Ferramentas de build do Visual Studio

### Antes de começar
Todos os comandos que seguem devem ser executados em um terminal de comandos de desenvolvedor do Visual Studio. 

### Obtendo a versão de release
A atual versão em desenvolvimento da FLTK é a 1.4. Porém esta versão ainda não está estável e não há lançamentos oficiais. Para produção deve-se utilizar a versão 1.3. Clone o repositório da seguinte forma:
```bash
git clone --branch 1.3.8 https://github.com/fltk/fltk.git
```

### Configurando o projeto
Dentro do diretório baixado crie um novo diretório chamado build:
```bash
mkdir build
cd build
```
Configure o projeto da seguinte forma:
```bash
cmake .. -G "Visual Studio 17 2022" --install-prefix=<diretório da sua escolha>
```

### Compilando o projeto:
A escolha do argumento ```--target``` é importante. Para compilar o projeto e instalá-lo no diretório indicado em ```--install-prefix``` escolha INSTALL. Para somente compilar escolha ALL_BUILD. Também é possível mudar a configuração de Release para Debug.
```bash
cmake --build . --target=INSTALL --config=Release
```
Os passos abordados serão suficientes para compilar a biblioteca FLTK e instalá-la no diretório escolhido. Após isso é possível utilizá-la em seus projetos.

### Utilizando a biblioteca FLTK com CMake
Vamos criar um projeto hipotético para utilizar a biblioteca FLTK. Ele será configurado de forma a utilizar os arquivos .fl gerados pela Fluid e incluir no nosso programa. Crie uma pasta para o projeto com a seguinte estrutura:
```bash
E:\TESTE
|   CMakeLists.txt
|
\---app
    |   CMakeLists.txt
    |
    \---src
            app.cpp
            ui.fl
```
Em Teste/CMakeLists.txt digite o seguinte:
```cmake
cmake_minimum_required(VERSION 3.11)

project(teste)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 20)

# Aqui indicamos onde está nossa biblioteca previamente compilada
set(FLTK_DIR E:/Caminho/Exemplo/fltk/CMake)
find_package(FLTK REQUIRED NO_MODULE)

add_subdirectory(app)
```
Crie Teste/app/CMakeLists.txt como segue:
```cmake
# O arquivo Teste/app/src/ui.fl será criado com o programa Fluid para especificar nossa interface
fltk_wrap_ui(app src/ui.fl)
add_executable(app WIN32 MACOSX_BUNDLE src/app.cpp ${app_FLTK_UI_SRCS})
target_include_directories(app PUBLIC ${FLTK_INCLUDE_DIRS})
target_link_libraries(app fltk)
```
Teste/app/src/app.cpp deve conter o seguinte:
```cpp
#include "ui.h"

int main(int argc, char **argv)
{
    Fl_Window *window = make_window();
    window->show();
    return Fl::run();
}
```
Agora para criar ul.fl é preciso utilizar o programa fluid.exe que deve estar localizado no diretório bin de instalação da biblioteca FLTK. Crie uma nova função com o nome ```make_window``` e na sequência crie uma janela e configure o rótulo para Teste. Salve o arquivo como Teste/app/src/ui.fl.
![](make_window.png)
![](criando_janela.png)
Finalmente crie um diretório build na raíz do projeto e entre nele pelo terminal do Visual Studio:
```bash
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022"
cmake --build . -- config=Release
```
Pronto. Um executável será gerado no diretório Teste/build/app/Release/app.exe.
