# Agregar navegación en la aplicación con enrutamiento

Hay nuevos requisitos para la aplicación Tour de Héroes:

* Agregar una vista de *Panel de control*.
* Agregar la capacidad de navegar entre las vistas *Héroes* y *Dashboard*.
* Cuando los usuarios hacen clic en el nombre de un héroe en cualquiera de las vistas, navegar a una vista detallada del héroe seleccionado.
* Cuando los usuarios hacen clic en un *enlace profundo* en un correo electrónico, abrir la vista detallada de un héroe en particular.

<div class="alert is-helpful">

  Para ver la aplicación de ejemplo que describe esta página, consulta el <live-example></live-example>.

</div>

Cuando hayas terminado, los usuarios podrán navegar por la aplicación de esta manera:

<div class="lightbox">
  <img src='generated/images/guide/toh/nav-diagram.png' alt="View navigations">
</div>

## Agregar el `AppRoutingModule`

En Angular, la mejor práctica es cargar y configurar el enrutador en un módulo de nivel superior separado
que está dedicado al enrutamiento e importado por la raíz `AppModule`.

Por convención, el nombre de la clase del módulo es `AppRoutingModule` y pertenece a `app-routing.module.ts` en la carpeta `src/app`.

Utiliza el CLI para generarlo.

<code-example language="sh" class="code-shell">
  ng generate module app-routing --flat --module=app
</code-example>

<div class="alert is-helpful">

`--flat` coloca el archivo en `src/app` en lugar de en su propia carpeta. <br>
`--module=app` le dice a la CLI que lo registre en el arreglo de `importaciones` del `AppModule`.
</div>

El archivo generado se ve así:

<code-example path="toh-pt5/src/app/app-routing.module.0.ts" header="src/app/app-routing.module.ts (generated)">
</code-example>

Reemplázalo con lo siguiente:

<code-example path="toh-pt5/src/app/app-routing.module.1.ts" header="src/app/app-routing.module.ts (updated)">
</code-example>

Primero, `AppRoutingModule` importa `RouterModule` y `Routes` para que la aplicación pueda tener funcionalidad de enrutamiento. La siguiente importación, `HeroesComponent`, le dará al enrutador un lugar adonde ir una vez que configure las rutas.

Ten en cuenta que las referencias de CommonModule y el arreglo de declaraciones son innecesarias, por lo que ya no forman parte de `AppRoutingModule`. Las siguientes secciones explican el resto del `AppRoutingModule` con más detalle.

### Rutas

La siguiente parte del archivo es donde configuras tus rutas.
Las *Rutas* le indican al enrutador qué vista mostrar cuando un usuario hace clic en un enlace o
pega una URL en la barra de direcciones del navegador.

Como `AppRoutingModule` ya importa `HeroesComponent`, puedes usarlo en el arreglo de `rutas`:

<code-example path="toh-pt5/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts"
  region="heroes-route">
</code-example>

Una `Ruta` típica de Angular tiene dos propiedades:

* `path`: una cadena que coincide con la URL en la barra de direcciones del navegador.
* `component`: el componente que el enrutador debe crear al navegar a esta ruta.

Esto le dice al enrutador que haga coincidir esa URL con `path: 'héroes'`
y mostrar el `HeroesComponent` cuando la URL sea algo como `localhost:4200/heroes`.

### `RouterModule.forRoot()`

Los metadatos `@NgModule` inicializan el enrutador y lo hacen escuchar los cambios de ubicación del navegador.

La siguiente línea agrega el `RouterModule` al arreglo `AppRoutingModule` de `importartaciones` y
lo configura con las `rutas` en un solo paso llamando
`RouterModule.forRoot()`:

<code-example path="toh-pt5/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts" region="ngmodule-imports">
</code-example>

<div class="alert is-helpful">

  El método se llama `forRoot()` porque configura el  enrutador en el nivel raíz de la aplicación.
   El método `forRoot()` proporciona los proveedores de servicios y las directivas necesarias para el enrutamiento,
   y realiza la navegación inicial basada en la URL del navegador actual.

