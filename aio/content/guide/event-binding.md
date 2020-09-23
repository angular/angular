<!--
# Event binding `(event)`
-->
# 이벤트 바인딩 `(event)`

<!--
Event binding allows you to listen for certain events such as
keystrokes, mouse movements, clicks, and touches.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

Angular event binding syntax consists of a **target event** name
within parentheses on the left of an equal sign, and a quoted
template statement on the right.
The following event binding listens for the button's click events, calling
the component's `onSave()` method whenever a click occurs:

<div class="lightbox">
  <img src='generated/images/guide/template-syntax/syntax-diagram.svg' alt="Syntax diagram">
</div>
-->
이벤트 바인딩 문법을 활용하면 키입력이나 마우스 이동, 클릭, 터치 이벤트에 반응할 수 있습니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

Angular 이벤트 바인딩 문법은 소괄호(`(`, `)`) 안에 **대상이 되는 이벤트**의 이름을 지정하고 등호(`=`)를 붙인 후 템플릿 실행문을 작성하면 됩니다.
그래서 버튼에서 발생하는 클릭 이벤트를 감지하다가 이벤트가 발생했을 때 컴포넌트에 정의된 `onSave()` 메소드를 실행하려면 이렇게 작성하면 됩니다:

<div class="lightbox">
  <img src='generated/images/guide/template-syntax/syntax-diagram.svg' alt="Syntax diagram">
</div>


<!--
## Target event
-->
## 대상 이벤트

<!--
As above, the target is the button's click event.

<code-example path="event-binding/src/app/app.component.html" region="event-binding-1" header="src/app/app.component.html"></code-example>

Alternatively, use the `on-` prefix, known as the canonical form:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-2" header="src/app/app.component.html"></code-example>

Element events may be the more common targets, but Angular looks first to see if the name matches an event property
of a known directive, as it does in the following example:

<code-example path="event-binding/src/app/app.component.html" region="custom-directive" header="src/app/app.component.html"></code-example>

If the name fails to match an element event or an output property of a known directive,
Angular reports an “unknown directive” error.
-->
위에서 살펴본 예제에서 바인딩 대상이 되는 이벤트는 버튼에서 발생하는 클릭 이벤트입니다.

<code-example path="event-binding/src/app/app.component.html" region="event-binding-1" header="src/app/app.component.html"></code-example>

소괄호를 사용하지 않고 `on-` 접두사를 붙여서 바인딩하는 방법도 있습니다:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-2" header="src/app/app.component.html"></code-example>

엘리먼트에 이벤트 바인딩을 사용할 때 표준 DOM 이벤트 뿐 아니라 커스텀 이벤트도 바인딩할 수 있습니다.
디렉티브에서 발생하는 커스텀 이벤트 `myClick`을 바인딩하려면 다음과 같이 작성하면 됩니다:

<code-example path="event-binding/src/app/app.component.html" region="custom-directive" header="src/app/app.component.html"></code-example>

바인딩 대상이 되는 이벤트를 찾지 못하면 "unknown directive" 에러가 발생합니다.


<!--
## *$event* and event handling statements
-->
## *$event* 객체와 이벤트 핸들링 실행문

<!--
In an event binding, Angular sets up an event handler for the target event.

When the event is raised, the handler executes the template statement.
The template statement typically involves a receiver, which performs an action
in response to the event, such as storing a value from the HTML control
into a model.

The binding conveys information about the event. This information can include data values such as an event object, string, or number named `$event`.

