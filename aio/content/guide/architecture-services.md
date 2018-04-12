<!--
# Introduction to services and dependency injection
-->
# 서비스와 의존성 주입

<!--
<img src="generated/images/guide/architecture/service.png" alt="Service" class="left">
-->
<img src="generated/images/guide/architecture/service.png" alt="서비스" class="left">

<!--
_Service_ is a broad category encompassing any value, function, or feature that an app needs. A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.
-->
_서비스_ 는 앱에서 공통으로 사용하는 상수나 함수, 기능을 모아놓은 단위입니다. 좁은 의미로 보면 클래스 하나만을 서비스라고 하는 경우도 있지만, 보통 넓은 의미로 사용합니다. 좀 더 자세하게 알아봅시다.
<br class="clear">

<!--
Angular distinguishes components from services in order to increase modularity and reusability.
-->
Angular는 컴포넌트와 서비스를 확실하게 구분해서 모듈화와 재사용 효율성을 높이는 것을 권장합니다.

<!--
* By separating a component's view-related functionality from other kinds of processing, you can make your component classes lean and efficient. Ideally, a component's job is to enable the user experience and nothing more.  It should present properties and methods for data binding, in order to mediate between the view (rendered by the template) and the application logic (which often includes some notion of a _model_).
-->
* 컴포넌트에서 뷰와 관련된 로직을 다른 로직과 분리하면 컴포넌트 클래스를 간결하게 구성할 수 있습니다. 그리고 이상적인 경우를 따지면 컴포넌트에는 해당 뷰에서 일어나는 사용자의 행동에 관련된 로직만 두는 것이 좋습니다. 그리고 템플릿이 렌더링된 뷰와 _모델_ 을 정의하는 애플리케이션 로직은 컴포넌트 프로퍼티와 메소드로 데이터 바인딩합니다.

<!--
* A component should not need to define things like how to fetch data from the server, validate user input, or log directly to the console. Instead, it can delegate such tasks to services. By defining that kind of processing task in an injectable service class, you make it available to any component. You can also make your app more adaptable by injecting different providers of the same kind of service, as appropriate in different circumstances.
-->
* 서버에서 데이터를 가져오는 로직이나 사용자의 입력을 검증하는 로직, 콘솔에 로그를 출력하는 로직은 컴포넌트에 두지 않는 것이 좋습니다. 이 로직들은 서비스에 두는 것이 더 바람직합니다. 왜냐하면 여러 컴포넌트에서 사용하는 기능은 서비스 클래스에 구현하고 의존성으로 주입하는 것이 효율적이기 때문입니다. 그리고 환경에 따라 서비스 프로바이더를 다르게 지정하면 애플리케이션을 다양한 환경에서 동작하도록 좀 더 유연하게 만들 수 있습니다.

<!--
Angular doesn't *enforce* these principles. Angular does help you *follow* these principles by making it easy to factor your
application logic into services and make those services available to components through *dependency injection*.
-->
물론 Angular가 이런 방식을 *강제* 하는 것은 아닙니다. 하지만 Angular가 제공하는 방식을 따른다면 서비스를 *의존성으로 주입* 하는 메커니즘을 활용할 수 있기 때문에, 컴포넌트 코드를 간결하게 유지하고 애플리케이션 로직을 효율적으로 관리할 수 있습니다.

<!--
## Service examples
-->
## 서비스 예제

<!--
Here's an example of a service class that logs to the browser console:
-->
브라우저 콘솔에 로그를 출력하는 서비스 클래스를 예로 들어봅시다:

<code-example path="architecture/src/app/logger.service.ts" linenums="false" title="src/app/logger.service.ts (class)" region="class"></code-example>

<!--
Services can depend on other services. For example, here's a `HeroService` that depends on the `Logger` service, and also uses `BackendService` to get heroes. That service in turn might depend on the `HttpClient` service to fetch heroes asynchronously from a server.
-->
서비스는 다른 서비스와 독립적일 수 있습니다. 예를 들어 `HeroService`는 `Logger` 서비스를 사용하면서, 서버에서 히어로 목록을 받아오기 위해 `BackendService`라는 서비스를 함께 사용할 수도 있습니다. 그리고 `BackendService`는 서버와 통신하기 위해 `HttpClient` 서비스를 다른 의존성으로 사용할 수도 있습니다.

<code-example path="architecture/src/app/hero.service.ts" linenums="false" title="src/app/hero.service.ts (class)" region="class"></code-example>

<hr/>

<!--
## Dependency injection
-->
## 의존성 주입

<!--
<img src="generated/images/guide/architecture/dependency-injection.png" alt="Service" class="left">
-->
<img src="generated/images/guide/architecture/dependency-injection.png" alt="서비스" class="left">

