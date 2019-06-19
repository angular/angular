<!--
# Component Styles
-->
# 컴포넌트 스타일

<!--
Angular applications are styled with standard CSS. That means you can apply
everything you know about CSS stylesheets, selectors, rules, and media queries
directly to Angular applications.
-->
Angular 애플리케이션의 스타일은 표준 CSS를 사용해서 지정합니다. 따라서 기존에 사용하고 있는 CSS 스타일시트, 셀렉터, 룰, 미디어 쿼리도 Angular 애플리케이션에 그대로 사용할 수 있습니다.

<!--
Additionally, Angular can bundle *component styles*
with components, enabling a more modular design than regular stylesheets.
-->
Angular는 여기에 추가로 개별 컴포넌트에 *컴포넌트 스타일*을 적용할 수 있으며, CSS 스타일 외에 다른 스타일 도구도 활용할 수 있습니다.

<!--
This page describes how to load and apply these component styles.
-->
이 문서는 컴포넌트 스타일을 어떻게 불러오거나 지정할 수 있는지 안내합니다.

<!--
You can run the <live-example></live-example> in Stackblitz and download the code from there.
-->
이 문서에서 다루는 예제는 <live-example></live-example>에서 확인하거나 다운받을 수 있습니다.

<!--
## Using component styles
-->
## 컴포넌트 스타일 사용하기

<!--
For every Angular component you write, you may define not only an HTML template,
but also the CSS styles that go with that template,
specifying any selectors, rules, and media queries that you need.
-->
개발자가 만드는 모든 Angular 컴포넌트는 HTML 템플릿 외에 CSS 스타일도 지정할 수 있습니다.
이 스타일 설정에는 기존에 사용하던 셀렉터, 룰, 미디어 쿼리도 그대로 사용할 수 있습니다.

<!--
One way to do this is to set the `styles` property in the component metadata.
The `styles` property takes an array of strings that contain CSS code.
Usually you give it one string, as in the following example:
-->
가장 간단한 방법은 컴포넌트 메타데이터에 `styles` 프로퍼티를 사용하는 것입니다.
`styles` 프로퍼티에는 CSS 코드를 문자열 배열 형태로 지정하며, 다음과 같이 문자열 하나로도 간단하게 지정할 수 있습니다:

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts" linenums="false">
</code-example>

<!--
## Style scope
-->
## 스타일 적용 범위

<div class="alert is-critical">

<!--
The styles specified in `@Component` metadata _apply only within the template of that component_.
-->
`@Component` 메타데이터에 지정한 스타일은 _그 컴포넌트의 템플릿에만_ 적용됩니다.

</div>

<!--
They are _not inherited_ by any components nested within the template nor by any content projected into the component.
-->
컴포넌트 스타일은 템플릿 안에 있는 자식 컴포넌트의 템플릿이나 이 컴포넌트에 프로젝트되는 컴포넌트에는 _적용되지 않습니다_.

<!--
In this example, the `h1` style applies only to the `HeroAppComponent`,
not to the nested `HeroMainComponent` nor to `<h1>` tags anywhere else in the application.
-->
이 예제로 보면 `h1` 엘리먼트 스타일은 `HeroAppComponent`에만 적용되며, 자식 컴포넌트 `HeroMainComponent`나 컴포넌트 외부에 있는 `<h1>` 태그에는 적용되지 않습니다.

<!--
This scoping restriction is a ***styling modularity feature***.
-->
그래서 컴포넌트에 적용되는 스타일은 다음과 같은 ***스타일 모듈 규칙***을 따릅니다.

<!--
* You can use the CSS class names and selectors that make the most sense in the context of each component.
-->
* 컴포넌트를 구분하기 위해 적절한 CSS 클래스 이름과 셀렉터를 사용할 수 있습니다.

<!--
* Class names and selectors are local to the component and don't collide with
  classes and selectors used elsewhere in the application.
-->
* 클래스 이름과 셀렉터는 컴포넌트 안에서만 유효하며, 컴포넌트 밖에 있는 클래스와 셀렉터에는 적용되지 않습니다.

<!--
* Changes to styles elsewhere in the application don't affect the component's styles.
-->
* 컴포넌트 밖에서 스타일이 동적으로 변경되어도 컴포넌트에는 적용되지 않습니다.

