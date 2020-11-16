<!--
# Reactive forms
-->
# 반응형 폼 (Reactive Forms)

<!--
Reactive forms provide a model-driven approach to handling form inputs whose values change over time. This guide shows you how to create and update a basic form control, progress to using multiple controls in a group, validate form values, and create dynamic forms where you can add or remove controls at run time.

<div class="alert is-helpful">

Try this <live-example title="Reactive Forms in Stackblitz">Reactive Forms live-example</live-example>.

</div>

**Prerequisites**

Before going further into reactive forms, you should have a basic understanding of the following:

* TypeScript programming.
* Angular app-design fundamentals, as described in [Angular Concepts](guide/architecture "Introduction to Angular concepts.").
* The form-design concepts that are presented in [Introduction to Forms](guide/forms-overview "Overview of Angular forms.").
-->
반응형 폼은 화면에 있는 입력 필드의 값이 변경될 때마다 원하는 로직이 실행하게 하는 모델-드리븐 방식의 폼입니다.
이 문서에서는 폼 컨트롤을 만드는 방법부터 시작해서 폼 컨트롤의 값을 갱신하는 방법, 폼 컨트롤 여러개를 그룹으로 묶어서 한 번에 처리하는 방법, 폼 컨트롤의 유효성을 검사하는 방법, 동적으로 폼 컨트롤을 추가하고 제거하는 방법에 대해 안내합니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example title="Reactive Forms in Stackblitz">Reactive Forms live-example</live-example>에서 직접 실행하거나 다운받아 확인할 수 있습니다.

</div>


**사전지식**

반응형 폼에 대해 알아보기 전에 이런 내용을 미리 알아두는 것이 좋습니다:

* TypeScript 프로그래밍
* [Angular 개요](guide/architecture "Introduction to Angular concepts.") 문서에서 설명하는 Angular 앱 설계 개념
* [폼 소개](guide/forms-overview "Overview of Angular forms.") 문서에서 설명하는 폼 구성 개념


{@a intro}

<!--
## Overview of reactive forms
-->
## 반응형 폼 개요

