<!--
# Attribute Directives
-->
# 어트리뷰트 디렉티브

<!--
An **Attribute** directive changes the appearance or behavior of a DOM element.
-->
**어트리뷰트** 디렉티브는 DOM 엘리먼트의 모습이나 동작을 변경합니다.

<!--
Try the <live-example title="Attribute Directive example"></live-example>.
-->
이 문서에서 설명하는 예제는 <live-example title="어트리뷰트 디렉티브 예제"></live-example>에서 직접 확인하거나 다운 받을 수 있습니다.

<!--
{@a directive-overview}
-->
{@a 디렉티브-개요}

<!--
## Directives overview
-->
## 디렉티브 개요

<!--
There are three kinds of directives in Angular:
-->
Angular 디렉티브는 3종류가 있습니다:

<!--
1. Components&mdash;directives with a template.
1. Structural directives&mdash;change the DOM layout by adding and removing DOM elements.
1. Attribute directives&mdash;change the appearance or behavior of an element, component, or another directive.
-->
1. 컴포넌트&mdash;템플릿이 있는 디렉티브
1. 구조 디렉티브&mdash;DOM 엘리먼트를 추가하거나 제거해서 DOM 레이아웃을 변경합니다.
1. 어트리뷰트 디렉티브&mdash;엘리먼트나 컴포넌트, 다른 디렉티브의 모습이나 동작을 변경합니다.

<!--
*Components* are the most common of the three directives.
You saw a component for the first time in the [Getting Started](start "Getting Started with Angular") tutorial.
-->
디렉티브 중에서는 *컴포넌트*를 가장 많이 사용합니다.
처음 확인하는 가이드 문서인 [시작하기](start "Getting Started with Angular")에서도 확인할 수 있습니다.

