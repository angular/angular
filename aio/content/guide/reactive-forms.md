<!--
# Reactive Forms
-->
# 반응형 폼(Reactive Forms)

<!--
_Reactive forms_ is an Angular technique for creating forms in a _reactive_ style.
This guide explains reactive forms as you follow the steps to build a "Hero Detail Editor" form.
-->
반응형 폼은 말 그대로 폼을 _반응형 스타일로_ 구현하는 Angular 테크닉입니다.
이 문서는 반응형 폼을 구현하는 방법을 단계적으로 살펴보면서 "히어로 정보 에디터" 폼을 구현해 봅니다.

{@a toc}

<!--
Try the <live-example stackblitz="final" title="Reactive Forms (final) in Stackblitz">Reactive Forms live-example</live-example>.

You can also run the <live-example title="Reactive Forms Demo in Stackblitz">Reactive Forms Demo</live-example> version
and choose one of the intermediate steps from the "demo picker" at the top.
-->
이 문서에서 만드는 예제의 최종 코드는 <live-example stackblitz="final" title="Reactive Forms (final) in Stackblitz">Reactive Forms live-example</live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

그리고 각 단계별 코드는 <live-example title="Reactive Forms Demo in Stackblitz">Reactive Forms Demo</live-example>에서 확인할 수 있습니다.
예제 상단의 "demo picker"를 활용하세요.

{@a intro}

<!--
## Introduction to Reactive Forms
-->
## 반응형 폼 소개

<!--
Angular offers two form-building technologies: _reactive_ forms and _template-driven_ forms.
The two technologies belong to the `@angular/forms` library
and share a common set of form control classes.

But they diverge markedly in philosophy, programming style, and technique.
They even have their own modules: the `ReactiveFormsModule` and the `FormsModule`.
-->
Angular에서 폼을 만들 수 있는 방법은 _반응형_ 과 _템플릿 기반_ 두 가지입니다.
두 방식은 모두 `@angular/forms` 라이브러리에 포함되어 있으며, 양쪽에서 공통으로 사용하는 폼 컨트롤 클래스도 있습니다.

하지만 두 방식은 구현 철학, 프로그래밍 스타일, 문법면에서 확연히 다릅니다.
그래서 각 방식은 `ReactiveFormsModule`과 `FormsModule`로 나뉘어져 있습니다.

<!--
### Reactive forms
-->
### 반응형 폼

<!--
Angular _reactive_ forms facilitate a _reactive style_ of programming
that favors explicit management of the data flowing between
a non-UI _data model_ (typically retrieved from a server) and a
UI-oriented _form model_ that retains the states
and values of the HTML controls on screen. Reactive forms offer the ease
of using reactive patterns, testing, and validation.
-->
_반응형_ 폼은 UI 요소인 _폼 모델_ 과 HTML 컨트롤을 건드리지 않는 동시에, UI 요소가 아닌 _데이터 모델_ 가 변화하는 것에만 _반응하는 스타일_ 로 구현합니다.
그래서 반응형 폼은 반응형 프로그래밍, 테스트, 유효성 검사에 좀 더 적합합니다.

<!--
With _reactive_ forms, you create a tree of Angular form control objects
in the component class and bind them to native form control elements in the
component template, using techniques described in this guide.
-->
_반응형_ 폼은 컴포넌트 클래스에 Angular 폼 컨트롤을 트리 형태로 구성하고, 각각의 폼 컨트롤 엘리먼트를 컴포넌트 템플릿 템플릿에 바인딩하는 방식으로 구현합니다.

<!--
You create and manipulate form control objects directly in the
component class. As the component class has immediate access to both the data
model and the form control structure, you can push data model values into
the form controls and pull user-changed values back out. The component can
observe changes in form control state and react to those changes.
-->
그러면 컴포넌트 클래스에서 각각의 폼 컨트롤 객체를 자유롭게 생성하고 조작할 수 있습니다.
컴포넌트 클래스에서 데이터 모델과 폼 컨트롤 인스턴스에 자유롭게 접근할 수 있으며, 사용자의 동작에 따라 폼 컨트롤을 추가로 생성하거나 제거할 수도 있습니다.
그리고 폼 컨트롤의 값이 변하는 것도 컴포넌트 클래스에서 추적하고 반응할 수 있습니다.

