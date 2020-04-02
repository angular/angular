<!--
# Complex animation sequences
-->
# 복잡한 애니메이션 시퀀스

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following concepts:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)

<hr>

So far, we've learned simple animations of single HTML elements. Angular also lets you animate coordinated sequences, such as an entire grid or list of elements as they enter and leave a page. You can choose to run multiple animations in parallel, or run discrete animations sequentially, one following another.

Functions that control complex animation sequences are as follows:

* `query()` finds one or more inner HTML elements.
* `stagger()` applies a cascading delay to animations for multiple elements.
* [`group()`](api/animations/group) runs multiple animation steps in parallel.
* `sequence()` runs animation steps one after another.
-->
다음 내용은 미리 이해하고 이 문서를 보는 것이 좋습니다:

* [Angular 애니메이션 소개](guide/animations)
* [트랜지션 & 트리거](guide/transition-and-triggers)

<hr>

지금까지는 HTML 엘리먼트 하나에 애니메이션을 하나만 연결해 봤습니다. 그런데 Angular에서는 복잡한 순서로 진행되는 애니메이션도 구현할 수 있습니다. 그리드 전체가 움직이거나 목록에 있는 엘리먼트 각각이 화면에 나타나거나 화면에서 사라지는 애니메이션도 구현할 수 있습니다. 이런 애니메이션은 동시에 실행할 수도 있으며 순서대로 실행할 수도 있고, 다른 애니메이션이 끝나면 실행할 수 있습니다.

복잡한 애니메이션 시퀀스는 다음 함수들을 사용해서 구현합니다:

* `query()` &mdash; 자식 HTML 엘리먼트를 찾을 때 사용합니다.
* `stagger()` &mdash; 엘리먼트 여러개에 있는 애니메이션에 순차적으로 딜레이를 줄 때 사용합니다.
* [`group()`](api/animations/group) &mdash; 여러 애니메이션을 동시에 시작할 때 사용합니다.
* `sequence()` &mdash; 애니메이션을 순서대로 시작할 때 사용합니다.


{@a complex-sequence}

<!--
## Animate multiple elements using query() and stagger() functions
-->
## 여러 엘리먼트에 있는 애니메이션 시작하기: `query()`, `stagger()`

<!--
The `query()` function allows you to find inner elements within the element that is being animated. This function targets specific HTML elements within a parent component and applies animations to each element individually. Angular intelligently handles setup, teardown, and cleanup as it coordinates the elements across the page.

The `stagger()` function allows you to define a timing gap between each queried item that is animated and thus animates elements with a delay between them.

The Filter/Stagger tab in the live example shows a list of heroes with an introductory sequence. The entire list of heroes cascades in, with a slight delay from top to bottom.

The following example demonstrates how to use `query()` and `stagger()` functions on the entry of an animated element.

* Use `query()` to look for an element entering the page that meets certain criteria.

* For each of these elements, use `style()` to set the same initial style for the element. Make it invisible and use `transform` to move it out of position so that it can slide into place.

* Use `stagger()` to delay each animation by 30 milliseconds.

* Animate each element on screen for 0.5 seconds using a custom-defined easing curve, simultaneously fading it in and un-transforming it.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="page-animations" language="typescript"></code-example>
-->
`query()` 함수를 사용하면 자식 엘리먼트 중에서 애니메이션이 필요한 엘리먼트를 탐색할 수 있습니다. 이 함수는 부모 컴포넌트를 기준으로 HTML 엘리먼트를 찾아서 개별 엘리먼트에 애니메이션을 적용할 수 있습니다. 개발자가 지정하지 않은 세세한 설정은 Angular가 알아서 처리합니다.

`stagger()` 함수를 사용하면 이렇게 쿼리한 항목을 순차적으로 시작할 수 있도록 지연시간을 조정할 수 있습니다.

라이브 예제 앱에서 Filter/Stagger 탭을 보면 히어로의 목록이 순서대로 표시됩니다. 이 때 애니메이션이 적용된 항목은 히어로 목록 전체이며, 위에서 아래로 순차적으로 표시되도록 구현되었습니다.

아래 예제를 보면 `query()` 함수와 `stagger()` 함수가 사용된 것을 확인할 수 있습니다.

