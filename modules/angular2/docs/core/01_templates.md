# Templates

Templates are markup which is added to HTML to declaratively describe how the application model should be
projected to DOM as well as which DOM events should invoke which methods on the controller. Templates contain
syntax which is core to Angular and allows for data-binding, event-binding, template-instantiation.

The design of the template syntax has these properties:


* All data-binding expressions are easily identifiable. (i.e. there is never an ambiguity whether the value should be
  interpreted as string literal or as an expression.)
* All events and their statements are easily identifiable.
* All places of DOM instantiation are easily identifiable.
* All places of variable declaration are easily identifiable.

The above properties guarantee that the templates are easy to parse by tools (such as IDEs) and reason about by people.
At no point is it necessary to understand which directives are active or what their semantics are in order to reason
about the template runtime characteristics.



## Summary

Below is a summary of the kinds of syntaxes which Angular templating supports. The syntaxes are explained in more
detail in the following sections.

<table>
  <thead>
    <tr>
      <th>Description</th><th>Short</th><th>Canonical</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>Text Interpolation</th>
      <td>
<pre>
```
<div>{{exp}}</div>
```
</pre>

Example:
<pre>
```
<div>
  Hello {{name}}!
  <br>
  Goodbye {{name}}!
</div>
```
</pre>
      </td>
      <td>
`<div [text|index]=exp>`

Example:
<pre>
```
<div
  [text|0]=" 'Hello' + stringify(name) + '!' "
  [text|2]=" 'Goodbye' + stringify(name) + '!' ">
  _<b>x</b>_
</div>
```
</pre>
      </td>
    </tr>
    <tr>
      <th>Property Interpolation</th>
      <td>
<pre>
```
<div name="{{exp}}">
```
</pre>

Example:

<pre>
```
<div class="{{selected}}">`
```
</pre>
      </td>
      <td>
<pre>
```
<div [name]="stringify(exp)">
```
</pre>

Example:

<pre>
```
<div [class]="stringify(selected)">
```
</pre>
      </td>
    </tr>
    <tr>
      <th>Property binding</th>
      <td>
`<div [prop]="exp">`

Example:

`<div [hidden]="true">`
      </td>
      <td>
`<div bind-prop="exp">`

Example:

`<div bind-hidden="true">`
      </td>
    </tr>
    <tr>
      <th>Event binding (non-bubbling)</th>
      <td>
`<div (event)="statement">`

Example:

`<div (click)="doX()">`
      </td>
      <td>
`<div on-event="statement">`

Example:

`<div on-click="doX()">`
      </td>
    </tr>
    <tr>
      <th>Event binding (bubbling)</th>
      <td>
`<div (^event)="statement">`

Example:

`<div (^mouseover)="hlite()">`
      </td>
      <td>
`<div on-bubble-event="statement">`

Example:

`<div on-bubble-mouseover="hlite()">`
      </td>
    </tr>
    <tr>
      <th>Declare reference</th>
      <td>
`<div #symbol>`

Example:

<pre>
```
<video #player>
<button (click)="player.play()">play</button>
```
</pre>
      </td>
      <td>
`<div def="symbol">`

Example:

<pre>
```
<video def="player">
<button on-click="player.play()">play</button>
```
</pre>
      </td>
    </tr>
    <tr>
      <th>Inline Template</th>
      <td>
`<div template="...">...</div>`

Example:

<pre>
```
<ul>
  <li template="for: #item of items">
    {{item}}
  </li>
</ul>
```
</pre>
      </td>
      <td>
`<template>...</template>`

Example:
<pre>
```
<ul>
  <template def-for:"item"
            bind-for-in="items">
    <li>
      {{item}}
    </li>
  </template>
</ul>
```
</pre>
      </td>
    </tr>
    <tr>
      <th>Explicit Template</th>
      <td>
`<template>...</template>`

Example:

<pre>
```
<template #for="item"
          [for-in]="items">
  _some_content_to_repeat_
</template>
```
</pre>
      </td>
      <td>
`<template>...</template>`

Example:
<pre>
```
<template def-for="item"
          bind-for-in="items">
  _some_content_to_repeat_
</template>
```
</pre>
      </td>
    </tr>
  </tbody>
