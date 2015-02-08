# Expressions and Statements

Expressions and statements are small code snippets which are placed in the Angular templates. Following example shows where in the template can expressions and statements be located.

```
<h1>{{expression}}</h1>
<div [property1]="expression" property2="{{expression}}">
<button (click)="statement">OK</button>
<div !foreach="#varName in expression">...</div>
```

<table>
  <tr>
    <th></th>
    <th>Expressions</th>
    <th>Statements</th>
  </tr>
  <tr>
    <th>Used in:</th>
    <td>String in; Property binding; Template binding</td>
    <td>Events</td>
  </tr>
  <tr>
    <th>Execution</th>
    <td>During Change Detection</td>
    <td>Due to event before Change Detection</td>
  </tr>
  <tr>
    <th>Null dereference</th>
    <td>Forgiving / Silent</td>
    <td>Error</td>
  </tr>
  <tr>
    <th>Idempotent (side-effects)</th>
    <td>NO</td>
    <td>YES</td>
  </tr>
  <tr>
    <th>Assignments</th>
    <td>Not allowed</td>
    <td>Allowed</td>
  </tr>
  <tr>
    <th>Multiple</th>
    <td>Single expression</td>
    <td>Multiple statements separated by ';'</td>
  </tr>
  <tr>
    <th>Formatters</th>
    <td>Allowed at an end of expression only</td>
    <td>Not allowed</td>
  </tr>
</table>



## Expressions

Expressions are bindings which are executed as part of the Change Detection. While Change Detection guarantees that the changes are delived in the order in which they are declared in the template, the individual sub-parts of the expressions may be executed in any order due to sub-expression coelescence. 

Example `<span>Hello: {{user.last}}, {{user.first}}</span>` is made up of `user`, `last`, and `first`. The change detection may chose to evaluate the `user` only once since it is a common sub-expression for the two expressions used in the binding.

Expressions are forgiving in nature. In the above example if `user` is `null` the `user.last` will not throw an error, instead it will result in an `null` which will consequently be rendered as an empty string. This is done because during the data loading it is very common for sub-expressions to not be defined yet and placing guards around each expressions would result in too much boilerplate.


### Expressions Semantics

The expressions follow the semantics of the underlying platform with the exception of silent null dereferencing. This means that they follow JavaScript semantis in AngularJS, and Dart semantics in AngularDart.

Some example of different semantics between JavaScript and Dart: 

- `'one' + 2`: will result in `one2` in JavaScript, but an error in Dart.
- `obj['prop']`: will work for all objects in JavaScript, but only for `Map`s in Dart. (NOTE:  ES6 `Map` require `obj.get('prop')`)


### Expression Syntax

Expression syntax follows that of the platform, with few limitations (no assignment and no keywords: `if`, `for`, etc) and additon of Formatters.

Here is the list of allowed operations in Angular Expressions.

<table>
  <tr>
    <th>Name</th>
    <th>Syntax</th>
    <th>Notes</th>
  </tr>
  <tr>
    <th>Dereference</th>
    <td>`obj.prop`</td>
    <td>Silently ignores if `obj` is `null` or `undefined`.</td>
  </tr>
  <tr>
    <th>Map</th>
    <td>`obj[key]`</td>
    <td>Silently ignores if `obj` is `null` or `undefined`. <br> JavaScript treats `obj.prop` and `obj['prop']` same, but Dart only allows `obj['prop']` on Maps.</td>
  </tr>
  <tr>
    <th>Operators:</th>
    <td>`+`, `-`, `/`, `*`, <br>`<`, `<=`, `<>`, `>=`, <br> `==`, `!=` <br> `!`</td>
    <td>JavaScript does type coercion, Dart requires types to match. </td>
  </tr>
  <tr>
    <th>Invocation</th>
    <td>`fn(args)`</td>
    <td></td>
  </tr>
  <tr>
    <th>Formatters</th>
    <td>expr | formatter:arg0:...</td>
    <td>Formatters must be at the end of the expression. The formatter arguments are separated by `:`, which in turn can be expressions. </td>
  </tr>
  <tr>
    <th>Truthyness</th>
    <td></td>
    <td>In Dart only values which are `Boolean` and `true` are consider truthy. In JavaScript type coercion allows many other things to be consider true.</td>
  </tr>
</table>



### Formatters

Formatters are pure functions which can transform the input model to a different more usable data format. Examples include converting `Date` type to localized string or limiting the items in an array for filtering of `Foreach` items in a repeater.

Formatters can only be placed at the end of an `expression` (i.e. they can not be part of sub-expressions.) Formatters can be chained together, where the output of one formatter becomes an input of the next.

Formatters can take arguments, which are themselves an `expression`s separetd by `:`.

Here are some examples:

- `date | localizedDate` - Example of a formatter.
- `date | localizedDate:'short'` - Example of a formatter takeing an argument.
- `map | toArray | filter:predicate` - Example of formatter chaining.


## Statement Semantics

Statements execute in response to an event. Syntactically statements are identical to expressions with few differences: 

1. assignments are allowed
2. `null` dereference is an error
3. multiple statements separated by `;`
4. Formatters are not allowed.

<table>
  <tr>
    <th>Name</th>
    <th>Syntax</th>
    <th>Notes</th>
  </tr>
  <tr>
    <th>Dereference</th>
    <td>`obj.prop`, `obj[key]`</td>
    <td>Throws if `obj` is `null` or `undefined`.</td>
  </tr>
  <tr>
    <th>Assignment</th>
    <td>`=`</td>
    <td>Allowed in statements only.</td>
  </tr>
  <tr>
    <th>Formatters</th>
    <td></td>
    <td>Not allowed in statements.</td>
  </tr>
</table>