* 화면에 나타나는 엘리먼트는 `query()`로 탐색합니다.

* 애니메이션이 적용될 엘리먼트의 초기 스타일을 지정하기 위해 `style()`을 사용했습니다. 이번 예제에서는 `transform`을 사용해서 화면 밖에 있다가 나타나도록 구현샜습니다.

* 각 애니메이션을 30ms마다 순서대로 실행하기 위해 `stagger()` 함수를 사용했습니다.

* 각 애니메이션은 0.5초에 걸쳐 진행되며, 가속도 커브는 커스텀으로 지정했고 투명도가 조절되고 `transform`이 해제되는 방식으로 화면에 표시됩니다.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="page-animations" language="typescript"></code-example>


<!--
## Parallel animation using group() function
-->
## 애니메이션 동시에 시작하기: `group()`

<!--
You've seen how to add a delay between each successive animation. But you may also want to configure animations that happen in parallel. For example, you may want to animate two CSS properties of the same element but use a different `easing` function for each one. For this, you can use the animation [`group()`](api/animations/group) function.

<div class="alert is-helpful">

**Note:** The [`group()`](api/animations/group) function is used to group animation *steps*, rather than animated elements.
</div>

In the following example, using groups on both `:enter` and `:leave` allow for two different timing configurations. They're applied to the same element in parallel, but run independently.

<code-example path="animations/src/app/hero-list-groups.component.ts" region="animationdef" header="src/app/hero-list-groups.component.ts (excerpt)" language="typescript"></code-example>
-->
개별 애니메이션은 조금씩 딜레이를 주면서 시작할 수도 있지만 동시에 시작하는 애니메이션이 필요한 때도 있습니다. 한 엘리먼트에 CSS 프로퍼티 2개를 애니메이션으로 조정하지만 이 애니메이션에 서로 다른 `easing` 함수를 사용하는 경우가 그렇습니다. 이렇게 구현하려면 [`group`](api/animations/group) 함수를 사용하면 됩니다.

<div class="alert is-helpful">

**참고:** [`group()`](api/animations/group) 함수는 여러 엘리먼트를 묶는 것이 아니라 애니메이션 *스텝(step)*을 묶는 용도로 사용합니다.

</div>

아래 코드는 `:enter` 트랜지션과 `:leave` 트랜지션에 서로 다른 타이밍을 지정하는 예제 코드입니다. 한 엘리먼트에 있는 애니메이션을 동시에 시작하더라도 이 애니메이션은 서로 독립적으로 동작합니다.

<code-example path="animations/src/app/hero-list-groups.component.ts" region="animationdef" header="src/app/hero-list-groups.component.ts (일부)" language="typescript"></code-example>


<!--
## Sequential vs. parallel animations
-->
## 순서대로 시작하기 vs. 동시에 시작하기

<!--
Complex animations can have many things happening at once. But what if you want to create an animation involving several animations happening one after the other? Earlier we used [`group()`](api/animations/group) to run multiple animations all at the same time, in parallel.

A second function called `sequence()` lets you run those same animations one after the other. Within `sequence()`, the animation steps consist of either `style()` or `animate()` function calls.

* Use `style()` to apply the provided styling data immediately.
* Use `animate()` to apply styling data over a given time interval.
-->
복잡한 애니메이션은 한 번에 모든 것을 처리할 수도 있습니다. 하지만 어떤 애니메이션이 끝난 이후에 다른 애니메이션을 시작해야 한다면 어떻게 해야 할까요?

이전 섹션에서는 [`group()`](api/animations/group) 함수를 사용해서 여러 애니메이션을 동시에 시작하는 방법에 대해 알아봤습니다.
이번에는 `sequence()` 함수를 사용해서 애니메이션이 끝난 후에 다른 애니메이션이 시작되도록 구현해 봅시다. `sequence()` 함수에서 각 애니메이션 단계는 `style()`이나 `animate()` 함수로 구성됩니다.

* 스타일을 바로 반영하려면 `style()`을 사용합니다.
* 스타일을 천천히 전환하려면 `animate()`를 사용합니다.


