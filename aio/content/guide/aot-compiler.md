<!--
# The Ahead-of-Time (AOT) Compiler
-->
# Ahead-of-Time (AOT) 컴파일러

<!--
An Angular application consists mainly of components and their HTML templates. Because the components and templates provided by Angular cannot be understood by the browser directly, Angular applications require a compilation process before they can run in a browser.

The Angular Ahead-of-Time (AOT) compiler converts your Angular HTML and TypeScript code into efficient JavaScript code during the build phase _before_ the browser downloads and runs that code. Compiling your application during the build process provides a faster rendering in the browser.

This guide explains how to specify metadata and apply available compiler options to compile your applications efficiently using the AOT compiler.
-->
Angular 애플리케이션은 크게 컴포넌트와 컴포넌트 HTML 템플릿으로 구성됩니다. 그런데 이 컴포넌트와 템플릿은 브라우저가 바로 이해할 수 없기 때문에 Angular 애플리케이션은 브라우저에서 실행되기 전에 컴파일되어야 합니다.

Angular Ahead-of-Time (AOT) 컴파일러를 사용하면 Angular 문법이 사용된 HTML과 TypeScript 코드를 JavaScript 코드로 변환할 수 있습니다. 이 때 애플리케이션은 브라우저가 다운받아 실행하기 전에 미리 컴파일되기 때문에 브라우저가 직접 처리하고 렌더링하는 시간을 줄일 수 있습니다.

이 문서는 애플리케이션을 AOT 컴파일러로 컴파일 할 때 메타데이터를 어떻게 지정해야 하는지, 컴파일러에 사용할 수 있는 옵션은 어떤 것들이 있는지 설명합니다.

<div class="alert is-helpful">

  <!--
  <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">Watch compiler author Tobias Bosch explain the Angular compiler</a> at AngularConnect 2016.
  -->
  컴파일러를 개발한 Tobias Bosch가 <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">AngularConnect 2016에서 발표한 내용</a>도 확인해 보세요.

</div>

{@a overview}

<!--
## Angular compilation
-->
## Angular의 컴파일

<!--
Angular offers two ways to compile your application:
-->
Angular는 두 종류의 컴파일 방식을 제공합니다:

<!--
1. **_Just-in-Time_ (JIT)**, which compiles your app in the browser at runtime.
1. **_Ahead-of-Time_ (AOT)**, which compiles your app at build time.
-->
1. **_Just-in-Time_ (JIT)**: 브라우저에서 애플리케이션을 실행하면서 코드를 직접 컴파일하는 방식입니다.
1. **_Ahead-of-Time_ (AOT)**: 브라우저에 애플리케이션 코드를 보내기 전에 미리 컴파일하는 방식입니다.

<!--
JIT compilation is the default when you run the [`ng build`](cli/build) (build only) or [`ng serve`](cli/serve)  (build and serve locally) CLI commands: 
-->
Angular CLI로 [`ng build`](cli/build) 명령이나 [`ng serve`](cli/serve) 명령을 실행하면 기본적으로 JIT 컴파일러가 실행됩니다:

<code-example language="sh" class="code-shell">
  ng build
  ng serve
</code-example>

{@a compile}

<!--
For AOT compilation, include the `--aot` option with the `ng build` or `ng serve` command:
-->
그리고 AOT 컴파일러를 사용하려면 `ng build` 명령이나 `ng serve` 명령을 실행할 때 `--aot` 옵션을 사용하면 됩니다:

<code-example language="sh" class="code-shell">
  ng build --aot
  ng serve --aot
</code-example>

<div class="alert is-helpful">

<!--
The `ng build` command with the `--prod` meta-flag (`ng build --prod`) compiles with AOT by default.

See the [CLI command reference](cli) and [Building and serving Angular apps](guide/build) for more information.
-->
`ng build` 명령을 실행할 때 `--prod` 옵션을 사용하면 AOT 컴파일러가 기본으로 실행됩니다.

더 자세한 내용은 [Angular CLI](cli) 문서와 [Angular 앱 빌드하고 실행하기](guide/build) 문서를 참고하세요.

</div>

{@a why-aot}

<!--
## Why compile with AOT?
-->
## 왜 AOT 방식으로 컴파일 하나요?

<!--
*Faster rendering*

With AOT, the browser downloads a pre-compiled version of the application.
The browser loads executable code so it can render the application immediately, without waiting to compile the app first.
-->
*렌더링 시간 단축*

AOT 방식으로 컴파일하면 브라우저가 미리 컴파일된 애플리케이션 코드를 내려받습니다.
그런데 이 코드는 브라우저가 직접 실행할 수 있도록 변환된 코드이기 때문에, 브라우저는 코드를 컴파일하는 과정없이 바로 실행할 수 있습니다.

<!--
*Fewer asynchronous requests*

The compiler _inlines_ external HTML templates and CSS style sheets within the application JavaScript,
eliminating separate ajax requests for those source files.
-->

<!--
*Smaller Angular framework download size*

There's no need to download the Angular compiler if the app is already compiled.
The compiler is roughly half of Angular itself, so omitting it dramatically reduces the application payload.
-->
*내려받는 Angular 프레임워크 크기 감소*

AOT 컴파일 방식을 사용하면 클라이언트가 애플리케이션 코드를 내려받기 전에 미리 애플리케이션을 빌드하기 때문에 클라이언트에서 Angular 컴파일러를 내려받지 않아도 됩니다.
Angular 컴파일러의 크기는 Angular 프레임워크 전체 크기의 반 정도를 차지합니다. AOT 컴파일 방식을 사용하면 이 용량을 내려받지 않아도 됩니다.

<!--
*Detect template errors earlier*

The AOT compiler detects and reports template binding errors during the build step
before users can see them.
-->
*템플릿 에러를 미리 검증*

AOT 컴파일러를 사용하면 실행 단계가 아니라 빌드 단계에서 템플릿 바인딩 에러를 검사합니다.

<!--
*Better security*

AOT compiles HTML templates and components into JavaScript files long before they are served to the client.
With no templates to read and no risky client-side HTML or JavaScript evaluation,
there are fewer opportunities for injection attacks.
-->
*더 나은 보안*

AOT 컴파일 방식을 사용하면 HTML 템플릿과 컴포넌트 코드가 모두 JavaScript로 변환되어 클라이언트에 제공됩니다.
그래서 클라이언트에 존재하는 HTML 문서나 JavaScript가 없기 때문에, 인젝션 공격의 기회를 상당수 차단할 수 있습니다.

<!--
## Controlling app compilation
-->
## 앱 컴파일 과정 제어하기

<!--
When you use the Angular AOT compiler, you can control your app compilation in two ways:

