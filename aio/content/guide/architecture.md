<!--
# Architecture overview
-->
# 아키텍처 개요

<!--
Angular is a platform and framework for building client applications in HTML and TypeScript.
Angular is written in TypeScript. It implements core and optional functionality as a set of TypeScript libraries that you import into your apps.
-->
Angular는 HTML과 TypeScript로 클라이언트 애플리케이션을 개발할 때 사용하는 플랫폼이자 프레임워크입니다.
Angular 자체도 TypeScript로 개발되었으며, 프레임워크가 제공하는 기능은 TypeScript 라이브러리처럼 참조해서 애플리케이션에 활용할 수 있습니다.

<!--
The basic building blocks of an Angular application are *NgModules*, which provide a compilation context for *components*. NgModules collect related code into functional sets; an Angular app is defined by a set of NgModules. An app always has at least a *root module* that enables bootstrapping, and typically has many more *feature modules*.
-->
Angular 애플리케이션의 구성 요소 중 가장 중요한 것은 *컴포넌트*의 묶음인 *NgModule* 입니다.  NgModule은 비슷한 기능을 하나로 묶어서 관리하기 위한 모듈이며, Angular 애플리케이션은 부트스트랩을 하기 위해 *최상위 모듈* 을 꼭 갖습니다. 보통 이 모듈 외에 *기능 모듈* 을 더 정의해서 사용하게 됩니다.

<!--
* Components define *views*, which are sets of screen elements that Angular can choose among and modify according to your program logic and data. 
-->
* 컴포넌트는 *뷰*를 정의하는데, 화면에 어떤 엘리먼트가 어떤 데이터를 표시할지 지정합니다.

<!--
* Components use *services*, which provide specific functionality not directly related to views. Service providers can be *injected* into components as *dependencies*, making your code modular, reusable, and efficient.
-->
* 컴포넌트는 *서비스*를 활용합니다. 뷰와 직접 관련있지 않은 기능은 컴포넌트에 있을 필요가 없으며, 이런 로직은 서비스에 정의하고 컴포넌트에 *의존성*으로 *주입* 해서 사용하면 코드를 모듈 단위로 관리할 수 있기 때문에 재사용하기 편하고 훨씬 효율적입니다.

<!--
Both components and services are simply classes, with *decorators* that mark their type and provide metadata that tells Angular how to use them.
-->
컴포넌트와 서비스는 단순한 클래스지만, *데코레이터*와 메타데이터를 사용해서 이 클래스가 Angular에서 어떤 역할을 할지 지정할 수 있습니다.

<!--
* The metadata for a component class associates it with a *template* that defines a view. A template combines ordinary HTML with Angular *directives* and *binding markup* that allow Angular to modify the HTML before rendering it for display.
-->
* 컴포넌트 클래스에 메타데이터를 지정하면 *템플릿*을 뷰로 지정할 수 있습니다. 템플릿은 일반적인 HTML 문법을 바탕으로 Angular가 제공하는 *디렉티브*와 *바인딩 마크업*을 사용합니다. 이 템플릿은 Angular에서 처리한 후에 화면에 렌더링됩니다.

<!--
* The metadata for a service class provides the information Angular needs to make it available to components through *dependency injection (DI)*.
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
Angular *NgModules* differ from and complement JavaScript (ES2015) modules. An NgModule declares a compilation context for a set of components that is dedicated to an application domain, a workflow, or a closely related set of capabilities. An NgModule can associate its components with related code, such as services, to form functional units.
-->
Angular는 JavaScript (ES2015) 모듈과 다르면서 서로 보완적인 `NgModule` 체계를 마련해 두었습니다. NgModule은 기능적으로 관련되거나 작업 흐름이 연관된 컴포넌트를 묶어서 선언합니다. 그리고 이 NgModule에는 컴포넌트 외에 서비스나 폼 기능을 포함하기도 합니다.

<!--
Every Angular app has a *root module*, conventionally named `AppModule`, which provides the bootstrap mechanism that launches the application. An app typically contains many functional modules.
-->
모든 Angular 앱에는 보통 `AppModule`이라는 이름으로 선언하는 *최상위 모듈* 이 존재합니다. 애플리케이션의 부트스트랩 방법은 이 모듈에서 지정하며, 이 모듈 아래로 여러 기능 모듈을 포함할 수 있습니다.

<!--
Like JavaScript modules, NgModules can import functionality from other NgModules, and allow their own functionality to be exported and used by other NgModules. For example, to use the router service in your app, you import the `Router` NgModule.
-->
JavaScript 모듈과 비슷하게 NgModule도 다른 NgModule을 불러오거나 다른 NgModule을 위해 모듈의 기능 일부를 외부로 공개할 수 있습니다. 예를 들면, 애플리케이션에서 라우터 서비스를 사용하려면 `Router` NgModule을 불러와야 합니다.

