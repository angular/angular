# Área de trabajo de las dependencias de npm

El framework Angular, el CLI de Angular y los componentes usados por las aplicaciones Angular se empaquetan como [paquetes de npm](https://docs.npmjs.com/getting-started/what-is-npm "¿Qué es npm?") y se distribuyen a través del [registro de npm](https://docs.npmjs.com/).

Puedes descargar e instalar esos paquetes de npm utilizando el [cliente CLI de npm](https://docs.npmjs.com/cli/install), el cuál se instala y ejecuta como una aplicación de [Node.js®](https://nodejs.org "Nodejs.org"). Por defecto el CLI de Angular utiliza el cliente de npm.

Alternativamente puedes utilizar el [cliente yarn](https://yarnpkg.com/) para descargar e instalar los paquetes de npm.


<div class="alert is-helpful">

Mira [Preparar Entorno Local](guide/setup-local "Preparándose para el desarrollo local") para ver información acerca de la instalación y las versiones requeridas de `Node.js` y `npm`.

Si ya tenías proyectos anteriores en tu máquina que utilizan otras versiones de Node.js y npm considera usar [nvm](https://github.com/creationix/nvm) para gestionar las diferentes versiones de Node.js y npm.

</div>


## `package.json`

Tanto `npm` como `yarn` instalan los paquetes que están identificados en un archivo [`package.json`](https://docs.npmjs.com/files/package.json).

El comando del CLI `ng new` genera un archivo `package.json` al crear el proyecto.
Este `package.json` es usado por todos los proyectos en el entorno incluyendo el proyecto inicial generado por el CLI al crear este entorno.

Inicialmente este `package.json` incluye _una serie de paquetes_, algunos de ellos necesarios para Angular y otros que soportan escenarios comunes de aplicación.
Puedes añadir paquetes al `package.json` según tu aplicación crece.
También puedes borrarlos si es necesario.

El `package.json` se organiza en dos grupos de paquetes:

* [Dependencies](guide/npm-packages#dependencies) son necesarias para *ejecutar* aplicaciones.
* [DevDependencies](guide/npm-packages#dev-dependencies) son solo necesarias para *desarrollar* aplicaciones.

<div class="alert is-helpful">

**Desarrolladores de librerías:** Por defecto el comando de CLI [`ng generate library`](cli/generate) crea un `package.json` para la nueva librería. Ese `package.json` es usado cuando se publica la librería en npm.
Para más información leer [Creando librerías](guide/creating-libraries).
</div>


{@a dependencies}
## Dependencies

Los paquetes listados en la sección `dependencies` del `package.json` son esenciales para *ejecutar* aplicaciones.

La sección `dependencies` del `package.json` contiene:

* [**Paquetes de Angular**](#angular-packages): El núcleo de Angular y módulos opcionales; el nombre de estos paquetes comienza por `@angular/`.

* [**Paquetes de soporte**](#support-packages): Librerías de terceros que son necesarias para que las aplicaciones de Angular se puedan ejecutar.

* [**Paquetes de Polyfill**](#polyfills): Los Polyfills rellenan huecos en la implementación de Javascript de un navegador.

Para añadir una nueva dependencia usa el comando [`ng add`](cli/add).

{@a angular-packages}
### Paquetes de Angular

Los siguientes paquetes de Angular se incluyen como dependencias en el archivo `package.json` por defecto en un nuevo proyecto de Angular.
Para ver la lista completa de paquetes de Angular visita la siguiente [referencia a la API](api?type=package).

Nombre del Paquete                               | Descripción
----------------------------------------   | --------------------------------------------------
[**@angular/animations**](api/animations) | La librería de animaciones de Angular hace sencillo definir y aplicar efectos animados como transiciones de página y listas. Para más información visita [la guía de animaciones](guide/animations).
[**@angular/common**](api/common) | Los servicios comunes necesarios, pipes, y directivas proveídas por el equipo de Angular. El [`HttpClientModule`](api/common/http/HttpClientModule) también está aquí, en la subcarpeta [`@angular/common/http`](api/common/http). Para más información visita [la guía de HttpClient](guide/http).
**@angular/compiler** | El compilador de plantillas de Angular. Entiende las plantillas y las puede convertir a código que hace que la aplicación se ejecute y renderice. Habitualmente no interactúas con el compilador directamente; más bien lo usas indirectamente a través del `platform-browser-dynamic` cuando se compila en el navegador en tiempo de ejecución (JIT). Para más información visita [la guía de compilación AOT (Ahead-of-time)](guide/aot-compiler).
[**@angular/core**](api/core) | Partes críticas del framework requeridas por cualquier aplicación en el tiempo de ejecución. Incluye todos los decoradores de los metadatos, `Componentes`, `Directivas`, inyección de dependencias y los ciclos de vida de los componentes.
[**@angular/forms**](api/forms) | Soporte para formularios de tipo [template-driven](guide/forms) y [reactive forms](guide/reactive-forms). Para más información acerca de cuál es la mejor implementación de los formularios para tu aplicación visita [Introducción a los formularios](guide/forms-overview).
[**@angular/<br />platform&#8209;browser**](api/platform-browser) | Todo lo relacionado con el DOM y el navegador, especialmente las piezas que ayudan a renderizar el DOM. Este paquete también incluye el método `bootstrapModuleFactory()` para cargar aplicaciones para builds de producción que pre-compilan con [AOT](guide/aot-compiler).
[**@angular/<br />platform&#8209;browser&#8209;dynamic**](api/platform-browser-dynamic) | Incluye [providers](api/core/Provider) y métodos para compilar y ejecutar la aplicación en el cliente utilizando el [compilador JIT](guide/aot-compiler).
[**@angular/router**](api/router) | El módulo enrutador navega a través de las páginas de tu aplicación cuando la URL cambia. Para más información visita [Enrutado y Navegación](guide/router).


{@a support-packages}
### Paquetes de soporte

Los siguientes paquetes de soporte están incluidos como dependencias en el archivo `package.json` por defecto para un nuevo proyecto de Angular.


Nombre del Paquete                               | Descripción
----------------------------------------   | --------------------------------------------------
[**rxjs**](https://github.com/ReactiveX/rxjs) | Muchas APIs de Angular retornan [_observables_](guide/glossary#observable). RxJS es una implementación de la propuesta actual de [especificación de Observables](https://github.com/tc39/proposal-observable) antes del comité [TC39](https://www.ecma-international.org/memento/tc39.htm) que determina los estándares para el lenguaje JavaScript.
[**zone.js**](https://github.com/angular/zone.js) | Angular depende de zone.js para ejecutar el proceso de detección de cambios de Angular cuando operaciones de JavaScript nativas lanzan eventos. Zone.js es una implementación actual de la [especificación](https://gist.github.com/mhevery/63fdcdf7c65886051d55) antes del comité [TC39](https://www.ecma-international.org/memento/tc39.htm) que determina los estándares para el lenguaje JavaScript.


{@a polyfills}
### Paquetes de Polyfill

Muchos navegadores no tienen soporte de forma nativa para algunas funcionalidades de los últimos estándares de HTML, funcionalidades que Angular necesita.
Los [_Polyfills_](https://en.wikipedia.org/wiki/Polyfill_(programming)) pueden emular las funcionalidades que falten.
La guía de [soporte de navegador](guide/browser-support) explica qué navegadores necesitan polyfills y cómo los puedes añadir.


{@a dev-dependencies}

## DevDependencies

Los paquetes listados en la sección `devDependencies` del `package.json` te ayudan a desarrollar tu aplicación en tu ordenador. No necesitas desplegarla en un entorno de producción.

Para añadir una `devDependency` usa uno de los siguientes comandos:

<code-example language="sh" class="code-shell">
  npm install --save-dev &lt;package-name&gt;
</code-example>

<code-example language="sh" class="code-shell">
  yarn add --dev &lt;package-name&gt;
</code-example>

Las siguientes `devDependencies` se proveen en el archivo `package.json` por defecto para un nuevo proyeto de Angular.


Nombre del Paquete                               | Descripción
----------------------------------------   | -----------------------------------
[**@angular&#8209;devkit/<br />build&#8209;angular**](https://github.com/angular/angular-cli/) | Las herramientas de creación de Angular.
[**@angular/cli**](https://github.com/angular/angular-cli/) | Las herramientas del CLI de Angular.
**@angular/<br />compiler&#8209;cli** | El compilador de Angular, el cual es invocado por el CLI de Angular mediante los comandos `ng build` y `ng serve`.
**@types/... ** | Archivos Typescript de definición de librerías de terceros como Jasmine y Node.js.
[**codelyzer**](https://www.npmjs.com/package/codelyzer) | Un linter para las aplicaciones de Angular con las reglas que conforman la [guía de estilos](guide/styleguide) de Angular.
**jasmine/... ** | Paquetes para añadir soporte para la librería de testing [Jasmine](https://jasmine.github.io/).
**karma/... ** | Paquetes para añadir soporte para el ejecutador de tests  [karma](https://www.npmjs.com/package/karma).
[**protractor**](https://www.npmjs.com/package/protractor) | Un framework end-to-end (e2e) para aplicaciones de Angular. Construido sobre [WebDriverJS](https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs).
[**ts-node**](https://www.npmjs.com/package/ts-node) | Entorno de ejecución de Typescript y REPL para Node.js.
[**tslint**](https://www.npmjs.com/package/tslint) | Una herramienta de análisis estático de código que comprueba el código Typescript para que sea legible, mantenible y no contenga errores funcionales.
[**typescript**](https://www.npmjs.com/package/typescript) | El lenguaje de servidor Typescript, incluye el compilador de Typescript *tsc*.


## Información relacionada

 Para obtener información acerca de cómo el CLI de Angular maneja los paquetes visita las siguientes guías:

 * [Creando y sirviendo](guide/build) describe como los paquetes se unen para crear una build de desarrollo.
 * [Desplegando](guide/deployment) describe como los paquetes se unen para crear una build de producción.
 
