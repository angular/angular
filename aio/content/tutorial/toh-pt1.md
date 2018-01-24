# 히어로 편집기

이전 튜토리얼에서는 애플리케이션의 제목을 수정해봤습니다.
이번 튜토리얼에서는 히어로의 정보를 표시하는 컴포넌트를 생성하고 이를 애플리케이션 쉘에 추가해보겠습니다.

## 히어로 컴포넌트 생성하기

아래의 명령어를 Angular CLI에서 실행해서 `heroes` 컴포넌트를 생성합니다.

<code-example language="sh" class="code-shell">
  ng generate component heroes
</code-example>

CLI는 `src/app/heroes/`폴더를 생성하고 `HeroesComponent`를 위한 3개의 파일을 생성합니다.

`HeroesComponent` 클래스 파일은 아래와 같습니다.

<code-example 
  path="toh-pt1/src/app/heroes/heroes.component.ts" region="v1" 
  title="app/heroes/heroes.component.ts (initial version)" linenums="false">
</code-example>

Angular core 라이브러리에서 `Component`를 가져와 `@Component` 어노테이션 붙여 컴포넌트 클래스를 선언합니다.
`@Component`는 컴포넌트를 위해 Angular 메타데이터를 명시하는 데코레이터 함수입니다.

CLI는 아래 3가지 메타데이터 프로퍼티를 생성합니다.

1. `selector`&mdash; 컴포넌트의 CSS 엘리먼트 셀럭터
1. `templateUrl`&mdash; 컴포넌트의 템플릿 파일의 위치
1. `styleUrls`&mdash; 컴포넌트를 위한 CSS 스타일 파일의 위치
{@a selector}

[CSS element selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Type_selectors)인 
`'app-heroes'`는 부모 컴포넌트 템플릿 내에 해당 컴포넌트를 대표하는 HTML element 이름입니다. 

