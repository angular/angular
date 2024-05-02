# Angular without ZoneJS (Zoneless)

## Why use Zoneless?

The main advantages to removing ZoneJS as a dependency are:

- **Improved performance**: ZoneJS uses DOM events and async tasks as indicators of when application state _might_ have updated and subsequently triggers application synchronization to run change detection on the application's views. ZoneJS does not have any insight into whether application state actually changed and so this synchronization is triggered more frequently than necessary.
- **Improved Core Web Vitals**: ZoneJS brings a fair amount of overhead, both in payload size and in startup time cost.
- **Improved debugging experience**: ZoneJS makes debugging code more difficult. Stack traces are harder to understand with ZoneJS. It's also difficult to understand when code breaks as a result of being outside the Angular Zone.
- **Better ecosystem compatibility**: ZoneJS works by patching browser APIs but does not automatically have patches for every new browser API. Some APIs simply cannot be patched effectively, such as `async`/`await`, and have to be downleveled to work with ZoneJS. Sometimes libraries in the ecosystem are also incompatible with the way ZoneJS patches the native APIs. Removing ZoneJS as a dependency ensures better long-term compatibility by removing a source of complexity, monkey patching, and ongoing maintenance.

## Enabling Zoneless in an application

The API for enabling Zoneless is currently experimental. Neither the shape, nor the underlying behavior is stable and can change
in patch versions. There are known feature gaps, including the lack of an ergonomic API which prevents the application from serializing too early with Server Side Rendering.

```typescript
// standalone bootstrap
bootstrapApplication(MyApp, {providers: [
  provideExperimentalZonelessChangeDetection(),
]});

// NgModule bootstrap requires the provider and `ngZone: 'noop'`
platformBrowser().bootstrapModule(AppModule, {ngZone: 'noop'});
@NgModule({
  providers: [provideExperimentalZonelessChangeDetection()]
})
export class AppModule {}
```

## Requirements for Zoneless compatibility

Angular relies on notifications from core APIs in order to determine when to run change detection and on which views.
These notifications include:

- `ChangeDetectorRef.markForCheck` (called automatically by `AsyncPipe`)
- `ComponentRef.setInput`
- Updating a signal that's read in a template
- Bound host or template listeners callbacks
- Attaching a view that was marked dirty by one of the above

### `OnPush`-compatible components

One way to ensure that a component is using the correct notification mechanisms from above is to
use [ChangeDetectionStrategy.OnPush](../best-practices/skipping-subtrees#using-onpush).

The `OnPush` change detection strategy is not required, but it is a recommended step towards zoneless compatibility for application components. It is not always possible for library components to use `ChangeDetectionStrategy.OnPush`.
When a library component is a host for user-components which might use `ChangeDetectionStratey.Default`, it cannot use `OnPush` because that would prevent the child component from being refreshed if it is not `OnPush` compatible and relies on ZoneJS to trigger change detection. Components can use the `Default` strategy as long as they notify Angular when change detection needs to run (calling `markForCheck`, using signals, `AsyncPipe`, etc.).

### Remove `NgZone.onMicrotaskEmpty`, `NgZone.onUnstable`, `NgZone.isStable`, or `NgZone.onStable`

Applications and libraries need to remove uses of `NgZone.onMicrotaskEmpty`, `NgZone.onUnstable` and `NgZone.onStable`.
These observables will never emit when an Application enables zoneless change detection.
Similarly, `NgZone.isStable` will always be `true` and should not be used as a condition for code execution.

The `NgZone.onMicrotaskEmpty` and `NgZone.onStable` observables are most often used to wait for Angular to
complete change detection before performing a task. Instead, these can be replaced by `afterNextRender`
if they need to wait for a single change detection or `afterRender` if there is some condition that might span
several change detection rounds. In other cases, these observables were used because they happened to be
familiar and have similar timing to what was needed. More straightforward or direct DOM APIs can be used instead,
such as `MutationObserver` when code needs to wait for certain DOM state (rather than waiting for it indirectly
through Angular's render hooks).

<docs-callout title="NgZone.run and NgZone.runOutsideAngular are compatible with Zoneless">
`NgZone.run` and `NgZone.runOutsideAngular` do not need to be removed in order for code to be compatible with
Zoneless applications. In fact, removing these calls can lead to performance regressions for libraries that
are used in applications that still rely on ZoneJS.
</docs-callout>

### `ExperimentalPendingTasks` for Server Side Rendering (SSR)

If you are using SSR with Angular, you may know that it relies on ZoneJS to help determine when the application
is "stable" and can be serialized. If there are asynchronous tasks that should prevent serialization, an application
not using ZoneJS will need to make Angular aware of these with the `ExperimentalPendingTasks` service. Serialization
will wait for the first moment that all pending tasks have been removed.

```typescript
const taskService = inject(ExperimentalPendingTasks);
const taskCleanup = taskService.add();
await doSomeWorkThatNeedsToBeRendered();
taskCleanup();
```

The framework uses this service internally as well to prevent serialization until asynchronous tasks are complete. These include, but are not limited to,
an ongoing Router navigation and an incomplete `HttpClient` request.

## Testing and Debugging

### Using Zoneless in `TestBed`

The zoneless provider function can also be used with `TestBed` to help
ensure the components under test are compatible with a Zoneless
Angular application.

```typescript
TestBed.configureTestingModule({
  providers: [provideExperimentalZonelessChangeDetection()]
});

const fixture = TestBed.createComponent(MyComponent);
await fixture.whenStable();
```

To ensure tests have the most similar behavior to production code,
avoid using `fixture.detectChanges()` when possibe. This forces
change detection to run when Angular might otherwise have not
scheduled change detection. Tests should ensure these notifications
are happening and allow Angular to handle when to synchronize
state rather than manually forcing it to happen in the test.

### Debug-mode check to ensure updates are detected

Angular also provides an additional tool to help verify that an application is making
updates to state in a zoneless-compatible way. `provideExperimentalCheckNoChangesForDebug`
can be used to periodically check to ensure that no bindings have been updated
without a notification. Angular will throw `ExpressionChangedAfterItHasBeenCheckedError`
if there is an updated binding that would not have refreshed by the zoneless change
detection.
