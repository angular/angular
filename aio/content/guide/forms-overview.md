<!--
# Introduction to forms in Angular
-->
# Angular 폼

<!--
Handling user input with forms is the cornerstone of many common applications. Applications use forms to enable users to log in, to update a profile, to enter sensitive information, and to perform many other data-entry tasks.

Angular provides two different approaches to handling user input through forms: reactive and template-driven. Both capture user input events from the view, validate the user input, create a form model and data model to update, and provide a way to track changes.

This guide provides information to help you decide which type of form works best for your situation. It introduces the common building blocks used by both approaches. It also summarizes the key differences between the two approaches, and demonstrates those differences in the context of setup, data flow, and testing.
-->
사용자가 입력한 내용을 폼으로 받아 처리하는 동작은 대부분 앱에서 아주 중요한 기능입니다.
사용자가 로그인하거나 프로필을 수정하는 작업, 개인정보를 입력하거나, 데이터를 다루는 작업 등 입력을 처리할 때 폼을 활용할 수 있습니다.

Angular는 반응형(reactive)과 템플릿 기반(template-driven), 두 가지 방식으로 폼을 제공합니다.
두 방식 모두 사용자가 화면에서 입력한 이벤트를 감지하다가 입력한 내용의 유효성을 검사하며, 폼 모델을 생성하고 데이터 모델에 반영하는 동작을 반복합니다.

이 문서를 보고 나면 어떤 방식으로 폼을 사용할지 결정하는 데에 도움이 될 것입니다.
그리고 두 방식에 모두 사용되는 기본 구성요소에 대해서도 설명합니다.
마지막에는 두 방식의 차이점에 대해 정리해보고, 각 방식으로 구성하는 방법, 데이터 흐름, 테스트 방법에 대해서도 안내합니다.


<!--
## Prerequisites
-->
## 사전지식

<!--
This guide assumes that you have a basic understanding of the following.

