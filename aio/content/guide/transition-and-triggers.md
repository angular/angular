<!--
# Animations transitions and triggers
-->
# 트랜지션 & 트리거

<!--
You learned the basics of Angular animations in the [introduction](guide/animations) page.

This guide goes into greater depth on special transition states such as `*` (wildcard) and `void`, and show how these special states are used for elements entering and leaving a view.
This chapter also explores multiple animation triggers, animation callbacks, and sequence-based animation using keyframes.
-->
이전에 살펴본 [Angular 애니메이션 소개](guide/animations) 문서에서는 Angular 애니메이션의 기본 개념에 대해 알아봤습니다.

이 문서에서는 트랜지션에 대해 좀 더 깊이 들어가서 `*` 와일드카드 상태와 `void` 상태에 대해 알아봅시다. 이 상태들은 엘리먼트가 화면에 추가되거나 사라질 때 사용하는 특수 상태입니다.
그리고 이 문서에서는 애니메이션 트리거를 여러개 적용하는 방법, 애니메이션 콜백을 활용하는 방법, 키프레임을 사용해서 애니메이션을 정해진 순서대로 실행하는 방법도 알아봅시다.


<!--
## Predefined states and wildcard matching
-->
## 미리 정의된 상태와 와일드카드 매칭

<!--
In Angular, transition states can be defined explicitly through the `state()` function, or using the predefined `*` (wildcard) and `void` states.
-->
Angular에서 트랜지션 상태는 `state()` 함수로 지정할 수 있지만 이 외에도 와일드카드(`*`) 상태와 보이드(`void`) 상태가 미리 정의되어 있습니다.


<!--
### Wildcard state
-->
### 와일드카드 상태

<!--
An asterisk `*` or *wildcard* matches any animation state. This is useful for defining transitions that apply regardless of the HTML element's start or end state.

For example, a transition of `open => *` applies when the element's state changes from open to anything else.

<div class="lightbox">
  <img src="generated/images/guide/animations/wildcard-state-500.png" alt="wildcard state expressions">
</div>

The following is another code sample using the wildcard state together with the previous example using the `open` and `closed` states.
Instead of defining each state-to-state transition pair, any transition to `closed` takes 1 second, and any transition to `open` takes 0.5 seconds.

This allows us to add new states without having to include separate transitions for each one.

<code-example header="src/app/open-close.component.ts" path="animations/src/app/open-close.component.ts" region="trigger-wildcard1" language="typescript"></code-example>

Use a double arrow syntax to specify state-to-state transitions in both directions.

<code-example header="src/app/open-close.component.ts" path="animations/src/app/open-close.component.ts" region="trigger-wildcard2" language="typescript"></code-example>
-->
와일드카드(`*`)는 모든 애니메이션 상태와 매칭됩니다. 그래서 이 상태는 엘리먼트의 초기 상태나 종료 상태와 관계없이 트랜지션을 적용할 때 사용할 수 있습니다.

예를 들어 `open => *` 과 같은 트랜지션은 엘리먼트가 `open` 상태였다가 다른 상태로 전환되는 경우에 모두 매칭됩니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/wildcard-state-500.png" alt="wildcard state expressions">
</div>

이전에 살펴봤던 예제처럼 `open` 상태와 `closed` 상태가 있는 앱을 살펴봅시다.
그런데 이번에는 어떤 상태에서 다른 상태로 트랜지션하는것이 아니라 아무 상태에서 `closed`로 바뀔 때는 1초, 아무 상태에서 `open`으로 바뀔 때는 0.5초 시간동안 애니메이션을 실행해 봅니다.

그러면 트랜지션을 정의하는 로직을 다음과 같이 작성할 수 있습니다.

<code-example header="src/app/open-close.component.ts" path="animations/src/app/open-close.component.ts" region="trigger-wildcard1" language="typescript"></code-example>

그리고 두 상태를 양방향으로 전환하는 트랜지션을 정의하려면 다음과 같이 작성하면 됩니다.

