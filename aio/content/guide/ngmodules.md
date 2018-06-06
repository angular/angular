# NgModules

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following concepts:
* [Bootstrapping](guide/bootstrapping).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).
-->
다음 내용을 먼저 이해하고 이 문서를 보는 것이 좋습니다:
* [부트스트랩](guide/bootstrapping).
* [JavaScript Modules vs. NgModules](guide/ngmodule-vs-jsmodule).

<hr>

<!--
**NgModules** configure the injector and the compiler and help organize related things together.
-->
**NgModule**을 구성하는 방법에 따라 애플리케이션이 조합되는 방식이 달라지기 때문에, NgModule은 인젝터(injector)와 컴파일러에 영향을 미칩니다.

<!--
An NgModule is a class marked by the `@NgModule` decorator.
`@NgModule` takes a metadata object that describes how to compile a component's template and how to create an injector at runtime.
It identifies the module's own components, directives, and pipes,
making some of them public, through the `exports` property, so that external components can use them.
`@NgModule` can also add service providers to the application dependency injectors.
-->
NgModule은 `@NgModule` 데코레이터가 지정된 클래스입니다.
이 때 `@NgModule` 데코레이터는 메타데이터 객체를 받는데, 이 모듈에 있는 컴포넌트 템플릿이 어떻게 컴파일되는지, 인젝터를 어떻게 생성할지 등을 설정합니다.
그리고 NgModule에는 이 모듈에 속한 컴포넌트와 디렉티브, 파이프를 등록하며, 이 구성요소들을 `exports` 배열에 지정하면 다른 모듈에서도 이 구성요소를 사용할 수 있도록 모듈 외부로 공개할 수 있습니다.
`@NgModule`에는 의존성 주입에 사용할 서비스 프로바이더도 지정할 수 있습니다.

<!--
For an example app showcasing all the techniques that NgModules related pages
cover, see the <live-example></live-example>. For explanations on the individual techniques, visit the relevant NgModule pages under the NgModules
section.
-->
이 문서에서 다루는 모든 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.


<!--
## Angular modularity
-->
## Angular의 모듈 구성방식

<!--
Modules are a great way to organize an application and extend it with capabilities from external libraries.
-->
모듈은 애플리케이션을 효율적으로 구성하기 위해 마련된 체계이며, 외부 라이브러리를 효율적으로 사용하기 위한 방법이기도 합니다.

<!--
Angular libraries are NgModules, such as `FormsModule`, `HttpClientModule`, and `RouterModule`.
Many third-party libraries are available as NgModules such as
<a href="https://material.angular.io/">Material Design</a>,
<a href="http://ionicframework.com/">Ionic</a>, and
<a href="https://github.com/angular/angularfire2">AngularFire2</a>.
-->
Angular에서 제공하는 `FormsModule`이나 `HttpClientModule`, `RouterModule`과 같은 라이브러리들도 NgModule입니다. 그리고 <a href="https://material.angular.io/">Material Design</a>이나 <a href="http://ionicframework.com/">Ionic</a>, <a href="https://github.com/angular/angularfire2">AngularFire2</a>와 같이 NgModule 형태로 제공되는 서드파티 라이브러리도 있습니다.

<!--
NgModules consolidate components, directives, and pipes into
cohesive blocks of functionality, each focused on a
feature area, application business domain, workflow, or common collection of utilities.
-->
NgModule은 컴포넌트와 디렉티브, 파이프 등 기능이 연관된 구성요소를 하나로 묶어 관리하는 단위이며, 기능의 측면이나 애플리케이션 비즈니스 도메인, 업무 흐름, 공통 유틸 등 해당 모듈이 담당하는 부분에만 집중하도록 구성합니다.

<!--
Modules can also add services to the application.
Such services might be internally developed, like something you'd develop yourself or come from outside sources, such as the Angular router and HTTP client.
-->
모듈은 애플리케이션에 어떤 기능을 추가하기 위해 사용할 수도 있습니다.
이것이 개발자가 혼자 개발용으로 사용하기 위한 기능인지, 외부 코드에서 가져온 코드인지에 관계없이 어떤 것이든 가능합니다. Angular 라우터나 HTTP 클라이언트 서비스도 이런 종류에 해당한다고 할 수 있습니다.

