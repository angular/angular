<!--
# QuickStart
-->
# 시작하기

<!--
Good tools make application development quicker and easier to maintain than
if you did everything by hand.
-->
애플리케이션을 개발할 때 좋은 도구를 사용하면 모든 것을 수동으로 할 때보다 개발 속도를 향상시킬 수 있으며 유지보수하기도 편합니다.

<!--
The [**Angular CLI**](https://cli.angular.io/) is a **_command line interface_** tool
that can create a project, add files, and perform a variety of ongoing development tasks such
as testing, bundling, and deployment.
-->
[**Angular CLI**](https://cli.angular.io/)는 **_커맨드라인 인터페이스_**  툴이며, Angular 프로젝트를 생성하거나, 구성요소 추가 등 개발 단계에서 필요 수많은 작업을 지원합니다. 테스트나 번들링, 배포도 Angular CLI를 활용할 수 있습니다.

<!--
The goal in this guide is to build and run a simple Angular
application in TypeScript, using the Angular CLI
while adhering to the [Style Guide](guide/styleguide) recommendations that
benefit _every_ Angular project.
-->
이 문서의 목표는 Angular CLI를 사용해서 간단한 Angular 애플리케이션을 실행하는 것입니다.
이 때 [코딩 스타일 가이드](guide/styleguide)를 참고할 것이며, 이 스타일 가이드 문서는 _모든_ Angular 프로젝트에 활용할만 합니다.

<!--
By the end of the chapter, you'll have a basic understanding of development with the CLI
and a foundation for both these documentation samples and for real world applications.
-->
그래서 이 문서를 다 읽을때 쯤이면 CLI를 활용하는 개발 방법에 대해 이해하게 될 것이며, 이 문서에서 만드는 예제 프로젝트 뿐 아니라 실제 솔루션을 어떻게 구성해야 할지도 알게 될 것입니다.

<!--
And you can also <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">download the example.</a>
-->
이 문서에서 다루는 예제는 <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">이곳</a>에서 다운받아 확인할 수도 있습니다.

<h2 id='devenv'>
<!--
  Step 1. Set up the Development Environment
-->
  1단계. 개발환경 설정하기
</h2>

<!--
You need to set up your development environment before you can do anything.
-->
먼저, 개발환경을 준비해야 합니다.

<!--
Install **[Node.js® and npm](https://nodejs.org/en/download/)**
if they are not already on your machine.
-->
**[Node.js® 와 npm](https://nodejs.org/en/download/)**이 설치되어 있지 않다면 이 프로그램들을 설치합니다.

<div class="l-sub-section">

<!--
**Verify that you are running at least node `6.9.x` and npm `3.x.x`**
by running `node -v` and `npm -v` in a terminal/console window.
Older versions produce errors, but newer versions are fine.
-->
터미널이나 콘솔창에서 `node -v` 명령과 `npm -v` 명령을 실행하면 버전을 확인할 수 있습니다. 이 때 **node.js 버전은 `6.9.x` 이상, npm 버전은 `3.x.x` 이상**을 권장합니다.
이전 버전에서는 일부 동작에서 에러가 발생할 수 있습니다.

</div>

<!--
Then **install the [Angular CLI](https://github.com/angular/angular-cli)** globally.
-->
그리고 **[Angular CLI](https://github.com/angular/angular-cli)**를 전역으로 설치합니다.


<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>




<h2 id='create-proj'>
<!--
  Step 2. Create a new project
-->
  2단계. 프로젝트 생성하기
</h2>


<!--
Open a terminal window.
-->
터미널 창을 엽니다.

<!--
Generate a new project and skeleton application by running the following commands:
-->
그리고 다음 명령을 실행하면 애플리케이션의 기본 틀을 구성하면서 프로젝트를 생성합니다:

<code-example language="sh" class="code-shell">
  ng new my-app

</code-example>



<div class="l-sub-section">

<!--
Patience, please.
It takes time to set up a new project; most of it is spent installing npm packages.
-->
새 프로젝트를 생성하는 과정은 시간이 오래 걸립니다. 이 중 대부분은 npm 패키지를 설치하는 시간입니다.

</div>




<h2 id='serve'>
<!--
  Step 3: Serve the application
-->
  3단계: 애플리케이션 시작하기
</h2>


<!--
Go to the project directory and launch the server.
-->
프로젝트 폴더로 이동해서 서버를 실행합니다.


<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>


<!--
The `ng serve` command launches the server, watches your files,
and rebuilds the app as you make changes to those files.
-->
`ng serve` 명령을 실행하면 서버를 실행하면서 파일이 변경되는 것을 감지하고, 파일이 변경되면 애플리케이션을 다시 빌드해서 서버에 자동으로 반영합니다.

<!--
Using the `--open` (or just `-o`) option will automatically open your browser
on `http://localhost:4200/`.
-->
서버를 시작하면서 브라우저를 자동으로 실행하려면 `--open` 이나 `-o` 옵션을 사용하면 됩니다.

<!--
Your app greets you with a message:
-->
그리고 브라우저로 접속하면 다음과 같은 화면을 확인할 수 있습니다:

<figure>
  <img src='generated/images/guide/cli-quickstart/app-works.png' alt="The app works!">
</figure>




<h2 id='first-component'>
<!--
  Step 4: Edit your first Angular component
-->
  4단계. 컴포넌트 수정하기
</h2>

<!--
The CLI created the first Angular component for you.
This is the _root component_ and it is named `app-root`.
You can find it in `./src/app/app.component.ts`.
-->
CLI로 Angular 프로젝트를 생성하면 `app-root`라는 이름으로 _최상위 컴포넌트_ 를 생성합니다. 이 컴포넌트는 `./src/app/app.component.ts`에 정의되어 있습니다.

<!--
Open the component file and change the `title` property from `'app'` to `'My First Angular App!'`.
-->
이 파일을 열고 `title` 프로퍼티의 값을 `'app'`에서 `'My First Angular App!'`로 바꿔 보세요.

<code-example path="cli-quickstart/src/app/app.component.ts" region="title" title="src/app/app.component.ts" linenums="false"></code-example>


<!--
The browser reloads automatically with the revised title. That's nice, but it could look better.
-->
그러면 브라우저가 페이지를 자동으로 갱신하면서 변경된 값을 화면에 표시합니다. 이것만으로도 좋지만 좀 더 보기 좋게 꾸며봅시다.

<!--
Open `src/app/app.component.css` and give the component some style.
-->
`src/app/app.component.css` 파일을 열어서 컴포넌트에 스타일을 지정해 봅시다.

<code-example path="cli-quickstart/src/app/app.component.css" title="src/app/app.component.css" linenums="false"></code-example>



<figure>
  <img src='generated/images/guide/cli-quickstart/my-first-app.png' alt="Output of QuickStart app">
</figure>


<!--
Looking good!
-->
좀 더 보기 좋네요!


## What's next?
That's about all you'd expect to do in a "Hello, World" app.

You're ready to take the [Tour of Heroes Tutorial](tutorial) and build
a small application that demonstrates the great things you can build with Angular.

Or you can stick around a bit longer to learn about the files in your brand new project.



## Project file review

An Angular CLI project is the foundation for both quick experiments and enterprise solutions.

The first file you should check out is `README.md`.
It has some basic information on how to use CLI commands.
Whenever you want to know more about how Angular CLI works make sure to visit
[the Angular CLI repository](https://github.com/angular/angular-cli) and
[Wiki](https://github.com/angular/angular-cli/wiki).

Some of the generated files might be unfamiliar to you.



### The `src` folder
Your app lives in the `src` folder.
All Angular components, templates, styles, images, and anything else your app needs go here.
Any files outside of this folder are meant to support building your app.


<div class='filetree'>
  <div class='file'>src</div>
  <div class='children'>
    <div class='file'>app</div>
    <div class='children'>
      <div class='file'>app.component.css</div>
      <div class='file'>app.component.html</div>
      <div class="file">app.component.spec.ts</div>
      <div class="file">app.component.ts</div>
      <div class="file">app.module.ts</div>
    </div>
    <div class="file">assets</div>
    <div class='children'>
      <div class="file">.gitkeep</div>
    </div>
    <div class="file">environments</div>
    <div class='children'>
      <div class="file">environment.prod.ts</div>
      <div class="file">environment.ts</div>
    </div>
    <div class="file">favicon.ico</div>
    <div class="file">index.html</div>
    <div class="file">main.ts</div>
    <div class="file">polyfills.ts</div>
    <div class="file">styles.css</div>
    <div class="file">test.ts</div>
    <div class="file">tsconfig.app.json</div>
    <div class="file">tsconfig.spec.json</div>
  </div>
</div>



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
      File
    </th>
    <th>
      Purpose
    </th>
  </tr>
  <tr>
    <td>

      `app/app.component.{ts,html,css,spec.ts}`

    </td>
    <td>

      Defines the `AppComponent` along with an HTML template, CSS stylesheet, and a unit test.
      It is the **root** component of what will become a tree of nested components
      as the application evolves.

    </td>
  </tr>
  <tr>
    <td>

      `app/app.module.ts`

    </td>
    <td>

      Defines `AppModule`, the [root module](guide/bootstrapping "AppModule: the root module") that tells Angular how to assemble the application.
      Right now it declares only the `AppComponent`.
      Soon there will be more components to declare.

    </td>
  </tr>
  <tr>
    <td>

      `assets/*`

    </td>
    <td>

      A folder where you can put images and anything else to be copied wholesale
      when you build your application.

    </td>
  </tr>
  <tr>
    <td>

      `environments/*`

    </td>
    <td>

      This folder contains one file for each of your destination environments,
      each exporting simple configuration variables to use in your application.
      The files are replaced on-the-fly when you build your app.
      You might use a different API endpoint for development than you do for production
      or maybe different analytics tokens.
      You might even use some mock services.
      Either way, the CLI has you covered.

    </td>
  </tr>
  <tr>
    <td>

      `favicon.ico`

    </td>
    <td>

      Every site wants to look good on the bookmark bar.
      Get started with your very own Angular icon.

    </td>
  </tr>
  <tr>
    <td>

      `index.html`

    </td>
    <td>

      The main HTML page that is served when someone visits your site.
      Most of the time you'll never need to edit it.
      The CLI automatically adds all `js` and `css` files when building your app so you
      never need to add any `<script>` or `<link>` tags here manually.

    </td>
  </tr>
  <tr>
    <td>

      `main.ts`

    </td>
    <td>

      The main entry point for your app.
      Compiles the application with the [JIT compiler](guide/glossary#jit)
      and bootstraps the application's root module (`AppModule`) to run in the browser.
      You can also use the [AOT compiler](guide/aot-compiler)
      without changing any code by appending the`--aot` flag to the `ng build` and `ng serve` commands.

    </td>
  </tr>
  <tr>
    <td>

      `polyfills.ts`

    </td>
    <td>

      Different browsers have different levels of support of the web standards.
      Polyfills help normalize those differences.
      You should be pretty safe with `core-js` and `zone.js`, but be sure to check out
      the [Browser Support guide](guide/browser-support) for more information.

    </td>
  </tr>
  <tr>
    <td>

      `styles.css`

    </td>
    <td>

      Your global styles go here.
      Most of the time you'll want to have local styles in your components for easier maintenance,
      but styles that affect all of your app need to be in a central place.

    </td>
  </tr>
  <tr>
    <td>

      `test.ts`

    </td>
    <td>

      This is the main entry point for your unit tests.
      It has some custom configuration that might be unfamiliar, but it's not something you'll
      need to edit.
    </td>
  </tr>
  <tr>
    <td>

      `tsconfig.{app|spec}.json`
    </td>
    <td>

      TypeScript compiler configuration for the Angular app (`tsconfig.app.json`)
      and for the unit tests (`tsconfig.spec.json`).

    </td>
  </tr>
</table>

### The root folder

The `src/` folder is just one of the items inside the project's root folder.
Other files help you build, test, maintain, document, and deploy the app.
These files go in the root folder next to `src/`.


<div class='filetree'>
  <div class="file">my-app</div>
  <div class='children'>
    <div class="file">e2e</div>
    <div class='children'>
      <div class="file">app.e2e-spec.ts</div>
      <div class="file">app.po.ts</div>
      <div class="file">tsconfig.e2e.json</div>
    </div>
    <div class="file">node_modules/...</div>
    <div class="file">src/...</div>
    <div class="file">.angular-cli.json</div>
    <div class="file">.editorconfig</div>
    <div class="file">.gitignore</div>
    <div class="file">karma.conf.js</div>
    <div class="file">package.json</div>
    <div class="file">protractor.conf.js</div>
    <div class="file">README.md</div>
    <div class="file">tsconfig.json</div>
    <div class="file">tslint.json</div>
  </div>
</div>

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
      File
    </th>
    <th>
      Purpose
    </th>
  </tr>
  <tr>
    <td>

      `e2e/`

    </td>
    <td>

      Inside `e2e/` live the end-to-end tests.
      They shouldn't be inside `src/` because e2e tests are really a separate app that
      just so happens to test your main app.
      That's also why they have their own `tsconfig.e2e.json`.

    </td>
  </tr>
  <tr>
    <td>

      `node_modules/`

    </td>
    <td>

      `Node.js` creates this folder and puts all third party modules listed in
      `package.json` inside of it.
    </td>
  </tr>
  <tr>
    <td>

      `.angular-cli.json`

    </td>
    <td>

      Configuration for Angular CLI.
      In this file you can set several defaults and also configure what files are included
      when your project is built.
      Check out the official documentation if you want to know more.

    </td>
  </tr>
  <tr>
    <td>

      `.editorconfig`

    </td>
    <td>

      Simple configuration for your editor to make sure everyone that uses your project
      has the same basic configuration.
      Most editors support an `.editorconfig` file.
      See http://editorconfig.org for more information.

    </td>
  </tr>
  <tr>
    <td>

      `.gitignore`

    </td>
    <td>

      Git configuration to make sure autogenerated files are not committed to source control.

    </td>
  </tr>
  <tr>
    <td>

      `karma.conf.js`

    </td>
    <td>

      Unit test configuration for the [Karma test runner](https://karma-runner.github.io),
      used when running `ng test`.

    </td>
  </tr>
  <tr>
    <td>

      `package.json`

    </td>
    <td>

      `npm` configuration listing the third party packages your project uses.
      You can also add your own [custom scripts](https://docs.npmjs.com/misc/scripts) here.

    </td>
  </tr>
  <tr>
    <td>

      `protractor.conf.js`

    </td>
    <td>

      End-to-end test configuration for [Protractor](http://www.protractortest.org/),
      used when running `ng e2e`.

    </td>
  </tr>
  <tr>
    <td>

      `README.md`

    </td>
    <td>

      Basic documentation for your project, pre-filled with CLI command information.
      Make sure to enhance it with project documentation so that anyone
      checking out the repo can build your app!

    </td>
  </tr>
  <tr>
    <td>

      `tsconfig.json`

    </td>
    <td>

      TypeScript compiler configuration for your IDE to pick up and give you helpful tooling.

    </td>
  </tr>
  <tr>
    <td>

      `tslint.json`

    </td>
    <td>

      Linting configuration for [TSLint](https://palantir.github.io/tslint/) together with
      [Codelyzer](http://codelyzer.com/), used when running `ng lint`.
      Linting helps keep your code style consistent.

    </td>
  </tr>
</table>

<div class="l-sub-section">

### Next Step

If you're new to Angular, continue with the
[tutorial](tutorial "Tour of Heroes tutorial").
You can skip the "Setup" step since you're already using the Angular CLI setup.

</div>
