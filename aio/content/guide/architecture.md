# 아키텍처

Angular는 HTML 클라이언트 애플리케이션을 구성할 수 있는 프레임워크이며,
JavaScript를 직접 사용하거나 TypeScript와 같이 JavaScript로 컴파일되는 언어를 사용할 수 있습니다.

Angular 프레임워크는 수많은 라이브러리들로 구성되는데, 이 중 일부는 코어 모듈이고 일부는 옵션 모듈로 나눠볼 수 있습니다.

Angular 어플리케이션을 개발할 때는 Angular 스타일의 마크업을 사용해서 *템플릿* 을 만들고 이 템플릿을 관리하는 *컴포넌트* 클래스를 작성하며, 공통 로직을 다루는 *서비스* 를 만들기도 하고, 컴포넌트와 서비스들을 묶어서 *모듈* 로 구성하기도 합니다.

Angular 애플리케이션은 _최상위 모듈_ 을 *부트스트랩* 하면서 시작됩니다.
애플리케이션이 시작되고 나면 브라우저에 내용을 표시하거나 사용자의 동작에 반응하는 것은 개발자가 구현한 대로 Angular가 처리합니다.

물론 이 과정이 간단하게 이루어지지는 않습니다.
자세한 내용은 이 문서를 진행하면서 차근차근 살펴보도록 하고, 먼저 전체 그림을 보는 것부터 시작합시다.

<figure>
  <img src="generated/images/guide/architecture/overview2.png" alt="개요">
</figure>

<div class="l-sub-section">

  이 문서에서 설명하는 코드는 <live-example></live-example> 에서 확인하거나 다운받을 수 있습니다.

</div>

## Modules

<img src="generated/images/guide/architecture/module.png" alt="컴포넌트" class="left">


Angular는 _NgModule_ 이라는 모듈 방식을 제공하며, Angular 프레임워크로 만들어진 애플리케이션도 이 방식으로 만들어진 모듈이라고 할 수 있습니다.

하지만 NgModule을 간단하게 설명하는 것은 쉽지 않습니다.
그래서 이 문서에서는 모듈이 어떤 것인지에 대해서만 간단하게 설명하며, NgModule에 대해서는 [NgModules](guide/ngmodule) 페이지에서 자세하게 다루겠습니다.

<br class="clear">

Angular 앱은 [_최상위 모듈_](guide/bootstrapping "부트스트랩") 부터 애플리케이션을 구성하기 때문에 NgModule이 반드시 하나 이상 있다고 할 수 있으며, 이 모듈을 편의상 `AppModule` 이라고 합니다.

애플리케이션이 작다면 _최상위 모듈_이 그 앱의 유일한 모듈일 수도 있지만, 대부분의 앱은 애플리케이션 도메인, 동작 흐름, 연관성 등을 고려해서 좀 더 많은 _기능 모듈(feature modules)_ 로 구성할 수도 있습니다.

_최상위_ 모듈이든 _기능_ 모듈이든, Angular 모듈은 `@NgModule` 데코레이터가 붙는 클래스로 선언합니다.

<div class="l-sub-section">

  데코레이터는 JavaScript 클래스를 변형하는 함수입니다.
  개발자가 만든 클래스가 Angular 프레임워크 안에서 어떤 의미를 가지며, 어떻게 동작해야 하는지를 지정할 때는
  Angular에서 제공하는 데코레이터를 사용합니다.
  ECMAScript에서 정의하는 데코레이터에 대한 내용은
  <a href="https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0">
  이 링크</a>를 확인하세요.

</div>

