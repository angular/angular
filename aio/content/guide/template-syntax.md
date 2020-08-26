<!--
# Template syntax
-->
# 템플릿 문법

<!--
In Angular, a *template* is a chunk of HTML.
Within a template, you can use special syntax to leverage many of Angular's features.
-->
Angular에서 이야기하는 *템플릿(template)*은 HTML 뭉치(chunk)를 이야기합니다.
Angualr 템플릿에는 Angular의 기능을 활용할 수 있는 특별한 문법을 사용할 수 있습니다.


<!--
## Prerequisites
-->
## 사전지식

<!--
Before learning template syntax, you should be familiar with the following:

* [Angular concepts](guide/architecture)
* JavaScript
* HTML
* CSS
-->
템플릿 문법에 대해 알아보려면 다음 내용을 먼저 이해하고 있는 것이 좋습니다:

* [Angular 개요](guide/architecture)
* JavaScript
* HTML
* CSS


<!-- Do we still need the following section? It seems more relevant to those coming from AngularJS, which is now 7 versions ago. -->
<!-- You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view. -->

<hr />

<!--
Each Angular template in your app is a section of HTML that you can include as a part of the page that the browser displays.
An Angular HTML template renders a view, or user interface, in the browser, just like regular HTML, but with a lot more functionality.

When you generate an Angular app with the Angular CLI, the `app.component.html` file is the default template containing placeholder HTML.

The template syntax guides show you how you can control the UX/UI by coordinating data between the class and the template.

<div class="is-helpful alert">

Most of the Template Syntax guides have dedicated working example apps that demonstrate the individual topic of each guide.
To see all of them working together in one app, see the comprehensive <live-example title="Template Syntax Live Code"></live-example>.

</div>
-->
Angular 템플릿은 브라우저에 표시되는 화면의 일부를 담당하는 HTML 뭉치입니다.
Angular HTML 템플릿은 일반 HTML과 마찬가지로 화면을 렌더링하고, 사용자와 상호작용하는 것 외에도 다양하게 활용할 수 있습니다.

Angular CLI로 Angular 앱을 생성하면 기본 컴포넌트가 생성되면서 이 컴포넌트의 템플릿 파일 `app.component.html` 파일도 함께 생성됩니다.

템플릿 문법 가이드 문서에서 설명하는 내용을 학습하면서 클래스에 있는 데이터를 템플릿에 표시하고, 템플릿에서 일어나는 이벤트를 반응하는 방법에 대해 알아봅시다.

<div class="is-helpful alert">

개별 템플릿 가이드 문서는 설명하는 내용과 관련된 예제를 함께 제공합니다.
모든 기능이 추가된 앱은 어떻게 동작하는지 확인하려면 <live-example title="Template Syntax Live Code"></live-example>를 참고하세요.

</div>


<!--
## Empower your HTML
-->
## HTML 확장하기

<!--
With special Angular syntax in your templates, you can extend the HTML vocabulary of your apps.
For example, Angular helps you get and set DOM (Document Object Model) values dynamically with features such as built-in template functions, variables, event listening, and data binding.

Almost all HTML syntax is valid template syntax.
However, because an Angular template is part of an overall webpage, and not the entire page, you don't need to include elements such as `<html>`, `<body>`, or `<base>`.
You can focus exclusively on the part of the page you are developing.


<div class="alert is-important">

To eliminate the risk of script injection attacks, Angular does not support the `<script>` element in templates.
Angular ignores the `<script>` tag and outputs a warning to the browser console.
For more information, see the [Security](guide/security) page.

</div>
-->
템플릿에 Angular 문법을 사용하면 기존 HTML의 기능을 확장할 수 있습니다.
템플릿 함수, 템플릿 참조 변수, 이벤트 감지, 데이터 바인딩과 같은 기능을 사용해서 DOM(Document Object Model)의 값을 참조하거나 설정하는 방식이 그렇습니다.

HTML 문서에 사용할 수 있는 문법은 템플릿에도 대부분 사용할 수 있습니다.
하지만 Angular 템플릿은 웹 페이지 전체가 아니라 화면 일부만 담당하기 때문에 `<html>`이나 `<body>`, `<base>` 엘리먼트는 사용할 수 없습니다.
Angular 컴포넌트는 화면의 일부분만 집중하는 방식으로 개발합니다.

