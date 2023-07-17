# Built-in directives

Directives are classes that add additional behavior to elements
in your Angular applications.
Use Angular's built-in directives to manage forms, lists, styles, and what users see.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

The different types of Angular directives are as follows:

| Directive Types                                                                   | Details |
|:---                                                                               |:---     |
| [Components](guide/component-overview)                                            | Used with a template. This type of directive is the most common directive type.   |
| [Attribute directives](guide/built-in-directives#built-in-attribute-directives)   | Change the appearance or behavior of an element, component, or another directive. |
| [Structural directives](guide/built-in-directives#built-in-structural-directives) | Change the DOM layout by adding and removing DOM elements.                        |

This guide covers built-in [attribute directives](guide/built-in-directives#built-in-attribute-directives) and [structural directives](guide/built-in-directives#built-in-structural-directives).

<a id="attribute-directives"></a>

## Built-in attribute directives

Attribute directives listen to and modify the behavior of other HTML elements, attributes, properties, and components.

Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation") and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
The most common attribute directives are as follows:

| Common directives                              | Details |
|:---                                            |:---     |
| [`NgClass`](guide/built-in-directives#ngClass) | Adds and removes a set of CSS classes.             |
| [`NgStyle`](guide/built-in-directives#ngstyle) | Adds and removes a set of HTML styles.             |
| [`NgModel`](guide/built-in-directives#ngModel) | Adds two-way data binding to an HTML form element. |

<div class="alert is-helpful">

Built-in directives use only public APIs.
They do not have special access to any private APIs that other directives can't access.

</div>

<a id="ngClass"></a>

## Adding and removing classes with `NgClass`

Add or remove multiple CSS classes simultaneously with `ngClass`.

<div class="alert is-helpful">

To add or remove a *single* class, use [class binding](guide/class-binding) rather than `NgClass`.

</div>

### Using `NgClass` with an expression

On the element you'd like to style, add `[ngClass]` and set it equal to an expression.
In this case, `isSpecial` is a boolean set to `true` in `app.component.ts`.
Because `isSpecial` is true, `ngClass` applies the class of `special` to the `<div>`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="special-div"></code-example>

### Using `NgClass` with a method

1.  To use `NgClass` with a method, add the method to the component class.
    In the following example, `setCurrentClasses()` sets the property `currentClasses` with an object that adds or removes three classes based on the `true` or `false` state of three other component properties.

    Each key of the object is a CSS class name.
    If a key is `true`, `ngClass` adds the class.
    If a key is `false`, `ngClass` removes the class.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="setClasses"></code-example>

1.  In the template, add the `ngClass` property binding to `currentClasses` to set the element's classes:

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgClass-1"></code-example>

For this use case, Angular applies the classes on initialization and in case of changes.
The full example calls `setCurrentClasses()` initially with `ngOnInit()` and when the dependent properties change through a button click.
These steps are not necessary to implement `ngClass`.
For more information, see the <live-example></live-example> `app.component.ts` and `app.component.html`.

<a id="ngstyle"></a>

## Setting inline styles with `NgStyle`

Use `NgStyle` to set multiple inline styles simultaneously, based on the state of the component.

1.  To use `NgStyle`, add a method to the component class.

    In the following example, `setCurrentStyles()` sets the property `currentStyles` with an object that defines three styles, based on the state of three other component properties.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="setStyles"></code-example>

1.  To set the element's styles, add an `ngStyle` property binding to `currentStyles`.

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgStyle-2"></code-example>

For this use case, Angular applies the styles upon initialization and in case of changes.
To do this, the full example calls `setCurrentStyles()` initially with `ngOnInit()` and when the dependent properties change through a button click.
However, these steps are not necessary to implement `ngStyle` on its own.
See the <live-example></live-example> `app.component.ts` and `app.component.html` for this optional implementation.

<a id="ngModel"></a>

## Displaying and updating properties with `ngModel`

Use the `NgModel` directive to display a data property and update that property when the user makes changes.

1.  Import `FormsModule`  and add it to the NgModule's `imports` list.

    <code-example header="src/app/app.module.ts (FormsModule import)" path="built-in-directives/src/app/app.module.ts" region="import-forms-module"></code-example>

1.  Add an `[(ngModel)]` binding on an HTML `<form>` element and set it equal to the property, here `name`.

    <code-example header="src/app/app.component.html (NgModel example)" path="built-in-directives/src/app/app.component.html" region="NgModel-1"></code-example>

    This `[(ngModel)]` syntax can only set a data-bound property.

To customize your configuration, write the expanded form, which separates the property and event binding.
Use [property binding](guide/property-binding) to set the property and [event binding](guide/event-binding) to respond to changes.
The following example changes the `<input>` value to uppercase:

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="uppercase"></code-example>

Here are all variations in action, including the uppercase version:

<div class="lightbox">

<img alt="NgModel variations" src="generated/images/guide/built-in-directives/ng-model-anim.gif">

</div>

### `NgModel` and value accessors

The `NgModel` directive works for an element supported by a [ControlValueAccessor](api/forms/ControlValueAccessor).
Angular provides *value accessors* for all of the basic HTML form elements.
For more information, see [Forms](guide/forms).

To apply `[(ngModel)]` to a non-form built-in element or a third-party custom component, you have to write a value accessor.
For more information, see the API documentation on [DefaultValueAccessor](api/forms/DefaultValueAccessor).

<div class="alert is-helpful">

When you write an Angular component, you don't need a value accessor or `NgModel` if you  name the value and event properties according to Angular's [two-way binding syntax](guide/two-way-binding#how-two-way-binding-works).

</div>

<a id="structural-directives"></a>

## Built-in structural directives

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's structure, typically by adding, removing, and manipulating the host elements to which they are attached.

This section introduces the most common built-in structural directives:

| Common built-in structural directives            | Details |
|:---                                              |:---     |
| [`NgIf`](guide/built-in-directives#ngIf)         | Conditionally creates or disposes of subviews from the template. |
| [`NgFor`](guide/built-in-directives#ngFor)       | Repeat a node for each item in a list.                           |
| [`NgSwitch`](guide/built-in-directives#ngSwitch) | A set of directives that switch among alternative views.         |

For more information, see [Structural Directives](guide/structural-directives).

<a id="ngIf"></a>

## Adding or removing an element with `NgIf`

Add or remove an element by applying an `NgIf` directive to a host element.

When `NgIf` is `false`, Angular removes an element and its descendants from the DOM.
Angular then disposes of their components, which frees up memory and resources.

To add or remove an element, bind `*ngIf` to a condition expression such as `isActive` in the following example.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgIf-1"></code-example>

When the `isActive` expression returns a truthy value, `NgIf` adds the `ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent` from the DOM and disposes of the component and all of its subcomponents.

For more information on `NgIf` and `NgIfElse`, see the [NgIf API documentation](api/common/NgIf).

### Guarding against `null`

By default, `NgIf` prevents display of an element bound to a null value.

To use `NgIf` to guard a `<div>`, add `*ngIf="yourProperty"` to the `<div>`.
In the following example, the `currentCustomer` name appears because there is a `currentCustomer`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgIf-2"></code-example>

However, if the property is `null`, Angular does not display the `<div>`.
In this example, Angular does not display the `nullCustomer` because it is `null`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgIf-2b"></code-example>

<a id="ngFor"></a>

## Listing items with `NgFor`

Use the `NgFor` directive to present a list of items.

1.  Define a block of HTML that determines how Angular renders a single item.
1.  To list your items, assign the shorthand `let item of items` to `*ngFor`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-1"></code-example>

The string `"let item of items"` instructs Angular to do the following:

*   Store each item in the `items` array in the local `item` looping variable
*   Make each item available to the templated HTML for each iteration
*   Translate `"let item of items"` into an `<ng-template>` around the host element
*   Repeat the `<ng-template>` for each `item` in the list

For more information see the [Structural directive shorthand](guide/structural-directives#shorthand) section of [Structural directives](guide/structural-directives).

### Repeating a component view

To repeat a component element, apply `*ngFor` to the selector.
In the following example, the selector is `<app-item-detail>`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-2"></code-example>

Reference a template input variable, such as `item`, in the following locations:

*   Within the `ngFor` host element
*   Within the host element descendants to access the item's properties

The following example references `item` first in an interpolation and then passes in a binding to the `item` property of the `<app-item-detail>` component.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-1-2"></code-example>

For more information about template input variables, see [Structural directive shorthand](guide/structural-directives#shorthand).

### Getting the `index` of `*ngFor`

Get the `index` of `*ngFor` in a template input variable and use it in the template.

In the `*ngFor`, add a semicolon and `let i=index` to the shorthand.
The following example gets the `index` in a variable named `i` and displays it with the item name.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-3"></code-example>

The index property of the `NgFor` directive context returns the zero-based index of the item in each iteration.

Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item`
in the list.
For more information about shorthand, see the [Structural Directives](guide/structural-directives#shorthand) guide.


## Repeating elements when a condition is true

To repeat a block of HTML when a particular condition is true, put the `*ngIf` on a container element that wraps an `*ngFor` element.

For more information see [one structural directive per element](guide/structural-directives#one-per-element).

<a id="ngfor-with-trackby"></a>

### Tracking items with `*ngFor` `trackBy`

Reduce the number of calls your application makes to the server by tracking changes to an item list.
With the `*ngFor` `trackBy` property, Angular can change and re-render only those items that have changed, rather than reloading the entire list of items.

1.  Add a method to the component that returns the value `NgFor` should track.
    In this example, the value to track is the item's `id`.
    If the browser has already rendered `id`, Angular keeps track of it and doesn't re-query the server for the same `id`.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="trackByItems"></code-example>

1.  In the shorthand expression, set `trackBy` to the `trackByItems()` method.

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="trackBy"></code-example>

**Change ids** creates new items with new `item.id`s.
In the following illustration of the `trackBy` effect, **Reset items** creates new items with the same `item.id`s.

*   With no `trackBy`, both buttons trigger complete DOM element replacement.
*   With `trackBy`, only changing the `id` triggers element replacement.

<div class="lightbox">

<img alt="Animation of trackBy" src="generated/images/guide/built-in-directives/ngfor-trackby.gif">

</div>

<a id="ngcontainer"></a>

## Hosting a directive without a DOM element

The Angular `<ng-container>` is a grouping element that doesn't interfere with styles or layout because Angular doesn't put it in the DOM.

Use `<ng-container>` when there's no single element to host the directive.

Here's a conditional paragraph using `<ng-container>`.

<code-example header="src/app/app.component.html (ngif-ngcontainer)" path="structural-directives/src/app/app.component.html" region="ngif-ngcontainer"></code-example>

<div class="lightbox">

<img alt="ngcontainer paragraph with proper style" src="generated/images/guide/structural-directives/good-paragraph.png">

</div>

1.  Import the `ngModel` directive from `FormsModule`.

1.  Add `FormsModule` to the imports section of the relevant Angular module.

1.  To conditionally exclude an `<option>`, wrap the `<option>` in an `<ng-container>`.

    <code-example header="src/app/app.component.html (select-ngcontainer)" path="structural-directives/src/app/app.component.html" region="select-ngcontainer"></code-example>

    <div class="lightbox">

    <img alt="ngcontainer options work properly" src="generated/images/guide/structural-directives/select-ngcontainer-anim.gif">

    </div>

<a id="ngSwitch"></a>

## Switching cases with `NgSwitch`

Like the JavaScript `switch` statement, `NgSwitch` displays one element from among several possible elements, based on a switch condition.
Angular puts only the selected element into the DOM.

<!--todo: API Flagged -->

`NgSwitch` is a set of three directives:

| `NgSwitch` directives | Details |
|:---                   |:---     |
| `NgSwitch`            | An attribute directive that changes the behavior of its companion directives.                                                                                          |
| `NgSwitchCase`        | Structural directive that adds its element to the DOM when its bound value equals the switch value and removes its bound value when it doesn't equal the switch value. |
| `NgSwitchDefault`     | Structural directive that adds its element to the DOM when there is no selected `NgSwitchCase`.                                                                        |

1.  On an element, such as a `<div>`, add `[ngSwitch]` bound to an expression that returns the switch value, such as `feature`.
    Though the `feature` value in this example is a string, the switch value can be of any type.

1.  Bind to `*ngSwitchCase` and `*ngSwitchDefault` on the elements for the cases.

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgSwitch"></code-example>

1.  In the parent component, define `currentItem`, to use it in the `[ngSwitch]` expression.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="item"></code-example>

1.  In each child component, add an `item` [input property](guide/inputs-outputs#input "Input property") which is bound to the `currentItem` of the parent component.
    The following two snippets show the parent component and one of the child components.
    The other child components are identical to `StoutItemComponent`.

    <code-example header="In each child component, here StoutItemComponent" path="built-in-directives/src/app/item-switch.component.ts" region="input"></code-example>

    <div class="lightbox">

    <img alt="Animation of NgSwitch" src="generated/images/guide/built-in-directives/ngswitch.gif">

    </div>

Switch directives also work with built-in HTML elements and web components.
For example, you could replace the `<app-best-item>` switch case with a `<div>` as follows.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgSwitch-div"></code-example>

## What's next

For information on how to build your own custom directives, see [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
