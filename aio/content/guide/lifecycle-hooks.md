<!--
# Lifecycle Hooks
-->
# 라이프싸이클 후킹

<!--
A component has a lifecycle managed by Angular.
-->
컴포넌트는 Angular가 관리하는 라이프싸이클을 따릅니다.

<!--
Angular creates it, renders it, creates and renders its children,
checks it when its data-bound properties change, and destroys it before removing it from the DOM.
-->
컴포넌트는 Angular가 생성하고, 렌더링하며, 자식 컴포넌트를 순차적으로 생성하고 생성하고 렌더링합니다.

<!--
Angular offers **lifecycle hooks**
that provide visibility into these key life moments and the ability to act when they occur.
-->
컴포넌트가 만나는 각 라이프싸이클은 Angular에서 제공하는 **라이프싸이클 후킹 함수**를 사용해서 원하는 동작을 하도록 조정할 수 있습니다.

<!--
A directive has the same set of lifecycle hooks.
-->
디렉티브는 컴포넌트와 같은 라이크싸이클을 갖습니다.

{@a hooks-overview}

<!--
## Component lifecycle hooks overview
-->
## 개요

<!--
Directive and component instances have a lifecycle
as Angular creates, updates, and destroys them.
Developers can tap into key moments in that lifecycle by implementing
one or more of the *lifecycle hook* interfaces in the Angular `core` library.
-->
디렉티브와 컴포넌트 인스턴스는 Angular가 생성하고, 업데이트하며, 종료하는 라이프싸이클을 따릅니다.
이 라이프싸이클은 Angular `core` 라이크러리에 인터페이스로 제공되는 *라이프싸이클 후킹 함수*로 가로채서 원하는 동작을 수행하도록 조정할 수 있습니다.

<!--
Each interface has a single hook method whose name is the interface name prefixed with `ng`.
For example, the `OnInit` interface has a hook method named `ngOnInit()`
that Angular calls shortly after creating the component:
-->
각각의 인터페이스에는 `ng` 접두사가 붙는 라이프싸이클 후킹 메소드가 정의되어 있습니다.
예를 들면, `OnInit` 인터페이스에는 `ngOnInit()` 메소드가 정의되어 있으며, 이 메소드를 구현하면 Angular가 컴포넌트를 생성한 후에 실행되는 시점을 가로챌 수 있습니다.

<code-example path="lifecycle-hooks/src/app/peek-a-boo.component.ts" region="ngOnInit" header="peek-a-boo.component.ts (excerpt)" linenums="false"></code-example>

<!--
No directive or component will implement all of the lifecycle hooks.
Angular only calls a directive/component hook method *if it is defined*.
-->
하지만 디렉티브나 컴포넌트에 모든 라이프싸이클 후킹 함수를 구현할 필요는 없습니다.
라이프싸이클 후킹 함수는 필요한 것만 골라서 사용하면 되며, Angular 프레임워크는 명시적으로 구현한 라이프싸이클 후킹 함수만 실행합니다.

{@a hooks-purpose-timing}

<!--
## Lifecycle sequence
-->
## 라이프싸이클 함수 실행 순서

<!--
*After* creating a component/directive by calling its constructor, Angular
calls the lifecycle hook methods in the following sequence at specific moments:
-->
컴포넌트나 디렉티브가 생성된 *후에는* 생성자가 제일 먼저 실행됩니다.
그리고 다음 순서에 따라 라이프싸이클 후킹 함수가 실행됩니다:

<table width="100%">
  <col width="20%"></col>
  <col width="80%"></col>
  <tr>
    <!--
    <th>Hook</th>
    <th>Purpose and Timing</th>
    -->
    <th>후킹 함수</th>
    <th>용도와 실행 타이밍</th>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngOnChanges()</code>
    </td>
    <td>

      <!--
      Respond when Angular (re)sets data-bound input properties.
      The method receives a `SimpleChanges` object of current and previous property values.

      Called before `ngOnInit()` and whenever one or more data-bound input properties change.
      -->
      Angular가 입력 프로퍼티 값을 설정할 때 실행됩니다.
      이 메소드는 `SimpleChanges` 타입의 객체를 인자로 받으며, 이 객체에서 이전 값과 현재 값을 확인할 수 있습니다.

      `ngOnInit()` 함수가 실행되기 전에 먼저 실행되고, 입력 프로퍼티의 값이 바뀔때마다 실행됩니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngOnInit()</code>
    </td>
    <td>

      <!--
      Initialize the directive/component after Angular first displays the data-bound properties
      and sets the directive/component's input properties.

      Called _once_, after the _first_ `ngOnChanges()`.
      -->
      디렉티브나 컴포넌트는 인스턴스가 생성되고 입력 프로퍼티를 통해 초기값이 지정된 이후에 화면에 표시되는데,
      디렉티브나 컴포넌트를 초기화하는 로직이 더 있을 때 사용합니다.

      `ngOnChanges()`가 _처음_ 실행된 이후에 _한 번만_ 실행됩니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngDoCheck()</code>
    </td>
    <td>

      <!--
      Detect and act upon changes that Angular can't or won't detect on its own.

      Called during every change detection run, immediately after `ngOnChanges()` and `ngOnInit()`.
      -->
      변화 감지 싸이클을 수동으로 실행할 때 사용합니다.

      변화 감지 싸이클이 실행될 때마다 실행되며, `ngOnChanges()`와 `ngOnInit()` 메소드가 실행된 직후에도 한 번 실행됩니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngAfterContentInit()</code>
    </td>
    <td>

      <!--
      Respond after Angular projects external content into the component's view / the view that a directive is in.

      Called _once_ after the first `ngDoCheck()`.
      -->
      Angular가 컴포넌트의 템플릿을 컴포넌트 뷰로 준비하거나 뷰 안에 있는 디렉티브를 준비한 이후에 실행됩니다.

      `ngDoCheck()`가 처음 실행된 직후에 _한 번만_ 실행됩니다.
      
    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngAfterContentChecked()</code>
    </td>
    <td>

      <!--
      Respond after Angular checks the content projected into the directive/component.

      Called after the `ngAfterContentInit()` and every subsequent `ngDoCheck()`.
      -->
      Angular가 디렉티브나 컴포넌트의 뷰를 검사한 이후에 실행됩니다.

      `ngAfterContentInit()`이 실행된 후에 실행되며, `ngDoCheck()` 함수가 실행된 뒤에도 실행됩니다.
      
    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngAfterViewInit()</code>
    </td>
    <td>

      <!--
      Respond after Angular initializes the component's views and child views / the view that a directive is in.

      Called _once_ after the first `ngAfterContentChecked()`.
      -->
      Angular가 컴포넌트 뷰와 자식 컴포넌트 뷰, 뷰 안에 있는 디렉티브를 모두 초기화한 후에 실행됩니다.

      `ngAfterContentChecked()`가 처음 실행된 직후에 _한 번만_ 실행됩니다.
      
    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngAfterViewChecked()</code>
    </td>
    <td>

      <!--
      Respond after Angular checks the component's views and child views / the view that a directive is in.
      -->
      Angular가 컴포넌트 뷰와 자식 컴포넌트 뷰, 뷰 안에 있는 디렉티브가 준비되었는지 검사한 후에 실행됩니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <code>ngOnDestroy()</code>
    </td>
    <td>
      
      <!--
      Cleanup just before Angular destroys the directive/component.
      Unsubscribe Observables and detach event handlers to avoid memory leaks.

      Called _just before_ Angular destroys the directive/component.
      -->
      디렉티브나 컴포넌트가 종료되기 직전에 실행되며,
      이 함수에서 옵저버블 구독을 해제하거나 이벤트 핸들러를 제거해서 메모리 누수를 방지할 때 사용합니다.

      Angular가 디렉티브나 컴포넌트를 _종료하기 직전에_ 실행됩니다.

    </td>
  </tr>
