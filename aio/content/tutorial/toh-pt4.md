# Services

The Tour of Heroes `HeroesComponent` is currently getting and displaying fake data.

After the refactoring in this tutorial, `HeroesComponent` will be lean and focused on supporting the view.
It will also be easier to unit-test with a mock service.

## Why services

Components shouldn't fetch or save data directly and they certainly shouldn't knowingly present fake data.
They should focus on presenting data and delegate data access to a service.

In this tutorial, you'll create a `HeroService` that all application classes can use to get heroes.
Instead of creating that service with `new`, 
you'll rely on Angular [*dependency injection*](guide/dependency-injection) 
to inject it into the `HeroesComponent` constructor.

Services are a great way to share information among classes that _don't know each other_.
You'll create a `MessageService` and inject it in two places:

1. in `HeroService` which uses the service to send a message.
2. in `MessagesComponent` which displays that message.


## Create the _HeroService_

Using the Angular CLI, create a service called `hero`.

<code-example language="sh" class="code-shell">
  ng generate service hero
</code-example>

The command generates skeleton `HeroService` class in `src/app/hero.service.ts`
The `HeroService` class should look like the below.

<code-example path="toh-pt4/src/app/hero.service.1.ts" region="new"
 title="src/app/hero.service.ts (new service)" linenums="false">
</code-example>

### _@Injectable()_ services

Notice that the new service imports the Angular `Injectable` symbol and annotates
the class with the `@Injectable()` decorator.

The `@Injectable()` decorator tells Angular that this service _might_ itself
have injected dependencies.
It doesn't have dependencies now but [it will soon](#inject-message-service).
Whether it does or it doesn't, it's good practice to keep the decorator.

<div class="l-sub-section">

