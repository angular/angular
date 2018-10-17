<!--
# The Ahead-of-Time (AOT) Compiler
-->
# Ahead-of-Time (AOT) 컴파일러

<!--
The Angular Ahead-of-Time (AOT) compiler converts your Angular HTML and TypeScript code into efficient JavaScript code during the build phase _before_ the browser downloads and runs that code.
-->
Angular Ahead-of-Time (AOT) 컴파일러는 Angular 문법이 사용된 HTML 문서와 TypeScript 코드를 JavaScript 코드로 변환하는 툴입니다. 이 때 변환과정은 브라우저가 코드를 다운받기 _전에_ 실행됩니다.

<!--
This guide explains how to build with the AOT compiler using different compiler options and how to write Angular metadata that AOT can compile.
-->
이 문서에서는 AOT 컴파일러를 사용할 때 어떤 옵션을 사용할 수 있는지, AOT 컴파일러로 컴파일할 때 주의해야할 내용은 어떤 것이 있는지 안내합니다.

<div class="alert is-helpful">

  <!--
  <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">Watch compiler author Tobias Bosch explain the Angular Compiler</a> at AngularConnect 2016.
  -->
  Angular 컴파일러를 만드는 Tobias Bosch가 <a href="https://www.youtube.com/watch?v=kW9cJsvcsGo">AngularConnect 2016에서 발표한 내용</a>도 참고하세요.

</div>

{@a overview}

<!--
## Angular compilation
-->
## Angular의 컴파일

<!--
An Angular application consists largely of components and their HTML templates.
Before the browser can render the application,
the components and templates must be converted to executable JavaScript by an _Angular compiler_.
-->
Angular 애플리케이션에는 수많은 컴포넌트와 HTML 컴포넌트 템플릿이 있습니다.
그리고 이 파일들은 _Angular 컴파일러_ 를 통해 브라우저가 실행할 수 있는 JavaScript 코드로 변환되어야 합니다.

<!--
Angular offers two ways to compile your application:
-->
Angular는 두 종류의 컴파일 방식을 제공합니다:

<!--
1. **_Just-in-Time_ (JIT)**, which compiles your app in the browser at runtime
1. **_Ahead-of-Time_ (AOT)**, which compiles your app at build time.
-->
1. **_Just-in-Time_ (JIT)**: 브라우저에서 애플리케이션을 실행하면서 코드를 직접 컴파일하는 방식입니다.
1. **_Ahead-of-Time_ (AOT)**: 브라우저에 애플리케이션 코드를 보내기 전에 미리 컴파일하는 방식입니다.

<!--
JIT compilation is the default when you run the _build-only_ or the _build-and-serve-locally_ CLI commands:
-->
_옵션 없이 빌드_ 하거나 _개발 서버를 띄우기 위해_ Angular CLI를 사용하면 JIT 방식으로 컴파일됩니다. 다음 두 명령이 이 경우에 해당됩니다:

<code-example language="sh" class="code-shell">
  ng build
  ng serve
</code-example>

{@a compile}

<!--
For AOT compilation, append the `--aot` flags to the _build-only_ or the _build-and-serve-locally_ CLI commands:
-->
그리고 두 경우 모두 `--aot` 플래그를 붙여 실행하면 AOT 방식으로 컴파일됩니다.

<code-example language="sh" class="code-shell">
  ng build --aot
  ng serve --aot
</code-example>

<div class="alert is-helpful">

<!--
The `--prod` meta-flag compiles with AOT by default.
-->
`--prod` 메타 플래그를 사용해도 AOT 방식으로 컴파일됩니다.