</table>



## Property Binding

Binding application model data to the UI is the most common kind of bindings in an Angular application. The bindings
are always in the form of `property-name` which is assigned an `expression`. The generic form is:

<table>
  <tr>
    <th>Short form</th>
    <td>`<some-element [some-property]="expression">`</td>
  </tr>
  <tr>
    <th>Canonical form</th>
    <td>`<some-element bind-some-property="expression">`</td>
  </tr>
</table>


Where:
* `some-element` can be any existing DOM element.
* `some-property` (escaped with `[]` or `bind-`) is the name of the property on `some-element`. In this case the
  dash-case is converted into camel-case `someProperty`.
* `expression` is a valid expression (as defined in section below).

Example:
```
<div [title]="user.firstName">
```

In the above example the `title` property of the `div` element will be updated whenever the `user.firstName` changes
its value.

Key points:
* The binding is to the element property not the element attribute.
* To prevent custom element from accidentally reading the literal `expression` on the title element, the attribute name
  is escaped. In our case the `title` is escaped to `[title]` through the addition of square brackets `[]`.
* A binding value (in this case `user.firstName` will always be an expression, never a string literal).

NOTE: Unlike Angular v1, Angular v2 binds to properties of elements rather than attributes of elements. This is
done to better support custom elements, and to allow binding for values other than strings.

NOTE: Some editors/server side pre-processors may have trouble generating `[]` around the attribute name. For this
reason Angular also supports a canonical version which is prefixed using `bind-`.



### String Interpolation

Property bindings are the only data bindings which Angular supports, but for convenience Angular supports an interpolation
syntax which is just a short hand for the data binding syntax.

```
<span>Hello {{name}}!</span>
```

is a short hand for:

```
<span [text|0]=" 'Hello ' + stringify(name) + '!' ">_</span>
```

The above says to bind the `'Hello ' + stringify(name) + '!'` expression to the zero-th child of the `span`'s `text`
property. The index is necessary in case there are more than one text nodes, or if the text node we wish to bind to
is not the first one.

Similarly the same rules apply to interpolation inside attributes.

```
<span title="Hello {{name}}!"></span>
```

is a short hand for:

```
<span [title]=" 'Hello ' + stringify(name) + '!' "></span>
```

NOTE: `stringify()` is a built in implicit function which converts its argument to a string representation, while
keeping `null` and `undefined` as empty strings.




## Local Variables




## Inline Templates

Data binding allows updating the DOM's properties, but it does not allow for changing of the DOM structure. To change
DOM structure we need the ability to define child templates, and then instantiate these templates into Views. The
Views than can be inserted and removed as needed to change the DOM structure.

<table>
  <tr>
    <th>Short form</th>
    <td>
```
parent template
<element>
  <some-element template="instantiating-directive-microsyntax">child template</some-element>
</element>
```
    </td>
  </tr>
  <tr>
    <th>Canonical form</th>
    <td>
```
parent template
<element>
  <template instantiating-directive-bindings>
    <some-element>child template</some-element>
  </template>
</element>
```
    </td>
  </tr>
</table>

Where:
* `template` defines a child template and designates the anchor where Views (instances of the template) will be
  inserted. The template can be defined implicitly with `template` attribute, which turns the current element into
  a template, or explicitly with `<template>` element. Explicit declaration is longer, but it allows for having
  templates which have more than one root DOM node.
* `viewport` is required for templates. The directive is responsible for deciding when
  and in which order should child views be inserted into this location. Such a directive usually has one or
  more bindings and can be represented as either `viewport-directive-bindings` or
  `viewport-directive-microsyntax` on `template` element or attribute. See template microsyntax for more details.


Example of conditionally included template:

```
Hello {{user}}!
<div template="ng-if: isAdministrator">
  ...administrator menu here...
</div>
```

In the above example the `ng-if` directive determines whether the child view (an instance of the child template) should be
inserted into the root view. The `ng-if` makes this decision based on if the `isAdministrator` binding is true.

The above example is in the short form, for better clarity let's rewrite it in the canonical form, which is functionally
identical.

```
Hello {{user}}!
<template [ng-if]="isAdministrator">
  <div>
    ...administrator menu here...
  </div>
</template>
```