</div>

A continuación, `AppRoutingModule` exporta el `RouterModule` para que esté disponible en toda la aplicación.

<code-example path="toh-pt5/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts (exports array)" region="export-routermodule">
</code-example>

## Agregar `RouterOutlet`

Abre la plantilla `AppComponent` y reemplaza el elemento `<app-heroes>` con un elemento `<router-outlet>`.

<code-example path="toh-pt5/src/app/app.component.html" region="outlet" header="src/app/app.component.html (router-outlet)">
</code-example>

La plantilla `AppComponent` ya no necesita `<app-heroes>` porque la aplicación solo mostrará el `HeroesComponent` cuando el usuario navegue hacia él.

El `<router-outlet>` le dice al enrutador dónde mostrar las vistas enrutadas.

<div class="alert is-helpful">

El `RouterOutlet` es una de las directivas del enrutador que estuvo disponible para el `AppComponent`
porque `AppModule` importa `AppRoutingModule` que exportó `RouterModule`. El comando `ng generate` que ejecutaste al comienzo de este tutorial agregó esta importación debido a la marca `--module=app`. Si creaste manualmente `app-routing.module.ts` o usaste una herramienta que no sea la CLI para hacerlo, deberás importar `AppRoutingModule` a `app.module.ts` y agregarlo al arreglo de `importaciones` del `NgModule`.

</div>

#### Pruébalo

Deberías seguir ejecutando este comando CLI.

<code-example language="sh" class="code-shell">
  ng serve
</code-example>

El navegador debería actualizar y mostrar el título de la aplicación, pero no la lista de héroes.

Mira la barra de direcciones del navegador.
La URL termina en `/`.
La ruta de acceso a `HeroesComponent` es `/heroes`.

Agrega `/heroes` a la URL en la barra de direcciones del navegador.
Deberías ver la vista maestra / detalle de héroes.

{@a routerlink}

## Agregar un enlace de navegación (`routerLink`)

Idealmente, los usuarios deberían poder hacer clic en un enlace para navegar en lugar de
pegar una URL de ruta en la barra de direcciones.

Agrega un elemento `<nav>` y, dentro de él, un elemento de ancla que, al hacer clic,
activa la navegación al `HeroesComponent`.
La plantilla `AppComponent` revisada se ve así:

<code-example path="toh-pt5/src/app/app.component.html" region="heroes" header="src/app/app.component.html (heroes RouterLink)">
</code-example>

