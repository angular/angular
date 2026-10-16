# Error Boundaries

IMPORTANT: `@boundary` requires Angular v22.2 or newer.

Use a `@boundary` block in the component template to catch errors thrown during the initial render or a later change
detection cycle of its child views, and render a fallback instead of letting the error propagate
and blank the page.

```html
@boundary {
<app-risky-component />
} @error {
<app-error-fallback [error]="$error" />
}
```

## Resetting the boundary

Call the implicit `$reset` function directly to attempt re-rendering the boundary's original
content:

```html
@boundary {
<app-flaky-component />
} @error {
<p>Loading failed.</p>
<button (click)="$reset()">Try again</button>
}
```

## Capturing the error and retrying

Reach for the implicit `$error`/`$reset()` shown above by default. Only bind named aliases with
`let`/`=` when a `when` condition needs to reference the error, to match specific error types:

```angular-html
@boundary {
<app-risky-component />
} @error (let err; reset = $reset; when isNetworkError(err)) {
<app-network-error [error]="$error" />
<button (click)="reset()">Retry</button>
} @error {
<p>Something went wrong.</p>
}
```

- `let err` binds the caught error for use inside the `when` condition.
- `when <expression>` lets multiple `@error` blocks match different error types or shapes, with a
  final catch-all `@error` block (no `when`) at the end.
- `reset = $reset` aliases the built-in `$reset` function; calling it re-renders the original
  `@boundary` content.

## Content projection

Projected content belongs to the template that declares it. To catch its errors, wrap the receiving
component and its projected content in a `@boundary` in the parent template. A `@boundary` around
`<ng-content>` inside the receiving component does not catch them.

## When to use it

`@boundary` is template-scoped and declarative, for isolating a specific risky subtree so it
cannot take down the rest of the view. It does not replace `ErrorHandler`, the app-wide imperative
error hook.
