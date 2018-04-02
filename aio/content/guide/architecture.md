<!--
# Architecture overview
-->
# 아키텍처 개요

<!--
Angular is a platform and framework for building client applications in HTML and TypeScript.
Angular is itself written in TypeScript. It implements core and optional functionality as a set of TypeScript libraries that you import into your apps.
-->
Angular는 HTML과 TypeScript로 클라이언트 애플리케이션을 개발할 때 사용하는 플랫폼이자 프레임워크입니다.
Angular 자체도 TypeScript로 개발되었으며, 프레임워크가 제공하는 기능은 TypeScript 라이브러리처럼 참조해서 애플리케이션에 활용할 수 있습니다.

<!--
The basic building blocks of an Angular application are _NgModules_, which provide a compilation context for _components_. NgModules collect related code into functional sets; an Angular app is defined by a set of NgModules. An app always has at least a _root module_ that enables bootstrapping, and typically has many more _feature modules_.
-->
Angular 애플리케이션의 구성 요소 중 가장 중요한 것은 _컴포넌트_의 묶음인 _NgModule_ 입니다.  NgModule은 비슷한 기능을 하나로 묶어서 관리하기 위한 모듈이며, Angular 애플리케이션은 부트스트랩을 하기 위해 _최상위 모듈_ 을 꼭 갖습니다. 보통 이 모듈 외에 _기능 모듈_ 을 더 정의해서 사용하게 됩니다.

<!--
* Components define *views*, which are sets of screen elements that Angular can choose among and modify according to your program logic and data. Every app has at least a root component.
-->
* 컴포넌트는 *뷰*를 정의합니다. 컴포넌트는 화면에 어떤 엘리먼트가 어떤 데이터를 가지고 표시할지 지정하며, 모든 앱은 기본적으로 최상위 컴포넌트를 갖습니다.

<!--
* Components use *services*, which provide specific functionality not directly related to views. Service providers can be *injected* into components as *dependencies*, making your code modular, reusable, and efficient.
-->
* 컴포넌트는 *서비스*를 활용합니다. 뷰와 직접 관련있지 않은 기능은 컴포넌트에 있을 필요가 없으며, 이런 로직은 서비스에 정의하고 컴포넌트에 *의존성*으로 *주입* 해서 사용하면 코드를 모듈 단위로 관리할 수 있기 때문에 재사용하기 편하고 훨씬 효율적입니다.

<!--
Both components and services are simply classes, with *decorators* that mark their type and provide metadata that tells Angular how to use them.
-->
컴폰넌트와 서비스는 단순한 클래스지만, *데코레이터*와 메타데이터를 사용해서 이 클래스가 Angular에서 어떤 역할을 할지 지정할 수 있습니다.

<!--
* The metadata for a component class associates it with a *template* that defines a view. A template combines ordinary HTML with Angular *directives* and *binding markup* that allow Angular to modify the HTML before rendering it for display.
-->
* 컴포넌트 클래스에 메타데이터를 지정하면 *템플릿*을 뷰로 지정할 수 있습니다. 템플릿은 일반적인 HTML 문법을 바탕으로 Angular가 제공하는 *디렉티브*와 *바인딩 마크업*을 사용합니다. 이 템플릿은 Angular에서 처리한 후에 화면에 렌더링됩니다.

<!--
* The metadata for a service class provides the information Angular needs to make it available to components through *Dependency Injection (DI)*.
-->
* 서비스 클래스에 메타데이터를 지정하면 Angular 컴포넌트에 *의존성으로 주입(DI)*할 수 있습니다.

<!--
An app's components typically define many views, arranged hierarchically. Angular provides the `Router` service to help you define navigation paths among views. The router provides sophisticated in-browser navigational capabilities.
-->
Angular 애플리케이션에서는 여러가지 뷰를 계층으로 구성합니다. 그리고 `Router` 서비스를 사용하면 이 뷰들을 전환하면서 페이지를 이동할 수 있습니다. 라우터 서비스는 브라우저의 페이지 전환 로직을 활용하면서 정교하게 동작합니다.

