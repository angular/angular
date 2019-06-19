<!--
# Introduction to modules
-->
# 모듈 소개

<!--
Angular apps are modular and Angular has its own modularity system called *NgModules*.
NgModules are containers for a cohesive block of code dedicated to an application domain, a workflow, or a closely related set of capabilities. They can contain components, service providers, and other code files whose scope is defined by the containing NgModule. They can import functionality that is exported from other NgModules, and export selected functionality for use by other NgModules.
-->
Angular 애플리케이션은 Angular에서 제공하는 _NgModule_ 이라는 모듈 체계로 구성됩니다. NgModule은 애플리케이션 도메인이나 작업 흐름, 기능이 연관된 Angular 구성요소들을 묶어놓은 단위입니다. NgModule에는 컴포넌트나 서비스 프로바이더 등이 포함될 수 있으며, NgModule의 일부를 외부로 공개할 수도 있고, 다른 NgModule에서 이 부분을 가져와서 사용할 수도 있습니다.

<!--
Every Angular app has at least one NgModule class, [the *root module*](guide/bootstrapping), which is conventionally named `AppModule` and resides in a file named `app.module.ts`. You launch your app by *bootstrapping* the root NgModule.
-->
모든 Angular 애플리케이션에는 [_최상위 모듈_](guide/bootstrapping)이 반드시 존재하며, 이 모듈은 보통 `app.module.ts` 파일에 `AppModule`이라고 정의합니다. 애플리케이션은 이 NgModule을 *부트스트랩*하며 시작됩니다.

<!--
While a small application might have only one NgModule, most apps have many more *feature modules*. The *root* NgModule for an app is so named because it can include child NgModules in a hierarchy of any depth.
-->
애플리케이션의 규모가 작다면 NgModule은 하나만 있을 수도 있지만, 대부분은 좀 더 많은 *기능 모듈* 로 구성됩니다. 이 모듈은 `AppModule`의 자식 계층으로 구성되기 때문에 `AppModule`을 *최상위* 모듈이라고 합니다.

<!--
## NgModule metadata
-->
## NgModule 메타데이터

<!--
An NgModule is defined by a class decorated with `@NgModule()`. The `@NgModule()` decorator is a function that takes a single metadata object, whose properties describe the module. The most important properties are as follows.
-->
NgModule은 클래스에 `@NgModule()` 데코레이터를 붙여서 정의하는데, 모듈을 정의하는 메타데이터 객체를 전달하면서 실행합니다. 이 메타데이터 프로퍼티 중 다음 항목들이 특히 중요합니다.

<!--
* `declarations`: The [components](guide/architecture-components), *directives*, and *pipes* that belong to this NgModule.
-->
* `declarations`: 해당 NgModule에 포함될 [컴포넌트](guide/architecture-components)나 *디렉티브*, *파이프* 를 선언합니다.

<!--
* `exports`: The subset of declarations that should be visible and usable in the *component templates* of other NgModules.
-->
* `exports`: 모듈의 구성 요소를 다른 NgModule이나 *컴포넌트 템플릿* 으로 재사용할 수 있도록 외부로 공개합니다.

<!--
* `imports`: Other modules whose exported classes are needed by component templates declared in *this* NgModule.
-->
* `imports`: 다른 모듈에서 공개한 클래스를 *지금 정의하는* NgModule에 가져올 때 사용합니다.

<!--
* `providers`: Creators of [services](guide/architecture-services) that this NgModule contributes to the global collection of services; they become accessible in all parts of the app. (You can also specify providers at the component level, which is often preferred.)
-->
* `providers`: NgModule 컨텍스트 안에서 사용하는 서비스 프로바이더를 지정합니다. NgModule 안에서 사용하는 [서비스](guide/architecture-services)는 이렇게 지정된 서비스 프로바이더를 사용해서 생성되며, 필요한 경우에는 하위 계층에 사용할 서비스 프로바이더를 따로 지정할 수도 있습니다.

<!--
* `bootstrap`: The main application view, called the *root component*, which hosts all other app views. Only the *root NgModule* should set the `bootstrap` property.
-->
* `bootstrap`: 애플리케이션의 최상위 뷰로 표시될 *최상위 컴포넌트* 를 지정합니다. `bootstrap` 프로퍼티는 *최상위 NgModule* 에만 지정할 수 있습니다.

