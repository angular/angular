# Agregar servicios

El `HeroesComponent` de Tour de los  Heroes actualmente está obteniendo y mostrando datos simulados.

Después de la refactorización en este tutorial, `HeroesComponent` será sencillo y se centrará en apoyar la vista.
También será más fácil realizar pruebas unitarias con un servicio simulado.

<div class="alert is-helpful">

  Para ver la aplicación de ejemplo que describe esta página, consulte el <live-example></live-example>.

</div>

## Por qué servicios

Los componentes no deberían buscar ni guardar datos directamente y, desde luego, no deberían presentar a sabiendas datos simulados.
Deben centrarse en presentar datos y delegar el acceso a los datos a un servicio.

En este tutorial, crearás un `HeroService` que todas las clases de aplicación pueden usar para obtener héroes.
En lugar de crear ese servicio con la [palabra clave `new`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new),
confiará en la [*inyección de dependencia*](guide/dependency-injection) de Angular
para inyectarlo en el constructor `HeroesComponent`.

Los servicios son una excelente manera de compartir información entre clases que no se _conocen entre sí_.
Creará un `MessageService` y lo inyectará en dos lugares.

1. Inyecte en HeroService, que utiliza el servicio para enviar un mensaje.
2. Inyecte en MessagesComponent, que muestra ese mensaje, y también muestra la ID
cuando el usuario hace clic en un héroe.


## Crear el `HeroService`

Usando la CLI Angular, cree un servicio llamado `hero`.

<code-example language="sh" class="code-shell">
  ng generate service hero
</code-example>

Este comando generará un archivo base `HeroService` en `src/app/hero.service.ts` de la siguiente manera:

<code-example path="toh-pt4/src/app/hero.service.1.ts" region="new"
 header="src/app/hero.service.ts (new service)"></code-example>


### Servicio `@Injectable()`

