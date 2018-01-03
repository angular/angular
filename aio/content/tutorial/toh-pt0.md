# 어플리케이션 쉘

## Angular CLI 설치

[Angular CLI](https://github.com/angular/angular-cli)를 설치하지 않았다면 먼저 설치하세요.

<code-example language="sh" class="code-shell">
  npm install -g @angular/cli
</code-example>  

## 새로운 어플리케이션 생성

아래의 CLI 명령어를 통하여 `angular-tour-of-heroes`의 이름을 가진 어플리케이션을 생성합니다.

<code-example language="sh" class="code-shell">
  ng new angular-tour-of-heroes
</code-example> 

Angular CLI가 기본 어플리케이션과 필요한 파일들을 포함한 새로운 프로젝트를 생성하였습니다. 

## 어플리케이션 실행

프로젝트 디렉토리로 들어가서 어플리케이션을 실행합니다.

<code-example language="sh" class="code-shell">
  cd angular-tour-of-heroes
  ng serve --open
</code-example>
 
<div class="l-sub-section">

`ng serve` 명령을 실행하면 개발서버가 시작되며, 이 서버는 변경된 파일의 내용을 자동으로 반영하는 워치 모드로 동작합니다.
`ng serve` 명령을 실행할 때 `--open` 옵션을 함께 사용하면 서버의 주소인 `http://localhost:4200/`를 기본 브라우저로 열 수 있습니다.

</div>

브라우저가 실행되면 앱이 실행되는 걸 확인할 수 있습니다.

## Angular 컴포넌트

처음 보이는 페이지는 _어플리케이션 쉘_입니다.
쉘은 `AppComponent`란 이름의 Angular **컴포넌트**에 의해 관리되는 쉘입니다.

_Components_는 Angular 어플리케이션의 기본 구성 요소입니다.
화면에 데이터를 표시하고, 유저의 입력을 대기하며, 유저의 입력에 따른 동작을 수행합니다.

## 어플리케이션 제목 바꾸기

여러분이 즐겨 사용하는 에디터나 IDE를 통해 프로젝트를 열어 `src/app` 폴더로 이동합니다.

3개의 파일에 `AppComponent` 쉘의 구현이 분산 되어 있는 것을 볼 수 있습니다 : 

1. `app.component.ts`&mdash; TypeScript로 작성된 컴포넌트 클래스 코드.
1. `app.component.html`&mdash; HTML로 작성된 컴포넌트 템플릿.
1. `app.component.css`&mdash; 컴포넌트만을 위한 CSS 스타일.
 

컴포넌트 클래스 파일(`app.component.ts`)을 열어 `title` 프로퍼티의 값을 'Tour of Heroes'로 바꿔봅시다.

<code-example path="toh-pt0/src/app/app.component.ts" region="set-title" title="app.component.ts (class title property)" linenums="false">
</code-example>

이제 컴포넌트 파일(`app.component.html`)를 열어 Angular CLI에 의해 자동생성된 디폴트 템플릿을 삭제하고 아래의 HTML코드로 교체해 봅니다.

<code-example path="toh-pt0/src/app/app.component.html" 
  title="app.component.html (template)" linenums="false">
</code-example>

중첩 중괄호는 Angular에서 *인터폴레이션 바인딩*을 위한 구문입니다.
이 인터폴레이션 바인딩은 컴포넌트의 `title` 프로퍼티의 값을 HTML 헤더 태그 내에 표시합니다.

변경된 내용을 저장하면 브라우저는 리프레쉬되며 새로운 어플리케이션 타이틀이 표시됩니다.

{@a app-wide-styles}

## 어플리케이션 스타일 추가

대부분의 앱은 애플리케이션 전체에서 일관성 있는 모습을 추구합니다.
CLI는 이를 위하여 내용이 비어있는 `styles.css` 파일을 생성합니다.
이 파일에 스타일을 작성하면 어플리케이션 전반에서 적용됩니다.

아래는 _Tour of Heroes_이라는 예제앱의 `styles.css`에서 발췌한 부분입니다.
<code-example path="toh-pt0/src/styles.1.css" title="src/styles.css (excerpt)">
</code-example>

## 마지막 코드 리뷰

이 튜토리얼과 _Tour of Heroes_앱의 전역 스타일의 소스코드는 <live-example></live-example>에서 확인 가능합니다.

아래는 이 튜토리얼에서 언급된 소스코드 파일들입니다. 

<code-tabs>

  <code-pane title="src/app/app.component.ts" path="toh-pt0/src/app/app.component.ts">
  </code-pane>

  <code-pane title="src/app/app.component.html" path="toh-pt0/src/app/app.component.html">
  </code-pane>

  <code-pane 
    title="src/styles.css (excerpt)" 
    path="toh-pt0/src/styles.1.css">
  </code-pane>
</code-tabs>

## 요약

* Angular CLI를 이용하여 초기 어플리케이션 구조를 생성하였습니다.
* 데이터를 표현하는 Angular 컴포넌트를 배웠습니다.
* 인터폴레이션 바인딩을 통해 앱 제목을 보여주기 위해 중첩 중괄호를 사용하였습니다.