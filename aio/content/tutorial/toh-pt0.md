# Crea un nuevo proyecto

Primero, crea la aplicación inicial usando el Angular CLI. En este Tutorial, modificarás y ampliarás la aplicación inicial para crear la aplicación Tour de Héroes.

En esta parte del tutorial, harás lo siguiente:

1. Establecer tu ambiente de desarrollo.
2. Crear un nuevo espacio de trabajo y un proyecto de aplicación inicial.
3. Servir la aplicación.
4. Hacer cambios a la aplicación.

<div class="alert is-helpful">

Para ver la aplicación de ejemplo que describe esta página, consulta el <live-example></live-example>.

</div>

## Configura tu entorno

Para preparar tu entorno de desarrollo, sigue las instrucciones en [Creación de un entorno local](guide/setup-local "Configuración para el desarrollo local").

## Crear un nuevo espacio de trabajo y un enlace de aplicación inicial

Desarrolla tu aplicación en el contexto del espacio de trabajo Angular. [Espacio de trabajo](guide/glossary#workspace). contiene uno o más archivos [proyecto]. Un proyecto es un conjunto de archivos que componen una aplicación, biblioteca o prueba de extremo a extremo (e2e).
En este Tutorial, crearas un nuevo espacio de trabajo.

Para crear un nuevo espacio de trabajo y un proyecto de aplicación inicial:

  1. Asegurate de que no esté en la carpeta del espacio de trabajo Angular. Por ejemplo, si creó anteriormente el espacio de trabajo Introducción, cambia a la carpeta principal de esa carpeta.
  2. Ejecuta el comando CLI `ng new` y asígnale el nombre `angular-tour-of-heroes`, como se muestra a continuación.

  <code-example language="sh" class="code-shell">
    ng new angular-tour-of-heroes
  </code-example>

3. Ejecuta el comando `ng new` y verá información sobre las funciones que desea incluir en su primer proyecto de aplicación. Presione Entrar o Volver para aceptar el valor predeterminado.

Angular CLI instala los paquetes Angular npm necesarios y otras dependencias. Esto puede tomar unos pocos minutos.

También crea el siguiente espacio de trabajo y archivos de proyecto de inicio.

  * Un nuevo espacio de trabajo con una carpeta raíz llamada `angular-tour-of-heroes`.
  * Un proyecto de aplicación esqueleto inicial también llamado `angular-tour-of-heroes`. (En la subcarpeta `src`)
  * Proyecto de prueba de extremo a extremo. (En la subcarpeta `e2e`)
  * Archivos de configuración relacionados.

El primer proyecto de aplicación contiene una aplicación de bienvenida simple que puede ejecutar de inmediato.

## Servir la aplicación

Ve al directorio de tu espacio de trabajo e inicia la aplicación.

<code-example language="sh" class="code-shell">
  cd angular-tour-of-heroes
  ng serve --open
</code-example>

<div class="alert is-helpful">

El comando `ng serve` crea la aplicación, inicia el servidor de desarrollo y observa los archivos de origen.
Cuando realiza un cambio en un archivo que se está viendo, se realizará una reconstrucción en el archivo modificado.

Si especificas la bandera `--open`, se abrirá `http://localhost:4200` en tu navegador.

</div>

Asegúrate de que la aplicación se esté ejecutando en su navegador.

## Componentes de Angular

La página que se muestra es _Shell de Aplicación_.
Este shell funciona desde un **componente** Angular llamado `AppComponent`.

Los componentes son los bloques de construcción fundamentales de las aplicaciones Angular.
Ellos muestran informacion en la pantalla, esperan el ingreso de datos del usuario y toman acciones basados en esa informacion ingresada.

## Cambiar la aplicación

Para hacer algunos cambios en la aplicación de inicio, abre el proyecto en su editor de texto favorito o IDE y vaya a `src/app`.

Encontrará la implementación del shell `AppComponent`, dividido en tres archivos:

1. `app.component.ts`&mdash; Este es el código para la clase de componente escrita en TypeScript.
1. `app.component.html`&mdash; Este es el componente Plantillas escrito en HTML.
1. `app.component.css`&mdash; CSS solo para este componente.

### Cambiar el título de la aplicación

Abre el archivo de clase de componente (`app.component.ts`) y cambia el valor de la propiedad `title` a `Tour de Heroes`.

<code-example path="toh-pt0/src/app/app.component.ts" region="set-title" header="app.component.ts (class title property)"></code-example>

Abre el archivo de plantilla de componente (`app.component.html`) y
Elimina la plantilla predeterminada generada por el Angular CLI.
Coloca el siguiente HTML en su lugar.

<code-example path="toh-pt0/src/app/app.component.html"
  header="app.component.html (template)"></code-example>

Las llaves dobles son la sintaxis de *interpolación vinculante* de Angular.
Este enlace de interpolación pasa el valor de la propiedad `title` del componente en la etiqueta de encabezado HTML.

El navegador actualiza la página con el nuevo título de la aplicación.

{@a app-wide-styles}

### Añadir estilo de aplicación

La mayoría de las aplicaciones apuntan a una apariencia consistente en toda la aplicación.
El CLI ha generado un `styles.css` vacío para este propósito.
Escriba estilos que se apliquen a toda la aplicación, allí.

Abre `src/style.css` y agrega el siguiente código al archivo.

<code-example path="toh-pt0/src/styles.1.css" header="src/styles.css (excerpt)">
</code-example>

## Revisión final del código

A continuación se muestra un archivo del código mencionado en esta página.

<code-tabs>

  <code-pane header="src/app/app.component.ts" path="toh-pt0/src/app/app.component.ts">
  </code-pane>

  <code-pane header="src/app/app.component.html" path="toh-pt0/src/app/app.component.html">
  </code-pane>

  <code-pane
    header="src/styles.css (excerpt)"
    path="toh-pt0/src/styles.1.css">
  </code-pane>
</code-tabs>

## Resumen

* Creaste la estructura de la aplicación inicial utilizando el CLI Angular.
* Aprendiste que los componentes de Angular muestran datos.
* Utilizaste las llaves dobles de interpolación para mostrar el título de la aplicación.
