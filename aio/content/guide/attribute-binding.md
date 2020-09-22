<!--
# Attribute, class, and style bindings
-->
# 어트리뷰트, 클래스, 스타일 바인딩

<!--
The template syntax provides specialized one-way bindings for scenarios less well-suited to property binding.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>
-->
프로퍼티 바인딩이 적합하지 않은 경우에 활용할 수 있는 단방향 바인딩 문법에 대해 알아봅시다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
## Attribute binding
-->
## 어트리뷰트 바인딩

<!--
Set the value of an attribute directly with an **attribute binding**. This is the only exception to the rule that a binding sets a target property and the only binding that creates and sets an attribute.

Usually, setting an element property with a [property binding](guide/property-binding)
is preferable to setting the attribute with a string. However, sometimes
there is no element property to bind, so attribute binding is the solution.

Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) and
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG). They are purely attributes, don't correspond to element properties, and don't set element properties. In these cases, there are no property targets to bind to.

Attribute binding syntax resembles property binding, but
instead of an element property between brackets, start with the prefix `attr`,
followed by a dot (`.`), and the name of the attribute.
You then set the attribute value, using an expression that resolves to a string,
or remove the attribute when the expression resolves to `null`.

One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:

<code-example path="attribute-binding/src/app/app.component.html" region="attrib-binding-aria" header="src/app/app.component.html"></code-example>
-->
**어트리뷰트 바인딩(attribute binding)**을 활용하면 어트리뷰트의 값을 직접 지정할 수 있습니다.
이 문법은 대상 프로퍼티를 지정하고 값을 할당하는 방식과 다르게 어트리뷰트 값을 직접 할당하는 예외 케이스 입니다.

엘리먼트의 프로퍼티 값이 문자열 형식이라면 [프로퍼티 바인딩](guide/property-binding)으로 할당하는 것이 일반적입니다.
하지만 바인딩할 엘리먼트 프로퍼티가 없다면 어트리뷰트 바인딩으로만 어트리뷰트 값을 할당할 수 있습니다.

[ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)나 [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)의 경우를 생각해 봅시다.
이 속성들은 온전히 어트리뷰트일 뿐이며 관련된 엘리먼트 프로퍼티가 없기 때문에 프로퍼티로는 값을 할당할 수 없습니다.

어트리뷰트 바인딩 문법은 프로퍼티 바인딩 문법과 비슷하지만, 엘리먼트 프로퍼티를 대괄호(`[`, `]`)로 감싸는 대신 `attr` 접두사 뒤에 마침표(`.`)를 붙이고 그 뒤에 어트리뷰트 이름을 붙여 대상 어트리뷰트를 지정합니다.
그리고 할당할 어트리뷰트 값을 표현식으로 지정하는데, 표현식 결과는 문자열을 사용하며 표현식 결과가 `null`이면 어트리뷰트를 제거합니다.

어트리뷰트 바인딩은 ARIA 어트리뷰트를 설정할 때 많이 사용됩니다.
이렇게 사용하면 됩니다:

<code-example path="attribute-binding/src/app/app.component.html" region="attrib-binding-aria" header="src/app/app.component.html"></code-example>


{@a colspan}

<div class="alert is-helpful">

<!--
#### `colspan` and `colSpan`
-->
#### `colspan`과 `colSpan`

<!--
Notice the difference between the `colspan` attribute and the `colSpan` property.

If you wrote something like this:

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

You'd get this error:

<code-example language="bash">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

As the message says, the `<td>` element does not have a `colspan` property. This is true
because `colspan` is an attribute&mdash;`colSpan`, with a capital `S`, is the
corresponding property. Interpolation and property binding can set only *properties*, not attributes.

Instead, you'd use property binding and write it like this:

<code-example path="attribute-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

</div>
-->
`colspan` 어트리뷰트와 `colSpan` 프로퍼티는 확실하게 구별해서 사용해야 합니다.

코드를 이렇게 작성했다고 합시다:

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

이 코드를 사용하면 에러가 표시됩니다:

<code-example language="bash">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

