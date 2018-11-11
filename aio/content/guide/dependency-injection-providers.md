<!--
# Dependency Providers
-->
# 의존성 프로바이더 (Dependency Providers)

<!--
A dependency [provider](guide/glossary#provider) configures an injector
with a [DI token](guide/glossary#di-token),
which that injector uses to provide the concrete, runtime version of a dependency value.
The injector relies on the provider configuration to create instances of the dependencies
that it injects into components, directives, pipes, and other services.
-->
의존성 [프로바이더](guide/glossary#provider)와 [의존성 주입 토큰](guide/glossary#di-token)을 연결하면 인젝터에 의존성 객체를 등록할 수 있습니다.
그러면 프로바이더에 지정된 방법대로 인젝터가 의존성 객체의 인스턴스를 생성하며, 이 인스턴스는 컴포넌트나 디렉티브, 파이프, 서비스와 같이 의존성 객체가 필요한 곳에 주입됩니다.

<!--
You must configure an injector with a provider, or it won't know how to create the dependency.  
The most obvious way for an injector to create an instance of a service class is with the class itself. 
If you specify the service class itself as the provider token, the default behavior is for the injector to instantiate that class with `new`. 
-->
그래서 의존성 객체를 주입하려면 인젝터에 프로바이더를 꼭 등록해야 합니다.
서비스 클래스를 인스턴스로 등록하는 방법 중 가장 간단한 방법은 클래스에서 직접 프로바이더를 등록하는 것입니다.
이렇게 등록하면 서비스 클래스 이름을 바로 프로바이더 토큰으로 사용할 수 있으며, 인젝터는 `new` 키워드를 사용해서 이 서비스 클래스의 인스턴스를 생성합니다.

<!--
In the following typical example, the `Logger` class itself provides a `Logger` instance. 
-->
이렇게 `Logger` 클래스를 직접 프로바이더에 등록하려면 다음과 같이 작성하면 됩니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

<!--
You can, however, configure an injector with an alternative provider, 
in order to deliver some other object that provides the needed logging functionality.
For instance:
* You can provide a substitute class.

* You can provide a logger-like object.

* Your provider can call a logger factory function.
-->
이 외에도 프로바이더는 다양한 방법으로 등록할 수 있습니다. 필요하다면 다른 클래스로 `Logger` 클래스를 대체할 수도 있습니다.
프로바이더는 이렇게 등록할 수도 있습니다:

* 클래스 프로바이더로 다른 클래스를 지정할 수 있습니다.

* `Logger`와 비슷한 객체를 프로바이더로 등록할 수 있습니다.

* 팩토리 함수를 실행하고 받은 반환값을 프로바이더로 등록할 수 있습니다.

{@a provide}

<!--
## The `Provider` object literal
-->
## `Provider` 객체 리터럴

<!--
The class-provider syntax is a shorthand expression that expands
into a provider configuration, defined by the [`Provider` interface](api/core/Provider).
The following code snippets shows how a class that is given as the `providers` value is expanded into a full provider object.
-->
클래스를 바로 프로바이더 배열에 등록하는 문법은 [`Provider` 인터페이스](api/core/Provider)에 정의된 문법을 짧게 줄인 것입니다.
그리고 이 문법은 짧게 줄이지 않고 모두 풀어서 등록할 수도 있습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-3" >
</code-example>

<!--
The expanded provider configuration is an object literal with two properties.
-->
클래스 프로바이더를 등록하는 문법을 풀어쓰지 않으면 프로퍼티 2개로 구성된 객체 리터럴을 사용합니다.

<!--
* The `provide` property holds the [token](guide/dependency-injection#token)
that serves as the key for both locating a dependency value and configuring the injector.
-->
* `provide` 프로퍼티에는 [토큰](guide/dependency-injection#token)을 지정합니다. 이 토큰은 의존성 객체의 타입을 지정하는 곳에도 사용되고 인젝터에서 이 객체를 찾을 때도 사용됩니다.

<!--
* The second property is a provider definition object, which tells the injector how to create the dependency value. 
The provider-definition key can be `useClass`, as in the example.
It can also be `useExisting`, `useValue`, or `useFactory`.
Each of these keys provides a different type of dependency, as discussed below. 
-->
* 인젝터가 의존성 객체의 인스턴스를 생성하는 방법은 두번째 프로퍼티로 지정합니다.
클래스를 직접 인젝터에 등록하는 경우에는 `useClass`를 사용하며, 이 외에도 `useExisting`, `useValue`, `useFactory`를 사용하는 경우도 있습니다.
각각에 대해서는 이어지는 내용에서 자세하게 살펴봅시다.

{@a class-provider}

<!--
## Alternative class providers
-->
## 대체 클래스 프로바이더

<!--
Different classes can provide the same service.
For example, the following code tells the injector
to return a `BetterLogger` instance when the component asks for a logger
using the `Logger` token.
-->
어떤 서비스의 이름으로 다른 클래스를 프로바이더로 등록할 수 있습니다.
그래서 인젝터가 `Logger` 토큰으로 의존성 객체를 요청받았을 때 `BetterLogger` 인스턴스를 제공하도록 설정할 수도 있습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-4" >
</code-example>

{@a class-provider-dependencies}

<!--
### Class providers with dependencies
-->
### 추가 의존성이 있는 클래스의 프로바이더

<!--
Another class, `EvenBetterLogger`, might display the user name in the log message.
This logger gets the user from an injected `UserService` instance.
-->
`EvenBetterLogger`는 로그를 출력할 때 사용자의 이름도 함께 출력하는 클래스입니다.
그리고 이 때 출력하는 사용자의 이름은 주입받은 `UserService`에서 참조합니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger"  linenums="false">
</code-example>

<!--
The injector needs providers for both this new logging service and its dependent `UserService`. Configure this alternative logger with the `useClass` provider-definition key, like `BetterLogger`. The following array specifies both providers in the `providers` metadata option of the parent module or component.
-->
이제 인젝터에는 `EventBetterLogger`와 `UserService`의 프로바이더가 모두 등록되어야 합니다. 그리고 이 때 어떤 클래스의 프로바이더를 다른 클래스로 지정하려면 `useClass` 프로바이더-정의 키를 사용해서 지정할 수 있습니다. 이 내용은 다음과 같이 구현할 수 있습니다. 이 코드는 부모 모듈이나 컴포넌트의 `providers` 메타데이터 옵션에 사용됩니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-5"  linenums="false">
</code-example>

{@a aliased-class-providers}

<!--
### Aliased class providers
-->
### 별칭(aliased) 클래스 프로바이더

<!--
Suppose an old component depends upon the `OldLogger` class.
`OldLogger` has the same interface as `NewLogger`, but for some reason
you can't update the old component to use it. 
-->
이전에 사용하던 컴포넌트에 `OldLogger` 클래스가 의존성으로 주입된다고 합시다.
`OldLogger`의 인터페이스는 `NewLogger`와 같지만, 어떤 이유로 이 컴포넌트를 수정할 수가 없는 상황입니다.

<!--
When the old component logs a message with `OldLogger`,
you want the singleton instance of `NewLogger` to handle it instead.
In this case, the dependency injector should inject that singleton instance
when a component asks for either the new or the old logger.
`OldLogger` should be an *alias* for `NewLogger`.
-->
이 때 `OldLogger`를 주입받는 코드는 수정하지 않은 상태로 이 컴포넌트도 `NewLogger`를 사용하도록 하려고 합니다. 이 경우에 `NewLogger`와 `OldLogger`의 프로바이더를 모두 인젝터가 관리하면서 이전 로거와 새로운 로거를 모두 사용할 수 있도록 제공해야 합니다.
그리고 `OldLogger`를 주입받도록 요청받았을 때 `NewLogger`를 대신 주입하려고 합니다. 결국 `OldLogger`는 `NewLogger`의 *또 다른 이름* 이라고 할 수 있습니다.

<!--
If you try to alias `OldLogger` to `NewLogger` with `useClass`, you end up with two different `NewLogger` instances in your app. 
-->
이 때 프로바이더에 `useClass`를 사용하면 `OldLogger`를 `NewLogger`로 대체하는 것이 아니라 `NewLogger` 인스턴스를 두 개로 나누는 방식으로 등록됩니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6a" linenums="false">
</code-example>

<!--
To make sure there is only one instance of `NewLogger`, alias `OldLogger` with the `useExisting` option.
-->
그래서 `NewLogger`의 인스턴스를 하나로 유지하려면 `oldLogger` 토큰에 `useExisting` 옵션을 사용해야 합니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b" linenums="false">
</code-example>

{@a value-provider}

## Value providers

Sometimes it's easier to provide a ready-made object rather than ask the injector to create it from a class. 
To inject an object you have already created, 
configure the injector with the `useValue` option

The following code defines a variable that creates such an object to play the logger role.

<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger"  linenums="false">
</code-example>

The following provider object uses the `useValue` key to associate the variable with the `Logger` token.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7" linenums="false">
</code-example>

{@a non-class-dependencies}

### Non-class dependencies

Not all dependencies are classes.
Sometimes you want to inject a string, function, or object.

Apps often define configuration objects with lots of small facts,
like the title of the application or the address of a web API endpoint.
These configuration objects aren't always instances of a class.
They can be object literals, as shown in the following example.

<code-example path="dependency-injection/src/app/app.config.ts" region="config" header="src/app/app.config.ts (excerpt)" linenums="false">
</code-example>

{@a interface-not-valid-token}

**TypeScript interfaces are not valid tokens**

The `HERO_DI_CONFIG` constant conforms to the `AppConfig` interface. 
Unfortunately, you cannot use a TypeScript interface as a token.
In TypeScript, an interface is a design-time artifact, and doesn't have a runtime representation (token) that the DI framework can use. 

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface"  linenums="false">
</code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface"  linenums="false">
</code-example>

<div class="alert is-helpful">

This might seem strange if you're used to dependency injection in strongly typed languages where an interface is the preferred dependency lookup key.
However, JavaScript, doesn't have interfaces, so when TypeScript is transpiled to JavaScript, the interface disappears.
There is no interface type information left for Angular to find at runtime.

</div>

One alternative is to provide and inject the configuration object in an NgModule like `AppModule`.

<code-example path="dependency-injection/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)"></code-example>

Another solution to choosing a provider token for non-class dependencies is
to define and use an `InjectionToken` object.
The following example shows how to define such a token.

<code-example path="dependency-injection/src/app/app.config.ts" region="token" header="src/app/app.config.ts" linenums="false">
</code-example>

The type parameter, while optional, conveys the dependency's type to developers and tooling.
The token description is another developer aid.

Register the dependency provider using the `InjectionToken` object:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9"  linenums="false">
</code-example>

Now you can inject the configuration object into any constructor that needs it, with
the help of an `@Inject()` parameter decorator.

<code-example path="dependency-injection/src/app/app.component.2.ts" region="ctor" header="src/app/app.component.ts" linenums="false">
</code-example>

<div class="alert is-helpful">

Although the `AppConfig` interface plays no role in dependency injection,
it supports typing of the configuration object within the class.

</div>


{@a factory-provider}
{@a factory-providers}

## Factory providers

Sometimes you need to create a dependent value dynamically,
based on information you won't have until run time. 
For example, you might need information that changes repeatedly in the course of the browser session.
Also, your injectable service might not have independent access to the source of the information.

In cases like this you can use a *factory provider*.
Factory providers can also be useful when creating an instance of a dependency from
a third-party library that wasn't designed to work with DI.

For example, suppose `HeroService` must hide *secret* heroes from normal users.
Only authorized users should see secret heroes.

Like  `EvenBetterLogger`, `HeroService` needs to know if the user is authorized to see secret heroes.
That authorization can change during the course of a single application session,
as when you log in a different user.

Let's say you don't want to inject `UserService` directly into `HeroService`, because you don't want to complicate that service with security-sensitive information.
`HeroService` won't have direct access to the user information to decide
who is authorized and who isn't.

To resolve this, we give the `HeroService` constructor a boolean flag to control display of secret heroes.

<code-example path="dependency-injection/src/app/heroes/hero.service.ts" region="internals" header="src/app/heroes/hero.service.ts (excerpt)" linenums="false">
</code-example>

You can inject `Logger`, but you can't inject the  `isAuthorized` flag. Instead, you can use a factory provider to create a new logger instance for `HeroService`.

A factory provider needs a factory function.

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="factory" header="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

Although `HeroService` has no access to `UserService`, the factory function does.
You inject both `Logger` and `UserService` into the factory provider
and let the injector pass them along to the factory function.

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="provider" header="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

* The `useFactory` field tells Angular that the provider is a factory function whose implementation is `heroServiceFactory`.

* The `deps` property is an array of [provider tokens](guide/dependency-injection#token).
The `Logger` and `UserService` classes serve as tokens for their own class providers.
The injector resolves these tokens and injects the corresponding services into the matching factory function parameters.

Notice that you captured the factory provider in an exported variable, `heroServiceProvider`.
This extra step makes the factory provider reusable.
You can configure a provider of `HeroService` with this variable wherever you need it. 
In this sample, you need it only in `HeroesComponent`,
where `heroServiceProvider` replaces `HeroService` in the metadata `providers` array.

The following shows the new and the old implementations side-by-side.

<code-tabs>

  <code-pane header="src/app/heroes/heroes.component (v3)" path="dependency-injection/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component (v2)" path="dependency-injection/src/app/heroes/heroes.component.1.ts">
  </code-pane>

</code-tabs>

## Predefined tokens and multiple providers

Angular provides a number of built-in injection-token constants that you can use to customize the behavior of 
various systems. 

For example, you can use the following built-in tokens as hooks into the framework’s bootstrapping and initialization process.  
A provider object can associate any of these injection tokens with one or more callback functions that take app-specific initialization actions.

* [PLATFORM_INITIALIZER](api/core/PLATFORM_INITIALIZER): Callback is invoked when a platform is initialized.

* [APP_BOOTSTRAP_LISTENER](api/core/APP_BOOTSTRAP_LISTENER): Callback is invoked for each component that is bootstrapped. The handler function receives the ComponentRef instance of the bootstrapped component.

* [APP_INITIALIZER](api/core/APP_INITIALIZER): Callback is invoked before an app is initialized. All registered initializers can optionally return a Promise. All initializer functions that return Promises must be resolved before the application is bootstrapped. If one of the initializers fails to resolves, the application is not bootstrapped.

The provider object can have a third option, `multi: true`, which you can use with `APP_INITIALIZER`
to register multiple handlers for the provide event.

For example, when bootstrapping an application, you can register many initializers using the same token.

```
export const APP_TOKENS = [
 { provide: PLATFORM_INITIALIZER, useFactory: platformInitialized, multi: true    },
 { provide: APP_INITIALIZER, useFactory: delayBootstrapping, multi: true },
 { provide: APP_BOOTSTRAP_LISTENER, useFactory: appBootstrapped, multi: true },
];
```

Multiple providers can be associated with a single token in other areas as well. 
For example, you can register a custom form validator using the built-in [NG_VALIDATORS](api/forms/NG_VALIDATORS) token, 
and provide multiple instances of a given validator provider by using the `multi: true` property in the provider object.
Angular adds your custom validators to the existing collection.

The Router also makes use of multiple providers associated with a single token. 
When you provide multiple sets of routes using [RouterModule.forRoot](api/router/RouterModule#forroot)
and [RouterModule.forChild](api/router/RouterModule#forchild) in a single module,
the [ROUTES](api/router/ROUTES) token combines all the different provided sets of routes into a single value.

<div class="alert is-helpful">

Search for [Constants in API documentation](api?type=const) to find more built-in tokens. 

</div>

{@a tree-shakable-provider}
{@a tree-shakable-providers}

<!--
## Tree-shakable providers
-->
## 트리 셰이킹 대상이 되는 프로바이더

Tree shaking refers to a compiler option that removes code from the final bundle if that code not referenced in an application.
When providers are tree-shakable, the Angular compiler removes the associated
services from the final output when it determines that they are not used in your application.
This significantly reduces the size of your bundles.

<div class="alert is-helpful">

Ideally, if an application isn't injecting a service, it shouldn't be included in the final output. 
However, Angular has to be able to identify at build time whether the service will be required or not. 
Because it's always possible to inject a service directly using `injector.get(Service)`, 
Angular can't identify all of the places in your code where this injection could happen, 
so it has no choice but to include the service in the injector. 
Thus, services provided at the NgModule or component level are not tree-shakable.

</div>

The following example of non-tree-shakable providers in Angular configures a service provider for the injector of an NgModule.

<code-example path="dependency-injection/src/app/tree-shaking/service-and-module.ts"  header="src/app/tree-shaking/service-and-modules.ts" linenums="false"> </code-example>

This module can then be imported into your application module 
to make the service available for injection in your app, 
as shown in the following example.

<code-example path="dependency-injection/src/app/tree-shaking/app.module.ts"  header="src/app/tree-shaking/app.modules.ts" linenums="false"> </code-example>

When `ngc` runs, it compiles `AppModule` into a module factory, which contains definitions for all the providers declared in all the modules it includes. At runtime, this factory becomes an injector that instantiates these services.

Tree-shaking doesn't work here because Angular can't decide to exclude one chunk of code (the provider definition for the service within the module factory) based on whether another chunk of code (the service class) is used. To make services tree-shakable, the information about how to construct an instance of the service (the provider definition) needs to be a part of the service class itself.

### Creating tree-shakable providers

You can make a provider tree-shakable by specifying it in the `@Injectable()` decorator on the service itself, rather than in the metadata for the NgModule or component that depends on the service.

The following example shows the tree-shakable equivalent to the `ServiceModule` example above.

<code-example path="dependency-injection/src/app/tree-shaking/service.ts"  header="src/app/tree-shaking/service.ts" linenums="false"> </code-example>

The service can be instantiated by configuring a factory function, as in the following example.

<code-example path="dependency-injection/src/app/tree-shaking/service.0.ts"  header="src/app/tree-shaking/service.0.ts" linenums="false"> </code-example>

<div class="alert is-helpful">

To override a tree-shakable provider, configure the injector of a specific NgModule or component with another provider, using the `providers: []` array syntax of the `@NgModule()` or `@Component()` decorator.

</div>