<code-example header="src/app/open-close.component.ts" path="animations/src/app/open-close.component.ts" region="trigger-wildcard2" language="typescript"></code-example>


<!--
### Using wildcard state with multiple transition states
-->
### 상태 전환할 때 와일드카드 상태 활용하기

<!--
In the two-state button example, the wildcard isn't that useful because there are only two possible states, `open` and `closed`.
Wildcard states are better when an element in one particular state has multiple potential states that it can change to.
If the button can change from `open` to either `closed` or something like `inProgress`, using a wildcard state could reduce the amount of coding needed.

<div class="lightbox">
  <img src="generated/images/guide/animations/wildcard-3-states.png" alt="wildcard state with 3 states">
</div>


<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="trigger-transition" language="typescript"></code-example>


The `* => *` transition applies when any change between two states takes place.

Transitions are matched in the order in which they are defined. Thus, you can apply other transitions on top of the `* => *` (any-to-any) transition. For example, define style changes or animations that would apply just to `open => closed`, or just to `closed => open`, and then use `* => *` as a fallback for state pairings that aren't otherwise called out.

To do this, list the more specific transitions *before* `* => *`.
-->
버튼의 상태를 전환하는 예제에서는 와일드카드 상태가 크게 유용하지 않습니다. 이 예제에는 `open`, `closed` 두 상태만 있기 때문입니다.
와일드카드 상태는 특정 상태에서 다른 상태로 전환되는 경우가 많을 때 유용합니다.
그래서 버튼이 `open`에서 전환되는 상태가 `closed` 외에 `inProgress` 상태도 있다면 와일드카드를 사용해서 코드의 양을 줄일 수 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/wildcard-3-states.png" alt="wildcard state with 3 states">
</div>


<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="trigger-transition" language="typescript"></code-example>

`* => *` 트랜지션은 모든 상태 전환과 매칭됩니다.

트랜지션은 정의된 순서대로 매칭되기 때문에 `* => *` 트랜지션은 다른 트랜지션보다 제일 나중에 정의해야 합니다.
그래서 이 예제로 보면 `open => closed` 트랜지션을 가장 먼저 정의하고 그 다음에 `closed => open` 트랜지션을 그 다음에 정의한 후에 `* => *` 트랜지션을 정의하면 앞에 두 경우에 해당되지 않는 트랜지션은 모두 `* => *`와 매칭됩니다.

마찬가지로 이 코드에 트랜지션 규칙을 더 추가하려면 `* => *` 앞에 추가해야 합니다.


<!--
### Using wildcards with styles
-->
### 스타일 적용할 때 와일드카드 사용하기

<!--
Use the wildcard `*` with a style to tell the animation to use whatever the current style value is, and animate with that. Wildcard is a fallback value that's used if the state being animated isn't declared within the trigger.
-->
와일드카드 `*`는 스타일을 지정할 때도 사용할 수 있습니다. 스타일에 와일드카드를 사용하면 트리거 안에 지정되지 않은 스타일을 현재 스타일 값으로 변경합니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="transition4" language="typescript"></code-example>


<!--
### Void state
-->
### 보이드(void) 상태