<!--
## Modules
-->
## 모듈

<!--
Angular defines the `NgModule`, which differs from and complements the JavaScript (ES2015) module. An NgModule declares a compilation context for a set of components that is dedicated to an application domain, a workflow, or a closely related set of capabilities. An NgModule can associate its components with related code, such as services, to form functional units.
-->
Angular는 JavaScript (ES2015) 모듈과 다르면서 서로 보완적인 `NgModule` 체계를 마련해 두었습니다. NgModule은 기능적으로 관련되거나 작업 흐름이 연관된 컴포넌를 묶어서 선언합니다. 그리고 이 NgModule에는 컴포넌트 외에 서비스나 폼 그룹을 포함하기도 합니다.

<!--
Every Angular app has a _root module_, conventionally named `AppModule`, which provides the bootstrap mechanism that launches the application. An app typically contains many functional modules.
-->
모든 Angular 앱에는 보통 `AppModule`이라는 이름으로 선언하는 _최상위 모듈_ 이 존재합니다. 애플리케이션의 부트스트랩 방법은 이 모듈에서 지정하며, 이 모듈 아래로 여러 기능 모듈을 포함할 수 있습니다.

<!--
Like JavaScript modules, NgModules can import functionality from other NgModules, and allow their own functionality to be exported and used by other NgModules. For example, to use the router service in your app, you import the `Router` NgModule.
-->
JavaScript 모듈과 비슷하게 NgModule도 다른 NgModule을 불러오거나 다른 NgModule을 위해 모듈의 기능 일부를 외부로 공개할 수 있습니다. 예를 들면, 애플리케이션에서 라우터 서비스를 사용하려면 `Router` NgModule을 불러와야 합니다.

<!--
Organizing your code into distinct functional modules helps in managing development of complex applications, and in designing for reusability. In addition, this technique lets you take advantage of _lazy-loading_&mdash;that is, loading modules on demand&mdash;in order to minimize the amount of code that needs to be loaded at startup.
-->
비슷한 코드를 하나의 기능 모듈로 관리하면 코드를 더 효율적으로 관리할 수 있습니다. 이렇게 만든 모듈은 코드를 재사용하는 측면에서도 더 효율적이며, 복잡한 애플리케이션을 개발할수록 체감할 수 있는 효율이 증가할 것입니다. 그리고 코드를 모듈로 관리하면 애플리케이션이 실행될 때 모든 모듈을 한 번에 불러오지 않고, 필요할 때 불러오는 _지연 로딩_ 을 활용할 때도 유리합니다. 지연 로딩을 활용하면 애플리케이션의 초기 실행 속도를 최소화할 수 있습니다.

<div class="l-sub-section">

  <!--
  For a more detailed discussion, see [Introduction to modules](guide/architecture-modules).
  -->
  모듈에 대해 좀 더 자세하게 알아보려면 [모듈 소개](guide/architecture-modules) 문서를 확인해 보세요.

</div>

<!--
## Components
-->
## 컴포넌트

<!--
Every Angular application has at least one component, the *root component* that connects a component hierarchy with the page DOM. Each component defines a class that contains application data and logic, and is associated with an HTML *template* that defines a view to be displayed in a target environment.
-->
Angular 애플리케이션에는 페이지 DOM의 최상위에 위치하는 컴포넌트가 존재하는데, 이 컴포넌트를 *최상위 컴포넌트* 라고 합니다. 그리고 모든 컴포넌트는 컴포넌트 클래스와 *템플릿*으로 구성하는데, 컴포넌트 클래스는 애플리케이션 데이터와 로직을 처리하고 템플릿은 화면에 보일 HTML을 정의합니다.

