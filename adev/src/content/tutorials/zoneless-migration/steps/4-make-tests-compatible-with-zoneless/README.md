# Make tests compatible with Zoneless

<docs-workflow>

<docs-step title="Test wrappers must be OnPush compatible">

Enabling zoneless in the test also means that any test components that you
use to wrap your production components must also be compatible with zoneless
 and `OnPush`. Wrapper components are a common pattern for testing component
inputs and corresponding lifecycle hooks, such as `ngOnChanges`. Even when the
application uses `ChangeDetectionStrategy.OnPush` consistently, testers do not
often carry this practice over to the test wrappers.

You have several options for fixing this problem in tests that you write. First,
you can change the properties of the test component to use signals:

```typescript
'<example [someInput]="someInput()" />'
// ...
someInput = signal('initial');
// ...
fixture.componentInstance.someInput.set('new');
```

Another option is to mark the test component for checking after you change its
properties, as you would do for the application component that you are testing:

```typescript
fixture.componentInstance.someInput = 'new';
fixture.changeDetectorRef.markForCheck();
```

CRITICAL: Ensure that you use `markForCheck()` in the test correctly. If the
fixture component is the application component rather than a test-only
wrapper, using `markForCheck()` in the test might hide an issue in the
application. Application components should
use signals or call `markForCheck` themselves. The application components should
not rely on a test to do it.

Make one of the preceding changes, run the tests again, and verify that the test
that you are running now passes:

```shell
ng test
```

</docs-step>

<docs-step title="Change detection is never synchronous">

Zone.js can sometimes trigger a synchronous change detection cycle in response
to code that runs inside the Angular zone. Without Zone.js, the application
always schedules synchronization; it never performs synchronization
synchronously. Tests sometimes reveal this difference.

This test uses the `autoDetectChanges` feature. This feature means that the
component refreshes automatically when the Angular zone stabilizes. Because of
this feature, tests can perform actions and expect the component to update
automatically, without requiring manually calling
<code>detectChanges</code>.

This test clicks the "increment" button and expects the new value to appear in
the template immediately. Because zoneless updates are always
scheduled and never synchronous, this test will fail.

You can resolve this in several ways.

The test can wait for the test component to stabilize using
<code>fixture.whenStable()</code>:

```typescript
fixture.nativeElement.querySelector('button').click();
await fixture.whenStable();
expect(fixture.nativeElement.textContent).toContain('1');
```

To update the test component's template immediately, call
<code>detectChanges</code>:

```typescript
fixture.nativeElement.querySelector('button').click();
fixture.detectChanges();
expect(fixture.nativeElement.textContent).toContain('1');
```

HELPFUL: If your test doesn't use the <code>autoDetect</code> feature, it probably
already includes this call, and therefore enabling zoneless would not cause
the test to fail.

Alternatively, use test utilities to wait for the expected conditions. The next
section describes a scenario where <code>fixture.whenStable()</code> resolves
before the template reflects the expected state.

</docs-step>

<docs-step title="fixture.whenStable does not include timers automatically"> 

To address this, poll for the expected condition. The Vitest `expect` function
supports this:

```typescript
fixture.nativeElement.querySelector('button').click();
await expect.poll(() => fixture.nativeElement.textContent).toContain('data loaded');
```

Vitest provides other waiting utilities, such as [vi.waitFor](https://vitest.dev/api/vi.html#vi-waitfor) and
[vi.waitUntil](https://vitest.dev/api/vi.html#vi-waituntil), that are also useful. The Testing Library is also a popular solution
with polling utilities, such as [waitFor](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor).

Tests might also use mock clocks and advance the mock clock by the expected
duration of the asynchronous operation before asserting the state. Angular
tests commonly use `fakeAsync` and `tick()` or `flush()` for this purpose.

</docs-step>

<docs-step title="fakeAsync requires zone.js">


`fakeAsync` uses Zone.js to act as a mock clock and synchronously advance time
in tests. Consider using a different mock clock implementation. Using
`fakeAsync` serves well as a mock clock and is similar to using other options, such as the
Jasmine clock or Sinon Fake Timers (used by Jest and Vitest). Reasons to choose a different mock clock
include:

*   Zone.js provides more functionality than a mock clock requires. Using it
    solely for this purpose is excessive.
*   Developers may prefer other mock clock implementations due to familiarity.
*   Shared test infrastructure that contains non-Angular code might require
    avoiding a Zone.js dependency.

The test named 'long running test' currently times out because data loading
takes too long. To use fake timers in Vitest, install the timers before each
test and uninstall them afterward. Add the following code to the `'fake timers'`
describe block:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});
```

After the test invokes the `click` event on the button, which triggers the long
data loading operation, flush the mock clock timers:

```typescript
await vi.runAllTimersAsync();
```

This functionality is similar to the `flush` method in `@angular/core/testing`.

</docs-step>

</docs-workflow>
