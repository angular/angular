# Configuring dependency providers

The Creating and injecting services topic describes how to use classes as dependencies. In addition to classes, you can also use other values such as Boolean, string, date, and objects as dependencies. Angular DI provides the necessary APIs to make the dependency configuration flexible, so you can make those values available in DI.

<comment>
In order for Angular to know how to create a dependency, it needs a provider factory function. A provider factory function is a plain function that Angular can call to create a dependency. By configuring providers, you can make services available to the parts of your application that need them.

A dependency [provider](guide/glossary#provider) configures an injector with a [DI token](guide/glossary#di-token), which that injector uses to provide the runtime version of a dependency value.


## Specifying a provider token

If you specify the service class as the provider token, the default behavior is for the injector to instantiate that class using the `new` operator.

In the following example, the `Logger` class provides a `Logger` instance.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger"></code-example>

You can, however, configure a DI to use a different class or any other different value to associate with the `Logger` class. So when the `Logger` is injected, this new value is used instead.

In fact, the class provider syntax is a shorthand expression that expands into a provider configuration, defined by the Provider interface.

Angular expands the providers value in this case into a full provider object as follows:

```
[{ provide: Logger, useClass: Logger }]
```
The expanded provider configuration is an object literal with two properties:
* The provide property holds the token that serves as the key for both locating a dependency value and configuring the injector.
* The second property is a provider definition object, which tells the injector how to create the dependency value. The provider-definition key can be one of the following:
    * useClass - this option tells Angular DI to instantiate a provided class when a dependency is injected
    * useExisting - allows you to alias a token and reference any existing one.
    * useFactory - allows you to define a function that constructs a dependency.
    * useValue - provides a static value that should be used as a dependency.

The section below describes how to use the mentioned provider definition keys.


<a id="token"></a>
<a id="injection-token"></a>

## Dependency injection tokens

When you configure an [injector](guide/glossary#injector) with a [provider](guide/glossary#provider), you are associating that provider with a [dependency injection token](guide/glossary#di-token), or DI token.
The injector lets Angular create a map of any internal dependencies.
The DI token acts as a key to that map.

The dependency value is an instance, and the class type serves as a lookup key.
Here, the injector uses the `HeroService` type as the token for looking up `heroService`.

<code-example header="src/app/injector.component.ts" path="dependency-injection/src/app/injector.component.ts" region="get-hero-service"></code-example>

When you define a constructor parameter with the `HeroService` class type, Angular knows to inject the service associated with that `HeroService` class token:

<code-example header="src/app/heroes/hero-list.component.ts" path="dependency-injection/src/app/heroes/hero-list.component.ts" region="ctor-signature"></code-example>

Though classes provide many dependency values, the expanded `provide` object lets you associate different kinds of providers with a DI token.

<a id="provide"></a>

## Defining providers

The class provider syntax is a shorthand expression that expands into a provider configuration, defined by the [`Provider` interface](api/core/Provider).
The following example is the class provider syntax for providing a `Logger` class in the `providers` array.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger"></code-example>

Angular expands the `providers` value into a full provider object as follows.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-3" ></code-example>

The expanded provider configuration is an object literal with two properties:

*   The `provide` property holds the [token](#token) that serves as the key for both locating a dependency value and configuring the injector.

*   The second property is a provider definition object, which tells the injector how to create the dependency value.
    The provider-definition key can be `useClass`, as in the example.
    It can also be `useExisting`, `useValue`, or `useFactory`.
    Each of these keys provides a different type of dependency, as discussed in the following section.

<a id="class-provider"></a>

## Specifying an alternative class provider

Different classes can provide the same service.
For example, the following code tells the injector to return a `BetterLogger` instance when the component asks for a logger using the `Logger` token.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-4" ></code-example>

<a id="class-provider-dependencies"></a>

### Configuring class providers with dependencies

If the alternative class providers have their own dependencies, specify both providers in the `providers` metadata property of the parent module or component.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-5"></code-example>

In this example, `EvenBetterLogger` displays the user name in the log message.
This logger gets the user from an injected `UserService` instance.

<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger"></code-example>

The injector needs providers for both this new logging service and its dependent `UserService`.

<a id="aliased-class-providers"></a>

### Aliasing class providers

To alias a class provider, specify the alias and the class provider in the `providers` array with the `useExisting` property.

In the following example, the injector injects the singleton instance of `NewLogger` when the component asks for either the new or the old logger.
In this way, `OldLogger` is an alias for `NewLogger`.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b"></code-example>

Be sure you don't alias `OldLogger` to `NewLogger` with `useClass`, as this creates two different `NewLogger` instances.

<a id="provideparent"></a>

## Aliasing a class interface

Generally, writing variations of the same parent alias provider uses [forwardRef](guide/dependency-injection-in-action#forwardref) as follows.

<code-example header="dependency-injection-in-action/src/app/parent-finder.component.ts" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alex-providers"></code-example>

To streamline your code, extract that logic into a helper function using the `provideParent()` helper function.

<code-example header="dependency-injection-in-action/src/app/parent-finder.component.ts" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-the-parent"></code-example>

Now you can add a parent provider to your components that's easier to read and understand.

<code-example header="dependency-injection-in-action/src/app/parent-finder.component.ts" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="alice-providers"></code-example>

### Aliasing multiple class interfaces

To alias multiple parent types, each with its own class interface token, configure `provideParent()` to accept more arguments.

Here's a revised version that defaults to `parent` but also accepts an optional second parameter for a different parent class interface.

<code-example header="dependency-injection-in-action/src/app/parent-finder.component.ts" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="provide-parent"></code-example>

Next, to use `provideParent()` with a different parent type, provide a second argument, here `DifferentParent`.

<code-example header="dependency-injection-in-action/src/app/parent-finder.component.ts" path="dependency-injection-in-action/src/app/parent-finder.component.ts" region="beth-providers"></code-example>


{@a value-provider}
