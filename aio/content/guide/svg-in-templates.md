# SVG en templates

Es posible utilizar SVG como un template válido en Angular. Toda la sintaxis de templates a continuación es aplicable tanto a SVG como a HTML. Puedes consultar más en las especificaciones SVG [1.1](https://www.w3.org/TR/SVG11/) y [2.0](https://www.w3.org/TR/SVG2/) .

<div class="alert is-helpful">

Consulta <live-example name="template-syntax"></live-example> para ver un ejemplo funcional que contiene los fragmentos de código mostrados en esta guía. </div>

¿Por qué usar un template SVG, cuando puedes simplemente añadirlo como una imagen a tu aplicación? 

Cuando utilizas SVG como template, puedes emplear directivas y enlaces de la misma forma que harías con templates HTML. Esto significa que puedes generar gráficos interactivos dinámicamente

Consulta el fragmento de código proporcionado para un ejemplo de la sintaxis:

<code-example path="template-syntax/src/app/svg.component.ts" header="src/app/svg.component.ts"></code-example>

Añade este código a tu archivo`svg.component.svg`:

<code-example path="template-syntax/src/app/svg.component.svg" header="src/app/svg.component.svg"></code-example>

Aquí puedes ver el uso de un enlace de evento `click()` y la sintaxis de un enlace de propiedad (`[attr.fill]="fillColor"`).
