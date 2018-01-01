# QuickStart

개발 생산성을 높이고 유지 보수에 대한 부담을 줄이려면 좋은 도구를 사용하는 것이 아주 중요합니다.

[**Angular CLI**](https://cli.angular.io/) 는 **_커맨드 라인에서 사용하는 툴_** 입니다. 이 툴을 사용하면 간단하게 프로젝트를 생성하거나 구성요소를 추가할 수 있고, 개발단계에 수행해야 하는 테스트나 번들링, 배포도 쉽게 처리할 수도 있습니다.

이 가이드 문서의 목적은 Angular CLI와 TypeScript를 사용해서 간단한 Angular 애플리케이션을 만들고 실행해 보는 것입니다. 이 때 [스타일 가이드](guide/styleguide)를 확인하는 것도 좋은 방법이며, 스타일 가이드는 Angular로 만드는 _어떠한_ 프로젝트에도 적용할 수 있습니다.

이 가이드를 끝까지 다 보고 나면, Angular CLI를 프로젝트에 어떻게 적용해야 하는지 알게 될 것이며, 실제 프로젝트에도 적용할 수 있는 요령이 생길 것입니다.

이 가이드에서 다루는 예제는 <a href="generated/zips/cli-quickstart/cli-quickstart.zip" target="_blank">다운</a>받아 사용할 수도 있습니다.

<h2 id='devenv'>
  1단계. 개발 환경 설정하기
</h2>



개발을 시작하려면 먼저 개발 환경 설정을 해야 합니다.

**[Node.js® 와 npm](https://nodejs.org/en/download/)**
이 아직 설치되어 있지 않다면 이 프로그램을 설치합니다.

<div class="l-sub-section">

** node.js 버전은 `6.9.x` 이상, npm 버전은 `3.x.x` 이상이어야 합니다. 콘솔 창에서 `node -v`, `npm -v` 명령을 실행하면 버전을 확인할 수 있으며, 최신 버전에서는 잘 동작하는 코드도 이전 버전에서는 에러가 발생할 수 있습니다. **

</div>

이제 npm 전역에 [Angular CLI](https://github.com/angular/angular-cli)를 설치합니다.


<code-example language="sh" class="code-shell">
  npm install -g @angular/cli

</code-example>




<h2 id='create-proj'>
  2단계. 프로젝트 생성하기
</h2>

콘솔 창을 엽니다. 그리고 다음 명령을 실행하면 프로젝트의 기본 틀을 구성할 수 있습니다.

<code-example language="sh" class="code-shell">
  ng new my-app

</code-example>



<div class="l-sub-section">

프로젝트를 구성하는 동안 잠시만 기다려 주세요.
새 프로젝트를 구성할 때 npm 패키지도 함께 설치하기 때문에 시간이 좀 걸릴 수 있습니다.

</div>

<h2 id='serve'>
  3단계. 애플리케이션 시작하기
</h2>

프로젝트가 생성되면 프로젝트 루트 폴더로 이동해서 서버를 시작합니다.

<code-example language="sh" class="code-shell">
  cd my-app
  ng serve --open
</code-example>

`ng serve` 명령을 실행하면 서버를 시작하며, 이 서버는 변경된 파일의 내용을 자동으로 반영하는 워치 모드로 동작합니다.
`ng serve` 명령을 실행할 때 `--open` (축약형 : `-o`) 옵션을 함께 사용하면 서버의 주소인 `http://localhost:4200/`를 기본 브라우저로 열 수 있으며,
브라우저가 실행되면 다음과 같은 화면을 확인할 수 있습니다.

<figure>
  <img src='generated/images/guide/cli-quickstart/app-works.png' alt="The app works!">
</figure>


<h2 id='first-component'>
  4단계: Angular 컴포넌트 수정해보기
</h2>

CLI로 프로젝트를 생성하면 `app-root`라는 태그 이름으로 _최상위 컴포넌트_ 를 생성합니다.
이 컴포넌트는 `./src/app/app.component.ts` 파일에서 확인할 수 있습니다.

이 파일을 열고 `title` 프로퍼티의 값을 _Welcome to app!!_ 에서 _Welcome to My First Angular App!!_ 로 바꿔봅시다.

<code-example path="cli-quickstart/src/app/app.component.ts" region="title" title="src/app/app.component.ts" linenums="false"></code-example>

이 파일을 저장하면 브라우저가 자동으로 페이지를 갱신하며, 변경된 문구를 확인할 수 있습니다.
수정 자체는 간단하지만 스타일이 약간 아쉽네요.

`src/app/app.component.css` 파일을 열고 다음과 같이 컴포넌트 스타일을 지정합니다.


<code-example path="cli-quickstart/src/app/app.component.css" title="src/app/app.component.css" linenums="false"></code-example>



<figure>
  <img src='generated/images/guide/cli-quickstart/my-first-app.png' alt="Output of QuickStart app">
</figure>


좀 더 보기 좋네요!


## 다음으로 해 볼 것은?

"Hello, World" 수준의 앱을 만드는 것은 이렇게나 간단합니다.

이제 좀 더 복잡한 [Tour of Heroes Tutorial](tutorial) 에 도전해 보는 것도 좋습니다.

이 문서에서는 기본 프로젝트가 어떤 구조와 파일로 구성되는지 자세하게 살펴봅시다.


## 프로젝트 파일 구성

Angular CLI로 만든 프로젝트는 간단한 프로토 타입에 사용할 수 있는 것은 물론이고, 실제 솔루션에도 사용할 수 있습니다.

`README.md` 파일을 먼저 보도록 합시다.
이 파일에는 CLI 명령어를 활용하는 방법에 대한 설명이 적혀 있습니다.
그리고 좀 더 자세한 내용을 확인하고 싶다면 [Angular CLI 저장소](https://github.com/angular/angular-cli) 를 확인하거나
[Wiki](https://github.com/angular/angular-cli/wiki) 를 확인하는 것도 좋습니다.

이제 다른 파일들을 살펴봅시다.

### `src` 폴더
애플리케이션 코드는 `src` 폴더 밑에 만들어집니다.
컴포넌트, 템플릿, 스타일, 이미지 파일, 앱에 필요한 어떠한 파일들도 이 폴더에 위치하며,
`src` 폴더 밖에 있는 파일은 애플리케이션을 빌드할 때 사용하는 파일이라고 생각하면 됩니다.

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
      파일
    </th>
    <th>
      용도
    </th>
  </tr>
  <tr>
    <td>

      `app/app.component.{ts,html,css,spec.ts}`

    </td>
    <td>

      `AppComponent` 를 정의하는 HTML 템플릿, CSS 스타일시트, 유닛 테스트 파일입니다.
      `AppComponent` 는 Angular 애플리케이션의 **최상위** 컴포넌트이며, 애플리케이션을 만들어 가면서 이 컴포넌트 아래로 컴포넌트 트리를 확장합니다.

    </td>
  </tr>
  <tr>
    <td>

      `app/app.module.ts`

    </td>
    <td>

      Angular 애플리케이션의 [최상위 모듈](guide/bootstrapping "AppModule: 최상위 모듈")인 `AppModule` 을 정의합니다.
	  이 모듈은 Angular 프레임워크가 애플리케이션을 어떻게 구성해야 하는지 정의하며,
      아직은 `AppComponent`밖에 없지만, 컴포넌트가 계속 추가되면서 이 모듈은 점점 복잡해질 것입니다.

    </td>
  </tr>
  <tr>
    <td>

      `assets/*`

    </td>
    <td>

      이미지 파일과 같이 빌드 과정 없이 바로 애플리케이션에 추가되는 파일들을 모아두는 폴더입니다.

    </td>
  </tr>
  <tr>
    <td>

      `environments/*`

    </td>
    <td>

      Angular 애플리케이션이 동작하는 환경에 대한 설정이 필요하다면, 이 폴더에 환경 설정 파일을 생성할 수 있으며,
	  각각의 파일은 해당 환경으로 빌드할 때 사용됩니다.
	  이 방식을 사용하면 개발 환경과 운영 환경에 따라 다른 서버 주소를 사용할 수도 있고, 필요한 경우 더미 서비스를 사용할 수도 있습니다.

    </td>
  </tr>
  <tr>
    <td>

      `favicon.ico`

    </td>
    <td>

      즐겨찾기에 표시되는 아이콘이며, CLI로 프로젝트를 생성하면 Angular 아이콘이 기본으로 지정됩니다.

    </td>
  </tr>
  <tr>
    <td>

      `index.html`

    </td>
    <td>

      사용자가 사이트에 접속하면 실행되는 HTML 페이지입니다.
      하지만 애플리케이션을 개발하면서 만드는 `js` 파일과 `css` 파일은 CLI가 자동으로 인식해서 `<script>` 태그와 `<link>` 태그로 만들어 주기 때문에,
      Angular 애플리케이션을 개발하는 동안 이 파일을 수정할 일은 거의 없습니다.

    </td>
  </tr>
  <tr>
    <td>

      `main.ts`

    </td>
    <td>

      애플리케이션이 시작될 때 진입점으로 사용하는 파일입니다.
      [JIT 컴파일러](guide/glossary#jit) 를 사용해서 애플리케이션을 컴파일하면 이 파일에 정의된 최상위 모듈 (`AppModule`) 을 빌드합니다.
      그리고 `ng build` 명령이나 `ng serve` 명령에 `--aot` 옵션을 사용해서 [AOT 컴파일러](guide/aot-compiler) 로 빌드할 때도
      이 파일을 시작점으로 사용합니다.

    </td>
  </tr>
  <tr>
    <td>

      `polyfills.ts`

    </td>
    <td>

      브라우저들이 웹 표준을 모두 지원하는 것은 아닙니다.
      이 때 폴리필을 사용합니다. Angular는 `core-js`와 `zone.js`를 사용해서 기본적인 브라우저 호환성을 지원하고 있지만
      [브라우저 지원 가이드](guide/browser-support)를 확인해 보는 것도 좋습니다.

    </td>
  </tr>
  <tr>
    <td>

      `styles.css`

    </td>
    <td>

      모든 컴포넌트에 공통으로 적용되는 스타일을 설정하는 파일입니다.
      컴포넌트를 심플하게 유지하기 위해 해당 컴포넌트에만 스타일을 적용하는 것이 좋지만,
      모든 컴포넌트에 적용되는 스타일이라면 이 파일을 사용하는 것이 좋습니다.

    </td>
  </tr>
  <tr>
    <td>

      `test.ts`

    </td>
    <td>

      유닛 테스트를 시작할 때 진입점으로 사용하는 파일입니다.
      유닛 테스트를 설정하는 내용이기 때문에 익숙하지 않은 코드들이 많을 수 있지만, 이 파일을 직접 수정할 일은 없을 것입니다.
    </td>
  </tr>
  <tr>
    <td>

      `tsconfig.{app|spec}.json`
    </td>
    <td>

      Angular 애플리케이션을 빌드하거나(`tsconfig.app.json`) 유닛 테스트용으로 빌드할 때(`tsconfig.spec.json`) 사용하는 파일입니다.

    </td>
  </tr>
</table>

### 루트 폴더

프로젝트 최상위 폴더를 보면 `src` 폴더 이외에도 다른 폴더와 파일들이 있으며,
이 파일들은 빌드나 테스트, 배포에 사용되기도 합니다.
`src/` 밖에는 다음과 같은 파일들이 있습니다.


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
      파일
    </th>
    <th>
      용도
    </th>
  </tr>
  <tr>
    <td>

      `e2e/`

    </td>
    <td>

      `e2e/` 폴더에는 엔드-투-엔드(end-to-end, e2e) 테스트에 필요한 파일이 있습니다.
      e2e 테스트는 Angular 애플리케이션이 동작하는 범위를 넘어서기 때문에 `src/` 폴더 안에 포함되면 안됩니다.
      That's also why they have their own `tsconfig.e2e.json`.

    </td>
  </tr>
  <tr>
    <td>

      `node_modules/`

    </td>
    <td>

      `package.json` 파일에 정의된 서드 파티 모듈를 설치하는 `Node.js` 용 폴더입니다.
    </td>
  </tr>
  <tr>
    <td>

      `.angular-cli.json`

    </td>
    <td>

      Angular CLI를 설정하는 파일입니다.
      이 파일을 사용하면 프로젝트에 사용하는 기본값을 설정하거나, 어떤 파일을 빌드할지 지정할 수 있습니다.

    </td>
  </tr>
  <tr>
    <td>

      `.editorconfig`

    </td>
    <td>

      팀 단위로 프로젝트를 개발할 때 적용할 에디터 설정을 정의합니다.
      요즘에는 많은 에디터들이 `.editconfig` 파일을 지원하며, 자세한 내용은 http://editorconfig.org 에서 확인할 수 있습니다.

    </td>
  </tr>
  <tr>
    <td>

      `.gitignore`

    </td>
    <td>

      Git 저장소에 커밋하지 않을 파일이나 폴더를 설정하는 파일입니다.

    </td>
  </tr>
  <tr>
    <td>

      `karma.conf.js`

    </td>
    <td>

      [Karma 테스터](https://karma-runner.github.io) 환경을 설정하는 파일입니다.
      이 파일은 `ng test` 명령을 실행할 때 사용됩니다.

    </td>
  </tr>
  <tr>
    <td>

      `package.json`

    </td>
    <td>

      프로젝트에 사용하는 서드 파티 패키지를 기술하는 `npm` 용 파일입니다.
      이 파일에는 [사용자 스크립트](https://docs.npmjs.com/misc/scripts) 도 추가할 수 있습니다.

    </td>
  </tr>
  <tr>
    <td>

      `protractor.conf.js`

    </td>
    <td>

      [Protractor](http://www.protractortest.org/) 로 엔드-투-엔드 테스트를 수행할 때 사용하는 파일입니다.
      이 파일은 `ng e2e` 명령을 실행할 때 사용됩니다.

    </td>
  </tr>
  <tr>
    <td>

      `README.md`

    </td>
    <td>

      프로젝트를 설명하는 문서 파일입니다. CLI로 프로젝트를 생성하면 CLI 사용법에 대한 설명이 기본으로 생성됩니다.
      애플리케이션을 빌드하는 방법이 달라진다면 이 내용을 꼭 수정하세요!

    </td>
  </tr>
  <tr>
    <td>

      `tsconfig.json`

    </td>
    <td>

      TypeScript 컴파일러 설정 파일입니다. IDE에서 TypeScript 개발 기능을 지원하면, 이 파일에 있는 설정을 참고할 수 있습니다.

    </td>
  </tr>
  <tr>
    <td>

      `tslint.json`

    </td>
    <td>

      [TSLint](https://palantir.github.io/tslint/) 와 [Codelyzer](http://codelyzer.com/) 에서 사용하는 코딩 스타일 설정 파일입니다.
      이 파일은 `ng lint` 명령을 실행할 때 사용되며, Lint 기능을 사용하면 코딩 스타일을 일관되게 유지할 수 있습니다.

    </td>
  </tr>
</table>

<div class="l-sub-section">

### 다음 단계

Angular 를 처음 접하는 개발자라면 [튜토리얼](tutorial "Tour of Heroes tutorial")을 진행해보는 것이 좋습니다.

</div>
