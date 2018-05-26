<!--
# Forms
-->
# 폼(forms)

<!--
Forms are the mainstay of business applications.
You use forms to log in, submit a help request, place an order, book a flight,
schedule a meeting, and perform countless other data-entry tasks.
-->
폼은 비즈니스 애플리케이션에서 가장 많이 사용하는 기능 중 하나입니다.
로그인을 할 때도 폼을 사용하고, 관리자에게 도움을 요청할 때도 폼을 사용하며, 물건을 주문하거나 비행기를 예약할 때도, 미팅 스케쥴을 잡을 때 등 셀 수 없이 많은 경우에 폼을 사용합니다.

<!--
In developing a form, it's important to create a data-entry experience that guides the
user efficiently and effectively through the workflow.
-->
그리고 폼을 구성할 때는 사용자가 전체 흐름에 맞도록 폼 전체를 자연스럽게 입력할 수 있도록, 순서를 고민해보는 것이 좋습니다.

<!--
Developing forms requires design skills (which are out of scope for this page), as well as framework support for
*two-way data binding, change tracking, validation, and error handling*,
which you'll learn about on this page.
-->
폼을 개발할 때는 어느정도의 디자인 능력이 필요하지만 이 문서에서 다루는 범위를 넘어서기 때문에 따로 설명하지는 않습니다. 그리고 이와 함께 *양방향 데이터 바인딩, 변화 감지, 에러 처리* 등의 기능을 제공하는 프레임워크를 사용하는 것도 좋으며, 이 문서는 이 내용에 대해 다룹니다.

<!--
This page shows you how to build a simple form from scratch. Along the way you'll learn how to:

* Build an Angular form with a component and template.
* Use `ngModel` to create two-way data bindings for reading and writing input-control values.
* Track state changes and the validity of form controls.
* Provide visual feedback using special CSS classes that track the state of the controls.
* Display validation errors to users and enable/disable form controls.
* Share information across HTML elements using template reference variables.

You can run the <live-example></live-example> in Stackblitz and download the code from there.
-->

이 문서는 간단한 폼을 만드는 방법부터 시작해서 다음과 같은 내용을 다룹니다:

* 컴포넌트와 템플릿을 조합해서 Angular 폼을 구성합니다.
* 사용자가 입력한 값을 읽고 다시 반영하기 위해 `ngModel`을 사용해서 양방향 데이터 바인딩을 연결합니다.
* 폼의 상태가 바뀌는 것을 감지하고, 폼 컨트롤의 유효성을 검사하는 방법을 알아봅니다.
* 사용자에게 피드백을 줄 수 있도록 폼 상태에 어울리는 CSS 클래스를 적용해 봅니다.
* 폼 컨트롤의 유효성 검증 결과를 화면에 표시합니다.
* 템플릿 참조 변수를 사용해서 HTML 엘리먼트의 정보를 활용합니다.

이 문서에서 다루는 예제는 <live-example></live-example>에서 바로 확인하거나 다운받아 확인할 수 있습니다.

{@a template-driven}

<!--
## Template-driven forms
-->
## 템플릿 기반 폼(template-driven forms)

<!--
You can build forms by writing templates in the Angular [template syntax](guide/template-syntax) with
the form-specific directives and techniques described in this page.
-->
간단한 폼은 Angular [템플릿 문법](guide/template-syntax)을 활용해서 템플릿만으로도 작성할 수 있습니다. 템플릿 기반 폼에 활용되는 디렉티브와 테크닉을 알아봅시다.

<div class="l-sub-section">

  <!--
  You can also use a reactive (or model-driven) approach to build forms.
  However, this page focuses on template-driven forms.
  -->
  폼은 반응형(reactive)나 모델 기반(model-driven)으로도 구성할 수 있습니다.
  하지만 이 문서는 템플릿 기반 폼에 대해서만 다룹니다.

</div>

<!--
You can build almost any form with an Angular template&mdash;login forms, contact forms, and pretty much any business form.
You can lay out the controls creatively, bind them to data, specify validation rules and display validation errors,
conditionally enable or disable specific controls, trigger built-in visual feedback, and much more.

Angular makes the process easy by handling many of the repetitive, boilerplate tasks you'd
otherwise wrestle with yourself.

You'll learn to build a template-driven form that looks like this:
-->
로그인 폼, 관리자 연락 폼 등 업무에 사용되는 폼은 Angular 템플릿으로도 충분히 만들 수 있습니다.
화면에 폼 컨트롤을 배치하고, 폼 컨트롤에 데이터를 바인딩하며, 이 데이터에 적용되는 유효성 규칙을 연결하고, 유효성 검사를 통과하지 않으면 에러를 표시하며, 조건에 따라 컨트롤을 비활성화하는 등 폼 동작에 필요한 모든 기능은 템플릿 안에 정의할 수 있습니다.

이 기능을 번거롭게 하나씩 구현하지 않도록, Angular는 폼을 더 쉽게 구성할 수 있는 방법을 제공합니다.

이 문서를 보면서 다음과 같은 템플릿 기반 폼을 만들어 봅시다:

<figure>
  <img src="generated/images/guide/forms/hero-form-1.png" alt="Clean Form">
</figure>

<!--
The *Hero Employment Agency* uses this form to maintain personal information about heroes.
Every hero needs a job. It's the company mission to match the right hero with the right crisis.

Two of the three fields on this form are required. Required fields have a green bar on the left to make them easy to spot.

If you delete the hero name, the form displays a validation error in an attention-grabbing style:
-->
*히어로 인력 사무소* 에서는 히어로들의 신상정보를 관리하기 위해 이 폼을 사용합니다.
히어로는 모두 일자리가 필요합니다. 이 회사의 목표는 위험수준에 어울리는 히어로를 적절하게 매칭하는 것입니다.

이 폼에 있는 3개의 필드 중 2개는 필수 항목입니다. 필수 항목은 입력 필드 왼쪽에 녹색 막대를 표시해서 알아보기 쉽게 만들었습니다.

이제 사용자가 히어로의 이름을 지우면 유효성 검사에 통과하지 못하면서 다음과 같은 에러 메시지가 표시됩니다:

<figure>
  <img src="generated/images/guide/forms/hero-form-2.png" alt="Invalid, Name Required">
</figure>

<!--
Note that the *Submit* button is disabled, and the "required" bar to the left of the input control changes from green to red.
-->
*Submit* 버튼이 비활성화 된 것도 확인해 보세요. 그리고 필수 입력 필드 왼쪽에 있던 녹색 막대는 빨간색으로 변경됩니다.