<!--
Here's a simple root NgModule definition.
-->
최상위 NgModule을 간단하게 만들면 다음처럼 구현할 수 있습니다:

<code-example path="architecture/src/app/mini-app.ts" region="module" header="src/app/app.module.ts" linenums="false"></code-example>

<div class="alert is-helpful">

<!--
   `AppComponent` is included in the `exports` list here for illustration; it isn't actually necessary in this example. A root NgModule has no reason to *export* anything because other modules don't need to *import* the root NgModule.
-->
   이 코드에서 `exports` 프로퍼티는 이 프로퍼티를 어떻게 사용하는지 설명하기 위해 추가했습니다. 최상위 모듈은 다른 NgModule에서 참조할 일이 없기 때문에 어떤 구성요소라도 *exports* 로 지정할 필요가 없습니다.

</div>

<!--
## NgModules and components
-->
## NgModule과 컴포넌트

<!--
NgModules provide a *compilation context* for their components. A root NgModule always has a root component that is created during bootstrap, but any NgModule can include any number of additional components, which can be loaded through the router or created through the template. The components that belong to an NgModule share a compilation context.
-->
NgModule은 컴포넌트가 *컴파일되는 시점의 컨텍스트*를 제공합니다. 최상위 NgModule은 생성하는 컴포넌트가 최상위 컴포넌트를 하나지만, 다른 NgModule은 컴포넌트를 여러개 갖고 있을 수도 있고, 이 컴포넌트들은 라우터나 템플릿의 동작에 따라 뷰에 로드됩니다. 모듈에 속한 컴포넌트는 그 NgModule에서 제공하는 컴파일 컨텍스트를 사용합니다.

<figure>

<!--
<img src="generated/images/guide/architecture/compilation-context.png" alt="Component compilation context" class="left">
-->
<img src="generated/images/guide/architecture/compilation-context.png" alt="컴포넌트 컴파일 컨텍스트" class="left">

</figure>

<br class="clear">

<!--
A component and its template together define a *view*. A component can contain a *view hierarchy*, which allows you to define arbitrarily complex areas of the screen that can be created, modified, and destroyed as a unit. A view hierarchy can mix views defined in components that belong to different NgModules. This is often the case, especially for UI libraries.
-->
컴포넌트는 템플릿과 함께 *뷰* 를 정의합니다. 컴포넌트는 *뷰 계층* 을 구성할 수도 있고, 이 뷰 계층을 활용하면 복잡한 화면에서 일부 엘리먼트만 추가하거나 제거할 수 있고 갱신을 할 수도 있습니다. 뷰 계층은 다른 NgModule에 정의된 컴포넌트와 조합할 수도 있습니다. 서드파티 UI 라이브러리를 사용하는 것이 이 경우에 해당됩니다.

<figure>

<!--
<img src="generated/images/guide/architecture/view-hierarchy.png" alt="View hierarchy" class="left">
-->
<img src="generated/images/guide/architecture/view-hierarchy.png" alt="뷰 계층" class="left">

</figure>

<br class="clear">

<!--
When you create a component, it's associated directly with a single view, called the *host view*. The host view can be the root of a view hierarchy, which can contain *embedded views*, which are in turn the host views of other components. Those components can be in the same NgModule, or can be imported from other NgModules. Views in the tree can be nested to any depth.
-->
컴포넌트를 정의할 때는 *호스트 뷰(host view)* 라는 뷰가 연결됩니다. 호스트 뷰는 뷰 계층에서 컴포넌트가 차지하는 최상위 뷰를 가리키며, 뷰 안에 컴포넌트를 추가해서 _종속된 뷰(enbedded view)_ 를 자유롭게 구성할 수도 있습니다. 이 때 추가되는 컴포넌트는 부모 컴포넌트와 같은 NgModule에 있거나 다른 NgModule에서 가져온 컴포넌트가 될 수 있습니다.

<div class="alert is-helpful">
<!--
    **Note:** The hierarchical structure of views is a key factor in the way Angular detects and responds to changes in the DOM and app data. 
-->
    **참고:** 뷰 계층은 Angular가 DOM이나 앱 데이터가 변할 때 변화를 감지하는 단위가 되기 때문에 효율적으로 구성하는 것이 중요합니다.
