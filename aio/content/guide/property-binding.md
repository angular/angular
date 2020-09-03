
<!--
# Property binding `[property]`
-->
# 프로퍼티 바인딩 `[프로퍼티]`

<!--
Use property binding to _set_ properties of target elements or
directive `@Input()` decorators.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>
-->
프로퍼티 바인딩을 활용하면 엘리먼트, 디렉티브의 `@Input()` 데코레이터가 지정된 프로퍼티에 값을 할당할 수 있습니다.

<div class="alert is-helpful">

이 문서에서 설명하는 내용은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


<!--
## One-way in
-->
## 단방향 연결

<!--
Property binding flows a value in one direction,
from a component's property into a target element property.

You can't use property
binding to read or pull values out of target elements. Similarly, you cannot use
property binding to call a method on the target element.
If the element raises events, you can listen to them with an [event binding](guide/event-binding).

If you must read a target element property or call one of its methods,
see the API reference for [ViewChild](api/core/ViewChild) and
[ContentChild](api/core/ContentChild).
-->
프로퍼티 바인딩은 컴포넌트 프로퍼티에서 대상 엘리먼트 프로퍼티로 향하는 단방향입니다.

프로퍼티 바인딩은 대상 엘리먼트에 있는 특정 항목의 값을 읽는 용도로는 사용할 수 없습니다.
마찬가지로 대상 엘리먼트에 있는 메서드를 실행할 수도 없습니다.
엘리먼트에서 발생하는 이벤트를 감지하려면 프로퍼티 바인딩 대신 [이벤트 바인딩](guide/event-binding)을 사용해야 합니다.

바인딩 대상 엘리먼트의 프로퍼티 값을 읽어야 하거나 메서드를 실행해야 한다면 [ViewChild](api/core/ViewChild)나 [ContentChild](api/core/ContentChild)를 참고하세요.


<!--
## Examples
-->
## 예제

<!--
The most common property binding sets an element property to a component
property value. An example is
binding the `src` property of an image element to a component's `itemImageUrl` property:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

Here's an example of binding to the `colSpan` property. Notice that it's not `colspan`,
which is the attribute, spelled with a lowercase `s`.

<code-example path="property-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

For more details, see the [MDN HTMLTableCellElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) documentation.

