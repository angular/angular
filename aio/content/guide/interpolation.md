<!--
# Interpolation and template expressions
-->
# 문자열 바인딩과 템플릿 표현식

<!--
Interpolation allows you to incorporate calculated strings into the text
between HTML element tags and within attribute assignments. Template
expressions are what you use to calculate those strings.

<div class="alert is-helpful">

See the <live-example></live-example> for all of
the syntax and code snippets in this guide.

</div>
-->
문자열 바인딩(interpolation)을 활용하면 문자열이 계산된 결과를 HTML 엘리먼트나 어트리뷰트에 할당할 수 있습니다.
그리고 이런 방식으로 사용되는 문자열을 템플릿 표현식(template expression)이라고 합니다.

<div class="alert is-helpful">

이 문서에서 설명하는 내용은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
## Interpolation `{{...}}`
-->
## 문자열 바인딩 `{{...}}`

<!--
Interpolation refers to embedding expressions into marked up text.
By default, interpolation uses as its delimiter the double curly braces, `{{` and `}}`.

In the following snippet, `{{ currentCustomer }}` is an example of interpolation.

<code-example path="interpolation/src/app/app.component.html" region="interpolation-example1" header="src/app/app.component.html"></code-example>

The text between the braces is often the name of a component
property. Angular replaces that name with the
string value of the corresponding component property.

<code-example path="interpolation/src/app/app.component.html" region="component-property" header="src/app/app.component.html"></code-example>

In the example above, Angular evaluates the `title` and `itemImageUrl` properties
and fills in the blanks, first displaying some title text and then an image.

More generally, the text between the braces is a **template expression**
that Angular first **evaluates** and then **converts to a string**.
The following interpolation illustrates the point by adding two numbers:

<code-example path="interpolation/src/app/app.component.html" region="convert-string" header="src/app/app.component.html"></code-example>

The expression can invoke methods of the host component such as `getVal()` in
the following example:

<code-example path="interpolation/src/app/app.component.html" region="invoke-method" header="src/app/app.component.html"></code-example>

Angular evaluates all expressions in double curly braces,
converts the expression results to strings, and links them with neighboring literal strings. Finally,
it assigns this composite interpolated result to an **element or directive property**.

You appear to be inserting the result between element tags and assigning it to attributes.
However, interpolation is a special syntax that Angular converts into a *property binding*.

<div class="alert is-helpful">

