# Built-in control flow

Angular templates support *control flow blocks* that let you conditionally show, hide, and repeat
elements.

<div class="alert is-important">

Angular built-in control flow is in [developer preview](/guide/releases#developer-preview). It is
ready to try, but may change before becoming stable.

</div>

## `@if` block conditionals

The `@if` block conditionally displays its content when its condition expression is truthy:

```html
@if (a > b) {
  {{a}} is greater than {{b}}
}
```

The `@if` block might have one or more associated branches. Immediately after an `@if` block,
you can optionally specify any number of `@else if` blocks and one `@else` block:

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

You can create a reference to the result of an `@if` block's conditional expression and use that
reference inside the block's content.

```html
@if (users$ | async; as users) {
  {{ users.length }}
}
```

## `@for` block - repeaters

The `@for` block renders its content for each item in a collection.

```html
@for (item of items; track item.id) {
  {{ item.name }}
}
```

The collection can be any
JavaScript [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols),
but standard JavaScript `Array` values offer performance advantages.

### `track` for calculating difference of two collections

The `@for` block requires a `track` expression. Angular uses the value of this expression
as a unique identity for each item. This identity allows the framework to perform the minimal
set of DOM operations necessary after items are added, removed, or reordered.

For simple cases, you can use `track $index` as a reasonable default.

### `$index` and other contextual variables

Inside `@for` contents, several implicit variables are always available:

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

Aliasing is useful when nesting `@for` blocks so that you can reference these variable values in
deeper blocks.

### `empty` block

You can optionally include an `@empty` section immediately after the `@for` block content. The
content of the `@empty` block displays when there are no items:

```html
@for (item of items; track item.name) {
  <li> {{ item.name }}</li>
} @empty {
  <li> There are no items.</li>
}
```

## `@switch` block - selection

The syntax for `switch` is similar to `if`, inspired by the JavaScript `switch` statement:

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

**`@switch` does not have fallthrough**, so you do not need an equivalent to a `break` or `return`
statement.

The `@default` block is optional and can be omitted. If no `@case` matches the expression and there
is no `@default` block, nothing is shown.

## Comparing built-in control flow to `NgIf`, `NgSwitch` and `NgFor`

The `@if` block replaces `*ngIf` for expressing conditional parts of the UI.

The `@switch` block replaces `ngSwitch` with major benefits:

* The `@switch` block does not require a container element for the condition expression or each
  conditional template.
* The `@switch` block supports template type-checking, including type narrowing within each branch.

The `@for` block replaces `*ngFor` for iteration, and has several differences compared to its
structural directive `NgFor` predecessor:

* The `@for` block requires a tracking expression to uniquely identify items in the collection.
  While `NgFor` requires a `trackBy` _method_, however, the `@for` block simplifies tracking by
  accepting a `track` _expression_.
* You can specify content to show when the collection is empty with the `@empty` block.
* The `@for` block uses an optimized algorithm for determining a minimal number of DOM operations 
  necessary after a collection is modified. While `NgFor` allowed developers to provide a custom
  `IterableDiffer` implementation, the `@for` block does not support custom differs.

The `track` setting replaces `NgFor`'s concept of a `trackBy` function. Because `@for` is built-in,
we can provide a better experience than passing a `trackBy` function, and directly use an expression
representing the key instead. Migrating from `trackBy` to `track` is possible by invoking
the `trackBy` function:

```html
@for (item of items; track itemId($index, item)) {
  {{ item.name }}
}
```

With `NgFor`, loops over immutable data without `trackBy` are the most common cause of performance
bugs across Angular applications.
