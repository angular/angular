<!--
# Anatomy of the Setup Project
-->
# 프로젝트 설정 파일 분석하기

<!--
The documentation [setup](guide/setup) procedures install a _lot_ of files.
Most of them can be safely ignored.
-->
[로컬 개발환경 설정하기](guide/setup) 문서의 내용을 따라하다보면 _수많은_ 파일이 설치되는데, 다행히 이 내용 모두를 알 필요는 없습니다.

<!--
Application files _inside the_ **`src/`** and **`e2e/`** folders matter most to developers.
-->
개발자가 주로 신경써야 하는 것은 애플리케이션을 구성하는 파일이 모여있는 **`src/`** 폴더와 e2e 테스트 스펙을 정의해둔 **`e2e/`** 폴더입니다.

<!--
Files _outside_ those folders condition the development environment.
They rarely change and you may never view or modify them.
If you do, this page can help you understand their purpose.
-->
두 폴더 _밖에_ 있는 파일들은 개발 환경을 구성하기 위한 것입니다.
개발 환경을 설정하는 파일들을 수정할 일은 별로 없으며, 아예 볼 일이 없는 파일들도 많습니다.
이 문서에서는 Angular 프로젝트에 존재하는 파일들이 어떤 용도로 사용되는지 알아봅시다.

<style>
  td, th {vertical-align: top}
</style>



<table width="100%">

  <col width="10%">

  </col>

  <col width="90%">

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
      <code>src/app/</code>
    </td>

    <td>

      <!--
      Angular application files go here.

      Ships with the "Hello Angular" sample's
      `AppComponent`, `AppModule`, a component unit test (`app.component.spec.ts`), and
      the bootstrap file, `main.ts`.

      Try the <live-example name="setup">sample application</live-example>
      and the <live-example name="setup" stackblitz="quickstart-specs">unit test</live-example>
      as _live examples_.
      -->
      Angular 애플리케이션을 구성하는 파일이 위치하는 폴더입니다.

      Angular CLI로 프로젝트를 생성하면 `AppComponent`, `AppModule`, 컴포넌트 유닛 테스트 파일(`app.component.spec.ts`), 애플리케이션을 부트스트랩하는 `main.ts` 파일이 기본으로 만들어집니다.

      _라이브 환경_ 에서 <live-example name="setup">예제 애플리케이션</live-example>을 확인해보고 <live-example name="setup" stackblitz="quickstart-specs">유닛 테스트</live-example>도 실행해 보세요.

    </td>

  </tr>

  <tr>

    <td>
      <code>e2e/</code>
    </td>

    <td>

      <!--
      _End-to-end_ (e2e) tests of the application,
      written in Jasmine and run by the
      <a href="http://www.protractortest.org/" title="Protractor: end-to-end testing for Angular">protractor</a>
      e2e test runner.

      Initialized with an e2e test for the "Hello Angular" sample.
      -->
      Jasmine으로 작성하고 <a href="http://www.protractortest.org/" title="Protractor: end-to-end testing for Angular">protractor</a>로 실행하는 _엔드-투-엔드_ (e2e) 테스트 파일이 위치하는 폴더입니다.

      Angular CLI로 프로젝트를 생성하면 자동으로 만들어 집니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>node_modules/</code>
    </td>

    <td>

      <!--
      The _npm_ packages installed with the `npm install` command.
      -->
      `npm install` 명령을 실행했을 때 _npm_ 패키지들이 설치되는 폴더입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>.editorconfig<br>