<!--
Organizing your code into distinct functional modules helps in managing development of complex applications, and in designing for reusability. In addition, this technique lets you take advantage of *lazy-loading*&mdash;that is, loading modules on demand&mdash;to minimize the amount of code that needs to be loaded at startup.
-->
비슷한 코드를 하나의 기능 모듈로 관리하면 코드를 더 효율적으로 관리할 수 있습니다. 이렇게 만든 모듈은 코드를 재사용하는 측면에서도 더 효율적이며, 복잡한 애플리케이션을 개발할수록 체감할 수 있는 효율이 증가할 것입니다. 그리고 코드를 모듈로 관리하면 애플리케이션이 실행될 때 모든 모듈을 한 번에 불러오지 않고, 필요할 때 불러오는 *지연 로딩* 을 활용할 때도 유리합니다. 지연 로딩을 활용하면 애플리케이션의 초기 실행 속도를 최소화할 수 있습니다.

<div class="alert is-helpful">

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
Every Angular application has at least one component, the *root component* that connects a component hierarchy with the page document object model (DOM). Each component defines a class that contains application data and logic, and is associated with an HTML *template* that defines a view to be displayed in a target environment.
-->
Angular 애플리케이션에는 페이지 DOM의 최상위에 위치하는 컴포넌트가 존재하는데, 이 컴포넌트를 *최상위 컴포넌트* 라고 합니다. 그리고 모든 컴포넌트는 컴포넌트 클래스와 *템플릿*으로 구성하는데, 컴포넌트 클래스는 애플리케이션 데이터와 로직을 처리하고 템플릿은 화면에 표시할 HTML을 정의합니다.

<!--
The `@Component()` decorator identifies the class immediately below it as a component, and provides the template and related component-specific metadata.
-->
Angular 컴포넌트는 컴포넌트 클래스에 `@Component()` 데코레이터를 사용해서 컴포넌트에 대한 메타데이터를 지정하면서 템플릿도 함께 지정합니다.

<div class="alert is-helpful">

   <!--
   Decorators are functions that modify JavaScript classes. Angular defines a number of decorators that attach specific kinds of metadata to classes, so that the system knows what those classes mean and how they should work.
   -->
   데코레이터는 JavaScript 클래스를 변형하는 함수입니다. Angular에서 제공하는 데코레이터를 어떻게 사용하는지에 따라 클래스의 동작이 달라집니다.

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
A template combines HTML with Angular markup that can modify HTML elements before they are displayed.
Template *directives* provide program logic, and *binding markup* connects your application data and the DOM.
There are two types of data binding:
-->
템플릿은 HTML 문법과 Angular 마크업 문법을 조합해서 구성합니다. Angular 마크업 문법은 HTML 엘리먼트를 확장하는 역할을 합니다.
템플릿에 *디렉티브*를 사용하면 원하는 동작을 하도록 확장할 수 있고, *바인딩 마크업* 문법을 사용하면 애플리케이션 데이터를 DOM과 연결할 수 있습니다.
데이터 바인딩에는 두 종류가 있습니다:

<!--
* *Event binding* lets your app respond to user input in the target environment by updating your application data.
* *Property binding* lets you interpolate values that are computed from your application data into the HTML.
-->
* *이벤트 바인딩*을 사용하면 사용자의 동작에 따라 애플리케이션 데이터를 갱신할 수 있습니다.
* *프로퍼티 바인딩*을 사용하면 애플리케이션 데이터를 HTML 문서에 표시할 수 있습니다.

<!--
Before a view is displayed, Angular evaluates the directives and resolves the binding syntax in the template to modify the HTML elements and the DOM, according to your program data and logic. Angular supports *two-way data binding*, meaning that changes in the DOM, such as user choices, are also reflected in your program data.
-->
Angular는 뷰가 화면에 표시되기 전에 템플릿에 사용된 디렉티브와 바인딩 문법을 모두 체크해서 HTML 엘리먼트와 DOM을 변형합니다. 이 때 애플리케이션 데이터나 로직이 템플릿에 반영됩니다. Angular는 *양방향 데이터 바인딩*도 지원합니다. 이 바인딩 방식을 사용하면 애플리케이션 데이터를 템플릿에 반영할 뿐만 아니라 사용자의 행동에 의해 DOM이 변경되었을 때 애플리케이션 데이터를 다시 갱신할 수도 있습니다.

