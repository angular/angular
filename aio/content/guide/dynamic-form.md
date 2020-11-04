<!--
# Building dynamic forms
-->
# 동적 폼 구성하기

<!--
Many forms, such as questionaires, can be very similar to one another in format and intent.
To make it faster and easier to generate different versions of such a form,
you can create a *dynamic form template* based on metadata that describes the business object model.
You can then use the template to generate new forms automatically, according to changes in the data model.

The technique is particularly useful when you have a type of form whose content must
change frequently to meet rapidly changing business and regulatory requirements.
A typical use case is a questionaire. You might need to get input from users in different contexts.
The format and style of the forms a user sees should remain constant, while the actual questions you need to ask vary with the context.

In this tutorial you will build a dynamic form that presents a basic questionaire.
You will build an online application for heroes seeking employment.
The agency is constantly tinkering with the application process, but by using the dynamic form
you can create the new forms on the fly without changing the application code.

The tutorial walks you through the following steps.

1. Enable reactive forms for a project.
2. Establish a data model to represent form controls.
3. Populate the model with sample data.
4. Develop a component to create form controls dynamically.

The form you create uses input validation and styling to improve the user experience.
It has a Submit button that is only enabled when all user input is valid, and flags invalid input with color coding and error messages.

The basic version can evolve to support a richer variety of questions, more graceful rendering, and superior user experience.

<div class="alert is-helpful">

See the <live-example name="dynamic-form"></live-example>.

</div>
-->
설문지를 폼으로 구현한다면 설문지마다 구성 형식과 의도가 비슷한 경우가 대부분일 것입니다.
이런 경우라면 업무 효율성을 위해 비즈니스 객체 모델을 메타데이터로 정의하고 *동적 폼 템플릿(dynamic form template)*을 구성해둔 뒤에 개별 폼을 빠르게 자동으로 생성하는 것이 더 좋습니다.

내용이 계속 바뀌고 이 변화에 빠르게 대응해야 하는 업무일수록 이 방식이 특히 효율적입니다.
개별 질문마다 사용자에게 입력을 설문지가 대표적인 경우입니다.
설문지는 질문이 달라지더라도 사용자가 입력하는 형식이나 스타일은 거의 비슷합니다.

이 문서에서는 동적 폼을 구성하면서 설문지 기본 양식을 만들어 봅시다.
구체적으로 설명하면, 히어로가 히어로 관리 회사에 지원할 수 있는 온라인 애플리케이션을 만들어 봅니다.
히어로 관리 회사는 신청 프로세스를 지속적으로 개선하고 있지만 동적 폼을 사용하면 애플리케이션 코드를 변경하지 않아도 새로운 양식을 만들 수 있습니다.

이 문서는 이런 순서로 진행합니다.

1. 프로젝트에 반응형 폼을 로드합니다.
2. 폼 컨트롤을 표현하는 데이터 모델을 정의합니다.
3. 데이터 모델로 샘플 데이터를 만들어 봅니다.
4. 폼 컨트롤을 동적으로 구성하는 컴포넌트를 구현합니다.

이 문서에서 폼에 유효성 검사를 추가하고 스타일을 적용하면 사용자 UX도 좋아질 수 있습니다.
폼에 있는 제출 버튼은 사용자가 모든 필드를 입력했을 때만 활성화되며, 입력값이 유효하지 않은 필드는 다른 색으로 표시하면서 에러 메시지도 함께 표시하는 식입니다.

동적 폼은 간단하게 구성할 수 있지만 질문의 개수, 종류를 더 늘리거나 더 나은 스타일로 꾸미기도 쉽습니다.

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example name="dynamic-form"></live-example>에서 직접 확인하거나 다운받아 확인할 수 이습니다.

</div>


<!--
## Prerequisites
-->
## 사전지식

<!--
Before doing this tutorial, you should have a basic understanding to the following.