<!--
Reactive forms use an explicit and immutable approach to managing the state of a form at a given point in time. Each change to the form state returns a new state, which maintains the integrity of the model between changes. Reactive forms are built around [observable](guide/glossary#observable "Observable definition.") streams, where form inputs and values are provided as streams of input values, which can be accessed synchronously.

Reactive forms also provide a straightforward path to testing because you are assured that your data is consistent and predictable when requested. Any consumers of the streams have access to manipulate that data safely.

Reactive forms differ from [template-driven forms](guide/forms "Template-driven forms guide") in distinct ways. Reactive forms provide more predictability with synchronous access to the data model, immutability with observable operators, and change tracking through observable streams.

Template-driven forms allow direct access to modify data in your template, but are less explicit than reactive forms because they rely on directives embedded in the template, along with mutable data to track changes asynchronously. See the [Forms Overview](guide/forms-overview "Overview of Angular forms.") for detailed comparisons between the two paradigms.
-->
반응형 폼이란 원하는 시점에 명시적으로 폼에 접근해서 상태를 참조하는 방식을 이야기합니다.
반응형 폼에서 폼 상태가 변경되면 새로운 상태를 반환하기 때문에 전체 폼 모델 중 어느 부분이 변경되었는지 추적할 수 있습니다.
반응형 폼은 [옵저버블](guide/glossary#observable "Observable definition.") 스트림을 기반으로 동작하기 때문에, 폼에 입력되는 값도 스트림 형태로 전달됩니다.

반응형 폼을 사용하면 개발자가 의도한 대로만 데이터가 변경되며, 현재 상태를 쉽게 예측할 수 있기 때문에 테스트하기도 편합니다.
데이터가 변경되는 것을 감지하는 쪽에서 값을 받아 반응하는 것도 쉽습니다.

반응형 폼은 여러가지 면에서 [템플릿 기반 폼](guide/forms "Template-driven forms guide")과 다릅니다.
반응형 폼은 데이터 모델에 동기 방식으로 접근할 수 있기 때문에 동작을 예측하기 쉬우며, 옵저버블 연산자를 활용해서 조작할 수 있고, 옵저버블 스트림을 추적하는 방식으로 변화를 감지할 수도 있습니다.

반면에 템플릿 기반 폼은 템플릿 안에서만 동작하며 템플릿 안에 있는 디렉티브를 기반으로 동작하기 때문에 동작을 폼 모델에 직접 접근할 수 없으며 비동기 방식으로만 변화를 감지할 수 있습니다.
두가지 방식이 어떻게 다른지 비교하려면 [폼 개요](guide/forms-overview "Overview of Angular forms.") 문서를 참고하세요.


<!--
## Adding a basic form control
-->
## 기본 폼 컨트롤 추가하기

<!--
There are three steps to using form controls.

1. Register the reactive forms module in your app. This module declares the reactive-form directives that you need to use reactive forms.
2. Generate a new `FormControl` instance and save it in the component.
3. Register the `FormControl` in the template.

You can then display the form by adding the component to the template.

The following examples show how to add a single form control. In the example, the user enters their name into an input field, captures that input value, and displays the current value of the form control element.
-->
폼 컨트롤은 3단계를 거쳐 정의합니다.

1. 앱에 반응형 폼 모듈을 로드합니다. 이 모듈은 반응형 폼에서 사용하는 디렉티브를 제공하는 모듈입니다.
2. 컴포넌트에 `FormControl` 인스턴스를 정의합니다.
3. 템플릿에 `FormControl`을 등록합니다.

그러면 컴포넌트 템플릿에서 폼이 동작하는 것을 확인할 수 있습니다.

아래 예제는 폼 컨트롤 하나를 정의하는 예제 코드입니다.
이 예제 코드에서 사용자가 입력 필드에 이름을 입력하면 폼이 이벤트를 감지해서 현재 값을 화면에 표시합니다.


<!--
**Register the reactive forms module**

To use reactive form controls, import `ReactiveFormsModule` from the `@angular/forms` package and add it to your NgModule's `imports` array.

<code-example path="reactive-forms/src/app/app.module.ts" region="imports" header="src/app/app.module.ts (excerpt)"></code-example>
-->
**반응형 폼 모듈 로드하기**

반응형 폼 컨트롤을 사용하려면 `@angular/forms` 패키지가 제공하는 `ReactiveFormsModule`을 로드해서 NgModule `imports` 배열에 추가하면 됩니다.

<code-example path="reactive-forms/src/app/app.module.ts" region="imports" header="src/app/app.module.ts (일부)"></code-example>


<!--
**Generate a new `FormControl`**
-->
**`FormControl` 생성하기**

<!--
Use the [CLI command](cli "Using the Angular command-line interface.") `ng generate` to generate a component in your project to host the control.

<code-example language="sh" class="code-shell">

  ng generate component NameEditor

</code-example>

To register a single form control, import the `FormControl` class and create a new instance of `FormControl` to save as a class property.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control" header="src/app/name-editor/name-editor.component.ts"></code-example>

Use the constructor of `FormControl` to set its initial value, which in this case is an empty string. By creating these controls in your component class, you get immediate access to listen for, update, and validate the state of the form input.
-->
[Angular CLI 명령](cli "Using the Angular command-line interface.")  `ng generate`를 실행하면 프로젝트에 컴포넌트를 추가할 수 있습니다.

<code-example language="sh" class="code-shell">

  ng generate component NameEditor

</code-example>

그리고 폼 컨트롤을 하나 추가하려면 이 컴포넌트 파일에 `FormControl` 클래스를 로드하고 클래스 프로퍼티로 `FormControl`을 선언하면 됩니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="create-control" header="src/app/name-editor/name-editor.component.ts"></code-example>

그러면 `FormControl`의 생성자가 실행되면서 인자로 전달한 빈 문자열이 초기값으로 설정됩니다.
이렇게 클래스 프로퍼티에 폼 컨트롤을 선언하면 폼에서 입력되는 이벤트나 값, 유효성 검사 결과를 컴포넌트 코드에서 간단하게 확인할 수 있습니다.


<!--
**Register the control in the template**
-->
**템플릿에 폼 컨트롤 연결하기**

<!--
After you create the control in the component class, you must associate it with a form control element in the template. Update the template with the form control using the `formControl` binding provided by `FormControlDirective`, which is also included in the `ReactiveFormsModule`.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" header="src/app/name-editor/name-editor.component.html"></code-example>

<div class="alert is-helpful">

* For a summary of the classes and directives provided by `ReactiveFormsModule`, see the [Reactive forms API](#reactive-forms-api "API summary.") section below.

* For complete syntax details of these classes and directives, see the API reference documentation for the [Forms package](api/forms "API reference.").

</div>

Using the template binding syntax, the form control is now registered to the `name` input element in the template. The form control and DOM element communicate with each other: the view reflects changes in the model, and the model reflects changes in the view.
-->
컴포넌트 클래스에 폼 컨트롤을 추가하고 나면, 컴포넌트 템플릿에도 폼 컨트롤을 연결해야 이 폼 컨트롤을 사용할 수 있습니다.
그래서 `FormControlDirective`를 의미하는 `formControl`을 입력 필드에 지정하면 템플릿과 컴포넌트의 폼 컨트롤을 연결할 수 있습니다.
이 디렉티브는 `ReactiveFormsModule`에서 제공하는 디렉티브입니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="control-binding" header="src/app/name-editor/name-editor.component.html"></code-example>

<div class="alert is-helpful">

**참고** : `ReactiveFormsModule`에서 제공하는 클래스나 디렉티브에 대해 좀 더 알아보려면 아래 [반응형 폼 API](#reactive-forms-api "API summary.") 섹션을 참고하세요.

</div>

이렇게 템플릿 바인딩 문법을 사용하면 템플릿에 있는 `name` 입력 필드가 폼 컨트롤과 연결됩니다.
이제 폼 컨트롤과 DOM 엘리먼트는 서로 연동되는데, 화면에서 값이 변경되면 모델값도 변경되고, 모델의 값이 변경되면 화면의 값도 변경됩니다.


<!--
**Display the component**
-->
**컴포넌트 표시하기**

<!--
The form control assigned to `name` is displayed when the component is added to a template.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-name-editor" header="src/app/app.component.html (name editor)"></code-example>

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/name-editor-1.png" alt="Name Editor">
</div>
-->
이제 `NameEditorComponent`를 템플릿에 추가하면 다음과 같은 입력 필드가 화면에 표시됩니다.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-name-editor" header="src/app/app.component.html (NameEditorComponent)"></code-example>

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/name-editor-1.png" alt="Name Editor">
</div>


{@a display-value}

<!--
### Displaying a form control value
-->
### 폼 컨트롤 값 표시하기

<!--
You can display the value in the following ways.

* Through the `valueChanges` observable where you can listen for changes in the form's value in the template using `AsyncPipe` or in the component class using the `subscribe()` method.

* With the `value` property, which gives you a snapshot of the current value.

The following example shows you how to display the current value using interpolation in the template.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value" header="src/app/name-editor/name-editor.component.html (control value)"></code-example>

The displayed value changes as you update the form control element.

Reactive forms provide access to information about a given control through properties and methods provided with each instance.
These properties and methods of the underlying [AbstractControl](api/forms/AbstractControl "API reference.") class are used to control form state and determine when to display messages when handling [input validation](#basic-form-validation "Learn more about validating form input.").

Read about other `FormControl` properties and methods in the [API Reference](api/forms/FormControl "Detailed syntax reference.").
-->
폼 컨트롤의 값을 표시하려면 다음과 같은 방법을 사용할 수 있습니다:

* 폼 값이 변경된 것을 알려주는 `valueChanges` 옵저버블을 `AsyncPipe` 파이프와 함께 사용할 수 있습니다. 이 옵저버블은 컴포넌트 클래스에서 `subscribe()` 메소드로 구독해도 됩니다.
* 폼 컨트롤의 현재 값을 표현하는 `value` 프로퍼티를 사용해도 됩니다.

다음 예제는 폼 컨트롤의 값을 문자열 삽입으로 템플릿에 표시하는 예제 코드입니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="display-value" header="src/app/name-editor/name-editor.component.html (값 표시하기)"></code-example>

그리고 이 값은 폼 컨트롤 엘리먼트의 값이 변경될 때마다 자동으로 갱신됩니다.

반응형 폼에서는 각 폼 컨트롤의 프로퍼티나 메소드를 사용해서 폼 컨트롤이 제공하는 정보에 접근할 수 있습니다. 프로퍼티와 메소드는 [AbstractControl](api/forms/AbstractControl "API reference.") 클래스에 정의되어 있으며, 폼 컨트롤의 값을 확인하는 것외에도 폼 컨트롤의 상태를 확인하거나 유효성을 검사하는 용도로도 사용할 수 있습니다. 더 자세한 내용은 이후에 나오는 [폼 유효성 검사하기](#basic-form-validation "Learn more about validating form input.") 섹션을 참고하세요.

그리고 `FormControl`에서 제공하는 프로퍼티와 메소드를 확인하려면 [API 문서](api/forms/FormControl "Detailed syntax reference.")를 참고하세요.


<!--
### Replacing a form control value
-->
### 폼 컨트롤 값 변경하기

<!--
Reactive forms have methods to change a control's value programmatically, which gives you the flexibility to update the value without user interaction. A form control instance provides a `setValue()` method that updates the value of the form control and validates the structure of the value provided against the control's structure. For example, when retrieving form data from a backend API or service, use the `setValue()` method to update the control to its new value, replacing the old value entirely.

The following example adds a method to the component class to update the value of the control to *Nancy* using the `setValue()` method.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value" header="src/app/name-editor/name-editor.component.ts (update value)">

</code-example>

Update the template with a button to simulate a name update. When you click the **Update Name** button, the value entered in the form control element is reflected as its current value.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value" header="src/app/name-editor/name-editor.component.html (update value)"></code-example>

The form model is the source of truth for the control, so when you click the button, the value of the input is changed within the component class, overriding its current value.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/name-editor-2.png" alt="Name Editor Update">
</div>

<div class="alert is-helpful">

**Note:** In this example, you're using a single control. When using the `setValue()` method with a [form group](#grouping-form-controls "Learn more about form groups.") or [form array](#creating-dynamic-forms "Learn more about dynamic forms.") instance, the value needs to match the structure of the group or array.

</div>
-->
반응형 폼에서 제공하는 메소드를 사용하면 사용자의 동작 없이도 폼 컨트롤의 값을 컴포넌트 코드에서 변경할 수 있습니다.
이 중 `setValue()` 메소드를 사용하면 폼 컨트롤의 값을 변경할 수 있으며, 이 때 폼 컨트롤의 구조에 맞지 않는 데이터가 전달되는 유효성 검사도 수행합니다.
그래서 백엔드 API나 서비스에서 데이터를 가져온 후에 `setValue()` 메소드를 사용하면 현재 폼 컨트롤의 값 전체를 한 번에 변경할 수 있습니다.

다음 예제 코드는 `setValue()` 메소드를 사용해서 폼 컨트롤의 값을 *Nancy*로 변경하는 예제 코드입니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.ts" region="update-value" header="src/app/name-editor/name-editor.component.ts (값 변경하기)">

</code-example>

이 메소드를 실행할 수 있도록 템플릿을 수정합니다.
다음과 같이 구현한 후에 **Update Name** 버튼을 클릭하면, 폼 컨트롤 엘리먼트에 입력된 값에 관계없이 지정된 값으로 변경됩니다.

<code-example path="reactive-forms/src/app/name-editor/name-editor.component.html" region="update-value" header="src/app/name-editor/name-editor.component.html (값 변경하기)"></code-example>

그리고 이 때 폼 컨트롤의 값은 폼 모델과 연결되어 있기 때문에, 버튼을 눌러서 폼 컨트롤의 값이 변경되면 컴포넌트 클래스에 있는 폼 모델 값도 함께 변경됩니다.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/name-editor-2.png" alt="Name Editor Update">
</div>

<div class="alert is-helpful">

**참고**: 이 예제에서는 폼 컨트롤 하나를 대상으로 `setValue()` 메소드를 사용했지만, 이 메소드의 인자로 전달하는 타입에 따라 [폼 그룹](#grouping-form-controls "Learn more about form groups.")이나 [폼 배열](#creating-dynamic-forms "Learn more about dynamic forms.")에도 사용할 수 있습니다.

</div>


{@a grouping-form-controls}
<!--
## Grouping form controls
-->
## 연관된 폼 컨트롤 묶기

<!--
Forms typically contain several related controls. Reactive forms provide two ways of grouping multiple related controls into a single input form.

* A form *group* defines a form with a fixed set of controls that you can manage together. Form group basics are discussed in this section. You can also [nest form groups](#nested-groups "See more about nesting groups.") to create more complex forms.
* A form *array* defines a dynamic form, where you can add and remove controls at run time. You can also nest form arrays to create more complex forms. For more about this option, see [Creating dynamic forms](#dynamic-forms "See more about form arrays.") below.

Just as a form control instance gives you control over a single input field, a form group instance tracks the form state of a group of form control instances (for example, a form). Each control in a form group instance is tracked by name when creating the form group. The following example shows how to manage multiple form control instances in a single group.

Generate a `ProfileEditor` component and import the `FormGroup` and `FormControl` classes from the `@angular/forms` package.

<code-example language="sh" class="code-shell">

  ng generate component ProfileEditor

</code-example>

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports" header="src/app/profile-editor/profile-editor.component.ts (imports)">

</code-example>

To add a form group to this component, take the following steps.

1. Create a `FormGroup` instance.
2. Associate the `FormGroup` model and view.
3. Save the form data.
-->
폼은 보통 몇개 폼이 연관되는 방식으로 구성됩니다.
반응형 폼을 사용하면 두가지 방법으로 폼 컨트롤을 묶어서 관리할 수 있습니다.

* 관련된 폼 컨트롤을 그룹으로 정의할 수 있습니다.
이번 섹션에서는 폼 그룹에 대해 이야기 해봅시다.
폼이 복잡하다면 [중첩된 폼 그룹](#nested-groups "See more about nesting groups.")을 구성할 수도 있습니다.

* 폼이 동적으로 변경된다면 폼 *배열*을 정의할 수 있습니다.
그리고 이 경우에도 폼이 복잡하다면 폼 배열을 중첩할 수도 있습니다.
자세한 내용은 [동적 폼 구성하기](#dynamic-forms "See more about form arrays.") 문서를 참고하세요.

입력 필드 하나를 의미하는 폼 컨트롤 여러 개는 함께 묶어서 폼 그룹으로 처리할 수 있습니다.
실제로 폼을 구성할 때도 개별 폼 컨트롤을 처리하지 않고 폼 그룹으로 한 번에 처리하는 것이 효율적이며, 폼 그룹에 포함된 폼 컨트롤은 이름으로 구분합니다.
폼 컨트롤 여러개를 폼 그룹으로 한 번에 처리하는 방법을 알아봅시다.

다음 명령을 실행해서 `ProfileEditor` 컴포넌트를 생성하고 이 컴포넌트에 `@angular/forms` 패키지에서 제공하는 `FormGroup` 클래스와 `FormControl` 클래스를 로드합니다.

<code-example language="sh" class="code-shell">

  ng generate component ProfileEditor

</code-example>

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="imports" header="src/app/profile-editor/profile-editor.component.ts (심볼 로드하기)">

</code-example>

폼 그룹은 다음과 같은 단계로 추가합니다.

1. `FormGroup` 인스턴스를 추가합니다.
2. `FormGroup` 모델과 화면을 연결합니다.
3. 폼 데이터를 저장합니다.


<!--
**Create a FormGroup instance**
-->
**FormGroup 인스턴스 생성하기**

<!--
Create a property in the component class named `profileForm` and set the property to a new form group instance. To initialize the form group, provide the constructor with an object of named keys mapped to their control.

For the profile form, add two form control instances with the names `firstName` and `lastName`.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup" header="src/app/profile-editor/profile-editor.component.ts (form group)">

</code-example>

The individual form controls are now collected within a group. A `FormGroup` instance provides its model value as an object reduced from the values of each control in the group. A form group instance has the same properties (such as `value` and `untouched`) and methods (such as `setValue()`) as a form control instance.
-->
컴포넌트 클래스에 `profileForm` 프로퍼티를 선언하고 이 프로퍼티에 폼 그룹 인스턴스를 생성해서 할당합니다.
폼 그룹을 생성하려면 폼 컨트롤과 키를 매칭시켜서 생성자에 인자로 전달하면 됩니다.

그러면 이 폼 안에 `firstName` 인스턴스와 `lastName` 인스턴스가 선언됩니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup" header="src/app/profile-editor/profile-editor.component.ts (폼 그룹)">

</code-example>

이제 폼 컨트롤을 그룹으로 묶었습니다.
폼 컨트롤을 그룹으로 묶으면 폼 컨트롤의 값을 번거롭게 하나씩 참조할 필요 없이 폼 그룹에서 제공하는 모델을 사용할 수 있습니다.
폼 그룹 인스턴스도 폼 컨트롤 인스턴스와 비슷하게 `value`나 `untouched` 프로퍼티, `setValue()` 메소드를 제공합니다.


<!--
**Associate the FormGroup model and view**
-->
**FormGroup 모델과 화면 연결하기**

<!--
A form group tracks the status and changes for each of its controls, so if one of the controls changes, the parent control also emits a new status or value change. The model for the group is maintained from its members. After you define the model, you must update the template to reflect the model in the view.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup" header="src/app/profile-editor/profile-editor.component.html (template form group)"></code-example>

Note that just as a form group contains a group of controls, the *profileForm* `FormGroup` is bound to the `form` element with the `FormGroup` directive, creating a communication layer between the model and the form containing the inputs. The `formControlName` input provided by the `FormControlName` directive binds each individual input to the form control defined in `FormGroup`. The form controls communicate with their respective elements. They also communicate changes to the form group instance, which provides the source of truth for the model value.
-->
폼 그룹도 각각의 폼 컨트롤의 상태와 변화를 추적합니다.
그래서 폼 컨트롤 중 하나의 상태나 값이 변경되면 이 폼 컨트롤을 감싸고 있는 부모 폼 컨트롤도 새로운 상태로 변경되고 값도 변경됩니다.
이 폼 그룹이 관리하는 모델은 각각의 폼 컨트롤로 구성됩니다.
그래서 이 모델을 템플릿에 연결하면 폼 컨트롤을 처리했던 것과 비슷하게 폼 그룹을 처리할 수 있습니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroup" header="src/app/profile-editor/profile-editor.component.html (폼 그룹 템플릿)"></code-example>

폼 그룹은 폼 컨트롤의 묶음을 표현하며, 이 예제 코드에서는 `FormGroup` 타입의 *profileForm* 이 `form` 엘리먼트와 바인딩되어 폼 모델과 입력 필드를 연결합니다.
이 코드에 사용된 `formControlName` 은 `FormControlName` 디렉티브의 셀렉터이며, 개별 입력 필드를 `FormGroup` 안에 있는 폼 컨트롤과 연결하는 동작을 수행합니다.
그러면 각각의 폼 컨트롤에 연결된 엘리먼트는 해당 폼 컨트롤이 관리하며, 폼 그룹 인스턴스를 통해 전체 모델에 접근할 수도 있습니다.


<!--
**Save form data**
-->
**데이터 저장하기**

<!--
The `ProfileEditor` component accepts input from the user, but in a real scenario you want to capture the form value and make available for further processing outside the component. The `FormGroup` directive listens for the `submit` event emitted by the `form` element and emits an `ngSubmit` event that you can bind to a callback function.

Add an `ngSubmit` event listener to the `form` tag with the `onSubmit()` callback method.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit" header="src/app/profile-editor/profile-editor.component.html (submit event)"></code-example>

The `onSubmit()` method in the `ProfileEditor` component captures the current value of `profileForm`. Use `EventEmitter` to keep the form encapsulated and to provide the form value outside the component. The following example uses `console.warn` to log a message to the browser console.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit" header="src/app/profile-editor/profile-editor.component.ts (submit method)">

</code-example>

The `submit` event is emitted by the `form` tag using the native DOM event. You trigger the event by clicking a button with `submit` type. This allows the user to press the **Enter** key to submit the completed form.

Use a `button` element to add a button to the bottom of the form to trigger the form submission.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button" header="src/app/profile-editor/profile-editor.component.html (submit button)"></code-example>

<div class="alert is-helpful">

**Note:** The button in the snippet above also has a `disabled` binding attached to it to disable the button when `profileForm` is invalid. You aren't performing any validation yet, so the button is always enabled. Basic form validation is covered in the [Validating form input](#basic-form-validation "Basic form validation.") section.

</div>
-->
이 예제에서는 `ProfileEditor` 컴포넌트가 사용자의 입력을 받기만 하지만, 실제 애플리케이션이라면 폼에 입력된 값을 컴포넌트 외부로 전달해서 어떤 동작을 수행해야 할 것입니다.
`FormGroup` 디렉티브는 `form` 엘리먼트에서 발생하는 `submit` 이벤트를 감지하며, `submit` 이벤트가 발생했을 때 폼에 바인딩 된 콜백 함수를 실행하기 위해 `ngSubmit` 이벤트를 새로 발생시킵니다.

다음과 같이 `form` 태그에 `ngSubmit` 이벤트를 바인딩해서 `onSubmit()` 콜백 메소드가 실행되게 작성해 봅시다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="ng-submit" header="src/app/profile-editor/profile-editor.component.html (폼 제출 이벤트 처리)"></code-example>

그러면 `ProfileEditor` 컴포넌트에 정의된 `onSubmit()` 메소드가 `profileForm`의 현재 값을 읽어서 특정 동작을 실행하게 할 수 있습니다.
이 때 컴포넌트와 폼의 캡슐화를 보장하기 위해 `EventEmitter`를 사용해서 폼 값을 컴포넌트 외부로 전달하는 것이 좋습니다.
다음 예제는 이렇게 가져온 폼 값을 `console.warn` 함수로 브라우저 콘솔에 출력하는 예제입니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="on-submit" header="src/app/profile-editor/profile-editor.component.ts (폼 제출 메소드)">

</code-example>

`submit` 이벤트는 `form` 태그에서 발생하는 네이티브 DOM 이벤트입니다.
이 이벤트는 `submit` 타입의 버튼을 클릭했을 때 발생하며, 사용자가 폼 내용을 입력하고 **엔터** 키를 눌렀을 때도 발생합니다.

이 이벤트를 발생시키기 위해 폼 아래에 `button` 엘리먼트를 다음과 같이 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="submit-button" header="src/app/profile-editor/profile-editor.component.html (폼 제출 버튼)"></code-example>

<div class="alert is-helpful">

**팁:** 예제로 구현한 버튼은 `profileForm`의 유효성 검사 결과가 유효하지 않을 때 `disabled` 어트리뷰트를 지정하도록 바인딩되어 있습니다.
아직 유효성 검사 로직은 아무것도 적용하지 않았기 때문에 버튼은 항상 활성화되어 있을 것이며, 이후에 [폼 유효성 검사하기](#basic-form-validation "Basic form validation.") 섹션에서 이 내용을 다시 한 번 살펴봅니다.

</div>


<!--
**Display the component**
-->
**컴포넌트 표시하기**

<!--
To display the `ProfileEditor` component that contains the form, add it to a component template.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-profile-editor" header="src/app/app.component.html (profile editor)"></code-example>

`ProfileEditor` allows you to manage the form control instances for the `firstName` and `lastName` controls within the form group instance.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-1.png" alt="Profile Editor">
</div>
-->
`ProileEditor` 컴포넌트를 화면에 표시하기 위해 `AppComponent` 템플릿에 다음과 같이 컴포넌트를 추가합니다.

<code-example path="reactive-forms/src/app/app.component.1.html" region="app-profile-editor" header="src/app/app.component.html (개인정보 수정 화면)"></code-example>

그러면 `ProfileEditor` 컴포넌트가 화면에 표시되며, 이 컴포넌트에 정의된 폼 그룹 안에 있는 `firstName`과 `lastName` 폼 컨트롤도 화면에 함께 표시됩니다.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-1.png" alt="Profile Editor">
</div>


{@a nested-groups}

<!--
### Creating nested form groups
-->
### 중첩 폼 그룹(Nesting form groups) 만들기

<!--
Form groups can accept both individual form control instances and other form group instances as children. This makes composing complex form models easier to maintain and logically group together.

When building complex forms, managing the different areas of information is easier in smaller sections. Using a nested form group instance allows you to break large forms groups into smaller, more manageable ones.

To make more complex forms, use the following steps.

1. Create a nested group.
2. Group the nested form in the template.

Some types of information naturally fall into the same group. A name and address are typical examples of such nested groups, and are used in the following examples.
-->
폼 그룹은 폼 그룹안에 있는 개별 폼 컨트롤 인스턴스에 직접 접근할 수 있으며 다른 폼 그룹도 자식 폼 컨트롤로 가질 수 있습니다.
그래서 폼 그룹을 논리적으로 구성하면 폼 전체를 한 번에 관리하기도 편합니다.

복잡한 폼을 구성할 때는 관련된 영역끼리 작게 묶어서 관리하는 것이 편합니다.
결국 관련된 영역을 작게 묶는 것이 폼 그룹의 역할입니다.

복잡한 폼을 구성할 때는 이렇게 구현해 보세요.

1. 중첩된 그룹을 정의합니다.
2. 템플릿에서도 중첩된 그룹을 묶어서 관리하세요.

데이터들 중에는 같은 그룹으로 묶는 것이 자연스러운 경우가 있습니다.
사용자의 이름과 주소가 그런 경우에 해당됩니다.


<!--
**Create a nested group**
-->
**중첩 그룹 만들기**

<!--
To create a nested group in `profileForm`, add a nested `address` element to the form group instance.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup" header="src/app/profile-editor/profile-editor.component.ts (nested form group)"></code-example>

In this example, `address group` combines the current `firstName` and `lastName` controls with the new `street`, `city`, `state`, and `zip` controls. Even though the `address` element in the form group is a child of the overall `profileForm` element in the form group, the same rules apply with value and status changes. Changes in status and value from the nested form group propagate to the parent form group, maintaining consistency with the overall model.
-->
`profileForm` 폼 안에 중첩된 폼을 만들기 위해 `address` 그룹을 이렇게 구성해 봅시다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="nested-formgroup" header="src/app/profile-editor/profile-editor.component.ts (중첩된 폼 그룹)"></code-example>

이 예제에서 `firstName`과 `lastName`은 폼 컨트롤이지만 `address`는 `street`와 `city`, `state`, `zip`으로 이루어진 폼 그룹입니다.
`address` `FormGroup`은 그 자체로도 폼 그룹이지만 부모 폼 그룹인 `profileForm`의 자식 폼 그룹이며, 기존에 사용하던 폼 상태와 값이 변경되는 상황도 이전과 마찬가지로 참조할 수 있습니다.
자식 객체에서 발생하는 상태/값 변화는 부모 폼 그룹으로 전파되기 때문에, 전체 폼 그룹을 참조해도 개별 값이 변경되는 것을 감지할 수 있습니다.


<!--
**Group the nested form in the template**
-->
**템플릿에서 중첩 폼 묶기**

<!--
After you update the model in the component class, update the template to connect the form group instance and its input elements.

Add the `address` form group containing the `street`, `city`, `state`, and `zip` fields to the `ProfileEditor` template.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname" header="src/app/profile-editor/profile-editor.component.html (template nested form group)"></code-example>

The `ProfileEditor` form is displayed as one group, but the model is broken down further to represent the logical grouping areas.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-2.png" alt="Profile Editor Update">
</div>

<div class="alert is-helpful">

**Tip** Display the value for the form group instance in the component template using the `value` property and `JsonPipe`.

</div>
-->
컴포넌트 클래스의 모델을 수정하고 나면, 템플릿에도 이 내용과 관련된 폼 그룹 인스턴스와 입력 엘리먼트를 수정해야 합니다.

`ProfileEditor` 템플릿에 다음과 같이 `address` 폼 그룹을 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="formgroupname" header="src/app/profile-editor/profile-editor.component.html (중첩된 폼 그룹 템플릿)"></code-example>

그러면 `ProfileEditor` 폼에서 `address` 부분이 다시 한 번 그룹으로 묶여 다음과 같이 화면에 표시됩니다.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-2.png" alt="Profile Editor Update">
</div>

<div class="alert is-helpful">

**팁:** 폼 그룹의 내용을 컴포넌트 템플릿에 표시하려면 `value` 프로퍼티에 `JsonPipe`를 사용하면 됩니다.

</div>


<!--
### Updating parts of the data model
-->
### 데이터 모델 일부만 갱신하기

<!--
When updating the value for a form group instance that contains multiple controls, you may only want to update parts of the model. This section covers how to update specific parts of a form control data model.

There are two ways to update the model value:

* Use the `setValue()` method to set a new value for an individual control. The `setValue()` method strictly adheres to the structure of the form group and replaces the entire value for the control.

* Use the `patchValue()` method to replace any properties defined in the object that have changed in the form model.

The strict checks of the `setValue()` method help catch nesting errors in complex forms, while `patchValue()` fails silently on those errors.

In `ProfileEditorComponent`, use the `updateProfile` method with the example below to update the first name and street address for the user.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value" header="src/app/profile-editor/profile-editor.component.ts (patch value)">

</code-example>

Simulate an update by adding a button to the template to update the user profile on demand.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value" header="src/app/profile-editor/profile-editor.component.html (update value)"></code-example>

When a user clicks the button, the `profileForm` model is updated with new values for `firstName` and `street`. Notice that `street` is provided in an object inside the `address` property. This is necessary because the `patchValue()` method applies the update against the model structure. `PatchValue()` only updates properties that the form model defines.
-->
폼 그룹을 처리하면서 매번 전체 폼 값을 한 번에 갱신하는 것은 번거롭기 때문에, 일부 폼 컨트롤의 값만 변경하는 것이 더 편한 경우도 있습니다.
이번에는 폼 모델의 일부 값만 변경하는 방법을 알아봅시다.

모델 값은 두 가지 방법으로 변경할 수 있습니다.

* 폼 컨트롤에 `setValue()` 메소드를 사용할 수 있습니다.
`setValue()` 메소드는 폼 그룹의 구조와 정확하게 일치하는 객체를 받았을 때만 폼 그룹 전체값을 한 번에 갱신합니다.

* 폼 모델의 특정 부분만 변경하려면 `patchValue()` 메소드를 사용할 수 있습니다.

`setValue()` 메소드를 사용하면 인자의 형태가 복잡한 폼 구조에 맞을 때만 값을 변경할 수 있습니다.
반면에 `patchValue()` 메소드는 폼 그룹의 구조와 다른 인자가 전달되어도 에러를 발생하지 않습니다.

아래 예제는 `ProfileEditorComponent`에 선언된 `updateProfile` 메소드를 사용해서 사용자의 이름과 주소를 변경하는 예제 코드입니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="patch-value" header="src/app/profile-editor/profile-editor.component.ts (일부 값 변경하기)">

</code-example>

그리고 이 메소드를 실행하는 버튼을 템플릿에 다음과 같이 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.1.html" region="patch-value" header="src/app/profile-editor/profile-editor.component.html (값 변경하기)"></code-example>

이제 사용자가 이 버튼을 클릭하면 `profileForm` 모델의 `firstName` 값과 `street` 값이 새로운 값으로 변경됩니다.
이 때 폼 그룹의 구조에 맞추기 위해 `street` 필드의 값은 `address` 객체 안에 지정했습니다.
`patchValue()` 메소드는 전달된 인자 중에서 폼 모델의 구조에 맞는 값만 변경합니다.


<!--
## Using the FormBuilder service to generate controls
-->
## FormBuilder로 폼 컨트롤 생성하기

<!--
Creating form control instances manually can become repetitive when dealing with multiple forms. The `FormBuilder` service provides convenient methods for generating controls.

Use the following steps to take advantage of this service.

1. Import the `FormBuilder` class.
2. Inject the `FormBuilder` service.
3. Generate the form contents.

The following examples show how to refactor the `ProfileEditor` component to use the form builder service to create form control and form group instances.
-->
폼 컨트롤을 매번 직접 생성해야 하는데, 이런 폼이 여러개라면 귀찮은 반복작업이 될 것입니다.
이 때 `FormBuilder` 서비스를 사용하면 좀 더 편하게 폼을 구성할 수 있습니다.

`FormBuilder` 서비스는 이렇게 사용합니다.

1. `FormBuilder` 클래스를 로드합니다.
2. `FormBuilder` 서비스를 의존성으로 주입합니다.
3. `FormBuilder` 서비스로 폼을 구성합니다.

아래 예제를 보면서 `ProfileEditor` 컴포넌트에서 폼을 정의하는 부분을 폼 빌더 서비스를 사용하는 방식으로 리팩토링하려면 어떻게 해야 하는지 확인해 보세요.


<!--
**Import the FormBuilder class**
-->
**FormBuilder 클래스 로드하기**

<!--
Import the `FormBuilder` class from the `@angular/forms` package.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports" header="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>
-->
먼저 `@angular/forms` 패키지에서 `FormBuilder` 클래스를 로드합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder-imports" header="src/app/profile-editor/profile-editor.component.ts (심볼 로드하기)">

</code-example>


<!--
**Inject the FormBuilder service**
-->
**FormBuilder 서비스를 의존성으로 주입하기**

<!--
The `FormBuilder` service is an injectable provider that is provided with the reactive forms module. Inject this dependency by adding it to the component constructor.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder" header="src/app/profile-editor/profile-editor.component.ts (constructor)">

</code-example>
-->
폼 빌더는 `ReactiveFormsModule`에서 제공하며, 의존성으로 주입할 수 있도록 서비스로 정의되어 있습니다.
다음과 같이 컴포넌트 생성자에 `FormBuilder` 서비스를 주입합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="inject-form-builder" header="src/app/profile-editor/profile-editor.component.ts (생성자)">

</code-example>


<!--
**Generate form controls**
-->
**폼 컨트롤 생성하기**

<!--
The `FormBuilder` service has three methods: `control()`, `group()`, and `array()`. These are factory methods for generating instances in your component classes including form controls, form groups, and form arrays.

Use the `group` method to create the `profileForm` controls.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder" header="src/app/profile-editor/profile-editor.component.ts (form builder)">

</code-example>

In the example above, you use the `group()` method with the same object to define the properties in the model. The value for each control name is an array containing the initial value as the first item in the array.

<div class="alert is-helpful">

**Tip** You can define the control with just the initial value, but if your controls need sync or async validation, add sync and async validators as the second and third items in the array.

</div>

Compare using the form builder to creating the instances manually.

<code-tabs>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (instances)">

  </code-pane>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (form builder)">

  </code-pane>

</code-tabs>
-->
`FormBuilder` 서비스는 `control()`, `group()`, `array()` 메소드를 제공하는데, 이 메소드는 각각 폼 컨트롤, 폼 그룹, 폼 배열 인스턴스를 생성해서 반환하는 팩토리 메소드입니다.

`group()` 메소드를 사용해서 `profileForm` 컨트롤을 만들어 봅시다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-builder" header="src/app/profile-editor/profile-editor.component.ts (폼 빌더)">

</code-example>

위 코드에서 `group()` 메소드에 전달하는 객체의 구조는 폼 모델의 구조와 같습니다.
그리고 프로퍼티 값으로는 배열을 전달하는데, 폼 컨트롤의 초기값은 배열의 첫번째 항목으로 전달합니다.

<div class="alert is-helpful">

**팁:** 폼 컨트롤의 초기값만 지정한다면 배열을 사용하지 않아도 됩니다.
하지만 폼 컨트롤에 유효성 검사기를 지정하려면 프로퍼티 값에 배열을 사용해야 합니다.
이 때 동기 유효성 검사기는 두번째 인자로, 비동기 유효성 검사기는 세번째 인자로 지정합니다.

</div>

폼 컨트롤을 직접 생성하는 방식과 폼 빌더를 사용하는 방식이 어떻게 다른지 비교해 보세요.

<code-tabs>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.1.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (직접 생성)">

  </code-pane>

  <code-pane path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="formgroup-compare" header="src/app/profile-editor/profile-editor.component.ts (폼 빌더 사용)">

  </code-pane>

</code-tabs>


{@a basic-form-validation}
{@a validating-form-input}

<!--
## Validating form input
-->
## 폼 유효성 검사하기

<!--
_Form validation_ is used to ensure that user input is complete and correct. This section covers adding a single validator to a form control and displaying the overall form status. Form validation is covered more extensively in the [Form Validation](guide/form-validation "All about form validation.") guide.

Use the following steps to add form validation.

1. Import a validator function in your form component.
2. Add the validator to the field in the form.
3. Add logic to handle the validation status.

The most common validation is making a field required. The following example shows how to add a required validation to the `firstName` control and display the result of validation.
-->
_폼 유효성 검사(Form validation)_ 는 사용자가 필수 항목을 모두 입력했는지, 입력한 내용이 올바른지 검증하는 것입니다.
이 섹션에서는 폼 컨트롤에 유효성 검사기를 하나 붙여서 폼 상태를 화면에 표시해 봅시다.
이보다 자세한 내용은 [폼 유효성 검사](guide/form-validation "All about form validation.") 문서에서 다룹니다.

폼 유효성 검사기는 다음과 같은 과정으로 적용합니다.

1. 폼 컴포넌트에 유효성 검사 함수를 로드합니다.
2. 원하는 폼 필드에 유효성 검사기를 적용합니다.
3. 폼 유효성 검사 결과에 따라 적절한 처리 로직을 추가합니다.

가장 일반적인 유효성 검사는 필드를 필수 항목으로 만드는 것입니다.
아래 예제를 보면서 `firstName` 폼 컨트롤에 필수항목 유효성 검사기를 추가하고 유효성 검사 결과를 화면에 표시하는 방법에 대해 알아보세요.


<!--
**Import a validator function**
-->
**유효성 검사 함수 로드하기**

<!--
Reactive forms include a set of validator functions for common use cases. These functions receive a control to validate against and return an error object or a null value based on the validation check.

Import the `Validators` class from the `@angular/forms` package.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports" header="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>
-->
반응형 폼 모듈은 다양한 유효성 검사 함수도 함께 제공합니다.
이 함수들은 폼 컨트롤 인스턴스를 인자로 받으며, 유효성 검사에 실패한 경우에 에러 객체를 반환하고 유효성 검사를 통과하면 null을 반환합니다.

먼저, `@angular/forms` 패키지에서 `Validators` 클래스를 로드합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="validator-imports" header="src/app/profile-editor/profile-editor.component.ts (심볼 로드하기)">

</code-example>


<!--
**Make a field required**
-->
**필수 항목 지정하기**


<!--
In the `ProfileEditor` component, add the `Validators.required` static method as the second item in the array for the `firstName` control.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator" header="src/app/profile-editor/profile-editor.component.ts (required validator)">

</code-example>

HTML5 has a set of built-in attributes that you can use for native validation, including `required`, `minlength`, and `maxlength`. You can take advantage of these optional attributes on your form input elements. Add the `required` attribute to the `firstName` input element.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="required-attribute" header="src/app/profile-editor/profile-editor.component.html (required attribute)"></code-example>

<div class="alert is-important">

**Caution:** Use these HTML5 validation attributes *in combination with* the built-in validators provided by Angular's reactive forms. Using these in combination prevents errors when the expression is changed after the template has been checked.

</div>
-->
폼 유효성 검사 중 가장 많이 사용하는 것은 입력 필드를 꼭 입력하도록 지정하는 것입니다.
`firstName` 폼 컨트롤에 이 내용을 어떻게 적용하는지 알아봅시다.

`ProfileEditor` 컴포넌트에서 `firstName` 폼 컨트롤을 생성하던 배열의 두 번째 항목으로 `Validators.required`를 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="required-validator" header="src/app/profile-editor/profile-editor.component.ts (required 유효성 검사기)">

</code-example>

HTML5에서도 `required`나 `minlength`, `maxlength`와 같은 어트리뷰트를 지정해서 네이티브 유효성 검사 로직을 활용할 수 있습니다.
이 기능을 활성화하려면 다음과 같이 `firstName` `input` 엘리먼트에 `required` 어트리뷰트를 지정하기만 하면 됩니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="required-attribute" header="src/app/profile-editor/profile-editor.component.html (required 어트리뷰트)"></code-example>

<div class="alert is-important">

**주의:** HTML5 유효성 검사 어트리뷰트는 반드시 Angular 반응형 폼이 제공하는 관련 유효성 검사기와 _함께_ 사용해야 합니다.
양쪽 기능을 함께 사용해야 해당 기능이 정상적으로 동작하며, 템플릿 검사를 마친 이후에 상태가 다시 변경되는 에러도 방지할 수 있습니다.

</div>


<!--
**Display form status**
-->
**폼 상태 표시하기**

<!--
When you add a required field to the form control, its initial status is invalid. This invalid status propagates to the parent form group element, making its status invalid. Access the current status of the form group instance through its `status` property.

Display the current status of `profileForm` using interpolation.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status" header="src/app/profile-editor/profile-editor.component.html (display status)"></code-example>

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-3.png" alt="Profile Editor Validation">
</div>

The **Submit** button is disabled because `profileForm` is invalid due to the required `firstName` form control. After you fill out the `firstName` input, the form becomes valid and the **Submit** button is enabled.

For more on form validation, visit the [Form Validation](guide/form-validation "All about form validation.") guide.
-->
폼 컨트롤을 필수항목으로 지정하면 이 폼 컨트롤의 초기 상태는 유효하지 않은 것이 됩니다.
폼 컨트롤의 상태는 부모 폼 그룹 엘리먼트로 전파되며, 결과적으로 폼 그룹 전체가 유효성 검사를 통과하지 못한 것으로 처리됩니다.
그러면 폼 그룹 인스턴스의 `status` 프로퍼티를 참조해서 이 폼의 상태를 확인할 수 있습니다.

`profileForm`의 상태를 표시하려면 다음과 같이 템플릿을 작성합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="display-status" header="src/app/profile-editor/profile-editor.component.html (상태 표시하기)"></code-example>

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-3.png" alt="Profile Editor Validation">
</div>

`firstName` 폼 컨트롤이 필수항목으로 지정되었지만 유효성 검사를 통과하지 못했기 때문에 `profileForm` 전체가 유효하지 않은 것으로 판단되고, **Submit** 버튼도 비활성화 됩니다.
`firstName` 입력 필드에 데이터를 입력하면 폼 전체의 유효성 검사가 통과되면서, **Submit** 버튼도 활성화될 것입니다.

폼 유효성 검사에 대해 더 자세하게 알아보려면 [폼 유효성 검사](guide/form-validation "All about form validation.") 문서를 참고하세요.


{@a dynamic-forms}
{@a creating-dynamic-forms}

<!--
## Creating dynamic forms
-->
## 동적 폼 구성하기

<!--
`FormArray` is an alternative to `FormGroup` for managing any number of unnamed controls. As with form group instances, you can dynamically insert and remove controls from form array instances, and the form array instance value and validation status is calculated from its child controls. However, you don't need to define a key for each control by name, so this is a great option if you don't know the number of child values in advance.

To define a dynamic form, take the following steps.

1. Import the `FormArray` class.
2. Define a `FormArray` control.
3. Access the `FormArray` control with a getter method.
4. Display the form array in a template.

The following example shows you how to manage an array of *aliases* in `ProfileEditor`.
-->
폼 컨트롤에 이름이 없고 폼 컨트롤 개수가 변한다면 `FormGroup` 대신 `FormArray`를 사용하는 방법도 고려해볼만 합니다.
폼 그룹 인스턴스와 마찬가지로 폼 배열도 폼 컨트롤을 동적으로 추가하거나 제거할 수 있으며, 자식 폼 컨트롤을 모아 값이나 유효성 검사 결과를 한 번에 참조할 수도 있습니다.
폼 배열은 이름을 지정하는 방식으로 정의하지 않는데, 자식 폼 컨트롤의 개수가 몇개인지 몰라도 된다는 점에서는 이 방식이 유리합니다.

동적 폼은 이런 순서로 구현합니다.

1. `FormArray` 클래스를 로드합니다.
2. `FormArray` 컨트롤을 정의합니다.
3. 게터 메서드를 사용해서 `FormArray` 컨트롤에 접근합니다.
4. 템플릿에 폼 배열을 연결합니다.

폼 배열을 어떻게 활용할 수 있는지 예제를 보면서 확인해 보세요.


<!--
**Import the FormArray class**
-->
**FormArray 클래스 로드하기**

<!--
Import the `FormArray` class from `@angular/forms` to use for type information. The `FormBuilder` service is ready to create a `FormArray` instance.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports" header="src/app/profile-editor/profile-editor.component.ts (import)">

</code-example>
-->
먼저 `@angular/forms` 패키지에서 `FormArray` 클래스를 로드합니다. 이것은 컴포넌트 클래스에서 타입 참조를 위해 로드한 것이며, `FormBuilder`는 이 과정이 없어도 내부적으로 `FormArray` 타입을 지원합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.2.ts" region="form-array-imports" header="src/app/profile-editor/profile-editor.component.ts (심볼 로드하기)">

</code-example>


<!--
**Define a FormArray control**
-->
**FormArray 정의하기**

<!--
You can initialize a form array with any number of controls, from zero to many, by defining them in an array. Add an `aliases` property to the form group instance for `profileForm` to define the form array.

Use the `FormBuilder.array()` method to define the array, and the `FormBuilder.control()` method to populate the array with an initial control.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases" header="src/app/profile-editor/profile-editor.component.ts (aliases form array)">

</code-example>

The aliases control in the form group instance is now populated with a single control until more controls are added dynamically.
-->
폼 배열은 배열로 초기화하며, 이 때 배열의 길이는 어떠한 것이라도 가능합니다. `profileForm`에 `aliases` 프로퍼티를 추가하고, 이 프로퍼티를 폼 배열로 정의해 봅시다.

`FormBuilder`를 사용한다면 `array()` 메소드로 폼 배열을 정의할 수 있으며, `FormBuilder.control()` 메소드를 사용해서 기본 폼 컨트롤을 생성합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases" header="src/app/profile-editor/profile-editor.component.ts (aliases 폼 배열)">

</code-example>

그러면 aliases 폼 컨트롤은 `FormGroup` 안에 폼 배열로 선언되며, 이후에 동적으로 추가되기 전까지는 폼 컨트롤 1개로 구성됩니다.


<!--
**Access the FormArray control**
-->
**FormArray에 접근하기**

<!--
A getter provides easy access to the aliases in the form array instance compared to repeating the `profileForm.get()` method to get each instance. The form array instance represents an undefined number of controls in an array. It's convenient to access a control through a getter, and this approach is easy to repeat for additional controls.

Use the getter syntax to create an `aliases` class property to retrieve the alias's form array control from the parent form group.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter" header="src/app/profile-editor/profile-editor.component.ts (aliases getter)">

</code-example>

<div class="alert is-helpful">

**Note:** Because the returned control is of the type `AbstractControl`, you need to provide an explicit type to access the method syntax for the form array instance.

</div>

Define a method to dynamically insert an alias control into the alias's form array.
The `FormArray.push()` method inserts the control as a new item in the array.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias" header="src/app/profile-editor/profile-editor.component.ts (add alias)">

</code-example>

In the template, each control is displayed as a separate input field.
-->
폼 배열을 사용한다면 폼 배열 안의 각 인스턴스를 `profileForm.get()` 메소드로 참조하는 것보다 게터(getter) 함수를 사용하는 것이 편합니다. 게터 함수를 사용하면  폼 배열 안에 있는 폼 컨트롤의 개수에 관계없이 간단하게 폼 컨트롤의 값을 참조할 수 있고, 반복문을 작성할 때도 편합니다.

게터 함수는 다음과 같이 정의합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="aliases-getter" header="src/app/profile-editor/profile-editor.component.ts (aliases 게터)">
</code-example>

<div class="alert is-helpful">

**참고:** 폼 컨트롤을 참조하기 위해 `get()` 메소드를 사용하면 `AbstractControl` 타입으로 폼 컨트롤을 받습니다. 공통 메소드를 사용한다면 이대로 활용해도 되지만, `FormArray`에 해당되는 메소드를 사용하려면 타입 캐스팅 해야 합니다.

</div>

이번에는 `FormArray`에 동적으로 폼 컨트롤을 추가하는 함수를 정의해 봅시다. 폼 배열에 새로운 폼 컨트롤을 추가할 때는 `FormArray.push()` 메소드를 사용합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.ts" region="add-alias" header="src/app/profile-editor/profile-editor.component.ts (항목 추가)">

</code-example>

이제 이렇게 만든 폼 배열을 템플릿에 표시해 봅시다.


<!--
**Display the form array in the template**
-->
**템플릿에 폼 배열 표시하기**

<!--
To attach the aliases from your form model, you must add it to the template. Similar to the `formGroupName` input provided by `FormGroupNameDirective`, `formArrayName` binds communication from the form array instance to the template with `FormArrayNameDirective`.

Add the template HTML below after the `<div>` closing the `formGroupName` element.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname" header="src/app/profile-editor/profile-editor.component.html (aliases form array template)"></code-example>

The `*ngFor` directive iterates over each form control instance provided by the aliases form array instance. Because form array elements are unnamed, you assign the index to the `i` variable and pass it to each control to bind it to the `formControlName` input.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-4.png" alt="Profile Editor Aliases">
</div>

Each time a new alias instance is added, the new form array instance is provided its control based on the index. This allows you to track each individual control when calculating the status and value of the root control.
-->
사용자가 폼 모델에 aliases 값을 입력하려면 이 폼 컨트롤을 템플릿에 추가해야 합니다. 이전 예제에서 `FormGroupNameDirective`를 `formGroupName` 어트리뷰트로 바인딩했던 것과 비슷하게, `FormArrayNameDirective`가 제공하는 `formArrayName` 어트리뷰트를 사용해서 `FormArray`를 템플릿에 바인딩 하면 됩니다.

`formGroupName` `<div>` 엘리먼트 뒤에 다음과 같은 템플릿을 추가합니다.

<code-example path="reactive-forms/src/app/profile-editor/profile-editor.component.html" region="formarrayname" header="src/app/profile-editor/profile-editor.component.html (aliases 폼 배열의 템플릿)"></code-example>

`*ngFor` 디렉티브는 폼 배열 인스턴스의 각 폼 컨트롤 인스턴스를 순회합니다. 폼 배열 안에 있는 항목은 이름이 없기 때문에 인덱스를 변수 `i`에 활용해서 `formControlName`으로 바인딩했습니다.

<div class="lightbox">
  <img src="generated/images/guide/reactive-forms/profile-editor-4.png" alt="Profile Editor Aliases">
</div>

이제는 폼 배열의 개수가 변하더라도 각각의 폼컨트롤은 인덱스로 관리됩니다. 이 폼 배열이나 전체 폼 그룹의 값, 상태를 확인할 때도 같은 인덱스를 활용할 수 있습니다.


<!--
**Add an alias**
-->
**별칭 추가하기**

<!--
Initially, the form contains one `Alias` field. To add another field, click the **Add Alias** button. You can also validate the array of aliases reported by the form model displayed by `Form Value` at the bottom of the template.

<div class="alert is-helpful">

**Note:** Instead of a form control instance for each alias, you can compose another form group instance with additional fields. The process of defining a control for each item is the same.

</div>
-->
이 폼의 `Alias` 필드는 기본적으로 폼 컨트롤이 하나 존재합니다. 그리고 **Add Alias** 버튼을 누르면 폼 컨트롤이 추가되며, 이렇게 추가된 폼 컨트롤의 유효성 상태도 템플릿 아래에 추가했던 `Form Value` 부분을 통해 확인할 수 있습니다.

<div class="alert is-helpful">

**참고:** _aliases_ 필드는 폼 컨트롤 단위로 추가할 수도 있지만 폼 그룹 단위로 추가할 수도 있습니다. 폼 컨트롤을 정의하고 활용하는 방법은 같습니다.

</div>


{@a reactive-forms-api}

<!--
## Reactive forms API summary
-->
## 반응형 폼 API

<!--
The following table lists the base classes and services used to create and manage reactive form controls.
For complete syntax details, see the API reference documentation for the [Forms package](api/forms "API reference.").
-->
아래 표는 반응형 폼을 구현할 때 자주 사용하는 클래스와 서비스 목록을 나열한 것입니다.
개별 사용방법에 대해 자세하게 알아보려면 [폼 패키지 API 문서](api/forms "API reference.")를 참고하세요.


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
