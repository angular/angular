# Introducción a módulos

Las aplicaciones Angular son modulares y Angular tiene su propio sistema de modularidad llamado *NgModules*.
Los NgModules son contenedores para un bloque cohesivo de código dedicado a un dominio de aplicación, un flujo de trabajo o un conjunto de capacidades estrechamente relacionadas. Pueden contener componentes, proveedores de servicios y otros archivos de código cuyo alcance está definido por el NgModule que los contiene. Pueden importar la funcionalidad que se exporta desde otros NgModules y exportar la funcionalidad seleccionada para que la utilicen otros NgModules.

Cada aplicación Angular tiene al menos una clase NgModule, [el *módulo raíz*](guide/bootstrapping), que se llama convencionalmente `AppModule` y reside en un archivo llamado `app.module.ts`. Inicia tu aplicación *cargando* el NgModule raíz.

Si bien una aplicación pequeña puede tener sólo un NgModule, la mayoría de las aplicaciones tienen muchos más *módulos de funcionalidad*. El NgModule *raíz* para una aplicación se llama así porque puede incluir NgModules secundarios en una jerarquía de cualquier profundidad.

## Metadatos de NgModule

Un NgModule está definido por una clase decorada con `@NgModule()`. El decorador `@NgModule()` es una función que toma un único objeto de metadatos, cuyas propiedades describen el módulo. Las propiedades más importantes son las siguientes.

* `declarations`: Los [componentes](guide/architecture-components), *directivas*, y *pipes* que pertenecen a este NgModule.

* `exports`: El subconjunto de declaraciones que deberían ser visibles y utilizables en las *plantillas de componentes* de otros NgModules.

* `imports`: Otros módulos cuyas clases exportadas son necesarias para las plantillas de componentes declaradas en *este* NgModule.

* `providers`: Creadores de [servicios](guide/architecture-services) que este NgModule aporta a la colección global de servicios; se vuelven accesibles en todas las partes de la aplicación. (También puedes especificar proveedores a nivel de componente, que a menudo es preferido).

* `bootstrap`: La vista principal de la aplicación, llamado el *componente raíz*, que aloja todas las demás vistas de la aplicación. Sólo el *NgModule raíz* debe establecer la propiedad `bootstrap`.

Aquí hay una definición simple del NgModule raíz.

<code-example path="architecture/src/app/mini-app.ts" region="module" header="src/app/app.module.ts"></code-example>

<div class="alert is-helpful">

  Aquí se incluye `AppComponent` en la lista de `exports` como ilustración; en realidad no es necesario en este ejemplo. Un NgModule raíz no tiene ninguna razón para *exportar* nada porque otros módulos no necesitan *importar* el NgModule raíz.

</div>

## NgModules y componentes

NgModules proporciona un *contexto de compilación* para sus componentes. Un NgModule raíz siempre tiene un componente raíz que se crea durante el arranque, pero cualquier NgModule puede incluir cualquier cantidad de componentes adicionales, que se pueden cargar a través del enrutador o crear a través de la plantilla. Los componentes que pertenecen a un NgModule comparten un contexto de compilación.

<div class="lightbox">
  <img src="generated/images/guide/architecture/compilation-context.png" alt="Component compilation context" class="left">
</div>

<br class="clear">

Juntos, un componente y su plantilla definen una *vista*. Un componente puede contener una *jerarquía de vista*, que te permiten definir áreas arbitrariamente complejas de la pantalla que se pueden crear, modificar y destruir como una unidad. Una jerarquía de vistas puede mezclar vistas definidas en componentes que pertenecen a diferentes NgModules. Este suele ser el caso, especialmente para las bibliotecas de interfaz de usuario.

<div class="lightbox">
  <img src="generated/images/guide/architecture/view-hierarchy.png" alt="View hierarchy" class="left">
</div>

<br class="clear">

Cuando creas un componente, se asocia directamente con una sola vista, llamada *vista host*. La vista host puede ser la raíz de una jerarquía de vistas, que puede contener *vistas incrustadas*, que a su vez son las vistas de host de otros componentes. Esos componentes pueden estar en el mismo NgModule o pueden importarse desde otros NgModules. Las vistas en el árbol se pueden anidar a cualquier profundidad.

<div class="alert is-helpful">

**Nota:** La estructura jerárquica de las vistas es un factor clave en la forma en que Angular detecta y responde a los cambios en el DOM y los datos de la aplicación.

</div>

## NgModules y módulos JavaScript

El sistema NgModule es diferente y no está relacionado con el sistema de módulos JavaScript (ES2015) para administrar colecciones de objetos JavaScript. Estos son sistemas de módulos *complementarios* que puedes usar juntos para escribir tus aplicaciones.

En JavaScript, cada *archivo* es un módulo y todos los objetos definidos en el archivo pertenecen a ese módulo.
El módulo declara que algunos objetos son públicos marcándolos con la palabra clave `export`.
Otros módulos de JavaScript usan *declaraciones de importación* para acceder a objetos públicos de otros módulos.

<code-example path="architecture/src/app/app.module.ts" region="imports"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export"></code-example>

<div class="alert is-helpful">
  <a href="http://exploringjs.com/es6/ch_modules.html">Obtén más información sobre el sistema de módulos de JavaScript en la web.</a>
</div>

## Bibliotecas Angular

<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">

Angular se carga como una colección de módulos JavaScript. Puedes pensar en ellos como módulos de biblioteca. Cada nombre de biblioteca de Angular comienza con el prefijo `@angular`. Instálalos con el gestor de paquetes `npm` e importa partes de ellos con declaraciones `import` de JavaScript.

<br class="clear">

Por ejemplo, importa el decorador `Component` de Angular de la biblioteca `@angular/core` como esta.

<code-example path="architecture/src/app/app.component.ts" region="import"></code-example>

También importa NgModules desde las *bibliotecas* Angular usando declaraciones de importación de JavaScript.
Por ejemplo, el siguiente código importa el NgModule `BrowserModule` de la biblioteca `platform-browser`.

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module"></code-example>

En el ejemplo del módulo raíz simple anterior, el módulo de la aplicación necesita material de
`BrowserModule`. Para acceder a ese material, agrégalo a los metadatos `imports` de `@NgModule` de esta manera.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports"></code-example>

De esta manera, estás utilizando los sistemas de módulos Angular y JavaScript *juntos*. Aunque es fácil confundir los dos sistemas, que comparten el vocabulario común de "importaciones" y "exportaciones", te familiarizarás con los diferentes contextos en los que se utilizan.

<div class="alert is-helpful">

  Obtén más información en la guía [NgModules](guide/ngmodules).

</div>
