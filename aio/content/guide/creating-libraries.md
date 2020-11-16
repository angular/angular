<!--
# Creating libraries
-->
# 라이브러리 만들기

<!--
This page provides a conceptual overview of how you can create and publish new libraries to extend Angular functionality.

If you find that you need to solve the same problem in more than one app (or want to share your solution with other developers), you have a candidate for a library.
A simple example might be a button that sends users to your company website, that would be included in all apps that your company builds.
-->
이 문서는 Angular 기능을 라이브러리로 만들고 배포하는 방법을 다룹니다.

그러면 여러 앱에서 발생할 수 있는 특정 문제를 한 번에 해결할 수 있으며 같은 문제를 겪고 있는 다른 개발자들을 도울 수도 있습니다.
특정 웹사이트로 연결되는 버튼 하나를 라이브러리로 만들 수도 있고, 회사에서 사용하는 앱 전체를 라이브러리로 묶을 수도 있습니다.

<!--
## Getting started
-->
## 시작하기

<!--
Use the Angular CLI to generate a new library skeleton in a new workspace with the following commands.

<code-example language="bash">
 ng new my-workspace --create-application=false
 cd my-workspace
 ng generate library my-lib
</code-example>

The `ng generate` command creates the `projects/my-lib` folder in your workspace, which contains a component and a service inside an NgModule.

