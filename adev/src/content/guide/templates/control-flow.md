# Built-in control flow

Angular templates support *control flow blocks* that let you conditionally show, hide, and repeat elements.

## `@if` block conditionals

The `@if` block conditionally displays its content when its condition expression is truthy:

```html
@if (a > b) {
{{a}} is greater than {{b}}
}
```

The `@if` block might have one or more associated `@else` blocks. Immediately after an `@if` block, you can optionally
specify any number of `@else if` blocks and one `@else` block:

```html
@if (a > b) {
{{a}} is greater than {{b}}
} @else if (b > a) {
{{a}} is less than {{b}}
} @else {
{{a}} is equal to {{b}}
}
```

### Referencing the conditional expression's result

The new built-in `@if` conditional supports referencing of expression results to keep a solution for common coding
patterns:

```html
@if (users$ | async; as users) {
{{ users.length }}
}
```

## `@for` block - repeaters

The `@for` repeatedly renders content of a block for each item in a collection. The collection can be represented as any
JavaScript [iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols) but there
are performance advantages of using a regular `Array`. A basic `@for` loop looks like:

```html
@for (item of items; track item.id) {
{{ item.name }}
}
```

### `track` for calculating difference of two collections

The value of the `track` expression determines a key used to associate array items with the views in the DOM. Having
clear indication of the item identity allows Angular to execute a minimal set of DOM operations as items are added,
removed or moved in a collection.

Using track effectively can significantly enhance your application's performance, especially in loops over data
collections.

For collections that do not undergo modifications (no items are moved, added, or deleted), using `track $index` is an
efficient strategy. For collections with mutable data or frequent changes, select a property that uniquely identifies
each item to use as your track expression.

Be aware of the potential for increased DOM re-creation when using object identity as a track key with immutable data
structures, as this can lead to unnecessary performance costs.

### `$index` and other contextual variables

Inside `@for`  contents, several implicit variables are always available:

| Variable | Meaning                                       |
|----------|-----------------------------------------------|
| `$count` | Number of items in a collection iterated over |
| `$index` | Index of the current row                      |
| `$first` | Whether the current row is the first row      |
| `$last`  | Whether the current row is the last row       |
| `$even`  | Whether the current row index is even         |
| `$odd`   | Whether the current row index is odd          |

These variables are always available with these names, but can be aliased via a `let` segment:

```html
@for (item of items; track item.id; let idx = $index, e = $even) {
Item #{{ idx }}: {{ item.name }}
}
```

The aliasing is especially useful in case of using nested `@for` blocks where contextual variable names could collide.

### `empty` block

You can optionally include an `@empty` section immediately after the `@for` block content. The content of the `@empty`
block displays when there are no items:

```html
@for (item of items; track item.name) {
<li> {{ item.name }}</li>
} @empty {
<li> There are no items.</li>
}
```

## `@switch` block - selection

The syntax for `switch` is very similar to `if`, and is inspired by the JavaScript `switch` statement:

```html
@switch (condition) {
@case (caseA) {
Case A.
}
@case (caseB) {
Case B.
}
@default {
Default case.
}
}
```

The value of the conditional expression is compared to the case expression using the `===` operator.

**`@switch` does not have fallthrough**, so you do not need an equivalent to a `break` or `return` statement.

The `@default` block is optional and can be omitted. If no `@case` matches the expression and there is no `@default`
block, nothing is shown.

## Built-in control flow and the `NgIf`, `NgSwitch` and `NgFor` structural directives

The `@if` block replaces `*ngIf` for expressing conditional parts of the UI.

The `@switch` block replaces `ngSwitch` with major benefits:

* it does not require a container element to hold the condition expression or each conditional template;
* it supports template type-checking, including type narrowing within each branch.

The `@for` block replaces `*ngFor` for iteration, and has several differences compared to its structural
directive `NgFor` predecessor:

* tracking expression (calculating keys corresponding to object identities) is mandatory but has better ergonomics (it
  is enough to write an expression instead of creating the `trackBy` method);
* uses a new optimized algorithm for calculating a minimal number of DOM operations to be performed in response to
  changes in a collection, instead of Angular’s customizable diffing implementation (`IterableDiffer`);
* has support for `@empty` blocks.

The `track` setting replaces `NgFor`'s concept of a `trackBy` function. Because `@for` is built-in, we can provide a
better experience than passing a `trackBy` function, and directly use an expression representing the key instead.
Migrating from `trackBy` to `track` is possible by invoking the `trackBy` function:

```html
@for (item of items; track itemId($index, item)) {
{{ item.name }}
}
```
