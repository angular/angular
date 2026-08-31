# Error boundaries with `@boundary`

IMPORTANT: `@boundary` is in [developer preview](reference/releases#developer-preview).

Angular templates support error boundaries to gracefully handle runtime errors that occur during rendering and change detection.

Error boundaries prevent a single component's failure from crashing the entire application and provide a way to display fallback UI to the user.

## Catching errors with `@boundary` and `@error`

The `@boundary` block wraps a section of your template. If any component or directive inside this boundary throws an error during initialization or change detection, the framework catches the error and renders the `@error` block instead.

```angular-html
@boundary {
  <app-risky-component />
} @error {
  <p>Something went wrong!</p>
}
```

## Accessing the error object

You can access the caught error by accessing the implicit `$error` variable:

```angular-html
@boundary {
  <app-risky-component />
} @error {
  <p>Error occurred: {{ $error.message }}</p>
}
```

## Resetting the boundary

You can attempt to re-render the content of the `@boundary` by calling the implicit `$reset` function in the `@error` block. When called, it resets the boundary state and tries to render the original content again.

```angular-html
@boundary {
  <app-flaky-component />
} @error {
  <p>Loading failed.</p>
  <button (click)="$reset()">Try again</button>
}
```

## Conditional error handling with `when`

You can use `when` clauses to conditionally handle specific types of errors, allowing you to provide different fallback UIs. Angular evaluates this condition when it catches an error.

```angular-html
@boundary {
  <app-chart-dashboard />
} @error (let err; reset = $reset; when isRenderError(err)) {
  <p>Network issue. Check your connection.</p>
  <button (click)="reset()">Retry</button>
} @error {
  <p>An unexpected error occurred: {{ $error.message }}</p>
}
```

Order your `@error` blocks from most specific to least specific, as Angular evaluates the `when` clauses in order and uses the first one that evaluates to true. A final `@error` block without a `when` clause acts as a catch-all fallback.

## Global error handler integration

When a boundary catches an error, Angular can still notify the global `ErrorHandler`. You can implement the optional `onViewError` hook in your custom `ErrorHandler` to log these caught errors to your error tracking service.

```ts
@Injectable()
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Handle uncaught errors
  }

  onViewError(error: Error, details: ErrorDetails): void {
    // Handle errors caught by a @boundary
    console.warn('Caught by boundary:', details.boundary);
    myErrorTrackingService.log(error);
  }
}
```

IMPORTANT: If an `@error` block itself throws an error, the error propagates to the next outer `@boundary` or Angular treats it as an unhandled application error.

## Dynamic views and programmatic error handling

Error handling isn't limited to template syntax. If you are creating components or embedded views dynamically, you can use the `onError` option to handle errors. See the [Handling rendering errors](guide/components/programmatic-rendering#handling-rendering-errors) section in the programmatic rendering guide for more information.
