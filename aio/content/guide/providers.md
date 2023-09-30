# Providing dependencies in modules

A provider is an instruction to the [Dependency Injection](guide/dependency-injection) system on how to obtain a value for a dependency.
Most of the time, these dependencies are services that you create and provide.

For the final sample application using the provider that this page describes, see the <live-example></live-example>.

## Providing a service

If you already have an application that was created with the [Angular CLI](cli), you can create a service using the [`ng generate`](cli/generate) CLI command in the root project directory.
Replace *User* with the name of your service.

<code-example format="shell" language="shell">

ng generate service User

</code-example>

This command creates the following `UserService` skeleton:

<code-example header="src/app/user.service.ts" path="providers/src/app/user.service.ts" region="skeleton"></code-example>

You can now inject `UserService` anywhere in your application.

The service itself is a class that the CLI generated and that's decorated with `@Injectable()`.
By default, this decorator has a `providedIn` property, which creates a provider for the service.
In this case, `providedIn: 'root'` specifies that Angular should provide the service in the root injector.

When you add a service provider to the root application injector, it's available throughout the application.
Additionally, these providers are also available to all the classes in the application as long they have the lookup token.

You should always provide your service in the root injector _unless_ there is a case where you want the service to be available _only if and when_ the consumer navigates lazily to a component that requires that service.

## Limiting provider scope by lazy loading

In the basic CLI-generated app, all code is loaded into the browser when the application starts. We say that this is an "eagerly loaded" app. You can delay loading parts of the code by "lazy loading" them when you need them. Lazy-loading is typically done with routing.

In an eagerly loaded app, the root application injector makes all of its providers available throughout the application.

This behavior necessarily changes when you use lazy loading.
Any services listed in lazy-loaded provider arrays aren't available because the root injector doesn't know about them.

When the Angular router lazy-loads a route or a component, it creates a new injector.
This injector is a child of the root application injector that supplements its parent injector with the new resources provided to it.

Imagine a tree of injectors; there is a single root injector and then a child injector for each lazy loaded component or route.

This child injector gets populated with the providers listed in the corresponding provider arrays.

Any component created within a lazy loaded context, such as by router navigation, gets its own local instance of child provided services in addition to those service in the parent injectors (up to and including the root application injector).

If a child provider has the same provider name (e.g., the same service class name) as a resource in a parent injector, it "shadows" the parent resource. The child injector injects its instance of the resource; the instances created for the parent injectors are inaccessible.

Although you can provide services by lazy loading, not all services can be lazy loaded.
Some services, such as the Router, only work properly in the root injector;
the Router works with the browser's global location object and you don't want two routers competing for that resource.

## Limiting provider scope with components

Another way to limit provider scope is by adding the service to the component's `providers` array.

Providing a service in the component creates a _new service instance_ when the component is created
and limits access to that service instance to that component and its descendants.
Other components outside that component scope cannot access it.

<code-example header="src/app/users.component.ts" path="providers/src/app/users.component.ts" region="component-providers"></code-example>

Angular destroys the service when the providing component is destroyed.

This can be useful when want to interact with a service in multiple components simultaneously and each component's service instance must have its own internal state.

## Providing services in NgModules

<div class="alert is-critical">

  The previous provider discussion applies to both "Standalone" and NgModule applications.
  This section is only relevant for applications built with NgModules.

</div>

Generally, provide services the whole application needs in the root module and scope services by providing them in lazy loaded modules.

The router works at the root level so if you put providers in a component, even `AppComponent`, lazy loaded modules, which rely on the router, can't see them.

<!-- KW--Make a diagram here -->
Register a provider with a component when you must limit a service instance to a component and its component tree, that is, its child components.
For example, a user editing component, `UserEditorComponent`, that needs a private copy of a caching `UserService` should register the `UserService` with the `UserEditorComponent`.
Then each new instance of the `UserEditorComponent` gets its own cached service instance.

<a id="singleton-services"></a>
<a id="component-child-injectors"></a>

## Limiting provider scope by lazy loading modules

It's also possible to specify that a service should be provided in a particular `@NgModule`.

For example, if you don't want `UserService` to be available to applications unless they import a `UserModule` you've created, you can specify that the service should be provided in the module:

<code-example header="src/app/user.service.ts" path="providers/src/app/user.service.1.ts"></code-example>

The example above shows the preferred way to provide a service in a module.
This method is preferred because it enables tree-shaking of the service if nothing injects it.
If it's not possible to specify in the service which module should provide it, you can also declare a provider for the service within the module:

<code-example header="src/app/user.module.ts" path="providers/src/app/user.module.ts"></code-example>

As of Angular version 9, you can provide a new instance of a service with each lazy loaded module.
The following code adds this functionality to `UserService`.

<code-example header="src/app/user.service.ts" path="providers/src/app/user.service.2.ts"></code-example>

With `providedIn: 'any'`, all eagerly loaded modules share a singleton instance; however, lazy loaded modules each get their own unique instance, as shown in the following diagram.

<div class="lightbox">

<img alt="any-provider-scope" class="left" src="generated/images/guide/providers/any-provider.svg">

</div>

When the Angular router lazy-loads a module, it creates a new injector.
This injector is a child of the root application injector.

### Injector hierarchy and service instances

Services are singletons within the scope of an injector, which means there is at most one instance of a service in a given injector.

Angular DI has a [hierarchical injection system](guide/hierarchical-dependency-injection), which means that nested injectors can create their own service instances.

Imagine a tree of injectors; there is a single root injector and then a child injector for each lazy loaded module.
This child injector gets populated with all the module-specific providers, if any. 
Look up resolution for every provider follows the [rules of dependency injection hierarchy](guide/hierarchical-dependency-injection#resolution-rules). 

Whenever Angular creates a new instance of a component that has `providers` specified in `@Component()`, it also creates a new child injector for that instance.

Child modules and component injectors are independent of each other, and create their own separate instances of the provided services.
When Angular destroys an NgModule or component instance, it also destroys that injector and that injector's service instances.


For more information, see [Hierarchical injectors](guide/hierarchical-dependency-injection).
You may also be interested in [Dependency providers](guide/dependency-injection-providers).

### More on providers and NgModules

You may also be interested in:

*   [Singleton Services](guide/singleton-services), which elaborates on the concepts covered on this page
*   [Lazy Loading Modules](guide/lazy-loading-ngmodules)
*   [NgModule FAQ](guide/ngmodule-faq)

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-09-30
