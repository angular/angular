<!-- {@a expression-operators} -->

# Template expression operators

The Angular template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios. The next sections cover three of these operators:

* [pipe](guide/template-expression-operators#pipe)
* [safe navigation operator](guide/template-expression-operators#safe-navigation-operator)
* [non-null assertion operator](guide/template-expression-operators#non-null-assertion-operator)

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

{@a pipe}

## The pipe operator (`|`)

The result of an expression might require some transformation before you're ready to use it in a binding.
For example, you might display a number as a currency, change text to uppercase, or filter a list and sort it.

Pipes are simple functions that accept an input value and return a transformed value.
They're easy to apply within template expressions, using the pipe operator (`|`):

<code-example path="template-expression-operators/src/app/app.component.html" region="uppercase-pipe" header="src/app/app.component.html"></code-example>

The pipe operator passes the result of an expression on the left to a pipe function on the right.

You can chain expressions through multiple pipes:

<code-example path="template-expression-operators/src/app/app.component.html" region="pipe-chain" header="src/app/app.component.html"></code-example>

And you can also [apply parameters](guide/pipes#parameterizing-a-pipe) to a pipe:

<code-example path="template-expression-operators/src/app/app.component.html" region="date-pipe" header="src/app/app.component.html"></code-example>

The `json` pipe is particularly helpful for debugging bindings:

<code-example path="template-expression-operators/src/app/app.component.html" region="json-pipe" header="src/app/app.component.html"></code-example>

The generated output would look something like this:

<code-example language="json">
  { "name": "Telephone",
    "manufactureDate": "1980-02-25T05:00:00.000Z",
    "price": 98 }
</code-example>

<div class="alert is-helpful">

The pipe operator has a higher precedence than the ternary operator (`?:`),
which means `a ? b : c | x` is parsed as `a ? b : (c | x)`.
Nevertheless, for a number of reasons,
the pipe operator cannot be used without parentheses in the first and second operands of `?:`.
A good practice is to use parentheses in the third operand too.

</div>


<hr/>

{@a safe-navigation-operator}

## The safe navigation operator ( `?` ) and null property paths

The Angular safe navigation operator, `?`, guards against `null` and `undefined`
values in property paths. Here, it protects against a view render failure if `item` is `null`.

<code-example path="template-expression-operators/src/app/app.component.html" region="safe" header="src/app/app.component.html"></code-example>

If `item` is `null`, the view still renders but the displayed value is blank; you see only "The item name is:" with nothing after it.

Consider the next example, with a `nullItem`.

<code-example language="html">
  The null item name is {{nullItem.name}}
</code-example>

Since there is no safe navigation operator and `nullItem` is `null`, JavaScript and Angular would throw a `null` reference error and break the rendering process of Angular:

<code-example language="bash">
  TypeError: Cannot read property 'name' of null.
</code-example>

Sometimes however, `null` values in the property
path may be OK under certain circumstances,
especially when the value starts out null but the data arrives eventually.

With the safe navigation operator, `?`, Angular stops evaluating the expression when it hits the first `null` value and renders the view without errors.

It works perfectly with long property paths such as `a?.b?.c?.d`.


<hr/>

{@a non-null-assertion-operator}

## The non-null assertion operator ( `!` )

As of Typescript 2.0, you can enforce [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript") with the `--strictNullChecks` flag. TypeScript then ensures that no variable is unintentionally `null` or `undefined`.

In this mode, typed variables disallow `null` and `undefined` by default. The type checker throws an error if you leave a variable unassigned or try to assign `null` or `undefined` to a variable whose type disallows `null` and `undefined`.

The type checker also throws an error if it can't determine whether a variable will be `null` or `undefined` at runtime. You tell the type checker not to throw an error by applying the postfix
[non-null assertion operator, !](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator "Non-null assertion operator").

The Angular non-null assertion operator, `!`, serves the same purpose in
an Angular template. For example, you can assert that `item` properties are also defined.

<code-example path="template-expression-operators/src/app/app.component.html" region="non-null" header="src/app/app.component.html"></code-example>

When the Angular compiler turns your template into TypeScript code,
it prevents TypeScript from reporting that `item.color` might be `null` or `undefined`.

Unlike the [_safe navigation operator_](guide/template-expression-operators#safe-navigation-operator "Safe navigation operator (?)"),
the non-null assertion operator does not guard against `null` or `undefined`.
Rather, it tells the TypeScript type checker to suspend strict `null` checks for a specific property expression.

The non-null assertion operator, `!`, is optional with the exception that you must use it when you turn on strict null checks.

{@a any-type-cast-function}

## The `$any()` type cast function

Sometimes a binding expression triggers a type error during [AOT compilation](guide/aot-compiler) and it is not possible or difficult to fully specify the type.
To silence the error, you can use the `$any()` cast function to cast
the expression to the [`any` type](http://www.typescriptlang.org/docs/handbook/basic-types.html#any) as in the following example:

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-1" header="src/app/app.component.html"></code-example>

When the Angular compiler turns this template into TypeScript code,
it prevents TypeScript from reporting that `bestByDate` is not a member of the `item`
object when it runs type checking on the template.

The `$any()` cast function also works with `this` to allow access to undeclared members of
the component.

<code-example path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-2" header="src/app/app.component.html"></code-example>

The `$any()` cast function works anywhere in a binding expression where a method call is valid.

