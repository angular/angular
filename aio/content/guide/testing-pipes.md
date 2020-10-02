# Probando los Pipes

Puedes probar los [pipes](guide/pipes) sin las utilidades para pruebas de Angular.

<div class="alert is-helpful">

  Para la aplicación de muestra que indican las guías de prueba, visita <live-example name="testing" embedded-style noDownload>la aplicación de prueba</live-example>.

  Para las pruebas de funcionalidades en las guías de prueba, visita <live-example name="testing" stackblitz="specs" noDownload>pruebas</live-example>.

</div>

## Probando el `TitleCasePipe`

La clase de un pipe contiene un método, `transform`, que manipula el valor de entrada y lo transforma en un valor de salida.
La implementación del `transform` rara vez interactúa con el DOM.
La mayoría de los pipes no dependen de Angular más allá de los metadatos del `@Pipe` y una interfaz.

Considera una `TitleCasePipe` que pone en mayúscula la primera letra de cada palabra.
Aquí está una implementación con una expresión regular.

<code-example path="testing/src/app/shared/title-case.pipe.ts" header="app/shared/title-case.pipe.ts"></code-example>

Cualquier cosa que use una expresión regular vale la pena probarla a fondo.
Simplemente usa Jasmine para explorar todos los casos esperados y todos los casos extremos.

<code-example path="testing/src/app/shared/title-case.pipe.spec.ts" region="excerpt" header="app/shared/title-case.pipe.spec.ts"></code-example>

{@a write-tests}

## Escribiendo pruebas DOM para soportar una prueba de un pipe

Estas son pruebas de un pipe _en aislamiento_.
No pueden decir si el `TitleCasePipe` está funcionando correctamente tal y como se aplica en los componentes de la aplicación.

Considera añadir pruebas de componente como por ejemplo esta:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" header="app/hero/hero-detail.component.spec.ts (pipe test)"></code-example>