<!--
## Filter animation example
-->
## 필터 애니메이션 예제

<!--
Let's take a look at another animation on the live example page. Under the Filter/Stagger tab, enter some text into the **Search Heroes** text box, such as `Magnet` or `tornado`.

The filter works in real time as you type. Elements leave the page as you type each new letter and the filter gets progressively stricter. The heroes list gradually re-enters the page as you delete each letter in the filter box.

The HTML template contains a trigger called `filterAnimation`.

<code-example path="animations/src/app/hero-list-page.component.html" header="src/app/hero-list-page.component.html" region="filter-animations"></code-example>

The component file contains three transitions.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="filter-animations" language="typescript"></code-example>

The animation does the following:

* Ignores any animations that are performed when the user first opens or navigates to this page. The filter narrows what is already there, so it assumes that any HTML elements to be animated already exist in the DOM.

* Performs a filter match for matches.

For each match:

* Hides the element by making it completely transparent and infinitely narrow, by setting its opacity and width to 0.

* Animates in the element over 300 milliseconds. During the animation, the element assumes its default width and opacity.

* If there are multiple matching elements, staggers in each element starting at the top of the page, with a 50-millisecond delay between each element.
-->
예제 앱에 있는 다른 애니메이션에 대해 알아봅시다. Filter/Stagger 탭에 있는 **Search Heroes** 입력 필드에 `Magnet`이나 `tornado`와 같은 텍스트를 입력해 보세요.

그러면 사용자가 글자를 하나씩 입력할 때마다 검색조건에 해당되지 않는 엘리먼트는 화면에서 사라지는 필터가 동작합니다. 그리고 글자를 하나씩 지우면 변경된 조건에 맞는 엘리먼트는 다시 화면에 나타납니다.

이 애니메이션이 적용된 컴포넌트 템플릿은 이렇습니다. 트리거 이름은 `filterAnimation` 입니다.

<code-example path="animations/src/app/hero-list-page.component.html" header="src/app/hero-list-page.component.html" region="filter-animations"></code-example>

그리고 컴포넌트 클래스 파일의 내용은 이렇습니다.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="filter-animations" language="typescript"></code-example>

애니메이션은 이렇게 동작합니다:

* 사용자가 화면을 전환할 때 진행되는 애니메이션은 무시합니다. 필터가 처음 동작할 때는 해당 화면의 HTML 엘리먼트는 모두 DOM에 존재하고 있던 것으로 간주합니다.

* 키를 입력할 때마다 필터가 동작합니다.

각 키 입력마다:

* 사라지는 엘리먼트는 투명하고 너비를 좁게 만들기 위해 `opacity`와 `width`를 조절합니다.

* 엘리먼트 애니메이션은 300ms 동안 진행됩니다.

* 조건에 맞는 엘리먼트가 여러개라면 각 엘리먼트마다 50ms 딜레이를 두면서 순차적으로 시작합니다.


<!--
## Animation sequence summary
-->
## 애니메이션 시퀀스 정리

<!--
Angular functions for animating multiple elements start with `query()` to find inner elements, for example gathering all images within a `<div>`. The remaining functions, `stagger()`, [`group()`](api/animations/group), and `sequence()`, apply cascades or allow you to control how multiple animation steps are applied.
-->
`query()` 함수를 사용하면 자식 엘리먼트 중에서 애니메이션을 적용할 엘리먼트를 탐색할 수 있습니다. 그래서 `<div>` 안에 있는 모든 이미지 엘리먼트를 모으는 용도로 활용할 수 있습니다. 그리고 `stagger()`나 [`group()`](api/animations/group), `sequence()`를 사용하면 여러 애니메이션이 어떻게 시작될지 지정할 수 있습니다.


<!--
## More on Angular animations
-->
## 애니메이션 더 알아보기

<!--
You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Reusable animations](guide/reusable-animations)
* [Route transition animations](guide/route-animations)
-->
다음 내용에 대해서도 알아보세요:

* [Angular 애니메이션 소개](guide/animations)
* [트랜지션 & 트리거](guide/transition-and-triggers)
* [애니메이션 재사용하기](guide/reusable-animations)
* [페이지 전환 애니메이션](guide/route-animations)