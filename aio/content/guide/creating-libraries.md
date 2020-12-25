# Creando librerías

Está pagina provee una vista conceptual de como puedes crear y publicar nuevas librerías para extender las funcionalidades de Angular.

Si necesitas resolver el mismo problema en mas de una aplicación (o quiere compartir tu solución con otros desarrolladores), tienes un candidato para una librería.
Un ejemplo simple puede ser un botón que envía a los usuarios hacia el sitio web de tu empresa, que sería incluido en todas las aplicaciones que tu empresa crea.

## Empezando

Usa el Angular CLI para generar un nuevo esqueleto de librería, en nuevo espacio de trabajo con los siguiente comandos.

<code-example language="bash">
 ng new my-workspace --create-application=false
 cd my-workspace
 ng generate library my-lib
</code-example>

El comando `ng generate` crea la carpeta `projects/my-lib` en el espacio de trabajo, que contiene un componente y un servicio dentro de un NgModule.

<div class="alert is-helpful">

     Para más detalles sobre como una librería es estructurada, refiérase a los [Archivos de Librería](guide/file-structure#library-project-files) en la sección de [Guía de estructura de archivos](guide/file-structure).

     Puedes usar un modelo de monorepo para usar el mismo espacio de trabajo con multiples proyectos. Véase [Configuración para espacio de trabajo multiproyecto](guide/file-structure#multiple-projects).

</div>

Cuando se genera una nueva librería, el archivo de configuración del espacio de trabajo, `angular.json`, es actualizado con un proyecto de tipo 'library'.

<code-example format="json">
"projects": {
  ...
  "my-lib": {
    "root": "projects/my-lib",
    "sourceRoot": "projects/my-lib/src",
    "projectType": "library",
    "prefix": "lib",
    "architect": {
      "build": {
        "builder": "@angular-devkit/build-ng-packagr:build",
        ...
</code-example>

Puedes crear, probar y comprobar con los comandos de CLI:

<code-example language="bash">
 ng build my-lib
 ng test my-lib
 ng lint my-lib
</code-example>

Puedes notar que el constructor configurado para el proyecto es diferente que el constructor por defecto para proyectos.
El constructor, entre otras cosas, asegura que la librería siempre este construida con el [compilador AOT](guide/aot-compiler), sin la necesidad de especificar la bandera `--prod`.

Para hacer el código de la librería reusable debes definir una API pública para ella. Esta "capa de usuario" define que esta disponible para los consumidores de tu librería. Un usuario de tu librería debería ser capaz de acceder a la funcionalidad publica (como NgModules, servicios, proveedores y en general funciones de utilidad) mediante una sola ruta.

La API pública para tu librería es mantenida en el archivo `public-api.ts` en tu carpeta de librería.
Cualquier cosa exportada desde este archivo se hace publica cuando tu librería es importada dentro de una aplicación.
Usa un NgModule para exponer los servicios y componentes.

Tu libería debería suministrar documentatión (típicamente en el archivo README) para la instalación y mantenimiento.

## Refactorizando partes de una app dentro de un librería

Para hacer tu solución reusable, necesitas ajustarla para que no dependa del código específico de la aplicación.
Aquí algunas cosas para considerar al migrar la funcionalidad de la aplicación a una librería.

* Declaraciones tales como componentes y pipes deberían ser diseñados como 'stateless' (sin estado), lo que significa que no dependen ni alteran variables externas. Si tu dependes del estado, necesitas evaluar cada caso y decidir el estado de la aplicación o el estado que la aplicación administraría.

* Cualquier observable al cual los componentes se suscriban internamente deberían ser limpiados y desechados durante el ciclo de vida de esos componentes.

* Los componentes deberían exponer sus interacciones a través de 'inputs' para proporcionar contexto y 'outputs' para comunicar los eventos hacia otros componentes.

* Verifique todas las dependencias internas.
   * Para clases personalizadas o interfaces usadas en componentes o servicios, verifique si dependen en clases adicionales o interfaces que también necesiten ser migradas.
   * Del mismo modo, si tu código de librería depende de un servicio, este servicio necesita ser migrado.
   * Si tu código de librería o sus plantillas dependen de otras librerías (como Angular Material), debes configurar tu librería con esas dependencias.

* Considere como proporcionar servicios a las aplicaciones cliente.

   * Los servicios deberían declarar sus propios proveedores (en lugar de declarar los proveedores en el NgModule o en un componente). Esto le permite al compilador dejar los servicios fuera del 'bundle' si este nunca fue inyectado dentro de la aplicación que importa la librería, véase [proveedores Tree-shakable](guide/dependency-injection-providers#tree-shakable-providers)
   * Si registras proveedores globales o compartes proveedores a través de múltiples NgModules, usa el [`forRoot()` y `forChild()` como patrones de diseño](guide/singleton-services) proporcionados por el [RouterModule](api/router/RouterModule).
   * Si tu librería proporciona servicios opcionales que podrían no ser usados por todos las aplicaciones cliente, soporte apropiadamente el 'tree-shaking' para esos casos usando el [patrón de diseño de token ligero](guide/lightweight-injection-tokens).

{@a integrating-with-the-cli}

## Integración con el CLI usando generación de código con los schematics.

Comúnmente una librería incluye *código reusable* que define componentes, servicios y otros Artefactos de Angular (pipes, directivas y etc.) que tu simplemente importas a un proyecto.
Una librería es empaquetada dentro de un paquete npm para publicar y compartir.

Este paquete también puede incluir [schematics](guide/glossary#schematic) que proporciona instrucciones para generar o transformar código directamente un tu proyecto, de la misma forma que el CLI crea un nuevo componente genérico con `ng generate component`.

Un 'schematic' empaquetado con una librería puede por ejemplo proporcionar al Angular CLI la información que necesita para generar un componente que configura y usa una particular característica o conjunto de características, definido en la librería.

Un ejemplo de esto es el 'schematic' de navegación de Angular Material el cual configura los CDK's `BreakpointObserver` y lo usa con los componentes `MatSideNav` y `MatToolbar` de Angular Material.

Puedes crear e incluir los siguientes tipos de 'schematics'.

* Incluye un 'schematic' de instalación para que con `ng add` puedas agregar tu libería a un proyecto.

* Incluye un 'schematic' de generación en tu librería para que con `ng generate` puedas hacer scaffolding de sus artefactos (componentes, servicios, pruebas y etc) en un proyecto.

* Incluye un 'schematic' de actualización para que con `ng update` puedas actualizar las dependencias de tu librería y proporcionar migraciones para cambios importantes en un nuevo release.

Lo que incluya tu librería depende de tu tarea.
Por ejemplo, podrías definir un 'schematic' para crear un desplegable (dropdown) que esta pre-poblado con datos para mostrar como agregarlo a una aplicación.
Si quieres un desplegable (dropdown) que contendrá valores diferentes cada vez, tu librería podría definir un 'schematic' para crearlo con una configuración dada. Los desarrolladores podrán entonces usar `ng generate` para configurar una instancia para sus propias aplicaciones.

Supón que quieres leer un archivo de configuración y entonces generar una formulario con base a la configuración.
Si este formulario necesita personalización adicional por parte del desarrollador que esta usando tu librería, esto podría trabajar mejor como un 'schematic'.
Sin embargo, si el formulario siempre será el mismo y no necesita de mucha personalización por parte de los desarrolladores, entonces podría crear un componente dinámico que tome la configuración y genere el formulario.
En general, entre más compleja sea personalización, la más util será en enfoque de un 'schematic'.

Para aprender más, véase [Vista general de Schematics](guide/schematics) y [Schematics para librerías](guide/schematics-for-libraries).

{@a publishing-your-library}

## Publicando tu librería

Usa el Angular CLI y el gestor de paquetes npm para construir y publicar tu librería como un paquete npm.

Antes de publicar una librería a NPM, constrúyela usando la bandera `--prod` la cúal usará el compilador y tiempo de ejecución (runtime) más antiguos como 'View Engine' en vez de 'Ivy'.

<code-example language="bash">
ng build my-lib --prod
cd dist/my-lib
npm publish
</code-example>

Si nunca has publicado un paquete en npm antes, tu debes crear un cuenta. Lee más en [Publicando paquetes npm](https://docs.npmjs.com/getting-started/publishing-npm-packages).

<div class="alert is-important">

Por ahora, no es recomendando publicar librerías con Ivy hacia NPM por que Ivy genera código que no es retrocompatible con 'View Engine', entonces las aplicaciones usando 'View Engine' no podrán consumirlas. Además, las instrucciones internas de IVY no son estables aun, lo cual puede romper potencialmente a los consumidores que usan una diferente versión de Angular a la que uso para construir la libería.

Cuando una librería publicada es usada en una aplicación con Ivy, el Angular CLI automáticamente la convertirá a Ivy usando una herramienta conocida como el compilador de compatibilidad Angular (`ngcc`). Por lo tanto, publicar tus librerías usado el compilador 'View Engine' garantiza que ellas puede ser consumidas de forma transparente por ambos motores 'View Engine' y 'Ivy'.

</div>

{@a lib-assets}

## Gestionando activos (assets) en una librería.

Desde la versión 9.x de la herramienta [ng-packagr](https://github.com/ng-packagr/ng-packagr/blob/master/README.md), puedes configurar la herramienta para que automáticamente copie los activos (assets) dentro de el paquete de librería como parte del proceso de construcción.
Puedes usar esta característica cuando tu librería necesite publicar archivos de temas opcionales, funciones de Sass o documentación (como un registro de cambios 'changelog').

* Aprende como [copiar activos (assets) dentro de tu librería como parte de la construcción](https://github.com/ng-packagr/ng-packagr/blob/master/docs/copy-assets.md).

* Aprende más acerca de como usar la herramienta para [incrustar activos (assets) de CSS](https://github.com/ng-packagr/ng-packagr/blob/master/docs/embed-assets-css.md).


## Vinculando librerías

Mientras trabajas en un librería publicada, puedes usar [npm link](https://docs.npmjs.com/cli/link) para evitar re instalar la librería en cada construcción.

La librería debe ser reconstruida en cada cambio.
Cuando vinculas una librería, asegurate que el paso de construir corra en modo vigía (watch mode) y que el `package.json` de la librería configure los puntos de entrada correctos.
Por ejemplo, `main` debería apuntar a un archivo JavaScript, no a un archivo TypeScript.

## Utiliza el mapeo de rutas de TypeScript por las dependencias de pares.

Las librerías de Angular deben enumerar todas las dependencias `@angular/*` como dependencias de pares.
Esto garantiza que cuando los módulos solicitan Angular, todos ellos obtienen exactamente el mismo módulo.
Si tu librería lista `@angular/core` en `dependencies` en vez de en `peerDependencies`, podría obtener un módulo Angular diferente, lo qué haría que tu aplicación se rompiera.

Cuando desarrollas una librería, tu debes instalar todas las dependencias de pares mediante `devDependencies` para garantizar que la librería compile apropiadamente.
Una librería vinculada tendrá su propio conjunto de librerías Angular que usa para construir, ubicados en su carpeta `node_modules`.

Sin embargo, esto puede causar problemas mientras construyes o corres tu aplicación.

Para evitar este problema tu puedes usar el mapeo de rutas de TypeScript para indicarle a TypeScript que este debería cargar algunos módulos desde una ubicación especifica.

Enumera todas las dependencias de pares que tu librería usa en el archivo de configuración `./tsconfig.json` del espacio de trabajo de TypeScript, y apúntalos a la copia local en la carpeta `node_modules` de la aplicación.

```
{
  "compilerOptions": {
    // ...
    // paths are relative to `baseUrl` path.
    "paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
    }
  }
}
```

Este mapeador garantiza que tu librería siempre cargue las copias locales del módulo que necesita.


## Usando tu propia librería en aplicaciones.

No tienes que publicar tu librería hacia el gestor de paquetes npm para usarla en tus propias aplicaciones, pero tienes que construirla primero.

Para usar tu propia librería en tu aplicación:

* Construye la librería. No puedes usar una librería antes que se construya.
 <code-example language="bash">
 ng build my-lib
 </code-example>

* En tus aplicaciones, importa la librería por el nombre:
 ```
 import { myExport } from 'my-lib';
 ```

### Construyendo y re construyendo tu librería.

El paso de construir es importante si no tienes publicada tu librería como un paquete npm y luego ha instalado el paquete de nuevo dentro tu aplicación desde npm.
Por ejemplo, si clonas tu repositorio git y corres `npm install`, tu editor mostrará la importación de `my-lib` como perdida si no tienes aun construida tu librería.

<div class="alert is-helpful">

Cuando importas algo desde una librería en una aplicación Angular, Angular busca un mapeo entre el nombre de librería y una ubicación en disco.
Cuando instalas un paquete de librería, el mapeo esta en la carpeta `node_modules`. Cuando construyes tu propia librería, tiene que encontrar el mapeo en tus rutas de `tsconfig`.

Generando una librería con el Angular CLI automáticamente agrega su ruta en el archivo `tsconfig`.
El Angular CLI usa las rutas `tsconfig` para indicarle al sistema construido donde encontrar la librería.

</div>

Si descubres que los cambios en tu librería no son reflejados en tu aplicación, tu aplicación probablemente esta usando una construcción antigua de la librería.

Puedes re construir tu librería cada vez que hagas cambios en esta, pero este paso extra toma tiempo.
Las *construcciones incrementales* funcionalmente mejoran la experiencia de desarrollo de librerías.
Cada vez que un archivo es cambiando una construcción parcial es realizada y esta emite los archivos modificados.

Las *Construcciones incrementales* puede ser ejecutadas como un proceso en segundo plano en tu entorno de desarrollo. Para aprovechar esta característica agrega la bandera `--watch` al comando de construcción:

<code-example language="bash">
ng build my-lib --watch
</code-example>

<div class="alert is-important">

El comando `build` del CLI utiliza un constructor diferente e invoca una herramienta de construcción diferente para las librerías que para las aplicaciones.

* El sistema de construcción para aplicaciones, `@angular-devkit/build-angular`, esta basado en `webpack`, y esta incluida en todos los nuevos proyectos de Angular CLI.
* El sistema de construcción esta basado en `ng-packagr`. Este es solo agregado en tus dependencias cuando agregas una librería usando `ng generate library my-lib`.

Los dos sistemas de construcción soportan diferentes cosas e incluso si ellos soportan las mismas cosas, ellos hacen esas cosas de forma diferente.
Esto quiere decir que la fuente de TypeScript puede generar en código JavaScript diferente en una librería construida que en una aplicación construida.

Por esta razón, una aplicación que depende de una librería debería solo usar el mapeo de rutas de TypeScript que apunte a la *librería construida*.
El mapeo de rutas de TypeScript no debería apuntar hacia los archivos `.ts` fuente de la librería.

</div>
