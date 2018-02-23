<!--
# Template Syntax
-->
# 템플릿 문법

<style>
  h4 {font-size: 17px !important; text-transform: none !important;}
  .syntax { font-family: Consolas, 'Lucida Sans', Courier, sans-serif; color: black; font-size: 85%; }
  h4 .syntax { font-size: 100%; }
</style>

<!--
The Angular application manages what the user sees and can do, achieving this through the interaction of a
component class instance (the *component*) and its user-facing template.
-->
Angular 애플리케이션은 사용자의 행동에 반응하면서 화면에 데이터를 표시하는데, 이 과정은 컴포넌트 클래스와 템플릿이 상호작용하면서 이루어집니다.

<!--
You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view.
-->
MVC(모델-뷰-컨트롤러)나 MVVM(모델-뷰-뷰모델) 구조를 다뤄봤다면 컴포넌트와 템플릿의 관계가 이미 익숙할 수도 있습니다.
Angular에서는 컴포넌트가 컨트롤러나 뷰모델의 역할을 하고, 템플릿이 뷰 역할을 합니다.

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
이 문서에서 설명하는 코드는 <live-example title="Template Syntax Live Code"></live-example> 에서 확인하거나 다운받을 수 있습니다.

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
다만 `<script>` 엘리먼트는 예외입니다. 이 엘리먼트는 스크립트 인젝션 공격에 노출될 수 있기 때문에 Angular 템플릿 문법에 유효하지 않습니다.
Angular 템플릿에 `<script>` 엘리먼트가 있어도 이 엘리먼트는 처리되지 않으며, 브라우저 콘솔에 경고 메시지를 출력합니다.
더 자세한 내용은 [보안](guide/security) 문서를 확인하세요.

<!--
Some legal HTML doesn't make much sense in a template.
The `<html>`, `<body>`, and `<base>` elements have no useful role.
Pretty much everything else is fair game.
-->
Angular 템플릿에 유효하지 않은 HTML 엘리먼트는 몇가지 더 있습니다.
`<html>` 이나 `<body>`, `<base>` 엘리먼트는 Angular 템플릿에 사용해도 에러나 경고가 표시되지 않지만, 별다른 역할을 하지는 않습니다.
언급하지 않은 엘리먼트는 그대로 사용해도 됩니다.

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
## Interpolation ( <span class="syntax">{&#xfeff;{...}}</span> )
-->
## 문자열 바인딩(Interpolation ( <span class="syntax">{&#xfeff;{...}}</span> )

<!--
You met the double-curly braces of interpolation, `{{` and `}}`, early in your Angular education.
-->
다른 문서에서도 살펴봤듯이, 문자열 바인딩에는 이중 중괄호(`{{`, `}}`)를 사용합니다.

<code-example path="template-syntax/src/app/app.component.html" region="first-interpolation" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
You use interpolation to weave calculated strings into the text between HTML element tags and within attribute assignments.
-->
그리고 HTML 엘리먼트 태그 안에 내용을 넣거나 어트리뷰트를 지정할 때도 문자열 바인딩을 사용할 수 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="title+image" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
The text between the braces is often the name of a component property. Angular replaces that name with the
string value of the corresponding component property. In the example above, Angular evaluates the `title` and `heroImageUrl` properties
and "fills in the blanks", first displaying a bold application title and then a heroic image.
-->
중괄호 안에는 컴포넌트 프로퍼티를 바인딩 할 수 있습니다. 프로퍼티 이름을 템플릿에 바인딩하면 Angular가 처리하면서 프로퍼티 이름을 프로퍼티 값으로 변경해서 템플릿에 적용합니다.
위에서 살펴본 코드를 예로 들면, 템플릿에 사용된 `title` 프로퍼티의 값을 애플리케이션 제목으로 표시하고, `heroImageUrl` 프로퍼티에 지정된 주소를 찾아서 히어로의 이미지를 표시합니다.

<!--
More generally, the text between the braces is a **template expression** that Angular first **evaluates**
and then **converts to a string**. The following interpolation illustrates the point by adding the two numbers:
-->
좀 더 자세히 얘기하면 중괄호 안에 있는 **템플릿 표현식**은 Angular에서 가장 먼저 **평가**되며, 평가된 값은 **문자열로 변환**되어 템플릿에 반영됩니다. 이 때문에 문자열 바인딩은 문자열 삽입이라고도 하며, 이런 특성 때문에 두 숫자를 더하는 표현식도 템플릿에 바로 사용할 수 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="sum-1" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
The expression can invoke methods of the host component such as `getVal()`, seen here:
-->
그리고 템플릿 표현식에서는 컴포넌트 메서드를 바로 실행할 수도 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="sum-2" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Angular evaluates all expressions in double curly braces,
converts the expression results to strings, and links them with neighboring literal strings. Finally,
it assigns this composite interpolated result to an **element or directive property**.
-->
이중 중괄호 안에 있는 템플릿 표현식은 Angular 프레임워크가 평가하고 문자열로 변환해서 같은 엘리먼트에 있는 문자열과 연결합니다. 이렇게 템플릿에 삽입된 문자열은 **엘리먼트나 디렉티브의 속성값**으로 사용됩니다.