<div class="alert is-important">

스크립트 인젝션 공격(script injection attack)을 방지하기 위해 Angular 템플릿에는 `<script>` 엘리먼트를 사용할 수 없습니다.
만약 `<script>` 엘리먼트가 사용되더라도 Angular는 이 엘리먼트를 무시하며 브라우저 콘솔에 경고 메시지를 출력합니다.
자세한 내용은 [보안](guide/security) 문서를 참고하세요.

</div>

<hr />

<!--
## More on template syntax
-->
## 템플릿 문법에 대해 더 알아보기

<!--
You may also be interested in the following:

* [Interpolation](guide/interpolation)&mdash;learn how to use interpolation and expressions in HTML.
* [Template statements](guide/template-statements)&mdash;respond to events in your templates.
* [Binding syntax](guide/binding-syntax)&mdash;use binding to coordinate values in your app.
* [Property binding](guide/property-binding)&mdash;set properties of target elements or directive `@Input()` decorators.
* [Attribute, class, and style bindings](guide/attribute-binding)&mdash;set the value of attributes, classes, and styles.
* [Event binding](guide/event-binding)&mdash;listen for events and your HTML.
* [Two-way binding](guide/two-way-binding)&mdash;share data between a class and its template.
* [Built-in directives](guide/built-in-directives)&mdash;listen to and modify the behavior and layout of HTML.
* [Template reference variables](guide/template-reference-variables)&mdash;use special variables to reference a DOM element within a template.
* [Inputs and Outputs](guide/inputs-outputs)&mdash;share data between the parent context and child directives or components
* [Template expression operators](guide/template-expression-operators)&mdash;learn about the pipe operator, `|`, and protect against `null` or `undefined` values in your HTML.
* [SVG in templates](guide/svg-in-templates)&mdash;dynamically generate interactive graphics.
-->
* [문자열 바인딩(Interpolation)](guide/interpolation)&mdash;데이터를 HTML 문서에 표시하기 위해 문자열 바인딩을 사용하는 방법에 대해 알아보세요.
* [템플릿 실행문](guide/template-statements)&mdash;템플릿에서 발생한 이벤트에 반응할 수 있습니다.
* [바인딩 문법](guide/binding-syntax)&mdash;컴포넌트에 있는 데이터를 연결하는 방법에 대해 알아보세요.
* [프로퍼티 바인딩](guide/property-binding)&mdash;`@Input()` 데코레이터가 지정된 엘리먼트/디렉티브의 프로퍼티 값을 설정할 수 있습니다.
* [어트리뷰트, 클래스, 스타일 바인딩](guide/attribute-binding)&mdash;어트리뷰트, 클래스, 스타일을 설정할 수 있습니다.
* [이벤트 바인딩](guide/event-binding)&mdash;HTML 문서에서 발생한 이벤트를 감지하는 방법에 대해 알아보세요.
* [양방향 바인딩](guide/two-way-binding)&mdash;클래스와 템플릿이 데이터를 서로 주고 받을 수 있습니다.
* [기본 디렉티브](guide/built-in-directives)&mdash;HTML 레이아웃을 조작할 때 사용하는 기본 디렉티브에 대해 알아보세요.
* [템플릿 참조 변수](guide/template-reference-variables)&mdash;템플릿에서 DOM 엘리먼트를 참조하는 방법에 대해 알아보세요.
* [입출력 프로퍼티](guide/inputs-outputs)&mdash;부모/자식 디렉티브/컴포넌트 사이에 데이터를 주고 받을 수 있습니다.
* [템플릿 표현식 연산자](guide/template-expression-operators)&mdash;템플릿에서 파이프 연산자(`|`)를 사용하는 방법, `null` 값이나 `undefined` 값을 안전하게 처리하는 방법에 대해 알아보세요.
* [템플릿에 SVG 사용하기](guide/svg-in-templates)&mdash;사용자가 조작할 수 있는 그래픽 엘리먼트를 동적으로 생성할 수 있습니다.