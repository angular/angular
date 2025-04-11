# Error Handling in Angular

A fundamental principle in Angular's error handling strategy is that errors should be surfaced to users at the callsite whenever possible. This approach ensures that the code which initiated an operation has the context necessary to understand the error, handle it appropriately, and decide what the appropriate application state should be. By making errors visible at their origin, developers can implement error handling that is specific to the failed operation and has access to relevant information for recovery or providing informative feedback to the user. This also helps to avoid the "Overly general error" smell, where errors are reported without sufficient context to understand their cause.

## Unexpected and unhandled application errors

Unhandled exceptions in Angular are reported to the application root's [ErrorHandler](api/core/ErrorHandler). Custom implementations are usually provided in the [ApplicationConfig](guide/di/dependency-injection#at-the-application-root-level-using-applicationconfig).

Angular catches and forwards errors to the [ErrorHandler](api/core/ErrorHandler) when the framework _automatically_ invokes application code. This applies when the error cannot be caught by user code further up in the execution stack and would otherwise reach the global error handler in the execution environment. For example, this includes when Angular initiates automatic application synchronization or invokes listener callbacks but does _not_ apply when application code calls framework APIs such as `ApplicationRef.tick()`.

Angular will also handle asynchronous errors from user promises or observables only when there is an explicit contract for Angular to wait for and use or transform the result of the asynchronous operation and when errors are not presented in the return value or state. For example, `AsyncPipe` and `PendingTasks.run` forward errors to the `ErrorHandler` whereas `resource` presents the error in the `status` and `error` properties.

Errors that Angular reports to the `ErrorHandler` are _unexpected_ errors. These errors may be unrecoverable or an indication that the state of the application is corrupted. Applications should provide error handling where the error occurs whenever possible rather than relying on the `ErrorHandler`, which is most frequently and appropriately used only as a mechanism to report potentially fatal errors to the error tracking and logging infrastructure.

### `TestBed` will rethrow errors by default

The `ErrorHandler` may only log errors in the application and otherwise allow the application to continue functioning. However, `TestBed` will
ensure that errors which Angular catches and reports to it are not unintentionally missed or ignored. Remember, these are unexpected, unhandled errors. `TestBed` will rethrow these errors since they should not happen as part of normal operation. In rare circumstances, a test may specifically be attempting to ensure errors do not cause the application to be unresponsive or crash. In these situations, `TestBed` can be [configured](api/core/testing/TestModuleMetadata#rethrowApplicationErrors) to _not_ rethrow application errors with `TestBed.configureTestingModule({rethrowApplicationErrors: false})`.

## Global error listeners

Errors that are caught neither by the application code nor by the framework's application instance may reach the global scope. Errors reaching the global scope can have unintented consequences if not accounted for. In Node, they may cause the process to crash. In the browser, these errors may go unreported and site visitors may see the errors in the browser console. Angular provides global listeners for both environments to account for these issues.

### Browsers

Adding [`provideBrowserGlobalErrorListeners()`](/api/core/provideBrowserGlobalErrorListeners) to the [ApplicationConfig](guide/di/dependency-injection#at-the-application-root-level-using-applicationconfig) with add the `'error'` and `'unhandledrejection'` listeners to the browser window and forward those errors to the application's `ErrorHandler`. The Angular CLI will generate applications with this provider by default. This is recommeneded for most applications, though some may already have instrumentation in place for reporting global errors or have multiple applications running on the same page and need one centralized set of listeners rather than a set for each application. In this case, the provider function can be removed.

### Node

When using [Angular with SSR](guide/ssr), Angular will automatically add the `'unhandledRejection'` and `'uncaughtException'` listeners to the Node process. These handlers prevent the server from crashing and will be logged to the console.

IMPORTANT: If the application is using Zone.js, only the `'unhandledRejection'` handler is added. When Zone.js is present, errors inside the Application's Zone are already forwarded to the application `ErrorHandler` and do not reach the Node process.