Un [atributo `routerLink`](#routerlink) se establece en `"/heroes"`,
la cadena que el enrutador coincide con la ruta a `HeroesComponent`.
El `routerLink` es el selector para la [directiva `RouterLink`](/api/router/RouterLink)
que convierte los clics del usuario en navegaciones del enrutador.
Es otra de las directivas públicas del `RouterModule`.

El navegador se actualiza y muestra el título de la aplicación y el enlace de héroes.
pero no la lista de héroes.

Haz clic en el enlace.
La barra de direcciones se actualiza a `/heroes` y aparece la lista de héroes.

<div class="alert is-helpful">

Haz que este y los futuros enlaces de navegación se vean mejor agregando estilos CSS privados a `app.component.css`
como se indica en la [revisión final del código](#appcomponent) a continuación.

</div>

## Agregar una vista de panel

El enrutamiento tiene más sentido cuando hay varias vistas.
Hasta ahora solo existe la vista de héroes.

Agrega un `DashboardComponent` usando la CLI:

<code-example language="sh" class="code-shell">
  ng generate component dashboard
</code-example>

La CLI genera los archivos para el `DashboardComponent` y lo declara en `AppModule`.

Reemplaza el contenido del archivo predeterminado en estos tres archivos de la siguiente manera:

<code-tabs>
  <code-pane
    header="src/app/dashboard/dashboard.component.html" path="toh-pt5/src/app/dashboard/dashboard.component.1.html">
  </code-pane>

  <code-pane
    header="src/app/dashboard/dashboard.component.ts" path="toh-pt5/src/app/dashboard/dashboard.component.ts">
  </code-pane>

  <code-pane
    header="src/app/dashboard/dashboard.component.css" path="toh-pt5/src/app/dashboard/dashboard.component.css">
  </code-pane>
</code-tabs>

La _plantilla_ presenta una cuadrícula de enlaces de nombres de héroes.

* El repetidor `*ngFor` crea tantos enlaces como hay en en el arreglo `heroes` del componente.
* Los enlaces están diseñados como bloques de colores por el `dashboard.component.css`.
* Los enlaces no van a ninguna parte todavía, pero [lo harán en breve](#hero-details).

La _clase_ es similar a la clase `HeroesComponent`.
* Define una propiedad de arreglo de héroes.
* El constructor espera que Angular inyecte el `HeroService` en una propiedad privada de `heroService`.
* El método del ciclo de vida `ngOnInit()` llama a `getHeroes()`.

Este `getHeroes()` devuelve la lista dividida de héroes en las posiciones 1 y 5, devolviendo solo cuatro de los mejores héroes (segundo, tercero, cuarto y quinto).

<code-example path="toh-pt5/src/app/dashboard/dashboard.component.ts" header="src/app/dashboard/dashboard.component.ts" region="getHeroes">
</code-example>

### Agregar la ruta del dashboard

Para navegar hasta el dashboard, el enrutador necesita una ruta adecuada.

Importa el `DashboardComponent` en el `AppRoutingModule`.

<code-example path="toh-pt5/src/app/app-routing.module.ts" region="import-dashboard" header="src/app/app-routing.module.ts (import DashboardComponent)">
</code-example>

Agrega una ruta al arreglo `AppRoutingModule.routes` que coincida con una ruta al `DashboardComponent`.

<code-example path="toh-pt5/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts" region="dashboard-route">
</code-example>

### Agregar una ruta predeterminada

Cuando se inicia la aplicación, la barra de direcciones del navegador apunta a la raíz del sitio web.
Eso no coincide con ninguna ruta existente, por lo que el enrutador no navega a ninguna parte.
El espacio debajo del `<router-outlet>` está en blanco.

Para que la aplicación navegue al dashboard automáticamente, agrega la siguiente
ruta al arreglo `rutas`.

<code-example path="toh-pt5/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts" region="redirect-route">
</code-example>

Esta ruta redirige una URL que coincide completamente con la ruta vacía a la ruta cuya ruta es `'/dashboard'`.

Después de que el navegador se actualiza, el enrutador carga el `DashboardComponent`
y la barra de direcciones del navegador muestra la URL `/dashboard`.

### Agregar enlace del dashboard al caparazón

El usuario debe poder navegar hacia adelante y hacia atrás entre
`DashboardComponent` y `HeroesComponent` haciendo clic en los enlaces en el
área de navegación cerca de la parte superior de la página.

Agrega un enlace de navegación del panel de control a la plantilla de caparazón `AppComponent`, justo encima del enlace *Héroes*.

<code-example path="toh-pt5/src/app/app.component.html" header="src/app/app.component.html">
</code-example>

Después de que se actualice el navegador, puedes navegar libremente entre las dos vistas haciendo clic en los enlaces.

{@a hero-details}
## Navegando a los detalles del héroe

El `HeroDetailsComponent` muestra los detalles de un héroe seleccionado.
Por el momento, el `HeroDetailsComponent` solo es visible en la parte inferior del `HeroesComponent`

El usuario debería poder acceder a estos detalles de tres formas.

1. Haciendo clic en un héroe en el dashboard.
1. Haciendo clic en un héroe de la lista de héroes.
1. Pegando una URL de "enlace profundo" en la barra de direcciones del navegador que identifica al héroe a mostrar.

En esta sección, habilitarás la navegación al `HeroDetailsComponent`
y lo liberarás del `HeroesComponent`.

### Eliminar _detalles de héroe_ de `HeroesComponent`

Cuando el usuario hace clic en un elemento de héroe en el `HeroesComponent`,
la aplicación debería navegar hasta el `HeroDetailComponent`,
reemplazando la vista de lista de héroes con la vista de detalles de héroe.
La vista de lista de héroes ya no debería mostrar los detalles de los héroes como lo hace ahora.

Abre la plantilla `HeroesComponent` (`heroes/heroes.component.html`) y
elimina el elemento `<app-hero-detail>` de la parte inferior.

Al hacer clic en un elemento de héroe ahora no hace nada.
Lo [arreglarás en breve](#heroes-component-links) después de habilitar el enrutamiento al `HeroDetailComponent`.

### Agregar una ruta _detalle del héroe_

Una URL como `~/detail/11` sería una buena URL para navegar a la vista *Hero Detail* del héroe cuyo `id` es `11`.

Abre `AppRoutingModule` e importa `HeroDetailComponent`.

<code-example path="toh-pt5/src/app/app-routing.module.ts" region="import-herodetail" header="src/app/app-routing.module.ts (import HeroDetailComponent)">
</code-example>

Luego, agrega una ruta _parametrizada_ al arreglo de `rutas` que coincida con el patrón de ruta de la vista _detalle del héroe_.

<code-example path="toh-pt5/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts" region="detail-route">
</code-example>

Los dos puntos (:) en el `path` indican que `: id` es un marcador de posición para un `id` de héroe específico.

En este punto, todas las rutas de aplicación están en su lugar.

<code-example path="toh-pt5/src/app/app-routing.module.ts" region="routes" header="src/app/app-routing.module.ts (all routes)">
</code-example>

### Enlaces de héroe de `DashboardComponent`

Los enlaces de héroe `DashboardComponent` no hacen nada en este momento.

Ahora que el enrutador tiene una ruta a `HeroDetailComponent`,
corrige los enlaces del héroe del dashboard para navegar a través de la ruta _parametrizada_ del dashboard.

<code-example
  path="toh-pt5/src/app/dashboard/dashboard.component.html"
  region="click"
  header="src/app/dashboard/dashboard.component.html (hero links)">
</code-example>

Estás usando el [enlace de interpolación](guide/interpolation) Angular dentro del repetidor `*ngFor`
para insertar el `hero.id` de la iteración actual en cada
[`enlace del enrutador`](#routerlink).

{@a heroes-component-links}
### Enlaces de héroe de `HeroesComponent`

Los elementos de héroe en el `HeroesComponent` son elementos `<li>` cuyos eventos de clic
están vinculados al método `onSelect()` del componente.

<code-example path="toh-pt4/src/app/heroes/heroes.component.html" region="list" header="src/app/heroes/heroes.component.html (list with onSelect)">
</code-example>

Quita el `<li>` de nuevo a su `*ngFor`,
envuelve la insignia y el nombre en un elemento de anclaje (`<a>`),
y agrega un atributo `routerLink` al ancla que
es el mismo que en la plantilla del panel

<code-example path="toh-pt5/src/app/heroes/heroes.component.html" region="list" header="src/app/heroes/heroes.component.html (list with links)">
</code-example>

Tendrás que arreglar la hoja de estilo privada (`heroes.component.css`) para hacer
que la lista tenga el mismo aspecto que antes.
Los estilos revisados se encuentran en la [revisión final del código](#heroescomponent) al final de esta guía.

#### Eliminar código muerto (opcional)

Si bien la clase `HeroesComponent` todavía funciona,
el método `onSelect()` y la propiedad `selectedHero` ya no se utilizan.

Es agradable poner en orden y te lo agradecerás más tarde.
Aquí está la clase después de podar el código muerto.

<code-example path="toh-pt5/src/app/heroes/heroes.component.ts" region="class" header="src/app/heroes/heroes.component.ts (cleaned up)">
</code-example>

## `HeroDetailComponent` enrutable

Anteriormente, el padre `HeroesComponent` configuraba la propiedad `HeroDetailComponent.hero` y el `HeroDetailComponent` mostraba el héroe.

`HeroesComponent` ya no hace eso.
Ahora el enrutador crea el `HeroDetailComponent` en respuesta a una URL como `~/detail/11`.

El `HeroDetailComponent` necesita una nueva forma de obtener el héroe a mostrar.
Esta sección explica lo siguiente:

* Obtener la ruta que lo creó
* Extraer el `id` de la ruta
* Adquirir el héroe con ese "id" del servidor a través de "HeroService"

Agrega las siguientes importaciones:

<code-example path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" region="added-imports" header="src/app/hero-detail/hero-detail.component.ts">
</code-example>

{@a hero-detail-ctor}

Inyecta los servicios `ActivatedRoute`, `HeroService` y `Location`
en el constructor, guardando sus valores en campos privados:

<code-example path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" header="src/app/hero-detail/hero-detail.component.ts" region="ctor">
</code-example>

El [`ActivatedRoute`](api/router/ActivatedRoute) contiene información sobre la ruta a esta instancia del `HeroDetailComponent`.
Este componente está interesado en los parámetros de la ruta extraídos de la URL.
El parámetro "id" es el `id` del héroe que se mostrará.

El [`HeroService`](tutorial/toh-pt4) obtiene los datos del héroe del servidor remoto
y este componente lo usará para mostrar el héroe.

La [`ubicación`](api/common/Location) es un servicio Angular para interactuar con el navegador.
Lo usarás [más tarde](#goback) para volver a la vista que navegó aquí.

### Extrae el parámetro de ruta `id`

En el `ngOnInit()` [método del ciclo de vida](guide/lifecycle-hooks#oninit)
llama a `getHero()` y defínelo de la siguiente manera.

<code-example path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" header="src/app/hero-detail/hero-detail.component.ts" region="ngOnInit">
</code-example>

`Route.snapshot` es una imagen estática de la información de la ruta poco después de que se creó el componente.

El `paramMap` es un diccionario de valores de parámetros de ruta extraídos de la URL.
La clave `"id"` devuelve el `id` del héroe a buscar.

Los parámetros de ruta son siempre cadenas.
El operador JavaScript (+) convierte la cadena en un número,
que es lo que debería ser un "id" de héroe.

El navegador se actualiza y la aplicación se bloquea con un error del compilador.
`HeroService` no tiene un método `getHero()`.
Agrégalo ahora.

### Agregar `HeroService.getHero()`

Abre `HeroService` y agrega el siguiente método `getHero()` con el `id` después del método `getHeroes()`:

<code-example path="toh-pt5/src/app/hero.service.ts" region="getHero" header="src/app/hero.service.ts (getHero)">
</code-example>

<div class="alert is-important">

Ten en cuenta las comillas invertidas (&#96;) que definen un JavaScript
[_plantilla literal_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) para incrustar el `id`.

</div>

Como [`getHeroes()`](tutorial/toh-pt4#observable-heroservice),
 `getHero()` tiene una firma asincrónica.
Devuelve un _mock hero_ como un `Observable`, usando la función RxJS `of()`.

Podrás volver a implementar `getHero()` como una solicitud real de `Http`
sin tener que cambiar el `HeroDetailComponent` que lo llama.

#### Pruébalo

El navegador se actualiza y la aplicación vuelve a funcionar.
Puedes hacer clic en un héroe en el dashboard o en la lista de héroes y navegar hasta la vista de detalles de ese héroe.

Si pegas `localhost:4200/detail/11` en la barra de direcciones del navegador,
el enrutador navega a la vista detallada del héroe con `id: 11`," Dr Nice ".

{@a goback}

### Encuentra el camino de regreso

Al hacer clic en el botón Atrás del navegador,
puedes volver a la lista de héroes o la vista del panel,
dependiendo de cuál te envió a la vista detallada.

Sería bueno tener un botón en la vista `HeroDetail` que pueda hacer eso.

Agrega un botón *volver* en la parte inferior de la plantilla del componente y vincúlalo
al método `goBack()` del componente.

<code-example path="toh-pt5/src/app/hero-detail/hero-detail.component.html" region="back-button" header="src/app/hero-detail/hero-detail.component.html (back button)">
</code-example>

Agrega un método `goBack()` a la clase de componente que navega hacia atrás un paso
en la pila de historial del navegador
usando el servicio `Location` que [inyectaste previamente](#hero-detail-ctor).

<code-example path="toh-pt5/src/app/hero-detail/hero-detail.component.ts" region="goBack" header="src/app/hero-detail/hero-detail.component.ts (goBack)">

</code-example>

Actualiza el navegador y comienza a hacer clic.
Los usuarios pueden navegar por la aplicación, desde el panel hasta los detalles del héroe y viceversa,
de la lista de héroes al mini detalle a los detalles del héroe y de regreso a los héroes nuevamente.

## Revisión final del código

Aquí están los archivos de código discutidos en esta página.

{@a approutingmodule}
{@a appmodule}
#### `AppRoutingModule`, `AppModule`, and `HeroService`

<code-tabs>
  <code-pane
    header="src/app/app-routing.module.ts"
    path="toh-pt5/src/app/app-routing.module.ts">
  </code-pane>
  <code-pane
    header="src/app/app.module.ts"
    path="toh-pt5/src/app/app.module.ts">
  </code-pane>
  <code-pane
    header="src/app/hero.service.ts"
    path="toh-pt5/src/app/hero.service.ts">
  </code-pane>
</code-tabs>

{@a appcomponent}
#### `AppComponent`

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    path="toh-pt5/src/app/app.component.html">
  </code-pane>

  <code-pane
    header="src/app/app.component.css"
    path="toh-pt5/src/app/app.component.css">
  </code-pane>
</code-tabs>

{@a dashboardcomponent}
#### `DashboardComponent`

<code-tabs>
  <code-pane
    header="src/app/dashboard/dashboard.component.html" path="toh-pt5/src/app/dashboard/dashboard.component.html">
  </code-pane>

  <code-pane
    header="src/app/dashboard/dashboard.component.ts" path="toh-pt5/src/app/dashboard/dashboard.component.ts">
  </code-pane>

  <code-pane
    header="src/app/dashboard/dashboard.component.css" path="toh-pt5/src/app/dashboard/dashboard.component.css">
  </code-pane>
</code-tabs>

{@a heroescomponent}
#### `HeroesComponent`

<code-tabs>
  <code-pane
    header="src/app/heroes/heroes.component.html" path="toh-pt5/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane
    header="src/app/heroes/heroes.component.ts"
    path="toh-pt5/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane
    header="src/app/heroes/heroes.component.css"
    path="toh-pt5/src/app/heroes/heroes.component.css">
  </code-pane>
</code-tabs>

{@a herodetailcomponent}
#### `HeroDetailComponent`

<code-tabs>
  <code-pane
    header="src/app/hero-detail/hero-detail.component.html" path="toh-pt5/src/app/hero-detail/hero-detail.component.html">
  </code-pane>

  <code-pane
    header="src/app/hero-detail/hero-detail.component.ts" path="toh-pt5/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>

  <code-pane
    header="src/app/hero-detail/hero-detail.component.css" path="toh-pt5/src/app/hero-detail/hero-detail.component.css">
  </code-pane>
</code-tabs>

## Resumen

* Agregaste el enrutador Angular para navegar entre diferentes componentes.
* Convertiste el `AppComponent` en un caparazón de navegación con enlaces `<a>`y un `<router-outlet>`.
* Configuraste el enrutador en un `AppRoutingModule`
* Definiste rutas simples, una ruta de redireccionamiento y una ruta parametrizada.
* Usaste la directiva `routerLink` en elementos de anclaje.
* Refactorizaste una vista maestra/detallada estrechamente acoplada en una vista de detalle enrutada.
* Usaste parámetros de enlace del enrutador para navegar a la vista detallada de un héroe seleccionado por el usuario.
* Compartiste el "HeroService" entre varios componentes.
