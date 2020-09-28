# Obtener datos desde un servidor

En este tutorial, agregará las siguientes características de persistencia de datos con la ayuda de
Angular `HttpClient`.

* El `HeroService` obtiene datos del héroe con solicitudes HTTP.
* Los usuarios pueden agregar, editar y eliminar héroes y guardar estos cambios a través de HTTP.
* Los usuarios pueden buscar héroes por nombre.

<div class="alert is-helpful">

  Para ver la aplicación de ejemplo que describe esta página, consulte el<live-example></live-example>.

</div>

## Habilitar servicios HTTP

`HttpClient` es el mecanismo de Angular para comunicarse con un servidor remoto a través de HTTP.

Haga que `HttpClient` esté disponible en todas partes de la aplicación en dos pasos. Primero, agréguelo a la raíz `AppModule` importándolo:

<code-example path="toh-pt6/src/app/app.module.ts" region="import-http-client" header="src/app/app.module.ts (HttpClientModule import)">
</code-example>

A continuación, aún en el `AppModule`, agregue` HttpClient` a el arreglo  `imports`:

<code-example path="toh-pt6/src/app/app.module.ts" region="import-httpclientmodule" header="src/app/app.module.ts (imports array excerpt)">
</code-example>


## Simular un servidor de datos

Este ejemplo de tutorial imita la comunicación con un servidor de datos remoto mediante el uso de el modulo 
[API web en memoria](https://github.com/angular/in-memory-web-api "API web en memoria").

Después de instalar el módulo, la aplicación realizará solicitudes y recibirá respuestas del `HttpClient`
sin saber que la *API web en memoria* está interceptando esas solicitudes,
aplicándolos a un almacén de datos en memoria y devolviendo respuestas simuladas.

Al utilizar la API web en memoria, no tendrá que configurar un servidor para obtener información sobre `HttpClient`.

<div class="alert is-important">

**Importante:** el módulo API web en memoria no tiene nada que ver con HTTP en Angular.

Si solo está leyendo este tutorial para aprender sobre `HttpClient`, puede [omitir](#import-heroes) este paso.
Si está codificando junto con este tutorial, quédese aquí y agregue la API web en memoria ahora.

</div>

Instale el paquete de API web en memoria desde npm con el siguiente comando:

<code-example language="sh" class="code-shell">
  npm install angular-in-memory-web-api --save
</code-example>

En el `AppModule`, importe el `HttpClientInMemoryWebApiModule` y la clase `InMemoryDataService`,
que crearás en un momento.

<code-example path="toh-pt6/src/app/app.module.ts" region="import-in-mem-stuff" header="src/app/app.module.ts (In-memory Web API imports)">
</code-example>

Después del `HttpClientModule`, agregue el `HttpClientInMemoryWebApiModule`
a el arreglo de `AppModule` justo en `imports` y configúrelo con el `InMemoryDataService`.

<code-example path="toh-pt6/src/app/app.module.ts" header="src/app/app.module.ts (imports array excerpt)" region="in-mem-web-api-imports">
</code-example>

El método de configuración `forRoot()` toma una clase `InMemoryDataService`
eso prepara la base de datos en memoria.

Genere la clase `src/app/in-memory-data.service.ts` con el siguiente comando:

<code-example language="sh" class="code-shell">
  ng generate service InMemoryData
</code-example>

Reemplace el contenido predeterminado de `in-memory-data.service.ts` con lo siguiente:

<code-example path="toh-pt6/src/app/in-memory-data.service.ts" region="init" header="src/app/in-memory-data.service.ts"></code-example>

El archivo `in-memory-data.service.ts` asumirá la función de `mock-heroes.ts`.
Sin embargo, no elimine `mock-heroes.ts` todavía, ya que aún lo necesita para algunos pasos más de este tutorial.

Cuando el servidor esté listo, desconectará la API web en memoria y las solicitudes de la aplicación se enviarán al servidor.


{@a import-heroes}
## Heroes y HTTP

En el `HeroService`, importe` HttpClient` y `HttpHeaders`:

<code-example path="toh-pt6/src/app/hero.service.ts" region="import-httpclient" header="src/app/hero.service.ts (import HTTP symbols)">
</code-example>

Aún en el `HeroService`, inyecte `HttpClient` en el constructor en una propiedad privada llamada `http`.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="ctor" >
</code-example>

Observe que sigue inyectando el `MessageService` pero como lo llamará con tanta frecuencia, envuélvalo en un método privado `log()`:

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="log" >
</code-example>

Defina el `heroesUrl` del formulario `:base/:collectionName` con la dirección del recurso heroes en el servidor.
  Aquí `base` es el recurso al que se hacen las solicitudes,
  y `collectionName` es el objeto de datos de héroes en `in-memory-data-service.ts`.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="heroesUrl" >
</code-example>

### Consigue héroes con `HttpClient`

El actual `HeroService.getHeroes()`
usa la función RxJS `of()` para devolver una serie de héroes simulados
como un `Observable<Hero[]>`.

<code-example path="toh-pt4/src/app/hero.service.ts" region="getHeroes-1" header="src/app/hero.service.ts (getHeroes with RxJs 'of()')">
</code-example>

Convierta ese método para usar `HttpClient` de la siguiente manera:

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="getHeroes-1">
</code-example>

Actualiza el navegador. Los datos del héroe deben cargarse correctamente desde el
servidor simulado.

Ha cambiado `of()` por `http.get()` y la aplicación sigue funcionando sin ningún otro cambio
porque ambas funciones devuelven un `Observable <Hero[]>`.

### Los métodos `HttpClient` devuelven un valor

Todos los métodos `HttpClient` devuelven un RxJS `Observable` de algo.

HTTP es un protocolo de solicitud/respuesta.
Realiza una solicitud, devuelve una sola respuesta.

En general, un observable _puede_ devolver múltiples valores a lo largo del tiempo.
Un observable de `HttpClient` siempre emite un único valor y luego se completa, para nunca volver a emitir.

Esta llamada particular a `HttpClient.get()` devuelve un `Observable<Hero[]>`; es decir, "un observable de un arreglo de héroes". En la práctica, solo devolverá un único conjunto de héroes.

### `HttpClient.get()` devuelve datos de respuesta

`HttpClient.get()` devuelve el cuerpo de la respuesta como un objeto JSON sin tipo de forma predeterminada.
Al aplicar el especificador de tipo opcional, `<Hero[]>`, se agregan capacidades de TypeScript, que reducen los errores durante el tiempo de compilación.

La API de datos del servidor determina la forma de los datos JSON.
La API de datos _Tour of Heroes_ devuelve los datos del héroe como una matriz.

<div class="alert is-helpful">

Otras API pueden enterrar los datos que desea dentro de un objeto.
Puede que tenga que desenterrar esos datos procesando el resultado `Observable`
con el operador RxJS `map()`.

Aunque no se trata aquí, hay un ejemplo de `map()` en `getHeroNo404()`
método incluido en el código fuente de muestra.
</div>

### Manejo de errores

Las cosas salen mal, especialmente cuando obtiene datos de un servidor remoto.
El método `HeroService.getHeroes()` debería detectar errores y hacer algo apropiado.

Para detectar errores, **"filtra" el resultado observable** desde `http.get()` a través de un operador RxJS `catchError()`.

Importe el símbolo `catchError` desde `rxjs/operadores`, junto con algunos otros operadores que necesitará más adelante.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="import-rxjs-operators">
</code-example>

Ahora extienda el resultado observable con el método `pipe()` y
darle un operador `catchError()`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHeroes-2" header="src/app/hero.service.ts">
</code-example>

El operador `catchError()` intercepta un **`Observable` que falló**.
Pasa el error a un controlador de errores que puede hacer lo que quiera con el error.

El siguiente método `handleError()` informa el error y luego devuelve un
resultado inocuo para que la aplicación siga funcionando.

#### `handleError`

El siguiente `handleError()` será compartido por muchos métodos `HeroService`
así que está generalizado para satisfacer sus diferentes necesidades.

En lugar de manejar el error directamente, devuelve una función de controlador de errores a `catchError` que
se configuró con el nombre de la operación que falló y un valor de retorno seguro.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts" region="handleError">
</code-example>

Después de informar el error a la consola, el controlador construye
un mensaje fácil de usar y devuelve un valor seguro a la aplicación para que la aplicación pueda seguir funcionando.

Como cada método de servicio devuelve un tipo diferente de resultado 'Observable',
`handleError()` toma un parámetro de tipo para que pueda devolver el valor seguro como el tipo que la aplicación espera.

### Tap en el Observable

Los métodos `HeroService` **aprovecharán** el flujo de valores observables
y envíe un mensaje, a través del método `log()`, al área de mensajes en la parte inferior de la página.

Lo harán con el operador RxJS `tap()`,
que mira los valores observables, hace algo con esos valores,
y los pasa
La devolución de llamada `tap()` no toca los valores en sí mismos.

Aquí está la versión final de `getHeroes()` con el `tap()` que registra la operación.

<code-example path="toh-pt6/src/app/hero.service.ts" header="src/app/hero.service.ts"  region="getHeroes" >
</code-example>

### Obtener héroe por id

La mayoría de las API web admiten una solicitud _get by id_ en la forma `: baseURL /: id`.

Aquí, la _base URL_ es el `heroesURL` definido en la  [Heroes y HTTP](tutorial/toh-pt6#import-heroes) sección (`api/heroes`) y _id_ es
El número del héroe que quieres recuperar. Por ejemplo, `api/heroes/11`.

Actualice el método `HeroService` `getHero()` con lo siguiente para hacer esa solicitud:

<code-example path="toh-pt6/src/app/hero.service.ts" region="getHero" header="src/app/hero.service.ts"></code-example>

Hay tres diferencias significativas de `getHeroes()`:

* `getHero()` construye una URL de solicitud con la identificación del héroe deseado.
* El servidor debe responder con un solo héroe en lugar de una serie de héroes.
* `getHero()` devuelve un `Observable<Hero>` ("_un observable de objetos Hero_")
  en lugar de un observable de _arreglos_ de héroes.

## Actualizar héroes

Edite el nombre de un héroe en la vista de detalles del héroe.
A medida que escribe, el nombre del héroe actualiza el encabezado en la parte superior de la página.
Pero cuando hace clic en el "botón volver", los cambios se pierden.

Si desea que los cambios persistan, debe volver a escribirlos en
el servidor.

Al final de la plantilla de detalles del héroe, agregue un botón de guardar con un evento de "clic"
enlace que invoca un nuevo método de componente llamado `save()`.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.html" region="save" header="src/app/hero-detail/hero-detail.component.html (save)"></code-example>

En la clase de componente `HeroDetail`, agregue el siguiente método `save()`, que persiste los cambios de nombre de héroe usando el servicio de héroe
`updateHero()` y luego navega de regreso a la vista anterior.

<code-example path="toh-pt6/src/app/hero-detail/hero-detail.component.ts" region="save" header="src/app/hero-detail/hero-detail.component.ts (save)"></code-example>

#### Agregar `HeroService.updateHero()`

La estructura general del método `updateHero()` es similar a la de
`getHeroes()`, pero usa `http.put()` para persistir el héroe cambiado
en el servidor Agregue lo siguiente al `HeroService`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="updateHero" header="src/app/hero.service.ts (update)">
</code-example>

El método `HttpClient.put()` toma tres parámetros:
* la URL
* los datos para actualizar (el héroe modificado en este caso)
* opciones

La URL no se modifica. La API web de héroes sabe qué héroe actualizar al mirar el "id" del héroe.

La API web de héroes espera un encabezado especial en las solicitudes de guardado HTTP.
Ese encabezado está en la constante `httpOptions` definida en el `HeroService`. Agregue lo siguiente a la clase `HeroService`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="http-options" header="src/app/hero.service.ts">
</code-example>

Actualiza el navegador, cambia el nombre de un héroe y guarda tu cambio. El `save()`
El método en `HeroDetailComponent` navega a la vista anterior.
El héroe ahora aparece en la lista con el nombre cambiado.

## Agrega un nuevo héroe

Para agregar un héroe, esta aplicación solo necesita el nombre del héroe. Puede utilizar un `<input>`
elemento emparejado con un botón Agregar.

Inserte lo siguiente en la plantilla `HeroesComponent`, justo después
El encabezado:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="add" header="src/app/heroes/heroes.component.html (add)"></code-example>

En respuesta a un evento de clic, llame al controlador de clic del componente, `add()`, y luego
borre el campo de entrada para que esté listo para otro nombre. Agregue lo siguiente al
Clase `Componente de héroes`:

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="add" header="src/app/heroes/heroes.component.ts (add)"></code-example>

Cuando el nombre de pila no está en blanco, el controlador crea un objeto similar a un "Héroe"
del nombre (sólo falta el `id`) y lo pasa al método `addHero()` del servicio.

Cuando `addHero()` se guarda correctamente, la devolución de llamada `subscribe()`
recibe el nuevo héroe y lo empuja a la lista de "héroes" para mostrarlo.

Agregue el siguiente método `addHero()` a la clase `HeroService`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="addHero" header="src/app/hero.service.ts (addHero)"></code-example>

`addHero()` difiere de `updateHero()` en dos formas:

* Llama a `HttpClient.post()` en lugar de a `put()`.
* Espera que el servidor genere una identificación para el nuevo héroe,
que devuelve en el `Observable<Hero>` a la persona que llama.

Actualiza el navegador y agrega algunos héroes.

## Eliminar un héroe

Cada héroe de la lista de héroes debe tener un botón de eliminación.

Agregue el siguiente elemento de botón a la plantilla `HeroesComponent`, después del héroe
nombre en el elemento repetido `<li>`.

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" header="src/app/heroes/heroes.component.html" region="delete"></code-example>

El HTML de la lista de héroes debería verse así:

<code-example path="toh-pt6/src/app/heroes/heroes.component.html" region="list" header="src/app/heroes/heroes.component.html (list of heroes)"></code-example>

Para colocar el botón de eliminar en el extremo derecho de la entrada del héroe,
agregue algo de CSS al `heroes.component.css`. Encontrarás ese CSS
en el [código de revisión final](#heroescomponent) a continuación.

Agregue el controlador `delete()` a la clase del componente.

<code-example path="toh-pt6/src/app/heroes/heroes.component.ts" region="delete" header="src/app/heroes/heroes.component.ts (delete)"></code-example>

Aunque el componente delega la eliminación de héroes al `HeroService`,
sigue siendo responsable de actualizar su propia lista de héroes.
El método `delete()` del componente elimina inmediatamente el _hero-to-delete_ de esa lista,
anticipando que el `HeroService` tendrá éxito en el servidor.

Realmente no hay nada que ver el componente con el "Observable" devuelto por
`heroService.delete()` **pero debe suscribirse de todos modos**.

<div class="alert is-important">

Si se olvida de `subscribe()`, el servicio no enviará la solicitud de eliminación al servidor.
   Como regla general, un "Observable" _no hace nada_ hasta que algo se suscribe.

   Confirme esto por sí mismo eliminando temporalmente el `subscribe()`,
   haciendo clic en "Panel de control", luego en "Héroes".
   Verás la lista completa de héroes nuevamente.

</div>

A continuación, agregue un método `deleteHero()` a `HeroService` como este.

<code-example path="toh-pt6/src/app/hero.service.ts" region="deleteHero" header="src/app/hero.service.ts (delete)"></code-example>

Tenga en cuenta los siguientes puntos clave:

* `deleteHero()` llama a `HttpClient.delete()`.
* La URL es la URL del recurso de héroes más el "id" del héroe a eliminar.
* No envías datos como lo hiciste con `put()` y `post()`.
* Aún envías las `httpOptions`.

Actualice el navegador y pruebe la nueva función de eliminación.

## Buscar por nombre

En este último ejercicio, aprenderá a encadenar operadores "observables"
para que pueda minimizar la cantidad de solicitudes HTTP similares
y consumir ancho de banda de la red de forma económica.

Agregará una función de búsqueda de héroes al Tablero.
A medida que el usuario escribe un nombre en un cuadro de búsqueda,
harás solicitudes HTTP repetidas para héroes filtrados por ese nombre.
Su objetivo es emitir solo tantas solicitudes como sea necesario.

#### `HeroService.searchHeroes()`

Comience agregando un método `searchHeroes()` al `HeroService`.

<code-example path="toh-pt6/src/app/hero.service.ts" region="searchHeroes" header="src/app/hero.service.ts">
</code-example>

El método regresa inmediatamente con una matriz vacía si no hay un término de búsqueda.
El resto se parece mucho a "getHeroes()", siendo la única diferencia significativa
la URL, que incluye una cadena de consulta con el término de búsqueda.

### Agregar búsqueda al panel

Abra la plantilla `DashboardComponent` y
agregue el elemento de búsqueda de héroe, `<app-hero-search>`, al final del marcado.

<code-example path="toh-pt6/src/app/dashboard/dashboard.component.html" header="src/app/dashboard/dashboard.component.html"></code-example>

Esta plantilla se parece mucho al repetidor `*ngFor` en la plantilla `HeroesComponent`.

Para que esto funcione, el siguiente paso es agregar un componente con un selector que coincida con `<app-hero-search>`.


### Crear `HeroSearchComponent`

Cree un "HeroSearchComponent" con El Cli.

<code-example language="sh" class="code-shell">
  ng generate component hero-search
</code-example>

El Cli genera los tres archivos de `HeroSearchComponent` y agrega el componente a las declaraciones en `AppModule`.

Reemplace la plantilla `HeroSearchComponent` generada con un `<input>` y una lista de resultados de búsqueda coincidentes, de la siguiente manera.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html"></code-example>

Agregue estilos CSS privados a `hero-search.component.css`
como se indica en la [revisión final del código](#herosearchcomponent) a continuación.

A medida que el usuario escribe en el cuadro de búsqueda, un enlace de evento de entrada llama al
el método `search()` del componente con el nuevo valor del cuadro de búsqueda.

{@a asyncpipe}

### `AsyncPipe`

El `*ngFor` repite los objetos hero. Note que el `*ngFor` itera sobre una lista llamada `heroes$`, no sobre `heroes`. El `$` es una convención que indica que `heroes$` es un `Observable`, no un arreglo.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html" region="async"></code-example>

Como `*ngFor` no puede hacer nada con un `Observable`, use el
carácter de filtración (`|`) seguido de `async`. Esto identifica el "AsyncPipe" de Angular y se suscribe automáticamente a un "Observable" para que no tenga que
hacerlo en la clase de componente.

### Editar la clase `HeroSearchComponent`

Reemplace la clase generada `HeroSearchComponent` y los metadatos de la siguiente manera.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts"></code-example>

Observe la declaración de `heroes$` como un `Observable`:
<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts" region="heroes-stream">
</code-example>

Lo configurará en [`ngOnInit()`](#search-pipe).
Antes de hacerlo, concéntrese en la definición de `searchTerms`.

### El subject  RxJS `searchTerms`

La propiedad `searchTerms` es un `Subject` de RxJS.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts" region="searchTerms"></code-example>

Un `Subject` es tanto una fuente de valores observables como un `Observable` en sí mismo.
Puede suscribirse a un `Subject` como lo haría con cualquier `Observable`.

También puede insertar valores en ese `Observable` llamando a su método `next(value)`
como lo hace el método `search()`.

El evento vinculado al evento `input` del cuadro de texto llama al método `search()`.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.html" header="src/app/hero-search/hero-search.component.html" region="input"></code-example>

Every time the user types in the textbox, the binding calls `search()` with the textbox value, a "search term".
The `searchTerms` becomes an `Observable` emitting a steady stream of search terms.

{@a search-pipe}

### Encadenamiento de operadores RxJS

Pasar un nuevo término de búsqueda directamente a `searchHeroes()` después de cada pulsación de tecla del usuario crearía una cantidad excesiva de solicitudes HTTP,
gravando los recursos del servidor y quemando a través de planes de datos.

En cambio, el método `ngOnInit()` filtra los `searchTerms` observables a través de una secuencia de operadores RxJS que reducen el número de llamadas  `searchHeroes()`,
en última instancia, devuelve un observable de resultados de búsqueda de héroes oportunos (cada uno un `Héroe[]`).

Aquí hay un vistazo más de cerca al código.

<code-example path="toh-pt6/src/app/hero-search/hero-search.component.ts" header="src/app/hero-search/hero-search.component.ts" region="search">
</code-example>

Cada operador funciona de la siguiente manera:

* `debounceTime(300)` espera hasta que el flujo de nuevos eventos de cadena se detenga durante 300 milisegundos
antes de pasar por la última cuerda. Nunca hará solicitudes con más frecuencia que 300 ms.

* `distinctUntilChanged()` asegura que una solicitud se envíe solo si el texto del filtro cambió.

* `switchMap()` llama al servicio de búsqueda para cada término de búsqueda que pasa por `debounce()` y `distinctUntilChanged()`.
Cancela y descarta los observables de búsqueda anteriores, devolviendo solo el último servicio de búsqueda observable.


<div class="alert is-helpful">

  Con el [operador de switchMap](http://www.learnrxjs.io/operators/transformation/switchmap.html),
   cada evento clave que califique puede activar una llamada al método `HttpClient.get()`.
   Incluso con una pausa de 300 ms entre solicitudes, podría tener varias solicitudes HTTP en vuelo
   y no pueden regresar en el orden enviado.

   `switchMap()` conserva el orden de solicitud original mientras devuelve solo lo observable de la llamada al método HTTP más reciente.
   Los resultados de llamadas anteriores se cancelan y descartan.

   Tenga en cuenta que cancelar un `searchHeroes()` anterior observable
   en realidad no aborta una solicitud HTTP pendiente.
   Los resultados no deseados simplemente se descartan antes de que lleguen al código de su aplicación.

</div>

Recuerde que el componente _class_ no se suscribe a los `heroes$` _observable_.
Ese es el trabajo de [`Filtro asíncrono (asynpipe)`](#asyncpipe) en la plantilla.

#### Intentalo

Ejecute la aplicación nuevamente. En el *Tablero*, ingrese texto en el cuadro de búsqueda.
Si ingresas personajes que coinciden con cualquier nombre de héroe existente, verás algo como esto.

<div class="lightbox">
  <img src='generated/images/guide/toh/toh-hero-search.png' alt="Hero Search Component">
</div>

## Revisión final del código

Aquí están los archivos de código discutidos en esta página (todos en la carpeta `src/app/`).

{@a heroservice}
{@a inmemorydataservice}
{@a appmodule}
#### `HeroService`, `InMemoryDataService`, `AppModule`

<code-tabs>
  <code-pane
    header="hero.service.ts"
    path="toh-pt6/src/app/hero.service.ts">
  </code-pane>
  <code-pane
    header="in-memory-data.service.ts"
    path="toh-pt6/src/app/in-memory-data.service.ts">
  </code-pane>
  <code-pane
    header="app.module.ts"
    path="toh-pt6/src/app/app.module.ts">
  </code-pane>
</code-tabs>

{@a heroescomponent}
#### `Componente de heroes`

<code-tabs>
  <code-pane
    header="heroes/heroes.component.html"
    path="toh-pt6/src/app/heroes/heroes.component.html">
  </code-pane>
  <code-pane
    header="heroes/heroes.component.ts"
    path="toh-pt6/src/app/heroes/heroes.component.ts">
  </code-pane>
  <code-pane
    header="heroes/heroes.component.css"
    path="toh-pt6/src/app/heroes/heroes.component.css">
  </code-pane>
</code-tabs>

{@a herodetailcomponent}
#### `Componete de detalles de el heroe`

<code-tabs>
  <code-pane
    header="hero-detail/hero-detail.component.html"
    path="toh-pt6/src/app/hero-detail/hero-detail.component.html">
  </code-pane>
  <code-pane
    header="hero-detail/hero-detail.component.ts"
    path="toh-pt6/src/app/hero-detail/hero-detail.component.ts">
  </code-pane>
</code-tabs>

{@a dashboardcomponent}
#### `Componente de panel(dashboard)`

<code-tabs>
  <code-pane
    header="src/app/dashboard/dashboard.component.html"
    path="toh-pt6/src/app/dashboard/dashboard.component.html">
  </code-pane>
</code-tabs>

{@a herosearchcomponent}
#### `Componente de búsqueda de héroe`

<code-tabs>
  <code-pane
    header="hero-search/hero-search.component.html"
    path="toh-pt6/src/app/hero-search/hero-search.component.html">
  </code-pane>
  <code-pane
    header="hero-search/hero-search.component.ts"
    path="toh-pt6/src/app/hero-search/hero-search.component.ts">
  </code-pane>
  <code-pane
    header="hero-search/hero-search.component.css"
    path="toh-pt6/src/app/hero-search/hero-search.component.css">
  </code-pane>
</code-tabs>

## Resumen

Este es el final de su viaje y ha logrado mucho.

* Agrego las dependencias necesarias para usar HTTP en la aplicación.
* Refactorizó `HeroService` para cargar héroes desde una API web.
* Extendió `HeroService` para admitir los métodos `post()`, `put()` y `delete()`.
* Actualizo los componentes para permitir agregar, editar y eliminar héroes.
* Configuro una API web en memoria.
* Aprendio a usar observables.

Esto concluye el tutorial "Tour de los Heroes".
Estás listo para aprender más sobre el desarrollo Angular en la sección de fundamentos,
comenzando con la guía [Arquitectura](guide/architecture "Architecture") guide.
