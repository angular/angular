# Error Boundaries with @boundary

Angular templates support error boundaries to gracefully handle runtime errors that occur during rendering and change detection.

Error boundaries prevent a single component's failure from crashing the entire application and provide a way to display fallback UI to the user.

## Catching errors with `@boundary` and `@error`

The `@boundary` block wraps a section of your template. If any component or directive inside this boundary throws an error during initialization or change detection, the framework will catch the error and render the `@error` block instead.

```angular-html
@boundary {
  <app-risky-component />
} @error {
  <p>Something went wrong!</p>
}
```

## Accessing the error object

You can access the caught error by declaring a variable using the `let` keyword in the `@error` block:

```angular-html
@boundary {
  <app-risky-component />
} @error (let err) {
  <p>Error occurred: {{ err.message }}</p>
}
```

## Retrying rendering

You can attempt to re-render the content of the `@boundary` by reaching for the implicit `$retry` function in the `@error` block. When called, it resets the boundary state and tries to render the original content again.

```angular-html
@boundary {
  <app-flaky-component />
} @error (let err) {
  <p>Loading failed.</p>
  <button (click)="$retry()">Try again</button>
}
```

## Conditional error handling with `when`

You can use `when` clauses to conditionally handle specific types of errors, allowing you to provide different fallback UIs. The condition is evaluated when an error is caught.

```angular-html
@boundary {
  <app-chart-dashboard />
} @error (let err; when isNetworkError(err)) {
  <p>Network issue. Check your connection.</p>
  <button (click)="$retry()">Retry</button>
} @error (let err) {
  <p>An unexpected error occurred: {{ err.message }}</p>
}
```

Make sure to order your `@error` blocks from most specific to least specific, as Angular will evaluate the `when` clauses in order and use the first one that evaluates to true. A final `@error` block without a `when` clause acts as a catch-all fallback.

## Global Error Handler Integration

When an error is caught by a boundary, Angular's global `ErrorHandler` can still be notified. You can implement the optional `onViewError` hook in your custom `ErrorHandler` to log these caught errors to your error tracking service.

```angular-ts
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

IMPORTANT: If an error is thrown within an `@error` block itself, it will propagate up to the next outer `@boundary` or be treated as an unhandled application error.

## Dynamic Views and Programmatic Error Handling

Error handling isn't limited to template syntax. If you are creating components or embedded views dynamically using `ViewContainerRef` or the standalone `createComponent` function, you can provide an `onError` callback in the options object. This callback functions identically to an `@error` block but for imperatively created views.

```angular-ts
viewContainerRef.createComponent(DynamicComponent, {
  onError: (err: Error, details: ErrorDetails) => {
    console.error('Component rendering failed:', err);
    // Render an alternative UI or log metrics
  },
});
```

You can use the same `onError` configuration option with `ViewContainerRef.createEmbeddedView` as well.

NOTE: The `onError` callback will only catch errors that occur during the rendering or change detection phases. It will not catch errors that occur during the instantiation of the component (e.g., in its constructor). Construction errors will simply be thrown synchronously when the API is called.
