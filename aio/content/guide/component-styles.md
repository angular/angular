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

<code-example path="component-styles/src/app/hero-app.component.ts" title="src/app/hero-app.component.ts" linenums="false">
</code-example>

<!--
## Style scope
-->
## 스타일 적용 범위

<div class="alert is-critical">

<!--
The styles specified in `@Component` metadata _apply only within the template of that component_.
-->
`@Component` 메타데이터에 적용된 스타일은 _그 컴포넌트의 템플릿에만_ 적용됩니다.

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
* 프로젝트 규모가 작거나 간단하게 테스트 하려면 CSS 코드를 TypeScript 코드나 HTML에 작성할 수도 있습니다.

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

Component styles have a few special *selectors* from the world of shadow DOM style scoping
(described in the [CSS Scoping Module Level 1](https://www.w3.org/TR/css-scoping-1) page on the
[W3C](https://www.w3.org) site).
The following sections describe these selectors.

### :host

Use the `:host` pseudo-class selector to target styles in the element that *hosts* the component (as opposed to
targeting elements *inside* the component's template).


<code-example path="component-styles/src/app/hero-details.component.css" region="host" title="src/app/hero-details.component.css" linenums="false">
</code-example>

The `:host` selector is the only way to target the host element. You can't reach
the host element from inside the component with other selectors because it's not part of the
component's own template. The host element is in a parent component's template.

Use the *function form* to apply host styles conditionally by
including another selector inside parentheses after `:host`.

The next example targets the host element again, but only when it also has the `active` CSS class.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostfunction" title="src/app/hero-details.component.css" linenums="false">
</code-example>

### :host-context

Sometimes it's useful to apply styles based on some condition *outside* of a component's view.
For example, a CSS theme class could be applied to the document `<body>` element, and
you want to change how your component looks based on that.

Use the `:host-context()` pseudo-class selector, which works just like the function
form of `:host()`. The `:host-context()` selector looks for a CSS class in any ancestor of the component host element,
up to the document root. The `:host-context()` selector is useful when combined with another selector.

The following example applies a `background-color` style to all `<h2>` elements *inside* the component, only
if some ancestor element has the CSS class `theme-light`.

<code-example path="component-styles/src/app/hero-details.component.css" region="hostcontext" title="src/app/hero-details.component.css" linenums="false">
</code-example>

### (deprecated) `/deep/`, `>>>`, and `::ng-deep`

Component styles normally apply only to the HTML in the component's own template.

Use the `/deep/` shadow-piercing descendant combinator to force a style down through the child
component tree into all the child component views.
The `/deep/` combinator works to any depth of nested components, and it applies to both the view
children and content children of the component.

The following example targets all `<h3>` elements, from the host element down
through this component to all of its child elements in the DOM.

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" title="src/app/hero-details.component.css" linenums="false">

</code-example>

The `/deep/` combinator also has the aliases `>>>`, and `::ng-deep`.

<div class="alert is-important">

Use `/deep/`, `>>>` and `::ng-deep` only with *emulated* view encapsulation.
Emulated is the default and most commonly used view encapsulation. For more information, see the
[Controlling view encapsulation](guide/component-styles#view-encapsulation) section.

</div>

<div class="alert is-important">

The shadow-piercing descendant combinator is deprecated and [support is being removed from major browsers](https://www.chromestatus.com/features/6750456638341120) and tools.
As such we plan to drop support in Angular (for all 3 of `/deep/`, `>>>` and `::ng-deep`).
Until then `::ng-deep` should be preferred for a broader compatibility with the tools.

</div>

{@a loading-styles}

## Loading component styles

There are several ways to add styles to a component:

* By setting `styles` or `styleUrls` metadata.
* Inline in the template HTML.
* With CSS imports.

The scoping rules outlined earlier apply to each of these loading patterns.

### Styles in component metadata

You can add a `styles` array property to the `@Component` decorator.

Each string in the array defines some CSS for this component.

<code-example path="component-styles/src/app/hero-app.component.ts" title="src/app/hero-app.component.ts (CSS inline)">
</code-example>

<div class="alert is-critical">

Reminder: these styles apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.

</div>

The CLI defines an empty `styles` array when you create the component with the `--inline-styles` flag.

<code-example language="sh" class="code-shell">
ng generate component hero-app --inline-style
</code-example>

### Style files in component metadata

You can load styles from external CSS files by adding a `styleUrls` property
to a component's `@Component` decorator:

<code-tabs>
  <code-pane title="src/app/hero-app.component.ts (CSS in file)" path="component-styles/src/app/hero-app.component.1.ts"></code-pane>
  <code-pane title="src/app/hero-app.component.css" path="component-styles/src/app/hero-app.component.css"></code-pane>
</code-tabs>

<div class="alert is-critical">

Reminder: the styles in the style file apply _only to this component_.
They are _not inherited_ by any components nested within the template nor by any content projected into the component.

</div>

<div class="l-sub-section">

  You can specify more than one styles file or even a combination of `style` and `styleUrls`.

</div>

The CLI creates an empty styles file for you by default and references that file in the component's generated `styleUrls`.

<code-example language="sh" class="code-shell">
ng generate component hero-app
</code-example>

### Template inline styles

You can embed CSS styles directly into the HTML template by putting them
inside `<style>` tags.

<code-example path="component-styles/src/app/hero-controls.component.ts" region="inlinestyles" title="src/app/hero-controls.component.ts">
</code-example>

### Template link tags

You can also write `<link>` tags into the component's HTML template.

<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" title="src/app/hero-team.component.ts">
</code-example>

<div class="alert is-critical">

The link tag's `href` URL must be relative to the
_**application root**_, not relative to the component file.

When building with the CLI, be sure to include the linked style file among the assets to be copied to the server as described in the [CLI documentation](https://github.com/angular/angular-cli/wiki/stories-asset-configuration).

</div>

### CSS @imports

You can also import CSS files into the CSS files using the standard CSS `@import` rule.
For details, see [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import)
on the [MDN](https://developer.mozilla.org) site.

In this case, the URL is relative to the CSS file into which you're importing.

<code-example path="component-styles/src/app/hero-details.component.css" region="import" title="src/app/hero-details.component.css (excerpt)">
</code-example>

### External and global style files

When building with the CLI, you must configure the `.angular-cli.json` to include _all external assets_, including external style files.

Register **global** style files in the `styles` section which, by default, is pre-configured with the global `styles.css` file.

See the [CLI documentation](https://github.com/angular/angular-cli/wiki/stories-global-styles) to learn more.

### Non-CSS style files

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
as explained in the [CLI documentation](https://github.com/angular/angular-cli/wiki/stories-css-preprocessors
"CSS Preprocessor integration").

<div class="alert is-important">

Style strings added to the `@Component.styles` array _must be written in CSS_ because the CLI cannot apply a preprocessor to inline styles.

</div>

{@a view-encapsulation}

## View encapsulation

As discussed earlier, component CSS styles are encapsulated into the component's view and don't
affect the rest of the application.

To control how this encapsulation happens on a *per
component* basis, you can set the *view encapsulation mode* in the component metadata.
Choose from the following modes:

* `Native` view encapsulation uses the browser's native shadow DOM implementation (see
  [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  on the [MDN](https://developer.mozilla.org) site)
  to attach a shadow DOM to the component's host element, and then puts the component
  view inside that shadow DOM. The component's styles are included within the shadow DOM.

* `Emulated` view encapsulation (the default) emulates the behavior of shadow DOM by preprocessing
  (and renaming) the CSS code to effectively scope the CSS to the component's view.
  For details, see [Appendix 1](guide/component-styles#inspect-generated-css).

* `None` means that Angular does no view encapsulation.
  Angular adds the CSS to the global styles.
  The scoping rules, isolations, and protections discussed earlier don't apply.
  This is essentially the same as pasting the component's styles into the HTML.

To set the components encapsulation mode, use the `encapsulation` property in the component metadata:

<code-example path="component-styles/src/app/quest-summary.component.ts" region="encapsulation.native" title="src/app/quest-summary.component.ts" linenums="false">
</code-example>

`Native` view encapsulation only works on browsers that have native support
for shadow DOM (see [Shadow DOM v0](http://caniuse.com/#feat=shadowdom) on the
[Can I use](http://caniuse.com) site). The support is still limited,
which is why `Emulated` view encapsulation is the default mode and recommended
in most cases.

{@a inspect-generated-css}

## Inspecting generated CSS

When using emulated view encapsulation, Angular preprocesses
all component styles so that they approximate the standard shadow CSS scoping rules.

In the DOM of a running Angular application with emulated view
encapsulation enabled, each DOM element has some extra attributes
attached to it:

<code-example format="">
  &lt;hero-details _nghost-pmm-5>
    &lt;h2 _ngcontent-pmm-5>Mister Fantastic&lt;/h2>
    &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6>
      &lt;h3 _ngcontent-pmm-6>Team&lt;/h3>
    &lt;/hero-team>
  &lt;/hero-detail>

</code-example>

There are two kinds of generated attributes:

* An element that would be a shadow DOM host in native encapsulation has a
  generated `_nghost` attribute. This is typically the case for component host elements.
* An element within a component's view has a `_ngcontent` attribute
that identifies to which host's emulated shadow DOM this element belongs.

The exact values of these attributes aren't important. They are automatically
generated and you never refer to them in application code. But they are targeted
by the generated component styles, which are in the `<head>` section of the DOM:

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

These styles are post-processed so that each selector is augmented
with `_nghost` or `_ngcontent` attribute selectors.
These extra selectors enable the scoping rules described in this page.
