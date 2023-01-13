# Component testing scenarios

This guide explores common component testing use cases.

<div class="alert is-helpful">

If you'd like to experiment with the application that this guide describes, <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

## Component binding

In the example application, the `BannerComponent` presents static title text in the HTML template.

After a few changes, the `BannerComponent` presents a dynamic title by binding to the component's `title` property like this.

<code-example header="app/banner/banner.component.ts" path="testing/src/app/banner/banner.component.ts" region="component"></code-example>

As minimal as this is, you decide to add a test to confirm that component actually displays the right content where you think it should.

#### Query for the `<h1>`

You'll write a sequence of tests that inspect the value of the `<h1>` element that wraps the *title* property interpolation binding.

You update the `beforeEach` to find that element with a standard HTML `querySelector` and assign it to the `h1` variable.

<code-example header="app/banner/banner.component.spec.ts (setup)" path="testing/src/app/banner/banner.component.spec.ts" region="setup"></code-example>

<a id="detect-changes"></a>

#### `createComponent()` does not bind data

For your first test you'd like to see that the screen displays the default `title`.
Your instinct is to write a test that immediately inspects the `<h1>` like this:

<code-example path="testing/src/app/banner/banner.component.spec.ts" region="expect-h1-default-v1"></code-example>

*That test fails* with the message:

<code-example format="javascript" language="javascript">

expected '' to contain 'Test Tour of Heroes'.

</code-example>

Binding happens when Angular performs **change detection**.

In production, change detection kicks in automatically when Angular creates a component or the user enters a keystroke or an asynchronous activity \(for example, AJAX\) completes.

The `TestBed.createComponent` does *not* trigger change detection; a fact confirmed in the revised test:

<code-example path="testing/src/app/banner/banner.component.spec.ts" region="test-w-o-detect-changes"></code-example>

#### `detectChanges()`

You must tell the `TestBed` to perform data binding by calling `fixture.detectChanges()`.
Only then does the `<h1>` have the expected title.

<code-example path="testing/src/app/banner/banner.component.spec.ts" region="expect-h1-default"></code-example>

Delayed change detection is intentional and useful.
It gives the tester an opportunity to inspect and change the state of the component *before Angular initiates data binding and calls [lifecycle hooks](guide/lifecycle-hooks)*.

Here's another test that changes the component's `title` property *before* calling `fixture.detectChanges()`.

<code-example path="testing/src/app/banner/banner.component.spec.ts" region="after-change"></code-example>

<a id="auto-detect-changes"></a>

#### Automatic change detection

The `BannerComponent` tests frequently call `detectChanges`.
Some testers prefer that the Angular test environment run change detection automatically.

That's possible by configuring the `TestBed` with the `ComponentFixtureAutoDetect` provider.
First import it from the testing utility library:

<code-example header="app/banner/banner.component.detect-changes.spec.ts (import)" path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="import-ComponentFixtureAutoDetect"></code-example>

Then add it to the `providers` array of the testing module configuration:

<code-example header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect)" path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect"></code-example>

Here are three tests that illustrate how automatic change detection works.

<code-example header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect Tests)" path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect-tests"></code-example>

The first test shows the benefit of automatic change detection.

The second and third test reveal an important limitation.
The Angular testing environment does *not* know that the test changed the component's `title`.
The `ComponentFixtureAutoDetect` service responds to *asynchronous activities* such as promise resolution, timers, and DOM events.
But a direct, synchronous update of the component property is invisible.
The test must call `fixture.detectChanges()` manually to trigger another cycle of change detection.

<div class="alert is-helpful">

Rather than wonder when the test fixture will or won't perform change detection, the samples in this guide *always call* `detectChanges()` *explicitly*.
There is no harm in calling `detectChanges()` more often than is strictly necessary.

</div>

<a id="dispatch-event"></a>

#### Change an input value with `dispatchEvent()`

To simulate user input, find the input element and set its `value` property.

You will call `fixture.detectChanges()` to trigger Angular's change detection.
But there is an essential, intermediate step.

Angular doesn't know that you set the input element's `value` property.
It won't read that property until you raise the element's `input` event by calling `dispatchEvent()`.
*Then* you call `detectChanges()`.

The following example demonstrates the proper sequence.

<code-example header="app/hero/hero-detail.component.spec.ts (pipe test)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe"></code-example>

## Component with external files

The preceding `BannerComponent` is defined with an *inline template* and *inline css*, specified in the `@Component.template` and `@Component.styles` properties respectively.

Many components specify *external templates* and *external css* with the `@Component.templateUrl` and `@Component.styleUrls` properties respectively, as the following variant of `BannerComponent` does.

<code-example header="app/banner/banner-external.component.ts (metadata)" path="testing/src/app/banner/banner-external.component.ts" region="metadata"></code-example>

This syntax tells the Angular compiler to read the external files during component compilation.

That's not a problem when you run the CLI `ng test` command because it *compiles the application before running the tests*.

