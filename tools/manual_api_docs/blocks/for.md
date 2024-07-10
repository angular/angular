The `@for` block repeatedly renders content of a block for each item in a collection.

@syntax

```html
@for (item of items; track item.name) {
<li>{{ item.name }}</li>
} @empty {
<li>There are no items.</li>
}
```

@description

The `@for` block renders its content in response to changes in a collection. Collections can be any
JavaScript [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols),
but there are performance advantages of using a regular `Array`.

You can optionally include an `@empty` section immediately after the `@for` block content. The
content of the `@empty` block displays when there are no items.

<h3> track and objects identity </h3>

The value of the `track` expression determines a key used to associate array items with the views in
the DOM. Having clear indication of the item identity allows Angular to execute a minimal set of DOM
operations as items are added, removed or moved in a collection.

To optimize performance, especially in loops over immutable data, ensure the track expression is effectively used to
identify each item uniquely. Because of the potential for poor performance, the `track` expression
is required for the `@for` loops.

For collections that remain static , `track $index` provides a straightforward tracking mechanism. For dynamic
collections experiencing additions, deletions, or reordering, opt for a
unique property of each item as the tracking key.

<h3> `$index` and other contextual variables </h3>

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

The aliasing is especially useful in case of using nested `@for` blocks where contextual variable
names could collide.
