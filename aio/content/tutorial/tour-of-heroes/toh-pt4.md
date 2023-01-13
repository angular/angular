# Add services

The Tour of Heroes `HeroesComponent` is getting and displaying fake data.

Refactoring the `HeroesComponent` focuses on supporting the view and
making it easier to unit-test with a mock service.

<div class="alert is-helpful">

For the sample application that this page describes, see the <live-example></live-example>.

</div>

## Why services

Components shouldn't fetch or save data directly and they certainly shouldn't knowingly present fake data.
They should focus on presenting data and delegate data access to a service.

This tutorial creates a `HeroService` that all application classes can use to get heroes.
Instead of creating that service with the [`new` keyword](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/new), use the [*dependency injection*](guide/dependency-injection) that Angular supports to inject it into the `HeroesComponent` constructor.

Services are a great way to share information among classes that *don't know each other*.
Create a `MessageService` next and inject it in these two places.

*   Inject in `HeroService`, which uses the service to send a message
*   Inject in `MessagesComponent`, which displays that message, and also displays the ID when the user clicks a hero

## Create the `HeroService`

Run `ng generate` to create a service called `hero`.

<code-example format="shell" language="shell">

ng generate service hero

</code-example>

The command generates a skeleton `HeroService` class in `src/app/hero.service.ts` as follows:

<code-example header="src/app/hero.service.ts (new service)" path="toh-pt4/src/app/hero.service.1.ts" region="new"></code-example>

### `@Injectable()` services

Notice that the new service imports the Angular `Injectable` symbol and annotates the class with the `@Injectable()` decorator. This marks the class as one that participates in the *dependency injection system*.
The `HeroService` class is going to provide an injectable service, and it can also have its own injected dependencies.
It doesn't have any dependencies yet.

The `@Injectable()` decorator accepts a metadata object for the service, the same way the `@Component()` decorator did for your component classes.

### Get hero data

The `HeroService` could get hero data from anywhere such as a web service, local storage, or a mock data source.

Removing data access from components means you can change your mind about the implementation anytime, without touching any components.
They don't know how the service works.

The implementation in *this* tutorial continues to deliver *mock heroes*.

Import the `Hero` and `HEROES`.

<code-example header="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.ts" region="import-heroes"></code-example>

Add a `getHeroes` method to return the *mock heroes*.

<code-example header="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.1.ts" region="getHeroes"></code-example>

<a id="provide"></a>

## Provide the `HeroService`

You must make the `HeroService` available to the dependency injection system before Angular can *inject* it into the `HeroesComponent` by registering a *provider*.
A provider is something that can create or deliver a service. In this case, it instantiates the `HeroService` class to provide the service.

To make sure that the `HeroService` can provide this service, register it with the *injector*. The *injector* is the object that chooses and injects the provider where the application requires it.

By default, `ng generate service` registers a provider with the *root injector* for your service by including provider metadata, that's `providedIn: 'root'` in the `@Injectable()` decorator.

<code-example format="typescript" language="typescript">

@Injectable({
  providedIn: 'root',
})

</code-example>

When you provide the service at the root level, Angular creates a single, shared instance of `HeroService` and injects into any class that asks for it.
Registering the provider in the `@Injectable` metadata also allows Angular to optimize an application by removing the service if it isn't used.

<div class="alert is-helpful">

To learn more about providers, see the [Providers section](guide/providers).
To learn more about injectors, see the [Dependency Injection guide](guide/dependency-injection).

</div>

The `HeroService` is now ready to plug into the `HeroesComponent`.

<div class="alert is-important">

