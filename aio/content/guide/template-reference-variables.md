<!--
# Template reference variables (`#var`)
-->
# 템플릿 참조 변수 (`#var`)

<!--
A **template reference variable** is often a reference to a DOM element within a template.
It can also refer to a directive (which contains a component), an element, [TemplateRef](api/core/TemplateRef), or a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

Use the hash symbol (#) to declare a reference variable.
The following reference variable, `#phone`, declares a `phone` variable on an `<input>` element.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html"></code-example>

You can refer to a template reference variable anywhere in the component's template.
Here, a `<button>` further down the template refers to the `phone` variable.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-phone" header="src/app/app.component.html"></code-example>

Angular assigns each template reference variable a value based on where you declare the variable:

* If you declare the variable on a component, the variable refers to the component instance.
* If you declare the variable on a standard HTML tag, the variable refers to the element.
* If you declare the variable on an `<ng-template>` element, the variable refers to a `TemplateRef` instance, which represents the template.
* If the variable specifies a name on the right-hand side, such as `#var="ngModel"`, the variable refers to the directive or component on the element with a matching `exportAs` name.
-->
**템플릿 참조 변수(template reference variable)**는 템플릿 안에서 DOM 엘리먼트를 참조할 때 사용합니다.
이 때 참조하는 대상은 디렉티브(컴포넌트 포함)일 수 있으며, 표준 엘리먼트일 수도 있고 [TemplateRef](api/core/TemplateRef)나 <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">웹 컴포넌트</a>일수도 있습니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>

템플릿에서 해시 기호(`#`)를 사용하면 템플릿 참조 변수를 선언할 수 있습니다.
그래서 `<input>` 엘리먼트에 `#phone`라고 선언하면 이 엘리먼트를 `phone`라는 변수로 참조할 수 있습니다.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html"></code-example>

이렇게 선언한 템플릿 참조 변수는 컴포넌트 템플릿 범위 어디에서도 자유롭게 참조할 수 있습니다.
예제 코드에서는 템플릿 아래쪽 `<button>` 엘리먼트에서 `phone` 변수를 사용하도록 작성했습니다.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-phone" header="src/app/app.component.html"></code-example>


템플릿 참조 변수는 선언된 곳에 따라 다른 타입을 가리킵니다:

* 컴포넌트에 선언하면 컴포넌트 인스턴스를 가리킵니다.
* 표준 HTML 태그에 선언하면 엘리먼트를 가리킵니다.
* `<ng-template>` 엘리먼트에 선언하면 템플릿을 표현하는 `TemplateRef` 인스턴스를 가리킵니다.
* `#var="ngModel"`과 같이 등호 오른쪽에 이름을 붙여 선언하면 엘리먼트에 사용된 디렉티브(컴포넌트)에서 `exportAs`에 해당되는 변수를 가리킵니다.


<!--
<h3 class="no-toc">How a reference variable gets its value</h3>

In most cases, Angular sets the reference variable's value to the element on which it is declared.
In the previous example, `phone` refers to the phone number `<input>`.
The button's click handler passes the `<input>` value to the component's `callPhone()` method.

The `NgForm` directive can change that behavior and set the value to something else. In the following example, the template reference variable, `itemForm`, appears three times separated
by HTML.

<code-example path="template-reference-variables/src/app/app.component.html" region="ngForm" header="src/app/hero-form.component.html"></code-example>

The reference value of `itemForm`, without the `ngForm` attribute value, would be
the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
There is, however, a difference between a `Component` and a `Directive` in that a `Component`
will be referenced without specifying the attribute value, and a `Directive` will not
change the implicit reference (that is, the element).



However, with `NgForm`, `itemForm` is a reference to the [NgForm](api/forms/NgForm "API: NgForm")
directive with the ability to track the value and validity of every control in the form.

The native `<form>` element doesn't have a `form` property, but the `NgForm` directive does, which allows disabling the submit button
if the `itemForm.form.valid` is invalid and passing the entire form control tree
to the parent component's `onSubmit()` method.
-->
<h3 class="no-toc">템플릿 참조 변수가 값을 가져오는 방식</h3>

일반적으로 엘리먼트에 템플릿 참조 변수를 선언하면 Angular는 해당 엘리먼트를 가리키도록 템플릿 참조 변수를 선언합니다.
이전 예제에서도 `phone`은 전화번호를 입력받는 `<input>` 엘리먼트를 가리키며, 버튼을 클릭하면 이벤트 핸들러가 `<input>` 엘리먼트의 값을 컴포넌트 `callPhone()` 메서드로 전달하는 방식으로 작성되었습니다.

`NgForm` 디렉티브를 활용하면 원하는 동작을 추가하거나 폼 값을 다른 곳에 전달할 수 있습니다.
아래 예제에서 선언된 템플릿 참조 변수 `itemForm`는 HTML 문서에 3번 사용되었습니다.

<code-example path="template-reference-variables/src/app/app.component.html" region="ngForm" header="src/app/hero-form.component.html"></code-example>

`ngForm` 없이 `#itemForm`라고만 선언하면 이 템플릿 참조 변수는 [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement)를 가리킵니다.
이 때 템플릿 참조 변수는 컴포넌트와 디렉티브에 사용되었을 때 동작이 약간 다르다는 것에 주의해야 합니다.
템플릿 참조 변수를 컴포넌트에 선언하면 어트리뷰트 이름을 지정하지 않아도 컴포넌트를 참조할 수 있지만, 디렉티브에 선언할 때 어트리뷰트 이름을 지정하지 않으면 디렉티브가 아니라 엘리먼트 자체를 가리킵니다.

`NgForm`를 활용하는 방식으로 `itemForm`을 선언하면 이 템플릿 참조 변수는 [NgForm](api/forms/NgForm "API: NgForm") 디렉티브를 가리킵니다.
이렇게 작성해야 폼이 관리하는 데이터를 참조할 수 있으며 폼 유효성도 검사할 수 있습니다.

표준 엘리먼트 `<form>`에는 `form`라는 프로퍼티가 존재하지 않습니다.
하지만 `NgForm` 디렉티브에는 `form` 프로퍼티가 존재하며, 이 프로퍼티를 참조해서 제출 버튼을 비활성화하는 `itemForm.form.valid`라는 표현을 사용할 수 있고, 폼이 제출되었을 때 컴포넌트 `onSubmit()` 메서드로 폼 트리 전체를 전달할 수 있습니다.


<!--
<h3 class="no-toc">Template reference variable considerations</h3>

A template _reference_ variable (`#phone`) is not the same as a template _input_ variable (`let phone`) such as in an [`*ngFor`](guide/built-in-directives#template-input-variable).
See [_Structural directives_](guide/structural-directives#template-input-variable) for more information.

The scope of a reference variable is the entire template. So, don't define the same variable name more than once in the same template as the runtime value will be unpredictable.
-->
<h3 class="no-toc">템플릿 참조 변수를 선언할 때 주의해야 할 점</h3>

템플릿 _참조_ 변수(`#phone`)는 [`*ngFor`](guide/built-in-directives#template-input-variable) 안에 사용된 템플릿 _입력_ 변수(`let phone`)와는 다릅니다.
자세한 내용은 [_구조 디렉티브_](guide/structural-directives#template-input-variable) 문서를 참고하세요.

템플릿 참조 변수는 템플릿 어디에서도 접근할 수 있습니다.
그래서 한 템플릿 안에 같은 이름으로 템플릿 참조 변수를 여러개 선언하면 오류는 발생하지 않더라도 예상치 못한 동작할 수 있으니 주의해야 합니다.


<!--
### Alternative syntax
-->
### 대체 문법

<!--
You can use the `ref-` prefix alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.
-->
`#` 대신 `ref-` 접두사를 활용하는 방법도 있습니다.
아래 예제에서 `ref-fax`라고 작성된 코드는 템플릿 참조 변수 `fax`를 선언하기 위해 `#fax`라고 작성한 것과 같은 역할을 합니다.


<code-example path="template-reference-variables/src/app/app.component.html" region="ref-fax" header="src/app/app.component.html"></code-example>