<div class="l-sub-section">

  <!--
  You can customize the colors and location of the "required" bar with standard CSS.
  -->
  필수 입력 필드의 녹색 막대는 표준 CSS를 사용해서 다른 색으로 변경할 수도 있습니다.

</div>

<!--
You'll build this form in small steps:

1. Create the `Hero` model class.
1. Create the component that controls the form.
1. Create a template with the initial form layout.
1. Bind data properties to each form control using the `ngModel` two-way data-binding syntax.
1. Add a `name` attribute to each form-input control.
1. Add custom CSS to provide visual feedback.
1. Show and hide validation-error messages.
1. Handle form submission with *ngSubmit*.
1. Disable the form’s *Submit* button until the form is valid.
-->
이 폼은 다음과 같은 순서로 구성합니다:

1. `Hero` 모델 클래스를 생성합니다.
1. 폼을 조작하는 컴포넌트를 생성합니다.
1. 폼 레이아웃에 맞게 템플릿을 생성합니다.
1. 각각의 폼 컨트롤에 데이터 프로퍼티를 바인딩하며, 이 때 `ngModel`을 사용해서 양방향으로 바인딩합니다.
1. 각 폼 입력 필드에 `name` 어트리뷰트를 추가합니다.
1. 화면에서 피드백을 표시하기 위해 CSS 설정을 추가합니다.
1. 유효성 검사 결과에 따라 에러 메시지를 표시하거나 감춥니다.
1. 폼이 제출되면 *ngSubmit* 이벤트를 처리합니다.
1. 폼이 다시 유효한 상태가 될 때까지 *Submit* 버튼을 비활성화 합니다.

<!--
## Setup
-->
## 환경설정

<!--
Create a new project named <code>angular-forms</code>:
-->
다음 명령을 실행해서 <code>angular-forms</code> 프로젝트를 생성합니다:

<code-example language="sh" class="code-shell">

  ng new angular-forms

</code-example>

<!--
## Create the Hero model class
-->
## 히어로 모델 클래스 생성하기

<!--
As users enter form data, you'll capture their changes and update an instance of a model.
You can't lay out the form until you know what the model looks like.

A model can be as simple as a "property bag" that holds facts about a thing of application importance.
That describes well the `Hero` class with its three required fields (`id`, `name`, `power`)
and one optional field (`alterEgo`).

Using the Angular CLI, generate a new class named `Hero`:
-->
사용자가 폼에 데이터를 입력하면 이 데이터가 변경되는 것을 감지해서 모델 인스턴스를 갱신해야 하는데,
그 전에 데이터 모델을 먼저 정의해야 합니다.

모델은 애플리케이션에 사용되는 정보를 담아두는 "프로퍼티 모음"이라고 생각할 수 있습니다.
이 객체는 `Hero` 클래스를 표현하는 정보를 담도록 정의하며, 3개의 필수 항목(`id`, `name`, `power`)과 한 개의 옵션 항목(`alterEgo`)으로 구성됩니다.

Angular CLI로 다음 명령을 실행해서 `Hero` 클래스를 생성합니다:

<code-example language="sh" class="code-shell">

  ng generate class Hero

</code-example>

<!--
With this content:
-->
그러면 다음과 같은 클래스가 생성됩니다:

<code-example path="forms/src/app/hero.ts" title="src/app/hero.ts">

</code-example>

<!--
It's an anemic model with few requirements and no behavior. Perfect for the demo.

The TypeScript compiler generates a public field for each `public` constructor parameter and
automatically assigns the parameter’s value to that field when you create heroes.

The `alterEgo` is optional, so the constructor lets you omit it; note the question mark (?) in `alterEgo?`.

You can create a new hero like this:
-->
아직까지는 뭔가 부족한 것 같고 히어로의 행동을 정의하는 함수도 없지만, 예제로 다루기에는 충분합니다.

이제 인자를 전달하면서 히어로 클래스를 생성하면, TypeScript 컴파일러가 생성자로 전달된 인자를 `public` 필드로 선언하고, 인자의 값을 해당 필드에 할당합니다.

이 때 `alterEgo` 필드는 옵션 항목입니다. 인스턴스를 생성할 때 이 항목은 생략해도 되기 때문에 물음표(?)를 붙여서 `alterEgo?`로 선언했습니다.

그러면 히어로는 다음과 같이 생성할 수 있습니다:

<code-example path="forms/src/app/hero-form/hero-form.component.ts" linenums="false" region="SkyDog">

</code-example>

<!--
## Create a form component
-->
## 폼 컴포넌트 생성하기

<!--
An Angular form has two parts: an HTML-based _template_ and a component _class_
to handle data and user interactions programmatically.
Begin with the class because it states, in brief, what the hero editor can do.

Using the Angular CLI, generate a new component named `HeroForm`:
-->
Angular 폼은 HTML 기반의 _템플릿_ 과 컴포넌트 _클래스_ 로 구성됩니다. 이 중 컴포넌트 클래스는 데이터를 처리하거나 사용자의 동작에 반응하는 로직을 작성합니다.

Angular CLI로 다음 명령을 실행해서 `HeroForm` 컴포넌트를 생성합니다:

<code-example language="sh" class="code-shell">

  ng generate component HeroForm

</code-example>

<!--
With this content:
-->
그리고 컴포넌트 클래스를 다음과 같이 작성합니다:

<code-example path="forms/src/app/hero-form/hero-form.component.ts" linenums="false" title="src/app/hero-form/hero-form.component.ts (v1)" region="v1">

</code-example>

<!--
There’s nothing special about this component, nothing form-specific,
nothing to distinguish it from any component you've written before.

Understanding this component requires only the Angular concepts covered in previous pages.

* The code imports the Angular core library and the `Hero` model you just created.
* The `@Component` selector value of "hero-form" means you can drop this form in a parent template with a `<hero-form>` tag.
* The `templateUrl` property points to a separate file for the template HTML.
* You defined dummy data for `model` and `powers`, as befits a demo.

