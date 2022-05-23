# Built-in directives

Directives are classes that add additional behavior to elements in your Angular applications.
Use the built-in directives in Angular to manage forms, lists, styles, and what users see.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

The following list shows the different types of Angular directives.

| Directive Types                                                               | Details |
|:---                                                                           |:---     |
| [Components][AioGuideComponentOverview]                                       | Used with a template. This type of directive is the most common directive type.   |
| [Attribute directives][AioGuideBuiltInDirectivesBuiltInAttributeDirectives]   | Change the appearance or behavior of an element, component, or another directive. |
| [Structural directives][AioGuideBuiltInDirectivesBuiltInStructuralDirectives] | Change the DOM layout by adding and removing DOM elements.                        |

## Built-in attribute directives

Attribute directives listen to and modify the behavior of other HTML elements, attributes, properties, and components.

Many NgModules such as the [`RouterModule`][AioGuideRouter] and the [`FormsModule`][AioGuideForms] define their own attribute directives.
The following list shows the most common attribute directives.

| Common directives                                                                | Details |
|:---                                                                              |:---     |
| [`NgClass`][AioGuideBuiltInDirectivesAddingAndRemovingClassesWithNgclass]        | Adds and removes a set of CSS classes.             |
| [`NgStyle`][AioGuideBuiltInDirectivesSettingInlineStylesWithNgstyle]             | Adds and removes a set of HTML styles.             |
| [`NgModel`][AioGuideBuiltInDirectivesDisplayingAndUpdatingPropertiesWithNgmodel] | Adds two-way data binding to an HTML form element. |

<div class="alert is-helpful">

Built-in directives use only public APIs.
They do not have special access to any private APIs that other directives can't access.

</div>

## Adding and removing classes with `NgClass`

Add or remove multiple CSS classes simultaneously with `ngClass`.

<div class="alert is-helpful">

To add or remove a *single* class, use [class binding][AioGuideClassBinding] rather than `NgClass`.

</div>

### Using `NgClass` with an expression

On the element you would like to style, add `[ngClass]` and set it equal to an expression.
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

1.  In the template, add the `ngClass` property binding to `currentClasses` to set the classes of the element:

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgClass-1"></code-example>

For this use case, Angular applies the classes on initialization and in case of changes.
The full example calls `setCurrentClasses()` initially with `ngOnInit()` and when the dependent properties change through a button click.
These steps are not necessary to implement `ngClass`.
For more information, see the <live-example name="built-in-directives"></live-example> `app.component.ts` and `app.component.html`.

<a id="ngstyle"></a>

## Setting inline styles with `NgStyle`

Use `NgStyle` to set multiple inline styles simultaneously, based on the state of the component.

1.  To use `NgStyle`, add a method to the component class.

    In the following example, `setCurrentStyles()` sets the property `currentStyles` with an object that defines three styles, based on the state of three other component properties.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="setStyles"></code-example>

1.  To set the styles of the element, add an `ngStyle` property binding to `currentStyles`.

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgStyle-2"></code-example>

For this use case, Angular applies the styles upon initialization and in case of changes.
To do this, the full example calls `setCurrentStyles()` initially with `ngOnInit()` and when the dependent properties change through a button click.
However, these steps are not necessary to implement `ngStyle` on its own.
See the <live-example name="built-in-directives"></live-example> `app.component.ts` and `app.component.html` for this optional implementation.

<a id="ngModel"></a>

## Displaying and updating properties with `ngModel`

Use the `NgModel` directive to display a data property and update that property when the user makes changes.

1.  Import `FormsModule`  and add it to the `imports` list of the NgModule.

    <code-example header="src/app/app.module.ts (FormsModule import)" path="built-in-directives/src/app/app.module.ts" region="import-forms-module"></code-example>

1.  Add an `[(ngModel)]` binding on an HTML `<form>` element and set it equal to the property, here `name`.

    <code-example header="src/app/app.component.html (NgModel example)" path="built-in-directives/src/app/app.component.html" region="NgModel-1"></code-example>

    This `[(ngModel)]` syntax can only set a data-bound property.

