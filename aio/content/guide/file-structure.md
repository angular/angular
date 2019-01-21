<!--
# Workspace and project file structure
-->
# 워크스페이스와 프로젝트 파일 구조

<!--
You develop apps in the context of an Angular [workspace](guide/glossary#workspace). A workspace contains the files for one or more [projects](guide/glossary#project). A project is the set of files that comprise a standalone app, a library, or a set of end-to-end (e2e) tests. 
-->
Angular 애플리케이션은 Angular [워크스페이스(workspace)](guide/glossary#workspace) 컨텍스트 안에서 개발합니다.
워크스페이스는 하나 이상의 [프로젝트](guide/glossary#project)로 구성된 단위를 의미하며, 프로젝트는 개별 Angular 애플리케이션, 라이브러리, 엔드-투-엔드 (e2e) 테스트 앱을 의미합니다.

<!--
The Angular CLI command `ng new <project_name>` gets you started. 
When you run this command, the CLI installs the necessary Angular npm packages and other dependencies in a new workspace, with a root folder named *project_name*. 
It also creates the following workspace and starter project files:

* An initial skeleton app project, also called *project_name* (in the `src/` subfolder).
* An end-to-end test project (in the `e2e/` subfolder).
* Related configuration files.

The initial app project contains a simple Welcome app, ready to run. 
-->
Angular 애플리케이션 개발은 Angular CLI 명령 `ng new <프로젝트_이름>`을 실행하는 것부터 시작합니다.
이 명령을 실행하면 *프로젝트 이름* 으로 루트 폴더를 생성하면서 워크스페이스를 구성하고, Angular 애플리케이션에 필요한 npm 패키지를 설치합니다.
이 때 기본 워크스페이스와 기본 프로젝트 파일들이 다음과 같이 구성됩니다:

* `src/` 폴더 아래 *프로젝트 이름*으로 앱 프로젝트를 만들고 기본 코드를 생성합니다.
* `e2e/` 폴더 아래 엔드-투-엔드 테스트 프로젝트를 생성합니다.
* 기타 환경 설정 파일을 생성합니다.

이제 기본 앱이 생성되었으며 실행할 준비가 되었습니다.

<!--
## Workspace files
-->
## 워크스페이스 파일 구성

<!--
The top level of the workspace contains a number of workspace-wide configuration files.
-->
워크스페이스 최상위 폴더에는 워크스페이스 전역에 적용되는 환경 설정파일이 존재합니다.

<!--
| WORKSPACE CONFIG FILES    | PURPOSE |
| :--------------------- | :------------------------------------------|
| `.editorconfig`        | Configuration for code editors. See [EditorConfig](https://editorconfig.org/). |
| `.gitignore`           | Specifies intentionally untracked files that [Git](https://git-scm.com/) should ignore. |
| `angular.json`         | CLI configuration defaults for all projects in the workspace, including configuration options for build, serve, and test tools that the CLI uses, such as [TSLint](https://palantir.github.io/tslint/), [Karma](https://karma-runner.github.io/), and [Protractor](http://www.protractortest.org/). For details, see [Angular Workspace Configuration](guide/workspace-config). |
| `node_modules`         | Provides [npm packages](guide/npm-packages) to the entire workspace. |
| `package.json`         | Configures [npm package dependencies](guide/npm-packages) that are available to all projects in the workspace. See [npm documentation](https://docs.npmjs.com/files/package.json) for the specific format and contents of this file. |
| `package-lock.json`    | Provides version information for all packages installed into `node_modules` by the npm client. See [npm documentation](https://docs.npmjs.com/files/package-lock.json) for details. If you use the yarn client, this file will be [yarn.lock](https://yarnpkg.com/lang/en/docs/yarn-lock/) instead. |
| `tsconfig.json`        | Default [TypeScript](https://www.typescriptlang.org/) configuration for apps in the workspace, including TypeScript and Angular template compiler options. See [TypeScript Configuration](guide/typescript-configuration). |
| `tslint.json`          | Default [TSLint](https://palantir.github.io/tslint/) configuration for apps in the workspace. |
| `README.md`            | Introductory documentation. |
-->
| 워크스페이스 설정 파일 | 용도 |
| :--------------------- | :------------------------------------------|
| `.editorconfig`        | 코드 에디터 설정 파일입니다. [EditorConfig](https://editorconfig.org/)를 참고하세요. |
| `.gitignore`           | [Git](https://git-scm.com/) 저장소에 포함되지 않는 파일을 지정합니다. |
| `angular.json`         | 워크스페이스에 있는 모든 프로젝트에 적용되는 Angular CLI 설정 파일입니다. Angular CLI로 빌드하거나 서버를 실행할 때 사용되며, [TSLint](https://palantir.github.io/tslint/), [Karma](https://karma-runner.github.io/), [Protractor](http://www.protractortest.org/)와 같은 테스트 툴을 실행할 때도 모두 이 파일의 설정이 기본값으로 적용됩니다. 자세한 내용은 [Angular 워크스페이스 설정](guide/workspace-config) 문서를 참고하세요. |
| `node_modules`         | 워크스페이스에 필요한 [npm 패키지](guide/npm-packages)들이 설치되는 폴더입니다. |
| `package.json`         | 워크스페이스에 존재하는 프로젝트에 모두 사용되는 [npm 의존성 패키지](guide/npm-packages)를 정의하는 파일입니다. 이 파일의 자세한 내용은 [npm 문서](https://docs.npmjs.com/files/package.json)를 참고하세요. |
| `package-lock.json`    | `node_modules`에 설치된 npm 패키지들의 버전 정보를 제공하는 파일입니다. 자세한 내용은 [npm 문서](https://docs.npmjs.com/files/package-lock.json)를 참고하세요. npm 대신 yarn을 사용한다면 이 파일 대신 [yarn.lock](https://yarnpkg.com/lang/en/docs/yarn-lock/) 파일이 생성됩니다. |
| `tsconfig.json`        | 워크스페이스에 존재하는 앱에 적용되는 [TypeScript](https://www.typescriptlang.org/) 설정 파일입니다. 이 파일에는 TypeScript 설정과 Angular 템플릿 컴파일러 옵션이 선언됩니다. 자세한 내용은  [TypeScript 설정](guide/typescript-configuration) 문서를 참고하세요. |
| `tslint.json`          | 워크스페이스에 존재하는 앱에 적용될 [TSLint](https://palantir.github.io/tslint/) 설정 파일입니다. |
| `README.md`            | 워크스페이스 소개 파일입니다. |

<!--
All projects within a workspace share a [CLI configuration context](guide/workspace-config). 
Project-specific [TypeScript](https://www.typescriptlang.org/) configuration files inherit from the workspace-wide `tsconfig.*.json`, and app-specific [TSLint](https://palantir.github.io/tslint/) configuration files inherit from the workspace-wide `tslint.json`.
-->
워크스페이스에 존재하는 프로젝트는 모두 같은 [Angular CLI 설정 파일](guide/workspace-config)를 공유합니다.
그리고 특정 프로젝트에 [TypeScript](https://www.typescriptlang.org/) 설정을 다르게 하려면 워크스페이스에 있는 `tsconfig.*.json` 파일을 상속하면 되고, 워크스페이스에 있는 `tslint.json` 파일을 상속하면 특정 앱에 적용되는 [TSLint](https://palantir.github.io/tslint/) 설정을 변경할 수 있습니다.

<!--
### Default app project files
-->
#### 기본 앱 프로젝트 파일 구성

<!--
The CLI command `ng new my-app` creates a workspace folder named "my-app" and generates a new app skeleton. 
This initial app is the *default app* for CLI commands (unless you change the default after creating additional apps). 

A newly generated app contains the source files for a root module, with a root component and template. 
When the workspace file structure is in place, you can use the `ng generate` command on the command line to add functionality and data to the initial app.
-->
Angular CLI로 `ng new my-app` 명령을 실행하면 "my-app"이라는 워크스페이스 폴더가 생성되고 이 폴더에 애플리케이션 기본 코드가 생성됩니다.
이 때 생성되는 애플리케이션이 Angular CLI 명령의 대상이 되는 *기본 앱*이며, 따로 변경하지 않는 이상 이 설정이 그대로 유지됩니다.

`ng new` 명령으로 생성한 앱에는 최상위 모듈과 최상위 컴포넌트를 포함해서 소스 파일이 몇 개 존재합니다.
그리고 워크스페이스 폴더 안에서 커맨드창에 `ng generate` 명령을 실행하면 이 애플리케이션에 Angular 구성요소를 추가하면서 확장할 수 있습니다.

<div class="alert is-helpful">

   <!--
   Besides using the CLI on the command line, you can also use an interactive development environment like [Angular Console](https://angularconsole.com/), or manipulate files directly in the app's source folder and configuration files.
   -->
   커맨드창에서 Angular CLI를 사용하는 대신 대화형 개발 환경인 [Angular Console](https://angularconsole.com/)을 사용할 수도 있고, 애플리케이션의 폴더나 설정 파일을 직접 수정할 수도 있습니다.

</div>

<!--
The `src/` subfolder contains the source files (app logic, data, and assets), along with configuration files for the initial app.
Workspace-wide `node_modules` dependencies are visible to this project.
-->
서브폴더 `src/`에는 애플리케이션 로직이나 데이터, 리소스 파일이 존재하며, 기본 앱에 필요한 환경 설정 파일도 존재합니다.
이 프로젝트는 워크스페이스 계층에 존재하는 `node_modules` 의존성 패키지를 참조할 수 있습니다.

<!--
| APP SOURCE & CONFIG FILES    | PURPOSE |
| :--------------------- | :------------------------------------------|
| `app/`                 | Contains the component files in which your app logic and data are defined. See details in [App source folder](#app-src) below. |
| `assets/`              | Contains image files and other asset files to be copied as-is when you build your application. | 
| `environments/`        | Contains build configuration options for particular target environments. By default there is an unnamed standard development environment and a production ("prod") environment. You can define additional target environment configurations. |
| `browserlist`          | Configures sharing of target browsers and Node.js versions among various front-end tools. See [Browserlist on GitHub](https://github.com/browserslist/browserslist) for more information.  |
| `favicon.ico`          | An icon to use for this app in the bookmark bar. |
| `index.html`           | The main HTML page that is served when someone visits your site. The CLI automatically adds all JavaScript and CSS files when building your app, so you typically don't need to add any `<script>` or` <link>` tags here manually. |
| `main.ts`              | The main entry point for your app. Compiles the application with the [JIT compiler](https://angular.io/guide/glossary#jit) and bootstraps the application's root module (AppModule) to run in the browser. You can also use the [AOT compiler](https://angular.io/guide/aot-compiler) without changing any code by appending the `--aot` flag to the CLI `build` and `serve` commands. |
| `polyfills.ts`         | Provides polyfill scripts for browser support. |
| `styles.sass`          | Lists CSS files that supply styles for a project. The extension reflects the style preprocessor you have configured for the project. |
| `test.ts`              | The main entry point for your unit tests, with some Angular-specific configuration. You don't typically need to edit this file. |
| `tsconfig.app.json`   | Inherits from the workspace-wide `tsconfig.json` file. |
| `tsconfig.spec.json`  | Inherits from the workspace-wide `tsconfig.json` file. |
| `tslint.json`         | Inherits from the workspace-wide `tslint.json` file. |
-->
| 앱 소스 & 설정 파일    | 용도 |
| :--------------------- | :------------------------------------------|
| `app/`                 | 애플리케이션 로직이나 데이터를 정의하는 컴포넌트 파일들이 존재합니다. 자세한 내용은 아래 [앱 소스 폴더](#app-src) 섹션을 참고하세요. |
| `assets/`              | 애플리케이션을 빌드할 때 복사되는 이미지 파일이나 기타 리소스 파일이 존재합니다. | 
| `environments/`        | 빌드 환경마다 달라지는 옵션을 지정하는 파일이 존재합니다. Angular CLI는 아무 접미사도 붙지 않은 기본 환경설정 파일과 "prod" 접미사가 붙는 운영 빌드 설정 파일을 자동으로 생성합니다. 빌드 환경에 따라 다른 설정 파일을 더 생성할 수도 있습니다. |
| `browserlist`          | 지원 브라우저와 Node.js 버전에 대한 정보를 지정하며, 이 파일의 내용은 프론트엔드 개발 툴들이 공유합니다. 자세한 내용은 [Browserlist on GitHub](https://github.com/browserslist/browserslist) 문서를 참고하세요.  |
| `favicon.ico`          | 브라우저 즐겨찾기에 표시되는 아이콘 파일입니다. |
| `index.html`           | 사이트에 접속한 사용자가 보는 메인 HTML 페이지입니다. Angular CLI는 애플리케이션을 빌드할 때 모든 JavaScript 파일과 CSS 파일을 자동으로 이 파일에 포함시키기 때문에, 일반적으로 개발자가 직접 `<script>` 태그나 `<link>` 태그를 추가할 일은 없습니다. |
| `main.ts`              | 애플리케이션 진입점입니다. 이 파일은 [JIT 컴파일러](https://angular.io/guide/glossary#jit)로 컴파일된 후에 브라우저에서 애플리케이션 최상위 모듈(AppModule) 부트스트랩하면서 실행됩니다. Angulalr CLI로 `build` 명령이나 `serve` 명령을 실행할 때 `--aot` 옵션을 붙이면 [AOT 컴파일러](https://angular.io/guide/aot-compiler)로 애플리케이션을 빌드할 수도 있습니다. |
| `polyfills.ts`         | 브라우저 호환성을 맞추기 위해 폴리필 스크립트를 적용할 때 사용합니다. |
| `styles.sass`          | 프로젝트에 적용되는 CSS 파일 목록을 지정하는 파일입니다. 이 파일의 확장자는 프로젝트 설정에 따라 달라질 수 있습니다. |
| `test.ts`              | Angular 애플리케이션을 테스트할 때 진입점이 되는 파일입니다. 이 파일을 수정할 일은 거의 없습니다. |
| `tsconfig.app.json`   | 워크스페이스 전역에 존재하는 `tsconfig.json` 파일을 상속한 파일입니다. |
| `tsconfig.spec.json`  | 워크스페이스 전역에 존재하는 `tsconfig.json` 파일을 상속한 파일입니다. |
| `tslint.json`         | 워크스페이스 전역에 존재하는 `tslint.json` 파일을 상속한 파일입니다. |

<!--
### Default app project e2e files
-->
### e2e 프로젝트 파일 구성

<!--
An `e2e/` subfolder contains configuration and source files for a set of end-to-end tests that correspond to the initial app.
Workspace-wide `node_modules` dependencies are visible to this project.
-->
`e2e/` 서브폴더에는 기본 앱을 대상으로 엔드-투-엔드 테스트를 실행하기 위한 설정 파일들이 존재합니다.
이 프로젝트는 워크스페이스 계층에 존재하는 `node_modules` 의존성 패키지를 참조할 수 있습니다.

<!--
<code-example language="none" linenums="false">
my-app/
  e2e/                  (end-to-end test app for my-app)
    src/                (app source files)
    protractor.conf.js  (test-tool config)
    tsconfig.e2e.json   (TypeScript config inherits from workspace tsconfig.json)
</code-example>
-->
<code-example language="none" linenums="false">
my-app/
  e2e/                  (my-app을 테스트하는 엔드-투-엔드 테스트 앱)
    src/                (앱 소스 파일)
    protractor.conf.js  (테스트 툴 설정 파일)
    tsconfig.e2e.json   (워크스페이스 전역에 존재하는 tsconfig.json 파일을 상속해서 구성한 TypeScript 설정 파일)
</code-example>

<!--
### Project folders for additional apps and libraries
-->
### 추가 앱과 라이브러리가 생성되는 프로젝트 폴더

<!--
When you generate new projects in a workspace, 
the CLI creates a new *workspace*`/projects` folder, and adds the generated files there.

When you generate an app (`ng generate application my-other-app`), the CLI adds folders under `projects/` for both the app and its corresponding end-to-end tests. Newly generated libraries are also added under `projects/`.
-->
Angular CLI로 워크스페이스에서 새로운 프로젝트를 생성하면 이 프로젝트는 *워크스페이스*의 `/projects` 폴더에 생성됩니다.

그래서 `ng generate application my-other-app` 명령을 실행하면 Angular CLI가 `projects/` 폴더 아래 애플리케이션을 생성하면서 이 애플리케이션에 적용될 엔드-투-엔드 테스트 앱도 함께 생성합니다.
워크스페이스에서 라이브러리를 생성해도 이 라이브러리는 `projects/` 폴더 아래에 생성됩니다.

<!--
<code-example language="none" linenums="false">
my-app/
  ...
  projects/           (additional apps and libs)
    my-other-app/     (a second app)
      src/
      (config files)
    my-other-app-e2e/  (corresponding test app) 
      src/
      (config files)
    my-lib/            (a generated library)
      (config files)
</code-example>
-->
<code-example language="none" linenums="false">
my-app/
  ...
  projects/           (추가 생성된 앱과 라이브러리가 존재하는 폴더)
    my-other-app/     (추가 생성된 앱)
      src/
      (설정 파일들)
    my-other-app-e2e/  (my-other-app에 적용되는 e2e 앱) 
      src/
      (설정 파일들)
    my-lib/            (추가 생성된 라이브러리)
      (설정 파일들)
</code-example>

{@a app-src}
<!--
## App source folder
-->
## 앱 소스 폴더

<!--
Inside the `src/` folder, the `app/` folder contains your app's logic and data. Angular components, templates, and styles go here. An `assets/` subfolder contains images and anything else your app needs. Files at the top level of `src/` support testing and running your app.
-->
`src/app/` 폴더에는 애플리케이션 로직과 데이터를 정의하는 파일들이 존재하며, Angular 컴포넌트나 템플릿, 스타일 파일도 이 폴더에 존재합니다.
그리고 `assets/` 서브폴더에는 애플리케이션에 필요한 이미지 파일이나 기타 리소스가 존재합니다.
`src/` 폴더에는 애플리케이션을 테스트하거나 실행하기 위한 설정 파일도 함께 존재합니다.

<!--
| APP SOURCE FILES | PURPOSE |
| :-------------------------- | :------------------------------------------|
| `app/app.component.ts`      | Defines the logic for the app's root component, named `AppComponent`. The view associated with this root component becomes the root of the [view hierarchy](guide/glossary#view-hierarchy) as you add components and services to your app. |
| `app/app.component.html`    | Defines the HTML template associated with the root `AppComponent`. |
| `app/app.component.css`     | Defines the base CSS stylesheet for the root `AppComponent`. |
| `app/app.component.spec.ts` | Defines a unit test for the root `AppComponent`. |
| `app/app.module.ts`         | Defines the root module, named `AppModule`, that tells Angular how to assemble the application. Initially declares only the `AppComponent`. As you add more components to the app, they must be declared here. |
| `assets/*`                  | Contains image files and other asset files to be copied as-is when you build your application. |
-->
| 앱 소스 파일 | 용도 |
| :-------------------------- | :------------------------------------------|
| `app/app.component.ts`      | 앱 최상위 컴포넌트 AppComponent가 정의된 파일입니다. 이 컴포넌트는 [뷰 계층](guide/glossary#view-hierarchy)에서도 최상위에 존재하며 다른 컴포넌트와 서비스는 이 컴포넌트를 기준으로 동작합니다. |
| `app/app.component.html`    | `AppComponent`의 템플릿을 정의하는 HTML 파일입니다. |
| `app/app.component.css`     | `AppComponent` 템플릿의 스타일을 정의하는 CSS 스타일시트 파일입니다. |
| `app/app.component.spec.ts` | `AppComponent`를 대상으로 실행되는 유닛테스트의 스펙 파일입니다. |
| `app/app.module.ts`         | 최상위 모듈 `AppModule`을 정의하는 파일이며, 애플리케이션은 이 파일을 기준으로 조합됩니다. 애플리케이션 생성 초기에는 `AppComponent`만 존재하며, 애플리케이션에 추가되는 컴포넌트는 모두 모듈에 등록되어야 합니다. |
| `assets/*`                  | 애플리케이션이 빌드될 때 복사될 이미지 파일이나 기타 리소스 파일이 존재합니다. |