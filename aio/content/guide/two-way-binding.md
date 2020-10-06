<!--
# Two-way binding `[(...)]`
-->
# 양방향 바인딩 `[(...)]`

<!--
Two-way binding gives your app a way to share data between a component class and
its template.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>
-->
양방향 바인딩(two-way binding)을 활용하면 컴포넌트 클래스와 컴포넌트 템플릿 사이에 데이터를 공유할 수 있습니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
## Basics of two-way binding
-->
## 기본 개념

<!--
Two-way binding does two things:

1. Sets a specific element property.
1. Listens for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, `[()]`.
The `[()]` syntax combines the brackets
of property binding, `[]`, with the parentheses of event binding, `()`.

<div class="callout is-important">

<header>
  [( )] = banana in a box
</header>

Visualize a *banana in a box* to remember that the parentheses go _inside_ the brackets.

</div>

The `[()]` syntax is easy to demonstrate when the element has a settable
property called `x` and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits this pattern.
It has a `size` value property and a companion `sizeChange` event:

<code-example path="two-way-binding/src/app/sizer/sizer.component.ts" header="src/app/sizer.component.ts"></code-example>

<code-example path="two-way-binding/src/app/sizer/sizer.component.html" header="src/app/sizer.component.html"></code-example>

The initial `size` is an input value from a property binding.
Clicking the buttons increases or decreases the `size`, within
min/max value constraints,
and then raises, or emits, the `sizeChange` event with the adjusted size.

Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-1)" region="two-way-1"></code-example>

The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.

<code-example path="two-way-binding/src/app/app.component.ts" header="src/app/app.component.ts" region="font-size"></code-example>

Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding,
making the displayed text bigger or smaller.

The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
Angular desugars the `SizerComponent` binding into this:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (two-way-2)" region="two-way-2"></code-example>

The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.
-->
양방향 바인딩은 이런 용도로 사용합니다:

1. 엘리먼트 프로퍼티의 값을 설정합니다.
1. 엘리먼트에서 변경(`change`) 이벤트가 발생하는 것을 감지합니다.

양방향 바인딩은 특별한 _양방향 데이터 바인딩_ 문법을 사용합니다.
`[()]`라는 형태인데, 이 문법은 프로퍼티 바인딩(`[]`)과 이벤트 바인딩(`()`)이 합쳐진 형태입니다.


<div class="callout is-important">

<header>
  [( )] = 상자 안에 든 바나나
</header>

대괄호와 소괄호의 순서를 헷갈리지 않으려면 *상자 안에 있는 바나나* 모양을 생각해 보세요.
소괄호는 대괄호 _안에_ 위치합니다.

</div>


`[()]` 문법이 사용되었다면 엘리먼트에 있는 `x` 프로퍼티 값을 외부에서 지정할 수 있고, `xChange` 이벤트도 발생한다는 것을 의미합니다.
`SizerComponent` 코드를 보며 알아봅시다.
이 컴포넌트에는 `size` 프로퍼티가 있으며 `sizeChange` 이벤트도 선언되어 있습니다:

<code-example path="two-way-binding/src/app/sizer/sizer.component.ts" header="src/app/sizer.component.ts"></code-example>

<code-example path="two-way-binding/src/app/sizer/sizer.component.html" header="src/app/sizer.component.html"></code-example>

`size` 프로퍼티의 초기값은 프로퍼티 바인딩에 의해 할당됩니다.
그리고 증감 버튼을 누를 때마다 최소값/최대값 범위 안에서 `size` 값이 변경되는데, 이 때 `sizeChange` 이벤트가 발생합니다.

`SizerComponent`에 양방향 바인딩으로 연결된 `AppComponent.fontSizePx` 코드를 봅시다.

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (양방향-바인딩-1)" region="two-way-1"></code-example>

`SizerComponent.size` 프로퍼티의 초기값은 `AppComponent.fontSizePx` 프로퍼티에 의해 할당됩니다.

<code-example path="two-way-binding/src/app/app.component.ts" header="src/app/app.component.ts" region="font-size"></code-example>

이제 증감 버튼을 누르면 양방향 바인딩에 의해 `AppComponent.fontSizePx` 프로퍼티 값이 변경됩니다.
그리고 `AppComponent.fontSizePx`이 _스타일_ 바인딩으로 연결되어 있기 때문에 이 프로퍼티 값이 변경되는 것은 화면에 표시되는 문자열이 커지고 작아지는 것으로 확인할 수 있습니다.

사실 양방향 바인딩 문법은 _프로퍼티_ 바인딩과 _이벤트_ 바인딩을 엮어서 다르게 표현한 것입니다.
그래서 양방향 바인딩 문법을 사용하지 않고 이렇게 구현할 수도 있습니다:

<code-example path="two-way-binding/src/app/app.component.html" header="src/app/app.component.html (양방향-바인딩-2)" region="two-way-2"></code-example>

`SizerComponent.sizeChange`에는 이벤트에 대한 정보가 담겨 `$event` 객체로 전달됩니다.
그래서 사용자가 증감 버튼을 클릭하면 `AppComponent.fontSizePx` 값이 `$event`로 전달됩니다.


<!--
## Two-way binding in forms
-->
## 폼에서 양방향 바인딩 사용하기

<!--
The two-way binding syntax is a great convenience compared to
separate property and event bindings. It would be convenient to
use two-way binding with HTML form elements like `<input>` and
`<select>`. However, no native HTML element follows the `x`
value and `xChange` event pattern.

For more on how to use two-way binding in forms, see
Angular [NgModel](guide/built-in-directives#ngModel).
-->
양방향 바인딩 문법은 프로퍼티 바인딩 문법과 이벤트 바인딩 문법을 따로 사용하는 것보다 훨씬 편합니다.
그래서 `<input>`이나 `<select>`와 같은 HTML 폼 엘리먼트에 양방향 바인딩을 활용하는 것도 아주 좋습니다.
하지만 기본 HTML 엘리먼트에는 `x`라는 프로퍼티가 없으며 `xChange`와 같은 이벤트 패턴을 따르지도 않습니다.

폼에 양방향 바인딩을 활용하는 방법에 대해 알아보려면 [NgModel](guide/built-in-directives#ngModel) 문서를 참고하세요.