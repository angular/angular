# Component testing scenarios

This guide explores common component testing use cases.

<div class="alert is-helpful">

  For a hands-on experience you can <live-example name="testing" stackblitz="specs" noDownload>run tests and explore the test code</live-example> in your browser as your read this guide.

  If you'd like to experiment with the application that this guide describes, you can <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

## Component binding

In the example app, the `BannerComponent` presents static title text in the HTML template.

After a few changes, the `BannerComponent` presents a dynamic title by binding to
the component's `title` property like this.

<code-example
  path="testing/src/app/banner/banner.component.ts"
  region="component"
  header="app/banner/banner.component.ts"></code-example>

As minimal as this is, you decide to add a test to confirm that component
actually displays the right content where you think it should.

#### Query for the _&lt;h1&gt;_

You'll write a sequence of tests that inspect the value of the `<h1>` element
that wraps the _title_ property interpolation binding.

You update the `beforeEach` to find that element with a standard HTML `querySelector`
and assign it to the `h1` variable.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="setup"
  header="app/banner/banner.component.spec.ts (setup)"></code-example>

{@a detect-changes}

#### _createComponent()_ does not bind data

For your first test you'd like to see that the screen displays the default `title`.
Your instinct is to write a test that immediately inspects the `<h1>` like this:

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="expect-h1-default-v1">
</code-example>

_That test fails_ with the message:

```javascript
expected '' to contain 'Test Tour of Heroes'.
```

Binding happens when Angular performs **change detection**.

In production, change detection kicks in automatically
when Angular creates a component or the user enters a keystroke or
an asynchronous activity (for example, AJAX) completes.

The `TestBed.createComponent` does _not_ trigger change detection; a fact confirmed in the revised test:

<code-example
  path="testing/src/app/banner/banner.component.spec.ts" region="test-w-o-detect-changes"></code-example>

#### _detectChanges()_

You must tell the `TestBed` to perform data binding by calling `fixture.detectChanges()`.
Only then does the `<h1>` have the expected title.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="expect-h1-default">
</code-example>

Delayed change detection is intentional and useful.
It gives the tester an opportunity to inspect and change the state of
the component _before Angular initiates data binding and calls [lifecycle hooks](guide/lifecycle-hooks)_.

Here's another test that changes the component's `title` property _before_ calling `fixture.detectChanges()`.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="after-change">
</code-example>

{@a auto-detect-changes}

#### Automatic change detection

The `BannerComponent` tests frequently call `detectChanges`.
Some testers prefer that the Angular test environment run change detection automatically.

That's possible by configuring the `TestBed` with the `ComponentFixtureAutoDetect` provider.
First import it from the testing utility library:

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="import-ComponentFixtureAutoDetect" header="app/banner/banner.component.detect-changes.spec.ts (import)"></code-example>

Then add it to the `providers` array of the testing module configuration:

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect" header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect)"></code-example>

Here are three tests that illustrate how automatic change detection works.

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect-tests" header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect Tests)"></code-example>

The first test shows the benefit of automatic change detection.

The second and third test reveal an important limitation.
The Angular testing environment does _not_ know that the test changed the component's `title`.
The `ComponentFixtureAutoDetect` service responds to _asynchronous activities_ such as promise resolution, timers, and DOM events.
But a direct, synchronous update of the component property is invisible.
The test must call `fixture.detectChanges()` manually to trigger another cycle of change detection.

<div class="alert is-helpful">

Rather than wonder when the test fixture will or won't perform change detection,
the samples in this guide _always call_ `detectChanges()` _explicitly_.
There is no harm in calling `detectChanges()` more often than is strictly necessary.

</div>

{@a dispatch-event}
#### Change an input value with _dispatchEvent()_

To simulate user input, you can find the input element and set its `value` property.

You will call `fixture.detectChanges()` to trigger Angular's change detection.
But there is an essential, intermediate step.

Angular doesn't know that you set the input element's `value` property.
It won't read that property until you raise the element's `input` event by calling `dispatchEvent()`.
_Then_ you call `detectChanges()`.

The following example demonstrates the proper sequence.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" header="app/hero/hero-detail.component.spec.ts (pipe test)"></code-example>

## Component with external files

The `BannerComponent` above is defined with an _inline template_ and _inline css_, specified in the `@Component.template` and `@Component.styles` properties respectively.

Many components specify _external templates_ and _external css_ with the
`@Component.templateUrl` and `@Component.styleUrls` properties respectively,
as the following variant of `BannerComponent` does.

<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  region="metadata"
  header="app/banner/banner-external.component.ts (metadata)"></code-example>

This syntax tells the Angular compiler to read the external files during component compilation.

That's not a problem when you run the CLI `ng test` command because it
_compiles the application before running the tests_.

