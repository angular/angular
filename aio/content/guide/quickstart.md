<!--
# Getting started 
-->
# 시작하기

<!--
Welcome to Angular! Angular helps you build modern applications for the web, mobile, or desktop.  

This guide shows you how to build and run a simple Angular
app. You'll use the [Angular CLI tool](cli "CLI command reference") to accelerate development, 
while adhering to the [Style Guide](guide/styleguide "Angular style guide") recommendations that
benefit _every_ Angular project.

This guide takes less than 30 minutes to complete. 
At the end of this guide&mdash;as part of final code review&mdash;there is a link to download a copy of the final application code. (If you don't execute the commands in this guide, you can still download the final application code.)
-->
Angular의 세계에 오신 것을 환영합니다! Angular를 사용하면 최신 표준 사양으로 동작하는 웹, 모바일, 데스크탑 애플리케이션을 편하게 개발할 수 있습니다.

이 문서는 간단한 Angular 앱을 생성하고 실행하는 방법에 대해 다룹니다.
개발을 편하게 하기 위해 [Angular CLI 툴](cli "CLI command reference")을 사용하며, [코딩 스타일 가이드](guide/styleguide "Angular style guide")를 준수하며 애플리케이션을 구현합니다.
이 두가지는 이 문서 뿐 아니라 _모든_ Angular 프로젝트에 적용하는 것을 권장합니다.

이 문서를 다 보는 데에는 30분도 채 걸리지 않습니다.
그리고 이 문서 마지막&mdash;최종코드 리뷰 섹션&mdash;에는 이 문서에서 작성하는 애플리케이션의 완성본을 다운받을 수 있는 링크가 있습니다.
애플리케이션을 직접 구현하지 않고 최종 코드만 다운받아 확인하는 것도 물론 가능합니다.

{@a devenv}
{@a prerequisites}
<!--
## Prerequisites 
-->
## 사전지식

<!--
Before you begin, make sure your development environment includes `Node.js®` and an npm package manager. 
-->
개발을 시작하기 전에 `Node.js®`와 npm 패키지 매니저가 개발 환경에 설치되어 있는지 확인해야 합니다.

{@a nodejs}
### Node.js

<!--
Angular requires `Node.js` version 8.x or 10.x.

* To check your version, run `node -v` in a terminal/console window.

* To get `Node.js`, go to [nodejs.org](https://nodejs.org "Nodejs.org").
-->
Angular를 사용하려면 8.x 버전이나 10.x 버전의 `Node.js`가 필요합니다.

* `Node.js` 버전을 확인하려면 콘솔창에서 `node -v` 명령을 실행하면 됩니다.

* `Node.js`를 설치하려면 [nodejs.org](https://nodejs.org "Nodejs.org") 사이트에서 안내하는 내용을 참고하세요.

{@a npm}
<!--
### npm package manager
-->
### npm 패키지 매니저

<!--
Angular, the Angular CLI, and Angular apps depend on features and functionality provided by libraries that are available as [npm packages](https://docs.npmjs.com/getting-started/what-is-npm). To download and install npm packages, you must have an npm package manager. 

This Quick Start uses the [npm client](https://docs.npmjs.com/cli/install) command line interface, which is installed with `Node.js` by default. 

To check that you have the npm client installed, run `npm -v` in a terminal/console window.
-->
Angular와 Angular CLI, Angular로 만든 애플리케이션은 모두 [npm 패키지](https://docs.npmjs.com/getting-started/what-is-npm)를 기반으로 동작합니다.
그래서 npm 패키지를 다운받으려면 반드시 npm 패키지 매니저가 있어야 합니다.

이 문서에서는 `Node.js`가 기본으로 제공하는 [npm 클라이언트](https://docs.npmjs.com/cli/install)를 사용합니다.

npm 클라이언트가 설치되었는지 확인하려면 콘솔창에서 `npm -v` 명령을 실행해 보세요.

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
Angular CLI는 프로젝트를 생성할 때, 애플리케이션을 생성하거나 라이브러리 코드를 생성할 때 뿐 아니라 테스트와 번들링, 배포  등 개발과정에 필요한 다양한 작업에 사용할 수 있습니다.

Angular CLI를 전역 범위에 설치해 봅시다.

`npm`으로 Angular CLI를 설치하려면 콘솔창에서 다음 명령을 실행하면 됩니다:

<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>



{@a create-proj}

<!--
## Step 2: Create a workspace and initial application
-->
## 2단계: 워크스페이스, 애플리케이션 기본 코드 생성하기

<!--
You develop apps in the context of an Angular [**workspace**](guide/glossary#workspace). A workspace contains the files for one or more [**projects**](guide/glossary/#project). A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests. 
-->
Angular 애플리케이션은 Angular [**워크스페이스**](guide/glossary#workspace) 안에서 개발합니다.
이 때 워크스페이스는 하나 이상의 [**프로젝트**](guide/glossary/#project)로 구성된 작업환경을 의미합니다.
그리고 프로젝트는 애플리케이션을 구성하는 파일이나 라이브러리, 엔드-투-엔드(e2e) 테스트로 구성됩니다.

<!--
To create a new workspace and initial app project: 
-->
워크스페이스와 기본 애플리케이션 프로젝트를 생성하려면 다음과 같이 진행합니다:

<!--
1. Run the CLI command `ng new` and provide the name `my-app`, as shown here: 
-->
1. Angular CLI로 `ng new` 명령을 실행합니다. 이 때 `my-app`이라는 이름을 지정하려면 다음과 같이 실행하면 됩니다:

    <code-example language="sh" class="code-shell">
      ng new my-app

    </code-example>

<!--
2. The `ng new` command prompts you for information about features to include in the initial app project. Accept the defaults by pressing the Enter or Return key. 
-->
2. `ng new` 명령을 실행하면 기본 애플리케이션에 적용될 설정을 선택하는 프롬프트가 표시됩니다.
엔터키를 눌러서 기본값을 지정합니다.

<!--
The Angular CLI installs the necessary Angular npm packages and other dependencies. This can take a few minutes. 

It also creates the following workspace and starter project files: 

* A new workspace, with a root folder named `my-app`
* An initial skeleton app project, also called `my-app` (in the `src` subfolder)
* An end-to-end test project (in the `e2e` subfolder)
* Related configuration files

The initial app project contains a simple Welcome app, ready to run. 
-->
그러면 Angular를 사용하기 위해 필요한 npm 패키지와 서드파티 패키지가 설치됩니다.
이 과정은 몇 분 걸릴 수 있습니다.

Angular CLI는 npm 패키지를 설치하고 나서 워크스페이스와 프로젝트 파일을 다음과 같이 구성합니다:

* `my-app`이라는 폴더로 새 워크스페이스를 생성합니다.
* `my-app`이라는 이름으로 애플리케이션 기본 코드를 생성합니다. (`src` 폴더에 생성됩니다.)
* 엔드-투-엔드 테스트 프로젝트를 생성합니다. (`e2e` 폴더에 생성됩니다.)
* 기타 환경 설정 파일을 생성합니다.

이제 기본 애플리케이션이 생성되었습니다. 이 애플리케이션을 실행해 봅시다.

{@a serve}

<!--
## Step 3: Serve the application
-->
## 3단계: 애플리케이션 실행하기

<!--
Angular includes a server, so that you can easily build and serve your app locally.

1. Go to the workspace folder (`my-app`).

1. Launch the server by using the CLI command `ng serve`, with the `--open` option.
-->
Angular는 간단한 서버 기능도 제공합니다. 이 기능을 사용하면 로컬 환경에 빌드한 애플리케이션을 바로 실행할 수 있습니다.

1. 워크스페이스 폴더로 이동합니다. (`my-app`)

1. Angular CLI로 `ng serve` 명령을 실행해서 서버를 실행합니다. 이 때 `--open` 옵션을 함께 사용합니다.

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
`ng serve` 명령을 실행하면 서버가 실행되면서 작업하는 애플리케이션 코드가 변경되는 것을 감지합니다.
이후에 애플리케이션 코드가 변경되면 이 내용을 반영해서 애플리케이션이 다시 빌드되고 서버도 재실행됩니다.

`--open` (축약형은 `-o`) 옵션을 사용하면 서버가 실행된 후에 자동으로 브라우저가 실행되며, 애플리케이션이 실행되는 주소인 `http://localhost.4200/` 으로 접속합니다.

애플리케이션을 실행하고 나면 다음과 같은 화면을 확인할 수 있습니다:

<figure>
  <img src='generated/images/guide/cli-quickstart/app-works.png' alt="Welcome to my-app!">
</figure>



{@a first-component}

<!--
## Step 4: Edit your first Angular component
-->
## 4단계: 컴포넌트 내용 수정하기

<!--
[**_Components_**](guide/glossary#component) are the fundamental building blocks of Angular applications. 
They display data on the screen, listen for user input, and take action based on that input. 

As part of the initial app, the CLI created the first Angular component for you. It is the _root component_, and it is named `app-root`. 
-->
[**_컴포넌트(Components)_**](guide/glossary#component)는 Angular 애플리케이션을 구성하는 기본 단위입니다.
컴포넌트는 데이터를 화면에 표시하며, 사용자의 동작을 감지하고, 이 동작에 반응해서 로직을 실행합니다.

Angular CLI로 생성한 애플리케이션에는 Angular 컴포넌트가 하나 존재합니다.
이 컴포넌트는 애플리케이션 _최상위 컴포넌트_ 이며, 이름은 `app-root`로 지정되어 있습니다.

<!--
1. Open `./src/app/app.component.ts`. 

2. Change the `title` property from `'my-app'` to `'My First Angular App'`.
-->
1. `./src/app/app.component.ts` 파일을 엽니다.

2. `'my-app'`이라고 지정된 `title` 프로퍼티의 내용을 `'My First Angular App'`으로 변경합니다.

    <code-example path="cli-quickstart/src/app/app.component.ts" region="component" header="src/app/app.component.ts" linenums="false"></code-example>

    <!--
    The browser reloads automatically with the revised title. That's nice, but it could look better.
    -->
    그러면 브라우저가 자동으로 갱신되면서 변경한 문구가 화면에 표시됩니다. 조금 더 보기 좋게 다듬어 봅시다.

<!--
3. Open `./src/app/app.component.css` and give the component some style.
-->
3. `./src/app/app.component.css` 파일을 열고 다음과 같은 스타일을 지정합니다.

    <code-example path="cli-quickstart/src/app/app.component.css" header="src/app/app.component.css" linenums="false"></code-example>

<!--
Looking good! 
-->
더 보기 좋네요!

<figure>
  <img src='generated/images/guide/cli-quickstart/my-first-app.png' alt="Output of Getting Started app">
</figure>




{@a project-file-review}

<!--
## Final code review
-->
## 최종코드 리뷰

<!--
You can <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">download an example</a> of the app that you created in this Getting Started guide. 
-->
이 문서에서 만든 앱은 <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">예제 다운받기</a>에서 다운받아 확인할 수 있습니다.


<div class="alert is-helpful">

<!--
**Tip:** Most Angular guides include links to download example files and run live examples in [Stackblitz](http://www.stackblitz.com), so that you can see Angular concepts and code in action. 
-->
**팁:** 가이드 문서에서 예제로 만드는 애플리케이션은 [Stackblitz](http://www.stackblitz.com) 환경에서 직접 실행하거나 다운받아 확인할 수 있도록 링크로 제공됩니다.
각 문서에서 만드는 애플리케이션 코드를 직접 확인해 보세요.

</div>

<!--
For more information about Angular project files and the file structure, see [Workspace and project file struture](guide/file-structure).
-->
Angular 프로젝트를 구성하는 파일들에 대해 더 알아보려면 [워크스페이스와 프로젝트 파일 구조](guide/file-structure) 문서를 참고하세요.


<!--
## Next steps
-->
## 다음 단계

<!--
Now that you've seen the essentials of an Angular app and the Angular CLI, continue with these other introductory materials: 
-->
이 문서에서는 Angular 애플리케이션과 Angular CLI에 대해 간단하게 알아봤습니다. 다음 내용들에 대해서도 확인해 보세요:

<!--
* The [Tour of Heroes tutorial](tutorial "Tour of Heroes tutorial") provides additional hands-on learning. It walks you through the steps to build an app that helps a staffing agency manage a group of superhero employees. 
It has many of the features you'd expect to find in a data-driven application: 

        - Acquiring and displaying a list of items

        - Editing a selected item's detail

        - Navigating among different views of the data
-->
* [히어로들의 여행 튜토리얼](tutorial "Tour of Heroes tutorial")은 실습 과정으로 진행됩니다.
슈퍼 히어로들을 관리하는 매니저가 되어 이 업무에 필요한 애플리케이션을 단계별로 구현해 보세요.
데이터를 다루는 애플리케이션에서 활용할 수 있는 다음 기능에 대해 안내합니다:

        - 데이터 목록을 화면에 표시하는 방법

        - 선택된 항목을 수정하는 방법

        - 화면을 전환하면서 데이터를 표시하는 방법

<!--
* The [Architecture guide](guide/architecture "Architecture guide") describes key concepts such as modules, components, services, and dependency injection (DI). It provides a foundation for more in-depth guides about specific Angular concepts and features.  
-->
* [아키텍처 가이드 문서](guide/architecture "Architecture guide")에서는 모듈과 컴포넌트, 서비스, 의존성 주입에 대해 소개합니다.
Angular의 개발 철학과 Angular가 제공하는 기능에 대해 자세하게 알아보세요.

<!--
After the Tutorial and Architecture guide, you'll be ready to continue exploring Angular on your own through the other guides and references in this documentation set, focusing on the features most important for your apps. 
-->
튜토리얼과 아키텍처 가이드 문서 외에도 Angular 공식 홈페이지는 방대한 가이드 문서를 제공합니다.
Angular 애플리케이션에 활용할 수 있는 다양한 기능을 확인해 보세요.
