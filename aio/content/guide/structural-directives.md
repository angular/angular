<!--
# Structural directives
-->
# 구조 디렉티브 (Structural Directives)

<style>
  h4 {font-size: 17px !important; text-transform: none !important;}
  .syntax { font-family: Consolas, 'Lucida Sans', Courier, sans-serif; color: black; font-size: 85%; }

</style>


<!--
This guide looks at how Angular manipulates the DOM with **structural directives** and
how you can write your own structural directives to do the same thing.

Try the <live-example></live-example>.
-->
이 문서는 **구조 디렉티브**가 DOM을 어떻게 조작하는지 설명합니다. 그리고 커스텀 구조 디렉티브를 어떻게 구현하는지도 알아봅시다.

이 문서에서 다루는 예제는 <live-example></live-example>에서 바로 확인하거나 다운받아 확인할 수 있습니다.


{@a definition}

<!--
## What are structural directives?
-->
## 구조 디렉티브란?

<!--
Structural directives are responsible for HTML layout.
They shape or reshape the DOM's _structure_, typically by adding, removing, or manipulating
elements.

As with other directives, you apply a structural directive to a _host element_.
The directive then does whatever it's supposed to do with that host element and its descendants.

Structural directives are easy to recognize.
An asterisk (*) precedes the directive attribute name as in this example.


<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif)" region="ngif"></code-example>


No brackets. No parentheses. Just `*ngIf` set to a string.

