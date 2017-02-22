@title
Component Styles

@intro
Learn how to apply CSS styles to components.

@description
Angular applications are styled with regular CSS. That means we can apply
everything we know about CSS stylesheets, selectors, rules, and media queries
to our Angular applications directly.

On top of this, Angular has the ability to bundle *component styles*
with our components enabling a more modular design than regular stylesheets.

In this chapter we learn how to load and apply these *component styles*.

## Table Of Contents

* [Using Component Styles](#using-component-styles)
* [Special selectors](#special-selectors)
* [Loading Styles into Components](#loading-styles)
* [Controlling View Encapsulation: Emulated, Native, and None](#view-encapsulation)
* [Appendix 1: Inspecting the generated runtime component styles](#inspect-generated-css)
* [Appendix 2: Loading Styles with Relative URLs](#relative-urls)

Run the <live-example></live-example> of the code shown in this chapter.

## Using Component Styles

For every Angular component we write, we may define not only an HTML template,
but also the CSS styles that go with that template, 
specifying any selectors, rules, and media queries that we need.

One way to do this is to set the `styles` property in the component metadata.
The `styles` property takes #{_an} #{_array} of strings that contain CSS code.
Usually we give it one string as in this example:


{@example 'component-styles/ts/src/app/hero-app.component.ts'}

Component styles differ from traditional, global styles in a couple of ways.

Firstly, the selectors we put into a component's styles *only apply within the template
of that component*. The `h1` selector in the example above only applies to the `<h1>` tag
in the template of `HeroAppComponent`. Any `<h1>` elements elsewhere in
the application are unaffected.

This is a big improvement in modularity compared to how CSS traditionally works:

1. We can use the CSS class names and selectors that make the most sense in the context of each component. 
   
1. Class names and selectors are local to the component and won't collide with 
classes and selectors used elsewhere in the application.
   
1. Our component's styles *cannot* be changed by changes to styles elsewhere in the application.
   
1. We can co-locate the CSS code of each component with the TypeScript and HTML code of the component,
   which leads to a neat and tidy project structure.
   
1. We can change or remove component CSS code in the future without trawling through the
   whole application to see where else it may have been used. We just look at the component we're in.


{@a special-selectors}

## Special selectors

Component styles have a few special *selectors* from the world of 
[shadow DOM style scoping](https://www.w3.org/TR/css-scoping-1):

### :host

Use the `:host` pseudo-class selector to target styles in the element that *hosts* the component (as opposed to
targeting elements *inside* the component's template):


{@example 'component-styles/ts/src/app/hero-details.component.css' region='host'}

This is the *only* way we can target the host element. We cannot reach
it from inside the component with other selectors, because it is not part of the
component's own template. It is in a parent component's template.

Use the *function form* to apply host styles conditionally by 
including another selector inside parentheses after `:host`.

In the next example we target the host element again, but only when it also has the `active` CSS class.


{@example 'component-styles/ts/src/app/hero-details.component.css' region='hostfunction'}

### :host-context

Sometimes it is useful to apply styles based on some condition *outside* a component's view.
For example, there may be a CSS theme class applied to the document `<body>` element, and
we want to change how our component looks based on that.

Use the `:host-context()` pseudo-class selector. It works just like the function
form of `:host()`. It looks for a CSS class in *any ancestor* of the component host element, all the way
up to the document root. It's useful when combined with another selector.

In the following example, we apply a `background-color` style to all `<h2>` elements *inside* the component, only
if some ancestor element has the CSS class `theme-light`.


{@example 'component-styles/ts/src/app/hero-details.component.css' region='hostcontext'}

### /deep/

Component styles normally apply only to the HTML in the component's own template. 

We can use the `/deep/` selector to force a style down through the child component tree into all the child component views.
The `/deep/` selector works to any depth of nested components, and it applies *both to the view
children and the content children* of the component. 

In this example, we target all `<h3>` elements, from the host element down 
through this component to all of its child elements in the DOM: 

{@example 'component-styles/ts/src/app/hero-details.component.css' region='deep'}

The `/deep/` selector also has the alias `>>>`. We can use either of the two interchangeably.


~~~ {.alert.is-important}

The `/deep/` and `>>>` selectors should only be used with **emulated** view encapsulation.
This is the default and it is what we use most of the time. See the
[Controlling View Encapsulation](#view-encapsulation)
section for more details.


~~~



{@a loading-styles}

## Loading Styles into Components

We have several ways to add styles to a component: 
* inline in the template HTML
* by setting `styles` or `styleUrls` metadata
* with CSS imports

The scoping rules outlined above apply to each of these loading patterns.

### Styles in Metadata

We can add a `styles` #{_array} property to the `@Component` #{_decorator}.
Each string in the #{_array} (usually just one string) defines the CSS.


{@example 'component-styles/ts/src/app/hero-app.component.ts'}

### Template Inline Styles

We can embed styles directly into the HTML template by putting them
inside `<style>` tags.


{@example 'component-styles/ts/src/app/hero-controls.component.ts' region='inlinestyles'}

### Style URLs in Metadata

We can load styles from external CSS files by adding a `styleUrls` attribute
into a component's `@Component` #{_decorator}:


{@example 'component-styles/ts/src/app/hero-details.component.ts' region='styleurls'}

### Template Link Tags

We can also embed `<link>` tags into the component's HTML template. 

As with `styleUrls`, the link tag's `href` URL is relative to the 
application root, not relative to the component file.


{@example 'component-styles/ts/src/app/hero-team.component.ts' region='stylelink'}

### CSS @imports

We can also import CSS files into our CSS files by using the standard CSS
[`@import` rule](https://developer.mozilla.org/en/docs/Web/CSS/@import).


{@example 'component-styles/ts/src/app/hero-details.component.css' region='import'}



{@a view-encapsulation}

## Controlling View Encapsulation: Native, Emulated, and None

As discussed above, component CSS styles are *encapsulated* into the component's own view and do
not affect the rest of the application.

We can control how this encapsulation happens on a *per
component* basis by setting the *view encapsulation mode* in the component metadata. There
are three modes to choose from:

* `Native` view encapsulation uses the browser's native [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
  implementation to attach a Shadow DOM to the component's host element, and then puts the component
  view inside that Shadow DOM. The component's styles are included within the Shadow DOM.
  
* `Emulated` view encapsulation (**the default**) emulates the behavior of Shadow DOM by preprocessing
  (and renaming) the CSS code to effectively scope the CSS to the component's view.
  See [Appendix 1](#inspect-generated-css) for details.
  
* `None` means that Angular does no view encapsulation. 
  Angular adds the CSS to the global styles. 
  The scoping rules, isolations, and protections discussed earlier do not apply. 
  This is essentially the same as pasting the component's styles into the HTML.
  
Set the components encapsulation mode using the `encapsulation` property in the component metadata:


{@example 'component-styles/ts/src/app/quest-summary.component.ts' region='encapsulation.native'}

`Native` view encapsulation only works on [browsers that have native support
for Shadow DOM](http://caniuse.com/#feat=shadowdom). The support is still limited,
which is why `Emulated` view encapsulation is the default mode and recommended
in most cases.


{@a inspect-generated-css}

## Appendix 1: Inspecting The CSS Generated in Emulated View Encapsulation

When using the default emulated view encapsulation, Angular preprocesses
all component styles so that they approximate the standard Shadow CSS scoping rules.

When we inspect the DOM of a running Angular application with emulated view
encapsulation enabled, we see that each DOM element has some extra attributes
attached to it:

<code-example format="">
  &lt;hero-details _nghost-pmm-5>  
      &lt;h2 _ngcontent-pmm-5>Mister Fantastic&lt;/h2>  
      &lt;hero-team _ngcontent-pmm-5 _nghost-pmm-6>  
        &lt;h3 _ngcontent-pmm-6>Team&lt;/h3>  
      &lt;/hero-team>  
    &lt;/hero-detail>  
    
</code-example>

We see two kinds of generated attributes:
* An element that would be a Shadow DOM host in native encapsulation has a
  generated `_nghost` attribute. This is typically the case for component host elements.
  
* An element within a component's view has a `_ngcontent` attribute 
that identifies to which host's emulated Shadow DOM this element belongs.

The exact values of these attributes are not important. They are automatically
generated and we never refer to them in application code. But they are targeted
by the generated component styles, which we'll find in the `<head>` section of the DOM:

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

These are the styles we wrote, post-processed so that each selector is augmented
with `_nghost` or `_ngcontent` attribute selectors. 
These extra selectors enable the scoping rules described in this guide.

We'll likely live with *emulated* mode until shadow DOM gains traction.


{@a relative-urls}

## Appendix 2: Loading Styles with Relative URLs

It's common practice to split a component's code, HTML, and CSS into three separate files in the same directory:
<code-example format="nocode">
  quest-summary.component.ts  
    quest-summary.component.html  
    quest-summary.component.css  
    
</code-example>

We include the template and CSS files by setting the `templateUrl` and `styleUrls` metadata properties respectively.
Because these files are co-located with the component,
it would be nice to refer to them by name without also having to specify a path back to the root of the application.
