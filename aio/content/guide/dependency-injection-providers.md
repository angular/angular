# Dependency providers

By configuring providers, you can make services available to the parts of your application that need them.

A dependency [provider](guide/glossary#provider) configures an injector with a [DI token](guide/glossary#di-token), which that injector uses to provide the runtime version of a dependency value.

## Specifying a provider token

If you specify the service class as the provider token, the default behavior is for the injector to instantiate that class with `new`.

In the following example, the `Logger` class provides a `Logger` instance.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

You can, however, configure an injector with an alternative provider in order to deliver some other object that provides the needed logging functionality.

You can configure an injector with a service class, you can provide a substitute class, an object, or a factory function.


{@a token}

{@a injection-token}

## Dependency injection tokens

When you configure an [injector](guide/glossary#injector) with a [provider](guide/glossary#provider), you are associating that provider with a [dependency injection token](guide/glossary#di-token), or DI token.
The injector allows Angular to create a map of any internal dependencies.
The DI token acts as a key to that map.

The dependency value is an instance, and the class type serves as a lookup key.
Here, the injector uses the `HeroService` type as the token for looking up `heroService`.

<code-example path="dependency-injection/src/app/injector.component.ts" region="get-hero-service" header="src/app/injector.component.ts"></code-example>

When you define a constructor parameter with the `HeroService` class type, Angular knows to inject the service associated with that `HeroService` class token:

<code-example path="dependency-injection/src/app/heroes/hero-list.component.ts" region="ctor-signature" header="src/app/heroes/hero-list.component.ts">
</code-example>

Though classes provide many dependency values, the expanded `provide` object lets you associate different kinds of providers with a DI token.


{@a provide}

## Defining providers

The class provider syntax is a shorthand expression that expands into a provider configuration, defined by the [`Provider` interface](api/core/Provider).
The following example is the class provider syntax for providing a `Logger` class in the `providers` array.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

Angular expands the `providers` value into a full provider object as follows.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-3" >
</code-example>

The expanded provider configuration is an object literal with two properties:

* The `provide` property holds the [token](#token)
that serves as the key for both locating a dependency value and configuring the injector.

* The second property is a provider definition object, which tells the injector how to create the dependency value.
The provider-definition key can be `useClass`, as in the example.
It can also be `useExisting`, `useValue`, or `useFactory`.
Each of these keys provides a different type of dependency, as discussed below.

{@a class-provider}

## Specifying an alternative class provider

Different classes can provide the same service.
For example, the following code tells the injector to return a `BetterLogger` instance when the component asks for a logger using the `Logger` token.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-4" >
</code-example>

{@a class-provider-dependencies}

### Configuring class providers with dependencies

If the alternative class providers have their own dependencies, specify both providers in the `providers` metadata property of the parent module or component.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-5"></code-example>

In this example, `EvenBetterLogger` displays the user name in the log message.
This logger gets the user from an injected `UserService` instance.

<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger"></code-example>

The injector needs providers for both this new logging service and its dependent `UserService`.

{@a aliased-class-providers}

### Aliasing class providers

To alias a class provider, specify the alias and the class provider in the `providers` array with the `useExisting` property.

In the following example, the injector injects the singleton instance of `NewLogger` when the component asks for either the new or the old logger.
In this way, `OldLogger` is an alias for `NewLogger`.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b"></code-example>

Be sure you don't alias `OldLogger` to `NewLogger` with `useClass`, as this creates two different `NewLogger` instances.


{@a provideparent}


## Aliasing a class interface

Generally, writing variations of the same parent alias provider uses [forwardRef](guide/dependency-injection-in-action#forwardref) as follows.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers" header="dependency-injection-in-action/src/app/parent-finder.component.ts"></code-example>

To streamline your code, you can extract that logic into a helper function using the `provideParent()` helper function.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-the-parent" header="dependency-injection-in-action/src/app/parent-finder.component.ts"></code-example>

Now you can add a parent provider to your components that's easier to read and understand.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alice-providers" header="dependency-injection-in-action/src/app/parent-finder.component.ts"></code-example>


### Aliasing multiple class interfaces

To alias multiple parent types, each with its own class interface token, configure `provideParent()` to accept more arguments.

Here's a revised version that defaults to `parent` but also accepts an optional second parameter for a different parent class interface.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-parent" header="dependency-injection-in-action/src/app/parent-finder.component.ts"></code-example>

Next, to use `provideParent()` with a different parent type, provide a second argument, here `DifferentParent`.

<code-example path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="beth-providers" header="dependency-injection-in-action/src/app/parent-finder.component.ts"></code-example>


{@a value-provider}

## Injecting an object

To inject an object, configure the injector with the `useValue` option.
The following provider object uses the `useValue` key to associate the variable with the `Logger` token.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7"></code-example>

In this example, `SilentLogger` is an object that fulfills the logger role.

<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger"></code-example>


{@a non-class-dependencies}

### Injecting a configuration object

A common use case for object literals is a configuration object.
The following configuration object includes the title of the application and the address of a web API endpoint.

<code-example path="dependency-injection/src/app/app.config.ts" region="config" header="src/app/app.config.ts (excerpt)"></code-example>

To provide and inject the configuration object, specify the object in the `@NgModule()` `providers` array.

<code-example path="dependency-injection/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)"></code-example>

{@a injectiontoken}

### Using an `InjectionToken` object

You can define and use an `InjectionToken` object for choosing a provider token for non-class dependencies.
The following example defines a token, `APP_CONFIG` of the type `InjectionToken`.

<code-example path="dependency-injection/src/app/app.config.ts" region="token" header="src/app/app.config.ts"></code-example>

The optional type parameter, `<AppConfig>`, and the token description, `app.config`, specify the token's purpose.

Next, register the dependency provider in the component using the `InjectionToken` object of `APP_CONFIG`.

<code-example path="dependency-injection/src/app/providers.component.ts" header="src/app/providers.component.ts" region="providers-9"></code-example>

Now you can inject the configuration object into the constructor with `@Inject()` parameter decorator.

<code-example path="dependency-injection/src/app/app.component.2.ts" region="ctor" header="src/app/app.component.ts"></code-example>

{@a di-and-interfaces}

#### Interfaces and dependency injection

Though the TypeScript `AppConfig` interface supports typing within the class, the `AppConfig` interface plays no role in dependency injection.
In TypeScript, an interface is a design-time artifact, and doesn't have a runtime representation, or token, that the DI framework can use.

When the transpiler changes TypeScript to JavaScript, the interface disappears because JavaScript doesn't have interfaces.

Since there is no interface for Angular to find at runtime, the interface cannot be a token, nor can you inject it.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface"></code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface"></code-example>


{@a factory-provider}
{@a factory-providers}

## Using factory providers

To create a changeable, dependent value based on information unavailable before run time, you can use a factory provider.

In the following example, only authorized users should see secret heroes in the `HeroService`.
Authorization can change during the course of a single application session, as when a different user logs in .

To keep security-sensitive information in `UserService` and out of `HeroService`, give the `HeroService` constructor a boolean flag to control display of secret heroes.

<code-example path="dependency-injection/src/app/heroes/hero.service.ts" region="internals" header="src/app/heroes/hero.service.ts (excerpt)"></code-example>

To implement the `isAuthorized` flag, use a factory provider to create a new logger instance for `HeroService`.

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="factory" header="src/app/heroes/hero.service.provider.ts (excerpt)"></code-example>

The factory function has access to `UserService`.
You inject both `Logger` and `UserService` into the factory provider so the injector can pass them along to the factory function.

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="provider" header="src/app/heroes/hero.service.provider.ts (excerpt)"></code-example>

* The `useFactory` field specifies that the provider is a factory function whose implementation is `heroServiceFactory`.

* The `deps` property is an array of [provider tokens](#token).
The `Logger` and `UserService` classes serve as tokens for their own class providers.
The injector resolves these tokens and injects the corresponding services into the matching `heroServiceFactory` factory function parameters.

Capturing the factory provider in the exported variable, `heroServiceProvider`, makes the factory provider reusable.

The following side-by-side example shows how `heroServiceProvider` replaces `HeroService` in the `providers` array.

<code-tabs>

  <code-pane header="src/app/heroes/heroes.component (v3)" path="dependency-injection/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component (v2)" path="dependency-injection/src/app/heroes/heroes.component.1.ts">
  </code-pane>

</code-tabs>

