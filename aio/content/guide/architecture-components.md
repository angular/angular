<!--
# Introduction to components
-->
# 컴포넌트 소개

<!--
<img src="generated/images/guide/architecture/hero-component.png" alt="Component" class="left">
-->
<img src="generated/images/guide/architecture/hero-component.png" alt="컴포넌트" class="left">

<!--
A _component_ controls a patch of screen called a *view*. For example, individual components define and control each of the following views from the [Tutorial](tutorial/index):
-->
_컴포넌트_ 는 *뷰*라고 하는 화면의 일부를 조작합니다. 간단하게 예를 들면, [튜토리얼](tutorial/index) 문서에서 다루는 컴포넌트들은 다음과 같은 뷰를 각각 정의하고 있습니다:

<!--
* The app root with the navigation links.
* The list of heroes.
* The hero editor.
-->
* 네비게이션 링크가 표시되는 앱 최상위 메뉴
* 히어로 목록
* 히어로 에디터

<!--
You define a component's application logic&mdash;what it does to support the view&mdash;inside a class. The class interacts with the view through an API of properties and methods.
-->
뷰에서 사용할 애플리케이션 로직은 컴포넌트에 정의하며, 뷰는 클래스의 프로퍼티와 메소드를 활용해서 클래스와 상호작용 합니다.

<!--
For example, the `HeroListComponent` has a `heroes` property that returns an array of heroes that it acquires from a service. `HeroListComponent` also has a `selectHero()` method that sets a `selectedHero` property when the user clicks to choose a hero from that list.
-->
예를 들어 `HeroListComponent`에 있는 `heroes` 프로퍼티는 서비스에서 히어로 목록을 받아서 저장해두는 프로퍼티입니다. 그리고 `selectHero()` 메소드는 사용자가 히어로 목록에서 한 명을 선택했을 때 이 히어로를 `selectedHero` 프로퍼티에 저장하는 메소드입니다.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class"></code-example>

<!--
Angular creates, updates, and destroys components as the user moves through the application. Your app can take action at each moment in this lifecycle through optional [lifecycle hooks](guide/lifecycle-hooks), like `ngOnInit()`.
-->
Angular는 사용자의 동작에 따라 컴포넌트를 생성하고 갱신하며 종료시킵니다. 그리고 컴포넌트가 동작하는 각 라이프싸이클은 [라이프싸이클 후킹 함수](guide/lifecycle-hooks)로 가로채서 각 시점에 필요한 동작을 실행할 수 있습니다. 예를 들어 컴포넌트가 생성되는 시점을 활용하려면 `ngOnInit()` 함수를 정의하면 됩니다.

<hr/>

<!--
## Component metadata
-->
## 컴포넌트 메타데이터

<!--
<img src="generated/images/guide/architecture/metadata.png" alt="Metadata" class="left">
-->
<img src="generated/images/guide/architecture/metadata.png" alt="메타데이터" class="left">

<!--
The `@Component` decorator identifies the class immediately below it as a component class, and specifies its metadata. In the example code below, you can see that `HeroListComponent` is just a class, with no special Angular notation or syntax at all. It's not a component until mark it as one with the `@Component` decorator.
-->
Angular 컴포넌트는 컴포넌트 클래스에 `@Component` 데코레이터를 붙여서 정의하며, 이 때 데코레이터 함수에 컴포넌트의 특성을 정의하는 메타데이터를 함께 전달합니다. 아래 코드를 보면, `HeroListComponent`는 단순한 클래스이며 Angular에만 사용하는 문법은 아무것도 없는 것을 확인할 수 있습니다. `@Component` 데코레이터를 붙이기 전까지 이 클래스는 컴포넌트로 등록되지도 않습니다.

