<!--
# User Input
-->
# 사용자 입력

<!--
User actions such as clicking a link, pushing a button, and entering
text raise DOM events.
This page explains how to bind those events to component event handlers using the Angular
event binding syntax.

Run the <live-example></live-example>.
-->
DOM 이벤트는 사용자가 링크를 클릭하거나 버튼을 클릭할 때, 그리고 텍스트를 입력할 때 발생합니다.
이 문서는 이렇게 일어나는 이벤트를 컴포넌트와 이벤트 바인딩하고, 컴포넌트 이벤트 핸들러가 이벤트를 어떻게 처리하는지 알아봅니다.

<!--
## Binding to user input events
-->
## 사용자 입력 이벤트 바인딩하기

<!--
You can use [Angular event bindings](guide/template-syntax#event-binding)
to respond to any [DOM event](https://developer.mozilla.org/en-US/docs/Web/Events).
Many DOM events are triggered by user input. Binding to these events provides a way to
get input from the user.
-->
[DOM에서 발생하는 이벤트](https://developer.mozilla.org/en-US/docs/Web/Events)는 [Angular 이벤트 바인딩](guide/template-syntax#이벤트-바인딩) 문법을 사용해서 반응할 수 있습니다.
DOM에서 일어나는 이벤트는 대부분 사용자의 반응에 의해 발생합니다. 그래서 이 이벤트를 확인하면 사용자가 어떤 동작을 하고 있는지 알 수 있습니다.

<!--
To bind to a DOM event, surround the DOM event name in parentheses and assign a quoted
[template statement](guide/template-syntax#template-statements) to it.
-->
DOM 이벤트를 바인딩 하려면, DOM 이벤트 이름을 괄호(`(`, `)`)로 감싸고 [템플릿 실행문](guide/template-syntax#템플릿-실행문)을 연결하면 됩니다.

<!--
The following example shows an event binding that implements a click handler:
-->
아래 예제는 클릭 이벤트와 `onClickMe()` 핸들러를 바인딩하는 예제 코드입니다.

<code-example path="user-input/src/app/click-me.component.ts" region="click-me-button" title="src/app/click-me.component.ts" linenums="false">

</code-example>

{@a click}

<!--
The `(click)` to the left of the equals sign identifies the button's click event as the **target of the binding**.
The text in quotes to the right of the equals sign
is the **template statement**, which responds
to the click event by calling the component's `onClickMe` method.
-->
**바인딩 대상**은 등호(`=`) 왼쪽에 사용된 `(click)`이며, 버튼이 클릭되었을 때 발생하는 이벤트를 뜻합니다.
그리고 등호 오른쪽에 있는 문자열은 **템플릿 실행문**이며, 클릭 이벤트가 발생했을 때 `onClickMe` 메소드를 실행하도록 작성했습니다.

<!--
When writing a binding, be aware of a template statement's **execution context**.
The identifiers in a template statement belong to a specific context object,
usually the Angular component controlling the template.
The example above shows a single line of HTML, but that HTML belongs to a larger component:
-->
이벤트를 바인딩 할 때는 템플릿 실행문이 **실행되는 컨텍스트**가 유효한지 확인해야 합니다.
템플릿 실행문의 컨텍스트는 보통 그 템플릿을 조작하는 컴포넌트로 제한되어 있습니다.
이 예제를 컴포넌트 클래스 코드와 함께 확인해 봅시다:

<code-example path="user-input/src/app/click-me.component.ts" region="click-me-component" title="src/app/click-me.component.ts" linenums="false">

</code-example>


<!--
When the user clicks the button, Angular calls the `onClickMe` method from `ClickMeComponent`.
-->
결국 사용자가 버튼을 클릭하면 Angular가 `ClickMeComponent`에 있는 `onClickMe` 메소드를 실행합니다.

<!--
## Get user input from the $event object
-->
## $event 객체로 입력값 확인하기

<!--
DOM events carry a payload of information that may be useful to the component.
This section shows how to bind to the `keyup` event of an input box to get the user's input after each keystroke.

The following code listens to the `keyup` event and passes the entire event payload (`$event`) to the component event handler.
-->
DOM 이벤트에는 컴포넌트에서 활용할 수 있는 정보가 함께 전달됩니다.
이번에는 입력 필드에서 사용자가 키를 입력했을 때 발생하는 `keyup` 이벤트를 어떻게 활용할 수 있는지 알아봅시다.

`keyup` 이벤트가 발생할 때 생성되는 이벤트 객체(`$event`)를 컴포넌트의 이벤트 핸들러로 전달하려면 다음과 같이 작성합니다.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-template" title="src/app/keyup.components.ts (template v.1)" linenums="false">

</code-example>


<!--
When a user presses and releases a key, the `keyup` event occurs, and Angular provides a corresponding
DOM event object in the `$event` variable which this code passes as a parameter to the component's `onKey()` method.
-->
사용자가 키를 눌렀다가 떼면 `keyup` 이벤트가 발생되며, Angular는 이 이벤트를 `$event` 변수에 할당했다가 템플릿 실행문에 지정된 대로 `onKey()` 메소드의 인자로 전달합니다.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class-no-type" title="src/app/keyup.components.ts (class v.1)" linenums="false">

</code-example>


<!--
The properties of an `$event` object vary depending on the type of DOM event. For example,
a mouse event includes different information than a input box editing event.
-->
`$event` 객체의 프로퍼티는 발생하는 DOM 이벤트에 따라 달라집니다.
그래서 마우스 이벤트와 입력 필드에서 발생하는 이벤트의 구성은 다릅니다.

<!--
All [standard DOM event objects](https://developer.mozilla.org/en-US/docs/Web/API/Event)
have a `target` property, a reference to the element that raised the event.
In this case, `target` refers to the [`<input>` element](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement) and
`event.target.value` returns the current contents of that element.
-->
[표준 DOM 이벤트 객체](https://developer.mozilla.org/en-US/docs/Web/API/Event)에는 이벤트가 발생한 엘리먼트를 가리키는 `target` 프로퍼티가 있습니다.
이 예제에서는 `target` 프로퍼티가 [`<input>` 엘리먼트](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement)를 가리키며, 이 입력 필드의 현재값은 `event.target.value`로 확인할 수 있습니다.

<!--
After each call, the `onKey()` method appends the contents of the input box value to the list
in the component's `values` property, followed by a  separator character (|).
The [interpolation](guide/template-syntax#interpolation)
displays the accumulating input box changes from the `values` property.
-->
`onKey()` 메소드가 실행될 때마다 변하는 값을 컴포넌트의 `values` 프로퍼티에 할당해서 화면에 표시해 봅시다.
위 코드는 이벤트가 발생할 때마다 현재값에 구분 기호(|)를 붙여서 계속 연결하며, 템플릿에는 [문자열 바인딩](guide/template-syntax#interpolation)으로 연결했습니다.

<!--
Suppose the user enters the letters "abc", and then backspaces to remove them one by one.
Here's what the UI displays:
-->
사용자가 "abc"를 차례대로 입력한 이후에 백스페이스로 모두 지웠다고 합시다.
그러면 화면에는 다음과 같이 표시됩니다:

<code-example>
  a | ab | abc | ab | a | |
</code-example>



<figure>
  <img src='generated/images/guide/user-input/keyup1-anim.gif' alt="key up 1">
</figure>



<div class="l-sub-section">


<!--
Alternatively, you could accumulate the individual keys themselves by substituting `event.key`
for `event.target.value` in which case the same user input would produce:
-->
`event.target.value` 대신 `event.key`를 사용하면 어떤 키가 입력되었는지 확인할 수도 있습니다:

<code-example>
  a | b | c | backspace | backspace | backspace |

</code-example>



</div>



{@a keyup1}


<!--
### Type the _$event_
-->
### _$event_ 의 타입

<!--
The example above casts the `$event` as an `any` type.
That simplifies the code at a cost.
There is no type information
that could reveal properties of the event object and prevent silly mistakes.

The following example rewrites the method with types:
-->
위에서 살펴본 예제에서는 `$event` 객체를 `any` 타입으로 사용했습니다.
이렇게 사용하면 코드가 간단해지기는 하지만, 이벤트 객체의 타입을 특정할 수 없기 때문에 이벤트 객체의 정보를 활용할 수 없고 코딩 실수를 할 가능성도 있습니다.

그래서 메소드에서 인자로 받는 이벤트 객체에 다음과 같이 타입을 지정하는 것이 좋습니다:

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-1-class" title="src/app/keyup.components.ts (class v.1 - typed )" linenums="false">

</code-example>


<!--
The `$event` is now a specific `KeyboardEvent`.
Not all elements have a `value` property so it casts `target` to an input element.
The `OnKey` method more clearly expresses what it expects from the template and how it interprets the event.
-->
이제 `$event` 객체는 `KeyboardEvent` 타입으로 지정했습니다.
그래서 모든 엘리먼트가 `value` 프로퍼티를 갖기는 하지만, 이 이벤트의 `target` 프로퍼티는 입력 필드라는 것이 확실해졌습니다.
결국 `OnKey` 메소드는 템플릿에서 어떤 타입의 인자를 받아야 하는지 좀 더 명확해졌고, 이 인자를 어떻게 활용할 수 있는지에 대해서도 더 많은 정보를 제공할 수 있습니다.

<!--
### Passing _$event_ is a dubious practice
-->
### _$event_ 객체를 그대로 전달하는 것이 좋을까?

<!--
Typing the event object reveals a significant objection to passing the entire DOM event into the method:
the component has too much awareness of the template details.
It can't extract information without knowing more than it should about the HTML implementation.
That breaks the separation of concerns between the template (_what the user sees_)
and the component (_how the application processes user data_).

The next section shows how to use template reference variables to address this problem.
-->
이벤트 객체에 타입을 지정하면 이벤트 핸들러 함수에 어떤 이벤트가 전달되는지 확실하게 확인할 수 있지만, 이벤트 핸들러가 템플릿을 신경써야 한다는 문제가 있습니다.
이벤트 객체에서 원하는 정보를 참조하려면 템플릿의 어떤 엘리먼트에서 이벤트가 발생했는지 알아야 하기 때문입니다.
이런 상황은 _사용자가 보는_ 템플릿과 _데이터를 처리하는_ 컴포넌트가 분리되어야 한다는 점에서도 좋지 않습니다.

이번에는 템플릿 참조 변수를 활용해서 이 문제를 어떻게 해결할 수 있는지 알아봅시다.

## Get user input from a template reference variable
There's another way to get the user data: use Angular
[**template reference variables**](guide/template-syntax#ref-vars).
These variables provide direct access to an element from within the template.
To declare a template reference variable, precede an identifier with a hash (or pound) character (#).

The following example uses a template reference variable
to implement a keystroke loopback in a simple template.

<code-example path="user-input/src/app/loop-back.component.ts" region="loop-back-component" title="src/app/loop-back.component.ts" linenums="false">

</code-example>



The template reference variable named `box`, declared on the `<input>` element,
refers to the `<input>` element itself.
The code uses the `box` variable to get the input element's `value` and display it
with interpolation between `<p>` tags.

The template is completely self contained. It doesn't bind to the component,
and the component does nothing.

Type something in the input box, and watch the display update with each keystroke.


<figure>
  <img src='generated/images/guide/user-input/keyup-loop-back-anim.gif' alt="loop back">
</figure>



<div class="l-sub-section">



**This won't work at all unless you bind to an event**.

Angular updates the bindings (and therefore the screen)
only if the app does something in response to asynchronous events, such as keystrokes.
This example code binds the `keyup` event
to the number 0, the shortest template statement possible.
While the statement does nothing useful,
it satisfies Angular's requirement so that Angular will update the screen.

</div>



It's easier to get to the input box with the template reference
variable than to go through the `$event` object. Here's a rewrite of the previous
`keyup` example that uses a template reference variable to get the user's input.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-2" title="src/app/keyup.components.ts (v2)" linenums="false">

</code-example>



A nice aspect of this approach is that the component gets clean data values from the view.
It no longer requires knowledge of the `$event` and its structure.
{@a key-event}


## Key event filtering (with `key.enter`)
The `(keyup)` event handler hears *every keystroke*.
Sometimes only the _Enter_ key matters, because it signals that the user has finished typing.
One way to reduce the noise would be to examine every `$event.keyCode` and take action only when the key is _Enter_.

There's an easier way: bind to Angular's `keyup.enter` pseudo-event.
Then Angular calls the event handler only when the user presses _Enter_.

<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-3" title="src/app/keyup.components.ts (v3)" linenums="false">

</code-example>



Here's how it works.

<figure>
  <img src='generated/images/guide/user-input/keyup3-anim.gif' alt="key up 3">
</figure>




## On blur

In the previous example, the current state of the input box
is lost if the user mouses away and clicks elsewhere on the page
without first pressing _Enter_.
The component's `value` property is updated only when the user presses _Enter_.

To fix this issue, listen to both the _Enter_ key and the _blur_ event.


<code-example path="user-input/src/app/keyup.components.ts" region="key-up-component-4" title="src/app/keyup.components.ts (v4)" linenums="false">

</code-example>




## Put it all together
The previous page showed how to [display data](guide/displaying-data).
This page demonstrated event binding techniques.

Now, put it all together in a micro-app
that can display a list of heroes and add new heroes to the list.
The user can add a hero by typing the hero's name in the input box and
clicking **Add**.


<figure>
  <img src='generated/images/guide/user-input/little-tour-anim.gif' alt="Little Tour of Heroes">
</figure>



Below is the "Little Tour of Heroes"  component.


<code-example path="user-input/src/app/little-tour.component.ts" region="little-tour" title="src/app/little-tour.component.ts" linenums="false">

</code-example>



### Observations

* **Use template variables to refer to elements** &mdash;
The `newHero` template variable refers to the `<input>` element.
You can reference `newHero` from any sibling or child of the `<input>` element.

* **Pass values, not elements** &mdash;
Instead of passing the `newHero` into the component's `addHero` method,
get the input box value and pass *that* to `addHero`.

* **Keep template statements simple** &mdash;
The `(blur)` event is bound to two JavaScript statements.
The first statement calls `addHero`.  The second statement, `newHero.value=''`,
clears the input box after a new hero is added to the list.



## Source code

Following is all the code discussed in this page.

<code-tabs>

  <code-pane title="click-me.component.ts" path="user-input/src/app/click-me.component.ts">

  </code-pane>

  <code-pane title="keyup.components.ts" path="user-input/src/app/keyup.components.ts">

  </code-pane>

  <code-pane title="loop-back.component.ts" path="user-input/src/app/loop-back.component.ts">

  </code-pane>

  <code-pane title="little-tour.component.ts" path="user-input/src/app/little-tour.component.ts">

  </code-pane>

</code-tabs>




## Summary

You have mastered the basic primitives for responding to user input and gestures.

These techniques are useful for small-scale demonstrations, but they
quickly become verbose and clumsy when handling large amounts of user input.
Two-way data binding is a more elegant and compact way to move
values between data entry fields and model properties.
The next page, `Forms`, explains how to write
two-way bindings with `NgModel`.