However, if you run the tests in a **non-CLI environment**, tests of this component might fail.
For example, if you run the `BannerComponent` tests in a web coding environment such as [plunker](https://plnkr.co), you'll see a message like this one:

<code-example format="output" hideCopy language="shell">

Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.

</code-example>

You get this test failure message when the runtime environment compiles the source code *during the tests themselves*.

To correct the problem, call `compileComponents()` as explained in the following [Calling compileComponents](#compile-components) section.

<a id="component-with-dependency"></a>

## Component with a dependency

Components often have service dependencies.

The `WelcomeComponent` displays a welcome message to the logged-in user.
It knows who the user is based on a property of the injected `UserService`:

<code-example header="app/welcome/welcome.component.ts" path="testing/src/app/welcome/welcome.component.ts"></code-example>

The `WelcomeComponent` has decision logic that interacts with the service, logic that makes this component worth testing.
Here's the testing module configuration for the spec file:

<code-example header="app/welcome/welcome.component.spec.ts" path="testing/src/app/welcome/welcome.component.spec.ts" region="config-test-module"></code-example>

This time, in addition to declaring the *component-under-test*,
the configuration adds a `UserService` provider to the `providers` list.
But not the real `UserService`.

<a id="service-test-doubles"></a>

#### Provide service test doubles

A *component-under-test* doesn't have to be injected with real services.
In fact, it is usually better if they are test doubles such as, stubs, fakes, spies, or mocks.
The purpose of the spec is to test the component, not the service, and real services can be trouble.

Injecting the real `UserService` could be a nightmare.
The real service might ask the user for login credentials and attempt to reach an authentication server.
These behaviors can be hard to intercept.
It is far easier and safer to create and register a test double in place of the real `UserService`.

This particular test suite supplies a minimal mock of the `UserService` that satisfies the needs of the `WelcomeComponent` and its tests:

<code-example header="app/welcome/welcome.component.spec.ts" path="testing/src/app/welcome/welcome.component.spec.ts" region="user-service-stub"></code-example>

<a id="get-injected-service"></a>

#### Get injected services

The tests need access to the stub `UserService` injected into the `WelcomeComponent`.

Angular has a hierarchical injection system.
There can be injectors at multiple levels, from the root injector created by the `TestBed` down through the component tree.

The safest way to get the injected service, the way that ***always works***,
is to **get it from the injector of the *component-under-test***.
The component injector is a property of the fixture's `DebugElement`.

<code-example header="WelcomeComponent's injector" path="testing/src/app/welcome/welcome.component.spec.ts" region="injected-service"></code-example>

<a id="testbed-inject"></a>

#### `TestBed.inject()`

You *might* also be able to get the service from the root injector using `TestBed.inject()`.
This is easier to remember and less verbose.
But it only works when Angular injects the component with the service instance in the test's root injector.

In this test suite, the *only* provider of `UserService` is the root testing module, so it is safe to call `TestBed.inject()` as follows:

<code-example header="TestBed injector" path="testing/src/app/welcome/welcome.component.spec.ts" region="inject-from-testbed" ></code-example>

<div class="alert is-helpful">

For a use case in which `TestBed.inject()` does not work, see the [*Override component providers*](#component-override) section that explains when and why you must get the service from the component's injector instead.

</div>

<a id="welcome-spec-setup"></a>

#### Final setup and tests

Here's the complete `beforeEach()`, using `TestBed.inject()`:

<code-example header="app/welcome/welcome.component.spec.ts" path="testing/src/app/welcome/welcome.component.spec.ts" region="setup"></code-example>

And here are some tests:

<code-example header="app/welcome/welcome.component.spec.ts" path="testing/src/app/welcome/welcome.component.spec.ts" region="tests"></code-example>

The first is a sanity test; it confirms that the stubbed `UserService` is called and working.

<div class="alert is-helpful">

The second parameter to the Jasmine matcher \(for example, `'expected name'`\) is an optional failure label.
If the expectation fails, Jasmine appends this label to the expectation failure message.
In a spec with multiple expectations, it can help clarify what went wrong and which expectation failed.

</div>

The remaining tests confirm the logic of the component when the service returns different values.
The second test validates the effect of changing the user name.
The third test checks that the component displays the proper message when there is no logged-in user.

<a id="component-with-async-service"></a>

## Component with async service

In this sample, the `AboutComponent` template hosts a `TwainComponent`.
The `TwainComponent` displays Mark Twain quotes.

<code-example header="app/twain/twain.component.ts (template)" path="testing/src/app/twain/twain.component.ts" region="template" ></code-example>

<div class="alert is-helpful">

**NOTE**: <br />
The value of the component's `quote` property passes through an `AsyncPipe`.
That means the property returns either a `Promise` or an `Observable`.

</div>

In this example, the `TwainComponent.getQuote()` method tells you that the `quote` property returns an `Observable`.

<code-example header="app/twain/twain.component.ts (getQuote)" path="testing/src/app/twain/twain.component.ts" region="get-quote"></code-example>

The `TwainComponent` gets quotes from an injected `TwainService`.
The component starts the returned `Observable` with a placeholder value \(`'...'`\), before the service can return its first quote.

The `catchError` intercepts service errors, prepares an error message, and returns the placeholder value on the success channel.
It must wait a tick to set the `errorMessage` in order to avoid updating that message twice in the same change detection cycle.

These are all features you'll want to test.

#### Testing with a spy

When testing a component, only the service's public API should matter.
In general, tests themselves should not make calls to remote servers.
They should emulate such calls.
The setup in this `app/twain/twain.component.spec.ts` shows one way to do that:

<code-example header="app/twain/twain.component.spec.ts (setup)" path="testing/src/app/twain/twain.component.spec.ts" region="setup"></code-example>

<a id="service-spy"></a>

Focus on the spy.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="spy"></code-example>

The spy is designed such that any call to `getQuote` receives an observable with a test quote.
Unlike the real `getQuote()` method, this spy bypasses the server and returns a synchronous observable whose value is available immediately.

You can write many useful tests with this spy, even though its `Observable` is synchronous.

<a id="sync-tests"></a>

#### Synchronous tests

A key advantage of a synchronous `Observable` is that you can often turn asynchronous processes into synchronous tests.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="sync-test"></code-example>

Because the spy result returns synchronously, the `getQuote()` method updates the message on screen immediately *after* the first change detection cycle during which Angular calls `ngOnInit`.

You're not so lucky when testing the error path.
Although the service spy will return an error synchronously, the component method calls `setTimeout()`.
The test must wait at least one full turn of the JavaScript engine before the value becomes available.
The test must become *asynchronous*.

<a id="fake-async"></a>

#### Async test with `fakeAsync()`

To use `fakeAsync()` functionality, you must import `zone.js/testing` in your test setup file.
If you created your project with the Angular CLI, `zone-testing` is already imported in `src/test.ts`.

The following test confirms the expected behavior when the service returns an `ErrorObservable`.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="error-test"></code-example>

<div class="alert is-helpful">

**NOTE**: <br />
The `it()` function receives an argument of the following form.

</div>

<code-example format="javascript" language="javascript">

fakeAsync(() =&gt; { /* test body */ })

</code-example>

The `fakeAsync()` function enables a linear coding style by running the test body in a special `fakeAsync test zone`.
The test body appears to be synchronous.
There is no nested syntax \(like a `Promise.then()`\) to disrupt the flow of control.

<div class="alert is-helpful">

Limitation: The `fakeAsync()` function won't work if the test body makes an `XMLHttpRequest` \(XHR\) call.
XHR calls within a test are rare, but if you need to call XHR, see the [`waitForAsync()`](#waitForAsync) section.

</div>

<a id="tick"></a>

#### The `tick()` function

You do have to call [tick()](api/core/testing/tick) to advance the virtual clock.

Calling [tick()](api/core/testing/tick) simulates the passage of time until all pending asynchronous activities finish.
In this case, it waits for the error handler's `setTimeout()`.

The [tick()](api/core/testing/tick) function accepts `millis` and `tickOptions` as parameters. The `millis` parameter specifies how much the virtual clock advances and defaults to `0` if not provided.
For example, if you have a `setTimeout(fn, 100)` in a `fakeAsync()` test, you need to use `tick(100)` to trigger the fn callback.
The optional `tickOptions` parameter has a property named `processNewMacroTasksSynchronously`. The `processNewMacroTasksSynchronously` property represents whether to invoke new generated macro tasks when ticking and defaults to `true`.

<code-example path="testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-tick"></code-example>

The [tick()](api/core/testing/tick) function is one of the Angular testing utilities that you import with `TestBed`.
It's a companion to `fakeAsync()` and you can only call it within a `fakeAsync()` body.

#### tickOptions

In this example, you have a new macro task, the nested `setTimeout` function. By default, when the `tick` is setTimeout, `outside` and `nested` will both be triggered.

<code-example path="testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-tick-new-macro-task-sync"></code-example>

In some case, you don't want to trigger the new macro task when ticking. You can use `tick(millis, {processNewMacroTasksSynchronously: false})` to not invoke a new macro task.

<code-example path="testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-tick-new-macro-task-async"></code-example>

#### Comparing dates inside fakeAsync()

`fakeAsync()` simulates passage of time, which lets you calculate the difference between dates inside `fakeAsync()`.

<code-example path="testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-date"></code-example>

#### jasmine.clock with fakeAsync()

Jasmine also provides a `clock` feature to mock dates.
Angular automatically runs tests that are run after `jasmine.clock().install()` is called inside a `fakeAsync()` method until `jasmine.clock().uninstall()` is called.
`fakeAsync()` is not needed and throws an error if nested.

By default, this feature is disabled.
To enable it, set a global flag before importing `zone-testing`.

If you use the Angular CLI, configure this flag in `src/test.ts`.

<code-example format="typescript" language="typescript">

(window as any)['&lowbar;&lowbar;zone&lowbar;symbol__fakeAsyncPatchLock'] = true;
import 'zone.js/testing';

</code-example>

<code-example path="testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-clock"></code-example>

#### Using the RxJS scheduler inside fakeAsync()

You can also use RxJS scheduler in `fakeAsync()` just like using `setTimeout()` or `setInterval()`, but you need to import `zone.js/plugins/zone-patch-rxjs-fake-async` to patch RxJS scheduler.

<code-example path="testing/src/app/demo/async-helper.spec.ts" region="fake-async-test-rxjs"></code-example>

#### Support more macroTasks

By default, `fakeAsync()` supports the following macro tasks.

*   `setTimeout`
*   `setInterval`
*   `requestAnimationFrame`
*   `webkitRequestAnimationFrame`
*   `mozRequestAnimationFrame`

If you run other macro tasks such as `HTMLCanvasElement.toBlob()`, an *"Unknown macroTask scheduled in fake async test"* error is thrown.

<code-tabs>
    <code-pane header="src/app/shared/canvas.component.spec.ts (failing)" path="testing/src/app/shared/canvas.component.spec.ts" region="without-toBlob-macrotask"></code-pane>
    <code-pane header="src/app/shared/canvas.component.ts" path="testing/src/app/shared/canvas.component.ts" region="main"></code-pane>
</code-tabs>

If you want to support such a case, you need to define the macro task you want to support in `beforeEach()`.
For example:

<code-example header="src/app/shared/canvas.component.spec.ts (excerpt)" path="testing/src/app/shared/canvas.component.spec.ts" region="enable-toBlob-macrotask"></code-example>

<div class="alert is-helpful">

**NOTE**: <br />
In order to make the `<canvas>` element Zone.js-aware in your app, you need to import the `zone-patch-canvas` patch \(either in `polyfills.ts` or in the specific file that uses `<canvas>`\):

</div>

<code-example header="src/polyfills.ts or src/app/shared/canvas.component.ts" path="testing/src/app/shared/canvas.component.ts" region="import-canvas-patch"></code-example>

#### Async observables

You might be satisfied with the test coverage of these tests.

However, you might be troubled by the fact that the real service doesn't quite behave this way.
The real service sends requests to a remote server.
A server takes time to respond and the response certainly won't be available immediately as in the previous two tests.

Your tests will reflect the real world more faithfully if you return an *asynchronous* observable from the `getQuote()` spy like this.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="async-setup"></code-example>

#### Async observable helpers

The async observable was produced by an `asyncData` helper.
The `asyncData` helper is a utility function that you'll have to write yourself, or copy this one from the sample code.

<code-example header="testing/async-observable-helpers.ts" path="testing/src/testing/async-observable-helpers.ts" region="async-data"></code-example>

This helper's observable emits the `data` value in the next turn of the JavaScript engine.

The [RxJS `defer()` operator](http://reactivex.io/documentation/operators/defer.html) returns an observable.
It takes a factory function that returns either a promise or an observable.
When something subscribes to *defer*'s observable, it adds the subscriber to a new observable created with that factory.

The `defer()` operator transforms the `Promise.resolve()` into a new observable that, like `HttpClient`, emits once and completes.
Subscribers are unsubscribed after they receive the data value.

There's a similar helper for producing an async error.

<code-example path="testing/src/testing/async-observable-helpers.ts" region="async-error"></code-example>

#### More async tests

Now that the `getQuote()` spy is returning async observables, most of your tests will have to be async as well.

Here's a `fakeAsync()` test that demonstrates the data flow you'd expect in the real world.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="fake-async-test"></code-example>

Notice that the quote element displays the placeholder value \(`'...'`\) after `ngOnInit()`.
The first quote hasn't arrived yet.

To flush the first quote from the observable, you call [tick()](api/core/testing/tick).
Then call `detectChanges()` to tell Angular to update the screen.

Then you can assert that the quote element displays the expected text.

<a id="waitForAsync"></a>

#### Async test with `waitForAsync()`

To use `waitForAsync()` functionality, you must import `zone.js/testing` in your test setup file.
If you created your project with the Angular CLI, `zone-testing` is already imported in `src/test.ts`.

Here's the previous `fakeAsync()` test, re-written with the `waitForAsync()` utility.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="waitForAsync-test"></code-example>

The `waitForAsync()` utility hides some asynchronous boilerplate by arranging for the tester's code to run in a special *async test zone*.
You don't need to pass Jasmine's `done()` into the test and call `done()` because it is `undefined` in promise or observable callbacks.

But the test's asynchronous nature is revealed by the call to `fixture.whenStable()`, which breaks the linear flow of control.

When using an `intervalTimer()` such as `setInterval()` in `waitForAsync()`, remember to cancel the timer with `clearInterval()` after the test, otherwise the `waitForAsync()` never ends.

<a id="when-stable"></a>

#### `whenStable`

The test must wait for the `getQuote()` observable to emit the next quote.
Instead of calling [tick()](api/core/testing/tick), it calls `fixture.whenStable()`.

The `fixture.whenStable()` returns a promise that resolves when the JavaScript engine's task queue becomes empty.
In this example, the task queue becomes empty when the observable emits the first quote.

The test resumes within the promise callback, which calls `detectChanges()` to update the quote element with the expected text.

<a id="jasmine-done"></a>

#### Jasmine `done()`

While the `waitForAsync()` and `fakeAsync()` functions greatly simplify Angular asynchronous testing, you can still fall back to the traditional technique and pass `it` a function that takes a [`done` callback](https://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support).

You can't call `done()` in `waitForAsync()` or `fakeAsync()` functions, because the `done parameter` is `undefined`.

Now you are responsible for chaining promises, handling errors, and calling `done()` at the appropriate moments.

Writing test functions with `done()`, is more cumbersome than `waitForAsync()`and `fakeAsync()`, but it is occasionally necessary when code involves the `intervalTimer()` like `setInterval`.

Here are two more versions of the previous test, written with `done()`.
The first one subscribes to the `Observable` exposed to the template by the component's `quote` property.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="quote-done-test"></code-example>

The RxJS `last()` operator emits the observable's last value before completing, which will be the test quote.
The `subscribe` callback calls `detectChanges()` to update the quote element with the test quote, in the same manner as the earlier tests.

In some tests, you're more interested in how an injected service method was called and what values it returned, than what appears on screen.

A service spy, such as the `qetQuote()` spy of the fake `TwainService`, can give you that information and make assertions about the state of the view.

<code-example path="testing/src/app/twain/twain.component.spec.ts" region="spy-done-test"></code-example>

<a id="marble-testing"></a>

## Component marble tests

The previous `TwainComponent` tests simulated an asynchronous observable response from the `TwainService` with the `asyncData` and `asyncError` utilities.

These are short, simple functions that you can write yourself.
Unfortunately, they're too simple for many common scenarios.
An observable often emits multiple times, perhaps after a significant delay.
A component might coordinate multiple observables with overlapping sequences of values and errors.

**RxJS marble testing** is a great way to test observable scenarios, both simple and complex.
You've likely seen the [marble diagrams](https://rxmarbles.com) that illustrate how observables work.
Marble testing uses a similar marble language to specify the observable streams and expectations in your tests.

The following examples revisit two of the `TwainComponent` tests with marble testing.

Start by installing the `jasmine-marbles` npm package.
Then import the symbols you need.

<code-example header="app/twain/twain.component.marbles.spec.ts (import marbles)" path="testing/src/app/twain/twain.component.marbles.spec.ts" region="import-marbles"></code-example>

Here's the complete test for getting a quote:

<code-example path="testing/src/app/twain/twain.component.marbles.spec.ts" region="get-quote-test"></code-example>

Notice that the Jasmine test is synchronous.
There's no `fakeAsync()`.
Marble testing uses a test scheduler to simulate the passage of time in a synchronous test.

The beauty of marble testing is in the visual definition of the observable streams.
This test defines a [*cold* observable](#cold-observable) that waits three [frames](#marble-frame) \(`---`\), emits a value \(`x`\), and completes \(`|`\).
In the second argument you map the value marker \(`x`\) to the emitted value \(`testQuote`\).

<code-example path="testing/src/app/twain/twain.component.marbles.spec.ts" region="test-quote-marbles"></code-example>

The marble library constructs the corresponding observable, which the test sets as the `getQuote` spy's return value.

When you're ready to activate the marble observables, you tell the `TestScheduler` to *flush* its queue of prepared tasks like this.

<code-example path="testing/src/app/twain/twain.component.marbles.spec.ts" region="test-scheduler-flush"></code-example>

This step serves a purpose analogous to [tick()](api/core/testing/tick) and `whenStable()` in the earlier `fakeAsync()` and `waitForAsync()` examples.
The balance of the test is the same as those examples.

#### Marble error testing

Here's the marble testing version of the `getQuote()` error test.

<code-example path="testing/src/app/twain/twain.component.marbles.spec.ts" region="error-test"></code-example>

It's still an async test, calling `fakeAsync()` and [tick()](api/core/testing/tick), because the component itself calls `setTimeout()` when processing errors.

Look at the marble observable definition.

<code-example path="testing/src/app/twain/twain.component.marbles.spec.ts" region="error-marbles"></code-example>

This is a *cold* observable that waits three frames and then emits an error, the hash \(`#`\) character indicates the timing of the error that is specified in the third argument.
The second argument is null because the observable never emits a value.

#### Learn about marble testing

<a id="marble-frame"></a>

A *marble frame* is a virtual unit of testing time.
Each symbol \(`-`, `x`, `|`, `#`\) marks the passing of one frame.

<a id="cold-observable"></a>

A *cold* observable doesn't produce values until you subscribe to it.
Most of your application observables are cold.
All [*HttpClient*](guide/http) methods return cold observables.

A *hot* observable is already producing values *before* you subscribe to it.
The [`Router.events`](api/router/Router#events) observable, which reports router activity, is a *hot* observable.

RxJS marble testing is a rich subject, beyond the scope of this guide.
Learn about it on the web, starting with the [official documentation](https://rxjs.dev/guide/testing/marble-testing).

<a id="component-with-input-output"></a>

## Component with inputs and outputs

A component with inputs and outputs typically appears inside the view template of a host component.
The host uses a property binding to set the input property and an event binding to listen to events raised by the output property.

The testing goal is to verify that such bindings work as expected.
The tests should set input values and listen for output events.

The `DashboardHeroComponent` is a tiny example of a component in this role.
It displays an individual hero provided by the `DashboardComponent`.
Clicking that hero tells the `DashboardComponent` that the user has selected the hero.

The `DashboardHeroComponent` is embedded in the `DashboardComponent` template like this:

<code-example header="app/dashboard/dashboard.component.html (excerpt)" path="testing/src/app/dashboard/dashboard.component.html" region="dashboard-hero"></code-example>

The `DashboardHeroComponent` appears in an `*ngFor` repeater, which sets each component's `hero` input property to the looping value and listens for the component's `selected` event.

Here's the component's full definition:

<a id="dashboard-hero-component"></a>

<code-example header="app/dashboard/dashboard-hero.component.ts (component)" path="testing/src/app/dashboard/dashboard-hero.component.ts" region="component"></code-example>

While testing a component this simple has little intrinsic value, it's worth knowing how.
Use one of these approaches:

*   Test it as used by `DashboardComponent`
*   Test it as a stand-alone component
*   Test it as used by a substitute for `DashboardComponent`

A quick look at the `DashboardComponent` constructor discourages the first approach:

<code-example header="app/dashboard/dashboard.component.ts (constructor)" path="testing/src/app/dashboard/dashboard.component.ts" region="ctor"></code-example>

The `DashboardComponent` depends on the Angular router and the `HeroService`.
You'd probably have to replace them both with test doubles, which is a lot of work.
The router seems particularly challenging.

<div class="alert is-helpful">

The [following discussion](#routing-component) covers testing components that require the router.

</div>

The immediate goal is to test the `DashboardHeroComponent`, not the `DashboardComponent`, so, try the second and third options.

<a id="dashboard-standalone"></a>

#### Test `DashboardHeroComponent` stand-alone

Here's the meat of the spec file setup.

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (setup)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="setup"></code-example>

Notice how the setup code assigns a test hero \(`expectedHero`\) to the component's `hero` property, emulating the way the `DashboardComponent` would set it using the property binding in its repeater.

The following test verifies that the hero name is propagated to the template using a binding.

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="name-test"></code-example>

Because the [template](#dashboard-hero-component) passes the hero name through the Angular `UpperCasePipe`, the test must match the element value with the upper-cased name.

<div class="alert is-helpful">

This small test demonstrates how Angular tests can verify a component's visual representation &mdash;something not possible with [component class tests](guide/testing-components-basics#component-class-testing)&mdash; at low cost and without resorting to much slower and more complicated end-to-end tests.

</div>

#### Clicking

Clicking the hero should raise a `selected` event that the host component \(`DashboardComponent` presumably\) can hear:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test"></code-example>

The component's `selected` property returns an `EventEmitter`, which looks like an RxJS synchronous `Observable` to consumers.
The test subscribes to it *explicitly* just as the host component does *implicitly*.

If the component behaves as expected, clicking the hero's element should tell the component's `selected` property to emit the `hero` object.

The test detects that event through its subscription to `selected`.

<a id="trigger-event-handler"></a>

#### `triggerEventHandler`

The `heroDe` in the previous test is a `DebugElement` that represents the hero `<div>`.

It has Angular properties and methods that abstract interaction with the native element.
This test calls the `DebugElement.triggerEventHandler` with the "click" event name.
The "click" event binding responds by calling `DashboardHeroComponent.click()`.

The Angular `DebugElement.triggerEventHandler` can raise *any data-bound event* by its *event name*.
The second parameter is the event object passed to the handler.

The test triggered a "click" event.

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="trigger-event-handler"></code-example>

In this case, the test correctly assumes that the runtime event handler, the component's `click()` method, doesn't care about the event object.

<div class="alert is-helpful">

Other handlers are less forgiving.
For example, the `RouterLink` directive expects an object with a `button` property that identifies which mouse button, if any, was pressed during the click.
The `RouterLink` directive throws an error if the event object is missing.

</div>

#### Click the element

The following test alternative calls the native element's own `click()` method, which is perfectly fine for *this component*.

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test-2"></code-example>

<a id="click-helper"></a>

#### `click()` helper

Clicking a button, an anchor, or an arbitrary HTML element is a common test task.

Make that consistent and straightforward by encapsulating the *click-triggering* process in a helper such as the following `click()` function:

<code-example header="testing/index.ts (click helper)" path="testing/src/testing/index.ts" region="click-event"></code-example>

The first parameter is the *element-to-click*.
If you want, pass a custom event object as the second parameter.
The default is a partial [left-button mouse event object](https://developer.mozilla.org/docs/Web/API/MouseEvent/button) accepted by many handlers including the `RouterLink` directive.

<div class="alert is-important">

The `click()` helper function is **not** one of the Angular testing utilities.
It's a function defined in *this guide's sample code*.
All of the sample tests use it.
If you like it, add it to your own collection of helpers.

</div>

Here's the previous test, rewritten using the click helper.

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (test with click helper)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test-3"></code-example>

<a id="component-inside-test-host"></a>

## Component inside a test host

The previous tests played the role of the host `DashboardComponent` themselves.
But does the `DashboardHeroComponent` work correctly when properly data-bound to a host component?

You could test with the actual `DashboardComponent`.
But doing so could require a lot of setup, especially when its template features an `*ngFor` repeater, other components, layout HTML, additional bindings, a constructor that injects multiple services, and it starts interacting with those services right away.

Imagine the effort to disable these distractions, just to prove a point that can be made satisfactorily with a *test host* like this one:

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (test host)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host"></code-example>

This test host binds to `DashboardHeroComponent` as the `DashboardComponent` would but without the noise of the `Router`, the `HeroService`, or the `*ngFor` repeater.

The test host sets the component's `hero` input property with its test hero.
It binds the component's `selected` event with its `onSelected` handler, which records the emitted hero in its `selectedHero` property.

Later, the tests will be able to check `selectedHero` to verify that the `DashboardHeroComponent.selected` event emitted the expected hero.

The setup for the `test-host` tests is similar to the setup for the stand-alone tests:

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (test host setup)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup"></code-example>

This testing module configuration shows three important differences:

*   It *declares* both the `DashboardHeroComponent` and the `TestHostComponent`
*   It *creates* the `TestHostComponent` instead of the `DashboardHeroComponent`
*   The `TestHostComponent` sets the `DashboardHeroComponent.hero` with a binding

The `createComponent` returns a `fixture` that holds an instance of `TestHostComponent` instead of an instance of `DashboardHeroComponent`.

Creating the `TestHostComponent` has the side effect of creating a `DashboardHeroComponent` because the latter appears within the template of the former.
The query for the hero element \(`heroEl`\) still finds it in the test DOM, albeit at greater depth in the element tree than before.

The tests themselves are almost identical to the stand-alone version:

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (test-host)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-tests"></code-example>

Only the selected event test differs.
It confirms that the selected `DashboardHeroComponent` hero really does find its way up through the event binding to the host component.

<a id="routing-component"></a>

## Routing component

A *routing component* is a component that tells the `Router` to navigate to another component.
The `DashboardComponent` is a *routing component* because the user can navigate to the `HeroDetailComponent` by clicking on one of the *hero buttons* on the dashboard.

Routing is pretty complicated.
Testing the `DashboardComponent` seemed daunting in part because it involves the `Router`, which it injects together with the `HeroService`.

<code-example header="app/dashboard/dashboard.component.ts (constructor)" path="testing/src/app/dashboard/dashboard.component.ts" region="ctor"></code-example>

<code-example header="app/dashboard/dashboard.component.ts (goToDetail)" path="testing/src/app/dashboard/dashboard.component.ts" region="goto-detail" ></code-example>

Angular provides test helpers to reduce boilerplate and more effectively test code which depends on the Router and HttpClient.

<code-example header="app/dashboard/dashboard.component.spec.ts" path="testing/src/app/dashboard/dashboard.component.spec.ts" region="router-harness"></code-example>

The following test clicks the displayed hero and confirms that we navigate to the expected URL.

<code-example header="app/dashboard/dashboard.component.spec.ts (navigate test)" path="testing/src/app/dashboard/dashboard.component.spec.ts" region="navigate-test"></code-example>

<a id="routed-component-w-param"></a>

## Routed components

A *routed component* is the destination of a `Router` navigation.
It can be trickier to test, especially when the route to the component *includes parameters*.
The `HeroDetailComponent` is a *routed component* that is the destination of such a route.

When a user clicks a *Dashboard* hero, the `DashboardComponent` tells the `Router` to navigate to `heroes/:id`.
The `:id` is a route parameter whose value is the `id` of the hero to edit.

The `Router` matches that URL to a route to the `HeroDetailComponent`.
It creates an `ActivatedRoute` object with the routing information and injects it into a new instance of the `HeroDetailComponent`.

Here's the `HeroDetailComponent` constructor:

<code-example header="app/hero/hero-detail.component.ts (constructor)" path="testing/src/app/hero/hero-detail.component.ts" region="ctor"></code-example>

The `HeroDetail` component needs the `id` parameter so it can fetch the corresponding hero using the `HeroDetailService`.
The component has to get the `id` from the `ActivatedRoute.paramMap` property which is an `Observable`.

It can't just reference the `id` property of the `ActivatedRoute.paramMap`.
The component has to *subscribe* to the `ActivatedRoute.paramMap` observable and be prepared for the `id` to change during its lifetime.

<code-example header="app/hero/hero-detail.component.ts (ngOnInit)" path="testing/src/app/hero/hero-detail.component.ts" region="ng-on-init"></code-example>

<div class="alert is-helpful">

The [ActivatedRoute in action](guide/router-tutorial-toh#activated-route-in-action) section of the [Router tutorial: tour of heroes](guide/router-tutorial-toh) guide covers `ActivatedRoute.paramMap` in more detail.

</div>

Tests can explore how the `HeroDetailComponent` responds to different `id` parameter values by navigating to different routes.

#### Testing with the `RouterTestingHarness`

Here's a test demonstrating the component's behavior when the observed `id` refers to an existing hero:

<code-example header="app/hero/hero-detail.component.spec.ts (existing id)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-good-id"></code-example>

<div class="alert is-helpful">

In the following section, the `createComponent()` method and `page` object are discussed.
Rely on your intuition for now.

</div>

When the `id` cannot be found, the component should re-route to the `HeroListComponent`.

The test suite setup provided the same router harness [described above](#routing-component).

This test expects the component to try to navigate to the `HeroListComponent`.

<code-example header="app/hero/hero-detail.component.spec.ts (bad id)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-bad-id"></code-example>

## Nested component tests

Component templates often have nested components, whose templates might contain more components.

The component tree can be very deep and, most of the time, the nested components play no role in testing the component at the top of the tree.

The `AppComponent`, for example, displays a navigation bar with anchors and their `RouterLink` directives.

<code-example header="app/app.component.html" path="testing/src/app/app.component.html"></code-example>

To validate the links, you don't need the `Router` to navigate and you don't need the `<router-outlet>` to mark where the `Router` inserts *routed components*.

The `BannerComponent` and `WelcomeComponent` \(indicated by `<app-banner>` and `<app-welcome>`\) are also irrelevant.

Yet any test that creates the `AppComponent` in the DOM also creates instances of these three components and, if you let that happen, you'll have to configure the `TestBed` to create them.

If you neglect to declare them, the Angular compiler won't recognize the `<app-banner>`, `<app-welcome>`, and `<router-outlet>` tags in the `AppComponent` template and will throw an error.

If you declare the real components, you'll also have to declare *their* nested components and provide for *all* services injected in *any* component in the tree.

That's too much effort just to answer a few simple questions about links.

This section describes two techniques for minimizing the setup.
Use them, alone or in combination, to stay focused on testing the primary component.

<a id="stub-component"></a>

##### Stubbing unneeded components

In the first technique, you create and declare stub versions of the components and directive that play little or no role in the tests.

<code-example header="app/app.component.spec.ts (stub declaration)" path="testing/src/app/app.component.spec.ts" region="component-stubs"></code-example>

The stub selectors match the selectors for the corresponding real components.
But their templates and classes are empty.

Then declare them in the `TestBed` configuration next to the components, directives, and pipes that need to be real.

<code-example header="app/app.component.spec.ts (TestBed stubs)" path="testing/src/app/app.component.spec.ts" region="testbed-stubs"></code-example>

The `AppComponent` is the test subject, so of course you declare the real version.

The rest are stubs.

<a id="no-errors-schema"></a>

#### `NO_ERRORS_SCHEMA`

In the second approach, add `NO_ERRORS_SCHEMA` to the `TestBed.schemas` metadata.

<code-example header="app/app.component.spec.ts (NO_ERRORS_SCHEMA)" path="testing/src/app/app.component.spec.ts" region="no-errors-schema"></code-example>

The `NO_ERRORS_SCHEMA` tells the Angular compiler to ignore unrecognized elements and attributes.

The compiler recognizes the `<app-root>` element and the `routerLink` attribute because you declared a corresponding `AppComponent` and `RouterLink` in the `TestBed` configuration.

But the compiler won't throw an error when it encounters `<app-banner>`, `<app-welcome>`, or `<router-outlet>`.
It simply renders them as empty tags and the browser ignores them.

You no longer need the stub components.

#### Use both techniques together

These are techniques for *Shallow Component Testing*, so-named because they reduce the visual surface of the component to just those elements in the component's template that matter for tests.

The `NO_ERRORS_SCHEMA` approach is the easier of the two but don't overuse it.

The `NO_ERRORS_SCHEMA` also prevents the compiler from telling you about the missing components and attributes that you omitted inadvertently or misspelled.
You could waste hours chasing phantom bugs that the compiler would have caught in an instant.

The *stub component* approach has another advantage.
While the stubs in *this* example were empty, you could give them stripped-down templates and classes if your tests need to interact with them in some way.

In practice you will combine the two techniques in the same setup, as seen in this example.

<code-example header="app/app.component.spec.ts (mixed setup)" path="testing/src/app/app.component.spec.ts" region="mixed-setup"></code-example>

The Angular compiler creates the `BannerStubComponent` for the `<app-banner>` element and applies the `RouterLink` to the anchors with the `routerLink` attribute, but it ignores the `<app-welcome>` and `<router-outlet>` tags.

<a id="by-directive"></a>
<a id="inject-directive"></a>

#### `By.directive` and injected directives

A little more setup triggers the initial data binding and gets references to the navigation links:

<code-example header="app/app.component.spec.ts (test setup)" path="testing/src/app/app.component.spec.ts" region="test-setup"></code-example>

Three points of special interest:

*   Locate the anchor elements with an attached directive using `By.directive`
*   The query returns `DebugElement` wrappers around the matching elements
*   Each `DebugElement` exposes a dependency injector with the specific instance of the directive attached to that element

The `AppComponent` links to validate are as follows:

<code-example header="app/app.component.html (navigation links)" path="testing/src/app/app.component.html" region="links"></code-example>

<a id="app-component-tests"></a>

Here are some tests that confirm those links are wired to the `routerLink` directives as expected:

<code-example header="app/app.component.spec.ts (selected tests)" path="testing/src/app/app.component.spec.ts" region="tests"></code-example>

<a id="page-object"></a>

## Use a `page` object

The `HeroDetailComponent` is a simple view with a title, two hero fields, and two buttons.

<div class="lightbox">

<img alt="HeroDetailComponent in action" src="generated/images/guide/testing/hero-detail.component.png">

</div>

But there's plenty of template complexity even in this simple form.

<code-example
  path="testing/src/app/hero/hero-detail.component.html" header="app/hero/hero-detail.component.html"></code-example>

Tests that exercise the component need &hellip;

*   To wait until a hero arrives before elements appear in the DOM
*   A reference to the title text
*   A reference to the name input box to inspect and set it
*   References to the two buttons so they can click them
*   Spies for some of the component and router methods

Even a small form such as this one can produce a mess of tortured conditional setup and CSS element selection.

Tame the complexity with a `Page` class that handles access to component properties and encapsulates the logic that sets them.

Here is such a `Page` class for the `hero-detail.component.spec.ts`

<code-example header="app/hero/hero-detail.component.spec.ts (Page)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="page"></code-example>

Now the important hooks for component manipulation and inspection are neatly organized and accessible from an instance of `Page`.

A `createComponent` method creates a `page` object and fills in the blanks once the `hero` arrives.

<code-example header="app/hero/hero-detail.component.spec.ts (createComponent)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="create-component"></code-example>

Here are a few more `HeroDetailComponent` tests to reinforce the point.

<code-example header="app/hero/hero-detail.component.spec.ts (selected tests)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="selected-tests"></code-example>

<a id="compile-components"></a>

## Calling `compileComponents()`

<div class="alert is-helpful">

Ignore this section if you *only* run tests with the CLI `ng test` command because the CLI compiles the application before running the tests.

</div>

If you run tests in a **non-CLI environment**, the tests might fail with a message like this one:

<code-example format="output" hideCopy language="shell">

Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.

</code-example>

The root of the problem is at least one of the components involved in the test specifies an external template or CSS file as the following version of the `BannerComponent` does.

<code-example header="app/banner/banner-external.component.ts (external template & css)" path="testing/src/app/banner/banner-external.component.ts"></code-example>

The test fails when the `TestBed` tries to create the component.

<code-example avoid header="app/banner/banner-external.component.spec.ts (setup that fails)" path="testing/src/app/banner/banner-external.component.spec.ts" region="setup-may-fail"></code-example>

Recall that the application hasn't been compiled.
So when you call `createComponent()`, the `TestBed` compiles implicitly.

That's not a problem when the source code is in memory.
But the `BannerComponent` requires external files that the compiler must read from the file system, an inherently *asynchronous* operation.

If the `TestBed` were allowed to continue, the tests would run and fail mysteriously before the compiler could finish.

The preemptive error message tells you to compile explicitly with `compileComponents()`.

#### `compileComponents()` is async

You must call `compileComponents()` within an asynchronous test function.

<div class="alert is-critical">

If you neglect to make the test function async (for example, forget to use `waitForAsync()` as described), you'll see this error message

<code-example format="output" hideCopy language="shell">

Error: ViewDestroyedError: Attempt to use a destroyed view

</code-example>

</div>

A typical approach is to divide the setup logic into two separate `beforeEach()` functions:

| Functions                   | Details |
|:---                         |:---     |
| Asynchronous `beforeEach()` | Compiles the components      |
| Synchronous `beforeEach()`  | Performs the remaining setup |

#### The async `beforeEach`

Write the first async `beforeEach` like this.

<code-example header="app/banner/banner-external.component.spec.ts (async beforeEach)" path="testing/src/app/banner/banner-external.component.spec.ts" region="async-before-each"></code-example>

The `TestBed.configureTestingModule()` method returns the `TestBed` class so you can chain calls to other `TestBed` static methods such as `compileComponents()`.

In this example, the `BannerComponent` is the only component to compile.
Other examples configure the testing module with multiple components and might import application modules that hold yet more components.
Any of them could require external files.

The `TestBed.compileComponents` method asynchronously compiles all components configured in the testing module.

<div class="alert is-important">

Do not re-configure the `TestBed` after calling `compileComponents()`.

</div>

Calling `compileComponents()` closes the current `TestBed` instance to further configuration.
You cannot call any more `TestBed` configuration methods, not `configureTestingModule()` nor any of the `override...` methods.
The `TestBed` throws an error if you try.

Make `compileComponents()` the last step before calling `TestBed.createComponent()`.

#### The synchronous `beforeEach`

The second, synchronous `beforeEach()` contains the remaining setup steps, which include creating the component and querying for elements to inspect.

<code-example header="app/banner/banner-external.component.spec.ts (synchronous beforeEach)" path="testing/src/app/banner/banner-external.component.spec.ts" region="sync-before-each"></code-example>

Count on the test runner to wait for the first asynchronous `beforeEach` to finish before calling the second.

#### Consolidated setup

You can consolidate the two `beforeEach()` functions into a single, async `beforeEach()`.

The `compileComponents()` method returns a promise so you can perform the synchronous setup tasks *after* compilation by moving the synchronous code after the `await` keyword, where the promise has been resolved.

<code-example header="app/banner/banner-external.component.spec.ts (one beforeEach)" path="testing/src/app/banner/banner-external.component.spec.ts" region="one-before-each"></code-example>

#### `compileComponents()` is harmless

There's no harm in calling `compileComponents()` when it's not required.

The component test file generated by the CLI calls `compileComponents()` even though it is never required when running `ng test`.

The tests in this guide only call `compileComponents` when necessary.

<a id="import-module"></a>

## Setup with module imports

Earlier component tests configured the testing module with a few `declarations` like this:

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (configure TestBed)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="config-testbed"></code-example>

The `DashboardComponent` is simple.
It needs no help.
But more complex components often depend on other components, directives, pipes, and providers and these must be added to the testing module too.

Fortunately, the `TestBed.configureTestingModule` parameter parallels the metadata passed to the `@NgModule` decorator which means you can also specify `providers` and `imports`.

The `HeroDetailComponent` requires a lot of help despite its small size and simple construction.
In addition to the support it receives from the default testing module `CommonModule`, it needs:

*   `NgModel` and friends in the `FormsModule` to enable two-way data binding
*   The `TitleCasePipe` from the `shared` folder
*   The Router services
*   The Hero data access services

One approach is to configure the testing module from the individual pieces as in this example:

<code-example header="app/hero/hero-detail.component.spec.ts (FormsModule setup)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-forms-module"></code-example>

<div class="alert is-helpful">

Notice that the `beforeEach()` is asynchronous and calls `TestBed.compileComponents` because the `HeroDetailComponent` has an external template and css file.

As explained in [Calling `compileComponents()`](#compile-components), these tests could be run in a non-CLI environment where Angular would have to compile them in the browser.

</div>

#### Import a shared module

Because many application components need the `FormsModule` and the `TitleCasePipe`, the developer created a `SharedModule` to combine these and other frequently requested parts.

The test configuration can use the `SharedModule` too as seen in this alternative setup:

<code-example header="app/hero/hero-detail.component.spec.ts (SharedModule setup)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-shared-module"></code-example>

It's a bit tighter and smaller, with fewer import statements, which are not shown in this example.

<a id="feature-module-import"></a>

#### Import a feature module

The `HeroDetailComponent` is part of the `HeroModule` [Feature Module](guide/feature-modules) that aggregates more of the interdependent pieces including the `SharedModule`.
Try a test configuration that imports the `HeroModule` like this one:

<code-example header="app/hero/hero-detail.component.spec.ts (HeroModule setup)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-hero-module"></code-example>

Only the *test doubles* in the `providers` remain.
Even the `HeroDetailComponent` declaration is gone.

In fact, if you try to declare it, Angular will throw an error because `HeroDetailComponent` is declared in both the `HeroModule` and the `DynamicTestModule` created by the `TestBed`.

<div class="alert is-helpful">

Importing the component's feature module can be the best way to configure tests when there are many mutual dependencies within the module and the module is small, as feature modules tend to be.

</div>

<a id="component-override"></a>

## Override component providers

The `HeroDetailComponent` provides its own `HeroDetailService`.

<code-example header="app/hero/hero-detail.component.ts (prototype)" path="testing/src/app/hero/hero-detail.component.ts" region="prototype"></code-example>

It's not possible to stub the component's `HeroDetailService` in the `providers` of the `TestBed.configureTestingModule`.
Those are providers for the *testing module*, not the component.
They prepare the dependency injector at the *fixture level*.

Angular creates the component with its *own* injector, which is a *child* of the fixture injector.
It registers the component's providers \(the `HeroDetailService` in this case\) with the child injector.

A test cannot get to child injector services from the fixture injector.
And `TestBed.configureTestingModule` can't configure them either.

Angular has created new instances of the real `HeroDetailService` all along!

<div class="alert is-helpful">

These tests could fail or timeout if the `HeroDetailService` made its own XHR calls to a remote server.
There might not be a remote server to call.

Fortunately, the `HeroDetailService` delegates responsibility for remote data access to an injected `HeroService`.

<code-example header="app/hero/hero-detail.service.ts (prototype)" path="testing/src/app/hero/hero-detail.service.ts" region="prototype"></code-example>

The [previous test configuration](#feature-module-import) replaces the real `HeroService` with a `TestHeroService` that intercepts server requests and fakes their responses.

</div>

What if you aren't so lucky.
What if faking the `HeroService` is hard?
What if `HeroDetailService` makes its own server requests?

The `TestBed.overrideComponent` method can replace the component's `providers` with easy-to-manage *test doubles* as seen in the following setup variation:

<code-example header="app/hero/hero-detail.component.spec.ts (Override setup)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override"></code-example>

Notice that `TestBed.configureTestingModule` no longer provides a fake `HeroService` because it's [not needed](#spy-stub).

<a id="override-component-method"></a>

#### The `overrideComponent` method

Focus on the `overrideComponent` method.

<code-example header="app/hero/hero-detail.component.spec.ts (overrideComponent)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-component-method"></code-example>

It takes two arguments: the component type to override \(`HeroDetailComponent`\) and an override metadata object.
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
&hellip;

</code-example>

<a id="spy-stub"></a>

#### Provide a *spy stub* (`HeroDetailServiceSpy`)

This example completely replaces the component's `providers` array with a new array containing a `HeroDetailServiceSpy`.

The `HeroDetailServiceSpy` is a stubbed version of the real `HeroDetailService` that fakes all necessary features of that service.
It neither injects nor delegates to the lower level `HeroService` so there's no need to provide a test double for that.

The related `HeroDetailComponent` tests will assert that methods of the `HeroDetailService` were called by spying on the service methods.
Accordingly, the stub implements its methods as spies:

<code-example header="app/hero/hero-detail.component.spec.ts (HeroDetailServiceSpy)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="hds-spy"></code-example>

<a id="override-tests"></a>

#### The override tests

Now the tests can control the component's hero directly by manipulating the spy-stub's `testHero` and confirm that service methods were called.

<code-example header="app/hero/hero-detail.component.spec.ts (override tests)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests"></code-example>

<a id="more-overrides"></a>

#### More overrides

The `TestBed.overrideComponent` method can be called multiple times for the same or different components.
The `TestBed` offers similar `overrideDirective`, `overrideModule`, and `overridePipe` methods for digging into and replacing parts of these other classes.

Explore the options and combinations on your own.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
