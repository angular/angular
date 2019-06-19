<!--
# Dependency Injection in Angular
-->
# Angular의 의존성 주입

<!--
Dependency injection (DI), is an important application design pattern.
Angular has its own DI framework, which is typically
used in the design of Angular applications to increase their efficiency and modularity.
-->
의존성 주입(Dependency injection, DI)은 애플리케이션 디자인 패턴 중에서도 아주 중요한 패턴입니다.
Angular는 독자적인 의존성 주입 시스템을 제공하고 있기 때문에, 이 패턴을 활용하면 Angular 애플리케이션을 좀 더 효율적인 모듈 형태로 구성할 수 있습니다.

<!--
Dependencies are services or objects that a class needs to perform its function.
DI is a coding pattern in which a class asks for dependencies from external sources rather than creating them itself.
-->
의존성(dependencies)은 어떤 클래스가 동작하기 위해 필요한 서비스나 객체를 의미합니다.
그리고 의존성 주입 패턴은 이 의존성을 직접 생성하지 않고 외부 어딘가에서 받아오도록 요청하는 패턴입니다.

<!--
In Angular, the DI framework provides declared dependencies to a class when that class is instantiated. This guide explains how DI works in Angular, and how you use it to make your apps flexible, efficient, and robust, as well as testable and maintainable.
-->
Angular에서는 클래스의 인스턴스가 생성될 때 이 클래스에 필요한 의존성을 프레임워크가 생성해서 전달합니다. 이 문서는 Angular에서 의존성 주입이 어떻게 동작하는지, 의존성 주입을 활용하면 애플리케이션을 얼마나 효율적이면서 유연한 구조로 작성할 수 있는지 설명합니다. 의존성 주입을 사용하면 테스트하기 편하고 유지보수하기도 좋은 애플리케이션을 구현할 수 있습니다.

<div class="alert is-helpful">

 <!--
 You can run the <live-example></live-example> of the sample app that accompanies this guide.
 -->
 이 문서에서 설명하는 예제는 <live-example></live-example>에서 직접 실행하거나 다운받아 확인할 수 있습니다.

</div>

<!--
Start by reviewing this simplified version of the _heroes_ feature
from the [The Tour of Heroes](tutorial/). This simple version doesn't use DI; we'll walk through converting it to do so.
-->
[히어로들의 여행](tutorial/)에서 살펴본 예제를 간단하게 재작성한 코드부터 시작해 봅시다. 이 예제에는 아직 의존성 주입이 사용되지 않았습니다. 이 코드에 의존성 주입을 구현해 봅시다.

<code-tabs>
  <code-pane header="src/app/heroes/heroes.component.ts" path="dependency-injection/src/app/heroes/heroes.component.1.ts" region="v1">
  </code-pane>

  <code-pane header="src/app/heroes/hero-list.component.ts" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">
  </code-pane>

  <code-pane header="src/app/heroes/hero.ts" path="dependency-injection/src/app/heroes/hero.ts">
  </code-pane>

  <code-pane header="src/app/heroes/mock-heroes.ts" path="dependency-injection/src/app/heroes/mock-heroes.ts">
  </code-pane>

</code-tabs>

<!--
`HeroesComponent` is the top-level heroes component.
Its only purpose is to display `HeroListComponent`, which displays a list of hero names.
-->
최상위 컴포넌트는 `HeroesComponent`입니다.
이 컴포넌트의 목적은 화면에 `HeroListComponent`를 표시해서 히어로의 목록을 출력하는 것입니다.

<!--
This version of the `HeroListComponent` gets heroes from the `HEROES` array, an in-memory collection
defined in a separate `mock-heroes` file.
-->
지금 구현한 `HeroListComponent`는 `mock-heroes` 파일에 정의된 `HEROES` 배열을 메모리에 올려서 참조합니다.

<code-example header="src/app/heroes/hero-list.component.ts (class)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts" region="class">
</code-example>

