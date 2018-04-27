<!--
# Component Interaction
-->
# 컴포넌트 통신

{@a top}

<!--
This cookbook contains recipes for common component communication scenarios
in which two or more components share information.
-->
이 가이드 문서는 둘 이상의 컴포넌트가 서로 데이터를 공유하는 방법을 다룹니다.

{@a toc}

<!--

# Contents

* [Pass data from parent to child with input binding](guide/component-interaction#parent-to-child)
* [Intercept input property changes with a setter](guide/component-interaction#parent-to-child-setter)
* [Intercept input property changes with `ngOnChanges()`](guide/component-interaction#parent-to-child-on-changes)
* [Parent calls an `@ViewChild()`](guide/component-interaction#parent-to-view-child)
* [Parent and children communicate via a service](guide/component-interaction#bidirectional-service)

-->

<!--
**See the <live-example name="component-interaction"></live-example>**.
-->
**이 장에서 다루는 예제는 <live-example name="component-interaction"></live-example>에서 확인할 수 있습니다.**

{@a parent-to-child}

<!--
## Pass data from parent to child with input binding
-->
## 부모 컴포넌트에서 자식 컴포넌트로 데이터 전달하기 : 입력 바인딩

<!--
`HeroChildComponent` has two ***input properties***,
typically adorned with [@Input decorations](guide/template-syntax#inputs-outputs).
-->
`HeroChildComponent`에는 ***입력 프로퍼티***가 두 개 있습니다. 이 프로퍼티들은 [@Input 데코레이터](guide/template-syntax#inputs-outputs)를 사용해서 선언합니다.

<code-example path="component-interaction/src/app/hero-child.component.ts" title="component-interaction/src/app/hero-child.component.ts">

</code-example>


<!--
The second `@Input` aliases the child component property name `masterName` as `'master'`.
-->
이 코드에 사용된 두 번째 `@Input`은 `masterName` 프로퍼티를 외부에서 바인딩 할 때 `'master'`라는 이름으로 사용하기 위한 선언이 추가되어 있습니다.

<!--
The `HeroParentComponent` nests the child `HeroChildComponent` inside an `*ngFor` repeater,
binding its `master` string property to the child's `master` alias,
and each iteration's `hero` instance to the child's `hero` property.
-->
`HeroParentComponent`는 `*ngFor`를 사용해서 배열에 있는 항목마다 `HeroChildComponent`를 만드는데,
각 컴포넌트를 만들때마다 `master` 문자열 프로퍼티를 자식 컴포넌트의 `master`로 연결하고,
반복되는 `hero` 인스턴스를 자식 컴포넌트의 `hero` 프로퍼티로 바인딩 합니다.

<code-example path="component-interaction/src/app/hero-parent.component.ts" title="component-interaction/src/app/hero-parent.component.ts">

</code-example>


<!--
The running application displays three heroes:
-->
그리고 이 애플리케이션을 실행하면 다음과 같이 세 명의 히어로가 표시됩니다:


<figure>
  <img src="generated/images/guide/component-interaction/parent-to-child.png" alt="Parent-to-child">
</figure>


<!--
<h3 class="no-toc">Test it</h3>
-->
<h3 class="no-toc">동작 확인</h3>

<!--
E2E test that all children were instantiated and displayed as expected:
-->
반복문을 순회하며 각각의 히어로마다 결과를 제대로 표시하는지 확인하기 위해 E2E 테스트 환경을 다음과 같이 설정합니다:

<code-example path="component-interaction/e2e/app.e2e-spec.ts" region="parent-to-child" title="component-interaction/e2e/app.e2e-spec.ts">

</code-example>


<!--
[Back to top](guide/component-interaction#top)
-->
[맨 위로](guide/component-interaction#top)

{@a parent-to-child-setter}

<!--
## Intercept input property changes with a setter
-->
## 입력 프로퍼티를 세터(setter)로 가로채기

<!--
Use an input property setter to intercept and act upon a value from the parent.
-->
부모 컴포넌트에서 값이 전달될 때 추가 로직을 실행하기 위해 입력 프로퍼티에 세터를 사용해 봅시다.

<!--
The setter of the `name` input property in the child `NameChildComponent`
trims the whitespace from a name and replaces an empty value with default text.
-->
자식 컴포넌트인 `NameChildComponent`의 입력 프로퍼티인 `name`에 세터를 연결해서 전달되는 문자열의 여백 문자를 다른 문자로 변경해 봅시다.

<code-example path="component-interaction/src/app/name-child.component.ts" title="component-interaction/src/app/name-child.component.ts">

</code-example>


<!--
Here's the `NameParentComponent` demonstrating name variations including a name with all spaces:
-->
그리고 부모 컴포넌트인 `NameParentComponent`는 자식 컴포넌트에 다음과 같이 몇 가지 경우를 적용해 봅니다:


<code-example path="component-interaction/src/app/name-parent.component.ts" title="component-interaction/src/app/name-parent.component.ts">

</code-example>



<figure>
  <img src="generated/images/guide/component-interaction/setter.png" alt="Parent-to-child-setter">
</figure>


<!--
<h3 class="no-toc">Test it</h3>
-->
<h3 class="no-toc">동작 확인</h3>

<!--
E2E tests of input property setter with empty and non-empty names:
-->
입력 프로퍼티 세터를 테스트하는 E2E 환경은 다음과 같이 설정합니다:

<code-example path="component-interaction/e2e/app.e2e-spec.ts" region="parent-to-child-setter" title="component-interaction/e2e/app.e2e-spec.ts">

</code-example>


<!--
[Back to top](guide/component-interaction#top)
-->
[맨 위로](guide/component-interaction#top)

{@a parent-to-child-on-changes}

<!--
## Intercept input property changes with *ngOnChanges()*
-->
## *ngOnChanges()*로 입력 프로퍼티 가로채기

<!--
Detect and act upon changes to input property values with the `ngOnChanges()` method of the `OnChanges` lifecycle hook interface.
-->
입력 프로퍼티는 `OnChanges` 라이프싸이클 후킹 인터페이스를 사용하는 `ngOnChanges()` 메소드로도 가로챌 수 있습니다.

<div class="l-sub-section">


<!--
You may prefer this approach to the property setter when watching multiple, interacting input properties.

Learn about `ngOnChanges()` in the [LifeCycle Hooks](guide/lifecycle-hooks) chapter.
-->
입력 프로퍼티 여러개를 가로채야 한다면 세터를 사용하는 것보다 이 방식이 더 편할 수 있습니다.

`ngOnChanges()` 함수에 대한 자세한 설명은 [라이프싸이클 후킹](guide/lifecycle-hooks) 문서를 참고하세요.

</div>


<!--
This `VersionChildComponent` detects changes to the `major` and `minor` input properties and composes a log message reporting these changes:
-->
`VersionChildComponent`는 `major`와 `minor` 두 입력 프로퍼티 값이 변경되는 것을 감지하고 이 내용을 로그로 출력합니다:

<code-example path="component-interaction/src/app/version-child.component.ts" title="component-interaction/src/app/version-child.component.ts">

</code-example>


<!--
The `VersionParentComponent` supplies the `minor` and `major` values and binds buttons to methods that change them.
-->
그리고 부모 컴포넌트인 `VersionParentComponent`는 자식 컴포넌트에 바인딩되는 `minor`, `major` 두 값을 버튼으로 조정합니다.

<code-example path="component-interaction/src/app/version-parent.component.ts" title="component-interaction/src/app/version-parent.component.ts">

</code-example>


<!--
Here's the output of a button-pushing sequence:
-->
버튼을 눌렀을 때 화면은 다음과 같습니다:

<figure>
  <img src="generated/images/guide/component-interaction/parent-to-child-on-changes.gif" alt="Parent-to-child-onchanges">
</figure>


<!--
<h3 class="no-toc">Test it</h3>
-->
<h3 class="no-toc">동작 확인</h3>

<!--
Test that ***both*** input properties are set initially and that button clicks trigger
the expected `ngOnChanges` calls and values:
-->
***두*** 입력 프로퍼티는 초기값이 설정된 이후에 버튼을 누를 때마다 변경되면서 `ngOnChanges()`를 실행하는데, 이 동작을 테스트하는 E2E 환경을 다음과 같이 정의합니다:

<code-example path="component-interaction/e2e/app.e2e-spec.ts" region="parent-to-child-onchanges" title="component-interaction/e2e/app.e2e-spec.ts">

</code-example>

<!--
[Back to top](guide/component-interaction#top)
-->
[맨 위로](guide/component-interaction#top)

{@a child-to-parent}

## Parent listens for child event

The child component exposes an `EventEmitter` property with which it `emits` events when something happens.
The parent binds to that event property and reacts to those events.

The child's `EventEmitter` property is an ***output property***,
  typically adorned with an [@Output decoration](guide/template-syntax#inputs-outputs)
  as seen in this `VoterComponent`:


<code-example path="component-interaction/src/app/voter.component.ts" title="component-interaction/src/app/voter.component.ts">

</code-example>



Clicking a button triggers emission of a `true` or `false`, the boolean *payload*.

The parent `VoteTakerComponent` binds an event handler called `onVoted()` that responds to the child event
payload `$event` and updates a counter.


<code-example path="component-interaction/src/app/votetaker.component.ts" title="component-interaction/src/app/votetaker.component.ts">

</code-example>



The framework passes the event argument&mdash;represented by `$event`&mdash;to the handler method,
and the method processes it:


<figure>
  <img src="generated/images/guide/component-interaction/child-to-parent.gif" alt="Child-to-parent">
</figure>



<h3 class="no-toc">Test it</h3>

Test that clicking the *Agree* and *Disagree* buttons update the appropriate counters:


<code-example path="component-interaction/e2e/app.e2e-spec.ts" region="child-to-parent" title="component-interaction/e2e/app.e2e-spec.ts">

</code-example>



[Back to top](guide/component-interaction#top)



## Parent interacts with child via *local variable*

A parent component cannot use data binding to read child properties
or invoke child methods. You can do both
by creating a template reference variable for the child element
and then reference that variable *within the parent template*
as seen in the following example.

{@a countdown-timer-example}
The following is a child `CountdownTimerComponent` that repeatedly counts down to zero and launches a rocket.
It has `start` and `stop` methods that control the clock and it displays a
countdown status message in its own template.

<code-example path="component-interaction/src/app/countdown-timer.component.ts" title="component-interaction/src/app/countdown-timer.component.ts">

</code-example>



The `CountdownLocalVarParentComponent` that hosts the timer component is as follows:


<code-example path="component-interaction/src/app/countdown-parent.component.ts" region="lv" title="component-interaction/src/app/countdown-parent.component.ts">

</code-example>



The parent component cannot data bind to the child's
`start` and `stop` methods nor to its `seconds` property.

You can place a local variable, `#timer`, on the tag `<countdown-timer>` representing the child component.
That gives you a reference to the child component and the ability to access
*any of its properties or methods* from within the parent template.

This example wires parent buttons to the child's `start` and `stop` and
uses interpolation to display the child's `seconds` property.

Here we see the parent and child working together.


<figure>
  <img src="generated/images/guide/component-interaction/countdown-timer-anim.gif" alt="countdown timer">
</figure>



{@a countdown-tests}


<h3 class="no-toc">Test it</h3>

Test that the seconds displayed in the parent template
match the seconds displayed in the child's status message.
Test also that clicking the *Stop* button pauses the countdown timer:


<code-example path="component-interaction/e2e/app.e2e-spec.ts" region="countdown-timer-tests" title="component-interaction/e2e/app.e2e-spec.ts">

</code-example>



[Back to top](guide/component-interaction#top)

{@a parent-to-view-child}

## Parent calls an _@ViewChild()_

The *local variable* approach is simple and easy. But it is limited because
the parent-child wiring must be done entirely within the parent template.
The parent component *itself* has no access to the child.

You can't use the *local variable* technique if an instance of the parent component *class*
must read or write child component values or must call child component methods.

When the parent component *class* requires that kind of access,
***inject*** the child component into the parent as a *ViewChild*.

The following example illustrates this technique with the same
[Countdown Timer](guide/component-interaction#countdown-timer-example) example.
Neither its appearance nor its behavior will change.
The child [CountdownTimerComponent](guide/component-interaction#countdown-timer-example) is the same as well.

<div class="l-sub-section">



The switch from the *local variable* to the *ViewChild* technique
is solely for the purpose of demonstration.

</div>



Here is the parent, `CountdownViewChildParentComponent`:

<code-example path="component-interaction/src/app/countdown-parent.component.ts" region="vc" title="component-interaction/src/app/countdown-parent.component.ts">

</code-example>



It takes a bit more work to get the child view into the parent component *class*.

First, you have to import references to the `ViewChild` decorator and the `AfterViewInit` lifecycle hook.

Next, inject the child `CountdownTimerComponent` into the private `timerComponent` property
via the `@ViewChild` property decoration.

The `#timer` local variable is gone from the component metadata.
Instead, bind the buttons to the parent component's own `start` and `stop` methods and
present the ticking seconds in an interpolation around the parent component's `seconds` method.

These methods access the injected timer component directly.

The `ngAfterViewInit()` lifecycle hook is an important wrinkle.
The timer component isn't available until *after* Angular displays the parent view.
So it displays `0` seconds initially.

Then Angular calls the `ngAfterViewInit` lifecycle hook at which time it is *too late*
to update the parent view's display of the countdown seconds.
Angular's unidirectional data flow rule prevents updating the parent view's
in the same cycle. The app has to *wait one turn* before it can display the seconds.

Use `setTimeout()` to wait one tick and then revise the `seconds()` method so
that it takes future values from the timer component.

<h3 class="no-toc">Test it</h3>

Use [the same countdown timer tests](guide/component-interaction#countdown-tests) as before.

[Back to top](guide/component-interaction#top)

{@a bidirectional-service}

## Parent and children communicate via a service

A parent component and its children share a service whose interface enables bi-directional communication
*within the family*.

The scope of the service instance is the parent component and its children.
Components outside this component subtree have no access to the service or their communications.

This `MissionService` connects the `MissionControlComponent` to multiple `AstronautComponent` children.


<code-example path="component-interaction/src/app/mission.service.ts" title="component-interaction/src/app/mission.service.ts">

</code-example>



The `MissionControlComponent` both provides the instance of the service that it shares with its children
(through the `providers` metadata array) and injects that instance into itself through its constructor:


<code-example path="component-interaction/src/app/missioncontrol.component.ts" title="component-interaction/src/app/missioncontrol.component.ts">

</code-example>



The `AstronautComponent` also injects the service in its constructor.
Each `AstronautComponent` is a child of the `MissionControlComponent` and therefore receives its parent's service instance:


<code-example path="component-interaction/src/app/astronaut.component.ts" title="component-interaction/src/app/astronaut.component.ts">

</code-example>



<div class="l-sub-section">



Notice that this example captures the `subscription` and `unsubscribe()` when the `AstronautComponent` is destroyed.
This is a memory-leak guard step. There is no actual risk in this app because the
lifetime of a `AstronautComponent` is the same as the lifetime of the app itself.
That *would not* always be true in a more complex application.

You don't add this guard to the `MissionControlComponent` because, as the parent,
it controls the lifetime of the `MissionService`.

</div>



The *History* log demonstrates that messages travel in both directions between
the parent `MissionControlComponent` and the `AstronautComponent` children,
facilitated by the service:


<figure>
  <img src="generated/images/guide/component-interaction/bidirectional-service.gif" alt="bidirectional-service">
</figure>



<h3 class="no-toc">Test it</h3>

Tests click buttons of both the parent `MissionControlComponent` and the `AstronautComponent` children
and verify that the history meets expectations:


<code-example path="component-interaction/e2e/app.e2e-spec.ts" region="bidirectional-service" title="component-interaction/e2e/app.e2e-spec.ts">

</code-example>



[Back to top](guide/component-interaction#top)
