# Sintaxis de la plantilla

En Angular, una *plantilla* es un fragmento de HTML.
Dentro de una plantilla, puedes usar una sintaxis especial para aprovechar muchas de las características de Angular.


## Prerrequisitos

Antes de aprender la sintaxis de la plantilla, debes estar familiarizado con lo siguiente:

* [Conceptos de Angular](guide/architecture)
* JavaScript
* HTML
* CSS


<!-- Do we still need the following section? It seems more relevant to those coming from AngularJS, which is now 7 versions ago. -->
<!-- You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view. -->

<hr />

Cada plantilla Angular de tu aplicación es una sección de HTML que puedes incluir como parte de la página que muestra el navegador.
Una plantilla HTML Angular muestra una vista, o interfaz de usuario, en el navegador, como HTML normal, pero con mucha más funcionalidad.

Cuando generas una aplicación Angular con Angular CLI, el archivo `app.component.html` es la plantilla predeterminada que contiene HTML de marcador de posición.

Las guías de sintaxis de la plantilla te muestran cómo puedes controlar la UX/UI coordinando los datos entre la clase y la plantilla.


<div class="is-helpful alert">

La mayoría de las guías de sintaxis de plantillas tienen aplicaciones de ejemplo de trabajo dedicadas que demuestran el tema individual de cada guía.
Para verlos a todos trabajando juntos en una aplicación, consulta al completo<live-example title="Template Syntax Live Code"></live-example>.

</div>


## Potencia tu HTML

Con una sintaxis Angular especial en tus plantillas, puedes ampliar el vocabulario HTML de tus aplicaciones.
Por ejemplo, Angular te ayuda a obtener y establecer valores DOM (Document Object Model) dinámicamente con características como funciones de plantilla integradas, variables, escucha de eventos y enlace de datos.

Casi toda la sintaxis HTML es una sintaxis de plantilla válida.
Sin embargo, debido a que una plantilla Angular es parte de una página web general, y no de toda la página, no es necesario incluir elementos como `<html>`, `<body>` o `<base>`.
Puedes centrarte exclusivamente en la parte de la página que estás desarrollando.


<div class="alert is-important">

Para eliminar el riesgo de ataques de inyección de scripts, Angular no admite el elemento `<script>` en las plantillas.
Angular ignora la etiqueta `<script>` y envía una advertencia a la consola del navegador.
Para obtener más información, consulta la página [Seguridad](guide/security).

</div>

<hr />

## Más sobre la sintaxis de la plantilla

También te puede interesar lo siguiente:

* [Interpolación](guide/interpolation)&mdash;aprende a utilizar la interpolación y las expresiones en HTML.
* [Declaraciones de plantilla](guide/template-statements)&mdash;responde a eventos en sus plantillas.
* [Sintaxis de enlace](guide/binding-syntax)&mdash;utiliza el enlace para coordinar valores en su aplicación.
* [Vinculación de propiedad](guide/property-binding)&mdash;establece las propiedades de los elementos de destino o los decoradores de la directiva `@Input ()`.
* [Vinculaciones de atributos, clases y estilos](guide/attribute-binding)&mdash;establece el valor de atributos, clases y estilos.
* [Enlace de eventos](guide/event-binding)&mdash;escucha los eventos y tu HTML.
* [Enlace bidireccional](guide/two-way-binding)&mdash;comparte datos entre una clase y su plantilla.
* [Directivas integradas](guide/built-in-directives)&mdash;escucha y modifica el comportamiento y el diseño del HTML.
* [Variables de referencia de plantilla](guide/template-reference-variables)&mdash;usa variables especiales para hacer referencia a un elemento DOM dentro de una plantilla.
* [Entradas y salidas](guide/inputs-outputs)&mdash;comparte datos entre el contexto principal y las directivas o componentes secundarios
* [Operadores de expresión de plantilla](guide/template-expression-operators)&mdash;aprende sobre el operador de tubería, `|`, y protégete contra valores `nulos` o` indefinidos` en tu HTML.
* [SVG en plantillas](guide/svg-in-templates)&mdash;genera gráficos interactivos de forma dinámica.
