<<<<<<< HEAD
<!--
# Template Syntax
-->
# 템플릿 문법
=======
# Template syntax
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<style>
  h4 {font-size: 17px !important; text-transform: none !important;}
  .syntax { font-family: Consolas, 'Lucida Sans', Courier, sans-serif; color: black; font-size: 85%; }
  h4 .syntax { font-size: 100%; }
</style>

<<<<<<< HEAD
<!--
The Angular application manages what the user sees and can do, achieving this through the interaction of a
component class instance (the *component*) and its user-facing template.
-->
Angular 애플리케이션은 사용자의 행동에 반응하면서 화면에 데이터를 표시하는데, 이 과정은 컴포넌트 클래스와 템플릿이 상호작용하면서 이루어집니다.
=======
The Angular application manages what the user sees and can do, achieving this through the interaction of a component class instance (the *component*) and its user-facing template.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view.
-->
MVC(모델-뷰-컨트롤러)나 MVVM(모델-뷰-뷰모델) 구조를 다뤄봤다면 컴포넌트와 템플릿의 관계가 이미 익숙할 수도 있습니다.
Angular에서는 컴포넌트가 컨트롤러나 뷰모델 역할을 하고, 템플릿이 뷰 역할을 합니다.

<!--
This page is a comprehensive technical reference to the Angular template language.
It explains basic principles of the template language and describes most of the syntax that you'll encounter elsewhere in the documentation.
-->
이 문서에서는 Angular 템플릿 문법의 기술적인 부분을 종합적으로 다룹니다.
템플릿 문법의 기초부터 시작해서 다른 가이드 페이지에서도 등장하는 템플릿 문법 대부분을 이 문서에서 다룹니다.

<!--
Many code snippets illustrate the points and concepts, all of them available
in the <live-example title="Template Syntax Live Code"></live-example>.
-->

템플릿 문법의 개념을 확실하게 이해하기 위해 많은 코드를 살펴볼 것이며,
이 문서에서 설명하는 코드는 <live-example title="템플릿 문법 라이브 코딩"></live-example> 에서 확인하거나 다운받을 수 있습니다.

{@a html}
<!--
## HTML in templates
-->
## 템플릿과 HTML

<!--
HTML is the language of the Angular template.
Almost all HTML syntax is valid template syntax.
The `<script>` element is a notable exception;
it is forbidden, eliminating the risk of script injection attacks.
In practice, `<script>` is ignored and a warning appears in the browser console.
See the [Security](guide/security) page for details.
-->
Angular 템플릿에는 HTML을 사용하며, 거의 모든 HTML 문법은 템플릿 문법에서도 유효합니다.
하지만 `<script>` 엘리먼트는 예외입니다. 이 엘리먼트는 스크립트 인젝션 공격에 노출될 수 있기 때문에 Angular 템플릿에 있더라도 처리되지 않으며, 브라우저 콘솔에 경고 메시지를 출력합니다.
더 자세한 내용은 [보안](guide/security) 문서를 확인하세요.

<!--
Some legal HTML doesn't make much sense in a template.
The `<html>`, `<body>`, and `<base>` elements have no useful role.
Pretty much everything else is fair game.
-->
Angular 템플릿에 유효하지 않은 HTML 엘리먼트가 몇가지 더 있습니다.
`<html>` 이나 `<body>`, `<base>` 엘리먼트는 Angular 템플릿에 사용해도 에러나 경고가 표시되지 않지만, 별다른 역할을 하지는 않습니다.
언급하지 않은 엘리먼트는 사용해도 됩니다.

<!--
You can extend the HTML vocabulary of your templates with components and directives that appear as new elements and attributes.
In the following sections, you'll learn how to get and set DOM (Document Object Model) values dynamically through data binding.
-->
컴포넌트나 디렉티브를 정의하면 템플릿에 사용할 수 있는 HTML 엘리먼트를 새롭게 정의하거나 표준 HTML 엘리먼트에는 없던 속성을 추가할 수 있습니다.
이 문서에서는 템플릿 문법을 하나씩 살펴보면서 DOM(Document Object Model) 값을 어떻게 참조하고 어떻게 원하는 값을 지정하는지 알아볼 것입니다.

<!--
Begin with the first form of data binding&mdash;interpolation&mdash;to see how much richer template HTML can be.
-->
가장 간단한 데이터 바인딩인 문자열 바인딩(interpolation)부터 살펴보면서 템플릿 HTML이 어떻게 확장되는지 알아봅시다.

<hr/>

{@a interpolation}
{@a 문자열-바인딩}


<!--
## Interpolation and Template Expressions
-->
## 문자열 바인딩과 템플릿 표현식

<!--
Interpolation allows you to incorporate calculated strings into the text
between HTML element tags and within attribute assignments. Template
expressions are what you use to calculate those strings.

The interpolation <live-example></live-example> demonstrates all of
the syntax and code snippets described in this section.
-->
문자열 바인딩(Interpolation)을 사용하면 HTML 엘리먼트 태그나 어트리뷰트에 지정하는 문자열을 조합할 수 있습니다.
그리고 이 문자열은 템플릿 표현식으로도 조합할 수 있습니다.

이 섹션에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

<!--
### Interpolation `{{...}}`
-->
### 문자열 바인딩 `{{...}}`

<!--
Interpolation refers to embedding expressions into marked up text.
By default, interpolation uses as its delimiter the double curly braces, `{{` and `}}`.

In the following snippet, `{{ currentCustomer }}` is an example of interpolation.
-->
문자열 바인딩은 문자열 안에 포함된 표현식을 의미합니다.
기본적으로 문자열 바인딩 문법은 이중 중괄호 `{{`와 `}}`를 사용합니다.

그래서 아래 코드에서 `{{ currentCustomer }}` 부분이 문자열 바인딩이 사용된 코드입니다.

<code-example path="interpolation/src/app/app.component.html" region="interpolation-example1" header="src/app/app.component.html"></code-example>

<!--
The text between the braces is often the name of a component
property. Angular replaces that name with the
string value of the corresponding component property.
-->
이중 중괄호 안에는 보통 컴포넌트 프로퍼티 이름을 사용합니다.
그러면 Angular가 템플릿을 파싱하면서 이 프로퍼티 이름을 해당 프로퍼티에 할당된 문자열 값으로 치환합니다.

<code-example path="interpolation/src/app/app.component.html" region="component-property" header="src/app/app.component.html"></code-example>

<!--
In the example above, Angular evaluates the `title` and `itemImageUrl` properties
and fills in the blanks, first displaying some title text and then an image.

More generally, the text between the braces is a **template expression**
that Angular first **evaluates** and then **converts to a string**.
The following interpolation illustrates the point by adding two numbers:
-->
위 예제에서 Angular는 `title`과 `itemImageUrl` 프로퍼티의 값으로 템플릿의 내용을 치환하기 때문에 화면에는 애플리케이션의 이름과 이미지가 표시됩니다.

좀 더 일반적으로 이야기하면, 이중 중괄호 안에 있는 텍스트는 **템플릿 표현식(template expression)**인데, 이 표현식은 Angular가 가장 먼저 **평가(evaluate)**해서 **문자열로 변환합니다**.
그래서 다음과 같이 숫자 2개를 더하는 연산도 처리할 수 있습니다:

<code-example path="interpolation/src/app/app.component.html" region="convert-string" header="src/app/app.component.html"></code-example>

<!--
The expression can invoke methods of the host component such as `getVal()` in
the following example:
-->
템플릿 표현식에서는 메소드를 실행할 수도 있습니다. 아래 예제에 사용된 `getVal()`은 호스트 컴포넌트에 선언된 메소드입니다:

<code-example path="interpolation/src/app/app.component.html" region="invoke-method" header="src/app/app.component.html"></code-example>

<!--
Angular evaluates all expressions in double curly braces,
converts the expression results to strings, and links them with neighboring literal strings. Finally,
it assigns this composite interpolated result to an **element or directive property**.

You appear to be inserting the result between element tags and assigning it to attributes.
<<<<<<< HEAD
-->
이중 중괄호 안에 있는 템플릿 표현식은 Angular 프레임워크가 평가하고 문자열로 변환해서 같은 엘리먼트에 있는 문자열과 연결합니다. 이렇게 템플릿에 삽입된 문자열은 **엘리먼트나 디렉티브의 프로퍼티**로 사용됩니다.

<div class="alert is-helpful">

<!--
However, interpolation is a special syntax that Angular converts into a
property binding.

=======
However, interpolation is a special syntax that Angular converts into a *property binding*.

