<!--
# `@Input()` and `@Output()` properties
-->
# 입출력 프로퍼티 `@Input()`, `@Output()`

<!--
`@Input()` and `@Output()` allow Angular to share data between the parent context
and child directives or components. An `@Input()` property is writable
while an `@Output()` property is observable.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

Consider this example of a child/parent relationship:

```html
<parent-component>
  <child-component></child-component>
</parent-component>

```

Here, the `<child-component>` selector, or child directive, is embedded
within a `<parent-component>`, which serves as the child's context.

`@Input()` and `@Output()` act as
the API, or application programming interface, of the child
component in that they allow the child to
communicate with the parent. Think of `@Input()` and `@Output()` like ports
or doorways&mdash;`@Input()` is the doorway into the component allowing data
to flow in while `@Output()` is the doorway out of the component, allowing the
child component to send data out.
-->
`@Input()`과 `@Output()`을 활용하면 디렉티브나 컴포넌트가 부모 컨텍스트와 데이터를 주고받을 수 있습니다.
이 때 `@Input()`는 직접 값을 지정할 수 있는 타입의 프로퍼티에 선언하며, `@Output()` 프로퍼티는 옵저버블에 선언합니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

부모/자식 관계가 이렇게 구성되어 있다고 합시다:

```html
<parent-component>
  <child-component></child-component>
</parent-component>

```

이 예제 코드에서 `<child-component>`는 `<parent-component>` 안에 들어가 있기 때문에 자식 컴포넌트의 컨텍스트를 따로 구성한다고 볼 수 있습니다.

이 때 자식 컴포넌트 프로퍼티에 선언하는 `@Input()`과 `@Output()`은 자식 컴포넌트의 API(application programming interface)처럼 동작한다고 볼 수 있습니다.
`@Input()`은 자식 컴포넌트로 데이터가 들어오는 통로이며, `@Output()`은 자식 컴포넌트 밖으로 데이터가 나가는 통로라고 이해해도 됩니다.


<!--
<div class="alert is-helpful">

#### `@Input()` and `@Output()` are independent

Though `@Input()` and `@Output()` often appear together in apps, you can use
them separately. If the nested
component is such that it only needs to send data to its parent, you wouldn't
need an `@Input()`, only an `@Output()`. The reverse is also true in that if the
child only needs to receive data from the parent, you'd only need `@Input()`.

</div>
-->
<div class="alert is-helpful">

#### `@Input()`과 `@Output()`는 독립적으로 동작합니다.

`@Input()`과 `@Output()`이 컴포넌트 클래스에 함께 사용되는 경우도 종종 있지만, 두 데코레이터는 온전히 별개입니다.
자식 컴포넌트로 데이터가 이동하지 않는다면 `@Input()`이 필요없으며, 자식 컴포넌트가 데이터를 받기만 하고 부모 컴포넌트로 보내지 않는다면 `@Output()` 없이 `@Input()`만 있으면 됩니다.

</div>


{@a input}

<!--
## How to use `@Input()`
-->
## `@Input()` 사용방법

<!--
Use the `@Input()` decorator in a child component or directive to let Angular know
that a property in that component can receive its value from its parent component.
It helps to remember that the data flow is from the perspective of the
child component. So an `@Input()` allows data to be input _into_ the
child component from the parent component.


<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input.svg" alt="Input data flow diagram">
</div>

To illustrate the use of `@Input()`, edit these parts of your app:

* The child component class and template
* The parent component class and template
-->
자식 디렉티브/컴포넌트 프로퍼티에 `@Input()`을 지정하면 해당 프로퍼티 값을 부모 컴포넌트에서 받을 수 있습니다.
이 때 데이터가 이동하는 방향은 부모 컴포넌트에서 자식 컴포넌트로 향하는 방향입니다.
간단하게 이야기하면 `@Input()` 데코레이터는 부모 컴포넌트에서 자식 컴포넌트로 이동하는 데이터 통로를 여는 역할을 합니다.


<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input.svg" alt="Input data flow diagram">
</div>

`@Input()`이 동작하는 것을 확인하기 위해 다음 코드를 수정해 봅시다:

