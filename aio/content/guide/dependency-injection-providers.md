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
의존성으로 주입할 객체는 [프로바이더](guide/glossary#provider)와 [토큰](guide/glossary#di-token)을 연결하는 방식으로 인젝터에 등록합니다.
그러면 인젝터가 프로바이더에 지정된 방법대로 의존성 객체의 인스턴스를 생성하며, 이 인스턴스는 컴포넌트나 디렉티브, 파이프, 서비스와 같이 의존성 객체가 필요한 곳에 주입됩니다.

<!--
You must configure an injector with a provider, or it won't know how to create the dependency.
The most obvious way for an injector to create an instance of a service class is with the class itself.
If you specify the service class itself as the provider token, the default behavior is for the injector to instantiate that class with `new`.

In the following typical example, the `Logger` class itself provides a `Logger` instance.
-->
그래서 의존성 객체를 주입하려면 인젝터에 프로바이더를 꼭 등록해야 합니다.
서비스 클래스를 인스턴스로 등록하는 방법 중 가장 간단한 방법은 클래스를 선언하면서 직접 프로바이더를 등록하는 것입니다.
이렇게 등록하면 서비스 클래스 이름을 바로 프로바이더 토큰으로 사용할 수 있으며, 인젝터는 `new` 키워드를 사용해서 이 서비스 클래스의 인스턴스를 생성합니다.

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
이 외에도 프로바이더는 다양한 방법으로 등록할 수 있으며, 필요하다면 다른 클래스의 인스턴스로 대체할 수도 있습니다:

* 클래스 프로바이더를 사용하면서 다른 클래스의 인스턴스를 주입할 수 있습니다.

* `Logger`와 형태가 같은 객체를 프로바이더로 등록할 수 있습니다.

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
이 문법은 짧게 줄이지 않고 모두 풀어서 등록할 수도 있습니다.

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
클래스를 직접 인젝터에 등록하는 경우에는 `useClass`를 사용하며, 상황에 따라 `useExisting`, `useValue`, `useFactory`를 사용하는 경우도 있습니다.
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
서비스 클래스 프로바이더는 이 클래스와 다른 이름으로도 등록할 수 있습니다.
그래서 인젝터가 `Logger` 토큰으로 의존성 객체를 요청받았을 때 `BetterLogger` 인스턴스를 제공하도록 설정할 수 있습니다.

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
그리고 이 때 출력하는 사용자의 이름은 `UserService`를 주입 받아서 참조합니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger"  linenums="false">
</code-example>

<!--
The injector needs providers for both this new logging service and its dependent `UserService`. Configure this alternative logger with the `useClass` provider-definition key, like `BetterLogger`. The following array specifies both providers in the `providers` metadata option of the parent module or component.
-->
이제 인젝터에는 `EventBetterLogger`와 `UserService`의 프로바이더가 모두 등록되어야 합니다. 이 때 `useClass` 프로바이더-정의 키를 사용하면 어떤 클래스의 프로바이더를 다른 클래스로 지정할 수 있습니다. 아래 코드는 부모 모듈이나 컴포넌트의 `providers` 메타데이터 옵션에 사용한 예제 코드입니다.

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
이전부터 사용하던 컴포넌트가 있는데, 이 컴포넌트에는 `OldLogger` 클래스가 의존성으로 주입된다고 합시다.
그런데 `OldLogger`와 같은 인터페이스를 갖는 `NewLogger`를 만들었지만, 어떤 이유로 이 컴포넌트 코드는 수정할 수 없는 상황입니다.

<!--
When the old component logs a message with `OldLogger`,
you want the singleton instance of `NewLogger` to handle it instead.
In this case, the dependency injector should inject that singleton instance
when a component asks for either the new or the old logger.
`OldLogger` should be an *alias* for `NewLogger`.
-->
이 때 `OldLogger`를 주입받는 코드는 수정하지 않은 상태로 이 컴포넌트도 `NewLogger`를 사용하도록 하려고 합니다. 이 경우에 `NewLogger`와 `OldLogger`의 프로바이더를 모두 인젝터가 관리하면서 이전 로거와 새로운 로거의 토큰을 모두 등록하면서, `OldLogger`를 주입받도록 요청받았을 때 `NewLogger`를 대신 주입하려고 합니다. 이 상황에서 `OldLogger`는 결국 `NewLogger`의 *또 다른 이름* 이라고 할 수 있습니다.

<!--
If you try to alias `OldLogger` to `NewLogger` with `useClass`, you end up with two different `NewLogger` instances in your app.
-->
프로바이더에 `useClass`를 사용하면 `OldLogger`를 `NewLogger`로 대체하는 것이 아니라 `NewLogger` 인스턴스를 두 개로 나누는 방식으로 등록됩니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6a" linenums="false">
</code-example>

<!--
To make sure there is only one instance of `NewLogger`, alias `OldLogger` with the `useExisting` option.
-->
`NewLogger`의 인스턴스를 하나로 유지하려면 `oldLogger` 토큰에 `useExisting` 옵션을 사용해야 합니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b" linenums="false">
</code-example>

{@a value-provider}

<!--
## Value providers
-->
## 값(value) 프로바이더

<!--
Sometimes it's easier to provide a ready-made object rather than ask the injector to create it from a class.
To inject an object you have already created,
configure the injector with the `useValue` option

The following code defines a variable that creates such an object to play the logger role.
-->
의존성 객체는 클래스의 인스턴스를 만들어서 제공하는 대신 미리 만들어둔 객체를 제공하는 것이 더 간단할 때도 있습니다.
객체를 프로바이더로 등록하려면 `useValue` 옵션을 사용합니다.

아래 코드는 `Logger`와 모양이 같은 객체를 정의하는 코드입니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger"  linenums="false">
</code-example>

<!--
The following provider object uses the `useValue` key to associate the variable with the `Logger` token.
-->
그리고 이 객체를 `Logger` 토큰에 등록하려면 `useValue` 옵션을 사용하면 됩니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7" linenums="false">
</code-example>

{@a non-class-dependencies}

<!--
### Non-class dependencies
-->
### 클래스가 아닌 의존성 객체

<!--
Not all dependencies are classes.
Sometimes you want to inject a string, function, or object.

Apps often define configuration objects with lots of small facts,
like the title of the application or the address of a web API endpoint.
These configuration objects aren't always instances of a class.
They can be object literals, as shown in the following example.
-->
의존성 객체가 반드시 클래스 타입이어야 하는 것은 아닙니다.
문자열이나 함수, 객체도 의존성으로 주입될 수도 있습니다.

애플리케이션 제목이나 웹 API 엔드포인트 주소와 같이 여러 상수를 객체로 만들어서 사용하는 경우를 생각해 봅시다. 이 때 의존성 객체는 클래스 인스턴스인 것보다는 다음과 같이 객체 리터럴로 정의하는 경우가 일반적입니다.

<code-example path="dependency-injection/src/app/app.config.ts" region="config" header="src/app/app.config.ts (excerpt)" linenums="false">
</code-example>

{@a interface-not-valid-token}

<!--
**TypeScript interfaces are not valid tokens**
-->
**TypeScript 인터페이스는 토큰으로 사용할 수 없습니다.**

<!--
The `HERO_DI_CONFIG` constant conforms to the `AppConfig` interface.
Unfortunately, you cannot use a TypeScript interface as a token.
In TypeScript, an interface is a design-time artifact, and doesn't have a runtime representation (token) that the DI framework can use.
-->
변수 `HERO_DI_CONFIG`는 `AppConfig` 타입의 인터페이스입니다.
하지만 아쉽게도 TypeScript 인터페이스는 토큰으로 사용할 수 없습니다:
인터페이스는 개발 단계에만 사용되는 개념이기 때문에 실행되는 시점에는 존재하지 않습니다. 따라서 의존성 주입에 사용하는 토큰으로 사용할 수 없습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface"  linenums="false">
</code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface"  linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
This might seem strange if you're used to dependency injection in strongly typed languages where an interface is the preferred dependency lookup key.
However, JavaScript, doesn't have interfaces, so when TypeScript is transpiled to JavaScript, the interface disappears.
There is no interface type information left for Angular to find at runtime.
-->
정적 타입을 지정하는 언어에서 의존성 주입을 사용해본 적이 있다면 왜 이것이 문제가 되는지 의아할 것입니다.
이들 언어에서는 인터페이스도 의존성 주입 키로 사용할 수 있기 때문입니다.
하지만 JavaScript에는 인터페이스가 없기 때문에 TypeScript로 작성한 인터페이스는 JavaScript 코드로 변환되면서 사라집니다. 그래서 인터페이스에 대한 정보는 Angular가 실행되는 시점에 확인할 수 없습니다.

</div>

<!--
One alternative is to provide and inject the configuration object in an NgModule like `AppModule`.
-->
객체를 프로바이더로 등록하는 방식은 `AppModule`과 같은 NgModule에도 사용할 수 있습니다.

<code-example path="dependency-injection/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)"></code-example>

<!--
Another solution to choosing a provider token for non-class dependencies is
to define and use an `InjectionToken` object.
The following example shows how to define such a token.
-->
그리고 클래스가 아닌 의존성 객체는 `InjectionToken` 객체를 정의하는 방법으로도 프로바이더를 등록할 수 있습니다.
토큰은 다음과 같이 정의합니다.

<code-example path="dependency-injection/src/app/app.config.ts" region="token" header="src/app/app.config.ts" linenums="false">
</code-example>

<!--
The type parameter, while optional, conveys the dependency's type to developers and tooling.
The token description is another developer aid.
-->
이 때 객체의 타입은 생략할 수 있는데, 다른 개발자나 IDE에 좀 더 많은 정보를 제공하기 위해 타입을 지정할 수도 있습니다.

<!--
Register the dependency provider using the `InjectionToken` object:
-->
이렇게 정의한 `InjectionToken`은 다음과 같이 인젝터에 등록합니다:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9"  linenums="false">
</code-example>

<!--
Now you can inject the configuration object into any constructor that needs it, with
the help of an `@Inject()` parameter decorator.
-->
이 의존성 토큰은 생성자에서 `@Inject()` 인자 데코레이터를 사용하면 주입받을 수 있습니다.

<code-example path="dependency-injection/src/app/app.component.2.ts" region="ctor" header="src/app/app.component.ts" linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
Although the `AppConfig` interface plays no role in dependency injection,
it supports typing of the configuration object within the class.
-->
이 의존성 주입 과정에 `AppConfig` 인터페이스는 아무 역할도 하지 않습니다. 단순하게 주입하는 인스턴스의 타입을 지정하는 용도로만 사용되었습니다.

</div>


{@a factory-provider}
{@a factory-providers}

<!--
## Factory providers
-->
## 팩토리 프로바이더

<!--
Sometimes you need to create a dependent value dynamically,
based on information you won't have until run time.
For example, you might need information that changes repeatedly in the course of the browser session.
Also, your injectable service might not have independent access to the source of the information.
-->
어떤 경우에는 실행환경에서 가져온 정보를 바탕으로 의존성 객체를 동적으로 생성해야 하는 경우가 있습니다.
그리고 이 객체는 브라우저 세션 상태에 따라 지속적으로 변경되는 경우도 있습니다.
이 때 서비스의 입장에서는 정보를 직접 가져올 수 없는 상황이라고 가정해 봅시다.

<!--
In cases like this you can use a *factory provider*.
Factory providers can also be useful when creating an instance of a dependency from
a third-party library that wasn't designed to work with DI.
-->
*팩토리 프로바이더*는 이런 경우에 사용합니다.
팩토리 프로바이더는 의존성 주입을 제공하지 않는 서드 파티 라이브러리에 의존성 주입 시스템을 적용하는 용도로도 사용할 수 있습니다.

<!--
For example, suppose `HeroService` must hide *secret* heroes from normal users.
Only authorized users should see secret heroes.

Like  `EvenBetterLogger`, `HeroService` needs to know if the user is authorized to see secret heroes.
That authorization can change during the course of a single application session,
as when you log in a different user.

Let's say you don't want to inject `UserService` directly into `HeroService`, because you don't want to complicate that service with security-sensitive information.
`HeroService` won't have direct access to the user information to decide
who is authorized and who isn't.

To resolve this, we give the `HeroService` constructor a boolean flag to control display of secret heroes.
-->
예를 들어 `HeroService`가 제공하는 정보 중에 *비밀* 히어로의 명단은 일반 사용자에게 감춰야 한다고 합시다.
이 목록은 사전에 허가된 사용자만 접근할 수 있어야 합니다.

그러면 `EvenBetterLogger`와 마찬가지로 `HeroService`도 어떤 사용자가 허가를 받았는지 알아야 합니다.
인증정보는 애플리케이션에 다른 사용자로 로그인하면 바뀔 수 있기 때문에 한 세션 중에서도 계속 변경될 수 있습니다.

보안에 민감한 정보를 서비스에서 처리하면 서비스 클래스의 로직이 복잡해지기 때문에 `UserService`를 `HeroService`에 직접 주입하는 것은 피하려고 합니다.
하지만 `HeroService`는 사용자가 허가를 받았는지, 그렇지 않았는지 사용자 정보를 직접 확인할 수 없습니다.

그래서 이런 경우에 `HeroService`의 생성자에 `boolean` 플래그를 사용해서 비밀 히어로의 명단을 화면에 표시할지, 표시하지 않을지 결정하려고 합니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.ts" region="internals" header="src/app/heroes/hero.service.ts (excerpt)" linenums="false">
</code-example>

<!--
You can inject `Logger`, but you can't inject the  `isAuthorized` flag. Instead, you can use a factory provider to create a new logger instance for `HeroService`.

A factory provider needs a factory function.
-->
하지만 `Logger`는 의존성으로 주입할 수 있는 반면에 `isAuthorized` 플래그는 주입할 수 없습니다. 대신 새로운 `HeroService`의 인스턴스를 생성할 때 이 플래그를 설정하도록 합시다.

팩토리 프로바이더는 팩토리 함수를 사용합니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="factory" header="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

<!--
Although `HeroService` has no access to `UserService`, the factory function does.
You inject both `Logger` and `UserService` into the factory provider
and let the injector pass them along to the factory function.
-->
이 코드에서 `HeroService`는 `UserService`에 직접 접근할 수 없지만, 팩토리 함수는 접근할 수 있습니다.
그러면 이 팩토리 함수가 동작하기 위한 의존성을 다음과 같이 지정해야 합니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="provider" header="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

<!--
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
-->
* 서비스 프로바이더를 등록할 때 `useFactory` 필드를 사용하면 이 의존성 객체는 `heroServiceFactory`와 같은 팩토리 함수가 사용된다는 것을 의미합니다.

* 팩토리 함수에 필요한 [프로바이더 토큰](guide/dependency-injection#token)은 `deps` 프로퍼티로 지정합니다.
이 코드에는 `Logger`와 `UserService` 클래스가 각각 클래스 프로바이더 토큰으로 사용되었습니다.
이 토큰들은 인젝터가 확인한 후에 각 토큰에 매칭되는 서비스 인스턴스로 팩토리 함수의 인자에 주입됩니다.

팩토리 프로바이더는 `heroServiceProvider`와 같이 변수에 할당하고 파일 외부로 공개해야 한다는 것을 잊지 마세요.
팩토리 프로바이더는 이렇게 정의해야 이후에도 재사용할 수 있습니다.
`HeroService`가 필요한 곳이라면 이 변수를 불러와서 사용하면 됩니다.
지금까지 작성한 예제에서는 `HeroesComponent`만 이 서비스 프로바이더를 사용하며, 기존에 사용되던 `HeroService` 프로바이더를 대체하기 위해 컴포넌트 메타데이터의 `providers` 배열에 이 서비스 프로바이더를 등록했습니다.

지금까지 작성한 코드를 단계별로 살펴봅시다.

<code-tabs>

  <code-pane header="src/app/heroes/heroes.component (v3)" path="dependency-injection/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane header="src/app/heroes/heroes.component (v2)" path="dependency-injection/src/app/heroes/heroes.component.1.ts">
  </code-pane>

</code-tabs>

<!--
## Predefined tokens and multiple providers
-->
## Angular에 정의된 토큰과 다중 프로바이더

<!--
Angular provides a number of built-in injection-token constants that you can use to customize the behavior of
various systems.

For example, you can use the following built-in tokens as hooks into the framework’s bootstrapping and initialization process.
A provider object can associate any of these injection tokens with one or more callback functions that take app-specific initialization actions.
-->
Angular 애플리케이션은 다양한 시스템 환경에서 실행될 수 있으며, 이 때 각 상황에 맞게 커스터마이징할 때 사용하는 의존성 토큰 상수를 제공합니다.

이 토큰들을 사용하면 Angular 프레임워크의 부트스트랩 과정과 초기화 과정을 조정할 수 있습니다.
그리고 이 토큰에 콜백 함수를 연결하면 특정 환경에서 실행되어야 하는 로직을 실행할 수도 있습니다.

<!--
* [PLATFORM_INITIALIZER](api/core/PLATFORM_INITIALIZER): Callback is invoked when a platform is initialized.

* [APP_BOOTSTRAP_LISTENER](api/core/APP_BOOTSTRAP_LISTENER): Callback is invoked for each component that is bootstrapped. The handler function receives the ComponentRef instance of the bootstrapped component.

* [APP_INITIALIZER](api/core/APP_INITIALIZER): Callback is invoked before an app is initialized. All registered initializers can optionally return a Promise. All initializer functions that return Promises must be resolved before the application is bootstrapped. If one of the initializers fails to resolves, the application is not bootstrapped.
-->
* [PLATFORM_INITIALIZER](api/core/PLATFORM_INITIALIZER): 플랫폼이 초기화된 이후에 실행될 함수를 지정합니다.

* [APP_BOOTSTRAP_LISTENER](api/core/APP_BOOTSTRAP_LISTENER): 컴포넌트가 부트스트랩된 이후에 실행될 함수를 지정합니다. 이 함수는 부트스트랩된 컴포넌트의 `ComponentRef` 인스턴스를 인자로 받습니다.

* [APP_INITIALIZER](api/core/APP_INITIALIZER): 애플리케이션이 초기화된 이후에 실행될 함수를 지정합니다. 이때 실행할 함수는 `Promise`를 반환하도록 정의할 수도 있는데, 이 프로미스는 모두 애플리케이션이 부트스트랩되기 전에 종료되어야 합니다. 부트스트랩되기 전에 종료되지 않은 프로미스가 있다면 애플리케이션이 부트스트랩되지 않습니다.

<!--
The provider object can have a third option, `multi: true`, which you can use with `APP_INITIALIZER`
to register multiple handlers for the provide event.

For example, when bootstrapping an application, you can register many initializers using the same token.
-->
프로바이더 객체에는 `multi: true` 옵션을 사용할 수 있기 때문에 `APP_INITIALIZER`와 같은 토큰에 여러 함수를 함께 등록할 수도 있습니다.

애플리케이션을 부트스트랩하면서 특정 함수를 실행하려면 다음과 같이 구현합니다.

```
export const APP_TOKENS = [
 { provide: PLATFORM_INITIALIZER, useFactory: platformInitialized, multi: true    },
 { provide: APP_INITIALIZER, useFactory: delayBootstrapping, multi: true },
 { provide: APP_BOOTSTRAP_LISTENER, useFactory: appBootstrapped, multi: true },
];
```

<!--
Multiple providers can be associated with a single token in other areas as well.
For example, you can register a custom form validator using the built-in [NG_VALIDATORS](api/forms/NG_VALIDATORS) token,
and provide multiple instances of a given validator provider by using the `multi: true` property in the provider object.
Angular adds your custom validators to the existing collection.

The Router also makes use of multiple providers associated with a single token.
When you provide multiple sets of routes using [RouterModule.forRoot](api/router/RouterModule#forroot)
and [RouterModule.forChild](api/router/RouterModule#forchild) in a single module,
the [ROUTES](api/router/ROUTES) token combines all the different provided sets of routes into a single value.
-->
한 토큰에 프로바이더를 여러개 등록하는 것은 Angular가 제공하는 패턴 중 하나입니다.
그래서 폼 유효성 검사기를 [NG_VALIDATORS](api/forms/NG_VALIDATORS) 토큰에 등록하면서 `multi: true` 옵션을 사용하면 폼 유효성 검사기 여러개를 한 번에 적용할 수도 있습니다.
이렇게 등록된 폼 유효성 검사기는 Angular가 원래 제공하던 폼 유효성 검사기와 함께 사용할 수 있습니다.

라우터를 사용할 때도 한 토큰에 프로바이더를 여러개 등록할 수 있습니다.
어떤 모듈에 [RouterModule.forRoot](api/router/RouterModule#forroot)와 [RouterModule.forChild](api/router/RouterModule#forchild)를 사용해서 라우팅 규칙을 등록하면, 이 라우팅 규칙은 모두 [ROUTES](api/router/ROUTES) 토큰으로 조합되어 하나의 객체로 변환됩니다.

<div class="alert is-helpful">

<!--
Search for [Constants in API documentation](api?type=const) to find more built-in tokens.
-->
Angular가 제공하는 토큰에 대해서 더 알아보려면 [상수 API 목록](api?type=const)을 참고하세요.

</div>

{@a tree-shakable-provider}
{@a tree-shakable-providers}

<!--
## Tree-shakable providers
-->
## 트리 셰이킹 대상이 되는 프로바이더

<!--
Tree shaking refers to a compiler option that removes code from the final bundle if the app doesn't reference that code.
When providers are tree-shakable, the Angular compiler removes the associated
services from the final output when it determines that your application doesn't use those services.
This significantly reduces the size of your bundles.
-->
트리 셰이킹은 애플리케이션에 사용되지 않은 코드를 최종 번들링 결과물에 포함시키지 않는 기능을 의미합니다.
그리고 Angular 컴파일러는 트리 셰이킹될 수 있도록 등록된 프로바이더에만 트리 셰이킹을 적용할 수 있습니다.
이 과정을 통해 불필요한 코드를 제거하면 최종 빌드 결과물의 용량을 줄일 수 있습니다.

<div class="alert is-helpful">

<!--
Ideally, if an application isn't injecting a service, Angular shouldn't include it in the final output.
However, Angular has to be able to identify at build time whether the app will require the service or not.
Because it's always possible to inject a service directly using `injector.get(Service)`,
Angular can't identify all of the places in your code where this injection could happen,
so it has no choice but to include the service in the injector.
Thus, services in the NgModule `providers` array or at component level are not tree-shakable.
-->
이상적인 경우를 생각해 봤을 때 애플리케이션에 사용되는 서비스가 아무것도 없다면 최종 빌드 결과물에는 어떠한 서비스도 포함되지 않을 것입니다.
하지만 이 것은 Angular 컴파일러가 빌드 시점에 확인할 수 없는 내용입니다.
왜냐하면 의존성 객체는 클래스 생성자 뿐 아니라 `injector.get(서비스)`를 통해 직접 인스턴스를 가져올 수 있기 때문입니다.
이 경우에 Angular는 의존성 객체가 참조되었는지 알아내기 위해서 모든 코드를 확인할 수는 없으며, 결국 트리 셰이킹할 수 있는 타이밍을 놓치게 됩니다.
그래서 NgModule의 `providers` 배열이나 컴포넌트 계층에 등록된 서비스는 트리 셰이킹의 대상이 될 수 없습니다.

</div>

<!--
The following example of non-tree-shakable providers in Angular configures a service provider for the injector of an NgModule.
-->
다음 코드처럼 NgModule의 인젝터에 등록된 서비스 프로바이더는 트리 셰이킹의 대상이 아닙니다.

<code-example path="dependency-injection/src/app/tree-shaking/service-and-module.ts"  header="src/app/tree-shaking/service-and-modules.ts" linenums="false"> </code-example>

<!--
You can then import this module into your application module
to make the service available for injection in your app,
as in the following example.
-->
이 모듈은 애플리케이션에 사용되는 서비스 프로바이더를 모아두기 위해 정의한 것이기 때문에, 애플리케이션 최상위 모듈에 다음과 같이 로드되어야 합니다.

<code-example path="dependency-injection/src/app/tree-shaking/app.module.ts"  header="src/app/tree-shaking/app.modules.ts" linenums="false"> </code-example>

<!--
When `ngc` runs, it compiles `AppModule` into a module factory, which contains definitions for all the providers declared in all the modules it includes. At runtime, this factory becomes an injector that instantiates these services.

Tree-shaking doesn't work here because Angular can't decide to exclude one chunk of code (the provider definition for the service within the module factory) based on whether another chunk of code (the service class) is used. To make services tree-shakable, the information about how to construct an instance of the service (the provider definition) needs to be a part of the service class itself.
-->
이제 `ngc`가 실행되면 `AppModule`은 모듈 팩토리로 변환되는데, 이 때 자식 모듈에 있는 모든 프로바이더가 이 팩토리에 포함됩니다. 그래서 실행시점에는 모듈 팩토리가 인젝터 역할을 하며 필요한 서비스의 인스턴스를 생성합니다.

하지만 이 과정에는 트리 셰이킹이 동작하지 않습니다. 왜냐하면 Angular는 모듈 팩토리와 같은 코드 덩어리와 서비스 클래스와 같은 코드 덩어리만 보고는 이 서비스가 실제로 사용되었는지 판단할 수 없기 때문입니다. 그래서 서비스를 트리 셰이킹 대상으로 만들려면, 이 서비스가 어떻게 사용되는지에 대한 정보를 추가로 제공해야 합니다.

<!--
### Creating tree-shakable providers
-->
### 트리 셰이킹 대상이 되도록 프로바이더 등록하기

<!--
You can make a provider tree-shakable by specifying it in the `@Injectable()` decorator on the service itself, rather than in the metadata for the NgModule or component that depends on the service.

The following example shows the tree-shakable equivalent to the `ServiceModule` example above.
-->
서비스 프로바이더를 NgModule이나 컴포넌트에 등록하지 않고 서비스에 `@Injectable()` 데코레이터로 직접 등록하면 트리 셰이킹 대상으로 지정할 수 있습니다.

그래서 위에서 살펴봤던 `ServiceModule` 예제의 `Service` 클래스를 트리 셰이킹할 수 있도록 변형하면 다음과 같이 작성할 수 있습니다.

<code-example path="dependency-injection/src/app/tree-shaking/service.ts"  header="src/app/tree-shaking/service.ts" linenums="false"> </code-example>

<!--
The service can be instantiated by configuring a factory function, as in the following example.
-->
이 서비스는 팩토리 함수로 인스턴스를 생성해서 등록할 수도 있습니다.

<code-example path="dependency-injection/src/app/tree-shaking/service.0.ts"  header="src/app/tree-shaking/service.0.ts" linenums="false"> </code-example>

<div class="alert is-helpful">

<!--
To override a tree-shakable provider, configure the injector of a specific NgModule or component with another provider, using the `providers: []` array syntax of the `@NgModule()` or `@Component()` decorator.
-->
트리 셰이킹 대상이 되는 프로바이더를 오버라이드하려면, 필요한 모듈의 `@NgModule` 데코레이터나 `@Component` 데코레이터에 `providers: []`를 지정하면 됩니다.

</div>