### Template Microsyntax

Often times it is necessary to encode a lot of different bindings into a template to control how the instantiation
of the templates occurs. One such example is `ng-for`.

```
<form #foo=form>
</form>
<ul>
  <template [ng-for] #person [ng-for-of]="people" #i="index">
    <li>{{i}}. {{person}}<li>
  </template>
</ul>
```

Where:
* `[ng-for]` triggers the for directive.
* `#person` exports the implicit `ng-for` item. 
* `[ng-for-of]="people"` binds an iterable object to the `ng-for` controller.
* `#i=index` exports item index as `i`.

The above example is explicit but quite wordy. For this reason in most situations a short hand version of the
syntax is preferable.

```
<ul>
  <li template="ng-for; #person; of=people; #i=index;">{{i}}. {{person}}<li>
</ul>
```

Notice how each key value pair is translated to a `key=value;` statement in the `template` attribute. This makes the
repeat syntax a much shorter, but we can do better. Turns out that most punctuation is optional in the short version
which allows us to further shorten the text.

```
<ul>
  <li template="ng-for #person of people #i=index">{{i}}. {{person}}<li>
</ul>
```

We can also optionally use `var` instead of `#` and add `:` to `for` which creates the following recommended
microsyntax for `ng-for`.

```
<ul>
  <li template="ng-for: var person of people; var i=index">{{i}}. {{person}}<li>
</ul>
```

Finally, we can move the `ng-for` keyword to the left hand side and prefix it with `*` as so:

```
<ul>
  <li *ng-for="var person of people; var i=index">{{i}}. {{person}}<li>
</ul>
```


The format is intentionally defined freely, so that developers of directives can build an expressive microsyntax for
their directives. The following code describes a more formal definition.

```
expression: ...                     // as defined in Expressions section
local: [a-zA-Z][a-zA-Z0-9]*         // exported variable name available for binding
internal: [a-zA-Z][a-zA-Z0-9]*      // internal variable name which the directive exports.
key: [a-z][-|_|a-z0-9]]*            // key which maps to attribute name
keyExpression: key[:|=]?expression  // binding which maps an expression to a property
varExport: [#|var]local(=internal)? // binding which exports a local variable from a directive
microsyntax: ([[key|keyExpression|varExport][;|,]?)*
```

Where
* `expression` is an Angular expression as defined in section: Expressions
* `local` is a local identifier for local variables.
* `internal` is an internal variable which the directive exports for binding.
* `key` is an attribute name usually only used to trigger a specific directive.
* `keyExpression` is an property name to which the expression will be bound to.
* `varExport` allows exporting of directive internal state as variables for further binding. If no `internal` name
  is specified, the exporting is to an implicit variable.
* `microsyntax` allows you to build a simple microsyntax which can still clearly identify which expressions bind to
  which properties as well as which variables are exported for binding.


NOTE: the `template` attribute must be present to make it clear to the user that a sub-template is being created. This
goes along with the philosophy that the developer should be able to reason about the template without understanding the
semantics of the instantiator directive.




## Binding Events

Binding events allows wiring events from DOM (or other components) to the Angular controller.

<table>
  <tr>
    <th>Short form</th>
    <td>`<some-element (some-event)="statement">`</td>
  </tr>
  <tr>
    <th>Canonical form</th>
    <td>`<some-element on-some-event="statement">`</td>
  </tr>
</table>

Where:
* `some-element` Any element which can generate DOM events (or has an angular directive which generates the event).
* `some-event` (escaped with `()` or `on-`) is the name of the event `some-event`. In this case the
  dash-case is converted into camel-case `someEvent`.
* `statement` is a valid statement (as defined in section below).
If the execution of the statement returns `false`, then `preventDefault`is applied on the DOM event.

By default, angular only listens to the element on the event, and ignores events which bubble. To listen to bubbled
events (as in the case of clicking on any child) use the bubble option (`(event)` or `on-bubble-event`) as shown
below.

<table>
  <tr>
    <th>Short form</th>
    <td>`<some-element (^some-event)="statement">`</td>
  </tr>
  <tr>
    <th>Canonical form</th>
    <td>`<some-element on-bubble-some-event="statement">`</td>
  </tr>
