# Introducción a los conceptos de Angular

Angular es una plataforma y un framework para crear aplicaciones de una sola página en el lado del cliente usando HTML y TypeScript.
Angular está escrito en TypeScript.
Implementa la funcionalidad básica y opcional como un conjunto de bibliotecas TypeScript que importas en tus aplicaciones.

La arquitectura de una aplicación en Angular se basa en ciertos conceptos fundamentales.
Los bloques de construcción básicos son los *NgModules*, que proporcionan un contexto de compilación para los *componentes*. Los NgModules recopilan código relacionado en conjuntos funcionales; una aplicación de Angular se define por un conjunto de NgModules. Una aplicación siempre tiene al menos un *módulo raíz* que permite el arranque y generalmente tiene muchos más *módulos de funcionalidad*.

* Los componentes definen *vistas*, que son conjuntos de elementos de la pantalla que Angular puede elegir y modificar de acuerdo con la lógica y los datos de tu programa.

* Los componentes usan *servicios*, los cuales proporcionan una funcionalidad específica que no está directamente relacionada con las vistas. Los proveedores de servicios pueden *inyectarse* en componentes como *dependencias*, haciendo que tu código sea modular, reutilizable y eficiente.

Los módulos, componentes y servicios son clases que usan *decoradores*. Estos decoradores indican su tipo y proporcionan metadatos que le indican a Angular cómo usarlos.

* Los metadatos para una clase componente son asociados con una *plantilla* que define una vista. Una plantilla combina HTML ordinario con *directivas* de Angular y *enlace markup* que permiten a Angular modificar el HTML antes de mostrarlo para su visualización.

* Los metadatos para una clase servicio proporcionan la información que Angular necesita para que esté disponible para los componentes a través de la *Inyección de Dependencia (ID)*.

Los componentes de una aplicación suelen definir muchas vistas, ordenadas jerárquicamente. Angular proporciona el servicio `Router` para ayudarte a definir rutas de navegación entre vistas. El enrutador proporciona capacidades de navegación sofisticadas en el navegador.

<div class="alert is-helpful">

  Visita el [Glosario de Angular](guide/glossary) para ver las definiciones básicas de términos importantes en Angular y su uso.

</div>

<div class="alert is-helpful">

  Para ver la aplicación de ejemplo que describe esta página, consulta el <live-example>ejemplo</live-example>.
</div>

## Módulos

Los *NgModules* de Angular difieren y complementan los módulos JavaScript (ES2015). Un NgModule declara un contexto de compilación para un conjunto de componentes que está dedicado a un dominio de aplicación, un flujo de trabajo o un conjunto de capacidades estrechamente relacionadas. Un NgModule puede asociar sus componentes con código relacionado, como servicios, para formar unidades funcionales.

Cada aplicación en Angular tiene un *módulo raíz*, convencionalmente nombrado `AppModule`, que proporciona el mecanismo de arranque que inicia la aplicación. Una aplicación generalmente contiene muchos módulos funcionales.

Como en los módulos de JavaScript, los NgModules pueden importar la funcionalidad de otros, y permiten que su propia funcionalidad sea exportada y utilizada por otros NgModules. Por ejemplo, para utilizar el servicio de enrutamiento en su aplicación, importa el NgModule `Router`.

Organizar tu código en distintos módulos funcionales ayuda a gestionar el desarrollo de aplicaciones complejas, y en el diseño para su reutilización. Además, esta técnica te permite aprovechar la *carga diferida*&mdash;es decir, cargar módulos bajo demanda&mdash;para minimizar la cantidad de código que debe cargarse al inicio.

<div class="alert is-helpful">

  Para más información, visita [Introducción a los módulos](guide/architecture-modules).

</div>

## Componentes

Cada aplicación de Angular tiene al menos un componente, el *componente raíz* que conecta una jerarquía de componentes con el modelo de objetos del documento de la página (DOM). Cada componente define una clase que contiene datos y lógica de la aplicación, y está asociado con una *plantilla* HTML que define una vista que se mostrará en un entorno de destino.

El decorador `@Component()` identifica la clase inmediatamente debajo de ella como un componente, y proporciona la plantilla y los metadatos específicos del componente relacionado.

<div class="alert is-helpful">

   Los decoradores son funciones que modifican las clases de JavaScript. Angular define una serie de decoradores que adjuntan tipos específicos de metadatos a las clases, para que el sistema sepa qué significan esas clases y cómo deberían funcionar.

   <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">Obten más información sobre decoradores en la web.</a>

</div>

### Plantillas, directivas y enlace de datos

Una plantilla combina HTML con markup de Angular que puede modificar elementos HTML antes de que se muestren.
Las *directivas* de la plantilla proporcionan la lógica de programa y el *enlace markup* conecta los datos de tu aplicación y el DOM.
Hay dos tipos de enlace de datos:

* *Manejador de eventos* permite que tu aplicación responda a la entrada del usuario en el entorno objetivo actualizando los datos de tu aplicación.
* *Vincular propiedades* te permite interpolar valores que se calculan a partir de los datos de tu aplicación en HTML.

