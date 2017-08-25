

# Template expression operators



The template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover two of these operators: _pipe_ and _safe navigation operator_.

### The pipe operator ( `|` )

The result of an expression might require some transformation before you're ready to use it in a binding.
For example, you might display a number as a currency, force text to uppercase, or filter a list and sort it.

Angular [pipes](guide/pipes) are a good choice for small transformations such as these.
Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the **pipe operator,** `|`:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-1" title="src/app/app.component.html" linenums="false">
</code-example>

The pipe operator passes the result of an expression on the left to a pipe function on the right.

You can chain expressions through multiple pipes:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-2" title="src/app/app.component.html" linenums="false">
</code-example>

And you can also [apply parameters](guide/pipes#parameterizing-a-pipe) to a pipe:

<code-example path="template-syntax/src/app/app.component.html" region="pipes-3" title="src/app/app.component.html" linenums="false">
</code-example>

The `json` pipe is particularly helpful for debugging bindings:

<code-example path="template-syntax/src/app/app.component.html" linenums="false" title="src/app/app.component.html (pipes-json)" region="pipes-json">
</code-example>

The generated output would look something like this

<code-example language="json">
  { "id": 0, "name": "Hercules", "emotion": "happy",
    "birthdate": "1970-02-25T08:00:00.000Z",
    "url": "http://www.imdb.com/title/tt0065832/",
    "rate": 325 }
</code-example>

<hr/>
<!-- KW--Check this title syntax below to make sure it's consistently used throughout -->

### The safe navigation operator, `?.`, and null property paths

The Angular **safe navigation operator, `?.`,** is a fluent and convenient way to
guard against null and undefined values in property paths.
Here it is, protecting against a view render failure if the `currentHero` is null.

<code-example path="template-syntax/src/app/app.component.html" region="safe-2" title="src/app/app.component.html" linenums="false">
</code-example>

Now consider what happens when the following data bound `title` property is null:

<code-example path="template-syntax/src/app/app.component.html" region="safe-1" title="src/app/app.component.html" linenums="false">
</code-example>

The view still renders but the displayed value is blank; you see only "The title is" with nothing after it.

Suppose the template expression involves a property path, as in this next example
that displays the `name` of a null item.

<code-example language="html">
  The null item's name is {{nullItem.name}}
</code-example>

JavaScript throws a null reference error, and so does Angular:

<code-example format="nocode">
  TypeError: Cannot read property 'name' of null in [null].
</code-example>

Additionally, the *entire view disappears*.

You might want this if the `item` property could never be null.
If it must never be null and yet it is null,
throwing an exception can help you troubleshoot.

On the other hand, null values in the property path may be OK from time to time,
especially when the data is null at first but will arrive eventually.

While waiting for data, you want the view to render seamlessly, and
the null property path to display as blank, just as the `title` property does.

In the above example, the app crashes when the `currentItem` is null.

<!-- KW--Maybe we don't need this part that follows -->
You could code around that problem with [*ngIf](guide/template-syntax#ngIf).
```html
<!--No hero, div not displayed, no error -->
<div *ngIf="nullItem">The null item's name is {{nullItem.name}}</div>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="safe-4" title="src/app/app.component.html" linenums="false">
</code-example> -->

You could try to chain parts of the property path with `&&`, knowing that the expression bails out
when it encounters the first null.

<code-example path="template-syntax/src/app/app.component.html" region="safe-5" title="src/app/app.component.html" linenums="false">
</code-example>

These approaches have merit but can be cumbersome, especially if the property path is long.
Imagine guarding against a null somewhere in a long property path such as `a.b.c.d`.

The Angular safe navigation operator (`?.`) is a more fluent and convenient way to guard against nulls in property paths.
The expression bails out when it hits the first null value.
The display is blank, but the app keeps rolling without errors.

<code-example path="template-syntax/src/app/app.component.html" region="safe-6" title="src/app/app.component.html" linenums="false">
</code-example>

It works perfectly with long property paths such as `a?.b?.c?.d`.


<hr/>

### The non-null assertion operator (`!`)

As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is _unintentionally_ null or undefined.

In this mode, typed variables disallow null and undefined by default. The type checker throws an error if you leave a variable unassigned or try to assign null or undefined to a variable whose type disallows null and undefined.

The type checker also throws an error if it can't determine whether 
a variable will be null or undefined at runtime.
Though you may know that can't happen, the type checker doesn't know.
You tell the type checker that it can't happen by applying the post-fix
[_non-null assertion operator (!)_](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").

The _Angular_ **non-null assertion operator (`!`)** serves the same purpose in an Angular template.

For example, after you use [*ngIf](guide/template-syntax#ngIf) to check that `item` is defined, you can assert that
`item` properties are also defined.

```html
<!--No item, no text -->
<div *ngIf="item">
  The items's name is {{item!.name}}
</div>
```

<!-- <code-example path="template-syntax/src/app/app.component.html" region="non-null-assertion-1" title="src/app/app.component.html" linenums="false">
</code-example> -->

When the Angular compiler turns your template into TypeScript code,
it prevents TypeScript from reporting that `item.name` might be null or undefined.

Unlike the [_safe navigation operator_](guide/template-syntax#safe-navigation-operator "Safe naviation operator (?.)"),
the **non-null assertion operator** does not guard against null or undefined.
Rather it tells the TypeScript type checker to suspend strict null checks for a specific property expression.

You'll need this template operator when you turn on strict null checks. It's optional otherwise.

<hr/>

## Summary
You've completed this survey of template syntax.
Now it's time to put that knowledge to work on your own components and directives.



## Extras

The Angular application manages what the user sees and can do, through the interaction of a
component class instance, or just component, and its user-facing template.

You may be familiar with the component/template duality from your experience with model-view-controller (MVC) or model-view-viewmodel (MVVM).
In Angular, the component plays the part of the controller/viewmodel, and the template represents the view.


Many code snippets illustrate the points and concepts, all of them available
in the <live-example title="Template Syntax Live Code"></live-example>.

