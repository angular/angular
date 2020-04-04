<!--
# Reusable animations
-->
# 애니메이션 재사용하기

<!--
#### Prerequisites
-->
#### 사전지식

<!--
A basic understanding of the following concepts:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)

<hr>

The [AnimationOptions](https://angular.io/api/animations/AnimationOptions) interface in Angular animations enables you to create animations that you can reuse across different components.
-->
다음 내용은 미리 이해하고 이 문서를 보는 것이 좋습니다:

* [Angular 애니메이션 소개](guide/animations)
* [트랜지션 & 트리거](guide/transition-and-triggers)

<hr>

애니메이션을 정의해두고 여러 컴포넌트에서 사용하려면 [AnimationOptions](https://angular.io/api/animations/AnimationOptions) 인터페이스를 사용해서 애니메이션을 정의하면 됩니다.


<!--
## Creating reusable animations
-->
## 애니메이션 정의하기

<!--
To create a reusable animation, use the [`animation()`](https://angular.io/api/animations/animation) method to define an animation in a separate `.ts` file and declare this animation definition as a `const` export variable. You can then import and reuse this animation in any of your app components using the [`useAnimation()`](https://angular.io/api/animations/useAnimation) API.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="reusable" language="typescript"></code-example>

In the above code snippet, `transAnimation` is made reusable by declaring it as an export variable.

<div class="alert is-helpful">

**Note:** The `height`, `opacity`, `backgroundColor`, and `time` inputs are replaced during runtime.
</div>

You can import the reusable `transAnimation` variable in your component class and reuse it using the `useAnimation()` method as shown below.

<code-example path="animations/src/app/open-close.component.3.ts" header="src/app/open-close.component.ts" region="reusable" language="typescript"></code-example>
-->
애니메이션을 재사용하려면 [`animation()`](https://angular.io/api/animations/animation) 함수를 사용해서 애니메이션만 `.ts` 파일에 따로 정의하고 이 애니메이션을 상수(`const`)로 선언한 후에 파일 외부로 공개해야 합니다. 그러면 컴포넌트 메타데이터에서 [`useAnimation()`](https://angular.io/api/animations/useAnimation) API로 이 애니메이션을 불러와서 적용할 수 있습니다. 

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="reusable" language="typescript"></code-example>

위 예제 코드에서 `transAnimation`이 재사용할 수 있도록 선언된 애니메이션입니다.

<div class="alert is-helpful">

**참고:** `height`, `opacity`, `backgroundColor`, `time`은 실행 시점에 다시 지정할 수 있습니다.

</div>

그리고 이 `transAnimation` 애니메이션은 컴포넌트 클래스 코드에 `useAnimation()` 메소드로 다음과 같이 적용합니다.

<code-example path="animations/src/app/open-close.component.3.ts" header="src/app/open-close.component.ts" region="reusable" language="typescript"></code-example>


<!--
## More on Angular animations
-->
## 더 알아보기

<!--
You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Complex animation Sequences](guide/complex-animation-sequences)
* [Route transition animations](guide/route-animations)
-->
다음 내용에 대해서도 알아보세요:

* [Angular 애니메이션 소개](guide/animations)
* [트랜지션 & 트리거](guide/transition-and-triggers)
* [복잡한 애니메이션 시퀀스](guide/complex-animation-sequences)
* [라우팅 애니메이션](guide/route-animations)