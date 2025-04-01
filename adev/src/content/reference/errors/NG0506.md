# Application remains unstable

This warning only appears in the browser during the hydration process when it's enabled on the client but the application remains unstable for an extended period of time (over 10 seconds).

Typically that happens when there are some pending microtasks or macrotasks on a page.

Angular Hydration relies on a signal from `ApplicationRef.isStable` when it becomes stable inside an application:

- during the server-side rendering (SSR) to start the serialization process
- in a browser this signal is used to start the post-hydration cleanup to remove DOM nodes that remained unclaimed

This warning is displayed when `ApplicationRef.isStable` does not emit `true` within 10 seconds. If this behavior is intentional and your application stabilizes later, you could choose to ignore this warning.

## Applications that use zone.js

Applications that use zone.js may have various factors contributing to delays in stability. These may include pending HTTP requests, timers (`setInterval`, `setTimeout`) or some logic that continuously invokes `requestAnimationFrame`.

### Macrotasks

Macrotasks include functions like `setInterval`, `setTimeout`, `requestAnimationFrame`, etc.
If one of these functions is called during the initialization phase of the application or in bootstrapped components, it may delay the moment when the application becomes stable.

```typescript
@Component({
  selector: 'app',
  template: ``,
})
class SimpleComponent {
  constructor() {
    setInterval(() => { ... }, 1000)

    // or

    setTimeout(() => { ... }, 10_000)
  }
}
```

If these functions must be called during the initialization phase, invoking them outside the Angular zone resolves the problem:

```typescript
class SimpleComponent {
  constructor() {
    const ngZone = inject(NgZone);

    ngZone.runOutsideAngular(() => {
      setInterval(() => {}, 1000);
    });
  }
}
```

### Third-party libraries

Some third-party libraries can also produce long-running asynchronous tasks, which may delay application stability. The recommendation is to invoke relevant library code outside of the zone as described above.

### Running code after an application becomes stable

You can run a code that sets up asynchronous tasks once an application becomes stable:

```typescript
class SimpleComponent {
  constructor() {
    const applicationRef = inject(ApplicationRef);

    applicationRef.isStable.pipe( first((isStable) => isStable) ).subscribe(() => {
      // Note that we don't need to use `runOutsideAngular` because `isStable`
      // emits events outside of the Angular zone when it's truthy (falsy values
      // are emitted inside the Angular zone).
      setTimeout(() => { ... });
    });
  }
}
```

## Zoneless applications

In zoneless scenarios, stability might be delayed by an application code inside of an `effect` running in an infinite loop (potentially because signals used in effect functions keep changing) or a pending HTTP request.

Developers may also explicitly contribute to indicating the application's stability by using the [`PendingTasks`](/api/core/PendingTasks) service. If you use the mentioned APIs in your application, make sure you invoke a function to mark the task as completed.