<!--
The `@Component` decorator identifies the class immediately below it as a component, and provides the template and related component-specific metadata.
-->
Angular 컴포넌트는 컴포넌트 클래스에 `@Component` 데코레이터를 사용해서 컴포넌트에 대한 메타데이터를 지정하면서 템플릿도 함께 지정합니다.

<div class="l-sub-section">

  <!--
   Decorators are functions that modify JavaScript classes. Angular defines a number of such decorators that attach specific kinds of metadata to classes, so that it knows what those classes mean and how they should work.
  -->
   데코레이터는 JavaScript 클래스를 변형하는 함수입니다. Angular에서 제공하는 데코레이터를 어떻게 사용하는지에 따라 클래스의 용도가 달라집니다.

   <!--
   <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">Learn more about decorators on the web.</a>
   -->
   <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">데코레이터 더 알아보기</a>

</div>

<!--
### Templates, directives, and data binding
-->
### 템플릿, 디렉티브, 데이터 바인딩

<!--
A template combines HTML with Angular markup that can modify the HTML elements before they are displayed.
Template *directives* provide program logic, and *binding markup* connects your application data and the document object model (DOM).
-->
템플릿은 HTML을 바탕으로, 여기에 HTML 엘리먼트를 변형할 수 있는 Angular 마크업을 사용해서 작성합니다.
이 때 템플릿 *디렉티브*를 사용해서 간단한 로직을 추가할 수 있으며, *바인딩 마크업*으로 애플리케이션 데이터와 DOM을 연결할 수 있습니다.

<!--
* *Event binding* lets your app respond to user input in the target environment by updating your application data.
* *Property binding* lets you interpolate values that are computed from your application data into the HTML.
-->
* *이벤트 바인딩*을 사용하면 사용자의 입력에 반응하면서 데이터를 처리할 수 있습니다.
* *프로퍼티 바인딩*을 사용하면 애플리케이션 데이터를 HTML에 반영할 수 있습니다.

<!--
Before a view is displayed, Angular evaluates the directives and resolves the binding syntax in the template to modify the HTML elements and the DOM, according to your program data and logic. Angular supports *two-way data binding*, meaning that changes in the DOM, such as user choices, can also be reflected back into your program data.
-->
Angular는 뷰를 화면에 표시하기 전에 디렉티브를 평가하고 바인딩 문법을 처리해서 템플릿에 반영하거나 DOM을 조작합니다. 단방향 바인딩 외에 *양방향 데이터 바인딩* 을 사용할 수도 있는데, 이 바인딩은 컴포넌트 클래스에 있는 데이터를 뷰에 표시한 이후에 뷰에서 발생한 사용자의 동작을 다시 컴포넌트 클래스에 반영할 때 사용합니다.

<!--
Your templates can also use *pipes* to improve the user experience by transforming values for display. Use pipes to display, for example, dates and currency values in a way appropriate to the user's locale. Angular provides predefined pipes for common transformations, and you can also define your own.
-->
데이터를 화면에 표시될 때 특정 형식을 지정하려면 *파이프*를 사용할 수 있습니다. 예를 들면 날짜나 통화 데이터를 사용자의 국가 형식에 맞게 변형할 때 사용할 수 있습니다. 많이 사용하는 파이프는 Angular에서 제공하고 있으며, 필요한 기능이 더 있다면 직접 파이프를 정의해서 사용할 수도 있습니다.

<div class="l-sub-section">

  <!--
  For a more detailed discussion of these concepts, see [Introduction to components](guide/architecture-components).
  -->
  컴포넌트에 대해 좀 더 자세하게 알아보려면 [컴포넌트 소개](guide/architecture-components) 문서를 확인해 보세요.

</div>

<!--
{@a dependency-injection}
-->
{@a 의존성-주입}

<!--
## Services and dependency injection
-->
## 서비스, 의존성 주입

