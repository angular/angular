
# Binding syntax: an overview

Data-binding is a mechanism for coordinating what users see, specifically
with application data values.
While you could push values to and pull values from HTML,
the application is easier to write, read, and maintain if you turn these tasks over to a binding framework.
You simply declare bindings between binding sources, target HTML elements, and let the framework do the rest.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

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


### Data-binding and HTML

In the normal course of HTML development, you create a visual structure with HTML elements, and
you modify those elements by setting element attributes with string constants.

```html
<div class="special">Plain old HTML</div>
<img src="images/item.png">
<button disabled>Save</button>
```

With data-binding, you can control things like the state of a button:

<code-example path="binding-syntax/src/app/app.component.html" region="disabled-button" header="src/app/app.component.html"></code-example>

Notice that the binding is to the `disabled` property of the button's DOM element,
**not** the attribute. This applies to data-binding in general. Data-binding works with *properties* of DOM elements, components, and directives, not HTML *attributes*.

{@a html-attribute-vs-dom-property}

### HTML attribute vs. DOM property

The distinction between an HTML attribute and a DOM property is key to understanding
how Angular binding works. **Attributes are defined by HTML. Properties are accessed from DOM (Document Object Model) nodes.**

* A few HTML attributes have 1:1 mapping to properties; for example, `id`.

* Some HTML attributes don't have corresponding properties; for example, `aria-*`.

* Some DOM properties don't have corresponding attributes; for example, `textContent`.

It is important to remember that *HTML attribute* and the *DOM property* are different things, even when they have the same name.
In Angular, the only role of HTML attributes is to initialize element and directive state.

**Template binding works with *properties* and *events*, not *attributes*.**

When you write a data-binding, you're dealing exclusively with the *DOM properties* and *events* of the target object.

<div class="alert is-helpful">

This general rule can help you build a mental model of attributes and DOM properties:
**Attributes initialize DOM properties and then they are done.
Property values can change; attribute values can't.**

There is one exception to this rule.
Attributes can be changed by `setAttribute()`, which re-initializes corresponding DOM properties.

</div>

For more information, see the [MDN Interfaces documentation](https://developer.mozilla.org/en-US/docs/Web/API#Interfaces) which has API docs for all the standard DOM elements and their properties.
Comparing the [`<td>` attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td) attributes to the [`<td>` properties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableCellElement) provides a helpful example for differentiation.
In particular, you can navigate from the attributes page to the properties via "DOM interface" link, and navigate the inheritance hierarchy up to `HTMLTableCellElement`.


#### Example 1: an `<input>`

When the browser renders `<input type="text" value="Sarah">`, it creates a
corresponding DOM node with a `value` property initialized to "Sarah".

```html
<input type="text" value="Sarah">
```

When the user enters "Sally" into the `<input>`, the DOM element `value` *property* becomes "Sally".
However, if you look at the HTML attribute `value` using `input.getAttribute('value')`, you can see that the *attribute* remains unchanged&mdash;it returns "Sarah".

The HTML attribute `value` specifies the *initial* value; the DOM `value` property is the *current* value.

To see attributes versus DOM properties in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax.

#### Example 2: a disabled button

The `disabled` attribute is another example. A button's `disabled`
*property* is `false` by default so the button is enabled.

When you add the `disabled` *attribute*, its presence alone
initializes the button's `disabled` *property* to `true`
so the button is disabled.

```html
<button disabled>Test Button</button>
```

Adding and removing the `disabled` *attribute* disables and enables the button.
However, the value of the *attribute* is irrelevant,
which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.

To control the state of the button, set the `disabled` *property*,

<div class="alert is-helpful">

Though you could technically set the `[attr.disabled]` attribute binding, the values are different in that the property binding requires to a boolean value, while its corresponding attribute binding relies on whether the value is `null` or not. Consider the following:

```html
<input [disabled]="condition ? true : false">
<input [attr.disabled]="condition ? 'disabled' : null">
```

Generally, use property binding over attribute binding as it is more intuitive (being a boolean value), has a shorter syntax, and is more performant.

</div>


To see the `disabled` button example in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax. This example shows you how to toggle the disabled property from the component.

## Binding types and targets

The **target of a data-binding** is something in the DOM.
Depending on the binding type, the target can be a property (element, component, or directive),
an event (element, component, or directive), or sometimes an attribute name.
The following table summarizes the targets for the different binding types.

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
      <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1"></code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1"></code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1"></code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1"></code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1"></code-example>
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
      <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1"></code-example>
    </td>
  </tr>
</table>

