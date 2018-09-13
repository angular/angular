<!--
# Angular Dependency Injection
-->
# Angular의 의존성 주입

<!--
**Dependency Injection (DI)** is a way to create objects that depend upon other objects.
A Dependency Injection system supplies the dependent objects (called the _dependencies_)
when it creates an instance of an object.
-->
**의존성 주입 (Dependency Injection, DI)**은 의존성으로 필요한 객체를 클래스 외부에서 만들어서 전달받는 디자인 패턴입니다. 그리고 이 때 의존성 주입 시스템이 의존성 객체를 만드는 역할을 합니다.

<!--
The [Dependency Injection pattern](guide/dependency-injection-pattern) page describes this general approach.
_The guide you're reading now_ explains how Angular's own Dependency Injection system works.
-->
의존성 주입의 일반적인 내용은 [의존성 주입 패턴](guide/dependency-injection-pattern) 문서에서 이미 소개했습니다. _이번 가이드 문서_ 에서는 Angular의 의존성 주입 시스템이 어떻게 동작하는지 소개합니다.

<!--
## DI by example
-->
## 예제로 보는 DI

<!--
You'll learn Angular Dependency Injection through a discussion of the sample app that accompanies this guide.
Run the <live-example></live-example> anytime.
-->
이 문서에서는 예제 애플리케이션을 살펴 보면서 Angular의 의존성 주입 시스템에 대해 알아볼 것입니다. 이 문서에서 설명하는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<!--
Start by reviewing this simplified version of the _heroes_ feature
from the [The Tour of Heroes](tutorial/).
-->
[히어로들의 여행](tutorial/) 튜토리얼에서 작성했던 예제를 간단하게 만든 예제부터 시작해 봅시다.

<code-tabs>
  <code-pane title="src/app/heroes/heroes.component.ts" path="dependency-injection/src/app/heroes/heroes.component.1.ts"
  region="v1">
  </code-pane>

  <code-pane title="src/app/heroes/hero-list.component.ts" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">
  </code-pane>

  <code-pane title="src/app/heroes/hero.ts" path="dependency-injection/src/app/heroes/hero.ts">
  </code-pane>

  <code-pane title="src/app/heroes/mock-heroes.ts" path="dependency-injection/src/app/heroes/mock-heroes.ts">
  </code-pane>

</code-tabs>

<!--
The `HeroesComponent` is the top-level heroes component.
Its only purpose is to display the `HeroListComponent`
which displays a list of hero names.
-->
`HeroesComponent`는 이 예제의 최상위 컴포넌트입니다. 이 컴포넌트의 역할은 화면에 히어로의 목록을 `HeroListComponent`로 표시하는 것입니다.

<!--
This version of the `HeroListComponent` gets its `heroes` from the `HEROES` array, an in-memory collection
defined in a separate `mock-heroes` file.
-->
이 코드에서 `HeroListComponent`의 `heroes` 프로퍼티는 `HEROES` 배열에서 가져오는데, 이 배열은 `mock-heroes` 파일에서 가져온 인-메모리 콜렉션입니다.

<code-example title="src/app/heroes/hero-list.component.ts (class)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts"
region="class">
</code-example>

<!--
That may suffice in the early stages of development, but it's far from ideal.
As soon as you try to test this component or get heroes from a remote server,
you'll have to change the implementation of `HerosListComponent` and
replace every other use of the `HEROES` mock data.
-->
개발 초기 단계에는 이렇게 구현해도 문제되지 않지만, 이상적인 방법은 아닙니다. 개발을 진행하면서 이 컴포넌트를 테스트해야 하거나, 원격 서버에서 목록을 가져와야 하면 `HeroListComponent`에서 이 내용과 관련된 코드를 수정해야 하며 `HEROES` 목 데이터를 사용하는 다른 코드도 수정해야 합니다.