* [TypeScript](https://www.typescriptlang.org/docs/home.html "The TypeScript language") and HTML5 programming.

* Angular app-design fundamentals, as described in [Angular Concepts](guide/architecture "Introduction to Angular concepts.").

* The basics of [Angular template syntax](guide/architecture-components#template-syntax "Template syntax intro").
-->
이 가이드 문서를 제대로 이해하려면 이런 내용에 대해 먼저 이해하고 있는 것이 좋습니다.

* [TypeScript](https://www.typescriptlang.org/docs/home.html "The TypeScript language"), HTML5 프로그래밍

* [Angular 개요](guide/architecture "Introduction to Angular concepts.") 문서에서 설명하는 Angular 앱 설계 기본 개념

* [Angular 템플릿 문법](guide/architecture-components#template-syntax "Template syntax intro")에 대한 내용


<!--
## Choosing an approach
-->
## 폼 동작 방식 선택하기

<!--
Reactive forms and template-driven forms process and manage form data differently. Each approach offers different advantages.

* **Reactive forms** provide direct, explicit access to the underlying forms object model. Compared to template-driven forms, they are more robust: they're more scalable, reusable, and testable. If forms are a key part of your application, or you're already using reactive patterns for building your application, use reactive forms.

* **Template-driven forms** rely on directives in the template to create and manipulate the underlying object model. They are useful for adding a simple form to an app, such as an email list signup form. They're easy to add to an app, but they don't scale as well as reactive forms. If you have very basic form requirements and logic that can be managed solely in the template, template-driven forms could be a good fit.
-->
반응형 폼(Reactive form)과 템플릿 기반 폼(template-drive form)은 폼을 처리하는 방법과 데이터를 관리하는 방법이 다릅니다.

* **반응형 폼**은 폼 객체 모델에 직접 명시적으로 접근합니다.
템플릿 기반 폼과 비교해보면 이 방식이 확실히 사용하기 편합니다.
반응형 폼 방식은 확장하기 편하고, 재사용하기 쉬우며, 테스트하기 쉽습니다.
애플리케이션에서 폼이 중요한 역할을 하거나 애플리케이션을 반응형 패턴으로 구성했다면 반응형 폼을 사용하는 것이 좋습니다.

* **템플릿 기반 폼**은 템플릿에 디렉티브를 활용하는 방식이며 객체 모델은 디렉티브가 직접 관리합니다.
이메일을 입력받는 정도로 폼 구성이 간단하다면 템플릿 기반으로도 충분합니다.
하지만 폼 구성이 복잡해지면 반응형 폼처럼 확장하기는 어렵습니다.
구성이 간단한 폼을 템플릿 안에서만 동작하도록 구현하려면 템플릿 기반 폼을 사용하는 것이 좋습니다.


<!--
### Key differences
-->
### 차이점

<!--
The table below summarizes the key differences between reactive and template-driven forms.

<style>
  table {width: 100%};
  td, th {vertical-align: top};
</style>

||Reactive|Template-driven|
|--- |--- |--- |
|[Setup of form model](#setup) | Explicit, created in component class | Implicit, created by directives |
|[Data model](#data-flow-in-forms) | Structured and immutable | Unstructured and mutable |
|Predictability | Synchronous | Asynchronous |
|[Form validation](#validation) | Functions | Directives |
-->
아래 표를 보면서 반응형 폼과 템플릿 기반 폼의 차이점에 대해 확인해 보세요.

<style>
  table {width: 100%};
  td, th {vertical-align: top};
</style>

||반응형 폼|템플릿 기반 폼|
|--- |--- |--- |
|[폼 모델 구성방식](#setup) | 명시적으로 컴포넌트 클래스 안에서 생성 | 디렉티브 내부 로직이 생성 |
|[데이터 모델](#data-flow-in-forms) | 구조가 명확하며 이뮤터블(immutable) | 구조를 파악하기 어려우며 뮤터블(mutable) |
|동작 방식 | 동기 | 비동기 |
|[폼 유효성 검사](#validation) | 함수 | 디렉티브 |


<!--
### Scalability
-->
### 확장성

<!--
If forms are a central part of your application, scalability is very important. Being able to reuse form models across components is critical.

Reactive forms are more scalable than template-driven forms. They provide direct access to the underlying form API, and synchronous access to the form data model, making creating large-scale forms easier.
Reactive forms require less setup for testing, and testing does not require deep understanding of change detection to properly test form updates and validation.

Template-driven forms focus on simple scenarios and are not as reusable.
They abstract away the underlying form API, and provide only asynchronous access to the form data model.
The abstraction of template-driven forms also affects testing.
Tests are deeply reliant on manual change detection execution to run properly, and require more setup.
-->
폼이 애플리케이션에서 중요한 역할을 한다면 폼을 확장할 수 있는지 여부가 아주 중요합니다.
폼 모델을 재사용할 수 있느냐가 최우선 조건일 수도 있습니다.

반응형 폼은 템플릿 기반 폼과 비교했을 때 확장성이 좋습니다.
반응형 폼 방식을 사용하면 폼 API를 사용해서 폼에 직접 접근할 수 있으며, 폼 데이터 모델을 바로 참조할 수 있기 때문에 구성이 복잡한 폼을 만들 때 유리합니다.
그리고 반응형 폼은 유닛 테스트를 적용할 때 구성해야 할 것도 적고, 변화 감지 동작에 의해 폼이 갱신되는 방식이나 유효성 검사에 대해 간단하게만 알아도 쉽게 테스트할 수 있습니다.

반면에 템플릿 기반 폼은 간단한 시나리오에 사용하기에는 적합하지만 재사용하기 어렵습니다.
템플릿 기반 폼을 사용하면 폼 API를 활용할 수 없으며 폼 데이터 모델도 비동기로만 참조할 수 있습니다.
템플릿 기반 폼으로 구성한 컴포넌트를 테스트할 때는 원하는 대로 동작하는 것을 보장하기 위해 변화 감지 로직을 수동으로 실행해야 하며, 테스트 환경을 구성하는 것도 복잡합니다.


{@a setup}

<!--
## Setting up the form model
-->
## 폼 모델 구성하기

<!--
Both reactive and template-driven forms track value changes between the form input elements that users interact with and the form data in your component model.
The two approaches share underlying building blocks, but differ in how you create and manage the common form-control instances.
-->
반응형 폼과 템플릿 기반 폼 모두 사용자가 입력 엘리먼트에 입력한 내용을 추적하고 컴포넌트 모델에 있는 폼 데이터를 갱신합니다.
이 때 두 방식에서 기본 구성 요소를 활용하더라도 사용하는 방식은 조금다릅니다.


<!--
### Common form foundation classes
-->
### 공통으로 사용하는 클래스

<!--
Both reactive and template-driven forms are built on the following base classes.

* `FormControl` tracks the value and validation status of an individual form control.

* `FormGroup` tracks the same values and status for a collection of form controls.

* `FormArray` tracks the same values and status for an array of form controls.

* `ControlValueAccessor` creates a bridge between Angular `FormControl` instances and native DOM elements.
-->
반응형 폼과 템플릿 기반 폼에서 공통으로 활용하는 클래스들은 이런 것들이 있습니다.

* `FormControl`: 개별 폼 컨트롤 값이 변경되는 것을 감지하며 유효성 검사 결과를 관리합니다.

* `FormGroup`: 폼 컨트롤 그룹의 값이 변경되는 것을 감지하며 유효성 검사 결과를 관리합니다.

* `FormArray`: 폼 컨트롤 배열의 값이 변경되는 것을 감지하며 유효성 검사 결과를 관리합니다.

* `ControlValueAccessor`: Angular `FormControl`과 DOM 엘리먼트를 연결하는 역할을 합니다.


{@a setup-the-form-model}

<!--
### Setup in reactive forms
-->
### 반응형 폼 구성하기

<!--
With reactive forms, you define the form model directly in the component class.
The `[formControl]` directive links the explicitly created `FormControl` instance to a specific form element in the view, using an internal value accessor.

The following component implements an input field for a single control, using reactive forms. In this example, the form model is the `FormControl` instance.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.ts">
</code-example>

Figure 1 shows how, in reactive forms, the form model is the source of truth; it provides the value and status of the form element at any given point in time, through the `[formControl]` directive on the input element.

**Figure 1.** *Direct access to forms model in a reactive form.*

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/key-diff-reactive-forms.png" alt="Reactive forms key differences">
</div>
-->
반응형 폼을 구성할 때는 컴포넌트 클래스에 폼 모델을 직접 정의합니다.
`[formControl]` 디렉티브는 화면에 있는 폼 엘리먼트와 `FormControl` 인스턴스를 명시적으로 연결하며, 이 때 내부적으로 값 접근자(value accessor)를 활용합니다.

아래 코드는 반응형 폼을 구성하는 방식으로 입력필드 하나를 정의한 예제 코드입니다.
폼 모델은 `FormControl` 인스턴스입니다.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.ts">
</code-example>

그림1에서 보듯이 반응형 폼은 폼 모델을 데이터 원천 소스로 활용합니다.
그리고 입력 엘리먼트에 `[formControl]` 디렉티브를 적용하면 아무때나 폼 엘리먼트의 값과 유효성 검사 결과를 참조할 수 있습니다.

**그림1** *반응형 폼은 폼 모델에 직접 접근합니다.*

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/key-diff-reactive-forms.png" alt="Reactive forms key differences">
</div>


<!--
### Setup in template-driven forms
-->
### 템플릿 기반 폼 구성하기

<!--
In template-driven forms, the form model is implicit, rather than explicit. The directive `NgModel` creates and manages a `FormControl` instance for a given form element.

The following component implements the same input field for a single control, using template-driven forms.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.ts">
</code-example>

In a template-driven form the source of truth is the template. You do not have direct programmatic access to the `FormControl` instance, as shown in Figure 2.

**Figure 2.** *Indirect access to forms model in a template-driven form.*

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/key-diff-td-forms.png" alt="Template-driven forms key differences">
</div>
-->
템플릿 기반 폼을 구성할 때는 폼 모델을 명시적으로 구성하지 않습니다.
대신, 엘리먼트에 적용된 `NgModel` 디렉티브가 `FormControl`을 내부적으로 생성해서 관리합니다.

아래 코드는 위 예제 코드와 비슷하게 동작하는 폼을 템플릿 기반 폼 방식으로 구성한 예제 코드입니다.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.ts">
</code-example>

템플릿 기반 폼에서 데이터 원천 소스는 템플릿입니다.
그리고 그림2에서 볼 수 있듯이 템플릿 기반 폼에서 만든 `FormControl` 인스턴스에는 직접 접근할 수 없습니다.

**그림2.** *템플릿 기반 폼은 폼 모델에 직접 접근하지 않습니다.*

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/key-diff-td-forms.png" alt="Template-driven forms key differences">
</div>


{@a data-flow-in-forms}

<!--
## Data flow in forms
-->
## 폼 안에서 이동하는 데이터의 흐름

<!--
When an application contains a form, Angular must keep the view in sync with the component model and the component model in sync with the view.
As users change values and make selections through the view, the new values must be reflected in the data model.
Similarly, when the program logic changes values in the data model, those values must be reflected in the view.

Reactive and template-driven forms differ in how they handle data flowing from the user or from programmatic changes.
The following diagrams illustrate both kinds of data flow for each type of form, using the favorite-color input field defined above.
-->
애플리케이션에 폼이 있으면 Angular는 화면에 있는 값과 컴포넌트 모델에 있는 값을 정확하게 동기화해야 합니다.
사용자가 화면에서 값을 변경하면 새로운 값으로 데이터 모델을 갱신해야 하며, 프로그램 로직이 데이터 모델의 값을 변경하면 변경된 값도 화면에 반영되어야 합니다.

반응형 폼과 템플릿 기반 폼은 이런 경우에 데이터를 처리하는 방식이 다릅니다.
구성 방식에 따라 데이터가 어떻게 이동하는지 그림을 보면서 확인해 봅시다.
예제는 이전 섹션에서 살펴봤던 예제와 비슷합니다.


<!--
### Data flow in reactive forms
-->
### 반응형 폼에서 데이터의 흐름

<!--
In reactive forms each form element in the view is directly linked to the form model (a `FormControl` instance). Updates from the view to the model and from the model to the view are synchronous and do not depend on how the UI is rendered.

The view-to-model diagram shows how data flows when an input field's value is changed from the view through the following steps.

1. The user types a value into the input element, in this case the favorite color *Blue*.
1. The form input element emits an "input" event with the latest value.
1. The control value accessor listening for events on the form input element immediately relays the new value to the `FormControl` instance.
1. The `FormControl` instance emits the new value through the `valueChanges` observable.
1. Any subscribers to the `valueChanges` observable receive the new value.

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-vtm.png" alt="Reactive forms data flow - view to model">
</div>

The model-to-view diagram shows how a programmatic change to the model is propagated to the view through the following steps.

1. The user calls the `favoriteColorControl.setValue()` method, which updates the `FormControl` value.
1. The `FormControl` instance emits the new value through the `valueChanges` observable.
1. Any subscribers to the `valueChanges` observable receive the new value.
1. The control value accessor on the form input element updates the element with the new value.

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-mtv.png" alt="Reactive forms data flow - model to view">
</div>
-->
반응형 폼에서는 화면에 있는 개별 폼 엘리먼트가 폼 모델(ex. `FormControl` 인스턴스)과 하나씩 직접 연결됩니다.
그래서 화면에서 변경한 값이 모델에 반영되는 것과 모델에서 변경한 값이 화면에 반영되는 것은 화면이 어떻게 렌더링되는지와는 관계가 없습니다.

화면에 있는 입력 필드 값이 변경되면 이렇게 처리됩니다.

1. 사용자가 입력 엘리먼트에 값을 입력합니다. 이 경우에는 *Blue*를 입력했습니다.
1. 폼 입력 엘리먼트가 변경된 값으로 "input" 이벤트를 발생시킵니다.
1. 폼 입력 엘리먼트에 있는 값 접근자가 이 이벤트를 감지하면 `FormControl` 인스턴스에 새로운 값을 바로 반영합니다.
1. `FormControl` 인스턴스가 `valueChanges` 옵저버블로 새로운 값을 보냅니다.
1. `valueChanges` 옵저버블을 구독하는 구독자가 새 값을 받습니다.

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-vtm.png" alt="Reactive forms data flow - view to model">
</div>

그리고 프로그램 로직으로 모델 값이 변경되면 이렇게 처리됩니다.

1. 사용자가 `favoriteColorControl.setValue()` 메서드를 실행하면 `FormControl` 인스턴스의 값을 변경합니다.
1. `FormControl` 인스턴스가 `valueChanges` 옵저버블로 새로운 값을 보냅니다.
1. `valueChanges` 옵저버블을 구독하는 구독자가 새 값을 받습니다.
1. 폼 입력 엘리먼트에 있는 값 접근자가 새로운 값으로 엘리먼트를 갱신합니다.

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-reactive-forms-mtv.png" alt="Reactive forms data flow - model to view">
</div>


<!--
### Data flow in template-driven forms
-->
### 템플릿 기반 폼에서 데이터의 흐름

템플릿 폼에서는 개별 폼 엘리먼트가 디렉티브와 연결되며 폼 모델은 디렉티브가 내부적으로 관리합니다.

화면에 있는 입력 필드 값이 변경되면 이렇게 처리됩니다.

1. 사용자가 입력 엘리먼트에 *Blue*를 입력합니다.
1. 입력 엘리먼트가 *Blue* 값으로 "input" 이벤트를 발생시킵니다.
1. 입력 엘리먼트에 적용된 값 접근자가 `FormControl` 인스턴스의 `setValue()` 메서드를 실행합니다.
1. `FormControl` 인스턴스가 `valueChanges` 옵저버블로 새로운 값을 보냅니다.
1. `valueChanges` 옵저버블을 구독하는 구독자가 새 값을 받습니다.
1. 값 접근자가 `NgModel.viewToModelUpdate()` 메서드를 실행하면 `ngModelChange` 이벤트가 발생합니다.
1. 컴포넌트 템플릿은 컴포넌트 클래스에 있는 `favoriteColor` 프로퍼티와 양방향으로 바인딩되어 있기 때문에 컴포넌트 `favoriteColor` 프로퍼티가 `ngModelChange` 이벤트로 전달되는 *Blue* 값으로 갱신됩니다.

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-vtm.png" alt="Template-driven forms data flow - view to model" width="100%">
</div>

컴포넌트 프로퍼티 `favoriteColor` 값이 *Blue*에서 *Red*로 변경되면 이렇게 처리됩니다.

1. 컴포넌트에 있는 `favoriteColor` 값이 갱신되었습니다.
1. 변화 감지 로직이 실행됩니다.
1. 변화 감지 로직이 실행되는 동안 `NgModel` 디렉티브 인스턴스에 있는 `ngOnChanges` 라이프싸이클 후킹 함수가 실행됩니다. 이 디렉티브에 바인딩되는 입력값이 변경되었기 때문입니다.
1. `ngOnChanges()` 메서드가 디렉티브 내부에 있는 `FormControl` 인스턴스 값을 변경하는 비동기 태스크를 큐에 넣습니다.
1. 변화 감지 로직이 끝납니다.
1. 다음 실행 싸이클에 `FormControl` 인스턴스 값을 변경하는 태스크가 실행됩니다.
1. `FormControl` 인스턴스가 `valueChanges` 옵저버블로 새로운 값을 보냅니다.
1. `valueChanges` 옵저버블을 구독하는 구독자가 새로운 값을 받습니다.
1. 화면에서 폼 입력 엘리먼트에 있는 값 접근자가 새로운 값으로 `favoriteColor` 값을 갱신합니다.

<div class="lightbox">
  <img src="generated/images/guide/forms-overview/dataflow-td-forms-mtv.png" alt="Template-driven forms data flow - model to view" width="100%">
</div>


<!--
### Mutability of the data model
-->
### 데이터 모델의 불변성

<!--
The change-tracking method plays a role in the efficiency of your application.

* **Reactive forms** keep the data model pure by providing it as an immutable data structure.
Each time a change is triggered on the data model, the `FormControl` instance returns a new data model rather than updating the existing data model.
This gives you the ability to track unique changes to the data model through the control's observable.
Change detection is more efficient because it only needs to update on unique changes.
Because data updates follow reactive patterns, you can integrate with observable operators to transform data.

* **Template-driven** forms rely on mutability with two-way data binding to update the data model in the component as changes are made in the template.
Because there are no unique changes to track on the data model when using two-way data binding, change detection is less efficient at determining when updates are required.

The difference is demonstrated in the previous examples that use the favorite-color input element.

* With reactive forms, the **`FormControl` instance** always returns a new value when the control's value is updated.

* With template-driven forms, the **favorite color property** is always modified to its new value.
-->
변화를 추적하는 메서드는 이런 역할을 합니다.

* **반응형 폼**은 이뮤터블 데이터 구조를 활용해서 데이터 모델을 변하지 않도록 유지합니다.
그래서 데이터 모델에서 값이 변경된 이벤트가 발생할 때마다 `FormControl` 인스턴스는 기존 데이터 모델을 변경하지 않고 새로운 데이터 모델을 반환합니다.
이 데이터 모델은 옵저버블로 전달되기 때문에 값이 실제로 변경된 것만 골라서 추적할 수 있습니다.
그리고 전체 필드 중에서 특정 필드가 변경된 것을 감지하는 방식으로도 활용할 수 있습니다.
데이터가 반응형 패턴으로 전달되기 때문에 옵저버블 연산자를 활용해서 자유롭게 조작할 수도 있습니다.

* **템플릿 기반 폼**은 데이터 모델과 컴포넌트가 양방향으로 데이터 바인딩되기 때문에 템플릿에서 발생하는 변경사항은 모두 뮤터블로 처리됩니다.
그래서 실제로 데이터 모델이 변경되지 않아도 바인딩된 데이터가 전달되며, 변화 감지 로직만으로는 실제로 값이 변경되었는지 판단하기 어렵습니다.

이런 차이점은 이전 섹션에서 살펴봤던 예제로도 확인할 수 있습니다.

* 반응형 폼에서는 폼 컨트롤의 값이 변경되었을 때만 **`FormControl` 인스턴스**가 새로운 값을 반환합니다.

* 템플릿 기반 폼에서는 **favorite-color** 프로퍼티 값이 항상 새로운 값으로 사용됩니다.


{@a validation}

<!--
## Form validation
-->
## 폼 유효성 검사

<!--
Validation is an integral part of managing any set of forms. Whether you're checking for required fields or querying an external API for an existing username, Angular provides a set of built-in validators as well as the ability to create custom validators.

* **Reactive forms** define custom validators as **functions** that receive a control to validate.
* **Template-driven forms** are tied to template **directives**, and must provide custom validator directives that wrap validation functions.

For more information, see [Form Validation](guide/form-validation).
-->
폼 유효성 검사는 폼 전체를 종합해서 관리하는 단계입니다.
필수 입력 필드에 값이 입력되었는지, 백엔드 API를 활용해서 사용자 이름이 서버에 존재하는지 등과 같은 검사 로직은 Angular가 제공하는 기본 유효성 검사기나 커스텀 유효성 검사기를 정의해서 적용할 수 있습니다.

* **반응형 폼**에 적용할 커스텀 유효성 검사기를 구현하려면 **함수**를 사용합니다.

* **템플릿 기반 폼**은 템플릿 **디렉티브**와 직접 연결되어 있기 때문에, 커스텀 유효성 검사기를 구현하려면 유효성 검사 함수를 디렉티브로 랩핑해야 합니다.

자세한 내용은 [폼 유효성 검사](guide/form-validation) 문서를 참고하세요.


<!--
## Testing
-->
## 테스트

<!--
Testing plays a large part in complex applications. A simpler testing strategy is useful when validating that your forms function correctly.
Reactive forms and template-driven forms have different levels of reliance on rendering the UI to perform assertions based on form control and form field changes.
The following examples demonstrate the process of testing forms with reactive and template-driven forms.
-->
애플리케이션이 복잡할수록 테스트의 중요성이 커집니다.
그리고 이런 경우에도 폼 기능이 제대로 동작하는지만 간단하게 검사하는 방식을 활용하는 것이 좋습니다.
반응형 폼과 템플릿 기반 폼은 폼 컨트롤 상태나 폼 필드 값을 검증하는 방식이 다릅니다.
좀 더 정확하게 이야기하면, 화면 렌더링과 엮여있는 정도가 다르기 때문에 테스트하는 방식도 다릅니다.


<!--
### Testing reactive forms
-->
### 반응형 폼 테스트하기

<!--
Reactive forms provide a relatively easy testing strategy because they provide synchronous access to the form and data models, and they can be tested without rendering the UI.
In these tests, status and data are queried and manipulated through the control without interacting with the change detection cycle.

The following tests use the favorite-color components from previous examples to verify the view-to-model and model-to-view data flows for a reactive form.

**Verifying view-to-model data flow**

The first example performs the following steps to verify the view-to-model data flow.

1. Query the view for the form input element, and create a custom "input" event for the test.
1. Set the new value for the input to *Red*, and dispatch the "input" event on the form input element.
1. Assert that the component's `favoriteColorControl` value matches the value from the input.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="Favorite color test - view to model">
</code-example>

The next example performs the following steps to verify the model-to-view data flow.

1. Use the `favoriteColorControl`, a `FormControl` instance, to set the new value.
1. Query the view for the form input element.
1. Assert that the new value set on the control matches the value in the input.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="Favorite color test - model to view">
</code-example>
-->
반응형 폼은 폼과 데이터 모델에 직접 접근할 수 있기 때문에 테스트를 적용하기도 쉽고 화면 렌더링을 신경쓰지 않아도 됩니다.
그리고 테스트 스펙 안에서는 변화 감지 로직이 따로 실행되지 않아도 폼 컨트롤이 저장하고 있는 데이터를 직접 참조하고 조작할 수 있습니다.

아래 코드는 이전 반응형 폼 섹션에서 살펴봤던 `favorite-color` 컴포넌트가 화면에서 모델 방향으로, 모델에서 화면 방향으로 잘 연결되었는지 검사하는 테스트 코드입니다.


**화면에서 모델로 데이터가 반영되는 것 검사하기**

화면에서 모델로 데이터가 반영되는 것을 검사하는 과정은 이렇습니다.

1. 화면에서 폼 입력 엘리먼트를 참조하고 "input" 이벤트를 임의로 발생시킵니다.
1. 입력 엘리먼트의 값을 *Red*로 변경하고 이 값으로 "input" 이벤트를 발생시킵니다.
1. 컴포넌트의 `favoriteColorControl` 값이 갱신되었는지 확인합니다.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="테스트 - 화면에서 모델로 반영">
</code-example>

그리고 모델에서 화면으로 데이터가 반영되는 것을 검사하는 과정은 이렇습니다.

1. `FormControl` 인스턴스 `favoriteColorControl`에 새 값을 지정합니다.
1. 화면에서 폼 입력 엘리먼트를 참조합니다.
1. 입력 엘리먼트의 값이 갱신되었는지 확인합니다.

<code-example path="forms-overview/src/app/reactive/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="테스트 - 모델에서 화면으로 반영">
</code-example>


<!--
### Testing template-driven forms
-->
### 템플릿 기반 폼 테스트하기

<!--
Writing tests with template-driven forms requires a detailed knowledge of the change detection process and an understanding of how directives run on each cycle to ensure that elements are queried, tested, or changed at the correct time.

The following tests use the favorite color components mentioned earlier to verify the data flows from view to model and model to view for a template-driven form.

The following test verifies the data flow from view to model.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="Favorite color test - view to model">
</code-example>

Here are the steps performed in the view to model test.

1. Query the view for the form input element, and create a custom "input" event for the test.
1. Set the new value for the input to *Red*, and dispatch the "input" event on the form input element.
1. Run change detection through the test fixture.
1. Assert that the component `favoriteColor` property value matches the value from the input.

The following test verifies the data flow from model to view.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="Favorite color test - model to view">
</code-example>

Here are the steps performed in the model to view test.

1. Use the component instance to set the value of the `favoriteColor` property.
1. Run change detection through the test fixture.
1. Use the `tick()` method to simulate the passage of time within the `fakeAsync()` task.
1. Query the view for the form input element.
1. Assert that the input value matches the value of the `favoriteColor` property in the component instance.
-->
반응형 폼에 테스트를 적용하려면 변화 감지 로직과 디렉티브가 동작하는 과정을 확실하게 알아야 정확한 시점에 엘리먼트를 참조하고, 테스트하고, 변경할 수 있습니다.

이번 섹션에서는 이전 섹션에서 살펴봤던 템플릿 폼을 대상으로 화면에서 모델로 데이터가 반영되고, 모델에서 화면으로 데이터가 변경되는 것을 어떻게 테스트할 수 있는지 알아봅시다.

화면에서 모델로 데이터가 반영되는 것을 검사하는 코드는 이렇습니다.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="view-to-model" header="테스트 - 화면에서 모델로">
</code-example>

이 코드는 이런 순서로 실행됩니다.

1. 화면에서 폼 입력 엘리먼트를 참조하고 커스텀 "input" 이벤트를 발생시킵니다.
1. 입력 엘리먼트의 값을 *Red*로 변경하고 폼 입력 엘리먼트에 "input" 이벤트를 발생시킵니다.
1. 테스트 픽스쳐에서 변화 감지 로직을 실행합니다.
1. 컴포넌트 프로퍼티 `favoriteColor`가 갱신되었는지 확인합니다.

그리고 모델에서 화면으로 데이터가 반영되는 것을 검사하는 코드는 이렇습니다.

<code-example path="forms-overview/src/app/template/favorite-color/favorite-color.component.spec.ts" region="model-to-view" header="테스트 - 모델에서 화면으로">
</code-example>

그리고 모델에서 화면으로 데이터가 반영되는 것을 검사하는 과정은 이렇게 실행됩니다.

1. 컴포넌트 프로퍼티 `favoriteColor` 값을 변경합니다.
1. 테스트 픽스쳐에서 변화 감지 로직을 실행합니다.
1. 시간이 지난 것을 시뮬레이션하기 위해 `fakeAsync()` 안에서 `tick()`를 실행합니다.
1. 화면에서 폼 입력 엘리먼트를 참조합니다.
1. 입력 엘리먼트의 값이 컴포넌트 프로퍼티 `favoriteColor` 값과 같은지 확인합니다.


<!--
## Next steps
-->
## 다음 단계

<!--
To learn more about reactive forms, see the following guides:

* [Reactive forms](guide/reactive-forms)
* [Form validation](guide/form-validation#reactive-form-validation)
* [Dynamic forms](guide/dynamic-form)

To learn more about template-driven forms, see the following guides:

* [Building a template-driven form](guide/forms) tutorial
* [Form validation](guide/form-validation#template-driven-validation)
* `NgForm` directive API reference
-->
반응형 폼에 대해 더 알아보려면 이 문서들을 참고하세요:

* [반응형 폼](guide/reactive-forms)
* [폼 유효성 검사하기](guide/form-validation#reactive-form-validation)
* [동적 폼](guide/dynamic-form)

그리고 템플릿 기반 폼에 대해 더 알아보려면 이 문서들을 참고하세요:

* [템플릿 기반 폼 구성하기](guide/forms) 튜토리얼
* [폼 유효성 검사하기](guide/form-validation#template-driven-validation)
* `NgForm` 디렉티브 API 문서
