<!--
# Binding syntax: an overview
-->
# 바인딩 문법

<!--
Data-binding is a mechanism for coordinating what users see, specifically
with application data values.
While you could push values to and pull values from HTML,
the application is easier to write, read, and maintain if you turn these tasks over to a binding framework.
You simply declare bindings between binding sources, target HTML elements, and let the framework do the rest.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

Angular provides many kinds of data-binding. Binding types can be grouped into three categories distinguished by the direction of data flow:

* From the _source-to-view_
* From _view-to-source_
* Two-way sequence: _view-to-source-to-view_
-->
데이터 바인딩은 애플리케이션 데이터를 사용자가 볼 수 있도록 연결하는 것을 의미합니다.
이렇게 연결된 데이터를 HTML에서 수정하면 이 데이터가 애플리케이션에 자동으로 전달되기 때문에 데이터를 관리하기 편합니다.
프레임워크가 데이터를 관리할 수 있도록 바인딩 대상과 소스를 연결하기만 하면 됩니다.

<div class="alert is-helpful">

이 문서에서 설명하는 내용은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

Angular는 데이터 바인딩을 여러가지 방식으로 제공합니다.
데이터가 이동하는 방향으로 구분해보면 이렇습니다:

* _소스에서 화면으로_
* _화면에서 소스로_
* 양방향(two-way)으로: _화면에서 소스로, 소스에서 화면으로_


<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="30%">
  </col>
  <col width="50%">
  </col>
  <col width="20%">
  </col>
  <tr>
    <th>
      <!--
      Type
      -->
      타입
    </th>
    <th>
      <!--
      Syntax
      -->
      문법
    </th>
    <th>
      <!--
      Category
      -->
      종류
    </th>

  </tr>
  <tr>
     <td>
      <!--
      Interpolation<br>
      Property<br>
      Attribute<br>
      Class<br>
      Style
      -->
      문자열 바인딩<br>
      프로퍼티 바인딩<br>
      어트리뷰트 바인딩<br>
      클래스 바인딩<br>
      스타일 바인딩
    </td>
    <td>

      <code-example>
        {{expression}}
        [target]="expression"
        bind-target="expression"
      </code-example>

    </td>

    <td>
      <!--
      One-way<br>from data source<br>to view target
      -->
      단방향<br>데이터 소스에서 화면으로
    </td>
    <tr>
      <td>
        <!--
        Event
        -->
        이벤트
      </td>
      <td>
        <code-example>
          (target)="statement"
          on-target="statement"
        </code-example>
      </td>

      <td>
        <!--
        One-way<br>from view target<br>to data source
        -->
        단방향<br>화면에서 데이터 소스로
      </td>
    </tr>
    <tr>
      <td>
        <!--
        Two-way
        -->
        양방향(two-way)
      </td>
      <td>
        <code-example>
          [(target)]="expression"
          bindon-target="expression"
        </code-example>
      </td>
      <td>
        <!--
        Two-way
        -->
        양방향
      </td>
    </tr>
  </tr>
</table>

<!--
Binding types other than interpolation have a **target name** to the left of the equal sign, either surrounded by punctuation, `[]` or `()`,
or preceded by a prefix: `bind-`, `on-`, `bindon-`.

The *target* of a binding is the property or event inside the binding punctuation: `[]`, `()` or `[()]`.

Every public member of a **source** directive is automatically available for binding.
You don't have to do anything special to access a directive member in a template expression or statement.
-->
문자열 바인딩을 제외한 다른 바인딩 문법은 등호(`=`) 왼쪽에 **바인딩 대상**을 대괄호(`[]`)나 소괄호(`()`)로 지정하는 문법으로 작성합니다.
이 방법 대신 `bind-`, `on-`, `bindon-` 접두사를 활용하는 방법도 있습니다.

이 때 실제로 바인딩되는 대상은 괄호(`[]`, `()`, `[()]`) 안에 있는 프로퍼티나 이벤트입니다.

소스 디렉티브의 모든 public 멤버는 바인딩할 수 있습니다.
특별히 뭔가 설정해주지 않아도 바인딩할 수 있도록 프레임워크가 자동으로 지원합니다.


<!--
### Data-binding and HTML
-->
### 데이터 바인딩과 HTML

<!--
In the normal course of HTML development, you create a visual structure with HTML elements, and
you modify those elements by setting element attributes with string constants.

