<h1 class="no-toc">Aplicación y tutorial Tour de héroes</h1>

<div class="callout is-helpful">
<header>Primeros Pasos </header>

En este tutorial, crearás tu propia aplicación desde cero, proporcionando experiencia con el proceso de desarrollo típico, así como una introducción a los conceptos básicos de diseño de aplicaciones, herramientas y terminología.

Si eres completamente nuevo en Angular, es posible que desees probar la aplicación de inicio rápido [**Pruébalo ahora**](start) primero.
Se basa en un proyecto listo y parcialmente completado, que puedes examinar y modificar en el entorno de desarrollo interactivo de StackBlitz, donde puedes ver los resultados en tiempo real.

El tutorial "Pruébalo" cubre los mismos temas principales&mdash;componentes, sintaxis de plantilla, enrutamiento, servicios y acceso a datos a través de HTTP&mdash; en un formato condensado, siguiendo las mejores prácticas más actuales.


</div>

Este tutorial de _Tour de héroes_ te muestra cómo configurar tu entorno de desarrollo local y desarrollar una aplicación utilizando la [Herramienta CLI de Angular](cli "referencia de comando de CLI"), y proporciona una introducción a los fundamentos de Angular.

La aplicación _Tour de héroes_ que construyes ayuda a una agencia de personal a administrar su grupo de héroes.
La aplicación tiene muchas de las características que esperarías encontrar en cualquier aplicación basada en datos.
La aplicación final adquiere y muestra una lista de héroes, edita los detalles de un héroe seleccionado y navega entre diferentes vistas de datos heroicos.

Encontrarás referencias y expansiones de este dominio de aplicación en muchos de los ejemplos utilizados en toda la documentación de Angular, pero no necesariamente necesitas trabajar en este tutorial para comprender esos ejemplos.

Al final de este tutorial, podrás hacer lo siguiente:

* Utilizar las [directivas](guide/glossary#directive "Definición de directivas") Angular integradas para mostrar y ocultar elementos y mostrar listas de datos de héroes.
* Crear [componentes](guide/glossary#component "Definición de componentes") Angular para mostrar los detalles del héroe y mostrar una lista de héroes.
* Usar el [enlace de datos](guide/glossary#data-binding "Definición de enlace de datos")(data binding) unidireccional para datos de solo lectura.
* Agregar campos editables para actualizar un modelo con enlace de datos bidireccional.
* Enlazar métodos de componentes a eventos de usuario, como pulsaciones de teclas y clics.
* Permitir a los usuarios seleccionar un héroe de una lista maestra y editar ese héroe en la vista de detalles.
* Dar formato a datos con [pipes](guide/glossary#pipe "Definición de Pipe").
* Crear un [servicio](guide/glossary#service "Definición de Servicio") compartido para reunir a los héroes.
* Utilizar [enrutamiento](guide/glossary#router "Definición de Enrutamiento") para navegar entre diferentes vistas y sus componentes.

Aprenderás suficiente Angular para comenzar y ganarás la confianza de que
Angular puede hacer lo que tú necesites que haga.

<div class="callout is-helpful">
<header>Solución</header>

Después de completar todos los pasos del tutorial, la aplicación final se verá así: <live-example name="toh-pt6"> </live-example>.

</div>

## Lo que construirás

Aquí hay una idea visual de a dónde conduce este tutorial, comenzando con una vista del "Dashboard" y los héroes más heroicos:

<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-dashboard-1.png' alt="Salida del panel de héroes">
</div>

Puedes hacer clic en los dos enlaces que se encuentran sobre el dashboard ("Dashboard" y "Héroes")
para navegar entre esta vista de Panel y una vista de Héroes.

Si haces clic en el héroe del panel "Magneta", el enrutador abre una vista de "Detalles del héroe"
donde puedes cambiar el nombre del héroe.


<div class="lightbox">
  <img src='generated/images/guide/toh/hero-details-1.png' alt="Detalles del héroe en la aplicación">
</div>

Al hacer clic en el botón "Atrás", vuelves al Panel de control.
Los enlaces en la parte superior te llevan a cualquiera de las vistas principales.
Si haces clic en "Héroes", la aplicación muestra la vista de lista maestra "Héroes".


<div class="lightbox">
  <img src='generated/images/guide/toh/heroes-list-2.png' alt="Salida de la aplicación de lista de héroes">
</div>

Cuando haces clic en un nombre de héroe diferente, el mini detalle de solo lectura debajo de la lista refleja la nueva opción.

Puedes hacer clic en el botón "Ver detalles" para profundizar en
detalles editables del héroe seleccionado.

El siguiente diagrama captura todas las opciones de navegación.

<div class="lightbox">
  <img src='generated/images/guide/toh/nav-diagram.png' alt="Ver navegación">
</div>

Aquí está la aplicación en acción:

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-anim.gif' alt="Tour de Heroes en acción">
</div>
