# [Advanced] Remove unsupported NgZone APIs

No APIs provided by `NgZone` are useful in a zoneless application. However, you
should keep calls to `NgZone.run` and `NgZone.runOutsideAngular` until you are
ready to drop support for ZoneJS entirely. For an application, this occurs after
you remove the ZoneJS polyfill. If you are a library developer, you should keep
these to support applications that use ZoneJS to prevent ["zone
pollution"](https://angular.dev/best-practices/zone-pollution).

NOTE: Other than `run` and `runOutsideAngular`, uses of `NgZone` are
relatively rare. You likely have little work to do in this area.

This tutorial explores migration paths available for uses of `NgZone.onStable`
and `NgZone.onMicrotaskEmpty`. Other `NgZone` APIs are exceedingly rare and are
not covered here.

<hr>

<docs-workflow>

<docs-step title="onStable/onMicrotaskEmpty.pipe(take(1))">

Before Angular introduced `afterNextRender`, it did not provide a direct API for
running code after application synchronization. One approach used the
`NgZone.onStable` or `onMicrotaskEmpty` observables because Angular uses these
observables internally to trigger synchronization. Developers sometimes also
used these observables with a check for `NgZone.isStable` to ensure that the
code runs only when there are no current or pending application
synchronizations.

Experiment with the demo and observe:

*   With zoneless off, add and remove rows and verify that the calculated height
    is correct.
*   Remove `ngZone.onStable`. Note that when you remove rows, the calculated
    height is off by one.
*   Set zoneless to "on." Observe that the application never updates the
    calculated height.

To wait until after Angular performs the next render in a zoneless-compatible
way, use [`afterNextRender`](/api/core/afterNextRender):

```typescript
afterNextRender(
  {
    read: () => {
      this.calculatedHeight.set(this.rowContainer().nativeElement.clientHeight);
    },
  },
  { injector: this.injector }
);
```

The `afterNextRender` function is helpful because it allows you to specify
phases to optimize DOM interactions and minimize [browser
reflow](https://developers.google.com/speed/docs/insights/browser-reflow).
Because this code reads the height of an element, it uses the `read` phase.

The application now updates the calculated height correctly with and without
zoneless enabled.

</docs-step>

<docs-step title="Use native browser APIs">

After completing the previous step, you might wonder whether this scenario
should use a resize observer instead. Native
browser observers can replace uses of `NgZone.onStable` or
`NgZone.onMicrotaskEmpty`. Native browser observers are more complex to use and
require a thorough understanding of the original code's intent. A common
migration strategy is to use `afterNextRender`, as demonstrated in the previous
example, or `afterEveryRender` if the subscription persists longer than a single
emission from the `onStable` or `onMicrotaskEmpty` observable.

Remove the `ngAfterViewChecked` function and create a `ResizeObserver` that
updates the calculated height. Observe the `rowContainer` element:

```typescript
constructor() {
  const observer = new ResizeObserver((entries) => {
    this.calculatedHeight.set(entries[0].contentRect.height);
  });
  inject(DestroyRef).onDestroy(() => observer.disconnect());
  afterNextRender({
    read: () => {
      observer.observe(this.rowContainer().nativeElement);
    },
  });
}
```

CRITICAL: Don't forget to disconnect the observer when the component is
destroyed. You can use `DestroyRef.onDestroy` for this, as seen above.

</docs-step>

</docs-workflow>
