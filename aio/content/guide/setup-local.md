<!--
# Setting up the Local Environment and Workspace
-->
# 로컬 개발환경, 워크스페이스 구성하기

<!--
This guide explains how to set up your environment for Angular development using the [Angular CLI tool](cli "CLI command reference"). 
It includes information about prerequisites, installing the CLI, creating an initial workspace and starter app, and running that app locally to verify your setup. 
-->
이 문서는 [Angular CLI 툴](cli "CLI command reference")을 사용하는 Angular 개발환경을 어떻게 구성하는지 안내합니다.
사전지식부터 Angular CLI를 설치하는 방법, 워크스페이스를 생성하고 앱을 생성한 후에 로컬 개발환경에서 개발 서버로 앱을 실행하는 것까지 진행해 봅시다.

<!--
<div class="callout is-helpful">
<header>Learning Angular</header>
<header>Angular 학습하기</header>

If you are new to Angular, see [Getting Started](start). Getting Started helps you quickly learn the essentials of Angular, in the context of building a basic online store app. It leverages the [StackBlitz](https://stackblitz.com/) online development environment, so you don't need to set up your local environment until you're ready. 
아직 Angular에 대해 익숙하지 않다면 [시작하기](start) 문서를 먼저 보는 것을 권장합니다. 이 문서를 보면 온라인 쇼핑몰 앱을 개발하는 과정을 통해 Angular의 기초 구성요소에 대해 학습할 수 있습니다. 그리고 이 튜토리얼은 [StackBlitz](https://stackblitz.com/) 온라인 개발 환경을 사용하기 때문에, 내용을 진행하는 동안 로컬 개발환경 설정을 잠시 미뤄둘 수 있습니다.

</div> 
-->

{@a devenv}
{@a prerequisites}
<!--
## Prerequisites 
-->
## 사전지식

<!--
Before you begin, make sure your development environment includes `Node.js®` and an npm package manager. 
-->
이 튜토리얼을 시작하려면 Angular 앱 개발 환경인 `Node.js®`와 npm 패키지 매니저가 설치되어 있어야 합니다.

{@a nodejs}
### Node.js

<!--
Angular requires `Node.js` version 10.9.0 or later.

* To check your version, run `node -v` in a terminal/console window.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org "Nodejs.org").
-->
Angular 앱을 개발하려면 `Node.js` 10.9.0 이상의 버전이 필요합니다.

* 버전을 확인하려면 터미널이나 콘솔창에서 `node -v` 명령을 실행해 보세요.

* `Node.js`가 설치되어 있지 않다면 [nodejs.org](https://nodejs.org "Nodejs.org")에서 다운받아 설치하면 됩니다.

{@a npm}
<!--
### npm package manager
-->
### npm 패키지 매니저

<!--
Angular, the Angular CLI, and Angular apps depend on features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm). To download and install npm packages, you must have an npm package manager. 

This setup guide uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default. 

To check that you have the npm client installed, run `npm -v` in a terminal/console window.
-->
Angular와 Angular CLI, Angular로 동작하는 애배은 모두 [npm 패키지](https://docs.npmjs.com/getting-started/what-is-npm) 형태로 제공되는 라이브러리를 사용해서 동작합니다. 그리고 npm 패키지는 npm 패키지 매니저를 사용해서 설치합니다.

이 문서는 `Node.js`를 설치할 때 기본으로 설치되는 [npm 클라이언트](https://docs.npmjs.com/cli/install)를 기준으로 설명합니다.

npm 클라이언트가 설치되었는지 확인하려면 터미널이나 콘솔창에서 `npm -v` 명령을 실행해 보세요.

{@a install-cli}

<!--
## Step 1: Install the Angular CLI
-->
## 1단계: Angular CLI 설치하기

<!--
You use the Angular CLI 
to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

Install the Angular CLI globally. 

To install the CLI using `npm`, open a terminal/console window and enter the following command:
-->
Angular CLI는 프로젝트를 생성하거나 애플리케이션을 생성할 때, 라이브러리를 생성하거나 테스트, 번들링, 배포와 같은 개발 과정 전반에 걸쳐 다양하게 활용할 수 있습니다.

Angular CLI를 전역 범위에 설치해 봅시다.

`npm`을 사용해서 Angular CLI를 설치하려면 터미널이나 콘솔창에서 다음 명령을 실행하면 됩니다:

<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>



{@a create-proj}

<!--
## Step 2: Create a workspace and initial application
-->
## 2단계: 워크스페이스 생성하고 앱 기본틀 구성하기

<!--
You develop apps in the context of an Angular [**workspace**](guide/glossary#workspace). 

To create a new workspace and initial starter app: 

1. Run the CLI command `ng new` and provide the name `my-app`, as shown here: 
-->
Angular 앱은 Angular [**워크스페이스(workspace)**](guide/glossary#workspace) 컨텍스트 안에서 개발합니다.

워크스페이스를 생성하면서 앱의 기본틀을 구성하려면 다음과 같이 작업하면 됩니다:

1. Angular CLI 명령 `ng new` 명령을 실행하면 새 애플리케이션을 생성할 수 있습니다. `my-app`이라는 이름으로 생성하려면 다음 명령을 실행하면 됩니다:

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

<!--
2. The `ng new` command prompts you for information about features to include in the initial app. Accept the defaults by pressing the Enter or Return key. 

The Angular CLI installs the necessary Angular npm packages and other dependencies. This can take a few minutes. 

The CLI creates a new workspace and a simple Welcome app, ready to run. 
-->
2. `ng new` 명령을 실행하면 애플리케이션의 기본 틀을 구성하기 위해 필요한 정보를 프롬프트로 입력받습니다. 지금은 엔터키를 눌러서 모두 기본값으로 설정합니다.

이 과정이 끝나면 Angular CLI가 앱을 실행할 때 필요한 npm 패키지를 설치합니다. 이 과정은 몇 분 걸릴수도 있습니다.

ANgular CLI가 새 워크스페이스를 생성하고 애플리케이션 기본 틀도 구성했다면 이제 실행할 준비는 끝났습니다.

{@a serve}

<!--
## Step 3: Run the application
-->
## 3단계: 애플리케이션 실행하기

<!--
The Angular CLI includes a server, so that you can easily build and serve your app locally.

1. Go to the workspace folder (`my-app`).

1. Launch the server by using the CLI command `ng serve`, with the `--open` option.
-->
Angular CLI는 간단한 서버 기능을 제공하기 때문에 로컬 개발환경에서 빌드한 앱을 간단하게 호스팅할 수 있습니다.

1. 워크프레이스 폴더로 이동합니다. (이 경우에는 `my-app`)

1. Angular CLI 명령 `ng serve` 명령을 실행하면 서버를 띄울 수 있습니다. 이 때 `--open` 옵션도 함께 사용해 봅시다.

<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>

<!--
The `ng serve` command launches the server, watches your files,
and rebuilds the app as you make changes to those files.

The `--open` (or just `-o`) option automatically opens your browser
to `http://localhost:4200/`.

Your app greets you with a message:
-->
`ng serve` 명령을 실행하면 서버가 실행되면서 파일이 변경되는 것을 감지합니다. 그리고 파일이 변경되면 변경된 내용으로 앱을 자동으로 재빌드합니다.

`--open`이나 `-o` 옵션을 사용하면 서버를 실행한 후에 자동으로 브라우저를 실행해서 `http://localhost:4200/`로 접속할 수 있습니다.

다음과 같이 앱이 실행되는 것을 확인해 보세요:


<figure>
  <img src='generated/images/guide/setup-local/app-works.png' alt="Welcome to my-app!">
</figure>


<!--
## Next steps
-->
## 다음 단계


<!--
* If you are new to Angular, see the [Getting Started](start) tutorial. Getting Started helps you quickly learn the essentials of Angular, in the context of building a basic online store app. 
-->
* 아직 Angular에 익숙하지 않다면 [시작하기](start) 튜토리얼 문서를 참고하세요. 이 문서를 보면 온라인 쇼핑몰 앱을 개발하는 과정을 통해 Angular의 기초 구성요소에 대해 학습할 수 있습니다.

  <div class="alert is-helpful">
  
  <!--
  Getting Started assumes the [StackBlitz](https://stackblitz.com/) online development environment. 
  To learn how to export an app from StackBlitz to your local environment, skip ahead to the [Deployment](start/deployment "Getting Started: Deployment") section. 
  -->
  그리고 이 튜토리얼은 [StackBlitz](https://stackblitz.com/) 온라인 개발 환경을 사용하기 때문에, 내용을 진행하는 동안 로컬 개발환경 설정을 잠시 미뤄둘 수 있습니다.
  StackBlitz 프로젝트를 로컬 개발환경에 다운로드받아 배포하는 방법은 [배포](start/deployment "시작하기: 배포") 문서를 참고하세요.

  </div>

<!--
* To learn more about using the Angular CLI, see the [CLI Overview](cli "CLI Overview"). In addition to creating the initial workspace and app scaffolding, you can use the CLI to generate Angular code such as components and services. The CLI supports the full development cycle, including building, testing, bundling, and deployment. 


* For more information about the Angular files generated by `ng new`, see [Workspace and Project File Structure](guide/file-structure).
-->
* Angular CLI에 대해 자세하게 알아보려면 [CLI 개요](cli "CLI 개요") 문서를 참고하세요. Angular CLI를 사용하면 워크스페이스를 생성하거나 앱 기본틀을 생성하는 것 외에도 컴포넌트와 서비스와 같은 Angular 구성요소를 간편하게 생성할 수도 있습니다. 그리고 앱 빌드, 테스트, 번들링, 배포에도 활용할 수 있습니다.

* `ng new`를 실행했을 때 생성되는 파일들에 대해 자세하게 알아보려면 [워크스페이스와 프로젝트 파일 구조](guide/file-structure) 문서를 참고하세요.
