<!--
# Setting up the local environment and workspace
-->
# 로컬 개발환경, 워크스페이스 설정하기


<!--
This guide explains how to set up your environment for Angular development using the [Angular CLI tool](cli "CLI command reference").
It includes information about prerequisites, installing the CLI, creating an initial workspace and starter app, and running that app locally to verify your setup.


<div class="callout is-helpful">
<header>Try Angular without local setup</header>

If you are new to Angular, you might want to start with [Try it now!](start), which introduces the essentials of Angular in the context of a ready-made basic online store app that you can examine and modify. This standalone tutorial takes advantage of the interactive [StackBlitz](https://stackblitz.com/) environment for online development. You don't need to set up your local environment until you're ready.

</div>
-->
이 문서는 [Angular CLI 툴](cli "CLI command reference")을 실행할 수 있는 Angular 개발환경을 어떻게 설정하는지 설명합니다.
사전지식, Angular CLI를 설치하는 방법, 워크스페이스와 애플리케이션을 생성하는 방법, 앱을 로컬 환경에서 실행하는 방법에 대해 알아봅시다.


<div class="callout is-helpful">
<header>로컬 환경설정 없이 Angular 사용해보기</header>

Angular를 처음 접하는 개발자라면 [지금 사용해보기!](start) 문서로 이동해서 내용을 살펴보는 것도 좋습니다.
이 문서는 간단한 온라인 스토어 앱을 보면서 Angular의 기본 개념에 대해 알아보며, 원하는 대로 수정하는 방법도 설명합니다.
이때 활용하는 예제 애플리케이션은 [StackBlitz](https://stackblitz.com/) 환경을 활용하기 때문에 온라인에서 동작합니다.
로컬 환경을 구성할 필요가 없습니다.

</div>


{@a devenv}
{@a prerequisites}
<!--
## Prerequisites
-->
## 사전지식

<!--
To use the Angular framework, you should be familiar with the following:

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
* [HTML](https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML)
* [CSS](https://developer.mozilla.org/docs/Learn/CSS/First_steps)

Knowledge of [TypeScript](https://www.typescriptlang.org/) is helpful, but not required.

To install Angular on your local system, you need the following:

{@a nodejs}

* **Node.js**
  
  Angular requires a [current, active LTS, or maintenance LTS](https://nodejs.org/about/releases) version of Node.js.

  <div class="alert is-helpful">

  For information about specific version requirements, see the `engines` key in the [package.json](https://unpkg.com/@angular/cli/package.json) file.

  </div>

  For more information on installing Node.js, see [nodejs.org](http://nodejs.org "Nodejs.org").
  If you are unsure what version of Node.js runs on your system, run `node -v` in a terminal window.

{@a npm}

* **npm package manager**

  Angular, the Angular CLI, and Angular applications depend on [npm packages](https://docs.npmjs.com/getting-started/what-is-npm) for many features and functions.
  To download and install npm packages, you need an npm package manager.
  This guide uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default.
  To check that you have the npm client installed, run `npm -v` in a terminal window.
-->
Angular 프레임워크를 사용하려면 다음 내용을 미리 알고 있어야 합니다:

* [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript)
* [HTML](https://developer.mozilla.org/docs/Learn/HTML/Introduction_to_HTML)
* [CSS](https://developer.mozilla.org/docs/Learn/CSS/First_steps)

[TypeScript](https://www.typescriptlang.org/)를 알고 있다면 도움이 되지만 꼭 필요한 것은 아닙니다.

Angular를 로컬 환경에 설치하려면 이런 것들이 필요합니다:

{@a nodejs}

* **Node.js**
  
  Angular를 실행하려면 [최신 버전이거나, 현재 활성 LTS 버전이거나 유지보수 중인 LTS 버전](https://nodejs.org/about/releases)의 Node.js가 필요합니다.

  <div class="alert is-helpful">

  정확히 어떤 버전이 필요한지 확인하려면 [package.json](https://unpkg.com/@angular/cli/package.json) 파일의 `engines` 필드를 확인해 보세요.

  </div>

  Node.js 설치방법을 확인하려면 [nodejs.org](http://nodejs.org "Nodejs.org")를 참고하세요.
  시스템에 설치된 Node.js 버전을 확인하려면 터미널에서 `node -v` 명령을 실행하면 됩니다.

{@a npm}

* **npm 패키지 매니저**

  Angular, Angular CLI, Angular 애플리케이션은 모두 [npm 패키지](https://docs.npmjs.com/getting-started/what-is-npm)를 활용하는 방식으로 동작합니다.
  그래서 npm 패키지를 다운받기 위해 npm 패키지 매니저가 필요합니다.
  이 가이드 문서에서는 [npm 클라이언트](https://docs.npmjs.com/cli/install) 커맨드라인 인터페이스를 사용하는데, 이 툴은 Node.js를 설치할 때 함께 설치됩니다.
  npm이 설치되었는지 확인하려면 터미널에서 `npm -v` 명령을 실행하면 됩니다.




{@a install-cli}

<!--
## Install the Angular CLI
-->
## Angular CLI 설치하기

<!--
You use the Angular CLI to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

To install the Angular CLI, open a terminal window and run the following command:
-->
Angular CLI를 활용하면 프로젝트나 애플리케이션, 라이브러리를 생성할 수 있고 개발 단계에 필요한 테스트, 번들링, 배포 과정을 간편하게 처리할 수 있습니다.

Angular CLI를 설치하려면 터미널에서 다음 명령을 실행하면 됩니다:

<code-example language="sh" class="code-shell">
  npm install -g @angular/cli
</code-example>

{@a create-proj}

<!--
## Create a workspace and initial application
-->
## 워크스페이스, 기본 애플리케이션 생성하기

<!--
You develop apps in the context of an Angular [**workspace**](guide/glossary#workspace).

To create a new workspace and initial starter app:

1. Run the CLI command `ng new` and provide the name `my-app`, as shown here:

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

2. The `ng new` command prompts you for information about features to include in the initial app. Accept the defaults by pressing the Enter or Return key.

The Angular CLI installs the necessary Angular npm packages and other dependencies. This can take a few minutes.

The CLI creates a new workspace and a simple Welcome app, ready to run.

<div class="alert is-helpful">

You also have the option to use Angular's strict mode, which can help you write better, more maintainable code.
For more information, see [Strict mode](/guide/strict-mode).
-->
애플리케이션은 Angular [**워크스페이스**](guide/glossary#workspace) 영역에서 개발합니다.

새 워크스페이스를 생성하면서 기본 애플리케이션도 함께 생성하려면 다음 순서대로 진행하면 됩니다:

1. Angular CLI로 `ng new` 명령을 실행하면서 `my-app`을 이름으로 지정합니다:

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

2. `ng new` 명령을 실행하면 앱을 생성하기 위해 필요한 정보를 추가로 입력받습니다. 이 때 엔터키를 입력하면 기본값으로 애플리케이션을 생성합니다.

그러고 나면 Angular CLI가 앱 실행에 필요한 Angular npm 패키지를 설치합니다. 이 과정은 몇 분 정도 걸립니다.

npm 패키지가 설치되고 나면 바로 실행할 수 있는 상태로 워크스페이스와 기본 앱이 구성됩니다.

<div class="alert is-helpful">

Angular 애플리케이션에 엄격한 모드를 적용하면 유지관리 측면에서 더 좋은 애플리케이션 코드를 작성할 수 있습니다.
자세한 내용은 [엄격한 모드](guide/strict-mode) 문서를 참고하세요.

</div>

{@a serve}

<!--
## Run the application
-->
## 애플리케이션 실행하기

<!--
The Angular CLI includes a server, so that you can build and serve your app locally.

1. Navigate to the workspace folder, such as `my-app`.

1. Run the following command:

<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>

The `ng serve` command launches the server, watches your files,
and rebuilds the app as you make changes to those files.

The `--open` (or just `-o`) option automatically opens your browser
to `http://localhost:4200/`.

If your installation and setup was successful, you should see a page similar to the following.
-->
Angular CLI는 서버 기능을 내장하고 있기 때문에 로컬 환경에서 앱을 빌드하고 서비스할 수 있습니다.

1. 워크스페이스 폴더로 이동합니다. 이 문서에서는 `my-app` 폴더입니다.

1. `ng serve` 명령을 실행합니다:

<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>

`ng serve` 명령을 실행하면 서버가 실행되며 애플리케이션 코드가 변경되는 것을 감지하고 그때마다 앱을 다시 빌드해서 서비스합니다.

그리고 `--open` 옵션(또는 `-o`)을 붙이면 앱을 빌드한 후에 브라우저가 자동으로 실행되면서 `http://localhost:4200/` 주소로 접속합니다.

이 문서에서 설명한 과정을 그대로 따라왔다면 다음과 같은 화면을 볼 수 있습니다.

<div class="lightbox">
  <img src='generated/images/guide/setup-local/app-works.png' alt="Welcome to my-app!">
</div>


<!--
## Next steps
-->
## 다음 단계

<!--
* For a more thorough introduction to the fundamental concepts and terminology of Angular single-page app architecture and design principles, read the [Angular Concepts](guide/architecture) section.

* Work through the [Tour of Heroes Tutorial](tutorial), a complete hands-on exercise that introduces you to the app development process using the Angular CLI and walks through important subsystems.

* To learn more about using the Angular CLI, see the [CLI Overview](cli "CLI Overview"). In addition to creating the initial workspace and app scaffolding, you can use the CLI to generate Angular code such as components and services. The CLI supports the full development cycle, including building, testing, bundling, and deployment.

* For more information about the Angular files generated by `ng new`, see [Workspace and Project File Structure](guide/file-structure).
-->
* Angular가 어떤 개념과 철학으로 개발되었는지, 단일 페이지 앱을 구성하는 전체 구조를 확인하려면 [Angular의 컨셉](guide/architecture) 문서를 참고하세요.

* [히어로들의 여행 튜토리얼](tutorial)은 실습 과정입니다. 이 튜토리얼을 진행하면 직접 앱을 만들어보면서 Angular CLI와 Angular 앱의 구성요소에 대해 자세하게 알아볼 수 있습니다.

* Angular CLI를 활용하는 방법에 대해 더 알아보려면 [Angular CLI 개요](cli "CLI Overview") 문서를 참고하세요. 워크스페이스와 애플리케이션 기본 틀을 만드는 것 외에도 Angular CLI를 활용하면 컴포넌트와 서비스도 간단하게 생성할 수 있습니다. Angular CLI는 앱 빌드, 테스트, 번들링, 배포 등 앱 개발 과정 전반에 활용할 수 있습니다.

* `ng new` 명령을 실행했을 때 어떤 파일이 생성되는지 알아보려면 [워크스페이스와 프로젝트 파일 구조](guide/file-structure) 문서를 참고하세요.