</table>


Example:
```
@Component(...)
class Example {
  submit() {
    // do something when button is clicked
  }
}

<button (click)="submit()">Submit</button>
```

In the above example, when clicking on the submit button angular will invoke the `submit` method on the surrounding
component's controller.


NOTE: Unlike Angular v1, Angular v2 treats event bindings as core constructs not as directives. This means that there
is no need to create a event directive for each kind of event. This makes it possible for Angular v2 to easily
bind to custom events of Custom Elements, whose event names are not known ahead of time.




## Expressions, Statements and Formatters

Angular templates contain expressions for binding to data and statements for binding to events. Expressions and statements
have different semantics.


### Expressions

Expressions can be used to bind to properties only. Expressions represent how data should be projected to the View.
Expressions should not have any side effects and should be idempotent. Examples of where expressions can be used in
Angular are:
```
<div title="{{expression}}">{{expression}}</div>
<div [title]="expression">...</div>
<div bind-title="expression">...</div>
<div template="ng-if: expression">...</div>
```

Expressions are simplified version of expression in the language in which you are writing your application. (i.e.
expressions follow JS syntax and semantics in JS and Dart syntax and semantics in Dart). Unlike expressions in the
language, binding expressions behave differently in following ways:

* *Must be defined*: Unlike Angular v1, Angular v2 will throw an error on dereferencing fields which are not defined.
  For example: `user.name` will throw an error if `user` is defined but it does not have `name` property. If the `name`
  property is not known, it must be declared and set to some value such as empty string, `null` (or `undefined` in JS).
  This is done to allow early detection of errors in the templates.
* *Safe dereference*: Expressions `user.name` where `user` is null will throw `NullPointerException` in the language.
  In contrast Angular will silently ignore `null` on `user`. This is done because Views often have to wait for the data
  to arrive from the backend and many fields will be `null` until the data arrives. Safe dereference is so common in the
  Views that we have made it the default.
* *Single expression*: An expression must be a single statement. (i.e. no `;`)
* *No assignments*: Binding expressions can not contain assignments.
* *No keywords*: Binding expressions can not contain keywords such as: `var`, `if`, and so on.
* *Formatters*: Angular expressions can be piped through formatters to further transform the binding value.
  (See: Formatters)

Examples of some expressions and their behavior:

Given:
```
class Greeter {
  name:string;
}
```

* `name` : Will result in the value of the `name` property on the `Greeter` class.
* `name.length`: Will result in either the length of the `name` string or `undefined` (`null` in Dart) if `name`
  property is `null` or `undefined`. Example of: safe dereference.
* `foo`: Will throw an error because `foo` is not declared on the `Greeter` class. Example of: Must be defined
* `name=1`: Not allowed because of assignment.
* `name; name.length`: Not allowed because of multiple statements.



### Statements

Statements can be used to bind to events only. Statements represent actions to trigger as a response to an event.
Examples of where statements can be used in Angular are:
```
<div (click)="statements">...</div>
<div on-click="statements">...</div>
```

Statements are similar to statements in the language in which you are writing your application. (i.e.
statements follow JS syntax and semantics in JS and Dart syntax and semantics in Dart). Unlike statements in the
language, binding expressions behave differently in the following ways:

* *Unsafe dereference*: Expressions `user.verify()` where `user` is `null` will throw `NullPointerException` in the
  language as well as in statements. (In contrast to Safe dereference in Angular expressions.) While Angular protects
  you from null dereferencing in expressions due to lazy loading of data, no such protection is required for statements,
  and doing so would make it harder to detect typos in statements.
* *Multiple statements OK*: Statements can be composed from more than one statement. (i.e. no `doA(); doB()`)
* *Assignments OK*: Event bindings can have side effects and hence assignments are allowed.
* *No keywords*: Statements can not contain keywords such as: `var`, `if`, and so on.
* *No Formatters*: Angular statements can not contain formatters. (Formatters are only useful for data binding)

## Further Reading

* [Template Syntax Constraints and Reasoning](https://docs.google.com/document/d/1HHy_zPLGqJj0bHMiWPzPCxn1pO5GlOYwmv-qGgl4f_s)
