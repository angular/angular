<!--
# Component styles
-->
# 컴포넌트 스타일

<!--
Angular applications are styled with standard CSS. That means you can apply
everything you know about CSS stylesheets, selectors, rules, and media queries
directly to Angular applications.

Additionally, Angular can bundle *component styles*
with components, enabling a more modular design than regular stylesheets.

This page describes how to load and apply these component styles.

You can run the <live-example></live-example> in Stackblitz and download the code from there.
-->
Angular 애플리케이션의 스타일은 표준 CSS를 사용해서 지정합니다.
따라서 기존에 사용하고 있는 CSS 스타일시트, 셀렉터, 룰, 미디어 쿼리도 Angular 애플리케이션에 그대로 사용할 수 있습니다.

Angular는 여기에 추가로 개별 컴포넌트에 *컴포넌트 스타일*을 적용할 수 있으며, CSS 스타일 외에 다른 스타일 도구도 활용할 수 있습니다.

이 문서는 컴포넌트 스타일을 어떻게 불러오거나 지정할 수 있는지 안내합니다.

이 문서에서 다루는 예제는 <live-example></live-example>에서 확인하거나 다운받을 수 있습니다.


<!--
## Using component styles
-->
## 컴포넌트 스타일 사용하기

<!--
For every Angular component you write, you may define not only an HTML template,
but also the CSS styles that go with that template,
specifying any selectors, rules, and media queries that you need.

One way to do this is to set the `styles` property in the component metadata.
The `styles` property takes an array of strings that contain CSS code.
Usually you give it one string, as in the following example:

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts"></code-example>
-->
개발자가 만드는 모든 Angular 컴포넌트는 HTML 템플릿 외에 CSS 스타일도 지정할 수 있습니다.
이 스타일 설정에는 기존에 사용하던 셀렉터, 룰, 미디어 쿼리도 그대로 사용할 수 있습니다.

가장 간단한 방법은 컴포넌트 메타데이터에 `styles` 프로퍼티를 사용하는 것입니다.
`styles` 프로퍼티에는 CSS 코드를 문자열 배열 형태로 지정하며, 다음과 같이 문자열 하나로도 간단하게 지정할 수 있습니다:

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts"></code-example>


<!--
## Style scope
-->
## 스타일 적용 범위

<!--
<div class="alert is-critical">

The styles specified in `@Component` metadata _apply only within the template of that component_.

</div>

They are _not inherited_ by any components nested within the template nor by any content projected into the component.

In this example, the `h1` style applies only to the `HeroAppComponent`,
not to the nested `HeroMainComponent` nor to `<h1>` tags anywhere else in the application.

This scoping restriction is a ***styling modularity feature***.

* You can use the CSS class names and selectors that make the most sense in the context of each component.


* Class names and selectors are local to the component and don't collide with
  classes and selectors used elsewhere in the application.


* Changes to styles elsewhere in the application don't affect the component's styles.


* You can co-locate the CSS code of each component with the TypeScript and HTML code of the component,
  which leads to a neat and tidy project structure.


* You can change or remove component CSS code without searching through the
  whole application to find where else the code is used.
-->
<div class="alert is-critical">

`@Component` 메타데이터에 지정한 스타일은 _그 컴포넌트의 템플릿에만_ 적용됩니다.

</div>

컴포넌트 스타일은 템플릿 안에 있는 자식 컴포넌트의 템플릿이나 이 컴포넌트에 프로젝트되는 컴포넌트에는 _적용되지 않습니다_.

이 예제로 보면 `h1` 엘리먼트 스타일은 `HeroAppComponent`에만 적용되며, 자식 컴포넌트 `HeroMainComponent`나 컴포넌트 외부에 있는 `<h1>` 태그에는 적용되지 않습니다.

그래서 컴포넌트에 적용되는 스타일은 다음과 같은 ***스타일 모듈 규칙***을 따릅니다.

* 컴포넌트를 구분하기 위해 적절한 CSS 클래스 이름과 셀렉터를 사용할 수 있습니다.

* 클래스 이름과 셀렉터는 컴포넌트 안에서만 유효하며, 컴포넌트 밖에 있는 클래스와 셀렉터에는 적용되지 않습니다.

