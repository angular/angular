<!--
# The Application Shell
-->
# 애플리케이션 셸

<!--
You begin by creating an initial application using the Angular CLI. Throughout this tutorial, you’ll modify and extend that starter application to create the Tour of Heroes app.
-->
 Angular CLI를 사용하면 애플리케이션의 기본 틀을 구성할 수 있습니다. 그리고 이 튜토리얼을 진행하면서 기본 틀을 히어로들의 여행 앱으로 확장해 봅시다.

<!--
In this part of the tutorial, you'll do the following:

1. Set up your environment.
2. Create a new workspace and initial app project.
3. Serve the application.
4. Make changes to the application.
-->
이 문서에서는 다음 내용에 대해 다룹니다.

1. 개발환경 설정하기
2. 애플리케이션 프로젝트 생성하기
3. 애플리케이션 실행해보기
4. 애플리케이션 개발 시작하기


<!--
## Set up your environment
-->
## 개발환경 설정하기

<!--
To set up your development environment, follow the instructions in [Local Environment Setup](guide/setup-local "Setting up for Local Development").
-->
애플리케이션의 개발 환경을 구성하려면 [로컬 환경 설정](guide/setup-local "Setting up for Local Development") 문서를 참고하는 것이 좋습니다.

<!--
## Create a new workspace and an initial application
-->
## 워크스페이스와 애플리케이션 기본 틀 생성하기

