<!--
# Workspace and project file structure
-->
# 워크스페이스, 프로젝트 파일 구조

<!--
You develop applications in the context of an Angular [workspace](guide/glossary#workspace). A workspace contains the files for one or more [projects](guide/glossary#project). A project is the set of files that comprise a standalone application or a shareable library.

The Angular CLI `ng new` command creates a workspace.
-->
Angular 애플리케이션은 Angular [워크스페이스(workspace)](guide/glossary#workspace) 컨텍스트 안에서 개발합니다.
그리고 워크스페이스에는 [프로젝트(project)](guide/glossary#project)가 여러개 존재할 수도 있습니다.
프로젝트는 단독으로 동작하는 애플리케이션이나 라이브러리를 구성하는 파일 모음을 의미합니다.

Angular CLI로 `ng new` 명령을 실행하면 워크스페이스를 생성할 수 있습니다.

<code-example language="bash">
ng new &lt;my-project&gt;
</code-example>

<!--
When you run this command, the CLI installs the necessary Angular npm packages and other dependencies in a new workspace, with a root-level application named *my-project*.
The workspace root folder contains various support and configuration files, and a README file with generated descriptive text that you can customize.

By default, `ng new` creates an initial skeleton application at the root level of the workspace, along with its end-to-end tests.
The skeleton is for a simple Welcome application that is ready to run and easy to modify.
The root-level application has the same name as the workspace, and the source files reside in the `src/` subfolder of the workspace.

This default behavior is suitable for a typical "multi-repo" development style where each application resides in its own workspace.
Beginners and intermediate users are encouraged to use `ng new` to create a separate workspace for each application.

Angular also supports workspaces with [multiple projects](#multiple-projects).
This type of development environment is suitable for advanced users who are developing [shareable libraries](guide/glossary#library),
and for enterprises that use a "monorepo" development style, with a single repository and global configuration for all Angular projects.

To set up a monorepo workspace, you should skip the creating the root application.
See [Setting up for a multi-project workspace](#multiple-projects) below.
-->
그러면 Angular CLI가 Angular npm 패키지를 설치하면서 새로운 *my-project*라는 폴더에 워크스페이스를 생성합니다.
워크스페이스 최상위 폴더에는 워크스페이스 관리 파일이나 환경설정 파일이 생성됩니다.
워크스페이스 설명은 보통 README 파일에 작성하는데, 이 파일도 이 때 생성됩니다.

그리고 `ng new` 명령을 실행하면 워크스페이스 최상위 폴더에 애플리케이션의 기본 틀과 엔드-투-엔드 테스트 환경도 함께 구성됩니다.
이 때 생성되는 애플리케이션 기본틀은 바로 실행할 수 있을 정도로 구성되기 때문에 수정하기도 쉽습니다.
이 애플리케이션의 이름은 워크스페이스 이름과 같고, 소스 파일은 워크스페이스의 `src/` 폴더 안에 구성됩니다.

`ng new` 명령이 실행된 결과가 이렇게 때문에 워크스페이스 하나에 애플리케이션을 여러개 구성할 수도 있습니다.
하지만 아직 Angular에 익숙하지 않다면 애플리케이션 하나를 생성할 때마다 `ng new` 명령을 실행하는 것이 좋습니다.

Angluar 워크스페이스에는 [프로젝트를 여러개](#multiple-projects) 구성할 수도 있습니다.
[라이브러리](guide/glossary#library)를 만들어서 공유할 목적이라면 이런 개발 환경도 고려해볼만 합니다.
워크스페이스 아래 생성하는 Angular 프로젝트는 모두 한 저장소(repository)로 관리할 수 있으며, 같은 환경설정의 영향을 받습니다.

단일 저장소(monorepo) 워크스페이스를 구성하려면 최상위 폴더에 생성되는 애플리케이션 생성은 건너뛰는 것이 좋습니다.
아래 [다중 프로젝트를 위한 워크스페이스 구성하기](#multiple-projects) 섹션을 참고하세요.


<!--
## Workspace configuration files
-->
## 워크스페이스 환경설정 파일

<!--
All projects within a workspace share a [CLI configuration context](guide/workspace-config).
The top level of the workspace contains workspace-wide configuration files, configuration files for the root-level application, and subfolders for the root-level application source and test files.

| WORKSPACE CONFIG FILES    | PURPOSE |
| :--------------------- | :------------------------------------------|
| `.editorconfig`        | Configuration for code editors. See [EditorConfig](https://editorconfig.org/). |
| `.gitignore`           | Specifies intentionally untracked files that [Git](https://git-scm.com/) should ignore. |
| `README.md`            | Introductory documentation for the root app. |
| `angular.json`         | CLI configuration defaults for all projects in the workspace, including configuration options for build, serve, and test tools that the CLI uses, such as [TSLint](https://palantir.github.io/tslint/), [Karma](https://karma-runner.github.io/), and [Protractor](http://www.protractortest.org/). For details, see [Angular Workspace Configuration](guide/workspace-config). |
| `package.json`          | Configures [npm package dependencies](guide/npm-packages) that are available to all projects in the workspace. See [npm documentation](https://docs.npmjs.com/files/package.json) for the specific format and contents of this file. |
| `package-lock.json`     | Provides version information for all packages installed into `node_modules` by the npm client. See [npm documentation](https://docs.npmjs.com/files/package-lock.json) for details. If you use the yarn client, this file will be [yarn.lock](https://yarnpkg.com/lang/en/docs/yarn-lock/) instead. |
| `src/`                  | Source files for the root-level application project. |
| `node_modules/`         | Provides [npm packages](guide/npm-packages) to the entire workspace. Workspace-wide `node_modules` dependencies are visible to all projects. |
| `tsconfig.json`         | Default [TypeScript](https://www.typescriptlang.org/) configuration for projects in the workspace. |
| `tslint.json`           | Default [TSLint](https://palantir.github.io/tslint/) configuration for projects in the workspace. |
-->
워크스페이스 안에 있는 모든 프로젝트는 같은 [CLI 환경설정 컨텍스트](guide/workspace-config)를 공유합니다.
그래서 워크스페이스 전역에 적용되는 환경설정 파일과 최상위 애플리케이션의 환경설정 파일은 워크스페이스 최상위 폴더에 위치하며, 그 아래로 최상위 애플리케이션의 소스 파일과 테스트 파일이 위치합니다.

| 워크스페이스 파일 | 용도 |
| :--------------------- | :------------------------------------------|
| `.editorconfig`        | 코드 에디터 환경설정 파일. [EditConfig](https://editorconfig.org/)를 참고하세요. |
| `.gitignore`           | [Git](https://git-scm.com/)으로 관리하지 않을 파일을 지정합니다. |
| `README.md`            | 앱 설명 파일 |
| `angular.json`         | 워크스페이스에 있는 모든 프로젝트에 적용될 Angular CLI 환경설정파일입니다. Angular CLI로 빌드, 서빙, 테스트할 때 사용하는 [TSLint](https://palantir.github.io/tslint/), [Karma](https://karma-runner.github.io/), [Protractor](http://www.protractortest.org/)에 대한 설정도 이 파일에 지정합니다. 자세한 내용은 [Angular 워크스페이스 환경설정](guide/workspace-config) 문서를 참고하세요. |
| `package.json`          | 워크스페이스에 있는 모든 프로젝트에 적용될 [npm 패키지](guide/npm-packages)를 지정합니다. 자세한 내용은 [npm 문서](https://docs.npmjs.com/files/package.json)를 참고하세요. |
| `package-lock.json`     | `node_modules`에 설치된 패키지 버전 정보를 저장합니다. 자세한 내용은 [npm 문서](https://docs.npmjs.com/files/package-lock.json)를 참고하세요. 이 파일은 npm을 사용했을 때 생성되며, yarn을 사용한다면 이 파일 대신 [yarn.lock](https://yarnpkg.com/lang/en/docs/yarn-lock/) 파일이 생성됩니다. |
| `src/`                  | 최상위 애플리케이션 프로젝트를 구성하는 소스 파일입니다. |
| `node_modules/`         | 워크스페이스에 사용할 [npm 패키지](guide/npm-packages)가 설치되는 폴더입니다. 이 폴더에 설치한 [npm 패키지](guide/npm-packages)는 워크스페이스에 존재하는 모든 프로젝트에 사용할 수 있습니다. |
| `tsconfig.json`         | 워크스페이스에 있는 프로젝트에 적용할 [TypeScript](https://www.typescriptlang.org/) 환경설정 파일입니다. |
| `tslint.json`           | 워크스페이스에 있는 프로젝트에 적용할 [TSLint](https://palantir.github.io/tslint/) 환경설정 파일입니다. |


## Application project files

By default, the CLI command `ng new my-app` creates a workspace folder named "my-app" and generates a new application skeleton in a `src/` folder at the top level of the workspace.
A newly generated application contains source files for a root module, with a root component and template.

When the workspace file structure is in place, you can use the `ng generate` command on the command line to add functionality and data to the application.
This initial root-level application is the *default app* for CLI commands (unless you change the default after creating [additional apps](#multiple-projects)).

<div class="alert is-helpful">

   Besides using the CLI on the command line, you can also use an interactive development environment like [Angular Console](https://angularconsole.com/), or manipulate files directly in the app's source folder and configuration files.

</div>

For a single-application workspace, the `src/` subfolder of the workspace contains the source files (application logic, data, and assets) for the root application.
For a multi-project workspace, additional projects in the `projects/` folder contain a `project-name/src/` subfolder with the same structure.

### Application source files

Files at the top level of `src/` support testing and running your application. Subfolders contain the application source and application-specific configuration.

| APP SUPPORT FILES    | PURPOSE |
| :--------------------- | :------------------------------------------|
| `app/`                 | Contains the component files in which your application logic and data are defined. See details [below](#app-src). |
| `assets/`              | Contains image and other asset files to be copied as-is when you build your application. |
| `environments/`        | Contains build configuration options for particular target environments. By default there is an unnamed standard development environment and a production ("prod") environment. You can define additional target environment configurations. |
| `favicon.ico`          | An icon to use for this application in the bookmark bar. |
| `index.html`           | The main HTML page that is served when someone visits your site. The CLI automatically adds all JavaScript and CSS files when building your app, so you typically don't need to add any `<script>` or` <link>` tags here manually. |
| `main.ts`              | The main entry point for your application. Compiles the application with the [JIT compiler](https://angular.io/guide/glossary#jit) and bootstraps the application's root module (AppModule) to run in the browser. You can also use the [AOT compiler](https://angular.io/guide/aot-compiler) without changing any code by appending the `--aot` flag to the CLI `build` and `serve` commands. |
| `polyfills.ts`         | Provides polyfill scripts for browser support. |
| `styles.sass`          | Lists CSS files that supply styles for a project. The extension reflects the style preprocessor you have configured for the project. |
| `test.ts`              | The main entry point for your unit tests, with some Angular-specific configuration. You don't typically need to edit this file. |

{@a app-src}

Inside the `src/` folder, the `app/` folder contains your project's logic and data.
Angular components, templates, and styles go here.

| `src/app/` FILES | PURPOSE |
| :-------------------------- | :------------------------------------------|
| `app/app.component.ts`      | Defines the logic for the app's root component, named `AppComponent`. The view associated with this root component becomes the root of the [view hierarchy](guide/glossary#view-hierarchy) as you add components and services to your application. |
| `app/app.component.html`    | Defines the HTML template associated with the root `AppComponent`. |
| `app/app.component.css`     | Defines the base CSS stylesheet for the root `AppComponent`. |
| `app/app.component.spec.ts` | Defines a unit test for the root `AppComponent`. |
| `app/app.module.ts`         | Defines the root module, named `AppModule`, that tells Angular how to assemble the application. Initially declares only the `AppComponent`. As you add more components to the app, they must be declared here. |

### Application configuration files

The application-specific configuration files for the root application reside at the workspace root level.
For a multi-project workspace, project-specific configuration files are in the project root, under `projects/project-name/`.

Project-specific [TypeScript](https://www.typescriptlang.org/) configuration files inherit from the workspace-wide `tsconfig.json`, and project-specific [TSLint](https://palantir.github.io/tslint/) configuration files inherit from the workspace-wide `tslint.json`.

| APPLICATION-SPECIFIC CONFIG FILES    | PURPOSE |
| :--------------------- | :------------------------------------------|
| `browserslist`         | Configures sharing of target browsers and Node.js versions among various front-end tools. See [Browserslist on GitHub](https://github.com/browserslist/browserslist) for more information.  |
| `karma.conf.js`      | Application-specific [Karma](https://karma-runner.github.io/2.0/config/configuration-file.html) configuration. |
| `tsconfig.app.json`    | Application-specific [TypeScript](https://www.typescriptlang.org/) configuration, including TypeScript and Angular template compiler options. See [TypeScript Configuration](guide/typescript-configuration) and [Angular Compiler Options](guide/angular-compiler-options). |
| `tsconfig.spec.json`   | [TypeScript](https://www.typescriptlang.org/) configuration for the application tests. See [TypeScript Configuration](guide/typescript-configuration). |
| `tslint.json`          | Application-specific [TSLint](https://palantir.github.io/tslint/) configuration. |

### End-to-end test files

An `e2e/` folder at the top level contains source files for a set of end-to-end tests that correspond to the root-level application, along with test-specific configuration files.

For a multi-project workspace, application-specific end-to-end tests are in the project root, under `projects/project-name/e2e/`.

<code-example language="none">
  e2e/
     src/                 (end-to-end tests for my-app)
        app.e2e-spec.ts
        app.po.ts
      protractor.conf.js  (test-tool config)
      tsconfig.json       (TypeScript config inherits from workspace)
</code-example>

{@a multiple-projects}

## Multiple projects

A multi-project workspace is suitable for an enterprise that uses a single repository and global configuration for all Angular projects (the "monorepo" model). A multi-project workspace also supports library development.

### Setting up for a multi-project workspace

If you intend to have multiple projects in a workspace, you can skip the initial application generation when you create the workspace, and give the workspace a unique name.
The following command creates a workspace with all of the workspace-wide configuration files, but no root-level application.

<code-example language="bash">
ng new my-workspace --createApplication="false"
</code-example>

You can then generate apps and libraries with names that are unique within the workspace.

<code-example language="bash">
cd my-workspace
ng generate application my-first-app
</code-example>

### Multiple project file structure

The first explicitly generated application goes into the `projects/` folder along with all other projects in the workspace.
Newly generated libraries are also added under `projects/`.
When you create projects this way, the file structure of the workspace is entirely consistent with the structure of the [workspace configuration file](guide/workspace-config), `angular.json`.

<code-example language="none">
my-workspace/
  ...             (workspace-wide config files)
  projects/       (generated applications and libraries)
    my-first-app/ --(an explicitly generated application)
      ...         --(application-specific config)
      e2e/        ----(corresponding e2e tests)
         src/     ----(e2e tests source)
         ...      ----(e2e-specific config)
      src/        --(source and support files for application)
    my-lib/       --(a generated library)
      ...         --(library-specific config)
      src/        --source and support files for library)
</code-example>

## Library project files

When you generate a library using the CLI (with a command such as `ng generate library my-lib`), the generated files go into the projects/ folder of the workspace. For more information about creating your own libraries, see  [Creating Libraries](https://angular.io/guide/creating-libraries).

Libraries (unlike applications and their associated e2e projects) have their own `package.json` configuration files.

Under the `projects/` folder, the `my-lib` folder contains your library code.

| LIBRARY SOURCE FILES | PURPOSE                                                                      |
| :------------------- | :----------------------------------------------------------------------------|
| `src/lib`           |  Contains your library project's logic and data. Like an application project, a library project can contain components, services, modules, directives, and pipes.                                                            |
| `src/test.ts`       | The main entry point for your unit tests, with some library-specific configuration. You don't typically need to edit this file.                                                                                            |
| `src/public-api.ts`  | Specifies all files that are exported from your library.                                                                                                                                                                     |
| `karma.conf.js`      | Library-specific [Karma](https://karma-runner.github.io/2.0/config/configuration-file.html) configuration.                                                                                                                   |
| `ng-package.json`    | Configuration file used by [ng-packagr](https://github.com/ng-packagr/ng-packagr) for building your library.                                                                                                                 |
| `package.json`       | Configures [npm package dependencies](guide/npm-packages) that are required for this library.                                                                                                                                |
| `tsconfig.lib.json`  | Library-specific [TypeScript](https://www.typescriptlang.org/) configuration, including TypeScript and Angular template compiler options. See [TypeScript Configuration](guide/typescript-configuration).            |
| `tsconfig.spec.json` | [TypeScript](https://www.typescriptlang.org/) configuration for the library tests. See [TypeScript Configuration](guide/typescript-configuration).                                                                     |
| `tslint.json`        | Library-specific [TSLint](https://palantir.github.io/tslint/) configuration. |