<!--
Modules can be loaded eagerly when the application starts or lazy loaded asynchronously by the router.
-->
그리고 모듈은 애플리케이션이 실행되면서 바로 로드할 수도 있고, 라우터를 사용해서 비동기로 지연 로딩할 수도 있습니다.

<!--
NgModule metadata does the following:
-->
NgModule 메타데이터는 다음과 같은 역할을 합니다:

<!--
* Declares which components, directives, and pipes belong to the module.
* Makes some of those components, directives, and pipes public so that other module's component templates can use them.
* Imports other modules with the components, directives, and pipes that components in the current module need.
* Provides services that the other application components can use.
-->
* 해당 모듈에 속한 컴포넌트, 디렉티브, 파이프가 어떤 것인지 정의합니다.
* 모듈에 속한 컴포넌트, 디렉티브, 파이프 중 모듈 외부로 공개할 요소를 지정하면 다른 모듈의 컴포넌트 템플릿에서 이 구성요소를 사용할 수 있습니다.
* 해당 모듈에 필요한 다른 모듈의 컴포넌트, 디렉티브, 파이프를 로드합니다.
* 컴포넌트에 사용할 서비스 프로바이더를 등록합니다.

<!--
Every Angular app has at least one module, the root module.
You [bootstrap](guide/bootstrapping) that module to launch the application.
-->
모든 Angular 앱은 반드시 최상위 모듈이 존재하며, 따라서 최소한 한 개 이상의 모듈을 갖는다고 할 수 있습니다.
애플리케이션은 이 최상위 모듈을 [부트스트랩](guide/bootstrapping)하면서 시작됩니다.

<!--
The root module is all you need in a simple application with a few components.
As the app grows, you refactor the root module into [feature modules](guide/feature-modules)
that represent collections of related functionality.
You then import these modules into the root module.
-->
최상위 모듈에는 애플리케이션 실행에 필요한 컴포넌트만 간단하게 정의합니다.
애플리케이션이 점점 커지면서 최상위 모듈은 담당하는 기능에 따라 여러 개의 [기능 모듈](guide/feature-modules)로 나뉘어 질 것입니다.
그러면 최상위 모듈은 직접 컴포넌트를 로드하는 대신 다른 모듈을 로드하는 방식으로 수정될 것입니다.

<!--
## The basic NgModule
-->
## 기본 NgModule

<!--
The CLI generates the following basic app module when creating a new app.
-->
Angular CLI로 애플리케이션을 생성하면 앱 모듈은 다음과 같이 생성됩니다.

<code-example path="bootstrapping/src/app/app.module.ts" region="whole-ngmodule" title="src/app/app.module.ts" linenums="false">
</code-example>

<!--
At the top are the import statements. The next section is where you configure the `@NgModule` by stating what components and directives belong to it (`declarations`) as well as which other modules it uses (`imports`). This page builds on [Bootstrapping](guide/bootstrapping), which covers the structure of an NgModule in detail. If you need more information on the structure of an `@NgModule`, be sure to read [Bootstrapping](guide/bootstrapping).
-->
이 파일의 제일 위쪽에는 `import` 구문들이 있습니다. 그 다음에는 `@NgModule` 데코레이터가 있으며, 이 데코레이터의 메타데이터에는 모듈에 포함되는 컴포넌트와 디렉티브를 정의하는 `declarations` 배열과, 다른 모듈의 구성요소를 불러오는 `imports` 배열이 있습니다.
이 예제는 [부트스트랩](guide/bootstrapping) 가이드 문서에 있는 코드를 참고한 것이며, `@NgModule`의 구조에 대해 더 알아보려면 [해당 문서](guide/bootstrapping)를 참고하세요.

<hr />

<!--
## More on NgModules
-->
## NgModule 더 알아보기

<!--
You may also be interested in the following:
* [Feature Modules](guide/feature-modules).
* [Entry Components](guide/entry-components).
* [Providers](guide/providers).
* [Types of NgModules](guide/module-types).
-->
다음 내용을 더 확인해 보세요:
* [기능 모듈](guide/feature-modules)
* [진입 컴포넌트](guide/entry-components)
* [프로바이더](guide/providers)
* [NgModules의 타입](guide/module-types)