You'll learn in this guide that the [asterisk (*) is a convenience notation](guide/structural-directives#asterisk)
and the string is a [_microsyntax_](guide/structural-directives#microsyntax) rather than the usual
[template expression](guide/interpolation#template-expressions).
Angular desugars this notation into a marked-up `<ng-template>` that surrounds the
host element and its descendants.
Each structural directive does something different with that template.

Three of the common, built-in structural directives&mdash;[NgIf](guide/built-in-directives#ngIf),
[NgFor](guide/built-in-directives#ngFor), and [NgSwitch...](guide/built-in-directives#ngSwitch)&mdash;are
described in the [Built-in directives](guide/built-in-directives) guide and seen in samples throughout the Angular documentation.
Here's an example of them in a template:

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (built-in)" region="built-in"></code-example>


This guide won't repeat how to _use_ them. But it does explain _how they work_
and how to [write your own](guide/structural-directives#unless) structural directive.
-->
구조 디렉티브는 HTML 문서의 레이아웃과 관계가 있습니다.
구조 디렉티브는 엘리먼트를 DOM에 추가하거나 제거하면서  DOM의 _구조_ 를 조작합니다.

다른 디렉티브와 마찬가지로 구조 디렉티브도 _호스트 엘리먼트_ 에 지정하는데, 구조 디렉티브는 디렉티브에 정의된 로직에 따라 호스트 엘리먼트나 자식 엘리먼트를 조작합니다.

구조 디렉티브가 사용된 것은 확인하기 쉽습니다.
이 디렉티브는 아래 예제처럼 별표(`*`)로 시작하는 어트리뷰트 이름으로 적용합니다.


<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif)" region="ngif"></code-example>


구조 디렉티브에는 괄호(`(`, `)`)도 없고 대괄호(`[`, `]`)도 없습니다. `*ngIf`는 단순하게 문자열일 뿐입니다.

아래 부분에서 좀 더 자세히 설명하겠지만, [별표(`*`)는 구조 디렉티브를 사용하기 편하게 만드는](guide/structural-directives#asterisk) 문법 테크닉이며, 이런 문법은 [템플릿 표현식](guide/interpolation#template-expressions)이라기 보다는 [_세부 문법(microsyntax)_](guide/structural-directives#microsyntax)이라고 하는 것이 더 적절합니다.
Angular가 애플리케이션을 빌드하면 이 문법 테크닉은 호스트 엘리먼트와 자식 엘리먼트 사이에 `<ng-template>` 계층의 마크업을 구성하면서 사라집니다.
이 때 구조 디렉티브를 템플릿에서 어떻게 사용했느냐에 따라 결과물이 달라집니다.

Angular가 제공하는 구조 디렉티브 중 가장 많이 사용하는 것은 [NgIf](guide/built-in-directives#ngIf), [NgFor](guide/built-in-directives#ngFor), [NgSwitch...](guide/built-in-directives#ngSwitch) 이렇게 3가지 입니다.
각각은 [_기본 디렉티브_](guide/built-in-directives) 문서에서 자세하게 다루며, 예제도 함께 확인할 수 있습니다.
이 문서에서는 간단하게만 알아봅시다.


<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (기본 디렉티브)" region="built-in"></code-example>


각각의 디렉티브를 _어떻게 사용하는지_ 에 대해서는 이 문서에서 다루지 않습니다. 대신, 디렉티브가 _어떻게 동작하며_, 커스텀 구조 디렉티브는 [어떻게 만드는지](guide/structural-directives#unless) 알아봅시다.

<!--
<div class="callout is-helpful">

<header>
  Directive spelling
</header>

Throughout this guide, you'll see a directive spelled in both _UpperCamelCase_ and _lowerCamelCase_.
Already you've seen `NgIf` and `ngIf`.
There's a reason. `NgIf` refers to the directive _class_;
`ngIf` refers to the directive's _attribute name_.

A directive _class_ is spelled in _UpperCamelCase_ (`NgIf`).
A directive's _attribute name_ is spelled in _lowerCamelCase_ (`ngIf`).
The guide refers to the directive _class_ when talking about its properties and what the directive does.
The guide refers to the _attribute name_ when describing how
you apply the directive to an element in the HTML template.

</div>
-->
<div class="callout is-helpful">

<header>
  디렉티브의 대소문자 구분
</header>

이 문서에서는 디렉티브를 _대문자 캐멀 케이스(UpperCamelCase)_ 로 언급하기도 하고 _소문자 캐멀 케이스(lowerCamelCase)_ 로 언급하기도 합니다.
지금까지의 설명에서도 `NgIf`라고 하기도 했고 `ngIf`라고 하기도 했죠.
이렇게 사용하는 이유가 있습니다. `NgIf`는 디렉티브 _클래스_ 자체를 가리키며, `ngIf`는 디렉티브를 적용할 때 사용하는 _어트리뷰트 이름_ 을 가리킵니다.

디렉티브의 프로퍼티나 디렉티브의 동작을 설명할 때는 `NgIf`와 같이 _대문자 캐멀 케이스_ 로 정의하는 디렉티브 _클래스_ 자체를 가리킵니다.
그리고 디렉티브를 HTML 템플릿에 있는 엘리먼트에 적용하는 것을 설명할 때는 `ngIf`와 같이 _소문자 캐멀 케이스_ 로 정의하는 _어트리뷰트 이름_ 을 가리킵니다.

</div>


<!--
<div class="alert is-helpful">

There are two other kinds of Angular directives, described extensively elsewhere:
(1)&nbsp;components and (2)&nbsp;attribute directives.

A *component* manages a region of HTML in the manner of a native HTML element.
Technically it's a directive with a template.

An [*attribute* directive](guide/attribute-directives) changes the appearance or behavior
of an element, component, or another directive.
For example, the built-in [`NgStyle`](guide/built-in-directives#ngStyle) directive
changes several element styles at the same time.

You can apply many _attribute_ directives to one host element.
You can [only apply one](guide/structural-directives#one-per-element) _structural_ directive to a host element.

</div>
-->
<div class="alert is-helpful">

다른 문서에서도 언급한 것처럼 Angular의 디렉티브는 크게 두 종류입니다. 그 중 하나는 (1) 컴포넌트이고, 다른 하나는 (2) 어트리뷰트 디렉티브 입니다.

*컴포넌트*는 네이티브 HTML 엘리먼트를 사용해서 HTML 문서의 한 부분을 담당합니다.
문법적으로는 디렉티브에 템플릿이 추가된 것이 컴포넌트입니다.

[*어트리뷰트* 디렉티브](guide/attribute-directives)는 엘리먼트나 컴포넌트, 디렉티브의 모습이나 동작을 변경합니다.
예를 들어 보면, [`NgStyle`](guide/built-in-directives#ngStyle) 디렉티브는 엘리먼트에 여러 엘리먼트 스타일을 동시에 지정할 수 있습니다.

호스트 엘리먼트에는 여러 개의 _어트리뷰트_ 디렉티브를 지정할 수도 있습니다.
하지만 구조 디렉티브는 호스트 엘리먼트에 [하나만](guide/structural-directives#one-per-element) 적용할 수 있습니다.

</div>



{@a ngIf}


<!--
## NgIf case study
-->
## NgIf로 이해하기

<!--
`NgIf` is the simplest structural directive and the easiest to understand.
It takes a boolean expression and makes an entire chunk of the DOM appear or disappear.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-true)" region="ngif-true"></code-example>

The `ngIf` directive doesn't hide elements with CSS. It adds and removes them physically from the DOM.
Confirm that fact using browser developer tools to inspect the DOM.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/element-not-in-dom.png' alt="ngIf=false element not in DOM">
</div>

The top paragraph is in the DOM. The bottom, disused paragraph is not;
in its place is a comment about "bindings" (more about that [later](guide/structural-directives#asterisk)).

When the condition is false, `NgIf` removes its host element from the DOM,
detaches it from DOM events (the attachments that it made),
detaches the component from Angular change detection, and destroys it.
The component and DOM nodes can be garbage-collected and free up memory.
-->
구조 디렉티브 중에서 `NgIf`는 가장 간단하며 이해하기도 쉽습니다.
이 디렉티브는 표현식의 결과에 따라 DOM 조각을 추가하거나 제거합니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-true)" region="ngif-true"></code-example>


`ngIf` 디렉티브는 CSS처럼 엘리먼트를 숨기는 것이 아닙니다. 이 디렉티브가 `false` 조건으로 동작하면 DOM에서 엘리먼트를 완전히 제거합니다.
그래서 브라우저 개발자 도구로 DOM을 직접 보면 다음과 같이 처리되는 것을 확인할 수 있습니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/element-not-in-dom.png' alt="ngIf=false element not in DOM">
</div>


위에 있는 `<p>` 엘리먼트는 DOM에 존재하는 엘리먼트입니다. 그리고 아래에 있는 `<p>` 엘리먼트는 DOM에 존재하지 않습니다. 이 엘리먼트는 `ngIf` 디렉티브에 의해 처리되고 주석으로만 존재합니다. 이 내용은 [아래](guide/structural-directives#asterisk)에서 좀 더 자세하게 설명합니다.

평가식의 값이 `false`이면 `NgIf` 디렉티브는 호스트 엘리먼트를 DOM에서 완전히 제거하고 DOM 이벤트 대상에서도 제외합니다. 그리고 Angular의 변화 감지 대상에서도 제외한 후에 디렉티브를 종료합니다.
따라서 이 디렉티브와 DOM 노드 조각은 가비지 콜렉션의 대상이 되어 메모리에서도 완전히 제거됩니다.


<!--
### Why *remove* rather than *hide*?
-->
### 왜 *숨기지*않고 *제거*하는 걸까요?

<!--
A directive could hide the unwanted paragraph instead by setting its `display` style to `none`.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (display-none)" region="display-none"></code-example>

While invisible, the element remains in the DOM.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/element-display-in-dom.png' alt="hidden element still in DOM">
</div>

The difference between hiding and removing doesn't matter for a simple paragraph.
It does matter when the host element is attached to a resource intensive component.
Such a component's behavior continues even when hidden.
The component stays attached to its DOM element. It keeps listening to events.
Angular keeps checking for changes that could affect data bindings.
Whatever the component was doing, it keeps doing.

Although invisible, the component&mdash;and all of its descendant components&mdash;tie up resources.
The performance and memory burden can be substantial, responsiveness can degrade, and the user sees nothing.

On the positive side, showing the element again is quick.
The component's previous state is preserved and ready to display.
The component doesn't re-initialize&mdash;an operation that could be expensive.
So hiding and showing is sometimes the right thing to do.

But in the absence of a compelling reason to keep them around,
your preference should be to remove DOM elements that the user can't see
and recover the unused resources with a structural directive like `NgIf` .

**These same considerations apply to every structural directive, whether built-in or custom.**
Before applying a structural directive, you might want to pause for a moment
to consider the consequences of adding and removing elements and of creating and destroying components.
-->
디렉티브가 화면에 보일 필요가 없으면 `display` 스타일을 `none`으로 지정해서 감추는 방법도 있습니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (display-none)" region="display-none"></code-example>


하지만 이 경우에 엘리먼트는 DOM에 여전히 존재합니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/element-display-in-dom.png' alt="hidden element still in DOM">
</div>


`ngIf`가 조작하는 엘리먼트가 간단하다면 숨기든 제거하든 큰 문제가 되지 않을 수도 있습니다.
하지만 복잡한 경우에는 문제가 될 수 있는데, 컴포넌트가 화면에는 보이지 않더라도 이 컴포넌트는 계속 동작하기 때문입니다.
DOM에 여전히 남아있으면서 이벤트도 계속 받고, 바인딩 된 데이터가 변경되면 변화 감지 로직도 동작합니다.
컴포넌트는 원래 동작하던 대로 계속 동작할 것입니다.

컴포넌트가 보이지 않는 상황에서도 이 컴포넌트와 컴포넌트의 자식 컴포넌트 들은 리소스를 계속 사용합니다.
애플리케이션 성능은 저하되고 가용 메모리는 줄어들 것이며, 사용자의 반응성은 떨어질 것이지만 사용자는 이 컴포넌트를 여전히 볼 수 없습니다.

장점이 하나 있다면, 이 엘리먼트를 다시 표시하는 것은 빠릅니다.
컴포넌트의 이전 상태가 계속 유지되며 화면에 표시될 준비도 이미 끝났기 때문입니다.
그리고 복잡할수도 있는 컴포넌트 초기화 동작은 이미 실행되었기 때문에 다시 실행되지 않습니다.
그래서 어떤 경우에는 DOM에서 제거하지 않고 감추기만 하는 것이 좋을 수도 있습니다.

하지만 굳이 이런 경우가 아니라면, 사용자에게 표시될 필요가 없는 컴포넌트는 DOM에서 완전히 제거하고 사용하던 자원도 반환하는 것이 좋습니다.

**이 개념은 Angular 기본 디렉티브는 물론이고 커스텀 디렉티브에도 적용됩니다.**
구조 디렉티브를 템플릿에 적용하기 전에, 이 디렉티브를 생성하고 종료하는 비용, 엘리먼트를 DOM에 추가하고 제거하는 비용이 얼마나 필요한지 꼭 고민해 보세요.


{@a asterisk}
{@a the-asterisk--prefix}

<!--
## The asterisk (*) prefix
-->
## 별표(`*`, asterisk) 접두사

<!--
Surely you noticed the asterisk (*) prefix to the directive name
and wondered why it is necessary and what it does.

Here is `*ngIf` displaying the hero's name if `hero` exists.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (asterisk)" region="asterisk"></code-example>

The asterisk is "syntactic sugar" for something a bit more complicated.
Internally, Angular translates the `*ngIf` _attribute_ into a `<ng-template>` _element_, wrapped around the host element, like this.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-template)" region="ngif-template"></code-example>

* The `*ngIf` directive moved to the `<ng-template>` element where it became a property binding,`[ngIf]`.
* The rest of the `<div>`, including its class attribute, moved inside the `<ng-template>` element.

The first form is not actually rendered, only the finished product ends up in the DOM.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/hero-div-in-dom.png' alt="hero div in DOM">
</div>


Angular consumed the `<ng-template>` content during its actual rendering and
replaced the `<ng-template>` with a diagnostic comment.

The [`NgFor`](guide/structural-directives#ngFor) and [`NgSwitch...`](guide/structural-directives#ngSwitch) directives follow the same pattern.
-->
지금까지 설명한 예제처럼 디렉티브 이름에는 별표(`*`) 접두사를 사용하는데, 왜 이 접두사가 필요한지 궁금할 수 있습니다.

아래 코드는 `hero` 프로퍼티에 객체가 할당되었을 때 히어로의 이름을 표시하는 예제입니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (asterisk)" region="asterisk"></code-example>


별표는 복잡한 문법을 단순하게 표현하는 문법 테크닉(syntactic sugar)입니다.
Angular가 `*ngIf` _어트리뷰트_ 를 내부적으로 처리할 때는 `ngIf` 디렉티브가 적용된 호스트 엘리먼트를 감싸도록 `<ng-template>` _엘리먼트_ 를 구성합니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-template)" region="ngif-template"></code-example>


* `*ngIf` 디렉티브는 호스트 엘리먼트 대신 `<ng-template>` 엘리먼트로 옮겨지며, 프로퍼티 바인딩 형태인 `[ngIf]`로 변환됩니다.
* 그리고 호스트 엘리먼트 `<div>`는 나머지 어트리뷰트를 그대로 갖고 `<ng-template>` 엘리먼트 안으로 이동합니다.

DOM에는 원래 엘리먼트 대신 변환된 엘리먼트가 적용됩니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/hero-div-in-dom.png' alt="hero div in DOM">
</div>


그리고 이 호스트 엘리먼트가 렌더링될 때는 `<ng-template>`가 제거되고 디버깅 주석과 안쪽 내용물만 렌더링 됩니다.

이 과정은 [`NgFor`](guide/structural-directives#ngFor)나 [`NgSwitch...`](guide/structural-directives#ngSwitch)에서도 비슷합니다.


{@a ngFor}


<!--
## Inside _*ngFor_
-->
## _*ngFor_ 내부 동작

<!--
Angular transforms the `*ngFor` in similar fashion from asterisk (*) syntax to `<ng-template>` _element_.

Here's a full-featured application of `NgFor`, written both ways:

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (inside-ngfor)" region="inside-ngfor"></code-example>


This is manifestly more complicated than `ngIf` and rightly so.
The `NgFor` directive has more features, both required and optional, than the `NgIf` shown in this guide.
At minimum `NgFor` needs a looping variable (`let hero`) and a list (`heroes`).

You enable these features in the string assigned to `ngFor`, which you write in Angular's [microsyntax](guide/structural-directives#microsyntax).

<div class="alert is-helpful">

Everything _outside_ the `ngFor` string stays with the host element
(the `<div>`) as it moves inside the `<ng-template>`.
In this example, the `[class.odd]="odd"` stays on the `<div>`.

</div>
-->
별표(`*`) 접두사가 붙는 `*ngFor`도 이와 비슷하게 `<ng-template>` _엘리먼트_ 를 활용합니다.

`NgFor` 디렉티브의 기능이 다양하게 활용된 예제를 확인해 봅시다:

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (inside-ngfor)" region="inside-ngfor"></code-example>


이 예제는 `NgIf` 때보다 복잡해 보이고, 실제로도 복잡합니다.
`NgFor`는 `NgIf`보다 기능이 많습니다. `NgFor`를 최소한으로 사용하려면 배열(`heroes`)과 변수(`let hero`)만 있으면 되지만요.

`NgFor`의 기능은 `ngFor`에 적용되는 문자열이 어떻게 구성되느냐에 따라 달라집니다.
이 내용은 [세부 문법](guide/structural-directives#microsyntax)에서 자세하게 확인해 보세요.

<div class="alert is-helpful">


`ngFor`에 적용되는 문자열 이외에는 모두 호스트 엘리먼트 `<div>`에 남아 있으며, `<ng-template>` 내부로 호스트 엘리먼트가 이동할 때 함께 움직입니다.
이 예제로 보면 `[class.odd]="odd"`는 `<div>` 엘리먼트에 그대로 적용되는 것을 확인할 수 있습니다.

</div>



{@a microsyntax}

<!--
## Microsyntax
-->
## 세부 문법(microsyntax)

<!--
The Angular microsyntax lets you configure a directive in a compact, friendly string.
The microsyntax parser translates that string into attributes on the `<ng-template>`:

* The `let` keyword declares a [_template input variable_](guide/structural-directives#template-input-variable)
that you reference within the template. The input variables in this example are `hero`, `i`, and `odd`.
The parser translates `let hero`, `let i`, and `let odd` into variables named
`let-hero`, `let-i`, and `let-odd`.

* The microsyntax parser title-cases all directives and prefixes them with the directive's
attribute name, such as `ngFor`. For example, the `ngFor` input properties,
`of` and `trackBy`, become `ngForOf` and `ngForTrackBy`, respectively.
That's how the directive learns that the list is `heroes` and the track-by function is `trackById`.

* As the `NgFor` directive loops through the list, it sets and resets properties of its own _context_ object.
These properties can include, but aren't limited to, `index`, `odd`, and a special property
named `$implicit`.

* The `let-i` and `let-odd` variables were defined as `let i=index` and `let odd=odd`.
Angular sets them to the current value of the context's `index` and `odd` properties.

* The context property for `let-hero` wasn't specified.
Its intended source is implicit.
Angular sets `let-hero` to the value of the context's `$implicit` property,
which `NgFor` has initialized with the hero for the current iteration.

* The [`NgFor` API guide](api/common/NgForOf "API: NgFor")
describes additional `NgFor` directive properties and context properties.

* The `NgForOf` directive implements `NgFor`. Read more about additional `NgForOf` directive properties and context properties in the [NgForOf API reference](api/common/NgForOf).
-->
세부 문법을 활용하면 복잡한 디렉티브 설정을 문자열로 간단하게 할 수 있습니다.
세부 문법 파서는 어트리뷰트에 사용된 문자열을 `<ng-template>`의 어트리뷰트로 이렇게 변환합니다:

* `let` 키워드는 [_템플릿 입력 변수_](guide/structural-directives#template-input-variable)를 선언합니다. 이 변수는 템플릿 안에서 참조할 수 있으며, `hero`나 `i`, `odd` 등이 템플릿 변수에 해당합니다.
문자열에 있던 `let hero`, `let i`, `let odd`를 파서가 처리하고 나면 `let-hero`, `let-i`, `let-odd`와 같은 이름으로 변경됩니다.

* 그리고 세부문법 파서는 엘리먼트에 사용된 디렉티브 어트리뷰트 이름을 실제 디렉티브와 연결합니다.
`ngFor`의 경우에는 `of`와 `trackBy`를 `ngForOf`와 `ngForTrackBy`로 연결하는 식입니다.
이 작업을 거쳐야 디렉티브에서 처리하는 배열이 `heroes`이며 `trackById` 함수로 객체를 추적할 수 있습니다.

* `NgFor` 디렉티브가 배열을 순회할 때 각 싸이클마다 `NgFor` 컨텍스트에만 적용되는 프로퍼티가 있습니다.
`index`나 `odd`, `$implicit`가 이런 프로퍼티에 해당됩니다.

* `let-i`나 `let-odd`와 같은 변수는 `let i=index`나 `let odd=odd`를 사용할 때만 선언됩니다.
그리고 이 때 사용되는 `index`와 `odd` 프로퍼티는 `NgFor` 컨텍스트에 맞게 Angular가 각각 할당합니다.

* 하지만 `let-hero` 변수는 소스 코드에 따로 선언되며 외부에서는 확인할 수 없습니다. 좀 더 자세하게 설명하면, `let-hero` 변수는 컨텍스트의 `$implicit` 프로퍼티 안에 선언되며, 현재 순회하는 배열에 맞게 Angular가 값을 할당합니다.

* `NgFor` 디렉티브의 프로퍼티와 컨텍스트 프로퍼티에 대해 더 알아보려면 [`NgFor` API 문서](api/common/NgForOf "API: NgFor")를 참고하세요.

* `NgForOf` 디렉티브는 `NgFor` 디렉티블르 기반으로 만들어졌습니다. `NgForOf` 디렉티브의 프로퍼티와 컨텍스트 프로퍼티에 대해 더 알아보려면 [NgForOf API 문서](api/common/NgForOf)를 참고하세요.


<!--
### Writing your own structural directives
-->
### 커스텀 구조 디렉티브 구현하기

<!--
These microsyntax mechanisms are also available to you when you write your own structural directives.
For example, microsyntax in Angular allows you to write `<div *ngFor="let item of items">{{item}}</div>`
instead of `<ng-template ngFor let-item [ngForOf]="items"><div>{{item}}</div></ng-template>`.
The following sections provide detailed information on constraints, grammar,
and translation of microsyntax.
-->
세부문법은 커스텀 구조 디렉티브에서도 동일하게 동작합니다.
그래서 `<ng-template ngFor let-item [ngForOf]="items"><div>{{item}}</div></ng-template>` 라고 작성하지 않고 `<div *ngFor="let item of items">{{item}}</div>`처럼 작성해도 됩니다.
다음 섹션에서는 세부문법의 제약사항, 문법, 변환결과에 대해 자세하게 알아봅시다.


<!--
### Constraints
-->
### 제약사항

<!--
Microsyntax must meet the following requirements:

- It must be known ahead of time so that IDEs can parse it without knowing the underlying semantics of the directive or what directives are present.
- It must translate to key-value attributes in the DOM.
-->
세부문법에는 이런 제약사항들이 있습니다:
- 세부문법은 문자열이기 때문에 IDE가 제대로 처리하지 못할 수 있습니다. 어떤 디렉티브가 사용되었는지 개발자가 충분히 알고 있어야 합니다.
- DOM에서 키-값 어트리뷰트로 변환되어야 합니다.


<!--
### Grammar
-->
### 문법

<!--
When you write your own structural directives, use the following grammar:

```
*:prefix="( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )*"
```

The following tables describe each portion of the microsyntax grammar.
-->
커스텀 구조 디렉티브를 만들었다면 이렇게 사용해야 합니다:

```
*:prefix="( :let | :expression ) (';' | ',')? ( :let | :as | :keyExp )*"
```

세부문법의 각 부분에 대해 자세하게 알아봅시다.

<!-- What should I put in the table headers? -->

<table>
  <tr>
    <th></th>
    <th></th>
  </tr>
  <tr>
    <td><code>prefix</code></td>
    <!--
    <td>HTML attribute key</td>
    -->
    <td>HTML 어트리뷰트 키</td>
  </tr>
  <tr>
    <td><code>key</code></td>
    <!--
    <td>HTML attribute key</td>
    -->
    <td>HTML 어트리뷰트 키</td>
  </tr>
  <tr>
    <td><code>local</code></td>
    <!--
    <td>local variable name used in the template</td>
    -->
    <td>템플릿에 있는 로벌 변수 이름</td>
  </tr>
  <tr>
    <td><code>export</code></td>
    <!--
    <td>value exported by the directive under a given name</td>
    -->
    <td>디렉티브 외부로 공개되는 값</td>
  </tr>
  <tr>
    <td><code>expression</code></td>
    <!--
    <td>standard Angular expression</td>
    -->
    <td>일반적인 Angular 표현식</td>
  </tr>
</table>

<!-- The items in this table seem different. Is there another name for how we should describe them? -->
<table>
  <tr>
    <th></th>
  </tr>
  <tr>
    <td colspan="3"><code>keyExp = :key ":"? :expression ("as" :local)? ";"? </code></td>
  </tr>
  <tr>
    <td colspan="3"><code>let = "let" :local "=" :export ";"?</code></td>
  </tr>
  <tr>
    <td colspan="3"><code>as = :export "as" :local ";"?</code></td>
  </tr>
</table>


<!--
### Translation
-->
### 변환결과

<!--
A microsyntax is translated to the normal binding syntax as follows:
-->
세부문법이 파서로 처리되면 다음과 같이 변환됩니다:

<!-- What to put in the table headers below? Are these correct?-->
<!--
<table>
  <tr>
    <th>Microsyntax</th>
    <th>Translation</th>
  </tr>
  <tr>
    <td><code>prefix</code> and naked <code>expression</code></td>
    <td><code>[prefix]="expression"</code></td>
  </tr>
  <tr>
    <td><code>keyExp</code></td>
    <td><code>[prefixKey] "expression"
    (let-prefixKey="export")</code>
    <br />
    Notice that the <code>prefix</code>
    is added to the <code>key</code>
    </td>
  </tr>
  <tr>
    <td><code>let</code></td>
    <td><code>let-local="export"</code></td>
  </tr>
</table>
-->
<table>
  <tr>
    <th>세부문법</th>
    <th>변환결과</th>
  </tr>
  <tr>
    <td><code>prefix</code>, <code>expression</code></td>
    <td><code>[prefix]="expression"</code></td>
  </tr>
  <tr>
    <td><code>keyExp</code></td>
    <td><code>[prefixKey] "expression"
    (let-prefixKey="export")</code>
    <br />
    <code>key</code> 앞에 <code>prefix</code>가 추가됩니다.
    </td>
  </tr>
  <tr>
    <td><code>let</code></td>
    <td><code>let-local="export"</code></td>
  </tr>
</table>


<!--
### Microsyntax examples
-->
### 세부문법 예제

<!--
The following table demonstrates how Angular desugars microsyntax.

<table>
  <tr>
    <th>Microsyntax</th>
    <th>Desugared</th>
  </tr>
  <tr>
    <td><code>*ngFor="let item of [1,2,3]"</code></td>
    <td><code>&lt;ng-template ngFor let-item [ngForOf]="[1,2,3]"&gt;</code></td>
  </tr>
  <tr>
    <td><code>*ngFor="let item of [1,2,3] as items; trackBy: myTrack; index as i"</code></td>
    <td><code>&lt;ng-template ngFor let-item [ngForOf]="[1,2,3]" let-items="ngForOf" [ngForTrackBy]="myTrack" let-i="index"&gt;</code>
    </td>
  </tr>
  <tr>
    <td><code>*ngIf="exp"</code></td>
    <td><code>&lt;ng-template [ngIf]="exp"&gt;</code></td>
  </tr>
  <tr>
    <td><code>*ngIf="exp as value"</code></td>
    <td><code>&lt;ng-template [ngIf]="exp" let-value="ngIf"&gt;</code></td>
  </tr>
</table>

Studying the
[source code for `NgIf`](https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_if.ts "Source: NgIf")
and [`NgForOf`](https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_for_of.ts "Source: NgForOf")
is a great way to learn more.
-->
Angular가 세부문법의 문법 설탕을 제거하고 나면(desugar) 다음과 같이 변환됩니다.

<table>
  <tr>
    <th>세부문법</th>
    <th>변환결과</th>
  </tr>
  <tr>
    <td><code>*ngFor="let item of [1,2,3]"</code></td>
    <td><code>&lt;ng-template ngFor let-item [ngForOf]="[1,2,3]"&gt;</code></td>
  </tr>
  <tr>
    <td><code>*ngFor="let item of [1,2,3] as items; trackBy: myTrack; index as i"</code></td>
    <td><code>&lt;ng-template ngFor let-item [ngForOf]="[1,2,3]" let-items="ngForOf" [ngForTrackBy]="myTrack" let-i="index"&gt;</code>
    </td>
  </tr>
  <tr>
    <td><code>*ngIf="exp"</code></td>
    <td><code>&lt;ng-template [ngIf]="exp"&gt;</code></td>
  </tr>
  <tr>
    <td><code>*ngIf="exp as value"</code></td>
    <td><code>&lt;ng-template [ngIf]="exp" let-value="ngIf"&gt;</code></td>
  </tr>
</table>

세부문법에 대해 더 자세하게 알아보려면 [`NgIf` 소스 코드](https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_if.ts "Source: NgIf")나 [`NgForOf` 소스 코드](https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_for_of.ts "Source: NgForOf")를 참고하는 것도 좋습니다.


{@a template-input-variable}
{@a template-input-variables}

<!--
## Template input variable
-->
## 템플릿 입력 변수 (Template input variable)

<!--
A _template input variable_ is a variable whose value you can reference _within_ a single instance of the template.
There are several such variables in this example: `hero`, `i`, and `odd`.
All are preceded by the keyword `let`.

A _template input variable_ is **_not_** the same as a
[template _reference_ variable](guide/template-reference-variables),
neither _semantically_ nor _syntactically_.

You declare a template _input_ variable using the `let` keyword (`let hero`).
The variable's scope is limited to a _single instance_ of the repeated template.
You can use the same variable name again in the definition of other structural directives.

You declare a template _reference_ variable by prefixing the variable name with `#` (`#var`).
A _reference_ variable refers to its attached element, component or directive.
It can be accessed _anywhere_ in the _entire template_.

Template _input_ and _reference_ variable names have their own namespaces. The `hero` in `let hero` is never the same
variable as the `hero` declared as `#hero`.
-->
_템플릿 입력 변수_ 는 템플릿 인스턴스 _안에서_ 참조할 수 있는 변수입니다.
위에서 살펴본 예제에서는 `hero`, `i`, `odd`가 템플릿 입력 변수이며, `let` 키워드를 사용해서 선언합니다.

_템플릿 입력 변수_ 는 _용도_ 나 _문법_ 측면에서 봤을 때 [템플릿 _참조_ 변수](guide/template-reference-variables)와는 **_다릅니다_**.

템플릿 _입력_ 변수는 `let hero`와 같이 `let` 키워드를 사용해서 선언합니다.
이 변수의 스코프는 반복되는 템플릿 _인스턴스 하나_ 로만 제한되며, 템플릿 안에 있는 다른 구조 디렉티브에도 같은 이름의 변수를 사용할 수 있습니다.

반면에 템플릿 _참조_ 변수는 `#var`와 같이 `#` 접두사를 붙여 선언합니다.
이 변수는 템플릿 참조 변수가 붙은 엘리먼트나 컴포넌트, 디렉티브를 가리키며, _템플릿 전체_ 범위에서 이 엘리먼트를 자유롭게 참조할 수 있습니다.

템플릿 _입력_ 변수와 _참조_ 변수의 이름은 각각의 네임스페이스 안에 존재합니다.
그래서 `let hero`라고 선언했을 때의 `hero`와 `#hero`라고 선언했을 때의 `hero`는 다른 변수입니다.


{@a one-per-element}

{@a one-structural-directive-per-host-element}
<!--
## One structural directive per host element
-->
## 구조 디렉티브는 호스트 엘리먼트에 하나만

<!--
Someday you'll want to repeat a block of HTML but only when a particular condition is true.
You'll _try_ to put both an `*ngFor` and an `*ngIf` on the same host element.
Angular won't let you. You may apply only one _structural_ directive to an element.

The reason is simplicity. Structural directives can do complex things with the host element and its descendents.
When two directives lay claim to the same host element, which one takes precedence?
Which should go first, the `NgIf` or the `NgFor`? Can the `NgIf` cancel the effect of the `NgFor`?
If so (and it seems like it should be so), how should Angular generalize the ability to cancel for other structural directives?

There are no easy answers to these questions. Prohibiting multiple structural directives makes them moot.
There's an easy solution for this use case: put the `*ngIf` on a container element that wraps the `*ngFor` element.
One or both elements can be an [`ng-container`](guide/structural-directives#ngcontainer) so you don't have to introduce extra levels of HTML.
-->
`ngFor`로 순회하는 배열의 각 항목이 특정 조건일때만 이 항목을 화면에 사용하도록 하려고 합니다.
그러면 호스트 엘리먼트에 `*ngFor`를 사용하면서 `*ngIf`를 함께 사용하는 것이 맞다고 생각할 수 있습니다.
하지만 이 문법은 동작하지 않습니다. _구조_ 디렉티브는 한 엘리먼트에 하나만 적용할 수 있습니다.

이유는 단순합니다. 구조 디렉티브를 다른 구조 디렉티브와 함께 사용하는 로직은 간단하게 일반화 할 수 없습니다.
하나의 호스트 엘리먼트에 구조 디렉티브가 여러개 적용되면 어떻게 될까요?
`NgIf`와 `NgFor`중 어떤 것이 먼저 처리되어야 할까요? `NgFor` 전체에 대해 `NgIf`가 적용되는 것이 맞을까요?
`NgFor`이외의 구조 디렉티브에도 이 정책을 적용하는 것이 맞을까요?

답을 내리기는 쉽지 않습니다. 구조 디렉티브가 동시에 여러개 사용된다면 각각의 경우를 모두 따져봐야 합니다.
하지만 `*ngFor`를 적용한 엘리먼트 안에 또 다른 엘리먼트를 두고 이 엘리먼트에 `*ngIf`를 적용하는 경우라면 간단합니다.
하나 또는 두 개의 엘리먼트는 [`ng-container`](guide/structural-directives#ngcontainer)의 대상이 될 수 있기 때문에, 기존에 활용하던 HTML에서 크게 벗어나지 않습니다.


{@a ngSwitch}


<!--
## Inside _NgSwitch_ directives
-->
## _NgSwitch_ 내부 동작

<!--
The Angular _NgSwitch_ is actually a set of cooperating directives: `NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault`.

Here's an example.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngswitch)" region="ngswitch"></code-example>

The switch value assigned to `NgSwitch` (`hero.emotion`) determines which
(if any) of the switch cases are displayed.

`NgSwitch` itself is not a structural directive.
It's an _attribute_ directive that controls the behavior of the other two switch directives.
That's why you write `[ngSwitch]`, never `*ngSwitch`.

`NgSwitchCase` and `NgSwitchDefault` _are_ structural directives.
You attach them to elements using the asterisk (*) prefix notation.
An `NgSwitchCase` displays its host element when its value matches the switch value.
The `NgSwitchDefault` displays its host element when no sibling `NgSwitchCase` matches the switch value.


<div class="alert is-helpful">

The element to which you apply a directive is its _host_ element.
The `<happy-hero>` is the host element for the happy `*ngSwitchCase`.
The `<unknown-hero>` is the host element for the `*ngSwitchDefault`.
</div>


As with other structural directives, the `NgSwitchCase` and `NgSwitchDefault`
can be desugared into the `<ng-template>` element form.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngswitch-template)" region="ngswitch-template"></code-example>
-->
Angular 기본 디렉티브인 _NgSwitch_ 를 사용한다는 것은 사실 `NgSwitch`, `NgSwitchCase`, `NgSwitchDefault` 디렉티브를 함께 사용하는 것을 의미합니다.

예제를 확인해 봅시다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngswitch)" region="ngswitch"></code-example>


`NgSwitch`는 적용되는 값에 해당되는 템플릿을 화면에 표시합니다. 위 예제의 경우에는 `hero.emotion`에 의해 결정됩니다.

`NgSwitch` 디렉티브 자체는 구조 디렉티브가 아닙니다.
`NgSwitch` 디렉티브는 _어트리뷰트_ 디렉티브이며, 다른 두 디렉티브의 동작을 조절합니다.
그래서 `*ngSwitch`와 같이 지정하지 않고 `[ngSwitch]`로 지정합니다.

`NgSwitchCase`와 `NgSwitchDefault`는 구조 디렉티브입니다.
그래서 이 디렉티브들은 별표(`*`)를 사용하면서 엘리먼트에 지정합니다.
그러면 지정된 값에 해당하는 `NgSwitchCase`가 화면에 표시되고, 아무 값도 해당되지 않으면 `NgSwitchDefault`가 화면에 표시됩니다.


<div class="alert is-helpful">

각각의 디렉티브가 적용된 엘리먼트가 그 디렉티브의 _호스트_ 엘리먼트입니다.
그래서 `*ngSwitchCase`의 호스트 엘리먼트는 `<app-happy-hero>`이고, `*ngSwitchDefault`의 호스트 엘리먼트는 `<app-unknown-hero>`입니다.

</div>


다른 구조 디렉티브와 마찬가지로, `NgSwitchCase`와 `NgSwitchDefault`도 Angular가 렌더링할 때는 `<ng-template>` 엘리먼트로 변환됩니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngswitch-template)" region="ngswitch-template"></code-example>



{@a prefer-asterisk}

<!--
## Prefer the asterisk (*) syntax.
-->
## 별표(`*`) 문법을 사용하세요.

<!--
The asterisk (*) syntax is more clear than the desugared form.
Use [&lt;ng-container&gt;](guide/structural-directives#ng-container) when there's no single element
to host the directive.

While there's rarely a good reason to apply a structural directive in template _attribute_ or _element_ form,
it's still important to know that Angular creates a `<ng-template>` and to understand how it works.
You'll refer to the `<ng-template>` when you [write your own structural directive](guide/structural-directives#unless).
-->
`<ng-template>`을 직접 사용하는 것보다는 별표(`*`)를 사용한 문법이 좀 더 간결합니다.
그리고 별표(`*`) 문법을 사용하지 않고 _어트리뷰트_ 형태나 `<ng-template>` 형태로 구조 디렉티브를 사용했을 때 더 나은 점도 딱히 없습니다.
그래서 구조 디렉티브는 별표(`*`)를 붙여 축약된 문법으로 사용하는 것을 권장합니다.

별표(`*`) 문법이 사용된 엘리먼트는 Angular가 `<ng-template>`으로 변환한다는 것을 알고 넘어가는 것이 중요합니다.
`<ng-template>`은 [커스텀 구조 디렉티브](guide/structural-directives#unless)를 정의할 때도 활용됩니다.

디렉티브가 조작하는 엘리먼트가 여러개라면 [&lt;ng-container&gt;](guide/structural-directives#ng-container)를 사용하는 것도 좋습니다.


{@a template}


<!--
## The *&lt;ng-template&gt;*
-->
## *&lt;ng-template&gt;*

<!--
The &lt;ng-template&gt; is an Angular element for rendering HTML.
It is never displayed directly.
In fact, before rendering the view, Angular _replaces_ the `<ng-template>` and its contents with a comment.

If there is no structural directive and you merely wrap some elements in a `<ng-template>`,
those elements disappear.
That's the fate of the middle "Hip!" in the phrase "Hip! Hip! Hooray!".

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (template-tag)" region="template-tag"></code-example>

Angular erases the middle "Hip!", leaving the cheer a bit less enthusiastic.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/template-rendering.png' alt="template tag rendering">
</div>

A structural directive puts a `<ng-template>` to work
as you'll see when you [write your own structural directive](guide/structural-directives#unless).
-->
`<ng-template>`은 Angular가 HTML을 렌더링할 때 사용하는 엘리먼트이며, 화면에 직접 노출되지는 않습니다.
그리고 `<ng-template>` 안에 있는 내용은 Angular가 뷰를 렌더링하기 전에 주석으로 변경됩니다.

구조 디렉티브를 하나도 사용하지 않고 엘리먼트를 `<ng-template>`으로 감싸기만 하면, 이 엘리먼트는 화면에 표시되지 않습니다.
그래서 다음 "Hip! Hip! Hooray!" 문단들 중 두 번째 문단인 "Hip!"은 표시되지 않습니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (template-tag)" region="template-tag"></code-example>


Angular는 두 번째 문단을 제거하면서 개발자가 보기에는 의미없어 보이는 주석을 남깁니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/template-rendering.png' alt="template tag rendering">
</div>


`<ng-template>`는 구조 디렉티브가 적용될 때에만 그 용도에 맞게 동작하며, [커스텀 구조 디렉티브를 구현](guide/structural-directives#unless)할 때도 활용됩니다.


{@a ngcontainer}
{@a ng-container}


<!--
## Group sibling elements with &lt;ng-container&gt;
-->
## 비슷한 엘리먼트 묶기 : &lt;ng-container&gt;

<!--
There's often a _root_ element that can and should host the structural directive.
The list element (`<li>`) is a typical host element of an `NgFor` repeater.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngfor-li)" region="ngfor-li"></code-example>

When there isn't a host element, you can usually wrap the content in a native HTML container element,
such as a `<div>`, and attach the directive to that wrapper.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif)" region="ngif"></code-example>


Introducing another container element&mdash;typically a `<span>` or `<div>`&mdash;to
group the elements under a single _root_ is usually harmless.
_Usually_ ... but not _always_.

The grouping element may break the template appearance because CSS styles
neither expect nor accommodate the new layout.
For example, suppose you have the following paragraph layout.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-span)" region="ngif-span"></code-example>


You also have a CSS style rule that happens to apply to a `<span>` within a `<p>`aragraph.

<code-example path="structural-directives/src/app/app.component.css" header="src/app/app.component.css (p-span)" region="p-span"></code-example>


The constructed paragraph renders strangely.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/bad-paragraph.png' alt="spanned paragraph with bad style">
</div>


The `p span` style, intended for use elsewhere, was inadvertently applied here.

Another problem: some HTML elements require all immediate children to be of a specific type.
For example, the `<select>` element requires `<option>` children.
You can't wrap the _options_ in a conditional `<div>` or a `<span>`.

When you try this,

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (select-span)" region="select-span"></code-example>


the drop down is empty.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/bad-select.png' alt="spanned options don't work">
</div>


The browser won't display an `<option>` within a `<span>`.
-->
구조 디렉티브의 호스트 엘리먼트는 보통 엘리먼트 하나입니다.
예를 들어 리스트 엘리먼트(`<li>`)에 `NgFor`를 사용한다면 다음과 같이 구현할 수 있습니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngfor-li)" region="ngfor-li"></code-example>


하지만 호스트 엘리먼트가 하나가 아닌 경우가 있습니다.
이런 경우라면 네이티브 HTML인 `<div>`로 엘리먼트를 감싸고 이 `<div>`에 디렉티브를 적용해도 됩니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif)" region="ngif"></code-example>


호스트 엘리먼트 하나 밑에 `<span>`이나 `<div>` 엘리먼트를 사용하는 것은 일반적으로 문제가 없습니다.
_보통은_ 그렇죠. 하지만 _항상_ 그런 것은 아닙니다.

엘리먼트를 묶으면 이 엘리먼트가 템플릿의 어떤 자리에 위치하는지에 따라서 CSS 스타일이 잘못 지정되거나 레이아웃 자체가 틀어질 수 있습니다.
예를 들어 다음과 같은 문단이 있다고 합시다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-span)" region="ngif-span"></code-example>


그리고 전역 CSS 스타일에는 `<p>` 안에 있는 `<span>`에 다음과 같은 스타일을 지정하고 있다고 합시다.

<code-example path="structural-directives/src/app/app.component.css" header="src/app/app.component.css (p-span)" region="p-span"></code-example>


그러면 다음과 같은 결과물이 표시되지만, 약간 이상합니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/bad-paragraph.png' alt="spanned paragraph with bad style">
</div>


`p span` 스타일은 전역에 사용하려고 선언했지만, 이곳에는 적용되지 않는 것이 더 나은 것 같습니다.

그리고 또 다른 문제도 있습니다. 일부 엘리먼트는 바로 밑 자식 엘리먼트에 특정한 형태를 요구하는 경우도 있습니다.
예를 들면 `<select>` 엘리먼트 안에 `<option>` 엘리먼트를 구성해야 하는 경우가 그렇습니다.
`<div>`나 `<span>` 엘리먼트에는 `<option>` 엘리먼트를 사용하는 것이 적합하지 않습니다.

다음 코드를 봅시다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (select-span)" region="select-span"></code-example>


이 코드를 실행해보면 드롭다운의 내용이 비어있는 것을 확인할 수 있습니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/bad-select.png' alt="spanned options don't work">
</div>


브라우저는 `<span>` 안에 있는 `<option>`을 처리하지 않습니다.


<!--
### &lt;ng-container&gt; to the rescue
-->
### 해결방법 : &lt;ng-container&gt;

<!--
The Angular `<ng-container>` is a grouping element that doesn't interfere with styles or layout
because Angular _doesn't put it in the DOM_.

Here's the conditional paragraph again, this time using `<ng-container>`.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-ngcontainer)" region="ngif-ngcontainer"></code-example>


It renders properly.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/good-paragraph.png' alt="ngcontainer paragraph with proper style">
</div>


Now conditionally exclude a _select_ `<option>` with `<ng-container>`.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (select-ngcontainer)" region="select-ngcontainer"></code-example>


The drop down works properly.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/select-ngcontainer-anim.gif' alt="ngcontainer options work properly">
</div>

<div class="alert is-helpful">

**Note:** Remember that ngModel directive is defined as a part of Angular FormsModule and you need to include FormsModule in the imports: [...] section of the Angular module metadata, in which you want to use it.

</div>

The `<ng-container>` is a syntax element recognized by the Angular parser.
It's not a directive, component, class, or interface.
It's more like the curly braces in a JavaScript `if`-block:

<code-example language="javascript">
  if (someCondition) {
    statement1;
    statement2;
    statement3;
  }

</code-example>


Without those braces, JavaScript would only execute the first statement
when you intend to conditionally execute all of them as a single block.
The `<ng-container>` satisfies a similar need in Angular templates.
-->
`<ng-container>`를 사용하면 스타일이나 레이아웃을 그대로 유지하면서 여러 엘리먼트를 한 그룹으로 묶을 수 있습니다. 왜냐하면 Angular는 이 엘리먼트를 _DOM에 직접 추가하지 않기 때문_ 입니다.

`ngIf`를 사용하는 `<p>` 엘리먼트를 생각해 봅시다. 이 엘리먼트는 `<ng-container>`를 사용합니다.


<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-ngcontainer)" region="ngif-ngcontainer"></code-example>


이 코드는 제대로 렌더링 됩니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/good-paragraph.png' alt="ngcontainer paragraph with proper style">
</div>


그리고 이번에는 `<select>`태그 안에 있는 `<option>` 엘리먼트를 배열에 따라 반복하고 표시 조건도 지정하는 용도로 `<ng-container>`를 사용해 봅시다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (select-ngcontainer)" region="select-ngcontainer"></code-example>


그러면 드롭다운도 제대로 동작합니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/select-ngcontainer-anim.gif' alt="ngcontainer options work properly">
</div>

<div class="alert is-helpful">

**참고:** `ngModel` 디렉티브는 Angular `FormsModule`이 제공하는 디렉티브입니다. 이 디렉티브를 사용하려면 모듈 메타데이터의 `imports` 배열에 `FormsModule`을 추가해야 합니다.

</div>

`<ng-container>`는 Angular 파서용 엘리먼트입니다.
이 엘리먼트 자체는 디렉티브나 컴포넌트, 클래스, 인터페이스 중 어느 것에도 해당되지 않으며, 오히려 JavaScript의 `if` 문법에 사용하는 중괄호(`{`, `}`)와 비슷하다고 볼 수 있습니다.

<code-example language="javascript">
  if (someCondition) {
    statement1;
    statement2;
    statement3;
  }

</code-example>


중괄호가 없으면 JavaScript는 실행문 3개 중에 첫번째 하나만 실행합니다.
의도한 대로 실행문 3개를 한 번에 실행하려면 실행문 전체를 중괄호로 묶어야 합니다.
Angular 템플릿에서는 `<ng-container>`가 이런 역할을 합니다.


{@a unless}

<!--
## Write a structural directive
-->
## 커스텀 구조 디렉티브 작성하기

<!--
In this section, you write an `UnlessDirective` structural directive
that does the opposite of `NgIf`.
`NgIf` displays the template content when the condition is `true`.
`UnlessDirective` displays the content when the condition is ***false***.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (appUnless-1)" region="appUnless-1"></code-example>


Creating a directive is similar to creating a component.

* Import the `Directive` decorator (instead of the `Component` decorator).

* Import the `Input`, `TemplateRef`, and `ViewContainerRef` symbols; you'll need them for _any_ structural directive.

* Apply the decorator to the directive class.

* Set the CSS *attribute selector* that identifies the directive when applied to an element in a template.

Here's how you might begin:


<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (skeleton)" region="skeleton"></code-example>


The directive's _selector_ is typically the directive's **attribute name** in square brackets, `[appUnless]`.
The brackets define a CSS
<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors" title="MDN: Attribute selectors">attribute selector</a>.

The directive _attribute name_ should be spelled in _lowerCamelCase_ and begin with a prefix.
Don't use `ng`. That prefix belongs to Angular.
Pick something short that fits you or your company.
In this example, the prefix is `app`.


The directive _class_ name ends in `Directive` per the [style guide](guide/styleguide#02-03 "Angular Style Guide").
Angular's own directives do not.
-->
이번에는 `NgIf`의 반대 기능을 하는 `UnlessDirective`를 만들어 봅니다.
`NgIf`가 조건이 `true`일 때 템플릿 내용을 화면에 표시한다면, `UnlessDirective`는 조건이 ***false***일 때 템플릿 내용을 화면에 표시할 것입니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (appUnless-1)" region="appUnless-1"></code-example>


디렉티브를 작성하는 방법은 컴포넌트를 작성하는 것과 비슷합니다.

* `Component` 데코레이터를 불러오는 것처럼 `Directive` 데코레이터를 로ㄷ합니다.

* `Input`, `TemplateRef`, `ViewContainerRef` 심볼을 로드합니다. 구조 디렉티브가 DOM을 조작하려면 이 심볼들이 필요합니다.

* 데코레이터를 디렉티브 클래스에 적용합니다.

* 템플릿 엘리먼트에 적용할 때 사용하는 CSS *어트리뷰트 셀렉터*를 지정합니다.

이렇게 작성하면 다음과 비슷한 코드가 될 것입니다:


<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (skeleton)" region="skeleton"></code-example>


디렉티브의 _셀렉터_ 는 일반적으로 디렉티브의 **어트리뷰트 이름**을 대괄호로 감싼 형태가 되기 때문에 이 예제에서는 `[appUnless]`를 지정했습니다.
대괄호는 CSS <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors" title="MDN: Attribute selectors">어트리뷰트 셀렉터</a>를 의미합니다.

디렉티브의 _어트리뷰트 이름_ 은 애플리케이션에서 정의한 접두사로 시작하며 _소문자 캐멀 케이스_ 로 지정합니다.
이 때 `ng`는 Angular가 내부적으로 사용하고 있기 때문에 접두사로 사용하면 안됩니다.
개발 환경이나 회사에 적합한 접두사를 사용하세요.
이 예제에서는 `app`을 접두사로 사용했습니다.

그리고 [코딩 가이드](guide/styleguide#02-03 "Angular Style Guide")에 따라 디렉티브 _클래스_ 이름은 `Directive`로 끝나도록 정의했습니다.
참고로 Angular 기본 디렉티브는 `Directive`로 끝나지 않습니다.


<!--
### _TemplateRef_ and _ViewContainerRef_
-->
### _TemplateRef_ 와 _ViewContainerRef_

<!--
A simple structural directive like this one creates an
[_embedded view_](api/core/EmbeddedViewRef "API: EmbeddedViewRef")
from the Angular-generated `<ng-template>` and inserts that view in a
[_view container_](api/core/ViewContainerRef "API: ViewContainerRef")
adjacent to the directive's original `<p>` host element.

You'll acquire the `<ng-template>` contents with a
[`TemplateRef`](api/core/TemplateRef "API: TemplateRef")
and access the _view container_ through a
[`ViewContainerRef`](api/core/ViewContainerRef "API: ViewContainerRef").

You inject both in the directive constructor as private variables of the class.


<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (ctor)" region="ctor"></code-example>
-->
구조 디렉티브는 `<ng-template>`을 사용하는 [_내장 뷰_](api/core/EmbeddedViewRef "API: EmbeddedViewRef")를 생성하고, 이 뷰를 [_뷰 컨테이너_](api/core/ViewContainerRef "API: ViewContainerRef") 로 감싼 후에 호스트 엘리먼트인 `<p>` 옆에 추가합니다.

그러면 `<ng-template>`의 내용은 [`TemplateRef`](api/core/TemplateRef "API: TemplateRef")로 참조할 수 있고, _뷰 컨테이너_ 는 [`ViewContainerRef`](api/core/ViewContainerRef "API: ViewContainerRef")로 참조할 수 있습니다.

두 객체를 클래스에서 참조할 수 있도록 디렉티브 생성자에 두 심볼을 의존성으로 주입합니다.

<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (ctor)" region="ctor"></code-example>


<!--
### The _appUnless_ property
-->
### _appUnless_ 프로퍼티

<!--
The directive consumer expects to bind a true/false condition to `[appUnless]`.
That means the directive needs an `appUnless` property, decorated with `@Input`

<div class="alert is-helpful">


Read about `@Input` in the [`@Input()` and `@Output()` properties](guide/inputs-outputs) guide.

</div>



<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (set)" region="set"></code-example>


Angular sets the `appUnless` property whenever the value of the condition changes.
Because the `appUnless` property does work, it needs a setter.

* If the condition is falsy and the view hasn't been created previously,
tell the _view container_ to create the _embedded view_ from the template.

* If the condition is truthy and the view is currently displayed,
clear the container which also destroys the view.

Nobody reads the `appUnless` property so it doesn't need a getter.

The completed directive code looks like this:

<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (excerpt)" region="no-docs"></code-example>


Add this directive to the `declarations` array of the AppModule.

Then create some HTML to try it.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (appUnless)" region="appUnless"></code-example>


When the `condition` is falsy, the top (A) paragraph appears and the bottom (B) paragraph disappears.
When the `condition` is truthy, the top (A) paragraph is removed and the bottom (B) paragraph appears.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/unless-anim.gif' alt="UnlessDirective in action">
</div>
-->
이 디렉티브는 `[appUnless]`로 true/false 조건을 받습니다.
이 말은, 디렉티브에 `appUnless` 프로퍼티가 있어야 하며, 이 프로퍼티는 `@Input`로 지정되어야 한다는 것을 의미합니다.

<div class="alert is-helpful">

`@Input` 데코레이터에 대한 내용은 [`@Input()`, `@Output()` 데코레이터](guide/inputs-outputs) 문서를 참고하세요.

</div>


<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (set)" region="set"></code-example>

`appUnless` 프로퍼티의 값은 이 프로퍼티에 바인딩 된 값이 바뀔때마다 Angular가 새로 할당합니다.
그래서 이 프로퍼티 값에 반응하려면 세터(setter)가 필요합니다.

* 거짓으로 평가되는 값이 전달되고 내장 뷰가 아직 생성되지 않았으면, _뷰 컨테이너_ 를 사용해서 _내장 뷰_ 를 생성합니다.

* 참으로 평가되는 값이 전달되고 뷰가 화면에 표시되고 있으면, 컨테이너의 내용을 비우고 뷰에서 제거합니다.

`appUnless` 프로퍼티를 참조하는 것은 아무것도 없기 때문에 게터(getter)는 따로 정의하지 않습니다.

그러면 다음과 같은 코드가 됩니다:

<code-example path="structural-directives/src/app/unless.directive.ts" header="src/app/unless.directive.ts (일부)" region="no-docs"></code-example>


이제 이 디렉티브를 AppModule의 `declarations` 배열에 추가합니다.

그러고 HTML에 이 디렉티브를 적용해 봅니다.

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (appUnless)" region="appUnless"></code-example>


`condition` 값이 거짓으로 평가되면 (A) 문단이 화면에 표시되고 (B) 문단은 화면에 표시되지 않습니다.
그리고 `condition` 값이 참으로 평가되면 (A) 문단이 화면에 표시되지 않고 (B) 문단이 화면에 표시됩니다.

<div class="lightbox">
  <img src='generated/images/guide/structural-directives/unless-anim.gif' alt="UnlessDirective in action">
</div>


{@a directive-type-checks}

<!--
## Improving template type checking for custom directives
-->
## 커스텀 디렉티브에 향상된 템플릿 타입 검사 기능 적용하기

<!--
You can improve template type checking for custom directives by adding template guard properties to your directive definition.
These properties help the Angular template type checker find mistakes in the template at compile time, which can avoid runtime errors those mistakes can cause.

Use the type-guard properties to inform the template type checker of an expected type, thus improving compile-time type-checking for that template.

* A property `ngTemplateGuard_(someInputProperty)` lets you specify a more accurate type for an input expression within the template.
* The `ngTemplateContextGuard` static property declares the type of the template context.

This section provides example of both kinds of type-guard property.

<div class="alert is-helpful">

   For more information, see [Template type checking guide](guide/template-typecheck "Template type-checking guide").

</div>
-->
디렉티브를 선언할 때 템플릿 가드 관련 프로퍼티를 추가하면 커스텀 디렉티브에도 향상된 템플릿 타입 검사 기능을 적용할 수 있습니다.
이 때 추가하는 프로퍼티들은 템플릿이 컴파일되는 시점에 Angular 템플릿 타입 검사 로직에 더 많은 정보를 주는 용도로 활용되기 때문에 Angular 애플리케이션이 실행되는 시점에 발생할 수 있는 에러를 사전에 검출할 수 있습니다.

타입 가드 프로퍼티를 선언하면 템플릿 타입 검사 로직이 동작할 때 이 정보를 활용합니다.
따라서 컴파일 시점에 템플릿에서 활용할 수 있는 타입 검사 로직이 더 엄격해집니다.

* `ngTemplateGuard_(someInputProperty)` 프로퍼티는 템플릿에 더 향상된 타입 검사 로직을 적용하도록 지정하는 프로퍼티입니다.
* 정적 프로퍼티 `ngTemplateContextGuard`는 템플릿 컨텍스트에 사용되는 타입을 지정하는 프로퍼티입니다.

이 섹션에서는 두가지 타입 가드 프로퍼티를 예제와 함께 살펴봅시다.

<div class="alert is-helpful">

더 자세한 내용을 확인하려면 [템플릿 타입 검사 가이드](guide/template-typecheck "Template type-checking guide") 문서를 참고하세요.

</div>


{@a narrowing-input-types}

<!--
### Make in-template type requirements more specific with template guards
-->
### 템플릿 가드로 타입 구체화하기

<!--
A structural directive in a template controls whether that template is rendered at run time, based on its input expression.
To help the compiler catch template type errors, you should specify as closely as possible the required type of a directive's input expression when it occurs inside the template.

A type guard function *narrows* the expected type of an input expression to a subset of types that might be passed to the directive within the template at run time.
You can provide such a function to help the type-checker infer the proper type for the expression at compile time.

For example, the `NgIf` implementation uses type-narrowing to ensure that the
template is only instantiated if the input expression to `*ngIf` is truthy.
To provide the specific type requirement, the `NgIf` directive defines a [static property `ngTemplateGuard_ngIf: 'binding'`](api/common/NgIf#static-properties).
The `binding` value is a special case for a common kind of type-narrowing where the input expression is evaluated in order to satisfy the type requirement.

To provide a more specific type for an input expression to a directive within the template, add a `ngTemplateGuard_xx` property to the directive, where the suffix to the static property name is the `@Input` field name.
The value of the property can be either a general type-narrowing function based on its return type, or the string `"binding"` as in the case of `NgIf`.

For example, consider the following structural directive that takes the result of a template expression as an input.

<code-example language="ts" header="IfLoadedDirective">
export type Loaded<T> = { type: 'loaded', data: T };
export type Loading = { type: 'loading' };
export type LoadingState<T> = Loaded<T> | Loading;
export class IfLoadedDirective<T> {
    @Input('ifLoaded') set state(state: LoadingState<T>) {}
    static ngTemplateGuard_state<T>(dir: IfLoadedDirective<T>, expr: LoadingState<T>): expr is Loaded<T> { return true; };
}

export interface Person {
  name: string;
}

@Component({
  template: `&lt;div *ifLoaded="state">{{ state.data }}&lt;/div>`,
})
export class AppComponent {
  state: LoadingState<Person>;
}
</code-example>

In this example, the `LoadingState<T>` type permits either of two states, `Loaded<T>` or `Loading`. The expression used as the directive’s `state` input is of the umbrella type `LoadingState`, as it’s unknown what the loading state is at that point.

The `IfLoadedDirective` definition declares the static field `ngTemplateGuard_state`, which expresses the narrowing behavior.
Within the `AppComponent` template, the `*ifLoaded` structural directive should render this template only when `state` is actually `Loaded<Person>`.
The type guard allows the type checker to infer that the acceptable type of `state` within the template is a `Loaded<T>`, and further infer that `T` must be an instance of `Person`.
-->
템플릿에 구조 디렉티브가 사용되면 이 구조 디렉티브는 바인딩된 표현식에 따라 실행 시점에 템플릿을 렌더링할 것인지 결정합니다.
이 때 발생할 수 있는 타입 관련 에러를 컴파일러가 사전에 검출하는 데 도움을 주려면, 템플릿 안에서 디렉티브에 바인딩되는 표현식의 타입을 명확하게 지정할 수록 좋습니다.

타입 가드 함수는 애플리케이션이 실행되는 시점에 템플릿에 사용되는 표현식이 반환하는 값의 타입을 더 구체적으로 *좁히는(narrows)* 역할을 합니다.
그리고 이런 타입 가드 함수는 컴파일 시점에서 템플릿 타입 검사 로직이 더 정확한 타입을 추론하는 데에도 도움을 줍니다.

`NgIf` 디렉티브는 `*ngIf`에 바인딩되는 표현식이 참으로 평가될 때만 템플릿을 화면에 렌더링하는데, `NgIf` 디렉티브에 [정적 프로퍼티 `ngTemplateGuard_ngIf: 'binding'`](api/common/NgIf#static-properties)를 선언하면 요구되는 타입에 대한 정보를 더 구체적으로 지정할 수 있습니다.
이 때 사용되는 `binding` 값은 표현식이 반환하는 결과를 더 구체적인 타입으로 제한하기 위해 사용되는 값입니다.

템플릿 안에서 디렉티브에 바인딩되는 표현식에 더 엄격한 타입을 적용하려면 디렉티브에 `ngTemplateGuard_xx` 프로퍼티를 정의하면 됩니다. 이 때 `xx`에 해당하는 접미사는 `@Input()` 필드에 사용된 정적 프로퍼티 이름으로 선언합니다.
이 프로퍼티 값은 템플릿이 반환하는 타입을 구체적으로 지정하는 함수이거나, `NgIf`인 경우에는 문자열 `"binding"`을 사용할 수 있습니다.

아래 구조 디렉티브 예제 코드를 살펴봅시다.

<code-example language="ts" header="IfLoadedDirective">
export type Loaded<T> = { type: 'loaded', data: T };
export type Loading = { type: 'loading' };
export type LoadingState<T> = Loaded<T> | Loading;
export class IfLoadedDirective<T> {
    @Input('ifLoaded') set state(state: LoadingState<T>) {}
    static ngTemplateGuard_state<T>(dir: IfLoadedDirective<T>, expr: LoadingState<T>): expr is Loaded<T> { return true; };
}

export interface Person {
  name: string;
}

@Component({
  template: `&lt;div *ifLoaded="state">{{ state.data }}&lt;/div>`,
})
export class AppComponent {
  state: LoadingState<Person>;
}
</code-example>

이 예제 코드에서 `LoadingState<T>` 타입은 `Loaded<T>` 타입이나 `Loading` 타입이 될 수 있습니다.
그리고 템플릿에서 디렉티브에 바인딩된 `state`는 `LoadingState` 타입이기 때문에 이 시점에는 정확히 어떤 타입인지 알 수 없습니다.

이 때 표현식이 허용하는 타입 범위를 좁히기 위해 `IfLoadedDirective` 디렉티브에 정적 필드 `ngTemplateGuard_state`를 선언합니다.
그러면 `AppComponent` 템플릿 안에서 구조 디렉티브 `*ifLoaded`는 `state` 값이 정확히 `Loaded<Person>`이 될 때만 템플릿을 화면에 렌더링합니다.
이제 템플릿에 사용되는 `state`는 `Loaded<T>` 타입이라는 정보 외에도, `T`가 `Person` 인스턴스라는 정보까지 전달할 수 있습니다.


{@a narrowing-context-type}

<!--
### Typing the directive's context
-->
### 디렉티브 컨텍스트의 타입 지정하기

<!--
If your structural directive provides a context to the instantiated template, you can properly type it inside the template by providing a static `ngTemplateContextGuard` function.
The following snippet shows an example of such a function.

<code-example language="ts" header="myDirective.ts">
@Directive({…})
export class ExampleDirective {
    // Make sure the template checker knows the type of the context with which the
    // template of this directive will be rendered
    static ngTemplateContextGuard(dir: ExampleDirective, ctx: unknown): ctx is ExampleContext { return true; };

    // …
}
</code-example>
-->
구조 디렉티브가 템플릿을 인스턴스로 만들어서 컨텍스트에 제공한다면, 정적 함수 `ngTemplateContextGuard`를 사용해서 이 템플릿의 컨텍스트 타입을 명확하게 지정할 수 있습니다.
아래 예제를 확인해 보세요.

<code-example language="ts" header="myDirective.ts">
@Directive({…})
export class ExampleDirective {
    // 이 함수를 정의하면 디렉티브가 렌더링할 템플릿 템플릿 인스턴스의 타입을
    // 템플릿 검사기가 정확하게 확인할 수 있습니다.
    static ngTemplateContextGuard(dir: ExampleDirective, ctx: unknown): ctx is ExampleContext { return true; };

    // …
}
</code-example>


{@a summary}

<!--
## Summary
-->
## 정리

<!--
You can both try and download the source code for this guide in the <live-example></live-example>.

Here is the source from the `src/app/` folder.
-->
이 문서에서 설명하는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

그리고 소스 코드 `src/app/` 폴더의 내용은 다음과 같습니다.


<code-tabs>

  <code-pane header="app.component.ts" path="structural-directives/src/app/app.component.ts">

  </code-pane>

  <code-pane header="app.component.html" path="structural-directives/src/app/app.component.html">

  </code-pane>

  <code-pane header="app.component.css" path="structural-directives/src/app/app.component.css">

  </code-pane>

  <code-pane header="app.module.ts" path="structural-directives/src/app/app.module.ts">

  </code-pane>

  <code-pane header="hero.ts" path="structural-directives/src/app/hero.ts">

  </code-pane>

  <code-pane header="hero-switch.components.ts" path="structural-directives/src/app/hero-switch.components.ts">

  </code-pane>

  <code-pane header="unless.directive.ts" path="structural-directives/src/app/unless.directive.ts">

  </code-pane>

</code-tabs>


<!--
You learned:
-->
이 문서에서는 다음 내용에 대해 다뤘습니다.

<!--
* that structural directives manipulate HTML layout.
* to use [`<ng-container>`](guide/structural-directives#ngcontainer) as a grouping element when there is no suitable host element.
* that the Angular desugars [asterisk (*) syntax](guide/structural-directives#asterisk) into a `<ng-template>`.
* how that works for the `NgIf`, `NgFor` and `NgSwitch` built-in directives.
* about the [_microsyntax_](guide/structural-directives#microsyntax) that expands into a [`<ng-template>`](guide/structural-directives#template).
* to write a [custom structural directive](guide/structural-directives#unless), `UnlessDirective`.
-->
* 구조 디렉티브는 HTML 레이아웃을 변경합니다.
* 호스트 엘리먼트에 영향을 주지 않으면서 엘리먼트를 묶으려면 [`<ng-container>`](guide/structural-directives#ngcontainer)를 사용하세요.
* [별표(*)를 사용한](guide/structural-directives#asterisk) 문법을 Angular가 처리하고 나면 `<ng-template>`이 됩니다.
* 기본 디렉티브인 `NgIf`, `NgFor`, `NgSwitch`가 어떻게 동작하는지 살펴봤습니다.
* [`<ng-template>`](guide/structural-directives#template)을 활용하는 [_세부 문법](guide/structural-directives#microsyntax)에 대해 알아봤습니다.
* [커스텀 구조 디렉티브](guide/structural-directives#unless) `UnlessDirective` 를 만들어 봤습니다.