Down the road, you can inject a data service to get and save real data
or perhaps expose these properties as inputs and outputs
(see [Input and output properties](guide/template-syntax#inputs-outputs) on the
[Template Syntax](guide/template-syntax) page) for binding to a
parent component. This is not a concern now and these future changes won't affect the form.

* You added a `diagnostic` property to return a JSON representation of the model.
It'll help you see what you're doing during development; you've left yourself a cleanup note to discard it later.
-->
이 컴포넌트 클래스는 아직 폼과 관련된 내용이 없어서 지금까지 작성한 컴포넌트와 비슷합니다.
지금까지 살펴본 Angular에 대한 내용만으로도 이 컴포넌트의 내용은 쉽게 이해할 수 있습니다.

* 이 컴포넌트는 Angular 코어 라이브리와 `Hero` 모델을 불러옵니다.
* `@Component` 데코레이터에 지정된 "hero-form" 셀렉터는 이 컴포넌트가 들어갈 위치를 지정하며, 부모 템플릿의 `<hero-form>` 태그에 매칭됩니다.
* 템플릿은 외부 파일로 지정하며, `templateUrl` 프로퍼티로 이 파일의 위치를 지정합니다.
* 예제로 활용할 더미 데이터를 `model`과 `powers`로 정의합니다.

예제를 더 진행하면, 데이터를 가져오거나 저장하는 로직은 서비스에 정의하고 컴포넌트에 주입하는 방법을 사용할 수도 있고, [템플릿 문법](guide/template-syntax) 가이드에서 설명한 [입출력 프로퍼티](guide/template-syntax#inputs-outputs)를 사용해서 부모 컴포넌트로 받아올 수도 있습니다.
이 문서에서는 이 내용에 대해 자세히 다루지 않으며, 나중에 이 내용을 적용하더라도 폼에 영향을 주지는 않습니다.

* 모델 인스턴스의 내용을 템플릿에서 확인하기 위해 `diagnostic` 프로퍼티를 추가했습니다.
이 프로퍼티는 폼을 개발하면서 데이터를 쉽게 확인하기 위해 사용하며, 나중에 필요하지 않으면 제거해도 됩니다.

<!--
## Revise *app.module.ts*
-->
## *app.module.ts* 수정하기

<!--
`app.module.ts` defines the application's root module. In it you identify the external modules you'll use in the application
and declare the components that belong to this module, such as the `HeroFormComponent`.

Because template-driven forms are in their own module, you need to add the `FormsModule` to the array of
`imports` for the application module before you can use forms.

Update it with the following:
-->
`app.module.ts`는 애플리케이션의 최상위 모듈을 정의합니다. 이 모듈에서는 애플리케이션에 사용하는 외부 모듈을 불러오며, `HeroFormComponent`와 같이 모듈에서 사용하는 컴포넌트도 등록합니다.

템플릿 기반 폼은 별개의 모듈로 제공되기 때문에 애플리케이션 모듈의 `imports` 배열에 `FormsModule`을 등록해야 폼을 사용할 수 있습니다.

앱 모듈을 다음과 같이 수정합니다:

<code-example path="forms/src/app/app.module.ts" title="src/app/app.module.ts">

</code-example>

<div class="l-sub-section">

  <!--
  There are two changes:

  1. You import `FormsModule`.

  1. You add the `FormsModule` to the list of `imports` defined in the `@NgModule` decorator. This gives the application
  access to all of the template-driven forms features, including `ngModel`.
  -->
  두 부분을 수정합니다:

  1. `FormsModule`을 로드합니다.

  1. `@NgModule` 데코레이터의 `imports` 목록에 `FormsModule`을 추가합니다. 그러면 애플리케이션 전체 범위에서 템플릿 기반 폼과 관련된 기능을 사용할 수 있습니다. `ngModel`도 이 기능 안에 포함됩니다.

</div>

<div class="alert is-important">

  <!--
  If a component, directive, or pipe belongs to a module in the `imports` array, ​_don't_​ re-declare it in the `declarations` array.
  If you wrote it and it should belong to this module, ​_do_​ declare it in the `declarations` array.
  -->
  `imports` 배열에 추가한 컴포넌트나 디렉티브, 파이프는 `declarations` 배열에 다시 _추가하지 마세요_ .
  `declarations` 배열에는 이 모듈에만 속하는 항목을 추가합니다.

</div>

<!--
## Revise *app.component.html*
-->
## *app.component.html* 수정하기

<!--
`AppComponent` is the application's root component. It will host the new `HeroFormComponent`.

Replace the contents of its template with the following:
-->
`AppComponent`는 애플리케이션의 최상위 컴포넌트 입니다. 이 컴포넌트에 `HeroFormComponent`를 추가하기 위해 템플릿을 다음과 같이 추가합니다:

<code-example path="forms/src/app/app.component.html" title="src/app/app.component.html">

</code-example>

<div class="l-sub-section">

  <!--
  There are only two changes.
  The `template` is simply the new element tag identified by the component's `selector` property.
  This displays the hero form when the application component is loaded.
  Don't forget to remove the `name` field from the class body as well.
  -->
  두 부분을 수정합니다.
  `template`에는 컴포넌트의 `selector` 프로퍼티에 지정한 엘리먼트 태그를 추가합니다.
  그러면 애플리케이션 컴포넌트가 로드된 이후에 히어로 폼이 화면에 표시될 것입니다.
  Angular CLI를 사용했을 때 클래스에 기본으로 선언된 `name` 필드는 제거하세요.

</div>

<!--
## Create an initial HTML form template
-->
## HTML 폼 템플릿 초기 버전 작성하기

<!--
Update the template file with the following contents:
-->
이제 템플릿을 다음과 같이 수정합니다:

<code-example path="forms/src/app/hero-form/hero-form.component.html" region="start" title="src/app/hero-form/hero-form.component.html">

</code-example>

<!--
The language is simply HTML5. You're presenting two of the `Hero` fields, `name` and `alterEgo`, and
opening them up for user input in input boxes.

The *Name* `<input>` control has the HTML5 `required` attribute;
the *Alter Ego* `<input>` control does not because `alterEgo` is optional.

You added a *Submit* button at the bottom with some classes on it for styling.

*You're not using Angular yet*. There are no bindings or extra directives, just layout.
-->
이 파일에 사용한 것은 단순한 HTML5 문법입니다. 이 문서에서는 `Hero` 객체의 필드인 `name`과 `alterEgo`를 입력받을 수 있으며, 각각은 입력 필드로 구성합니다.

*이름*에 해당하는 `<input>` 컨트롤에는 HTML5 어트리뷰트인 `required`를 지정하고, *별명*에 해당하는 `<input>` 컨트롤 값은 생략할 수 있기 때문에 지정하지 않았습니다.

그리고 *Submit* 버튼을 추가하고 스타일 클래스를 지정합니다.

*아직까지 Angular와 관련된 내용은 없습니다*. 바인딩이나 디렉티브도 사용되지 않았고 레이아웃만 작성했습니다.

<div class="l-sub-section">

  <!--
  In template driven forms, if you've imported `FormsModule`, you don't have to do anything
  to the `<form>` tag in order to make use of `FormsModule`. Continue on to see how this works.
  -->
  템플릿 기반 폼을 사용하기 위해 `FormsModule`을 로드하면, `FormsModule`에서 제공하는 방식으로만 `<form>` 태그의 동작을 실행할 수 있습니다. 이 내용은 이어서 계속 설명합니다.

</div>

<!--
The `container`, `form-group`, `form-control`, and `btn` classes
come from [Twitter Bootstrap](http://getbootstrap.com/css/). These classes are purely cosmetic.
Bootstrap gives the form a little style.
-->
이 코드에 사용된 `container`, `form-group`, `form-control`, `btn` 클래스들은 [Twitter Bootstrap](http://getbootstrap.com/css/)에 정의된 스타일 클래스입니다. 이 클래스들은 단순하게 엘리먼트의 모양만 지정하기 때문에 간단하게 사용할 수 있습니다.

<div class="callout is-important">

  <header>
    <!--
    Angular forms don't require a style library
    -->
    Angular 폼을 작성할 때 스타일 라이브러리가 필수인 것은 아닙니다.
  </header>

  <!--
  Angular makes no use of the `container`, `form-group`, `form-control`, and `btn` classes or
  the styles of any external library. Angular apps can use any CSS library or none at all.
  -->
  이 코드에 사용한 `container`, `form-group`, `form-control`, `btn` 클래스는 외부 스타일 라이브러리이며, Angular와는 관계가 없습니다. 스타일 라이브러리는 자유롭게 사용할 수 있으며, 아예 사용하지 않을 수도 있습니다.

</div>

<!--
To add the stylesheet, open `styles.css` and add the following import line at the top:
-->
스타일시트를 추가하려면 `styles.css` 파일을 열고 다음과 같은 내용을 추가하면 됩니다:

<code-example path="forms/src/styles.1.css" linenums="false" title="src/styles.css">

</code-example>

<!--
## Add powers with _*ngFor_
-->
## powers 필드에 _*ngFor_ 적용하기

<!--
The hero must choose one superpower from a fixed list of agency-approved powers.
You maintain that list internally (in `HeroFormComponent`).

You'll add a `select` to the
form and bind the options to the `powers` list using `ngFor`,
a technique seen previously in the [Displaying Data](guide/displaying-data) page.

Add the following HTML *immediately below* the *Alter Ego* group:
-->
등록되는 히어로는 특수능력을 하나 선택해야 하며, 이 특수능력의 목록은 회사에서 미리 정의하고 있습니다.
이 목록은 `HeroFormComponent`에 미리 정의해 두었습니다.

폼에는 `select` 엘리먼트를 추가하며, 이 엘리먼트의 목록은 컴포넌트의 `powers` 배열을 `ngFor`로 구성합니다.
목록을 구성하는 방법은 [데이터 표시하기](guide/displaying-data) 가이드를 참고하세요.

이 내용은 *특수 능력*을 입력받는 필드 *바로 아래* 다음과 같이 추가합니다:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (powers)" region="powers">

</code-example>

<!--
This code repeats the `<option>` tag for each power in the list of powers.
The `pow` template input variable is a different power in each iteration;
you display its name using the interpolation syntax.
-->
이 코드는 특수능력을 나타내는 배열마다 `<option>` 태그를 반복합니다.
이 때 템플릿 입력 변수 `pow`는 각 `ngFor` 싸이클에 해당되는 특수 능력이 할당되며, 템플릿에는 문자열 삽입(interpolation) 문법으로 표시합니다.

{@a ngModel}

<!--
## Two-way data binding with _ngModel_
-->
## _ngModel_ 로 양방향 바인딩하기

<!--
Running the app right now would be disappointing.
-->
지금까지 작성한 앱을 실행해보면 부족한 기능이 눈에 띌 것입니다.

<figure>
  <img src="generated/images/guide/forms/hero-form-3.png" alt="Early form with no binding">
</figure>

<!--
You don't see hero data because you're not binding to the `Hero` yet.
You know how to do that from earlier pages.
[Displaying Data](guide/displaying-data) teaches property binding.
[User Input](guide/user-input) shows how to listen for DOM events with an
event binding and how to update a component property with the displayed value.

Now you need to display, listen, and extract at the same time.

You could use the techniques you already know, but
instead you'll use the new `[(ngModel)]` syntax, which
makes binding the form to the model easy.

Find the `<input>` tag for *Name* and update it like this:
-->
아직까지는 `Hero` 객체를 바인딩하지 않았기 때문에 히어로의 데이터를 볼 수 없습니다.
이 내용은 [데이터 표시하기](guide/displaying-data) 가이드에서 이미 살펴본 프로퍼티 바인딩으로 개선할 수 있습니다.
그리고 [사용자 동작](guide/user-input) 가이드에서 본 대로 DOM에서 발생하는 이벤트에 반응해서 컴포넌트 프로퍼티를 갱신할 수도 있습니다.

하지만 지금은 프로퍼티의 값을 화면에 표시하면서, 동시에  화면에서 발생하는 이벤트를 감지해야 합니다.

사실 이 내용은 이전에도 다룬 적이 있습니다.
`[(ngModel)]` 문법을 사용하면 폼과 모델을 간단하게 바인딩 할 수 있습니다.

*이름*에 해당하는 `<input>` 태그에 이 방법을 적용해 봅시다:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="ngModelName-1">

</code-example>

<div class="l-sub-section">

  <!--
  You added a diagnostic interpolation after the input tag
  so you can see what you're doing.
  You left yourself a note to throw it away when you're done.
  -->
  입력 필드 뒤에는 디버그용 문자열 바인딩을 추가했습니다.
  필요한 기능을 모두 개발하고 나면 이 부분은 제거해도 됩니다.

</div>

<!--
Focus on the binding syntax: `[(ngModel)]="..."`.

You need one more addition to display the data. Declare
a template variable for the form. Update the `<form>` tag with
`#heroForm="ngForm"` as follows:
-->
바인딩 문법으로 사용된 `[(ngModel)]="..."`을 자세히 봅시다.

입력 필드는 현재 값을 화면에 표시하면서 또 다른 기능을 동시에 수행해야 합니다. 폼에 다음과 같이 템플릿 변수를 선언합니다:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="template-variable">

</code-example>

<!--
The variable `heroForm` is now a reference to the `NgForm` directive that governs the form as a whole.
-->
변수 `heroForm`는 이제 폼 전체를 표현하는 `NgForm`디렉티브를 가리킵니다.

<div class="l-sub-section">

  {@a ngForm}

  <!--
  ### The _NgForm_ directive
  -->
  ### _NgForm_ 디렉티브

  <!--
  What `NgForm` directive?
  You didn't add an [NgForm](api/forms/NgForm) directive.

  Angular did. Angular automatically creates and attaches an `NgForm` directive to the `<form>` tag.

  The `NgForm` directive supplements the `form` element with additional features.
  It holds the controls you created for the elements with an `ngModel` directive
  and `name` attribute, and monitors their properties, including their validity.
  It also has its own `valid` property which is true only *if every contained
  control* is valid.
  -->
  `NgForm` 디렉티브가 무엇일까요?
  지금까지 작성한 코드에서 [NgForm](api/forms/NgForm)를 추가하는 코드는 없었습니다.

  이 디렉티브는 Angular가 자동으로 추가합니다. Angular는 템플릿에 `<form>` 태그가 사용된 것을 확인하면 자동으로 `NgForm` 디렉티브를 생성하고 이 엘리먼트에 연결합니다.

  `NgForm` 디렉티브는 `<form>` 엘리먼트의 기능을 확장하는 디렉티브입니다. 이 디렉티브는 폼 엘리먼트 안에 정의된 폼 컨트롤들을 `ngModel` 디렉티브와 `name` 어트리뷰트로 연결하며, 컨트롤의 값이 변하는 것을 감지하고, 유효성을 검사하는 기능도 지원합니다.
  그리고 `NgForm` 디렉티브에는 `valid` 프로퍼티가 존재하는데, 이 값은 *모든 컨트롤*의 유효성 검사를 통과했을 때 true로 할당됩니다.

</div>

<!--
If you ran the app now and started typing in the *Name* input box,
adding and deleting characters, you'd see them appear and disappear
from the interpolated text.
At some point it might look like this:
-->
이 앱을 실행하고 *이름* 입력 필드에 글자를 입력하면, 컴포넌트 프로퍼티 값이 어떤 값으로 설정되는지 화면에서 확인할 수 있습니다.
다음과 같이 표시될 것입니다:

<figure>
  <img src="generated/images/guide/forms/ng-model-in-action.png" alt="ngModel in action">
</figure>

<!--
The diagnostic is evidence that values really are flowing from the input box to the model and
back again.
-->
템플릿에 추가한 디버그용 구문을 활용하면 입력 필드의 값이 모델로 반영되고, 이 값이 다시 화면에 반영되는 것을 확인할 수 있습니다.

<div class="l-sub-section">

  <!--
  That's *two-way data binding*.
  For more information, see
  [Two-way binding with NgModel](guide/template-syntax#ngModel) on the
  the [Template Syntax](guide/template-syntax) page.
  -->
  *양방향 데이터 바인딩*을 간단하게 살펴봤습니다.
  좀 더 자세한 내용을 확인하려면 [템플릿 문법](guide/template-syntax) 가이드에 있는 [NgModel - 양방향 바인딩 디렉티브](guide/template-syntax#ngModel) 부분을 참고하세요.

</div>

<!--
Notice that you also added a `name` attribute to the `<input>` tag and set it to "name",
which makes sense for the hero's name. Any unique value will do, but using a descriptive name is helpful.
Defining a `name` attribute is a requirement when using `[(ngModel)]` in combination with a form.
-->
이 예제에서는 `<input>` 태그에 `name="name"` 이라는 어트리뷰트를 추가했는데, 이 어트리뷰트는 히어로의 이름과 연결됩니다. 어디에서도 마찬가지지만, 필드 이름은 그 자체로 의미를 설명할 수 있도록 지정하는 것이 좋습니다.
이제 폼에 `[(ngModel)]`을 사용하기 때문에 `name` 어트리뷰트는 꼭 지정해야 합니다.

<div class="l-sub-section">

  <!--
  Internally, Angular creates `FormControl` instances and
  registers them with an `NgForm` directive that Angular attached to the `<form>` tag.
  Each `FormControl` is registered under the name you assigned to the `name` attribute.
  Read more in the previous section, [The NgForm directive](guide/forms#ngForm).
  -->
  Angular는 폼 안에 있는 각 `FormControl`의 인스턴스를 생성하고 이 인스턴스를 `<form>` 태그에 연결되는 `NgForm` 디렉티브에 등록하는데, 이 때 각각의 `FormControl`은 `name` 어트리뷰트로 구분됩니다. 위에서 설명한 [NgForm 디렉티브](guide/forms#ngForm)를 참고하세요.

</div>

<!--
Add similar `[(ngModel)]` bindings and `name` attributes to *Alter Ego* and *Hero Power*.
You'll ditch the input box binding message
and add a new binding (at the top) to the component's `diagnostic` property.
Then you can confirm that two-way data binding works *for the entire hero model*.

After revision, the core of the form should look like this:
-->
*별명*과 *특수 능력*도 `name` 어트리뷰트와 `[(ngModel)]`을 사용해서 바인딩합니다.
그리고 디버깅용으로 추가한 코드는 컴포넌트 최상단으로 옮기고 컴포넌트의 `diagnostic` 프로퍼티와 연결합니다.
이제 *히어로 모델의 전체값*을 양방향 바인딩으로 확인할 수 있습니다.

이렇게 수정하고 나면 폼 템플릿의 내용은 다음과 같습니다:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="ngModel-2">

</code-example>

<div class="l-sub-section">

  <!--
  * Each input element has an `id` property that is used by the `label` element's `for` attribute
  to match the label to its input control.
  * Each input element has a `name` property that is required by Angular forms to register the control with the form.
  -->
  * 각각의 입력 필드는 `id` 프로퍼티가 지정되어 있는데, 이 프로퍼티는 `<label>` 엘리먼트의 `for` 어트리뷰트로 연결됩니다.
  * 입력 필드에 지정된 `name` 프로퍼티는 Angular 폼이 내부 폼 컨트롤을 관리하기 위해 필요합니다.

</div>

<!--
If you run the app now and change every hero model property, the form might display like this:
-->
이제 앱을 실행하고 히어로 모델의 프로퍼티 값을 변경하면 다음과 같은 화면이 표시될 것입니다:

<figure>
  <img src="generated/images/guide/forms/ng-model-in-action-2.png" alt="ngModel in action">
</figure>

<!--
The diagnostic near the top of the form
confirms that all of your changes are reflected in the model.

*Delete* the `{{diagnostic}}` binding at the top as it has served its purpose.
-->
폼 위에 있는 디버깅 메시지를 확인하면 모델이 지금 어떤 값으로 지정되고 있는지 확인할 수 있습니다.

필요한 기능을 모두 개발하고 나면 `{{diagnostic}}` 바인딩을 *제거하세요*.

<!--
## Track control state and validity with _ngModel_
-->
## _ngModel_ 로 폼 컨트롤 상태와 유효성 추적하기

<!--
Using `ngModel` in a form gives you more than just two-way data binding. It also tells
you if the user touched the control, if the value changed, or if the value became invalid.

The *NgModel* directive doesn't just track state; it updates the control with special Angular CSS classes that reflect the state.
You can leverage those class names to change the appearance of the control.
-->
폼에 `ngModel`을 사용하는 것이 양방향 바인딩만을 위한 것은 아닙니다. 폼에 이 디렉티브를 사용하면 사용자가 폼 컨트롤에 접근했는지, 값이 변경되었는지, 입력된 값이 유효한지 확인할 수 있습니다.

*NgModel* 디렉티브는 폼 컨트롤의 상태를 추적하면서 그 상태에 해당하는 CSS 클래스를 해당 엘리먼트에 추가합니다.
이렇게 지정되는 클래스는 폼 컨트롤의 모습을 상황에 따라 다르게 표현할 때 활용할 수 있습니다.

<table>

  <tr>

    <th>
      <!--
      State
      -->
      상태
    </th>

    <th>
      <!--
      Class if true
      -->
      참일 때 클래스
    </th>

    <th>
      <!--
      Class if false
      -->
      거짓일 때 클래스
    </th>

  </tr>

  <tr>

    <td>
      <!--
      The control has been visited.
      -->
      사용자가 접근한 적이 있음
    </td>

    <td>
      <code>ng-touched</code>
    </td>

    <td>
      <code>ng-untouched</code>
    </td>

  </tr>

  <tr>

    <td>
      <!--
      The control's value has changed.
      -->
      폼 컨트롤의 값이 변경되었음
    </td>

    <td>
      <code>ng-dirty</code>
    </td>

    <td>
      <code>ng-pristine</code>
    </td>

  </tr>

  <tr>

    <td>
      <!--
      The control's value is valid.
      -->
      폼 컨트롤의 값이 유효함
    </td>

    <td>
      <code>ng-valid</code>
    </td>

    <td>
      <code>ng-invalid</code>
    </td>

  </tr>

</table>

<!--
Temporarily add a [template reference variable](guide/template-syntax#ref-vars) named `spy`
to the _Name_ `<input>` tag and use it to display the input's CSS classes.
-->
클래스가 지정되는 것을 확인하기 위해 임시로 [템플릿 참조 변수](guide/template-syntax#ref-vars) `spy`를 _이름_ 에 해당하는 `<input>` 태그에 지정하고, 템플릿에 표시하도록 다음과 같이 작성해 봅시다.

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="ngModelName-2">

</code-example>

<!--
Now run the app and look at the _Name_ input box.
Follow these steps *precisely*:

1. Look but don't touch.
1. Click inside the name box, then click outside it.
1. Add slashes to the end of the name.
1. Erase the name.

The actions and effects are as follows:
-->
이제 앱을 실행하고 _이름_ 입력 필드를 봅시다.
그리고 다음 단계를 *천천히* 실행해 봅니다:

1. 보기만 하고 아직 터치하지 마세요.
1. 입력 필드 안쪽을 클릭해보고, 바깥쪽을 클릭해 보세요.
1. 이름 뒤에 슬래시(`/`)를 입력해 보세요.
1. 이름을 지워보세요.

그러면 다음 그림처럼 표시될 것입니다:

<figure>
  <img src="generated/images/guide/forms/control-state-transitions-anim.gif" alt="Control State Transition">
</figure>

<!--
You should see the following transitions and class names:
-->
그리고 각각의 단계마다 다음과 같은 클래스가 적용됩니다:

<figure>
  <img src="generated/images/guide/forms/ng-control-class-changes.png" alt="Control state transitions">
</figure>

<!--
The `ng-valid`/`ng-invalid` pair is the most interesting, because you want to send a
strong visual signal when the values are invalid. You also want to mark required fields.
To create such visual feedback, add definitions for the `ng-*` CSS classes.

*Delete* the `#spy` template reference variable and the `TODO` as they have served their purpose.
-->
이 중에서 `ng-valid`/`ng-invalid`는 입력값이 유효하지 않을 때 엘리먼트의 모습을 다르게 표현할 때 활용하기 좋습니다. 그리고 필수 입력 필드를 입력하지 않았을 때도 이 클래스를 활용할 수 있으며, 템플릿에 연결된 CSS에 이 클래스를 활용하는 스타일을 지정하면 간단하게 적용할 수 있습니다.

필요한 기능을 모두 개발했으면 템플릿에 선언한 템플릿 참조 변수 `#spi`를 *제거하세요*.

<!--
## Add custom CSS for visual feedback
-->
## 시각적 표현을 위해 커스텀 CSS 추가하기

<!--
You can mark required fields and invalid data at the same time with a colored bar
on the left of the input box:
-->
필수 입력 필드가 입력되지 않았거나 유효하지 않은 데이터가 입력된 경우에는 입력 필드에 왼쪽에 이 상태를 표시하는 막대 표시를 추가할 수 있습니다.

<figure>
  <img src="generated/images/guide/forms/validity-required-indicator.png" alt="Invalid Form">
</figure>

<!--
You achieve this effect by adding these class definitions to a new `forms.css` file
that you add to the project as a sibling to `index.html`:
-->
이 스타일은 `index.html` 파일이 위치하는 폴더에 `forms.css` 파일을 새로 만들어서 지정해 봅시다.
이 파일의 내용은 다음과 같이 작성합니다:

<code-example path="forms/src/assets/forms.css" title="src/assets/forms.css">

</code-example>

<!--
Update the `<head>` of `index.html` to include this style sheet:
-->
그리고 `index.html` 파일의 `<head>`에서 이 스타일 시트를 불러오도록 수정합니다:

<code-example path="forms/src/index.html" linenums="false" title="src/index.html (styles)" region="styles">

</code-example>

<!--
## Show and hide validation error messages
-->
## 에러 메시지 표시하기

<!--
You can improve the form. The _Name_ input box is required and clearing it turns the bar red.
That says something is wrong but the user doesn't know *what* is wrong or what to do about it.
Leverage the control's state to reveal a helpful message.

When the user deletes the name, the form should look like this:
-->
폼을 좀 더 개선해 봅시다. 이 폼에서 _이름_ 입력 필드는 필수 항목이며, 입력 필드의 내용을 지우면 빨간 막대로 에러를 표시합니다.
하지만 이 상태로는 사용자는 *어떤 이유로 잘못되었는지* 알 수 없으며, 무엇을 해야할 지도 알 수 없습니다.
폼 컨트롤의 상태에 따라 사용자에게 도움이 되는 메시지를 표시해 봅시다.

사용자가 입력 필드의 이름을 지우면 다음과 같이 표시하려고 합니다:

<figure>
  <img src="generated/images/guide/forms/name-required-error.png" alt="Name required">
</figure>

<!--
To achieve this effect, extend the `<input>` tag with the following:

* A [template reference variable](guide/template-syntax#ref-vars).
* The "*is required*" message in a nearby `<div>`, which you'll display only if the control is invalid.

Here's an example of an error message added to the _name_ input box:
-->
이런 화면을 구현하기 위해 `<input>` 태그를 다음 내용을 추가합니다:

* [템플릿 참조 변수](guide/template-syntax#ref-vars)
* 폼 컨트롤 값이 유효하지 않을 때 에러 메시지를 표시할 `<div>`

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="name-with-error-msg">

</code-example>

<!--
You need a template reference variable to access the input box's Angular control from within the template.
Here you created a variable called `name` and gave it the value "ngModel".
-->
템플릿 참조 변수는 입력 필드에 연결된 Angular 폼 컨트롤을 템플릿 안에서 접근하기 위해 필요합니다.
위 코드에서는 이 변수를 `name`으로 선언했으며, "ngModel"을 그대로 연결했습니다.

<div class="l-sub-section">

  <!--
  Why "ngModel"?
  A directive's [exportAs](api/core/Directive) property
  tells Angular how to link the reference variable to the directive.
  You set `name` to `ngModel` because the `ngModel` directive's `exportAs` property happens to be "ngModel".
  -->
  왜 "ngModel"을 썼을까요?
  디렉티브에 있는 [exportAs](api/core/Directive) 프로퍼티를 사용하면 템플릿 참조 변수에 디렉티브의 인스턴스를 연결할 수 있습니다.
  이 코드에서는 `#name`에 `ngModel`을 할당했는데, 결국 템플릿 참조 변수 `#name`에 할당되는 것은 "ngModel" 디렉티브의 인스턴스입니다.

</div>

<!--
You control visibility of the name error message by binding properties of the `name`
control to the message `<div>` element's `hidden` property.
-->
그리고 이 에러 메시지가 표시되는 것을 제어하기 위해, `name`으로 참조하는 폼 컨트롤을 활용해서 새로 추가한 `<div>` 엘리먼트의 `hidden` 프로퍼티를 지정합니다.

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (hidden-error-msg)" region="hidden-error-msg">

</code-example>

<!--
In this example, you hide the message when the control is valid or pristine;
"pristine" means the user hasn't changed the value since it was displayed in this form.
-->
이 예제에서, 사용자가 폼 컨트롤에 접근한 적이 없거나(pristine) 폼 컨트롤 값이 유효하면 에러 메시지가 표시되지 않습니다.

<!--
This user experience is the developer's choice. Some developers want the message to display at all times.
If you ignore the `pristine` state, you would hide the message only when the value is valid.
If you arrive in this component with a new (blank) hero or an invalid hero,
you'll see the error message immediately, before you've done anything.
-->
UX는 개발자의 선택에 따라 달라질 수 있습니다. 어떤 개발자는 이 메시지를 항상 표시하고 싶을 수도 있습니다.
그리고 `pristine` 상태에서 에러 메시지가 표시되는 것을 생략하려면, 유효성 검사 결과로만 메시지를 표시하게 할 수도 있습니다.
이렇게 하면 사용자가 아직 컴포넌트에 값을 입력하기 전에 에러메시지가 미리 표시되는 것을 방지할 수 있습니다.

<!--
Some developers want the message to display only when the user makes an invalid change.
Hiding the message while the control is "pristine" achieves that goal.
You'll see the significance of this choice when you add a new hero to the form.
-->
어떤 개발자는 사용자가 입력한 값이 변경된 이후에, 이렇게 입력된 새로운 값이 유효하지 않을 때만 에러 메시지를 표시하고 싶을 수도 있습니다.
이 경우에는 "pristine" 상태에서 메시지를 숨기는 것이 좋습니다.
그리고 폼에 새로운 히어로를 등록하려고 할 때 유효성을 검사하고, 유효성 검사가 실패했을 때 에러 메시지를 표시하는 방법을 선택할 수 있습니다.

<!--
The hero *Alter Ego* is optional so you can leave that be.
-->
이런 메시지를 *별명*에도 적용할 지는 역시 개발자에게 달려있습니다.

<!--
Hero *Power* selection is required.
You can add the same kind of error handling to the `<select>` if you want,
but it's not imperative because the selection box already constrains the
power to valid values.
-->
히어로는 *특수 능력*도 반드시 선택해야 합니다.
이 필드도 `<select>`에서 발생하는 에러를 활용해서 같은 방법으로 에러 메시지를 표시할 수 있지만, 특수 능력은 이미 유효한 값들을 셀렉트 박스로 제공하고 있으니 에러 메시지가 꼭 필요하지 않을 수도 있습니다.

<!--
Now you'll add a new hero in this form.
Place a *New Hero* button at the bottom of the form and bind its click event to a `newHero` component method.
-->
이제 폼에 입력된 내용을 초기화하는 기능을 구현해 봅시다.
폼 가장 아래에 *New Hero* 버튼을 만들고 이 버튼의 클릭 이벤트를 컴포넌트 메소드 `newHero`에 연결합니다.

<code-example path="forms/src/app/hero-form/hero-form.component.html" region="new-hero-button-no-reset" title="src/app/hero-form/hero-form.component.html (New Hero button)">

</code-example>

<code-example path="forms/src/app/hero-form/hero-form.component.ts" region="new-hero" title="src/app/hero-form/hero-form.component.ts (New Hero method)" linenums="false">

</code-example>

<!--
Run the application again, click the *New Hero* button, and the form clears.
The *required* bars to the left of the input box are red, indicating invalid `name` and `power` properties.
That's understandable as these are required fields.
The error messages are hidden because the form is pristine; you haven't changed anything yet.
-->
이제 이 앱을 다시 실행하고 *New Hero* 버튼을 누르면 폼의 내용이 모두 지워집니다.
하지만 `name`과 `power`에 해당하는 입력 필드 왼쪽에는 *필수* 항목인 것을 나타내는 빨간 막대가 여전히 남아 있습니다.
이 항목들은 필수 입력 항목이기 때문에 이렇게 표시되는 것이라고 이해할 수 있습니다.
그런데 사용자가 아직 폼에 접근하지 않은 상태(pristine)이기 때문에 에러 메시지는 표시되지 않습니다.

<!--
Enter a name and click *New Hero* again.
The app displays a _Name is required_ error message.
You don't want error messages when you create a new (empty) hero.
Why are you getting one now?
-->
히어로의 이름을 입력하고 *New Hero* 버튼을 다시 클릭해 봅시다.
그러면 _Name is required_ 에러 메시지가 표시됩니다.
히어로가 새로 추가되는 시점에서는 에러메시지가 표시되지 않는 것이 좋을 것 같습니다.
그런데 왜 이런 상황이 되는 걸까요?

<!--
Inspecting the element in the browser tools reveals that the *name* input box is _no longer pristine_.
The form remembers that you entered a name before clicking *New Hero*.
Replacing the hero object *did not restore the pristine state* of the form controls.
-->
브라우저의 개발자 도구로 엘리먼트를 확인해보면 *이름*에 해당하는 입력 필드는 _더이상 pristine 상태가 아닙니다_.
왜냐하면 폼에는 *New Hero* 버튼을 누르기 전에 입력한 값이 아직 남아있기 때문입니다.
홈 컨트롤에 연결된 히어로 객체의 인스턴스를 교체하는 것으로는 *pristine 상태가 초기화되지 않습니다*.

<!--
You have to clear all of the flags imperatively, which you can do
by calling the form's `reset()` method after calling the `newHero()` method.
-->
그래서 `newHero()` 메소드를 실행한 후에는 폼 컨트롤의 상태를 초기화하는 동작을 수행해야 합니다.
이 동작은 폼에서 제공하는 `reset()` 메소드를 활용할 수 있으며, *New Hero* 버튼에서 `newHero()` 메소드를 실행한 이후에 이 메소드를 실행하도록 다음과 같이 수정합니다.

<code-example path="forms/src/app/hero-form/hero-form.component.html" region="new-hero-button-form-reset" title="src/app/hero-form/hero-form.component.html (Reset the form)">

</code-example>

<!--
Now clicking "New Hero" resets both the form and its control flags.
-->
이제 "New Hereo" 버튼을 클릭하면 폼의 내용과 상태가 모두 초기화됩니다.

## Submit the form with _ngSubmit_

The user should be able to submit this form after filling it in.
The *Submit* button at the bottom of the form
does nothing on its own, but it will
trigger a form submit because of its type (`type="submit"`).

A "form submit" is useless at the moment.
To make it useful, bind the form's `ngSubmit` event property
to the hero form component's `onSubmit()` method:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (ngSubmit)" region="ngSubmit">

</code-example>

You'd already defined a template reference variable,
`#heroForm`, and initialized it with the value "ngForm".
Now, use that variable to access the form with the Submit button.


You'll bind the form's overall validity via
the `heroForm` variable to the button's `disabled` property
using an event binding. Here's the code:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (submit-button)" region="submit-button">

</code-example>

If you run the application now, you find that the button is enabled&mdash;although
it doesn't do anything useful yet.

Now if you delete the Name, you violate the "required" rule, which
is duly noted in the error message.
The *Submit* button is also disabled.

Not impressed?  Think about it for a moment. What would you have to do to
wire the button's enable/disabled state to the form's validity without Angular's help?

For you, it was as simple as this:

1. Define a template reference variable on the (enhanced) form element.
2. Refer to that variable in a button many lines away.

## Toggle two form regions (extra credit)

Submitting the form isn't terribly dramatic at the moment.

<div class="l-sub-section">

  An unsurprising observation for a demo. To be honest,
  jazzing it up won't teach you anything new about forms.
  But this is an opportunity to exercise some of your newly won
  binding skills.
  If you aren't interested, skip to this page's conclusion.

</div>

For a more strikingly visual effect,
hide the data entry area and display something else.

Wrap the form in a `<div>` and bind
its `hidden` property to the `HeroFormComponent.submitted` property.

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="edit-div">

</code-example>

The main form is visible from the start because the
`submitted` property is false until you submit the form,
as this fragment from the `HeroFormComponent` shows:

<code-example path="forms/src/app/hero-form/hero-form.component.ts" linenums="false" title="src/app/hero-form/hero-form.component.ts (submitted)" region="submitted">

</code-example>

When you click the *Submit* button, the `submitted` flag becomes true and the form disappears
as planned.

Now the app needs to show something else while the form is in the submitted state.
Add the following HTML below the `<div>` wrapper you just wrote:

<code-example path="forms/src/app/hero-form/hero-form.component.html" linenums="false" title="src/app/hero-form/hero-form.component.html (excerpt)" region="submitted">

</code-example>

There's the hero again, displayed read-only with interpolation bindings.
This `<div>` appears only while the component is in the submitted state.

The HTML includes an *Edit* button whose click event is bound to an expression
that clears the `submitted` flag.

When you click the *Edit* button, this block disappears and the editable form reappears.

## Summary

The Angular form discussed in this page takes advantage of the following
framework features to provide support for data modification, validation, and more:

* An Angular HTML form template.
* A form component class with a `@Component` decorator.
* Handling form submission by binding to the `NgForm.ngSubmit` event property.
* Template-reference variables such as `#heroForm` and `#name`.
* `[(ngModel)]` syntax for two-way data binding.
* The use of `name` attributes for validation and form-element change tracking.
* The reference variable’s `valid` property on input controls to check if a control is valid and show/hide error messages.
* Controlling the *Submit* button's enabled state by binding to `NgForm` validity.
* Custom CSS classes that provide visual feedback to users about invalid controls.

Here’s the code for the final version of the application:

<code-tabs>

  <code-pane title="hero-form/hero-form.component.ts" path="forms/src/app/hero-form/hero-form.component.ts" region="final">

  </code-pane>

  <code-pane title="hero-form/hero-form.component.html" path="forms/src/app/hero-form/hero-form.component.html" region="final">

  </code-pane>

  <code-pane title="hero.ts" path="forms/src/app/hero.ts">

  </code-pane>

  <code-pane title="app.module.ts" path="forms/src/app/app.module.ts">

  </code-pane>

  <code-pane title="app.component.html" path="forms/src/app/app.component.html">

  </code-pane>

  <code-pane title="app.component.ts" path="forms/src/app/app.component.ts">

  </code-pane>

  <code-pane title="main.ts" path="forms/src/main.ts">

  </code-pane>

  <code-pane title="forms.css" path="forms/src/assets/forms.css">

  </code-pane>

</code-tabs>