<div class="alert is-helpful">

     For more details on how a library project is structured, refer to the [Library project files](guide/file-structure#library-project-files) section of the [Project File Structure guide](guide/file-structure).

     You can use the monorepo model to use the same workspace for multiple projects.
     See [Setting up for a multi-project workspace](guide/file-structure#multiple-projects).

</div>

When you generate a new library, the workspace configuration file, `angular.json`, is updated with a project of type `library`.

<code-example format="json">
"projects": {
  ...
  "my-lib": {
    "root": "projects/my-lib",
    "sourceRoot": "projects/my-lib/src",
    "projectType": "library",
    "prefix": "lib",
    "architect": {
      "build": {
        "builder": "@angular-devkit/build-ng-packagr:build",
        ...
</code-example>

You can build, test, and lint the project with CLI commands:

<code-example language="bash">
 ng build my-lib
 ng test my-lib
 ng lint my-lib
</code-example>

Notice that the configured builder for the project is different from the default builder for app projects.
This builder, among other things, ensures that the library is always built with the [AOT compiler](guide/aot-compiler), without the need to specify the `--prod` flag.

To make library code reusable you must define a public API for it. This "user layer" defines what is available to consumers of your library. A user of your library should be able to access public functionality (such as NgModules, service providers and general utility functions) through a single import path.

The public API for your library is maintained in the `public-api.ts` file in your library folder.
Anything exported from this file is made public when your library is imported into an application.
Use an NgModule to expose services and components.

Your library should supply documentation (typically a README file) for installation and maintenance.
-->
라이브러리 프로젝트의 기본 틀은 Angular CLI로 다음 명령을 실행하면 생성할 수 있습니다:

<code-example language="bash">
 ng new my-workspace --create-application=false
 cd my-workspace
 ng generate library my-lib
</code-example>

이 명령을 실행하면 워크스페이스에 `projects/my-lib` 폴더가 생성되고 이 폴더에 컴포넌트 하나와 서비스 하나, NgModule 하나가 생성됩니다.

<div class="alert is-helpful">

     For more details on how a library project is structured, refer to the [Library project files](guide/file-structure#library-project-files) section of the [Project File Structure guide](guide/file-structure).

     You can use the monorepo model to use the same workspace for multiple projects.
     See [Setting up for a multi-project workspace](guide/file-structure#multiple-projects).

</div>

그리고 워크스페이스 환경설정 파일인 `angular.json`에 `library` 타입으로 프로젝트가 추가됩니다.

이렇게 만든 프로젝트는 Angular CLI를 사용해서 빌드하고, 테스트하며, 코딩 스타일도 점검(lint)할 수 있습니다.

<code-example language="bash">
 ng build my-lib
 ng test my-lib
 ng lint my-lib
</code-example>

그런데 이 프로젝트의 빌더 설정은 기본 프로젝트 빌더 설정과 조금 다릅니다.
라이브러리용 빌더는 말그대로 라이브러리에 사용되는 것이기 때문에 `--prod` 옵션을 붙이지 않아도 언제나 [AOT 컴파일러](guide/aot-compiler)로 빌드됩니다.

라이브러리는 퍼블릭(public) API를 제공해야 다른 개발자가 이 API를 통해 라이브러리의 기능을 활용할 수 있습니다.

퍼블릭 API는 라이브러리 폴더에 `public-api.ts` 파일로 정의하는데, 이 파일에서 외부로 공개(export)하는 심볼이 이 라이브러리의 API가 됩니다.
그리고 NgModule을 외부로 공개하면 이 모듈에 포함된 서비스와 컴포넌트도 함께 제공할 수 있습니다.

라이브러리의 설치방법이나 사용법을 README 파일로 만드는 것도 좋습니다.


<!--
## Refactoring parts of an app into a library
-->
## 앱 코드를 라이브러리용으로 리팩토링하기

<!--
To make your solution reusable, you need to adjust it so that it does not depend on app-specific code.
Here are some things to consider in migrating application functionality to a library.

* Declarations such as components and pipes should be designed as stateless, meaning they don’t rely on or alter external variables. If you do rely on state, you need to evaluate every case and decide whether it is application state or state that the library would manage.

* Any observables that the components subscribe to internally should be cleaned up and disposed of during the lifecycle of those components.

* Components should expose their interactions through inputs for providing context, and outputs for communicating events to other components.

* Check all internal dependencies.
   * For custom classes or interfaces used in components or service, check whether they depend on additional classes or interfaces that also need to be migrated.
   * Similarly, if your library code depends on a service, that service needs to be migrated.
   * If your library code or its templates depend on other libraries (such as Angular Material, for instance), you must configure your library with those dependencies.
   
* Consider how you provide services to client applications.

   * Services should declare their own providers (rather than declaring providers in the NgModule or a component), so that they are *tree-shakable*. This allows the compiler to leave the service out of the bundle if it never gets injected into the application that imports the library. For more about this, see [Tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).

   * If you register global service providers or share providers across multiple NgModules, use the [`forRoot()` and `forChild()` design patterns](guide/singleton-services) provided by the [RouterModule](api/router/RouterModule).

   * If your library provides optional services that might not be used by all client applications, support proper tree-shaking for that case by using the [lightweight token design pattern](guide/lightweight-injection-tokens).
-->
어떤 솔루션을 재사용하려면 그 솔루션이 특정 문제만 해결해야 하고 다른 영향을 주지 않아야 합니다.
애플리케이션의 기능을 라이브러리용으로 만들때 고려해야하는 점에 대해 알아봅시다.

* 컴포넌트나 파이프는 상태에 관계없이 동작하도록 설계해야 합니다. 이 말은 라이브러리 외부에 존재하는 값에 따라 동작이 달라져서는 안되며 외부 변수를 변경해서도 안된다는 뜻입니다. 꼭 상태가 존재해야 한다면 애플리케이션과 라이브러리에 존재할 수 있는 모든 상태를 고려해야 합니다.

* 라이브러리에 컴포넌트가 있고 이 컴포넌트가 옵저버블을 구독한다면, 이 옵저버블은 컴포넌트가 종료되기 전에 반드시 구독 해제 되어야 합니다.

* 컴포넌트에 입력으로 들어오는 값이나 출력으로 나가는 값은 미리 정해져 있어야 합니다.

* 내부 의존성 관계를 꼭 점검하세요.
   * 라이브러리가 제공하는 컴포넌트나 서비스에 사용되는 커스텀 클래스/인터페이스가 다른 객체와 연관되어 있다면 이 객체도 라이브러리에 포함해야 할 수 있습니다.
   * 그리고 라이브러리가 다른 서비스를 활용한다면 이 서비스도 포함해야 하는지 검토해 보세요.
   * 라이브러리 코드가 Angular Material과 같은 다른 라이브러리를 활용한다면 이 라이브러리를 의존성 패키지로 추가해야 합니다.

* Consider how you provide services to client applications.

   * Services should declare their own providers (rather than declaring providers in the NgModule or a component), so that they are *tree-shakable*. This allows the compiler to leave the service out of the bundle if it never gets injected into the application that imports the library. For more about this, see [Tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).

   * If you register global service providers or share providers across multiple NgModules, use the [`forRoot()` and `forChild()` design patterns](guide/singleton-services) provided by the [RouterModule](api/router/RouterModule).

   * If your library provides optional services that might not be used by all client applications, support proper tree-shaking for that case by using the [lightweight token design pattern](guide/lightweight-injection-tokens).


<!--
## Reusable code and schematics
-->
## 재사용할 수 있는 코드와 스키매틱

<!--
A library typically includes *reusable code* that defines components, services, and other Angular artifacts (pipes, directives, and so on) that you simply import into a project.
A library is packaged into an npm package for publishing and sharing, and this package can also include [schematics](guide/glossary#schematic) that provide instructions for generating or transforming code directly in your project, in the same way that the CLI creates a generic skeleton app with `ng generate component`.
A schematic that is combined with a library can, for example, provide the Angular CLI with the information it needs to generate a particular component defined in that library.

What you include in your library is determined by the kind of task you are trying to accomplish.
For example, if you want a dropdown with some canned data to show how to add it to your app, your library could define a schematic to create it.
For a component like a dropdown that would contain different passed-in values each time, you could provide it as a component in a shared library.

Suppose you want to read a configuration file and then generate a form based on that configuration.
If that form will need additional customization by the user, it might work best as a schematic.
However, if the forms will always be the same and not need much customization by developers, then you could create a dynamic component that takes the configuration and generates the form.
In general, the more complex the customization, the more useful the schematic approach.
-->
라이브러리는 컴포넌트나 서비스, 파이프, 디렉티브 단위로 *재사용할 수 있는* 코드를 제공하는 것이 목적이기 때문에, 프로젝트에 로드해서 간단하게 사용할 수 있습니다.
일반적으로 라이브러리는 npm 패키지로 빌드되어 배포되는데, 이 패키지는 [스키매틱(schematics)](guide/glossary#schematic)을 포함할 수도 있습니다.
스키매틱은 프로젝트에 파일을 직접 생성하거나 수정하는 작업을 의미합니다.
Angular CLI 명령 중 `ng generate component`를 실행했을 때 컴포넌트 구성파일들이 생성되며 관련 모듈 코드가 수정되는 것도 이런 작업입니다.
스키매틱은 Angular CLI가 생성할 수 있는 목록을 확장하는 용도로도 활용됩니다.

라이브러리에 포함될 내용은 이 라이브러리가 어떤 작업을 하느냐에 따라 달라집니다.
그래서 드롭다운을 제공하는 라이브러리가 사용방법도 제공한다면 이 내용을 함께 라이브러리에 담아 제공할 수 있습니다.
그리고 이 드롭다운에 활용되는 데이터가 매번 달라진다면 외부에서 값을 받을 수 있는 컴포넌트로 제공할 수도 있습니다.

설정 파일을 읽어서 폼을 자동으로 구성하는 라이브러리가 있다고 합시다.
이 폼을 상황에 따라 커스터마이징해야 한다면 스키매틱을 활용하는 것이 더 좋습니다.
하지만 이 폼을 거의 수정하지 않는다면 단순하게 설정 파일을 읽어서 동적 컴포넌트로 구성하는 것이 간단할 것입니다.
일반적으로는 커스터마이징하기 복잡할수록 스키매틱을 사용하는 방식이 더 편합니다.

{@a integrating-with-the-cli}

<!--
## Integrating with the CLI using code-generation schematics
-->
## 코드 생성 스키매틱과 CLI 통합하기

<!--
A library typically includes *reusable code* that defines components, services, and other Angular artifacts (pipes, directives, and so on) that you simply import into a project.
A library is packaged into an npm package for publishing and sharing.
This package can also include [schematics](guide/glossary#schematic) that provide instructions for generating or transforming code directly in your project, in the same way that the CLI creates a generic new component with `ng generate component`.
A schematic that is packaged with a library can, for example, provide the Angular CLI with the information it needs to generate a component that configures and uses a particular feature, or set of features, defined in that library.
One example of this is Angular Material's navigation schematic which configures the CDK's `BreakpointObserver` and uses it with Material's `MatSideNav` and `MatToolbar` components.

You can create and include the following kinds of schematics.

* Include an installation schematic so that `ng add` can add your library to a project.

* Include generation schematics in your library so that `ng generate` can scaffold your defined artifacts (components, services, tests, and so on) in a project.

* Include an update schematic so that `ng update` can update your library’s dependencies and provide migrations for breaking changes in new releases.

What you include in your library depends on your task.
For example, you could define a schematic to create a dropdown that is pre-populated with canned data to show how to add it to an app.
If you want a dropdown that would contain different passed-in values each time, your library could define a schematic to create it with a given configuration. Developers could then use `ng generate` to configure an instance for their own app.

Suppose you want to read a configuration file and then generate a form based on that configuration.
If that form will need additional customization by the developer who is using your library, it might work best as a schematic.
However, if the form will always be the same and not need much customization by developers, then you could create a dynamic component that takes the configuration and generates the form.
In general, the more complex the customization, the more useful the schematic approach.

To learn more, see [Schematics Overview](guide/schematics) and [Schematics for Libraries](guide/schematics-for-libraries).
-->
A library typically includes *reusable code* that defines components, services, and other Angular artifacts (pipes, directives, and so on) that you simply import into a project.
A library is packaged into an npm package for publishing and sharing.
This package can also include [schematics](guide/glossary#schematic) that provide instructions for generating or transforming code directly in your project, in the same way that the CLI creates a generic new component with `ng generate component`.
A schematic that is packaged with a library can, for example, provide the Angular CLI with the information it needs to generate a component that configures and uses a particular feature, or set of features, defined in that library.
One example of this is Angular Material's navigation schematic which configures the CDK's `BreakpointObserver` and uses it with Material's `MatSideNav` and `MatToolbar` components.

[스키매틱](guide/glossary#schematic)은 Angular CLI를 확장할 수 있습니다.

* 설치방법이 스키매틱으로 제공된다면 `ng add` 명령으로 프로젝트에 라이브러리를 추가할 수 있습니다.

* 구성요소를 생성하는 스키매틱을 제공한다면 `ng generate` 명령으로 생성할 수 있는 목록을 확장할 수 있습니다.

* 업데이트 스키매틱을 제공한다면 `ng update` 명령으로 라이브러리를 업데이트하면서 관련 라이브러리도 함께 업데이트할 수 있습니다. 새로운 버전을 도입하면서 수정해야 하는 코드도 자동으로 처리할 수 있습니다.

What you include in your library depends on your task.
For example, you could define a schematic to create a dropdown that is pre-populated with canned data to show how to add it to an app.
If you want a dropdown that would contain different passed-in values each time, your library could define a schematic to create it with a given configuration. Developers could then use `ng generate` to configure an instance for their own app.

Suppose you want to read a configuration file and then generate a form based on that configuration.
If that form will need additional customization by the developer who is using your library, it might work best as a schematic.
However, if the form will always be the same and not need much customization by developers, then you could create a dynamic component that takes the configuration and generates the form.
In general, the more complex the customization, the more useful the schematic approach.

더 자세한 내용은 [스키매틱 개요](guide/schematics) 문서나 [라이브러리용 스키매틱](guide/schematics-for-libraries) 문서를 참고하세요.



{@a publishing-your-library}

<!--
## Publishing your library
-->
## 배포하기

<!--
Use the Angular CLI and the npm package manager to build and publish your library as an npm package.

Before publishing a library to NPM, build it using the `--prod` flag which will use the older compiler and runtime known as View Engine instead of Ivy.

<code-example language="bash">
ng build my-lib --prod
cd dist/my-lib
npm publish
</code-example>

If you've never published a package in npm before, you must create a user account. Read more in [Publishing npm Packages](https://docs.npmjs.com/getting-started/publishing-npm-packages).

<div class="alert is-important">

For now, it is not recommended to publish Ivy libraries to NPM because Ivy generated code is not backward compatible with View Engine, so apps using View Engine will not be able to consume them. Furthermore, the internal Ivy instructions are not yet stable, which can potentially break consumers using a different Angular version from the one used to build the library.

When a published library is used in an Ivy app, the Angular CLI will automatically convert it to Ivy using a tool known as the Angular compatibility compiler (`ngcc`). Thus, publishing your libraries using the View Engine compiler ensures that they can be transparently consumed by both View Engine and Ivy apps.

</div>
-->
라이브러리는 Angular CLI와 npm 패키지 매니저를 사용해서 빌드하고 배포할 수 있습니다.

Ivy를 활용하는 라이브러리는 NPM에 빌드하기 전에 먼저 `--prod` 옵션을 줘서 빌드해야 Ivy 이전 버전인 View Engine에서 동작할 수 있습니다.

<code-example language="bash">
ng build my-lib --prod
cd dist/my-lib
npm publish
</code-example>

이전에 npm 저장소에 배포해본 적이 없다면 계정을 먼저 만들어야 합니다.
자세한 내용은 [npm 패키지 배포하기](https://docs.npmjs.com/getting-started/publishing-npm-packages) 문서를 참고하세요.

<div class="alert is-important">

For now, it is not recommended to publish Ivy libraries to NPM because Ivy generated code is not backward compatible with View Engine, so apps using View Engine will not be able to consume them. Furthermore, the internal Ivy instructions are not yet stable, which can potentially break consumers using a different Angular version from the one used to build the library.

When a published library is used in an Ivy app, the Angular CLI will automatically convert it to Ivy using a tool known as the Angular compatibility compiler (`ngcc`). Thus, by publishing your libraries using the View Engine compiler ensures that they can be transparently consumed by both View Engine and Ivy apps.

</div>

{@a lib-assets}

## Managing assets in a library

Starting with version 9.x of the [ng-packagr](https://github.com/ng-packagr/ng-packagr/blob/master/README.md) tool, you can configure the tool to automatically copy assets into your library package as part of the build process.
You can use this feature when your library needs to publish optional theming files, Sass mixins, or documentation (like a changelog).

* Learn how to [copy assets into your library as part of the build](https://github.com/ng-packagr/ng-packagr/blob/master/docs/copy-assets.md).

* Learn more about how to use the tool to [embed assets in CSS](https://github.com/ng-packagr/ng-packagr/blob/master/docs/embed-assets-css.md).



<!--
## Linked libraries
-->
## 라이브러리 링크

<!--
While working on a published library, you can use [npm link](https://docs.npmjs.com/cli/link) to avoid reinstalling the library on every build.

The library must be rebuilt on every change.
When linking a library, make sure that the build step runs in watch mode, and that the library's `package.json` configuration points at the correct entry points.
For example, `main` should point at a JavaScript file, not a TypeScript file.
-->
이미 배포한 라이브러리를 수정하고 있는데, 새로 라이브러리를 빌드할 때마다 다시 설치해야 하는 상황을 피하려면 [npm link](https://docs.npmjs.com/cli/link) 기능을 활용하는 것도 좋습니다.

이 기능을 활용하면 라이브러리 코드가 변경되었을 때 반드시 라이브러리를 다시 빌드해야 합니다.
그래서 워치 모드로 빌드하는 것이 편하며, 라이브러리의 `package.json` 파일의 진입점이 제대로 설정되어 있어야 합니다.
`main`으로 지정하는 파일은 TypeScript 파일이 아니라 JavaScript 파일이어야 합니다.


<!--
### Use TypeScript path mapping for peer dependencies
-->
### 의존 관계에 있는 라이브러리를 위해 TypeScript 경로 연결하기

<!--
Angular libraries should list all `@angular/*` dependencies as peer dependencies.
This ensures that when modules ask for Angular, they all get the exact same module.
If a library lists `@angular/core` in `dependencies` instead of `peerDependencies`, it might get a different Angular module instead, which would cause your application to break.

While developing a library, you must install all peer dependencies through `devDependencies` to ensure that the library compiles properly.
A linked library will then have its own set of Angular libraries that it uses for building, located in its `node_modules` folder.
However, this can cause problems while building or running your application.

To get around this problem you can use TypeScript path mapping to tell TypeScript that it should load some modules from a specific location.
List all the peer dependencies that your library uses in the workspace TypeScript configuration file `./tsconfig.json`, and point them at the local copy in the app's `node_modules` folder.

```
{
  "compilerOptions": {
    // ...
    // paths are relative to `baseUrl` path.
    "paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
    }
  }
}
```

This mapping ensures that your library always loads the local copies of the modules it needs.
-->
Angular 라이브러리에서 `@angular/*` 패키지를 의존 라이브러리로 등록한다면 상호 의존 관계(peer dependencies)로 등록해야 Angular 모듈을 제대로 참조할 수 있습니다.
그리고 `@angular/core`를 `peerDependencies`가 아니라 `dependencies`에 지정하면 Angular 모듈이 아닌 다른 모듈을 참조하기 때문에 애플리케이션이 제대로 동작하지 않습니다.

라이브러리를 개발하는 중이라면 관련 라이브러리를 `devDependencies`에 등록해야 문제없이 컴파일할 수 있습니다.
그리고 라이브러리를 링크해서 사용한다면 해당 라이브러리의 `node_modules` 폴더에 Angular 라이브러리들도 제대로 설치되어 있어야 합니다.
하지만 이렇게 사용하면 애플리케이션을 빌드하거나 실행할 때 에러가 발생합니다.

문제를 해결하려면 특정 위치에 있는 모듈을 정확하게 지정하도록 TypeScript 패스를 연결하면 됩니다.
사용하는 모든 라이브러리들을 TypeScript 환경설정 파일 `.tsconfig.json`에 추가하고 이 라이브러리의 각 위치를 `node_modules` 폴더 안에서 지정해주면 됩니다.

```
{
  "compilerOptions": {
    // ...
    // 이 때 지정하는 경로는 `baseUrl`을 기준으로 하는 상대주소입니다.
    "paths": {
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
    }
  }
}
```

이렇게 작성하면 라이브러리에 필요한 추가 라이브러리의 위치를 제대로 찾을 수 있습니다.


<!--
## Using your own library in apps
-->
## 로컬 환경에 활용하기

<!--
You don't have to publish your library to the npm package manager in order to use it in your own apps, but you do have to build it first.

To use your own library in an app:

* Build the library. You cannot use a library before it is built.
 <code-example language="bash">
 ng build my-lib
 </code-example>

* In your apps, import from the library by name:
 ```
 import { myExport } from 'my-lib';
 ```
-->
로컬 환경에 있는 앱에 사용하는 것이 목적이라면 굳이 라이브러리를 배포할 필요가 없습니다.
하지만 빌드는 해야 합니다.

라이브러리를 로컬에 있는 앱에 사용하려면:

* 라이브러리를 빌드합니다. 라이브러리는 빌드해야 사용할 수 있습니다.
 <code-example language="bash">
 ng build my-lib
 </code-example>

* 앱에서 다음과 같이 라이브러리를 로드합니다:
 ```
 import { myExport } from 'my-lib';
 ```


<!--
### Building and rebuilding your library
-->
### 라이브러리 빌드/재빌드하기

<!--
The build step is important if you haven't published your library as an npm package and then installed the package back into your app from npm.
For instance, if you clone your git repository and run `npm install`, your editor will show the `my-lib` imports as missing if you haven't yet built your library.
-->
직접 만든 라이브러리를 애플리케이션에 활용하려면 npm 패키지로 배포해야 하는데, npm 패키지로 배포하려면 빌드를 해야하기 때문에 빌드 과정은 아주 중요합니다.
라이브러리를 제대로 빌드하지 않으면 `npm install` 명령으로 라이브러리를 설치했다고 해도 `my-lib`와 같은 심볼을 찾을 수 없기 때문에 에러가 발생할 수 있습니다.

<div class="alert is-helpful">

<!--
When you import something from a library in an Angular app, Angular looks for a mapping between the library name and a location on disk.
When you install a library package, the mapping is in the `node_modules` folder. When you build your own library, it has to find the mapping in your `tsconfig` paths.

Generating a library with the Angular CLI automatically adds its path to the `tsconfig` file.
The Angular CLI uses the `tsconfig` paths to tell the build system where to find the library.
-->
Angular 앱에서 라이브러리 심볼을 로드하면 Angular가 디스크에서 라이브러리를 찾습니다.
이 라이브러리가 패키지로 설치되었다면 `node_modules` 폴더를 찾을 것이고 로컬에서 빌드하고 옮겼다면 `tsconfig`에 있는 경로를 찾습니다.

Angular CLI로 라이브러리를 생성하면 `tsconfig` 파일에 자동으로 이 라이브러리의 경로를 추가하기 때문에 빌드 시스템도 바로 동작합니다.

</div>

<!--
If you find that changes to your library are not reflected in your app, your app is probably using an old build of the library.

You can rebuild your library whenever you make changes to it, but this extra step takes time.
*Incremental builds* functionality improves the library-development experience.
Every time a file is changed a partial build is performed that emits the amended files.

Incremental builds can be run as a background process in your dev environment. To take advantage of this feature add the `--watch` flag to the build command:
-->
라이브러리에서 수정한 내용이 앱에 반영되지 않는다면 이전에 빌드한 라이브러리를 사용한 것이 원인일 수 있습니다.

그러면 라이브러리를 다시 빌드해도 되지만 이 과정은 시간이 조금 걸립니다.
이 때 *증분 빌드(incremental builds)*를 활용하면 라이브러리를 더 효율적으로 개발할 수 있습니다.
이 방식을 활용하면 파일이 변경되었을 때 그 파일만 빌드해서 즉시 반영할 수 있습니다.

라이브러리를 빌드할 때 `--watch` 옵션을 사용하면 백그라운드에서 증분 빌드가 계속 실행됩니다.

<code-example language="bash">
ng build my-lib --watch
</code-example>

<div class="alert is-important">

<!--
The CLI `build` command uses a different builder and invokes a different build tool for libraries than it does for applications.

* The build system for apps, `@angular-devkit/build-angular`, is based on `webpack`, and is included in all new Angular CLI projects.
* The build system for libraries is based on `ng-packagr`. It is only added to your dependencies when you add a library using `ng generate library my-lib`.

The two build systems support different things, and even where they support the same things, they do those things differently.
This means that the TypeScript source can result in different JavaScript code in a built library than it would in a built application.

For this reason, an app that depends on a library should only use TypeScript path mappings that point to the *built library*.
TypeScript path mappings should *not* point to the library source `.ts` files.
-->
애플리케이션을 빌드할 때나 라이브러리를 빌드할 때는 모두 Angular CLI `build` 명령을 사용하지만 두 경우에 사용되는 빌더와 빌드 툴은 조금 다릅니다.

* 앱을 빌드할 때는 `webpack`을 기반으로 만들어진 `@angular-devkit/build-angular`가 사용됩니다. Angular CLI로 프로젝트를 생성했다면 이 패키지는 언제나 존재합니다.

* 라이브러리를 빌드할 때는 `ng-packagr`가 사용됩니다. 이 패키지는 `ng generate library my-lib`와 같이 라이브러리 프로젝트를 생성했을 때만 존재합니다.

두 빌드 시스템은 지원하는 내용이 다르며, 같은 내용을 지원한다고 해도 지원하는 방식이 조금 다릅니다.
그래서 같은 TypeScript 코드를 빌드했더라도 애플리케이션용으로 빌드하는 것과 라이브러리용으로 빌드한 것은 다를 수 있습니다.

그래서 앱이 제대로 동작하려면 TypeScript 패스 연결 기능을 활용해서 *이미 빌드 된* 라이브러리를 정확하게 지정해야 합니다.
라이브러리 소스 파일 `.ts`을 직접 지정하면 *안됩니다*.

</div>
