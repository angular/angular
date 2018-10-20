<!--
# Npm Packages
-->
# Npm 패키지

<!--
 The [**Angular CLI**](https://cli.angular.io/), Angular applications, and Angular itself depend upon features and functionality provided by libraries that are available as [**npm**](https://docs.npmjs.com/) packages.
-->
[**Angular CLI**](https://cli.angular.io/)와 Angular 애플리케이션, Angular 프레임워크 그 자체도 [**npm**](https://docs.npmjs.com/) 패키지를 사용합니다.

<!--
You can download and install these npm packages with the [**npm client**](https://docs.npmjs.com/cli/install), which runs as a Node.js® application.
-->
이렇게 사용하는 npm 패키지는 일반적인 Node.js® 애플리케이션을 실행하는 것처럼 [**npm 클라이언트**](https://docs.npmjs.com/cli/install)를 사용해서 다운받고 설치할 수 있습니다.

<!--
The [**yarn client**](https://yarnpkg.com/en/) is a popular alternative for downloading and installing npm packages.
The Angular CLI uses `yarn` by default to install npm packages when you create a new project.
-->
[**yarn 클라이언트**](https://yarnpkg.com/en/)는 npm 패키지 매니저를 대체하는 툴로 많이 사용됩니다.
Angular CLI도 기본 패키지 매니저로 `yarn`을 사용합니다.

<div class="alert is-helpful">

<!--
Node.js and npm are essential to Angular development.

[Get them now](https://docs.npmjs.com/getting-started/installing-node "Installing Node.js and updating npm")
if they're not already installed on your machine.

**Verify that you are running Node.js `v8.x` or higher and npm `5.x` or higher**
by running the commands `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.

Consider using [nvm](https://github.com/creationix/nvm) for managing multiple
versions of Node.js and npm. You may need [nvm](https://github.com/creationix/nvm) if
you already have projects running on your machine that use other versions of Node.js and npm.
-->
Angular 애플리케이션을 개발하려면 Node.js와 npm이 꼭 필요합니다.

아직 PC에 설치되어 있지 않다면 [지금 설치](https://docs.npmjs.com/getting-started/installing-node "Installing Node.js and updating npm")하세요.

그리고 터미널이나 콘솔창에서 `node -v`, `npm -v` 명령을 실행했을 때 **Node.js 버전은 `v8.x`이상, npm 버전은 `5.x` 이상**이어야 합니다. 이전 버전에서는 에러가 발생할 수 있습니다.

Node.js와 npm을 여러 버전으로 관리해야 한다면 [nvm](https://github.com/creationix/nvm)을 사용해보는 것도 좋습니다. [nvm](https://github.com/creationix/nvm)은 현재 PC에 설치된 Node.js와 npm과는 다른 버전을 사용하는 프로젝트를 실행할 때도 사용할 수 있습니다.

</div>

## _package.json_

<!--
Both `npm` and `yarn` install packages that are identified in a [**package.json**](https://docs.npmjs.com/files/package.json) file.

The CLI `ng new` command creates a default `package.json` file for your project.
This `package.json` specifies _a starter set of packages_ that work well together and 
jointly support many common application scenarios.

You will add packages to `package.json` as your application evolves.
You may even remove some.

This guide focuses on the most important packages in the starter set.
-->
`npm`과 `yarn`으로 설치한 패키지는 모두 [**package.json**](https://docs.npmjs.com/files/package.json) 파일에 추가됩니다.

그리고 Angular CLI로 `ng new` 명령을 실행해서 프로젝트를 새로 만들 때도 기본 `package.json` 파일이 생성됩니다. 이 때 만들어지는 `package.json` 파일은 애플리케이션에 기본적으로 필요한 기능을 담은 _스타터 셋_ 이라고도 볼 수 있습니다.

애플리케이션이 점차 확장되면 `package.json`에 새로운 패키지를 추가하게 될 것입니다.
물론 사용하지 않는 패키지는 제거할 수도 있습니다.

이 문서에서는 스타터 셋에 포함된 패키지 중 중요한 것에 대해 소개합니다.

<!--
#### *dependencies* and *devDependencies*
-->
#### *dependencies*와 *devDependencies*

<!--
The `package.json` includes two sets of packages,
[dependencies](guide/npm-packages#dependencies) and [devDependencies](guide/npm-packages#dev-dependencies).

The *dependencies* are essential to *running* the application.
The *devDependencies* are only necessary to *develop* the application.
-->
`package.json`에서 관리하는 패키지들은 [dependencies](guide/npm-packages#dependencies)와 [devDependencies](guide/npm-packages#dev-dependencies)로 나뉘어 집니다.

*dependencies*에 추가된 패키지는 애플리케이션을 *실행할 때* 필요합니다.
그리고 *devDependencies*에 추가된 패키지는 애플리케이션을 *개발할 때만* 필요합니다.

{@a dependencies}

## *Dependencies*

<!--
The `dependencies` section of `package.json` contains:

* **Angular packages**: Angular core and optional modules; their package names begin `@angular/`.

* **Support packages**: 3rd party libraries that must be present for Angular apps to run.

* **Polyfill packages**: Polyfills plug gaps in a browser's JavaScript implementation.
-->
`dependencies`에는 다음과 같은 패키지가 해당됩니다:

* **Angular 패키지**:  Angular 코어 모듈과 옵션 모듈이 해당됩니다. 모듈의 이름은 모두 `@angular/`로 시작합니다.

* **지원 패키지**: Angular가 실행될 때 필요한 서드파티 라이브러리가 해당됩니다.

* **폴리필 패키지**: 브라우저에서 최신 JavaScript 표준을 지원하지 않는 경우에 사용하는 라이브러리가 해당됩니다.

<!--
### Angular Packages
-->
### Angular 패키지

<!--
**@angular/animations**: Angular's animations library makes it easy to define and apply animation effects such as page and list transitions.
Read about it in the [Animations guide](guide/animations).
-->
**@angular/animation**: 페이지 전환이나 리스트에 사용되는 애니메이션 기능을 제공하는 라이브러리입니다.
자세한 내용은 [애니메이션 문서](guide/animations)를 참고하세요.

<!--
**@angular/common**: The commonly needed services, pipes, and directives provided by the Angular team.
The [`HttpClientModule`](guide/http) is also here, in the '@angular/common/http' subfolder.
-->
**@angular/common**: 서비스나 파이프, 디렉티브를 사용하기 위해 필요한 라이브러리입니다. [`HttpClientModule`](guide/http)도 이 모듈에 포함되며, 코드는 `@angular/common/http` 폴더에 있습니다.

<!--
**@angular/core**: Critical runtime parts of the framework needed by every application.
Includes all metadata decorators, `Component`, `Directive`,  dependency injection, and the component lifecycle hooks.
-->
**@angular/core**: Angular 애플리케이션이 실행될 때 꼭 필요한 라이브러리입니다. `Component`, `Directive`와 같은 메타데이터 데코레이터, 의존성 주입, 컴포넌트 라이프싸이클 후킹 시스템이 포함되어 있습니다.

<!--
**@angular/compiler**: Angular's *Template Compiler*.
It understands templates and can convert them to code that makes the application run and render.
Typically you don’t interact with the compiler directly; rather, you use it indirectly via `platform-browser-dynamic` when [JIT compiling](guide/aot-compiler) in the browser.
-->
**@angular/compiler**: Angular *템플릿 컴파일러*입니다.
템플릿 컴파일러는 템플릿을 분석해서 애플리케이션이 동작할 때 화면에 렌더링할 수 있는 코드 형태로 변경합니다.
일반적으로 이 컴파일러를 직접 다루는 일은 없지만, 브라우저에서 [JIT 컴파일 할 때](guide/aot-compiler) `platform-browser-dynamic` 라이브러리를 사용하게 되는데 이 라이브러리가 템플릿 컴파일러를 사용합니다.

<!--
**@angular/forms**: support for both [template-driven](guide/forms) and [reactive forms](guide/reactive-forms).
-->
**@angular/forms**: [템플릿 기반 폼](guide/forms)과 [반응형 폼](guide/reactive-forms)을 제공하는 라이브러리입니다.

<!--
**@angular/http**: Angular's old, deprecated, HTTP client.
-->
**@angular/http**: Angular HTTP 클라이언트 기능을 제공하는 라이브러리입니다. 이 라이브러리는 지원이 중단되었습니다.

<!--
**@angular/platform-browser**: Everything DOM and browser related, especially
the pieces that help render into the DOM.
This package also includes the `bootstrapModuleFactory()` method
for bootstrapping applications for production builds that pre-compile with [AOT](guide/aot-compiler).
-->
**@angular/platform-browser**: DOM과 브라우저에 관련된 기능을 제공하는 라이브러리이며 이 라이브러리를 통해 DOM에 렌더링하는 기능을 사용할 수 있습니다.
[AOT 컴파일러](guide/aot-compiler)로 애플리케이션을 부트스트랩하는 `bootstrapModuleFactory()` 메소드도 이 패키지에 있습니다.

<!--
**@angular/platform-browser-dynamic**: Includes [Providers](api/core/Provider)
and methods to compile and run the app on the client 
using the [JIT compiler](guide/aot-compiler).
-->
**@angular/platform-browser-dynamic**: [프로바이더](api/core/Provider)와 [JIT 컴파일러](guide/aot-compiler)를 제공하는 라이브러리입니다. JIT 컴일러는 TypeScript 코드를 클라이언트에서 직접 JavaScript 코드로 컴파일할 때 사용합니다.

<!--
**@angular/router**: The [router module](/guide/router) navigates among your app pages when the browser URL changes.
-->
**@angular/router**: 브라우저 URL이 변경될 때마다 페이지를 전환하는 [라우터 모듈](/guide/router)을 제공하는 라이브러리입니다.

<!--
**@angular/upgrade**: Set of utilities for upgrading AngularJS applications to Angular.
-->
**@angular/upgrade**: AngularJS 애플리케이션을 Angular로 업그레이드할 때 사용할 수 있는 기능을 제공하는 라이브러리입니다.

{@a polyfills}

<!--
### Polyfill packages
-->
### 폴리필 패키지

<!--
Many browsers lack native support for some features in the latest HTML standards,
features that Angular requires.
"[Polyfills](https://en.wikipedia.org/wiki/Polyfill)" can emulate the missing features.
The [Browser Support](guide/browser-support) guide explains which browsers need polyfills and 
how you can add them.
-->
Angular가 사용하는 최신 HTML 표준을 모든 브라우저가 네이티브로 지원하는 것은 아닙니다.
그래서 이 기능들을 사용하기 위해 "[폴리필(Polyfills)](https://en.wikipedia.org/wiki/Polyfill)"을 사용합니다.
브라우저에 따라 어떤 폴리필이 필요한지 확인하려면 [브라우저 지원](guide/browser-support) 문서를 확인하세요.

<!--
The default `package.json` installs the **[core-js](https://github.com/zloirock/core-js)** package
which polyfills missing features for several popular browser.
-->
기본 폴리필인 **[core-js](https://github.com/zloirock/core-js)**는 Angular CLI로 프로젝트를 생성할 때 `package.json` 파일에 자동으로 포함됩니다.

<!--
### Support packages
-->
### 기타 패키지

<!--
**[rxjs](https://github.com/benlesh/RxJS)**: Many Angular APIs return _observables_. RxJS is an implementation of the proposed [Observables specification](https://github.com/zenparsing/es-observable) currently before the
[TC39](http://www.ecma-international.org/memento/TC39.htm) committee that determines standards for the JavaScript language.
-->
**[rxjs](https://github.com/benlesh/RxJS)**: Angular에는 _옵저버블_ 을 반환하는 API가 많습니다. 옵저버블은 [TC39](http://www.ecma-international.org/memento/TC39.htm) 위원회에서 JavaScript 표준으로 검토되고 있지만 아직까지 정식 표준으로 지정되지는 않았습니다. RxJS는 현재 시점에서 이 [옵저버블 표준](https://github.com/zenparsing/es-observable)을 제공하는 라이브러리입니다.

<!--
**[zone.js](https://github.com/angular/zone.js)**: Angular relies on zone.js to run Angular's change detection processes when native JavaScript operations raise events.  Zone.js is an implementation of a [specification](https://gist.github.com/mhevery/63fdcdf7c65886051d55) currently before the
[TC39](http://www.ecma-international.org/memento/TC39.htm) committee that determines standards for the JavaScript language.
-->
**[zone.js](https://github.com/angular/zone.js)**: Angular의 변화 감지 과정은 zone.js 라이브러리를 사용합니다. 이벤트 발생과 관련된 새로운 JavaScript 표준이 [TC39](http://www.ecma-international.org/memento/TC39.htm)에서 검토중이며, 현재 시점에 [이 표준](https://gist.github.com/mhevery/63fdcdf7c65886051d55)을 도입하기 위해 zone.js가 사용됩니다.


{@a dev-dependencies}

## *DevDependencies*

<!--
The packages listed in the *devDependencies* section of the `package.json` help you develop the application on your local machine.
-->
`package.json` 파일의 *devDependencies* 목록에 추가된 패키지는 애플리케이션을 로컬환경에서 개발할 때 필요한 라이브러리들입니다.

<!--
You don't deploy them with the production application although there is no harm in doing so.
-->
이 목록에 있는 라이브러리들은 애플리케이션을 운영용으로 빌드할 때 포함할 필요가 없습니다.

<!--
**[@angular/cli](https://github.com/angular/angular-cli/)**: The Angular CLI tools.
-->
**[@angular/cli](https://github.com/angular/angular-cli/)**: Angular CLI입니다.

<!--
**[@angular/compiler-cli](https://github.com/angular/angular/blob/master/packages/compiler-cli/README.md)**: The Angular compiler, which is invoked by the Angular CLI's `build` and `serve` commands.
-->
**[@angular/compiler-cli](https://github.com/angular/angular/blob/master/packages/compiler-cli/README.md)**: Angular CLI의 `build` 명령이나 `serve` 명령을 실행할 때 사용되는 Angular 컴파일러입니다.

<!--
**[@angular/language-service](https://github.com/angular/angular-cli/)**: The Angular language service analyzes component templates and provides type and error information that TypeScript-aware editors can use to improve the developer's experience.
For example, see the [Angular language service extension for VS Code](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)
-->
**[@angular/language-service](https://github.com/angular/angular-cli/)**: Angular의 TypeScript 지원 라이브러리입니다. 이 라이브러리는 컴포넌트 템플릿에 사용된 객체의 타입을 분석하고 TypeScript 지원 기능을 제공하는 에디터에 추가 디버깅 정보를 제공합니다.
[Angular language service extension for VS Code](https://marketplace.visualstudio.com/items?itemName=Angular.ng-template)와 같은 플러그인이 이 라이브러리를 활용한 것입니다.

<!--
**@types/... **: TypeScript definition files for 3rd party libraries such as Jasmine and Node.js.
-->
**@types/... **: Jasmine이나 Node.js 등 서드파티 라이브러리의 TypeScript 타입 정보를 제공하는 라이브러리입니다.

<!--
**[codelyzer](https://www.npmjs.com/package/codelyzer)**: A linter for Angular apps whose rules conform to the Angular [style guide](guide/styleguide).
-->
**[codelyzer](https://www.npmjs.com/package/codelyzer)**: Angular [스타일 가이드](guide/styleguide)처럼 코딩 스타일 규칙을 정의할 때 사용하는 라이브러리입다.

<!--
**jasmine/... **: packages to support the [Jasmine](https://jasmine.github.io/) test library.
-->
**jasmine/... **: [Jasmine](https://jasmine.github.io/) 테스트 라이브러리와 관련된 패키지들입니다.

<!--
**karma/... **: packages to support the [karma](https://www.npmjs.com/package/karma) test runner.
-->
**karma/... **: 테스트 러너인 [karma](https://www.npmjs.com/package/karma)를 실행할 때 필요한 패키지들입니다.

<!--
**[protractor](https://www.npmjs.com/package/protractor)**: an end-to-end (e2e) framework for Angular apps. 
Built on top of [WebDriverJS](https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs).
-->
**[protractor](https://www.npmjs.com/package/protractor)**: Angular에 엔드-투-엔드 (e2e) 테스트를 적용할 때 사용하는 프레임워크입니다.
이 라이브러리는 [WebDriverJS](https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs)를 활용합니다.

<!--
**[ts-node](https://www.npmjs.com/package/ts-node)**: TypeScript execution environment and REPL for Node.js.
-->
**[ts-node](https://www.npmjs.com/package/ts-node)**: Node.js REPL 환경에 TypeScript 기능을 제공하는 라이브러리입니다.

<!--
**[tslint](https://www.npmjs.com/package/tslint)**: a static analysis tool that checks TypeScript code for readability, maintainability, and functionality errors.
-->
**[tslint](https://www.npmjs.com/package/tslint)**: TypeScript 코드의 가독성, 유지보수 편의성, 기능 에러를 분석하는 정적 코드 분석 툴입니다.

<!--
**[typescript](https://www.npmjs.com/package/typescript)**:
the TypeScript language server, including the *tsc* TypeScript compiler.
-->
**[typescript](https://www.npmjs.com/package/typescript)**: TypeScript 컴파일러인 *tsc*를 제공하는 TypeScript 언어셋입니다.

<!--
## So many packages! So many files!
-->
## 패키지가 너무 많다! 파일도 많다!

<!--
The default `package.json` installs more packages than you'll need for your project.

A given package may contain tens, hundreds, even thousands of files,
all of them in your local machine's `node_modules` directory.
The sheer volume of files is intimidating, 

You can remove packages that you don't need but how can you be sure that you won't need it?
As a practical matter, it's better to install a package you don't need than worry about it.
Extra packages and package files on your local development machine are harmless.

By default the Angular CLI build process bundles into a single file just the few "vendor" library files that your application actually needs.
The browser downloads this bundle, not the original package files.

See the [Deployment](guide/deployment) to learn more.
-->
애플리케이션이 확장되면서 기본 `package.json`에 있는 패키지 외에 더 많은 패키지들을 설치하게 될 것입니다.

그런데 각 패키지는 수십, 수백, 많게는 수천개의 파일로 구성될 수 있으며, 이 파일은 모두 `node_modules` 폴더에 설치됩니다.
이 파일들이 차지하는 용량도 작지는 않습니다.

필요없는 패키지는 삭제해도 되지만 어떤 패키지가 필요없는지 어떻게 알 수 있을까요?
실제 개발환경이라며 사용하지 않는 패키지라도 그대로 설치하는 것도 나쁘지 않습니다.
실제로 사용하지 않는 패키지가 로컬 개발 환경에 설치되었다고 해도 특별히 문제될 것은 없기 때문입니다.

그리고 Angular CLI가 애플리케이션을 빌드하게 되면 이 애플리케이션에 실제로 사용되는 라이브러리만 최종 결과물에 포함됩니다.
브라우저가 다운로드하는 것은 이렇게 빌드된 최종 결과물이며, 원래 패키지 파일을 전부 다운로드하는 것은 아닙니다.

더 자세한 내용은 [배포](guide/deployment) 문서를 참고하세요.
