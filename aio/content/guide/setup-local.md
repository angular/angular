# Configurar el ambiente y el espacio de trabajo locales


Esta guía explica cómo configurar tu ambiente para el desarrollo Angular usando la [Herramienta CLI de Angular](cli "CLI command reference").
Incluye información sobre los requisitos previos, la instalación de la CLI, la creación de un espacio de trabajo inicial y una aplicación de inicio, y la ejecución de esa aplicación localmente para verificar su configuración.


<div class="callout is-helpful">
<header>Prueba Angular sin configuración local</header>

Si eres nuevo en Angular, quizás quieras comenzar con [¡Pruebalo ahora!](start), que presenta los aspectos esenciales de Angular en el contexto de una aplicación de tienda en línea básica lista para usar que puedes examinar y modificar. Este tutorial independiente aprovecha lo interactivo del ambiente [StackBlitz](https://stackblitz.com/) para el desarrollo online. No es necesario que configures tu entorno local hasta que estes listo.

</div>


{@a devenv}
{@a prerequisites}
## Prerrequisitos

Para usar el framewok Angular, debes estar familiarizado con lo siguiente:

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
* [HTML](https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML)
* [CSS](https://developer.mozilla.org/docs/Learn/CSS/First_steps)

Conocimiento de [TypeScript](https://www.typescriptlang.org/) es útil, pero no obligatorio.

Para instalar Angular en su sistema local, necesitas lo siguiente:

{@a nodejs}

* **Node.js**
  
  Angular requiere una versión [actual, LTS activa o LTS de mantenimiento](https://nodejs.org/about/releases) de Node.js.

  <div class="alert is-helpful">

  Para obtener información sobre los requisitos específicos de la versión, consulta la llave `engines` en el archivo [package.json](https://unpkg.com/@angular/cli/package.json).

  </div>

  Para obtener más información sobre la instalación de Node.js, consulta [nodejs.org](http://nodejs.org "Nodejs.org").
  Si no estas seguro de qué versión de Node.js se ejecuta en tu sistema, ejecuta `node -v` en una terminal.

{@a npm}

* **npm package manager**

  Angular, CLI de Angular, y las aplicaciones de Angular dependen de [paquetes npm](https://docs.npmjs.com/getting-started/what-is-npm) para muchas funcionalidades y funciones.
  Para descargar e instalar paquetes npm, necesitas un administrador de paquetes npm.
  Esta guía utiliza la interfaz de línea de comandos del [cliente npm](https://docs.npmjs.com/cli/install), que se instala con `Node.js` por defecto.
  Para comprobar que tiene instalado el cliente npm, ejecute `npm -v` en una terminal.


{@a install-cli}

## Instalar la CLI de Angular

Utilizaraz la CLI de Angular para crear proyectos, generar código de aplicaciones y bibliotecas, y realizar una variedad de tareas de desarrollo, como pruebas, agrupación e implementación.

Para instalar CLI de Angular, abre una terminal y ejecuta el siguiente comando:

<code-example language="sh" class="code-shell">
  npm install -g @angular/cli
</code-example>

{@a create-proj}

## Crea un espacio de trabajo y una aplicación inicial

Desarrollas aplicaciones en el contexto de un [**espacio de trabajo**](guide/glossary#workspace) de Angular.

Para crear un nuevo espacio de trabajo y una aplicación inicial:

1. Ejecuta el comando CLI `ng new` y proporciona el nombre `my-app`, como se muestra aquí:

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

2. El comando `ng new` te solicitara información sobre las funciones que debe incluir en la aplicación inicial. Acepta los valores predeterminados presionando la tecla Enter o Return.

La CLI de Angular instala los paquetes npm de Angular necesarios y otras dependencias. Esto puede tardar unos minutos.

La CLI crea un nuevo espacio de trabajo y una aplicación de bienvenida simple, lista para ejecutarse.

<div class="alert is-helpful">

También tienes la opción de usar el modo estricto de Angular, que puede ayudarte a escribir un código mejor y más fácil de mantener.
Para más información, mira [Modo estricto](/guide/strict-mode).

</div>

{@a serve}

## Ejecutar la aplicación

La CLI de Angular incluye un servidor, de modo que puede crear y servir su aplicación localmente.

1. Navega a la carpeta del espacio de trabajo, como `my-app`.

1. Ejecuta el siguiente comando:

<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>

El comando `ng serve` inicia el servidor, observa sus archivos,
y reconstruye la aplicación a medida que realizas cambios en esos archivos.

La opción `--open` (o simplemente` -o`) abre automáticamente su navegador
en `http://localhost:4200/`.

Si tu instalación y configuración fue exitosa, deberías ver una página similar a la siguiente.


<div class="lightbox">
  <img src='generated/images/guide/setup-local/app-works.png' alt="Welcome to my-app!">
</div>


## Pasos siguientes

* Para obtener una introducción más completa a los conceptos fundamentales y la terminología de la arquitectura de aplicaciones de una sola página y los principios de diseño de Angular, lee la sección [Conceptos Angular](guide/architecture) .

* Trabaja en el [Tutorial de Tour de los Heroes](tutorial), un ejercicio práctico completo que te presenta el proceso de desarrollo de aplicaciones mediante la CLI de Angular y te explica los subsistemas importantes.

* Para obtener más información sobre el uso de la CLI de Angular, consulta la [Descripción general del CLI](cli "CLI Overview"). Además de crear el espacio de trabajo inicial y andamios de la aplicación, puedes usar la CLI para generar código de Angular como componentes y servicios. La CLI soporta el ciclo de desarrollo completo, incluida la creación, las pruebas, la agrupación y la implementación.

* Para obtener más información sobre los archivos de Angular generados por `ng new`, consulta [Espacio de trabajo y Estructura de archivos del proyecto](guide/file-structure).
