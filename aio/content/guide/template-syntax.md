# Template Syntax

<style>
  h4 {font-size: 17px !important; text-transform: none !important;}
  .syntax { font-family: Consolas, 'Lucida Sans', Courier, sans-serif; color: black; font-size: 85%; }
  h4 .syntax { font-size: 100%; }
</style>

The Angular application manages what the user sees and can do, achieving this through the interaction of a
component class instance (the *component*) and its user-facing template.

You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view.

This page is a comprehensive technical reference to the Angular template language.
It explains basic principles of the template language and describes most of the syntax that you'll encounter elsewhere in the documentation.

Many code snippets illustrate the points and concepts, all of them available
in the <live-example title="Template Syntax Live Code"></live-example>.


{@a html}
## HTML in templates

HTML is the language of the Angular template.
Almost all HTML syntax is valid template syntax.
The `<script>` element is a notable exception;
it is forbidden, eliminating the risk of script injection attacks.
In practice, `<script>` is ignored and a warning appears in the browser console.
See the [Security](guide/security) page for details.

Some legal HTML doesn't make much sense in a template.
The `<html>`, `<body>`, and `<base>` elements have no useful role.
Pretty much everything else is fair game.

You can extend the HTML vocabulary of your templates with components and directives that appear as new elements and attributes.
In the following sections, you'll learn how to get and set DOM (Document Object Model) values dynamically through data binding.

Begin with the first form of data binding&mdash;interpolation&mdash;to see how much richer template HTML can be.

<hr/>

{@a interpolation}

## Interpolation and Template Expressions

Interpolation allows you to incorporate calculated strings into the text
between HTML element tags and within attribute assignments. Template
expressions are what you use to calculate those strings.

The interpolation <live-example></live-example> demonstrates all of
the syntax and code snippets described in this section.

### Interpolation `{{...}}`

Interpolation refers to embedding expressions into marked up text.
By default, interpolation uses as its delimiter the double curly braces, `{{` and `}}`.

In the following snippet, `{{ currentCustomer }}` is an example of interpolation.

<code-example path="interpolation/src/app/app.component.html" region="interpolation-example1" header="src/app/app.component.html" linenums="false">
</code-example>

The text between the braces is often the name of a component
property. Angular replaces that name with the
string value of the corresponding component property.

<code-example path="interpolation/src/app/app.component.html" region="component-property" header="src/app/app.component.html" linenums="false">
</code-example>

In the example above, Angular evaluates the `title` and `itemImageUrl` properties
and fills in the blanks, first displaying some title text and then an image.

More generally, the text between the braces is a **template expression**
that Angular first **evaluates** and then **converts to a string**.
The following interpolation illustrates the point by adding two numbers:

<code-example path="interpolation/src/app/app.component.html" region="convert-string" header="src/app/app.component.html" linenums="false">
</code-example>

The expression can invoke methods of the host component such as `getVal()` in
the following example:

<code-example path="interpolation/src/app/app.component.html" region="invoke-method" header="src/app/app.component.html" linenums="false">
</code-example>

Angular evaluates all expressions in double curly braces,
converts the expression results to strings, and links them with neighboring literal strings. Finally,
it assigns this composite interpolated result to an **element or directive property**.

You appear to be inserting the result between element tags and assigning it to attributes.

<div class="alert is-helpful">

However, interpolation is a special syntax that Angular converts into a
property binding.