</table>

<!--
{@a interface-optional}
-->
{@a 인터페이스는-옵션}

<!--
## Interfaces are optional (technically)
-->
## 인터페이스 구현은 옵션입니다.

<!--
The interfaces are optional for JavaScript and Typescript developers from a purely technical perspective.
The JavaScript language doesn't have interfaces.
Angular can't see TypeScript interfaces at runtime because they disappear from the transpiled JavaScript.
-->
문법적인 측면에서 JavaScript나 TypeScript를 개발할 때 인터페이스를 꼭 사용해야 하는 것은 아닙니다.
심지어 JavaScript는 인터페이스를 제공하고 있지도 않습니다.
그래서 Angular 애플리케이션이 JavaScript 코드로 변환된 이후에는 Angular가 TypeScript 인터페이스가 있는지 알 수 없습니다.

<!--
Fortunately, they aren't necessary.
You don't have to add the lifecycle hook interfaces to directives and components to benefit from the hooks themselves.
-->
하지만 다행히, Angular의 라이프싸이클 후킹을 활용하기 위해 인터페이스를 항상 구현해야 하는 것은 아닙니다.

<!--
Angular instead inspects directive and component classes and calls the hook methods *if they are defined*.
Angular finds and calls methods like `ngOnInit()`, with or without the interfaces.
-->
Angular는 디렉티브나 컴포넌트 클래스에 라이프사이클 후킹 함수가 *메소드로 정의되어 있으면* 라이프싸이클 후킹 함수를 실행합니다.
그래서 인터페이스를 사용하는 여부와 관계없이, 클래스에 `ngOnInit()` 메소드가 정의되어 있으면 이 함수를 실행합니다.

<!--
Nonetheless, it's good practice to add interfaces to TypeScript directive classes
in order to benefit from strong typing and editor tooling.
-->
그럼에도 불구하고, TypeScript의 강력한 타입 검사와 에디터가 지원하는 타입 지원 기능을 제대로 활용하려면 Angular가 제안하는 방법처럼 인터페이스를 제대로 구현하는 것이 좋습니다.

<!--
{@a other-lifecycle-hooks}
-->
{@a 기타-라이프싸이클-후킹-함수}

<!--
## Other Angular lifecycle hooks
-->
## 기타 라이프싸이클 후킹 함수

<!--
Other Angular sub-systems may have their own lifecycle hooks apart from these component hooks.
-->
Angular 서드파티 라이브러리 중에는 라이프싸이클 후킹 함수를 따로 정의해서 사용하는 경우도 있습니다.

<!--
3rd party libraries might implement their hooks as well in order to give developers more
control over how these libraries are used.
-->
이런 라이프싸이클 후킹 함수는 Angular가 정의하는 라이프싸이클 외에 좀 더 다양한 시점을 활용하기 위해 마련된 것이며, 컴포넌트를 좀 더 효율적으로 활용할 수 있는 방법입니다.

{@a the-sample}

<!--
## Lifecycle examples
-->
## 라이프싸이클 활용 예제

<!--
The <live-example></live-example>
demonstrates the lifecycle hooks in action through a series of exercises
presented as components under the control of the root `AppComponent`.
-->
이 섹션에서 다루는 라이프싸이클 후킹 함수 활용 예제는 <live-example></live-example>에서 바로 확인할 수 있습니다.
각 예제는 `AppComponent`의 자식 컴포넌트로 구성됩니다.

<!--
They follow a common pattern: a *parent* component serves as a test rig for
a *child* component that illustrates one or more of the lifecycle hook methods.
-->
이 예제들은 모두 같은 패턴으로 구성되어 있습니다. 라이프싸이클 후킹 함수는 *자식* 컴포넌트에 각각 정의되어 있으며, *부모* 컴포넌트가 이 컴포넌트를 동작시킵니다.

<!--
Here's a brief description of each exercise:
-->
각 예제를 간단하게 설명하면 다음과 같습니다:

<table width="100%">
  <col width="20%"></col>
  <col width="80%"></col>
  <tr>
    <!--
    <th>Component</th>
    <th>Description</th>
    -->
    <th>컴포넌트</th>
    <th>설명</th>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <a href="#peek-a-boo">Peek-a-boo</a>
    </td>
    <td>

      <!--
      Demonstrates every lifecycle hook.
      Each hook method writes to the on-screen log.
      -->
      모든 라이프싸이클 후킹 함수를 다룹니다.
      각 함수가 실행될때마다 화면에서 로그를 확인할 수 있습니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <a href="#spy">Spy</a>
    </td>
    <td>

      <!--
      Directives have lifecycle hooks too.
      A `SpyDirective` can log when the element it spies upon is
      created or destroyed using the `ngOnInit` and `ngOnDestroy` hooks.

      This example applies the `SpyDirective` to a `<div>` in an `ngFor` *hero* repeater
      managed by the parent `SpyComponent`.
      -->
      디렉티브도 라이프싸이클 후킹 함수를 활용할 수 있습니다.
      `SpyDirective`가 생성되거나 종료될 때 각각 `ngOnInit`과 `ngOnDestroy` 후킹 함수가 실행되는 것을 확인할 수 있습니다.
      
      이 예제에서는 `<div>`에 `ngFor`를 사용해서 *hero* 객체를 반복할 때 `SpyDirective`가 사용됩니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <a href="#onchanges">OnChanges</a>
    </td>
    <td>

      <!--
      See how Angular calls the `ngOnChanges()` hook with a `changes` object
      every time one of the component input properties changes.
      Shows how to interpret the `changes` object.
      -->
      컴포넌트의 입력 프로퍼티가 변경될 때 `ngOnChanges()` 함수가 어떻게 실행되는지 확인할 수 있습니다.
      이 때 인자로 `changes` 객체가 전달되며, 이 객체를 어떻게 활용하는지 알아봅니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <a href="#docheck">DoCheck</a>
    </td>
    <td>

      <!--
      Implements an `ngDoCheck()` method with custom change detection.
      See how often Angular calls this hook and watch it post changes to a log.
      -->
      변화감지 싸이클이 수동으로 실행되었을 때 `ngDoCheck()`가 어떻게 실행되는지 알아봅니다.
      이 함수가 어떤 경우를 감지하고 실행되는지 로그로 확인해 보세요.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <a href="#afterview">AfterView</a>
    </td>
    <td>

      <!--
      Shows what Angular means by a *view*.
      Demonstrates the `ngAfterViewInit` and `ngAfterViewChecked` hooks.
      -->
      Angular에서 화면을 담당하는 것은 *뷰* 입니다.
      `ngAfterViewInit`과 `ngAfterViewChecked`가 어떻게 실행되는지 확인해 보세요.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      <a href="#aftercontent">AfterContent</a>
    </td>
    <td>

      <!--
      Shows how to project external content into a component and
      how to distinguish projected content from a component's view children.
      Demonstrates the `ngAfterContentInit` and `ngAfterContentChecked` hooks.
      -->
      외부 컨텐츠가 컴포넌트에 어떻게 반영되는지, 이 컨텐츠가 컴포넌트의 자식 뷰와는 어떻게 구별되는지 확인해 보세요.
      이 예제는 `ngAfterContentInit`과 `ngAfterContentChecked` 함수에 대해 알아봅니다.

    </td>
  </tr>
  <tr style='vertical-align:top'>
    <td>
      Counter
    </td>
    <td>

      <!--
      Demonstrates a combination of a component and a directive
      each with its own hooks.
      -->
      컴포넌트와 디렉티브를 함께 사용하면서 라이프싸이클 후킹 함수를 각각 활용하는 경우를 살펴봅니다.

      <!--
      In this example, a `CounterComponent` logs a change (via `ngOnChanges`)
      every time the parent component increments its input counter property.
      Meanwhile, the `SpyDirective` from the previous example is applied
      to the `CounterComponent` log where it watches log entries being created and destroyed.
      -->
      이 예제에서 `CounterComponent`는 부모 컴포넌트가 전달하는 입력 프로퍼티가 변경될 때마다 `ngOnChanges` 함수를 통해 로그를 출력합니다. 그리고 이전 예제에서 사용되었던 `SpyDirective`가 `CounterComponent`에도 적용되어, 디렉티브가 생성되거나 종료되는 시점을 로그로 출력합니다.

    </td>
  </tr>
</table>

<!--
The remainder of this page discusses selected exercises in further detail.
-->
이제부터는 각각의 예제를 좀 더 자세하게 알아봅시다.

{@a peek-a-boo}

<!--
## Peek-a-boo: all hooks
-->
## Peek-a-boo: 모든 라이프싸이클 후킹 함수

<!--
The `PeekABooComponent` demonstrates all of the hooks in one component.
-->
`PeekABooComponent`는 컴포넌트에서 발생하는 라이프싸이클 후킹 함수를 모두 다룹니다.

<!--
You would rarely, if ever, implement all of the interfaces like this.
The peek-a-boo exists to show how Angular calls the hooks in the expected order.
-->
라이프싸이클 후킹 함수를 모두 구현하는 경우는 많지 않지만, 혹시 필요하다면 이 컴포넌트를 참고하면 됩니다.
그리고 이 컴포넌트를 보면 Angular 라이프싸이클 후킹 함수가 어떤 순서로 실행되는지도 확인할 수 있습니다.

<!--
This snapshot reflects the state of the log after the user clicked the *Create...* button and then the *Destroy...* button.
-->
사용자가 *Create...* 버튼을 클릭한 시점부터 *Destroy...* 버튼을 클릭하는 시점까지 출력하는 로그는 아래 그림으로 확인할 수 있습니다.

<figure>
  <img src="generated/images/guide/lifecycle-hooks/peek-a-boo.png" alt="Peek-a-boo">
</figure>

