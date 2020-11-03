<!--
# Validating form input
-->
# 폼 유효성 검사

<!--
You can improve overall data quality by validating user input for accuracy and completeness.
This page shows how to validate user input from the UI and display useful validation messages,
in both reactive and template-driven forms.

**Prerequisites**

Before reading about form validation, you should have a basic understanding of the following.

* [TypeScript](https://www.typescriptlang.org/docs/home.html "The TypeScript language") and HTML5  programming.

* Fundamental concepts of [Angular app design](guide/architecture "Introduction to Angular app-design concepts").

* The [two types of forms that Angular supports](guide/forms-overview "Introduction to Angular forms").

* Basics of either [Template-driven Forms](guide/forms "Template-driven forms guide") or [Reactive Forms](guide/reactive-forms "Reactive forms guide").

<div class="alert is-helpful">

Get the complete example code for the reactive and template-driven forms used here to illustrate form validation.
Run the <live-example></live-example>.

</div>
-->
애플리케이션에 폼을 구성할 때는 사용자가 필수 항목을 입력했는지, 입력된 데이터는 올바른지 검증해야 합니다.
이 문서는 반응형 폼이나 템플릿 기반 폼에서 사용자가 입력한 내용을 검증하고 유효성 검사 결과를 화면에 표시하는 방법에 대해 다룹니다.


**사전지식**

폼 유효성 검사에 대해 알아보기 전에 이런 내용을 먼저 이해하는 것이 좋습니다.

* [TypeScript](https://www.typescriptlang.org/docs/home.html "The TypeScript language"), HTML5 사용방법

* [Angular 개요](guide/architecture "Introduction to Angular app-design concepts") 문서에서 다루는 기본 개념

* [Angular가 제공하는 두 가지 폼 방식](guide/forms-overview "Introduction to Angular forms")

* [템플릿 기반 폼](guide/forms "Template-driven forms guide")이나 [반응형 폼](guide/reactive-forms "Reactive forms guide")에 대한 지식

<div class="alert is-helpful">

이 문서에서 다루는 내용은 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


{@a template-driven-validation}

<!--
##  Validating input in template-driven forms
-->
## 템플릿 기반 폼 유효성 검사

<!--
To add validation to a template-driven form, you add the same validation attributes as you
would with [native HTML form validation](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation).
Angular uses directives to match these attributes with validator functions in the framework.

Every time the value of a form control changes, Angular runs validation and generates
either a list of validation errors that results in an INVALID status, or null, which results in a VALID status.

You can then inspect the control's state by exporting `ngModel` to a local template variable.
The following example exports `NgModel` into a variable called `name`:

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="name-with-error-msg" header="template/hero-form-template.component.html (name)"></code-example>

Notice the following features illustrated by the example.

* The `<input>` element carries the HTML validation attributes: `required` and `minlength`. It
also carries a custom validator directive, `forbiddenName`. For more
information, see the [Custom validators](#custom-validators) section.

* `#name="ngModel"` exports `NgModel` into a local variable called `name`. `NgModel` mirrors many of the properties of its underlying
`FormControl` instance, so you can use this in the template to check for control states such as `valid` and `dirty`. For a full list of control properties, see the [AbstractControl](api/forms/AbstractControl)
API reference.

   * The `*ngIf` on the `<div>` element reveals a set of nested message `divs`
but only if the `name` is invalid and the control is either `dirty` or `touched`.

   * Each nested `<div>` can present a custom message for one of the possible validation errors.
There are messages for `required`, `minlength`, and `forbiddenName`.

{@a dirty-or-touched}

<div class="alert is-helpful">

To prevent the validator from displaying errors before the user has a chance to edit the form, you should check for either the `dirty` or `touched` states in a control.

* When the user changes the value in the watched field, the control is marked as "dirty".
* When the user blurs the form control element, the control is marked as "touched".

</div>
-->
템플릿 기반 폼의 유효성을 검사를 적용하려면 [기본 HTML 폼에서 유효성을 검사](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation)했던 것처럼 유효성 검사 어트리뷰트를 추가하면 됩니다.
폼에 이런 어트리뷰트를 사용하면 Angular가 적절한 디렉티브를 매칭해서 유효성을 검사합니다.

Angular는 폼 컨트롤의 값이 바뀔 때마다 유효성 검사 로직을 실행하고 검사 결과를 반환하는데, INVALID 상태일 때는 에러 목록을 반환하며 VALID 상태일 때는 null을 반환합니다.

이 때 개발자는 `ngModel`로 폼 컨트롤의 상태를 참조할 수 있습니다.
아래 예제 코드는 `name` 변수와 연결된 `NgModel`로 유효성을 검사하는 예제 코드입니다:

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="name-with-error-msg" header="template/hero-form-template.component.html (name)"></code-example>

이 예제 코드를 보면서 이런 내용을 확인해 보세요.

* `<input>` 엘리먼트에는 HTML 유효성 검사 어트리뷰트 `required`와 `minLength`가 사용되었습니다.
그리고 커스텀 유효성 검사 디렉티브 `forbiddenName`도 사용되었습니다.
커스텀 유효성 검사기에 대해 자세하게 알아보려면 [커스텀 유효성 검사기](#custom-validators) 섹션을 참고하세요.

* 템플릿에서 `#name="ngModel`라고 작성하면 폼 컨트롤에 적용된 `NgModel` 디렉티브가 템플릿 지역 변수(template local variable) `name`에 할당됩니다.
`NgModel`은 `FormControl` 인스턴스의 상태를 관리하기 때문에 `NgModel`이 적용된 `name` 변수에 접근하면 `valid`나 `dirty`와 같은 폼 컨트롤 상태를 참조할 수 있습니다.
폼 컨트롤이 제공하는 기능을 모두 살펴보려면 [AbstractControl API 문서](api/forms/AbstractControl)를 참고하세요.

   * `<div>` 엘리먼트에 사용된 `*ngIf`는 `name`으로 연결된 폼 컨트롤의 상태에 따라 관련된 메시지를 화면에 표시합니다.

   * 폼에서 발생할 수 있는 에러에 해당되는 `<div>` 엘리먼트를 몇 개 추가했습니다.
   	이 메시지는 `required`, `minLength`, `forbiddenName` 에러가 발생할 때 각각 표시됩니다.


{@a dirty-or-touched}

<div class="alert is-helpful">

사용자가 폼 컨트롤에 아무것도 입력하지 않았는데도 화면에 에러가 표시되는 것을 방지하려면 폼 컨트롤 상태 중 `dirty`나 `touched`를 활용하는 것이 좋습니다.

* 사용자가 입력 필드의 값을 변경하면 폼 컨트롤이 `dirty` 상태가 됩니다.
* 사용자가 폼 컨트롤에 접근했다가 포커스를 다른 곳으로 옮기면 폼 컨트롤이 `touched` 상태가 됩니다.

</div>


{@a reactive-form-validation}

<!--
## Validating input in reactive forms
-->
## 반응형 폼 유효성 검사

<!--
In a reactive form, the source of truth is the component class.
Instead of adding validators through attributes in the template, you add validator functions directly to the form control model in the component class.
Angular then calls these functions whenever the value of the control changes.
-->
반응형 폼에서는 컴포넌트 클래스가 데이터의 원천입니다.
그래서 템플릿에 어트리뷰트를 적용하는 방식을 사용하지 않고 컴포넌트 클래스에서 폼 컨트롤 모델을 정의할 때 직접 유효성 검사 함수를 적용합니다.
이 경우에도 폼 컨트롤의 값이 변경되면 유효성 검사 함수가 자동으로 실행됩니다.


<!--
### Validator functions
-->
### 유효성 검사 함수

<!--
Validator functions can be either synchronous or asynchronous.

* **Sync validators**: Synchronous functions that take a control instance and immediately return either a set of validation errors or `null`. You can pass these in as the second argument when you instantiate a `FormControl`.

* **Async validators**: Asynchronous functions that take a control instance and return a Promise
or Observable that later emits a set of validation errors or `null`. You can
pass these in as the third argument when you instantiate a `FormControl`.

For performance reasons, Angular only runs async validators if all sync validators pass. Each must complete before errors are set.
-->
유효성 검사 함수는 동기/비동기 방식으로 동작합니다.

* **동기 유효성 검사 함수**: 폼 컨트롤 인스턴스에 접근해서 유효성을 검사한 뒤 에러나 `null`을 동기 방식으로 반환하는 함수입니다.
동기 유효성 검사 함수는 `FormControl`을 구성할 때 두 번째 인자에 지정합니다.

* **비동기 유효성 검사 함수**: 폼 컨트롤 인스턴스에 접근해서 유효성을 검사한 뒤 에러나 `null` 값을 Promise나 Observable 형태로 반환하는 함수입니다.
비동기 유효성 검사 함수는 `FormControl`을 구성할 때 세 번째 인자에 지정합니다.

 Angular는불필요한 성능 저하를 막기 위해 동기 유효성 검사 함수가 모두 성공했을 때만 비동기 유효성 검사 함수를 실행합니다.


<!--
### Built-in validator functions
-->
### 기본 유효성 검사 함수

<!--
You can choose to [write your own validator functions](#custom-validators), or you can use some of Angular's built-in validators.

The same built-in validators that are available as attributes in template-driven forms, such as `required` and `minlength`, are all available to use as functions from the `Validators` class.
For a full list of built-in validators, see the [Validators](api/forms/Validators) API reference.

To update the hero form to be a reactive form, you can use some of the same
built-in validators&mdash;this time, in function form, as in the following example.

{@a reactive-component-class}

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.1.ts" region="form-group" header="reactive/hero-form-reactive.component.ts (validator functions)"></code-example>

In this example, the `name` control sets up two built-in validators&mdash;`Validators.required` and `Validators.minLength(4)`&mdash;and one custom validator, `forbiddenNameValidator`. (For more details see [custom validators](#custom-validators) below.)

All of these validators are synchronous, so they are passed as the second argument. Notice that you can support multiple validators by passing the functions in as an array.

This example also adds a few getter methods. In a reactive form, you can always access any form control through the `get` method on its parent group, but sometimes it's useful to define getters as shorthand for the template.

If you look at the template for the `name` input again, it is fairly similar to the template-driven example.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="name-with-error-msg" header="reactive/hero-form-reactive.component.html (name with error msg)"></code-example>

This form differs from the template-driven version in that it no longer exports any directives. Instead, it uses the `name` getter defined in  the component class.

Notice that the `required` attribute is still present in the template. Although it's not necessary for validation, it should be retained to for accessibility purposes.
-->
반응형 폼에서는 Angular가 제공하는 기본 유효성 검사 함수를 사용하거나 [커스텀 유효성 검사 함수](#custom-validators)를 정의해서 사용할 수 있습니다.

템플릿 기반 폼에서 어트리뷰트로 적용하던 `required`나 `minLength`와 같은 기본 유효성 검사 함수는 Angular가 `Validators` 클래스로 제공합니다.
기본 유효성 검사 함수 전체 목록을 확인하려면 [Validators API 문서](api/forms/Validators)를 참고하세요.

히어로 폼을 반응형 폼으로 만들려면 아래 코드처럼 유효성 검사 함수를 적용하면 됩니다.

{@a reactive-component-class}

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.1.ts" region="form-group" header="reactive/hero-form-reactive.component.ts (유효성 검사 함수)"></code-example>

이 예제 코드에서 `name` 폼 컨트롤에는 `Validators.required`와 `Validators.minLength(4)` 기본 유효성 검사 함수, `forbiddenNameValidator` 커스텀 유효성 검사 함수가 지정되었습니다.
커스텀 유효성 검사 함수에 대해 자세하게 알아보려면 아래 [커스텀 유효성 검사 함수](#custom-validators) 섹션을 참고하세요.

이 유효성 검사 함수들은 모두 동기 방식으로 동작하기 때문에 `FormControl`을 구성하면서 두 번째 인자로 지정했습니다.
두 번째 인자에 배열을 사용하면 유효성 검사 함수를 여러개 지정할 수 있습니다.

그리고 이 예제 코드에는 게터(getter) 메서드가 몇 개 더 있습니다.
반응형 폼에서는 폼 컨트롤에 접근할 때 부모 그룹에 있는 `get()` 메서드를 사용해야 하기 때문에, 템플릿에서 폼 컨트롤을 활용하려면 게터 메서드를 정의해두는 것이 좋습니다.

이제 템플릿에 있는 `name` 입력 필드 값이 변경되었을 때 템플릿 기반 폼 때와 비슷한 결과가 표시되도록 만들어 봅시다.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="name-with-error-msg" header="reactive/hero-form-reactive.component.html (name 입력 필드와 에러 메시지)"></code-example>

코드를 보면, 이 예제 코드는 템플릿 기반 폼 때처럼 디렉티브로 폼 컨트롤에 접근하지 않습니다.
반응형 폼은 디렉티브 대신 컴포넌트 클래스에 정의한 `name` 게터 메서드를 사용합니다.

그런데 템플릿에 여전히 `required` 어트리뷰트가 지정되어 있는 것을 확인해 보세요.
이 어트리뷰트는 반응형 폼이 동작할 때는 유효하지 않지만 접근성 관련 기능을 제공하려면 남겨둬야 합니다.


{@a custom-validators}

<!--
## Defining custom validators
-->
## 커스텀 유효성 검사 함수 정의하기

<!--
The built-in validators don't always match the exact use case of your application, so you sometimes need to create a custom validator.

Consider the `forbiddenNameValidator` function from previous [reactive-form examples](#reactive-component-class).
Here's what the definition of that function looks like.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="custom-validator" header="shared/forbidden-name.directive.ts (forbiddenNameValidator)"></code-example>

The function is a factory that takes a regular expression to detect a _specific_ forbidden name and returns a validator function.

In this sample, the forbidden name is "bob", so the validator will reject any hero name containing "bob".
Elsewhere it could reject "alice" or any name that the configuring regular expression matches.

The `forbiddenNameValidator` factory returns the configured validator function.
That function takes an Angular control object and returns _either_
null if the control value is valid _or_ a validation error object.
The validation error object typically has a property whose name is the validation key, `'forbiddenName'`,
and whose value is an arbitrary dictionary of values that you could insert into an error message, `{name}`.

Custom async validators are similar to sync validators, but they must instead return a Promise or observable that later emits null or a validation error object.
In the case of an observable, the observable must complete, at which point the form uses the last value emitted for validation.
-->
기본 유효성 검사 함수만으로 충분하지 않은 경우에는 커스텀 유효성 검사 함수를 정의할 수도 있습니다.

이전 섹션 [반응형 폼 예제](#reactive-component-class)에 사용된 `forbiddenNameValidator` 함수를 살펴봅시다.
이 함수는 이렇게 정의되어 있습니다.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="custom-validator" header="shared/forbidden-name.directive.ts (forbiddenNameValidator)"></code-example>

이 함수는 정규표현식을 활용해서 어떤 이름을 사용할 수 있는지 검사하고 그 결과를 반환하는 함수입니다.

그래서 위 예제 코드처럼 유효성 검사 함수를 사용하면서 "bob"을 지정하면 히어로 이름에 "bob"이 들어갔을 때 에러를 반환합니다.
"alice"라는 이름을 사용할 수 없도록 지정할 수도 있습니다.

`forbiddenNameValidator` 함수는 인자로 받은 정규 표현식을 실행하는 유효성 검사 함수를 반환합니다.
그래서 이 함수는 인자로 받는 Angular 폼 객체를 검사한 후에 유효성 검사를 통과하면 `null`을 반환하고 유효성 검사를 통과하지 않으면 에러 객체를 반환합니다.
이 때 에러 객체는 일반적으로 유효성 검사 함수 이름을 키로 지정합니다.
그래서 위 예제 코드의 경우에는 `forbiddenName`을 사용했습니다.

커스텀 비동기 유효성 검사 함수도 동기 유효성 검사 함수와 비슷하지만, 비동기 유효성 검사 함수는 반드시 Promise나 Observable에 `null`이나 에러 객체를 실어서 반환합니다.
옵저버블을 반환한다면 이 옵저버블은 폼 유효성 검사가 모두 끝나기 전에 반드시 종료되어야 합니다.


{@a adding-to-reactive-forms}

<!--
### Adding custom validators to reactive forms
-->
### 반응형 폼에 커스텀 유효성 검사 함수 적용하기

<!--
In reactive forms, add a custom validator by passing the function directly to the `FormControl`.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.1.ts" region="custom-validator" header="reactive/hero-form-reactive.component.ts (validator functions)"></code-example>
-->
반응형 폼에서는 `FormControl`에 커스텀 유효성 검사 함수를 직접 지정합니다.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.1.ts" region="custom-validator" header="reactive/hero-form-reactive.component.ts (유효성 검사 함수)"></code-example>


{@a adding-to-template-driven-forms}

<!--
### Adding custom validators to template-driven forms
-->
### 템플릿 기반 폼에 커스텀 유효성 검사 함수 적용하기

<!--
In template-driven forms, add a directive to the template, where the directive wraps the validator function.
For example, the corresponding `ForbiddenValidatorDirective` serves as a wrapper around the `forbiddenNameValidator`.

Angular recognizes the directive's role in the validation process because the directive registers itself with the `NG_VALIDATORS` provider, as shown in the following example.
`NG_VALIDATORS` is a predefined provider with an extensible collection of validators.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive-providers" header="shared/forbidden-name.directive.ts (providers)"></code-example>

The directive class then implements the `Validator` interface, so that it can easily integrate
with Angular forms.
Here is the rest of the directive to help you get an idea of how it all
comes together.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive" header="shared/forbidden-name.directive.ts (directive)">
</code-example>

Once the `ForbiddenValidatorDirective` is ready, you can add its selector, `appForbiddenName`, to any input element to activate it.
For example:

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="name-input" header="template/hero-form-template.component.html (forbidden-name-input)"></code-example>


<div class="alert is-helpful">

Notice that the custom validation directive is instantiated with `useExisting` rather than `useClass`. The registered validator must be _this instance_ of
the `ForbiddenValidatorDirective`&mdash;the instance in the form with
its `forbiddenName` property bound to “bob".

If you were to replace `useExisting` with `useClass`, then you’d be registering a new class instance, one that doesn’t have a `forbiddenName`.

</div>
-->
템플릿 기반 폼에서는 템플릿에 디렉티브를 적용하는 방식으로 사용해야 하기 때문에 유효성 검사 함수를 디렉티브로 랩핑해야 합니다.
그래서 `forbiddenNameValidator`는 `ForbiddenValidatorDirective`와 같이 변환해야 사용할 수 있습니다.

유효성 검사 디렉티브는 디렉티브 자체에서 `NG_VALIDATORS` 프로바이더를 등록하기 때문에 Angular는 이 디렉티브가 폼 유효성 검사에 사용되는 디렉티브라는 것을 인식할 수 있습니다.
`NG_VALIDATORS`는 기본 유효성 검사 목록을 확장할 때 사용하는 프로바이더입니다.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive-providers" header="shared/forbidden-name.directive.ts (providers)"></code-example>

유효성 검사 디렉티브 클래스는 Angular 폼과 자연스럽게 어울려 동작하기 위해 `Validator` 인터페이스를 기반으로 구현합니다.
`forbiddenNameValidator`를 디렉티브 클래스로 랩핑한 코드는 이렇습니다.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive" header="shared/forbidden-name.directive.ts (디렉티브)">
</code-example>

`ForbiddenValidatorDirective`를 한 번 정의하고 나면 디렉티브 셀렉터 `appForbiddenName`를 입력 엘리먼트에 추가하면 해당 엘리먼트에 유효성 검사 함수를 적용할 수 있습니다:

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="name-input" header="template/hero-form-template.component.html (유효성 검사 함수 적용하기)"></code-example>


<div class="alert is-helpful">

커스텀 유효성 검사 디렉티브 인스턴스를 생성할 때 `useClass`를 사용하지 않고 `useExisting`을 사용했습니다.
그래서 `ForbiddenValidatorDirective`의 인스턴스는 폼에서 "bob"를 바인딩할때 사용된 `forbiddenName` 인스턴스와 같습니다.

이 때 `useExisting`대신 `useClass`를 사용하면 새로운 클래스 인스턴스가 생성되기 때문에 `forbiddenName`에 적용된 디렉티브 인스턴스와 연결되지 않습니다.

</div>


<!--
## Control status CSS classes
-->
## CSS 클래스 활용하기

<!--
Angular automatically mirrors many control properties onto the form control element as CSS classes. You can use these classes to style form control elements according to the state of the form.
The following classes are currently supported.

* `.ng-valid`
* `.ng-invalid`
* `.ng-pending`
* `.ng-pristine`
* `.ng-dirty`
* `.ng-untouched`
* `.ng-touched`

In the following example, the hero form uses the `.ng-valid` and `.ng-invalid` classes to
set the color of each form control's border.

<code-example path="form-validation/src/assets/forms.css" header="forms.css (status classes)">

</code-example>
-->
Angular는 폼 컨트롤의 상태에 따라 폼 컨트롤 엘리먼트에 CSS 클래스를 자동으로 지정합니다.
그래서 이 클래들을 활용하면 폼 컨트롤 상태에 따라 스타일을 다르게 지정할 수 있습니다.
Angular는 이런 클래스들을 자동으로 지정합니다.

* `.ng-valid`
* `.ng-invalid`
* `.ng-pending`
* `.ng-pristine`
* `.ng-dirty`
* `.ng-untouched`
* `.ng-touched`

아래 예제는 히어로 폼에 자동으로 지정되는 `.ng-valid`, `.ng-invalid` 클래스를 활용해서 폼 컨트롤의 외곽선을 변경하는 예제 코드입니다.

<code-example path="form-validation/src/assets/forms.css" header="forms.css (폼 상태에 자동으로 지정되는 클래스)">
</code-example>


<!--
## Cross-field validation
-->
## 연관 필드 유효성 검사

<!--
A cross-field validator is a [custom validator](#custom-validators "Read about custom validators") that compares the values of different fields in a form and accepts or rejects them in combination.
For example, you might have a form that offers mutually incompatible options, so that if the user can choose A or B, but not both.
Some field values might also depend on others; a user might be allowed to choose B only if A is also chosen.

The following cross validation examples show how to do the following:

* Validate reactive or template-based form input based on the values of two sibling controls,
* Show a descriptive error message after the user interacted with the form and the validation failed.

The examples use cross-validation to ensure that heroes do not reveal their true identities by filling out the Hero Form. The validators do this by checking that the hero names and alter egos do not match.
-->
연관 필드 유효성 검사(cross-field validation)는 [커스텀 유효성 검사 함수](#custom-validators "Read about custom validators")를 활용해서 폼에 존재하는 필드 여러개를 함께 검토하는 것을 의미합니다.
서로 배타적인 옵션이 있다고 하면, A나 B는 선택할 수 있지만 A와 B를 함께 선택하는 것은 막아야 하는 조건이 이런 경우에 해당됩니다.
어떤 필드는 다른 필드에 종속된 경우도 있습니다.
사용자가 A 필드를 먼저 설정한 후에 B를 골라야 하는 경우가 그렇습니다.

예제를 보면서 이런 내용에 대해 알아봅시다:

* 반응형 폼/템플릿 기반 폼에서 연관된 폼 컨트롤 두개를 함께 검사해 봅시다.
* 사용자가 입력한 값이 유효성 검사를 통과하지 못했을 때 에러 메시지를 표시해 봅시다.

이번에 다룰 예제는 히어로가 자신의 진짜 정체를 폼에 작성하지 못하게 하는 것입니다.
이 동작은 히어로의 이름과 별명을 다르게 입력해야 하는 조건으로 구현해 봅시다.


<!--
### Adding cross-validation to reactive forms
-->
### 반응형 폼에 연관 필드 유효성 검사 적용하기

<!--
The form has the following structure:

```javascript
const heroForm = new FormGroup({
  'name': new FormControl(),
  'alterEgo': new FormControl(),
  'power': new FormControl()
});
```

Notice that the `name` and `alterEgo` are sibling controls.
To evaluate both controls in a single custom validator, you must perform the validation in a common ancestor control: the `FormGroup`.
You query the `FormGroup` for its child controls so that you can compare their values.

To add a validator to the `FormGroup`, pass the new validator in as the second argument on creation.

```javascript
const heroForm = new FormGroup({
  'name': new FormControl(),
  'alterEgo': new FormControl(),
  'power': new FormControl()
}, { validators: identityRevealedValidator });
```

The validator code is as follows.

<code-example path="form-validation/src/app/shared/identity-revealed.directive.ts" region="cross-validation-validator" header="shared/identity-revealed.directive.ts"></code-example>

The `identity` validator implements the `ValidatorFn` interface. It takes an Angular control object as an argument and returns either null if the form is valid, or `ValidationErrors` otherwise.

The validator retrieves the child controls by calling the `FormGroup`'s [get](api/forms/AbstractControl#get) method, then compares the values of the `name` and `alterEgo` controls.

If the values do not match, the hero's identity remains secret, both are valid, and the validator returns null.
If they do match, the hero's identity is revealed and the validator must mark the form as invalid by returning an error object.

To provide better user experience, the template shows an appropriate error message when the form is invalid.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="cross-validation-error-message" header="reactive/hero-form-template.component.html"></code-example>

This `*ngIf` displays the error if the `FormGroup` has the cross validation error returned by the `identityRevealed` validator, but only if the user has finished [interacting with the form](#dirty-or-touched).
-->
폼이 이런 구조로 구성되었다고 합시다:

```javascript
const heroForm = new FormGroup({
  'name': new FormControl(),
  'alterEgo': new FormControl(),
  'power': new FormControl()
});
```

이 폼에서 `name`과 `alterEgo`가 이웃한 폼 컨트롤입니다.
두 폼 컨트롤을 커스텀 유효성 검사 함수 하나로 검사하려면 이 유효성 검사 함수를 두 폼 컨트롤의 부모 폼 컨트롤, 이 경우에는 `FormGroup`에 적용해야 합니다.
물론 `FormGroup`은 자식 폼 컨트롤에 접근해서 값을 참조할 수 있습니다.

`FormGroup`에 유효성 검사 함수를 적용하려면 폼 컨트롤 생성자의 두 번째 인자로 유효성 검사 함수를 지정하면 됩니다.

```javascript
const heroForm = new FormGroup({
  'name': new FormControl(),
  'alterEgo': new FormControl(),
  'power': new FormControl()
}, { validators: identityRevealedValidator });
```

이 유효성 검사 함수의 코드는 이렇습니다.

<code-example path="form-validation/src/app/shared/identity-revealed.directive.ts" region="cross-validation-validator" header="shared/identity-revealed.directive.ts"></code-example>

`identity` 유효성 검사 함수는 `ValidatorFn` 인터페이스를 기반으로 구현합니다.
이 인터페이스는 Angular 폼 컨트롤 객체를 인자로 받아서 유효성을 검사한 후 유효성 검사를 통과하면 `null`을 반환하고 유효성 검사를 통과하지 않으면 `ValidationErrors`를 반환합니다.

그리고 이 유효성 검사 함수는 `FormGroup`이 제공하는 [get](api/forms/AbstractControl#get) 메서드로 자식 폼 컨트롤 `name`과 `alterEgo` 필드의 값을 가져온 후에 비교하는 동작을 합니다.

두 필드의 값이 다르면 히어로의 정체는 비밀로 지켜지며 유효성 검사도 통과하면서 `null`을 반환합니다.

하지만 두 필드의 값이 일치하면 히어로의 정체가 탄로나기 때문에 에러 객체를 반환해서 유효성 검사를 통과하지 못했다는 것을 알려야 합니다.

이 때 사용자가 사용하기 편한 UX를 제공하기 위해 화면에 에러 메시지를 표시해서 폼 그룹에서 에러가 발생했다는 것을 알리는 것이 좋습니다.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="cross-validation-error-message" header="reactive/hero-form-template.component.html"></code-example>

`*ngIf`는 `FormGroup`에 적용된 `identityRevealed` 유효성 검사 결과에 따라 에러 메시지를 화면에 표시하는데, 이 에러 메시지는 [사용자가 폼에 한 번 접근한 뒤에만](#dirty-or-touched) 표시될 것입니다..


<!--
### Adding cross-validation to template-driven forms
-->
### 템플릿 기반 폼에 연관 필드 유효성 검사 적용하기

<!--
For a template-driven form, you must create a directive to wrap the validator function.
You provide that directive as the validator using the [`NG_VALIDATORS` token](#adding-to-template-driven-forms "Read about providing validators"), as shown in the following example.

<code-example path="form-validation/src/app/shared/identity-revealed.directive.ts" region="cross-validation-directive" header="shared/identity-revealed.directive.ts"></code-example>

You must add the new directive to the HTML template.
Because the validator must be registered at the highest level in the form, the following template puts the directive on the `form` tag.

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="cross-validation-register-validator" header="template/hero-form-template.component.html"></code-example>

To provide better user experience, we show an appropriate error message when the form is invalid.

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="cross-validation-error-message" header="template/hero-form-template.component.html"></code-example>

This is the same in both template-driven and reactive forms.
-->
템플릿 기반 폼에서는 유효성 검사 함수를 디렉티브로 랩핑해야 합니다.
그리고 이 디렉티브는 아래 예제처럼 [`NG_VALIDATORS` 토큰](#adding-to-template-driven-forms "Read about providing validators")으로 등록해야 템플릿에 사용할 수 있습니다.

<code-example path="form-validation/src/app/shared/identity-revealed.directive.ts" region="cross-validation-directive" header="shared/identity-revealed.directive.ts"></code-example>

디렉티브를 정의하고 나면 HTML 템플릿에서 디렉티브를 적용해야 합니다.
이 때 유효성 검사 함수는 폼 계층 가장 바깥에서 동작하기 때문에 아래 코드처럼 `form` 태그에 적용하면 됩니다.

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="cross-validation-register-validator" header="template/hero-form-template.component.html"></code-example>

사용하기 편한 UX를 제공하려면 폼 상태가 유효하지 않을 때 적절한 에러 메시지를 표시하면 됩니다.

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="cross-validation-error-message" header="template/hero-form-template.component.html"></code-example>

템플릿 코드는 템플릿 기반 폼과 반응형 폼에서 같습니다.


<!--
## Creating asynchronous validators
-->
## 비동기 유효성 검사 함수 정의하기

<!--
Asynchronous validators implement the `AsyncValidatorFn` and `AsyncValidator` interfaces.
These are very similar to their synchronous counterparts, with the following differences.

* The `validate()` functions must return a Promise or an observable,
* The observable returned must be finite, meaning it must complete at some point.
To convert an infinite observable into a finite one, pipe the observable through a filtering operator such as `first`, `last`, `take`, or `takeUntil`.

Asynchronous validation happens after the synchronous validation, and is performed only if the synchronous validation is successful.
This check allows forms to avoid potentially expensive async validation processes (such as an HTTP request) if the more basic validation methods have already found invalid input.

After asynchronous validation begins, the form control enters a `pending` state. You can inspect the control's `pending` property and use it to give visual feedback about the ongoing validation operation.

A common UI pattern is to show a spinner while the async validation is being performed. The following example shows how to achieve this in a template-driven form.

```html
<input [(ngModel)]="name" #model="ngModel" appSomeAsyncValidator>
<app-spinner *ngIf="model.pending"></app-spinner>
```
-->
비동기 유효성 검사 함수는 `AsyncValidatorFn` 인터페이스와 `AsyncValidator` 인터페이스를 기반으로 구현합니다.
비동기 유효성 검사 함수는 동기 유효성 검사 함수와 거의 비슷하지만 이런 점이 다릅니다.

* `validate()` 함수는 Promise나 Observable을 반환해야 합니다.
* 옵저버블을 반환한다면 이 옵저버블은 반드시 종료되어야 합니다.
종료되지 않는 옵저버블을 종료시키려면 `first`, `last`, `take`, `takeUntil`과 같은 연산자를 활용하면 됩니다.

비동기 유효성 검사 함수는 동기 유효성 검사가 모두 에러없이 끝난 후에만 실행됩니다.
이것은 비동기 유효성 검사 함수가 HTTP 요청과 같이 무거운 비동기 로직을 실행할 수 있기 때문에 상대적으로 가벼운 동기 로직으로 유효성 검사를 우선 검사하려는 의도로 설계된 것입니다.

비동기 유효성 검사 로직이 시작되고 나면 폼 컨트롤이 `pending` 상태가 됩니다.
그래서 이 상태를 활용하면 폼 컨트롤에 유효성 검사가 동작하고 있다는 것을 시각적으로 표현할 수도 있습니다.

가장 일반적인 UI 패턴은 비동기 로직이 실행되고 있을 때 로딩 인디케이터를 표시하는 것입니다.
템플릿 기반 폼에서는 이렇게 구현할 수 있습니다.

```html
<input [(ngModel)]="name" #model="ngModel" appSomeAsyncValidator>
<app-spinner *ngIf="model.pending"></app-spinner>
```


<!--
### Implementing a custom async validator
-->
### 커스텀 비동기 유효성 검사 함수 구현하기

<!--
In the following example, an async validator ensures that heroes pick an alter ego that is not already taken.
New heroes are constantly enlisting and old heroes are leaving the service, so the list of available alter egos cannot be retrieved ahead of time.
To validate the potential alter ego entry, the validator must initiate an asynchronous operation to consult a central database of all currently enlisted heroes.

The following code create the validator class, `UniqueAlterEgoValidator`, which implements the `AsyncValidator` interface.

<code-example path="form-validation/src/app/shared/alter-ego.directive.ts" region="async-validator"></code-example>

The constructor injects the `HeroesService`, which defines the following interface.

```typescript
interface HeroesService {
  isAlterEgoTaken: (alterEgo: string) => Observable<boolean>;
}
```

In a real world application, the `HeroesService` would be responsible for making an HTTP request to the hero database to check if the alter ego is available.
From the validator's point of view, the actual implementation of the service is not important, so the example can just code against the `HeroesService` interface.

As the validation begins, the `UniqueAlterEgoValidator` delegates to the `HeroesService` `isAlterEgoTaken()` method with the current control value.
At this point the control is marked as `pending` and remains in this state until the observable chain returned from the `validate()` method completes.

The `isAlterEgoTaken()` method dispatches an HTTP request that checks if the alter ego is available, and returns `Observable<boolean>` as the result.
The `validate()` method pipes the response through the `map` operator and transforms it into a validation result.

The method then, like any validator, returns `null` if the form is valid, and `ValidationErrors` if it is not.
This validator handles any potential errors with the `catchError` operator.
In this case, the validator treats the `isAlterEgoTaken()` error as a successful validation, because failure to make a validation request does not necessarily mean that the alter ego is invalid.
You could handle the error differently and return the `ValidationError` object instead.

After some time passes, the observable chain completes and the asynchronous validation is done.
The `pending` flag is set to `false`, and the form validity is updated.
-->
아래 예제는 히어로의 별명이 이미 사용되고 있는지 검사하는 비동기 유효성 검사 함수를 구현한 것입니다.
새로운 히어로가 나타나면 히어로 목록에 추가되고 은퇴한 히어로는 히어로 목록에서 제외되기 때문에, 히어로의 별명을 사용할 수 있는지는 DB를 비동기로 확인해야 합니다.

`UniqueAlterEgoValidator`는 `AsyncValidator` 인터페이스를 활용해서 이런 기능을 구현한 유효성 검사 함수입니다.

<code-example path="form-validation/src/app/shared/alter-ego.directive.ts" region="async-validator"></code-example>

유효성 검사 함수의 생성자에 의존성으로 주입되는 `HeroesService`는 이렇게 정의된 인터페이스입니다.

```typescript
interface HeroesService {
  isAlterEgoTaken: (alterEgo: string) => Observable<boolean>;
}
```

실제로 운영되는 애플리케이션이라면 `HeroesService`가 새로운 히어로 별명을 사용할 수 있는지 확인하기 위해 HTTP 요청을 보내는 식으로 동작할 것입니다.
하지만 이 문서는 유효성 검사 함수에 대해서만 다루기 때문에 서비스를 어떻게 구현해야 하는지는 중요하지 않습니다.
지금은 `HeroesService` 인터페이스가 이렇다는 것만 확인하면 됩니다.

유효성 검사 로직이 시작되면 `UniqueAlterEgoValidator`가 실행되면서 현재 폼 값을 기준으로 `HeroesService` `isAlterEgoTaken()` 메서드가 실행됩니다.
이 시점에 폼 컨트롤은 `pending` 상태로 변경되며 `validate()` 메서드가 종료되면서 옵저버블 체인으로 새로운 데이터가 전달되기 전까지 유지됩니다.

`isAlterEgoTaken()` 메소드는 히어로의 별명이 현재 사용중인지 검사하기 위해 HTTP 요청을 보내고 응답이 오면 `Observable<boolean>`을 반환합니다.
`validate()` 메서드는 폼 유효성 검사 형식에 맞게 이 응답을 `boolean` 타입으로 변환합니다.

일반 유효성 검사 함수와 마찬가지로, 유효성 검사를 통과하면 `null`을 반환하며 유효성 검사를 통과하지 못하면 `ValidationErros` 객체를 반환합니다.
그리고 이 유효성 검사 함수에는 예상치 못하게 발생하는 에러를 방지하기 위해 `catchError` 연산자가 사용되었습니다.
`isAlterEgoTaken()`이 정상적으로 실행된 경우 외에, HTTP 요청이 실패한 경우에는 폼에 입력한 값이 유효하다고 간주하고 `null`을 반환합니다.
HTTP 요청이 실패한 경우에 유효성 검사를 통과하지 못한 것으로 처리하려면 `null` 대신 `ValidationError` 객체를 반환하면 됩니다.

시간이 지난 후에 옵저버블 체인이 종료되면 비동기 유효성 검사도 종료됩니다.
이 때 `pending` 플래그는 `false` 값이 되며 폼 유효성 검사 결과도 갱신됩니다.


<!--
### Optimizing performance of async validators
-->
### 비동기 폼 유효성 검사 성능 최적화하기

<!--
By default, all validators run after every form value change. With synchronous validators, this does not normally have a noticeable impact on application performance.
Async validators, however, commonly perform some kind of HTTP request to validate the control. Dispatching an HTTP request after every keystroke could put a strain on the backend API, and should be avoided if possible.

You can delay updating the form validity by changing the `updateOn` property from `change` (default) to `submit` or `blur`.

With template-driven forms, set the property in the template.

```html
<input [(ngModel)]="name" [ngModelOptions]="{updateOn: 'blur'}">
```

With reactive forms, set the property in the `FormControl` instance.

```typescript
new FormControl('', {updateOn: 'blur'});
```
-->
기본적으로 모든 유효성 검사 함수는 폼 값이 변경될 때마다 매번 실행됩니다.
이 때 동기 유효성 검사 함수는 애플리케이션 성능에 큰 영향을 주는 경우가 별로 없습니다.
하지만 비동기 유효성 검사 함수는 폼 컨트롤의 유효성을 검사하기 위해 HTTP 요청을 보내는 것과 같은 동작을 합니다.
그런데 매번 키가 입력될 때마다 HTTP 요청이 발생하면 백엔드 API에 큰 부하를 줄 수 있기 때문에 이런 상황은 피하는 것이 좋습니다.

`updateOn` 프로퍼티를 기본값인 `change`에서 `submit`이나 `blur`로 바꾸면 폼 유효성 검사 로직이 동작하는 시점을 미룰 수 있습니다.

템플릿 기반 폼에서는 이 프로퍼티를 템플릿에서 설정합니다.

```html
<input [(ngModel)]="name" [ngModelOptions]="{updateOn: 'blur'}">
```

반응형 폼에서는 이 프로퍼티를 `FormControl` 인스턴스에서 설정합니다.

```typescript
new FormControl('', {updateOn: 'blur'});
```
