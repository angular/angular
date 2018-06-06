<!--
# Dynamic Forms
-->
# 동적 폼 (Dynamic Forms)

{@a top}

<!--
Building handcrafted forms can be costly and time-consuming,
especially if you need a great number of them, they're similar to each other, and they change frequently
to meet rapidly changing business and regulatory requirements.
-->
폼을 하나하나 만드는 것은 번거롭고 시간도 많이 걸리는 일입니다.
비슷한 폼을 많이 사용한다면 더욱 그렇고, 업무 로직이나 요구사항이 계속 바뀌는 것에 계속 대응하기도 힘듭니다.

<!--
It may be more economical to create the forms dynamically, based on
metadata that describes the business object model.
-->
이런 경우에는 비즈니스 객체 모델을 표현하는 메타데이터만 가지고 동적으로 폼을 만드는 것이 더 효율적일 수 있습니다.

<!--
This cookbook shows you how to use `formGroup` to dynamically
render a simple form with different control types and validation.
It's a primitive start.
It might evolve to support a much richer variety of questions, more graceful rendering, and superior user experience.
All such greatness has humble beginnings.
-->
이 문서에서는 다양한 타입과 유효성 검사 로직을 갖는 폼을 동적으로 만드는 방법에 대해 안내합니다.
시작은 아주 간단합니다.
하지만 이 문서에서 다루는 예제 코드는 다양하게 활용될 수 있으며, 렌더링은 물론 UX 측면에서도 훌륭하게 동작합니다.
위대한 업적들도 모두 작은 한걸음부터 시작됩니다.

<!--
The example in this cookbook is a dynamic form to build an
online application experience for heroes seeking employment.
The agency is constantly tinkering with the application process.
You can create the forms on the fly *without changing the application code*.
-->
이 문서에서는 히어로 구직 애플리케이션을 동적 폼으로 만들어 봅니다.
그리고 애플리케이션 프로세스를 점점 확장해 볼 것입니다.
이 문서에서 만드는 폼은 *애플리케이션 코드를 많이 고치지 않고도* 실제 애플리케이션에 활용할 수 있을 것입니다.

{@a toc}

<!--
See the <live-example name="dynamic-form"></live-example>.
-->
이 문서에서 다루는 예제는 <live-example name="dynamic-form"></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

{@a bootstrap}

<!--
## Bootstrap
-->
## 부트스트랩

<!--
Start by creating an `NgModule` called `AppModule`.

This cookbook uses [reactive forms](guide/reactive-forms).

Reactive forms belongs to a different `NgModule` called `ReactiveFormsModule`,
so in order to access any reactive forms directives, you have to import
`ReactiveFormsModule` from the `@angular/forms` library.

Bootstrap the `AppModule` in `main.ts`.
-->
`AppModule`이라고 하는 최상위 `NgModule`을 만드는 것부터 시작합니다.

이 문서에서 다루는 예제는 [반응형 폼](guide/reactive-forms)을 활용합니다.

반응형 폼은 `ReactiveFormsModule`로 제공되며, 반응형 폼에서 사용하는 폼 디렉티브도 모두 이 모듈에 포함되어 있습니다. 따라서 `@angular/forms` 라이브러리에서 `ReactiveFormsModule`을 로드해서 Angular 모듈에 추가해야 합니다.

`AppModule`은 `main.ts` 파일에서 시작합니다.

<code-tabs>

  <code-pane title="app.module.ts" path="dynamic-form/src/app/app.module.ts">

  </code-pane>

  <code-pane title="main.ts" path="dynamic-form/src/main.ts">

  </code-pane>

</code-tabs>


{@a object-model}

<!--
## Question model
-->
## 질문 모델

<!--
The next step is to define an object model that can describe all scenarios needed by the form functionality.
The hero application process involves a form with a lot of questions.
The _question_ is the most fundamental object in the model.

The following `QuestionBase` is a fundamental question class.
-->
다음 순서는 폼 기능과 시나리오에 적합한 객체 모델을 정의하는 것입니다.
이 애플리케이션에서 만드는 폼은 사용자에게 질문을 여러개 받는 것이 목적입니다.
그래서 _질문_ 에 대한 내용이 모델에서 가장 중요합니다.

데이터 모델의 공통 부분을 `QuestionBase` 클래스로 정의합니다.

<code-example path="dynamic-form/src/app/question-base.ts" title="src/app/question-base.ts">