`NgModule` 은 데코레이터 함수이며, 모듈의 특성을 지정하는 메타데이터를 객체 형태의 인자로 받습니다:
* `declarations` - 모듈에 속하는 _뷰 클래스_ 를 지정합니다.
Angular에는 3 종류의 뷰 클래스가 있습니다: [컴포넌트](guide/architecture#components), [디렉티브](guide/architecture#directives), [파이프](guide/pipes).

* `exports` - 다른 모듈이 이 모듈을 참조한다면 이 모듈의 `declarations` 항목의 일부를 지정해서 다른 모듈의 [템플릿](guide/architecture#templates)에 사용할 수 있도록 모듈 외부로 공개합니다.

* `imports` - _현재_ 모듈의 컴포넌트 템플릿에서 다른 모듈의 공개된 클래스를 사용할 때 지정합니다.

* `providers` - [서비스](guide/architecture#services) 프로바이더를 지정합니다.
모듈에서 사용하는 서비스는 프로바이더에 지정된 방식으로 인스턴스를 생성하며, 이렇게 생성된 서비스는 전역 서비스 풀에 생성되어 앱 어디에서라도 접근할 수 있습니다.

* `bootstrap` - 모듈의 시작 화면이 될 _최상위 컴포넌트_ 를 지정합니다. 모듈의 _최상위 컴포넌트_ 에만 `bootstrap` 프로퍼티를 지정할 수 있습니다.

이 내용을 바탕으로 다음과 같이 간단한 최상위 모듈을 만들어 볼 수 있습니다:

<code-example path="architecture/src/app/mini-app.ts" region="module" title="src/app/app.module.ts" linenums="false"></code-example>

<div class="l-sub-section">

  위 코드에서 `exports` 프로퍼티에 사용된 `AppComponent` 는 `exports` 프로퍼티를 어떻게 사용하는지 설명하기 위해 작성했으며, 이 모듈이 동작하기 위해 필요한 내용은 아닙니다. 최상위 모듈은 모듈 트리의 최상단에 존재하기 때문에 다른 컴포넌트가 최상위 모듈을 참조하는 일은 없습니다.

</div>

애플리케이션은 최상위 모듈을 _부트스트랩_하면서 실행됩니다.
보통 `AppModule` 은 `main.ts` 파일에 다음과 같이 정의합니다.

<code-example path="architecture/src/main.ts" title="src/main.ts" linenums="false"></code-example>

### NgModules vs. JavaScript modules

클래스에 `@NgModule` 데코레이터를 붙여 선언하는 NgModule 은 Angular를 구성하는 기본 단위입니다.

그리고 이런 모듈 체계는 JavaScript에도 존재하며, JavaScript 나름의 방법으로 JavaScript 객체를 관리합니다.
하지만 JavaScript의 모듈 체계는 NgModule 체계와 완전히 다르고 연관성도 없습니다.

JavaScript에서 _파일_ 하나는 그 자체로 모듈이며, 이 파일에 정의된 모든 객체는 이 모듈에 속한다고 할 수 있습니다.
이 객체들 중 일부를 모듈 외부로 공개하려면 `export` 키워드를 사용해서 지정할 수 있으며, 다른 모듈에서는 `import` 키워드를 사용해서 이 객체를 가져올 수 있습니다.

<code-example path="architecture/src/app/app.module.ts" region="imports" linenums="false"></code-example>

<code-example path="architecture/src/app/app.module.ts" region="export" linenums="false"></code-example>

<div class="l-sub-section">
  <a href="http://exploringjs.com/es6/ch_modules.html">JavaScript의 모듈 체계에 대해 자세히 알아보려면 이 문서를 참고하세요.</a>
</div>

결국 우리가 작성하는 코드에는 _완전히 다르지만 상호 보완적인_ 2개의 모듈 체계가 있다고 할 수 있습니다. 이 두 방식은 애플리케이션을 개발하면서 각각의 역할에 맞게 모두 사용할 것입니다.

### Angular libraries

<img src="generated/images/guide/architecture/library-module.png" alt="컴포넌트" class="left">

Angular는 JavaScript 모듈을 묶어 라이브러리 모듈로 제공하며, `@angular` 라는 접두사가 붙습니다.

각각의 라이브러리는 **npm** 패키지 매니저로 설치할 수 있고, JavaScript 코드에서 `import` 키워드를 사용해서 참조할 수 있습니다.

<br class="clear">

예를 들어 Angular의 `Component` 데코레이터를 사용한다면 `@angular/core` 라이브러리를 다음과 같이 사용할 수 있습니다:

<code-example path="architecture/src/app/app.component.ts" region="import" linenums="false"></code-example>

라이브러리 뿐 아니라 Angular 모듈을 불러오는 것도 import 구문을 사용합니다:

<code-example path="architecture/src/app/mini-app.ts" region="import-browser-module" linenums="false"></code-example>

위에서 살펴본 최상위 모듈 예제에서 보듯이, 애플리케이션 모듈은 `BrowserModule` 라이브러리 안에 있는 클래스를 사용합니다. 이 클래스에 접근하려면 JavaScript `import` 키워드로 `BrowserModule` 을 참조하고, `@NgModule` 의 메타데이터 중 `imports` 프로퍼티에 다음과 같이 지정합니다.

<code-example path="architecture/src/app/mini-app.ts" region="ngmodule-imports" linenums="false"></code-example>

이 코드에서 보듯이, Angular 모듈 체계와 JavaScript 모듈 체계는 _함께_ 사용합니다.

두 모듈 체계에서 모두 "imports" 라는 용어와 "exports" 라는 용어를 사용하기 때문에 혼동이 생길 수 있겠지만, 이 고민은 시간과 경험이 쌓이면서 자연스럽게 해결될 것입니다.

<div class="l-sub-section">

  [NgModule](guide/ngmodule) 에 대해 자세히 알아보기

</div>

<hr/>

## Components

<img src="generated/images/guide/architecture/hero-component.png" alt="Component" class="left">

_컴포넌트_ 는 화면의 일부 영역인 *뷰* 를 조작합니다.

예를 들어 다음 뷰들은 각각의 컴포넌트에 의해 조작됩니다:

* 네비게이션 링크를 표시하는 최상위 뷰.
* 히어로 목록을 표시하는 뷰.
* 히어로 에디터.

컴포넌트 클래스에는 뷰를 조작하는 애플리케이션 로직을 작성합니다.
그러면 뷰는 클래스에 있는 프로퍼티와 메소드를 사용해서 상호작용 할 수 있습니다.

{@a component-code}

예를 들어 `HeroListComponent` 에 `heroes` 프로퍼티가 있고, 이 프로퍼티는 서비스에서 받아온 히어로의 배열을 반환한다고 합시다.
그리고 사용자가 목록에서 선택한 히어로를 `selectedHero` 프로퍼티에 저장하는 `selectHero()` 메소드도 있다고 합시다.
그러면 다음과 같이 컴포넌트 클래스를 작성할 수 있습니다.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class"></code-example>

Angular는 사용자의 행동에 따라 컴포넌트를 생성하고, 갱신하고, 종료합니다.

컴포넌트가 동작하는 각각의 시점은 생명주기라고 하며, 이 시점을 가로채서 [생명주기 함수](guide/lifecycle-hooks)를 실행시킬 수도 있습니다. 위 코드에서 사용한 `ngOnInit()` 함수가 생명주기 함수 중 하나입니다.

<hr/>

## Templates

<img src="generated/images/guide/architecture/template.png" alt="Template" class="left">

컴포넌트의 뷰는 **템플릿**으로 정의합니다. 이 템플릿에는 Angular가 렌더링할 화면을 HTML 형태로 정의할 수 있습니다.

템플릿은 보통의 HTML과 비슷하게 보이지만, 조금 다릅니다. 예제로 다루고 있는 `HeroListComponent` 의 템플릿을 보면 다음과 같습니다:

<code-example path="architecture/src/app/hero-list.component.html" title="src/app/hero-list.component.html"></code-example>

이 템플릿에는 `<h2>`나 `<p>`와 같이 일반적으로 HTML 문서에 사용하던 엘리먼트들이 있지만, 그 외에 다른 요소도 있습니다. `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, `<hero-detail>` 와 같은 표현은 모두 Angular [템플릿 문법](guide/template-syntax)입니다.

그리고 템플릿의 마지막 줄에 사용된 `<app-hero-detail>` 태그는 커스텀 컴포넌트인 `HeroDetailComponent` 를 표현하는 엘리먼트입니다.

이때 `HeroDetailComponent`는 이전에 살펴봤던 `HeroListComponent`와는 *다른* 컴포넌트입니다.
지금 코드를 살펴보지는 않겠지만, `HeroDetailComponent` 는 `HeroListComponent` 가 표시하는 히어로 목록 중에, 사용자가 선택한 히어로 한 명의 정보를 표시합니다.
따라서 `HeroDetailComponent`는 `HeroListComponent`의 자식 컴포넌트입니다.

<img src="generated/images/guide/architecture/component-tree.png" alt="Metadata" class="left">

일반적인 HTML 엘리먼트들 사이에서 `<app-hero-detail>` 태그가 자연스럽게 어울리는 것을 유심히 볼 필요가 있습니다. 코드에서와 마찬가지로 레이아웃에서도 커스텀 컴포넌트는 기본 HTML들과 자연스럽게 어울립니다.

<hr class="clear"/>

## Metadata

<img src="generated/images/guide/architecture/metadata.png" alt="메타데이터" class="left">

JavaScript 클래스에 메타데이터를 지정하면, 이 클래스는 Angular 프레임워크 안에서 또 다른 역할을 갖도록 변형됩니다.

<br class="clear">

`HeroListComponent` 의 [코드를 다시 보면](guide/architecture#component-code), 컴포넌트는 단순하게 클래스라는 것을 확인할 수 있습니다.
이 클래스는 프레임워크에서 만든 것도 아니고, Angular에서 제공하는 기능도 아닙니다.

사실 `HeroListComponent` 는 *그냥 클래스*일 뿐입니다. *Angular 프레임워크가 이 클래스에 지정된 메타데이터를 처리하기 전까지는* 아직 컴포넌트라고 할 수도 없습니다.

`HeroListComponent` 클래스를 Angular에서 동작하는 컴포넌트로 지정하려면, 이 클래스에 **메타데이터** 를 지정하면 됩니다.

TypeScript를 사용할 때는 **데코레이터**로 메타데이터를 지정할 수 있습니다.
`HeroListComponent`에 메타데이터를 지정할 때는 다음과 같이 사용합니다:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (metadata)" region="metadata"></code-example>

이 코드를 보면 클래스를 선언하는 코드 위쪽에 `@Component` 데코레이터가 사용된 것을 확인할 수 있습니다.

`@Component` 데코레이터를 사용할 때는 이 컴포넌트를 뷰에 표시하기 위해 필요한 설정을 객체 형태로 전달합니다.

이 중에서 자주 쓰는 항목을 몇가지 꼽아보면 다음과 같습니다:

* `selector`: 컴포넌트가 위치할 곳을 CSS 셀렉터 형식으로 지정합니다. 
예를 들어 부모 HTML에 `<hero-list></hero-list>` 라는 부분이 있으면, Angular가 `HeroListComponent` 컴포넌트의 인스턴스를 생성해서 이 태그 안에 넣습니다.


* `templateUrl`: 컴포넌트의 HTML 템플릿을 상대주소로 지정합니다. [템플릿](guide/architecture#templates) 부분을 참고하세요.

* `providers`: 컴포넌트에 **의존성으로 주입할 객체의 프로바이더** 를 배열 형태로 지정합니다.
튜토리얼에서는 히어로의 목록을 화면에 표시하기 위해 `HeroService` 가 필요하며, 컴포넌트 클래스의 생성자에 의존성을 나열하면 Angular가 알아서 처리합니다.

<img src="generated/images/guide/architecture/template-metadata-component.png" alt="메타데이터" class="left">

이런 메타데이터들을 `@Component` 데코레이터에 전달하면, Angular 프레임워크가 템플릿과 메타데이터, 컴포넌트 클래스를 조합해서 뷰를 구성합니다.

이 방식은 `@Injectable` 이나 `@Input`, `@Output` 과 같은 데코레이터에도 비슷하게 사용합니다.

<br class="clear">

요약하자면, JavaScript로 만든 클래스를 Angular 프레임워크에서 동작하는 구성요소로 변환하기 위해 메타데이터가 필요하다고 할 수 있습니다.

<hr/>

## Data binding

프레임워크를 사용하지 않는다면 컴포넌트 값이 변경됐을 때 필요한 동작을 직접 구현해야 합니다.
하지만 모든 값을 추적하면서 에러 처리 로직까지 일일이 작성하는 것은 너무나 번거로운 작업이고, 이 과정에서 또 다른 실수가 발생할 수 있습니다.
jQuery를 사용해봤다면 이 말이 어떤 의미인지 좀 더 이해하기 쉬울 것입니다.

<img src="generated/images/guide/architecture/databinding.png" alt="데이터 바인딩" class="left">

Angular에는 템플릿과 컴포넌트를 간편하게 연결하는 **데이터 바인딩** 기능이 있습니다.
템플릿 HTML에 어떤 항목을 바인딩하겠다고 선언하면, Angular가 해당 항목을 자동으로 처리합니다.

옆에 있는 그림에서 보듯이 바인딩 문법은 4종류이며, DOM과 컴포넌트를 단방향/양방향으로 연결할 수 있습니다.

<br class="clear">

`HeroListComponent` [예제](guide/architecture#templates) 를 보면, 템플릿에 3가지 종류의 데이터 바인딩을 사용하는 것을 확인할 수 있습니다:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (binding)" region="binding"></code-example>

* `{{hero.name}}` 과 같이 [*문자열 바인딩*](guide/displaying-data#interpolation) 하면 컴포넌트의 `hero.name` 프로퍼티 값을 `<li>` 엘리먼트 안에 표시합니다.

* `[hero]` 와 같이 [*프로퍼티 바인딩*](guide/template-syntax#property-binding) 하면 부모 컴포넌트 `HeroListComponent` 에 있는 `selectedHero` 값을 자식 컴포넌트 `HeroDetailComponent` 의 `hero` 프로퍼티로 전달합니다.

* `(click)` 과 같이 [*이벤트 바인딩*](guide/user-input#click) 하면 사용자가 히어로의 이름을 클릭했을 때 컴포넌트의 `selectHero` 메소드를 실행합니다.

그리고 프로퍼티 바인딩과 이벤트 바인딩을 결합한 **양방향 데이터 바인딩** 이 있습니다. 양방향 바인딩은 `ngModel` 디렉티브를 사용하며, `HeroDetailComponent` 코드에서 보듯이 다음과 같이 사용합니다:

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

양방향 바인딩을 사용하면 컴포넌트의 프로퍼티 값이 프로퍼티 바인딩 된 것처럼 화면의 입력 컨트롤에 반영됩니다.
그리고 사용자가 입력 컨트롤의 값을 변경하면 변경된 값이 이벤트 바인딩 된 것처럼 컴포넌트의 프로퍼티 값을 갱신합니다.

이 과정은 JavaScript 이벤트 싸이클이 실행될 때마다 애플리케이션 최상위 컴포넌트부터 트리를 따라 자식 컴포넌트를 순회하면서 Angular가 자동으로 처리합니다.

<figure>
  <img src="generated/images/guide/architecture/component-databinding.png" alt="데이터 바인딩">
</figure>

그래서 데이터 바인딩은 템플릿과 컴포넌트 사이에 데이터를 주고 받을 때 자주 사용합니다.

<figure>
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="부모/자식 바인딩">
</figure>

그리고 부모 컴포넌트와 자식 컴포넌트가 데이터를 주고 받을 때도 자주 사용합니다.

<hr/>

## Directives

<img src="generated/images/guide/architecture/directive.png" alt="Parent child" class="left">

Angular templates are *dynamic*. When Angular renders them, it transforms the DOM
according to the instructions given by **directives**.

A directive is a class with a `@Directive` decorator.
A component is a *directive-with-a-template*;
a `@Component` decorator is actually a `@Directive` decorator extended with template-oriented features.

<div class="l-sub-section">

  While **a component is technically a directive**,
  components are so distinctive and central to Angular applications that this architectural overview separates components from directives.

</div>

Two *other* kinds of directives exist: _structural_ and _attribute_ directives.

They tend to appear within an element tag as attributes do,
sometimes by name but more often as the target of an assignment or a binding.

**Structural** directives alter layout by adding, removing, and replacing elements in DOM.

The [example template](guide/architecture#templates) uses two built-in structural directives:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (structural)" region="structural"></code-example>

* [`*ngFor`](guide/displaying-data#ngFor) tells Angular to stamp out one `<li>` per hero in the `heroes` list.
* [`*ngIf`](guide/displaying-data#ngIf) includes the `HeroDetail` component only if a selected hero exists.

**Attribute** directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is
an example of an attribute directive. `ngModel` modifies the behavior of
an existing element (typically an `<input>`)
by setting its display value property and responding to change events.

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

Angular has a few more directives that either alter the layout structure
(for example, [ngSwitch](guide/template-syntax#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](guide/template-syntax#ngStyle) and [ngClass](guide/template-syntax#ngClass)).

Of course, you can also write your own directives. Components such as
`HeroListComponent` are one kind of custom directive.

<!-- PENDING: link to where to learn more about other kinds! -->

<hr/>

## Services

<img src="generated/images/guide/architecture/service.png" alt="Service" class="left">

_Service_ is a broad category encompassing any value, function, or feature that your application needs.

Almost anything can be a service.
A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.
<br class="clear">

Examples include:

* logging service
* data service
* message bus
* tax calculator
* application configuration

There is nothing specifically _Angular_ about services. Angular has no definition of a service.
There is no service base class, and no place to register a service.

Yet services are fundamental to any Angular application. Components are big consumers of services.

Here's an example of a service class that logs to the browser console:

<code-example path="architecture/src/app/logger.service.ts" linenums="false" title="src/app/logger.service.ts (class)" region="class"></code-example>

Here's a `HeroService` that uses a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to fetch heroes.
The `HeroService` depends on the `Logger` service and another `BackendService` that handles the server communication grunt work.

<code-example path="architecture/src/app/hero.service.ts" linenums="false" title="src/app/hero.service.ts (class)" region="class"></code-example>

Services are everywhere.

Component classes should be lean. They don't fetch data from the server,
validate user input, or log directly to the console.
They delegate such tasks to services.

A component's job is to enable the user experience and nothing more. It mediates between the view (rendered by the template)
and the application logic (which often includes some notion of a _model_).
A good component presents properties and methods for data binding.
It delegates everything nontrivial to services.

Angular doesn't *enforce* these principles.
It won't complain if you write a "kitchen sink" component with 3000 lines.

Angular does help you *follow* these principles by making it easy to factor your
application logic into services and make those services available to components through *dependency injection*.

<hr/>

## Dependency injection

<img src="generated/images/guide/architecture/dependency-injection.png" alt="Service" class="left">

_Dependency injection_ is a way to supply a new instance of a class
with the fully-formed dependencies it requires. Most dependencies are services.
Angular uses dependency injection to provide new components with the services they need.

<br class="clear">

Angular can tell which services a component needs by looking at the types of its constructor parameters.
For example, the constructor of your `HeroListComponent` needs a `HeroService`:


<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (constructor)" region="ctor"></code-example>

When Angular creates a component, it first asks an **injector** for
the services that the component requires.

An injector maintains a container of service instances that it has previously created.
If a requested service instance is not in the container, the injector makes one and adds it to the container
before returning the service to Angular.
When all requested services have been resolved and returned,
Angular can call the component's constructor with those services as arguments.
This is *dependency injection*.

The process of `HeroService` injection looks a bit like this:

<figure>
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service">
</figure>

If the injector doesn't have a `HeroService`, how does it know how to make one?

In brief, you must have previously registered a **provider** of the `HeroService` with the injector.
A provider is something that can create or return a service, typically the service class itself.

You can register providers in modules or in components.

In general, add providers to the [root module](guide/architecture#modules)
the same instance of a service is available everywhere.

<code-example path="architecture/src/app/app.module.ts" linenums="false" title="src/app/app.module.ts (module providers)" region="providers"></code-example>

Alternatively, register at a component level in the `providers` property of the `@Component` metadata:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (component providers)" region="providers"></code-example>

Registering at a component level means you get a new instance of the
service with each new instance of that component.

<!-- We've vastly oversimplified dependency injection for this overview.
The full story is in the [dependency injection](guide/dependency-injection) page. -->

Points to remember about dependency injection:

* Dependency injection is wired into the Angular framework and used everywhere.

* The *injector* is the main mechanism.
  * An injector maintains a *container* of service instances that it created.
  * An injector can create a new service instance from a *provider*.

* A *provider* is a recipe for creating a service.

* Register *providers* with injectors.

<hr/>

## Wrap up

You've learned the basics about the eight main building blocks of an Angular application:

* [모듈](guide/architecture#modules)
* [Components](guide/architecture#components)
* [Templates](guide/architecture#templates)
* [Metadata](guide/architecture#metadata)
* [Data binding](guide/architecture#data-binding)
* [Directives](guide/architecture#directives)
* [Services](guide/architecture#services)
* [Dependency injection](guide/architecture#dependency-injection)

That's a foundation for everything else in an Angular application,
and it's more than enough to get going.
But it doesn't include everything you need to know.

Here is a brief, alphabetical list of other important Angular features and services.
Most of them are covered in this documentation (or soon will be).

> [**Animations**](guide/animations): Animate component behavior
without deep knowledge of animation techniques or CSS with Angular's animation library.

> **Change detection**: The change detection documentation will cover how Angular decides that a component property value has changed,
when to update the screen, and how it uses **zones** to intercept asynchronous activity and run its change detection strategies.

> **Events**: The events documentation will cover how to use components and services to raise events with mechanisms for
publishing and subscribing to events.

> [**Forms**](guide/forms): Support complex data entry scenarios with HTML-based validation and dirty checking.

> [**HTTP**](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.

> [**Lifecycle hooks**](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction,
by implementing the lifecycle hook interfaces.

> [**Pipes**](guide/pipes): Use pipes in your templates to improve the user experience by transforming values for display. Consider this `currency` pipe expression:
>
> > `price | currency:'USD':true`
>
> It displays a price of 42.33 as `$42.33`.

> [**Router**](guide/router): Navigate from page to page within the client
  application and never leave the browser.

> [**Testing**](guide/testing): Run unit tests on your application parts as they interact with the Angular framework
using the _Angular Testing Platform_.
