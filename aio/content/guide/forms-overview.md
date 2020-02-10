<!--
# Introduction to forms in Angular
-->
# Angular 폼 소개

<<<<<<< HEAD
<!--
Handling user input with forms is the cornerstone of many common applications. Applications use forms to enable users to log in, to update a profile, to enter sensitive information, and to perform many other data-entry tasks. 
-->
대부분의 애플리케이션에는 사용자의 입력을 폼으로 처리하는 기능이 들어갑니다. 폼은 사용자가 로그인하거나 개인정보를 수정할 때, 서버에 저장할 정보를 입력하는 것과 같이 데이터를 처리하는 곳에 모두 활용할 수 있습니다.

<!--
Angular provides two different approaches to handling user input through forms: reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes. 
-->
Angular는 사용자의 입력을 처리하는 폼을 두가지 방식으로 제공합니다. 반응형 폼과 템플릿 기반 폼은 모두 화면에서 사용자의 입력을 받아 입력값을 검증하며, 폼 모델을 구성하고 이 모델로 데이터 모델을 갱신할 수 있습니다. 그리고 값이 변경되는 것을 감지해서 원하는 로직을 실행할 수도 있습니다.
=======
Handling user input with forms is the cornerstone of many common applications. Applications use forms to enable users to log in, to update a profile, to enter sensitive information, and to perform many other data-entry tasks.

Angular provides two different approaches to handling user input through forms: reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Reactive and template-driven forms process and manage form data differently. Each offers different advantages.
-->
하지만 반응형 폼과 템플릿 기반 폼이 데이터를 처리하는 방식은 다릅니다. 두 방식의 장점도 다릅니다.

<!--
**In general:**
-->
**일반적으로:**

<!--
* **Reactive forms** are more robust: they're more scalable, reusable, and testable. If forms are a key part of your application, or you're already using reactive patterns for building your application, use reactive forms.
* **Template-driven forms** are useful for adding a simple form to an app, such as an email list signup form. They're easy to add to an app, but they don't scale as well as reactive forms. If you have very basic form requirements and logic that can be managed solely in the template, use template-driven forms.
-->
* **반응형 폼**은 좀 더 역동적으로 동작합니다. 이 방식은 확장하기 편하며, 재사용하기 편하고, 테스트도 쉽게 적용할 수 있습니다. 애플리케이션에서 폼의 역할이 중요하거나, 반응형 프로그래밍을 사용하고 있다면 반응형 폼을 사용하는 것이 좋습니다.
* **템플릿 기반의 폼**은 회원가입과 같이 간단한 폼을 만들 때 유용합니다. 이 방식은 구현하기 간단하지만 반응형 폼처럼 쉽게 확장할 수는 없습니다. 템플릿 기반 폼은 템플릿 안에서 모두 처리할 수 있을 정도로 로직이 간단할 때만 사용하는 것이 좋습니다.

<!--
This guide provides information to help you decide which type of form works best for your situation. It introduces the common building blocks used by both approaches. It also summarizes the key differences between the two approaches, and demonstrates those differences in the context of setup, data flow, and testing.
-->
이 가이드에서는 애플리케이션에 어떤 방식의 폼을 적용하는 것이 좋은지 안내합니다. 그리고 각 방식의 구현 과정을 소개하면서 두 방식이 어떻게 다른지 알아봅니다. 두 방식은 폼 모델 구성, 데이터의 흐름, 테스트 과정이 모두 다릅니다.

<div class="alert is-helpful">

<!--
**Note:** For complete information about each kind of form, see [Reactive Forms](guide/reactive-forms) and [Template-driven Forms](guide/forms).
-->
**참고:** 각 방식에 대해 자세하게 확인하려면 [반응형 폼](guide/reactive-forms) 문서와 [템플릿 기반 폼](guide/forms) 문서를 참고하세요.

</div>

<!--
## Key differences
-->
## 두 방식의 차이

<!--
The table below summarizes the key differences between reactive and template-driven forms.
-->
아래 표를 보면서 반응형 폼과 템플릿 기반 폼의 차이를 확인해 보세요.

<style>
  table {width: 100%};
  td, th {vertical-align: top};
</style>

<!--
||Reactive|Template-driven|
|--- |--- |--- |
|Setup (form model)|More explicit, created in component class|Less explicit, created by directives|
|Data model|Structured|Unstructured|
|Predictability|Synchronous|Asynchronous|
|Form validation|Functions|Directives|
|Mutability|Immutable|Mutable|
|Scalability|Low-level API access|Abstraction on top of APIs|
-->
||반응형 폼|템플릿 기반 폼|
|--- |--- |--- |
|폼 모델 구성|명시적으로 컴포넌트 클래스에 선언|템플릿에 디렉티브로 선언|
|데이터 모델|구조를 갖춰 구성|개별 구성|
|동작 방식|동기|비동기|
|유효성 검증 방법|함수|디렉티브|
|불변성|이뮤터블|뮤터블|
|확장성|API에 자유롭게 접근 가능|일부 API만 접근 가능|