<!--
The sequence of log messages follows the prescribed hook calling order:
`OnChanges`, `OnInit`, `DoCheck`&nbsp;(3x), `AfterContentInit`, `AfterContentChecked`&nbsp;(3x),
`AfterViewInit`, `AfterViewChecked`&nbsp;(3x), and `OnDestroy`.
-->
이전에 설명했듯이, 라이프싸이클 후킹 함수는 다음과 같은 순서로 실행됩니다:
`OnChanges`, `OnInit`, `DoCheck`&nbsp;(3번), `AfterContentInit`, `AfterContentChecked`&nbsp;(3번),
`AfterViewInit`, `AfterViewChecked`&nbsp;(3번), `OnDestroy`.

<div class="alert is-helpful">

  <!--
  The constructor isn't an Angular hook *per se*.
  The log confirms that input properties (the `name` property in this case) have no assigned values at construction.
  -->
  생성자 함수 자체는 Angular의 라이프싸이클이 아닙니다.
  그래서 생성자에서 확인하는 `name` 프로퍼티의 값은 아직 할당되지 않았습니다.

</div>

<!--
Had the user clicked the *Update Hero* button, the log would show another `OnChanges` and two more triplets of
`DoCheck`, `AfterContentChecked` and `AfterViewChecked`.
Clearly these three hooks fire *often*. Keep the logic in these hooks as lean as possible!
-->
사용자가 *Update Hero* 버튼을 클릭하면 `OnChanges` 함수와 `DoCheck`, `AfterContentChecked`, `AfterViewChecked` 함수가 연달아 실행되면서 로그를 출력합니다.
이 함수들은 컴포넌트가 변화할 때마다 *계속* 실행됩니다. 그래서 각각의 함수에는 간결한 로직만 작성하는 것이 좋습니다!

<!--
The next examples focus on hook details.
-->
그리고 다음 예제부터는 각각의 라이프싸이클 후킹 함수를 자세하게 다룹니다.

{@a spy}

<!--
## Spying *OnInit* and *OnDestroy*
-->
## *OnInit*과 *OnDestroy* 후킹하기

<!--
Go undercover with these two spy hooks to discover when an element is initialized or destroyed.
-->
엘리먼트가 생성되거나 종료되는 시점은 이 두 인터페이스를 활용해서 확인할 수 있습니다.

<!--
This is the perfect infiltration job for a directive.
The heroes will never know they're being watched.
-->
이 예제에서는 디렉티브의 생성과 종료를 확인할 수 있는 스파이 디렉티브를 만들어 봅니다.

<div class="alert is-helpful">

  <!--
  Kidding aside, pay attention to two key points:
  -->
  다음 두 가지 내용을 기억해 두세요:

  <!--
  1. Angular calls hook methods for *directives* as well as components.<br><br>
  -->
  1. Angular에서 *디렉티브*에 적용되는 라이프싸이클 후킹 메소드는 컴포넌트에도 똑같이 적용됩니다.<br><br>

  <!--
  2. A spy directive can provide insight into a DOM object that you cannot change directly.
  Obviously you can't touch the implementation of a native `<div>`.
  You can't modify a third party component either.
  But you can watch both with a directive.
  -->
  2. 라이프싸이클 후킹 함수를 활용하면 컴포넌트에서 사용하는 DOM 객체에 직접 접근할 수 있습니다.
  하지만 네이티브 `<div>`와 같은 엘리먼트가 어떻게 생성되는지 변경하는 것은 불가능하며, 서드파티 컴포넌트도 직접 수정할 수는 없습니다.
  이 때 DOM 접근에 접근할 수 있다는 것은 수정 없이 DOM 객체를 확인하는 것만 가능합니다.

</div>

<!--
The sneaky spy directive is simple, consisting almost entirely of `ngOnInit()` and `ngOnDestroy()` hooks
that log messages to the parent via an injected `LoggerService`.
-->
스파이 디렉티브는 간단합니다. 이 디렉티브는 `ngOnInit()` 함수와 `ngOnDestroy()` 후킹 함수를 구현하고 의존성으로 주입되는 `LoggerService`를 활용해서 브라우저에 로그를 출력합니다.

<code-example path="lifecycle-hooks/src/app/spy.directive.ts" region="spy-directive" header="src/app/spy.directive.ts" linenums="false"></code-example>

<!--
You can apply the spy to any native or component element and it'll be initialized and destroyed
at the same time as that element.
Here it is attached to the repeated hero `<div>`:
-->
이 디렉티브는 네이티브 엘리먼트나 커스텀 컴포넌트 어느곳에라도 적용할 수 있으며, 이 디렉티브가 적용된 엘리먼트가 생성될 때 함께 생성되고 엘리먼트가 종료될 때 이 디렉티브도 함께 종료됩니다.
`*ngFor`로 반복되는 `<div>`에는 다음과 같이 적용할 수 있습니다:

<code-example path="lifecycle-hooks/src/app/spy.component.html" region="template" header="src/app/spy.component.html" linenums="false"></code-example>

<!--
Each spy's birth and death marks the birth and death of the attached hero `<div>`
with an entry in the *Hook Log* as seen here:
-->
각 스파이 디렉티브가 생성되고 종료되는 시점은 이 디렉티브가 적용된 `<div>` 엘리먼트가 생성되고 종료되는 시점과 같습니다.
이 내용을 로그로 확인해 보세요:

<figure>
  <img src='generated/images/guide/lifecycle-hooks/spy-directive.gif' alt="Spy Directive">
</figure>

<!--
Adding a hero results in a new hero `<div>`. The spy's `ngOnInit()` logs that event.
-->
히어로를 목록에 추가하면 새로운 히어로에 해당되는 `<div>`가 생성됩니다. 그러면 스파이 디렉티브의 `ngOnInit()`에서 로그를 출력합니다.

<!--
The *Reset* button clears the `heroes` list.
Angular removes all hero `<div>` elements from the DOM and destroys their spy directives at the same time.
The spy's `ngOnDestroy()` method reports its last moments.
-->
*Reset* 버튼은 `heroes` 리스트를 초기화합니다.
그러면 Angular가 히어로에 해당하는 `<div>` 엘리먼트를 DOM에서 제거하며, 이 때 스파이 디렉티브도 함께 종료됩니다.
스파이 디렉티브가 종료될 때 `ngOnDestroy()` 메소드가 실행됩니다.

