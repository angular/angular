The `@repeat` block repeatedly renders content for a numeric count.

## Syntax

```angular-html
@repeat (columns(); let col = $index) {
  <div class="cell" [style.grid-column]="col + 1"></div>
}
```

## Description

The `@repeat` block renders its content once for each integer index from `0` to `count - 1`.
It is useful when the template needs a fixed number of views and there is no collection to iterate
over.

```angular-html
@repeat (2) {
  <button>Click me</button>
}
```

The count expression can be dynamic. When the value changes, Angular creates or removes embedded
views using the index as the identity for each view:

```angular-html
@repeat (columns(); let col = $index) {
  <div class="skeleton-cell" [style.grid-column]="col + 1"></div>
}
```

Values of zero render no views. `null` and `undefined` also render no views.
Non-integer values are truncated toward zero, matching the behavior of `String.prototype.repeat`.
Negative counts and `Infinity` throw a runtime error ([NG0957](https://angular.dev/errors/NG0957)).

Unlike `@for`, `@repeat` does not have a `track` expression. The identity of each repeated view is
the contextual `$index`.

### Contextual variables

Inside `@repeat` contents, several implicit variables are always available:

| Variable | Meaning                                    |
| -------- | ------------------------------------------ |
| `$count` | Number of views rendered by the block      |
| `$index` | Index of the current view                  |
| `$first` | Whether the current view is the first view |
| `$last`  | Whether the current view is the last view  |
| `$even`  | Whether the current view index is even     |
| `$odd`   | Whether the current view index is odd      |

These variables are always available with these names, but can be aliased via a `let` segment:

```angular-html
@repeat (rows(); let row = $index) {
  @repeat (columns(); let col = $index) {
    <cell-component [row]="row" [col]="col" />
  }
}
```

When blocks are nested, contextual variables follow normal template scoping rules. An inner
`@repeat` shadows `$index` from an outer `@repeat`; alias the outer value when it needs to be read
inside the inner block.

Queries such as `viewChild`, `viewChildren`, `contentChild`, and `contentChildren` update when
`@repeat` creates or removes embedded views. Use required queries only when the count is guaranteed
to be greater than zero.

Do not place `<ng-content>` directly inside an `@repeat` block. Content projection is processed by
the compiler and does not have cloning semantics. Use template fragments when projected content
needs conditional or repeated rendering.