If you'd like to use something other than `{{` and `}}`, you can
configure the interpolation delimiter via the
[interpolation](api/core/Component#interpolation)
option in the `Component` metadata.

</div>

### Template expressions

A template **expression** produces a value and appears within the double
curly braces, `{{ }}`.
Angular executes the expression and assigns it to a property of a binding target;
the target could be an HTML element, a component, or a directive.

The interpolation braces in `{{1 + 1}}` surround the template expression `1 + 1`.
In the property binding,
a template expression appears in quotes to the right of the&nbsp;`=` symbol as in `[property]="expression"`.

In terms of syntax, template expressions are similar to JavaScript.
Many JavaScript expressions are legal template expressions, with a few exceptions.

You can't use JavaScript expressions that have or promote side effects,
including:

* Assignments (`=`, `+=`, `-=`, `...`)
* Operators such as `new`, `typeof`, `instanceof`, etc.
* Chaining expressions with <code>;</code> or <code>,</code>
* The increment and decrement operators `++` and `--`
* Some of the ES2015+ operators

Other notable differences from JavaScript syntax include:

* No support for the bitwise operators such as `|` and `&`
* New template expression operators, such as `|`, `?.` and `!`
<!-- link to: guide/template-syntax#expression-operators -->

### Expression context

The *expression context* is typically the _component_ instance.
In the following snippets, the `recommended` within double curly braces and the
`itemImageUrl2` in quotes refer to properties of the `AppComponent`.

<code-example path="interpolation/src/app/app.component.html" region="component-context" header="src/app/app.component.html" linenums="false">
</code-example>

An expression may also refer to properties of the _template's_ context
such as a template input variable,
<!-- link to built-in-directives#template-input-variables -->
`let customer`, or a template reference variable, `#customerInput`.
<!-- link to guide/template-ref-variables -->

<code-example path="interpolation/src/app/app.component.html" region="template-input-variable" header="src/app/app.component.html (template input variable)" linenums="false">
</code-example>

<code-example path="interpolation/src/app/app.component.html" region="template-reference-variable" header="src/app/app.component.html (template reference variable)" linenums="false">
</code-example>

The context for terms in an expression is a blend of the _template variables_,
the directive's _context_ object (if it has one), and the component's _members_.
If you reference a name that belongs to more than one of these namespaces,
the template variable name takes precedence, followed by a name in the directive's _context_,
and, lastly, the component's member names.

The previous example presents such a name collision. The component has a `customer`
property and the `*ngFor` defines a `customer` template variable.

<div class="alert is-helpful">

The `customer` in `{{customer.name}}`
refers to the template input variable, not the component's property.

Template expressions cannot refer to anything in
the global namespace, except `undefined`. They can't refer to
`window` or `document`. Additionally, they
can't call `console.log()` or `Math.max()` and they are restricted to referencing
members of the expression context.

</div>

### Expression guidelines

When using template expressions follow these guidelines:

* [No visible side effects](guide/template-syntax#no-visible-side-effects)
* [Quick execution](guide/template-syntax#quick-execution)
* [Simplicity](guide/template-syntax#simplicity)


### No visible side effects

A template expression should not change any application state other than the value of the
target property.

This rule is essential to Angular's "unidirectional data flow" policy.
You should never worry that reading a component value might change some other displayed value.
The view should be stable throughout a single rendering pass.

An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is ideal because
it is free of side effects and improves Angular's change detection performance.

In Angular terms, an idempotent expression always returns
*exactly the same thing* until
one of its dependent values changes.

Dependent values should not change during a single turn of the event loop.
If an idempotent expression returns a string or a number, it returns the same string or number when called twice in a row. If the expression returns an object, including an `array`, it returns the same object *reference* when called twice in a row.

<div class="alert is-helpful">

There is one exception to this behavior that applies to `*ngFor`. `*ngFor` has `trackBy` functionality that can deal with referential inequality of objects that when iterating over them.

For more information, see the [*ngFor with `trackBy`](guide/template-syntax#ngfor-with-trackby) section of this guide.

</div>

### Quick execution

Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as
promise resolutions, HTTP results, timer events, key presses and mouse moves.

Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values when their computation is expensive.

### Simplicity

Although it's possible to write complex template expressions, it's a better
practice to avoid them.

A property name or method call should be the norm, but an occasional Boolean negation, `!`, is OK.
Otherwise, confine application and business logic to the component,
where it is easier to develop and test.

<!-- end of Interpolation doc -->

<hr/>

{@a template-statements}

## Template statements

A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.
You'll see template statements in the [event binding](guide/template-syntax#event-binding) section,
appearing in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html" linenums="false">
</code-example>

A template statement *has a side effect*.
That's the whole point of an event.
It's how you update application state from user action.

Responding to events is the other side of Angular's "unidirectional data flow".
You're free to change anything, anywhere, during this turn of the event loop.

Like template expressions, template *statements* use a language that looks like JavaScript.
The template statement parser differs from the template expression parser and
specifically supports both basic assignment (`=`) and chaining expressions
(with <code>;</code> or <code>,</code>).

However, certain JavaScript syntax is not allowed:

* <code>new</code>
* increment and decrement operators, `++` and `--`
* operator assignment, such as `+=` and `-=`
* the bitwise operators `|` and `&`
* the [template expression operators](guide/template-syntax#expression-operators)

### Statement context

As with expressions, statements can refer only to what's in the statement context
such as an event handling method of the component instance.

The *statement context* is typically the component instance.
The *deleteHero* in `(click)="deleteHero()"` is a method of the data-bound component.

<code-example path="template-syntax/src/app/app.component.html" region="context-component-statement" header="src/app/app.component.html" linenums="false">
</code-example>

The statement context may also refer to properties of the template's own context.
In the following examples, the template `$event` object,
a [template input variable](guide/template-syntax#template-input-variable) (`let hero`),
and a [template reference variable](guide/template-syntax#ref-vars) (`#heroForm`)
are passed to an event handling method of the component.

<code-example path="template-syntax/src/app/app.component.html" region="context-var-statement" header="src/app/app.component.html" linenums="false">
</code-example>

Template context names take precedence over component context names.
In `deleteHero(hero)` above, the `hero` is the template input variable,
not the component's `hero` property.

Template statements cannot refer to anything in the global namespace. They
can't refer to `window` or `document`.
They can't call `console.log` or `Math.max`.

### Statement guidelines

As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.

Now that you have a feel for template expressions and statements,
you're ready to learn about the varieties of data binding syntax beyond interpolation.


<hr/>

{@a binding-syntax}

## Binding syntax: an overview

Data-binding is a mechanism for coordinating what users see, specifically
with application data values.
While you could push values to and pull values from HTML,
the application is easier to write, read, and maintain if you turn these tasks over to a binding framework.
You simply declare bindings between binding sources, target HTML elements, and let the framework do the rest.

For a demonstration of the syntax and code snippets in this section, see the <live-example name="binding-syntax">binding syntax example</live-example>.

Angular provides many kinds of data-binding. Binding types can be grouped into three categories distinguished by the direction of data flow:

* From the _source-to-view_
* From _view-to-source_
* Two-way sequence: _view-to-source-to-view_

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="30%">
  </col>
  <col width="50%">
  </col>
  <col width="20%">
  </col>
  <tr>
    <th>
      Type
    </th>
    <th>
      Syntax
    </th>
    <th>
      Category
    </th>

  </tr>
  <tr>
     <td>
      Interpolation<br>
      Property<br>
      Attribute<br>
      Class<br>
      Style
    </td>
    <td>

      <code-example>
        {{expression}}
        [target]="expression"
        bind-target="expression"
      </code-example>

    </td>

    <td>
      One-way<br>from data source<br>to view target
    </td>
    <tr>
      <td>
        Event
      </td>
      <td>
        <code-example>
          (target)="statement"
          on-target="statement"
        </code-example>
      </td>

      <td>
        One-way<br>from view target<br>to data source
      </td>
    </tr>
    <tr>
      <td>
        Two-way
      </td>
      <td>
        <code-example>
          [(target)]="expression"
          bindon-target="expression"
        </code-example>
      </td>
      <td>
        Two-way
      </td>
    </tr>
  </tr>
</table>

Binding types other than interpolation have a **target name** to the left of the equal sign, either surrounded by punctuation, `[]` or `()`,
or preceded by a prefix: `bind-`, `on-`, `bindon-`.

The *target* of a binding is the property or event inside the binding punctuation: `[]`, `()` or `[()]`.

Every public member of a **source** directive is automatically available for binding.
You don't have to do anything special to access a directive member in a template expression or statement.


## Data-binding and HTML

In the normal course of HTML development, you create a visual structure with HTML elements, and
you modify those elements by setting element attributes with string constants.

```html
<div class="special">Plain old HTML</div>
<img src="images/item.png">
<button disabled>Save</button>
```

With data-binding, you can control things like the state of a button:

<code-example path="binding-syntax/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html" linenums="false">
</code-example>

Notice that the binding is to the `disabled` property of the button's DOM element,
**not** the attribute. This applies to data-binding in general. Data-binding works with *properties* of DOM elements, components, and directives, not HTML *attributes*.


## HTML attribute vs. DOM property

The distinction between an HTML attribute and a DOM property is key to understanding
how Angular binding works. **Attributes are defined by HTML. Properties are accessed from DOM, or the Document Object Model, nodes.**

* A few HTML attributes have 1:1 mapping to properties; for example, `id`.

* Some HTML attributes don't have corresponding properties; for example, `aria-*`.

* Some DOM properties don't have corresponding attributes; for example, `textContent`.

This general rule can help you build a mental model of attributes and DOM properties:
**attributes initialize DOM properties and then they are done.
Property values can change; attribute values can't.**

<div class="alert is-helpful">

There is, of course, an exception to this rule because attributes can be changed by `setAttribute()`, which will re-initialize corresponding DOM properties again.

</div>

Comparing the [`<td>` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td)
 attributes to the [`<td>` properties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement)
 provides a helpful
example for differentiation. In particular, you can navigate from the attributes
page to the properties via "DOM interface" link, and navigate the inheritance
hierarchy up to `HTMLTableCellElement`.

**The HTML attribute and the DOM property are not the same thing, even when they have the same name.**

For more information, see the [MDN Interfaces documentation](https://developer.mozilla.org/en-US/docs/Web/API#Interfaces) which has API docs for all the standard DOM elements and their properties.




### Example 1: an `<input>`

When the browser renders `<input type="text" value="Sarah">`, it creates a
corresponding DOM node with a `value` property initialized to "Sarah".

```html
<input type="text" value="Sarah">
```

When the user enters "Sally" into the `<input>`, the DOM element `value` *property* becomes "Sally".
However, if you look at the HTML attribute `value` using `input.getAttribute('value')`, you can see that the *attribute* remains unchanged&mdash;it returns "Sarah".

The HTML attribute `value` specifies the *initial* value; the DOM `value` property is the *current* value.

To see attributes versus DOM properties in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax.

### Example 2: a disabled button

The `disabled` attribute is another example. A button's `disabled`
*property* is `false` by default so the button is enabled.

When you add the `disabled` *attribute*, its presence alone
initializes the button's `disabled` *property* to `true`
so the button is disabled.

```html
<button disabled>Test Button</button>
```

Adding and removing the `disabled` *attribute* disables and
enables the button.
However, the value of the *attribute* is irrelevant,
which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.

To control the state of the button, set the `disabled` *property*,

<div class="alert is-helpful">

**Note:** Though you could technically set the `[attr.disabled]` attribute binding, the values are different in that the property binding requires to a boolean value, while its corresponding attribute binding relies on whether the value is `null` or not. Consider the following:

```html
<input [disabled]="condition ? true : false">
<input [attr.disabled]="condition ? 'disabled' : null">
```

Generally, use property binding over attribute binding as it is more intuitive (being a boolean value), has a shorter syntax, and is more performant.

</div>

**The HTML attribute and the DOM property are different things, even when they have the same name.**

**Template binding works with *properties* and *events*, not *attributes*.**

To see the `disabled` button example in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax. This example shows you how to toggle the disabled property from the component.


### Angular and attributes

In Angular, the only role of attributes is to initialize element and directive state.
When you write a data-binding, you're dealing exclusively with properties and events of the target object.


## Binding targets

The **target of a data-binding** is something in the DOM.
Depending on the binding type, the target can be a
property (element, component, or directive), an
event (element, component, or directive), or sometimes an attribute name.
The following table summarizes:

<style>
  td, th {vertical-align: top}
</style>

<table width="100%">
  <col width="10%">
  </col>
  <col width="15%">
  </col>
  <col width="75%">
  </col>
  <tr>
    <th>
      Type
    </th>
    <th>
      Target
    </th>
    <th>
      Examples
    </th>
  </tr>
  <tr>
    <td>
      Property
    </td>
    <td>
      Element&nbsp;property<br>
      Component&nbsp;property<br>
      Directive&nbsp;property
    </td>
    <td>
      <code>src</code>, <code>hero</code>, and <code>ngClass</code> in the following:
      <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1" linenums="false">
      </code-example>
      <!-- For more information, see [Property Binding](guide/property-binding). -->
    </td>
  </tr>
  <tr>
    <td>
      Event
    </td>
    <td>
      Element&nbsp;event<br>
      Component&nbsp;event<br>
      Directive&nbsp;event
    </td>
    <td>
      <code>click</code>, <code>deleteRequest</code>, and <code>myClick</code> in the following:
      <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1" linenums="false">
      </code-example>
      <!-- KW--Why don't these links work in the table? -->
      <!-- <div>For more information, see [Event Binding](guide/event-binding).</div> -->
    </td>
  </tr>
  <tr>
    <td>
      Two-way
    </td>
    <td>
      Event and property
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1" linenums="false">
      </code-example>
    </td>
  </tr>
  <tr>
    <td>
      Attribute
    </td>
    <td>
      Attribute
      (the&nbsp;exception)
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1" linenums="false">
      </code-example>
    </td>
  </tr>
  <tr>
    <td>
      Class
    </td>
    <td>
      <code>class</code> property
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1" linenums="false">
      </code-example>
    </td>
  </tr>
  <tr>
    <td>
      Style
    </td>
    <td>
      <code>style</code> property
    </td>
    <td>
      <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1" linenums="false">
      </code-example>
    </td>
  </tr>
</table>

<!-- end of binding syntax -->

<hr/>

{@a property-binding}

## Property binding `[property]`

Use property binding to _set_ properties of target elements or
directive `@Input()` decorators. For an example
demonstrating all of the points in this section, see the
<live-example name="property-binding">property binding example</live-example>.

### One-way in

Property binding flows a value in one direction,
from a component's property into a target element property.

You can't use property
binding to read or pull values out of target elements. Similarly, you cannot use
property binding to call a method on the target element.
If the element raises events, you can listen to them with an [event binding](guide/template-syntax#event-binding).

If you must read a target element property or call one of its methods,
see the API reference for [ViewChild](api/core/ViewChild) and
[ContentChild](api/core/ContentChild).

### Examples

The most common property binding sets an element property to a component
property value. An example is
binding the `src` property of an image element to a component's `itemImageUrl` property:

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html" linenums="false">
</code-example>

Here's an example of binding to the `colSpan` property. Notice that it's not `colspan`,
which is the attribute, spelled with a lowercase `s`.

<code-example path="property-binding/src/app/app.component.html" region="colSpan" header="src/app/app.component.html" linenums="false">
</code-example>

For more details, see the [MDN HTMLTableCellElment](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) documentation.

<!-- Add link when Attribute Binding updates are merged:
For more about `colSpan` and `colspan`, see (Attribute Binding)[guide/template-syntax]. -->

Another example is disabling a button when the component says that it `isUnchanged`:

<code-example path="property-binding/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html" linenums="false">
</code-example>

Another is setting a property of a directive:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html" linenums="false">
</code-example>

Yet another is setting the model property of a custom component&mdash;a great way
for parent and child components to communicate:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html" linenums="false">
</code-example>

### Binding target

An element property between enclosing square brackets identifies
the target property.
The target property in the following code is the image element's `src` property.

<code-example path="property-binding/src/app/app.component.html" region="property-binding" header="src/app/app.component.html" linenums="false">
</code-example>

There's also the `bind-` prefix alternative:

<code-example path="property-binding/src/app/app.component.html" region="bind-prefix" header="src/app/app.component.html" linenums="false">
</code-example>


In most cases, the target name is the name of a property, even
when it appears to be the name of an attribute.
So in this case, `src` is the name of the `<img>` element property.

Element properties may be the more common targets,
but Angular looks first to see if the name is a property of a known directive,
as it is in the following example:

<code-example path="property-binding/src/app/app.component.html" region="class-binding" header="src/app/app.component.html" linenums="false">
</code-example>

Technically, Angular is matching the name to a directive `@Input()`,
one of the property names listed in the directive's `inputs` array
or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.

If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.

<div class="alert is-helpful">

Though the target name is usually the name of a property,
there is an automatic attribute-to-property mapping in Angular for
several common attributes. These include `class`/`className`, `innerHtml`/`innerHTML`, and
`tabindex`/`tabIndex`.

</div>


### Avoid side effects

Evaluation of a template expression should have no visible side effects.
The expression language itself, or the way you write template expressions,
helps to a certain extent;
you can't assign a value to anything in a property binding expression
nor use the increment and decrement operators.

For example, you could have an expression that invoked a property or method that had
side effects. The expression could call something like `getFoo()` where only you
know what `getFoo()` does. If `getFoo()` changes something
and you happen to be binding to that something,
Angular may or may not display the changed value. Angular may detect the
change and throw a warning error.
As a best practice, stick to properties and to methods that return
values and avoid side effects.

### Return the proper type

The template expression should evaluate to the type of value
that the target property expects.
Return a string if the target property expects a string, a number if it
expects a number, an object if it expects an object, and so on.

In the following example, the `childItem` property of the `ItemDetailComponent` expects a string, which is exactly what you're sending in the property binding:

<code-example path="property-binding/src/app/app.component.html" region="model-property-binding" header="src/app/app.component.html" linenums="false">
</code-example>

You can confirm this by looking in the `ItemDetailComponent` where the `@Input` type is set to a string:
<code-example path="property-binding/src/app/item-detail/item-detail.component.ts" region="input-type" header="src/app/item-detail/item-detail.component.ts (setting the @Input() type" linenums="false">
</code-example>

As you can see here, the `parentItem` in `AppComponent` is a string, which the `ItemDetailComponent` expects:
<code-example path="property-binding/src/app/app.component.ts" region="parent-data-type" header="src/app/app.component.ts" linenums="false">
</code-example>

#### Passing in an object

The previous simple example showed passing in a string. To pass in an object,
the syntax and thinking are the same.

In this scenario, `ListItemComponent` is nested within `AppComponent` and the `item` property expects an object.

<code-example path="property-binding/src/app/app.component.html" region="pass-object" header="src/app/app.component.html" linenums="false">
</code-example>

The `item` property is declared in the `ListItemComponent` with a type of `Item` and decorated with `@Input()`:

<code-example path="property-binding/src/app/list-item/list-item.component.ts" region="item-input" header="src/app/list-item.component.ts" linenums="false">
</code-example>

In this sample app, an `Item` is an object that has two properties; an `id` and a `name`.

<code-example path="property-binding/src/app/item.ts" region="item-class" header="src/app/item.ts" linenums="false">
</code-example>

While a list of items exists in another file, `mock-items.ts`, you can
specify a different item in `app.component.ts` so that the new item will render:

<code-example path="property-binding/src/app/app.component.ts" region="pass-object" header="src/app.component.ts" linenums="false">
</code-example>

You just have to make sure, in this case, that you're supplying an object because that's the type of `item` and is what the nested component, `ListItemComponent`, expects.

In this example, `AppComponent` specifies a different `item` object
(`currentItem`) and passes it to the nested `ListItemComponent`. `ListItemComponent` was able to use `currentItem` because it matches what an `Item` object is according to `item.ts`. The `item.ts` file is where
`ListItemComponent` gets its definition of an `item`.

### Remember the brackets

The brackets, `[]`, tell Angular to evaluate the template expression.
If you omit the brackets, Angular treats the string as a constant
and *initializes the target property* with that string:

<code-example path="property-binding/src/app/app.component.html" region="no-evaluation" header="src/app.component.html" linenums="false">
</code-example>


Omitting the brackets will render the string
`parentItem`, not the value of `parentItem`.

### One-time string initialization

You *should* omit the brackets when all of the following are true:

* The target property accepts a string value.
* The string is a fixed value that you can put directly into the template.
* This initial value never changes.

You routinely initialize attributes this way in standard HTML, and it works
just as well for directive and component property initialization.
The following example initializes the `prefix` property of the `StringInitComponent` to a fixed string,
not a template expression. Angular sets it and forgets about it.

<code-example path="property-binding/src/app/app.component.html" region="string-init" header="src/app/app.component.html" linenums="false">
</code-example>

The `[item]` binding, on the other hand, remains a live binding to the component's `currentItem` property.

### Property binding vs. interpolation

You often have a choice between interpolation and property binding.
The following binding pairs do the same thing:

<code-example path="property-binding/src/app/app.component.html" region="property-binding-interpolation" header="src/app/app.component.html" linenums="false">
</code-example>

Interpolation is a convenient alternative to property binding in
many cases. When rendering data values as strings, there is no
technical reason to prefer one form to the other, though readability
tends to favor interpolation. However, *when setting an element
property to a non-string data value, you must use property binding*.

### Content security

Imagine the following malicious content.

<code-example path="property-binding/src/app/app.component.ts" region="malicious-content" header="src/app/app.component.ts" linenums="false">
</code-example>

In the component template, the content might be used with interpolation:

<code-example path="property-binding/src/app/app.component.html" region="malicious-interpolated" header="src/app/app.component.ts" linenums="false">
</code-example>

Fortunately, Angular data binding is on alert for dangerous HTML. In the above case,
the HTML displays as is, and the Javascript does not execute. Angular **does not**
allow HTML with script tags to leak into the browser, neither with interpolation
nor property binding.

In the following example, however, Angular [sanitizes](guide/security#sanitization-and-security-contexts)
the values before displaying them.

<code-example path="property-binding/src/app/app.component.html" region="malicious-content" header="src/app/app.component.html" linenums="false">
</code-example>

Interpolation handles the `<script>` tags differently than
property binding but both approaches render the
content harmlessly. The following is the browser output
of the `evilTitle` examples.

```
"Template <script>alert("evil never sleeps")</script> Syntax" is the interpolated evil title.
"Template alert("evil never sleeps")Syntax" is the property bound evil title.
```

<hr/>
{@a other-bindings}

## Attribute, class, and style bindings

The template syntax provides specialized one-way bindings for scenarios less well suited to property binding.

### Attribute binding

You can set the value of an attribute directly with an **attribute binding**.

<div class="alert is-helpful">

This is the only exception to the rule that a binding sets a target property.
This is the only binding that creates and sets an attribute.

</div>

This guide stresses repeatedly that setting an element property with a property binding
is always preferred to setting the attribute with a string. Why does Angular offer attribute binding?

**You must use attribute binding when there is no element property to bind.**

Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA),
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), and
table span attributes. They are pure attributes.
They do not correspond to element properties, and they do not set element properties.
There are no property targets to bind to.

This fact becomes obvious when you write something like this.

<code-example language="html">
  &lt;tr&gt;&lt;td colspan="{{1 + 1}}"&gt;Three-Four&lt;/td&gt;&lt;/tr&gt;
</code-example>

And you get this error:

<code-example format="nocode">
  Template parse errors:
  Can't bind to 'colspan' since it isn't a known native property
</code-example>

As the message says, the `<td>` element does not have a `colspan` property.
It has the "colspan" *attribute*, but
interpolation and property binding can set only *properties*, not attributes.

You need attribute bindings to create and bind to such attributes.

Attribute binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix **`attr`**,
followed by a dot (`.`) and the name of the attribute.
You then set the attribute value, using an expression that resolves to a string.

Bind `[attr.colspan]` to a calculated value:

<code-example path="template-syntax/src/app/app.component.html" region="attrib-binding-colspan" header="src/app/app.component.html" linenums="false">
</code-example>

Here's how the table renders:

<table border="1px">
  <tr><td colspan="2">One-Two</td></tr>
  <tr><td>Five</td><td>Six</td></tr>
 </table>

One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:

<code-example path="template-syntax/src/app/app.component.html" region="attrib-binding-aria" header="src/app/app.component.html" linenums="false">
</code-example>


<hr/>

### Class binding

You can add and remove CSS class names from an element's `class` attribute with
a **class binding**.

Class binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `class`,
optionally followed by a dot (`.`) and the name of a CSS class: `[class.class-name]`.

The following examples show how to add and remove the application's "special" class
with class bindings. Here's how to set the attribute without binding:

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-1" header="src/app/app.component.html" linenums="false">
</code-example>

You can replace that with a binding to a string of the desired class names; this is an all-or-nothing, replacement binding.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-2" header="src/app/app.component.html" linenums="false">
</code-example>

Finally, you can bind to a specific class name.
Angular adds the class when the template expression evaluates to truthy.
It removes the class when the expression is falsy.

<code-example path="template-syntax/src/app/app.component.html" region="class-binding-3" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

While this is a fine way to toggle a single class name,
the [NgClass directive](guide/template-syntax#ngClass) is usually preferred when managing multiple class names at the same time.

</div>


<hr/>

### Style binding

You can set inline styles with a **style binding**.

Style binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `style`,
followed by a dot (`.`) and the name of a CSS style property: `[style.style-property]`.

<code-example path="template-syntax/src/app/app.component.html" region="style-binding-1" header="src/app/app.component.html" linenums="false">
</code-example>

Some style binding styles have a unit extension.
The following example conditionally sets the font size in  “em” and “%” units .

<code-example path="template-syntax/src/app/app.component.html" region="style-binding-2" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

While this is a fine way to set a single style,
the [NgStyle directive](guide/template-syntax#ngStyle) is generally preferred when setting several inline styles at the same time.

</div>

<div class="alert is-helpful">

Note that a _style property_ name can be written in either
[dash-case](guide/glossary#dash-case), as shown above, or
[camelCase](guide/glossary#camelcase), such as `fontSize`.

</div>

<hr/>

{@a event-binding}

## Event binding `(event)`

Event binding allows you to listen for certain events such as
keystrokes, mouse movements, clicks, and touches. For an example
demonstrating all of the points in this section, see the <live-example name="event-binding">event binding example</live-example>.

Angular event binding syntax consists of a **target event** name
within parentheses on the left of an equal sign, and a quoted
template statement on the right.
The following event binding listens for the button's click events, calling
the component's `onSave()` method whenever a click occurs:

<figure>
  <img src='generated/images/guide/template-syntax/syntax-diagram.svg' alt="Syntax diagram">
</figure>

### Target event

As above, the target is the button's click event.

<code-example path="event-binding/src/app/app.component.html" region="event-binding-1" header="src/app/app.component.html" linenums="false">
</code-example>

Alternatively, use the `on-` prefix, known as the canonical form:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-2" header="src/app/app.component.html" linenums="false">
</code-example>

Element events may be the more common targets, but Angular looks first to see if the name matches an event property
of a known directive, as it does in the following example:

<code-example path="event-binding/src/app/app.component.html" region="custom-directive" header="src/app/app.component.html" linenums="false">
</code-example>

If the name fails to match an element event or an output property of a known directive,
Angular reports an “unknown directive” error.


### *$event* and event handling statements

In an event binding, Angular sets up an event handler for the target event.

When the event is raised, the handler executes the template statement.
The template statement typically involves a receiver, which performs an action
in response to the event, such as storing a value from the HTML control
into a model.

The binding conveys information about the event. This information can include data values such as an event object, string, or number named `$event`.

The target event determines the shape of the `$event` object.
If the target event is a native DOM element event, then `$event` is a
[DOM event object](https://developer.mozilla.org/en-US/docs/Web/Events),
with properties such as `target` and `target.value`.

Consider this example:

<code-example path="event-binding/src/app/app.component.html" region="event-binding-3" header="src/app/app.component.html" linenums="false">
</code-example>

This code sets the `<input>` `value` property by binding to the `name` property.
To listen for changes to the value, the code binds to the `input`
event of the `<input>` element.
When the user makes changes, the `input` event is raised, and the binding executes
the statement within a context that includes the DOM event object, `$event`.

To update the `name` property, the changed text is retrieved by following the path `$event.target.value`.

If the event belongs to a directive&mdash;recall that components
are directives&mdash;`$event` has whatever shape the directive produces.


### Custom events with `EventEmitter`

Directives typically raise custom events with an Angular [EventEmitter](api/core/EventEmitter).
The directive creates an `EventEmitter` and exposes it as a property.
The directive calls `EventEmitter.emit(payload)` to fire an event, passing in a message payload, which can be anything.
Parent directives listen for the event by binding to this property and accessing the payload through the `$event` object.

Consider an `ItemDetailComponent` that presents item information and responds to user actions.
Although the `ItemDetailComponent` has a delete button, it doesn't know how to delete the hero. It can only raise an event reporting the user's delete request.

Here are the pertinent excerpts from that `ItemDetailComponent`:


<code-example path="event-binding/src/app/item-detail/item-detail.component.html" linenums="false" header="src/app/item-detail/item-detail.component.html (template)" region="line-through">
</code-example>

<code-example path="event-binding/src/app/item-detail/item-detail.component.ts" linenums="false" header="src/app/item-detail/item-detail.component.ts (deleteRequest)" region="deleteRequest">
</code-example>


The component defines a `deleteRequest` property that returns an `EventEmitter`.
When the user clicks *delete*, the component invokes the `delete()` method,
telling the `EventEmitter` to emit an `Item` object.

Now imagine a hosting parent component that binds to the `deleteRequest` event
of the `ItemDetailComponent`.

<code-example path="event-binding/src/app/app.component.html" linenums="false" header="src/app/app.component.html (event-binding-to-component)" region="event-binding-to-component">
</code-example>

When the `deleteRequest` event fires, Angular calls the parent component's
`deleteItem()` method, passing the *item-to-delete* (emitted by `ItemDetail`)
in the `$event` variable.

### Template statements have side effects

Though [template expressions](guide/template-syntax#template-expressions) shouldn't have [side effects](guide/template-syntax#avoid-side-effects), template
statements usually do. The `deleteItem()` method does have
a side effect: it deletes an item.

Deleting an item updates the model, and depending on your code, triggers
other changes including queries and saving to a remote server.
These changes propagate through the system and ultimately display in this and other views.


<hr/>

{@a two-way}

## Two-way binding `[(...)]`

Two-way binding gives your app a way to share data between a component class and
its template.

For a demonstration of the syntax and code snippets in this section, see the <live-example name="two-way-binding">two-way binding example</live-example>.

### Basics of two-way binding

Two-way binding does two things:

1. Sets a specific element property.
1. Listens for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, `[()]`.
The `[()]` syntax combines the brackets
of property binding, `[]`, with the parentheses of event binding, `()`.

<div class="callout is-important">

<header>
  [( )] = banana in a box
</header>

Visualize a *banana in a box* to remember that the parentheses go _inside_ the brackets.

</div>

The `[()]` syntax is easy to demonstrate when the element has a settable
property called `x` and a corresponding event named `xChange`.
Here's a `SizerComponent` that fits this pattern.
It has a `size` value property and a companion `sizeChange` event:

<code-example path="two-way-binding/src/app/sizer/sizer.component.ts" header="src/app/sizer.component.ts" linenums="false">
</code-example>

The initial `size` is an input value from a property binding.
Clicking the buttons increases or decreases the `size`, within
min/max value constraints,
and then raises, or emits, the `sizeChange` event with the adjusted size.

Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:

<code-example path="two-way-binding/src/app/app.component.html" linenums="false" header="src/app/app.component.html (two-way-1)" region="two-way-1">
</code-example>

The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.

<code-example path="two-way-binding/src/app/app.component.ts" header="src/app/app.component.ts" region="font-size">
</code-example>

Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding,
making the displayed text bigger or smaller.

The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
Angular desugars the `SizerComponent` binding into this:

<code-example path="two-way-binding/src/app/app.component.html" linenums="false" header="src/app/app.component.html (two-way-2)" region="two-way-2">
</code-example>

The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.

## Two-way binding in forms

The two-way binding syntax is a great convenience compared to
separate property and event bindings. It would be convenient to
use two-way binding with HTML form elements like `<input>` and
`<select>`. However, no native HTML element follows the `x`
value and `xChange` event pattern.

For more on how to use two-way binding in forms, see
Angular [NgModel](guide/template-syntax#ngModel).

<hr/>

{@a directives}

## Built-in directives

Angular offers two kinds of built-in directives: attribute
directives and structural directives. This segment reviews some of the most common built-in directives,
classified as either [_attribute_ directives](guide/template-syntax#attribute-directives) or [_structural_ directives](guide/template-syntax#structural-directives) and has its own <live-example name="built-in-directives">built-in directives example</live-example>.

For more detail, including how to build your own custom directives, see [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives).

<hr/>

{@a attribute-directives}

### Built-in attribute directives

Attribute directives listen to and modify the behavior of
other HTML elements, attributes, properties, and components.
You usually apply them to elements as if they were HTML attributes, hence the name.

Many NgModules such as the [`RouterModule`](guide/router "Routing and Navigation")
and the [`FormsModule`](guide/forms "Forms") define their own attribute directives.
The most common attribute directives are as follows:

* [`NgClass`](guide/template-syntax#ngClass)&mdash;adds and removes a set of CSS classes.
* [`NgStyle`](guide/template-syntax#ngStyle)&mdash;adds and removes a set of HTML styles.
* [`NgModel`](guide/template-syntax#ngModel)&mdash;adds two-way data binding to an HTML form element.

<hr/>

{@a ngClass}

### `NgClass`

Add or remove several CSS classes simultaneously with `ngClass`.

<code-example path="built-in-directives/src/app/app.component.html" region="special-div" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

To add or remove a *single* class, use [class binding](guide/template-syntax#class-binding) rather than `NgClass`.

</div>

Consider a `setCurrentClasses()` component method that sets a component property,
`currentClasses`, with an object that adds or removes three classes based on the
`true`/`false` state of three other component properties. Each key of the object is a CSS class name; its value is `true` if the class should be added,
`false` if it should be removed.

<code-example path="built-in-directives/src/app/app.component.ts" region="setClasses" header="src/app/app.component.ts" linenums="false">
</code-example>

Adding an `ngClass` property binding to `currentClasses` sets the element's classes accordingly:

<code-example path="built-in-directives/src/app/app.component.html" region="NgClass-1" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

Remember that in this situation you'd call `setCurrentClasses()`,
both initially and when the dependent properties change.

</div>

<hr/>

{@a ngStyle}

### `NgStyle`

Use `NgStyle` to set many inline styles simultaneously and dynamically, based on the state of the component.

#### Without `NgStyle`

For context, consider setting a *single* style value with [style binding](guide/template-syntax#style-binding), without `NgStyle`.

<code-example path="built-in-directives/src/app/app.component.html" region="without-ng-style" header="src/app/app.component.html" linenums="false">
</code-example>

However, to set *many* inline styles at the same time, use the `NgStyle` directive.

The following is a `setCurrentStyles()` method that sets a component
property, `currentStyles`, with an object that defines three styles,
based on the state of three other component properties:

<code-example path="built-in-directives/src/app/app.component.ts" region="setStyles" header="src/app/app.component.ts" linenums="false">
</code-example>

Adding an `ngStyle` property binding to `currentStyles` sets the element's styles accordingly:

<code-example path="built-in-directives/src/app/app.component.html" region="NgStyle-2" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

Remember to call `setCurrentStyles()`, both initially and when the dependent properties change.

</div>


<hr/>

{@a ngModel}

### `[(ngModel)]`: Two-way binding

The `NgModel` directive allows you to display a data property and
update that property when the user makes changes. Here's an example:

<code-example path="built-in-directives/src/app/app.component.html" linenums="false" header="src/app/app.component.html (NgModel example)" region="NgModel-1">
</code-example>


#### Import `FormsModule` to use `ngModel`

Before using the `ngModel` directive in a two-way data binding,
you must import the `FormsModule` and add it to the NgModule's `imports` list.
Learn more about the `FormsModule` and `ngModel` in [Forms](guide/forms#ngModel).

Remember to import the `FormsModule` to make `[(ngModel)]` available as follows:

<code-example path="built-in-directives/src/app/app.module.ts" linenums="false" header="src/app/app.module.ts (FormsModule import)" region="import-forms-module">
</code-example>


You could achieve the same result with separate bindings to
the `<input>` element's  `value` property and `input` event:

<code-example path="built-in-directives/src/app/app.component.html" region="without-NgModel" header="src/app/app.component.html" linenums="false">
</code-example>

To streamline the syntax, the `ngModel` directive hides the details behind its own `ngModel` input and `ngModelChange` output properties:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModelChange" header="src/app/app.component.html" linenums="false">
</code-example>

The `ngModel` data property sets the element's value property and the `ngModelChange` event property
listens for changes to the element's value.

#### `NgModel` and value accessors

The details are specific to each kind of element and therefore the `NgModel` directive only works for an element
supported by a [ControlValueAccessor](api/forms/ControlValueAccessor)
that adapts an element to this protocol.
Angular provides *value accessors* for all of the basic HTML form elements and the
[Forms](guide/forms) guide shows how to bind to them.

You can't apply `[(ngModel)]` to a non-form native element or a
third-party custom component until you write a suitable value accessor. For more information, see
the API documentation on [DefaultValueAccessor](https://angular.io/api/forms/DefaultValueAccessor).

You don't need a value accessor for an Angular component that
you write because you can name the value and event properties
to suit Angular's basic [two-way binding syntax](guide/template-syntax#two-way)
and skip `NgModel` altogether.
The `sizer` in the
[Two-way Binding](guide/template-syntax#two-way) section is an example of this technique.

Separate `ngModel` bindings are an improvement over binding to the
element's native properties, but you can streamline the binding with a
single declaration using the `[(ngModel)]` syntax:

<code-example path="built-in-directives/src/app/app.component.html" region="NgModel-1" header="src/app/app.component.html" linenums="false">
</code-example>

This `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more, you can write the expanded form;
for example, the following changes the `<input>` value to uppercase:

<code-example path="built-in-directives/src/app/app.component.html" region="uppercase" header="src/app/app.component.html" linenums="false">
</code-example>

Here are all variations in action, including the uppercase version:

<figure>
  <img src='generated/images/guide/built-in-directives/ng-model-anim.gif' alt="NgModel variations">
</figure>

<hr/>

{@a structural-directives}

## Built-in _structural_ directives

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's structure, typically by adding, removing, and manipulating
the host elements to which they are attached.

This section is an introduction to the common built-in structural directives:

* [`NgIf`](guide/template-syntax#ngIf)&mdash;conditionally creates or destroys subviews from the template.
* [`NgFor`](guide/template-syntax#ngFor)&mdash;repeat a node for each item in a list.
* [`NgSwitch`](guide/template-syntax#ngSwitch)&mdash;a set of directives that switch among alternative views.

<div class="alert is-helpful">

The deep details of structural directives are covered in the
[Structural Directives](guide/structural-directives) guide,
which explains the following:

* Why you
[prefix the directive name with an asterisk (\*)](guide/structural-directives#the-asterisk--prefix).
* Using [`<ng-container>`](guide/structural-directives#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* How to write your own structural directive.
* That you can only apply [one structural directive](guide/structural-directives#one-per-element "one per host element") to an element.

</div>

<hr/>

{@a ngIf}

### NgIf

You can add or remove an element from the DOM by applying an `NgIf` directive to
a host element.
Bind the directive to a condition expression like `isActive` in this example.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-1" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

Don't forget the asterisk (`*`) in front of `ngIf`. For more information
on the asterisk, see the [asterisk (*) prefix](guide/structural-directives#the-asterisk--prefix) section of
[Structural Directives](guide/structural-directives).

</div>

When the `isActive` expression returns a truthy value, `NgIf` adds the
`ItemDetailComponent` to the DOM.
When the expression is falsy, `NgIf` removes the `ItemDetailComponent`
from the DOM, destroying that component and all of its sub-components.


#### Show/hide vs. `NgIf`

Hiding an element is different from removing it with `NgIf`.
For comparison, the following example shows how to control
the visibility of an element with a
[class](guide/template-syntax#class-binding) or [style](guide/template-syntax#style-binding) binding.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-3" header="src/app/app.component.html" linenums="false">
</code-example>

When you hide an element, that element and all of its descendants remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance
unnecessarily.

`NgIf` works differently. When `NgIf` is `false`, Angular removes the element and its descendants from the DOM.
It destroys their components, freeing up resources, which
results in a better user experience.

If you are hiding large component trees, consider `NgIf` as a more
efficient alternative to showing/hiding.

<div class="alert is-helpful">

**Note:** For more information on `NgIf` and `ngIfElse`, see the [API documentation about NgIf](api/common/NgIf).

</div>

#### Guard against null

Another advantage of `ngIf` is that you can use it to guard against null. Show/hide
is best suited for very simple use cases, so when you need a guard, opt instead for `ngIf`. Angular will throw an error if a nested expression tries to access a property of `null`.

The following shows `NgIf` guarding two `<div>`s.
The `currentCustomer` name appears only when there is a `currentCustomer`.
The `nullCustomer` will not be displayed as long as it is `null`.

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2" header="src/app/app.component.html" linenums="false">
</code-example>

<code-example path="built-in-directives/src/app/app.component.html" region="NgIf-2b" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

See also the
[safe navigation operator](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)") below.

</div>
<hr/>

{@a ngFor}
### `NgFor`

`NgFor` is a repeater directive&mdash;a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed
and then you tell Angular to use that block as a template for rendering each item in the list.

Here is an example of `NgFor` applied to a simple `<div>`:

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1" header="src/app/app.component.html" linenums="false">
</code-example>

You can also apply an `NgFor` to a component element, as in this example:

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-2" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-critical">

Don't forget the asterisk (`*`) in front of `ngFor`.

</div>

The text assigned to `*ngFor` is the instruction that guides the repeater process.

{@a microsyntax}

#### `*ngFor` microsyntax

The string assigned to `*ngFor` is not a [template expression](guide/template-syntax#template-expressions). Rather,
it's a *microsyntax*&mdash;a little language of its own that Angular interprets.
The string `"let item of items"` means:

> *Take each item in the `items` array, store it in the local `item` looping variable, and
make it available to the templated HTML for each iteration.*

Angular translates this instruction into an `<ng-template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `item`
in the list.

For more information about microsyntax, see the [Structural Directives](guide/structural-directives#microsyntax) guide.


{@a template-input-variable}

{@a template-input-variables}


#### Template input variables

The `let` keyword before `item` creates a template input variable called `item`.
The `ngFor` directive iterates over the `items` array returned by the parent component's `items` property
and sets `item` to the current item from the array during each iteration.

Reference `item` within the `ngFor` host element
as well as within its descendants to access the item's properties.
The following example references `item` first in an interpolation
and then passes in a binding to the `item` property of the `<app-item-detail>` component.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-1-2" header="src/app/app.component.html" linenums="false">
</code-example>

For more information about template input variables, see
[Structural Directives](guide/structural-directives#template-input-variable).

#### `*ngFor` with `index`

The `index` property of the `NgFor` directive context
returns the zero-based index of the item in each iteration.
You can capture the `index` in a template input variable and use it in the template.

The next example captures the `index` in a variable named `i` and displays it with the item name.

<code-example path="built-in-directives/src/app/app.component.html" region="NgFor-3" header="src/app/app.component.html" linenums="false">
</code-example>

<div class="alert is-helpful">

`NgFor` is implemented by the `NgForOf` directive. Read more about the other `NgForOf` context values such as `last`, `even`,
and `odd` in the [NgForOf API reference](api/common/NgForOf).

</div>

{@a trackBy}
#### *ngFor with `trackBy`

If you use `NgFor` with large lists, a small change to one item, such as removing or adding an item, can trigger a cascade of DOM manipulations. For example, re-querying the server could reset a list with all new item objects, even when those items were previously displayed. In this case, Angular sees only a fresh list of new object references and has no choice but to replace the old DOM elements with all new DOM elements.

You can make this more efficient with `trackBy`.
Add a method to the component that returns the value `NgFor` should track.
In this case, that value is the hero's `id`. If the `id` has already been rendered,
Angular keeps track of it and doesn't re-query the server for the same `id`.

<code-example path="built-in-directives/src/app/app.component.ts" region="trackByItems" header="src/app/app.component.ts" linenums="false">
</code-example>

In the microsyntax expression, set `trackBy` to the `trackByItems()` method.

<code-example path="built-in-directives/src/app/app.component.html" region="trackBy" header="src/app/app.component.html" linenums="false">
</code-example>

Here is an illustration of the `trackBy` effect.
"Reset items" creates new items with the same `item.id`s.
"Change ids" creates new items with new `item.id`s.

* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement.

<figure>
  <img src="generated/images/guide/built-in-directives/ngfor-trackby.gif" alt="Animation of trackBy">
</figure>

<hr/>

{@a ngSwitch}
## The `NgSwitch` directives

NgSwitch is like the JavaScript `switch` statement.
It displays one element from among several possible elements, based on a switch condition.
Angular puts only the selected element into the DOM.
<!-- API Flagged -->
`NgSwitch` is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as in the following example.

 <code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch" header="src/app/app.component.html" linenums="false">
</code-example>

<figure>
  <img src="generated/images/guide/built-in-directives/ngswitch.gif" alt="Animation of NgSwitch">
</figure>

`NgSwitch` is the controller directive. Bind it to an expression that returns
the *switch value*, such as `feature`. Though the `feature` value in this
example is a string, the switch value can be of any type.

**Bind to `[ngSwitch]`**. You'll get an error if you try to set `*ngSwitch` because
`NgSwitch` is an *attribute* directive, not a *structural* directive.
Rather than touching the DOM directly, it changes the behavior of its companion directives.

**Bind to `*ngSwitchCase` and `*ngSwitchDefault`**.
The `NgSwitchCase` and `NgSwitchDefault` directives are _structural_ directives
because they add or remove elements from the DOM.

* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value and removes
its bound value when it doesn't equal the switch value.

* `NgSwitchDefault` adds its element to the DOM when there is no selected `NgSwitchCase`.

The switch directives are particularly useful for adding and removing *component elements*.
This example switches among four `item` components defined in the `item-switch.components.ts` file.
Each component has an `item` [input property](guide/template-syntax#inputs-outputs "Input property")
which is bound to the `currentItem` of the parent component.

Switch directives work as well with native elements and web components too.
For example, you could replace the `<app-best-item>` switch case with the following.

<code-example path="built-in-directives/src/app/app.component.html" region="NgSwitch-div" header="src/app/app.component.html" linenums="false">
</code-example>

<hr/>

{@a template-reference-variable}

{@a template-reference-variables--var-}

{@a ref-vars}

{@a ref-var}

## Template reference variables (`#var`)

A **template reference variable** is often a reference to a DOM element within a template.
It can also refer to a directive (which contains a component), an element, [TemplateRef](api/core/TemplateRef), or a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" title="MDN: Web Components">web component</a>.

For a demonstration of the syntax and code snippets in this section, see the <live-example name="template-reference-variables">template reference variables example</live-example>.


Use the hash symbol (#) to declare a reference variable.
The following reference variable, `#phone`, declares a `phone` variable on an `<input>` element.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-var" header="src/app/app.component.html" linenums="false">
</code-example>

You can refer to a template reference variable anywhere in the component's template.
Here, a `<button>` further down the template refers to the `phone` variable.

<code-example path="template-reference-variables/src/app/app.component.html" region="ref-phone" header="src/app/app.component.html" linenums="false">
</code-example>

<h3 class="no-toc">How a reference variable gets its value</h3>

In most cases, Angular sets the reference variable's value to the element on which it is declared.
In the previous example, `phone` refers to the phone number `<input>`.
The button's click handler passes the `<input>` value to the component's `callPhone()` method.

The `NgForm` directive can change that behavior and set the value to something else. In the following example, the template reference variable, `itemForm`, appears three times separated
by HTML.

<code-example path="template-reference-variables/src/app/app.component.html" region="ngForm" header="src/app/hero-form.component.html" linenums="false">
</code-example>

The reference value of itemForm, without the ngForm attribute value, would be
the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
There is, however, a difference between a Component and a Directive in that a `Component
`will be referenced without specifying the attribute value, and a `Directive` will not
change the implicit reference (that is, the element).



However, with `NgForm`, `itemForm` is a reference to the [NgForm](api/forms/NgForm "API: NgForm")
directive with the ability to track the value and validity of every control in the form.

The native `<form>` element doesn't have a `form` property, but the `NgForm` directive does, which allows disabling the submit button
if the `itemForm.form.valid` is invalid and passing the entire form control tree
to the parent component's `onSubmit()` method.

<h3 class="no-toc">Template reference variable considerations</h3>

A template _reference_ variable (`#phone`) is not the same as a template _input_ variable (`let phone`) such as in an [`*ngFor`](guide/template-syntax#template-input-variable).
See [_Structural Directives_](guide/structural-directives#template-input-variable) for more information.

The scope of a reference variable is the entire template. So, don't define the same variable name more than once in the same template as the runtime value will be unpredictable.

#### Alternative syntax

You can use the `ref-` prefix alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.


<code-example path="template-reference-variables/src/app/app.component.html" region="ref-fax" header="src/app/app.component.html" linenums="false">
</code-example>


<hr/>

{@a inputs-outputs}

## Input and Output properties

An _Input_ property is a _settable_ property annotated with an `@Input` decorator.
Values flow _into_ the property when it is data bound with a [property binding](#property-binding)

An _Output_ property is an _observable_ property annotated with an `@Output` decorator.
The property almost always returns an Angular [`EventEmitter`](api/core/EventEmitter).
Values flow _out_ of the component as events bound with an [event binding](#event-binding).

You can only bind to _another_ component or directive through its _Input_ and _Output_ properties.

<div class="alert is-important">

Remember that all **components** are **directives**.

The following discussion refers to _components_ for brevity and
because this topic is mostly a concern for component authors.
</div>

<h3 class="no-toc">Discussion</h3>

You are usually binding a template to its _own component class_.
In such binding expressions, the component's property or method is to the _right_ of the (`=`).

<code-example path="template-syntax/src/app/app.component.html" region="io-1" header="src/app/app.component.html" linenums="false">
</code-example>

The `iconUrl` and `onSave` are members of the `AppComponent` class.
They are _not_ decorated with `@Input()` or `@Output`.
Angular does not object.

**You can always bind to a public property of a component in its own template.**
It doesn't have to be an _Input_ or _Output_ property

A component's class and template are closely coupled.
They are both parts of the same thing.
Together they _are_ the component.
Exchanges between a component class and its template are internal implementation details.

### Binding to a different component

You can also bind to a property of a _different_ component.
In such bindings, the _other_ component's property is to the _left_ of the (`=`).

In the following example, the `AppComponent` template binds `AppComponent` class members to properties of the `HeroDetailComponent` whose selector is `'app-hero-detail'`.

<code-example path="template-syntax/src/app/app.component.html" region="io-2" header="src/app/app.component.html" linenums="false">
</code-example>

The Angular compiler _may_ reject these bindings with errors like this one:

<code-example language="sh" class="code-shell">
Uncaught Error: Template parse errors:
Can't bind to 'hero' since it isn't a known property of 'app-hero-detail'
</code-example>

You know that `HeroDetailComponent` has `hero` and `deleteRequest` properties.
But the Angular compiler refuses to recognize them.

**The Angular compiler won't bind to properties of a different component
unless they are Input or Output properties**.

There's a good reason for this rule.

It's OK for a component to bind to its _own_ properties.
The component author is in complete control of those bindings.

But other components shouldn't have that kind of unrestricted access.
You'd have a hard time supporting your component if anyone could bind to any of its properties.
Outside components should only be able to bind to the component's public binding API.

Angular asks you to be _explicit_ about that API.
It's up to _you_ to decide which properties are available for binding by
external components.

#### TypeScript _public_ doesn't matter

You can't use the TypeScript _public_ and _private_ access modifiers to
shape the component's public binding API.

<div class="alert is-important">

All data bound properties must be TypeScript _public_ properties.
Angular never binds to a TypeScript _private_ property.

</div>

Angular requires some other way to identify properties that _outside_ components are allowed to bind to.
That _other way_ is the `@Input()` and `@Output()` decorators.

### Declaring Input and Output properties

In the sample for this guide, the bindings to `HeroDetailComponent` do not fail
because the data bound properties are annotated with `@Input()` and `@Output()` decorators.

<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-1" header="src/app/hero-detail.component.ts" linenums="false">
</code-example>

<div class="alert is-helpful">

Alternatively, you can identify members in the `inputs` and `outputs` arrays
of the directive metadata, as in this example:

<code-example path="template-syntax/src/app/hero-detail.component.ts" region="input-output-2" header="src/app/hero-detail.component.ts" linenums="false">
</code-example>

</div>

### Input or output?

*Input* properties usually receive data values.
*Output* properties expose event producers, such as `EventEmitter` objects.

The terms _input_ and _output_ reflect the perspective of the target directive.

<figure>
  <img src="generated/images/guide/template-syntax/input-output.png" alt="Inputs and outputs">
</figure>

`HeroDetailComponent.hero` is an **input** property from the perspective of `HeroDetailComponent`
because data flows *into* that property from a template binding expression.

`HeroDetailComponent.deleteRequest` is an **output** property from the perspective of `HeroDetailComponent`
because events stream *out* of that property and toward the handler in a template binding statement.

<h3 id='aliasing-io'>
  Aliasing input/output properties
</h3>

Sometimes the public name of an input/output property should be different from the internal name.

This is frequently the case with [attribute directives](guide/attribute-directives).
Directive consumers expect to bind to the name of the directive.
For example, when you apply a directive with a `myClick` selector to a `<div>` tag,
you expect to bind to an event property that is also called `myClick`.

<code-example path="template-syntax/src/app/app.component.html" region="myClick" header="src/app/app.component.html" linenums="false">
</code-example>

However, the directive name is often a poor choice for the name of a property within the directive class.
The directive name rarely describes what the property does.
The `myClick` directive name is not a good name for a property that emits click messages.

Fortunately, you can have a public name for the property that meets conventional expectations,
while using a different name internally.
In the example immediately above, you are actually binding *through the* `myClick` *alias* to
the directive's own `clicks` property.

You can specify the alias for the property name by passing it into the input/output decorator like this:

<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick" header="src/app/click.directive.ts" linenums="false">
</code-example>

<div class="alert is-helpful">

You can also alias property names in the `inputs` and `outputs` arrays.
You write a colon-delimited (`:`) string with
the directive property name on the *left* and the public alias on the *right*:

<code-example path="template-syntax/src/app/click.directive.ts" region="output-myClick2" header="src/app/click.directive.ts" linenums="false">
</code-example>

</div>


<hr/>

{@a expression-operators}

## Template expression operators

The template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover two of these operators: _pipe_ and _safe navigation operator_.

{@a pipe}

### The pipe operator ( <span class="syntax">|</span> )

The result of an expression might require some transformation before you're ready to use it in a binding.
For example, you might display a number as a currency, force text to uppercase, or filter a list and sort it.

Angular [pipes](guide/pipes) are a good choice for small transformations such as these.
Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the **pipe operator (`|`)**:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-1" header="src/app/app.component.html" linenums="false">
</code-example>

The pipe operator passes the result of an expression on the left to a pipe function on the right.

You can chain expressions through multiple pipes:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-2" header="src/app/app.component.html" linenums="false">
</code-example>

And you can also [apply parameters](guide/pipes#parameterizing-a-pipe) to a pipe:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-3" header="src/app/app.component.html" linenums="false">
</code-example>

The `json` pipe is particularly helpful for debugging bindings:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" header="src/app/app.component.html (pipes-json)" region="pipes-json">
</code-example>

The generated output would look something like this

<code-example language="json">
  { "id": 0, "name": "Hercules", "emotion": "happy",
    "birthdate": "1970-02-25T08:00:00.000Z",
    "url": "http://www.imdb.com/title/tt0065832/",
    "rate": 325 }
</code-example>


<hr/>

{@a safe-navigation-operator}

### The safe navigation operator ( <span class="syntax">?.</span> ) and null property paths

The Angular **safe navigation operator (`?.`)** is a fluent and convenient way to
guard against null and undefined values in property paths.
Here it is, protecting against a view render failure if the `currentHero` is null.

<code-example path="template-syntax/src/app/app.component.html" region="safe-2" header="src/app/app.component.html" linenums="false">
</code-example>

What happens when the following data bound `title` property is null?

<code-example path="template-syntax/src/app/app.component.html" region="safe-1" header="src/app/app.component.html" linenums="false">
</code-example>

The view still renders but the displayed value is blank; you see only "The title is" with nothing after it.
That is reasonable behavior. At least the app doesn't crash.

Suppose the template expression involves a property path, as in this next example
that displays the `name` of a null hero.

<code-example language="html">
  The null hero's name is {{nullHero.name}}
</code-example>

JavaScript throws a null reference error, and so does Angular:

<code-example format="nocode">
  TypeError: Cannot read property 'name' of null in [null].
</code-example>

Worse, the *entire view disappears*.

This would be reasonable behavior if the `hero` property could never be null.
If it must never be null and yet it is null,
that's a programming error that should be caught and fixed.
Throwing an exception is the right thing to do.

On the other hand, null values in the property path may be OK from time to time,
especially when the data are null now and will arrive eventually.

While waiting for data, the view should render without complaint, and
the null property path should display as blank just as the `title` property does.

Unfortunately, the app crashes when the `currentHero` is null.

You could code around that problem with [*ngIf](guide/template-syntax#ngIf).

<code-example path="template-syntax/src/app/app.component.html" region="safe-4" header="src/app/app.component.html" linenums="false">
</code-example>

You could try to chain parts of the property path with `&&`, knowing that the expression bails out
when it encounters the first null.

<code-example path="template-syntax/src/app/app.component.html" region="safe-5" header="src/app/app.component.html" linenums="false">
</code-example>

These approaches have merit but can be cumbersome, especially if the property path is long.
Imagine guarding against a null somewhere in a long property path such as `a.b.c.d`.

The Angular safe navigation operator (`?.`) is a more fluent and convenient way to guard against nulls in property paths.
The expression bails out when it hits the first null value.
The display is blank, but the app keeps rolling without errors.

<code-example path="template-syntax/src/app/app.component.html" region="safe-6" header="src/app/app.component.html" linenums="false">
</code-example>

It works perfectly with long property paths such as `a?.b?.c?.d`.


<hr/>

{@a non-null-assertion-operator}

### The non-null assertion operator ( <span class="syntax">!</span> )

As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is _unintentionally_ null or undefined.

In this mode, typed variables disallow null and undefined by default. The type checker throws an error if you leave a variable unassigned or try to assign null or undefined to a variable whose type disallows null and undefined.

The type checker also throws an error if it can't determine whether a variable will be null or undefined at runtime.
You may know that can't happen but the type checker doesn't know.
You tell the type checker that it can't happen by applying the post-fix
[_non-null assertion operator (!)_](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").

The _Angular_ **non-null assertion operator (`!`)** serves the same purpose in an Angular template.

For example, after you use [*ngIf](guide/template-syntax#ngIf) to check that `hero` is defined, you can assert that
`hero` properties are also defined.

<code-example path="template-syntax/src/app/app.component.html" region="non-null-assertion-1" header="src/app/app.component.html" linenums="false">
</code-example>

When the Angular compiler turns your template into TypeScript code,
it prevents TypeScript from reporting that `hero.name` might be null or undefined.

Unlike the [_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe navigation operator (?.)"),
the **non-null assertion operator** does not guard against null or undefined.
Rather it tells the TypeScript type checker to suspend strict null checks for a specific property expression.

You'll need this template operator when you turn on strict null checks. It's optional otherwise.


<a href="#top-of-page">back to top</a>

<hr/>

{@a built-in-template-functions}

## Built-in template functions

{@a any-type-cast-function}

### The `$any()` type cast function

Sometimes a binding expression triggers a type error during [AOT compilation](guide/aot-compiler) and it is not possible or difficult
to fully specify the type. To silence the error, you can use the `$any()` cast function to cast
the expression to [the `any` type](http://www.typescriptlang.org/docs/handbook/basic-types.html#any) as in the following example:

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-1" header="src/app/app.component.html" linenums="false">
</code-example>

When the Angular compiler turns this template into TypeScript code,
it prevents TypeScript from reporting that `bestByDate` is not a member of the `item`
object when it runs type checking on the template.

The `$any()` cast function also works with `this` to allow access to undeclared members of
the component.

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-2" header="src/app/app.component.html" linenums="false">
</code-example>

The `$any()` cast function works anywhere in a binding expression where a method call is valid.
