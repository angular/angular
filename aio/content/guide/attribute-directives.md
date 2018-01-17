# Attribute Directives

An **Attribute** directive changes the appearance or behavior of a DOM element.

Try the <live-example title="Attribute Directive example"></live-example>.

{@a directive-overview}

## Directives overview

There are three kinds of directives in Angular:

1. Components&mdash;directives with a template.
1. Structural directives&mdash;change the DOM layout by adding and removing DOM elements.
1. Attribute directives&mdash;change the appearance or behavior of an element, component, or another directive.

*Components* are the most common of the three directives.
You saw a component for the first time in the [QuickStart](guide/quickstart) guide.

*Structural Directives* change the structure of the view.
Two examples are [NgFor](guide/template-syntax#ngFor) and [NgIf](guide/template-syntax#ngIf).
Learn about them in the [Structural Directives](guide/structural-directives) guide.

*Attribute directives* are used as attributes of elements.
The built-in [NgStyle](guide/template-syntax#ngStyle) directive in the
[Template Syntax](guide/template-syntax) guide, for example,
can change several element styles at the same time.

## Build a simple attribute directive

An attribute directive minimally requires building a controller class annotated with
`@Directive`, which specifies the selector that identifies
the attribute.
The controller class implements the desired directive behavior.

This page demonstrates building a simple _appHighlight_ attribute
directive to set an element's background color
when the user hovers over that element. You can apply it like this:

<code-example path="attribute-directives/src/app/app.component.1.html" linenums="false" title="src/app/app.component.html (applied)" region="applied"></code-example>

{@a write-directive}

### Write the directive code

Create the directive class file in a terminal window with this CLI command.

<code-example language="sh" class="code-shell">
ng generate directive highlight
</code-example>

The CLI creates `src/app/highlight.directive.ts`, a corresponding test file (`.../spec.ts`, and _declares_ the directive class in the root `AppModule`.

<div class="l-sub-section">

_Directives_ must be declared in [Angular Modules](guide/ngmodules) in the same manner as _components_.

</div >

The generated `src/app/highlight.directive.ts` is as follows:

<code-example path="attribute-directives/src/app/highlight.directive.0.ts" title="src/app/highlight.directive.ts"></code-example>

The imported `Directive` symbol provides the Angular the `@Directive` decorator.

The `@Directive` decorator's lone configuration property specifies the directive's
[CSS attribute selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors), `[appHighlight]`.

It's the brackets (`[]`) that make it an attribute selector.
Angular locates each element in the template that has an attribute named `appHighlight` and applies the logic of this directive to that element.

The _attribute selector_ pattern explains the name of this kind of directive.

<div class="l-sub-section">

#### Why not "highlight"?

Though *highlight* would be a more concise selector than *appHighlight* and it would work,
the best practice is to prefix selector names to ensure
they don't conflict with standard HTML attributes.
This also reduces the risk of colliding with third-party directive names.
The CLI added the `app` prefix for you.

Make sure you do **not** prefix the `highlight` directive name with **`ng`** because
that prefix is reserved for Angular and using it could cause bugs that are difficult to diagnose.

</div>

After the `@Directive` metadata comes the directive's controller class,
called `HighlightDirective`, which contains the (currently empty) logic for the directive.
Exporting `HighlightDirective` makes the directive accessible.

Now edit the generated `src/app/highlight.directive.ts` to look as follows:

<code-example path="attribute-directives/src/app/highlight.directive.1.ts" title="src/app/highlight.directive.ts"></code-example>

The `import` statement specifies an additional `ElementRef` symbol from the Angular `core` library:

You use the `ElementRef`in the directive's constructor
to [inject](guide/dependency-injection) a reference to the host DOM element, 
the element to which you applied `appHighlight`.

`ElementRef` grants direct access to the host DOM element
through its `nativeElement` property.

This first implementation sets the background color of the host element to yellow.

{@a apply-directive}

## Apply the attribute directive

To use the new `HighlightDirective`, add a paragraph (`<p>`) element to the template of the root `AppComponent` and apply the directive as an attribute.

<code-example path="attribute-directives/src/app/app.component.1.html" title="src/app/app.component.html" region="applied"></code-example>

Now run the application to see the `HighlightDirective` in action.


<code-example language="sh" class="code-shell">
ng serve
</code-example>

To summarize, Angular found the `appHighlight` attribute on the **host** `<p>` element.
It created an instance of the `HighlightDirective` class and
injected a reference to the `<p>` element into the directive's constructor
which sets the `<p>` element's background style to yellow.

{@a respond-to-user}

## Respond to user-initiated events

Currently, `appHighlight` simply sets an element color.
The directive could be more dynamic.
It could detect when the user mouses into or out of the element
and respond by setting or clearing the highlight color.

Begin by adding `HostListener` to the list of imported symbols.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" title="src/app/highlight.directive.ts (imports)" region="imports"></code-example>

Then add two eventhandlers that respond when the mouse enters or leaves,
each adorned by the `HostListener` decorator.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" title="src/app/highlight.directive.ts (mouse-methods)" region="mouse-methods"></code-example>

The `@HostListener` decorator lets you subscribe to events of the DOM
element that hosts an attribute directive, the `<p>` in this case.

<div class="l-sub-section">

Of course you could reach into the DOM with standard JavaScript and attach event listeners manually.
There are at least three problems with _that_ approach:

1. You have to write the listeners correctly.
1. The code must *detach* the listener when the directive is destroyed to avoid memory leaks.
1. Talking to DOM API directly isn't a best practice.

</div>

The handlers delegate to a helper method that sets the color on the host DOM element, `el`.

The helper method, `highlight`, was extracted from the constructor.
The revised constructor simply declares the injected `el: ElementRef`.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" title="src/app/highlight.directive.ts (constructor)" region="ctor"></code-example>

Here's the updated directive in full:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" title="src/app/highlight.directive.ts"></code-example>

Run the app and confirm that the background color appears when
the mouse hovers over the `p` and disappears as it moves out.

<figure>
  <img src="generated/images/guide/attribute-directives/highlight-directive-anim.gif" alt="Second Highlight">
</figure>

{@a bindings}

## Pass values into the directive with an _@Input_ data binding

Currently the highlight color is hard-coded _within_ the directive. That's inflexible.
In this section, you give the developer the power to set the highlight color while applying the directive.

Begin by adding `Input` to the list of symbols imported from `@angular/core`.
<code-example path="attribute-directives/src/app/highlight.directive.3.ts" linenums="false" title="src/app/highlight.directive.ts (imports)" region="imports"></code-example>

Add a `highlightColor` property to the directive class like this:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" title="src/app/highlight.directive.ts (highlightColor)" region="color"></code-example>

{@a input}

### Binding to an _@Input_ property

Notice the `@Input` decorator. It adds metadata to the class that makes the directive's `highlightColor` property available for binding.

It's called an *input* property because data flows from the binding expression _into_ the directive.
Without that input metadata, Angular rejects the binding; see [below](guide/attribute-directives#why-input "Why add @Input?") for more about that.

Try it by adding the following directive binding variations to the `AppComponent` template:

<code-example path="attribute-directives/src/app/app.component.1.html" linenums="false" title="src/app/app.component.html (excerpt)" region="color-1"></code-example>

Add a `color` property to the `AppComponent`.

<code-example path="attribute-directives/src/app/app.component.1.ts" linenums="false" title="src/app/app.component.ts (class)" region="class"></code-example>

Let it control the highlight color with a property binding.

<code-example path="attribute-directives/src/app/app.component.1.html" linenums="false" title="src/app/app.component.html (excerpt)" region="color-2"></code-example>

That's good, but it would be nice to _simultaneously_ apply the directive and set the color _in the same attribute_ like this.

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (color)" region="color"></code-example>

The `[appHighlight]` attribute binding both applies the highlighting directive to the `<p>` element
and sets the directive's highlight color with a property binding.
You're re-using the directive's attribute selector (`[appHighlight]`) to do both jobs.
That's a crisp, compact syntax.

You'll have to rename the directive's `highlightColor` property to `appHighlight` because that's now the color property binding name.

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" title="src/app/highlight.directive.ts (renamed to match directive selector)" region="color-2"></code-example>

This is disagreeable. The word, `appHighlight`, is a terrible property name and it doesn't convey the property's intent.

{@a input-alias}

### Bind to an _@Input_ alias

Fortunately you can name the directive property whatever you want _and_ **_alias it_** for binding purposes.

Restore the original property name and specify the selector as the alias in the argument to `@Input`.

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" title="src/app/highlight.directive.ts (color property with alias)" region="color"></code-example>

_Inside_ the directive the property is known as `highlightColor`.
_Outside_ the directive, where you bind to it, it's known as `appHighlight`.

You get the best of both worlds: the property name you want and the binding syntax you want:

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (color)" region="color"></code-example>

Now that you're binding via the alias to the `highlightColor`, modify the `onMouseEnter()` method to use that property.
If someone neglects to bind to `appHighlightColor`, highlight the host element in red:

<code-example path="attribute-directives/src/app/highlight.directive.3.ts" linenums="false" title="src/app/highlight.directive.ts (mouse enter)" region="mouse-enter"></code-example>

Here's the latest version of the directive class.

<code-example path="attribute-directives/src/app/highlight.directive.3.ts" linenums="false" title="src/app/highlight.directive.ts (excerpt)"></code-example>

## Write a harness to try it

It may be difficult to imagine how this directive actually works.
In this section, you'll turn `AppComponent` into a harness that
lets you pick the highlight color with a radio button and bind your color choice to the directive.

Update <code>app.component.html</code> as follows:

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (v2)" region="v2"></code-example>

Revise the `AppComponent.color` so that it has no initial value.

<code-example path="attribute-directives/src/app/app.component.ts" linenums="false" title="src/app/app.component.ts (class)" region="class"></code-example>

Here are the harness and directive in action.

<figure>
  <img src="generated/images/guide/attribute-directives/highlight-directive-v2-anim.gif" alt="Highlight v.2">
</figure>

{@a second-property}

## Bind to a second property

This highlight directive has a single customizable property. In a real app, it may need more.

At the moment, the default color&mdash;the color that prevails until
the user picks a highlight color&mdash;is hard-coded as "red".
Let the template developer set the default color.

Add a second **input** property to `HighlightDirective` called `defaultColor`:

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" title="src/app/highlight.directive.ts (defaultColor)" region="defaultColor"></code-example>

Revise the directive's `onMouseEnter` so that it first tries to highlight with the `highlightColor`,
then with the `defaultColor`, and falls back to "red" if both properties are undefined.

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" title="src/app/highlight.directive.ts (mouse-enter)" region="mouse-enter"></code-example>

How do you bind to a second property when you're already binding to the `appHighlight` attribute name?

As with components, you can add as many directive property bindings as you need by stringing them along in the template.
The developer should be able to write the following template HTML to both bind to the `AppComponent.color`
and fall back to "violet" as the default color.

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (defaultColor)" region="defaultColor"></code-example>

Angular knows that the `defaultColor` binding belongs to the `HighlightDirective`
because you made it _public_ with the `@Input` decorator.

Here's how the harness should work when you're done coding.

<figure>
  <img src="generated/images/guide/attribute-directives/highlight-directive-final-anim.gif" alt="Final Highlight">
</figure>

## Summary

This page covered how to:

* [Build an **attribute directive**](guide/attribute-directives#write-directive) that modifies the behavior of an element.
* [Apply the directive](guide/attribute-directives#apply-directive) to an element in a template.
* [Respond to **events**](guide/attribute-directives#respond-to-user) that change the directive's behavior.
* [**Bind** values to the directive](guide/attribute-directives#bindings).

The final source code follows:

<code-tabs>
  <code-pane title="app/app.component.ts" path="attribute-directives/src/app/app.component.ts"></code-pane>
  <code-pane title="app/app.component.html" path="attribute-directives/src/app/app.component.html"></code-pane>
  <code-pane title="app/highlight.directive.ts" path="attribute-directives/src/app/highlight.directive.ts"></code-pane>
  <code-pane title="app/app.module.ts" path="attribute-directives/src/app/app.module.ts"></code-pane>
  <code-pane title="main.ts" path="attribute-directives/src/main.ts"></code-pane>
  <code-pane title="index.html" path="attribute-directives/src/index.html"></code-pane>
</code-tabs>



You can also experience and download the <live-example title="Attribute Directive example"></live-example>.

{@a why-input}

### Appendix: Why add _@Input_?

In this demo, the `highlightColor` property is an ***input*** property of
the `HighlightDirective`. You've seen it applied without an alias:

<code-example path="attribute-directives/src/app/highlight.directive.2.ts" linenums="false" title="src/app/highlight.directive.ts (color)" region="color"></code-example>

You've seen it with an alias:

<code-example path="attribute-directives/src/app/highlight.directive.ts" linenums="false" title="src/app/highlight.directive.ts (color)" region="color"></code-example>

Either way, the `@Input` decorator tells Angular that this property is
_public_ and available for binding by a parent component.
Without  `@Input`, Angular refuses to bind to the property.

You've bound template HTML to component properties before and never used `@Input`.
What's different?

The difference is a matter of trust.
Angular treats a component's template as _belonging_ to the component.
The component and its template trust each other implicitly.
Therefore, the component's own template may bind to _any_ property of that component,
with or without the `@Input` decorator.

But a component or directive shouldn't blindly trust _other_ components and directives.
The properties of a component or directive are hidden from binding by default.
They are _private_ from an Angular binding perspective.
When adorned with the `@Input` decorator, the property becomes _public_ from an Angular binding perspective.
Only then can it be bound by some other component or directive.

You can tell if `@Input` is needed by the position of the property name in a binding.

* When it appears in the template expression to the ***right*** of the equals (=),
  it belongs to the template's component and does not require the `@Input` decorator.

* When it appears in **square brackets** ([ ]) to the **left** of the equals (=),
  the property belongs to some _other_ component or directive;
  that property must be adorned with the `@Input` decorator.

Now apply that reasoning to the following example:

<code-example path="attribute-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (color)" region="color"></code-example>

* The `color` property in the expression on the right belongs to the template's component.
  The template and its component trust each other.
  The `color` property doesn't require the `@Input` decorator.

* The `appHighlight` property on the left refers to an _aliased_ property of the `HighlightDirective`,
  not a property of the template's component. There are trust issues.
  Therefore, the directive property must carry the `@Input` decorator.