* By providing template compiler options in the `tsconfig.json` file.

      For more information, see [Angular template compiler options](#compiler-options).

* By [specifying Angular metadata](#metadata-aot).
-->
Angular AOT 컴파일러를 사용하면 이 컴파일 과정을 두 가지 방법으로 제어할 수 있습니다:

* 템플릿 컴파일러 옵션은 `tsconfig.json` 파일에 지정할 수 있습니다.

      자세한 내용은 [Angular 템플릿 컴파일러 옵션](#compiler-options) 섹션을 참고하세요.

* [Angular 메타데이터](#metadata-aot)로 옵션을 지정할 수 있습니다.

{@a metadata-aot}
<!--
## Specifying Angular metadata
-->
## Angular 메타데이터에 컴파일 옵션 지정하기

<!--
Angular metadata tells Angular how to construct instances of your application classes and interact with them at runtime.
The Angular **AOT compiler** extracts **metadata** to interpret the parts of the application that Angular is supposed to manage.

You can specify the metadata with **decorators** such as `@Component()` and `@Input()` or implicitly in the constructor declarations of these decorated classes.
-->
Angular 메타데이터는 Angular가 실행시점에 애플리케이션 클래스를 어떻게 인스턴스로 생성하고 조합할지 지정하기 위해 사용합니다.
그래서 Angular **AOT 컴파일러**는 애플리케이션 코드에 있는 **메타데이터**를 추출해서 Angular가 처리할 수 있도록 변환합니다.

클래스에 사용하는 `@Component()` 데코레이터나 클래스 멤버에 사용하는 `@Input()` 데코레이터가 이런 용도로 사용되는 메타데이터입니다.

<!--
In the following example, the `@Component()` metadata object and the class constructor tell Angular how to create and display an instance of `TypicalComponent`.
-->
아래 코드에서 `@Component()`에 지정하는 메타데이터 객체와 클래스 생성자는 Angular가 `TypicalComponent`의 인스턴스를 어떻게 생성하고 처리해야 할지 지정하는 용도로 사용됩니다.

```typescript
@Component({
  selector: 'app-typical',
  template: '<div>A typical component for {{data.name}}</div>'
)}
export class TypicalComponent {
  @Input() data: TypicalData;
  constructor(private someService: SomeService) { ... }
}
```

<!--
The Angular compiler extracts the metadata _once_ and generates a _factory_ for `TypicalComponent`.
When it needs to create a `TypicalComponent` instance, Angular calls the factory, which produces a new visual element, bound to a new instance of the component class with its injected dependency.
-->
이 코드를 Angular 컴파일러가 처리하면 메타데이터를 추출해서 `TypicalComponent`에 대한 _팩토리_ 를 만듭니다.
그러면 `TypicalComponent`의 인스턴스가 필요한 시점에 Angular가 팩토리를 실행해서 인스턴스를 생성하며, 이렇게 생성된 인스턴스를 의존성으로 주입합니다.

<!--
## Metadata restrictions
-->
## 메타데이터의 제약사항

<!--
You write metadata in a _subset_ of TypeScript that must conform to the following general constraints:
-->
메타데이터는 TypeScript의 _하위 집합(subset)_ 이며 보통 다음과 같은 제약사항이 있습니다:

<!--
1. Limit [expression syntax](#expression-syntax) to the supported subset of JavaScript.
2. Only reference exported symbols after [code folding](#folding).
3. Only call [functions supported](#supported-functions) by the compiler.
4. Decorated and data-bound class members must be public.
-->
1. JavaScript 문법 중 [표현식(expression syntax)](#expression-syntax)은 일부만 사용할 수 있습니다.
2. [코드를 폴딩](#folding)한 이후에 존재하는 심볼만 참조할 수 있습니다.
3. 컴파일러가 지원하는 [일부 함수](#supported-functions)만 사용할 수 있습니다.
4. 데코레이터가 사용되거나 데이터 바인딩되는 클래스 멤버는 public으로 지정되어야 합니다.

<!--
The next sections elaborate on these points.
-->
이 내용에 대해 자세하게 알아봅시다.

<!--
## How AOT works
-->
## AOT가 동작하는 방식

<!--
It helps to think of the AOT compiler as having two phases: a code analysis phase in which it simply records a representation of the source; and a code generation phase in which the compiler's `StaticReflector` handles the interpretation as well as places restrictions on what it interprets.
-->
AOT 컴파일러의 동작은 두 단계로 나누어 보는 것이 이해하기 편합니다. 첫 번째 단계는 코드를 분석하는 단계이며, 두 번째 단계는 Angular 컴파일러 내부의 `StaticReflector`를 사용해서 코드를 생성하는 단계입니다.

<!--
## Phase 1: analysis
-->
## 1단계: 분석

<!--
The TypeScript compiler does some of the analytic work of the first phase. It emits the `.d.ts` _type definition files_ with type information that the AOT compiler needs to generate application code.

At the same time, the AOT **_collector_** analyzes the metadata recorded in the Angular decorators and outputs metadata information in **`.metadata.json`** files, one per `.d.ts` file.

You can think of `.metadata.json` as a diagram of the overall structure of a decorator's metadata, represented as an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree).
-->
첫번째 단계에서는 TypeScript 컴파일러가 분석과 관련된 작업을 합니다. TypeScript 컴파일러가 코드를 컴파일하고 나면 _타입 정의 파일_ 인 `.d.ts` 파일이 생성되며, 이 정보는 이후에 AOT 컴파일러가 애플리케이션 코드를 생성할 때 사용합니다.

그리고 이 때 AOT **_콜렉터(collector)_**가 각 `.d.ts` 파일에 있는 Angular 데코레이터의 메타데이터를 분석하고 분석한 내용을 **`.metadata.json`** 파일로 생성합니다.

`.metadata.json` 파일은 데코레이터의 메타데이터를 나타내는 청사진이라고도 볼 수 있습니다. [추상 구문 트리(abstract syntax tree, AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)를 참고하세요.

<div class="alert is-helpful">

<!--
Angular's [schema.ts](https://github.com/angular/angular/blob/master/packages/compiler-cli/src/metadata/schema.ts)
describes the JSON format as a collection of TypeScript interfaces.
-->
Angular가 생성하는 [schema.ts](https://github.com/angular/angular/blob/master/packages/compiler-cli/src/metadata/schema.ts) 파일은 TypeScript 인터페이스를 JSON 형식으로 기술하는 파일입니다.

</div>

{@a expression-syntax}
<!--
### Expression syntax
-->
### 표현식 (Expression syntax)

<!--
The _collector_ only understands a subset of JavaScript.
Define metadata objects with the following limited syntax:
-->
Angular _콜렉터(collector)_ 는 JavaScript의 하위집합이며 JavaScript 문법 중 일부만 처리할 수 있습니다.
그래서 메타데이터에는 다음과 같은 문법만 허용됩니다:

<style>
  td, th {vertical-align: top}
</style>

<!--
<table>
  <tr>
    <th>Syntax</th>
    <th>Example</th>
  </tr>
  <tr>
    <td>Literal object </td>
    <td><code>{cherry: true, apple: true, mincemeat: false}</code></td>
  </tr>
  <tr>
    <td>Literal array  </td>
    <td><code>['cherries', 'flour', 'sugar']</code></td>
  </tr>
  <tr>
    <td>Spread in literal array</td>
    <td><code>['apples', 'flour', ...the_rest]</code></td>
  </tr>
   <tr>
    <td>Calls</td>
    <td><code>bake(ingredients)</code></td>
  </tr>
   <tr>
    <td>New</td>
    <td><code>new Oven()</code></td>
  </tr>
   <tr>
    <td>Property access</td>
    <td><code>pie.slice</code></td>
  </tr>
   <tr>
    <td>Array index</td>
    <td><code>ingredients[0]</code></td>
  </tr>
   <tr>
    <td>Identity reference</td>
    <td><code>Component</code></td>
  </tr>
   <tr>
    <td>A template string</td>
    <td><code>`pie is ${multiplier} times better than cake`</code></td>
   <tr>
    <td>Literal string</td>
    <td><code>pi</code></td>
  </tr>
   <tr>
    <td>Literal number</td>
    <td><code>3.14153265</code></td>
  </tr>
   <tr>
    <td>Literal boolean</td>
    <td><code>true</code></td>
  </tr>
   <tr>
    <td>Literal null</td>
    <td><code>null</code></td>
  </tr>
   <tr>
    <td>Supported prefix operator </td>
    <td><code>!cake</code></td>
  </tr>
   <tr>
    <td>Supported binary operator </td>
    <td><code>a+b</code></td>
  </tr>
   <tr>
    <td>Conditional operator</td>
    <td><code>a ? b : c</code></td>
  </tr>
   <tr>
    <td>Parentheses</td>
    <td><code>(a+b)</code></td>
  </tr>
</table>
-->
<table>
  <tr>
    <th>문법</th>
    <th>예</th>
  </tr>
  <tr>
    <td>객체 리터럴</td>
    <td><code>{cherry: true, apple: true, mincemeat: false}</code></td>
  </tr>
  <tr>
    <td>배열 리터럴</td>
    <td><code>['cherries', 'flour', 'sugar']</code></td>
  </tr>
  <tr>
    <td>배열 안에 사용된 전개 연산자</td>
    <td><code>['apples', 'flour', ...the_rest]</code></td>
  </tr>
   <tr>
    <td>함수 실행</td>
    <td><code>bake(ingredients)</code></td>
  </tr>
   <tr>
    <td>New</td>
    <td><code>new Oven()</code></td>
  </tr>
   <tr>
    <td>프로퍼티 참조</td>
    <td><code>pie.slice</code></td>
  </tr>
   <tr>
    <td>배열 인덱스 참조</td>
    <td><code>ingredients[0]</code></td>
  </tr>
   <tr>
    <td>타입 참조</td>
    <td><code>Component</code></td>
  </tr>
   <tr>
    <td>템플릿 문자열</td>
    <td><code>`pie is ${multiplier} times better than cake`</code></td>
   <tr>
    <td>문자열 리터럴</td>
    <td><code>pi</code></td>
  </tr>
   <tr>
    <td>숫자 리터럴</td>
    <td><code>3.14153265</code></td>
  </tr>
   <tr>
    <td>불리언 리터럴</td>
    <td><code>true</code></td>
  </tr>
   <tr>
    <td>null 리터럴</td>
    <td><code>null</code></td>
  </tr>
   <tr>
    <td>접두사 연산자</td>
    <td><code>!cake</code></td>
  </tr>
   <tr>
    <td>바이너리 연산자</td>
    <td><code>a+b</code></td>
  </tr>
   <tr>
    <td>조건 연산자</td>
    <td><code>a ? b : c</code></td>
  </tr>
   <tr>
    <td>괄호</td>
    <td><code>(a+b)</code></td>
  </tr>
</table>


<!--
If an expression uses unsupported syntax, the _collector_ writes an error node to the `.metadata.json` file. The compiler later reports the error if it needs that
piece of metadata to generate the application code.
-->
만약 이 목록에 해당되지 않은 표현식이 사용되면 _콜렉터_ 가 처리할 수 없기 때문에 에러기 발생하며 `.metadata.json` 파일도 정상적으로 생성되지 않습니다. 결국 애플리케이션 코드를 빌드할 때 에러가 발생합니다.

<div class="alert is-helpful">

<!--
 If you want `ngc` to report syntax errors immediately rather than produce a `.metadata.json` file with errors, set the `strictMetadataEmit` option in `tsconfig`.
-->
`.metadata.json` 파일에 에러를 출력하는 대신 `ngc`에서 직접 문법 에러가 발생하게 하려면 `tsconfig` 옵션에 `strictMetadataEmit` 옵션을 다음과 같이 설정하세요.

```
  "angularCompilerOptions": {
   ...
   "strictMetadataEmit" : true
 }
 ```

<!--
Angular libraries have this option to ensure that all Angular `.metadata.json` files are clean and it is a best practice to do the same when building your own libraries.
-->
Angular가 제공하는 라이브러리는 모두 이 옵션을 사용하기 때문에 Angular에서 제공하는 모든 `.metadata.json` 파일은 에러 없이 깔끔한 상태입니다. 커스텀 라이브러리를 만드는 경우에도 활용해 보세요.

</div>

{@a function-expression}
{@a arrow-functions}
<!--
### No arrow functions
-->
### 화살표 함수는 사용할 수 없습니다.

<!--
The AOT compiler does not support [function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)
and [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), also called _lambda_ functions.
-->
AOT 컴파일러는 [함수 표현식](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function)과 [화살표 함수 (람다 함수)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)를 지원하지 않습니다.

<!--
Consider the following component decorator:
-->
다음과 같은 컴포넌트 데코레이터가 있다고 합시다:

```typescript
@Component({
  ...
  providers: [{provide: server, useFactory: () => new Server()}]
})
```

<!--
The AOT _collector_ does not support the arrow function, `() => new Server()`, in a metadata expression.
It generates an error node in place of the function.
-->
이 코드에는 AOT _콜렉터_ 가 지원하지 않는 화살표 함수가 `() => new Server()`와 같이 사용되었습니다.
그러면 이 코드는 제대로 변환되지 못하고 에러 노드로 처리됩니다.

<!--
When the compiler later interprets this node, it reports an error that invites you to turn the arrow function into an _exported function_.
-->
그리고 이후에 컴파일러가 이 노드를 처리할 때 에러가 발생하기 때문에, 이 화살표 함수는 _export가 사용된 함수_ 로 변경되어야 합니다.

<!--
You can fix the error by converting to this:
-->
이 에러는 다음과 같이 수정하면 해결할 수 있습니다:

```typescript
export function serverFactory() {
  return new Server();
}

@Component({
  ...
  providers: [{provide: server, useFactory: serverFactory}]
})
```

<!--
Beginning in version 5, the compiler automatically performs this rewriting while emitting the `.js` file.
-->
Angular v5 버전 초기에는 화살표 함수를 변환하는 과정을 컴파일러가 직접 처리했었습니다.

{@a function-calls}
<!--
### Limited function calls
-->
### 함수 실행 제한

<!--
The _collector_ can represent a function call or object creation with `new` as long as the syntax is valid. The _collector_ only cares about proper syntax.

But beware. The compiler may later refuse to generate a call to a _particular_ function or creation of a _particular_ object.
The compiler only supports calls to a small set of functions and will use `new` for only a few designated classes. These functions and classes are in a table of [below](#supported-functions).
-->
_콜렉터_ 는 함수를 실행하거나 `new` 키워드로 객체를 생성할 수 있습니다. 하지만 _콜렉터_ 를 사용할 때는 문법이 맞는지 주의해야 합니다.

하지만 또 주의할 점이 있습니다. 콜렉터가 JavaScript 구문을 처리한 이후라도 AOT 컴파일러가 이 코드를 다시 처리하면서 _특정_ 함수나 _특정_ 객체가 생성되는 것은 처리하지 않을 수도 있습니다.
AOT 컴파일러는 콜렉터와 다르게 일부 함수를 실행하거나 일부 클래스만 `new` 키워드로 생성할 수 있습니다. 컴파일러가 지원하는 목록은 [여기](#supported-functions)를 참고하세요.

{@a folding}
<!--
### Folding
-->
### 폴딩 (Folding)

{@a exported-symbols}

<!--
The compiler can only resolve references to **_exported_** symbols.
Fortunately, the _collector_ enables limited use of non-exported symbols through _folding_.

The _collector_ may be able to evaluate an expression during collection and record the result in the `.metadata.json` instead of the original expression.

For example, the _collector_ can evaluate the expression `1 + 2 + 3 + 4` and replace it with the result, `10`.

This process is called _folding_. An expression that can be reduced in this manner is _foldable_.
-->
AOT 컴파일러는 **_export_** 키워드가 사용된 심볼만 참조할 수 있습니다.
하지만 다행히도 _콜렉터_ 는 _폴딩_ 이라는 것을 통해 `export` 키워드가 사용되지 않은 심볼도 제한적으로 참조할 수 있습니다.

_콜렉터_ 는 콜렉션 단계에서 표현식을 평가하고 그 결과를 `.metadata.json` 파일에 기록하는데, 이 때 원래 코드를 약간 변형해서 기록합니다.

예를 들어 _콜렉터_ 가 `1 + 2 + 3 + 4` 라는 표현식을 평가하고 나면 `.metadata.json` 파일에는 이 내용을 `10`으로 기록합니다.

이 과정을 _폴딩(folding)_ 이라고 합니다. 그리고 이 과정이 적용될 수 있는 코드를 _폴딩할 수 있는(foldable)_ 코드라고 합니다.

{@a var-declaration}
<!--
The collector can evaluate references to
module-local `const` declarations and initialized `var` and `let` declarations, effectively removing them from the `.metadata.json` file.

Consider the following component definition:
-->
콜렉터는 모듈 파일에 로컬 변수로 선언된 `const`, `var`, `let` 변수들을 참조할 수 있으며, 코드가 처리되어 `.metadata.json` 파일에 기록될 때는 이 코드가 모두 폴딩되면서 제거됩니다.

다음과 같이 정의된 컴포넌트가 있다고 합시다:

```typescript
const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

<!--
The compiler could not refer to the `template` constant because it isn't exported.

But the _collector_ can _fold_ the `template` constant into the metadata definition by inlining its contents.
The effect is the same as if you had written:
-->
컴파일러는 이 코드에 선언된 `template` 변수를 참조할 수 없습니다. 왜냐하면 이 변수에 `export` 키워드가 사용되지 않았기 때문입니다.

하지만 _콜렉터_ 는 `template` 변수를 _폴딩_ 해서 컴포넌트 메타데이터 안으로 집어넣을 수 있습니다.
결과적으로 이 코드는 아래 코드와 같습니다:

```typescript
@Component({
  selector: 'app-hero',
  template: '<div>{{hero.name}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

<!--
There is no longer a reference to `template` and, therefore, nothing to trouble the compiler when it later interprets the _collector's_ output in `.metadata.json`.

You can take this example a step further by including the `template` constant in another expression:
-->
이 코드에는 `template`이라는 변수가 없으며, _콜렉터_ 가 생성한 `.metadata.json` 파일을 사용하는 컴파일러도 정상적으로 실행됩니다.

그리고 이와 비슷한 방식으로 다음과 같은 코드도 정상적으로 처리됩니다:

```typescript
const template = '<div>{{hero.name}}</div>';

@Component({
  selector: 'app-hero',
  template: template + '<div>{{hero.title}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```
<!--
The _collector_ reduces this expression to its equivalent _folded_ string:
-->
이 코드의 템플릿을 _콜렉터_ 가 처리하고 나면 다음과 같이 _폴딩 된_ 문자열로 변환됩니다:

`'<div>{{hero.name}}</div><div>{{hero.title}}</div>'`.

<!--
#### Foldable syntax
-->
#### 폴딩할 수 있는 문법

<!--
The following table describes which expressions the _collector_ can and cannot fold:
-->
_콜렉터_ 가 폴딩할 수 있는 문법에는 어떤 것들이 있는지 확인해 보세요:

<style>
  td, th {vertical-align: top}
</style>

<!--
<table>
  <tr>
    <th>Syntax</th>
    <th>Foldable</th>
  </tr>
  <tr>
    <td>Literal object </td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Literal array  </td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Spread in literal array</td>
    <td>no</td>
  </tr>
   <tr>
    <td>Calls</td>
    <td>no</td>
  </tr>
   <tr>
    <td>New</td>
    <td>no</td>
  </tr>
   <tr>
    <td>Property access</td>
    <td>yes, if target is foldable</td>
  </tr>
   <tr>
    <td>Array index</td>
    <td> yes, if target and index are foldable</td>
  </tr>
   <tr>
    <td>Identity reference</td>
    <td>yes, if it is a reference to a local</td>
  </tr>
   <tr>
    <td>A template with no substitutions</td>
    <td>yes</td>
  </tr>
   <tr>
    <td>A template with substitutions</td>
    <td>yes, if the substitutions are foldable</td>
  </tr>
   <tr>
    <td>Literal string</td>
    <td>yes</td>
  </tr>
   <tr>
    <td>Literal number</td>
    <td>yes</td>
  </tr>
   <tr>
    <td>Literal boolean</td>
    <td>yes</td>
  </tr>
   <tr>
    <td>Literal null</td>
    <td>yes</td>
  </tr>
   <tr>
    <td>Supported prefix operator </td>
    <td>yes, if operand is foldable</td>
  </tr>
   <tr>
    <td>Supported binary operator </td>
    <td>yes, if both left and right are foldable</td>
  </tr>
   <tr>
    <td>Conditional operator</td>
    <td>yes, if condition is foldable </td>
  </tr>
   <tr>
    <td>Parentheses</td>
    <td>yes, if the expression is foldable</td>
  </tr>
</table>
-->
<table>
  <tr>
    <th>문법</th>
    <th>폴딩 가능 여부</th>
  </tr>
  <tr>
    <td>객체 리터럴</td>
    <td>가능</td>
  </tr>
  <tr>
    <td>배열 리터럴</td>
    <td>가능</td>
  </tr>
  <tr>
    <td>배열 안에 사용된 전개 연산자</td>
    <td>불가</td>
  </tr>
   <tr>
    <td>함수 실행</td>
    <td>불가</td>
  </tr>
   <tr>
    <td>New</td>
    <td>불가</td>
  </tr>
   <tr>
    <td>프로퍼티 참조</td>
    <td>대상이 폴딩 가능한 경우에 가능</td>
  </tr>
   <tr>
    <td>배열 인덱스 참조</td>
    <td>대상과 인덱스가 폴딩 가능한 경우에 가능</td>
  </tr>
   <tr>
    <td>타입 참조</td>
    <td>로컬에서 참조하는 경우 가능</td>
  </tr>
   <tr>
    <td>문자열 바인딩이 없는 템플릿 문자열</td>
    <td>가능</td>
  </tr>
   <tr>
    <td>문자열 바인딩이 있는 템플릿 문자열</td>
    <td>삽입되는 템플릿이 폴딩 가능한 경우에 가능</td>
  </tr>
   <tr>
    <td>문자열 리터럴</td>
    <td>가능</td>
  </tr>
   <tr>
    <td>숫자 리터럴</td>
    <td>가능</td>
  </tr>
   <tr>
    <td>불리언 리터럴</td>
    <td>가능</td>
  </tr>
   <tr>
    <td>null 리터럴</td>
    <td>가능</td>
  </tr>
   <tr>
    <td>접두사 연산자</td>
    <td>연산자가 폴딩 가능한 경우에 가능</td>
  </tr>
   <tr>
    <td>바이너리 연산자</td>
    <td>연산자 양쪽 항목이 모두 폴딩 가능한 경우에 가능</td>
  </tr>
   <tr>
    <td>조건 연산자</td>
    <td>조건이 폴딩 가능한 경우에 가능</td>
  </tr>
   <tr>
    <td>괄호</td>
    <td>표현식이 폴딩 가능한 경우에 가능</td>
  </tr>
</table>

<!--
If an expression is not foldable, the collector writes it to `.metadata.json` as an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) for the compiler to resolve.
-->
표현식이 폴딩될 수 없는 경우에는 콜렉터가 이 코드를 [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) 형식으로 `.metadata.json`에 생성하며, 이 결과물은 이후에 AOT 컴파일러가 처리합니다.

<!--
## Phase 2: code generation
-->
## 2단계: 코드 생성

<!--
The _collector_ makes no attempt to understand the metadata that it collects and outputs to `.metadata.json`. It represents the metadata as best it can and records errors when it detects a metadata syntax violation.
-->
_콜렉터_ 는 메타데이터를 이해하는 것이 아니라 메타데이터를 찾아서 `.metadata.json`에 모으는 역할만 합니다. 그리고 이 과정에서 메타데이터에 사용된 문법에 오류가 있는지도 검사합니다.

<!--
It's the compiler's job to interpret the `.metadata.json` in the code generation phase.
-->
`.mdtadata.json` 파일을 해석해서 코드를 생성하는 것은 컴파일러의 역할입니다.

<!--
The compiler understands all syntax forms that the _collector_ supports, but it may reject _syntactically_ correct metadata if the _semantics_ violate compiler rules.

The compiler can only reference _exported symbols_.

Decorated component class members must be public. You cannot make an `@Input()` property private or protected.

Data bound properties must also be public.
-->
컴파일러는 _콜렉터_ 가 처리할 수 있었던 문법을 모두 처리할 수 있지만, 콜렉터와 다르게 메타데이터가 _문법적으로_ 컴파일 규칙에 어긋나면 에러를 발생시킵니다.

컴파일러는 _export 키워드가 사용된 심볼_ 만 참조할 수 있습니다.

컴포넌트 클래스 멤버에 데코레이터가 사용되면 이 멤버는 반드시 public이어야 합니다. private 프로퍼티에는 `@Input()` 데코레이터를 사용할 수 없습니다.

데이터 바인딩으로 연결된 프로퍼티도 반드시 public이어야 합니다.

<!--
```typescript
// BAD CODE - title is private
@Component({
  selector: 'app-root',
  template: '<h1>{{title}}</h1>'
})
export class AppComponent {
  private title = 'My App'; // Bad
}
```
-->
```typescript
// 잘못된 코드 - title이 private으로 지정되었습니다.
@Component({
  selector: 'app-root',
  template: '<h1>{{title}}</h1>'
})
export class AppComponent {
  private title = 'My App'; // 오류
}
```

{@a supported-functions}
<!--
Most importantly, the compiler only generates code to create instances of certain classes, support certain decorators, and call certain functions from the following lists.
-->
컴파일러가 생성할 수 있는 클래스는 일부 목록으로 제한되며, 지원하는 데코레이터도 제한되어 있고, 실행할 수 있는 함수도 제한되어 있습니다. 다음 목록을 참고하세요.


<!--
### New instances
-->
### 인스턴스 생성

<!--
The compiler only allows metadata that create instances of the class `InjectionToken` from `@angular/core`.
-->
AOT 컴파일러는 `@angular/core`의 `InjectionToken`으로 등록된 클래스의 인스턴스만 생성할 수 있습니다.

<!--
### Annotations/Decorators
-->
### 어노테이션/데코레이터

<!--
The compiler only supports metadata for these Angular decorators.
-->
컴파일러는 다음 목록에 해당하는 Angular 데코레이터만 지원합니다.

<style>
  td, th {vertical-align: top}
</style>

<table>
  <tr>
    <th>Decorator</th>
    <th>Module</th>
  </tr>
    <tr>
    <td><code>Attribute</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Component</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>ContentChild</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>ContentChildren</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Directive</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Host</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>HostBinding</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>HostListner</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Inject</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Injectable</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Input</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>NgModule</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Optional</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Output</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Pipe</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>Self</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>SkipSelf</code></td>
    <td><code>@angular/core</code></td>
  </tr>
  <tr>
    <td><code>ViewChild</code></td>
    <td><code>@angular/core</code></td>
  </tr>

  </table>



<!--
### Macro-functions and macro-static methods
-->
### 매크로 함수와 정적 매크로 메소드

<!--
The compiler also supports _macros_ in the form of functions or static
methods that return an expression.

For example, consider the following function:
-->
AOT 컴파일러는 함수 형태로 된 _매크로_ 와 표현식을 반환하는 정적 메소드도 지원합니다.

다음과 같은 함수가 정의되어 있다고 합시다:

```typescript
export function wrapInArray<T>(value: T): T[] {
  return [value];
}
```

<!--
You can call the `wrapInArray` in a metadata definition because it returns the value of an expression that conforms to the compiler's restrictive JavaScript subset.
-->
그러면 이 `wrapInArray` 함수를 메타데이터 정의에 사용할 수 있습니다. 왜냐하면 이 함수는 컴파일러가 처리할 수 있는 형태의 결과물을 반환하기 때문입니다.

<!--
You might use  `wrapInArray()` like this:
-->
그래서 이 함수는 이렇게 사용할 수 있습니다:

```typescript
@NgModule({
  declarations: wrapInArray(TypicalComponent)
})
export class TypicalModule {}
```

<!--
The compiler treats this usage as if you had written:
-->
이 코드는 다음 코드와 동일하게 처리됩니다.

```typescript
@NgModule({
  declarations: [TypicalComponent]
})
export class TypicalModule {}
```

<!--
The collector is simplistic in its determination of what qualifies as a macro
function; it can only contain a single `return` statement.
-->
콜렉터가 처리할 수 있는 매크로 함수의 기준은 단순합니다. 함수가 `return` 키워드로 무언가를 반환하기만 하면 됩니다.

<!--
The Angular [`RouterModule`](api/router/RouterModule) exports two macro static methods, `forRoot` and `forChild`, to help declare root and child routes.
Review the [source code](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts#L139 "RouterModule.forRoot source code")
for these methods to see how macros can simplify configuration of complex [NgModules](guide/ngmodules).
-->
Angular [`RouterModule`](api/router/RouterModule)가 제공하는 메소드 중 애플리케이션의 최상위 라우팅을 정의하는 `forRoot`와 자식 라우팅을 정의하는 `forChild`가 정적 매크로 메소드입니다.
[NgModules](guide/ngmodules) 설정이 복잡할 때 매크로 함수를 활용하면 이 설정을 좀 더 간단하게 작성할 수 있습니다. [소스 코드](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts#L139 "RouterModule.forRoot source code")를 보면서 내용을 확인해 보세요.

{@a metadata-rewriting}

<!--
### Metadata rewriting
-->
### 메타데이터 재구축

<!--
The compiler treats object literals containing the fields `useClass`, `useValue`, `useFactory`, and `data` specially. The compiler converts the expression initializing one of these fields into an exported variable, which replaces the expression. This process of rewriting these expressions removes all the restrictions on what can be in them because
the compiler doesn't need to know the expression's value&mdash;it just needs to be able to generate a reference to the value.
-->
AOT 컴파일러는 메타데이터에 사용된 `useClass`, `useValue`, `useFactory`에 사용된 객체 리터럴과 `data` 프로퍼티를 처리해서 각각 `export`로 지정된 변수로 변환합니다. 컴파일러는 이 필드에 사용된 표현식 자체를 알 필요는 없습니다. 단순하게 결과만 참조하면 됩니다.

<!--
You might write something like:
-->
다음과 같은 코드가 있다고 합시다:

```typescript
class TypicalServer {

}

@NgModule({
  providers: [{provide: SERVER, useFactory: () => TypicalServer}]
})
export class TypicalModule {}
```

<!--
Without rewriting, this would be invalid because lambdas are not supported and `TypicalServer` is not exported.

To allow this, the compiler automatically rewrites this to something like:
-->
메타데이터 재구축 과정이 없다면 이 코드는 처리되지 않습니다. 왜나하면 AOT 컴파일러는 람다 함수를 지원하지 않으며, `TypicalServer` 클래스도 `export`로 지정되지 않았기 때문입니다.

하지만 이 코드는 메타데이터 재구축 과정을 거치면서 다음과 같이 변환됩니다:

```typescript
class TypicalServer {

}

export const ɵ0 = () => new TypicalServer();

@NgModule({
  providers: [{provide: SERVER, useFactory: ɵ0}]
})
export class TypicalModule {}
```

<!--
This allows the compiler to generate a reference to `ɵ0` in the
factory without having to know what the value of `ɵ0` contains.
-->
그러면 AOT 컴파일러가 클래스를 직접 참조하지 않고 `ɵ0` 팩토리를 참조합니다.

<!--
The compiler does the rewriting during the emit of the `.js` file. This doesn't rewrite the `.d.ts` file, however, so TypeScript doesn't recognize it as being an export. Thus, it does not pollute the ES module's exported API.
-->
메타데이터 재구축 과정은 컴파일러가 `.js` 파일을 생성할 때 이루어집니다. 그리고 이 과정은 `.d.ts` 파일을 수정하는 것이 아니기 때문에 TypeScript에서는 이 과정에 생성된 `export` 변수를 인식할 수 없습니다. 결과적으로 모듈이 제공하던 API도 영향을 받지 않습니다.

<!--
## Metadata errors
-->
## 메타데이터 에러

<!--
The following are metadata errors you may encounter, with explanations and suggested corrections.
-->
메타데이터를 사용하다 보면 다음과 같은 에러가 발생할 수 있습니다. 자세한 내용과 해결 방법은 해당 섹션를 참고하세요.

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

<h3 class="no-toc">Expression form not supported</h3>

<!--
The compiler encountered an expression it didn't understand while evaluating Angular metadata.

Language features outside of the compiler's [restricted expression syntax](#expression-syntax)
can produce this error, as seen in the following example:
-->
Angular 메타데이터 안에 사용된 표현식을 처리할 수 없을 때 발생합니다.

[컴파일러가 지원하는 표현식 문법](#expression-syntax)을 벗어난 경우에 이 에러가 발생할 수 있습니다:

<!--
```
// ERROR
export class Fooish { ... }
...
const prop = typeof Fooish; // typeof is not valid in metadata
  ...
  // bracket notation is not valid in metadata
  { provide: 'token', useValue: { [prop]: 'value' } };
  ...
```
-->
```
// 에러
export class Fooish { ... }
...
const prop = typeof Fooish; // 메타데이터에 typeof는 사용할 수 없습니다.
  ...
  // 메타데이터에 대괄호 참조는 사용할 수 없습니다.
  { provide: 'token', useValue: { [prop]: 'value' } };
  ...
```

<!--
You can use `typeof` and bracket notation in normal application code.
You just can't use those features within expressions that define Angular metadata.

Avoid this error by sticking to the compiler's [restricted expression syntax](#expression-syntax)
when writing Angular metadata
and be wary of new or unusual TypeScript features.
-->
`typeof`나 대괄호 참조는 일반적인 애플리케이션 코드에 얼마든지 사용할 수 있습니다.
하지만 이 문법들은 Angular 메타데이터 표현식에는 사용할 수 없습니다.

이 에러를 해결하려면 [컴파일러가 지원하는 표현식 문법](#expression-syntax)으로만 메타데이터를 작성해야 합니다.
새로 도입되거나 자주 사용하지 않는 TypeScript 문법을 사용할 때 주의하세요.

<hr>

{@a reference-to-a-local-symbol}
<h3 class="no-toc">Reference to a local (non-exported) symbol</h3>

<div class="alert is-helpful">

_Reference to a local (non-exported) symbol 'symbol name'. Consider exporting the symbol._

</div>

<!--
The compiler encountered a referenced to a locally defined symbol that either wasn't exported or wasn't initialized.

Here's a `provider` example of the problem.
-->
`export` 키워드로 지정되지 않았거나 초기화되지 않은 로컬 심볼을 사용했을 때 발생합니다.

아래 예제에서는 `providers` 배열을 처리할 때 에러가 발생합니다.

<!--
```
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
-->
```
// 에러
let foo: number; // export 키워드로 지정하거나 초기화해야 합니다.

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

<!--
The compiler generates the component factory, which includes the `useValue` provider code, in a separate module. _That_ factory module can't reach back to _this_ source module to access the local (non-exported) `foo` variable.

You could fix the problem by initializing `foo`.
-->
컴파일러는 컴포넌트를 컴파일하면서 컴포넌트 팩토리라는 모듈을 별도로 생성합니다.
그런데 이 팩토리 모듈은 원래 컴포넌트 파일과는 다르기 때문에 기존 코드에서 `export`로 지정되지 않은 지역 변수 `foo`는 참조할 수 없습니다.

이 에러는 변수 `foo`를 초기화하는 방법으로 해결할 수 있습니다.

<!--
```
let foo = 42; // initialized
```
-->
```
let foo = 42; // 초기화
```

<!--
The compiler will [fold](#folding) the expression into the provider as if you had written this.
-->
그러면 컴파일러가 이 코드를 [폴딩](#folding)하면서 다음과 같이 변환합니다.

```
  providers: [
    { provide: Foo, useValue: 42 }
  ]
```

<!--
Alternatively, you can fix it by exporting `foo` with the expectation that `foo` will be assigned at runtime when you actually know its value.
-->
이 방법 외에도 `foo` 변수에 `export` 키워드를 붙여서 모듈 외부로 공개해도 이 에러를 해결할 수 있습니다.
변수 `foo`의 값이 실행시점에 정해진다면 이 방법을 사용하는 것이 좋습니다.

<!--
```
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
-->
```
// 올바른 코드
export let foo: number; // 변수를 모듈 외부로 공개

@Component({
  selector: 'my-component',
  template: ... ,
  providers: [
    { provide: Foo, useValue: foo }
  ]
})
export class MyComponent {}
```

<!--
Adding `export` often works for variables referenced in metadata such as `providers` and `animations` because the compiler can generate _references_ to the exported variables in these expressions. It doesn't need the _values_ of those variables.

Adding `export` doesn't work when the compiler needs the _actual value_
in order to generate code.
For example, it doesn't work for the `template` property.
-->
컴파일러가 모듈 외부로 공개된 변수에 대한 _참조_ 를 생성할 수 있기 때문에 `export` 키워드를 붙이는 방식은 메타데이터의 `providers`나 `animations` 배열에 종종 사용됩니다.
이 경우에 변수의 값은 컴파일 시점에 할당되지 않아도 됩니다.

하지만 팩토리 코드를 생성하는 시점에 _실제 값_ 이 필요하다면 `export`를 붙이는 방식은 동작하지 않습니다.
그래서 다음 코드는 동작하지 않습니다.

<!--
```
// ERROR
export let someTemplate: string; // exported but not initialized

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```
-->
```
// 에러
export let someTemplate: string; // export로 지정되었지만 초기화되지 않았습니다.

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

<!--
The compiler needs the value of the `template` property _right now_ to generate the component factory.
The variable reference alone is insufficient.
Prefixing the declaration with `export` merely produces a new error, "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)".
-->
`template` 프로퍼티의 값은 컴포넌트 팩토리가 생성되는 시점에 필요합니다.
이 변수를 참조하고 있는 것만으로는 부족합니다.
그래서 이 경우에는 `Reference to a local (non-exported) symbol` 에러 대신 "[`Only initialized variables and constants can be referenced`](#only-initialized-variables)" 에러가 발생합니다.

<hr>

{@a only-initialized-variables}
<h3 class="no-toc">Only initialized variables and constants</h3>

<div class="alert is-helpful">

_Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler._

</div>

<!--
The compiler found a reference to an exported variable or static field that wasn't initialized.
It needs the value of that variable to generate code.

The following example tries to set the component's `template` property to the value of
the exported `someTemplate` variable which is declared but _unassigned_.
-->
`export`로 지정된 변수를 참조하거나 정적(static) 필드가 초기화되지 않았을 때 발생합니다.
AOT 컴파일러가 소스 코드를 컴파일하려면 이 변수들의 실제 값이 필요합니다.

아래 예제에서 컴포넌트의 `template` 프로퍼티는 `export`로 지정된 `someTemplate`으로 지정되어 있지만, 이 변수의 값은 _할당되지 않았습니다_.

<!--
```
// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```
-->
```
// 에러
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

<!--
You'd also get this error if you imported `someTemplate` from some other module and neglected to initialize it there.
-->
그리고 `someTemplate`의 값이 할당되지 않았다면 다른 모듈에 이 변수가 선언되어 있다고 해도 에러가 발생합니다.

<!--
```
// ERROR - not initialized there either
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```
-->
```
// 에러 - 이 변수는 어디에서도 초기화되지 않았습니다.
import { someTemplate } from './config';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

<!--
The compiler cannot wait until runtime to get the template information.
It must statically derive the value of the `someTemplate` variable from the source code
so that it can generate the component factory, which includes
instructions for building the element based on the template.

To correct this error, provide the initial value of the variable in an initializer clause _on the same line_.
-->
컴파일러는 템플릿으로 사용한 변수값이 할당되는 실행 시점까지 기다릴 수 없습니다.
컴포넌트 팩토리를 생성하는 시점에 템플릿은 엘리먼트 기반으로 변환되어야 하기 때문에, `someTemplate` 변수의 값은 반드시 사전에 할당되어 있어야 합니다.

이 에러는 템플릿 변수를 선언하면서 초기값을 바로 할당하면 해결할 수 있습니다.

<!--
```
// CORRECTED
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```
-->
```
// 올바른 코드
export let someTemplate = '<h1>Greetings from Angular</h1>';

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

<hr>

<h3 class="no-toc">Reference to a non-exported class</h3>

<div class="alert is-helpful">

_Reference to a non-exported class <class name>. Consider exporting the class._

</div>

<!--
Metadata referenced a class that wasn't exported.

For example, you may have defined a class and used it as an injection token in a providers array
but neglected to export that class.
-->
메타데이터 안에서 `export`로 지정되지 않은 클래스를 참조했을 때 발생합니다.

예를 들면, `export`로 지정하지 않은 클래스를 `providers` 배열에 인젝션 토큰으로 사용한 경우에 발생합니다.

<!--
```
// ERROR
abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```
-->
```
// 에러
abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```

<!--
Angular generates a class factory in a separate module and that
factory [can only access exported classes](#exported-symbols).
To correct this error, export the referenced class.
-->
Angular는 클래스 팩토리를 생성할 때 원래 파일과 분리해서 별개 모듈로 생성하기 때문에 [export로 지정된 클래스만 참조할 수 있습니다](#exported-symbols).
이 에러는 클래스에 `export` 키워드를 지정하면 해결할 수 있습니다.

<!--
```
// CORRECTED
export abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```
-->
```
// 올바른 코드
export abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```

<hr>

<h3 class="no-toc">Reference to a non-exported function</h3>

<!--
Metadata referenced a function that wasn't exported.

For example, you may have set a providers `useFactory` property to a locally defined function that you neglected to export.
-->
메타데이터 안에서 `export`로 지정되지 않은 함수를 참조했을 때 발생합니다.

예를 들면, 팩토리 함수를 프로바이더로 등록하면서 `export`로 지정하지 않은 함수를 사용한 경우에 발생합니다.

```
// ERROR
function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```

<!--
Angular generates a class factory in a separate module and that
factory [can only access exported functions](#exported-symbols).
To correct this error, export the function.
-->
Angular는 클래스 팩토리를 생성할 때 원래 파일과 분리해서 별개 모듈로 생성하기 때문에 [export로 지정된 함수만 참조할 수 있습니다](#exported-symbols).
이 에러는 함수에 `export` 키워드를 지정하면 해결할 수 있습니다.

<!--
```
// CORRECTED
export function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```
-->
```
// 올바른 코드
export function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```

<hr>

{@a function-calls-not-supported}
<h3 class="no-toc">Function calls are not supported</h3>

<div class="alert is-helpful">

_Function calls are not supported. Consider replacing the function or lambda with a reference to an exported function._

</div>

<!--
The compiler does not currently support [function expressions or lambda functions](#function-expression).
For example, you cannot set a provider's `useFactory` to an anonymous function or arrow function like this.
-->
AoT 컴파일러는 [함수 표현식이나 람다 함수이 실행되는 것](#function-expression)을 허용하지 않습니다.
예를 들면, 프로바이더를 등록하면서 `useFactory`를 사용할 때 이 함수가 익명 함수이거나 화살표 함수이면 에러가 발생합니다.

<!--
```
// ERROR
  ...
  providers: [
    { provide: MyStrategy, useFactory: function() { ... } },
    { provide: OtherStrategy, useFactory: () => { ... } }
  ]
  ...
```
-->
```
// 에러
  ...
  providers: [
    { provide: MyStrategy, useFactory: function() { ... } },
    { provide: OtherStrategy, useFactory: () => { ... } }
  ]
  ...
```

<!--
You also get this error if you call a function or method in a provider's `useValue`.
-->
그리고 이 에러는 `useValue`를 사용해서 프로바이더를 등록할 때 함수를 실행하는 경우에도 발생합니다.

<!--
```
// ERROR
import { calculateValue } from './utilities';

  ...
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  ...
```
-->
```
// 에러
import { calculateValue } from './utilities';

  ...
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  ...
```

<!--
To correct this error, export a function from the module and refer to the function in a `useFactory` provider instead.
-->
이 에러를 해결하려면 문제가 되는 함수에 `export`를 지정해서 모듈 외부로 공개한 후에 `useFactory`에 연결하면 됩니다.

<!--
<code-example linenums="false">
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
</code-example>
-->
<code-example linenums="false">
// 수정된 코드
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
</code-example>

<hr>

{@a destructured-variable-not-supported}
<h3 class="no-toc">Destructured variable or constant not supported</h3>

<div class="alert is-helpful">

_Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring._

</div>

<!--
The compiler does not support references to variables assigned by [destructuring](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

For example, you cannot write something like this:
-->
AoT 컴파일러는 [분해 연산자](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring)를 사용해서 변수를 할당하는 문법을 허용하지 않습니다.

그래서 다음과 같은 코드는 에러가 발생합니다:

<!--
<code-example linenums="false">
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
</code-example>
-->
<code-example linenums="false">
// 에러
import { configuration } from './configuration';

// 변수 foo와 bar의 값은 분해 연산자를 사용해서 할당됩니다.
const {foo, bar} = configuration;
  ...
  providers: [
    {provide: Foo, useValue: foo},
    {provide: Bar, useValue: bar},
  ]
  ...
</code-example>

<!--
To correct this error, refer to non-destructured values.
-->
이 에러를 해결하려면 분해 연산자를 사용하지 않고 객체 안에 있는 프로퍼티를 직접 참조하면 됩니다.

<!--
<code-example linenums="false">
// CORRECTED
import { configuration } from './configuration';
  ...
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  ...
</code-example>
-->
<code-example linenums="false">
// 올바른 코드
import { configuration } from './configuration';
  ...
  providers: [
    {provide: Foo, useValue: configuration.foo},
    {provide: Bar, useValue: configuration.bar},
  ]
  ...
</code-example>

<hr>

<h3 class="no-toc">Could not resolve type</h3>

<!--
The compiler encountered a type and can't determine which module exports that type.

This can happen if you refer to an ambient type.
For example, the `Window` type is an ambient type declared in the global `.d.ts` file.

You'll get an error if you reference it in the component constructor,
which the compiler must statically analyze.
-->
이 에러는 코드에 사용된 타입이 어떤 모듈에서 온 것인지 알 수 없을 때 발생합니다.

이 에러는 암묵적인 타입(ambient type)을 사용할 때도 발생할 수 있습니다.
예를 들어 `Window` 타입은 전역 `.d.ts` 파일에 선언된 암묵적인 타입 중 하나입니다.

이 타입이 컴포넌트 생성자에 직접 사용되면 에러가 발생합니다.
AoT 컴파일러는 정적으로 확인할 수 있는 타입만 처리할 수 있습니다.

<!--
```
// ERROR
@Component({ })
export class MyComponent {
  constructor (private win: Window) { ... }
}
```
-->
```
// 에러
@Component({ })
export class MyComponent {
  constructor (private win: Window) { ... }
}
```

<!--
TypeScript understands ambient types so you don't import them.
The Angular compiler does not understand a type that you neglect to export or import.

In this case, the compiler doesn't understand how to inject something with the `Window` token.

Do not refer to ambient types in metadata expressions.
-->
사실 TypeScript는 암묵적인 타입을 따로 로드하지 않아도 처리할 수 있습니다.
하지만 Angular 컴파일러는 이 타입을 명시적으로 로드해야 정확한 타입을 인식할 수 있습니다.

그래서 위 예제 코드에서는 AoT 컴파일러가 `Window` 토큰을 처리할 수 없기 때문에 에러가 발생합니다.

메타데이터 표현식에 암묵적인 타입은 사용할 수 없습니다.

<!--
If you must inject an instance of an ambient type,
you can finesse the problem in four steps:

1. Create an injection token for an instance of the ambient type.
1. Create a factory function that returns that instance.
1. Add a `useFactory` provider with that factory function.
1. Use `@Inject` to inject the instance.

Here's an illustrative example.
-->
암묵적인 타입을 꼭 사용해야 한다면 다음 4단계를 거쳐야 합니다:

1. 암묵적인 타입으로 인젝션 토큰을 새로 생성합니다.
1. 이 토큰을 인스턴스로 생성하는 팩토리 함수를 정의합니다.
1. `useFactory`를 사용해서 팩토리 함수를 프로바이더로 등록합니다.
1. 인스턴스를 의존성으로 주입할 때 `@Inject` 데코레이터를 사용합니다.

<code-example linenums="false">
// 올바른 코드
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
</code-example>

<!--
The `Window` type in the constructor is no longer a problem for the compiler because it
uses the `@Inject(WINDOW)` to generate the injection code.

Angular does something similar with the `DOCUMENT` token so you can inject the browser's `document` object (or an abstraction of it, depending upon the platform in which the application runs).
-->
수정된 코드에서는 이제 `Window` 타입을 사용하는 것이 문제가 되지 않습니다.
왜냐하면 이 타입은 `@Inject(WINDOW)`라는 코드로 변환된 이후에 의존성으로 주입되기 때문입니다.

브라우저의 `document` 객체도 `DOCUMENT` 토큰을 활용하는 방법으로 주입할 수 있습니다.
애플리케이션이 실행되는 플랫폼에 영향을 받는 타입도 마찬가지입니다.

<code-example linenums="false">
import { Inject }   from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

@Component({ ... })
export class MyComponent {
  constructor (@Inject(DOCUMENT) private doc: Document) { ... }
}
</code-example>
<hr>

<h3 class="no-toc">Name expected</h3>

<!--
The compiler expected a name in an expression it was evaluating.
This can happen if you use a number as a property name as in the following example.
-->
객체가 사용된 표현식을 AoT 컴파일러가 평가하려면 이 객체 프로퍼티에 이름이 존재해야 합니다.
이 에러는 다음과 같이 객체의 이름으로 숫자가 사용되었을 때 발생할 수 있습니다.

<!--
```
// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]
```
-->
```
// 에러
provider: [{ provide: Foo, useValue: { 0: 'test' } }]
```

<!--
Change the name of the property to something non-numeric.
-->
이 에러는 숫자 대신 문자열을 프로퍼티 이름으로 지정하면 해결할 수 있습니다.

<!--
```
// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]
```
-->
```
// 올바른 코드
provider: [{ provide: Foo, useValue: { '0': 'test' } }]
```

<hr>

<h3 class="no-toc">Unsupported enum member name</h3>

<!--
Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html)
that you referenced in metadata.

The compiler can understand simple enum values but not complex values such as those derived from computed properties.
-->
메타데이터에 [enum 멤버](https://www.typescriptlang.org/docs/handbook/enums.html)가 사용되었다면, 이 객체의 값이 명확하게 정해져야 AoT 컴파일러가 처리할 수 있습니다.

AoT 컴파일러는 일반적인 enum 값은 처리할 수 있지만 연산을 실행한 후에 할당되는 enum 값은 처리할 수 없습니다.

<!--
<code-example linenums="false">
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
</code-example>
-->
<code-example linenums="false">
// 에러
enum Colors {
  Red = 1,
  White,
  Blue = "Blue".length // 연산이 필요한 enum 값
}

  ...
  providers: [
    { provide: BaseColor,   useValue: Colors.White } // ok
    { provide: DangerColor, useValue: Colors.Red }   // ok
    { provide: StrongColor, useValue: Colors.Blue }  // bad
  ]
  ...
</code-example>

<!--
Avoid referring to enums with complicated initializers or computed properties.
-->
이 에러를 해결하려면 연산 없이 enum 값을 단순하게 지정하면 됩니다.

<hr>

{@a tagged-template-expressions-not-supported}
<h3 class="no-toc">Tagged template expressions are not supported</h3>

<div class="alert is-helpful">

_Tagged template expressions are not supported in metadata._

</div>

<!--
The compiler encountered a JavaScript ES2015 [tagged template expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) such as,
-->
이 에러는 JavaScript ES2015 문법 중 [태그가 사용된 템플릿 문자열 표현식](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals)을 사용했을 때 발생합니다.

<!--
```
// ERROR
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 ...
 template: '<div>' + raw + '</div>'
 ...
```
-->
```
// 에러
const expression = 'funky';
const raw = String.raw`A tagged template ${expression} string`;
 ...
 template: '<div>' + raw + '</div>'
 ...
```

<!--
[`String.raw()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
is a _tag function_ native to JavaScript ES2015.

The AOT compiler does not support tagged template expressions; avoid them in metadata expressions.
-->
[`String.raw()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)는 JavaScript ES2015에서 네이티브로 지원하는 _태그 함수 (tag function)_ 입니다.

하지만 AoT 컴파일러는 태그가 사용된 템플릿 문자열 표현식을 지원하지 않습니다.
이 문법은 메타데이터 표현식에 사용할 수 없습니다.

<hr>

<h3 class="no-toc">Symbol reference expected</h3>

<!--
The compiler expected a reference to a symbol at the location specified in the error message.

This error can occur if you use an expression in the `extends` clause of a class.
-->
이 에러는 심볼이 있어야 할 자리에 심볼이 사용되지 않았을 때 발생합니다.

그래서 `extends` 키워드 뒤에 클래스가 사용되지 않은 경우에도 이 에러가 발생합니다.

<!--

Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495).

-->

{@a binding-expression-validation}
<!--
  ## Phase 3: binding expression validation
-->
## 3단계: 템플릿 표현식 유효성 검사

<!--
  In the validation phase, the Angular template compiler uses the TypeScript compiler to validate the
  binding expressions in templates. Enable this phase explicitly by adding the compiler
  option `"fullTemplateTypeCheck"` in the `"angularCompilerOptions"` of the project's `tsconfig.json` (see
  [Angular Compiler Options](#compiler-options)).

  Template validation produces error messages when a type error is detected in a template binding
  expression, similar to how type errors are reported by the TypeScript compiler against code in a `.ts`
  file.
-->
유효성 검사 단계에서는 Angular 템플릿 컴파일러가 TypeScript 컴파일러를 사용해서 템플릿에 바인딩 된 표현식의 유효성을 검사합니다.
이 단계는 프로젝트의 `tsconfig.json` 파일의 내용 중 [Angular 컴파일 옵션](#compiler-options)을 담당하는 `"angularCompilerOptions"`에 `"fullTemplateTypeCheck"` 옵션을 추가하면 활성화할 수 있습니다.

이 단계에서 템플릿에 바인딩된 표현식을 검사하다가 타입 에러를 발견하면 에러 메시지를 출력하는데, 이 에러 메시지는 이 템플릿이 사용된 컴포넌트의 파일 이름이 붙어서 출력됩니다.

<!--
  For example, consider the following component:
-->
다음과 같은 컴포넌트가 있다고 합시다:

  ```typescript
  @Component({
    selector: 'my-component',
    template: '{{person.addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
  ```

<!--
  This will produce the following error:
-->
이 컴포넌트의 템플릿에서 발생하는 에러는 다음과 같이 표시됩니다:

  ```
  my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?
  ```

<!--
  The file name reported in the error message, `my.component.ts.MyComponent.html`, is a synthetic file
  generated by the template compiler that holds contents of the `MyComponent` class template.
  Compiler never writes this file to disk. The line and column numbers are relative to the template string
  in the `@Component` annotation of the class, `MyComponent` in this case. If a component uses
  `templateUrl` instead of `template`, the errors are reported in the HTML file referenced by the
  `templateUrl` instead of a synthetic file.
-->
에러 메시지에 표시된 파일 이름은 `my.component.ts.MyComponent.html`인데, 이 내용을 해석해 보면 `MyComponent` 클래스가 정의된 코드의 템플릿에서 에러가 발생했다는 것을 확인할 수 있습니다.
컴파일러는 템플릿 파일을 디스크에 따로 저장하지 않습니다.
그리고 에러 메시지로 출력되는 에러 위치는 `@Component` 어노테이션을 기준으로 한 상대 위치로 표시됩니다.
컴포넌트에 `template` 대신 `templateUrl`을 사용했다면, 에러 메시지는 컴포넌트 클래스 파일 대신 HTML 파일을 가리키는 방식으로 출력됩니다.

<!--
  The error location is the beginning of the text node that contains the interpolation expression with
  the error. If the error is in an attribute binding such as `[value]="person.address.street"`, the error
  location is the location of the attribute that contains the error.

  The validation uses the TypeScript type checker and the options supplied to the TypeScript compiler to control
  how detailed the type validation is. For example, if the `strictTypeChecks` is specified, the error  ```my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'``` is reported as well as the above error message.
-->
위 코드에서 에러가 발생한 위치는 문자열 바인딩이 사용된 첫번째 텍스트 노드입니다.
에러가 `[value]="person.address.street"`와 같은 어트리뷰트 바인딩에서 발생했다면 에러가 발생한 위치로 어트리뷰트의 위치가 표시됩니다.

템플릿 표현식의 유효성을 검사하는 로직은 TypeScript가 제공하는 타입 체커를 활용하기 때문에 TypeScript 컴파일러에 사용할 수 있는 옵션은 이 단계에서도 사용할 수 있습니다.
그래서 `strictTypeChecks` 옵션이 지정되면 위 코드를 처리하면서 ```my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'``` 라는 에러가 출력됩니다.

<!--
  ### Type narrowing
-->
### 타입 구체화하기

<!--
  The expression used in an `ngIf` directive is used to narrow type unions in the Angular
  template compiler, the same way the `if` expression does in TypeScript. For example, to avoid
  `Object is possibly 'undefined'` error in the template above, modify it to only emit the
  interpolation if the value of `person` is initialized as shown below:
-->
템플릿 표현식에 사용된 `ngIf`는 TypeScript 코드에 사용하는 `if`와 마찬가지로 타입을 구체화하는 역할을 합니다.
그래서 위에서 살펴본 템플릿에서 발생하는 `Object is possibly 'undefined'` 에러는 아래 코드에서 발생하지 않습니다.
템플릿에 사용된 문자열 바인딩 문법은 `person` 변수가 초기화된 이후에만 동작하기 때문입니다:

  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.addresss.street}} </span>'
  })
  class MyComponent {
    person?: Person;
  }
  ```

<!--
  Using `*ngIf` allows the TypeScript compiler to infer that the `person` used in the
  binding expression will never be `undefined`.
-->
이 템플릿에는 `*ngIf`가 사용되었기 때문에 `person`이 `undefined`일 때는 표현식이 평가되지 않는다는 것을 보장할 수 잇습니다.
이 동작은 TypeScript 컴파일러를 활용한 기능입니다.

<!--
  #### Custom `ngIf` like directives
-->
#### 커스텀 `ngIf` 디렉티브

<!--
  Directives that behave like `*ngIf` can declare that they want the same treatment by including
  a static member marker that is a signal to the template compiler to treat them
  like `*ngIf`. This static member for `*ngIf` is:
-->
`*ngIf`와 비슷한 역할을 하는 디렉티브를 만들어서 활용할 수도 있는데, 이런 디렉티브를 사용하면 템플릿 컴파일러가 템플릿을 처리할 때 좀 더 많은 정보를 제공할 수 있습니다.
`*ngIf` 디렉티브의 정적 멤버 중에는 이런 것이 있습니다:

  ```typescript
    public static ngIfUseIfTypeGuard: void;
  ```

<!--
  This declares that the input property `ngIf` of the `NgIf` directive should be treated as a
  guard to the use of its template, implying that the template will only be instantiated if
  the `ngIf` input property is true.
-->
`NgIf` 디렉티브는 `ngIf` 프로퍼티로 입력값을 받는데, 이 입력값이 `true`일 때만 템플릿의 내용을 인스턴스로 생성합니다.
그래서 이 역할을 명확하게 지정하기 위해 `NgIf` 디렉티브에는 `ngIfUseIfTypeGuard`라는 프로퍼티가 존재합니다.


<!--
  ### Non-null type assertion operator
-->
### null 방지 연산자

<!--
  Use the [non-null type assertion operator](guide/template-syntax#non-null-assertion-operator)
  to suppress the `Object is possibly 'undefined'` error when it is inconvenient to use
  `*ngIf` or when some constraint in the component ensures that the expression is always
  non-null when the binding expression is interpolated.

  In the following example, the `person` and `address` properties are always set together,
  implying that `address` is always non-null if `person` is non-null. There is no convenient
  way to describe this constraint to TypeScript and the template compiler, but the error
  is suppressed in the example by using `address!.street`.
-->
표현식에 문자열 바인딩 문법을 사용할 때 `*ngIf`를 사용해도 `Object is possibly 'undefined'` 에러를 방지할 수 있지만, [null 방지 연산자](guide/template-syntax#non-null-assertion-operator)를 사용해도 이 에러를 방지할 수 있습니다.

컴포넌트 프로퍼티 `person`과 `address`의 값은 동시에 할당되기 때문에 `person`만 검사하면 `address`가 null이 아니라는 것을 보장할 수 있습니다.
하지만 TypeScript나 템플릿 컴파일러는 이 정보를 알 수 없기 때문에 `address` 프로퍼티에 대해 `Object is possibly 'undefined'` 에러가 발생할 수 있습니다.
이 경우에 `address!.street`라는 표현식을 사용하면 `address`가 null이 아닐 때만 `street` 프로퍼티를 참조하라는 정보를 추가로 제공할 수 있습니다.


  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.name}} lives on {{address!.street}} </span>'
  })
  class MyComponent {
    person?: Person;
    address?: Address;

    setData(person: Person, address: Address) {
      this.person = person;
      this.address = address;
    }
  }
  ```

<!--
  The non-null assertion operator should be used sparingly as refactoring of the component
  might break this constraint.

  In this example it is recommended to include the checking of `address`
  in the `*ngIf`as shown below:
-->
다만 null 방지 연산자는 `ngIf` 디렉티브가 제공하는 타입 제약을 무시할 수 있기 때문에 남용하면 안됩니다.

위와 같은 코드라면 null 방지 연산자를 사용하는 대신 `*ngIf` 조건에 `address`를 넣는 것이 더 좋습니다.

  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person && address"> {{person.name}} lives on {{address.street}} </span>'
  })
  class MyComponent {
    person?: Person;
    address?: Address;

    setData(person: Person, address: Address) {
      this.person = person;
      this.address = address;
    }
  }
  ```

<!--
  ### Disabling type checking using `$any()`
-->
### 타입 체크 생략하기: `$any()`

<!--
  Disable checking of a binding expression by surrounding the expression
  in a call to the [`$any()` cast pseudo-function](guide/template-syntax).
  The compiler treats it as a cast to the `any` type just like in TypeScript when a `<any>`
  or `as any` cast is used.

  In the following example, the error `Property addresss does not exist` is suppressed
  by casting `person` to the `any` type.
-->
템플릿 표현식에 [`$any()` 함수](guide/template-syntax)를 사용하면 표현식의 내용을 `any` 타입으로 캐스팅하기 때문에 컴파일러의 타입 체크 동작을 건너뛸 수 있습니다.
TypeScript 코드에 `<any>`를 사용하거나 `as any`를 사용해서 타입을 캐스팅 한 것과 같습니다.

아래 예제에서 `person` 프로퍼티는 `any` 타입으로 캐스팅되었기 때문에 `Property addresss does not exist` 에러는 발생하지 않습니다.

  ```typescript
  @Component({
    selector: 'my-component',
    template: '{{$any(person).addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
  ```

{@a tsconfig-extends}
<!--
## Configuration inheritance with extends
-->
## 환경설정 파일 상속하기

<!--
Similar to TypeScript Compiler, Angular Compiler also supports `extends` in the `tsconfig.json` on `angularCompilerOptions`. A tsconfig file can inherit configurations from another file using the `extends` property.
 The `extends` is a top level property parallel to `compilerOptions` and `angularCompilerOptions`. 
 The configuration from the base file are loaded first, then overridden by those in the inheriting config file.
 Example:
-->
TypeScript 컴파일러와 비슷하게, `tsconfig.json` 파일에 정의된 `angularCompilerOptions`는 `extends` 프로퍼티로 상속할 수 있습니다.
그래서 TypeScript 환경설정 파일의 최상위 계층에 `extends`를 선언하면서 상속의 대상이 되는 환경설정 파일을 지정하면 이 파일에 정의된 `compilerOptions`와 `angularCompilerOptions`가 해당 환경설정 파일로 상속됩니다.
그러면 대상이 되는 환경설정 파일이 먼저 로드된 이후에 현재 환경설정 파일의 내용이 상속 대상을 오버라이드 합니다.


```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "experimentalDecorators": true,
    ...
  },
  "angularCompilerOptions": {
    "fullTemplateTypeCheck": true,
    "preserveWhitespaces": true,
    ...
  }
}
```

<!--
 More information about tsconfig extends can be found in the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
-->
`tsconfig.json` 파일을 상속하는 방법에 대해 더 알아보려면 [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) 문서를 참고하세요.

{@a compiler-options}
<!--
## Angular template compiler options
-->
## Angular 템플릿 컴파일러 옵션

<!--
The template compiler options are specified as members of the `"angularCompilerOptions"` object in the `tsconfig.json` file. Specify template compiler options along with the options supplied to the TypeScript compiler as shown here:
-->
`tsconfig.json` 파일의 `"angularCompilerOptions"` 프로퍼티를 활용하면 Angular 템플릿 컴파일러에 적용되는 옵션을 지정할 수 있습니다:

    ```json
    {
      "compilerOptions": {
        "experimentalDecorators": true,
                  ...
      },
      "angularCompilerOptions": {
        "fullTemplateTypeCheck": true,
        "preserveWhitespaces": true,
                  ...
      }
  }
  ```

<!--
The following section describes the Angular's template compiler options.
-->
Angular 템플릿 컴파일러에 사용하는 옵션에 대해 자세하게 알아봅시다.

### *enableResourceInlining*

<!--
This option instructs the compiler to replace the `templateUrl` and `styleUrls` property in all `@Component` decorators with inlined contents in `template` and `styles` properties.
When enabled, the `.js` output of `ngc` will have no lazy-loaded `templateUrl` or `styleUrls`.
-->
이 옵션을 사용하면 `@Component` 데코레이터에 사용된 `templateUrl` 프로퍼티와 `styleUrls` 프로퍼티가 인라인으로 처리되어 `template`과 `styles`로 변경됩니다.
그래서 이 옵션이 적용된 후에는 `templateUrl`과 `styleUrls`가 지연 로딩되지 않습니다.

### *skipMetadataEmit*

<!--
This option tells the compiler not to produce `.metadata.json` files.
The option is `false` by default.

`.metadata.json` files contain information needed by the template compiler from a `.ts`
file that is not included in the `.d.ts` file produced by the TypeScript compiler. This information contains,
for example, the content of annotations (such as a component's template), which TypeScript
emits to the `.js` file but not to the `.d.ts` file.

This option should be set to `true` if you are using TypeScript's `--outFile` option, because the metadata files
are not valid for this style of TypeScript output. It is not recommended to use `--outFile` with
Angular. Use a bundler, such as [webpack](https://webpack.js.org/), instead.

This option can also be set to `true` when using factory summaries because the factory summaries
include a copy of the information that is in the `.metadata.json` file.
-->
이 옵션을 사용하면 AoT 컴파일러가 `.metadata.json` 파일을 생성하지 않습니다.
기본값은 `false`입니다.

`.metadata.json` 파일은 템플릿에 대한 정보를 담고 있는 파일이며, 이 정보는 TypeScript 컴파일러가 생성하는 `.d.ts` 파일에 포함되지 않습니다.
`.metadata.json` 파일에는 어노테이션으로 사용된 컴포넌트 템플릿에 대한 정보도 존재하는데, 이 정보는 TypeScript 컴파일러가 생성한 `.js` 파일에는 존재하지만 `.d.ts` 파일에는 존재하지 않습니다.

TypeScript 컴파일러를 실행할 때 `--outFile` 옵션을 사용한다면 이 옵션은 반드시 `true`로 설정해야 합니다.
왜냐하면 `--outFile` 옵션을 사용했을 때 TypeScript가 생성한 결과 파일은 메타데이터 파일로 처리할 수 없기 때문인데, 그래서 Angular는 `--outFile` 옵션을 사용하지 않는 것을 권장합니다.
`--outFile` 옵션을 반드시 사용해야 한다면 [webpack](https://webpack.js.org/)과 같은 번들러를 사용해야 합니다.

이 옵션은 팩토리 요약 정보를 생성할 때도 `true`로 설정하는 것이 좋습니다.
팩토리 요약 정보는 `.metadata.json` 파일의 정보와 중복됩니다.

### *strictMetadataEmit*

<!--
This option tells the template compiler to report an error to the `.metadata.json`
file if `"skipMetadataEmit"` is `false`. This option is `false` by default. This should only be used when `"skipMetadataEmit"` is `false` and `"skipTemplateCodeGen"` is `true`.

This option is intended to validate the `.metadata.json` files emitted for bundling with an `npm` package. The validation is strict and can emit errors for metadata that would never produce an error when used by the template compiler. You can choose to suppress the error emitted by this option for an exported symbol by including `@dynamic` in the comment documenting the symbol.

It is valid for `.metadata.json` files to contain errors. The template compiler reports these errors
if the metadata is used to determine the contents of an annotation. The metadata
collector cannot predict the symbols that are designed for use in an annotation, so it will preemptively
include error nodes in the metadata for the exported symbols. The template compiler can then use the error
nodes to report an error if these symbols are used. If the client of a library intends to use a symbol in an annotation, the template compiler will not normally report
this until the client uses the symbol. This option allows detecting these errors during the build phase of
the library and is used, for example, in producing Angular libraries themselves.
-->
이 옵션을 사용하면 `"skipMetadataEmit"`를 `false`로 설정해서 `.metadata.json` 파일을 생성할 때 에러가 발생합니다.
기본값은 `false`이며, 이 옵션은 `"skipMetadataEmit"` 값이 `false` 이고 `"skipTemplateCodeGen"` 값이 `true`일 때만 동작합니다.

이 옵션은 AoT 컴파일러가 아닌 다른 `npm` 패키지가 프로젝트를 번들링하면서 만든 `.metadata.json`를 검사하기 위해 사용됩니다.
이 때 다른 `npm` 패키지가 검사하는 룰이 더 엄격할 수 있기 때문에 이 옵션을 설정하면 템플릿 컴파일러에서 발생하지 않은 메타데이터 에러가 추가적으로 발생할 수 있습니다.
이 에러를 무시하려면 `export`가 지정된 심볼에 `@dynamic` 데코레이터를 사용하면 됩니다.

메타데이터 콜렉터는 심볼이 어노테이션에 사용되기 위해 선언되었다는 것을 이해할 수 없기 때문에, 메타데이터 콜렉터가 생성한 `.metadata.json` 파일에는 에러 노드가 포함되어 있을 수 있습니다.
그러면 템플릿 컴파일러가 이 에러 노드를 확인했다가 이 에러 노드와 관련된 심볼이 실제로 사용되면 에러를 발생시킵니다.
만약 라이브러리에 있는 심볼 중 하나가 어노테이션에 사용되는 것을 의도해서 선언되었다면, 이 심볼은 실제로 코드에 사용되지 않는 이상 에러로 처리되지 않습니다.
이 옵션은 라이브러리를 빌드하는 단계에서 심볼이 유효하게 사용되었는지 확인하는 용도로 사용됩니다.


### *skipTemplateCodegen*

<!--
This option tells the compiler to suppress emitting `.ngfactory.js` and `.ngstyle.js` files. When set,
this turns off most of the template compiler and disables reporting template diagnostics.
This option can be used to instruct the
template compiler to produce `.metadata.json` files for distribution with an `npm` package while
avoiding the production of `.ngfactory.js` and `.ngstyle.js` files that cannot be distributed to
`npm`.
-->
이 옵션을 사용하면 컴파일러가 `.ngfactory.js` 파일과 `.ngstyle.js` 파일을 생성하지 않습니다.
그리고 템플릿 컴파일러의 기능이 대부분 생략되며 템플릿 에러를 검사하지도 않습니다.

이 옵션은 `.metadata.json` 파일을 배포용으로 생성하면서 `npm` 패키지로 배포할 수 없는 `.ngfafctory.js` 파일과 `.ngstyle.js` 파일을 생략하기 위해 사용됩니다.

### *strictInjectionParameters*

<!--
When set to `true`, this options tells the compiler to report an error for a parameter supplied
whose injection type cannot be determined. When this option is not provided or is `false`, constructor parameters of classes marked with `@Injectable` whose type cannot be resolved will
produce a warning.

*Note*: It is recommended to change this option explicitly to `true` as this option will default to `true` in the future.
-->
이 옵션이 `true`로 설정되면 의존성으로 주입하는 객체의 타입을 컴파일러가 파악할 수 없을 때 에러가 발생합니다.
그리고 이 옵션이 사용되지 않거나 `false` 값으로 지정되면 타입을 알 수 없는 의존성 객체에 `@Injectable` 데코레이터가 지정되었을 때 경고 메시지가 출력되지만 에러는 발생하지 않습니다.

*참고*: 이 옵션의 값은 `true`로 지정하는 것을 권장합니다. 이후 버전에서 이 옵션의 기본값은 `true`가 될 것입니다.

### *flatModuleOutFile*

<!--
When set to `true`, this option tells the template compiler to generate a flat module
index of the given file name and the corresponding flat module metadata. Use this option when creating
flat modules that are packaged similarly to `@angular/core` and `@angular/common`. When this option
is used, the `package.json` for the library should refer
to the generated flat module index instead of the library index file. With this
option only one `.metadata.json` file is produced, which contains all the metadata necessary
for symbols exported from the library index. In the generated `.ngfactory.js` files, the flat
module index is used to import symbols that includes both the public API from the library index
as well as shrowded internal symbols.

By default the `.ts` file supplied in the `files` field is assumed to be the library index.
If more than one `.ts` file is specified, `libraryIndex` is used to select the file to use.
If more than one `.ts` file is supplied without a `libraryIndex`, an error is produced. A flat module
index `.d.ts` and `.js` will be created with the given `flatModuleOutFile` name in the same
location as the library index `.d.ts` file. For example, if a library uses the
`public_api.ts` file as the library index of the module, the `tsconfig.json` `files` field
would be `["public_api.ts"]`. The `flatModuleOutFile` options could then be set to, for
example `"index.js"`, which produces `index.d.ts` and  `index.metadata.json` files. The
library's `package.json`'s `module` field would be `"index.js"` and the `typings` field
would be `"index.d.ts"`.
-->
이 옵션값이 `true`로 지정되면 템플릿 컴파일러가 생성하는 모듈 인덱스와 모듈 메타데이터가 플랫(flat) 구조로 생성됩니다.
`@angular/core` 패키지와 `@angular/common` 패키지와 같은 구조도 이 옵션을 사용해서 생성된 것입니다.
그리고 이 옵션을 사용하려면 `package.json` 파일이 라이브러리 인덱스 파일이 아니라 플랫 모듈 인덱스 파일을 참조해야 합니다.
이 옵션이 사용되면 라이브러리 인덱스에서 사용하는 모든 심볼이 `.metadata.json` 파일 하나에 모두 포함됩니다.
그리고 플랫 모듈 인덱스 파일인 `.ngfactory.js` 파일은 각 라이브러리 인덱스 파일이 public API와 심볼을 참조할 때 사용됩니다.

기본 설정값을 사용하면 `files` 필드에 지정된 `.ts` 파일이 라이브러리 인덱스를 생성하는 데에 사용됩니다.
그리고 `.ts` 파일이 1개 이상 지정되면, 사용할 파일을 구분하기 위해 `libraryIndex`를 참조합니다.
그런데 이 상황에서 `libraryIndex`가 존재하지 않으면 에러가 발생합니다.
`libraryIndex`가 정상적으로 존재하는 상황이라면  `flatModuleOutFile`에 지정된 이름으로 플랫 모듈 인덱스 파일인 `.d.ts` 파일과 `.js` 파일이 라이브러리 인덱스가 존재하는 위치에 생성됩니다.
예를 들어 모듈 인덱스로 `public_api.ts` 파일을 사용하는 라이브러리가 있고, 이 라이브러리의 `tsconfig.json` 파일 `files` 필드는 `["public_api.ts"]`로 지정되어 있다고 합시다.
이 상황에서 `flatModuleOutFile` 옵션이 `"index.js"`로 지정되면, `index.d.ts` 파일과 `index.metadata.json` 파일이 생성됩니다.
그러면 라이브러리의 `package.json` 파일의 `module` 필드는 `"index.js"`로 지정되어야 하고 `typings` 필드 값은 `"index.d.ts"`가 지정되어야 합니다.

### *flatModuleId*

<!--
This option specifies the preferred module id to use for importing a flat module.
References generated by the template compiler will use this module name when importing symbols
from the flat module.
This is only meaningful when `flatModuleOutFile` is also supplied. Otherwise the compiler ignores
this option.
-->
이 옵션을 사용하면 플랫 모듈을 로드할 때 사용될 모듈 id를 지정할 수 있습니다.
이 옵션이 지정되면 템플릿 컴파일러가 해당 모듈을 팩토리 코드로 생성할 때 이 옵션값으로 지정된 모듈 이름을 참조하도록 코드를 생성합니다.
이 옵션은 `flatModuleOutFile`이 사용되었을 때만 유효하며, `flatModuleOutFile` 옵션이 사용되지 않았다면 이 옵션은 무시됩니다.

### *generateCodeForLibraries*

<!--
This option tells the template compiler to generate factory files (`.ngfactory.js` and `.ngstyle.js`)
for `.d.ts` files with a corresponding `.metadata.json` file. This option defaults to
`true`. When this option is `false`, factory files are generated only for `.ts` files.

This option should be set to `false` when using factory summaries.
-->
이 옵션을 사용하면 템플릿 컴파일러가 `.metadata.json` 파일과 관계된 팩토리 파일들(`.ngfactory.js`, `.ngstyle.js`)과 `.d.ts` 파일을 생성하게 할 수 있습니다.
기본값은 `true`이며, 이 옵션의 값이 `false`로 지정되면 `.ts` 팩토리 파일만 생성됩니다.

팩토리 요약정보를 생성해야 한다면 이 옵션값은 반드시 `false`가 되어야 합니다.

### *fullTemplateTypeCheck*

<!--
This option tells the compiler to enable the [binding expression validation](#binding-expression-validation)
phase of the template compiler which uses TypeScript to validate binding expressions.

This option is `false` by default.

*Note*: It is recommended to set this to `true` because this option will default to `true` in the future.
-->
이 옵션을 사용하면 Angular 템플릿 컴파일러가 TypeScript 컴파일러의 기능을 활용해서 [템플릿에 사용된 바인딩 표현식의 유효성을 검사](#binding-expression-validation)할 수 있습니다.
기본값은 `false`입니다.

*참고*: 이 옵션의 값은 `true`로 지정하는 것을 권장합니다. 이후 버전에서 이 옵션의 기본값은 `true`가 될 것입니다.

### *annotateForClosureCompiler*

<!--
This option tells the compiler to use [Tsickle](https://github.com/angular/tsickle) to annotate the emitted
JavaScript with [JSDoc](http://usejsdoc.org/) comments needed by the
[Closure Compiler](https://github.com/google/closure-compiler). This option defaults to `false`.
-->
이 옵션을 사용하면 [Closure Compiler](https://github.com/google/closure-compiler)를 위해 [JSDoc](http://usejsdoc.org/) 주석을 처리할 때 [Tsickle](https://github.com/angular/tsickle)를 사용하도록 지정할 수 있습니다.

기본값은 `false`입니다.

### *annotationsAs*

<!--
Use this option to modify how the Angular specific annotations are emitted to improve tree-shaking. Non-Angular
annotations and decorators are unaffected. Default is `static fields`.
-->
이 옵션을 사용하면 코드에 사용된 어노테이션 중 어떤 것을 트리셰이킹 할 것인지 지정할 수 있습니다.
이 때 Angular가 제공하지 않는 어노테이션과 데코레이터는 영향을 받지 않습니다.

기본값은 `static fields`입니다.

<style>
  td, th {vertical-align: top}
</style>

<!--
<table>
  <tr>
    <th>Value</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>decorators</code></td>
    <td>Leave the decorators in place. This makes compilation faster. TypeScript will emit calls to the __decorate helper.  Use <code>--emitDecoratorMetadata</code> for runtime reflection.  However, the resulting code will not properly tree-shake.</td>
  </tr>
  <tr>
    <td><code>static fields</code></td>
    <td>Replace decorators with a static field in the class. Allows advanced tree-shakers like
    <a href="https://github.com/google/closure-compiler">Closure compiler</a> to remove unused classes.</td>
  </tr>
  </table>
-->
<table>
  <tr>
    <th>값</th>
    <th>설명</th>
  </tr>
  <tr>
    <td><code>decorators</code></td>
    <td>데코레이터를 유지합니다. 이 옵션값을 사용하면 컴파일 시간이 단축되며, TypeScript가 __decorate 헬퍼를 사용합니다. 그리고 이 내용을 실행되는 코드에 적용하려면 <code>--emitDecoratorMetadata</code> 옵션을 함께 사용해야 합니다. 트리셰이킹은 동작하지 않을 수도 있습니다.</td>
  </tr>
  <tr>
    <td><code>static fields</code></td>
    <td>데코레이터를 클래스의 정적 필드로 변환합니다. <a href="https://github.com/google/closure-compiler">Closure compiler</a>와 같은 최신 트리셰이커를 사용한다면, 이 데코레이터가 실제로 사용되지 않았을 때 최종 빌드 결과물에서 제거됩니다.</td>
  </tr>
</table>


### *trace*

<!--
This tells the compiler to print extra information while compiling templates.
-->
이 옵션을 사용하면 템플릿을 컴파일하는 동안 자세한 정보가 출력됩니다.

### *enableLegacyTemplate*

<!--
Use of  the `<template>` element was deprecated starting in Angular 4.0 in favor of using
`<ng-template>` to avoid colliding with the DOM's element of the same name. Setting this option to
`true` enables the use of the deprecated `<template>` element. This option
is `false` by default. This option might be required by some third-party Angular libraries.
-->
`<template>` 엘리먼트는 같은 이름으로 사용되는 DOM 엘리먼트와 충돌하는 것을 방지하기 위해 Angular 4.0부터 `<ng-template>`으로 변경되었습니다.
그런데 이 옵션의 값을 `true`로 지정하면 지원이 중단된 `<template>` 엘리먼트를 사용할 수 있습니다.
기본값은 `false`입니다.

서드파티 Angular 라이브러리가 `<template>` 엘리먼트를 사용한다면 이 옵션의 값을 `true`로 지정해야 합니다.

### *disableExpressionLowering*

<!--
The Angular template compiler transforms code that is used, or could be used, in an annotation
to allow it to be imported from template factory modules. See
[metadata rewriting](#metadata-rewriting) for more information.

Setting this option to `false` disables this rewriting, requiring the rewriting to be
done manually.
-->
Angular 템플릿 컴파일러는 어노테이션에 사용되는 코드를 팩토리 모듈 형식으로 변환합니다.
자세한 내용은 [메타데이터 재구축](#metadata-rewriting) 섹션을 참고하세요.

이 옵션의 값이 `false`로 지정되면 메타데이터를 재구축하지 않습니다. 메타데이터를 수동으로 재구축하는 경우에 이 옵션을 사용합니다.

### *disableTypeScriptVersionCheck*

<!--
When `true`, this option tells the compiler not to check the TypeScript version.
The compiler will skip checking and will not error out when an unsupported version of TypeScript is used.
Setting this option to `true` is not recommended because unsupported versions of TypeScript might have undefined behavior.

This option is `false` by default.
-->
이 옵션의 값이 `true`로 지정되면 AoT 컴파일러가 TypeScript 버전을 체크하지 않으며, 사용하고 있는 TypeScript의 버전을 지원하지 않는다고 해도 에러를 발생시키지 않습니다.
하지만 이렇게 사용하면 Angular 컴파일러가 의도한대로 동작하지 않을 수 있기 때문에 이 옵션의 값을 `true`로 지정하는 것은 권장하지 않습니다.

기본값은 `false`입니다.

### *preserveWhitespaces*

<!--
This option tells the compiler whether to remove blank text nodes from compiled templates.
As of v6, this option is `false` by default, which results in smaller emitted template factory modules.
-->
이 옵션을 사용하면 템플릿 컴파일러가 템플릿을 컴파일하면서 공백문자가 사용된 빈 텍스트 노드를 제거하지 않습니다.
Angular v6 부터는 템플릿 팩토리 모듈을 좀 더 단순화하기 위해 `false`가 기본값입니다.

### *allowEmptyCodegenFiles*

<!--
Tells the compiler to generate all the possible generated files even if they are empty. This option is
`false` by default. This is an option used by the Bazel build rules and is needed to simplify
how Bazel rules track file dependencies. It is not recommended to use this option outside of the Bazel
rules.
-->
이 옵션을 사용하면 템플릿 컴파일러가 생성한 파일의 내용이 없더라도 이 파일을 유지합니다.
기본값은 `false`입니다.

이 옵션은 Bazel 빌드 룰에 파일 이름을 반드시 지정해야 하거나 Bazel 빌드 룰이 추적하는 파일의 의존성을 간단하게 작성하고 싶을 때 사용합니다.
하지만 Bazel 빌드 룰 이외에서는 `true` 값을 사용하지 않는 것을 권장합니다.