<!--
One advantage of working with form control objects directly is that value and validity updates
are [always synchronous and under your control](guide/reactive-forms#async-vs-sync "Async vs sync").
You won't encounter the timing issues that sometimes plague a template-driven form
and reactive forms can be easier to unit test.
-->
폼 컨트롤 객체에 직접 접근할 수 있다는 것은, 폼 컨트롤의 값을 확인하고 유효성을 검증하는 로직이 [모두 동기 방식으로 동작하고 이 과정을 직접 조작할 수 있다는](guide/reactive-forms#async-vs-sync "Async vs sync") 점에서 유리합니다.
템플릿 기반 폼에서 종종 발생하는 타이밍 이슈를 피할 수 있으며, 유닛 테스트도 더 간단해 집니다.

<!--
In keeping with the reactive paradigm, the component
preserves the immutability of the _data model_,
treating it as a pure source of original values.
Rather than update the data model directly,
the component extracts user changes and forwards them to an external component or service,
which does something with them (such as saving them)
and returns a new _data model_ to the component that reflects the updated model state.
-->
반응형 폼의 개념으로 보면, 컴포넌트에 정의된 _데이터 모델_ 은 순수하게 데이터의 소스일 뿐이며 불변성(immutability)을 보장한다고도 할 수 있습니다.
반응형 폼은 데이터 모델을 직접 수정하지 않으며, 사용자의 동작 중 필요한 것에만 반응해서 다른 컴포넌트나 서비스로 전달할 수 있고, 수정되어 돌아온 새 _데이터 모델_ 을 사용해서 컴포넌트의 모델을 갱신할 수도 있습니다.

<!--
Using reactive form directives does not require you to follow all reactive priniciples,
but it does facilitate the reactive programming approach should you choose to use it.
-->
반응형 폼을 사용하면서 꼭 이 개념들을 지켜야 한다는 것은 아니지만, 반응형 폼에서 사용하는 디렉티브들이 반응형 프로그래밍의 철학을 바탕으로 만들어졌기 때문에 기본 개념을 알아야 적절하게 활용할 수 있을 것입니다.

<!--
### Template-driven forms
-->
### 템플릿 기반 폼 (Template-driven forms)

<!--
_Template-driven_ forms, introduced in the [Template guide](guide/forms), take a completely different approach.
-->
[폼](guide/forms) 문서에서 설명하는 _템플릿 기반_ 폼은 접근방식이 완전히 다릅니다.

<!--
You place HTML form controls (such as `<input>` and `<select>`) in the component template and
bind them to _data model_ properties in the component, using directives
like `ngModel`.
-->
폼 컨트롤은 HTML 문서에 `<input>`이나 `<select>`와 같이 정의하고, `ngModel` 디렉티브를 사용해서 이 엘리먼트를 컴포넌트의 _데이터 모델_ 에 바인딩하는 방식으로 구현합니다.

<!--
You don't create Angular form control objects. Angular directives
create them for you, using the information in your data bindings.
You don't push and pull data values. Angular handles that for you with `ngModel`.
Angular updates the mutable _data model_ with user changes as they happen.
-->
이 과정에서 Angular 폼 컨트롤의 인스턴스는 개발자가 직접 생성하지 않습니다.
폼 컨트롤의 인스턴스는 Angular 디렉티브가 생성하며, 폼과 연결된 데이터도 디렉티브가 처리합니다.
개발자는 폼 모델에 직접 접근할 필요가 없으며, Angular의 `ngModel` 디렉티브가 이 과정을 처리합니다.
사용자가 폼 컨트롤을 조작하면 _데이터 모델_ 이 바로 갱신되기 때문에, 이 모델은 가변적(mutable)이라고 할 수 있습니다.

<!--
For this reason, the `ngModel` directive is not part of the ReactiveFormsModule.
-->
이런 이유로 `ngModel` 디렉티브는 ReactiveFormsModule에 포함되지 않습니다.

<!--
While this means less code in the component class,
[template-driven forms are asynchronous](guide/reactive-forms#async-vs-sync "Async vs sync")
which may complicate development in more advanced scenarios.
-->
[비동기 방식인 템플릿 기반의 폼](guide/reactive-forms#async-vs-sync "Async vs sync")은 반응형 폼과 비교했을 때 컴포넌트 클래스의 코드가 좀 더 간결하지만, 복잡한 시나리오를 구현하기에는 더 어렵습니다.


{@a async-vs-sync}

<!--
### Async vs. sync
-->
### 비동기 vs. 동기

<!--
Reactive forms are synchronous while template-driven forms are asynchronous.
-->
템플릿 기반 폼은 비동기지만 반응형 폼은 동기 방식으로 동작합니다.

<!--
In reactive forms, you create the entire form control tree in code.
You can immediately update a value or drill down through the descendants of the parent form
because all controls are always available.
-->
반응형 폼에서는 폼 컨트롤 트리 전체를 코드에서 생성합니다.
따라서 트리의 계층에 관계없이 모든 폼 컨트롤의 값을 즉시 수정할 수 있습니다.

<!--
Template-driven forms delegate creation of their form controls to directives.
To avoid "_changed after checked_" errors,
these directives take more than one cycle to build the entire control tree.
That means you must wait a tick before manipulating any of the controls
from within the component class.
-->
하지반 템플릿 기반 폼은 템플릿에 디렉티브를 사용해서 폼 컨트롤을 생성합니다.
이 디렉티브들은 "_값이 체크된 직후에 다시 변경되는_" 상황을 피하기 위해 최소한 한 실행 싸이클을 기다리며, 이 지연 과정은 폼 컨트롤 트리에 있는 모든 객체에 해당됩니다.
이 말은 컴포넌트 클래스에서 폼 컨트롤의 값을 조작할 때에도 최소한 한 실행 싸이클을 기다려야 한다는 뜻입니다.

<!--
For example, if you inject the form control with a `@ViewChild(NgForm)` query and examine it in the
[`ngAfterViewInit` lifecycle hook](guide/lifecycle-hooks#afterview "Lifecycle hooks guide: AfterView"),
you'll discover that it has no children.
You must wait a tick, using `setTimeout`, before you can
extract a value from a control, test its validity, or set it to a new value.
-->
예를 들어 `@ViewChild(NgForm)`로 폼 컨트롤을 참조하고 [`ngAfterViewInit` 라이프싸이클 후킹 함수](guide/lifecycle-hooks#afterview "Lifecycle hooks guide: AfterView")에서 이 객체를 확인해보면 아무 내용이 없는 것을 확인할 수 있습니다.
설명한 것과 마찬가지로 이 경우에도 `setTimeout`을 사용해서 다음 실행 싸이클로 넘겨야 하며, 그 이후에야 폼 컨트롤의 값을 참조하거나 유효성을 검사하고 새로운 값을 설정할 수 있습니다.

<!--
The asynchrony of template-driven forms also complicates unit testing.
You must wrap your test block in `async()` or `fakeAsync()` to
avoid looking for values in the form that aren't there yet.
With reactive forms, everything is available when you expect it to be.
-->
이런 특성 때문에 템플릿 기반 폼에 유닛 테스트를 적용하는 것도 복잡합니다.
폼 컨트롤에 접근하는 모든 테스트 코드는 `async()`나 `fakeAsync()`를 사용해서 이 문제를 회피해야 합니다.
하지만 반응형 폼은 이 문제에서 완전히 자유롭습니다.

<!--
### Choosing reactive or template-driven forms
-->
### 어떤 방식을 선택할 것인가

<!--
Reactive and template-driven forms are
two different architectural paradigms,
with their own strengths and weaknesses.
Choose the approach that works best for you.
You may decide to use both in the same application.
-->
반응형 폼과 템플릿 기반 폼은 서로 다른 패러다임으로 만들어졌기 때문에 각각 장단점이 있습니다.
따라서 상황에 적합한 방식을 선택하는 것이 좋습니다.
한 애플리케이션에 두 가지 방식을 동시에 사용하는 것도 고려해볼만 합니다.

<!--
The rest of this page explores the _reactive_ paradigm and
concentrates exclusively on reactive forms techniques.
For information on _template-driven forms_, see the [_Forms_](guide/forms) guide.
-->
이 문서에서는 _반응형_ 패러다임에만 집중해서 반응형 폼을 다루는 방법만 다룹니다.
_템플릿 기반 폼_ 에 대한 내용은 [_Forms_](guide/forms) 문서를 참고하세요.

<!--
In the next section, you'll set up your project for the reactive form demo.
Then you'll learn about the [Angular form classes](guide/reactive-forms#essentials) and how to use them in a reactive form.
-->
다음 섹션부터는 반응형 폼을 활용하는 예제 프로젝트를 만들어 봅니다.
그리고 [Angular 폼 클래스](guide/reactive-forms#essentials)에 대해 설명하며, 이 클래스들을 반응형 폼에 어떻게 활용할 수 있을지 차근차근 알아봅니다.


{@a setup}


<!--
## Setup
-->
## 환경 설정

<!--
Create a new project named <code>angular-reactive-forms</code>:
-->
다음 명령을 실행해서 <code>angular-reactive-forms</code> 라는 이름으로 프로젝트를 생성합니다:

<code-example language="sh" class="code-shell">

  ng new angular-reactive-forms

</code-example>

{@a data-model}


<!--
## Create a data model
-->
## 데이터 모델 정의하기

<!--
The focus of this guide is a reactive forms component that edits a hero.
You'll need a `hero` class and some hero data.

Using the CLI, generate a new class named `data-model`:
-->
이 문서에서는 히어로의 정보를 수정하는 컴포넌트를 반응형 폼으로 만들어 봅니다.
히어로의 정보를 표현하는 `Hero` 클래스를 만들어 봅시다.

Angular CLI로 다음 명령을 실행합니다:

<code-example language="sh" class="code-shell">

  ng generate class data-model

</code-example>

<!--
And copy the following into `data-model.ts`:
-->
그리고 다음 내용을 복사해서 `data-model.ts` 파일에 붙여 넣습니다:

<code-example path="reactive-forms/src/app/data-model.ts" title="src/app/data-model.ts" linenums="false">

</code-example>

<!--
The file exports two classes and two constants. The `Address`
and `Hero` classes define the application _data model_.
The `heroes` and `states` constants supply the test data.
-->
이 파일에는 클래스가 2개, 배열이 2개 정의되어 있습니다.
`Address` 클래스와 `Hero` 클래스는 애플리케이션에서 사용할 _데이터 모델_ 이며, `heroes` 배열과 `states` 배열은 테스트 데이터로 사용합니다.

{@a create-component}


<!--
## Create a _reactive forms_ component
-->
## _반응형 폼_ 컴포넌트 생성하기

<!--
Generate a new component named `HeroDetail`:
-->
`HeroDetail`이라는 이름으로 컴포넌트를 생성합니다:

<code-example language="sh" class="code-shell">

  ng generate component HeroDetail

</code-example>

<!--
And import:
-->
그리고 다음 코드를 추가합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-1.component.ts" region="import" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
Next, update the `HeroDetailComponent` class with a `FormControl`.
`FormControl` is a directive that allows you to create and manage
a `FormControl` instance directly.
-->
이제 `HeroDetailComponent` 클래스에서 `FormControl`을 사용할 수 있습니다.
`FormControl`은 폼 컨트롤을 생성하고 접근할 때 사용하는 객체입니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-1.component.ts" region="v1" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
This creates a `FormControl` called `name`.
It will be bound in the template to an HTML `<input>` element for the hero name.

A `FormControl` constructor accepts three, optional arguments:
the initial data value, an array of validators, and an array of async validators.
-->
이 코드에서는 `FormControl`로 `name` 프로퍼티를 만들었습니다.
이 객체는 템플릿의 HTML `<input>` 엘리먼트에 바인딩 되어 히어로의 이름을 입력할 때 사용될 것입니다.

`FormControl` 생성자는 옵션 인자를 3개 받습니다.
인자는 순서대로 초기값, 유효성 검사기 배열, 비동기 유효성 검사기 배열입니다.

<div class="l-sub-section">

<!--
This simple control doesn't have data or validators.
In real apps, most form controls have both. For in-depth information on
`Validators`, see the [Form Validation](guide/form-validation) guide.
-->
코드를 간단하게 작성하기 위해 초기값이나 유효성 검사기는 지정하지 않았습니다.
하지만 실제 활용되는 앱에는 두 내용 모두 적용되는 것이 좋습니다.
`Validators` 클래스에 대해서는 [폼 유효성 검사](guide/form-validation) 문서를 참고하세요.

</div>

{@a create-template}

<!--
## Create the template
-->
## 템플릿 작성하기

<!--
Now update the component's template with the following markup.
-->
이제 컴포넌트의 템플릿을 다음과 같이 작성합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-1.component.html" region="simple-control" title="src/app/hero-detail/hero-detail.component.html" linenums="false">

</code-example>

<!--
To let Angular know that this is the input that you want to
associate to the `name` `FormControl` in the class,
you need `[formControl]="name"` in the template on the `<input>`.
-->
입력 필드가 있다는 것을 Angular에 알리기 위해 `<input>` 태그에 `[formControl]="name"`을 지정했습니다. 이 구문에서 `name`이 지정된 폼 컨트롤은 컴포넌트 클래스에 있는 `FormControl` 프로퍼티와 연결됩니다.

<div class="l-sub-section">

<!--
Disregard the `form-control` CSS class. It belongs to the
<a href="http://getbootstrap.com/" title="Bootstrap CSS">Bootstrap CSS library</a>,
not Angular, and styles the form but in no way impacts the logic.
-->
`<input>` 엘리먼트에 적용된 `form-control` CSS 클래스는 무시하세요.
이 클래스는 Angular가 아니라 <a href="http://getbootstrap.com/" title="Bootstrap CSS">Bootstrap CSS library</a>에서 제공하는 클래스이며, 스타일을 꾸밀 뿐 컴포넌트 동작과는 관련이 없습니다.

</div>

{@a import}

<!--
## Import the `ReactiveFormsModule`
-->
## `ReactiveFormsModule` 로드하기

<!--
The `HeroDetailComponent` template uses the `formControlName`
directive from the `ReactiveFormsModule`.

Do the following two things in `app.module.ts`:

1. Use a JavaScript `import` statement to access
the `ReactiveFormsModule`.
1. Add `ReactiveFormsModule` to the `AppModule`'s `imports` list.
-->
`HeroDetailComponent`의 템플릿에는 `formControlName` 디렉티브가 사용되었으며, 이 디렉티브는 `ReactiveFormsModule`에 정의되어 있습니다.

`app.module.ts` 파일에서 다음 내용을 수정합니다.

1. JavaScript `import` 키워드로 `ReactiveFormsModule`을 로드합니다.
1. `AppModule`의 `imports` 배열에 `ReactiveFormsModule`을 추가합니다.

<code-example path="reactive-forms/src/app/app.module.ts" region="v1" title="src/app/app.module.ts (excerpt)" linenums="false">

</code-example>

{@a update}

<!--
## Display the `HeroDetailComponent`
-->
## `HeroDetailComponent` 표시하기

<!--
Revise the `AppComponent` template so it displays the `HeroDetailComponent`.
-->
`AppComponent` 템플릿에서 `HeroDetailComponent`를 표시하도록 템플릿을 다음과 같이 수정합니다:

<code-example path="reactive-forms/src/app/app.component.1.html" title="src/app/app.component.html" linenums="false">

</code-example>

{@a essentials}

<!--
## Essential form classes
-->
## 폼 클래스

<!--
This guide uses four fundamental classes to build a reactive form:
-->
이 예제에서는 반응형 폼을 만들 때 다음 4가지 클래스를 활용합니다:

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
      [`AbstractControl`](api/forms/AbstractControl "API Reference: FormControl") is the abstract base class for the three concrete form control classes;
`FormControl`, `FormGroup`, and `FormArray`.
It provides their common behaviors and properties.
      -->
      [`AbstractControl`](api/forms/AbstractControl "API Reference: FormControl")은 다른 3가지 클래스(`FormControl`, `FormGroup`, `FormArray`)의 형태를 정의하는 추상 클래스입니다.
      클래스 구현체의 기본 동작과 공통 프로퍼티가 선언되어 있습니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormControl</code>
    </td>

    <td>

      <!--
      [`FormControl`](api/forms/FormControl "API Reference: FormControl")
tracks the value and validity status of an individual form control.
It corresponds to an HTML form control such as an `<input>` or `<select>`.
      -->
      [`FormControl`](api/forms/FormControl "API Reference: FormControl")
      은 개별 폼 컨트롤을 표현하는 클래스입니다. 폼 입력값과 유효성 검사 결과를 인스턴스에 저장하며,  `<input>` 엘리먼트나 `<select>`와 같은 HTML 폼 컨트롤과 연결됩니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormGroup</code>
    </td>

    <td>

      <!--
      [`FormGroup`](api/forms/FormGroup "API Reference: FormGroup")
tracks the value and validity state of a group of `AbstractControl` instances.
The group's properties include its child controls.
The top-level form in your component is a `FormGroup`.
      -->
      [`FormGroup`](api/forms/FormGroup "API Reference: FormGroup")
      은 `AbstractControl` 인스턴스를 그룹으로 활용할 때 사용하는 클래스입니다. 그룹 전체 값과 전체 유효성 결과를 인스턴스에 저장합니다.
      그룹의 프로퍼티는 각각의 자식 폼 컨트롤이며, 컴포넌트의 폼 객체가 최상위 그룹입니다.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>FormArray</code>
    </td>

    <td>

      <!--
      [`FormArray`](api/forms/FormArray "API Reference: FormArray")
tracks the value and validity state of a numerically indexed array of `AbstractControl` instances.
      -->
      [`FormArray`](api/forms/FormArray "API Reference: FormArray")
      은 `AbstractControl` 인스턴스를 배열로 다루는 클래스입니다. 배열의 전체 값과 전체 유효성 검사 결과를 인스턴스에 저장합니다.

    </td>

  </tr>

</table>


<!--
## Style the app
-->
## 스타일 지정하기

<!--
To use the bootstrap CSS classes that are in the template HTML of both the `AppComponent` and the `HeroDetailComponent`,
add the `bootstrap` CSS stylesheet to the head of `styles.css`:
-->
`AppComponent`와 `HeroDetailComponent`에는 템플릿 HTML에 스타일을 지정하기 위해 Bootstrap CSS 클래스를 사용합니다.
`styles.css` 파일에 이 스타일 파일을 로드합니다:

<code-example path="reactive-forms/src/styles.1.css" title="styles.css" linenums="false">

</code-example>

<!--
Now that everything is wired up, serve the app with:
-->
여기까지 작성하고 나서 앱을 실행해 봅시다:

<code-example language="sh" class="code-shell">

  ng serve

</code-example>

<!--
The browser should display something like this:
-->
그러면 브라우저에서 다음과 같은 화면을 확인할 수 있습니다:

<figure>
  <img src="generated/images/guide/reactive-forms/just-formcontrol.png" alt="Single FormControl">
</figure>

{@a formgroup}

<!--
## Add a FormGroup
-->
## FormGroup 추가하기

<!--
Usually, if you have multiple `FormControls`, you register
them within a parent `FormGroup`.
To add a `FormGroup`, add it to the imports section
of `hero-detail.component.ts`:
-->
보통 `FormControl`은 여러개를 묶어서 함께 사용합니다.
폼 컨트롤을 그룹으로 관리하기 위해 `FormGroup`을 추가해 봅시다.
`hero-detail.component.ts` 파일에 다음 코드를 추가합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-2.component.ts" region="imports" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
In the class, wrap the `FormControl` in a `FormGroup` called `heroForm` as follows:
-->
그리고 컴포넌트 클래스에 있던 `FormControl`을 `FormGroup`으로 감싸고 `heroForm` 프로퍼티로 할당합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-2.component.ts" region="v2" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
Now that you've made changes in the class, they need to be reflected in the
template. Update `hero-detail.component.html` by replacing it with the following.
-->
이제 클래스 코드는 다 끝났습니다.
템플릿 파일인 `hero-detail.component.html`의 내용을 다음과 같이 작성합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-2.component.html" region="basic-form" title="src/app/hero-detail/hero-detail.component.html" linenums="false">

</code-example>

<!--
Notice that now the single `<input>` is in a `<form>` element.

`formGroup` is a reactive form directive that takes an existing
`FormGroup` instance and associates it with an HTML element.
In this case, it associates the `FormGroup` you saved as
`heroForm` with the `<form>` element.
-->
`<form>` 엘리먼트에 `<input>`이 추가된 것을 확인해 봅시다.
`formGroup`은 컴포넌트 클래스에 있는 `FormGroup` 인스턴스를 HTML 엘리먼트에 연결하는 반응형 폼 디렉티브입니다.
이 코드로 보면, 클래스 코드에 선언된 `FormGroup` 타입의 `heroForm`가 `<form>` 엘리먼트와 연결되었습니다.

<!--
Because the class now has a `FormGroup`, you must update the template
syntax for associating the `<input>` with the corresponding
`FormControl` in the component class.
Without a parent `FormGroup`,
`[formControl]="name"` worked earlier because that directive
can stand alone, that is, it works without being in a `FormGroup`.
With a parent `FormGroup`, the `name` `<input>` needs the syntax
`formControlName=name` in order to be associated
with the correct `FormControl`
in the class. This syntax tells Angular to look for the parent
`FormGroup`, in this case `heroForm`, and then _inside_ that group
to look for a `FormControl` called `name`.
-->
`<input>`에 연결된 폼 컨트롤은 이제 `FormGroup` 안으로 옮겼기 때문에 템플릿에서 이 내용을 수정해야 합니다.
`FormControl` 디렉티브는 이 디렉티브 하나만으로도 동작하기 때문에 이전 코드에서는 `[formControl]="name"`라고 사용했지만, 이제는 `FormGroup` 인스턴스 안에 잇는 자식 폼 컨트롤이기 때문에 `formControlName=name`이라고 지정해야 폼 컨트롤을 연결할 수 있습니다.
이제 이 템플릿은 `FormGroup` 타입인 `heroForm`을 연결하고, 이 그룹 _안에서_ `name`이라고 지정된 `FormControl`을 찾아서 `<input>` 엘리먼트에 연결합니다.

{@a json}

<!--
## Taking a look at the form model
-->
## 폼 모델 참조하기

<!--
When the user enters data into an `<input>`, the value
goes into the **_form model_**.
To see the form model, add the following line after the
closing `<form>` tag in the `hero-detail.component.html`:
-->
사용자가 `<input>` 엘리먼트에 데이터를 입력하면, 이 데이터는 **_폼 모델_**에 반영됩니다.
이 폼 모델에 저장된 값을 템플릿에서 확인하기 위해 `hero-detail.component.html` 파일의 `<form>` 엘리먼트 뒤에 다음 내용을 추가합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-2.component.html" region="form-value-json" title="src/app/hero-detail/hero-detail.component.html" linenums="false">

</code-example>

<!--
The `heroForm.value` returns the _form model_.
Piping it through the `JsonPipe` renders the model as JSON in the browser:
-->
`heroForm.value`는 _폼 모델_ 의 값을 저장하는 프로퍼티입니다.
그리고 이 프로퍼티에 `JsonPipe`를 적용해서 브라우저에 JSON 형식으로 표현합니다:

<figure>
  <img src="generated/images/guide/reactive-forms/json-output.png" alt="JSON output">
</figure>

<!--
The initial `name` property value is the empty string.
Type into the name `<input>` and watch the keystrokes appear in the JSON.

In real life apps, forms get big fast.
`FormBuilder` makes form development and maintenance easier.
-->
`name` 프로퍼티의 초기값은 빈 문자열입니다.
`<input>` 엘리먼트에 히어로 이름을 입력하면서 이 내용이 어떻게 표시되는지 확인해 보세요.

실제 애플리케이션이라면 폼이 급격하게 복잡해질 수 있습니다.
이 때 개발과 유지보수를 좀 더 편하게 하려면 `FormBuilder`를 사용하는 것이 더 좋습니다.

{@a formbuilder}

<!--
## Introduction to `FormBuilder`
-->
## `FormBuilder` 소개

<!--
The `FormBuilder` class helps reduce repetition and
clutter by handling details of control creation for you.

To use `FormBuilder`, import it into `hero-detail.component.ts`. You can remove `FormControl`:
-->
`FormBuilder` 클래스를 사용하면 폼 컨트롤의 구조를 정의하면서 반복하는 귀찮은 작업을 줄일 수 있습니다.

`hero-detail.component.ts`에서 `FormBuilder`를 사용하기 위해 라이브러리에서 이 클래스를 로드합니다. `FormControl`을 로드하는 코드는 제거해도 됩니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-3a.component.ts" region="imports" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
Use it to refactor the `HeroDetailComponent` into something that's easier to read and write,
by following this plan:

* Explicitly declare the type of the `heroForm` property to be `FormGroup`; you'll initialize it later.
* Inject a `FormBuilder` into the constructor.
* Add a new method that uses the `FormBuilder` to define the `heroForm`; call it `createForm()`.
* Call `createForm()` in the constructor.

The revised `HeroDetailComponent` looks like this:
-->
이제 `FormBuilder`를 사용해서 `HeroDetailComponent`를 리팩토링 해봅시다. `FormControl`을 직접 사용할 때보다 훨씬 간단해지고 가독성도 높아질 것입니다.
다음 순서로 수정합니다:

* `heroForm` 프로퍼티를 `FormGroup` 타입으로 선언만 합니다. 초기화는 나중에 합니다.
* 생성자에 `FormBuilder`를 주입합니다.
* `heroForm`을 생성하는 `createForm()` 메소드를 정의합니다.
* 생성자에서 `createForm()` 함수를 실행합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-3a.component.ts" region="v3a" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>


<!--
`FormBuilder.group` is a factory method that creates a `FormGroup`. &nbsp;
`FormBuilder.group` takes an object whose keys and values are `FormControl` names and their definitions.
In this example, the `name` control is defined by its initial data value, an empty string.

Defining a group of controls in a single object makes your code more compact and readable because you don't have to write repeated `new FormControl(...)` statements.
-->
`FormBuilder.group`은 `FormGroup` 인스턴스를 만드는 팩토리 함수입니다.
`FormBuilder.group` 함수는 객체를 인자로 받는데, 이 때 객체의 키는 `FormControl`의 이름이며 값은 자식 폼 컨트롤 인스턴스입니다.
위 코드에서는 `name` 폼 컨트롤이 정의되었으며, 이 폼 컨트롤의 초기값은 빈 문자열로 지정되었습니다.

{@a validators}

### `Validators.required`

<!--
Though this guide doesn't go deeply into validations, here is one example that
demonstrates the simplicity of using `Validators.required` in reactive forms.

First, import the `Validators` symbol.
-->
이 문서는 유효성 검사에 대해 다루는 것이 아니기 때문에, 반응형 폼에서 유효성 검사기를 어떻게 적용할 수 있는지 `Validators.required`만 간단하게 적용해 봅니다.

먼저, `Validators` 심볼을 로드합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-3.component.ts" region="imports" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>


<!--
To make the `name` `FormControl` required, replace the `name`
property in the `FormGroup` with an array.
The first item is the initial value for `name`;
the second is the required validator, `Validators.required`.
-->
`name`에 해당하는 `FormControl`을 필수 항목으로 지정하기 위해 `name` 프로퍼티에 할당하는 값을 배열로 선언합니다.
이 때 배열의 첫 번째 항목은 `name` 폼 컨트롤의 초기값을 지정하며, 두 번째 항목은 `Validators.required` 유효성 검사기를 지정합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-3.component.ts" region="required" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



<div class="l-sub-section">

<!--
Reactive validators are simple, composable functions.
Configuring validation is different in template-driven forms in that you must wrap validators in a directive.
-->
반응형 폼에 유효성 검사기를 적용하는 것은 아주 간단합니다.
템플릿 기반 폼에 유효성 검사기를 적용하기 위해 유효성 검사 함수를 디렉티브로 감쌌던 것과 비교해 보세요.

</div>

<!--
Update the diagnostic message at the bottom of the template to display the form's validity status.
-->
그리고 폼의 유효성 검사 결과를 확인하기 위해 템플릿에 디버그 메시지를 추가합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-3.component.html" region="form-value-json" title="src/app/hero-detail/hero-detail.component.html (excerpt)" linenums="false">

</code-example>

<!--
The browser displays the following:
-->
그러면 이제 앱은 다음과 같은 모양이 됩니다:

<figure>
  <img src="generated/images/guide/reactive-forms/validators-json-output.png" alt="Single FormControl">
</figure>

<!--
`Validators.required` is working. The status is `INVALID` because the `<input>` has no value.
Type into the `<input>` to see the status change from `INVALID` to `VALID`.

In a real app, you'd replace the diagnosic message with a user-friendly experience.

Using `Validators.required` is optional for the rest of the guide.
It remains in each of the following examples with the same configuration.

For more on validating Angular forms, see the
[Form Validation](guide/form-validation) guide.
-->
앱 실행 결과를 보면 `Validators.required`가 동작하는 것을 확인할 수 있습니다. 폼 유효성 검사 결과가 `INVALID`인 것은 `<input>` 엘리먼트의 값이 비어있기 때문입니다.

실제 애플리케이션을 만들 때는 디버그 메시지 대신 사용자가 이해할 수 있는 메시지로 표시하는 것이 좋습니다.

이후 내용에서 `Validatoros.required`를 계속 사용하는 것은 이 문서의 주제와 큰 관련이 없습니다.
이 설정은 이대로 놔두고 다음 단계를 계속 진행하겠습니다.

Angular 폼의 유효성 검사에 대해서는 [폼 유효성 검사](guide/form-validation) 문서를 참고하세요.

<!--
### More `FormControl`s
-->
### `FormControl` 더 추가하기

<!--
This section adds additional `FormControl`s for the address, a super power, and a sidekick.

Additionally, the address has a state property. The user will select a state with a `<select>` and you'll populate
the `<option>` elements with states. So import `states` from `data-model.ts`.
-->
이번에는 주소, 특수 능력, 조수를 입력받는 `FormControl`을 더 추가해 봅시다.

이 때, 주소는 주(state)로 구분하며, 사용자가 `<select>` 목록으로 선택하게 할 것입니다.
이 엘리먼트에 나열될 데이터는 `data-model.ts` 파일의 `states`에서 가져옵니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-4.component.ts" region="imports" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
Declare the `states` property and add some address `FormControls` to the `heroForm` as follows.
-->
이 목록은 컴포넌트 클래스에 `state` 프로퍼티로 할당하며, `heroForm`의 구조를 다음과 같이 수정합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-4.component.ts" region="v4" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
Then add corresponding markup in `hero-detail.component.html` as follows.
-->
컴포넌트 템플릿은 다음과 같이 수정합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-4.component.html" title="src/app/hero-detail/hero-detail.component.html" linenums="false">

</code-example>

<div class="alert is-helpful">

<!--
*Note*: Ignore the many mentions of `form-group`,
`form-control`, `center-block`, and `checkbox` in this markup.
Those are _bootstrap_ CSS classes that Angular itself ignores.
Pay attention to the `[formGroup]` and `formControlName` attributes.
They are the Angular directives that bind the HTML controls to the
Angular `FormGroup` and `FormControl` properties in the component class.
-->
마크업에 지정된 `form-group`, `form-control`, `center-block`, `checkbox` 클래스들은 무시하세요.
이 클래스들은 _Bootstrap_ 라이브러리에서 제공하는 CSS 클래스이며 Angular와 관련된 것은 아닙니다.
이 템플릿에서는 `[formGroup]`과 `formControlName` 어트리뷰트에만 집중하세요.
이 어트리뷰트들은 Angular가 컴포넌트 클래스에 있는 `FormGroup`과 `FormControl`을 연결할 때 사용하는 디렉티브입니다.

</div>

<!--
The revised template includes more text `<input>` elements, a `<select>` for the `state`, radio buttons for the `power`,
and a `<checkbox>` for the `sidekick`.
-->
이렇게 수정된 템플릿에는 이제 `<input>`이 여러개, `state`를 위한 `<select>` 엘리먼트, `power`선택을 위한 라디오 버튼이 추가되었으며, `sidekick`에 해당하는 `<checkbox>`도 추가되었습니다.

<!--
You must bind the value property of the `<option>` with `[value]="state"`.
If you do not bind the value, the select shows the first option from the data model.
-->
`<option>`의 `value` 프로퍼티는 `[value]="state"`와 같이 바인딩합니다.
이 프로퍼티를 바인딩하지 않으면 데이터 모델의 값이 `<select>` 엘리먼트에 그대로 표시됩니다.

<!--
The component _class_ defines control properties without regard for their representation in the template.
You define the `state`, `power`, and `sidekick` controls the same way you defined the `name` control.
You tie these controls to the template HTML elements in the same way,
specifying the `FormControl` name with the `formControlName` directive.
-->
반응형 폼을 사용할 때는 템플릿을 신경쓰지 않으면서 컴포넌트 _클래스_ 에 폼 컨트롤 프로퍼티들을 선언합니다.
따라서 `state`, `power`, `sidekick`에 해당하는 폼 컨트롤들도 `name`과 같은 방식으로 선언합니다.
이렇게 만든 폼 컨트롤도 같은 방식으로 템플릿에 있는 HTML 엘리먼트에 연결하며, `formControlName` 디렉티브로 각 `FormControl`을 구분합니다.

<!--
See the API reference for more information about
[radio buttons](api/forms/RadioControlValueAccessor "API: RadioControlValueAccessor"),
[selects](api/forms/SelectControlValueAccessor "API: SelectControlValueAccessor"), and
[checkboxes](api/forms/CheckboxControlValueAccessor "API: CheckboxControlValueAccessor").
-->
[라디오 버튼](api/forms/RadioControlValueAccessor "API: RadioControlValueAccessor"), [셀렉트 박스](api/forms/SelectControlValueAccessor "API: SelectControlValueAccessor"), [체크박스](api/forms/CheckboxControlValueAccessor "API: CheckboxControlValueAccessor")에 대한 내용은 각각의 API 문서를 참고하세요.


{@a grouping}

<!--
### Nested FormGroups
-->
### 중첩 FormGroup (Nested FormGroups)

<!--
To manage the size of the form more effectively, you can group some of the related `FormControls`
into a nested `FormGroup`. For example, the `street`, `city`, `state`, and `zip` are ideal properties for an address `FormGroup`.
Nesting groups and controls in this way allows you to
mirror the hierarchical structure of the data model
and helps track validation and state for related sets of controls.
-->
폼을 더 효율적으로 관리하려면 서로 연관된 `FormControl`을 묶어서 중첩 `FormGroup`으로 활용하는 것이 더 좋습니다.
예를 들어 주소가 `street`, `city`, `state`, `zip`으로 구성된다면 이 폼 컨트롤들을 `FormGroup` 하나로 묶는 것이 좋습니다.
폼 그룹을 계층으로 구성하면 데이터 모델도 계층으로 구성되며, 연관된 폼 컨트롤에서 발생하는 에러와 폼 컨트롤의 상태도 한 번에 처리할 수 있습니다.

<!--
You used the `FormBuilder` to create one `FormGroup` in this component called `heroForm`.
Let that be the parent `FormGroup`.
Use `FormBuilder` again to create a child `FormGroup` that encapsulates the `address` controls;
assign the result to a new `address` property of the parent `FormGroup`.
-->
`FormBuilder`는 `heroForm`을 초기화할 때도 이미 사용되었으며, 이 때 만든 `FormGroup`이 부모 폼 그룹입니다.
이 폼 그룹 안에 `FormBuilder`를 다시 사용해서 자식 폼 그룹을 정의하면 `address` 폼 컨트롤을 중첩 폼 그룹으로 구성할 수 있습니다.
이제 컴포넌트 클래스의 내용은 다음과 같이 구성합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-5.component.ts" region="v5" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>


<!--
When you change the structure of the form controls in the component class,
you must make corresponding adjustments to the component template.

In `hero-detail.component.html`, wrap the address-related `FormControls` in a `<div>`.
Add a `formGroupName` directive to the `div` and bind it to `"address"`.
That's the property of the `address` child `FormGroup` within the parent `FormGroup` called `heroForm`. Leave the `<div>` with the `name` `<input>`.

To make this change visually obvious, add an `<h4>` header near the top with the text, _Secret Lair_.
The new address HTML looks like this:
-->
컴포넌트 클래스에 있는 폼 컨트롤의 구성을 바꾸면, 컴포넌트 템플릿도 이 구성에 맞게 수정해야 합니다.

`hero-detail.component.html`에서 주소와 관련된 폼 컨트롤들을 `<div>`하나로 묶읍시다.
이 `<div>` 엘리먼트에는 `formGroupName` 어트리뷰트를 지정하며, 어트리뷰트 값은 `"address"`로 지정합니다.
그러면 이 엘리먼트는 부모 폼 그룹인 `heroFrom` 안에 있는 `address` 자식 폼 그룹과 연결됩니다.

이렇게 수정한 것을 확실하게 화면에 표시하기 위해, `address` 폼 그룹 위쪽에 `<h4>` 엘리먼트로 _Secret Lair_ 를 추가합니다.
그러면 `address`와 관련된 HTML 구성은 다음과 같습니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-5.component.html" region="add-group" title="src/app/hero-detail/hero-detail.component.html (excerpt)" linenums="false">

</code-example>

<!--
After these changes, the JSON output in the browser shows the revised form model
with the nested address `FormGroup`:
-->
여기까지 수정하고 나면 폼 모델을 표시하던 JSON 디버그 메시지도 중첩된 구조로 변경됩니다.

<figure>
  <img src="generated/images/guide/reactive-forms/address-group.png" alt="JSON output">
</figure>

<!--
This shows that the template
and the form model are talking to one another.
-->
이제 폼 모델과 템플릿이 서로 연결된 것을 확인할 수 있습니다.

{@a properties}

<!--
## Inspect `FormControl` Properties
-->
## `FormControl` 프로퍼티 활용하기

<!--
You can inspect an individual `FormControl` within a form by extracting it with the `get()` method.
You can do this within the component class or display it on the
page by adding the following to the template,
immediately after the `{{form.value | json}}` interpolation as follows:
-->
폼에 있는 개별 `FormControl` 인스턴스는 `get()` 메소드를 사용해서 가져올 수 있습니다.
이 메소드는 컴포넌트 클래스는 물론이고 템플릿에서도 사용할 수 있으며, 템플릿에 `{{form.value | json}}`라고 작성하면 폼에 입력된 내용을 화면에 표시할 수도 있습니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-5.component.html" region="inspect-value" title="src/app/hero-detail/hero-detail.component.html" linenums="false">

</code-example>

<!--
To get the state of a `FormControl` that’s inside a `FormGroup`, use dot notation to traverse to the control.
-->
그리고 `FormGroup` 안에 있는 `FormControl`은 객체를 참조할 때와 마찬가지로 `.` 으로 참조할 수 있습니다. 이 참조 방식은 `get()` 메소드 인자 안에서도 유효합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-5.component.html" region="inspect-child-control" title="src/app/hero-detail/hero-detail.component.html" linenums="false">

</code-example>

<div class="alert is-helpful">

<!--
*Note*: If you're coding along, remember to remove this reference to `address.street` when you get to the section on `FormArray`. In that section, you change the name of address in the component class and it will throw an error if you leave it in the template.
-->
*주의* : 템플릿에 작성한 `address.street` 코드는 설명을 위한 추가한 것이며, 이후 코드에서는 제거해야 합니다. 이 코드를 남겨두면 컴포넌트 클래스에서 주소값을 바꿨을 때 에러가 발생합니다.

</div>

<!--
You can use this technique to display any property of a `FormControl`
such as one of the following:
-->
이 방식은 `FormControl`에 있는 프로퍼티를 참조할 때 자유롭게 사용할 수 있습니다.

<style>
  td, th {vertical-align: top}
</style>



<table width="100%">

  <col width="10%">

  </col>

  <col width="90%">

  </col>

  <tr>

    <th>
      <!--
      Property
      -->
      프로퍼티
    </th>

    <th>
      <!--
      Description
      -->
      설명
    </th>

  </tr>

  <tr>

    <td>
      <code>myControl.value</code>
    </td>

    <td>


      <!--
      the value of a `FormControl`.
      -->
      `FormControl`의 현재값
    </td>

  </tr>

  <tr>

    <td>
      <code>myControl.status</code>
    </td>

    <td>


      <!--
      the validity of a `FormControl`. Possible values: `VALID`,
       `INVALID`, `PENDING`, or `DISABLED`.
      -->
      `FormControl`의 유효성 검사 결과 : `VALID`, `INVALID`, `PENDING`, `DISABLED`
    </td>

  </tr>

  <tr>

    <td>
      <code>myControl.pristine</code>
    </td>

    <td>


      <!--
      `true` if the user has _not_ changed the value in the UI.
      Its opposite is `myControl.dirty`.
      -->
      사용자가 값을 바꾸기 전이라면 `true` 값입니다.
      반대 프로퍼티는 `myControl.dirty`입니다.
    </td>

  </tr>

  <tr>

    <td>
      <code>myControl.untouched</code>
    </td>

    <td>


      <!--
      `true` if the control user has not yet entered the HTML control
       and triggered its blur event. Its opposite is `myControl.touched`.
      -->
      사용자가 HTML 컨트롤에 접근하기 전이라면 `true` 값입니다.
      반대 프로퍼티는 `myControl.touched` 입니다.

    </td>

  </tr>

</table>


<!--
Read about other `FormControl` properties in the
[_AbstractControl_](api/forms/AbstractControl) API reference.

One common reason for inspecting `FormControl` properties is to
make sure the user entered valid values.
Read more about validating Angular forms in the
[Form Validation](guide/form-validation) guide.
-->
`FormControl`의 다른 프로퍼티에 대해서도 알아보려면 [_AbstractControl_](api/forms/AbstractControl) API 문서를 참고하세요.

`FormControl` 인스턴스의 프로퍼티를 참조하는 것은 목적은 사용자가 입력한 값의 유효성을 확인하는 것입니다.
폼 유효성 검사에 대해 더 알아보려면 [폼 유효성 검사](guide/form-validation) 문서를 참고하세요.

{@a data-model-form-model}

<!--
## The data model and the form model
-->
## 데이터 모델과 폼 모델

<!--
At the moment, the form is displaying empty values.
The `HeroDetailComponent` should display values of a hero,
possibly a hero retrieved from a remote server.
-->
지금은 폼 내용이 모두 비어있습니다.
그런데 만약 히어로의 정보가 서버에 이미 저장되어 있고, 이 서버에서 가져온 데이터를 수정하려고 한다면 현재 히어로의 정보가 `HeroDetailComponent`에 표시되어야 합니다.

<!--
In this app, the `HeroDetailComponent` gets its hero from a parent `HeroListComponent`.
-->
이 예제에서는 부모 컴포넌트 `HeroListComponent`에서 히어로 정보를 가져옵니다.

<!--
The `hero` from the server is the **_data model_**.
The `FormControl` structure is the **_form model_**.
-->
외부에서 가져온 `hero` 객체는 **_데이터 모델_**입니다.
그리고 `FormControl` 구조는 **_폼 모델_**입니다.

<!--
The component must copy the hero values in the data model into the form model.
There are two important implications:
-->
컴포넌트는 데이터 모델에 있는 값을 폼 모델로 복사해야 합니다.
이 과정에서 두 가지가 중요합니다:

<!--
1. The developer must understand how the properties of the data model
map to the properties of the form model.

2. User changes flow from the DOM elements to the form model, not to the data model.
-->
1. 개발자는 데이터 모델의 어떤 프로퍼티가 어떤 폼 모델 프로퍼티에 연결되는지 알아야 합니다.

1. 사용자가 화면에서 변경하는 값은 데이터 모델의 값이 아니라 폼 모델의 값입니다.

<!--
The form controls never update the _data model_.

The form and data model structures don't need to match exactly.
You often present a subset of the data model on a particular screen.
But it makes things easier if the shape of the form model is close to the shape of the data model.
-->
폼 컨트롤은 절대로 _데이터 모델_ 을 수정하지 않습니다.

폼 모델과 데이터 모델의 구조가 정확히 일치할 필요는 없습니다.
화면에는 데이터 모델 중 일부만 사용할 수도 있습니다.
하지만 폼 모델과 데이터 모델의 구조를 비슷하게 해야 불필요한 실수를 줄일 수 있습니다.

<!--
In this `HeroDetailComponent`, the two models are quite close.

Here are the definitions of `Hero` and `Address` in `data-model.ts`:
-->
예제에서 다루는 `HeroDetailComponent`에서 폼 모델과 데이터 모델은 거의 비슷합니다.

`data-model.ts` 파일에 정의된 `Hero`와 `Address` 클래스 코드는 다음과 같습니다:

<code-example path="reactive-forms/src/app/data-model.ts" region="model-classes" title="src/app/data-model.ts (classes)" linenums="false">

</code-example>

<!--
Here, again, is the component's `FormGroup` definition.
-->
그리고 다음 코드는 컴포넌트에서 `FormGroup`을 정의하는 코드입니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-6.component.ts" region="hero-form-model" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>


<!--
There are two significant differences between these models:
-->
이 두 모델은 다른 점이 있습니다:

<!--
1. The `Hero` has an `id`. The form model does not because you generally don't show primary keys to users.

1. The `Hero` has an array of addresses. This form model presents only one address,
which is covered in the section on [`FormArray`](guide/reactive-forms#form-array "Form arrays") below.
-->
1. `Hero`에는 `id` 프로퍼티가 있지만 폼 모델에는 없습니다. 사용자에게 이 키를 보여줄 필요는 없습니다.

1. `Hero` 객체의 `addresses` 필드는 배열이지만 폼 모델에는 `address` 프로퍼티 하나만 있습니다. 폼 모델에서는 이 프로퍼티를 [`FormArray`](guide/reactive-forms#form-array "Form arrays")로 처리합니다.

<!--
Keeping the two models close in shape facilitates copying the data model properties
to the form model with the `patchValue()` and `setValue()` methods in the next section.
-->
두 모델의 다른 점을 염두에 두고, 데이터 모델을 폼 모델로 복사할 때 `patchValue()`나 `setValue()` 메소드를 활용할 수 있습니다. 이 메소드는 다음 섹션에서 알아봅니다.

<!--
First, refactor the `address` `FormGroup` definition as follows:
-->
먼저, 컴포넌트 클래스에 선언된 `address` 필드를 다음과 같이 수정합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="address-form-group" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
Also be sure to update the `import` from `data-model` so you can reference the `Hero` and `Address` classes:
-->
이렇게 정의한 모델을 컴포넌트 클래스에서 사용하기 위해 `import` 키워드로 불러옵니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="import-address" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

{@a set-data}

<!--
## Populate the form model with `setValue()` and `patchValue()`
-->
## 폼 모델 수정하기 : `setValue()`, `patchValue()`

<div class="alert is-helpful">

<!--
*Note*: If you're coding along, this section is optional as the rest of the steps do not rely on it.
-->
*참고* : 이 부분의 설명은 이후 과정에 영향이 없으며, 생략해도 됩니다.

</div>

<!--
Previously, you created a control and initialized its value at the same time.
You can also initialize or reset the values later with the
`setValue()` and `patchValue()` methods.
-->
지금까지는 폼 컨트롤 인스턴스를 생성하면서 초기값도 같이 지정했습니다.
이렇게 사용해도 되지만, 폼 컨트롤의 값은 `setValue()`이나 `patchValue()` 메소드로 수정할 수도 있습니다.

### `setValue()`

<!--
With `setValue()`, you assign every form control value at once
by passing in a data object whose properties exactly match the form model behind the `FormGroup`.
-->
`setValue()`를 사용하면 모든 폼 컨트롤 값을 한 번에 수정할 수 있습니다.
이 때 인자로 폼 모델의 전체 구조를 전달해야 합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="set-value" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
The `setValue()` method checks the data object thoroughly before assigning any form control values.
-->
그러면 `setValue()` 메소드가 모든 폼 컨트롤을 순회하면서 해당하는 값을 폼 컨트롤에 반영합니다.

<!--
It will not accept a data object that doesn't match the `FormGroup` structure or is
missing values for any control in the group. This way, it can return helpful
error messages if you have a typo or if you've nested controls incorrectly.
Conversely, `patchValue()` will fail silently.
-->
이 때 전달하는 인자가 `FormGroup`의 구조와 정확하게 일치하지 않거나, 일부 값을 빠뜨리면 이 함수는 동작하지 않습니다.
대신 어떤 부분이 잘못되었는지 알려주는 에러 메시지가 표시될 것입니다.
이 부분은 `patchValue()`의 동작과 다릅니다.

<!--
Notice that you can almost use the entire `hero` as the argument to `setValue()`
because its shape is similar to the component's `FormGroup` structure.
-->
`setValue()` 메소드로 `hero` 데이터 모델의 내용을 폼 모델에 반영하는 것은 어렵지 않습니다.
데이터 모델과 폼 모델의 구조가 거의 비슷하기 때문입니다.

<!--
You can only show the hero's first address and you must account for the possibility that the `hero` has no addresses at all, as in the conditional setting of the `address` property in the data object argument:
-->
폼 모델에는 히어로의 주소를 반영하는데, 이 때 주소에 입력된 값이 비어있을 수 있습니다. `address` 프로퍼티의 값이 비어있는 경우를 대비해서 코드를 다음과 같이 작성합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="set-value-address" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>



### `patchValue()`

<!--
With **`patchValue()`**, you can assign values to specific controls in a `FormGroup`
by supplying an object of key/value pairs for them.

This example sets only the form's `name` control.
-->
**`patchValue()`**를 사용하면 폼 그룹안에 있는 폼 컨트롤의 일부값을 수정할 수 있습니다.
이 때 인자로 폼 모델의 일부를 전달합니다.

다음 예제는 폼에 있는 항목 중 `name`에 해당하는 폼 컨트롤의 값을 수정하는 코드입니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-6.component.ts" region="patch-value" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>


<!--
With `patchValue()` you have more flexibility to cope with divergent data and form models.
But unlike `setValue()`,  `patchValue()` cannot check for missing control
values and doesn't throw helpful errors.
-->
`patchValue()`를 사용하면 `setValue()`를 사용하는 것보다 조금 더 간단하게 폼 모델을 수정할 수 있습니다.
`patchValue()`를 사용할 때는 폼 모델 전체에 해당하는 객체 구조를 전달할 필요가 없으며, 수정하려고 하는 폼 컨트롤의 값만 전달하면 됩니다.
다만, 실수로 빠뜨린 폼 컨트롤이 있더라도 이 부분을 경고하는 에러 메시지는 출력되지 않으니 주의해야 합니다.

{@a hero-list}

<!--
## Create the `HeroListComponent` and `HeroService`
-->
## `HeroListComponent`와 `HeroService` 생성하기

<!--
To demonstrate further reactive forms techniques, it is helpful to add more functionality to the example by adding a `HeroListComponent` and a `HeroService`.

The `HeroDetailComponent` is a nested sub-component of the `HeroListComponent` in a _master/detail_ view. Together they look like this:
-->
반응형 폼에 대한 내용을 좀 더 알아보기 위해, 폼 컴포넌트의 동작에 필요한 `HeroListComponent`와 `HeroService`를 추가해 봅시다.

이제 `HeroDetailComponent`는 `HeroListComponent` 안에 들어가서 부모/자식 관계로 존재할 것입니다.
다음과 같은 화면으로 만들어 봅시다:

<figure>
  <img src="generated/images/guide/reactive-forms/hero-list.png" alt="HeroListComponent">
</figure>

<!--
First, add a `HeroListComponent` with the following command:
-->
제일 먼저, 다음 명령을 실행해서 `HeroListComponent`를 생성합니다:

<code-example language="sh" class="code-shell">

  ng generate component HeroList

</code-example>

<!--
Give the `HeroListComponent` the following contents:
-->
그리고 `HeroListComponent` 클래스의 내용을 다음과 같이 작성합니다:

<code-example path="reactive-forms/src/app/hero-list/hero-list.component.ts" title="hero-list.component.ts" linenums="false">

</code-example>

<!--
Next, add a `HeroService` using the following command:
-->
다음에는 아래 명령을 실행해서 `HeroService`를 생성합니다.

<code-example language="sh" class="code-shell">

  ng generate service Hero

</code-example>

<!--
Then, give it the following contents:
-->
그리고 클래스의 내용을 다음과 같이 작성합니다:

<code-example path="reactive-forms/src/app/hero.service.ts" title="hero.service.ts" linenums="false">

</code-example>

<!--
The `HeroListComponent` uses an injected `HeroService` to retrieve heroes from the server
and then presents those heroes to the user as a series of buttons.
The `HeroService` emulates an HTTP service.
It returns an `Observable` of heroes that resolves after a short delay,
both to simulate network latency and to indicate visually
the necessarily asynchronous nature of the application.
-->
`HeroListComponent`는 이제 `HeroService`를 의존성으로 주입받고 서버에서 히어로 데이터를 가져오며, 이렇게 가져온 데이터를 버튼 여러개로 화면에 표시합니다.
이 때 `HeroService`는 HTTP 서버의 동작을 대신하는 용도로 사용합니다.
`HeroService`는 서버 응답을 흉내내기 위해 약간의 딜레이를 기다린 후에 `Observable` 형태로 히어로 데이터를 반환합니다.
사용자가 보는 화면에서는 실제 서버로 통신하는 것과 비슷하게 느껴질 것입니다.

<!--
When the user clicks on a hero,
the component sets its `selectedHero` property which
is bound to the `hero` `@Input()` property of the `HeroDetailComponent`.
The `HeroDetailComponent` detects the changed hero and resets its form
with that hero's data values.
-->
사용자가 화면에서 히어로를 클릭하면 해당 버튼에 연결된 히어로 데이터를 컴포넌트의 `selectedHero` 프로퍼티에 연결하며, 이 프로퍼티는 `@Input()` 으로 연결되어 `heroDetailComponent`로 전달됩니다.
그러면 `HeroDetailComponent`는 히어로의 데이터를 폼에 표시하고 수정할 수 있는 준비를 할 것입니다.

<!--
A refresh button clears the hero list and the current selected hero before refetching the heroes.
-->
그리고 `HeroListComponent`에 있는 `Refresh` 버튼을 클릭하면 선택된 히어로가 없는 것으로 표시하며, 히어로 목록도 새로 받아옵니다.

<!--
Notice that `hero-list.component.ts` imports `Observable` and the `finalize` operator, while `hero.service.ts` imports `Observable`, `of`, and the `delay` operator from `rxjs`.
-->
`hero-list.component.ts`에서는 `Observable`과 `finalize` 연산자를 로드합니다.
그리고 `hero.service.ts` 파일에서는 `Observable`과 `of`, `delay` 연산자를 로드합니다.
이 심볼들은 모두 `rxjs`에서 가져옵니다.

<!--
The remaining `HeroListComponent` and `HeroService` implementation details are beyond the scope of this tutorial.
However, the techniques involved are covered elsewhere in the documentation, including the _Tour of Heroes_
[here](tutorial/toh-pt3 "ToH: Multiple Components") and [here](tutorial/toh-pt4 "ToH: Services").
-->
`HeroListComponent`와 `HeroService`의 코드는 이 가이드에서 자세하게 다루지 않겠습니다.
이 파일을 직접 구현하려면 _히어로들의 여정_ 튜토리얼의 [이 부분](tutorial/toh-pt3 "ToH: Multiple Components")과 [이 부분](tutorial/toh-pt4 "ToH: Services")을 참고하세요.

<!--
To use the `HeroService`, import it into `AppModule` and add it to the `providers` array. To use the `HeroListComponent`, import it, declare it, and export it:
-->
`HeroService`를 사용하려면 `AppModule`의 `providers` 배열에 이 서비스를 등록해야 합니다.
그리고 `HeroListComponent`도 마찬가지로 앱 모듈에 등록하고 `exports`에도 등록합니다.

<code-example path="reactive-forms/src/app/app.module.ts" region="hero-service-list" title="app.module.ts (excerpts)" linenums="false">

</code-example>

<!--
Next, update the `HeroListComponent` template with the following:
-->
이제 `HeroListComponent`의 템플릿을 다음과 같이 작성합니다:

<code-example path="reactive-forms/src/app/hero-list/hero-list.component.html" title="hero-list.component.html" linenums="false">

</code-example>

<!--
These changes need to be reflected in the `AppComponent` template. Replace the contents of `app.component.html` with updated markup to use the `HeroListComponent`, instead of the `HeroDetailComponent`:
-->
이제 이 수정 내용을 `AppComponent`에도 반영합니다.
`app.component.html` 템플릿을 수정해서 `HeroDetailComponent` 대신 `HeroListComponent`를 사용하도록 합시다:

<code-example path="reactive-forms/src/app/app.component.html" title="app.component.html" linenums="false">

</code-example>

<!--
Finally, add an `@Input()` property to the `HeroDetailComponent`
so `HeroDetailComponent` can receive the data from `HeroListComponent`. Remember to add the `Input` symbol to the `@angular/core `  `import` statement in the list of JavaScript imports too.
-->
마지막으로 `HeroDetailComponent`에 `@Input()` 프로퍼티를 추가해서 부모 컴포넌트인 `HeroListComponent`에서 데이터를 받을 수 있게 합니다. `@angular/core` 라이브러리에서 `Input` 심볼을 로드하는 것을 잊지 마세요.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-6.component.ts" region="hero" title="hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
Now you should be able to click on a button for a hero and a form renders.
-->
이제 템플릿은 모두 준비되었습니다.

<!--
## When to set form model values (`ngOnChanges`)
-->
## 폼 모델을 설정하는 타이밍 (`ngOnChanges`)

<!--
When to set form model values depends upon when the component gets the data model values.

The `HeroListComponent` displays hero names to the user.
When the user clicks on a hero, the `HeroListComponent` passes the selected hero into the `HeroDetailComponent`
by binding to its `hero` `@Input()` property.
-->
폼 모델의 값은 컴포넌트가 데이터 모델을 받아온 시점에 설정되어야 합니다.

`HeroListComponent`는 히어로의 이름을 사용자에게 표시합니다.
그리고 이 버튼을 클릭하면 `@Input()` 프로퍼티를 통해 `HeroListComponent`에서 `HeroDetailComponent`에 히어로 데이터를 전달합니다.

<code-example path="reactive-forms/src/app/hero-list/hero-list.component.1.html" title="hero-list.component.html (simplified)" linenums="false">

</code-example>

<!--
In this approach, the value of `hero` in the `HeroDetailComponent` changes
every time the user selects a new hero.
You can call `setValue()` using the [ngOnChanges](guide/lifecycle-hooks#onchanges)
lifecycle hook, which Angular calls whenever the `@Input()` `hero` property changes.
-->
이 방식을 사용하면 `HeroDetailComponent`의 `hero` 프로퍼티는 사용자가 새로운 히어로를 선택할 때마다 계속 변경됩니다.
그러면 이 시점에 라이프싸이클 후킹 함수 중 [ngOnChanges](guide/lifecycle-hooks#onchanges)를 사용해서 `setValue()`를 설정하면 됩니다.

<!--
### Reset the form
-->
### 폼 초기화

<!--
First, import the `OnChanges` symbol in `hero-detail.component.ts`.
-->
제일 먼저 `hero-detail.component.ts` 파일에 `OnChanges` 심볼을 로드합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-6.component.ts" region="import-input" title="src/app/hero-detail/hero-detail.component.ts (core imports)" linenums="false">

</code-example>

<!--
Next, let Angular know that the `HeroDetailComponent` implements `OnChanges`:
-->
그리고 `HeroDetailComponent`가 `OnChanges` 인터페이스를 구현하도록 지정합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="onchanges-implementation" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
Add the `ngOnChanges` method to the class as follows:
-->
클래스의 `ngOnChanges` 메소드는 다음과 같이 구현합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="ngOnChanges" title="src/app/hero-detail/hero-detail.component.ts (ngOnchanges)" linenums="false">

</code-example>

<!--
Notice that it calls `rebuildForm()`, which is a method where you
can set the values. You can name `rebuildForm()` anything that makes sense to you. It isn't built into Angular, but is a method you create to effectively leverage the `ngOnChanges` lifecycle hook.
-->
이 메소드는 폼 값을 초기화하는 `rebuildForm()` 함수를 실행합니다.
이 때 `rebuildForm()` 이라는 함수의 이름은 달라져도 상관없습니다. 이 함수는 `ngOnChanges` 라이프싸이클 후킹 함수를 좀 더 편하게 사용하기 위해 따로 뺀 것 뿐입니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="rebuildForm" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
The `rebuildForm()` method does two things; resets the hero's name and the address.
-->
`rebuildForm()` 함수는 히어로의 이름과 주소를 초기화합니다.

{@a form-array}

<!--
## Use _FormArray_ to present an array of `FormGroups`
-->
## `FormGroups` 안에 있는 _FormArray_ 활용하기

<!--
A `FormGroup` is a named object whose property values are `FormControls` and other `FormGroups`.

Sometimes you need to present an arbitrary number of controls or groups.
For example, a hero may have zero, one, or any number of addresses.

The `Hero.addresses` property is an array of `Address` instances.
An `address`  `FormGroup` can display one `Address`.
An Angular `FormArray` can display an array of `address`  `FormGroups`.

To get access to the `FormArray` class, import it into `hero-detail.component.ts`:
-->
`FormGroup` 안에는 `FormControl`과 또 다른 `FormGroup`이 있습니다.

그런데 어떤 경우에는 폼 컨트롤의 개수가 변하는 경우가 있습니다.
이 예제에서도 주소에 해당하는 값은 하나이거나 여러개, 아예 없을 수도 있습니다.

`Hero.addresses` 프로퍼티는 `Address` 타입의 배열입니다.
그리고 `address` `FormGroup`은 이 배열 전체를 하나의 값으로 표현합니다.
그렇다면 `address` 프로퍼티를 `FormArray` 타입으로 사용할 수 있습니다.

`hero-detail.component.ts` 파일에서 `FormArray` 클래스를 사용하기 위해 심볼을 로드합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="imports" title="src/app/hero-detail/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>

<!--
To work with a `FormArray` do the following:

1. Define the items in the array; that is, `FormControls` or `FormGroups`.

1. Initialize the array with items created from data in the data model.

1. Add and remove items as the user requires.

Define a `FormArray` for `Hero.addresses` and
let the user add or modify addresses.

You’ll need to redefine the form model in the `HeroDetailComponent` `createForm()` method,
which currently only displays the first hero address in an `address` `FormGroup`:
-->
`FormArray`는 다음 순서로 사용합니다:

1. `FormControl`이나 `FormGroups`를 배열로 선언합니다.

1. 데이터 모델에 있는 값으로 이 배열을 초기화합니다.

1. 필요한 경우 아이템을 더 추가하거나 제거합니다.

`Hero.addresses`는 `FormArray` 타입으로 선언하고 사용자가 수정하는 주소값을 이 필드에 저장하겠습니다.

그러면 `HeroDetailComponent`의 `createForm()` 메소드가 폼 모델의 구조에 맞게 수정해야 합니다.
지금까지는 히어로의 주소 하나만 표시했지만, 이제 `FormGroup` 타입이 되도록 다음과 같이 수정합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-7.component.ts" region="address-form-group" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
### From `address` to `secretLairs`
-->
### `address`를 `secretLairs`로 변경하기

<!--
From the user's point of view, heroes don't have _addresses_.
Addresses are for mere mortals. Heroes have _secret lairs_!
Replace the address `FormGroup` definition with a `secretLairs`  `FormArray` definition:
-->
사용자가 보는 화면에는 히어로의 _주소_ 가 표시되지 않습니다.
주소는 히어로가 사는 곳에 따라 변할 수 있지만, 대신 변하지 않는 _비밀 둥지_ 를 갖습니다!
주소로 사용하던 `FormGroup` 필드를  `FormArray` 타입의 `secretLairs`로 변경합시다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="secretLairs-form-array" title="src/app/hero-detail/hero-detail-8.component.ts" linenums="false">

</code-example>

<!--
In `hero-detail.component.html` change `formGroupName="address"` to `formArrayName="secretLairs"`.
-->
그리고 `hero-detail.component.html` 파일의 `formGroupName="address"`를 `formArrayName="secretLairs"`로 수정합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.html" region="form-array-name" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<div class="alert is-helpful">

<!--
Changing the form control name from `address` to `secretLairs` underscores an important point:
the _form model_ doesn't have to match the _data model_.

Obviously, there has to be a relationship between the two.
But it can be anything that makes sense within the application domain.

_Presentation_ requirements often differ from _data_ requirements.
The reactive forms approach both emphasizes and facilitates this distinction.
-->
폼 컨트롤의 이름을 `address`에서 `secretLairs`로 바꾸는 것은 사실 중요하지 않습니다.
_폼 모델_ 은 _데이터 모델_ 과 똑같은 구조일 필요는 없기 때문입니다.

두 모델은 서로 관련된 상태를 유지하는 것이 좋기 때문에 되도록이면 비슷한 구조로 맞추는 것이 좋지만,
애플리케이션의 상황에 따라 자유롭게 지정할 수 있습니다.

_화면에 보여지는 것_ 이 _데이터_ 와는 다른 경우도 있습니다.
반응형 폼은 이 요구사항에 충분히 대응할 수 있습니다.

</div>

<!--
### Initialize the `secretLairs` _FormArray_
-->
### `secretLairs` _FormArray_ 초기화하기

<!--
The default form displays a nameless hero with no addresses.

You need a method to populate (or repopulate) the `secretLairs` with actual hero addresses whenever
the parent `HeroListComponent` sets the `HeroDetailComponent.hero`  `@Input()` property to a new `Hero`.

The following `setAddresses()` method replaces the `secretLairs`  `FormArray` with a new `FormArray`,
initialized by an array of hero address `FormGroups`. Add this to the `HeroDetailComponent` class:
-->
이제 폼의 기본 화면에는 히어로의 주소가 표시되지 않습니다.

이 정보는 `HeroListComponent`에서 `HeroDetailComponent`의 `@Input()` 프로퍼티인 `hero` 객체 안에 담겨 전달되며, 이 필드의 값을 폼 모델로 반영할 함수가 필요합니다.

아래 코드에서 `setAdresses()` 메소드는 `FormArray` 타입의 `secretLairs`를 새로운 `FormArray` 인스턴스로 교체합니다.
이 때 새로 만들어지는 인스턴스는 인자로 받은 객체를 `FormGroup`으로 변환한 뒤에 `FormArray`로 다시 한 번 변환된 인스턴스입니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="set-addresses" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
Notice that you replace the previous `FormArray` with the
`FormGroup.setControl()` method, not with `setValue()`.
You're replacing a _control_, not the _value_ of a control.

Notice also that the `secretLairs`  `FormArray` contains `FormGroups`, not `Addresses`.

Next, call `setAddresses()` from within `rebuildForm()`:
-->
이 코드에서 `setValue()`를 사용하지 않고 `FormGroup.setControl()` 메소드를 사용한 것에 주의하세요.
이 구문은 폼 컨트롤의 _값_ 을 지정한 것이 아니라 _폼 컨트롤_ 을 교체한 것입니다.

`FormArray` 타입인 `secretLairs`는 `Addresses` 타입이 아니라 `FormGroup` 타입인 것에도 주의하세요.

이제 `rebuildForm()` 함수에서 `setAddresses()`를 실행하도록 수정합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="rebuildform" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
### Get the _FormArray_
-->
### _FormArray_ 참조하기

<!--
The `HeroDetailComponent` should be able to display, add, and remove items from the `secretLairs`  `FormArray`.

Use the `FormGroup.get()` method to acquire a reference to that `FormArray`.
Wrap the expression in a `secretLairs` convenience property for clarity and re-use. Add the following to `HeroDetailComponent`.
-->
이제 `HeroDetailComponent`에서는 `FormArray` 타입의 `secretLairs`를 표시하거나 추가/수정할 수 있습니다.

`FormGroup.get()`을 사용하면 `FormArray`에 접근할 수 있습니다.
템플릿 코드를 간단하게 하기 위해, `HeroDetailComponent`에 `secretLairs`에 대한 게터(getter)를 다음과 같이 작성합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="get-secret-lairs" title="src/app/hero-detail/hero-detail.component.ts (secretLairs property)" linenums="false">

</code-example>

<!--
### Display the _FormArray_
-->
### _FormArray_ 표시하기

<!--
The current HTML template displays a single `address` `FormGroup`.
Revise it to display zero, one, or more of the hero's `address`  `FormGroups`.

This is mostly a matter of wrapping the previous template HTML for an address in a `<div>` and
repeating that `<div>` with `*ngFor`.
-->
지금까지 작성한 템플릿은 `FormGroup` 타입의 `address` 필드를 화면에 표시합니다.
이 내용을 수정해서 0개, 1개, 혹은 여러개의 `FormGroups` 타입을 `address` 필드로 만들어 봅시다.

하지만 이전에 구현했던 주소 필드는 `<div>`로 랩핑되어 있고, 이 엘리먼트에 `*ngFor`가 적용되어 있기 때문에 문제가 조금 있습니다.

<!--
There are three key points when writing the `*ngFor`:

1. Add another wrapping `<div>`, around the `<div>` with `*ngFor`, and
set its `formArrayName` directive to `"secretLairs"`.
This step establishes the `secretLairs`  `FormArray` as the context for form controls in the inner, repeated HTML template.

1. The source of the repeated items is the `FormArray.controls`, not the `FormArray` itself.
Each control is an `address`  `FormGroup`, exactly what the previous (now repeated) template HTML expected.

1. Each repeated `FormGroup` needs a unique `formGroupName`, which must be the index of the `FormGroup` in the `FormArray`.
You'll re-use that index to compose a unique label for each address.
-->
`*ngFor`를 사용할 때는 다음 내용이 중요합니다:

1. `*ngFor`를 사용한 `<div>`를 둘러싸도록 `<div>`를 하나 더 추가하고, 이 엘리먼트에 `formArrayName` 디렉티브를 사용해서 `"secretLairs"`와 연결합니다.
이 디렉티브를 사용하면 `FormArray` 타입의 `secretLairs` 필드가 HTML 템플릿이 반복되는 각 루프의 컨텍스트에 연결됩니다.

1. 이 때 반복되는 항목은 `FormArray` 자체가 아니라 `FormArray.controls` 이며, 이전에 사용되던 템플릿은 `*ngFor`로 반복되는 `FormGroup` 타입의 개별 `address` 필드에 연결됩니다.

1. 반복되는 `FormGroup`은 `FormArray`에서 어떤 컨트롤인지 구분하기 위해 `formGroupName`이 지정되어야 합니다.
이 코드에서는 `*ngFor`에서 전달하는 인덱스를 활용합니다.

<!--
Here's the skeleton for the secret lairs section of the HTML template:
-->
이 부분의 HTML 템플릿은 다음과 같이 구성됩니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.html" region="form-array-skeleton" title="src/app/hero-detail/hero-detail.component.html (*ngFor)" linenums="false">

</code-example>

<!--
Here's the complete template for the secret lairs section. Add this to `HeroDetailComponent` template, replacing the `forGroupName=address`  `<div>`:
-->
그리고 주소 부분의 전체 템플릿은 다음과 같습니다. `HeroDetailComponent`의 템플릿에서 `forGroupName=address`를 지정했던  `<div>`를 교체한 것입니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.html" region="form-array" title="src/app/hero-detail/hero-detail.component.html (excerpt)">

</code-example>


<!--
### Add a new lair to the _FormArray_
-->
### _FormArray_ 에 새로운 장소 추가하기

<!--
Add an `addLair()` method that gets the `secretLairs`  `FormArray` and appends a new `address`  `FormGroup` to it.
-->
비밀 둥지를 추가하는 `addLair()` 함수를 추가합니다. 이 함수는 `FormArray`타입의 `secretLairs`에 새로운 `FormGroup` 항목을 추가합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="add-lair" title="src/app/hero-detail/hero-detail.component.ts (addLair method)" linenums="false">

</code-example>

<!--
Place a button on the form so the user can add a new _secret lair_ and wire it to the component's `addLair()` method. Put it just before the closing `</div>` of the `secretLairs`  `FormArray`.
-->
그리고 폼에 버튼을 추가하고 이 버튼에 `addLair()` 메소드를 연결합니다. 이 버튼은 `secretLairs`와 관련된 `<div>` 닫는 태그 전에 추가합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.html" region="add-lair" title="src/app/hero-detail/hero-detail.component.html (addLair button)" linenums="false">

</code-example>

<div class="alert is-important">

<!--
Be sure to add the `type="button"` attribute 
because without an explicit type, the button type defaults to "submit".
When you later add a form submit action, every "submit" button triggers the submit action which
might do something like save the current changes.
You do not want to save changes when the user clicks the _Add a Secret Lair_ button.
-->
버튼에 `type="button"` 어트리뷰트를 지정하는 것을 잊지 마세요.
버튼 타입을 명확하게 지정하지 않으면 Angular는 이 버튼을 "submit" 타입인 것으로 처리합니다.
이후에 폼 제출 동작을 구현하고 나면 모든 "submit" 버튼이 폼 제출 로직을 실행하면서 잘못된 데이터를 서버로 보낼 수도 있습니다.
이 과정에서 구현하고 싶은 것은 주소 필드를 추가하는 버튼이지, 데이터를 서버로 보내서 저장하는 버튼이 아닙니다.

</div>

<!--
### Try it!
-->
### 동작을 확인해 보세요!

<!--
Back in the browser, select the hero named "Magneta".
"Magneta" doesn't have an address, as you can see in the diagnostic JSON at the bottom of the form.
-->
다시 브라우저로 돌아가서 "Magneta" 히어로를 선택합니다.
그러면 폼 가장 아래 표시되는 JSON 디버그 메시지를 확인해서 이 히어로가 주소를 갖지 않는다는 것을 알 수 있습니다.

<figure>
  <img src="generated/images/guide/reactive-forms/addresses-array.png" alt="JSON output of addresses array">
</figure>

<!--
Click the "_Add a Secret Lair_" button.
A new address section appears. Well done!
-->
이제 "_Add a Secret Lair_" 버튼을 클릭해 보세요.
새로운 주소 필드가 추가된다면, 제대로 동작하는 것입니다!

<!--
### Remove a lair
-->
### 둥지 제거하기

<!--
This example can _add_ addresses but it can't _remove_ them.
For extra credit, write a `removeLair` method and wire it to a button on the repeating address HTML.
-->
지금까지 작성한 예제는 비밀 둥지를 _추가_ 할 수 있지만 _제거_ 할 수는 없습니다.
이 기능을 구현하려면 `removeLair` 메소드를 추가하고 해당 로직을 구현하면 됩니다.

{@a observe-control}

<!--
## Observe control changes
-->
## 폼 컨트롤 변화 추적하기

<!--
Angular calls `ngOnChanges()` when the user picks a hero in the parent `HeroListComponent`.
Picking a hero changes the `HeroDetailComponent.hero`  `@Input()` property.

Angular does _not_ call `ngOnChanges()` when the user modifies the hero's `name` or `secretLairs`.
Fortunately, you can learn about such changes by subscribing to one of the `FormControl` properties
that raises a change event.

These are properties, such as `valueChanges`, that return an RxJS `Observable`.
You don't need to know much about RxJS `Observable` to monitor form control values.

Add the following method to log changes to the value of the `name` `FormControl`.
-->
Angular는 부모 컴포넌트인 `HeroListComponent`에서 히어로가 선택될 때마다 `ngOnChanges()`를 실행하고,
이렇게 선택된 히어로를 자식 컴포넌트 `HeroDetailComponent`에서 `@Input()`으로 지정된 `hero` 프로퍼티로 전달합니다.

사용자가 `name`이나 `secretLairs` 필드를 수정할 때는 `ngOnChanges()` 함수가 실행되지 _않습니다_ .
하지만 이 변화는 `FormControl` 프로퍼티 값이 변하는 이벤트를 구독(subscribe)하면 추적할 수 있습니다.

`FormControl`의 프로퍼티 중 `valueChanges`와 같은 프로퍼티는 RxJS `Observable`을 반환합니다.
이 값을 구독하면 폼 컨트롤의 값이 변하는 것을 추적할 수 있으며, RxJS `Observable`에 대해 간단하게만 알고 있어도 사용하기 쉽습니다.

`name` `FormControl`이 변하는 것을 확인하려면 다음과 같이 작성합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="log-name-change" title="src/app/hero-detail/hero-detail.component.ts (logNameChange)" linenums="false">

</code-example>

<!--
Call it in the constructor, after `createForm()`.
-->
그리고 생성자에서 `createForm()`을 실행하는 부분 뒤에 이 함수를 실행합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail-8.component.ts" region="ctor" title="src/app/hero-detail/hero-detail.component.ts" linenums="false">

</code-example>

<!--
The `logNameChange()` method pushes name-change values into a `nameChangeLog` array.
Display that array at the bottom of the component template with this `*ngFor` binding:
-->
`logNameChange()` 메소드는 히어로의 이름이 변하는 과정마다 `nameChangeLog` 배열에 현재값을 추가합니다.
그리고 이 배열은 컴포넌트 템플릿 아래 `*ngFor` 바인딩으로 화면에 표시합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.html" region="name-change-log" title="src/app/hero-detail/hero-detail.component.html (Name change log)" linenums="false">

</code-example>


<!--
Return to the browser, select a hero; for example, Magneta, and start typing in the `name`  `<input>`.
You should see a new name in the log after each keystroke.
-->
브라우저로 돌아와서 히어로를 선택해 봅시다. 그리고 "Magneta"를 선택한 후에 `name`에 해당하는 `<input>` 필드에 이름을 입력합니다.
그러면 각각의 키 입력이 있을 떄마다 변하는 과정을 확인할 수 있습니다.

<!--
### When to use it
-->
### 언제 사용해야 할까

<!--
An interpolation binding is the easier way to display a name change.
Subscribing to an observable `FormControl` property is handy for triggering
application logic within the component class.
-->
문자열 바인딩을 사용하면 이름이 변하는 것을 화면에서 간단하게 확인할 수 있습니다.
`FormControl`에서 옵저버블로 제공하는 프로퍼티를 사용하면 컴포넌트 클래스에서 필요한 시점에 원하는 동작을 수행할 수 있습니다.

{@a save}

<!--
## Save form data
-->
## 데이터 저장하기

<!--
The `HeroDetailComponent` captures user input but it doesn't do anything with it.
In a real app, you'd probably save those hero changes, revert unsaved changes, and resume editing.
After you implement both features in this section, the form will look like this:
-->
`HeroDetailComponent`는 사용자의 입력을 받지만 아직 아무것도 하지 않습니다.
하지만 실제 앱에서는 히어로의 값이 변경된 것을 서버에 저장하거나, 저장하지 않을 데이터는 다시 되돌리기도 해야 합니다.
이번에는 이 내용을 구현해 봅시다:

<figure>
  <img src="generated/images/guide/reactive-forms/save-revert-buttons.png" alt="Form with save & revert buttons">
</figure>


<!--
### Save
-->
### 저장하기

<!--
When the user submits the form,
the `HeroDetailComponent` will pass an instance of the hero _data model_
to a save method on the injected `HeroService`. Add the following to `HeroDetailComponent`.
-->
사용자가 폼을 제출하면 `HeroDetailComponent`가 히어로의 _데이터 모델_ 을 `HeroService`에 보내서 데이터를 저장해야 합니다. 이 부분을 다음과 같이 구현합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="on-submit" title="src/app/hero-detail/hero-detail.component.ts (onSubmit)" linenums="false">

</code-example>

<!-- TODO: Need to add `private heroService: HeroService` to constructor and import the HeroService. Remove novalidate-->

<!--
This original `hero` had the pre-save values. The user's changes are still in the _form model_.
So you create a new `hero` from a combination of original hero values (the `hero.id`)
and deep copies of the changed form model values, using the `prepareSaveHero()` helper.
-->
컴포넌트에 있는 `hero` 프로퍼티는 변경되기 전 값이 저장되어 있습니다. 사용자가 변경한 것은 데이터 모델이 아니라 _폼 모델_ 이기 때문입니다.
그래서 `hero` 프로퍼티의 값을 이 폼 모델의 값과 같도록 수정해야 합니다.
이 과정은 객체 내부까지 복사하는 깊은 복사(deep copy)여야 하며, `prepareSaveHero()` 함수에 이 내용을 구현합니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="prepare-save-hero" title="src/app/hero-detail/hero-detail.component.ts (prepareSaveHero)" linenums="false">

</code-example>

<!--
Make sure to import `HeroService` and add it to the constructor:
-->
그리고 컴포넌트 클래스가 `HeroService`를 주입받을 수 있도록 생성자를 다음과 같이 수정합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="import-service" title="src/app/hero-detail/hero-detail.component.ts (prepareSaveHero)" linenums="false">

</code-example>

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="ctor" title="src/app/hero-detail/hero-detail.component.ts (prepareSaveHero)" linenums="false">

</code-example>

<div class="l-sub-section">

<!--
**Address deep copy**
-->
**주소 필드를 딥 카피하는 이유**

<!--
Had you assigned the `formModel.secretLairs` to `saveHero.addresses` (see line commented out),
the addresses in `saveHero.addresses` array would be the same objects
as the lairs in the `formModel.secretLairs`.
A user's subsequent changes to a lair street would mutate an address street in the `saveHero`.

The `prepareSaveHero` method makes copies of the form model's `secretLairs` objects so that can't happen.
-->
`formModel.secretLairs`의 값을 `saveHero.addresses`로 지정하려면 `saveHero.addresses` 배열이 `formModel.secretLairs`의 구조와 같아야 합니다.

그래서 `prepareSaveHero` 메소드는 폼 모델의 `secretLairs` 객체를 복사해서 활용합니다.

</div>


<!--
### Revert (cancel changes)
-->
### 변경내용 취소하기

<!--
The user cancels changes and reverts the form to the original state by pressing the Revert button.

Reverting is easy. Simply re-execute the `rebuildForm()` method that built the form model from the original, unchanged `hero` data model.
-->
사용자가 Revert 버튼을 누르면 폼의 내용이 원래대로 원복되어야 합니다.

내용을 되돌리는 것은 간단합니다. 이 코드에서는 `hero` 데이터 모델을 직접 수정할 필요 없이 `rebuildForm()` 메소드를 실행하기만 하면 됩니다.

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.ts" region="revert" title="src/app/hero-detail/hero-detail.component.ts (revert)" linenums="false">

</code-example>


<!--
### Buttons
-->
### 버튼 추가

<!--
Add the "Save" and "Revert" buttons near the top of the component's template:
-->
컴포넌트 템플릿에 "Save" 버튼과 "Revert" 버튼을 추가합니다:

<code-example path="reactive-forms/src/app/hero-detail/hero-detail.component.html" region="buttons" title="src/app/hero-detail/hero-detail.component.html (Save and Revert buttons)" linenums="false">

</code-example>


<!--
The buttons are disabled until the user "dirties" the form by changing a value in any of its form controls (`heroForm.dirty`).

Clicking a button of type `"submit"` triggers the `ngSubmit` event which calls the component's `onSubmit` method.
Clicking the revert button triggers a call to the component's `revert` method.
Users now can save or revert changes.

Try the <live-example stackblitz="final" title="Reactive Forms (final) in Stackblitz"></live-example>.
-->
사용자가 폼에 접근해서 폼 전체 상태가 "dirty" 상태가 되기 전까지는 버튼들이 비활성화된 상태로 표시됩니다.

사용자가 폼을 수정한 후에 `"submit"` 버튼을 클릭하면 `ngSubmit` 이벤트가 발생되며 컴포넌트의 `onSubmit` 메소드가 실행됩니다.
그리고 "Revert" 버튼을 클릭하면 컴포넌트의 `revert` 메소드가 실행되어 폼 모델의 내용을 수정 전으로 되돌립니다.

이 문서에서 다룬 예제는 <live-example stackblitz="final" title="Reactive Forms (final) in Stackblitz"></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

{@a source-code}

<!--
The key files of the final version are as follows:
-->
다음 파일들이 중요합니다:

<code-tabs>

  <code-pane title="src/app/app.component.html" path="reactive-forms/src/app/app.component.html">

  </code-pane>

  <code-pane title="src/app/app.component.ts" path="reactive-forms/src/app/app.component.ts">

  </code-pane>

  <code-pane title="src/app/app.module.ts" path="reactive-forms/src/app/app.module.ts">

  </code-pane>

  <code-pane title="src/app/hero-detail/hero-detail.component.ts" path="reactive-forms/src/app/hero-detail/hero-detail.component.ts">

  </code-pane>

  <code-pane title="src/app/hero-detail/hero-detail.component.html" path="reactive-forms/src/app/hero-detail/hero-detail.component.html">

  </code-pane>

  <code-pane title="src/app/hero-list/hero-list.component.html" path="reactive-forms/src/app/hero-list/hero-list.component.html">

  </code-pane>

  <code-pane title="src/app/hero-list/hero-list.component.ts" path="reactive-forms/src/app/hero-list/hero-list.component.ts">

  </code-pane>

  <code-pane title="src/app/data-model.ts" path="reactive-forms/src/app/data-model.ts">

  </code-pane>

  <code-pane title="src/app/hero.service.ts" path="reactive-forms/src/app/hero.service.ts">

  </code-pane>

</code-tabs>


<!--
You can download the complete source for all steps in this guide
from the <live-example title="Reactive Forms Demo in Stackblitz">Reactive Forms Demo</live-example> live example.
-->
그리고 이 문서의 다룬 예제의 각 단계별 코드는 <live-example stackblitz="final" title="Reactive Forms (final) in Stackblitz"></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.
