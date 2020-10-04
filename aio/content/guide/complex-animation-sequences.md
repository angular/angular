# Secuencias de animación complejas

#### Requisitos

Una comprensión básica de los siguientes conceptos:

- [Introducción a animaciones Angular](guide/animations)
- [Transición y triggers](guide/transition-and-triggers)

<hr>

Hasta ahora, hemos aprendido animaciones simples de elementos HTML individuales. Angular también te permite animar secuencias coordinadas, como un grid completo o una lista de elementos cuando entran y salen de una página. Puedes elegir ejecutar varias animaciones en paralelo, o ejecutar animaciones discretas secuencialmente, una tras otra.

Las funciones que controlan secuencias de animación complejas son las siguientes:

- `query()` encuentra uno o más elementos HTML internos.
- `stagger()` aplica un retraso en cascada a las animaciones para varios elementos.
- [`group()`](api/animations/group) ejecuta varios pasos de animación en paralelo.
- `sequence()` ejecuta pasos de animación uno tras otro.

{@a complex-sequence}

## Animar varios elementos usando las funciones query() y stagger()

La función `query()` permite encontrar elementos internos dentro del elemento que estás animando. Esta función se dirige a elementos HTML específicos dentro de un componente principal y aplica animaciones a cada elemento individualmente. Angular maneja de manera inteligente la configuración, el desmontaje y la limpieza a medida que coordina los elementos en la página.

La función `stagger()` permite definir un intervalo de tiempo entre cada elemento consultado que está animado y, por lo tanto, anima elementos con un retraso entre ellos.

La pestaña Filter/Stagger en el ejemplo en vivo muestra una lista de héroes con una secuencia introductoria. La lista completa de héroes entra en cascada, con un ligero retraso de arriba a abajo.

El siguiente ejemplo demuestra cómo utilizar las funciones `query()` y `stagger()` en la entrada de un elemento animado.

- Usa `query()` para buscar un elemento que ingrese a la página que cumpla con ciertos criterios.

- Para cada uno de estos elementos, usa `style()` para establecer el mismo estilo inicial para el elemento. Hazlo invisible y usa `transform` para moverlo fuera de su posición para que pueda deslizarse a su lugar.

- Usa `stagger()` para retrasar cada animación en 30 milisegundos.

- Anima cada elemento en la pantalla durante 0,5 segundos utilizando una curva de easing (suavizado) definida a medida, desvaneciéndolo y deshaciéndolo simultáneamente.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="page-animations" language="typescript"></code-example>

## Animación paralela usando la función group()

Has visto cómo agregar un retraso entre cada animación sucesiva. Pero es posible que también quieras configurar animaciones que suceden en paralelo. Por ejemplo, es posible que quieras animar dos propiedades CSS del mismo elemento pero utilizar una función de `easing` diferente para cada una. Para ello, puedes utilizar la función de animación [`group()`](api/animations/group).

<div class="alert is-helpful">

**Nota:** La función [`group()`](api/animations/group) se usa para agrupar _pasos_ de animación, en lugar de elementos animados.

</div>

En el siguiente ejemplo, el uso de grupos tanto en `:enter` como en `:leave` permite dos configuraciones de tiempo diferentes. Se aplican al mismo elemento en paralelo, pero se ejecutan de forma independiente.

<code-example path="animations/src/app/hero-list-groups.component.ts" region="animationdef" header="src/app/hero-list-groups.component.ts (excerpt)" language="typescript"></code-example>

## Animaciones secuenciales vs paralelas

Las animaciones complejas pueden tener muchas cosas sucediendo a la vez. Pero, ¿qué sucede si quieres crear una animación que involucre varias animaciones sucediendo una tras otra? Anteriormente usamos [`group()`](api/animations/group) para ejecutar múltiples animaciones al mismo tiempo, en paralelo.

Una segunda función llamada `sequence()` permite ejecutar esas mismas animaciones una tras otra. Dentro de `sequence()`, los pasos de la animación consisten en llamadas de función `style()` o `animate()`

- Usa `style()` para aplicar los datos de estilo proporcionados inmediatamente.
- Usa `animate()` para aplicar datos de estilo en un intervalo de tiempo determinado.

## Ejemplo de animación de filtro

Echemos un vistazo a otra animación en la página de ejemplo. En la pestaña Filter/Stagger, ingresa un texto en el cuadro de texto **Search Heroes**, como `Magnet` o `tornado`.

El filtro funciona en tiempo real a medida que escribe. Los elementos abandonan la página a medida que escribe cada nueva letra y el filtro se vuelve progresivamente más estricto. La lista de héroes vuelve a entrar gradualmente en la página a medida que eliminas cada letra en la caja de filtro.

La plantilla HTML contiene un trigger llamado `filterAnimation`.

<code-example path="animations/src/app/hero-list-page.component.html" header="src/app/hero-list-page.component.html" region="filter-animations"></code-example>

El archivo del componente contiene tres transiciones.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="filter-animations" language="typescript"></code-example>

La animación hace lo siguiente:

- Ignora las animaciones que se realizan cuando el usuario abre o navega por primera vez a esta página. El filtro reduce lo que ya está allí, por lo que asume que los elementos HTML que se van a animar ya existen en el DOM.

- Realiza un filtro de coincidencia.

Para cada coincidencia:

- Oculta el elemento haciéndolo completamente transparente e infinitamente estrecho, estableciendo su opacidad y ancho en 0.

- Anima el elemento más de 300 milisegundos. Durante la animación, el elemento asume su ancho y opacidad predeterminados.

- Si hay varios elementos coincidentes, se escalona en cada elemento comenzando en la parte superior de la página, con un retraso de 50 milisegundos entre cada elemento.

## Resumen de la secuencia de animación

Las funciones Angular para animar múltiples elementos comienzan con `query()` para encontrar elementos internos, por ejemplo, reuniendo todas las imágenes dentro de un `<div>`. Las funciones restantes, `stagger()`, [`group()`](api/animations/group) y `sequence()`, aplican cascadas o te permiten controlar cómo se aplican múltiples pasos de animación.

## Más sobre animaciones en Angular

También puedes estar interesado en lo siguiente:

- [Introducción a animaciones Angular](guide/animations)
- [Transición y triggers](guide/transition-and-triggers)
- [Animaicones reusables](guide/reusable-animations)
- [Animaciones en transición de ruta](guide/route-animations)