To customize your configuration, write the expanded form, which separates the property and event binding.
Use [property binding][AioGuidePropertyBinding] to set the property and [event binding][AioGuideEventBinding] to respond to changes.
The following example changes the `<input>` value to uppercase.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="uppercase"></code-example>

Here are all variations in action, including the uppercase version.

<div class="lightbox">

<img alt="NgModel variations" src="generated/images/guide/built-in-directives/ng-model-anim.gif" />

</div>

### `NgModel` and value accessors

The `NgModel` directive works for an element supported by a [ControlValueAccessor][AioApiFormsControlvalueaccessor].
Angular provides *value accessors* for all of the basic HTML form elements.
For more information, see [Forms][AioGuideForms].

To apply `[(ngModel)]` to a non-form built-in element or a third-party custom component, you have to write a value accessor.
For more information, see the API documentation on [DefaultValueAccessor][AioApiFormsDefaultvalueaccessor].

<div class="alert is-helpful">

When you write an Angular component, you do not need a value accessor or `NgModel` if you  name the value and event properties according to the [two-way binding syntax][AioGuideTwoWayBindingHowTwoWayBindingWorks] in Angular.

</div>

## Built-in structural directives

Structural directives are responsible for HTML layout.
They shape or reshape the structure of the DOM, typically by adding, removing, and manipulating the host elements to which they are attached.

This section introduces the most common built-in structural directives.

| Common built-in structural directives                                | Details |
|:---                                                                  |:---     |
| [`NgIf`][AioGuideBuiltInDirectivesAddingOrRemovingAnElementWithNgif] | Conditionally creates or disposes of subviews from the template. |
| [`NgFor`][AioGuideBuiltInDirectivesListingItemsWithNgfor]            | Repeat a node for each item in a list.                           |
| [`NgSwitch`][AioGuideBuiltInDirectivesSwitchingCasesWithNgswitch]    | A set of directives that switch among alternative views.         |

For more information, see [Structural Directives][AioGuideStructuralDirectives].

## Adding or removing an element with `NgIf`

Add or remove an element by applying an `NgIf` directive to a host element.

When `NgIf` is `false`, Angular removes an element and its descendants from the DOM.
Angular then disposes of their components, which frees up memory and resources.

To add or remove an element, bind `*ngIf` to a condition expression such as `isActive` in the following example.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgIf-1"></code-example>

When the `isActive` expression returns a truthy value, `NgIf` adds the `ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent` from the DOM and disposes of the component and all of its sub-components.

For more information on `NgIf` and `NgIfElse`, see the [NgIf API documentation][AioApiCommonNgif].

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
1.  To list your items, assign the short hand `let item of items` to `*ngFor`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-1"></code-example>

The string `"let item of items"` instructs Angular to do the following actions.

*   Store each item in the `items` array in the local `item` looping variable
*   Make each item available to the templated HTML for each iteration
*   Translate `"let item of items"` into an `<ng-template>` around the host element
*   Repeat the `<ng-template>` for each `item` in the list

For more information see the [Structural directive shorthand][AioGuideStructuralDirectivesStructuralDirectiveShorthand] section of [Structural directives][AioGuideStructuralDirectives].

### Repeating a component view

To repeat a component element, apply `*ngFor` to the selector.
In the following example, the selector is `<app-item-detail>`.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-2"></code-example>

Reference a template input variable, such as `item`, in the following locations.

*   In the `ngFor` host element
*   In the host element descendants to access the properties of the item

The following example references `item` first in an interpolation and then passes in a binding to the `item` property of the `<app-item-detail>` component.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-1-2"></code-example>

For more information about template input variables, see [Structural directive shorthand][AioGuideStructuralDirectivesStructuralDirectiveShorthand].

### Getting the `index` of `*ngFor`

Get the `index` of `*ngFor` in a template input variable and use it in the template.

In the `*ngFor`, add a semicolon and `let i=index` to the short hand.
The following example gets the `index` in a variable named `i` and displays it with the item name.