<!--
The metadata for a component tells Angular where to get the major building blocks it needs to create and present the component and its view. In particular, it associates a _template_ with the component, either directly with inline code, or by reference. Together, the component and its template describe a _view_.
-->
컴포넌트 메타데이터는 이 컴포넌트가 Angular의 구성요소로써 어떻게 생성되고 어떤 뷰를 정의하며 동작할지 정의합니다. 좀 더 자세하게 이야기하면, _뷰_ 는 컴포넌트 메타데이터에서 지정하는 외부 _템플릿_ 파일이나 인라인 템플릿이 컴포넌트 코드와 연결되면서 정의됩니다.

<!--
In addition to containing or pointing to the template, the `@Component` metadata configures, for example, how the component can be referenced in HTML and what services it requires.
-->
템플릿을 외부 파일에서 불러올지 컴포넌트 안에 포함시킬지는 `@Component` 메타데이터 설정에 의해 결정됩니다. 그리고 의존성으로 주입받아야 하는 서비스가 있다면 이 내용도 메타데이터에 지정할 수 있습니다.

<!--
 Here's an example of basic metadata for `HeroListComponent`:
-->
`HeroListComponent`에 사용된 메타데이터를 간단하게 살펴보겠습니다:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (metadata)" region="metadata"></code-example>

<!--
 This example shows some of the most useful `@Component` configuration options:
-->
이 예제에 사용된 `@Component` 데코레이터의 메타데이터는 다른 컴포넌트에서도 많이 사용합니다:

<!--
* `selector`: A CSS selector that tells Angular to create and insert an instance of this component wherever it finds the corresponding tag in template HTML. For example, if an app's  HTML contains `<app-hero-list></app-hero-list>`, then
Angular inserts an instance of the `HeroListComponent` view between those tags.
-->
* `selector`: 컴포넌트 인스턴스가 DOM 트리의 어떤 자리에 위치할지 CSS 셀렉터로 지정합니다. 위 코드에서는 HTML 문서의 `<app-hero-list></app-hero-list>`라고 작성한 위치에 `HeroListComponent`의 인스턴스가 생성되며, 이 엘리먼트가 `HeroListComponent`의 뷰로 대체됩니다.

<!--
* `templateUrl`: The module-relative address of this component's HTML template. Alternatively, you can provide the HTML template inline, as the value of the `template` property. This template defines the component's _host view_.
-->
* `templateUrl`: 컴포넌트의 HTML 템플릿을 외부 파일에 정의할 때, 이 템플릿 파일의 위치를 지정합니다. 템플릿을 인라인으로 구성하려면 이 프로퍼티 대신 `template` 프로퍼티를 사용하면 됩니다. 템플릿은 컴포넌트의 _호스트 뷰_ 를 정의합니다.

<!--
* `providers`: An array of **dependency injection providers** for services that the component requires. In the example, this tells Angular that the component's constructor requires a `HeroService` instance
in order to get the list of heroes to display.
-->
* `providers`: 컴포넌트가 생성될 때 의존성으로 주입되는 서비스의 **프로바이더**를 지정합니다. 위 코드에서는 화면에 표시할 히어로의 목록을 가져오기 위해 `HeroService`를 의존성으로 주입받습니다.

<hr/>

<!--
## Templates and views
-->
## 템플릿과 뷰

<!--
<img src="generated/images/guide/architecture/template.png" alt="Template" class="left">
-->
<img src="generated/images/guide/architecture/template.png" alt="템플릿" class="left">

<!--
You define a component's view with its companion template. A template is a form of HTML that tells Angular how to render the component.
-->
컴포넌트의 뷰는 템플릿으로 정의하며, 템플릿이 화면에 렌더링되는 모양은 HTML 형식으로 정의합니다.

<!--
Views are typically arranged hierarchically, allowing you to modify or show and hide entire UI sections or pages as a unit. The template immediately associated with a component defines that component's _host view_. The component can also define a _view hierarchy_, which contains _embedded views_, hosted by other components.
-->
뷰는 보통 계층적으로 구성하며, 개발자가 원하는 대로 일부 영역만 조작하거나 화면에서 숨기거나 보이게 할 수 있습니다. 그리고 템플릿은 컴포넌트의 최상위 뷰인 _호스트 뷰_ 에서 시작하기 때문에, 이 뷰 안에서 _또다른 뷰 계층_ 을 구성하거나 다른 컴포넌트의 뷰를 포함시킬 수도 있습니다.