<!--
You develop apps in the context of an Angular [workspace](guide/glossary#workspace). A workspace contains the files for one or more [projects](guide/glossary#project). A project is the set of files that comprise an app, a library, or end-to-end (e2e) tests. For this tutorial, you will create a new workspace.
-->
애플리케이션은 Angular [워크스페이스](guide/glossary#workspace) 안에서 개발합니다.
워크스페이스는 여러 개의 [프로젝트](guide/glossary#project)로 구성되는 단위이며, 프로젝트는 애플리케이션이나 라이브러리, 엔드-투-엔드(e2e) 테스트를 구성하는 파일들의 집합을 의미합니다.
이 튜토리얼에서는 새로운 워크스페이스를 만드는 것부터 시작합니다.

<!--
To create a new workspace and an initial app project:

  1. Ensure that you are not already in an Angular workspace folder. For example, if you have previously created the Getting Started workspace, change to the parent of that folder.
  2. Run the CLI command `ng new` and provide the name `angular-tour-of-heroes`, as shown here:

  <code-example language="sh" class="code-shell">
     ng new angular-tour-of-heroes
  </code-example>

  3. The `ng new` command prompts you for information about features to include in the initial app project. Accept the defaults by pressing the Enter or Return key.
-->
워크스페이스를 새로 만들고 애플리케이션을 구성하려면 다음 순서대로 진행합니다:

  1. 아직 Angular 워크스페이스 폴더 안에 있지 않은 것을 전제로 합니다. 이전에 시작하기 문서를 진행하면서 이미 만든 워크스페이스가 있다면, 이 폴더 밖에서 작업하세요.

  2. Angular CLI 명령 `ng new`를 사용해서 `angular-tour-of-heroes` 라는 이름으로 워크스페이스를 생성합니다:

  <code-example language="sh" class="code-shell">
     ng new angular-tour-of-heroes
  </code-example>

  3. 커맨드 창에서 `ng new` 명령을 실행하면 프로젝트에 어떤 설정을 추가할지 물어봅니다. 엔터키를 눌러서 기본값으로 진행합시다.

<!--
The Angular CLI installs the necessary Angular `npm` packages and other dependencies. This can take a few minutes.

It also creates the following workspace and starter project files:

  * A new workspace, with a root folder named `angular-tour-of-heroes`.
  * An initial skeleton app project, also called `angular-tour-of-heroes` (in the `src` subfolder).
  * An end-to-end test project (in the e2e subfolder).
  * Related configuration files.

The initial app project contains a simple Welcome app, ready to run.
-->
이 과정을 진행하면서 Angular CLI가 Angular `npm` 패키지와 서드파티 패키지를 모두 설치하기 때문에 시간이 약간 걸릴 수 있습니다.

그리고 이 명령은 다음과 같은 프로젝트 파일을 준비하기도 합니다:

  * `angular-tour-of-heroes`라는 폴더 이름으로 새로운 워크스페이스를 생성합니다.
  * 서브 폴더 `src`를 생성하고 이 폴더에 애플리케이션 초기 코드를 생성합니다.
  * 서브 폴더 `e2e`를 생성하고 엔드-투-엔드 테스트 프로젝트를 생성합니다.
  * 환경설정파일을 생성합니다.

이제 간단한 Welcome 앱이 완성되었습니다.

<!--
## Serve the application
-->
## 애플리케이션 실행하기

<!--
Go to the workspace directory and launch the application.
-->
워크스페이스 폴더로 이동해서 애플리케이션을 실행합니다.

<code-example language="sh" class="code-shell">
  cd angular-tour-of-heroes
  ng serve --open
</code-example>

<div class="alert is-helpful">

<!--
The `ng serve` command builds the app, starts the development server,
watches the source files, and rebuilds the app as you make changes to those files.
-->
`ng serve` 명령을 실행하면 개발서버가 시작되며, 이 서버는 변경된 파일의 내용을 자동으로 반영하는 워치 모드로 동작합니다.

<!--
The `--open` flag  opens a browser to `http://localhost:4200/`.
-->
`ng serve` 명령을 실행할 때 `--open` 옵션을 함께 사용하면 서버의 주소인 `http://localhost:4200/`를 기본 브라우저로 열 수 있습니다.

</div>

<!--
You should see the app running in your browser.
-->
브라우저가 실행되면 앱이 실행되는 것을 확인할 수 있습니다.

<!--
## Angular components
-->
## Angular 컴포넌트

<!--
The page you see is the _application shell_.
The shell is controlled by an Angular **component** named `AppComponent`.
-->
처음 보이는 페이지는 _애플리케이션 셸_ 입니다.
애플리케이션 셸은 `AppComponent`란 이름의 컴포넌트이며, Angular에 의해 관리됩니다.

<!--
_Components_ are the fundamental building blocks of Angular applications.
They display data on the screen, listen for user input, and take action based on that input.
-->
_컴포넌트_ 는 Angular 애플리케이션의 기본 구성 요소입니다.
컴포넌트는 화면에 데이터를 표시하고, 유저의 입력을 기다리며, 유저의 입력에 반응하면서 어떤 동작을 수행합니다.

<!--
## Make changes to the application
-->
## 애플리케이션 수정하기

<!--
Open the project in your favorite editor or IDE and navigate to the `src/app` folder to make some changes to the starter app.
-->
자주 사용하는 에디터나 IDE로 프로젝트를 열고 `src/app` 폴더로 이동합니다. 이제부터 파일을 수정해 봅시다.

<!--
You'll find the implementation of the shell `AppComponent` distributed over three files:
-->
`AppComponent`는 3개의 파일로 구성됩니다 : 

<!--
1. `app.component.ts`&mdash; the component class code, written in TypeScript.
1. `app.component.html`&mdash; the component template, written in HTML.
1. `app.component.css`&mdash; the component's private CSS styles.
-->
1. `app.component.ts`&mdash; TypeScript로 작성하는 컴포넌트 클래스 코드입니다.
1. `app.component.html`&mdash; HTML로 작성하는 컴포넌트 템플릿입니다.
1. `app.component.css`&mdash; 이 컴포넌트에만 적용되는 CSS 스타일입니다.

<!--
### Change the application title
-->
### 애플리케이션 제목 수정하기

<!--
Open the component class file (`app.component.ts`) and change the value of the `title` property to 'Tour of Heroes'.
-->
컴포넌트 클래스 파일(`app.component.ts`)을 열어서 `title` 프로퍼티의 값을 'Tour of Heroes'로 바꿔봅시다.

<!--
<code-example path="toh-pt0/src/app/app.component.ts" region="set-title" header="app.component.ts (class title property)" linenums="false">
-->
<code-example path="toh-pt0/src/app/app.component.ts" region="set-title" header="app.component.ts (class title 프로퍼티)" linenums="false">
</code-example>

<!--
Open the component template file (`app.component.html`) and
delete the default template generated by the Angular CLI.
Replace it with the following line of HTML.
-->
그리고 컴포넌트 템플릿 파일(`app.component.html`)를 열어서 Angular CLI가 자동으로 생성한 기본 템플릿을 삭제하고 아래의 HTML코드로 교체합니다.

<!--
<code-example path="toh-pt0/src/app/app.component.html"
  header="app.component.html (template)" linenums="false">
-->
<code-example path="toh-pt0/src/app/app.component.html"
  header="app.component.html (템플릿)" linenums="false">
</code-example>

<!--
The double curly braces are Angular's *interpolation binding* syntax.
This interpolation binding presents the component's `title` property value
inside the HTML header tag.
-->
이중 중괄호는 Angular에서 제공하는 *문자열 바인딩(interpolation binding)* 문법입니다.
문자열 바인딩을 사용하면 컴포넌트의 `title` 프로퍼티 값을 HTML 헤더 태그에 표시할 수 있습니다.

<!--
The browser refreshes and displays the new application title.
-->
변경된 내용을 저장하면 브라우저가 자동으로 새로고침되며 수정한 애플리케이션 타이틀이 표시됩니다.

{@a app-wide-styles}

<!--
### Add application styles
-->
### 애플리케이션 전역 스타일 지정하기

<!--
Most apps strive for a consistent look across the application.
The CLI generated an empty `styles.css` for this purpose.
Put your application-wide styles there.
-->
애플리케이션에 존재하는 모든 페이지의 스타일은 일관되게 구성해야 합니다.
Angular CLI로 프로젝트를 생성하면 빈 내용으로 `styles.css` 파일이 생성되는데, 이 파일에 스타일을 정의하면 애플리케이션 전역에 지정되는 스타일을 지정할 수 있습니다.

<!--
Open `src/styles.css` and add the code below to the file.
-->
`src/styles.css` 파일을 열고 아래에 다음 코드를 추가합니다.

<code-example path="toh-pt0/src/styles.1.css" header="src/styles.css (excerpt)">
-->
<code-example path="toh-pt0/src/styles.1.css" header="src/styles.css (일부)">
</code-example>

<!--
## Final code review
-->
## 최종 코드 리뷰

<!--
The source code for this tutorial and the complete _Tour of Heroes_ global styles
are available in the <live-example></live-example>.
-->
이 튜토리얼과 _Tour of Heroes_ 앱의 전역 스타일의 코드는 <live-example></live-example>에서 확인할 수 있습니다.

<!--
Here are the code files discussed on this page.
-->
아래는 이 튜토리얼에서 언급된 소스코드 파일들입니다. 

<code-tabs>

  <code-pane header="src/app/app.component.ts" path="toh-pt0/src/app/app.component.ts">
  </code-pane>

  <code-pane header="src/app/app.component.html" path="toh-pt0/src/app/app.component.html">
  </code-pane>

  <!--
  <code-pane
    header="src/styles.css (excerpt)"
    path="toh-pt0/src/styles.1.css">
  -->
  <code-pane
    header="src/styles.css (일부)"
    path="toh-pt0/src/styles.1.css">
  </code-pane>
</code-tabs>

<!--
## Summary
-->
## 정리

<!--
* You created the initial application structure using the Angular CLI.
* You learned that Angular components display data.
* You used the double curly braces of interpolation to display the app title.
-->
* Angular CLI를 이용하면 애플리케이션의 기본 틀을 생성할 수 있습니다.
* Angular 컴포넌트를 사용하면 컴포넌트에 있는 데이터를 화면에 표시할 수 있습니다.
* 이중 중괄호를 사용하면 컴포넌트 프로퍼티 값을 템플릿에 바인딩 할 수 있습니다.

