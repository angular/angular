<!--
# Template type checking
-->
# 템플릿 타입 검사

<!--
## Overview of template type checking
-->
## 개요

<!--
Just as TypeScript catches type errors in your code, Angular checks the expressions and bindings within the templates of your application and can report any type errors it finds.
Angular currently has three modes of doing this, depending on the value of the `fullTemplateTypeCheck` and `strictTemplates` flags in the [TypeScript configuration file](guide/typescript-configuration), `tsconfig.json`.
-->
TypeScript 컴파일러가 TypeScript 코드에서 타입 에러를 찾아내는 것과 마찬가지로, Angular 컴파일러도 템플릿에 사용된 표현식이나 바인딩 문법에서 에러를 찾아냅니다.
현재 Angular가 제공하는 타입 검사 모드는 3종류인데, [TypeScript 환경설정 파일](guide/typescript-configuration) `tsconfig.json` 파일에서 `fullTemplateTypeCheck`, `strictTemplates` 플래그로 지정합니다.

<!--
### Basic mode
-->
### 기본(Basic) 모드

<!--
In the most basic type-checking mode, with the `fullTemplateTypeCheck` flag set to `false`, Angular validates only top-level expressions in a template.

If you write `<map [city]="user.address.city">`, the compiler verifies the following:

* `user` is a property on the component class.
* `user` is an object with an address property.
* `user.address` is an object with a city property.

The compiler does not verify that the value of `user.address.city` is assignable to the city input of the `<map>` component.

The compiler also has some major limitations in this mode:

* Importantly, it doesn't check embedded views, such as `*ngIf`, `*ngFor`, other `<ng-template>` embedded view.
* It doesn't figure out the types of `#refs`, the results of pipes, the type of `$event` in event bindings, and so on.

In many cases, these things end up as type `any`, which can cause subsequent parts of the expression to go unchecked.
-->
`fullTemplateTypeCheck` 플래그 값을 `false`로 설정하면 가장 기본적인 타입 검사 모드가 동작합니다.
이 모드에서는 Angular가 템플릿 표현식을 아주 간단하게만 검사합니다.

이 모드는 `<map [city]="user.address.city">`라는 코드가 다음 기준에 적합한지 판단합니다:

* `user`는 컴포넌트 클래스의 프로퍼티입니다.
* `user`는 객체이며 이 객체에는 `address` 프로퍼티가 존재합니다.
* `user.address`는 객체이며 이 객체에는 `city` 프로퍼티가 존재합니다.

컴파일러는 `user.address.city` 값이 `<map>` 컴포넌트의 입력값으로 적합한지는 검사하지 않습니다.

그리고 다음과 같은 기능도 동작하지 않습니다:

* `*ngIf`, `*ngFor`, `<ng-template>`과 같은 임베디드 뷰(embedded view)는 검사하지 않습니다.
* `#refs`로 참조하는 타입, 파이프 처리 결과, 이벤트 바인딩에 사용된 `$event`의 타입도 검사하지 않습니다.

기본 모드에서는 이 항목들을 `any` 타입으로 처리하며, 표현식 나머지 부분의 타입 검사는 생략합니다.


<!--
### Full mode
-->
### 전체검사(Full) 모드

<!--
If the `fullTemplateTypeCheck` flag is set to `true`, Angular is more aggressive in its type-checking within templates.
In particular:

* Embedded views (such as those within an `*ngIf` or `*ngFor`) are checked.
* Pipes have the correct return type.
* Local references to directives and pipes have the correct type (except for any generic parameters, which will be `any`).

The following still have type `any`.

* Local references to DOM elements.
* The `$event` object.
* Safe navigation expressions.
-->
`fullTemplateTypeCheck` 플래그 값을 `true`로 설정하면 조금 더 강력한 타입 검사 모드가 동작합니다.
이런 기능이 추가됩니다:

* `*ngIf`, `*ngFor` 안에 사용된 임베디드 뷰도 검사합니다.
* 파이프가 처리한 결과도 적절한 타입이어야 합니다.
* 디렉티브나 파이프에 사용하는 로컬 참조 변수 적절한 타입이어야 합니다. 다만, 제네릭은 `any` 타입으로 간주합니다.

하지만 다음 항목들은 여전히 `any` 타입으로 처리합니다.

