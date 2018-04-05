<!--
# Introduction to modules
-->
# 모듈 소개

<!--
<img src="generated/images/guide/architecture/module.png" alt="Module" class="left">
-->
<img src="generated/images/guide/architecture/module.png" alt="모듈" class="left">

<!--
Angular apps are modular and Angular has its own modularity system called _NgModules_. An NgModule is a container for a cohesive block of code dedicated to an application domain, a workflow, or a closely related set of capabilities. It can contain components, service providers, and other code files whose scope is defined by the containing NgModule. It can import functionality that is exported from other NgModules, and export selected functionality for use by other NgModules.
-->
Angular 애플리케이션은 Angular에서 제공하는 _NgModule_ 이라는 모듈 체계로 구성됩니다. NgModule은 애플리케이션 도메인이나 작업 흐름, 기능이 연관된 Angular 구성요소들을 묶어놓은 단위입니다. NgModule에는 컴포넌트나 서비스 프로바이더 등이 포함될 수 있으며, NgModule의 일부를 외부로 공개할 수도 있고, 다른 NgModule에서 이 부분을 가져와서 사용할 수도 있습니다.

<!--
Every Angular app has at least one NgModule class, [the _root module_](guide/bootstrapping), which is conventionally named `AppModule` and resides in a file named `app.module.ts`. You launch your app by *bootstrapping* the root NgModule.
-->
모든 Angular 애플리케이션에는 [_최상위 모듈_](guide/bootstrapping)이 반드시 존재하며, 이 모듈은 보통 `app.module.ts` 파일에 `AppModule`이라고 정의합니다. 애플리케이션은 이 NgModule을 *부트스트랩*하며 시작됩니다.

<!--
While a small application might have only one NgModule, most apps have many more _feature modules_. The _root_ NgModule for an app is so named because it can include child NgModules in a hierarchy of any depth.
-->
애플리케이션의 규모가 작다면 NgModule은 하나만 있을 수도 있지만, 대부분은 좀 더 많은 _기능 모듈_ 로 구성됩니다. 이 모듈은 `AppModule`의 자식 계층으로 구성되기 때문에 `AppModule`을 _최상위_ 모듈이라고 합니다.

<!--
## NgModule metadata
-->
## NgModule 메타데이터

<!--
An NgModule is defined as a class decorated with `@NgModule`. The `@NgModule` decorator is a function that takes a single metadata object, whose properties describe the module. The most important properties are as follows.
-->
NgModule은 클래스에 `@NgModule` 데코레이터를 붙여서 정의하는데, 모듈을 정의하는 메타데이터 객체를 전달하면서 실행합니다. 이 메타데이터 프로퍼티 중 다음 항목들이 특히 중요합니다.

<!--
* `declarations`&mdash;The [components](guide/architecture-components), _directives_, and _pipes_ that belong to this NgModule.
-->
* `declarations`&mdash;해당 NgModule에 포함될 [컴포넌트](guide/architecture-components)나 _디렉티브_, _파이프_ 를 선언합니다.

<!--
* `exports`&mdash;The subset of declarations that should be visible and usable in the _component templates_ of other NgModules.
-->
* `exports`&mdash;모듈의 구성 요소를 다른 NgModule이나 _컴포넌트 템플릿_ 으로 재사용할 수 있도록 외부로 공개합니다.

<!--
* `imports`&mdash;Other modules whose exported classes are needed by component templates declared in _this_ NgModule.
-->
* `imports`&mdash;다른 모듈에서 공개한 클래스를 _지금 정의하는_ NgModule에 가져올 때 사용합니다.

<!--
* `providers`&mdash;Creators of [services](guide/architecture-services) that this NgModule contributes to the global collection of services; they become accessible in all parts of the app. (You can also specify providers at the component level, which is often preferred.)
-->
* `providers`&mdash;NgModule 컨텍스트 안에서 사용하는 서비스 프로바이더를 지정합니다. NgModule 안에서 사용하는 [서비스](guide/architecture-services)는 이렇게 지정된 서비스 프로바이더를 사용해서 생성되며, 필요한 경우에는 하위 계층에 사용할 서비스 프로바이더를 따로 지정할 수도 있습니다.

