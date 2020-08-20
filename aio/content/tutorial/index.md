<h1 class="no-toc">Aplicación y tutorial Tour de héroes</h1>

<div class="callout is-helpful">
<header>Primeros Pasos </header>

En este tutorial, creará su propia aplicación desde cero, proporcionando experiencia con el proceso de desarrollo típico, así como una introducción a los conceptos básicos de diseño de aplicaciones, herramientas y terminología.

Si es completamente nuevo en Angular, es posible que desee probar la aplicación de inicio rápido [**Pruébelo ahora **](start) primero.
Se basa en un proyecto listo y parcialmente completado, que puede examinar y modificar en el entorno de desarrollo interactivo de StackBlitz, donde puede ver los resultados en tiempo real.

El tutorial "Pruébalo" cubre los mismos temas principales&mdash;componentes, sintaxis de plantilla, enrutamiento, servicios y acceso a datos a través de HTTP&mdash; en un formato condensado, siguiendo las mejores prácticas más actuales.


</div>

Este tutorial de _Tour de héroes_ le muestra cómo configurar su entorno de desarrollo local y desarrollar una aplicación utilizando la [Herramienta CLI de Angular](cli "referencia de comando de CLI"), y proporciona una introducción a los fundamentos de Angular.

La aplicación _Tour de héroes_ que construyes ayuda a una agencia de personal a administrar su grupo de héroes.
La aplicación tiene muchas de las características que esperaría encontrar en cualquier aplicación basada en datos.
La aplicación final adquiere y muestra una lista de héroes, edita los detalles de un héroe seleccionado y navega entre diferentes vistas de datos heroicos.

Encontrará referencias y expansiones de este dominio de aplicación en muchos de los ejemplos utilizados en toda la documentación de Angular, pero no necesariamente necesita trabajar en este tutorial para comprender esos ejemplos.

Al final de este tutorial, podrá hacer lo siguiente:

* Utilizar las [directivas](guide/glossary#directive "Directives definition") Angular integradas para mostrar y ocultar elementos y mostrar listas de datos de héroes.
* Crear [componentes](guide/glossary#component "Components definition") angular para mostrar los detalles del héroe y mostrar una serie de héroes.
* Usar el [enlace de datos](guide/glossary#data-binding "Data binding definition")(data binding) unidireccional para datos de solo lectura.
* Agregar campos editables para actualizar un modelo con enlace de datos bidireccional.
* Enlazar métodos de componentes a eventos de usuario, como pulsaciones de teclas y clics.
* Permitir a los usuarios seleccionar un héroe de una lista maestra y editar ese héroe en la vista de detalles.
* Dar Formato a datos con [tuberías](guide/glossary#pipe "Pipe definition")(pipes)
* Crear un [servicio](guide/glossary#service "Service definition") compartido para reunir a los héroes.
* Utilizar [enrutamiento](guide/glossary#router "Router definition")(routing) para navegar entre diferentes vistas y sus componentes.

Aprenderá suficiente Angular para comenzar y ganará la confianza de que
Angular puede hacer lo que sea necesario.

<div class="callout is-helpful">
<header>Solución</header>

Después de completar todos los pasos del tutorial, la aplicación final se verá así: <live-example name="toh-pt6"> </live-example>.

</div>

## Lo que construirás

Aquí hay una idea visual de a dónde conduce este tutorial, comenzando con el "Tablero(Dashboard)"
ver y los héroes más heroicos:

<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Salida del panel de héroes">
</div>

Puede hacer clic en los dos enlaces que se encuentran sobre el tablero ("Tablero"(Dashboard) y "Héroes")
para navegar entre esta vista de Panel y una vista de Héroes.

Si hace clic en el héroe del panel "Magneta", el enrutador abre una vista de "Detalles del héroe"
donde puedes cambiar el nombre del héroe.


<div class="lightbox">
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Detalles del héroe en la aplicación">
</div>

Al hacer clic en el botón "Atrás", vuelve al Panel de control.
Los enlaces en la parte superior lo llevan a cualquiera de las vistas principales.
Si hace clic en "Héroes", la aplicación muestra la vista de lista maestra "Héroes".


<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Salida de la aplicación de lista de héroes">
</div>

Cuando haces clic en un nombre de héroe diferente, el mini detalle de solo lectura debajo de la lista refleja la nueva opción.

Puede hacer clic en el botón "Ver detalles" para profundizar en
detalles editables del héroe seleccionado.

El siguiente diagrama captura todas las opciones de navegación.

<div class="lightbox">
  <img src='generated/images/guide/toh/nav-diagram.png' alt="Ver navegación">
</div>

Aquí está la aplicación en acción:

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour de Heroes en acción">
</div>
