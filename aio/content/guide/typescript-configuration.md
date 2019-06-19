<!--
# TypeScript Configuration
-->
# TypeScript 설정

<!--
TypeScript is a primary language for Angular application development.
It is a superset of JavaScript with design-time support for type safety and tooling.
-->
Angular 애플리케이션을 개발할 때 가장 많이 사용하는 언어는 TypeScript입니다.
TypeScript는 JavaScript의 슈퍼셋이며 정적 타입을 도입하면서 더 많은 정보를 개발자에게 제공합니다.

<!--
Browsers can't execute TypeScript directly. Typescript must be "transpiled" into JavaScript using the *tsc* compiler,
which requires some configuration.
-->
하지만 브라우저에서 TypeScript를 직접 실행할 수는 없습니다. TypeScript 반드시 *tsc* 컴파일러를 통해 JavaScript로 *트랜스파일(transpiled)*되어야 합니다. 그리고 이 때 몇가지 옵션을 지정해야 합니다.

<!--
This page covers some aspects of TypeScript configuration and the TypeScript environment
that are important to Angular developers, including details about the following files:
-->
이 문서에서는 TypeScript 개발환경과 환경 설정 파일 중 Angular 개발환경에 필요한 내용에 대해 안내합니다.
주로 다음 파일에 대해 설명합니다:

<!--
* [tsconfig.json](guide/typescript-configuration#tsconfig)&mdash;TypeScript compiler configuration.
* [typings](guide/typescript-configuration#typings)&mdash;TypesScript declaration files.
-->
* [tsconfig.json](guide/typescript-configuration#tsconfig)&mdash;TypeScript 컴파일러 설정 파일
* [typings](guide/typescript-configuration#typings)&mdash;TypesScript 타입 정의 파일


{@a tsconfig}



## *tsconfig.json*

<!--
Typically, you add a TypeScript configuration file called `tsconfig.json` to your project to
guide the compiler as it generates JavaScript files.
-->
일반적으로 TypeScript 코드를 JavaScript로 변환하려면 프로젝트에 `tsconfig.json` 파일을 생성해야 하며, 이 파일에 컴파일 옵션을 지정합니다.

<div class="alert is-helpful">


<!--
For details about `tsconfig.json`, see the official
[TypeScript wiki](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
-->
`tsconfig.json` 파일에 대한 자세한 내용은 [공식 TypeScript 위키](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html)를 참고하세요.

</div>


<!--
The [Setup](guide/setup) guide uses the following `tsconfig.json`:
-->
[로컬 개발환경 설정하기](guide/setup) 문서에서 만든 `tsconfig.json` 파일은 다음과 같은 내용입니다:

<code-example lang="json" header="tsconfig.json" linenums="false">
  {
    "compilerOptions": {
      "target": "es5",
      "module": "commonjs",
      "moduleResolution": "node",
      "sourceMap": true,
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "lib": [ "es2015", "dom" ],
      "noImplicitAny": true,
      "suppressImplicitAnyIndexErrors": true
    }
  }
</code-example>

<!--
This file contains options and flags that are essential for Angular applications.
-->
이 파일에 정의된 옵션과 플래그들은 Angular 애플리케이션을 개발할 때 꼭 필요한 내용들입니다.


{@a noImplicitAny}

<!--
### *noImplicitAny* and *suppressImplicitAnyIndexErrors*
-->
### *noImplicitAny*와 *suppressImplicitAnyIndexErrors*

<!--
TypeScript developers disagree about whether the `noImplicitAny` flag should be `true` or `false`.
There is no correct answer and you can change the flag later.
But your choice now can make a difference in larger projects, so it merits discussion.
-->
`noImplicitAny` 플래그 값을 무엇으로 지정해야 하는지에 대한 정답은 없습니다. 개발자에 따라 `true`가 편할수도 있고 `false`가 편할수도 있으며, 나중에 이 값을 변경하더라도 큰 문제는 없습니다.
하지만 규모가 큰 프로젝트를 개발한다면 이 플래그의 역할에 대해 확실히 알아두는 것이 좋습니다.

<!--
When the `noImplicitAny` flag is `false` (the default), and if
the compiler cannot infer the variable type based on how it's used,
the compiler silently defaults the type to `any`. That's what is meant by *implicit `any`*.
-->
`noImplicitAny` 플래그 값이 `false` (기본값)로 설정되면 타입이 지정되지 않은 변수에 TypeScript의 타입 추론 기능이 동작하며, 최종적으로 타입을 추론하지 못한 변수를 `any` 타입으로 처리합니다. 그래서 이 플래그는 *implicit `any`*를 의미한다고도 볼 수 있습니다.

<!--
The documentation setup sets the `noImplicitAny` flag to `true`.
When the `noImplicitAny` flag is `true` and the TypeScript compiler cannot infer
the type, it still generates the JavaScript files, but it also **reports an error**.
Many seasoned developers prefer this stricter setting because type checking catches more
unintentional errors at compile time.
-->
이 문서에서는 `noImplicitAny` 플래그의 값을 `true`로 지정했습니다.
`noImplicitAny` 플래그의 값이 `true`이면 TypeScript 컴파일러의 타입 추론이 여전히 동작하고 JavaScript로 코드를 변환하는 데에도 문제가 없지만, 타입을 추론하지 못한 변수가 있을 때 **에러가 발생합니다**.
이렇게 설정하면 컴파일 시점에 발생할 수 있는 에러를 좀 더 강력한 정적 타입 룰로 방지할 수 있기 때문에, 많은 개발자들이 이 옵션을 선호합니다.

<!--
You can set a variable's type to `any` even when the `noImplicitAny` flag is `true`.
-->
이 때 `noImplicitAny` 값을 `true`로 지정하더라도 변수 타입에 `any`를 지정하는 것은 여전히 허용됩니다.

<!--
When the `noImplicitAny` flag is `true`, you may get *implicit index errors* as well.
Most developers feel that *this particular error* is more annoying than helpful.
You can suppress them with the following additional flag:
-->
`noImplicitAny` 플래그 값이 `true`이면 *추론 인덱스 에러(implicit index errors)*가 발생할 수도 있습니다.
이 에러는 대부분의 개발자들이 귀찮다고 생각하는 에러이기 때문에, 이 에러는 다음 플래그를 추가로 설정해서 무시할 수 있습니다:

<code-example format=".">
  "suppressImplicitAnyIndexErrors":true

</code-example>


<!--
The documentation setup sets this flag to `true` as well.
-->
이 문서에서는 `suppressImplicitAnyIndexErrors` 플래그의 값도 `true`로 지정합니다.


{@a typings}



## TypeScript Typings
<!--
Many JavaScript libraries, such as jQuery, the Jasmine testing library, and Angular,
extend the JavaScript environment with features and syntax
that the TypeScript compiler doesn't recognize natively.
When the compiler doesn't recognize something, it throws an error.
-->
jQuery나 Jasmine과 같이 JavaScript로 만들어진 라이브러리들은 TypeScript 컴파일러가 타입 정보를 인식할 수 없습니다. 그래서 TypeScript 코드를 컴파일 할 때 적절한 타입 정보를 찾지 못하면 에러가 발생합니다.

<!--
Use [TypeScript type definition files](https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html)&mdash;`d.ts files`&mdash;to tell the compiler about the libraries you load.
-->
라이브러리에 대한 타입 정보는 [TypeScript 타입 정의 파일](https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html)&mdash;`d.ts` 파일&mdash;로 제공할 수 있습니다.

<!--
TypeScript-aware editors leverage these same definition files to display type information about library features.
-->
그리고 TypeScript 지원 기능을 제공하는 에디터라면 이 타입 정의 파일을 활용해서 개발자에게 라이브러리에 대한 정보를 좀 더 많이 제공할 수 있습니다.

<!--
Many libraries include definition files in their npm packages where both the TypeScript compiler and editors
can find them. Angular is one such library.
The `node_modules/@angular/core/` folder of any Angular application contains several `d.ts` files that describe parts of Angular.
-->
최근에는 npm 패키지들도 타입 정의 파일을 포함해서 배포하고 있기 때문에 TypeScript 컴파일러와 에디터들도 이 파일을 활용할 수 있습니다.
Angular도 이런 경우에 해당됩니다.
`node_modules/@angulalr/core/` 폴더만 봐도 Angular에 대한 타입 정의 파일이 여러개 정의되어 있습니다.

<!--
**You don't need to do anything to get *typings* files for library packages that include `d.ts` files.
Angular packages include them already.**
-->
**패키지에서 `d.ts` 파일을 제공한다면 *타입 정의 파일*을 따로 추가할 필요가 없습니다.**

### lib.d.ts

<!--
TypeScript includes a special declaration file called `lib.d.ts`. This file contains the ambient declarations for various common JavaScript constructs present in JavaScript runtimes and the DOM.
-->
TypeScript에는 조금 특별한 타입 정의 파일인 `lib.d.ts`가 있습니다. 이 파일은 실행 시점의 JavaScript 객체나 DOM 객체에 대한 타입을 제공합니다.

<!--
Based on the `--target`, TypeScript adds _additional_ ambient declarations
like `Promise` if the target is `es6`.
-->
TypeScript 컴파일에 사용하는 `--target` 옵션에 따라 타입 정의 파일이 _추가로_ 생성될 수도 있습니다. `--target` 옵션이 `es6`라면 `Promise`에 대한 타입 정의가 추가되는 식입니다.

<!--
Since the QuickStart is targeting `es5`, you can override the
list of declaration files to be included:
-->
이 사이트에서 다루는 퀵스타트 프로젝트는 `es5` 문법으로 컴파일되기 때문에 타입 정의 파일을 다음과 같이 오버라이딩할 수도 있습니다:

<code-example format=".">
  "lib": ["es2015", "dom"]

</code-example>


<!--
Thanks to that, you have all the `es6` typings even when targeting `es5`.
-->
그러면 `es5` 문법으로 컴파일되는 프로젝트에도 `es6` 문법을 모두 사용할 수 있습니다.

<!--
### Installable typings files
-->
### 타입정의 파일 설치하기

<!--
Many libraries&mdash;jQuery, Jasmine, and Lodash among them&mdash;do *not* include `d.ts` files in their npm packages.
Fortunately, either their authors or community contributors have created separate `d.ts` files for these libraries and
published them in well-known locations.
-->
npm 패키지 중에는 `d.ts` 파일을 제공하지 *않는* 패키지들도 많습니다. jQuery나 Jasmine, Lodash 들이 그렇습니다.
하지만 다행히 라이브러리 개발자나 커뮤니티 기여자들이 이 라이브러리에 대한 `d.ts` 파일을 추가로 제공하는 경우가 있습니다.

<!--
You can install these typings via `npm` using the
[`@types/*` scoped package](http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)
and Typescript, starting at 2.0, automatically recognizes them.
-->
이런 타입 정의 파일은 TypeScript 2.0부터 [`@types/*` 로 시작하는 패키지](http://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html)로 제공되며, `npm`으로 설치하면 자동으로 인식됩니다.

<!--
For instance, to install typings for `jasmine` you could do `npm install @types/jasmine --save-dev`.
-->
예를 들어 `jasmine`에 대한 타입 정의 파일을 설치하려면 `npm install @types/jasmine --save-dev` 명령을 실행하면 됩니다.

<!--
QuickStart identifies two *typings*, or `d.ts`, files:

* [jasmine](http://jasmine.github.io/) typings for the Jasmine test framework.

* [node](https://www.npmjs.com/package/@types/node) for code that references objects in the *Node.js®* environment;
-->
퀵스타트 프로젝트에서는 *타입 정의 파일*을 2개 사용합니다:

* [jasmine](http://jasmine.github.io/) 테스트 프레임워크에 대한 타입 정의 파일

* *Node.js®* 에서 제공하는 객체를 참조할 때 사용하는 [node](https://www.npmjs.com/package/@types/node) 타입 정의 파일

<!--
QuickStart doesn't require these typings but many of the samples do.
-->
이런 방식은 이 웹사이트에서 다루는 다른 예제들에도 같은 방식으로 사용됩니다.


{@a target}


### *target*

<!--
By default, the target is `es5`, you can configure the target to `es6` if you only want to deploy the application to
es6 compatible browser. But if you configure the target to `es6` in some old browser such as `IE`, `Syntax Error` will be thrown.
-->
Angular CLI가 생성한 프로젝트의 기본 타겟은 `es5`지만, es6 문법을 지원하는 브라우저에서만 실행한다면 `es6`로 변경할 수도 있습니다.
다만, `es6`로 바꾸고 애플리케이션을 배포한 후에 `IE`와 같은 예전 브라우저로 애플리케이션을 실행하면 `Syntax Error` 에러가 발생할 수 있습니다.