<!--
* You can co-locate the CSS code of each component with the TypeScript and HTML code of the component,
  which leads to a neat and tidy project structure.
-->
* 프로젝트 규모가 작거나 간단하게 테스트 하려면 CSS 코드를 TypeScript 코드나 HTML에 작성할 수 있습니다.

<!--
* You can change or remove component CSS code without searching through the
  whole application to find where else the code is used.
-->
* 컴포넌트에 적용되는 CSS 코드는 컴포넌트 외부에 적용되지 않기 때문에 걱정없이 변경하거나 제거할 수 있습니다.

<!--
{@a special-selectors}
-->
{@a angular-전용-셀렉터}

<!--
## Special selectors
-->
## Angular 전용 셀렉터

<!--
Component styles have a few special *selectors* from the world of shadow DOM style scoping
(described in the [CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1) page on the
[W3C](https://www.w3.org) site).
The following sections describe these selectors.
-->
컴포넌트에 스타일 문법에는 섀도우 DOM에 적용할 수 있는 특별한 *셀렉터* 를 몇가지 사용할 수 있습니다. 이 셀렉터들은 [W3C](https://www.w3.org) 사이트의 [CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1)에서 정의하는 표준 셀렉터입니다.

### :host

<!--
Use the `:host` pseudo-class selector to target styles in the element that *hosts* the component (as opposed to
targeting elements *inside* the component's template).
-->
컴포넌트가 *위치하는* 엘리먼트(호스트 엘리먼트)에 스타일을 지정하려면  가상 클래스 셀렉터 `:host`를 사용합니다. 이 때 컴포넌트가 위치하는 엘리먼트라는 것은 컴포넌트 템플릿 *안쪽*이 아닌 컴포넌트를 나타내는 엘리먼트 자체를 가리킵니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="host" header="src/app/hero-details.component.css" linenums="false">
</code-example>

<!--
The `:host` selector is the only way to target the host element. You can't reach
the host element from inside the component with other selectors because it's not part of the
component's own template. The host element is in a parent component's template.
-->
컴포넌트에 스타일을 지정할 때 컴포넌트가 위치한 엘리먼트 자체를 가리키는 방법은 `:host` 셀렉터를 사용하는 것뿐입니다. 컴포넌트가 위치하는 엘리먼트는 컴포넌트 템플릿 외부에 있기 때문에 이 방법을 제외하면 컴포넌트 안쪽에서 접근할 수 없습니다. 호스트 엘리먼트는 부모 컴포넌트의 템플릿에 정의되기 때문입니다.

<!--
Use the *function form* to apply host styles conditionally by
including another selector inside parentheses after `:host`.
-->
그리고 `:host` 셀렉터에 괄호(`(`, `)`)를 함께 사용하면 특정 조건에 맞는 스타일만 지정할 수도 있습니다.

<!--
The next example targets the host element again, but only when it also has the `active` CSS class.
-->
그래서 아래 예제는 `active` CSS 클래스가 지정된 호스트 엘리먼트만 가리킵니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostfunction" header="src/app/hero-details.component.css" linenums="false">
</code-example>

### :host-context

<!--
Sometimes it's useful to apply styles based on some condition *outside* of a component's view.
For example, a CSS theme class could be applied to the document `<body>` element, and
you want to change how your component looks based on that.
-->
어떤 경우에는 컴포넌트 뷰 *밖*에 있는 스타일을 조건으로 활용해서 컴포넌트 스타일을 적용해야 하는 경우도 있습니다.
예를 들면 HTML 문서의 `<body>` 엘리먼트에 적용된 CSS 테마 클래스에 따라 컴포넌트의 뷰가 어떻게 표시되는지 확인하고 싶다고 합니다.

<!--
Use the `:host-context()` pseudo-class selector, which works just like the function
form of `:host()`. The `:host-context()` selector looks for a CSS class in any ancestor of the component host element,
up to the document root. The `:host-context()` selector is useful when combined with another selector.

-->
이 때 `:host-context` 가상 클래스 셀렉터를 사용하면 `:host()` 를 사용할 때와 비슷하게 컴포넌트 밖에 있는 엘리먼트를 가리킬 수 있습니다. `:host-context()` 셀렉터는 컴포넌트가 위치하는 호스트 엘리먼트의 부모 엘리먼트부터 HTML 문서의 루트 노트까지 적용됩니다.
그리고 이 셀렉터는 다른 셀렉터와 마찬가지로 조합해서 사용할 수도 있습니다.

<!--
The following example applies a `background-color` style to all `<h2>` elements *inside* the component, only
if some ancestor element has the CSS class `theme-light`.
-->
아래 예제는 CSS 클래스 `theme-light`가 지정된 부모 엘리먼트의 자식 엘리먼트 중 이 컴포넌트 *안*에 있는 `<h2>` 엘리먼트에 `background-color` 스타일을 지정하는 예제 코드입니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostcontext" header="src/app/hero-details.component.css" linenums="false">
</code-example>

<!--
### (deprecated) `/deep/`, `>>>`, and `::ng-deep`
-->
### (지원 중단) `/deep/`, `>>>`, `::ng-deep`

<!--
Component styles normally apply only to the HTML in the component's own template.
-->
컴포넌트 스타일은 보통 해당 컴포넌트의 템플릿에만 적용합니다.

Applying the `::ng-deep` pseudo-class to any CSS rule completely disables view-encapsulation for
that rule. Any style with `::ng-deep` applied becomes a global style. In order to scope the specified style
to the current component and all its descendants, be sure to include the `:host` selector before
`::ng-deep`. If the `::ng-deep` combinator is used without the `:host` pseudo-class selector, the style
can bleed into other components.

<!--
The following example targets all `<h3>` elements, from the host element down
through this component to all of its child elements in the DOM.
-->
아래 예제는 컴포넌트 뷰 안에 있는 모든 자식 컴포넌트의 `<h3>` 엘리먼트에 이탤릭 속성을 지정하는 예제 코드입니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" header="src/app/hero-details.component.css" linenums="false">

</code-example>

<!--
The `/deep/` combinator also has the aliases `>>>`, and `::ng-deep`.
-->
`/deep/` 셀렉터는 `>>>`나 `::ng-deep` 문법으로도 사용할 수 있습니다.

<div class="alert is-important">

<!--
Use `/deep/`, `>>>` and `::ng-deep` only with *emulated* view encapsulation.
Emulated is the default and most commonly used view encapsulation. For more information, see the
[Controlling view encapsulation](guide/component-styles#view-encapsulation) section.
-->
`/deep/`, `>>>`, `::ng-deep` 셀렉터는 *`Emulated`* 뷰 캡슐화 정책을 사용할 때만 사용하세요.
이 정책은 뷰 캡슐화 정책의 기본값입니다. 좀 더 자세한 설명은 [뷰 캡슐화 정책](guide/component-styles#뷰-캡슐화) 문서를 참고하세요.

</div>

<div class="alert is-important">

<!--
The shadow-piercing descendant combinator is deprecated and [support is being removed from major browsers](https://www.chromestatus.com/features/6750456638341120) and tools.
As such we plan to drop support in Angular (for all 3 of `/deep/`, `>>>` and `::ng-deep`).
Until then `::ng-deep` should be preferred for a broader compatibility with the tools.
-->
`/deep/` 셀렉터는 Angular에서 공식적으로 지원이 중단되었으며 [대부분의 브라우저에서도 지원이 중단](https://www.chromestatus.com/features/6750456638341120)되었습니다.
따라서 `::ng-deep`의 호환성 문제에 대한 해결방안이 마련되는 대로 앞으로 배포될 Angular에는 `/deep/`과 `>>>`, `::ng-deep`이 모두 제거될 예정입니다.

</div>

<!--
{@a loading-styles}
-->
{@a 외부-스타일-불러오기}

<!--
## Loading component styles
-->
## 컴포넌트 스타일 지정하기

<!--
There are several ways to add styles to a component:
-->
컴포넌트에 스타일을 지정하려면 다음과 같은 방법을 활용할 수 있습니다.

<!--
* By setting `styles` or `styleUrls` metadata.
* Inline in the template HTML.
* With CSS imports.
-->
* 컴포넌트 메타데이터에 `style`이나 `styleUrls` 사용하기
* 템플릿 HTML에 인라인으로 지정하기
* 외부 CSS 파일 불러오기

<!--
The scoping rules outlined earlier apply to each of these loading patterns.
-->

<!--
### Styles in component metadata
-->
### 컴포넌트 메타데이터로 스타일 지정하기

<!--
You can add a `styles` array property to the `@Component` decorator.
-->
`@Component` 데코레이터에는 `styles` 프로퍼티를 지정할 수 있습니다.

<!--
Each string in the array defines some CSS for this component.
-->
이 프로퍼티는 문자열 배열을 사용하는데, 컴포넌트에 지정될 CSS 스타일을 문자열로 각각 지정합니다.

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts (CSS inline)">
</code-example>

<div class="alert is-critical">

<!--
Reminder: these styles apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.
-->
주의 : 이 방법으로 지정하는 스타일은 _이 컴포넌트에만_ 적용됩니다. 템플릿 안에 있는 자식 컴포넌트나, 이 컴포넌트에 프로젝트되는 다른 컨텐츠에도 적용되지 않습니다.

</div>

<!--
The Angular CLI command [`ng generate component`](cli/generate) defines an empty `styles` array when you create the component with the `--inline-style` flag.
-->
Angular CLI로 [`ng generate component`](cli/generate) 명령을 실행할 때 `--inline-style` 플래그를 지정하면 `styles` 배열이 비어있는 상태에서 컴포넌트 코드 개발을 시작할 수 있습니다.

<code-example language="sh" class="code-shell">
ng generate component hero-app --inline-style
</code-example>

<!--
### Style files in component metadata
-->
### 컴포넌트 메타데이터에 외부 스타일 파일 불러오기

<!--
You can load styles from external CSS files by adding a `styleUrls` property
to a component's `@Component` decorator:
-->
컴포넌트의 `@Component` 데코레이터에 `styleUrls` 프로퍼티를 사용하면 컴포넌트 외부에 있는 CSS 파일을 불러와서 컴포넌트에 적용할 수 있습니다.

<code-tabs>
  <code-pane header="src/app/hero-app.component.ts (CSS in file)" path="component-styles/src/app/hero-app.component.1.ts"></code-pane>
  <code-pane header="src/app/hero-app.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

<!--
Reminder: the styles in the style file apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.
-->
주의 : 이 방법으로 지정하는 스타일은 _이 컴포넌트에만_ 적용됩니다. 템플릿 안에 있는 자식 컴포넌트나, 이 컴포넌트에 프로젝트되는 다른 컨텐츠에는 적용되지 않습니다.

</div>

<div class="alert is-helpful">

  <!--
  You can specify more than one styles file or even a combination of `styles` and `styleUrls`.
  -->
  `styles`이나 `styleUrls` 프로퍼티에는 한 번에 여러 스타일을 지정하거나 여러 파일을 지정할 수 있습니다.

</div>

<!--
When you use the Angular CLI command [`ng generate component`](cli/generate) without the `--inline-style` flag, it creates an empty styles file for you and references that file in the component's generated `styleUrls`.
-->
Angular CLI로 [`ng generate component`](cli/generate) 명령을 실행할 때 `--inline-style` 플래그를 지정하지 않으면 컴포넌트 이름으로 스타일 파일을 만들고 컴포넌트 메타데이터의 `styleUrls`에서 이 파일을 참조합니다.

<code-example language="sh" class="code-shell">
ng generate component hero-app
</code-example>

<!--
### Template inline styles
-->
### 템플릿 인라인 스타일

<!--
You can embed CSS styles directly into the HTML template by putting them
inside `<style>` tags.
-->
CSS 스타일은 `<style>` 태그를 사용해서 HTML 템플릿 안에 지정할 수도 있습니다.

<code-example path="component-styles/src/app/hero-controls.component.ts" region="inlinestyles" header="src/app/hero-controls.component.ts">
</code-example>

<!--
### Template link tags
-->
### 템플릿 link 태그

<!--
You can also write `<link>` tags into the component's HTML template.
-->
컴포넌트 HTML 템플릿에는 `<link>` 태그를 사용할 수도 있습니다.

<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" header="src/app/hero-team.component.ts">
</code-example>

<div class="alert is-critical">

<!--
When building with the CLI, be sure to include the linked style file among the assets to be copied to the server as described in the [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-asset-configuration).
-->
Angular CLI가 애플리케이션을 빌드할 때 링크로 연결된 스타일 파일이 `assets` 폴더에 있고 빌드 결과에 제대로 포함되는지 꼭 확인하세요. `assets` 폴더를 활용하는 방법은 [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-asset-configuration)에서 소개합니다.
<!-- 2018-10-16: The link above is still the best source for this information. -->

<!--
Once included, the CLI will include the stylesheet, whether the link tag's href URL is relative to the application root or the component file.
-->
스타일 파일이 `assets` 폴더에 있다면 CLI가 이 스타일 파일을 빌드 결과물에 포함시키며, 컴포넌트에서는 애플리케이션 최상위 경로나 컴포넌트 파일의 상대경로로 이 스타일 파일을 참조할 수 있습니다.

</div>

### CSS @imports

<!--
You can also import CSS files into the CSS files using the standard CSS `@import` rule.
For details, see [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import)
on the [MDN](https://developer.mozilla.org) site.
-->
외부 CSS 파일을 불러올 때는 CSS 표준인 `@import`를 사용하는 방법도 있습니다.
이 문법에 대해 자세하게 알아보려면 [MDN](https://developer.mozilla.org) 사이트의 [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import) 문서를 참고하세요.

<!--
In this case, the URL is relative to the CSS file into which you're importing.
-->
이 경우에는 CSS 파일을 로드하는 컴포넌트에서 시작하는 상대 경로로 외부 CSS 파일의 URL을 지정합니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="import" header="src/app/hero-details.component.css (excerpt)">
</code-example>

<!--
### External and global style files
-->
### 전역 스타일 파일

<!--
When building with the CLI, you must configure the `angular.json` to include _all external assets_, including external style files.
-->
Angular CLI로 애플리케이션의 빌드 설정 파일인 `angular.json` 파일은 빌드에 포함될 _모든 외부 자원_ 을 지정하는데, 이 때 외부 스타일 파일을 지정할 수도 있습니다.

<!--
Register **global** style files in the `styles` section which, by default, is pre-configured with the global `styles.css` file.
-->
이 때 `styles` 항목을 활용하면 **전역**으로 지정될 스타일 파일을 지정할 수 있으며, CLI로 생성한 프로젝트라면 `styles.css` 파일이 초기값으로 지정됩니다.

<!--
See the [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-global-styles) to learn more.
-->
더 자세한 내용은 [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-global-styles)를 참고하세요.
<!-- 2018-10-16: The link above is still the best source for this information. -->


<!--
### Non-CSS style files
-->
### CSS 이외의 스타일 파일

<!--
If you're building with the CLI,
you can write style files in [sass](http://sass-lang.com/), [less](http://lesscss.org/), or [stylus](http://stylus-lang.com/) and specify those files in the `@Component.styleUrls` metadata with the appropriate extensions (`.scss`, `.less`, `.styl`) as in the following example:
-->
Angular CLI를 사용한다면 [sass](http://sass-lang.com/)나 [less](http://lesscss.org/), [stylus](http://stylus-lang.com/)를 사용할 수도 있으며, 이렇게 만든 스타일 파일은 `@Component.styleUrls` 메타데이터에 다음과 같이 지정할 수 있습니다:

<code-example>
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
...
</code-example>

<!--
The CLI build process runs the pertinent CSS preprocessor.
-->
그러면 Angular CLI에 정의된 CSS 프리프로세서를 통해 최종 결과물에는 CSS 스타일로 변환됩니다.

<!--
When generating a component file with `ng generate component`, the CLI emits an empty CSS styles file (`.css`) by default.
You can configure the CLI to default to your preferred CSS preprocessor
as explained in the [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-css-preprocessors
"CSS Preprocessor integration").
-->
`ng generate component` 명령으로 컴포넌트를 생성하면 비어있는 CSS 파일(`.css`)이 기본으로 생성됩니다.
이 때 스타일 파일을 어떤 확장자로 생성할지 Angular CLI 환경 설정파일에 지정할 수 있으며, 더 자세한 내용은 [CLI 문서](https://github.com/angular/angular-cli/wiki/stories-css-preprocessors
"CSS Preprocessor integration") 문서를 참고하세요.
<!-- 2018-10-16: The link above is still the best source for this information. -->


<div class="alert is-important">

<!--
Style strings added to the `@Component.styles` array _must be written in CSS_ because the CLI cannot apply a preprocessor to inline styles.
-->
`@Component.styles`에 문자열로 지정하는 스타일은 _반드시 CSS 문법으로_ 지정해야 합니다. Angular CLI는 인라인 스타일을 처리할 때 CSS 프리프로세서를 별도로 사용하지 않습니다.

</div>

<!--
{@a view-encapsulation}
-->
{@a 뷰-캡슐화}

<!--
## View encapsulation
-->
## 뷰 캡슐화

<!--
As discussed earlier, component CSS styles are encapsulated into the component's view and don't
affect the rest of the application.
-->
이전에 언급했던 것처럼 컴포넌트의 CSS 스타일은 컴포넌트 뷰 안으로 캡슐화 되며 컴포넌트 외부의 영향을 받지 않습니다.

<!--
To control how this encapsulation happens on a *per
component* basis, you can set the *view encapsulation mode* in the component metadata.
Choose from the following modes:
-->
이 정책은 컴포넌트 메타데이터에 *뷰 캡슐화 모드*를 지정해서 *컴포넌트별로* 변경할 수 있습니다.
지정할 수 있는 뷰 캡슐화 정책은 다음과 같습니다:

<!--
* `ShadowDom` view encapsulation uses the browser's native shadow DOM implementation (see
  [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  on the [MDN](https://developer.mozilla.org) site)
  to attach a shadow DOM to the component's host element, and then puts the component
  view inside that shadow DOM. The component's styles are included within the shadow DOM.
-->
* `ShadowDom` 캡슐화 정책을 사용하면 브라우저의 네이티브 섀도우 DOM 구현 방식을 사용해서 컴포넌트의 호스트 엘리먼트를 구성합니다.
컴포넌트 뷰는 이 섀도우 DOM 안에 들어가며, 이 때 컴포넌트의 스타일도 함께 섀도우 DOM에 포함됩니다.
섀도우 DOM에 대한 자세한 내용은 [MDN](https://developer.mozilla.org) 사이트에서 제공하는 [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM) 문서를 참고하세요.

<!--
* `Native` view encapsulation uses a now deprecated version of the browser's native shadow DOM implementation - [learn about the changes](https://hayato.io/2016/shadowdomv1/).
-->
* `Native` 캡슐화 정책은 이전 버전(Shadow DOM v0)의 섀도우 DOM에 대한 것으로 변경되었습니다. [변경된 내용을 확인해 보세요](https://hayato.io/2016/shadowdomv1/).

<!--
* `Emulated` view encapsulation (the default) emulates the behavior of shadow DOM by preprocessing
  (and renaming) the CSS code to effectively scope the CSS to the component's view.
  For details, see [Appendix 1](guide/component-styles#inspect-generated-css).
-->
* 기본값인 `Emulated` 캡슐화 정책을 사용하면 Angular가 제공하는 섀도우 DOM을 사용하며, CSS 코드를 컴포넌트 뷰에 한정되도록 변경해서 적용합니다.
좀 더 자세한 내용은 [생성된 css 코드 확인하기](guide/component-styles#생성된-css-코드-확인하기) 섹션을 참고하세요.

<!--
* `None` means that Angular does no view encapsulation.
  Angular adds the CSS to the global styles.
  The scoping rules, isolations, and protections discussed earlier don't apply.
  This is essentially the same as pasting the component's styles into the HTML.
-->
* `None` 캡슐화 정책을 사용하면 Angular가 뷰를 캡슐화하지 않습니다. Angular에서 지정한 CSS 스타일은 전역 범위에 적용되며, 이전에 언급했던 스타일 적용 범위도 컴포넌트 안에만 제한되지 않습니다.
이 특징 외에는 다른 캡슐화 정책과 비슷합니다.

<!--
To set the components encapsulation mode, use the `encapsulation` property in the component metadata:
-->
컴포넌트 캡슐화 모드는 컴포넌트 메타데이터의 `encapsulation` 프로퍼티로 지정합니다:

<code-example path="component-styles/src/app/quest-summary.component.ts" region="encapsulation.native" header="src/app/quest-summary.component.ts" linenums="false">
</code-example>

<!--
`ShadowDom` view encapsulation only works on browsers that have native support
for shadow DOM (see [Shadow DOM v1](https://caniuse.com/#feat=shadowdomv1) on the
[Can I use](http://caniuse.com) site). The support is still limited,
which is why `Emulated` view encapsulation is the default mode and recommended
in most cases.
-->
`ShadowDom` 캡슐화 정책은 [Shadow DOM v0](http://caniuse.com/#feat=shadowdomv1)를 네이티브로 지원하는 브라우저에서만 유효하며, 지원 여부는 [Can I use](http://caniuse.com) 사이트에서 확인할 수 있습니다. 하지만 모든 브라우저가 이 표준을 지원하는 것은 아니기 때문에 Angular의 뷰 캡슐화 정책은 `Emulated`가 기본값이며, 대부분의 경우에 이 모드를 권장합니다.

<!--
{@a inspect-generated-css}
-->
{@a 생성된-css-코드-확인하기}

<!--
## Inspecting generated CSS
-->
## 생성된 CSS 코드 확인하기

<!--
When using emulated view encapsulation, Angular preprocesses
all component styles so that they approximate the standard shadow CSS scoping rules.
-->
`Emulated` 뷰 캡슐화 정책을 사용하면 표준 섀도우 CSS 적용범위에 맞게 Angular가 스타일 코드를 수정합니다.

<!--
In the DOM of a running Angular application with emulated view
encapsulation enabled, each DOM element has some extra attributes
attached to it:
-->
그래서 Angular가 처리한 코드를 확인해보면 다음과 같이 DOM 엘리먼트에 추가 어트리뷰트가 지정되는 것을 확인할 수 있습니다:

<code-example format="">
  &lt;hero-details _nghost-pmm-5>
    &lt;h2 _ngcontent-pmm-5>Mister Fantastic&lt;/h2>
    &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6>
      &lt;h3 _ngcontent-pmm-6>Team&lt;/h3>
    &lt;/hero-team>
  &lt;/hero-detail>

</code-example>

<!--
There are two kinds of generated attributes:
-->
이렇게 추가되는 어트리뷰트는 두 종류가 있습니다:

<!--
* An element that would be a shadow DOM host in native encapsulation has a
  generated `_nghost` attribute. This is typically the case for component host elements.
* An element within a component's view has a `_ngcontent` attribute
that identifies to which host's emulated shadow DOM this element belongs.
-->
* 섀도우 DOM 호스트에 해당하는 엘리먼트에는 `_nghost` 어트리뷰트가 추가됩니다. 이 어트리뷰트가 붙은 엘리먼트는 컴포넌트의 호스트 엘리먼트로 볼 수 있습니다.
* 컴포넌트 뷰 안에 있는 엘리먼트에는 `_ngcontent` 어트리뷰트가 추가되며, 호스트 엘리먼트가 어떤 엘리먼트인지 이 어트리뷰트를 사용해서 판단합니다.

<!--
The exact values of these attributes aren't important. They are automatically
generated and you never refer to them in application code. But they are targeted
by the generated component styles, which are in the `<head>` section of the DOM:
-->
어트리뷰트가 정확히 어떤 문자열로 추가되는지는 중요하지 않습니다. 이 어트리뷰트 이름은 자동으로 생성되는 값이며 애플리케이션 코드에서 사용하는 경우도 없습니다.
이 어트리뷰트 이름은 다음과 같이 `<head>`에서 컴포넌트 스타일을 적용할 때 사용됩니다:

<code-example format="">
  [_nghost-pmm-5] {
    display: block;
    border: 1px solid black;
  }

  h3[_ngcontent-pmm-6] {
    background-color: white;
    border: 1px solid #777;
  }
</code-example>

<!--
These styles are post-processed so that each selector is augmented
with `_nghost` or `_ngcontent` attribute selectors.
These extra selectors enable the scoping rules described in this page.
-->
이 스타일들은 Angular가 생성한 `_nghost`, `_ngcontent` 어트리뷰트 셀렉터를 사용해서 DOM 엘리먼트에 적용됩니다.
