# Add services

The Tour of Heroes `HeroesComponent` is currently getting and displaying fake data.

After the refactoring in this tutorial, `HeroesComponent` will be lean and focused on supporting the view.
It will also be easier to unit-test with a mock service.

<div class="alert is-helpful">

  For the sample application that this page describes, see the <live-example></live-example>.

</div>


## Why services

Components shouldn't fetch or save data directly and they certainly shouldn't knowingly present fake data.
They should focus on presenting data and delegate data access to a service.

In this tutorial, you'll create a `HeroService` that all application classes can use to get heroes.
Instead of creating that service with the [`new` keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new),
you'll rely on Angular [*dependency injection*](guide/dependency-injection)
to inject it into the `HeroesComponent` constructor.

Services are a great way to share information among classes that _don't know each other_.
You'll create a `MessageService` and inject it in two places.

1. Inject in HeroService, which uses the service to send a message.
2. Inject in MessagesComponent, which displays that message, and also displays the ID
when the user clicks a hero.


## Create the `HeroService`

Using the Angular CLI, create a service called `hero`.

<code-example language="sh" class="code-shell">
  ng generate service hero
</code-example>

The command generates a skeleton `HeroService` class in `src/app/hero.service.ts` as follows:

<code-example path="toh-pt4/src/app/hero.service.1.ts" region="new"
 header="src/app/hero.service.ts (new service)"></code-example>


### `@Injectable()` services

Notice that the new service imports the Angular `Injectable` symbol and annotates
the class with the `@Injectable()` decorator. This marks the class as one that participates in the _dependency injection system_. The `HeroService` class is going to provide an injectable service, and it can also have its own injected dependencies.
It doesn't have any dependencies yet, but [it will soon](#inject-message-service).

The `@Injectable()` decorator accepts a metadata object for the service, the same way the `@Component()` decorator did for your component classes.

### Get hero data

The `HeroService` could get hero data from anywhere&mdash;a web service, local storage, or a mock data source.

Removing data access from components means you can change your mind about the implementation anytime, without touching any components.
They don't know how the service works.

The implementation in _this_ tutorial will continue to deliver _mock heroes_.

Import the `Hero` and `HEROES`.

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="import-heroes">
</code-example>

Add a `getHeroes` method to return the _mock heroes_.

<code-example path="toh-pt4/src/app/hero.service.1.ts" header="src/app/hero.service.ts" region="getHeroes">
</code-example>

{@a provide}
## Provide the `HeroService`

You must make the `HeroService` available to the dependency injection system
before Angular can _inject_ it into the `HeroesComponent` by registering a _provider_. A provider is something that can create or deliver a service; in this case, it instantiates the `HeroService` class to provide the service.

To make sure that the `HeroService` can provide this service, register it
with the _injector_, which is the object that is responsible for choosing
and injecting the provider where the application requires it.

By default, the Angular CLI command `ng generate service` registers a provider with the _root injector_ for your service by including provider metadata, that is `providedIn: 'root'` in the `@Injectable()` decorator.

```
@Injectable({
  providedIn: 'root',
})
```

When you provide the service at the root level, Angular creates a single, shared instance of `HeroService` and injects into any class that asks for it.
Registering the provider in the `@Injectable` metadata also allows Angular to optimize an application by removing the service if it turns out not to be used after all.

<div class="alert is-helpful">

To learn more about providers, see the [Providers section](guide/providers).
To learn more about injectors, see the [Dependency Injection guide](guide/dependency-injection).

</div>

The `HeroService` is now ready to plug into the `HeroesComponent`.

<div class="alert is-important">

