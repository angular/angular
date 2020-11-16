<!--
# Built-in directives
-->
# 기본 디렉티브

<!--
Angular offers two kinds of built-in directives: [_attribute_ directives](guide/attribute-directives) and [_structural_ directives](guide/structural-directives).

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

For more detail, including how to build your own custom directives, see [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives).
-->
Angular가 제공하는 디렉티브는 크게 [_어트리뷰트_ 디렉티브(attribute directive)](guide/attribute-directives)와 [_구조_ 디렉티브(structural directive)](guide/structural-directives)로 구분할 수 있습니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

커스텀 디렉티브를 만드는 방법 등 디렉티브를 다양하게 활용하는 방법 등에 대해 알아보려면 [어트리뷰트 디렉티브](guide/attribute-directives) 문서와 [구조 디렉티브](guide/structural-directives) 문서를 참고하세요.

<hr/>


{@a attribute-directives}

<!--
## Built-in attribute directives
-->
## 기본 어트리뷰트 디렉티브

<!--
Attribute directives listen to and modify the behavior of
other HTML elements, attributes, properties, and components.
You usually apply them to elements as if they were HTML attributes, hence the name.

Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation")
and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
The most common attribute directives are as follows:

* [`NgClass`](guide/built-in-directives#ngClass)&mdash;adds and removes a set of CSS classes.
* [`NgStyle`](guide/built-in-directives#ngStyle)&mdash;adds and removes a set of HTML styles.
* [`NgModel`](guide/built-in-directives#ngModel)&mdash;adds two-way data binding to an HTML form element.
-->
어트리뷰트 디렉티브는 HTML 엘리먼트, 어트리뷰트, 프로퍼티, 컴포넌트에서 일어나는 일을 감지하거나 동작 방식을 조작합니다.
사용하는 방법은 일반 HTML 어트리뷰트와 비슷합니다.

[`RouterModule`](guide/router "Routing and Navigation")이나 [`FormsModule`](guide/forms "Forms")같이 NgModule이 어트리뷰트 디렉티브를 제공하는 경우가 많습니다.
이중에서 자주 사용하는 어트리뷰트 디렉티브는 이런 것들이 있습니다:

* [`NgClass`](guide/built-in-directives#ngClass) &mdash; CSS 클래스를 추가하거나 제거합니다.
* [`NgStyle`](guide/built-in-directives#ngStyle) &mdash; HTML 스타일을 추가하거나 제거합니다.
* [`NgModel`](guide/built-in-directives#ngModel) &mdash; HTML 폼 엘리먼트에 양방향 데이터 바인딩 기능을 추가합니다.


<hr/>

{@a ngClass}

## `NgClass`

<!--
Add or remove several CSS classes simultaneously with `ngClass`.

<code-example path="built-in-directives/src/app/app.component.html" region="special-div" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

To add or remove a *single* class, use [class binding](guide/attribute-binding#class-binding) rather than `NgClass`.

</div>

Consider a `setCurrentClasses()` component method that sets a component property,
`currentClasses`, with an object that adds or removes three classes based on the
`true`/`false` state of three other component properties. Each key of the object is a CSS class name; its value is `true` if the class should be added,
`false` if it should be removed.

<code-example path="built-in-directives/src/app/app.component.ts" region="setClasses" header="src/app/app.component.ts"></code-example>

Adding an `ngClass` property binding to `currentClasses` sets the element's classes accordingly:

<code-example path="built-in-directives/src/app/app.component.html" region="NgClass-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

Remember that in this situation you'd call `setCurrentClasses()`,
both initially and when the dependent properties change.

</div>
-->
`NgClass`를 사용하면 CSS 클래스를 한번에 여러개 추가하거나 제거할 수 있습니다.

<code-example path="built-in-directives/src/app/app.component.html" region="special-div" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

CSS 클래스 *하나를* 추가하거나 제거하려면 `ngClass`보다 [클래스 바인딩(class binding)](guide/attribute-binding#class-binding)을 사용하는 것이 더 좋습니다.

</div>

`setCurrentClasses()` 컴포넌트 메서드는 컴포넌트 프로퍼티 `currentClasses`를 조작하는데, 이 프로퍼티는 다른 컴포넌트 프로퍼티의 상태에 따라 객체 형태로 클래스를 추가하거나 제거하는 프로퍼티입니다.
이 프로퍼티는 객체 형식이며, 객체 키는 각각 CSS 클래스 이름으로 구성되는데, 개별 클래스에 해당하는 값이 `true`이면 해당 클래스가 추가되고 `false`이면 해당 클래스가 제거됩니다.

<code-example path="built-in-directives/src/app/app.component.ts" region="setClasses" header="src/app/app.component.ts"></code-example>

`currentClasses` 프로퍼티를 다음과 같이 `ngClass`로 프로퍼티 바인딩하면 엘리먼트의 CSS 클래스를 조작할 수 있습니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgClass-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

이 코드처럼 구현하면 컴포넌트를 초기화 한 후에 한 번, 관련된 프로퍼티 값이 변경될 때마다 `setCurrentClasses()` 함수를 직접 실행해야 새로운 클래스가 반영됩니다.

</div>


<hr/>

{@a ngStyle}

## `NgStyle`

<!--
Use `NgStyle` to set many inline styles simultaneously and dynamically, based on the state of the component.
-->
`NgStyle`를 사용하면 인라인 스타일을 한번에 여러개 추가하거나 제거할 수 있습니다.


<!--
### Without `NgStyle`
-->
### `NgStyle`을 사용하지 않은 경우

<!--
For context, consider setting a *single* style value with [style binding](guide/attribute-binding#style-binding), without `NgStyle`.

<code-example path="built-in-directives/src/app/app.component.html" region="without-ng-style" header="src/app/app.component.html"></code-example>

However, to set *many* inline styles at the same time, use the `NgStyle` directive.

The following is a `setCurrentStyles()` method that sets a component
property, `currentStyles`, with an object that defines three styles,
based on the state of three other component properties:

<code-example path="built-in-directives/src/app/app.component.ts" region="setStyles" header="src/app/app.component.ts"></code-example>

Adding an `ngStyle` property binding to `currentStyles` sets the element's styles accordingly:

<code-example path="built-in-directives/src/app/app.component.html" region="NgStyle-2" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

Remember to call `setCurrentStyles()`, both initially and when the dependent properties change.

</div>
-->
스타일 *하나를* 조작한다면 `NgStyle`보다 [스타일 바인딩(style binding)](guide/attribute-binding#style-binding)을 사용하는 것이 더 좋습니다.

<code-example path="built-in-directives/src/app/app.component.html" region="without-ng-style" header="src/app/app.component.html"></code-example>

`NgStyle` 디렉티브는 인라인 스타일 *여러개를* 동시에 조작할 때 사용합니다.

아래 코드에서 `setCurrentStyles()` 메서드는 컴포넌트 프로퍼티 값에 따라 `currentStyles` 프로퍼티를 구성하는데, 이 프로퍼티는 객체 형태이며 관련된 컴포넌트 프로퍼티에 따라 3가지 스타일을 지정합니다:

<code-example path="built-in-directives/src/app/app.component.ts" region="setStyles" header="src/app/app.component.ts"></code-example>

`currentStyles`를 다음과 같이 `ngStyle`로 프로퍼티 바인딩하면 엘리먼트의 스타일을 조작할 수 있습니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgStyle-2" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

이 경우에도 컴포넌트를 초기화 한 후에 한 번, 관련된 프로퍼티 값이 변경될 때마다 `setCurrentStyles()` 함수를 직접 실행해야 새로운 스타일이 적용됩니다.

</div>


<hr/>

{@a ngModel}

<!--
## `[(ngModel)]`: Two-way binding
-->
## `[(ngModel)]`: 양방향 바인딩

<!--
The `NgModel` directive allows you to display a data property and
update that property when the user makes changes. Here's an example:

<code-example path="built-in-directives/src/app/app.component.html" header="src/app/app.component.html (NgModel example)" region="NgModel-1"></code-example>
-->
`NgModel` 디렉티브를 사용하면 화면에 데이터 프로퍼티 값을 표시하면서 이 프로퍼티 값이 변경되는 것을 감지할 수 있습니다.
예제를 봅시다:

<code-example path="built-in-directives/src/app/app.component.html" header="src/app/app.component.html (NgModel 예제)" region="NgModel-1"></code-example>


<!--
### Import `FormsModule` to use `ngModel`
-->
### `FormsModule` 로드하기

<!--
Before using the `ngModel` directive in a two-way data binding,
you must import the `FormsModule` and add it to the NgModule's `imports` list.
Learn more about the `FormsModule` and `ngModel` in [Forms](guide/forms#ngModel).

Remember to import the `FormsModule` to make `[(ngModel)]` available as follows:

<code-example path="built-in-directives/src/app/app.module.ts" header="src/app/app.module.ts (FormsModule import)" region="import-forms-module"></code-example>


You could achieve the same result with separate bindings to
the `<input>` element's  `value` property and `input` event:

<code-example path="built-in-directives/src/app/app.component.html" region="without-NgModel" header="src/app/app.component.html"></code-example>

To streamline the syntax, the `ngModel` directive hides the details behind its own `ngModel` input and `ngModelChange` output properties:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModelChange" header="src/app/app.component.html"></code-example>

The `ngModel` data property sets the element's value property and the `ngModelChange` event property
listens for changes to the element's value.
-->
`ngModel` 디렉티브를 사용해서 양방향으로 데이터를 바인딩하려면 먼저 `FormsModule`을 로드하고 이 모듈을 NgModule `imports` 배열에 추가해야 합니다.
`FormsModule`과 `ngModel`에 대해 자세하게 알아보려면 [폼](guide/forms#ngModel) 문서를 참고하세요.

`FormsModule`은 이렇게 불러와서 등록하면 됩니다:

<code-example path="built-in-directives/src/app/app.module.ts" header="src/app/app.module.ts (FormsModule 로드하기)" region="import-forms-module"></code-example>

`<input>` 엘리먼트의 `value` 프로퍼티와 `input` 이벤트를 각각 바인딩하면 `ngModel`을 사용한 것과 같은 효과를 낼 수 있습니다:

<code-example path="built-in-directives/src/app/app.component.html" region="without-NgModel" header="src/app/app.component.html"></code-example>

`ngModel` 디렉티브는 사실 `ngModel` 입력 프로퍼티와 `ngModelChange` 출력 프로퍼티를 선언하는 디렉티브입니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModelChange" header="src/app/app.component.html"></code-example>

`ngModel` 데이터 프로퍼티는 엘리먼트에 값을 할당하며, `ngModelChange` 이벤트 프로퍼티는 엘리먼트의 값이 변경되는 것을 감지합니다.


<!--
### `NgModel` and value accessors
-->
### `NgModel`과 값 접근자

<!--
The details are specific to each kind of element and therefore the `NgModel` directive only works for an element
supported by a [ControlValueAccessor](api/forms/ControlValueAccessor)
that adapts an element to this protocol.
Angular provides *value accessors* for all of the basic HTML form elements and the
[Forms](guide/forms) guide shows how to bind to them.

You can't apply `[(ngModel)]` to a non-form native element or a
third-party custom component until you write a suitable value accessor. For more information, see
the API documentation on [DefaultValueAccessor](api/forms/DefaultValueAccessor).

You don't need a value accessor for an Angular component that
you write because you can name the value and event properties
to suit Angular's basic [two-way binding syntax](guide/two-way-binding)
and skip `NgModel` altogether.
The `sizer` in the
[Two-way Binding](guide/two-way-binding) section is an example of this technique.

Separate `ngModel` bindings are an improvement over binding to the
element's native properties, but you can streamline the binding with a
single declaration using the `[(ngModel)]` syntax:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModel-1" header="src/app/app.component.html"></code-example>

This `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more, you can write the expanded form;
for example, the following changes the `<input>` value to uppercase:

<code-example path="built-in-directives/src/app/app.component.html" region="uppercase" header="src/app/app.component.html"></code-example>

Here are all variations in action, including the uppercase version:

<div class="lightbox">
  <img src='generated/images/guide/built-in-directives/ng-model-anim.gif' alt="NgModel variations">
</div>
-->
`NgModel` 디렉티브는 어떤 엘리먼트에 적용되는지에 따라 동작하는 방식이 다르며, 이 동작 방식은 [ControlValueAccessor](api/forms/ControlValueAccessor)에 따라 정의되기 때문에 `NgModel` 디렉티브는 ControlValueAccessor가 정의된 엘리먼트에만 사용할 수 있습니다.
Angular는 모든 표준 HTML 폼 엘리먼트에 대해 *값 접근자(value accessor)*를 제공합니다.
자세한 내용은 [폼](guide/forms) 문서를 참고하세요.

따라서 폼 엘리먼트가 아닌 기본 엘리먼트에는 `[(ngModel)]` 문법을 사용할 수 없으며, 값 접근자를 제공하지 않는 서드 파티 커스텀 컴포넌트에도 이 문법을 사용할 수 없습니다.
자세한 내용은 [DefaultValueAccessor](api/forms/DefaultValueAccessor) 문서를 참고하세요.

하지만 직접 만든 Angular 컴포넌트에는 값 접근자가 필요 없습니다.
왜냐하면 Angular가 정한 방식으로 입출력 프로퍼티를 선언하면 `NgModel` 디렉티브 없이도 [양방향 바인딩 문법](guide/two-way-binding)을 사용할 수 있기 때문입니다.
[양방향 바인딩](guide/two-way-binding) 문서에서는 `sizer` 프로퍼티로 이 개념을 확인해 봤습니다.

`[(ngModel)]` 문법을 활용하면 두가지 기능을 하는 바인딩 문법을 한 번에 작성할 수 있습니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModel-1" header="src/app/app.component.html"></code-example>

`[(ngModel)]` 문법은 바인딩된 데이터 프로퍼티 값을 _할당_ 하기만 합니다.
바인딩된 프로퍼티 값이 변경되는 것을 감지하는 로직을 작성하려면 다음과 같이 나눠서 작성해야 합니다.
아래 코드는 `<input>`에 입력된 값을 대문자로 변경하는 예제 코드입니다:

<code-example path="built-in-directives/src/app/app.component.html" region="uppercase" header="src/app/app.component.html"></code-example>

`ngModel`는 이런 방식으로 다양하게 활용할 수 있습니다:

<div class="lightbox">
  <img src='generated/images/guide/built-in-directives/ng-model-anim.gif' alt="NgModel variations">
</div>


<hr/>

{@a structural-directives}

<!--
## Built-in _structural_ directives
-->
## 기본 _구조_ 디렉티브

<!--
Structural directives are responsible for HTML layout.
They shape or reshape the DOM's structure, typically by adding, removing, and manipulating
the host elements to which they are attached.

This section is an introduction to the common built-in structural directives:

* [`NgIf`](guide/built-in-directives#ngIf)&mdash;conditionally creates or destroys subviews from the template.
* [`NgFor`](guide/built-in-directives#ngFor)&mdash;repeat a node for each item in a list.
* [`NgSwitch`](guide/built-in-directives#ngSwitch)&mdash;a set of directives that switch among alternative views.

<div class="alert is-helpful">

The deep details of structural directives are covered in the
[Structural Directives](guide/structural-directives) guide,
which explains the following:

* Why you
[prefix the directive name with an asterisk (\*)](guide/structural-directives#the-asterisk--prefix).
* Using [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* How to write your own structural directive.
* Why you [can only apply one structural directive](guide/structural-directives#one-per-element "one per host element") to an element.

</div>
-->
구조 디렉티브는 디렉티브가 적용된 호스트 엘리먼트에 DOM 구조를 추가하거나 제거하고, 변형하는 방식으로 HTML 레이아웃을 조작합니다.

이번 섹션에서는 기본 구조 디렉티브 중 이런 것들에 대해 알아봅시다:

* [`NgIf`](guide/built-in-directives#ngIf) &mdash; 조건에 따라 템플릿 조각을 DOM에 추가하거나 제거합니다.
* [`NgFor`](guide/built-in-directives#ngFor) &mdash; 배열 항목마다 템플릿 조각을 DOM에 추가합니다.
* [`NgSwitch`](guide/built-in-directives#ngSwitch) &mdash; 조건에 맞는 템플릿 조각을 선택해서 DOM에 추가합니다.

<div class="alert is-helpful">

구조 디렉티브에 대해서는 [구조 디렉티브](guide/structural-directives) 문서에서 자세하게 다룹니다:

* [디렉티브 이름 앞에 왜 접두사 (`*`)](guide/structural-directives#the-asterisk--prefix)가 붙는지
* 엘리먼트 묶음을 관리하기 위해 [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")를 사용하는 방법
* 커스텀 구조 디렉티브를 정의하는 방법
* 엘리먼트에는 [구조 디렉티브를 딱 하나만](guide/structural-directives#one-per-element "one per host element") 정의할 수 있습니다.

</div>


<hr/>

{@a ngIf}

## NgIf

<!--
You can add or remove an element from the DOM by applying an `NgIf` directive to
a host element.
Bind the directive to a condition expression like `isActive` in this example.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

Don't forget the asterisk (`*`) in front of `ngIf`. For more information
on the asterisk, see the [asterisk (*) prefix](guide/structural-directives#the-asterisk--prefix) section of
[Structural Directives](guide/structural-directives).

</div>

When the `isActive` expression returns a truthy value, `NgIf` adds the
`ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent`
from the DOM, destroying that component and all of its sub-components.
-->
호스트 엘리먼트에 `NgIf` 디렉티브를 적용하면 조건에 따라 해당 엘리먼트를 DOM에 추가하거나 제거할 수 있습니다.
`isActive` 프로퍼티와 바인딩하면 이렇습니다:

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

`ngIf` 앞에 별표(asterisk, `*`)가 붙는다는 것을 잊지 마세요.
자세한 내용은 [구조 디렉티브](guide/structural-directives) 섹션의 [별표 (`*`) 접두사](guide/structural-directives#the-asterisk--prefix) 섹션을 참고하세요.

</div>

`isActive` 표현식이 참으로 평가되면 `NgIf` 디렉티브가 `ItemDetailComponent`를 DOM에 추가합니다.
그리고 `isActive` 표현식이 거짓으로 평가되면 `NgIf` 디렉티브가 `ItemDetailComponent`를 DOM에서 제거하며, 이 컴포넌트와 자식 컴포넌트를 모두 종료합니다.


<!--
### Show/hide vs. `NgIf`
-->
### 보이기/감추기 vs. `NgIf`

<!--
Hiding an element is different from removing it with `NgIf`.
For comparison, the following example shows how to control
the visibility of an element with a
[class](guide/attribute-binding#class-binding) or [style](guide/attribute-binding#style-binding) binding.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-3" header="src/app/app.component.html"></code-example>

When you hide an element, that element and all of its descendants remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance
unnecessarily.

`NgIf` works differently. When `NgIf` is `false`, Angular removes the element and its descendants from the DOM.
It destroys their components, freeing up resources, which
results in a better user experience.

If you are hiding large component trees, consider `NgIf` as a more
efficient alternative to showing/hiding.

<div class="alert is-helpful">

For more information on `NgIf` and `ngIfElse`, see the [API documentation about NgIf](api/common/NgIf).

</div>
-->
엘리먼트를 화면에 감추는 것과 `NgIf`로 완전히 제거하는 것은 다릅니다.
이 내용을 확인하기 위해 다음과 같이 [클래스](guide/attribute-binding#class-binding)나 [스타일](guide/attribute-binding#style-binding)로 엘리먼트를 화면에서 감추는 예제 코드를 살펴봅시다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-3" header="src/app/app.component.html"></code-example>

엘리먼트가 화면에 보이지 않더라도 이 엘리먼트와 엘리먼트의 자식 엘리먼트들은 여전히 DOM에 존재합니다.
해당 엘리먼트와 관련된 컴포넌트도 여전히 메모리에 존재하며 Angular의 변화감지 로직이 동작할 때도 이 컴포넌트들은 대상이 됩니다.
따라서 불필요한 연산이 실행될 수 있으며 앱 동작 성능에 악영향을 줄 수도 있습니다.

`NgIf`는 조금 다릅니다.
`NgIf`가 `false` 값을 만나면 Angular는 해당 엘리먼트와 엘리먼트의 자식 엘리먼트를 모두 DOM에서 제거합니다.
이 엘리먼트와 관련된 컴포넌트도 모두 종료되면서 리소스를 반환하기 때문에 앱 성능도 저하되지 않습니다.

복잡한 컴포넌트 트리를 화면에서 감춰야 한다면 `NgIf`를 사용하는 방식이 더 나은지 검토해 보세요.

<div class="alert is-helpful">

`NgIf`와 `ngIfElse`에 대해 자세하게 알아보려면 [NgIf API 문서](api/common/NgIf)를 참고하세요.

</div>


<!--
### Guard against null
-->
### null 값 방지

<!--
Another advantage of `ngIf` is that you can use it to guard against null. Show/hide
is best suited for very simple use cases, so when you need a guard, opt instead for `ngIf`. Angular will throw an error if a nested expression tries to access a property of `null`.

The following shows `NgIf` guarding two `<div>`s.
The `currentCustomer` name appears only when there is a `currentCustomer`.
The `nullCustomer` will not be displayed as long as it is `null`.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2" header="src/app/app.component.html"></code-example>

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2b" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

See also the
[safe navigation operator](guide/template-expression-operators#safe-navigation-operator "Safe navigation operator (?.)") below.

</div>
-->
`ngIf` 디렉티브는 null 값을 방지하는 용도로도 활용할 수 있습니다.
간단한 조건을 다룬다면 엘리먼트를 화면에 표시하고/감추는 정도로도 충분할 수 있습니다.
하지만 복잡한 표현식에서 프로퍼티를 참조하다 `null` 값을 만나면 에러가 발생하는데, `ngIf`를 사용하면 이 에러를 방지할 수 있습니다.

아래 두 예제에서 `<div>` 엘리먼트에는 `NgIf`가 사용되었습니다.
`currentCustomer` 이름은 `currentCustomer` 객체가 존재할 때만 표시됩니다.
그리고 `nullCustomer` 객체는 이 객체의 값이 `null`이 아닐 때만 표시됩니다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2" header="src/app/app.component.html"></code-example>

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2b" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

[안전 참조 연산자(safe navigation operator)](guide/template-expression-operators#safe-navigation-operator "Safe navigation operator (?.)")에 대해서도 확인해 보세요.

</div>


<hr/>


{@a ngFor}

## `NgFor`

<!--
`NgFor` is a repeater directive&mdash;a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed
and then you tell Angular to use that block as a template for rendering each item in the list.
The text assigned to `*ngFor` is the instruction that guides the repeater process.

The following example shows `NgFor` applied to a simple `<div>`.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

Don't forget the asterisk (`*`) in front of `ngFor`. For more information
on the asterisk, see the [asterisk (*) prefix](guide/structural-directives#the-asterisk--prefix) section of
[Structural Directives](guide/structural-directives).

</div>

You can also apply an `NgFor` to a component element, as in the following example.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-2" header="src/app/app.component.html"></code-example>

{@a microsyntax}

<div class="callout is-critical">
<header>*ngFor microsyntax</header>

The string assigned to `*ngFor` is not a [template expression](guide/interpolation). Rather,
it's a *microsyntax*&mdash;a little language of its own that Angular interprets.
The string `"let item of items"` means:

> *Take each item in the `items` array, store it in the local `item` looping variable, and
make it available to the templated HTML for each iteration.*

Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item`
in the list.
For more information about microsyntax, see the [Structural Directives](guide/structural-directives#microsyntax) guide.

</div>
-->
`NgFor`는 배열의 항목을 순회하는 디렉티브입니다.
그래서 이 디렉티브는 아이템 하나가 표시될 HTML 조각을 정의해두고 배열의 항목마다 이 HTML 조각을 반복할 때 사용합니다.
이 때 반복되는 동작의 세부사항은 `*ngFor`에 바인딩되는 문자열에서 지정합니다.

아래 예제에서 `NgFor` 디렉티브는 `<div>`에 적용되었습니다.
`ngFor` 앞에 별표(`*`)가 붙는 것을 잊지 마세요.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

`ngFor` 앞에 별표(`*`)가 붙는 것을 잊지 마세요.
자세한 내용은 [구조 디렉티브](guide/structural-directives) 섹션의 [별표 (`*`) 접두사](guide/structural-directives#the-asterisk--prefix) 섹션을 참고하세요.

</div>

`NgFor` 디렉티브는 컴포넌트에도 적용할 수 있습니다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-2" header="src/app/app.component.html"></code-example>


{@a microsyntax}

<div class="callout is-critical">
<header>*ngFor 세부문법</header>

`*ngFor`에 바인딩되는 문자열은 [템플릿 표현식(template expression)](guide/interpolation)이 아닙니다.
이 문법은 세부문법(microsyntax)라고 하며, Angular 인터프리터가 처리하는 언어셋입니다.
이 문법에서 `"let item of items"`라고 작성하면:

> *`items` 배열의 항목을 하나씩 가져와서 지역 변수 `item`에 할당하고, 이 객체마다 HTML 조각을 반복합니다.*

Angular는 이 문법을 처리하기 위해 호스트 엘리먼트 근처에 `<ng-template>` 엘리먼트를 추가하며, 문법을 해석하고 난 뒤에는 배열에 있는 각 `item` 객체마다 지정된 템플릿을 DOM에 반복해서 추가합니다.
세부문법에 대해 자세하게 알아보려면 [구조 디렉티브](guide/structural-directives#microsyntax) 문서를 참고하세요.

</div>



{@a template-input-variable}

{@a template-input-variables}

<!--
### Template input variables
-->
### 템플릿 입력 변수

<!--
The `let` keyword before `item` creates a template input variable called `item`.
The `ngFor` directive iterates over the `items` array returned by the parent component's `items` property
and sets `item` to the current item from the array during each iteration.

Reference `item` within the `ngFor` host element
as well as within its descendants to access the item's properties.
The following example references `item` first in an interpolation
and then passes in a binding to the `item` property of the `<app-item-detail>` component.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1-2" header="src/app/app.component.html"></code-example>

For more information about template input variables, see
[Structural Directives](guide/structural-directives#template-input-variable).
-->
`item` 앞에 있는 `let` 키워드는 템플릿 입력 변수(template input variable) `item`을 선언합니다.
그리고 `ngFor` 디렉티브는 부모 컴포넌트에 있는 `items` 배열을 순회하면서 개별 항목을 `item`에 할당합니다.

`item` 변수는 `ngFor` 호스트 엘리먼트와 그 자식 엘리먼트 안에서만 참조할 수 있습니다.
아래 예제에서 `item` 변수는 문자열 바인딩해서 아이템의 이름을 표시할 때 한 번 사용되었으며, `<app-item-detail>` 컴포넌트로 바인딩할 때 한 번 사용되었습니다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1-2" header="src/app/app.component.html"></code-example>

템플릿 입력 변수에 대해 자세하게 알아보려면 [구조 디렉티브](guide/structural-directives#template-input-variable) 문서를 참고하세요.


<!--
### `*ngFor` with `index`
-->
### `*ngFor` 안에서 `index` 사용하기

<!--
The `index` property of the `NgFor` directive context
returns the zero-based index of the item in each iteration.
You can capture the `index` in a template input variable and use it in the template.

The next example captures the `index` in a variable named `i` and displays it with the item name.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-3" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

`NgFor` is implemented by the `NgForOf` directive. Read more about the other `NgForOf` context values such as `last`, `even`,
and `odd` in the [NgForOf API reference](api/common/NgForOf).

</div>
-->
`index` 프로퍼티는 `NgFor` 디렉티브 컨텍스트 안에서 순회 순서에 맞게 0부터 시작되는 인덱스 값입니다.
그래서 인덱스 값이 필요한 경우에는 `index` 프로퍼티를 템플릿 입력 변수처럼 참조할 수 있습니다.

아래 예제는 `index` 프로퍼티를 `i`라는 이름으로 가져와서 이름 앞에 표시하는 예제 코드입니다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-3" header="src/app/app.component.html"></code-example>

<div class="alert is-helpful">

`NgFor`는 `NgForOf` 디렉티브가 제공하는 기능입니다.
`last`나 `even`, `odd`와 같이 `NgForOf` 컨텍스트 안에서 활용할 수 있는 기능에 대해 더 알아보려면 [NgForOf API 문서](api/common/NgForOf)를 참고하세요.

</div>


{@a trackBy}
{@a ngfor-with-trackby}

<!--
### *ngFor with `trackBy`
-->
### `trackBy` 사용하기

<!--
If you use `NgFor` with large lists, a small change to one item, such as removing or adding an item, can trigger a cascade of DOM manipulations. For example, re-querying the server could reset a list with all new item objects, even when those items were previously displayed. In this case, Angular sees only a fresh list of new object references and has no choice but to replace the old DOM elements with all new DOM elements.

You can make this more efficient with `trackBy`.
Add a method to the component that returns the value `NgFor` should track.
In this case, that value is the hero's `id`. If the `id` has already been rendered,
Angular keeps track of it and doesn't re-query the server for the same `id`.

<code-example path="built-in-directives/src/app/app.component.ts" region="trackByItems" header="src/app/app.component.ts"></code-example>

In the microsyntax expression, set `trackBy` to the `trackByItems()` method.

<code-example path="built-in-directives/src/app/app.component.html" region="trackBy" header="src/app/app.component.html"></code-example>

Here is an illustration of the `trackBy` effect.
"Reset items" creates new items with the same `item.id`s.
"Change ids" creates new items with new `item.id`s.

* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement.

<div class="lightbox">
  <img src="generated/images/guide/built-in-directives/ngfor-trackby.gif" alt="Animation of trackBy">
</div>


<div class="alert is-helpful">

Built-in directives use only public APIs; that is,
they do not have special access to any private APIs that other directives can't access.

</div>
-->
복잡한 배열을 `NgFor`로 순회한다면 이 배열에 항목이 추가되거나 배열에서 제거되는 경우에 영향을 받는 DOM도 많습니다.
서버에서 새로운 목록을 받아오는 경우를 생각해보면, 데이터가 이전과 같더라도 객체 참조가 변경되었기 때문에 `NgFor`와 관련된 DOM이 모두 제거되고 새로운 DOM이 추가됩니다.

`trackBy`를 활용하면 이 동작을 효율적으로 개선할 수 있습니다.
먼저 컴포넌트에 `NgFor`가 추적할 값을 반환하는 메서드를 추가합니다.
지금 살펴보는 예제에서는 히어로의 `id`가 추적할 값입니다.
어떤 `id`가 이미 화면에 렌더링되어 있으면 Angular는 해당 DOM을 그대로 두고 다음 순회 루프로 넘어갑니다.

<code-example path="built-in-directives/src/app/app.component.ts" region="trackByItems" header="src/app/app.component.ts"></code-example>

세부문법 표현식에서 `trackBy`로 `trackByItems()` 메서드를 연결합니다.

<code-example path="built-in-directives/src/app/app.component.html" region="trackBy" header="src/app/app.component.html"></code-example>

`trackBy`가 동작하는 것을 확인해 보세요.
"Reset items"는 같은 `item.id`로 새로운 배열을 만드는 버튼입니다.
그리고 "Change ids"는 새로운 `item.id`로 새로운 배열을 만드는 버튼입니다.

* `trackBy`를 사용하지 않으면 두 버튼 모두 DOM 엘리먼트 전체를 갱신합니다.
* `trackBy`를 사용하면 `id`가 변경되었을 때만 DOM 엘리먼트가 갱신됩니다.

<div class="lightbox">
  <img src="generated/images/guide/built-in-directives/ngfor-trackby.gif" alt="Animation of trackBy">
</div>


<div class="alert is-helpful">

기본 디렉티브는 퍼블릭 API만 사용할 수 있습니다.
private API에는 접근할 수 없습니다.

</div>


<hr/>

{@a ngSwitch}

<!--
## The `NgSwitch` directives
-->
## `NgSwitch`

<!--
NgSwitch is like the JavaScript `switch` statement.
It displays one element from among several possible elements, based on a switch condition.
Angular puts only the selected element into the DOM.
<!- API Flagged ->
`NgSwitch` is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as in the following example.

 <code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch" header="src/app/app.component.html"></code-example>

<div class="lightbox">
  <img src="generated/images/guide/built-in-directives/ngswitch.gif" alt="Animation of NgSwitch">
</div>

`NgSwitch` is the controller directive. Bind it to an expression that returns
the *switch value*, such as `feature`. Though the `feature` value in this
example is a string, the switch value can be of any type.

**Bind to `[ngSwitch]`**. You'll get an error if you try to set `*ngSwitch` because
`NgSwitch` is an *attribute* directive, not a *structural* directive.
Rather than touching the DOM directly, it changes the behavior of its companion directives.

**Bind to `*ngSwitchCase` and `*ngSwitchDefault`**.
The `NgSwitchCase` and `NgSwitchDefault` directives are _structural_ directives
because they add or remove elements from the DOM.

* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value and removes
its bound value when it doesn't equal the switch value.

* `NgSwitchDefault` adds its element to the DOM when there is no selected `NgSwitchCase`.

The switch directives are particularly useful for adding and removing *component elements*.
This example switches among four `item` components defined in the `item-switch.components.ts` file.
Each component has an `item` [input property](guide/inputs-outputs#input "Input property")
which is bound to the `currentItem` of the parent component.

Switch directives work as well with native elements and web components too.
For example, you could replace the `<app-best-item>` switch case with the following.

<code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch-div" header="src/app/app.component.html"></code-example>
-->
NgSwitch 디렉티브는 JavaScript `switch` 문법과 비슷합니다.
이 디렉티브를 사용하면 개별 조건에 해당하는 템플릿 중에서 전달되는 조건에 맞는 템플릿 하나를 DOM에 추가합니다.

`NgSwitch`는 3개의 디렉티브를 조합하는 형태로 사용합니다.
아래 예제를 보면서 `NgSwitch`, `NgSwitchCase`, `NgSwitchDefault`에 대해 알아봅시다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch" header="src/app/app.component.html"></code-example>

<div class="lightbox">
  <img src="generated/images/guide/built-in-directives/ngswitch.gif" alt="Animation of NgSwitch">
</div>

`NgSwitch`는 다른 디렉티브를 조작하는 디렉티브입니다.
이 디렉티브에는 `feature`와 같이 *switch* 조건에 해당하는 표현식을 바인딩합니다.
이 문서에서 다루는 예제에서 `feature` 값의 타입은 문자열이지만 문자열이 아닌 타입도 가능합니다.

`NgSwitch`는 `[ngSwitch]`라는 문법으로 바인딩합니다.
이 문법 대신 `*ngSwitch`라고 사용하면 에러가 발생하는데, `NgSwitch` 디렉티브는 *구조* 디렉티브가 아니라 *어트리뷰트* 디렉티브이기 때문입니다.
동작하는 방식때문에 헷갈릴 수 있지만, `NgSwitch` 디렉티브는 호스트 엘리먼트를 직접 조작하지 않으며, 관련된 `NgSwitchCase`, `NgSwitchDefault`의 동작에 영향을 주는 어트리뷰트 디렉티브입니다.

`NgSwitchCase`는 `*ngSwitchCase`라고, `NgSwitchDefault`는 `*ngSwitchDefault`라는 문법으로 바인딩합니다.
`NgSwitchCase`와 `NgSwitchDefault`는 엘리먼트를 DOM에 추가하거나 제거하는 _구조_ 디렉티브입니다.

* `NgSwitchCase`는 switch 조건에 해당하면 해당 엘리먼트를 DOM에 추가하고, 조건에 해당하지 않으면 해당 엘리먼트를 DOM에서 제거합니다.

* `NgSwitchDefault`는 switch 조건에 해당하는 `NgSwitchCase`가 없는 경우에 해당 엘리먼트를 DOM에 추가합니다.

NgSwitch 디렉티브는 *컴포넌트 엘리먼트*를 DOM에 추가하거나 제거할 때에 특히 유용합니다.
위에서 살펴본 예제에서는 `item-switch.components.ts` 파일에 정의된 4종류의 `item` 관련 컴포넌트가 동작합니다.
개별 컴포넌트는 부모 컴포넌트에 있는 `currentItem` 프로퍼티를 [입력 프로퍼티](guide/inputs-outputs#input "Input property") `item`로 받습니다.

NgSwitch 디렉티브는 표준 엘리먼트나 웹 컴포넌트에도 적용할 수 있습니다.
`<app-best-item>` 엘리먼트는 아래 코드처럼 변경해도 됩니다.

<code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch-div" header="src/app/app.component.html"></code-example>