This is an interim code sample that allows you to provide and use the `HeroService`.
At this point, the code differs from the `HeroService` in the [final code review](#final-code-review).

</div>

## Update `HeroesComponent`

Open the `HeroesComponent` class file.

Delete the `HEROES` import, because you won't need that anymore.
Import the `HeroService` instead.

<code-example header="src/app/heroes/heroes.component.ts (import HeroService)" path="toh-pt4/src/app/heroes/heroes.component.ts" region="hero-service-import"></code-example>

Replace the definition of the `heroes` property with a declaration.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.ts" region="heroes"></code-example>

<a id="inject"></a>

### Inject the `HeroService`

Add a private `heroService` parameter of type `HeroService` to the constructor.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="ctor"></code-example>

The parameter simultaneously defines a private `heroService` property and identifies it as a `HeroService` injection site.

When Angular creates a `HeroesComponent`, the [Dependency Injection](guide/dependency-injection) system sets the `heroService` parameter to the singleton instance of `HeroService`.

### Add `getHeroes()`

Create a method to retrieve the heroes from the service.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes"></code-example>

<a id="oninit"></a>

### Call it in `ngOnInit()`

While you could call `getHeroes()` in the constructor, that's not the best practice.

Reserve the constructor for minimal initialization such as wiring constructor parameters to properties.
The constructor shouldn't *do anything*.
It certainly shouldn't call a function that makes HTTP requests to a remote server as a *real* data service would.

Instead, call `getHeroes()` inside the [*ngOnInit lifecycle hook*](guide/lifecycle-hooks) and let Angular call `ngOnInit()` at an appropriate time *after* constructing a `HeroesComponent` instance.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.ts" region="ng-on-init"></code-example>

### See it run

After the browser refreshes, the application should run as before, showing a list of heroes and a hero detail view when you click a hero name.

## Observable data

The `HeroService.getHeroes()` method has a *synchronous signature*, which implies that the `HeroService` can fetch heroes synchronously.
The `HeroesComponent` consumes the `getHeroes()` result as if heroes could be fetched synchronously.

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="get-heroes"></code-example>

This approach won't work in a real application that uses asynchronous calls.
It works now because your service synchronously returns *mock heroes*.

If `getHeroes()` can't return immediately with hero data, it shouldn't be
synchronous, because that would block the browser as it waits to return data.

`HeroService.getHeroes()` must have an *asynchronous signature* of some kind.

In this tutorial, `HeroService.getHeroes()` returns an `Observable` so that it can
use the Angular `HttpClient.get` method to fetch the heroes
and have [`HttpClient.get()`](guide/http) return an `Observable`.

### Observable `HeroService`

`Observable` is one of the key classes in the [RxJS library](https://rxjs.dev).

In [the tutorial on HTTP](tutorial/tour-of-heroes/toh-pt6), you can see how Angular's `HttpClient` methods return RxJS `Observable` objects.
This tutorial simulates getting data from the server with the RxJS `of()` function.

Open the `HeroService` file and import the `Observable` and `of` symbols from RxJS.

<code-example header="src/app/hero.service.ts (Observable imports)" path="toh-pt4/src/app/hero.service.ts" region="import-observable"></code-example>

Replace the `getHeroes()` method with the following:

<code-example header="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.ts" region="getHeroes-1"></code-example>

`of(HEROES)` returns an `Observable<Hero[]>` that emits  *a single value*, the array of mock heroes.

<div class="alert is-helpful">

The [HTTP tutorial](tutorial/tour-of-heroes/toh-pt6) shows you how to call `HttpClient.get<Hero[]>()`, which also returns an `Observable<Hero[]>` that emits  *a single value*, an array of heroes from the body of the HTTP response.

</div>

### Subscribe in `HeroesComponent`

The `HeroService.getHeroes` method used to return a `Hero[]`.
Now it returns an `Observable<Hero[]>`.

You need to adjust your application to work with that change to `HeroesComponent`.

Find the `getHeroes` method and replace it with the following code. the new code is shown side-by-side with the current version for comparison.

<code-tabs>
    <code-pane header="heroes.component.ts (Observable)" path="toh-pt4/src/app/heroes/heroes.component.ts" region="getHeroes"></code-pane>
    <code-pane header="heroes.component.ts (Original)" path="toh-pt4/src/app/heroes/heroes.component.1.ts" region="getHeroes"></code-pane>
</code-tabs>

`Observable.subscribe()` is the critical difference.

The previous version assigns an array of heroes to the component's `heroes` property.
The assignment occurs *synchronously*, as if the server could return heroes instantly or the browser could freeze the UI while it waited for the server's response.

That *won't work* when the `HeroService` is actually making requests of a remote server.

The new version waits for the `Observable` to emit the array of heroes, which could happen now or several minutes from now.
The `subscribe()` method passes the emitted array to the callback,
which sets the component's `heroes` property.

This asynchronous approach *works* when the `HeroService` requests heroes from the server.

## Show messages

This section guides you through the following:

*   Adding a `MessagesComponent` that displays application messages at the bottom of the screen
*   Creating an injectable, application-wide `MessageService` for sending messages to be displayed
*   Injecting `MessageService` into the `HeroService`
*   Displaying a message when `HeroService` fetches heroes successfully

### Create `MessagesComponent`

Use `ng generate` to create the `MessagesComponent`.

<code-example format="shell" language="shell">

ng generate component messages

</code-example>

`ng generate` creates the component files in the `src/app/messages` directory and declares the `MessagesComponent` in `AppModule`.

Edit the `AppComponent` template to display the `MessagesComponent`.

<code-example header="src/app/app.component.html" path="toh-pt4/src/app/app.component.html"></code-example>

You should see the default paragraph from `MessagesComponent` at the bottom of the page.

### Create the `MessageService`

Use `ng generate` to create the `MessageService` in `src/app`.

<code-example format="shell" language="shell">

ng generate service message

</code-example>

Open `MessageService` and replace its contents with the following.

<code-example header="src/app/message.service.ts" path="toh-pt4/src/app/message.service.ts"></code-example>

The service exposes its cache of `messages` and two methods:

* One to `add()` a message to the cache.
* Another to `clear()` the cache.

<a id="inject-message-service"></a>

### Inject it into the `HeroService`

In `HeroService`, import the `MessageService`.

<code-example header="src/app/hero.service.ts (import MessageService)" path="toh-pt4/src/app/hero.service.ts" region="import-message-service"></code-example>

Edit the constructor with a parameter that declares a private `messageService` property.
Angular injects the singleton `MessageService` into that property when it creates the `HeroService`.

<code-example header="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.ts" region="ctor"></code-example>

<div class="alert is-helpful">

This is an example of a typical *service-in-service* scenario in which
you inject the `MessageService` into the `HeroService` which is injected into the `HeroesComponent`.

</div>

### Send a message from `HeroService`

Edit the `getHeroes()` method to send a message when the heroes are fetched.

<code-example header="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.ts" region="getHeroes"></code-example>

### Display the message from `HeroService`

The `MessagesComponent` should display all messages, including the message sent by the `HeroService` when it fetches heroes.

Open `MessagesComponent` and import the `MessageService`.

<code-example header="src/app/messages/messages.component.ts (import MessageService)" path="toh-pt4/src/app/messages/messages.component.ts" region="import-message-service"></code-example>

Edit the constructor with a parameter that declares a **public** `messageService` property.
Angular injects the singleton `MessageService` into that property when it creates the `MessagesComponent`.

<code-example header="src/app/messages/messages.component.ts" path="toh-pt4/src/app/messages/messages.component.ts" region="ctor"></code-example>

The `messageService` property **must be public** because you're going to bind to it in the template.

<div class="alert is-important">

Angular only binds to *public* component properties.

</div>

### Bind to the `MessageService`

Replace the `MessagesComponent` template created by `ng generate` with the following.

<code-example header="src/app/messages/messages.component.html" path="toh-pt4/src/app/messages/messages.component.html"></code-example>

This template binds directly to the component's `messageService`.

|                                              | Details |
|:---                                          |:---     |
| `*ngIf`                                      | Only displays the messages area if there are messages to show. |
| `*ngFor`                                     | Presents the list of messages in repeated `<div>` elements.    |
| Angular [event binding](guide/event-binding) | Binds the button's click event to `MessageService.clear()`.    |

The messages look better after you add the private CSS styles to `messages.component.css` as listed in one of the ["final code review"](#final-code-review) tabs below.

## Add MessageService to HeroesComponent

The following example shows how to display a history of each time the user clicks on a hero.
This helps when you get to the next section on [Routing](tutorial/tour-of-heroes/toh-pt5).

<code-example header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.ts"></code-example>

Refresh the browser to see the list of heroes, and scroll to the bottom to see the messages from the HeroService.
Each time you click a hero, a new message appears to record the selection.
Use the **Clear messages** button to clear the message history.

<a id="final-code-review"></a>

## Final code review

Here are the code files discussed on this page.

<code-tabs>
    <code-pane header="src/app/hero.service.ts" path="toh-pt4/src/app/hero.service.ts"></code-pane>
    <code-pane header="src/app/message.service.ts" path="toh-pt4/src/app/message.service.ts"></code-pane>
    <code-pane header="src/app/heroes/heroes.component.ts" path="toh-pt4/src/app/heroes/heroes.component.ts"></code-pane>
    <code-pane header="src/app/messages/messages.component.ts" path="toh-pt4/src/app/messages/messages.component.ts"></code-pane>
    <code-pane header="src/app/messages/messages.component.html" path="toh-pt4/src/app/messages/messages.component.html"></code-pane>
    <code-pane header="src/app/messages/messages.component.css" path="toh-pt4/src/app/messages/messages.component.css"></code-pane>
    <code-pane header="src/app/app.module.ts" path="toh-pt4/src/app/app.module.ts"></code-pane>
    <code-pane header="src/app/app.component.html" path="toh-pt4/src/app/app.component.html"></code-pane>
</code-tabs>

## Summary

*   You refactored data access to the `HeroService` class.
*   You registered the `HeroService` as the *provider* of its service at the root level so that it can be injected anywhere in the application.
*   You used [Angular Dependency Injection](guide/dependency-injection) to inject it into a component.
*   You gave the `HeroService` `get data` method an asynchronous signature.
*   You discovered `Observable` and the RxJS `Observable` library.
*   You used RxJS `of()` to return `Observable<Hero[]>`, an observable of mock heroes.
*   The component's `ngOnInit` lifecycle hook calls the `HeroService` method, not the constructor.
*   You created a `MessageService` for loosely coupled communication between classes.
*   The `HeroService` injected into a component is created with another injected service, `MessageService`.

@reviewed 2022-02-28
