# Introduction to services and dependency injection

<img src="generated/images/guide/architecture/service.png" alt="Service" class="left">

_Service_ is a broad category encompassing any value, function, or feature that an app needs. A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.
<br class="clear">

Angular distinguishes components from services in order to increase modularity and reusability.

* By separating a component's view-related functionality from other kinds of processing, you can make your component classes lean and efficient. Ideally, a component's job is to enable the user experience and nothing more.  It should present properties and methods for data binding, in order to mediate between the view (rendered by the template) and the application logic (which often includes some notion of a _model_).

* A component should not need to define things like how to fetch data from the server, validate user input, or log directly to the console. Instead, it can delegate such tasks to services. By defining that kind of processing task in an injectable service class, you make it available to any component. You can also make your app more adaptable by injecting different providers of the same kind of service, as appropriate in different circumstances.

Angular doesn't *enforce* these principles. Angular does help you *follow* these principles by making it easy to factor your
application logic into services and make those services available to components through *dependency injection*.

## Service examples

Here's an example of a service class that logs to the browser console:

<code-example path="architecture/src/app/logger.service.ts" linenums="false" title="src/app/logger.service.ts (class)" region="class"></code-example>

Here's a `HeroService` that uses a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to fetch heroes.
The `HeroService` depends on the `Logger` service and another `BackendService` that handles the server communication grunt work.

<code-example path="architecture/src/app/hero.service.ts" linenums="false" title="src/app/hero.service.ts (class)" region="class"></code-example>

<hr/>

## Dependency injection

<img src="generated/images/guide/architecture/dependency-injection.png" alt="Service" class="left">

Components consume services; that is, you can *inject* a service into a component, giving the component access to that service class. To define a class as a service in Angular, use the `@Injectable` decorator to provide the metadata that allows Angular to inject it into a component as a *dependency*. Most dependencies are services.
 
*Dependency injection* (often called DI) is wired into the Angular framework and used everywhere to provide new components with the services they need.

* The *injector* is the main mechanism. You don't have to create an Angular injector. Angular creates an application-wide injector for you during the bootstrap process.

* The injector maintains a *container* of service instances that it has already created, and reuses them if possible.

* A *provider* is a recipe for creating a service -- typically the service class itself. For any service you need in your app, you must register a provider with the app's injector, so that the injector can use it to create new service instances.

When Angular creates a new instance of a component class, it determines which services that component needs by looking at the types of its constructor parameters. For example, the constructor of `HeroListComponent` needs a `HeroService`:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (constructor)" region="ctor"></code-example>

When Angular discovers that a component depends on a service, it first checks if the injector already has any existing instances of that service. If a requested service instance does not yet exist, the injector makes one using the registered provider, and adds it to the injector before returning the service to Angular.

When all requested services have been resolved and returned, Angular can call the component's constructor with those services as arguments.

The process of `HeroService` injection looks something like this:

<figure>
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service" class="left">
</figure>

### Providing services

You must register at least one *provider* of any service you are going to use. You can register providers in modules or in components.

* When you add providers to the [root module](guide/architecture-modules), the same instance of a service is available to all components in your app.

<code-example path="architecture/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (module providers)" region="providers"></code-example>

* When you register a provider at the component level, you get a new instance of the
service with each new instance of that component. At the component level, register a service provider in the `providers` property of the `@Component` metadata:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (component providers)" region="providers"></code-example>

For more detailed information, see the [Dependency Injection](guide/dependency-injection) section.

<hr/>
