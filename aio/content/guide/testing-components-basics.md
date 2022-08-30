# Basics of testing components

A component, unlike all other parts of an Angular application, combines an HTML template and a TypeScript class.
The component truly is the template and the class *working together*.
To adequately test a component, you should test that they work together as intended.

Such tests require creating the component's host element in the browser DOM, as Angular does, and investigating the component class's interaction with the DOM as described by its template.

The Angular `TestBed` facilitates this kind of testing as you'll see in the following sections.
But in many cases, *testing the component class alone*, without DOM involvement, can validate much of the component's behavior in a straightforward, more obvious way.

<div class="alert is-helpful">

If you'd like to experiment with the application that this guide describes, <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

<a id="component-class-testing"></a>

## Component class testing

Test a component class on its own as you would test a service class.

Component class testing should be kept very clean and simple.
It should test only a single unit.
At first glance, you should be able to understand what the test is testing.

Consider this `LightswitchComponent` which toggles a light on and off (represented by an on-screen message) when the user clicks the button.

<code-example header="app/demo/demo.ts (LightswitchComp)" path="testing/src/app/demo/demo.ts" region="LightswitchComp"></code-example>

You might decide only to test that the `clicked()` method toggles the light's *on/off* state and sets the message appropriately.

This component class has no dependencies.
To test these types of classes, follow the same steps as you would for a service that has no dependencies:

1.  Create a component using the new keyword.
1.  Poke at its API.
1.  Assert expectations on its public state.

<code-example header="app/demo/demo.spec.ts (Lightswitch tests)" path="testing/src/app/demo/demo.spec.ts" region="Lightswitch"></code-example>

Here is the `DashboardHeroComponent` from the *Tour of Heroes* tutorial.

<code-example header="app/dashboard/dashboard-hero.component.ts (component)" path="testing/src/app/dashboard/dashboard-hero.component.ts" region="class"></code-example>

It appears within the template of a parent component, which binds a *hero* to the `@Input` property and listens for an event raised through the *selected* `@Output` property.

You can test that the class code works without creating the `DashboardHeroComponent` or its parent component.

<code-example header="app/dashboard/dashboard-hero.component.spec.ts (class tests)" path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="class-only"></code-example>

When a component has dependencies, you might want to use the `TestBed` to both create the component and its dependencies.

The following `WelcomeComponent` depends on the `UserService` to know the name of the user to greet.

<code-example header="app/welcome/welcome.component.ts" path="testing/src/app/welcome/welcome.component.ts" region="class"></code-example>

You might start by creating a mock of the `UserService` that meets the minimum needs of this component.

<code-example header="app/welcome/welcome.component.spec.ts (MockUserService)" path="testing/src/app/welcome/welcome.component.spec.ts" region="mock-user-service"></code-example>

Then provide and inject *both the* **component** *and the service* in the `TestBed` configuration.

<code-example header="app/welcome/welcome.component.spec.ts (class-only setup)" path="testing/src/app/welcome/welcome.component.spec.ts" region="class-only-before-each"></code-example>

Then exercise the component class, remembering to call the [lifecycle hook methods](guide/lifecycle-hooks) as Angular does when running the application.

<code-example header="app/welcome/welcome.component.spec.ts (class-only tests)" path="testing/src/app/welcome/welcome.component.spec.ts" region="class-only-tests"></code-example>

## Component DOM testing

Testing the component *class* is as straightforward as [testing a service](guide/testing-services).

But a component is more than just its class.
A component interacts with the DOM and with other components.
The *class-only* tests can tell you about class behavior.
They cannot tell you if the component is going to render properly, respond to user input and gestures, or integrate with its parent and child components.

None of the preceding *class-only* tests can answer key questions about how the components actually behave on screen.

*   Is `Lightswitch.clicked()` bound to anything such that the user can invoke it?
*   Is the `Lightswitch.message` displayed?
*   Can the user actually select the hero displayed by `DashboardHeroComponent`?
*   Is the hero name displayed as expected \(such as uppercase\)?
*   Is the welcome message displayed by the template of `WelcomeComponent`?

These might not be troubling questions for the preceding simple components illustrated.
But many components have complex interactions with the DOM elements described in their templates, causing HTML to appear and disappear as the component state changes.

To answer these kinds of questions, you have to create the DOM elements associated with the components, you must examine the DOM to confirm that component state displays properly at the appropriate times, and you must simulate user interaction with the screen to determine whether those interactions cause the component to behave as expected.

To write these kinds of test, you'll use additional features of the `TestBed` as well as other testing helpers.

### CLI-generated tests

The CLI creates an initial test file for you by default when you ask it to generate a new component.

For example, the following CLI command generates a `BannerComponent` in the `app/banner` folder \(with inline template and styles\):

<code-example format="shell" language="shell">

ng generate component banner --inline-template --inline-style --module app

</code-example>

It also generates an initial test file for the component, `banner-external.component.spec.ts`, that looks like this:

<code-example header="app/banner/banner-external.component.spec.ts (initial)" path="testing/src/app/banner/banner-initial.component.spec.ts" region="v1"></code-example>

<div class="alert is-helpful">

Because `compileComponents` is asynchronous, it uses the [`waitForAsync`](api/core/testing/waitForAsync) utility function imported from `@angular/core/testing`.

