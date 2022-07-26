# Configuring a dependency using DI tokens

You define as an Angular injection token to identify a category of dependencies. Injecting an object Dis an example of configuring a dependency using DI tokens. 

To inject an object, configure the injector with the `useValue` option.
The following provider object uses the `useValue` key to associate the variable with the `Logger` token.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7"></code-example>

In this example, `SilentLogger` is an object that fulfills the logger role.

<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger"></code-example>


{@a non-class-dependencies}

## Injecting a configuration object

A common use case for object literals is a configuration object.
The following configuration object includes the title of the application and the address of a web API endpoint.

<code-example path="dependency-injection/src/app/app.config.ts" region="config" header="src/app/app.config.ts (excerpt)"></code-example>

To provide and inject the configuration object, specify the object in the `@NgModule()` `providers` array.

<code-example path="dependency-injection/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)"></code-example>

{@a injectiontoken}

## Using an `InjectionToken` object

Define and use an `InjectionToken` object for choosing a provider token for non-class dependencies. The following example defines a token, `APP_CONFIG` of the type `InjectionToken`.

<code-example path="dependency-injection/src/app/app.config.ts" region="token" header="src/app/app.config.ts"></code-example>

The optional type parameter, `<AppConfig>`, and the token description, `app.config`, specify the token's purpose.

Next, register the dependency provider in the component using the `InjectionToken` object of `APP_CONFIG`.

<code-example path="dependency-injection/src/app/providers.component.ts" header="src/app/providers.component.ts" region="providers-9"></code-example>

Now, inject the configuration object into the constructor with `@Inject()` parameter decorator.

<code-example path="dependency-injection/src/app/app.component.2.ts" region="ctor" header="src/app/app.component.ts"></code-example>

{@a di-and-interfaces}

### Interfaces and DI

Though the TypeScript `AppConfig` interface supports typing within the class, the `AppConfig` interface plays no role in DI.
In TypeScript, an interface is a design-time artifact, and doesn't have a runtime representation, or token, that the DI framework can use.

When the transpiler changes TypeScript to JavaScript, the interface disappears because JavaScript doesn't have interfaces.

Because there is no interface for Angular to find at runtime, the interface cannot be a token, nor can you inject it.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface"></code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface"></code-example>


{@a factory-provider}
{@a factory-providers}

## Using factory providers

To create a changeable, dependent value based on information unavailable before run time, use a factory provider.

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

* The `deps` property is an array of [provider tokens](guide/dependency-injection-providers#Specifying-a-provider-token).
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