<!--
This approach works for prototyping, but is not robust or maintainable.
As soon as you try to test this component or get heroes from a remote server,
you have to change the implementation of `HeroesListComponent` and
replace every use of the `HEROES` mock data.
-->
이 방식은 프로토타이핑 할 때 적합한 방식이지만 실제 운영환경에는 적합하지 않습니다.
왜냐하면 이 컴포넌트에 테스트를 적용하거나 리모트 서버에서 데이터를 가져오도록 변경한다면 `HeroesListComponent`를 반드시 수정해야 하며, 상황에 따라 매번 `HEROES` 목 데이터를 변경해야 할 수도 있기 때문입니다.

<!--
## Create and register an injectable service
-->
## 의존성 주입 가능한 서비스 생성하고 등록하기

<!--
The DI framework lets you supply data to a component from an injectable _service_ class, defined in its own file. To demonstrate, we'll create an injectable service class that provides a list of heroes, and register that class as a provider of that service.
-->
목 데이터는 파일에 정의해 두고 이 데이터를 _서비스_ 클래스로 감싸서 컴포넌트에 주입할 수 있습니다. 이 내용을 확인해보기 위해 히어로의 목록을 제공하는 서비스 클래스를 정의하고 이 클래스를 의존성 주입할 수 있도록 등록해 봅시다.

<div class="alert is-helpful">

<!--
Having multiple classes in the same file can be confusing. We generally recommend that you define components and services in separate files.

If you do combine a component and service in the same file,
it is important to define the service first, and then the component. If you define the component before the service, you get a run-time null reference error.

