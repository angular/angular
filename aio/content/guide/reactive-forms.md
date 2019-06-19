<!--
# Reactive Forms
-->
# 반응형 폼 (Reactive Forms)

<!--
*Reactive forms* provide a model-driven approach to handling form inputs whose values change over time. This guide shows you how to create and update a simple form control, progress to using multiple controls in a group, validate form values, and implement more advanced forms.
-->
*반응형 폼* 은 화면에 있는 입력 필드의 값이 변경될 때마다 원하는 로직이 실행하게 하는 모델-드리븐 방식의 폼입니다. 이 문서에서는 폼 컨트롤을 만드는 방법부터 시작해서 폼 컨트롤의 값을 갱신하는 방법, 폼 컨트롤 여러개를 그룹으로 묶어서 한 번에 처리하는 방법, 폼 컨트롤의 유효성을 검사하는 방법, 그 외에 폼과 관련된 고급 활용 기술에 대해 다룹니다.



{@a toc}

<!--
Try the <live-example title="Reactive Forms in Stackblitz">Reactive Forms live-example</live-example>.
-->
이 문서에서 다루는 예제는 <live-example title="Reactive Forms in Stackblitz">Reactive Forms live-example</live-example>에서 직접 실행하거나 다운받아 확인할 수 있습니다.

{@a intro}

<!--
## Introduction to reactive forms
-->
## 반응형 폼 소개

<!--
Reactive forms use an explicit and immutable approach to managing the state of a form at a given point in time. Each change to the form state returns a new state, which maintains the integrity of the model between changes. Reactive forms are built around observable streams, where form inputs and values are provided as streams of input values, which can be accessed synchronously. 
-->
반응형 폼은 명시적인 방법으로, 그리고 이뮤터블을 처리하는 것과 비슷하게 폼의 상태를 관리하는 방식입니다. 폼 값이 변경되면 이 폼은 폼이 변경되기 전의 정보와 함께 새로운 상태를 표현하는 객체를 반환합니다. 반응형 폼은 옵저버블 스트림을 활용하는 방식으로 만들어졌기 때문에, 폼에 값이 입력되거나 입력된 값이 전달되는 것도 옵저버블로 전달됩니다. 따라서 폼이 변경된 것을 실시간으로 확인하고 필요한 동작을 할 수 있습니다.

<!--
Reactive forms also provide a straightforward path to testing because you are assured that your data is consistent and predictable when requested. Any consumers of the streams have access to manipulate that data safely.
-->
반응형 폼을 사용하면 데이터가 의도한 대로만 변경되며, 현재 상태를 쉽게 예측할 수 있기 때문에 테스트하기도 편합니다. 반응형 폼을 사용하면서 데이터를 변경하는 것도 좀 더 안전합니다.

<!--
Reactive forms differ from template-driven forms in distinct ways. Reactive forms provide more predictability with synchronous access to the data model, immutability with observable operators, and change tracking through observable streams. If you prefer direct access to modify data in your template, template-driven forms are less explicit because they rely on directives embedded in the template, along with mutable data to track changes asynchronously. See the [Forms Overview](guide/forms-overview) for detailed comparisons between the two paradigms.
-->
반응형 폼은 템플릿 기반의 폼과 많은 점이 다릅니다. 반응형 폼은 실시간으로 데이터 모델에 접근할 수 있으며, 옵저버블 연산자를 활용할 수도 있고, 옵저버블 스트림을 통해 값이 어떻게 변경되는 지도 검사할 수 있습니다. 하지만 템플릿에서 데이터를 직접 수정하는 것을 선호한다면, 템플릿에서 디렉티브를 사용해서 데이터를 수정하는 것이 명시적이라고 생각할 수도 있습니다. 두 방식이 어떻게 다른지 좀 더 자세하게 확인하려면 [Forms Overview](guide/forms-overview)을 참고하세요.

<!--
## Getting started
-->
## 시작하기

<!--
This section describes how to add a single form control. In the example, the user enters their name into an input field, captures that input value, and displays the current value of the form control element.
-->
이 섹션에서는 폼 컨트롤을 어떻게 활용하는지 설명합니다. 사용자가 이름을 입력할 수 있는 입력 필드를 추가하고, 값이 입력되는 것을 확인하며, 폼 컨트롤 엘리먼트에 저장된 현재 값을 표현하는 방법도 알아봅니다.

<!--
### Step 1: Registering the reactive forms module
-->
### 1단계 - `ReactiveFormsModule` 등록하기

<!--
To use reactive forms, import `ReactiveFormsModule` from the `@angular/forms` package and add it to your NgModule's `imports` array.
-->
반응형 폼을 사용하려면 `@angular/forms`에서 제공하는 `ReactiveFormsModule`을 로드하고 NgModule의 `imports` 배열에 추가해야 합니다.

<code-example path="reactive-forms/src/app/app.module.ts" region="imports" header="src/app/app.module.ts (excerpt)">

</code-example>

<!--
### Step 2: Generating and importing a new form control 
-->
### 2단계 - 폼 컨트롤 로드하고 인스턴스 생성하기

<!--
Generate a component for the control.
-->
다음 명령을 실행해서 폼 컨트롤이 위치할 컴포넌트를 생성합니다.

<code-example language="sh" class="code-shell">

  ng generate component NameEditor

</code-example>

<!--
The `FormControl` class is the basic building block when using reactive forms. To register a single form control, import the `FormControl` class into your component and create a new instance of the form control to save as a class property.
-->
`FormControl` 클래스는 반응형 폼을 사용할 때 가장 기본이 되는 클래스입니다. 폼 컨트롤을 사용하려면 먼저 컴포넌트 코드에 `FormControl` 클래스를 로드하고, `FormControl`을 인스턴스로 생성하는 코드를 클래스 프로퍼티로 선언합니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control" header="src/app/name-editor/name-editor.component.ts">

</code-example>

<!--
Use the constructor of `FormControl` to set its initial value, which in this case is an empty string. By creating these controls in your component class, you get immediate access to listen for, update, and validate the state of the form input. 
-->
그러면 `FormControl`의 생성자가 실행되면서 인자로 전달한 빈 문자열이 초기값으로 설정됩니다. 이렇게 클래스 프로퍼티에 폼 컨트롤을 선언하면 폼에서 입력되는 이벤트나 값, 유효성 검사 결과를 컴포넌트 코드에서 간단하게 확인할 수 있습니다.

<!--
### Step 3: Registering the control in the template
-->
### 3단계 - 템플릿에 폼 컨트롤 연결하기