<!--
For data or logic that is not associated with a specific view, and that you want to share across components, you create a *service* class. A service class definition is immediately preceded by the `@Injectable` decorator. The decorator provides the metadata that allows your service to be *injected* into client components as a dependency.
-->
어떤 데이터나 함수가 하나의 뷰에만 적용되는 것이 아니라면 *서비스* 클래스를 만들어서 활용할 수 있습니다. 서비스 클래스는 `@Inejctable` 데코레이터를 사용해서 정의하며, 이 데코레이터를 사용하면 컴포넌트나 다른 서비스에 의존성으로 *주입*하기 위해 다른 구성요소보다 먼저 처리됩니다.

<!--
 *Dependency injection* (or DI) lets you keep your component classes lean and efficient. They don't fetch data from the server, validate user input, or log directly to the console; they delegate such tasks to services.
-->
*의존성 주입(Dependency injection, DI)*을 사용하면 컴포넌트 클래스를 유연하면서도 효율적으로 구성할 수 있습니다. 서버에서 데이터를 받아오거나, 사용자의 입력을 검증한다던지, 콘솔에 로그를 출력하는 로직은 특정 뷰와 직접적인 관련이 없기 때문에 서비스에서 처리하는 것이 좋습니다.

<div class="l-sub-section">
  <!--
  For a more detailed discusssion, see [Introduction to services and DI](guide/architecture-services).
  -->
  서비스와 의존성 주입에 대해 좀 더 자세하게 알아보려면 [서비스와 DI 소개](guide/architecture-services) 문서를 확인해 보세요.
</div>

<!--
### Routing
-->
### 라우팅

The Angular `Router` NgModule provides a service that lets you define a navigation path among the different application states and view hierarchies in your app. It is modeled on the familiar browser navigation conventions:

* Enter a URL in the address bar and the browser navigates to a corresponding page.
* Click links on the page and the browser navigates to a new page.
* Click the browser's back and forward buttons and the browser navigates backward and forward through the history of pages you've seen.

The router maps URL-like paths to views instead of pages. When a user performs an action, such as clicking a link, that would load a new page in the browser, the router intercepts the browser's behavior, and shows or hides view hierarchies.

If the router determines that the current application state requires particular functionality, and the module that defines it has not been loaded, the router can _lazy-load_ the module on demand.

The router interprets a link URL according to your app's view navigation rules and data state. You can navigate to new views when the user clicks a button, selects from a drop box, or in response to some other stimulus from any source. The Router logs activity in the browser's history journal, so the back and forward buttons work as well.

To define navigation rules, you associate *navigation paths* with your components. A path uses a URL-like syntax that integrates your program data, in much the same way that template syntax integrates your views with your program data. You can then apply program logic to choose which views to show or to hide, in response to user input and your own access rules.

 <div class="l-sub-section">

   For a more detailed discussion, see [Routing and navigation](guide/router).

 </div>

<hr/>

## What's next

You've learned the basics about the main building blocks of an Angular application. The following diagram shows how these basic pieces are related.

<figure>
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
</figure>

* Together, a component and template define an Angular view.
  * A decorator on a component class adds the metadata, including a pointer to the associated template.
  * Directives and binding markup in a component's template modify views based on program data and logic.
* The dependency injector provides services to a component, such as the router service that lets you define navigation among views.

Each of these subjects is introduced in more detail in the following pages.

* [Modules](guide/architecture-modules)
* [Components](guide/architecture-components)
  * [Templates](guide/architecture-components#templates-and-views)
  * [Metadata](guide/architecture-components#component-metadata)
  * [Data binding](guide/architecture-components#data-binding)
  * [Directives](guide/architecture-components#directives)
  * [Pipes](guide/architecture-components#pipes)
* [Services and dependency injection](guide/architecture-services)

<div class="l-sub-section">

   Note that the code referenced on these pages is available as a <live-example></live-example>.
</div>

When you are familiar with these fundamental building blocks, you can explore them in more detail in the documentation. To learn about more tools and techniques that are available to help you build and deploy Angular applications, see [Next steps](guide/architecture-next-steps).
</div>