The target event determines the shape of the `$event` object.
If the target event is a native DOM element event, then `$event` is a
[DOM event object](https://developer.mozilla.org/en-US/docs/Web/Events),
with properties such as `target` and `target.value`.

Consider this example:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-3" header="src/app/app.component.html"></code-example>

This code sets the `<input>` `value` property by binding to the `name` property.
To listen for changes to the value, the code binds to the `input`
event of the `<input>` element.
When the user makes changes, the `input` event is raised, and the binding executes
the statement within a context that includes the DOM event object, `$event`.

To update the `name` property, the changed text is retrieved by following the path `$event.target.value`.

If the event belongs to a directive&mdash;recall that components
are directives&mdash;`$event` has whatever shape the directive produces.
-->
이벤트 바인딩 문법은 대상 이벤트와 이벤트 핸들러를 연결하는 것이라고도 볼 수 있습니다.

그래서 이벤트가 발생하면 이벤트 핸들러가 템플릿 실행문을 실행합니다.
템플릿 실행문은 일반적으로 인자를 받도록 정의하며, 이렇게 받은 인자를 모델에 반영하는 방식으로 구현합니다.

이벤트 바인딩 문법을 작성하면서 이벤트에 대한 정보를 추가로 제공할 수 있습니다.
이 정보는 `$event` 변수로 전달되는데, 이 변수는 객체, 문자열, 숫자 등 어떠한 형태로도 가능합니다.

`$event` 객체의 타입은 대상 이벤트에 따라 결정됩니다.
대상 이벤트가 표준 DOM 엘리먼트 이벤트라면 `$event`는 [DOM 이벤트 객체](https://developer.mozilla.org/en-US/docs/Web/Events)이며, 이 객체 안에서 `target`이나 `target.value`와 같은 프로퍼티도 참조할 수 있습니다.

예제를 살펴봅시다:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-3" header="src/app/app.component.html"></code-example>

이렇게 작성하면 `currentItem.name` 프로퍼티 값으로 `<input>` 엘리먼트의 `value` 프로퍼티 값이 할당됩니다.
그리고 `<input>` 엘리먼트의 값이 변경되는 것을 감지하기 위해 `input` 이벤트를 바인딩했습니다.
이제 사용자가 `<input>` 엘리먼트의 값을 변경하면 `input` 이벤트가 발생하고, 바인딩된 실행문이 실행되면서 DOM 이벤트 객체를 `$event`로 전달합니다.

그리고 `$event.target.value`로 받은 문자열을 `currentItem.name` 프로퍼티에 할당해서 프로퍼티 값을 갱신합니다.

디렉티브에서 발생하는 이벤트라면 `$event` 객체의 타입은 디렉티브에서 결정합니다.
컴포넌트도 디렉티브라는 것을 잊지 마세요.


{@a custom-events-with-eventemitter}
<!--
## Custom events with `EventEmitter`
-->
## `EventEmitter`로 커스텀 이벤트 생성하기

<!--
Directives typically raise custom events with an Angular [EventEmitter](api/core/EventEmitter).
The directive creates an `EventEmitter` and exposes it as a property.
The directive calls `EventEmitter.emit(payload)` to fire an event, passing in a message payload, which can be anything.
Parent directives listen for the event by binding to this property and accessing the payload through the `$event` object.

Consider an `ItemDetailComponent` that presents item information and responds to user actions.
Although the `ItemDetailComponent` has a delete button, it doesn't know how to delete the hero. It can only raise an event reporting the user's delete request.

Here are the pertinent excerpts from that `ItemDetailComponent`:

<code-example path="event-binding/src/app/item-detail/item-detail.component.html" header="src/app/item-detail/item-detail.component.html (template)" region="line-through"></code-example>

<code-example path="event-binding/src/app/item-detail/item-detail.component.ts" header="src/app/item-detail/item-detail.component.ts (deleteRequest)" region="deleteRequest"></code-example>

The component defines a `deleteRequest` property that returns an `EventEmitter`.
When the user clicks *delete*, the component invokes the `delete()` method,
telling the `EventEmitter` to emit an `Item` object.

Now imagine a hosting parent component that binds to the `deleteRequest` event
of the `ItemDetailComponent`.

<code-example path="event-binding/src/app/app.component.html" header="src/app/app.component.html (event-binding-to-component)" region="event-binding-to-component"></code-example>

When the `deleteRequest` event fires, Angular calls the parent component's
`deleteItem()` method, passing the *item-to-delete* (emitted by `ItemDetail`)
in the `$event` variable.
-->
디렉티브에서 Angular [EventEmitter](api/core/EventEmitter) 클래스를 활용하면 커스텀 이벤트를 발생시킬 수 있습니다.
디렉티브에 `EventEmitter` 타입으로 프로퍼티를 선언하면 `EventEmitter.emit()`를 실행해서 이벤트를 생성할 수 있으며, 이 함수를 실행할 때 인자에 메시지를 실어 디렉티브 외부로 보낼 수 있습니다.
그러면 부모 디렉티브에서 이 이벤트가 발생하는 것을 감지하고 있다가 `$event` 객체로 자식 디렉티브에서 보낸 페이로드를 받아 활용하면 됩니다.

`ItemDetailComponent`는 히어로의 세부정보를 화면에 표시하고 사용자의 입력에 처리하는 컴포넌트입니다.
그리고 `ItemDetailComponent`에는 삭제 버튼이 하나 있는데, `ItemDetailComponent`에서는 히어로를 삭제하는 방법을 알지 못합니다.
이 컴포넌트는 사용자가 삭제 요청을 보냈다는 이벤트를 발생시키는 역할만 합니다.

`ItemDetailComponent` 코드를 봅시다:

<code-example path="event-binding/src/app/item-detail/item-detail.component.html" header="src/app/item-detail/item-detail.component.html (템플릿)" region="line-through"></code-example>

<code-example path="event-binding/src/app/item-detail/item-detail.component.ts" header="src/app/item-detail/item-detail.component.ts (deleteRequest())" region="deleteRequest"></code-example>

컴포넌트에 정의된 `deleteRequest` 프로퍼티는 `EventEmitter` 타입으로 선언되어 있습니다.
그리고 사용자가 *delete* 버튼을 클릭하면 `delete()` 메소드를 실행하며 `EventEmitter` 클래스를 통해 `Item` 객체를 컴포넌트 외부로 보냅니다.

부모 컴포넌트에서는 `deleteRequest` 이벤트를 `deleteItem()` 메서드와 바인딩하고 있습니다.

<code-example path="event-binding/src/app/app.component.html" header="src/app/app.component.html (event-binding-to-component)" region="event-binding-to-component"></code-example>

이제 `deleteRequest` 이벤트가 발생하면 부모 컴포넌트의 `deleteItem()` 메서드가 실행됩니다.
그리고 이 때 `$event` 변수를 통해 자식 컴포넌트에서 보낸 데이터가 전달됩니다.


<!--
## Template statements have side effects
-->
## 템플릿 실행문은 부수효과를 유발합니다.

<!--
Though [template expressions](guide/interpolation#template-expressions) shouldn't have [side effects](guide/property-binding#avoid-side-effects), template
statements usually do. The `deleteItem()` method does have
a side effect: it deletes an item.

Deleting an item updates the model, and depending on your code, triggers
other changes including queries and saving to a remote server.
These changes propagate through the system and ultimately display in this and other views.
-->
[템플릿 표현식(template expressions)](guide/interpolation#template-expressions)은 [부수효과(side effects)](guide/property-binding#avoid-side-effects)를 유발하지 않아야 하지만, 템플릿 실행문(template statement)은 부수효과를 일으켜야 합니다.
`deleteItem()` 메소드도 히어로를 삭제하는 부수효과를 유발합니다.

이 때 부수효과라는 것은 모델의 값을 갱신하거나, 새로운 데이터를 조회하는 작업, 리모트 서버에 저장하는 등과 같은 작업을 모두 포함합니다.
결국 어떤 이벤트가 발생하면 부수효과를 발생시켜 전체 시스템에 영향을 주며, 원하는 동작을 수행해서 사용자가 원하는 결과를 만들어낼 수 있습니다.