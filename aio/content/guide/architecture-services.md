# Introducción a servicios e inyección de dependencias

*Servicio* es una categoría amplia que abarca cualquier valor, función o característica que necesite una aplicación.
Un servicio es típicamente una clase con un propósito limitado y bien definido.
Debe hacer algo específico y hacerlo bien.

Angular distingue los componentes de los servicios para aumentar la modularidad y la reutilización.
Al separar la funcionalidad relacionada con la vista de un componente de otros tipos de procesamiento, puedes hacer que tus componentes sean ágiles y eficientes.

Idealmente, el trabajo de un componente es permitir la experiencia del usuario y nada más.
Un componente debe presentar propiedades y métodos para el enlace de datos,
para mediar entre la vista (representada por la plantilla)
y la lógica de la aplicación (que a menudo incluye alguna noción de * modelo *).

Un componente puede delegar ciertas tareas a los servicios, como obtener datos del servidor, validar la entrada del usuario o iniciar sesión directamente en la consola.
Al definir tales tareas de procesamiento en una * clase de servicio inyectable *, hace que esas tareas sean disponibles para cualquier componente.
También puedes hacer que tu aplicación sea más adaptable inyectando diferentes proveedores del mismo tipo de servicio, según corresponda en diferentes circunstancias.

Angular no * impone * estos principios. Angular te ayuda a * seguir * estos principios
al facilitar la integración de la lógica de tu aplicación en los servicios y hacer que esos servicios sean disponibles para los componentes a través de * inyección de dependencia *.

## Ejemplos de servicios

A continuación, se muestra un ejemplo de una clase de servicio que se registra en la consola del navegador.

<code-example path="architecture/src/app/logger.service.ts" header="src/app/logger.service.ts (class)" region="class"></code-example>

Services can depend on other services. For example, here's a `HeroService` that depends on the `Logger` service, and also uses `BackendService` to get heroes. That service in turn might depend on the `HttpClient` service to fetch heroes asynchronously from a server.

<code-example path="architecture/src/app/hero.service.ts" header="src/app/hero.service.ts (class)" region="class"></code-example>

## Dependency injection (DI)

<img src="generated/images/guide/architecture/dependency-injection.png" alt="Service" class="left">

DI is wired into the Angular framework and used everywhere to provide new components with the services or other things they need.
Components consume services; that is, you can *inject* a service into a component, giving the component access to that service class.

To define a class as a service in Angular, use the `@Injectable()` decorator to provide the metadata that allows Angular to inject it into a component as a *dependency*.
Similarly, use the `@Injectable()` decorator to indicate that a component or other class (such as another service, a pipe, or an NgModule) *has* a dependency.

* The *injector* is the main mechanism. Angular creates an application-wide injector for you during the bootstrap process, and additional injectors as needed. You don't have to create injectors.

* An injector creates dependencies, and maintains a *container* of dependency instances that it reuses if possible.

* A *provider* is an object that tells an injector how to obtain or create a dependency.

For any dependency that you need in your app, you must register a provider with the app's injector,
so that the injector can use the provider to create new instances.
For a service, the provider is typically the service class itself.

<div class="alert is-helpful">

A dependency doesn't have to be a service&mdash;it could be a function, for example, or a value.

</div>

When Angular creates a new instance of a component class, it determines which services or other dependencies that component needs by looking at the constructor parameter types. For example, the constructor of `HeroListComponent` needs `HeroService`.

<code-example path="architecture/src/app/hero-list.component.ts" header="src/app/hero-list.component.ts (constructor)" region="ctor"></code-example>

When Angular discovers that a component depends on a service, it first checks if the injector has any existing instances of that service. If a requested service instance doesn't yet exist, the injector makes one using the registered provider, and adds it to the injector before returning the service to Angular.

When all requested services have been resolved and returned, Angular can call the component's constructor with those services as arguments.

The process of `HeroService` injection looks something like this.

<div class="lightbox">
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service" class="left">
</div>

### Providing services

You must register at least one *provider* of any service you are going to use.
The provider can be part of the service's own metadata, making that service available everywhere,
or you can register providers with specific modules or components.
You register providers in the metadata of the service (in the `@Injectable()` decorator),
or in the `@NgModule()` or `@Component()` metadata

* By default, the Angular CLI command [`ng generate service`](cli/generate) registers a provider with the root injector for your service by including provider metadata in the `@Injectable()` decorator. The tutorial uses this method to register the provider of HeroService class definition.

   ```
   @Injectable({
    providedIn: 'root',
   })
   ```

   When you provide the service at the root level, Angular creates a single, shared instance of `HeroService`
   and injects it into any class that asks for it.
   Registering the provider in the `@Injectable()` metadata also allows Angular to optimize an app
   by removing the service from the compiled app if it isn't used.

* When you register a provider with a [specific NgModule](guide/architecture-modules), the same instance of a service is available to all components in that NgModule. To register at this level, use the `providers` property of the `@NgModule()` decorator,

   ```
   @NgModule({
     providers: [
     BackendService,
     Logger
    ],
    ...
   })
   ```

* When you register a provider at the component level, you get a new instance of the
service with each new instance of that component.
At the component level, register a service provider in the `providers` property of the `@Component()` metadata.

   <code-example path="architecture/src/app/hero-list.component.ts" header="src/app/hero-list.component.ts (component providers)" region="providers"></code-example>

For more detailed information, see the [Dependency Injection](guide/dependency-injection) section.
