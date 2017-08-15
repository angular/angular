
# Built-in directives

Angular offers two kinds of built-in directives; attribute 
directives and structural directives. For information on how to 
build your own custom directives, see 
[Attribute Directives](guide/attribute-directives) and
[Structural Directives](guide/structural-directives).

## Prerequisites

You should already be familiar with:
* [Template Statements](guide/template-statements).
* [Binding Syntax](guide/binding-syntax).
* [Property Binding](guide/property-binding).
* [Event Binding](guide/event-binding).

<hr/>

## Attribute directives

Attribute directives listen to and modify the behavior of
other HTML elements, attributes, properties, and components.
You usually apply them to elements as if they were HTML attributes, hence the name.

The [Attribute Directives](guide/attribute-directives) guide covers this topic in-depth.
Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation")
and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
The most common attribute directives are as follows:

* [`NgClass`](guide/template-syntax#ngClass)&mdash;add and remove a set of CSS classes.
* [`NgStyle`](guide/template-syntax#ngStyle)&mdash;add and remove a set of HTML styles.
* [`NgModel`](guide/template-syntax#ngModel)&mdash;two-way data binding to an HTML form element.

<hr/>

### NgClass

You typically control how elements appear
by adding and removing CSS classes dynamically.
You can bind to the `ngClass` to add or remove several classes simultaneously.

#### Without `NgClass`

For comparison, consider how you can use [class binding](guide/template-syntax#class-binding) to add or remove a *single* class.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-3a" title="src/app/app.component.html" linenums="false">
</code-example>

This is good for adding or removing one class, but to manage more than one class at a time,
use `NgClass`.

#### Using `NgClass`

To add or remove *many* CSS classes at the same time, use the `NgClass` directive.

Try binding `ngClass` to a key:value control object.
Each key of the object is a CSS class name; its value is `true` if the class should be added,
`false` if it should be removed.

Consider a `setCurrentClasses` component method that sets a component property,
`currentClasses` with an object that adds or removes three classes based on the
`true`/`false` state of three other component properties:

<code-example path="template-syntax/src/app/app.component.ts" region="setClasses" title="src/app/app.component.ts" linenums="false">
</code-example>

Adding an `ngClass` property binding to `currentClasses` sets the element's classes accordingly:

<code-example path="template-syntax/src/app/app.component.html" region="NgClass-1" title="src/app/app.component.html" linenums="false">
</code-example>

Remember in this situation that you'd call `setCurrentClassess()`,
both initially and when the dependent properties change.

<hr/>

### NgStyle

You can set inline styles dynamically, based on the state of the component.
With `NgStyle` you can set many inline styles simultaneously.

#### Without `NgStyle`

For comparison, consider how you can use
a [style binding](guide/template-syntax#style-binding) to set a *single* style value.

<code-example path="template-syntax/src/app/app.component.html" region="NgStyle-1" title="src/app/app.component.html" linenums="false">
</code-example>

This is good for adding or removing one style, but to manage more than one style at a time,
use `NgStyle`.

#### Using `NgStyle`

To set *many* inline styles at the same time, the `NgStyle` directive may be the better choice.

Try binding `ngStyle` to a key:value control object.
Each key of the object is a style name; its value is whatever is appropriate for that style.

Consider a `setCurrentStyles` component method that sets a component property, `currentStyles`
with an object that defines three styles, based on the state of three other component propertes:

<code-example path="template-syntax/src/app/app.component.ts" region="setStyles" title="src/app/app.component.ts" linenums="false">
</code-example>

Adding an `ngStyle` property binding to `currentStyles` sets the element's styles accordingly:

<code-example path="template-syntax/src/app/app.component.html" region="NgStyle-2" title="src/app/app.component.html" linenums="false">
</code-example>

Remember in this situation that you'd call `setCurrentStyles()`, both initially and when the dependent properties change.

<hr/>

### `[(ngModel)]`: Two-way binding

When developing data entry forms, you often display a data property and
update that property when the user makes changes.

Two-way data binding with the `NgModel` directive makes that easy. Here's an example:

```html
<input [(ngModel)]="currentItem.name">
```
<!-- <code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (NgModel-1)" region="NgModel-1">
</code-example> -->

#### `FormsModule` is required to use `ngModel`

Before using the `ngModel` directive in a two-way data binding,
you must import the `FormsModule` and add it to the NgModule's `imports` list.
Learn more about the `FormsModule` and `ngModel` in the
[Forms](guide/forms#ngModel) guide.

Here's how to import the `FormsModule` to make `[(ngModel)]` available.

<code-example path="template-syntax/src/app/app.module.1.ts" linenums="false" title="src/app/app.module.ts (FormsModule import)">
</code-example>

#### Inside `[(ngModel)]`

Looking back at the `name` binding, note that
you could have achieved the same result with separate bindings to
the `<input>` element's  `value` property and `input` event.

```html
<input [value]="currentItem.name"
       (input)="currentItem.name=$event.target.value" >
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="without-NgModel" title="src/app/app.component.html" linenums="false">
</code-example> -->

To streamline the syntax, the `ngModel` directive hides the details behind its own `ngModel` input and `ngModelChange` output properties:

```html
<input
  [ngModel]="currentItem.name"
  (ngModelChange)="currentItem.name=$event">
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgModel-3" title="src/app/app.component.html" linenums="false">
</code-example> -->

The `ngModel` data property sets the element's value property and the `ngModelChange` event property
listens for changes to the element's value.

The details are specific to each kind of element and therefore the `NgModel` directive only works for an element
supported by a [ControlValueAccessor](api/forms/ControlValueAccessor)
that adapts an element to this protocol.
Angular provides *value accessors* for all of the basic HTML form elements and the
[_Forms_](guide/forms) guide shows how to bind to them.

You can't apply `[(ngModel)]` to a non-form native element or a third-party custom component
until you write a suitable *value accessor*,
a technique that is beyond the scope of this guide.

You don't need a _value accessor_ for an Angular component that you write because you
can name the value and event properties
to suit Angular's basic [two-way binding syntax](guide/template-syntax#two-way) and skip `NgModel` altogether.
The [`sizer`](guide/two-way-binding#basics-of-two-way-binding) in the
[Two-way Binding](guide/two-way-binding) guide is an example of this technique.


Separate `ngModel` bindings are an improvement over binding to the element's native properties,
however, you can avoid mentioning the data property twice with a
single declaration using the `[(ngModel)]` syntax:

```html
<input [(ngModel)]="currentItem.name">
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgModel-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

Is `[(ngModel)]` all you need? Is there ever a reason to use its expanded form?

The `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more or something different, you can write the expanded form;
for example, the following forces the input value to uppercase:


<!-- KW--have to change example -->

<code-example path="template-syntax/src/app/app.component.html" region="NgModel-4" title="src/app/app.component.html" linenums="false">
</code-example>

<!-- KW--where are all these variations discussed? -->

Here are all variations in action, including the uppercase version:

<figure>
  <img src='generated/images/guide/template-syntax/ng-model-anim.gif' alt="NgModel variations">
</figure>


<hr/>

## Structural directives

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's _structure_, typically by adding, removing, and manipulating
the host elements to which they are attached.

The deep details of structural directives are covered in the
[Structural Directives](guide/structural-directives) guide,
which covers:

* Why you
[prefix the directive name with an asterisk (\*)](guide/structural-directives#the-asterisk--prefix).
* Using [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* How to write your own structural directive.
* That you can only apply [one structural directive](guide/structural-directives#one-per-element "one per host element") to an element.

_This_ section is an introduction to the common built-in structural directives:

* [`NgIf`](guide/template-syntax#ngIf)&mdash;conditionally add or remove an element from the DOM.
* [`NgFor`](guide/template-syntax#ngFor)&mdash;repeat a template for each item in a list.
* [`NgSwitch`](guide/template-syntax#ngSwitch)&mdash;a set of directives that switch among alternative views.

<hr/>

### NgIf

You can add or remove an element from the DOM by applying an `NgIf` directive to
a host element.
Bind the directive to a condition expression like `isActive` in this example.

```html
<item-detail *ngIf="isActive"></item-detail>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgIf-1" title="src/app/app.component.html" linenums="false">
</code-example> -->


Don't forget the asterisk (`*`) in front of `ngIf`. For more information 
on the asterisk, see the [asterisk (*) prefix](guide/structural-directives#the-asterisk--prefix) section of 
[Structural Directives](guide/structural-directives).

When the `isActive` expression returns a truthy value, `NgIf` adds the `ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent`
from the DOM, destroying that component and all of its sub-components.

#### Show/hide vs. `NgIf`

Hiding an element is different from removing it with `NgIf`. 
For comparison, the following example shows how to control 
the visibility of an element with a
[class](guide/attribute-class-style-bindings#class-binding) or [style](guide/attribute-class-style-bindings#style-binding) binding.

```html
<!-- isSpecial is true -->
<div [class.hidden]="!isSpecial">Show with class</div>
<div [class.hidden]="isSpecial">Hide with class</div>

<!-- ItemDetail is in the DOM but hidden -->
<item-detail [class.hidden]="isSpecial"></item-detail>

<div [style.display]="isSpecial ? 'block' : 'none'">Show with style</div>
<div [style.display]="isSpecial ? 'none'  : 'block'">Hide with style</div>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgIf-3" title="src/app/app.component.html" linenums="false">
</code-example> -->

When you hide an element, that element and all of its descendents remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance
for something the user can't see.

`NgIf` works differently. When `NgIf` is `false`, Angular removes the element and its descendents from the DOM.
It destroys their components, freeing up resources, which
results in a better user experience.

The show/hide technique is fine for a few elements with few children,
but if you are hiding large component trees, consider `NgIf` as a more
efficient alternative.

#### Guard against null

Another advantage of `ngIf` is that you can use it to guard against null. Show/hide 
is best suited for very simple use cases, so when you need a guard, opt instead for `ngIf`. Angular will throw an error if a nested expression tries to access a property of `null`.

The following shows `NgIf` guarding two `<div>`s.
The `currentCustomer` name appears only when there is a `currentCustomer`.
The `nullCustomer` will never be displayed.

```html
<div *ngIf="currentCustomer">Hello, {{currentCustomer.name}}</div>
<div *ngIf="nullCustomer">Hello, {{nullCustomer.name}}</div>
```

<!--
<code-example path="template-syntax/src/app/app.component.html" region="NgIf-2" title="src/app/app.component.html" linenums="false">
</code-example> -->

See also the
[safe navigation operator](guide/template-syntax#the-safe-navigation-operator--and-null-property-paths)
described below.

<hr/>

### `NgFor`

`NgFor` is a repeater directive&mdash;a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed 
and then you tell Angular to use that block as a template for rendering each item in the list.

Here is an example of `NgFor` applied to a simple `<div>`:

```html
<div *ngFor="let item of items">{{item.name}}</div>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgFor-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

You can also apply an `NgFor` to a component element, as in this example:

```html
<item-detail *ngFor="let item of items" [item]="item"></item-detail>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgFor-2" title="src/app/app.component.html" linenums="false">
</code-example> -->

Don't forget the asterisk (`*`) in front of `ngFor`.

The text assigned to `*ngFor` is the instruction that guides the repeater process.


#### `*ngFor` microsyntax

The string assigned to `*ngFor` is not a [template expression](guide/interpolation#template-expressions). Rather, 
it's a *microsyntax*&mdash;a little language of its own that Angular interprets.
The string `"let item of items"` means:

> *Take each item in the `items` array, store it in the local `item` looping variable, and
make it available to the templated HTML for each iteration.*

Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item`
in the list.

For more information about microsyntax, see the [Structural Directives](guide/structural-directives#microsyntax) guide.


#### Template input variables

The `let` keyword before `item` creates a template input variable called `item`.
The `ngFor` directive iterates over the `items` array returned by the parent component's `items` property
and sets `item` to the current item from the array during each iteration.

You reference the `item` input variable within the `ngFor` host element,
and within its descendants, to access the item's properties.
The following example references it first in an interpolation
and then passes in a binding to the `item` property of the `<item-detail>` component.

```html
<div *ngFor="let item of items">{{item.name}}</div>
<item-detail *ngFor="let item of items" [item]="item"></item-detail>
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgFor-1-2" title="src/app/app.component.html" linenums="false">
</code-example> -->

For more information about template input variables, see
[Structural Directives](guide/structural-directives#template-input-variable).

#### `*ngFor` with `index`

The `index` property of the `NgFor` directive context
returns the zero-based index of the item in each iteration.
You can capture the `index` in a template input variable and use it in the template.

The next example captures the `index` in a variable named `i` and displays it with the item name.

```html
<div *ngFor="let item of items; let i=index">{{i + 1}} - {{item.name}}</div>
```
<!-- <code-example path="template-syntax/src/app/app.component.html" region="NgFor-3" title="src/app/app.component.html" linenums="false">
</code-example> -->

<!-- API Flagged -->
`NgFor` is implemented by the `NgForOf` directive. Read more about the other `NgFor` context values such as `last`, `even`,
and `odd` in the [NgForOf API reference](api/common/NgForOf).

#### *ngFor with `trackBy`

If you use `NgFor` with large lists, a small change to one item, such as removing or adding an item, can trigger a cascade of DOM manipulations. For example, re-querying the server could reset a list with all new item objects, even when those items were previously displayed. In this case, Angular sees only a fresh list of new object references and has no choice but to replace the old DOM elements with all new DOM elements.

You can make this more efficient with `trackBy`.
Add a method to the component that returns the value `NgFor` _should_ track.
In this case, that value is the hero's `id`. If the `id` has already been rendered,
Angular keeps track of it and doesn't re-query the server for the same `id`.

```typescript
trackByItems(index: number, item: Item): number { return item.id; }
```
<!-- <code-example path="template-syntax/src/app/app.component.ts" region="trackByHeroes" title="src/app/app.component.ts" linenums="false">
</code-example> -->

In the microsyntax expression, set `trackBy` to `trackByItems()` method.
```html
<div *ngFor="let item of items; trackBy: trackByItems">
  ({{item.id}}) {{item.name}}
</div>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="trackBy" title="src/app/app.component.html" linenums="false">
</code-example> -->

Here is an illustration of the `trackBy` effect.
"Reset items" creates new items with the same `item.id`s.
"Change ids" creates new items with new `item.id`s.

* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement.
<!-- KW--Need item version of this gif -->
<figure>
  <img src="generated/images/guide/template-syntax/ng-for-track-by-anim.gif" alt="trackBy">
</figure>


<hr/>

## The `NgSwitch` directives

NgSwitch is like the JavaScript `switch` statement.
It can display one element from among several possible elements, based on a switch condition.
Angular puts only the *selected* element into the DOM.
<!-- API Flagged -->
`NgSwitch` is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as in the following example.

<!-- KW--Need item version of this. -->
 <code-example path="template-syntax/src/app/app.component.html" region="NgSwitch" title="src/app/app.component.html" linenums="false">
</code-example>

<figure>
  <img src="generated/images/guide/template-syntax/switch-anim.gif" alt="trackBy">
</figure>

`NgSwitch` is the controller directive. Bind it to an expression that returns
the *switch value*, such as `emotion`. Though the `emotion` value in this
example is a string, the switch value can be of any type.

<!-- KW--need more info here on using the asterisk. Is * only used on structural directives? Why?
Maybe the explanation is on the structural directives page. Link if so.
Also, what does it technically mean to bind? What's the difference between binding to the element
vs. binding to [ngSwitch] or `NgSwitchCase`? Where the idea of binding can seem intuitive, it feels like
jargon since we say things like "two way data binding", etc. To the person just learning Angular,
this terminology could be disorienting. Let's define it or change "Bind to" to "use".

Also, In this section, we are talking about structural and attribute directives while in the
structural directive section.-->
**Bind to `[ngSwitch]`**. You'll get an error if you try to set `*ngSwitch` because
`NgSwitch` is an *attribute* directive, not a *structural* directive.
Rather than touching the DOM directly, it changes the behavior of its companion directives.

**Bind to `*ngSwitchCase` and `*ngSwitchDefault`**.
The `NgSwitchCase` and `NgSwitchDefault` directives are _structural_ directives
because they add or remove elements from the DOM.

* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value and removes
its bound value when it doesn't equal the switch value.
<!-- KW--Is the above assertion that it removes it correct? -->
* `NgSwitchDefault` adds its element to the DOM when there is no selected `NgSwitchCase`.

The switch directives are particularly useful for adding and removing *component elements*.
This example switches among four "emotional hero" components defined in the `hero-switch.components.ts` file.
Each component has a `hero` [input property](guide/template-syntax#inputs-outputs "Input property")
which is bound to the `currentHero` of the parent component.

<!-- KW--this part is confusing. I see interpolation but it's still in a div...? -->
Switch directives work as well with native elements and web components too.
For example, you could replace the `<confused-hero>` switch case with the following.

<code-example path="template-syntax/src/app/app.component.html" region="NgSwitch-div" title="src/app/app.component.html" linenums="false">
</code-example>

<hr />


## More information

You may also like:

* [Attribute Directives](guide/attribute-directives) for writing custom attribute directives.
* [Structural Directives](guide/attribute-directives) for writing custom structural directives.