<!--
Your templates can use *pipes* to improve the user experience by transforming values for display. 
For example, use pipes to display dates and currency values that are appropriate for a user's locale.
Angular provides predefined pipes for common transformations, and you can also define your own pipes.
-->
화면에 표시되는 데이터를 사용자가 알아보기 쉽게 하려면 *파이프*를 사용할 수도 있습니다. 예를 들면 날짜나 화폐를 사용자의 언어 환경에 맞게 표시하는 용도로 사용할 수 있습니다.
일반적인 기능은 Angular 프레임워크에서도 제공합니다. 그리고 이 중에 원하는 기능이 없다면 커스텀 파이프를 만들어서 활용할 수도 있습니다.

<div class="alert is-helpful">

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
For data or logic that isn't associated with a specific view, and that you want to share across components, you create a *service* class. A service class definition is immediately preceded by the `@Injectable()` decorator. The decorator provides the metadata that allows other providers to be **injected** as dependencies into your class.
-->
어떤 데이터나 함수가 하나의 뷰에만 적용되는 것이 아니라면 *서비스* 클래스를 만들어서 활용할 수 있습니다. 서비스 클래스는 `@Inejctable` 데코레이터를 사용해서 정의하며, 이 데코레이터를 사용하면 컴포넌트나 다른 서비스에 의존성으로 *주입*하기 위해 다른 구성요소보다 먼저 처리됩니다.

<!--
 *Dependency injection* (DI) lets you keep your component classes lean and efficient. They don't fetch data from the server, validate user input, or log directly to the console; they delegate such tasks to services.
-->
*의존성 주입(Dependency injection, DI)*을 사용하면 컴포넌트 클래스를 유연하면서도 효율적으로 구성할 수 있습니다. 서버에서 데이터를 받아오거나, 사용자의 입력을 검증한다던지, 콘솔에 로그를 출력하는 로직은 특정 뷰와 직접적인 관련이 없기 때문에 서비스에서 처리하는 것이 좋습니다.

<div class="alert is-helpful">

  <!--
  For a more detailed discussion, see [Introduction to services and DI](guide/architecture-services).
  -->
  서비스와 의존성 주입에 대해 좀 더 자세하게 알아보려면 [서비스와 DI 소개](guide/architecture-services) 문서를 확인해 보세요.

</div>

<!--
### Routing
-->
### 라우팅

<!--
The Angular `Router` NgModule provides a service that lets you define a navigation path among the different application states and view hierarchies in your app. It is modeled on the familiar browser navigation conventions:
-->
Angular에서 제공하는 `Router` NgModule을 사용하면 네비게이션 주소를 전환하면서 애플리케이션의 상태를 변경할 수 있습니다. 페이지를 전환하는 것도 애플리케이션의 상태를 변경하는 것이며, Angular의 페이지 전환 방식은 브라우저의 페이지 전환 방식을 바탕으로 구현되었습니다:

<!--
* Enter a URL in the address bar and the browser navigates to a corresponding page.

* Click links on the page and the browser navigates to a new page.

* Click the browser's back and forward buttons and the browser navigates backward and forward through the history of pages you've seen.
-->
* 주소표시줄에 URL을 입력하면 브라우저가 해당 페이지로 전환합니다.
* 페이지에 있는 링크를 클릭하면 브라우저가 해당 페이지로 전환합니다.
* 브라우저의 뒤로 가기/앞으로 가기 버튼을 클릭하면 브라우저 히스토리에 따라 뒤로/앞으로 페이지를 전환합니다.

<!--
The router maps URL-like paths to views instead of pages. When a user performs an action, such as clicking a link, that would load a new page in the browser, the router intercepts the browser's behavior, and shows or hides view hierarchies.
-->
Angular의 라우터는 페이지 대신 뷰를 URL과 맵핑합니다. 사용자가 링크를 클릭했다면 브라우저에서 새로운 페이지로 전환하려고 하겠지만, 라우터는 이 동작을 중지시키고 페이지 이동 없이 뷰만 전환합니다.

<!--
If the router determines that the current application state requires particular functionality, and the module that defines it hasn't been loaded, the router can *lazy-load* the module on demand.
-->
그리고 아직 로드되지 않은 모듈에 있는 페이지로 전환하려고 하면, 라우터가 *지연 로딩* 을 사용해서 모듈을 불러오고 난 후에 뷰를 전환합니다.

<!--
The router interprets a link URL according to your app's view navigation rules and data state. You can navigate to new views when the user clicks a button or selects from a drop box, or in response to some other stimulus from any source. The router logs activity in the browser's history, so the back and forward buttons work as well.
-->
라우터는 미리 정의된 네비게이션 룰과 데이터 상태에 따라 해당되는 뷰로 전환합니다. 뷰 전환은 사용자가 버튼을 클릭했을 때 일어날 수도 있고, 드롭 박스를 선택했을 때, 다른 로직에서 발생한 결과에 의해서도 일어날 수 있습니다. 이 때마다 라우터는 브라우저의 히스토리에 로그를 저장하며, 이 로그를 활용해서 뒤로 가기/앞으로 가기 버튼에도 반응할 수 있습니다.