</code-example>


<!--
From this base you can derive two new classes in `TextboxQuestion` and `DropdownQuestion`
that represent textbox and dropdown questions.
The idea is that the form will be bound to specific question types and render the
appropriate controls dynamically.

`TextboxQuestion` supports multiple HTML5 types such as text, email, and url
via the `type` property.
-->
이 클래스는 `TextboxQuestion`과 `DropdownQuestion`로 확장되며, 각각의 용도에 따라 텍스트박스나 드롭박스로 구현됩니다.
그리고 이 문서에서 구현하는 폼은 동적으로 구현되기 때문에 특정 질문 타입이나 HTML 컨트롤과도 자유롭게 연결할 수 있습니다.

`TextboxQuestion`은 HTML5 타입으로 제공하는 일반 텍스트, 이메일, url과 대응됩니다.

<code-example path="dynamic-form/src/app/question-textbox.ts" title="src/app/question-textbox.ts" linenums="false">

</code-example>


<!--
`DropdownQuestion` presents a list of choices in a select box.
-->
그리고 `DropdownQuestion`은 셀렉트 박스로 받는 질문과 대응됩니다.


<code-example path="dynamic-form/src/app/question-dropdown.ts" title="src/app/question-dropdown.ts" linenums="false">

</code-example>


<!--
Next is `QuestionControlService`, a simple service for transforming the questions to a `FormGroup`.
In a nutshell, the form group consumes the metadata from the question model and
allows you to specify default values and validation rules.
-->
다음은 질문 객체를 `FormGroup`으로 변환하는 `QuestionControlService`를 간단하게 만들어 봅시다.
이 서비스의 프로토타입은 질문 모델을 받아서 폼 그룹으로 변환하는데, 이 때 기본값과 유효성 검사도 함께 적용할 수 있습니다.

<code-example path="dynamic-form/src/app/question-control.service.ts" title="src/app/question-control.service.ts" linenums="false">

</code-example>

{@a form-component}

<!--
## Question form components
-->
## 질문 폼 컴포넌트

<!--
Now that you have defined the complete model you are ready
to create components to represent the dynamic form.
-->
이제 동적 폼을 만들 데이터 모델이 모두 준비되었습니다.

<!--
`DynamicFormComponent` is the entry point and the main container for the form.
-->
`DynamicFormComponent`는 폼 컨테이너이며 애플리케이션의 시작점입니다.
이 컴포넌트의 템플릿과 클래스 코드를 다음과 같이 작성합니다:

<code-tabs>

  <code-pane title="dynamic-form.component.html" path="dynamic-form/src/app/dynamic-form.component.html">

  </code-pane>

  <code-pane title="dynamic-form.component.ts" path="dynamic-form/src/app/dynamic-form.component.ts">

  </code-pane>

</code-tabs>


<!--
It presents a list of questions, each bound to a `<app-question>` component element.
The `<app-question>` tag matches the `DynamicFormQuestionComponent`,
the component responsible for rendering the details of each _individual_
question based on values in the data-bound question object.
-->
이 컴포넌트에는 개별 질문이 각각 `<app-question>` 컴포넌트 엘리먼트와 연결됩니다.
`<app-question>` 태그는 `DynamicFormQuestionComponent`를 표현하며, 이 컴포넌트는 화면에서 _개별_ 질문을 받습니다.

<code-tabs>

  <code-pane title="dynamic-form-question.component.html" path="dynamic-form/src/app/dynamic-form-question.component.html">

  </code-pane>

  <code-pane title="dynamic-form-question.component.ts" path="dynamic-form/src/app/dynamic-form-question.component.ts">

  </code-pane>

</code-tabs>


<!--
Notice this component can present any type of question in your model.
You only have two types of questions at this point but you can imagine many more.
The `ngSwitch` determines which type of question to display.
-->
이 컴포넌트는 어떠한 질문 모델에도 대응할 수 있습니다.
지금은 질문의 종류가 두 가지 타입 뿐이지만, 필요하다면 얼마든지 확장할 수 있습니다.
각각의 타입은 템플릿에서 `ngSwitch`로 분기됩니다.

<!--
In both components  you're relying on Angular's **formGroup** to connect the template HTML to the
underlying control objects, populated from the question model with display and validation rules.
-->
예제에서 사용하는 두 컴포넌트는 모두 Angular **formGroup**을 사용해서 템플릿 HTML과 폼 컨트롤 객체를 연결하고, 이 때 질문 모델에 있는 값을 화면에 표시하고 유효성 검사도 함께 적용합니다.

