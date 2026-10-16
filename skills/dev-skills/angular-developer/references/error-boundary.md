# Error Boundaries

Use a `@boundary` block to catch errors thrown during the initial render or a later change
detection cycle of its child views, and render a fallback instead of letting the error propagate
and blank the page.

```html
@boundary {
<app-risky-component />
} @error {
<app-error-fallback [error]="err" />
}
```

## Capturing the error and retrying

Declare a template variable in the `@error` block to read the thrown error, and use the built-in
`$reset` function to attempt re-rendering the boundary's original content:

```html
@boundary {
<app-risky-component />
} @error (when isNetworkError(err)) {
<app-network-error [error]="$error" />
<button (click)="$retry()">Retry</button>
}
```

- `@error (let err)` binds the caught error for use inside the block.
- `when <expression>` lets multiple `@error` blocks match different error types or shapes, with a
  final catch-all `@error` block (no `when`) at the end.
- `retry = $reset` aliases the built-in `$reset` function; calling it re-renders the original
  `@boundary` content.

## Content projection

Projected content belongs to the template that declares it. To catch its errors, wrap the receiving
component and its projected content in a `@boundary` in the parent template. A `@boundary` around
`<ng-content>` inside the receiving component does not catch them.
through uncaught, even though the projecting component's own template content inside the same
`@boundary` is covered.

## When to use it

`@boundary` is template-scoped and declarative, for isolating a specific risky subtree so it
cannot take down the rest of the view. It does not replace `ErrorHandler`, the app-wide imperative
error hook.