* 컴포넌트 밖에서 스타일이 동적으로 변경되어도 컴포넌트에는 적용되지 않습니다.

* 프로젝트 규모가 작거나 간단하게 테스트 하려면 CSS 코드를 TypeScript 코드나 HTML에 작성할 수 있습니다.

* 컴포넌트에 적용되는 CSS 코드는 컴포넌트 외부에 적용되지 않기 때문에 걱정없이 변경하거나 제거할 수 있습니다.


{@a special-selectors}

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
컴포넌트에 스타일 문법에는 섀도우 DOM에 적용할 수 있는 특별한 *셀렉터* 를 몇가지 사용할 수 있습니다.
이 셀렉터들은 [W3C](https://www.w3.org) 사이트의 [CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1)에서 정의하는 표준 셀렉터입니다.

### :host

<!--
Use the `:host` pseudo-class selector to target styles in the element that *hosts* the component (as opposed to
targeting elements *inside* the component's template).


<code-example path="component-styles/src/app/hero-details.component.css" region="host" header="src/app/hero-details.component.css"></code-example>

The `:host` selector is the only way to target the host element. You can't reach
the host element from inside the component with other selectors because it's not part of the
component's own template. The host element is in a parent component's template.

Use the *function form* to apply host styles conditionally by
including another selector inside parentheses after `:host`.

The next example targets the host element again, but only when it also has the `active` CSS class.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostfunction" header="src/app/hero-details.component.css"></code-example>
-->
컴포넌트가 *위치하는* 엘리먼트(호스트 엘리먼트)에 스타일을 지정하려면 가상 클래스 셀렉터 `:host`를 사용합니다.
이 때 컴포넌트가 위치하는 엘리먼트라는 것은 컴포넌트 템플릿 *안쪽*이 아닌 컴포넌트를 나타내는 엘리먼트 자체를 가리킵니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="host" header="src/app/hero-details.component.css"></code-example>

컴포넌트에 스타일을 지정할 때 컴포넌트가 위치한 엘리먼트 자체를 가리키는 방법은 `:host` 셀렉터를 사용하는 것뿐입니다.
컴포넌트가 위치하는 엘리먼트는 컴포넌트 템플릿 외부에 있기 때문에 이 방법을 제외하면 컴포넌트 안쪽에서 접근할 수 없습니다.
호스트 엘리먼트는 부모 컴포넌트의 템플릿에 정의되기 때문입니다.

그리고 `:host` 셀렉터에 괄호(`(`, `)`)를 함께 사용하면 특정 조건에 맞는 스타일만 지정할 수도 있습니다.

그래서 아래 예제는 `active` CSS 클래스가 지정된 호스트 엘리먼트만 가리킵니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostfunction" header="src/app/hero-details.component.css"></code-example>


### :host-context

<!--
Sometimes it's useful to apply styles based on some condition *outside* of a component's view.
For example, a CSS theme class could be applied to the document `<body>` element, and
you want to change how your component looks based on that.

Use the `:host-context()` pseudo-class selector, which works just like the function
form of `:host()`. The `:host-context()` selector looks for a CSS class in any ancestor of the component host element,
up to the document root. The `:host-context()` selector is useful when combined with another selector.

The following example applies a `background-color` style to all `<h2>` elements *inside* the component, only
if some ancestor element has the CSS class `theme-light`.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostcontext" header="src/app/hero-details.component.css"></code-example>
-->
어떤 경우에는 컴포넌트 뷰 *밖*에 있는 스타일을 조건으로 활용해서 컴포넌트 스타일을 적용해야 하는 경우도 있습니다.
예를 들면 HTML 문서의 `<body>` 엘리먼트에 적용된 CSS 테마 클래스에 따라 컴포넌트의 뷰가 어떻게 표시되는지 확인하고 싶다고 합니다.

이 때 `:host-context` 가상 클래스 셀렉터를 사용하면 `:host()` 를 사용할 때와 비슷하게 컴포넌트 밖에 있는 엘리먼트를 가리킬 수 있습니다.
`:host-context()` 셀렉터는 컴포넌트가 위치하는 호스트 엘리먼트의 부모 엘리먼트부터 HTML 문서의 루트 노트까지 적용됩니다.
그리고 이 셀렉터는 다른 셀렉터와 마찬가지로 조합해서 사용할 수도 있습니다.

아래 예제는 CSS 클래스 `theme-light`가 지정된 부모 엘리먼트의 자식 엘리먼트 중 이 컴포넌트 *안*에 있는 `<h2>` 엘리먼트에 `background-color` 스타일을 지정하는 예제 코드입니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostcontext" header="src/app/hero-details.component.css"></code-example>


{@a deprecated-deep--and-ng-deep}

<!--
### (deprecated) `/deep/`, `>>>`, and `::ng-deep`
-->
### (지원 중단) `/deep/`, `>>>`, `::ng-deep`

<!--
Component styles normally apply only to the HTML in the component's own template.

Applying the `::ng-deep` pseudo-class to any CSS rule completely disables view-encapsulation for
that rule. Any style with `::ng-deep` applied becomes a global style. In order to scope the specified style
to the current component and all its descendants, be sure to include the `:host` selector before
`::ng-deep`. If the `::ng-deep` combinator is used without the `:host` pseudo-class selector, the style
can bleed into other components.

The following example targets all `<h3>` elements, from the host element down
through this component to all of its child elements in the DOM.

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" header="src/app/hero-details.component.css"></code-example>

The `/deep/` combinator also has the aliases `>>>`, and `::ng-deep`.

<div class="alert is-important">

Use `/deep/`, `>>>` and `::ng-deep` only with *emulated* view encapsulation.
Emulated is the default and most commonly used view encapsulation. For more information, see the
[View Encapsulation](guide/view-encapsulation) section.

</div>

<div class="alert is-important">

The shadow-piercing descendant combinator is deprecated and [support is being removed from major browsers](https://www.chromestatus.com/feature/6750456638341120) and tools.
As such we plan to drop support in Angular (for all 3 of `/deep/`, `>>>` and `::ng-deep`).
Until then `::ng-deep` should be preferred for a broader compatibility with the tools.

</div>
-->
컴포넌트 스타일은 보통 해당 컴포넌트의 템플릿에만 적용합니다.

가상 클래스 `::ng-deep`가 적용된 CSS는 컴포넌트의 뷰 캡슐화 정책을 완전히 무시합니다.
그래서 `::ng-deep`이 적용된 규칙은 전역 스타일 규칙이 되기 때문에 해당 컴포넌트는 물론이고 이 컴포넌트의 자식 컴포넌트에 모두 적용됩니다.
그리고 `:host` 셀렉터 앞에 `::ng-deep` 클래스를 사용하거나 `:host` 셀렉터를 사용하지 않으면 해당 CSS 규칙은 다른 컴포넌트에도 모두 적용되니 주의해야 합니다.

아래 예제는 컴포넌트 뷰 안에 있는 모든 자식 컴포넌트의 `<h3>` 엘리먼트에 이탤릭 속성을 지정하는 예제 코드입니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" header="src/app/hero-details.component.css"></code-example>

`/deep/` 셀렉터는 `>>>`나 `::ng-deep` 문법으로도 사용할 수 있습니다.

<div class="alert is-important">

`/deep/`, `>>>`, `::ng-deep` 셀렉터는 *`Emulated`* 뷰 캡슐화 정책을 사용할 때만 사용하세요.
이 정책은 뷰 캡슐화 정책의 기본값입니다. 좀 더 자세한 설명은 [뷰 캡슐화 정책](guide/view-encapsulation) 문서를 참고하세요.

</div>

<div class="alert is-important">

`/deep/` 셀렉터는 Angular에서 공식적으로 지원이 중단되었으며 [대부분의 브라우저에서도 지원이 중단](https://www.chromestatus.com/feature/6750456638341120)되었습니다.
따라서 `::ng-deep`의 호환성 문제에 대한 해결방안이 마련되는 대로 앞으로 배포될 Angular에는 `/deep/`과 `>>>`, `::ng-deep`이 모두 제거될 예정입니다.

</div>


{@a loading-styles}

<!--
## Loading component styles
-->
## 컴포넌트 스타일 지정하기

<!--
There are several ways to add styles to a component:

* By setting `styles` or `styleUrls` metadata.
* Inline in the template HTML.
* With CSS imports.

The scoping rules outlined earlier apply to each of these loading patterns.
-->
컴포넌트에 스타일을 지정하려면 다음과 같은 방법을 활용할 수 있습니다.

* 컴포넌트 메타데이터에 `style`이나 `styleUrls` 사용하기
* 템플릿 HTML에 인라인으로 지정하기
* 외부 CSS 파일 불러오기


<!--
### Styles in component metadata
-->
### 컴포넌트 메타데이터로 스타일 지정하기

<!--
You can add a `styles` array property to the `@Component` decorator.

Each string in the array defines some CSS for this component.

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts (CSS inline)">
</code-example>

<div class="alert is-critical">

Reminder: these styles apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.

</div>

The Angular CLI command [`ng generate component`](cli/generate) defines an empty `styles` array when you create the component with the `--inline-style` flag.

<code-example language="sh" class="code-shell">
ng generate component hero-app --inline-style
</code-example>
-->
`@Component` 데코레이터에는 `styles` 프로퍼티를 지정할 수 있습니다.

이 프로퍼티는 문자열 배열을 사용하는데, 컴포넌트에 지정될 CSS 스타일을 문자열로 각각 지정합니다.

<code-example path="component-styles/src/app/hero-app.component.ts" header="src/app/hero-app.component.ts (CSS inline)">
</code-example>

<div class="alert is-critical">

주의 : 이 방법으로 지정하는 스타일은 _이 컴포넌트에만_ 적용됩니다. 템플릿 안에 있는 자식 컴포넌트나, 이 컴포넌트에 프로젝트되는 다른 컨텐츠에도 적용되지 않습니다.

</div>

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

<code-tabs>
  <code-pane header="src/app/hero-app.component.ts (CSS in file)" path="component-styles/src/app/hero-app.component.1.ts"></code-pane>
  <code-pane header="src/app/hero-app.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

Reminder: the styles in the style file apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.

</div>

<div class="alert is-helpful">

  You can specify more than one styles file or even a combination of `styles` and `styleUrls`.

</div>

When you use the Angular CLI command [`ng generate component`](cli/generate) without the `--inline-style` flag, it creates an empty styles file for you and references that file in the component's generated `styleUrls`.

<code-example language="sh" class="code-shell">
ng generate component hero-app
</code-example>
-->
컴포넌트의 `@Component` 데코레이터에 `styleUrls` 프로퍼티를 사용하면 컴포넌트 외부에 있는 CSS 파일을 불러와서 컴포넌트에 적용할 수 있습니다.

<code-tabs>
  <code-pane header="src/app/hero-app.component.ts (CSS in file)" path="component-styles/src/app/hero-app.component.1.ts"></code-pane>
  <code-pane header="src/app/hero-app.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

주의 : 이 방법으로 지정하는 스타일은 _이 컴포넌트에만_ 적용됩니다.
템플릿 안에 있는 자식 컴포넌트나, 이 컴포넌트에 프로젝트되는 다른 컨텐츠에는 적용되지 않습니다.

</div>

<div class="alert is-helpful">

  `styles`이나 `styleUrls` 프로퍼티에는 한 번에 여러 스타일을 지정하거나 여러 파일을 지정할 수 있습니다.

</div>

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

<code-example path="component-styles/src/app/hero-controls.component.ts" region="inlinestyles" header="src/app/hero-controls.component.ts">
</code-example>
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

<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" header="src/app/hero-team.component.ts">
</code-example>

<div class="alert is-critical">

When building with the CLI, be sure to include the linked style file among the assets to be copied to the server as described in the [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-asset-configuration).
<!- 2018-10-16: The link above is still the best source for this information. ->

Once included, the CLI will include the stylesheet, whether the link tag's href URL is relative to the application root or the component file.

</div>
-->
컴포넌트 HTML 템플릿에는 `<link>` 태그를 사용할 수도 있습니다.

<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" header="src/app/hero-team.component.ts">
</code-example>

<div class="alert is-critical">

Angular CLI가 애플리케이션을 빌드할 때 링크로 연결된 스타일 파일이 `assets` 폴더에 있고 빌드 결과에 제대로 포함되는지 꼭 확인하세요.
`assets` 폴더를 활용하는 방법은 [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-asset-configuration)에서 소개합니다.
<!-- 2018-10-16: The link above is still the best source for this information. -->

스타일 파일이 `assets` 폴더에 있다면 CLI가 이 스타일 파일을 빌드 결과물에 포함시키며, 컴포넌트에서는 애플리케이션 최상위 경로나 컴포넌트 파일의 상대경로로 이 스타일 파일을 참조할 수 있습니다.

</div>


### CSS @imports

<!--
You can also import CSS files into the CSS files using the standard CSS `@import` rule.
For details, see [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import)
on the [MDN](https://developer.mozilla.org) site.

In this case, the URL is relative to the CSS file into which you're importing.

<code-example path="component-styles/src/app/hero-details.component.css" region="import" header="src/app/hero-details.component.css (excerpt)">
</code-example>
-->
외부 CSS 파일을 불러올 때는 CSS 표준인 `@import`를 사용하는 방법도 있습니다.
이 문법에 대해 자세하게 알아보려면 [MDN](https://developer.mozilla.org) 사이트의 [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import) 문서를 참고하세요.

이 경우에는 CSS 파일을 로드하는 컴포넌트에서 시작하는 상대 경로로 외부 CSS 파일의 URL을 지정합니다.

<code-example path="component-styles/src/app/hero-details.component.css" region="import" header="src/app/hero-details.component.css (excerpt)">
</code-example>


<!--
### External and global style files
-->
### 전역 스타일 파일

<!--
When building with the CLI, you must configure the `angular.json` to include _all external assets_, including external style files.

Register **global** style files in the `styles` section which, by default, is pre-configured with the global `styles.css` file.

See the [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-global-styles) to learn more.
<!- 2018-10-16: The link above is still the best source for this information. ->
-->
Angular CLI로 애플리케이션의 빌드 설정 파일인 `angular.json` 파일은 빌드에 포함될 _모든 외부 자원_ 을 지정하는데, 이 때 외부 스타일 파일을 지정할 수도 있습니다.

이 때 `styles` 항목을 활용하면 **전역**으로 지정될 스타일 파일을 지정할 수 있으며, CLI로 생성한 프로젝트라면 `styles.css` 파일이 초기값으로 지정됩니다.

더 자세한 내용은 [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-global-styles)를 참고하세요.
<!-- 2018-10-16: The link above is still the best source for this information. -->


<!--
### Non-CSS style files
-->
### CSS 이외의 스타일 파일

<!--
If you're building with the CLI,
you can write style files in [sass](http://sass-lang.com/), [less](http://lesscss.org/), or [stylus](http://stylus-lang.com/) and specify those files in the `@Component.styleUrls` metadata with the appropriate extensions (`.scss`, `.less`, `.styl`) as in the following example:

<code-example>
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
...
</code-example>

The CLI build process runs the pertinent CSS preprocessor.

When generating a component file with `ng generate component`, the CLI emits an empty CSS styles file (`.css`) by default.
You can configure the CLI to default to your preferred CSS preprocessor
as explained in the [CLI wiki](https://github.com/angular/angular-cli/wiki/stories-css-preprocessors
"CSS Preprocessor integration").
<!- 2018-10-16: The link above is still the best source for this information. ->


<div class="alert is-important">

Style strings added to the `@Component.styles` array _must be written in CSS_ because the CLI cannot apply a preprocessor to inline styles.

</div>
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

그러면 Angular CLI에 정의된 CSS 프리프로세서를 통해 최종 결과물에는 CSS 스타일로 변환됩니다.

`ng generate component` 명령으로 컴포넌트를 생성하면 비어있는 CSS 파일(`.css`)이 기본으로 생성됩니다.
이 때 스타일 파일을 어떤 확장자로 생성할지 Angular CLI 환경 설정파일에 지정할 수 있으며, 더 자세한 내용은 [CLI 문서](https://github.com/angular/angular-cli/wiki/stories-css-preprocessors
"CSS Preprocessor integration") 문서를 참고하세요.
<!-- 2018-10-16: The link above is still the best source for this information. -->


<div class="alert is-important">

`@Component.styles`에 문자열로 지정하는 스타일은 _반드시 CSS 문법으로_ 지정해야 합니다. Angular CLI는 인라인 스타일을 처리할 때 CSS 프리프로세서를 별도로 사용하지 않습니다.

</div>
