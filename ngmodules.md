# NgModules

**NgModules** configura el inyector y el compilador y ayuda a agrupar cosas similares. 

Un NgModule es una clase marcada por el decorador `@NgModule`. Este toma un objeto metadato que describe cómo compilar la template de un componente, y cómo crear un inyector en tiempo de ejecución.

Identifica los componentes del propio módulo, directivas y pipes, haciendo algunos de ellos públicos (a través de la propiedad `export`) para que los componentes externos puedan utilizarlos.

`NgModule` también puede añadir proveedores de servicio a los inyectores  de la aplicación de dependencia.

Para ver una app de ejemplo que contiene todas las técnicas relacionadas con los `NgModules` , consulta  <live-example></live-example>. Para explicaciones individuales de cada técnica, visita las páginas específicas bajo la sección NgModules.

## Modularidad en Angular

Los módulos son una muy buena forma de organizar una aplicación y extenderla con funcionalidades de bibliotecas externas.

Las bibliotecas de Angular son NgModules, como `FormsModule`, `HttpClientModule`, and `RouterModule`.

También hay disponibles bibliotecas de terceros, tales como  <a href="https://material.angular.io/">Material Design</a>, <a href="http://ionicframework.com/">Ionic</a>, o <a href="https://github.com/angular/angularfire2">AngularFire2</a>.

Los NgModules consolidan componentes, directivas y pipes en bloques cohesivos de funcionalidades, cada uno centrado en áreas distintas como funciones, aplicación de dominios business, flujo de trabajo, o recolección de utilidades.

Los módulos también pueden añadir servicios a la aplicación. Estos servicios pueden haber sido desarrollados internamente, es decir, puedes haberlos desarrollado tú mismo o venir de una fuente extena, como el cliente HTTP y router de Angular.

Los módulos se pueden cargar de forma *entusiasta*, cuando la aplicación se inicia; o de forma *perezosa*, cargados asíncronamente por el router.

Los metadatos NgModule hacen lo siguiente:

* Declarar qué componentes, directivas y pipes pertenecen al módulo.
* Hacer algunos de esos componentes, directivas y pipes públicos para que las templates de los componentes de otros módulos puedan utilizarlos.
* Importar otros módulos con los componentes, directivas y pipes que los componentes del módulo actual requieren
* Proveer servicios que otros componentes de la aplicación pueden usar.

Todas las apps de Angular contienen como mínimo un módulo, el módulo root. Se hace [bootstrap](guide/bootstrapping) a ese módulo para iniciar la aplicación.

El módulo root es todo lo que necesitas en una aplicación simple de pocos componentes. Según tu app crezca, puedes refactorizar el módulo root en [módulos de funcionalidades](guide/feature-modules), que representan colecciones de funcionalidades similares. Luego, importa esos módulos al módulo root.

## El NgModule básico

El [CLI de Angular ](cli) genera los siguientes `AppModule` básicos cuando crea una nueva app.

<code-example path="ngmodules/src/app/app.module.1.ts" header="src/app/app.module.ts (default AppModule)">
// decorador @NgModule con sus metadatos
</code-example>

Encima están las declaraciones de `import`. La siguiente sección es donde se configura el `@NgModule`, indicando qué componentes y directivas le pertenecen (`declarations`), además de qué otros módulos utiliza (`imports`). Para más información sobre la estructura de un `@NgModule`, consulta [Bootstrapping](guide/bootstrapping).

<hr />

## Más sobre los NgModules

Puede que te interesen las siguientes páginas:
* [Módulos de funciones](guide/feature-modules).
* [Componentes de entrada](guide/entry-components).
* [Proveedores](guide/providers).
* [Tipos de NgModules](guide/module-types).