This is an interim code sample that will allow you to provide and use the `HeroService`. At this point, the code will differ from the `HeroService` in the ["final code review"](#final-code-review).

</div>


## Update `HeroesComponent`

Open the `HeroesComponent` class file.

Delete the `HEROES` import, because you won't need that anymore.
Import the `HeroService` instead.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts (import HeroService)" region="hero-service-import">
</code-example>

Replace the definition of the `heroes` property with a declaration.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts" region="heroes">
</code-example>

{@a inject}

### Inject the `HeroService`

Add a private `heroService` parameter of type `HeroService` to the constructor.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" region="ctor">
</code-example>

The parameter simultaneously defines a private `heroService` property and identifies it as a `HeroService` injection site.

When Angular creates a `HeroesComponent`, the [Dependency Injection](guide/dependency-injection) system
sets the `heroService` parameter to the singleton instance of `HeroService`.

### Add `getHeroes()`

Create a method to retrieve the heroes from the service.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" region="getHeroes">
</code-example>

{@a oninit}

### Call it in `ngOnInit()`

While you could call `getHeroes()` in the constructor, that's not the best practice.

Reserve the constructor for minimal initialization such as wiring constructor parameters to properties.
The constructor shouldn't _do anything_.
It certainly shouldn't call a function that makes HTTP requests to a remote server as a _real_ data service would.

Instead, call `getHeroes()` inside the [*ngOnInit lifecycle hook*](guide/lifecycle-hooks) and
let Angular call `ngOnInit()` at an appropriate time _after_ constructing a `HeroesComponent` instance.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" header="src/app/heroes/heroes.component.ts" region="ng-on-init">
</code-example>

### See it run

After the browser refreshes, the application should run as before,
showing a list of heroes and a hero detail view when you click on a hero name.

## Observable data

The `HeroService.getHeroes()` method has a _synchronous signature_,
which implies that the `HeroService` can fetch heroes synchronously.
The `HeroesComponent` consumes the `getHeroes()` result
as if heroes could be fetched synchronously.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" region="get-heroes">
</code-example>

This will not work in a real app.
You're getting away with it now because the service currently returns _mock heroes_.
But soon the application will fetch heroes from a remote server,
which is an inherently _asynchronous_ operation.

The `HeroService` must wait for the server to respond,
`getHeroes()` cannot return immediately with hero data,
and the browser will not block while the service waits.

`HeroService.getHeroes()` must have an _asynchronous signature_ of some kind.

In this tutorial, `HeroService.getHeroes()` will return an `Observable`
because it will eventually use the Angular `HttpClient.get` method to fetch the heroes
and [`HttpClient.get()` returns an `Observable`](guide/http).

### Observable `HeroService`

`Observable` is one of the key classes in the [RxJS library](https://rxjs.dev/).

In a [later tutorial on HTTP](tutorial/toh-pt6), you'll learn that Angular's `HttpClient` methods return RxJS `Observable`s.
In this tutorial, you'll simulate getting data from the server with the RxJS `of()` function.

Open the `HeroService` file and import the `Observable` and `of` symbols from RxJS.

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts (Observable imports)" region="import-observable">
</code-example>

Replace the `getHeroes()` method with the following:

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="getHeroes-1"></code-example>

`of(HEROES)` returns an `Observable<Hero[]>` that emits  _a single value_, the array of mock heroes.

<div class="alert is-helpful">

In the [HTTP tutorial](tutorial/toh-pt6), you'll call `HttpClient.get<Hero[]>()` which also returns an `Observable<Hero[]>` that emits  _a single value_, an array of heroes from the body of the HTTP response.

</div>

### Subscribe in `HeroesComponent`

The `HeroService.getHeroes` method used to return a `Hero[]`.
Now it returns an `Observable<Hero[]>`.

You'll have to adjust to that difference in `HeroesComponent`.

Find the `getHeroes` method and replace it with the following code
(shown side-by-side with the previous version for comparison)

<code-tabs>

  <code-pane header="heroes.component.ts (Observable)"
    path="toh-pt4/src/app/heroes/heroes.component.ts" region="getHeroes">
  </code-pane>

  <code-pane header="heroes.component.ts (Original)"
    path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes">
  </code-pane>

</code-tabs>

`Observable.subscribe()` is the critical difference.

The previous version assigns an array of heroes to the component's `heroes` property.
The assignment occurs _synchronously_, as if the server could return heroes instantly
or the browser could freeze the UI while it waited for the server's response.

That _won't work_ when the `HeroService` is actually making requests of a remote server.

The new version waits for the `Observable` to emit the array of heroes&mdash;which
could happen now or several minutes from now.
The `subscribe()` method passes the emitted array to the callback,
which sets the component's `heroes` property.

This asynchronous approach _will work_ when
the `HeroService` requests heroes from the server.

## Show messages

This section guides you through the following:

* adding a `MessagesComponent` that displays application messages at the bottom of the screen
* creating an injectable, app-wide `MessageService` for sending messages to be displayed
* injecting `MessageService` into the `HeroService`
* displaying a message when `HeroService` fetches heroes successfully

### Create `MessagesComponent`

Use the CLI to create the `MessagesComponent`.

<code-example language="sh" class="code-shell">
  ng generate component messages
</code-example>

The CLI creates the component files in the `src/app/messages` folder and declares the `MessagesComponent` in `AppModule`.

Modify the `AppComponent` template to display the generated `MessagesComponent`.

<code-example
  header = "src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
</code-example>

You should see the default paragraph from `MessagesComponent` at the bottom of the page.

### Create the `MessageService`

Use the CLI to create the `MessageService` in `src/app`.

<code-example language="sh" class="code-shell">
  ng generate service message
</code-example>

Open `MessageService` and replace its contents with the following.

<code-example header = "src/app/message.service.ts" path="toh-pt4/src/app/message.service.ts">
</code-example>

The service exposes its cache of `messages` and two methods: one to `add()` a message to the cache and another to `clear()` the cache.

{@a inject-message-service}
### Inject it into the `HeroService`

In `HeroService`, import the `MessageService`.

<code-example
  header = "src/app/hero.service.ts (import MessageService)"
  path="toh-pt4/src/app/hero.service.ts" region="import-message-service">
</code-example>

Modify the constructor with a parameter that declares a private `messageService` property.
Angular will inject the singleton `MessageService` into that property
when it creates the `HeroService`.

<code-example
  path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="ctor">
</code-example>

<div class="alert is-helpful">

This is a typical "*service-in-service*" scenario:
you inject the `MessageService` into the `HeroService` which is injected into the `HeroesComponent`.

</div>

### Send a message from `HeroService`

Modify the `getHeroes()` method to send a message when the heroes are fetched.

<code-example path="toh-pt4/src/app/hero.service.ts" header="src/app/hero.service.ts" region="getHeroes">
</code-example>

### Display the message from `HeroService`

The `MessagesComponent` should display all messages,
including the message sent by the `HeroService` when it fetches heroes.

Open `MessagesComponent` and import the `MessageService`.

<code-example header="src/app/messages/messages.component.ts (import MessageService)" path="toh-pt4/src/app/messages/messages.component.ts" region="import-message-service">
</code-example>

Modify the constructor with a parameter that declares a **public** `messageService` property.
Angular will inject the singleton `MessageService` into that property
when it creates the `MessagesComponent`.

<code-example path="toh-pt4/src/app/messages/messages.component.ts" header="src/app/messages/messages.component.ts" region="ctor">
</code-example>

The `messageService` property **must be public** because you're going to bind to it in the template.

<div class="alert is-important">

Angular only binds to _public_ component properties.

</div>

### Bind to the `MessageService`

Replace the CLI-generated `MessagesComponent` template with the following.

<code-example
  header = "src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
</code-example>

This template binds directly to the component's `messageService`.

* The `*ngIf` only displays the messages area if there are messages to show.


* An `*ngFor` presents the list of messages in repeated `<div>` elements.


* An Angular [event binding](guide/event-binding) binds the button's click event
to `MessageService.clear()`.

The messages will look better when you add the private CSS styles to `messages.component.css`
as listed in one of the ["final code review"](#final-code-review) tabs below.

## Add additional messages to hero service

The following example shows how to send and display a message each time the user clicks on
a hero, showing a history of the user's selections. This will be helpful when you get to the
next section on [Routing](tutorial/toh-pt5).

<code-example header="src/app/heroes/heroes.component.ts"
path="toh-pt4/src/app/heroes/heroes.component.ts">
</code-example>

Refresh the browser to see the list of heroes, and scroll to the bottom to see the
messages from the HeroService. Each time you click a hero, a new message appears to record
the selection. Use the **Clear messages** button to clear the message history.

{@a final-code-review}

## Final code review

Here are the code files discussed on this page.

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

## Summary

* You refactored data access to the `HeroService` class.
* You registered the `HeroService` as the _provider_ of its service at the root level so that it can be injected anywhere in the app.
* You used [Angular Dependency Injection](guide/dependency-injection) to inject it into a component.
* You gave the `HeroService` _get data_ method an asynchronous signature.
* You discovered `Observable` and the RxJS _Observable_ library.
* You used RxJS `of()` to return an observable of mock heroes (`Observable<Hero[]>`).
* The component's `ngOnInit` lifecycle hook calls the `HeroService` method, not the constructor.
* You created a `MessageService` for loosely-coupled communication between classes.
* The `HeroService` injected into a component is created with another injected service,
 `MessageService`.
