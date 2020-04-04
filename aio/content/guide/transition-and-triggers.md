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
Angular에서 트랜지션 상태는 `state()` 함수로 선언할 수 있지만 이 외에도 와일드카드(`*`) 상태와 보이드(`void`) 상태가 미리 정의되어 있습니다.


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
와일드카드(`*`)는 모든 애니메이션 상태와 매칭됩니다. 그래서 이 상태는 엘리먼트의 초기 상태나 종료 상태에 관계없이 특정 조건의 트랜지션을 적용할 때 사용할 수 있습니다.

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
이 예제는 버튼의 상태가 `open`과 `closed`두 개만 있기 때문에 와일드카드 상태가 크게 유용하지 않습니다.
와일드카드 상태는 다른 상태로 전환되는 경우가 많을 때 유용합니다.
그래서 버튼이 `open`에서 전환되는 상태가 `closed` 외에 `inProgress` 상태도 있다면 와일드카드를 사용해서 코드의 양을 줄일 수 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/wildcard-3-states.png" alt="wildcard state with 3 states">
</div>


<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="trigger-transition" language="typescript"></code-example>

`* => *` 트랜지션은 모든 상태 전환과 매칭됩니다.

트랜지션은 정의된 순서대로 매칭되기 때문에 `* => *` 트랜지션은 다른 트랜지션보다 제일 나중에 정의해야 합니다.
그래서 이 예제로 보면 `open => closed` 트랜지션이 가장 먼저 적용되고 그 다음에 `closed => open` 트랜지션이 그 다음 우선순위로 적용되며 상태가 정확하게 지정되지 않은 트랜지션은 모두 `* => *`와 매칭됩니다.

이 코드에 트랜지션 규칙을 더 추가하려면 `* => *` 앞에 추가해야 합니다.


<!--
### Using wildcards with styles
-->
### 스타일 적용할 때 와일드카드 사용하기

<!--
Use the wildcard `*` with a style to tell the animation to use whatever the current style value is, and animate with that. Wildcard is a fallback value that's used if the state being animated isn't declared within the trigger.
-->
와일드카드 `*`는 스타일을 지정할 때도 사용할 수 있습니다. 스타일에 와일드카드를 사용하면 트리거 안에 지정되지 않은 스타일이 현재 스타일 값으로 대체됩니다.

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

이전에 살펴봤던 것처럼 `void => *`나 `* => void`를 사용하면 이런 동작을 간단하게 구현할 수 있습니다.


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
`void => *`는 `:enter`로, `* => void`는 `:leave`로 대신 사용할 수 있습니다. `:enter`와 `:leave`는 별칭으로 미리 정의되어 있는 셀렉터 입니다.

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

위 예제 코드에서 HTML 템플릿의 `<div>` 엘리먼트에는 `openClose` 트리거가 `isOpen` 표현식으로 연결되어 있는데, `isOpen` 프로퍼티는 불리언 타입이기 때문에 `true` 값이거나 `false` 값이 됩니다. `isOpen` 프로퍼티 값에 따라 `open`/`close` 상태를 문자열로 지정하는 것과 같은 로직이라고 볼 수 있습니다.

그리고 컴포넌트 코드에서 `Component`의 메타데이터 `animations:` 프로퍼티에는 `true`로 평가되는 상태에 엘리먼트 높이를 와일드카드 스타일이나 기본값으로 지정합니다. 이번 예제에서는 애니메이션이 시작하기 전에 갖고 있던 값을 그대로 사용했습니다. 그리고 엘리먼트가 "close" 상태가 되면 높이를 0으로 만들어서 보이지 않게 구현했습니다.

<code-example path="animations/src/app/open-close.component.2.ts" header="src/app/open-close.component.ts" region="trigger-boolean" language="typescript">
</code-example>


<!--
## Multiple animation triggers
-->
## 다중 애니메이션 트리거

<!--
You can define more than one animation trigger for a component. You can attach animation triggers to different elements, and the parent-child relationships among the elements affect how and when the animations run.
-->
애니메이션 트리거는 한번에 여러개를 정의할 수도 있습니다.
여러 엘리먼트에 트리거를 연결하거나 부모-자식 관계의 엘리먼트에 트리거를 연결하면 애니메이션 여러개를 동시에 실행할 수 있습니다.

<!--
### Parent-child animations
-->
### 부모-자식 애니메이션

