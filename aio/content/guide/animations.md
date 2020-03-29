<!--
# Introduction to Angular animations
-->
# Angular 애니메이션 소개

<!--
Animation provides the illusion of motion: HTML elements change styling over time. Well-designed animations can make your application more fun and easier to use, but they aren't just cosmetic. Animations can improve your app and user experience in a number of ways:

* Without animations, web page transitions can seem abrupt and jarring.

* Motion greatly enhances the user experience, so animations give users a chance to detect the application's response to their actions.

* Good animations intuitively call the user's attention to where it is needed.

Typically, animations involve multiple style *transformations* over time. An HTML element can move, change color, grow or shrink, fade, or slide off the page. These changes can occur simultaneously or sequentially. You can control the timing of each transformation.

Angular's animation system is built on CSS functionality, which means you can animate any property that the browser considers animatable. This includes positions, sizes, transforms, colors, borders, and more. The W3C maintains a list of animatable properties on its [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) page.
-->
애니메이션은 HTML 엘리먼트의 스타일이 시간이 가면서 변하는 것을 의미합니다.
애니메이션이 잘 활용된다면 애플리케이션을 좀 더 재미있고 사용성 좋게 만들 수 있기 때문에 겉치레인 것만은 아닙니다.
애니메이션은 이런 방식으로 도움이 됩니다:

* 애니메이션이 없으면 화면이 갑작스럽게 전환되어 부자연스러울 수 있습니다.

* 애니메이션이 있으면 사용자의 동작에 반응하는 것을 표현할 수 있기 때문에 사용자가 느끼는 앱 사용성을 크게 향상시킵니다.

* 애니메이션을 적절하게 사용하면 사용자의 관심을 앱 기획 의도에 맞게 집중시킬 수 있습니다.

일반적으로 애니메이션은 여러 스타일이 시간에 따라 *변경되는 것*을 의미합니다.
HTML 엘리먼트는 이동할 수도 있고 색이 변경될 수도 있으며, 나타나거나 사라질 수 있고 화면 밖으로 사라질 수도 있습니다.
그리고 이런 스타일은 동시에 변할 수도 있고 순차적으로 변할 수도 있습니다.
물론 변하는 시점을 세밀하게 조정할 수도 있습니다.