<!--
See the [CLI documentation](https://github.com/angular/angular-cli/wiki) for details, especially the [`build` topic](https://github.com/angular/angular-cli/wiki/build).
-->
더 자세한 내용은 [CLI 문서](https://github.com/angular/angular-cli/wiki)의 [`build` 섹션](https://github.com/angular/angular-cli/wiki/build)을 참고하세요.

</div>

{@a why-aot}

<!--
## Why compile with AOT?
-->
## 왜 AOT 컴파일 하나요?

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
*일부 비동기 요청 생략*

AOT 방식으로 컴파일된 애플리케이션 JavaScript에는 HTML 템플릿이나 CSS 스타일 시트가 모두 _인라인_ 으로 포함되어 있습니다. 결과적으로 이 파일들을 내려받기 위해 필요한 AJAX 요청을 생략할 수 있습니다.

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
그래서 클라이언트에 존재하는 HTML 문서나 JavaScript가 없기 떄문에, 인젝션 공격의 기회를 상당수 차단할 수 있습니다.

{@a compiler-options}

<!--
## Angular Compiler Options
-->
## Angular 컴파일러 옵션

<!--
You can control your app compilation by providing template compiler options in the `tsconfig.json` file along with the options supplied to the TypeScript compiler. The template compiler options are specified as members of
`"angularCompilerOptions"` object as shown below:
-->
Angular 컴파일 과정은 `tsconfig.json` 파일에 옵션을 지정하는 방식으로 조정할 수 있습니다. 이 옵션들은 TypeScript 컴파일러와 관련된 것도 있으며, Angular 컴파일러와 관련된 것도 있습니다:

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

### *enableResourceInlining*
<!--
This options tell the compiler to replace the `templateUrl` and `styleUrls` property in all `@Component` decorators with inlined contents in `template` and `styles` properties.
When enabled, the `.js` output of ngc will have no lazy-loaded `templateUrl` or `styleUrls`.
-->
이 옵션을 사용하면 `@Component` 데코레이터에 사용된 `templateUrl`과 `styleUrls`가 `template`과 `styles`로 변경됩니다.
그래서 템플릿 파일과 스타일시트 파일은 `.js` 파일로 합쳐지며, 추가 AJAX 요청은 생략됩니다.

### *skipMetadataEmit*

<!--
This option tells the compiler not to produce `.metadata.json` files.
The option is `false` by default.

`.metadata.json` files contain information needed by the template compiler from a `.ts`
file that is not included in the `.d.ts` file produced by the TypeScript compiler. This information contains,
for example, the content of annotations (such as a component's template) which TypeScript
emits to the `.js` file but not to the `.d.ts` file.

This option should be set to `true` if using TypeScript's `--outFile` option, as the metadata files
are not valid for this style of TypeScript output. It is not recommeded to use `--outFile` with
Angular. Use a bundler, such as [webpack](https://webpack.js.org/), instead.

This option can also be set to `true` when using factory summaries as the factory summaries
include a copy of the information that is in the `.metadata.json` file.
-->
이 옵션을 사용하면 `.metadata.json` 파일이 생성되는 것을 생략할 수 있으며, 기본값은 `false` 입니다.

`.metadata.json` 파일은 `.d.ts` 파일에 포함되지 않은 타입 정보를 추가로 제공하는 파일입니다.
예를 들면 컴포넌트 템플릿과 같은 어노테이션 정보는 `.js` 파일에 포함되지만 `.d.ts` 파일에는 포함되지 않는데, 이 내용은 `.metadata.json`에 포함됩니다.

이 옵션을 `true`로 지정하면 추가 메타데이터를 생성해야 하기 때문에 TypeScript 컴파일 옵션 `--outFile`과 함께 사용해야 하지만, Angular는 공식적으로 `--outFile` 옵션을 사용하는 것을 권장하지 않습니다. 이 기능이 필요하면 TypeScript 대신 [webpack](https://webpack.js.org/)과 같은 번들러를 사용하는 것을 권장합니다.

### *strictMetadataEmit*

<!--
This option tells the template compiler to report an error to the `.metadata.json`
file if `"skipMetadataEmit"` is `false` . This option is `false` by default. This should only be used when `"skipMetadataEmit"` is `false` and `"skipTemplateCodegen"` is `true`.
-->
`"skipMetadataEmit"` 옵션값이 `false`인 상태에서 이 옵션을 설정하면 템플릿을 컴파일하다가 에러가 발생했을 때 `.metadata.json`에 에러를 남길 수 있습니다. 이 옵션의 기본값은 `false`이며, `"skipMetadataEmit"` 옵션값을 `false`로 지정하려면 `"skipTemplateCodegen"` 옵션값은 `true`여야 합니다.

<!--
It is intended to validate the `.metadata.json` files emitted for bundling with an `npm` package. The validation is overly strict and can emit errors for metadata that would never produce an error when used by the template compiler. You can choose to suppress the error emitted by this option for an exported symbol by including `@dynamic` in the comment documenting the symbol.
-->
이 옵션은 `npm` 패키지를 번들링할 때 생성되는 `.metadata.json` 파일의 유효성을 검증하기 위해 도입되었습니다. 유효성 검사 결과로 발생한 에러는 메타데이터에 기록되지만 템플릿 컴파일러 자체에서 에러가 발생하지는 않습니다. 예를 들면 문서화에 주석을 사용하는 경우에 `@dynamic`과 같은 심볼을 사용할 수 있는데, 이 심볼은 템플릿 컴파일러가 알 수 없기 때문에 에러가 발생합니다. 이 때 이 옵션을 사용하면 에러가 발생하는 것을 무시할 수 있습니다.

<!--
It is valid for `.metadata.json` files to contain errors. The template compiler reports these errors
if the metadata is used to determine the contents of an annotation. The metadata
collector cannot predict the symbols that are designed to use in an annotation, so it will preemptively
include error nodes in the metadata for the exported symbols. The template compiler can then use the error
nodes to report an error if these symbols are used. If the client of a library intends to use a symbol in an annotation, the template compiler will not normally report
this until the client uses the symbol. This option allows detecting these errors during the build phase of
the library and is used, for example, in producing Angular libraries themselves.
-->
사실 `.metadata.json` 파일에 에러가 있다고 해도 문제가 되지는 않습니다. 템플릿 컴파일러는 메타데이터에서 사용하는 어떤 것에 문제가 있을 수 있다고만 알릴 뿐입니다. 템플릿 컴파일러는 미리 알고 있는 어노테이션이 아니라면 이 어노테이션이 적절하게 사용되었는지 알 수 없기 때문에 이 어노테이션이 사용된 노드에 문제가 있다고 알릴 수밖에 없습니다. 개발자는 이 에러를 보고 라이브러리를 제대로 사용했는지 점검하는 용도로 사용하면 됩니다. 간단하게 정리하면, 이 옵션은 라이브러리가 제대로 사용되었는지 빌드 단계에서 확인할 수 있는 기회를 제공하는 옵션입니다.

### *skipTemplateCodegen*

<!--
This option tells the compiler to suppress emitting `.ngfactory.js` and `.ngstyle.js` files. When set,
this turns off most of the template compiler and disables reporting template diagnostics.
This option can be used to instruct the
template compiler to produce `.metadata.json` files for distribution with an `npm` package while
avoiding the production of `.ngfactory.js` and `.ngstyle.js` files that cannot be distributed to
`npm`.
-->
이 옵션을 사용하면 `.ngfactory.js` 파일과 `.ngstyle.js` 파일을 생성하지 않도록 지정할 수 있습니다. 이 옵션이 `true`로 설정되면 템플릿 컴파일러의 기능 일부를 생략하며, 템플릿을 분석하는 단계도 생략합니다.
`npm`에 패키지를 배포할 때 `.ngfactory.js` 파일과 `.ngstyle.js` 파일은 사용할 수 없기 때문에 `.metadata.json` 파일을 대신 생성하도록 할 때 이 옵션을 사용합니다.

### *strictInjectionParameters*

<!--
When set to `true`, this options tells the compiler to report an error for a parameter supplied
whose injection type cannot be determined. When this value option is not provided or is `false`, constructor parameters of classes marked with `@Injectable` whose type cannot be resolved will
produce a warning.

*Note*: It is recommended to change this option explicitly to `true` as this option will default to `true` in the future.
-->
이 옵션이 `true`로 설정되면 의존성으로 주입되는 객체의 타입이 지정되지 않았을 때 에러를 발생시킵니다. 그리고 이 옵션이 `false`로 설정되고 `@Injectable`로 지정된 클래스 생성자에 타입이 지정되지 않은 인자가 있다면 의존성 객체를 구별할 수 없다는 경고만 표시됩니다.

*참고*: 이 옵션은 이후에 `true`가 기본값이 될 것이기 때문에 지금부터 `true`로 설정하고 사용하는 것을 권장합니다.

### *flatModuleOutFile*

<!--
When set to `true`, this option tells the template compiler to generate a flat module
index of the given file name and the corresponding flat module metadata. Use this option when creating
flat modules that are packaged similarly to `@angular/core` and `@angular/common`. When this option
is used, the `package.json` for the library should refer
to the generated flat module index instead of the library index file. With this
option only one `.metadata.json` file is produced that contains all the metadata necessary
for symbols exported from the library index. In the generated `.ngfactory.js` files, the flat
module index is used to import symbols that includes both the public API from the library index
as well as shrowded internal symbols.
-->
이 옵션이 `true`로 설정되면 템플릿이 컴파일된 결과물의 모듈 구조가 평평하게(flat) 구성됩니다. 그래서 모듈의 이름으로 인덱스 파일이 생성되며 모듈의 메타데이터도 같은 방식으로 생성됩니다. 이 옵션은 `@angular/core`나 `@angular/common`과 같이 모듈 단위로 패키징해야 하는 경우에 사용합니다.
이 옵션을 사용하는 경우에는 `package.json` 파일에서 라이브러리를 참조할 때 라이브러리의 인덱스 파일을 직접 사용할 수 없고 라이브러리 안에 있는 모듈을 참조해야 합니다. 하지만 이 옵션을 사용하더라도 라이브러리 전체에 있는 메타데이터를 제공하는 `.metadata.json` 파일은 딱 하나만 생성됩니다. 다만 개별 모듈의 인덱스는 따로 생성되기 때문에 외부로 공개된 API를 사용할 떄는 `.ngfactory.js` 파일을 활용할 수 있습니다.

<!--
By default the `.ts` file supplied in the `files` field is assumed to be library index.
If more than one `.ts` file is specified, `libraryIndex` is used to select the file to use.
If more than one `.ts` file is supplied without a `libraryIndex`, an error is produced. A flat module
index `.d.ts` and `.js` will be created with the given `flatModuleOutFile` name in the same
location as the library index `.d.ts` file. For example, if a library uses
`public_api.ts` file as the library index of the module, the `tsconfig.json` `files` field
would be `["public_api.ts"]`. The `flatModuleOutFile` options could then be set to, for
example `"index.js"`, which produces `index.d.ts` and  `index.metadata.json` files. The
library's `package.json`'s `module` field would be `"index.js"` and the `typings` field
would be `"index.d.ts"`.
-->
기본적으로 `.ts` 파일이 하나 있고 이 파일에 `files` 필드가 존재하면 이 파일을 라이브러리 인덱스로 간주할 수 있습니다.
그리고 `.ts` 파일이 두개 이상 있으며 어느 한 파일에 `libraryIndex` 필드가 존재하면 이 파일을 라이브러리 인덱스로 간주합니다.
그런데 `.ts` 파일이 두개 이상 있는데 `libraryIndex` 필드가 존재하지 않으면 에러가 발생합니다.
만약 플랫 모듈이라면 인덱스 파일인 `.d.ts`와 `.js` 파일은 `flatmoduleOutFile`에 지정된 이름으로 생성됩니다. 예를 들어 라이브러리에 `public_api.ts` 파일이 존재하면 이 파일이 라이브러리의 인덱스 파일이며, `tsconfig.json`의 `files` 필드는 `["public_api.ts"]`와 같이 지정될 것입니다. 만약 `flatModuleOutFile` 옵션의 값이 `"index.js"`로 지정되었다면 이 라이브러리가 빌드되면 `index.d.ts` 파일과 `index.metadata.json` 파일이 생성됩니다. 그러면 이 라이브러리의 `package.json` 파일 중 `module` 필드는 `"index.js"`가 될것이며 `typings` 필드는 `"index.d.ts"`가 될 것입니다.

### *flatModuleId*

<!--
This option specifies the preferred module id to use for importing a flat module.
References generated by the template compiler will use this module name when importing symbols
from the flat module.
This is only meaningful when `flatModuleOutFile` is also supplied. Otherwise the compiler ignores
this option.
-->
모듈을 플랫하게 생성할 때, 이 모듈을 ID로 참조하려고 할 때 지정합니다.
이 옵션을 사용하면 템플릿 컴파일러가 플랫 모듈에서 심볼을 가져올 떄 모듈의 이름을 직접 사용합니다. 이 옵션은 `flatModuleOutFile`과 함께 사용해야 동작하며, 이 옵션을 함께 사용하지 않으면 동작하지 않습니다.

### *generateCodeForLibraries*

<!--
This option tells the template compiler to generate factory files (`.ngfactory.js` and `.ngstyle.js`)
for `.d.ts` files with a corresponding `.metadata.json` file. This option defaults to
`true`. When this option is `false`, factory files are generated only for `.ts` files.
-->
이 옵션을 설정하면 `.metadata.json`에 해당하는 `.d.ts`과 연관된 `.ngfactory.js`, `.ngstyle.js` 파일과 같은 팩토리 파일을 생성합니다. 이 옵션의 기본값은 `true`이며, 이 옵션의 값을 `false`로 설정하면 `.ts` 파일로 된 팩토리 파일만 생성됩니다.

<!--
This option should be set to `false` when using factory summaries.
-->
팩토리 요약을 사용한다면 반드시 `false`로 지정해야 합니다.

### *fullTemplateTypeCheck*

<!--
This option tells the compiler to enable the [binding expression validation](#binding-expression-validation)
phase of the template compiler which uses TypeScript to validate binding expressions.

This option is `false` by default.

*Note*: It is recommended to set this to `true` as this option will default to `true` in the future.
-->
이 옵션을 사용하면 템플릿 컴파일러가 템플릿을 처리할 때 [바인딩 표현식에 적용되는 유효성 검사](#binding-expression-validation)를 활성화할 수 있습니다.

이 옵션의 기본값은 `false`입니다.

*참고*: 이 옵션은 이후에 `true`가 기본값이 될 것이기 때문에 지금부터 `true`로 설정하고 사용하는 것을 권장합니다.

### *annotateForClosureCompiler*

<!--
This option tells the compiler to use [Tsickle](https://github.com/angular/tsickle) to annotate the emitted
JavaScript with [JsDoc](http://usejsdoc.org/) comments needed by the
[Closure Compiler](https://github.com/google/closure-compiler). This option defaults to `false`.
-->
[JsDoc](http://usejsdoc.org/)은 주석을 사용해서 문서를 생성하기 때문에 [Closure Compiler](https://github.com/google/closure-compiler)가 필요합니다. 이 옵션을 사용하면 Angular 애플리케이션 코드에 [Tsickle](https://github.com/angular/tsickle)를 적용할 수 있기 때문에 Closure Compiler를 사용할 수 있습니다.
기본값은 `false` 입니다.

### *annotationsAs*

<!--
Use this option to modify how the Angular specific annotations are emitted to improve tree-shaking. Non-Angular
annotations and decorators are unaffected. Default is `static fields`.
-->
이 옵션을 사용하면 특정 어노테이션이 트리 셰이킹 대상이 되도록 지정할 수 있습니다.
다만만 이 옵션을 지정해도 Angular가 제공하지 않는 데코레이터는 영향을 받지 않습니다.
기본값은 `static fields` 입니다.

<!--
value           | description
----------------|-------------------------------------------------------------
`decorators`    | Leave the Decorators in-place. This makes compilation faster. TypeScript will emit calls to the __decorate helper.  Use `--emitDecoratorMetadata` for runtime reflection.  However, the resulting code will not properly tree-shake.
`static fields` | Replace decorators with a static field in the class. Allows advanced tree-shakers like [Closure Compiler](https://github.com/google/closure-compiler) to remove unused classes.
-->
값           | 설명
----------------|-------------------------------------------------------------
`decorators`    | 데코레이터를 그대로 놔두고 __decorate 헬퍼를 사용해서 처리합니다. 이렇게 설정하면 컴파일 시간도 단축됩니다. 애플리케이션이 실행되는 시점에 이 데코레이터를 확인하려면  `--emitDecoratorMetadata` 옵션을 사용하면 됩니다. 사용하지 않는 데코레이터라도 트리 셰이킹되지 않습니다.
`static fields` | 데코레이터를 클래스의 static 필드로 변환합니다. 그러면 [Closure Compiler](https://github.com/google/closure-compiler)와 같은 트리 셰이킹 툴이 동작할 수 있으며, 사용하지 않는 클래스 멤버를 최종 결과물에서 제거할 수 있습니다.

### *trace*

<!--
This tells the compiler to print extra information while compiling templates.
-->
이 옵션을 사용하면 템플릿을 컴파일하면서 출력하는 로그가 좀 더 자세해 집니다.

### *disableExpressionLowering*

<!--
The Angular template compiler transforms code that is used, or could be used, in an annotation
to allow it to be imported from template factory modules. See
[metadata rewriting](#metadata-rewriting) for more information.

Setting this option to `false` disables this rewriting, requiring the rewriting to be
done manually.
-->
Angular 템플릿 컴파일러는 어노테이션에 있는 코드 중 이미 사용된 코드나, 앞으로 사용될 수 있는 코드를 템플릿 팩토리 모듈에 처리하기 위해 변환합니다. 자세한 내용은 [메타데이터 재작성](#metadata-rewriting) 부분을 참고하세요.

이 옵션을 `false`로 설정하면 이 동작을 하지 않습니다. 수동으로 이 동작을 해야 할 때 설정하세요.

### *preserveWhitespaces*

<!--
This option tells the compiler whether to remove blank text nodes from compiled templates.
As of v6, this option is `false` by default, which results in smaller emitted template factory modules.
-->
이 옵션을 설정하면 컴파일된 템플릿에서 빈 텍스트 노드를 제거합니다. 이 옵션은 Angular v6 버전부터 `false`가 기본값이며, 이 옵션의 값을 `true`로 설정하면 템플릿 팩토리 모듈의 크기를 좀 더 작게 만들 수 있습니다.

### *allowEmptyCodegenFiles*

<!--
Tells the compiler to generate all the possible generated files even if they are empty. This option is
`false` by default. This is an option used by `bazel` build rules and is needed to simplify
how `bazel` rules track file dependencies. It is not recommended to use this option outside of the `bazel`
rules.
-->
이 옵션을 사용하면 내용이 없는 파일도 컴파일 대상으로 포함할지 지정할 수 있으며, 기본값은 `false`입니다.
이 옵션은 `bazel`로 빌드할 때 파일의 의존성 관계를 단순하게 만들기 위해 사용합니다. `bazel`로 빌드하지 않는 경우에는 사용하지 않는 것을 권장합니다.

### *enableIvy*

<!--
Tells the compiler to generate definitions using the Render3 style code generation. This option defaults to `false`.

Not all features are supported with this option enabled. It is only supported
for experimentation and testing of Render3 style code generation.

*Note*: Is it not recommended to use this option as it is not yet feature complete with the Render2 code generation.
-->
코드를 Render3 스타일로 컴파일할 때 사용하며, 기본값은 `false` 입니다.

아직까지는 이 옵션을 활성화해도 모든 기능을 커버하지 않습니다. Render3 스타일로 컴파일하는 것은 아직 실험중인 기능입니다.

*참고*: Render3 스타일로 컴파일하는 것은 아직 Render2 스타일을 완전히 대체할 수 있는 정도는 아닙니다. 아직은 사용하지 않는 것을 권장합니다.


<!--
## Angular Metadata and AOT
-->
## Angular 메타데이터와 AOT

<!--
The Angular **AOT compiler** extracts and interprets **metadata** about the parts of the application that Angular is supposed to manage.
-->
Angular **AOT 컴파일러**는 Angular 애플리케이션에서 관리해야 하는 **메타데이터**를 따로 추출해서 변환합니다.

<!--
Angular metadata tells Angular how to construct instances of your application classes and interact with them at runtime.
-->
Angular의 메타데이터는 이 클래스를 어떻게 생성하는지, 실행 시점에는 이 클래스가 어떻게 동작해야 하는지 지정하는 정보입니다.

<!--
You specify the metadata with **decorators** such as `@Component()` and `@Input()`.
You also specify metadata implicitly in the constructor declarations of these decorated classes.
-->
메타데이터는 `@Component()`나 `@Input()`과 같이 **데코레이터**를 사용해서 지정할 수 있습니다.
그리고 클래스의 생성자에도 메타데이터를 지정할 수 있습니다.

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

<!--
Syntax                             | Example
-----------------------------------|-----------------------------------
Literal object                     | `{cherry: true, apple: true, mincemeat: false}`
Literal array                      | `['cherries', 'flour', 'sugar']`
Spread in literal array            | `['apples', 'flour', ...the_rest]`
Calls                              | `bake(ingredients)`
New                                | `new Oven()`
Property access                    | `pie.slice`
Array index                        | `ingredients[0]`
Identifier reference               | `Component`
A template string                  | <code>&#96;pie is ${multiplier} times better than cake&#96;</code>
Literal string                     | `'pi'`
Literal number                     | `3.14153265`
Literal boolean                    | `true`
Literal null                       | `null`
Supported prefix operator          | `!cake`
Supported Binary operator          | `a + b`
Conditional operator               | `a ? b : c`
Parentheses                        | `(a + b)`
-->
문법                               | 예제
-----------------------------------|-----------------------------------
객체 리터럴                     | `{cherry: true, apple: true, mincemeat: false}`
배열 리터럴                      | `['cherries', 'flour', 'sugar']`
배열의 전개연산자            | `['apples', 'flour', ...the_rest]`
함수 실행                              | `bake(ingredients)`
new 키워드                                | `new Oven()`
프로퍼티 참조                    | `pie.slice`
배열의 인덱스 참조                        | `ingredients[0]`
심볼 참조               | `Component`
템플릿 문자열                  | <code>&#96;pie is ${multiplier} times better than cake&#96;</code>
문자열 리터럴                     | `'pi'`
숫자 리터럴                     | `3.14153265`
불리언 리터럴                    | `true`
null 리터럴                       | `null`
접두사로 사용하는 연산자          | `!cake`
이진 연산자          | `a + b`
삼항연산자               | `a ? b : c`
괄호                        | `(a + b)`

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

이 과정을 _폴딩_ 이라고 합니다. 그리고 이 과정이 적용될 수 있는 코드를 _폴딩할 수 있는(foldable)_ 코드라고 합니다.

{@a var-declaration}
The collector can evaluate references to
module-local `const` declarations and initialized `var` and `let` declarations, effectively removing them from the `.metadata.json` file.

Consider the following component definition:

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

The compiler could not refer to the `template` constant because it isn't exported.

But the _collector_ can _fold_ the `template` constant into the metadata definition by inlining its contents.
The effect is the same as if you had written:

```typescript
@Component({
  selector: 'app-hero',
  template: '<div>{{hero.name}}</div>'
})
export class HeroComponent {
  @Input() hero: Hero;
}
```

There is no longer a reference to `template` and, therefore, nothing to trouble the compiler when it later interprets the _collector's_ output in `.metadata.json`.

You can take this example a step further by including the `template` constant in another expression:

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

The _collector_ reduces this expression to its equivalent _folded_ string:

`'<div>{{hero.name}}</div><div>{{hero.title}}</div>'`.

#### Foldable syntax

The following table describes which expressions the _collector_ can and cannot fold:

Syntax                             | Foldable
-----------------------------------|-----------------------------------
Literal object                     | yes
Literal array                      | yes
Spread in literal array            | no
Calls                              | no
New                                | no
Property access                    | yes, if target is foldable
Array index                        | yes, if target and index are foldable
Identifier reference               | yes, if it is a reference to a local
A template with no substitutions   | yes
A template with substitutions      | yes, if the substitutions are foldable
Literal string                     | yes
Literal number                     | yes
Literal boolean                    | yes
Literal null                       | yes
Supported prefix operator          | yes, if operand is foldable
Supported binary operator          | yes, if both left and right are foldable
Conditional operator               | yes, if condition is foldable
Parentheses                        | yes, if the expression is foldable

If an expression is not foldable, the collector writes it to `.metadata.json` as an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) for the compiler to resolve.


## Phase 2: code generation

The _collector_ makes no attempt to understand the metadata that it collects and outputs to `.metadata.json`. It represents the metadata as best it can and records errors when it detects a metadata syntax violation.

It's the compiler's job to interpret the `.metadata.json` in the code generation phase.

The compiler understands all syntax forms that the _collector_ supports, but it may reject _syntactically_ correct metadata if the _semantics_ violate compiler rules.

The compiler can only reference _exported symbols_.

Decorated component class members must be public. You cannot make an `@Input()` property private or internal.

Data bound properties must also be public.

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

{@a supported-functions}
Most importantly, the compiler only generates code to create instances of certain classes, support certain decorators, and call certain functions from the following lists.


### New instances

The compiler only allows metadata that create instances of the class `InjectionToken` from `@angular/core`.

### Annotations/Decorators

The compiler only supports metadata for these Angular decorators.

Decorator         | Module
------------------|--------------
`Attribute`       | `@angular/core`
`Component`       | `@angular/core`
`ContentChild`    | `@angular/core`
`ContentChildren` | `@angular/core`
`Directive`       | `@angular/core`
`Host`            | `@angular/core`
`HostBinding`     | `@angular/core`
`HostListener`    | `@angular/core`
`Inject`          | `@angular/core`
`Injectable`      | `@angular/core`
`Input`           | `@angular/core`
`NgModule`        | `@angular/core`
`Optional`        | `@angular/core`
`Output`          | `@angular/core`
`Pipe`            | `@angular/core`
`Self`            | `@angular/core`
`SkipSelf`        | `@angular/core`
`ViewChild`       | `@angular/core`


### Macro-functions and macro-static methods

The compiler also supports _macros_ in the form of functions or static
methods that return an expression.

For example, consider the following function:

```typescript
export function wrapInArray<T>(value: T): T[] {
  return [value];
}
```

You can call the `wrapInArray` in a metadata definition because it returns the value of an expression that conforms to the compiler's restrictive JavaScript subset.

You might use  `wrapInArray()` like this:

```typescript
@NgModule({
  declarations: wrapInArray(TypicalComponent)
})
export class TypicalModule {}
```

The compiler treats this usage as if you had written:

```typescript
@NgModule({
  declarations: [TypicalComponent]
})
export class TypicalModule {}
```

The collector is simplistic in its determination of what qualifies as a macro
function; it can only contain a single `return` statement.

The Angular [`RouterModule`](api/router/RouterModule) exports two macro static methods, `forRoot` and `forChild`, to help declare root and child routes.
Review the [source code](https://github.com/angular/angular/blob/master/packages/router/src/router_module.ts#L139 "RouterModule.forRoot source code")
for these methods to see how macros can simplify configuration of complex [NgModules](guide/ngmodules).

{@a metadata-rewriting}

### Metadata rewriting

The compiler treats object literals containing the fields `useClass`, `useValue`, `useFactory`, and `data` specially. The compiler converts the expression initializing one of these fields into an exported variable, which replaces the expression. This process of rewriting these expressions removes all the restrictions on what can be in them because
the compiler doesn't need to know the expression's value&mdash;it just needs to be able to generate a reference to the value.



You might write something like:

```typescript
class TypicalServer {

}

@NgModule({
  providers: [{provide: SERVER, useFactory: () => TypicalServer}]
})
export class TypicalModule {}
```

Without rewriting, this would be invalid because lambdas are not supported and `TypicalServer` is not exported.

To allow this, the compiler automatically rewrites this to something like:

```typescript
class TypicalServer {

}

export const ɵ0 = () => new TypicalServer();

@NgModule({
  providers: [{provide: SERVER, useFactory: ɵ0}]
})
export class TypicalModule {}
```

This allows the compiler to generate a reference to `ɵ0` in the
factory without having to know what the value of `ɵ0` contains.

The compiler does the rewriting during the emit of the `.js` file. This doesn't rewrite the `.d.ts` file, however, so TypeScript doesn't recognize it as being an export. Thus, it does not pollute the ES module's exported API.


## Metadata Errors

The following are metadata errors you may encounter, with explanations and suggested corrections.

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

The compiler encountered an expression it didn't understand while evaluating Angular metadata.

Language features outside of the compiler's [restricted expression syntax](#expression-syntax)
can produce this error, as seen in the following example:

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

You can use `typeof` and bracket notation in normal application code.
You just can't use those features within expressions that define Angular metadata.

Avoid this error by sticking to the compiler's [restricted expression syntax](#expression-syntax)
when writing Angular metadata
and be wary of new or unusual TypeScript features.

<hr>

{@a reference-to-a-local-symbol}
<h3 class="no-toc">Reference to a local (non-exported) symbol</h3>

<div class="alert is-helpful">

_Reference to a local (non-exported) symbol 'symbol name'. Consider exporting the symbol._

</div>

The compiler encountered a referenced to a locally defined symbol that either wasn't exported or wasn't initialized.

Here's a `provider` example of the problem.

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
The compiler generates the component factory, which includes the `useValue` provider code, in a separate module. _That_ factory module can't reach back to _this_ source module to access the local (non-exported) `foo` variable.

You could fix the problem by initializing `foo`.

```
let foo = 42; // initialized
```

The compiler will [fold](#folding) the expression into the provider as if you had written this.

```
  providers: [
    { provide: Foo, useValue: 42 }
  ]
```

Alternatively, you can fix it by exporting `foo` with the expectation that `foo` will be assigned at runtime when you actually know its value.

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

Adding `export` often works for variables referenced in metadata such as `providers` and `animations` because the compiler can generate _references_ to the exported variables in these expressions. It doesn't need the _values_ of those variables.

Adding `export` doesn't work when the compiler needs the _actual value_
in order to generate code.
For example, it doesn't work for the `template` property.

```
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

<hr>

{@a only-initialized-variables}
<h3 class="no-toc">Only initialized variables and constants</h3>

<div class="alert is-helpful">

_Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler._

</div>

The compiler found a reference to an exported variable or static field that wasn't initialized.
It needs the value of that variable to generate code.

The following example tries to set the component's `template` property to the value of
the exported `someTemplate` variable which is declared but _unassigned_.

```
// ERROR
export let someTemplate: string;

@Component({
  selector: 'my-component',
  template: someTemplate
})
export class MyComponent {}
```

You'd also get this error if you imported `someTemplate` from some other module and neglected to initialize it there.

```
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

```
// CORRECTED
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

Metadata referenced a class that wasn't exported.

For example, you may have defined a class and used it as an injection token in a providers array
but neglected to export that class.

```
// ERROR
abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```

Angular generates a class factory in a separate module and that
factory [can only access exported classes](#exported-symbols).
To correct this error, export the referenced class.

```
// CORRECTED
export abstract class MyStrategy { }

  ...
  providers: [
    { provide: MyStrategy, useValue: ... }
  ]
  ...
```
<hr>

<h3 class="no-toc">Reference to a non-exported function</h3>

Metadata referenced a function that wasn't exported.

For example, you may have set a providers `useFactory` property to a locally defined function that you neglected to export.

```
// ERROR
function myStrategy() { ... }

  ...
  providers: [
    { provide: MyStrategy, useFactory: myStrategy }
  ]
  ...
```

Angular generates a class factory in a separate module and that
factory [can only access exported functions](#exported-symbols).
To correct this error, export the function.

```
// CORRECTED
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

The compiler does not currently support [function expressions or lambda functions](#function-expression).
For example, you cannot set a provider's `useFactory` to an anonymous function or arrow function like this.

```
// ERROR
  ...
  providers: [
    { provide: MyStrategy, useFactory: function() { ... } },
    { provide: OtherStrategy, useFactory: () => { ... } }
  ]
  ...
```
You also get this error if you call a function or method in a provider's `useValue`.
```
// ERROR
import { calculateValue } from './utilities';

  ...
  providers: [
    { provide: SomeValue, useValue: calculateValue() }
  ]
  ...
```

To correct this error, export a function from the module and refer to the function in a `useFactory` provider instead.

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

<hr>

{@a destructured-variable-not-supported}
<h3 class="no-toc">Destructured variable or constant not supported</h3>

<div class="alert is-helpful">

_Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring._

</div>

The compiler does not support references to variables assigned by [destructuring](https://www.typescriptlang.org/docs/handbook/variable-declarations.html#destructuring).

For example, you cannot write something like this:

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

To correct this error, refer to non-destructured values.

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

<hr>

<h3 class="no-toc">Could not resolve type</h3>

The compiler encountered a type and can't determine which module exports that type.

This can happen if you refer to an ambient type.
For example, the `Window` type is an ambient type declared in the global `.d.ts` file.

You'll get an error if you reference it in the component constructor,
which the compiler must statically analyze.

```
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

<code-example linenums="false">
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
</code-example>

The `Window` type in the constructor is no longer a problem for the compiler because it
uses the `@Inject(WINDOW)` to generate the injection code.

Angular does something similar with the `DOCUMENT` token so you can inject the browser's `document` object (or an abstraction of it, depending upon the platform in which the application runs).

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

The compiler expected a name in an expression it was evaluating.
This can happen if you use a number as a property name as in the following example.

```
// ERROR
provider: [{ provide: Foo, useValue: { 0: 'test' } }]
```

Change the name of the property to something non-numeric.

```
// CORRECTED
provider: [{ provide: Foo, useValue: { '0': 'test' } }]
```

<hr>

<h3 class="no-toc">Unsupported enum member name</h3>

Angular couldn't determine the value of the [enum member](https://www.typescriptlang.org/docs/handbook/enums.html)
that you referenced in metadata.

The compiler can understand simple enum values but not complex values such as those derived from computed properties.

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

Avoid referring to enums with complicated initializers or computed properties.

<hr>

{@a tagged-template-expressions-not-supported}
<h3 class="no-toc">Tagged template expressions are not supported</h3>

<div class="alert is-helpful">

_Tagged template expressions are not supported in metadata._

</div>

The compiler encountered a JavaScript ES2015 [tagged template expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals) such as,
```
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

<h3 class="no-toc">Symbol reference expected</h3>

The compiler expected a reference to a symbol at the location specified in the error message.

This error can occur if you use an expression in the `extends` clause of a class.

<!--

Chuck: After reviewing your PR comment I'm still at a loss. See [comment there](https://github.com/angular/angular/pull/17712#discussion_r132025495).

-->
{@a binding-expression-validation}

  ## Phase 3: binding expression validation

  In the validation phase, the Angular template compiler uses the TypeScript compiler to validate the
  binding expressions in templates. Enable this phase explicitly by adding the compiler
  option `"fullTemplateTypeCheck"` in the `"angularCompilerOptions"` of the project's `tsconfig.json` (see
  [Angular Compiler Options](#compiler-options)).

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

  This will produce the following error:

  ```
  my.component.ts.MyComponent.html(1,1): : Property 'addresss' does not exist on type 'Person'. Did you mean 'address'?
  ```

  The file name reported in the error message, `my.component.ts.MyComponent.html`, is a synthetic file
  generated by the template compiler that holds contents of the `MyComponent` class template.
  Compiler never writes this file to disk. The line and column numbers are relative to the template string
  in the `@Component` annotation of the class, `MyComponent` in this case. If a component uses
  `templateUrl` instead of `template`, the errors are reported in the HTML file referenced by the
  `templateUrl` instead of a synthetic file.

  The error location is the beginning of the text node that contains the interpolation expression with
  the error. If the error is in an attribute binding such as `[value]="person.address.street"`, the error
  location is the location of the attribute that contains the error.

  The validation uses the TypeScript type checker and the options supplied to the TypeScript compiler to control
  how detailed the type validation is. For example, if the `strictTypeChecks` is specified, the error  ```my.component.ts.MyComponent.html(1,1): : Object is possibly 'undefined'``` is reported as well as the above error message.

  ### Type narrowing

  The expression used in an `ngIf` directive is used to narrow type unions in the Angular
  template compiler, the same way the `if` expression does in TypeScript. For example, to avoid
  `Object is possibly 'undefined'` error in the template above, modify it to only emit the
  interpolation if the value of `person` is initialized as shown below:

  ```typescript
  @Component({
    selector: 'my-component',
    template: '<span *ngIf="person"> {{person.addresss.street}} </span>'
  })
  class MyComponent {
    person?: Person;
  }
  ```

  Using `*ngIf` allows the TypeScript compiler to infer that the `person` used in the
  binding expression will never be `undefined`.

  #### Custom `ngIf` like directives

  Directives that behave like `*ngIf` can declare that they want the same treatment by including
  a static member marker that is a signal to the template compiler to treat them
  like `*ngIf`. This static member for `*ngIf` is:

  ```typescript
    public static ngIfUseIfTypeGuard: void;
  ```

  This declares that the input property `ngIf` of the `NgIf` directive should be treated as a
  guard to the use of its template, implying that the template will only be instantiated if
  the `ngIf` input property is true.


  ### Non-null type assertion operator

  Use the [non-null type assertion operator](guide/template-syntax#non-null-assertion-operator)
  to suppress the `Object is possibly 'undefined'` error when it is incovienent to use
  `*ngIf` or when some constraint in the component ensures that the expression is always
  non-null when the binding expression is interpolated.

  In the following example, the `person` and `address` properties are always set together,
  implying that `address` is always non-null if `person` is non-null. There is no convenient
  way to describe this constraint to TypeScript and the template compiler, but the error
  is suppressed in the example by using `address!.street`.

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

  The non-null assertion operator should be used sparingly as refactoring of the component
  might break this constraint.

  In this example it is recommended to include the checking of `address`
  in the `*ngIf`as shown below:

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

  ### Disabling type checking using `$any()`

  Disable checking of a binding expression by surrounding the expression
  in a call to the [`$any()` cast pseudo-function](guide/template-syntax).
  The compiler treats it as a cast to the `any` type just like in TypeScript when a `<any>`
  or `as any` cast is used.

  In the following example, the error `Property addresss does not exist` is suppressed
  by casting `person` to the `any` type.

  ```typescript
  @Component({
    selector: 'my-component',
    template: '{{$any(person).addresss.street}}'
  })
  class MyComponent {
    person?: Person;
  }
  ```
## Summary

* What the AOT compiler does and why it is important.
* Why metadata must be written in a subset of JavaScript.
* What that subset is.
* Other restrictions on metadata definition.
* Macro-functions and macro-static methods.
* Compiler errors related to metadata.
* Validation of binding expressions