<!--
Each time an animation is triggered in Angular, the parent animation always get priority and child animations are blocked. In order for a child animation to run, the parent animation must query each of the elements containing child animations and then allow the animations to run using the [`animateChild()`](https://angular.io/api/animations/animateChild) function.
-->
Angular에서 애니메이션이 시작되면 부모 애니메이션이 항상 우선권을 가지며 자식 애니메이션은 중단됩니다. 그래서 자식 애니메이션을 시작하려면 부모 애니메이션이 각각의 자식 애니메이션을 찾아서 [`animateChild()`](https://angular.io/api/animations/animateChild)으로 실행해줘야 합니다.

<!--
#### Disabling an animation on an HTML element
-->
#### 애니메이션 비활성화하기

<!--
A special animation control binding called `@.disabled` can be placed on an HTML element to disable animations on that element, as well as any nested elements. When true, the `@.disabled` binding prevents all animations from rendering.

The code sample below shows how to use this feature.
-->
HTML 엘리먼트에 `@.disabled`를 바인딩하면 애니메이션을 비활성화 할 수 있으며, 이 때 자식 엘리먼트도 모두 영향을 받습니다. 그래서 `@.disabled`에 `true` 값을 바인딩하면 해당 엘리먼트와 해당 엘리먼트의 자식 엘리먼트에서는 모든 애니메이션이 비활성화됩니다.

이 내용에 대해 살펴봅시다.


<code-tabs>

<code-pane path="animations/src/app/open-close.component.4.html" header="src/app/open-close.component.html" region="toggle-animation">
</code-pane>

<code-pane path="animations/src/app/open-close.component.4.ts" header="src/app/open-close.component.ts" region="toggle-animation" language="typescript">
</code-pane>

</code-tabs>

<!--
When the `@.disabled` binding is true, the `@childAnimation` trigger doesn't kick off.

When an element within an HTML template has animations disabled using the `@.disabled` host binding, animations are disabled on all inner elements as well.
You can't selectively disable multiple animations on a single element.

However, selective child animations can still be run on a disabled parent in one of the following ways:

* A parent animation can use the [`query()`](https://angular.io/api/animations/query) function to collect inner elements located in disabled areas of the HTML template.
Those elements can still animate.

* A subanimation can be queried by a parent and then later animated with the `animateChild()` function.
-->
`@.disabled`가 `true` 값으로 바인딩되면 `@childAnimation` 트리거는 시작되지 않습니다.

그리고 호스트 엘리먼트에 `@.disabled`가 바인딩되면 이 엘리먼트의 자식 엘리먼트에의 모든 애니메이션도 비활성화됩니다.
이 때 비활성화는 엘리먼트 단위로만 할 수 있으며, 한 엘리먼트의 일부 애니매이션만 실행할 수는 없습니다.

그런데 부모 엘리먼트의 애니메이션은 비활성화하고 자식 엘리먼트의 애니메이션만 실행할 수 있는 방법이 있습니다:

* 부모 애니메이션에서 [`query()`](https://angular.io/api/animations/query) 함수를 실행해서 자식 엘리먼트의 애니메이션을 모은 후에 직접 시작할 수 있습니다.

* 서브 애니메이션도 쿼리한 후에 `animateChild()` 함수로 시작할 수 있습니다.


<!--
#### Disabling all animations
-->
#### 모든 애니메이션 비활성화하기

<!--
To disable all animations for an Angular app, place the `@.disabled` host binding on the topmost Angular component.
-->
Angular 앱에 있는 애니메이션을 모두 비활성화 하려면 최상위 컴포넌트에 `@.disabled`를 바인딩하면 됩니다.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="toggle-app-animations" language="typescript"></code-example>

<div class="alert is-helpful">

<!--
**Note:** Disabling animations application-wide is useful during end-to-end (E2E) testing.
-->
**참고:** 앱 전체에 애니메이션을 비활성화하는 기능은 엔드-투-엔드(E2E) 테스트를 실행할 때 활용하면 좋습니다.

</div>


<!--
## Animation callbacks
-->
## 애니메이션 콜백

<!--
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
-->
`trigger()` 함수는 시작할 때와 종료될 때 *콜백* 함수를 실행합니다. 이번에는 `openClose` 트리거에 콜백 함수를 연결하는 방법에 대해 알아봅시다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="events1" language="typescript"></code-example>

애니메이션 트리거의 이름이 `trigger`라면 애니메이션 이벤트는 HTML 템플릿에서 `$event` 객체에 담겨 `@trigger.start`나 `@trigger.done` 함수로 전달됩니다.
그래서 이번 예제에서는 트리거의 이름이 `openClose`이기 때문에 이 트리거의 콜백은 다음과 같이 연결할 수 있습니다.

<code-example path="animations/src/app/open-close.component.3.html" header="src/app/open-close.component.html" region="callbacks">
</code-example>

애니메이션 콜백은 데이터베이스 쿼리와 같이 시간이 오래 걸리는 API를 실행할 때도 유용합니다.
예를 들면 백엔드에서 어떤 작업을 하는 동안 버튼이 깜빡이는 등 시각적 효과를 표현할 수 있습니다.

아니면 어떤 애니메이션이 끝나고 나서 다른 애니메이션을 시작할 때도 애니메이션 콜백 함수를 사용할 수 있습니다.
버튼이 `inProgress` 상태에서 깜빡이다가 API 호출이 완료되면 `closed` 상태가 되면서 다른 애니메이션을 시작할 수 있습니다.

애니메이션을 활용하면 작업이 실제로 끝나지 않았더라도 작업이 좀 더 빠르게 진행되는 것처럼 느껴집니다.
그래서 애니메이션을 약간만 추가해도 사용자의 만족도를 크게 개선할 수 있습니다. 서버의 실행속도나 네트워크 연결 상태와 같이 개선하기 어려운 문제를 신경쓰는 것보다 훨씬 효율적입니다.

콜백 함수는 디버깅 용도로 사용할 수도 있습니다. 애니메이션 콜백 함수에 맞춰서 애플리케이션의 진행정보를 `console.warn()`과 같은 함수로 출력해볼 수도 있습니다.

아래 예제 코드는 애니메이션 이벤트에 맞춰서 애니메이션 정보를 로그로 출력하는 컴포넌트 코드입니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="events" language="typescript"></code-example>


{@a keyframes}

<!--
## Keyframes
-->
## 키프레임(keyframes)

<!--
The previous section features a simple two-state transition. Now create an animation with multiple steps run in sequence using *keyframes*.

Angular's `keyframe()` function is similar to keyframes in CSS. Keyframes allow several style changes within a single timing segment.
For example, the button, instead of fading, could change color several times over a single 2-second timespan.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-500.png" alt="keyframes">
</div>

The code for this color change might look like this.

<code-example path="animations/src/app/status-slider.component.ts" header="src/app/status-slider.component.ts" region="keyframes" language="typescript"></code-example>
-->
이전 섹션에서는 두 상태를 전환하는 간단한 트랜지션에 대해 알아봤습니다. 이번에는 키프레임을 사용해서 여러 단계로 실행되는 애니메이션을 만들어 봅시다.

Angular의 `keyframe()` 함수는 CSS에서 사용하는 키프레임과 비슷합니다. 키프레임은 한 재생시간 안에서 여러번 스타일을 변경할 때 사용합니다.
예를 들면 버튼의 투명도를 조절하는 대신 2초에 걸쳐 색상을 변경하는 식으로 활용할 수 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-500.png" alt="keyframes">
</div>

이 애니메이션은 다음과 같이 구현합니다.

<code-example path="animations/src/app/status-slider.component.ts" header="src/app/status-slider.component.ts" region="keyframes" language="typescript"></code-example>


<!--
### Offset
-->
### 오프셋(offset)

<!--
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
-->
애니메이션의 키프레임 타이밍을 조절하려면 *오프셋(offset)*을 지정하면 됩니다.
오프셋은 애니메이션이 시작되는 지점부터 종료되는 지점을 0부터 1사이의 상대값으로 표현합니다.

키프레임 오프셋은 생략할 수 있는데 오프셋을 생략하면 남은 시간을 같은 비율로 나눠서 자동으로 할당됩니다.
그래서 3개의 키프레임을 오프셋 선언 없이 사용하면 이 키프레임들의 오프셋은 0, 0.5, 1이 됩니다.
그리고 가운데 오프셋을 0.8로 지정하면 이 애니메이션은 이렇게 표현됩니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-offset-500.png" alt="keyframes with offset">
</div>

이 애니메이션은 다음과 같이 구현합니다:

<code-example path="animations/src/app/status-slider.component.ts" header="src/app/status-slider.component.ts" region="keyframesWithOffsets" language="typescript">
</code-example>

물론 키프레임은 `duration`, `delay`, `easing`과 함께 사용할 수도 있습니다.


<!--
### Keyframes with a pulsation
-->
### 깜빡이는 애니메이션

<!--
Use keyframes to create a pulse effect in your animations by defining styles at specific offset throughout the animation.

Here's an example of using keyframes to create a pulse effect:

* The original `open` and `closed` states, with the original changes in height, color, and opacity, occurring over a timeframe of 1 second.

* A keyframes sequence inserted in the middle that causes the button to appear to pulsate irregularly over the course of that same 1-second timeframe.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-pulsation.png" alt="keyframes with irregular pulsation">
</div>

The code snippet for this animation might look like this.

<code-example path="animations/src/app/open-close.component.1.ts" header="src/app/open-close.component.ts" region="trigger" language="typescript"></code-example>
-->
키프레임에 오프셋을 활용하면 깜빡이는 애니메이션을 구현할 수 있습니다.

* 원래 `open`, `closed` 상태에는 버튼으 높이, 색상, 투명도를 1초동안 변경하는 애니메이션이 적용되어 있습니다.

* 이 애니메이션 중간에 투명도를 조절하면서 버튼이 깜빡이는 효과를 추가해 봅시다.

<div class="lightbox">
  <img src="generated/images/guide/animations/keyframes-pulsation.png" alt="keyframes with irregular pulsation">
</div>

이 애니메이션은 이렇게 구현합니다.

<code-example path="animations/src/app/open-close.component.1.ts" header="src/app/open-close.component.ts" region="trigger" language="typescript"></code-example>


<!--
### Animatable properties and units
-->
### 애니메이션을 적용할 수 있는 프로퍼티와 단위

<!--
Angular's animation support builds on top of web animations, so you can animate any property that the browser considers animatable.
This includes positions, sizes, transforms, colors, borders, and more. The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) page.

For positional properties with a numeric value, define a unit by providing the value as a string, in quotes, with the appropriate suffix:

* 50 pixels: `'50px'`
* Relative font size: `'3em'`
* Percentage: `'100%'`

If you don't provide a unit when specifying dimension, Angular assumes a default unit of pixels, or px.
Expressing 50 pixels as `50` is the same as saying `'50px'`.
-->
Angular 애니메이션은 웹 표준 애니메이션을 기반으로 동작합니다. 그래서 브라우저에서 애니메이션을 지원하는 프로퍼티는 모두 Angular 애니메이션 대상이 될 수 있습니다.
엘리먼트의 위치나 크기, transform 속성, 색상, 외곽선 등이 대상이 될 수 있습니다. 애니메이션을 적용할 수 있는 프로퍼티 전체 목록은 [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) 문서를 참고하세요.

그리고 위치나 크기와 관련된 프로퍼티는 단위를 붙여서 다음과 같이 문자열로 지정할 수도 있습니다:

* 50픽셀: `'50px'`
* 상대 폰트 크기: `'3em'`
* 퍼센트: `'100%'`

단위를 생략했을 때 Angular가 기본으로 붙이는 단위는 픽셀입니다.
그래서 `50`이라고 지정한 것과 `'50px'`은 같은 의미입니다.


<!--
### Automatic property calculation with wildcards
-->
### 와일드카드로 프로퍼티값 자동 계산하기

<!--
Sometimes you don't know the value of a dimensional style property until runtime.
For example, elements often have widths and heights that depend on their content and the screen size.
These properties are often challenging to animate using CSS.

In these cases, you can use a special wildcard `*` property value under `style()`, so that the value of that particular style property is computed at runtime and then plugged into the animation.

The following example has a trigger called `shrinkOut`, used when an HTML element leaves the page.
The animation takes whatever height the element has before it leaves, and animates from that height to zero.
-->
스타일 프로퍼티의 값은 실행시점에서만 알 수 있는 경우가 있습니다.
내용의 양이나 화면 크기에 따라서 엘리먼트의 너비와 높이가 조절되기도 합니다.
이런 프로퍼티에 CSS 애니메이션을 적용하는 것은 까다로운 일입니다.

이런 경우에 `style()` 함수와 와일드카드 `*` 프로퍼티 값을 활용하면 애니메이션에 사용되는 프로퍼티 값이 실행시점에 자동으로 계산되어 애니메이션에 적용됩니다.

아래 예제는 HTML 엘리먼트가 화면에서 사라질 때 실행되는 `shrinkOut` 트리거를 정의한 코드입니다.
이 트리거가 적용된 엘리먼트는 화면에서 사라지기 전의 높이가 어떤 값이냐에 관계없이 0으로 변경됩니다.

<code-example path="animations/src/app/hero-list-auto.component.ts" header="src/app/hero-list-auto.component.ts" region="auto-calc" language="typescript"></code-example>


<!--
### Keyframes summary
-->
### 키프레임 정리

<!--
The `keyframes()` function in Angular allows you to specify multiple interim styles within a single transition, with an optional offset to define the point in the animation where each style change occurs.
-->
`keyframes()` 함수를 활용하면 한 트랜지션 안에서 여러 스타일을 다양하게 적용할 수 있습니다. 그리고 오프셋을 활용하면 각 스타일이 어느 시점에 적용될지도 지정할 수 있습니다.

<!--
## More on Angular animations
-->
## Angular 애니메이션 더 알아보기

<!--
You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Complex animation sequences](guide/complex-animation-sequences)
* [Reusable animations](guide/reusable-animations)
* [Route transition animations](guide/route-animations)
-->
다음 내용에 대해서도 알아보세요:

* [Angular 애니메이션 소개](guide/animations)
* [복잡한 애니메이션 시퀀스](guide/complex-animation-sequences)
* [애니메이션 재사용하기](guide/reusable-animations)
* [라우팅 애니메이션](guide/route-animations)