에러 메시지에서 확인할 수 있듯이, `<td>` 엘리먼트에는 `colspan` 프로퍼티가 없습니다.
`<td>` 엘리먼트에 사용하는 `colspan`은 어트리뷰트이며 이 어트리뷰트와 관련된 프로퍼티는 대문자 `S`로 시작하는 `colSpan` 프로퍼티입니다.
문자열 바인딩(interpolation)과 프로퍼티 바인딩은 *프로퍼티* 를 대상으로만 동작합니다.
어트리뷰트에는 사용할 수 없습니다.

`colSpan` 프로퍼티를 바인딩하려면 이렇게 사용해야 합니다.

<code-example path="attribute-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

</div>


<hr/>


{@a class-binding}

<!--
## Class binding
-->
## 클래스 바인딩

<!--
Here's how to set the `class` attribute without a binding in plain HTML:

```html
<!- standard class attribute setting ->
<div class="foo bar">Some text</div>
```

You can also add and remove CSS class names from an element's `class` attribute with a **class binding**.

To create a single class binding, start with the prefix `class` followed by a dot (`.`) and the name of the CSS class (for example, `[class.foo]="hasFoo"`).
Angular adds the class when the bound expression is truthy, and it removes the class when the expression is falsy (with the exception of `undefined`, see [styling delegation](#styling-delegation)).

To create a binding to multiple classes, use a generic `[class]` binding without the dot (for example, `[class]="classExpr"`).
The expression can be a space-delimited string of class names, or you can format it as an object with class names as the keys and truthy/falsy expressions as the values.
With object format, Angular will add a class only if its associated value is truthy.

It's important to note that with any object-like expression (`object`, `Array`, `Map`, `Set`, etc), the identity of the object must change for the class list to be updated.
Updating the property without changing object identity will have no effect.

If there are multiple bindings to the same class name, conflicts are resolved using [styling precedence](#styling-precedence).

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Binding Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Input Type
    </th>
    <th>
      Example Input Values
    </th>
  </tr>
  <tr>
    <td>Single class binding</td>
    <td><code>[class.foo]="hasFoo"</code></td>
    <td><code>boolean | undefined | null</code></td>
    <td><code>true</code>, <code>false</code></td>
  </tr>
  <tr>
    <td rowspan=3>Multi-class binding</td>
    <td rowspan=3><code>[class]="classExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"my-class-1 my-class-2 my-class-3"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: boolean | undefined | null}</code></td>
    <td><code>{foo: true, bar: false}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['foo', 'bar']</code></td>
  </tr>
</table>


The [NgClass](guide/built-in-directives/#ngclass) directive can be used as an alternative to direct `[class]` bindings.
However, using the above class binding syntax without `NgClass` is preferred because due to improvements in class binding in Angular, `NgClass` no longer provides significant value, and might eventually be removed in the future.
-->
HTML 문서에 `class` 어트리뷰트를 바인딩하려면 이렇게 작성하면 됩니다:

```html
<!-- 표준 class 어트리뷰트 할당 문법 -->
<div class="foo bar">Some text</div>
```

엘리먼트의 `class` 어트리뷰트는 **클래스 바인딩(class binding)**을 활용해서 CSS 클래스를 추가하거나 제거할 수 있습니다.

클래스 하나만 바인딩하려면 접두사 `class` 뒤에 마침표(`.`)를 붙이고 그 뒤에 CSS 클래스 이름을 붙여서 `[class.foo]="hasFoo"`라고 작성하면 됩니다.
그러면 바인딩된 표현식이 참으로 평가되면 클래스를 추가하며, 표현식이 거짓으로 평가되면 클래스를 제거합니다.
`undefined`로 평가되는 경우는 조금 다릅니다. 자세한 내용은 [스타일 위임](#styling-delegation) 섹션을 참고하세요.

그리고 클래스 여러개를 한번에 바인딩하려면 `[class]`에 표현식을 바인딩해서 `[class]="classExpr"`와 같이 작성하면 됩니다.
이 때 표현식에는 공백으로 구분된 문자열로 클래스 이름을 지정하거나, 클래스 이름을 키로 하고 이 키에 참/거짓으로 평가되는 표현식을 객체 형태로 사용할 수 있습니다.
객체 형태를 사용하면 표현식이 참으로 평가된 클래스만 엘리먼트에 추가됩니다.

클래스 바인딩 표현식에 사용하는 객체는 `object`, `Array`, `Map`, `Set` 등의 형태를 사용할 수 있습니다.
클래스를 제대로 갱신하려면 객체 참조만 변경되면 됩니다.
객체 참조는 그대로인 상태에서 프로퍼티 값만 변경된다면 클래스 바인딩이 제대로 갱신되지 않을 수 있습니다.

그리고 같은 클래스 이름이 여러번 바인딩되면 [스타일 지정 우선순위](#styling-precedence)에 의해 처리됩니다.

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      바인딩 타입
    </th>
    <th>
      문법
    </th>
    <th>
      입력값 타입
    </th>
    <th>
      입력값 예
    </th>
  </tr>
  <tr>
    <td>단일 클래스 바인딩</td>
    <td><code>[class.foo]="hasFoo"</code></td>
    <td><code>boolean | undefined | null</code></td>
    <td><code>true</code>, <code>false</code></td>
  </tr>
  <tr>
    <td rowspan=3>여러 클래스 바인딩</td>
    <td rowspan=3><code>[class]="classExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"my-class-1 my-class-2 my-class-3"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: boolean | undefined | null}</code></td>
    <td><code>{foo: true, bar: false}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['foo', 'bar']</code></td>
  </tr>
</table>

`[class]` 바인딩 문법은 [NgClass](guide/built-in-directives/#ngclass) 디렉티브를 사용하는 방식으로 바꿔 사용할 수 있습니다.
하지만 `NgClass` 문법보다는 클래스 바인딩 문법을 직접 사용하는 것을 권장합니다.
`NgClass` 문법은 앞으로 개선될 여지가 있으며 특별히 중요한 기능을 하지 않기 때문에 이후 Angular 버전에서는 사용되지 않을 수 있습니다.



<hr/>


{@a style-binding}
<!--
## Style binding
-->
## 스타일 바인딩

<!--
Here's how to set the `style` attribute without a binding in plain HTML:

```html
<!- standard style attribute setting ->
<div style="color: blue">Some text</div>
```

You can also set styles dynamically with a **style binding**.

To create a single style binding, start with the prefix `style` followed by a dot (`.`) and the name of the CSS style property (for example, `[style.width]="width"`).
The property will be set to the value of the bound expression, which is normally a string.
Optionally, you can add a unit extension like `em` or `%`, which requires a number type.

<div class="alert is-helpful">

Note that a _style property_ name can be written in either
[dash-case](guide/glossary#dash-case), as shown above, or
[camelCase](guide/glossary#camelcase), such as `fontSize`.

</div>

If there are multiple styles you'd like to toggle, you can bind to the `[style]` property directly without the dot (for example, `[style]="styleExpr"`).
The expression attached to the `[style]` binding is most often a string list of styles like `"width: 100px; height: 100px;"`.

You can also format the expression as an object with style names as the keys and style values as the values, like `{width: '100px', height: '100px'}`.
It's important to note that with any object-like expression (`object`, `Array`, `Map`, `Set`, etc), the identity of the object must change for the class list to be updated.
Updating the property without changing object identity will have no effect.

If there are multiple bindings to the same style property, conflicts are resolved using [styling precedence rules](#styling-precedence).

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      Binding Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Input Type
    </th>
    <th>
      Example Input Values
    </th>
  </tr>
  <tr>
    <td>Single style binding</td>
    <td><code>[style.width]="width"</code></td>
    <td><code>string | undefined | null</code></td>
    <td><code>"100px"</code></td>
  </tr>
  <tr>
  <tr>
    <td>Single style binding with units</td>
    <td><code>[style.width.px]="width"</code></td>
    <td><code>number | undefined | null</code></td>
    <td><code>100</code></td>
  </tr>
    <tr>
    <td rowspan=3>Multi-style binding</td>
    <td rowspan=3><code>[style]="styleExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"width: 100px; height: 100px"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: string | undefined | null}</code></td>
    <td><code>{width: '100px', height: '100px'}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['width', '100px']</code></td>
  </tr>
</table>

The [NgStyle](guide/built-in-directives/#ngstyle) directive can be used as an alternative to direct `[style]` bindings.
However, using the above style binding syntax without `NgStyle` is preferred because due to improvements in style binding in Angular, `NgStyle` no longer provides significant value, and might eventually be removed in the future.
-->
HTML 문서에 `style` 어트리뷰트를 바인딩하려면 이렇게 작성하면 됩니다:

```html
<!-- 표준 스타일 어트리뷰트 할당 문법 -->
<div style="color: blue">Some text</div>
```

그리고 **스타일 바인딩** 문법을 활용하면 스타일을 동적으로 지정할 수 있습니다.

스타일 하나를 바인딩하려면 접두사 `style` 뒤에 마침표(`.`)를 붙이고 그 뒤에 CSS 스타일 프로퍼티 이름을 붙여서 `[style.width]="width"`와 같이 작성하면 됩니다.
그러면 스타일 바인딩에 사용된 표현식이 평가된 결과로 스타일이 지정되며, 보통은 표현식 결과로 문자열이 사용됩니다.
그리고 단위를 사용하는 곳에는 `em`이나 `%`를 붙여서 단위를 함께 지정할 수도 있습니다.

<div class="alert is-helpful">

_스타일 프로퍼티_ 이름은 [대시-케이스(dash-case)](guide/glossary#dash-case)를 사용하기도 하고 [캐멀케이스(camelCase)](guide/glossary#camelcase)를 사용하기도 합니다.

</div>

스타일 여러개를 한번에 바인딩하려면 `[style]` 프로퍼티에 마침표 없이 `[style]="styleExpr"`처럼 작성하면 됩니다.
그러면 `[style]`에는 `"width: 100px; height: 100px;"`와 같은 문자열이 바인딩될 수 있습니다.

스타일 바인딩 문법에는 스타일 이름을 키로, 지정할 스타일을 값으로 지정하는 객체 형태로 `{width: '100px', height: '100px'}`와 같이 지정할 수도 있습니다.
이 때 `object`, `Array`, `Map`, `Set` 등과 같은 객체 형태를 사용할 수 있으며, 스타일을 제대로 갱신하려면 객체 참조를 갱신해야 합니다.
객체는 그대로인 상태에서 프로퍼티 값만 변경되면 스타일이 제대로 반영되지 않을 수 있습니다.

같은 스타일 프로퍼티를 여러번 바인딩하면 [스타일 지정 우선순위](#styling-precedence)에 따라 처리됩니다.

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="15%">
  </col>
  <col width="20%">
  </col>
  <col width="35%">
  </col>
  <col width="30%">
  </col>
  <tr>
    <th>
      바인딩 타입
    </th>
    <th>
      문법
    </th>
    <th>
      입력값 타입
    </th>
    <th>
      입력값 예
    </th>
  </tr>
  <tr>
    <td>단일 스타일 바인딩</td>
    <td><code>[style.width]="width"</code></td>
    <td><code>string | undefined | null</code></td>
    <td><code>"100px"</code></td>
  </tr>
  <tr>
  <tr>
    <td>단위와 함께 단일 스타일 반영</td>
    <td><code>[style.width.px]="width"</code></td>
    <td><code>number | undefined | null</code></td>
    <td><code>100</code></td>
  </tr>
    <tr>
    <td rowspan=3>여러 스타일 반영</td>
    <td rowspan=3><code>[style]="styleExpr"</code></td>
    <td><code>string</code></td>
    <td><code>"width: 100px; height: 100px"</code></td>
  </tr>
  <tr>
    <td><code>{[key: string]: string | undefined | null}</code></td>
    <td><code>{width: '100px', height: '100px'}</code></td>
  </tr>
  <tr>
    <td><code>Array</code><<code>string</code>></td>
    <td><code>['width', '100px']</code></td>
  </tr>
</table>


`[style]` 바인딩 문법은 [NgStyle](guide/built-in-directives/#ngstyle) 디렉티브를 사용하는 방식으로 바꿔 사용할 수 있습니다.
하지만 `NgStyle` 문법보다는 스타일 바인딩 문법을 직접 사용하는 것을 권장합니다.
`NgStyle` 문법은 앞으로 개선될 여지가 있으며 특별히 중요한 기능을 하지 않기 때문에 이후 Angular 버전에서는 사용되지 않을 수 있습니다.


<hr/>

{@a styling-precedence}

<!--
## Styling Precedence
-->
## 스타일 지정 우선순위

<!--
A single HTML element can have its CSS class list and style values bound to multiple sources (for example, host bindings from multiple directives).

When there are multiple bindings to the same class name or style property, Angular uses a set of precedence rules to resolve conflicts and determine which classes or styles are ultimately applied to the element.

<div class="alert is-helpful">
<h4>Styling precedence (highest to lowest)</h4>

1. Template bindings
    1. Property binding (for example, `<div [class.foo]="hasFoo">` or `<div [style.color]="color">`)
    1. Map binding (for example, `<div [class]="classExpr">` or `<div [style]="styleExpr">`)
    1. Static value (for example, `<div class="foo">` or `<div style="color: blue">`)
1. Directive host bindings
    1. Property binding (for example, `host: {'[class.foo]': 'hasFoo'}` or `host: {'[style.color]': 'color'}`)
    1. Map binding (for example, `host: {'[class]': 'classExpr'}` or `host: {'[style]': 'styleExpr'}`)
    1. Static value (for example, `host: {'class': 'foo'}` or `host: {'style': 'color: blue'}`)
1. Component host bindings
    1. Property binding (for example, `host: {'[class.foo]': 'hasFoo'}` or `host: {'[style.color]': 'color'}`)
    1. Map binding (for example, `host: {'[class]': 'classExpr'}` or `host: {'[style]': 'styleExpr'}`)
    1. Static value (for example, `host: {'class': 'foo'}` or `host: {'style': 'color: blue'}`)

</div>

The more specific a class or style binding is, the higher its precedence.

A binding to a specific class (for example, `[class.foo]`) will take precedence over a generic `[class]` binding, and a binding to a specific style (for example, `[style.bar]`) will take precedence over a generic `[style]` binding.

<code-example path="attribute-binding/src/app/app.component.html" region="basic-specificity" header="src/app/app.component.html"></code-example>

Specificity rules also apply when it comes to bindings that originate from different sources.
It's possible for an element to have bindings in the template where it's declared, from host bindings on matched directives, and from host bindings on matched components.

Template bindings are the most specific because they apply to the element directly and exclusively, so they have the highest precedence.

Directive host bindings are considered less specific because directives can be used in multiple locations, so they have a lower precedence than template bindings.

Directives often augment component behavior, so host bindings from components have the lowest precedence.

<code-example path="attribute-binding/src/app/app.component.html" region="source-specificity" header="src/app/app.component.html"></code-example>

In addition, bindings take precedence over static attributes.

In the following case, `class` and `[class]` have similar specificity, but the `[class]` binding will take precedence because it is dynamic.

<code-example path="attribute-binding/src/app/app.component.html" region="dynamic-priority" header="src/app/app.component.html"></code-example>
-->
HTML 엘리먼트 하나에는 CSS 클래스와 스타일이 여러개 지정될 수 있습니다.
디렉티브를 여러개 사용하는 경우와 같이 클래스와 스타일을 지정하는 출처가 여러 곳인 경우도 있을 수 있습니다.

여러 곳에서 같은 클래스 이름이나 같은 스타일 프로퍼티를 지정하는 경우라면 Angular가 정해둔 스타일 지정 우선순위에 따라 엘리먼트에 적용되는 클래스와 스타일이 결정됩니다.

<div class="alert is-helpful">
<h4>스타일 지정 우선순위 (높은 순서부터 낮은 순서대로)</h4>

1. 템플릿 바인딩
    1. 프로퍼티 바인딩 (ex. `<div [class.foo]="hasFoo">`, `<div [style.color]="color">`)
    1. 맵 바인딩 (ex. `<div [class]="classExpr">`, `<div [style]="styleExpr">`)
    1. 정적 값 (ex. `<div class="foo">`, `<div style="color: blue">`)
1. 디렉티브 호스트 바인딩
    1. 프로퍼티 바인딩 (ex. `host: {'[class.foo]': 'hasFoo'}`, `host: {'[style.color]': 'color'}`)
    1. 맵 바인딩 (ex. `host: {'[class]': 'classExpr'}`, `host: {'[style]': 'styleExpr'}`)
    1. 정적 값 (ex. `host: {'class': 'foo'}`, `host: {'style': 'color: blue'}`)
1. 컴포넌트 호스트 바인딩
    1. 프로퍼티 바인딩 (ex. `host: {'[class.foo]': 'hasFoo'}`, `host: {'[style.color]': 'color'}`)
    1. 맵 바인딩 (ex. `host: {'[class]': 'classExpr'}`, `host: {'[style]': 'styleExpr'}`)
    1. 정적 값 (ex. `host: {'class': 'foo'}`, `host: {'style': 'color: blue'}`)

</div>

그리고 CSS와 비슷하게, 클래스나 스타일을 지정하는 표현이 더 구체적일수록 우선순위가 높습니다.

그래서 제네릭을 사용하는 `[class]` 바인딩보다는 특정 클래스를 지정하는 `[class.foo]`가, 제네릭을 사용하는 `[style]` 바인딩보다는 특정 스타일을 지정하는 `[style.bar]`가 더 우선순위가 높습니다.

<code-example path="attribute-binding/src/app/app.component.html" region="basic-specificity" header="src/app/app.component.html"></code-example>

이 규칙은 출처가 다른 경우에도 적용됩니다.
그래서 템플릿에서 직접 바인딩 된 경우와 디렉티브로 호스트 바인딩 된 경우, 컴포넌트로 호스팅 된 경우 모두 우선순위를 따져 최종 스타일이 결정됩니다.

템플릿 바인딩은 엘리먼트에 직접 명시적으로 적용되었기 때문에 우선순위가 가장 높습니다.

디렉티브 호스트 바인딩은 여러 엘리먼트에 적용될 수 있기 때문에 템플릿 바인딩보다는 우선순위가 낮습니다.

컴포넌트는 컴포넌트와 동시에 사용될 수도 있습니다.
그래서 컴포넌트 호스트 바인딩의 우선순위가 가장 낮습니다.

<code-example path="attribute-binding/src/app/app.component.html" region="source-specificity" header="src/app/app.component.html"></code-example>

추가로, 바인딩 문법은 정적으로 어트리뷰트 값을 지정하는 것보다 우선순위가 높습니다.

아래 예제에서 `class`와 `[class]`는 구체적인 측면에서 비슷하지만 `[class]` 바인딩은 동적으로 할당되기 때문에 정적으로 지정한 값보다 우선순위가 높습니다.

<code-example path="attribute-binding/src/app/app.component.html" region="dynamic-priority" header="src/app/app.component.html"></code-example>


{@a styling-delegation}
<!--
### Delegating to styles with lower precedence
-->
### 낮은 순위로 스타일이 위임되는 경우

<!--
It is possible for higher precedence styles to "delegate" to lower precedence styles using `undefined` values.
Whereas setting a style property to `null` ensures the style is removed, setting it to `undefined` will cause Angular to fall back to the next-highest precedence binding to that style.

For example, consider the following template:

<code-example path="attribute-binding/src/app/app.component.html" region="style-delegation" header="src/app/app.component.html"></code-example>

Imagine that the `dirWithHostBinding` directive and the `comp-with-host-binding` component both have a `[style.width]` host binding.
In that case, if `dirWithHostBinding` sets its binding to `undefined`, the `width` property will fall back to the value of the `comp-with-host-binding` host binding.
However, if `dirWithHostBinding` sets its binding to `null`, the `width` property will be removed entirely.
-->
우선순위가 높다고 해도 `undefined` 값을 사용하면 스타일을 낮은 순위로 "위임(delegate)"할 수 있습니다.
스타일 프로퍼티에 `null` 값을 할당하면 스타일이 제거됩니다.
하지만 `undefined`를 할당하면 다음 우선순위 스타일이 바인딩 됩니다.

아래 예제를 확인해 보세요:

<code-example path="attribute-binding/src/app/app.component.html" region="style-delegation" header="src/app/app.component.html"></code-example>

`dirWithHostBinding` 디렉티브와 `comp-with-host-binding` 컴포넌트는 모두 호스트 엘리먼트에 `[style.width]`를 바인딩 합니다.
그런데 `dirWithHostBinding`이 `undefined` 값을 바인딩하면 `width` 프로퍼티는 다음 우선순위인 `comp-with-host-binding` 값에 따라 결정됩니다.
하지만 `dirWithHostBinding`이 `null` 값을 바인딩하면 `width` 프로퍼티가 스타일에서 제거됩니다.