<!--
It's better to hide these details inside a _service_ class, 
[defined in its own file](#one-class-per-file).
-->
그래서 이 히어로의 목록을 제공하는 기능은 _서비스_ 클래스 안쪽으로 옮기는 것이 더 나은 방법이며, 이 서비스도 [개별 파일로](#one-class-per-file) 정의하는 것이 좋습니다.

<!--
## Create an injectable _HeroService_
-->
## 의존성 주입에 사용할 _HeroService_ 정의하기

<!--
The [**Angular CLI**](https://cli.angular.io/) can generate a new `HeroService` class in the `src/app/heroes` folder with this command.
-->
`src/app/heroes` 폴더에서 다음 명령을 실행하면 [**Angular CLI**](https://cli.angular.io/)를 사용해서 `HeroService` 클래스를 생성할 수 있습니다.

<code-example language="sh" class="code-shell">
ng generate service heroes/hero
</code-example>

<!--
The command above creates the following `HeroService` skeleton.
-->
그러면 다음과 같이 `HeroService` 기본 코드가 생성됩니다.

<!--
<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" title="src/app/heroes/hero.service.ts (CLI-generated)">
</code-example>
-->
<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" title="src/app/heroes/hero.service.ts (CLI로 생성한 기본 코드)">
</code-example>

<!--
The `@Injectable` decorator is an essential ingredient in every Angular service definition.
The rest of the class has been rewritten to expose a `getHeroes` method 
that returns the same mock data as before.
-->
Angular 서비스를 정의할 때 `@Injectable` 데코레이터는 아주 중요한 역할을 합니다. 그리고 이전에 목 데이터를 가져왔던 로직은 이 클래스에 `getHeroes` 메소드로 다음과 같이 정의합니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.3.ts" title="src/app/heroes/hero.service.3.ts">
</code-example>

<!--
Of course, this isn't a real data service.
If the app were actually getting data from a remote server, 
the `getHeroes` method signature would have to be asynchronous.
-->
당연히 이 데이터는 실제 데이터가 아닙니다. 원격 서버에서 실제 데이터를 가져와야 한다면 `getHeroes` 메소드가 비동기로 동작하도록 수정해야 합니다.

<!--
That's a defect we can safely ignore in this guide where our focus is on
_injecting the service_ into the `HeroList` component.
-->
이 문서에서 우리가 다루는 내용은 `HeroList` 컴포넌트에 _서비스를 주입하는 것_ 이기 때문에 지금은 이대로 넘어가도록 합시다.


{@a injector-config}
{@a bootstrap}

<!--
## Injectors
-->
## 인젝터 (Injectors)

<!--
A _service_ like `HeroService` is just a class in Angular until you register it with an Angular dependency injector.
-->
`HeroService`와 같은 _서비스_ 는 Angular 의존성 주입의 대상으로 등록되기 전까지는 단순하게 클래스일 뿐입니다.

<!--
An Angular injector is responsible for creating service instances and injecting them into classes like the `HeroListComponent`.
-->
그리고 Angular 인젝터는 이 서비스의 인스턴스를 생성하며, `HeroListComponent`와 같이 의존성이 주입되어야 할 클래스에 의존성을 주입합니다.

<!--
You rarely create an Angular injector yourself.
Angular creates injectors for you as it executes the app,
starting with the _root injector_ that it creates during the [bootstrap process](guide/bootstrapping).
-->
인젝터를 개발자가 생성해야 하는 경우는 거의 없습니다.
인젝터는 Angular가 직접 생성하며, 특히 _최상위 인젝터_ 는 애플리케이션이 [부트스트랩 되는 과정](guide/bootstrapping)에 생성됩니다.

<!--
Angular doesn't automatically know how you want to create instances of your services or the injector to create your service. You must configure it by specifying providers for every service.
-->
서비스를 생성하는 방법을 Angular가 자동으로 알 수는 없습니다. 그래서 서비스 인스턴스를 생성하는 방법은 프로바이더로 등록해야 합니다.

<!--
**Providers** tell the injector _how to create the service_.
Without a provider, the injector would not know
that it is responsible for injecting the service
nor be able to create the service.
-->
**프로바이더** 는 _서비스 인스턴스를 어떻게 생성하는지_ 인젝터에게 알려주는 객체입니다.
그래서 프로바이더가 없으면 서비스 인스턴스를 어떻게 생성해야 할지 알지 못하기 때문에 인스턴스를 생성할 수 없습니다.

<div class="alert is-helpful">

<!--
You'll learn much more about _providers_ [below](#providers).
For now, it is sufficient to know that they configure where and how services are created.
-->
_프로바이더_ 에 대해서는 [아래](#providers)에서 자세하게 설명합니다.
지금은 프로바이더가 어떤 역할을 하는지만 이해하고 넘어가면 충분합니다.

</div>

<!--
There are many ways to register a service provider with an injector. This section shows the most common ways 
of configuring a provider for your services.
-->
인젝터에 서비스 프로바이더를 등록하는 방법은 여러가지입니다. 이 중 가장 많이 쓰이는 방법부터 알아봅시다.

{@a register-providers-injectable}

<!--
## @Injectable providers
-->
## @Injectable 프로바이더

<!--
The `@Injectable` decorator identifies services and other classes that are intended to be injected. It can also be used to configure a provider for those services.
-->
서비스에 `@Injectable` 데코레이터를 사용하면 이 클래스가 의존성 주입의 대상이라는 것을 지정할 수 있습니다. 그리고 이 데코레이터는 프로바이더를 설정하는 용도로도 사용합니다.

<!--
Here we configure a provider for `HeroService` using the `@Injectable` decorator on the class.
-->
`HeroService` 클래스를 프로바이더에 등록하려면 다음과 같이 클래스 선언 위에 `@Injecdtable` 데코레이터를 지정하면 됩니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts"  title="src/app/heroes/heroes.service.ts" linenums="false"> </code-example> 

<!--
`providedIn` tells Angular that the root injector is responsible for creating an instance of the `HeroService` (by invoking its constructor) and making it available across the application. The CLI sets up this kind of a provider automatically for you when generating a new service.
-->
`providedIn`을 사용하면 이 서비스의 프로바이더가 등록될 위치를 지정할 수 있습니다. 그래서 `providedIn: root`라고 사용하면 이 서비스 프로바이더는 애플리케이션 최상위 인젝터에 등록되며, 앱 전체에서 딱 하나의 인스턴스만 생성됩니다. Angular CLI를 사용해서 서비스를 생성하면 이 설정이 기본값입니다.

<!--
Sometimes it's not desirable to have a service always be provided in the application root injector. Perhaps users should explicitly opt-in to using the service, or the service should be provided in a lazily-loaded context. In this case, the provider should be associated with a specific `@NgModule` class, and will be used by whichever injector includes that module.
-->
모든 서비스가 최상위 인젝터에 등록되어야 하는 것은 아닙니다. 어떤 서비스는 특정 범위 안에 등록되어야 하는 경우도 있고, 지연로딩 되는 모듈에 등록되어야 하는 경우도 있습니다. 이런 경우에는 서비스 프로바이더가 특정 `@NgModule`에 등록되어야 하며, 서비스의 인스턴스를 생성할 때도 이 모듈에 있는 인젝터를 사용합니다.

<!--
In the following excerpt, the `@Injectable` decorator is used to configure a provider that will be available in any injector that includes the HeroModule.
-->
그래서 `@Injectable` 데코레이터를 다음과 같이 사용하면 이 서비스 인스턴스는 `HeroModule`안에서만 사용할 수 있습니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.4.ts"  title="src/app/heroes/hero.service.ts" linenums="false"> </code-example>

{@a register-providers-ngmodule}

<!--
### _@NgModule_ providers
-->
### _@NgModule_ 프로바이더

<!--
In the following excerpt, the root `AppModule` registers two providers in its `providers` array.
-->
다음 예제에서 `AppModule`의 `providers` 프로퍼티에는 두 개의 프로바이더가 배열로 등록되어 있습니다.

<code-example path="dependency-injection/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (providers)" region="providers">
</code-example>

<!--
The first entry registers the `UserService` class (_not shown_) under the `UserService` _injection token_.
The second registers a value (`HERO_DI_CONFIG`) under the `APP_CONFIG` _injection token_.
-->
첫 번째는 _명시적으로 표현되어 있지는 않지만_ `UserService` 클래스가 `UserService` _인젝션 토큰으로_ 등록되어 있고, 두 번째는 `HERO_DI_CONFIG`라는 값이 `APP_CONFIG` _인젝션 토큰_ 으로 등록되어 있습니다.

<!--
With the above registrations, Angular can inject the `UserService` or the `HERO_DI_CONFIG` value
into any class that it creates.
-->
이렇게 등록하면 이 인젝터의 범위 안에서 `UserService`와 `HERO_DI_CONFIG` 값을 의존성으로 주입받아 사용할 수 있습니다.

<div class="alert is-helpful">

<!--
You'll learn about _injection tokens_ and _provider_ syntax [below](#providers).
-->
_인젝션 토큰_ 과 _프로바이더_ 문법은 [아래](#providers)에서 자세히 살펴봅니다.

</div>

{@a register-providers-component}

<!--
### _@Component_ providers
-->
### _@Component_ 프로바이더

<!--
In addition to providing the service application-wide or within a particular `@NgModule`, services can also be provided in specific components. Services provided in component-level is only available within that component injector or in any of its child components.
-->
서비스 프로바이더는 앱 전체 범위나 특정 `@NgModule` 범위에 등록할 수도 있지만, 특정 컴포넌트 범위로 등록할 수도 있습니다. 그러면 이 서비스는 컴포넌트 인젝터에 등록되며, 컴포넌트의 하위 컴포넌트에서만 사용할 수 있습니다.

<!--
The example below shows a revised `HeroesComponent` that registers the `HeroService` in its `providers` array.
-->
다음 예제는 `HeroService`를 `HeroesComponent` `providers`에 등록하는 예제입니다.

<code-example path="dependency-injection/src/app/heroes/heroes.component.1.ts" title="src/app/heroes/heroes.component.ts" linenums="false">
</code-example>

{@a ngmodule-vs-comp}

<!--
### @Injectable, _@NgModule_ or _@Component_?
-->
### 어떤 것을 사용해야 할까?

<!--
Should you provide a service with an `@Injectable` decorator, in an `@NgModule`, or within an `@Component`?
The choices lead to differences in the final bundle size, service _scope_, and service _lifetime_.
-->
그러면 서비스 프로바이더를 등록하는 3가지 방법 중 어떤 것을 선택해야 할까요?
이 답은 번들 파일의 크기, 서비스의 _사용 범위_, 서비스의 _실행 주기_ 에 따라 달라집니다.

<!--
When you register providers in the **@Injectable** decorator of the service itself, optimization tools such as those used by the CLI's production builds can perform tree shaking, which removes services that aren't used by your app. Tree shaking results in smaller bundle sizes.
-->
서비스에 **@Injectable** 데코레이터를 사용하면 Angular CLI와 같은 빌드 툴의 트리 셰이킹 기능을 활용할 수 있습니다. 이 서비스가 실제로 사용되지 않는다면 트리 셰이킹 과정에 이 코드는 제거됩니다.

<!--
**Angular module providers** (`@NgModule.providers`) are registered with the application's root injector.
Angular can inject the corresponding services in any class it creates.
Once created, a service instance lives for the life of the app and Angular injects this one service instance in every class that needs it.
-->
서비스 프로바이더를 **모듈 프로바이더 (`@NgModule.providers`)**에 등록하면 애플리케이션 최상위 인젝터에 등록한 것과 같은 동작을 합니다.
그래서 모듈에 등록된 프로바이더를 사용해서 서비스의 인스턴스를 생성할 수 있으며, 한 번 생성된 서비스 인스턴스는 애플리케이션이 종료될때까지 계속 유지되면서 필요한 곳에 주입됩니다.

<!--
You're likely to inject the `UserService` in many places throughout the app
and will want to inject the same service instance every time.
Providing the `UserService` with an Angular module is a good choice if an `@Injectable` provider is not an option..
-->
`UserService`를 앱 전역에 사용하며, 항상 같은 인스턴스가 주입되기를 원한다면 `@Injectable` 데코레이터를 사용하는 것이 좋습니다. 그리고 이 데코레이터를 사용할 수 없다면 모듈 프로바이더로 등록하는 방법을 고려해볼 수 있습니다.

<div class="alert is-helpful">

<!--
To be precise, Angular module providers are registered with the root injector
_unless the module is_ [lazy loaded](guide/lazy-loading-ngmodules).
In this sample, all modules are _eagerly loaded_ when the application starts,
so all module providers are registered with the app's root injector.
-->
좀 더 자세하게 이야기하면, Angular는 _[지연 로딩](guide/lazy-loading-ngmodules)되지 않는_ 모듈의 프로바이더를 최상위 인젝터에 등록합니다. 지금까지 살펴봤던 모듈은 모두 애플리케이션이 시작될 때 _즉시 로드되는_ 모듈이기 때문에, 모든 프로바이더가 애플리케이션 최상위 인젝터에 등록됩니다.

</div><br>

<hr>

<!--
**A component's providers** (`@Component.providers`) are registered with each component instance's own injector.
-->
**컴포넌트 프로바이더 (`@Component.providers`)**를 사용하면 각 컴포넌트의 인젝터마다 서비스의 인스턴스가 생성됩니다.

<!--
Angular can only inject the corresponding services in that component instance or one of its descendant component instances.
Angular cannot inject the same service instance anywhere else.
-->
그러면 이 컴포넌트와 이 컴포넌트의 하위 컴포넌트에서 서비스 인스턴스를 공유합니다. 컴포넌트 밖과는 인스턴스를 공유하지 않습니다.

<!--
Note that a component-provided service may have a limited lifetime. Each new instance of the component gets its own instance of the service
and, when the component instance is destroyed, so is that service instance.
-->
컴포넌트 프로바이더로 등록된 서비스의 인스턴스는 컴포넌트가 생성되고 종료되는 시점을 함께 따라갑니다. 그래서 이 서비스 인스턴스는 컴포넌트의 인스턴스가 생성될 때 함께 생성되며, 이 컴포넌트가 종료될 때 서비스 인스턴스도 함께 종료됩니다.

<!--
In this sample app, the `HeroComponent` is created when the application starts
and is never destroyed so the `HeroService` created for the `HeroComponent` also live for the life of the app.
-->
예제로 살펴본 애플리케이션에서 `HeroComponent`는 애플리케이션이 시작될 때 생성되며 따로 종료되지 않기 때문에, `HeroComponent`에 의존성으로 주입되는 `HeroService`의 인스턴스도 애플리케이션이 종료되기 전까지 없어지지 않습니다.

<!--
If you want to restrict `HeroService` access to the `HeroComponent` and its nested `HeroListComponent`,
providing the `HeroService` in the `HeroComponent` may be a good choice.
-->
`HeroService`에 접근할 수 있는 범위를 `HeroComponent`와 하위 컴포넌트인 `HeroListComponent`로만 제한하려면, `HeroService`의 프로바이더를 `HeroComponent`에 등록하는 것이 가장 좋습니다.

<div class="alert is-helpful">

<!--
The scope and lifetime of component-provided services is a consequence of [the way Angular creates component instances](#component-child-injectors). 
-->
컴포넌트 프로바이더에 등록된 서비스의 인스턴스는 [컴포넌트 인스턴스가 생성된](#component-child-injectors) 직후에 생성됩니다.

</div>


{@a providers}

<!--
## Providers
-->
## 프로바이더 (Providers)

<!--
A service provider *provides* the concrete, runtime version of a dependency value.
The injector relies on **providers** to create instances of the services
that the injector injects into components, directives, pipes, and other services.
-->
서비스 프로바이더가 *제공*하는 것은 실행 시점에 사용되는 의존성 객체의 인스턴스입니다.
이 인스턴스는 **서비스 프로바이더**를 사용하는 인젝터가 생성하며, 컴포넌트나 디렉티브, 파이프, 다른 서비스에 인스턴스를 의존성으로 주입하는 것도 인젝터입니다.

<!--
You must register a service *provider* with an injector, or it won't know how to create the service.
-->
그래서 서비스의 *프로바이더*는 인젝터에 등록해야 하며, 프로바이더를 등록하지 않으면 인젝터는 서비스를 생성할 수 없습니다.

<!--
The next few sections explain the many ways you can specify a provider.
-->
이번에는 서비스 프로바이더를 사용하는 몇가지 방법을 알아봅시다.

<!--
### The class as its own provider
-->
### 그 자체로 프로바이더 역할을 하는 클래스

<!--
There are many ways to *provide* something that looks and behaves like a `Logger`.
The `Logger` class itself is an obvious and natural provider.
-->
무언가를 제공하는 *프로바이더*는 여러가지가 있겠지만, 이번 예제에서는 `Logger` 서비스를 예로 들어봅시다.
다음과 같이 지정된 `Logger` 클래스는 그 자체로 서비스 프로바이더의 역할을 합니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

<!--
But it's not the only way.
-->
하지만 이 방법만 있는 것은 아닙니다.

<!--
You can configure the injector with alternative providers that can deliver an object that behaves like a `Logger`.
You could provide a substitute class. You could provide a logger-like object.
You could give it a provider that calls a logger factory function.
Any of these approaches might be a good choice under the right circumstances.
-->
인젝터를 사용하면서 `Logger`의 역할을 하는 다른 객체를 대신 지정할 수도 있습니다.
`Logger` 클래스 대신 다른 클래스를 지정할 수도 있으며, 이 클래스와 비슷하게 생긴 객체를 지정할 수도 있고, 팩토리 함수를 서비스 프로바이더로 지정할 수도 있습니다.
상황에 따라 어떠한 형태로든 사용할 수 있습니다.

<!--
What matters is that the injector has a provider to go to when it needs a `Logger`.
-->
중요한 것은 `Logger`가 필요한 경우에는 프로바이더가 인젝터에 미리 등록되어 있어야 한다는 것입니다.

{@a provide}

<!--
### The _provide_ object literal
-->
### 오브젝트 리터럴 사용하기

<!--
Here's the class-provider syntax again.
-->
클래스를 서비스 프로바이더로 사용하는 코드를 다시 확인해 봅시다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-logger">
</code-example>

<!--
This is actually a shorthand expression for a provider registration
using a _provider_ object literal with two properties:
-->
이 문법은 프로바이더로 등록하는 문법을 간략화한 표현입니다. 원래 프로바이더를 등록할 때는 프로퍼티 2개가 필요하며 다음처럼 사용해야 합니다:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-3" >
</code-example>

<!--
The `provide` property holds the [token](guide/dependency-injection#token) that serves as the key for both locating a dependency value
and registering the provider.
-->
`provide` 프로퍼티에는 의존성으로 주입하는 객체의 식별자인 [토큰](guide/dependency-injection#token)을 지정합니다.

<!--
The second property is always a provider definition object,
which you can think of as a *recipe* for creating the dependency value.
There are many ways to create dependency values just as there are many ways to write a recipe.
-->
그리고 두 번째 프로퍼티에는 의존성 객체를 *만드는 구체적인 방법*을 지정합니다. 이 예제에서는 클래스 객체를 프로바이더로 지정했으며, 이 외에도 의존성 객체를 만드는 방법은 여러가지입니다.

{@a class-provider}

<!--
### Alternative class providers
-->
### 대체 클래스 프로바이더

<!--
Occasionally you'll ask a different class to provide the service.
The following code tells the injector
to return a `BetterLogger` when something asks for the `Logger`.
-->
서비스 프로바이더를 다른 클래스로 지정해야 하는 경우는 종종 발생합니다.
그래서 다음과 같이 작성하면 `Logger`를 의존성으로 주입해야 하는 곳에 `BetterLogger` 클래스를 주입하라고 인젝터에게 지정할 수 있습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-4" >
</code-example>

{@a class-provider-dependencies}

<!--
### Class provider with dependencies
-->
### 추가 의존성이 있는 클래스 프로바이더

<!--
Maybe an `EvenBetterLogger` could display the user name in the log message.
This logger gets the user from the injected `UserService`,
which is also injected at the application level.
-->
어쩌면 `EvenBetterLogger`가 현재 사용자의 이름을 로그로 출력하는 기능을 제공할 수도 있습니다.
그러면 이 서비스는 애플리케이션 계층에 등록된 `UserService`에서 사용자 정보를 가져와야 합니다.
이 클래스가 다음과 같이 정의되어 있다고 합시다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="EvenBetterLogger"  linenums="false">
</code-example>

<!--
Configure it like `BetterLogger`.
-->
그러면 다음과 같이 프로바이더를 등록하면 됩니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-5"  linenums="false">
</code-example>

{@a aliased-class-providers}

<!--
### Aliased class providers
-->
### 클래스 프로바이더 별칭 지정하기

<!--
Suppose an old component depends upon an `OldLogger` class.
`OldLogger` has the same interface as the `NewLogger`, but for some reason
you can't update the old component to use it.
-->
이전에 작성되어 있던 어떤 컴포넌트가 `OldLogger` 클래스를 사용한다고 합시다.
`OldLogger`의 모든 인터페이스는 `NewLogger`와 같지만, 뭔가 이유가 있어서 그 컴포넌트가 사용하는 `OldLogger`를 변경할 수 없다고 합시다.

<!--
When the *old* component logs a message with `OldLogger`,
you'd like the singleton instance of `NewLogger` to handle it instead.
-->
이 때 *이전의* 컴포넌트가 `OldLogger`를 사용해서 로그를 출력하는 것을, `NewLogger`가 대신 처리하게 하려고 합니다.

<!--
The dependency injector should inject that singleton instance
when a component asks for either the new or the old logger.
The `OldLogger` should be an alias for `NewLogger`.
-->
의존성을 주입하는 인젝터는 그 의존성이 어떤 것이냐에 관계없이 적당한 인스턴스를 제공하기만 하면 됩니다.
이 관점에서 `OldLogger`는 `NewLogger`를 가리키는 또 다른 이름으로 사용할 수 있습니다.

<!--
You certainly do not want two different `NewLogger` instances in your app.
Unfortunately, that's what you get if you try to alias `OldLogger` to `NewLogger` with `useClass`.
-->
물론 `NewLogger` 인스턴스가 애플리케이션에 2개 존재하는 것은 원하는 상황이 아닙니다.
그런데 다음과 같이 `useClass`를 사용하면 `OldLogger`로 연결되는 인스턴스와 `NewLogger`로 연결되는 인스턴스가 따로 만들어집니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6a"  linenums="false">
</code-example>

<!--
The solution: alias with the `useExisting` option.
-->
해결방법: 프로바이더의 별칭을 지정하려면 `useExisting` 옵션을 사용합니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-6b" linenums="false">
</code-example>

{@a value-provider}

<!--
### Value providers
-->
### 값/객체 프로바이더

<!--
Sometimes it's easier to provide a ready-made object rather than ask the injector to create it from a class.
-->
어떤 경우에는 클래스를 사용해서 인스턴스를 만들지 않고 미리 만들어둔 객체를 사용하는 것이 간편한 경우도 있습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="silent-logger"  linenums="false">
</code-example>

<!--
Then you register a provider with the `useValue` option,
which makes this object play the logger role.
-->
이 때는 `useValue` 옵션을 사용해서 로거 역할을 하는 객체를 프로바이더로 등록할 수 있습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-7" linenums="false">
</code-example>

<!--
See more `useValue` examples in the
[Non-class dependencies](guide/dependency-injection#non-class-dependencies) and
[InjectionToken](guide/dependency-injection#injection-token) sections.
-->
`useValue`를 사용하는 예제는 [클래스가 아닌 의존성](guide/dependency-injection#non-class-dependencies) 섹션과 [InjectionToken](guide/dependency-injection#injection-token) 섹션에서 더 확인할 수 있습니다.

<!--
{@a factory-provider}
-->

<!--
### Factory providers
-->
### 팩토리 프로바이더

<!--
Sometimes you need to create the dependent value dynamically,
based on information you won't have until the last possible moment.
Maybe the information changes repeatedly in the course of the browser session.
-->
어떤 경우에는 실행환경에서 가져온 정보를 바탕으로 의존성 객체를 동적으로 생성해야 하는 경우가 있습니다.
그리고 어쩌면 이 정보가 브라우저 세션 상태에 따라 지속적으로 변경되는 경우도 있습니다.

<!--
Suppose also that the injectable service has no independent access to the source of this information.
-->
그런데 이 서비스의 입장에서는 정보를 직접 가져올 수 없는 상황이라고 가정해 봅시다.

<!--
This situation calls for a **factory provider**.
-->
**팩토리 프로바이더** 는 이런 경우에 사용합니다.

<!--
To illustrate the point, add a new business requirement:
the `HeroService` must hide *secret* heroes from normal users.
Only authorized users should see secret heroes.
-->
이해를 돕기 위해 이런 내용이 필요하다고 합시다:
`HeroService`는 *비밀* 히어로를 보호하기 위해 일반 사용자가 접근할 수 없어야 합니다.
오직 승인된 사용자만 비밀 히어로가 누구인지 확인할 수 있어야 합니다.

<!--
Like the `EvenBetterLogger`, the `HeroService` needs a fact about the user.
It needs to know if the user is authorized to see secret heroes.
That authorization can change during the course of a single application session,
as when you log in a different user.
-->
앞서 살펴봤던 `EvenBetterLogger`처럼, `HeroService`도 이제 사용자에 대한 정보가 필요합니다.
왜냐하면 지금 접속한 사용자가 비밀 히어로의 정보를 볼 수 있는지 확인해야 하기 때문입니다.
어떤 시점에는 이 정보가 유효하더라도 다른 사용자가 로그인하게 되면 같은 애플리케이션 세션 중에 다른값으로 변경될 수 있습니다.

<!--
Unlike `EvenBetterLogger`, you can't inject the `UserService` into the `HeroService`.
The `HeroService` won't have direct access to the user information to decide
who is authorized and who is not.
-->
그런데 `EventBetterLogger`에서 했던 것처럼 `HeroService`에 `UserService`를 주입하는 방법은 사용할 수 없습니다. `HeroService`에서 직접 현재 사용자 정보를 확인하는 것은 최선의 방법이 아니기 때문입니다.

<!--
Instead, the `HeroService` constructor takes a boolean flag to control display of secret heroes.
-->
대신, `HeroService`의 정보에 자유롭게 접근할 수 있는지 판단하는 불리언 값을 생성자에 추가해 봅시다.

<code-example path="dependency-injection/src/app/heroes/hero.service.ts" region="internals" title="src/app/heroes/hero.service.ts (excerpt)" linenums="false">
</code-example>

<!--
You can inject the `Logger`, but you can't inject the  boolean `isAuthorized`.
You'll have to take over the creation of new instances of this `HeroService` with a factory provider.
-->
이제 `Logger` 서비스를 의존성으로 주입하는 데에는 문제가 없지만, `isAuthorized` 불리언 값은 값을 지정하지 않으면 의존성으로 주입할 수 없습니다.
그래서 `HeroService`의 인스턴스를 생성하는 로직은 팩토리 프로바이더로 변경되어야 합니다.

<!--
A factory provider needs a factory function:
-->
팩토리 프로바이더는 팩토리 함수를 사용합니다:

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="factory" title="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

<!--
Although the `HeroService` has no access to the `UserService`, the factory function does.
-->
이 코드에서 `HeroService`는 `UserService`에 직접 접근할 수 없지만, 팩토리 함수는 접근할 수 있습니다.

<!--
You inject both the `Logger` and the `UserService` into the factory provider
and let the injector pass them along to the factory function:
-->
그러면 이 팩토리 함수를 동작시키기 위해 팩토리 함수에 대한 의존성을 다음과 같이 지정해야 합니다:

<code-example path="dependency-injection/src/app/heroes/hero.service.provider.ts" region="provider" title="src/app/heroes/hero.service.provider.ts (excerpt)" linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
The `useFactory` field tells Angular that the provider is a factory function
whose implementation is the `heroServiceFactory`.
-->
서비스 프로바이더를 등록할 때 `useFactory` 필드를 사용하면 이 의존성 객체는 `heroServiceFactory`와 같은 팩토리 함수가 사용된다는 것을 의미합니다.

<!--
The `deps` property is an array of [provider tokens](guide/dependency-injection#token).
The `Logger` and `UserService` classes serve as tokens for their own class providers.
The injector resolves these tokens and injects the corresponding services into the matching factory function parameters.
-->
그리고 팩토리 함수에 필요한 [프로바이더 토큰](guide/dependency-injection#token)은 `deps` 프로퍼티로 지정합니다.
그래서 이 코드에는 `Logger`와 `UserService` 클래스가 각각 클래스 프로바이더 토큰으로 사용되었습니다.
이 토큰들은 인젝터가 확인한 후에 각 토큰에 적합한 서비스 인스턴스를 팩토리 함수의 인자로 주입하게 됩니다.

</div>

<!--
Notice that you captured the factory provider in an exported variable, `heroServiceProvider`.
This extra step makes the factory provider reusable.
You can register the `HeroService` with this variable wherever you need it.
-->
팩토리 프로바이더는 `heroServiceProvider`와 같이 변수에 할당하고 파일 외부로 공개한다는 것을 잊지 마세요.
팩토리 프로바이더는 이렇게 사용해야 다음번에도 재사용할 수 있습니다.
`HeroService`가 필요한 곳이라면 이 변수를 가져다 사용할 수 있습니다.

<!--
In this sample, you need it only in the `HeroesComponent`,
where it replaces the previous `HeroService` registration in the metadata `providers` array.
Here you see the new and the old implementation side-by-side:
-->
지금까지 예제에서는 `HeroesComponent`만 이 서비스 프로바이더를 사용하며, 기존에 사용되던 `HeroService` 프로바이더를 대체하기 위해 컴포넌트 메타데이터의 `providers` 배열에 이 서비스 프로바이더를 등록해야 합니다.
지금까지 작성한 코드를 단계별로 살펴보면 다음과 같습니다:

<code-tabs>

  <code-pane title="src/app/heroes/heroes.component (v3)" path="dependency-injection/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane title="src/app/heroes/heroes.component (v2)" path="dependency-injection/src/app/heroes/heroes.component.1.ts">
  </code-pane>

</code-tabs>

<!--
{@a tree-shakable-provider}
-->

<!--
### Tree-shakable providers
-->
### 트리 셰이킹 대상이 되는 프로바이더

<!--
Tree shaking is the ability to remove code that is not referenced in an application from the final bundle. Tree-shakable providers give Angular the ability to remove services that are not used in your application from the final output. This significantly reduces the size of your bundles.
-->
트리 셰이킹은 애플리케이션에 실제로 사용되지 않은 코드를 최종 빌드 결과물에서 제외하는 기능입니다. 그리고 트리 셰이킹 대상이 되는 프로바이더는 마찬가지로 애플리케이션에 실제로 사용되지 않은 서비스를 최종 빌드 결과물에서 제외할 수 있습니다. 이 과정을 통해 불필요한 코드를 줄임으로써 최종 빌드 결과물의 용량을 줄일 수 있습니다.

<!--
Ideally, if an application is not injecting a service, it should not be included in the final output. However, it turns out that the Angular compiler cannot identify at build time if the service will be required or not. Because it's always possible to inject a service directly using `injector.get(Service)`, Angular cannot identify all of the places in your code where this injection could happen, so it has no choice but to include the service in the injector regardless. Thus, services provided in modules are not tree-shakable.
-->
이상적인 경우를 생각해 봤을 때 애플리케이션에 사용되는 서비스가 아무것도 없다면, 최종 결과물에는 어떠한 서비스도 포함되지 않는 것이 좋습니다. 하지만 이 경우는 Angular 컴파일러가 빌드 시점에 확인할 수 없는 내용입니다. 왜냐하면 의존성 객체는 클래스 생성자 뿐 아니라 `injector.get(서비스)`를 사용해서 어디에서라도 자유롭게 가져올 수 있기 때문입니다. 이 경우에 Angular는 의존성 객체가 참조되었는지 알아내기 위해서 모든 코드를 확인할 수는 없으며, 트리 셰이킹할 수 있는 타이밍을 놓치게 됩니다. 그래서 모듈에 등록된 서비스는 트리 셰이킹의 대상이 될 수 없습니다.

<!--
Let us consider an example of non-tree-shakable providers in Angular.
-->
트리 셰이킹 대상이 아닌 서비스 프로바이더를 예제와 함께 살펴봅시다.

<!--
In this example, to provide services in Angular, you include them in an `@NgModule`:
-->
이 예제에서는 서비스를 사용하기 위해 `@NgModule`에 다음과 같이 서비스 프로바이더를 등록했습니다:

<code-example path="dependency-injection/src/app/tree-shaking/service-and-module.ts"  title="src/app/tree-shaking/service-and-modules.ts" linenums="false"> </code-example>

<!--
This module can then be imported into your application module, to make the service available for injection in your app:
-->
그리고 이 모듈을 앱 모듈에 로드하면 이 서비스를 애플리케이션 전체 범위에 자유롭게 사용할 수 있습니다:

<code-example path="dependency-injection/src/app/tree-shaking/app.module.ts"  title="src/app/tree-shaking/app.modules.ts" linenums="false"> </code-example>

<!--
When `ngc` runs, it compiles AppModule into a module factory, which contains definitions for all the providers declared in all the modules it includes. At runtime, this factory becomes an injector that instantiates these services.
-->
이제 `ngc`가 동작하면 `AppModule`을 모듈 팩토리로 컴파일되는데, 이 때 이 모듈에 등록된 모든 서비스 프로바이더도 함께 컴파일됩니다. 그래서 애플리케이션이 실행되는 시점에는 모듈 팩토리가 인젝터의 역할을 하며 동작합니다.

<!--
Tree-shaking doesn't work in the method above because Angular cannot decide to exclude one chunk of code (the provider definition for the service within the module factory) based on whether another chunk of code (the service class) is used. To make services tree-shakable, the information about how to construct an instance of the service (the provider definition) needs to be a part of the service class itself.
-->
하지만 트리 셰이킹은 이런 방식으로 동작할 수 없습니다. 왜냐하면 Angular는 모듈 팩토리와 같은 코드 덩어리와 서비스 클래스와 같은 코드 덩어리만 보고는 이 서비스가 실제로 사용되었는지 판단할 수 없기 때문입니다. 그래서 서비스를 트리 셰이킹 대상으로 만들려면, 이 서비스가 어떻게 사용되는지에 대한 정보를 추가로 제공해야 합니다.

<!--
#### Creating tree-shakable providers
-->
#### 트리 셰이킹 대상이 되는 프로바이더 만들기

<!--
To create providers that are tree-shakable, the information that used to be specified in the module should be specified in the `@Injectable` decorator on the service itself.
-->
트리 셰이킹 대상이 되는 프로바이더를 만들려면 `@Injectable` 데코레이터에 이 서비스가 어떤 모듈에 사용되는지 지정해야 합니다.

<!--
The following example shows the tree-shakable equivalent to the `ServiceModule` example above:
-->
그래서 위에서 살펴본 `ServiceModule`에는 `Service`가 다음과 같이 지정되어 있었습니다:

<code-example path="dependency-injection/src/app/tree-shaking/service.ts"  title="src/app/tree-shaking/service.ts" linenums="false"> </code-example>

<!--
In the example above, `providedIn` allows you to declare the injector which injects this service. Unless there is a special case, the value should always be root. Setting the value to root ensures that the service is scoped to the root injector, without naming a particular module that is present in that injector.
-->
이 예제처럼 `providedIn` 프로퍼티를 사용하면 이 서비스가 어떤 인젝터에 등록될지 지정할 수 있습니다. 특별한 이유가 없다면 보통 이 값은 `root`이며, `providedIn: root`로 지정된 서비스는 애플리케이션 최상위 인젝터에 등록되면서 이 인젝터 범위 안에 있는 모든 모듈에서 이 서비스를 사용할 수 있습니다.

<!--
The service can be instantiated by configuring a factory function as shown below:
-->
이 서비스가 팩토리 함수를 사용한다면 다음과 같이 선언됩니다:

<code-example path="dependency-injection/src/app/tree-shaking/service.0.ts"  title="src/app/tree-shaking/service.0.ts" linenums="false"> </code-example>

<div class="alert is-helpful">

<!--
To override tree-shakable providers, register the provider using the `providers: []` array syntax of any Angular decorator that supports it.
-->
그리고 트리 셰이킹 대상이 되는 서비스 프로바이더를 오버라이드 하려면, 필요한 모듈의 `@NgModule` 데코레이터에 `providers: []`를 지정하면 됩니다.

</div>

{@a injector-config} 
{@a bootstrap}

<!--
## Inject a service
-->
## 서비스 주입하기

<!--
The `HeroListComponent` should get heroes from the `HeroService`.
-->
`HeroListComponent`는 `HeroService`에서 히어로 목록을 가져와야 합니다.

<!--
The component shouldn't create the `HeroService` with `new`.
It should ask for the `HeroService` to be injected.
-->
그런데 이 컴포넌트는 `HeroService`의 인스턴스를 생성하기 위해 `new` 키워드를 사용하지 않습니다.
어딘가에서 `HeroService`가 주입되기를 요청하기만 할 뿐입니다.

<!--
You can tell Angular to inject a dependency in the component's constructor by specifying a **constructor parameter with the dependency type**.
Here's the `HeroListComponent` constructor, asking for the `HeroService` to be injected.
-->
이때 컴포넌트의 생성자에서 **의존성으로 주입될 객체의 타입**을 지정하기만 하면 Angular가 확인하고 의존성 객체의 인스턴스를 주입합니다.
그래서 `HeroListComponent`의 생성자를 다음과 같이 작성하면 `HeroService`를 주입받을 수 있습니다.

<code-example title="src/app/heroes/hero-list.component (constructor signature)" path="dependency-injection/src/app/heroes/hero-list.component.ts"
region="ctor-signature">
</code-example>

<!--
Of course, the `HeroListComponent` should do something with the injected `HeroService`.
Here's the revised component, making use of the injected service, side-by-side with the previous version for comparison.
-->
물론 `HeroListComponent`는 이렇게 주입된 `HeroService`로 어떤 작업을 할 것입니다.
의존성 주입을 활용한 방식과 활용하지 않는 방식이 어떻게 다른지 비교해 보세요.

<code-tabs>
  <code-pane title="hero-list.component (with DI)" path="dependency-injection/src/app/heroes/hero-list.component.2.ts">
  </code-pane>

  <code-pane title="hero-list.component (without DI)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">
  </code-pane>
</code-tabs>

<!--
Notice that the `HeroListComponent` doesn't know where the `HeroService` comes from.
_You_ know that it comes from the parent `HeroesComponent`.
If you decided instead to provide the `HeroService` in the `AppModule`,
the `HeroListComponent` wouldn't change at all.
The _only thing that matters_ is that the `HeroService` is provided in some parent injector.
-->
`HeroService`의 인스턴스는 `HeroesComponent`에 등록된 프로바이더를 통해 제공되지만, `HeroListComponent`의 입장에서는 이 인스턴스가 어디에서 오는지 알지 못합니다.
그리고 이 상황에서 `HeroService`의 프로바이더가 등록된 위치를 `AppModule`로 옮긴다고 해도 `HeroListComponent`의 코드가 변경되는 것은 아무것도 없습니다.
`HeroListComponent`의 입장에서는 `HeroService`가 부모 인젝터 중 _어딘가에서 오는 것만으로 충분합니다._

{@a singleton-services}

<!--
## Singleton services
-->
## 싱글턴 서비스 (Singleton services)

<!--
Services are singletons _within the scope of an injector_.
There is at most one instance of a service in a given injector.
-->
_한 인젝터의 범위 안에서는_ 서비스는 모두 싱글턴입니다.
그래서 서비스의 인스턴스는 각각 하나만 존재합니다.

<!--
There is only one root injector, and the `UserService` is registered with that injector.
Therefore, there can be just one `UserService` instance in the entire app,
and every class that injects `UserService` get this service instance.
-->
애플리케이션의 최상위 인젝터는 단 하나이며, `UserService`는 이 인젝터에 등록되어 있습니다.
그래서 애플리케이션 전체 범위에서 `UserService`의 인스턴스는 딱 하나만 존재하며, `UserService`를 의존성으로 주입받는 클래스는 모두 같은 인스턴스를 공유합니다.

<!--
However, Angular DI is a 
[hierarchical injection system](guide/hierarchical-dependency-injection), 
which means that nested injectors can create their own service instances.
Angular creates nested injectors all the time.
-->
그런데 Angular의 의존성 주입은 [계층을 이루는 체계](guide/hierarchical-dependency-injection)이기 때문에, 하위 인젝터에서 또 다른 서비스 인스턴스를 생성할 수 있습니다.
Angular는 항상 중첩된 인젝터를 생성합니다.

{@a component-child-injectors}

<!--
## Component child injectors
-->
## 컴포넌트 자식 인젝터 (Component child injectors)

<!--
Component injectors are independent of each other and
each of them creates its own instances of the component-provided services.
-->
컴포넌트 인젝터는 서로 독립적이며, 컴포넌트마다 각각 서비스 인스턴스를 생성합니다.

<!--
For example, when Angular creates a new instance of a component that has `@Component.providers`,
it also creates a new _child injector_ for that instance.
-->
`@Component.providers`가 선언된 컴포넌트의 인스턴스를 Angular가 생성한다는 것은, 새로운 _자식 인젝터_ 를 생성한다는 것과 같은 의미입니다.

<!--
When Angular destroys one of these component instances, it also destroys the
component's injector and that injector's service instances. 
-->
그리고 이 컴포넌트 인스턴스가 종료되면 컴포넌트 인젝터도 함께 종료되며, 이 인젝터가 생성한 서비스의 인스턴스도 함께 종료됩니다.

<!--
Because of [injector inheritance](guide/hierarchical-dependency-injection),
you can still inject application-wide services into these components.
A component's injector is a child of its parent component's injector,
and a descendent of its parent's parent's injector, and so on all the way back to the application's _root_ injector.
Angular can inject a service provided by any injector in that lineage.
-->
[의존성 주입은 상속관계를 갖기 때문에](guide/hierarchical-dependency-injection) 컴포넌트의 프로바이더에 등록되지 않고 앱 전역에 등록된 서비스도 이 컴포넌트에 주입될 수 있습니다.
컴포넌트 인젝터는 부모 컴포넌트 인젝터의 자식이며, 이 계층 관계는 애플리케이션 _최상위_ 인젝터까지 올라갑니다.
이 계층 안에 등록된 서비스는 자유롭게 의존성으로 주입될 수 있습니다.

<!--
For example, Angular could inject a `HeroListComponent`
with both the `HeroService` provided in `HeroComponent`
and the `UserService` provided in `AppModule`.
-->
그래서 `HeroComponent`와 `HeroListComponent`는 `HeroComponent`에 등록된 `HeroService`를 의존성으로 주입받을 수 있으며, 마찬가지로 `AppModule`에 등록된 `UserService`도 주입받을 수 있습니다.

{@a testing-the-component}

<!--
## Testing the component
-->
## 컴포넌트 테스트하기

<!--
Earlier you saw that designing a class for dependency injection makes the class easier to test.
Listing dependencies as constructor parameters may be all you need to test application parts effectively.
-->
위에서 언급한 것처럼, 의존성 패턴을 활용하면 컴포넌트 클래스를 테스트할 때 좀 더 편해집니다.
왜냐하면 테스트할 컴포넌트에 필요한 의존성 객체들은 생성자에 인자로 지정하기만 하면 되기 때문입니다.

<!--
For example, you can create a new `HeroListComponent` with a mock service that you can manipulate
under test:
-->
그래서 `HeroListComponent`를 테스트하면서 목 서비스를 사용한다면 다음과 같이 작성할 수 있습니다:

<code-example path="dependency-injection/src/app/test.component.ts" region="spec" title="src/app/test.component.ts" linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
Learn more in the [Testing](guide/testing) guide.
-->
더 자세한 내용은 [테스트](guide/testing) 문서를 참고하세요.

</div>

{@a service-needs-service}

## When the service needs a service

The `HeroService` is very simple. It doesn't have any dependencies of its own.

What if it had a dependency? What if it reported its activities through a logging service?
You'd apply the same *constructor injection* pattern,
adding a constructor that takes a `Logger` parameter.

Here is the revised `HeroService` that injects the `Logger`, side-by-side with the previous service for comparison.

<code-tabs>

  <code-pane title="src/app/heroes/hero.service (v2)" path="dependency-injection/src/app/heroes/hero.service.2.ts">
  </code-pane>

  <code-pane title="src/app/heroes/hero.service (v1)" path="dependency-injection/src/app/heroes/hero.service.1.ts">
  </code-pane>

</code-tabs>

The constructor asks for an injected instance of a `Logger` and stores it in a private field called `logger`.
The `getHeroes()` method logs a message when asked to fetch heroes.


{@a logger-service}

#### The dependent _Logger_ service

The sample app's `Logger` service is quite simple:

<code-example path="dependency-injection/src/app/logger.service.ts" title="src/app/logger.service.ts">
</code-example>

If the app didn't provide this `Logger`,
Angular would throw an exception when it looked for a `Logger` to inject
into the `HeroService`.

<code-example language="sh" class="code-shell">
  ERROR Error: No provider for Logger!
</code-example>

Because a singleton logger service is useful everywhere,
it's provided in the root `AppModule`.

<code-example path="dependency-injection/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (providers)" region="providers-2">
</code-example>



{@a token}

## Dependency injection tokens

When you register a provider with an injector, you associate that provider with a dependency injection token.
The injector maintains an internal *token-provider* map that it references when
asked for a dependency. The token is the key to the map.

In all previous examples, the dependency value has been a class *instance*, and
the class *type* served as its own lookup key.
Here you get a `HeroService` directly from the injector by supplying the `HeroService` type as the token:

<code-example path="dependency-injection/src/app/injector.component.ts" region="get-hero-service" title="src/app/injector.component.ts" linenums="false">
</code-example>

You have similar good fortune when you write a constructor that requires an injected class-based dependency.
When you define a constructor parameter with the `HeroService` class type,
Angular knows to inject the
service associated with that `HeroService` class token:

<code-example path="dependency-injection/src/app/heroes/hero-list.component.ts" region="ctor-signature" title="src/app/heroes/hero-list.component.ts">
</code-example>

This is especially convenient when you consider that most dependency values are provided by classes.

{@a non-class-dependencies}

### Non-class dependencies

What if the dependency value isn't a class? Sometimes the thing you want to inject is a
string, function, or object.

Applications often define configuration objects with lots of small facts
(like the title of the application or the address of a web API endpoint)
but these configuration objects aren't always instances of a class.
They can be object literals such as this one:

<code-example path="dependency-injection/src/app/app.config.ts" region="config" title="src/app/app.config.ts (excerpt)" linenums="false">
</code-example>

What if you'd like to make this configuration object available for injection?
You know you can register an object with a [value provider](guide/dependency-injection#value-provider).

But what should you use as the token?
You don't have a class to serve as a token.
There is no `AppConfig` class.

<div class="alert is-helpful">

### TypeScript interfaces aren't valid tokens

The `HERO_DI_CONFIG` constant conforms to the `AppConfig` interface. 
Unfortunately, you cannot use a TypeScript interface as a token:

<code-example path="dependency-injection/src/app/providers.component.ts" region="providers-9-interface"  linenums="false">
</code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-9-ctor-interface"  linenums="false">
</code-example>

That seems strange if you're used to dependency injection in strongly typed languages, where
an interface is the preferred dependency lookup key.

It's not Angular's doing. An interface is a TypeScript design-time artifact. JavaScript doesn't have interfaces.
The TypeScript interface disappears from the generated JavaScript.
There is no interface type information left for Angular to find at runtime.

</div>


{@a injection-token}

### _InjectionToken_

One solution to choosing a provider token for non-class dependencies is
to define and use an [*InjectionToken*](api/core/InjectionToken).
The definition of such a token looks like this:

<code-example>
import { InjectionToken } from '@angular/core';
export const TOKEN = new InjectionToken('desc');
</code-example>

You can directly configure a provider when creating an `InjectionToken`. The provider configuration determines which injector provides the token and how the value will be created.  This is similar to using `@Injectable`, except that you cannot define standard providers (such as `useClass` or `useFactory`) with `InjectionToken`. Instead, you specify a factory function which returns the value to be provided directly.

<code-example>
export const TOKEN = 
  new InjectionToken('desc', { providedIn: 'root', factory: () => new AppConfig(), })
</code-example>

Now you can inject the configuration object into any constructor that needs it, with
the help of an `@Inject` decorator:

<code-example>
constructor(@Inject(TOKEN));
</code-example>

If the factory function needs access to other DI tokens, it can use the inject function from `@angular/core` to request dependencies.

<code-example>
const TOKEN = 
  new InjectionToken('tree-shakable token', 
    { providedIn: 'root', factory: () => 
        new AppConfig(inject(Parameter1), inject(Parameter2)), });
</code-example>

{@a optional}

## Optional dependencies

You can tell Angular that the dependency is optional by annotating the constructor argument with null:

<code-example>
constructor(@Inject(Token, null));
</code-example>

When using optional dependencies, your code must be prepared for a null value.

## Summary

You learned the basics of Angular dependency injection in this page.
You can register various kinds of providers,
and you know how to ask for an injected object (such as a service) by
adding a parameter to a constructor.

Angular dependency injection is more capable than this guide has described.
You can learn more about its advanced features, beginning with its support for
nested injectors, in
[Hierarchical Dependency Injection](guide/hierarchical-dependency-injection).

{@a explicit-injector}

## Appendix: Working with injectors directly

Developers rarely work directly with an injector, but
here's an `InjectorComponent` that does.

<code-example path="dependency-injection/src/app/injector.component.ts" region="injector" title="src/app/injector.component.ts">
</code-example>

An `Injector` is itself an injectable service.

In this example, Angular injects the component's own `Injector` into the component's constructor.
The component then asks the injected injector for the services it wants in `ngOnInit()`.

Note that the services themselves are not injected into the component.
They are retrieved by calling `injector.get()`.

The `get()` method throws an error if it can't resolve the requested service.
You can call `get()` with a second parameter, which is the value to return if the service
is not found. Angular can't find the service if it's not registered with this or any ancestor injector.


<div class="alert is-helpful">



The technique is an example of the
[service locator pattern](https://en.wikipedia.org/wiki/Service_locator_pattern).

**Avoid** this technique unless you genuinely need it.
It encourages a careless grab-bag approach such as you see here.
It's difficult to explain, understand, and test.
You can't know by inspecting the constructor what this class requires or what it will do.
It could acquire services from any ancestor component, not just its own.
You're forced to spelunk the implementation to discover what it does.

Framework developers may take this approach when they
must acquire services generically and dynamically.


</div>

{@a one-class-per-file}

## Appendix: one class per file

Having multiple classes in the same file is confusing and best avoided.
Developers expect one class per file. Keep them happy.

If you combine the `HeroService` class with
the `HeroesComponent` in the same file,
**define the component last**.
If you define the component before the service,
you'll get a runtime null reference error.


<div class="alert is-helpful">

You actually can define the component first with the help of the `forwardRef()` method as explained
in this [blog post](http://blog.thoughtram.io/angular/2015/09/03/forward-references-in-angular-2.html).

But it's best to avoid the problem altogether by defining components and services in separate files.

</div>

