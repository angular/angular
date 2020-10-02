
{@a attribute-directive}

# Probando Directivas de Atributo

Una _directiva de atributo_ modifica el comportamiento de un elemento, componente u otra directiva.
Su nombre refleja la forma en que se aplica la directiva: como un atributo en un elemento anfitrión.

<div class="alert is-helpful">

  Para la aplicación de muestra que describen las guías de prueba, visita la <live-example name="testing" embedded-style noDownload>aplicación de muestra</live-example>.

  Para las funcionalidaddes de las pruebas en las guías de pruebas, visita las <live-example name="testing" stackblitz="specs" noDownload>pruebas</live-example>.

</div>

## Probando la `HighlightDirective`

La directiva de muestra `HighlightDirective` fija el color de fondo de un elemento basado en un color de referencia o en un color predeterminado (lightgray).
También establece una propiedad personalizada del elemento (`customProperty`) a `true`
sin otro motivo más que demostrar que puede.

<code-example path="testing/src/app/shared/highlight.directive.ts" header="app/shared/highlight.directive.ts"></code-example>

Se usa a lo largo de la aplicación, quizás más sencillamente en el `AboutComponent`:

<code-example path="testing/src/app/about/about.component.ts" header="app/about/about.component.ts"></code-example>

Probar el uso específico de la `HighlightDirective` dentro del `AboutComponent` sólo requiere las técnicas exploradas en la sección ["Pruebas de componentes anidados"](guide/testing-components-scenarios#nested-component-tests) de [Escenarios de pruebas de componentes](guide/testing-components-scenarios).

<code-example path="testing/src/app/about/about.component.spec.ts" region="tests" header="app/about/about.component.spec.ts"></code-example>

Sin embargo, probar un solo caso de uso es poco probable que explore toda la variedad de las posibilidades de una directiva.
Encontrar y probar todos los componentes que utilizan la directiva es tedioso, delicado y casi igual de improbable que permita una cobertura completa.

Las _Pruebas de clase exclusivas_ pueden ser de ayuda,
pero las directivas de atributo como ésta tienden a manipular el DOM.
Las pruebas unitarias aisladas no tocan el DOM y, por lo tanto,
no inspiran confianza en la eficacia de la directiva.

Una solución mejor es crear un componente de prueba artificial que demuestre todas las formas de aplicar la directiva.

<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="test-component" header="app/shared/highlight.directive.spec.ts (TestComponent)"></code-example>

<div class="lightbox">
  <img src='generated/images/guide/testing/highlight-directive-spec.png' alt="HighlightDirective spec in action">
</div>

<div class="alert is-helpful">

El caso de `<input>` vincula la `HighlightDirective` al nombre de un valor de color en el campo de entrada.
El valor inicial es la palabra "cyan" que debería ser el color de fondo del cuadro de entrada.

</div>

Aquí hay algunas pruebas de este componente:

<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="selected-tests" header="app/shared/highlight.directive.spec.ts (selected tests)"></code-example>

Cabe destacar algunas técnicas:

- El predicado de la `By.directive` es una buena forma de obtener los elementos que tienen esta directiva _cuando sus tipos de elementos son desconocidos_.

- La <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/:not">`:not` pseudo-clase</a>
  en `By.css('h2:not([highlight])')` ayuda a encontrar los elementos `<h2>` _que no_ tienen la directiva.
  `By.css('*:not([highlight])')` encuentra _cualquier_ elemento que no tiene la directiva.

- `DebugElement.styles` permite acceder a los estilos de los elementos incluso en ausencia de un navegador real, gracias a la abstracción de `DebugElement`.
  Pero siéntete libre de explotar el `nativeElement` cuando te parezca más fácil o más claro que la abstracción.

- Angular añade una directiva al inyector del elemento al que se aplica.
  La prueba para el color por defecto usa el inyector del segundo `<h2>` para obtener la instancia de su `HighlightDirective`
  y su `defaultColor`.

- `DebugElement.properties` permite el acceso a la propiedad artificial personalizada que se establece en la directiva.

<hr>