<!--
You can use the `void` state to configure transitions for an element that is entering or leaving a page. See [Animating entering and leaving a view](#enter-leave-view).
-->
엘리먼트가 화면에 나타나거나 화면에서 사라지는 트랜지션을 정의하려면 `void` 상태를 활용할 수 있습니다. [나타나거나 사라지는 애니메이션](#enter-leave-view) 섹션을 참고하세요.


<!--
### Combining wildcard and void states
-->
### 와일드카드 상태와 보이드 상태 함께 사용하기

<!--
You can combine wildcard and void states in a transition to trigger animations that enter and leave the page:

* A transition of `* => void` applies when the element leaves a view, regardless of what state it was in before it left.

* A transition of `void => *` applies when the element enters a view, regardless of what state it assumes when entering.

* The wildcard state `*` matches to *any* state, including `void`.
-->
와일드카드 상태와 보이드 상태를 함께 사용하면 이렇게 활용할 수 있습니다:

* `* => void`는 엘리먼트가 화면에서 사라질 때 적용됩니다. 이전 상태는 어느것이든 관계없습니다.

* `void => *`는 엘리먼트가 화면에 나타날 때 적용됩니다. 나타난 이후에 어떤 상태가 되느냐는 관계없습니다.

* `*` 는 `void` 상태를 포함해서 *모든* 상태와 매칭됩니다.


<!--
## Animating entering and leaving a view
-->
## 나타나거나 사라지는 애니메이션

<!--
This section shows how to animate elements entering or leaving a page.
-->
이번 섹션에서는 엘리먼트가 나타나거나 사라지는 애니메이션에 대해 알아봅시다.

<div class="alert is-helpful">

<!--
**Note:** For this example, an element entering or leaving a view is equivalent to being inserted or removed from the DOM.
-->
**참고:** 이번 예제에서 엘리먼트가 화면에 나타나거나 화면에서 사라지는 것은 DOM에 엘리먼트가 추가되거나 DOM에서 엘리먼트가 제거되는 것과 같은 역할을 합니다.

</div>

<!--
Now add a new behavior:

* When you add a hero to the list of heroes, it appears to fly onto the page from the left.
* When you remove a hero from the list, it appears to fly out to the right.

<code-example path="animations/src/app/hero-list-enter-leave.component.ts" header="src/app/hero-list-enter-leave.component.ts" region="animationdef" language="typescript"></code-example>

In the above code, you applied the `void` state when the HTML element isn't attached to a view.
-->
새로운 동작을 추가해 봅시다:

* 히어로 목록에 히어로를 추가하면 이 히어로는 화면 왼쪽에서 날아와서 표시됩니다.
* 목록에서 히어로를 제거하면 이 히어로는 화면 오른쪽으로 날아가면서 사라집니다.

<code-example path="animations/src/app/hero-list-enter-leave.component.ts" header="src/app/hero-list-enter-leave.component.ts" region="animationdef" language="typescript"></code-example>

이전에 살펴봤던 것처럼 `void => *`나 `* => void`를 사용하면 이런 동작을 구현할 수 있습니다.


{@a enter-leave-view}

<!--
## :enter and :leave aliases
-->
## :enter, :leave

<!--
`:enter` and `:leave` are aliases for the `void => *` and `* => void` transitions. These aliases are used by several animation functions.

<code-example hideCopy language="typescript">
transition ( ':enter', [ ... ] );  // alias for void => *
transition ( ':leave', [ ... ] );  // alias for * => void
</code-example>

It's harder to target an element that is entering a view because it isn't in the DOM yet.
So, use the aliases `:enter` and `:leave` to target HTML elements that are inserted or removed from a view.
-->
`void => *`는 `:enter`로, `* => void`는 `:leave`로 대신 사용할 수 있습니다. `:enter`와 `:leave`는 별칭으로 미리 정의되어 있습니다.

<code-example hideCopy language="typescript">
transition ( ':enter', [ ... ] );  // void => * 와 같은 의미
transition ( ':leave', [ ... ] );  // * => void 와 같은 의미
</code-example>

화면에 나타나는 엘리먼트는 아직 DOM에 존재하지 않기 때문에 대상으로 지정하기 어렵습니다.
하지만 `:enter`나 `:leave`를 사용하면 화면에 추가되는 엘리먼트와 화면에서 제거되는 엘리먼트를 간단하게 지정할 수 있습니다.


<!--
### Use of \*ngIf and \*ngFor with :enter and :leave
-->
### :enter, :leave를 \*ngIf, \*ngFor와 함께 사용하기

<!--
The `:enter` transition runs when any `*ngIf` or `*ngFor` views are placed on the page, and `:leave` runs when those views are removed from the page.

This example has a special trigger for the enter and leave animation called `myInsertRemoveTrigger`. The HTML template contains the following code.

<code-example path="animations/src/app/insert-remove.component.html" header="src/app/insert-remove.component.html" region="insert-remove" language="typescript">
</code-example>

In the component file, the `:enter` transition sets an initial opacity of 0, and then animates it to change that opacity to 1 as the element is inserted into the view.

<code-example path="animations/src/app/insert-remove.component.ts" header="src/app/insert-remove.component.ts" region="enter-leave-trigger" language="typescript">
</code-example>

Note that this example doesn't need to use `state()`.
-->
`:enter` 트랜지션은 `*ngIf`나 `*ngFor`로 화면에 추가되는 엘리먼트를 대상으로 적용할 수 있으며, `:leave`도 마찬가지로 화면에서 사라지는 엘리먼트를 대상으로 적용할 수 있습니다.

이번에는 엘리먼트가 추가되거나 제거될 때 트리거되는 `myInsertRemoveTrigger`를 정의해 봅시다. 템플릿은 이렇게 작성합니다.

<code-example path="animations/src/app/insert-remove.component.html" header="src/app/insert-remove.component.html" region="insert-remove" language="typescript">
</code-example>

이 컴포넌트 파일에서 `:enter` 트랜지션은 엘리먼트가 화면에 추가되는 것을 표현하기 위해 투명도가 0부터 1까지 변합니다.

<code-example path="animations/src/app/insert-remove.component.ts" header="src/app/insert-remove.component.ts" region="enter-leave-trigger" language="typescript">
</code-example>

이 예제에서 `state()`는 한 번도 사용하지 않았습니다.


<!--
## :increment and :decrement in transitions
-->
## :increment, :decrement

<!--
The `transition()` function takes additional selector values, `:increment` and `:decrement`. Use these to kick off a transition when a numeric value has increased or decreased in value.
-->
`transition()` 함수에는 `:increment`와 `:decrement`라는 셀렉터도 사용할 수 있습니다. 이 셀렉터는 숫자값이 변했을 때 트랜지션을 시작하는 트리거입니다.

<div class="alert is-helpful">

<!--
**Note:** The following example uses `query()` and `stagger()` methods, which is discussed in the [complex sequences](guide/complex-animation-sequences#complex-sequence) page.
-->
**참고:** 아래 예제에는 `query()`와 `stagger()` 메소드를 사용했습니다. 이 메소드는 [복잡한 시퀀스](guide/complex-animation-sequences#complex-sequence) 문서에서 자세하게 다룹니다.

</div>

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="increment" language="typescript"></code-example>


<!--
## Boolean values in transitions
-->
## 불리언 값으로 트랜지션 시작하기

<!--
If a trigger contains a boolean value as a binding value, then this value can be matched using a `transition()` expression that compares `true` and `false`, or `1` and `0`.

<code-example path="animations/src/app/open-close.component.2.html" header="src/app/open-close.component.html" region="trigger-boolean">
</code-example>

In the code snippet above, the HTML template binds a `<div>` element to a trigger named `openClose` with a status expression of `isOpen`, and with possible values of `true` and `false`. This is an alternative to the practice of creating two named states of `open` and `close`.

In the component code, in the `@Component` metadata under the `animations:` property, when the state evaluates to `true` (meaning "open" here), the associated HTML element's height is a wildcard style or default. In this case, use whatever height the element already had before the animation started. When the element is "closed," the element animates to a height of 0, which makes it invisible.

<code-example path="animations/src/app/open-close.component.2.ts" header="src/app/open-close.component.ts" region="trigger-boolean" language="typescript">
</code-example>
-->
트리거에 바인딩 된 값이 불리언 타입이라면, 이 값은 `transition()` 표현식 안에서 `true`/`false`나 `1`/`0` 값과 매칭됩니다.

<code-example path="animations/src/app/open-close.component.2.html" header="src/app/open-close.component.html" region="trigger-boolean">
</code-example>

위 예제 코드에서 HTML 템플릿의 `<div>` 엘리먼트에는 `openClose` 트리거가 `isOpen` 표현식으로 연결되어 있는데, `isOpen` 프로퍼티는 불리언 타입이기 때문에 `true` 값이거나 `false` 값이 됩니다. `isOpen` 프로퍼티 값에 따라 `open`/`close` 상태를 지정하는 것과 같은 로직이라고 볼 수 있습니다.

그리고 컴포넌트 코드에서 `Component`의 메타데이터 `animations:` 프로퍼티에는 `true`로 평가되는 상태에 엘리먼트 높이를 와일드카드 스타일이나 기본값으로 지정합니다. 이번 예제에서는 애니메이션이 시작하기 전에 갖고 있던 값을 그대로 사용했습니다. 그리고 엘리먼트가 "close" 상태가 되면 높이를 0으로 만들어서 보이지 않게 구현했습니다.

<code-example path="animations/src/app/open-close.component.2.ts" header="src/app/open-close.component.ts" region="trigger-boolean" language="typescript">
</code-example>


## Multiple animation triggers

You can define more than one animation trigger for a component. You can attach animation triggers to different elements, and the parent-child relationships among the elements affect how and when the animations run.

### Parent-child animations

Each time an animation is triggered in Angular, the parent animation always get priority and child animations are blocked. In order for a child animation to run, the parent animation must query each of the elements containing child animations and then allow the animations to run using the [`animateChild()`](https://angular.io/api/animations/animateChild) function.

#### Disabling an animation on an HTML element

A special animation control binding called `@.disabled` can be placed on an HTML element to disable animations on that element, as well as any nested elements. When true, the `@.disabled` binding prevents all animations from rendering.

The code sample below shows how to use this feature.

<code-tabs>

<code-pane path="animations/src/app/open-close.component.4.html" header="src/app/open-close.component.html" region="toggle-animation">
</code-pane>

<code-pane path="animations/src/app/open-close.component.4.ts" header="src/app/open-close.component.ts" region="toggle-animation" language="typescript">
</code-pane>

</code-tabs>

When the `@.disabled` binding is true, the `@childAnimation` trigger doesn't kick off.

When an element within an HTML template has animations disabled using the `@.disabled` host binding, animations are disabled on all inner elements as well.
You can't selectively disable multiple animations on a single element.

However, selective child animations can still be run on a disabled parent in one of the following ways:

* A parent animation can use the [`query()`](https://angular.io/api/animations/query) function to collect inner elements located in disabled areas of the HTML template.
Those elements can still animate.

* A subanimation can be queried by a parent and then later animated with the `animateChild()` function.

#### Disabling all animations

To disable all animations for an Angular app, place the `@.disabled` host binding on the topmost Angular component.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="toggle-app-animations" language="typescript"></code-example>

<div class="alert is-helpful">

**Note:** Disabling animations application-wide is useful during end-to-end (E2E) testing.
</div>

## Animation callbacks

The animation `trigger()` function emits *callbacks* when it starts and when it finishes. The example below features a component that contains an `openClose` trigger.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="events1" language="typescript"></code-example>

In the HTML template, the animation event is passed back via `$event`, as `@trigger.start` and `@trigger.done`, where `trigger` is the name of the trigger being used.
In this example, the trigger `openClose` appears as follows.

<code-example path="animations/src/app/open-close.component.3.html" header="src/app/open-close.component.html" region="callbacks">
</code-example>

A potential use for animation callbacks could be to cover for a slow API call, such as a database lookup.
For example, you could set up the **InProgress** button to have its own looping animation where it pulsates or does some other visual motion while the backend system operation finishes.

Then, another animation can be called when the current animation finishes.
For example, the button goes from the `inProgress` state to the `closed` state when the API call is completed.

An animation can influence an end user to *perceive* the operation as faster, even when it isn't.
Thus, a simple animation can be a cost-effective way to keep users happy, rather than seeking to improve the speed of a server call and having to compensate for circumstances beyond your control, such as an unreliable network connection.

Callbacks can serve as a debugging tool, for example in conjunction with `console.warn()` to view the application's progress in a browser's Developer JavaScript Console.
The following code snippet creates console log output for the original example, a button with the two states of `open` and `closed`.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="events" language="typescript"></code-example>

{@a keyframes}

## Keyframes

The previous section features a simple two-state transition. Now create an animation with multiple steps run in sequence using *keyframes*.

Angular's `keyframe()` function is similar to keyframes in CSS. Keyframes allow several style changes within a single timing segment.
For example, the button, instead of fading, could change color several times over a single 2-second timespan.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-500.png" alt="keyframes">
</div>

The code for this color change might look like this.

<code-example path="animations/src/app/status-slider.component.ts" header="src/app/status-slider.component.ts" region="keyframes" language="typescript"></code-example>

### Offset

Keyframes include an *offset* that defines the point in the animation where each style change occurs.
Offsets are relative measures from zero to one, marking the beginning and end of the animation, respectively and should be applied to each of the keyframe's steps if used at least once.

Defining offsets for keyframes is optional.
If you omit them, evenly spaced offsets are automatically assigned.
For example, three keyframes without predefined offsets receive offsets of 0, 0.5, and 1.
Specifying an offset of 0.8 for the middle transition in the above example might look like this.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-offset-500.png" alt="keyframes with offset">
</div>

The code with offsets specified would be as follows.

<code-example path="animations/src/app/status-slider.component.ts" header="src/app/status-slider.component.ts" region="keyframesWithOffsets" language="typescript">
</code-example>

You can combine keyframes with `duration`, `delay`, and `easing` within a single animation.

### Keyframes with a pulsation

Use keyframes to create a pulse effect in your animations by defining styles at specific offset throughout the animation.

Here's an example of using keyframes to create a pulse effect:

* The original `open` and `closed` states, with the original changes in height, color, and opacity, occurring over a timeframe of 1 second.

* A keyframes sequence inserted in the middle that causes the button to appear to pulsate irregularly over the course of that same 1-second timeframe.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-pulsation.png" alt="keyframes with irregular pulsation">
</div>

The code snippet for this animation might look like this.

<code-example path="animations/src/app/open-close.component.1.ts" header="src/app/open-close.component.ts" region="trigger" language="typescript"></code-example>

### Animatable properties and units

Angular's animation support builds on top of web animations, so you can animate any property that the browser considers animatable.
This includes positions, sizes, transforms, colors, borders, and more. The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) page.

For positional properties with a numeric value, define a unit by providing the value as a string, in quotes, with the appropriate suffix:

* 50 pixels: `'50px'`
* Relative font size: `'3em'`
* Percentage: `'100%'`

If you don't provide a unit when specifying dimension, Angular assumes a default unit of pixels, or px.
Expressing 50 pixels as `50` is the same as saying `'50px'`.

### Automatic property calculation with wildcards

Sometimes you don't know the value of a dimensional style property until runtime.
For example, elements often have widths and heights that depend on their content and the screen size.
These properties are often challenging to animate using CSS.

In these cases, you can use a special wildcard `*` property value under `style()`, so that the value of that particular style property is computed at runtime and then plugged into the animation.

The following example has a trigger called `shrinkOut`, used when an HTML element leaves the page.
The animation takes whatever height the element has before it leaves, and animates from that height to zero.

<code-example path="animations/src/app/hero-list-auto.component.ts" header="src/app/hero-list-auto.component.ts" region="auto-calc" language="typescript"></code-example>

### Keyframes summary

The `keyframes()` function in Angular allows you to specify multiple interim styles within a single transition, with an optional offset to define the point in the animation where each style change occurs.

## More on Angular animations

You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Complex animation sequences](guide/complex-animation-sequences)
* [Reusable animations](guide/reusable-animations)
* [Route transition animations](guide/route-animations)