<!--
Components consume services; that is, you can *inject* a service into a component, giving the component access to that service class. 
-->
컴포넌트는 서비스를 활용합니다. 이 말은, 서비스를 컴포넌트에 *의존성으로 주입*하면 컴포넌트에서 서비스 클래스에 접근할 수 있다는 말입니다.

<!--
To define a class as a service in Angular, use the `@Injectable` decorator to provide the metadata that allows Angular to inject it into a component as a *dependency*.  
-->
클래스를 Angular 서비스로 정의하려면 `@Injectable` 데코레이터를 사용하는데, 이 때  컴포넌트에 *의존성 주입*할 때 필요한 메타데이터를 전달해야 합니다.

<!--
Similarly, use the `@Injectable` decorator to indicate that a component or other class (such as another service, a pipe, or an NgModule) _has_ a dependency. A dependency doesn't have to be a service&mdash;it could be a function, for example, or a value. 
-->
그리고 이 `@Injectable` 데코레이터는 서비스에만 사용하는 것이 아니고 컴포넌트나 파이프, NgModule에도 사용할 수 있습니다. 의존성으로 주입되는 것이 꼭 서비스일 필요는 없으며, 함수나 상수도 의존성으로 주입할 수 있습니다.

<!--
*Dependency injection* (often called DI) is wired into the Angular framework and used everywhere to provide new components with the services or other things they need.
-->
Angular 프레임워크는 *의존성 주입(Dependency injection, DI)*을 활용해서 컴포넌트와 서비스를 자유롭게 연결합니다.

<!--
* The *injector* is the main mechanism. You don't have to create an Angular injector. Angular creates an application-wide injector for you during the bootstrap process.
-->
* 이 때 *인젝터*가 중요합니다. 개발자가 인젝터를 직접 만들 필요는 없으며, 인젝터가 필요하면 Angular가 자동으로 생성하고 의존성 주입에 활용합니다.

<!--
* The injector maintains a *container* of dependency instances that it has already created, and reuses them if possible.
-->
* 인젝터는 이미 의존성으로 주입된 객체의 인스턴스를 *컨테이너*로 관리합니다. 컨테이너에 있는 객체가 다시 사용되면 인스턴스를 생성하지 않고 같은 인스턴스를 재사용합니다.

<!--
* A *provider* is a recipe for creating a dependency. For a service, this is typically the service class itself. For any dependency you need in your app, you must register a provider with the app's injector, so that the injector can use it to create new instances.
-->
* *프로바이더*는 의존성으로 주입되는 객체가 어떻게 만들어질지 정의합니다. 서비스를 생각해보면, 프로바이더는 서비스 클래스 자체가 되는 것이 일반적입니다. 그래서 애플리케이션에 의존성 주입이 필요하면 이 의존성 객체의 인스턴스을 생성 방법을 프로바이더에 등록해야 하며, 인젝터가 의존성 객체의 인스턴스를 생성할 때 이 프로바이더를 활용합니다.

<!--
When Angular creates a new instance of a component class, it determines which services or other dependencies that component needs by looking at the types of its constructor parameters. For example, the constructor of `HeroListComponent` needs a `HeroService`:
-->
Angular는 컴포넌트 클래스의 인스턴스를 생성할 때 이 컴포넌트의 생성자에 명시된 인자의 타입을 보고 어떤 서비스나 컴포넌트를 의존성으로 주입받는지 확인합니다. 예를 들어 다음 코드에서는 `HeroListComponent`의 생성자에서 `HeroService`를 의존성으로 주입받는다고 명시하고 있습니다.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (constructor)" region="ctor"></code-example>

When Angular discovers that a component depends on a service, it first checks if the injector already has any existing instances of that service. If a requested service instance does not yet exist, the injector makes one using the registered provider, and adds it to the injector before returning the service to Angular.

When all requested services have been resolved and returned, Angular can call the component's constructor with those services as arguments.

The process of `HeroService` injection looks something like this:

<figure>
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service" class="left">
</figure>

### Providing services

You must register at least one *provider* of any service you are going to use. You can register providers in modules or in components.

* When you add providers to the [root module](guide/architecture-modules), the same instance of a service is available to all components in your app.

<code-example path="architecture/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (module providers)" region="providers"></code-example>

* When you register a provider at the component level, you get a new instance of the
service with each new instance of that component. At the component level, register a service provider in the `providers` property of the `@Component` metadata:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (component providers)" region="providers"></code-example>

For more detailed information, see the [Dependency Injection](guide/dependency-injection) section.

<hr/>