Antes de mostrar una vista, Angular evalúa las directivas y resuelve la sintaxis de enlace en la plantilla para modificar los elementos HTML y el DOM, de acuerdo con los datos y la lógica de tu programa. Angular soporta *enlace de datos en dos sentidos*, lo que significa que los cambios en el DOM, como las elecciones del usuario, también se reflejan en los datos de su programa.

Tus plantillas pueden usar *pipes* para mejorar la experiencia del usuario mediante la transformación de valores para mostrar.
Por ejemplo, usa pipes para mostrar fechas y valores de moneda que sean apropiados para la configuración regional de un usuario.
Angular proporciona pipes predefinidas para transformaciones comunes, y también puedes definir tus propias pipes.

<div class="alert is-helpful">

  Para más información sobre estos conseptos, visita [Introducción a los componentes](guide/architecture-components).

</div>

{@a dependency-injection}


## Servicios e inyección de dependencia

Para los datos o la lógica que no están asociados con una vista específica y que desea compartir entre componentes, crea una clase *servicio*. Una definición de clase servicio está inmediatamente precedida por el decorador `@Injectable()`. El decorador proporciona los metadatos que permiten **inyectar** otros proveedores como dependencias en su clase.

 *Inyección de Dependecia* (ID) le permite mantener sus clases componente ligeras y eficientes. No obtienen datos del servidor, validan la entrada del usuario o inician sesión directamente en la consola; tales tareas son delegadas a los servicios.

<div class="alert is-helpful">

  Para más información, visita [Introducción a los servicios e ID](guide/architecture-services).

</div>

### Enrutamiento

El NgModule `Router` de Angular proporciona un servicio que le permite definir una ruta de navegación entre los diferentes estados de la aplicación y ver sus jerarquías. Se basa en las convenciones frecuentes de navegación del navegador:

* Ingresa una URL en la barra de direcciones para que el navegador vaya a la página correspondiente.

* Haz clic en los enlaces de la página para que el navegador vaya a una nueva página.

* Haz clic en los botones atrás y adelante del navegador para que el navegador vaya hacia atrás y hacia adelante a través del historial de las páginas que has visto.

El enrutador mapea rutas similares a URL para las vistas en lugar de páginas. Cuando un usuario realiza una acción, como hacer clic en un enlace, que cargaría una nueva página en el navegador, el enrutador intercepta el comportamiento del navegador y muestra u oculta las jerarquías de vista.

Si el enrutador determina que el estado actual de la aplicación requiere una funcionalidad particular, y el módulo que lo define no se ha cargado, el enrutador puede hacer *cargar diferida* sobre el módulo bajo demanda.

El enrutador interpreta una URL de enlace de acuerdo con las reglas de navegación de visualización de la aplicación y el estado de los datos. Puedes navegar a las nuevas vistas cuando el usuario hace clic en un botón o selecciona desde un cuadro desplegable, o en respuesta a algún otro estímulo de cualquier fuente. El enrutador registra la actividad en el historial del navegador, por lo que los botones de retroceso y avance también funcionan.

Para definir reglas de navegación, asocia *rutas de navegación* a tus componentes. Una ruta utiliza una sintaxis similar a una URL que integra los datos de tu programa, de la misma manera que la sintaxis de la plantilla integra tus vistas con los datos de tu programa. Luego puedes aplicar la lógica del programa para elegir qué vistas mostrar u ocultar, en respuesta a la entrada del usuario y a tus propias reglas de acceso.

 <div class="alert is-helpful">

   Para más información, visita [Enrutamiento y navegación](guide/router).

 </div>

<hr/>

## ¿Qué sigue?

Has aprendido los conceptos básicos sobre los bloques de construcción de una aplicación en Angular. El siguiente diagrama muestra cómo se relacionan estos conceptos básicos.

<div class="lightbox">
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
</div>

* Juntos, un componente y una plantilla definen una vista en Angular.
  * Un decorador en una clase componente agrega los metadatos, incluido un apuntador a la plantilla asociada.
  * Las directivas y el enlace markup en la plantilla de un componente modifican las vistas basadas en los datos y la lógica del programa.
* El inyector de dependencia proporciona servicios a un componente, como el servicio de enrutamiento que le permite definir la navegación entre vistas.

Cada uno de estos temas se presenta con más detalle en las siguientes páginas.

* [Introducción a los Módulos](guide/architecture-modules)

* [Introducción a los Componentes](guide/architecture-components)

  * [Plantillas y Vistas](guide/architecture-components#templates-and-views)

  * [Metadatos de Componentes](guide/architecture-components#component-metadata)

  * [Enlace de Datos](guide/architecture-components#data-binding)

  * [Directivas](guide/architecture-components#directives)

  * [Pipes](guide/architecture-components#pipes)

* [Introducción a los Servicios e Inyección de Dependencias.](guide/architecture-services)

Cuando estés familiarizado con estos bloques de construcción fundamentales, podrás explorarlos con más detalle en la documentación. Para saber más acerca de las herramientas y técnicas disponibles para ayudarte a crear y desplegar aplicaciones de Angular, visita [Próximos pasos: herramientas y técnicas](guide/architecture-next-steps).
</div>