.git/<br>
.gitignore<br>
.travis.yml</code>
    </td>

    <td>

      <!--
      Tooling configuration files and folders.
      Ignore them until you have a compelling reason to do otherwise.
      -->
      툴 설정을 위한 파일과 폴더입니다.
      관련된 내용을 수정할 일이 없다면 무시해도 됩니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>CHANGELOG.md</code>
    </td>

    <td>

      <!--
      The history of changes to the _QuickStart_ repository.
      Delete or ignore.
      -->
      _QuickStart_ 저장소에 대한 변경 이력을 기록하는 파일입니다.
      무시해도 되고 필요없다면 삭제해도 됩니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>favicon.ico</code>
    </td>

    <td>

      <!--
      The application icon that appears in the browser tab.
      -->
      브라우저 탭에 표시되는 애플리케이션 아이콘입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>index.html</code>
    </td>

    <td>

      <!--
      The application host page.
      It loads a few essential scripts in a prescribed order.
      Then it boots the application, placing the root `AppComponent`
      in the custom `<my-app>` body tag.

      The same `index.html` satisfies all documentation application samples.
      -->
      애플리케이션이 위치할 페이지를 정의하는 파일입니다.
      이 파일은 Angular 애플리케이션 실행에 꼭 필요한 스크립트 파일만 로드합니다.
      그리고 애플리케이션이 부트스트랩되면 `<my-app>` 태그가 위치한 곳에 최상위 컴포넌트 `AppComponent`가 들어가게 됩니다.

      이 웹사이트에서 다루는 모든 예제의 `index.html` 파일 내용은 같습니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>karma.conf.js</code>
    </td>

    <td>

      <!--
      Configuration for the <a href="https://karma-runner.github.io/1.0/index.html" title="Karma unit test runner">karma</a>
      test runner described in the [Testing](guide/testing) guide.
      -->
      [테스트](guide/testing) 문서에서 소개하는 테스트 러너인 <a href="https://karma-runner.github.io/1.0/index.html" title="Karma unit test runner">karma</a> 동작 환경을 설정하는 파일입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>karma-test-shim.js</code>
    </td>

    <td>

      <!--
      Script to run <a href="https://karma-runner.github.io/1.0/index.html" title="Karma unit test runner">karma</a>
      with SystemJS as described in the [Testing](guide/testing) guide.
      -->
      [테스트](guide/testing) 문서에서 소개하는 <a href="https://karma-runner.github.io/1.0/index.html" title="Karma unit test runner">karma</a>를 SystemJS와 함께 사용할 때 필요한 파일입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>non-essential-files.txt</code>
    </td>

    <td>

      <!--
      A list of files that you can delete if you want to purge your setup of the
      original QuickStart Seed testing and git maintenance artifacts.
      See instructions in the optional
      [_Deleting non-essential files_](guide/setup#non-essential "Setup: Deleting non-essential files") section.
      *Do this only in the beginning to avoid accidentally deleting your own tests and git setup!*
      -->
      QuickStart Seed 프로젝트로 애플리케이션 개발을 시작할 때 지워도 되는 파일의 목록을 나열한 파일입니다.
      [_불필요한 파일 삭제하기_](guide/setup#non-essential "Setup: Deleting non-essential files") 섹션에서 설명한 것처럼, 테스트와 git 저장소에 관련된 파일은 지워도 상관없습니다.
      *이후에 추가하는 테스트나 git 설정과 섞이는 것을 방지하기 위해, 이 작업은 프로젝트 설정 초기에만 하세요!*

    </td>

  </tr>

  <tr>

    <td>
      <code>LICENSE</code>
    </td>

    <td>

      <!--
      The open source MIT license to use this setup code in your application.
      -->
      기본 프로젝트는 MIT 라이센스로 지정됩니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>package.json</code>
    </td>

    <td>

      <!--
      Identifies `npm `package dependencies for the project.

      Contains command scripts for running the application,
      running tests, and more. Enter `npm run` for a listing.
      <a href="https://github.com/angular/quickstart/blob/master/README.md#npm-scripts"
         title="npm scripts for Angular documentation samples">Read more</a> about them.
      -->
      프로젝트에 필요한 `npm` 패키지를 정의하는 파일입니다.

      애플리케이션을 실행하거나 테스트를 실행할 때 사용하는 실행 스크립트도 이 파일에 정의하며, `npm run` 명령을 실행하면 어떤 스크립트가 정의되어 있는지 확인할 수 있습니다.
      실행 스크립트에 대해서는 <a href="https://github.com/angular/quickstart/blob/master/README.md#npm-scripts"
         title="npm scripts for Angular documentation samples">이 문서</a>를 참고하세요.

    </td>

  </tr>

  <tr>

    <td>
      <code>protractor.config.js</code>
    </td>

    <td>

      <!--
      Configuration for the
      <a href="http://www.protractortest.org/" title="Protractor: end-to-end testing for Angular">protractor</a>
      _end-to-end_ (e2e) test runner.
      -->
      _엔드-투-엔드_ (e2e) 테스트 러너인 <a href="http://www.protractortest.org/" title="Protractor: end-to-end testing for Angular">protractor</a>의 동작 환경을 설정하는 파일입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>README.md</code>
    </td>

    <td>

      <!--
      Instruction for using this git repository in your project.
      Worth reading before deleting.
      -->
      이 프로젝트를 어떻게 활용하면 좋은지 설명하는 파일입니다.
      지우기 전에 한 번 읽어보는 것도 좋습니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>styles.css</code>
    </td>

    <td>

      <!--
      Global styles for the application. Initialized with an `<h1>` style for the QuickStart demo.
      -->
      애플리케이션 전역에 적용되는 스타일을 정의하는 파일입니다. QuickStart 예제 프로젝트에는 `<h1>`에 대한 스타일만 정의되어 있습니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>systemjs<br>.config.js</code>
    </td>

    <td>

      <!--
      Tells the **SystemJS** module loader where to find modules
      referenced in JavaScript `import` statements. For example:
      <code-example language="ts">
        import { Component } from '@angular/core;
      </code-example>


      Don't touch this file unless you are fully versed in SystemJS configuration.
      -->
      **SystemJS** 모듈 로더가 참조해야 하는 모듈이 어디에 있는지 설정하는 파일이며, 다음과 같은 내용이 정의되어 있습니다.
      <code-example language="ts">
        import { Component } from '@angular/core;
      </code-example>

      SystemJS 설정에 충분히 익숙하지 않다면 수정하지 않는 것이 좋습니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>systemjs<br>.config.extras.js</code>
    </td>

    <td>

      <!--
      Optional extra SystemJS configuration.
      A way to add SystemJS mappings, such as for application _barrels_,
      without changing the original `system.config.js`.
      -->
      SystemJS 설정에 더 필요한 내용이 있을 때 사용하는 파일입니다.
      이 파일은 `system.config.js`를 수정할 정도로 중요하지 않은 내용을 반영하는 용도로 사용합니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>tsconfig.json</code>
    </td>

    <td>

      <!--
      Tells the TypeScript compiler how to transpile TypeScript source files
      into JavaScript files that run in all modern browsers.
      -->
      TypeScript 컴파일러가 TypeScript 소스 파일을 JavaScript로 변환할 때 적용할 설정을 지정하는 파일입니다.

    </td>

  </tr>

  <tr>

    <td>
      <code>tslint.json</code>
    </td>

    <td>

      <!--
      The `npm` installed TypeScript linter inspects your TypeScript code
      and complains when you violate one of its rules.

      This file defines linting rules favored by the
      [Angular style guide](guide/styleguide) and by the authors of the documentation.
      -->
      TypeScript 코딩 스타일을 일관되게 유지할 때 사용하는 TSLint 규칙 설정 파일입니다.

      [Angular 스타일 가이드](guide/styleguide)에 있는 규칙을 바탕으로 작성되었습니다.

    </td>

  </tr>

</table>