<div class="alert is-helpful">

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
If you'd like to use something other than `{{` and `}}`, you can
configure the interpolation delimiter via the
[interpolation](api/core/Component#interpolation)
option in the `Component` metadata.
-->
사실 문자열 바인딩은 프로퍼티 바인딩을 사용하는 문법 중 하나입니다.

`Component` 메타데이터에 [interpolation](api/core/Component#interpolation) 옵션을 지정하면 `{{`와 `}}` 대신 다른 표기법을 사용할 수 있습니다.

</div>

{@a template-expressions}

<!--
### Template expressions
-->
### 템플릿 표현식

<!--
A template **expression** produces a value and appears within the double
curly braces, `{{ }}`.
Angular executes the expression and assigns it to a property of a binding target;
the target could be an HTML element, a component, or a directive.

The interpolation braces in `{{1 + 1}}` surround the template expression `1 + 1`.
In the property binding,
a template expression appears in quotes to the right of the&nbsp;`=` symbol as in `[property]="expression"`.
-->
템플릿 **표현식**은 이중 중괄호를 사용해서 `{{ }}`와 같이 사용하며, 표현식이 실행된 결과를 반환합니다.
Angular는 이 표현식을 실행하고 HTML 엘리먼트나 컴포넌트, 디렉티브 등 바인딩 대상이 되는 프로퍼티에 연결합니다.

그리고 문자열 바인딩은 템플릿 표현식을 감싼 형태입니다. 그래서 `1 + 1` 이라는 템플릿 표현식을 문자열 바인딩하면 `{{1 + 1}}`과 같은 형태가 됩니다.
프로퍼티 바인딩과 함께 사용한다면 큰따옴표(`"`)와 등호(`=`)를 사용해서 `[프로퍼티]="표현식"`과 같이 사용합니다.

<!--
In terms of syntax, template expressions are similar to JavaScript.
Many JavaScript expressions are legal template expressions, with a few exceptions.

You can't use JavaScript expressions that have or promote side effects,
including:

* Assignments (`=`, `+=`, `-=`, `...`)
* Operators such as `new`, `typeof`, `instanceof`, etc.
* Chaining expressions with <code>;</code> or <code>,</code>
* The increment and decrement operators `++` and `--`
* Some of the ES2015+ operators
-->
문법으로만 보면 템플릿 표현식은 JavaScript 문법과 비슷합니다.
그래서 JavaScript 문법 대부분은 템플릿 표현식에도 사용할 수 있지만 예외가 몇가지 있습니다.

다음 JavaScript 표현식은 템플릿 표현식에 사용할 수 없습니다:

* 값을 할당하는 표현 (`=`, `+=`, `-=`, `...`)
* `new`, `typeof`, `instanceof` 연산자
* <code>;</code>나 <code>,</code>로 체이닝하는 표현식
* 증감연산자 `++`, `--`
* ES2015 이후에 도입된 연산자 중 일부

<!--
Other notable differences from JavaScript syntax include:

* No support for the bitwise operators such as `|` and `&`
<<<<<<< HEAD
* New template expression operators, such as `|`, `?.` and `!`
-->
그리고 이런 점도 JavaScript 문법과 다릅니다:

* 비트 연산자 `|`와 `&`는 사용할 수 없습니다.
* 템플릿 표현식에서만 사용하는 연산자도 존재합니다: `|`, `?.`, `!`

<!-- link to: guide/template-syntax#expression-operators -->
=======
* New [template expression operators](guide/template-syntax#expression-operators), such as `|`, `?.` and `!`

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
### Expression context
-->
### 표현식의 컨텍스트

<!--
The *expression context* is typically the _component_ instance.
In the following snippets, the `recommended` within double curly braces and the
`itemImageUrl2` in quotes refer to properties of the `AppComponent`.
-->
*템플릿 표현식의 컨텍스트*는 일반적으로 _컴포넌트_ 인스턴스의 범위와 같습니다.
그래서 아래 예제에서 이중 중괄호 안에 사용된 `recommended`와 `itemImageUrl2`는 모두 `AppComponent`에 선언된 프로퍼티를 가리킵니다.

<code-example path="interpolation/src/app/app.component.html" region="component-context" header="src/app/app.component.html"></code-example>

<!--
An expression may also refer to properties of the _template's_ context
such as a template input variable,
&lt;!-- link to built-in-directives#template-input-variables --&gt;
`let customer`, or a template reference variable, `#customerInput`.
&lt;!-- link to guide/template-ref-variables --&gt;
-->
템플릿 표현식에서는 _템플릿 안에_ 선언된 템플릿 입력 변수도 참조할 수 있습니다.
그래서 아래 코드에 선언된 `let customer`나 `#customerInput`도 템플릿 표현식에 사용할 수 있습니다.

<<<<<<< HEAD
<!--
<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (template input variable)" linenums="false">
</code-example>
-->
<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (템플릿 입력 변수)" linenums="false">
</code-example>


<!--
<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (template reference variable)" linenums="false">
</code-example>
-->
<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (템플릿 참조 변수)" linenums="false">
</code-example>
=======
<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (template input variable)"></code-example>

<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (template reference variable)"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The context for terms in an expression is a blend of the _template variables_,
the directive's _context_ object (if it has one), and the component's _members_.
If you reference a name that belongs to more than one of these namespaces,
the template variable name takes precedence, followed by a name in the directive's _context_,
and, lastly, the component's member names.
-->
Angular 템플릿의 컨텍스트는 _템플릿 변수_와 디렉티브의 _context_ 객체, 컴포넌트의 _멤버_ 가 조합된 범위입니다.
이 중 참조하는 항목의 이름이 동시에 두 군데 존재하면 템플릿 변수의 우선순위가 가장 높습니다.
그 다음 우선순위는 디렉티브의 _context_ 객체이며, 컴포넌트 멤버의 우선순위가 가장 낮습니다.

<!--
The previous example presents such a name collision. The component has a `customer`
property and the `*ngFor` defines a `customer` template variable.
-->
위에서 살펴본 예제에도 이름이 겹치는 상황이 있습니다.
템플릿에 사용된 변수 `customer`는 컴포넌트 프로퍼티로도 존재하고 `*ngFor` 안에도 존재합니다.

<div class="alert is-helpful">

<!--
The `customer` in `{{customer.name}}`
refers to the template input variable, not the component's property.

Template expressions cannot refer to anything in
the global namespace, except `undefined`. They can't refer to
`window` or `document`. Additionally, they
can't call `console.log()` or `Math.max()` and they are restricted to referencing
members of the expression context.
-->
`{{customer.name}}`에 사용된 `customer`는 컴포넌트 프로퍼티가 아니라 템플릿 입력 변수를 가리킵니다.

그리고 템플릿 표현식은 전역 범위에 있는 객체는 사용할 수 없으며 `undefined`만 허용됩니다.
그래서 `window`나 `document`도 참조할 수 없습니다.
마찬가지로, `console.log()`나 `Math.max()`와 같은 템플릿 표현식도 사용할 수 없습니다.

</div>

<!--
### Expression guidelines
-->
### 템플릿 표현식 가이드라인

<!--
When using template expressions follow these guidelines:

* [Simplicity](guide/template-syntax#simplicity)
<<<<<<< HEAD
-->
템플릿 표현식은 다음 가이드라인을 준수하며 사용하는 것을 권장합니다:

* [외부 영향 최소화](guide/template-syntax#외부-영향-최소화)
* [실행시간은 최대한 짧게](guide/template-syntax#실행시간은-최대한-짧게)
* [로직은 최대한 단순하게](guide/template-syntax#로직은-최대한-단순하게)

<!--
### No visible side effects
-->
### 외부 영향 최소화
=======
* [Quick execution](guide/template-syntax#quick-execution)
* [No visible side effects](guide/template-syntax#no-visible-side-effects)

#### Simplicity

Although it's possible to write complex template expressions, it's a better
practice to avoid them.

A property name or method call should be the norm, but an occasional Boolean negation, `!`, is OK.
Otherwise, confine application and business logic to the component,
where it is easier to develop and test.

#### Quick execution

Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as
promise resolutions, HTTP results, timer events, key presses and mouse moves.

Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values when their computation is expensive.

#### No visible side effects
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
A template expression should not change any application state other than the value of the
target property.
-->
템플릿 표현식은 대상 프로퍼티의 값만 변경하는 방식으로 작성하는 것이 좋습니다.
여러 프로퍼티나 애플리케이션의 상태를 변경하는 로직은 작성하지 않는 것을 권장합니다.

<!--
This rule is essential to Angular's "unidirectional data flow" policy.
You should never worry that reading a component value might change some other displayed value.
The view should be stable throughout a single rendering pass.
-->
이 규칙은 Angular가 제안하는 "단방향 데이터 흐름"의 관점에서도 아주 중요합니다.
다른 프로퍼티의 영향을 최소화하면 컴포넌트 프로퍼티를 참조하는 과정에 다른 프로퍼티의 영향을 걱정할 필요가 없으며, 뷰는 렌더링 단계에서 한 번만 갱신됩니다.

<!--
An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is ideal because
it is free of side effects and improves Angular's change detection performance.
In Angular terms, an idempotent expression always returns
<<<<<<< HEAD
*exactly the same thing* until
one of its dependent values changes.
-->
그래서 템플릿 표현식은 사이드 이펙트를 방지하고 Angular의 변화 감지 성능을 최대화하기 위해 [멱등적 (idempotent)](https://en.wikipedia.org/wiki/Idempotence)인 표현식으로 작성하는 것이 이상적입니다.

Angular에서 이야기하는 멱등적인 표현식이란, 어떤 값을 기준으로 표현식을 실행했을 때 *항상 같은 값을* 반환하는 표현식을 의미합니다.
=======
*exactly the same thing* until one of its dependent values changes.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Dependent values should not change during a single turn of the event loop.
If an idempotent expression returns a string or a number, it returns the same string or number when called twice in a row. If the expression returns an object, including an `array`, it returns the same object *reference* when called twice in a row.
-->
그리고 템플릿 표현식에 사용된 값은 이벤트 루프가 한 번 실행되는 동안 여러변 변경되면 안됩니다.
템플릿 표현식을 멱등적으로 작성해서 어떤 문자열이나 숫자를 반환한다면, 이 템플릿 표현식은 여러번 실행되더라도 항상 같은 값을 반환해야 합니다.
그리고 템플릿 표현식이 객체나 배열을 반환한다면, 이 템플릿 표현식은 여러번 실행되더라도 항상 같은 객체를 참조해야 합니다.

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
There is one exception to this behavior that applies to `*ngFor`. `*ngFor` has `trackBy` functionality that can deal with referential inequality of objects that when iterating over them.

For more information, see the [\*ngFor with `trackBy`](guide/template-syntax#ngfor-with-trackby) section of this guide.
-->
`*ngFor`의 동작을 제어할 때는 이 규칙을 예외로 처리할 수 있습니다.
`*ngFor`를 사용하면서 `trackBy` 기능을 사용하면 이전과 다른 객체를 참조하더라도 같은 객체를 참조하는 것으로 간주할 수 있습니다.

더 자세한 내용을 확인하려면 이 문서의 [`trackBy`와 함께 사용하기](guide/template-syntax#trackBy) 섹션을 참고하세요.

</div>

<!--
### Quick execution
-->
### 실행시간은 최대한 짧게

<!--
Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as
promise resolutions, HTTP results, timer events, key presses and mouse moves.
-->
변화 감지 싸이클은 Promise 완료, HTTP 응답, 타이머 이벤트, 키보드나 마우스 입력등에 의해 발생하는데,
Angular는 변화 감지 싸이클마다 템플릿 표현식을 다시 평가합니다.

<!--
Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values when their computation is expensive.
-->
따라서 템플릿 표현식은 최대한 빠르게 완료되어야 하며, 실행 시간이 오래 걸린다면 사용자가 불편을 느낄 것입니다.
연산이 많이 필요한 작업이라면 결과값을 캐싱하는 방법도 고려해 보세요.

<!--
### Simplicity
-->
### 로직은 최대한 단순하게

<!--
Although it's possible to write complex template expressions, it's a better
practice to avoid them.

A property name or method call should be the norm, but an occasional Boolean negation, `!`, is OK.
Otherwise, confine application and business logic to the component,
where it is easier to develop and test.
-->
템플릿 표현식에는 복잡한 로직도 자유롭게 작성할 수 있지만, 이런 방식은 피하는 것이 좋습니다.

프로퍼티를 참조하거나 메소드를 실행하는 정도가 좋고, `!`과 같은 불리언 부정 표현도 가끔 사용한다면 괜찮습니다.
그밖의 로직은 컴포넌트에 작성하고 템플릿에서는 실행만 하는 것이 좋습니다.
이렇게 작성하면 개발도 간단해지고 테스트하기도 쉽습니다.

=======
There is one exception to this behavior that applies to `*ngFor`. `*ngFor` has `trackBy` functionality that can deal with referential inequality of objects when iterating over them. See [*ngFor with `trackBy`](guide/template-syntax#ngfor-with-trackby) for details.

</div>

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
<!-- end of Interpolation doc -->

<hr/>

<!--
{@a template-statements}
-->

{@a 템플릿-실행문}

<!--
## Template statements
-->
## 템플릿 실행문 (Template statements)

<!--
A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.
You'll see template statements in the [event binding](guide/template-syntax#event-binding) section,
appearing in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.
-->
템플릿 **실행문**은 엘리먼트나 컴포넌트, 디렉티브에서 발생하는 **이벤트**에 반응합니다.
템플릿 실행문은 이 문서의 [이벤트 바인딩](guide/template-syntax#이벤트-바인딩) 섹션에서도 확인할 수 있으며,
`=` 기호를 사용해서 `(이벤트)="실행문"`과 같이 작성합니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

<!--
A template statement *has a side effect*.
That's the whole point of an event.
It's how you update application state from user action.
-->
템플릿 실행문은 *변화를 발생*시키며, 이벤트의 목적도 이것을 위한 것입니다.
템플릿 실행문은 사용자의 행동에 따라 애플리케이션을 동작시키기 위해 사용합니다.

<!--
Responding to events is the other side of Angular's "unidirectional data flow".
You're free to change anything, anywhere, during this turn of the event loop.
-->
이벤트에 반응하는 것은 Angular가 제안하는 "단방향 데이터 흐름"의 또다른 한 방향입니다.
이 방향은 컴포넌트 프로퍼티가 뷰로 반영되는 것의 반대 방향이며, 이벤트 루프에서는 어떠한 객체의 어떠한 값도 자유롭게 변경할 수 있습니다.

<!--
Like template expressions, template *statements* use a language that looks like JavaScript.
The template statement parser differs from the template expression parser and
specifically supports both basic assignment (`=`) and chaining expressions
(with <code>;</code> or <code>,</code>).
-->
템플릿 표현식과 비슷하게 템플릿 *실행문*도 JavaScript와 비슷한 문법을 사용합니다.
하지만 템플릿 실행문을 파싱하는 파서는 템플릿 표현식을 파싱하는 파서와 다르며, 템플릿 표현식에서는 사용할 수 없는 문법도 몇 가지는 사용할 수 있습니다.
템플릿 실행문에서는 값을 할당하는 표현이나(`=`) 여러 줄에 걸친 표현(<code>;</code>, <code>,</code>)도 사용할 수 있습니다.

<!--
However, certain JavaScript syntax is not allowed:
-->
하지만 다음과 같은 JavaScript 문법은 사용할 수 없습니다.

<!--
* <code>new</code>
* increment and decrement operators, `++` and `--`
* operator assignment, such as `+=` and `-=`
* the bitwise operators `|` and `&`
* the [template expression operators](guide/template-syntax#expression-operators)
-->
* <code>new</code> 키워드
* `+=`나 `-=`와 같은 연산 할당자
* `|`나 `&`와 같은 비트 연산자
* [템플릿 표현식 전용 연산자](guide/template-syntax#템플릿-표현식-전용-연산자)

<!--
### Statement context
-->
### 템플릿 실행문의 컨텍스트

<!--
As with expressions, statements can refer only to what's in the statement context
such as an event handling method of the component instance.
-->
템플릿 표현식과 비슷하게 템플릿 실행문도 컨텍스트가 제한되어 있으며, 컴포넌트 인스턴스에 있는 이벤트 핸들링 메소드를 주로 사용합니다.

<!--
The *statement context* is typically the component instance.
The *deleteHero* in `(click)="deleteHero()"` is a method of the data-bound component.
-->
*템플릿 실행문의 컨텍스트*는 컴포넌트 인스턴스의 범위와 같습니다.
예를 들어 아래 코드에서 `(click)="deleteHero()"`에 사용된 `deleteHero`는 컴포넌트에서 데이터를 처리하는 메소드입니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

<!--
The statement context may also refer to properties of the template's own context.
In the following examples, the template `$event` object,
a [template input variable](guide/template-syntax#template-input-variable) (`let hero`),
and a [template reference variable](guide/template-syntax#ref-vars) (`#heroForm`)
are passed to an event handling method of the component.
-->
템플릿 실행문의 컨텍스트에서는 템플릿 컨텍스트 안에 있는 프로퍼티에 접근할 수도 있습니다.
아래 예제에서 `$event` 객체는 템플릿 변수이며, `let hero`는 [템플릿 입력 변수](guide/template-syntax#템플릿-입력-변수)이고,
`#heroForm`은 [템플릿 참조 변수](guide/template-syntax#템플릿-참조-변수)입니다.
각각의 변수는 컴포넌트의 이벤트 핸들링 메소드로 전달됩니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" header="src/app/app.component.html"></code-example>

<!--
Template context names take precedence over component context names.
In `deleteHero(hero)` above, the `hero` is the template input variable,
not the component's `hero` property.
-->
템플릿 컨텍스트의 항목 이름과 컴포넌트의 프로퍼티 이름이 중복되면 템플릿 컨텍스트의 우선순위가 높습니다.
위 코드를 예로 들면, `deleteHero(hero)`에 사용된 `hero`는 템플릿 입력 변수이며, 컴포넌트에 있는 `hero` 프로퍼티는 템플릿 변수에 의해 가려졌습니다.

<<<<<<< HEAD
<!--
=======
### Statement guidelines

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
Template statements cannot refer to anything in the global namespace. They
can't refer to `window` or `document`.
They can't call `console.log` or `Math.max`.
-->
템플릿 실행문에서는 템플릿 표현식과 마찬가지로 전역 공간에 접근할 수 없습니다.
또, `window`나 `document`에도 접근할 수 없고, `console.log`나 `Math.max`와 같은 함수도 실행할 수 없습니다.

<<<<<<< HEAD
<!--
### Statement guidelines
-->
### 템플릿 실행문 가이드라인

<!--
=======
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.
-->
템플릿 표현식과 마찬가지로 템플릿 실행문에도 복잡한 로직을 작성하지 않는 것이 좋습니다.
간단하게 프로퍼티를 참조하거나 함수를 실행하는 것이 가장 좋은 방법입니다.

<<<<<<< HEAD
<!--
Now that you have a feel for template expressions and statements,
you're ready to learn about the varieties of data binding syntax beyond interpolation.
-->
지금까지 템플릿 표현식과 템플릿 실행문에 대해 알아봤습니다.
이제부터는 문자열 바인딩을 포함한 데이터 바인딩에 대해 자세하게 알아봅시다.


=======
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
<hr/>

<!--
{@a binding-syntax}
-->

{@a 바인딩-문법}

<<<<<<< HEAD
<!--
## Binding syntax: An overview
-->
## 바인딩 문법 : 개요

<!--
Data binding is a mechanism for coordinating what users see, with application data values.
While you could push values to and pull values from HTML,
the application is easier to write, read, and maintain if you turn these chores over to a binding framework.
You simply declare bindings between binding sources and target HTML elements and let the framework do the work.
-->
사용자가 보는 화면과 애플리케이션 데이터의 값은 데이터 바인딩을 통해 자동으로 동기화됩니다.
데이터 바인딩을 지원하는 프레임워크에서는 HTML에 값을 반영하거나 HTML에서 값을 가져오는 과정이 훨씬 간단하기 때문에,
애플리케이션 로직을 쉽고 빠르면서 간결하게 작성할 수 있습니다.
바인딩할 객체와 HTML을 단순하게 연결하기만 하면 그 이후는 프레임워크가 알아서 필요한 작업을 수행합니다.

<!--
Angular provides many kinds of data binding.
This guide covers most of them, after a high-level view of Angular data binding and its syntax.
-->
Angular는 데이터 바인딩을 여러가지 방식으로 제공합니다.
이 문서에서는 Angular가 제공하는 데이터 바인딩을 기본부터 차근차근 알아봅시다.

<!--
Binding types can be grouped into three categories distinguished by the direction of data flow:
from the _source-to-view_, from _view-to-source_, and in the two-way sequence: _view-to-source-to-view_:
-->
바인딩 방식은 데이터가 반영되는 방향에 따라 3종류로 구분할 수 있습니다. 이 때 데이터가 흐르는 방향은 _소스에서 뷰로 가는 방향_, _뷰에서 소스로 가는 방향_, _양방향_ 이 있습니다.
=======
## Binding syntax: an overview

Data-binding is a mechanism for coordinating what users see, specifically
with application data values.
While you could push values to and pull values from HTML,
the application is easier to write, read, and maintain if you turn these tasks over to a binding framework.
You simply declare bindings between binding sources, target HTML elements, and let the framework do the rest.

For a demonstration of the syntax and code snippets in this section, see the <live-example name="binding-syntax">binding syntax example</live-example>.

Angular provides many kinds of data-binding. Binding types can be grouped into three categories distinguished by the direction of data flow:

* From the _source-to-view_
* From _view-to-source_
* Two-way sequence: _view-to-source-to-view_
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="30%">
  </col>
  <col width="50%">
  </col>
  <col width="20%">
  </col>
  <tr>
    <th>
<<<<<<< HEAD
      <!--
      Data direction
      -->
      데이터 방향
=======
      Type
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
    </th>
    <th>
      <!--
      Syntax
      -->
      문법
    </th>
    <th>
<<<<<<< HEAD
      <!--
      Type
      -->
      종류
=======
      Category
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
    </th>

  </tr>
  <tr>
<<<<<<< HEAD
    <td>
      <!--
      One-way<br>from data source<br>to view target
      -->
      데이터 소스에서<br>뷰로 가는<br>단방향
=======
     <td>
      Interpolation<br>
      Property<br>
      Attribute<br>
      Class<br>
      Style
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
    </td>
    <td>

      <!--
      <code-example>
        {{expression}}
        [target]="expression"
        bind-target="expression"
      </code-example>
      -->
      <code-example>
        {{표현식}}
        [대상]="표현식"
        bind-대상="표현식"
      </code-example>

    </td>

    <td>
<<<<<<< HEAD
      <!--
      Interpolation<br>
      Property<br>
      Attribute<br>
      Class<br>
      Style
      -->
      문자열 바인딩(Interpolation)<br>
      프로퍼티<br>
      어트리뷰트<br>
      클래스<br>
      스타일
    </td>
    <tr>
      <td>
        <!--
        One-way<br>from view target<br>to data source
        -->
        뷰에서<br>데이터 소스로 가는<br>단방향
=======
      One-way<br>from data source<br>to view target
    </td>
    <tr>
      <td>
        Event
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
      </td>
      <td>
        <!--
        <code-example>
          (target)="statement"
          on-target="statement"
        </code-example>
      -->
        <code-example>
          (대상)="실행문"
          on-대상="실행문"
        </code-example>
      </td>

      <td>
<<<<<<< HEAD
        <!--
        Event
        -->
        이벤트
=======
        One-way<br>from view target<br>to data source
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
      </td>
    </tr>
    <tr>
      <td>
        <!--
        Two-way
        -->
        양방향
      </td>
      <td>
        <!--
        <code-example>
          [(target)]="expression"
          bindon-target="expression"
        </code-example>
        -->
        <code-example>
          [(대상)]="표현식"
          bindon-대상="표현식"
        </code-example>
      </td>
      <td>
        <!--
        Two-way
        -->
        양방향
      </td>
    </tr>
  </tr>
</table>

<<<<<<< HEAD
<!--
Binding types other than interpolation have a **target name** to the left of the equal sign,
either surrounded by punctuation (`[]`, `()`) or preceded by a prefix (`bind-`, `on-`, `bindon-`).
-->
문자열 바인딩을 제외하면 모든 바인딩 방식에는 등호 왼쪽에 **바인딩할 대상의 이름**이 있고, `[]`나 `()`로 둘러싸여 있거나 `bind-`, `on-`, `bindon-` 접두사가 붙습니다.

<!--
The target name is the name of a _property_. It may look like the name of an _attribute_ but it never is.
To appreciate the difference, you must develop a new way to think about template HTML.
-->
바인딩할 대상의 이름은 _프로퍼티_ 의 이름이 되는데, _어트리뷰트_ 와 헷갈릴 수 있으니 주의해야 합니다.
프로퍼티 바인딩과 어트리뷰트 바인딩의 차이를 알아보기 위해 템플릿 HTML를 조금 다른 시각으로 알아봅시다.

<!--
### A new mental model
-->
### 새로운 HTML 구현방식으로 생각하기

<!--
With all the power of data binding and the ability to extend the HTML vocabulary
with custom markup, it is tempting to think of template HTML as *HTML Plus*.
-->
기존에 있던 HTML 요소에 데이터 바인딩 기능을 추가하는 것은 *HTML 요소를 확장* 하는 것이라고 생각할 수도 있습니다.

<!--
It really *is* HTML Plus.
But it's also significantly different than the HTML you're used to.
It requires a new mental model.
-->
하지만 기존에 사용하던 HTML과 다른 점도 많습니다.
좀 더 자세하게 알아봅시다.
=======
Binding types other than interpolation have a **target name** to the left of the equal sign, either surrounded by punctuation, `[]` or `()`,
or preceded by a prefix: `bind-`, `on-`, `bindon-`.

The *target* of a binding is the property or event inside the binding punctuation: `[]`, `()` or `[()]`.

Every public member of a **source** directive is automatically available for binding.
You don't have to do anything special to access a directive member in a template expression or statement.


### Data-binding and HTML
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
In the normal course of HTML development, you create a visual structure with HTML elements, and
you modify those elements by setting element attributes with string constants.
-->
일반적으로 HTML 문서를 작성할 때는 화면에 표시하는 모양에 맞게 HTML 엘리먼트 구조를 잡고 각 엘리먼트의 어트리뷰트를 문자열로 직접 지정했습니다.

```html
<div class="special">Plain old HTML</div>
<img src="images/item.png">
<button disabled>Save</button>
```

<<<<<<< HEAD
<!--
You still create a structure and initialize attribute values this way in Angular templates.
-->
지금까지 살펴본 Angular 템플릿에서도 엘리먼트 구조를 잡거나 어트리뷰트 값을 지정할 때도 이런 방법을 사용했습니다.

<!--
Then you learn to create new elements with components that encapsulate HTML
and drop them into templates as if they were native HTML elements.
-->
그리고 HTML을 캡슐화하는 컴포넌트를 작성한 후에는 일반 HTML 엘리먼트처럼 템플릿에 사용할 수 있습니다.
=======
With data-binding, you can control things like the state of a button:

<code-example path="binding-syntax/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Notice that the binding is to the `disabled` property of the button's DOM element,
**not** the attribute. This applies to data-binding in general. Data-binding works with *properties* of DOM elements, components, and directives, not HTML *attributes*.

<<<<<<< HEAD
<!--
That's HTML Plus.
-->
그래서 이것을 HTML가 확장되었다고 하는 것입니다.

<!--
Then you learn about data binding. The first binding you meet might look like this:
-->
이제 데이터 바인딩에 대해 알아봅시다. 첫번째로 살펴볼 바인딩은 다음과 같습니다.
=======

### HTML attribute vs. DOM property
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

The distinction between an HTML attribute and a DOM property is key to understanding
how Angular binding works. **Attributes are defined by HTML. Properties are accessed from DOM (Document Object Model) nodes.**

<<<<<<< HEAD
<!--
You'll get to that peculiar bracket notation in a moment. Looking beyond it,
your intuition suggests that you're binding to the button's `disabled` attribute and setting
it to the current value of the component's `isUnchanged` property.
-->
코드에 사용된 중괄호(`[`, `]`)가 낯설어 보일 수 있습니다.
이 문법은 컴포넌트에 있는 `isUnchanged` 프로퍼티 값을 버튼의 `disabled` 어트리뷰트 값에 바인딩하는 문법일까요?

<!--
Your intuition is incorrect! Your everyday HTML mental model is misleading.
In fact, once you start data binding, you are no longer working with HTML *attributes*. You aren't setting attributes.
You are setting the *properties* of DOM elements, components, and directives.
-->
아닙니다! 이전까지 작업하던 HTML 모델과는 이 점이 다릅니다.
사실 데이터 바인딩을 사용하고 나면 더이상 HTML *어트리뷰트* 를 직접 조작할 필요가 없습니다.
단지 DOM 엘리먼트나 컴포넌트, 디렉티브의 *프로퍼티* 값만 지정하게 될 뿐입니다.
=======
* A few HTML attributes have 1:1 mapping to properties; for example, `id`.

* Some HTML attributes don't have corresponding properties; for example, `aria-*`.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

* Some DOM properties don't have corresponding attributes; for example, `textContent`.

<<<<<<< HEAD
<!--
### HTML attribute vs. DOM property
-->
### HTML 어트리뷰트 vs. DOM 프로퍼티

<!--
The distinction between an HTML attribute and a DOM property is crucial to understanding how Angular binding works.
-->
Angular에서 바인딩이 어떻게 동작하는지 이해하려면, HTML 어트리뷰트와 DOM 프로퍼티를 확실하게 구분해야 합니다.

<!--
**Attributes are defined by HTML. Properties are defined by the DOM (Document Object Model).**
-->
**어트리뷰트는 HTML에 지정합니다. 그리고 프로퍼티는 DOM(Document Object Model)에 지정합니다.**

<!--
* A few HTML attributes have 1:1 mapping to properties. `id` is one example.
=======
It is important to remember that *HTML attribute* and the *DOM property* are different things, even when they have the same name.
In Angular, the only role of HTML attributes is to initialize element and directive state.

**Template binding works with *properties* and *events*, not *attributes*.**

When you write a data-binding, you're dealing exclusively with the *DOM properties* and *events* of the target object.

<div class="alert is-helpful">

This general rule can help you build a mental model of attributes and DOM properties:
**Attributes initialize DOM properties and then they are done.
Property values can change; attribute values can't.**

There is one exception to this rule.
Attributes can be changed by `setAttribute()`, which re-initializes corresponding DOM properties.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>

For more information, see the [MDN Interfaces documentation](https://developer.mozilla.org/en-US/docs/Web/API#Interfaces) which has API docs for all the standard DOM elements and their properties.
Comparing the [`<td>` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td) attributes to the [`<td>` properties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) provides a helpful example for differentiation.
In particular, you can navigate from the attributes page to the properties via "DOM interface" link, and navigate the inheritance hierarchy up to `HTMLTableCellElement`.

<<<<<<< HEAD
* Many HTML attributes appear to map to properties ... but not in the way you might think!
-->
* 어떤 HTML 어트리뷰트는 프로퍼티와 같은 역할을 합니다. `id`가 그렇습니다.
* 프로퍼티에는 없는 HTML 어트리뷰트도 있습니다. `colspan`이 그렇습니다.
* 어트리뷰트에는 없는 DOM 프로퍼티도 있습니다. `textContent`가 그렇습니다.
* 그 외에 서로 연관이 있는 어트리뷰트와 프로퍼티는... 이 부분은 일단 넘어가죠!

<!--
That last category is confusing until you grasp this general rule:
-->
마지막 분류가 좀 헷갈릴 수 있지만, 일반적인 규칙은 이렇습니다:

<!--
**Attributes *initialize* DOM properties and then they are done.
Property values can change; attribute values can't.**
-->
**어트리뷰트는 DOM 프로퍼티의 *초기값*을 지정하고 역할이 끝납니다. 값도 변하지 않습니다.
프로퍼티는 값을 바꾸면서 계속 유지됩니다.** 

<!--
For example, when the browser renders `<input type="text" value="Bob">`, it creates a
corresponding DOM node with a `value` property *initialized* to "Bob".
-->
브라우저가 렌더링하는 `<input type="text" value="Bob">` 엘리먼트로 설명하면,
이 DOM 노드는 어트리뷰트 값인 "Bob"으로 `value` 프로퍼티가 *초기화* 되면서 만들어 집니다.

<!--
When the user enters "Sally" into the input box, the DOM element `value` *property* becomes "Sally".
But the HTML `value` *attribute* remains unchanged as you discover if you ask the input element
about that attribute: `input.getAttribute('value')` returns "Bob".
-->
그리고 사용자가 이 입력 필드에 "Sally" 라고 입력하면 DOM 엘리번트의 `value` *프로퍼티* 는 "Sally"라는 값으로 변경됩니다.
하지만 HTML에 있는 `value` *어트리뷰트*는 `input.getAttribute('value')`로 찾아봐도 "Bob"으로 남아있습니다.
=======

#### Example 1: an `<input>`

When the browser renders `<input type="text" value="Sarah">`, it creates a
corresponding DOM node with a `value` property initialized to "Sarah".

```html
<input type="text" value="Sarah">
```

When the user enters "Sally" into the `<input>`, the DOM element `value` *property* becomes "Sally".
However, if you look at the HTML attribute `value` using `input.getAttribute('value')`, you can see that the *attribute* remains unchanged&mdash;it returns "Sarah".
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The HTML attribute `value` specifies the *initial* value; the DOM `value` property is the *current* value.
-->
HTML에 있는 `value` 어트리뷰트는 연결된 DOM 필드의 값을 초기화할 뿐이고, DOM에 있는 `value` 프로퍼티가 *현재값* 을 나타냅니다.

<<<<<<< HEAD
<!--
The `disabled` attribute is another peculiar example. A button's `disabled` *property* is
`false` by default so the button is enabled.
When you add the `disabled` *attribute*, its presence alone initializes the  button's `disabled` *property* to `true`
so the button is disabled.
-->
하지만 `disabled` 어트리뷰트는 조금 다릅니다. 버튼의 `disabled` *프로퍼티* 기본값은 `fasle`이기 때문에 버튼은 활성화되어 있습니다.
이 버튼에 `disabled` *어트리뷰트*를 지정하면, 버튼의 `disabled` *프로퍼티*가 `true`로 초기화되면서 버튼이 비활성화 됩니다.

<!--
Adding and removing the `disabled` *attribute* disables and enables the button. The value of the *attribute* is irrelevant,
which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.
-->
`disabled` *어트리뷰트*를 지정하는 것에 따라 버튼이 활성화되거나 비활성화됩니다. 이 때 `disabled` 어트리뷰트의 값은 상관없습니다.
`<button disabled="false">Still Disabled</button>` 라고 지정해도 이 버튼은 비활성화 됩니다.

<!--
Setting the button's `disabled` *property*  (say, with an Angular binding) disables or enables the button.
The value of the *property* matters.
-->
하지만 버튼의 `disabled` *프로퍼티*를 Angular로 바인딩하면 버튼을 비활성화하거나 활성화할 수 있습니다.
이 때는 *프로퍼티* 값의 영향을 받습니다.

<!--
**The HTML attribute and the DOM property are not the same thing, even when they have the same name.**
-->
**HTML 어트리뷰트와 DOM 프로퍼티의 이름이 같더라도, 둘의 역할은 엄연히 다릅니다.**
=======
To see attributes versus DOM properties in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax.

#### Example 2: a disabled button

The `disabled` attribute is another example. A button's `disabled`
*property* is `false` by default so the button is enabled.

When you add the `disabled` *attribute*, its presence alone
initializes the button's `disabled` *property* to `true`
so the button is disabled.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

```html
<button disabled>Test Button</button>
```

<<<<<<< HEAD
<!--
This fact bears repeating:
**Template binding works with *properties* and *events*, not *attributes*.**
-->
중요한 내용이니 다시 한 번 설명하자면:
**템플릿 바인딩은 *프로퍼티*나 *이벤트*와 합니다. *어트리뷰트*가 아닙니다.**
=======
Adding and removing the `disabled` *attribute* disables and enables the button.
However, the value of the *attribute* is irrelevant,
which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

To control the state of the button, set the `disabled` *property*,

<<<<<<< HEAD
<header>
<!--
  A world without attributes
-->
어트리뷰트가 없는 세상
</header>

<!--
In the world of Angular, the only role of attributes is to initialize element and directive state.
When you write a data binding, you're dealing exclusively with properties and events of the target object.
HTML attributes effectively disappear.
-->
Angular에서 어트리뷰트는 엘리먼트의 초기값을 지정하거나 디렉티브의 초기 상태를 지정하는 역할만 합니다.
데이터 바인딩을 할 때도 온전히 프로퍼티나 이벤트를 객체와 연결할 뿐입니다.
HTML 어트리뷰트의 역할은 거의 없습니다.

</div>

<!--
With this model firmly in mind, read on to learn about binding targets.
-->
이런 내용을 염두에 두면서, 바인딩 대상에 대해 알아봅시다.

<!--
### Binding targets
-->
### 바인딩 대상

<!--
The **target of a data binding** is something in the DOM.
Depending on the binding type, the target can be an
(element | component | directive) property, an
(element | component | directive) event, or (rarely) an attribute name.
The following table summarizes:
-->
*데이터 바인딩의 대상*은 DOM에 있는 무언가 입니다.
이 대상은 바인딩의 종류에 따라 (엘리먼트 | 컴포넌트 | 디렉티브)의 프로퍼티나, (엘리먼트 | 컴포넌트 | 디렉티브)의 이벤트, (가끔은) 어트리뷰트가 되기도 합니다.
표로 정리해보면 다음과 같습니다.
=======
<div class="alert is-helpful">

Though you could technically set the `[attr.disabled]` attribute binding, the values are different in that the property binding requires to a boolean value, while its corresponding attribute binding relies on whether the value is `null` or not. Consider the following:

```html
<input [disabled]="condition ? true : false">
<input [attr.disabled]="condition ? 'disabled' : null">
```

Generally, use property binding over attribute binding as it is more intuitive (being a boolean value), has a shorter syntax, and is more performant.

</div>


To see the `disabled` button example in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax. This example shows you how to toggle the disabled property from the component.

## Binding types and targets

The **target of a data-binding** is something in the DOM.
Depending on the binding type, the target can be a property (element, component, or directive),
an event (element, component, or directive), or sometimes an attribute name.
The following table summarizes the targets for the different binding types.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <!--
  <col width="10%">
  </col>
  <col width="15%">
  </col>
  <col width="75%">
  </col>
  -->
  <col width="15%">
  </col>
  <col width="21%">
  </col>
  <col width="64%">
  </col>
  <tr>
    <th>
      <!--
      Type
  	  -->
  	  종류
    </th>
    <th>
      <!--
      Target
      -->
      대상
    </th>
    <th>
      <!--
      Examples
      -->
      예제
    </th>
  </tr>
  <tr>
    <td>
      <!--
      Property
      -->
      프로퍼티
    </td>
    <td>
      <!--
      Element&nbsp;property<br>
      Component&nbsp;property<br>
      Directive&nbsp;property
      -->
      엘리먼트 프로퍼티<br>
      컴포넌트 프로퍼티<br>
      디렉티브 프로퍼티
    </td>
    <td>
      <code>src</code>, <code>hero</code>, and <code>ngClass</code> in the following:
      <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1"></code-example>
      <!-- For more information, see [Property Binding](guide/property-binding). -->
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Event
      -->
      이벤트
    </td>
    <td>
      <!--
      Element&nbsp;event<br>
      Component&nbsp;event<br>
      Directive&nbsp;event
      -->
      엘리먼트 이벤트<br>
      컴포넌트 이벤트<br>
      디렉티브 이벤트
    </td>
    <td>
      <code>click</code>, <code>deleteRequest</code>, and <code>myClick</code> in the following:
      <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1"></code-example>
      <!-- KW--Why don't these links work in the table? -->
      <!-- <div>For more information, see [Event Binding](guide/event-binding).</div> -->
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Two-way
      -->
      양방향
    </td>
    <td>
      <!--
      Event and property
      -->
      이벤트나 프로퍼티
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Attribute
      -->
      어트리뷰트
    </td>
    <td>
      <!--
      Attribute
      (the&nbsp;exception)
      -->
      어트리뷰트(일부)
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Class
      -->
      클래스
    </td>
    <td>
      <!--
      <code>class</code> property
      -->
      <code>class</code> 프로퍼티
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Style
      -->
      스타일
    </td>
    <td>
      <!--
      <code>style</code> property
      -->
      <code>style</code> 프로퍼티
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1"></code-example>
    </td>
  </tr>
</table>

<<<<<<< HEAD
<!--
With this broad view in mind, you're ready to look at binding types in detail.
-->
이제 하나씩 자세하게 알아봅시다.
=======
<!-- end of binding syntax -->
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<hr/>

<!--
{@a property-binding}
-->

{@a 프로퍼티-바인딩}

<<<<<<< HEAD
<!--
## Property binding ( <span class="syntax">[property]</span> )
-->
## 프로퍼티 바인딩 ( <span class="syntax">[프로퍼티]</span> )

<!--
Write a template **property binding** to set a property of a view element.
The binding sets the property to the value of a [template expression](guide/template-syntax#template-expressions).
-->
**프로퍼티 바인딩**은 뷰 엘리먼트의 프로퍼티를 연결하는 바인딩입니다.
이 때 프로퍼티 값은 [템플릿 표현식](guide/template-syntax#템플릿-표현식)의 결과값으로 지정됩니다.

<!--
The most common property binding sets an element property to a component property value. An example is
binding the `src` property of an image element to a component's `heroImageUrl` property:
-->
프로퍼티 바인딩은 컴포넌트의 프로퍼티 값을 엘리먼트의 프로퍼티 값으로 지정하는 용도에 주로 사용합니다.
그래서 컴포넌트에 있는 `heroImageUrl` 프로퍼티 값을 이미지 엘리먼트의 `src` 프로퍼티에 지정하려면 다음과 같이 사용합니다:
=======
## Property binding `[property]`

Use property binding to _set_ properties of target elements or
directive `@Input()` decorators. For an example
demonstrating all of the points in this section, see the
<live-example name="property-binding">property binding example</live-example>.

### One-way in
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Property binding flows a value in one direction,
from a component's property into a target element property.

<<<<<<< HEAD
<!--
Another example is disabling a button when the component says that it `isUnchanged`:
-->
그리고 컴포넌트에 있는 `isUnchanged` 프로퍼티 값에 따라 버튼을 비활성화 하려면 다음과 같이 사용합니다:
=======
You can't use property
binding to read or pull values out of target elements. Similarly, you cannot use
property binding to call a method on the target element.
If the element raises events, you can listen to them with an [event binding](guide/template-syntax#event-binding).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

If you must read a target element property or call one of its methods,
see the API reference for [ViewChild](api/core/ViewChild) and
[ContentChild](api/core/ContentChild).

<<<<<<< HEAD
<!--
Another is setting a property of a directive:
-->
디렉티브 프로퍼티를 설정하려면 다음과 같이 사용합니다:
=======
### Examples
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

The most common property binding sets an element property to a component
property value. An example is
binding the `src` property of an image element to a component's `itemImageUrl` property:

<<<<<<< HEAD
<!--
Yet another is setting the model property of a custom component (a great way
for parent and child components to communicate):
-->
그리고 커스텀 컴포넌트의 모델 프로퍼티를 설정하려면 다음과 같이 사용합니다. 이 방법을 사용하면 부모 컴포넌트에서 자식 컴포넌트로 간단하게 데이터를 전달할 수 있습니다:
=======
<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Here's an example of binding to the `colSpan` property. Notice that it's not `colspan`,
which is the attribute, spelled with a lowercase `s`.

<<<<<<< HEAD
<!--
### One-way *in*
-->
### 단방향 바인딩

<!--
People often describe property binding as *one-way data binding* because it flows a value in one direction,
from a component's data property into a target element property.
-->
프로퍼티 바인딩은 컴포넌트의 데이터 프로퍼티에서 대상 엘리먼트 프로퍼티로만 값이 반영되기 때문에 *단방향 데이터 바인딩* 이라고도 합니다.

<!--
You cannot use property binding to pull values *out* of the target element.
You can't bind to a property of the target element to _read_ it. You can only _set_ it.
-->
그래서 대상 엘리먼트의 값을 *가져오는* 용도로는 프로퍼티 바인딩을 사용할 수 없습니다.
이 말은 대상 엘리먼트의 값을 *읽는 용도*로는 프로퍼티를 바인딩 할 수 없다는 뜻입니다. 대상 엘리먼트의 값을 *설정하는 용도로만* 프로퍼티 바인딩 할 수 있습니다.
=======
<code-example path="property-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

For more details, see the [MDN HTMLTableCellElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) documentation.

<!-- Add link when Attribute Binding updates are merged:
For more about `colSpan` and `colspan`, see (Attribute Binding)[guide/template-syntax]. -->
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Another example is disabling a button when the component says that it `isUnchanged`:

<<<<<<< HEAD
<!--
Similarly, you cannot use property binding to *call* a method on the target element.
-->
이와 비슷하게, 대상 엘리먼트에 있는 메소드를 *실행* 하는 용도로 프로퍼티 바인딩 할 수는 없습니다.

<!--
If the element raises events, you can listen to them with an [event binding](guide/template-syntax#event-binding).
-->
그래서 엘리먼트에서 발생하는 이벤트는 [이벤트 바인딩](guide/template-syntax#이벤트-바인딩) 으로 처리할 수 있습니다.

<!--
If you must read a target element property or call one of its methods,
you'll need a different technique.
See the API reference for
[ViewChild](api/core/ViewChild) and
[ContentChild](api/core/ContentChild).
-->
대상 엘리먼트의 프로퍼티 값을 참조해야 하거나, 대상 엘리먼트의 메소드를 실행해야 한다면 다른 방법을 사용해야 합니다.
[ViewChild](api/core/ViewChild)나 [ContentChild](api/core/ContentChild)를 참고하세요.
=======
<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Another is setting a property of a directive:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Yet another is setting the model property of a custom component&mdash;a great way
for parent and child components to communicate:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
### Binding target
-->
### 바인딩 대상
=======
### Binding targets
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
An element property between enclosing square brackets identifies the target property.
The target property in the following code is the image element's `src` property.
-->
엘리먼트의 프로퍼티를 대괄호(`[`, `]`)로 감싸면 프로퍼티 바인딩 대상으로 지정할 수 있습니다.
그래서 다음 코드에서는 이미지 엘리먼트의 `src` 프로퍼티가 프로퍼티 바인딩의 대상 프로퍼티입니다.

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
Some people prefer the `bind-` prefix alternative, known as the *canonical form*:
-->
이 방식이 익숙하지 않다면 다음과 같이 `bind-` 접두사를 사용할 수도 있습니다.
=======
There's also the `bind-` prefix alternative:

<code-example path="property-binding/src/app/app.component.html" region="bind-prefix" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
The target name is always the name of a property, even when it appears to be the name of something else.
You see `src` and may think it's the name of an attribute. No. It's the name of an image element property.
-->
이 때 대괄호로 감싸는 대상은 반드시 프로퍼티 이름이어야 합니다.
위 코드에 사용한 `src`가 어트리뷰트 이름처럼 보일 수 있지만, `src`는 이미지 엘리먼트의 프로퍼티 이름입니다.
=======
In most cases, the target name is the name of a property, even
when it appears to be the name of an attribute.
So in this case, `src` is the name of the `<img>` element property.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Element properties may be the more common targets,
but Angular looks first to see if the name is a property of a known directive,
as it is in the following example:
-->
바인딩되는 프로퍼티는 대상 엘리먼트의 프로퍼티인 것이 일반적이지만, 다음과 같이 Angular가 제공하는 기본 디렉티브의 프로퍼티일 수도 있습니다.
이 때는 엘리먼트 프로퍼티보다 디렉티브 프로퍼티의 우선순위가 높습니다:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

Technically, Angular is matching the name to a directive `@Input()`,
one of the property names listed in the directive's `inputs` array
or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.

If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
Technically, Angular is matching the name to a directive [input](guide/template-syntax#inputs-outputs),
one of the property names listed in the directive's `inputs` array or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.
-->
문법적으로 보면 디렉티브의 [입력 프로퍼티](guide/template-syntax#입출력-프로퍼티)로 지정된 프로퍼티 중에 같은 이름인 프로퍼티에 바인딩됩니다.
이 때 바인딩을 받는 디렉티브에서는 입력값을 받기 위해 `inputs` 배열을 지정하거나 `@Input()` 데코레이터를 지정해야 합니다.

</div>

<!--
If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.
-->
디렉티브나 엘리먼트에서 프로퍼티 이름을 찾지 못하면 “unknown directive” 에러가 발생합니다.
=======
Though the target name is usually the name of a property,
there is an automatic attribute-to-property mapping in Angular for
several common attributes. These include `class`/`className`, `innerHtml`/`innerHTML`, and
`tabindex`/`tabIndex`.

</div>

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

{@a avoid-side-effects}

<!--
### Avoid side effects
-->
### 외부 영향 최소화

<<<<<<< HEAD
<!--
As mentioned previously, evaluation of a template expression should have no visible side effects.
The expression language itself does its part to keep you safe.
You can't assign a value to anything in a property binding expression nor use the increment and decrement operators.
-->
이전에도 언급했듯이, 템플릿 표현식은 외부의 영향을 최소한으로 받도록 작성해야 합니다.
그리고 템플릿 표현식 자체도 간단하게 작성해서 불필요한 동작을 최소화해야 하며, 비슷한 이유로 템플릿 표현식에서는 값을 할당하거나 증감연산자를 사용할 수 없습니다.

<!--
Of course, the expression might invoke a property or method that has side effects.
Angular has no way of knowing that or stopping you.
-->
템플릿 표현식에서 프로퍼티나 메소드를 잘못 사용하더라도, Angular는 로직이 잘못된 것을 감지할 수는 없으니 주의해야 합니다.

<!--
The expression could call something like `getFoo()`. Only you know what `getFoo()` does.
If `getFoo()` changes something and you happen to be binding to that something, you risk an unpleasant experience.
Angular may or may not display the changed value. Angular may detect the change and throw a warning error.
In general, stick to data properties and to methods that return values and do no more.
-->
예를 들어 템플릿 표현식에서 `getFoo()`라는 함수를 실행할 수 있습니다. 그런데 `getFoo()`가 어떤 동작을 하는지는 이 코드를 작성한 개발자만 알 수 있습니다.
만약 `getFoo()` 함수가 어떤 프로퍼티의 값을 바꾸는데, 이 프로퍼티가 다른 곳에 바인딩 되어 있으면 바인딩이 연쇄적으로 일어나면서 어떤 결과가 발생할 지 예측하기 어려워집니다.
심지어 동작의 결과가 뷰에 나타나지 않을 수도 있습니다. 그래서 이렇게 값이 연쇄적으로 변경되는 로직은 Angular가 검출하고 경고 메시지를 출력합니다.
보통 데이터를 바인딩할 때는 데이터 프로퍼티를 직접 연결하거나, 함수의 실행 결과를 연결하는 것 이상은 하지 않는 것이 좋습니다.

<!--
### Return the proper type
-->
### 어울리는 반환값 타입 사용하기

<!--
The template expression should evaluate to the type of value expected by the target property.
Return a string if the target property expects a string.
Return a number if the target property expects a number.
Return an object if the target property expects an object.
-->
템플릿 표현식의 실행 결과는 바인딩 대상이 되는 프로퍼티에 어울리는 타입이어야 합니다.
대상 프로퍼티가 문자열로 설정된다면 템플릿 표현식은 문자열을 반환해야 하며, 대상 프로퍼티가 사용하는 타입이 숫자, 객체인 경우에도 마찬가지입니다.

<!--
The `hero` property of the `HeroDetail` component expects a `Hero` object, which is exactly what you're sending in the property binding:
-->
`HeroDetail` 컴포넌트에 정의된 `hero` 프로퍼티는 `Hero` 객체 타입이어야 한다고 합시다. 그러면 컴포넌트 외부에서 `hero` 프로퍼티에 데이터를 전달할 때도 `Hero` 타입을 전달해야 합니다:
=======
Evaluation of a template expression should have no visible side effects.
The expression language itself, or the way you write template expressions,
helps to a certain extent;
you can't assign a value to anything in a property binding expression
nor use the increment and decrement operators.

For example, you could have an expression that invoked a property or method that had
side effects. The expression could call something like `getFoo()` where only you
know what `getFoo()` does. If `getFoo()` changes something
and you happen to be binding to that something,
Angular may or may not display the changed value. Angular may detect the
change and throw a warning error.
As a best practice, stick to properties and to methods that return
values and avoid side effects.

### Return the proper type

The template expression should evaluate to the type of value
that the target property expects.
Return a string if the target property expects a string, a number if it
expects a number, an object if it expects an object, and so on.

In the following example, the `childItem` property of the `ItemDetailComponent` expects a string, which is exactly what you're sending in the property binding:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>

You can confirm this by looking in the `ItemDetailComponent` where the `@Input` type is set to a string:
<code-example path="property-binding/src/app/item-detail/item-detail.component.ts" region="input-type" header="src/app/item-detail/item-detail.component.ts (setting the @Input() type)"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

As you can see here, the `parentItem` in `AppComponent` is a string, which the `ItemDetailComponent` expects:
<code-example path="property-binding/src/app/app.component.ts" region="parent-data-type" header="src/app/app.component.ts"></code-example>

#### Passing in an object

The previous simple example showed passing in a string. To pass in an object,
the syntax and thinking are the same.

In this scenario, `ListItemComponent` is nested within `AppComponent` and the `item` property expects an object.

<code-example path="property-binding/src/app/app.component.html" region="pass-object" header="src/app/app.component.html"></code-example>

The `item` property is declared in the `ListItemComponent` with a type of `Item` and decorated with `@Input()`:

<code-example path="property-binding/src/app/list-item/list-item.component.ts" region="item-input" header="src/app/list-item.component.ts"></code-example>

In this sample app, an `Item` is an object that has two properties; an `id` and a `name`.

<code-example path="property-binding/src/app/item.ts" region="item-class" header="src/app/item.ts"></code-example>

While a list of items exists in another file, `mock-items.ts`, you can
specify a different item in `app.component.ts` so that the new item will render:

<code-example path="property-binding/src/app/app.component.ts" region="pass-object" header="src/app.component.ts"></code-example>

You just have to make sure, in this case, that you're supplying an object because that's the type of `item` and is what the nested component, `ListItemComponent`, expects.

In this example, `AppComponent` specifies a different `item` object
(`currentItem`) and passes it to the nested `ListItemComponent`. `ListItemComponent` was able to use `currentItem` because it matches what an `Item` object is according to `item.ts`. The `item.ts` file is where
`ListItemComponent` gets its definition of an `item`.

<!--
### Remember the brackets
-->
### 괄호 빼먹지 않기

<<<<<<< HEAD
<!--
The brackets tell Angular to evaluate the template expression.
If you omit the brackets, Angular treats the string as a constant
and *initializes the target property* with that string.
It does *not* evaluate the string!
-->
템플릿 표현식은 프로퍼티를 대괄호로 감싸야 Angular가 템플릿 표현식이라고 인식하고 실행할 수 있습니다.
그래서 대괄호가 없으면 Angular는 이 문장을 단순하게 문자열로 판단하고 *대상 프로퍼티를 그 문자열로 초기화*할 것입니다.
그 문자열은 *표현식으로 평가되지 않으며* 단순하게 문자열일 뿐입니다!

<!--
Don't make the following mistake:
-->
다음과 같은 경우는 예상하지 못한 에러가 발생할 수도 있습니다:
=======
The brackets, `[]`, tell Angular to evaluate the template expression.
If you omit the brackets, Angular treats the string as a constant
and *initializes the target property* with that string:

<code-example path="property-binding/src/app/app.component.html" region="no-evaluation" header="src/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
{@a one-time-initialization}
{@a 문자열로-그대로-사용하는-경우 }
=======
Omitting the brackets will render the string
`parentItem`, not the value of `parentItem`.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
### One-time string initialization
-->
### 문자열을 그대로 사용하는 경우

<!--
You *should* omit the brackets when all of the following are true:
-->
다음과 같은 경우라면 프로퍼티 바인딩에 사용하는 대괄호를 사용하지 않는 것이 좋습니다.

<!--
* The target property accepts a string value.
* The string is a fixed value that you can put directly into the template.
* This initial value never changes.
-->
* 바인딩 대상 프로퍼티에 문자열 값을 할당하는 경우
* 변경되지 않는 문자열

<!--
You routinely initialize attributes this way in standard HTML, and it works
just as well for directive and component property initialization.
The following example initializes the `prefix` property of the `StringInitComponent` to a fixed string,
not a template expression. Angular sets it and forgets about it.
-->
HTML에서 어트리뷰트를 초기화하는 방식은 Angular에서도 유효하며, 디렉티브나 컴포넌트 프로퍼티를 초기화할 때도 같은 방식을 사용합니다.
다음 예제를 보면 `HeroDetailComponent` 에 사용할 `prefix` 프로퍼티를 초기화하는데, 이 때 템플릿 표현식을 사용하지 않고 고정된 문자열을 사용했습니다.
그러면 Angular는 대상 프로퍼티의 초기값을 설정할 때만 이 문자열을 사용하고, 이후에는 신경쓰지 않습니다.

<<<<<<< HEAD
<code-example path="template-syntax/src/app/app.component.html" region="property-binding-7" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
The `[hero]` binding, on the other hand, remains a live binding to the component's `currentHero` property.
-->
하지만 `[hero]`는 컴포넌트의 `currentHero` 프로퍼티와 바인딩 되어 있습니다. 이 때는 대괄호를 사용해서 프로퍼티 바인딩으로 선언했기 때문에 `currentHero` 프로퍼티 값이 변경될 때마다 `hero` 프로퍼티가 갱신됩니다.

{@a property-binding-or-interpolation}
{@a 프로퍼티-바인딩-문자열-바인딩}

<!--
### Property binding or interpolation?
-->
### 프로퍼티 바인딩? 문자열 바인딩?
=======
<code-example path="property-binding/src/app/app.component.html" region="string-init" header="src/app/app.component.html"></code-example>

The `[item]` binding, on the other hand, remains a live binding to the component's `currentItem` property.

### Property binding vs. interpolation
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
You often have a choice between interpolation and property binding.
The following binding pairs do the same thing:
-->
코드를 작성하다보면 프로퍼티 바인딩을 해야할 지 문자열 바인딩(Interpolation)을 해야할 지 고민될 때가 있습니다.
코드를 보면서 생각해봅시다:

<code-example path="property-binding/src/app/app.component.html" region="property-binding-interpolation" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
_Interpolation_ is a convenient alternative to _property binding_ in many cases.
-->
_문자열 바인딩_을 사용하면 _프로퍼티 바인딩_ 을 사용하는 것보다 더 편한 경우도 있습니다.

<!--
When rendering data values as strings, there is no technical reason to prefer one form to the other.
You lean toward readability, which tends to favor interpolation.
You suggest establishing coding style rules and choosing the form that
both conforms to the rules and feels most natural for the task at hand.
-->
사실, 데이터를 그대로 뷰에 렌더링 한다면 두 바인딩 방식의 차이는 없습니다.
단순하게 코드를 작성하면서 가독성이 더 좋은 방식을 선택하면 됩니다.

<!--
When setting an element property to a non-string data value, you must use _property binding_.
-->
하지만 바인딩되는 프로퍼티의 타입이 문자열이 아니라면 반드시 _프로퍼티 바인딩_ 을 사용해야 합니다.

<!--
#### Content security
-->
#### 코드 안전성 검증

<!--
Imagine the following *malicious content*.
-->
`<script>` 태그가 포함된 악성 코드로 프로퍼티 바인딩 하는 경우를 생각해봅시다.
=======
Interpolation is a convenient alternative to property binding in
many cases. When rendering data values as strings, there is no
technical reason to prefer one form to the other, though readability
tends to favor interpolation. However, *when setting an element
property to a non-string data value, you must use property binding*.

### Content security

Imagine the following malicious content.

<code-example path="property-binding/src/app/app.component.ts" region="malicious-content" header="src/app/app.component.ts"></code-example>

In the component template, the content might be used with interpolation:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="property-binding/src/app/app.component.html" region="malicious-interpolated" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
Fortunately, Angular data binding is on alert for dangerous HTML.
It [*sanitizes*](guide/security#sanitization-and-security-contexts) the values before displaying them.
It **will not** allow HTML with script tags to leak into the browser, neither with interpolation
=======
Fortunately, Angular data binding is on alert for dangerous HTML. In the above case,
the HTML displays as is, and the Javascript does not execute. Angular **does not**
allow HTML with script tags to leak into the browser, neither with interpolation
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
nor property binding.
-->
다행히, Angular는 템플릿에 값을 반영하기 전에 코드의 안전성을 [*검증*](guide/security#코드-안전성-검사와-보안-영역) 하기 때문에,
위험한 HTML 코드로 프로퍼티 바인딩을 시도하면 Angular가 감지하고 경고를 표시합니다.
그래서 `<script>` 태그를 문자열 바인딩이나 프로퍼티 바인딩에 사용해도 `<script>` 태그는 동작하지 않습니다.

<<<<<<< HEAD
<code-example path="template-syntax/src/app/app.component.html" region="property-binding-vs-interpolation-sanitization" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
Interpolation handles the script tags differently than property binding but both approaches render the
content harmlessly.
-->
문자열 바인딩도 프로퍼티 바인딩과 마찬가지로 코드의 안전성을 검증하지만, `<script>` 태그를 처리하는 방식이 다르기 때문에 템플릿에 표시되는 결과가 약간 다릅니다.
=======
In the following example, however, Angular [sanitizes](guide/security#sanitization-and-security-contexts)
the values before displaying them.

<code-example path="property-binding/src/app/app.component.html" region="malicious-content" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Interpolation handles the `<script>` tags differently than
property binding but both approaches render the
content harmlessly. The following is the browser output
of the `evilTitle` examples.

<code-example language="bash">
"Template <script>alert("evil never sleeps")</script> Syntax" is the interpolated evil title.
"Template alert("evil never sleeps")Syntax" is the property bound evil title.
</code-example>

<hr/>
{@a other-bindings}
{@a 기타-바인딩}

<!--
## Attribute, class, and style bindings
-->
## 어트리뷰트, 클래스, 스타일 바인딩

<<<<<<< HEAD
<!--
The template syntax provides specialized one-way bindings for scenarios less well suited to property binding.
-->
Angular 템플릿에서는 프로퍼티 바인딩 외에도 다음과 같은 특수한 바인딩을 사용할 수 있습니다.

{@a attribute-binding}
=======
The template syntax provides specialized one-way bindings for scenarios less well-suited to property binding.

To see attribute, class, and style bindings in a functioning app, see the <live-example name="attribute-binding"></live-example> especially for this section.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
### Attribute binding
-->
### 어트리뷰트 바인딩

<<<<<<< HEAD
<!--
You can set the value of an attribute directly with an **attribute binding**.
-->
**어트리뷰트 바인딩** 을 사용하면 어트리뷰트의 값을 직접 설정할 수 있습니다.
=======
Set the value of an attribute directly with an **attribute binding**. This is the only exception to the rule that a binding sets a target property and the only binding that creates and sets an attribute.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Usually, setting an element property with a [property binding](guide/template-syntax#property-binding)
is preferable to setting the attribute with a string. However, sometimes
there is no element property to bind, so attribute binding is the solution.

<<<<<<< HEAD
<!--
This is the only exception to the rule that a binding sets a target property.
This is the only binding that creates and sets an attribute.
-->
어트리뷰트 바인딩은 대상 프로퍼티를 바인딩한다고 한 것의 유일한 예외 케이스입니다.
이 바인딩은 프로퍼티가 아니라 어트리뷰트를 직접 바인딩합니다.
=======
Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) and
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG). They are purely attributes, don't correspond to element properties, and don't set element properties. In these cases, there are no property targets to bind to.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Attribute binding syntax resembles property binding, but
instead of an element property between brackets, start with the prefix `attr`,
followed by a dot (`.`), and the name of the attribute.
You then set the attribute value, using an expression that resolves to a string,
or remove the attribute when the expression resolves to `null`.

One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:

<<<<<<< HEAD
<!--
This guide stresses repeatedly that setting an element property with a property binding
is always preferred to setting the attribute with a string. Why does Angular offer attribute binding?
-->
조금 지루하겠지만 중요한 내용이니 다시 언급하자면, 엘리먼트의 프로퍼티 값은 어트리뷰트에 문자열로 직접 지정하는 것보다 프로퍼티 바인딩을 사용하는 것이 언제나 좋습니다.
그러면 Angular는 왜 어트리뷰트 바인딩을 제공할까요?

<!--
**You must use attribute binding when there is no element property to bind.**
-->
**어트리뷰트 바인딩은 지정하려는 속성이 프로퍼티에 없고 어트리뷰트에 있을 때만 사용해야 합니다.**

<!--
Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA),
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), and
table span attributes. They are pure attributes.
They do not correspond to element properties, and they do not set element properties.
There are no property targets to bind to.
-->
[ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)나
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG),
`<table>` 엘리먼트의 `span` 어트리뷰트에 대해 생각해봅시다. 이 객체들은 순수하게 어트리뷰트만으로 구성됩니다.
이 객체들은 어트리뷰트와 같은 역할을 하는 프로퍼티가 없기 때문에 프로퍼티 바인딩을 사용할 수 없습니다.

<!--
This fact becomes painfully obvious when you write something like this.
-->
코드를 다음과 같이 작성했다고 합시다.
=======
<code-example path="attribute-binding/src/app/app.component.html" region="attrib-binding-aria" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

#### `colspan` and `colSpan`

Notice the difference between the `colspan` attribute and the `colSpan` property.

If you wrote something like this:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

<<<<<<< HEAD
<!--
And you get this error:
-->
그러면 에러가 발생합니다:
=======
You'd get this error:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example language="bash">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

<<<<<<< HEAD
<!--
As the message says, the `<td>` element does not have a `colspan` property.
It has the "colspan" *attribute*, but
interpolation and property binding can set only *properties*, not attributes.
-->
이 에러 메시지는 `<td>` 엘리먼트의 `colspan` 프로퍼티를 문자열 바인딩으로 지정할 수 없다는 뜻입니다.
"colspan"은 *어트리뷰트*입니다. 따라서 이 어트리뷰트 값을 지정하기 위해 문자열 바인딩이나 프로퍼티 바인딩은 사용할 수 없습니다.
문자열 바인딩이나 프로퍼티 바인딩은 *프로퍼티*를 바인딩 할 때만 사용할 수 있습니다.

<!--
You need attribute bindings to create and bind to such attributes.
-->
이런 경우에 어트리뷰트 바인딩을 사용합니다.

<!--
Attribute binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix **`attr`**,
followed by a dot (`.`) and the name of the attribute.
You then set the attribute value, using an expression that resolves to a string.
-->
어트리뷰트 바인딩 문법은 프로퍼티 바인딩 문법과 비슷합니다.
어트리뷰트 바인딩은 **`attr`** 접두사와 마침표(`.`)를 쓴 이후에 어트리뷰트 이름을 지정합니다.
그리고 지정되는 어트리뷰트 값은 문자열로 지정합니다.

<!--
Bind `[attr.colspan]` to a calculated value:
-->
그래서 `colspan` 어트리뷰트는 `[attr.colspan]` 와 같이 바인딩합니다.
=======
As the message says, the `<td>` element does not have a `colspan` property. This is true
because `colspan` is an attribute&mdash;`colSpan`, with a capital `S`, is the
corresponding property. Interpolation and property binding can set only *properties*, not attributes.

Instead, you'd use property binding and write it like this:

<code-example path="attribute-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
Here's how the table renders:
-->
그러면 테이블이 다음과 같이 렌더링됩니다:
=======
<hr/>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

### Class binding

<<<<<<< HEAD
<!--
One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:
-->
어트리뷰트 바인딩은 ARIA 어트리뷰트를 바인딩할 때도 많이 사용합니다:
=======
Here's how to set the `class` attribute without a binding in plain HTML:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

```html
<!-- standard class attribute setting -->
<div class="foo bar">Some text</div>
```

You can also add and remove CSS class names from an element's `class` attribute with a **class binding**.

To create a single class binding, start with the prefix `class` followed by a dot (`.`) and the name of the CSS class (for example, `[class.foo]="hasFoo"`). 
Angular adds the class when the bound expression is truthy, and it removes the class when the expression is falsy (with the exception of `undefined`, see [styling delegation](#styling-delegation)).

To create a binding to multiple classes, use a generic `[class]` binding without the dot (for example, `[class]="classExpr"`).
The expression can be a space-delimited string of class names, or you can format it as an object with class names as the keys and truthy/falsy expressions as the values. 
With object format, Angular will add a class only if its associated value is truthy. 

It's important to note that with any object-like expression (`object`, `Array`, `Map`, `Set`, etc), the identity of the object must change for the class list to be updated.
Updating the property without changing object identity will have no effect.

If there are multiple bindings to the same class name, conflicts are resolved using [styling precedence](#styling-precedence).

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Binding Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Input Type
    </th>
    <th>
      Example Input Values
    </th>
  </tr>
  <tr>
    <td>Single class binding</td>
    <td><code>[class.foo]="hasFoo"</code></td>
    <td><code>boolean | undefined | null</code></td>
    <td><code>true</code>, <code>false</code></td>
  </tr>
  <tr>
    <td rowspan=3>Multi-class binding</td>
    <td rowspan=3><code>[class]="classExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"my-class-1 my-class-2 my-class-3"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: boolean | undefined | null}</code></td>
    <td><code>{foo: true, bar: false}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['foo', 'bar']</code></td>
  </tr>
</table>


The [NgClass](#ngclass) directive can be used as an alternative to direct `[class]` bindings. 
However, using the above class binding syntax without `NgClass` is preferred because due to improvements in class binding in Angular, `NgClass` no longer provides significant value, and might eventually be removed in the future.


<hr/>

<<<<<<< HEAD
<!--
### Class binding
-->
### 클래스 바인딩

<!--
You can add and remove CSS class names from an element's `class` attribute with
a **class binding**.
-->
엘리먼트의 `class` 어트리뷰트를 바인딩하면 CSS 클래스를 동적으로 지정할 수 있습니다. 이것을 **클래스 바인딩**이라고 합니다.

<!--
Class binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `class`,
optionally followed by a dot (`.`) and the name of a CSS class: `[class.class-name]`.
-->
클래스 바인딩 문법은 프로퍼티 바인딩 문법과 비슷합니다.
클래스 바인딩은 `class` 접두사와 마침표(`.`) 를 사용해서 `[class.클래스-이름]` 과 같이 작성합니다.

<!--
The following examples show how to add and remove the application's "special" class
with class bindings.  Here's how to set the attribute without binding:
-->
이제 클래스 바인디을 사용해서 "special" 클래스를 동적으로 지정하는 방법을 알아봅시다.
먼저, 바인딩을 사용하지 않고 원래 사용하던 방식대로 클래스를 적용하려면 다음과 같이 작성합니다:
=======
### Style binding

Here's how to set the `style` attribute without a binding in plain HTML:

```html
<!-- standard style attribute setting -->
<div style="color: blue">Some text</div>
```

You can also set styles dynamically with a **style binding**.

To create a single style binding, start with the prefix `style` followed by a dot (`.`) and the name of the CSS style property (for example, `[style.width]="width"`). 
The property will be set to the value of the bound expression, which is normally a string.
Optionally, you can add a unit extension like `em` or `%`, which requires a number type.

<div class="alert is-helpful">

Note that a _style property_ name can be written in either
[dash-case](guide/glossary#dash-case), as shown above, or
[camelCase](guide/glossary#camelcase), such as `fontSize`.

</div>

If there are multiple styles you'd like to toggle, you can bind to the `[style]` property directly without the dot (for example, `[style]="styleExpr"`).
The expression attached to the `[style]` binding is most often a string list of styles like `"width: 100px; height: 100px;"`. 

You can also format the expression as an object with style names as the keys and style values as the values, like `{width: '100px', height: '100px'}`. 
It's important to note that with any object-like expression (`object`, `Array`, `Map`, `Set`, etc), the identity of the object must change for the class list to be updated.
Updating the property without changing object identity will have no effect.

If there are multiple bindings to the same style property, conflicts are resolved using [styling precedence rules](#styling-precedence).

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Binding Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Input Type
    </th>
    <th>
      Example Input Values
    </th>
  </tr>
  <tr>
    <td>Single style binding</td>
    <td><code>[style.width]="width"</code></td>
    <td><code>string | undefined | null</code></td>
    <td><code>"100px"</code></td>
  </tr>
  <tr>
  <tr>
    <td>Single style binding with units</td>
    <td><code>[style.width.px]="width"</code></td>
    <td><code>number | undefined | null</code></td>
    <td><code>100</code></td>
  </tr>
    <tr>
    <td rowspan=3>Multi-style binding</td>
    <td rowspan=3><code>[style]="styleExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"width: 100px; height: 100px"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: string | undefined | null}</code></td>
    <td><code>{width: '100px', height: '100px'}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['width', '100px']</code></td>
  </tr>
</table>

The [NgStyle](#ngstyle) directive can be used as an alternative to direct `[style]` bindings. 
However, using the above style binding syntax without `NgStyle` is preferred because due to improvements in style binding in Angular, `NgStyle` no longer provides significant value, and might eventually be removed in the future.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
You can replace that with a binding to a string of the desired class names; this is an all-or-nothing, replacement binding.
-->
`class` 어트리뷰트를 바인딩하면 이미 지정된 클래스 전체를 새로운 값으로 초기화합니다. 하지만 이 방식은 이미 지정된 클래스 전체를 새로운 값으로 덮어쓰는 방식입니다.
=======
<hr/>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

{@a styling-precedence}
### Styling Precedence

<<<<<<< HEAD
<!--
Finally, you can bind to a specific class name.
Angular adds the class when the template expression evaluates to truthy.
It removes the class when the expression is falsy.
-->
원하는 클래스만 바인딩해 봅시다.
다음과 같이 작성하면 템플릿 표현식의 평가값이 참일 때 해당 클래스가 지정되고, 평가값이 거짓일 때 해당 클래스가 해제됩니다.
=======
A single HTML element can have its CSS class list and style values bound to a multiple sources (for example, host bindings from multiple directives).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

When there are multiple bindings to the same class name or style property, Angular uses a set of precedence rules to resolve conflicts and determine which classes or styles are ultimately applied to the element.

<div class="alert is-helpful">
<<<<<<< HEAD

<!--
While this is a fine way to toggle a single class name,
the [NgClass directive](guide/template-syntax#ngClass) is usually preferred when managing multiple class names at the same time.
-->
실제로 DOM에 클래스를 지정할 때는 이 방법을 사용하지 않고 [NgClass 디렉티브](guide/template-syntax#ngClass)를 사용합니다.
`ngClass`를 사용하면 여러 클래스 중 어떤 클래스를 지정할지 자유롭게 조작할 수 있습니다.
=======
<h4>Styling precedence (highest to lowest)</h4>

1. Template bindings
    1. Property binding (for example, `<div [class.foo]="hasFoo">` or `<div [style.color]="color">`)
    1. Map binding (for example, `<div [class]="classExpr">` or `<div [style]="styleExpr">`)
    1. Static value (for example, `<div class="foo">` or `<div style="color: blue">`) 
1. Directive host bindings
    1. Property binding (for example, `host: {'[class.foo]': 'hasFoo'}` or `host: {'[style.color]': 'color'}`)
    1. Map binding (for example, `host: {'[class]': 'classExpr'}` or `host: {'[style]': 'styleExpr'}`)
    1. Static value (for example, `host: {'class': 'foo'}` or `host: {'style': 'color: blue'}`)    
1. Component host bindings
    1. Property binding (for example, `host: {'[class.foo]': 'hasFoo'}` or `host: {'[style.color]': 'color'}`)
    1. Map binding (for example, `host: {'[class]': 'classExpr'}` or `host: {'[style]': 'styleExpr'}`)
    1. Static value (for example, `host: {'class': 'foo'}` or `host: {'style': 'color: blue'}`)    
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>

The more specific a class or style binding is, the higher its precedence.

A binding to a specific class (for example, `[class.foo]`) will take precedence over a generic `[class]` binding, and a binding to a specific style (for example, `[style.bar]`) will take precedence over a generic `[style]` binding.

<<<<<<< HEAD
<!--
### Style binding
-->
### 스타일 바인딩

<!--
You can set inline styles with a **style binding**.
-->
인라인 스타일은 **스타일 바인딩**으로도 지정할 수 있습니다.

<!--
Style binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `style`,
followed by a dot (`.`) and the name of a CSS style property: `[style.style-property]`.
-->
스타일 바인딩 문법은 프로퍼티 바인딩 문법과 비슷합니다.
스타일 바인딩은 `style` 접두사와 마침표(`.`) 를 사용해서 `[style.스타일-프로퍼티]`와 같이 작성합니다.
=======
<code-example path="attribute-binding/src/app/app.component.html" region="basic-specificity" header="src/app/app.component.html"></code-example>

Specificity rules also apply when it comes to bindings that originate from different sources. 
It's possible for an element to have bindings in the template where it's declared, from host bindings on matched directives, and from host bindings on matched components.

Template bindings are the most specific because they apply to the element directly and exclusively, so they have the highest precedence.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Directive host bindings are considered less specific because directives can be used in multiple locations, so they have a lower precedence than template bindings.

<<<<<<< HEAD
<!--
Some style binding styles have a unit extension.
The following example conditionally sets the font size in  “em” and “%” units .
-->
그리고 스타일을 바인딩하면서 단위를 함께 사용할 수도 있습니다.
글자 크기를 지정하면서 “em” 이나 “%” 단위를 사용하려면 다음과 같이 작성합니다.
=======
Directives often augment component behavior, so host bindings from components have the lowest precedence. 
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="attribute-binding/src/app/app.component.html" region="source-specificity" header="src/app/app.component.html"></code-example>

In addition, bindings take precedence over static attributes. 

<<<<<<< HEAD
<!--
While this is a fine way to set a single style,
the [NgStyle directive](guide/template-syntax#ngStyle) is generally preferred when setting several inline styles at the same time.
-->
실제로 DOM에 스타일을 지정할 때는 이 방법을 사용하지 않고 [NgStyle directive](guide/template-syntax#ngStyle)를 사용합니다.
`ngStyle`을 사용하면 여러 스타일 중 어떤 스타일을 지정할지 자유롭게 조작할 수 있습니다.
=======
In the following case, `class` and `[class]` have similar specificity, but the `[class]` binding will take precedence because it is dynamic.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="attribute-binding/src/app/app.component.html" region="dynamic-priority" header="src/app/app.component.html"></code-example>

{@a styling-delegation}
### Delegating to styles with lower precedence

<<<<<<< HEAD
<!--
Note that a _style property_ name can be written in either
[dash-case](guide/glossary#dash-case), as shown above, or
[camelCase](guide/glossary#camelcase), such as `fontSize`.
-->
_스타일 프로퍼티_ 이름은 [대시 케이스](guide/glossary#dash-case)를 사용하거나 [캐멀 케이스](guide/glossary#camelcase)를 사용할 수 있습니다.
=======
It is possible for higher precedence styles to "delegate" to lower precedence styles using `undefined` values.
Whereas setting a style property to `null` ensures the style is removed, setting it to `undefined` will cause Angular to fall back to the next-highest precedence binding to that style.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

For example, consider the following template: 

<code-example path="attribute-binding/src/app/app.component.html" region="style-delegation" header="src/app/app.component.html"></code-example>

Imagine that the `dirWithHostBinding` directive and the `comp-with-host-binding` component both have a `[style.width]` host binding.
In that case, if `dirWithHostBinding` sets its binding to `undefined`, the `width` property will fall back to the value of the `comp-with-host-binding` host binding.
However, if `dirWithHostBinding` sets its binding to `null`, the `width` property will be removed entirely.


<!--
{@a event-binding}
-->
{@a 이벤트-바인딩}


<!--
## Event binding `(event)`
-->
## 이벤트 바인딩 `(event)`

<!--
Event binding allows you to listen for certain events such as
keystrokes, mouse movements, clicks, and touches. For an example
demonstrating all of the points in this section, see the <live-example name="event-binding">event binding example</live-example>.

Angular event binding syntax consists of a **target event** name
within parentheses on the left of an equal sign, and a quoted
template statement on the right.
The following event binding listens for the button's click events, calling
the component's `onSave()` method whenever a click occurs:
-->
이벤트 바인딩 문법을 사용하면 키 입력이나 마우스의 움직임, 클릭이나 터치 이벤트를 감지할 수 있습니다.
이 섹션에서 설명하는 내용은 <live-example name="event-binding">이벤트 바인딩 예제</live-example> 에서 직접 확인할 수 있습니다.

이벤트 바인딩은 **대상 이벤트** 이름을 괄호(`(`, `)`)로 감싸고 템플릿 실행문을 등호로 연결해서 작성합니다.
예를 들어 버튼의 클릭 이벤트를 감지하고 있다가 사용자가 버튼을 클릭할 때 컴포넌트에 있는 `onSave()` 메소드를 실행하려면 다음과 같이 구현합니다.

<div class="lightbox">
  <img src='generated/images/guide/template-syntax/syntax-diagram.svg' alt="Syntax diagram">
</div>

<!--
### Target event
-->
### 대상 이벤트

<!--
As above, the target is the button's click event.
-->
위에서 언급한 것처럼, 대상 이벤트는 버튼 클릭 이벤트입니다.

<code-example path="event-binding/src/app/app.component.html" region="event-binding-1" header="src/app/app.component.html"></code-example>

<!--
Alternatively, use the `on-` prefix, known as the canonical form:
-->
이 방식이 익숙하지 않다면 다음과 같이 `on-` 접두사를 사용할 수도 있습니다.

<code-example path="event-binding/src/app/app.component.html" region="event-binding-2" header="src/app/app.component.html"></code-example>

<!--
Element events may be the more common targets, but Angular looks first to see if the name matches an event property
of a known directive, as it does in the following example:
-->
엘리먼트에서 발생하는 이벤트는 HTML 스펙에 정의된 이벤트인 경우가 대부분입니다. 하지만 커스텀 이벤트가 정의되어 있다면 그 이벤트도 같은 방식으로 사용할 수 있습니다. 커스텀 이벤트의 이름이 일반 이벤트 이름과 겹치면 커스텀 이벤트의 우선순위가 더 높습니다:

<code-example path="event-binding/src/app/app.component.html" region="custom-directive" header="src/app/app.component.html"></code-example>

<!--
If the name fails to match an element event or an output property of a known directive,
Angular reports an “unknown directive” error.
-->
그리고 엘리먼트 이벤트나 커스텀 디렉티브에서 해당되는 이벤트 이름을 찾지 못하면 “unknown directive” 에러가 발생합니다.

<!--
### *$event* and event handling statements
-->
### *$event* 객체와 이벤트 처리 실행문

<!--
In an event binding, Angular sets up an event handler for the target event.
-->
이벤트를 바인딩하면 Angular의 이벤트 처리 함수가 대상 이벤트와 연결됩니다.

<!--
When the event is raised, the handler executes the template statement.
The template statement typically involves a receiver, which performs an action
in response to the event, such as storing a value from the HTML control
into a model.
-->
그러면 이벤트가 발생했을 때 Angular 프레임워크의 이벤트 처리 함수가 템플릿 실행문을 실행하는데,
이 템플릿 실행문을 사용해서 원하는 동작을 실행할 수 있습니다.

<!--
The binding conveys information about the event. This information can include data values such as an event object, string, or number named `$event`.

The target event determines the shape of the `$event` object.
If the target event is a native DOM element event, then `$event` is a
[DOM event object](https://developer.mozilla.org/en-US/docs/Web/Events),
with properties such as `target` and `target.value`.
-->
이 때 템플릿 실행문에는 이벤트에 대한 정보와 이벤트가 발생한 HTML 컨트롤에 대한 정보가 `$event` 라는 객체에 담겨 전달됩니다.
그리고 이 정보는 `$event`라는 이름으로 뭉뚱그려지기는 했지만 객체가 될 수도 있고 문자열이나 숫자가 될 수도 있습니다.

`$event` 객체의 타입은 이벤트가 어떤것이냐에 따라 달라집니다.
대상 이벤트가 네이티브 DOM 엘리먼트의 이벤트라면 `$envet` 객체는 [DOM 이벤트 객체](https://developer.mozilla.org/en-US/docs/Web/Events)이며, 이 객체에서 `target` 프로퍼티나 `target.value` 값을 참조할 수 있습니다.

<!--
Consider this example:
-->
다음 예제를 봅시다:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-3" header="src/app/app.component.html"></code-example>

<!--
This code sets the `<input>` `value` property by binding to the `name` property.
To listen for changes to the value, the code binds to the `input`
event of the `<input>` element.
When the user makes changes, the `input` event is raised, and the binding executes
the statement within a context that includes the DOM event object, `$event`.
-->
이 코드에서는 `currentHero.name` 프로퍼티를 `<input>` 엘리먼트의 `value` 프로퍼티로 바인딩하면서 초기값을 지정합니다.
그리고 값이 변경되는 것을 감지하기 위해 `<input>` 엘리먼트의 `input` 이벤트를 바인딩합니다.
사용자가 입력 필드의 값을 변경하면 `input` 이벤트가 발생하고 이 이벤트에 연결된 템플릿 실행문이 실행되는데, 이 때 DOM 이벤트 객체가 `$event` 객체로 템플릿 실행문에 전달됩니다.

<!--
To update the `name` property, the changed text is retrieved by following the path `$event.target.value`.
-->
그리고 이벤트 객체에서 값을 참조해서 `name` 프로퍼티 값을 다시 지정하기 위해 템플릿 실행문을 `$event.target.value` 와 같이 작성했습니다.

<!--
If the event belongs to a directive&mdash;recall that components
are directives&mdash;`$event` has whatever shape the directive produces.
-->
대상 이벤트가 DOM 엘리먼트의 이벤트가 아니고 커스텀 디렉티브(컴포넌트)에서 정의하는 이벤트라면, `$event` 객체는 해당 디렉티브에서 정의하는 대로 자유로운 형식이 될 수 있습니다.

### Custom events with `EventEmitter`

<!--
Directives typically raise custom events with an Angular [EventEmitter](api/core/EventEmitter).
The directive creates an `EventEmitter` and exposes it as a property.
The directive calls `EventEmitter.emit(payload)` to fire an event, passing in a message payload, which can be anything.
Parent directives listen for the event by binding to this property and accessing the payload through the `$event` object.
-->
Angular에서 제공하는 [EventEmitter](api/core/EventEmitter)를 사용하면 커스텀 이벤트를 만들 수 있습니다.
우선, 디렉티브에 `EventEmitter` 타입의 프로퍼티를 선언하고 이 프로퍼티를 디렉티브 외부로 열어줍니다.
그런 뒤 `EventEmitter` 객체의 `emit(데이터)` 함수를 실행하면 데이터가 `$event` 객체에 담겨 디렉티브 외부로 전달됩니다.
부모 디렉티브에서는 자식 디렉티브의 이벤트 프로퍼티를 바인딩해서 이 커스텀 이벤트를 감지하고 있다가, 이벤트가 발생했을 때 `$event` 이벤트에 담긴 데이터를 받아서 처리하면 됩니다.

<!--
Consider an `ItemDetailComponent` that presents item information and responds to user actions.
Although the `ItemDetailComponent` has a delete button, it doesn't know how to delete the hero. It can only raise an event reporting the user's delete request.

Here are the pertinent excerpts from that `ItemDetailComponent`:
-->
`ItemDetailComponent` 는 아이템을 화면에 표시하면서 사용자의 동작에도 반응해야 한다고 합시다.
그런데 이 컴포넌트에 삭제 버튼이 있다고 해도 이 컴포넌트는 히어로를 어떻게 삭제하는지 알지 못합니다.
이 동작을 구현하려면 사용자가 삭제 요청을 했을 때 이벤트를 발생시키고, 부모 컴포넌트에서 이 이벤트를 받아 처리하는 방법이 가장 좋습니다.

`ItemDetailComponent` 코드에서 관련된 부분을 봅시다:


<code-example path="event-binding/src/app/item-detail/item-detail.component.html" header="src/app/item-detail/item-detail.component.html (template)" region="line-through"></code-example>

<code-example path="event-binding/src/app/item-detail/item-detail.component.ts" header="src/app/item-detail/item-detail.component.ts (deleteRequest)" region="deleteRequest"></code-example>

<!--
The component defines a `deleteRequest` property that returns an `EventEmitter`.
When the user clicks *delete*, the component invokes the `delete()` method,
telling the `EventEmitter` to emit an `Item` object.

Now imagine a hosting parent component that binds to the `deleteRequest` event
of the `ItemDetailComponent`.
-->
컴포넌트에는 `EventEmitter`를 반환하는 `deleteRequest` 프로퍼티가 존재합니다.
사용자가 *삭제* 버튼을 클릭하면 `delete()` 메소드를 실행하고,
이 함수에서는 컴포넌트에 `EventEmitter` 타입으로 선언한 `deleteRequest` 프로퍼티에 `Item` 객체를 담아 컴포넌트 외부로 보냅니다.

그러면 부모 컴포넌트에서 이 이벤트를 받기 위해 `deleteRequest` 프로퍼티를 바인딩하고 있어야 합니다.

<code-example path="event-binding/src/app/app.component.html" header="src/app/app.component.html (event-binding-to-component)" region="event-binding-to-component"></code-example>

<!--
When the `deleteRequest` event fires, Angular calls the parent component's
`deleteItem()` method, passing the *item-to-delete* (emitted by `ItemDetail`)
in the `$event` variable.
-->
최종적으로 `deleteRequest` 이벤트가 발생하면 Angular는 부모 컴포넌트의 `deleteItem()` 메소드를 실행하면서
(`ItemDetail`에서 보낸) *삭제해야 할 아이템*에 대한 정보를 `$event` 변수에 담아 전달합니다.

<!--
### Template statements have side effects
-->
### 템플릿 실행문의 영향

<!--
Though [template expressions](guide/template-syntax#template-expressions) shouldn't have [side effects](guide/template-syntax#avoid-side-effects), template
statements usually do. The `deleteItem()` method does have
a side effect: it deletes an item.

Deleting an item updates the model, and depending on your code, triggers
other changes including queries and saving to a remote server.
These changes propagate through the system and ultimately display in this and other views.
-->
[템플릿 표현식](guide/template-syntax#template-expressions)은 실행되더라도 [사이드 이펙트](guide/template-syntax#avoid-side-effects)가 없지만, 템플릿 실행문은 사이드 이펙트를 유발할 수 있습니다. 예를 들어 `deleteItem()` 메소드를 실행하면 목록에서 항목이 하나 제거되는 것도 사이드 이펙트로 볼 수 있습니다.

예제 코드로 보면, 아이템을 삭제하면 모델이 업데이트 되면서 서버에 새로운 목록을 요청하거나 삭제 요청을 보내는 등 다른 동작을 유발할 수 있습니다.
이런 동작들은 뷰 데이터를 갱신하고 서버에 반영하면서 시스템을 자연스럽게 유지합니다.

<hr/>

<!--
{@a two-way}
-->
{@a 양방향-바인딩}

<<<<<<< HEAD
<!--
## Two-way binding ( <span class="syntax">[(...)]</span> )
-->
## 양방향 바인딩 ( <span class="syntax">[(...)]</span> )

<!--
You often want to both display a data property and update that property when the user makes changes.
-->
어떤 데이터는 화면에 표시되기도 하지만 사용자의 동작에 따라 새로운 값으로 갱신되어야 하는 경우도 있습니다.

<!--
On the element side that takes a combination of setting a specific element property
and listening for an element change event.
-->
이 동작은 지금까지 살펴본 두 종류의 단방향 바인딩, 컴포넌트 프로퍼티 값을 템플릿에 반영하거나 템플릿에서 발생한 이벤트를 컴포넌트로 바인딩하는 방법을 조합해서 구현할 수 있습니다.

<!--
Angular offers a special _two-way data binding_ syntax for this purpose, **`[(x)]`**.
The `[(x)]` syntax combines the brackets
of _property binding_, `[x]`, with the parentheses of _event binding_, `(x)`.
-->
이렇게 구현하는 바인딩을 양방향 바인딩이라고 하며, 
양방향 바인딩은 _프로퍼티 바인딩_ 문법인 `[x]`과 _이벤트 바인딩_ 문법인 `(x)`를 조합해서 **`[(x)]`**와 같이 구현합니다.
=======
## Two-way binding `[(...)]`

Two-way binding gives your app a way to share data between a component class and
its template.

For a demonstration of the syntax and code snippets in this section, see the <live-example name="two-way-binding">two-way binding example</live-example>.

### Basics of two-way binding

Two-way binding does two things:

1. Sets a specific element property.
1. Listens for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, `[()]`.
The `[()]` syntax combines the brackets
of property binding, `[]`, with the parentheses of event binding, `()`.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<div class="callout is-important">

<header>
<!--
  [( )] = banana in a box
-->
  [( )] = 상자 안에 든 바나나
</header>

<!--
Visualize a *banana in a box* to remember that the parentheses go _inside_ the brackets.
-->
두 괄호 중 어떤 괄호가 안에 들어가는지 헷갈린다면 *상자 안에 든 바나나* 의 모양을 떠올려 보세요.

</div>

<<<<<<< HEAD
<!--
The `[(x)]` syntax is easy to demonstrate when the element has a settable property called `x`
and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits the pattern.
=======
The `[()]` syntax is easy to demonstrate when the element has a settable
property called `x` and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits this pattern.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
It has a `size` value property and a companion `sizeChange` event:
-->
`[(x)]` 라고 사용하면 컴포넌트에서 이름이 `x`인 프로퍼티가 프로퍼티 바인딩 되면서, 이벤트 이름이 `xChange`인 이벤트가 함께 이벤트 바인딩 됩니다.
`SizerComponent` 예제를 보면서 이 내용을 확인해봅시다.
이 컴포넌트에는 `size` 프로퍼티와 `sizeChange` 이벤트가 선언되어 있습니다.

<code-example path="two-way-binding/src/app/sizer/sizer.component.ts" header="src/app/sizer.component.ts"></code-example>

<code-example path="two-way-binding/src/app/sizer/sizer.component.html" header="src/app/sizer.component.html"></code-example>

<!--
The initial `size` is an input value from a property binding.
<<<<<<< HEAD
Clicking the buttons increases or decreases the `size`, within min/max values constraints,
and then raises (_emits_) the `sizeChange` event with the adjusted size.
-->
`size` 프로퍼티의 초기값은 프로퍼티 바인딩에 의해 할당됩니다.
그리고 사용자가 증가 버튼이나 감소 버튼을 클릭하면 `size` 값을 증가시키거나 감소시키고,
`sizeChange` 프로퍼티를 통해 커스텀 이벤트를 발생시킵니다.
=======
Clicking the buttons increases or decreases the `size`, within
min/max value constraints,
and then raises, or emits, the `sizeChange` event with the adjusted size.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:
-->
이 때 받은 커스텀 이벤트를 활용해서 `SizerComponent` 의 부모 컴포넌트인 `AppComponent`의 `fontSizePx` 프로퍼티를 양방향 바인딩으로 연결해 봅시다.

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-1)" region="two-way-1"></code-example>

<!--
The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.

<code-example path="two-way-binding/src/app/app.component.ts" header="src/app/app.component.ts" region="font-size"></code-example>

Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding,
making the displayed text bigger or smaller.
-->
`AppComponent`에서도 `fontSizePx` 프로퍼티의 초기값은 `SizerComponent.size` 값으로 초기화 됩니다.
그리고 증감 버튼을 누를때마다 `AppComponent.fontSizePx`값이 양방향 바인딩에 의해 갱신됩니다.
이렇게 갱신된 `AppComponent.fontSizePx` 값은 _스타일_ 바인딩으로 연결되면서, `Resizable Text`의 크기가 커지거나 작아집니다.

<!--
The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
<<<<<<< HEAD
Angular _desugars_ the `SizerComponent` binding into this:
-->
엄밀히 얘기하면, 양방향 바인딩 문법은 _프로퍼티_ 바인딩과 _이벤트_ 바인딩을 하나로 묶어둔 문법 설탕(syntatic sugar)일 뿐입니다.
프로퍼티 바인딩과 이벤트 바인딩을 각각 구현하려면 코드를 다음과 같이 작성합니다:
=======
Angular desugars the `SizerComponent` binding into this:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-2)" region="two-way-2"></code-example>

<!--
The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.
-->
`$event` 객체에는 `SizeComponent.sizeChange` 이벤트에서 보내는 폰트 크기값이 담겨 있습니다.
그래서 사용자가 증감 버튼을 클릭해서 이벤트가 발생할 때마다 `AppComponent.fontSizePx` 프로퍼티의 값을 새로운 값으로 할당하고 있습니다.

<<<<<<< HEAD
<!--
Clearly the two-way binding syntax is a great convenience compared to separate property and event bindings.
-->
이렇게 보면 프로퍼티 바인딩과 이벤트 바인딩을 각각 구현하는 것보다 양방향 바인딩 문법을 사용하는 것이 훨씬 간단합니다.

<!--
It would be convenient to use two-way binding with HTML form elements like `<input>` and `<select>`.
However, no native HTML element follows the `x` value and `xChange` event pattern.
-->
그리고 양방향 바인딩을 `<input>` 엘리먼트나 `<select>` 엘리먼트와 같은 HTML 폼 엘리먼트에 사용한다면 양방향 문법의 편리함을 확실하게 느낄 수 있습니다.
하지만 네이티브 HTML 엘리먼트에 `x` 프로퍼티나 `xChange` 라는 이벤트가 있지는 않습니다.

<!--
Fortunately, the Angular [_NgModel_](guide/template-syntax#ngModel) directive is a bridge that enables two-way binding to form elements.
-->
다행히 Angular는 폼 엘리먼트에 양방향 바인딩을 간편하게 연결할 수 있도록 [_NgModel_](guide/template-syntax#ngModel) 디렉티브를 제공합니다.
=======
### Two-way binding in forms

The two-way binding syntax is a great convenience compared to
separate property and event bindings. It would be convenient to
use two-way binding with HTML form elements like `<input>` and
`<select>`. However, no native HTML element follows the `x`
value and `xChange` event pattern.

For more on how to use two-way binding in forms, see
Angular [NgModel](guide/template-syntax#ngModel).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<hr/>

<!--
{@a directives}
-->
{@a 디렉티브}

<!--
## Built-in directives
-->
## 기본 디렉티브

<<<<<<< HEAD
<!--
Earlier versions of Angular included over seventy built-in directives.
The community contributed many more, and countless private directives
have been created for internal applications.
-->
Angular 1.x 버전이었던 AngularJS에는 프레임워크가 제공하는 디렉티브가 70개 이상 있었습니다.
이것은 Angular 커뮤니티에서 너무 큰 의욕을 가지고 개발에 참여한 결과이며, 내부용으로만 쓰이던 디렉티브도 자꾸만 늘어나고 있었습니다.

<!--
You don't need many of those directives in Angular.
You can often achieve the same results with the more capable and expressive Angular binding system.
Why create a directive to handle a click when you can write a simple binding such as this?
-->
이제 Angular에 이렇게 많은 디렉티브는 필요없습니다.
AngularJS에서 디렉티브로 해야 했던 많은 작업들은 이제 바인딩 시스템으로 더 간단하고 우아하게 구현할 수 있습니다.
클릭 이벤트를 처리하는 경우만 생각해봐도, 이벤트 바인딩이 이렇게 간단한데 클릭 이벤트를 처리하는 디렉티브를 굳이 만들 필요는 없겠죠?

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-1" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
You still benefit from directives that simplify complex tasks.
Angular still ships with built-in directives; just not as many.
You'll write your own directives, just not as many.
-->
하지만 복잡한 로직을 간단하게 표현하는 디렉티브의 역할은 아직 유효합니다.
그리고 이전보다 줄었지만 Angular가 제공하는 기본 디렉티브도 아직 있습니다.
필요하면 얼마든지 디렉티브를 만들어서 활용할 수 있습니다.

<!--
This segment reviews some of the most frequently used built-in directives,
classified as either [_attribute_ directives](guide/template-syntax#attribute-directives) or [_structural_ directives](guide/template-syntax#structural-directives).
-->
이번에는 기본 디렉티브 중에서 가장 많이 쓰이는 디렉티브인 [_어트리뷰트_ 디렉티브](guide/template-syntax#어트리뷰트-디렉티브)와 [_구조 디렉티브_](guide/template-syntax#구조-디렉티브)에 대해 알아보겠습니다.
=======
Angular offers two kinds of built-in directives: attribute
directives and structural directives. This segment reviews some of the most common built-in directives,
classified as either [_attribute_ directives](guide/template-syntax#attribute-directives) or [_structural_ directives](guide/template-syntax#structural-directives) and has its own <live-example name="built-in-directives">built-in directives example</live-example>.

For more detail, including how to build your own custom directives, see [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<hr/>

<!--
{@a attribute-directives}
-->
{@a 어트리뷰트-디렉티브}

<<<<<<< HEAD
<!--
## Built-in _attribute_ directives
-->
## 기본 _어트리뷰트_ 디렉티브
=======
### Built-in attribute directives
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Attribute directives listen to and modify the behavior of
other HTML elements, attributes, properties, and components.
<<<<<<< HEAD
They are usually applied to elements as if they were HTML attributes, hence the name.
-->
어트리뷰트 디렉티브는 HTML 엘리먼트나 어트리뷰트, 프로퍼티, 컴포넌트의 동작을 조작합니다.
같은 이름의 어트리뷰트가 있으면 어트리뷰트 디렉티브의 우선순위가 더 높습니다.

<!--
Many details are covered in the [_Attribute Directives_](guide/attribute-directives) guide.
Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation")
and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
This section is an introduction to the most commonly used attribute directives:
-->
어트리뷰트 디렉티브는 별도의 [_어트리뷰트 디렉티브_](guide/attribute-directives) 가이드 문서에서 자세하게 다룹니다.
그리고 [`RouterModule`](guide/router "Routing and Navigation")이나 [`FormsModule`](guide/forms "Forms")같은 모듈은 해당 모듈에 필요한 어트리뷰트 디렉티브를 따로 정의해두기도 합니다.
다음과 같은 어트리뷰트 디렉티브는 개발하면서 자주 사용하게 될 것입니다:

<!--
* [`NgClass`](guide/template-syntax#ngClass) - add and remove a set of CSS classes
* [`NgStyle`](guide/template-syntax#ngStyle) - add and remove a set of HTML styles
* [`NgModel`](guide/template-syntax#ngModel) - two-way data binding to an HTML form element
-->
* [`NgClass`](guide/template-syntax#ngClass) - CSS 클래스를 추가하거나 제거합니다.
* [`NgStyle`](guide/template-syntax#ngStyle) - HTML 스타일을 추가하거나 제거합니다.
* [`NgModel`](guide/template-syntax#ngModel) - HTML 폼 엘리먼트에 양방향 바인딩을 연결합니다.
=======
You usually apply them to elements as if they were HTML attributes, hence the name.

Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation")
and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
The most common attribute directives are as follows:

* [`NgClass`](guide/template-syntax#ngClass)&mdash;adds and removes a set of CSS classes.
* [`NgStyle`](guide/template-syntax#ngStyle)&mdash;adds and removes a set of HTML styles.
* [`NgModel`](guide/template-syntax#ngModel)&mdash;adds two-way data binding to an HTML form element.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<hr/>

{@a ngClass}

### `NgClass`

<<<<<<< HEAD
<!--
You typically control how elements appear
by adding and removing CSS classes dynamically.
You can bind to the `ngClass` to add or remove several classes simultaneously.
-->
엘리먼트가 화면에 표시되는 형식을 지정할 때는 보통 CSS 클래스를 사용하는데,
이 때 `ngClass`를 사용하면 여러 개의 클래스를 조건에 따라 각각 지정하거나 해제할 수 있습니다.

<!--
A [class binding](guide/template-syntax#class-binding) is a good way to add or remove a *single* class.
-->
클래스 *하나만* 조작한다면 [클래스 바인딩](guide/template-syntax#클래스-바인딩)을 사용하는 것도 나쁘지 않습니다.
=======
Add or remove several CSS classes simultaneously with `ngClass`.

<code-example path="built-in-directives/src/app/app.component.html" region="special-div" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
To add or remove *many* CSS classes at the same time, the `NgClass` directive may be the better choice.
-->
하지만 클래스 *여러 개를 동시에* 조작한다면 클래스 바인딩을 사용하는 것보다 `NgClass` 디렉티브를 사용하는 것이 더 좋습니다.

<!--
Try binding `ngClass` to a key:value control object.
Each key of the object is a CSS class name; its value is `true` if the class should be added,
`false` if it should be removed.
-->
`ngClass`에는 `키:값` 형식의 객체를 바인딩합니다.
이 때 각각의 키에 CSS 클래스 이름을 지정하며, 키 값이 `true`면 해당 클래스가 지정되고 키 값이 `false`면 해당 클래스가 해제됩니다.

<!--
Consider a `setCurrentClasses` component method that sets a component property,
`currentClasses` with an object that adds or removes three classes based on the
`true`/`false` state of three other component properties:
-->
지정해야 하는 클래스가 여러 개라면 컴포넌트 프로퍼티를 따로 선언하고, 이 프로퍼티 값을 메소드로 지정하는 방법도 고려해볼만 합니다.
아래 예제에서는 다른 프로퍼티 값에 따라 3개의 클래스를 각각 제어하기 위해 `currentClasses` 프로퍼티 값을 지정하는 `setCurrentClasses` 메소드를 정의했습니다.
=======
To add or remove a *single* class, use [class binding](guide/template-syntax#class-binding) rather than `NgClass`.

</div>

Consider a `setCurrentClasses()` component method that sets a component property,
`currentClasses`, with an object that adds or removes three classes based on the
`true`/`false` state of three other component properties. Each key of the object is a CSS class name; its value is `true` if the class should be added,
`false` if it should be removed.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.ts" region="setClasses" header="src/app/app.component.ts"></code-example>

<!--
Adding an `ngClass` property binding to `currentClasses` sets the element's classes accordingly:
-->
그리고 `currentClasses`를 `ngClass` 디렉티브에 바인딩하려면 다음과 같이 구현합니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgClass-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
It's up to you to call `setCurrentClasses()`, both initially and when the dependent properties change.
-->
`setCurrentClasses()` 함수는 컴포넌트가 초기화될 때 실행되고, 연결된 컴포넌트 프로퍼티의 값이 변경될 때마다 실행됩니다.
=======
Remember that in this situation you'd call `setCurrentClasses()`,
both initially and when the dependent properties change.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>

<hr/>

{@a ngStyle}

### `NgStyle`

<<<<<<< HEAD
<!--
You can set inline styles dynamically, based on the state of the component.
With `NgStyle` you can set many inline styles simultaneously.
-->
`NgStyle` 디렉티브를 사용하면 여러 개의 인라인 스타일을 각각 조건에 맞게 동적으로 지정할 수 있습니다.

<!--
A [style binding](guide/template-syntax#style-binding) is an easy way to set a *single* style value.
-->
이 때 지정해야 하는 스타일이 *하나*라면 [스타일 바인딩](guide/template-syntax#스타일-바인딩)을 사용하는 것이 간단할 수 있습니다.
=======
Use `NgStyle` to set many inline styles simultaneously and dynamically, based on the state of the component.

#### Without `NgStyle`
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

For context, consider setting a *single* style value with [style binding](guide/template-syntax#style-binding), without `NgStyle`.

<<<<<<< HEAD
<!--
To set *many* inline styles at the same time, the `NgStyle` directive may be the better choice.
-->
하지만 *여러 개*의 인라인 스타일을 한 번에 지정하려면 `NgStyle` 디렉티브를 사용하는 것이 더 좋습니다.

<!--
Try binding `ngStyle` to a key:value control object.
Each key of the object is a style name; its value is whatever is appropriate for that style.
-->
`ngStyle`에는 `키:값` 형식의 객체를 바인딩합니다.
이 때 각각의 키에 스타일 이름을 지정하며, 해당 스타일은 키 값으로 지정됩니다.

<!--
Consider a `setCurrentStyles` component method that sets a component property, `currentStyles`
with an object that defines three styles, based on the state of three other component properties:
-->
지정해야 하는 스타일이 여러 개라면 컴포넌트 프로퍼티를 따로 선언하고, 이 프로퍼티 값을 메소드로 지정하는 것도 고려해볼만 합니다.
아래 예제에서는 다른 프로퍼티 값에 따라 3개의 스타일을 각각 제어하기 위해 `currentStyles` 프로퍼티 값을 지정하는 `setCurrentStyles` 메소드를 정의했습니다.
=======
<code-example path="built-in-directives/src/app/app.component.html" region="without-ng-style" header="src/app/app.component.html"></code-example>

However, to set *many* inline styles at the same time, use the `NgStyle` directive.

The following is a `setCurrentStyles()` method that sets a component
property, `currentStyles`, with an object that defines three styles,
based on the state of three other component properties:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.ts" region="setStyles" header="src/app/app.component.ts"></code-example>

<!--
Adding an `ngStyle` property binding to `currentStyles` sets the element's styles accordingly:
-->
그리고 `currentStyles`를 `ngStyle` 디렉티브에 바인딩하려면 다음과 같이 구현합니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgStyle-2" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
It's up to you to call `setCurrentStyles()`, both initially and when the dependent properties change.
-->
`setCurrentStyles()` 함수는 컴포넌트가 초기화될 때 실행되고, 연결된 컴포넌트 프로퍼티의 값이 변경될 때마다 실행됩니다.
=======
Remember to call `setCurrentStyles()`, both initially and when the dependent properties change.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>


<hr/>

{@a ngModel}

<<<<<<< HEAD
<!--
### NgModel - Two-way binding to form elements with <span class="syntax">[(ngModel)]</span>
-->
### NgModel - 양방향 바인딩 디렉티브 <span class="syntax">[(ngModel)]</span>

<!--
When developing data entry forms, you often both display a data property and
update that property when the user makes changes.
-->
폼을 사용해서 데이터를 입력받을 때, 폼에 있는 데이터를 뷰에 표시한 후에는 뷰에서 사용자가 변경하는 값을 다시 폼 데이터에 반영해야 하는 경우가 있습니다.

<!--
Two-way data binding with the `NgModel` directive makes that easy. Here's an example:
-->
이 때 `NgModel` 디렉티브를 사용하면 양방향 바인딩을 간단하게 구현할 수 있습니다. `NgModel` 디렉티브는 다음과 같이 사용합니다:
=======
### `[(ngModel)]`: Two-way binding

The `NgModel` directive allows you to display a data property and
update that property when the user makes changes. Here's an example:

<code-example path="built-in-directives/src/app/app.component.html" header="src/app/app.component.html (NgModel example)" region="NgModel-1"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
#### _FormsModule_ is required to use _ngModel_
-->
#### _ngModel_ 을 사용하려면 _FormsModule_ 이 필요합니다.
=======
#### Import `FormsModule` to use `ngModel`
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Before using the `ngModel` directive in a two-way data binding,
you must import the `FormsModule` and add it to the NgModule's `imports` list.
<<<<<<< HEAD
Learn more about the `FormsModule` and `ngModel` in the
[Forms](guide/forms#ngModel) guide.
-->
`ngModel` 디렉티브로 양방향 바인딩을 구현하려면 NgModule의 `imports` 목록에 `FormsModule`을 추가해야 합니다.
`FormsModule`과 `ngModel`에 대한 자세한 설명은 [Forms](guide/forms#ngModel) 문서를 참고하세요.

<!--
Here's how to import the `FormsModule` to make `[(ngModel)]` available.
-->
NgModule에 `FormsModule` 을 다음과 같이 추가합니다.

<code-example path="template-syntax/src/app/app.module.1.ts" linenums="false" header="src/app/app.module.ts (FormsModule import)">
</code-example>

<!--
#### Inside <span class="syntax">[(ngModel)]</span>
-->
#### <span class="syntax">[(ngModel)]</span> 동작 원리

<!--
Looking back at the `name` binding, note that
you could have achieved the same result with separate bindings to
the `<input>` element's  `value` property and `input` event.
-->
`<input>` 엘리먼트에 `name` 프로퍼티를 양방향 바인딩 한 것을 `value` 프로퍼티 바인딩과 `input` 이벤트 바인딩으로 나눠서 구현하면
다음과 같이 구현할 수 있습니다.
=======
Learn more about the `FormsModule` and `ngModel` in [Forms](guide/forms#ngModel).

Remember to import the `FormsModule` to make `[(ngModel)]` available as follows:

<code-example path="built-in-directives/src/app/app.module.ts" header="src/app/app.module.ts (FormsModule import)" region="import-forms-module"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
That's cumbersome. Who can remember which element property to set and which element event emits user changes?
How do you extract the currently displayed text from the input box so you can update the data property?
Who wants to look that up each time?
-->
하지만 이런 구현방식은 비효율적입니다. 지정해야 할 프로퍼티 이름과 바인딩 해야 할 이벤트 이름을 계속 기억할 수 있을까요?
그리고 사용자가 입력한 값이 바뀔 때마다 연결된 프로퍼티를 찾아서 새로운 값으로 갱신하는 로직을 직접 작성해야 합니다.
입력 필드마다 이런 작업을 할 필요가 있을까요?

<!--
That `ngModel` directive hides these onerous details behind its own  `ngModel` input and `ngModelChange` output properties.
-->
`ngModel` 디렉티브를 사용하면 같은 로직을 `ngModel` 프로퍼티와 `ngModelChange` 이벤트로 간단하게 연결할 수 있습니다.
=======
You could achieve the same result with separate bindings to
the `<input>` element's  `value` property and `input` event:

<code-example path="built-in-directives/src/app/app.component.html" region="without-NgModel" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

To streamline the syntax, the `ngModel` directive hides the details behind its own `ngModel` input and `ngModelChange` output properties:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModelChange" header="src/app/app.component.html"></code-example>

<!--
The `ngModel` data property sets the element's value property and the `ngModelChange` event property
listens for changes to the element's value.
-->
`ngModel` 프로퍼티는 엘리먼트의 프로퍼티 값을 지정하고 `ngModelChange` 이벤트 프로퍼티는 엘리먼트 값이 변경되는 것을 감지합니다.

<<<<<<< HEAD
<!--
=======
#### `NgModel` and value accessors

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
The details are specific to each kind of element and therefore the `NgModel` directive only works for an element
supported by a [ControlValueAccessor](api/forms/ControlValueAccessor)
that adapts an element to this protocol.
Angular provides *value accessors* for all of the basic HTML form elements and the
<<<<<<< HEAD
[_Forms_](guide/forms) guide shows how to bind to them.
-->
`<input>` 엘리먼트가 아닌 경우에도 `NgModel` 디렉티브는 [ControlValueAccessor](api/forms/ControlValueAccessor)를 정의하고 있기 때문에 어떤 폼 엘리먼트에서도 같은 효과를 확인할 수 있습니다.
`<input>` 도 이렇게 정의되어 있는 ControlValueAccessor 중 하나를 활용합니다.
Angular는 모든 HTML 폼 엘리먼트에 대해 *값을 참조할 수 있는 중개자*를 제공하며, 더 자세한 내용은 [_Forms_](guide/forms) 문서를 참고하세요.

<!--
You can't apply `[(ngModel)]` to a non-form native element or a third-party custom component
until you write a suitable *value accessor*,
a technique that is beyond the scope of this guide.
-->
HTML 기본 폼 엘리먼트가 아니거나 서드 파티에서 불러온 커스텀 컴포넌트에는 `[(ngModel)]`을 사용할 수 없습니다.
이것은 Angular에서 제공하는 폼 중개자가 없기 때문이며, 이 문서에서 설명하는 범위를 넘어서는 문제입니다.

<!--
You don't need a _value accessor_ for an Angular component that you write because you
can name the value and event properties
to suit Angular's basic [two-way binding syntax](guide/template-syntax#two-way) and skip `NgModel` altogether.
The [`sizer` shown above](guide/template-syntax#two-way) is an example of this technique.
-->
직접 Angular 컴포넌트를 만들어서 사용하는 경우라면 *값을 참조하는 중개자*를 따로 준비할 필요가 없습니다.
왜냐하면 컴포넌트를 정의할 때 Angular의 [양방향 바인딩 문법](guide/template-syntax#양방향-바인딩)에 맞게 프로퍼티 이름과 이벤트 이름을 지정해야 하기 때문입니다.
이전에 살펴본 [`sizer` 예제](guide/template-syntax#양방향-바인딩)를 다시 한 번 확인해 보세요.

</div>

<!--
Separate `ngModel` bindings is an improvement over binding to the element's native properties. You can do better.
-->
하지만 `ngModel`과 `ngModelChange`로 구현하는 양방향 바인딩이 최선의 방법은 아닙니다.
더 간단한 문법을 사용할 수 있습니다.

<!--
You shouldn't have to mention the data property twice. Angular should be able to capture
the component's data property and set it
with a single declaration, which it can with the `[(ngModel)]` syntax:
-->
데이터 프로퍼티를 두 번이나 참조할 필요는 없습니다. `[(ngModel)]` 문법을 다음과 같이 사용하면 컴포넌트의 데이터 프로퍼티를 아주 간단하게 양방향 바인딩할 수 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="NgModel-1" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
Is `[(ngModel)]` all you need? Is there ever a reason to fall back to its expanded form?
-->
이것으로 끝난 걸까요? 폼을 처리하는 로직이 더 복잡하면 어떻게 해야 할까요?

<!--
The `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more or something different, you can write the expanded form.
-->
`[(ngModel)]` 문법은 데이터 프로퍼티의 값을 *갱신*하기만 합니다.
데이터 프로퍼티 값을 갱신하고 다른 작업이 더 필요하다면, 두 종류 바인딩으로 나눠서 구현해야 합니다.

<!--
The following contrived example forces the input value to uppercase:
-->
예를 들어 입력 필드에 있는 값을 대문자로 바꿔서 사용해야 한다면 다음과 같이 구현하면 됩니다:
=======
[Forms](guide/forms) guide shows how to bind to them.

You can't apply `[(ngModel)]` to a non-form native element or a
third-party custom component until you write a suitable value accessor. For more information, see
the API documentation on [DefaultValueAccessor](https://angular.io/api/forms/DefaultValueAccessor).

You don't need a value accessor for an Angular component that
you write because you can name the value and event properties
to suit Angular's basic [two-way binding syntax](guide/template-syntax#two-way)
and skip `NgModel` altogether.
The `sizer` in the
[Two-way Binding](guide/template-syntax#two-way) section is an example of this technique.

Separate `ngModel` bindings are an improvement over binding to the
element's native properties, but you can streamline the binding with a
single declaration using the `[(ngModel)]` syntax:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModel-1" header="src/app/app.component.html"></code-example>

This `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more, you can write the expanded form;
for example, the following changes the `<input>` value to uppercase:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.html" region="uppercase" header="src/app/app.component.html"></code-example>

<!--
Here are all variations in action, including the uppercase version:
-->
`ngModel` 디렉티브는 다음과 같이 다양한 문법으로 사용할 수 있습니다.

<div class="lightbox">
  <img src='generated/images/guide/built-in-directives/ng-model-anim.gif' alt="NgModel variations">
</div>

<hr/>

<!--
{@a structural-directives}
-->
{@a 구조-디렉티브}

<!--
## Built-in _structural_ directives
-->
## 기본 _구조_ 디렉티브

<!--
Structural directives are responsible for HTML layout.
They shape or reshape the DOM's structure, typically by adding, removing, and manipulating
the host elements to which they are attached.
-->
구조 디렉티브는 DOM 엘리먼트의 모양을 바꾸거나, DOM 트리에서 DOM 엘리먼트를 추가하거나 제거하는 등 HTML 레이아웃을 조작합니다.

<<<<<<< HEAD
<!--
The deep details of structural directives are covered in the
[_Structural Directives_](guide/structural-directives) guide
where you'll learn:
-->
구조 디렉티브에 대한 자세한 설명은 [_구조 디렉티브_](guide/structural-directives) 문서에서 다루며,
이런 내용을 다룹니다:

<!--
* why you
[_prefix the directive name with an asterisk_ (\*)](guide/structural-directives#asterisk "The * in *ngIf").
* to use [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* how to write your own structural directive.
* that you can only apply [one structural directive](guide/structural-directives#one-per-element "one per host element") to an element.
-->
* [_왜 디렉티브 이름 앞에 (\*)가 붙는지_](guide/structural-directives#asterisk "The * in *ngIf")
* 엘리먼트를 그룹으로 묶는 [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>") 사용하기
* 커스텀 구조 디렉티브 정의하기
* 한 엘리먼트에는 [하나의 구조 디렉티브만](guide/structural-directives#one-per-element "one per host element") 사용할 수 있다는 것

<!--
_This_ section is an introduction to the common structural directives:
-->
그리고 _이 문서_ 에서는 구조 디렉티브 중에 가장 많이 사용하는 다음 디렉티브들에 대해 알아봅니다.

<!--
* [`NgIf`](guide/template-syntax#ngIf) - conditionally add or remove an element from the DOM
* [`NgSwitch`](guide/template-syntax#ngSwitch) - a set of directives that switch among alternative views
* [NgForOf](guide/template-syntax#ngFor) - repeat a template for each item in a list
-->
* [`NgIf`](guide/template-syntax#ngIf) - 조건에 따라 DOM을 추가하거나 제거합니다.
* [`NgSwitch`](guide/template-syntax#ngSwitch) - 조건에 따라 여러 뷰 중 하나를 선택합니다.
* [NgForOf](guide/template-syntax#ngFor) - 배열의 각 항목마다 템플릿을 반복합니다.
=======
This section is an introduction to the common built-in structural directives:

* [`NgIf`](guide/template-syntax#ngIf)&mdash;conditionally creates or destroys subviews from the template.
* [`NgFor`](guide/template-syntax#ngFor)&mdash;repeat a node for each item in a list.
* [`NgSwitch`](guide/template-syntax#ngSwitch)&mdash;a set of directives that switch among alternative views.

<div class="alert is-helpful">

The deep details of structural directives are covered in the
[Structural Directives](guide/structural-directives) guide,
which explains the following:

* Why you
[prefix the directive name with an asterisk (\*)](guide/structural-directives#the-asterisk--prefix).
* Using [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* How to write your own structural directive.
* That you can only apply [one structural directive](guide/structural-directives#one-per-element "one per host element") to an element.

</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<hr/>

{@a ngIf}

### NgIf

<!--
You can add or remove an element from the DOM by applying an `NgIf` directive to
a host element.
Bind the directive to a condition expression like `isActive` in this example.
-->
`NgIf` 디렉티브를 사용하면 조건에 따라 원하는 위치(_호스트 엘리먼트_)에 엘리먼트를 추가하거나 제거할 수 있습니다.
다음 예제에서 보면 `isActive`값에 따라 디렉티브가 뷰에 추가되거나 제거됩니다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
Don't forget the asterisk (`*`) in front of `ngIf`.
-->
`ngIf` 앞에 별표(`*`)를 꼭 붙여야 합니다.

</div>

<!--
When the `isActive` expression returns a truthy value, `NgIf` adds the `HeroDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `HeroDetailComponent`
=======
Don't forget the asterisk (`*`) in front of `ngIf`. For more information
on the asterisk, see the [asterisk (*) prefix](guide/structural-directives#the-asterisk--prefix) section of
[Structural Directives](guide/structural-directives).

</div>

When the `isActive` expression returns a truthy value, `NgIf` adds the
`ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent`
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
from the DOM, destroying that component and all of its sub-components.
-->
이 코드에서는 `isActive` 표현식의 값이 참으로 평가되면 `NgIf` 디렉티브가 `HeroDetailComponent`를 DOM에 추가합니다.
그리고 표현식의 값이 거짓으로 평가되면 이 컴포넌트를 DOM에서 제거합니다. 이 때 이 컴포넌트와 이 컴포넌트의 하위 컴포넌트는 모두 종료됩니다.

<<<<<<< HEAD
<!--
#### Show/hide is not the same thing
-->
#### 보이게 하거나 숨기는 것과는 다릅니다.

<!--
You can control the visibility of an element with a
[class](guide/template-syntax#class-binding) or [style](guide/template-syntax#style-binding) binding:
-->
엘리먼트가 표시되는 것을 제어할 때는 다음과 같이 [클래스 바인딩](guide/template-syntax#클래스-바인딩)이나 [스타일 바인딩](guide/template-syntax#스타일-바인딩)을 사용해도 됩니다:
=======

#### Show/hide vs. `NgIf`
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Hiding an element is different from removing it with `NgIf`.
For comparison, the following example shows how to control
the visibility of an element with a
[class](guide/template-syntax#class-binding) or [style](guide/template-syntax#style-binding) binding.

<<<<<<< HEAD
<!--
Hiding an element is quite different from removing an element with `NgIf`.
-->
하지만 `NgIf` 디렉티브의 값이 거짓으로 평가되면 DOM에서 엘리먼트를 완전히 제거합니다.

<!--
When you hide an element, that element and all of its descendents remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance,
for something the user can't see.
-->
엘리먼트를 뷰에서 숨기는 방식은 엘리먼트와 하위 엘리먼트가 화면에 보이지 않더라도 여전히 DOM에 남아있습니다.
이 엘리먼트는 여전히 메모리에도 남아있으며, Angular에서 변화를 감지할 때도 이 엘리먼트가 검사 대상에 포함됩니다.
이로 인해 엘리먼트가 보이지 않는 상황에서도 불필요한 연산이 실행될 수 있으며, 성능면에서도 좋지 않습니다.

<!--
When `NgIf` is `false`, Angular removes the element and its descendents from the DOM.
It destroys their components, potentially freeing up substantial resources,
resulting in a more responsive user experience.
-->
하지만 `NgIf` 디렉티브의 값이 `false`로 평가되면 Angular는 그 엘리먼트와 하위 엘리먼트를 DOM에서 완전히 제거합니다.
엘리먼트에 해당하는 컴포넌트도 종료되며, 컴포넌트가 종료된 만큼 사용하던 리소스도 반환됩니다.
애플리케이션의 성능도 물론 좋아집니다.

<!--
The show/hide technique is fine for a few elements with few children.
You should be wary when hiding large component trees; `NgIf` may be the safer choice.
-->
DOM 구조가 단순하다면 엘리먼트를 보이게 하거나 감추는 것만으로도 충분할 수 있습니다.
하지만 DOM 구조가 좀 더 복잡해질 수록 `NgIf`를 사용하는 것이 더 안전합니다.
=======
<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-3" header="src/app/app.component.html"></code-example>

When you hide an element, that element and all of its descendants remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance
unnecessarily.

`NgIf` works differently. When `NgIf` is `false`, Angular removes the element and its descendants from the DOM.
It destroys their components, freeing up resources, which
results in a better user experience.

If you are hiding large component trees, consider `NgIf` as a more
efficient alternative to showing/hiding.

<div class="alert is-helpful">

For more information on `NgIf` and `ngIfElse`, see the [API documentation about NgIf](api/common/NgIf).

</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
#### Guard against null
-->
#### null 방지

<<<<<<< HEAD
<!--
The `ngIf` directive is often used to guard against null.
Show/hide is useless as a guard.
Angular will throw an error if a nested expression tries to access a property of `null`.
-->
`ngIf` 디렉티브는 null 값을 방지하는 용도로도 사용합니다.
왜냐하면 엘리먼트를 숨기거나 표시하는 것만으로는 엘리먼트에 바인딩되는 값이 null일 때 대응할 수 없기 때문입니다.
`null` 객체가 바인딩 된 엘리먼트를 화면에서는 숨겨놨지만, 이 엘리먼트 안쪽의 템플릿 표현식에서 `null` 객체의 프로퍼티를 참조하려고 하면 Angular가 에러를 발생시킵니다.

<!--
Here we see `NgIf` guarding two `<div>`s.
The `currentHero` name will appear only when there is a `currentHero`.
The `nullHero` will never be displayed.
-->
그래서 `NgIf` 는 다음과 같이 `null` 값을 방지하는 용도로 사용할 수 있습니다.
이 코드에서 `currentHero` 가 바인딩 된 `<div>` 는 `currentHero` 객체가 존재할 때만 표시됩니다.
그리고 `nullHero` 가 바인딩 된 `<div>`는 절대 표시되지 않을 것입니다.
=======
Another advantage of `ngIf` is that you can use it to guard against null. Show/hide
is best suited for very simple use cases, so when you need a guard, opt instead for `ngIf`. Angular will throw an error if a nested expression tries to access a property of `null`.

The following shows `NgIf` guarding two `<div>`s.
The `currentCustomer` name appears only when there is a `currentCustomer`.
The `nullCustomer` will not be displayed as long as it is `null`.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2" header="src/app/app.component.html"></code-example>

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2b" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

<!--
See also the
<<<<<<< HEAD
[_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)")
described below.
-->
[_안전 참조 연산자_](guide/template-syntax#안전-참조-연산자 "Safe navigation operator (?.)") 에 대해서도 확인해 보세요.
=======
[safe navigation operator](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)") below.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>
<hr/>

{@a ngFor}
### `NgFor`

<<<<<<< HEAD
### NgForOf

<!--
`NgForOf` is a _repeater_ directive &mdash; a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed.
You tell Angular to use that block as a template for rendering each item in the list.
-->
`NgForOf`는 템플릿을 반복하는 디렉티브이며, 배열의 각 항목을 뷰에 표시할 때 주로 사용합니다.
이 디렉티브를 사용할 때는 배열의 한 항목을 뷰로 어떻게 표시할지 HTML 템플릿으로 먼저 정의합니다.
그러면 Angular가 템플릿을 반복할 때마다 배열의 항목이 하나씩 전달되면서 뷰를 표시합니다.

<!--
Here is an example of `NgForOf` applied to a simple `<div>`:
-->
`<div>` 엘리먼트에 간단하게 적용해보면 다음과 같이 사용할 수 있습니다:

<code-example path="template-syntax/src/app/app.component.html" region="NgFor-1" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
You can also apply an `NgForOf` to a component element, as in this example:
-->
그리고 `NgForOf` 디렉티브는 컴포넌트에도 직접 사용할 수 있습니다:

<code-example path="template-syntax/src/app/app.component.html" region="NgFor-2" header="src/app/app.component.html" linenums="false">
</code-example>
=======
`NgFor` is a repeater directive&mdash;a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed
and then you tell Angular to use that block as a template for rendering each item in the list.
The text assigned to `*ngFor` is the instruction that guides the repeater process.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

The following example shows `NgFor` applied to a simple `<div>`. (Don't forget the asterisk (`*`) in front of `ngFor`.)

<<<<<<< HEAD
<!--
Don't forget the asterisk (`*`) in front of `ngFor`.
-->
`*ngFor` 를 사용할 때 별표(\*)를 꼭 붙여야 합니다.
=======
<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

You can also apply an `NgFor` to a component element, as in the following example.

<<<<<<< HEAD
<!--
The text assigned to `*ngFor` is the instruction that guides the repeater process.
-->
`*ngFor`의 반복 과정은 `*ngFor` 디렉티브의 오른쪽에 할당하는 문자열로 지정합니다.

{@a microsyntax}

<!--
#### *ngFor* microsyntax
-->
#### *ngFor* 세부 문법

<!--
The string assigned to `*ngFor` is not a [template expression](guide/template-syntax#template-expressions).
It's a *microsyntax* &mdash; a little language of its own that Angular interprets.
The string `"let hero of heroes"` means:
-->
`*ngFor`에 할당하는 문자열은 [템플릿 표현식](guide/template-syntax#템플릿-표현식)과는 다릅니다.
이 문법은 *ngFor에만 적용되는 세부 문법* 이며, Angular에서 `ngFor` 디렉티브를 처리할 때만 사용됩니다.
`"let hero of heroes"` 이라는 문법은 다음과 같은 의미입니다:

<!--
> *Take each hero in the `heroes` array, store it in the local `hero` looping variable, and
=======
<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-2" header="src/app/app.component.html"></code-example>

{@a microsyntax}

<div class="callout is-critical">
<header>*ngFor microsyntax</header>

The string assigned to `*ngFor` is not a [template expression](guide/template-syntax#template-expressions). Rather,
it's a *microsyntax*&mdash;a little language of its own that Angular interprets.
The string `"let item of items"` means:

> *Take each item in the `items` array, store it in the local `item` looping variable, and
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
make it available to the templated HTML for each iteration.*
-->
> *`heroes` 배열에서 히어로를 하나씩 가져오고, 반복문 안에서만 유효한 지역 변수 `hero`에 할당합니다. 그러면 반복되는 템플릿 안에서 이 변수를 사용할 수 있습니다.*

<<<<<<< HEAD
<!--
Angular translates this instruction into a `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `hero`
in the list.
-->
Angular는 부모 엘리먼트 안에 `<ng-template>` 을 만들고, 배열의 항목마다 새로운 템플릿을 생성합니다.

<!--
Learn about the _microsyntax_ in the [_Structural Directives_](guide/structural-directives#microsyntax) guide.
-->
_ngFor 세부 문법_ 에 대한 자세한 설명은 [_구조 디렉티브_](guide/structural-directives#microsyntax) 가이드를 참고하세요.

=======
Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item`
in the list.
For more information about microsyntax, see the [Structural Directives](guide/structural-directives#microsyntax) guide.

</div>

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

{@a template-input-variable}

{@a 템플릿-입력-변수}

<<<<<<< HEAD
<!--
### Template input variables
-->
### 템플릿 입력 변수

<!--
The `let` keyword before `hero` creates a _template input variable_ called `hero`.
The `NgForOf` directive iterates over the `heroes` array returned by the parent component's `heroes` property
and sets `hero` to the current item from the array during each iteration.
-->
`hero` 안에 있는 `let` 키워드는 _템플릿 입력 변수_ `hero`를 만드는 키워드입니다.
그리고 `NgForOf` 디렉티브는 부모 컴포넌트의 `heroes` 배열의 각 항목을 반환하면서 이 문법을 반복하고, 각각의 반복마다 새로운 `hero` 아이템을 템플릿에 적용합니다.

<!--
You reference the `hero` input variable within the `NgForOf` host element
(and within its descendants) to access the hero's properties.
Here it is referenced first in an interpolation
and then passed in a binding to the `hero` property of the `<hero-detail>` component.
-->
`NgForOf` 반복문 안에서는 템플릿 입력변수 `hero`를 참조해서 객체 안에 있는 데이터에 접근할 수 있습니다.
아래 코드의 첫번째 반복문은 전달된 `hero` 객체에서 `name` 프로퍼티를 뷰에 표시하는 코드이며,
두 번째 반복문은 반복되는 `hero` 객체를 `<app-hero-detail>` 컴포넌트에 바인딩해서 표시하는 문법입니다.
=======
#### Template input variables

The `let` keyword before `item` creates a template input variable called `item`.
The `ngFor` directive iterates over the `items` array returned by the parent component's `items` property
and sets `item` to the current item from the array during each iteration.

Reference `item` within the `ngFor` host element
as well as within its descendants to access the item's properties.
The following example references `item` first in an interpolation
and then passes in a binding to the `item` property of the `<app-item-detail>` component.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1-2" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--Learn more about _template input variables_ in the
[_Structural Directives_](guide/structural-directives#template-input-variable) guide.
-->
_템플릿 입력 변수_ 에 대한 자세한 설명은 [_구조 디렉티브_](guide/structural-directives#템플릿-입력-변수) 가이드를 참고하세요.

<!--
#### *ngFor* with _index_
-->
#### _인덱스_ 와 함께 사용하기

<!--
The `index` property of the `NgForOf` directive context returns the zero-based index of the item in each iteration.
=======
For more information about template input variables, see
[Structural Directives](guide/structural-directives#template-input-variable).

#### `*ngFor` with `index`

The `index` property of the `NgFor` directive context
returns the zero-based index of the item in each iteration.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
You can capture the `index` in a template input variable and use it in the template.
-->
`NgForOf` 디렉티브에서 제공하는 `index` 프로퍼티는 반복문이 반복되는 횟수를 나타내는 인덱스입니다.
이 `index` 프로퍼티는 템플릿 입력 변수로 할당 받아 템플릿 안에서 사용할 수 있습니다.

<<<<<<< HEAD
<!--
The next example captures the `index` in a variable named `i` and displays it with the hero name like this.
-->
다음 코드는 `index` 프로퍼티를 변수 `i`로 할당하고 히어로의 이름과 함께 표시하는 예제입니다.
=======
The next example captures the `index` in a variable named `i` and displays it with the item name.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-3" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

<!--
`NgFor` is implemented by the `NgForOf` directive. Read more about the other `NgForOf` context values such as `last`, `even`,
and `odd` in the [NgForOf API reference](api/common/NgForOf).
-->
`NgFor`는 `NgForOf` 디렉티브로 만들어진 또 다른 디렉티브입니다. `NgForOf` 컨텍스트에서 제공되는 변수인 `last`나 `even`, `odd`에 대해 더 알아보려면 [NgForOf API 문서](api/common/NgForOf)를 참고하세요.

</div>

{@a trackBy}
#### *ngFor with `trackBy`

<<<<<<< HEAD
<!--
#### *ngFor with _trackBy_
-->
#### _trackBy_ 와 함께 사용하기

<!--
The `NgForOf` directive may perform poorly, especially with large lists.
A small change to one item, an item removed, or an item added can trigger a cascade of DOM manipulations.
-->
배열의 길이가 길수록 `NgForOf` 디렉티브의 성능이 나빠질 수 있습니다.
항목의 내용이 변하거나 목록에서 하나가 제거될 때, 목록에 아이템이 추가될 때마다 DOM을 조작하는 동작이 연쇄적으로 실행될 수도 있습니다.

<!--
For example, re-querying the server could reset the list with all new hero objects.
-->
서버에서 새로 리스트를 받아오면서 배열을 초기화하는 경우를 생각해 봅시다.

<!--
Most, if not all, are previously displayed heroes.
*You* know this because the `id` of each hero hasn't changed.
But Angular sees only a fresh list of new object references.
It has no choice but to tear down the old DOM elements and insert all new DOM elements.
-->
항상 그렇지는 않겠지만, 목록 전체가 새로운 데이터로 바뀌는 것은 아닙니다.
그리고 *개발자*는 각각의 영웅마다 고유한 값으로 할당되는 `id` 프로퍼티가 있다는 것을 알고 있습니다.
새로운 객체가 배열에 할당되면 Angular는 이것을 새로운 객체에 대한 참조로 인식하기 때문에 이전 DOM을 모두 제거하고 새로운 DOM으로 추가할 수 밖에 없습니다.
하지만 변경되지 않은 데이터가 있는데 DOM을 비우고 배열에 모든 항목에 대해 DOM을 다시 추가하는 것은 비효율적입니다.

<!--
Angular can avoid this churn with `trackBy`.
Add a method to the component that returns the value `NgForOf` _should_ track.
In this case, that value is the hero's `id`.
-->
이 때 Angular에서 제공하는 `trackBy`를 활용할 수 있습니다.
`trackBy`를 사용하려면 `NgForOf` 디렉티브가 기준으로 삼을 값을 반환하는 함수를 지정합니다.
위에서 설명한 것처럼, `hero` 객체에 있는 `id` 프로퍼티를 활용하려면 다음과 같이 작성합니다.
=======
If you use `NgFor` with large lists, a small change to one item, such as removing or adding an item, can trigger a cascade of DOM manipulations. For example, re-querying the server could reset a list with all new item objects, even when those items were previously displayed. In this case, Angular sees only a fresh list of new object references and has no choice but to replace the old DOM elements with all new DOM elements.

You can make this more efficient with `trackBy`.
Add a method to the component that returns the value `NgFor` should track.
In this case, that value is the hero's `id`. If the `id` has already been rendered,
Angular keeps track of it and doesn't re-query the server for the same `id`.

<code-example path="built-in-directives/src/app/app.component.ts" region="trackByItems" header="src/app/app.component.ts"></code-example>

In the microsyntax expression, set `trackBy` to the `trackByItems()` method.

<code-example path="built-in-directives/src/app/app.component.html" region="trackBy" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Here is an illustration of the `trackBy` effect.
"Reset items" creates new items with the same `item.id`s.
"Change ids" creates new items with new `item.id`s.

<<<<<<< HEAD
<!--
In the microsyntax expression, set `trackBy` to this method.
-->
그리고 세부 문법에 `trackBy`를 사용해서 이 함수를 지정합니다.
=======
* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<div class="lightbox">
  <img src="generated/images/guide/built-in-directives/ngfor-trackby.gif" alt="Animation of trackBy">
</div>

<<<<<<< HEAD
<!--
Here is an illustration of the _trackBy_ effect.
"Reset heroes" creates new heroes with the same `hero.id`s.
"Change ids" creates new heroes with new `hero.id`s.
-->
_trackBy_ 가 어떻게 동작하는지 다음 그림을 보면서 확인해 보세요.
"Reset heroes" 버튼은 히어로 목록을 초기화하면서 고정된 `id` 프로퍼티 값을 할당합니다.
그리고 "Change ids" 버튼은 히어로의 `id` 프로퍼티를 새로운 값으로 지정합니다.

<!--
* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement.
-->
* `trackBy`가 없는 경우에는 목록을 초기화하는 동작과 `id` 프로퍼티를 변경하는 값 모두 DOM 엘리먼트를 갱신합니다.
* `trackBy`가 있는 경우에는 `id` 프로퍼티가 변경되었을 때만 엘리먼트를 갱신합니다.
=======

<div class="alert is-helpful">
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Built-in directives use only public APIs; that is,
they do not have special access to any private APIs that other directives can't access.

</div>

<hr/>

{@a ngSwitch}
## The `NgSwitch` directives

<<<<<<< HEAD
<!--
### The _NgSwitch_ directives
-->
### _NgSwitch_ 디렉티브

<!--
*NgSwitch* is like the JavaScript `switch` statement.
It can display _one_ element from among several possible elements, based on a _switch condition_.
Angular puts only the *selected* element into the DOM.
-->
*NgSwitch* 디렉티브는 JavaScript의 `switch` 문법과 비슷합니다.
이 디렉티브는 가능한 경우 몇가지 중에서 _스위치 조건_ 에 만족하는 엘리먼트 _하나를_ 뷰에 표시합니다.
이 때 *선택된* 엘리먼트만 DOM에 추가되며, 조건을 만족하지 않는 엘리먼트들은 DOM에 존재하지 않습니다.

<!--
*NgSwitch* is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as seen in this example.
-->
실제로는 *NgSwitch* 디렉티브 하나만 사용하지는 않습니다.
스위칭 동작을 하려면 `NgSwitch`, `NgSwitchCase`, `NgSwitchDefault` 3개의 디렉티브를 함께 사용합니다.
예제 코드를 확인해 보세요.

<code-example path="template-syntax/src/app/app.component.html" region="NgSwitch" header="src/app/app.component.html" linenums="false">
</code-example>
=======
NgSwitch is like the JavaScript `switch` statement.
It displays one element from among several possible elements, based on a switch condition.
Angular puts only the selected element into the DOM.
<!-- API Flagged -->
`NgSwitch` is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as in the following example.

 <code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<div class="lightbox">
  <img src="generated/images/guide/built-in-directives/ngswitch.gif" alt="Animation of NgSwitch">
</div>

<<<<<<< HEAD
<!--
`NgSwitch` is the controller directive. Bind it to an expression that returns the *switch value*.
The `emotion` value in this example is a string, but the switch value can be of any type.
-->
`NgSwitch`는 해당하는 조건을 선택하는 디렉티브입니다. 이 디렉티브는 템플릿 표현식이 반환하는 값에 해당하는 *특정 조건*을 선택합니다.
위 예제에서는 문자열 타입의 `emotion` 변수로 조건을 판단했지만, 타입은 자유롭게 사용할 수 있습니다.
=======
`NgSwitch` is the controller directive. Bind it to an expression that returns
the *switch value*, such as `feature`. Though the `feature` value in this
example is a string, the switch value can be of any type.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
**Bind to `[ngSwitch]`**. You'll get an error if you try to set `*ngSwitch` because
`NgSwitch` is an *attribute* directive, not a *structural* directive.
<<<<<<< HEAD
It changes the behavior of its companion directives.
It doesn't touch the DOM directly.
-->
스위칭 조건을 판단하는 템플릿 표현식은 **`[ngSwitch]`** 와 같이 바인딩합니다.
이 때 문법을 `*ngSwitch`로 사용해도 되지 않을까 생각할 수 있지만, `NgSwitch`는 *구조* 디렉티브가 아니라 *어트리뷰트* 디렉티브이기 때문에 `*ngSwitch`로 사용하면 에러가 발생합니다.
`NgSwitch`는 엘리먼트의 동작을 변화시키는 디렉티브이며, DOM을 직접 조작하지는 않습니다.
=======
Rather than touching the DOM directly, it changes the behavior of its companion directives.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
**Bind to `*ngSwitchCase` and `*ngSwitchDefault`**.
The `NgSwitchCase` and `NgSwitchDefault` directives are _structural_ directives
because they add or remove elements from the DOM.
-->
`NgSwitch`와는 다르게 `NgSwitchCase`와 `NgSwitchDefault`는 _구조_ 디렉티브이며, `*ngSwitchCase`, `*ngSwitchDefault`와 같이 사용합니다.
두 디렉티브는 DOM에 엘리먼트를 직접 추가하거나 제거하는 디렉티브입니다.

<<<<<<< HEAD
<!--
* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value.
=======
* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value and removes
its bound value when it doesn't equal the switch value.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
* `NgSwitchDefault` adds its element to the DOM when there is no selected `NgSwitchCase`.
-->
* `NgSwitchCase`는 스위칭 조건이 맞을 때 해당 엘리먼트를 DOM에 추가합니다.
* `NgSwitchDefault`는 `NgSwitchCase`가 하나도 선택되지 않았을 때 DOM에 추가하는 엘리먼트를 지정합니다.

<!--
The switch directives are particularly useful for adding and removing *component elements*.
<<<<<<< HEAD
This example switches among four "emotional hero" components defined in the `hero-switch.components.ts` file.
Each component has a `hero` [input property](guide/template-syntax#inputs-outputs "Input property")
which is bound to the `currentHero` of the parent component.
-->
스위치 디렉티브는 *컴포넌트 엘리먼트를* DOM에 추가하거나 제거하는 용도로도 많이 사용합니다.
위에서 살펴본 예제는 `hero-switch.component.ts` 파일에 정의된 컴포넌트 4개를 하나씩 선택해서 적용하는 예제입니다.
각각의 컴포넌트는 부모 컴포넌트에서 전달되는 `currentHero` 프로퍼티를 `hero`를 [입력 프로퍼티](guide/template-syntax#입출력-프로퍼티 "Input property")로 바인딩합니다.
=======
This example switches among four `item` components defined in the `item-switch.components.ts` file.
Each component has an `item` [input property](guide/template-syntax#inputs-outputs "Input property")
which is bound to the `currentItem` of the parent component.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Switch directives work as well with native elements and web components too.
<<<<<<< HEAD
For example, you could replace the `<confused-hero>` switch case with the following.
-->
그리고 스위치 디렉티브는 네이티브 엘리먼트나 웹 컴포넌트에도 자연스럽게 적용할 수 있습니다.
위 예제에서 `<confused-hero>`에 사용했던 스위치 디렉티브는 다음과 같이 네이티브 엘리먼트에도 사용할 수 있습니다.
=======
For example, you could replace the `<app-best-item>` switch case with the following.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch-div" header="src/app/app.component.html"></code-example>

<hr/>

{@a template-reference-variable}

{@a template-reference-variables--var-}

{@a ref-vars}

{@a ref-var}

<<<<<<< HEAD
{@a 템플릿-참조-변수}

<!--
## Template reference variables ( <span class="syntax">#var</span> )
-->
## 템플릿 참조 변수 ( <span class="syntax">#var</span> )
=======
## Template reference variables (`#var`)
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
A **template reference variable** is often a reference to a DOM element within a template.
<<<<<<< HEAD
It can also be a reference to an Angular component or directive or a
<a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.
-->
**템플릿 참조 변수**는 템플릿 안에서 DOM 엘리먼트를 가리킬 때 사용합니다.
그리고 DOM뿐 아니라 Angular 컴포넌트나 디렉티브, <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">웹 컴포넌트</a>를 가리킬 때도 사용할 수 있습니다.
=======
It can also refer to a directive (which contains a component), an element, [TemplateRef](api/core/TemplateRef), or a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.

For a demonstration of the syntax and code snippets in this section, see the <live-example name="template-reference-variables">template reference variables example</live-example>.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Use the hash symbol (#) to declare a reference variable.
<<<<<<< HEAD
The `#phone` declares a `phone` variable on an `<input>` element.
-->
참조 변수는 해시 기호(#)를 사용해서 정의합니다.
예를 들어, `<input>` 엘리먼트를 `phone` 변수로 가리키려면 `#phone` 과 같이 정의합니다.
=======
The following reference variable, `#phone`, declares a `phone` variable on an `<input>` element.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
You can refer to a template reference variable _anywhere_ in the template.
The `phone` variable declared on this `<input>` is
consumed in a `<button>` on the other side of the template
-->
템플릿 참조 변수는 템플릿 안이라면 _어디에서도_ 사용할 수 있습니다.
그래서 템플릿 안에 있는 `<button>` 엘리먼트는 `phone` 변수를 사용해서 `<input>` 엘리먼트를 참조할 수 있습니다.
=======
You can refer to a template reference variable anywhere in the component's template.
Here, a `<button>` further down the template refers to the `phone` variable.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-phone" header="src/app/app.component.html"></code-example>

<!--
<h3 class="no-toc">How a reference variable gets its value</h3>
-->
<h3 class="no-toc">참조 변수를 사용해서 입력값 얻기</h3>

<<<<<<< HEAD
<!--
In most cases, Angular sets the reference variable's value to the element on which it was declared.
In the previous example, `phone` refers to the _phone number_ `<input>` box.
The phone button click handler passes the _input_ value to the component's `callPhone` method.
But a directive can change that behavior and set the value to something else, such as itself.
The `NgForm` directive does that.
-->
템플릿 참조 변수는 입력 엘리먼트의 값에 접근하기 위해 주로 사용합니다.
이전 예제에서 보면, `phone` 변수는 `<input>` 엘리먼트를 참조하며, 버튼을 클릭했을 때 실행되는 `callPhone` 메소드에 입력 필드의 값을 전달하기 위해 `phone.value`를 사용했습니다.
이 방식은 하나의 방법일 뿐이며, 필요하다면 `<input>` 엘리먼트 자체를 넘겨서 사용할 수도 있습니다.
`NgForm` 디렉티브가 이런 방식으로 동작합니다.

<!--
The following is a *simplified* version of the form example in the [Forms](guide/forms) guide.
-->
[폼](guide/forms) 문서에 있는 예제를 *간단하게만* 살펴보면 다음과 같습니다.
=======
In most cases, Angular sets the reference variable's value to the element on which it is declared.
In the previous example, `phone` refers to the phone number `<input>`.
The button's click handler passes the `<input>` value to the component's `callPhone()` method.

The `NgForm` directive can change that behavior and set the value to something else. In the following example, the template reference variable, `itemForm`, appears three times separated
by HTML.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="template-reference-variables/src/app/app.component.html" region="ngForm" header="src/app/hero-form.component.html"></code-example>

The reference value of itemForm, without the ngForm attribute value, would be
the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
There is, however, a difference between a Component and a Directive in that a `Component`
will be referenced without specifying the attribute value, and a `Directive` will not
change the implicit reference (that is, the element).

<<<<<<< HEAD
<!--
A template reference variable, `heroForm`, appears three times in this example, separated
by a large amount of HTML.
What is the value of `heroForm`?
-->
이 예제에서 템플릿 참조 변수 `heroForm`은 총 3번 사용됩니다.
`heroForm`은 어떤 값을 갖고 있을까요?

<!--
If Angular hadn't taken it over when you imported the `FormsModule`,
it would be the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
The `heroForm` is actually a reference to an Angular [NgForm](api/forms/NgForm "API: NgForm")
=======


However, with `NgForm`, `itemForm` is a reference to the [NgForm](api/forms/NgForm "API: NgForm")
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
directive with the ability to track the value and validity of every control in the form.
-->
만약 `FormsModule`을 로드하지 않았다면 이 변수의 값은 [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement)가 됩니다.
실제로 `heroForm` 변수는 Angular [NgForm](api/forms/NgForm "API: NgForm") 디렉티브를 가리키는 변수입니다.
`NgForm`은 폼에 입력된 값을 담고 있으며, 폼에 있는 모든 폼 컨트롤의 유효성에 대한 정보도 갖고 있습니다.

<<<<<<< HEAD
<!--
The native `<form>` element doesn't have a `form` property.
But the `NgForm` directive does, which explains how you can disable the submit button
if the `heroForm.form.valid` is invalid and pass the entire form control tree
to the parent component's `onSubmit` method.
-->
네이티브 `<form>` 엘리멘트에는 `form`이라는 프로퍼티가 없습니다.
하지만 `NgForm` 디렉티브에는 이 프로퍼티가 있고, `heroForm.form.valid` 값을 사용해서 제출 버튼을 비활성화 하거나, 모든 폼 유효성 검사가 통과했을 때 부모 컴포넌트의 `onSubmit` 메소드를 실행하도록 할 수 있습니다.

<!--
<h3 class="no-toc">Template reference variable warning notes</h3>
-->
<h3 class="no-toc">템플릿 참조 변수를 사용할 때 주의할 점</h3>

<!--
A template _reference_ variable (`#phone`) is _not_ the same as a template _input_ variable (`let phone`)
such as you might see in an [`*ngFor`](guide/template-syntax#template-input-variable).
Learn the difference in the [_Structural Directives_](guide/structural-directives#template-input-variable) guide.
-->
템플릿 _참조_ 변수 (`#phone`)는 [`*ngFor`](guide/template-syntax#템플릿-입력-변수)에서 살펴봤던 템플릿 _입력_ 변수 (`let phone`)와는 _다릅니다_.
어떻게 다른지 자세하게 알아보려면 [_구조 디렉티브_](guide/structural-directives#템플릿-입력-변수) 문서를 참고하세요.

<!--
The scope of a reference variable is the _entire template_.
Do not define the same variable name more than once in the same template.
The runtime value will be unpredictable.
-->
템플릿 참조 변수를 사용할 수 있는 스코프는 _템플릿 전체_ 입니다.
한 템플릿 안에서 같은 이름의 템플릿 참조 변수를 참조하지 않도록 주의하세요.
에러는 나지 않더라도 어떤 동작을 할지 알 수 없습니다.
=======
The native `<form>` element doesn't have a `form` property, but the `NgForm` directive does, which allows disabling the submit button
if the `itemForm.form.valid` is invalid and passing the entire form control tree
to the parent component's `onSubmit()` method.

<h3 class="no-toc">Template reference variable considerations</h3>

A template _reference_ variable (`#phone`) is not the same as a template _input_ variable (`let phone`) such as in an [`*ngFor`](guide/template-syntax#template-input-variable).
See [_Structural Directives_](guide/structural-directives#template-input-variable) for more information.

The scope of a reference variable is the entire template. So, don't define the same variable name more than once in the same template as the runtime value will be unpredictable.

#### Alternative syntax
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
You can use the `ref-` prefix alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.
-->
`#` 기호를 사용하는 것이 어색하다면 `ref-` 접두사를 대신 사용할 수도 있습니다.
접두사를 사용해서 `ref-fax` 라고 작성하면 `#fax` 로 `fax` 변수를 정의한 것과 같습니다.


<code-example path="template-reference-variables/src/app/app.component.html" region="ref-fax" header="src/app/app.component.html"></code-example>


<hr/>

{@a inputs-outputs}
{@a 입출력 프로퍼티}

<<<<<<< HEAD
<!--
## Input and Output properties
-->
## 입출력 프로퍼티

<!--
An _Input_ property is a _settable_ property annotated with an `@Input` decorator.
Values flow _into_ the property when it is data bound with a [property binding](#property-binding)
-->
_입력 프로퍼티_ 는 컴포넌트 프로퍼티에 `@Input` 데코레이터를 붙여서 _외부에서 값을 받도록_ 한 프로퍼티입니다.
이 때 데이터는 [프로퍼티 바인딩](#프로퍼티-바인딩)을 통해 컴포넌트 밖에서 컴포넌트 _안으로_ 전달됩니다.

<!--
An _Output_ property is an _observable_ property annotated with an `@Output` decorator.
The property almost always returns an Angular [`EventEmitter`](api/core/EventEmitter).
Values flow _out_ of the component as events bound with an [event binding](#event-binding).
-->
그리고 _출력 프로퍼티_ 는 컴포넌트 프로퍼티에 `@Output` 데코레이터를 붙여서 외부로 공개한 _옵저버블_ 프로퍼티입니다.
이 때 옵저버블 프로퍼티는 Angular에서 제공하는 [`EventEmitter`](api/core/EventEmitter)를 사용하는 것이 일반적입니다.
컴포넌트 안쪽에서 발생하는 이벤트는 [이벤트 바인딩](#이벤트-바인딩)을 통해 컴포넌트 _밖으로_ 전달됩니다.

<!--
You can only bind to _another_ component or directive through its _Input_ and _Output_ properties.
-->
컴포넌트나 디렉티브를 _다른_ 컴포넌트와 디렉티브와 직접 바인딩하려면 _입력_ 프로퍼티나 _출력_ 프로퍼티를 사용해야 합니다.
=======
## `@Input()` and `@Output()` properties

`@Input()` and `@Output()` allow Angular to share data between the parent context
and child directives or components. An `@Input()` property is writable
while an `@Output()` property is observable.

Consider this example of a child/parent relationship:

```html
<parent-component>
  <child-component></child-component>
</parent-component>

```

Here, the `<child-component>` selector, or child directive, is embedded
within a `<parent-component>`, which serves as the child's context.

`@Input()` and `@Output()` act as
the API, or application programming interface, of the child
component in that they allow the child to
communicate with the parent. Think of `@Input()` and `@Output()` like ports
or doorways&mdash;`@Input()` is the doorway into the component allowing data
to flow in while `@Output()` is the doorway out of the component, allowing the
child component to send data out.

This section about `@Input()` and `@Output()` has its own <live-example name="inputs-outputs"></live-example>. The following subsections highlight
key points in the sample app.

<div class="alert is-helpful">
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

#### `@Input()` and `@Output()` are independent

<<<<<<< HEAD
<!--
Remember that all **components** are **directives**.
-->
**컴포넌트**는 **디렉티브**의 종류 중 하나라는 것을 잊지 마세요.

<!--
The following discussion refers to _components_ for brevity and 
because this topic is mostly a concern for component authors. 
-->
아래 설명에서는 컴포넌트를 개발하는 입장에서 설명하기 위해
컴포넌트와 디렉티브를 간단하게 _컴포넌트_ 라고만 언급하겠습니다.
</div>

<!--
<h3 class="no-toc">Discussion</h3>
-->
<h3 class="no-toc">개요</h3>

<!--
You are usually binding a template to its _own component class_.
In such binding expressions, the component's property or method is to the _right_ of the (`=`).
-->
템플릿은 _컴포넌트 클래스_ 와 연결합니다.
그래서 입출력 프로퍼티를 바인딩하기 위해 등호(`=`) _오른쪽_ 에 사용하는 표현식은 컴포넌트 안에 있는 프로퍼티나 메소드가 됩니다.
=======
Though `@Input()` and `@Output()` often appear together in apps, you can use
them separately. If the nested
component is such that it only needs to send data to its parent, you wouldn't
need an `@Input()`, only an `@Output()`. The reverse is also true in that if the
child only needs to receive data from the parent, you'd only need `@Input()`.

</div>

{@a input}

## How to use `@Input()`
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

Use the `@Input()` decorator in a child component or directive to let Angular know
that a property in that component can receive its value from its parent component.
It helps to remember that the data flow is from the perspective of the
child component. So an `@Input()` allows data to be input _into_ the
child component from the parent component.

<<<<<<< HEAD
<!--
The `iconUrl` and `onSave` are members of the `AppComponent` class.
They are _not_ decorated with `@Input()` or `@Output`.
Angular does not object.
-->
위 코드에서 `iconUrl`과 `onSave`는 `AppComponent` 클래스에 있는 프로퍼티와 메소드입니다.
하지만 일반적인 프로퍼티 바인딩이나 이벤트 바인딩을 할 때는 `@Input()` 데코레이터와 `@Output()` 데코레이터가 _필요 없습니다_ .
이 데코레이터들은 자식 컴포넌트와 바인딩할 때 사용됩니다.

<!--
**You can always bind to a public property of a component in its own template.**
It doesn't have to be an _Input_ or _Output_ property
-->
**그리고 입력 프로퍼티로 자식 컴포넌트에 연결하는 프로퍼티는 `public` 접근자로 지정되어야 템플릿에서 사용할 수 있습니다.**
전달하는 컴포넌트의 입장에서 _입출력_ 프로퍼티일 필요는 없습니다.

<!--
A component's class and template are closely coupled.
They are both parts of the same thing.
Together they _are_ the component.
Exchanges between a component class and its template are internal implementation details.
-->
컴포넌트 클래스와 템플릿은 긴밀하게 연결되어 있습니다.
컴포넌트 클래스와 템플릿이 _모여서_ 컴포넌트를 구성하기 때문에 각각은 컴포넌트의 구성요소라고 할 수도 있습니다.
컴포넌트 클래스와 템플릿 사이에 데이터가 전달되는 과정을 자세하게 알아봅시다.

<!--
### Binding to a different component
-->
### 다른 컴포넌트와 바인딩하기

<!--
You can also bind to a property of a _different_ component.
In such bindings, the _other_ component's property is to the _left_ of the (`=`).
-->
컴포넌트 프로퍼티는 _다른_ 컴포넌트로 바인딩할 수도 있습니다.
이런 바인딩에서 _다른_ 컴포넌트의 프로퍼티는 괄호(`=`) _왼쪽_ 에 지정합니다.

<!--
In the following example, the `AppComponent` template binds `AppComponent` class members to properties of the `HeroDetailComponent` whose selector is `'app-hero-detail'`.
-->
아래 예제에서 `AppComponent`의 템플릿은 `AppComponent` 클래스 멤버를 `HeroDetailComponent`의 프로퍼티로 바인딩합니다.
`HeroDetailComponent`는 `'app-hero-detail'` 셀렉터로 표현되는 컴포넌트입니다.
=======

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input.svg" alt="Input data flow diagram">
</div>

To illustrate the use of `@Input()`, edit these parts of your app:

* The child component class and template
* The parent component class and template


### In the child
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

To use the `@Input()` decorator in a child component class, first import
`Input` and then decorate the property with `@Input()`:

<<<<<<< HEAD
<!--
The Angular compiler _may_ reject these bindings with errors like this one:
-->
하지만 이렇게 사용하면 Angular 컴파일 과정에서 다음과 같은 에러가 발생합니다:
=======
<code-example path="inputs-outputs/src/app/item-detail/item-detail.component.ts" region="use-input" header="src/app/item-detail/item-detail.component.ts"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
You know that `HeroDetailComponent` has `hero` and `deleteRequest` properties.
But the Angular compiler refuses to recognize them.
-->
`HeroDetailComponent`에는 `hero` 프로퍼티와 `deleteRequest` 메소드가 이미 있다고 합시다.
하지만 Angular 컴파일러는 이 항목이 있는지 알 수 없습니다.

<!--
**The Angular compiler won't bind to properties of a different component
unless they are Input or Output properties**.
-->
그래서 컴포넌트를 다른 컴포넌트와 연결할 수 있도록 Angular 컴파일러에게 정보를 제공하기 위해
입출력 프로퍼티를 지정합니다.

<!--
There's a good reason for this rule.
-->
규칙은 단순합니다.

<!--
It's OK for a component to bind to its _own_ properties.
The component author is in complete control of those bindings.
-->
컴포넌트 안에서 자신의 프로퍼티에 접근하는 것은 아무 문제가 없습니다.
템플릿 안에서는 프로퍼티를 자유롭게 사용할 수 있습니다.

<!--
But other components shouldn't have that kind of unrestricted access.
You'd have a hard time supporting your component if anyone could bind to any of its properties.
Outside components should only be able to bind to the component's public binding API.
-->
하지만 다른 컴포넌트의 프로퍼티에 접근하는 것은 기본적으로 제한되어 있습니다.
다른 컴포넌트에서 컴포넌트 내부에 마음대로 접근하는 것은 컴포넌트를 관리하기에 그리 효율적이지 않습니다.
컴포넌트 밖에서는 컴포넌트에서 공개하는 API에만 접근할 수 있게 하는 것이 좋습니다.

<!--
Angular asks you to be _explicit_ about that API.
It's up to _you_ to decide which properties are available for binding by
external components.
-->
그래서 Angular는 외부로 공개하는 API를 명확하게 지정하도록 요구하는 것입니다.
어떤 프로퍼티를 컴포넌트 외부로 공개해서 다른 컴포넌트와 바인딩할 지 설정하는 것은 오로지 _개발자_ 의 판단에 달려있습니다.

<!--
#### TypeScript _public_ doesn't matter
-->
#### TypeScript 접근제어자 설정

<!--
You can't use the TypeScript _public_ and _private_ access modifiers to
shape the component's public binding API.
-->
컴포넌트 외부로 공개되는 API는 TypeScript 접근 제어자인 _public_ 이나 _private_ 로 접근 권한을 제어할 수 없습니다.
=======
In this case, `@Input()` decorates the property <code class="no-auto-link">item</code>, which has
a type of `string`, however, `@Input()` properties can have any type, such as
`number`, `string`, `boolean`, or `object`. The value for `item` will come from the parent component, which the next section covers.

Next, in the child component template, add the following:

<code-example path="inputs-outputs/src/app/item-detail/item-detail.component.html" region="property-in-template" header="src/app/item-detail/item-detail.component.html"></code-example>



### In the parent

The next step is to bind the property in the parent component's template.
In this example, the parent component template is `app.component.html`.

First, use the child's selector, here `<app-item-detail>`, as a directive within the
parent component template. Then, use [property binding](guide/template-syntax#property-binding)
to bind the property in the child to the property of the parent.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="inputs-outputs/src/app/app.component.html" region="input-parent" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
All data bound properties must be TypeScript _public_ properties.
Angular never binds to a TypeScript _private_ property.
-->
데이터가 바인딩되는 프로퍼티는 항상 TypeScript _public_ 프로퍼티로 지정되어야 합니다.
_private_ 으로 지정된 프로퍼티를 바인딩하는 것은 Angular에서 허용하지 않습니다.
=======
Next, in the parent component class, `app.component.ts`, designate a value for `currentItem`:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="inputs-outputs/src/app/app.component.ts" region="parent-property" header="src/app/app.component.ts"></code-example>

<<<<<<< HEAD
<!--
Angular requires some other way to identify properties that _outside_ components are allowed to bind to.
That _other way_ is the `@Input()` and `@Output()` decorators.
-->
그리고 컴포넌트 외부로 프로퍼티를 공개할 때 Angular가 제공하는 방식을 사용할 수도 있습니다.
이 때 사용되는 것이 `@Input()` 데코레이터와 `@Output()` 데코레이터입니다.

<!--
### Declaring Input and Output properties
-->
### 입출력 프로퍼티 지정하기

<!--
In the sample for this guide, the bindings to `HeroDetailComponent` do not fail
because the data bound properties are annotated with `@Input()` and `@Output()` decorators.
-->
위에서 살펴본 예제에서는 `HeroDetailComponent`에 바인딩하는 로직이 실패했습니다.
왜냐하면 컴포넌트 외부에서 바인딩하는 프로퍼티를 참조할 때, 이 프로퍼티들이 입출력 프로퍼티로 선언되지 않았기 때문입니다.
그래서 외부에서 입력을 받는 프로퍼티는 `@Input()` 데코레이터로, 외부로 이벤트를 보내는 프로퍼티는 `@Output()` 데코레이터로 다음과 같이 지정해야 합니다.
=======
With `@Input()`, Angular passes the value for `currentItem` to the child so that `item` renders as `Television`.

The following diagram shows this structure:

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input-diagram-target-source.svg" alt="Property binding diagram">
</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

The target in the square brackets, `[]`, is the property you decorate
with `@Input()` in the child component. The binding source, the part
to the right of the equal sign, is the data that the parent
component passes to the nested component.

The key takeaway is that when binding to a child component's property in a parent component&mdash;that is, what's
in square brackets&mdash;you must
decorate the property with `@Input()` in the child component.

<div class="alert is-helpful">

<<<<<<< HEAD
<!--
Alternatively, you can identify members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:
-->
데코레이터를 사용하지 않고 디렉티브 메타데이터를 활용하려면, 아래와 같이 디렉티브 메타데이터의 `inputs` 멤버와 `outputs` 멤버를 사용해도 됩니다:
=======
#### `OnChanges` and `@Input()`
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

To watch for changes on an `@Input()` property, use
`OnChanges`, one of Angular's [lifecycle hooks](guide/lifecycle-hooks#onchanges).
`OnChanges` is specifically designed to work with properties that have the
`@Input()` decorator. See the [`OnChanges`](guide/lifecycle-hooks#onchanges) section of the [Lifecycle Hooks](guide/lifecycle-hooks) guide for more details and examples.

</div>

<<<<<<< HEAD
<!--
### Input or output?
-->
### 입력일까? 출력일까?

<!--
*Input* properties usually receive data values.
*Output* properties expose event producers, such as `EventEmitter` objects.
-->
*입력* 프로퍼티는 외부에서 데이터를 받을 때 사용합니다.
*출력* 프로퍼티는 `EventEmitter` 와 같은 객체를 통해 외부로 이벤트를 보낼 때 사용합니다.

<!--
The terms _input_ and _output_ reflect the perspective of the target directive.
-->
그래서 _입력_ 이나 _출력_ 이라는 말은 바인딩 대상이 되는 디렉티브의 입장에서 표현하는 말입니다.
=======
{@a output}

## How to use `@Output()`

Use the `@Output()` decorator in the child component or directive to allow data to flow from
the child _out_ to the parent.

An `@Output()` property should normally be initialized to an Angular [`EventEmitter`](api/core/EventEmitter) with values flowing out of the component as [events](#event-binding).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
`HeroDetailComponent.hero` is an **input** property from the perspective of `HeroDetailComponent`
because data flows *into* that property from a template binding expression.
-->
`HeroDetailComponent.hero`는 `HeroDetailComponent`의 입장에서 보면 **입력** 프로퍼티입니다.
왜냐하면 템플릿 바인딩 표현식에 의해 데이터가 컴포넌트 *안으로* 전달되기 때문입니다.

<!--
`HeroDetailComponent.deleteRequest` is an **output** property from the perspective of `HeroDetailComponent`
because events stream *out* of that property and toward the handler in a template binding statement.
-->
그리고 `HeroDetailComponent.deleteRequest` 는 `HeroDetailComponent`의 입장에서 볼 때 **출력** 프로퍼티입니다.
이 컴포넌트가 *밖으로* 보내는 이벤트는 템플릿 바인딩 평가식에 의해 실행되는 함수로 전달됩니다.

<h3 id='aliasing-io'>
	<!--
  Aliasing input/output properties
-->
  입출력 프로퍼티 이름 변경하기
</h3>

<!--
Sometimes the public name of an input/output property should be different from the internal name.
-->
어떤 경우에는 입출력 프로퍼티로 자주 사용하는 이름이 디렉티브 프로퍼티의 이름과 다를 수 있습니다.

<!--
This is frequently the case with [attribute directives](guide/attribute-directives).
Directive consumers expect to bind to the name of the directive.
For example, when you apply a directive with a `myClick` selector to a `<div>` tag,
you expect to bind to an event property that is also called `myClick`.
-->
이런 경우는 [어트리뷰트 디렉티브](guide/attribute-directives)인 경우에 자주 발생합니다.
디렉티브를 사용하는 입장에서는 자주 사용하던 이름을 그대로 사용하지만 디렉티브에는 이 프로퍼티가 없는 경우가 있을 수 있습니다.
예를 들어 `<div>` 태그에 `myClick` 셀렉터로 지정하는 디렉티브가 있고, 이 디렉티브에서 발생하는 이벤트의 이름도 `myClick`이라고 합시다.
=======
<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/output.svg" alt="Output diagram">
</div>

Just like with `@Input()`, you can use `@Output()`
on a property of the child component but its type should be
`EventEmitter`.

`@Output()` marks a property in a child component as a doorway
through which data can travel from the child to the parent.
The child component then has to raise an event so the
parent knows something has changed. To raise an event,
`@Output()` works hand in hand with `EventEmitter`,
which is a class in `@angular/core` that you
use to emit custom events.

When you use `@Output()`, edit these parts of your app:

* The child component class and template
* The parent component class and template
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<<<<<<< HEAD
<!--
However, the directive name is often a poor choice for the name of a property within the directive class.
The directive name rarely describes what the property does.
The `myClick` directive name is not a good name for a property that emits click messages.
-->
하지만 디렉티브 클래스 안에 있는 프로퍼티의 이름으로 디렉티브 이름을 정하는 것은 좋은 선택이 아닙니다.
디렉티브 안에 있는 프로퍼티 하나가 그 디렉티브가 어떤 역할을 하는지 충분히 설명할 수 없기 때문입니다.
그래서 이 예제처럼 `myClick` 디렉티브의 이름을 디렉티브 안에 있는 `myClick` 프로퍼티 이름과 똑같이 지정하는 것은 좋지 않습니다.

<!--
Fortunately, you can have a public name for the property that meets conventional expectations,
while using a different name internally.
In the example immediately above, you are actually binding *through the* `myClick` *alias* to
the directive's own `clicks` property.
-->
다행히도, 디렉티브 밖에서 일반적으로 사용하는 이름을 그대로 사용하면서 디렉티브 안에서는 다른 이름으로 지정하는 방법이 있습니다.
위에서 살펴본 예제를 다시 보면, 디렉티브 밖에서는 `myClick` 이라는 이벤트를 바인딩하지만 디렉티브 안에서는 이 이벤트를 `clicks` 라는 프로퍼티로 지정할 수 있습니다.

<!--
You can specify the alias for the property name by passing it into the input/output decorator like this:
-->
디렉티브 밖에서 사용하는 프로퍼티 이름과 디렉티브 안에서 사용하는 프로퍼티 이름을 다르게 하려면 다음과 같이 지정합니다:
=======
The following example shows how to set up an `@Output()` in a child
component that pushes data you enter in an HTML `<input>` to an array in the
parent component.

<div class="alert is-helpful">

The HTML element `<input>` and the Angular decorator `@Input()`
are different. This documentation is about component communication in Angular as it pertains to `@Input()` and `@Output()`. For more information on the HTML element `<input>`, see the [W3C Recommendation](https://www.w3.org/TR/html5/sec-forms.html#the-input-element).

</div>

### In the child

This example features an `<input>` where a user can enter a value and click a `<button>` that raises an event. The `EventEmitter` then relays the data to the parent component.

First, be sure to import `Output` and `EventEmitter`
in the child component class:

```js
import { Output, EventEmitter } from '@angular/core';

```

Next, still in the child, decorate a property with `@Output()` in the component class.
The following example `@Output()` is called `newItemEvent` and its type is
`EventEmitter`, which means it's an event.


<code-example path="inputs-outputs/src/app/item-output/item-output.component.ts" region="item-output" header="src/app/item-output/item-output.component.ts"></code-example>

The different parts of the above declaration are as follows:

* `@Output()`&mdash;a decorator function marking the property as a way for data to go from the child to the parent
* `newItemEvent`&mdash;the name of the `@Output()`
* `EventEmitter<string>`&mdash;the `@Output()`'s type
* `new EventEmitter<string>()`&mdash;tells Angular to create a new event emitter and that the data it emits is of type string. The type could be any type, such as `number`, `boolean`, and so on. For more information on `EventEmitter`, see the [EventEmitter API documentation](api/core/EventEmitter).

Next, create an `addNewItem()` method in the same component class:

<code-example path="inputs-outputs/src/app/item-output/item-output.component.ts" region="item-output-class" header="src/app/item-output/item-output.component.ts"></code-example>

The `addNewItem()` function uses the `@Output()`, `newItemEvent`,
to raise an event in which it emits the value the user
types into the `<input>`. In other words, when
the user clicks the add button in the UI, the child lets the parent know
about the event and gives that data to the parent.

#### In the child's template

The child's template has two controls. The first is an HTML `<input>` with a
[template reference variable](guide/template-syntax#ref-var) , `#newItem`,
where the user types in an item name. Whatever the user types
into the `<input>` gets stored in the `#newItem` variable.

<code-example path="inputs-outputs/src/app/item-output/item-output.component.html" region="child-output" header="src/app/item-output/item-output.component.html"></code-example>

The second element is a `<button>`
with an [event binding](guide/template-syntax#event-binding). You know it's
an event binding because the part to the left of the equal
sign is in parentheses, `(click)`.

The `(click)` event is bound to the `addNewItem()` method in the child component class which
takes as its argument whatever the value of `#newItem` is.

Now the child component has an `@Output()`
for sending data to the parent and a method for raising an event.
The next step is in the parent.

### In the parent

In this example, the parent component is `AppComponent`, but you could use
any component in which you could nest the child.

The `AppComponent` in this example features a list of `items`
in an array and a method for adding more items to the array.

<code-example path="inputs-outputs/src/app/app.component.ts" region="add-new-item" header="src/app/app.component.ts"></code-example>

The `addItem()` method takes an argument in the form of a string
and then pushes, or adds, that string to the `items` array.

#### In the parent's template

Next, in the parent's template, bind the parent's
method to the child's event. Put the child selector, here `<app-item-output>`,
within the parent component's
template, `app.component.html`.

<code-example path="inputs-outputs/src/app/app.component.html" region="output-parent" header="src/app/app.component.html"></code-example>

The event binding, `(newItemEvent)='addItem($event)'`, tells
Angular to connect the event in the child, `newItemEvent`, to
the method in the parent, `addItem()`, and that the event that the child
is notifying the parent about is to be the argument of `addItem()`.
In other words, this is where the actual hand off of data takes place.
The `$event` contains the data that the user types into the `<input>`
in the child template UI.

Now, in order to see the `@Output()` working, add the following to the parent's template:

```html
  <ul>
    <li *ngFor="let item of items">{{item}}</li>
  </ul>
  ```

The `*ngFor` iterates over the items in the `items` array. When you enter a value in the child's `<input>` and click the button, the child emits the event and the parent's `addItem()` method pushes the value to the `items` array and it renders in the list.


## `@Input()` and `@Output()` together

You can use `@Input()` and `@Output()` on the same child component as in the following:

<code-example path="inputs-outputs/src/app/app.component.html" region="together" header="src/app/app.component.html"></code-example>

The target, `item`, which is an `@Input()` property in the child component class, receives its value from the parent's property, `currentItem`. When you click delete, the child component raises an event, `deleteRequest`, which is the argument for the parent's `crossOffItem()` method.

The following diagram is of an `@Input()` and an `@Output()` on the same
child component and shows the different parts of each:

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input-output-diagram.svg" alt="Input/Output diagram">
</div>

As the diagram shows, use inputs and outputs together in the same manner as using them separately. Here, the child selector is `<app-input-output>` with `item` and `deleteRequest` being `@Input()` and `@Output()`
properties in the child component class. The property `currentItem` and the method `crossOffItem()` are both in the parent component class.

To combine property and event bindings using the banana-in-a-box
syntax, `[()]`, see [Two-way Binding](guide/template-syntax#two-way).

For more detail on how these work, see the previous sections on [Input](guide/template-syntax#input) and [Output](guide/template-syntax#output). To see it in action, see the <live-example name="inputs-outputs">Inputs and Outputs Example</live-example>.

## `@Input()` and `@Output()` declarations

Instead of using the `@Input()` and `@Output()` decorators
to declare inputs and outputs, you can identify
members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:

<code-example path="inputs-outputs/src/app/in-the-metadata/in-the-metadata.component.ts" region="metadata" header="src/app/in-the-metadata/in-the-metadata.component.ts"></code-example>

While declaring `inputs` and `outputs` in the `@Directive` and `@Component`
metadata is possible, it is a better practice to use the `@Input()` and `@Output()`
class decorators instead, as follows:

<code-example path="inputs-outputs/src/app/input-output/input-output.component.ts" region="input-output" header="src/app/input-output/input-output.component.ts"></code-example>

See the [Decorate input and output properties](guide/styleguide#decorate-input-and-output-properties) section of the
[Style Guide](guide/styleguide) for details.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<div class="alert is-helpful">

<<<<<<< HEAD
<!--
You can also alias property names in the `inputs` and `outputs` arrays.
You write a colon-delimited (`:`) string with
the directive property name on the *left* and the public alias on the *right*:
-->
디렉티브 메타데이터의 `inputs`와 `outputs`를 사용할 때도 프로퍼티 이름을 변환해서 지정할 수 있습니다.
이 때는 순서대로 디렉티브의 프로퍼티 이름, 콜론(`:`), 디렉티브 밖에서 사용하는 프로퍼티 이름 순으로 지정합니다:
=======
If you get a template parse error when trying to use inputs or outputs, but you know that the
properties do indeed exist, double check
that your properties are annotated with `@Input()` / `@Output()` or that you've declared
them in an `inputs`/`outputs` array:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example language="bash">
Uncaught Error: Template parse errors:
Can't bind to 'item' since it isn't a known property of 'app-item-detail'
</code-example>

</div>

{@a aliasing-io}

## Aliasing inputs and outputs

Sometimes the public name of an input/output property should be different from the internal name. While it is a best practice to avoid this situation, Angular does
offer a solution.

### Aliasing in the metadata

Alias inputs and outputs in the metadata using a colon-delimited (`:`) string with
the directive property name on the left and the public alias on the right:

<code-example path="inputs-outputs/src/app/aliasing/aliasing.component.ts" region="alias" header="src/app/aliasing/aliasing.component.ts"></code-example>


### Aliasing with the `@Input()`/`@Output()` decorator

You can specify the alias for the property name by passing the alias name to the `@Input()`/`@Output()` decorator. The internal name remains as usual.

<code-example path="inputs-outputs/src/app/aliasing/aliasing.component.ts" region="alias-input-output" header="src/app/aliasing/aliasing.component.ts"></code-example>


<hr/>

{@a expression-operators}

{@a 템플릿-표현식-전용-연산자}

<!--
## Template expression operators
-->
## 템플릿 표현식 전용 연산자

<<<<<<< HEAD
<!--
The template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover two of these operators: _pipe_ and _safe navigation operator_.
-->
템플릿 표현식의 문법은 JavaScript 문법의 일부와 템플릿에서만 사용할 수 있는 연산자가 추가되어 만들어진 것입니다.
이번 섹션에서는 _파이프_ 와 _안전 참조 연산자_ 에 대해 알아보겠습니다.

{@a pipe}

<!--
### The pipe operator ( <span class="syntax">|</span> )
-->
### 파이프 연산자 ( <span class="syntax">|</span> )
=======
The Angular template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover three of these operators:

* [pipe](guide/template-syntax#pipe)
* [safe navigation operator](guide/template-syntax#safe-navigation-operator)
* [non-null assertion operator](guide/template-syntax#non-null-assertion-operator)

{@a pipe}

### The pipe operator (`|`)
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The result of an expression might require some transformation before you're ready to use it in a binding.
<<<<<<< HEAD
For example, you might display a number as a currency, force text to uppercase, or filter a list and sort it.
-->
템플릿 표현식의 결과값을 그대로 사용하지 않고 바인딩하기 전에 적당한 형태로 변환해야 하는 경우가 있습니다.
숫자를 화폐 단위로 표시하거나, 문자열을 대문자로 변환하거나, 배열의 일부를 필터링하거나 정렬하는 경우가 이런 경우에 해당됩니다.

<!--
Angular [pipes](guide/pipes) are a good choice for small transformations such as these.
Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the **pipe operator (`|`)**:
-->
이 때 변환 로직이 복잡하지 않다면 Angular에서 제공하는 [파이프](guide/pipes)를 사용하는 것이 좋습니다.
파이프는 입력값을 간단하게 변환해서 새로운 값으로 반환하는 함수입니다.
템플릿에서는 다음과 같이 **파이프 연산자 (`|`)**를 사용해서 적용할 수 있습니다:
=======
For example, you might display a number as a currency, change text to uppercase, or filter a list and sort it.

Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the pipe operator (`|`):
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="template-expression-operators/src/app/app.component.html" region="uppercase-pipe" header="src/app/app.component.html"></code-example>

<!--
The pipe operator passes the result of an expression on the left to a pipe function on the right.
-->
파이프 연산자 왼쪽에 있는 값은 파이프 연산자의 오른쪽으로 전달됩니다.

<!--
You can chain expressions through multiple pipes:
-->
그래서 다음과 같이 파이프 여러개를 연달아 사용할 수도 있습니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="pipe-chain" header="src/app/app.component.html"></code-example>

<!--
And you can also [apply parameters](guide/pipes#parameterizing-a-pipe) to a pipe:
-->
그리고 파이프 함수에 [파이프 인자](guide/pipes#파이프-인자-사용하기)를 전달해서 파이프의 동작을 구체적으로 지정할 수도 있습니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="date-pipe" header="src/app/app.component.html"></code-example>

<!--
The `json` pipe is particularly helpful for debugging bindings:
-->
바인딩되는 객체를 확인해야 할때 `json` 파이프를 사용하면 디버깅이 훨씬 편해집니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="json-pipe" header="src/app/app.component.html"></code-example>

<<<<<<< HEAD
<!--
The generated output would look something like this
-->
이 코드를 실행하면 화면에 다음과 같은 문자열이 표시됩니다.

<code-example language="json">
  { "id": 0, "name": "Hercules", "emotion": "happy",
    "birthdate": "1970-02-25T08:00:00.000Z",
    "url": "http://www.imdb.com/title/tt0065832/",
    "rate": 325 }
</code-example>


<hr/>

{@a safe-navigation-operator}

{@a 안전-참조-연산자}

<!--
### The safe navigation operator ( <span class="syntax">?.</span> ) and null property paths
-->
### null 객체 참조를 방지하는 안전 참조 연산자( <span class="syntax">?.</span> )

<!--
The Angular **safe navigation operator (`?.`)** is a fluent and convenient way to
guard against null and undefined values in property paths.
Here it is, protecting against a view render failure if the `currentHero` is null.
-->
객체를 참조하면서 프로퍼티 값이 `null`이거나 `undefined`인지 확인하는 로직은
**안전 참조 연산자 (`?.`)**를 사용하면 간단하게 구현할 수 있습니다.
`currentHero`의 값이 `null`인지 확인하고, 객체가 유효할 때만 `name` 프로퍼티를 참조하는 로직은 다음과 같이 구현합니다.

<code-example path="template-syntax/src/app/app.component.html" region="safe-2" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
What happens when the following data bound `title` property is null?
-->
이 문법이 왜 필요한지 생각해 봅시다. 프로퍼티 바인딩하는 `title`의 값이 null이라면 어떻게 될까요?

<code-example path="template-syntax/src/app/app.component.html" region="safe-1" header="src/app/app.component.html" linenums="false">
</code-example>

<!--
The view still renders but the displayed value is blank; you see only "The title is" with nothing after it.
That is reasonable behavior. At least the app doesn't crash.
-->
이 경우에 `title`은 빈 값이지만 뷰는 그대로 표시됩니다. 그래서 "The title is" 라는 문자열 뒤에는 아무것도 붙지 않습니다.
이 정도는 쉽게 이해할 수 없습니다. 오류가 발생하지 않으니 앱이 중단되지도 않습니다.

<!--
Suppose the template expression involves a property path, as in this next example
that displays the `name` of a null hero.
-->
그런데 다음 예제처럼 `null` 값인 객체의 프로퍼티를 참조하는 템플릿 표현식이 있다고 합시다.
=======
The generated output would look something like this:

<code-example language="json">
  { "name": "Telephone",
    "manufactureDate": "1980-02-25T05:00:00.000Z",
    "price": 98 }
</code-example>

<div class="alert is-helpful">

The pipe operator has a higher precedence than the ternary operator (`?:`),
which means `a ? b : c | x` is parsed as `a ? b : (c | x)`.
Nevertheless, for a number of reasons,
the pipe operator cannot be used without parentheses in the first and second operands of `?:`.
A good practice is to use parentheses in the third operand too.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

</div>

<<<<<<< HEAD
<!--
JavaScript throws a null reference error, and so does Angular:
-->
이 코드를 실행하면 JavaScript null 객체 참조 에러가 발생하기 때문에 Angular에서도 다음과 같은 에러가 발생함니다:
=======
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<hr/>

<<<<<<< HEAD
<!--
Worse, the *entire view disappears*.
-->
그리고 이 에러의 영향으로 *뷰 전체가 동작하지 않습니다*.

<!--
This would be reasonable behavior if the `hero` property could never be null.
If it must never be null and yet it is null,
that's a programming error that should be caught and fixed.
Throwing an exception is the right thing to do.
-->
참조하는 객체가 null이 되는 경우가 전혀 없다면 이 로직만으로도 문제는 없습니다.
하지만 객체가 null이 되지 않도록 계속 신경을 써야 하고, 개발자의 실수로 null이 되는 경우가 발생할 수도 있습니다.
이런 경우라면 수동으로 에러를 발생시켜서 객체를 참조하지 못하도록 끊어줘야 합니다.

<!--
On the other hand, null values in the property path may be OK from time to time,
especially when the data are null now and will arrive eventually.
-->
하지만 이런 로직은 객체가 null인 경우에만 필요한 로직이며, 올바른 객체를 참조할 때는 필요하지 않습니다.

<!--
While waiting for data, the view should render without complaint, and
the null property path should display as blank just as the `title` property does.
-->
그리고 데이터에 문제가 있는 상황에서도 뷰가 렌더링되는 것이 멈춰서는 안됩니다.
이전에 살펴봤던 것처럼 `title` 프로퍼티 값이 null이라면 빈칸으로 비워두는 것이 더 합리적입니다.

<!--
Unfortunately, the app crashes when the `currentHero` is null.
-->
하지만 지금 코드에서 `currentHero` 객체가 null 이면 앱 전체가 중단됩니다.

<!--
You could code around that problem with [*ngIf](guide/template-syntax#ngIf).
-->
이 문제는 [*ngIf*](guide/template-syntax#ngIf)로 방지할 수도 있습니다.
=======
{@a safe-navigation-operator}

### The safe navigation operator ( `?` ) and null property paths

The Angular safe navigation operator, `?`, guards against `null` and `undefined`
values in property paths. Here, it protects against a view render failure if `item` is `null`.

<code-example path="template-expression-operators/src/app/app.component.html" region="safe" header="src/app/app.component.html"></code-example>

If `item` is `null`, the view still renders but the displayed value is blank; you see only "The item name is:" with nothing after it.

Consider the next example, with a `nullItem`.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example language="html">
  The null item name is {{nullItem.name}}
</code-example>

<<<<<<< HEAD
<!--
You could try to chain parts of the property path with `&&`, knowing that the expression bails out
when it encounters the first null.
-->
그리고 `&&` 연산자를 사용해서 null이 발생하는 경우를 순차적으로 검사할 수도 있습니다.
=======
Since there is no safe navigation operator and `nullItem` is `null`, JavaScript and Angular would throw a `null` reference error and break the rendering process of Angular:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example language="bash">
  TypeError: Cannot read property 'name' of null.
</code-example>

<<<<<<< HEAD
<!--
These approaches have merit but can be cumbersome, especially if the property path is long.
Imagine guarding against a null somewhere in a long property path such as `a.b.c.d`.
-->
이런 방법을 사용해도 원하는 로직을 구현할 수 있지만, 매번 이런 로직을 작성하기는 번거롭습니다. 게다가 참조하는 깊이가 깊어질수록 더 번거로워 집니다.
`a.b.c.d`와 같은 경우에 이런 로직을 구현해야 한다고 생각해 보세요.

<!--
The Angular safe navigation operator (`?.`) is a more fluent and convenient way to guard against nulls in property paths.
The expression bails out when it hits the first null value.
The display is blank, but the app keeps rolling without errors.
-->
이 때 Angular에서 제공하는 안전 참조 연산자 (`?.`)를 사용하면, 객체가 null인지 검사하는 로직을 아주 간단하게 구현할 수 있습니다.
안전 참조 연산자로 참조하는 객체의 값이 null이면 더이상 객체를 참조하지 않고 종료하며, 뷰는 비어있겠지만 에러로 앱이 중단되는 상황은 막을 수 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="safe-6" header="src/app/app.component.html" linenums="false">
</code-example>
=======
Sometimes however, `null` values in the property
path may be OK under certain circumstances,
especially when the value starts out null but the data arrives eventually.

With the safe navigation operator, `?`, Angular stops evaluating the expression when it hits the first `null` value and renders the view without errors.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
It works perfectly with long property paths such as `a?.b?.c?.d`.
-->
안전 참조 연산자는 `a?.b?.c?.d`와 같은 경우에도 완벽하게 동작합니다.


<hr/>

{@a non-null-assertion-operator}

<<<<<<< HEAD
{@a null-방지-연산자}

<!--
### The non-null assertion operator ( <span class="syntax">!</span> )
-->
### null 방지 연산자 ( <span class="syntax">!</span> )

<!--
As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is _unintentionally_ null or undefined.
-->
TypeScript 2.0 버전부터  [null 검사를 더 엄격하게](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript")하는 옵션이 추가되었습니다. 옵션은 `--strictNullChecks`로 활성화하며, 이 옵션을 설정하면 객체의 값이 null이나 undefined이 되는 것을 방지합니다.

<!--
In this mode, typed variables disallow null and undefined by default. The type checker throws an error if you leave a variable unassigned or try to assign null or undefined to a variable whose type disallows null and undefined.
-->
이 모드를 활성화하면 타입을 지정한 변수에 null이나 undefined을 할당하는 것이 허용되지 않습니다. 그래서 변수의 값을 할당하지 않고 놔두거나, 변수에 null이나 undefined을 할당하는 코드가 있으면 타입을 체크할 때 오류가 발생합니다.

<!--
The type checker also throws an error if it can't determine whether a variable will be null or undefined at runtime.
You may know that can't happen but the type checker doesn't know.
You tell the type checker that it can't happen by applying the post-fix
[_non-null assertion operator (!)_](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").
-->
그런데 TypeScript 컴파일러는 앱이 실행되는 시점에 변수의 값이 null이나 undefined가 될 수 있는 코드에서도 에러를 발생합니다.
개발자는 발생하지 않는 경우라고 할 수 있지만 TypeScript 컴파일러가 알수는 없기 때문이죠.
그래서 실행시점에서도 이 객체가 null이 되지 않는다는 것을 [null 방지 연산자](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator")를 사용해서 TypeScript 컴파일러에게 알려줘야 합니다.

<!--
The _Angular_ **non-null assertion operator (`!`)** serves the same purpose in an Angular template.
-->
Angular 템플릿에서도 이 연산자를 사용할 수 있습니다.

<!--
For example, after you use [*ngIf](guide/template-syntax#ngIf) to check that `hero` is defined, you can assert that
`hero` properties are also defined.
-->
만약 `hero` 객체가 정의되어있는지 [*ngIf*](guide/template-syntax#ngIf)로 검사하고, 이 객체가 유효할 때만 동작하는 로직을 다음과 같이 구현했다고 합시다.

<code-example path="template-syntax/src/app/app.component.html" region="non-null-assertion-1" header="src/app/app.component.html" linenums="false">
</code-example>
=======
### The non-null assertion operator ( `!` )

As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is unintentionally null or undefined.

In this mode, typed variables disallow `null` and `undefined` by default. The type checker throws an error if you leave a variable unassigned or try to assign `null` or `undefined` to a variable whose type disallows `null` and `undefined`.

The type checker also throws an error if it can't determine whether a variable will be `null` or undefined at runtime. You tell the type checker not to throw an error by applying the postfix
[non-null assertion operator, !](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").

The Angular non-null assertion operator, `!`, serves the same purpose in
an Angular template. For example, after you use [*ngIf](guide/template-syntax#ngIf)
to check that `item` is defined, you can assert that
`item` properties are also defined.

<code-example path="template-expression-operators/src/app/app.component.html" region="non-null" header="src/app/app.component.html"></code-example>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
When the Angular compiler turns your template into TypeScript code,
<<<<<<< HEAD
it prevents TypeScript from reporting that `hero.name` might be null or undefined.
-->
이 템플릿은 Angular 컴파일러가 TypeScript 코드로 변환합니다. 그러면 null 방지 연산자를 사용했기 때문에 TypeScript 컴파일러가 `hero` 객체는 null이거나 undefined가 되지 않는다는 것을 인식합니다.

<!--
Unlike the [_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)"),
the **non-null assertion operator** does not guard against null or undefined.
Rather it tells the TypeScript type checker to suspend strict null checks for a specific property expression.
-->
하지만 [_안전 참조 연산자_](guide/template-syntax#안전-참조-연산자 "Safe navigation operator (?.)")와는 다르게,
**null 방지 연산자** 는 객체의 값이 null이나 undefined일 때 발생하는 오류를 방지하지는 않습니다.
이 연산자의 역할은 템플릿에서 객체를 참조할 때 엄격한 null 검사를 하지 않도록 지정하는 것 뿐입니다.

<!--
You'll need this template operator when you turn on strict null checks. It's optional otherwise.
-->
그리고 이 연산자는 TypeScript 옵션 중 엄격한 null 검사 옵션을 활성화 할 때만 의미가 있습니다. 모든 상황에서 필요한 코드는 아닙니다.

<!--
=======
it prevents TypeScript from reporting that `item` might be `null` or `undefined`.

Unlike the [_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?)"),
the non-null assertion operator does not guard against `null` or `undefined`.
Rather, it tells the TypeScript type checker to suspend strict `null` checks for a specific property expression.

The non-null assertion operator, `!`, is optional with the exception that you must use it when you turn on strict null checks.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
<a href="#top-of-page">back to top</a>
-->

<hr/>

{@a built-in-template-functions}

<!--
## Built-in template functions
-->
## 기본 템플릿 함수

{@a any-type-cast-function}
{@a any-타입-캐스팅-함수}

<!--
### The `$any()` type cast function
-->
### `$any` 타입 캐스팅 함수

<<<<<<< HEAD
<!--
Sometimes a binding expression triggers a type error during [AOT compilation](guide/aot-compiler) and it is not possible or difficult
to fully specify the type. To silence the error, you can use the `$any()` cast function to cast
the expression to [the `any` type](http://www.typescriptlang.org/docs/handbook/basic-types.html#any) as in the following example:
-->
바인딩 표현식을 사용하다보면 [AOT 컴파일러](guide/aot-compiler)로 컴파일할 때 변수 타입에 맞지 않다는 에러가 발생하지만, 이 객체의 타입을 특정지을 수 없는 경우가 종종 발생합니다.
이 에러를 없애려면 `$any()` 타입 캐스팅 함수를 사용해서 바인딩 표현식의 결과값이 [`any` 타입](http://www.typescriptlang.org/docs/handbook/basic-types.html#any)이 되도록 변환할 수 있습니다.
=======
Sometimes a binding expression triggers a type error during [AOT compilation](guide/aot-compiler) and it is not possible or difficult to fully specify the type.
To silence the error, you can use the `$any()` cast function to cast
the expression to the [`any` type](http://www.typescriptlang.org/docs/handbook/basic-types.html#any) as in the following example:
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-1" header="src/app/app.component.html"></code-example>

<!--
When the Angular compiler turns this template into TypeScript code,
it prevents TypeScript from reporting that `bestByDate` is not a member of the `item`
object when it runs type checking on the template.

The `$any()` cast function also works with `this` to allow access to undeclared members of
the component.
-->
Angular 컴파일러가 이 템플릿 코드를 TypeScript 코드로 변환하고 나면 `item` 객체에 `bestByDate` 멤버가 없더라도 이제는 에러를 발생시키지 않고 그대로 실행됩니다.

그리고 템플릿에서 `this`를 사용해서 컴포넌트 클래스에 직접 접근할 때도 `$any` 캐스트 함수를 사용할 수 있습니다.

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-2" header="src/app/app.component.html"></code-example>

<!--
The `$any()` cast function works anywhere in a binding expression where a method call is valid.
<<<<<<< HEAD
-->
`$any()` 캐스팅 함수는 함수를 실행할 수 있는 바인딩 표현식이라면 어디에나 자유롭게 사용할 수 있습니다.
=======

## SVG in templates

It is possible to use SVG as valid templates in Angular. All of the template syntax below is
applicable to both SVG and HTML. Learn more in the SVG [1.1](https://www.w3.org/TR/SVG11/) and
[2.0](https://www.w3.org/TR/SVG2/) specifications.

Why would you use SVG as template, instead of simply adding it as image to your application?

When you use an SVG as the template, you are able to use directives and bindings just like with HTML
templates. This means that you will be able to dynamically generate interactive graphics.

Refer to the sample code snippet below for a syntax example:

<code-example path="template-syntax/src/app/svg.component.ts" header="src/app/svg.component.ts"></code-example>

Add the following code to your `svg.component.svg` file:

<code-example path="template-syntax/src/app/svg.component.svg" header="src/app/svg.component.svg"></code-example>

Here you can see the use of a `click()` event binding and the property binding syntax
(`[attr.fill]="fillColor"`).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
