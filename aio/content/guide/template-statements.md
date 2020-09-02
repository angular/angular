<!--
# Template statements
-->
# 템플릿 실행문

<!--
A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.

<div class="alert is-helpful">

See the <live-example name="template-syntax">Template syntax</live-example> for
the syntax and code snippets in this guide.

</div>

The following template statement appears in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

A template statement *has a side effect*.
That's the whole point of an event.
It's how you update application state from user action.

Responding to events is the other side of Angular's "unidirectional data flow".
You're free to change anything, anywhere, during this turn of the event loop.

Like template expressions, template *statements* use a language that looks like JavaScript.
The template statement parser differs from the template expression parser and
specifically supports both basic assignment (`=`) and chaining expressions with <code>;</code>.

However, certain JavaScript and template expression syntax is not allowed:

* <code>new</code>
* increment and decrement operators, `++` and `--`
* operator assignment, such as `+=` and `-=`
* the bitwise operators, such as `|` and `&`
* the [pipe operator](guide/template-expression-operators#pipe)
-->
템플릿 **실행문(statement)**은 엘리먼트, 컴포넌트, 디렉티브와 같은 바인딩 대상에서 **이벤트**가 발생했을 때 실행되는 구문입니다.

<div class="alert is-helpful">

이 문서에서 설명하는 내용은 <live-example name="template-syntax">Template syntax</live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

`(이벤트)="실행문"` 라는 구문이 있다면 등호(`=`) 오른쪽에 작성된 것이 템플릿 실행문입니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

템플릿 실행문은 *부수 효과(side effect)* 를 발생시킵니다.
그리고 이런 부수 효과를 발생시키는 것이 이벤트가 발생하는 목적이라고 할 수 있습니다.
그래서 사용자의 동작이 있을 때 애플리케이션 상태를 변경하는 로직을 템플릿 실행문에 작성합니다.

이벤트에 반응하는 것은 Angular가 제안하는 "단방향 데이터 흐름"의 한 방향입니다.
이벤트 루프가 실행되는 동안 어디에 있는 무엇이라도 자유롭게 수정할 수 있습니다.

템플릿 *실행문*의 문법은 템플릿 표현식(template expression)처럼 JavaScript 문법과 비슷합니다.
하지만 템플릿 실행문 파서는 템플릿 표현식 파서와 다르기 때문에 템플릿 실행문에는 할당 연산자(`=`)를 사용할 수 있으며 세미 콜론(`;`)을 사용한 체이닝 문법도 사용할 수 있습니다.

하지만 이런 문법은 사용할 수 없습니다:

* <code>new</code>
* 증감연산자: `++`, `--`
* 복합연산자: `+=`, `-=`
* 비트 연산자: `|`, `&`
* [파이프 연산자](guide/template-expression-operators#pipe)


<!--
## Statement context
-->
## 템플릿 실행문의 컨텍스트

<!--
As with expressions, statements can refer only to what's in the statement context
such as an event handling method of the component instance.

The *statement context* is typically the component instance.
The *deleteHero* in `(click)="deleteHero()"` is a method of the data-bound component.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

The statement context may also refer to properties of the template's own context.
In the following examples, the template `$event` object,
a [template input variable](guide/built-in-directives#template-input-variable) (`let hero`),
and a [template reference variable](guide/template-reference-variables) (`#heroForm`)
are passed to an event handling method of the component.

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" header="src/app/app.component.html"></code-example>

Template context names take precedence over component context names.
In `deleteHero(hero)` above, the `hero` is the template input variable,
not the component's `hero` property.
-->
템플릿 실행문도 템플릿 표현식과 마찬가지로 독립적인 컨텍스트 안에서 동작합니다.

*템플릿 실행문의 컨텍스트*는 일반적으로 컴포넌트 인스턴스와 같습니다.
그래서 `(click)="deleteHero()"`라고 작성했을 때 실행되는 `deleteHero()`는 컴포넌트 안에 있는 메서드를 가리킵니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html"></code-example>

템플릿 실행문 컨텍스트 안에서는 템플릿 컨텍스트에 있는 프로퍼티를 참조할 수도 있습니다.
그래서 아래 예제처럼 템플릿에 있는 `$event` 객체를 참조할 수 있고, `let hero`와 같은 [템플릿 입력 변수](guide/built-in-directives#template-input-variable)도 참조할 수 있으며, `#heroForm`과 같은 [템플릿 참조 변수](guide/template-reference-variables)도 참조할 수 있습니다.
이렇게 참조한 객체는 컴포넌트 메서드를 실행하면서 객체로 전달할 수 있습니다.

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" header="src/app/app.component.html"></code-example>

컨텍스트 안에서 이름이 겹치면 컴포넌트보다 템플릿에 있는 객체가 우선순위를 갖습니다.
그래서 위 예제에서 `deleteHero(hero)`라고 작성했을 때 참조하는 `hero`는 컴포넌트에 있는 프로퍼티가 아니라 템플릿 입력 변수입니다.


<!--
## Statement guidelines
-->
## 템플릿 실행문 작성 가이드라인

<!--
Template statements cannot refer to anything in the global namespace. They
can't refer to `window` or `document`.
They can't call `console.log` or `Math.max`.

As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.
-->
템플릿 실행문 안에서는 전역 네임스페이스에 있는 객체를 참조할 수 없습니다.
그래서 `window`, `document` 객체를 참조할 수 없으며, `console.log()`, `Math.max()`와 같은 표현도 사용할 수 없습니다.

그리고 템플릿 표현식과 비슷하게 템플릿 실행문에도 복잡한 로직은 작성하지 않는 것이 좋습니다.
메서드를 실행하거나 프로퍼티에 값을 할당하는 정도만 사용하는 것이 좋습니다.