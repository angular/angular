<!--
# AOT metadata errors
-->
# AOT 메타데이터 에러

<!--
The following are metadata errors you may encounter, with explanations and suggested corrections.
-->
AOT 컴파일러를 사용하다보면 다음과 같은 에러가 발생할 수 있습니다.
이 에러가 왜 발생하는지, 어떻게 해결하면 되는지 알아봅시다.


[Expression form not supported](#expression-form-not-supported)<br>
[Reference to a local (non-exported) symbol](#reference-to-a-local-symbol)<br>
[Only initialized variables and constants](#only-initialized-variables)<br>
[Reference to a non-exported class](#reference-to-a-non-exported-class)<br>
[Reference to a non-exported function](#reference-to-a-non-exported-function)<br>
[Function calls are not supported](#function-calls-not-supported)<br>
[Destructured variable or constant not supported](#destructured-variable-not-supported)<br>
[Could not resolve type](#could-not-resolve-type)<br>
[Name expected](#name-expected)<br>
[Unsupported enum member name](#unsupported-enum-member-name)<br>
[Tagged template expressions are not supported](#tagged-template-expressions-not-supported)<br>
[Symbol reference expected](#symbol-reference-expected)<br>

<hr>

{@a expression-form-not-supported}
## Expression form not supported

<div class="alert is-helpful">

<!--
*The compiler encountered an expression it didn't understand while evaluating Angular metadata.*
-->
_메타데이터 표현식에 지원하지 않는 문법이 사용되었습니다._

</div>

<!--
Language features outside of the compiler's [restricted expression syntax](guide/aot-compiler#expression-syntax)
can produce this error, as seen in the following example:

```ts
// ERROR
export class Fooish { ... }
...
const prop = typeof Fooish; // typeof is not valid in metadata
  ...
  // bracket notation is not valid in metadata
  { provide: 'token', useValue: { [prop]: 'value' } };
  ...
```

You can use `typeof` and bracket notation in normal application code.
You just can't use those features within expressions that define Angular metadata.

Avoid this error by sticking to the compiler's [restricted expression syntax](guide/aot-compiler#expression-syntax)
when writing Angular metadata
and be wary of new or unusual TypeScript features.
-->
AOT 컴파일러는 [제한된 기능으로만 표현식 문법](guide/aot-compiler#expression-syntax)을 지원합니다.
다음과 같은 코드는 에러가 발생합니다:

```ts
// 에러
export class Fooish { ... }
...
const prop = typeof Fooish; // typeof는 메타데이터에 사용할 수 없습니다.
  ...
  // 메타데이터에서 대괄호 참조를 사용할 수 없습니다.
  { provide: 'token', useValue: { [prop]: 'value' } };
  ...
```

`typeof` 연산자나 대괄호 참조는 일반 애플리케이션에서 사용할 수 있는 코드입니다.
Angular 메타데이터와 관련된 표현식에서 이 표현을 사용할 수 없습니다.

이 에러를 해결하려면 Angular 메타데이터에 사용할 수 있는 [제한된 표현식 문법](guide/aot-compiler#expression-syntax)으로만 코드를 작성해야 합니다.
사용하려는 TypeScript 기능을 지원하는지 확인해 보세요.


<hr>

{@a reference-to-a-local-symbol}
## Reference to a local (non-exported) symbol

<div class="alert is-helpful">

<!--
_Reference to a local (non-exported) symbol 'symbol name'. Consider exporting the symbol._
-->
_로컬 심볼을 사용했습니다. 심볼을 파일 외부로 공개(export)하세요._

</div>

<!--
The compiler encountered a referenced to a locally defined symbol that either wasn't exported or wasn't initialized.

Here's a `provider` example of the problem.

```ts
// ERROR
let foo: number; // neither exported nor initialized

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```
The compiler generates the component factory, which includes the `useValue` provider code, in a separate module. _That_ factory module can't reach back to _this_ source module to access the local (non-exported) `foo` variable.

You could fix the problem by initializing `foo`.

```ts
let foo = 42; // initialized
```

The compiler will [fold](guide/aot-compiler#code-folding) the expression into the provider as if you had written this.

```ts
  providers: [
    { provide: Foo, useValue: 42 }
  ]
```

Alternatively, you can fix it by exporting `foo` with the expectation that `foo` will be assigned at runtime when you actually know its value.

```ts
// CORRECTED
export let foo: number; // exported

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

Adding `export` often works for variables referenced in metadata such as `providers` and `animations` because the compiler can generate _references_ to the exported variables in these expressions. It doesn't need the _values_ of those variables.

Adding `export` doesn't work when the compiler needs the _actual value_
in order to generate code.
For example, it doesn't work for the `template` property.

```ts
// ERROR
export let someTemplate: string; // exported but not initialized

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

The compiler needs the value of the `template` property _right now_ to generate the component factory.
The variable reference alone is insufficient.
Prefixing the declaration with `export` merely produces a new error, "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)".
-->
외부로 공개(export)되지 않은 심볼이 사용되었거나 이 변수가 초기화되지 않았을 때 발생합니다.

아래 코드에서 `provider`를 처리할 때 발생합니다.

```ts
// 에러
let foo: number; // export로 지정되지 않았으며 초기화되지도 않았습니다.

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

컴파일러는 다른 모듈에 있는 프로바이더를 참조하는 `useValue` 코드를 만났을 때 컴포넌트 팩토리를 생성합니다.
이 때 현재 모듈에서 사용하는 심볼 `foo`는 모듈 외부로 공개되지 않았기 때문에 다른 모듈에서 현재 소스 코드에 접근할 수 없습니다.

먼저 `foo`를 초기화하지 않은 문제부터 해결해 봅시다.

```ts
let foo = 42; // 초기화
```

그러면 컴파일러가 표현식을 [폴딩](guide/aot-compiler#code-folding)하면서 다음과 같은 형태로 변환합니다.

```ts
  providers: [
    { provide: Foo, useValue: 42 }
  ]
```

`foo` 변수값이 실행시점에 할당되기 때문에 이 변수를 사용하는 시점에 언제나 값이 존재한다면 `foo` 변수에 `export`를 지정하는 방법으로도 해결할 수 있습니다.

```ts
// 정상 코드
export let foo: number; // export로 지정됨

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

`export`를 지정하는 방식은 `providers`나 `animations`에 사용하는 변수에 지정하면 이 에러를 해결할 수 있습니다.
컴파일러는 이런 표현식을 처리할 때 변수를 _참조_ 하는 코드만 생성하기 때문입니다.
이 시점에는 변수에 어떤 값이 있느냐는 중요하지 않습니다.

하지만 컴파일러 처리 단계에서 _실제로 값이 필요한 경우_ 에는 사용할 수 없습니다.
아래 코드에서 `template` 프로퍼티는 동작하지 않습니다.


```ts
// 에러
export let someTemplate: string; // export가 지정되었지만 초기화되지 않았습니다.

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

컴파일러가 컴포넌트 팩토리를 생성하려면 `template` 프로퍼티 값이 _컴파일러 처리 시점_ 에 필요합니다.
변수만 지정하는 것으로는 해결되지 않습니다.

때로는 `export`를 지정하더라도 "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)" 에러가 발생할 수 있으니 주의하세요.


<hr>

{@a only-initialized-variables}
## Only initialized variables and constants

<div class="alert is-helpful">

<!--
_Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler._
-->
_템플릿 컴파일러가 참조하는 변수의 값이 할당되지 않았습니다._

</div>

<!--
The compiler found a reference to an exported variable or static field that wasn't initialized.
It needs the value of that variable to generate code.

The following example tries to set the component's `template` property to the value of
the exported `someTemplate` variable which is declared but _unassigned_.

```ts
// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

You'd also get this error if you imported `someTemplate` from some other module and neglected to initialize it there.

```ts
// ERROR - not initialized there either
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

The compiler cannot wait until runtime to get the template information.
It must statically derive the value of the `someTemplate` variable from the source code
so that it can generate the component factory, which includes
instructions for building the element based on the template.

To correct this error, provide the initial value of the variable in an initializer clause _on the same line_.

```ts
// CORRECTED
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```
-->
컴파일러가 참조하는 `export` 변수나 정적 필드의 값이 할당되지 않았을 때 발생합니다.
코드를 생성하려면 이 변수의 값이 필요합니다.

아래 코드에서 컴포넌트 `template` 프로퍼티에 사용된 변수 `someTemplate`는 `export`가 지정되었지만 값이 _할당되지 않았습니다_.

```ts
// 에러
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

이 에러는 `someTemplate` 변수를 다른 모듈에서 참조해 오는 경우에도 발생할 수 있습니다.

```ts
// 에러 - 다른 모듈에서도 초기화하지 않은 경우
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

템플릿 정보를 처리하는 시점은 실행시점까지 미뤄둘 수 없습니다.
컴포넌트 팩토리 코드를 생성하려면 `someTemplate` 변수의 실제 값이 반드시 지정되어 있어야 합니다.
그래야 템플릿 안에 사용된 다른 엘리먼트를 확인할 수 있습니다.

이 에러를 해결하려면 변수의 초기값을 할당하면 됩니다.


```ts
// 정상 코드
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```


<hr>

{@a reference-to-a-non-exported-class}
## Reference to a non-exported class

<div class="alert is-helpful">

<!--
_Reference to a non-exported class <class name>. Consider exporting the class._
-->
_외부로 공개(export)되지 않은 클래스 이름이 사용되었습니다. 클래스를 파일 외부로 공개하세요._

</div>

<!--
Metadata referenced a class that wasn't exported.

For example, you may have defined a class and used it as an injection token in a providers array
but neglected to export that class.

```ts
// ERROR
abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```

Angular generates a class factory in a separate module and that
factory [can only access exported classes](guide/aot-compiler#exported-symbols).
To correct this error, export the referenced class.

```ts
// CORRECTED
export abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```
-->
메타데이터에서 외부로 공개되지 않은 클래스를 참조했습니다.

클래스를 선언해서 프로바이더 배열에 추가했지만 이 클래스가 파일 외부로 공개되지 않았을 때 발생합니다.

```ts
// 에러
abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```

Angular는 별도 모듈로 클래스 팩토리를 생성하기 때문에 [외부로 공개된 클래스만 참조할 수 있습니다](guide/aot-compiler#exported-symbols).
이 에러를 해결하려면 클래스에 `export`를 붙이면 됩니다.

```ts
// 정상 코드
export abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```


<hr>

{@a reference-to-a-non-exported-function}
## Reference to a non-exported function

<div class="alert is-helpful">

<!--
*Metadata referenced a function that wasn't exported.*
-->
*메타데이터에서 외부로 공개되지 않은 함수를 참조했습니다.*

</div>

<!--
For example, you may have set a providers `useFactory` property to a locally defined function that you neglected to export.

```ts
// ERROR
function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```

Angular generates a class factory in a separate module and that
factory [can only access exported functions](guide/aot-compiler#exported-symbols).
To correct this error, export the function.

```ts
// CORRECTED
export function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```
-->
프로바이더에 `useFactory`를 사용했는데, 이 때 외부로 공개되지 않은 로컬 함수를 사용했을 때 발생합니다.

```ts
// 에러
function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```

Angular는 별도 모듈로 클래스 팩토리를 생성하기 때문에 [외부로 공개된 함수만 참조할 수 있습니다](guide/aot-compiler#exported-symbols).
이 에러를 해결하려면 함수에 `export`를 붙이면 됩니다.

```ts
// 정상 코드
export function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```


<hr>

{@a function-calls-not-supported}
## Function calls are not supported

<div class="alert is-helpful">

_Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function._

</div>

The compiler does not currently support [function expressions or lambda functions](guide/aot-compiler#function-expression).
For example, you cannot set a provider's `useFactory` to an anonymous function or arrow function like this.

```ts
// ERROR
  ...
  providers: [
    { provide: MyStrategy, useFactory: function() { ... } },
    { provide: OtherStrategy, useFactory: () => { ... } }
  ]
  ...
```
You also get this error if you call a function or method in a provider's `useValue`.

```ts
// ERROR
import { calculateValue } from './utilities';

  ...
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  ...
```

To correct this error, export a function from the module and refer to the function in a `useFactory` provider instead.

```ts
// CORRECTED
import { calculateValue } from './utilities';

export function myStrategy() { ... }
export function otherStrategy() { ... }
export function someValueFactory() {
  return calculateValue();
}
  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy },
    { provide: OtherStrategy, useFactory: otherStrategy },
    { provide: SomeValue, useFactory: someValueFactory }
  ]
  ...
```

<hr>

{@a destructured-variable-not-supported}
## Destructured variable or constant not supported

<div class="alert is-helpful">

_Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring._

</div>

The compiler does not support references to variables assigned by [destructuring](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

For example, you cannot write something like this:

```ts
// ERROR
import { configuration } from './configuration';

// destructured assignment to foo and bar
const {foo, bar} = configuration;
  ...
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  ...
```

To correct this error, refer to non-destructured values.

```ts
// CORRECTED
import { configuration } from './configuration';
  ...
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  ...
```

<hr>

{@a could-not-resolve-type}
## Could not resolve type

<div class="alert is-helpful">

*The compiler encountered a type and can't determine which module exports that type.*

</div>

This can happen if you refer to an ambient type.
For example, the `Window` type is an ambient type declared in the global `.d.ts` file.

You'll get an error if you reference it in the component constructor,
which the compiler must statically analyze.

```ts
// ERROR
@Component({ })
export class MyComponent {
  constructor (private win: Window) { ... }
}
```
TypeScript understands ambient types so you don't import them.
The Angular compiler does not understand a type that you neglect to export or import.

In this case, the compiler doesn't understand how to inject something with the `Window` token.

Do not refer to ambient types in metadata expressions.

If you must inject an instance of an ambient type,
you can finesse the problem in four steps:

1. Create an injection token for an instance of the ambient type.
1. Create a factory function that returns that instance.
1. Add a `useFactory` provider with that factory function.
1. Use `@Inject` to inject the instance.

Here's an illustrative example.

```ts
// CORRECTED
import { Inject } from '@angular/core';

export const WINDOW = new InjectionToken('Window');
export function _window() { return window; }

@Component({
  ...
  providers: [
    { provide: WINDOW, useFactory: _window }
  ]
})
export class MyComponent {
  constructor (@Inject(WINDOW) private win: Window) { ... }
}
```

The `Window` type in the constructor is no longer a problem for the compiler because it
uses the `@Inject(WINDOW)` to generate the injection code.

Angular does something similar with the `DOCUMENT` token so you can inject the browser's `document` object (or an abstraction of it, depending upon the platform in which the application runs).

```ts
import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({ ... })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { ... }
}
```
<hr>

{@a name-expected}
## Name expected

<div class="alert is-helpful">

*The compiler expected a name in an expression it was evaluating.*

</div>

This can happen if you use a number as a property name as in the following example.

```ts
// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]
```

Change the name of the property to something non-numeric.

```ts
// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]
```

<hr>

{@a unsupported-enum-member-name}
## Unsupported enum member name

<div class="alert is-helpful">

*Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html) that you referenced in metadata.*

</div>

The compiler can understand simple enum values but not complex values such as those derived from computed properties.

```ts
// ERROR
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // computed
}

  ...
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  ...
```

Avoid referring to enums with complicated initializers or computed properties.

<hr>

{@a tagged-template-expressions-not-supported}
## Tagged template expressions are not supported

<div class="alert is-helpful">

_Tagged template expressions are not supported in metadata._

</div>

The compiler encountered a JavaScript ES2015 [tagged template expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) such as the following.

```ts
// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 ...
 template: '<div>' + raw + '</div>'
 ...
```
[`String.raw()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
is a _tag function_ native to JavaScript ES2015.

The AOT compiler does not support tagged template expressions; avoid them in metadata expressions.

<hr>

{@a symbol-reference-expected}
## Symbol reference expected

<div class="alert is-helpful">

*The compiler expected a reference to a symbol at the location specified in the error message.*

</div>

This error can occur if you use an expression in the `extends` clause of a class.

<!--

Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495).

-->
