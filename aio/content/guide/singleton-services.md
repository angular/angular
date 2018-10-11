# Singleton services

#### Prerequisites:

* A basic understanding of [Bootstrapping](guide/bootstrapping).
* Familiarity with [Providers](guide/providers).

For a sample app using the app-wide singleton service that this page describes, see the
<live-example name="ngmodules"></live-example> showcasing all the documented features of NgModules.

<hr />

## Providing a singleton service

There are two ways to make a service a singleton in Angular:

* Declare that the service should be provided in the application root.
* Include the service in the `AppModule` or in a module that is only imported by the `AppModule`.

Beginning with Angular 6.0, the preferred way to create a singleton services is to specify on the service that it should be provided in the application root. This is done by setting `providedIn` to `root` on the service's `@Injectable` decorator:

<code-example path="providers/src/app/user.service.0.ts"  header="src/app/user.service.0.ts" linenums="false"> </code-example>


For more detailed information on services, see the [Services](tutorial/toh-pt4) chapter of the
[Tour of Heroes tutorial](tutorial).


## `forRoot()`

If a module provides both providers and declarations (components, directives, pipes) then loading it in a child injector such as a route, would duplicate the provider instances. The duplication of providers would cause issues as they would shadow the root instances, which are probably meant to be singletons. For this reason Angular provides a way to separate providers out of the module so that same module can be imported into the root module with `providers` and child modules without `providers`.

1. Create a static method `forRoot()` (by convention) on the module.
2. Place the providers into the `forRoot` method as follows.

<!-- MH: show a simple example how to do that without going to deep into it. -->

To make this more concrete, consider the `RouterModule` as an example. `RouterModule` needs to provide the `Router` service, as well as the `RouterOutlet` directive. `RouterModule` has to be imported by the root application module so that the application has a `Router` and the application has at least one `RouterOutlet`. It also must be imported by the individual route components so that they can place `RouterOutlet` directives into their template for sub-routes.

If the `RouterModule` didn’t have `forRoot()` then each route component would instantiate a new `Router` instance, which would break the application as there can only be one `Router`. For this reason, the `RouterModule` has the `RouterOutlet` declaration so that it is available everywhere, but the `Router` provider is only in the `forRoot()`. The result is that the root application module imports `RouterModule.forRoot(...)` and gets a `Router`, whereas all route components import `RouterModule` which does not include the `Router`.

If you have a module which provides both providers and declarations, use this pattern to separate them out.

A module that adds providers to the application can offer a
facility for configuring those providers as well through the
`forRoot()` method.

`forRoot()` takes a service configuration object and returns a
[ModuleWithProviders](api/core/ModuleWithProviders), which is
a simple object with the following properties:

* `ngModule`: in this example, the `CoreModule` class.
* `providers`: the configured providers.

In the <live-example name="ngmodules">live example</live-example>
the root `AppModule` imports the `CoreModule` and adds the
`providers` to the `AppModule` providers. Specifically,
Angular accumulates all imported providers
before appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever you add explicitly to
the `AppModule` providers takes precedence over the providers
of imported modules.

Import `CoreModule` and use its `forRoot()` method one time, in `AppModule`, because it registers services and you only want to register those services one time in your app. If you were to register them more than once, you could end up with multiple instances of the service and a runtime error.

You can also add a `forRoot()` method in the `CoreModule` that configures
the core `UserService`.

In the following example, the optional, injected `UserServiceConfig`
extends the core `UserService`. If a `UserServiceConfig` exists, the `UserService` sets the user name from that config.

<code-example path="ngmodules/src/app/core/user.service.ts" region="ctor" header="src/app/core/user.service.ts (constructor)" linenums="false">

</code-example>

Here's `forRoot()` that takes a `UserServiceConfig` object:

<code-example path="ngmodules/src/app/core/core.module.ts" region="for-root" header="src/app/core/core.module.ts (forRoot)" linenums="false">

</code-example>

Lastly, call it within the `imports` list of the `AppModule`.

<code-example path="ngmodules/src/app/app.module.ts" region="import-for-root" header="src/app/app.module.ts (imports)" linenums="false">

</code-example>

The app displays "Miss Marple" as the user instead of the default "Sherlock Holmes".

Remember to _import_ `CoreModule` as a Javascript import at the top of the file; don't add it to more than one `@NgModule` `imports` list.

<!-- KW--Does this mean that if we need it elsewhere we only import it at the top? I thought the services would all be available since we were importing it into `AppModule` in `providers`. -->

## Prevent reimport of the `CoreModule`

Only the root `AppModule` should import the `CoreModule`. If a
lazy-loaded module imports it too, the app can generate
[multiple instances](guide/ngmodule-faq#q-why-bad) of a service.

To guard against a lazy-loaded module re-importing `CoreModule`, add the following `CoreModule` constructor.

<code-example path="ngmodules/src/app/core/core.module.ts" region="ctor" header="src/app/core/core.module.ts" linenums="false">

</code-example>

The constructor tells Angular to inject the `CoreModule` into itself.
The injection would be circular if Angular looked for
`CoreModule` in the _current_ injector. The `@SkipSelf`
decorator means "look for `CoreModule` in an ancestor
injector, above me in the injector hierarchy."

If the constructor executes as intended in the `AppModule`,
there would be no ancestor injector that could provide an instance of `CoreModule` and the injector should give up.

By default, the injector throws an error when it can't
find a requested provider.
The `@Optional` decorator means not finding the service is OK.
The injector returns `null`, the `parentModule` parameter is null,
and the constructor concludes uneventfully.

It's a different story if you improperly import `CoreModule` into a lazy-loaded module such as `CustomersModule`.

Angular creates a lazy-loaded module with its own injector,
a _child_ of the root injector.
`@SkipSelf` causes Angular to look for a `CoreModule` in the parent injector, which this time is the root injector.
Of course it finds the instance imported by the root `AppModule`.
Now `parentModule` exists and the constructor throws the error.

Here are the two files in their entirety for reference:

<code-tabs linenums="false">
 <code-pane
   header="app.module.ts"
   path="ngmodules/src/app/app.module.ts">
 </code-pane>
 <code-pane
   header="core.module.ts"
   region="whole-core-module"
   path="ngmodules/src/app/core/core.module.ts">
 </code-pane>
</code-tabs>


<hr>

## More on NgModules

You may also be interested in:
* [Sharing Modules](guide/sharing-ngmodules), which elaborates on the concepts covered on this page.
* [Lazy Loading Modules](guide/lazy-loading-ngmodules).
* [NgModule FAQ](guide/ngmodule-faq).
