# Template expression operators

<div class="callout is-critical">

<header>Marked for archiving</header>

To ensure that you have the best experience possible, this topic is marked for archiving until we determine that it clearly conveys the most accurate information possible.

In the meantime, this topic might be helpful: [Hierarchical injectors](guide/hierarchical-dependency-injection).

If you think this content should not be archived, please file a [GitHub issue](https://github.com/angular/angular/issues/new?template=3-docs-bug.md).

</div>

The Angular template expression language employs a subset of JavaScript syntax supplemented with a few special operators
for specific scenarios.

<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

<a id="non-null-assertion-operator"></a>

## The non-null assertion operator (`!`)

When you use TypeScript's `--strictNullChecks` flag, you can prevent the type checker from throwing an error with Angular's non-null assertion operator, `!`.

The Angular non-null assertion operator causes the TypeScript type checker to suspend strict `null` and `undefined` checks for a specific property expression.

For example, you can assert that `item` properties are also defined.

<code-example header="src/app/app.component.html" path="template-expression-operators/src/app/app.component.html" region="non-null"></code-example>

Often, you want to make sure that any property bindings aren't `null` or `undefined`.
However, there are situations in which such states are acceptable.
For those situations, you can use Angular's non-null assertion operator to prevent TypeScript from reporting that a property is `null` or `undefined`.

The non-null assertion operator, `!`, is optional unless you turn on strict null checks.

For more information, see TypeScript's [strict null checking](http://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html "Strict null checking in TypeScript").

<a id="any-type-cast-function"></a>

## The `$any()` type cast function

Sometimes a binding expression triggers a type error during [AOT compilation](guide/aot-compiler) and it is not possible or difficult to fully specify the type.
To silence the error, you can use the `$any()` cast function to cast
the expression to the [`any` type](https://www.typescriptlang.org/docs/handbook/basic-types.html#any) as in the following example:

<code-example header="src/app/app.component.html" path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-1"></code-example>

Using `$any()` prevents TypeScript from reporting that `bestByDate` is not a member of the `item` object.

The `$any()` cast function also works with `this` to allow access to undeclared members of the component.

<code-example header="src/app/app.component.html" path="built-in-template-functions/src/app/app.component.html" region="any-type-cast-function-2"></code-example>

The `$any()` cast function works anywhere in a binding expression where a method call is valid.

Also note that `$any()` only affects the typing. There is no method call in the generated code; the `$any()` function is entirely compiled away.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
