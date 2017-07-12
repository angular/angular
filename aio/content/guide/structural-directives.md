# Structural Directives


This guide provides an in-depth look at how Angular manipulates 
the DOM with **structural directives** and
how you can write your own structural directives to do the same thing. 
For an introduction to structural directives, see the [Structural directives](guide/built-in-directives#structural-directives) 
section of [Built-in Directives](guide/build-in-syntax).

## Prerequisites

You should already be familiar with:

* [Built-in Directives](guide/build-in-syntax).
* [Binding Syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).
* [Event Binding](guide/event-binding).

<hr/>


Try the <live-example></live-example>.

## What are structural directives?

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's _structure_, typically by adding, removing, or manipulating
elements.

As with other directives, you apply a structural directive to a _host element_.
The directive then does whatever it's supposed to do with that host element and its descendents.

Structural directives are easy to recognize because an asterisk (*) precedes the directive attribute name as in this example.

<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngif)" region="ngif">

</code-example>



No brackets. No parentheses. Just `*ngIf` set to a string.

You'll learn in this guide that the [asterisk (*) is a convenience notation](guide/structural-directives#asterisk)
and the string is a [_microsyntax_](guide/structural-directives#microsyntax) rather than the usual
[template expression](guide/template-syntax#template-expressions).
Angular desugars this notation into a marked-up `<ng-template>` that surrounds the
host element and its descendents.
Each structural directive does something different with that template.

Three of the common, built-in structural directives&mdash;[NgIf](guide/template-syntax#ngIf),
[NgFor](guide/template-syntax#ngFor), and [NgSwitch...](guide/template-syntax#ngSwitch)&mdash;are
described in the [_Template Syntax_](guide/template-syntax) guide and are in samples throughout the Angular documentation.
Here's an example of them in a template:


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (built-in)" region="built-in">

</code-example>
<!-- 
KW--If I were learning structural directives, I'd come here first to learn what they are and how to use them. Let's consolidate what's here with the structural directives in Template Syntax. -->

This guide won't repeat how to _use_ them. But it does explain _how they work_
and how to [write your own](guide/structural-directives#unless) structural directive.


<div class="callout is-helpful">

<header>
  Directive spelling
</header>

Throughout this guide, you'll see a directive spelled in both _UpperCamelCase_ and _lowerCamelCase_.

A directive _class_ is spelled in _UpperCamelCase_ (`NgIf`).
A directive's _attribute name_ is spelled in _lowerCamelCase_ (`ngIf`).
The guide refers to the directive _class_ when talking about its properties and what the directive does, but refers to the _attribute name_ when describing how
you apply the directive to an element in the HTML template.

</div>

<div class="l-sub-section">



There are two other kinds of Angular directives:
components and attribute directives.

A *component* manages a region of HTML in the manner of a native HTML element.
Technically it's a directive with a template. For more information, see [Components]().

An [*attribute* directive](guide/attribute-directives) changes the appearance or behavior
of an element, component, or another directive.
For example, the built-in [`NgStyle`](guide/template-syntax#ngStyle) directive
changes several element styles at the same time.

You can apply many _attribute_ directives to one host element.
You can [only apply one](guide/structural-directives#one-per-element) _structural_ directive to a host element.

<!-- KW--Need a place for components to go. -->
For more information, see [Attribute Directives](guide/attribute-directives).

</div>


## NgIf case study

`NgIf` is the simplest structural directive.
It takes a boolean expression and makes an entire chunk of the DOM appear or disappear.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngif-true)" region="ngif-true">

</code-example>



The `ngIf` directive adds and removes elements physically from 
the DOM rather than hiding them with CSS.
You can confirm that fact using browser developer tools to inspect the DOM.


<figure>
  <img src='generated/images/guide/structural-directives/element-not-in-dom.png' alt="ngIf=false element not in DOM">
</figure>



The top paragraph is in the DOM. The bottom, disused paragraph is not;
in its place is a comment about "bindings".  Read more about that in [the asterisk (*) prefix](guide/structural-directives#asterisk) section.

When the condition is false, `NgIf` removes its host element from the DOM,
detaches it from DOM events (the attachments that it made),
detaches the component from Angular change detection, and destroys it.
The component and DOM nodes can be garbage-collected and free up memory.

### Why *remove* rather than *hide*?

A directive could hide the unwanted paragraph instead by setting its `display` style to `none`.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (display-none)" region="display-none">

</code-example>



While invisible, the element remains in the DOM.


<figure>
  <img src='generated/images/guide/structural-directives/element-display-in-dom.png' alt="hidden element still in DOM">
</figure>



The difference between hiding and removing doesn't matter for a simple paragraph, 
but it does matter when the host element is attached to a resource intensive component.
Such a component's behavior continues even when hidden;
the component stays attached to its DOM element and keeps listening to events.
Additionally, Angular keeps checking for changes that could affect data bindings.
Whatever the component was doing, it keeps doing.

Although invisible, the component&mdash;and all of its descendant components&mdash;tie up resources.
The performance and memory burden can be substantial, responsiveness can degrade, and the user sees nothing.

On the positive side, showing the element again is quick.
The component's previous state is preserved and ready to display.
The component doesn't re-initialize&mdash;an operation that could be expensive.
So hiding and showing is sometimes the right thing to do.

But in the absence of a compelling reason to keep them around,
your preference should be to remove DOM elements that the user can't see
and recover the unused resources with a structural directive like `NgIf` .

**These same considerations apply to every structural directive, whether built-in or custom.**
Before applying a structural directive, you might want to pause for a moment
to consider the consequences of adding and removing elements and of creating and destroying components.



## The asterisk (*) prefix

The asterisk, `*`, is a convenient notation in structural directives.
Consider the following example of `*ngIf` displaying the item's name if `item` exists.

```html
<div *ngIf="item" >{{item.name}}</div>
```

<!-- <code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (asterisk)" region="asterisk">

</code-example> -->

The asterisk is syntactic sugar for several steps that Angular is doing behind the scenes.
Internally, Angular desugars it in two stages.
First, it translates the `*ngIf="..."` into a template _attribute_, `template="ngIf ..."`,&nbsp; like this:

```html
<div template="ngIf item">{{item.name}}</div>
```
<!-- 
<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngif-template-attr)" region="ngif-template-attr">

</code-example> -->


Then it translates the template _attribute_ into an `<ng-template>` _element_, wrapped around the host element, like this:

```html
<ng-template [ngIf]="item">
  <div>{{item.name}}</div>
</ng-template>
```

<!-- <code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngif-template)" region="ngif-template">

</code-example> -->


* The `*ngIf` directive moved to the `<ng-template>` element where it became a property binding,`[ngIf]`.
* The rest of the `<div>`, including its class attribute, moved inside the `<ng-template>` element.

None of these forms are actually rendered.
Only the finished product ends up in the DOM.

<!-- KW--we need an item version of this image. -->
<figure>
  <img src='generated/images/guide/structural-directives/hero-div-in-dom.png' alt="hero div in DOM">
</figure>



Angular consumed the `<ng-template>` content during its actual rendering and
replaced the `<ng-template>` with a diagnostic comment.

The [`NgFor`](guide/structural-directives#ngFor) and [`NgSwitch...`](guide/structural-directives#ngSwitch) directives follow the same pattern.


## Inside _*ngFor_

Angular transforms the `*ngFor` in similar fashion from asterisk (*) syntax through
template _attribute_ to `<ng-template>` _element_.

Here's an example of `NgFor` written all three ways:

<!-- KW--we need an item version of this code. Need to update example. -->
<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (inside-ngfor)" region="inside-ngfor">

</code-example>



This is more complicated than `ngIf` because the `NgFor` directive has more 
features, both required and optional, than `NgIf`.
At minimum, `NgFor` needs a looping variable, `let hero`, and a list, `heroes`.

You enable these features in the string assigned to `ngFor`, which you write in Angular's [microsyntax](guide/structural-directives#microsyntax).


<div class="alert is-helpful">

Everything _outside_ the `ngFor` string stays with the host element
(the `<div>`) as it moves inside the `<ng-template>`.
In this example, the `[ngClass]="odd"` stays on the `<div>`.

</div>


### Microsyntax

The Angular microsyntax lets you configure a directive in a compact, friendly string.
The microsyntax parser translates that string into attributes on the `<ng-template>`:

* The `let` keyword declares a [_template input variable_](guide/structural-directives#template-input-variable)
that you reference within the template. The input variables in this example are `hero`, `i`, and `odd`.
The parser translates `let hero`, `let i`, and `let odd` into variables named,
`let-hero`, `let-i`, and `let-odd`.

* The microsyntax parser takes `of` and `trackby`, transforms them to title case (`of` -> `Of`, `trackBy` -> `TrackBy`),
and prefixes them with the directive's attribute name (`ngFor`), yielding the names `ngForOf` and `ngForTrackBy`.
Those are the names of two `NgFor` _input properties_ .
That's how the directive learns that the list is `heroes` and the track-by function is `trackById`.

* As the `NgFor` directive loops through the list, it sets and resets properties of its own _context_ object.
These properties include `index` and `odd` and a special property named `$implicit`.

* The `let-i` and `let-odd` variables were defined as `let i=index` and `let odd=odd`.
Angular sets them to the current value of the context's `index` and `odd` properties.

* The context property for `let-hero` wasn't specified.
It's intended source is implicit.
Angular sets `let-hero` to the value of the context's `$implicit` property
which `NgFor` has initialized with the hero for the current iteration.

* The [API guide](api/common/NgForOf "API: NgFor")
describes additional `NgFor` directive properties and context properties.

These microsyntax mechanisms are available to you when you write your own structural directives.
Studying the
[source code for `NgIf`](https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_if.ts "Source: NgIf")
and [`NgFor`](https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_for_of.ts "Source: NgFor")
is a great way to learn more.



{@a template-input-variable}


{@a template-input-variables}


### Template input variable

A _template input variable_ is a variable whose value you can reference _within_ a single instance of the template.
There are several such variables in this example: `hero`, `i`, and `odd`.
All are preceded by the keyword `let`.

A _template input variable_ is different from a
[template _reference_ variable](guide/template-syntax#template-reference-variables-var),
both _semantically_ and _syntactically_.

You declare a template _input_ variable using the `let` keyword, as in `let hero`.
The variable's scope is limited to a _single instance_ of the repeated template.
You can use the same variable name again in the definition of other structural directives.

You declare a template _reference_ variable by prefixing the variable name with `#`, as in `#var`.
A _reference_ variable refers to its attached element, component or directive.
It can be accessed _anywhere_ in the _entire template_.

Template _input_ and _reference_ variable names have their own namespaces. 
The `hero` in `let hero` is never the same
variable as the `hero` declared as `#hero`.



### One structural directive per host element

You can only put one structural directive on an element because with two 
or more structural directives, Angular has no way of knowing which should take precendence.

As an example, sometimes you need to repeat a block of HTML but only when a particular condition is true.
To do this, you must put the `*ngIf` on a container element that wraps the `*ngFor` element. 

One or both elements can be an [`ng-container`](guide/structural-directives#ngcontainer) so you don't have to introduce extra levels of HTML.


## Inside _NgSwitch_ directives

The Angular _NgSwitch_ is actually a set of cooperating directives: `NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault`.

<!-- KW--The following example is also in Template Syntax, almost verbatim. -->
Here's an example.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngswitch)" region="ngswitch">

</code-example>



The switch value assigned to `NgSwitch` (`hero.emotion`) determines which
(if any) of the switch cases are displayed.

`NgSwitch` itself is not a structural directive.
It's an _attribute_ directive that controls the behavior of the other two switch directives.
That's why you write `[ngSwitch]`, never `*ngSwitch`.

`NgSwitchCase` and `NgSwitchDefault` _are_ structural directives.
You attach them to elements using the asterisk (*) prefix notation.
An `NgSwitchCase` displays its host element when its value matches the switch value.
The `NgSwitchDefault` displays its host element when no sibling `NgSwitchCase` matches the switch value.


<div class="l-sub-section">



The element to which you apply a directive is its _host_ element.
The `<happy-hero>` is the host element for the happy `*ngSwitchCase`.
The `<unknown-hero>` is the host element for the `*ngSwitchDefault`.


</div>



As with other structural directives, the `NgSwitchCase` and `NgSwitchDefault`
can be desugared into the template _attribute_ form.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngswitch-template-attr)" region="ngswitch-template-attr">

</code-example>



That, in turn, can be desugared into the `<ng-template>` element form.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngswitch-template)" region="ngswitch-template">

</code-example>




## Prefer the asterisk (*) syntax

The asterisk (*) syntax is more clear than the desugared forms.
Use [&lt;ng-container&gt;](guide/structural-directives#ng-container) when there's no single element
to host the directive.

While there's rarely a good reason to apply a structural directive in template _attribute_ or _element_ form,
it's still important to know that Angular creates an `<ng-template>` and to understand how it works.
You'll refer to the `<ng-template>` when you [write your own structural directive](guide/structural-directives#unless).



## The `<ng-template>`

The `<ng-template>` is an Angular element for rendering HTML, so it is never displayed directly.
In fact, before rendering the view, Angular _replaces_ the `<ng-template>` and its contents with a comment.

If there is no structural directive and you merely wrap some elements in a `<ng-template>`,
those elements disappear.
That's the fate of the middle "Hip!" in the phrase "Hip! Hip! Hooray!".


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (template-tag)" region="template-tag">

</code-example>



Angular erases the middle "Hip!".


<figure>
  <img src='generated/images/guide/structural-directives/template-rendering.png' alt="template tag rendering">
</figure>



A structural directive puts an `<ng-template>` to work
as you'll see when you [write your own structural directive](guide/structural-directives#unless).


## Group sibling elements with `<ng-container>`

There's often a _root_ element that should host the structural directive.
The list element, `<li>`, is a typical host element of an `NgFor` repeater.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngfor-li)" region="ngfor-li">

</code-example>



When there isn't a host element, you can usually wrap the content in a native HTML container element,
such as a `<div>`, and attach the directive to that wrapper.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngif)" region="ngif">

</code-example>


<!-- KW--A front end dev can easily avoid this situation if using CSS classes properly. It is 
standard best practice to target only classes and not elements, exactly for this reason. 
Is there a way to cover this topic without using this example? Also, "Usually ... but not always."
makes Angular, at least for a moment, sound like the bad guy when the culprit here would be 
poor CSS. -->

<!-- Introducing another container element&mdash;typically a `<span>` or `<div>`&mdash;to
group the elements under a single _root_ is usually harmless.
_Usually_ ... but not _always_.

The grouping element may break the template appearance because CSS styles
neither expect nor accommodate the new layout.
For example, suppose you have the following paragraph layout.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (ngif-span)" region="ngif-span">

</code-example>



You also have a CSS style rule that happens to apply to a `<span>` within a `<p>`aragraph.


<code-example path="structural-directives/src/app/app.component.css" linenums="false" title="src/app/app.component.css (p-span)" region="p-span">

</code-example> -->


<!-- 
The constructed paragraph renders strangely.


<figure>
  <img src='generated/images/guide/structural-directives/bad-paragraph.png' alt="spanned paragraph with bad style">
</figure>



The `p span` style, intended for use elsewhere, was inadvertently applied here. -->

However, some HTML elements require all immediate children to be of a specific type.
For example, the `<select>` element requires `<option>` children.
You can't wrap the _options_ in a conditional `<div>` or a `<span>`.

When you try this,


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (select-span)" region="select-span">

</code-example>



the drop down is empty.


<figure>
  <img src='generated/images/guide/structural-directives/bad-select.png' alt="spanned options don't work">
</figure>


The browser won't display an `<option>` within a `<span>`.

### `<ng-container>` to the rescue

The Angular `<ng-container>` is a grouping element that doesn't interfere with styles or layout
because Angular _doesn't put it in the DOM_.

Conditionally exclude a _select_ `<option>` with `<ng-container>`.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (select-ngcontainer)" region="select-ngcontainer">

</code-example>



The drop down works properly.


<figure>
  <img src='generated/images/guide/structural-directives/select-ngcontainer-anim.gif' alt="ngcontainer options work properly">
</figure>



The `<ng-container>` is a syntax element recognized by the Angular parser.
It's not a directive, component, class, or interface.
It's more like the curly braces in a JavaScript `if`-block:


<code-example language="javascript">
  if (someCondition) {
    statement1;
    statement2;
    statement3;
  }

</code-example>



Without those braces, JavaScript would only execute the first statement
when you intend to conditionally execute all of them as a single block.
The `<ng-container>` satisfies a similar need in Angular templates.




## Write a structural directive

In this section, you write an `UnlessDirective` structural directive
that does the opposite of `NgIf`.
`NgIf` displays the template content when the condition is `true`.
`UnlessDirective` displays the content when the condition is ***false***.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (myUnless-1)" region="myUnless-1">

</code-example>



Creating a directive is similar to creating a component.

* Import the `Directive` decorator (instead of the `Component` decorator).

* Import the `Input`, `TemplateRef`, and `ViewContainerRef` symbols; you'll need them for _any_ structural directive.
<!-- KW--Do you need these for all structural directives or just when you write one? I don't think you have to import them for NgIf/NgFor, right? -->

* Apply the decorator to the directive class.

* Set the CSS *attribute selector* that identifies the directive when applied to an element in a template.

Here's how you might begin:


<code-example path="structural-directives/src/app/unless.directive.ts" linenums="false" title="src/app/unless.directive.ts (skeleton)" region="skeleton">

</code-example>



The directive's _selector_ is typically the directive's **attribute name** in square brackets, `[myUnless]`.
The brackets define a CSS
<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors" title="MDN: Attribute selectors">attribute selector</a>.

The directive _attribute name_ should be spelled in _lowerCamelCase_ and begin with a prefix.
Don't use `ng` because Angulra uses that prefix and you don't want any collisions.
Pick something short that fits you or your company.
In this example, the prefix is `my`.


The directive _class_ name ends in `Directive` per the [style guide](guide/styleguide#02-03 "Angular Style Guide").
Angular's own directives do not.

### _TemplateRef_ and _ViewContainerRef_

This simple structural directive creates an
[_embedded view_](api/core/EmbeddedViewRef "API: EmbeddedViewRef")
from the Angular-generated `<ng-template>` and inserts that view in a
[_view container_](api/core/ViewContainerRef "API: ViewContainerRef")
adjacent to the directive's original `<p>` host element.


You'll acquire the `<ng-template>` contents with a
[`TemplateRef`](api/core/TemplateRef "API: TemplateRef")
and access the _view container_ through a
[`ViewContainerRef`](api/core/ViewContainerRef "API: ViewContainerRef").

You inject both in the directive constructor as private variables of the class.


<code-example path="structural-directives/src/app/unless.directive.ts" linenums="false" title="src/app/unless.directive.ts (ctor)" region="ctor">

</code-example>



### The _myUnless_ property

The directive consumer expects to bind a true/false condition to `[myUnless]`.
That means the directive needs a `myUnless` property, decorated with `@Input`.


<div class="l-sub-section">

For more information on `@Input`, see [_Template Syntax_](guide/template-syntax#inputs-outputs).

</div>


<code-example path="structural-directives/src/app/unless.directive.ts" linenums="false" title="src/app/unless.directive.ts (set)" region="set">

</code-example>


Angular sets the  `myUnless` property whenever the value of the condition changes.
Because the `myUnless` property does work, it needs a setter.

* If the condition is falsy and the view hasn't been created previously,
tell the _view container_ to create the _embedded view_ from the template.

* If the condition is truthy and the view is currently displayed,
clear the container which also destroys the view.

Nobody reads the `myUnless` property so it doesn't need a getter.

The completed directive code looks like this:


<code-example path="structural-directives/src/app/unless.directive.ts" linenums="false" title="src/app/unless.directive.ts (excerpt)" region="no-docs">

</code-example>



Add this directive to the `declarations` array of the AppModule.

Then create some HTML to try it.


<code-example path="structural-directives/src/app/app.component.html" linenums="false" title="src/app/app.component.html (myUnless)" region="myUnless">

</code-example>



When the `condition` is falsy, the top (A) paragraph appears and the bottom (B) paragraph disappears.
When the `condition` is truthy, the top (A) paragraph is removed and the bottom (B) paragraph appears.


<figure>
  <img src='generated/images/guide/structural-directives/unless-anim.gif' alt="UnlessDirective in action">
</figure>




## Summary

Try the <live-example></live-example>.

Here is the source from the `src/app/` folder.


<code-tabs>

  <code-pane title="app.component.ts" path="structural-directives/src/app/app.component.ts">

  </code-pane>

  <code-pane title="app.component.html" path="structural-directives/src/app/app.component.html">

  </code-pane>

  <code-pane title="app.component.css" path="structural-directives/src/app/app.component.css">

  </code-pane>

  <code-pane title="app.module.ts" path="structural-directives/src/app/app.module.ts">

  </code-pane>

  <code-pane title="hero.ts" path="structural-directives/src/app/hero.ts">

  </code-pane>

  <code-pane title="hero-switch.components.ts" path="structural-directives/src/app/hero-switch.components.ts">

  </code-pane>

  <code-pane title="unless.directive.ts" path="structural-directives/src/app/unless.directive.ts">

  </code-pane>

</code-tabs>


This page covered:

* that structural directives manipulate HTML layout.
* to use [`<ng-container>`](guide/structural-directives#ngcontainer) as a grouping element when there is no suitable host element.
* that the Angular desugars [asterisk (*) syntax](guide/structural-directives#asterisk) into a `<ng-template>`.
* how that works for the `NgIf`, `NgFor` and `NgSwitch` built-in directives.
* about the [_microsyntax_](guide/structural-directives#microsyntax) that expands into a [`<ng-template>`](guide/structural-directives#template).
* to write a [custom structural directive](guide/structural-directives#unless), `UnlessDirective`.
