{@a top}
<!--
# Testing
-->
# 테스트

<!--
This guide offers tips and techniques for unit and integration testing Angular applications.

The guide presents tests of a sample application created with the [Angular CLI](cli). This sample application is much like the one created in the [_Tour of Heroes_ tutorial](tutorial).
The sample application and all tests in this guide are available for inspection and experimentation:

- <live-example embedded-style>Sample app</live-example>
- <live-example stackblitz="specs">Tests</live-example>
-->
이 문서는 Angular 애플리케이션에 유닛 테스트와 통합 테스트를 적용하는 방법에 대해 설명합니다.

내용을 설명하면서 사용하는 예제 애플리케이션은 [Angular CLI](cli)를 사용해서 만든 것이며, [_히어로들의 여행_ 튜토리얼](tutorial)에서 다룬 애플리케이션과도 비슷합니다.
이 문서에서 다루는 예제 애플리케이션과 모든 테스트 코드는 다음 링크에서 직접 확인하거나 다운받아 확인할 수 있습니다.

- <live-example embedded-style>예제 앱 실행</live-example>
- <live-example stackblitz="specs">테스트 코드 실행</live-example>

<hr>

<!--
## Setup
-->
## 환경 설정

<!--
The Angular CLI downloads and install everything you need to test an Angular application with the [Jasmine test framework](https://jasmine.github.io/).

The project you create with the CLI is immediately ready to test.
Just run the [`ng test`](cli/test) CLI command:
-->
Angular 애플리케이션은 [Jasmine 테스트 프레임워크](https://jasmine.github.io/)로 테스트하는데, 애플리케이션을 테스트할 때 필요한 환경은 Angular CLI가 프로젝트를 생성하면서 모두 준비하기 때문에 바로 테스트할 수 있는 상태입니다.
프로젝트 최상위 폴더에서 [`ng test`](cli/test) 명령을 실행해 보세요:

<code-example language="sh" class="code-shell">
  ng test
</code-example>

<!--
The `ng test` command builds the app in _watch mode_,
and launches the [Karma test runner](https://karma-runner.github.io).

The console output looks a bit like this:
-->
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

<!--
The last line of the log is the most important.
It shows that Karma ran three tests that all passed.

A chrome browser also opens and displays the test output in the "Jasmine HTML Reporter" like this.
-->
이 로그에서 마지막 줄이 가장 중요합니다.
마지막 줄을 보면 Karma가 3개의 테스트를 실행했고, 실행한 테스트는 모두 통과했다는 것을 확인할 수 있습니다.

테스트 실행 결과는 Chrome 브라우저에서도 확인할 수 있습니다.
브라우저에서는 "Jasmine HTML Reporter"를 사용해서 다음과 같이 표시됩니다.

<!--
<figure>
  <img src='generated/images/guide/testing/initial-jasmine-html-reporter.png' alt="Jasmine HTML Reporter in the browser">
</figure>
-->
<figure>
  <img src='generated/images/guide/testing/initial-jasmine-html-reporter.png' alt="브라우저에서 Jasmine HTML Reporter 확인하기">
</figure>

<!--
Most people find this browser output easier to read than the console log.
You can click on a test row to re-run just that test or click on a description to re-run the tests in the selected test group ("test suite").

Meanwhile, the `ng test` command is watching for changes.

To see this in action, make a small change to `app.component.ts` and save.
The tests run again, the browser refreshes, and the new test results appear.
-->
테스트 결과는 콘솔 로그로 확인하는 것보다 브라우저에서 확인하는 것이 더 편합니다.
브라우저에서는 특정 테스트 스펙을 클릭해서 해당 스펙만 다시 실행해볼 수 있고, 테스트 그룹(test suite)을 클릭해서 그룹 단위로 다시 실행할 수도 있습니다.

그리고 `ng test` 명령을 실행했기 때문에 코드가 변경되는 것도 감지합니다.

`app.component.ts` 파일의 내용을 수정하고 저장해 보세요.
그러면 테스트가 다시 실행되면서 브라우저도 갱신되고, 새로운 결과 화면이 표시될 것입니다.

<!--
#### Configuration
-->
#### 테스트 설정

<!--
The CLI takes care of Jasmine and Karma configuration for you.

You can fine-tune many options by editing the `karma.conf.js` and
the `test.ts` files in the `src/` folder.

The `karma.conf.js` file is a partial Karma configuration file.
The CLI constructs the full runtime configuration in memory, based on application structure specified in the `angular.json` file, supplemented by `karma.conf.js`.

Search the web for more details about Jasmine and Karma configuration.
-->
Angular CLI로 프로젝트를 생성하면 Jasmine과 Karma를 실행할 수 있는 환경 설정이 자동으로 구성됩니다.
이후에 이 설정을 튜닝하고 싶으면 `karma.conf.js` 파일과 `src/test.ts` 파일을 수정하면 됩니다.

`karma.conf.js` 파일은 Karma가 실행되는 환경설정 중 일부를 구성합니다.
Karma의 전체 설정값은 테스트를 실행하는 시점에 `angular.json` 파일과 `karma.conf.js`를 분석해서 Angular CLI가 구성합니다.

자세한 내용은 Jasmine 문서와 Karma 문서를 참고하세요.

<!--
#### Other test frameworks
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
#### Test file name and location
-->
#### 테스트 파일의 이름과 위치

<!--
Look inside the `src/app` folder.

The CLI generated a test file for the `AppComponent` named `app.component.spec.ts`.
-->
`src/app` 폴더를 봅시다.

Angular CLI로 프로젝트를 생성하면 `AppComponent`를 테스트 하는 코드가 `app.component.spec.ts` 파일에 존재합니다.

<div class="alert is-important">

<!--
The test file extension **must be `.spec.ts`** so that tooling can identify it as a file with tests (AKA, a _spec_ file).
-->
IDE와 같은 툴에서 스펙 파일을 구분하려면 테스트 파일의 확장자를 **반드시 `.spec.ts`**로 지정해야 합니다.

</div>

<!--
The `app.component.ts` and `app.component.spec.ts` files are siblings in the same folder.
The root file names (`app.component`) are the same for both files.

Adopt these two conventions in your own projects for _every kind_ of test file.
-->
두 파일을 보면 `app.component.ts` 파일과 `app.component.spec.ts` 파일은 같은 폴더에 이웃한 파일이며, 두 파일의 컴포넌트 이름 부분(`app.component`)이 같다는 것을 확인할 수 있습니다.

이 룰은 프로젝트 안에 있는 _모든_ 테스트 파일에 적용하는 것이 좋습니다.

{@a ci}

<!--
## Set up continuous integration
-->
## 지속적인 통합환경 구성하기

<!--
One of the best ways to keep your project bug free is through a test suite, but it's easy to forget to run tests all the time. 
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
-->
1단계: 프로젝트 최상위 폴더에 `.circleci` 폴더를 생성합니다.

2단계: 이 폴더에 `config.yml` 파일을 생성하고 파일의 내용을 다음과 같이 작성합니다:

```
version: 2
jobs:
  build:
    working_directory: ~/my-project
    docker:
      - image: circleci/node:8-browsers
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

<!--
This configuration caches `node_modules/` and uses [`npm run`](https://docs.npmjs.com/cli/run-script) to run CLI commands, because `@angular/cli` is not installed globally. 
The double dash (`--`) is needed to pass arguments into the `npm` script.

Step 3: Commit your changes and push them to your repository.

Step 4: [Sign up for Circle CI](https://circleci.com/docs/2.0/first-steps/) and [add your project](https://circleci.com/add-projects). 
Your project should start building.

* Learn more about Circle CI from [Circle CI documentation](https://circleci.com/docs/2.0/).
-->
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
-->
1단계: 프로젝트 최상위 폴더에 `.travis.yml` 파일을 생성하고 내용을 다음과 같이 작성합니다:

```
dist: trusty
sudo: false

language: node_js
node_js:
  - "8"
  
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

<!--
This does the same things as the Circle CI configuration, except that Travis doesn't come with Chrome, so we use Chromium instead.

Step 2: Commit your changes and push them to your repository.

Step 3: [Sign up for Travis CI](https://travis-ci.org/auth) and [add your project](https://travis-ci.org/profile). 
You'll need to push a new commit to trigger a build.

* Learn more about Travis CI testing from [Travis CI documentation](https://docs.travis-ci.com/).
-->
이 환경설정 파일의 내용은 Circle CI에서 설정했던 내용과 같지만, Travis에는 Chrome이 설치되어있지 않기 때문에 Chromium을 추가로 설치했습니다.

2단계: 변경사항을 커밋하고 레파지토리에 푸시합니다.

3단계: [Travis CI에 회원가입](https://travis-ci.org/auth)한 뒤에 [프로젝트를 추가](https://circleci.com/add-projects)합니다.
빌드를 실행하려면 레파지토리에 새로운 커밋이 푸시되어야 합니다.

* 더 자세한 내용은 [Travis CI 문서](https://docs.travis-ci.com/)를 참고하세요.

<!--
### Configure CLI for CI testing in Chrome
-->
### CI 환경에서 Chrome으로 테스트하기

<!--
When the CLI commands `ng test` and `ng e2e` are generally running the CI tests in your environment, you might still need to adjust your configuration to run the Chrome browser tests.

There are configuration files for both the [Karma JavaScript test runner](https://karma-runner.github.io/latest/config/configuration-file.html) 
and [Protractor](https://www.protractortest.org/#/api-overview) end-to-end testing tool, 
which  you must adjust to start Chrome without sandboxing.

We'll be using [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli) in these examples.

* In the Karma configuration file, `karma.conf.js`, add a custom launcher called ChromeHeadlessCI below browsers:
-->
로컬 개발환경에서 Angular CLI로 `ng test` 명령이나 `ng e2e` 명령을 실행하면 Chrome 브라우저가 실행되고 이 브라우저에서 테스트가 실행됩니다.

이런 환경을 구성하려면 [Karma JavaScript 테스트 러너](https://karma-runner.github.io/latest/config/configuration-file.html)와 e2e 테스트 툴인 [Protractor](https://www.protractortest.org/#/api-overview)가 실행될 환경이 모두 설정되어야 하며, Angular CLI로 생성한 프로젝트에는 이 환경은 자동으로 구성되어 있습니다.
하지만 CI 환경에서는 Chrome 브라우저를 직접 실행하지 않고 화면과 샌드박스 기능 없이 사용하는 것이 더 좋습니다.

이번 섹션에서는 [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli)을 사용하는 방법에 대해 알아봅시다.

* Karma 환경설정 파일 `karma.conf.js`에 커스텀 런처를 ChromeHeadlessCI를 추가합니다:

```
browsers: ['Chrome'],
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

{@a code-coverage}

<!--
## Enable code coverage reports
-->
## 코드 커버리지 리포트 활성화하기

<!--
The CLI can run unit tests and create code coverage reports. 
Code coverage reports show you  any parts of our code base that may not be properly tested by your unit tests.

To generate a coverage report run the following command in the root of your project.
-->
Angular CLI로 유닛 테스트를 실행하면서 코드 커버리지 리포트를 생성할 수 있습니다.
코드 커버리지 리포트를 확인하면 유닛 테스트가 얼마나 충실하게 작성되었는지 확인할 수 있습니다.

커버리지 리포트를 생성하려면 프로젝트를 테스트할 때 다음과 같이 실행하면 됩니다.

<code-example language="sh" class="code-shell">
  ng test --no-watch --code-coverage
</code-example>

<!--
When  the tests are complete, the command creates a new `/coverage` folder in the project. Open the `index.html` file to see a report with your source code and code coverage values.

If you want to create code-coverage reports every time you test, you can set the following option in the CLI configuration file, `angular.json`:
-->
이제 테스트가 끝나면 프로젝트에 `/coverage` 폴더가 생성됩니다.
이 폴더에 있는 `index.html` 파일을 확인하면 소스 코드가 분석된 내용과 코드 커버리지를 확인할 수 있습니다.

그리고 애플리케이션을 테스트를 할때마다 코드 커버리지 리포트를 생성하려면 Angular CLI 설정 파일 `angular.json`를 다음과 같이 수정하면 됩니다:

```
  "test": {
    "options": {
      "codeCoverage": true
    }
  }
```

<!--
### Code coverage enforcement
-->
### 코드 커버리지 강제하기

<!--
The code coverage percentages let you estimate how much of your code is tested.  
If your team decides on a set minimum amount to be unit tested, you can enforce this minimum with the Angular CLI. 

For example, suppose you want the code base to have a minimum of 80% code coverage. 
To enable this, open the [Karma](https://karma-runner.github.io) test platform configuration file, `karma.conf.js`, and add the following in the `coverageIstanbulReporter:` key.
-->
코드 커버리지 퍼센트를 확인하면 프로젝트 코드가 얼마나 충실하게 테스트되는지 확인할 수 있습니다.
이 때 팀에서 유닛 테스트하기로 정한 최소한의 비율이 있다면, 이 비율을 강제하도록 Angular CLI를 설정할 수 있습니다.

예를 들어 최소한 80% 이상의 코드가 테스트 대상이 되어야 한다고 합시다.
그러면 [Karma](https://karma-runner.github.io) 설정 파일 `karma.conf.js` 파일을 열어서 `coverageIstanbulReporter` 키에 선언된 내용을 다음과 같이 수정하면 됩니다.

```
coverageIstanbulReporter: {
  reports: [ 'html', 'lcovonly' ],
  fixWebpackSourcePaths: true,
  thresholds: {
    statements: 80,
    lines: 80,
    branches: 80,
    functions: 80
  }
}
```

<!--
The `thresholds` property causes the tool to enforce a minimum of 80% code coverage when the unit tests are run in the project.
-->
이제 `thresholds` 프로퍼티를 추가했기 때문에 이 프로젝트에서 유닛테스트를 실행할 때 코드 커버리지는8 0% 이상이 되어야 합니다.

<!--
## Service Tests
-->
## 서비스 테스트하기

<!--
Services are often the easiest files to unit test.
Here are some synchronous and asynchronous unit tests of the `ValueService`
written without assistance from Angular testing utilities.
-->
서비스는 Angular 구성요소 중에서 유닛 테스트하기 가장 쉬운 구성요소입니다.
이번 섹션에서는 Angular 테스트 유틸리티를 활용해서 `ValueService`를 동기적으로, 비동기적으로 테스트하는 방법에 대해 소개합니다.

<code-example path="testing/src/app/demo/demo.spec.ts" region="ValueService" header="app/demo/demo.spec.ts"></code-example>

{@a services-with-dependencies}

<!--
#### Services with dependencies
-->
#### 의존성 객체가 존재하는 서비스

<!--
Services often depend on other services that Angular injects into the constructor.
In many cases, it's easy to create and _inject_ these dependencies by hand while
calling the service's constructor.

The `MasterService` is a simple example:
-->
서비스는 생성자로 다른 서비스를 의존성으로 주입받을 수 있습니다.
의존성 객체가 있는 서비스를 간단하게 생성하려면 의존성 객체를 직접 생성한 후에 서비스 클래스에 `new` 키워드를 사용할 때 인자로 전달하면 됩니다.

`MasterService`의 경우를 봅시다:

<code-example path="testing/src/app/demo/demo.ts" region="MasterService" header="app/demo/demo.ts" linenums="false"></code-example>

<!--
`MasterService` delegates its only method, `getValue`, to the injected `ValueService`.

Here are several ways to test it.
-->
`MasterService`에는 `getValue` 메소드만 정의되어 있으며, 이 서비스는 `ValueService`를 의존성으로 주입받습니다.

그러면 `MasterService`를 다음과 같이 다양하게 테스트할 수 있습니다.

<code-example path="testing/src/app/demo/demo.spec.ts" region="MasterService" header="app/demo/demo.spec.ts"></code-example>

<!--
The first test creates a `ValueService` with `new` and passes it to the `MasterService` constructor.

However, injecting the real service rarely works well as most dependent services are difficult to create and control.

Instead you can mock the dependency, use a dummy value, or create a
[spy](https://jasmine.github.io/2.0/introduction.html#section-Spies)
on the pertinent service method.
-->
첫번째 테스트에서는 `new` 키워드를 사용해서 `ValueService`의 인스턴스를 직접 생성하고, 이 인스턴스를 `MasterService`의 생성자로 전달합니다.

그런데 실제 서비스 클래스를 의존성으로 주입하면, 이 클래스가 실제로 어떤 동작을 할지 제어하기 힘들기 때문에  테스트가 제대로 동작하지 않을 가능성이 더 높아집니다.

그렇다면 실제 서비스 대신 더미 객체나 [스파이(spy)](https://jasmine.github.io/2.0/introduction.html#section-Spies)를 활용하는 것이 더 간편합니다.

<div class="alert is-helpful">

<!--
Prefer spies as they are usually the easiest way to mock services.
-->
서비스를 모킹(mocking)하는 방법 중 간단한 방법은 스파이를 활용하는 것입니다.
스파이를 적극적으로 활용하세요.

</div>

<!--
These standard testing techniques are great for unit testing services in isolation.

However, you almost always inject services into application classes using Angular
dependency injection and you should have tests that reflect that usage pattern.
Angular testing utilities make it easy to investigate how injected services behave.
-->
이렇게 작성하면 테스트하려는 서비스만 따로 분리할 수 있기 때문에 테스트하기 편합니다.

하지만 의존성 관계가 복잡하게 엮여 있거나 실제 사용하는 패턴으로 테스트를 실행해야 한다면 조금 다른 방법이 필요합니다.
이런 상황에서 활용할 수 있는 Angular 테스트 기능에 대해 알아봅시다.

<!--
#### Testing services with the _TestBed_
-->
#### _TestBed_ 로 서비스 테스트하기

<!--
Your app relies on Angular [dependency injection (DI)](guide/dependency-injection)
to create services.
When a service has a dependent service, DI finds or creates that dependent service.
And if that dependent service has its own dependencies, DI finds-or-creates them as well.

As service _consumer_, you don't worry about any of this.
You don't worry about the order of constructor arguments or how they're created.

As a service _tester_, you must at least think about the first level of service dependencies
but you _can_ let Angular DI do the service creation and deal with constructor argument order
when you use the `TestBed` testing utility to provide and create services.
-->
서비스의 인스턴스를 생성할 때는 Angular가 제공하는 [의존성 주입(Dependency Injection, DI)](guide/dependency-injection) 시스템을 활용할 수도 있습니다.
서비스에 의존성으로 주입될 서비스가 있다면, 이 의존성 객체의 인스턴스를 찾는 역할을 DI에 맡기는 방식입니다.
의존성으로 주입되는 서비스에 또다른 의존성이 필요하다면 이 의존성 객체를 찾는 것도 DI가 처리합니다.

개발자는 테스트할 서비스만 신경쓰면 됩니다.
의존성 객체를 어떻게 생성하는지, 생성자에 전달하는 순서는 어떻게 되는지 신경쓸 필요가 없습니다.

서비스를 테스트하는 입장에서도 테스트할 서비스 하나만 생각하면 됩니다.
`TestBed`를 활용하면 해당 서비스에 연결된 의존성 관계는 모두 Angular DI가 처리합니다.

{@a testbed}

#### Angular _TestBed_

<!--
The `TestBed` is the most important of the Angular testing utilities.
The `TestBed` creates a dynamically-constructed Angular _test_ module that emulates
an Angular [@NgModule](guide/ngmodules).

The `TestBed.configureTestingModule()` method takes a metadata object that can have most of the properties of an [@NgModule](guide/ngmodules).

To test a service, you set the `providers` metadata property with an
array of the services that you'll test or mock.
-->
`TestBed`는 Angular가 제공하는 테스트 유틸리티 중 가장 중요한 객체입니다.
`TestBed`는 Angular에서 [@NgModule](guide/ngmodules) 역할을 하는 _테스트_ 모듈을 동적으로 생성합니다.

`TestBed.configureTestingModule()` 메소드는 메타데이터 객체를 인자로 받는데, 메타데이터는 [@NgModule](guide/ngmodules)에 사용하는 프로퍼티를 거의 대부분 지원합니다.

그래서 `NgModule`에 `providers` 메타데이터 프로퍼티를 지정했던 것처럼 `TestBed.configureTestingModule()` 메소드에도 `providers` 프로퍼티를 지정할 수 있습니다.

<!--
<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-before-each"
  header="app/demo/demo.testbed.spec.ts (provide ValueService in beforeEach">
</code-example>
-->
<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-before-each"
  header="app/demo/demo.testbed.spec.ts (beforeEach()에서 ValueService 준비하기)">
</code-example>

<!--
Then inject it inside a test by calling `TestBed.get()` with the service class as the argument.
-->
그리고 `TestBed.get()` 함수를 실행하면서 인자로 서비스 클래스를 전달하면 서비스 클래스의 인스턴스를 참조할 수 있습니다.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-inject-it">
</code-example>

<!--
Or inside the `beforeEach()` if you prefer to inject the service as part of your setup.
-->
아니면 `beforeEach()` 안쪽에서 서비스 객체의 인스턴스를 변수에 할당해 둘 수도 있습니다.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-inject-before-each">
</code-example>

<!--
When testing a service with a dependency, provide the mock in the `providers` array.

In the following example, the mock is a spy object.
-->
서비스에 의존성으로 주입되는 객체가 있다면, 이 객체의 목(mock) 역할을 하는 객체도 `providers` 배열에 지정할 수 있습니다.

아래 예제에서는 Jasmine 스파이 객체가 목으로 사용되었습니다.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="master-service-before-each" linenums="false">
</code-example>

<!--
The test consumes that spy in the same way it did earlier.
-->
이 목 객체는 이전에 살펴봤던 테스트 코드에서 다음과 같이 사용되었습니다.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="master-service-it">
</code-example>

{@a no-before-each}

<!--
#### Testing without _beforeEach()_
-->
#### _beforeEach()_ 없이 테스트하기

<!--
Most test suites in this guide call `beforeEach()` to set the preconditions for each `it()` test
and rely on the `TestBed` to create classes and inject services.

There's another school of testing that never calls `beforeEach()` and prefers to create classes explicitly rather than use the `TestBed`.

Here's how you might rewrite one of the `MasterService` tests in that style.

Begin by putting re-usable, preparatory code in a _setup_ function instead of `beforeEach()`.
-->
이 문서에서 다루는 테스트 스윗(test suites) 대부분은 테스트가 실제로 수행되는 `it()` 블럭에 필요한 준비를 하기 위해 `beforeEach()` 함수를 실행합니다. `TestBed`를 사용해서 의존성 관계를 연결하고, 서비스 인스턴스를 생성해서 변수에 할당하는 것이 이런 과정에 해당됩니다.

그런데 `beforeEach()`를 한번도 사용하지 않으면서 테스트 준비를 모두 끝낼 수 있는 방법도 있습니다.

이번에는 새로운 방식으로 `MasterService`를 테스트 코드를 작성해 봅시다.

먼저, `beforeEach()` 함수에서 하던 작업을 대신하는 _setup_ 함수를 정의합니다.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-setup"
  header="app/demo/demo.spec.ts (setup)" linenums="false">
</code-example>

<!--
The `setup()` function returns an object literal
with the variables, such as `masterService`, that a test might reference.
You don't define _semi-global_ variables (e.g., `let masterService: MasterService`)
in the body of the `describe()`.

Then each test invokes `setup()` in its first line, before continuing
with steps that manipulate the test subject and assert expectations.
-->
`setup()` 함수는 객체 리터럴을 반환하는데, 이 객체에는 `masterService`와 같이 테스트에서 사용할 객체의 인스턴스가 들어 있습니다.
그래서 `let masterService: MasterService`와 같이 _거의 전역으로 사용되는_ 변수를 따로 선언할 필요가 없습니다.

이제는 테스트 스펙 제일 첫 줄에서 `setup()` 함수를 실행한 후에 이 함수가 반환하는 객체를 사용해서 테스트 로직을 작성하면 됩니다.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-test" linenums="false">
</code-example>

<!--
Notice how the test uses
[_destructuring assignment_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
to extract the setup variables that it needs.
-->
객체 리터럴에서 필요한 객체를 추출해서 각 변수에 할당하는 문법은 [_구조 분해 할당(destructuring assignment)_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) 문법을 활용한 것입니다.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-setup-call">
</code-example>

<!--
Many developers feel this approach is cleaner and more explicit than the
traditional `beforeEach()` style.

Although this testing guide follows the traditional style and
the default [CLI schematics](https://github.com/angular/angular-cli)
generate test files with `beforeEach()` and `TestBed`,
feel free to adopt _this alternative approach_ in your own projects.
-->
전통적인 `beforeEach()` 스타일보다는 이 방식이 더 깔끔하고 좀 더 명확할 수 있습니다.

이 문서에서는 기본 [Angular CLI 스키매틱(schematics)](https://github.com/angular/angular-cli)에 정의된 대로 `beforeEach()`와 `TestBed`를 활용하는 방식으로 테스트 스펙을 작성하지만, 프로젝트에 _이 새로운 방식_ 을 적용해보는 것도 좋습니다.

<!--
#### Testing HTTP services
-->
#### HTTP 서비스 테스트하기

<!--
Data services that make HTTP calls to remote servers typically inject and delegate
to the Angular [`HttpClient`](guide/http) service for XHR calls.

You can test a data service with an injected `HttpClient` spy as you would
test any service with a dependency.
-->
HTTP 요청을 보내는 데이터 서비스는 리모트 서버로 XHR 요청을 보내기 위해 Angular [`HttpClient`](guide/http) 서비스를 의존성으로 주입받습니다.

이런 데이터 서비스는 `HttpClient` 스파이를 활용해서 테스트할 수 있습니다.

<!--
<code-example
  path="testing/src/app/model/hero.service.spec.ts"
  region="test-with-spies"
  header="app/model/hero.service.spec.ts (tests with spies)">
</code-example>
-->
<code-example
  path="testing/src/app/model/hero.service.spec.ts"
  region="test-with-spies"
  header="app/model/hero.service.spec.ts (HttpClient 스파이로 테스트하기)">
</code-example>

<div class="alert is-important">

<!--
The `HeroService` methods return `Observables`. You must
_subscribe_ to an observable to (a) cause it to execute and (b)
assert that the method succeeds or fails.

The `subscribe()` method takes a success (`next`) and fail (`error`) callback.
Make sure you provide _both_ callbacks so that you capture errors.
Neglecting to do so produces an asynchronous uncaught observable error that
the test runner will likely attribute to a completely different test.
-->
`HeroService`에 정의한 메소드는 모두 `Observable` 타입을 반환합니다.
그러면 이 옵저버블은 (a) 실행하기 위해서, 그리고 (b) 메소드가 정상적으로 실행되었는지, 실패했는지 확인하기 위해 반드시 _구독(subscribe)_ 해야 합니다.

`subscribe()` 메소드는 성공했을 때 실행할 콜백(`next`)과 실패했을 때 실행할 콜백(`error`)을 인자로 받습니다.
그래서 옵저버블에서 발생한 에러를 확인하려면 두 인자를 모두 지정해야 합니다.
옵저버블은 비동기로 실행되기 때문에 이 옵저버블에서 발생하는 에러를 확인하지 않으면 전혀 다른 테스트 결과를 낼 수도 있습니다.

</div>

#### _HttpClientTestingModule_

<!--
Extended interactions between a data service and the `HttpClient` can be complex
and difficult to mock with spies.

The `HttpClientTestingModule` can make these testing scenarios more manageable.

While the _code sample_ accompanying this guide demonstrates `HttpClientTestingModule`,
this page defers to the [Http guide](guide/http#testing-http-requests),
which covers testing with the `HttpClientTestingModule` in detail.
-->
데이터 서비스와 `HttpClient`는 복잡하게 연결될 수 있기 때문에 `HttpClient` 역할을 대신하는 목 스파이를 새로 만드는 것은 쉬운 작업이 아닙니다.

하지만 `HttpClientTestingModule`을 활용하면 `HttpClient`가 실행되는 과정을 좀 더 편하게 제어할 수 있어서 테스트 시나리오를 작성하기도 편합니다.

다만, 이 문서에서 `HttpClientTestingModule`의 내용을 다루기에는 그 내용이 너무 많기 때문에 이 내용을 자세하게 다루는 [Http guide](guide/http#http-요청-테스트하기) 문서를 참고하세요.


<!--
## Component Test Basics
-->
## 컴포넌트 테스트

<!--
A component, unlike all other parts of an Angular application,
combines an HTML template and a TypeScript class.
The component truly is the template and the class _working together_.
and to adequately test a component, you should test that they work together
as intended.

Such tests require creating the component's host element in the browser DOM,
as Angular does, and investigating the component class's interaction with
the DOM as described by its template.

The Angular `TestBed` facilitates this kind of testing as you'll see in the sections below.
But in many cases, _testing the component class alone_, without DOM involvement,
can validate much of the component's behavior in an easier, more obvious way.
-->
다른 Angular 구성요소와는 다르게, 컴포넌트는 HTML 템플릿과 TypeScript 클래스가 조합되어 정의됩니다.
그리고 컴포넌트가 실행될 때도 템플릿과 클래스가 _상호작용 하면서_ 동작합니다.
그래서 컴포넌트를 테스트하려면 템플릿과 TypeScript 클래스 코드가 서로 연동된다는 것을 염두에 두어야 합니다.

컴포넌트가 위치할 호스트 엘리먼트는 테스트 환경의 DOM 트리에도 생성되어야 합니다.
그래야 컴포넌트 클래스는 컴포넌트 템플릿이 렌더링되는 DOM과 상호작용할 수 있습니다.

이 작업들은 모두 Angular `TestBed`가 모두 처리하기 때문에 컴포넌트를 테스트하는 것이 그리 어려운 것만은 아닙니다.
하지만 일반적으로는 DOM을 신경쓰지 않고 _컴포넌트 클래스만 테스트하는 경우_ 가 많습니다.
컴포넌트는 동작 위주로 테스트하는 것이 더 간단하고, 테스트 스펙을 정의하기도 명확합니다.


<!--
### Component class testing
-->
### 컴포넌트 클래스 테스트

<!--
Test a component class on its own as you would test a service class.

Consider this `LightswitchComponent` which toggles a light on and off
(represented by an on-screen message) when the user clicks the button.
-->
컴포넌트 클래스를 테스트하는 것은 서비스 클래스를 테스트하는 것과 비슷합니다.

사용자가 버튼을 누르면 조명을 켜고 끄는 `LightswitchComponent`가 있다고 합시다. 조명이 켜졌는지 여부는 화면에 텍스트로 표시됩니다.

<code-example
  path="testing/src/app/demo/demo.ts"
  region="LightswitchComp"
  header="app/demo/demo.ts (LightswitchComp)" linenums="false">
</code-example>

<!--
You might decide only to test that the `clicked()` method
toggles the light's _on/off_ state and sets the message appropriately.

This component class has no dependencies.
To test a service with no dependencies, you create it with `new`, poke at its API,
and assert expectations on its public state.
Do the same with the component class.
-->
이 컴포넌트를 테스트한다면 조명을 _켜거나/끄는_ 동작을 하는 `clicked()` 메소드를 테스트하는 것이 가장 합리적입니다.
조명이 켜진 상태는 화면에 표시된 메시지로 체크하면 됩니다.

이 클래스에는 의존성으로 주입되는 객체가 없습니다.
그러면 의존성이 없는 서비스를 테스트했던 것과 마찬가지로, `new` 키워드로 컴포넌트 인스턴스를 생성하고, API를 직접 실행한 후에, public 프로퍼티를 검사하면 됩니다.

<!--
<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="Lightswitch"
  header="app/demo/demo.spec.ts (Lightswitch tests)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="Lightswitch"
  header="app/demo/demo.spec.ts (Lightswitch 테스트하기)" linenums="false">
</code-example>

<!--
Here is the `DashboardHeroComponent` from the _Tour of Heroes_ tutorial.
-->
_히어로들의 여행_ 튜토리얼에서 다룬 `DashboardHeroComponent`의 클래스 코드는 이렇게 정의되어 있습니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="class"
  header="app/dashboard/dashboard-hero.component.ts (component)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="class"
  header="app/dashboard/dashboard-hero.component.ts (컴포넌트 코드)" linenums="false">
</code-example>

<!--
It appears within the template of a parent component,
which binds a _hero_ to the `@Input` property and
listens for an event raised through the _selected_ `@Output` property.

You can test that the class code works without creating the `DashboardHeroComponent`
or its parent component.
-->
이 컴포넌트에는 부모 컴포넌트의 템플릿에서 받는 `@Input` _hero_ 프로퍼티가 존재하고, 부모 컴포넌트로 이벤트를 보내는 `@Output` _selected_ 프로퍼티도 존재합니다.

이 컴포넌트는 부모 컴포넌트를 생성하지 않아도 직접 테스트할 수 있습니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="class-only"
  header="app/dashboard/dashboard-hero.component.spec.ts (class tests)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="class-only"
  header="app/dashboard/dashboard-hero.component.spec.ts (class 테스트하기)" linenums="false">
</code-example>

<!--
When a component has dependencies, you may wish to use the `TestBed` to both
create the component and its dependencies.

The following `WelcomeComponent` depends on the `UserService` to know the name of the user to greet.
-->
그리고 컴포넌트에 주입되어야 하는 의존성이 있다면, `TestBed`를 사용해서 이 컴포넌트의 인스턴스를 생성할 수 있습니다.

아래 예제로 다루는 `WelcomeComponent`는 사용자의 이름을 참조하기 위해 `UserService`가 의존성으로 주입되어야 합니다.

<code-example
  path="testing/src/app/welcome/welcome.component.ts"
  region="class"
  header="app/welcome/welcome.component.ts" linenums="false">
</code-example>

<!--
You might start by creating a mock of the `UserService` that meets the minimum needs of this component.
-->
이 경우에는 먼저 `UserService` 코드 중 컴포넌트에 필요한 메소드만 최소한으로 구현한 목 클래스를 만드는 것부터 시작합니다.

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="mock-user-service"
  header="app/welcome/welcome.component.spec.ts (MockUserService)" linenums="false">
</code-example>

<!--
Then provide and inject _both the_ **component** _and the service_ in the `TestBed` configuration.
-->
그리고 이렇게 정의한 컴포넌트를 `TestBed` 환경에 등록합니다. 이 때 _**컴포넌트**도_ 함께 등록합니다.

<!--
<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="class-only-before-each"
  header="app/welcome/welcome.component.spec.ts (class-only setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="class-only-before-each"
  header="app/welcome/welcome.component.spec.ts (TestBed 설정)" linenums="false">
</code-example>

<!--
Then exercise the component class, remembering to call the [lifecycle hook methods](guide/lifecycle-hooks) as Angular does when running the app.
-->
그러면 테스트 스펙을 정의할 때 Angular 앱이 실행되는 것처럼 [라이프싸이클 후킹 함수](guide/lifecycle-hooks)를 활용할 수 있습니다.

<!--
<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="class-only-tests"
  header="app/welcome/welcome.component.spec.ts (class-only tests)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="class-only-tests"
  header="app/welcome/welcome.component.spec.ts (컴포넌트 클래스 테스트하기)" linenums="false">
</code-example>

<!--
### Component DOM testing
-->
### 컴포넌트 DOM 테스트

<!--
Testing the component _class_ is as easy as testing a service.

But a component is more than just its class.
A component interacts with the DOM and with other components.
The _class-only_ tests can tell you about class behavior.
They cannot tell you if the component is going to render properly,
respond to user input and gestures, or integrate with its parent and child components.

None of the _class-only_ tests above can answer key questions about how the
components actually behave on screen.

- Is `Lightswitch.clicked()` bound to anything such that the user can invoke it?
- Is the `Lightswitch.message` displayed?
- Can the user actually select the hero displayed by `DashboardHeroComponent`?
- Is the hero name displayed as expected (i.e, in uppercase)?
- Is the welcome message displayed by the template of `WelcomeComponent`?

These may not be troubling questions for the simple components illustrated above.
But many components have complex interactions with the DOM elements
described in their templates, causing HTML to appear and disappear as
the component state changes.

To answer these kinds of questions, you have to create the DOM elements associated
with the components, you must examine the DOM to confirm that component state
displays properly at the appropriate times, and you must simulate user interaction
with the screen to determine whether those interactions cause the component to
behave as expected.

To write these kinds of test, you'll use additional features of the `TestBed`
as well as other testing helpers.
-->
컴포넌트 _클래스_ 를 테스트하는 것은 서비스를 테스트하는 것만큼이나 쉽습니다.

하지만 컴포넌트는 클래스로만 구성되는 것이 아닙니다.
컴포넌트는 DOM에 존재하며 DOM에서 다른 컴포넌트와 상호작용할 수도 있습니다.
그래서 _컴포넌트 클래스만_ 테스트하면 이 클래스의 행동은 테스트할 수 있지만, 이 컴포넌트가 제대로 렌더링 되었는지, 사용자의 입력이나 제스처에 잘 반응하는지, 부모 컴포넌트나 자식 컴포넌트와 상호작용을 제대로 하는지는 확인할 수 없습니다.

결국 컴포넌트의 클래스만 테스트하면 다음 물음에 대해 답할 수 없습니다.

- 사용자가 컴포넌트에 있는 버튼을 클릭하면 `Lightswitch.clicked()` 함수는 제대로 실행될까?
- `Lightswitch.message`는 화면에 제대로 표시될까?
- 사용자가 `DashboardHeroComponent`에서 선택한 히어로 정보가 이 컴포넌트에도 표시될까?
- 히어로의 이름은 정해둔 방식으로 표시될까?
- `WelcomeComponent` 템플릿에는 환영 메시지가 제대로 표시될까?

컴포넌트가 간단하다면 이런 내용을 신경쓰지 않아도 됩니다.
하지만 일반적으로 컴포넌트 템플릿은 클래스 코드와 복잡한 과정으로 상호작용하기도 하고, 컴포넌트의 상태에 따라 일부 HTML 조각을 표시하지 않는 경우도 많습니다.

그래서 컴포넌트를 제대로 테스트하려면 해당 컴포넌트와 관련된 DOM 엘리먼트를 구성해야 하며, 지정된 로직에 따라 DOM도 제대로 연동되는지 확인해야 합니다. 그리고 사용자가 화면에서 발생시키는 이벤트에 컴포넌트가 제대로 반응하는지도 확인해야 합니다.

이 요구사항들은 `TestBed`가 제공하는 기능으로 모두 처리할 수 있습니다.

<!--
#### CLI-generated tests
-->
#### Angular CLI가 생성한 테스트 코드

<!--
The CLI creates an initial test file for you by default when you ask it to
generate a new component.

For example, the following CLI command generates a `BannerComponent` in the `app/banner` folder (with inline template and styles):
-->
Angular CLI를 사용해서 컴포넌트를 생성하면 이 컴포넌트를 테스트하는 파일이 함께 생성됩니다.


예를 들어 다음 명령을 실행하면 `app/banner` 폴더에 `BannerComponent` 컴포넌트 파일이 생성되는데, 인라인 옵션을 지정했기 때문에 템플릿과 스타일이 인라인으로 구성됩니다:

<code-example language="sh" class="code-shell">
ng generate component banner --inline-template --inline-style --module app
</code-example>

<!--
It also generates an initial test file for the component, `banner-external.component.spec.ts`, that looks like this:
-->
Angular CLI는 이 컴포넌트를 생성하면서 다음 내용으로 `banner-external.component.spec.ts` 파일을 함께 생성합니다:

<!--
<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v1"
  header="app/banner/banner-external.component.spec.ts (initial)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v1"
  header="app/banner/banner-external.component.spec.ts (기본 코드)" linenums="false">
</code-example>

<!--
#### Reduce the setup
-->
#### 간단하게 줄이기

<!--
Only the last three lines of this file actually test the component
and all they do is assert that Angular can create the component.

The rest of the file is boilerplate setup code anticipating more advanced tests that _might_ become necessary if the component evolves into something substantial.

You'll learn about these advanced test features below.
For now, you can radically reduce this test file to a more manageable size:
-->
그런데 컴포넌트가 제대로 생성되는지 확인하려면 이 테스트 코드 중에서 마지막 3줄만 필요합니다.

그밖의 코드는 이후에 이 컴포넌트에 추가되는 기능을 테스트하기 위해 미리 준비해 둔 코드들입니다.

컴포넌트를 테스트할 때 필요한 내용은 아래에서 자세하게 살펴볼 것입니다.
지금은 지금 단계에서 꼭 필요한 내용만 남도록 간단하게 줄여봅시다:

<!--
<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v2"
  header="app/banner/banner-initial.component.spec.ts (minimal)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v2"
  header="app/banner/banner-initial.component.spec.ts (최소 코드)" linenums="false">
</code-example>

<!--
In this example, the metadata object passed to `TestBed.configureTestingModule`
simply declares `BannerComponent`, the component to test.
-->
이 예제에서 `TestBed.configureTestingModule`로 전달하는 메타데이터 객체에는 단순하게 `BannerComponent`를 선언하는 내용만 있습니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="configureTestingModule">
</code-example>

<div class="alert is-helpful">

<!--
There's no need to declare or import anything else.
The default test module is pre-configured with
something like the `BrowserModule` from `@angular/platform-browser`.

Later you'll call `TestBed.configureTestingModule()` with
imports, providers, and more declarations to suit your testing needs.
Optional `override` methods can further fine-tune aspects of the configuration.
-->
컴포넌트가 제대로 생성되는지 확인하는 코드는 이것으로 충분합니다.
테스트 모듈은 `@angular/platform-browser` 패키지가 제공하는 `BrowserModule`을 활용하도록 자동으로 구성되기 때문에, 테스트는 이대로도 실행할 수 있습니다.

나중에 테스트할 내용이 많아지면 `TestBed.configureTestingModule()` 메타데이터의 imports, providers, declarations 프로퍼티를 수정해서 사용하면 됩니다.
그리고 테스트 환경을 좀 더 튜닝하려면 오버라이드 메소드를 활용할 수도 있습니다.

</div>

{@a create-component}

#### _createComponent()_

<!--
After configuring `TestBed`, you call its `createComponent()` method.
-->
`TestBed`를 설정한 뒤에는 `createComponent()` 메소드를 실행합니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="createComponent">
</code-example>

<!--
`TestBed.createComponent()` creates an instance of the `BannerComponent`,
adds a corresponding element to the test-runner DOM,
and returns a [`ComponentFixture`](#component-fixture).
-->
`TestBed.createComponent()`를 실행하면 `BannerComponent`의 인스턴스를 생성하면서 이 컴포넌트의 템플릿을 테스트 러너의 DOM에 추가하고 [`ComponentFixture`](#component-fixture)를 반환합니다.

<div class="alert is-important">

<!--
Do not re-configure `TestBed` after calling `createComponent`.

The `createComponent` method freezes the current `TestBed` definition,
closing it to further configuration.

You cannot call any more `TestBed` configuration methods, not `configureTestingModule()`,
nor `get()`, nor any of the `override...` methods.
If you try, `TestBed` throws an error.
-->
`createComponent`를 실행한 뒤에 `TestBed` 설정을 바꾸지 마세요.

`createComponent` 메소드는 이 메소드가 실행되는 시점에 `TestBed`에 설정된 내용으로 생성되며, 이후에 `TestBed` 설정을 변경해도 변경된 내용이 반영되지 않습니다.

그래서 `createComponent` 메소드를 실행한 후에는 `configureTestingModule()` 메소드를 다시 실행할 수 없으며, 반대로 `configureTestingModule()`를 실행하기 전에는 `get()`이나 `override...` 메소드를 실행할 수 없습니다.
이렇게 실행하면 에러가 발생합니다.

</div>

{@a component-fixture}

#### _ComponentFixture_

<!--
The [ComponentFixture](api/core/testing/ComponentFixture) is a test harness for interacting with the created component and its corresponding element.

Access the component instance through the fixture and confirm it exists with a Jasmine expectation:
-->
[ComponentFixture](api/core/testing/ComponentFixture)는 컴포넌트와 이 컴포넌트의 엘리먼트를 테스트할 때 사용하는 객체입니다.

이 객체를 참조하면 컴포넌트 인스턴스에 직접 접근할 수 있기 때문에, 다음과 같은 Jasmine 검증식을 작성할 수 있습니다:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="componentInstance">
</code-example>

#### _beforeEach()_

<!--
You will add more tests as this component evolves.
Rather than duplicate the `TestBed` configuration for each test,
you refactor to pull the setup into a Jasmine `beforeEach()` and some supporting variables:
-->
컴포넌트에 기능이 추가될수록 컴포넌트를 테스트하는 코드도 점점 많아질 것입니다.
그렇다면 `TestBed`를 설정하는 로직을 모든 테스트 스펙에 반복할 필요 없이, 이 내용을 Jasmine `beforeEach()`에 작성하는 것이 더 효율적입니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v3"
  linenums="false">
</code-example>

<!--
Now add a test that gets the component's element from `fixture.nativeElement` and
looks for the expected text.
-->
그러면 테스트 스펙을 작성할 때 공통 로직을 생략하고 테스트에 꼭 필요한 내용만 작성할 수 있습니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-2">
</code-example>

{@a native-element}

#### _nativeElement_

<!--
The value of `ComponentFixture.nativeElement` has the `any` type.
Later you'll encounter the `DebugElement.nativeElement` and it too has the `any` type.

Angular can't know at compile time what kind of HTML element the `nativeElement` is or
if it even is an HTML element.
The app might be running on a _non-browser platform_, such as the server or a
[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API),
where the element may have a diminished API or not exist at all.

The tests in this guide are designed to run in a browser so a
`nativeElement` value will always be an `HTMLElement` or
one of its derived classes.

Knowing that it is an `HTMLElement` of some sort, you can use
the standard HTML `querySelector` to dive deeper into the element tree.

Here's another test that calls `HTMLElement.querySelector` to get the paragraph element and look for the banner text:
-->
`ComponentFixture.nativeElement`에 할당되는 객체는 `any` 타입입니다.
그리고 나중에 살펴볼 `DebugElement.nativeElement`에 할당되는 객체도 `any` 타입입니다.

Angular 코드가 컴파일되는 시점에는 `nativeElement`에 할당되는 객체가 어떤 HTML 엘리먼트인지 알 수 없으며, 심지어 HTML 엘리먼트가 정말 할당되는지도 알 수 없습니다.
그리고 Angular 애플리케이션이 _서버가 아닌 환경_, 예를 들면 서버에서 실행되거나 [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)로 실행된다면 엘리먼트와 관련된 API가 일부 존재하지 않거나 전부 없을 수도 있습니다.

하지만 이 문서에서 다루는 예제는 모두 브라우저에서 실행되는 것을 전제로 작성되었기 때문에 `nativeElement`에 할당되는 객체는 언제나 `HTMLElement`이거나 이 엘리먼트의 자식 클래스입니다.

그래서 테스트 코드에서는 `HTMLElement`에서 제공하는 프로퍼티나 메소드를 활용할 수 있으며, HTML `querySelector`를 사용해서 엘리먼트 트리 안쪽을 참조할 수 있습니다.

`HTMLElement.querySelector` 메소드를 사용해서 `<p>` 엘리먼트를 참조하고, 이 엘리먼트의 텍스트를 검사하는 로직은 다음과 같이 작성할 수 있습니다:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-3">
</code-example>

{@a debug-element}

#### _DebugElement_

<!--
The Angular _fixture_ provides the component's element directly through the `fixture.nativeElement`.
-->
Angular 픽스쳐(fixture)가 제공하는 API를 활용하면 컴포넌트 엘리먼트에 직접 접근할 수 있습니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="nativeElement">
</code-example>

<!--
This is actually a convenience method, implemented as `fixture.debugElement.nativeElement`.
-->
이 프로퍼티는 사실 `fixture.debugElement.nativeElement`를 사용하기 쉬운 방법으로 제공하는 것 뿐입니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="debugElement-nativeElement">
</code-example>

<!--
There's a good reason for this circuitous path to the element.

The properties of the `nativeElement` depend upon the runtime environment.
You could be running these tests on a _non-browser_ platform that doesn't have a DOM or
whose DOM-emulation doesn't support the full `HTMLElement` API.

Angular relies on the `DebugElement` abstraction to work safely across _all supported platforms_.
Instead of creating an HTML element tree, Angular creates a `DebugElement` tree that wraps the _native elements_ for the runtime platform.
The `nativeElement` property unwraps the `DebugElement` and returns the platform-specific element object.

Because the sample tests for this guide are designed to run only in a browser,
a `nativeElement` in these tests is always an `HTMLElement`
whose familiar methods and properties you can explore within a test.

Here's the previous test, re-implemented with `fixture.debugElement.nativeElement`:
-->
이렇게 우회하는 이유가 있습니다.

`nativeElement`에 할당되는 객체는 이 컴포넌트가 어떤 환경에서 실행되는지에 따라 달라집니다.
_브라우저가 아닌_ 환경에서 애플리케이션을 실행한다면 DOM이 존재하지 않을 수도 있고, DOM을 에뮬레이트한 환경에서는 `HTMLElement`가 제공하는 API를 온전히 제공하지 않을 수도 있습니다.

그래서 Angular는 _어떠한 플랫폼에서도_ 이 코드를 문제없이 실행할 수 있도록 `DebugElement`를 추상화했습니다.
Angular는 실제로 HTML 엘리먼트 트리를 구성하는 대신, 실행되는 플랫폼에 맞게 랩핑된 _네이티브 엘리먼트_ 로 `DebugElement` 트리를 구성합니다.
결국 `nativeElement` 프로퍼티에 접근하는 것은 Angular가 생성한 `DebugElement`에 접근하는 것이며, 이 방식 덕분에 플랫폼에서 제공하는 엘리먼트 객체에 안전하게 접근할 수 있습니다.

이 문서에서 다루는 예제는 모두 브라우저에서 실행되는 것을 전제로 작성되었기 때문에 이 문서에서 사용하는 모든 `nativeElement`는 `HTMLElement` 객체가 할당됩니다.
그래서 기존에 DOM에서 사용하던 프로퍼티와 메소드를 그대로 활용할 수 있습니다.

위에서 살펴본 테스트 코드를 풀어서 쓰면 다음과 같이 작성할 수 있습니다:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-4">
</code-example>

<!--
The `DebugElement` has other methods and properties that
are useful in tests, as you'll see elsewhere in this guide.

You import the `DebugElement` symbol from the Angular core library.
-->
`@angular/core` 패키지에서 제공하는 `DebugElement`에는 테스트에 활용할만한 메소드나 프로퍼티들이 더 정의되어 있습니다.
이 내용은 이후 내용에서 더 알아봅시다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="import-debug-element">
</code-example>

{@a by-css}
#### _By.css()_

<!--
Although the tests in this guide all run in the browser,
some apps might run on a different platform at least some of the time.

For example, the component might render first on the server as part of a strategy to make the application launch faster on poorly connected devices. The server-side renderer might not support the full HTML element API.
If it doesn't support `querySelector`, the previous test could fail.

The `DebugElement` offers query methods that work for all supported platforms.
These query methods take a _predicate_ function that returns `true` when a node in the `DebugElement` tree matches the selection criteria.

You create a _predicate_ with the help of a `By` class imported from a
library for the runtime platform. Here's the `By` import for the browser platform:
-->
이 문서에서 다루는 모든 테스트 코드는 브라우저에서 실행되는 것을 전제로 작성되었지만, Angular 애플리케이션은 브라우저가 아닌 환경에서도 실행될 수 있습니다.

예를 들어보면, 접속 환경이 좋지 않은 디바이스를 위해 애플리케이션은 서버에서 미리 렌더링한 뒤에 제공될 수도 있는데, 서버사이드 렌더링 시점에는 HTML 엘리먼트가 제공하는 API를 제대로 사용할 수 없습니다.
위에서 다뤘던 `querySelector`도 사용할 수 없기 때문에 테스트는 실패할 것입니다.

하지만 `DebugElement`가 제공하는 쿼리 메소드는 모든 플랫폼에서 동작합니다.
그래서 `querySelector` 대신 `By` 클래스로 제공되는 쿼리 메소드를 활용하면 모든 플랫폼에서 원하는 엘리먼트를 참조할 수 있습니다.

`By` 클래스는 애플리케이션이 실행되는 플랫폼에 따라 다르게 제공됩니다.
그래서 브라우저 환경에서 동작하는 `By` 클래스는 다음과 같이 제공됩니다:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="import-by">
</code-example>

<!--
The following example re-implements the previous test with
`DebugElement.query()` and the browser's `By.css` method.
-->
위에서 살펴본 쿼리 예제는 `DebugElement.query()` 메소드와 `By.css` 메소드를 사용해서 다음과 같이 작성할 수 있습니다.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-5">
</code-example>

<!--
Some noteworthy observations:

- The `By.css()` static method selects `DebugElement` nodes
  with a [standard CSS selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors 'CSS selectors').
- The query returns a `DebugElement` for the paragraph.
- You must unwrap that result to get the paragraph element.

When you're filtering by CSS selector and only testing properties of a browser's _native element_, the `By.css` approach may be overkill.

It's often easier and more clear to filter with a standard `HTMLElement` method
such as `querySelector()` or `querySelectorAll()`,
as you'll see in the next set of tests.
-->
몇가지 알아둬야 할 내용이 있습니다:

- `By.css()` 정적 메소드는 [표준 CSS 셀렉터](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors 'CSS selectors') 문법으로 `DebugElement` 노드를 탐색합니다.
- 이 메소드를 실행하면 `<p>` 타입의 `DebugElement`를 반환합니다.
- 반환값으로 받은 `DebugElement`는 `nativeElement` 프로퍼티를 사용해서 `HTMLElement`로 참조할 수 있습니다.

그래서 브라우저 환경에서 _네이티브 엘리먼트_ 를 테스트한다면 CSS 셀렉터와 `By.css` 메소드를 사용하는 것으로 충분합니다.

하지만 `querySelector()`나 `querySelectorAll()`을 사용해서 표준 `HTMLElement`를 참조하는 것이 더 나을 때도 있습니다. 이 내용은 다음 섹션부터 자세하게 알아봅시다.

<hr>

<!--
## Component Test Scenarios
-->
## 컴포넌트 테스트 시나리오

<!--
The following sections, comprising most of this guide, explore common
component testing scenarios
-->
이제부터는 컴포넌트를 테스트하는 다양한 시나리오에 대해 알아봅시다.

<!--
### Component binding
-->
### 바인딩

<!--
The current `BannerComponent` presents static title text in the HTML template.

After a few changes, the `BannerComponent` presents a dynamic title by binding to
the component's `title` property like this.
-->
지금까지 작성한 `BannerComponent`를 보면, HTML 템플릿에 표시되는 `title` 프로퍼티는 정적(static) 변수였습니다.

그런데 이제 이 프로퍼티의 값은 동적으로 변경될 수 있으며, 그때마다 변경된 값이 화면에 바인딩되어 표시된다고 합시다.

<code-example
  path="testing/src/app/banner/banner.component.ts"
  region="component"
  header="app/banner/banner.component.ts" linenums="false">
</code-example>

<!--
Simple as this is, you decide to add a test to confirm that component
actually displays the right content where you think it should.
-->
그러면 `title` 프로퍼티의 값이 변경되었을 때 이 문자열이 화면에 제대로 표시되는지 검사하는 테스트 코드를 작성해 봅시다.

<!--
#### Query for the _&lt;h1&gt;_
-->
#### _&lt;h1&gt;_ 쿼리하기

<!--
You'll write a sequence of tests that inspect the value of the `<h1>` element
that wraps the _title_ property interpolation binding.

You update the `beforeEach` to find that element with a standard HTML `querySelector`
and assign it to the `h1` variable.
-->
가장 먼저 _title_ 프로퍼티가 바인딩되는 `<h1>` 엘리먼트에는 실제로 어떤 값이 들어가는지 확인해야 합니다.

그래서 `beforeEach` 로직 안에서 HTML `querySelector` 메소드를 실행해서 `<h1>` 엘리먼트를 참조하고, 이 엘리먼트를 변수 `h1`에 할당합니다.

<!--
<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="setup"
  header="app/banner/banner.component.spec.ts (setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="setup"
  header="app/banner/banner.component.spec.ts (테스트환경 설정)" linenums="false">
</code-example>

{@a detect-changes}

<!--
#### _createComponent()_ does not bind data
-->
#### _createComponent()_ 는 데이터를 바인딩하지 않습니다.

<!--
For your first test you'd like to see that the screen displays the default `title`.
Your instinct is to write a test that immediately inspects the `<h1>` like this:
-->
그러면 이렇게 참조한 `<h1>` 엘리먼트의 텍스트가 `title` 프로퍼티의 기본값과 같다고 테스트 코드를 작성할 수도 있습니다.
`title` 프로퍼티는 `<h1>` 엘리먼트에 바인딩되기 때문입니다:

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="expect-h1-default-v1">
</code-example>

<!--
_That test fails_ with the message:
-->
하지만 이 테스트는 실패합니다:

```javascript
expected '' to contain 'Test Tour of Heroes'.
```

<!--
Binding happens when Angular performs **change detection**.

In production, change detection kicks in automatically
when Angular creates a component or the user enters a keystroke or
an asynchronous activity (e.g., AJAX) completes.

The `TestBed.createComponent` does _not_ trigger change detection.
a fact confirmed in the revised test:
-->
프로퍼티 바인딩은 Angular가 **변화감지 동작**을 실행할 때 발생합니다.

그리고 실제 운영 환경에서는 Angular가 컴포넌트 인스턴스를 생성하거나 사용자가 키를 입력했을 때, AJAX와 같은 비동기 작업이 완료되었을 때 자동으로 변화감지 동작이 실행됩니다.

`TestBed.createComponent`는 변화감지 동작을 _실행하지 않습니다_.
그래서 사실 이 테스트 코드는 다음과 같은 의미로 실행되었습니다:

<code-example
  path="testing/src/app/banner/banner.component.spec.ts" region="test-w-o-detect-changes" linenums="false">
</code-example>

#### _detectChanges()_

<!--
You must tell the `TestBed` to perform data binding by calling `fixture.detectChanges()`.
Only then does the `<h1>` have the expected title.
-->
`TestBed`로 구성한 컴포넌트에 데이터를 바인딩하려면 `fixture.detectChanges()` 함수를 실행하면 됩니다.
이 함수를 실행하면 `title` 프로퍼티의 값이 `<h1>`에 바인딩 됩니다.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="expect-h1-default">
</code-example>

<!--
Delayed change detection is intentional and useful.
It gives the tester an opportunity to inspect and change the state of
the component _before Angular initiates data binding and calls [lifecycle hooks](guide/lifecycle-hooks)_.

Here's another test that changes the component's `title` property _before_ calling `fixture.detectChanges()`.
-->
변화감지 동작이 자동으로 실행되지 않는 것은 Angular가 의도한 것이며, 이렇게 동작해야 테스트 코드를 작성하기 더 편합니다.
왜냐하면 변화감지 동작을 수동으로 실행할 수 있어야 Angular가 데이터 바인딩을 초기화하하기 전에 컴포넌트의 상태를 검사할 수 있으며, [라이프싸이클 후킹 함수](guide/lifecycle-hooks)가 동작하기 전에도 컴포넌트를 체크할 수 있기 때문입니다.

그래서 컴포넌트의 `title` 프로퍼티를 직접 변경한 후에는 `fixture.detectChanges()` 함수를 실행해야 원하는 대로 동작하는 테스트 코드를 작성할 수 있습니다.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="after-change">
</code-example>

{@a auto-detect-changes}

<!--
#### Automatic change detection
-->
#### 변화감지 자동으로 실행하기

<!--
The `BannerComponent` tests frequently call `detectChanges`.
Some testers prefer that the Angular test environment run change detection automatically.

That's possible by configuring the `TestBed` with the `ComponentFixtureAutoDetect` provider.
First import it from the testing utility library:
-->
`BannerComponent`를 테스트할 때는 변화감지 동작을 실행해야 하는 경우가 그리 많지 않기 때문에 `detectChanges`를 수동으로 실행해도 크게 번거롭지 않습니다.
하지만 Angular 테스트 환경에서도 변화감지 로직이 자동으로 동작해야 편한 경우가 있습니다.

그러면 변화감지 로직을 자동으로 실행하도록 `TtestBed`를 구성할 수 있습니다.
먼저, 테스트 라이브러리에서 `ComponentFixtureAutoDetect` 프로바이더를 로드합니다:

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="import-ComponentFixtureAutoDetect" header="app/banner/banner.component.detect-changes.spec.ts (import)" linenums="false"></code-example>

<!--
Then add it to the `providers` array of the testing module configuration:
-->
그리고 이 프로바이더를 `providers` 배열에 추가합니다:

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect" header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect)" linenums="false"></code-example>

<!--
Here are three tests that illustrate how automatic change detection works.
-->
이 프로바이더가 동작하는지 확인해 봅시다. 테스트 스펙 3개를 다음과 같이 정의합니다.

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect-tests" header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect Tests)" linenums="false"></code-example>

<!--
The first test shows the benefit of automatic change detection.

The second and third test reveal an important limitation.
The Angular testing environment does _not_ know that the test changed the component's `title`.
The `ComponentFixtureAutoDetect` service responds to _asynchronous activities_ such as promise resolution, timers, and DOM events.
But a direct, synchronous update of the component property is invisible.
The test must call `fixture.detectChanges()` manually to trigger another cycle of change detection.
-->
변화감지 로직은 첫번째 테스트 스펙에서만 자동으로 실행됩니다.

두번째 스펙과 세번째 스펙에서는 왜 자동으로 실행되지 않는지 자세하게 알아봅시다.
Angular 테스트 환경은 컴포넌트의 `title` 프로퍼티 값이 변경되는지 확인하지 않습니다.
`ComponentFixtureAutoDetect` 서비스는 Promise가 완료되었을 때, 타이머가 완료되었을 때, DOM 이벤트가 발생했을 때와 같이 _비동기로 일어나는 동작_ 에만 반응합니다.
그래서 동기 로직으로 컴포넌트 프로퍼티 값을 변경하면 이 값은 화면에 반영되지 않습니다.
변화감지 동작을 실행하려면 `fixture.detectChanges()`를 수동으로 호출해야 합니다.

<div class="alert is-helpful">

<!--
Rather than wonder when the test fixture will or won't perform change detection,
the samples in this guide _always call_ `detectChanges()` _explicitly_.
There is no harm in calling `detectChanges()` more often than is strictly necessary.
-->
이 문서에서 다루는 예제에서는 테스트 코드가 실행되는 환경에 변화감지 동작이 필요할 때 `detectChanges()`를 _명시적으로 실행_ 했습니다.
`detectChanges()` 함수는 꼭 필요한 경우 외에 더 실행되더라도 문제되지 않습니다.

</div>

<hr>

{@a dispatch-event}

<!--
#### Change an input value with _dispatchEvent()_
-->
#### _dispatchEvent()_: 입력값 변경하기

<!--
To simulate user input, you can find the input element and set its `value` property.

You will call `fixture.detectChanges()` to trigger Angular's change detection.
But there is an essential, intermediate step.

Angular doesn't know that you set the input element's `value` property.
It won't read that property until you raise the element's `input` event by calling `dispatchEvent()`.
_Then_ you call `detectChanges()`.

The following example demonstrates the proper sequence.
-->
테스트 코드에서 사용자의 입력을 흉내내려면 `<input>` 엘리먼트를 찾아서 이 엘리먼트의 `value` 프로퍼티를 변경해야 합니다.

그리고 `fixture.detectChanges()`를 실행하면 Angular의 변화감지 로직을 실행할 수 있지만, 이 메소드를 실행하기 전에 꼭 해야하는 작업이 있습니다.

Angular는 개발자가 `<input>` 엘리먼트의 `value` 프로퍼티를 변경했다는 것을 알지 못합니다.
그래서 엘리먼트에서 `input` 이벤트가 발생했다는 것을 알리기 위해 `dispatchEvent()` 함수를 실행해야 이 엘리먼트의 변경된 프로퍼티를 참조할 수 있습니다.
`detectChanges()`는 _그 다음에_ 실행해야 합니다.

이 순서대로 테스트 코드를 작성해 봅시다.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" header="app/hero/hero-detail.component.spec.ts (pipe test)"></code-example>

<hr>

<!--
### Component with external files
-->
### 외부 파일로 구성된 컴포넌트

<!--
The `BannerComponent` above is defined with an _inline template_ and _inline css_, specified in the `@Component.template` and `@Component.styles` properties respectively.

Many components specify _external templates_ and _external css_ with the
`@Component.templateUrl` and `@Component.styleUrls` properties respectively,
as the following variant of `BannerComponent` does.
-->
위에서 살펴본 `BannerComponent`는 메타데이터에 `@Component.template`과 `@Component.styles` 프로퍼티를 사용했기 때문에 _인라인 템플릿_ 과 _인라인 CSS_ 로 구성됩니다.

하지만 이런 경우보다는 `@Component.templateUrl`과 `@Component.styleUrls` 프로퍼티를 사용해서 _외부 템플릿 파일_ 과 _외부 CSS 파일_ 로 구성하는 경우가 더 많습니다.
이런 경우에 컴포넌트 메타데이터는 다음과 같이 구성됩니다.

<!--
<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  region="metadata"
  header="app/banner/banner-external.component.ts (metadata)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  region="metadata"
  header="app/banner/banner-external.component.ts (메타데이터)" linenums="false">
</code-example>

<!--
This syntax tells the Angular compiler to read the external files during component compilation.

That's not a problem when you run the CLI `ng test` command because it
_compiles the app before running the tests_.

However, if you run the tests in a **non-CLI environment**,
tests of this component may fail.
For example, if you run the `BannerComponent` tests in a web coding environment such as [plunker](https://plnkr.co/), you'll see a message like this one:
-->
이 방식을 사용하면 Angular 컴파일러가 컴포넌트를 컴파일할 때 별개 파일로 존재하는 템플릿 파일과 스타일 파일을 로드합니다.

Angular CLI 명령 `ng test`를 실행한다면 이 방식은 딱히 문제가 되지 않습니다.
애플리케이션은 _테스트가 실행되기 전에 먼저 컴파일됩니다_.

그런데 **Angular CLI를 사용하지 않는 환경**에서 테스트를 실행할 때는 문제가 될 수 있습니다.
[plunker](https://plnkr.co/)와 같은 웹 코딩 환경에서 `BannerComponent` 테스트를 실행하면 다음과 같은 에러가 발생할 수 있습니다:

<code-example language="sh" class="code-shell" hideCopy>
Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.
</code-example>

<!--
You get this test failure message when the runtime environment
compiles the source code _during the tests themselves_.

To correct the problem, call `compileComponents()` as explained [below](#compile-components).
-->
이 에러는 테스트할 컴포넌트를 실행 시점에 컴파일 하려고 하기 때문에 발생하는 에러입니다.

이 문제를 해결하려면 `compileComponents()`를 명시적으로 실행해줘야 합니다.
이 내용은 [아래](#compile-components)에서 자세하게 알아봅니다.

{@a component-with-dependency}

<!--
### Component with a dependency
-->
### 의존성 주입이 필요한 컴포넌트

<!--
Components often have service dependencies.

The `WelcomeComponent` displays a welcome message to the logged in user.
It knows who the user is based on a property of the injected `UserService`:
-->
컴포넌트는 서비스 클래스를 의존성으로 주입받을 수 있습니다.

`WelcomeComponent`는 로그인한 사용자에게 환영 메시지를 출력하는 컴포넌트입니다.
그리고 이 컴포넌트는 어떤 사용자가 로그인했는지 확인하기 위해 `UserService`를 의존성으로 주입받습니다:

<code-example path="testing/src/app/welcome/welcome.component.ts" header="app/welcome/welcome.component.ts" linenums="false"></code-example>

<!--
The `WelcomeComponent` has decision logic that interacts with the service, logic that makes this component worth testing.
Here's the testing module configuration for the spec file, `app/welcome/welcome.component.spec.ts`:
-->
`WelcomeComponent`가 동작할때 실행되는 로직은 의존성으로 주입받은 서비스를 사용하지만, 컴포넌트를 테스트하면서 서비스까지 테스트할 필요는 없습니다.
그래서 이런 경우에는 테스트 모듈을 다음과 같이 구성합니다:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="config-test-module" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

<!--
This time, in addition to declaring the _component-under-test_,
the configuration adds a `UserService` provider to the `providers` list.
But not the real `UserService`.
-->
이 코드에는 테스트하려는 컴포넌트 외에도 `providers` 목록에 `UserService` 타입의 객체를 등록했습니다.
하지만 실제 `UserService`가 사용되는 것은 아닙니다.

{@a service-test-doubles}

<!--
#### Provide service test doubles
-->
#### 목 서비스 사용하기

<!--
A _component-under-test_ doesn't have to be injected with real services.
In fact, it is usually better if they are test doubles (stubs, fakes, spies, or mocks).
The purpose of the spec is to test the component, not the service,
and real services can be trouble.

Injecting the real `UserService` could be a nightmare.
The real service might ask the user for login credentials and
attempt to reach an authentication server.
These behaviors can be hard to intercept.
It is far easier and safer to create and register a test double in place of the real `UserService`.

This particular test suite supplies a minimal mock of the `UserService` that satisfies the needs of the `WelcomeComponent`
and its tests:
-->
컴포넌트를 테스트하기 위해 실제 서비스를 의존성으로 등록할 필요는 없습니다.
이런 경우에는 보통 목(mocks, doubles, stubs, fakes, spies) 서비스를 사용하는 것이 더 좋습니다.
컴포넌트를 테스트하는 스펙의 목적은 컴포넌트를 테스트하는 것이지 서비스를 테스트하는 것이 아닙니다.
실제로 사용하는 서비스를 주입한다면 컴포넌트를 테스트하는 로직이 더 복잡해지기만 할 뿐입니다.

만약 실제 `UserService`를 주입해야 한다면 아주 괴로운 경험을 겪게될 수도 있습니다.
실제 서비스는 사용자에게 로그인 인증정보를 제공하라고 할 수도, 있고 인증 서버에 HTTP 요청을 보낼지도 모릅니다.
이런 동작은 인터셉트하기도 힘듭니다.
그렇다면 실제 `UserService`를 대신해서 컴포넌트 동작에 꼭 필요한 로직만 제공하는 무언가를 만드는 것이 훨씬 간단합니다.

`UserService`의 로직 중 `WelcomeComponent`의 요구사항에 맞는 기능만 최소한으로 정의하면 다음과 같이 구현할 수 있습니다:

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="user-service-stub"
  header="app/welcome/welcome.component.spec.ts" linenums="false">
</code-example>

{@a get-injected-service}

<!--
#### Get injected services
-->
#### 의존성으로 주입한 서비스 가져오기

<!--
The tests need access to the (stub) `UserService` injected into the `WelcomeComponent`.

Angular has a hierarchical injection system.
There can be injectors at multiple levels, from the root injector created by the `TestBed`
down through the component tree.

The safest way to get the injected service, the way that **_always works_**,
is to **get it from the injector of the _component-under-test_**.
The component injector is a property of the fixture's `DebugElement`.
-->
테스트 스펙을 작성하려면 `WelcomeComponent`에 주입된 `UserService` 타입의 목 클래스에 접근해야 합니다.

Angular는 의존성 주입 시스템을 계층 구조로 제공합니다.
그래서 인젝터는 `TestBed`가 생성한 최상위 인젝터부터 컴포넌트 트리 전체에 걸쳐 여러 계층에 존재할 수 있습니다.

의존성으로 주입된 서비스를 가져오는 방법 중 가장 안전한 방법은 **테스트하는 컴포넌트**에 있는 인젝터에서 서비스 인스턴스를 가져오는 것입니다.
이 방법은 **_언제나 동작합니다_**.
컴포넌트 인젝터는 픽스쳐의 `DebugElement` 클래스 프로퍼티로 참조할 수 있습니다.

<!--
<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="injected-service"
  header="WelcomeComponent's injector">
</code-example>
-->
<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="injected-service"
  header="WelcomeComponent의 인젝터">
</code-example>

{@a testbed-get}

#### _TestBed.get()_

<!--
You _may_ also be able to get the service from the root injector via `TestBed.get()`.
This is easier to remember and less verbose.
But it only works when Angular injects the component with the service instance in the test's root injector.

In this test suite, the _only_ provider of `UserService` is the root testing module,
so it is safe to call `TestBed.get()` as follows:
-->
서비스의 인스턴스는 `TestBed.get()`을 사용해서 최상위 인젝터에서 참조할 _수도_ 있습니다.
이렇게 작성하는 것이 더 간단하고 외우기도 쉽습니다.
하지만 이 방식은 컴포넌트와 서비스 클래스가 테스트 모듈의 최상위 인젝터로 등록되었을 때만 제대로 동작합니다.

다행히 지금 다루는 예제에서는 `UserService`가 최상위 테스트 모듈에만 등록되었기 때문에 `TestBed.get()`을 써서 다음과 같이 작성할 수 있습니다:

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="inject-from-testbed"
  header="TestBed injector">
</code-example>

<div class="alert is-helpful">

<!--
For a use case in which `TestBed.get()` does not work,
see the [_Override component providers_](#component-override) section that
explains when and why you must get the service from the component's injector instead.
-->
`TestBed.get()`로 의존성으로 주입된 서비스의 인스턴스를 가져올 수 없으면, [_컴포넌트 프로바이더 오버라이드_](#component-override) 섹션을 참고하세요.
서비스 인스턴스는 컴포넌트의 인젝터에서 가져와야 할 수도 있습니다.

</div>

{@a service-from-injector}

<!--
#### Always get the service from an injector
-->
#### 서비스 인스턴스는 반드시 인젝터에서 가져오세요.

<!--
Do _not_ reference the `userServiceStub` object
that's provided to the testing module in the body of your test.
**It does not work!**
The `userService` instance injected into the component is a completely _different_ object,
a clone of the provided `userServiceStub`.
-->
테스트 스펙을 작성할 때 모듈에 등록한 `userServiceStub` 객체를 직접 _참조하지 마세요_.
**이렇게 하면 동작하지 않습니다!**
`userServiceStub`은 모듈에 등록될 때 한 번 복제되기 때문에, 모듈에 등록한 `userService` 객체의 인스턴스와 컴포넌트에 주입된 인스턴스는 _다릅니다_.

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="stub-not-injected" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

{@a welcome-spec-setup}

<!--
#### Final setup and tests
-->
#### 마지막 환경설정, 테스트

<!--
Here's the complete `beforeEach()`, using `TestBed.get()`:
-->
`TestBed.get()`을 사용하면 `beforeEach()` 코드를 다음과 같이 작성할 수 있습니다:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="setup" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

<!--
And here are some tests:
-->
그리고 테스트 코드는 이렇게 작성합니다:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="tests" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

<!--
The first is a sanity test; it confirms that the stubbed `UserService` is called and working.
-->
첫번째 테스트 스펙은 서비스가 제대로 주입되었는지 확인하는 스펙입니다.
이 테스트가 성공하면 목으로 만든 `UserService` 객체가 제대로 실행된 것으로 판단할 수 있습니다.

<div class="alert is-helpful">

<!--
The second parameter to the Jasmine matcher (e.g., `'expected name'`) is an optional failure label.
If the expectation fails, Jasmine displays appends this label to the expectation failure message.
In a spec with multiple expectations, it can help clarify what went wrong and which expectation failed.
-->
Jasmine 매처의 두번째 인자는 테스트가 실패했을 때 표시할 라벨을 지정하는 옵션 인자입니다.
이 인자가 지정된 검증식이 실패하면 Jasmine은 에러 메시지 뒤에 이 라벨을 붙여서 화면에 표시합니다.
그래서 한 테스트 스펙 안에서 여러 검증식을 사용하는 경우에 이 인자를 지정하면 어떤 검증식이 잘못되었는지 빠르게 확인할 수 있습니다.

</div>

<!--
The remaining tests confirm the logic of the component when the service returns different values.
The second test validates the effect of changing the user name.
The third test checks that the component displays the proper message when there is no logged-in user.
-->
두번째와 세번째 테스트 스펙은 서비스가 다른 값을 반환했을 때 컴포넌트의 로직이 제대로 동작하는지 확인하는 스펙입니다.
두번째 스펙은 사용자의 이름을 변경한 것이 제대로 반영되는지 확인하는 것이고, 세번째 스펙은 사용자가 로그인하지 않았을 때 올바른 메시지를 표시하는지 확인하는 것입니다.

<hr>

{@a component-with-async-service}

<!--
### Component with async service
-->
### 비동기 서비스를 사용하는 컴포넌트

<!--
In this sample, the `AboutComponent` template hosts a `TwainComponent`.
The `TwainComponent` displays Mark Twain quotes.
-->
이번 예제에서는 `AboutComponent` 템플릿 안에 `TwainComponent`가 존재합니다.
그리고 `TwainComponent`는 Mark Twain의 명언을 표시할 것입니다.

<!--
<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="template"
  header="app/twain/twain.component.ts (template)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="template"
  header="app/twain/twain.component.ts (템플릿)" linenums="false">
</code-example>

<!--
Note that value of the component's `quote` property passes through an `AsyncPipe`.
That means the property returns either a `Promise` or an `Observable`.

In this example, the `TwainComponent.getQuote()` method tells you that
the `quote` property returns an `Observable`.
-->
이 때 컴포넌트의 `quote` 프로퍼티는 `AsyncPipe`로 처리됩니다.
이 말은 `quote` 프로퍼티에 `Promise` 타입이나 `Observable` 타입이 할당된다는 의미입니다.

실제로 `TwainComponent.getQuote()` 메소드에서 확인할 수 있듯이, `quote` 프로퍼티가 반환하는 값은 `Observable` 타입입니다.

<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="get-quote"
  header="app/twain/twain.component.ts (getQuote)" linenums="false">
</code-example>

<!--
The `TwainComponent` gets quotes from an injected `TwainService`.
The component starts the returned `Observable` with a placeholder value (`'...'`),
before the service can returns its first quote.

The `catchError` intercepts service errors, prepares an error message,
and returns the placeholder value on the success channel.
It must wait a tick to set the `errorMessage`
in order to avoid updating that message twice in the same change detection cycle.

These are all features you'll want to test.
-->
`TwainComponent`의 `quote` 프로퍼티는 기본 문자열 `'...'`을 `Observable` 타입으로 전달하며, 컴포넌트가 초기화된 이후에는 의존성으로 주입된 `TwainService`에서 데이터를 가져옵니다.

서비스에서 에러가 발생하면 `catchError` 인터셉트 함수가 실행됩니다.
이 함수는 화면에 표시할 에러 메시지를 준비하며, 서비스를 실행했을 때와 마찬가지로 기본 문자열을 반환합니다.
그런데 이 때 같은 변화감지 싸이클에서 프로퍼티의 값이 두 번 변경되면 안되기 때문에 `errorMessage`에 값을 할당할 때는 한 싸이클 기다려야 합니다.

<!--
#### Testing with a spy
-->
#### 스파이로 테스트하기

<!--
When testing a component, only the service's public API should matter.
In general, tests themselves should not make calls to remote servers.
They should emulate such calls. The setup in this `app/twain/twain.component.spec.ts` shows one way to do that:
-->
컴포넌트를 테스트할 때는 서비스가 제공하는 public API만 신경쓰면 됩니다.
그리고 일반적으로 테스트 코드는 리모트 서버로 보내는 HTTP 요청을 생략하고 테스트 환경 안에서 완료되었다고 처리하는 것이 좋습니다.
`app/twain/twain.component.spec.ts` 파일에 작성된 테스트 환경 설정 코드를 봅시다:

<!--
<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="setup"
  header="app/twain/twain.component.spec.ts (setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="setup"
  header="app/twain/twain.component.spec.ts (테스트 모듈 설정)" linenums="false">
</code-example>

{@a service-spy}

<!--
Focus on the spy.
-->
스파이 메소드를 정의하는 부분을 봅시다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="spy">
</code-example>

<!--
The spy is designed such that any call to `getQuote` receives an observable with a test quote.
Unlike the real `getQuote()` method, this spy bypasses the server
and returns a synchronous observable whose value is available immediately.

You can write many useful tests with this spy, even though its `Observable` is synchronous.
-->
이 스파이 함수는 `getQuote`가 실행되었을 때 테스트 문자열을 Observable 타입으로 반환하도록 선언되었습니다.
그리고 실제 `getQuote()` 메소드와 다르게, 이 스파이 함수는 서버로 보내는 요청을 생략하고 문자열을 즉시 반환합니다.

스파이는 이것과 비슷한 상황에서도 얼마든지 활용할 수 있습니다.
반환하는 타입이 `Observable`이며, 이 Observable이 동기로 실행되어도 문제될 것은 전혀 없습니다.

{@a sync-tests}

<!--
#### Synchronous tests
-->
#### 동기 테스트

<!--
A key advantage of a synchronous `Observable` is that
you can often turn asynchronous processes into synchronous tests.
-->
`Observable`을 동기 방식으로 실행하면 비동기 로직 흐름을 동기 로직 흐름 안으로 자연스럽게 합칠 수 있습니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="sync-test">
</code-example>

<!--
Because the spy result returns synchronously, the `getQuote()` method updates
the message on screen immediately _after_
the first change detection cycle during which Angular calls `ngOnInit`.

You're not so lucky when testing the error path.
Although the service spy will return an error synchronously,
the component method calls `setTimeout()`.
The test must wait at least one full turn of the JavaScript engine before the
value becomes available. The test must become _asynchronous_.
-->
스파이 함수로 정의한 `getQuote()` 메소드는 반환값을 즉시 동기 방식으로 반환하기 때문에, Angular가 `ngOnInit`을 실행하면서 함께 실행된 첫번째 변화 감지 싸이클이 _끝나면_ 이 메소드가 반환한 값을 화면에서 바로 확인할 수 있습니다.

하지만 에러를 처리하려면 조금 더 신경써야 할 부분이 있습니다.
서비스 스파이가 에러를 동기 흐름으로 반환하면 컴포넌트 메소드가 `setTimeout()`을 실행하는데, 그러면 이 테스트 스펙은 완료되기 전에 JavaScript 엔진이 한 싸이클 도는 것을 기다려야 합니다.
결국 테스트 로직은 _비동기_ 로 실행되어야 합니다.

{@a fake-async}

<!--
#### Async test with _fakeAsync()_
-->
#### 비동기로 테스트하기: _fakeAsync()_

<!--
To use `fakeAsync()` functionality, you need to import `zone-testing`, for details, please read [setup guide](guide/setup#appendix-test-using-fakeasyncasync).

The following test confirms the expected behavior when the service returns an `ErrorObservable`.
-->
`fakeAsync()`를 사용하려면 `zone-testing` 패키지를 로드해야 합니다.
자세한 내용은 [환경설정 가이드](guide/setup#부록-fakeasyncasync-활용하기)를 참고하세요.

아래 코드는 서비스가 `ErrorObservable`을 반환했을 때 정해진 로직을 제대로 실행하는지 검증하는 테스트 코드입니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="error-test">
</code-example>

<!--
Note that the `it()` function receives an argument of the following form.
-->
`it()` 함수에 전달하는 인자는 이런 형태입니다.

<!--
```javascript
fakeAsync(() => { /* test body */ })`
```
-->
```javascript
fakeAsync(() => { /* 테스트 코드 */ })`
```

<!--
The `fakeAsync()` function enables a linear coding style by running the test body in a special `fakeAsync test zone`.
The test body appears to be synchronous.
There is no nested syntax (like a `Promise.then()`) to disrupt the flow of control.
-->
`fakeAsync()` 함수를 사용하면 `fakeAsync 테스트 존`이 구성되기 때문에, 이 테스트 존 안에서는 코드를 콜백 스타일로 작성하지 않고 일렬로 작성해도 비동기 흐름을 처리할 수 있습니다.
테스트 코드를 보면 동기 흐름인 것처럼 보입니다.
더이상 코드 흐름을 제어하기 위해 `Promise.then()`과 같이 복잡한 문법을 사용할 필요가 없습니다.

{@a tick}

<!--
#### The _tick()_ function
-->
#### _tick()_ 함수

<!--
You do have to call `tick()` to advance the (virtual) clock.

Calling `tick()` simulates the passage of time until all pending asynchronous activities finish.
In this case, it waits for the error handler's `setTimeout()`;

The `tick()` function accepts milliseconds as parameter (defaults to 0 if not provided). The parameter represents how much the virtual clock advances. For example, if you have a `setTimeout(fn, 100)` in a `fakeAsync()` test, you need to use tick(100) to trigger the fn callback.
-->
`tick()` 함수는 테스트 환경에서 동작하는 가상의 시계를 빠르게 돌리기 위해 사용합니다.

`tick()` 함수를 실행하면 그동안 대기중이던 비동기 작업들이 종료되는 시점까지 시간을 빠르게 돌립니다.
그래서 이 함수를 사용하면 `TwainComponent.getQuote()` 메소드 안에 있는 `setTimeout()`이 종료된 이후에 실행되는 로직을 테스트하는 코드도 작성할 수 있습니다.

`tick()` 함수에 인자를 전달하면 밀리초 단위로 시간을 빠르게 돌릴 수 있으며, 이 인자의 기본값은 0입니다.
그래서 `fakeAsync()` 테스트 존 안에서 `setTimeout(fn, 100)`이라는 타이머를 정의하고 `tick(100)`을 실행하면 이 타이머가 종료된 시점의 상태를 확인할 수 있습니다.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-tick">
</code-example>

<!--
The `tick()` function is one of the Angular testing utilities that you import with `TestBed`.
It's a companion to `fakeAsync()` and you can only call it within a `fakeAsync()` body.
-->
`tick()` 함수는 Angular가 제공하는 테스트 유틸리티 중 하나이며, `TestBed`가 제공되는 `@angular/core/testing` 패키지로 제공됩니다.
그리고 `tick()` 함수는 `fakeAsync()` 함수와 함께 사용해야 제대로 동작하며, `fakeAsync()` 테스트 존 안에서 필요할 때마다 한번씩 실행해주기만 하면 됩니다.

<!--
#### Comparing dates inside fakeAsync()
-->
#### fakeAsync() 안에서 서로 다른 시점 비교하기

<!--
`fakeAsync()` simulates passage of time, which allows you to calculate the difference between dates inside `fakeAsync()`.
-->
`fakeAsync()` 안에서는 시간이 지난 것을 조작할 수 있기 때문에 서로 다른 시점을 비교하는 것도 가능합니다.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-date">
</code-example>

<!--
#### jasmine.clock with fakeAsync()
-->
#### fakeAsync() 안에서 jasmine.clock 사용하기

<!--
Jasmine also provides a `clock` feature to mock dates. Angular automatically runs tests that are run after
`jasmine.clock().install()` is called inside a `fakeAsync()` method until `jasmine.clock().uninstall()` is called. `fakeAsync()` is not needed and throws an error if nested.

By default, this feature is disabled. To enable it, set a global flag before import `zone-testing`.

If you use the Angular CLI, configure this flag in `src/test.ts`.
-->
시간을 빠르게 감는 것은 Jasmine이 제공하는 `clock`을 사용해도 됩니다.
Angular는 `jasmine.clock().install()`이 실행되고 `jasmine.clock().uninstall()`이 실행될 때까지 실행되는 테스트 스펙을 자동으로 `fakeAsync()` 메소드 안에서 처리합니다.
그래서 이 경우에는 따로 `fakeAsync()` 함수를 사용하지 않아도 `fakeAsync()` 함수를 사용한 것과 똑같은 효과를 낼 수 있으며, 이 로직에 `fakeAsync()` 함수를 사용하면 오히려 에러가 발생합니다.

기본적으로 이 기능은 비활성화되어 있습니다.
그래서 이 기능을 사용하려면 `zone-testing` 패키지를 로드하기 전에 전역 변수로 이 기능을 활성화해야 합니다.

Angular CLI를 사용한다면 이 기능은 `src/test.ts`에서 활성화할 수도 있습니다.

```
(window as any)['__zone_symbol__fakeAsyncPatchLock'] = true;
import 'zone.js/dist/zone-testing';
```

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-clock">
</code-example>

<!--
#### Using the RxJS scheduler inside fakeAsync()
-->
#### fakeAsync() 안에서 RxJS 스케쥴러 사용하기

<!--
You can also use RxJS scheduler in `fakeAsync()` just like using `setTimeout()` or `setInterval()`, but you need to import `zone.js/dist/zone-patch-rxjs-fake-async` to patch RxJS scheduler.
-->
`fakeAsync()` 안에서는 `setTimeout()`이나 `setInterval()`을 사용하는 것처럼 RxJS 스케쥴러를 사용할 수도 있습니다.
하지만 이 경우에는 RxJS 스케쥴러에 패치를 적용하기 위해 `zone.js/dist/zone-patch-rxjs-fake-async` 패키지를 로드해야 합니다.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-rxjs">
</code-example>

<!--
#### Support more macroTasks
-->
#### 매크로태스크(macroTasks) 활용하기

<!--
By default `fakeAsync()` supports the following `macroTasks`.

- setTimeout
- setInterval
- requestAnimationFrame
- webkitRequestAnimationFrame
- mozRequestAnimationFrame

If you run other `macroTask` such as `HTMLCanvasElement.toBlob()`, `Unknown macroTask scheduled in fake async test` error will be thrown.
-->
기본적으로 `fakeAsync()`는 다음과 같은 매크로태스크를 지원합니다.

- setTimeout
- setInterval
- requestAnimationFrame
- webkitRequestAnimationFrame
- mozRequestAnimationFrame

이 목록 외에 `HTMLCanvasElement.toBlob()`과 같은 매크로태스크를 사용하면 `Unknown macroTask scheduled in fake async test` 에러가 발생합니다.

<code-tabs>
  <code-pane
    path="testing/src/app/shared/canvas.component.spec.ts"
    header="src/app/shared/canvas.component.spec.ts" linenums="false">
  </code-pane>
  <code-pane
    path="testing/src/app/shared/canvas.component.ts"
    header="src/app/shared/canvas.component.ts" linenums="false">
  </code-pane>
</code-tabs>

<!--
If you want to support such case, you need to define the `macroTask` you want to support in `beforeEach()`.
For example:
-->
그래서 Angular가 기본으로 지원하지 않는 매크로태스크를 사용하려면 `beforeEach()` 안에 해당 매크로태스크를 직접 정의해야 합니다.

```javascript
beforeEach(() => {
  window['__zone_symbol__FakeAsyncTestMacroTask'] = [
    {
      source: 'HTMLCanvasElement.toBlob',
      callbackArgs: [{ size: 200 }]
    }
  ];
});

it('toBlob should be able to run in fakeAsync', fakeAsync(() => {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    let blob = null;
    canvas.toBlob(function(b) {
      blob = b;
    });
    tick();
    expect(blob.size).toBe(200);
  })
);
```

<!--
#### Async observables
-->
#### 비동기 옵저버블

<!--
You might be satisfied with the test coverage of these tests.

But you might be troubled by the fact that the real service doesn't quite behave this way.
The real service sends requests to a remote server.
A server takes time to respond and the response certainly won't be available immediately
as in the previous two tests.

Your tests will reflect the real world more faithfully if you return an _asynchronous_ observable
from the `getQuote()` spy like this.
-->
지금까지 다룬 내용만으로도 테스트 코드를 작성하는 데에는 큰 문제가 없습니다.

하지만 실제 서비스 클래스를 사용하다보면 지금까지 다루지 않았던 부분에서 에러가 발생할 수 있습니다.
그리고 실제 서비스가 리모트 서버로 HTTP 요청을 보낸다면 이런 에러가 발생할 가능성이 더 높습니다.
서버는 요청을 받고 응답을 보낼때까지 시간이 걸리기 때문에 지금까지 살펴봤던 것처럼 즉시 처리되는 로직으로는 이 응답을 처리할 수 없습니다.

그래서 실제 운영 환경을 좀 더 충실하게 반영하고 싶다면, `getQuote()` 스파이 함수를 다음과 같이 정의해야 합니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="async-setup">
</code-example>

<!--
#### Async observable helpers
-->
#### 비동기 옵저버블 헬퍼

<!--
The async observable was produced by an `asyncData` helper
The `asyncData` helper is a utility function that you'll have to write yourself.
Or you can copy this one from the sample code.
-->
위 코드에서는 옵저버블을 비동기로 생성하기 위해 `asyncData` 헬퍼 함수를 사용했습니다.
이 때 `asyncData`는 유틸리티 함수인데, 필요한 용도에 맞게 직접 정의하거나 예제 코드를 복사해서 사용하면 됩니다.

<code-example
  path="testing/src/testing/async-observable-helpers.ts"
  region="async-data"
  header="testing/async-observable-helpers.ts">
</code-example>

<!--
This helper's observable emits the `data` value in the next turn of the JavaScript engine.

The [RxJS `defer()` operator](http://reactivex.io/documentation/operators/defer.html) returns an observable.
It takes a factory function that returns either a promise or an observable.
When something subscribes to _defer_'s observable,
it adds the subscriber to a new observable created with that factory.

The `defer()` operator transforms the `Promise.resolve()` into a new observable that,
like `HttpClient`, emits once and completes.
Subscribers are unsubscribed after they receive the data value.

There's a similar helper for producing an async error.
-->
이 헬퍼 함수는 JavaScript 실행 싸이클이 한 번 실행된 뒤에 `data`로 받은 값을 옵저버블로 보내는 함수입니다.

그리고 이 때 [RxJS `defer()` 연산자](http://reactivex.io/documentation/operators/defer.html)가 사용되었는데, 이 연산자는 Promise나 Observable이 종료되는 것을 기다리는 연산자입니다.
이제 _defer_ 옵저버블을 누군가가 구독하면 새로운 옵저버블이 생성되면서 팩토리 함수가 실행됩니다.

이 코드에서 `defer()` 연산자는 `Promise.resolve()`를 옵저버블로 변환하는데, 이 동작은 Angular `HttpClient`와 비슷하게 한 번 데이터를 보낸 뒤에 바로 종료됩니다.
그래서 `asyncData()`를 구독한 쪽에서는 데이터를 받은 후에 바로 옵저버블 구독을 해지해도 됩니다.

비동기 에러 옵저버블도 비슷하게 처리할 수 있습니다.

<code-example
  path="testing/src/testing/async-observable-helpers.ts"
  region="async-error">
</code-example>

<!--
#### More async tests
-->
#### 비동기 테스트 활용 예제

<!--
Now that the `getQuote()` spy is returning async observables,
most of your tests will have to be async as well.

Here's a `fakeAsync()` test that demonstrates the data flow you'd expect
in the real world.
-->
이제 `getQuote()` 스파이 함수가 실행되면 옵저버블을 비동기로 반환하기 때문에 테스트하는 코드가 비동기로 동작해도 잘 실행됩니다.

그리고 실제 동작 환경을 좀 더 반영해서 데이터 흐름을 테스트하려면 `fakeAsync()`를 다음과 같이 활용할 수도 있습니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="fake-async-test">
</code-example>

<!--
Notice that the quote element displays the placeholder value (`'...'`) after `ngOnInit()`.
The first quote hasn't arrived yet.

To flush the first quote from the observable, you call `tick()`.
Then call `detectChanges()` to tell Angular to update the screen.

Then you can assert that the quote element displays the expected text.
-->
`ngOnInit()`이 실행된 직후에 화면에 표시되는 문자열은 `'...'`입니다.
왜냐하면 첫번째 요청이 아직 처리되지 않았기 때문입니다.

`ngOnInit()`에서 보낸 요청을 처리하려면 `tick()`을 실행하면 됩니다.
그리고 화면을 갱신하기 위해 `detectChanges()` 함수도 실행했습니다.

이제 옵저버블로 받은 데이터가 화면에 제대로 표시되었는지 확인하기만 하면 됩니다.

{@a async}

<!--
#### Async test with _async()_
-->
#### _async()_ 로 비동기 테스트하기

<!--
To use `async()` functionality, you need to import `zone-testing`, for details, please read [setup guide](guide/setup#appendix-test-using-fakeasyncasync).

The `fakeAsync()` utility function has a few limitations.
In particular, it won't work if the test body makes an `XHR` call.

`XHR` calls within a test are rare so you can generally stick with `fakeAsync()`.
But if you ever do need to call `XHR`, you'll want to know about `async()`.
-->
`async()` 기능을 사용하려면 `zone-testing` 패키지를 로드해야 합니다.
자세한 내용은 [환경설정 가이드](guide/setup#부록-fakeasyncasync-활용하기)를 참고하세요.

`fakeAsync()` 유틸리티 함수는 몇가지 제약이 있습니다.
예를 들어, 테스트 코드에서 `XHR` 요청을 보낸다면 이 테스트 스펙은 제대로 실행되지 않습니다.

테스트 코드에서 `XHR` 요청을 보내는 경우는 거의 없기 때문에 웬만하면 `fakeAsync()`만 사용해도 테스트 코드를 작성할 수 있습니다.
하지만 실제로 `XHR` 요청을 보내야 한다면 `async()`를 사용해야 합니다.

<div class="alert is-helpful">

<!--
The `TestBed.compileComponents()` method (see [below](#compile-components)) calls `XHR`
to read external template and css files during "just-in-time" compilation.
Write tests that call `compileComponents()` with the `async()` utility.
-->
[아래](#compile-components)에서 다루는 `TestBed.compileComponents()` 메소드는 JiT 컴파일러로 처리되기 때문에 외부 템플릿 파일과 외부 CSS 파일을 읽기 위해 `XHR` 요청을 보냅니다.
그래서 테스트 코드에서 `compileComponents()`를 사용한다면 `async()`를 꼭 사용해야 합니다.

</div>

<!--
Here's the previous `fakeAsync()` test, re-written with the `async()` utility.
-->
이전에 작성했던 `fakeAsync()` 예제를 `async()` 방식으로 작성하면 이렇습니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="async-test">
</code-example>

<!--
The `async()` utility hides some asynchronous boilerplate by arranging for the tester's code
to run in a special _async test zone_.
You don't need to pass Jasmine's `done()` into the test and call `done()` because it is `undefined` in promise or observable callbacks.

But the test's asynchronous nature is revealed by the call to `fixture.whenStable()`,
which breaks the linear flow of control.

When using an `intervalTimer()` such as `setInterval()` in `async()`, remember to cancel the timer with `clearInterval()` after the test, otherwise the `async()` never ends.
-->
`async()` 함수를 사용하면 `fakeAsync()`를 사용하면서 _비동기 테스트 존(async test zone)_ 에 사용했던 비동기 처리 관련 함수들을 일부 생략할 수 있습니다.
그리고 Jasmine이 제공하는 `done()` 함수를 실행할 필요도 없습니다.

대신 테스트를 정상적으로 종료할 수 있도록 `fixture.whenStable()`이 비동기 흐름을 처리합니다.

다만, `async()` 안에서 `intervalTimer()`나 `setInterval()`을 사용한다면 이 타이머를 종료하거나 `clearInterval()`을 실행해야 합니다.
타이머를 종료하지 않으면 `async()`도 종료되지 않습니다.

{@a when-stable}

#### _whenStable_

<!--
The test must wait for the `getQuote()` observable to emit the next quote.
Instead of calling `tick()`, it calls `fixture.whenStable()`.

The `fixture.whenStable()` returns a promise that resolves when the JavaScript engine's
task queue becomes empty.
In this example, the task queue becomes empty when the observable emits the first quote.

The test resumes within the promise callback, which calls `detectChanges()` to
update the quote element with the expected text.
-->
이 테스트 스펙은 `getQuote()`로 받은 옵저버블이 다음 스트림을 전달할 때까지 기다려야 합니다.
이 때 이 코드에서는 `tick()`을 실행하는 대신 `fixture.whenStable()`을 실행했습니다.

`fixture.whenStable()`은 JavaScript 엔진의 태스크 큐가 비어있을 때 Promise를 반환합니다.
이 예제에서는 옵저버블이 첫번째 문장을 전달한 뒤에 태스크 큐가 비어있게 됩니다.

그러면 Promise 콜백으로 테스트가 이어집니다.
이 콜백에서는 화면을 갱신하기 위해 `detectChanges()`를 실행하고, 그 이후에 화면에 표시된 메시지가 예상한 값이 맞는지 확인합니다.

{@a jasmine-done}

#### Jasmine _done()_

<!--
While the `async()` and `fakeAsync()` functions greatly
simplify Angular asynchronous testing,
you can still fall back to the traditional technique
and pass `it` a function that takes a
[`done` callback](https://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support).

You can't call `done()` in `async()` or `fakeAsync()` functions, because the `done parameter`
is `undefined`.

Now you are responsible for chaining promises, handling errors, and calling `done()` at the appropriate moments.

Writing test functions with `done()`, is more cumbersome than `async()`and `fakeAsync()`.
But it is occasionally necessary when code involves the `intervalTimer()` like `setInterval`.

Here are two more versions of the previous test, written with `done()`.
The first one subscribes to the `Observable` exposed to the template by the component's `quote` property.
-->
Angular가 제공하는 `async()`와 `fakeAsync()`를 활용하면 비동기 로직을 아주 간단하게 테스트할 수 있습니다.
하지만 이 함수들을 사용해도 실패하는 로직이 있다면 `it` 함수에 [`done` 콜백](https://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support)을 사용하는 방법을 검토할 수 있습니다.

다만, `async()`와 `fakeAsync()` 기능을 사용하면서 `done()`를 함께 사용할 수는 없습니다.
두 함수를 사용하면 `done` 이 `undefined`로 전달됩니다.

`done()`을 사용하면 직접 Promise를 체이닝하거나 에러를 처리해야하고, 적절한 시점에 `done()`을 실행해야 합니다.

그래서 `done()`을 사용해서 테스트하는 것은 `async()`나 `fakeAsync()`를 사용했던 것보다 조금 더 번거롭습니다.
하지만 `setInterval`이나 `intervalTimer()`을 활용하는 로직은 `done()`을 사용해야만 합니다.

위에서 작성했던 테스트를 `done()`을 사용하는 방식으로 변경하면 다음과 같이 작성할 수 있습니다.
이 코드에서는 `Observable`을 구독한 뒤에 실행되는 콜백에서 컴포넌트를 테스트하고 `done()`을 실행합니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="quote-done-test" linenums="false">
</code-example>

<!--
The RxJS `last()` operator emits the observable's last value before completing, which will be the test quote.
The `subscribe` callback calls `detectChanges()` to
update the quote element with the test quote, in the same manner as the earlier tests.

In some tests, you're more interested in how an injected service method was called and what values it returned,
than what appears on screen.

A service spy, such as the `qetQuote()` spy of the fake `TwainService`,
can give you that information and make assertions about the state of the view.
-->
RxJS `last()` 연산자는 옵저버블이 종료되는 시점에 마지막으로 전달된 데이터를 반환하기 때문에 옵저버블 콜백은 테스트 문장을 받아온 이후에 실행됩니다.
그리고 `subscribe` 콜백에서는 `detectChanges()`를 실행해서 이 문장으로 화면을 갱신합니다.
이 내용은 이전에 작성했던 내용과 같습니다.

조금 더 자세히 들어가면 컴포넌트로 주입되는 서비스가 어떻게 실행되는지, 어떤 값을 반환해서 이 내용이 화면에 반영되는지 궁금해질 수도 있습니다.

`TwainService`에 만든 `getQuote()` 함수는 스파이로 만든 함수입니다.
그래서 이 스파이를 직접 활용하면 다음과 같은 테스트 코드를 작성할 수도 있습니다.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="spy-done-test" linenums="false">
</code-example>

<hr>

{@a marble-testing}
<!--
### Component marble tests
-->
### 컴포넌트 마블(marble) 테스트

<!--
The previous `TwainComponent` tests simulated an asynchronous observable response
from the `TwainService` with the `asyncData` and `asyncError` utilities.

These are short, simple functions that you can write yourself.
Unfortunately, they're too simple for many common scenarios.
An observable often emits multiple times, perhaps after a significant delay.
A component may coordinate multiple observables
with overlapping sequences of values and errors.

**RxJS marble testing** is a great way to test observable scenarios,
both simple and complex.
You've likely seen the [marble diagrams](http://rxmarbles.com/)
that illustrate how observables work.
Marble testing uses a similar marble language to
specify the observable streams and expectations in your tests.

The following examples revisit two of the `TwainComponent` tests
with marble testing.

Start by installing the `jasmine-marbles` npm package.
Then import the symbols you need.
-->
위에서 살펴본 `TwainComponent` 테스트 코드는 `TwainService`가 전달하는 옵저버블을 처리하기 위해 `asyncData`와 `asyncError` 기능을 활용했습니다.

이 코드는 아주 간단하기 때문에 조금만 익숙해지면 금방 작성할 수 있습니다.
하지만 이런 방식으로 모든 시나리오를 처리할 수는 없습니다.
옵저버블은 여러번 데이터를 보내기도 하는데, 이 때 약간 딜레이가 있을 수도 있습니다.
그리고 컴포넌트가 옵저버블 여러개를 복잡한 순서로 조작하면서 이 옵저버블들이 전달하는 값과 에러를 모두 처리해야 할 수도 있습니다.

**RxJS 마블 테스트는** 옵저버블을 시나리오 방식으로 테스트하는 방법입니다.
옵저버블이 복잡하거나 단순한 것과는 관계없이, 일관된 방법으로 옵저버블이 실행되는 시나리오를 검증할 수 있습니다.
[마블 다이어그램](http://rxmarbles.com/)도 RxJS 마블 테스트 방법을 활용한 것 중 하나입니다.
마블 테스트 로직은 기존에 옵저버블 스트림을 처리하고 검사했던 로직과 비슷합니다.

이제부터는 `TwainComponent`에 마블 테스트를 적용하는 방법에 대해 알아봅시다.

마블 테스트 로직을 작성하려면 `jasmine-marbles` npm 패키지를 설치해야 합니다.
그리고 이 패키지에서 다음 심볼들을 로드합니다.

<!--
<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="import-marbles"
  header="app/twain/twain.component.marbles.spec.ts (import marbles)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="import-marbles"
  header="app/twain/twain.component.marbles.spec.ts (심볼 로드하기)" linenums="false">
</code-example>

<!--
Here's the complete test for getting a quote:
-->
그리고 테스트 코드는 이렇게 작성합니다:

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="get-quote-test" linenums="false">
</code-example>

<!--
Notice that the Jasmine test is synchronous. There's no `fakeAsync()`.
Marble testing uses a test scheduler to simulate the passage of time
in a synchronous test.

The beauty of marble testing is in the visual definition of the observable streams.
This test defines a [_cold_ observable](#cold-observable) that waits
three [frames](#marble-frame) (`---`),
emits a value (`x`), and completes (`|`).
In the second argument you map the value marker (`x`) to the emitted value (`testQuote`).
-->
Jasmine 테스트 로직은 동기 방식으로 실행됩니다.
`fakeAsync()`와 같은 것은 없습니다.
대신 마블 테스트는 비동기 로직을 실행하기 위해 시간을 조작할 때 테스트 스케쥴러(test scheduler)를 사용합니다.

마블 테스트는 옵저버블 스트림을 시각적으로 정의할 수 있다는 점이 가장 좋습니다.
이 테스트에서는 [_콜드(cold)_ 옵저버블](#cold-observable)을 사용하며, 이 옵저버블은 3 [프레임](#marble-frame)을 기다린 후에(`---`) 데이터를 보내고(`x`) 종료합니다(`|`).
이 때 `cold` 옵저버블의 두 번째로 전달하는 인자는 실제 값(`testQuote`)과 데이터 스트림을 연결하는 값 마커(value marker, `x`)입니다.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="test-quote-marbles" linenums="false">
</code-example>

<!--
The marble library constructs the corresponding observable, which the
test sets as the `getQuote` spy's return value.

When you're ready to activate the marble observables,
you tell the `TestScheduler` to _flush_ its queue of prepared tasks like this.
-->
그 다음에는 이 옵저버블이 `getQuote` 스파이와 연결되어 값을 반환할 수 있도록 설정합니다.

마블 옵저버블을 준비한 후에 `TestScheduler`의 `flush`를 실행하면 미리 정의한 대로 옵저버블이 실행됩니다.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="test-scheduler-flush" linenums="false">
</code-example>

<!--
This step serves a purpose analogous to `tick()` and `whenStable()` in the
earlier `fakeAsync()` and `async()` examples.
The balance of the test is the same as those examples.
-->
이 코드는 이전에 다뤘던 `fakeAsync()`와 `async()` 예제에서 `tick()`과 `whenStable()`을 사용했던 것과 비슷하게 동작합니다.

나머지 코드는 이전에 살펴봤던 내용과 같습니다.

<!--
#### Marble error testing
-->
#### 마블 테스트에서 에러 처리하기

<!--
Here's the marble testing version of the `getQuote()` error test.
-->
아래 코드는 `getQuote` 에러 테스트 코드를 마블 테스트 방식으로 작성한 코드입니다.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="error-test" linenums="false">
</code-example>

<!--
It's still an async test, calling `fakeAsync()` and `tick()`, because the component itself
calls `setTimeout()` when processing errors.

Look at the marble observable definition.
-->
컴포넌트는 에러를 처리할 때 `setTimeout()`을 사용하기 때문에 이 코드는 `fakeAsync()`와 `tick()`를 사용해서 비동기로 처리되어야 합니다.

이 때 마블 옵저버블은 어떻게 선언하는지 봅시다.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="error-marbles" linenums="false">
</code-example>

<!--
This is a _cold_ observable that waits three frames and then emits an error,
The hash (`#`) indicates the timing of the error that is specified in the third argument.
The second argument is null because the observable never emits a value.
-->
이 코드에서 정의하는 _콜드_ 옵저버블은 3 프레임을 기다린 후 에러를 보내는데, 에러는 세번째 인자로 전달하며, 이 에러는 해시(`#`)가 사용된 시점에 전달됩니다.
이 옵저버블은 데이터를 전달하지 않기 때문에 두번째 인자를 null로 지정했습니다.

<!--
#### Learn about marble testing
-->
#### 마블 테스트 더 알아보기

{@a marble-frame}
<!--
A _marble frame_ is a virtual unit of testing time.
Each symbol (`-`, `x`, `|`, `#`) marks the passing of one frame.
-->
마블 테스트에서 시간을 표현하는 단위를 _마블 프레임(marble frame)_ 이라고 하며, 각 심볼(`-`, `x`, `|`, `#`) 하나는 한 프레임을 의미합니다.

{@a cold-observable}
<!--
A _cold_ observable doesn't produce values until you subscribe to it.
Most of your application observables are cold.
All [_HttpClient_](guide/http) methods return cold observables.

A _hot_ observable is already producing values _before_ you subscribe to it.
The [_Router.events_](api/router/Router#events) observable,
which reports router activity, is a _hot_ observable.

RxJS marble testing is a rich subject, beyond the scope of this guide.
Learn about it on the web, starting with the
[official documentation](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md).
-->
_콜드(cold)_ 옵저버블은 누군가가 구독하기 전까지는 데이터를 생성하지 않습니다.
일반적으로 사용하는 옵저버블이 콜드 옵저버블이며, [_HttpClient_](guide/http) 메소드가 반환하는 옵저버블도 모두 콜드 옵저버블입니다.

반면에, _핫(hot)_ 옵저버블은 누군가가 구독하지 _않아도_ 데이터를 생성합니다.
라우터의 동작을 확인할 때 사용하는 [_Router 이벤트_](api/router/Router#events)가 _핫_ 옵저버블입니다.

RxJS 마블 테스트는 더 다양하게 활용할 수 있지만, 이 내용은 이 가이드 문서가 다루는 범위를 넘어서는 내용입니다.
RxJS 마블 테스트에 대해 더 자세하게 알아보려면 [해당 문서](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md)를 참고하세요.

<hr>

{@a component-with-input-output}

<!--
### Component with inputs and outputs
-->
### 입력/출력 프로퍼티가 있는 컴포넌트

<!--
A component with inputs and outputs typically appears inside the view template of a host component.
The host uses a property binding to set the input property and an event binding to
listen to events raised by the output property.

The testing goal is to verify that such bindings work as expected.
The tests should set input values and listen for output events.

The `DashboardHeroComponent` is a tiny example of a component in this role.
It displays an individual hero provided by the `DashboardComponent`.
Clicking that hero tells the `DashboardComponent` that the user has selected the hero.

The `DashboardHeroComponent` is embedded in the `DashboardComponent` template like this:
-->
입력/출력 프로퍼티가 있는 컴포넌트는 일반적으로 호스트 컴포넌트의 템플릿 안에 존재합니다.
이런 컴포넌트는 보통 호스트 컴포넌트가 프로퍼티 바인딩해서 입력 프로퍼티 값을 지정하며, 이벤트 바인딩해서 출력 프로퍼티에서 발생하는 이벤트를 감지합니다.

이번에 진행하는 테스트의 목표는 프로퍼티 바인딩과 이벤트 바인딩이 제대로 동작하는지 확인하는 것입니다.
입력 프로퍼티 값을 지정하고 출력 프로퍼티로 발생되는 이벤트를 감지해봅시다.

이 내용은 `DashboardHeroComponent`를 통해 간단하게 알아봅니다.
이 컴포넌트는 `DashboardComponent`에서 받은 히어로의 정보를 화면에 표시하는 컴포넌트입니다.
그리고 컴포넌트를 클릭하면 해당 히어로가 선택되었다고 `DashboardComponent`에게 알리는 역할을 합니다.

그래서 `DashboardHeroComponent`는 `DashboardComponent` 템플릿에 다음과 같이 사용됩니다:

<!--
<code-example
  path="testing/src/app/dashboard/dashboard.component.html"
  region="dashboard-hero"
  header="app/dashboard/dashboard.component.html (excerpt)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard.component.html"
  region="dashboard-hero"
  header="app/dashboard/dashboard.component.html (일부)" linenums="false">
</code-example>

<!--
The `DashboardHeroComponent` appears in an `*ngFor` repeater, which sets each component's `hero` input property
to the looping value and listens for the component's `selected` event.

Here's the component's full definition:
-->
`DashboardHeroComponent`는 `*ngFor` 리피터와 함께 사용되어 각 루프마다 컴포넌트의 입력 프로퍼티를 `hero` 값으로 할당하고, 각 컴포넌트에서 발생하는 `selected` 이벤트를 감지합니다.

컴포넌트 전체 코드는 이렇습니다:

{@a dashboard-hero-component}

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="component"
  header="app/dashboard/dashboard-hero.component.ts (component)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="component"
  header="app/dashboard/dashboard-hero.component.ts (컴포넌트)" linenums="false">
</code-example>

<!--
While testing a component this simple has little intrinsic value, it's worth knowing how.
You can use one of these approaches:

- Test it as used by `DashboardComponent`.
- Test it as a stand-alone component.
- Test it as used by a substitute for `DashboardComponent`.

A quick look at the `DashboardComponent` constructor discourages the first approach:
-->
이 컴포넌트를 바로 테스트하기 전에, 이 컴포넌트를 어떻게 테스트할 수 있을지 생각해보는 것이 좋습니다.
테스트 접근 방식은 다음 중 하나를 선택할 수 있습니다:

- `DashboardComponent`와 함께 사용되는 시나리오 테스트하기
- 컴포넌트 단독으로 테스트하기
- 단순화한 `DashboardComponent`로 테스트하기

먼저, `DashboardComponent`의 생성자를 보면 첫번째 접근 방식은 사용하기 어렵다는 것을 예상할 수 있습니다:

<!--
<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (constructor)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (생성자)" linenums="false">
</code-example>

<!--
The `DashboardComponent` depends on the Angular router and the `HeroService`.
You'd probably have to replace them both with test doubles, which is a lot of work.
The router seems particularly challenging.
-->
`DashboardComponent`는 Angular 라우터와 `HeroService`를 의존성으로 주입받습니다.
그러면 두 의존성에 대해 목 클래스를 정의해야 하는데, 이 작업이 쉽지 않습니다.
라우터를 모킹하는 것은 험난한 과정이 될 것입니다.

<div class="alert is-helpful">

<!--
The [discussion below](#routing-component) covers testing components that require the router.
-->
라우터가 필요한 컴포넌트를 테스트하는 경우는 [아래](#routing-component)에서 다룹니다.

</div>

<!--
The immediate goal is to test the `DashboardHeroComponent`, not the `DashboardComponent`,
so, try the second and third options.
-->
이번 섹션에서 하려는 것은 `DashboardHeroComponent`를 테스트하는 것이지 `DashboardComponent`를 테스트하는 것이 아닙니다.
다른 방식을 생각해 봅시다.

{@a dashboard-standalone}

<!--
#### Test _DashboardHeroComponent_ stand-alone
-->
#### _DashboardHeroComponent_ 단독으로 테스트하기

<!--
Here's the meat of the spec file setup.
-->
테스트 환경을 준비하는 코드는 다음과 같습니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="setup"
  header="app/dashboard/dashboard-hero.component.spec.ts (setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="setup"
  header="app/dashboard/dashboard-hero.component.spec.ts (테스트 환경설정)" linenums="false">
</code-example>

<!--
Note how the setup code assigns a test hero (`expectedHero`) to the component's `hero` property,
emulating the way the `DashboardComponent` would set it
via the property binding in its repeater.

The following test verifies that the hero name is propagated to the template via a binding.
-->
원래 `hero` 프로퍼티는 `DashboardComponent`의 리피터 안에서 프로퍼티 바인딩되지만, 이 과정을 간단하게 처리하기 위해 테스트 객체(`expectedHero`)를 선언하고 이 객체를 컴포넌트의 `hero` 프로퍼티에 직접 할당했습니다.

그러면 이렇게 할당된 프로퍼티가 템플릿에 바인딩되어 이름을 제대로 표시하는지 검사할 수 있습니다.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="name-test">
</code-example>

<!--
Because the [template](#dashboard-hero-component) passes the hero name through the Angular `UpperCasePipe`,
the test must match the element value with the upper-cased name.
-->
히어로의 이름은 [템플릿](#dashboard-hero-component)에서 Angular `UpperCasePipe`로 처리되기 때문에, 엘리먼트 값을 검사하는 로직도 대문자로 변환된 이름을 사용해야 합니다.

<div class="alert is-helpful">

<!--
This small test demonstrates how Angular tests can verify a component's visual
representation&mdash;something not possible with
[component class tests](#component-class-testing)&mdash;at
low cost and without resorting to much slower and more complicated end-to-end tests.
-->
[컴포넌트 클래스 테스트](#컴포넌트-클래스-테스트)로 확인할 수 없는 컴포넌트의 시각적인 부분은 이렇게 검사할 수 있습니다.
엔드-투-엔드 테스트에서 컴포넌트를 테스트하는 것보다 더 간단하기 때문에 실행 속도도 훨씬 빠릅니다.

</div>

<!--
#### Clicking
-->
#### 클릭 테스트하기

<!--
Clicking the hero should raise a `selected` event that
the host component (`DashboardComponent` presumably) can hear:
-->
화면에서 히어로를 클릭하면 `selected` 이벤트가 호스트 컴포넌트 `DashboardComponent`로 전달되어야 합니다.
이 내용은 이렇게 테스트할 수 있습니다:

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test">
</code-example>

<!--
The component's `selected` property returns an `EventEmitter`,
which looks like an RxJS synchronous `Observable` to consumers.
The test subscribes to it _explicitly_ just as the host component does _implicitly_.

If the component behaves as expected, clicking the hero's element
should tell the component's `selected` property to emit the `hero` object.

The test detects that event through its subscription to `selected`.
-->
컴포넌트의 `selected` 프로퍼티는 `EventEmitter` 객체를 반환하며, 이 객체는 RxJS의 동기 `Observable`과 비슷한 객체입니다.
원래 이 프로퍼티는 호스트 컴포넌트가 템플릿에서 _자동으로_ 구독하지만, 이 테스트에서는 _명시적으로_ 구독해야 이벤트가 발생하는 것을 확인할 수 있습니다.

컴포넌트가 제대로 구현되었다면 히어로 엘리먼트를 클릭했을 때 컴포넌트의 `selected` 프로퍼티로 `hero` 객체가 전달되어야 합니다.

이 내용은 `selected` 프로퍼티를 구독하면 확인할 수 있습니다.

{@a trigger-event-handler}

#### _triggerEventHandler_

<!--
The `heroDe` in the previous test is a `DebugElement` that represents the hero `<div>`.

It has Angular properties and methods that abstract interaction with the native element.
This test calls the `DebugElement.triggerEventHandler` with the "click" event name.
The "click" event binding responds by calling `DashboardHeroComponent.click()`.

The Angular `DebugElement.triggerEventHandler` can raise _any data-bound event_ by its _event name_.
The second parameter is the event object passed to the handler.

The test triggered a "click" event with a `null` event object.
-->
이 테스트에서 사용하는 변수 `heroDe`는 히어로 `<div>`를 표현하는 `DebugElement` 클래스입니다.

이 클래스는 네이티브 엘리먼트와 추상적으로 상호 작용할 수 있는 프로퍼티와 메소드를 제공하는데, 그 중 `DebugElement.triggerEventHandler`를 사용하면 "click" 이벤트를 발생시킬 수 있습니다.
그리고 `DashboardHeroComponent.click()` 메소드를 직접 사용해도 "click" 이벤트를 발생시킬 수 있습니다.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="trigger-event-handler">
</code-example>

<!--
The test assumes (correctly in this case) that the runtime
event handler&mdash;the component's `click()` method&mdash;doesn't
care about the event object.
-->
이 테스트 코드는 실행 시점에 사용되는 컴포넌트의 `click()` 메소드가 이벤트 객체의 내용은 신경쓰지 않는다는 것을 전제로 했기 때문에, `triggerEventHadler`로 전달하는 이벤트 객체를 `null`로 지정했습니다.

<div class="alert is-helpful">

<!--
Other handlers are less forgiving. For example, the `RouterLink`
directive expects an object with a `button` property
that identifies which mouse button (if any) was pressed during the click.
The `RouterLink` directive throws an error if the event object is missing.
-->
다른 핸들러는 조금 더 번거롭습니다.
예를 들어 `RouterLink` 디렉티브는 어떤 엘리먼트에서 클릭 이벤트가 발생했는지 확인하기 위해 이벤트 객체에 `button` 프로퍼티가 있어야 합니다.
이 프로퍼티가 없으면 에러가 발생합니다.

</div>

<!--
#### Click the element
-->
#### 엘리먼트 클릭하기

<!--
The following test alternative calls the native element's own `click()` method,
which is perfectly fine for _this component_.
-->
엘리먼트를 클릭하는 동작은 네이티브 엘리먼트가 제공하는 `click()` 메소드를 사용해도 됩니다.
이렇게 사용해도 컴포넌트는 이전과 같이 동작합니다.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test-2">
</code-example>

{@a click-helper}

<!--
#### _click()_ helper
-->
#### _click()_ 헬퍼

<!--
Clicking a button, an anchor, or an arbitrary HTML element is a common test task.

Make that consistent and easy by encapsulating the _click-triggering_ process
in a helper such as the `click()` function below:
-->
테스트를 작성하다보면 버튼(`<button>`)이나 앵커(`<a>`)와 같은 HTML 엘리먼트를 동작시키는 일이 자주 있습니다.

이 동작을 캡슐화해서 항상 같은 방식으로 편하게 사용하려면 다음과 같이 _클릭을 처리하는_ 헬퍼를 정의하는 것도 좋습니다:

<!--
<code-example
  path="testing/src/testing/index.ts"
  region="click-event"
  header="testing/index.ts (click helper)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/testing/index.ts"
  region="click-event"
  header="testing/index.ts (클릭 헬퍼)" linenums="false">
</code-example>

<!--
The first parameter is the _element-to-click_. If you wish, you can pass a
custom event object as the second parameter. The default is a (partial)
<a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button">left-button mouse event object</a>
accepted by many handlers including the `RouterLink` directive.
-->
첫번째 인자는 _클릭할 엘리먼트_ 입니다.
그리고 두 번째 인자로 이벤트 객체를 전달할 수도 있습니다.
`RouterLink` 디렉티브와 같이 인자가 필요한 핸들러를 위해, 이 이벤트 객체의 기본값은 <a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button">마우스 왼쪽 버튼 이벤트 객체</a> 일부로 지정했습니다.

<div class="alert is-important">

<!--
The `click()` helper function is **not** one of the Angular testing utilities.
It's a function defined in _this guide's sample code_.
All of the sample tests use it.
If you like it, add it to your own collection of helpers.
-->
`click()` 헬퍼 함수는 Angular가 제공하는 테스트 기능이 _아닙니다_.
이 함수는 _이 가이드 문서에서 사용하기 위해_ 선언한 함수일 뿐입니다.
이번 문서에서는 이 함수를 계속 사용하며, 필요하다면 다른 헬퍼 함수를 정의해서 사용하는 것도 물론 가능합니다.

</div>

<!--
Here's the previous test, rewritten using the click helper.
-->
이제 이전에 작성했던 테스트 코드는 클릭 헬퍼를 사용해서 다음과 같이 작성할 수 있습니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test-3"
  header="app/dashboard/dashboard-hero.component.spec.ts (test with click helper)">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test-3"
  header="app/dashboard/dashboard-hero.component.spec.ts (클릭 헬퍼를 사용하는 테스트 코드)">
</code-example>

<hr>

{@a component-inside-test-host}

<!--
### Component inside a test host
-->
### 테스트 호스트 안에서 테스트하기

<!--
The previous tests played the role of the host `DashboardComponent` themselves.
But does the `DashboardHeroComponent` work correctly when properly data-bound to a host component?

You could test with the actual `DashboardComponent`.
But doing so could require a lot of setup,
especially when its template features an `*ngFor` repeater,
other components, layout HTML, additional bindings,
a constructor that injects multiple services,
and it starts interacting with those services right away.

Imagine the effort to disable these distractions, just to prove a point
that can be made satisfactorily with a _test host_ like this one:
-->
위에서 살펴본 테스트 코드는 테스트 코드 자체가 호스트 컴포넌트 `DashboardComponent`의 역할을 대신합니다.
그런데 호스트 컴포넌트와 직접 데이터 바인딩 되는 경우에도 `DashboardHeroComponent`가 제대로 동작한다고 수 있을까요?

이 의문점을 확인하려면 실제 `DashboardComponent`로 `DashboardHeroComponent`를 테스트해야 합니다.
하지만 `DashboardComponent`를 사용해서 테스트하는 과정이 쉽지만은 않습니다.
템플릿에는 `*ngFor` 리피터가 사용되었고, 다른 컴포넌트가 존재할 수도 있습니다.
HTML 레이아웃이나 바인딩을 처리해야 할 수도 있고 생성자로 여러개의 서비스가 주입될 수도 있으며, 컴포넌트가 시작된 직후에 이 서비스들과 상호작용이 시작될 수도 있습니다.

이 내용을 모두 준비하기 보다는, 다음과 같이 딱 필요한 기능만 구현한 _테스트 호스트_ 를 사용하는 편이 더 좋습니다:

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="test-host"
  header="app/dashboard/dashboard-hero.component.spec.ts (test host)"
  linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="test-host"
  header="app/dashboard/dashboard-hero.component.spec.ts (테스트 호스트)"
  linenums="false">
</code-example>

<!--
This test host binds to `DashboardHeroComponent` as the `DashboardComponent` would
but without the noise of the `Router`, the `HeroService`, or the `*ngFor` repeater.

The test host sets the component's `hero` input property with its test hero.
It binds the component's `selected` event with its `onSelected` handler,
which records the emitted hero in its `selectedHero` property.

Later, the tests will be able to easily check `selectedHero` to verify that the
`DashboardHeroComponent.selected` event emitted the expected hero.

The setup for the _test-host_ tests is similar to the setup for the stand-alone tests:
-->
이 테스트 호스트는 `DashboardComponent`가 하는 역할처럼 `DashboardHeroComponent`의 프로퍼티를 바인딩하지만, `Router`나 `HeroService`, `*ngFor` 리피터의 영향을 받지 않는 컴포넌트입니다.

테스트 호스트는 자식 컴포넌트의 `hero` 입력 프로퍼티로 테스트 히어로 객체를 바인딩합니다.
그리고 자식 컴포넌트의 `selected` 이벤트를 바인딩해서 `onSelected` 핸들러와 연결하기 때문에, 이 핸들러로 받은 이벤트 객체를 `selectedHero` 프로퍼티에 할당해서 확인할 수 있습니다.

_테스트 호스트_ 로 컴포넌트를 테스트하는 환경은 컴포넌트를 단독으로 테스트하는 환경과 비슷합니다:

<!--
<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup" header="app/dashboard/dashboard-hero.component.spec.ts (test host setup)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup" header="app/dashboard/dashboard-hero.component.spec.ts (테스트 호스트 환경설정)" linenums="false"></code-example>

<!--
This testing module configuration shows three important differences:

1. It _declares_ both the `DashboardHeroComponent` and the `TestHostComponent`.
1. It _creates_ the `TestHostComponent` instead of the `DashboardHeroComponent`.
1. The `TestHostComponent` sets the `DashboardHeroComponent.hero` with a binding.

The `createComponent` returns a `fixture` that holds an instance of `TestHostComponent` instead of an instance of `DashboardHeroComponent`.

Creating the `TestHostComponent` has the side-effect of creating a `DashboardHeroComponent`
because the latter appears within the template of the former.
The query for the hero element (`heroEl`) still finds it in the test DOM,
albeit at greater depth in the element tree than before.

The tests themselves are almost identical to the stand-alone version:
-->
이 모듈 설정 중에 이전과 다른 부분이 세 군데 있습니다:

1. `DashboardHeroComponent`를 등록하면서 `TestHostComponent`도 함께 등록합니다.
1. `DashboardHeroComponent` 대신 `TestHostComponent`를 생성합니다.
1. `DashboardHeroComponent.hero` 프로퍼티는 `TestHostComponent`가 바인딩해서 할당합니다.

이제 `createComponent`를 실행하면 `DashboardHeroComponent` 대신 `TestHostComponent`의 `fixture`를 반환합니다.

그러면 `TestHostComponent`의 템플릿 안에 `DashboardHeroComponent`가 사용되었기 때문에 `DashboardHeroComponent`의 인스턴스도 함께 생성됩니다.
그래서 히어로 엘리먼트를 쿼리한 변수 `heroEl`도 여전히 테스트 DOM에 존재합니다.
다만, 엘리먼트 트리 계층으로 보면 이전보다 조금 더 깊은 곳에 있습니다.

테스트 호스트와 `DashboardHeroComponent`를 테스트하는 로직은 `DashboardHeroComponent`를 단독으로 테스트할 때와 거의 비슷합니다:

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="test-host-tests"
  header="app/dashboard/dashboard-hero.component.spec.ts (test-host)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="test-host-tests"
  header="app/dashboard/dashboard-hero.component.spec.ts (테스트 호스트)" linenums="false">
</code-example>

<!--
Only the selected event test differs. It confirms that the selected `DashboardHeroComponent` hero
really does find its way up through the event binding to the host component.
-->
이전과 비교하면 히어로 선택 이벤트를 검사하는 부분만 다릅니다.
이 테스트 코드에서는 `DashboardHeroComponent`에서 사용자가 선택해서 이벤트로 전달된 히어로 객체와 호스트 컴포넌트가 데이터 바인딩하면서 전달했던 히어로 객체가 같은지 검사하도록 작성했습니다.

<hr>

{@a routing-component}

<!--
### Routing component
-->
### 라우팅하는 컴포넌트

<!--
A _routing component_ is a component that tells the `Router` to navigate to another component.
The `DashboardComponent` is a _routing component_ because the user can
navigate to the `HeroDetailComponent` by clicking on one of the _hero buttons_ on the dashboard.

Routing is pretty complicated.
Testing the `DashboardComponent` seemed daunting in part because it involves the `Router`,
which it injects together with the `HeroService`.
-->
_라우팅하는 컴포넌트(routing component)_ 는 컴포넌트가 `Router`를 사용해서 다른 컴포넌트로 이동하는 컴포넌트입니다.
그래서 사용자가 대시보드에 있는 _히어로 버튼_ 중 하나를 클릭하면 `HeroDetailComponent`로 페이지를 전환하기 때문에 `DashboardComponent`도 라우팅하는 컴포넌트입니다.

라우팅은 조금 복잡합니다.
게다가 `DashboardComponent`처럼 `Router`만이 아니라 `HeroService`도 함께 주입되는 컴포넌트를 테스트해야 한다면 시작할 엄두가 나지 않을 수도 있습니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (constructor)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (생성자)" linenums="false">
</code-example>

<!--
Mocking the `HeroService` with a spy is a [familiar story](#component-with-async-service).
But the `Router` has a complicated API and is entwined with other services and application preconditions. Might it be difficult to mock?

Fortunately, not in this case because the `DashboardComponent` isn't doing much with the `Router`
-->
`HeroService`를 모킹하는 것은 [이전에 다뤘기 때문에](#component-with-async-service) 이제 익숙할 것입니다.
하지만 `Router`의 API는 더 복잡하고, 다른 서비스와도 엮여있으며, 애플리케이션의 상태에 따라 동작이 달라지기도 합니다.
라우터를 모킹하는 것이 얼마나 어려운지 짐작할 수 있을까요?

하지만 다행히도 `DashboardComponent`를 테스트하면서 `Router`의 기능을 모두 모킹할 필요는 없습니다.

<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="goto-detail"
  header="app/dashboard/dashboard.component.ts (goToDetail)">
</code-example>

<!--
This is often the case with _routing components_.
As a rule you test the component, not the router,
and care only if the component navigates with the right address under the given conditions.

Providing a router spy for _this component_ test suite happens to be as easy
as providing a `HeroService` spy.
-->
_컴포넌트의 라우팅 동작_ 은 보통 이렇게 구현합니다.
그리고 지금 컴포넌트를 테스트하면서 검사해야 하는 것은 라우터가 아니라 컴포넌트가 올바른 주소로 이동하는지 테스트하는 것입니다.

그러면 `HeroService` 스파이를 활용했던 것처럼, _이 컴포넌트_ 에 꼭 필요한 기능만 구현한 라우터 스파이를 활용하는 것이 더 편합니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="router-spy"
  header="app/dashboard/dashboard.component.spec.ts (spies)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="router-spy"
  header="app/dashboard/dashboard.component.spec.ts (테스트 스파이)" linenums="false">
</code-example>

<!--
The following test clicks the displayed hero and confirms that
`Router.navigateByUrl` is called with the expected url.
-->
화면에 표시된 히어로를 클릭하면 원하는 주소로 이동하기 위해 `Router.navigateByUrl`을 실행하는데, 이 과정을 테스트하는 코드는 다음과 같이 작성할 수 있습니다.

<!--
<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="navigate-test"
  header="app/dashboard/dashboard.component.spec.ts (navigate test)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="navigate-test"
  header="app/dashboard/dashboard.component.spec.ts (네비게이션 테스트)" linenums="false">
</code-example>

{@a routed-component-w-param}

<!--
### Routed components
-->
### 라우팅 대상이 되는 컴포넌트

<!--
A _routed component_ is the destination of a `Router` navigation.
It can be trickier to test, especially when the route to the component _includes parameters_.
The `HeroDetailComponent` is a _routed component_ that is the destination of such a route.

When a user clicks a _Dashboard_ hero, the `DashboardComponent` tells the `Router`
to navigate to `heroes/:id`.
The `:id` is a route parameter whose value is the `id` of the hero to edit.

The `Router` matches that URL to a route to the `HeroDetailComponent`.
It creates an `ActivatedRoute` object with the routing information and
injects it into a new instance of the `HeroDetailComponent`.

Here's the `HeroDetailComponent` constructor:
-->
_라우팅 대상이 되는 컴포넌트(routed component)_ 는 `Router`로 페이지를 전환할 때 대상이 되는 컴포넌트입니다.
이런 컴포넌트는 일반 컴포넌트보다 테스트하기 조금 더 까다로운데, 라우팅하면서 변수를 전달한다면 더 그렇습니다.

사용자가 _대시보드에서_ 히어로를 클릭하면 `DashboardComponent`는 `Router`를 사용해서 `heroes/:id` 주소로 페이지를 전환합니다.
이 때 `:id`는 라우팅 변수이며, 이 변수는 전환되는 페이지에서 `id`로 받아서 수정할 히어로 인스턴스를 가져올 때 사용합니다.

`Router`는 URL을 기준으로 `HeroDetailComponent`로 이동할지 판단합니다.
이 때 라우팅 정보를 담는 `ActivatedRoute` 객체를 생성하는데, 이 객체는 새로 생성되는 `HeroDetailComponent`의 인스턴스에 주입됩니다.

`HeroDetailComponent`의 생성자는 이렇습니다:

<!--
<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ctor" header="app/hero/hero-detail.component.ts (constructor)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ctor" header="app/hero/hero-detail.component.ts (생성자)" linenums="false"></code-example>

<!--
The `HeroDetail` component needs the `id` parameter so it can fetch
the corresponding hero via the `HeroDetailService`.
The component has to get the `id` from the `ActivatedRoute.paramMap` property
which is an `Observable`.

It can't just reference the `id` property of the `ActivatedRoute.paramMap`.
The component has to _subscribe_ to the `ActivatedRoute.paramMap` observable and be prepared
for the `id` to change during its lifetime.
-->
`HeroDetail` 컴포넌트는 `HeroDetailService`를 사용해서 히어로의 정보를 가져와야 하는데, 이 때 히어로를 구분할 `id`가 필요합니다.
그래서 컴포넌트는 `Observable` 타입으로 제공되는 `ActivatedRoute.paramMap` 프로퍼티에서 `id`를 참조해야 합니다.

하지만 `ActivatedRoute.paramMap`에 `id` 프로퍼티가 바로 존재하는 것은 아닙니다.
`ActivatedRoute.paramMap`은 옵저버블 타입으로 제공되기 때문에 이 프로퍼티를 _구독_ 해야 `id`를 참조할 수 있으며, 옵저버블이기 때문에 이 프로퍼티를 구독하면 값이 변경되는 것도 감지할 수 있습니다.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ng-on-init" header="app/hero/hero-detail.component.ts (ngOnInit)" linenums="false"></code-example>

<div class="alert is-helpful">

<!--
The [Router](guide/router#route-parameters) guide covers `ActivatedRoute.paramMap` in more detail.
-->
`ActivatedRoute.paramMap`은 [Router](guide/router#route-parameters) 문서에서 자세하게 다룹니다.

</div>

<!--
Tests can explore how the `HeroDetailComponent` responds to different `id` parameter values
by manipulating the `ActivatedRoute` injected into the component's constructor.

You know how to spy on the `Router` and a data service.

You'll take a different approach with `ActivatedRoute` because

- `paramMap` returns an `Observable` that can emit more than one value
  during a test.
- You need the router helper function, `convertToParamMap()`, to create a `ParamMap`.
- Other _routed components_ tests need a test double for `ActivatedRoute`.

These differences argue for a re-usable stub class.
-->
컴포넌트의 생성자로 주입되는 `ActivatedRoute`를 조작하면 `id` 변수가 변경되었을 때 `HeroDetailComponent`가 어떻게 반응하는지 테스트할 수 있습니다.


`Router`와 데이터 서비스를 스파이로 대체하는 방법은 이전 예제에서 이미 알아봤습니다.

하지만 `ActivatedRoute`는 조금 다르게 사용해야 합니다. 왜냐하면,

- `paramMap`은 테스트 중에 여러번 값을 변경할 수 있도록 `Observable` 타입이어야 합니다.
- `ParamMap` 타입을 생성하기 위해 라우터 헬퍼 함수 `convertToParamMap()`이 필요합니다.
- _라우팅 대상이 되는 컴포넌트_ 의 로직을 테스트하려면 `ActivatedRoute`에 대한 목 객체가 필요합니다.

이 요건을 만족시키기 위해 재사용할 수 있는 클래스를 정의하는 것부터 시작합시다.

#### _ActivatedRouteStub_

<!--
The following `ActivatedRouteStub` class serves as a test double for `ActivatedRoute`.
-->
아래 `ActivatedRouteStub` 클래스는 `ActivatedRoute` 클래스를 대체하는 목 클래스입니다.

<code-example
  path="testing/src/testing/activated-route-stub.ts"
  region="activated-route-stub"
  header="testing/activated-route-stub.ts (ActivatedRouteStub)" linenums="false">
</code-example>

<!--
Consider placing such helpers in a `testing` folder sibling to the `app` folder.
This sample puts `ActivatedRouteStub` in `testing/activated-route-stub.ts`.
-->
이런 종류의 헬퍼는 `app` 폴더와 같은 계층에 `testing` 폴더를 만들고 이 폴더 안에 두는 것이 좋습니다.
그래서 `ActivatedRouteStub` 클래스도 `testing/activated-route-stub.ts` 파일에 존재합니다.

<div class="alert is-helpful">

<!--
Consider writing a more capable version of this stub class with
the [_marble testing library_](#marble-testing).
-->
[_마블 테스트 라이브러리_](#marble-testing)를 활용하면 더 다양하게 활용할 수 있는 목 클래스를 정의할 수 있습니다.

</div>

{@a tests-w-test-double}

<!--
#### Testing with _ActivatedRouteStub_
-->
#### _ActivatedRouteStub_ 로 테스트하기

<!--
Here's a test demonstrating the component's behavior when the observed `id` refers to an existing hero:
-->
`HeroDetailComponent`가 히어로 중 한 명의 `id`를 받았을 때 실행해야 하는 동작은 다음 테스트 코드로 검사할 수 있습니다.

<!--
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-good-id" header="app/hero/hero-detail.component.spec.ts (existing id)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-good-id" header="app/hero/hero-detail.component.spec.ts (id가 존재할 때)" linenums="false"></code-example>

<div class="alert is-helpful">

<!--
The `createComponent()` method and `page` object are discussed [below](#page-object).
Rely on your intuition for now.
-->
`createComponent()` 메소드와 `page` 객체는 [아래](#page-object)에서 자세하게 다룹니다.
지금은 이 메소드와 객체가 어떤 것인지 짐작하는 것만으로 충분합니다.

</div>

<!--
When the `id` cannot be found, the component should re-route to the `HeroListComponent`.

The test suite setup provided the same router spy [described above](#routing-component) which spies on the router without actually navigating.

This test expects the component to try to navigate to the `HeroListComponent`.
-->
`HeroDetailComponent`는 히어로의 목록에 `id` 값에 해당되는 히어로가 없으면 `HeroListComponent`로 다시 페이지를 전환해야 합니다.

이 테스트 스윗은 [위에서 설명한](#routing-component) 라우터 스파이를 사용하기 때문에 실제 네비게이션 동작이 실행되지는 않습니다.

다만, 이 테스트 스펙은 `HeroListComponent`로 전환하려고 시도하는 동작 자체를 검사합니다.

<!--
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-bad-id" header="app/hero/hero-detail.component.spec.ts (bad id)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-bad-id" header="app/hero/hero-detail.component.spec.ts (id가 존재하지 않을 때)" linenums="false"></code-example>

<!--
While this app doesn't have a route to the `HeroDetailComponent` that omits the `id` parameter, it might add such a route someday.
The component should do something reasonable when there is no `id`.

In this implementation, the component should create and display a new hero.
New heroes have `id=0` and a blank `name`. This test confirms that the component behaves as expected:
-->
아직까지는 `HeroDetailComponent`로 라우팅할 때 잘못된 `id`가 전달되어도 애플리케이션에서 처리하는 로직은 없지만, 이런 경우를 처리하는 로직이 조만간 들어가야 한다고 합시다.
그러면 결국 `id`에 해당하는 히어로가 없을 때 컴포넌트가 뭔가 의미있는 동작을 해야 합니다.

지금 구현하는 테스트 코드에서는 라우팅 변수로 전달된 `id`에 해당하는 히어로를 찾지 못했을 때 새로운 히어로를 만들도록 합시다.
새로운 히어로의 `id`는 `0`이며, `name`은 빈 값으로 시작합니다.
그러면 테스트 코드를 다음과 같이 작성할 수 있습니다:

<!--
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="route-no-id"
  header="app/hero/hero-detail.component.spec.ts (no id)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="route-no-id"
  header="app/hero/hero-detail.component.spec.ts (id가 존재하지 않을 때)" linenums="false">
</code-example>

<hr>

<!--
### Nested component tests
-->
### 중첩된 컴포넌트 테스트

<!--
Component templates often have nested components, whose templates
may contain more components.

The component tree can be very deep and, most of the time, the nested components
play no role in testing the component at the top of the tree.

The `AppComponent`, for example, displays a navigation bar with anchors and their `RouterLink` directives.
-->
컴포넌트 템플릿에는 자식 컴포넌트가 존재할 수 있으며, 그 컴포넌트에는 또 다른 자식 컴포넌트가 존재할 수 있습니다.

컴포넌트 트리는 얼마든지 복잡해질 수 있는데, 컴포넌트를 테스트하는 상황에서 중첩된 자식 컴포넌트들은 별로 중요하지 않은 경우가 많습니다.

`AppComponent`의 경우를 생각해보면, 이 컴포넌트에는 `RouterLink` 디렉티브가 사용된 앵커가 여러개 있습니다.

<code-example
  path="testing/src/app/app.component.html"
  header="app/app.component.html" linenums="false">
</code-example>

<!--
While the `AppComponent` _class_ is empty,
you may want to write unit tests to confirm that the links are wired properly
to the `RouterLink` directives, perhaps for the reasons [explained below](#why-stubbed-routerlink-tests).

To validate the links, you don't need the `Router` to navigate and you don't
need the `<router-outlet>` to mark where the `Router` inserts _routed components_.

The `BannerComponent` and `WelcomeComponent`
(indicated by `<app-banner>` and `<app-welcome>`) are also irrelevant.

Yet any test that creates the `AppComponent` in the DOM will also create instances of
these three components and, if you let that happen,
you'll have to configure the `TestBed` to create them.

If you neglect to declare them, the Angular compiler won't recognize the
`<app-banner>`, `<app-welcome>`, and `<router-outlet>` tags in the `AppComponent` template
and will throw an error.

If you declare the real components, you'll also have to declare _their_ nested components
and provide for _all_ services injected in _any_ component in the tree.

That's too much effort just to answer a few simple questions about links.

This section describes two techniques for minimizing the setup.
Use them, alone or in combination, to stay focused on the testing the primary component.
-->
`AppComponent`의 _클래스_ 에는 아무 내용이 없지만, 이 컴포넌트를 대상으로 `RouterLink` 디렉티브가 사용된 링크가 제대로 동작하는지 유닛 테스트를 작성하고 싶을 수 있습니다.
구체적인 이유는 [아래](#why-stubbed-routerlink-tests)에서 설명합니다.

하지만 링크가 제대로 동작하는지 확인하기 위해 `Router` 객체를 그대로 사용할 필요는 없으며, _라우팅 대상이 되는 컴포넌트_ 가 들어갈 `<router-outlet>`을 사용해야 할 필요도 없습니다.

그리고 `AppComponent`를 테스트하면서 `BannerComponent`(`<app-banner>`)와 `WelcomeComponent`(`<app-welcome>`)를 신경쓸 필요도 없습니다.

하지만 테스트 모듈에 `AppComponent`를 생성하려고 하면 의도하지 않았다고 해도 라우팅 대상이 되는 컴포넌트와 `BannerComponent`, `WelcomeComponent`를 모두 생성해야 합니다.

이 과정이 필요없다고 생각해서 이 컴포넌트들을 `declarations` 배열에서 제거하면 Angular 컴파일러가 `<app-banner>`, `<app-welcome>`, `<router-outlet>` 태그를 인식할 수 없기 때문에 `AppComponent` 템플릿을 컴파일 할 수 없어서 에러가 발생합니다.

이 때 실제로 사용되는 컴포넌트를 등록한다면 이 컴포넌트 안에 존재하는 자식 컴포넌트와 `AppComponent`의 자식 컴포넌트 트리에 존재하는 _모든_ 의존성 서비스를 프로바이더로 등록해야 하는 문제가 생깁니다.

우리가 테스트하려고 하는 것은 `AppComponent`의 링크가 제대로 동작하는지 여부인데, 이렇게까지 해야 하는 것은 너무 번거로운 일이 아닐 수 없습니다.

이번 섹션에서는 이런 환경을 설정할 때 필요한 노력을 최소화하는 방법에 대해 다룹니다.
이번 섹션에서 다루는 내용을 활용하면 컴포넌트가 단독으로 존재하거나 자식 컴포넌트가 있는 것과 관계없이 테스트하려는 컴포넌트에만 집중할 수 있습니다.

{@a stub-component}

<!--
##### Stubbing unneeded components
-->
##### 필요없는 컴포넌트 목으로 대체하기

<!--
In the first technique, you create and declare stub versions of the components
and directive that play little or no role in the tests.
-->
첫번째 방법은 테스트에 영향을 주지 않는 컴포넌트와 디렉티브를 목으로 만들어서 원래 컴포넌트나 디렉티브를 대체하는 방법입니다.

<!--
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="component-stubs"
  header="app/app.component.spec.ts (stub declaration)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="component-stubs"
  header="app/app.component.spec.ts (목 클래스 선언)" linenums="false">
</code-example>

<!--
The stub selectors match the selectors for the corresponding real components.
But their templates and classes are empty.

Then declare them in the `TestBed` configuration next to the
components, directives, and pipes that need to be real.
-->
이 때 목 컴포넌트의 셀렉터는 실제 컴포넌트의 셀렉터와 같지만, 템플릿과 클래스는 비어있습니다.

이 컴포넌트들은 `TestBed` 환경 설정에 등록해서 실제로 사용하는 컴포넌트를 대체합니다.
디렉티브와 파이프도 모두 같은 방식으로 대체합니다.

<!--
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="testbed-stubs"
  header="app/app.component.spec.ts (TestBed stubs)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="testbed-stubs"
  header="app/app.component.spec.ts (TestBed 설정)" linenums="false">
</code-example>

<!--
The `AppComponent` is the test subject, so of course you declare the real version.

The `RouterLinkDirectiveStub`, [described later](#routerlink), is a test version
of the real `RouterLink` that helps with the link tests.

The rest are stubs.
-->
물론 `AppComponent`는 테스트해야 하는 대상이기 때문에 이 컴포넌트는 실제 컴포넌트를 등록해야 합니다.

이 코드에 사용된 `RouterLinkDirectiveStub`는 링크에 사용된 `RouterLink`를 대체하는 클래스입니다. 이 클래스는 [아래](#routerlink)에서 자세하게 다룹니다.

이제 `AppComponent`를 제외한 모든 컴포넌트와 디렉티브는 목 클래스로 대체되었습니다.

{@a no-errors-schema}

#### _NO_ERRORS_SCHEMA_

<!--
In the second approach, add `NO_ERRORS_SCHEMA` to the `TestBed.schemas` metadata.
-->
또 다른 방법은 `TestBed.schemas` 메타데이터에 `NO_ERRORS_SCHEMA`를 추가하는 것입니다.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="no-errors-schema"
  header="app/app.component.spec.ts (NO_ERRORS_SCHEMA)" linenums="false">
</code-example>

<!--
The `NO_ERRORS_SCHEMA` tells the Angular compiler to ignore unrecognized elements and attributes.

The compiler will recognize the `<app-root>` element and the `routerLink` attribute
because you declared a corresponding `AppComponent` and `RouterLinkDirectiveStub`
in the `TestBed` configuration.

But the compiler won't throw an error when it encounters `<app-banner>`, `<app-welcome>`, or `<router-outlet>`.
It simply renders them as empty tags and the browser ignores them.

You no longer need the stub components.
-->
`NO_ERRORS_SCHEMA`를 사용하면 확인되지 않은 엘리먼트와 어트리뷰트가 있더라도 Angular 컴파일러가 이것을 에러로 처리하지 않습니다.

템플릿에 사용된 `<app-root>` 엘리먼트에는 `AppComponent`가 매칭되어야 하며, `routerLink` 어트리뷰트에는 `RouterLinkDirectiveStub`가 매칭됩니다.
이것은 모두 `TestBed`에 `AppComponent`와 `RouterLinkDirectiveStub`를 등록했기 때문입니다.

그리고 이제는 `NO_ERRORS_SCHEMA`를 사용했기 때문에 Angular 컴파일러가 `<app-banner>`와 `<app-welcome>`, `<router-outlet>` 엘리먼트에 해당하는 컴포넌트를 찾지 못해도 에러가 발생하지 않습니다.
이 엘리먼트들은 모두 빈 태그로 대체되며 아무 역할도 하지 않습니다.

이제는 목 컴포넌트들을 신경쓰지 않아도 됩니다.

<!--
#### Use both techniques together
-->
#### 두 가지 방법 함께 사용하기

<!--
These are techniques for _Shallow Component Testing_ ,
so-named because they reduce the visual surface of the component to just those elements
in the component's template that matter for tests.

The `NO_ERRORS_SCHEMA` approach is the easier of the two but don't overuse it.

The `NO_ERRORS_SCHEMA` also prevents the compiler from telling you about the missing
components and attributes that you omitted inadvertently or misspelled.
You could waste hours chasing phantom bugs that the compiler would have caught in an instant.

The _stub component_ approach has another advantage.
While the stubs in _this_ example were empty,
you could give them stripped-down templates and classes if your tests
need to interact with them in some way.

In practice you will combine the two techniques in the same setup,
as seen in this example.
-->
위에서 설명한 두 테크닉은 모두 테스트하려는 컴포넌트 외의 구성요소를 모두 다른 것으로 대체해서 테스트 코드를 간단하게 만드는 테크닉입니다.
그래서 이런 테스트 방식을 _얕은 컴포넌트 테스트(Shallow Component Testing)_ 라고 합니다.

두 방법 중에서는 `NO_ERRORS_SCHEMA`를 사용하는 방법이 좀 더 간단하지만, 이 방법을 남용하면 안됩니다.

`NO_ERRORS_SCHEMA`를 사용하면 Angular 컴포넌트가 검사해야 하는 많은 과정을 생략합니다.
그리고 의도하지 않은 오타가 있어서 컴포넌트나 어트리뷰트가 누락되더라도 에러로 처리하지 않습니다.
이런 문제가 발생하면 버그를 해결하기 위해 꽤 많은 시간을 들여야 할 수도 있습니다.

그리고 _컴포넌트를 목으로 대체_ 할 때 좋은 점이 하나 더 있습니다.
이 예제에서 다룬 목 클래스들의 템플릿과 클래스 코드는 모두 비어있지만, 테스트하는 컴포넌트가 자식 컴포넌트와 상호작용해야 하는 부분이 있으면 필요한 내용을 추가로 구현해서 처리할 수 있습니다.

실제로 테스트 스펙을 작성하다보면 다음과 같이 두 가지 방식을 모두 사용하는 경우가 많습니다.

<!--
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="mixed-setup"
  header="app/app.component.spec.ts (mixed setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="mixed-setup"
  header="app/app.component.spec.ts (두가지 방식을 모두 적용한 환경 설정)" linenums="false">
</code-example>

<!--
The Angular compiler creates the `BannerComponentStub` for the `<app-banner>` element
and applies the `RouterLinkStubDirective` to the anchors with the `routerLink` attribute,
but it ignores the `<app-welcome>` and `<router-outlet>` tags.
-->
테스트 환경을 이렇게 구성하면 `<app-banner>` 엘리먼트에는 `BannerComponentStub`이 사용되며 `routerLink` 어트리뷰트가 사용된 앵커에는 `RouterLinkStubDirective`가 사용됩니다.
`<app-welcome>`과 `<router-outlet>` 태그는 무시됩니다.

<hr>

{@a routerlink}
<!--
### Components with _RouterLink_
-->
### _RouterLink_ 를 사용하는 컴포넌트

<!--
The real `RouterLinkDirective` is quite complicated and entangled with other components
and directives of the `RouterModule`.
It requires challenging setup to mock and use in tests.

The `RouterLinkDirectiveStub` in this sample code replaces the real directive
with an alternative version designed to validate the kind of anchor tag wiring
seen in the `AppComponent` template.
-->
`RouterLinkDirective`는 디렉티브 자체도 많이 복잡하지만 `RouterModule`에 있는 다른 컴포넌트나 디렉티브와 긴밀하게 연결되어 있기도 합니다.
그래서 이 디렉티브를 테스트 환경에서 모킹하는 것은 아주 어렵습니다.

`AppComponent`의 템플릿에 있는 앵커 태그에도 이 디렉티브가 사용되었는데, 이번 테스트 코드에서는 실제 디렉티브 대신 `RouterLinkDirectiveStub`를 사용해서 테스트에 필요한 로직만 검증해 봅시다.

<code-example
  path="testing/src/testing/router-link-directive-stub.ts"
  region="router-link"
  header="testing/router-link-directive-stub.ts (RouterLinkDirectiveStub)" linenums="false">
</code-example>

<!--
The URL bound to the `[routerLink]` attribute flows in to the directive's `linkParams` property.

The `HostListener` wires the click event of the host element
(the `<a>` anchor elements in `AppComponent`) to the stub directive's `onClick` method.

Clicking the anchor should trigger the `onClick()` method,
which sets the stub's telltale `navigatedTo` property.
Tests inspect `navigatedTo` to confirm that clicking the anchor
set the expected route definition.
-->
`[routerLink]` 어트리뷰트로 전달된 URL은 디렉티브의 `linkParams` 프로퍼티로 바인딩됩니다.

그리고 호스트 엘리먼트(`AppComponent`에 있는 `<a>` 앵커 엘리먼트)에서 발생하는 클릭 이벤트는 `HostListener`를 사용해서 디렉티브의 `onClick` 메소드와 연결합니다.

이제 앵커 태그를 클릭하면 디렉티브에 정의된 `onClick()` 메소드가 실행되는데, 클릭 동작 이후에 디렉티브의 `navigateTo` 프로퍼티를 확인하면 원하는 주소로 이동하려고 하는 것인지 확인할 수 있습니다.

<div class="alert is-helpful">

<!--
Whether the router is configured properly to navigate with that route definition is a
question for a separate set of tests.
-->
라우터가 해당 주소로 이동할 수 있도록 라우팅 규칙을 올바르게 구성했는지 여부는 이 테스트 코드에서 확인하지 않습니다.

</div>

{@a by-directive}
{@a inject-directive}

<!--
#### _By.directive_ and injected directives
-->
#### _By.directive_ 와 의존성으로 주입되는 디렉티브

<!--
A little more setup triggers the initial data binding and gets references to the navigation links:
-->
네비게이션 링크에 초기 데이터를 바인딩하려면 설정해야 할 것이 조금 더 있습니다:

<!--
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="test-setup"
  header="app/app.component.spec.ts (test setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/app.component.spec.ts"
  region="test-setup"
  header="app/app.component.spec.ts (테스트환경 설정)" linenums="false">
</code-example>

<!--
Three points of special interest:

1.  You can locate the anchor elements with an attached directive using `By.directive`.

1.  The query returns `DebugElement` wrappers around the matching elements.

1.  Each `DebugElement` exposes a dependency injector with the
    specific instance of the directive attached to that element.

The `AppComponent` links to validate are as follows:
-->
이 코드에서 세 부분이 중요합니다:

1. `By.directive`를 사용하면 특정 디렉티브가 사용된 앵커 엘리먼트를 가져올 수 있습니다.

1. 엘리먼트는 `DebugElement` 래퍼(wrapper) 타입으로 반환됩니다.

1. 엘리먼트에 의존성으로 주입된 디렉티브 인스턴스를 참조하려면 각 `DebugElement`의 인젝터를 사용하면 됩니다.

`AppComponent`에 사용된 링크를 다시 한 번 봅시다:

<!--
<code-example
  path="testing/src/app/app.component.html"
  region="links"
  header="app/app.component.html (navigation links)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/app.component.html"
  region="links"
  header="app/app.component.html (네비게이션 링크)" linenums="false">
</code-example>

{@a app-component-tests}

<!--
Here are some tests that confirm those links are wired to the `routerLink` directives
as expected:
-->
이 링크들이 `routerLink` 디렉티브와 제대로 연결되었는지 확인하는 테스트 코드는 다음과 같이 작성합니다:

<!--
<code-example path="testing/src/app/app.component.spec.ts" region="tests" header="app/app.component.spec.ts (selected tests)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/app.component.spec.ts" region="tests" header="app/app.component.spec.ts (테스트 코드)" linenums="false"></code-example>

<div class="alert is-helpful">

<!--
The "click" test _in this example_ is misleading.
It tests the `RouterLinkDirectiveStub` rather than the _component_.
This is a common failing of directive stubs.

It has a legitimate purpose in this guide.
It demonstrates how to find a `RouterLink` element, click it, and inspect a result,
without engaging the full router machinery.
This is a skill you may need to test a more sophisticated component, one that changes the display,
re-calculates parameters, or re-arranges navigation options when the user clicks the link.
-->
_이 테스트 코드_ 중에 "click" 부분은 어울리지 않는 코드라고 생각할 수도 있습니다.
해당 코드는 _컴포넌트_ 를 테스트하는 것이 아니라 `RouterLinkDirectiveStub`을 테스트하는 코드이기 때문입니다.
하지만 디렉티브를 대체하는 경우에는 이런 테크닉을 사용해야만 하는 경우가 종종 있습니다.

이 테스트 코드는 `RouterLink`가 사용된 엘리먼트를 찾아서, 이 엘리먼트를 클릭하고, 결과를 확인하는 과정에 실제 라우터의 기능은 하나도 활용하지 않습니다.
그래서 이후에도 사용자가 링크를 클릭했을 때 컴포넌트가 화면의 내용을 바꾸거나, 인자를 다시 계산하고, 네비게이션 옵션을 수정하는 동작을 테스트할 때도 이와 비슷한 방식을 사용하면 테스트 코드를 조금 더 간단하게 작성할 수 있습니다.

</div>

{@a why-stubbed-routerlink-tests}

<!--
#### What good are these tests?
-->
#### 왜 _RouterLink_ 를 목 클래스로 사용하나요?

<!--
Stubbed `RouterLink` tests can confirm that a component with links and an outlet is setup properly,
that the component has the links it should have, and that they are all pointing in the expected direction.
These tests do not concern whether the app will succeed in navigating to the target component when the user clicks a link.

Stubbing the RouterLink and RouterOutlet is the best option for such limited testing goals.
Relying on the real router would make them brittle.
They could fail for reasons unrelated to the component.
For example, a navigation guard could prevent an unauthorized user from visiting the `HeroListComponent`.
That's not the fault of the `AppComponent` and no change to that component could cure the failed test.

A _different_ battery of tests can explore whether the application navigates as expected
in the presence of conditions that influence guards such as whether the user is authenticated and authorized.
-->
`RouterLink`를 목 클래스로 테스트하면 컴포넌트에 존재하는 링크와 라우팅 영역이 제대로 설정되었는지, 미리 지정된 주소로 제대로 이동하는지 확인할 수 있습니다.
그리고 이 테스트 코드는 사용자가 링크를 클릭했을 때 실제로 페이지를 전환하는지는 신경쓰지 않습니다.

`RouterLink`와 `RouterOutlet`를 목 클래스로 대체하는 것은 테스트 범위를 제한하기 위해서입니다.
이 테스트에서 실제 라우터를 사용한다면 테스트 코드는 훨씬 더 복잡해집니다.
그리고 테스트하려는 컴포넌트 외부에서 발생한 어떤 이유 때문에 테스트가 실패할 수도 잇습니다.
예를 들면 로그인하지 않은 사용자가 `HeroListComponent`를 방문하는 것을 막는 라우터 가드가 동작할 수도 있습니다.
이런 문제는 `AppComponent`의 문제가 아니면서도, 테스트를 정상적으로 실행하기 위해 `AppComponent`가 할 수 있는 일은 없습니다.

사용자가 로그인했거나 로그인하지 않은 상태에 따라 애플리케이션의 네비게이션 동작이 다르게 실행되어야 한다면, 지금까지 설명한 방법이 아닌 다른 방법을 활용해야 합니다.

<div class="alert is-helpful">

<!--
A future guide update will explain how to write such
tests with the `RouterTestingModule`.
-->
이 섹션에서 다룬 테스트 코드는 `RouterTestingModule`에 대해 다룰 때 다시 한 번 언급합니다.

</div>

<hr>

{@a page-object}

<!--
### Use a _page_ object
-->
### _page_ 객체 사용하기

<!--
The `HeroDetailComponent` is a simple view with a title, two hero fields, and two buttons.
-->
`HeroDetailComponent`는 페이지 제목과 필드 2개, 버튼이 2개 있는 간단한 컴포넌트입니다.

<figure>
  <img src='generated/images/guide/testing/hero-detail.component.png' alt="HeroDetailComponent in action">
</figure>

<!--
But there's plenty of template complexity even in this simple form.
-->
하지만 이렇게 간단한 폼을 구성하더라도 컴포넌트 템플릿이 간단하지만은 않습니다.

<code-example
  path="testing/src/app/hero/hero-detail.component.html" header="app/hero/hero-detail.component.html" linenums="false">
</code-example>

<!--
Tests that exercise the component need ...

- to wait until a hero arrives before elements appear in the DOM.
- a reference to the title text.
- a reference to the name input box to inspect and set it.
- references to the two buttons so they can click them.
- spies for some of the component and router methods.

Even a small form such as this one can produce a mess of tortured conditional setup and CSS element selection.

Tame the complexity with a `Page` class that handles access to component properties
and encapsulates the logic that sets them.

Here is such a `Page` class for the `hero-detail.component.spec.ts`
-->
이 컴포넌트를 테스트하려면 ...

- `hero` 프로퍼티가 준비되기 전까지 엘리먼트들은 DOM에 표시되지 않아야 합니다.
- 컴포넌트 제목 엘리먼트를 참조해야 합니다.
- 히어로의 이름이 표시되는 입력 필드를 찾아서 이 필드의 값을 설정해야 합니다.
- 두 개의 버튼을 참조해야 하며, 이 버튼들은 클릭할 수 있어야 합니다.
- 컴포넌트 메소드나 라우터 메소드에 스파이를 적용해야 합니다.

이렇게 간단한 폼에서도 수많은 테스트를 실행할 수 있기 때문에, 이 컴포넌트를 테스트하는 환경과 CSS 엘리먼트는 준비하는 것은 아주 괴로운 일이 될 수 있습니다.

이런 경우에는 컴포넌트를 준비하는 로직을 캡슐화하고 컴포넌트의 프로퍼티를 효율적으로 조작하기 위해 `Page` 클래스를 도입하는 것이 좋습니다.

`hero-detail.component.spec.ts` 파일에 정의된 `Page` 클래스는 다음과 같습니다:

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="page"
  header="app/hero/hero-detail.component.spec.ts (Page)" linenums="false">
</code-example>

<!--
Now the important hooks for component manipulation and inspection are neatly organized and accessible from an instance of `Page`.

A `createComponent` method creates a `page` object and fills in the blanks once the `hero` arrives.
-->
이제 컴포넌트를 조작하거나 검사하는 로직은 모두 `Page` 인스턴스를 통해서 처리할 수 있습니다.

그리고 `createComponent` 메소드는 `page` 객체의 인스턴스를 생성한 이후에 `hero` 데이터를 받아와서 화면을 갱신하는 동작까지 실행합니다.

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="create-component"
  header="app/hero/hero-detail.component.spec.ts (createComponent)" linenums="false">
</code-example>

<!--
The [_HeroDetailComponent_ tests](#tests-w-test-double) in an earlier section demonstrate how `createComponent` and `page`
keep the tests short and _on message_.
There are no distractions: no waiting for promises to resolve and no searching the DOM for element values to compare.

Here are a few more `HeroDetailComponent` tests to reinforce the point.
-->
이전 섹션에서 살펴봤던 [_HeroDetailComponent_ 테스트](#tests-w-test-double)는 `createComponent` 메소드와 `page` 객체를 사용했기 때문에, 간단하지만 _이해하기 쉽게_ 테스트 코드를 작성할 수 있었습니다.
테스트 코드를 복잡하게 할 수 있는 것은 아무것도 없습니다: 해결해야 할 Promise도 없고 DOM에서 엘리먼트를 쿼리하는 코드도 없습니다.

이 내용을 확실하게 확인하기 위해 `HeroDetailComponent`를 다양하게 테스트하는 코드를 살펴봅시다.

<!--
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="selected-tests"
  header="app/hero/hero-detail.component.spec.ts (selected tests)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="selected-tests"
  header="app/hero/hero-detail.component.spec.ts (테스트 일부)" linenums="false">
</code-example>

<hr>

{@a compile-components}

<!--
### Calling _compileComponents()_
-->
### _compileComponents()_ 실행하기

<div class="alert is-helpful">

<!--
You can ignore this section if you _only_ run tests with the CLI `ng test` command
because the CLI compiles the application before running the tests.
-->
`ng test` _명령을_ 사용해서 테스트를 실행한다면 이 섹션은 건너뛰어도 됩니다.
Angular CLI는 테스트를 실행하기 전에 애플리케이션을 자동으로 컴파일합니다.

</div>

<!--
If you run tests in a **non-CLI environment**, the tests may fail with a message like this one:
-->
**Angular CLI가 아닌 환경으로** 테스트를 실행한다면 다음과 같은 메시지가 출력되면서 테스트가 실패하는 경우가 있습니다:

<code-example language="sh" class="code-shell" hideCopy>
Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.
</code-example>

<!--
The root of the problem is at least one of the components involved in the test
specifies an external template or CSS file as
the following version of the `BannerComponent` does.
-->
이 에러가 발생한 원인은, 테스트에 사용된 컴포넌트 중 하나에 외부 템플릿이나 외부 CSS 파일이 사용되었기 때문입니다.
`BannerComponent`를 다음과 같이 선언한 경우가 그렇습니다:

<!--
<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  header="app/banner/banner-external.component.ts (external template & css)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  header="app/banner/banner-external.component.ts (외부 템플릿 & css)" linenums="false">
</code-example>

<!--
The test fails when the `TestBed` tries to create the component.
-->
이 테스트 코드는 `TestBed`가 컴포넌트를 생성하려고 하는 시점에 실패합니다.

<!--
<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="configure-and-create"
  header="app/banner/banner.component.spec.ts (setup that fails)"
  avoid linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="configure-and-create"
  header="app/banner/banner.component.spec.ts (테스트에 실패하는 환경 설정)"
  avoid linenums="false">
</code-example>

<!--
Recall that the app hasn't been compiled.
So when you call `createComponent()`, the `TestBed` compiles implicitly.

That's not a problem when the source code is in memory.
But the `BannerComponent` requires external files
that the compiler must read from the file system,
an inherently _asynchronous_ operation.

If the `TestBed` were allowed to continue, the tests would run and fail mysteriously
before the compiler could finished.

The preemptive error message tells you to compile explicitly with `compileComponents()`.
-->
애플리케이션이 아직 컴파일되지 않았다는 것을 명심하세요.
그렇다면 테스트할 컴포넌트를 생성하기 위해 `TestBed.createComponent()`를 실행하면 될 것이라 생각할 수 있습니다.

하지만 이렇게 해도 테스트는 실패합니다.
`BannerComponent`를 컴파일하려면 컴포넌트에 사용하는 외부 파일을 읽기 위해 파일 시스템을 읽어야 하는데, 이 동작은 _비동기_ 로 실행됩니다.

그래서 `TestBed`로 이후 작업을 계속하려고 하면, 컴파일러의 동작이 아직 끝나지 않은 상태에서 테스트를 실행했기 때문에 해당 테스트는 실패합니다.

위에서 출력된 에러메시지에서 확인할 수 있듯이, 외부 파일이 사용된 컴포넌트를 제대로 컴파일하려면 `createComponent()` 를 실행하기 전에 `compileComponents()`를 먼저 실행해야 합니다.

<!--
#### _compileComponents()_ is async
-->
#### _compileComponents()_ 는 비동기로 실행됩니다.

<!--
You must call `compileComponents()` within an asynchronous test function.
-->
이 문제를 해결하려면 비동기 테스트 로직에서 `compileComponents()`를 실행해야 합니다.

<div class="alert is-critical">

<!--
If you neglect to make the test function async
(e.g., forget to use `async()` as described below),
you'll see this error message
-->
이 예제에서 `async()`와 같은 비동기 테스트 함수를 명시적으로 사용하지 않으면 다음과 같은 에러가 발생합니다.

<code-example language="sh" class="code-shell" hideCopy>
Error: ViewDestroyedError: Attempt to use a destroyed view
</code-example>

</div>

<!--
A typical approach is to divide the setup logic into two separate `beforeEach()` functions:

1.  An async `beforeEach()` that compiles the components
1.  A synchronous `beforeEach()` that performs the remaining setup.

To follow this pattern, import the `async()` helper with the other testing symbols.
-->
서로 다른 환경설정 로직이 있다면 이 로직은 각각 `beforeEach()` 함수로 나눠서 정의하는 것이 일반적입니다. 이 방식을 사용해 봅시다:

1. 컴포넌트를 컴파일하는 로직은 비동기 `beforeEach()`에 작성합니다.
1. 나머지 환경설정은 동기 `beforeEach()`에 작성합니다.

이렇게 작성하려면 먼저 테스트 패키지에서 `async()` 헬퍼를 로드해야 합니다.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="import-async">
</code-example>

<!--
#### The async _beforeEach_
-->
#### 비동기(async) _beforeEach_

<!--
Write the first async `beforeEach` like this.
-->
첫번째 비동기 `beforeEach`는 다음과 같이 작성합니다.

<!--
<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="async-before-each"
  header="app/banner/banner-external.component.spec.ts (async beforeEach)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="async-before-each"
  header="app/banner/banner-external.component.spec.ts (비동기 beforeEach)" linenums="false">
</code-example>

<!--
The `async()` helper function takes a parameterless function with the body of the setup.

The `TestBed.configureTestingModule()` method returns the `TestBed` class so you can chain
calls to other `TestBed` static methods such as `compileComponents()`.

In this example, the `BannerComponent` is the only component to compile.
Other examples configure the testing module with multiple components
and may import application modules that hold yet more components.
Any of them could be require external files.

The `TestBed.compileComponents` method asynchronously compiles all components configured in the testing module.
-->
`async()` 헬퍼 함수는 인자가 없는 함수를 받아서 실행합니다.

그리고 `TestBed.configureTestingModule()` 메소드는 `TestBed` 클래스를 반환하기 때문에, 이 메소드를 체이닝하면서 바로 `compileComponents()` 메소드를 실행할 수 있습니다.

이 예제에서 컴파일 대상이 되는 컴포넌트는 `BannerComponent` 하나뿐입니다.
다른 예제에서는 컴포넌트 여러개를 테스트 모듈에 등록할 수도 있으며, 컴포넌트가 등록된 다른 모듈을 로드해야 할 수도 있습니다.
그리고 이 때 불러오는 컴포넌트들이 외부 파일을 참조하는 경우도 있을 수 있습니다.

이제 `TestBed.compileComponents` 메소드를 실행하면 테스트 모듈에 있는 모든 컴포넌트를 비동기로 컴파일합니다.

<div class="alert is-important">

<!--
Do not re-configure the `TestBed` after calling `compileComponents()`.
-->
`compileComponents()`를 실행한 후에 `TestBed` 설정을 변경하지 마세요.

</div>

<!--
Calling `compileComponents()` closes the current `TestBed` instance to further configuration.
You cannot call any more `TestBed` configuration methods, not `configureTestingModule()`
nor any of the `override...` methods. The `TestBed` throws an error if you try.

Make `compileComponents()` the last step
before calling `TestBed.createComponent()`.
-->
`compileComponents()`를 실행하면 현재 설정중인 `TestBed` 인스턴스 설정을 확정하며, 더이상 설정을 변경할 수 없습니다.
그래서 이 메소드를 실행한 이후부터 `TestBed`에서 환경을 설정하는 메소드를 실행할 수 없습니다.
`configureTestingModule()`이나 `override...` 메소드들이 모두 해당됩니다.
`compileComponents()`를 실행한 뒤에 이 메소드들을 실행하면 에러가 발생합니다.

그래서 `compileComponents()`는 `TestBed.createComponent()`를 실행하기 전 마지막 단계로 실행해야 합니다.

<!--
#### The synchronous _beforeEach_
-->
#### 동기(synchronous) _beforeEach_

<!--
The second, synchronous `beforeEach()` contains the remaining setup steps,
which include creating the component and querying for elements to inspect.
-->
그 다음에는 아직 남은 환경설정을 위해 동기로 동작하는 `beforeEach()`를 정의해야 합니다.
이 함수에는 컴포넌트를 생성하고 엘리먼트를 쿼리하는 로직이 들어갈 것입니다.

<!--
<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="sync-before-each"
  header="app/banner/banner-external.component.spec.ts (synchronous beforeEach)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="sync-before-each"
  header="app/banner/banner-external.component.spec.ts (동기 beforeEach)" linenums="false">
</code-example>

<!--
You can count on the test runner to wait for the first asynchronous `beforeEach` to finish before calling the second.
-->
하지만 이 `beforeEach()`는 위에서 살펴본 비동기 `beforeEach()`가 끝난 후에 실행되어야 하기 때문에, 이렇게 작성할 수 없습니다.

<!--
#### Consolidated setup
-->
#### 통합 환경설정

<!--
You can consolidate the two `beforeEach()` functions into a single, async `beforeEach()`.

The `compileComponents()` method returns a promise so you can perform the
synchronous setup tasks _after_ compilation by moving the synchronous code
into a `then(...)` callback.
-->
두 `beforeEach()` 함수는 비동기 `beforeEach()` 하나로 통합할 수 있습니다.

`compileComponents()` 메소드는 `Promise`를 반환하기 때문에, 테스트 모듈을 컴파일한 _이후에_ 필요한 로직을 `then(...)` 콜백으로 연결할 수 있습니다.

<!--
<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="one-before-each"
  header="app/banner/banner-external.component.spec.ts (one beforeEach)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="one-before-each"
  header="app/banner/banner-external.component.spec.ts (통합된 beforeEach)" linenums="false">
</code-example>

<!--
#### _compileComponents()_ is harmless
-->
#### _compileComponents()_ 는 잘못 사용해도 에러가 발생하지 않습니다.

<!--
There's no harm in calling `compileComponents()` when it's not required.

The component test file generated by the CLI calls `compileComponents()`
even though it is never required when running `ng test`.

The tests in this guide only call `compileComponents` when necessary.
-->
`compileComponents()`는 이 함수가 필요하지 않을 때 실행하더라도 에러가 발생하지 않습니다.

심지어 Angular CLI가 자동으로 생성한 컴포넌트 테스트 파일은 `ng test`를 실행할 때 전혀 필요하지 않은데도 `compileComponents()`를 실행합니다.

하지만 `compileComponents`는 꼭 필요할 때만 실행하는 것을 권장합니다.

<hr>

{@a import-module}

<!--
### Setup with module imports
-->
### 모듈 로드 설정

<!--
Earlier component tests configured the testing module with a few `declarations` like this:
-->
이전에 다뤘던 컴포넌트 테스트 코드에서 테스트 모듈의 `declarations`는 이렇게 선언했습니다:

<!--
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="config-testbed"
  header="app/dashboard/dashboard-hero.component.spec.ts (configure TestBed)">
</code-example>
-->
<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="config-testbed"
  header="app/dashboard/dashboard-hero.component.spec.ts (TestBed 설정)">
</code-example>

<!--
The `DashboardComponent` is simple. It needs no help.
But more complex components often depend on other components, directives, pipes, and providers
and these must be added to the testing module too.

Fortunately, the `TestBed.configureTestingModule` parameter parallels
the metadata passed to the `@NgModule` decorator
which means you can also specify `providers` and `imports`.

The `HeroDetailComponent` requires a lot of help despite its small size and simple construction.
In addition to the support it receives from the default testing module `CommonModule`, it needs:

- `NgModel` and friends in the `FormsModule` to enable two-way data binding.
- The `TitleCasePipe` from the `shared` folder.
- Router services (which these tests are stubbing).
- Hero data access services (also stubbed).

One approach is to configure the testing module from the individual pieces as in this example:
-->
`DashboardComponent`는 간단합니다. 그래서 이 컴포넌트를 테스트하는 코드를 작성하는 것도 그리 어렵지 않습니다.
하지만 컴포넌트가 다른 컴포넌트와 연동되어야 한다던지, 디렉티브나 파이프, 프로바이더를 사용해야 하면 테스팅 모듈에 이 구성요소를 모두 등록해야 합니다.

하지만 다행히도 `TestBed.configureTestingModule`에 전달하는 인자는 `@NgModule` 데코레이터에 전달하는 메타데이터와 거의 비슷하기 때문에, `TestBed`에도 `providers`와 `imports` 배열을 지정할 수 있습니다.

`HeroDetailComponent` 자체는 아주 간단하지만 이 컴포넌트를 테스트하려면 많은 내용을 준비해야 합니다.
준비해야 하는 항목들은 이렇습니다:

- 양방향 데이터 바인딩을 연결하기 위해 `NgModel`과 `FormsModule`이 필요합니다.
- `shared` 폴더에 있는 `TitleCasePipe`가 필요합니다.
- (목 클래스를 사용하더라도) 라우터 서비스가 필요합니다.
- (이것도 목 클래스일 수 있지만) 히어로 데이터에 접근하는 서비스가 필요합니다.

가장 단순한 방법은 이 항목들을 모두 테스트 모듈에 등록하는 것입니다:

<!--
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-forms-module"
  header="app/hero/hero-detail.component.spec.ts (FormsModule setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-forms-module"
  header="app/hero/hero-detail.component.spec.ts (FormsModule 환경설정)" linenums="false">
</code-example>

<div class="alert is-helpful">

<!--
Notice that the `beforeEach()` is asynchronous and calls `TestBed.compileComponents`
because the `HeroDetailComponent` has an external template and css file.

As explained in [_Calling compileComponents()_](#compile-components) above,
these tests could be run in a non-CLI environment
where Angular would have to compile them in the browser.
-->
`HeroDetailComponent`는 외부 템플릿 파일과 외부 CSS 파일을 사용하기 때문에 `beforeEach()`는 비동기로 동작해야 하며 이 함수 안에서 `TestBed.compileComponents()`를 실행해야 합니다.

그리고 이전에 [_compileComponents() 실행하기_](#compile-components)에서 설명했던 것처럼, Angular CLI를 사용하지 않는 환경에서도 브라우저에서 컴포넌트를 컴파일하기 위해 이 함수를 반드시 실행해야 합니다.

</div>

<!--
#### Import a shared module
-->
#### 공통 모듈 로드하기

<!--
Because many app components need the `FormsModule` and the `TitleCasePipe`, the developer created
a `SharedModule` to combine these and other frequently requested parts.

The test configuration can use the `SharedModule` too as seen in this alternative setup:
-->
애플리케이션에 존재하는 컴포넌트 중에서 `FormsModule`과 `TitleCasePipe`를 사용하는 컴포넌트가 많기 때문에, 개발자가 자주 사용하는 항목으로 묶어서 `SharedModule`로 만들었다고 합시다.

그러면 테스트 환경설정에서도 다음과 같이 `SharedModule`을 사용할 수 있습니다:

<!--
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-shared-module"
  header="app/hero/hero-detail.component.spec.ts (SharedModule setup)" linenums="false">
</code-example>
-->
<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-shared-module"
  header="app/hero/hero-detail.component.spec.ts (SharedModule 환경설정)" linenums="false">
</code-example>

<!--
It's a bit tighter and smaller, with fewer import statements (not shown).
-->
테스트 코드는 조금 간단해졌습니다.

{@a feature-module-import}

<!--
#### Import a feature module
-->
#### 기능모듈 로드하기

<!--
The `HeroDetailComponent` is part of the `HeroModule` [Feature Module](guide/feature-modules) that aggregates more of the interdependent pieces
including the `SharedModule`.
Try a test configuration that imports the `HeroModule` like this one:
-->
`HeroDetailComponent`는 `HeroModule` [기능 모듈](guide/feature-modules)의 구성요소이며, `HeroModule`은 `SharedModule`을 내부적으로 로드합니다.
그러면 테스트 환경설정은 `HeroModule`을 사용해서 다음과 같이 수정할 수 있습니다:


<!--
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-hero-module" header="app/hero/hero-detail.component.spec.ts (HeroModule setup)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-hero-module" header="app/hero/hero-detail.component.spec.ts (HeroModule 환경설정)" linenums="false"></code-example>

<!--
That's _really_ crisp. Only the _test doubles_ in the `providers` remain. Even the `HeroDetailComponent` declaration is gone.

In fact, if you try to declare it, Angular will throw an error because
`HeroDetailComponent` is declared in both the `HeroModule` and the `DynamicTestModule`
created by the `TestBed`.
-->
좀 더 간결해졌습니다. 이제는 `providers`에 있는 _목 클래스_ 들만 처리하면 됩니다.
`HeroDetailComponent`를 등록하는 코드도 없어졌습니다.

만약 `HeroDetailComponent`를 테스트 모듈에 등록하면, 이 컴포넌트는 `HeroModule`과 `TestBed`가 생성하는 `DynamicTestModule` 양쪽에 동시에 등록되기 때문에 에러가 발생합니다.

<div class="alert is-helpful">

<!--
Importing the component's feature module can be the easiest way to configure tests
when there are many mutual dependencies within the module and
the module is small, as feature modules tend to be.
-->
컴포넌트를 직접 등록하는 대신 기능 모듈을 등록하는 방법을 사용하면 이 컴포넌트와 복잡하게 연결된 의존성 객체들을 기능 모듈이 대신 처리하기 때문에 테스트 코드가 훨씬 간단해 집니다.

</div>

<hr>

{@a component-override}

<!--
### Override component providers
-->
### 컴포넌트 프로바이더 오버라이드하기

<!--
The `HeroDetailComponent` provides its own `HeroDetailService`.
-->
`HeroDetailComponent`에는 `HeroDetailService`가 직접 등록되어 있습니다.

<!--
<code-example path="testing/src/app/hero/hero-detail.component.ts" region="prototype" header="app/hero/hero-detail.component.ts (prototype)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.ts" region="prototype" header="app/hero/hero-detail.component.ts (프로토타입)" linenums="false"></code-example>

<!--
It's not possible to stub the component's `HeroDetailService` in the `providers` of the `TestBed.configureTestingModule`.
Those are providers for the _testing module_, not the component. They prepare the dependency injector at the _fixture level_.

Angular creates the component with its _own_ injector, which is a _child_ of the fixture injector.
It registers the component's providers (the `HeroDetailService` in this case) with the child injector.

A test cannot get to child injector services from the fixture injector.
And `TestBed.configureTestingModule` can't configure them either.

Angular has been creating new instances of the real `HeroDetailService` all along!
-->
이런 경우에는 `TestBed.configureTestingModule`의 `providers`에서 `HeroDetailService`에 대한 목 클래스를 등록할 수 없습니다.
_테스트 모듈_ 에 등록하는 프로바이더는 모듈 계층에 등록되는 것이지 컴포넌트에 등록되는 것이 아니기 때문입니다.
그래서 이 경우에는 _픽스쳐 계층(fixture level)_ 에 있는 의존성 주입기를 활용해야 합니다.

Angular는 컴포넌트 계층에 인젝터를 생성하는데, 이 인젝터는 픽스쳐 인젝터의 _자식_ 인젝터입니다.
그래서 컴포넌트의 프로바이더에 등록된 서비스(이 경우에는 `HeroDetailService`)는 컴포넌트 자식 인젝터에 등록됩니다.

하지만 픽스쳐 인젝터로는 자식 인젝터를 직접 참조할 수 없습니다.
`TestBed.configureTestingModule`로도 픽스쳐 인젝터와 컴포넌트 인젝터에 접근할 수 없습니다.

그래서 Angular는 테스트 환경에 실제 `HeroDetailService` 인스턴스를 생성하게 될 것입니다!

<div class="alert is-helpful">

<!--
These tests could fail or timeout if the `HeroDetailService` made its own XHR calls to a remote server.
There might not be a remote server to call.

Fortunately, the `HeroDetailService` delegates responsibility for remote data access to an injected `HeroService`.
-->
`HeroDetailService`가 리모트 서버로 XHR 요청을 보낸다면 테스트가 실패하거나 타임아웃이 발생할 수 있습니다.
리모트 서버로 요청을 보내는 코드는 없어야 합니다.

다행히 `HeroDetailService`에서 데이터를 가져오는 로직은 `HeroService`를 활용하기 때문에, 리모트 서버로 보내는 요청은 `HeroService`에서 처리할 수 있습니다.

<!--
<code-example path="testing/src/app/hero/hero-detail.service.ts" region="prototype" header="app/hero/hero-detail.service.ts (prototype)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.service.ts" region="prototype" header="app/hero/hero-detail.service.ts (프로토타입)" linenums="false"></code-example>

<!--
The [previous test configuration](#feature-module-import) replaces the real `HeroService` with a `TestHeroService`
that intercepts server requests and fakes their responses.
-->
[이전에 살펴봤던 테스트 환경설정](#feature-module-import)에서 `HeroService`는 `TestHeroService`로 교체했기 때문에, 서버로 보내는 요청을 가로채서 원하는 응답을 대신 보낼 수 있습니다.

</div>

<!--
What if you aren't so lucky. What if faking the `HeroService` is hard?
What if `HeroDetailService` makes its own server requests?

The `TestBed.overrideComponent` method can replace the component's `providers` with easy-to-manage _test doubles_
as seen in the following setup variation:
-->
이런 방식을 사용할 수 없는 경우를 생각해 봅시다.
`HeroService`를 모킹하는 것이 어렵다면 어떻게 해야 할까요?
`HeroDetailService`가 직접 서버로 요청을 보낸다면 또 어떻게 해야 할까요?

`TestBed.overrideComponent` 메소드를 사용하면 컴포넌트의 `providers`에 등록된 서비스를 좀 더 관리하기 쉬운 _목 클래스_ 로 대체할 수 있습니다.
이 함수는 다음과 같이 사용합니다:

<!--
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override" header="app/hero/hero-detail.component.spec.ts (Override setup)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override" header="app/hero/hero-detail.component.spec.ts (오버라이드 환경설정)" linenums="false"></code-example>

<!--
Notice that `TestBed.configureTestingModule` no longer provides a (fake) `HeroService` because it's [not needed](#spy-stub).
-->
`TestBed.configureTestingModule`에는 더이상 목 `HeroService`를 등록할 필요가 없습니다.

{@a override-component-method}

<!--
#### The _overrideComponent_ method
-->
#### _overrideComponent_ 메소드

<!--
Focus on the `overrideComponent` method.
-->
`overrideComponent` 메소드를 자세히 봅시다.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-component-method" header="app/hero/hero-detail.component.spec.ts (overrideComponent)" linenums="false"></code-example>

<!--
It takes two arguments: the component type to override (`HeroDetailComponent`) and an override metadata object.
The [override metadata object](#metadata-override-object) is a generic defined as follows:
-->
이 메소드는 프로바이더가 등록된 컴포넌트 타입(`HeroDetailComponent`)과 오버라이드 메타데이터 객체, 총 2개의 인자를 받습니다.
이 때 [메타데이터 오버라이드 객체(metadata override object)](#metadata-override-object)는 다음과 같이 제네릭으로 정의되어 있습니다:

<!--
<code-example format="." language="javascript">
  type MetadataOverride&lt;T&gt; = {
    add?: Partial&lt;T&gt;;
    remove?: Partial&lt;T&gt;;
    set?: Partial&lt;T&gt;;
  };
</code-example>
-->
<code-example format="." language="javascript">
  type MetadataOverride&lt;T> = {
    add?: Partial&lt;T>;
    remove?: Partial&lt;T>;
    set?: Partial&lt;T>;
  };
</code-example>

<!--
A metadata override object can either add-and-remove elements in metadata properties or completely reset those properties.
This example resets the component's `providers` metadata.

The type parameter, `T`, is the kind of metadata you'd pass to the `@Component` decorator:
-->
메타데이터 오버라이드 객체는 컴포넌트에 적용된 메타데이터 프로퍼티를 추가하거나 제거할 수도 있고, 완전히 새로운 값으로 교체할 수도 있습니다.
위에서 사용한 예제 코드는 컴포넌트의 `providers` 메타데이터를 새로운 값으로 교체하는 코드입니다.

그리고 타입 인자 `T`는 `@Component` 데코레이터에 전달하는 메타데이터 중 하나를 사용할 수 있습니다:

<code-example format="." language="javascript">
  selector?: string;
  template?: string;
  templateUrl?: string;
  providers?: any[];
  ...
</code-example>

{@a spy-stub}

<!--
#### Provide a _spy stub_ (_HeroDetailServiceSpy_)
-->
#### _스파이 객체_ 등록하기 (_HeroDetailServiceSpy_)

<!--
This example completely replaces the component's `providers` array with a new array containing a `HeroDetailServiceSpy`.

The `HeroDetailServiceSpy` is a stubbed version of the real `HeroDetailService`
that fakes all necessary features of that service.
It neither injects nor delegates to the lower level `HeroService`
so there's no need to provide a test double for that.

The related `HeroDetailComponent` tests will assert that methods of the `HeroDetailService`
were called by spying on the service methods.
Accordingly, the stub implements its methods as spies:
-->
위에서 살펴본 예제는 컴포넌트의 `providers` 배열을 완전히 새로운 배열로 교체하는 코드이며, 이 때 새로운 배열에는 `HeroDetailServiceSpy`가 사용되었습니다.

`HeroDetailServiceSpy`는 실제 `HeroDetailService`의 기능을 모두 대신하는 목 클래스입니다.
그리고 목 클래스의 모든 메소드는 스파이 메소드로 구현할 것이기 때문에 `HeroService`를 주입할 필요도 없습니다.

이렇게 `providers` 배열을 오버라이드하고 나면 `HeroDetailComponent`가 `HeroDetailService`를 활용하는 로직이 모두 스파이 메소드를 실행하게 됩니다.
`HeroDetailService`는 다음과 같이 구현합니다:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="hds-spy" header="app/hero/hero-detail.component.spec.ts (HeroDetailServiceSpy)" linenums="false"></code-example>

{@a override-tests}

<!--
#### The override tests
-->
#### 오버라이드 테스트

<!--
Now the tests can control the component's hero directly by manipulating the spy-stub's `testHero`
and confirm that service methods were called.
-->
이제 컴포넌트를 테스트하면서 사용하는 히어로 객체는 스파이 클래스의 `testHero` 프로퍼티로 직접 조작할 수 있습니다.
그리고 서비스 메소드를 실행하는 것도 확인할 수 있습니다.

<!--
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests" header="app/hero/hero-detail.component.spec.ts (override tests)" linenums="false"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests" header="app/hero/hero-detail.component.spec.ts (오버라이드 테스트)" linenums="false"></code-example>

{@a more-overrides}

<!--
#### More overrides
-->
#### 오버라이드 활용하기

<!--
The `TestBed.overrideComponent` method can be called multiple times for the same or different components.
The `TestBed` offers similar `overrideDirective`, `overrideModule`, and `overridePipe` methods
for digging into and replacing parts of these other classes.

Explore the options and combinations on your own.
-->
`TestBed.overrideComponent` 메소드는 특정 컴포넌트나 여러 컴포넌트를 대상으로 여러번 실행할 수 있습니다.
그리고 `TestBed`는 `overrideComponent`와 비슷하게 동작하는 `overrideDirective`나 `overrideModule`, `overridePipe` 메소드도 제공합니다.
컴포넌트가 아닌 다른 Angular 구성요소도 얼마든지 조작할 수 있습니다.

다양한 옵션과 함께 테스트에 활용하는 방법에 대해 자유롭게 연구해 보세요.

<hr>

{@a attribute-directive}

<!--
## Attribute Directive Testing
-->
## 어트리뷰트 디렉티브 테스트

<!--
An _attribute directive_ modifies the behavior of an element, component or another directive.
Its name reflects the way the directive is applied: as an attribute on a host element.

The sample application's `HighlightDirective` sets the background color of an element
based on either a data bound color or a default color (lightgray).
It also sets a custom property of the element (`customProperty`) to `true`
for no reason other than to show that it can.
-->
_어트리뷰트 디렉티브(attribute directive)_ 는 엘리먼트나 컴포넌트, 다른 디렉티브의 행동을 조작합니다.
그리고 이름에서 알 수 있듯이, 이 디렉티브는 호스트 엘리먼트에 어트리뷰트처럼 사용합니다.

예제 애플리케이션에서 `HighlightDirective`는 엘리먼트의 배경을 변경하는데, 이 때 바인딩 받거나 기본값(lightgray)으로 지정된 색상을 사용합니다.
그리고 설명하기 위해서만 사용하지만, 이 디렉티브는 엘리먼트의 커스텀 프로퍼티(`customProperty`)를 `true` 값으로 설정하는 역할도 합니다.

<code-example path="testing/src/app/shared/highlight.directive.ts" header="app/shared/highlight.directive.ts" linenums="false"></code-example>

<!--
It's used throughout the application, perhaps most simply in the `AboutComponent`:
-->
이 디렉티브를 `AboutComponent`에 사용한다면 다음과 같이 사용할 수 있습니다:

<code-example path="testing/src/app/about/about.component.ts" header="app/about/about.component.ts" linenums="false"></code-example>

<!--
Testing the specific use of the `HighlightDirective` within the `AboutComponent` requires only the
techniques explored above (in particular the ["Shallow test"](#nested-component-tests) approach).
-->
`HighlightDirective`를 `AboutComponent`에 사용하는 것을 테스트하는 것은 위에서 살펴본 것으로 충분합니다.
더 자세한 내용은 [중첩된 컴포넌트 테스트](#중첩된-컴포넌트-테스트) 섹션을 참고하세요.

<code-example path="testing/src/app/about/about.component.spec.ts" region="tests" header="app/about/about.component.spec.ts" linenums="false"></code-example>

<!--
However, testing a single use case is unlikely to explore the full range of a directive's capabilities.
Finding and testing all components that use the directive is tedious, brittle, and almost as unlikely to afford full coverage.

_Class-only tests_ might be helpful,
but attribute directives like this one tend to manipulate the DOM.
Isolated unit tests don't touch the DOM and, therefore,
do not inspire confidence in the directive's efficacy.

A better solution is to create an artificial test component that demonstrates all ways to apply the directive.
-->
그런데 한가지 사용방법을 테스트했다고 해서 이 디렉티브의 모든 내용을 확인했다고 하기는 어렵습니다.
하지만 그렇다고 해서 이 디렉티브를 사용하는 모든 컴포넌트를 찾아서 테스트하는 것은 번거롭고 귀찮은 일이며, 꼭 그렇게 할 필요도 없습니다.

_클래스만 테스트하는 것_ 은 간단하지만 어트리뷰트 디렉티브는 DOM을 조작하기 위해 만들어진 것입니다.
그래서 DOM을 배제한 상태로 유닛 테스트를 진행하는 것은 디렉티브를 제대로 테스트했다고 할 수 없습니다.

이런 경우에는 테스트 컴포넌트를 따로 정의해서 이 컴포넌트를 대상으로 디렉티브를 다양하게 적용해보는 것이 더 좋습니다.

<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="test-component" header="app/shared/highlight.directive.spec.ts (TestComponent)" linenums="false"></code-example>

<figure>
  <img src='generated/images/guide/testing/highlight-directive-spec.png' alt="HighlightDirective spec in action">
</figure>

<div class="alert is-helpful">

<!--
The `<input>` case binds the `HighlightDirective` to the name of a color value in the input box.
The initial value is the word "cyan" which should be the background color of the input box.
-->
`<input>`는 `HighlightDirective`와 입력 필드에 입력된 색상을 바인딩합니다.
이 때 초기값은 "cyan"으로 지정했습니다.

</div>

<!--
Here are some tests of this component:
-->
이 디렉티브는 다음과 같이 테스트할 수 있습니다:

<!--
<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="selected-tests" header="app/shared/highlight.directive.spec.ts (selected tests)"></code-example>
-->
<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="selected-tests" header="app/shared/highlight.directive.spec.ts (테스트 일부)"></code-example>

<!--
A few techniques are noteworthy:

- The `By.directive` predicate is a great way to get the elements that have this directive _when their element types are unknown_.

- The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/:not">`:not` pseudo-class</a>
  in `By.css('h2:not([highlight])')` helps find `<h2>` elements that _do not_ have the directive.
  `By.css('*:not([highlight])')` finds _any_ element that does not have the directive.

- `DebugElement.styles` affords access to element styles even in the absence of a real browser, thanks to the `DebugElement` abstraction.
  But feel free to exploit the `nativeElement` when that seems easier or more clear than the abstraction.

- Angular adds a directive to the injector of the element to which it is applied.
  The test for the default color uses the injector of the second `<h2>` to get its `HighlightDirective` instance
  and its `defaultColor`.

- `DebugElement.properties` affords access to the artificial custom property that is set by the directive.
-->
이 테스트 코드에서 이런 내용이 중요합니다:

- `By.directive`를 사용하면 _엘리먼트의 타입을 알지 못하더라도_ 원하는 디렉티브가 적용된 엘리먼트를 간단하게 쿼리할 수 있습니다.

- `By.css('h2:not([highlight])')`라고 사용할 때 <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/:not">가상 클래스(pseudo-class) `:not`</a>을 사용했기 때문에 이 디렉티브가 _사용되지 않은_ `<h2>` 엘리먼트를 가져왔습니다.
  `By.css('*:not([highlight])')`라고 사용하면 이 디렉티브가 사용되지 않은 _모든_ 엘리먼트를 쿼리합니다.

- `DebugElement.styles`를 사용하면 실제 브라우저에 없는 엘리먼트 스타일에도 접근할 수 있습니다. 이것은 모두 `DebugElement`가 추상화된 객체이기 때문입니다.
  하지만 추상화된 클래스보다는 실제 엘리먼트 클래스인 `nativeElement`를 사용하는 것이 더 간단하고 명확하긴 합니다.

- Angular는 디렉티브가 적용된 엘리먼트의 인젝터에 이 디렉티브를 등록합니다.
  그래서 두번째 `<h2>` 엘리먼트를 테스트할 때는 엘리먼트 인젝터로 `HighlightDirective`의 인스턴스를 가져온 후에 이 디렉티브의 `defaultColor` 프로퍼티에 직접 접근하는 방법을 사용했습니다.

- `DebugElement.properties`를 사용하면 디렉티브가 엘리먼트에 설정한 커스텀 프로퍼티를 참조할 수 있습니다.

<hr>

<!--
## Pipe Testing
-->
## 파이프 테스트

<!--
Pipes are easy to test without the Angular testing utilities.

A pipe class has one method, `transform`, that manipulates the input
value into a transformed output value.
The `transform` implementation rarely interacts with the DOM.
Most pipes have no dependence on Angular other than the `@Pipe`
metadata and an interface.

Consider a `TitleCasePipe` that capitalizes the first letter of each word.
Here's a naive implementation with a regular expression.
-->
파이프는 Angular의 테스트 유틸리티를 사용하지 않더라도 테스트하기 쉽습니다.

파이프는 입력으로 받은 값을 어떤 형태로 변환하는 역할만 하기 때문에 파이프에는 `transform` 메소드 하나만 정의되어 있습니다.
그리고 `transform` 메소드는 DOM과 상호작용하는 일도 거의 없습니다.
게다가 파이프는 `@Pipe` 메타데이터와 인터페이스 외에 또 다른 Angular 구성요소를 의존성으로 주입받는 일도 거의 없습니다.

각 단어의 첫 글자를 대문자로 변환하는 `TitleCasePipe`를 살펴봅시다.
이 파이프는 정규 표현식을 사용해서 간단하게 구현된 파이프입니다.

<code-example path="testing/src/app/shared/title-case.pipe.ts" header="app/shared/title-case.pipe.ts" linenums="false"></code-example>

<!--
Anything that uses a regular expression is worth testing thoroughly.
Use simple Jasmine to explore the expected cases and the edge cases.
-->
정규표현식을 사용하는 로직은 충분히 테스트할 필요가 있습니다.
그래서 경계 조건을 포함해서 다양한 시나리오를 검토해보는 것이 좋습니다.
이 테스트 스펙들은 Jasmine을 사용해서 다음과 같이 작성할 수 있습니다.

<code-example path="testing/src/app/shared/title-case.pipe.spec.ts" region="excerpt" header="app/shared/title-case.pipe.spec.ts"></code-example>

{@a write-tests}

<!--
#### Write DOM tests too
-->
#### DOM 조작 테스트

<!--
These are tests of the pipe _in isolation_.
They can't tell if the `TitleCasePipe` is working properly as applied in the application components.

Consider adding component tests such as this one:
-->
지금까지는 _분리된 환경에서_ 파이프를 테스트해 봤습니다.
그래서 이 테스트 코드들만으로는 `TitleCasePipe`가 애플리케이션에 있는 컴포넌트에 적용되었을 때도 제대로 동작한다고 할 수 없습니다.

그렇다면 다음과 같이 컴포넌트에 적용해서 테스트하는 코드를 작성하는 것도 좋습니다:

<!--
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" header="app/hero/hero-detail.component.spec.ts (pipe test)"></code-example>
-->
<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" header="app/hero/hero-detail.component.spec.ts (파이프 테스트)"></code-example>

<hr>

{@a test-debugging}

<!--
## Test debugging
-->
## 테스트 디버깅하기

<!--
Debug specs in the browser in the same way that you debug an application.

1. Reveal the Karma browser window (hidden earlier).
1. Click the **DEBUG** button; it opens a new browser tab and re-runs the tests.
1. Open the browser's “Developer Tools” (`Ctrl-Shift-I` on windows; `Command-Option-I` in OSX).
1. Pick the "sources" section.
1. Open the `1st.spec.ts` test file (Control/Command-P, then start typing the name of the file).
1. Set a breakpoint in the test.
1. Refresh the browser, and it stops at the breakpoint.
-->
테스트 스펙을 디버깅하는 방법은 브라우저에서 애플리케이션을 디버깅하는 방법과 같습니다.

1. Karma가 실행되고 있는 브라우저를 찾습니다.
1. **DEBUG** 버튼을 누릅니다. 그러면 새로운 브라우저 탭이 열리면서 테스트가 다시 시작됩니다.
1. 브라우저에서 "개발자 도구"를 엽니다. (윈도우에서는 `Ctrl-Shift-I`, OSX에서는 `Command-Option-I`)
1. "Sources" 탭을 선택합니다.
1. `1st.spec.ts` 테스트 파일을 엽니다. (Control/Common-P를 누르고 파일 이름을 입력하면 됩니다.)
1. 테스트 파일에 중단점을 지정합니다.
1. 브라우저를 새로고침합니다. 그러면 중단점으로 설정했던 코드에서 코드 실행이 멈춥니다.

<figure>
  <img src='generated/images/guide/testing/karma-1st-spec-debug.png' alt="Karma debugging">
</figure>

<hr>

{@a atu-apis}

<!--
## Testing Utility APIs
-->
## 테스트 유틸리티

<!--
This section takes inventory of the most useful Angular testing features and summarizes what they do.

The Angular testing utilities include the `TestBed`, the `ComponentFixture`, and a handful of functions that control the test environment.
The [_TestBed_](#testbed-api-summary) and [_ComponentFixture_](#component-fixture-api-summary) classes are covered separately.

Here's a summary of the stand-alone functions, in order of likely utility:
-->
이 섹션에서는 테스트 코드를 작성하면서 자주 사용하는 Angular 테스트 유틸리티에 대해 알아봅니다.

`TestBed`나 `ComponentFixture`에서 제공하는 테스트 유틸리티를 활용하면 테스트 환경을 자유롭게 조작할 수 있습니다.
그래서 이번 섹션에서는[_TestBed_](#testbed-api-summary)와 [_ComponentFixture_](#component-fixture-api-summary)를 하나씩 다루면서 자세하게 살펴볼 것입니다.

자주 사용하는 테스트 함수 중 단독으로 사용할 수 있는 함수들은 이런 것들이 있습니다:

<table>
  <tr>
    <!--
    <th>
      Function
    </th>
    <th>
      Description
    </th>
    -->
    <th>
      함수
    </th>
    <th>
      설명
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>async</code>
    </td>

    <td>

      <!--
      Runs the body of a test (`it`) or setup (`beforeEach`) function within a special _async test zone_.
      See [discussion above](#async).
      -->
      테스트 스펙의 몸체(`it`)나 환경설정 로직(`beforeEach`)를 _async 테스트 존_ 에서 실행합니다.
      자세한 내용은 [위에서 설명한 것](#async)을 참고하세요.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>fakeAsync</code>
    </td>

    <td>

      <!--
      Runs the body of a test (`it`) within a special _fakeAsync test zone_, enabling
      a linear control flow coding style. See [discussion above](#fake-async).
      -->
      테스트 스펙의 몸체(`it`)를 _fakeAsync 테스트 존_ 에서 실행하며, 비동기 로직을 선형으로 제어할 수 있습니다.
      자세한 내용은 [위에서 설명한 것](#fake-async)을 참고하세요.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>tick</code>
    </td>

    <td>

      <!--
      Simulates the passage of time and the completion of pending asynchronous activities
      by flushing both _timer_ and _micro-task_ queues within the _fakeAsync test zone_.
      -->
      테스트가 실행되는 환경의 시간을 빠르게 돌려서 _fakeAsync 테스트 존_ 에서 아직 처리되지 않은 _타이머_ 나 _마이크로 태스크_ 를 처리합니다.

      <div class="alert is-helpful">

      <!--
      The curious, dedicated reader might enjoy this lengthy blog post,
      ["_Tasks, microtasks, queues and schedules_"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/).
      -->
      ["_Tasks, microtasks, queues and schedules_"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) 블로그 글도 한 번 읽어보세요.

      </div>

      <!--
      Accepts an optional argument that moves the virtual clock forward
      by the specified number of milliseconds,
      clearing asynchronous activities scheduled within that timeframe.
      See [discussion above](#tick).
      -->
      숫자를 밀리초 단위로 전달하면 시간이 해당 시간만큼 지난 것을 처리할 수 있으며, 이 시간동안 실행되는 비동기 작업도 모두 완료됩니다.
      자세한 내용은 [위에서 설명한 것](#tick)을 참고하세요.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
       <code>inject</code>
    </td>

    <td>

      <!--
      Injects one or more services from the current `TestBed` injector into a test function.
      It cannot inject a service provided by the component itself.
      See discussion of the [debugElement.injector](#get-injected-services).
      -->
      `TestBed` 인젝터를 사용해서 테스트 스펙에 서비스를 의존성으로 주입합니다.
      컴포넌트에 프로바이더로 등록된 서비스는 주입할 수 없습니다.
      자세한 내용은 [debugElement.injector](#의존성으로-주입한-서비스-가져오기)을 참고하세요.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>discardPeriodicTasks</code>
    </td>

    <td>

      <!--
      When a `fakeAsync()` test ends with pending timer event _tasks_ (queued `setTimeOut` and `setInterval` callbacks),
      the test fails with a clear error message.

      In general, a test should end with no queued tasks.
      When pending timer tasks are expected, call `discardPeriodicTasks` to flush the _task_ queue
      and avoid the error.
      -->
      기본 상태에서 아직 처리되지 않은 타이머 이벤트 _태스크_ (`setTimeout`, `setInterval` 콜백)가 있는 상태로 `fakeAsync()` 테스트가 끝나면 에러가 발생합니다.

      일반적으로 테스트 스펙은 태스크 큐에 아무 태스크가 없는 상태에서 끝나야 합니다.
      하지만 `discardPeriodicTasks` 함수를 사용하면 아직 처리되지 않은 타이머가 있다는 것을 의도한 것으로 처리하기 때문에, 바로 _태스크_ 큐를 비우면서 테스트를 종료합니다.
      에러도 발생하지 않습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>flushMicrotasks</code>
    </td>

    <td>

      <!--
      When a `fakeAsync()` test ends with pending _micro-tasks_ such as unresolved promises,
      the test fails with a clear error message.

      In general, a test should wait for micro-tasks to finish.
      When pending microtasks are expected, call `flushMicrotasks` to flush the  _micro-task_ queue
      and avoid the error.
      -->
      기본 상태에서 아직 처리되지 않은 _마이크로 태스크_ (끝나지 않은 Promise 등)가 있는 상태로 `fakeAsync()` 테스트가 끝나면 에러가 발생합니다.

      일반적으로 테스트 스펙은 마이크로 태스크들이 모두 종료된 이후에 끝나야 합니다.
      하지만 `flushMicroTasks`를 사용하면 아직 처리되지 않은 마이크로 태스크가 있다는 것을 의도한 것으로 처리하기 때문에, 바로 _마이크로 태스크_ 큐를 비우면서 테스트를 종료합니다.
      에러도 발생하지 않습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>ComponentFixtureAutoDetect</code>
    </td>

    <td>

      <!--
      A provider token for a service that turns on [automatic change detection](#automatic-change-detection).
      -->
      [변화감지를 자동으로 실행할 때](#변화감지-자동으로-실행하기) 사용하는 서비스 프로바이더 토큰입니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>getTestBed</code>
    </td>

    <td>

      <!--
      Gets the current instance of the `TestBed`.
      Usually unnecessary because the static class methods of the `TestBed` class are typically sufficient.
      The `TestBed` instance exposes a few rarely used members that are not available as
      static methods.
      -->
      현재 사용하고 있는 `TestBed` 인스턴스를 참조합니다.
      일반적으로 `TestBed` 클래스는 정적 클래스 메소드로 제공되는 기능을 활용하는 것만으로도 충분합니다.
      하지만 정적 메소드로 제공되지 않는 일부 멤버를 참조해야하는 일이 생기면 이 때 `TestBed` 인스턴스를 참조할 수 있습니다.

    </td>
  </tr>
</table>

<hr>

{@a testbed-class-summary}

<!--
#### _TestBed_ class summary
-->
#### _TestBed_ 클래스

<!--
The `TestBed` class is one of the principal Angular testing utilities.
Its API is quite large and can be overwhelming until you've explored it,
a little at a time. Read the early part of this guide first
to get the basics before trying to absorb the full API.

The module definition passed to `configureTestingModule`
is a subset of the `@NgModule` metadata properties.
-->
`TestBed` 클래스는 Angular가 제공하는 테스트 유틸리티 중에서도 가장 중요한 클래스입니다.
`TestBed`가 제공하는 API는 상당히 방대하기 때문에 이 클래스를 훑어보는 것만으로도 부담이 될 수 있습니다.
하지만 처음부터 모든 API를 알아야 하는 것은 아니기 때문에 이 문서에서 다룬 것처럼 필요한 것을 하나씩 찾아서 활용하는 것이 좋습니다.

`configureTestingModule` 메소드에 전달하는 모듈 정의는 `@NgModule` 메타데이터 프로퍼티의 서브셋입니다.

<code-example format="." language="javascript">
  type TestModuleMetadata = {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    schemas?: Array&lt;SchemaMetadata | any[]&gt;;
  };
</code-example>

{@a metadata-override-object}

<!--
Each override method takes a `MetadataOverride<T>` where `T` is the kind of metadata
appropriate to the method, that is, the parameter of an `@NgModule`,
`@Component`, `@Directive`, or `@Pipe`.
-->
이와 비슷하게 오버라이드 메소드가 인자로 받는 객체는 `MetadataOverride<T>` 타입인데, 이 때 `T`는 메소드에 해당하는 메타데이터 타입을 의미합니다.
그래서 메소드 인자는 `@NgModule`이나 `@Component`, `@Directive`, `@Pipe`에 사용하는 메타데이터와 비슷하게 사용합니다.

<!--
<code-example format="." language="javascript">
  type MetadataOverride&lt;T&gt; = {
    add?: Partial&lt;T&gt;;
    remove?: Partial&lt;T&gt;;
    set?: Partial&lt;T&gt;;
  };
</code-example>
-->
<code-example format="." language="javascript">
  type MetadataOverride&lt;T> = {
    add?: Partial&lt;T>;
    remove?: Partial&lt;T>;
    set?: Partial&lt;T>;
  };
</code-example>

{@a testbed-methods}
{@a testbed-api-summary}

<!--
The `TestBed` API consists of static class methods that either update or reference a _global_ instance of the`TestBed`.

Internally, all static methods cover methods of the current runtime `TestBed` instance,
which is also returned by the `getTestBed()` function.

Call `TestBed` methods _within_ a `beforeEach()` to ensure a fresh start before each individual test.

Here are the most important static methods, in order of likely utility.
-->
`TestBed`가 제공하는 API 중 정적 클래스 메소드로 제공되는 것들은 _전역_ 에 존재하는 `TestBed` 인스턴스를 조작하거나 참조하는 것들입니다.

내부적으로 정적 메소드들은 현재 테스트 환경에서 사용되고 있는 `TestBed` 인스턴스가 실행하는 메소드에 모두 관여합니다.
`TestBed` 인스턴스를 반환하는 `getTestBed()` 함수도 마찬가지입니다.

`beforeEach()` 안에서 `TestBed` 메소드를 실행하면 환경설정이 깔끔하게 된 상태로 개별 테스트를 실행할 수 있습니다.

정적 메소드 중에서 가장 중요하고 자주 사용하는 메소드들에 대해 알아봅시다.

<table>
  <tr>
    <th>
      <!--
      Methods
      -->
      메소드
    </th>
    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>configureTestingModule</code>
    </td>

    <td>

      <!--
      The testing shims (`karma-test-shim`, `browser-test-shim`)
      establish the [initial test environment](guide/testing) and a default testing module.
      The default testing module is configured with basic declaratives and some Angular service substitutes that every tester needs.

      Call `configureTestingModule` to refine the testing module configuration for a particular set of tests
      by adding and removing imports, declarations (of components, directives, and pipes), and providers.
      -->
      `karma-test-shim`과 `browser-test-shim`을 사용해서 [기본 테스트 환경](guide/testing)과 테스트 모듈을 구성합니다.
      기본 테스트 모듈은 테스트 스펙에 필요한 Angular 구성요소와 서비스를 등록해서 구성합니다.

      `configureTestingModule`를 실행하면 특정 테스트 스펙에 필요한 설정으로 테스트 모듈을 다시 설정할 수 있습니다.
      테스트 모듈이 로드하는 모듈 목록에 새로운 항목을 추가하거나 뺄 수 있고 컴포넌트, 디렉티브, 파이프 목록을 변경할 수 있으며, 프로바이더도 변경할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>compileComponents</code>
    </td>

    <td>

      <!--
      Compile the testing module asynchronously after you've finished configuring it.
      You **must** call this method if _any_ of the testing module components have a `templateUrl`
      or `styleUrls` because fetching component template and style files is necessarily asynchronous.
      See [above](#compile-components).

      After calling `compileComponents`, the `TestBed` configuration is frozen for the duration of the current spec.
      -->
      설정을 끝낸 테스트 모듈을 비동기로 컴파일할 때 사용합니다.
      테스트 모듈에 포함된 컴포넌트 중에서 `templateUrl`과 `styleUrls`를 사용하는 컴포넌트가 있다면, 이 컴포넌트 템플릿 파일과 스타일 파일이 비동기로 로드되어야 하기 때문에 **반드시** 이 함수를 실행해야 합니다.
      [위에서 설명한 내용](#compile-components)을 참고하세요.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <!--
      <code>createComponent<T></code>
      -->
      <code>createComponent&lt;T></code>
    </td>

    <td>

      <!--
      Create an instance of a component of type `T` based on the current `TestBed` configuration.
      After calling `compileComponent`, the `TestBed` configuration is frozen for the duration of the current spec.
      -->
      현재 설정된 `TestBed` 환경으로 `T` 타입의 컴포넌트 인스턴스를 생성합니다.
      `compileComponent`를 실행하고 나면 `TestBed` 환경 설정이 확정되기 때문에 해당 블럭에서 동작하는 테스트 스펙이 끝날 때까지 `TestBed` 설정을 변경할 수 없습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overrideModule</code>
    </td>
    <td>

      <!--
      Replace metadata for the given `NgModule`. Recall that modules can import other modules.
      The `overrideModule` method can reach deeply into the current testing module to
      modify one of these inner modules.
      -->
      `NgModule`에 설정된 메타데이터를 변경합니다.
      모듈은 다른 모듈을 로드할 수 있다는 것을 기억하세요.
      `overrideModule` 메소드를 사용하면 현재 사용하는 테스트 모듈은 물론 테스트 모듈이 로드하는 다른 모듈 설정도 변경할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overrideComponent</code>
    </td>

    <td>

      <!--
      Replace metadata for the given component class, which could be nested deeply
      within an inner module.
      -->
      컴포넌트 클래스에 설정된 메타데이터를 변경합니다.
      테스트 모듈이 로드하는 다른 모듈의 컴포넌트 메타데이터도 변경할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overrideDirective</code>
    </td>

    <td>

      <!--
      Replace metadata for the given directive class, which could be nested deeply
      within an inner module.
      -->
      디렉티브 클래스에 설정된 메타데이터를 변경합니다.
      테스트 모듈이 로드하는 다른 모듈의 디렉티브 메타데이터도 변경할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>overridePipe</code>
    </td>
    <td>

      <!--
      Replace metadata for the given pipe class, which could be nested deeply
      within an inner module.
      -->
      파이프 클래스에 설정된 메타데이터를 변경합니다.
      테스트 모듈이 로드하는 다른 모듈의 파이프 메타데이터도 변경할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      {@a testbed-get}
      <code>get</code>
    </td>

    <td>

      <!--
      Retrieve a service from the current `TestBed` injector.

      The `inject` function is often adequate for this purpose.
      But `inject` throws an error if it can't provide the service.

      What if the service is optional?

      The `TestBed.get()` method takes an optional second parameter,
      the object to return if Angular can't find the provider
      (`null` in this example):
      -->
      현재 사용하는 `TestBed` 인젝터를 사용해서 서비스를 참조합니다.

      이런 용도라면 `get` 대신 `inject` 함수를 사용해도 됩니다.
      하지만 프로바이더로 등록되지 않은 서비스는 `inject`로 참조할 때 에러가 발생합니다.

      만약 서비스가 옵션 항목이라면 어떻게 해야 할까요?

      `TestBed.get()` 메소드의 두번째 인자는 옵션항목인데, 이 옵션을 지정하면 Angular가 서비스 프로바이더를 찾을 수 없을 때 옵션으로 지정된 객체를 사용합니다(이 예제에서는 `null`을 대신 사용합니다):

      <code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="testbed-get-w-null" header="app/demo/demo.testbed.spec.ts" linenums="false"></code-example>

      <!--
      After calling `get`, the `TestBed` configuration is frozen for the duration of the current spec.
      -->
      `get`을 실행하고 나면 `TestBed` 환경 설정이 확정되기 때문에 해당 블럭에서 동작하는 테스트 스펙이 끝날 때까지 `TestBed` 설정을 변경할 수 없습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      {@a testbed-initTestEnvironment}
      <code>initTestEnvironment</code>
    </td>
    <td>

      <!--
      Initialize the testing environment for the entire test run.

      The testing shims (`karma-test-shim`, `browser-test-shim`) call it for you
      so there is rarely a reason for you to call it yourself.

      You may call this method _exactly once_. If you must change
      this default in the middle of your test run, call `resetTestEnvironment` first.

      Specify the Angular compiler factory, a `PlatformRef`, and a default Angular testing module.
      Alternatives for non-browser platforms are available in the general form
      `@angular/platform-<platform_name>/testing/<platform_name>`.
      -->
      모든 테스트 스펙에 적용되는 테스트 환경을 초기화합니다.

      이 메소드는 `karma-test-shim`과 `browser-test-shim`이 자동으로 실행하기 때문에 이 메소드를 직접 실행할 일은 별로 없습니다.

      하지만 이 메소드를 직접 실행해야 하는 경우가 _딱 하나_ 있습니다.
      테스트를 실행하는 도중에 테스트 환경 설정의 기본값을 바꾸게 되면 먼저 `resetTestEnvironment`를 실행해야 합니다.

      그리고 `PlatformRef`과 같은 Angular 컴파일러 팩토리나 기본 Angular 테스트 모듈을 지정합니다.
      브라우저를 사용하지 않는 플랫폼은 일반적으로 `@angular/platform-<platform_name>/testing/<platform_name>` 패키지로 제공됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>resetTestEnvironment</code>
    </td>
    <td>

      <!--
      Reset the initial test environment, including the default testing module.
      -->
      테스트 환경을 초기화합니다. 이 메소드를 실행하면 기본 테스트 모듈도 함께 초기화됩니다.

    </td>
  </tr>
</table>

<!--
A few of the `TestBed` instance methods are not covered by static `TestBed` _class_ methods.
These are rarely needed.
-->
`TestBed` _클래스_ 의 메소드 중에는 정적 메소드가 처리하지 않는 함수도 있습니다.
이 메소드들은 거의 사용하지 않습니다.

{@a component-fixture-api-summary}

<!--
#### The _ComponentFixture_
-->
#### _ComponentFixture_

<!--
The `TestBed.createComponent<T>`
creates an instance of the component `T`
and returns a strongly typed `ComponentFixture` for that component.

The `ComponentFixture` properties and methods provide access to the component,
its DOM representation, and aspects of its Angular environment.
-->
`TestBed.createComponent<T>`를 실행하면 컴포넌트 `T`의 인스턴스를 생성하며, 이렇게 생성된 인스턴스를 `ComponentFixture` 타입으로 반환합니다.

그러면 `ComponentFixture`의 프로퍼티와 메소드를 사용해서 컴포넌트에 직접 접근할 수 있으며, DOM에도 접근할 수 있고 이 컴포넌트가 사용하는 Angular 구성요소에도 접근할 수 있습니다.

{@a component-fixture-properties}

<!--
#### _ComponentFixture_ properties
-->
#### _ComponentFixture_ 의 프로퍼티

<!--
Here are the most important properties for testers, in order of likely utility.
-->
테스트 스펙을 작성하면서 가장 중요하고 자주 사용하는 프로퍼티에 대해 알아봅시다.

<table>
  <tr>
    <th>
      <!--
      Properties
      -->
      프로퍼티
    </th>
    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>componentInstance</code>
    </td>

    <td>

      <!--
      The instance of the component class created by `TestBed.createComponent`.
      -->
      `TestBed.createComponent`로 생성한 컴포넌트 클래스의 인스턴스가 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>debugElement</code>
    </td>

    <td>

      <!--
      The `DebugElement` associated with the root element of the component.

      The `debugElement` provides insight into the component and its DOM element during test and debugging.
      It's a critical property for testers. The most interesting members are covered [below](#debug-element-details).
      -->
      `DebugElement`는 컴포넌트의 루트 엘리먼트와 관련이 있습니다.

      `debugElement`는 테스트를 실행하거나 디버깅할 때 컴포넌트 내부를 직접 참조하거나 DOM 엘리먼트를 참조하는 용도로 사용할 수 있습니다.
      그리고 테스트 스펙을 작성할 때 가장 중요한 프로퍼티이기도 합니다.
      이 클래스의 멤버중 가장 흥미로운 멤버는 [아래](#debug-element-details)에서 자세하게 다룹니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>nativeElement</code>
    </td>

    <td>

      <!--
      The native DOM element at the root of the component.
      -->
      컴포넌트의 최상위 네이티브 DOM 엘리먼트가 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>changeDetectorRef</code>
    </td>

    <td>

      <!--
      The `ChangeDetectorRef` for the component.

      The `ChangeDetectorRef` is most valuable when testing a
      component that has the `ChangeDetectionStrategy.OnPush` method
      or the component's change detection is under your programmatic control.
      -->
      컴포넌트의 `ChangeDetectorRef`가 할당됩니다.

      `ChangeDetectorRef`는 컴포넌트를 테스트할 때 가장 중요한 클래스입니다.
      컴포넌트를 조작하고 나면 컴포넌트의 변화 감지 로직을 실행하기 위해 `ChangeDetectionStrategy.OnPush` 메소드나 컴포넌트 픽스쳐의 `detectChange` 메소드를 실행할 수 있습니다.

    </td>
  </tr>
</table>

{@a component-fixture-methods}

<!--
#### _ComponentFixture_ methods
-->
#### _ComponentFixture_ 의 메소드

<!--
The _fixture_ methods cause Angular to perform certain tasks on the component tree.
Call these method to trigger Angular behavior in response to simulated user action.

Here are the most useful methods for testers.
-->
_픽스쳐_ 가 제공하는 메소드는 모두 컴포넌트 트리에 어떤 작업을 하는 것들입니다.
이 메소드를 활용하면 사용자가 어떤 동작을 했을 때 반응하는 Angular 동작을 실행할 수 있습니다.

테스트 코드를 작성할 때 가장 많이 사용하는 메소드에 대해 알아봅시다.

<table>
  <tr>
    <th>
      <!--
      Methods
      -->
      메소드
    </th>
    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>detectChanges</code>
    </td>

    <td>

      <!--
      Trigger a change detection cycle for the component.

      Call it to initialize the component (it calls `ngOnInit`) and after your
      test code, change the component's data bound property values.
      Angular can't see that you've changed `personComponent.name` and won't update the `name`
      binding until you call `detectChanges`.

      Runs `checkNoChanges`afterwards to confirm that there are no circular updates unless
      called as `detectChanges(false)`;
      -->
      컴포넌트의 변화 감지 싸이클을 시작합니다.

      이 함수는 컴포넌트를 초기화하기 위해서(`ngOnInit`)나 컴포넌트 프로퍼티에 바인딩한 데이터를 변경한 후에 실행합니다.
      Angular는 이 함수가 실행되기 전까지는 `personComponent.name` 프로퍼티가 변경된 것을 알지 못하며, `name` 프로퍼티와 바인딩된 항목도 갱신하지 않습니다.

      그리고 이 메소드를 실행한 후에 `checksNoChanges`를 실행하면 이후에 `detectChanges(false)`를 실행하기 전까지 변화감지를 실행하지 않습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>autoDetectChanges</code>
    </td>

    <td>

      <!--
      Set this to `true` when you want the fixture to detect changes automatically.

      When autodetect is `true`, the test fixture calls `detectChanges` immediately
      after creating the component. Then it listens for pertinent zone events
      and calls `detectChanges` accordingly.
      When your test code modifies component property values directly,
      you probably still have to call `fixture.detectChanges` to trigger data binding updates.

      The default is `false`. Testers who prefer fine control over test behavior
      tend to keep it `false`.
      -->
      `true` 인자와 함께 이 메소드를 실행하면 픽스쳐가 변화감지 싸이클을 자동으로 실행하게 할 수 있습니다.

      `true` 인자로 실행하면 컴포넌트가 생성된 뒤에 테스트 픽스쳐가 `detectChanges`를 즉시 실행합니다.
      그리고 이벤트 존을 감지하면서 필요한 경우에 `detectChanges`를 자동으로 실행합니다.
      하지만 테스트 코드에서 컴포넌트 프로퍼티 값을 직접 변경했다면, 이 내용을 반영해서 데이터 바인딩을 갱신하기 위해 `fixture.detectChanges` 메소드를 직접 실행해야 합니다.

      이 메소드 인자의 기본값은 `false`입니다.
      테스트 코드의 동작을 모두 직접 조작하는 것을 선호한다면 `false` 상태로 두고 테스트 코드를 작성하는 것이 좋습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>checkNoChanges</code>
    </td>

    <td>

      <!--
      Do a change detection run to make sure there are no pending changes.
      Throws an exceptions if there are.
      -->
      반영되지 않은 변경사항이 없는지 검사합니다.
      아직 반영되지 않은 내용이 있다면 에러가 발생합니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>isStable</code>
    </td>

    <td>

      <!--
      If the fixture is currently _stable_, returns `true`.
      If there are async tasks that have not completed, returns `false`.
      -->
      픽스쳐의 현재 상태가 _stable_ 이면 `true`를 반환합니다.
      그리고 종료되지 않은 비동기 태스크가 남아있다면 `false`를 반환합니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>whenStable</code>
    </td>

    <td>

      <!--
      Returns a promise that resolves when the fixture is stable.

      To resume testing after completion of asynchronous activity or
      asynchronous change detection, hook that promise.
      See [above](#when-stable).
      -->
      픽스쳐가 stable 상태일 때 처리되는 Promise를 반환합니다.

      이 메소드는 비동기 작업을 처리한 후에 다른 테스트 코드를 실행해야 할 때 사용합니다.
      자세한 내용은 [위에서 설명한 내용](#when-stable)을 참고하세요.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>destroy</code>
    </td>

    <td>

      <!--
      Trigger component destruction.
      -->
      컴포넌트를 종료합니다.

    </td>
  </tr>
</table>

{@a debug-element-details}

#### _DebugElement_

<!--
The `DebugElement` provides crucial insights into the component's DOM representation.

From the test root component's `DebugElement` returned by `fixture.debugElement`,
you can walk (and query) the fixture's entire element and component subtrees.

Here are the most useful `DebugElement` members for testers, in approximate order of utility:
-->
`DebugElement`는 컴포넌트의 DOM과 관련된 내용을 표현합니다.

그리고 테스트하는 컴포넌트의 `fixture.debugElement`를 참조하면 해당 컴포넌트부터 컴포넌트 트리를 따라 존재하는 모든 컴포넌트를 참조할 수 있습니다.

`DebugElement`가 제공하는 멤버 중 테스트할 때 가장 자주 사용하는 멤버들에 대해 알아봅시다:

<table>
  <tr>
    <th>
      <!--
      Member
      -->
      멤버
    </th>
    <th>
      <!--
      Description
      -->
      설명
    </th>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>nativeElement</code>
    </td>

    <td>

      <!--
      The corresponding DOM element in the browser (null for WebWorkers).
      -->
      브라우저에 렌더링되는 DOM 엘리먼트가 할당됩니다. WebWorker를 사용하면 null이 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>query</code>
    </td>

    <td>

      <!--
      Calling `query(predicate: Predicate<DebugElement>)` returns the first `DebugElement`
      that matches the [predicate](#query-predicate) at any depth in the subtree.
      -->
      `query(predicate: Predicate<DebugElement>)`를 실행하면 전체 컴포넌트 트리 안에 있는 컴포넌트 중 [쿼리 조건(predicate)](#query-predicate)에 맞는 첫번째 `DebugElement`를 반환합니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>queryAll</code>
    </td>

    <td>

      <!--
      Calling `queryAll(predicate: Predicate<DebugElement>)` returns all `DebugElements`
      that matches the [predicate](#query-predicate) at any depth in subtree.
      -->
      `queryAll(predicate: Predicate<DebugElement>)`를 실행하면 전체 컴포넌트 트리 안에 있는 컴포넌트 중 [쿼리 조건(predicate)](#query-predicate)에 맞는 `DebugElement` 모두를 반환합니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>injector</code>
    </td>

    <td>

      <!--
      The host dependency injector.
      For example, the root element's component instance injector.
      -->
      호스트 의존성 주입기(injector)가 할당됩니다.
      그래서 이 멤버에 할당되는 객체는 최상위 엘리먼트로 존재하는 컴포넌트의 인젝터일 수도 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>componentInstance</code>
    </td>

    <td>

      <!--
      The element's own component instance, if it has one.
      -->
      엘리먼트에 연결된 컴포넌트가 존재하는 경우에 이 컴포넌트의 인스턴스가 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>context</code>
    </td>

    <td>

      <!--
      An object that provides parent context for this element.
      Often an ancestor component instance that governs this element.

      When an element is repeated within `*ngFor`, the context is an `NgForRow` whose `$implicit`
      property is the value of the row instance value.
      For example, the `hero` in `*ngFor="let hero of heroes"`.
      -->
      해당 엘리먼트에 적용되는 부모 컨텍스트가 할당됩니다.
      때로는 부모 컴포넌트 인스턴스가 자식 엘리먼트에 영향을 줄 수도 있습니다.

      예를 들어 엘리먼트가 `*ngFor`로 반복된다면 이 때 컨텍스트는 `NgForRow` 디렉티브가 제공하며, 이 컨텍스트 안에 있는 `$implicit`를 확인하면 각 루프마다 반복되는 정보를 확인할 수 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>children</code>
    </td>

    <td>

      <!--
      The immediate `DebugElement` children. Walk the tree by descending through `children`.

      <div class="alert is-helpful">

      `DebugElement` also has `childNodes`, a list of `DebugNode` objects.
      `DebugElement` derives from `DebugNode` objects and there are often
      more nodes than elements. Testers can usually ignore plain nodes.
      -->
      `DebugElement`의 바로 밑 자식 엘리먼트들이 할당됩니다.
      `children` 멤버를 활용하면 컴포넌트 트리를 따라 탐색을 계속할 수도 있습니다.

      </div>
    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>parent</code>
    </td>
    <td>

      <!--
      The `DebugElement` parent. Null if this is the root element.
      -->
      `DebugElement`의 부모 엘리먼트가 할당됩니다.
      해당 엘리먼트가 최상위 엘리먼트라면 null이 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>name</code>
    </td>

    <td>

      <!--
      The element tag name, if it is an element.
      -->
      엘리먼트의 태그 이름이 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>triggerEventHandler</code>
    </td>
    <td>

      <!--
      Triggers the event by its name if there is a corresponding listener
      in the element's `listeners` collection.
      The second parameter is the _event object_ expected by the handler.
      See [above](#trigger-event-handler).

      If the event lacks a listener or there's some other problem,
      consider calling `nativeElement.dispatchEvent(eventObject)`.
      -->
      엘리먼트의 `listeners` 콜렉션에 해당되는 이벤트 이름으로 등록된 이벤트 핸들러가 있으면, 이 이벤트 핸들러를 실행합니다.
      이 메소드의 두 번째 인자에는 핸들러가 처리해야 할 _이벤트 객체_ 를 전달합니다.
      자세한 내용은 [위에서 설명한 내용](#trigger-event-handler)을 참고하세요.

      이벤트 리스너에 이벤트 핸들러를 등록하지 않았거나 등록할 수 없는 상황이라면, 이 메소드 대신 `nativeElement.dispatchEvent(이벤트 객체)`를 사용할 수도 있습니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>listeners</code>
    </td>

    <td>

      <!--
      The callbacks attached to the component's `@Output` properties and/or the element's event properties.
      -->
      컴포넌트의 `@Output` 프로퍼티에 연결된 콜백 함수들과 엘리먼트에 연결된 이벤트 핸들러가 할당됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>providerTokens</code>
    </td>

    <td>

      <!--
      This component's injector lookup tokens.
      Includes the component itself plus the tokens that the component lists in its `providers` metadata.
      -->
      컴포넌트의 인젝터에 등록된 토큰들이 할당됩니다.
      이 프로퍼티에는 컴포넌트 자체를 가리키는 토큰과 이 컴포넌트의 `providers` 메타데이터에 등록된 토큰들이 모두 포함됩니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>source</code>
    </td>

    <td>

      <!--
      Where to find this element in the source component template.
      -->
      호스트 컴포넌트 템플릿에서 이 엘리먼트가 존재하는 위치가 어디인지 표시합니다.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>references</code>
    </td>

    <td>

      <!--
      Dictionary of objects associated with template local variables (e.g. `#foo`),
      keyed by the local variable name.
      -->
      템플릿 변수(ex. `#foo`)와 해당 템플릿 변수에 연결된 객체들이 존재하는 객체입니다.
      이 객체의 키는 템플릿 지역 변수의 이름이 그대로 사용됩니다.

    </td>
  </tr>
</table>

{@a query-predicate}

<!--
The `DebugElement.query(predicate)` and `DebugElement.queryAll(predicate)` methods take a
predicate that filters the source element's subtree for matching `DebugElement`.

The predicate is any method that takes a `DebugElement` and returns a _truthy_ value.
The following example finds all `DebugElements` with a reference to a template local variable named "content":
-->
`DebugElement.query(predicate)` 메소드와 `DebugElement.queryAll(predicate)` 메소드는 엘리먼트 트리에서 원하는 `DebugElement`를 찾기 위해 쿼리 조건(predicate)을 인자로 받습니다.

이 때 쿼리 조건은 함수 형태로 정의하며, 이 함수가 _true로 평가하는_ `DebugElement`가 메소드의 결과로 반환됩니다.
아래 예제는 템플릿 변수 이름이 "content"인 `DebugElement` 전체를 찾는 예제 코드입니다:

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="custom-predicate" header="app/demo/demo.testbed.spec.ts" linenums="false"></code-example>

<!--
The Angular `By` class has three static methods for common predicates:

- `By.all` - return all elements.
- `By.css(selector)` - return elements with matching CSS selectors.
- `By.directive(directive)` - return elements that Angular matched to an instance of the directive class.
-->
그리고 Angular `By` 클래스에 있는 정적 메소드 3개도 이 쿼리 조건을 사용합니다:

- `By.all` - 모든 엘리먼트를 반환합니다.
- `By.css(selector)` - 해당 CSS 셀렉터와 매칭되는 엘리먼트를 반환합니다.
- `By.directive(directive)` - 해당 디렉티브 클래스가 사용된 엘리먼트를 반환합니다.

<code-example path="testing/src/app/hero/hero-list.component.spec.ts" region="by" header="app/hero/hero-list.component.spec.ts" linenums="false"></code-example>

<hr>

{@a faq}

<!--
## Frequently Asked Questions
-->
## 자주 묻는 질문

{@a q-spec-file-location}

<!--
#### Why put spec file next to the file it tests?
-->
#### 스펙 파일은 왜 테스트하는 파일과 함께 둬야 하나요?

<!--
It's a good idea to put unit test spec files in the same folder
as the application source code files that they test:

- Such tests are easy to find.
- You see at a glance if a part of your application lacks tests.
- Nearby tests can reveal how a part works in context.
- When you move the source (inevitable), you remember to move the test.
- When you rename the source file (inevitable), you remember to rename the test file.
-->
유닛 테스트 파일은 테스트하려는 소스 코드 파일과 같은 폴더에 두는 것이 좋습니다.
이렇게 작성했을 때 장점은:

- 해당 파일을 테스트하는 파일을 찾기 쉽습니다.
- 애플리케이션 구성요소 중에서 어떤것을 테스트하지 않았는지 쉽게 파악할 수 있습니다.
- 같은 폴더에 있는 테스트가 전체 애플리케이션에서 어떤 역할을 하는지 파악할 수 있습니다.
- (불가피하게) 소스 파일의 위치를 옮겨야 한다면, 테스트 파일도 잊지 않고 함께 옮길 수 있습니다.
- (불가피하게) 소스 파일의 이름을 바꿔야 한다면, 테스트 파일의 이름도 잊지 않고 바꿀 수 있습니다.

<hr>

{@a q-specs-in-test-folder}

<!--
#### When would I put specs in a test folder?
-->
#### 테스트 파일을 한 폴더에 둬야 하는 경우는 어떤 경우인가요?

<!--
Application integration specs can test the interactions of multiple parts
spread across folders and modules.
They don't really belong to any part in particular, so they don't have a
natural home next to any one file.

It's often better to create an appropriate folder for them in the `tests` directory.

Of course specs that test the test helpers belong in the `test` folder,
next to their corresponding helper files.
-->
여러 폴더와 여러 모듈에 있는 구성요소가 잘 연동되는지 확인하는 애플리케이션 통합 테스트 스펙을 작성하는 경우에는 테스트하는 구성요소가 애플리케이션의 어느 부분인지 신경쓸 필요가 별로 없습니다.
그래서 이런 경우에는 특정 소스 파일과 같은 폴더에 둘 필요가 없습니다.

그보다는 `tests`라는 폴더를 만들고 이 폴더에 테스트 파일을 두는 것이 더 좋습니다.

그러면 자연스럽게 이 테스트 스펙이 사용하는 테스트 헬퍼도 `test` 폴더에 함께 두는 것이 좋습니다.

{@a q-e2e}

<!--
#### Why not rely on E2E tests of DOM integration?

#### 컴포넌트의 DOM을 테스트할 때 왜 E2E 테스트는 하지 않나요?

The component DOM tests described in this guide often require extensive setup and
advanced techniques whereas the [unit tests](#component-class-testing)
are comparatively simple.

#### Why not defer DOM integration tests to end-to-end (E2E) testing?
-->
#### 엔드-투-엔드(E2E) 테스트할 때 왜 DOM은 테스트하지 않나요?

<!--
E2E tests are great for high-level validation of the entire system.
But they can't give you the comprehensive test coverage that you'd expect from unit tests.

E2E tests are difficult to write and perform poorly compared to unit tests.
They break easily, often due to changes or misbehavior far removed from the site of breakage.

E2E tests can't easily reveal how your components behave when things go wrong,
such as missing or bad data, lost connectivity, and remote service failures.

E2E tests for apps that update a database,
send an invoice, or charge a credit card require special tricks and back-doors to prevent
accidental corruption of remote resources.
It can even be hard to navigate to the component you want to test.

Because of these many obstacles, you should test DOM interaction
with unit testing techniques as much as possible.
-->
컴포넌트 DOM을 E2E 테스트하는 것은 컴포넌트를 [유닛 테스트](#컴포넌트-클래스-테스트)하는 것보다 더 복잡한 환경설정이 필요하며, 테스트 코드를 작성할 때도 좀 더 복잡한 테크닉이 필요합니다.
컴포넌트는 유닛 테스트로 간단하게 테스트하는 것이 좋습니다.

E2E 테스트는 애플리케이션 계층의 동작을 검증하는 테스트입니다.
하지만 E2E 테스트 스펙을 작성할 때는 유닛 테스트에서 했던 것처럼 최대한 많은 내용을 테스트하지 않습니다.

E2E 테스트는 유닛 테스트에 비해 작성하기 어려우며, 실행할 때 성능도 유닛 테스트보다 약간 느립니다.
그리고 E2E 테스트에 연관된 Angular 구성요소가 변경되거나 오동작해서 E2E 테스트 자체가 실패할 가능성도 높습니다.

심지어 테스트가 실패했을 때 컴포넌트가 잘못된 데이터를 사용해서 실패했는지, 연결이 중간에 끊어졌는지, 리모트 서비스가 실패했는지 원인을 찾는 것도 쉽지 않습니다.

그리고 E2E 테스트 스펙 중 DB의 내용을 바꾸거나 영수증을 발행하는 동작, 신용카드에 요금을 청구하는 동작들은 실제로 요청이 발생하지 않도록 트릭을 사용하거나 백도어를 뚫어놔야 합니다.
어떤 경우에는 테스트하지 않는 다른 컴포넌트로 페이지를 전환할 수도 있습니다.

이렇듯 E2E 테스트에는 유닛 테스트에서 겪어보지 않았던 수많은 장애물이 존재할 수 있습니다.
그래서 DOM과 상호작용하는 로직을 검증하는 테스트 스펙은 유닛테스트에 작성하는 것이 좋습니다.
