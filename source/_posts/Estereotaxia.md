---
title: Estereotaxia
date: 2024-12-22 23:09:51
categories:
- Matemática
- Medicina
---
Um estudo sobre a matemática por trás da biópsia estereotáxica
<!-- more -->
## Estereotaxia
A estereotaxia é uma técnica radiográfica utilizada para localizar com precisão um ponto de interesse no corpo de um paciente. Exemplos comuns são a biópsia estereotáxica de mama, na qual indentifica-se a posição de uma região com microcalcificações, com o propósito de retirar uma amostra para análise. A neurocirurgia também utiliza este método para identificar estruturas profundas no cérebro.

A estereotaxia trata-se de um problema matemático, como veremos a seguir, utilizando como exemplo hipotético um exame de mamografia. Mais especificamente a biópsia estereotáxica de mama.

## Biópsia de mama com auxílio da estereotaxia
Para obter uma amostra mamária, é necessário identificar a posição correta do alvo, permitindo um diagnóstico correto pelo médico. Utiliza-se um aparelho de raios-x conhecido como mamógrafo para capturar as imagens que possibilitam localizar as regiões afetadas. Conforme o esquema a seguir, o equipamento de radiografia captura três imagens:

![](estereotaxia.png)

O aparelho de raios-x e suas respectivas posições adotadas durante o exame radiográfico são representados pelos objetos amarelos na imagem. As diferentes perspectivas do alvo permitem identificar a profundidade que a agulha de biópsia precisará penetrar na mama da paciente. Como veremos a seguir, trata-se de um problema matemático.

## Álgebra linear

#### Contextualizando
Veremos que o caso tratado aqui é um problema bidimensional, embora o espaço seja tridimensional. Os vetores e pontos serão representados por duas coordenadas: o primeiro elemento como o eixo horizontal ({% mathjax %}x{% endmathjax %}) e o segundo elemento como o eixo vertical ({% mathjax %}z{% endmathjax %}). O eixo que vai em direção ao plano ({% mathjax %}y{% endmathjax %}) não será considerado por hora, visto que ele é o centro de rotação do aparelho de raios-x.

Observando a posição de repouso do equipamento de raios-x (a posição central e vertical), percebe-se que a coordenada horizontal do ponto {% mathjax %}\vec{p}{% endmathjax %} pode ser determinada com facilidade. No entanto, nada pode se dizer a respeito da posição vertical. A medida realizada pelo mamógrafo é a projeção do ponto {% mathjax %}\vec{p}{% endmathjax %} na direção do eixo horizontal (a grandeza escalar {% mathjax %}K_1{% endmathjax %}). Torna-se necessária a aquisição de mais duas imagens que permitam obter novas projeções em ângulos opostos ({% mathjax %}K_2{% endmathjax %} e {% mathjax %}K_3{% endmathjax %}), tal como mostrado na imagem anterior.

Ao adquirir novas imagens nos ângulos {% mathjax %}\pm \theta{% endmathjax %} duas novas projeções são obtidas: {% mathjax %}K_1{% endmathjax %} e {% mathjax %}K_2{% endmathjax %}. A relação entre estas projeções e o ponto {% mathjax %}\vec{p}{% endmathjax %} é a seguinte:

{% mathjax %}
a_1 p_1 + a_2 p_2 = |\vec{a}||\vec{p}|cos(\phi)
{% endmathjax %}

{% mathjax %}
b_1 p_1 + b_2 p_2 = |\vec{b}||\vec{p}|cos(\phi - \theta)
{% endmathjax %}

{% mathjax %}
c_1 p_1 + c_2 p_2 = |\vec{c}||\vec{p}|cos(\phi + \theta)
{% endmathjax %}

O ângulo {% mathjax %}\phi{% endmathjax %} é o ângulo entre o ponto {% mathjax %}\vec{p}{% endmathjax %} e o eixo horizontal. Porém, o lado direito das expressões anteriores é justamente o conjunto de medidas realizadas pelo aparelho de raios-x. Pode-se simplificar as expressões para:

{% mathjax %}
a_1 p_1 + a_2 p_2 = K_1
{% endmathjax %}

{% mathjax %}
b_1 p_1 + b_2 p_2 = K_2
{% endmathjax %}

{% mathjax %}
c_1 p_1 + c_2 p_2 = K_3
{% endmathjax %}

#### Determinando os vetores {% mathjax %}\vec{a}{% endmathjax %}, {% mathjax %}\vec{b}{% endmathjax %} e {% mathjax %}\vec{c}{% endmathjax %}
Note que {% mathjax %}a_n{% endmathjax %}, {% mathjax %}b_n{% endmathjax %} e {% mathjax %}c_n{% endmathjax %} representam as diferentes orientações do mamógrafo durante o exame. São estas coordenadas que permitirão determinar a posição precisa de {% mathjax %}\vec{p}{% endmathjax %}.

Adotando {% mathjax %}\vec{a}{% endmathjax %} como o eixo de referência, obtém-se a seguinte definição:

{% mathjax %}
\vec{a}=
\begin{bmatrix}
    1 & 0
\end{bmatrix}
{% endmathjax %}

O ângulo {% mathjax %}\theta{% endmathjax %} é a chave para determinar os outros vetores:

{% mathjax %}
\vec{b}=
\begin{bmatrix}
    cos(\theta) & sen(\theta)
\end{bmatrix}
{% endmathjax %}

{% mathjax %}
\vec{c}=
\begin{bmatrix}
    cos(\theta) & -sen(\theta)
\end{bmatrix}
{% endmathjax %}

Substituindo estes valores nas relações abordadas anteriormente, tem-se:

{% mathjax %}
p_1 = K_1
{% endmathjax %}

{% mathjax %}
cos(\theta) p_1 + sen(\theta) p_2 = K_2
{% endmathjax %}

{% mathjax %}
cos(\theta) p_1 - sen(\theta) p_2 = K_3
{% endmathjax %}

Chega-se às expressões finais para calcular o ponto {% mathjax %}\vec{p}{% endmathjax %}:

{% mathjax %}
p_1=\frac{K_2+K_3}{2cos(\theta)}
{% endmathjax %}


{% mathjax %}
p_2=\frac{K_2-p_1cos(\theta)}{sen(\theta)}
{% endmathjax %}

Ainda é necessário considerar os casos onde alguma das medidas é zero. Por este motivo utilizam-se três projeções diferentes. Alguma combinação das equações acima permitirá descobrir os valores do ponto de interesse.

## Conclusão
Este é um caso onde a matemática pode ser aplicada à saúde, mostrando a relevância e multidisciplinaridade que se faz necessária no campo da radiologia.
