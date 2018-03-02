<!--
# Architecture Overview
-->
# 아키텍처

<!--
Angular is a framework for building client applications in HTML and
either JavaScript or a language like TypeScript that compiles to JavaScript.
-->
Angular는 HTML 클라이언트 애플리케이션을 개발할 수 있는 프레임워크입니다.

<!--
The framework consists of several libraries, some of them core and some optional.
-->
Angular 프레임워크는 수많은 라이브러리들로 구성되는데, 이 중 일부는 코어 모듈이고 일부는 옵션 모듈로 나눠볼 수 있습니다.

<!--
You write Angular applications by composing HTML *templates* with Angularized markup,
writing *component* classes to manage those templates, adding application logic in *services*,
and boxing components and services in *modules*.
-->
Angular 어플리케이션은 Angular 스타일의 마크업을 사용해서 만든 *템플릿* 과 이 템플릿을 관리하는 *컴포넌트* 클래스를 구성합니다.
컴포넌트 공통 로직은 *서비스* 에 만들기도 하고, 컴포넌트와 서비스들을 묶어서 *모듈* 로 구성하기도 합니다.

<!--
Then you launch the app by *bootstrapping* the _root module_.
Angular takes over, presenting your application content in a browser and
responding to user interactions according to the instructions you've provided.
-->
Angular 애플리케이션은 _최상위 모듈_ 을 *부트스트랩* 하면서 시작됩니다.
그리고 애플리케이션이 시작된 후에는 브라우저에 데이터를 표시하거나 사용자의 동작에 반응해야 할 때 Angular 프레임워크의 기능을 활용합니다.

<!--
Of course, there is more to it than this.
You'll learn the details in the pages that follow. For now, focus on the big picture.
-->
물론 이 과정이 간단하게 이루어지지는 않습니다.
자세한 내용은 이 문서를 진행하면서 차근차근 살펴보도록 하고, 먼저 전체 그림을 보는 것부터 시작합시다.

<figure>
<!--
  <img src="generated/images/guide/architecture/overview2.png" alt="overview">
  -->
  <img src="generated/images/guide/architecture/overview2.png" alt="개요">
</figure>

<div class="l-sub-section">

<!--
  The code referenced on this page is available as a <live-example></live-example>.
  -->
  이 문서에서 설명하는 코드는 <live-example></live-example> 에서 확인하거나 다운받을 수 있습니다.

</div>

## 모듈

<!--
<img src="generated/images/guide/architecture/module.png" alt="Component" class="left">
-->
<img src="generated/images/guide/architecture/module.png" alt="컴포넌트" class="left">

<!--
Angular apps are modular and Angular has its own modularity system called _NgModules_.
-->
Angular는 _NgModule_ 이라는 모듈 방식을 제공하며, Angular 프레임워크로 만든 애플리케이션 자체도 하나의 모듈이라고 할 수 있습니다.

<!--
NgModules are a big deal.
This page introduces modules; the [NgModules](guide/ngmodules) pages 
relating to NgModules covers them in detail.
-->
하지만 NgModule이 구체적으로 어떤 것인지 설명하는 것은 간단한 일이 아닙니다.
그래서 이 문서에서는 모듈이란 무엇인지에 대해서만 간단하게 설명하며, NgModule에 대해서는 [NgModules](guide/ngmodules) 페이지에서 자세하게 다루겠습니다.

<br class="clear">

<!--
Every Angular app has at least one NgModule class, [the _root module_](guide/bootstrapping "Bootstrapping"),
conventionally named `AppModule`.
-->
Angular 앱은 [_최상위 모듈_](guide/bootstrapping "부트스트랩") 부터 애플리케이션을 구성하기 때문에 NgModule이 반드시 하나 이상 있다고 할 수 있으며, 이 최상위 모듈을 보통 `AppModule` 이라고 합니다.

<!--
While the _root module_ may be the only module in a small application, most apps have many more
_feature modules_, each a cohesive block of code dedicated to an application domain,
a workflow, or a closely related set of capabilities.
-->
애플리케이션이 작다면 _최상위 모듈_ 이 그 앱의 유일한 모듈일 수도 있지만, 대부분의 앱은 애플리케이션 도메인, 동작 흐름, 연관성 등을 고려해서 좀 더 많은 _기능 모듈(feature modules)_ 로 구성합니다.

<!--
An NgModule, whether a _root_ or _feature_, is a class with an `@NgModule` decorator.
-->
_최상위_ 모듈이든 _기능_ 모듈이든, Angular 모듈은 `@NgModule` 데코레이터가 붙는 클래스로 선언합니다.

<div class="l-sub-section">
<!--
  Decorators are functions that modify JavaScript classes.
  Angular has many decorators that attach metadata to classes so that it knows
  what those classes mean and how they should work.
  -->
  데코레이터는 JavaScript 클래스를 변형하는 함수입니다.
  개발자가 만든 클래스가 Angular 프레임워크 안에서 어떤 의미를 가지며, 어떻게 동작해야 하는 지를 지정할 때는
  Angular에서 제공하는 데코레이터를 사용합니다.
  ECMAScript에서 정의하는 데코레이터에 대한 내용은
  <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">

<!--
  Learn more</a> about decorators on the web.
  -->
  이 링크</a>를 확인하세요.

</div>

<!--
`NgModule` is a decorator function that takes a single metadata object whose properties describe the module.
The most important properties are:
-->
`NgModule` 은 데코레이터 함수이며, 모듈의 특성을 지정하는 메타데이터를 객체 형태의 인자로 받습니다:

<!--
* `declarations` - the _view classes_ that belong to this module.
Angular has three kinds of view classes: [components](guide/architecture#컴포넌트), [directives](guide/architecture#directives), and [pipes](guide/pipes).
-->
* `declarations` - 모듈에 속하는 _뷰 클래스_ 를 등록합니다.
Angular에는 3 종류의 뷰 클래스가 있습니다 : [컴포넌트](guide/architecture#컴포넌트), [디렉티브](guide/architecture#디렉티브), [파이프](guide/pipes).

<!--
* `exports` - the subset of declarations that should be visible and usable in the component [templates](guide/architecture#templates) of other modules.
-->
* `exports` - 모듈의 `declarations` 항목 일부를 다른 모듈에서 참조해야 하는 경우가 있습니다.
이 때 다른 모듈의 [템플릿](guide/architecture#템플릿)에 사용할 수 있도록 `exports` 항목을 지정할 수 있습니다.

<!--
* `imports` - other modules whose exported classes are needed by component templates declared in _this_ module.
-->
* `imports` - `exports`로 지정한 모듈의 구성요소는 `imports` 로 불러와서 컴포넌트 템플릿에 사용할 수 있습니다.

<!--
* `providers` - creators of [services](guide/architecture#services) that this module contributes to
the global collection of services; they become accessible in all parts of the app.
-->
* `providers` - [서비스](guide/architecture#서비스) 프로바이더를 지정합니다.
모듈에서 사용하는 서비스는 프로바이더에 등록된 방법으로 인스턴스를 생성하며, 이렇게 생성된 서비스는 전역 서비스 풀에 생성되어 앱 어디에서라도 접근할 수 있습니다.

<!--
* `bootstrap` - the main application view, called the _root component_,
that hosts all other app views. Only the _root module_ should set this `bootstrap` property.
-->
* `bootstrap` - 모듈의 시작 화면이 될 _최상위 컴포넌트_ 를 지정합니다. 모듈의 _최상위 컴포넌트_ 에만 `bootstrap` 프로퍼티를 지정할 수 있습니다.

<!--
Here's a simple root module:
-->
이 내용을 바탕으로 다음과 같이 간단한 최상위 모듈을 만들어 볼 수 있습니다:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"></code-example>

<div class="l-sub-section">
<!--
  The `export` of `AppComponent` is just to show how to use the `exports` array to export a component; it isn't actually necessary in this example. A root module has no reason to _export_ anything because other components don't need to _import_ the root module.
  -->
  위 코드에서 `exports` 프로퍼티에 사용된 `AppComponent` 는 `exports` 프로퍼티를 어떻게 사용하는지 설명하기 위해 작성했으며, 이 모듈이 동작하기 위해 필요한 내용은 아닙니다. 최상위 모듈은 모듈 트리의 최상단에 존재하기 때문에 다른 컴포넌트가 최상위 모듈을 참조하는 일은 없습니다.

</div>

<!--
Launch an application by _bootstrapping_ its root module.
During development you're likely to bootstrap the `AppModule` in a `main.ts` file like this one.
-->
애플리케이션은 최상위 모듈을 _부트스트랩_하면서 실행됩니다.
보통 `AppModule` 은 `main.ts` 파일에 다음과 같이 정의합니다.

<code-example path="architecture/src/main.ts" title="src/main.ts" linenums="false"></code-example>

<!--
### NgModules vs. JavaScript modules
-->
### NgModule 과 JavaScript 모듈

<!--
The NgModule &mdash; a class decorated with `@NgModule` &mdash; is a fundamental feature of Angular.
-->
NgModule은 JavaScript 클래스에 `@NgModule` 데코레이터를 붙여 선언하며, Angular를 구성하는 기본 단위입니다.

<!--
JavaScript also has its own module system for managing collections of JavaScript objects.
It's completely different and unrelated to the NgModule system.
-->
그런데 이런 모듈 체계는 JavaScript에도 존재하지만, JavaScript의 모듈 체계는 NgModule 체계와 완전히 다르고 연관성도 없습니다.

<!--
In JavaScript each _file_ is a module and all objects defined in the file belong to that module.
The module declares some objects to be public by marking them with the `export` key word.
Other JavaScript modules use *import statements* to access public objects from other modules.
-->
JavaScript에서 _파일_ 하나는 그 자체로 모듈이며, 어떤 파일에 정의된 모든 객체는 그 모듈에 속한다고 할 수 있습니다.
이 객체들 중 일부를 모듈 외부로 공개하려면 `export` 키워드를 사용하며, 다른 모듈에서 `import` 키워드를 사용해서 이 객체를 가져올 수 있습니다.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="l-sub-section">
<!--
  <a href="http://exploringjs.com/es6/ch_modules.html">Learn more about the JavaScript module system on the web.</a>
  -->
  <a href="http://exploringjs.com/es6/ch_modules.html">JavaScript의 모듈 체계에 대해 자세히 알아보려면 이 문서를 참고하세요.</a>
</div>

<!--
These are two different and _complementary_ module systems. Use them both to write your apps.
-->
결국 우리가 작성하는 코드에는 _완전히 다르지만 상호 보완적인_ 2개의 모듈 체계가 있다고 할 수 있습니다. 이 두 방식은 애플리케이션을 개발하면서 각각의 역할에 맞게 모두 사용할 것입니다.

<!--
### Angular libraries
-->
### Angular 라이브러리

<!--
<img src="generated/images/guide/architecture/library-module.png" alt="Component" class="left">
-->
<img src="generated/images/guide/architecture/library-module.png" alt="컴포넌트" class="left">

<!--
Angular ships as a collection of JavaScript modules. You can think of them as library modules.

Each Angular library name begins with the `@angular` prefix.
-->
Angular는 JavaScript 모듈을 묶어 라이브러리 모듈로 제공하며, 이 라이브러리에는 `@angular` 라는 접두사가 붙습니다.

<!--
You install them with the **npm** package manager and import parts of them with JavaScript `import` statements.
-->
각각의 라이브러리는 **npm** 패키지 매니저로 설치할 수 있고, JavaScript 코드에서 `import` 키워드를 사용해서 참조할 수 있습니다.

<br class="clear">

<!--
For example, import Angular's `Component` decorator from the `@angular/core` library like this:
-->
예를 들어 Angular의 `Component` 데코레이터를 사용한다면 `@angular/core` 라이브러리를 다음과 같이 사용합니다:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

<!--
You also import NgModules from Angular _libraries_ using JavaScript import statements:
-->
라이브러리 뿐 아니라 Angular 모듈을 불러오는 것도 import 구문을 사용합니다:

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

<!--
In the example of the simple root module above, the application module needs material from within that `BrowserModule`. To access that material, add it to the `@NgModule` metadata `imports` like this.
-->
위에서 살펴본 최상위 모듈 예제에서 보듯이, 애플리케이션 모듈은 `BrowserModule` 라이브러리 안에 있는 클래스를 사용합니다. 이 클래스에 접근하려면 JavaScript `import` 키워드로 `BrowserModule` 을 참조하고, `@NgModule` 메타데이터의 `imports` 프로퍼티를 다음과 같이 지정합니다.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

<!--
In this way you're using both the Angular and JavaScript module systems _together_.
-->
이 코드에서 보듯이, Angular 모듈 체계와 JavaScript 모듈 체계는 _함께_ 사용합니다.

<!--
It's easy to confuse the two systems because they share the common vocabulary of "imports" and "exports".
Hang in there. The confusion yields to clarity with time and experience.
-->
두 모듈 체계에서 모두 "imports" 라는 용어와 "exports" 라는 용어를 사용하기 때문에 혼동이 생길 수 있겠지만, 이 고민은 시간과 경험이 쌓이면서 자연스럽게 해결될 것입니다.

<div class="l-sub-section">

<!--
  Learn more from the [NgModules](guide/ngmodules) page.
  -->
  [NgModule](guide/ngmodules) 에 대해 자세히 알아보기

</div>

<hr/>

<!--
## Components
-->
## 컴포넌트

<img src="generated/images/guide/architecture/hero-component.png" alt="Component" class="left">

<!--
A _component_ controls a patch of screen called a *view*.
-->
_컴포넌트_ 는 화면의 일부 영역인 *뷰* 를 조작합니다.

<!--
For example, the following views are controlled by components:
-->
예를 들어 다음 뷰들은 각각의 컴포넌트에 의해 조작됩니다:

<!--
* The app root with the navigation links.
* The list of heroes.
* The hero editor.
-->
* 네비게이션 링크를 표시하는 최상위 뷰
* 히어로 목록을 표시하는 뷰
* 히어로 에디터

<!--
You define a component's application logic&mdash;what it does to support the view&mdash;inside a class.
The class interacts with the view through an API of properties and methods.
-->
컴포넌트 클래스에는 뷰를 조작하는 로직을 작성합니다.
그러면 이렇게 작성한 프로퍼티와 메소드를 뷰에서 활용할 수 있습니다.

{@a component-code}

<!--
For example, this `HeroListComponent` has a `heroes` property that returns an array of heroes
that it acquires from a service.
`HeroListComponent` also has a `selectHero()` method that sets a `selectedHero` property when the user clicks to choose a hero from that list.
-->
예를 들어 `HeroListComponent` 에 `heroes` 프로퍼티가 있고, 이 프로퍼티는 서비스에서 받아온 히어로의 배열을 반환한다고 합시다.
그리고 사용자가 목록에서 선택한 히어로를 `selectedHero` 프로퍼티에 저장하는 `selectHero()` 메소드도 있다고 합시다.
그러면 다음과 같이 컴포넌트 클래스를 작성할 수 있습니다.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class"></code-example>

<!--
Angular creates, updates, and destroys components as the user moves through the application.
Your app can take action at each moment in this lifecycle through optional [lifecycle hooks](guide/lifecycle-hooks), like `ngOnInit()` declared above.
-->
Angular는 사용자의 행동에 따라 컴포넌트를 생성하고, 갱신하고, 종료합니다.

컴포넌트가 동작하는 각각의 시점은 생명주기라고 하며, 이 시점을 가로채서 [생명주기 함수](guide/lifecycle-hooks)를 실행시킬 수도 있습니다. 위 코드에서 사용한 `ngOnInit()` 함수가 생명주기 함수 중 하나입니다.

<hr/>

<!--
## Templates
-->
## 템플릿

<img src="generated/images/guide/architecture/template.png" alt="Template" class="left">

<!--
You define a component's view with its companion **template**. A template is a form of HTML
that tells Angular how to render the component.
-->
컴포넌트의 뷰는 **템플릿**으로 정의합니다. 이 템플릿에는 Angular가 렌더링할 화면을 HTML 형태로 정의할 수 있습니다.

<!--
A template looks like regular HTML, except for a few differences. Here is a
template for our `HeroListComponent`:
-->
템플릿은 보통의 HTML과 비슷하게 보이지만, 조금 다릅니다. 예제로 다루고 있는 `HeroListComponent` 의 템플릿을 보면 다음과 같습니다:

<code-example path="architecture/src/app/hero-list.component.html" title="src/app/hero-list.component.html"></code-example>

<!--
Although this template uses typical HTML elements like `<h2>` and  `<p>`, it also has some differences. Code like `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<app-hero-detail>` uses Angular's [template syntax](guide/template-syntax).
-->
이 템플릿에는 `<h2>`나 `<p>`와 같이 일반적으로 HTML 문서에 사용하던 엘리먼트들이 있지만, 그 외에 다른 요소도 있습니다. `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, `<hero-detail>` 와 같은 표현은 모두 Angular [템플릿 문법](guide/template-syntax)입니다.

<!--
In the last line of the template, the `<app-hero-detail>` tag is a custom element that represents a new component, `HeroDetailComponent`.
-->
그리고 템플릿의 마지막 줄에 사용된 `<app-hero-detail>` 태그는 커스텀 컴포넌트인 `HeroDetailComponent` 를 표현하는 엘리먼트입니다.

<!--
The `HeroDetailComponent` is a *different* component than the `HeroListComponent` you've been reviewing.
The `HeroDetailComponent` (code not shown) presents facts about a particular hero, the
hero that the user selects from the list presented by the `HeroListComponent`.
The `HeroDetailComponent` is a **child** of the `HeroListComponent`.
-->
이때 `HeroDetailComponent`는 이전에 살펴봤던 `HeroListComponent`와는 *다른* 컴포넌트입니다.
지금 코드를 살펴보지는 않겠지만, `HeroDetailComponent` 는 `HeroListComponent` 가 표시하는 히어로 목록 중에 사용자가 선택한 히어로 한 명의 정보를 `HeroListComponent` 안에 표시합니다.
이 관계로 보면 `HeroDetailComponent`는 `HeroListComponent`의 자식 컴포넌트라고 할 수 있습니다.

<!--
<img src="generated/images/guide/architecture/component-tree.png" alt="Metadata" class="left">
-->
<img src="generated/images/guide/architecture/component-tree.png" alt="메타데이터" class="left">

<!--
Notice how `<app-hero-detail>` rests comfortably among native HTML elements. Custom components mix seamlessly with native HTML in the same layouts.
-->
일반적인 HTML 엘리먼트들 사이에 `<app-hero-detail>` 태그가 자연스럽게 어울리는 것을 유심히 볼 필요가 있습니다. 코드에서와 마찬가지로 레이아웃에서도 커스텀 컴포넌트는 기본 HTML들과 자연스럽게 어울립니다.

<hr class="clear"/>

<!--
## Metadata
-->
## 메타데이터

<!--
<img src="generated/images/guide/architecture/metadata.png" alt="Metadata" class="left">
-->
<img src="generated/images/guide/architecture/metadata.png" alt="메타데이터" class="left">

<!--
Metadata tells Angular how to process a class.
-->
JavaScript 클래스에 메타데이터를 지정하면, 이 클래스는 Angular 프레임워크 안에서 또 다른 역할을 갖도록 변형됩니다.

<br class="clear">

<!--
[Looking back at the code](guide/architecture#component-code) for `HeroListComponent`, you can see that it's just a class.
There is no evidence of a framework, no "Angular" in it at all.
-->
`HeroListComponent` 의 [코드를 다시 보면](guide/architecture#component-code), 컴포넌트는 단순하게 클래스라는 것을 확인할 수 있습니다.
이 클래스는 프레임워크에서 만든 것도 아니고, Angular에서 제공하는 기능도 아닙니다.

<!--
In fact, `HeroListComponent` really is *just a class*. It's not a component until you *tell Angular about it*.
-->
사실 `HeroListComponent` 는 *그냥 클래스*일 뿐입니다. *Angular 프레임워크가 이 클래스에 지정된 메타데이터를 처리하기 전까지는* 아직 컴포넌트라고 할 수도 없습니다.

<!--
To tell Angular that `HeroListComponent` is a component, attach **metadata** to the class.
-->
`HeroListComponent` 클래스를 Angular에서 동작하는 컴포넌트로 지정하려면, 이 클래스에 **메타데이터** 를 지정하면 됩니다.

<!--
In TypeScript, you attach metadata by using a **decorator**.
Here's some metadata for `HeroListComponent`:
-->
TypeScript를 사용한다면 **데코레이터**로 메타데이터를 지정할 수 있습니다.
`HeroListComponent`에 메타데이터를 지정하려면 다음과 같이 사용합니다:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (metadata)" region="metadata"></code-example>

<!--
Here is the `@Component` decorator, which identifies the class
immediately below it as a component class.
-->
이 코드를 보면 클래스 선언 위쪽에 `@Component` 데코레이터가 사용된 것을 확인할 수 있습니다.

<!--
The `@Component` decorator takes a required configuration object with the
information Angular needs to create and present the component and its view.
-->
`@Component` 데코레이터에는 이 컴포넌트를 뷰에 표시하기 위해 필요한 설정을 객체 형태로 전달합니다.

<!--
Here are a few of the most useful `@Component` configuration options:
-->
이 중에서 자주 쓰는 항목을 몇가지 꼽아보면 다음과 같습니다:

<!--
* `selector`: CSS selector that tells Angular to create and insert an instance of this component
where it finds a `<app-hero-list>` tag in *parent* HTML.
For example, if an app's  HTML contains `<app-hero-list></app-hero-list>`, then
Angular inserts an instance of the `HeroListComponent` view between those tags.
-->
* `selector`: 컴포넌트가 위치할 곳을 CSS 셀렉터 형식으로 지정합니다. 
예를 들어 부모 HTML에 `<hero-list></hero-list>` 라는 부분이 있으면, Angular가 `HeroListComponent` 컴포넌트의 인스턴스를 생성해서 이 태그 안에 넣습니다.

<!--
* `templateUrl`: module-relative address of this component's HTML template, shown [above](guide/architecture#templates).
-->
* `templateUrl`: 컴포넌트 템플릿 파일을 상대주소로 지정합니다. [템플릿](guide/architecture#템플릿) 부분을 참고하세요.

<!--
* `providers`: array of **dependency injection providers** for services that the component requires.
This is one way to tell Angular that the component's constructor requires a `HeroService`
so it can get the list of heroes to display.
-->
* `providers`: 컴포넌트에 **의존성으로 주입할 객체의 프로바이더** 를 배열 형태로 지정합니다.
튜토리얼에서는 히어로의 목록을 화면에 표시하기 위해 `HeroService` 를 참조하며, 컴포넌트 클래스의 생성자에 의존성 객체를 나열하면 Angular가 알아서 처리합니다.

<!--
<img src="generated/images/guide/architecture/template-metadata-component.png" alt="Metadata" class="left">
-->
<img src="generated/images/guide/architecture/template-metadata-component.png" alt="메타데이터" class="left">

<!--
The metadata in the `@Component` tells Angular where to get the major building blocks you specify for the component.

The template, metadata, and component together describe a view.
-->
이런 메타데이터들을 `@Component` 데코레이터에 전달하면, Angular 프레임워크가 템플릿과 메타데이터, 컴포넌트 클래스를 조합해서 뷰를 구성합니다.

<!--
Apply other metadata decorators in a similar fashion to guide Angular behavior.
`@Injectable`, `@Input`, and `@Output` are a few of the more popular decorators.
-->
이 방식은 `@Injectable` 이나 `@Input`, `@Output` 과 같은 데코레이터에도 비슷하게 사용합니다.

<br class="clear">

<!--
The architectural takeaway is that you must add metadata to your code
so that Angular knows what to do.
-->
요약하자면, JavaScript로 만든 클래스를 Angular 프레임워크에서 동작하는 구성요소로 변환하기 위해 메타데이터가 필요하다고 할 수 있습니다.

<hr/>

<!--
## Data binding
-->
## 데이터 바인딩

<!--
Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses
into actions and value updates. Writing such push/pull logic by hand is tedious, error-prone, and a nightmare to
read as any experienced jQuery programmer can attest.
-->
프레임워크를 사용하지 않는다면 컴포넌트 값이 변경됐을 때 필요한 동작을 직접 구현해야 합니다.
하지만 모든 값을 추적하면서 에러 처리 로직까지 일일이 작성하는 것은 너무나 번거로운 작업이고, 이 과정에서 또 다른 실수가 발생할 수도 있습니다.
jQuery를 사용해봤다면 이 말이 어떤 의미인지 좀 더 이해하기 쉬울 것입니다.

<!--
<img src="generated/images/guide/architecture/databinding.png" alt="Data Binding" class="left">
-->
<img src="generated/images/guide/architecture/databinding.png" alt="데이터 바인딩" class="left">

<!--
Angular supports **data binding**,
a mechanism for coordinating parts of a template with parts of a component.
Add binding markup to the template HTML to tell Angular how to connect both sides.
-->
Angular에는 템플릿과 컴포넌트를 간편하게 연결하는 **데이터 바인딩** 기능이 있습니다.
템플릿 HTML에 어떤 항목을 바인딩하겠다고 선언하면, Angular가 해당 항목을 자동으로 처리합니다.

<!--
As the diagram shows, there are four forms of data binding syntax. Each form has a direction &mdash; to the DOM, from the DOM, or in both directions.
-->
옆에 있는 그림에서 보듯이 바인딩 문법은 4종류이며, DOM과 컴포넌트를 단방향/양방향으로 연결할 수 있습니다.

<br class="clear">

<!--
The `HeroListComponent` [example](guide/architecture#templates) template has three forms:
-->
`HeroListComponent` [예제](guide/architecture#템플릿) 를 보면, 템플릿에 3가지 종류의 데이터 바인딩을 사용하는 것을 확인할 수 있습니다:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (binding)" region="binding"></code-example>

<!--
* The `{{hero.name}}` [*interpolation*](guide/displaying-data#interpolation)
displays the component's `hero.name` property value within the `<li>` element.
-->
* `{{hero.name}}` 과 같이 [*문자열 바인딩*](guide/displaying-data#interpolation) 하면 컴포넌트의 `hero.name` 프로퍼티 값을 `<li>` 엘리먼트 안에 표시합니다.

<!--
* The `[hero]` [*property binding*](guide/template-syntax#property-binding) passes the value of `selectedHero` from
the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`.
-->
* `[hero]` 와 같이 [*프로퍼티 바인딩*](guide/template-syntax#프로퍼티-바인딩) 하면 부모 컴포넌트 `HeroListComponent` 에 있는 `selectedHero` 값을 자식 컴포넌트 `HeroDetailComponent` 의 `hero` 프로퍼티로 전달합니다.

<!--
* The `(click)` [*event binding*](guide/user-input#click) calls the component's `selectHero` method when the user clicks a hero's name.
-->
* `(click)` 과 같이 [*이벤트 바인딩*](guide/user-input#click) 하면 사용자가 히어로의 이름을 클릭했을 때 컴포넌트의 `selectHero` 메소드를 실행합니다.

<!--
**Two-way data binding** is an important fourth form
that combines property and event binding in a single notation, using the `ngModel` directive.
Here's an example from the `HeroDetailComponent` template:
-->
그리고 프로퍼티 바인딩과 이벤트 바인딩을 결합한 **양방향 데이터 바인딩** 이 있습니다. 양방향 바인딩은 `ngModel` 디렉티브를 사용하며, `HeroDetailComponent` 코드에서 보듯이 다음과 같이 사용합니다:

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

<!--
In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value,
as with event binding.
-->
양방향 바인딩을 사용하면 컴포넌트의 프로퍼티 값이 프로퍼티 바인딩 된 것처럼 화면의 입력 컨트롤에 반영됩니다.
그리고 사용자가 입력 컨트롤의 값을 변경하면 변경된 값이 이벤트 바인딩 된 것처럼 컴포넌트의 프로퍼티 값을 갱신합니다.

<!--
Angular processes *all* data bindings once per JavaScript event cycle,
from the root of the application component tree through all child components.
-->
이 과정은 JavaScript 이벤트 싸이클이 실행될 때마다 애플리케이션 최상위 컴포넌트부터 트리를 따라 자식 컴포넌트를 순회하면서 Angular가 자동으로 처리합니다.

<figure>
<!--
  <img src="generated/images/guide/architecture/component-databinding.png" alt="Data Binding">
  -->
  <img src="generated/images/guide/architecture/component-databinding.png" alt="데이터 바인딩">
</figure>

<!--
Data binding plays an important role in communication between a template and its component.
-->
그래서 데이터 바인딩은 템플릿과 컴포넌트 사이에 데이터를 주고 받을 때 자주 사용합니다.

<figure>
<!--
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="Parent/Child binding">
  -->
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="부모/자식 바인딩">
</figure>

<!--
Data binding is also important for communication between parent and child components.
-->
그리고 부모 컴포넌트와 자식 컴포넌트가 데이터를 주고 받을 때도 자주 사용합니다.

<hr/>

<!--
## Directives
-->
## 디렉티브

<img src="generated/images/guide/architecture/directive.png" alt="Parent child" class="left">

<!--
Angular templates are *dynamic*. When Angular renders them, it transforms the DOM
according to the instructions given by **directives**.
-->
Angular의 템플릿은 *유동적* 입니다. 템플릿이 DOM으로 렌더링 된 후에라도 **디렉티브**에 의해 변형될 수 있습니다.

<!--
A directive is a class with a `@Directive` decorator.
A component is a *directive-with-a-template*;
a `@Component` decorator is actually a `@Directive` decorator extended with template-oriented features.
-->
디렉티브는 클래스에 `@Directive` 데코레이터를 붙여 선언합니다.
그리고 컴포넌트는 *템플릿이 있는 디렉티브* 라고 할 수 있으며, 실제로 `@Component` 데코레이터는 `@Directive` 데코레이터에 템플릿 관련 기능을 추가한 것입니다.

<div class="l-sub-section">

<!--
  While **a component is technically a directive**,
  components are so distinctive and central to Angular applications that this architectural overview separates components from directives.
  -->
  구현된 원리로는 *컴포넌트가 일종의 디렉티브* 라고 하더라도, 컴포넌트는 아키텍처의 관점에서 Angular 애플리케이션을 구성하는 요소로써 가장 중요하며, 이 문서에서는 디렉티브와 확실하게 구별해서 설명합니다.

</div>

<!--
Two *other* kinds of directives exist: _structural_ and _attribute_ directives.
-->
디렉티브는 _구조(structural) 디렉티브_ 와 _속성(attribute) 디렉티브_ 가 있습니다.

<!--
They tend to appear within an element tag as attributes do,
sometimes by name but more often as the target of an assignment or a binding.
-->
이 두 종류의 디렉티브는 DOM 엘리먼트 태그에 어트리뷰트처럼 사용하기 때문에 비슷해 보이지만,
역할은 아주 다릅니다.

<!--
**Structural** directives alter layout by adding, removing, and replacing elements in DOM.
-->
**구조 디렉티브** 는 DOM에 엘리먼트를 추가하거나 제거하는 등 레이아웃을 조작합니다.

<!--
The [example template](guide/architecture#templates) uses two built-in structural directives:
-->
[템플릿 예제 코드](guide/architecture#템플릿) 를 다시 보면 두 종류의 구조 디렉티브를 사용한 것을 확인할 수 있습니다:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (structural)" region="structural"></code-example>

<!--
* [`*ngFor`](guide/displaying-data#ngFor) tells Angular to stamp out one `<li>` per hero in the `heroes` list.
* [`*ngIf`](guide/displaying-data#ngIf) includes the `HeroDetail` component only if a selected hero exists.
-->
* [`*ngFor`](guide/displaying-data#ngFor) 는 `heroes` 배열에 있는 히어로마다 `<li>` 태그를 생성합니다.
* [`*ngIf`](guide/displaying-data#ngIf) 는 히어로가 선택되었을 때 `HeroDetail` 컴포넌트를 DOM에 추가합니다.

<!--
**Attribute** directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.
-->
**속성 디렉티브** 는 이미 존재하는 엘리먼트의 모양이나 동작을 조작합니다.
Angular 템플릿에 속성 디렉티브를 사용하는 문법은 DOM 엘리먼트에 HTML 속성을 지정하는 것과 같습니다.

<!--
The `ngModel` directive, which implements two-way data binding, is
an example of an attribute directive. `ngModel` modifies the behavior of
an existing element (typically an `<input>`)
by setting its display value property and responding to change events.
-->
그리고 양방향 데이터 바인딩에서 살펴봤던 `ngModel` 디렉티브도 속성 디렉티브입니다.
`ngModel` 디렉티브는 엘리먼트에 특정 동작을 추가하며,
보통 `<input>` 태그에 컴포넌트 프로퍼티의 값을 표시하거나 값이 변경되는 이벤트에 반응하는 용도로 사용합니다.

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

<!--
Angular has a few more directives that either alter the layout structure
(for example, [ngSwitch](guide/template-syntax#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](guide/template-syntax#ngStyle) and [ngClass](guide/template-syntax#ngClass)).
-->
Angular에는 이 외에도 여러 개의 레이아웃 중 하나를 표시하거나([ngSwitch](guide/template-syntax#ngSwitch))
DOM 엘리먼트의 모양을 변경하는 디렉티브([ngStyle](guide/template-syntax#ngStyle), [ngClass](guide/template-syntax#ngClass))도 있습니다.

<!--
Of course, you can also write your own directives. Components such as
`HeroListComponent` are one kind of custom directive.
-->
그리고 개발자가 커스텀 디렉티브를 만드는 것도 물론 가능합니다.
컴포넌트와 디렉티브의 관계에서 언급했듯이, `HeroListComponent` 와 같은 커스텀 컴포넌트도 커스텀 디렉티브라고 할 수 있습니다.

<!-- PENDING: link to where to learn more about other kinds! -->

<hr/>

<!--
## Services
-->
## 서비스

<!--
<img src="generated/images/guide/architecture/service.png" alt="Service" class="left">
-->
<img src="generated/images/guide/architecture/service.png" alt="서비스" class="left">

<!--
_Service_ is a broad category encompassing any value, function, or feature that your application needs.
-->
_서비스_ 는 애플리케이션에 필요한 값이나 함수, 기능을 제공하는 객체입니다.

<!--
Almost anything can be a service.
-->
서비스를 넓은 의미로 보면 모든 것이 서비스라고 할 수 있습니다.

<!--
A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.
-->
하지만 용도만을 생각해서 좁은 의미로 보면, 어떤 기능을 제공하는 클래스 하나라고 볼 수 있습니다.

<br class="clear">

<!--
Examples include:
-->
서비스의 예:
<!--
* logging service
* data service
* message bus
* tax calculator
* application configuration
-->
* 로그 서비스
* 데이터 서비스
* 메시지 버스
* 세금 계산기
* 애플리케이션 환경 설정

<!--
There is nothing specifically _Angular_ about services. Angular has no definition of a service.
There is no service base class, and no place to register a service.
-->
Angular가 서비스에 대해 기준을 정해둔 것은 아무것도 없으며, 한계를 정해두지도 않았습니다.
그리고 Angular가 서비스 형태로 기능을 제공하는 것도 없습니다.

<!--
Yet services are fundamental to any Angular application. Components are big consumers of services.
-->
하지만 서비스는 Angular 애플리케이션을 구성하는 중요한 요소입니다. 아마 컴포넌트를 사용할 때 서비스를 자주 사용하게 될 것입니다.

<!--
Here's an example of a service class that logs to the browser console:
-->
예를 들어 브라우저 콘솔에 로그를 출력하는 서비스는 다음과 같이 구현할 수 있습니다:

<code-example path="architecture/src/app/logger.service.ts" linenums="false" title="src/app/logger.service.ts (class)" region="class"></code-example>

<!--
Here's a `HeroService` that uses a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to fetch heroes.
The `HeroService` depends on the `Logger` service and another `BackendService` that handles the server communication grunt work.
-->
그리고 아래 예제는 [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) 를 사용해서 히어로의 목록을 가져오는 `HeroService` 코드입니다.
이 코드에서 `HeroService` 는 `Logger` 서비스를 사용하며, 서버에 요청을 보내기 위해 `BackendService` 라는 또 다른 서비스를 사용합니다.

<code-example path="architecture/src/app/hero.service.ts" linenums="false" title="src/app/hero.service.ts (class)" region="class"></code-example>

<!--
Services are everywhere.
-->
서비스는 어디에라도 사용할 수 있습니다.

<!--
Component classes should be lean. They don't fetch data from the server,
validate user input, or log directly to the console.
They delegate such tasks to services.
-->
서버에서 데이터를 가져오거나, 사용자의 입력을 검증하고, 로그를 콘솔에 출력하는 로직은 모두 서비스에 맡기고 컴포넌트 클래스에는 간단한 로직만 작성할 수도 있습니다.

<!--
A component's job is to enable the user experience and nothing more. It mediates between the view (rendered by the template)
and the application logic (which often includes some notion of a _model_).
A good component presents properties and methods for data binding.
It delegates everything nontrivial to services.
-->
컴포넌트의 역할은 사용자가 데이터를 보고 조작할 수 있는 화면을 만들어 주는 것 뿐입니다.
따라서 컴포넌트는 템플릿이 렌더링 된 뷰와 컴포넌트 프로퍼티(_모델_)를 연결하는 중개자라고 할 수 있습니다.
이런 관점에 보면 컴포넌트에 중요하지 않은 로직은 서비스에 두는 것이 바람직합니다.

<!--
Angular doesn't *enforce* these principles.
It won't complain if you write a "kitchen sink" component with 3000 lines.
-->
물론 Angular가 이런 방식을 *강제* 하는 것은 아닙니다.
어떤 컴포넌트를 작성하면서 3000 라인이 넘어가더라도 당연히 아무 문제 없습니다.

<!--
Angular does help you *follow* these principles by making it easy to factor your
application logic into services and make those services available to components through *dependency injection*.
-->
하지만 Angular가 제공하는 방식을 따른다면 서비스를 *의존성으로 주입* 하는 메커니즘을 활용할 수 있기 때문에, 컴포넌트 코드를 간결하게 유지하고 애플리케이션 로직을 효율적으로 관리할 수 있습니다.

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
_Dependency injection_ is a way to supply a new instance of a class
with the fully-formed dependencies it requires. Most dependencies are services.
Angular uses dependency injection to provide new components with the services they need.
-->
어떤 클래스에서 다른 클래스의 기능이 필요할 때, 클래스 인스턴스를 직접 생성하지 않고 외부에서 전달받는 방식을 _의존성 주입_ 이라고 합니다.
이 때 컴포넌트들이 공통으로 사용하는 로직은 서비스에 구현하기 때문에, 주입 받는 대상은 대부분 서비스가 될 것입니다.
Angular도 컴포넌트에서 서비스의 로직이 필요할 때 의존성 주입 방식을 사용합니다. 

<br class="clear">

<!--
Angular can tell which services a component needs by looking at the types of its constructor parameters.
For example, the constructor of your `HeroListComponent` needs a `HeroService`:
-->
컴포넌트에 서비스를 의존성으로 주입하려면 생성자에 인자를 지정하면서 타입을 지정하면 됩니다.
예를 들어 `HeroListComponent` 에 `HeroService` 가 필요하다면 다음과 같이 지정합니다:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (constructor)" region="ctor"></code-example>

<!--
When Angular creates a component, it first asks an **injector** for
the services that the component requires.
-->
Angular는 컴포넌트를 생성할 때 의존성으로 주입하는 서비스의 인스턴스가 존재하는지 **인젝터(injector)** 를 먼저 확인합니다.

<!--
An injector maintains a container of service instances that it has previously created.
If a requested service instance is not in the container, the injector makes one and adds it to the container
before returning the service to Angular.
When all requested services have been resolved and returned,
Angular can call the component's constructor with those services as arguments.
This is *dependency injection*.
-->
인젝터는 이전에 인스턴스로 생성했던 서비스를 모아서 관리하는 객체입니다.
컴포넌트에 필요한 서비스가 있을때, 이 서비스의 인스턴스가 인젝터가 관리하는 컨테이너에 있으면 서비스의 인스턴스를 바로 전달하고,
없으면 새로 생성해서 전달하며 인젝터가 관리하는 컨테이너에도 추가합니다.
그러면 Angular가 이 서비스를 컴포넌트 생성자에 인자로 전달하면서 *의존성을 주입* 합니다.

<!--
The process of `HeroService` injection looks a bit like this:
-->
`HeroService` 가 의존성으로 제공되는 흐름을 간단하게 살펴보면 다음과 같습니다:

<figure>
  <!--
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service">
  -->
  <img src="generated/images/guide/architecture/injector-injects.png" alt="서비스">
</figure>

<!--
If the injector doesn't have a `HeroService`, how does it know how to make one?
-->
그런데 인젝터에 `HeroService` 의 인스턴스가 없으면 이 인스턴스는 어떻게 만들어 질까요?

<!--
In brief, you must have previously registered a **provider** of the `HeroService` with the injector.
A provider is something that can create or return a service, typically the service class itself.
-->
간단하게 설명하면, `HeroService` 에 해당하는 **프로바이더(provider)**를 등록해 두어야 인젝터가 인스턴스를 생성할 수 있습니다.
이 때 서비스를 생성하는 팩토리 함수를 프로바이더로 등록할 수도 있지만, 일반적으로 서비스 클래스를 직접 등록합니다.

<!--
You can register providers in modules or in components.
-->
그리고 모듈과 컴포넌트도 프로바이더로 등록할 수 있습니다.

<!--
In general, add providers to the [root module](guide/architecture#modules) so that
the same instance of a service is available everywhere.
-->
프로바이더는 보통 [최상위 모듈](guide/architecture#모듈) 에 등록하는데,
하위 계층에서 프로바이더를 따로 등록하지 않는 이상 인스턴스를 하나만 만들어서 공유합니다.

<code-example path="architecture/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (module providers)" region="providers"></code-example>

<!--
Alternatively, register at a component level in the `providers` property of the `@Component` metadata:
-->
컴포넌트 계층에 프로바이더를 등록할 때는 `@Component` 메타데이터에 `providers` 프로퍼티를 사용해서 다음과 같이 등록합니다:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (component providers)" region="providers"></code-example>

<!--
Registering at a component level means you get a new instance of the
service with each new instance of that component.
-->
서비스 프로바이더를 컴포넌트 계층에 등록하면 이 컴포넌트가 생성될 때마다 새로운 서비스 인스턴스를 생성해서 의존성으로 주입합니다.

<!-- We've vastly oversimplified dependency injection for this overview.
The full story is in the [dependency injection](guide/dependency-injection) page. -->
이 문서에서는 의존성 주입을 아주 간단하게만 설명합니다.
의존성 주입에 대해 자세하게 알아보려면 [의존성 주입](guide/dependency-injection) 페이지를 참고하세요.

<!--
Points to remember about dependency injection:
-->
요약하면 이런 내용이 중요합니다:

<!--
* Dependency injection is wired into the Angular framework and used everywhere.
-->
* 의존성 주입은 Angular 프레임워크 안에서 객체를 참조할 때 사용합니다.

<!--
* The *injector* is the main mechanism.
  * An injector maintains a *container* of service instances that it created.
  * An injector can create a new service instance from a *provider*.
  -->
*  *인젝터* 가 중요합니다.
    * 인젝터는 그 인젝터가 생성한 서비스 인스턴스를 *컨테이너* 에 등록하고 관리합니다.
    * 인젝터는 *프로바이더* 로 등록된 방법으로 서비스 인스턴스를 생성합니다.

<!--
* A *provider* is a recipe for creating a service.
-->
* 서비스의 인스턴스는 팩토리 함수나 클래스로 만들 수 있으며, 인스턴스를 생성하는 방법은 *프로바이더* 로 등록합니다.

<!--
* Register *providers* with injectors.
-->
* *프로바이더* 는 인젝터에 등록합니다.

<hr/>

<!--
## Wrap up
-->
## 정리

<!--
You've learned the basics about the eight main building blocks of an Angular application:
-->
이 문서에서는 Angular 애플리케이션을 구성하는 8가지 기본 요소에 대해 알아봤습니다.

<!--
* [Modules](guide/architecture#modules)
* [Components](guide/architecture#components)
* [Templates](guide/architecture#templates)
* [Metadata](guide/architecture#metadata)
* [Data binding](guide/architecture#data-binding)
* [Directives](guide/architecture#directives)
* [Services](guide/architecture#services)
* [Dependency injection](guide/architecture#dependency-injection)
-->

* [모듈](guide/architecture#모듈)
* [컴포넌트](guide/architecture#컴포넌트)
* [템플릿](guide/architecture#템플릿)
* [메타데이터](guide/architecture#메타데이터)
* [데이터 바인딩](guide/architecture#데이터-바인딩)
* [디렉티브](guide/architecture#디렉티브)
* [서비스](guide/architecture#서비스)
* [의존성 주입](guide/architecture#의존성-주입)

<!--
That's a foundation for everything else in an Angular application,
and it's more than enough to get going.
But it doesn't include everything you need to know.
-->
이 개념들은 모든 Angular 애플리케이션에 적용되기 때문에 공부할만한 가치는 충분합니다.
물론 모든 내용을 알아야 할 필요는 없겠지만요.

<!--
Here is a brief, alphabetical list of other important Angular features and services.
Most of them are covered in this documentation (or soon will be).
-->
이 밖에 더 공부할만한 Angular 의 기능을 알파벳 순서대로 간단하게 나열해 봅니다.
각각의 주제는 준비되는 대로 다른 문서에서 다루겠습니다.

<!--
> [**Animations**](guide/animations): Animate component behavior
without deep knowledge of animation techniques or CSS with Angular's animation library.
-->
> [**애니메이션**](guide/animations) : CSS로 애니메이션을 구현하는 방법을 알지 못하더라도 컴포넌트에 애니메이션을 간단하게 적용할 수 있습니다.

<!--
> **Change detection**: The change detection documentation will cover how Angular decides that a component property value has changed,
when to update the screen, and how it uses **zones** to intercept asynchronous activity and run its change detection strategies.
-->
> **변화 감지** : Angular는 컴포넌트의 프로퍼티 값이 변경되는 것을 자동으로 감지하고, 관련된 화면을 갱신합니다.
이 방식이 어떻게 이루어지는지 살펴보고, 변화 감지 정책에 어떤 것이 있는지 알아봅니다.

<!--
> **Events**: The events documentation will cover how to use components and services to raise events with mechanisms for
publishing and subscribing to events.
-->
> **이벤트** : 컴포넌트나 서비스에서 이벤트를 생성하고 활용하는 방법에 대해 다룹니다. Angular에서는 이벤트를 발행하고 구독하는 방식을 사용합니다.

<!--
> [**Forms**](guide/forms): Support complex data entry scenarios with HTML-based validation and dirty checking.
-->
> [**폼**](guide/forms) : 사용자가 입력해야 하는 데이터가 많을 때 HTML 기반으로 양식을 작성하고 검증하는 방법에 대해 다룹니다.

<!--
> [**HTTP**](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.
-->
> [**HTTP**](guide/http) : 서버에서 데이터를 가져오거나 서버에 데이터를 보낼 때 사용하는 HTTP 클라이언트에 대해 다룹니다.

<!--
> [**Lifecycle hooks**](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction,
by implementing the lifecycle hook interfaces.
-->
> [**생명주기 함수**](guide/lifecycle-hooks) : 컴포넌트가 변화하는 시점을 가로채서 필요한 동작을 수행할 수 있습니다. 컴포넌트가 생성될 때부터 종료될 때까지 원하는 시점을 활용해보세요.

<!--
> [**Pipes**](guide/pipes): Use pipes in your templates to improve the user experience by transforming values for display. Consider this `currency` pipe expression:
>
> > `price | currency:'USD':true`
>
> It displays a price of 42.33 as `$42.33`.
-->

> [**파이프**](guide/pipes): 파이프를 사용하면 템플릿에 있는 데이터를 원하는 형식으로 표시할 수 있습니다. 하나만 예를 들자면, `currency` 파이프는 다음과 같이 사용합니다:
>
> > `price | currency:'USD':true`
>
> 그러면 42.33 이라는 `price` 데이터는 화면에 `$42.33` 으로 표시됩니다.


<!--
> [**Router**](guide/router): Navigate from page to page within the client
  application and never leave the browser.
  -->
> [**라우터**](guide/router) : 브라우저를 떠나지 않고 클라이언트 애플리케이션을 그대로 유지하면서 한 페이지에서 다른 페이지로 이동할 수 있습니다.

<!--
> [**Testing**](guide/testing): Run unit tests on your application parts as they interact with the Angular framework
using the _Angular Testing Platform_.
-->
> [**테스트**](guide/testing) : _Angular에서 제공하는 테스트 플랫폼_ 을 활용하면 유닛 테스트로 애플리케이션을 검증할 수 있습니다.