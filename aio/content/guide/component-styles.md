# Component Styles

Angular applications are styled with standard CSS. That means you can apply
everything you know about CSS stylesheets, selectors, rules, and media queries
directly to Angular applications.

Additionally, Angular can bundle *component styles*
with components, enabling a more modular design than regular stylesheets.

This page describes how to load and apply these component styles.

<!--

## Table Of Contents

* [Using component styles](guide/component-styles#using-component-styles)
* [Special selectors](guide/component-styles#special-selectors)
* [Loading styles into components](guide/component-styles#loading-styles)
* [Controlling view encapsulation: native, emulated, and none](guide/component-styles#view-encapsulation)
* [Appendix 1: Inspecting the CSS generated in emulated view encapsulation](guide/component-styles#inspect-generated-css)
* [Appendix 2: Loading styles with relative URLs](guide/component-styles#relative-urls)

-->

You can run the <live-example></live-example> in Plunker and download the code from there.



## Using component styles

For every Angular component you write, you may define not only an HTML template,
but also the CSS styles that go with that template, 
specifying any selectors, rules, and media queries that you need.

One way to do this is to set the `styles` property in the component metadata.
The `styles` property takes an array of strings that contain CSS code.
Usually you give it one string, as in the following example:


<code-example path="component-styles/src/app/hero-app.component.ts" title="src/app/hero-app.component.ts" linenums="false">

</code-example>



The selectors you put into a component's styles apply only within the template
of that component. The `h1` selector in the preceding example applies only to the `<h1>` tag
in the template of `HeroAppComponent`. Any `<h1>` elements elsewhere in
the application are unaffected.

This is a big improvement in modularity compared to how CSS traditionally works.

* You can use the CSS class names and selectors that make the most sense in the context of each component. 
* Class names and selectors are local to the component and don't collide with 
  classes and selectors used elsewhere in the application.
* Changes to styles elsewhere in the application don't affect the component's styles.
* You can co-locate the CSS code of each component with the TypeScript and HTML code of the component,
  which leads to a neat and tidy project structure.
* You can change or remove component CSS code without searching through the
  whole application to find where else the code is used.


{@a special-selectors}



## Special selectors

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



### /deep/

Component styles normally apply only to the HTML in the component's own template. 

Use the `/deep/` selector to force a style down through the child component tree into all the child component views.
The `/deep/` selector works to any depth of nested components, and it applies to both the view
children and content children of the component. 

The following example targets all `<h3>` elements, from the host element down 
through this component to all of its child elements in the DOM. 

<code-example path="component-styles/src/app/hero-details.component.css" region="deep" title="src/app/hero-details.component.css" linenums="false">

</code-example>

The `/deep/` selector also has the alias `>>>`. You can use either interchangeably.


<div class="alert is-important">

Use the `/deep/` and `>>>` selectors only with *emulated* view encapsulation.
Emulated is the default and most commonly used view encapsulation. For more information, see the
[Controlling view encapsulation](guide/component-styles#view-encapsulation) section.

</div>

{@a loading-styles}

## Loading component styles

There are several ways to add styles to a component: 

* By setting `styles` or `styleUrls` metadata.
* Inline in the template HTML.
* With CSS imports.

The scoping rules outlined earlier apply to each of these loading patterns.

### Styles in metadata

You can add a `styles` array property to the `@Component` decorator.
Each string in the array (usually just one string) defines the CSS.


<code-example path="component-styles/src/app/hero-app.component.ts" title="src/app/hero-app.component.ts">

</code-example>



### Style URLs in metadata

You can load styles from external CSS files by adding a `styleUrls` attribute
into a component's `@Component` decorator:


<code-example path="component-styles/src/app/hero-details.component.ts" region="styleurls" title="src/app/hero-details.component.ts">

</code-example>



<div class="alert is-important">



The URL is relative to the *application root*, which is usually the
location of the `index.html` web page that hosts the application. 
The style file URL is *not* relative to the component file.
That's why the example URL begins `src/app/`.
To specify a URL relative to the component file, see [Appendix 2](guide/component-styles#relative-urls).


</div>



<div class="l-sub-section">



If you use module bundlers like Webpack, you can also use the `styles` attribute
to load styles from external files at build time. You could write:

`styles: [require('my.component.css')]`

Set the `styles` property, not the `styleUrls` property. The module 
bundler loads the CSS strings, not Angular. 
Angular sees the CSS strings only after the bundler loads them. 
To Angular, it's as if you wrote the `styles` array by hand. 
For information on loading CSS in this manner, refer to the module bundler's documentation.


</div>



### Template inline styles

You can embed styles directly into the HTML template by putting them
inside `<style>` tags.


<code-example path="component-styles/src/app/hero-controls.component.ts" region="inlinestyles" title="src/app/hero-controls.component.ts">

</code-example>



### Template link tags

You can also embed `<link>` tags into the component's HTML template. 

As with `styleUrls`, the link tag's `href` URL is relative to the 
application root, not the component file.


<code-example path="component-styles/src/app/hero-team.component.ts" region="stylelink" title="src/app/hero-team.component.ts">

</code-example>



### CSS @imports

You can also import CSS files into the CSS files using the standard CSS `@import` rule.
For details, see [`@import`](https://developer.mozilla.org/en/docs/Web/CSS/@import)
on the [MDN](https://developer.mozilla.org) site.


In this case, the URL is relative to the CSS file into which you're importing.


<code-example path="component-styles/src/app/hero-details.component.css" region="import" title="src/app/hero-details.component.css (excerpt)">

</code-example>



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



## Appendix: Inspecting generated CSS

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


{@a relative-urls}



## Appendix: Loading with relative URLs

It's common practice to split a component's code, HTML, and CSS into three separate files in the same directory:

<code-example format="nocode">
  quest-summary.component.ts
  quest-summary.component.html
  quest-summary.component.css

</code-example>



You include the template and CSS files by setting the `templateUrl` and `styleUrls` metadata properties respectively.
Because these files are co-located with the component,
it would be nice to refer to them by name without also having to specify a path back to the root of the application.


You can use a relative URL by prefixing your filenames with `./`:


<code-example path="component-styles/src/app/quest-summary.component.ts" title="src/app/quest-summary.component.ts">

</code-example>