<!--
To define navigation rules, you associate *navigation paths* with your components. A path uses a URL-like syntax that integrates your program data, in much the same way that template syntax integrates your views with your program data. You can then apply program logic to choose which views to show or to hide, in response to user input and your own access rules.
-->
네비게이션 룰은 *네비게이션 경로*를 컴포넌트와 연결해서 정의합니다. 이 때 네비게이션 경로는 URL과 비슷한 형식으로 정의하며, 뷰에 있는 데이터를 활용할 수도 있습니다. 사용자의 입력이나 애플리케이션의 규칙에 따라 어떤 뷰로 전환할지 선택할 수 있고, 뷰를 추가로 표시하거나 숨길 수도 있습니다.

 <div class="alert is-helpful">

<!--
   For a more detailed discussion, see [Routing and navigation](guide/router).
 -->
   더 자세한 내용을 확인하려면 [라우팅과 네비게이션](guide/router) 문서를 확인하세요.

 </div>

<hr/>

<!--
## What's next
-->
## 다음 단계

<!--
You've learned the basics about the main building blocks of an Angular application. The following diagram shows how these basic pieces are related.
-->
지금까지 Angular 애플리케이션을 구성하는 기본 요소에 대해 알아봤습니다. 아래 다이어그램을 보면서 지금까지 다뤘던 내용을 다시 한 번 확인해 보세요.

<figure>
  <!--
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
  -->
  <img src="generated/images/guide/architecture/overview2.png" alt="개요">
</figure>

<!--
* Together, a component and template define an Angular view.
  * A decorator on a component class adds the metadata, including a pointer to the associated template.
  * Directives and binding markup in a component's template modify views based on program data and logic.
* The dependency injector provides services to a component, such as the router service that lets you define navigation among views.
-->
* 컴포넌트와 템플릿은 Angular의 뷰를 정의합니다.
  * 데코레이터는 컴포넌트 클래스에 메타데이터를 추가하며, 이 때 템플릿을 지정합니다.
  * 컴포넌트 템플릿에 사용하는 디렉티브와 바인딩 마크업은 데이터와 프로그램 로직에 따라 템플릿을 조작합니다.
* 서비스는 컴포넌트에 의존성으로 주입해서 사용합니다. 예를 들어 뷰에서 네비게이션 기능을 사용하려면 라우터 서비스를 주입받아 사용하면 됩니다.

<!--
Each of these subjects is introduced in more detail in the following pages.
-->
그리고 다음 주제들은 다른 문서에서 좀 더 자세하게 다룹니다.

<!--
* [Introduction to Modules](guide/architecture-modules)

* [Introduction to Components](guide/architecture-components)

  * [Templates and views](guide/architecture-components#templates-and-views)

  * [Component metadata](guide/architecture-components#component-metadata)

  * [Data binding](guide/architecture-components#data-binding)

  * [Directives](guide/architecture-components#directives)

  * [Pipes](guide/architecture-components#pipes)

* [Introduction to services and dependency injection](guide/architecture-services)
-->
* [모듈](guide/architecture-modules)

* [컴포넌트](guide/architecture-components)

  * [템플릿과 뷰](guide/architecture-components#템플릿과-뷰)

  * [컴포넌트 메타데이터](guide/architecture-components#컴포넌트-메타데이터)

  * [데이터 바인딩](guide/architecture-components#데이터-바인딩)

  * [디렉티브](guide/architecture-components#디렉티브)

  * [파이프](guide/architecture-components#파이프)

* [서비스와 의존성 주입](guide/architecture-services)

<div class="alert is-helpful">
<!--
   Note that the code referenced on these pages is available as a <live-example></live-example>.
-->
 이 문서에서 다룬 코드는 <live-example></live-example>에서도 확인할 수 있습니다.
</div>

<!--
When you're familiar with these fundamental building blocks, you can explore them in more detail in the documentation. To learn about more tools and techniques that are available to help you build and deploy Angular applications, see [Next steps: tools and techniques](guide/architecture-next-steps).
-->
Angular 애플리케이션의 기본 요소에 이미 익숙하다면 각각을 좀 더 깊이 있게 다루는 문서를 확인해 보는 것도 좋습니다. 그리고 애플리케이션 개발이나 배포에 사용하는 툴이나 테크닉을 먼저 알아보려면 [이 문서](guide/architecture-next-steps)를 확인해 보세요.

</div>