* 자식 컴포넌트 클래스와 템플릿
* 부모 컴포넌트 클래스와 템플릿


<!--
### In the child
-->
### 자식 컴포넌트에서

<!--
To use the `@Input()` decorator in a child component class, first import
`Input` and then decorate the property with `@Input()`:

<code-example path="inputs-outputs/src/app/item-detail/item-detail.component.ts" region="use-input" header="src/app/item-detail/item-detail.component.ts"></code-example>


In this case, `@Input()` decorates the property <code class="no-auto-link">item</code>, which has
a type of `string`, however, `@Input()` properties can have any type, such as
`number`, `string`, `boolean`, or `object`. The value for `item` will come from the parent component, which the next section covers.

Next, in the child component template, add the following:

<code-example path="inputs-outputs/src/app/item-detail/item-detail.component.html" region="property-in-template" header="src/app/item-detail/item-detail.component.html"></code-example>
-->
자식 컴포넌트 클래스에 `@Input()` 데코레이터를 사용하려면 먼저 `Input` 심볼을 로드해서 프로퍼티에 지정해야 합니다:

<code-example path="inputs-outputs/src/app/item-detail/item-detail.component.ts" region="use-input" header="src/app/item-detail/item-detail.component.ts"></code-example>

이렇게 작성하면 `@Input()` 데코레이터는 `string` 타입으로 선언된 <code class="no-auto-link">item</code> 프로퍼티를 입력 프로퍼티로 지정합니다.
이 때 `@Input()` 데코레이터는 `number`, `string`, `boolean`, `object` 등 다양한 타입의 프로퍼티에 지정할 수 있습니다.
이제 `item` 프로퍼티의 값은 부모 컴포넌트에서 전달됩니다.
이 내용은 다음 섹션에서 확인해 봅시다.

자식 컴포넌트 템플릿에는 이런 코드를 추가합니다:

<code-example path="inputs-outputs/src/app/item-detail/item-detail.component.html" region="property-in-template" header="src/app/item-detail/item-detail.component.html"></code-example>


<!--
### In the parent
-->
### 부모 컴포넌트에서

<!--
The next step is to bind the property in the parent component's template.
In this example, the parent component template is `app.component.html`.

First, use the child's selector, here `<app-item-detail>`, as a directive within the
parent component template. Then, use [property binding](guide/property-binding)
to bind the property in the child to the property of the parent.

<code-example path="inputs-outputs/src/app/app.component.html" region="input-parent" header="src/app/app.component.html"></code-example>

Next, in the parent component class, `app.component.ts`, designate a value for `currentItem`:

<code-example path="inputs-outputs/src/app/app.component.ts" region="parent-property" header="src/app/app.component.ts"></code-example>

With `@Input()`, Angular passes the value for `currentItem` to the child so that `item` renders as `Television`.

The following diagram shows this structure:

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input-diagram-target-source.svg" alt="Property binding diagram">
</div>

The target in the square brackets, `[]`, is the property you decorate
with `@Input()` in the child component. The binding source, the part
to the right of the equal sign, is the data that the parent
component passes to the nested component.

The key takeaway is that when binding to a child component's property in a parent component&mdash;that is, what's
in square brackets&mdash;you must
decorate the property with `@Input()` in the child component.
-->
이제 프로퍼티를 바인딩하기 위해 부모 컴포넌트 템플릿을 수정합시다.
이 문서에서 다루는 예제에서 부모 컴포넌트 템플릿은 `app.component.html` 입니다.

먼저, 자식 컴포넌트 셀렉터 `<app-item-detail>`를 부모 컴포넌트 템플릿에 추가하고, 자식 컴포넌트의 프로퍼티를 자식 컴포넌트에 [프로퍼티 바인딩](guide/property-binding)으로 연결합니다.

<code-example path="inputs-outputs/src/app/app.component.html" region="input-parent" header="src/app/app.component.html"></code-example>

그리고 부모 컴포넌트 클래스 `app.component.ts` 파일에 `currentItem` 프로퍼티를 선언합니다:

<code-example path="inputs-outputs/src/app/app.component.ts" region="parent-property" header="src/app/app.component.ts"></code-example>