* DOM 엘리먼트에 사용된 로컬 참조 변수
* `$event` 객체
* 안전 참조 연산자


{@a strict-mode}

<!--
### Strict mode
-->
### 엄격한(Strict) 모드

<!--
Angular version 9 maintains the behavior of the `fullTemplateTypeCheck` flag, and introduces a third "strict mode".
Strict mode is a superset of full mode, and is accessed by setting the `strictTemplates` flag to true. This flag supersedes the `fullTemplateTypeCheck` flag.
In strict mode, Angular version 9 adds checks that go beyond the version 8 type-checker.
Note that strict mode is only available if using Ivy.

In addition to the full mode behavior, Angular version 9:

* Verifies that component/directive bindings are assignable to their `@Input()`s.
* Obeys TypeScript's `strictNullChecks` flag when validating the above.
* Infers the correct type of components/directives, including generics.
* Infers template context types where configured (for example, allowing correct type-checking of `NgFor`).
* Infers the correct type of `$event` in component/directive, DOM, and animation event bindings.
* Infers the correct type of local references to DOM elements, based on the tag name (for example, the type that `document.createElement` would return for that tag).
-->
Angular 9버전부터는 `fullTemplateTypeCheck` 플래그 외에 엄격한 모드를 추가로 도입했습니다.
엄격한 모드는 `strictTemplates` 플래그 값을 `true`로 설정하면 활성화되는데, 이렇게 설정하면 `fullTemplateTypeCheck` 플래그의 값은 어떤값이든 관계없습니다.
이 모드는 전체검사 모드의 검사 기능을 모두 포함합니다.
하지만 Ivy를 사용할 때만 동작한다는 것을 명심하세요.

이 모드에서는 전체검사 모드에 추가로 다음과 같은 내용을 검사합니다:

* 컴포넌트/디렉티브에 바인딩 된 객체의 타입이 `@Input()`과 맞는지 검사합니다. 이 과정에 TypeScript `strictNullChecks` 플래그도 활용합니다.
* 컴포넌트/디렉티브에 적절한 타입이 사용되었는지 검사하며, 이 때 제네릭도 검사합니다.
* 템플릿 컨텍스트에 사용된 객체의 타입도 검사합니다. `NgFor`도 검사 대상입니다.
* 컴포넌트/디렉티브, DOM, 애니메이션 이벤트 바인딩에 사용되는 `$event` 객체의 타입이 적절한지 검사합니다.
* DOM 엘리먼트를 참조하는 로컬 참조 변수가 적절한 타입인지 검사합니다. `document.createElement`를 쓴 경우에도 마찬가지입니다.


<!--
## Checking of `*ngFor`
-->
## `*ngFor`로 비교해보기

<!--
The three modes of type-checking treat embedded views differently. Consider the following example.
-->
세가지 타입 검사 모드는 각각 임베디드 뷰에서 타입을 검사하는 방식이 조금씩 다릅니다. 예제를 보면서 알아봅시다.

<code-example language="ts" header="User interface">

interface User {
  name: string;
  address: {
    city: string;
    state: string;
  }
}

</code-example>


```html
  <div *ngFor="let user of users">
    <h2>{{config.title}}</h2>
    <span>City: {{user.address.city}}</span>
  </div>
```

<!--
The `<h2>` and the `<span>` are in the `*ngFor` embedded view.
In basic mode, Angular doesn't check either of them.
However, in full mode, Angular checks that `config` and `user` exist and assumes a type of `any`.
In strict mode, Angular knows that the `user` in the `<span>` has a type of `User`, and that `address` is an object with a `city` property of type `string`.
-->
이 코드에서 `<h2>`와 `<span>`은 `*ngFor` 임베디드 뷰 안에 있는 엘리먼트입니다.
기본 모드에서는 이 엘리먼트를 검사하지 않습니다.
그리고 전체검사 모드에서는 `config`와 `user` 객체가 있는지는 검사하지만 `any` 타입으로 처리합니다.
엄격한 검사 모드에서는 `<span>`에 사용된 `user` 객체가 `User` 타입인지 검사하며, 이 객체 안에 `address`가 있고 또 `city` 프로퍼티가 있는지 검사합니다. `user.address.city`의 타입이 `string`인지도 검사합니다.


{@a troubleshooting-template-errors}

<!--
## Troubleshooting template errors
-->
## 템플릿 에러 해결하기

