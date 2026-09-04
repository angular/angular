The `@boundary` block is a control flow mechanism that allows you to intercept and handle rendering errors in templates.

## Syntax

```angular-html
@boundary {
  <app-risky-component />
} @error (let err) {
  <app-error-fallback [error]="err" />
}
```

## Description

The `@boundary` block encapsulates its content and catches any errors that occur during the initial render or subsequent change detection cycles of its child views. If an error is caught, the framework stops rendering the main view and instead renders the fallback UI provided in the `@error` block.

You can capture the error object by declaring a variable in the `@error` block, e.g. `@error (let err)`.

Multiple `@error` blocks can be used with `when` clauses to conditionally render different fallbacks based on the error type, with a final fallback `@error` block at the end. You can also access a `$retry` function to attempt re-rendering the boundary content.

```angular-html
@boundary {
  <app-risky-component />
} @error (let err; retry = $retry; when isNetworkError(err)) {
  <app-network-error [error]="err" />
  <button (click)="retry()">Retry</button>
} @error {
  <app-generic-error />
}
```
