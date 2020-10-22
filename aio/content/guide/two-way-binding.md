# Enlace bidireccional `[(...)]`

El enlace bidireccional le brinda a su aplicación una forma de compartir datos entre una clase de componente y la plantilla.

<div class="alert is-helpful">

Consulta el <live-example></live-example> para ver un ejemplo funcional que contiene los fragmentos de código de esta guía.


</div>

## Conceptos básicos del enlace bidireccional

El enlace bidireccional hace dos cosas:

1. Establece una propiedad de elemento específica.
1. Escucha un evento de cambio de elemento.

Angular ofrece una sintaxis especial _enlace de datos bidireccional_ para este propósito, `[()]`.
La sintaxis `[()]` combina los corchetes
de enlace de propiedad, `[]`, con el paréntesis de vinculación de eventos, `()`.

<div class="callout is-important">

<header>
  [( )] = banana en una caja
</header>

Visualiza una *banana en una caja* para recordar que los paréntesis van _dentro_ de los corchetes.

</div>

La sintaxis `[()]` es fácil de demostrar cuando el elemento tiene un valor configurable
propiedad llamada `x` y un evento correspondiente llamado `xChange`.
Aquí hay un `SizerComponent` que se ajusta a este patrón.
Tiene una propiedad de valor `size` y un evento acompañante `sizeChange`:

<code-example path="two-way-binding/src/app/sizer/sizer.component.ts" header="src/app/sizer.component.ts"></code-example>

<code-example path="two-way-binding/src/app/sizer/sizer.component.html" header="src/app/sizer.component.html"></code-example>

El `size` inicial es un valor de entrada de un enlace de propiedad.
Al hacer clic en los botones, aumenta o disminuye el `size`, dentro de
restricciones de valor mínimo/máximo,
y luego genera, o emite, el evento `sizeChange` con el tamaño ajustado.

Aquí hay un ejemplo en el que `AppComponent.fontSizePx` está enlazado en dos direcciones al `SizerComponent`:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-1)" region="two-way-1"></code-example>

El `AppComponent.fontSizePx` establece el valor inicial de `SizerComponent.size`.

<code-example path="two-way-binding/src/app/app.component.ts" header="src/app/app.component.ts" region="font-size"></code-example>

Al hacer clic en los botones, se actualiza `AppComponent.fontSizePx` a través del enlace bidireccional.
El valor revisado de `AppComponent.fontSizePx` fluye a través del enlace _style_,
haciendo que el texto mostrado sea más grande o más pequeño.

La sintaxis de enlace bidireccional es en realidad sólo azúcar sintáctica para un enlace _property_ y un enlace _event_.
Angular quita el azúcar de el enlace `SizerComponent` en esto:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-2)" region="two-way-2"></code-example>

La variable `$event` contiene la carga útil del evento `SizerComponent.sizeChange`.
Angular asigna el valor `$event` al ʻAppComponent.fontSizePx` cuando el usuario hace clic en los botones.

## Enlace bidireccional en formularios

La sintaxis de enlace bidireccional es una gran comodidad en comparación con
propiedades independientes y enlaces de eventos. Seria conveniente
utilizar enlace bidireccional con elementos de formulario HTML como `<input>` y
`<select>`. Sin embargo, ningún elemento HTML nativo sigue a el valor `x`
 y el patrón de evento `xChange`.

Para obtener más información sobre cómo utilizar la vinculación bidireccional en formularios, consulte
Angular [NgModel](guide/built-in-directives#ngModel).