`ngOnInit`는 [lifecycle hook](guide/lifecycle-hooks#oninit) 입니다.
Angular는 컴포넌트를 생성하자마자 `ngOnInit`를 호출합니다.
이 함수는 초기화 로직이 들어가기에 적당한 위치입니다.

항상 컴포넌트를 `export` 해야 `AppModule`와 같은 다른 컴포넌트에서 `import`를 할 수 있습니다.

### _hero_ 프로퍼티 추가하기

`HeroesComponent`에 `hero` 프로퍼티를 추가해서 히어로의 이름을 "Windstorm"으로 설정하세요.

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" region="add-hero" title="heroes.component.ts (hero property)" linenums="false">
</code-example>

### 히어로 보여주기

`heroes.component.html` 템플릿 파일을 엽니다.
Angular CLI가 만든 코드를 삭제하고 새로운 `hero` 프로퍼티를 데이터 바인딩하는 코드로 바꿉니다.

<code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" title="heroes.component.html" region="show-hero-1" linenums="false">
</code-example>

## _HeroesComponent_ 뷰 보여주기

`HeroesComponent`를 표시하기 위해서는, 해당 컴포넌트를 `AppComponent` 쉘의 템플릿에 추가해야 합니다.

`app-heroes`는 `HeroesComponent`의 [element selector](#selector) 입니다.
`<app-heroes>` 엘리먼트를 `AppComponent` 템플릿 파일에서 타이틀 바로 밑에 추가하세요.

<code-example path="toh-pt1/src/app/app.component.html" title="src/app/app.component.html" linenums="false">
</code-example>

CLI 명렁어인 `ㅜng serve`가 실행되고 있다면 브라우저는 화면을 갱신하여 변경된 애플리케이션 타이틀과 히어로 이름을 표시합니다.

## 히어로 클래스 생성하기

진짜 히어로는 이름만 가지고 있는 것은 아닙니다.

`src/app`폴더에 `Hero` 클래스 파일을 생성하여 `id`와 `name` 프로퍼티를 추가합니다.

<code-example path="toh-pt1/src/app/hero.ts"  title="src/app/hero.ts" linenums="false">
</code-example>

`HeroesComponent` 클래스로 돌아가서 `Hero`를 가져옵니다.

컴포넌트의 `hero`프로퍼티를 `Hero` 타입으로 리팩토링합니다.
`id`를 `1`로, 이름을 `Windstorm`으로 초기화합니다.

수정된 `HeroesComponent` 클래스 파일은 아래와 같습니다.

<code-example path="toh-pt1/src/app/heroes/heroes.component.ts" linenums="false"
  title= "src/app/heroes/heroes.component.ts">
</code-example>

히어로를 문자에서 객체로 변경하였기 때문에 페이지는 더이상 제대로 표시되지 않습니다. 

## 히어로 객체 보여주기

히어로의 이름이 표시되도록 템플릿에서 바인딩을 수정합니다. 다음과 같이 세부 레이아웃에 `id`와 `name` 모두 표시되도록 합니다. 

<code-example 
  path="toh-pt1/src/app/heroes/heroes.component.1.html"
  region="show-hero-2" 
  title="heroes.component.html (HeroesComponent's template)" linenums="false">
</code-example>

브라우저가 리프레시되며 히어로의 정보가 표시됩니다.

## _UppercasePipe_를 통한 형식 지정

아래와 같이 `hero.name`의 바인딩을 수정합니다.

<code-example
  path="toh-pt1/src/app/heroes/heroes.component.html"
  region="pipe">
</code-example>

브라우저가 리프레시되며 히어로의 이름이 대문자로 표시됩니다.

문자열 바인딩(interpolation binding)에 있는 파이프 연산자(|) 바로 뒤에 있는 `uppercase` 단어는 Angluar의 기본 내장된 파이프인 `UppercasePipe`를 실행합니다.

[Pipes](guide/pipes)는 문자열의 형식을 지정하거나, 통화를 변경하거나, 날짜나 데이터를 표시하기에 좋은 방법입니다.

## 히어로 수정하기

사용자들은 `<input>` 텍스트박스에서 히어로의 이름을 수정할 수 있어야 합니다.

텍스트박스는 히어로의 `name` 프로퍼티를 _표시함_과 동시에 유저가 입력하는 이름으로 _업데이트_ 해야합니다.
이는 데이터가 컴포넌트 클래스로부터 _시작하여 화면까지_ 그리고 _반대로 화면으로부터 클래스까지_ 흐름을 의미합니다.

이런 데이터 흐름을 자동화하기 위해서는 `<input>` 엘리먼트와 `hero.name` 프로퍼티 사이에 양방향 바인딩을 설정합니다.

### 양방향 바인딩

`HeroesComponent` 템플릿에서 상세 화면 영역을 아래와 같도록 리팩토링합니다.

<code-example path="toh-pt1/src/app/heroes/heroes.component.1.html" region="name-input" title="src/app/heroes/heroes.component.html (HeroesComponent's template)" linenums="false">

</code-example>

**[(ngModel)]** 는 양방향 바인딩을 위한 Angular의 구문입니다.

아래는 데이터가 _양방향으로_(`hero.name` 프로퍼티로부터 텍스트박스까지, 텍스트박스로부터 `hero.name`까지) 흐르기 위해서 `hero.name` 프로퍼티를 HTML 텍스트박스에 바인딩하는 예제입니다: 

### 잃어버린 _FormsModule_

`[(ngModel)]`를 추가하면 앱은 동작을 멈추게 됩니다.

이 에러를 보기 위해서 브라우저에서 개발자도구를 열어 콘솔창탭을 보면 아래와 같은 메세지를 볼 수 있습니다.

<code-example language="sh" class="code-shell">
Template parse errors:
Can't bind to 'ngModel' since it isn't a known property of 'input'.
</code-example>

`ngModel`이 유효한 Angular 디렉티브라 할지라도 기본적으로 사용할 수는 없습니다.

이는 선택적인 `FormsModule`에 속하며 이를 사용하기 위해서는 _사전동의_가 필요합니다.

## _AppModule_

Angular는 어떻게 애플리케이션의 부분들이 서로 잘 맞는지, 어떤 다른 파일들이나 라이브러리들을 앱이 필요로 하는지 알 필요가 있습니다.
이 정보는 _metadata_라 불립니다.

일부 메타데이터는 컴포넌트 클래스에 추가하기 원하는 `@Component` 데코레이터에 있습니다.
다른 중요한 메타데이터는 [`@NgModule`](guide/ngmodule) 데코레이터에 있습니다.

최상위 **AppModule** 클래스에 가장 중요한 `@NgModule` 데코레이터를 주석으로 답니다.

Angular CLI는 프로젝트가 생성될때 `src/app/app.module.ts`에 `AppModule` 클래스를 정의합니다.
This is where you _opt-in_ to the `FormsModule`.

### _FormsModule_ 가져오기

`AppModule` (`app.module.ts`)를 열어 `@angular/forms` 라이브러리로부터 `FormsModule` 심볼을 가져옵니다.

<code-example path="toh-pt1/src/app/app.module.ts" title="app.module.ts (FormsModule symbol import)"
 region="formsmodule-js-import">
</code-example>

그리고나서 앱이 필요로 하는 외부 라이브러리의 리스트를 담고 있는 `@NgModule` 메타데이터의 `imports` 배열에 `FormsModule`를 추가합니다.

<code-example path="toh-pt1/src/app/app.module.ts" title="app.module.ts ( @NgModule imports)"
region="ng-imports">
</code-example>

브라우저가 갱신되고 나면 앱은 재실행됩니다. 이제 히어로의 이름을 변경할 수 있으며 변경한 이름이 텍스트박스 위의 `<h2>`태그에 즉시 반영되는 것을 볼 수 있습니다.

### _HeroesComponent_ 선언하기

모든 컴포넌트는 반드시 하나의 [NgModule](guide/ngmodule)에 선언되어야 합니다.

_여러분_은 `HeroesComponent`를 선언하지 않았습니다.

그런데 왜 애플리케이션이 동작할까요?

바로 Angular CLI가 `HeroesComponent`를 생성할 때 `AppModule`에 선언하였기 때문입니다.

`src/app/app.module.ts` 열어 파일 상단에 `HeroesComponent`가 import된걸 확인하세요.

<code-example path="toh-pt1/src/app/app.module.ts" region="heroes-import" >
</code-example>

`HeroesComponent`는 `@NgModule.declarations` 배열에 선언되어 있습니다.

<code-example path="toh-pt1/src/app/app.module.ts" region="declarations">
</code-example>

`AppModule`가 애플리케이션 컴포넌트인 `AppComponent`와 `HeroesComponent`를 선언한다는 점에 유의하세요.

## 마지막 코드 리뷰

작성한 앱의 모습은 <live-example></live-example>에서 확인할 수 있습니다. 이번 튜토리얼에서 배운 코드들은 아래와 같습니다.

<code-tabs>

  <code-pane title="src/app/heroes/heroes.component.ts" path="toh-pt1/src/app/heroes/heroes.component.ts">
  </code-pane>

  <code-pane title="src/app/heroes/heroes.component.html" path="toh-pt1/src/app/heroes/heroes.component.html">
  </code-pane>

  <code-pane title="src/app/app.module.ts" 
  path="toh-pt1/src/app/app.module.ts">
  </code-pane>

  <code-pane title="src/app/app.component.ts" path="toh-pt1/src/app/app.component.ts">
  </code-pane>

  <code-pane title="src/app/app.component.html" path="toh-pt1/src/app/app.component.html">
  </code-pane>

  <code-pane title="src/app/hero.ts" 
  path="toh-pt1/src/app/hero.ts">
  </code-pane>

</code-tabs>

## 요약

* CLI를 사용하여 두번째 `HerosComponent`를 생성하였습니다.
* `AppComponent` 쉘에 추가하여 `HeroesComponent`를 표시했습니다.
* 표시되는 이름의 형식을 지정하기 위하여 `UppercasePipe`를 적용했습니다.
* `ngModel` 디렉티브를 통해 양방향 데이터 바인딩을 사용했습니다.
* `AppModule`에 대해서 배웠습니다.
* `AppModule`에 `FormsModule`를 불러와서 Angular가 `ngModel` 디렉티브를 인식하고 적용할 수 있도록 하였습니다.
* `AppModule`에서의 컴포넌트 선언의 중요성에 대해 배웠고 CLI의 진가를 확인했습니다.