Refer to the [waitForAsync](guide/testing-components-scenarios#waitForAsync) section for more details.

</div>

### Reduce the setup

Only the last three lines of this file actually test the component and all they do is assert that Angular can create the component.

The rest of the file is boilerplate setup code anticipating more advanced tests that *might* become necessary if the component evolves into something substantial.

You'll learn about these advanced test features in the following sections.
For now, you can radically reduce this test file to a more manageable size:

<code-example header="app/banner/banner-initial.component.spec.ts (minimal)" path="testing/src/app/banner/banner-initial.component.spec.ts" region="v2"></code-example>

In this example, the metadata object passed to `TestBed.configureTestingModule` simply declares `BannerComponent`, the component to test.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="configureTestingModule"></code-example>

<div class="alert is-helpful">

There's no need to declare or import anything else.
The default test module is pre-configured with something like the `BrowserModule` from `@angular/platform-browser`.

Later you'll call `TestBed.configureTestingModule()` with imports, providers, and more declarations to suit your testing needs.
Optional `override` methods can further fine-tune aspects of the configuration.

</div>

<a id="create-component"></a>

### `createComponent()`

After configuring `TestBed`, you call its `createComponent()` method.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="createComponent"></code-example>

`TestBed.createComponent()` creates an instance of the `BannerComponent`, adds a corresponding element to the test-runner DOM, and returns a [`ComponentFixture`](#component-fixture).

<div class="alert is-important">

Do not re-configure `TestBed` after calling `createComponent`.

The `createComponent` method freezes the current `TestBed` definition, closing it to further configuration.

You cannot call any more `TestBed` configuration methods, not `configureTestingModule()`, nor `get()`, nor any of the `override...` methods.
If you try, `TestBed` throws an error.

</div>

<a id="component-fixture"></a>

### `ComponentFixture`

The [ComponentFixture](api/core/testing/ComponentFixture) is a test harness for interacting with the created component and its corresponding element.

Access the component instance through the fixture and confirm it exists with a Jasmine expectation:

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="componentInstance"></code-example>

### `beforeEach()`

You will add more tests as this component evolves.
Rather than duplicate the `TestBed` configuration for each test, you refactor to pull the setup into a Jasmine `beforeEach()` and some supporting variables:

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="v3"></code-example>

Now add a test that gets the component's element from `fixture.nativeElement` and looks for the expected text.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-2"></code-example>

<a id="native-element"></a>

### `nativeElement`

The value of `ComponentFixture.nativeElement` has the `any` type.
Later you'll encounter the `DebugElement.nativeElement` and it too has the `any` type.

Angular can't know at compile time what kind of HTML element the `nativeElement` is or if it even is an HTML element.
The application might be running on a *non-browser platform*, such as the server or a [Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API), where the element might have a diminished API or not exist at all.

The tests in this guide are designed to run in a browser so a `nativeElement` value will always be an `HTMLElement` or one of its derived classes.

Knowing that it is an `HTMLElement` of some sort, use the standard HTML `querySelector` to dive deeper into the element tree.

Here's another test that calls `HTMLElement.querySelector` to get the paragraph element and look for the banner text:

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-3"></code-example>

<a id="debug-element"></a>

### `DebugElement`

The Angular *fixture* provides the component's element directly through the `fixture.nativeElement`.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="nativeElement"></code-example>

This is actually a convenience method, implemented as `fixture.debugElement.nativeElement`.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="debugElement-nativeElement"></code-example>

There's a good reason for this circuitous path to the element.

The properties of the `nativeElement` depend upon the runtime environment.
You could be running these tests on a *non-browser* platform that doesn't have a DOM or whose DOM-emulation doesn't support the full `HTMLElement` API.

Angular relies on the `DebugElement` abstraction to work safely across *all supported platforms*.
Instead of creating an HTML element tree, Angular creates a `DebugElement` tree that wraps the *native elements* for the runtime platform.
The `nativeElement` property unwraps the `DebugElement` and returns the platform-specific element object.

Because the sample tests for this guide are designed to run only in a browser, a `nativeElement` in these tests is always an `HTMLElement` whose familiar methods and properties you can explore within a test.

Here's the previous test, re-implemented with `fixture.debugElement.nativeElement`:

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-4"></code-example>

The `DebugElement` has other methods and properties that are useful in tests, as you'll see elsewhere in this guide.

You import the `DebugElement` symbol from the Angular core library.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="import-debug-element"></code-example>

<a id="by-css"></a>

### `By.css()`

Although the tests in this guide all run in the browser, some applications might run on a different platform at least some of the time.

For example, the component might render first on the server as part of a strategy to make the application launch faster on poorly connected devices.
The server-side renderer might not support the full HTML element API.
If it doesn't support `querySelector`, the previous test could fail.

The `DebugElement` offers query methods that work for all supported platforms.
These query methods take a *predicate* function that returns `true` when a node in the `DebugElement` tree matches the selection criteria.

You create a *predicate* with the help of a `By` class imported from a library for the runtime platform.
Here's the `By` import for the browser platform:

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="import-by"></code-example>

The following example re-implements the previous test with `DebugElement.query()` and the browser's `By.css` method.

<code-example path="testing/src/app/banner/banner-initial.component.spec.ts" region="v4-test-5"></code-example>

Some noteworthy observations:

*   The `By.css()` static method selects `DebugElement` nodes with a [standard CSS selector](https://developer.mozilla.org/docs/Web/Guide/CSS/Getting_started/Selectors 'CSS selectors').
*   The query returns a `DebugElement` for the paragraph.
*   You must unwrap that result to get the paragraph element.

When you're filtering by CSS selector and only testing properties of a browser's *native element*, the `By.css` approach might be overkill.

It's often more straightforward and clear to filter with a standard `HTMLElement` method such as `querySelector()` or `querySelectorAll()`.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