</div>

<!--
## NgModules and JavaScript modules
-->
## NgModule과 JavaScript 모듈

<!--
The NgModule system is different from and unrelated to the JavaScript (ES2015) module system for managing collections of JavaScript objects. These are *complementary* module systems that you can use together to write your apps.
-->
Angular가 제공하는 NgModule 체계는 JavaScript에서 객체를 묶어 관리하는 JavaScript (ES2015) 모듈 시스템과 다릅니다. 두 모듈 체계는 독립적이지만 *상호 보완적* 이며, Angular 애플리케이션에는 두 모듈 체계가 함께 사용됩니다.

<!--
In JavaScript each *file* is a module and all objects defined in the file belong to that module.
The module declares some objects to be public by marking them with the `export` key word.
Other JavaScript modules use *import statements* to access public objects from other modules.
-->
JavaScript에서는 각각의 *파일* 이 하나의 모듈이며, 이 파일에 정의된 모든 객체가 이 모듈 안에 속한다고 할 수 있습니다.
그리고 모듈 안에 있는 객체를 외부로 공개하려면 `export` 키워드를 사용하며, 다른 JavaScript 모듈에서는 *import 구문*을 사용해서 이 객체에 접근할 수 있습니다.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="alert is-helpful">
<!--
  <a href="http://exploringjs.com/es6/ch_modules.html">Learn more about the JavaScript module system on the web.</a>
-->
  <a href="http://exploringjs.com/es6/ch_modules.html">JavaScript 모듈 체계에 대해 더 알아보기</a>
</div>

<!--
## Angular libraries
-->
## Angular 라이브러리

<!--
<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">
-->
<img src="generated/images/guide/architecture/library-module.png" alt="컴포넌트" class="left">

<!--
Angular loads as a collection of JavaScript modules. You can think of them as library modules. Each Angular library name begins with the `@angular` prefix. Install them with the node package manager `npm` and import parts of them with JavaScript `import` statements.
-->
Angular 프레임워크는 JavaScript 모듈 형태로 제공되며, 프레임워크 자체를 라이브러리 모듈의 묶음으로 생각할 수도 있습니다. 각각의 Angular 라이브러리는 `@angular`라는 접두사로 시작하며, `npm` 패키지 매니저를 사용해서 설치하고 JavaScript `import` 구문으로 불러와서 사용합니다.

<br class="clear">

<!--
For example, import Angular's `Component` decorator from the `@angular/core` library like this.
-->
예를 들어, Angular의 `@angular/core` 라이브러리에 있는 `Component` 데코레이터는 다음과 같이 사용합니다:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

<!--
You also import NgModules from Angular *libraries* using JavaScript import statements.
For example, the following code imports the `BrowserModule` NgModule from the `platform-browser` library.
-->
그리고 Angular에서 제공하는 NgModule도 비슷한 방법으로 불러와서 사용합니다:
예를 들면, 다음 코드는 `platform-browser` 라이브러리에서 `BrowserModule` NgModule을 로드하는 코드입니다.

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

<!--
In the example of the simple root module above, the application module needs material from within
`BrowserModule`. To access that material, add it to the `@NgModule` metadata `imports` like this.
-->
위에서 살펴본 최상위 모듈 예제처럼, Angular 모듈은 `BrowserModule` 안에 정의되어 있는 객체를 사용합니다. 이 객체에 접근하려면 `@NgModule` 메타데이터의 `imports` 프로퍼티를 다음과 같이 사용하면 됩니다.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

<!--
In this way you're using the Angular and JavaScript module systems *together*. Although it's easy to confuse the two systems, which share the common vocabulary of "imports" and "exports", you will become familiar with the different contexts in which they are used.
-->
지금까지 살펴본 코드처럼 Angular의 모듈 체계와 JavaScript의 모듈 체계는 *함께* 사용됩니다. 지금은 두 체계를 함께 사용하면서 "imports"와 "exports" 키워드를 비슷하게 사용하기 때문에 혼란스러울 수 있지만, Angular를 계속 사용하면서 익숙해질 것입니다.

<div class="alert is-helpful">

<!--
  Learn more from the [NgModules](guide/ngmodules) guide.
-->
  [NgModule](guide/ngmodules)에 대해 더 알아보세요.

</div>