<!--
The `ngOnInit()` and `ngOnDestroy()` methods have more vital roles to play in real applications.
-->
`ngOnInit()` 함수와 `ngOnDestroy()` 함수는 실제 업무용 애플리케이션에도 중요하게 사용됩니다.

{@a oninit}

<!--
### _OnInit()_
-->
### _OnInit_

<!--
Use `ngOnInit()` for two main reasons:
-->
`ngOnInit()` 함수는 다음 두 용도로 사용합니다:

<!--
1. To perform complex initializations shortly after construction.
1. To set up the component after Angular sets the input properties.
-->
1. 생성자가 이후에 실행되어야 하는 초기화 로직이 복잡할 때
1. Angular가 입력 프로퍼티 값을 설정한 이후 컴포넌트에 추가 로직이 필요할 때

<!--
Experienced developers agree that components should be cheap and safe to construct.
-->
숙련된 개발자라면 컴포넌트의 생성자는 최대한 간결하게 작성해야 한다는 것에 동의할 것입니다.

<div class="alert is-helpful">

  <!--
  Misko Hevery, Angular team lead,
  [explains why](http://misko.hevery.com/code-reviewers-guide/flaw-constructor-does-real-work/)
  you should avoid complex constructor logic.
  -->
  Angular 팀 리더인 Misko Hevery가 [생성자를 왜 간단하게 작성해야 하는지](http://misko.hevery.com/code-reviewers-guide/flaw-constructor-does-real-work/) 언급한 내용을 확인해 보세요.

</div>

<!--
Don't fetch data in a component constructor.
You shouldn't worry that a new component will try to contact a remote server when
created under test or before you decide to display it.
Constructors should do no more than set the initial local variables to simple values.
-->
서버에서 데이터를 받아오는 로직은 컴포넌트 생성자에 작성하지 마세요.
컴포넌트가 생성될 때 서버에서 데이터를 받아온다면 생성자를 활용하는 것이 좋은 방법이라고 생각하기 쉽습니다.
하지만 생성자에는 지역 변수를 간단하게 초기화하는 로직만 두는 것이 좋습니다.

<!--
An `ngOnInit()` is a good place for a component to fetch its initial data. The
[Tour of Heroes Tutorial](tutorial/toh-pt4#oninit) guide shows how.
-->
서버에서 받아오는 데이터로 컴포넌트를 초기화해야 한다면, 이 로직은 `ngOnInit()`에 작성하는 것이 좋습니다.
[히어로들의 여정 튜토리얼](tutorial/toh-pt4#oninit)도 확인해 보세요.

<!--
Remember also that a directive's data-bound input properties are not set until _after construction_.
That's a problem if you need to initialize the directive based on those properties.
They'll have been set when `ngOnInit()` runs.
-->
디렉티브에 입력 프로퍼티가 있을 때 이 입력 프로퍼티의 값은 _생성자가 실행된 후_ 에 반영된다는 것도 잊지 마세요.
입력 프로퍼티의 값이 반영되는 것은 Angular의 라이프싸이클을 따르기 때문에 JavaScript에서 제공하는 생성자에서 이 입력 프로퍼티 값을 사용할 수 없습니다.
`ngOnInit()`이 실행되는 시점이라면 입력 프로퍼티 값이 모두 반영된 이후입니다.

<div class="alert is-helpful">

  <!--
  The `ngOnChanges()` method is your first opportunity to access those properties.
  Angular calls `ngOnChanges()` before `ngOnInit()` and many times after that.
  It only calls `ngOnInit()` once.
  -->
  입력 프로퍼티 값을 확인할 수 있는 가장 빠른 시점은 `ngOnChanges()` 메소드입니다.
  Angular의 라이프싸이클 후킹 함수 순서에 따르면 `ngOnInit()` 함수가 실행되기 전에 `ngOnChanges()` 함수가 먼저 실행되기 때문입니다.
  그리고 `ngOnChanges()` 함수는 입력 프로퍼티 값이 변경될 때마다 계속 실행되지만 `ngOnInit()` 함수는 한 번만 실행됩니다.

</div>

<!--
You can count on Angular to call the `ngOnInit()` method _soon_ after creating the component.
That's where the heavy initialization logic belongs.
-->
`ngOnInit()` 메소드는 컴포넌트가 생성된 _직후에_ 실행되기 때문에 생성자가 실행되는 시점과 많이 차이나지 않습니다.

{@a ondestroy}

<!--
### _OnDestroy()_
-->
### _OnDestroy_

<!--
Put cleanup logic in `ngOnDestroy()`, the logic that *must* run before Angular destroys the directive.
-->
Angular가 디렉티브를 종료하기 전에 *꼭 실행되어야 하는* 로직은 `ngOnDestroy()`에 작성합니다.

<!--
This is the time to notify another part of the application that the component is going away.
-->
그리고 이 시점은 컴포넌트가 종료되는 것을 애플리케이션의 다른 부분에 전파할 수 있는 시점이기도 합니다.

<!--
This is the place to free resources that won't be garbage collected automatically.
Unsubscribe from Observables and DOM events. Stop interval timers.
Unregister all callbacks that this directive registered with global or application services.
You risk memory leaks if you neglect to do so.
-->
JavaScript 환경은 필요없는 자원을 자동으로 정리하지만, 정리해야 하는 자원이 그 외에 추가로 있다면 이 함수에 작성하는 것이 좋습니다. 
옵저버블이나 DOM 이벤트를 구독한 것을 해제하거나, 타이머를 종료하는 로직, 서비스나 디렉티브에 등록된 콜백 함수를 해제하는 것도 이 함수에서 하는 것이 좋습니다.
수동으로 정리해야 하는 항목을 정리하지 않으면 메모리 누수의 위험이 있습니다.

{@a onchanges}

<!--
## _OnChanges()_
-->
## _OnChanges_

<!--
Angular calls its `ngOnChanges()` method whenever it detects changes to ***input properties*** of the component (or directive).
This example monitors the `OnChanges` hook.
-->
컴포넌트나 디렉티브의 ***입력 프로퍼티*** 값이 변경될 때마다 Angular는 `ngOnChanges()` 메소드를 실행합니다.
`OnChanges` 후킹 함수를 활용하는 간단한 방법은 다음과 같습니다.

<code-example path="lifecycle-hooks/src/app/on-changes.component.ts" region="ng-on-changes" header="on-changes.component.ts (excerpt)" linenums="false"></code-example>

<!--
The `ngOnChanges()` method takes an object that maps each changed property name to a
[SimpleChange](api/core/SimpleChange) object holding the current and previous property values.
This hook iterates over the changed properties and logs them.
-->
`ngOnChanges()` 메소드는 [SimpleChange](api/core/SimpleChange) 타입의 객체를 인자로 받으며, 이 객체 안에는 입력 프로퍼티의 이전 값과 현재 값이 포함되어 있습니다.
위 예제는 이 값들을 로그로 출력하는 간단한 예제입니다.

<!--
The example component, `OnChangesComponent`, has two input properties: `hero` and `power`.
-->
이번에 예제로 만드는 `OnChangesComponent`에는 `hero`와 `power`라는 입력 프로퍼티가 2개 있습니다.

<code-example path="lifecycle-hooks/src/app/on-changes.component.ts" region="inputs" header="src/app/on-changes.component.ts" linenums="false"></code-example>

<!--
The host `OnChangesParentComponent` binds to them like this:
-->
그리고 부모 컴포넌트인 `OnChangesParentComponent`는 이 컴포넌트를 이렇게 바인딩합니다:

<code-example path="lifecycle-hooks/src/app/on-changes-parent.component.html" region="on-changes" header="src/app/on-changes-parent.component.html"></code-example>

<!--
Here's the sample in action as the user makes changes.
-->
그리고 사용자가 문자열을 입력하면 다음과 같은 로그를 확인할 수 있습니다.

<figure>
  <img src='generated/images/guide/lifecycle-hooks/on-changes-anim.gif' alt="OnChanges">
</figure>

<!--
The log entries appear as the string value of the *power* property changes.
But the `ngOnChanges` does not catch changes to `hero.name`
That's surprising at first.
-->
이 로그를 보면 *power* 프로퍼티의 값이 변경될 때마다 `ngOnChanges()` 함수가 실행되는 것을 확인할 수 있습니다.
하지만 `hero.name` 값은 변경되어도 `ngOnChanges()` 함수가 실행되지 않습니다.
이 결과를 처음 보면 당황스러울 수 있습니다.

<!--
Angular only calls the hook when the value of the input property changes.
The value of the `hero` property is the *reference to the hero object*.
Angular doesn't care that the hero's own `name` property changed.
The hero object *reference* didn't change so, from Angular's perspective, there is no change to report!
-->
Angular는 입력 프로퍼티 값이 변경되었을 때만 `ngOnChangaes()` 함수를 실행합니다.
하지만 `hero` 프로퍼티는 객체가 전달되기 때문에 프로퍼티 값은 *객체의 참조*값으로 할당됩니다.
그래서 `hero` 객체 안에 있는 `name` 값이 변경되는 것은 Angular가 신경쓰지 않습니다.
객체가 인자로 전달될 때는 *참조하는 주소 자체가* 변경되지 않는 이상 값이 변경된 것으로 처리하지 않습니다.

{@a docheck}

<!--
## _DoCheck()_
-->
## _DoCheck_

<!--
Use the `DoCheck` hook to detect and act upon changes that Angular doesn't catch on its own.
-->
Angular의 변화 감지 싸이클을 수동으로 실행하는 경우라면 `DoCheck` 함수를 사용할 수 있습니다.

<div class="alert is-helpful">

  <!--
  Use this method to detect a change that Angular overlooked.
  -->
  이 함수는 Angular가 감지하지 못하는 변화를 감지하는 용도로 사용합니다.

</div>

<!--
The *DoCheck* sample extends the *OnChanges* sample with the following `ngDoCheck()` hook:
-->
이번에 살펴볼 *DoCheck* 예제는 *OnChanges* 예제에서 살펴봤던 `ngDoCheck()` 후킹 함수를 확장한 것입니다:

<code-example path="lifecycle-hooks/src/app/do-check.component.ts" region="ng-do-check" header="DoCheckComponent (ngDoCheck)" linenums="false"></code-example>

<!--
This code inspects certain _values of interest_, capturing and comparing their current state against previous values.
It writes a special message to the log when there are no substantive changes to the `hero` or the `power`
so you can see how often `DoCheck` is called. The results are illuminating:
-->
예제 코드가 조금 복잡해 보이지만, 이 예제는 이전값과 현재값을 비교해서 값이 변경되었는지 검사하는 코드입니다.
이 코드는 `DoCheck` 인터페이스에 의해 `ngDoCheck()` 함수가 실행될 때마다 `hero`와 `power`의 값을 비교하고, 값이 변경된 것으로 확인되면 로그를 출력합니다. 그림으로 결과를 확인해 보세요:

<figure>
  <img src='generated/images/guide/lifecycle-hooks/do-check-anim.gif' alt="DoCheck">
</figure>

<!--
While the `ngDoCheck()` hook can detect when the hero's `name` has changed, it has a frightful cost.
This hook is called with enormous frequency&mdash;after _every_
change detection cycle no matter where the change occurred.
It's called over twenty times in this example before the user can do anything.
-->
하지만 `ngDoCheck()` 함수에서 히어로의 `name` 프로퍼티가 변경되는 것을 확인하는 것은 비효율적입니다.
왜냐하면 이 함수는 프로퍼티 값이 변하지 않더라도 Angular의변화 감지 싸이클이 _실행될 때마다_ 계속 실행되기 때문입니다.
위 예제에서도 보면 사용자가 의미있는 동작을 하지 않더라도 20번 이상 실행되는 것을 확인할 수 있습니다.

<!--
Most of these initial checks are triggered by Angular's first rendering of *unrelated data elsewhere on the page*.
Mere mousing into another `<input>` triggers a call.
Relatively few calls reveal actual changes to pertinent data.
Clearly our implementation must be very lightweight or the user experience suffers.
-->
이 예제에서 첫 렌더링될 때 이렇게 많은 함수가 실행된 것은 *페이지와 관계없는 데이터* 에 의한 것일 수도 있습니다.
예를 들면, `<input>` 엘리먼트에 마우스 동작이 있을 때도 이 함수가 실행됩니다.
따라서 컴포넌트 프로퍼티값이 변한 것을 수동으로 감지할 때는 꼭 필요한 곳에만, 최대한 간단한 로직으로 작성해야 사용자가 불편함을 느끼지 않습니다.

{@a afterview}

## AfterView

<!--
The *AfterView* sample explores the `AfterViewInit()` and `AfterViewChecked()` hooks that Angular calls
*after* it creates a component's child views.
-->
*AfterView* 예제는 Angular가 자식 컴포넌트의 뷰를 생성한 *이후*인 `AfterViewInit`과 `AfterViewChecked` 에 대해 다룹니다.

<!--
Here's a child view that displays a hero's name in an `<input>`:
-->
자식 컴포넌트에서 `<input>` 엘리먼트에 히어로의 이름을 받는다고 합시다:

<code-example path="lifecycle-hooks/src/app/after-view.component.ts" region="child-view" header="ChildComponent" linenums="false"></code-example>

<!--
The `AfterViewComponent` displays this child view *within its template*:
-->
그리고 `AfterViewComponent`는 *이 컴포넌트의 템플릿에* 자식 컴포넌트 뷰를 표시합니다:

<code-example path="lifecycle-hooks/src/app/after-view.component.ts" region="template" header="AfterViewComponent (template)" linenums="false"></code-example>

<!--
The following hooks take action based on changing values *within the child view*,
which can only be reached by querying for the child view via the property decorated with
[@ViewChild](api/core/ViewChild).
-->
마지막으로 다음 코드는 *자식 컴포넌트 뷰*가 변경될 때마다 [@ViewChild](api/core/ViewChild)로 지정된 프로퍼티를 통해 자식 컴포넌트에 있는 `hero` 객체를 가져와서 동작을 수행할 수 있는 예제 코드입니다.

<code-example path="lifecycle-hooks/src/app/after-view.component.ts" region="hooks" header="AfterViewComponent (class excerpts)" linenums="false"></code-example>

{@a wait-a-tick}

<!--
### Abide by the unidirectional data flow rule
-->
### 단방향 데이터 흐름 유지

<!--
The `doSomething()` method updates the screen when the hero name exceeds 10 characters.
-->
`doSomething()` 메소드는 히어로의 이름이 10글자를 넘어가면 화면에 에러 메시지를 표시합니다.

<code-example path="lifecycle-hooks/src/app/after-view.component.ts" region="do-something" header="AfterViewComponent (doSomething)" linenums="false"></code-example>

<!--
Why does the `doSomething()` method wait a tick before updating `comment`?
-->
그런데 `doSomething()` 메소드는 `comment` 프로퍼티에 값을 할당하기 전에 왜 한 타이밍을 기다릴까요?

<!--
Angular's unidirectional data flow rule forbids updates to the view *after* it has been composed.
Both of these hooks fire _after_ the component's view has been composed.
-->
Angular는 단방향 데이터 흐름을 권장하기 때문에 뷰가 구성된 *직후에* 뷰를 다시 갱신하는 것은 권장하지 않습니다.
그리고 `AfterViewInit`과 `AfterViewChecked` 함수는 컴포넌트의 뷰가 구성된 _직후에_ 실행됩니다.

<!--
Angular throws an error if the hook updates the component's data-bound `comment` property immediately (try it!).
The `LoggerService.tick_then()` postpones the log update
for one turn of the browser's JavaScript cycle and that's just long enough.
-->
그래서 컴포넌트 뷰가 구성된 직후에 바로 `comment` 프로퍼티 값을 수정하면 Angular가 에러를 발생시킵니다. (한 번 해보세요!)
이 문제를 해결하기 위해 `LoggerService.tick_then()`에 있는 함수를 사용했고, 이 함수를 사용해서 다음 브라우저의 JavaScript 싸이클에 `comment` 프로퍼티 값을 갱신하도록 했습니다.

<!--
Here's *AfterView* in action:
-->
*AfterView* 후킹 인터페이스가 어떻게 동작하는지 확인해 보세요:

<figure>
  <img src='generated/images/guide/lifecycle-hooks/after-view-anim.gif' alt="AfterView">
</figure>

<!--
Notice that Angular frequently calls `AfterViewChecked()`, often when there are no changes of interest.
Write lean hook methods to avoid performance problems.
-->
이 결과를 보면 별다른 변화가 없을 때도 `AfterViewChecked` 후킹 함수가 여러번 실행되는 것을 확인할 수 있습니다.
성능 문제를 피하려면 후킹 함수에는 간단한 로직만 작성하세요.

{@a aftercontent}

## AfterContent

<!--
The *AfterContent* sample explores the `AfterContentInit()` and `AfterContentChecked()` hooks that Angular calls
*after* Angular projects external content into the component.
-->
*AfterContent* 예제는 Angular가 컴포넌트 안에 외부 컨텐츠를 넣은 이후에 실행되는 `AfterContentInit`과 `AfterContentChecked` 후킹 인터페이스를 다룹니다.

{@a content-projection}

<!--
### Content projection
-->
### 컨텐츠 프로젝션

<!--
*Content projection* is a way to import HTML content from outside the component and insert that content
into the component's template in a designated spot.
-->
*컨텐츠 프로젝션*은 컴포넌트의 템플릿을 정의하는 외부 HTML 파일을 컴포넌트 안에 가져와서 컴포넌트 템플릿에 반영하는 것을 의미합니다.

<div class="alert is-helpful">

  <!--
  AngularJS developers know this technique as *transclusion*.
  -->
  이 개념은 AngularJS에서 *트랜스클루전(transclusion)*이라는 개념으로 사용했습니다.

</div>

<!--
Consider this variation on the [previous _AfterView_](guide/lifecycle-hooks#afterview) example.
This time, instead of including the child view within the template, it imports the content from
the `AfterContentComponent`'s parent. Here's the parent's template:
-->
이 예제는 이전에 다뤘던 [_AfterView_](guide/lifecycle-hooks#afterview) 예제를 변형한 것입니다.
이전 예제에서 템플릿에 자식 컴포넌트의 뷰를 직접 표시했던 대신, 이번 예제는 `AfterContentComponent`의 부모 컴포넌트에서 컨텐츠를 받아옵니다.
부모 컴포넌트의 템플릿은 이렇습니다:

<code-example path="lifecycle-hooks/src/app/after-content.component.ts" region="parent-template" header="AfterContentParentComponent (template excerpt)" linenums="false"></code-example>

<!--
Notice that the `<app-child>` tag is tucked between the `<after-content>` tags.
Never put content between a component's element tags *unless you intend to project that content
into the component*.
-->
`<after-content>` 태그 안에 있는 `<my-child>` 태그를 주의해서 보세요.
*컴포넌트 외부에서 전달하는 컨텐츠를 컴포넌트 안에 표시하려고 하지만* 컴포넌트를 의미하는 엘리먼트 태그 안에는 아무 내용도 넣지 않았습니다.

<!--
Now look at the component's template:
-->
그리고 `AfterContentComponent` 컴포넌트의 템플릿은 다음과 같이 구성했습니다:

<code-example path="lifecycle-hooks/src/app/after-content.component.ts" region="template" header="AfterContentComponent (template)" linenums="false"></code-example>

<!--
The `<ng-content>` tag is a *placeholder* for the external content.
It tells Angular where to insert that content.
In this case, the projected content is the `<app-child>` from the parent.
-->
`<ng-content>` 태그는 외부 컨텐츠가 *들어갈 위치*를 지정하는 태그입니다.
Angular가 이 태그를 확인하면 컴포넌트 외부에서 전달되는 컨텐츠를 이 위치에 표시하며, 이 예제에서 부모 컴포넌트가 자식 컴포넌트로 전달하는 컨텐츠는 `<my-child>` 엘리먼트입니다.

<figure>
  <img src='generated/images/guide/lifecycle-hooks/projected-child-view.png' alt="Projected Content">
</figure>

<div class="alert is-helpful">

  <!--
  The telltale signs of *content projection* are twofold:

  * HTML between component element tags.
  * The presence of `<ng-content>` tags in the component's template.
  -->
  *컨텐츠 프로젝션*이 사용된 것은 다음 두 가지로 확인할 수 있습니다:

  * 컴포넌트 엘리먼트 태그 안에 HTML이 있는 경우
  * 컴포넌트 템플릿 안에 `<ng-content>` 태그가 있는 경우

</div>

{@a aftercontent-hooks}

<!--
### AfterContent hooks
-->
### AfterContent 후킹

<!--
*AfterContent* hooks are similar to the *AfterView* hooks.
The key difference is in the child component.
-->
*AfterContent* 후킹은 *AfterView* 후킹과 비슷합니다.
자식 컴포넌트에서 발생한다는 것만 다릅니다.

<!--
* The *AfterView* hooks concern `ViewChildren`, the child components whose element tags
appear *within* the component's template.
-->
* *AfterView* 후킹은 `ViewChildren` 데코레이터를 활용합니다. 이 데코레이터는 컴포넌트 템플릿 *안에 있는* 자식 컴포넌트를 가리킵니다.

<!--
* The *AfterContent* hooks concern `ContentChildren`, the child components that Angular
projected into the component.
-->
* *AfterContent* 후킹은 `ContentChildren` 데코레이터를 활용합니다. 이 데코레이터는 컴포넌트 안에 프로젝트된 자식 컴포넌트를 가리킵니다.

<!--
The following *AfterContent* hooks take action based on changing values in a *content child*,
which can only be reached by querying for them via the property decorated with
[@ContentChild](api/core/ContentChild).
-->
*AfterContent* 후킹은 *자식 컴포넌트에 반영된 컨텐츠가* 변경되는 것과 관계가 있으며, 이 컨텐츠 내용을 직접 할용하려면 [@ContentChild](api/core/ContentChild) 데코레이터를 사용해야 합니다.

<code-example path="lifecycle-hooks/src/app/after-content.component.ts" region="hooks" header="AfterContentComponent (class excerpts)" linenums="false"></code-example>

{@a no-unidirectional-flow-worries}

<!--
### No unidirectional flow worries with _AfterContent_
-->
### _AfterContent_ 도 단방향 데이터 흐름을 따릅니다.

<!--
This component's `doSomething()` method update's the component's data-bound `comment` property immediately.
There's no [need to wait](guide/lifecycle-hooks#wait-a-tick).
-->
이 컴포넌트의 `doSomething()` 메소드는 컴포넌트 프로퍼티인 `comment`의 값을 변경합니다.
하지만 [다음 실행 싸이클을 기다릴 필요](guide/lifecycle-hooks#wait-a-tick)는 없습니다.

<!--
Recall that Angular calls both *AfterContent* hooks before calling either of the *AfterView* hooks.
Angular completes composition of the projected content *before* finishing the composition of this component's view.
There is a small window between the `AfterContent...` and `AfterView...` hooks to modify the host view.
-->
Angular는 *AfterView* 후킹을 실행하기 전에 *AfterContent* 후킹을 실행합니다.
그래서 자식 컴포넌트의 컴포넌트 뷰 구성이 끝나는 시점은 프로젝션될 컨텐츠가 준비된 이후입니다.
이 과정에서 컴포넌트의 호스트 뷰가 프로젝션될 컨텐츠에 의해 갱신되기 때문에 `AfterContent`와 `AfterView` 후킹 사이에는 약간의 차이가 있기 때문에, 이전처럼 JavaScript 실행 싸이클을 조정하는 로직이 필요하지 않습니다.