* [TypeScript](https://www.typescriptlang.org/docs/home.html "The TypeScript language") and HTML5 programming.

* Fundamental concepts of [Angular app design](guide/architecture "Introduction to Angular app-design concepts").

* Basic knowledge of [reactive forms](guide/reactive-forms "Reactive forms guide").
-->
이 문서를 보기 전에 이런 내용을 미리 이해하고 있는 것이 좋습니다.

* [TypeScript](https://www.typescriptlang.org/docs/home.html "The TypeScript language"), HTML 사용방법

* [Angular 개요](guide/architecture "Introduction to Angular app-design concepts") 문서에서 설명하는 Angular 기본 개념

* [반응형 폼](guide/reactive-forms "Reactive forms guide")에 대한 기본 지식


<!--
## Enable reactive forms for your project
-->
## 프로젝트에 반응형 폼 로드하기

<!--
Dynamic forms are based on reactive forms. To give the application access reactive forms directives, the [root module](guide/bootstrapping "Learn about bootstrapping an app from the root module.") imports `ReactiveFormsModule` from the `@angular/forms` library.

The following code from the example shows the setup in the root module.

<code-tabs>

  <code-pane header="app.module.ts" path="dynamic-form/src/app/app.module.ts">

  </code-pane>

  <code-pane header="main.ts" path="dynamic-form/src/main.ts">

  </code-pane>

</code-tabs>
-->
동적 폼은 반응형 폼을 기반으로 구성합니다.
그래서 애플리케이션에 반응형 폼을 구성하려면 `@angular/forms` 패키지로 제공하는 `ReactiveFormsModule`을 [앱 최상위 모듈](guide/bootstrapping "Learn about bootstrapping an app from the root module.")에 로드해야 합니다.

최상위 모듈은 이렇게 설정하면 됩니다.

<code-tabs>

  <code-pane header="app.module.ts" path="dynamic-form/src/app/app.module.ts">

  </code-pane>

  <code-pane header="main.ts" path="dynamic-form/src/main.ts">

  </code-pane>

</code-tabs>


{@a object-model}

<!--
## Create a form object model
-->
## 폼 객체 모델 정의하기

<!--
A dynamic form requires an object model that can describe all scenarios needed by the form functionality.
The example hero-application form is a set of questions&mdash;that is, each control in the form must ask a question and accept an answer.

The data model for this type of form must represent a question.
The example includes the `DynamicFormQuestionComponent`, which defines a  question as the fundamental object in the model.

The following `QuestionBase` is a base class for a set of controls that can represent the question and its answer in the form.

<code-example path="dynamic-form/src/app/question-base.ts" header="src/app/question-base.ts">

</code-example>
-->
동적 폼을 구성하려면 폼에 필요한 시나리오를 표현하는 객체 모델을 먼저 정의해야 합니다.
예제 애플리케이션은 질문들로 구성되며, 사용자가 개별 폼 컨트롤을 모두 입력해야 합니다.

개별 질문은 데이터 모델로 표현한 후에 `DynamicFormQuestionComponent`로 처리해 봅시다.
아래 예제 코드는 폼에 있는 질문과 답 한쌍을 표현하는 `QuestionBase` 클래스 코드입니다.

<code-example path="dynamic-form/src/app/question-base.ts" header="src/app/question-base.ts">
</code-example>


<!--
### Define control classes
-->
### 폼 컨트롤 클래스 정의하기

<!--
From this base, the example derives two new classes, `TextboxQuestion` and `DropdownQuestion`,
that represent different control types.
When you create the form template in the next step, you will instantiate these specific question types in order to render the appropriate controls dynamically.

* The `TextboxQuestion` control type presents a question and allows users to enter input.

   <code-example path="dynamic-form/src/app/question-textbox.ts" header="src/app/question-textbox.ts"></code-example>

   The `TextboxQuestion` control type will be represented in a form template using an `<input>` element.
   The `type` attribute of the element will be defined based on the `type` field specified in the `options` argument (for example `text`, `email`, `url`).

* The `DropdownQuestion` control presents a list of choices in a select box.

   <code-example path="dynamic-form/src/app/question-dropdown.ts" header="src/app/question-dropdown.ts"></code-example>
-->
이 클래스는 `TextboxQuestion`과 `DropdownQuestion`으로 확장되어 새로운 컨트롤 타입을 구성할 때 사용됩니다.
그리고 이후에 폼 템플릿을 동적으로 구성할 때도 질문의 종류에 따라 컴포넌트를 다양하게 사용할 것입니다.

* `TextboxQuestion` 컨트롤 타입은 사용자가 질문에 직접 답을 입력할 때 사용합니다.

   <code-example path="dynamic-form/src/app/question-textbox.ts" header="src/app/question-textbox.ts"></code-example>

   `TextboxQuestion` 타입은 폼 템플릿을 구성할 때 `<input>` 엘리먼트를 사용합니다.
   이 때 엘리먼트의 `type` 어트리뷰트는 `option`으로 받으며 `text`, `email`, `url`과 같은 형식을 사용할 것입니다.

* `DropdownQuestion` 타입은 셀렉트 박스에서 항목 하나를 고를 때 사용합니다.

   <code-example path="dynamic-form/src/app/question-dropdown.ts" header="src/app/question-dropdown.ts"></code-example>


<!--
### Compose form groups
-->
### 폼 그룹 구성하기

<!--
A dynamic form uses a service to create grouped sets of input controls, based on the form model.
The following `QuestionControlService` collects a set of `FormGroup` instances that consume the metadata from the question model. You can specify default values and validation rules.

<code-example path="dynamic-form/src/app/question-control.service.ts" header="src/app/question-control.service.ts"></code-example>
-->
폼 모델을 폼 컨트롤로 변환하는 서비스를 만들어 봅시다.
아래 코드는 데이터 모델을 모아서 `FormGroup` 인스턴스로 변환하는 `QuestionControlService` 클래스 코드입니다.
폼 컨트롤의 기본값이나 유효성 검사 함수는 이 서비스에서 지정하면 됩니다.

<code-example path="dynamic-form/src/app/question-control.service.ts" header="src/app/question-control.service.ts"></code-example>


{@a form-component}

<!--
## Compose dynamic form contents
-->
## 동적 폼 구성하기

<!--
The dynamic form itself will be represented by a container component, which you will add in a later step.
Each question is represented in the form component's template by an `<app-question>` tag, which matches an instance of `DynamicFormQuestionComponent`.

The `DynamicFormQuestionComponent` is responsible for rendering the details of an individual question based on values in the data-bound question object.
The form relies on a [`[formGroup]` directive](api/forms/FormGroupDirective "API reference") to connect the template HTML to the underlying control objects.
The `DynamicFormQuestionComponent` creates form groups and populates them with controls defined in the question model, specifying display and validation rules.

<code-tabs>

  <code-pane header="dynamic-form-question.component.html" path="dynamic-form/src/app/dynamic-form-question.component.html">

  </code-pane>

  <code-pane header="dynamic-form-question.component.ts" path="dynamic-form/src/app/dynamic-form-question.component.ts">

  </code-pane>

</code-tabs>

The goal of the `DynamicFormQuestionComponent` is to present question types defined in your model.
You only have two types of questions at this point but you can imagine many more.
The `ngSwitch` statement in the template determines which type of question to display.
The switch uses directives with the [`formControlName`](api/forms/FormControlName "FormControlName directive API reference") and [`formGroup`](api/forms/FormGroupDirective "FormGroupDirective API reference") selectors. Both directives are defined in `ReactiveFormsModule`.
-->
이번 예제에서 동적 폼은 그 자체로 컨테이너 컴포넌트의 역할도 합니다.
이 내용은 다음 단계에서 추가해 봅시다.
개별 질문은 폼 컴포넌트 템플릿에 `<app-question>` 태그를 사용하는데, 이 태그는 `DynamicFormQuestionComponent`를 의미합니다.


`DynamicFormQuestionComponent`는 바인딩된 질문 객체에 따라 개별 질문과 대답을 렌더링하는 역할을 합니다.
그리고 템플릿 HTML과 폼 컨트롤 객체를 연결할 때는 [`[formGroup]` 디렉티브](api/forms/FormGroupDirective "API reference")를 활용합니다.
결국 `DynamicFormQuestionComponent`는 사전에 정의된 질문 모델에 따라 전체 폼 그룹을 구성하며 화면에 표시하고 유효성을 검사합니다.

<code-tabs>

  <code-pane header="dynamic-form-question.component.html" path="dynamic-form/src/app/dynamic-form-question.component.html">

  </code-pane>

  <code-pane header="dynamic-form-question.component.ts" path="dynamic-form/src/app/dynamic-form-question.component.ts">

  </code-pane>

</code-tabs>

`DynamicFormQuestionComponent`는 데이터 모델로 정의한 질문들을 표시하는 역할을 합니다.
지금 단계에서는 질문의 종류가 두가지밖에 없지만, 이후에 이 종류는 얼마든지 확장할 수 있습니다.
이 때 질문 종류에 맞는 컴포넌트를 사용하려면 템플릿에 `ngSwitch`를 사용하면 됩니다.
그리고 개별 스위치는 [`formControlName`](api/forms/FormControlName "FormControlName directive API reference") 디렉티브와 [`formGroup`](api/forms/FormGroupDirective "FormGroupDirective API reference") 디렉티브를 함께 사용합니다.
두 디렉티브 모두 `ReactiveFormsModule`이 제공하는 디렉티브입니다.


{@a questionnaire-data}

<!--
### Supply data
-->
### 데이터 제공하기

<!--
Another service is needed to supply a specific set of questions from which to build an individual form.
For this exercise you will create the `QuestionService` to supply this array of questions from the hard-coded sample data.
In a real-world app, the service might fetch data from a backend system.
The key point, however, is that you control the hero job-application questions entirely through the objects returned from `QuestionService`.
To maintain the questionnaire as requirements change, you only need to add, update, and remove objects from the `questions` array.


The `QuestionService` supplies a set of questions in the form of an array bound to `@Input()` questions.

<code-example path="dynamic-form/src/app/question.service.ts" header="src/app/question.service.ts">

</code-example>
-->
개별 폼을 구성하려면 각 질문 데이터를 제공하는 서비스가 하나 더 필요합니다.
그래서 이번에는 `QuestionService`를 만들어서 질문을 `QuestionBase` 배열 타입으로 반환하는 코드를 구현해 봅시다.
실제로 운영하는 애플리케이션이라면 이 데이터는 백엔드 서버에서 받아올 것입니다.
하지만 이 문서는 `QuestionService`를 활용하는 측면을 다루는 것이 주요 내용이기 때문에, 예제에서는 하드코딩된 샘플 데이터를 사용합니다.
설문지 항목이 계속 변경된다면 `questions` 배열을 수정하면 됩니다.

`QuestionService`는 질문 데이터를 배열 형태로 반환하며, 이 데이터는 `@Input()` 프로퍼티에 바인딩하는 방식으로 사용할 것입니다.

<code-example path="dynamic-form/src/app/question.service.ts" header="src/app/question.service.ts">
</code-example>


{@a dynamic-template}

<!--
## Create a dynamic form template
-->
## 템플릿 구성하기

<!--
The `DynamicFormComponent` component is the entry point and the main container for the form, which is represented using the `<app-dynamic-form>` in a template.

The `DynamicFormComponent` component presents a list of questions by binding each one to an `<app-question>` element that matches the `DynamicFormQuestionComponent`.

<code-tabs>

  <code-pane header="dynamic-form.component.html" path="dynamic-form/src/app/dynamic-form.component.html">

  </code-pane>

  <code-pane header="dynamic-form.component.ts" path="dynamic-form/src/app/dynamic-form.component.ts">

  </code-pane>

</code-tabs>
-->
`DynamicFormComponent` 컴포넌트는 폼 전체를 구성하는 컴포넌트이며 템플릿에는 `<app-dynamic-form>`으로 사용됩니다.

그리고 이 컴포넌트는 질문 목록을 `<app-question>` 엘리먼트로 구성합니다.
개별 `<app-question>` 엘리먼트는 `DynamicFormQuestionComponent`를 의미합니다.

<code-tabs>

  <code-pane header="dynamic-form.component.html" path="dynamic-form/src/app/dynamic-form.component.html">

  </code-pane>

  <code-pane header="dynamic-form.component.ts" path="dynamic-form/src/app/dynamic-form.component.ts">

  </code-pane>

</code-tabs>


<!--
### Display the form
-->
### 폼 표시하기

<!--
To display an instance of the dynamic form, the `AppComponent` shell template passes the `questions` array returned by the `QuestionService` to the form container component, `<app-dynamic-form>`.

<code-example path="dynamic-form/src/app/app.component.ts" header="app.component.ts">

</code-example>

The example provides a model for a job application for heroes, but there are
no references to any specific hero question other than the objects returned by `QuestionService`.
This separation of model and data allows you to repurpose the components for any type of survey
as long as it's compatible with the *question* object model.
-->
동적 폼 인스턴스를 화면에 표시하려면 `QuestionService`가 반환하는 `questions` 배열을 `AppComponent`에 있는 `<app-dynamic-form>` 엘리먼트에 바인딩하면 됩니다.

<code-example path="dynamic-form/src/app/app.component.ts" header="app.component.ts">
</code-example>

이 문서에서 다루는 예제는 히어로가 입력하는 지원서를 구현한 것이며, 지원서에 입력하는 질문은 모두 `QuestionService`에 정의되어 있습니다.
폼 모델과 데이터를 분리했기 때문에 이 컴포넌트는 `QuestionBase` 객체 타입에 맞기만 하면 질문이 변경되더라도 문제없이 동작합니다.


<!--
### Ensuring valid data
-->
### 데이터 유효성 검사하기

<!--
The form template uses dynamic data binding of metadata to render the form
without making any hardcoded assumptions about specific questions.
It adds both control metadata and validation criteria dynamically.

To ensure valid input, the *Save* button is disabled until the form is in a valid state.
When the form is valid, you can click *Save* and the app renders the current form values as JSON.

The following figure shows the final form.

<div class="lightbox">
  <img src="generated/images/guide/dynamic-form/dynamic-form.png" alt="Dynamic-Form">
</div>
-->
지금까지 구현한 폼 템플릿은 컴포넌트에 바인딩된 동적 데이터를 기반으로 폼을 구성하며, 개별 질문에 대해 하드코딩된 내용은 아무것도 없습니다.
그래서 폼 컨트롤의 메타데이터나 유효성 검사 규칙도 동적으로 구성할 수 있습니다.

이 상황에서 폼에 입력된 값이 유효하다는 것을 보장하기 위해 *Save* 버튼은 폼 전체가 유효한 상태가 되어야만 활성화해야 합니다.
폼이 유효한 상태가 된 이후에 *Save* 버튼을 클릭하면 폼에 입력된 데이터를 JSON 형태로 표시할 것입니다.

폼이 모두 구성되면 이런 모습이 됩니다.

<div class="lightbox">
  <img src="generated/images/guide/dynamic-form/dynamic-form.png" alt="Dynamic-Form">
</div>


<!--
## Next steps
-->
## 다음 단계

<!--
* **Different types of forms and control collection**

   This tutorial shows how to build a a questionaire, which is just one kind of dynamic form.
   The example uses `FormGroup` to collect a set of controls.
   For an example of a different type of dynamic form, see the section [Creating dynamic forms](guide/reactive-forms#creating-dynamic-forms "Create dynamic forms with arrays") in the Reactive Forms guide.
   That example also shows how to use `FormArray` instead of `FormGroup` to collect a set of controls.

* **Validating user input**

   The section [Validating form input](guide/reactive-forms#validating-form-input "Basic input validation") introduces the basics of how input validation works in reactive forms.

   The [Form validation guide](guide/form-validation "Form validation guide") covers the topic in more depth.
-->
* **종류 확장하기, 개별 컨트롤 만들기**

   이번 예제에서는 설문지를 만들어보며 동적 폼을 구성해 봤으며, 폼 컨트롤을 구성하기 위해 `FormGroup`을 사용했습니다.
   동적 폼에 다른 종류의 컨트롤을 추가하려면 반응형 폼 문서의 [동적 폼 구성하기](guide/reactive-forms#creating-dynamic-forms "Create dynamic forms with arrays") 섹션을 참고하세요.
   이 섹션에서는 폼 컨트롤을 배열로 묶어서 구성하는 `FormArray`에 대해서도 다룹니다.

* **폼 유효성 검사하기**

   반응형 폼 문서의 [폼 유효성 검사하기](guide/reactive-forms#validating-form-input "Basic input validation") 섹션을 참고하면 반응형 폼에 유효성 검사를 어떻게 적용할 수 있는지 알 수 있습니다.

   이 문서보다 자세한 내용에 대해 알아보려면 [폼 유효성 검사하기](guide/form-validation "Form validation guide") 문서를 참고하세요.