<code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgFor-3"></code-example>

The index property of the `NgFor` directive context returns the zero-based index of the item in each iteration.

Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item` in the list.
For more information about shorthand, see the [Structural Directives][AioGuideStructuralDirectivesStructuralDirectiveShorthand] guide.


## Repeating elements when a condition is true

To repeat a block of HTML when a particular condition is true, put the `*ngIf` on a container element that wraps an `*ngFor` element.

For more information, see [One structural directive per element][AioGuideStructuralDirectivesOneStructuralDirectivePerElement].

<a id="ngfor-with-trackby"></a>

### Tracking items with `*ngFor` `trackBy`

Reduce the number of calls your application makes to the server by tracking changes to an item list.
With the `*ngFor` `trackBy` property, Angular can change and re-render only those items that have changed, rather than reloading the entire list of items.

1.  Add a method to the component that returns the value `NgFor` should track.
    In this example, the value to track is the `id` of the item.
    If the browser has already rendered `id`, Angular keeps track of it and does not re-query the server for the same `id`.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="trackByItems"></code-example>

1.  In the short hand expression, set `trackBy` to the `trackByItems()` method.

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="trackBy"></code-example>

**Change ids** creates new items with new instances of `item.id`.
In the following illustration of the `trackBy` effect, **Reset items** creates new items with the same instances of `item.id`.

*   With no `trackBy`, both buttons trigger complete DOM element replacement.
*   With `trackBy`, only changing the `id` triggers element replacement.

<div class="lightbox">

<img alt="Animation of trackBy" src="generated/images/guide/built-in-directives/ngfor-trackby.gif" />

</div>

## Hosting a directive without a DOM element

The Angular `<ng-container>` is a grouping element that does not interfere with styles or layout because Angular does not put it in the DOM.

Use `<ng-container>` when there is no single element to host the directive.

Here is a conditional paragraph using `<ng-container>`.

<code-example header="src/app/app.component.html (ngif-ngcontainer)" path="structural-directives/src/app/app.component.html" region="ngif-ngcontainer"></code-example>

<div class="lightbox">

<img alt="ngcontainer paragraph with proper style" src="generated/images/guide/structural-directives/good-paragraph.png" />

</div>

1.  Import the `ngModel` directive from `FormsModule`.
1.  Add `FormsModule` to the imports section of the relevant Angular module.
1.  To conditionally exclude an `<option>`, wrap the `<option>` in an `<ng-container>`.

    <code-example header="src/app/app.component.html (select-ngcontainer)" path="structural-directives/src/app/app.component.html" region="select-ngcontainer"></code-example>

    <div class="lightbox">

    <img alt="ngcontainer options work properly" src="generated/images/guide/structural-directives/select-ngcontainer-anim.gif" />

    </div>

<a id="ngSwitch"></a>

## Switching cases with `NgSwitch`

Like the JavaScript `switch` statement, `NgSwitch` displays one element from among several possible elements, based on a switch condition.
Angular puts only the selected element into the DOM.

<!--todo: API Flagged -->

`NgSwitch` is a set of three directives.

| `NgSwitch` directives | Details |
|:---                   |:---     |
| `NgSwitch`            | An attribute directive that changes the behavior of its companion directives.                                                                                          |
| `NgSwitchCase`        | Structural directive that adds its element to the DOM when its bound value equals the switch value and removes its bound value when it does not equal the switch value. |
| `NgSwitchDefault`     | Structural directive that adds its element to the DOM when there is no selected `NgSwitchCase`.                                                                        |

1.  On an element, such as a `<div>`, add `[ngSwitch]` bound to an expression that returns the switch value, such as `feature`.
    Though the `feature` value in this example is a string, the switch value can be of any type.

1.  Bind to `*ngSwitchCase` and `*ngSwitchDefault` on the elements for the cases.

    <code-example header="src/app/app.component.html" path="built-in-directives/src/app/app.component.html" region="NgSwitch"></code-example>

1.  In the parent component, define `currentItem`, to use it in the `[ngSwitch]` expression.

    <code-example header="src/app/app.component.ts" path="built-in-directives/src/app/app.component.ts" region="item"></code-example>

1.  In each child component, add an `item` [input property][AioGuideComponentUsageSendDataToChild] which is bound to the `currentItem` of the parent component.
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

For information on how to build your own custom directives, see [Attribute Directives][AioGuideAttributeDirectives] and [Structural Directives][AioGuideStructuralDirectives].

<!-- links -->

[AioApiCommonNgforof]: api/common/NgForOf "NgForOf | @angular/common - API | Angular"
[AioApiCommonNgif]: api/common/NgIf "NgIf | @angular/common - API | Angular"

[AioApiFormsControlvalueaccessor]: api/forms/ControlValueAccessor "ControlValueAccessor | @angular/forms - API | Angular"
[AioApiFormsDefaultvalueaccessor]: api/forms/DefaultValueAccessor "DefaultValueAccessor | @angular/forms - API | Angular"

[AioGuideClassBinding]: guide/class-binding "Class and style binding | Angular"

[AioGuideAttributeDirectives]: guide/attribute-directives "Attribute directives | Angular"

[AioGuideBuiltInDirectivesAddingAndRemovingClassesWithNgclass]: guide/built-in-directives#adding-and-removing-classes-with-ngclass "Adding and removing classes with NgClass - Built-in directives | Angular"
[AioGuideBuiltInDirectivesAddingOrRemovingAnElementWithNgif]: guide/built-in-directives#adding-or-removing-an-element-with-ngif "Adding or removing an element with NgIf - Built-in directives | Angular"
[AioGuideBuiltInDirectivesBuiltInAttributeDirectives]: guide/built-in-directives#built-in-attribute-directives "Built-in attribute directives - Built-in directives | Angular"
[AioGuideBuiltInDirectivesBuiltInStructuralDirectives]: guide/built-in-directives#built-in-structural-directives "Built-in structural directives - Built-in directives| Angular"
[AioGuideBuiltInDirectivesDisplayingAndUpdatingPropertiesWithNgmodel]: guide/built-in-directives#displaying-and-updating-properties-with-ngmodel "Displaying and updating properties with ngModel - Built-in directives | Angular"
[AioGuideBuiltInDirectivesListingItemsWithNgfor]: guide/built-in-directives#listing-items-with-ngfor "Listing items with NgFor - Built-in directives | Angular"
[AioGuideBuiltInDirectivesSettingInlineStylesWithNgstyle]: guide/built-in-directives#setting-inline-styles-with-ngstyle "Setting inline styles with NgStyle - Built-in directives | Angular"
[AioGuideBuiltInDirectivesSwitchingCasesWithNgswitch]: guide/built-in-directives#switching-cases-with-ngswitch "Switching cases with NgSwitch | Angular"

[AioGuideComponentOverview]: guide/component/component-overview "Understand Angular components | Angular"

[AioGuideComponentUsageSendDataToChild]: guide/component/component-usage-send-data-to-child "Send data to child component | Angular"

[AioGuideEventBinding]: guide/event-binding "Event binding | Angular"

[AioGuideForms]: guide/forms "Building a template-driven form | Angular"

[AioGuidePropertyBinding]: guide/property-binding "Property binding | Angular"

[AioGuideRouter]: guide/router "Common Routing Tasks | Angular"

[AioGuideStructuralDirectives]: guide/structural-directives "Writing structural directives | Angular"
[AioGuideStructuralDirectivesOneStructuralDirectivePerElement]: guide/structural-directives#one-structural-directive-per-element <!-- "One structural directive per element | Angular" -->
[AioGuideStructuralDirectivesStructuralDirectiveShorthand]: guide/structural-directives#structural-directive-shorthand "Structural directive shorthand - Writing structural directives | Angular"

[AioGuideTwoWayBindingHowTwoWayBindingWorks]: guide/two-way-binding#how-two-way-binding-works "How two-way binding works - Two-way binding | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