For more information about `colSpan` and `colspan`, see the [Attribute binding](guide/attribute-binding#colspan) guide.

Another example is disabling a button when the component says that it `isUnchanged`:

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Another is setting a property of a directive:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

Yet another is setting the model property of a custom component&mdash;a great way
for parent and child components to communicate:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>
-->
프로퍼티 바인딩은 일반적으로 컴포넌트 프로퍼티의 값을 바인딩하는 대상 엘리먼트의 프로퍼티로 전달하는 용도로 사용합니다.
그래서 컴포넌트에 있는 `itemImageUrl` 프로퍼티 값을 이미지 엘리먼트의 `src` 프로퍼티로 바인딩하려면 다음과 같이 작성하면 됩니다:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

`colSpan` 프로퍼티를 바인딩하는 예제를 살펴봅시다.
어트리뷰트 `colspan`이 아니라 대문자 `s`가 들어간 프로퍼티입니다.

<code-example path="property-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html"></code-example>

이 프로퍼티에 대해 더 자세하게 알아보려면 [MDN HTMLTableCellElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) 문서를 참고하세요.

그리고 `colSpan`과 `colspan`의 차이점에 대해 알아보려면 [어트리뷰트 바인딩](guide/attribute-binding#colspan)  문서를 참고하세요.

컴포넌트 프로퍼티 `isUnchanged` 값에 따라 버튼을 비활성화하는 예제도 살펴봅시다:

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

디렉티브의 프로퍼티 값도 설정할 수 있습니다:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

아직 제대로 다루지 않았지만, 프로퍼티 바인딩은 부모 컴포넌트가 자식 컴포넌트로 데이터를 전달하는 용도로도 활용할 수 있습니다.

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>


<!--
## Binding targets
-->
## 바인딩 대상

<!--
An element property between enclosing square brackets identifies the target property.
The target property in the following code is the image element's `src` property.

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

There's also the `bind-` prefix alternative:

<code-example path="property-binding/src/app/app.component.html" region="bind-prefix" header="src/app/app.component.html"></code-example>


In most cases, the target name is the name of a property, even
when it appears to be the name of an attribute.
So in this case, `src` is the name of the `<img>` element property.

Element properties may be the more common targets,
but Angular looks first to see if the name is a property of a known directive,
as it is in the following example:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

Technically, Angular is matching the name to a directive `@Input()`,
one of the property names listed in the directive's `inputs` array
or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.

If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.

<div class="alert is-helpful">

Though the target name is usually the name of a property,
there is an automatic attribute-to-property mapping in Angular for
several common attributes. These include `class`/`className`, `innerHtml`/`innerHTML`, and
`tabindex`/`tabIndex`.

</div>
-->
프로퍼티 바인딩의 바인딩 대상은 엘리먼트 태그에서 대괄호(`[]`) 안에 있는 프로퍼티입니다.
그래서 아래 예제에서는 엘리먼트의 `src` 프로퍼티가 바인딩 대상입니다.

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html"></code-example>

대괄호를 사용할 수 없다면 `bind-` 접두사를 활용해서 프로퍼티를 바인딩할 수 있습니다:

<code-example path="property-binding/src/app/app.component.html" region="bind-prefix" header="src/app/app.component.html"></code-example>

바인딩 대상이 되는 항목은 프로퍼티의 이름인 경우가 대부분이겠이며 어트리뷰트 이름을 사용하는 경우도 가끔 있습니다.
위에서 살펴본 예제에서 `src`는 `<img>` 엘리먼트의 프로퍼티 이름입니다.

Angular는 프로퍼티 바인딩 문법을 만나면 바인딩 대상이 디렉티브에 있는 프로퍼티인지 먼저 검사합니다.
예제를 봅시다:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html"></code-example>

Angular는 먼저 디렉티브의 `inputs` 배열에 해당 프로퍼티가 있는지, 디렉티브 클래스에 `@Input()` 데코레이터가 지정된 프로퍼티가 있는지 검사합니다.
이 때 원하는 프로퍼티를 발견하면 해당 프로퍼티를 바인딩합니다.

그리고 디렉티브나 엘리먼트에서 프로퍼티를 발견하지 못하면 "unknown directive" 에러를 발생시킵니다.

<div class="alert is-helpful">

프로퍼티 바인딩 대상은 프로퍼티의 이름인 경우가 대부분이지만, 일부 어트리뷰트에 대해서는 어트리뷰트를 자동으로 프로퍼티와 매칭시키기도 합니다.
`class`/`className`, `innerHtml`/`innerHTML`, `tabindex`/`tabIndex`의 경우가 그렇습니다.

</div>


{@a avoid-side-effects}
<!--
## Avoid side effects
-->
## 부수효과 최소화

<!--
Evaluation of a template expression should have no visible side effects.
The expression language itself, or the way you write template expressions,
helps to a certain extent;
you can't assign a value to anything in a property binding expression
nor use the increment and decrement operators.

For example, you could have an expression that invoked a property or method that had
side effects. The expression could call something like `getFoo()` where only you
know what `getFoo()` does. If `getFoo()` changes something
and you happen to be binding to that something,
Angular may or may not display the changed value. Angular may detect the
change and throw a warning error.
As a best practice, stick to properties and to methods that return
values and avoid side effects.
-->
템플릿 표현식은 실행되면서 부수효과(side effects)를 발생시키지 않는 것이 좋습니다.
그래서 템플릿 표현식에는 할당연산자나 증감연산자를 사용할 수 없습니다.

예를 들어, 템플릿 표현식에서 프로퍼티 값을 변경하거나 부수효과를 일으키는 메서드 `getFoo()`를 실행한다고 합시다.
`getFoo()` 메서드가 어떤 동작을 하는지 정확하게 알고 있는 경우라면 괜찮습니다.
하지만 `getFoo()` 메서드가 어떤 값을 바꾸고, 이 값이 또 어떤 값을 연쇄적으로 바꾼다면 이렇게 변경되는 값을 Angular가 제대로 감지하지 못할 수 있습니다.
이 경우에는 콘솔에 경고 메시지가 출력됩니다.
템플릿 표현식에는 프로퍼티 값을 참조하거나 부수효과가 없는 메서드를 실행하고 메서드가 반환한 값을 사용하는 것 정도가 가장 좋습니다.


<!--
## Return the proper type
-->
## 적절한 타입 반환하기

<!--
The template expression should evaluate to the type of value
that the target property expects.
Return a string if the target property expects a string, a number if it
expects a number, an object if it expects an object, and so on.

In the following example, the `childItem` property of the `ItemDetailComponent` expects a string, which is exactly what you're sending in the property binding:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>

You can confirm this by looking in the `ItemDetailComponent` where the `@Input` type is set to a string:
<code-example path="property-binding/src/app/item-detail/item-detail.component.ts" region="input-type" header="src/app/item-detail/item-detail.component.ts (setting the @Input() type)"></code-example>

As you can see here, the `parentItem` in `AppComponent` is a string, which the `ItemDetailComponent` expects:
<code-example path="property-binding/src/app/app.component.ts" region="parent-data-type" header="src/app/app.component.ts"></code-example>
-->
템플릿 표현식은 대상 프로퍼티의 타입과 맞는 타입을 반환해야 합니다.
바인딩 된 프로퍼티 타입이 문자열이라면 문자열을 반환해야 하며, 숫자인 경우, 객체인 경우에도 마찬가지입니다.

아래 예제에서 `ItemDetailComponent`에 있는 `childItem` 프로퍼티는 문자열 타입으로 지정되어 있기 때문에 이 프로퍼티를 바인딩 할 때도 문자열을 할당해야 합니다:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html"></code-example>

프로퍼티 타입은 `ItemDetailComponent`에서 `@Input()`이 지정된 프로퍼티의 타입을 보면 확인할 수 있습니다:

<code-example path="property-binding/src/app/item-detail/item-detail.component.ts" region="input-type" header="src/app/item-detail/item-detail.component.ts (@Input() 프로퍼티의 타입)"></code-example>

그래서 `AppComponent`에 있는 `parentItem`도 타입에 맞게 문자열을 지정했습니다:

<code-example path="property-binding/src/app/app.component.ts" region="parent-data-type" header="src/app/app.component.ts"></code-example>


<!--
### Passing in an object
-->
### 객체 전달하기

<!--
The previous simple example showed passing in a string. To pass in an object,
the syntax and thinking are the same.

In this scenario, `ItemListComponent` is nested within `AppComponent` and the `items` property expects an array of objects.

<code-example path="property-binding/src/app/app.component.html" region="pass-object" header="src/app/app.component.html"></code-example>

The `items` property is declared in the `ItemListComponent` with a type of `Item` and decorated with `@Input()`:

<code-example path="property-binding/src/app/item-list/item-list.component.ts" region="item-input" header="src/app/item-list.component.ts"></code-example>

In this sample app, an `Item` is an object that has two properties; an `id` and a `name`.

<code-example path="property-binding/src/app/item.ts" region="item-class" header="src/app/item.ts"></code-example>

While a list of items exists in another file, `mock-items.ts`, you can
specify a different item in `app.component.ts` so that the new item will render:

<code-example path="property-binding/src/app/app.component.ts" region="pass-object" header="src/app.component.ts"></code-example>

You just have to make sure, in this case, that you're supplying an array of objects because that's the type of `Item` and is what the nested component, `ItemListComponent`, expects.

In this example, `AppComponent` specifies a different `item` object
(`currentItems`) and passes it to the nested `ItemListComponent`. `ItemListComponent` was able to use `currentItems` because it matches what an `Item` object is according to `item.ts`. The `item.ts` file is where
`ItemListComponent` gets its definition of an `item`.
-->
이전 예제에서는 간단하게 문자열을 전달하는 방법에 대해 알아봤습니다.
객체를 전달하는 경우에도 문법과 개념은 같습니다.

`AppComponent` 안에 있는 `ItemListComponent`의 `items` 프로퍼티에 객체의 배열을 할당해야 한다고 합시다.

<code-example path="property-binding/src/app/app.component.html" region="pass-object" header="src/app/app.component.html"></code-example>

`ItemListComponent`에 선언된 `items` 프로퍼티의 타입은 `Item` 배열이며 `@Input()` 데코레이터가 지정되어 있습니다:

<code-example path="property-binding/src/app/item-list/item-list.component.ts" region="item-input" header="src/app/item-list.component.ts"></code-example>

그리고 `Item` 객체에는 `id`, `name` 프로퍼티가 존재합니다.

<code-example path="property-binding/src/app/item.ts" region="item-class" header="src/app/item.ts"></code-example>

아이템의 목록은 `mock-items.ts` 파일에 따로 저장되어 있지만, 렌더링이 잘 되는지 확인하기 위해 `app.component.ts` 파일에 임시 데이터를 할당합시다:

<code-example path="property-binding/src/app/app.component.ts" region="pass-object" header="src/app.component.ts"></code-example>

이 경우에도 `ItemListComponent`로 프로퍼티 바인딩하는 타입이 `Item` 배열이기 때문에 정확한 타입이 지정되어야 합니다.

이렇게 작성하면 `AppComponent`에 있는 `currentItems` 프로퍼티의 값이 `ItemListComponent`로 전달됩니다.
그리고 `ItemListComponent`는 `items`로 받는 데이터의 타입이 `Item` 객체 배열이기 때문에 이 데이터를 받아서 활용할 수 있습니다.


<!--
## Remember the brackets
-->
## 대괄호를 빼먹지 마세요

<!--
The brackets, `[]`, tell Angular to evaluate the template expression.
If you omit the brackets, Angular treats the string as a constant
and *initializes the target property* with that string:

<code-example path="property-binding/src/app/app.component.html" region="no-evaluation" header="src/app.component.html"></code-example>


Omitting the brackets will render the string
`parentItem`, not the value of `parentItem`.
-->
Angular가 템플릿 표현식을 평가하려면 대괄호(`[]`)가 꼭 있어야 합니다.
대괄호를 빼먹으면 Angular는 해당 문자열을 문자열 상수로 평가하며, 바인딩된 프로퍼티에도 문자열 값을 할당합니다:

<code-example path="property-binding/src/app/app.component.html" region="no-evaluation" header="src/app.component.html"></code-example>

대괄호를 생략하면 `parentItem`의 값이 아니라 `parentItem`이라는 문자열이 렌더링됩니다.


<!--
## One-time string initialization
-->
## 문자열로 한 번만 초기화 할 때

<!--
You *should* omit the brackets when all of the following are true:

* The target property accepts a string value.
* The string is a fixed value that you can put directly into the template.
* This initial value never changes.

You routinely initialize attributes this way in standard HTML, and it works
just as well for directive and component property initialization.
The following example initializes the `prefix` property of the `StringInitComponent` to a fixed string,
not a template expression. Angular sets it and forgets about it.

<code-example path="property-binding/src/app/app.component.html" region="string-init" header="src/app/app.component.html"></code-example>

The `[item]` binding, on the other hand, remains a live binding to the component's `currentItems` property.
-->
다음과 같은 경우라면 대괄호를 생략하는 것이 좋습니다:

* 프로퍼티가 문자열 값을 받을 때
* 문자열은 고정된 값이며 템플릿에서 직접 할당할 때
* 이 값이 변경되지 않을 때

표준 HTML에서도 어트리뷰트는 이런 방식으로 할당했습니다.
그리고 이 방식은 디렉티브나 컴포넌트를 초기화할 때도 활용할 수 있습니다.
아래 예제에서 `StringInitComponent`에 있는 `prefix` 프로퍼티는 고정된 문자열이며 템플릿 표현식으로 평가될 필요도 없습니다.
그렇다면 이렇게 작성하면 됩니다.

<code-example path="property-binding/src/app/app.component.html" region="string-init" header="src/app/app.component.html"></code-example>

하지만 `[item]`의 경우에는 컴포넌트에 있는 `currentItems` 프로퍼티를 참조해야 하기 때문에 이렇게 작성할 수 없습니다.


<!--
## Property binding vs. interpolation
-->
## 프로퍼티 바인딩 vs. 문자열 바인딩

<!--
You often have a choice between interpolation and property binding.
The following binding pairs do the same thing:

<code-example path="property-binding/src/app/app.component.html" region="property-binding-interpolation" header="src/app/app.component.html"></code-example>

Interpolation is a convenient alternative to property binding in
many cases. When rendering data values as strings, there is no
technical reason to prefer one form to the other, though readability
tends to favor interpolation. However, *when setting an element
property to a non-string data value, you must use property binding*.
-->
개발을 하다보면 문자열 바인딩(interpolation)과 프로퍼티 바인딩 중에 어떤 것을 사용할지 결정해야 하는 경우가 있습니다.
이런 경우가 그렇습니다:

<code-example path="property-binding/src/app/app.component.html" region="property-binding-interpolation" header="src/app/app.component.html"></code-example>

대부분의 경우에 프로퍼티 바인딩보다 문자열 바인딩을 사용할 때 더 간단하게 해결됩니다.
데이터가 문자열 타입인 경우에 특히 그런 편이며, 문법 말고는 두 방식의 차이도 거의 없기 때문에 가독성이 좋은 방식을 선택하면 됩니다.
하지만 데이터가 문자열 타입이 아니라면 반드시 프로퍼티 바인딩을 사용해야 합니다.


<!--
## Content security
-->
## 보안

<!--
Imagine the following malicious content.

<code-example path="property-binding/src/app/app.component.ts" region="malicious-content" header="src/app/app.component.ts"></code-example>

In the component template, the content might be used with interpolation:

<code-example path="property-binding/src/app/app.component.html" region="malicious-interpolated" header="src/app/app.component.html"></code-example>

Fortunately, Angular data binding is on alert for dangerous HTML. In the above case,
the HTML displays as is, and the Javascript does not execute. Angular **does not**
allow HTML with script tags to leak into the browser, neither with interpolation
nor property binding.

In the following example, however, Angular [sanitizes](guide/security#sanitization-and-security-contexts)
the values before displaying them.

<code-example path="property-binding/src/app/app.component.html" region="malicious-content" header="src/app/app.component.html"></code-example>

Interpolation handles the `<script>` tags differently than
property binding but both approaches render the
content harmlessly. The following is the browser output
of the `evilTitle` examples.

<code-example language="bash">
"Template <script>alert("evil never sleeps")</script> Syntax" is the interpolated evil title.
"Template alert("evil never sleeps")Syntax" is the property bound evil title.
</code-example>
-->
다음과 같은 악성 코드가 있다고 합시다.

<code-example path="property-binding/src/app/app.component.ts" region="malicious-content" header="src/app/app.component.ts"></code-example>

그리고 이 코드는 컴포넌트 템플릿에 문자열 바인딩 되어 사용됩니다:

<code-example path="property-binding/src/app/app.component.html" region="malicious-interpolated" header="src/app/app.component.html"></code-example>

하지만 다행히도 Angular는 위험한 HTML을 발견하면 경고 메시지를 표시합니다.
위 예제에서 HTML 구문은 문자열 그대로 표시되며 JavaScript 코드도 실행되지 않습니다.
Angular는 브라우저의 취약점을 공격할 수 있는 스크립트 태그를 허용하지 않으며, 이 정책은 문자열 바인딩과 프로퍼티 바인딩 모두 해당됩니다.

하지만 [안전성 검사](guide/security#sanitization-and-security-contexts)를 거친 후라면 이 데이터를 템플릿에 활용할 수도 있습니다.

<code-example path="property-binding/src/app/app.component.html" region="malicious-content" header="src/app/app.component.html"></code-example>

문자열 바인딩과 프로퍼티 바인딩은 `<script>` 태그를 처리하는 방식이 조금 다르지만, 위험한 코드를 처리하는 방식은 비슷합니다.
위 예제 코드는 브라우저에 다음과 같이 일반 문자열로 표시됩니다.

<code-example language="bash">
"Template <script>alert("evil never sleeps")</script> Syntax" is the interpolated evil title.
"Template alert("evil never sleeps")Syntax" is the property bound evil title.
</code-example>