<!--
*Structural Directives* change the structure of the view.
Two examples are [NgFor](guide/template-syntax#ngFor) and [NgIf](guide/template-syntax#ngIf).
Learn about them in the [Structural Directives](guide/structural-directives) guide.
-->
*구조 디렉티브*는 뷰의 구조를 변경합니다.
구조 디렉티브 중에서 가장 많이 사용하는 [NgFor](guide/template-syntax#ngFor)나 [NgIf](guide/template-syntax#ngIf) 예제를 확인해 보세요.
구조 디렉티브의 개념은 [구조 디렉티브](guide/structural-directives)에서도 확인할 수 있습니다.

<!--
*Attribute directives* are used as attributes of elements.
The built-in [NgStyle](guide/template-syntax#ngStyle) directive in the
[Template Syntax](guide/template-syntax) guide, for example,
can change several element styles at the same time.
-->
*어트리뷰트 디렉티브*는 엘리먼트의 어트리뷰트처럼 사용합니다.
[템플릿 문법](guide/template-syntax) 가이드 문서에서 활용하는 [NgStyle](guide/template-syntax#ngStyle)을 확인해 보세요. 이 디렉티브는 Angular에서 제공하는 기본 디렉티브이며, 여러 엘리먼트 스타일을 한 번에 지정할 수 있습니다.

<!--
## Build a simple attribute directive
-->
## 간단한 어트리뷰트 디렉티브 만들어보기

<!--
An attribute directive minimally requires building a controller class annotated with
`@Directive`, which specifies the selector that identifies
the attribute.
The controller class implements the desired directive behavior.
-->
어트리뷰트 디렉티브는 `@Directive` 데코레이터가 붙은 클래스 코드만으로 간단하게 만들 수 있습니다. 이 데코레이터의 메타데이터에는 디렉티브가 적용될 셀렉터를 지정합니다.
클래스 코드에는 디렉티브가 어떻게 동작할지 정의하는 로직을 작성합니다.

<!--
This page demonstrates building a simple _appHighlight_ attribute
directive to set an element's background color
when the user hovers over that element. You can apply it like this:
-->
이 문서에서는 사용자가 엘리먼트 위로 마우스를 올렸을 때 엘리먼트의 배경 색상을 변경하는 _appHighlight_ 어트리뷰트 디렉티브를 간단하게 만들어 봅니다.
이 디렉티브는 다음과 같이 적용합니다:

<code-example path="attribute-directives/src/app/app.component.1.html" linenums="false" header="src/app/app.component.html (applied)" region="applied"></code-example>

<!--
{@a write-directive}
-->
{@a 디렉티브-코드-작성하기}

<!--
Please note that directives _do not_ support namespaces.
-->
디렉티브는 네임스페이스를 지원하지 _않는다는 것을_ 명심하세요.

<!--
<code-example path="attribute-directives/src/app/app.component.avoid.html" linenums="false" header="src/app/app.component.avoid.html (unsupported)" region="unsupported"></code-example>
-->
<code-example path="attribute-directives/src/app/app.component.avoid.html" linenums="false" header="src/app/app.component.avoid.html (지원하지 않는 문법)" region="unsupported"></code-example>

<!--
### Write the directive code
-->
### 디렉티브 코드 작성하기

<!--
Create the directive class file in a terminal window with the CLI command [`ng generate directive`](cli/generate).
-->
터미널에서 CLI 명령 [`ng generate directive`](cli/generate)를 사용하면 디렉티브 클래스 파일을 간단하게 만들 수 있습니다.

<code-example language="sh" class="code-shell">
ng generate directive highlight
</code-example>

<!--
The CLI creates `src/app/highlight.directive.ts`, a corresponding test file `src/app/highlight.directive.spec.ts`, and _declares_ the directive class in the root `AppModule`.
-->
이 명령을 실행하면 CLI가 `src/app/highlight.directive.ts` 파일과 테스트 파일인 `src/app/highlight.directive.spec.ts` 파일을 함께 생성하고 최상위 모듈 `AppModule`에 이 디렉티브 클래스를 자동으로 추가합니다.

<div class="alert is-helpful">

<!--
_Directives_ must be declared in [Angular Modules](guide/ngmodules) in the same manner as _components_.
-->
_디렉티브_ 는 _컴포넌트_ 와 마찬가지로 [Angular 모듈](guide/ngmodules)에 반드시 정의되어야 합니다.

</div >

<!--
The generated `src/app/highlight.directive.ts` is as follows:
-->
이렇게 생성된 `src/app/highlight.directive.ts` 파일의 내용은 다음과 같습니다:

<code-example path="attribute-directives/src/app/highlight.directive.0.ts" header="src/app/highlight.directive.ts"></code-example>

<!--
The imported `Directive` symbol provides Angular the `@Directive` decorator.
-->
먼저, Angular 데코레이터 `@Directive`를 사용하기 위해 `Directive` 심볼을 로드합니다.

<!--
The `@Directive` decorator's lone configuration property specifies the directive's
[CSS attribute selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors), `[appHighlight]`.
-->
`@Directive`에는 [CSS 어트리뷰트 셀렉터](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)로 디렉티브 셀렉터를 지정하며, 이 코드의 경우에는 `[appHighlight]`로 지정했습니다.

<!--
It's the brackets (`[]`) that make it an attribute selector.
Angular locates each element in the template that has an attribute named `appHighlight` and applies the logic of this directive to that element.
-->
어트리뷰트 셀렉터는 HTML 문서에 대괄호(`[]`)를 사용해서 지정합니다.
그러면 Angular가 템플릿을 처리할 때 `appHighlight` 어트리뷰트가 지정된 엘리먼트에 이 디렉티브를 적용합니다.

<!--
The _attribute selector_ pattern explains the name of this kind of directive.
-->
따라서 _어트리뷰트 셀렉터_ 는 디렉티브의 동작을 적절하게 표현할 수 있는 이름으로 지정하는 것이 좋습니다.

<div class="alert is-helpful">

<!--
#### Why not "highlight"?
-->
### `highlight`를 사용하면 왜 안될까?

<!--
Though *highlight* would be a more concise selector than *appHighlight* and it would work,
the best practice is to prefix selector names to ensure
they don't conflict with standard HTML attributes.
This also reduces the risk of colliding with third-party directive names.
The CLI added the `app` prefix for you.
-->
디렉티브 셀렉터를 *appHighlight*라고 정의하는 것보다 *highlight*라고 정의하는 것이 더 간단하고 이렇게 정의해도 디렉티브가 동작하는 데에는 문제가 없지만, 표준 HTML 어트리뷰트와 충돌하는 것을 방지하기 위해 셀렉터에는 접두사를 붙이는 것을 권장합니다.
이 방법은 서드파티 디렉티브의 셀렉터와 충돌하는 것을 막는 방법이기도 합니다.
CLI가 기본으로 붙이는 접두사는 `app`입니다.

<!--
Make sure you do **not** prefix the `highlight` directive name with **`ng`** because
that prefix is reserved for Angular and using it could cause bugs that are difficult to diagnose.
-->
이 때 접두사로 **`ng`**는 사용하지 마세요. 이 접두사는 Angular가 이미 사용하고 있기 때문에 `ng` 접두사를 사용하면 확인하기 어려운 버그를 발생시킬 수도 있습니다.

</div>

<!--
After the `@Directive` metadata comes the directive's controller class,
called `HighlightDirective`, which contains the (currently empty) logic for the directive.
Exporting `HighlightDirective` makes the directive accessible.
-->
`@Directive` 데코레이터 뒤에는 디렉티브의 컨트롤러 클래스가 위치하는데, 이 예제의 경우에는 `HighlightDirective`이며 디렉티브가 동작하는 로직을 이 클래스에 정의합니다.
그리고 이 디렉티브를 다른 파일에서 사용하기 위해 `export` 키워드를 사용해서 외부로 공개했습니다.

<!--
Now edit the generated `src/app/highlight.directive.ts` to look as follows:
-->
이제 `src/app/highlight.directive.ts` 코드를 다음과 같이 수정합니다:

<code-example path="attribute-directives/src/app/highlight.directive.1.ts" header="src/app/highlight.directive.ts"></code-example>

<!--
The `import` statement specifies an additional `ElementRef` symbol from the Angular `core` library:
-->
이 때 `ElementRef` 심볼을 의존성으로 주입받기 위해 `import` 키워드를 사용해서 Angular `core` 라이브러리를 불러왔습니다:

<!--
You use the `ElementRef` in the directive's constructor
to [inject](guide/dependency-injection) a reference to the host DOM element, 
the element to which you applied `appHighlight`.
-->
이 디렉티브는 디렉티브가 적용되는 DOM 엘리먼트를 참조하기 위해 `ElementRef`를 디렉티브 생성자로 [주입](guide/dependency-injection)받습니다.

<!--
`ElementRef` grants direct access to the host DOM element
through its `nativeElement` property.
-->
그리고 `ElementRef`의 `nativeElement` 프로퍼티를 참조하면 호스트 DOM 엘리먼트에 직접 접근할 수 있습니다.

<!--
This first implementation sets the background color of the host element to yellow.
-->
처음 작성하는 코드에서는 호스트 엘리먼트의 배경 색을 노란색으로 변경하도록 구현했습니다.

<!--
{@a apply-directive}
-->
{@a 디렉티브-적용하기}

<!--
## Apply the attribute directive
-->
## 어트리뷰트 디렉티브 적용하기

<!--
To use the new `HighlightDirective`, add a paragraph (`<p>`) element to the template of the root `AppComponent` and apply the directive as an attribute.
-->
이렇게 만든 `HighlightDirective`를 적용하려면 `AppComponent`의 템플릿에 문단(`<p>`) 엘리먼트를 추가하고 이 엘리먼트에 어트리뷰트를 다음과 같이 지정합니다.

<code-example path="attribute-directives/src/app/app.component.1.html" header="src/app/app.component.html" region="applied"></code-example>

<!--
Now run the application to see the `HighlightDirective` in action.
-->
그리고 애플리케이션을 실행하면 `HighlightDirective`가 동작하는 것을 확인할 수 있습니다.

<code-example language="sh" class="code-shell">
ng serve
</code-example>

<!--
To summarize, Angular found the `appHighlight` attribute on the **host** `<p>` element.
It created an instance of the `HighlightDirective` class and
injected a reference to the `<p>` element into the directive's constructor
which sets the `<p>` element's background style to yellow.
-->
애플리케이션이 실행되는 과정을 간단하게 설명하면, Angular는 **호스트 엘리먼트**인 `<p>` 태그에 `appHighlight` 어트리뷰트가 지정된 것을 확인하면 이 엘리먼트에 `HighlightDirective` 클래스의 인스턴스를 생성하는데, 이 때 호스트 엘리먼트 `<p>`의 배경색을 변경하기 위해 `ElementRef`를 의존성으로 주입합니다.

<!--
{@a respond-to-user}
-->
{@a 사용자-동작에-반응하기}

<!--
## Respond to user-initiated events
-->
## 사용자 동작에 반응하기

<!--
Currently, `appHighlight` simply sets an element color.
The directive could be more dynamic.
It could detect when the user mouses into or out of the element
and respond by setting or clearing the highlight color.
-->
지금까지 구현한 디렉티브는 엘리먼트의 배경색을 변경하는 간단한 로직만 작성했지만, 디렉티브의 동작은 좀 더 역동적이어야 합니다.
이 디렉티브는 사용자가 마우스를 엘리먼트 위에 올리는 것에 반응해서 배경색을 지정하고, 사용자가 마우스를 엘리먼트 밖으로 옮기면 지정된 배경색을 해제해야 하기 때문입니다.

<!--
Begin by adding `HostListener` to the list of imported symbols.
-->
이 동작을 구현하기 위해 `HostListener` 심볼을 로드합니다.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" header="src/app/highlight.directive.ts (imports)" region="imports"></code-example>

<!--
Then add two eventhandlers that respond when the mouse enters or leaves,
each adorned by the `HostListener` decorator.
-->
그리고 이렇게 불러온 `HostListener` 데코레이터를 사용해서 마우스가 들어오고 나가는 두 이벤트 핸들러를 추가합니다.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" header="src/app/highlight.directive.ts (mouse-methods)" region="mouse-methods"></code-example>

<!--
The `@HostListener` decorator lets you subscribe to events of the DOM
element that hosts an attribute directive, the `<p>` in this case.
-->
`@HostListener` 데코레이터를 사용하면 DOM 엘리먼트에서 발생하는 이벤트를 구독할 수 있습니다. 이 예제 코드의 경우에는 `<p>` 엘리먼트가 해당됩니다.

<div class="alert is-helpful">

<!--
Of course you could reach into the DOM with standard JavaScript and attach event listeners manually.
There are at least three problems with _that_ approach:
-->
표준 JavaScript를 사용해도 DOM 엘리먼트에 접근할 수 있고, 이벤트 리스너를 수동으로 적용할 수도 있습니다.
하지만 이 방식은 몇가지 문제가 있습니다:

<!--
1. You have to write the listeners correctly.
1. The code must *detach* the listener when the directive is destroyed to avoid memory leaks.
1. Talking to DOM API directly isn't a best practice.
-->
1. 이벤트 리스너 코드가 잘못 구현되면 동작하지 않습니다.
1. 디렉티브가 종료되면 메모리 누수를 방지하기 위해 이벤트 리스너도 반드시 *제거되어야* 합니다.
1. Angular를 사용하면서 DOM API를 직접 활용하는 것은 권장하지 않습니다.

</div>

<!--
The handlers delegate to a helper method that sets the color on the host DOM element, `el`.
-->
호스트 DOM 엘리먼트는 `el`이라는 이름으로 참조하고 `highlight` 메소드가 이 엘리먼트를 조작하도록 구현하겠습니다.

<!--
The helper method, `highlight`, was extracted from the constructor.
The revised constructor simply declares the injected `el: ElementRef`.
-->
이전에 생성자에서 구현했던 로직을 `highlight` 메소드로 옮겼습니다.
이제 생성자에는 `el: ElementRef`를 주입하기 위한 코드만 남아 있습니다.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" header="src/app/highlight.directive.ts (constructor)" region="ctor"></code-example>

<!--
Here's the updated directive in full:
-->
이렇게 수정한 디렉티브는 다음과 같습니다:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" header="src/app/highlight.directive.ts"></code-example>

<!--
Run the app and confirm that the background color appears when
the mouse hovers over the `p` and disappears as it moves out.
-->
이제 애플리케이션을 실행한 후에 마우스가 `<p>` 엘리먼트 위에 올라가면 배경색이 지정되고, 마우스를 밖으로 옮기면 배경색이 해제되는지 확인해 보세요.

<figure>
  <img src="generated/images/guide/attribute-directives/highlight-directive-anim.gif" alt="Second Highlight">
</figure>

<!--
{@a bindings}
-->
{@a 바인딩}

<!--
## Pass values into the directive with an _@Input_ data binding
-->
## 디렉티브에 데이터 전달하기 : _@Input_ 바인딩

<!--
Currently the highlight color is hard-coded _within_ the directive. That's inflexible.
In this section, you give the developer the power to set the highlight color while applying the directive.
-->
지금까지 작성한 코드는 배경색을 디렉티브 _안에_ 하드코딩 했습니다. 그래서 이 값은 고정되어 있습니다.
이번 예제에서는 이 배경색을 디렉티브 밖에서 지정하고 디렉티브에 어떻게 반영할 수 있는지 알아봅니다.

<!--
Begin by adding `Input` to the list of symbols imported from `@angular/core`.
-->
먼저, `@angular/core` 라이브러리에서 `Input` 심볼을 불러옵니다.
<code-example path="attribute-directives/src/app/highlight.directive.3.ts" linenums="false" header="src/app/highlight.directive.ts (imports)" region="imports"></code-example>

<!--
Add a `highlightColor` property to the directive class like this:
-->
그리고 디렉티브 클래스에 `highlightColor` 프로퍼티를 다음과 같이 추가합니다:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" header="src/app/highlight.directive.ts (highlightColor)" region="color"></code-example>

<!--
{@a input}
-->
{@a 입력-프로퍼티}

<!--
### Binding to an _@Input_ property
-->
### _@Input_ 프로퍼티 바인딩

<!--
Notice the `@Input` decorator. It adds metadata to the class that makes the directive's `highlightColor` property available for binding.
-->
`@Input` 데코레이터를 확인해 보세요. 이 데코레이터는 컴포넌트 클래스에 선언된 `highlightColor` 프로퍼티로 데이터를 입력받을 수 있도록 합니다.

<!--
It's called an *input* property because data flows from the binding expression _into_ the directive.
Without that input metadata, Angular rejects the binding; see [below](guide/attribute-directives#why-input "Why add @Input?") for more about that.
-->
그래서 디렉티브 _밖에서_ 데이터를 받아 오는 프로퍼티를 *입력* 프로퍼티라고 합니다.
이 데코레이터가 없으면 바인딩이 연결되지 않으며, 더 자세한 내용은 [아래 내용](guide/attribute-directives#왜-input "왜 @input을 사용할까?")을 참고하세요.

<!--
Try it by adding the following directive binding variations to the `AppComponent` template:
-->
`AppComponent` 템플릿은 이 디렉티브를 적용딩하기 위해 다음과 같이 작성합니다:

<code-example path="attribute-directives/src/app/app.component.1.html" linenums="false" header="src/app/app.component.html (excerpt)" region="color-1"></code-example>

<!--
Add a `color` property to the `AppComponent`.
-->
그리고 `AppComponent`에 `color` 프로퍼티를 추가합니다.

<code-example path="attribute-directives/src/app/app.component.1.ts" linenums="false" header="src/app/app.component.ts (class)" region="class"></code-example>

<!--
Let it control the highlight color with a property binding.
-->
그러면 디렉티브에 적용되는 배경색을 프로퍼티 바인딩으로 연결할 수 있습니다.

<code-example path="attribute-directives/src/app/app.component.1.html" linenums="false" header="src/app/app.component.html (excerpt)" region="color-2"></code-example>

<!--
That's good, but it would be nice to _simultaneously_ apply the directive and set the color _in the same attribute_ like this.
-->
이렇게만 작성해도 동작은 되지만, 어트리뷰트 디렉티브를 적용하면서 _이 디렉티브 이름으로_ 배경색도 _함께_ 지정하는 것이 더 좋습니다.

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html (color)" region="color"></code-example>

<!--
The `[appHighlight]` attribute binding both applies the highlighting directive to the `<p>` element
and sets the directive's highlight color with a property binding.
You're re-using the directive's attribute selector (`[appHighlight]`) to do both jobs.
That's a crisp, compact syntax.
-->
`[appHighlight]` 처럼 어트리뷰트 바인딩하면 배경색을 지정하는 디렉티브를 `<p>` 엘리먼트에 적용하면서 이 디렉티브에 적용될 배경색도 함께 프로퍼티 바인딩합니다.
번거롭게 디렉티브와 입력 프로퍼티를 따로 지정할 필요가 없습니다.

<!--
You'll have to rename the directive's `highlightColor` property to `appHighlight` because that's now the color property binding name.
-->
이렇게 사용하려면 바인딩하는 프로퍼티 이름이 바뀌기 때문에 디렉티브에 선언된 `highlightColor` 프로퍼티를 `appHighlight`로 바꿔줘야 합니다.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" header="src/app/highlight.directive.ts (renamed to match directive selector)" region="color-2"></code-example>

<!--
This is disagreeable. The word, `appHighlight`, is a terrible property name and it doesn't convey the property's intent.
-->
하지만 `appHighlight`라는 이름으로 프로퍼티를 선언하는 것은 별로 좋은 방법이 아닙니다. 좀 더 좋은 방법을 찾아봅시다.

<!--
{@a input-alias}
-->
{@a 입력-별칭}

<!--
### Bind to an _@Input_ alias
-->
### _@Input_ 에 다른 이름 지정하기

<!--
Fortunately you can name the directive property whatever you want _and_ **_alias it_** for binding purposes.
-->
다행히도, 입력 프로퍼티 이름은 그대로 두고 이 프로퍼티에 **_다른 이름_**을 지정할 수 있습니다.

<!--
Restore the original property name and specify the selector as the alias in the argument to `@Input`.
-->
새로운 이름은 `@Input` 데코레이터 안에 문자열로 지정합니다.

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" header="src/app/highlight.directive.ts (color property with alias)" region="color"></code-example>

<!--
_Inside_ the directive the property is known as `highlightColor`.
_Outside_ the directive, where you bind to it, it's known as `appHighlight`.
-->
이렇게 작성하면 디렉티브 _안에서는_ `highlightColor` 프로퍼티를 사용합니다.
그리고 디렉티브 _밖에서는_ `appHighlight` 프로퍼티로 입력 프로퍼티를 바인딩할 수 있습니다.

<!--
You get the best of both worlds: the property name you want and the binding syntax you want:
-->
디렉티브 안과 밖, 각 상황에 어울리는 프로퍼티 이름을 사용해 보세요:

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html (color)" region="color"></code-example>

<!--
Now that you're binding via the alias to the `highlightColor`, modify the `onMouseEnter()` method to use that property.
If someone neglects to bind to `appHighlightColor`, highlight the host element in red:
-->
이제 디렉티브 안에서는 `highlightColor` 프로퍼티를 사용하기 때문에 `onMouseEvent()` 메소드가 이 프로퍼티를 사용하도록 수정합니다.
`appHighlightColor`에 바인딩 하는 값이 없으면 빨간색을 기본값으로 지정하도록 작성했습니다:

<code-example path="attribute-directives/src/app/highlight.directive.3.ts" linenums="false" header="src/app/highlight.directive.ts (mouse enter)" region="mouse-enter"></code-example>

<!--
Here's the latest version of the directive class.
-->
이렇게 만든 디렉티브 클래스의 최종 코드는 다음과 같습니다.

<code-example path="attribute-directives/src/app/highlight.directive.3.ts" linenums="false" header="src/app/highlight.directive.ts (excerpt)"></code-example>

<!--
## Write a harness to try it
-->
## _@Input_ 바인딩 응용하기

<!--
It may be difficult to imagine how this directive actually works.
In this section, you'll turn `AppComponent` into a harness that
lets you pick the highlight color with a radio button and bind your color choice to the directive.
-->
디렉티브가 어떻게 동작하는지 설명만으로는 이해하기 어려울 수 있습니다.
그래서 이번 문서에서는 `AppComponent`에서 라디오 버튼으로 배경을 선택하고, 이렇게 선택한 색상을 디렉티브에 받아 배경색으로 지정하도록 구현해 봅시다.

<!--
Update <code>app.component.html</code> as follows:
-->
`app.component.html` 파일을 다음과 같이 수정합니다:

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html (v2)" region="v2"></code-example>

<!--
Revise the `AppComponent.color` so that it has no initial value.
-->
그리고 초기값 할당 없이 `AppComponent.color` 프로퍼티를 선언합니다.

<code-example path="attribute-directives/src/app/app.component.ts" linenums="false" header="src/app/app.component.ts (class)" region="class"></code-example>

<!--
Here are the harness and directive in action.
-->
이렇게 구현하면 애플리케이션은 다음과 같이 동작합니다.

<figure>
  <img src="generated/images/guide/attribute-directives/highlight-directive-v2-anim.gif" alt="Highlight v.2">
</figure>

<!--
{@a second-property}
-->
{@a 입력-프로퍼티-추가하기}

<!--
## Bind to a second property
-->
## 입력 프로퍼티 추가하기

<!--
This highlight directive has a single customizable property. In a real app, it may need more.
-->
지금까지 만든 하이라이트 디렉티브에는 프로퍼티가 하나 있습니다. 하지만 애플리케이션을 실제로 개발하다보면 여러 입력 프로퍼티가 활용하는 경우가 더 많습니다.

<!--
At the moment, the default color&mdash;the color that prevails until
the user picks a highlight color&mdash;is hard-coded as "red".
Let the template developer set the default color.
-->
사용자가 하이라이트 색상을 정하기 전에는 빨간색을 기본 배경으로 사용하도록 하드코딩 해봅시다.
그리고 이 기본 배경색도 템플릿에서 지정할 수 있도록 만들어 봅시다.

<!--
Add a second **input** property to `HighlightDirective` called `defaultColor`:
-->
`HighlightDirective`에 `defaultColor` 프로퍼티를 **입력** 프로퍼티로 추가합니다:

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" header="src/app/highlight.directive.ts (defaultColor)" region="defaultColor"></code-example>

<!--
Revise the directive's `onMouseEnter` so that it first tries to highlight with the `highlightColor`,
then with the `defaultColor`, and falls back to "red" if both properties are undefined.
-->
그리고 디렉티브에 선언한 `onMouseEnter()` 메소드를 수정하는데, `highlightColor` 프로퍼티에 색상이 지정되면 이 값을 사용하고, 아니라면 `defaultColor` 프로퍼티를 사용하도록 합니다. 두 프로퍼티 모두 지정되지 않으면 빨간색을 기본값으로 사용하도록 작성합니다.

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" header="src/app/highlight.directive.ts (mouse-enter)" region="mouse-enter"></code-example>

<!--
How do you bind to a second property when you're already binding to the `appHighlight` attribute name?
-->
`appHighlight` 어트리뷰트 이름을 그대로 사용하면서 추가 프로퍼티는 어떻게 바인딩할 수 있을까요?

<!--
As with components, you can add as many directive property bindings as you need by stringing them along in the template.
The developer should be able to write the following template HTML to both bind to the `AppComponent.color`
and fall back to "violet" as the default color.
-->
컴포넌트와 마찬가지로, 디렉티브도 템플릿에서 원하는 만큼 프로퍼티 바인딩을 연결할 수 있습니다.
예를 들어 `AppComponent.color`를 지금까지와 마찬가지로 지정하면서 기본 배경색은 "violet"으로 지정하도록 하려면 다음과 같이 작성할 수 있습니다.

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html (defaultColor)" region="defaultColor"></code-example>

<!--
Angular knows that the `defaultColor` binding belongs to the `HighlightDirective`
because you made it _public_ with the `@Input` decorator.
-->
그러면 `HighlightDirective`는 Angular가 `defaultColor` 프로퍼티를 찾아서 바인딩 하는데, 이미 이 프로퍼티에 `@Input` 데코레이터를 사용하면서 _public_ 으로 지정했기 때문입니다.

<!--
Here's how the harness should work when you're done coding.
-->
이렇게 작성하면 이제 애플리케이션은 다음 그림과 같이 동작합니다.

<figure>
  <img src="generated/images/guide/attribute-directives/highlight-directive-final-anim.gif" alt="Final Highlight">
</figure>

<!--
## Summary
-->
## 정리

<!--
This page covered how to:
-->
이 문서에서는 다음과 같은 내용을 다뤘습니다:

<!--
* [Build an **attribute directive**](guide/attribute-directives#write-directive) that modifies the behavior of an element.
* [Apply the directive](guide/attribute-directives#apply-directive) to an element in a template.
* [Respond to **events**](guide/attribute-directives#respond-to-user) that change the directive's behavior.
* [**Bind** values to the directive](guide/attribute-directives#bindings).
-->
* 엘리먼트의 동작을 변경하는 [**어트리뷰트 디렉티브**](guide/attribute-directives#디렉티브-코드-작성하기)를 만들어 봤습니다.
* 이렇게 만든 [디렉티브](guide/attribute-directives#디렉티브-적용하기)를 템플릿에 있는 엘리먼트에 적용해 봤습니다.
* 디렉티브의 추가 동작을 구현하기 위해 [**이벤트**에 반응하는 방법](guide/attribute-directives#사용자-동작에-반응하기)을 알아봤습니다.
* [디렉티브에 프로퍼티를 **바인딩**](guide/attribute-directives#바인딩)하는 방법에 대해 알아봤습니다.

<!--
The final source code follows:
-->
그리고 이렇게 만든 최종 코드는 다음과 같습니다:

<code-tabs>
  <code-pane header="app/app.component.ts" path="attribute-directives/src/app/app.component.ts"></code-pane>
  <code-pane header="app/app.component.html" path="attribute-directives/src/app/app.component.html"></code-pane>
  <code-pane header="app/highlight.directive.ts" path="attribute-directives/src/app/highlight.directive.ts"></code-pane>
  <code-pane header="app/app.module.ts" path="attribute-directives/src/app/app.module.ts"></code-pane>
  <code-pane header="main.ts" path="attribute-directives/src/main.ts"></code-pane>
  <code-pane header="index.html" path="attribute-directives/src/index.html"></code-pane>
</code-tabs>


<!--
You can also experience and download the <live-example title="Attribute Directive example"></live-example>.
-->
이 코드는 <live-example title="Attribute Directive example"></live-example>에서 직접 실행해보거나 다운받아서 확인할 수도 있습니다.

<!--
{@a why-input}
-->
{@a 왜-input}

<!--
### Appendix: Why add _@Input_?
-->
### 부록: 왜 _@Input_ 가 필요할까?

<!--
In this demo, the `highlightColor` property is an ***input*** property of
the `HighlightDirective`. You've seen it applied without an alias:
-->
이번 예제에서 `highlightColor` 프로퍼티는 `HighlightDirective`의 ***입력*** 프로퍼티입니다.
입력 프로퍼티 이름을 별도로 지정하지 않는 경우라면 다음과 같이 사용했습니다:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" header="src/app/highlight.directive.ts (color)" region="color"></code-example>

<!--
You've seen it with an alias:
-->
그리고 다른 이름을 지정하는 경우는 다음과 같이 사용했습니다:

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" header="src/app/highlight.directive.ts (color)" region="color"></code-example>

<!--
Either way, the `@Input` decorator tells Angular that this property is
_public_ and available for binding by a parent component.
Without  `@Input`, Angular refuses to bind to the property.
-->
`@Input` 데코레이터를 사용하면 Angular는 이 프로퍼티를 _public_ 으로 지정하면서 부모 컴포넌트와 바인딩할 준비를 합니다.
그래서 `@Input` 데코레이터가 없으면 프로퍼티 바인딩 자체가 성립하지 않습니다.

<!--
You've bound template HTML to component properties before and never used `@Input`.
What's different?
-->
그런데 컴포넌트의 템플릿 HTML에서 해당 컴포넌트의 프로퍼티를 바인딩 할 때는 `@Input` 데코레이터를 사용하지 않았습니다.
어떤 점이 다를까요?

<!--
The difference is a matter of trust.
Angular treats a component's template as _belonging_ to the component.
The component and its template trust each other implicitly.
Therefore, the component's own template may bind to _any_ property of that component,
with or without the `@Input` decorator.
-->
이것은 Angular가 컴포넌트를 어떻게 취급하는지의 문제입니다.
Angular는 컴포넌트 템플릿을 컴포넌트에 _속하는_ 것으로 취급합니다.
그래서 컴포넌트와 템플릿은 각각 존재하지만 서로를 보장합니다.
그래서 컴포넌트의 템플릿에서는 `@Input` 데코레이터를 사용하는 지 여부에 관계없이 컴포넌트의 프로퍼티를 _자유롭게_ 바인딩 할 수 있습니다.

<!--
But a component or directive shouldn't blindly trust _other_ components and directives.
The properties of a component or directive are hidden from binding by default.
They are _private_ from an Angular binding perspective.
When adorned with the `@Input` decorator, the property becomes _public_ from an Angular binding perspective.
Only then can it be bound by some other component or directive.
-->
하지만 _다른_ 컴포넌트나 디렉티브라면 문제가 다릅니다.
컴포넌트의 프로퍼티나 디렉티브는 기본적으로 감춰져 있으며, Angular가 바인딩하는 관점에서도 이 프로퍼티는 _private_ 으로 취급됩니다.
그래서 프로퍼티를 바인딩하려면 `@Input` 데코레이터를 붙여서 _public_ 으로 만들어야 합니다.
다른 컴포넌트와 디렉티브와 프로퍼티 바인딩하려면 이 데코레이터를 꼭 사용해야 합니다.

<!--
You can tell if `@Input` is needed by the position of the property name in a binding.
-->
어떤 경우에 `@Input` 데코레이터가 꼭 사용되어야 하는 경우가 알아봅시다.

<!--
* When it appears in the template expression to the ***right*** of the equals (=),
  it belongs to the template's component and does not require the `@Input` decorator.
-->
* 템플릿에서 등호(`=`) ***오른쪽***에 템플릿 표현식이 있으면 이 평가식에 연결되는 프로퍼티는 해당 컴포넌트 안에 있으며 `@Input` 데코레이터가 필요하지 않습니다.

<!--
* When it appears in **square brackets** ([ ]) to the **left** of the equals (=),
  the property belongs to some _other_ component or directive;
  that property must be adorned with the `@Input` decorator.
-->
* 템플릿에서 등호(`=`) 왼쪽에 **대괄호(`[`, `]`)**가 있으면 이 대괄호 안에 있는 프로퍼티는 _다른_ 컴포넌트나 디렉티브에 선언된 프로퍼티입니다. 이 프로퍼티에는 `@Input` 데코레이터가 꼭 지정되어야 합니다.

<!--
Now apply that reasoning to the following example:
-->
예제를 보면서 이 내용을 확인해 봅시다:

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html (color)" region="color"></code-example>

<!--
* The `color` property in the expression on the right belongs to the template's component.
  The template and its component trust each other.
  The `color` property doesn't require the `@Input` decorator.
-->
* 표현식에서 등호 오른쪽에 사용된 `color` 프로퍼티는 이 컴포넌트에 있는 프로퍼티입니다. 템플릿과 컴포넌트는 서로를 보장하기 때문에 `@Input` 데코레이터가 필요하지 않습니다.

<!--
* The `appHighlight` property on the left refers to an _aliased_ property of the `HighlightDirective`,
  not a property of the template's component. There are trust issues.
  Therefore, the directive property must carry the `@Input` decorator.
-->
* 등호 왼쪽에 사용된 `appHighlight` 프로퍼티는 `HighlightDirective`에 _다른 이름으로 지정된_ 프로퍼티를 가리키며, 이 템플릿의 컴포넌트 클래스에 있는 프로퍼티는 아닙니다. 그래서 이 프로퍼티를 바인딩하려면 `@Input` 데코레이터를 꼭 사용해야 합니다.
