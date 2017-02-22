@title
Template Syntax

@intro
Learn how to write templates that display data and consume user events with the help of data binding.

@description

<style>
  h4 {font-size: 17px !important; text-transform: none !important;}  
    .syntax { font-family: Consolas, 'Lucida Sans', Courier, sans-serif; color: black; font-size: 85%; }  
    h4 .syntax { font-size: 100%; }  
    
</style>

The Angular application manages what the user sees and can do, achieving this through the interaction of a 
component class instance (the *component*) and its user-facing template.

You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM). 
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view.


{@a toc}
### Table of contents
This guide covers the basic elements of the Angular template syntax, elements you'll need to construct the view:

* [HTML in templates](#html)
* [Interpolation ( <span class="syntax">{&#xfeff;{...}}</span> )](#interpolation)
* [Template expressions](#template-expressions)
* [Template statements](#template-statements)
* [Binding syntax](#binding-syntax)
* [Property binding ( <span class="syntax">[property]</span> )](#property-binding)
* [Attribute, class, and style bindings](#other-bindings)
* [Event binding ( <span class="syntax">(event)</span> )](#event-binding)
* [Two-way data binding ( <span class="syntax">[(...)]</span> )](#two-way)
* [Built-in directives](#directives)
  * [Attribute directives](#attribute-directives)
    * [NgClass](#ngClass)
    * [NgStyle](#ngStyle)
    * [NgModel (<span class="syntax">[(ngModel)]</span>) ](#ngModel)
  * [Structural directives](#structural-directives)    
    * [NgIf](#ngIf)
    * [NgFor](#ngFor)
      * [Template input variables](#template-input-variables)
      * [microsyntax](#microsyntax)
    * [The NgSwitch directives](#ngSwitch)
* [Template reference variables ( <span class="syntax">#var</span> )](#ref-vars)
* [Input and output properties ( <span class="syntax">@Input</span> and <span class="syntax">@Output</span> )](#inputs-outputs)
* [Template expression operators](#expression-operators)
  * [pipe ( <span class="syntax">|</span> )](#pipe)
  * [safe navigation operator ( <span class="syntax">?.</span> )](#safe-navigation-operator)

The <live-example></live-example>
demonstrates all of the syntax and code snippets described in this guide.

<div class='l-hr'>

</div>



{@a html}
## HTML in templates
HTML is the language of the Angular template. 
The [QuickStart](../quickstart.html) application has a template that is pure HTML:

<code-example language="html" escape="html">
  <h1>Hello Angular</h1>  
    
</code-example>

Almost all HTML syntax is valid template syntax. 
The `<script>` element is a notable exception; 
it is forbidden, eliminating the risk of script injection attacks.
In practice, `<script>` is ignored and a warning appears in the browser console.

Some legal HTML doesn't make much sense in a template. 
The `<html>`, `<body>`, and `<base>` elements have no useful role. 
Pretty much everything else is fair game.

You can extend the HTML vocabulary of your templates with components and directives that appear as new elements and attributes. 
In the following sections, you'll learn how to get and set DOM (Document Object Model) values dynamically through data binding.

Begin with the first form of data binding&mdash;interpolation&mdash;to see how much richer template HTML can be.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a interpolation}
## Interpolation ( <span class="syntax">{&#xfeff;{...}}</span> )
You met the double-curly braces of interpolation, `{{` and `}}`, early in your Angular education.

{@example 'template-syntax/ts/src/app/app.component.html' region='first-interpolation'}

You use interpolation to weave calculated strings into the text between HTML element tags and within attribute assignments.


{@example 'template-syntax/ts/src/app/app.component.html' region='title+image'}

The material between the braces is often the name of a component property. Angular replaces that name with the
string value of the corresponding component property. In the example above, Angular evaluates the `title` and `heroImageUrl` properties
and "fills in the blanks", first displaying a bold application title and then a heroic image.

More generally, the material between the braces is a **template expression** that Angular first **evaluates**
and then **converts to a string**. The following interpolation illustrates the point by adding the two numbers within braces:

{@example 'template-syntax/ts/src/app/app.component.html' region='sum-1'}

The expression can invoke methods of the host component with `getVal()` as seen here:

{@example 'template-syntax/ts/src/app/app.component.html' region='sum-2'}

Angular evaluates all expressions in double curly braces, converts the expression results to strings, and links them with neighboring literal strings. Finally,
it assigns this composite interpolated result to an **element or directive property**.

You appear to be inserting the result between element tags and assigning it to attributes.
It's convenient to think so, and you rarely suffer for this mistake.
Though this is not exactly true. Interpolation is a special syntax that Angular converts into a
[property binding](#property-binding), and is explained below.

But first, let's take a closer look at template expressions and statements.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a template-expressions}
## Template expressions
A template **expression** produces a value.
Angular executes the expression and assigns it to a property of a binding target;
the target might be an HTML element, a component, or a directive.

The interpolation braces in `{{1 + 1}}` surround the template expression `1 + 1`.
In the [property binding](#property-binding) section below, 
a template expression appears in quotes to the right of the&nbsp;`=` symbol as in `[property]="expression"`.

You write these template expressions in a language that looks like #{_JavaScript}.
Many #{_JavaScript} expressions are legal template expressions, but not all.

#{_JavaScript} expressions that have or promote side effects are prohibited,
including:

* assignments (`=`, `+=`, `-=`, ...)
* !{__new_op}
* chaining expressions with !{__chaining_op}
* increment and decrement operators (`++` and `--`)
Other notable differences from #{_JavaScript} syntax include:

<h3 id='expression-context'>
  Expression context
</h3>

The *expression context* is typically the _component_ instance.
In the following snippets, the `title`  within double-curly braces and the
`isUnchanged` in quotes refer to properties of the `AppComponent`.


{@example 'template-syntax/ts/src/app/app.component.html' region='context-component-expression'}

An expression may also refer to properties of the _template's_ context
such as a [template input variable](#template-input-variable) (`let hero`)
or a [template reference variable](#ref-vars) (`#heroInput`).

{@example 'template-syntax/ts/src/app/app.component.html' region='context-var'}

The context for terms in an expression is a blend of the _template variables_, 
the directive's _context_ object (if it has one), and the component's _members_.
If you reference a name that belongs to more than one of these namespaces,
the template variable name takes precedence, followed by a name in the directive's' _context_,
and, lastly, the component's member names.

The previous example presents such a name collision. The component has a `hero` property and the `*ngFor` defines a `hero` template variable. The `hero` in `{{hero}}` refers to the template input variable, not the component's property.
<a href="#toc">back to top</a>

{@a no-side-effects}


{@a expression-guidelines}
### Expression guidelines
Template expressions can make or break an application.
Please follow these guidelines:

* [No visible side effects](#no-visible-side-effects)
* [Quick execution](#quick-execution)
* [Simplicity](#simplicity)
* [Idempotence](#idempotence)

The only exceptions to these guidelines should be in specific circumstances that you thoroughly understand.

#### No visible side effects

A template expression should not change any application state other than the value of the
target property.

This rule is essential to Angular's "unidirectional data flow" policy.
You should never worry that reading a component value might change some other displayed value.
The view should be stable throughout a single rendering pass.

#### Quick execution
Angular executes template expressions after every change detection cycle.
Change detection cycles are triggered by many asynchronous activities such as 
promise resolutions, http results, timer events, keypresses and mouse moves.

Expressions should finish quickly or the user experience may drag, especially on slower devices.
Consider caching values computed from other values when the computation is expensive.

#### Simplicity
Although it's possible to write quite complex template expressions, you should avoid them.

A property name or method call should be the norm.
An occasional Boolean negation (`!`) is OK.
Otherwise, confine application and business logic to the component itself,
where it will be easier to develop and test.

#### Idempotence
An [idempotent](https://en.wikipedia.org/wiki/Idempotence) expression is ideal because
it is free of side effects and improves Angular's change detection performance.

In Angular terms, an idempotent expression always returns *exactly the same thing* until
one of its dependent values changes.Dependent values should not change during a single turn of the event loop.
If an idempotent expression returns a string or a number, it returns the same string or number
when called twice in a row. If the expression returns an object (including #{_an} `#{_Array}`),
it returns the same object *reference* when called twice in a row.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a template-statements}
## Template statements

A template **statement** responds to an **event** raised by a binding target
such as an element, component, or directive.
You'll see template statements in the [event binding](#event-binding) section,
appearing in quotes to the right of the `=`&nbsp;symbol as in `(event)="statement"`.


{@example 'template-syntax/ts/src/app/app.component.html' region='context-component-statement'}

A template statement *has a side effect*.
That's the whole point of an event.
It's how you update application state from user action.

Responding to events is the other side of Angular's "unidirectional data flow".
You're free to change anything, anywhere, during this turn of the event loop.

Like template expressions, template *statements* use a language that looks like #{_JavaScript}.
The template statement parser is different than the template expression parser and
specifically supports both basic assignment (`=`) and chaining expressions 
(with !{__chaining_op}).

However, certain #{_JavaScript} syntax is not allowed:
* !{__new_op}
* increment and decrement operators, `++` and `--`
* operator assignment, such as `+=` and `-=`
* the bitwise operators `|` and `&`
* the [template expression operators](#expression-operators)
### Statement context

As with expressions, statements can refer only to what's in the statement context
such as an event handling method of the component instance.
The *statement context* is typically the component instance. 
The *deleteHero* in `(click)="deleteHero()"` is a method of the data-bound component.

{@example 'template-syntax/ts/src/app/app.component.html' region='context-component-statement'}

The statement context may also refer to properties of the template's own context.
In the following examples, the template `$event` object,
a [template input variable](#template-input-variable) (`let hero`),
and a [template reference variable](#ref-vars) (`#heroForm`)
are passed to an event handling method of the component.

{@example 'template-syntax/ts/src/app/app.component.html' region='context-var-statement'}

Template context names take precedence over component context names.
In `deleteHero(hero)` above, the `hero` is the template input variable, not the component's `hero` property.
### Statement guidelines

As with expressions, avoid writing complex template statements.
A method call or simple property assignment should be the norm.

Now that you have a feel for template expressions and statements,
you're ready to learn about the varieties of data binding syntax beyond interpolation.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a binding-syntax}
## Binding syntax: An overview
Data binding is a mechanism for coordinating what users see with application data values.
While you could push values to and pull values from HTML,
the application is easier to write, read, and maintain if you turn these chores over to a binding framework.
You simply declare bindings between binding sources and target HTML elements and let the framework do the work.

Angular provides many kinds of data binding. 
This guide covers most of them, after a high-level view of Angular data binding and its syntax.

Binding types can be grouped into three categories distinguished by the direction of data flow:
from the _source-to-view_, from _view-to-source_, and in the two-way sequence: _view-to-source-to-view_.
:
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
      Data direction
    </th>


    <th>
      Syntax
    </th>


    <th>
      Type
    </th>


  </tr>


  <tr>

    <td>
      One-way<br>from data source<br>to view target
    </td>


    <td>

      <code-example>
        {{expression}}        
                [target] = "expression"        
                bind-target = "expression"
      </code-example>


    </td>


    <td>
      Interpolation<br>      
            Property<br>      
            Attribute<br>      
            Class<br>      
            Style
    </td>


    <tr>

      <td>
        One-way<br>from view target<br>to data source
      </td>


      <td>

        <code-example>
          (target) = "statement"          
                    on-target = "statement"
        </code-example>


      </td>


      <td>
        Event
      </td>


    </tr>


    <tr>

      <td>
        Two-way
      </td>


      <td>

        <code-example>
          [(target)] = "expression"          
                    bindon-target = "expression"
        </code-example>


      </td>


      <td>
        Two-way
      </td>


    </tr>


  </tr>


</table>

Binding types other than interpolation have a **target name** to the left of the equal sign,
either surrounded by punctuation (`[]`, `()`) or preceded by a prefix (`bind-`, `on-`, `bindon-`).

The target name is the name of a _property_. It may look like the name of an _attribute_ but it never is.
To appreciate the difference, you must develop a new way to think about template HTML.

### A new mental model

With all the power of data binding and the ability to extend the HTML vocabulary
with custom markup, it is tempting to think of template HTML as *HTML Plus*.

It really *is* HTML Plus.
But it's also significantly different than the HTML you're used to.
It requires a new mental model.

In the normal course of HTML development, you create a visual structure with HTML elements, and
you modify those elements by setting element attributes with string constants.


{@example 'template-syntax/ts/src/app/app.component.html' region='img+button'}

You still create a structure and initialize attribute values this way in Angular templates.

Then you learn to create new elements with components that encapsulate HTML
and drop them into templates as if they were native HTML elements.

{@example 'template-syntax/ts/src/app/app.component.html' region='hero-detail-1'}

That's HTML Plus.

Then you learn about data binding. The first binding you meet might look like this:


{@example 'template-syntax/ts/src/app/app.component.html' region='disabled-button-1'}

You'll get to that peculiar bracket notation in a moment. Looking beyond it,
your intuition suggests that you're binding to the button's `disabled` attribute and setting
it to the current value of the component's `isUnchanged` property.

Your intuition is incorrect! Your everyday HTML mental model is misleading.
In fact, once you start data binding, you are no longer working with HTML *attributes*. You aren't setting attributes.
You are setting the *properties* of DOM elements, components, and directives.

### HTML attribute vs. DOM property

The distinction between an HTML attribute and a DOM property is crucial to understanding how Angular binding works.

**Attributes are defined by HTML. Properties are defined by the DOM (Document Object Model).**

* A few HTML attributes have 1:1 mapping to properties. `id` is one example.

* Some HTML attributes don't have corresponding properties. `colspan` is one example.

* Some DOM properties don't have corresponding attributes. `textContent` is one example.

* Many HTML attributes appear to map to properties ... but not in the way you might think!

That last category is confusing until you grasp this general rule:

**Attributes *initialize* DOM properties and then they are done.
Property values can change; attribute values can't.**

For example, when the browser renders `<input type="text" value="Bob">`, it creates a
corresponding DOM node with a `value` property *initialized* to "Bob".

When the user enters "Sally" into the input box, the DOM element `value` *property* becomes "Sally".
But the HTML `value` *attribute* remains unchanged as you discover if you ask the input element
about that attribute: `input.getAttribute('value') // returns "Bob"`

The HTML attribute `value` specifies the *initial* value; the DOM `value` property is the *current* value.

The `disabled` attribute is another peculiar example. A button's `disabled` *property* is
`false` by default so the button is enabled.
When you add the `disabled` *attribute*, its presence alone initializes the  button's `disabled` *property* to `true`
so the button is disabled.

Adding and removing the `disabled` *attribute* disables and enables the button. The value of the *attribute* is irrelevant,
which is why you cannot enable a button by writing `<button disabled="false">Still Disabled</button>`.

Setting the button's `disabled` *property*  (say, with an Angular binding) disables or enables the button.
The value of the *property* matters.

**The HTML attribute and the DOM property are not the same thing, even when they have the same name.**
This fact bears repeating:
**Template binding works with *properties* and *events*, not *attributes*.**


~~~ {.callout.is-helpful}


<header>
  A world without attributes
</header>

In the world of Angular, the only role of attributes is to initialize element and directive state.
When you write a data binding, you're dealing exclusively with properties and events of the target object.
HTML attributes effectively disappear.

~~~

With this model firmly in mind, read on to learn about binding targets.

### Binding targets
The **target of a data binding** is something in the DOM.
Depending on the binding type, the target can be an
(element | component | directive) property, an
(element | component | directive) event, or (rarely) an attribute name.
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
      
      
      {@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-syntax-1'}
      
      
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
      
      
      {@example 'template-syntax/ts/src/app/app.component.html' region='event-binding-syntax-1'}
      
      
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
      
      
      {@example 'template-syntax/ts/src/app/app.component.html' region='2-way-binding-syntax-1'}
      
      
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
      
      
      {@example 'template-syntax/ts/src/app/app.component.html' region='attribute-binding-syntax-1'}
      
      
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
      
      
      {@example 'template-syntax/ts/src/app/app.component.html' region='class-binding-syntax-1'}
      
      
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
      
      
      {@example 'template-syntax/ts/src/app/app.component.html' region='style-binding-syntax-1'}
      
      
    </td>


  </tr>


</table>

</div>With this broad view in mind, you're ready to look at binding types in detail.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a property-binding}
## Property binding ( <span class="syntax">[property]</span> )
Write a template **property binding** to set a property of a view element.
The binding sets the property to the value of a [template expression](#template-expressions).

The most common property binding sets an element property to a component property value. An example is
binding the `src` property of an image element to a component's `heroImageUrl` property:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-1'}

Another example is disabling a button when the component says that it `isUnchanged`:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-2'}

Another is setting a property of a directive:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-3'}

Yet another is setting the model property of a custom component (a great way
for parent and child components to communicate):

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-4'}

### One-way *in*
People often describe property binding as *one-way data binding* because it flows a value in one direction,
from a component's data property into a target element property.

You cannot use property binding to pull values *out* of the target element.
You can't bind to a property of the target element to _read_ it. You can only _set_ it.

Similarly, you cannot use property binding to *call* a method on the target element.

If the element raises events, you can listen to them with an [event binding](#event-binding).

If you must read a target element property or call one of its methods,
you'll need a different technique.
See the API reference for
[ViewChild](../api/core/index/ViewChild-decorator.html) and
[ContentChild](../api/core/index/ContentChild-decorator.html).
### Binding target
An element property between enclosing square brackets identifies the target property. The target property in the following code is the image element's `src` property.


{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-1'}

Some people prefer the `bind-` prefix alternative, known as the *canonical form*:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-5'}

The target name is always the name of a property, even when it appears to be the name of something else. 
You see `src` and may think it's the name of an attribute. No. It's the name of an image element property.

Element properties may be the more common targets,
but Angular looks first to see if the name is a property of a known directive,
as it is in the following example:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-3'}


Technically, Angular is matching the name to a directive [input](#inputs-outputs),
one of the property names listed in the directive's `inputs` array or a property decorated with `@Input()`.
Such inputs map to the directive's own properties.If the name fails to match a property of a known directive or element, Angular reports an “unknown directive” error.

### Avoid side effects
As mentioned previously, evaluation of a template expression should have no visible side effects. 
The expression language itself does its part to keep you safe. 
You can't assign a value to anything in a property binding expression nor use the increment and decrement operators.

Of course, the expression might invoke a property or method that has side effects. 
Angular has no way of knowing that or stopping you.

The expression could call something like `getFoo()`. Only you know what `getFoo()` does.
If `getFoo()` changes something and you happen to be binding to that something, you risk an unpleasant experience. 
Angular may or may not display the changed value. Angular may detect the change and throw a warning error. 
In general, stick to data properties and to methods that return values and do no more.

### Return the proper type
The template expression should evaluate to the type of value expected by the target property.
Return a string if the target property expects a string.
Return a number if the target property expects a number.
Return an object if the target property expects an object.

The `hero` property of the `HeroDetail` component expects a `Hero` object, which is exactly what you're sending in the property binding:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-4'}

### Remember the brackets
The brackets tell Angular to evaluate the template expression.
If you omit the brackets, Angular treats the string as a constant and *initializes the target property* with that string.
It does *not* evaluate the string!

Don't make the following mistake:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-6'}



{@a one-time-initialization}
### One-time string initialization
You *should* omit the brackets when all of the following are true:
* The target property accepts a string value.
* The string is a fixed value that you can bake into the template.
* This initial value never changes.

You routinely initialize attributes this way in standard HTML, and it works
just as well for directive and component property initialization.
The following example initializes the `prefix` property of the `HeroDetailComponent` to a fixed string,
not a template expression. Angular sets it and forgets about it.

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-7'}

The `[hero]` binding, on the other hand, remains a live binding to the component's `currentHero` property.

### Property binding or interpolation?
You often have a choice between interpolation and property binding. 
The following binding pairs do the same thing:

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-vs-interpolation'}

_Interpolation_ is a convenient alternative to _property binding_ in many cases.

When rendering data values as strings, there is no technical reason to prefer one form to the other.
You lean toward readability, which tends to favor interpolation.
You suggest establishing coding style rules and choosing the form that
both conforms to the rules and feels most natural for the task at hand.

When setting an element property to a non-string data value, you must use _property binding_.
#### Content security
Imagine the following *malicious content*.

{@example 'template-syntax/ts/src/app/app.component.ts' region='evil-title'}

Fortunately, Angular data binding is on alert for dangerous HTML.
It *sanitizes* the values before displaying them.
It **will not** allow HTML with script tags to leak into the browser, neither with interpolation
nor property binding.

{@example 'template-syntax/ts/src/app/app.component.html' region='property-binding-vs-interpolation-sanitization'}

Interpolation handles the script tags differently than property binding but both approaches render the
content harmlessly.
<figure class='image-display'>
  <img src='/resources/images/devguide/template-syntax/evil-title.png' alt="evil title made safe" width='500px'>  </img>
</figure>

&nbsp;<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a other-bindings}
## Attribute, class, and style bindings
The template syntax provides specialized one-way bindings for scenarios less well suited to property binding.

### Attribute binding
You can set the value of an attribute directly with an **attribute binding**.
This is the only exception to the rule that a binding sets a target property. This is the only binding that creates and sets an attribute.
This guide stresses repeatedly that setting an element property with a property binding is always preferred to setting the attribute with a string. Why does Angular offer attribute binding?

**You must use attribute binding when there is no element property to bind.**

Consider the [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA),
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), and
table span attributes. They are pure attributes.
They do not correspond to element properties, and they do not set element properties.
There are no property targets to bind to.

This fact becomes painfully obvious when you write something like this.
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

{@example 'template-syntax/ts/src/app/app.component.html' region='attrib-binding-colspan'}

Here's how the table renders:
<table border="1px">
  <tr><td colspan="2">One-Two</td></tr>
  <tr><td>Five</td><td>Six</td></tr>
 </table>

One of the primary use cases for attribute binding
is to set ARIA attributes, as in this example:

{@example 'template-syntax/ts/src/app/app.component.html' region='attrib-binding-aria'}

<a href="#toc">back to top</a>
<div class='l-hr'>

</div>

### Class binding

You can add and remove CSS class names from an element's `class` attribute with
a **class binding**.

Class binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `class`,
optionally followed by a dot (`.`) and the name of a CSS class: `[class.class-name]`.

The following examples show how to add and remove the application's "special" class
with class bindings.  Here's how to set the attribute without binding:

{@example 'template-syntax/ts/src/app/app.component.html' region='class-binding-1'}

You can replace that with a binding to a string of the desired class names; this is an all-or-nothing, replacement binding.

{@example 'template-syntax/ts/src/app/app.component.html' region='class-binding-2'}

Finally, you can bind to a specific class name.
Angular adds the class when the template expression evaluates to #{_truthy}.
It removes the class when the expression is #{_falsy}.

{@example 'template-syntax/ts/src/app/app.component.html' region='class-binding-3'}


While this is a fine way to toggle a single class name,
the [NgClass directive](#ngClass) is usually preferred when managing multiple class names at the same time.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>

### Style binding

You can set inline styles with a **style binding**.

Style binding syntax resembles property binding.
Instead of an element property between brackets, start with the prefix `style`,
followed by a dot (`.`) and the name of a CSS style property: `[style.style-property]`.


{@example 'template-syntax/ts/src/app/app.component.html' region='style-binding-1'}

Some style binding styles have a unit extension. 
The following example conditionally sets the font size in  “em” and “%” units .

{@example 'template-syntax/ts/src/app/app.component.html' region='style-binding-2'}


While this is a fine way to set a single style,
the [NgStyle directive](#ngStyle) is generally preferred when setting several inline styles at the same time.

Note that a _style property_ name can be written in either
[dash-case](glossary.html#dash-case), as shown above, or
[camelCase](glossary.html#camelcase), such as `fontSize`.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a event-binding}
## Event binding  ( <span class="syntax">(event)</span> )
The bindings directives you've met so far flow data in one direction: **from a component to an element**.

Users don't just stare at the screen. They enter text into input boxes. They pick items from lists.
They click buttons. Such user actions may result in a flow of data in the opposite direction:
**from an element to a component**.

The only way to know about a user action is to listen for certain events such as
keystrokes, mouse movements, clicks, and touches.
You declare your interest in user actions through Angular event binding.

Event binding syntax consists of a **target event** within parentheses on the left of an equal sign, and a quoted
[template statement](#template-statements) on the right.
The following event binding listens for the button's click event, calling
the component's `onSave()` method whenever a click occurs:

{@example 'template-syntax/ts/src/app/app.component.html' region='event-binding-1'}

### Target event
A **name between parentheses** &mdash; for example, `(click)` &mdash;
identifies the target event. In the following example, the target is the button's click event.

{@example 'template-syntax/ts/src/app/app.component.html' region='event-binding-1'}

Some people prefer the `on-` prefix alternative, known as the **canonical form**:

{@example 'template-syntax/ts/src/app/app.component.html' region='event-binding-2'}

Element events may be the more common targets, but Angular looks first to see if the name matches an event property
of a known directive, as it does in the following example:

{@example 'template-syntax/ts/src/app/app.component.html' region='event-binding-3'}


The `myClick` directive is further described in the section
on [aliasing input/output properties](#aliasing-io).
If the name fails to match an element event or an output property of a known directive,
Angular reports an “unknown directive” error.

### *$event* and event handling statements
In an event binding, Angular sets up an event handler for the target event.

When the event is raised, the handler executes the template statement.
The template statement typically involves a receiver, which performs an action
in response to the event, such as storing a value from the HTML control
into a model.

The binding conveys information about the event, including data values, through
an **event object named `$event`**.

The shape of the event object is determined by the target event.
If the target event is a native DOM element event, then `$event` is a
[DOM event object]( https://developer.mozilla.org/en-US/docs/Web/Events),
with properties such as `target` and `target.value`.

Consider this example:

{@example 'template-syntax/ts/src/app/app.component.html' region='without-NgModel'}

This code sets the input box `value` property by binding to the `name` property. To listen for changes to the value, the code binds to the input box's `input` event.
When the user makes changes, the `input` event is raised, and the binding executes the statement within a context that includes the DOM event object, `$event`.

To update the `name` property, the changed text is retrieved by following the path `$event.target.value`.

If the event belongs to a directive (recall that components are directives), `$event` has whatever shape the directive decides to produce.


{@a eventemitter}


{@a custom-event}
### Custom events with <span class="syntax">EventEmitter</span>

Directives typically raise custom events with an Angular [EventEmitter](../api/core/index/EventEmitter-class.html).
The directive creates an `EventEmitter` and exposes it as a property.
The directive calls `EventEmitter.emit(payload)` to fire an event, passing in a message payload, which can be anything.
Parent directives listen for the event by binding to this property and accessing the payload through the `$event` object.

Consider a `HeroDetailComponent` that presents hero information and responds to user actions.
Although the `HeroDetailComponent` has a delete button it doesn't know how to delete the hero itself.
The best it can do is raise an event reporting the user's delete request.

Here are the pertinent excerpts from that `HeroDetailComponent`:The component defines a `deleteRequest` property that returns an `EventEmitter`.
When the user clicks *delete*, the component invokes the `delete()` method, 
telling the `EventEmitter` to emit a `Hero` object.

Now imagine a hosting parent component that binds to the `HeroDetailComponent`'s `deleteRequest` event.
When the `deleteRequest` event fires, Angular calls the parent component's `deleteHero` method,
passing the *hero-to-delete* (emitted by `HeroDetail`) in the `$event` variable.

### Template statements have side effects
The `deleteHero` method has a side effect: it deletes a hero.
Template statement side effects are not just OK, but expected.

Deleting the hero updates the model, perhaps triggering other changes
including queries and saves to a remote server.
These changes percolate through the system and are ultimately displayed in this and other views.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a two-way}
## Two-way binding ( <span class="syntax">[(...)]</span> )
You often want to both display a data property and update that property when the user makes changes.

On the element side that takes a combination of setting a specific element property
and listening for an element change event.

Angular offers a special _two-way data binding_ syntax for this purpose, **`[(x)]`**.
The `[(x)]` syntax combines the brackets 
of _property binding_, `[x]`, with the parentheses of _event binding_, `(x)`.


~~~ {.callout.is-important}


<header>
  [( )] = banana in a box
</header>

Visualize a *banana in a box* to remember that the parentheses go _inside_ the brackets.


~~~

The `[(x)]` syntax is easy to demonstrate when the element has a settable property called `x`
and a corresponding event named `xChange`. 
Here's a `SizerComponent` that fits the pattern.
It has a `size` value property and a companion `sizeChange` event:


{@example 'template-syntax/ts/src/app/sizer.component.ts'}

The initial `size` is an input value from a property binding.
Clicking the buttons increases or decreases the `size`, within min/max values constraints,
and then raises (_emits_) the `sizeChange` event with the adjusted size.

Here's an example in which the `AppComponent.fontSizePx` is two-way bound to the `SizerComponent`:
The `AppComponent.fontSizePx` establishes the initial `SizerComponent.size` value.
Clicking the buttons updates the `AppComponent.fontSizePx` via the two-way binding.
The revised `AppComponent.fontSizePx` value flows through to the _style_ binding, making the displayed text bigger or smaller.
Try it in the <live-example></live-example>.

The two-way binding syntax is really just syntactic sugar for a _property_ binding and an _event_ binding.
Angular _desugars_ the `SizerComponent` binding into this:
The `$event` variable contains the payload of the `SizerComponent.sizeChange` event.
Angular assigns the `$event` value to the `AppComponent.fontSizePx` when the user clicks the buttons.

Clearly the two-way binding syntax is a great convenience compared to separate property and event bindings.

It would be convenient to use two-way binding with HTML form elements like `<input>` and `<select>`.
However, no native HTML element follows the `x` value and `xChange` event pattern.

Fortunately, the Angular [_NgModel_](#ngModel) directive is a bridge that enables two-way binding to form elements.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a directives}
## Built-in directives

Earlier versions of Angular included over seventy built-in directives.
The community contributed many more, and countless private directives
have been created for internal applications.

You don't need many of those directives in Angular.
You can often achieve the same results with the more capable and expressive Angular binding system.
Why create a directive to handle a click when you can write a simple binding such as this?

{@example 'template-syntax/ts/src/app/app.component.html' region='event-binding-1'}

You still benefit from directives that simplify complex tasks.
Angular still ships with built-in directives; just not as many.
You'll write your own directives, just not as many.

This segment reviews some of the most frequently used built-in directives,
classified as either [_attribute_ directives](#attribute-directives) or [_structural_ directives](#structural-directives).

<div class='l-hr'>

</div>



{@a attribute-directives}
## Built-in _attribute_ directives

Attribute directives listen to and modify the behavior of
other HTML elements, attributes, properties, and components. 
They are usually applied to elements as if they were HTML attributes, hence the name.

Many details are covered in the [_Attribute Directives_](attribute-directives.html) guide.
Many Angular modules such the [`RouterModule`](router.html "Routing and Navigation") 
and the [`FormsModule`](forms.html "Forms") have their own attribute directives.
This section is an introduction to the most commonly used attribute directives:

* [`NgClass`](#ngClass) - add and remove a set of CSS classes
* [`NgStyle`](#ngStyle) - add and remove a set of HTML styles
* [`NgModel`](#ngModel) - two-way data binding to an HTML form element
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a ngClass}
### NgClass

You typically control how elements appear
by adding and removing CSS classes dynamically.
You can bind to the `ngClass` to add or remove several classes simultaneously.

A [class binding](#class-binding) is a good way to add or remove a *single* class.

{@example 'template-syntax/ts/src/app/app.component.html' region='class-binding-3a'}

To add or remove *many* CSS classes at the same time, the `NgClass` directive may be the better choice.

Try binding `ngClass` to a key:value control !{__objectAsMap}. 
Each key of the object is a CSS class name; its value is `true` if the class should be added, 
`false` if it should be removed.
Consider a `setCurrentClasses` component method that sets a component property, 
`currentClasses` with an object that adds or removes three classes based on the 
`true`/`false` state of three other component properties:

{@example 'template-syntax/ts/src/app/app.component.ts' region='setClasses'}

Adding an `ngClass` property binding to `currentClasses` sets the element's classes accordingly:  

{@example 'template-syntax/ts/src/app/app.component.html' region='NgClass-1'}


It's up to you to call `setCurrentClassess()`, both initially and when the dependent properties change.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a ngStyle}
### NgStyle
You can set inline styles dynamically, based on the state of the component.
With `NgStyle` you can set many inline styles simultaneously.

A [style binding](#style-binding) is an easy way to set a *single* style value.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgStyle-1'}

To set *many* inline styles at the same time, the `NgStyle` directive may be the better choice.

Try binding `ngStyle` to a key:value control !{__objectAsMap}.
Each key of the object is a style name; its value is whatever is appropriate for that style.

Consider a `setCurrentStyles` component method that sets a component property, `currentStyles`
with an object that defines three styles, based on the state of three other component propertes:

{@example 'template-syntax/ts/src/app/app.component.ts' region='setStyles'}

Adding an `ngStyle` property binding to `currentStyles` sets the element's styles accordingly:

{@example 'template-syntax/ts/src/app/app.component.html' region='NgStyle-2'}


It's up to you to call `setCurrentStyles()`, both initially and when the dependent properties change.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a ngModel}
### NgModel - Two-way binding to form elements with <span class="syntax">[(ngModel)]</span>
When developing data entry forms, you often both display a data property and 
update that property when the user makes changes.

Two-way data binding with the `NgModel` directive makes that easy. Here's an example:#### Inside <span class="syntax">[(ngModel)]</span>
Looking back at the `firstName` binding, note that
you could have achieved the same result with separate bindings to
the `<input>` element's  `value` property and `input` event.

{@example 'template-syntax/ts/src/app/app.component.html' region='without-NgModel'}

That's cumbersome. Who can remember which element property to set and which element event emits user changes?
How do you extract the currently displayed text from the input box so you can update the data property?
Who wants to look that up each time?

That `ngModel` directive hides these onerous details behind its own  `ngModel` input and `ngModelChange` output properties.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgModel-3'}


The `ngModel` data property sets the element's value property and the `ngModelChange` event property
listens for changes to the element's value.

The details are specific to each kind of element and therefore the `NgModel` directive only works for an element 
supported by a [ControlValueAccessor](../api/forms/index/ControlValueAccessor-interface.html)
that adapts an element to this protocol.
The `<input>` box is one of those elements.
Angular provides *value accessors* for all of the basic HTML form elements and the
[_Forms_](forms.html) guide shows how to bind to them.

You can't apply `[(ngModel)]` to a non-form native element or a third-party custom component until you write a suitable *value accessor*,
a technique that is beyond the scope of this guide.

You don't need a _value accessor_ for an Angular component that you write because you can name the value and event properties
to suit Angular's basic [two-way binding syntax](#two-way) and skip `NgModel` altogether.
The [`sizer` shown above](#two-way) is an example of this technique.
Separate `ngModel` bindings is an improvement over binding to the element's native properties. You can do better.

You shouldn't have to mention the data property twice. Angular should be able to capture the component's data property and set it
with a single declaration, which it can with the `[(ngModel)]` syntax:

{@example 'template-syntax/ts/src/app/app.component.html' region='NgModel-1'}

Is `[(ngModel)]` all you need? Is there ever a reason to fall back to its expanded form?

The `[(ngModel)]` syntax can only _set_ a data-bound property.
If you need to do something more or something different, you can write the expanded form.

The following contrived example forces the input value to uppercase:

{@example 'template-syntax/ts/src/app/app.component.html' region='NgModel-4'}

Here are all variations in action, including the uppercase version:
<figure class='image-display'>
  <img src='/resources/images/devguide/template-syntax/ng-model-anim.gif' alt="NgModel variations">  </img>
</figure>

&nbsp;
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a structural-directives}
## Built-in _structural_ directives

Structural directives are responsible for HTML layout.
They shape or reshape the DOM's _structure_, typically by adding, removing, and manipulating
the host elements to which they are attached.

The deep details of structural directives are covered in the 
[_Structural Directives_](structural-directives.html) guide
where you'll learn:
* why you 
[_prefix the directive name with an asterisk_ (\*)](structural-directives.html#asterisk "The * in *ngIf").
* to use [`<ng-container>`](structural-directives.html#ngcontainer "<ng-container>")
to group elements when there is no suitable host element for the directive.
* how to write your own structural directive.
* that you can only apply [one structural directive](structural-directives.html#one-per-element "one per host element") to an element.

_This_ section is an introduction to the common structural directives:

* [`NgIf`](#ngIf) - conditionally add or remove an element from the DOM
* [`NgFor`](#ngFor) - repeat a template for each item in a list
* [`NgSwitch`](#ngSwitch) - a set of directives that switch among alternative views

<div class='l-hr'>

</div>



{@a ngIf}
### NgIf
You can add or remove an element from the DOM by applying an `NgIf` directive to
that element (called the _host elment_).
Bind the directive to a condition expression like `isActive` in this example.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgIf-1'}



~~~ {.alert.is-critical}

Don't forget the asterisk (`*`) in front of `ngIf`.

~~~

When the `isActive` expression returns a #{_truthy} value, `NgIf` adds the `HeroDetailComponent` to the DOM.
When the expression is #{_falsy}, `NgIf` removes the `HeroDetailComponent`
from the DOM, destroying that component and all of its sub-components.
#### Show/hide is not the same thing
You can control the visibility of an element with a
[class](#class-binding) or [style](#style-binding) binding:

{@example 'template-syntax/ts/src/app/app.component.html' region='NgIf-3'}

Hiding an element is quite different from removing an element with `NgIf`.

When you hide an element, that element and all of its descendents remain in the DOM.
All components for those elements stay in memory and
Angular may continue to check for changes.
You could be holding onto considerable computing resources and degrading performance, 
for something the user can't see.

When `NgIf` is `false`, Angular physically removes the element and its descendents from the DOM.
It destroys their components, potentially freeing up substantial resources,
resulting in a more responsive user experience.

The show/hide technique is fine for a few elements with few children.
You should be wary when hiding large component trees; `NgIf` may be the safer choice. 

#### Guard against null objects
The `ngIf` directive is often used to guard against a null object.
Show/hide is useless as a guard.
Angular will throw an error if a nested expression tries to access a property of a null object,
whether its visible or not.

Here we see `NgIf` guarding two `<div>`s. 
The `currentHero` name will appear only when there is a `currentHero`.
The `nullHero` will never be displayed.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgIf-2'}


See also the 
[_safe navigation operator_](#safe-navigation-operator "Safe naviation operator (?.)") 
described below.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a ngFor}
### NgFor
`NgFor` is a _repeater_ directive &mdash; a way to present a list of items.
You define a block of HTML that defines how a single item should be displayed.
You tell Angular to use that block as a template for rendering each item in the list.

Here is an example of `NgFor` applied to a simple `<div>`:

{@example 'template-syntax/ts/src/app/app.component.html' region='NgFor-1'}

You can also apply an `NgFor` to a component element, as in this example:

{@example 'template-syntax/ts/src/app/app.component.html' region='NgFor-2'}



~~~ {.alert.is-critical}

Don't forget the asterisk (`*`) in front of `ngFor`.

~~~

The text assigned to `*ngFor` is the instruction that guides the repeater process.


{@a microsyntax}
#### *ngFor microsyntax
The string assigned to `*ngFor` is not a [template expression](#template-expressions).
It's a *microsyntax* &mdash; a little language of its own that Angular interprets. 
The string `"let hero of heroes"` means:

> *Take each hero in the `heroes` #{_array}, store it in the local `hero` looping variable, and 
make it available to the templated HTML for each iteration.*

Angular translates this instruction into a `<template>` around the host element,
then uses this template repeatedly to create a new set of elements and bindings for each `hero` 
in the list.
Learn about the _microsyntax_ in the [_Structural Directives_](structural-directives.html#microsyntax) guide.


{@a template-input-variable}


{@a template-input-variables}
### Template input variables

The `let` keyword before `hero` creates a _template input variable_ called `hero`.
The `ngFor` directive iterates over the `heroes` #{_array} returned by the parent component's `heroes` property
and sets the `hero` element with the current item from the #{_array} during each iteration.

You reference the `hero` input variable within the `ngFor` host element (and within its descendents) to access the hero's properties.
Here it is referenced first in an interpolation
and then passed in a binding to the `hero` property of the `<hero-detail>` component.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgFor-1-2'}

Learn more about _template input variables_ in the [_Structural Directives_](structural-directives.html#template-input-variable) guide.

#### *ngFor with _index_
The `index` property of the `NgFor` directive context  returns the zero-based index of the item in each iteration.
You can capture the `index` in a template input variable and use it in the template.

The next example captures the `index` in a variable named `i` and displays it with the hero name like this.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgFor-3'}


Learn about the other `NgFor` context values such as `last`, `even`, and `odd` in the [NgFor API reference](../api/common/index/NgFor-directive.html).


{@a trackBy}
#### *ngFor with _trackBy_
The `NgFor` directive may perform poorly, especially with large lists.
A small change to one item, an item removed, or an item added can trigger a cascade of DOM manipulations.

For example, re-querying the server could reset the list with all new hero objects.

Most, if not all, are previously displayed heroes.
*You* know this because the `id` of each hero hasn't changed.
But Angular sees only a fresh list of new object references.
It has no choice but to tear down the old DOM elements and insert all new DOM elements.

Angular can avoid this churn with `trackBy`.
Add a method to the component that returns the value `NgFor` _should_ track.
In this case, that value is the hero's `id`.

{@example 'template-syntax/ts/src/app/app.component.ts' region='trackByHeroes'}

In the microsyntax expression, set `trackBy` to this method.

{@example 'template-syntax/ts/src/app/app.component.html' region='trackBy'}

Here is an illustration of the _trackBy_ effect.
"Reset heroes" creates new heroes with the same `hero.id`s.
"Change ids" creates new heroes with new `hero.id`s.
* With no `trackBy`, both buttons trigger complete DOM element replacement.
* With `trackBy`, only changing the `id` triggers element replacement. 

<figure class='image-display'>
  <img src='/resources/images/devguide/template-syntax/ng-for-track-by-anim.gif' alt="trackBy">  </img>
</figure>

<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a ngSwitch}
### The _NgSwitch_ directives

*NgSwitch* is like the JavaScript `switch` statement.
It can display _one_ element from among several possible elements, based on a _switch condition_.
Angular puts only the *selected* element into the DOM.

*NgSwitch* is actually a set of three, cooperating directives:
`NgSwitch`, `NgSwitchCase`, and `NgSwitchDefault` as seen in this example.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgSwitch'}


<figure class='image-display'>
  <img src='/resources/images/devguide/template-syntax/switch-anim.gif' alt="trackBy">  </img>
</figure>

`NgSwitch` is the controller directive. Bind it to an expression that returns the *switch value*.
The `emotion` value in this example is a string, but the switch value can be of any type.

**Bind to `[ngSwitch]`**. You'll get an error if you try to set `*ngSwitch`.
`NgSwitch` is an *attribute* directive, not a *structural* directive.
It changes the behavior of its companion directives.
It doesn't touch the DOM directly.

**Bind to `*ngSwitchCase` and `*ngSwitchDefault`**.
The `NgSwitchCase` and `NgSwitchDefault` directives are _structural_ directives
because they add or remove elements from the DOM.

* `NgSwitchCase` adds its element to the DOM when its bound value equals the switch value.

* `NgSwitchDefault` adds its element to the DOM when there is no selected `NgSwitchCase`.

The switch directives are particularly useful for adding and removing *component elements*.
This example switches among four "emotional hero" components defined in the `hero-switch.components.ts` file.
Each component has a `hero` [input property](#inputs-outputs "Input property") 
which is bound to the `currentHero` of the parent component.

Switch directives work as well with native elements and web components too.
For example, you could replace the `<confused-hero>` switch case with the following.

{@example 'template-syntax/ts/src/app/app.component.html' region='NgSwitch-div'}

<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a template-reference-variable}


{@a ref-vars}


{@a ref-var}
## Template reference variables ( <span class="syntax">#var</span> )
A **template reference variable** is often a reference to a DOM element within a template.
It can also be a reference to an Angular component or directive or a 
<a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components" target="_blank" title="MDN: Web Components">web component</a>.

Use the hash symbol (#) to declare a reference variable.
The `#phone` declares a `phone` variable on an `<input>` element.

{@example 'template-syntax/ts/src/app/app.component.html' region='ref-var'}

You can refer to a template reference variable _anywhere_ in the template.
The `phone` variable declared on this `<input>` is 
consumed in a `<button>` on the other side of the template

{@example 'template-syntax/ts/src/app/app.component.html' region='ref-phone'}

### How a reference variable gets its value

In most cases, Angular sets the reference variable's value to the element on which it was declared.
In the previous example, `phone` refers to the _phone number_ `<input>` box.
The phone button click handler passes the _input_ value to the component's `callPhone` method.
But a directive can change that behavior and set the value to something else, such as itself.
The `NgForm` directive does that.

The following is a *simplified* version of the form example in the [Forms](forms.html) guide.

{@example 'template-syntax/ts/src/app/hero-form.component.html'}

A template reference variable, `heroForm`, appears three times in this example, separated
by a large amount of HTML.
What is the value of `heroForm`?

If Angular hadn't taken it over when you imported the `FormsModule`,
it would be the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement).
The `heroForm` is actually a reference to an Angular [NgForm](../api/forms/index/NgForm-directive.html "API: NgForm") 
directive with the ability to track the value and validity of every control in the form.

The native `<form>` element doesn't have a `form` property.
But the `NgForm` directive does, which explains how you can disable the submit button 
if the `heroForm.form.valid` is invalid and pass the entire form control tree 
to the parent component's `onSubmit` method.

### Template reference variable warning notes

A template _reference_ variable (`#phone`) is _not_ the same as a template _input_ variable (`let phone`)
such as you might see in an [`*ngFor`](#template-input-variable).
Learn the difference in the [_Structural Directives_](structural-directives.html#template-input-variable) guide.

The scope of a reference variable is the _entire template_.
Do not define the same variable name more than once in the same template.
The runtime value will be unpredictable.

You can use the `ref-` prefix alternative to `#`.
This example declares the `fax` variable as `ref-fax` instead of `#fax`.

{@example 'template-syntax/ts/src/app/app.component.html' region='ref-fax'}

<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a inputs-outputs}
## Input and output properties ( <span class="syntax">@Input</span> and <span class="syntax">@Output</span> )
So far, you've focused mainly on binding to component members within template expressions and statements
that appear on the *right side of the binding declaration*.
A member in that position is a data binding **source**.

This section concentrates on binding to **targets**, which are directive
properties on the *left side of the binding declaration*.
These directive properties must be declared as **inputs** or **outputs**.


~~~ {.alert.is-important}

Remember: All **components** are **directives**.

~~~


You're drawing a sharp distinction between a data binding **target** and a data binding **source**.

The *target* of a binding is to the *left* of the `=`.
The *source* is on the *right* of the `=`.

The *target* of a binding is the property or event inside the binding punctuation: `[]`, `()` or `[()]`.
The *source* is either inside quotes (`" "`) or within an interpolation (`{{}}`).

Every member of a **source** directive is automatically available for binding.
You don't have to do anything special to access a directive member in a template expression or statement.

You have *limited* access to members of a **target** directive.
You can only bind to properties that are explicitly identified as *inputs* and *outputs*.In the following snippet, `iconUrl` and `onSave` are data-bound members of the `AppComponent`
and are referenced within quoted syntax to the _right_ of the equals&nbsp;(`=`).

{@example 'template-syntax/ts/src/app/app.component.html' region='io-1'}

They are *neither inputs nor outputs* of the component. They are **sources** for their bindings.
The targets are the native `<img>` and `<button>` elements.

Now look at a another snippet in which the `HeroDetailComponent` is the **target** of a binding on the _left_ of the equals&nbsp;(`=`).

{@example 'template-syntax/ts/src/app/app.component.html' region='io-2'}

Both `HeroDetailComponent.hero` and `HeroDetailComponent.deleteRequest` are on the **left side** of binding declarations.
`HeroDetailComponent.hero` is inside brackets; it is the target of a property binding.
`HeroDetailComponent.deleteRequest` is inside parentheses; it is the target of an event binding.

### Declaring input and output properties
Target properties must be explicitly marked as inputs or outputs.

In the `HeroDetailComponent`, such properties are marked with decorators as input and output properties.

{@example 'template-syntax/ts/src/app/hero-detail.component.ts' region='input-output-1'}


Alternatively, you can identify members in the `inputs` and `outputs` #{_array}s
of the directive metadata, as in this example:

{@example 'template-syntax/ts/src/app/hero-detail.component.ts' region='input-output-2'}

<br>You can specify an input/output property either with a decorator or in a metadata #{_array}.
Don't do both!### Input or output?

*Input* properties usually receive data values.
*Output* properties expose event producers, such as `EventEmitter` objects.

The terms _input_ and _output_ reflect the perspective of the target directive.
<figure class='image-display'>
  <img src='/resources/images/devguide/template-syntax/input-output.png' alt="Inputs and outputs">  </img>
</figure>

`HeroDetailComponent.hero` is an **input** property from the perspective of `HeroDetailComponent`
because data flows *into* that property from a template binding expression.

`HeroDetailComponent.deleteRequest` is an **output** property from the perspective of `HeroDetailComponent`
because events stream *out* of that property and toward the handler in a template binding statement.

<h3 id='aliasing-io'>
  Aliasing input/output properties
</h3>

Sometimes the public name of an input/output property should be different from the internal name.

This is frequently the case with [attribute directives](attribute-directives.html).
Directive consumers expect to bind to the name of the directive.
For example, when you apply a directive with a `myClick` selector to a `<div>` tag,
you expect to bind to an event property that is also called `myClick`.

{@example 'template-syntax/ts/src/app/app.component.html' region='myClick'}

However, the directive name is often a poor choice for the name of a property within the directive class.
The directive name rarely describes what the property does.
The `myClick` directive name is not a good name for a property that emits click messages.

Fortunately, you can have a public name for the property that meets conventional expectations,
while using a different name internally.
In the example immediately above, you are actually binding *through the* `myClick` *alias* to
the directive's own `clicks` property.

You can specify the alias for the property name by passing it into the input/output decorator like this:


{@example 'template-syntax/ts/src/app/click.directive.ts' region='output-myClick'}


You can also alias property names in the `inputs` and `outputs` #{_array}s.
You write a colon-delimited (`:`) string with
the directive property name on the *left* and the public alias on the *right*:

{@example 'template-syntax/ts/src/app/click.directive.ts' region='output-myClick2'}

<a href="#toc">back to top</a>
<div class='l-hr'>
   
</div>



{@a expression-operators}
## Template expression operators
The template expression language employs a subset of #{_JavaScript} syntax supplemented with a few special operators
for specific scenarios. The next sections cover two of these operators: _pipe_ and _safe navigation operator_.


{@a pipe}
### The pipe operator ( <span class="syntax">|</span> )
The result of an expression might require some transformation before you're ready to use it in a binding.
For example, you might display a number as a currency, force text to uppercase, or filter a list and sort it.

Angular [pipes](./pipes.html) are a good choice for small transformations such as these.
Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the **pipe operator (`|`)**:

{@example 'template-syntax/ts/src/app/app.component.html' region='pipes-1'}

The pipe operator passes the result of an expression on the left to a pipe function on the right.

You can chain expressions through multiple pipes:

{@example 'template-syntax/ts/src/app/app.component.html' region='pipes-2'}

And you can also [apply parameters](./pipes.html#parameterizing-a-pipe) to a pipe:

{@example 'template-syntax/ts/src/app/app.component.html' region='pipes-3'}

<a href="#toc">back to top</a>
<div class='l-hr'>

</div>



{@a safe-navigation-operator}
### The safe navigation operator ( <span class="syntax">?.</span> ) and null property paths

The Angular **safe navigation operator (`?.`)** is a fluent and convenient way to guard against null and undefined values in property paths.
Here it is, protecting against a view render failure if the `currentHero` is null.

{@example 'template-syntax/ts/src/app/app.component.html' region='safe-2'}

What happens when the following data bound `title` property is null?

{@example 'template-syntax/ts/src/app/app.component.html' region='safe-1'}

The view still renders but the displayed value is blank; you see only "The title is" with nothing after it.
That is reasonable behavior. At least the app doesn't crash.

Suppose the template expression involves a property path, as in this next example
that displays the `firstName` of a null hero.

<code-example language="html">
  The null hero's name is {{nullHero.firstName}}  
    
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

You could code around that problem with [*ngIf](#ngIf).

{@example 'template-syntax/ts/src/app/app.component.html' region='safe-4'}

These approaches have merit but can be cumbersome, especially if the property path is long.
Imagine guarding against a null somewhere in a long property path such as `a.b.c.d`.

The Angular safe navigation operator (`?.`) is a more fluent and convenient way to guard against nulls in property paths.
The expression bails out when it hits the first null value.
The display is blank, but the app keeps rolling without errors.

{@example 'template-syntax/ts/src/app/app.component.html' region='safe-6'}

It works perfectly with long property paths such as `a?.b?.c?.d`.
<a href="#toc">back to top</a>
<div class='l-hr'>

</div>

## Summary
You've completed this survey of template syntax. 
Now it's time to put that knowledge to work on your own components and directives.