<!--
When enabling the new strict mode in version 9, you might encounter template errors that didn't arise in either of the previous modes.
These errors often represent genuine type mismatches in the templates that were not caught by the previous tooling.
If this is the case, the error message should make it clear where in the template the problem occurs.

There can also be false positives when the typings of an Angular library are either incomplete or incorrect, or when the typings don't quite line up with expectations as in the following cases.

* When a library's typings are wrong or incomplete (for example, missing `null | undefined` if the library was not written with `strictNullChecks` in mind).
* When a library's input types are too narrow and the library hasn't added appropriate metadata for Angular to figure this out. This usually occurs with disabled or other common Boolean inputs used as attributes, for example, `<input disabled>`.
* When using `$event.target` for DOM events (because of the possibility of event bubbling, `$event.target` in the DOM typings doesn't have the type you might expect).

In case of a false positive like these, there are a few options:

* Use the [`$any()` type-cast function](guide/template-syntax#any-type-cast-function) in certain contexts to opt out of type-checking for a part of the expression.
* You can disable strict checks entirely by setting `strictTemplates: false` in the application's TypeScript configuration file, `tsconfig.json`.
* You can disable certain type-checking operations individually, while maintaining strictness in other aspects, by setting a _strictness flag_ to `false`.
* If you want to use `strictTemplates` and `strictNullChecks` together, you can opt out of strict null type checking specifically for input bindings via `strictNullInputTypes`.

|Strictness flag|Effect|
|-|-|
|`strictInputTypes`|Whether the assignability of a binding expression to the `@Input()` field is checked. Also affects the inference of directive generic types. |
|`strictNullInputTypes`|Whether `strictNullChecks` is honored when checking `@Input()` bindings (per `strictInputTypes`). Turning this off can be useful when using a library that was not built with `strictNullChecks` in mind.|
|`strictAttributeTypes`|Whether to check `@Input()` bindings that are made using text attributes (for example, `<mat-tab label="Step 1">` vs `<mat-tab [label]="'Step 1'">`).
|`strictSafeNavigationTypes`|Whether the return type of safe navigation operations (for example, `user?.name`) will be correctly inferred based on the type of `user`). If disabled, `user?.name` will be of type `any`.
|`strictDomLocalRefTypes`|Whether local references to DOM elements will have the correct type. If disabled `ref` will be of type `any` for `<input #ref>`.|
|`strictOutputEventTypes`|Whether `$event` will have the correct type for event bindings to component/directive an `@Output()`, or to animation events. If disabled, it will be `any`.|
|`strictDomEventTypes`|Whether `$event` will have the correct type for event bindings to DOM events. If disabled, it will be `any`.|
|`strictContextGenerics`|Whether the type parameters of generic components will be inferred correctly (including any generic bounds). If disabled, any type parameters will be `any`.|


If you still have issues after troubleshooting with these flags, you can fall back to full mode by disabling `strictTemplates`.

If that doesn't work, an option of last resort is to turn off full mode entirely with `fullTemplateTypeCheck: false`, as we've made a special effort to make Angular version 9 backwards compatible in this case.

A type-checking error that you cannot resolve with any of the recommended methods can be the result of a bug in the template type-checker itself.
If you get errors that require falling back to basic mode, it is likely to be such a bug.
If this happens, please [file an issue](https://github.com/angular/angular/issues) so the team can address it.
-->
Angular 9버전부터 도입된 엄격한 타입 검사 모드를 활성화하면 이전까지 확인하지 못했던 템플릿 에러가 발생할 것입니다.
새로 확인된 에러 중 대부분은 템플릿에서 타입을 잘못 사용했던 것이 엄격한 타입 검사 모드에서 검출된 것입니다.
이런 경우는 문제가 발생한 부분을 에러 메시지에서 쉽게 확인할 수 있습니다.

그리고 Angular 라이브러리의 타입 정의가 불완전하거나 잘못된 경우, 컴파일러의 판단과 달라지는 다음과 같은 경우에는 오탐지가 발생할 수도 있습니다.

* 라이브러리의 타입 정의가 잘못되었거나 불완전한 경우. 라이브러리가 `strictNullChecks`를 고려하지 않아 `null | undefined`를 빠뜨린 경우일 수 있습니다.
* 입력 프로퍼티의 타입이 너무 제한된 경우. `<input disabled>`와 같이 `disabled` 어트리뷰트나 불리언 값이 사용되는 어트리뷰트에서 발생할 수 있습니다.
* DOM 이벤트를 바인딩하면서 `$event.target`을 사용한 경우. 이벤트는 버블링(bubbling)될 수 있기 때문에 특정 DOM에서 감지한 `$event.target`의 타입은 보장할 수 없습니다.

이런 경우는 다음과 같은 방법으로 해결할 수 있습니다:

* 표현식의 일부분을 검사하지 않으려면 [`$any()` 타입 캐스팅 함수](guide/template-syntax#any-type-cast-function)를 사용하세요.
* 애플리케이션 TypeScript 환경설정 파일 `tsconfig.json` 파일에서 `strictTemplates` 값을 `false`로 설정해서 엄격한 타입 검사 모드를 비활성화 하세요.
* 특정 규칙만 비활성화할 수 있습니다. 해당 _strictness flag_를 `false`로 설정하면 됩니다.
* `strictTemplates` 옵션과 `strictNullChecks` 옵션을 그대로 사용하려면 `strictNullInputTypes` 옵션을 추가로 사용해서 입력 프로퍼티로 바인딩되는 객체의 타입 검사 옵션을 조정할 수 있습니다.

|플래그|효과|
|-|-|
|`strictInputTypes`|`@Input()` 필드로 바인딩되는 표현식이 적절한지 검사합니다. 디렉티브의 제네릭 타입도 함께 검사합니다.|
|`strictNullInputTypes`|`strictInputTypes`를 활성화했을 때 `strictNullChecks` 옵션도 적용할지 지정합니다. 사용하는 라이브러리가 `strictNullChecks`를 고려하지 않았다면 이 옵션값을 `false`로 지정하는 것이 좋습니다.|
|`strictAttributeTypes`|바인딩없이 문자열로 지정한 어트리뷰트도 검사할지 지정합니다. `true`로 설정하면 `<mat-tab label="Step 1">`도 검사하며 `false`로 설정하면 `<mat-tab [label]="'Step 1'">`만 검사합니다.|
|`strictSafeNavigationTypes`|안전참조 연산자 이후에 있는 프로퍼티의 타입을 검사할지 지정합니다. `false`로 설정하면 `user?.name`이라고 사용했을 때 `name`을 `any` 타입으로 처리합니다.|
|`strictDomLocalRefTypes`|DOM 엘리먼트를 참조하는 템플릿 로컬 변수의 타입을 검사할지 지정합니다. `false`로 설정하면 `<input #ref>`라고 사용했을 때 `ref`를 `any` 타입으로 처리합니다.|
|`strictOutputEventTypes`|컴포넌트/디렉티브가 `@Output()`으로 보내는 `$event`의 타입과 애니메이션 이벤트의 타입을 검사할지 지정합니다. `false`로 설정하면 이벤트를 `any` 타입으로 처리합니다.|
|`strictDomEventTypes`|이벤트 바인딩으로 연결한 DOM 이벤트의 타입을 검사할지 지정합니다. `false`로 설정하면 이벤트 객체를 `any` 타입으로 처리합니다.|
|`strictContextGenerics`|제네릭 컴포넌트에 사용되는 인자 타입을 검사할지 지정합니다. `false`로 설정하면 `any`로 처리합니다.|


플래그를 조정하더라도 문제가 계속 발생하면 언제라도 `strictTemplates`를 비활성화해서 전체검사 모드로 변경할 수 있습니다.

하지만 전체검사 모드에서도 계속 에러가 발생하면 `fullTemplateTypeCheck` 값을 `false`로 설정해서 전체검사 모드도 비활성화할 수 있습니다.
전체검사 모드를 비활성화하면 Angular 9 이전 버전처럼 잘 동작할 것입니다.

기본 검사모드에서도 문제가 해결되지 않는다면 어쩌면 템플릿 타입 검사 기능의 버그일 수도 있습니다.
이런 상황이 발생하면 꼭 저희에게 [이슈](https://github.com/angular/angular/issues)로 제보해 주세요.
자세하게 검토해 보겠습니다.


<!--
## Inputs and type-checking
-->
## 입력 프로퍼티 타입 검사

<!--
In Angular version 9, the template type checker checks whether a binding expression's type is compatible with that of the corresponding directive input.
As an example, consider the following component:

```typescript
export interface User {
  name: string;
}

@Component({
  selector: 'user-detail',
  template: '{{ user.name }}',
})
export class UserDetailComponent {
  @Input() user: User;
}
```

The `AppComponent` template uses this component as follows:

```ts
@Component({
  selector: 'my-app',
  template: '<user-detail [user]="selectedUser" />',
})
export class AppComponent {
  selectedUser: User | null = null;
}
```

Here, during type checking of the template for `AppComponent`, the `[user]="selectedUser"` binding corresponds with the `UserDetailComponent.user` input.
Therefore, Angular assigns the `selectedUser` property to `UserDetailComponent.user`, which would result in an error if their types were incompatible.
TypeScript checks the assignment according to its type system, obeying flags such as `strictNullChecks` as they are configured in the application.
-->
Angular 9버전부터는 템플릿 타입 검사 로직이 바인딩 표현식 결과값의 타입과 디렉티브 입력 프로퍼티의 타입이 적절한지 검사합니다.
다음과 같은 컴포넌트가 있다고 합시다:

```typescript
export interface User {
  name: string;
}

@Component({
  selector: 'user-detail',
  template: '{{ user.name }}',
})
export class UserDetailComponent {
  @Input() user: User;
}
```

이 컴포넌트는 `AppComponent` 템플릿에 다음과 같이 사용됩니다:

```ts
@Component({
  selector: 'my-app',
  template: '<user-detail [user]="selectedUser" />',
})
export class AppComponent {
  selectedUser: User | null = null;
}
```

이제 `AppComponent`를 대상으로 타입 검사 로직이 동작하면 템플릿에 사용된 `[user]="selectedUser"`와 `UserDetailComponent.user` 프로퍼티의 타입이 적절한지 검사합니다.
그런데 이 예제 코드에서는 `AppComponent`의 `selectedUser` 프로퍼티가 `UserDetailComponent`의 `user` 타입과 맞지 않기 때문에 에러가 발생합니다.
이 때 실행되는 타입 검사 로직은 `strictNullChecks`와 같은 플래그의 영향을 받습니다.


<!--
### Strict null checks
-->
### 엄격한 null 검사

<!--
When you enable `strictTemplates` and the TypeScript flag `strictNullChecks`, typecheck errors may occur for certain situations that may not easily be avoided. For example:

  * A nullable value that is bound to a directive from a library which did not have `strictNullChecks` enabled.

  For a library compiled without `strictNullChecks`, its declaration files will not indicate whether a field can be `null` or not.
  For situations where the library handles `null` correctly, this is problematic, as the compiler will check a nullable value against the declaration files which omit the `null` type.
  As such, the compiler produces a type-check error because it adheres to `strictNullChecks`.

  * Using the `async` pipe with an Observable which you know will emit synchronously.

  The `async` pipe currently assumes that the Observable it subscribes to can be asynchronous, which means that it's possible that there is no value available yet.
  In that case, it still has to return something&mdash;which is `null`.
  In other words, the return type of the `async` pipe includes `null`, which may result in errors in situations where the Observable is known to emit a non-nullable value synchronously.

There are two potential workarounds to the above issues:

  1. In the template, include the non-null assertion operator `!` at the end of a nullable expression, such as  `<user-detail [user]="user!" />`.

  In this example, the compiler disregards type incompatibilities in nullability, just as in TypeScript code.
  In the case of the `async` pipe, note that the expression needs to be wrapped in parentheses, as in `<user-detail [user]="(user$ | async)!" />`.

  1. Disable strict null checks in Angular templates completely.

  When `strictTemplates` is enabled, it is still possible to disable certain aspects of type checking.
  Setting the option `strictNullInputTypes` to `false` disables strict null checks within Angular templates.
  This flag applies for all components that are part of the application.
-->
`strictTemplates` 옵션과 TypeScript `strictNullChecks` 옵션을 활성화하면 처리하기 까다로운 타입 에러가 발생할 수 있습니다.

  * `strictNullChecks`를 고려하지 않은 라이브러리에서 `null` 값이 전달될 수 있습니다.

  라이브러리를 개발할 때 `strictNullChecks` 옵션을 고려하지 않으면 타입 정의 파일에 `null`과 관련된 내용이 포함되지 않습니다.
  그래서 컴파일러가 `null` 값이 될 수 있는 코드를 발견하면 에러가 발생할 수 있습니다.

  * 동기 방식으로 값을 전달하는 옵저버블에 `async` 파이프를 사용한 경우

  `async` 파이프는 비동기 옵저버블에 사용하기 때문에 당장은 스트림으로 전달되는 데이터가 없다는 것을 간주합니다.
  그래서 이 시점에 `null`을 반환하는 경우가 있습니다.
  다르게 표현하면, `async` 파이프가 동기 방식으로 `null`을 반환할 수 있다는 것을 의미합니다.

위 두 상황은 다음 방법을 적용하면 해결될 수 있습니다:

  1. `null`이 될 수 있는 표현식에 null 방지 연산자 `!`를 사용하면 됩니다. ex) `<user-detail [user]="user!" />`

  이렇게 작성하면 컴파일러가 `null`이 될 수 있는 상황을 고려하지 않습니다. TypeScript 코드에서 동작하는 것과 마찬가지입니다.
  그리고 `async` 파이프의 경우에는 전체 표현식을 소괄호로 감싸고 null 방지 연산자를 사용하면 됩니다. ex) `<user-detail [user]="(user$ | async)!" />`

  1. Angular 템플릿을 검사할 때 엄격한 null 검사 모드를 해제하면 됩니다.

  `strictTemplates` 옵션을 활성화하더라도 특정 문법에서는 타입 검사 기능을 끌 수 있습니다.
  예를 들어 `strictNullInputTypes` 옵션을 `false`로 설정하면 입력 프로퍼티로 전달되는 객체의 타입 검사를 생략합니다.
  이런 옵션은 애플리케이션 전체 컴포넌트에 적용되는 것에 주의하세요.


<!--
### Advice for library authors
-->
### 라이브러리 개발자분들께

<!--
As a library author, you can take several measures to provide an optimal experience for your users.
First, enabling `strictNullChecks` and including `null` in an input's type, as appropriate, communicates to your consumers whether they can provide a nullable value or not.
Additionally, it is possible to provide type hints that are specific to the template type checker, see the [Input setter coercion](guide/template-typecheck#input-setter-coercion) section of this guide.
-->
라이브러리 개발자라면 라이브러리 사용자의 편의를 위해 검토할 수 있는 내용이 있습니다.
먼저, `strictNullChecks` 옵션을 활성화하고 입력으로 받을 수 있는 타입에 `null`을 추가하세요.
라이브러리 사용자가 `null` 값을 입력값으로 전달하더라도 문제가 생기지 않을 것입니다.
템플릿 타입 검사 로직에 힌트를 제공할 수도 있습니다.
아래 [입력값 보정하기](guide/template-typecheck#input-setter-coercion) 섹션을 참고하세요.


{@a input-setter-coercion}

<!--
## Input setter coercion
-->
## 입력값 보정하기

<!--
Occasionally it is desirable for the `@Input()` of a directive or component to alter the value bound to it, typically using a getter/setter pair for the input.
As an example, consider this custom button component:

Consider the following directive:
-->
디렉티브나 컴포넌트에 `@Input()`으로 바인딩하는 값의 타입을 변환하기 위해 게터(getter)와 세터(setter)를 활용하는 방법도 고려해볼만 합니다.
다음과 같은 커스텀 버튼 컴포넌트가 있다고 합시다:

```typescript
@Component({
  selector: 'submit-button',
  template: `
    <div class="wrapper">
      <button [disabled]="disabled">Submit</button>'
    </div>
  `,
})
class SubmitButton {
  private _disabled: boolean;

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }
}
```

<!--
Here, the `disabled` input of the component is being passed on to the `<button>` in the template. All of this works as expected, as long as a `boolean` value is bound to the input. But, suppose a consumer uses this input in the template as an attribute:
-->
이 컴포넌트의 입력 프로퍼티 `disabled`는 템플릿에 있는 `<button>`에 지정되는데, 이 로직이 제대로 동작하려면 입력으로 받는 값이 `boolean` 타입이어야 합니다.
하지만 다음과 같이 사용했다고 합시다:


```html
<submit-button disabled></submit-button>
```

<!--
This has the same effect as the binding:
-->
그러면 이 바인딩이 이렇게 연결됩니다:

```html
<submit-button [disabled]="''"></submit-button>
```

<!--
At runtime, the input will be set to the empty string, which is not a `boolean` value. Angular component libraries that deal with this problem often "coerce" the value into the right type in the setter:
-->
그래서 이 프로퍼티 값은 `boolean` 타입이 아니라 빈 문자열로 지정됩니다.
이런 오류를 방지하려면 세터를 사용해서 값을 보정해주면 됩니다:

```typescript
set disabled(value: boolean) {
  this._disabled = (value === '') || value;
}
```

<!--
It would be ideal to change the type of `value` here, from `boolean` to `boolean|''`, to match the set of values which are actually accepted by the setter.
TypeScript requires that both the getter and setter have the same type, so if the getter should return a `boolean` then the setter is stuck with the narrower type.

If the consumer has Angular's strictest type checking for templates enabled, this creates a problem: the empty string `''` is not actually assignable to the `disabled` field, which will create a type error when the attribute form is used.

As a workaround for this problem, Angular supports checking a wider, more permissive type for `@Input()` than is declared for the input field itself. Enable this by adding a static property with the `ngAcceptInputType_` prefix to the component class:
-->
이런식으로 구현한다면 세터로 전달되는 `value` 타입이 `boolean`가 아니라 `boolean|''`라고 지정하는 것이 더 정확합니다.
TypeScript에서는 게터와 세터를 같은 타입으로 지정해야 하기 때문에 게터에서 `boolean` 타입만 반환한다면 게터는 세터에 지정된 타입보다 더 제한된 타입을 사용하는 것이 됩니다.

이 컴포넌트를 사용하는 개발자가 템플릿에서 엄격한 타입 검사 모드를 활성화하면 `disabled` 필드에 빈 문자열 `''`을 할당했기 때문에 에러가 발생합니다.

이 문제를 해결하려면 `@Input()`으로 전달되는 값의 타입을 실제로 사용할 수 있는 타입만큼 추가해야 합니다.
컴포넌트 클래스에 `ngAcceptInputType_`이라는 접두사를 붙여 정적 프로퍼티를 추가해주면 됩니다:

```typescript
class SubmitButton {
  private _disabled: boolean;

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = (value === '') || value;
  }

  static ngAcceptInputType_disabled: boolean|'';
}
```

<!--
This field does not need to have a value. Its existence communicates to the Angular type checker that the `disabled` input should be considered as accepting bindings that match the type `boolean|''`. The suffix should be the `@Input` _field_ name.

Care should be taken that if an `ngAcceptInputType_` override is present for a given input, then the setter should be able to handle any values of the overridden type.
-->
새로 추가한 정적 필드는 실제 값을 가질 필요가 없습니다.
이 필드는 실제로 사용되는 필드가 아니라 `disabled` 프로퍼티의 타입이 `boolean|''`라는 것을 Angular 타입 검사 로직에게 알리는 역할을 합니다.
`ngAcceptInputType_` 뒤에 붙는 이름은 `@Input()` 으로 지정된 필드 이름과 같아야 합니다.

이렇게 작성하면 입력 프로퍼티에 지정된 타입을 `ngAcceptInputType_`이 오버라이드하기 때문에 세터로 받는 값도 오버라이드된 타입으로 사용할 수 있습니다.


<!--
## Disabling type checking using `$any()`
-->
## `$any()`로 타입 검사 우회하기

<!--
Disable checking of a binding expression by surrounding the expression in a call to the [`$any()` cast pseudo-function](guide/template-syntax).
The compiler treats it as a cast to the `any` type just like in TypeScript when a `<any>` or `as any` cast is used.

In the following example, casting `person` to the `any` type suppresses the error `Property address does not exist`.
-->
[`$any()` 타입 캐스팅 함수](guide/template-syntax#any-type-cast-function)를 사용하면 바인딩 표현식의 타입 검사를 우회할 수 있습니다.
`$any()` 함수를 실행하고 나면 이 함수의 인자로 전달한 객체는 TypeScript 코드에서 `<any>`나 `as any`를 사용한 것과 같은 효과를 받습니다.

그래서 아래 예제처럼 `person` 객체를 `any` 타입으로 캐스팅하면 `Property address does not exist`와 같은 타입 에러가 발생하지 않습니다.

```typescript
  @Component({
    selector: 'my-component',
    template: '{{$any(person).addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
```