However, if you run the tests in a **non-CLI environment**,
tests of this component may fail.
For example, if you run the `BannerComponent` tests in a web coding environment such as [plunker](https://plnkr.co/), you'll see a message like this one:

<code-example language="sh" hideCopy>
Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.
</code-example>

You get this test failure message when the runtime environment
compiles the source code _during the tests themselves_.

To correct the problem, call `compileComponents()` as explained [below](#compile-components).

{@a component-with-dependency}

## Component with a dependency

Components often have service dependencies.

The `WelcomeComponent` displays a welcome message to the logged in user.
It knows who the user is based on a property of the injected `UserService`:

<code-example path="testing/src/app/welcome/welcome.component.ts" header="app/welcome/welcome.component.ts"></code-example>

The `WelcomeComponent` has decision logic that interacts with the service, logic that makes this component worth testing.
Here's the testing module configuration for the spec file:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="config-test-module" header="app/welcome/welcome.component.spec.ts"></code-example>

This time, in addition to declaring the _component-under-test_,
the configuration adds a `UserService` provider to the `providers` list.
But not the real `UserService`.

{@a service-test-doubles}

#### Provide service test doubles

A _component-under-test_ doesn't have to be injected with real services.
In fact, it is usually better if they are test doubles (stubs, fakes, spies, or mocks).
The purpose of the spec is to test the component, not the service,
and real services can be trouble.

Injecting the real `UserService` could be a nightmare.
The real service might ask the user for login credentials and
attempt to reach an authentication server.
These behaviors can be hard to intercept.
It is far easier and safer to create and register a test double in place of the real `UserService`.

This particular test suite supplies a minimal mock of the `UserService` that satisfies the needs of the `WelcomeComponent` and its tests:

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="user-service-stub"
  header="app/welcome/welcome.component.spec.ts"></code-example>

{@a get-injected-service}

#### Get injected services

The tests need access to the (stub) `UserService` injected into the `WelcomeComponent`.

Angular has a hierarchical injection system.
There can be injectors at multiple levels, from the root injector created by the `TestBed`
down through the component tree.

The safest way to get the injected service, the way that **_always works_**,
is to **get it from the injector of the _component-under-test_**.
The component injector is a property of the fixture's `DebugElement`.

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="injected-service"
  header="WelcomeComponent's injector">
</code-example>

{@a testbed-inject}

#### _TestBed.inject()_

You _may_ also be able to get the service from the root injector using `TestBed.inject()`.
This is easier to remember and less verbose.
But it only works when Angular injects the component with the service instance in the test's root injector.

In this test suite, the _only_ provider of `UserService` is the root testing module,
so it is safe to call `TestBed.inject()` as follows:

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="inject-from-testbed"
  header="TestBed injector">
</code-example>

<div class="alert is-helpful">

For a use case in which `TestBed.inject()` does not work,
see the [_Override component providers_](#component-override) section that
explains when and why you must get the service from the component's injector instead.

</div>

{@a welcome-spec-setup}

#### Final setup and tests

Here's the complete `beforeEach()`, using `TestBed.inject()`:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="setup" header="app/welcome/welcome.component.spec.ts"></code-example>

And here are some tests:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="tests" header="app/welcome/welcome.component.spec.ts"></code-example>

The first is a sanity test; it confirms that the stubbed `UserService` is called and working.

<div class="alert is-helpful">

The second parameter to the Jasmine matcher (for example, `'expected name'`) is an optional failure label.
If the expectation fails, Jasmine appends this label to the expectation failure message.
In a spec with multiple expectations, it can help clarify what went wrong and which expectation failed.

</div>

The remaining tests confirm the logic of the component when the service returns different values.
The second test validates the effect of changing the user name.
The third test checks that the component displays the proper message when there is no logged-in user.

{@a component-with-async-service}
## Component with async service

In this sample, the `AboutComponent` template hosts a `TwainComponent`.
The `TwainComponent` displays Mark Twain quotes.

<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="template"
  header="app/twain/twain.component.ts (template)"></code-example>

Note that the value of the component's `quote` property passes through an `AsyncPipe`.
That means the property returns either a `Promise` or an `Observable`.

In this example, the `TwainComponent.getQuote()` method tells you that
the `quote` property returns an `Observable`.

<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="get-quote"
  header="app/twain/twain.component.ts (getQuote)"></code-example>

The `TwainComponent` gets quotes from an injected `TwainService`.
The component starts the returned `Observable` with a placeholder value (`'...'`),
before the service can return its first quote.

The `catchError` intercepts service errors, prepares an error message,
and returns the placeholder value on the success channel.
It must wait a tick to set the `errorMessage`
in order to avoid updating that message twice in the same change detection cycle.

These are all features you'll want to test.

#### Testing with a spy

When testing a component, only the service's public API should matter.
In general, tests themselves should not make calls to remote servers.
They should emulate such calls. The setup in this `app/twain/twain.component.spec.ts` shows one way to do that:

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="setup"
  header="app/twain/twain.component.spec.ts (setup)"></code-example>

{@a service-spy}

Focus on the spy.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="spy">
</code-example>

The spy is designed such that any call to `getQuote` receives an observable with a test quote.
Unlike the real `getQuote()` method, this spy bypasses the server
and returns a synchronous observable whose value is available immediately.

You can write many useful tests with this spy, even though its `Observable` is synchronous.

{@a sync-tests}

#### Synchronous tests

A key advantage of a synchronous `Observable` is that
you can often turn asynchronous processes into synchronous tests.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="sync-test">
</code-example>

Because the spy result returns synchronously, the `getQuote()` method updates
the message on screen immediately _after_
the first change detection cycle during which Angular calls `ngOnInit`.

You're not so lucky when testing the error path.
Although the service spy will return an error synchronously,
the component method calls `setTimeout()`.
The test must wait at least one full turn of the JavaScript engine before the
value becomes available. The test must become _asynchronous_.

{@a fake-async}

#### Async test with _fakeAsync()_

To use `fakeAsync()` functionality, you must import `zone.js/testing` in your test setup file.
If you created your project with the Angular CLI, `zone-testing` is already imported in `src/test.ts`.

The following test confirms the expected behavior when the service returns an `ErrorObservable`.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="error-test">
</code-example>

Note that the `it()` function receives an argument of the following form.

```javascript
fakeAsync(() => { /* test body */ })
```

The `fakeAsync()` function enables a linear coding style by running the test body in a special `fakeAsync test zone`.
The test body appears to be synchronous.
There is no nested syntax (like a `Promise.then()`) to disrupt the flow of control.

<div class="alert is-helpful">

Limitation: The `fakeAsync()` function won't work if the test body makes an `XMLHttpRequest` (XHR) call.
XHR calls within a test are rare, but if you need to call XHR, see [`waitForAsync()`](#waitForAsync), below.

</div>

{@a tick}

#### The _tick()_ function

You do have to call [tick()](api/core/testing/tick) to advance the (virtual) clock.

Calling [tick()](api/core/testing/tick) simulates the passage of time until all pending asynchronous activities finish.
In this case, it waits for the error handler's `setTimeout()`.

The [tick()](api/core/testing/tick) function accepts milliseconds and tickOptions as parameters, the millisecond (defaults to 0 if not provided) parameter represents how much the virtual clock advances. For example, if you have a `setTimeout(fn, 100)` in a `fakeAsync()` test, you need to use tick(100) to trigger the fn callback. The tickOptions is an optional parameter with a property called `processNewMacroTasksSynchronously` (defaults to true) that represents whether to invoke new generated macro tasks when ticking.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-tick">
</code-example>

The [tick()](api/core/testing/tick) function is one of the Angular testing utilities that you import with `TestBed`.
It's a companion to `fakeAsync()` and you can only call it within a `fakeAsync()` body.

#### tickOptions

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-tick-new-macro-task-sync">
</code-example>

In this example, we have a new macro task (nested setTimeout), by default, when we `tick`, the setTimeout `outside` and `nested` will both be triggered.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-tick-new-macro-task-async">
</code-example>

And in some case, we don't want to trigger the new macro task when ticking, we can use `tick(milliseconds, {processNewMacroTasksSynchronously: false})` to not invoke new macro task.

#### Comparing dates inside fakeAsync()

`fakeAsync()` simulates passage of time, which allows you to calculate the difference between dates inside `fakeAsync()`.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-date">
</code-example>

#### jasmine.clock with fakeAsync()

Jasmine also provides a `clock` feature to mock dates. Angular automatically runs tests that are run after
`jasmine.clock().install()` is called inside a `fakeAsync()` method until `jasmine.clock().uninstall()` is called. `fakeAsync()` is not needed and throws an error if nested.

By default, this feature is disabled. To enable it, set a global flag before importing `zone-testing`.

If you use the Angular CLI, configure this flag in `src/test.ts`.

```
(window as any)['__zone_symbol__fakeAsyncPatchLock'] = true;
import 'zone.js/testing';
```

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-clock">
</code-example>

#### Using the RxJS scheduler inside fakeAsync()

You can also use RxJS scheduler in `fakeAsync()` just like using `setTimeout()` or `setInterval()`, but you need to import `zone.js/plugins/zone-patch-rxjs-fake-async` to patch RxJS scheduler.
<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-rxjs">
</code-example>

#### Support more macroTasks

By default, `fakeAsync()` supports the following macro tasks.

- `setTimeout`
- `setInterval`
- `requestAnimationFrame`
- `webkitRequestAnimationFrame`
- `mozRequestAnimationFrame`

If you run other macro tasks such as `HTMLCanvasElement.toBlob()`, an _"Unknown macroTask scheduled in fake async test"_ error will be thrown.

<code-tabs>
  <code-pane
    header="src/app/shared/canvas.component.spec.ts (failing)"
    path="testing/src/app/shared/canvas.component.spec.ts"
    region="without-toBlob-macrotask">
  </code-pane>
  <code-pane
    header="src/app/shared/canvas.component.ts"
    path="testing/src/app/shared/canvas.component.ts"
    region="main">
  </code-pane>
</code-tabs>

If you want to support such a case, you need to define the macro task you want to support in `beforeEach()`.
For example:

<code-example
  header="src/app/shared/canvas.component.spec.ts (excerpt)"
  path="testing/src/app/shared/canvas.component.spec.ts"
  region="enable-toBlob-macrotask">
</code-example>

Note that in order to make the `<canvas>` element Zone.js-aware in your app, you need to import the `zone-patch-canvas` patch (either in `polyfills.ts` or in the specific file that uses `<canvas>`):

<code-example
  header="src/polyfills.ts or src/app/shared/canvas.component.ts"
  path="testing/src/app/shared/canvas.component.ts"
  region="import-canvas-patch">
</code-example>


#### Async observables

You might be satisfied with the test coverage of these tests.

However, you might be troubled by the fact that the real service doesn't quite behave this way.
The real service sends requests to a remote server.
A server takes time to respond and the response certainly won't be available immediately
as in the previous two tests.

Your tests will reflect the real world more faithfully if you return an _asynchronous_ observable
from the `getQuote()` spy like this.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="async-setup">
</code-example>

#### Async observable helpers

The async observable was produced by an `asyncData` helper.
The `asyncData` helper is a utility function that you'll have to write yourself, or you can copy this one from the sample code.

<code-example
  path="testing/src/testing/async-observable-helpers.ts"
  region="async-data"
  header="testing/async-observable-helpers.ts">
</code-example>

This helper's observable emits the `data` value in the next turn of the JavaScript engine.

The [RxJS `defer()` operator](http://reactivex.io/documentation/operators/defer.html) returns an observable.
It takes a factory function that returns either a promise or an observable.
When something subscribes to _defer_'s observable,
it adds the subscriber to a new observable created with that factory.

The `defer()` operator transforms the `Promise.resolve()` into a new observable that,
like `HttpClient`, emits once and completes.
Subscribers are unsubscribed after they receive the data value.

There's a similar helper for producing an async error.

<code-example
  path="testing/src/testing/async-observable-helpers.ts"
  region="async-error">
</code-example>

#### More async tests

Now that the `getQuote()` spy is returning async observables,
most of your tests will have to be async as well.

Here's a `fakeAsync()` test that demonstrates the data flow you'd expect
in the real world.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="fake-async-test">
</code-example>

Notice that the quote element displays the placeholder value (`'...'`) after `ngOnInit()`.
The first quote hasn't arrived yet.

To flush the first quote from the observable, you call [tick()](api/core/testing/tick).
Then call `detectChanges()` to tell Angular to update the screen.

Then you can assert that the quote element displays the expected text.

{@a waitForAsync}

#### Async test with _waitForAsync()_

To use `waitForAsync()` functionality, you must import `zone.js/testing` in your test setup file.
If you created your project with the Angular CLI, `zone-testing` is already imported in `src/test.ts`.

Here's the previous `fakeAsync()` test, re-written with the `waitForAsync()` utility.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="waitForAsync-test">
</code-example>

The `waitForAsync()` utility hides some asynchronous boilerplate by arranging for the tester's code
to run in a special _async test zone_.
You don't need to pass Jasmine's `done()` into the test and call `done()` because it is `undefined` in promise or observable callbacks.

But the test's asynchronous nature is revealed by the call to `fixture.whenStable()`,
which breaks the linear flow of control.

When using an `intervalTimer()` such as `setInterval()` in `waitForAsync()`, remember to cancel the timer with `clearInterval()` after the test, otherwise the `waitForAsync()` never ends.

{@a when-stable}

#### _whenStable_

The test must wait for the `getQuote()` observable to emit the next quote.
Instead of calling [tick()](api/core/testing/tick), it calls `fixture.whenStable()`.

The `fixture.whenStable()` returns a promise that resolves when the JavaScript engine's
task queue becomes empty.
In this example, the task queue becomes empty when the observable emits the first quote.

The test resumes within the promise callback, which calls `detectChanges()` to
update the quote element with the expected text.

{@a jasmine-done}

#### Jasmine _done()_

While the `waitForAsync()` and `fakeAsync()` functions greatly
simplify Angular asynchronous testing,
you can still fall back to the traditional technique
and pass `it` a function that takes a
[`done` callback](https://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support).

You can't call `done()` in `waitForAsync()` or `fakeAsync()` functions, because the `done parameter`
is `undefined`.

Now you are responsible for chaining promises, handling errors, and calling `done()` at the appropriate moments.

Writing test functions with `done()`, is more cumbersome than `waitForAsync()`and `fakeAsync()`, but it is occasionally necessary when code involves the `intervalTimer()` like `setInterval`.

Here are two more versions of the previous test, written with `done()`.
The first one subscribes to the `Observable` exposed to the template by the component's `quote` property.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="quote-done-test"></code-example>

The RxJS `last()` operator emits the observable's last value before completing, which will be the test quote.
The `subscribe` callback calls `detectChanges()` to
update the quote element with the test quote, in the same manner as the earlier tests.

In some tests, you're more interested in how an injected service method was called and what values it returned,
than what appears on screen.

A service spy, such as the `qetQuote()` spy of the fake `TwainService`,
can give you that information and make assertions about the state of the view.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="spy-done-test"></code-example>

{@a marble-testing}
## Component marble tests

The previous `TwainComponent` tests simulated an asynchronous observable response
from the `TwainService` with the `asyncData` and `asyncError` utilities.

These are short, simple functions that you can write yourself.
Unfortunately, they're too simple for many common scenarios.
An observable often emits multiple times, perhaps after a significant delay.
A component may coordinate multiple observables
with overlapping sequences of values and errors.

**RxJS marble testing** is a great way to test observable scenarios,
both simple and complex.
You've likely seen the [marble diagrams](https://rxmarbles.com/)
that illustrate how observables work.
Marble testing uses a similar marble language to
specify the observable streams and expectations in your tests.

The following examples revisit two of the `TwainComponent` tests
with marble testing.

Start by installing the `jasmine-marbles` npm package.
Then import the symbols you need.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="import-marbles"
  header="app/twain/twain.component.marbles.spec.ts (import marbles)"></code-example>

Here's the complete test for getting a quote:

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="get-quote-test"></code-example>

Notice that the Jasmine test is synchronous. There's no `fakeAsync()`.
Marble testing uses a test scheduler to simulate the passage of time
in a synchronous test.

The beauty of marble testing is in the visual definition of the observable streams.
This test defines a [_cold_ observable](#cold-observable) that waits
three [frames](#marble-frame) (`---`),
emits a value (`x`), and completes (`|`).
In the second argument you map the value marker (`x`) to the emitted value (`testQuote`).

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="test-quote-marbles"></code-example>

The marble library constructs the corresponding observable, which the
test sets as the `getQuote` spy's return value.

When you're ready to activate the marble observables,
you tell the `TestScheduler` to _flush_ its queue of prepared tasks like this.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="test-scheduler-flush"></code-example>

This step serves a purpose analogous to [tick()](api/core/testing/tick) and `whenStable()` in the
earlier `fakeAsync()` and `waitForAsync()` examples.
The balance of the test is the same as those examples.

#### Marble error testing

Here's the marble testing version of the `getQuote()` error test.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="error-test"></code-example>

It's still an async test, calling `fakeAsync()` and [tick()](api/core/testing/tick), because the component itself
calls `setTimeout()` when processing errors.

Look at the marble observable definition.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="error-marbles"></code-example>

This is a _cold_ observable that waits three frames and then emits an error,
The hash (`#`) indicates the timing of the error that is specified in the third argument.
The second argument is null because the observable never emits a value.

#### Learn about marble testing

{@a marble-frame}
A _marble frame_ is a virtual unit of testing time.
Each symbol (`-`, `x`, `|`, `#`) marks the passing of one frame.

{@a cold-observable}
A _cold_ observable doesn't produce values until you subscribe to it.
Most of your application observables are cold.
All [_HttpClient_](guide/http) methods return cold observables.

A _hot_ observable is already producing values _before_ you subscribe to it.
The [_Router.events_](api/router/Router#events) observable,
which reports router activity, is a _hot_ observable.

RxJS marble testing is a rich subject, beyond the scope of this guide.
Learn about it on the web, starting with the
[official documentation](https://rxjs.dev/guide/testing/marble-testing).

{@a component-with-input-output}
## Component with inputs and outputs

A component with inputs and outputs typically appears inside the view template of a host component.
The host uses a property binding to set the input property and an event binding to
listen to events raised by the output property.

The testing goal is to verify that such bindings work as expected.
The tests should set input values and listen for output events.

The `DashboardHeroComponent` is a tiny example of a component in this role.
It displays an individual hero provided by the `DashboardComponent`.
Clicking that hero tells the `DashboardComponent` that the user has selected the hero.

The `DashboardHeroComponent` is embedded in the `DashboardComponent` template like this:

<code-example
  path="testing/src/app/dashboard/dashboard.component.html"
  region="dashboard-hero"
  header="app/dashboard/dashboard.component.html (excerpt)"></code-example>

The `DashboardHeroComponent` appears in an `*ngFor` repeater, which sets each component's `hero` input property
to the looping value and listens for the component's `selected` event.

Here's the component's full definition:

{@a dashboard-hero-component}

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="component"
  header="app/dashboard/dashboard-hero.component.ts (component)"></code-example>

While testing a component this simple has little intrinsic value, it's worth knowing how.
You can use one of these approaches:

- Test it as used by `DashboardComponent`.
- Test it as a stand-alone component.
- Test it as used by a substitute for `DashboardComponent`.

A quick look at the `DashboardComponent` constructor discourages the first approach:

<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (constructor)"></code-example>

The `DashboardComponent` depends on the Angular router and the `HeroService`.
You'd probably have to replace them both with test doubles, which is a lot of work.
The router seems particularly challenging.

<div class="alert is-helpful">

The [discussion below](#routing-component) covers testing components that require the router.

</div>

The immediate goal is to test the `DashboardHeroComponent`, not the `DashboardComponent`,
so, try the second and third options.

{@a dashboard-standalone}

#### Test _DashboardHeroComponent_ stand-alone

Here's the meat of the spec file setup.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="setup"
  header="app/dashboard/dashboard-hero.component.spec.ts (setup)"></code-example>

Note how the setup code assigns a test hero (`expectedHero`) to the component's `hero` property,
emulating the way the `DashboardComponent` would set it
using the property binding in its repeater.

The following test verifies that the hero name is propagated to the template using a binding.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="name-test">
</code-example>

Because the [template](#dashboard-hero-component) passes the hero name through the Angular `UpperCasePipe`,
the test must match the element value with the upper-cased name.

<div class="alert is-helpful">

This small test demonstrates how Angular tests can verify a component's visual
representation&mdash;something not possible with
[component class tests](guide/testing-components-basics#component-class-testing)&mdash;at
low cost and without resorting to much slower and more complicated end-to-end tests.

</div>

#### Clicking

Clicking the hero should raise a `selected` event that
the host component (`DashboardComponent` presumably) can hear:

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test">
</code-example>

The component's `selected` property returns an `EventEmitter`,
which looks like an RxJS synchronous `Observable` to consumers.
The test subscribes to it _explicitly_ just as the host component does _implicitly_.

If the component behaves as expected, clicking the hero's element
should tell the component's `selected` property to emit the `hero` object.

The test detects that event through its subscription to `selected`.

{@a trigger-event-handler}

#### _triggerEventHandler_

The `heroDe` in the previous test is a `DebugElement` that represents the hero `<div>`.

It has Angular properties and methods that abstract interaction with the native element.
This test calls the `DebugElement.triggerEventHandler` with the "click" event name.
The "click" event binding responds by calling `DashboardHeroComponent.click()`.

The Angular `DebugElement.triggerEventHandler` can raise _any data-bound event_ by its _event name_.
The second parameter is the event object passed to the handler.

The test triggered a "click" event with a `null` event object.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="trigger-event-handler">
</code-example>

The test assumes (correctly in this case) that the runtime
event handler&mdash;the component's `click()` method&mdash;doesn't
care about the event object.

<div class="alert is-helpful">

Other handlers are less forgiving. For example, the `RouterLink`
directive expects an object with a `button` property
that identifies which mouse button (if any) was pressed during the click.
The `RouterLink` directive throws an error if the event object is missing.

</div>

#### Click the element

The following test alternative calls the native element's own `click()` method,
which is perfectly fine for _this component_.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test-2">
</code-example>

{@a click-helper}

#### _click()_ helper

Clicking a button, an anchor, or an arbitrary HTML element is a common test task.

Make that consistent and easy by encapsulating the _click-triggering_ process
in a helper such as the `click()` function below:

<code-example
  path="testing/src/testing/index.ts"
  region="click-event"
  header="testing/index.ts (click helper)"></code-example>

The first parameter is the _element-to-click_. If you want, you can pass a
custom event object as the second parameter. The default is a (partial)
<a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button">left-button mouse event object</a>
accepted by many handlers including the `RouterLink` directive.

<div class="alert is-important">

The `click()` helper function is **not** one of the Angular testing utilities.
It's a function defined in _this guide's sample code_.
All of the sample tests use it.
If you like it, add it to your own collection of helpers.

</div>

Here's the previous test, rewritten using the click helper.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="click-test-3"
  header="app/dashboard/dashboard-hero.component.spec.ts (test with click helper)">
</code-example>

{@a component-inside-test-host}
## Component inside a test host

The previous tests played the role of the host `DashboardComponent` themselves.
But does the `DashboardHeroComponent` work correctly when properly data-bound to a host component?

You could test with the actual `DashboardComponent`.
But doing so could require a lot of setup,
especially when its template features an `*ngFor` repeater,
other components, layout HTML, additional bindings,
a constructor that injects multiple services,
and it starts interacting with those services right away.

Imagine the effort to disable these distractions, just to prove a point
that can be made satisfactorily with a _test host_ like this one:

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="test-host"
  header="app/dashboard/dashboard-hero.component.spec.ts (test host)"
 ></code-example>

This test host binds to `DashboardHeroComponent` as the `DashboardComponent` would
but without the noise of the `Router`, the `HeroService`, or the `*ngFor` repeater.

The test host sets the component's `hero` input property with its test hero.
It binds the component's `selected` event with its `onSelected` handler,
which records the emitted hero in its `selectedHero` property.

Later, the tests will be able to easily check `selectedHero` to verify that the
`DashboardHeroComponent.selected` event emitted the expected hero.

The setup for the _test-host_ tests is similar to the setup for the stand-alone tests:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup" header="app/dashboard/dashboard-hero.component.spec.ts (test host setup)"></code-example>

This testing module configuration shows three important differences:

1. It _declares_ both the `DashboardHeroComponent` and the `TestHostComponent`.
1. It _creates_ the `TestHostComponent` instead of the `DashboardHeroComponent`.
1. The `TestHostComponent` sets the `DashboardHeroComponent.hero` with a binding.

The `createComponent` returns a `fixture` that holds an instance of `TestHostComponent` instead of an instance of `DashboardHeroComponent`.

Creating the `TestHostComponent` has the side-effect of creating a `DashboardHeroComponent`
because the latter appears within the template of the former.
The query for the hero element (`heroEl`) still finds it in the test DOM,
albeit at greater depth in the element tree than before.

The tests themselves are almost identical to the stand-alone version:

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="test-host-tests"
  header="app/dashboard/dashboard-hero.component.spec.ts (test-host)"></code-example>

Only the selected event test differs. It confirms that the selected `DashboardHeroComponent` hero
really does find its way up through the event binding to the host component.

{@a routing-component}
## Routing component

A _routing component_ is a component that tells the `Router` to navigate to another component.
The `DashboardComponent` is a _routing component_ because the user can
navigate to the `HeroDetailComponent` by clicking on one of the _hero buttons_ on the dashboard.

Routing is pretty complicated.
Testing the `DashboardComponent` seemed daunting in part because it involves the `Router`,
which it injects together with the `HeroService`.

<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (constructor)"></code-example>

Mocking the `HeroService` with a spy is a [familiar story](#component-with-async-service).
But the `Router` has a complicated API and is entwined with other services and application preconditions. Might it be difficult to mock?

Fortunately, not in this case because the `DashboardComponent` isn't doing much with the `Router`

<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="goto-detail"
  header="app/dashboard/dashboard.component.ts (goToDetail)">
</code-example>

This is often the case with _routing components_.
As a rule you test the component, not the router,
and care only if the component navigates with the right address under the given conditions.

Providing a router spy for _this component_ test suite happens to be as easy
as providing a `HeroService` spy.

<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="router-spy"
  header="app/dashboard/dashboard.component.spec.ts (spies)"></code-example>

The following test clicks the displayed hero and confirms that
`Router.navigateByUrl` is called with the expected url.

<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="navigate-test"
  header="app/dashboard/dashboard.component.spec.ts (navigate test)"></code-example>

{@a routed-component-w-param}

## Routed components

A _routed component_ is the destination of a `Router` navigation.
It can be trickier to test, especially when the route to the component _includes parameters_.
The `HeroDetailComponent` is a _routed component_ that is the destination of such a route.

When a user clicks a _Dashboard_ hero, the `DashboardComponent` tells the `Router`
to navigate to `heroes/:id`.
The `:id` is a route parameter whose value is the `id` of the hero to edit.

The `Router` matches that URL to a route to the `HeroDetailComponent`.
It creates an `ActivatedRoute` object with the routing information and
injects it into a new instance of the `HeroDetailComponent`.

Here's the `HeroDetailComponent` constructor:

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ctor" header="app/hero/hero-detail.component.ts (constructor)"></code-example>

The `HeroDetail` component needs the `id` parameter so it can fetch
the corresponding hero using the `HeroDetailService`.
The component has to get the `id` from the `ActivatedRoute.paramMap` property
which is an `Observable`.

It can't just reference the `id` property of the `ActivatedRoute.paramMap`.
The component has to _subscribe_ to the `ActivatedRoute.paramMap` observable and be prepared
for the `id` to change during its lifetime.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ng-on-init" header="app/hero/hero-detail.component.ts (ngOnInit)"></code-example>

<div class="alert is-helpful">

The [ActivatedRoute in action](guide/router-tutorial-toh#activated-route-in-action) section of the [Router tutorial: tour of heroes](guide/router-tutorial-toh) guide covers `ActivatedRoute.paramMap` in more detail.

</div>

Tests can explore how the `HeroDetailComponent` responds to different `id` parameter values
by manipulating the `ActivatedRoute` injected into the component's constructor.

You know how to spy on the `Router` and a data service.

You'll take a different approach with `ActivatedRoute` because

- `paramMap` returns an `Observable` that can emit more than one value
  during a test.
- You need the router helper function, `convertToParamMap()`, to create a `ParamMap`.
- Other _routed component_ tests need a test double for `ActivatedRoute`.

These differences argue for a re-usable stub class.

#### _ActivatedRouteStub_

The following `ActivatedRouteStub` class serves as a test double for `ActivatedRoute`.

<code-example
  path="testing/src/testing/activated-route-stub.ts"
  region="activated-route-stub"
  header="testing/activated-route-stub.ts (ActivatedRouteStub)"></code-example>

Consider placing such helpers in a `testing` folder sibling to the `app` folder.
This sample puts `ActivatedRouteStub` in `testing/activated-route-stub.ts`.

<div class="alert is-helpful">

Consider writing a more capable version of this stub class with
the [_marble testing library_](#marble-testing).

</div>

{@a tests-w-test-double}

#### Testing with _ActivatedRouteStub_

Here's a test demonstrating the component's behavior when the observed `id` refers to an existing hero:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-good-id" header="app/hero/hero-detail.component.spec.ts (existing id)"></code-example>

<div class="alert is-helpful">

The `createComponent()` method and `page` object are discussed [below](#page-object).
Rely on your intuition for now.

</div>

When the `id` cannot be found, the component should re-route to the `HeroListComponent`.

The test suite setup provided the same router spy [described above](#routing-component) which spies on the router without actually navigating.

This test expects the component to try to navigate to the `HeroListComponent`.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-bad-id" header="app/hero/hero-detail.component.spec.ts (bad id)"></code-example>

While this application doesn't have a route to the `HeroDetailComponent` that omits the `id` parameter, it might add such a route someday.
The component should do something reasonable when there is no `id`.

In this implementation, the component should create and display a new hero.
New heroes have `id=0` and a blank `name`. This test confirms that the component behaves as expected:

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="route-no-id"
  header="app/hero/hero-detail.component.spec.ts (no id)"></code-example>

## Nested component tests

Component templates often have nested components, whose templates
may contain more components.

The component tree can be very deep and, most of the time, the nested components
play no role in testing the component at the top of the tree.

The `AppComponent`, for example, displays a navigation bar with anchors and their `RouterLink` directives.

<code-example
  path="testing/src/app/app.component.html"
  header="app/app.component.html"></code-example>

While the `AppComponent` _class_ is empty,
you may want to write unit tests to confirm that the links are wired properly
to the `RouterLink` directives, perhaps for the reasons [explained below](#why-stubbed-routerlink-tests).

To validate the links, you don't need the `Router` to navigate and you don't
need the `<router-outlet>` to mark where the `Router` inserts _routed components_.

The `BannerComponent` and `WelcomeComponent`
(indicated by `<app-banner>` and `<app-welcome>`) are also irrelevant.

Yet any test that creates the `AppComponent` in the DOM will also create instances of
these three components and, if you let that happen,
you'll have to configure the `TestBed` to create them.

If you neglect to declare them, the Angular compiler won't recognize the
`<app-banner>`, `<app-welcome>`, and `<router-outlet>` tags in the `AppComponent` template
and will throw an error.

If you declare the real components, you'll also have to declare _their_ nested components
and provide for _all_ services injected in _any_ component in the tree.

That's too much effort just to answer a few simple questions about links.

This section describes two techniques for minimizing the setup.
Use them, alone or in combination, to stay focused on testing the primary component.

{@a stub-component}

##### Stubbing unneeded components

In the first technique, you create and declare stub versions of the components
and directive that play little or no role in the tests.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="component-stubs"
  header="app/app.component.spec.ts (stub declaration)"></code-example>

The stub selectors match the selectors for the corresponding real components.
But their templates and classes are empty.

Then declare them in the `TestBed` configuration next to the
components, directives, and pipes that need to be real.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="testbed-stubs"
  header="app/app.component.spec.ts (TestBed stubs)"></code-example>

The `AppComponent` is the test subject, so of course you declare the real version.

The `RouterLinkDirectiveStub`, [described later](#routerlink), is a test version
of the real `RouterLink` that helps with the link tests.

The rest are stubs.

{@a no-errors-schema}

#### _NO_ERRORS_SCHEMA_

In the second approach, add `NO_ERRORS_SCHEMA` to the `TestBed.schemas` metadata.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="no-errors-schema"
  header="app/app.component.spec.ts (NO_ERRORS_SCHEMA)"></code-example>

The `NO_ERRORS_SCHEMA` tells the Angular compiler to ignore unrecognized elements and attributes.

The compiler will recognize the `<app-root>` element and the `routerLink` attribute
because you declared a corresponding `AppComponent` and `RouterLinkDirectiveStub`
in the `TestBed` configuration.

But the compiler won't throw an error when it encounters `<app-banner>`, `<app-welcome>`, or `<router-outlet>`.
It simply renders them as empty tags and the browser ignores them.

You no longer need the stub components.

#### Use both techniques together

These are techniques for _Shallow Component Testing_ ,
so-named because they reduce the visual surface of the component to just those elements
in the component's template that matter for tests.

The `NO_ERRORS_SCHEMA` approach is the easier of the two but don't overuse it.

The `NO_ERRORS_SCHEMA` also prevents the compiler from telling you about the missing
components and attributes that you omitted inadvertently or misspelled.
You could waste hours chasing phantom bugs that the compiler would have caught in an instant.

The _stub component_ approach has another advantage.
While the stubs in _this_ example were empty,
you could give them stripped-down templates and classes if your tests
need to interact with them in some way.

In practice you will combine the two techniques in the same setup,
as seen in this example.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="mixed-setup"
  header="app/app.component.spec.ts (mixed setup)"></code-example>

The Angular compiler creates the `BannerComponentStub` for the `<app-banner>` element
and applies the `RouterLinkStubDirective` to the anchors with the `routerLink` attribute,
but it ignores the `<app-welcome>` and `<router-outlet>` tags.

{@a routerlink}
## Components with _RouterLink_

The real `RouterLinkDirective` is quite complicated and entangled with other components
and directives of the `RouterModule`.
It requires challenging setup to mock and use in tests.

The `RouterLinkDirectiveStub` in this sample code replaces the real directive
with an alternative version designed to validate the kind of anchor tag wiring
seen in the `AppComponent` template.

<code-example
  path="testing/src/testing/router-link-directive-stub.ts"
  region="router-link"
  header="testing/router-link-directive-stub.ts (RouterLinkDirectiveStub)"></code-example>

The URL bound to the `[routerLink]` attribute flows in to the directive's `linkParams` property.

The `HostListener` wires the click event of the host element
(the `<a>` anchor elements in `AppComponent`) to the stub directive's `onClick` method.

Clicking the anchor should trigger the `onClick()` method,
which sets the stub's telltale `navigatedTo` property.
Tests inspect `navigatedTo` to confirm that clicking the anchor
sets the expected route definition.

<div class="alert is-helpful">

Whether the router is configured properly to navigate with that route definition is a
question for a separate set of tests.

</div>

{@a by-directive}
{@a inject-directive}

#### _By.directive_ and injected directives

A little more setup triggers the initial data binding and gets references to the navigation links:

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="test-setup"
  header="app/app.component.spec.ts (test setup)"></code-example>

Three points of special interest:

1.  You can locate the anchor elements with an attached directive using `By.directive`.

1.  The query returns `DebugElement` wrappers around the matching elements.

1.  Each `DebugElement` exposes a dependency injector with the
    specific instance of the directive attached to that element.

The `AppComponent` links to validate are as follows:

<code-example
  path="testing/src/app/app.component.html"
  region="links"
  header="app/app.component.html (navigation links)"></code-example>

{@a app-component-tests}

Here are some tests that confirm those links are wired to the `routerLink` directives
as expected:

<code-example path="testing/src/app/app.component.spec.ts" region="tests" header="app/app.component.spec.ts (selected tests)"></code-example>

<div class="alert is-helpful">

The "click" test _in this example_ is misleading.
It tests the `RouterLinkDirectiveStub` rather than the _component_.
This is a common failing of directive stubs.

It has a legitimate purpose in this guide.
It demonstrates how to find a `RouterLink` element, click it, and inspect a result,
without engaging the full router machinery.
This is a skill you may need to test a more sophisticated component, one that changes the display,
re-calculates parameters, or re-arranges navigation options when the user clicks the link.

</div>

{@a why-stubbed-routerlink-tests}

#### What good are these tests?

Stubbed `RouterLink` tests can confirm that a component with links and an outlet is setup properly,
that the component has the links it should have, and that they are all pointing in the expected direction.
These tests do not concern whether the application will succeed in navigating to the target component when the user clicks a link.

Stubbing the RouterLink and RouterOutlet is the best option for such limited testing goals.
Relying on the real router would make them brittle.
They could fail for reasons unrelated to the component.
For example, a navigation guard could prevent an unauthorized user from visiting the `HeroListComponent`.
That's not the fault of the `AppComponent` and no change to that component could cure the failed test.

A _different_ battery of tests can explore whether the application navigates as expected
in the presence of conditions that influence guards such as whether the user is authenticated and authorized.

<div class="alert is-helpful">

A future guide update will explain how to write such
tests with the `RouterTestingModule`.

</div>

{@a page-object}
## Use a _page_ object

The `HeroDetailComponent` is a simple view with a title, two hero fields, and two buttons.

<div class="lightbox">
  <img src='generated/images/guide/testing/hero-detail.component.png' alt="HeroDetailComponent in action">
</div>

But there's plenty of template complexity even in this simple form.

<code-example
  path="testing/src/app/hero/hero-detail.component.html" header="app/hero/hero-detail.component.html"></code-example>

Tests that exercise the component need ...

- to wait until a hero arrives before elements appear in the DOM.
- a reference to the title text.
- a reference to the name input box to inspect and set it.
- references to the two buttons so they can click them.
- spies for some of the component and router methods.

Even a small form such as this one can produce a mess of tortured conditional setup and CSS element selection.

Tame the complexity with a `Page` class that handles access to component properties
and encapsulates the logic that sets them.

Here is such a `Page` class for the `hero-detail.component.spec.ts`

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="page"
  header="app/hero/hero-detail.component.spec.ts (Page)"></code-example>

Now the important hooks for component manipulation and inspection are neatly organized and accessible from an instance of `Page`.

A `createComponent` method creates a `page` object and fills in the blanks once the `hero` arrives.

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="create-component"
  header="app/hero/hero-detail.component.spec.ts (createComponent)"></code-example>

The [_HeroDetailComponent_ tests](#tests-w-test-double) in an earlier section demonstrate how `createComponent` and `page`
keep the tests short and _on message_.
There are no distractions: no waiting for promises to resolve and no searching the DOM for element values to compare.

Here are a few more `HeroDetailComponent` tests to reinforce the point.

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="selected-tests"
  header="app/hero/hero-detail.component.spec.ts (selected tests)"></code-example>

{@a compile-components}
## Calling _compileComponents()_

<div class="alert is-helpful">

You can ignore this section if you _only_ run tests with the CLI `ng test` command
because the CLI compiles the application before running the tests.

</div>

If you run tests in a **non-CLI environment**, the tests may fail with a message like this one:

<code-example language="sh" hideCopy>
Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.
</code-example>

The root of the problem is at least one of the components involved in the test
specifies an external template or CSS file as
the following version of the `BannerComponent` does.

<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  header="app/banner/banner-external.component.ts (external template & css)"></code-example>

The test fails when the `TestBed` tries to create the component.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="setup-may-fail"
  header="app/banner/banner-external.component.spec.ts (setup that fails)"
  avoid></code-example>

Recall that the application hasn't been compiled.
So when you call `createComponent()`, the `TestBed` compiles implicitly.

That's not a problem when the source code is in memory.
But the `BannerComponent` requires external files
that the compiler must read from the file system,
an inherently _asynchronous_ operation.

If the `TestBed` were allowed to continue, the tests would run and fail mysteriously
before the compiler could finished.

The preemptive error message tells you to compile explicitly with `compileComponents()`.

#### _compileComponents()_ is async

You must call `compileComponents()` within an asynchronous test function.

<div class="alert is-critical">

If you neglect to make the test function async
(for example, forget to use `waitForAsync()` as described below),
you'll see this error message

<code-example language="sh" hideCopy>
Error: ViewDestroyedError: Attempt to use a destroyed view
</code-example>

</div>

A typical approach is to divide the setup logic into two separate `beforeEach()` functions:

1.  An async `beforeEach()` that compiles the components
1.  A synchronous `beforeEach()` that performs the remaining setup.

#### The async _beforeEach_

Write the first async `beforeEach` like this.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="async-before-each"
  header="app/banner/banner-external.component.spec.ts (async beforeEach)"></code-example>

The `TestBed.configureTestingModule()` method returns the `TestBed` class so you can chain
calls to other `TestBed` static methods such as `compileComponents()`.

In this example, the `BannerComponent` is the only component to compile.
Other examples configure the testing module with multiple components
and may import application modules that hold yet more components.
Any of them could require external files.

The `TestBed.compileComponents` method asynchronously compiles all components configured in the testing module.

<div class="alert is-important">

Do not re-configure the `TestBed` after calling `compileComponents()`.

</div>

Calling `compileComponents()` closes the current `TestBed` instance to further configuration.
You cannot call any more `TestBed` configuration methods, not `configureTestingModule()`
nor any of the `override...` methods. The `TestBed` throws an error if you try.

Make `compileComponents()` the last step
before calling `TestBed.createComponent()`.

#### The synchronous _beforeEach_

The second, synchronous `beforeEach()` contains the remaining setup steps,
which include creating the component and querying for elements to inspect.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="sync-before-each"
  header="app/banner/banner-external.component.spec.ts (synchronous beforeEach)"></code-example>

You can count on the test runner to wait for the first asynchronous `beforeEach` to finish before calling the second.

#### Consolidated setup

You can consolidate the two `beforeEach()` functions into a single, async `beforeEach()`.

The `compileComponents()` method returns a promise so you can perform the
synchronous setup tasks _after_ compilation by moving the synchronous code
into a `then(...)` callback.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="one-before-each"
  header="app/banner/banner-external.component.spec.ts (one beforeEach)"></code-example>

#### _compileComponents()_ is harmless

There's no harm in calling `compileComponents()` when it's not required.

The component test file generated by the CLI calls `compileComponents()`
even though it is never required when running `ng test`.

The tests in this guide only call `compileComponents` when necessary.

{@a import-module}
## Setup with module imports

Earlier component tests configured the testing module with a few `declarations` like this:

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="config-testbed"
  header="app/dashboard/dashboard-hero.component.spec.ts (configure TestBed)">
</code-example>

The `DashboardComponent` is simple. It needs no help.
But more complex components often depend on other components, directives, pipes, and providers
and these must be added to the testing module too.

Fortunately, the `TestBed.configureTestingModule` parameter parallels
the metadata passed to the `@NgModule` decorator
which means you can also specify `providers` and `imports`.

The `HeroDetailComponent` requires a lot of help despite its small size and simple construction.
In addition to the support it receives from the default testing module `CommonModule`, it needs:

- `NgModel` and friends in the `FormsModule` to enable two-way data binding.
- The `TitleCasePipe` from the `shared` folder.
- Router services (which these tests are stubbing).
- Hero data access services (also stubbed).

One approach is to configure the testing module from the individual pieces as in this example:

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-forms-module"
  header="app/hero/hero-detail.component.spec.ts (FormsModule setup)"></code-example>

<div class="alert is-helpful">

Notice that the `beforeEach()` is asynchronous and calls `TestBed.compileComponents`
because the `HeroDetailComponent` has an external template and css file.

As explained in [_Calling compileComponents()_](#compile-components) above,
these tests could be run in a non-CLI environment
where Angular would have to compile them in the browser.

</div>

#### Import a shared module

Because many application components need the `FormsModule` and the `TitleCasePipe`, the developer created
a `SharedModule` to combine these and other frequently requested parts.

The test configuration can use the `SharedModule` too as seen in this alternative setup:

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-shared-module"
  header="app/hero/hero-detail.component.spec.ts (SharedModule setup)"></code-example>

It's a bit tighter and smaller, with fewer import statements (not shown).

{@a feature-module-import}

#### Import a feature module

The `HeroDetailComponent` is part of the `HeroModule` [Feature Module](guide/feature-modules) that aggregates more of the interdependent pieces
including the `SharedModule`.
Try a test configuration that imports the `HeroModule` like this one:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-hero-module" header="app/hero/hero-detail.component.spec.ts (HeroModule setup)"></code-example>

That's _really_ crisp. Only the _test doubles_ in the `providers` remain. Even the `HeroDetailComponent` declaration is gone.

In fact, if you try to declare it, Angular will throw an error because
`HeroDetailComponent` is declared in both the `HeroModule` and the `DynamicTestModule`
created by the `TestBed`.

<div class="alert is-helpful">

Importing the component's feature module can be the easiest way to configure tests
when there are many mutual dependencies within the module and
the module is small, as feature modules tend to be.

</div>

{@a component-override}
## Override component providers

The `HeroDetailComponent` provides its own `HeroDetailService`.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="prototype" header="app/hero/hero-detail.component.ts (prototype)"></code-example>

It's not possible to stub the component's `HeroDetailService` in the `providers` of the `TestBed.configureTestingModule`.
Those are providers for the _testing module_, not the component. They prepare the dependency injector at the _fixture level_.

Angular creates the component with its _own_ injector, which is a _child_ of the fixture injector.
It registers the component's providers (the `HeroDetailService` in this case) with the child injector.

A test cannot get to child injector services from the fixture injector.
And `TestBed.configureTestingModule` can't configure them either.

Angular has been creating new instances of the real `HeroDetailService` all along!

<div class="alert is-helpful">

These tests could fail or timeout if the `HeroDetailService` made its own XHR calls to a remote server.
There might not be a remote server to call.

Fortunately, the `HeroDetailService` delegates responsibility for remote data access to an injected `HeroService`.

<code-example path="testing/src/app/hero/hero-detail.service.ts" region="prototype" header="app/hero/hero-detail.service.ts (prototype)"></code-example>

The [previous test configuration](#feature-module-import) replaces the real `HeroService` with a `TestHeroService`
that intercepts server requests and fakes their responses.

</div>

What if you aren't so lucky. What if faking the `HeroService` is hard?
What if `HeroDetailService` makes its own server requests?

The `TestBed.overrideComponent` method can replace the component's `providers` with easy-to-manage _test doubles_
as seen in the following setup variation:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override" header="app/hero/hero-detail.component.spec.ts (Override setup)"></code-example>

Notice that `TestBed.configureTestingModule` no longer provides a (fake) `HeroService` because it's [not needed](#spy-stub).

{@a override-component-method}

#### The _overrideComponent_ method

Focus on the `overrideComponent` method.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-component-method" header="app/hero/hero-detail.component.spec.ts (overrideComponent)"></code-example>

It takes two arguments: the component type to override (`HeroDetailComponent`) and an override metadata object.
The [override metadata object](guide/testing-utility-apis#metadata-override-object) is a generic defined as follows:

<code-example language="javascript">
  type MetadataOverride&lt;T&gt; = {
    add?: Partial&lt;T&gt;;
    remove?: Partial&lt;T&gt;;
    set?: Partial&lt;T&gt;;
  };
</code-example>

A metadata override object can either add-and-remove elements in metadata properties or completely reset those properties.
This example resets the component's `providers` metadata.

The type parameter, `T`, is the kind of metadata you'd pass to the `@Component` decorator:

<code-example language="javascript">
  selector?: string;
  template?: string;
  templateUrl?: string;
  providers?: any[];
  ...
</code-example>

{@a spy-stub}

#### Provide a _spy stub_ (_HeroDetailServiceSpy_)

This example completely replaces the component's `providers` array with a new array containing a `HeroDetailServiceSpy`.

The `HeroDetailServiceSpy` is a stubbed version of the real `HeroDetailService`
that fakes all necessary features of that service.
It neither injects nor delegates to the lower level `HeroService`
so there's no need to provide a test double for that.

The related `HeroDetailComponent` tests will assert that methods of the `HeroDetailService`
were called by spying on the service methods.
Accordingly, the stub implements its methods as spies:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="hds-spy" header="app/hero/hero-detail.component.spec.ts (HeroDetailServiceSpy)"></code-example>

{@a override-tests}

#### The override tests

Now the tests can control the component's hero directly by manipulating the spy-stub's `testHero`
and confirm that service methods were called.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests" header="app/hero/hero-detail.component.spec.ts (override tests)"></code-example>

{@a more-overrides}

#### More overrides

The `TestBed.overrideComponent` method can be called multiple times for the same or different components.
The `TestBed` offers similar `overrideDirective`, `overrideModule`, and `overridePipe` methods
for digging into and replacing parts of these other classes.

Explore the options and combinations on your own.
