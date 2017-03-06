@title
Attribute Directives

@intro
Attribute directives attach behavior to elements.

@description
An **Attribute** directive changes the appearance or behavior of a DOM element.

# Contents


* [Directives overview](#directive-overview)
* [Build a simple attribute directive](#write-directive)
* [Apply the attribute directive to an element in a template](#apply-directive)
* [Respond to user-initiated events](#respond-to-user)
* [Pass values into the directive with an _@Input_ data binding](#bindings)
* [Bind to a second property](#second-property)

Try the <live-example title="Attribute Directive example"></live-example>.



{@a directive-overview}
## Directives overview

There are three kinds of directives in Angular:

1. Components&mdash;directives with a template.
1. Structural directives&mdash;change the DOM layout by adding and removing DOM elements.
1. Attribute directives&mdash;change the appearance or behavior of an element, component, or another directive.

*Components* are the most common of the three directives.
You saw a component for the first time in the [QuickStart](../quickstart.html) guide.

*Structural Directives* change the structure of the view.
Two examples are [NgFor](template-syntax.html#ngFor) and [NgIf](template-syntax.html#ngIf).
Learn about them in the [Structural Directives](structural-directives.html) guide.

*Attribute directives* are used as attributes of elements.
The built-in [NgStyle](template-syntax.html#ngStyle) directive in the [Template Syntax](template-syntax.html) guide, for example,
can change several element styles at the same time.



{@a write-directive}
## Build a simple attribute directive
An attribute directive minimally requires building a controller class annotated with
`@Directive`, which specifies the selector that identifies
the attribute.
The controller class implements the desired directive behavior.

This page demonstrates building a simple _myHighlight_ attribute
directive to set an element's background color
when the user hovers over that element. You can apply it like this:


{@example 'attribute-directives/ts/src/app/app.component.1.html' region='applied'}

### Write the directive code
Follow the [setup](setup.html) instructions for creating a new local project
named <span ngio-ex>attribute-directives</span>.
Create the following source file in `src/app` with the following code:

{@example 'attribute-directives/ts/src/app/highlight.directive.1.ts'}

`@Directive` requires a CSS selector to identify
the HTML in the template that is associated with the directive.
The [CSS selector for an attribute](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)
is the attribute name in square brackets.
Here, the directive's selector is `[myHighlight]`.
Angular locates all elements in the template that have an attribute named `myHighlight`.
### Why not call it "highlight"?
Though *highlight* is a more concise name than *myHighlight* and would work,
a best practice is to prefix selector names to ensure
they don't conflict with  standard HTML attributes.
This also reduces the risk of colliding with third-party directive names.

Make sure you do **not** prefix the `highlight` directive name with **`ng`** because
that prefix is reserved for Angular and using it could cause bugs that are difficult to diagnose. For a simple demo, the short prefix, `my`, helps distinguish your custom directive.

<p>
  After the   <code>  @Directive  </code>   metadata comes the directive's controller class, called   <code>  HighlightDirective  </code>  , which contains the logic for the directive.
</p>

Angular creates a new instance of the directive's controller class for
each matching element, injecting an Angular `ElementRef`
into the constructor.
`ElementRef` is a service that grants direct access to the DOM element
through its `nativeElement` property.



{@a apply-directive}
## Apply the attribute directive
To use the new `HighlightDirective`, create a template that
applies the directive as an attribute to a paragraph (`<p>`) element.
In Angular terms, the `<p>` element is the attribute **host**.
<p>
  Put the template in its own  <code>      </code>  file that looks like this:
</p>



{@example 'attribute-directives/ts/src/app/app.component.1.html'}

Now reference this template in the `AppComponent`:

{@example 'attribute-directives/ts/src/app/app.component.ts'}

Next, add an `import` statement to fetch the `Highlight` directive and
add that class to the `declarations` NgModule metadata. This way Angular
recognizes the directive when it encounters `myHighlight` in the template.

{@example 'attribute-directives/ts/src/app/app.module.ts'}

Now when the app runs, the `myHighlight` directive highlights the paragraph text.

<figure class='image-display'>
  <img src="assets/images/devguide/attribute-directives/first-highlight.png" alt="First Highlight">  </img>
</figure>


### Your directive isn't working?

Did you remember to add the directive to the `declarations` attribute of `@NgModule`? It is easy to forget!
Open the console in the browser tools and look for an error like this:
<code-example format="nocode">
  EXCEPTION: Template parse errors:  
      Can't bind to 'myHighlight' since it isn't a known property of 'p'.  
    
</code-example>

Angular detects that you're trying to bind to *something* but it can't find this directive
in the module's `declarations` array.
After specifying `HighlightDirective` in the `declarations` array,
Angular knows it can apply the directive to components declared in this module.
To summarize, Angular found the `myHighlight` attribute on the `<p>` element.
It created an instance of the `HighlightDirective` class and
injected a reference to the `<p>` element into the directive's constructor
which sets the `<p>` element's background style to yellow.



{@a respond-to-user}
## Respond to user-initiated events

Currently, `myHighlight` simply sets an element color.
The directive could be more dynamic.
It could detect when the user mouses into or out of the element
and respond by setting or clearing the highlight color.

Begin by adding `HostListener` to the list of imported symbols;
add the `Input` symbol as well because you'll need it soon.

{@example 'attribute-directives/ts/src/app/highlight.directive.ts' region='imports'}

Then add two eventhandlers that respond when the mouse enters or leaves, each adorned by the `HostListener` !{_decorator}.

{@example 'attribute-directives/ts/src/app/highlight.directive.2.ts' region='mouse-methods'}

The `@HostListener` !{_decorator} lets you subscribe to events of the DOM element that hosts an attribute directive, the `<p>` in this case.

Of course you could reach into the DOM with standard JavaScript and and attach event listeners manually.
There are at least three problems with _that_ approach:

1. You have to write the listeners correctly.
1. The code must *detach* the listener when the directive is destroyed to avoid memory leaks.
1. Talking to DOM API directly isn't a best practice.
The handlers delegate to a helper method that sets the color on the DOM element, `#{_priv}el`,
which you declare and initialize in the constructor.


{@example 'attribute-directives/ts/src/app/highlight.directive.2.ts' region='ctor'}

Here's the updated directive in full:

{@example 'attribute-directives/ts/src/app/highlight.directive.2.ts'}

Run the app and confirm that the background color appears when the mouse hovers over the `p` and
disappears as it moves out.
<figure class='image-display'>
  <img src="assets/images/devguide/attribute-directives/highlight-directive-anim.gif" alt="Second Highlight">  </img>
</figure>




{@a bindings}
## Pass values into the directive with an _@Input_ data binding

Currently the highlight color is hard-coded _within_ the directive. That's inflexible.
In this section, you give the developer the power to set the highlight color while applying the directive.

Start by adding a `highlightColor` property to the directive class like this:

{@example 'attribute-directives/ts/src/app/highlight.directive.2.ts' region='color'}



{@a input}
### Binding to an _@Input_ property

Notice the `@Input` !{_decorator}. It adds metadata to the class that makes the directive's `highlightColor` property available for binding.

It's called an *input* property because data flows from the binding expression _into_ the directive.
Without that input metadata, Angular rejects the binding; see [below](#why-input "Why add @Input?") for more about that.

Try it by adding the following directive binding variations to the `AppComponent` template:

{@example 'attribute-directives/ts/src/app/app.component.1.html' region='color-1'}

Add a `color` property to the `AppComponent`.

{@example 'attribute-directives/ts/src/app/app.component.1.ts' region='class'}

Let it control the highlight color with a property binding.

{@example 'attribute-directives/ts/src/app/app.component.1.html' region='color-2'}

That's good, but it would be nice to _simultaneously_ apply the directive and set the color _in the same attribute_ like this.

{@example 'attribute-directives/ts/src/app/app.component.html' region='color'}

The `[myHighlight]` attribute binding both applies the highlighting directive to the `<p>` element
and sets the directive's highlight color with a property binding.
You're re-using the directive's attribute selector (`[myHighlight]`) to do both jobs.
That's a crisp, compact syntax.

You'll have to rename the directive's `highlightColor` property to `myHighlight` because that's now the color property binding name.

{@example 'attribute-directives/ts/src/app/highlight.directive.2.ts' region='color-2'}

This is disagreeable. The word, `myHighlight`, is a terrible property name and it doesn't convey the property's intent.


{@a input-alias}
### Bind to an _@Input_ alias

Fortunately you can name the directive property whatever you want _and_ **_alias it_** for binding purposes.

Restore the original property name and specify the selector as the alias in the argument to `@Input`.
_Inside_ the directive the property is known as `highlightColor`.
_Outside_ the directive, where you bind to it, it's known as `myHighlight`.

You get the best of both worlds: the property name you want and the binding syntax you want:

{@example 'attribute-directives/ts/src/app/app.component.html' region='color'}

Now that you're binding to `highlightColor`, modify the `onMouseEnter()` method to use it.
If someone neglects to bind to `highlightColor`, highlight in "red" by default.


{@example 'attribute-directives/ts/src/app/highlight.directive.3.ts' region='mouse-enter'}

Here's the latest version of the directive class.## Write a harness to try itIt may be difficult to imagine how this directive actually works.
In this section, you'll turn `AppComponent` into a harness that
lets you pick the highlight color with a radio button and bind your color choice to the directive.

Update `app.component.html` as follows:
Revise the `AppComponent.color` so that it has no initial value.Here is the harness and directive in action.
<figure class='image-display'>
  <img src="assets/images/devguide/attribute-directives/highlight-directive-v2-anim.gif" alt="Highlight v.2">  </img>
</figure>




{@a second-property}
## Bind to a second property
This highlight directive has a single customizable property. In a real app, it may need more.

At the moment, the default color&mdash;the color that prevails until 
the user picks a highlight color&mdash;is hard-coded as "red". 
Let the template developer set the default color.

Add a second **input** property to `HighlightDirective` called `defaultColor`:Revise the directive's `onMouseEnter` so that it first tries to highlight with the `highlightColor`,
then with the `defaultColor`, and falls back to "red" if both properties are undefined.

{@example 'attribute-directives/ts/src/app/highlight.directive.ts' region='mouse-enter'}

How do you bind to a second property when you're already binding to the `myHighlight` attribute name?

As with components, you can add as many directive property bindings as you need by stringing them along in the template.
The developer should be able to write the following template HTML to both bind to the `AppComponent.color`
and fall back to "violet" as the default color.

{@example 'attribute-directives/ts/src/app/app.component.html' region='defaultColor'}

Angular knows that the `defaultColor` binding belongs to the `HighlightDirective`
because you made it _public_ with the `@Input` !{_decorator}.

Here's how the harness should work when you're done coding.
<figure class='image-display'>
  <img src="assets/images/devguide/attribute-directives/highlight-directive-final-anim.gif" alt="Final Highlight">  </img>
</figure>


## Summary
This page covered how to:
- [Build an **attribute directive**](#write-directive) that modifies the behavior of an element.
- [Apply the directive](#apply-directive) to an element in a template.
- [Respond to **events**](#respond-to-user) that change the directive's behavior.
- [**Bind** values to the directive](#bindings).

The final source code follows:

<md-tab-group>

  <md-tab label="app/app.component.ts">
    {@example 'attribute-directives/ts/src/app/app.component.ts'}
  </md-tab>


  <md-tab label="app/app.component.html">
    {@example 'attribute-directives/ts/src/app/app.component.html'}
  </md-tab>


  <md-tab label="app/highlight.directive.ts">
    {@example 'attribute-directives/ts/src/app/highlight.directive.ts'}
  </md-tab>


  <md-tab label="app/app.module.ts">
    {@example 'attribute-directives/ts/src/app/app.module.ts'}
  </md-tab>


  <md-tab label="main.ts">
    {@example 'attribute-directives/ts/src/main.ts'}
  </md-tab>


  <md-tab label="index.html">
    {@example 'attribute-directives/ts/src/index.html'}
  </md-tab>


</md-tab-group>

You can also experience and download the <live-example title="Attribute Directive example"></live-example>.


{@a why-input}

### Appendix: Why add _@Input_?

In this demo, the `hightlightColor` property is an ***input*** property of
the `HighlightDirective`. You've seen it applied without an alias:

{@example 'attribute-directives/ts/src/app/highlight.directive.2.ts' region='color'}

You've seen it with an alias:

{@example 'attribute-directives/ts/src/app/highlight.directive.ts' region='color'}

Either way, the `@Input` !{_decorator} tells Angular that this property is
_public_ and available for binding by a parent component.
Without  `@Input`, Angular refuses to bind to the property.

You've bound template HTML to component properties before and never used `@Input`.
What's different?

The difference is a matter of trust.
Angular treats a component's template as _belonging_ to the component.
The component and its template trust each other implicitly.
Therefore, the component's own template may bind to _any_ property of that component,
with or without the `@Input` !{_decorator}.

But a component or directive shouldn't blindly trust _other_ components and directives.
The properties of a component or directive are hidden from binding by default.
They are _private_ from an Angular binding perspective.
When adorned with the `@Input` !{_decorator}, the property becomes _public_ from an Angular binding perspective.
Only then can it be bound by some other component or directive.

You can tell if `@Input` is needed by the position of the property name in a binding.

* When it appears in the template expression to the ***right*** of the equals (=),
it belongs to the template's component and does not require the `@Input` !{_decorator}.

* When it appears in **square brackets** ([ ]) to the **left** of the equals (=),
the property belongs to some _other_ component or directive;
that property must be adorned with the `@Input` !{_decorator}.

Now apply that reasoning to the following example:

{@example 'attribute-directives/ts/src/app/app.component.html' region='color'}

* The `color` property in the expression on the right belongs to the template's component.
The template and its component trust each other.
The `color` property doesn't require the `@Input` !{_decorator}.

* The `myHighlight` property on the left refers to an _aliased_ property of the `MyHighlightDirective`,
not a property of the template's component. There are trust issues.
Therefore, the directive property must carry the `@Input` !{_decorator}.