<!--
`formControlName` and `formGroup` are directives defined in
`ReactiveFormsModule`. The templates can access these directives
directly since you imported `ReactiveFormsModule` from `AppModule`.
-->
`formControlName`과 `formGroup`은 `ReactiveFormsModule`에 정의되어 있는 디렉티브입니다.
따라서 `ReactiveFormsModule`은 `AppModule`에 로드되어야 템플릿에서도 사용할 수 있습니다.

{@a questionnaire-data}

<!--
## Questionnaire data
-->
## 설문지 데이터

<!--
`DynamicFormComponent` expects the list of questions in the form of an array bound to `@Input() questions`.
-->
`DynamicFormComponent`는 질문을 폼 형태로 나열하며, 이 질문들은 `@input() questions`에 바인딩 됩니다.

<!--
 The set of questions you've defined for the job application is returned from the `QuestionService`.
 In a real app you'd retrieve these questions from storage.
-->
이 질문들에는 히어로가 찾는 직업에 대한 정보를 입력하고 `QuestionService`에 전달합니다.
실제 앱이라면 스토리지에서 질문을 받아오는 것도 고려할 수 있을 것입니다.

<!--
 The key point is that you control the hero job application questions
 entirely through the objects returned from `QuestionService`.
 Questionnaire maintenance is a simple matter of adding, updating,
 and removing objects from the `questions` array.
-->
이 예제에서 중요한 것은, 애플리케이션에서 사용하는 폼은 `QuestionService`에 전달하는 객체 타입의 인자로 정해진다는 것입니다.
그래서 `questions` 배열에 항목을 추가하거나 제거하면 설문지도 자동으로 변경됩니다.

<code-example path="dynamic-form/src/app/question.service.ts" title="src/app/question.service.ts">

</code-example>


<!--
Finally, display an instance of the form in the `AppComponent` shell.
-->
마지막으로 폼을 `AppComponent`에 추가합니다.

<code-example path="dynamic-form/src/app/app.component.ts" title="app.component.ts">

</code-example>

{@a dynamic-template}

<!--
## Dynamic Template
-->
## 동적 템플릿 (Dynamic Template)

<!--
Although in this example you're modelling a job application for heroes, there are
no references to any specific hero question
outside the objects returned by `QuestionService`.
-->
이 예제는 히어로의 구직 애플리케이션을 다루고 있지만, `QuestionService`는 질문에 대한 것 말고는 아무것에도 영향을 받지 않습니다.

<!--
This is very important since it allows you to repurpose the components for any type of survey
as long as it's compatible with the *question* object model.
The key is the dynamic data binding of metadata used to render the form
without making any hardcoded assumptions about specific questions.
In addition to control metadata, you are also adding validation dynamically.
-->
그래서 이 예제에 사용한 컴포넌트들은 어떠한 *질문* 모델과도 호환이 되기 때문에 자유롭게 재사용할 수 있다는 점에서 중요합니다.
특정 질문에 대해 하드코딩된 것은 아무것도 없기 때문에 바인딩되는 메타데이터를 변경하면 얼마든지 폼을 자유롭게 변경할 수 있습니다.
이 때 메타데이터에 유효성 검사 로직도 동적으로 지정할 수 있습니다.

<!--
The *Save* button is disabled until the form is in a valid state.
When the form is valid, you can click *Save* and the app renders the current form values as JSON.
This proves that any user input is bound back to the data model.
Saving and retrieving the data is an exercise for another time.
-->
*Save* 버튼은 폼의 전체 유효성 검사 결과가 유효하기 전까지는 비활성화되어 있습니다.
그리고 폼의 전체 유효성 검사가 유효하면 *Save* 버튼을 눌러서 현재 폼에 입력된 데이터를 JSON 타입으로 화면에서 확인할 수 있습니다.
데이터를 서버에 저장하고 다시 받아오는 동작은 다른 예제에서 다룹니다.

<!--
The final form looks like this:
-->
최종 코드는 다음과 같이 동작합니다:

<figure>
  <img src="generated/images/guide/dynamic-form/dynamic-form.png" alt="Dynamic-Form">
</figure>


<!--
[Back to top](guide/dynamic-form#top)
-->
[맨 위로](guide/dynamic-form#top)