<!--
After you create the control in the component class, you must associate it with a form control element in the template. Update the template with the form control using the `formControl` binding provided by `FormControlDirective` included in `ReactiveFormsModule`.
-->
컴포넌트 클래스에 폼 컨트롤을 추가하고 나면, 컴포넌트 템플릿에도 폼 컨트롤을 연결해야 이 폼 컨트롤을 사용할 수 있습니다. 그래서 `FormControlDirective`를 의미하는 `formControl`을 입력 필드에 지정하면 템플릿과 컴포넌트의 폼 컨트롤을 연결할 수 있습니다. 이 디렉티브는 `ReactiveFormsModule`에서 제공하는 디렉티브입니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" linenums="false" header="src/app/name-editor/name-editor.component.html">

</code-example>

<div class="alert is-helpful">

<!--
**Note:** For a more detailed list of classes and directives provided by `ReactiveFormsModule`, see the [Reactive forms API](#reactive-forms-api) section.
-->
**참고** : `ReactiveFormsModule`에서 제공하는 클래스나 디렉티브에 대해 좀 더 알아보려면 [반응형 폼 API](#반응형-폼-api) 섹션을 참고하세요.

</div>

<!--
Using the template binding syntax, the form control is now registered to the `name` input element in the template. The form control and DOM element communicate with each other: the view reflects changes in the model, and the model reflects changes in the view.
-->
이렇게 템플릿 바인딩 문법을 사용하면 템플릿에 있는 `name` 입력 필드가 폼 컨트롤과 연결됩니다. 이제 폼 컨트롤과 DOM 엘리먼트는 서로 연동되는데, 화면에서 값이 변경되면 모델값도 변경되고, 모델의 값이 변경되면 화면의 값도 변경됩니다.

<!--
#### Displaying the component
-->
#### 화면에 컴포넌트 표시하기

<!--
The form control assigned to `name` is displayed when the component is added to a template. 
-->
이제 `NameEditorComponent`를 템플릿에 추가하면 다음과 같은 입력 필드가 화면에 표시됩니다.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-name-editor" linenums="false" header="src/app/app.component.html (name editor)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/name-editor-1.png" alt="Name Editor">
</figure>

<!--
## Managing control values
-->
## 폼 컨트롤 다루기

<!--
Reactive forms give you access to the form control state and value at a point in time. You can manipulate 
the current state and value through the component class or the component template. The following examples display the value of the form control instance and change it.
-->
반응형 폼을 사용하면 현재 폼 컨트롤의 상태와 값을 간단하게 확인할 수 있습니다. 폼 컨트롤의 상태와 현재 값은 컴포넌트 클래스나 컴포넌트 템플릿에서 자유롭게 활용할 수 있으며, 이번에는 `FormControl`의 현재 값을 확인하고 변경하는 예제를 살펴봅시다.


{@a display-value}

<!--
### Displaying a form control value
-->
### 폼 컨트롤의 값 표시하기

<!--
You can display the value in these ways: 
-->
폼 컨트롤의 값을 표시하려면 다음과 같은 방법을 사용할 수 있습니다:

<!--
* Through the `valueChanges` observable where you can listen for changes in the form's value in the template using `AsyncPipe` or in the component class using the `subscribe()` method. 
* With the `value` property. which gives you a snapshot of the current value. 
-->
* 폼 값이 변경된 것을 알려주는 `valueChanges` 옵저버블을 `AsyncPipe` 파이프와 함께 사용할 수 있습니다. 이 옵저버블은 컴포넌트 클래스에서 `subscribe()` 메소드로 구독해도 됩니다.
* 폼 컨트롤의 현재 값을 표현하는 `value` 프로퍼티를 사용해도 됩니다.

<!--
The following example shows you how to display the current value using interpolation in the template.
-->
다음 예제는 폼 컨트롤의 값을 문자열 삽입으로 템플릿에 표시하는 예제 코드입니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value" linenums="false" header="src/app/name-editor/name-editor.component.html (control value)">

</code-example>

<!--
The displayed value changes as you update the form control element.
-->
그리고 이 값은 폼 컨트롤 엘리먼트의 값이 변경될 때마다 자동으로 갱신됩니다.

<!--
Reactive forms provide access to information about a given control through properties and methods provided with each instance. These properties and methods of the underlying [AbstractControl](api/forms/AbstractControl) class are used to control form state and determine when to display messages when handling validation. For more information, see [Simple form validation](#simple-form-validation) later in this guide.
-->
반응형 폼에서는 각 폼 컨트롤의 프로퍼티나 메소드를 사용해서 폼 컨트롤이 제공하는 정보에 접근할 수 있습니다. 프로퍼티와 메소드는 [AbstractControl](api/forms/AbstractControl) 클래스에 정의되어 있으며, 폼 컨트롤의 값을 확인하는 것외에도 폼 컨트롤의 상태를 확인하거나 유효성을 검사하는 용도로도 사용할 수 있습니다. 더 자세한 내용은 이후에 나오는 [폼 유효성 검사하기](#폼-유효성-검사하기-기본) 섹션을 참고하세요.

<!--
Read about other `FormControl` properties and methods in the [Reactive forms API](#reactive-forms-api) section.
-->
그리고 `FormControl`에서 제공하는 프로퍼티와 메소드를 확인하려면 [반응형 폼 API](#reactive-forms-api) 섹션을 참고하세요.


<!--
### Replacing a form control value
-->
### 폼 컨트롤 값 변경하기

<!--
Reactive forms have methods to change a control's value programmatically, which gives you the flexibility to update the value without user interaction. A form control instance provides a `setValue()` method that updates the value of the form control and validates the structure of the value provided against the control's structure. For example, when retrieving form data from a backend API or service, use the `setValue()` method to update the control to its new value, replacing the old value entirely. 
-->
반응형 폼에서 제공하는 메소드를 사용하면 사용자의 동작 없이도 폼 컨트롤의 값을 컴포넌트 코드에서 변경할 수 있습니다. 이 중 `setValue()` 메소드를 사용하면 폼 컨트롤의 값을 변경할 수 있으며, 이 때 폼 컨트롤의 구조에 맞지 않는 데이터가 전달되는 유효성 검사도 수행합니다. 그래서 백엔드 API나 서비스에서 데이터를 가져온 후에 `setValue()` 메소드를 사용하면 현재 폼 컨트롤의 값 전체를 한 번에 변경할 수 있습니다.

<!--
The following example adds a method to the component class to update the value of the control to *Nancy* using the `setValue()` method.
-->
다음 예제 코드는 `setValue()` 메소드를 사용해서 폼 컨트롤의 값을 *Nancy*로 변경하는 예제 코드입니다.

<!--
<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value" header="src/app/name-editor/name-editor.component.ts (update value)">
-->
<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value" header="src/app/name-editor/name-editor.component.ts (값 변경하기)">

</code-example>

<!--
Update the template with a button to simulate a name update. When you click the **Update Name** button, the value entered in the form control element is reflected as its current value. 
-->
이 메소드를 실행할 수 있도록 템플릿을 수정합니다. 다음과 같이 구현한 후에 **Update Name** 버튼을 클릭하면, 폼 컨트롤 엘리먼트에 입력된 값에 관계없이 지정된 값으로 변경됩니다.

<!--
<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value" linenums="false" header="src/app/name-editor/name-editor.component.html (update value)">
-->
<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value" linenums="false" header="src/app/name-editor/name-editor.component.html (값 변경하기)">

</code-example>

<!--
The form model is the source of truth for the control, so when you click the button, the value of the input is changed within the component class, overriding its current value.
-->
그리고 이 때 폼 컨트롤의 값은 폼 모델과 연결되어 있기 때문에, 버튼을 눌러서 폼 컨트롤의 값이 변경되면 컴포넌트 클래스에 있는 폼 모델 값도 함께 변경됩니다.

<figure>
  <img src="generated/images/guide/reactive-forms/name-editor-2.png" alt="Name Editor Update">
</figure>

<div class="alert is-helpful">

<!--
**Note:** In this example, you're using a single control. When using the `setValue()` method with a form group or form array instance, the value needs to match the structure of the group or array.
-->
**참고**: 이 예제에서는 폼 컨트롤 하나를 대상으로 `setValue()` 메소드를 사용했지만, 이 메소드의 인자로 전달하는 타입에 따라 `FormGroup`이나 `FormArray`에도 사용할 수 있습니다.

</div>

<!--
## Grouping form controls
-->
## 연관된 폼 컨트롤 묶기

<!--
Just as a form control instance gives you control over a single input field, a form group instance tracks the form state of a group of form control instances (for example, a form). Each control in a form group instance is tracked by name when creating the form group. The following example shows how to manage multiple form control instances in a single group.
-->
입력 필드 하나를 의미하는 폼 컨트롤 여러 개는 함께 묶어서 폼 그룹으로 처리할 수 있습니다. 실제로 폼을 구성할 때도 개별 폼 컨트롤을 처리하지 않고 폼 그룹으로 한 번에 처리하는 것이 효율적이며, 폼 그룹에 포함된 폼 컨트롤은 이름으로 구분합니다. 폼 컨트롤 여러개를 폼 그룹으로 한 번에 처리하는 방법을 알아봅시다.

<!--
Generate a `ProfileEditor` component and import the `FormGroup` and `FormControl` classes from the `@angular/forms` package.
-->
다음 명령을 실행해서 `ProfileEditor` 컴포넌트를 생성하고 이 컴포넌트에 `@angular/forms` 패키지에서 제공하는 `FormGroup` 클래스와 `FormControl` 클래스를 로드합니다.

<code-example language="sh" class="code-shell">

  ng generate component ProfileEditor

</code-example>

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports" header="src/app/profile-editor/profile-editor.component.ts (imports)">

</code-example>

<!--
### Step 1: Creating a FormGroup instance
-->
### 1단계 : FormGroup 인스턴스 생성하기

<!--
Create a property in the component class named `profileForm` and set the property to a new form group instance. To initialize the form group, provide the constructor with an object of named keys mapped to their control.
-->
컴포넌트 클래스에 `profileForm` 프로퍼티를 선언하고 이 프로퍼티에 폼 그룹 인스턴스를 생성해서 할당합니다. 폼 그룹을 생성하려면 폼 컨트롤과 키를 매칭시켜서 생성자에 인자로 전달하면 됩니다.

<!--
For the profile form, add two form control instances with the names `firstName` and `lastName`.
-->
그러면 이 폼 안에 `firstName` 인스턴스와 `lastName` 인스턴스가 선언됩니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup" header="src/app/profile-editor/profile-editor.component.ts (form group)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup" header="src/app/profile-editor/profile-editor.component.ts (폼 그룹)">

</code-example>

<!--
The individual form controls are now collected within a group. A `FormGroup` instance provides its model value as an object reduced from the values of each control in the group. A form group instance has the same properties (such as `value` and `untouched`) and methods (such as `setValue()`) as a form control instance.
-->
이제 폼 컨트롤을 그룹으로 묶었습니다. 폼 컨트롤을 그룹으로 묶으면 폼 컨트롤의 값을 번거롭게 하나씩 참조할 필요 없이 폼 그룹에서 제공하는 모델을 사용할 수 있습니다. 폼 그룹 인스턴스도 폼 컨트롤 인스턴스와 비슷하게 `value`나 `untouched` 프로퍼티, `setValue()` 메소드를 제공합니다.

<!--
### Step 2: Associating the FormGroup model and view
-->
### 2단계 : `FormGroup` 모델과 화면 연결하기

<!--
A form group tracks the status and changes for each of its controls, so if one of the controls changes, the parent control also emits a new status or value change. The model for the group is maintained from its members. After you define the model, you must update the template to reflect the model in the view.
-->
폼 그룹도 각각의 폼 컨트롤의 상태와 변화를 추적합니다. 그래서 폼 컨트롤 중 하나의 상태나 값이 변경되면 이 폼 컨트롤을 감싸고 있는 부모 폼 컨트롤도 새로운 상태로 변경되고 값도 변경됩니다. 이 폼 그룹이 관리하는 모델은 각각의 폼 컨트롤로 구성됩니다. 그래서 이 모델을 템플릿에 연결하면 폼 컨트롤을 처리했던 것과 비슷하게 폼 그룹을 처리할 수 있습니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup" linenums="false" header="src/app/profile-editor/profile-editor.component.html (template form group)">

</code-example>

<!--
Note that just as a form group contains a group of controls, the *profile form* `FormGroup` is bound to the `form` element with the `FormGroup` directive, creating a communication layer between the model and the form containing the inputs. The `formControlName` input provided by the `FormControlName` directive binds each individual input to the form control defined in `FormGroup`. The form controls communicate with their respective elements. They also communicate changes to the form group instance, which provides the source of truth for the model value.
-->
폼 그룹은 폼 컨트롤의 묶음을 표현하며, 이 예제 코드에서는 `FormGroup` 타입의 *profileForm* 이 `form` 엘리먼트와 바인딩되어 폼 모델과 입력 필드를 연결합니다. 이 코드에 사용된 `formControlName` 은 `FormControlName` 디렉티브의 셀렉터이며, 개별 입력 필드를 `FormGroup` 안에 있는 폼 컨트롤과 연결하는 동작을 수행합니다. 그러면 각각의 폼 컨트롤에 연결된 엘리먼트는 해당 폼 컨트롤이 관리하며, 폼 그룹 인스턴스를 통해 전체 모델에 접근할 수도 있습니다.

<!--
### Saving form data
-->
### 데이터 저장하기

<!--
The `ProfileEditor` component accepts input from the user, but in a real scenario you want to capture the form value and make available for further processing outside the component. The `FormGroup` directive listens for the `submit` event emitted by the `form` element and emits an `ngSubmit` event that you can bind to a callback function. 
-->
이 예제에서는 `ProfileEditor` 컴포넌트가 사용자의 입력을 받기만 하지만, 실제 애플리케이션이라면 폼에 입력된 값을 컴포넌트 외부로 전달해서 어떤 동작을 수행해야 할 것입니다.  `FormGroup` 디렉티브는 `form` 엘리먼트에서 발생하는 `submit` 이벤트를 감지하며, `submit` 이벤트가 발생했을 때 폼에 바인딩 된 콜백 함수를 실행하기 위해 `ngSubmit` 이벤트를 새로 발생시킵니다.

<!--
Add an `ngSubmit` event listener to the `form` tag with the `onSubmit()` callback method.
-->
다음과 같이 `form` 태그에 `ngSubmit` 이벤트를 바인딩해서 `onSubmit()` 콜백 메소드가 실행되게 작성해 봅시다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit" linenums="false" header="src/app/profile-editor/profile-editor.component.html (submit event)">

</code-example>

<!--
The `onSubmit()` method in the `ProfileEditor` component captures the current value of `profileForm`. Use `EventEmitter` to keep the form encapsulated and to provide the form value outside the component. The following example uses `console.warn` to log a message to the browser console.
-->
그러면 `ProfileEditor` 컴포넌트에 정의된 `onSubmit()` 메소드가 `profileForm`의 현재 값을 읽어서 특정 동작을 실행하게 할 수 있습니다. 이 때 컴포넌트와 폼의 캡슐화를 보장하기 위해 `EventEmitter`를 사용해서 폼 값을 컴포넌트 외부로 전달하는 것이 좋습니다. 다음 예제는 이렇게 가져온 폼 값을 `console.warn` 함수로 브라우저 콘솔에 출력하는 예제입니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit" header="src/app/profile-editor/profile-editor.component.ts (submit method)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit" header="src/app/profile-editor/profile-editor.component.ts (submit 메소드)">

</code-example>

<!--
The `submit` event is emitted by the `form` tag using the native DOM event. You trigger the event by clicking a button with `submit` type. This allows the user to press the **Enter** key to submit the completed form. 
-->
`submit` 이벤트는 `form` 태그에서 발생하는 네이티브 DOM 이벤트입니다. 이 이벤트는 `submit` 타입의 버튼을 클릭했을 때 발생하며, 사용자가 폼 내용을 입력하고 **엔터** 키를 눌렀을 때도 발생합니다.

<!--
Use a `button` element to add a button to the bottom of the form to trigger the form submission.
-->
이 이벤트를 발생시키기 위해 폼 아래에 `button` 엘리먼트를 다음과 같이 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button" linenums="false" header="src/app/profile-editor/profile-editor.component.html (submit button)">

</code-example>

<div class="alert is-helpful">

<!--
**Note:** The button in the snippet above also has a `disabled` binding attached to it to disable the button when `profileForm` is invalid. You aren't performing any validation yet, so the button is always enabled. Simple form validation is covered in the [Simple form validation](#simple-form-validation) section.
-->
**참고:** 예제로 구현한 버튼은 `profileForm`의 유효성 검사 결과가 유효하지 않을 때 `disabled` 어트리뷰트를 지정하도록 바인딩되어 있습니다. 아직 유효성 검사 로직은 아무것도 적용하지 않았기 때문에 버튼은 항상 활성화되어 있을 것이며, 이후에 [폼 유효성 검사하기](#폼-유효성-검사하기-기본) 섹션에서 이 내용을 다시 한 번 살펴봅니다.

</div>

<!--
#### Displaying the component
-->
#### 컴포넌트 표시하기

<!--
To display the `ProfileEditor` component that contains the form, add it to a component template.
-->
`ProileEditor` 컴포넌트를 화면에 표시하기 위해 `AppComponent` 템플릿에 다음과 같이 컴포넌트를 추가합니다.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-profile-editor" linenums="false" header="src/app/app.component.html (profile editor)">

</code-example>

<!--
`ProfileEditor` allows you to manage the form control instances for the `firstName` and `lastName` controls within the form group instance.
-->
그러면 `ProfileEditor` 컴포넌트가 화면에 표시되며, 이 컴포넌트에 정의된 폼 그룹 안에 있는 `firstName`과 `lastName` 폼 컨트롤도 화면에 함께 표시됩니다.

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-1.png" alt="Profile Editor">
</figure>

<!--
## Creating nested form groups
-->
## 중첩 폼 그룹(Nesting form groups) 만들기

<!--
When building complex forms, managing the different areas of information is easier in smaller sections, and some groups of information naturally fall into the same group. Using a nested form group instance allows you to break large forms groups into smaller, more manageable ones.
-->
복잡한 폼을 구현하다 보면, 폼 전체를 한 번에 다루는 것보다 관련된 입력 필드끼리 묶어서 관리하는 것이 좀 더 편합니다. 이 때 서로 연관된 정보가 자연스럽게 같은 그룹으로 묶이며, 아주 복잡한 폼이라면 폼 그룹 안에 다시 폼 그룹을 구현하는 것이 더 효과적인 경우도 있습니다.

<!--
### Step 1: Creating a nested group
-->
### 1단계: 중첩 그룹 만들기

<!--
An address is a good example of information that can be grouped together. Form groups can accept both form control and form group instances as children. This makes composing complex form models easier to maintain and logically group together. To create a nested group in `profileForm`, add a nested `address` element to the form group instance.
-->
주소를 입력받는 폼을 생각해 봅시다. 폼 그룹은 폼 컨트롤이나 폼 그룹 인스턴스를 자식으로 가질 수 있습니다. 그래서 복잡한 폼 필드를 연관된 것끼리 묶어서 `FormGroup`으로 처리할 수 있으며, 이 내용을 적용하면 `profileForm` 안에 `address` `FormGroup`을 생성할 수 있습니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup" linenums="false" header="src/app/profile-editor/profile-editor.component.ts (nested form group)">

</code-example>

<!--
In this example, `address group` combines the current `firstName` and `lastName` controls with the new `street`, `city`, `state`, and `zip` controls. Even though the `address` element in the form group is a child of the overall `profileForm` element in the form group, the same rules apply with value and status changes. Changes in status and value from the nested form group propagate to the parent form group, maintaining consistency with the overall model.
-->
이 예제에서 `firstName`과 `lastName`은 폼 컨트롤이지만 `address`는 `street`와 `city`, `state`, `zip`으로 이루어진 폼 그룹입니다. `address` `FormGroup`은 그 자체로도 폼 그룹이지만 부모 폼 그룹인 `profileForm`의 자식 폼 그룹이며, 기존에 사용하던 폼 상태와 값이 변경되는 상황도 이전과 마찬가지로 참조할 수 있습니다. 자식 객체에서 발생하는 상태/값 변화는 부모 폼 그룹으로 전파되기 때문에, 전체 폼 그룹을 참조해도 개별 값이 변경되는 것을 감지할 수 있습니다.

<!--
### Step 2: Grouping the nested form in the template
-->
### 2단계: 템플릿에서 중첩 폼 묶기

<!--
After you update the model in the component class, update the template to connect the form group instance and its input elements.
-->
컴포넌트 클래스의 모델을 수정하고 나면, 템플릿에도 이 내용과 관련된 폼 그룹 인스턴스와 입력 엘리먼트를 수정해야 합니다.

<!--
Add the `address` form group containing the `street`, `city`, `state`, and `zip` fields to the `ProfileEditor` template.
-->
`ProfileEditor` 템플릿에 다음과 같이 `address` 폼 그룹을 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname" linenums="false" header="src/app/profile-editor/profile-editor.component.html (template nested form group)">

</code-example>

<!--
The `ProfileEditor` form is displayed as one group, but the model is broken down further to represent the logical grouping areas.
-->
그러면 `ProfileEditor` 폼에서 `address` 부분이 다시 한 번 그룹으로 묶여 다음과 같이 화면에 표시됩니다.

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-2.png" alt="Profile Editor Update">
</figure>

<div class="alert is-helpful">

<!--
**Note:** Display the value for the form group instance in the component template using the `value` property and `JsonPipe`.
-->
**참고:** 폼 그룹의 내용을 컴포넌트 템플릿에 표시하려면 `value` 프로퍼티에 `JsonPipe`를 사용하면 됩니다.

</div>

<!--
## Partial model updates
-->
## 모델 일부만 갱신하기

<!--
When updating the value for a form group instance that contains multiple controls, you may only want to update parts of the model. This section covers how to update specific parts of a form control data model.
-->
폼 그룹을 처리하면서 매번 전체 폼 값을 한 번에 갱신하는 것은 번거롭기 때문에, 일부 폼 컨트롤의 값만 변경하는 것이 더 편한 경우도 있습니다. 이번에는 `AbstractControl` 모델의 일부 값만 변경하는 방법을 알아봅시다.

<!--
### Patching the model value
-->
### 모델 값 일부만 갱신하기

<!--
There are two ways to update the model value: 
-->
모델의 값을 변경하는 방법은 두 가지가 있습니다:

<!--
* Use the `setValue()` method to set a new value for an individual control. The `setValue()` method strictly adheres to the structure of the form group and replaces the entire value for the control. 
-->
* 폼 컨트롤에 `setValue()` 메소드를 사용할 수 있습니다. `setValue()` 메소드는 폼 그룹의 구조와 정확하게 일치하는 객체를 받았을 때만 폼 그룹 전체값을 한 번에 갱신합니다.

<!--
* Use the `patchValue()` method to replace any properties defined in the object that have changed in the form model. 
-->
* 폼 모델의 특정 부분만 변경하려면 `patchValue()` 메소드를 사용할 수 있습니다.

<!--
The strict checks of the `setValue()` method help catch nesting errors in complex forms, while `patchValue()` fails silently on those errors.
-->
`setValue()` 메소드를 사용하면 복잡한 폼이라도 구조에 맞게 값을 변경할 수 있습니다. 반면에 `patchValue()` 메소드는 폼 그룹의 구조와 다른 인자가 전달되어도 에러를 발생하지 않습니다.

<!--
In `ProfileEditorComponent`, use the `updateProfile` method with the example below to update the first name and street address for the user.
-->
아래 예제는 `ProfileEditorComponent`에 선언된 `updateProfile` 메소드를 사용해서 사용자의 이름과 주소를 변경하는 예제 코드입니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value" header="src/app/profile-editor/profile-editor.component.ts (patch value)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value" header="src/app/profile-editor/profile-editor.component.ts (일부 값 변경)">

</code-example>

<!--
Simulate an update by adding a button to the template to update the user profile on demand.
-->
그리고 이 메소드를 실행하는 버튼을 템플릿에 다음과 같이 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value" linenums="false" header="src/app/profile-editor/profile-editor.component.html (update value)">

</code-example>

<!--
When a user clicks the button, the `profileForm` model is updated with new values for `firstName` and `street`. Notice that `street` is provided in an object inside the `address` property. This is necessary because the `patchValue()` method applies the update against the model structure. `PatchValue()` only updates properties that the form model defines.
-->
이제 사용자가 이 버튼을 클릭하면 `profileForm` 모델의 `firstName` 값과 `street` 값이 새로운 값으로 변경됩니다. 이 때 폼 그룹의 구조에 맞추기 위해 `street` 필드의 값은 `address` 객체 안에 지정했습니다. `patchValue()` 메소드는 전달된 인자 중에서 폼 모델의 구조에 맞는 값만 변경합니다.

<!--
## Generating form controls with FormBuilder
-->
## FormBuilder로 폼 컨트롤 생성하기

<!--
Creating form control instances manually can become repetitive when dealing with multiple forms. The `FormBuilder` service provides convenient methods for generating controls. 
-->
폼 컨트롤을 매번 직접 생성해야 하는데, 이런 폼이 여러개라면 귀찮은 반복작업이 될 것입니다. 이 때 `FormBuilder` 서비스를 사용하면 좀 더 편하게 폼을 구성할 수 있습니다.

<!--
The following section refactors the `ProfileEditor` component to use the form builder service to create form control and form group instances.
-->
이번에는 `ProfileEditor` 컴포넌트에 폼 컨트롤이나 폼 그룹을 직접 생성했던 방식 대신, 폼 빌더를 사용하는 방식으로 리팩토링 해봅시다.

<!--
### Step 1: Importing the FormBuilder class
-->
### 1단계: `FormBuilder` 클래스 로드하기

<!--
Import the `FormBuilder` class from the `@angular/forms` package.
-->
먼저 `@angular/forms` 패키지에서 `FormBuilder` 클래스를 로드합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports" header="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

<!--
### Step 2: Injecting the FormBuilder service
-->
### 2단계: `FormBuilder` 서비스를 의존성으로 주입하기

<!--
The `FormBuilder` service is an injectable provider that is provided with the reactive forms module. Inject this dependency by adding it to the component constructor.
-->
폼 빌더는 `ReactiveFormsModule`에서 제공하며, 의존성으로 주입할 수 있도록 서비스로 정의되어 있습니다. 다음과 같이 컴포넌트 생성자에 `FormBuilder` 서비스를 주입합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder" header="src/app/profile-editor/profile-editor.component.ts (constructor)">

</code-example>

<!--
### Step 3: Generating form controls
-->
### 3단계: 폼 컨트롤 생성하기

<!--
The `FormBuilder` service has three methods: `control()`, `group()`, and `array()`. These are factory methods for generating instances in your component classes including form controls, form groups, and form arrays. 
-->
`FormBuilder` 서비스는 `control()`, `group()`, `array()` 메소드를 제공하는데, 이 메소드는 각각 폼 컨트롤, 폼 그룹, 폼 배열 인스턴스를 생성해서 반환하는 팩토리 메소드입니다.

<!--
Use the `group` method to create the `profileForm` controls.
-->
`group()` 메소드를 사용해서 `profileForm` 컨트롤을 만들어 봅시다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder" header="src/app/profile-editor/profile-editor.component.ts (form builder)">

</code-example>

<!--
In the example above, you use the `group()` method with the same object to define the properties in the model. The value for each control name is an array containing the initial value as the first item in the array.
-->
위 코드에서 `group()` 메소드에 전달하는 객체의 구조는 폼 모델의 구조와 같습니다. 그리고 프로퍼티 값으로는 배열을 전달하는데, 폼 컨트롤의 초기값은 배열의 첫번째 항목으로 전달합니다.

<div class="alert is-helpful">

<!--
**Note:** You can define the control with just the initial value, but if your controls need sync or async validation, add sync and async validators as the second and third items in the array.
-->
**참고:** 폼 컨트롤의 초기값만 지정한다면 배열을 사용하지 않아도 됩니다. 하지만 폼 컨트롤에 유효성 검사기를 지정하려면 프로퍼티 값에 배열을 사용해야 합니다. 이 때 동기 유효성 검사기는 두번째 인자로, 비동기 유효성 검사기는 세번째 인자로 지정합니다.

</div>

<!--
Compare using the form builder to creating the instances manually.
-->
폼 컨트롤을 직접 생성하는 방식과 폼 빌더를 사용하는 방식이 어떻게 다른지 비교해 보세요.

<code-tabs>

  <!--
  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (instances)">
  
  </code-pane>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (form builder)">

  </code-pane>
  -->
  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (직접 생성)">
  
  </code-pane>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (폼 빌더 사용)">

  </code-pane>

</code-tabs>

{@a 폼-유효성-검사하기-기본}
<!--
## Simple form validation
-->
## 폼 유효성 검사하기 - 기본

<!--
_Form validation_ is used to validate user input to ensure it's complete and correct. This section covers adding a single validator to a form control and displaying the overall form status. Form validation is covered more extensively in the [Form Validation](guide/form-validation) guide.
-->
_폼 유효성 검사_ 는 사용자가 폼에 필요한 내용을 모두 입력했는지, 입력한 내용이 유효한지 확인하는 과정입니다. 이번에는 폼 컨트롤에 유효성 검사기를 어떻게 추가할 수 있는지 알아보고, 폼 상태에 대한 메시지를 화면에 표시해 봅시다. 폼 유효성 검사에 대해서는 [폼 유효성 검사](guide/form-validation) 문서에서 자세하게 다룹니다.

<!--
### Step 1: Importing a validator function
-->
### 1단계: 유효성 검사 함수 로드하기

<!--
Reactive forms include a set of validator functions for common use cases. These functions receive a control to validate against and return an error object or a null value based on the validation check.
-->
반응형 폼 모듈은 다양한 유효성 검사 함수도 함께 제공합니다. 이 함수들은 폼 컨트롤 인스턴스를 인자로 받으며, 유효성 검사에 실패한 경우에 에러 객체를 반환하고 유효성 검사를 통과하면 null을 반환합니다.

<!--
Import the `Validators` class from the `@angular/forms` package.
-->
먼저, `@angular/forms` 패키지에서 `Validators` 클래스를 로드합니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports" header="src/app/profile-editor/profile-editor.component.ts (import)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports" header="src/app/profile-editor/profile-editor.component.ts (심볼 로드)">

</code-example>

<!--
### Step 2: Making a field required
-->
### 2단계: 필수 항목 지정하기

<!--
The most common validation is making a field required. This section describes how to add a required validation to the `firstName` control.
-->
폼 유효성 검사 중 가장 많이 사용하는 것은 입력 필드를 꼭 입력하도록 지정하는 것입니다. `firstName` 폼 컨트롤에 이 내용을 어떻게 적용하는지 알아봅시다.

<!--
In the `ProfileEditor` component, add the `Validators.required` static method as the second item in the array for the `firstName` control.
-->
`ProfileEditor` 컴포넌트에서 `firstName` 폼 컨트롤을 생성하던 배열의 두 번째 항목으로 `Validators.required`를 추가합니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator" header="src/app/profile-editor/profile-editor.component.ts (required validator)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator" header="src/app/profile-editor/profile-editor.component.ts (required 유효성 검사기)">

</code-example>

<!--
HTML5 has a set of built-in attributes that you can use for native validation, including `required`, `minlength`, and `maxlength`. You can take advantage of these optional attributes on your form input elements. Add the `required` attribute to the `firstName` input element.
-->
HTML5에서도 `required`나 `minlength`, `maxlength`와 같은 어트리뷰트를 지정해서 네이티브 유효성 검사 로직을 활용할 수 있습니다. 이 기능을 활성화하려면 다음과 같이 `firstName` `input` 엘리먼트에 `required` 어트리뷰트를 지정하기만 하면 됩니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="required-attribute" linenums="false" header="src/app/profile-editor/profile-editor.component.html (required attribute)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="required-attribute" linenums="false" header="src/app/profile-editor/profile-editor.component.html (required 어트리뷰트)">

</code-example>

<div class="alert is-important">

<!--
**Caution:** Use these HTML5 validation attributes *in combination with* the built-in validators provided by Angular's reactive forms. Using these in combination prevents errors when the expression is changed after the template has been checked.
-->
**주의:** HTML5 유효성 검사 어트리뷰트는 반드시 Angular 반응형 폼이 제공하는 관련 유효성 검사기와 _함께_ 사용해야 합니다. 양쪽 기능을 함께 사용해야 해당 기능이 정상적으로 동작하며, 템플릿 검사를 마친 이후에 상태가 다시 변경되는 에러도 방지할 수 있습니다.

</div>

<!--
### Displaying form status
-->
### 폼 상태 표시하기

<!--
When you add a required field to the form control, its initial status is invalid. This invalid status propagates to the parent form group element, making its status invalid. Access the current status of the form group instance through its `status` property.
-->
폼 컨트롤을 필수항목으로 지정하면 이 폼 컨트롤의 초기 상태는 유효하지 않은 것이 됩니다. 폼 컨트롤의 상태는 부모 폼 그룹 엘리먼트로 전파되며, 결과적으로 폼 그룹 전체가 유효성 검사를 통과하지 못한 것으로 처리됩니다. 그러면 폼 그룹 인스턴스의 `status` 프로퍼티를 참조해서 이 폼의 상태를 확인할 수 있습니다.

<!--
Display the current status of `profileForm` using interpolation.
-->
`profileForm`의 상태를 표시하려면 다음과 같이 템플릿을 작성합니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status" linenums="false" header="src/app/profile-editor/profile-editor.component.html (display status)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status" linenums="false" header="src/app/profile-editor/profile-editor.component.html (폼 상태 표시)">

</code-example>

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-3.png" alt="Profile Editor Validation">
</figure>

<!--
The **Submit** button is disabled because `profileForm` is invalid due to the required `firstName` form control. After you fill out the `firstName` input, the form becomes valid and the **Submit** button is enabled.
-->
`firstName` 폼 컨트롤이 필수항목으로 지정되었지만 유효성 검사를 통과하지 못했기 때문에 `profileForm` 전체가 유효하지 않은 것으로 판단되고, **Submit** 버튼도 비활성화 됩니다. `firstName` 입력 필드에 데이터를 입력하면 폼 전체의 유효성 검사가 통과되면서, **Submit** 버튼도 활성화될 것입니다.

<!--
For more on form validation, visit the [Form Validation](guide/form-validation) guide.
-->
폼 유효성 검사에 대해 더 자세하게 알아보려면 [폼 유효성 검사](guide/form-validation) 문서를 참고하세요.

<!--
## Dynamic controls using form arrays
-->
## 폼 배열

<!--
`FormArray` is an alternative to `FormGroup` for managing any number of unnamed controls. As with form group instances, you can dynamically insert and remove controls from form array instances, and the form array instance value and validation status is calculated from its child controls. However, you don't need to define a key for each control by name, so this is a great option if you don't know the number of child values in advance. The following example shows you how to manage an array of *aliases* in `ProfileEditor`.
-->
폼 컨트롤의 개수가 변하는 경우라면 `FormGroup` 대신 `FormArray`를 사용할 수 있습니다. `FormArray`를 사용하면 `FormGroup`을 사용했던 것처럼 자식 폼 컨트롤을 동적으로 추가하고 제거할 수 있으며, 자식 폼 컨트롤의 모든 값과 유효성 검사 상태도 `FormArray`로 전파됩니다. 하지만 `FormGroup`과는 다르게, 각 폼 컨트롤에 이름을 지정해서 참조하는 방식을 사용하지 않습니다. 이번에는 `ProfileEditor`에 `FormArray`를 사용하는 예제를 보면서 폼 배열에 대해 알아봅시다.

<!--
### Step 1: Importing the FormArray class
-->
### 1단계: `FormArray` 클래스 로드하기

<!--
Import the `FormArray` class from `@angular/forms` to use for type information. The `FormBuilder` service is ready to create a `FormArray` instance.
-->
먼저 `@angular/forms` 패키지에서 `FormArray` 클래스를 로드합니다. 이것은 컴포넌트 클래스에서 타입 참조를 위해 로드한 것이며, `FormBuilder`는 이 과정이 없어도 내부적으로 `FormArray` 타입을 지원합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports" header="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>

<!--
### Step 2: Defining a FormArray control
-->
### 2단계 - FormArray 정의하기

<!--
You can initialize a `FormArray` with any number of controls, from zero to many, by defining them in an array. Add an `aliases` property to the `FormGroup` for the `profileForm` to define the `FormArray`.
-->
`FormArray`는 배열로 초기화하며, 이 때 배열의 길이는 어떠한 것이라도 가능합니다. `profileForm`에 `aliases` 프로퍼티를 추가하고, 이 프로퍼티를 `FormArray`로 정의해 봅시다.

<!--
You can initialize a form array with any number of controls, from zero to many, by defining them in an array. Add an `aliases` property to the form group instance for `profileForm` to define the form array.
-->
폼 배열은 배열로 초기화하며, 이 때 배열의 길이는 어떠한 것이라도 가능합니다. `profileForm`에 `aliases` 프로퍼티를 추가하고, 이 프로퍼티를 폼 배열로 정의해 봅시다.

<!--
Use the `FormBuilder.array()` method to define the array, and the `FormBuilder.control()` method to populate the array with an initial control.
-->
`FormBuilder`를 사용한다면 `array()` 메소드로 폼 배열을 정의할 수 있으며, `FormBuilder.control()` 메소드를 사용해서 기본 폼 컨트롤을 생성합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases" header="src/app/profile-editor/profile-editor.component.ts (aliases form array)">

</code-example>

<!--
The aliases control in the form group instance is now populated with a single control until more controls are added dynamically.
-->
그러면 aliases 폼 컨트롤은 `FormGroup` 안에 폼 배열로 선언되며, 이후에 동적으로 추가되기 전까지는 폼 컨트롤 1개로 구성됩니다.

<!--
### Step 3: Accessing the FormArray control
-->
### 3단계: FormArray에 접근하기

<!--
A getter provides easy access to the aliases in the form array instance compared to repeating the `profileForm.get()` method to get each instance. The form array instance represents an undefined number of controls in an array. It's convenient to access a control through a getter, and this approach is easy to repeat for additional controls. 
-->
폼 배열을 사용한다면 폼 배열 안의 각 인스턴스를 `profileForm.get()` 메소드로 참조하는 것보다 게터(getter) 함수를 사용하는 것이 편합니다. 게터 함수를 사용하면  폼 배열 안에 있는 폼 컨트롤의 개수에 관계없이 간단하게 폼 컨트롤의 값을 참조할 수 있고, 반복문을 작성할 때도 편합니다.

<!--
Use the getter syntax to create an `aliases` class property to retrieve the alias's form array  control from the parent form group.
-->
게터 함수는 다음과 같이 정의합니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter" header="src/app/profile-editor/profile-editor.component.ts (aliases getter)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter" header="src/app/profile-editor/profile-editor.component.ts (aliases 게터)">
</code-example>

<div class="alert is-helpful">

<!--
**Note:** Because the returned control is of the type `AbstractControl`, you need to provide an explicit type to access the method syntax for the form array instance.
-->
**참고:** 폼 컨트롤을 참조하기 위해 `get()` 메소드를 사용하면 `AbstractControl` 타입으로 폼 컨트롤을 받습니다. 공통 메소드를 사용한다면 이대로 활용해도 되지만, `FormArray`에 해당되는 메소드를 사용하려면 타입 캐스팅 해야 합니다.

</div>

<!--
Define a method to dynamically insert an alias control into the alias's form array. The `FormArray.push()` method inserts the control as a new item in the array.
-->
이번에는 `FormArray`에 동적으로 폼 컨트롤을 추가하는 함수를 정의해 봅시다. 폼 배열에 새로운 폼 컨트롤을 추가할 때는 `FormArray.push()` 메소드를 사용합니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias" header="src/app/profile-editor/profile-editor.component.ts (add alias)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias" header="src/app/profile-editor/profile-editor.component.ts (항목 추가)">

</code-example>

<!--
In the template, each control is displayed as a separate input field.
-->
이제 이렇게 만든 폼 배열을 템플릿에 표시해 봅시다.

<!--
### Step 4: Displaying the form array in the template
-->
### 4단계: 템플릿에 폼 배열 표시하기

<!--
To attach the aliases from your form model, you must add it to the template. Similar to the `formGroupName` input provided by `FormGroupNameDirective`, `formArrayName` binds communication from the form array instance to the template with `FormArrayNameDirective`. 
-->
사용자가 폼 모델에 aliases 값을 입력하려면 이 폼 컨트롤을 템플릿에 추가해야 합니다. 이전 예제에서 `FormGroupNameDirective`를 `formGroupName` 어트리뷰트로 바인딩했던 것과 비슷하게, `FormArrayNameDirective`가 제공하는 `formArrayName` 어트리뷰트를 사용해서 `FormArray`를 템플릿에 바인딩 하면 됩니다.

<!--
Add the template HTML below after the `<div>` closing the `formGroupName` element.
-->
`formGroupName` `<div>` 엘리먼트 뒤에 다음과 같은 템플릿을 추가합니다.

<!--
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname" linenums="false" header="src/app/profile-editor/profile-editor.component.html (aliases form array template)">
-->
<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname" linenums="false" header="src/app/profile-editor/profile-editor.component.html (aliases 폼 배열의 템플릿)">

</code-example>

<!--
The `*ngFor` directive iterates over each form control instance provided by the aliases form array instance. Because form array elements are unnamed, you assign the index to the `i` variable and pass it to each control to bind it to the `formControlName` input. 
-->
`*ngFor` 디렉티브는 폼 배열 인스턴스의 각 폼 컨트롤 인스턴스를 순회합니다. 폼 배열 안에 있는 항목은 이름이 없기 때문에 인덱스를 변수 `i`에 활용해서 `formControlName`으로 바인딩했습니다.

<figure>
  <img src="generated/images/guide/reactive-forms/profile-editor-4.png" alt="Profile Editor Aliases">
</figure>

<!--
Each time a new alias instance is added, the new form array instance is provided its control based on the index. This allows you to track each individual control when calculating the status and value of the root control.
-->
이제는 폼 배열의 개수가 변하더라도 각각의 폼컨트롤은 인덱스로 관리됩니다. 이 폼 배열이나 전체 폼 그룹의 값, 상태를 확인할 때도 같은 인덱스를 활용할 수 있습니다.

<!--
#### Adding an alias
-->
#### 별칭 추가하기

<!--
Initially, the form contains one `Alias` field. To add another field, click the **Add Alias** button. You can also validate the array of aliases reported by the form model displayed by `Form Value` at the bottom of the template.
-->
이 폼의 `Alias` 필드는 기본적으로 폼 컨트롤이 하나 존재합니다. 그리고 **Add Alias** 버튼을 누르면 폼 컨트롤이 추가되며, 이렇게 추가된 폼 컨트롤의 유효성 상태도 템플릿 아래에 추가했던 `Form Value` 부분을 통해 확인할 수 있습니다.

<div class="alert is-helpful">

<!--
**Note:** Instead of a form control instance for each alias, you can compose another form group instance with additional fields. The process of defining a control for each item is the same.
-->
**참고:** _aliases_ 필드는 폼 컨트롤 단위로 추가할 수도 있지만 폼 그룹 단위로 추가할 수도 있습니다. 폼 컨트롤을 정의하고 활용하는 방법은 같습니다.

</div>

{@a appendix}

<!--
## Appendix
-->
## 부록

{@a reactive-forms-api}

<!--
### Reactive forms API
-->
### 반응형 폼 API

<!--
Listed below are the base classes and services used to create and manage form controls.
-->
폼 컨트롤을 활용하면서 자주 사용하는 클래스와 서비스를 알아봅시다.

<!--
#### Classes
-->
#### 클래스

<table>

  <tr>

    <th>
      <!--
      Class
      -->
      클래스
    </th>

    <th>
      <!--
      Description
      -->
      설명
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>AbstractControl</code>
    </td>

    <td>

      <!--
      The abstract base class for the concrete form control classes `FormControl`, `FormGroup`, and `FormArray`. It provides their common behaviors and properties.
      -->
      폼 컨트롤을 표현하는 `FormControl`, `FormGroup`, `FormArray`의 추상 클래스입니다. 폼 컨트롤의 공통 기능과 프로퍼티를 정의합니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControl</code>
    </td>

    <td>

      <!--
      Manages the value and validity status of an individual form control. It corresponds to an HTML form control such as `<input>` or `<select>`.
      -->
      개별 폼 컨트롤의 값과 유효성 검사 상태를 관리하는 클래스입니다. 이 클래스는 HTML 문서의 `<input>`이나 `<select>` 엘리먼트와 연동됩니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroup</code>
    </td>

    <td>

      <!--
      Manages the value and validity state of a group of `AbstractControl` instances. The group's properties include its child controls. The top-level form in your component is `FormGroup`.
      -->
      연관된 `AbstractControl` 인스턴스를 그룹으로 관리할 때 사용하는 클래스입니다. 이 그룹은 자식 폼 컨트롤을 프로퍼티로 관리하며, 그룹에 접근해도 자식 폼 컨트롤의 값이나 유효성 검사 상태도 확인할 수 있습니다. 컴포넌트의 최상위 폼도 `FormGroup` 입니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArray</code>
    </td>

    <td>

    <!--
    Manages the value and validity state of a numerically indexed array of `AbstractControl` instances.
    -->
    `AbstractControl`을 배열 형태로 관리할 때 사용하는 클래스입니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormBuilder</code>
    </td>

    <td>

      <!--
      An injectable service that provides factory methods for creating control instances.
      -->
      폼 컨트롤 인스턴스를 간편하게 만들때 사용하는 서비스입니다.

    </td>

  </tr>  

</table>

<!--
#### Directives
-->
#### 디렉티브

<table>

  <tr>

    <th>
      <!--
      Directive
      -->
      디렉티브
    </th>

    <th>
      <!--
      Description
      -->
      설명
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControlDirective</code>
    </td>

    <td>

      <!--
      Syncs a standalone `FormControl` instance to a form control element.
      -->
      개별 `FormControl` 인스턴스와 폼 컨트롤 엘리먼트를 연결합니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControlName</code>
    </td>

    <td>

      <!--
      Syncs `FormControl` in an existing `FormGroup` instance to a form control element by name.
      -->
      이름으로 기준으로 `FormGroup` 안에 있는 `FormControl`을 연결합니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroupDirective</code>
    </td>

    <td>

      <!--
      Syncs an existing `FormGroup` instance to a DOM element.
      -->
      `FormGroup` 인스턴스를 DOM 엘리먼트와 연결합니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroupName</code>
    </td>

    <td>

      <!--
      Syncs a nested `FormGroup` instance to a DOM element.
      -->
      중첩된 `FormGroup` 인스턴스를 DOM 엘리먼트와 연결합니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArrayName</code>
    </td>

    <td>

      <!--
      Syncs a nested `FormArray` instance to a DOM element.
      -->
      `FormArray` 인스턴스를 DOM 엘리먼트와 연결합니다.

    </td>

  </tr>

</table>