It is possible to define the component first with the help of the `forwardRef()` method as explained in this [blog post](http://blog.thoughtram.io/angular/2015/09/03/forward-references-in-angular-2.html).

You can also use forward references to break circular dependencies.
See an example in the [DI Cookbook](guide/dependency-injection-in-action#forwardref).
-->
한 파일에 클래스를 여러개 정의하면 이 파일을 접하는 많은 사람들에게 혼란을 줄 수 있습니다. 일반적으로 컴포넌트와 서비스는 파일 하나에 하나씩 정의하는 것을 권장합니다.

그런데 어떤 이유로 컴포넌트와 서비스를 한 파일에 정의해야 한다면 서비스를 먼저 정의하고 컴포넌트를 나중에 정의하세요. 서비스보다 컴포넌트를 먼저 정의하면 런타임 null 참조 에러가 발생합니다.

그리고 [이 블로그](http://blog.thoughtram.io/angular/2015/09/03/forward-references-in-angular-2.html)에서 설명한 것처럼 `forwardRef()` 메소드를 사용하면 컴포넌트를 먼저 정의할 수도 있습니다.

`forwardRef()` 메소드는 순환 참조를 방지할 때도 사용합니다.
[DI Cookbook](guide/dependency-injection-in-action#forwardref)에서 설명하는 예제를 참고하세요.


</div>

<!--
### Create an injectable service class
-->
### 의존성으로 주입할 서비스 클래스 정의하기

<!--
The [Angular CLI](cli) can generate a new `HeroService` class in the `src/app/heroes` folder with this command.
-->
[Angular CLI](cli)를 사용해서 `src/app/heroes` 폴더에 `HeroService` 클래스를 생성하려면 다음 명령을 실행하면 됩니다.

<code-example language="sh" class="code-shell">
ng generate service heroes/hero
</code-example>

<!--
The command creates the following `HeroService` skeleton.
-->
이 명령을 실행하면 다음과 같은 `HeroService` 기본 코드가 생성됩니다.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts" header="src/app/heroes/hero.service.ts (CLI-generated)">
</code-example>

<!--
The `@Injectable()` is an essential ingredient in every Angular service definition. The rest of the class has been written to expose a `getHeroes` method that returns the same mock data as before. (A real app would probably get its data asynchronously from a remote server, but we'll ignore that to focus on the mechanics of injecting the service.)
-->
Angular 서비스를 정의하는 코드에서 `@Injectable()`이 가장 중요합니다. 그리고 이전에 목 데이터를 반환하던 로직은 클래스 코드에서 `getHeroes` 메소드가 제공하도록 하려면 다음과 같이 구현할 수 있습니다. (실제 앱에서는 목 데이터를 반환하는 대신 리모트 서버에서 비동기로 데이터를 가져오게 될 것입니다. 지금은 서비스를 의존성으로 주입하는 것에만 집중하기 위해 이 부분은 생략합니다.)

<code-example path="dependency-injection/src/app/heroes/hero.service.3.ts" header="src/app/heroes/hero.service.ts">
</code-example>


{@a injector-config}
{@a bootstrap}

<!--
### Configure an injector with a service provider
-->
### 서비스 프로바이더를 인젝터에 등록하기

<!--
The class we have created provides a service. The `@Injectable()` decorator marks it as a service
that can be injected, but Angular can't actually inject it anywhere until you configure
an Angular [dependency injector](guide/glossary#injector) with a [provider](guide/glossary#provider) of that service.
-->
이렇게 만든 클래스는 Angular가 서비스로 인식하고 의존성으로 주입할 수 있도록 `@Injectable()` 데코레이터를 사용해서 [인젝터](guide/glossary#injector)에 [프로바이더](guide/glossary#provider)로 등록해야 합니다.

<!--
The injector is responsible for creating service instances and injecting them into classes like `HeroListComponent`.
You rarely create an Angular injector yourself. Angular creates injectors for you as it executes the app, starting with the _root injector_ that it creates during the [bootstrap process](guide/bootstrapping).
-->
서비스의 인스턴스를 생성하고 `HeroListComponent`와 같은 클래스에 주입하는 것은 인젝터의 역할입니다.
Angular 애플리케이션을 개발하면서 인젝터를 직접 생성해야 하는 일은 거의 없습니다. 인젝터는 애플리케이션이 [부트스트랩](guide/bootstrapping)되는 과정에 _최상위 인젝터_ 부터 트리를 따라가면서 Angular가 생성합니다.

<!--
A provider tells an injector _how to create the service_.
You must configure an injector with a provider before that injector can create a service (or provide any other kind of dependency).
-->
인젝터는 프로바이더로 등록된 방법으로 서비스의 인스턴스를 생성합니다.
그래서 서비스나 다른 형태의 의존성 객체를 의존성으로 주입하려면 먼저 인젝터에 프로바이더를 등록해야 합니다.

<!--
A provider can be the service class itself, so that the injector can use `new` to create an instance.
You might also define more than one class to provide the same service in different ways,
and configure different injectors with different providers.
-->
프로바이더에 서비스 클래스를 그대로 등록하면 인젝터는 `new` 키워드를 사용해서 인스턴스를 생성합니다.
여러 클래스를 같은 서비스 타입으로 인젝터에 등록할 수 있으며, 서로 다른 프로바이더를 각기 다른 인젝터에 등록할 수도 있습니다.

<div class="alert is-helpful">

<!--
Injectors are inherited, which means that if a given injector can't resolve a dependency,
it asks the parent injector to resolve it.
A component can get services from its own injector,
from the injectors of its component ancestors,
from the injector of its parent NgModule, or from the `root` injector.

* Learn more about the [different kinds of providers](guide/dependency-injection-providers).

* Learn more about  how the [injector hierarchy](guide/hierarchical-dependency-injection) works.
-->
현재 계층에서 인젝터가 의존성 객체를 찾지 못하면 부모 인젝터에서 의존성 객체를 찾기 때문에 인젝터는 상속된다고도 할 수 있습니다.
컴포넌트의 경우에 의존성으로 주입되는 서비스를 컴포넌트 인젝터에서 찾지 못하면 부모 인젝터에서 다시 찾으며, 이 과정은 부모 NgModule을 거쳐 최상위 인젝터에 도달할 때까지 반복됩니다.

* 프로바이더의 종류에 대해 알아보려면 [의존성 주입 프로바이더](guide/dependency-injection-providers) 문서를 참고하세요.

* 인젝터의 계층에 대해 알아보려면 [인젝터 계층](guide/hierarchical-dependency-injection) 문서를 참고하세요.

</div>

<!--
You can configure injectors with providers at different levels of your app, by setting a metadata value in one of three places:

* In the `@Injectable()` decorator for the service itself.

* In the `@NgModule()` decorator for an NgModule.

* In the `@Component()` decorator for a component.

The `@Injectable()` decorator has the `providedIn` metadata option, where you can specify the provider of the decorated service class with the `root` injector, or with the injector for a specific NgModule.

The `@NgModule()` and `@Component()` decorators have the `providers` metadata option, where you can configure providers for NgModule-level or component-level injectors.
-->
프로바이더는 다음과 같이 다양한 계층의 인젝터에 등록할 수 있습니다:

* 서비스 클래스에서 `@Injectable()` 데코레이터로 직접 등록할 수 있습니다.

* NgModule의 `@NgModule()` 데코레이터에 등록할 수 있습니다.

* 컴포넌트의 `@Component()` 데코레이터에 등록할 수 있습니다.

`@Injectable()` 데코레이터를 사용할 때 `providedIn` 메타데이터 옵션을 지정하면 이 서비스가 `root` 인젝터에 등록될지, 특정 NgModule에 등록될지 지정할 수 있습니다.

`@NgModule()`이나 `@Component()` 데코레이터에서 `providers` 메타데이터 옵션을 사용하면 NgModule 계층이나 컴포넌트 계층의 인젝터에 프로바이더를 등록할 수 있습니다.

<div class="alert is-helpful">

<!--
Components are directives, and the `providers` option is inherited from `@Directive()`. You can also configure providers for directives and pipes at the same level as the component.

Learn more about [where to configure providers](guide/hierarchical-dependency-injection#where-to-register).
-->
컴포넌트도 디렉티브이기 때문에 `@Directive()`에서도 `providers` 옵션을 사용할 수 있으며, 이렇게 등록한 프로바이더도 상속된다고 볼 수 있습니다. 프로바이더는 컴포넌트 계층에 등록하는 것처럼 디렉티브나 파이프 계층에 등록할 수도 있습니다.

자세한 내용은 [프로바이더는 어디에 등록해야 할까](guide/hierarchical-dependency-injection#where-to-register) 문서를 참고하세요.

</div>

{@a injector-config}
{@a bootstrap}

<!--
## Injecting services
-->
## 서비스 주입하기

<!--
In order for `HeroListComponent` to get heroes from `HeroService`, it needs to ask for `HeroService` to be injected, rather than creating its own `HeroService` instance with `new`.

You can tell Angular to inject a dependency in a component's constructor by specifying a **constructor parameter with the dependency type**. Here's the `HeroListComponent` constructor, asking for the `HeroService` to be injected.
-->
`HeroListComponent`가 `HeroService`에서 히어로 목록을 가져오려면 이 서비스의 인스턴스가 주입되어야 하는데, 의존성 주입 패턴을 사용하면 컴포넌트에서 `new` 키워드로 `HeroService` 인스턴스를 직접 생성하는 대신 `HeroService`가 주입되도록 요청해야 합니다.

이 때 의존성 객체는 **생성자의 인자에 의존성으로 주입될 객체의 타입**을 지정하는 방식으로 Angular 프레임워크에게 요청합니다. 다음 코드는 `HeroListComponent`의 생성자로 `HeroService`를 주입하도록 요청하는 코드입니다.

<code-example header="src/app/heroes/hero-list.component (constructor signature)" path="dependency-injection/src/app/heroes/hero-list.component.ts"
region="ctor-signature">
</code-example>

<!--
Of course, `HeroListComponent` should do something with the injected `HeroService`.
Here's the revised component, making use of the injected service, side-by-side with the previous version for comparison.
-->
당연히 `HeroListComponent`는 주입받은 `HeroService`로 무언가를 할 것입니다.
의존성 주입을 사용하는 컴포넌트와 사용하지 않는 코드를 비교하면서 어떤 점이 다른지 확인해 보세요.

<code-tabs>
  <code-pane header="hero-list.component (with DI)" path="dependency-injection/src/app/heroes/hero-list.component.2.ts">
  </code-pane>

  <code-pane header="hero-list.component (without DI)" path="dependency-injection/src/app/heroes/hero-list.component.1.ts">
  </code-pane>
</code-tabs>

<!--
`HeroService` must be provided in some parent injector. The code in `HeroListComponent` doesn't depend on where `HeroService` comes from.
If you decided to provide `HeroService` in `AppModule`, `HeroListComponent` wouldn't change.
-->
이 때 `HeroService`는 부모 인젝터 중 어딘가에 반드시 등록되어야 하지만, `HeroListComponent`의 입장에서 `HeroService`가 어디에 등록되어 있는지는 중요하지 않습니다.
`HeroService`가 등록된 위치를 `AppModule`로 옮겨도 `HeroListComponent` 코드는 변경할 필요가 없습니다.

{@a singleton-services}
{@a component-child-injectors}

<!--
### Injector hierarchy and service instances
-->
### 인젝터 계층과 서비스 인스턴스

<!--
Services are singletons _within the scope of an injector_. That is, there is at most one instance of a service in a given injector.
-->
서비스는 _인젝터의 범위 안에서_ 싱글턴으로 존재합니다. 그래서 인젝터에 존재하는 서비스의 인스턴스는 언제나 하나씩입니다.

<!--
There is only one root injector for an app. Providing `UserService` at the `root` or `AppModule` level means it is registered with the root injector. There is just one `UserService` instance in the entire app and every class that injects `UserService` gets this service instance _unless_ you configure another provider with a _child injector_.
-->
애플리케이션에 존재하는 최상위 인젝터는 언제나 하나입니다. 그래서 `root`나 `AppModule` 계층에 `UserService`를 등록한다는 것은 모두 서비스 프로바이더를 최상위 인젝터에 등록한다는 것을 의미합니다. 그러면 애플리케이션 전체 범위에서 `UserService` 인스턴스가 단 하나만 존재하며, _자식 인젝터_ 에 다시 프로바이더를 등록하지 않는 한 모두 같은 `UserService`를 주입받게 됩니다.

<!--
Angular DI has a [hierarchical injection system](guide/hierarchical-dependency-injection), which means that nested injectors can create their own service instances.
Angular regularly creates nested injectors. Whenever Angular creates a new instance of a component that has `providers` specified in `@Component()`, it also creates a new _child injector_ for that instance.
Similarly, when a new NgModule is lazy-loaded at run time, Angular can create an injector for it with its own providers.
-->
Angular가 제공하는 의존성 주입 시스템은 [인젝터를 계층 구조로 구성](guide/hierarchical-dependency-injection)하기 때문에 자식 인젝터에서 서비스 인스턴스를 별개로 생성할 수도 있습니다.
Angular는 중첩된 인젝터를 빈번하게 생성합니다. 컴포넌트의 인스턴스를 새로 만들 때마다 `@Component()` 데코레이터에 `providers`가 지정되어 있으면 이 컴포넌트 인스턴스에 새로운 _자식 인젝터_ 를 생성하며, 지연로딩되는 NgModule에 새로운 인젝터를 생성하기도 합니다.

<!--
Child modules and component injectors are independent of each other, and create their own separate instances of the provided services. When Angular destroys an NgModule or component instance, it also destroys that injector and that injector's service instances.
-->
자식 모듈과 컴포넌트에 생성된 인젝터는 모두 독립적이기 때문에 서비스 인스턴스도 인젝터마다 따로 생성됩니다. 이렇게 생성된 서비스 인스턴스는 해당 NgModule이나 해당 컴포넌트가 종료되면서 함께 종료됩니다.

<!--
Thanks to [injector inheritance](guide/hierarchical-dependency-injection),
you can still inject application-wide services into these components.
A component's injector is a child of its parent component's injector, and inherits from all ancestor injectors all the way back to the application's _root_ injector. Angular can inject a service provided by any injector in that lineage.
-->
[인젝터는 계층 구조로 구성](guide/hierarchical-dependency-injection)되기 때문에 애플리케이션 계층에 등록한 서비스도 컴포넌트에 주입할 수 있습니다.
왜냐하면 컴포넌트의 인젝터는 부모 컴포넌트 인젝터의 자식 인젝터인데, 이 관계는 애플리케이션의 _최상위_ 인젝터에 도달할 때까지 동일하기 때문입니다. 부모 계층의 인젝터에 등록된 서비스는 자식 계층에 자유롭게 주입될 수 있습니다.

<!--
For example, Angular can inject `HeroListComponent` with both the `HeroService` provided in `HeroComponent` and the `UserService` provided in `AppModule`.
-->
그래서 `AppModule`에 등록된 `UserService`와 `HeroComponent`에 등록된 `HeroService` 모두 `HeroListComponent`에 주입할 수 있습니다.

{@a testing-the-component}

<!--
## Testing components with dependencies
-->
## 의존성 객체가 있는 컴포넌트 테스트하기

<!--
Designing a class with dependency injection makes the class easier to test.
Listing dependencies as constructor parameters may be all you need to test application parts effectively.

For example, you can create a new `HeroListComponent` with a mock service that you can manipulate
under test.
-->
의존성 주입을 활용하면 클래스를 테스트하기도 편합니다.
의존성으로 주입받을 객체의 타입을 생성자 인자에 지정하기만 하면 프레임워크가 모든 것을 처리합니다.

예를 들어 테스트 환경에서 `HeroListComponent`의 새 인스턴스를 생성하는데 목 서비스를 대신 주입하려면 다음과 같이 구성하면 됩니다.

<code-example path="dependency-injection/src/app/test.component.ts" region="spec" header="src/app/test.component.ts" linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
Learn more in the [Testing](guide/testing) guide.
-->
자세한 내용은 [테스트](guide/testing) 문서를 참고하세요.

</div>

{@a service-needs-service}

<!--
## Services that need other services
-->
## 서비스에 다른 서비스 주입하기

<!--
Services can have their own dependencies. `HeroService` is very simple and doesn't have any dependencies of its own. Suppose, however, that you want it to report its activities through a logging service. You can apply the same *constructor injection* pattern,
adding a constructor that takes a `Logger` parameter.

Here is the revised `HeroService` that injects `Logger`, side by side with the previous service for comparison.
-->
서비스에도 의존성 주입이 필요할 때가 있습니다. 아직은 `HeroService` 로직이 아주 간단하며 추가 의존성도 필요하지 않지만, 이제 이 서비스에서 로그를 출력해야 한다고 합시다. 그러면 컴포넌트에 작성했던 것과 같은 방식으로 *생성자에 의존성을 주입하는* 패턴을 사용해서 `Logger` 서비스를 주입받을 수 있습니다.

`Logger`를 의존성으로 주입받는 `HeroService` 코드를 확인해 보세요.

<code-tabs>

  <code-pane header="src/app/heroes/hero.service (v2)" path="dependency-injection/src/app/heroes/hero.service.2.ts">
  </code-pane>

  <code-pane header="src/app/heroes/hero.service (v1)" path="dependency-injection/src/app/heroes/hero.service.1.ts">
  </code-pane>

  <code-pane header="src/app/logger.service"
  path="dependency-injection/src/app/logger.service.ts">
  </code-pane>

</code-tabs>

<!--
The constructor asks for an injected instance of `Logger` and stores it in a private field called `logger`. The `getHeroes()` method logs a message when asked to fetch heroes.
-->
생성자는 `Logger` 타입의 객체를 의존성으로 주입하도록 요청한 후에 이 인스턴스를 `private` 프로퍼티 `logger`에 할당합니다. 그리고 `getHeroes()` 메소드에서 로그를 출력할 때 이 프로퍼티를 사용합니다.

<!--
Notice that the `Logger` service also has the `@Injectable()` decorator, even though it might not need its own dependencies. In fact, the `@Injectable()` decorator is **required  for all services**.
-->
이 때 `Logger` 서비스에는 의존성 주입이 필요하지 않지만 `@Injectable()` 데코레이터가 사용되었습니다. 실제로 `@Injectable()` 데코레이터는 **모든 서비스에 지정해야** 합니다.

<!--
When Angular creates a class whose constructor has parameters, it looks for type and injection metadata about those parameters so that it can inject the correct service.
If Angular can't find that parameter information, it throws an error.
Angular can only find the parameter information _if the class has a decorator of some kind_.
The `@Injectable()` decorator is the standard decorator for service classes.
-->
Angular가 클래스 인스턴스를 생성하면서 생성자에 객체 타입이 지정된 것을 인식하면 이 타입을 기준으로 메타데이터를 검색하기 때문에 정확한 타입의 서비스가 주입될 수 있습니다.
그리고 인젝터에서 이 타입을 찾지 못하면 에러를 발생시킵니다.
Angular는 의존성 객체를 찾을 때 _데코레이터가 사용된 클래스_ 만 대상으로 합니다.
그래서 서비스 클래스를 정의할 때 는`@Injectable()` 데코레이터를 꼭 사용해야 합니다.

<div class="alert is-helpful">

<!--
 The decorator requirement is imposed by TypeScript. TypeScript normally discards parameter type information when it [transpiles](guide/glossary#transpile) the code to JavaScript. TypeScript preserves this information if the class has a decorator and the `emitDecoratorMetadata` compiler option is set `true` in TypeScript's `tsconfig.json` configuration file. The CLI configures `tsconfig.json` with `emitDecoratorMetadata: true`.

 This means you're responsible for putting `@Injectable()` on your service classes.
-->
 데코레이터는 TypeScript 문법을 활용한 것입니다. TypeScript에서 타입을 지정하는 문법은 JavaScript로 [트랜스파일(transpile)](guide/glossary#transpile)되면서 모두 사라지지만, `tsconfig.json` 파일에서 `emitDecoratorMetadata` 컴파일 옵션을 `true`로 지정하면 이 정보를 다른 형태로 저장할 수 있습니다. 그래서 Angular CLI로 생성된 기본 `tsconfig.json` 파일에는 `emitDecoratorMetadata: true`가 지정되어 있습니다.

</div>

{@a token}

{@a injection-token}

<!--
### Dependency injection tokens
-->
### 의존성 주입 토큰 (Dependency injection tokens)

<!--
When you configure an injector with a provider, you associate that provider with a [DI token](guide/glossary#di-token).
The injector maintains an internal *token-provider* map that it references when
asked for a dependency. The token is the key to the map.
-->
인젝터에 프로바이더를 등록한다는 것은 프로바이더와 [의존성 주입 토큰](guide/glossary#di-token)을 연결한다는 것을 의미합니다.
인젝터는 인젝터 내부에 *토큰-프로바이더* 맵(map)을 관리하며 의존성 객체를 찾을 때 이 맵을 사용합니다. 이 때 토큰은 맵의 키(key)로 사용됩니다.

<!--
In simple examples, the dependency value is an *instance*, and
the class *type* serves as its own lookup key.
Here you get a `HeroService` directly from the injector by supplying the `HeroService` type as the token:
-->
의존성 주입을 간단하게 살펴볼 때 의존성으로 주입할 클래스의 *타입*은 키이며, 의존성으로 주입하는 *인스턴스*는 맵의 값(value)입니다.
그래서 `HeroService`라고 타입을 지정하면 이 타입을 토큰으로 사용해서 `HeroService`의 인스턴스를 인젝터에서 찾을 수 있습니다:

<code-example path="dependency-injection/src/app/injector.component.ts" region="get-hero-service" header="src/app/injector.component.ts" linenums="false">
</code-example>

<!--
The behavior is similar when you write a constructor that requires an injected class-based dependency.
When you define a constructor parameter with the `HeroService` class type,
Angular knows to inject the service associated with that `HeroService` class token:
-->
의존성으로 주입할 객체가 클래스인 경우에도 비슷합니다.
생성자의 인자에 타입을 `HeroService` 클래스 타입으로 지정하면 Angular는 `HeroService` 클래스 토큰에 해당하는 서비스의 인스턴스를 찾아서 의존성으로 주입합니다.

<code-example path="dependency-injection/src/app/heroes/hero-list.component.ts" region="ctor-signature" header="src/app/heroes/hero-list.component.ts">
</code-example>

<!--
Many dependency values are provided by classes, but not all. The expanded *provide* object lets you associate different kinds of providers with a DI token.

* Learn more about [different kinds of providers](guide/dependency-injection-providers).
-->
의존성 객체는 대부분 클래스로 등록하지만 항상 그런 것은 아닙니다. 하지만 객체를 *의존성으로 등록*할 때도 의존성 주입 토큰을 사용한다는 것은 동일합니다.

* [프로바이더를 다양한 형태로 등록하는 방법](guide/dependency-injection-providers)에 대해 자세하게 확인해 보세요.

{@a optional}

<!--
### Optional dependencies
-->
### 생략할 수 있는 의존성

<!--
`HeroService` *requires* a logger, but what if it could get by without
one?

When a component or service declares a dependency, the class constructor takes that dependency as a parameter.
You can tell Angular that the dependency is optional by annotating the
constructor parameter with `@Optional()`.
-->
`HeroService`는 `Logger` 서비스가 주입되도록 *요청* 하고 있지만 이 서비스를 생략해도 된다면 어떻게 해야 할까요?

컴포넌트나 서비스에 의존성 객체 타입을 지정하면 클래스의 생성자로 해당 의존성 객체의 인스턴스가 전달됩니다.
이 때 인자에 `@Optional()` 데코레이터를 사용하면 의존성 객체를 생략할 수 있다고 지정할 수 있습니다.

<code-example path="dependency-injection/src/app/providers.component.ts" region="import-optional">
</code-example>

<code-example path="dependency-injection/src/app/providers.component.ts" region="provider-10-ctor" linenums="false">
</code-example>

<!--
When using `@Optional()`, your code must be prepared for a null value. If you
don't register a logger provider anywhere, the injector sets the
value of `logger` to null.
-->
`@Optional()` 데코레이터를 사용하는 경우에는 주입되는 객체의 인스턴스가 `null`인 경우도 고려해야 합니다. `Logger` 서비스가 어디에도 등록되지 않으면 `logger` 프로퍼티에 `null` 값이 할당됩니다.

<div class="alert is-helpful">

<!--
`@Inject()` and `@Optional()` are _parameter decorators_.  They alter the way the DI framework provides a dependency, by annotating the dependency parameter on the constructor of the class that requires the dependency.

Learn more about parameter decorators in [Hierarchical Dependency Injectors](guide/hierarchical-dependency-injection).
-->
`@Inject()`와 `@Optional()`은 _인자에 사용하는 데코레이터_ 입니다. 이 데코레이터를 사용하면 의존성 주입 프레임워크가 의존성을 주입하는 방식을 변경할 수 있습니다.

인자에 사용하는 데코레이터에 대해 더 자세하게 알아보려면 [인젝터 계층](guide/hierarchical-dependency-injection) 문서를 확인하세요.

</div>

<!--
## Summary
-->
## 정리

<!--
You learned the basics of Angular dependency injection in this page.
You can register various kinds of providers,
and you know how to ask for an injected object (such as a service) by
adding a parameter to a constructor.

Dive deeper into the capabilities and advanced feature of the Angular DI system in the following pages:
-->
이 문서에서는 Angular의 의존성 주입 체계에 대해 알아봤습니다.
프로바이더는 여러가지 방법으로 등록할 수 있으며, 의존성으로 주입되는 객체는 생성자 인자에 타입을 지정하는 방식으로 구별합니다.

Angular의 의존성 주입 시스템에 대해 더 자세하게 알아보려면 다음 문서를 확인해 보세요:

<!--
* Learn more about nested injectors in
[Hierarchical Dependency Injection](guide/hierarchical-dependency-injection).

* Learn more about [DI tokens and providers](guide/dependency-injection-providers).

* [Dependency Injection in Action](guide/dependency-injection-in-action) is a cookbook for some of the interesting things you can do with DI.
-->
* 중첩된 인젝터에 대해 더 알아보려면 [인젝터 계층](guide/hierarchical-dependency-injection) 문서를 참고하세요.

* 의존성 주입 토큰과 프로바이더에 대해 더 알아보려면 [이 문서](guide/dependency-injection-providers)를 참고하세요.

* 의존성 주입을 활용하는 테크닉은 [실전 의존성 주입](guide/dependency-injection-in-action) 문서에서 확인할 수 있습니다.