Angular가 제공하는 애니메이션 시스템은 CSS를 활용하기 때문에 브라우저가 지원한다면 어떤 프로퍼티에도 애니메이션을 적용할 수 있습니다.
위치, 크기, 색상, 외곽선 등의 프로퍼티가 모두 애니메이션 대상입니다.
애니메이션을 적용할 수 있는 프로퍼티 목록에 대해 알아보려면 [CSS Transitions](https://www.w3.org/TR/css-transitions-1/) 문서를 참고하세요.


<!--
## About this guide
-->
## 이 문서에 대해

<!--
This guide covers the basic Angular animation features to get you started on adding Angular animations to your project.

The features described in this guide &mdash; and the more advanced features described in the related Angular animations guides &mdash; are demonstrated in an example app available as a <live-example></live-example>.
-->
이 가이드 문서는 프로젝트에 Angular 애니메이션을 처음 적용해보는 개발자를 위해 작성되었습니다.

그리고 더 복잡한 애니메이션 기능에 대해서는 다른 문서에서 자세하게 알아봅니다.
<live-example></live-example>에서도 확인할 수 있습니다.


<!--
#### Prerequisites
-->
#### 사전지식

<!--
The guide assumes that you're familiar with building basic Angular apps, as described in the following sections:

* [Tutorial](tutorial)
* [Architecture Overview](guide/architecture)
-->
이 문서는 Angular에 대해 이미 익숙한 개발자를 대상으로 합니다.
다음 내용에 대해서는 충분히 이해하고 있는 좋습니다:

* [튜토리얼](tutorial)
* [아키텍처 개요](guide/architecture)


<!--
## Getting started
-->
## 시작하기

<!--
The main Angular modules for animations are `@angular/animations` and `@angular/platform-browser`. When you create a new project using the CLI, these dependencies are automatically added to your project.

To get started with adding Angular animations to your project, import the animation-specific modules along with standard Angular functionality.
-->
Angular 애니메이션 모듈은 `@angular/animations`과 `@angular/platform-browser`로 구성됩니다.
Angular CLI로 프로젝트를 생성하면 이 패키지들은 자동으로 프로젝트에 설치됩니다.

프로젝트에 Angular 애니메이션을 추가하려면 먼저 애니메이션과 관련된 모듈을 Angular 애플리케이션에 추가해야 합니다.


<!--
### Step 1: Enabling the animations module
-->
### 1단계: 애니메이션 모듈 활성화하기

<!--
Import `BrowserAnimationsModule`, which introduces the animation capabilities into your Angular root application module.
-->
Angular 애플리케이션 최상위 모듈에 `BrowserAnimationsModule`을 추가합니다.

<code-example path="animations/src/app/app.module.1.ts" header="src/app/app.module.ts" language="typescript"></code-example>

<div class="alert is-helpful">

<!--
**Note:** When you use the CLI to create your app, the root application module `app.module.ts` is placed in the `src/app` folder.
-->
**참고:** Angular CLI로 애플리케이션을 생성했다면 최상위 모듈은 `src/app/app.module.ts` 파일에 정의되어 있습니다.

</div>


<!--
### Step 2: Importing animation functions into component files
-->
### 2단계: 컴포넌트 파일에 애니메이션 기능 로드하기

<!--
If you plan to use specific animation functions in component files, import those functions from `@angular/animations`.
-->
컴포넌트에 애니메이션을 적용하려면 `@angular/animations` 패키지에서 다음 심볼들을 로드합니다.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="imports" language="typescript">
</code-example>

<div class="alert is-helpful">

<!--
**Note:** See a [summary of available animation functions](guide/animations#animation-api-summary) at the end of this guide.
-->
**참고:** 이 문서 마지막에서 설명하는 [애니메이션 API 목록](guide/animations#animation-api-summary)을 참고하세요.

</div>

<!--
### Step 3: Adding the animation metadata property
-->
### 3단계: 애니메이션 메타데이터 프로퍼티 추가하기

<!--
In the component file, add a metadata property called `animations:` within the `@Component()` decorator. You put the trigger that defines an animation within the `animations` metadata property.
-->
그리고 컴포넌트 파일의 `@Component()` 데코레이터에 `animations:`로 시작하는 메타데이터 프로퍼티를 추가합니다.
애니메이션의 세부 설정은 이 프로퍼티에 정의합니다.

<code-example path="animations/src/app/app.component.ts" header="src/app/app.component.ts" region="decorator" language="typescript">
</code-example>


<!--
## Animating a simple transition
-->
## 간단한 트랜지션 구현하기

<!--
Let's animate a simple transition that changes a single HTML element from one state to another. For example, you can specify that a button displays either **Open** or **Closed** based on the user's last action. When the button is in the `open` state, it's visible and yellow. When it's the `closed` state, it's transparent and green.

In HTML, these attributes are set using ordinary CSS styles such as color and opacity. In Angular, use the `style()` function to specify a set of CSS styles for use with animations. You can collect a set of styles in an animation state, and give the state a name, such as `open` or `closed`.
-->
간단한 트랜지션을 구현해보기 위해 HTML 엘리먼트의 상태를 변경해 봅시다.
사용자의 마지막 동작에 따라 화면에는 버튼에 **Open**이나 **Closed**라는 문구가 표시됩니다.
그리고 `open` 상태일 때는 버튼이 노란색이 되고 `closed` 상태일 때는 녹색이 될 것입니다.

투명도나 색상은 HTML 파일에서 일반적인 CSS 스타일을 지정하면 구현할 수 있습니다.
그리고 Angular는 이런 CSS 스타일을 애니메이션과 연결하기 위해 `style()` 함수를 사용합니다.
먼저 애니메이션 상태를 정의하기 위해 `open`이나 `closed`와 같은 상태의 이름을 선언합니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/open-closed.png" alt="open and closed states">
</div>


<!--
### Animation state and styles
-->
### 애니메이션 상태와 스타일

<!--
Use Angular's `state()` function to define different states to call at the end of each transition. This function takes two arguments: a unique name like `open` or `closed` and a `style()` function.

Use the `style()` function to define a set of styles to associate with a given state name. Note that the style attributes must be in [*camelCase*](guide/glossary#case-conventions).

Let's see how Angular's `state()` function works with the `style⁣­(⁠)` function to set CSS style attributes. In this code snippet, multiple style attributes are set at the same time for the state. In the `open` state, the button has a height of 200 pixels, an opacity of 1, and a background color of yellow.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="state1" language="typescript">
</code-example>

In the `closed` state, shown below, the button has a height of 100 pixels, an opacity of 0.5, and a background color of green.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="state2" language="typescript">
</code-example>
-->
트랜지션의 각 지점을 의미하는 애니메이션 상태는 `state()` 함수로 정의합니다.
이 함수는 두 개의 인자를 받는데, 첫번째 인자는 `open`이나 `closed`와 같은 상태 이름이고 두번째 인자는 `style()` 함수입니다.

`style()` 함수를 사용하면 상태 이름과 스타일셋을 연결할 수 있습니다.
이 때 사용하는 스타일의 이름은 반드시 [*캐멀-케이스(camelCase)*](guide/glossary#case-conventions)인 것에 주의하세요.

`state()` 함수와 `style()` 함수가 어떻게 동작하는지 확인해 봅시다.
이 예제 코드에는 상태마다 여러 스타일 어트리뷰트가 동시에 지정되어 있습니다.
`open` 상태에서 버튼의 높이는 200px이며 투명도는 1, 배경색은 노란색입니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="state1" language="typescript">
</code-example>

그리고 `closed` 상태에서 버튼의 높이는 100px이며 투명도는 0.5, 배경색은 녹색입니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" region="state2" language="typescript">
</code-example>


<!--
### Transitions and timing
-->
### 트랜지션 타이밍

<!--
In Angular, you can set multiple styles without any animation. However, without further refinement, the button instantly transforms with no fade, no shrinkage, or other visible indicator that a change is occurring.

To make the change less abrupt, we need to define an animation *transition* to specify the changes that occur between one state and another over a period of time. The `transition()` function accepts two arguments: the first argument accepts an expression that defines the direction between two transition states, and the second argument accepts one or a series of `animate()` steps.


Use the `animate()` function to define the length, delay, and easing of a transition, and to designate the style function for defining styles while transitions are taking place. You can also use the `animate()` function to define the `keyframes()` function for multi-step animations. These definitions are placed in the second argument of the `animate()` function.
-->
스타일은 애니메이션 없이도 적용할 수 있습니다.
하지만 이렇게 사용하면 버튼 스타일이 변경될 때 전환효과도 없고 크기도 갑자기 변하게 됩니다.

이런 방식 대신 일정 시간동안 애니메이션이 한 상태에서 다른 상태로 천천히 변하게 하려면 애니메이션 *트랜지션*을 정의하면 됩니다.
트랜지션은 `transition()` 함수로 정의하는데, 이 함수는 두 개의 인자를 받습니다.
첫번째 인자는 상태가 변하는 방향을 정의하는 표현식이며, 두번째 인자는 `animate()` 단계를 정의합니다.

`animate()` 함수를 사용하면 트랜지션의 길이나 시작 지연시간, 가속도를 지정할 수 있습니다.
그리고 애니메이션이 여러 단계로 구성된다면 `animate()` 함수의 두번째 인자에 `keyframes()` 함수를 사용할 수도 있습니다.

<!--
#### Animation metadata: duration, delay, and easing
-->
#### 애니메이션 메타데이터: 지속시간, 딜레이, 가속도

<!--
The `animate()` function (second argument of the transition function) accepts the `timings` and `styles` input parameters.

The `timings` parameter takes a string defined in three parts.

>`animate ('duration delay easing')`

The first part, `duration`, is required. The duration can be expressed in milliseconds as a simple number without quotes, or in seconds with quotes and a time specifier. For example, a duration of a tenth of a second can be expressed as follows:

* As a plain number, in milliseconds: `100`

* In a string, as milliseconds: `'100ms'`

* In a string, as seconds: `'0.1s'`

The second argument, `delay`, has the same syntax as `duration`. For example:

* Wait for 100ms and then run for 200ms: `'0.2s 100ms'`

The third argument, `easing`, controls how the animation [accelerates and decelerates](http://easings.net/) during its runtime. For example, `ease-in` causes the animation to begin slowly, and to pick up speed as it progresses.

* Wait for 100ms, run for 200ms. Use a deceleration curve to start out fast and slowly decelerate to a resting point: `'0.2s 100ms ease-out'`

* Run for 200ms, with no delay. Use a standard curve to start slow, accelerate in the middle, and then decelerate slowly at the end: `'0.2s ease-in-out'`

* Start immediately, run for 200ms. Use an acceleration curve to start slow and end at full velocity: `'0.2s ease-in'`
-->
트랜지션 함수의 두 번째 인자에 사용하는 `animate()` 함수는 `timings`와 `syltes`를 인자로 받습니다.

그리고 `timings` 인자는 지속시간(duration), 시작 딜레이(delay), 가속도(easing) 부분으로 구성된 문자열로 형식입니다.

>`animate ('duration delay easing')`

첫번째 인자 `duration`은 필수 항목입니다. 트랜지션 지속시간을 단위 없이 사용하면 밀리초단위이고 단위를 붙여 지정할 수도 있습니다:

* 숫자만 사용하면 밀리초단위입니다: `100`

* 밀리초 단위를 명시할 수 있습니다: `'100ms'`

* 초단위로 지정할 수 있습니다: `'0.1s'`

두번째 인자 `delay`는 트랜지션이 시작되기 전 지연시간을 의미하며 `duration`과 비슷하게 사용합니다:

* 100ms 기다렸다가 200ms 동안 지속한다면 이렇게 지정합니다: `'0.2s 100ms'`

세번째 인자 `easing`은 애니메이션이 어떤 [가속도](http://easings.net/)로 진행될지 지정합니다. 예를 들어 `ease-in`을 사용하면 느리게 시작했다가 점점 빨라집니다.

* 100ms 기다렸다가 200ms 시작하는데, 처음에는 빠르게 진행되다가 천천히 마무리하려면 이렇게 지정합니다: `'0.2s 100ms ease-out'`

* 딜레이 없이 200ms 동안 진행되는데, 천천히 시작되었다가 중간에 가장 빠르고 다시 천천히 느려지도록 하려면 이렇게 지정합니다: `'0.2 ease-in-out'`

* 즉시 시작해서 200ms 동안 진행되는데, 천천히 시작하고 최대속도로 마무리하려면 이렇게 지정합니다: `0.2s ease-in`

<div class="alert is-helpful">

<!--
**Note:** See the Material Design website's topic on [Natural easing curves](https://material.io/design/motion/speed.html#easing) for general information on easing curves.
-->
**참고:** 가속도 커브에 대해 자세하게 알아보려면 Material Design 웹사이트가 제공하는 [Natural easing curves](https://material.io/design/motion/speed.html#easing) 문서를 참고하세요.

</div>

<!--
This example provides a state transition from `open` to `closed` with a one second transition between states.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" language="typescript"
region="transition1">
</code-example>

In the code snippet above, the `=>` operator indicates unidirectional transitions, and `<=>` is bidirectional. Within the transition, `animate()` specifies how long the transition takes. In this case, the state change from `open` to `closed` takes one second, expressed here as `1s`.

This example adds a state transition from the `closed` state to the `open` state with a 0.5 second transition animation arc.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" language="typescript"
region="transition2">
</code-example>
-->
이 가이드 문서에서 설명하는 앱은 `open` 상태에서 `closed` 상태로 1초동안 진행됩니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" language="typescript"
region="transition1">
</code-example>

이 코드에서 `=>` 연산자는 단방향 트랜지션을 의미하며 `<=>` 연산자는 양방향 트랜지션을 의미합니다.
그리고 트랜지션이 진행되는 시간은 `animate()` 함수로 지정하는데, `open` 상태에서 `closed` 상태로 변할 때는 `1s`가 지정되었습니다.

그리고 `closed` 상태에서 `open` 상태로 변하는 것은 0.5초가 지정되었습니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" language="typescript"
region="transition2">
</code-example>


<div class="alert is-helpful">

<!--
**Note:** Some additional notes on using styles within `state` and `transition` functions.

* Use `state()` to define styles that are applied at the end of each transition, they persist after the animation has completed.

* Use `transition()` to define intermediate styles, which create the illusion of motion during the animation.

* When animations are disabled, `transition()` styles can be skipped, but `state()` styles can't.

* You can include multiple state pairs within the same `transition()` argument:<br/> `transition( 'on => off, off => void' )`.
-->
**참고:** `state`와 `transition` 함수를 사용할 때 이런 내용을 참고하세요.

* `state()` 함수에는 트랜지션이 완료된 시점의 스타일을 지정합니다. 애니메이션이 종료되면 이 스타일은 그대로 남습니다.

* `transition()` 함수에는 애니메이션이 진행되는 동안 표시될 스타일을 지정합니다. 이 스타일은 애니메이션이 진행되는 동안에만 표시됩니다.

* 애니메이션을 비활성화하면 `transition()`에 지정된 스타일은 생략되고 `state()`에 지정한 스타일만 적용됩니다.

* `transition()` 함수에는 상태가 전환되는 것을 여러번 표현할 수도 있습니다:<br/> `transition( 'on => off, off => void' )`

</div>


<!--
### Triggering the animation
-->
### 애니메이션 트리거하기

<!--
An animation requires a *trigger*, so that it knows when to start. The `trigger()` function collects the states and transitions, and gives the animation a name, so that you can attach it to the triggering element in the HTML template.

The `trigger()` function describes the property name to watch for changes. When a change occurs, the trigger initiates the actions included in its definition. These actions can be transitions or other functions, as we'll see later on.

In this example, we'll name the trigger `openClose`, and attach it to the `button` element. The trigger describes the open and closed states, and the timings for the two transitions.
-->
애니메이션을 시작하려면 *트리거(trigger)*가 필요합니다.
트리거 함수인 `trigger()`는 애니메이션 상태와 트랜지션, 그리고 애니메이션의 이름을 인자로 받아서 HTML 템플릿에 있는 엘리먼트에 트리거를 연결합니다.

`trigger()` 함수는 템플릿에서 변화를 감지할 프로퍼티 이름과 연결됩니다.
그리고 이후에 이 프로퍼티의 값이 변경되면 트리거가 실행되면서 정의된 동작이 시작됩니다.
이 동작은 트랜지션일 수도 있지만 함수일 수도 있습니다.

이 예제에서는 `openClose`라는 이름의 트리거를 `button` 엘리먼트에 연결해 봅시다.
이 트리거는 `open` 상태와 `closed` 상태를 전환하는 트리거이며, 두 방향으로 진행되는 트랜지션입니다.

<div class="lightbox">
  <img src="generated/images/guide/animations/triggering-the-animation.png" alt="triggering the animation">
</div>

<div class="alert is-helpful">

<!--
**Note:** Within each `trigger()` function call, an element can only be in one state at any given time. However, it's possible for multiple triggers to be active at once.
-->
**참고:** `trigger()` 함수가 실행되는 동안 엘리먼트의 상태는 한 번만 바뀌어야 합니다. 그렇지 않으면 동시에 여러 트리거가 실행될 수 있습니다.

</div>


<!--
### Defining animations and attaching them to the HTML template
-->
### 애니메이션 정의하기, HTML 템플릿과 연결하기

<!--
Animations are defined in the metadata of the component that controls the HTML element to be animated. Put the code that defines your animations under the `animations:` property within the `@Component()` decorator.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" language="typescript" region="component"></code-example>

When you've defined an animation trigger for a component, you can attach it to an element in that component's template by wrapping the trigger name in brackets and preceding it with an `@` symbol. Then, you can bind the trigger to a template expression using standard Angular property binding syntax as shown below, where `triggerName` is the name of the trigger, and `expression` evaluates to a defined animation state.

```
<div [@triggerName]="expression">...</div>;
```

The animation is executed or triggered when the expression value changes to a new state.

The following code snippet binds the trigger to the value of the `isOpen` property.

<code-example path="animations/src/app/open-close.component.1.html" header="src/app/open-close.component.html"
region="compare">
</code-example>

In this example, when the `isOpen` expression evaluates to a defined state of `open` or `closed`, it notifies the trigger `openClose` of a state change. Then it's up to the `openClose` code to handle the state change and kick off a state change animation.

For elements entering or leaving a page (inserted or removed from the DOM), you can make the animations conditional. For example, use `*ngIf` with the animation trigger in the HTML template.
-->
애니메이션은 컴포넌트 메타데이터에 정의되어 HTML 엘리먼트의 스타일을 조작합니다.
좀 더 자세하게 설명하면 애니메이션을 정의하는 코드는 `@Component()` 데코레이터의 `animations:` 프로퍼티에 정의합니다.

<code-example path="animations/src/app/open-close.component.ts" header="src/app/open-close.component.ts" language="typescript" region="component"></code-example>

컴포넌트에 정의한 애니메이션 트리거는 트리거 이름을 대괄호로 감싸고 `@` 심볼을 붙여서 컴포넌트 템플릿에 연결합니다.
그러면 이 트리거와 템플릿 표현식이 Angular 프로퍼티 바인딩 문법으로 연결되는데, 아래 코드에서 `triggerName`은 애니메이션 트리거 이름이며 `expression`은 애니메이션 상태를 선택하는 평가식입니다.

```
<div [@triggerName]="expression">...</div>;
```

그러면 이제 이 평가식이 실행되어 새로운 상태로 변경될 때 트리거가 발생하면서 애니매이션이 시작됩니다.

아래 코드에서는 애니메이션 트리거가 `isOpen` 프로퍼티에 반응합니다.

<code-example path="animations/src/app/open-close.component.1.html" header="src/app/open-close.component.html"
region="compare">
</code-example>

이 예제 코드에서 `isOpen` 표현식의 평가 결과에 따라 상태는 `open`이나 `closed`가 되며, 이 상태가 `openClose` 트리거로 전달됩니다.
그리고 이렇게 변경된 상태에 따라 `openClose`에 정의된 애니케이션 코드가 실행됩니다.

엘리먼트가 화면에 나타나거나(DOM에 추가될 때) 화면에서 벗어날 때(DOM에서 제거될 때)도 애니메이션을 적용할 수 있습니다.
애니메이션 트리거는 `*ngIf`로도 시작할 수 있습니다.

<div class="alert is-helpful">

<!--
**Note:** In the component file, set the trigger that defines the animations as the value of the `animations:` property in the `@Component()` decorator.

In the HTML template file, use the trigger name to attach the defined animations to the HTML element to be animated.
-->
**참고:** 애니메이션은 컴포넌트 파일의 `@Component()` 데코레이터에서 `animations:` 프로퍼티에 정의합니다.

그리고 HTML 템플릿 파일에서 애니메이션 트리거 이름과 HTML 엘리먼트를 연결하면 됩니다.

</div>


<!--
### Code review
-->
### 코드 리뷰

<!--
Here are the code files discussed in the transition example.
-->
이 문서에서 다룬 앱 코드를 확인해 보세요.

<code-tabs>

<code-pane header="src/app/open-close.component.ts" path="animations/src/app/open-close.component.ts" language="typescript"
region="component">
</code-pane>

<code-pane header="src/app/open-close.component.html" path="animations/src/app/open-close.component.1.html"
region="trigger">
</code-pane>

<code-pane header="src/app/open-close.component.css" path="animations/src/app/open-close.component.css">
</code-pane>

</code-tabs>


<!--
### Summary
-->
### 정리

<!--
You learned to add animation to a simple transition between two states, using `style()` and `state()` along with `animate()` for the timing.

You can learn about more advanced features in Angular animations under the Animation section, beginning with advanced techniques in [transition and triggers](guide/transition-and-triggers).
-->
이 가이드 문서에서는 두 상태를 전환할 때 애니메이션을 어떻게 적용할 수 있는지 알아봤으며, 애니메이션을 정의하는 `style()`, `state()`, `animate()` 함수에 대해 알아봤습니다.

이 문서는 애니메이션의 기본 개념에 대해서만 다뤘습니다. 좀 더 복잡한 테크닉은 [트랜지션과 트리거](guide/transition-and-triggers) 문서를 참고하세요.


{@a animation-api-summary}
<!--
## Animations API summary
-->
## 애니메이션 API

<!--
The functional API provided by the `@angular/animations` module provides a domain-specific language (DSL) for creating and controlling animations in Angular applications. See the [API reference](api/animations) for a complete listing and syntax details of the core functions and related data structures.
-->
`@angular/animations` 모듈이 제공하는 애니메이션 API는 모두 Angular 애플리케이션의 애니메이션 도메인에서만 사용하는 언어라고 볼 수 있습니다.
전체 목록은 [API 문서](api/animations)에서 확인할 수 있으며 이 문서에서는 중요한 것들만 추려서 확인해 봅시다.

<!--
<table>

<tr>
<th style="vertical-align: top">
Function name
</th>

<th style="vertical-align: top">
What it does
</th>
</tr>

<tr>
<td><code>trigger()</code></td>
<td>Kicks off the animation and serves as a container for all other animation function calls. HTML template binds to <code>triggerName</code>. Use the first argument to declare a unique trigger name. Uses array syntax.</td>
</tr>

<tr>
<td><code>style()</code></td>
<td>Defines one or more CSS styles to use in animations. Controls the visual appearance of HTML elements during animations. Uses object syntax.</td>
</tr>

<tr>
<td><code><a href="api/animations/state" class="code-anchor">state()</a></code></td>
<td>Creates a named set of CSS styles that should be applied on successful transition to a given state. The state can then be referenced by name within other animation functions.</td>
</tr>

<tr>
<td><code>animate()</code></td>
<td>Specifies the timing information for a transition. Optional values for <code>delay</code> and <code>easing</code>. Can contain <code>style()</code> calls within.</td>
</tr>

<tr>
<td><code>transition()</code></td>
<td>Defines the animation sequence between two named states. Uses array syntax.</td>
</tr>

<tr>
<td><code>keyframes()</code></td>
<td>Allows a sequential change between styles within a specified time interval. Use within <code>animate()</code>. Can include multiple <code>style()</code> calls within each <code>keyframe()</code>. Uses array syntax.</td>
</tr>

<tr>
<td><code><a href="api/animations/group" class="code-anchor">group()</a></code></td>
<td>Specifies a group of animation steps (<em>inner animations</em>) to be run in parallel. Animation continues only after all inner animation steps have completed. Used within <code>sequence()</code> or <code>transition().</code></td>
</tr>

<tr>
<td><code>query()</code></td>
<td>Use to find one or more inner HTML elements within the current element. </td>
</tr>

<tr>
<td><code>sequence()</code></td>
<td>Specifies a list of animation steps that are run sequentially, one by one.</td>
</tr>

<tr>
<td><code>stagger()</code></td>
<td>Staggers the starting time for animations for multiple elements.</td>
</tr>

<tr>
<td><code>animation()</code></td>
<td>Produces a reusable animation that can be invoked from elsewhere. Used together with <code>useAnimation()</code>.</td>
</tr>

<tr>
<td><code>useAnimation()</code></td>
<td>Activates a reusable animation. Used with <code>animation()</code>.</td>
</tr>

<tr>
<td><code>animateChild()</code></td>
<td>Allows animations on child components to be run within the same timeframe as the parent.</td>
</tr>

</table>
-->
<table>

<tr>
<th style="vertical-align: top">
함수 이름
</th>

<th style="vertical-align: top">
용도
</th>
</tr>

<tr>
<td><code>trigger()</code></td>
<td>애니메이션 관련 함수를 관리하는 컨테이너의 역할을 하며 애니메이션을 시작합니다. HTML 템플릿에 <code>triggerName</code>을 바인딩하는 방식으로 사용합니다. 첫번째 인자로 트리거 이름을 전달하며 두번째 인자는 배열을 받습니다.</td>
</tr>

<tr>
<td><code>style()</code></td>
<td>애니메이션이 진행되는동안 HTML 엘리먼트에 적용될 CSS 스타일을 정의합니다. 객체 형식의 문법을 사용합니다.</td>
</tr>

<tr>
<td><code><a href="api/animations/state" class="code-anchor">state()</a></code></td>
<td>트랜지션하는 각 지점의 이름과 각 지점에서 적용될 CSS 스타일을 지정합니다. 이 때 지정하는 상태의 이름은 애니메이션 함수 안에서 사용할 수 있습니다.</td>
</tr>

<tr>
<td><code>animate()</code></td>
<td>트랜지션 타이밍을 지정합니다. 이 떄 시작 지연시간과 가속도 문자열은 생략할 수 있으며, 내부적으로 <code>style()</code>을 실행할 수 있습니다.</td>
</tr>

<tr>
<td><code>transition()</code></td>
<td>두 상태를 전환할 때 실행될 애니메이션을 지정합니다. 배열 형태의 문법을 사용합니다.</td>
</tr>

<tr>
<td><code>keyframes()</code></td>
<td>특정 시점에 적용될 스타일을 지정할 수 있으며 <code>animate()</code> 함수 안에서 사용합니다. 이 함수 안에서 <code>style()</code>를 여러번 사용할 수 있으며, 배열 형태의 문법을 사용합니다.</td>
</tr>

<tr>
<td><code><a href="api/animations/group" class="code-anchor">group()</a></code></td>
<td>병렬로 실행될 애니메이션(세부 애니메이션)을 각각 그룹으로 묶을 때 사용합니다. 전체 애니메이션은 세부 애니메이션이 전부 끝나야 종료되며 <code>sequence()</code>나 <code>transition()</code> 함수 안에서 사용합니다.</td>
</tr>

<tr>
<td><code>query()</code></td>
<td>HTML 엘리먼트를 탐색할 때 사용합니다.</td>
</tr>

<tr>
<td><code>sequence()</code></td>
<td>순서대로 실행될 애니메이션을 지정합니다.</td>
</tr>

<tr>
<td><code>stagger()</code></td>
<td>엘리먼트 여러개에 애니메이션을 적용할 때 시작 시점을 설정할 수 있습니다.</td>
</tr>

<tr>
<td><code>animation()</code></td>
<td>애니메이션을 다른 곳에서 재사용할 때 <code>useAnimation()</code>과 함께 사용합니다.</td>
</tr>

<tr>
<td><code>useAnimation()</code></td>
<td>다른 곳에 정의된 애니메이션을 사용합니다. <code>animation()</code>과 함께 사용합니다.</td>
</tr>

<tr>
<td><code>animateChild()</code></td>
<td>부모 컴포넌트와 자식 컴포넌트의 애니메이션을 동시에 실행할 때 사용합니다.</td>
</tr>

</table>


<!--
## More on Angular animations
-->
## 더 알아보기

<!--
You may also be interested in the following:

* [Transition and triggers](guide/transition-and-triggers)
* [Complex animation sequences](guide/complex-animation-sequences)
* [Reusable animations](guide/reusable-animations)
* [Route transition animations](guide/route-animations)

<div class="alert is-helpful">

Check out this full animation [demo](http://animationsftw.in/#/) with accompanying [presentation](https://www.youtube.com/watch?v=JhNo3Wvj6UQ&feature=youtu.be&t=2h47m53s), shown at the AngularConnect conference in November 2017.
</div>
-->
다음 내용에 대해서도 알아보세요:

* [트랜지션과 트리거](guide/transition-and-triggers)
* [복잡한 애니메이션 시퀀스](guide/complex-animation-sequences)
* [애니메이션 재사용하기](guide/reusable-animations)
* [라우팅 애니메이션](guide/route-animations)

<div class="alert is-helpful">

Angular 애니메이션으로 만든 [데모 사이트](http://animationsftw.in/#/)와 2017년 11월 AngularConnect 컨퍼런스 [발표 영상](https://www.youtube.com/watch?v=JhNo3Wvj6UQ&feature=youtu.be&t=2h47m53s)도 확인해 보세요.

</div>