```html
<div class="special">Plain old HTML</div>
<img src="images/item.png">
<button disabled>Save</button>
```

With data-binding, you can control things like the state of a button:

<code-example path="binding-syntax/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Notice that the binding is to the `disabled` property of the button's DOM element,
**not** the attribute. This applies to data-binding in general. Data-binding works with *properties* of DOM elements, components, and directives, not HTML *attributes*.
-->
일반적으로 HTML을 작성할 때는 HTML 엘리먼트로 시각적인 구조를 구성하며 엘리먼트에 문자열로 어트리뷰트를 설정하는 방식으로 조작합니다.

```html
<div class="special">Plain old HTML</div>
<img src="images/item.png">
<button disabled>Save</button>
```

이 때 데이터 바인딩을 사용하면 버튼의 상태를 이렇게 조작할 수 있습니다:

<code-example path="binding-syntax/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

주의해야 할 점은, 이 때 바인딩된 `disabled` 프로퍼티는 어트리뷰트가 **아니라** 버튼 DOM 엘리먼트의 프로퍼티라는 것입니다.
데이터 바인딩은 이런식으로 동작합니다.
데이터 바인딩은 DOM 엘리먼트, 컴포넌트, 디렉티브의 *프로퍼티*를 바인딩합니다.
HTML *어트리뷰트*를 바인딩하는 것이 아닙니다.


{@a html-attribute-vs-dom-property}

<!--
### HTML attribute vs. DOM property
-->
### HTML 어트리뷰트 vs. DOM 프로퍼티

<!--
The distinction between an HTML attribute and a DOM property is key to understanding
how Angular binding works. **Attributes are defined by HTML. Properties are accessed from DOM (Document Object Model) nodes.**

* A few HTML attributes have 1:1 mapping to properties; for example, `id`.

* Some HTML attributes don't have corresponding properties; for example, `aria-*`.

* Some DOM properties don't have corresponding attributes; for example, `textContent`.

It is important to remember that *HTML attribute* and the *DOM property* are different things, even when they have the same name.
In Angular, the only role of HTML attributes is to initialize element and directive state.

**Template binding works with *properties* and *events*, not *attributes*.**

When you write a data-binding, you're dealing exclusively with the *DOM properties* and *events* of the target object.

<div class="alert is-helpful">

This general rule can help you build a mental model of attributes and DOM properties:
**Attributes initialize DOM properties and then they are done.
Property values can change; attribute values can't.**

There is one exception to this rule.
Attributes can be changed by `setAttribute()`, which re-initializes corresponding DOM properties.

</div>

