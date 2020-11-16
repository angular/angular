{@a top}
<!--
# Testing
-->
# 테스트

Testing your Angular application helps you check that your app is working as you expect.

## Prerequisites

Before writing tests for your Angular app, you should have a basic understanding of the following concepts:

* Angular fundamentals
* JavaScript
* HTML
* CSS
* [Angular CLI](/cli)

<hr>

The testing documentation offers tips and techniques for unit and integration testing Angular applications through a sample application created with the [Angular CLI](cli).
This sample application is much like the one in the [_Tour of Heroes_ tutorial](tutorial).

<div class="alert is-helpful">

  For the sample app that the testing guides describe, see the <live-example noDownload>sample app</live-example>.

  For the tests features in the testing guides, see <live-example stackblitz="specs" noDownload>tests</live-example>.

</div>

{@a setup}

## Set up testing

<!--
The Angular CLI downloads and installs everything you need to test an Angular application with the [Jasmine test framework](https://jasmine.github.io/).

The project you create with the CLI is immediately ready to test.
Just run the [`ng test`](cli/test) CLI command:

<code-example language="sh" class="code-shell">
  ng test
</code-example>

The `ng test` command builds the app in _watch mode_,
and launches the [Karma test runner](https://karma-runner.github.io).

The console output looks a bit like this:

<code-example language="sh" class="code-shell">
10% building modules 1/1 modules 0 active
...INFO [karma]: Karma v1.7.1 server started at http://0.0.0.0:9876/
...INFO [launcher]: Launching browser Chrome ...
...INFO [launcher]: Starting browser Chrome
...INFO [Chrome ...]: Connected on socket ...
Chrome ...: Executed 3 of 3 SUCCESS (0.135 secs / 0.205 secs)
</code-example>

The last line of the log is the most important.
It shows that Karma ran three tests that all passed.

A Chrome browser also opens and displays the test output in the "Jasmine HTML Reporter" like this.

<div class="lightbox">
  <img src='generated/images/guide/testing/initial-jasmine-html-reporter.png' alt="Jasmine HTML Reporter in the browser">
</div>

Most people find this browser output easier to read than the console log.
You can click on a test row to re-run just that test or click on a description to re-run the tests in the selected test group ("test suite").

Meanwhile, the `ng test` command is watching for changes.

To see this in action, make a small change to `app.component.ts` and save.
The tests run again, the browser refreshes, and the new test results appear.
-->
Angular 애플리케이션은 [Jasmine 테스트 프레임워크](https://jasmine.github.io/)로 테스트하는데, 애플리케이션을 테스트할 때 필요한 환경은 Angular CLI가 프로젝트를 생성하면서 모두 준비하기 때문에 바로 테스트할 수 있는 상태입니다.
프로젝트 최상위 폴더에서 [`ng test`](cli/test) 명령을 실행해 보세요:

<code-example language="sh" class="code-shell">
  ng test
</code-example>

`ng test` 명령을 실행하면 애플리케이션을 _워치 모드(watch mode)_ 로 빌드하고 [Karma 테스트 러너](https://karma-runner.github.io)를 실행합니다.

콘솔은 다음과 같이 출력될 것입니다:

<code-example language="sh" class="code-shell">
10% building modules 1/1 modules 0 active
...INFO [karma]: Karma v1.7.1 server started at http://0.0.0.0:9876/
...INFO [launcher]: Launching browser Chrome ...
...INFO [launcher]: Starting browser Chrome
...INFO [Chrome ...]: Connected on socket ...
Chrome ...: Executed 3 of 3 SUCCESS (0.135 secs / 0.205 secs)
</code-example>

이 로그에서 마지막 줄이 가장 중요합니다.
마지막 줄을 보면 Karma가 3개의 테스트를 실행했고, 실행한 테스트는 모두 통과했다는 것을 확인할 수 있습니다.

테스트 실행 결과는 Chrome 브라우저에서도 확인할 수 있습니다.
브라우저에서는 "Jasmine HTML Reporter"를 사용해서 다음과 같이 표시됩니다.

<div class="lightbox">
  <img src='generated/images/guide/testing/initial-jasmine-html-reporter.png' alt="브라우저에서 Jasmine HTML Reporter 확인하기">
</div>

테스트 결과는 콘솔 로그로 확인하는 것보다 브라우저에서 확인하는 것이 더 편합니다.
브라우저에서는 특정 테스트 스펙을 클릭해서 해당 스펙만 다시 실행해볼 수 있고, 테스트 그룹(test suite)을 클릭해서 그룹 단위로 다시 실행할 수도 있습니다.

그리고 `ng test` 명령을 실행했기 때문에 코드가 변경되는 것도 감지합니다.

`app.component.ts` 파일의 내용을 수정하고 저장해 보세요.
그러면 테스트가 다시 실행되면서 브라우저도 갱신되고, 새로운 결과 화면이 표시될 것입니다.


<!--
## Configuration
-->
#### 테스트 설정

<!--
The CLI takes care of Jasmine and Karma configuration for you.

You can fine-tune many options by editing the `karma.conf.js` in the root folder of the project and
the `test.ts` files in the `src/` folder.

The `karma.conf.js` file is a partial Karma configuration file.
The CLI constructs the full runtime configuration in memory, based on application structure specified in the `angular.json` file, supplemented by `karma.conf.js`.

Search the web for more details about Jasmine and Karma configuration.
-->
Angular CLI로 프로젝트를 생성하면 Jasmine과 Karma를 실행할 수 있는 환경 설정이 자동으로 구성됩니다.
이후에 이 설정을 튜닝하고 싶으면 프로젝트 최상위 폴더에 있는 `karma.conf.js` 파일과 `src/test.ts` 파일을 수정하면 됩니다.

`karma.conf.js` 파일은 Karma가 실행되는 환경설정 중 일부를 구성합니다.
Karma의 전체 설정값은 테스트를 실행하는 시점에 `angular.json` 파일과 `karma.conf.js`를 분석해서 Angular CLI가 구성합니다.

자세한 내용은 Jasmine 문서와 Karma 문서를 참고하세요.

<!--
### Other test frameworks
-->
#### 다른 테스트 프레임워크

<!--
You can also unit test an Angular app with other testing libraries and test runners.
Each library and runner has its own distinctive installation procedures, configuration, and syntax.

Search the web to learn more.
-->
Jasmine과 Karma 말고도 다른 라이브러리나 테스트 러너를 사용해서 Angular 앱을 테스트할 수도 있습니다.
이 때 라이브러리를 설치하는 방법, 환경을 설정하는 방법, 실행하는 방법은 라이브러리에 따라 다르기 때문에 사용하려는 라이브러리가 제공하는 문서를 참고하세요.

<!--
### Test file name and location
-->
#### 테스트 파일의 이름과 위치

<!--
Look inside the `src/app` folder.

The CLI generated a test file for the `AppComponent` named `app.component.spec.ts`.

<div class="alert is-important">

The test file extension **must be `.spec.ts`** so that tooling can identify it as a file with tests (AKA, a _spec_ file).

</div>

The `app.component.ts` and `app.component.spec.ts` files are siblings in the same folder.
The root file names (`app.component`) are the same for both files.

Adopt these two conventions in your own projects for _every kind_ of test file.
-->
`src/app` 폴더를 봅시다.

Angular CLI로 프로젝트를 생성하면 `AppComponent`를 테스트 하는 코드가 `app.component.spec.ts` 파일에 존재합니다.

<div class="alert is-important">

IDE와 같은 툴에서 스펙 파일을 구분하려면 테스트 파일의 확장자를 **반드시 `.spec.ts`**로 지정해야 합니다.

</div>

두 파일을 보면 `app.component.ts` 파일과 `app.component.spec.ts` 파일은 같은 폴더에 이웃한 파일이며, 두 파일의 컴포넌트 이름 부분(`app.component`)이 같다는 것을 확인할 수 있습니다.

이 룰은 프로젝트 안에 있는 _모든_ 테스트 파일에 적용하는 것이 좋습니다.


{@a q-spec-file-location}

#### Place your spec file next to the file it tests

It's a good idea to put unit test spec files in the same folder
as the application source code files that they test:

- Such tests are easy to find.
- You see at a glance if a part of your application lacks tests.
- Nearby tests can reveal how a part works in context.
- When you move the source (inevitable), you remember to move the test.
- When you rename the source file (inevitable), you remember to rename the test file.

{@a q-specs-in-test-folder}

#### Place your spec files in a test folder

Application integration specs can test the interactions of multiple parts
spread across folders and modules.
They don't really belong to any part in particular, so they don't have a
natural home next to any one file.

It's often better to create an appropriate folder for them in the `tests` directory.

Of course specs that test the test helpers belong in the `test` folder,
next to their corresponding helper files.


{@a ci}

<!--
## Set up continuous integration
-->
## 지속적인 통합환경 구성하기

<!--
One of the best ways to keep your project bug-free is through a test suite, but it's easy to forget to run tests all the time.
Continuous integration (CI) servers let you set up your project repository so that your tests run on every commit and pull request.

There are paid CI services like Circle CI and Travis CI, and you can also host your own for free using Jenkins and others.
Although Circle CI and Travis CI are paid services, they are provided free for open source projects.
You can create a public project on GitHub and add these services without paying.
Contributions to the Angular repo are automatically run through a whole suite of Circle CI tests.

This article explains how to configure your project to run Circle CI and Travis CI, and also update your test configuration to be able to run tests in the Chrome browser in either environment.
-->
프로젝트에서 발생하는 버그를 방지하려면 주기적으로 테스트를 실행하는 것이 좋지만, 매번 테스트를 실행해야 하는 것은 번거로운 일입니다.
이 때 프로젝트 레파지토리에 CI(Continuous integration) 서버를 연결하면 이 레파지토리에 커밋이나 풀 리퀘스트가 있을 때마다 자동으로 테스트를 실행하게 할 수 있습니다.

Circle CI와 Travis CI는 이런 경우에 사용하는 유료 CI 서비스입니다. 그리고 Jenkins와 같은 툴을 사용하면 무료 CI 환경을 구성할 수도 있습니다.
Circle CI와 Travis CI는 기본적으로 유료 서비스지만, 오픈 소스 프로젝트에는 무료로 사용할 수 있습니다.
그래서 GitHub에 public 프로젝트를 만들면 이 서비스를 무료로 사용할 수 있습니다.
Angular 공식 레파지토리에 코드를 반영할 때도 Circle CI 테스트가 자동으로 실행됩니다.

이 섹션에서는 프로젝트에 Circle CI와 Travis CI를 연결하는 방법에 대해 설명하고, 프로젝트의 테스트 스펙을 리모트 서버의 Chrome 브라우저에서 실행하는 방법에 대해 안내합니다.

<!--
### Configure project for Circle CI
-->
### Circle CI 환경 설정하기

<!--
Step 1: Create a folder called `.circleci` at the project root.

Step 2: In the new folder, create a file called `config.yml` with the following content:

```
version: 2
jobs:
  build:
    working_directory: ~/my-project
    docker:
      - image: circleci/node:10-browsers
    steps:
      - checkout
      - restore_cache:
          key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
      - run: npm install
      - save_cache:
          key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
          paths:
            - "node_modules"
      - run: npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI
      - run: npm run e2e -- --protractor-config=e2e/protractor-ci.conf.js
```

This configuration caches `node_modules/` and uses [`npm run`](https://docs.npmjs.com/cli/run-script) to run CLI commands, because `@angular/cli` is not installed globally.
The double dash (`--`) is needed to pass arguments into the `npm` script.

Step 3: Commit your changes and push them to your repository.

Step 4: [Sign up for Circle CI](https://circleci.com/docs/2.0/first-steps/) and [add your project](https://circleci.com/add-projects).
Your project should start building.

* Learn more about Circle CI from [Circle CI documentation](https://circleci.com/docs/2.0/).
-->
1단계: 프로젝트 최상위 폴더에 `.circleci` 폴더를 생성합니다.

2단계: 이 폴더에 `config.yml` 파일을 생성하고 파일의 내용을 다음과 같이 작성합니다:

```
version: 2
jobs:
  build:
    working_directory: ~/my-project
    docker:
      - image: circleci/node:10-browsers
    steps:
      - checkout
      - restore_cache:
          key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
      - run: npm install
      - save_cache:
          key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
          paths:
            - "node_modules"
      - run: npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI
      - run: npm run e2e -- --protractor-config=e2e/protractor-ci.conf.js
```

이 환경설정 파일의 내용은 `node_modules/` 폴더의 내용을 캐싱하고 [`npm run`](https://docs.npmjs.com/cli/run-script)으로 Angular CLI 명령을 실행하는 것입니다.
`@angular/cli`는 전역 범위에 필요하기 때문에 `npm install` 명령을 실행해서 설치했습니다.
그리고 `npm` 스크립트에 옵션을 지정하려면 대시 2개(`--`)를 함께 사용해야 합니다.

3단계: 변경사항을 커밋하고 레파지토리에 푸시합니다.

4단계: [Circle CI에 회원가입](https://circleci.com/docs/2.0/first-steps/)한 뒤에 [프로젝트를 추가](https://circleci.com/add-projects)하면 프로젝트 빌드가 시작됩니다.

* 더 자세한 내용은 [Circle CI 문서](https://circleci.com/docs/2.0/)를 참고하세요.


<!--
### Configure project for Travis CI
-->
### Travis CI 환경 설정하기

<!--
Step 1: Create a file called `.travis.yml` at the project root, with the following content:

```
dist: trusty
sudo: false

language: node_js
node_js:
  - "10"

addons:
  apt:
    sources:
      - google-chrome
    packages:
      - google-chrome-stable

cache:
  directories:
     - ./node_modules

install:
  - npm install

script:
  - npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI
  - npm run e2e -- --protractor-config=e2e/protractor-ci.conf.js
```

This does the same things as the CircleCI configuration, except that Travis doesn't come with Chrome, so use Chromium instead.

Step 2: Commit your changes and push them to your repository.

Step 3: [Sign up for Travis CI](https://travis-ci.org/auth) and [add your project](https://travis-ci.org/profile).
You'll need to push a new commit to trigger a build.

* Learn more about Travis CI testing from [Travis CI documentation](https://docs.travis-ci.com/).
-->
1단계: 프로젝트 최상위 폴더에 `.travis.yml` 파일을 생성하고 내용을 다음과 같이 작성합니다:

```
dist: trusty
sudo: false

language: node_js
node_js:
  - "10"

addons:
  apt:
    sources:
      - google-chrome
    packages:
      - google-chrome-stable

cache:
  directories:
     - ./node_modules

install:
  - npm install

script:
  - npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI
  - npm run e2e -- --protractor-config=e2e/protractor-ci.conf.js
```

이 환경설정 파일의 내용은 Circle CI에서 설정했던 내용과 같지만, Travis에는 Chrome이 설치되어있지 않기 때문에 Chromium을 추가로 설치했습니다.

2단계: 변경사항을 커밋하고 레파지토리에 푸시합니다.

3단계: [Travis CI에 회원가입](https://travis-ci.org/auth)한 뒤에 [프로젝트를 추가](https://circleci.com/add-projects)합니다.
빌드를 실행하려면 레파지토리에 새로운 커밋이 푸시되어야 합니다.

* 더 자세한 내용은 [Travis CI 문서](https://docs.travis-ci.com/)를 참고하세요.


<!--
### Configure CLI for CI testing in Chrome
-->
### CI 환경에서 Chrome으로 테스트하기

When the CLI commands `ng test` and `ng e2e` are generally running the CI tests in your environment, you might still need to adjust your configuration to run the Chrome browser tests.

There are configuration files for both the [Karma JavaScript test runner](https://karma-runner.github.io/latest/config/configuration-file.html)
and [Protractor](https://www.protractortest.org/#/api-overview) end-to-end testing tool,
which you must adjust to start Chrome without sandboxing.

We'll be using [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli) in these examples.

* In the Karma configuration file, `karma.conf.js`, add a custom launcher called ChromeHeadlessCI below browsers:
-->
로컬 개발환경에서 Angular CLI로 `ng test` 명령이나 `ng e2e` 명령을 실행하면 Chrome 브라우저가 실행되고 이 브라우저에서 테스트가 실행됩니다.

이런 환경을 구성하려면 [Karma JavaScript 테스트 러너](https://karma-runner.github.io/latest/config/configuration-file.html)와 e2e 테스트 툴인 [Protractor](https://www.protractortest.org/#/api-overview)가 실행될 환경이 모두 설정되어야 하며, Angular CLI로 생성한 프로젝트에는 이 환경은 자동으로 구성되어 있습니다.
하지만 CI 환경에서는 Chrome 브라우저를 직접 실행하지 않고 화면과 샌드박스 기능 없이 사용하는 것이 더 좋습니다.

이번 섹션에서는 [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli)을 사용하는 방법에 대해 알아봅시다.

* Karma 환경설정 파일 `karma.conf.js`에 커스텀 런처를 ChromeHeadlessCI를 추가합니다:

```
browsers: ['ChromeHeadlessCI'],
customLaunchers: {
  ChromeHeadlessCI: {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox']
  }
},
```

<!--
* In the root folder of your e2e tests project, create a new file named `protractor-ci.conf.js`. This new file extends the original `protractor.conf.js`.
-->
* e2e 테스트 프로젝트의 최상위 폴더에 `protractor-ci.conf.js` 파일을 생성합니다. 이 파일은 기존에 존재하는 `protractor.conf.js` 파일을 확장하는 용도로 사용합니다.

```
const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: ['--headless', '--no-sandbox']
  }
};

exports.config = config;
```

<!--
Now you can run the following commands to use the `--no-sandbox` flag:
-->
그러면 아래 명령들은 `--no-sandbox` 플래그가 지정된 채로 실행됩니다.

<code-example language="sh" class="code-shell">
  ng test --no-watch --no-progress --browsers=ChromeHeadlessCI
  ng e2e --protractor-config=e2e/protractor-ci.conf.js
</code-example>

<div class="alert is-helpful">

   <!--
   **Note:** Right now, you'll also want to include the `--disable-gpu` flag if you're running on Windows. See [crbug.com/737678](https://crbug.com/737678).
   -->
   **참고:** 개발 환경이 Windows라면 `--disable-gpu` 플래그를 사용하는 것이 나을 수 있습니다. 자세한 내용은 [이 링크](https://crbug.com/737678)를 참고하세요.

</div>


<hr />

## More info on testing

After you've set up your app for testing, you may find the following testing  guides useful.

* [Code coverage](guide/testing-code-coverage)&mdash;find out how much of your app your tests are covering and how to specify required amounts.
* [Testing services](guide/testing-services)&mdash;learn how to test the services your app uses.
* [Basics of testing components](guide/testing-components-basics)&mdash;discover the basics of testing Angular components.
* [Component testing scenarios](guide/testing-components-scenarios)&mdash;read about the various kinds of component testing scenarios and use cases.
* [Testing attribute directives](guide/testing-attribute-directives)&mdash;learn about how to test your attribute directives.
* [Testing pipes](guide/testing-pipes)&mdash;find out how to test attribute directives.
* [Debugging tests](guide/testing-attribute-directives)&mdash;uncover common testing bugs.
* [Testing utility APIs](guide/testing-utility-apis)&mdash;get familiar with Angular testing features.