Observe que el símbolo Inyectable de Angular se importa en el archivo generado, anotando la clase como decorador `@Injectable()`.
Esto marca a la clase como participante en el sistema de inyección de dependencia. La clase `HeroService` proporcionará servicios inyectables y puede tener dependencias.
Aún no hay dependencias, [estará pronto](#inject-message-service).

El decorador `@Injectable()` acepta el objeto de metadatos de un servicio de la misma manera que el decorador `@Component()` para las clases de componentes.

### Obtener datos del héroe


El `HeroService` podría obtener datos de héroes desde cualquier lugar&mdash; un servicio web, almacenamiento local o una fuente de datos simulada.

 
Eliminar el acceso a datos de los componentes significa que puede cambiar de opinión acerca de la implementación en cualquier momento, sin tocar ningún componente.
No saben cómo funciona el servicio.

La implementación en este tutorial continuará entregando _héroes simulados_.

Importar `Hero` and `HEROES`.

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="import-heroes">
</code-example>

Agregue el método `getHeroes` y devuelva los _héroes simulados_.

<code-example path="toh-pt4/src/app/hero.service.1.ts" header="src/app/hero.service.ts" region="getHeroes">
</code-example>

{@a provide}
## Proporcionar el `HeroService`

Debe poner el `HeroService` a disposición del sistema de inyección de dependencias.
antes de que Angular pueda inyectarlo en el 'Componente de héroes' al registrar un proveedor. Un proveedor es algo que puede crear o prestar un servicio; en este caso, crea una instancia de la clase `HeroService` para proporcionar el servicio.

Para asegurarse de que el `HeroService` pueda proporcionar este servicio, regístrelo
con el _inyector_, que es el objeto responsable de elegir
e inyectando el proveedor donde la aplicación lo requiere.

Por defecto, el comando Angular CLI `ng generate service` registra a un proveedor con el inyector raíz para su servicio al incluir los metadatos del proveedor, que se proporcionan en el decorador `@Injectable() `.

```
@Injectable({
  providedIn: 'root',
})
```

Cuando proporciona el servicio en el nivel raíz, Angular crea una única instancia compartida de `HeroService` e inyecta en cualquier clase que lo solicite.
El registro del proveedor en los metadatos `@Injectable` también le permite a Angular optimizar una aplicación eliminando el servicio si resulta que no se usará después de todo.

<div class="alert is-helpful">

Para obtener más información sobre los proveedores, consulte la [Sección de proveedores](guide/providers).
Para obtener más información sobre los inyectores, consulte la [Guía de inyección de dependencia](guide/dependency-injection).

</div>
El `HeroService` ahora está listo para conectarse al `HeroesComponent`.

<div class="alert is-important">

Este es un ejemplo de código provisional que le permitirá proporcionar y usar el `HeroService`. En este punto, el código diferirá del `HeroService` en la [" revisión final del código "](#final-code-review).

</div>

<div class="alert is-helpful">

Si desea obtener más información sobre _proveedores_, consulte [Proveedores](guide/providers).

</div>

## Actualizar `HeroesComponent`

Abra el archivo de clase `HeroesComponent`.

Elimine la importación `HEROES`, porque ya no la necesitará.
Importa el `HeroService` en su lugar.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts (import HeroService)" region="hero-service-import">
</code-example>

Reemplace la definición de la propiedad `heroes` con una simple declaración.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts" region="heroes">
</code-example>

{@a inject}

### Inyectar el `HeroService`

Agregue un parámetro privado `heroService` de tipo `HeroService` al constructor.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" region="ctor">
</code-example>

El parámetro define simultáneamente una propiedad privada `heroService` y la identifica como un sitio de inyección `HeroService`.

Cuando Angular crea un `HeroesComponent`, el sistema [Inyección de dependencia](guide/dependency-injection) establece el parámetro `heroService` en la instancia única de `HeroService`.

### Añadir `getHeroes()`

Crea un método para recuperar a los héroes del servicio

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" region="getHeroes">
</code-example>

{@a oninit}

### Llamarlo en `ngOnInit()`

Si bien podría llamar a `getHeroes()` en el constructor, esa no es la mejor práctica.

Reserve el constructor para una inicialización simple, como conectar los parámetros del constructor a las propiedades.
El constructor no debe _hacer nada_.
Ciertamente no debería llamar a una función que realiza solicitudes HTTP a un servidor remoto como lo haría un servicio de datos _real_.

En su lugar, llame a `getHeroes()` dentro del [*ngOnInit lifecycle hook*](guide/lifecycle-hooks) (gancho del ciclo de vida) y
deje que Angular llame a `ngOnInit()` en el momento apropiado _después_ de construir una instancia de `HeroesComponent`.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts" region="ng-on-init">
</code-example>

### Verlo correr

Después de que el navegador se actualice, la aplicación debería ejecutarse como antes,
mostrando una lista de héroes y una vista detallada de héroe cuando haces clic en el nombre de un héroe.

## Datos observables

El método `HeroService.getHeroes()` tiene una firma sincrónica,
lo que implica que el `HeroService` puede buscar héroes sincrónicamente.
El `HeroesComponent` consume el resultado `getHeroes()`
como si los héroes pudieran ser recuperados sincrónicamente.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" region="get-heroes">
</code-example>

Esto no funcionará en una aplicación real.
Ahora te saldrás con la tuya porque el servicio actualmente devuelve _héroes simulados_.
Pero pronto la aplicación buscará héroes de un servidor remoto,
que es una operación inherentemente _asincrónica_.

El `HeroService` debe esperar a que el servidor responda,
`getHeroes()` no puede regresar inmediatamente con los datos del héroe,
y el navegador no se bloqueará mientras el servicio espere.

`HeroService.getHeroes()` debe tener una firma asíncrona de algún tipo.

En este tutorial, `HeroService.getHeroes()` devolverá un `Observable`
porque eventualmente usará el método angular `HttpClient.get` para buscar a los héroes y [`HttpClient.get()` devuelve un `Observable`](guide/http).

### Observable `HeroService`

`Observable` es una de las clases clave en la [biblioteca RxJS] (http://reactivex.io/rxjs/).

En un [tutorial posterior sobre HTTP](tutorial/toh-pt6), aprenderá que los métodos `HttpClient` de Angular devuelven RxJS `Observable`s.
En este tutorial, simulará obtener datos del servidor con la función RxJS `of()`.

Abra el archivo `HeroService` e importe los símbolos `Observable` y `of` de RxJS.

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts (Observable imports)" region="import-observable">
</code-example>

Reemplace el método `getHeroes()` con lo siguiente:

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="getHeroes-1"></code-example>

`of (HEROES)` devuelve un `Observable <Hero[]>` que emite _un valor único_, el conjunto de héroes simulados.

<div class="l-sub-section">

En el [tutorial HTTP](tutorial/toh-pt6), llamará a `HttpClient.get <Hero[]>()` que también devuelve un `Observable <Hero[]>` que emite _un valor único_, una matriz de héroes del cuerpo de la respuesta HTTP.

</div>

### Suscríbirse en `HeroesComponent`

El método `HeroService.getHeroes` utilizado para devolver un `Hero[]`.
Ahora devuelve un `Observable <Hero[]>`.

Tendrás que ajustarte a esa diferencia en `HeroesComponent`.

Encuentre el método `getHeroes` y reemplácelo con el siguiente código
(Al lado de la versión anterior para comparar)

<code-tabs>

  <code-pane header="heroes.component.ts (Observable)" 
    path="toh-pt4/src/app/heroes/heroes.component.ts" region="getHeroes">
  </code-pane>

  <code-pane header="heroes.component.ts (Original)" 
    path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes">
  </code-pane>

</code-tabs>

`Observable.subscribe()` es la diferencia crítica.

La versión anterior asigna una variedad de héroes a la propiedad 'heroes' del componente.
La asignación ocurre _sincrónicamente_, como si el servidor pudiera devolver héroes al instante
o el navegador podría congelar la interfaz de usuario mientras esperaba la respuesta del servidor.

Eso _no funcionará_ cuando el `HeroService` realmente está haciendo solicitudes a un servidor remoto.

La nueva versión espera a que el 'Observable' emita una serie de héroes,&mdash;
que podría suceder ahora o varios minutos a partir de ahora.
El método `subscribe()` pasa el arreglo  emitida a la devolución de llamada,
que establece la propiedad 'heroes' del componente.

Este enfoque asincrónico funcionará cuando
el `HeroService` solicite héroes del servidor.

## Mostrar mensajes

Esta sección lo guía a través de lo siguiente:

* agregando un `MessagesComponent` que muestra los mensajes de la aplicación en la parte inferior de la pantalla
* crear un `MessageService` inyectable para toda la aplicación para enviar mensajes que se mostrarán
* inyectando `MessageService` en el `HeroService`
* mostrando un mensaje cuando `HeroService` busca héroes con éxito

### Crear `MessagesComponent`

Use la CLI para crear el `MessagesComponent`.
<code-example language="sh" class="code-shell">
  ng generate component messages
</code-example>


La CLI crea los archivos componentes en la carpeta `src/app/messages` y declara el `MessagesComponent` en `AppModule`.

Modifique la plantilla `AppComponent` para mostrar el `MessagesComponent` generado.

<code-example
  header = "src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
</code-example>

Debería ver el párrafo predeterminado de `MessagesComponent` en la parte inferior de la página.

### Crear el `MessageService`

Use la CLI para crear el `MessageService` en `src/app`.

<code-example language="sh" class="code-shell">
  ng generate service message
</code-example>

Abra `MessageService` y reemplace su contenido con lo siguiente.

<code-example header = "src/app/message.service.ts" path="toh-pt4/src/app/message.service.ts">
</code-example>

El servicio expone su caché de `mensajes` y dos métodos: uno para `agregar()` un mensaje al caché y otro para `borrar()` el caché.

{@a inject-message-service}
### Inyectar en el `HeroService`

En `HeroService`, importe el `MessageService`.


<code-example
  header = "src/app/hero.service.ts (import MessageService)"
  path="toh-pt4/src/app/hero.service.ts" region="import-message-service">
</code-example>

Modifique el constructor con un parámetro que declare una propiedad privada `messageService`.
Angular inyectará el singleton `MessageService` en esa propiedad
cuando crea el `HeroService`.

<code-example
  path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="ctor">
</code-example>

<div class="l-sub-section">

Este es un escenario típico de "*servicio en servicio*":
inyecta el `MessageService` en el `HeroService` que se inyecta en el `HeroesComponent`.

</div>

### Enviar un mensaje desde `HeroService`

Modifique el método `getHeroes()` para enviar un mensaje cuando se busquen los héroes.

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="getHeroes">
</code-example>

### Mostrar el mensaje de `HeroService`

El `MessagesComponent` debería mostrar todos los mensajes,
incluido el mensaje enviado por el `HeroService` cuando busca héroes.

Abra `MessagesComponent` e importe el `MessageService`

<code-example header="src/app/messages/messages.component.ts (import MessageService)" path="toh-pt4/src/app/messages/messages.component.ts" region="import-message-service">
</code-example>

Modifique el constructor con un parámetro que declare una propiedad  `messageService` **publica**.
Angular inyectará el único `MessageService` en esa propiedad
cuando crea el `MessagesComponent`.

<code-example path="toh-pt4/src/app/messages/messages.component.ts" header="src/app/messages/messages.component.ts" region="ctor">
</code-example>

La propiedad `messageService` **debe ser pública** porque la vinculará en la plantilla.

<div class="alert is-important">

Angular solo se une a las propiedades _publicas_ del componente .

</div>

### Enlazar al `MessageService`

Reemplace la plantilla `MessagesComponent` generada por CLI con lo siguiente.
 
<code-example
  header = "src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
</code-example>

Esta plantilla se une directamente al componente `messageService` del componente.

* `*NgIf` solo muestra el área de mensajes si hay mensajes para mostrar.


* Un `*ngFor` presenta la lista de mensajes en elementos repetidos` <div> `.


* Un [enlace de evento](guide/template-syntax) en angular une el evento de clic del botón
a `MessageService.clear ()`.

Los mensajes se verán mejor cuando agregue los estilos CSS privados a `messages.component.css`
como se indica en una de las pestañas ["revisión de código final"](#final-code-review) a continuación.

## Agregar mensajes adicionales al servicio de héroe

El siguiente ejemplo muestra cómo enviar y mostrar un mensaje cada vez que el usuario hace clic en
un héroe, que muestra un historial de las selecciones del usuario. Esto será útil cuando llegues a
siguiente sección sobre [Enrutamiento](tutorial/toh-pt5).

<code-example header="src/app/heroes/heroes.component.ts"
path="toh-pt4/src/app/heroes/heroes.component.ts">
</code-example>

El navegador se actualizará y la página mostrará la lista de héroes.
Actualiza el navegador para ver la lista de héroes y desplázate hacia abajo para ver
mensajes del HeroService. Cada vez que haces clic en un héroe, aparece un nuevo mensaje para grabar
la selección. Use el botón "borrar" para borrar el historial de mensajes.

{@a final-code-review}

## Revisión final del código

Aquí están los archivos de código discutidos en esta página.

<code-tabs>

  <code-pane header="src/app/hero.service.ts" 
  path="toh-pt4/src/app/hero.service.ts">
  </code-pane>

  <code-pane header="src/app/message.service.ts" 
  path="toh-pt4/src/app/message.service.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component.ts"
  path="toh-pt4/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/messages/messages.component.ts"
  path="toh-pt4/src/app/messages/messages.component.ts">
  </code-pane>

  <code-pane header="src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
  </code-pane>

  <code-pane header="src/app/messages/messages.component.css"
  path="toh-pt4/src/app/messages/messages.component.css">
  </code-pane>

  <code-pane header="src/app/app.module.ts"
  path="toh-pt4/src/app/app.module.ts">
  </code-pane>

  <code-pane header="src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
  </code-pane>

</code-tabs>

## Resumen

* Refactorizó el acceso a datos a la clase `HeroService`.
* Registro el `HeroService` como el _proveedor_ de su servicio en el nivel raíz para que pueda inyectarse en cualquier lugar de la aplicación.
* Usó la [Inyección de dependencia angular](guide/dependency-injection) para inyectarlo en un componente.
* Le dio al `HeroService` el método _get data_ una firma asincrónica.
* Descubrio `Observable` y la biblioteca RxJS _Observable_.
* Usó RxJS `of ()` para devolver un observable de héroes simulados (`Observable <Hero []>`).
* El lifecycle hook (gancho del ciclo de vida) `ngOnInit` del componente llama al método `HeroService`, no al constructor.
* Creó un `MessageService` para una comunicación débilmente acoplada entre clases.
* El `HeroService` inyectado en un componente se crea con otro servicio inyectado,
  `MessageService`.
  