For more information, see the [MDN Interfaces documentation](https://developer.mozilla.org/en-US/docs/Web/API#Interfaces) which has API docs for all the standard DOM elements and their properties.
Comparing the [`<td>` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td) attributes to the [`<td>` properties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) provides a helpful example for differentiation.
In particular, you can navigate from the attributes page to the properties via "DOM interface" link, and navigate the inheritance hierarchy up to `HTMLTableCellElement`.
-->
Angular에서 데이터가 바인딩되는 것을 정확하게 이해하려면 HTML 어트리뷰트와 DOM 프로퍼티가 어떻게 다른지 정확하게 구분해야 합니다.
**어트리뷰트는 HTML 문서에서 지정합니다. 프로퍼티는 DOM 노드에 존재합니다.**

* HTML 어트리뷰트 중에는 DOM 프로퍼티와 1:1 매칭되는 항목이 있습니다: `id`

* HTML 어트리뷰트에 있지만 DOM 프로퍼티에 존재하지 않는 항목이 있습니다: `aria-*`

* DOM 프로퍼티에만 존재하는 항목도 있습니다: `textContent`

양쪽에서 사용하는 이름이 같더라도 *HTML 어트리뷰트*와 *DOM 프로퍼티*는 다르다는 것을 항상 명심해야 합니다.
Angular에서 HTML 어트리뷰트는 엘리먼트나 디렉티브의 초기값을 지정하는 용도로만 사용합니다.

**템플릿 바인딩은 *어트리뷰트*가 아니라 *프로퍼티*와 *이벤트*를 대상으로 동작합니다.**

그래서 데이터 바인딩을 사용한다는 것은 대상 객체의 *DOM 프로퍼티*나 대상 객체에서 발생하는 *이벤트*를 연결하는 것을 의미합니다.

<div class="alert is-helpful">

어트리뷰트와 DOM 프로퍼티의 개념을 이렇게 잡고 가면 좋습니다:
**어트리뷰트는 DOM 프로퍼티의 초기값을 지정하고 나면 사용되지 않고 값이 변경되지도 않습니다. 프로퍼티 값은 계속 변합니다.**

이 규칙을 벗어나는 경우가 딱 하나 있습니다.
DOM 프로퍼티를 다시 초기화하기 위해 `setAttribute()`를 실행하면 어트리뷰트 값이 변경됩니다.

</div>

표준 DOM 엘리먼트와 프로퍼티에 대해 찾아보려면 [MDN Interfaces 문서](https://developer.mozilla.org/en-US/docs/Web/API#Interfaces)를 참고하세요.
이 문서에서 `<td>` 엘리먼트의 [어트리뷰트](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td)와 [프로퍼티](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement)가 어떻게 다른지 확인해보는 것도 좋습니다.


<!--
#### Example 1: an `<input>`
-->
#### 예제1: `<input>`

<!--
When the browser renders `<input type="text" value="Sarah">`, it creates a
corresponding DOM node with a `value` property initialized to "Sarah".

```html
<input type="text" value="Sarah">
```

When the user enters "Sally" into the `<input>`, the DOM element `value` *property* becomes "Sally".
However, if you look at the HTML attribute `value` using `input.getAttribute('value')`, you can see that the *attribute* remains unchanged&mdash;it returns "Sarah".

The HTML attribute `value` specifies the *initial* value; the DOM `value` property is the *current* value.

To see attributes versus DOM properties in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax.
-->
브라우저가 `<input type="text" value="Sarah">`를 렌더링하면 다음과 같은 DOM 노드가 생성되며 이 노드의 `value` 프로퍼티는 "Sarah"로 초기화됩니다.

```html
<input type="text" value="Sarah">
```

그리고 사용자가 `<input>` 엘리먼트에 "Sally"를 입력하면 DOM 엘리먼트의 `value` *프로퍼티* 값은 `Sally`가 됩니다.
하지만 `input.getAttribute('value')`를 실행해서 HTML 어트리뷰트 `value`의 값을 참조해보면 이 어트리뷰트의 값이 여전히 "Sarah"인 것을 확인할 수 있습니다.

HTML 어트리뷰트 `value`는 DOM 노드의 값을 *초기화* 할 때만 사용됩니다.
그리고 DOM 프로퍼티 `value`는 *현재* 값을 의미합니다.

실제로 동작하는 앱에서 이 내용을 확인해 보려면 <live-example name="binding-syntax"></live-example>를 참고하세요.


<!--
#### Example 2: a disabled button
-->
#### 예제2: 버튼 비활성화

<!--
The `disabled` attribute is another example. A button's `disabled`
*property* is `false` by default so the button is enabled.

When you add the `disabled` *attribute*, its presence alone
initializes the button's `disabled` *property* to `true`
so the button is disabled.

```html
<button disabled>Test Button</button>
```

Adding and removing the `disabled` *attribute* disables and enables the button.
However, the value of the *attribute* is irrelevant,
which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.

To control the state of the button, set the `disabled` *property*,

<div class="alert is-helpful">

Though you could technically set the `[attr.disabled]` attribute binding, the values are different in that the property binding requires to a boolean value, while its corresponding attribute binding relies on whether the value is `null` or not. Consider the following:

```html
<input [disabled]="condition ? true : false">
<input [attr.disabled]="condition ? 'disabled' : null">
```

Generally, use property binding over attribute binding as it is more intuitive (being a boolean value), has a shorter syntax, and is more performant.

</div>


To see the `disabled` button example in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax. This example shows you how to toggle the disabled property from the component.
-->
`disabled` 어트리뷰트는 조금 다릅니다.
버튼에 있는 `disabled` *프로퍼티* 값은 기본값이 `false`이며, 이 값이면 버튼이 활성화됩니다.

그런데 버튼에 `disabled` *어트리뷰트*를 추가하면 버튼의 `disabled` *프로퍼티* 값이 `true`로 설정되기 때문에 버튼이 비활성화됩니다.

```html
<button disabled>Test Button</button>
```

결국 `disabled` *어트리뷰트* 추가하거나 제거하는 것으로 버튼이 비활성화될지, 활성화될지 제어할 수 있습니다.
하지만 `disabled` *어트리뷰트*는 어떤 값인지를 따지지 않고 이 어트리뷰트가 존재하는지만 판단하기 때문에 `<button disabled="false">Still Disabled</button>`라고 작성해도 버튼은 비활성화됩니다.

그래서 버튼을 제어하려면 `disabled` *프로퍼티*를 조작해야 합니다.

<div class="alert is-helpful">

어트리뷰트 바인딩 문법을 사용해서 `[attr.disabled]`라고 작성해도 프로퍼티 바인딩에 사용하는 값과는 타입이 다릅니다.
`disabled` 프로퍼티에는 불리언 값을 사용할 수 있지만 `disabled` 어트리뷰트 값은 `null`이냐 아니냐로 지정합니다.

```html
<input [disabled]="condition ? true : false">
<input [attr.disabled]="condition ? 'disabled' : null">
```

일반적인 경우에도 어트리뷰트 바인딩보다는 프로퍼티 바인딩을 사용하는 것이 더 직관적이고, 이해하기 쉬우며, 문법도 간단하고, 성능이 좋습니다.

</div>

`disabled` 버튼 예제가 어떻게 동작하는지 직접 확인하려면 <live-example name="binding-syntax"></live-example>를 참고하세요.
이 예제는 컴포넌트에서 `disabled` 프로퍼티를 토글하는 방법에 대해 다룹니다.


<!--
## Binding types and targets
-->
## 바인딩 종류와 대상

<!--
The **target of a data-binding** is something in the DOM.
Depending on the binding type, the target can be a property (element, component, or directive),
an event (element, component, or directive), or sometimes an attribute name.
The following table summarizes the targets for the different binding types.
-->
**데이터 바인딩의 대상**이 되는 것은 DOM에 있는 무언가입니다.
바인딩 종류에 따라 이 대상은 엘리먼트, 컴포넌트, 디렉티브의 프로퍼티가 될 수 있으며, 이들에서 발생하는 이벤트가 될 수도 있고, 이들의 어트리뷰트 이름일 수도 있습니다.


<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="10%">
  </col>
  <col width="15%">
  </col>
  <col width="75%">
  </col>
  <tr>
    <th>
      <!--
      Type
      -->
      종류
    </th>
    <th>
      <!--
      Target
      -->
      대상
    </th>
    <th>
      <!--
      Examples
      -->
      예
    </th>
  </tr>
  <tr>
    <td>
      <!--
      Property
      -->
      프로퍼티
    </td>
    <td>
      <!--
      Element&nbsp;property<br>
      Component&nbsp;property<br>
      Directive&nbsp;property
      -->
      엘리먼트 프로퍼티<br>
      컴포넌트 프로퍼티<br>
      디렉티브 프로퍼티
    </td>
    <td>
      <!--
      <code>src</code>, <code>hero</code>, and <code>ngClass</code> in the following:
      -->
      아래 예제에서는 <code>src</code>, <code>hero</code>, <code>ngClass</code>:
      <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1"></code-example>
      <!-- For more information, see [Property Binding](guide/property-binding). -->
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Event
      -->
      이벤트
    </td>
    <td>
      <!--
      Element&nbsp;event<br>
      Component&nbsp;event<br>
      Directive&nbsp;event
      -->
      엘리먼트 이벤트<br>
      컴포넌트 이벤트<br>
      디렉티브 이벤트
    </td>
    <td>
      <!--
      <code>click</code>, <code>deleteRequest</code>, and <code>myClick</code> in the following:
      -->
      아래 예제에서는 <code>click</code>, <code>deleteRequest</code>, <code>myClick</code>:
      <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1"></code-example>
      <!-- KW--Why don't these links work in the table? -->
      <!-- <div>For more information, see [Event Binding](guide/event-binding).</div> -->
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Two-way
      -->
      양방향
    </td>
    <td>
      <!--
      Event and property
      -->
      이벤트와 프로퍼티
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Attribute
      -->
      어트리뷰트
    </td>
    <td>
      <!--
      Attribute
      (the&nbsp;exception)
      -->
      어트리뷰트
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Class
      -->
      클래스
    </td>
    <td>
      <!--
      <code>class</code> property
      -->
      <code>class</code> 프로퍼티
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1"></code-example>
    </td>
  </tr>
  <tr>
    <td>
      <!--
      Style
      -->
      스타일
    </td>
    <td>
      <!--
      <code>style</code> property
      -->
      <code>style</code> 프로퍼티
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1"></code-example>
    </td>
  </tr>
</table>