The Angular [style guidelines](guide/styleguide#style-07-04) strongly recommend keeping it
and the linter enforces this rule.

</div>

### Get hero data

The `HeroService` could get hero data from anywhere&mdash;a web service, local storage, or a mock data source. 

Removing data access from components means you can change your mind about the implementation anytime, without touching any components.
They don't know how the service works.

The implementation in _this_ tutorial will continue to deliver _mock heroes_.

Import the `Hero` and `HEROES`.

<code-example path="toh-pt4/src/app/hero.service.ts" region="import-heroes">
</code-example>

Add a `getHeroes` method to return the _mock heroes_.

<code-example path="toh-pt4/src/app/hero.service.1.ts" region="getHeroes">
</code-example>

{@a provide}
## Provide the `HeroService`

You must _provide_ the `HeroService` in the _dependency injection system_
before Angular can _inject_ it into the `HeroesComponent`, 
as you will do [below](#inject).

There are several ways to provide the `HeroService`: 
in the `HeroesComponent`, in the `AppComponent`, in the `AppModule`.
Each option has pros and cons. 

This tutorial chooses to provide it in the `AppModule`.

That's such a popular choice that you could have told the CLI to provide it there automatically
by appending `--module=app`.

<code-example language="sh" class="code-shell">
  ng generate service hero --module=app
</code-example>

Since you did not, you'll have to provide it yourself.

Open the `AppModule` class, import the `HeroService`, and add it to the `@NgModule.providers` array.

<code-example path="toh-pt4/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (providers)" region="providers-heroservice">
</code-example>

The `providers` array tells Angular to create a single, shared instance of `HeroService`
and inject into any class that asks for it.

The `HeroService` is now ready to plug into the `HeroesComponent`.

<div class="alert is-important">

This is a interim code sample that will allow you to provide and use the `HeroService`.  At this point, the code will differ from the `HeroService` in the ["final code review"](#final-code-review).

</div>

<div class="alert is-helpful">

  Learn more about _providers_ in the [Providers](guide/providers) guide.

</div>

## Update `HeroesComponent`

Open the `HeroesComponent` class file.

Delete the `HEROES` import as you won't need that anymore.
Import the `HeroService` instead.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" title="src/app/heroes/heroes.component.ts (import HeroService)" region="hero-service-import">
</code-example>

Replace the definition of the `heroes` property with a simple declaration.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" region="heroes">
</code-example>

{@a inject}

### Inject the `HeroService`

Add a private `heroService` parameter of type `HeroService` to the constructor.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" region="ctor">
</code-example>

The parameter simultaneously defines a private `heroService` property and identifies it as a `HeroService` injection site.

When Angular creates a `HeroesComponent`, the [Dependency Injection](guide/dependency-injection) system
sets the `heroService` parameter to the singleton instance of `HeroService`. 

### Add _getHeroes()_

Create a function to retrieve the heroes from the service.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes">
</code-example>

{@a oninit}

### Call it in `ngOnInit`

While you could call `getHeroes()` in the constructor, that's not the best practice.

Reserve the constructor for simple initialization such as wiring constructor parameters to properties.
The constructor shouldn't _do anything_.
It certainly shouldn't call a function that makes HTTP requests to a remote server as a _real_ data service would.

Instead, call `getHeroes()` inside the [*ngOnInit lifecycle hook*](guide/lifecycle-hooks) and
let Angular call `ngOnInit` at an appropriate time _after_ constructing a `HeroesComponent` instance.

<code-example path="toh-pt4/src/app/heroes/heroes.component.ts" region="ng-on-init">
</code-example>

### See it run

After the browser refreshes, the app should run as before, 
showing a list of heroes and a hero detail view when you click on a hero name.

## Observable data

The `HeroService.getHeroes()` method has a _synchronous signature_,
which implies that the `HeroService` can fetch heroes synchronously.
The `HeroesComponent` consumes the `getHeroes()` result 
as if heroes could be fetched synchronously.

<code-example path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="get-heroes">
</code-example>

This will not work in a real app.
You're getting away with it now because the service currently returns _mock heroes_.
But soon the app will fetch heroes from a remote server, 
which is an inherently _asynchronous_ operation.

The `HeroService` must wait for the server to respond,
`getHeroes()` cannot return immediately with hero data,
and the browser will not block while the service waits.

`HeroService.getHeroes()` must have an _asynchronous signature_ of some kind.

It can take a callback. It could return a `Promise`. It could return an `Observable`.

In this tutorial, `HeroService.getHeroes()` will return an `Observable`
in part because it will eventually use the Angular `HttpClient.get` method to fetch the heroes
and [`HttpClient.get()` returns an `Observable`](guide/http).

### Observable _HeroService_

`Observable` is one of the key classes in the [RxJS library](http://reactivex.io/rxjs/).

In a [later tutorial on HTTP](tutorial/toh-pt6), you'll learn that Angular's `HttpClient` methods return RxJS `Observable`s.
In this tutorial, you'll simulate getting data from the server with the RxJS `of()` function.

Open the `HeroService` file and import the `Observable` and `of` symbols from RxJS.

<code-example path="toh-pt4/src/app/hero.service.ts" 
title="src/app/hero.service.ts (Observable imports)" region="import-observable">
</code-example>

Replace the `getHeroes` method with this one.

<code-example path="toh-pt4/src/app/hero.service.ts" region="getHeroes-1"></code-example>

`of(HEROES)` returns an `Observable<Hero[]>` that emits  _a single value_, the array of mock heroes.

<div class="l-sub-section">

In the [HTTP tutorial](tutorial/toh-pt6), you'll call `HttpClient.get<Hero[]>()` which also returns an `Observable<Hero[]>` that emits  _a single value_, an array of heroes from the body of the HTTP response.

</div>

### Subscribe in _HeroesComponent_

The `HeroService.getHeroes` method used to return a `Hero[]`.
Now it returns an `Observable<Hero[]>`.

You'll have to adjust to that difference in `HeroesComponent`.

Find the `getHeroes` method and replace it with the following code
(shown side-by-side with the previous version for comparison)

<code-tabs>

  <code-pane title="heroes.component.ts (Observable)" 
    path="toh-pt4/src/app/heroes/heroes.component.ts" region="getHeroes">
  </code-pane>

  <code-pane title="heroes.component.ts (Original)" 
    path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes">
  </code-pane>

</code-tabs>

`Observable.subscribe()` is the critical difference.

The previous version assigns an array of heroes to the component's `heroes` property.
The assignment occurs _synchronously_, as if the server could return heroes instantly
or the browser could freeze the UI while it waited for the server's response.

That _won't work_ when the `HeroService` is actually making requests of a remote server.

The new version waits for the `Observable` to emit the array of heroes&mdash; 
which could happen now or several minutes from now.
Then `subscribe` passes the emitted array to the callback,
which sets the component's `heroes` property.

This asynchronous approach _will work_ when
the `HeroService` requests heroes from the server.

## Show messages

In this section you will 

* add a `MessagesComponent` that displays app messages at the bottom of the screen.
* create an injectable, app-wide `MessageService` for sending messages to be displayed
* inject `MessageService` into the `HeroService`
* display a message when `HeroService` fetches heroes successfully.

### Create _MessagesComponent_

Use the CLI to create the `MessagesComponent`.

<code-example language="sh" class="code-shell">
  ng generate component messages
</code-example>

The CLI creates the component files in the `src/app/messages` folder and declare `MessagesComponent` in `AppModule`.

Modify the `AppComponent` template to display the generated `MessagesComponent`

<code-example
  title = "/src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
</code-example>

You should see the default paragraph from `MessagesComponent` at the bottom of the page.

### Create the _MessageService_

Use the CLI to create the `MessageService` in `src/app`. 
The `--module=app` option tells the CLI to  [_provide_ this service](#provide) in the `AppModule`,

<code-example language="sh" class="code-shell">
  ng generate service message --module=app
</code-example>

Open `MessageService` and replace its contents with the following.

<code-example
  title = "/src/app/message.service.ts"
  path="toh-pt4/src/app/message.service.ts">
</code-example>

The service exposes its cache of `messages` and two methods: one to `add()` a message to the cache and another to `clear()` the cache.

{@a inject-message-service}
### Inject it into the `HeroService`

Re-open the `HeroService` and import the `MessageService`.

<code-example
  title = "/src/app/hero.service.ts (import MessageService)"
  path="toh-pt4/src/app/hero.service.ts" region="import-message-service">
</code-example>

Modify the constructor with a parameter that declares a private `messageService` property.
Angular will inject the singleton `MessageService` into that property 
when it creates the `HeroService`.

<code-example
  path="toh-pt4/src/app/hero.service.ts" region="ctor">
</code-example>

<div class="l-sub-section">

This is a typical "*service-in-service*" scenario:
you inject the `MessageService` into the `HeroService` which is injected into the `HeroesComponent`.

</div>

### Send a message from `HeroService`

Modify the `getHeroes` method to send a message when the heroes are fetched.

<code-example path="toh-pt4/src/app/hero.service.ts" region="getHeroes">
</code-example>

### Display the message from `HeroService`

The `MessagesComponent` should display all messages, 
including the message sent by the `HeroService` when it fetches heroes.

Open `MessagesComponent` and import the `MessageService`.

<code-example
  title = "/src/app/messages/messages.component.ts (import MessageService)"
  path="toh-pt4/src/app/messages/messages.component.ts" region="import-message-service">
</code-example>

Modify the constructor with a parameter that declares a **public** `messageService` property.
Angular will inject the singleton `MessageService` into that property 
when it creates the `HeroService`.

<code-example
  path="toh-pt4/src/app/messages/messages.component.ts" region="ctor">
</code-example>

The `messageService` property **must be public** because you're about to bind to it in the template.

<div class="alert is-important">

Angular only binds to _public_ component properties.

</div>

### Bind to the _MessageService_

Replace the CLI-generated `MessagesComponent` template with the following.

<code-example
  title = "src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
</code-example>

This template binds directly to the component's `messageService`.

* The `*ngIf` only displays the messages area if there are messages to show.


* An `*ngFor` presents the list of messages in repeated `<div>` elements.


* An Angular [event binding](guide/template-syntax#event-binding) binds the button's click event
to `MessageService.clear()`.

The messages will look better when you add the private CSS styles to `messages.component.css`
as listed in one of the ["final code review"](#final-code-review) tabs below.

The browser refreshes and the page displays the list of heroes.
Scroll to the bottom to see the message from the `HeroService` in the message area.
Click the "clear" button and the message area disappears.

{@a final-code-review}

## Final code review

Here are the code files discussed on this page and your app should look like this <live-example></live-example>.

<code-tabs>

  <code-pane title="src/app/hero.service.ts" 
  path="toh-pt4/src/app/hero.service.ts">
  </code-pane>

  <code-pane title="src/app/message.service.ts" 
  path="toh-pt4/src/app/message.service.ts">
  </code-pane>

  <code-pane title="src/app/heroes/heroes.component.ts"
  path="toh-pt4/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane title="src/app/messages/messages.component.ts"
  path="toh-pt4/src/app/messages/messages.component.ts">
  </code-pane>

  <code-pane title="src/app/messages/messages.component.html"
  path="toh-pt4/src/app/messages/messages.component.html">
  </code-pane>

  <code-pane title="src/app/messages/messages.component.css"
  path="toh-pt4/src/app/messages/messages.component.css">
  </code-pane>

  <code-pane title="src/app/app.module.ts"
  path="toh-pt4/src/app/app.module.ts">
  </code-pane>

  <code-pane title="src/app/app.component.html"
  path="toh-pt4/src/app/app.component.html">
  </code-pane>

</code-tabs>

## Summary

* You refactored data access to the `HeroService` class.
* You _provided_ the `HeroService` in the root `AppModule` so that it can be injected anywhere.
* You used [Angular Dependency Injection](guide/dependency-injection) to inject it into a component.
* You gave the `HeroService` _get data_ method an asynchronous signature.
* You discovered `Observable` and the RxJS _Observable_ library.
* You used RxJS `of()` to return an observable of mock heroes (`Observable<Hero[]>`).
* The component's `ngOnInit` lifecycle hook calls the `HeroService` method, not the constructor.
* You created a `MessageService` for loosely-coupled communication between classes.
* The `HeroService` injected into a component is created with another injected service,
 `MessageService`.
