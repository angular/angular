<!--
# Ahead-of-time (AOT) compilation
-->
# Ahead-of-Time (AOT) 컴파일러

<!--
An Angular application consists mainly of components and their HTML templates. Because the components and templates provided by Angular cannot be understood by the browser directly, Angular applications require a compilation process before they can run in a browser.

The Angular [ahead-of-time (AOT) compiler](guide/glossary#aot) converts your Angular HTML and TypeScript code into efficient JavaScript code during the build phase _before_ the browser downloads and runs that code. Compiling your application during the build process provides a faster rendering in the browser.

This guide explains how to specify metadata and apply available compiler options to compile your applications efficiently using the AOT compiler.
-->
Angular 애플리케이션은 크게 컴포넌트와 컴포넌트 HTML 템플릿으로 구성됩니다. 그런데 이 컴포넌트와 템플릿은 브라우저가 바로 이해할 수 없기 때문에 Angular 애플리케이션은 브라우저에서 실행되기 전에 컴파일되어야 합니다.

<div class="alert is-helpful">

  <!--
  <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">Watch compiler author Tobias Bosch explain the Angular compiler</a> at AngularConnect 2016.
  -->
  컴파일러를 개발한 Tobias Bosch가 <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">AngularConnect 2016에서 발표한 내용</a>도 확인해 보세요.

</div>

{@a why-aot}

Here are some reasons you might want to use AOT.

* *Faster rendering*
   With AOT, the browser downloads a pre-compiled version of the application.
   The browser loads executable code so it can render the application immediately, without waiting to compile the app first.

* *Fewer asynchronous requests*
   The compiler _inlines_ external HTML templates and CSS style sheets within the application JavaScript,
   eliminating separate ajax requests for those source files.

* *Smaller Angular framework download size*
   There's no need to download the Angular compiler if the app is already compiled.
   The compiler is roughly half of Angular itself, so omitting it dramatically reduces the application payload.

* *Detect template errors earlier*
   The AOT compiler detects and reports template binding errors during the build step
   before users can see them.

* *Better security*
   AOT compiles HTML templates and components into JavaScript files long before they are served to the client.
   With no templates to read and no risky client-side HTML or JavaScript evaluation,
   there are fewer opportunities for injection attacks.

{@a overview}

<!--
## Choosing a compiler
-->
## 컴파일러 선택하기

<!--
Angular offers two ways to compile your application:
-->
Angular는 두 종류의 컴파일 방식을 제공합니다:

<!--
* **_Just-in-Time_ (JIT)**, which compiles your app in the browser at runtime.
* **_Ahead-of-Time_ (AOT)**, which compiles your app at build time.
-->
* **_Just-in-Time_ (JIT)**: 브라우저에서 애플리케이션을 실행하면서 코드를 직접 컴파일하는 방식입니다.
* **_Ahead-of-Time_ (AOT)**: 브라우저에 애플리케이션 코드를 보내기 전에 미리 컴파일하는 방식입니다.

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

## How AOT works

The Angular AOT compiler extracts **metadata** to interpret the parts of the application that Angular is supposed to manage.
You can specify the metadata explicitly in **decorators** such as `@Component()` and `@Input()`, or implicitly in the constructor declarations of the decorated classes.
The metadata tells Angular how to construct instances of your application classes and interact with them at runtime.

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

### Compilation phases

There are three phases of AOT compilation.
* Phase 1 is *code analysis*.
   In this phase, the TypeScript compiler and  *AOT collector* create a representation of the source. The collector does not attempt to interpret the metadata it collects. It represents the metadata as best it can and records errors when it detects a metadata syntax violation.

* Phase 2 is *code generation*.
    In this phase, the compiler's `StaticReflector` interprets the metadata collected in phase 1, performs additional validation of the metadata, and throws an error if it detects a metadata restriction violation.

* Phase 3 is *template type checking*.
   In this optional phase, the Angular *template compiler* uses the TypeScript compiler to validate the binding expressions in templates. You can enable this phase explicitly by setting the `fullTemplateTypeCheck` configuration option; see [Angular compiler options](guide/angular-compiler-options).


<!--
### Metadata restrictions
-->
### 메타데이터의 제약사항

<!--
You write metadata in a _subset_ of TypeScript that must conform to the following general constraints:
-->
메타데이터는 TypeScript의 _하위 집합(subset)_ 이며 보통 다음과 같은 제약사항이 있습니다:

<!--
* Limit [expression syntax](#expression-syntax) to the supported subset of JavaScript.
* Only reference exported symbols after [code folding](#code-folding).
* Only call [functions supported](#supported-functions) by the compiler.
* Decorated and data-bound class members must be public.
-->
1. JavaScript 문법 중 [표현식(expression syntax)](#expression-syntax)은 일부만 사용할 수 있습니다.
2. [코드를 폴딩](#code-folding)한 이후에 존재하는 심볼만 참조할 수 있습니다.
3. 컴파일러가 지원하는 [일부 함수](#supported-functions)만 사용할 수 있습니다.
4. 데코레이터가 사용되거나 데이터 바인딩되는 클래스 멤버는 public으로 지정되어야 합니다.

For additional guidelines and instructions on preparing an application for AOT compilation, see [Angular: Writing AOT-friendly applications](https://medium.com/sparkles-blog/angular-writing-aot-friendly-applications-7b64c8afbe3f).

<div class="alert is-helpful">

Errors in AOT compilation commonly occur because of metadata that does not conform to the compiler's requirements (as described more fully below).
For help in understanding and resolving these problems, see [AOT Metadata Errors](guide/aot-metadata-errors).

</div>

### Configuring AOT compilation

You can provide options in the `tsconfig.json` [TypeScript configuration file](guide/typescript-configuration) that control the compilation process. See [Angular compiler options](guide/angular-compiler-options) for a complete list of available options.

<!--
## Phase 1: Code analysis
-->
## 1단계: 분석

<!--
The TypeScript compiler does some of the analytic work of the first phase. It emits the `.d.ts` _type definition files_ with type information that the AOT compiler needs to generate application code.
At the same time, the AOT **collector** analyzes the metadata recorded in the Angular decorators and outputs metadata information in **`.metadata.json`** files, one per `.d.ts` file.

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
### Expression syntax limitations
-->
### 표현식(Expression syntax)의 한계

<!--
The AOT collector only understands a subset of JavaScript.
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
If an expression uses unsupported syntax, the collector writes an error node to the `.metadata.json` file.
The compiler later reports the error if it needs that piece of metadata to generate the application code.
-->
만약 이 목록에 해당되지 않은 표현식이 사용되면 _콜렉터_ 가 처리할 수 없기 때문에 에러기 발생하며 `.metadata.json` 파일도 정상적으로 생성되지 않습니다. 결국 애플리케이션 코드를 빌드할 때 에러가 발생합니다.

<div class="alert is-helpful">

<!--
 If you want `ngc` to report syntax errors immediately rather than produce a `.metadata.json` file with errors, set the `strictMetadataEmit` option in the TypeScript configuration file, `tsconfig.json`.
-->
`.metadata.json` 파일에 에러를 출력하는 대신 `ngc`에서 직접 문법 에러가 발생하게 하려면 TypeScript 설정 파일인 `tsconfig.json` 파일에 `strictMetadataEmit` 옵션을 다음과 같이 설정하세요.

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
The AOT collector does not support the arrow function, `() => new Server()`, in a metadata expression.
It generates an error node in place of the function.
When the compiler later interprets this node, it reports an error that invites you to turn the arrow function into an _exported function_.
-->
이 코드에는 AOT 콜렉터가 지원하지 않는 화살표 함수가 `() => new Server()`와 같이 사용되었습니다.
그러면 이 코드는 제대로 변환되지 못하고 에러 노드로 처리됩니다.
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

In version 5 and later, the compiler automatically performs this rewriting while emitting the `.js` file.

{@a exported-symbols}
{@a code-folding}
<!--
### Code folding
-->
### 코드 폴딩 (Code Folding)

<!--
The compiler can only resolve references to **_exported_** symbols.
The collector, however, can evaluate an expression during collection and record the result in the `.metadata.json`, rather than the original expression.
This allows you to make limited use of non-exported symbols within expressions.

For example, the collector can evaluate the expression `1 + 2 + 3 + 4` and replace it with the result, `10`.
This process is called _folding_. An expression that can be reduced in this manner is _foldable_.
-->
AOT 컴파일러는 **_export_** 키워드가 사용된 심볼만 참조할 수 있습니다.
하지만 다행히도 _콜렉터_ 는 _폴딩_ 이라는 것을 통해 `export` 키워드가 사용되지 않은 심볼도 제한적으로 참조할 수 있습니다.

_콜렉터_ 는 콜렉션 단계에서 표현식을 평가하고 그 결과를 `.metadata.json` 파일에 기록하는데, 이 때 원래 코드를 약간 변형해서 기록합니다.

예를 들어 _콜렉터_ 가 `1 + 2 + 3 + 4` 라는 표현식을 평가하고 나면 `.metadata.json` 파일에는 이 내용을 `10`으로 기록합니다.

이 과정을 _폴딩(folding)_ 이라고 합니다. 그리고 이 과정이 적용될 수 있는 코드를 _폴딩할 수 있는(foldable)_ 코드라고 합니다.

{@a var-declaration}
<!--
The collector can evaluate references to module-local `const` declarations and initialized `var` and `let` declarations, effectively removing them from the `.metadata.json` file.

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
The collector, however, can fold the `template` constant into the metadata definition by in-lining its contents.
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
The collector reduces this expression to its equivalent _folded_ string:
-->
이 코드의 템플릿을 콜렉터가 처리하고 나면 다음과 같이 _폴딩 된_ 문자열로 변환됩니다:

```
'<div>{{hero.name}}</div><div>{{hero.title}}</div>'
```

<!--
#### Foldable syntax
-->
#### 폴딩할 수 있는 문법

<!--
The following table describes which expressions the collector can and cannot fold:
-->
콜렉터가 폴딩할 수 있는 문법에는 어떤 것들이 있는지 확인해 보세요:

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
    <td>yes</td>
  </tr>
  <tr>
    <td>Literal array  </td>
    <td>yes</td>
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
The collector makes no attempt to understand the metadata that it collects and outputs to `.metadata.json`.
It represents the metadata as best it can and records errors when it detects a metadata syntax violation.
It's the compiler's job to interpret the `.metadata.json` in the code generation phase.

The compiler understands all syntax forms that the collector supports, but it may reject _syntactically_ correct metadata if the _semantics_ violate compiler rules.
-->
_콜렉터_ 는 메타데이터를 이해하는 것이 아니라 메타데이터를 찾아서 `.metadata.json`에 모으는 역할만 합니다.
그리고 이 과정에서 메타데이터에 사용된 문법에 오류가 있는지도 검사합니다.
`.mdtadata.json` 파일을 해석해서 코드를 생성하는 것은 컴파일러의 역할입니다.

The compiler understands all syntax forms that the collector supports, but it may reject _syntactically_ correct metadata if the _semantics_ violate compiler rules.

### Public symbols

The compiler can only reference _exported symbols_.

* Decorated component class members must be public. You cannot make an `@Input()` property private or protected.
* Data bound properties must also be public.

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
  private title = 'My App'; // Bad
}
```

{@a supported-functions}

### Supported classes and functions

The collector can represent a function call or object creation with `new` as long as the syntax is valid.
The compiler, however, can later refuse to generate a call to a _particular_ function or creation of a _particular_ object.

The compiler can only create instances of certain classes, supports only core decorators, and only supports calls to macros (functions or static methods) that return expressions.
* New instances

   The compiler only allows metadata that create instances of the class `InjectionToken` from `@angular/core`.

* Supported decorators

   The compiler only supports metadata for the [Angular decorators in the `@angular/core` module](api/core#decorators).

* Function calls

   Factory functions must be exported, named functions.
   The AOT compiler does not support lambda expressions ("arrow functions") for factory functions.

{@a function-calls}
### Functions and static method calls

The collector accepts any function or static method that contains a single `return` statement.
The compiler, however, only supports macros in the form of functions or static methods that return an *expression*.

For example, consider the following function:

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
The compiler treats object literals containing the fields `useClass`, `useValue`, `useFactory`, and `data` specially, converting the expression initializing one of these fields into an exported variable that replaces the expression.
This process of rewriting these expressions removes all the restrictions on what can be in them because
the compiler doesn't need to know the expression's value&mdash;it just needs to be able to generate a reference to the value.
-->
AOT 컴파일러는 메타데이터에 사용된 `useClass`, `useValue`, `useFactory`에 사용된 객체 리터럴과 `data` 프로퍼티를 처리해서 각각 `export`로 지정된 변수로 변환합니다.
컴파일러는 이 필드에 사용된 표현식 자체를 알 필요는 없습니다. 단순하게 결과만 참조하면 됩니다.

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

This allows the compiler to generate a reference to `ɵ0` in the factory without having to know what the value of `ɵ0` contains.

The compiler does the rewriting during the emit of the `.js` file.
It does not, however, rewrite the `.d.ts` file, so TypeScript doesn't recognize it as being an export. and it does not interfere with the ES module's exported API.


{@a binding-expression-validation}
## Phase 3: Template type checking

One of the Angular compiler's most helpful features is the ability to type-check expressions within templates, and catch any errors before they cause crashes at runtime.
In the template type-checking phase, the Angular template compiler uses the TypeScript compiler to validate the binding expressions in templates.

Enable this phase explicitly by adding the compiler option `"fullTemplateTypeCheck"` in the `"angularCompilerOptions"` of the project's `tsconfig.json`
(see [Angular Compiler Options](guide/angular-compiler-options)).

<div class="alert is-helpful">

In [Angular Ivy](guide/ivy), the template type checker has been completely rewritten to be more capable as well as stricter, meaning it can catch a variety of new errors that the previous type checker would not detect.

As a result, templates that previously compiled under View Engine can fail type checking under Ivy. This can happen because Ivy's stricter checking catches genuine errors, or because application code is not typed correctly, or because the application uses libraries in which typings are inaccurate or not specific enough.

This stricter type checking is not enabled by default in version 9, but can be enabled by setting the `strictTemplates` configuration option.
We do expect to make strict type checking the default in the future.

<!-- For more information about type-checking options, and about improvements to template type checking in version 9 and above, see [Template type checking](guide/template-type-checking). -->

</div>

Template validation produces error messages when a type error is detected in a template binding
expression, similar to how type errors are reported by the TypeScript compiler against code in a `.ts`
file.

For example, consider the following component:

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
This produces the following error:
-->
이 컴포넌트의 템플릿에서 발생하는 에러는 다음과 같이 표시됩니다:

```
  my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?
```

<!--
The file name reported in the error message, `my.component.ts.MyComponent.html`, is a synthetic file
generated by the template compiler that holds contents of the `MyComponent` class template.
The compiler never writes this file to disk.
The line and column numbers are relative to the template string in the `@Component` annotation of the class, `MyComponent` in this case.
If a component uses `templateUrl` instead of `template`, the errors are reported in the HTML file referenced by the `templateUrl` instead of a synthetic file.
-->
에러 메시지에 표시된 파일 이름은 `my.component.ts.MyComponent.html`인데, 이 내용을 해석해 보면 `MyComponent` 클래스가 정의된 코드의 템플릿에서 에러가 발생했다는 것을 확인할 수 있습니다.
컴파일러는 템플릿 파일을 디스크에 따로 저장하지 않습니다.
그리고 에러 메시지로 출력되는 에러 위치는 `@Component` 어노테이션을 기준으로 한 상대 위치로 표시됩니다.
컴포넌트에 `template` 대신 `templateUrl`을 사용했다면, 에러 메시지는 컴포넌트 클래스 파일 대신 HTML 파일을 가리키는 방식으로 출력됩니다.

<!--
The error location is the beginning of the text node that contains the interpolation expression with the error.
If the error is in an attribute binding such as `[value]="person.address.street"`, the error
location is the location of the attribute that contains the error.

The validation uses the TypeScript type checker and the options supplied to the TypeScript compiler to control how detailed the type validation is.
For example, if the `strictTypeChecks` is specified, the error
```my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'```
is reported as well as the above error message.
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
template compiler, the same way the `if` expression does in TypeScript.
For example, to avoid `Object is possibly 'undefined'` error in the template above, modify it to only emit the interpolation if the value of `person` is initialized as shown below:
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

Using `*ngIf` allows the TypeScript compiler to infer that the `person` used in the binding expression will never be `undefined`.

<!--
#### Custom `ngIf` like directives
-->
#### 커스텀 `ngIf` 디렉티브

<!--
Directives that behave like `*ngIf` can declare that they want the same treatment by including a static member marker that is a signal to the template compiler to treat them like `*ngIf`. This static member for `*ngIf` is:
-->
`*ngIf`와 비슷한 역할을 하는 디렉티브를 만들어서 활용할 수도 있는데, 이런 디렉티브를 사용하면 템플릿 컴파일러가 템플릿을 처리할 때 좀 더 많은 정보를 제공할 수 있습니다.
`*ngIf` 디렉티브의 정적 멤버 중에는 이런 것이 있습니다:

```typescript
    public static ngIfUseIfTypeGuard: void;
```

This declares that the input property `ngIf` of the `NgIf` directive should be treated as a guard to the use of its template, implying that the template will only be instantiated if the `ngIf` input property is true.

<!--
### Non-null type assertion operator
-->
### null 방지 연산자

<!--
Use the [non-null type assertion operator](guide/template-syntax#non-null-assertion-operator) to suppress the `Object is possibly 'undefined'` error when it is inconvenient to use `*ngIf` or when some constraint in the component ensures that the expression is always non-null when the binding expression is interpolated.

In the following example, the `person` and `address` properties are always set together, implying that `address` is always non-null if `person` is non-null.
There is no convenient way to describe this constraint to TypeScript and the template compiler, but the error is suppressed in the example by using `address!.street`.
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
The non-null assertion operator should be used sparingly as refactoring of the component might break this constraint.

In this example it is recommended to include the checking of `address` in the `*ngIf` as shown below:
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
