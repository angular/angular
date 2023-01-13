
# Binding syntax

Data binding automatically keeps your page up-to-date based on your application's state.
You use data binding to specify things such as the source of an image, the state of a button, or data for a particular user.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Data binding and HTML

Developers can customize HTML by specifying attributes with string values.
In the following example, `class`, `src`, and `disabled` modify the `<div>`, `<img>`, and `<button>` elements respectively.

<code-example format="html" language="html">

&lt;div class="special"&gt;Plain old HTML&lt;/div&gt;
&lt;img src="images/item.png"&gt;
&lt;button disabled&gt;Save&lt;/button&gt;

</code-example>

Use data binding to control things like the state of a button:

<code-example header="src/app/app.component.html" path="binding-syntax/src/app/app.component.html" region="disabled-button"></code-example>

Notice that the binding is to the `disabled` property of the button's DOM element, not the attribute.
Data binding works with properties of DOM elements, components, and directives, not HTML attributes.

<a id="html-attribute-vs-dom-property"></a>

### HTML attributes and DOM properties

Angular binding distinguishes between HTML attributes and DOM properties.

Attributes initialize DOM properties and you can configure them to modify an element's behavior.
Properties are features of DOM nodes.

*   A few HTML attributes have 1:1 mapping to properties; for example,

    <code-example format="html" hideCopy language="html">

    id

    </code-example>

*   Some HTML attributes don't have corresponding properties; for example,

    <code-example format="html" hideCopy language="html">

    aria-&ast;

    </code-example>

*   Some DOM properties don't have corresponding attributes; for example,

    <code-example format="html" hideCopy language="html">

    textContent

    </code-example>

<div class="alert is-important">

Remember that HTML attributes and DOM properties are different things, even when they have the same name.

</div>

In Angular, the only role of HTML attributes is to initialize element and directive state.

When you write a data binding, you're dealing exclusively with the DOM properties and events of the target object.

#### Example 1: an `<input>`

When the browser renders `<input type="text" value="Sarah">`, it creates a corresponding DOM node with a `value` property and initializes that `value` to "Sarah".

<code-example format="html" language="html">

&lt;input type="text" value="Sarah"&gt;

</code-example>

When the user enters `Sally` into the `<input>`, the DOM element `value` property becomes `Sally`.
However, if you look at the HTML attribute `value` using `input.getAttribute('value')`, you can see that the attribute remains unchanged &mdash;it returns "Sarah".

The HTML attribute `value` specifies the initial value; the DOM `value` property is the current value.

To see attributes versus DOM properties in a functioning app, see the <live-example name="binding-syntax"></live-example> especially for binding syntax.

#### Example 2: a disabled button

A button's `disabled` property is `false` by default so the button is enabled.

When you add the `disabled` attribute, you are initializing the button's `disabled` property to `true` which disables the button.

<code-example format="html" language="html">

&lt;button disabled&gt;Test Button&lt;/button&gt;

</code-example>

Adding and removing the `disabled` attribute disables and enables the button.
However, the value of the attribute is irrelevant, which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.

To control the state of the button, set the `disabled` property instead.

#### Property and attribute comparison

Though you could technically set the `[attr.disabled]` attribute binding, the values are different in that the property binding must be a boolean value, while its corresponding attribute binding relies on whether the value is `null` or not.
Consider the following:

<code-example format="html" language="html">

&lt;input [disabled]="condition ? true : false"&gt;
&lt;input [attr.disabled]="condition ? 'disabled' : null"&gt;

</code-example>

The first line, which uses the `disabled` property, uses a boolean value.
The second line, which uses the disabled attribute checks for `null`.

Generally, use property binding over attribute binding as a boolean value is easy to read, the syntax is shorter, and a property is more performant.

To see the `disabled` button example in a functioning application, see the <live-example></live-example>.
This example shows you how to toggle the disabled property from the component.

## Types of data binding

Angular provides three categories of data binding according to the direction of data flow:

*   From source to view
*   From view to source
*   In a two-way sequence of view to source to view

| Type                                                                     | Syntax                                                                       | Category |
|:---                                                                      |:---                                                                          |:---      |
| Interpolation <br /> Property <br /> Attribute <br /> Class <br /> Style | <code-example> {{expression}} &NewLine;[target]="expression" </code-example> | One-way from data source to view target |
| Event                                                                    | <code-example> (target)="statement" </code-example>                          | One-way from view target to data source |
| Two-way                                                                  | <code-example> [(target)]="expression" </code-example>                       | Two-way                                 |

Binding types other than interpolation have a target name to the left of the equal sign.
The target of a binding is a property or event, which you surround with square bracket \(`[ ]`\) characters, parenthesis \(`( )`\) characters, or both \(`[( )]`\) characters.

The binding punctuation of `[]`, `()`, `[()]`, and the prefix specify the direction of data flow.

*   Use `[]` to bind from source to view
*   Use `()` to bind from view to source
*   Use `[()]` to bind in a two-way sequence of view to source to view

Place the expression or statement to the right of the equal sign within double quote \(`""`\) characters.
For more information see [Interpolation](guide/interpolation) and [Template statements](guide/template-statements).

## Binding types and targets

The target of a data binding can be a property, an event, or an attribute name.
Every public member of a source directive is automatically available for binding in a template expression or statement.
The following table summarizes the targets for the different binding types.

| Type      | Target                                                               | Examples |
|:---       |:---                                                                  |:---      |
| Property  | Element property <br /> Component property <br /> Directive property | `alt`, `src`, `hero`, and `ngClass` in the following: <code-example path="template-syntax/src/app/app.component.html" region="property-binding-syntax-1"></code-example> <!-- For more information, see [Property Binding](guide/property-binding). --> |
| Event     | Element event <br /> Component event <br /> Directive event           | `click`, `deleteRequest`, and `myClick` in the following: <code-example path="template-syntax/src/app/app.component.html" region="event-binding-syntax-1"></code-example>                                                                               |
| Two-way   | Event and property                                                   | <code-example path="template-syntax/src/app/app.component.html" region="2-way-binding-syntax-1"></code-example>                                                                                                                                         |
| Attribute | Attribute \(the exception\)                                          | <code-example path="template-syntax/src/app/app.component.html" region="attribute-binding-syntax-1"></code-example>                                                                                                                                     |
| Class     | `class` property                                                     | <code-example path="template-syntax/src/app/app.component.html" region="class-binding-syntax-1"></code-example>                                                                                                                                         |
| Style     | `style` property                                                     | <code-example path="template-syntax/src/app/app.component.html" region="style-binding-syntax-1"></code-example>                                                                                                                                         |

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