<!--
## Common foundation
-->
## 두 방식의 공통점

<<<<<<< HEAD
<!--
Both reactive and template-driven forms share underlying building blocks. 
-->
반응형 폼과 템플릿 기반 폼은 모두 다음 요소를 사용합니다.
=======
Both reactive and template-driven forms share underlying building blocks.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072


<!--
* `FormControl` tracks the value and validation status of an individual form control.

* `FormGroup` tracks the same values and status for a collection of form controls.

* `FormArray` tracks the same values and status for an array of form controls.

* `ControlValueAccessor` creates a bridge between Angular `FormControl` instances and native DOM elements.
-->
* `FormControl`: 개별 폼 컨트롤의 값과 유효성 상태를 관리합니다.

* `FormGroup`: 폼 컨트롤 그룹 전체의 값과 유효성 상태를 관리합니다.

* `FormArray`: 폼 컨트롤 배열 전체의 값과 유효성 상태를 관리합니다.

* `ControlValueAccessor`: Angular `FormControl` 인스턴스와 네이티브 DOM 엘리먼트를 연결합니다.

<!--
See the [Form model setup](#setup-the-form-model) section below for an introduction to how these control instances are created and managed with reactive and template-driven forms. Further details are provided in the [data flow section](#data-flow-in-forms) of this guide.
-->
반응형 폼과 템플릿 기반 폼에서 이 컨트롤 인스턴스들이 어떻게 동작하는지 확인하려면 아래에서 설명하는 [폼 모델 구성](#setup-the-form-model) 부분을 참고하세요. 그리고 나서는 [데이터 흐름](#data-flow-in-forms)섹션을 확인하는 것이 좋습니다.

{@a setup-the-form-model}

<!--
## Form model setup
-->
## 폼 모델 구성

<!--
Reactive and template-driven forms both use a form model to track value changes between Angular forms and form input elements. The examples below show how the form model is defined and created.
-->
반응형 폼과 템플릿 기반 폼은 모두 폼 모델을 사용해서 Angular 폼과 폼 엘리먼트를 연결합니다. 아래 예제를 보면서 폼 모델이 어떻게 정의되고 생성되는지 확인해 보세요.

<!--
### Setup in reactive forms
-->
### 반응형 폼 구성

<!--
Here's a component with an input field for a single control implemented using reactive forms.
-->
폼 컨트롤 하나와 입력 필드 하나를 반응형 폼으로 구성하면 다음과 같이 구현할 수 있습니다.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.ts">
</code-example>

<!--
The source of truth provides the value and status of the form element at a given point in time. In reactive forms, the form model is the source of truth. In the example above, the form model is the `FormControl` instance.
-->
폼 컨트롤의 값과 유효성 검증 상태는 모두 원천 소스(source of truth)에서 전달됩니다. 반응형 폼에서 원천 소스는 폼 모델이며, 이 코드에서는 `FormControl` 인스턴스가 폼 모델입니다.

<<<<<<< HEAD
<figure>
  <!--
  <img src="generated/images/guide/forms-overview/key-diff-reactive-forms.png" alt="Reactive forms key differences">
  -->
  <img src="generated/images/guide/forms-overview/key-diff-reactive-forms.png" alt="반응형 폼">
</figure>

<!--
With reactive forms, the form model is explicitly defined in the component class. The reactive form directive (in this case, `FormControlDirective`) then links the existing `FormControl` instance to a specific form element in the view using a value accessor (`ControlValueAccessor` instance). 
-->
반응형 폼 방식으로 구현할 때 폼 모델은 컴포넌트 클래스에 명시적으로 정의합니다. 그리고 `FormControlDirective`와 같은 폼 디렉티브는 화면에 표시된 폼 엘리먼트와 컴포넌트의 `FormControl` 인스턴스를 연결하는데, 이 때 값 참조 인터페이스(`ControlValueAccessor` 인스턴스)를 사용합니다.
=======
<div class="lightbox">
  <img src="generated/images/guide/forms-overview/key-diff-reactive-forms.png" alt="Reactive forms key differences">
</div>

With reactive forms, the form model is explicitly defined in the component class. The reactive form directive (in this case, `FormControlDirective`) then links the existing `FormControl` instance to a specific form element in the view using a value accessor (`ControlValueAccessor` instance).
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
### Setup in template-driven forms
-->
### 템플릿 기반 폼 구성

<!--
Here's the same component with an input field for a single control implemented using template-driven forms.
-->
반응형 폼 때와 같은 컴포넌트를 템플릿 기반 폼 방식으로 구성하려면 다음과 같이 구현합니다.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.ts">
</code-example>

<!--
In template-driven forms, the source of truth is the template.
-->
이 때 템플릿 기반 폼의 원천 소스는 템플릿입니다.

<<<<<<< HEAD
<figure>
  <!--
  <img src="generated/images/guide/forms-overview/key-diff-td-forms.png" alt="Template-driven forms key differences">
  -->
  <img src="generated/images/guide/forms-overview/key-diff-td-forms.png" alt="템플릿 폼">
</figure>

<!--
The abstraction of the form model promotes simplicity over structure. The template-driven form directive `NgModel` is responsible for creating and managing the `FormControl` instance for a given form element. It's less explicit, but you no longer have direct control over the form model. 
-->
템플릿 기반 폼에서 폼 모델은 더 추상화되기 때문에 구조가 단순합니다. 그리고 템플릿 기반 폼에서 사용하는 `NgModel` 디렉티브는 폼 엘리먼트와 연결되는 `FormControl` 인스턴스를 직접 생성하고 관리합니다. 템플릿 기반 폼은 반응형 폼에 비해 간단하게 구성할 수 있지만, 반응형 폼과 다르게 폼 모델에 직접 접근할 수 없습니다.
=======
<div class="lightbox">
  <img src="generated/images/guide/forms-overview/key-diff-td-forms.png" alt="Template-driven forms key differences">
</div>

The abstraction of the form model promotes simplicity over structure. The template-driven form directive `NgModel` is responsible for creating and managing the `FormControl` instance for a given form element. It's less explicit, but you no longer have direct control over the form model.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

{@a data-flow-in-forms}

<!--
## Data flow in forms
-->
## 폼의 데이터 흐름

<!--
When building forms in Angular, it's important to understand how the framework handles data flowing from the user or from programmatic changes. Reactive and template-driven forms follow two different strategies when handling form input. The data flow examples below begin with the favorite color input field example from above, and then show how changes to favorite color are handled in reactive forms compared to template-driven forms.
-->
Angular의 방식으로 폼을 구성할 때는 사용자가 입력한 데이터를 프레임워크가 어떻게 처리하고 변경사항에 반응하는지 이해하는 것이 중요합니다. 왜냐하면 반응형 폼과 템플릿 기반 폼은 서로 다른 정책으로 폼 입력을 처리하기 때문입니다. 이번 섹션에서는 위에서 살펴본 예제를 좀 더 발전시켜서, 데이터를 처리하는 방식이 서로 어떻게 다른지 알아봅시다.

<!--
### Data flow in reactive forms
-->
### 반응형 폼의 데이터 흐름

<!--
As described above, in reactive forms each form element in the view is directly linked to a form model (`FormControl` instance). Updates from the view to the model and from the model to the view are synchronous and aren't dependent on the UI rendered. The diagrams below use the same favorite color example to demonstrate how data flows when an input field's value is changed from the view and then from the model.
-->
위에서 설명한 것처럼 반응형 폼에서 화면에 존재하는 개별 폼 엘리먼트는 폼 모델(`FormControl` 인스턴스)과 직접 연결됩니다. 그래서 화면에서 변경된 값은 모델로 전달되며, 모델의 값이 변경되면 화면의 값도 즉시 갱신됩니다. 이 동작은 값이 변경되었을 때 UI를 다시 렌더링하지 않아도 즉시 실행됩니다. 아래 그림은 화면의 입력 필드 값이 변경되었을 때 이 값이 모델로 어떻게 전달되는지 표현한 그림입니다.

<<<<<<< HEAD
<figure>
  <!--
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-vtm.png" alt="Reactive forms data flow - view to model" width="100%">
  -->
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-vtm.png" alt="반응형 폼의 데이터 흐름 - 화면에서 모델로" width="100%">
</figure>
=======
<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-vtm.png" alt="Reactive forms data flow - view to model" width="100%">
</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The steps below outline the data flow from view to model.
-->
화면에서 모델로 데이터가 전달되는 흐름을 단계별로 살펴봅시다.

<!--
1. The user types a value into the input element, in this case the favorite color *Blue*.
1. The form input element emits an "input" event with the latest value.
1. The control value accessor listening for events on the form input element immediately relays the new value to the `FormControl` instance.
1. The `FormControl` instance emits the new value through the `valueChanges` observable.
1. Any subscribers to the `valueChanges` observable receive the new value.
-->
1. 사용자가 엘리먼트에 값을 입력합니다. 이 예제에서는 *Blue*를 입력했습니다.
1. 폼 입력 엘리먼트가 "input" 이벤트를 발생시키면서 마지막으로 입력된 값을 전달합니다.
1. 이 이벤트는 컨트롤 값 접근자(control value accessor)가 감지하고 있는데, 새로운 이벤트가 전달되면 이 값을 `FormControl` 인스턴스로 전달합니다.
1. `FormControl` 인스턴스는 새로운 값으로 `valueChanges` 옵저버블을 발행합니다.
1. `valueChanges` 옵저버블을 구독하는 쪽에서 입력 엘리먼트에 새로 입력된 값을 받습니다.

<<<<<<< HEAD
<figure>
  <!--
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-mtv.png" alt="Reactive forms data flow - model to view" width="100%">
  -->
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-mtv.png" alt="반응형 폼의 데이터 흐름 - 모델에서 화면으로" width="100%">
</figure>
=======
<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-mtv.png" alt="Reactive forms data flow - model to view" width="100%">
</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The steps below outline the data flow from model to view.
-->
모델에서 화면으로 데이터가 전달되는 흐름을 살펴봅시다.

<!--
1. The user calls the `favoriteColorControl.setValue()` method, which updates the `FormControl` value.
1. The `FormControl` instance emits the new value through the `valueChanges` observable.
1. Any subscribers to the `valueChanges` observable receive the new value.
1. The control value accessor on the form input element updates the element with the new value.
-->
1. 사용자가 `favoriteColorControl.setValue()` 메소드를 실행하면 `FormControl`의 값이 변경됩니다.
1. `FormControl` 인스턴스는 새로 지정된 값으로 `valueChanges` 옵저버블을 발행합니다.
1. `valueChanges` 옵저버블을 구독하는 쪽에서 새로 지정된 값을 받습니다.
1. 폼 입력 엘리먼트와 연결된 컨트롤 값 접근자가 새로 지정된 값으로 화면을 갱신합니다.

<!--
### Data flow in template-driven forms
-->
### 템플릿 기반 폼의 데이터 흐름

<!--
In template-driven forms, each form element is linked to a directive that manages the form model internally. The diagrams below use the same favorite color example to demonstrate how data flows when an input field's value is changed from the view and then from the model.
-->
템플릿 기반 폼에서는 개별 폼 엘리먼트가 디렉티브와 연결되며, 이 디렉티브가 내부적으로 폼 모델을 관리합니다. 입력 필드 값이 변경되면 이 값이 화면에서 데이터 모델로 전달되는데, 이 과정은 다음 그림을 보면서 확인해 보세요.

<<<<<<< HEAD
<figure>
  <!--
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-vtm.png" alt="Template-driven forms data flow - view to model" width="100%">
  -->
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-vtm.png" alt="템플릿 기반 폼의 데이터 흐름 - 화면에서 모델로" width="100%">
</figure>
=======
<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-vtm.png" alt="Template-driven forms data flow - view to model" width="100%">
</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The steps below outline the data flow from view to model when the input value changes from *Red* to *Blue*.
-->
입력 필드의 값이 *Red*에서 *Blue*로 바뀔 때 화면에서 모델로 값이 전달되는 과정은 다음과 같습니다.

<!--
1. The user types *Blue* into the input element.
1. The input element emits an "input" event with the value *Blue*.
1. The control value accessor attached to the input triggers the `setValue()` method on the `FormControl` instance.
1. The `FormControl` instance emits the new value through the `valueChanges` observable.
1. Any subscribers to the `valueChanges` observable receive the new value.
1. The control value accessor also calls the `NgModel.viewToModelUpdate()` method which emits an `ngModelChange` event.
<<<<<<< HEAD
1. Because the component template uses two-way data binding for the `favoriteColor` property, the `favoriteColor` property in the component 
is updated to the value emitted  by the `ngModelChange` event (*Blue*).
-->
1. 사용자가 입력 엘리먼트에 *Blue*를 입력합니다.
1. 입력 엘리먼트에서 "input" 이벤트가 발생하며 이 이벤트로 *Blue* 라는 값이 전달됩니다.
1. 엘리먼트에 연결된 컨트롤 값 접근자가 `FormControl` 인스턴스의 `setValue()` 메소드를 실행합니다.
1. `FormControl` 인스턴스가 새로 변경된 값으로 `valueChanges` 옵저버블을 발행합니다.
1. `valueChanges`를 구독하는 쪽에서 새로 변경된 값을 받습니다.
1. 이와 동시에 컨트롤 값 접근자가 `NgModel.viewToModelUpdate()` 메소드를 실행하면서 `ngModelChange` 이벤트를 발생시킵니다.
1. 컴포넌트 템플릿과 컴포넌트 클래스의 `favoriteColor` 프로퍼티는 양방향 데이터 바인딩으로 연결되어있기 때문에 `ngModelChange` 이벤트가 발생하면 컴포넌트 클래스의 `favoriteColor` 프로퍼티 값이 새로 입력한 값(*Blue*)으로 변경됩니다.

<figure>
  <!--
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-mtv.png" alt="Template-driven forms data flow - model to view" width="100%">
  -->
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-mtv.png" alt="템플릿 기반 폼의 데이터 흐름 - 모델에서 화면으로" width="100%">
</figure>
=======
1. Because the component template uses two-way data binding for the `favoriteColor` property, the `favoriteColor` property in the component
is updated to the value emitted by the `ngModelChange` event (*Blue*).

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-mtv.png" alt="Template-driven forms data flow - model to view" width="100%">
</div>
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
The steps below outline the data flow from model to view when the `favoriteColor` changes from *Blue* to *Red*.
-->
`favoriteColor`의 값이 *Blue*에서 *Red*로 변경되었을 때 데이터가 모델에서 화면으로 전달되는 과정은 다음과 같습니다.

<!--
1. The `favoriteColor` value is updated in the component.
1. Change detection begins.
1. During change detection, the `ngOnChanges` lifecycle hook is called on the `NgModel` directive instance because the value of one of its inputs has changed.
1. The `ngOnChanges()` method queues an async task to set the value for the internal `FormControl` instance.
1. Change detection completes.
1. On the next tick, the task to set the `FormControl` instance value is executed.
1. The `FormControl` instance emits the latest value through the `valueChanges` observable.
1. Any subscribers to the `valueChanges` observable receive the new value.
1. The control value accessor updates the form input element in the view with the latest `favoriteColor` value.
-->
1. 컴포넌트에 있는 `favoriteColor` 값이 변경됩니다.
1. 변화감지 동작이 시작됩니다.
1. 컴포넌트의 입력값이 변경되었기 때문에 `NgModel` 디렉티브 인스턴스에 있는 `ngOnChanges` 라이프싸이클 후킹 함수가 실행됩니다.
1. `ngOnChanges()` 메소드는 `FormControl` 인스턴스의 값을 변경하는 동작을 큐에 추가합니다.
1. 변화 감지 동작이 종료됩니다.
1. 다음 싸이클이 되면 `FormControl` 인스턴스의 값을 변경시키는 동작이 실행됩니다.
1. `FormControl` 인스턴스는 새로 받은 값으로 `valueChanges` 옵저버블을 발행합니다.
1. `valueChanges` 옵저버블을 구독하는 쪽에서 새로운 값을 받습니다.
1. 컨트롤 값 접근자가 변경된 `favoriteColor` 값으로 화면에 있는 폼 엘리먼트 값을 갱신합니다.

<!--
## Form validation
-->
## 폼 유효성 검사

<!--
Validation is an integral part of managing any set of forms. Whether you're checking for required fields or querying an external API for an existing username, Angular provides a set of built-in validators as well as the ability to create custom validators.
-->
유효성 검증은 폼을 종합적으로 관리하는 과정입니다. 유효성 검증을 활용하면 필수 입력 필드에 값이 입력되었는지 확인할 수 있으며, 회원의 이름이 이미 존재하는지 외부 API를 사용해서 쿼리할 수도 있습니다. Angular 프레임워크는 일반적인 경우에 사용할 수 있는 유효성 검사기를 다양하게 제공하며 추가로 필요한 기능이 있다면 커스텀 유효성 검사기를 정의해서 활용할 수도 있습니다.

<!--
* **Reactive forms** define custom validators as **functions** that receive a control to validate.
* **Template-driven forms** are tied to template **directives**, and must provide custom validator directives that wrap validation functions.
-->
* **반응형 폼**에서는 커스텀 유효성 검사기를 **함수**로 정의합니다. 유효성을 검사해야 할 폼 컨트롤은 이 함수의 인자로 전달합니다.
* **템플릿 기반 폼**은 템플릿 **디렉티브**를 활용하기 때문에 커스텀 유효성 검사기도 유효성 검사 함수를 디렉티브로 랩핑해서 사용합니다.

<!--
For more information, see [Form Validation](guide/form-validation).
-->
자세한 내용을 확인하려면 [폼 유효성 검사](guide/form-validation) 문서를 참고하세요.

<<<<<<< HEAD
<!--
## Testing 
-->
## 테스트
=======
## Testing
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
Testing plays a large part in complex applications and a simpler testing strategy is useful when validating that your forms function correctly. Reactive forms and template-driven forms have different levels of reliance on rendering the UI to perform assertions based on form control and form field changes. The following examples demonstrate the process of testing forms with reactive and template-driven forms.
-->
폼이 원하는 대로 동작하는지 확인하려면 테스트 코드를 작성하는 것이 좋으며, 애플리케이션이 복잡할 수록 단순한 테스트 정책이 필요합니다. 반응형 폼과 템플릿 기반 폼은 UI를 렌더링하는 방법이 다르며, 유효성을 검사하는 방식도 다르고 폼 컨트롤과 폼 필드가 변경되는 것을 추적하는 과정도 다릅니다. 이번 섹션에서는 반응형 폼과 템플릿 폼에 테스트를 어떻게 적용할 수 있는지 알아봅시다.

<!--
### Testing reactive forms
-->
### 반응형 폼 테스트하기

<!--
Reactive forms provide a relatively easy testing strategy because they provide synchronous access to the form and data models, and they can be tested without rendering the UI. In these tests, status and data are queried and manipulated through the control without interacting with the change detection cycle.
-->
반응형 폼은 폼과 데이터 모델에 동기 방식으로 접근할 수 있기 때문에 템플릿 기반 폼에 비해 테스트하기 쉬우며, 화면을 렌더링하지 않아도 로직을 테스트할 수 있습니다. 그리고 폼 컨트롤의 상태나 데이터를 쿼리하거나 조작할 때 Angular의 변화 감지 동작을 배제할 수 있습니다.

<!--
The following tests use the favorite color components mentioned earlier to verify the data flows from view to model and model to view for a reactive form.
-->
위에서 살펴봤던 컴포넌트 예제를 바탕으로 데이터가 화면에서 모델로, 모델에서 화면으로 전달되는 것을 확인하는 테스트 코드를 작성해 봅시다.

<!--
The following test verifies the data flow from view to model.
-->
데이터가 화면에서 모델로 전달되는 것은 다음과 같이 테스트합니다.

<!--
<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="Favorite color test - view to model">
-->
<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="반응형 폼 테스트 - 화면에서 모델로">
</code-example>

<!--
Here are the steps performed in the view to model test.

1. Query the view for the form input element, and create a custom "input" event for the test.
1. Set the new value for the input to *Red*, and dispatch the "input" event on the form input element.
1. Assert that the component's `favoriteColorControl` value matches the value from the input.

The following test verifies the data flow from model to view.
-->
테스트 과정은 다음과 같습니다.

1. 화면에서 폼 입력 엘리먼트를 쿼리하고 커스텀 "input" 이벤트를 생성합니다.
1. 입력 엘리먼트에 새로운 값으로 *Red*를 지정하고, 커스텀 이벤트를 폼 입력 엘리먼트로 전달합니다.
1. 컴포넌트의 `favoriteColorControl` 프로퍼티 값이 제대로 바뀌었는지 확인합니다.

그리고 데이터가 모델에서 화면으로 전달되는 것은 다음과 같이 테스트합니다.

<!--
<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="Favorite color test - model to view">
-->
<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="반응형 폼 테스트 - 모델에서 화면으로">
</code-example>

<!--
Here are the steps performed in the model to view test.
-->
테스트 과정은 다음과 같습니다.

<!--
1. Use the `favoriteColorControl`, a `FormControl` instance, to set the new value.
1. Query the view for the form input element.
1. Assert that the new value set on the control matches the value in the input.
-->
1. `favoriteColorControl`을 의미하는 `FormControl` 인스턴스를 참조해서 새로운 값을 지정합니다.
1. 화면에서 폼 입력 엘리먼트를 쿼리합니다.
1. 폼 컨트롤에 입력한 값이 화면에 표시된 값과 같은지 확인합니다.

<!--
### Testing template-driven forms
-->
### 템플릿 기반 폼 테스트하기

<!--
Writing tests with template-driven forms requires a detailed knowledge of the change detection process and an understanding of how directives run on each cycle to ensure that elements are queried, tested, or changed at the correct time.
-->
템플릿 기반 폼에 테스트를 적용하려면 Angular의 변화 감지 로직이 어떻게 동작하는지, 디렉티브의 각 라이프싸이클이 어떻게 동작하는지 확실하게 알아야 합니다. 엘리먼트를 쿼리하거나 테스트하는 시점, 변경된 것을 확인하는 시점은 이 라이프싸이클을 정확하게 따라야 합니다.

<!--
The following tests use the favorite color components mentioned earlier to verify the data flows from view to model and model to view for a template-driven form.

The following test verifies the data flow from view to model.
-->
위에서 살펴봤던 컴포넌트를 바탕으로 데이터가 화면에서 모델로, 모델에서 화면으로 전달되는 것을 확인하는 테스트 코드를 작성해 봅시다.

데이터가 화면에서 모델로 전달되는 것은 다음과 같이 테스트합니다.

<!--
<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="Favorite color test - view to model">
-->
<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="템플릿 기반 폼 테스트 - 화면에서 모델로">
</code-example>

<!--
Here are the steps performed in the view to model test.
-->
테스트 과정은 다음과 같습니다.

<!--
1. Query the view for the form input element, and create a custom "input" event for the test.
1. Set the new value for the input to *Red*, and dispatch the "input" event on the form input element.
1. Run change detection through the test fixture.
1. Assert that the component `favoriteColor` property value matches the value from the input.
-->
1. 화면에서 폼 입력 엘리먼트를 쿼리하고 커스텀 "input" 이벤트를 생성합니다.
1. 입력 엘리먼트에 새로운 값으로 *Red*를 지정하고, 커스텀 이벤트를 폼 입력 엘리먼트로 전달합니다.
1. 테스트 픽스쳐를 사용해서 변화 감지 로직을 실행합니다.
1. 컴포넌트의 `favoriteColorControl` 프로퍼티의 값이 제대로 바뀌었는지 확인합니다.

<!--
The following test verifies the data flow from model to view.
-->
그리고 데이터가 모델에서 화면으로 전달되는 것은 다음과 같이 테스트합니다.

<!--
<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="Favorite color test - model to view">
-->
<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="템플릿 기반 폼 테스트 - 모델에서 화면으로">
</code-example>

<!--
Here are the steps performed in the model to view test.
-->
테스트 과정은 다음과 같습니다.

<!--
1. Use the component instance to set the value of the `favoriteColor` property.
1. Run change detection through the test fixture.
1. Use the `tick()` method to simulate the passage of time within the `fakeAsync()` task.
1. Query the view for the form input element.
1. Assert that the input value matches the value of the `favoriteColor` property in the component instance.
-->
1. 컴포넌트 인스턴스의 `favoriteColor` 프로퍼티값을 변경합니다.
1. 테스트 픽스쳐를 사용해서 변화 감지 로직을 실행합니다.
1. 일정 시간이 지난 것처럼 처리하기 위해 `fakeAsync()` 태스크 안에서 `tick()` 메소드를 실행합니다.
1. 화면에서 폼 입력 엘리먼트를 쿼리합니다.
1. 컴포넌트인스턴스의 `favoriteColor` 프로퍼티에 지정한 값이 화면에 표시된 값과 같은지 확인합니다.

<!--
## Mutability
-->
## 가변성 (Mutability)

<!--
The change tracking method plays a role in the efficiency of your application.
-->
Angular가 제공하는 변화감지 로직은 애플리케이션의 효율성을 더 향상시키기 위해 도입되었습니다.

<!--
* **Reactive forms** keep the data model pure by providing it as an immutable data structure. Each time a change is triggered on the data model, the `FormControl` instance returns a new data model rather than updating the existing data model. This gives you the ability to track unique changes to the data model through the control's observable. This provides one way for change detection to be more efficient because it only needs to update on unique changes. It also follows reactive patterns that integrate with observable operators to transform data.
-->
* **반응형 폼**은 데이터를 이뮤터블 데이터 구조로 관리하기 때문에 데이터 모델을 순수하게 유지할 수 있습니다. 그리고 데이터 모델이 변경될 때마다 `FormControl` 인스턴스는 기존에 있던 데이터 모델을 갱신하는 대신 새로운 데이터 모델을 반환하기 때문에 이 데이터 모델을 참조하는 옵저버블은 항상 새로운 인스턴스를 받게 되며, 변화 감지 로직이 동작하는 흐름도 단방향으로 유지됩니다. 옵저버블로 받은 데이터를 옵저버블 연산자로 변환하는 경우에도 마찬가지입니다. 반응형 프로그래밍 패턴이 그대로 유지됩니다.

<!--
* **Template-driven** forms rely on mutability with two-way data binding to update the data model in the component as changes are made in the template. Because there are no unique changes to track on the data model when using two-way data binding, change detection is less efficient at determining when updates are required.
-->
* **템플릿 기반의 폼**에서 양방향 데이터 바인딩을 사용할 때 데이터 모델이나 템플릿에서 값이 변경된 것이 다른 쪽으로 반영되는 과정에는 불변성이 보장되지 않습니다. 양방향 데이터 바인딩을 사용하면 양쪽에서 참조하는 인스턴스가 같기 때문에 인스턴스 안에 있는 필드를 추가로 검사해야 하며, 이 점 때문에 반응형 폼과 비교했을 때 효율성이 떨어진다고도 할 수 있습니다.

<<<<<<< HEAD
<!--
The difference is demonstrated in the examples above using the **favorite color** input element. 
-->
위에서 살펴본 예제에서도 차이점을 확인할 수 있습니다.
=======
The difference is demonstrated in the examples above using the **favorite color** input element.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
* With reactive forms, the **`FormControl` instance** always returns a new value when the control's value is updated.

* With template-driven forms, the **favorite color property** is always modified to its new value.
-->
* 반응형 폼에서는 값이 변경될 때마다 **`FormControl` 인스턴스**가 항상 새로운 객체를 반환합니다.

* 템플릿 기반 폼에서 값이 변경되면 인스턴스에서 **그 프로퍼티**만 변경됩니다.

<!--
## Scalability
-->
## 확장성 (Scalability)

<!--
If forms are a central part of your application, scalability is very important. Being able to reuse form models across components is critical.
-->
애플리케이션에 폼이 차지하는 비중이 크다면 확장성을 따져보는 것도 중요합니다. 폼의 관점에서 확장성이란 여러 컴포넌트에 폼 모델을 재사용할 수 있느냐를 의미합니다.

<!--
* **Reactive forms** provide access to low-level APIs and synchronous access to the form model, making creating large-scale forms easier.
-->
* **반응형 폼**에서는 폼 컨트롤에서 제공하는 API을 자유롭게 활용할 수 있으며 폼 모델에도 동기 방식으로 접근합니다. 반응형 폼을 활용하면 아주 복잡한 폼을 생성하는 것도 그리 어렵지 않습니다.

<!--
* **Template-driven** forms focus on simple scenarios, are not as reusable, abstract away the low-level APIs, and provide asynchronous access to the form model. The abstraction with template-driven forms also surfaces in testing, where testing reactive forms requires less setup and no dependence on the change detection cycle when updating and validating the form and data models during testing.
-->
* **템플릿 기반의 폼**은 단순한 시나리오를 처리하는 것이 목적이기 때문에 재사용하기 쉽지 않고 활용할 수 있는 API도 제한적입니다. 게다가 폼 모델에 비동기 방식으로 접근합니다. 그리고 템플릿 기반 폼은 본질적으로 템플릿을 기반으로 하기 때문에 반응형 폼에 비해 테스트 환경에 설정해야 할 것이 많습니다. 반응형 폼과 다르게 폼이나 데이터 모델을 변경하거나 유효성을 검사할 때 변화 감지 싸이클을 배제할 수 없습니다.

<!--
## Final thoughts
-->
## 정리

<<<<<<< HEAD
<!--
Choosing a strategy begins with understanding the strengths and weaknesses of the options presented. Low-level API and form model access, predictability, mutability, straightforward validation and testing strategies, and scalability are all important considerations in choosing the infrastructure you use to build your forms in Angular. Template-driven forms are similar to patterns in AngularJS, but they have limitations given the criteria of many modern, large-scale Angular apps. Reactive forms minimize these limitations. Reactive forms integrate with reactive patterns already present in other areas of the Angular architecture, and complement those requirements well. 
-->
반응형 폼과 템플릿 기반의 폼 중 어떤 것을 사용하는지 정할 때는 두 방식의 장단점을 모두 이해하는 것이 중요합니다. 폼 모델에 접근하는 API를 자유롭게 활용할 수 있는지, 동작 로직은 이해하기 편한지, 인스턴스의 불변성은 보장되는지, 유효성 검사 로직은 어떻게 동작하며 테스트하기는 편한지, 폼은 효율적으로 확장할 수 있는지도 모두 따져봐야 합니다. 템플릿 기반의 폼은 AngularJS의 패턴과 비슷하기 때문에 최신 기술을 활용하는 대규모 Angular 애플리케이션에 적용하기에는 제약이 있습니다. 하지만 반응형 폼에서는 이 제약에서 자유롭습니다. 반응형 폼은 Angular 프레임워크 전반에 사용되는 반응형 패턴을 기반으로 만들어졌기 때문에 위에서 언급한 모든 장점을 그대로 활용할 수 있습니다.
=======
Choosing a strategy begins with understanding the strengths and weaknesses of the options presented. Low-level API and form model access, predictability, mutability, straightforward validation and testing strategies, and scalability are all important considerations in choosing the infrastructure you use to build your forms in Angular. Template-driven forms are similar to patterns in AngularJS, but they have limitations given the criteria of many modern, large-scale Angular apps. Reactive forms minimize these limitations. Reactive forms integrate with reactive patterns already present in other areas of the Angular architecture, and complement those requirements well.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
## Next steps
-->
## 다음 단계


<!--
To learn more about reactive forms, see the following guides:
-->
반응형 폼에 대해 더 알아보려면 다음 문서를 확인하세요:

<!--
* [Reactive Forms](guide/reactive-forms)
* [Form Validation](guide/form-validation#reactive-form-validation)
* [Dynamic Forms](guide/dynamic-form)
-->
* [반응형 폼](guide/reactive-forms)
* [폼 유효성 검사](guide/form-validation#반응형-폼-유효성-검사)
* [동적 폼](guide/dynamic-form)

<!--
To learn more about template-driven forms, see the following guides:
-->
템플릿 기반 폼에 대해 더 알아보려면 다음 문서를 확인하세요:

<!--
* [Template-driven Forms](guide/forms#template-driven-forms)
* [Form Validation](guide/form-validation#template-driven-validation)
<<<<<<< HEAD
-->
* [템플릿 기반 폼](guide/forms#템플릿-기반-폼)
* [폼 유효성 검사](guide/form-validation#템플릿-기반-폼-유효성-검사)

=======
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