<figure>
<!--
<img src="generated/images/guide/architecture/component-tree.png" alt="Component tree" class="left">
-->
<img src="generated/images/guide/architecture/component-tree.png" alt="컴포넌트 트리" class="left">
</figure>

<!--
A view hierarchy can include views from components in the same NgModule, but it also can (and often does) include views from components that are defined in different NgModules.
-->
뷰는 보통 같은 NgModule에 있는 컴포넌트를 활용해서 뷰 계층으로 구성합니다. 그리고 자주 있는 경우는 아니지만 다른 NgModule에 있는 컴포넌트를 뷰에 불러올 수도 있습니다.

<!--
## Template syntax
-->
## 템플릿 문법

<!--
A template looks like regular HTML, except that it also contains Angular [template syntax](guide/template-syntax), which alters the HTML based on your app's logic and the state of app and DOM data. Your template can use _data binding_ to coordinate the app and DOM data, _pipes_ to transform data before it is displayed, and _directives_ to apply app logic to what gets displayed.
-->
템플릿은 자주 사용하는 HTML 문법과 비슷하며, 여기에 Angular가 제공하는 [템플릿 문법](guide/template-syntax)을 사용할 수 있습니다. 템플릿 문법은 애플리케이션이나 DOM 데이터에 따라 HTML을 조작하면서 뷰를 원하는대로 표시합니다. 그리고 템플릿은 애플리케이션 데이터나 DOM 데이터를 _데이터 바인딩_ 해서 표시할 수 있고, 이 떄 _파이프_ 를 사용해서 원하는 형식으로 표현할 수도 있으며, _디렉티브_ 를 활용해서 간단한 로직을 더할수도 있습니다.

<!--
For example, here is a template for the Tutorial's `HeroListComponent`:
-->
예를 들어 튜토리얼에서 살펴봤던 `HeroListComponent`의 템플릿은 다음과 같이 정의되어 있습니다:

<code-example path="architecture/src/app/hero-list.component.html" title="src/app/hero-list.component.html"></code-example>

<!--
This template uses typical HTML elements like `<h2>` and  `<p>`, and also includes Angular template-syntax elements,  `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<app-hero-detail>`. The template-syntax elements tell Angular how to render the HTML to the screen, using program logic and data.
-->
이 템플릿에는 일반적으로 HTML 문서에 사용되는 `<h2>`나 `<p>` 엘리먼트가 사용되었으며, `*ngFor`나 `{{hero.name}}`, `(click)`, `[hero]`, `<app-hero-detail>`와 같은 문법은 Angular의 템플릿 문법을 활용한 것입니다. 템플릿 문법을 사용하면 HTML를 화면에 렌더링할 때 애플리케이션의 로직이나 데이터를 활용할 수 있습니다.

