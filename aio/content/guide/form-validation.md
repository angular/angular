<!--
# Form Validation
-->
# 폼 유효성 검사

<!--
Improve overall data quality by validating user input for accuracy and completeness.

This page shows how to validate user input in the UI and display useful validation messages
using both reactive and template-driven forms. It assumes some basic knowledge of the two
forms modules.
-->
폼 유효성 검사는 사용자가 폼에 입력한 내용이 올바른지 확인할 때 사용합니다.

이 문서는 사용자가 폼에 입력한 내용을 어떻게 검사하는지, 검사 결과를 화면에 메시지로 표시하려면 어떻게 해야 하는지 설명합니다. 이 때 폼 반응형 폼과 템플릿 기반 폼 모두 해당되며, 두 모듈의 기본적인 내용은 이미 알고 있다고 가정합니다.

<div class="alert is-helpful">

<!--
If you're new to forms, start by reviewing the [Forms](guide/forms) and
[Reactive Forms](guide/reactive-forms) guides.
-->
폼에 대해 익숙하지 않다면 [폼](guide/forms) 문서와 [반응형 폼](guide/reactive-forms) 문서를 참고하세요.

</div>


<!--
## Template-driven validation
-->
## 템플릿 기반 폼 유효성 검사

<!--
To add validation to a template-driven form, you add the same validation attributes as you
would with [native HTML form validation](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation).
Angular uses directives to match these attributes with validator functions in the framework.
-->
템플릿 기반 폼에서는 [네이티브 HTML 폼 유효성 검사](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation)를 그대로 활용할 수 있습니다. 네이티브 유효성 검사 어트리뷰트를 사용하면, Angular가 이 어트리뷰트들을 적당한 디렉티브로 연결해서 Angular 내부 로직으로 처리합니다.

<!--
Every time the value of a form control changes, Angular runs validation and generates
either a list of validation errors, which results in an INVALID status, or null, which results in a VALID status.
-->
Angular는 폼의 내용이 바뀔때마다 다시 유효성을 검사하며, 유효성 검사 결과를 새로 반환합니다.

<!--
You can then inspect the control's state by exporting `ngModel` to a local template variable.
The following example exports `NgModel` into a variable called `name`:
-->
폼 컨트롤의 상태는 템플릿 변수로 참조하는 `ngModel`을 활용해서 추적할 수 있습니다.
다음 코드는 `name` 폼 컨트롤의 유효성을 확인하는 예제입니다:

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="name-with-error-msg" title="template/hero-form-template.component.html (name)" linenums="false">

</code-example>

<!--
Note the following:
-->
다음 내용을 확인해 보세요:

<!--
* The `<input>` element carries the HTML validation attributes: `required` and `minlength`. It
also carries a custom validator directive, `forbiddenName`. For more
information, see [Custom validators](guide/form-validation#custom-validators) section.
-->
* `<input>` 엘리먼트에는 HTML 유효성 검사 어트리뷰트인 `required`와 `minlength`가 적용되었으며, 커스텀 유효성 검사 디렉티브인 `forbiddenName`도 적용되었습니다. 커스텀 유효성 검사기에 대해서는 [커스텀 유효성 검사기](guide/form-validation#커스텀-유효성-검사기) 문서를 참고하세요.

<!--
* `#name="ngModel"` exports `NgModel` into a local variable called `name`. `NgModel` mirrors many of the properties of its underlying
`FormControl` instance, so you can use this in the template to check for control states such as `valid` and `dirty`. For a full list of control properties, see the [AbstractControl](api/forms/AbstractControl)
API reference.
-->
* `#name="ngModel"`을 사용하면 `NgModel` 폼 컨트롤을 템플릿 변수 `name`에 연결합니다. 이 변수를 활용하면 `FormControl` 인스턴스에 있는 모든 프로퍼티에 접근할 수 있으며, 폼 컨트롤의 상태를 나타내는 `valid`나 `dirty`도 물론 템플릿에서 활용할 수 있습니다. 폼 컨트롤 프로퍼티의 전체 목록은 [AbstractControl](api/forms/AbstractControl) 문서를 확인하세요.

<!--
* The `*ngIf` on the `<div>` element reveals a set of nested message `divs`
but only if the `name` is invalid and the control is either `dirty` or `touched`.
-->
* `<div>` 엘리먼트에 사용된 `*ngIf`는 이 엘리먼트 안에 있는 모든 `<div>`가 화면에 표시되는 것을 제어하기 위해 사용합니다. 이 엘리먼트는 `name` 폼 컨트롤이 `dirty`나 `touched` 상태이고 입력된 값이 유효하지 않을 때 표시됩니다.

<!--
* Each nested `<div>` can present a custom message for one of the possible validation errors.
There are messages for `required`, `minlength`, and `forbiddenName`.
-->
* 각각의 `<div>` 엘리먼트는 에러로 발생할 수 있는 각 상황의 에러 메시지를 표현합니다. 이 코드에서는 `required`와 `minlength`, `forbiddenName` 과 관련된 메시지가 작성되어 있습니다.

<div class="alert is-helpful">

<!--
#### Why check _dirty_ and _touched_?
-->
#### 왜 _dirty_ 와 _touched_ 를 확인할까요?

<!--
You may not want your application to display errors before the user has a chance to edit the form.
The checks for `dirty` and `touched` prevent errors from showing until the user
does one of two things: changes the value,
turning the control dirty; or blurs the form control element, setting the control to touched.
-->
사용자가 폼의 내용을 수정하기 전에는 에러 메시지를 표시하지 않는 것이 자연스럽습니다.
그래서 `dirty`와 `touched` 상태를 조건에 포함시켰으며, 이제는 사용자가 입력된 내용을 변경해서 _dirty_ 상태가 되거나 폼 컨트롤에 접근한 뒤에 포커스를 옮겼을 때(_touched_)부터 에러 메시지가 표시됩니다.

</div>

<!--
## Reactive form validation
-->
## 반응형 폼 유효성 검사

<!--
In a reactive form, the source of truth is the component class. Instead of adding validators through attributes in the template, you add validator functions directly to the form control model in the component class. Angular then calls these functions whenever the value of the control changes.
-->
반응형 폼에서는 유효성 검사 결과가 컴포넌트 클래스에서 전달됩니다. 그래서 유효성 검사 어트리뷰트는 템플릿에서 적용하지 않고 컴포넌트 클래스에서 폼 컨트롤 모델을 정의할 때 유효성 검사기로 적용합니다. 이 함수는 해당 폼 컨트롤의 값이 변경될 때마다 실행됩니다.

<!--
### Validator functions
-->
### 유효성 검사기

<!--
There are two types of validator functions: sync validators and async validators.

* **Sync validators**: functions that take a control instance and immediately return either a set of validation errors or `null`. You can pass these in as the second argument when you instantiate a `FormControl`.

* **Async validators**: functions that take a control instance and return a Promise
or Observable that later emits a set of validation errors or `null`. You can
pass these in as the third argument when you instantiate a `FormControl`.

Note: for performance reasons, Angular only runs async validators if all sync validators pass. Each must complete before errors are set.
-->
유효성 검사기는 동기(sync), 비동기(async) 두 종류가 있습니다.

* **동기 유효성 검사기** : 유효성 검사 결과를 바로 반환하는 함수입니다. `FormControl` 인스턴스를 생성할 때 두번째 인자로 지정하며, 유효성 검사 결과는 에러 객채이거나 `null`입니다.

* **비동기 유효성 검사기** : 유효성 검사 결과를 Promise나 Observable로 감싸서 반환하는 함수입니다. `FormControl` 인스턴스를 생성할 때 세번째 인자로 지정합니다.

참고 : 성능 이슈로 인해 비동기 유효성 검사기는 동기 유효성 검사기가 모두 실행된 이후에 실행됩니다. 그리고 유효성 검사 결과는 모든 검사가 완료된 이후에 설정됩니다.

<!--
### Built-in validators
-->
### 기본 유효성 검사기

<!--
You can choose to [write your own validator functions](guide/form-validation#custom-validators), or you can use some of
Angular's built-in validators.
-->
유효성 검사기는 [커스텀 유효성 검사기](guide/form-validation#커스텀-유효성-검사기)를 만들어서 활용할 수도 있고, Angular 기본 유효성 검사기를 활용할 수도 있습니다.

<!--
The same built-in validators that are available as attributes in template-driven forms, such as `required` and `minlength`, are all available to use as functions from the `Validators` class. For a full list of built-in validators, see the [Validators](api/forms/Validators) API reference.
-->
템플릿 기반 폼에서 사용한 `required`나 `minlength`와 같은 어트리뷰트는 Angular 기본 유효성 검사기로 모두 제공됩니다. 이 유효성 검사기들은 `Validators` 클래스에 선언되어 있으며, 목록을 확인하려면 [Validators](api/forms/Validators) API 문서를 확인하세요.

<!--
To update the hero form to be a reactive form, you can use some of the same
built-in validators&mdash;this time, in function form. See below:
-->
그래서 폼을 반응형으로 변경하더라도 기존에 사용하던 유효성 검사기는 모두 사용할 수 있습니다. 다음 코드를 참고하세요:

{@a reactive-component-class}

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.1.ts" region="form-group" title="reactive/hero-form-reactive.component.ts (validator functions)" linenums="false">
</code-example>

<!--
Note that:
-->
다음 내용을 확인해 보세요:

<!--
* The name control sets up two built-in validators&mdash;`Validators.required` and `Validators.minLength(4)`&mdash;and one custom validator, `forbiddenNameValidator`. For more details see the [Custom validators](guide/form-validation#custom-validators) section in this guide.
* As these validators are all sync validators, you pass them in as the second argument.
* Support multiple validators by passing the functions in as an array.
* This example adds a few getter methods. In a reactive form, you can always access any form control through the `get` method on its parent group, but sometimes it's useful to define getters as shorthands
for the template.
-->
* 이름에 해당하는 폼 컨트롤에는 기본 유효성 검사기인 `Validators.required`와 `Validators.minLength(4)`가 적용되었으며, 커스텀 유효성 검사기인 `forbiddenNameValidator`가 적용되었습니다. [커스텀 유효성 검사기](guide/form-validation#커스텀-유효성-검사기)는 아래에서 다시 설명합니다.
* 이 코드에 적용된 유효성 검사기는 모두 동기 함수입니다. 따라서 유효성 검사기는 모두 폼 컨트롤의 두 번째 인자로 전달합니다.
* 유효성 검사기를 한번에 여러개 적용하려면 배열 형태로 전달합니다.
* 이 예제에는 `name`과 `power` 필드에 게터(getter) 함수가 지정되었습니다. 반응형으로 폼을 구성하고, 템플릿에서 폼 컨트롤의 상태나 값을 참조한다면 게터 함수를 사용하는 것이 편합니다.

<!--
If you look at the template for the name input again, it is fairly similar to the template-driven example.
-->
이 내용은 템플릿 기반 폼을 다룰 때와 비슷하게 템플릿에 적용할 수 있습니다.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="name-with-error-msg" title="reactive/hero-form-reactive.component.html (name with error msg)" linenums="false">
</code-example>

<!--
Key takeaways:
-->
다음 내용을 확인해 보세요:
 
<!--
 * The form no longer exports any directives, and instead uses the `name` getter defined in
 the component class.
 * The `required` attribute is still present. While it's not necessary for validation purposes,
 you may want to keep it in your template for CSS styling or accessibility reasons.
-->
* 템플릿 기반 폼에서 사용하던 템플릿 참조 변수 대신 컴포넌트 클래스에 선언된 `name` 게터 함수를 사용합니다.
* `required` 어트리뷰트는 여전히 존재합니다. 이 어트리뷰트는 유효성을 검사하기 위한 용도로도 사용하지만, 템플릿에 CSS 스타일을 적용할 때도 사용하며, 웹 접근성에도 사용됩니다.

<!--
## Custom validators
-->
## 커스텀 유효성 검사기

<!--
Since the built-in validators won't always match the exact use case of your application, sometimes you'll want to create a custom validator.

Consider the `forbiddenNameValidator` function from previous
[examples](guide/form-validation#reactive-component-class) in
this guide. Here's what the definition of that function looks like:
-->
Angular의 기본 유효성 검사기가 애플리케이션의 요구사항을 모두 만족시킬 수는 없기 때문에, 커스텀 유효성 검사기를 만들어서 활용할 수도 있습니다.

[이전 예제](guide/form-validation#reactive-component-class)에서 살펴본 `forbiddenNameValidator` 함수를 구현해봅시다. 이 함수는 다음과 같이 정의합니다:

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="custom-validator" title="shared/forbidden-name.directive.ts (forbiddenNameValidator)" linenums="false">
</code-example>

<!--
The function is actually a factory that takes a regular expression to detect a _specific_ forbidden name and returns a validator function.
-->
이 함수의 실제 역할은 팩토리 함수일 뿐이며, _금지할 이름에 해당하는_ 정규 표현식을 인자로 받고 유효성 검사기를 함수 형태로 반환합니다.

<!--
In this sample, the forbidden name is "bob", so the validator will reject any hero name containing "bob".
Elsewhere it could reject "alice" or any name that the configuring regular expression matches.
-->
컴포넌트에 정의한 대로라면 "bob"이라는 이름이 금지되며, "bob"이 아닌 값은 모두 유효합니다.
다른 이름을 금지하려면 인자로 전달하는 정규 표현식을 수정하면 됩니다.

<!--
The `forbiddenNameValidator` factory returns the configured validator function.
That function takes an Angular control object and returns _either_
null if the control value is valid _or_ a validation error object.
The validation error object typically has a property whose name is the validation key, `'forbiddenName'`,
and whose value is an arbitrary dictionary of values that you could insert into an error message, `{name}`.
-->
`forbiddenNameValidator` 팩토리는 유효성 검사기를 반환합니다.
이 함수는 Angular 폼 컨트롤 객체를 인자로 받으며, 유효성 검사에 실패하면 에러 오브젝트를 반환하고 유효성 검사를 통과하면 null을 반환합니다.
에러 오브젝트의 프로퍼티는 보통 유효성 검사기의 이름을 지정하기 때문에 `'forbiddenName'`으로 선언했으며, 이 프로퍼티의 값은 폼 컨트롤의 현재값을 할당했습니다. 이 에러 객체를 활용하면 어떤 값이 입력되어서 잘못되었는지 템플릿에 표시할 수 있습니다.

<!--
Custom async validators are similar to sync validators, but they must instead return a Promise or Observable
that later emits null or a validation error object. In the case of an Observable, the Observable must complete,
at which point the form uses the last value emitted for validation.
-->
커스텀 비동기 유효성 검사기는 반환 타입이 Promise나 Observable인 것만 빼면 동기 유효성 검사기와 비슷하며, 이 객체 안에 에러 객체나 null을 반환합니다.
만약 반환 타입이 옵저버블이라면 유효성 검사 로직이 종료된 이후에 이 옵저버블은 반드시 종료되어야 합니다.

<!--
### Adding to reactive forms
-->
### 반응형 폼에 적용하기

<!--
In reactive forms, custom validators are fairly simple to add. All you have to do is pass the function directly
to the `FormControl`.
-->
커스텀 유효성 검사기를 반응형 폼에 적용하는 것은 아주 간단합니다. `FormControl` 인스턴스를 생성할 때 인자로 전달하기만 하면 됩니다.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.1.ts" region="custom-validator" title="reactive/hero-form-reactive.component.ts (validator functions)" linenums="false">
</code-example>

<!--
### Adding to template-driven forms
-->
### 템플릿 기반 폼에 적용하기

<!--
In template-driven forms, you don't have direct access to the `FormControl` instance, so you can't pass the
validator in like you can for reactive forms. Instead, you need to add a directive to the template.
-->
템플릿 기반 폼에서는 `FormControl` 인스턴스에 직접 접근할 수 없기 때문에 반응형 폼의 방식을 사용할 수 없습니다. 대신 유효성 검사기를 디렉티브로 감싸서 활용합니다.

<!--
The corresponding `ForbiddenValidatorDirective` serves as a wrapper around the `forbiddenNameValidator`.
-->
`forbiddenNameValidator`를 디렉티브로 랩핑한 `ForbiddenValidatorDirective`를 정의해 봅시다.

<!--
Angular recognizes the directive's role in the validation process because the directive registers itself
with the `NG_VALIDATORS` provider, a provider with an extensible collection of validators.
-->
이 디렉티브의 역할이 유효성 검사라는 것을 Angular에게 알리기 위해 `NG_VALIDATORS` 프로바이더를 사용하며, Angular의 기본 디렉티브 목록에 이 디렉티브를 추가하도록 다음과 같이 등록합니다.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive-providers" title="shared/forbidden-name.directive.ts (providers)" linenums="false">
</code-example>

<!--
The directive class then implements the `Validator` interface, so that it can easily integrate
with Angular forms. Here is the rest of the directive to help you get an idea of how it all
comes together:
-->
그리고 디렉티브 클래스는 `Validator` 인터페이스를 사용해서 구현하는데, 이 인터페이스를 사용하면 Angular 폼과 호환되도록 클래스를 정의할 수 있습니다.
디렉티브 클래스는 다음과 같이 정의합니다:

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive" title="shared/forbidden-name.directive.ts (directive)">
</code-example>

<!--
Once the `ForbiddenValidatorDirective` is ready, you can simply add its selector, `appForbiddenName`, to any input element to activate it. For example:
-->
`ForbiddenValidatorDirective`를 등록하고 나면 `appForbiddenName` 어트리뷰트를 사용해서 엘리먼트에 적용할 수 있습니다. 다음과 같이 적용합니다:

<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="name-input" title="template/hero-form-template.component.html (forbidden-name-input)" linenums="false">

</code-example>


<div class="alert is-helpful">

<!--
You may have noticed that the custom validation directive is instantiated with `useExisting`
rather than `useClass`. The registered validator must be _this instance_ of
the `ForbiddenValidatorDirective`&mdash;the instance in the form with
its `forbiddenName` property bound to “bob". If you were to replace
`useExisting` with `useClass`, then you’d be registering a new class instance, one that
doesn’t have a `forbiddenName`.
-->
커스텀 유효성 검사 디렉티브의 인스턴스는 `useClass`가 아니라 `useExisting`을 사용해서 생성됩니다.
이렇게 생성된 디렉티브의 인스턴스는 "bob"에 해당하는 정규표현식이 적용된 인스턴스이며, `useExisting` 대신 `useClass`를 사용하면 이 디렉티브를 사용할 때마다 새로운 인스턴스가 생성되며, 이때마다 `forbiddenName` 대신 다른 디렉티브 셀렉터를 다시 등록해야 합니다.

</div>

<!--
## Control status CSS classes
-->
## CSS 클래스 활용하기

<!--
Like in AngularJS, Angular automatically mirrors many control properties onto the form control element as CSS classes. You can use these classes to style form control elements according to the state of the form. The following classes are currently supported:
-->
AngularJS와 비슷하게, Angular도 폼 컨트롤의 상태에 맞는 CSS 클래스를 엘리먼트에 지정합니다. 이 클래스를 활용하면 폼 컨트롤의 상태를 화면에 표시할 수 있으며, 다음과 같은 클래스들을 활용할 수 있습니다:

* `.ng-valid`
* `.ng-invalid`
* `.ng-pending`
* `.ng-pristine`
* `.ng-dirty`
* `.ng-untouched`
* `.ng-touched`

<!--
The hero form uses the `.ng-valid` and `.ng-invalid` classes to
set the color of each form control's border.
-->
이 중 `.ng-valid`와 `.ng-invalid` 클래스를 활용해서 폼 컨트롤의 외곽선을 다르게 표시하려면 다음과 같이 작성합니다.

<code-example path="form-validation/src/assets/forms.css" title="forms.css (status classes)">

</code-example>

<!--
## Cross field validation
-->
## 필드 교차 검증 (Cross field validation)

<!--
This section shows how to perform cross field validation. It assumes some basic knowledge of creating custom validators.
-->
이번에는 필드 교차 검증에 대해 알아봅시다. 이 내용을 확실히 이해하려면 커스텀 유효성 검사기를 어떻게 만드는지 먼저 알고 있는 것이 좋습니다.

<div class="alert is-helpful">

<!--
If you haven't created custom validators before, start by reviewing the [custom validators section](guide/form-validation#custom-validators).
-->
커스텀 유효성 검사기가 익숙하지 않다면 [커스텀 유효성 검사기](guide/form-validation#커스텀-유효성-검사기) 문서를 먼저 보는 것을 권장합니다.

</div>

<!--
In the following section, we will make sure that our heroes do not reveal their true identities by filling out the Hero Form. We will do that by validating that the hero names and alter egos do not match.
-->
앞으로 살펴볼 예제에서 우리는 히어로 폼을 수정해서 히어로의 진짜 정체가 드러나지 않도록 할 것입니다. 히어로의 이름과 별명을 똑같이 입력할 수 없도록 만들어 봅시다.

<!--
### Adding to reactive forms
-->
### 반응형 폼에 적용하기

<!--
The form has the following structure:
-->
폼은 다음과 같은 구조로 선언되어 있습니다:

```javascript
const heroForm = new FormGroup({
  'name': new FormControl(),
  'alterEgo': new FormControl(),
  'power': new FormControl()
});
```

<!--
Notice that the name and alterEgo are sibling controls. To evaluate both controls in a single custom validator, we should perform the validation in a common ancestor control: the `FormGroup`. That way, we can query the `FormGroup` for the child controls which will allow us to compare their values.
-->
이 폼에서 히어로의 이름(name)과 별명(alterEgo)은 서로 이웃한 폼 컨트롤입니다. 이 경우에 두 폼 컨트롤을 함께 검사하려면 부모 폼 컨트롤인 `FormGroup`에 유효성 검사기를 지정해야 합니다. 그러면 `FormGroup`를 참조해서 자식 폼 컨트롤에 어떤 값이 들어있는지 확인할 수 있습니다.

<!--
To add a validator to the `FormGroup`, pass the new validator in as the second argument on creation.
-->
`FormGroup`에 유효성 검사기는 폼 그룹 생성자의 두 번째 인자로 지정합니다.

```javascript
const heroForm = new FormGroup({
  'name': new FormControl(),
  'alterEgo': new FormControl(),
  'power': new FormControl()
}, { validators: identityRevealedValidator });
```

<!--
The validator code is as follows:
-->
이 때 지정한 유효성 검사기는 다음과 같이 구현되어 있습니다:

<code-example path="form-validation/src/app/shared/identity-revealed.directive.ts" region="cross-validation-validator" title="shared/identity-revealed.directive.ts" linenums="false">
</code-example>

<!--
The identity validator implements the `ValidatorFn` interface. It takes an Angular control object as an argument and returns either null if the form is valid, or `ValidationErrors` otherwise.
-->
이 유효성 검사 함수는 `ValidatorFn` 인터페이스를 활용해서 구현했습니다. 그래서 이 함수는 Angular 폼 컨트롤 객체를 인자로 받으며, 유효성 검사에 성공하면 null을 반환하고 유효성 검사에 실패하면 `ValidationErros` 객체를 반환합니다.

<!--
First we retrieve the child controls by calling the `FormGroup`'s [get](api/forms/AbstractControl#get) method. Then we simply compare the values of the `name` and `alterEgo` controls.
-->
먼저, `FormGroup`의 [get](api/forms/AbstractControl#get) 메소드를 사용해서 자식 폼 컨트롤의 값을 가져옵니다. 그리고 `name`과 `alterEgo` 폼 컨트롤의 값을 비교하면 됩니다.

<!--
If the values do not match, the hero's identity remains secret, and we can safely return null. Otherwise, the hero's identity is revealed and we must mark the form as invalid by returning an error object.
-->
두 필드의 값이 다르다면 히어로의 정체는 노출되지 않으며, 이것이 원하는 로직이기 때문에 null을 반환합니다. 하지만 히어로의 정체가 별명에서 그대로 드러난다면 폼 유효성 검사에 실패한 것으로 판단해야 하기 때문에 에러 객체를 반환해야 합니다.

<!--
Next, to provide better user experience, we show an appropriate error message when the form is invalid.
-->
그 다음에는 좀 더 편한 사용성을 제공하기 위해 에러 메시지를 폼에 표시해 봅시다.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="cross-validation-error-message" title="reactive/hero-form-template.component.html" linenums="false">
</code-example>

<!--
Note that we check if:
- the `FormGroup` has the cross validation error returned by the `identityRevealed` validator,
- the user is yet to [interact](guide/form-validation#why-check-dirty-and-touched) with the form.
-->
개선 포인트:
- `identityRevealed` 유효성 검사기의 결과는 `FormGroup`이 처리합니다.
- 아직 사용자가 [접근하지 않았는데도](guide/form-validation#왜-dirty-와-touched-를-확인할까요) 에러 메시지가 표시됩니다.

<!--
### Adding to template driven forms
-->
### 템플릿 기반 폼에 적용하기
<!--
First we must create a directive that will wrap the validator function. We provide it as the validator using the `NG_VALIDATORS` token. If you are not sure why, or you do not fully understand the syntax, revisit the previous [section](guide/form-validation#adding-to-template-driven-forms).
-->
먼저, 유효성 검사 함수를 디렉티브로 랩핑해서 `NG_VALIDATORS` 토큰으로 만들어야 합니다. 왜 이렇게 해야하는지, 어떻게 해야하는지 잘 모르겠다면 [이 문서](guide/form-validation#adding-to-template-driven-forms)를 참고하세요.

<code-example path="form-validation/src/app/shared/identity-revealed.directive.ts" region="cross-validation-directive" title="shared/identity-revealed.directive.ts" linenums="false">
</code-example>

<!--
Next, we have to add the directive to the html template. Since the validator must be registered at the highest level in the form, we put the directive on the `form` tag.
-->
그 다음에는 이렇게 만든 디렉티브를 HTML 템플릿에 적용해야 합니다. 이 우효성 검사기는 폼의 최상위 계층에 적용되어야 하기 때문에 `form` 태그에 이 디렉티브를 지정합니다.
<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="cross-validation-register-validator" title="template/hero-form-template.component.html" linenums="false">
</code-example>

<!--
To provide better user experience, we show an appropriate error message when the form is invalid.
-->
그리고 좀더 나은 사용성을 위해 폼 유효성 검사가 실패했을 때 에러 메시지를 표시해 줍니다.
<code-example path="form-validation/src/app/template/hero-form-template.component.html" region="cross-validation-error-message" title="template/hero-form-template.component.html" linenums="false">
</code-example>

<!--
Note that we check if:
- the form has the cross validation error returned by the `identityRevealed` validator,
- the user is yet to [interact](guide/form-validation#why-check-dirty-and-touched) with the form.
-->

개선 포인트:
- `identityRevealed` 유효성 검사기의 결과는 폼이 처리합니다.
- 아직 사용자가 [접근하지 않았는데도](guide/form-validation#왜-dirty-와-touched-를-확인할까요) 에러 메시지가 표시됩니다.

<!--
This completes the cross validation example. We managed to:
- validate the form based on the values of two sibling controls,
- show a descriptive error message after the user interacted with the form and the validation failed.
-->
필드 교차 검증은 이것이 전부입니다. 필드 교차 검증을 활용하면 다음과 같은 기능을 구현할 수 있습니다:
- 폼에 있는 여러 폼 컨트롤을 함께 검사할 수 있습니다.
- 사용자가 폼에 접근하고 유효성 검사가 실패한 경우에 에러 메시지를 표시할 수 있습니다.

<!--
## Async Validation
This section shows how to create asynchronous validators. It assumes some basic knowledge of creating [custom validators](guide/form-validation#custom-validators).
-->
## 비동기 유효성 검증 (Async Validation)
이번에는 비동기 유효성 검사기를 어떻게 만들 수 있는지 알아봅시다. 이 내용은 [커스텀 유효성 검사기](guide/form-validation#커스텀-유효성-검사기)를 먼저 이해하고 보는 것이 좋습니다.


<!--
### The Basics
Just like synchronous validators have the `ValidatorFn` and `Validator` interfaces, asynchronous validators have their own counterparts: `AsyncValidatorFn` and `AsyncValidator`.
-->
### 기본
`ValidatorFn`과 `Validator` 인터페이스로 동기 유효성 검사기를 만드는 것처럼, 비동기 검사기는 `AsyncValidatorFn`과 `AsyncValidator` 인터페이스로 만듭니다.

<!--
They are very similar with the only difference being:
-->
이 때 동기 유효성 검사기와 비동기 유효성 검사기는 아주 비슷하지만 다른 점이 있습니다:

<!--
* They must return a Promise or an Observable,
* The observable returned must be finite, meaning it must complete at some point. To convert an infinite observable into a finite one, pipe the observable through a filtering operator such as `first`, `last`, `take`, or `takeUntil`.
-->
* 비동기 유효성 검사기는 Promise나 Observable 타입을 반환해야 합니다.
* 옵저버블이 반환된다면 이 옵저버블은 반드시 종료되어야 합니다. 중단되지 않는 옵저버블을 사용한다면 `first`, `last`, `take`, `takeUntil`과 같은 연산자를 사용해야 합니다.

<!--
It is important to note that the asynchronous validation happens after the synchronous validation, and is performed only if the synchronous validation is successful. This check allows forms to avoid potentially expensive async validation processes such as an HTTP request if more basic validation methods fail.
-->
비동기 유효성 검사기는 동기 유효성 검사기가 모두 실행된 이후에 실행된다는 것이 중요하며, 동기 유효성 검사기를 모두 통과한 경우에만 실행됩니다. 이렇게 동작하는 이유는 이미 동기 유효성 검사를 실패했는데 HTTP 요청과 같이 좀 더 무거운 비동기 로직을 실행할 필요가 없기 때문입니다.

<!--
After asynchronous validation begins, the form control enters a `pending` state. You can inspect the control's `pending` property and use it to give visual feedback about the ongoing validation.
-->
비동기 유효성 검사가 시작되면 폼 컨트롤은 `pending` 상태가 됩니다. 이 상태는 폼 컨트롤의 `pending` 프로퍼티로 참조할 수 있으며, 현재 폼 유효성 검사가 진행중이라는 시각 효과를 표현하는 데에 활용할 수 있습니다.

<!--
A common UI pattern is to show a spinner while the async validation is being performed. The following example presents how to achieve this with template-driven forms:
-->
가장 일반적인 방법은 비동기 유효성 검사가 실행되는 동안 회전하는 로딩 아이콘을 표시하는 것입니다. 템플릿 기반의 폼이라면 다음과 같이 구현할 수 있습니다:

```html
<input [(ngModel)}="name" #model="ngModel" appSomeAsyncValidator>
<app-spinner *ngIf="model.pending"></app-spinner>
```

<!--
### Implementing Custom Async Validator
-->
### 커스텀 비동기 유효성 검사기 구현하기
<!--
In the following section, validation is performed asynchronously to ensure that our heroes pick an alter ego that is not already taken. New heroes are constantly enlisting and old heroes are leaving the service. That means that we do not have the list of available alter egos ahead of time.
-->
이전 예제에서 히어로의 별명이 중복되지 않았는지 처리하는 유효성 검사는 비동기로 실행합니다. 그리고 우리가 관리하는 히어로의 목록에는 은퇴한 히어로가 없어지기도 하고 새로운 히어로가 등록되기도 합니다. 이 말은 히어로의 별명으로 사용할 수 있는 목록이 계속 바뀐다는 것을 의미합니다.

<!--
To validate the potential alter ego, we need to consult a central database of all currently enlisted heroes. The process is asynchronous, so we need a special validator for that.
-->
히어로가 등록하려는 별명이 유효한지 판단하려면 DB에서 현재 등록된 히어로들의 목록을 확인해야 합니다. 이 동작은 비동기로 이루어지기 때문에 비동기로 동작하는 유효성 검사기가 필요합니다.

<!--
Let's start by creating the validator class.
-->
먼저 유효성 검사기 클래스를 만들어 봅시다.

<code-example path="form-validation/src/app/shared/alter-ego.directive.ts" region="async-validator" linenums="false"></code-example>

<!--
As you can see, the `UniqueAlterEgoValidator` class implements the `AsyncValidator` interface. In the constructor, we inject the `HeroesService` that has the following interface:
-->
코드에서 확인할 수 있듯이, `UniqueAlterEgoValidator` 클래스는 `AsyncValidator` 인터페이스를 확장해서 만듭니다. 그리고 이 유효성 검사기의 생성자에 주입하는 `HeroesService`의 인터페이스는 다음과 같이 정의되어 있습니다:

```typescript
interface HeroesService {
  isAlterEgoTaken: (alterEgo: string) => Observable<boolean>;
}
```

<!--
In a real world application, the `HeroesService` is responsible for making an HTTP request to the hero database to check if the alter ego is available. From the validator's point of view, the actual implementation of the service is not important, so we can just code against the `HeroesService` interface.
-->
실제 애플리케이션이라면 히어로 DB를 확인하는 HTTP 요청은 `Heroservice`가 담당합니다. 그래서 유효성 검사기의 입장에서는 이 서비스가 어떻게 구현되어 있는지 중요하지 않습니다. 이 예제에서는 `HeroesService`를 활용하는 로직을 작성하는 것에만 집중합시다.

<!--
As the validation begins, the `UniqueAlterEgoValidator` delegates to the `HeroesService` `isAlterEgoTaken()` method with the current control value. At this point the control is marked as `pending` and remains in this state until the observable chain returned from the `validate()` method completes.
-->
유효성 검사가 시작되면 `UniqueAlterEgoValidator`는 `HeroesService`의 `isAlterEgoTaken()` 메소드에 폼 컨트롤 값을 전달합니다. 그러면 이 시점에 폼 컨트롤의 `pending` 상태가 설정되며, 유효성 검사기의 `validate()` 메소드가 종료되어야 `pending` 상태가 해제됩니다.

<!--
The `isAlterEgoTaken()` method dispatches an HTTP request that checks if the alter ego is available, and returns `Observable<boolean>` as the result. We pipe the response through the `map` operator and transform it into a validation result. As always, we return `null` if the form is valid, and `ValidationErrors` if it is not. We make sure to handle any potential errors with the `catchError` operator.
-->
`isAlterEgoTaken()` 메소드는 HTTP 요청을 보내서 인자로 받은 히어로의 별명을 사용할 수 있는지 확인하고 그 결과로 `Observable<boolean>`을 반환합니다. 그러면 이 옵저버블에 `map` 연산자를 활용해서 원하는 형태로 변환할 수 있습니다. 폼이 유효성 검사를 통과하면 `null`을 반환하고, 유효성 검사를 통과하지 못하면 `ValidationErrors`를 반환해야 합니다. 그리고 예상치 못한 에러를 처리하기 위해 `catchError` 연산자를 사용하는 것도 좋습니다.

<!--
Here we decided that `isAlterEgoTaken()` error is treated as a successful validation, because failure to make a validation request does not necessarily mean that the alter ego is invalid. You could handle the error differently and return the `ValidationError` object instead.
-->
이 예제에서는 `isAlterEgoTaken()`이 에러를 반환할 때 성공한 것으로 처리합니다. 왜냐하면 히어로의 별명이 사용되지 않았다면 이 별명을 새 히어로에게 붙여줄 수 있기 때문입니다. 물론 이 로직은 자유롭게 바꿀 수 있습니다.

<!--
After some time passes, the observable chain completes and the async validation is done. The `pending` flag is set to `false`, and the form validity is updated.
-->
HTTP 통신을 끝내고 나면 옵저버블 체인이 종료되면서 비동기 유효성 검사기도 종료됩니다. 이 때 `pending` 플래그가 `false`로 할당되며 폼 유효성 상태가 갱신됩니다.

<!--
### Note on performance
-->
### 성능을 고려하세요.

<!--
By default, all validators are run after every form value change. With synchronous validators, this will not likely have a noticeable impact on application performance. However, it's common for async validators to perform some kind of HTTP request to validate the control. Dispatching an HTTP request after every keystroke could put a strain on the backend API, and should be avoided if possible.
-->
일반적으로 모든 유효성 검사기는 폼 값이 변경되었을 때 실행됩니다. 이 때 비동기 유효성 검사기라면 애플리케이션 성능에 큰 영향이 없겠지만, 비동기 유효성 검사기는 HTTP 통신과 같은 동작을 실행하기 때문에 애플리케이션 동작 성능에 영향이 있을 수 있습니다. 그래서 키 입력이 있을 때마다 HTTP 요청을 보낸다면 백엔드 API에 큰 부하가 걸리기 때문에, 이런 로직은 최대한 피해야 합니다.

<!--
We can delay updating the form validity by changing the `updateOn` property from `change` (default) to `submit` or `blur`.
-->
그래서 폼 유효성을 검사하는 시점은 기본값인 `change`를 피해서 `submit`이나 `blur` 시점을 활용할 수도 있습니다. 이 동작은 `updateOn` 프로퍼티로 설정합니다.

<!--
With template-driven forms:
-->
이 프로퍼티는 템플릿 기반 폼에서 다음과 같이 사용합니다:

```html
<input [(ngModel)]="name" [ngModelOptions]="{updateOn: 'blur'}">
```

<!--
With reactive forms:
-->
그리고 반응형 폼에서는 다음과 같이 사용합니다:

```typescript
new FormControl('', {updateOn: 'blur'});
```

<!--
**You can run the <live-example></live-example> to see the complete reactive and template-driven example code.**
-->
**이 문서에서 다룬 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다. 예제는 반응형 폼과 템플릿 기반 폼 모두 제공됩니다.**