<!--
You appear to be inserting the result between element tags and assigning it to attributes.
It's convenient to think so, and you rarely suffer for this mistake.
Though this is not exactly true. Interpolation is a special syntax that Angular converts into a
[property binding](guide/template-syntax#property-binding), as is explained [below](guide/template-syntax#property-binding-or-interpolation).
-->
이 과정은 템플릿 표현식의 결과값이 엘리먼트 태그의 값이나 속성값으로 바로 삽입된다고 생각할 수도 있습니다. 이렇게 단순하게 이해하는 것도 틀린 것은 아닙니다만, 정확한 것은 아닙니다. 문자열 바인딩은 [프로퍼티 바인딩](guide/template-syntax#property-binding)의 특별한 케이스이며, [아래](guide/template-syntax#property-binding-or-interpolation)에서 자세하게 설명할 것입니다.

<!--
But first, let's take a closer look at template expressions and statements.
-->
우선은 템플릿 표현식에 대해 자세하게 알아봅시다.


<hr/>

{@a template-expressions}

{@a 템플릿-표현식}

<!--
## Template expressions
-->
## 템플릿 표현식

<!--
A template **expression** produces a value.
Angular executes the expression and assigns it to a property of a binding target;
the target might be an HTML element, a component, or a directive.
-->
템플릿 **표현식**은 결과값을 반환합니다.
템플릿 표현식을 실행하고 반환된 값은 Angular 프레임워크가 HTML 엘리먼트나 컴포넌트, 디렉티브에 바인딩합니다.

<!--
The interpolation braces in `{{1 + 1}}` surround the template expression `1 + 1`.
In the [property binding](guide/template-syntax#property-binding) section below,
a template expression appears in quotes to the right of the&nbsp;`=` symbol as in `[property]="expression"`.
-->
`{{1 + 1}}` 이라는 표현은 템플릿 표현식 `1 + 1`을 문자열 바인딩 표현식으로 감싼 것입니다.
이후에 알아볼 [프로퍼티 바인딩](guide/template-syntax#property-binding)에서 자세히 설명하겠지만,
템플릿 표현식은 큰따옴표로 둘러싸서 `=` 기호 오른쪽에 `[property]="expression"` 와 같이 사용합니다.

<!--
You write these template expressions in a language that looks like JavaScript.
Many JavaScript expressions are legal template expressions, but not all.
-->
템플릿 표현식은 JavaScript처럼 보이기도 하며, JavaScript 구문은 대부분 템플릿 표현식에 사용할 수 있지만, 모두 가능한 것은 아닙니다.

<!--
JavaScript expressions that have or promote side effects are prohibited,
including:
-->
JavaScript 문법 중에 템플릿 표현식의 용도에 맞지 않는 다음 문법들은 사용할 수 없습니다:

<!--
* assignments (`=`, `+=`, `-=`, ...)
* <code>new</code>
* chaining expressions with <code>;</code> or <code>,</code>
* increment and decrement operators (`++` and `--`)
-->
* 값을 할당하는 구문(`=`, `+=`, `-=` 등)
* <code>new</code> 키워드
* 여러 줄일 때 사용하는 <code>;</code> 와 <code>,</code>
* 증감연산자 (`++`, `--`)

<!--
Other notable differences from JavaScript syntax include:
-->
그리고 아래 연산자들은 JavaScript와 다릅니다:

<!--
* no support for the bitwise operators `|` and `&`
* new [template expression operators](guide/template-syntax#expression-operators), such as `|`, `?.` and `!`.
-->
* 비트 연산자 `|`, `&` 는 템플릿 표현식에서 지원하지 않습니다.
* `|`, `?.`, `!`와 같은 [템플릿 표현식 전용 연산자](guide/template-syntax#템플릿-표현식-전용-연산자)도 있습니다.

{@a expression-context}

{@a 템플릿-표현식의-컨텍스트}

<!--
### Expression context
-->
### 템플릿 표현식의 컨텍스트

<!--
The *expression context* is typically the _component_ instance.
In the following snippets, the `title`  within double-curly braces and the
`isUnchanged` in quotes refer to properties of the `AppComponent`.
-->
*템플릿 표현식의 컨텍스트*는 일반적으로 _컴포넌트_ 인스턴스의 컨텍스트와 같습니다.
따라서 아래 예제에서 이중 중괄호로 문자열 바인딩 된  `title`과 `<span>`에 사용된 `isUnchanged` 어트리뷰트는 모두 `AppComponent`에 있는 프로퍼티를 가리킵니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-expression" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
An expression may also refer to properties of the _template's_ context
such as a [template input variable](guide/template-syntax#template-input-variable) (`let hero`)
or a [template reference variable](guide/template-syntax#ref-vars) (`#heroInput`).
-->
그리고 _템플릿_ 안에서만 유효한 변수도 있습니다. 아래 코드에서 `let hero`로 쓰인 [템플릿 입력 변수](guide/template-syntax#템플릿-입력-변수)와
`#heroInput`으로 쓰인 [템플릿 참조 변수](guide/template-syntax#템플릿-참조-변수)는 템플릿 안에서만 유효합니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-var" title="src/app/app.component.html" linenums="false">
</code-example>

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
The previous example presents such a name collision. The component has a `hero`
property and the `*ngFor` defines a `hero` template variable.
The `hero` in `{{hero.name}}`
refers to the template input variable, not the component's property.
-->
위에서 살펴본 예제에서 이미 중복된 항목이 사용되었습니다.
컴포넌트에 `hero` 프로퍼티가 있는데 템플릿에서 `*ngFor`를 사용하면서 다시 한 번 `hero` 템플릿 변수를 선언했는데,
이 경우 `{{hero.name}}`에 사용된 변수 `hero`는 참조 우선순위에 따라 컴포넌트의 프로퍼티 대신 템플릿 입력 변수를 참조합니다.

<!--
Template expressions cannot refer to anything in
the global namespace (except `undefined`). They can't refer to `window` or `document`. They
can't call `console.log` or `Math.max`. They are restricted to referencing
members of the expression context.
-->
템플릿 표현식에서는 전역 공간에 있는 어떠한 객체에도 접근할 수 없으며 `undefined`만 허용됩니다.
`window`나 `document`는 참조할 수 없으며, `console.log`나 `Math.max`와 같은 함수도 실행할 수 없습니다.


{@a no-side-effects}

{@a expression-guidelines}

{@a 템플릿-표현식-가이드라인}

<!--
### Expression guidelines
-->
### 템플릿 표현식 가이드라인

<!--
Template expressions can make or break an application.
Please follow these guidelines:
-->
템플릿 표현식을 잘못 사용하면 애플리케이션이 중단되는 에러가 발생할 수도 있습니다.
다음 가이드라인을 꼭 확인하세요:

<!--
* [No visible side effects](guide/template-syntax#no-visible-side-effects)
* [Quick execution](guide/template-syntax#quick-execution)
* [Simplicity](guide/template-syntax#simplicity)
* [Idempotence](guide/template-syntax#idempotence)
-->
* [외부 영향 최소화](guide/template-syntax#외부-영향-최소화)
* [실행시간은 최대한 짧게](guide/template-syntax#실행시간은-최대한-짧게)
* [로직은 최대한 단순하게](guide/template-syntax#로직은-최대한-단순하게)
* [멱등성](guide/template-syntax#멱등성)

<!--
The only exceptions to these guidelines should be in specific circumstances that you thoroughly understand.
-->
이 가이드라인들은 불가피한 상황이 아니라면 지키는 것이 좋습니다.

<!--
#### No visible side effects
-->
#### 외부 영향 최소화

<!--
A template expression should not change any application state other than the value of the
target property.
-->
템플릿 표현식은 표현식에 사용된 프로퍼티 값 하나에 의해서만 영향을 받아야 하며, 애플리케이션의 상태와는 관련이 없어야 합니다.

<!--
This rule is essential to Angular's "unidirectional data flow" policy.
You should never worry that reading a component value might change some other displayed value.
The view should be stable throughout a single rendering pass.
-->
이 규칙은 Angular가 제안하는 "단방향 데이터 흐름"의 관점에서도 아주 중요합니다.
컴포넌트 프로퍼티를 참조하는 과정에서 다른 컴포넌트 프로퍼티가 영향을 줄 걱정은 할 필요가 없으며, 뷰는 렌더링 단계에서 한 번만 갱신됩니다.

<!--
#### Quick execution
-->
#### 실행시간은 최대한 짧게

<!--
Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as
promise resolutions, http results, timer events, keypresses and mouse moves.
-->
변화 갑지 싸이클은 Promise 완료, http 응답, 타이머 이벤트, 키보드나 마우스 입력등에 의해 발생하는데,
Angular는 변화 감지 싸이클마다 템플릿 표현식을 다시 평가합니다.

<!--
Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values when their computation is expensive.
-->
따라서 템플릿 표현식은 최대한 빠르게 완료되어야 하며, 실행 시간이 오래 걸린다면 사용자가 불편을 느낄 것입니다.
연산이 많이 필요한 작업이라면 결과값을 캐싱하는 방법도 고려해 보세요.

<!--
#### Simplicity
-->
#### 로직은 최대한 단순하게

<!--
Although it's possible to write quite complex template expressions, you should avoid them.
-->
템플릿 표현식에는 아주 복잡한 로직을 작성할 수도 있지만, 이런 상황은 피하는 것이 좋습니다.

<!--
A property name or method call should be the norm.
An occasional Boolean negation (`!`) is OK.
Otherwise, confine application and business logic to the component itself,
where it will be easier to develop and test.
-->
프로퍼티을 바로 참조하거나 함수 실행만 하는 것이 가장 좋습니다.
필요하다면 `!` 같은 불리언 연산을 하는 것도 좋습니다.
이정도의 로직 외에 애플리케이션 로직이나 비즈니스 로직이 더 필요하다면, 템플릿보다 테스트하기 쉬운 컴포넌트에 구현하는 것이 좋습니다.

#### 멱등성

<!--
An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is ideal because
it is free of side effects and improves Angular's change detection performance.
-->
[멱등성](https://en.wikipedia.org/wiki/Idempotence)은 어떤 연산을 몇 번 반복해도 결과가 같은 상태를 뜻하며, 다음과 같은 연산은 멱등성이 있다고 할 수 있습니다.
`7 x 0 = 7 x 0 x 0 x 0 x 0`

이 법칙을 따르는 템플릿 표현식은 다른 프로퍼티값의 변화를 걱정할 필요가 없고, Angular의 변화 감지 성능도 향상시킬 수 있기 때문에 가장 좋습니다.

<!--
In Angular terms, an idempotent expression always returns *exactly the same thing* until
one of its dependent values changes.
-->
Angular의 기준으로 보면, 멱등성을 띄는 템플릿 표현식은 참조하는 변수의 값이 변하지 않는 이상 언제나 *정확하게 같은 값*을 반환해야 합니다.

<!--
Dependent values should not change during a single turn of the event loop.
If an idempotent expression returns a string or a number, it returns the same string or number
when called twice in a row. If the expression returns an object (including an `array`),
it returns the same object *reference* when called twice in a row.
-->
템플릿 표현식에서 참조하는 변수는 한 번 도는 이벤트 루프에서 여러 번 변경되지 않습니다.
만약 멱등성을 띄는 템플릿 표현식에서 문자열이나 숫자를 반환한다면, 이 템플릿 표현식은 다시 실행되어도 같은 결과값을 반환해야 합니다.
그리고 객체나 배열을 반환하는 템플릿 표현식이라면 여러번 실행되더라도 그 결과값은 *같은 객체*를 가리켜야 합니다.

<hr/>

{@a template-statements}

{@a 템플릿-실행문}

<!--
## Template statements
-->
## 템플릿 실행문

<!--
A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.
You'll see template statements in the [event binding](guide/template-syntax#event-binding) section,
appearing in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.
-->
템플릿 **실행문**은 엘리먼트나 컴포넌트, 디렉티브에서 발생하는 **이벤트**에 반응합니다.
템플릿 실행문은 이 문서의 [이벤트 바인딩](guide/template-syntax#이벤트-바인딩) 섹션에서도 확인할 수 있으며,
`=` 기호를 사용해서 `(event)="실행문"`과 같이 작성합니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" title="src/app/app.component.html" linenums="false">
</code-example>

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
템플릿 실행문을 파싱하는 파서는 템플릿 표현식을 파싱하는 파서와 다르며, 템플릿 표현식에서는 사용할 수 없는 문법도 몇 가지는 사용할 수 있습니다.
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

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" title="src/app/app.component.html" linenums="false">
</code-example>

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

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Template context names take precedence over component context names.
In `deleteHero(hero)` above, the `hero` is the template input variable,
not the component's `hero` property.
-->
템플릿 컨텍스트의 항목 이름과 컴포넌트의 프로퍼티 이름이 중복되면 템플릿 컨텍스트의 우선순위가 높습니다.
위 코드를 예로 들면, `deleteHero(hero)`에 사용된 `hero`는 템플릿 입력 변수이며, 컴포넌트에 있는 `hero` 프로퍼티는 템플릿 변수에 의해 가려졌습니다.

<!--
Template statements cannot refer to anything in the global namespace. They
can't refer to `window` or `document`.
They can't call `console.log` or `Math.max`.
-->
템플릿 실행문에서는 템플릿 표현식과 마찬가지로 전역 공간에 접근할 수 없습니다.
또, `window`나 `document`에도 접근할 수 없고, `console.log`나 `Math.max`와 같은 함수도 실행할 수 없습니다.

<!--
### Statement guidelines
-->
### 템플릿 실행문 가이드라인

<!--
As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.
-->
템플릿 표현식과 마찬가지로 템플릿 실행문에도 복잡한 구문을 작성하지 않는 것이 좋습니다.
간단하게 프로퍼티를 참조하거나 함수를 실행하는 것이 가장 좋은 방법입니다.

<!--
Now that you have a feel for template expressions and statements,
you're ready to learn about the varieties of data binding syntax beyond interpolation.
-->
지금까지 템플릿 표현식과 템플릿 실행식에 대해 알아봤습니다.
이제부터는 문자열 바인딩을 포함한 데이터 바인딩에 대해 자세하게 알아봅시다.


<hr/>

{@a binding-syntax}

{@a 바인딩-문법}

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
데이터 바인딩을 지원하는 프레임워크에서는 HTML에 값을 반영하거나 HTML에서 값을 가져오는 과정이 이전에 비해 훨씬 편해지기 때문에,
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
      <!--
      Data direction
      -->
      데이터 방향
    </th>
    <th>
      <!--
      Syntax
      -->
      문법
    </th>
    <th>
      <!--
      Type
      -->
      종류
    </th>

  </tr>
  <tr>
    <td>
      <!--
      One-way<br>from data source<br>to view target
      -->
      데이터 소스에서<br>뷰로 가는<br>단방향
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
        <!--
        Event
        -->
        이벤트
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
좀 더 자세히 알아봅시다.

<!--
In the normal course of HTML development, you create a visual structure with HTML elements, and
you modify those elements by setting element attributes with string constants.
-->
일반적으로 HTML 문서를 작성할 때는 화면에 표시하는 모양에 맞게 HTML 엘리먼트 구조를 잡고 각 엘리먼트의 어트리뷰트를 문자열로 직접 지정했습니다.

<code-example path="template-syntax/src/app/app.component.html" region="img+button" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
You still create a structure and initialize attribute values this way in Angular templates.
-->
지금까지 살펴본 Angular 템플릿에서도 엘리먼트 구조를 잡거나 어트리뷰트 값을 지정할 때도 이런 방법을 사용했습니다.

<!--
Then you learn to create new elements with components that encapsulate HTML
and drop them into templates as if they were native HTML elements.
-->
그리고 HTML을 캡슐화하는 컴포넌트를 작성한 후에는 일반 HTML 엘리먼트처럼 템플릿에 사용할 수 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="hero-detail-1" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
That's HTML Plus.
-->
그래서 이것을 HTML가 확장되었다고 하는 것입니다.

<!--
Then you learn about data binding. The first binding you meet might look like this:
-->
이제 데이터 바인딩에 대해 알아봅시다. 첫번째로 살펴볼 바인딩은 다음과 같습니다.

<code-example path="template-syntax/src/app/app.component.html" region="disabled-button-1" title="src/app/app.component.html" linenums="false">
</code-example>

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
아닙니다! 매일 작업하던 HTML 모델과는 이 점이 다릅니다.
사실 데이터 바인딩을 사용하고 나면 더이상 HTML *어트리뷰트* 를 직접 조작할 필요가 없습니다.
단지 DOM 엘리먼트나 컴포넌트, 디렉티브의 *프로퍼티* 값만 지정하게 될 것입니다.

<div class="l-sub-section">

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

* Some HTML attributes don't have corresponding properties. `colspan` is one example.

* Some DOM properties don't have corresponding attributes. `textContent` is one example.

* Many HTML attributes appear to map to properties ... but not in the way you might think!
-->
* 어떤 HTML 어트리뷰트는 프로퍼티와 같은 역할을 합니다. `id`가 그렇습니다.
* 프로퍼티에는 없는 HTML 어트리뷰트도 있습니다. `colspan`이 그렇습니다.
* 어트리뷰트에는 없는 DOM 프로퍼티도 있습니다. `textContent`가 그렇습니다.
* 그 외의 어트리뷰트와 프로퍼티는 서로 연관이 있지만... 이 부분은 일단 넘어가죠!

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

<!--
The HTML attribute `value` specifies the *initial* value; the DOM `value` property is the *current* value.
-->
HTML에 있는 `value` 어트리뷰트는 연결된 DOM 필드의 값을 초기화할 뿐이고, DOM에 있는 `value` 프로퍼티가 *현재값* 을 나타냅니다.

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
**HTML 어트리뷰트와 DOM 프로퍼티의 이름이 같은 항목이라, 엄연히 다릅니다.**

</div>

<!--
This fact bears repeating:
**Template binding works with *properties* and *events*, not *attributes*.**
-->
중요한 내용이니 다시 한 번 설명하자면:
**템플릿 바인딩은 *프로퍼티*나 *이벤트*와 합니다. *어트리뷰트*가 아닙니다.**

<div class="callout is-helpful">

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
Angular에서는 어트리뷰트가 엘리먼트의 초기값을 지정하거나 디렉티브의 초기 상태를 지정하는 역할만 합니다.
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
      <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1" title="src/app/app.component.html" linenums="false">
      </code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1" title="src/app/app.component.html" linenums="false">
      </code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1" title="src/app/app.component.html" linenums="false">
      </code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1" title="src/app/app.component.html" linenums="false">
      </code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1" title="src/app/app.component.html" linenums="false">
      </code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1" title="src/app/app.component.html" linenums="false">
      </code-example>
    </td>
  </tr>
</table>

<!--
With this broad view in mind, you're ready to look at binding types in detail.
-->
이제 하나씩 자세하게 알아봅시다.

<hr/>

{@a property-binding}

{@a 프로퍼티-바인딩}

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

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Another example is disabling a button when the component says that it `isUnchanged`:
-->
그리고 컴포넌트에 있는 `isUnchanged` 프로퍼티 값에 따라 버튼을 비활성화 하려면 다음과 같이 사용합니다:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Another is setting a property of a directive:
-->
디렉티브 프로퍼티를 설정하려면 다음과 같이 사용합니다:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Yet another is setting the model property of a custom component (a great way
for parent and child components to communicate):
-->
그리고 커스텀 컴포넌트의 모델 프로퍼티를 설정하려면 다음과 같이 사용합니다. 이 방법을 사용하면 부모 컴포넌트에서 자식 컴포넌트로 간단하게 데이터를 전달할 수 있습니다:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-4" title="src/app/app.component.html" linenums="false">
</code-example>

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

<div class="l-sub-section">

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

</div>

<!--
### Binding target
-->
### 바인딩 대상

<!--
An element property between enclosing square brackets identifies the target property.
The target property in the following code is the image element's `src` property.
-->
엘리먼트의 프로퍼티를 대괄호(`[`, `]`)로 감싸면 프로퍼티 바인딩 대상으로 지정할 수 있습니다.
그래서 다음 코드에서는 이미지 엘리먼트의 `src` 프로퍼티가 프로퍼티 바인딩의 대상 프로퍼티입니다.

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
Some people prefer the `bind-` prefix alternative, known as the *canonical form*:
-->
이 방식이 익숙하지 않다면 다음과 같이 `bind-` 접두사를 사용할 수도 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-5" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
The target name is always the name of a property, even when it appears to be the name of something else.
You see `src` and may think it's the name of an attribute. No. It's the name of an image element property.
-->
이 때 대괄호로 감싸는 대상은 반드시 프로퍼티 이름이어야 합니다.
위 코드에서 `src`가 어트리뷰트 이름처럼 보일 수 있지만, `src`는 이미지 엘리먼트의 프로퍼티 이름입니다.

<!--
Element properties may be the more common targets,
but Angular looks first to see if the name is a property of a known directive,
as it is in the following example:
-->
바인딩되는 프로퍼티는 대상 엘리먼트의 프로퍼티인 것이 일반적이지만, 다음과 같이 Angular에서 제공하는 디렉티브의 프로퍼티일 수도 있습니다.
이 때는 엘리먼트 프로퍼티보다 디렉티브 프로퍼티의 우선순위가 높습니다:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

<!--
Technically, Angular is matching the name to a directive [input](guide/template-syntax#inputs-outputs),
one of the property names listed in the directive's `inputs` array or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.
-->
문법적으로 보면 디렉티브의 [입력 프로퍼티](guide/template-syntax#입출력-프로퍼티)로 지정된 프로퍼티 중에 같은 이름인 프로퍼티에 바인딩됩니다.
이 때 디렉티브에서는 입력값을 받기 위해 `inputs` 배열을 지정하거나 `@Input()` 데코레이터를 지정해야 합니다.

</div>

<!--
If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.
-->
디렉티브나 엘리먼트에서 프로퍼티 이름을 찾지 못하면 “unknown directive” 에러가 발생합니다.

<!--
### Avoid side effects
-->
### 외부 영향 최소화

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
예를 들어 템플릿 표현식에서 `getFoo()`라는 함수를 실행할 수 있습니다. 그런데 `getFoo()`가 어떤 동작을 하는지는 이 코드를 작성한 사람만 알 수 있습니다.
만약 `getFoo()` 함수가 어떤 프로퍼티의 값을 바꾸는데, 이 프로퍼티가 다른 곳에 바인딩 되어 있으면 결과적으로 어떤 현상이 발생할 지 예측하기 어려워집니다.
이 동작의 결과를 뷰에서 확인할 수 있다면 다행이지만 겉으로 보이지 않을 수도 있습니다. 이렇게 값이 연쇄적으로 변경되는 로직은 Angular가 검출하고 경고 메시지를 출력합니다.
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

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-4" title="src/app/app.component.html" linenums="false">
</code-example>

<!--
### Remember the brackets
-->
### 괄호 빼먹지 않기

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

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-6" title="src/app/app.component.html" linenums="false">
</code-example>

{@a one-time-initialization}

### One-time string initialization

You *should* omit the brackets when all of the following are true:

* The target property accepts a string value.
* The string is a fixed value that you can bake into the template.
* This initial value never changes.

You routinely initialize attributes this way in standard HTML, and it works
just as well for directive and component property initialization.
The following example initializes the `prefix` property of the `HeroDetailComponent` to a fixed string,
not a template expression. Angular sets it and forgets about it.

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-7" title="src/app/app.component.html" linenums="false">
</code-example>

The `[hero]` binding, on the other hand, remains a live binding to the component's `currentHero` property.

{@a property-binding-or-interpolation}

### Property binding or interpolation?

You often have a choice between interpolation and property binding.
The following binding pairs do the same thing:

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-vs-interpolation" title="src/app/app.component.html" linenums="false">
</code-example>

_Interpolation_ is a convenient alternative to _property binding_ in many cases.

When rendering data values as strings, there is no technical reason to prefer one form to the other.
You lean toward readability, which tends to favor interpolation.
You suggest establishing coding style rules and choosing the form that
both conforms to the rules and feels most natural for the task at hand.

When setting an element property to a non-string data value, you must use _property binding_.

#### Content security

Imagine the following *malicious content*.

<code-example path="template-syntax/src/app/app.component.ts" region="evil-title" title="src/app/app.component.ts" linenums="false">
</code-example>

Fortunately, Angular data binding is on alert for dangerous HTML.
It [*sanitizes*](guide/security#sanitization-and-security-contexts) the values before displaying them.
It **will not** allow HTML with script tags to leak into the browser, neither with interpolation
nor property binding.

<code-example path="template-syntax/src/app/app.component.html" region="property-binding-vs-interpolation-sanitization" title="src/app/app.component.html" linenums="false">
</code-example>

Interpolation handles the script tags differently than property binding but both approaches render the
content harmlessly.


<figure>
  <img src='generated/images/guide/template-syntax/evil-title.png' alt="evil title made safe">
</figure>


<hr/>

{@a other-bindings}

## Attribute, class, and style bindings

The template syntax provides specialized one-way bindings for scenarios less well suited to property binding.

### Attribute binding

You can set the value of an attribute directly with an **attribute binding**.

<div class="l-sub-section">

This is the only exception to the rule that a binding sets a target property.
This is the only binding that creates and sets an attribute.

</div>

This guide stresses repeatedly that setting an element property with a property binding
is always preferred to setting the attribute with a string. Why does Angular offer attribute binding?

**You must use attribute binding when there is no element property to bind.**

Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA),
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), and
table span attributes. They are pure attributes.
They do not correspond to element properties, and they do not set element properties.
There are no property targets to bind to.

This fact becomes painfully obvious when you write something like this.

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

And you get this error:

<code-example format="nocode">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

As the message says, the `<td>` element does not have a `colspan` property.
It has the "colspan" *attribute*, but
interpolation and property binding can set only *properties*, not attributes.

You need attribute bindings to create and bind to such attributes.

Attribute binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix **`attr`**,
followed by a dot (`.`) and the name of the attribute.
You then set the attribute value, using an expression that resolves to a string.

Bind `[attr.colspan]` to a calculated value:

<code-example path="template-syntax/src/app/app.component.html" region="attrib-binding-colspan" title="src/app/app.component.html" linenums="false">
</code-example>

Here's how the table renders:

<table border="1px">
  <tr><td colspan="2">One-Two</td></tr>
  <tr><td>Five</td><td>Six</td></tr>
 </table>

One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:

<code-example path="template-syntax/src/app/app.component.html" region="attrib-binding-aria" title="src/app/app.component.html" linenums="false">
</code-example>


<hr/>

### Class binding

You can add and remove CSS class names from an element's `class` attribute with
a **class binding**.

Class binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `class`,
optionally followed by a dot (`.`) and the name of a CSS class: `[class.class-name]`.

The following examples show how to add and remove the application's "special" class
with class bindings.  Here's how to set the attribute without binding:

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

You can replace that with a binding to a string of the desired class names; this is an all-or-nothing, replacement binding.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

Finally, you can bind to a specific class name.
Angular adds the class when the template expression evaluates to truthy.
It removes the class when the expression is falsy.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

While this is a fine way to toggle a single class name,
the [NgClass directive](guide/template-syntax#ngClass) is usually preferred when managing multiple class names at the same time.

</div>


<hr/>

### Style binding

You can set inline styles with a **style binding**.

Style binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `style`,
followed by a dot (`.`) and the name of a CSS style property: `[style.style-property]`.

<code-example path="template-syntax/src/app/app.component.html" region="style-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

Some style binding styles have a unit extension.
The following example conditionally sets the font size in  “em” and “%” units .

<code-example path="template-syntax/src/app/app.component.html" region="style-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

While this is a fine way to set a single style,
the [NgStyle directive](guide/template-syntax#ngStyle) is generally preferred when setting several inline styles at the same time.

</div>

<div class="l-sub-section">

Note that a _style property_ name can be written in either
[dash-case](guide/glossary#dash-case), as shown above, or
[camelCase](guide/glossary#camelcase), such as `fontSize`.

</div>

<hr/>

{@a event-binding}

{@a 이벤트-바인딩}

<!--
## Event binding  ( <span class="syntax">(event)</span> )
-->
## 이벤트 바인딩 ( <span class="syntax">(event)</span> )

The bindings directives you've met so far flow data in one direction: **from a component to an element**.

Users don't just stare at the screen. They enter text into input boxes. They pick items from lists.
They click buttons. Such user actions may result in a flow of data in the opposite direction:
**from an element to a component**.

The only way to know about a user action is to listen for certain events such as
keystrokes, mouse movements, clicks, and touches.
You declare your interest in user actions through Angular event binding.

Event binding syntax consists of a **target event** name
within parentheses on the left of an equal sign, and a quoted
[template statement](guide/template-syntax#template-statements) on the right.
The following event binding listens for the button's click events, calling
the component's `onSave()` method whenever a click occurs:

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

### Target event

A **name between parentheses** &mdash; for example, `(click)` &mdash;
identifies the target event. In the following example, the target is the button's click event.

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

Some people prefer the `on-` prefix alternative, known as the **canonical form**:

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-2" title="src/app/app.component.html" linenums="false">
</code-example>

Element events may be the more common targets, but Angular looks first to see if the name matches an event property
of a known directive, as it does in the following example:

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-3" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

The `myClick` directive is further described in the section
on [aliasing input/output properties](guide/template-syntax#aliasing-io).

</div>

If the name fails to match an element event or an output property of a known directive,
Angular reports an “unknown directive” error.

### *$event* and event handling statements

In an event binding, Angular sets up an event handler for the target event.

When the event is raised, the handler executes the template statement.
The template statement typically involves a receiver, which performs an action
in response to the event, such as storing a value from the HTML control
into a model.

The binding conveys information about the event, including data values, through
an **event object named `$event`**.

The shape of the event object is determined by the target event.
If the target event is a native DOM element event, then `$event` is a
[DOM event object](https://developer.mozilla.org/en-US/docs/Web/Events),
with properties such as `target` and `target.value`.

Consider this example:

<code-example path="template-syntax/src/app/app.component.html" region="without-NgModel" title="src/app/app.component.html" linenums="false">
</code-example>

This code sets the input box `value` property by binding to the `name` property.
To listen for changes to the value, the code binds to the input box's `input` event.
When the user makes changes, the `input` event is raised, and the binding executes
the statement within a context that includes the DOM event object, `$event`.

To update the `name` property, the changed text is retrieved by following the path `$event.target.value`.

If the event belongs to a directive (recall that components are directives),
`$event` has whatever shape the directive decides to produce.

{@a eventemitter}

{@a custom-event}

### Custom events with <span class="syntax">EventEmitter</span>

Directives typically raise custom events with an Angular [EventEmitter](api/core/EventEmitter).
The directive creates an `EventEmitter` and exposes it as a property.
The directive calls `EventEmitter.emit(payload)` to fire an event, passing in a message payload, which can be anything.
Parent directives listen for the event by binding to this property and accessing the payload through the `$event` object.

Consider a `HeroDetailComponent` that presents hero information and responds to user actions.
Although the `HeroDetailComponent` has a delete button it doesn't know how to delete the hero itself.
The best it can do is raise an event reporting the user's delete request.

Here are the pertinent excerpts from that `HeroDetailComponent`:

<code-example path="template-syntax/src/app/hero-detail.component.ts" linenums="false" title="src/app/hero-detail.component.ts (template)" region="template-1">
</code-example>

<code-example path="template-syntax/src/app/hero-detail.component.ts" linenums="false" title="src/app/hero-detail.component.ts (deleteRequest)" region="deleteRequest">
</code-example>

The component defines a `deleteRequest` property that returns an `EventEmitter`.
When the user clicks *delete*, the component invokes the `delete()` method,
telling the `EventEmitter` to emit a `Hero` object.

Now imagine a hosting parent component that binds to the `HeroDetailComponent`'s `deleteRequest` event.

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (event-binding-to-component)" region="event-binding-to-component">
</code-example>

When the `deleteRequest` event fires, Angular calls the parent component's `deleteHero` method,
passing the *hero-to-delete* (emitted by `HeroDetail`) in the `$event` variable.

### Template statements have side effects

The `deleteHero` method has a side effect: it deletes a hero.
Template statement side effects are not just OK, but expected.

Deleting the hero updates the model, perhaps triggering other changes
including queries and saves to a remote server.
These changes percolate through the system and are ultimately displayed in this and other views.


<hr/>

{@a two-way}

## Two-way binding ( <span class="syntax">[(...)]</span> )

You often want to both display a data property and update that property when the user makes changes.

On the element side that takes a combination of setting a specific element property
and listening for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, **`[(x)]`**.
The `[(x)]` syntax combines the brackets
of _property binding_, `[x]`, with the parentheses of _event binding_, `(x)`.

<div class="callout is-important">

<header>
  [( )] = banana in a box
</header>

Visualize a *banana in a box* to remember that the parentheses go _inside_ the brackets.

</div>

The `[(x)]` syntax is easy to demonstrate when the element has a settable property called `x`
and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits the pattern.
It has a `size` value property and a companion `sizeChange` event:

<code-example path="template-syntax/src/app/sizer.component.ts" title="src/app/sizer.component.ts">
</code-example>

The initial `size` is an input value from a property binding.
Clicking the buttons increases or decreases the `size`, within min/max values constraints,
and then raises (_emits_) the `sizeChange` event with the adjusted size.

Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (two-way-1)" region="two-way-1">
</code-example>

The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.
Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding,
making the displayed text bigger or smaller.

The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
Angular _desugars_ the `SizerComponent` binding into this:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (two-way-2)" region="two-way-2">
</code-example>

The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.

Clearly the two-way binding syntax is a great convenience compared to separate property and event bindings.

It would be convenient to use two-way binding with HTML form elements like `<input>` and `<select>`.
However, no native HTML element follows the `x` value and `xChange` event pattern.

Fortunately, the Angular [_NgModel_](guide/template-syntax#ngModel) directive is a bridge that enables two-way binding to form elements.


<hr/>

{@a directives}

## Built-in directives

Earlier versions of Angular included over seventy built-in directives.
The community contributed many more, and countless private directives
have been created for internal applications.

You don't need many of those directives in Angular.
You can often achieve the same results with the more capable and expressive Angular binding system.
Why create a directive to handle a click when you can write a simple binding such as this?

<code-example path="template-syntax/src/app/app.component.html" region="event-binding-1" title="src/app/app.component.html" linenums="false">
</code-example>

You still benefit from directives that simplify complex tasks.
Angular still ships with built-in directives; just not as many.
You'll write your own directives, just not as many.

This segment reviews some of the most frequently used built-in directives,
classified as either [_attribute_ directives](guide/template-syntax#attribute-directives) or [_structural_ directives](guide/template-syntax#structural-directives).

<hr/>

{@a attribute-directives}

## Built-in _attribute_ directives

Attribute directives listen to and modify the behavior of
other HTML elements, attributes, properties, and components.
They are usually applied to elements as if they were HTML attributes, hence the name.

Many details are covered in the [_Attribute Directives_](guide/attribute-directives) guide.
Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation")
and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
This section is an introduction to the most commonly used attribute directives:

* [`NgClass`](guide/template-syntax#ngClass) - add and remove a set of CSS classes
* [`NgStyle`](guide/template-syntax#ngStyle) - add and remove a set of HTML styles
* [`NgModel`](guide/template-syntax#ngModel) - two-way data binding to an HTML form element


<hr/>

{@a ngClass}

### NgClass

You typically control how elements appear
by adding and removing CSS classes dynamically.
You can bind to the `ngClass` to add or remove several classes simultaneously.

A [class binding](guide/template-syntax#class-binding) is a good way to add or remove a *single* class.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-3a" title="src/app/app.component.html" linenums="false">
</code-example>

To add or remove *many* CSS classes at the same time, the `NgClass` directive may be the better choice.

Try binding `ngClass` to a key:value control object.
Each key of the object is a CSS class name; its value is `true` if the class should be added,
`false` if it should be removed.

Consider a `setCurrentClasses` component method that sets a component property,
`currentClasses` with an object that adds or removes three classes based on the
`true`/`false` state of three other component properties:

<code-example path="template-syntax/src/app/app.component.ts" region="setClasses" title="src/app/app.component.ts" linenums="false">
</code-example>

Adding an `ngClass` property binding to `currentClasses` sets the element's classes accordingly:

<code-example path="template-syntax/src/app/app.component.html" region="NgClass-1" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

It's up to you to call `setCurrentClasses()`, both initially and when the dependent properties change.

</div>

<hr/>

{@a ngStyle}

### NgStyle

You can set inline styles dynamically, based on the state of the component.
With `NgStyle` you can set many inline styles simultaneously.

A [style binding](guide/template-syntax#style-binding) is an easy way to set a *single* style value.

<code-example path="template-syntax/src/app/app.component.html" region="NgStyle-1" title="src/app/app.component.html" linenums="false">
</code-example>

To set *many* inline styles at the same time, the `NgStyle` directive may be the better choice.

Try binding `ngStyle` to a key:value control object.
Each key of the object is a style name; its value is whatever is appropriate for that style.

Consider a `setCurrentStyles` component method that sets a component property, `currentStyles`
with an object that defines three styles, based on the state of three other component properties:

<code-example path="template-syntax/src/app/app.component.ts" region="setStyles" title="src/app/app.component.ts" linenums="false">
</code-example>

Adding an `ngStyle` property binding to `currentStyles` sets the element's styles accordingly:

<code-example path="template-syntax/src/app/app.component.html" region="NgStyle-2" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

It's up to you to call `setCurrentStyles()`, both initially and when the dependent properties change.

</div>


<hr/>

{@a ngModel}

### NgModel - Two-way binding to form elements with <span class="syntax">[(ngModel)]</span>

When developing data entry forms, you often both display a data property and
update that property when the user makes changes.

Two-way data binding with the `NgModel` directive makes that easy. Here's an example:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (NgModel-1)" region="NgModel-1">
</code-example>

#### _FormsModule_ is required to use _ngModel_

Before using the `ngModel` directive in a two-way data binding,
you must import the `FormsModule` and add it to the NgModule's `imports` list.
Learn more about the `FormsModule` and `ngModel` in the
[Forms](guide/forms#ngModel) guide.

Here's how to import the `FormsModule` to make `[(ngModel)]` available.

<code-example path="template-syntax/src/app/app.module.1.ts" linenums="false" title="src/app/app.module.ts (FormsModule import)">
</code-example>

#### Inside <span class="syntax">[(ngModel)]</span>

Looking back at the `name` binding, note that
you could have achieved the same result with separate bindings to
the `<input>` element's  `value` property and `input` event.

<code-example path="template-syntax/src/app/app.component.html" region="without-NgModel" title="src/app/app.component.html" linenums="false">
</code-example>

That's cumbersome. Who can remember which element property to set and which element event emits user changes?
How do you extract the currently displayed text from the input box so you can update the data property?
Who wants to look that up each time?

That `ngModel` directive hides these onerous details behind its own  `ngModel` input and `ngModelChange` output properties.

<code-example path="template-syntax/src/app/app.component.html" region="NgModel-3" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

The `ngModel` data property sets the element's value property and the `ngModelChange` event property
listens for changes to the element's value.

The details are specific to each kind of element and therefore the `NgModel` directive only works for an element
supported by a [ControlValueAccessor](api/forms/ControlValueAccessor)
that adapts an element to this protocol.
The `<input>` box is one of those elements.
Angular provides *value accessors* for all of the basic HTML form elements and the
[_Forms_](guide/forms) guide shows how to bind to them.

You can't apply `[(ngModel)]` to a non-form native element or a third-party custom component
until you write a suitable *value accessor*,
a technique that is beyond the scope of this guide.

You don't need a _value accessor_ for an Angular component that you write because you
can name the value and event properties
to suit Angular's basic [two-way binding syntax](guide/template-syntax#two-way) and skip `NgModel` altogether.
The [`sizer` shown above](guide/template-syntax#two-way) is an example of this technique.

</div>

Separate `ngModel` bindings is an improvement over binding to the element's native properties. You can do better.

You shouldn't have to mention the data property twice. Angular should be able to capture
the component's data property and set it
with a single declaration, which it can with the `[(ngModel)]` syntax:

<code-example path="template-syntax/src/app/app.component.html" region="NgModel-1" title="src/app/app.component.html" linenums="false">
</code-example>

Is `[(ngModel)]` all you need? Is there ever a reason to fall back to its expanded form?

The `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more or something different, you can write the expanded form.

The following contrived example forces the input value to uppercase:

<code-example path="template-syntax/src/app/app.component.html" region="NgModel-4" title="src/app/app.component.html" linenums="false">
</code-example>

Here are all variations in action, including the uppercase version:

<figure>
  <img src='generated/images/guide/template-syntax/ng-model-anim.gif' alt="NgModel variations">
</figure>

<hr/>

{@a structural-directives}

## Built-in _structural_ directives

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's _structure_, typically by adding, removing, and manipulating
the host elements to which they are attached.

The deep details of structural directives are covered in the
[_Structural Directives_](guide/structural-directives) guide
where you'll learn:

* why you
[_prefix the directive name with an asterisk_ (\*)](guide/structural-directives#asterisk "The * in *ngIf").
* to use [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* how to write your own structural directive.
* that you can only apply [one structural directive](guide/structural-directives#one-per-element "one per host element") to an element.

_This_ section is an introduction to the common structural directives:

* [`NgIf`](guide/template-syntax#ngIf) - conditionally add or remove an element from the DOM
* [`NgSwitch`](guide/template-syntax#ngSwitch) - a set of directives that switch among alternative views
* [NgForOf](guide/template-syntax#ngFor) - repeat a template for each item in a list

<hr/>

{@a ngIf}

### NgIf

You can add or remove an element from the DOM by applying an `NgIf` directive to
that element (called the _host element_).
Bind the directive to a condition expression like `isActive` in this example.

<code-example path="template-syntax/src/app/app.component.html" region="NgIf-1" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-critical">

Don't forget the asterisk (`*`) in front of `ngIf`.

</div>

When the `isActive` expression returns a truthy value, `NgIf` adds the `HeroDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `HeroDetailComponent`
from the DOM, destroying that component and all of its sub-components.

#### Show/hide is not the same thing

You can control the visibility of an element with a
[class](guide/template-syntax#class-binding) or [style](guide/template-syntax#style-binding) binding:

<code-example path="template-syntax/src/app/app.component.html" region="NgIf-3" title="src/app/app.component.html" linenums="false">
</code-example>

Hiding an element is quite different from removing an element with `NgIf`.

When you hide an element, that element and all of its descendents remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance,
for something the user can't see.

When `NgIf` is `false`, Angular removes the element and its descendents from the DOM.
It destroys their components, potentially freeing up substantial resources,
resulting in a more responsive user experience.

The show/hide technique is fine for a few elements with few children.
You should be wary when hiding large component trees; `NgIf` may be the safer choice.

#### Guard against null

The `ngIf` directive is often used to guard against null.
Show/hide is useless as a guard.
Angular will throw an error if a nested expression tries to access a property of `null`.

Here we see `NgIf` guarding two `<div>`s.
The `currentHero` name will appear only when there is a `currentHero`.
The `nullHero` will never be displayed.

<code-example path="template-syntax/src/app/app.component.html" region="NgIf-2" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

See also the
[_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)")
described below.

</div>


<hr/>

{@a ngFor}

### NgForOf

`NgForOf` is a _repeater_ directive &mdash; a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed.
You tell Angular to use that block as a template for rendering each item in the list.

Here is an example of `NgForOf` applied to a simple `<div>`:

<code-example path="template-syntax/src/app/app.component.html" region="NgFor-1" title="src/app/app.component.html" linenums="false">
</code-example>

You can also apply an `NgForOf` to a component element, as in this example:

<code-example path="template-syntax/src/app/app.component.html" region="NgFor-2" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-critical">

Don't forget the asterisk (`*`) in front of `ngFor`.

</div>

The text assigned to `*ngFor` is the instruction that guides the repeater process.

{@a microsyntax}

#### *ngFor* microsyntax

The string assigned to `*ngFor` is not a [template expression](guide/template-syntax#template-expressions).
It's a *microsyntax* &mdash; a little language of its own that Angular interprets.
The string `"let hero of heroes"` means:

> *Take each hero in the `heroes` array, store it in the local `hero` looping variable, and
make it available to the templated HTML for each iteration.*

Angular translates this instruction into a `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `hero`
in the list.

Learn about the _microsyntax_ in the [_Structural Directives_](guide/structural-directives#microsyntax) guide.

{@a template-input-variable}

{@a template-input-variables}

<!--
### Template input variables
-->
### 템플릿 입력 변수

The `let` keyword before `hero` creates a _template input variable_ called `hero`.
The `NgForOf` directive iterates over the `heroes` array returned by the parent component's `heroes` property
and sets `hero` to the current item from the array during each iteration.

You reference the `hero` input variable within the `NgForOf` host element
(and within its descendants) to access the hero's properties.
Here it is referenced first in an interpolation
and then passed in a binding to the `hero` property of the `<hero-detail>` component.

<code-example path="template-syntax/src/app/app.component.html" region="NgFor-1-2" title="src/app/app.component.html" linenums="false">
</code-example>

Learn more about _template input variables_ in the
[_Structural Directives_](guide/structural-directives#template-input-variable) guide.

#### *ngFor* with _index_

The `index` property of the `NgForOf` directive context returns the zero-based index of the item in each iteration.
You can capture the `index` in a template input variable and use it in the template.

The next example captures the `index` in a variable named `i` and displays it with the hero name like this.

<code-example path="template-syntax/src/app/app.component.html" region="NgFor-3" title="src/app/app.component.html" linenums="false">
</code-example>

<div class="l-sub-section">

`NgFor` is implemented by the `NgForOf` directive. Read more about the other `NgForOf` context values such as `last`, `even`,
and `odd` in the [NgForOf API reference](api/common/NgForOf).

</div>

{@a trackBy}

#### *ngFor* with _trackBy_

The `NgForOf` directive may perform poorly, especially with large lists.
A small change to one item, an item removed, or an item added can trigger a cascade of DOM manipulations.

For example, re-querying the server could reset the list with all new hero objects.

Most, if not all, are previously displayed heroes.
*You* know this because the `id` of each hero hasn't changed.
But Angular sees only a fresh list of new object references.
It has no choice but to tear down the old DOM elements and insert all new DOM elements.

Angular can avoid this churn with `trackBy`.
Add a method to the component that returns the value `NgForOf` _should_ track.
In this case, that value is the hero's `id`.

<code-example path="template-syntax/src/app/app.component.ts" region="trackByHeroes" title="src/app/app.component.ts" linenums="false">
</code-example>

In the microsyntax expression, set `trackBy` to this method.

<code-example path="template-syntax/src/app/app.component.html" region="trackBy" title="src/app/app.component.html" linenums="false">
</code-example>

Here is an illustration of the _trackBy_ effect.
"Reset heroes" creates new heroes with the same `hero.id`s.
"Change ids" creates new heroes with new `hero.id`s.

* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement.

<figure>
  <img src="generated/images/guide/template-syntax/ng-for-track-by-anim.gif" alt="trackBy">
</figure>


<hr/>

{@a ngSwitch}

### The _NgSwitch_ directives

*NgSwitch* is like the JavaScript `switch` statement.
It can display _one_ element from among several possible elements, based on a _switch condition_.
Angular puts only the *selected* element into the DOM.

*NgSwitch* is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as seen in this example.

<code-example path="template-syntax/src/app/app.component.html" region="NgSwitch" title="src/app/app.component.html" linenums="false">
</code-example>

<figure>
  <img src="generated/images/guide/template-syntax/switch-anim.gif" alt="trackBy">
</figure>

`NgSwitch` is the controller directive. Bind it to an expression that returns the *switch value*.
The `emotion` value in this example is a string, but the switch value can be of any type.

**Bind to `[ngSwitch]`**. You'll get an error if you try to set `*ngSwitch` because
`NgSwitch` is an *attribute* directive, not a *structural* directive.
It changes the behavior of its companion directives.
It doesn't touch the DOM directly.

**Bind to `*ngSwitchCase` and `*ngSwitchDefault`**.
The `NgSwitchCase` and `NgSwitchDefault` directives are _structural_ directives
because they add or remove elements from the DOM.

* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value.
* `NgSwitchDefault` adds its element to the DOM when there is no selected `NgSwitchCase`.

<!--
The switch directives are particularly useful for adding and removing *component elements*.
This example switches among four "emotional hero" components defined in the `hero-switch.components.ts` file.
Each component has a `hero` [input property](guide/template-syntax#inputs-outputs "Input property")
which is bound to the `currentHero` of the parent component.
-->
The switch directives are particularly useful for adding and removing *component elements*.
This example switches among four "emotional hero" components defined in the `hero-switch.components.ts` file.
Each component has a `hero` [input property](guide/template-syntax#입출력-프로퍼티 "Input property")
which is bound to the `currentHero` of the parent component.

Switch directives work as well with native elements and web components too.
For example, you could replace the `<confused-hero>` switch case with the following.

<code-example path="template-syntax/src/app/app.component.html" region="NgSwitch-div" title="src/app/app.component.html" linenums="false">
</code-example>

<hr/>

{@a template-reference-variable}

{@a ref-vars}

{@a ref-var}

{@a 템플릿-참조-변수}

<!--
## Template reference variables ( <span class="syntax">#var</span> )
-->
## 템플릿 참조 변수 ( <span class="syntax">#var</span> )

A **template reference variable** is often a reference to a DOM element within a template.
It can also be a reference to an Angular component or directive or a
<a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.

Use the hash symbol (#) to declare a reference variable.
The `#phone` declares a `phone` variable on an `<input>` element.

<code-example path="template-syntax/src/app/app.component.html" region="ref-var" title="src/app/app.component.html" linenums="false">
</code-example>

You can refer to a template reference variable _anywhere_ in the template.
The `phone` variable declared on this `<input>` is
consumed in a `<button>` on the other side of the template

<code-example path="template-syntax/src/app/app.component.html" region="ref-phone" title="src/app/app.component.html" linenums="false">
</code-example>

<h3 class="no-toc">How a reference variable gets its value</h3>

In most cases, Angular sets the reference variable's value to the element on which it was declared.
In the previous example, `phone` refers to the _phone number_ `<input>` box.
The phone button click handler passes the _input_ value to the component's `callPhone` method.
But a directive can change that behavior and set the value to something else, such as itself.
The `NgForm` directive does that.

The following is a *simplified* version of the form example in the [Forms](guide/forms) guide.

<code-example path="template-syntax/src/app/hero-form.component.html" title="src/app/hero-form.component.html" linenums="false">
</code-example>

A template reference variable, `heroForm`, appears three times in this example, separated
by a large amount of HTML.
What is the value of `heroForm`?

If Angular hadn't taken it over when you imported the `FormsModule`,
it would be the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
The `heroForm` is actually a reference to an Angular [NgForm](api/forms/NgForm "API: NgForm")
directive with the ability to track the value and validity of every control in the form.

The native `<form>` element doesn't have a `form` property.
But the `NgForm` directive does, which explains how you can disable the submit button
if the `heroForm.form.valid` is invalid and pass the entire form control tree
to the parent component's `onSubmit` method.

<h3 class="no-toc">Template reference variable warning notes</h3>

A template _reference_ variable (`#phone`) is _not_ the same as a template _input_ variable (`let phone`)
such as you might see in an [`*ngFor`](guide/template-syntax#template-input-variable).
Learn the difference in the [_Structural Directives_](guide/structural-directives#template-input-variable) guide.

The scope of a reference variable is the _entire template_.
Do not define the same variable name more than once in the same template.
The runtime value will be unpredictable.

You can use the `ref-` prefix alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.

<code-example path="template-syntax/src/app/app.component.html" region="ref-fax" title="src/app/app.component.html" linenums="false">
</code-example>


<hr/>

{@a inputs-outputs}
{@a 입출력 프로퍼티}

<!--
## Input and Output properties
-->
## 입출력 프로퍼티

An _Input_ property is a _settable_ property annotated with an `@Input` decorator.
Values flow _into_ the property when it is data bound with a [property binding](#property-binding)

<!--
An _Output_ property is an _observable_ property annotated with an `@Output` decorator.
The property almost always returns an Angular [`EventEmitter`](api/core/EventEmitter).
Values flow _out_ of the component as events bound with an [event binding](#event-binding).
-->
An _Output_ property is an _observable_ property annotated with an `@Output` decorator.
The property almost always returns an Angular [`EventEmitter`](api/core/EventEmitter).
Values flow _out_ of the component as events bound with an [이벤트 바인딩](#이벤트-바인딩).

You can only bind to _another_ component or directive through its _Input_ and _Output_ properties.

<div class="alert is-important">

Remember that all **components** are **directives**.

The following discussion refers to _components_ for brevity and 
because this topic is mostly a concern for component authors. 
</div>

<h3 class="no-toc">Discussion</h3>

You are usually binding a template to its _own component class_.
In such binding expressions, the component's property or method is to the _right_ of the (`=`).

<code-example path="template-syntax/src/app/app.component.html" region="io-1" title="src/app/app.component.html" linenums="false">
</code-example>

The `iconUrl` and `onSave` are members of the `AppComponent` class.
They are _not_ decorated with `@Input()` or `@Output`.
Angular does not object.

**You can always bind to a public property of a component in its own template.**
It doesn't have to be an _Input_ or _Output_ property

A component's class and template are closely coupled.
They are both parts of the same thing.
Together they _are_ the component.
Exchanges between a component class and its template are internal implementation details.

### Binding to a different component

You can also bind to a property of a _different_ component.
In such bindings, the _other_ component's property is to the _left_ of the (`=`).

In the following example, the `AppComponent` template binds `AppComponent` class members to properties of the `HeroDetailComponent` whose selector is `'app-hero-detail'`.

<code-example path="template-syntax/src/app/app.component.html" region="io-2" title="src/app/app.component.html" linenums="false">
</code-example>

The Angular compiler _may_ reject these bindings with errors like this one:

<code-example language="sh" class="code-shell">
Uncaught Error: Template parse errors:
Can't bind to 'hero' since it isn't a known property of 'app-hero-detail'
</code-example>

You know that `HeroDetailComponent` has `hero` and `deleteRequest` properties.
But the Angular compiler refuses to recognize them.

**The Angular compiler won't bind to properties of a different component
unless they are Input or Output properties**.

There's a good reason for this rule.

It's OK for a component to bind to its _own_ properties.
The component author is in complete control of those bindings.

But other components shouldn't have that kind of unrestricted access.
You'd have a hard time supporting your component if anyone could bind to any of its properties.
Outside components should only be able to bind to the component's public binding API.

Angular asks you to be _explicit_ about that API.
It's up to _you_ to decide which properties are available for binding by
external components.

#### TypeScript _public_ doesn't matter

You can't use the TypeScript _public_ and _private_ access modifiers to
shape the component's public binding API.

<div class="alert is-important">

All data bound properties must be TypeScript _public_ properties.
Angular never binds to a TypeScript _private_ property.

</div>

Angular requires some other way to identify properties that _outside_ components are allowed to bind to.
That _other way_ is the `@Input()` and `@Output()` decorators.

### Declaring Input and Output properties

In the sample for this guide, the bindings to `HeroDetailComponent` do not fail
because the data bound properties are annotated with `@Input()` and `@Output()` decorators.

<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-1" title="src/app/hero-detail.component.ts" linenums="false">
</code-example>

<div class="l-sub-section">

Alternatively, you can identify members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:

<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-2" title="src/app/hero-detail.component.ts" linenums="false">
</code-example>

</div>

### Input or output?

*Input* properties usually receive data values.
*Output* properties expose event producers, such as `EventEmitter` objects.

The terms _input_ and _output_ reflect the perspective of the target directive.

<figure>
  <img src="generated/images/guide/template-syntax/input-output.png" alt="Inputs and outputs">
</figure>

`HeroDetailComponent.hero` is an **input** property from the perspective of `HeroDetailComponent`
because data flows *into* that property from a template binding expression.

`HeroDetailComponent.deleteRequest` is an **output** property from the perspective of `HeroDetailComponent`
because events stream *out* of that property and toward the handler in a template binding statement.

<h3 id='aliasing-io'>
  Aliasing input/output properties
</h3>

Sometimes the public name of an input/output property should be different from the internal name.

This is frequently the case with [attribute directives](guide/attribute-directives).
Directive consumers expect to bind to the name of the directive.
For example, when you apply a directive with a `myClick` selector to a `<div>` tag,
you expect to bind to an event property that is also called `myClick`.

<code-example path="template-syntax/src/app/app.component.html" region="myClick" title="src/app/app.component.html" linenums="false">
</code-example>

However, the directive name is often a poor choice for the name of a property within the directive class.
The directive name rarely describes what the property does.
The `myClick` directive name is not a good name for a property that emits click messages.

Fortunately, you can have a public name for the property that meets conventional expectations,
while using a different name internally.
In the example immediately above, you are actually binding *through the* `myClick` *alias* to
the directive's own `clicks` property.

You can specify the alias for the property name by passing it into the input/output decorator like this:

<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick" title="src/app/click.directive.ts" linenums="false">
</code-example>

<div class="l-sub-section">

You can also alias property names in the `inputs` and `outputs` arrays.
You write a colon-delimited (`:`) string with
the directive property name on the *left* and the public alias on the *right*:

<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick2" title="src/app/click.directive.ts" linenums="false">
</code-example>

</div>


<hr/>

{@a expression-operators}

{@a 템플릿-표현식-전용-연산자}

<!--
## Template expression operators
-->
## 템플릿 표현식 전용 연산자

The template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover two of these operators: _pipe_ and _safe navigation operator_.

{@a pipe}

### The pipe operator ( <span class="syntax">|</span> )

The result of an expression might require some transformation before you're ready to use it in a binding.
For example, you might display a number as a currency, force text to uppercase, or filter a list and sort it.

Angular [pipes](guide/pipes) are a good choice for small transformations such as these.
Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the **pipe operator (`|`)**:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-1" title="src/app/app.component.html" linenums="false">
</code-example>

The pipe operator passes the result of an expression on the left to a pipe function on the right.

You can chain expressions through multiple pipes:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-2" title="src/app/app.component.html" linenums="false">
</code-example>

And you can also [apply parameters](guide/pipes#parameterizing-a-pipe) to a pipe:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-3" title="src/app/app.component.html" linenums="false">
</code-example>

The `json` pipe is particularly helpful for debugging bindings:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (pipes-json)" region="pipes-json">
</code-example>

The generated output would look something like this

<code-example language="json">
  { "id": 0, "name": "Hercules", "emotion": "happy",
    "birthdate": "1970-02-25T08:00:00.000Z",
    "url": "http://www.imdb.com/title/tt0065832/",
    "rate": 325 }
</code-example>


<hr/>

{@a safe-navigation-operator}

### The safe navigation operator ( <span class="syntax">?.</span> ) and null property paths

The Angular **safe navigation operator (`?.`)** is a fluent and convenient way to
guard against null and undefined values in property paths.
Here it is, protecting against a view render failure if the `currentHero` is null.

<code-example path="template-syntax/src/app/app.component.html" region="safe-2" title="src/app/app.component.html" linenums="false">
</code-example>

What happens when the following data bound `title` property is null?

<code-example path="template-syntax/src/app/app.component.html" region="safe-1" title="src/app/app.component.html" linenums="false">
</code-example>

The view still renders but the displayed value is blank; you see only "The title is" with nothing after it.
That is reasonable behavior. At least the app doesn't crash.

Suppose the template expression involves a property path, as in this next example
that displays the `name` of a null hero.

<code-example language="html">
  The null hero's name is {{nullHero.name}}
</code-example>

JavaScript throws a null reference error, and so does Angular:

<code-example format="nocode">
  TypeError: Cannot read property 'name' of null in [null].
</code-example>

Worse, the *entire view disappears*.

This would be reasonable behavior if the `hero` property could never be null.
If it must never be null and yet it is null,
that's a programming error that should be caught and fixed.
Throwing an exception is the right thing to do.

On the other hand, null values in the property path may be OK from time to time,
especially when the data are null now and will arrive eventually.

While waiting for data, the view should render without complaint, and
the null property path should display as blank just as the `title` property does.

Unfortunately, the app crashes when the `currentHero` is null.

You could code around that problem with [*ngIf*](guide/template-syntax#ngIf).

<code-example path="template-syntax/src/app/app.component.html" region="safe-4" title="src/app/app.component.html" linenums="false">
</code-example>

You could try to chain parts of the property path with `&&`, knowing that the expression bails out
when it encounters the first null.

<code-example path="template-syntax/src/app/app.component.html" region="safe-5" title="src/app/app.component.html" linenums="false">
</code-example>

These approaches have merit but can be cumbersome, especially if the property path is long.
Imagine guarding against a null somewhere in a long property path such as `a.b.c.d`.

The Angular safe navigation operator (`?.`) is a more fluent and convenient way to guard against nulls in property paths.
The expression bails out when it hits the first null value.
The display is blank, but the app keeps rolling without errors.

<code-example path="template-syntax/src/app/app.component.html" region="safe-6" title="src/app/app.component.html" linenums="false">
</code-example>

It works perfectly with long property paths such as `a?.b?.c?.d`.


<hr/>

{@a non-null-assertion-operator}

### The non-null assertion operator ( <span class="syntax">!</span> )

As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is _unintentionally_ null or undefined.

In this mode, typed variables disallow null and undefined by default. The type checker throws an error if you leave a variable unassigned or try to assign null or undefined to a variable whose type disallows null and undefined.

The type checker also throws an error if it can't determine whether a variable will be null or undefined at runtime.
You may know that can't happen but the type checker doesn't know.
You tell the type checker that it can't happen by applying the post-fix
[_non-null assertion operator (!)_](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").

The _Angular_ **non-null assertion operator (`!`)** serves the same purpose in an Angular template.

For example, after you use [*ngIf*](guide/template-syntax#ngIf) to check that `hero` is defined, you can assert that
`hero` properties are also defined.

<code-example path="template-syntax/src/app/app.component.html" region="non-null-assertion-1" title="src/app/app.component.html" linenums="false">
</code-example>

When the Angular compiler turns your template into TypeScript code,
it prevents TypeScript from reporting that `hero.name` might be null or undefined.

Unlike the [_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)"),
the **non-null assertion operator** does not guard against null or undefined.
Rather it tells the TypeScript type checker to suspend strict null checks for a specific property expression.

You'll need this template operator when you turn on strict null checks. It's optional otherwise.


<a href="#top-of-page">back to top</a>

<hr/>

{@a any-type-cast-function}

## The `$any` type cast function (`$any( <expression> )`) 

Sometimes a binding expression will be reported as a type error and it is not possible or difficult
to fully specify the type. To silence the error, you can use the `$any` cast function to cast
the expression to [the `any` type](http://www.typescriptlang.org/docs/handbook/basic-types.html#any).

<code-example path="template-syntax/src/app/app.component.html" region="any-type-cast-function-1" title="src/app/app.component.html" linenums="false">
</code-example>

In this example, when the Angular compiler turns your template into TypeScript code, 
it prevents TypeScript from reporting that `marker` is not a member of the `Hero`
interface.

The `$any` cast function can be used in conjunction with `this` to allow access to undeclared members of
the component.

<code-example path="template-syntax/src/app/app.component.html" region="any-type-cast-function-2" title="src/app/app.component.html" linenums="false">
</code-example>

The `$any` cast function can be used anywhere in a binding expression where a method call is valid.

## Summary
You've completed this survey of template syntax.
Now it's time to put that knowledge to work on your own components and directives.
