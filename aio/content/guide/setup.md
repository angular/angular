<!--
# Setup for Upgrading from AngularJS
-->
# 로컬 개발환경 설정하기

<!-- 
Question: Can we remove this file and instead direct readers to https://github.com/angular/quickstart/blob/master/README.md
-->

<div class="alert is-critical">

**Audience:** Use this guide **only** in the context of  [Upgrading from AngularJS](guide/upgrade "Upgrading from AngularJS to Angular") or [Upgrading for Performance](guide/upgrade-performance "Upgrading for Performance"). 
Those Upgrade guides refer to this Setup guide for information about using the [deprecated QuickStart GitHub repository](https://github.com/angular/quickstart "Deprecated Angular QuickStart GitHub repository"), which was created prior to the current Angular [CLI](cli "CLI Overview"). 

**For all other scenarios,** see the current instructions in [Local Environment Setup](guide/setup-local "Setting up for Local Development").

</div>

The <live-example name=quickstart>QuickStart live-coding</live-example> example is an Angular _playground_.
There are also some differences from a local app, to simplify that live-coding experience.
In particular, the QuickStart live-coding example shows just the AppComponent file; it creates the equivalent of app.module.ts and main.ts internally for the playground only.

This guide describes how to develop locally on your own machine.
Setting up a new project on your machine is quick and easy with the [QuickStart seed on github](https://github.com/angular/quickstart "Install the github QuickStart repo").

**Prerequisite:** Make sure you have [Node.js® and npm installed](guide/setup-local#prerequisites "Angular prerequisites").


{@a clone}
<!--
## Clone
-->
## 저장소 복제

<!--
Perform the _clone-to-launch_ steps with these terminal commands.
-->
터미널에서 다음 명령을 실행해서 _저장소를 복제하고 실행해_ 보세요.


<code-example language="sh" class="code-shell">
  git clone https://github.com/angular/quickstart.git quickstart
  cd quickstart
  npm install
  npm start

</code-example>



<div class="alert is-important">


<!--
`npm start` fails in _Bash for Windows_ in versions earlier than the Creator's Update (April 2017).
-->
크리에이터 업데이트(2017년 4월) 이전 버전의 윈도우 환경에서 _Bash 셸_ 을 사용하면 `npm start` 명령을 실행할 때 에러가 발생합니다.

</div>



{@a download}

<!--
## Download
-->
## 다운로드
<!--
<a href="https://github.com/angular/quickstart/archive/master.zip" title="Download the QuickStart seed repository">Download the QuickStart seed</a>
and unzip it into your project folder. Then perform the remaining steps with these terminal commands.
-->
<a href="https://github.com/angular/quickstart/archive/master.zip" title="Download the QuickStart seed repository">QuickStart seed</a>를 다운받고 quickstart 폴더에 압축을 푸세요. 그리고 터미널에서 다음 명령을 실행합니다.

<code-example language="sh" class="code-shell">
  cd quickstart
  npm install
  npm start

</code-example>



<div class="alert is-important">


<!--
`npm start` fails in _Bash for Windows_ in versions earlier than the Creator's Update (April 2017).
-->
크리에이터 업데이트(2017년 4월) 이전 버전의 윈도우 환경에서 _Bash 셸_ 을 사용하면 `npm start` 명령을 실행할 때 에러가 발생합니다.


</div>



{@a non-essential}


<!--
## Delete _non-essential_ files (optional)
-->
## _불필요한_ 파일 삭제하기 (생략 가능)

<!--
You can quickly delete the _non-essential_ files that concern testing and QuickStart repository maintenance
(***including all git-related artifacts*** such as the `.git` folder and `.gitignore`!).
-->
저장소를 복제했다면 테스트와 관련되거나 QuickStart 저장소에 관련된 _불필요한_ 파일들을 지우는 것이 좋습니다.
(`.git` 폴더나 `.gitignore`와 같이 ***git과 관련된 파일들도*** 지우는 것이 좋습니다!)

<div class="alert is-important">


<!--
Do this only in the beginning to avoid accidentally deleting your own tests and git setup!
-->
이 과정은 테스트 스펙을 직접 작성하거나 git 저장소를 직접 설정할 때만 수행하세요.

</div>


<!--
Open a terminal window in the project folder and enter the following commands for your environment:
-->
프로젝트 폴더에서 터미널을 열고 다음 명령을 실행하세요:

### OS/X (bash)

<code-example language="sh" class="code-shell">
  xargs rm -rf &lt; non-essential-files.osx.txt
  rm src/app/*.spec*.ts
  rm non-essential-files.osx.txt

</code-example>



### Windows

<code-example language="sh" class="code-shell">
  for /f %i in (non-essential-files.txt) do del %i /F /S /Q
  rd .git /s /q
  rd e2e /s /q

</code-example>



{@a seed}


<!--
## What's in the QuickStart seed?
-->
## QuickStart seed에는 어떤 내용이 있나요?


<!--
The **QuickStart seed** provides a basic QuickStart playground application and other files necessary for local development.
Consequently, there are many files in the project folder on your machine,
most of which you can [learn about later](guide/file-structure).
-->
**QuickStart seed**는 QuickStart 플레이그라운드와 거의 비슷한 애플리케이션이며, 로컬 개발환경에 맞게 몇 개 파일이 더 추가된 것입니다.
[가이드 문서의 내용](guide/file-structure)을 계속 따라가다 보면 이 프로젝트에 많은 파일들이 추가될 것입니다.


{@a app-files}

<!--
Focus on the following three TypeScript (`.ts`) files in the **`/src`** folder.
-->
**`/src`** 폴더에 있는 TypeScript (`.ts`) 파일 3개에 집중해 봅시다.


<div class='filetree'>

  <div class='file'>
    src
  </div>

  <div class='children'>

    <div class='file'>
      app
    </div>

    <div class='children'>

      <div class='file'>
        app.component.ts
      </div>

      <div class='file'>
        app.module.ts
      </div>

    </div>

    <div class='file'>
      main.ts
    </div>

  </div>

</div>



<code-tabs>

  <code-pane header="src/app/app.component.ts" path="setup/src/app/app.component.ts">

  </code-pane>

  <code-pane header="src/app/app.module.ts" path="setup/src/app/app.module.ts">

  </code-pane>

  <code-pane header="src/main.ts" path="setup/src/main.ts">

  </code-pane>

</code-tabs>


<!--
All guides and cookbooks have _at least these core files_.
Each file has a distinct purpose and evolves independently as the application grows.
-->
모든 가이드 문서에는 _이 3개의 파일이_ 반드시 존재합니다.
각 파일에는 독자적인 역할이 있으며, 애플리케이션이 확장되면서 점점 복잡해질 것입니다.

<!--
Files outside `src/` concern building, deploying, and testing your app.
They include configuration files and external dependencies.
-->
`src/` 폴더 밖에 있는 파일들은 애플리케이션 빌드하거나 배포, 테스트할 때 필요한 파일입니다.
이 파일들은 환경을 설정하거나 외부 의존성을 관리하는 용도로 사용합니다.

<!--
Files inside `src/` "belong" to your app.
Add new Typescript, HTML and CSS files inside the `src/` directory, most of them inside `src/app`,
unless told to do otherwise.
-->
`src/` 폴더 안에 있는 파일들은 애플리케이션을 구성하는 파일입니다.
그래서 애플리케이션을 확장하기 위해 새롭게 TypeScript, HTML, CSS을 만들면 `src/` 폴더에 만들게 되며, 특별한 이유가 없다면 `src/app` 폴더에 생성하게 될 것입니다.

<!--
The following are all in `src/`
-->
위에서 언급한 필수 파일 3개도 `src/` 폴더에 존재합니다.


<style>
  td, th {vertical-align: top}
</style>



<table width="100%">

  <col width="20%">

  </col>

  <col width="80%">

  </col>

  <tr>

    <th>
      <!--
      File
      -->
      파일
    </th>

    <th>
      <!--
      Purpose
      -->
      용도
    </th>

  </tr>

  <tr>

    <td>
      <code>app/app.component.ts</code>
    </td>

    <td>


      <!--
      Defines the same `AppComponent` as the one in the QuickStart playground.
      It is the **root** component of what will become a tree of nested components
      as the application evolves.
      -->
      QuickStart 플레이그라운드 애플리케이션의 `AppComponent`를 정의합니다.
      이 컴포넌트는 애플리케이션 **최상위** 컴포넌트이며 이 컴포넌트를 기준으로 컴포넌트 트리를 구성합니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>app/app.module.ts</code>
    </td>

    <td>

      <!--
      Defines `AppModule`, the  [root module](guide/bootstrapping "AppModule: the root module") that tells Angular how to assemble the application.
      Right now it declares only the `AppComponent`.
      Soon there will be more components to declare.
      -->
      [최상위 모듈](guide/bootstrapping "AppModule: the root module") `AppModule`을 정의합니다. Angular는 이 모듈에 정의된 대로 애플리케이션을 구성합니다.
      아직은 `AppComponent`만 정의되어 있지만 애플리케이션이 확장되면서 더 많은 컴포넌트가 이 모듈에 추가될 것입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>main.ts</code>
    </td>

    <td>

      <!--
      Compiles the application with the [JIT compiler](guide/glossary#jit) and
      [bootstraps](guide/bootstrapping)
      the application's main module (`AppModule`) to run in the browser.
      The JIT compiler is a reasonable choice during the development of most projects and
      it's the only viable choice for a sample running in a _live-coding_ environment like Stackblitz.
      You'll learn about alternative compiling and [deployment](guide/deployment) options later in the documentation.
      -->
      애플리케이션을 [JIT 컴파일러](guide/glossary#jit)로 빌드하고 브라우저에서 애플리케이션 메인 모듈 (`AppModule`)을 [부트스트랩](guide/bootstrapping)할 때 사용하는 파일입니다.
      JIT 컴파일러는 개발 단계에서 주로 사용하는 컴파일러이며, Stackblitz의 _라이브 코딩_ 환경도 JIT 컴파일러를 활용한 것입니다.
      실제 운영환경에서는 JIT 컴파일러 대신 AoT 컴파일러를 사용하는데, 이 내용은 [배포](guide/deployment) 문서에서 자세하게 살펴봅니다.

    </td>

  </tr>

</table>



<div class="alert is-helpful">



<!--
### Next Step
-->
### 다음 단계

<!--
If you're new to Angular, we recommend you follow the [tutorial](tutorial "Tour of Heroes tutorial").
-->
아직 Angular에 익숙하지 않다면 [튜토리얼](tutorial "Tour of Heroes tutorial")을 먼저 보는 것을 권장합니다.


</div>

<br></br><br></br>

{@a install-prerequisites}


<!--
## Appendix: Node.js and npm
-->
## 부록: Node.js 와 npm

<!--
[Node.js](https://nodejs.org/en/) and the [npm](https://www.npmjs.com/) package manager are essential to modern web development with Angular and other platforms.
Node.js powers client development and build tools.
The _npm_ package manager, which is itself a _Node.js_ application, installs JavaScript libraries.
-->
최근 웹 개발에는 Angular를 사용하지 않더라도 [Node.js](https://nodejs.org/en/)와 [npm](https://www.npmjs.com/) 패키지 매니저를 많이 사용합니다.
Node.js는 클라이언트를 개발하거나 빌드할 때 사용하는 툴입니다.
그리고 _npm_ 패키지 매니저는 그 자체로 _Node.js_ 애플리케이션이며 JavaScript 라이브러리를 설치할 때 사용하는 툴입니다.

<!--
<a href="https://docs.npmjs.com/getting-started/installing-node" target="_blank" title="Installing Node.js and updating npm">
Get them now</a> if they're not already installed on your machine.
-->
아직 PC에 설치되어 있지 않다면 <a href="https://docs.npmjs.com/getting-started/installing-node" target="_blank" title="Installing Node.js and updating npm">
Node.js</a>를 설치해 보세요.

<!--
**Verify that you are running Node.js `v8.x` or higher and npm `5.x` or higher**
by running the commands `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors.
-->
**이 때 Node.js는 `v8.x` 버전 이상, npm은 `5.x` 버전 이상이어야 합니다**.
각 툴의 버전은 `node -v`나 `npm -v` 명령을 실행해서 확인할 수 있으며, 이 버전보다 낮으면 애플리케이션을 실행하면서 에러가 발생할 수 있습니다.

<!--
We recommend [nvm](https://github.com/creationix/nvm) for managing multiple versions of Node.js and npm.
You may need [nvm](https://github.com/creationix/nvm) if you already have projects running on your machine that use other versions of Node.js and npm.
-->
Node.js 버전을 바꾸면서 개발해야 한다면 [nvm](https://github.com/creationix/nvm)을 사용하는 것도 권장합니다.
그리고 이미 개발이 끝난 프로젝트가 요구하는 Node.js 버전이 다를 때, [nvm](https://github.com/creationix/nvm)을 사용하면 Node.js를 다시 설치하지 않아도 버전을 변경할 수 있습니다.


<!--
## Appendix: Develop locally with IE
-->
## 부록: 로컬 개발 환경에서 IE 활용하기

<!--
If you develop angular locally with `ng serve`, a `websocket` connection is set up automatically between browser and local dev server, so when your code changes, the browser can automatically refresh.

In Windows, by default, one application can only have 6 websocket connections, <a href="https://msdn.microsoft.com/library/ee330736%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396#websocket_maxconn" title="MSDN WebSocket settings">MSDN WebSocket Settings</a>.
So when IE is refreshed (manually or automatically by `ng serve`), sometimes the websocket does not close properly. When websocket connections exceed the limitations, a `SecurityError` will be thrown. This error will not affect the angular application, you can just restart IE to clear this error, or modify the windows registry to update the limitations.
-->
로컬 개발환경에서 Angular 애플리케이션을 개발하면 `ng serve` 명령을 실행했을 때 브라우저와 로컬 개발 서버가 `websocket`으로 연결됩니다. 그래서 코드를 변경했을 때 브라우저가 코드 변경분을 반영하기 위해 페이지를 자동으로 갱신합니다.

그리고 Windows에서는 <a href="https://msdn.microsoft.com/library/ee330736%28v=vs.85%29.aspx?f=255&MSPPError=-2147217396#websocket_maxconn" title="MSDN WebSocket settings">MSDN WebSocket 설정에 따라</a> 애플리케이션에 6개의 웹소켓을 연결할 수 있습니다.
그래서 IE에서 수동으로 페이지를 새로고침하거나 `ng serve`에 의해 자동으로 갱신되면 종종 웹소켓이 정상적으로 종료되지 않아서 새로운 웹소켓을 연결하지 못할 때가 있습니다. 이 때 `SecurityError` 가 발생하는데, 이 에러가 Angular 애플리케이션에는 영향을 주지 않지만 에러를 없애려면 IE를 재시작해야 합니다.
Windows에서 이 제한을 해제하려면 레지스트리를 수정해야 합니다.

<!--
## Appendix: Test using `fakeAsync()/async()`
-->
## 부록: `fakeAsync()/async()` 활용하기

<!--
If you use the `fakeAsync()/async()` helper function to run unit tests (for details, read the [Testing guide](guide/testing#async-test-with-fakeasync)), you need to import `zone.js/dist/zone-testing` in your test setup file.
-->
유닛 테스트를 실행할 때 `fakeAsync()/async()` 헬퍼 함수를 사용한다면, 테스트 환경 설정을 위해 `zone.js/dist/zone-testing` 패키지들을 로드해야 합니다.
자세한 내용은 [테스트](guide/testing#비동기로-테스트하기-fakeasync) 문서를 참고하세요.

<div class="alert is-important">
<!--
If you create project with `Angular/CLI`, it is already imported in `src/test.ts`.
-->
Angular CLI로 프로젝트를 생성했다면 이 내용은 이미 `src/test.ts` 파일에 구성되어 있습니다.
</div>

<!--
And in the earlier versions of `Angular`, the following files were imported or added in your html file:
-->
이전에는 HTML 파일에서 이 파일들을 직접 로드하기도 했습니다:

```
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
```

<!--
You can still load those files separately, but the order is important, you must import `proxy` before `sync-test`, `async-test`, `fake-async-test` and `jasmine-patch`. And you also need to import `sync-test` before `jasmine-patch`, so it is recommended to just import `zone-testing` instead of loading those separated files.
-->
이 파일들 중에서 필요한 파일만 로드할 수도 있지만, 로드하는 순서가 중요합니다.
`proxy` 패키지는 `sync-test`, `async-test`, `fake-async-test`, `jasmine-patch`가 로드되기 전에 먼저 로드되어야 합니다.
그리고 `sync-test` 패키지는 `jasmine-patch`가 로드되기 전에 먼저 로드되어야 합니다.
그래서 개별 파일을 로드하지 말고 `zone-testing` 패키지를 한 번에 로드하는 것을 권장합니다.
