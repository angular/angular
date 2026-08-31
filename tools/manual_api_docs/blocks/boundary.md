IMPORTANT: The `@boundary` block is in [developer preview](reference/releases#developer-preview). It's ready for you to try, but it may change before it is stable.

The `@boundary` block is a control flow mechanism that lets you intercept and handle rendering errors in templates.

## Syntax

```angular-html
@boundary {
  <app-risky-component />
} @error {
  <app-error-fallback [error]="err" />
}
```

## Description

The `@boundary` block encapsulates its content and catches any errors that occur during the initial render or subsequent change detection cycles of its child views. If an error is caught, the framework stops rendering the main view and instead renders the fallback UI provided in the `@error` block.

You can capture the error object by declaring a variable in the `@error` block, for example `@error (let err)`.

You can use multiple `@error` blocks with `when` clauses to conditionally render different fallbacks based on the error type, with a final fallback `@error` block at the end. You can also access a `$reset` function to attempt re-rendering the boundary content.

```angular-html
@boundary {
  <app-risky-component />
} @error (let err; retry = $reset; when isNetworkError(err)) {
  <app-network-error [error]="err" />
  <button (click)="retry()">Retry</button>
} @error {
  <app-generic-error />
}
```