<!--
* `bootstrap`&mdash;The main application view, called the _root component_, which hosts all other app views. Only the _root NgModule_ should set this `bootstrap` property.
-->
* `bootstrap`&mdash;애플리케이션의 최상위 뷰로 표시될 _최상위 컴포넌트_ 를 지정합니다. `bootstrap` 프로퍼티는 _최상위 NgModule_ 에만 지정할 수 있습니다.

<!--
Here's a simple root NgModule definition:
-->
최상위 NgModule을 간단하게 만들면 다음처럼 구현할 수 있습니다:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"></code-example>

<div class="l-sub-section">

<!--
  The `export` of `AppComponent` is just to show how to export; it isn't actually necessary in this example. A root NgModule has no reason to _export_ anything because other modules don't need to _import_ the root NgModule.
-->
  이 코드에서 `exports` 프로퍼티는 이 프로퍼티를 어떻게 사용하는지 설명하기 위해 추가했습니다. 최상위 모듈은 다른 NgModule에서 참조할 일이 없기 때문에 어떤 구성요소라도 _exports_ 로 지정할 필요가 없습니다.

</div>

## NgModules and components

NgModules provide a _compilation context_ for their components. A root NgModule always has a root component that is created during bootstrap, but any NgModule can include any number of additional components, which can be loaded through the router or created through the template. The components that belong to an NgModule share a compilation context.

<figure>

<img src="generated/images/guide/architecture/compilation-context.png" alt="Component compilation context" class="left">

</figure>

<br class="clear">

A component and its template together define a _view_. A component can contain a _view hierarchy_, which allows you to define arbitrarily complex areas of the screen that can be created, modified, and destroyed as a unit. A view hierarchy can mix views defined in components that belong to different NgModules. This is often the case, especially for UI libraries.

<figure>

<img src="generated/images/guide/architecture/view-hierarchy.png" alt="View hierarchy" class="left">

</figure>

<br class="clear">

When you create a component, it is associated directly with a single view, called the _host view_. The host view can be the root of a view hierarchy, which can contain _embedded views_, which are in turn the host views of other components. Those components can be in the same NgModule, or can be imported from other NgModules. Views in the tree can be nested to any depth.

<div class="l-sub-section">
    The hierarchical structure of views is a key factor in the way Angular detects and responds to changes in the DOM and app data. 
</div>

## NgModules and JavaScript modules

The NgModule system is different from and unrelated to the JavaScript (ES2015) module system for managing collections of JavaScript objects. These are two different and _complementary_ module systems. You can use them both to write your apps.

In JavaScript each _file_ is a module and all objects defined in the file belong to that module.
The module declares some objects to be public by marking them with the `export` key word.
Other JavaScript modules use *import statements* to access public objects from other modules.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="l-sub-section">
  <a href="http://exploringjs.com/es6/ch_modules.html">Learn more about the JavaScript module system on the web.</a>
</div>

## Angular libraries

<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">

Angular ships as a collection of JavaScript modules. You can think of them as library modules. Each Angular library name begins with the `@angular` prefix. Install them with the `npm` package manager and import parts of them with JavaScript `import` statements.

<br class="clear">

For example, import Angular's `Component` decorator from the `@angular/core` library like this:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

You also import NgModules from Angular _libraries_ using JavaScript import statements:

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

In the example of the simple root module above, the application module needs material from within the `BrowserModule`. To access that material, add it to the `@NgModule` metadata `imports` like this.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

In this way you're using both the Angular and JavaScript module systems _together_. Although it's easy to confuse the two systems, which share the common vocabulary of "imports" and "exports", you will become familiar with the different contexts in which they are used.

<div class="l-sub-section">

  Learn more from the [NgModules](guide/ngmodules) page.

</div>

<hr/>
