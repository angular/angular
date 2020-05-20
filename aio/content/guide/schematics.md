<!--
# Schematics
-->
# 스키매틱(Schematics)

<!--
A schematic is a template-based code generator that supports complex logic.
It is a set of instructions for transforming a software project by generating or modifying code.
Schematics are packaged into [collections](guide/glossary#collection) and installed with npm.

The schematic collection can be a powerful tool for creating, modifying, and maintaining any software project, but is particularly useful for customizing Angular projects to suit the particular needs of your own organization.
You might use schematics, for example, to generate commonly-used UI patterns or specific components, using predefined templates or layouts.
You can use schematics to enforce architectural rules and conventions, making your projects consistent and inter-operative.
-->
스키매틱은 복잡한 로직을 쉽게 작성할 수 있도록 미리 템플릿을 정의해두고 이 템플릿을 바탕으로 코드를 생성하는 툴을 의미합니다.
그래서 이 스키매틱을 잘 활용하면 프로젝트에 수많은 기능을 편하게 추가할 수 있습니다.
스키매틱은 [컬렉션(collections)](guide/glossary#collection)으로 패키징되며 npm에 배포되어 있는 스키매틱 패키지를 설치해서 사용할 수도 있습니다.

스키매틱 콜렉션은 프로젝트를 생성하고 관리하는 관점에서 아주 강력한 툴이 될 수 있으며, 특히 회사 업무에 필요한 대로 Angular 프로젝트를 커스터마이징하는 측면에서 유용합니다.
개발하고 있는 앱에 어떤 UI 패턴이나 컴포넌트 조합, 정해진 형식의 템플릿이 자주 사용된다면 이 구성을 스키매틱으로 정의했다가 나중에 다시 사용하는 것도 효율적일 수 있습니다.
스키매틱을 사용하면 처음 설계된 구조나 코딩 컨벤션을 강제할 수 있다는 측면에서도 도움이 됩니다. 프로젝트 유지보수는 물론이고 팀끼리 하는 의사소통도 편해질 것입니다.


<!--
## Schematics for the Angular CLI
-->
## Angular CLI를 위한 스키매틱

<!--
Schematics are part of the Angular ecosystem. The [Angular CLI](guide/glossary#cli)  uses schematics to apply transforms to a web-app project.
You can modify these schematics, and define new ones to do things like update your code to fix breaking changes in a dependency, for example, or to add a new configuration option or framework to an existing project.

Schematics that are included in the `@schematics/angular` collection are run by default by the commands `ng generate` and `ng add`.
The package contains named schematics that configure the options that are available to the CLI for `ng generate` sub-commands, such as `ng generate component` and `ng generate service`.
The subcommands for `ng generate` are shorthand for the corresponding schematic. You can specify a particular schematic (or collection of schematics) to generate, using the long form:

<code-example language="bash">
ng generate my-schematic-collection:my-schematic-name
</code-example>

or

<code-example language="bash">
ng generate my-schematic-name --collection collection-name
</code-example>
-->
스키매틱은 Angular 생태계의 일부를 담당하는데, [Angular CLI](guide/glossary#cli)는 이 스키매틱을 사용해서 프로젝트 코드를 직접 수정하기도 합니다.
Angular CLI에 사용되는 스키매틱은 개발자가 원하는 대로 수정할 수 있으며 필요하면 새로 만들어서 사용해도 됩니다.

`ng generate`나 `ng add` 명령을 실행할 때 사용되는 스키매틱들은 모두 `@schematics/angular` 콜렉션이 제공하는 것입니다.
이 패키지는 `ng generate component`나 `ng generate service`와 같이 `ng generate`로 만들 수 있는 서브 명령과 옵션을 스키매틱 형태로 제공합니다.
결국 스키매틱을 직접 사용하는 대신 `ng generate` 형태로 사용하는 것입니다.
이 때 특정 스키매틱이나 스키매틱 콜렉션을 직접 지정할 수도 있습니다:


<code-example language="bash">
ng generate 콜렉션-이름:스키매틱-이름
</code-example>

또는

<code-example language="bash">
ng generate 스키매틱-이름 --collection 콜렉션-이름
</code-example>


<!--
### Configuring CLI schematics
-->
### Angular CLI용 스키매틱 설정하기

<!--
A JSON schema associated with a schematic tells the Angular CLI what options are available to commands and subcommands, and determines the defaults.
These defaults can be overridden by providing a different value for an option on the command line.
See [Workspace Configuration](guide/workspace-config) for information about how you can change the generation option defaults for your workspace.

The JSON schemas for the default schematics used by the CLI to generate projects and parts of projects are collected in the package [`@schematics/angular`](https://raw.githubusercontent.com/angular/angular-cli/v7.0.0/packages/schematics/angular/application/schema.json).
The schema describes the options available to the CLI for each of the `ng generate` sub-commands, as shown in the `--help` output.
-->
Angular CLI에 사용할 수 있는 명령과 서브 명령, 옵션, 옵션의 기본값은 모두 JSON 스키마 형태로 정의되어 있습니다.
워크스페이스에서 사용할 기본 옵션을 변경하려면 [워크스페이스 환경설정](guide/workspace-config) 문서를 참고하세요.

Angular CLI로 프로젝트를 생성할 때 사용하는 기본 스키매틱의 JSON 스키마는 [`@schematics/angular`](https://raw.githubusercontent.com/angular/angular-cli/v7.0.0/packages/schematics/angular/application/schema.json) 패키지에 존재합니다.
그리고 `ng generate`와 같은 서브 명령을 실행할 때 어떤 옵션을 사용할 수 있는지 알아보려면 `--help` 옵션을 붙여서 실행하면 됩니다.


<!--
## Developing schematics for libraries
-->
## 라이브러리용 스키매틱 개발하기

<!--
As a library developer, you can create your own collections of custom schematics to integrate your library with the Angular CLI.

* An *add schematic* allows developers to install your library in an Angular workspace using `ng add`.

* *Generation schematics* can tell the `ng generate` subcommands how to modify projects, add configurations and scripts, and scaffold artifacts that are defined in your library.

* An *update schematic* can tell the `ng update` command how to update your library's dependencies and adjust for breaking changes when you release a new version.

For more details of what these look like and how to create them, see:
* [Authoring Schematics](guide/schematics-authoring)
* [Schematics for Libraries](guide/schematics-for-libraries)
-->
라이브러리에 커스텀 스키매틱을 정의하면 Angular CLI의 기능을 확장할 수 있습니다.

* *추가(add) 스키매틱*을 정의하면 `ng add` 명령을 사용해서 Angular 워크스페이스에 라이브러리를 설치할 수 있습니다.

* *생성(generation) 스키매틱*을 정의하면 `ng generate` 서브 명령을 사용해서 라이브러리가 제공하는 Angular 구성요소를 자동으로 생성할 수 있습니다. 프로젝트 파일이나 환경설정 파일, 스크립트 파일을 수정해야 한다면 이 과정도 자동으로 처리할 수 있습니다.

* *업데이트(update) 스키매틱*을 정의하면 `ng update` 명령을 사용해서 라이브러리를 업데이트할 때 관련 라이브러리를 함께 업데이트 할 수 있고, 새 버전때문에 수정해야 하는 작업도 자동으로 처리할 수 있습니다.

스키매틱을 정의하는 방법에 대해 더 알아보려면 다음 문서를 참고하세요:
* [스키매틱 만들기](guide/schematics-authoring)
* [라이브러리용 스키매틱](guide/schematics-for-libraries)


<!--
### Add schematics
-->
### 추가(add) 스키매틱

<!--
An add schematic is typically supplied with a library, so that the library can be added to an existing project with `ng add`.
The `add` command uses your package manager to download new dependencies, and invokes an installation script that is implemented as a schematic.

For example, the [`@angular/material`](https://material.angular.io/guide/schematics) schematic tells the `add` command to install and set up Angular Material and theming, and register new starter components that can be created with `ng generate`.
You can look at this one as an example and model for your own add schematic.

Partner and third party libraries also support the Angular CLI with add schematics.
For example, `@ng-bootstrap/schematics` adds [ng-bootstrap](https://ng-bootstrap.github.io/)  to an app, and  `@clr/angular` installs and sets up [Clarity from VMWare](https://vmware.github.io/clarity/documentation/v1.0/get-started).

An add schematic can also update a project with configuration changes, add additional dependencies (such as polyfills), or scaffold package-specific initialization code.
For example, the `@angular/pwa` schematic turns your application into a PWA by adding an app manifest and service worker, and the `@angular/elements`  schematic adds the `document-register-element.js` polyfill and dependencies for Angular Elements.
-->
라이브러리에 추가 스키매틱이 정의되어 있다면 `ng add` 명령으로 이 라이브러리를 설치하고 추가로 필요한 작업을 자동으로 할 수 있습니다.
Angular 라이브러리가 제공하는 스키매틱 중에서는 추가 스키매틱이 가장 많습니다.
`ng add` 명령을 실행하면 패키지 매니저가 새로운 패키지를 설치한 후에 스키매틱에 정의된 설치 스크립트를 실행합니다.

[`@angular/material`](https://material.angular.io/guide/schematics)을 예로 들어 봅시다.
이 패키지를 `ng add` 명령으로 설치하면 Angular Material 패키지가 설치된 후에 매터리얼 테마가 자동으로 구성되고, `ng generate`로 생성할 수 있는 컴포넌트의 종류가 늘어납니다.
이 방식이 추가 스키매틱을 활용하는 전형적인 패턴이라고 할 수 있습니다.

Angular의 파트너나 유명 서드파티가 제공하는 라이브러리는 보통 Angular CLI용 추가 스키매틱을 제공합니다.
[ng-bootstrap](https://ng-bootstrap.github.io/)이 제공하는 `@ng-bootstrap/schematics`가 그렇고 [VMWare Clarity](https://vmware.github.io/clarity/documentation/v1.0/get-started)가 제공하는 `@clr/angular`가 그렇습니다.

추가 스키매틱은 프로젝트 코드를 직접 수정하는 경우가 있습니다.
추가 의존성 패키지를 설치하거나 폴리필을 추가하고 패키지 초기화 코드를 실행하는 경우가 그렇습니다.
애플리케이션을 PWA로 전환하기 위해 `@angular/pwa` 패키지를 추가하면 앱에 매니페스트 파일과 서비스 워커를 자동으로 추가하며, `@angular/elements` 패키지를 설치하면 Angular Element용 폴리필 파일 `document-register-element.js` 파일을 자동으로 생성합니다.

<!--
### Generation schematics
-->
### 생성(generation) 스키매틱

<!--
Generation schematics are instructions for the `ng generate` command.
The documented sub-commands use the default Angular generation schematics, but you can specify a different schematic (in place of a sub-command) to generate an artifact defined in your library.

Angular Material, for example, supplies generation schematics for the UI components that it defines.
The following command uses one of these schematics to render an Angular Material `<mat-table>` that is pre-configured with a datasource for sorting and pagination.
-->
생성 스키매틱은 `ng generate` 명령을 확장하는 스키매틱입니다.
Angular CLI가 `ng generate` 명령으로 생성할 수 있는 목록도 스키매틱으로 제공되는 것이며, 라이브러리가 제공하는 Angular 구성요소를 여기에 추가하면 라이브러리의 활용도를 더 높일 수 있습니다.

Angular Material도 매터리얼로 생성할 수 있는 UI 컴포넌트를 생성 스키매틱으로 제공합니다.
그래서 정렬과 페이지네이션 기능이 미리 구성되어 있는 Angular Materail `<mat-table>`을 생성하려면 다음 명령 하나만 실행하면 됩니다:

<code-example language="bash">
ng generate @angular/material:table <component-name>
</code-example>


<!--
### Update schematics
-->
### 업데이트(update) 스키매틱

<!--
 The `ng update` command can be used to update your workspace's library dependencies. If you supply no options or use the help option, the command examines your workspace and suggests libraries to update.
-->
`ng update` 명령은 워크스페이스에 있는 라이브러리를 업데이트할 때 사용합니다.
이 명령을 실행할 때 라이브러리를 지정하지 않거나 `--help` 옵션을 붙이지 않으면 다음과 같이 권장 업데이트 목록이 표시됩니다.

<code-example language="bash">
ng update
    We analyzed your package.json, there are some packages to update:

      Name                               Version                  Command to update
     --------------------------------------------------------------------------------
      @angular/cdk                       7.2.2 -> 7.3.1           ng update @angular/cdk
      @angular/cli                       7.2.3 -> 7.3.0           ng update @angular/cli
      @angular/core                      7.2.2 -> 7.2.3           ng update @angular/core
      @angular/material                  7.2.2 -> 7.3.1           ng update @angular/material
      rxjs                               6.3.3 -> 6.4.0           ng update rxjs


    There might be additional packages that are outdated.
    Run "ng update --all" to try to update all at the same time.
</code-example>

<!--
If you pass the command a set of libraries to update (or the `--all` flag), it updates those libraries, their peer dependencies, and the peer dependencies that depend on them.
-->
그리고 `ng update` 명령을 실행하면서 라이브러리 목록이나 `--all` 플래그를 붙이면 해당 라이브러리를 업데이트하면서 관련 라이브러리도 모두 함께 업데이트합니다.

<div class="alert is-helpful">

<!--
If there are inconsistencies (for example, if peer dependencies cannot be matched by a simple [semver](https://semver.io/) range), the command generates an error and does not change anything in the workspace.

We recommend that you do not force an update of all dependencies by default. Try updating specific dependencies first.

For more about how the `ng update` command works, see [Update Command](https://github.com/angular/angular-cli/blob/master/docs/specifications/update.md).
-->
관련 라이브러리가 [semver](https://semver.io/) 범위 문제로 호환되지 않으면 에러가 발생하면서 워크스페이스도 그대로 유지됩니다.

이 경우에 `--force=true` 옵션을 사용해서 해당 라이브러리를 강제 업데이트할 수도 있지만 권장하지 않습니다.
의존 관계에 있는 라이브러리를 수동으로 하나씩 업데이트하는 것이 좋습니다.

`ng update` 명령에 대해 더 자세하게 알아보려면 [update 명령](https://github.com/angular/angular-cli/blob/master/docs/specifications/update.md) 문서를 참고하세요.

</div>

<!--
If you create a new version of your library that introduces potential breaking changes, you can provide an *update schematic* to enable the `ng update` command to automatically resolve any such changes in the project being updated.

For example, suppose you want to update the Angular Material library.
-->
라이브러리의 새 버전을 준비하고 있는데 이 버전을 도입하려면 코드를 많이 변경해야 한다고 합시다.
그러면 *업데이트 스키매틱*을 실행하면서 프로젝트에 있는 코드를 자동으로 수정하게 할 수 있습니다.

Angular Material 라이브러리는 다음과 같이 업데이트할 수 있습니다.

<code-example language="bash">
ng update @angular/material
</code-example>

<!--
This command updates both `@angular/material` and its dependency `@angular/cdk` in your workspace's `package.json`.
If either package contains an update schematic that covers migration from the existing version to a new version, the command runs that schematic on your workspace.
-->
이 명령을 실행하면 `@angular/material`의 관련 라이브러리인 `@angular/cdk`도 함께 업데이트되며 워크스페이스 `package.json` 파일도 자동으로 수정됩니다.
그리고 두 패키지에서 코드 마이그레이션을 위해 미리 정의된 업데이트 스키매틱이 자동으로 실행되면서 워크스페이스에 있는 코드를 자동으로 수정하기도 합니다.