If you'd like to use something other than `{{` and `}}`, you can
configure the interpolation delimiter via the
[interpolation](api/core/Component#interpolation)
option in the `Component` metadata.

</div>
-->
템플릿 표현식을 HTML 엘리먼트에 할당하는 문법을 문자열 바인딩이라고 합니다.
일반적으로 문자열 바인딩은 이중 중괄호 `{{`, `}}`를 사용합니다.

아래 예제 코드에서 `{{ currentCustomer }}`라고 작성한 부분이 문자열 바인딩을 사용한 코드입니다.

<code-example path="interpolation/src/app/app.component.html" region="interpolation-example1" header="src/app/app.component.html"></code-example>

이중 중괄호 안에는 보통 컴포넌트 프로퍼티를 사용하는 것이 일반적입니다.
Angular는 컴포넌트에서 이 프로퍼티를 찾아서 프로퍼티 값을 템플릿에 할당합니다.

<code-example path="interpolation/src/app/app.component.html" region="component-property" header="src/app/app.component.html"></code-example>

이렇게 작성하면 Angular가 `title`, `itemImageUrl` 프로퍼티의 값을 찾아서 템플릿에 할당합니다.
그래서 결국 제목과 이미지가 화면에 표시됩니다.

좀 더 일반적으로 설명하면, 이중 중괄호 안에 사용되는 문자열을 **템플릿 표현식(template expression)**라고 하며, Angular가 가장 처음 **평가**해서 **문자열로 변환**하는 항목입니다.
문자열 바인딩을 사용해서 숫자 2개를 더해 봅시다:

<code-example path="interpolation/src/app/app.component.html" region="convert-string" header="src/app/app.component.html"></code-example>

템플릿 표현식은 호스트 컴포넌트의 메서드를 실행할 수 있습니다.
그래서 컴포넌트에 있는 `getVal()` 메서드를 사용한다면 이렇게 작성하면 됩니다:

<code-example path="interpolation/src/app/app.component.html" region="invoke-method" header="src/app/app.component.html"></code-example>

이중 중괄호 안에 있는 템플릿 표현식은 모두 Angular가 평가해서 문자열로 변환하며, 해당 문맥에 맞게 할당합니다.
그래서 **엘리먼트나 디렉티브의 프로퍼티**에 문자열 바인딩을 사용하면 템플릿 표현식이 평가된 문자열이 할당됩니다.

문자열 바인딩은 엘리먼트 태그나 어트리뷰트에 사용되는 것을 많이 볼 수 있습니다.
하지만 이 문법은 *프로퍼티 바인딩*에도 사용됩니다.

<div class="alert is-helpful">

문자열 바인딩 문법을 `{{`, `}}` 말고 다른 기호로 사용하려면 컴포넌트 메타데이터에 [interpolation](api/core/Component#interpolation) 옵션을 지정하면 됩니다.

</div>


{@a template-expressions}
<!--
## Template expressions
-->
## 템플릿 표현식

<!--
A template **expression** produces a value and appears within the double
curly braces, `{{ }}`.
Angular executes the expression and assigns it to a property of a binding target;
the target could be an HTML element, a component, or a directive.

The interpolation braces in `{{1 + 1}}` surround the template expression `1 + 1`.
In the property binding,
a template expression appears in quotes to the right of the&nbsp;`=` symbol as in `[property]="expression"`.

In terms of syntax, template expressions are similar to JavaScript.
Many JavaScript expressions are legal template expressions, with a few exceptions.

You can't use JavaScript expressions that have or promote side effects,
including:

* Assignments (`=`, `+=`, `-=`, `...`)
* Operators such as `new`, `typeof`, `instanceof`, etc.
* Chaining expressions with <code>;</code> or <code>,</code>
* The increment and decrement operators `++` and `--`
* Some of the ES2015+ operators

Other notable differences from JavaScript syntax include:

* No support for the bitwise operators such as `|` and `&`
* New [template expression operators](guide/template-expression-operators), such as `|`, `?.` and `!`
-->
이중 중괄호 `{{ }}` 안에 템플릿 표현식(template expression)을 사용하면 표현식의 평가 결과가 해당 부분에 할당됩니다.
그래서 Angular는 템플릿 표현식이 평가된 결과를 사용해서 HTML 엘리먼트나 컴포넌트, 디렉티브에 프로퍼티 바인딩 할 수 있습니다.

`{{1 + 1}}` 라는 문자열 바인딩 문법에서 템플릿 표현식은 `1 + 1` 부분입니다.
그리고 `[프로퍼티]="표현식"`과 같이 프로퍼티 바인딩에 사용할 때는 등호(`=`) 오른쪽에 사용된 부분이 템플릿 표현식입니다.

문법 측면에서 따져보면 템플릿 표현식은 JavaScript와 비슷합니다.
실제로도 일부 예외를 제외하면 JavaScript의 문법 대부분을 템플릿 표현식에 사용할 수 있습니다.

하지만 JavaScript 표현식 중 부수 효과를 발생시키는 다음 항목들은 사용할 수 없습니다:

* 할당 표현: `=`, `+=`, `-=`, `...`
* `new`, `typeof`, `instanceof` 연산자
* <code>;</code>와 <code>,</code>를 사용한 체이닝 표현식
* 증감연산자:`++`, `--`
* ES2015+ 에 도입된 연산자 일부

그리고 이런 문법도 사용할 수 없습니다:

* 비트 연산자: `|`,  `&`
* 새로 도입된 [템플릿 표현식 연산자](guide/template-expression-operators): `|`, `?.`, `!`


<!--
## Expression context
-->
## 표현식의 컨텍스트

<!--
The *expression context* is typically the _component_ instance.
In the following snippets, the `recommended` within double curly braces and the
`itemImageUrl2` in quotes refer to properties of the `AppComponent`.

<code-example path="interpolation/src/app/app.component.html" region="component-context" header="src/app/app.component.html"></code-example>

An expression may also refer to properties of the _template's_ context
such as a template input variable,
<!- link to built-in-directives#template-input-variables ->
`let customer`, or a template reference variable, `#customerInput`.
<!- link to guide/template-ref-variables ->

<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (template input variable)"></code-example>

<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (template reference variable)"></code-example>

The context for terms in an expression is a blend of the _template variables_,
the directive's _context_ object (if it has one), and the component's _members_.
If you reference a name that belongs to more than one of these namespaces,
the template variable name takes precedence, followed by a name in the directive's _context_,
and, lastly, the component's member names.

The previous example presents such a name collision. The component has a `customer`
property and the `*ngFor` defines a `customer` template variable.

<div class="alert is-helpful">

The `customer` in `{{customer.name}}`
refers to the template input variable, not the component's property.

Template expressions cannot refer to anything in
the global namespace, except `undefined`. They can't refer to
`window` or `document`. Additionally, they
can't call `console.log()` or `Math.max()` and they are restricted to referencing
members of the expression context.

</div>
-->
*표현식의 컨텍스트*는 일반적으로 _컴포넌트_ 인스턴스 범위입니다.
아래 예제에서도 이중 중괄호 안에 사용된 `recommended`와 `itemImageUrl2`는 모두 `AppComponent`에 있는 프로퍼티를 가리킵니다.

<code-example path="interpolation/src/app/app.component.html" region="component-context" header="src/app/app.component.html"></code-example>

그런데 템플릿 표현식은 `let customer`와 같은 템플릿 입력 변수나 `#customerInput`과 같은 템플릿 참조 변수와 같이 _템플릿 안_ 에 있는 프로퍼티를 가리킬 수도 있습니다.

<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (템플릿 입력 변수)"></code-example>

<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (템플릿 참조 변수)"></code-example>

결국 템플릿 표현식의 컨텍스트는 _템플릿 변수_ 와 디렉티브 _context_ 객체, 컴포넌트 _멤버_ 가 섞여 있는 범위라고 볼 수 있습니다.
이 중 여러 네임스페이스에 속한 이름이 언급되면 템플릿 변수, 디렉티브의 _context_ 객체, 컴포넌트 멤버 순으로 참조합니다.

위에서 살펴본 예제에서도 이름이 충돌하는 경우가 있었습니다.
컴포넌트에 `customer` 프로퍼티가 있지만 `*ngFor`에서도 따로 템플릿 변수 `customer`를 선언했습니다.

<div class="alert is-helpful">

`{{customer.name}}`에 사용된 `customer`는 컴포넌트 프로퍼티가 아니라 템플릿 입력 변수를 가리킵니다.

템플릿 표현식은 `undefined` 외에는 전역 네임스페이스에 있는 어떠한 것도 참조할 수 없습니다.
그래서 `window`나 `document` 객체를 참조할 수 없으며, `console.log()`, `Math.max()`와 같은 함수도 사용할 수 없습니다.

</div>


<!--
## Expression guidelines
-->
## 표현식 가이드라인

<!--
When using template expressions follow these guidelines:

* [Simplicity](guide/interpolation#simplicity)
* [Quick execution](guide/interpolation#quick-execution)
* [No visible side effects](guide/interpolation#no-visible-side-effects)
-->
템플릿 표현식은 다음 가이드라인을 따라 작성하는 것을 권장합니다:

* [간결하게](guide/interpolation#simplicity)
* [빠르게 실행되도록](guide/interpolation#quick-execution)
* [부수효과 최소화](guide/interpolation#no-visible-side-effects)


{@a simplicity}
<!--
### Simplicity
-->
### 간결하게

<!--
Although it's possible to write complex template expressions, it's a better
practice to avoid them.

A property name or method call should be the norm, but an occasional Boolean negation, `!`, is OK.
Otherwise, confine application and business logic to the component,
where it is easier to develop and test.
-->
템플릿 표현식에는 복잡한 로직도 작성할 수 있지만 이런 로직은 피하는 것이 좋습니다.

프로퍼티 이름으로 참조하거나 메서드를 간단하게 실행하는 것이 가장 좋으며 불리언 반전 연산자 `!`를 사용하는 것까지도 괜찮습니다.
이것보다 복잡한 애플리케이션 로직이나 비즈니스 로직은 컴포넌트에 작성해야 개발하기 편하고 테스트하기도 쉽습니다.


{@a quick-execution}
<!--
### Quick execution
-->
### 빠르게 실행되도록

<!--
Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as
promise resolutions, HTTP results, timer events, key presses and mouse moves.

Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values when their computation is expensive.
-->
템플릿 표현식은 Angular 변화 감지 싸이클이 실행될 때마다 실행됩니다.
그리고 변화 감지 싸이클은 Promise 상태 변화, HTTP 응답, 타이머 이벤트, 키 이벤트, 마우스 이벤트가 발생할 때마다 계속 실행됩니다.

그래서 템플릿 표현식은 최대한 빠르게 실행되어야 사용자가 불편함을 느끼지 않으며, 성능이 좋지 않은 장비일수록 더 중요합니다.
연산이 오래 걸리는 로직은 캐싱하는 방법도 고려해 보세요.


{@a no-visible-side-effects}
<!--
### No visible side effects
-->
### 부수효과 최소화

<!--
A template expression should not change any application state other than the value of the
target property.

This rule is essential to Angular's "unidirectional data flow" policy.
You should never worry that reading a component value might change some other displayed value.
The view should be stable throughout a single rendering pass.

An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is ideal because
it is free of side effects and improves Angular's change detection performance.
In Angular terms, an idempotent expression always returns
*exactly the same thing* until one of its dependent values changes.

Dependent values should not change during a single turn of the event loop.
If an idempotent expression returns a string or a number, it returns the same string or number when called twice in a row. If the expression returns an object, including an `array`, it returns the same object *reference* when called twice in a row.

<div class="alert is-helpful">

There is one exception to this behavior that applies to `*ngFor`. `*ngFor` has `trackBy` functionality that can deal with referential inequality of objects when iterating over them. See [`*ngFor` with `trackBy`](guide/built-in-directives#ngfor-with-trackby) for details.

</div>
-->
템플릿 표현식은 대상이 되는 프로퍼티 외에는 애플리케이션 상태를 변경하지 않는 것이 좋습니다.

이 규칙은 Angular가 제안하는 "단방향 데이터 흐름" 정책 측면에서도 중요합니다.
컴포넌트 값을 읽기만 했는데 다른 값이 변경되는 상황은 피해야 합니다.
화면은 한 번 렌더링되는 동안 다른 상태로 변경되지 않아야 합니다.

그래서 [멱등성(idempotent)](https://en.wikipedia.org/wiki/Idempotence)을 갖춘 표현식을 사용하는 것이 이상적입니다.
왜냐하면 멱등성을 갖춘 표현식을 사용하면 부수효과를 발생시키지 않으며 Angular의 변화감지 성능도 끌어올릴 수 있기 때문입니다.
Angular의 관점에서 설명하면, 멱등성을 갖춘 표현식은 표현식에 사용된 값이 변하지 않는 한 언제나 *같은 값*을 반환합니다.

개별 변수의 값도 이벤트 루프가 한 번 실행되는 동안 변경되면 안됩니다.
멱등성을 갖춘 표현식이 어떤 값을 반환한다면 이 표현식은 다시 실행되어도 같은 값을 반환해야 합니다.
그리고 표현식이 객체(`array` 포함)를 반환한다면 다시 실행되어도 같은 객체를 *참조*해야 합니다.

<div class="alert is-helpful">

이 규칙의 예외가 되는 경우는 `*ngFor`를 사용할때 뿐입니다.
`*ngFor`는 순회하는 객체가 변경되는 것을 감지하기 위해 `trackBy` 옵션을 제공합니다.
자세한 내용은 [`*ngFor`에 `trackBy` 사용하기](guide/built-in-directives#ngfor-with-trackby) 문서를 참고하세요.

</div>