<!--
* The  `*ngFor` directive tells Angular to iterate over a list.
* The `{{hero.name}}`, `(click)`, and `[hero]` bind program data to and from the DOM, responding to user input. See more about [data binding](#data-binding) below.
* The `<app-hero-detail>` tag in the example is an element that represents a new component, `HeroDetailComponent`.  The `HeroDetailComponent`  (code not shown) is a child component of the `HeroListComponent` that defines the Hero-detail view. Notice how custom components like this mix seamlessly with native HTML in the same layouts.
-->
* `*ngFor` 디렉티브를 활용하면 템플릿에서 배열을 순회할 수 있습니다.
* `{{hero.name}}`, `(click)`, `[hero]`와 같은 문법은 애플리케이션 데이터나 사용자의 동작을 DOM과 연결하는 문법입니다. 이 내용은 아래 [데이터 바인딩](#데이터-바인딩)에서 자세하게 알아봅니다.
* `<app-hero-detail>` 태그는 Angular로 만든 `HeroDetailComponent`를 표현하는 엘리먼트입니다. 이 코드에는 표시되지 않았지만 `HeroDetailComponent`는 `HeroListComponent`의 자식 컴포넌트이며, 선택된 히어로의 상세 정보를 화면에 표시합니다. 이렇듯, Angular로 만든 커스텀 컴포넌트는 네이티브 HTML와 자연스럽게 어울립니다.

<!--
### Data binding
-->
### 데이터 바인딩

<!--
Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses into actions and value updates. Writing such push/pull logic by hand is tedious, error-prone, and a nightmare to read, as any experienced jQuery programmer can attest.
-->
프레임워크를 사용하지 않는다면 컴포넌트 값이 변경됐을 때 필요한 동작을 직접 구현해야 합니다.
하지만 모든 값을 추적하면서 에러 처리 로직까지 일일이 작성하는 것은 너무나 번거로운 작업이고, 이 과정에서 또 다른 실수가 발생할 수도 있습니다.
jQuery를 사용해봤다면 이 말이 어떤 의미인지 좀 더 이해하기 쉬울 것입니다.

<!--
Angular supports *two-way data binding*, a mechanism for coordinating parts of a template with parts of a component. Add binding markup to the template HTML to tell Angular how to connect both sides. 
-->
Angular에는 템플릿과 컴포넌트를 간편하게 연결하는 **데이터 바인딩** 기능이 있습니다.
템플릿 HTML에 어떤 항목을 바인딩하겠다고 선언하면, Angular가 해당 항목을 자동으로 처리합니다.

<!--
The following diagram shows the four forms of data binding markup. Each form has a direction&mdash;to the DOM, from the DOM, or in both directions.
-->
옆에 있는 그림에서 보듯이 Angular가 제공하는 바인딩 문법은 4종류이며, DOM과 컴포넌트를 단방향/양방향으로 연결할 수 있습니다.

<figure>
<!--
<img src="generated/images/guide/architecture/databinding.png" alt="Data Binding" class="left">
-->
<img src="generated/images/guide/architecture/databinding.png" alt="데이터 바인딩" class="left">
</figure>

<!--
This example from the `HeroListComponent` template uses three of these forms:
-->
그리고 아래 `HeroListComponent` 템플릿에는 3가지 종류의 데이터 바인딩이 사용되었습니다:

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
* The `(click)` [*event binding*](guide/user-input#binding-to-user-input-events) calls the component's `selectHero` method when the user clicks a hero's name.
-->
* `(click)` 과 같이 [*이벤트 바인딩*](guide/user-input#click) 하면 사용자가 히어로의 이름을 클릭했을 때 컴포넌트의 `selectHero` 메소드를 실행합니다.

<!--
**Two-way data binding** is an important fourth form that combines property and event binding in a single notation. Here's an example from the `HeroDetailComponent` template that uses two-way data binding with the `ngModel` directive:
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
  <img src="generated/images/guide/architecture/component-databinding.png" alt="Data Binding" class="left">
-->
  <img src="generated/images/guide/architecture/component-databinding.png" alt="데이터 바인딩" class="left">
</figure>

<!--
Data binding plays an important role in communication between a template and its component, and is also important for communication between parent and child components.
-->
데이터 바인딩은 템플릿과 컴포넌트 사이에 데이터를 주고 받을 때 사용하며, 부모 컴포넌트와 자식 컴포넌트 사이에 데이터를 주고 받을 때도 사용하기 때문에 아주 중요합니다.

<figure>
<!--
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="Parent/Child binding" class="left">
-->
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="부모/자식 바인딩" class="left">
</figure>

<!--
### Pipes
-->
### 파이프

<!--
 Angular pipes let you declare display-value transformations in your template HTML. A class with the `@Pipe` decorator defines a function that transforms input values to output values for display in a view.
-->
Angular에서 제공하는 파이프를 사용하면 애플리케이션 데이터가 템플릿 HTML에 표시될 때 원하는 형식을 지정할 수 있습니다. 파이프는 원래값을 입력받고 새로운 형식의 값을 반환하는 함수에 `@Pipe` 데코레이터를 사용해서 Angular에 등록합니다.

<!--
 Angular defines various pipes, such as the [date](https://angular.io/api/common/DatePipe) pipe and [currency](https://angular.io/api/common/CurrencyPipe) pipe; for a complete list, see the [Pipes API list](https://angular.io/api?type=pipe). You can also define new pipes.
-->
Angular는 여러가지 파이프를 기본으로 제공하는데, 이 중 [날짜](https://angular.io/api/common/DatePipe) 파이프와 [통화](https://angular.io/api/common/CurrencyPipe) 파이프는 자주 사용하게 될 것입니다. Angular에서 제공하는 파이프 목록을 확인하려면 [파이프 API 목록](https://angular.io/api?type=pipe) 문서를 참고하세요. 필요하다면 파이프를 새로 정의해서 사용할 수도 있습니다.

<!--
 To specify a value transformation in an HTML template, use the [pipe operator (|)](https://angular.io/guide/template-syntax#pipe):
-->
HTML 템플릿에 파이프를 적용할 때는 [파이프 연산자 (|)](https://angular.io/guide/template-syntax#pipe)를 다음과 같이 사용합니다:

<!--
 `{{interpolated_value | pipe_name}}`
-->
`{{변환되는 값 | 파이프 이름}}`

<!--
 You can chain pipes, sending the output of one pipe function to be transformed by another pipe function. A pipe can also take arguments that control how it performs its transformation. For example, you can pass the desired format to the `date` pipe:
-->
한 파이프의 결과는 다른 파이프로 전달하면서 체이닝할 수도 있습니다. 그리고 파이프의 동작을 구체적으로 지정하기 위해 인자를 전달할 수도 있는데, 예를 들어 `date` 파이프는 다음과 같이 다양한 방식으로 활용할 수 있습니다.

 ```
  <!-- Default format: output 'Jun 15, 2015'-->
  <p>Today is {{today | date}}</p>

 <!-- fullDate format: output 'Monday, June 15, 2015'-->
 <p>The date is {{today | date:'fullDate'}}</p>

  <!-- shortTime format: output '9:43 AM'-->
  <p>The time is {{today | date:'shortTime'}}</p>
```

<hr/>

### Directives

<img src="generated/images/guide/architecture/directive.png" alt="Directives" class="left">

Angular templates are *dynamic*. When Angular renders them, it transforms the DOM according to the instructions given by *directives*. A directive is a class with a `@Directive` decorator.

A component is technically a directive - but components are so distinctive and central to Angular applications that Angular defines the `@Component` decorator, which extends the `@Directive` decorator with template-oriented features.

There are two kinds of directives besides components:  _structural_ and _attribute_ directives. Just as for components, the metadata for a directive associates the class with a `selector` that you use to insert it into HTML. In templates, directives typically appear within an element tag as attributes, either by name or as the target of an assignment or a binding.

#### Structural directives

Structural directives alter layout by adding, removing, and replacing elements in DOM. The example template uses two built-in structural directives to add application logic to how the view is rendered:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (structural)" region="structural"></code-example>

  * [`*ngFor`](guide/displaying-data#ngFor) is an iterative; it tells Angular to stamp out one `<li>` per hero in the `heroes` list.
  * [`*ngIf`](guide/displaying-data#ngIf) is a conditional; it includes the `HeroDetail` component only if a selected hero exists.

#### Attribute directives

Attribute directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is an example of an attribute directive. `ngModel` modifies the behavior of an existing element (typically an `<input>`) by setting its display value property and responding to change events.

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

Angular has more pre-defined directives that either alter the layout structure
(for example, [ngSwitch](guide/template-syntax#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](guide/template-syntax#ngStyle) and [ngClass](guide/template-syntax#ngClass)).

You can also write your own directives. Components such as `HeroListComponent` are one kind of custom directive. You can also create custom structural and attribute directives.

<!-- PENDING: link to where to learn more about other kinds! -->