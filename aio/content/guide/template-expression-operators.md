<!-- {@a expression-operators} -->

<!--
# Template expression operators
-->
# 템필릿 표현식 연산자

<!--
The Angular template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover three of these operators:

* [pipe](guide/template-expression-operators#pipe)
* [safe navigation operator](guide/template-expression-operators#safe-navigation-operator)
* [non-null assertion operator](guide/template-expression-operators#non-null-assertion-operator)

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>
-->
Angular가 제공하는 템플릿 표현식 문법은 JavaScript 문법 일부를 활용하는 것이며, 여기에 Angular용 연산자 몇가지 추가되었습니다.
이 문서에서는 다음 3개의 연산자에 대해 알아봅시다:

* [파이프](guide/template-expression-operators#pipe)
* [안전 참조 연산자, `?`](guide/template-expression-operators#safe-navigation-operator)
* [null값 아님 보장 연산자, `!`](guide/template-expression-operators#non-null-assertion-operator)

<div class="alert is-helpful">

이 문서에서 다루는 예제는 <live-example></live-example>에서 직접 확인하거나 다운받아 확인할 수 있습니다.

</div>


{@a pipe}

<!--
## The pipe operator (`|`)
-->
## 파이프 연산자 (`|`)

<!--
The result of an expression might require some transformation before you're ready to use it in a binding.
For example, you might display a number as a currency, change text to uppercase, or filter a list and sort it.

Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the pipe operator (`|`):

<code-example path="template-expression-operators/src/app/app.component.html" region="uppercase-pipe" header="src/app/app.component.html"></code-example>

The pipe operator passes the result of an expression on the left to a pipe function on the right.

You can chain expressions through multiple pipes:

<code-example path="template-expression-operators/src/app/app.component.html" region="pipe-chain" header="src/app/app.component.html"></code-example>

And you can also [apply parameters](guide/pipes#parameterizing-a-pipe) to a pipe:

<code-example path="template-expression-operators/src/app/app.component.html" region="date-pipe" header="src/app/app.component.html"></code-example>

The `json` pipe is particularly helpful for debugging bindings:

<code-example path="template-expression-operators/src/app/app.component.html" region="json-pipe" header="src/app/app.component.html"></code-example>

The generated output would look something like this:

<code-example language="json">
  { "name": "Telephone",
    "manufactureDate": "1980-02-25T05:00:00.000Z",
    "price": 98 }
</code-example>

<div class="alert is-helpful">

The pipe operator has a higher precedence than the ternary operator (`?:`),
which means `a ? b : c | x` is parsed as `a ? b : (c | x)`.
Nevertheless, for a number of reasons,
the pipe operator cannot be used without parentheses in the first and second operands of `?:`.
A good practice is to use parentheses in the third operand too.

</div>
-->
표현식이 실행된 결과를 DOM에 바인딩하기 전에 원하는 형식으로 변환해야 하는 경우가 있습니다.
숫자를 통화 단위로 변환하거나, 문자열을 대문자로 변환하고, 배열을 필터링하거나 정렬하는 경우가 그렇습니다.

파이프(Pipe)는 입력값을 하나 받아서 간단하게 형태를 변환하는 함수를 의미합니다.
파이프는 템플릿 표현식에 파이프 연산자(`|`)를 붙이기만 하면 쉽게 적용할 수 있습니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="uppercase-pipe" header="src/app/app.component.html"></code-example>

파이프 연산자를 사용하면 파이프 연산자 왼쪽에 있는 표현식의 결과값이 파이프 연산자 오른쪽에 지정된 파이프 함수로 전달됩니다.

그리고 파이프 여러개를 체이닝하는 형태로 사용할 수도 있습니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="pipe-chain" header="src/app/app.component.html"></code-example>

그리고 파이프에는 [추가 인자](guide/pipes#parameterizing-a-pipe)를 함께 전달할 수도 있습니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="date-pipe" header="src/app/app.component.html"></code-example>

특히 `json` 파이프는 바인딩 표현식을 디버깅하는 용도로 활용하기 좋습니다:

<code-example path="template-expression-operators/src/app/app.component.html" region="json-pipe" header="src/app/app.component.html"></code-example>

`json` 파이프를 거치면 `item` 객체가 이렇게 변환됩니다:

<code-example language="json">
  { "name": "Telephone",
    "manufactureDate": "1980-02-25T05:00:00.000Z",
    "price": 98 }
</code-example>

<div class="alert is-helpful">

파이프 연산자는 삼항연산자(`?:`)보다 우선순위가 높기 때문에 `a ? b : c | x` 라는 표현식은 `a ? b : (c | x)` 라는 표현식과 같습니다.
그래서 삼항연산자와 파이프를 함께 사용할 때는 괄호(`()`)를 사용해서 우선순위를 정확하게 지정하는 것이 좋습니다.


</div>


<hr/>

{@a safe-navigation-operator}

<!--
## The safe navigation operator ( `?` ) and null property paths
-->
## 안전 참조 연산자 (`?`)

<!--
The Angular safe navigation operator, `?`, guards against `null` and `undefined`
values in property paths. Here, it protects against a view render failure if `item` is `null`.

<code-example path="template-expression-operators/src/app/app.component.html" region="safe" header="src/app/app.component.html"></code-example>

If `item` is `null`, the view still renders but the displayed value is blank; you see only "The item name is:" with nothing after it.

Consider the next example, with a `nullItem`.

<code-example language="html">
  The null item name is {{nullItem.name}}
</code-example>

Since there is no safe navigation operator and `nullItem` is `null`, JavaScript and Angular would throw a `null` reference error and break the rendering process of Angular:

<code-example language="bash">
  TypeError: Cannot read property 'name' of null.
</code-example>

Sometimes however, `null` values in the property
path may be OK under certain circumstances,
especially when the value starts out null but the data arrives eventually.

With the safe navigation operator, `?`, Angular stops evaluating the expression when it hits the first `null` value and renders the view without errors.

It works perfectly with long property paths such as `a?.b?.c?.d`.
-->
Angular 안전 참조 연산자(safe navigation operator, `?`)를 사용하면 프로퍼티를 참조하는 경로에 있는 `null` 값과 `undefined` 값을 방지할 수 있습니다.
그래서 아래처럼 사용하면 `item` 값이 `null`일 때 템플릿을 렌더링하다 발생하는 에러를 방지할 수 있습니다.

<code-example path="template-expression-operators/src/app/app.component.html" region="safe" header="src/app/app.component.html"></code-example>

이제 `item` 값이 `null`이면 `{{item?.name}}` 쪽은 빈칸으로 처리되어 "The Item name is:" 라는 문구만 화면에 표시됩니다.

`nullItem`의 경우를 생각해 봅시다.

<code-example language="html">
  The null item name is {{nullItem.name}}
</code-example>

이 코드에는 안전 참조 연산자가 사용되지 않았습니다.
그러면 `nullItem` 값이 `null` 일 때 `null` 객체를 참조할 수 없기 때문에 JavaScript와 Angular 쪽에서 에러가 발생하며 이런 에러 메시지를 표시하면서 렌더링도 실패합니다:

<code-example language="bash">
  TypeError: Cannot read property 'name' of null.
</code-example>

하지만 프로퍼티를 참조하는 중간에 `null`이 있다고 해서 항상 잘못된 경우는 아닙니다.
외부에서 데이터를 받아오기 전까지는 프로퍼티 값이 제대로 들어있지 않을 수도 있습니다.

이 때 안전 참조 연산자 `?`를 사용하면 Angular가 템플릿 표현식을 평가하다가 `null` 값을 만났을 때 실행을 중단하며 에러 없이 렌더링을 끝낼 수 있습니다.

프로퍼티를 참조하는 경로가 `a?.b?.c?.d`처럼 길더라도 전혀 문제되지 않습니다.


<hr/>

{@a non-null-assertion-operator}

<!--
## The non-null assertion operator ( `!` )
-->
## null값 아님 보장 연산자 (`!`)

<!--
As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is unintentionally `null` or `undefined`.

In this mode, typed variables disallow `null` and `undefined` by default. The type checker throws an error if you leave a variable unassigned or try to assign `null` or `undefined` to a variable whose type disallows `null` and `undefined`.

The type checker also throws an error if it can't determine whether a variable will be `null` or `undefined` at runtime. You tell the type checker not to throw an error by applying the postfix
[non-null assertion operator, !](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").

The Angular non-null assertion operator, `!`, serves the same purpose in
an Angular template. For example, you can assert that `item` properties are also defined.

<code-example path="template-expression-operators/src/app/app.component.html" region="non-null" header="src/app/app.component.html"></code-example>

When the Angular compiler turns your template into TypeScript code,
it prevents TypeScript from reporting that `item.color` might be `null` or `undefined`.

Unlike the [_safe navigation operator_](guide/template-expression-operators#safe-navigation-operator "Safe navigation operator (?)"),
the non-null assertion operator does not guard against `null` or `undefined`.
Rather, it tells the TypeScript type checker to suspend strict `null` checks for a specific property expression.

The non-null assertion operator, `!`, is optional with the exception that you must use it when you turn on strict null checks.
-->
TypeScript는 2.0 버전부터는 `--strictNullChecks` 옵션으로 [엄격한 null 검사 기능](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript")을 활성화 할 수 있습니다.
이 기능을 활성화하면 변수 값이 `null`이나 `undefined`가 되는 것을 방지합니다.

이 기능을 활성화한 상태에서는 `null` 값이나 `undefined` 값을 기본값으로 사용할 수 없습니다.
그리고 변수의 값을 할당하지 않거나 `null`, `undefined` 값으로 할당하는 경우에도 오류가 발생합니다.

그리고 이 기능을 활성화하면 실행되는 시점에 변수의 값이 `null`이나 `undefined`가 될 수 있는 경우도 감지해서 오류로 판단합니다.
[null값 아님 보장 연산자 (non-null assertion operator, `!`)](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator")는 이런 오류를 방지할 때 사용합니다.

Angular null값 아님 보장 연산자(`!`)도 Angular 템플릿에서 똑같은 역할을 합니다.
`item` 프로퍼티를 활용하는 코드가 다음과 같이 있다고 합시다.

<code-example path="template-expression-operators/src/app/app.component.html" region="non-null" header="src/app/app.component.html"></code-example>

Angular 컴파일러가 이 템플릿 코드를 TypeScript 코드로 바꾸고 나면 `item.color` 값이 `null`이나 `undefined`가 될 수 있기 때문에 TypeScript 쪽에서 오류로 판단하고 에러를 발생시킵니다.

하지만 [_안전 참조 연산자_](guide/template-expression-operators#safe-navigation-operator "Safe navigation operator (?)")와는 다르게, null값 아님 보장 연산자는 `null` 값이나 `undefined` 값이 발생하는 것을 막지 않습니다.
그래서 이런 경우에는 TypeScript 타입 검사기에게 이 표현식에 대해서는 엄격한 `null` 검사를 잠시 미뤄두도록 지정할 수 있습니다.

null값 아님 보장 연산자 `!`를 꼭 사용해야 하는 것은 아니지만, 엄격한 null 검사 모드를 활성화하면 종종 사용하게 될 것입니다.


{@a any-type-cast-function}
{@a the-any-type-cast-function}

<!--
## The `$any()` type cast function
-->
## 타입 캐스팅 함수 `$any()`

<!--
Sometimes a binding expression triggers a type error during [AOT compilation](guide/aot-compiler) and it is not possible or difficult to fully specify the type.
To silence the error, you can use the `$any()` cast function to cast
the expression to the [`any` type](http://www.typescriptlang.org/docs/handbook/basic-types.html#any) as in the following example:

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-1" header="src/app/app.component.html"></code-example>

When the Angular compiler turns this template into TypeScript code,
it prevents TypeScript from reporting that `bestByDate` is not a member of the `item`
object when it runs type checking on the template.

The `$any()` cast function also works with `this` to allow access to undeclared members of
the component.

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-2" header="src/app/app.component.html"></code-example>

The `$any()` cast function works anywhere in a binding expression where a method call is valid.
-->
사용할 수 없는 타입의 변수를 사용했거나 변수의 타입을 제대로 추론할 수 없는 경우에는 [AOT 컴파일](guide/aot-compiler) 중에 타입 에러가 발생할 수 있습니다.
이 에러를 방지하려면 `$any()` 캐스팅 함수를 사용해서 표현식을 [`any` 타입](http://www.typescriptlang.org/docs/handbook/basic-types.html#any)으로 캐스팅하면 됩니다:

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-1" header="src/app/app.component.html"></code-example>

Angular 컴파일러가 이 템플릿을 TypeScript 코드로 변환하면 `bestByDate`가 `item` 객체에 존재하지 않기 때문에 TypeScript 쪽에서는 에러로 판단하지만, 이 에러를 무시하고 컴파일을 진행할 수 있습니다.

`$any()` 캐스팅 함수는 컴포넌트 멤버를 참조하는 `this`에도 사용할 수 있습니다.

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-2" header="src/app/app.component.html"></code-example>

`$any()` 캐스팅 함수는 존재하지 않는 멤버나 메소드를 참조하지만 않는다면 어디에라도 자유롭게 사용할 수 있습니다.