`@Input()` 데코레이터를 사용하면 부모 컴포넌트에 있는 `currentItem` 프로퍼티 값이 자식 컴포넌트 `item` 프로퍼티로 전달되기 때문에, `item` 프로퍼티의 값은 `Television`이 됩니다.

아래 그림을 보면서 이 데코레이터가 어떻게 연결되는지 확인해 보세요:

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input-diagram-target-source.svg" alt="Property binding diagram">
</div>

바인딩 대상은 대괄호(`[]`) 안에 있는 프로퍼티이며, 이 프로퍼티는 자식 컴포넌트에서 `@Input()`이 지정된 프로퍼티입니다.
그리고 바인딩되어 값이 전달되는 소스는 등호(`=`) 오른쪽에 지정하며, 이 예제에서는 부모 컴포넌트에 있는 `currentItem` 프로퍼티입니다.

이 문법에서 중요한 것은 부모 컴포넌트에 있는 프로퍼티를 자식 컴포넌트 프로퍼티로 바인딩한다는 것입니다.
그래서 자식 컴포넌트에서 값을 받는 프로퍼티에는 반드시 `@Input()` 데코레이터가 지정되어 있어야 합니다.


<!--
<div class="alert is-helpful">

### `OnChanges` and `@Input()`

To watch for changes on an `@Input()` property, use
`OnChanges`, one of Angular's [lifecycle hooks](guide/lifecycle-hooks#onchanges).
`OnChanges` is specifically designed to work with properties that have the
`@Input()` decorator. See the [`OnChanges`](guide/lifecycle-hooks#onchanges) section of the [Lifecycle Hooks](guide/lifecycle-hooks) guide for more details and examples.

</div>
-->
<div class="alert is-helpful">

### `OnChanges`와 `@Input()`

`@Input()` 데코레이터가 지정된 프로퍼티 값이 변경되는 것을 감지하려면 Angular [라이프싸이클 후킹 메서드](guide/lifecycle-hooks#onchanges) `OnChanges`를 활용하면 됩니다.
특히 `OnChanges` 라이프싸이클 후킹 메서드는 `@Input()` 데코레이터가 지정된 프로퍼티에 적합하게 설계되었습니다.
자세한 내용은 [라이프싸이클 후킹 메서드](guide/lifecycle-hooks) 문서의 [`OnChanges`](guide/lifecycle-hooks#onchanges) 섹션을 참고하세요.

</div>


{@a output}
{@a how-to-use-output}

<!--
## How to use `@Output()`
-->
## `@Output()` 사용방법

<!--
Use the `@Output()` decorator in the child component or directive to allow data to flow from
the child _out_ to the parent.

An `@Output()` property should normally be initialized to an Angular [`EventEmitter`](api/core/EventEmitter) with values flowing out of the component as [events](guide/event-binding).


<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/output.svg" alt="Output diagram">
</div>

Just like with `@Input()`, you can use `@Output()`
on a property of the child component but its type should be
`EventEmitter`.

`@Output()` marks a property in a child component as a doorway
through which data can travel from the child to the parent.
The child component then has to raise an event so the
parent knows something has changed. To raise an event,
`@Output()` works hand in hand with `EventEmitter`,
which is a class in `@angular/core` that you
use to emit custom events.

When you use `@Output()`, edit these parts of your app:

* The child component class and template
* The parent component class and template


The following example shows how to set up an `@Output()` in a child
component that pushes data you enter in an HTML `<input>` to an array in the
parent component.

<div class="alert is-helpful">

The HTML element `<input>` and the Angular decorator `@Input()`
are different. This documentation is about component communication in Angular as it pertains to `@Input()` and `@Output()`. For more information on the HTML element `<input>`, see the [W3C Recommendation](https://www.w3.org/TR/html5/sec-forms.html#the-input-element).

</div>
-->
자식 컴포넌트 프로퍼티나 자식 디렉티브 프로퍼티에 `@Output()` 데코레이터를 지정하면 자식 컴포넌트에서 부모 컴포넌트로 데이터를 전달할 수 있습니다.

`@Output()` 프로퍼티는 Angular [`EventEmitter`](api/core/EventEmitter) 클래스 타입에 지정합니다.
이 클래스는 Angular 애플리케이션에서 [이벤트](guide/event-binding)를 표현하는 클래스이며 `@angular/core` 패키지에 정의되어 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/output.svg" alt="Output diagram">
</div>

`@Input()`과 마찬가지로, `@Output()` 데코레이터도 자식 컴포넌트 프로퍼티에 지정하는데, 이 프로퍼티는 반드시 `EventEmitter` 타입이어야 합니다.

`@Output()` 데코레이터는 자식 컴포넌트에서 부모 컴포넌트로 데이터를 전달하는 프로퍼티를 선언하는 역할을 한다고도 볼 수 있습니다.
부모 컴포넌트가 자식 컴포넌트에서 일어나는 일을 알려면 자식 컴포넌트에서 이벤트를 발생시켜야 합니다.
그리고 자식 컴포넌트에서 이벤트를 발생시키려면 `@Output()` 데코레이터가 지정된 `EventEmitter` 객체를 활용하면 됩니다.

`@Output()`이 동작하는 것을 확인하기 위해 다음 코드를 수정해 봅시다:

* 자식 컴포넌트 클래스와 템플릿
* 부모 컴포넌트 클래스와 템플릿

이제부터 살펴볼 예제는 자식 컴포넌트에 있는 HTML `<input>`에 입력된 문자열을 부모 컴포넌트로 보내 부모 컴포넌트 배열에 추가하는 예제입니다.

<div class="alert is-helpful">

HTML 엘리먼트 `<input>`과 Angular 데코레이터 `@Input()`은 엄연히 다릅니다.
이 문서는 Angular에서 자식 컴포넌트와 부모 컴포넌트가 데이터를 주고 받을 때 사용하는 `@Input()`, `@Output()` 데코레이터에 대해 다룹니다.
HTML `<input>` 엘리먼트에 대해 자세하게 알아보려면 [W3C 권장안](https://www.w3.org/TR/html5/sec-forms.html#the-input-element)을 확인하세요.

</div>


<!--
## In the child
-->
### 자식 컴포넌트에서

<!--
This example features an `<input>` where a user can enter a value and click a `<button>` that raises an event. The `EventEmitter` then relays the data to the parent component.

First, be sure to import `Output` and `EventEmitter`
in the child component class:

```js
import { Output, EventEmitter } from '@angular/core';

```

Next, still in the child, decorate a property with `@Output()` in the component class.
The following example `@Output()` is called `newItemEvent` and its type is
`EventEmitter`, which means it's an event.


<code-example path="inputs-outputs/src/app/item-output/item-output.component.ts" region="item-output" header="src/app/item-output/item-output.component.ts"></code-example>

The different parts of the above declaration are as follows:

* `@Output()`&mdash;a decorator function marking the property as a way for data to go from the child to the parent
* `newItemEvent`&mdash;the name of the `@Output()`
* `EventEmitter<string>`&mdash;the `@Output()`'s type
* `new EventEmitter<string>()`&mdash;tells Angular to create a new event emitter and that the data it emits is of type string. The type could be any type, such as `number`, `boolean`, and so on. For more information on `EventEmitter`, see the [EventEmitter API documentation](api/core/EventEmitter).

Next, create an `addNewItem()` method in the same component class:

<code-example path="inputs-outputs/src/app/item-output/item-output.component.ts" region="item-output-class" header="src/app/item-output/item-output.component.ts"></code-example>

The `addNewItem()` function uses the `@Output()`, `newItemEvent`,
to raise an event in which it emits the value the user
types into the `<input>`. In other words, when
the user clicks the add button in the UI, the child lets the parent know
about the event and gives that data to the parent.
-->
예제 앱에서 사용자가 `<input>`에 값을 입력하고 `<button>`을 클릭하면 이벤트가 발생합니다.
데이터는 `EventEmitter`에 실어서 부모 컴포넌트로 전달해 봅시다.

먼저, 자식 컴포넌트 클래스 파일에서 `Output` 심볼과 `EventEmitter` 심볼을 로드합니다:

```js
import { Output, EventEmitter } from '@angular/core';

```

그리고 자식 컴포넌트 클래스 프로퍼티에 `@Output()` 데코레이터를 지정합니다.
이 예제에서는 `newItemEvent`에 `@Output()` 데코레이터를 붙이는데, 이 프로퍼티는 이벤트를 표현하기 위해 `EventEmitter` 타입이어야 합니다.

<code-example path="inputs-outputs/src/app/item-output/item-output.component.ts" region="item-output" header="src/app/item-output/item-output.component.ts"></code-example>

위에서 작성했던 예제와는 이런 부분이 다릅니다:

* `@Output()` &mdash; 자식 컴포넌트에서 부모 컴포넌트로 데이터를 전달하는 프로퍼티를 지정하는 데코레이터입니다.
* `newItemEvent` &mdash; `@Output()` 데코레이터의 이름입니다.
* `EventEmitter<string>` &mdash; `@Output()` 데코레이터가 지정된 프로퍼티의 타입입니다.
* `new EventEmitter<string>()` &mdash; `EventEmitter` 인스턴스를 새로 생성하면서 이 인스턴스로 전달되는 데이터 타입이 문자열이라는 것을 의미합니다. 부모 컴포넌트로 전달하는 데이터 타입은 `string` 뿐 아니라 `number`나 `boolean` 타입도 사용할 수 있습니다. `EventEmitter`에 대해 자세하게 알아보려면 [EventEmitter API 문서](api/core/EventEmitter)를 참고하세요.

그리고 자식 컴포넌트 클래스에 `addNewItem()` 메서드를 추가합니다:

<code-example path="inputs-outputs/src/app/item-output/item-output.component.ts" region="item-output-class" header="src/app/item-output/item-output.component.ts"></code-example>

`addNewItem()` 함수는 `@Output()` 데코레이터가 지정된 `newItemEvent` 프로퍼티를 활용해서 이벤트를 발생시키는데, 이 때 사용자가 `<input>` 엘리먼트에 입력한 문자열을 데이터로 함께 전달합니다.
다르게 설명하면, 사용자가 화면에 있는 추가 버튼을 누르면 부모 컴포넌트가 알 수 있도록 자식 컴포넌트가 이벤트를 발생시키며, 이 때 데이터를 이벤트 객체에 담아 전달합니다.


<!--
### In the child's template
-->
#### 자식 컴포넌트 템플릿에서

<!--
The child's template has two controls. The first is an HTML `<input>` with a
[template reference variable](guide/template-reference-variables) , `#newItem`,
where the user types in an item name. Whatever the user types
into the `<input>` gets stored in the `#newItem` variable.

<code-example path="inputs-outputs/src/app/item-output/item-output.component.html" region="child-output" header="src/app/item-output/item-output.component.html"></code-example>

The second element is a `<button>`
with an [event binding](guide/event-binding). You know it's
an event binding because the part to the left of the equal
sign is in parentheses, `(click)`.

The `(click)` event is bound to the `addNewItem()` method in the child component class which
takes as its argument whatever the value of `#newItem` is.

Now the child component has an `@Output()`
for sending data to the parent and a method for raising an event.
The next step is in the parent.
-->
자식 컴포넌트에는 폼 컨트롤이 2개 있습니다.
첫번째는 [템플릿 참조 변수(template reference variable)](guide/template-reference-variables) `#newItem`이 지정된 HTML `<input>` 엘리먼트이며, 사용자는 이 엘리먼트에 새 아이템 이름을 입력합니다.
사용자가 `<input>` 엘리먼트에 입력한 값은 `#newItem` 변수의 `value` 프로퍼티로 참조할 수 있습니다.

<code-example path="inputs-outputs/src/app/item-output/item-output.component.html" region="child-output" header="src/app/item-output/item-output.component.html"></code-example>

두번째 엘리먼트는 [이벤트 바인딩](guide/event-binding)으로 연결된 `<button>` 엘리먼트입니다.
이 엘리먼트에는 `(click)` 이라는 문법이 사용되었기 때문에 이벤트 바인딩이 사용되었다는 것을 쉽게 알 수 있습니다.

`(click)` 이벤트는 자식 컴포넌트 클래스에 있는 `addNewItem()` 메서드와 바인딩되어 있는데, 이 메서드를 실행할 때 `#newItem.value` 프로퍼티를 참조해서 `<input>` 엘리먼트에 입력된 값을 인자로 전달합니다.

지금까지 자식 컴포넌트에 `@Output()` 데코레이터를 적용해 봤습니다.
이제 부모 컴포넌트를 수정해 봅시다.


<!--
## In the parent
-->
### 부모 컴포넌트에서

<!--
In this example, the parent component is `AppComponent`, but you could use
any component in which you could nest the child.

The `AppComponent` in this example features a list of `items`
in an array and a method for adding more items to the array.

<code-example path="inputs-outputs/src/app/app.component.ts" region="add-new-item" header="src/app/app.component.ts"></code-example>

The `addItem()` method takes an argument in the form of a string
and then pushes, or adds, that string to the `items` array.
-->
이 예제에서 부모 컴포넌트는 `AppComponent`지만, 자식 컴포넌트가 존재한다면 어떤 컴포넌트라도 부모 컴포넌트가 될 수 있습니다.

`AppComponent`에는 아이템을 배열 형태로 관리하기 위해 `items` 프로퍼티가 선언되어 있습니다.

<code-example path="inputs-outputs/src/app/app.component.ts" region="add-new-item" header="src/app/app.component.ts"></code-example>

그리고 `addItem()` 메서드는 문자열 타입 인자를 받아서 `items` 배열에 추가합니다.


<!--
### In the parent's template
-->
#### 부모 컴포넌트 템플릿에서

<!--
Next, in the parent's template, bind the parent's
method to the child's event. Put the child selector, here `<app-item-output>`,
within the parent component's
template, `app.component.html`.

<code-example path="inputs-outputs/src/app/app.component.html" region="output-parent" header="src/app/app.component.html"></code-example>

The event binding, `(newItemEvent)='addItem($event)'`, tells
Angular to connect the event in the child, `newItemEvent`, to
the method in the parent, `addItem()`, and that the event that the child
is notifying the parent about is to be the argument of `addItem()`.
In other words, this is where the actual hand off of data takes place.
The `$event` contains the data that the user types into the `<input>`
in the child template UI.

Now, in order to see the `@Output()` working, add the following to the parent's template:

```html
  <ul>
    <li *ngFor="let item of items">{{item}}</li>
  </ul>
  ```

The `*ngFor` iterates over the items in the `items` array. When you enter a value in the child's `<input>` and click the button, the child emits the event and the parent's `addItem()` method pushes the value to the `items` array and it renders in the list.
-->
이제 자식 컴포넌트에서 발생하는 이벤트를 부모 컴포넌트 메서드와 바인딩하기 위해 부모 컴포넌트 템플릿을 수정해 봅시다.
부모 컴포넌트 템플릿 파일 `app.component.html`에 자식 컴포넌트 셀렉터 `<app-item-output>`을 추가합니다.

<code-example path="inputs-outputs/src/app/app.component.html" region="output-parent" header="src/app/app.component.html"></code-example>

이벤트 바인딩 문법을 `(newItemEvent)='addItem($event)'`라고 작성하면 자식 컴포넌트에서 `newItemEvent` 이벤트가 발생했을 때 부모 컴포넌트 메서드 `addItem()`가 실행되면서 문자열 타입의 데이터가 함께 전달됩니다.
딱 이 시점이 데이터가 실제로 전달되는 순간입니다.
`$event` 객체에는 사용자가 자식 컴포넌트 템플릿에 있는 `<input>` 엘리먼트에 입력한 값이 전달됩니다.

이제 `@Output()`이 동작하는 것을 확인하기 위해 부모 컴포넌트 템플릿에 다음 코드를 추가합니다:

```html
  <ul>
    <li *ngFor="let item of items">{{item}}</li>
  </ul>
  ```

`*ngFor`는 `items` 배열을 순회하는 이터레이터입니다.
이제 자식 컴포넌트에 있는 `<input>` 엘리먼트에 값을 입력하고 버튼을 클릭하면, 자식 컴포넌트에서 이벤트가 발생하면서 부모 컴포넌트에 있는 `addItem()` 메서드를 실행하고, 이 메서드에 작성된 로직에 따라 인자로 받은 문자열을 `items` 배열에 추가하면서 화면에 표시됩니다.


<!--
## `@Input()` and `@Output()` together
-->
## `@Input()`, `@Output()` 함께 사용하기

<!--
You can use `@Input()` and `@Output()` on the same child component as in the following:

<code-example path="inputs-outputs/src/app/app.component.html" region="together" header="src/app/app.component.html"></code-example>

The target, `item`, which is an `@Input()` property in the child component class, receives its value from the parent's property, `currentItem`. When you click delete, the child component raises an event, `deleteRequest`, which is the argument for the parent's `crossOffItem()` method.

The following diagram is of an `@Input()` and an `@Output()` on the same
child component and shows the different parts of each:

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input-output-diagram.svg" alt="Input/Output diagram">
</div>

As the diagram shows, use inputs and outputs together in the same manner as using them separately. Here, the child selector is `<app-input-output>` with `item` and `deleteRequest` being `@Input()` and `@Output()`
properties in the child component class. The property `currentItem` and the method `crossOffItem()` are both in the parent component class.

To combine property and event bindings using the banana-in-a-box
syntax, `[()]`, see [Two-way Binding](guide/two-way-binding).
-->
`@Input()` 데코레이터와 `@Output()` 데코레이터는 다음과 같이 함께 사용할 수도 있습니다:

<code-example path="inputs-outputs/src/app/app.component.html" region="together" header="src/app/app.component.html"></code-example>

`@Input()` 데코레이터가 지정되는 대상은 자식 컴포넌트 클래스에 있는 `item` 프로퍼티이며, 이 프로퍼티는 부모 컴포넌트의 `currentItem` 프로퍼티에서 값을 받아옵니다.
그리고 사용자가 삭제 버튼을 클릭하면 자식 컴포넌트에서 `deleteRequest` 이벤트가 발생하는데, 이 프로퍼티에는 `@Output()` 데코레이터가 지정되어 있기 때문에 부모 컴포넌트의 `crossOffItem()` 메서드를 실행합니다.

아래 그림을 보면서 `@Input()`과 `@Output()`이 각각 어떻게 연결되는지 확인해 보세요:

<div class="lightbox">
  <img src="generated/images/guide/inputs-outputs/input-output-diagram.svg" alt="Input/Output diagram">
</div>

다이어그램에서 확인할 수 있듯이 `@Input()`과 `@Output()`을 함께 사용하더라도 각각 사용했을 때와 똑같이 사용하면 됩니다.
이 예제에서 자식 컴포넌트 셀렉터는 `<app-input-output>` 이며, 이 태그의 `item`과 `deleteRequest`는 각각 `@Input()`과 `@Output()`이 지정된 프로퍼티입니다.
이 프로퍼티들은 각각 부모 컴포넌트 클래스의 `currentItem` 프로퍼티와 `crossOffItem()` 메서드와 바인딩되었습니다.

프로퍼티 바인딩과 이벤트 바인딩을 동시에 하려면 상자 안에 있는 바나나 문법, `[()]`를 사용하면 됩니다.
자세한 내용은 [양방향 바인딩(Two-way Binding)](guide/two-way-binding) 문서를 참고하세요.


<!--
## `@Input()` and `@Output()` declarations
-->
## 메타데이터에서 `@Input()`, `@Output()` 선언하기

<!--
Instead of using the `@Input()` and `@Output()` decorators
to declare inputs and outputs, you can identify
members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:

<code-example path="inputs-outputs/src/app/in-the-metadata/in-the-metadata.component.ts" region="metadata" header="src/app/in-the-metadata/in-the-metadata.component.ts"></code-example>

While declaring `inputs` and `outputs` in the `@Directive` and `@Component`
metadata is possible, it is a better practice to use the `@Input()` and `@Output()`
class decorators instead, as follows:

<code-example path="inputs-outputs/src/app/input-output/input-output.component.ts" region="input-output" header="src/app/input-output/input-output.component.ts"></code-example>

See the [Decorate input and output properties](guide/styleguide#decorate-input-and-output-properties) section of the
[Style Guide](guide/styleguide) for details.



<div class="alert is-helpful">

If you get a template parse error when trying to use inputs or outputs, but you know that the
properties do indeed exist, double check
that your properties are annotated with `@Input()` / `@Output()` or that you've declared
them in an `inputs`/`outputs` array:

<code-example language="bash">
Uncaught Error: Template parse errors:
Can't bind to 'item' since it isn't a known property of 'app-item-detail'
</code-example>

</div>
-->
입출력 프로퍼티를 지정하기 위해 `@Input()`, `@Output()` 데코레이터를 사용하는 대신, 디렉티브 메타데이터의 `inputs`, `outputs` 배열을 활용해도 같은 효과를 낼 수 있습니다:

<code-example path="inputs-outputs/src/app/in-the-metadata/in-the-metadata.component.ts" region="metadata" header="src/app/in-the-metadata/in-the-metadata.component.ts"></code-example>

이렇게 `@Directive`, `@Component` 메타데이터를 활용해도 입출력 프로퍼티를 지정할 수 있지만, 다음과 같이 클래스 코드에서 `@Input()`, `@Output()`을 지정하는 방식을 더 권장합니다:

<code-example path="inputs-outputs/src/app/input-output/input-output.component.ts" region="input-output" header="src/app/input-output/input-output.component.ts"></code-example>

[코딩 스타일 가이드](guide/styleguide) 문서의 [입출력 프로퍼티 지정하기](guide/styleguide#decorate-input-and-output-properties) 섹션을 참고해 보세요.



<div class="alert is-helpful">

입출력 프로퍼티를 지정했을 때 템플릿에서 파싱 오류가 발생한다면 컴포넌트에 해당 프로퍼티가 존재하는지 확인해 보세요.
입출력 프로퍼티는 `@Input()`/`@Output()` 으로 지정하는 방식과 `inputs`/`outputs` 배열로 지정하는 방식 모두 가능하니 양쪽 모두 확인해야 합니다:

<code-example language="bash">
Uncaught Error: Template parse errors:
Can't bind to 'item' since it isn't a known property of 'app-item-detail'
</code-example>

</div>


{@a aliasing-io}

<!--
## Aliasing inputs and outputs
-->
## 입출력 프로퍼티를 다른 이름으로 사용하기

<!--
Sometimes the public name of an input/output property should be different from the internal name. While it is a best practice to avoid this situation, Angular does
offer a solution.
-->
입출력 프로퍼티의 이름을 자식 컴포넌트와 부모 컴포넌트에서 다르게 사용해야 할 때가 있습니다.
권장하지는 않지만 이렇게 사용하는 방법에 대해 알아봅시다.

<!--
### Aliasing in the metadata
-->
### 메타데이터에서 지정하기

<!--
Alias inputs and outputs in the metadata using a colon-delimited (`:`) string with
the directive property name on the left and the public alias on the right:

<code-example path="inputs-outputs/src/app/aliasing/aliasing.component.ts" region="alias" header="src/app/aliasing/aliasing.component.ts"></code-example>
-->
메타데이터에서 입출력 프로퍼티의 다른 이름을 지정하려면 디렉티브 프로퍼티 이름 오른쪽에 콜론(`:`)을 붙이고 원하는 이름을 지정하면 됩니다:

<code-example path="inputs-outputs/src/app/aliasing/aliasing.component.ts" region="alias" header="src/app/aliasing/aliasing.component.ts"></code-example>


<!--
### Aliasing with the `@Input()`/`@Output()` decorator
-->
### 데코레이터에서 지정하기

<!--
You can specify the alias for the property name by passing the alias name to the `@Input()`/`@Output()` decorator. The internal name remains as usual.

<code-example path="inputs-outputs/src/app/aliasing/aliasing.component.ts" region="alias-input-output" header="src/app/aliasing/aliasing.component.ts"></code-example>
-->
데코레이터에서 입출력 프로퍼티의 다른 이름을 지정하려면 `@Input()`/`@Output()` 데코레이터 안에 원하는 이름을 지정하면 됩니다.

<code-example path="inputs-outputs/src/app/aliasing/aliasing.component.ts" region="alias-input-output" header="src/app/aliasing/aliasing.component.ts"></code-example>
