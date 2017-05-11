@title
Testing

@intro
Techniques and practices for testing an Angular app.

@description



This guide offers tips and techniques for testing Angular applications.
Though this page includes some general testing principles and techniques,
the focus is on testing applications written with Angular.


{@a top}

<!--


# Contents

* [Live examples](guide/testing#live-examples "Live examples of the tests in this guide")
<br><br>
* [Introduction to Angular testing](guide/testing#testing-intro)

  * [Tools and technologies](guide/testing#tools-and-tech)
  * [Setup](guide/testing#setup)
  * [Isolated unit tests vs. the Angular testing utilities](guide/testing#isolated-v-testing-utilities)

* [The first karma test](guide/testing#1st-karma-test)

 * [Run with karma](guide/testing#run-karma)
 * [Test debugging](guide/testing#test-debugging)
 * [Try the live example](guide/testing#live-karma-example)

* [Test a component](guide/testing#simple-component-test)

  * [_TestBed_](guide/testing#testbed)
  * [_createComponent_](guide/testing#create-component)
  * [_ComponentFixture_, _DebugElement_, and _query(By.css)_](guide/testing#component-fixture)
  * [The tests](guide/testing#the-tests)
  * [_detectChanges_: Angular change detection within a test](guide/testing#detect-changes)
  * [Try the live example](guide/testing#try-example)
  * [Automatic change detection](guide/testing#auto-detect-changes)

* [Test a component with an external template](guide/testing#component-with-external-template)

  * [The first asynchronous _beforeEach_](guide/testing#async-in-before-each)
  * [_compileComponents_](guide/testing#compile-components)
  * [The second synchronous _beforeEach_](guide/testing#second-before-each)
  * [Waiting for _compileComponents_](guide/testing#waiting-compile-components)
  * [Try the live example](guide/testing#live-external-template-example)

* [Test a component with a service dependency](guide/testing#component-with-dependency)

  * [Provide service test doubles](guide/testing#service-test-doubles)
  * [Get injected services](guide/testing#get-injected-service)
  * [_TestBed.get_](guide/testing#testbed-get)
  * [Always get the service from an injector](guide/testing#service-from-injector)
  * [Final setup and tests](guide/testing#welcome-spec-setup)

* [Test a component with an async service](guide/testing#component-with-async-service)

  * [Spying on the real service](guide/testing#service-spy)
  * [Synchronous tests](guide/testing#sync-tests)
  * [The _async_ funciton in it](guide/testing#async)
  * [_whenStable_](guide/testing#when-stable)
  * [The _fakeAsync_ function](guide/testing#fake-async)
  * [The _tick_ function](guide/testing#tick)
  * [_jasmine.done_](guide/testing#jasmine-done)

* [Test a component with inputs and outputs](guide/testing#component-with-input-output)

  * [Test _DashboardHeroComponent_ stand-alone](guide/testing#dashboard-standalone)
  * [_triggerEventHandler_](guide/testing#trigger-event-handler)

* [Test a component inside a test host component](guide/testing#component-inside-test-host)

* [Test a routed component](guide/testing#routed-component)

  * [The _inject_ helper function](guide/testing#inject)
  * [Test a routed component with parameters](guide/testing#routed-component-w-param)
  * [Create an _Observable_ test double](guide/testing#stub-observable)
  * [Testing with the _Observable_ test double](guide/testing#tests-w-observable-double)

* [Use a _page_ object to simplify setup](guide/testing#page-object)
* [Set up with module imports](guide/testing#import-module)
* [Import the feature module](guide/testing#feature-module-import)
<br><br>
* [Override a component's providers](guide/testing#component-override)

  * [The _overrideComponent_ method](guide/testing#override-component-method)
  * [Provide a _spy-stub (HeroDetailServiceSpy)_](guide/testing#spy-stub)
  * [The override tests](guide/testing#override-tests)
  * [More overrides](guide/testing#more-overrides)

* [Test a _RouterOutlet_ component](guide/testing#router-outlet-component)

  * [Stubbing unneeded components](guide/testing#stub-component)
  * [Stubbing the _RouterLink_](guide/testing#router-link-stub)
  * [_By.directive_ and injected directives](guide/testing#by-directive)
  * [What good are these tests?](guide/testing#why-stubbed-routerlink-tests)

* ["Shallow component tests" with  *NO\_ERRORS\_SCHEMA*](guide/testing#shallow-component-test)
<br><br>
* [Test an attribute directive](guide/testing#attribute-directive)
<br><br>
* [Isolated unit tests](guide/testing#isolated-unit-tests "Unit testing without the Angular testing utilities")

  * [Services](guide/testing#isolated-service-tests)
  * [Services with dependencies](guide/testing#services-with-dependencies)
  * [Pipes](guide/testing#isolated-pipe-tests)
  * [Write Angular tests too](guide/testing#write-tests)
  * [Components](guide/testing#isolated-component-tests)

* [Angular testing utility APIs](guide/testing#atu-apis)

  * [_TestBed_ class summary](guide/testing#testbed-class-summary)
  * [The _ComponentFixture_](guide/testing#component-fixture-api-summary)
  * [_ComponentFixture_ properties](guide/testing#component-fixture-properties)
  * [The _ComponentFixture_ methods](guide/testing#component-fixture-methods)
  * [_DebugElement_](guide/testing#debug-element-details)

* [Test environment setup files](guide/testing#setup-files)

  * [npm packages](guide/testing#npm-packages)

* [FAQ: Frequently asked questions](guide/testing#faq "Frequently asked questions")

It’s a big agenda. Fortunately, you can learn a little bit at a time and put each lesson to use.

-->

## Live examples

This guide presents tests of a sample application that is much like the [_Tour of Heroes_ tutorial](tutorial).
The sample application and all tests in this guide are available as live examples for inspection, experiment, and download:

* <live-example plnkr="1st-specs" embedded-style>A spec to verify the test environment</live-example>.
* <live-example plnkr="banner-inline-specs" embedded-style>The first component spec with inline template</live-example>.
* <live-example plnkr="banner-specs" embedded-style>A component spec with external template</live-example>.
* <live-example name="setup" plnkr="quickstart-specs" embedded-style>The QuickStart seed's AppComponent spec</live-example>.
* <live-example embedded-style>The sample application to be tested</live-example>.
* <live-example plnkr="app-specs" embedded-style>All specs that test the sample application</live-example>.
* <live-example plnkr="bag-specs" embedded-style>A grab bag of additional specs</live-example>.<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a testing-intro}


## Introduction to Angular Testing

This page guides you through writing tests to explore
and confirm the behavior of the application. Testing
does the following:

1. Guards against changes that break existing code (“regressions”).

1. Clarifies what the code does both when used as intended and when faced with deviant conditions.

1. Reveals mistakes in design and implementation.
Tests shine a harsh light on the code from many angles.
When a part of the application seems hard to test, the root cause is often a design flaw,
something to cure now rather than later when it becomes expensive to fix.

<!-- TODO
:marked
### Learn more
Learn more about basic Jasmine testing here
[Resources TBD](guide/)
-->


{@a tools-and-tech}


### Tools and technologies

You can write and run Angular tests with a variety of tools and technologies.
This guide describes specific choices that are known to work well.


<table width="100%">

  <col width="20%">

  </col>

  <col width="80%">

  </col>

  <tr>

    <th>
      Technology
    </th>

    <th>
      Purpose
    </th>

  </tr>

  <tr style=top>

    <td style="vertical-align: top">
      Jasmine
    </td>

    <td>


      The [Jasmine test framework](http://jasmine.github.io/2.4/introduction.html)
      provides everything needed to write basic tests.
      It ships with an HTML test runner that executes tests in the browser.
    </td>

  </tr>

  <tr style=top>

    <td style="vertical-align: top">
      Angular testing utilities
    </td>

    <td>


      Angular testing utilities create a test environment
      for the Angular application code under test.
      Use them to condition and control parts of the application as they
      interact _within_ the Angular environment.
    </td>

  </tr>

  <tr style=top>

    <td style="vertical-align: top">
      Karma
    </td>

    <td>


      The [karma test runner](https://karma-runner.github.io/1.0/index.html)
      is ideal for writing and running unit tests while developing the application.
      It can be an integral part of the project's development and continuous integration processes.
      This guide describes how to set up and run tests with karma.
    </td>

  </tr>

  <tr style=top>

    <td style="vertical-align: top">
      Protractor
    </td>

    <td>


      Use protractor to write and run _end-to-end_ (e2e) tests.
      End-to-end tests explore the application _as users experience it_.
      In e2e testing, one process runs the real application
      and a second process runs protractor tests that simulate user behavior
      and assert that the application respond in the browser as expected.

    </td>

  </tr>

</table>



{@a setup}


### Setup

There are two fast paths to getting started with unit testing.
1. Start a new project following the instructions in [Setup](guide/setup "Setup").

1. Start a new project with the
<a href="https://github.com/angular/angular-cli/blob/master/README.md" title="Angular CLI">Angular CLI</a>.

Both approaches install npm packages, files, and scripts pre-configured for applications
built in their respective modalities.
Their artifacts and procedures differ slightly but their essentials are the same
and there are no differences in the test code.

In this guide, the application and its tests are based on the [setup instructions](guide/setup "Setup").
For a discussion of the unit testing setup files, [see below](guide/testing#setup-files).


{@a isolated-v-testing-utilities}


### Isolated unit tests vs. the Angular testing utilites

[Isolated unit tests](guide/testing#isolated-unit-tests "Unit testing without the Angular testing utilities")
examine an instance of a class all by itself without any dependence on Angular or any injected values.
The tester creates a test instance of the class with `new`, supplying test doubles for the constructor parameters as needed, and
then probes the test instance API surface.

*You should write isolated unit tests for pipes and services.*

You can test components in isolation as well.
However, isolated unit tests don't reveal how components interact with Angular.
In particular, they can't reveal how a component class interacts with its own template or with other components.

Such tests require the **Angular testing utilities**.
The  Angular testing utilities include the `TestBed` class and several helper functions from `@angular/core/testing`.
They are the main focus of this guide and you'll learn about them
when you write your [first component test](guide/testing#simple-component-test).
A comprehensive review of the Angular testing utilities appears [later in this guide](guide/testing#atu-apis).

But first you should write a dummy test to verify that your test environment is set up properly
and to lock in a few basic testing skills.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a 1st-karma-test}


## The first karma test

Start with a simple test to make sure that the setup works properly.

Create a new file called `1st.spec.ts` in the application root folder, `src/app/`


<div class="alert is-important">



Tests written in Jasmine are called _specs_ .
**The filename extension must be `.spec.ts`**,
the convention adhered to by  `karma.conf.js` and other tooling.


</div>



**Put spec files somewhere within the `src/app/` folder.**
The `karma.conf.js` tells karma to look for spec files there,
for reasons explained [below](guide/testing#q-spec-file-location).

Add the following code to `src/app/1st.spec.ts`.

<code-example path="testing/src/app/1st.spec.ts" title="src/app/1st.spec.ts" linenums="false">

</code-example>



{@a run-karma}


### Run with karma
Compile and run it in karma from the command line using the following command:

<code-example format="." language="bash">
  npm test
</code-example>



The command compiles the application and test code and starts karma.
Both processes watch pertinent files, write messages to the console, and re-run when they detect changes.

<div class="l-sub-section">



The documentation setup defines the `test` command in the `scripts` section of npm's `package.json`.
The Angular CLI has different commands to do the same thing. Adjust accordingly.

</div>



After a few moments, karma opens a browser and starts writing to the console.

<figure>
  <img src='generated/images/guide/testing/karma-browser.png' alt="Karma browser">
</figure>



Hide (don't close!) the browser and focus on the console output, which
should look something like this:


<code-example format="." language="bash">
  > npm test
  ...
  [0] 1:37:03 PM - Compilation complete. Watching for file changes.
  ...
  [1] Chrome 51.0.2704: Executed 0 of 0 SUCCESS
      Chrome 51.0.2704: Executed 1 of 1 SUCCESS
  SUCCESS (0.005 secs / 0.005 secs)

</code-example>



Both the compiler and karma continue to run. The compiler output is preceded by `[0]`;
the karma output by `[1]`.

Change the expectation from `true` to `false`.

The _compiler_ watcher detects the change and recompiles.


<code-example format="." language="bash">
  [0] 1:49:21 PM - File change detected. Starting incremental compilation...
  [0] 1:49:25 PM - Compilation complete. Watching for file changes.

</code-example>



The _karma_ watcher detects the change to the compilation output and re-runs the test.

<code-example format="." language="bash">
  [1] Chrome 51.0.2704 1st tests true is true FAILED
  [1] Expected false to equal true.
  [1] Chrome 51.0.2704: Executed 1 of 1 (1 FAILED) (0.005 secs / 0.005 secs)

</code-example>



It fails of course.

Restore the expectation from `false` back to `true`.
Both processes detect the change, re-run, and karma reports complete success.


<div class="alert is-helpful">



The console log can be quite long. Keep your eye on the last line.
When all is well, it reads `SUCCESS`.


</div>



{@a test-debugging}


### Test debugging

Debug specs in the browser in the same way that you debug an application.

  1. Reveal the karma browser window (hidden earlier).
  1. Click the **DEBUG** button; it opens a new browser tab and re-runs the tests.
  1. Open the browser's “Developer Tools” (`Ctrl-Shift-I` on windows; `Command-Option-I` in OSX).
  1. Pick the "sources" section.
  1. Open the `1st.spec.ts` test file (Control/Command-P, then start typing the name of the file).
  1. Set a breakpoint in the test.
  1. Refresh the browser, and it stops at the breakpoint.


<figure>
  <img src='generated/images/guide/testing/karma-1st-spec-debug.png' alt="Karma debugging">
</figure>



{@a live-karma-example}


### Try the live example

You can also try this test as a <live-example plnkr="1st-specs" title="First spec" embedded-style></live-example> in plunker.
All of the tests in this guide are available as [live examples](guide/testing#live-examples "Live examples of these tests").
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a simple-component-test}


## Test a component

An Angular component is the first thing most developers want to test.
The `BannerComponent` in `src/app/banner-inline.component.ts` is the simplest component in this application and
a good place to start.
It presents the application title at the top of the screen within an `<h1>` tag.

<code-example path="testing/src/app/banner-inline.component.ts" title="src/app/banner-inline.component.ts" linenums="false">

</code-example>



This version of the `BannerComponent` has an inline template and an interpolation binding.
The component is probably too simple to be worth testing in real life but
it's perfect for a first encounter with the Angular testing utilities.

The corresponding `src/app/banner-inline.component.spec.ts` sits in the same folder as the component,
for reasons explained in the [FAQ](guide/testing#faq) answer to
["Why put specs next to the things they test?"](guide/testing#q-spec-file-location).

Start with ES6 import statements to get access to symbols referenced in the spec.

<code-example path="testing/src/app/banner-inline.component.spec.ts" region="imports" title="src/app/banner-inline.component.spec.ts (imports)" linenums="false">

</code-example>



{@a configure-testing-module}


Here's the `describe` and the `beforeEach` that precedes the tests:

<code-example path="testing/src/app/banner-inline.component.spec.ts" region="setup" title="src/app/banner-inline.component.spec.ts (beforeEach)" linenums="false">

</code-example>



{@a testbed}


### _TestBed_

`TestBed` is the first and most important of the  Angular testing utilities.
It creates an Angular testing module&mdash;an `@NgModule` class&mdash;that
you configure with the `configureTestingModule` method to produce the module environment for the class you want to test.
In effect, you detach the tested component from its own application module
and re-attach it to a dynamically-constructed Angular test module
tailored specifically for this battery of tests.

The `configureTestingModule` method takes an `@NgModule`-like metadata object.
The metadata object can have most of the properties of a normal [Angular module](guide/ngmodule).

_This metadata object_ simply declares the component to test, `BannerComponent`.
The metadata lack `imports` because (a) the default testing module configuration already has what `BannerComponent` needs
and (b) `BannerComponent` doesn't interact with any other components.


Call `configureTestingModule` within a `beforeEach` so that
`TestBed` can reset itself to a base state before each test runs.

The base state includes a default testing module configuration consisting of the
declarables (components, directives, and pipes) and providers (some of them mocked)
that almost everyone needs.

<div class="l-sub-section">



The testing shims mentioned [later](guide/testing#testbed-methods) initialize the testing module configuration
to something like the `BrowserModule` from `@angular/platform-browser`.

</div>



This default configuration is merely a _foundation_ for testing an app.
Later you'll call `TestBed.configureTestingModule` with more metadata that define additional
imports, declarations, providers, and schemas to fit your application tests.
Optional `override` methods can fine-tune aspects of the configuration.


{@a create-component}


### _createComponent_

After configuring `TestBed`, you tell it to create an instance of the _component-under-test_.
In this example, `TestBed.createComponent` creates an instance of `BannerComponent` and
returns a [_component test fixture_](guide/testing#component-fixture).


<div class="alert is-important">



Do not re-configure `TestBed` after calling `createComponent`.


</div>



The `createComponent` method closes the current `TestBed` instance to further configuration.
You cannot call any more `TestBed` configuration methods, not `configureTestingModule`
nor any of the `override...` methods. If you try, `TestBed` throws an error.


{@a component-fixture}


### _ComponentFixture_, _DebugElement_, and _query(By.css)_

The `createComponent` method returns a **`ComponentFixture`**, a handle on the test environment surrounding the created component.
The fixture provides access to the component instance itself and
to the **`DebugElement`**, which is a handle on the component's DOM element.

The `title` property value is interpolated into the DOM within `<h1>` tags.
Use the fixture's `DebugElement` to `query` for the `<h1>` element by CSS selector.

The **`query`** method takes a predicate function and searches the fixture's entire DOM tree for the
_first_ element that satisfies the predicate.
The result is a _different_ `DebugElement`, one associated with the matching DOM element.

<div class="l-sub-section">



The `queryAll` method returns an array of _all_ `DebugElements` that satisfy the predicate.

A _predicate_ is a function that returns a boolean.
A query predicate receives a `DebugElement` and returns `true` if the element meets the selection criteria.


</div>



The **`By`** class is an Angular testing utility that produces useful predicates.
Its `By.css` static method produces a
<a href="https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors">standard CSS selector</a>
predicate that filters the same way as a jQuery selector.

Finally, the setup assigns the DOM element from the `DebugElement` **`nativeElement`** property to `el`.
The tests assert that `el` contains the expected title text.


{@a the-tests}


### The tests

Jasmine runs the `beforeEach` function before each of these tests

<code-example path="testing/src/app/banner-inline.component.spec.ts" region="tests" title="src/app/banner-inline.component.spec.ts (tests)" linenums="false">

</code-example>



These tests ask the `DebugElement` for the native HTML element to satisfy their expectations.


{@a detect-changes}


### _detectChanges_: Angular change detection within a test

Each test tells Angular when to perform change detection by calling `fixture.detectChanges()`.
The first test does so immediately, triggering data binding and propagation of the `title` property
to the DOM element.

The second test changes the component's `title` property _and only then_ calls `fixture.detectChanges()`;
the new value appears in the DOM element.

In production, change detection kicks in automatically
when Angular creates a component or the user enters a keystroke or
an asynchronous activity (e.g., AJAX) completes.

The `TestBed.createComponent` does _not_ trigger change detection.
The fixture does not automatically push the component's `title` property value into the data bound element,
a fact demonstrated in the following test:

<code-example path="testing/src/app/banner-inline.component.spec.ts" region="test-w-o-detect-changes" title="src/app/banner-inline.component.spec.ts (no detectChanges)" linenums="false">

</code-example>



This behavior (or lack of it) is intentional.
It gives the tester an opportunity to inspect or change the state of
the component _before Angular initiates data binding or calls lifecycle hooks_.


{@a try-example}


### Try the live example
Take a moment to explore this component spec as a <live-example plnkr="banner-inline-specs" title="Spec for component with inline template" embedded-style></live-example> and
lock in these fundamentals of component unit testing.


{@a auto-detect-changes}


### Automatic change detection

The `BannerComponent` tests frequently call `detectChanges`.
Some testers prefer that the Angular test environment run change detection automatically.

That's possible by configuring the `TestBed` with the `ComponentFixtureAutoDetect` provider.
First import it from the testing utility library:

<code-example path="testing/src/app/banner.component.detect-changes.spec.ts" region="import-ComponentFixtureAutoDetect" title="src/app/banner.component.detect-changes.spec.ts (import)" linenums="false">

</code-example>



Then add it to the `providers` array of the testing module configuration:

<code-example path="testing/src/app/banner.component.detect-changes.spec.ts" region="auto-detect" title="src/app/banner.component.detect-changes.spec.ts (AutoDetect)" linenums="false">

</code-example>



Here are three tests that illustrate how automatic change detection works.

<code-example path="testing/src/app/banner.component.detect-changes.spec.ts" region="auto-detect-tests" title="src/app/banner.component.detect-changes.spec.ts (AutoDetect Tests)" linenums="false">

</code-example>



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

<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a component-with-external-template}


## Test a component with an external template
The application's actual `BannerComponent` behaves the same as the version above but is implemented differently.
It has _external_ template and css files, specified in `templateUrl` and `styleUrls` properties.

<code-example path="testing/src/app/banner.component.ts" title="src/app/banner.component.ts" linenums="false">

</code-example>



That's a problem for the tests.
The `TestBed.createComponent` method is synchronous.
But the Angular template compiler must read the external files from the file system before it can create a component instance.
That's an asynchronous activity.
The previous setup for testing the inline component won't work for a component with an external template.



<div id='async-in-before-each'>

</div>



### The first asynchronous _beforeEach_

The test setup for `BannerComponent` must give the Angular template compiler time to read the files.
The logic in the `beforeEach` of the previous spec is split into two `beforeEach` calls.
The first `beforeEach` handles asynchronous compilation.


<code-example path="testing/src/app/banner.component.spec.ts" region="async-before-each" title="src/app/banner.component.spec.ts (first beforeEach)" linenums="false">

</code-example>



Notice the `async` function called as the argument to `beforeEach`.
The `async` function is one of the Angular testing utilities and
has to be imported.

<code-example path="testing/src/app/banner.component.detect-changes.spec.ts" region="import-async" title="src/app/banner.component.detect-changes.spec.ts" linenums="false">

</code-example>



It takes a parameterless function and _returns a function_
which becomes the true argument to the  `beforeEach`.

The body of the `async` argument looks much like the body of a synchronous `beforeEach`.
There is nothing obviously asynchronous about it.
For example, it doesn't return a promise and
there is no `done` function to call as there would be in standard Jasmine asynchronous tests.
Internally, `async` arranges for the body of the `beforeEach` to run in a special _async test zone_
that hides the mechanics of asynchronous execution.

All this is necessary in order to call the asynchronous `TestBed.compileComponents` method.


{@a compile-components}


### _compileComponents_
The `TestBed.configureTestingModule` method returns the `TestBed` class so you can chain
calls to other `TestBed` static methods such as `compileComponents`.

The `TestBed.compileComponents` method asynchronously compiles all the components configured in the testing module.
In this example, the `BannerComponent` is the only component to compile.
When `compileComponents` completes, the external templates and css files have been "inlined"
and `TestBed.createComponent` can create new instances of `BannerComponent` synchronously.

<div class="l-sub-section">



WebPack developers need not call `compileComponents` because it inlines templates and css
as part of the automated build process that precedes running the test.

</div>



In this example, `TestBed.compileComponents` only compiles the `BannerComponent`.
Tests later in the guide declare multiple components and
a few specs import entire application modules that hold yet more components.
Any of these components might have external templates and css files.
`TestBed.compileComponents` compiles all of the declared components asynchronously at one time.


<div class="alert is-important">



Do not configure the `TestBed` after calling `compileComponents`.
Make `compileComponents` the last step
before calling `TestBed.createComponent` to instantiate the _component-under-test_.

</div>



Calling `compileComponents` closes the current `TestBed` instance is further configuration.
You cannot call any more `TestBed` configuration methods, not `configureTestingModule`
nor any of the `override...` methods. The `TestBed` throws an error if you try.


{@a second-before-each}


### The second synchronous _beforeEach_
A _synchronous_ `beforeEach` containing the remaining setup steps follows the asynchronous `beforeEach`.


<code-example path="testing/src/app/banner.component.spec.ts" region="sync-before-each" title="src/app/banner.component.spec.ts (second beforeEach)" linenums="false">

</code-example>



These are the same steps as in the original `beforeEach`.
They include creating an instance of the `BannerComponent` and querying for the elements to inspect.

You can count on the test runner to wait for the first asynchronous `beforeEach` to finish before calling the second.


{@a waiting-compile-components}


### Waiting for _compileComponents_

The `compileComponents` method returns a promise so you can perform additional tasks _immediately after_ it finishes.
For example, you could move the synchronous code in the second `beforeEach`
into a `compileComponents().then(...)` callback and write only one `beforeEach`.

Most developers find that hard to read.
The two `beforeEach` calls are widely preferred.

{@a live-external-template-example}

### Try the live example

Take a moment to explore this component spec as a <live-example plnkr="banner-specs" title="Spec for component with external template" embedded-style></live-example>.


<div class="l-sub-section">



The [Quickstart seed](guide/setup) provides a similar test of its `AppComponent`
as you can see in _this_ <live-example name="setup" plnkr="quickstart-specs" title="QuickStart seed spec" embedded-style></live-example>.
It too calls `compileComponents` although it doesn't have to because the `AppComponent`'s template is inline.

There's no harm in it and you might call `compileComponents` anyway
in case you decide later to re-factor the template into a separate file.
The tests in this guide only call `compileComponents` when necessary.


</div>

<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a component-with-dependency}


## Test a component with a dependency
Components often have service dependencies.

The `WelcomeComponent` displays a welcome message to the logged in user.
It knows who the user is based on a property of the injected `UserService`:

<code-example path="testing/src/app/welcome.component.ts" title="src/app/welcome.component.ts" linenums="false">

</code-example>



The `WelcomeComponent` has decision logic that interacts with the service, logic that makes this component worth testing.
Here's the testing module configuration for the spec file, `src/app/welcome.component.spec.ts`:

<code-example path="testing/src/app/welcome.component.spec.ts" region="config-test-module" title="src/app/welcome.component.spec.ts" linenums="false">

</code-example>



This time, in addition to declaring the _component-under-test_,
the configuration adds a `UserService` provider to the `providers` list.
But not the real `UserService`.


{@a service-test-doubles}


### Provide service test doubles

A _component-under-test_ doesn't have to be injected with real services.
In fact, it is usually better if they are test doubles (stubs, fakes, spies, or mocks).
The purpose of the spec is to test the component, not the service,
and real services can be trouble.

Injecting the real `UserService` could be a nightmare.
The real service might ask the user for login credentials and
attempt to reach an authentication server.
These behaviors can be hard to intercept.
It is far easier and safer to create and register a test double in place of the real `UserService`.

This particular test suite supplies a minimal `UserService` stub that satisfies the needs of the `WelcomeComponent`
and its tests:

<code-example path="testing/src/app/welcome.component.spec.ts" region="user-service-stub" title="src/app/welcome.component.spec.ts" linenums="false">

</code-example>



{@a get-injected-service}


### Get injected services
The tests need access to the (stub) `UserService` injected into the `WelcomeComponent`.

Angular has a hierarchical injection system.
There can be injectors at multiple levels, from the root injector created by the `TestBed`
down through the component tree.

The safest way to get the injected service, the way that **_always works_**,
is to **get it from the injector of the _component-under-test_**.
The component injector is a property of the fixture's `DebugElement`.

<code-example path="testing/src/app/welcome.component.spec.ts" region="injected-service" title="WelcomeComponent's injector" linenums="false">

</code-example>



{@a testbed-get}


### _TestBed.get_

You _may_ also be able to get the service from the root injector via `TestBed.get`.
This is easier to remember and less verbose.
But it only works when Angular injects the component with the service instance in the test's root injector.
Fortunately, in this test suite, the _only_ provider of `UserService` is the root testing module,
so it is safe to call `TestBed.get` as follows:

<code-example path="testing/src/app/welcome.component.spec.ts" region="inject-from-testbed" title="TestBed injector" linenums="false">

</code-example>



<div class="l-sub-section">



The [`inject`](guide/testing#inject)  utility function is another way to get one or more services from the test root injector.

For a use case in which `inject` and `TestBed.get` do not work,
see the section [_Override a component's providers_](guide/testing#component-override), which
explains why you must get the service from the component's injector instead.


</div>



{@a service-from-injector}


### Always get the service from an injector
Do _not_ reference the `userServiceStub` object
that's provided to the testing module in the body of your test.
**It does not work!**
The `userService` instance injected into the component is a completely _different_ object,
a clone of the provided `userServiceStub`.

<code-example path="testing/src/app/welcome.component.spec.ts" region="stub-not-injected" title="src/app/welcome.component.spec.ts" linenums="false">

</code-example>



{@a welcome-spec-setup}


### Final setup and tests
Here's the complete `beforeEach` using `TestBed.get`:

<code-example path="testing/src/app/welcome.component.spec.ts" region="setup" title="src/app/welcome.component.spec.ts" linenums="false">

</code-example>



And here are some tests:

<code-example path="testing/src/app/welcome.component.spec.ts" region="tests" title="src/app/welcome.component.spec.ts" linenums="false">

</code-example>



The first is a sanity test; it confirms that the stubbed `UserService` is called and working.

<div class="l-sub-section">



The second parameter to the Jasmine matcher (e.g., `'expected name'`) is an optional addendum.
If the expectation fails, Jasmine displays this addendum after the expectation failure message.
In a spec with multiple expectations, it can help clarify what went wrong and which expectation failed.


</div>



The remaining tests confirm the logic of the component when the service returns different values.
The second test validates the effect of changing the user name.
The third test checks that the component displays the proper message when there is no logged-in user.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a component-with-async-service}


## Test a component with an async service
Many services return values asynchronously.
Most data services make an HTTP request to a remote server and the response is necessarily asynchronous.

The "About" view in this sample displays Mark Twain quotes.
The `TwainComponent` handles the display, delegating the server request to the `TwainService`.

Both are in the `src/app/shared` folder because the author intends to display Twain quotes on other pages someday.
Here is the `TwainComponent`.

<code-example path="testing/src/app/shared/twain.component.ts" region="component" title="src/app/shared/twain.component.ts" linenums="false">

</code-example>



The `TwainService` implementation is irrelevant for this particular test.
It is sufficient to see within `ngOnInit` that `twainService.getQuote` returns a promise, which means it is asynchronous.

In general, tests should not make calls to remote servers.
They should emulate such calls. The setup in this `src/app/shared/twain.component.spec.ts` shows one way to do that:

<code-example path="testing/src/app/shared/twain.component.spec.ts" region="setup" title="src/app/shared/twain.component.spec.ts (setup)" linenums="false">

</code-example>



{@a service-spy}


### Spying on the real service

This setup is similar to the [`welcome.component.spec` setup](guide/testing#welcome-spec-setup).
But instead of creating a stubbed service object, it injects the _real_ service (see the testing module `providers`) and
replaces the critical `getQuote` method with a Jasmine spy.

<code-example path="testing/src/app/shared/twain.component.spec.ts" region="spy" title="src/app/shared/twain.component.spec.ts" linenums="false">

</code-example>



The spy is designed such that any call to `getQuote` receives an immediately resolved promise with a test quote.
The spy bypasses the actual `getQuote` method and therefore does not contact the server.


<div class="l-sub-section">



Faking a service instance and spying on the real service are _both_ great options.
Pick the one that seems easiest for the current test suite.
Don't be afraid to change your mind.

Spying on the real service isn't always easy, especially when the real service has injected dependencies.
You can _stub and spy_ at the same time, as shown in [an example below](guide/testing#spy-stub).


</div>



Here are the tests with commentary to follow:


<code-example path="testing/src/app/shared/twain.component.spec.ts" region="tests" title="src/app/shared/twain.component.spec.ts (tests)">

</code-example>



{@a sync-tests}


### Synchronous tests
The first two tests are synchronous.
Thanks to the spy, they verify that `getQuote` is called _after_
the first change detection cycle during which Angular calls `ngOnInit`.

Neither test can prove that a value from the service is displayed.
The quote itself has not arrived, despite the fact that the spy returns a resolved promise.

This test must wait at least one full turn of the JavaScript engine before the
value becomes available. The test must become _asynchronous_.


{@a async}


### The _async_ function in _it_

Notice the `async` in the third test.

<code-example path="testing/src/app/shared/twain.component.spec.ts" region="async-test" title="src/app/shared/twain.component.spec.ts (async test)" linenums="false">

</code-example>



The `async` function is one of the Angular testing utilities.
It simplifies coding of asynchronous tests by arranging for the tester's code to run in a special _async test zone_
as [discussed earlier](guide/testing#async-in-before-each) when it was called in a `beforeEach`.

Although `async` does a great job of hiding asynchronous boilerplate,
some functions called within a test (such as `fixture.whenStable`) continue to reveal their asynchronous behavior.

<div class="l-sub-section">



The `fakeAsync` alternative, [covered below](guide/testing#fake-async), removes this artifact and affords a more linear coding experience.


</div>



{@a when-stable}


### _whenStable_
The test must wait for the `getQuote` promise to resolve in the next turn of the JavaScript engine.

This test has no direct access to the promise returned by the call to `twainService.getQuote`
because it is buried inside `TwainComponent.ngOnInit` and therefore inaccessible to a test that
probes only the component API surface.

Fortunately, the `getQuote` promise is accessible to the _async test zone_,
which intercepts all promises issued within the _async_ method call _no matter where they occur_.

The `ComponentFixture.whenStable` method returns its own promise, which
resolves when the `getQuote` promise finishes.
In fact, the _whenStable_ promise resolves when _all pending
asynchronous activities within this test_ complete&mdash;the definition of "stable."

Then the test resumes and kicks off another round of change detection (`fixture.detectChanges`),
which tells Angular to update the DOM with the quote.
The `getQuote` helper method extracts the display element text and the expectation confirms that the text matches the test quote.


{@a fakeAsync}


{@a fake-async}


### The _fakeAsync_ function

The fourth test verifies the same component behavior in a different way.

<code-example path="testing/src/app/shared/twain.component.spec.ts" region="fake-async-test" title="src/app/shared/twain.component.spec.ts (fakeAsync test)" linenums="false">

</code-example>



Notice that `fakeAsync` replaces `async` as the `it` argument.
The `fakeAsync` function is another of the Angular testing utilities.

Like [async](guide/testing#async), it _takes_ a parameterless function and _returns_ a function
that becomes the argument to the  Jasmine `it` call.

The `fakeAsync` function enables a linear coding style by running the test body in a special _fakeAsync test zone_.

The principle advantage of `fakeAsync` over `async` is that the test appears to be synchronous.
There is no `then(...)` to disrupt the visible flow of control.
The promise-returning `fixture.whenStable` is gone, replaced by `tick()`.


<div class="l-sub-section">



There _are_ limitations. For example, you cannot make an XHR call from within a `fakeAsync`.


</div>



{@a tick}


### The _tick_ function
The `tick` function is one of the Angular testing utilities and a companion to `fakeAsync`.
You can only call it within a `fakeAsync` body.

Calling `tick()` simulates the passage of time until all pending asynchronous activities finish,
including the resolution of the `getQuote` promise in this test case.

It returns nothing. There is no promise to wait for.
Proceed with the same test code that appeared in the `whenStable.then()` callback.

Even this simple example is easier to read than the third test.
To more fully appreciate the improvement, imagine a succession of asynchronous operations,
chained in a long sequence of promise callbacks.


{@a jasmine-done}


### _jasmine.done_
While the `async` and `fakeAsync` functions greatly
simplify Angular asynchronous testing,
you can still fall back to the traditional Jasmine asynchronous testing technique.

You can still pass `it` a function that takes a
[`done` callback](http://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support).
Now you are responsible for chaining promises, handling errors, and calling `done` at the appropriate moment.

Here is a `done` version of the previous two tests:

<code-example path="testing/src/app/shared/twain.component.spec.ts" region="done-test" title="src/app/shared/twain.component.spec.ts (done test)" linenums="false">

</code-example>



Although there is no direct access to the `getQuote` promise inside `TwainComponent`,
the spy has direct access, which makes it possible to wait for `getQuote` to finish.

Writing test functions with `done`, while more cumbersome than `async`
and `fakeAsync`, is a viable and occasionally necessary technique.
For example, you can't call `async` or `fakeAsync` when testing
code that involves the `intervalTimer`, as is common when
testing async `Observable` methods.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a component-with-input-output}


## Test a component with inputs and outputs
A component with inputs and outputs typically appears inside the view template of a host component.
The host uses a property binding to set the input property and an event binding to
listen to events raised by the output property.

The testing goal is to verify that such bindings work as expected.
The tests should set input values and listen for output events.

The `DashboardHeroComponent` is a tiny example of a component in this role.
It displays an individual hero provided by the `DashboardComponent`.
Clicking that hero tells the `DashboardComponent` that the user has selected the hero.

The `DashboardHeroComponent` is embedded in the `DashboardComponent` template like this:

<code-example path="testing/src/app/dashboard/dashboard.component.html" region="dashboard-hero" title="src/app/dashboard/dashboard.component.html (excerpt)" linenums="false">

</code-example>



The `DashboardHeroComponent` appears in an `*ngFor` repeater, which sets each component's `hero` input property
to the looping value and listens for the component's `selected` event.

Here's the component's definition:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.ts" region="component" title="src/app/dashboard/dashboard-hero.component.ts (component)" linenums="false">

</code-example>



While testing a component this simple has little intrinsic value, it's worth knowing how.
You can use one of these approaches:

* Test it as used by `DashboardComponent`.
* Test it as a stand-alone component.
* Test it as used by a substitute for `DashboardComponent`.

A quick look at the `DashboardComponent` constructor discourages the first approach:

<code-example path="testing/src/app/dashboard/dashboard.component.ts" region="ctor" title="src/app/dashboard/dashboard.component.ts (constructor)" linenums="false">

</code-example>



The `DashboardComponent` depends on the Angular router and the `HeroService`.
You'd probably have to replace them both with test doubles, which is a lot of work.
The router seems particularly challenging.

<div class="l-sub-section">



The [discussion below](guide/testing#routed-component) covers testing components that require the router.

</div>



The immediate goal is to test the `DashboardHeroComponent`, not the `DashboardComponent`,
so, try the second and third options.


{@a dashboard-standalone}


### Test _DashboardHeroComponent_ stand-alone


Here's the spec file setup.

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="setup" title="src/app/dashboard/dashboard-hero.component.spec.ts (setup)" linenums="false">

</code-example>



The async `beforeEach` was discussed [above](guide/testing#component-with-external-template).
Having compiled the components asynchronously with `compileComponents`, the rest of the setup
proceeds _synchronously_ in a _second_ `beforeEach`, using the basic techniques described [earlier](guide/testing#simple-component-test).

Note how the setup code assigns a test hero (`expectedHero`) to the component's `hero` property, emulating
the way the `DashboardComponent` would set it via the property binding in its repeater.

The first test follows:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="name-test" title="src/app/dashboard/dashboard-hero.component.spec.ts (name test)" linenums="false">

</code-example>



It verifies that the hero name is propagated to template with a binding.
Because the template passes the hero name through the Angular `UpperCasePipe`,
the test must match the element value with the uppercased name:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.html" title="src/app/dashboard/dashboard-hero.component.html" linenums="false">

</code-example>





<div class="alert is-helpful">



This small test demonstrates how Angular tests can verify a component's visual
representation&mdash;something not possible with
[isolated unit tests](guide/testing#isolated-component-tests)&mdash;at
low cost and without resorting to much slower and more complicated end-to-end tests.


</div>



The second test verifies click behavior. Clicking the hero should raise a `selected` event that the
host component (`DashboardComponent` presumably) can hear:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test" title="src/app/dashboard/dashboard-hero.component.spec.ts (click test)" linenums="false">

</code-example>



The component exposes an `EventEmitter` property. The test subscribes to it just as the host component would do.

The `heroEl` is a `DebugElement` that represents the hero `<div>`.
The test calls `triggerEventHandler` with the "click" event name.
The "click" event binding responds by calling `DashboardHeroComponent.click()`.

If the component behaves as expected, `click()` tells the component's `selected` property to emit the `hero` object,
the test detects that value through its subscription to `selected`, and the test should pass.


{@a trigger-event-handler}


### _triggerEventHandler_

The Angular `DebugElement.triggerEventHandler` can raise _any data-bound event_ by its _event name_.
The second parameter is the event object passed to the handler.

In this example, the test triggers a "click" event with a null event object.


<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="trigger-event-handler" title="src/app/dashboard/dashboard-hero.component.spec.ts" linenums="false">

</code-example>



The test assumes (correctly in this case) that the runtime
event handler&mdash;the component's `click()` method&mdash;doesn't
care about the event object.

Other handlers are less forgiving. For example, the `RouterLink`
directive expects an object with a `button` property
that identifies which mouse button was pressed.
This directive throws an error if the event object doesn't do this correctly.


{@a click-helper}


Clicking a button, an anchor, or an arbitrary HTML element is a common test task.

Make that easy by encapsulating the _click-triggering_ process in a helper such as the `click` function below:

<code-example path="testing/src/testing/index.ts" region="click-event" title="testing/index.ts (click helper)" linenums="false">

</code-example>



The first parameter is the _element-to-click_. If you wish, you can pass a
custom event object as the second parameter. The default is a (partial)
<a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button">left-button mouse event object</a>
accepted by many handlers including the `RouterLink` directive.


<div class="callout is-critical">



<header>
  click() is not an Angular testing utility
</header>



The `click()` helper function is **not** one of the Angular testing utilities.
It's a function defined in _this guide's sample code_.
All of the sample tests use it.
If you like it, add it to your own collection of helpers.

</div>



Here's the previous test, rewritten using this click helper.

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="click-test-2" title="src/app/dashboard/dashboard-hero.component.spec.ts (click test revised)" linenums="false">

</code-example>



<hr/>



{@a component-inside-test-host}


## Test a component inside a test host component

In the previous approach, the tests themselves played the role of the host `DashboardComponent`.
But does the `DashboardHeroComponent` work correctly when properly data-bound to a host component?

Testing with the actual `DashboardComponent` host is doable but seems more trouble than its worth.
It's easier to emulate the `DashboardComponent` host with a _test host_ like this one:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host" title="src/app/dashboard/dashboard-hero.component.spec.ts (test host)" linenums="false">

</code-example>



The test host binds to `DashboardHeroComponent` as the `DashboardComponent` would but without
the distraction of the `Router`, the `HeroService`, or even the `*ngFor` repeater.

The test host sets the component's `hero` input property with its test hero.
It binds the component's `selected` event with its `onSelected` handler,
which records the emitted hero
in its `selectedHero` property. Later, the tests check that property to verify that the
`DashboardHeroComponent.selected` event emitted the right hero.

The setup for the test-host tests is similar to the setup for the stand-alone tests:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup" title="src/app/dashboard/dashboard-hero.component.spec.ts (test host setup)" linenums="false">

</code-example>



This testing module configuration shows two important differences:

1. It _declares_ both the `DashboardHeroComponent` and the `TestHostComponent`.
1. It _creates_ the `TestHostComponent` instead of the `DashboardHeroComponent`.

The `createComponent` returns a `fixture` that holds an instance of `TestHostComponent` instead of an instance of `DashboardHeroComponent`.

Creating the `TestHostComponent` has the side-effect of creating a `DashboardHeroComponent`
because the latter appears within the template of the former.
The query for the hero element (`heroEl`) still finds it in the test DOM,
albeit at greater depth in the element tree than before.

The tests themselves are almost identical to the stand-alone version:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-tests" title="src/app/dashboard/dashboard-hero.component.spec.ts (test-host)" linenums="false">

</code-example>



Only the selected event test differs. It confirms that the selected `DashboardHeroComponent` hero
really does find its way up through the event binding to the host component.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a routed-component}


## Test a routed component

Testing the actual `DashboardComponent` seemed daunting because it injects the `Router`.

<code-example path="testing/src/app/dashboard/dashboard.component.ts" region="ctor" title="src/app/dashboard/dashboard.component.ts (constructor)" linenums="false">

</code-example>



It also injects the `HeroService`, but faking that is a [familiar story](guide/testing#component-with-async-service).
The `Router` has a complicated API and is entwined with other services and application preconditions.

Fortunately, the `DashboardComponent` isn't doing much with the `Router`

<code-example path="testing/src/app/dashboard/dashboard.component.ts" region="goto-detail" title="src/app/dashboard/dashboard.component.ts (goToDetail)" linenums="false">

</code-example>



This is often the case.
As a rule you test the component, not the router,
and care only if the component navigates with the right address under the given conditions.
Stubbing the router with a test implementation is an easy option. This should do the trick:

<code-example path="testing/src/app/dashboard/dashboard.component.spec.ts" region="router-stub" title="src/app/dashboard/dashboard.component.spec.ts (Router Stub)" linenums="false">

</code-example>



Now set up the testing module with the test stubs for the `Router` and `HeroService`, and
create a test instance of the `DashboardComponent` for subsequent testing.

<code-example path="testing/src/app/dashboard/dashboard.component.spec.ts" region="compile-and-create-body" title="src/app/dashboard/dashboard.component.spec.ts (compile and create)" linenums="false">

</code-example>



The following test clicks the displayed hero and confirms (with the help of a spy) that `Router.navigateByUrl` is called with the expected url.

<code-example path="testing/src/app/dashboard/dashboard.component.spec.ts" region="navigate-test" title="src/app/dashboard/dashboard.component.spec.ts (navigate test)" linenums="false">

</code-example>



{@a inject}


### The _inject_ function

Notice the `inject` function in the second `it` argument.

<code-example path="testing/src/app/dashboard/dashboard.component.spec.ts" region="inject" title="src/app/dashboard/dashboard.component.spec.ts" linenums="false">

</code-example>



The `inject` function is one of the Angular testing utilities.
It injects services into the test function where you can alter, spy on, and manipulate them.

The `inject` function has two parameters:

1. An array of Angular dependency injection tokens.
1. A test function whose parameters correspond exactly to each item in the injection token array.


<div class="callout is-important">



<header>
  inject uses the TestBed Injector
</header>



The `inject` function uses the current `TestBed` injector and can only return services provided at that level.
It does not return services from component providers.


</div>



This example injects the `Router` from the current `TestBed` injector.
That's fine for this test because the `Router` is, and must be, provided by the application root injector.

If you need a service provided by the component's _own_ injector,  call `fixture.debugElement.injector.get` instead:

<code-example path="testing/src/app/welcome.component.spec.ts" region="injected-service" title="Component's injector" linenums="false">

</code-example>



<div class="alert is-important">



Use the component's own injector to get the service actually injected into the component.


</div>



The `inject` function closes the current `TestBed` instance to further configuration.
You cannot call any more `TestBed` configuration methods, not `configureTestingModule`
nor any of the `override...` methods. The `TestBed` throws an error if you try.


<div class="alert is-important">



Do not configure the `TestBed` after calling `inject`.


</div>



{@a routed-component-w-param}


### Test a routed component with parameters

Clicking a _Dashboard_ hero triggers navigation to `heroes/:id`, where `:id`
is a route parameter whose value is the `id` of the hero to edit.
That URL matches a route to the `HeroDetailComponent`.

The router pushes the `:id` token value into the `ActivatedRoute.params` _Observable_ property,
Angular injects the `ActivatedRoute` into the `HeroDetailComponent`,
and the component extracts the `id` so it can fetch the corresponding hero via the `HeroDetailService`.
Here's the `HeroDetailComponent` constructor:

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ctor" title="src/app/hero/hero-detail.component.ts (constructor)" linenums="false">

</code-example>



`HeroDetailComponent`  subscribes to `ActivatedRoute.params` changes in its `ngOnInit` method.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ng-on-init" title="src/app/hero/hero-detail.component.ts (ngOnInit)" linenums="false">

</code-example>



<div class="l-sub-section">



The expression after `route.params` chains an _Observable_ operator that _plucks_ the `id` from the `params`
and then chains a `forEach` operator to subscribe to `id`-changing events.
The `id` changes every time the user navigates to a different hero.

The `forEach` passes the new `id` value to the component's `getHero` method (not shown)
which fetches a hero and sets the component's `hero` property.
If the`id` parameter is missing, the `pluck` operator fails and the `catch` treats failure as a request to edit a new hero.

The [Router](guide/router#route-parameters) guide covers `ActivatedRoute.params` in more detail.

</div>



A test can explore how the `HeroDetailComponent` responds to different `id` parameter values
by manipulating the `ActivatedRoute` injected into the component's constructor.

By now you know how to stub the `Router` and a data service.
Stubbing the `ActivatedRoute` follows the same pattern except for a complication:
the `ActivatedRoute.params` is an _Observable_.


{@a stub-observable}


### Create an _Observable_ test double

The `hero-detail.component.spec.ts` relies on an `ActivatedRouteStub` to set `ActivatedRoute.params` values for each test.
This is a cross-application, re-usable _test helper class_.
Consider placing such helpers in a `testing` folder sibling to the `app` folder.
This sample keeps `ActivatedRouteStub` in `testing/router-stubs.ts`:


<code-example path="testing/src/testing/router-stubs.ts" region="activated-route-stub" title="testing/router-stubs.ts (ActivatedRouteStub)" linenums="false">

</code-example>



Notable features of this stub are:

* The stub implements only two of the `ActivatedRoute` capabilities: `params` and `snapshot.params`.

* <a href="https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/behaviorsubject.md">_BehaviorSubject_</a>
drives the stub's `params` _Observable_ and returns the same value to every `params` subscriber until it's given a new value.

* The `HeroDetailComponent` chains its expressions to this stub `params` _Observable_ which is now under the tester's control.

* Setting the `testParams` property causes the `subject` to push the assigned value into `params`.
 That triggers the `HeroDetailComponent` _params_ subscription, described above, in the same way that navigation does.

* Setting the `testParams` property also updates the stub's internal value for the `snapshot` property to return.

<div class="l-sub-section">



The [_snapshot_](guide/router#snapshot "Router guide: snapshot") is another popular way for components to consume route parameters.

</div>



<div class="callout is-helpful">



The router stubs in this guide are meant to inspire you. Create your own stubs to fit your testing needs.


</div>



{@a tests-w-observable-double}


### Testing with the _Observable_ test double
Here's a test demonstrating the component's behavior when the observed `id` refers to an existing hero:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-good-id" title="src/app/hero/hero-detail.component.spec.ts (existing id)" linenums="false">

</code-example>



<div class="l-sub-section">



The `createComponent` method and `page` object are discussed [in the next section](guide/testing#page-object).
Rely on your intuition for now.

</div>



When the `id` cannot be found, the component should re-route to the `HeroListComponent`.
The test suite setup provided the same `RouterStub` [described above](guide/testing#routed-component) which spies on the router without actually navigating.
This test supplies a "bad" id and expects the component to try to navigate.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-bad-id" title="src/app/hero/hero-detail.component.spec.ts (bad id)" linenums="false">

</code-example>





While this app doesn't have a route to the `HeroDetailComponent` that omits the `id` parameter, it might add such a route someday.
The component should do something reasonable when there is no `id`.

In this implementation, the component should create and display a new hero.
New heroes have `id=0` and a blank `name`. This test confirms that the component behaves as expected:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-no-id" title="src/app/hero/hero-detail.component.spec.ts (no id)" linenums="false">

</code-example>





<div class="callout is-helpful">



Inspect and download _all_ of the guide's application test code with this <live-example plnkr="app-specs" embedded-style>live example</live-example>.


</div>

<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a page-object}


## Use a _page_ object to simplify setup

The `HeroDetailComponent` is a simple view with a title, two hero fields, and two buttons.

<figure>
  <img src='generated/images/guide/testing/hero-detail.component.png' alt="HeroDetailComponent in action">
</figure>



But there's already plenty of template complexity.

<code-example path="testing/src/app/hero/hero-detail.component.html" title="src/app/hero/hero-detail.component.html" linenums="false">

</code-example>



To fully exercise the component, the test needs a lot of setup:

* It must wait until a hero arrives before `*ngIf` allows any element in DOM.
* It needs references to the title `<span>` and the name `<input>` so it can inspect their values.
* It needs references to the two buttons so it can click them.
* It needs spies for some of the component and router methods.

Even a small form such as this one can produce a mess of tortured conditional setup and CSS element selection.

Tame the madness with a `Page` class that simplifies access to component properties and encapsulates the logic that sets them.
Here's the `Page` class for the `hero-detail.component.spec.ts`

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="page" title="src/app/hero/hero-detail.component.spec.ts (Page)" linenums="false">

</code-example>



Now the important hooks for component manipulation and inspection are neatly organized and accessible from an instance of `Page`.


A `createComponent` method creates a `page` object and fills in the blanks once the `hero` arrives.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="create-component" title="src/app/hero/hero-detail.component.spec.ts (createComponent)" linenums="false">

</code-example>



The [observable tests](guide/testing#tests-w-observable-double) in the previous section demonstrate how `createComponent` and `page`
keep the tests short and _on message_.
There are no distractions: no waiting for promises to resolve and no searching the DOM for element values to compare.

Here are a few more `HeroDetailComponent` tests to drive the point home.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="selected-tests" title="src/app/hero/hero-detail.component.spec.ts (selected tests)" linenums="false">

</code-example>

<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a import-module}


## Setup with module imports
Earlier component tests configured the testing module with a few `declarations` like this:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="compile-components" title="src/app/dashboard/dashboard-hero.component.spec.ts (config)" linenums="false">

</code-example>



The `DashboardComponent` is simple. It needs no help.
But more complex components often depend on other components, directives, pipes, and providers
and these must be added to the testing module too.

Fortunately, the `TestBed.configureTestingModule` parameter parallels
the metadata passed to the `@NgModule` decorator
which means you can also specify `providers` and `imports`.

The `HeroDetailComponent` requires a lot of help despite its small size and simple construction.
In addition to the support it receives from the default testing module `CommonModule`, it needs:

* `NgModel` and friends in the `FormsModule` to enable two-way data binding.
* The `TitleCasePipe` from the `shared` folder.
* Router services (which these tests are stubbing).
* Hero data access services (also stubbed).


One approach is to configure the testing module from the individual pieces as in this example:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-forms-module" title="src/app/hero/hero-detail.component.spec.ts (FormsModule setup)" linenums="false">

</code-example>



Because many app components need the `FormsModule` and the `TitleCasePipe`, the developer created
a `SharedModule` to combine these and other frequently requested parts.
The test configuration can use the `SharedModule` too as seen in this alternative setup:


<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-shared-module" title="src/app/hero/hero-detail.component.spec.ts (SharedModule setup)" linenums="false">

</code-example>



It's a bit tighter and smaller, with fewer import statements (not shown).


{@a feature-module-import}


### Import the feature module

The `HeroDetailComponent` is part of the `HeroModule` [Feature Module](guide/ngmodule#feature-modules) that aggregates more of the interdependent pieces
including the `SharedModule`.
Try a test configuration that imports the `HeroModule` like this one:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-hero-module" title="src/app/hero/hero-detail.component.spec.ts (HeroModule setup)" linenums="false">

</code-example>



That's _really_ crisp. Only the _test doubles_ in the `providers` remain. Even the `HeroDetailComponent` declaration is gone.

<div class="l-sub-section">



In fact, if you try to declare it, Angular throws an error because
`HeroDetailComponent` is declared in both the `HeroModule` and the `DynamicTestModule` (the testing module).


</div>



<div class="alert is-helpful">



Importing the component's feature module is often the easiest way to configure the tests,
especially when the feature module is small and mostly self-contained, as feature modules should be.

</div>



<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a component-override}


## Override a component's providers

The `HeroDetailComponent` provides its own `HeroDetailService`.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="prototype" title="src/app/hero/hero-detail.component.ts (prototype)" linenums="false">

</code-example>



It's not possible to stub the component's `HeroDetailService` in the `providers` of the `TestBed.configureTestingModule`.
Those are providers for the _testing module_, not the component. They prepare the dependency injector at the _fixture level_.

Angular creates the component with its _own_ injector, which is a _child_ of the fixture injector.
It registers the component's providers (the `HeroDetailService` in this case) with the child injector.
A test cannot get to child injector services from the fixture injector.
And `TestBed.configureTestingModule` can't configure them either.

Angular has been creating new instances of the real `HeroDetailService` all along!


<div class="l-sub-section">



These tests could fail or timeout if the `HeroDetailService` made its own XHR calls to a remote server.
There might not be a remote server to call.

Fortunately, the `HeroDetailService` delegates responsibility for remote data access to an injected `HeroService`.


<code-example path="testing/src/app/hero/hero-detail.service.ts" region="prototype" title="src/app/hero/hero-detail.service.ts (prototype)" linenums="false">

</code-example>



The [previous test configuration](guide/testing#feature-module-import) replaces the real `HeroService` with a `FakeHeroService`
that intercepts server requests and fakes their responses.


</div>



What if you aren't so lucky. What if faking the `HeroService` is hard?
What if `HeroDetailService` makes its own server requests?

The `TestBed.overrideComponent` method can replace the component's `providers` with easy-to-manage _test doubles_
as seen in the following setup variation:


<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override" title="src/app/hero/hero-detail.component.spec.ts (Override setup)" linenums="false">

</code-example>



Notice that `TestBed.configureTestingModule` no longer provides a (fake) `HeroService` because it's [not needed](guide/testing#spy-stub).


{@a override-component-method}


### The _overrideComponent_ method

Focus on the `overrideComponent` method.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-component-method" title="src/app/hero/hero-detail.component.spec.ts (overrideComponent)" linenums="false">

</code-example>



It takes two arguments: the component type to override (`HeroDetailComponent`) and an override metadata object.
The [overide metadata object](guide/testing#metadata-override-object) is a generic defined as follows:


<code-example format="." language="javascript">
  type MetadataOverride<T> = {
    add?: T;
    remove?: T;
    set?: T;
  };
</code-example>



A metadata override object can either add-and-remove elements in metadata properties or completely reset those properties.
This example resets the component's `providers` metadata.

The type parameter, `T`,  is the kind of metadata you'd pass to the `@Component` decorator:

<code-example format="." language="javascript">
  selector?: string;
  template?: string;
  templateUrl?: string;
  providers?: any[];
  ...

</code-example>



{@a spy-stub}


### Provide a _spy stub_ (_HeroDetailServiceSpy_)

This example completely replaces the component's `providers` array with a new array containing a `HeroDetailServiceSpy`.

The `HeroDetailServiceSpy` is a stubbed version of the real `HeroDetailService`
that fakes all necessary features of that service.
It neither injects nor delegates to the lower level `HeroService`
so there's no need to provide a test double for that.

The related `HeroDetailComponent` tests will assert that methods of the `HeroDetailService`
were called by spying on the service methods.
Accordingly, the stub implements its methods as spies:


<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="hds-spy" title="src/app/hero/hero-detail.component.spec.ts (HeroDetailServiceSpy)" linenums="false">

</code-example>



{@a override-tests}


### The override tests

Now the tests can control the component's hero directly by manipulating the spy-stub's `testHero`
and confirm that service methods were called.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests" title="src/app/hero/hero-detail.component.spec.ts (override tests)" linenums="false">

</code-example>



{@a more-overrides}


### More overrides
The `TestBed.overrideComponent` method can be called multiple times for the same or different components.
The `TestBed` offers similar `overrideDirective`, `overrideModule`, and `overridePipe` methods
for digging into and replacing parts of these other classes.

Explore the options and combinations on your own.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a router-outlet-component}


## Test a _RouterOutlet_ component

The `AppComponent` displays routed components in a `<router-outlet>`.
It also displays a navigation bar with anchors and their `RouterLink` directives.

{@a app-component-html}


<code-example path="testing/src/app/app.component.html" title="src/app/app.component.html" linenums="false">

</code-example>



The component class does nothing.

<code-example path="testing/src/app/app.component.ts" title="src/app/app.component.ts" linenums="false">

</code-example>



Unit tests can confirm that the anchors are wired properly without engaging the router.
See why this is worth doing [below](guide/testing#why-stubbed-routerlink-tests).


{@a stub-component}


### Stubbing unneeded components

The test setup should look familiar.


<code-example path="testing/src/app/app.component.spec.ts" region="setup-stubs" title="src/app/app.component.spec.ts (Stub Setup)" linenums="false">

</code-example>



The `AppComponent` is the declared test subject.

The setup extends the default testing module with one real component (`BannerComponent`) and several stubs.

* `BannerComponent` is simple and harmless to use as is.

* The real `WelcomeComponent` has an injected service. `WelcomeStubComponent` is a placeholder with no service to worry about.

* The real `RouterOutlet` is complex and errors easily.
The `RouterOutletStubComponent` (in `testing/router-stubs.ts`) is safely inert.

The component stubs are essential.
Without them, the Angular compiler doesn't recognize the `<app-welcome>` and `<router-outlet>` tags
and throws an error.

{@a router-link-stub}


### Stubbing the _RouterLink_

The `RouterLinkStubDirective` contributes substantively to the test:


<code-example path="testing/src/testing/router-stubs.ts" region="router-link" title="testing/router-stubs.ts (RouterLinkStubDirective)" linenums="false">

</code-example>



The `host` metadata property wires the click event of the host element (the `<a>`) to the directive's `onClick` method.
The URL bound to the `[routerLink]` attribute flows to the directive's `linkParams` property.
Clicking the anchor should trigger the `onClick` method which sets the telltale `navigatedTo` property.
Tests can inspect that property to confirm the expected _click-to-navigation_ behavior.


{@a by-directive}


{@a inject-directive}


### _By.directive_ and injected directives

A little more setup triggers the initial data binding and gets references to the navigation links:

<code-example path="testing/src/app/app.component.spec.ts" region="test-setup" title="src/app/app.component.spec.ts (test setup)" linenums="false">

</code-example>



Two points of special interest:

1. You can locate elements _by directive_, using `By.directive`, not just by css selectors.

1. You can use the component's dependency injector to get an attached directive because
Angular always adds attached directives to the component's injector.


{@a app-component-tests}


Here are some tests that leverage this setup:

<code-example path="testing/src/app/app.component.spec.ts" region="tests" title="src/app/app.component.spec.ts (selected tests)" linenums="false">

</code-example>



<div class="l-sub-section">



The "click" test _in this example_ is worthless.
It works hard to appear useful when in fact it
tests the `RouterLinkStubDirective` rather than the _component_.
This is a common failing of directive stubs.

It has a legitimate purpose in this guide.
It demonstrates how to find a `RouterLink` element, click it, and inspect a result,
without engaging the full router machinery.
This is a skill you may need to test a more sophisticated component, one that changes the display,
re-calculates parameters, or re-arranges navigation options when the user clicks the link.


</div>



{@a why-stubbed-routerlink-tests}


### What good are these tests?

Stubbed `RouterLink` tests can confirm that a component with links and an outlet is setup properly,
that the component has the links it should have, and that they are all pointing in the expected direction.
These tests do not concern whether the app will succeed in navigating to the target component when the user clicks a link.

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

<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a shallow-component-test}


## "Shallow component tests" with *NO\_ERRORS\_SCHEMA*

The [previous setup](guide/testing#stub-component) declared the `BannerComponent` and stubbed two other components
for _no reason other than to avoid a compiler error_.

Without them, the Angular compiler doesn't recognize the `<app-banner>`, `<app-welcome>` and `<router-outlet>` tags
in the [_app.component.html_](guide/testing#app-component-html) template and throws an error.

Add `NO_ERRORS_SCHEMA` to the testing module's `schemas` metadata
to tell the compiler to ignore unrecognized elements and attributes.
You no longer have to declare irrelevant components and directives.

These tests are ***shallow*** because they only "go deep" into the components you want to test.

Here is a setup, with `import` statements, that demonstrates the improved simplicity of _shallow_ tests, relative to the stubbing setup.

<code-tabs>

  <code-pane title="src/app/app.component.spec.ts (NO_ERRORS_SCHEMA)" path="testing/src/app/app.component.spec.ts" region="setup-schemas">

  </code-pane>

  <code-pane title="src/app/app.component.spec.ts (Stubs)" path="testing/src/app/app.component.spec.ts" region="setup-stubs-w-imports">

  </code-pane>

</code-tabs>



The _only_ declarations are the _component-under-test_ (`AppComponent`) and the `RouterLinkStubDirective`
that contributes actively to the tests.
The [tests in this example](guide/testing#app-component-tests) are unchanged.


<div class="alert is-important">



_Shallow component tests_ with `NO_ERRORS_SCHEMA` greatly simplify unit testing of complex templates.
However, the compiler no longer alerts you to mistakes
such as misspelled or misused components and directives.


</div>

<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a attribute-directive}


## Test an attribute directive

An _attribute directive_ modifies the behavior of an element, component or another directive.
Its name reflects the way the directive is applied: as an attribute on a host element.

The sample application's `HighlightDirective` sets the background color of an element
based on either a data bound color or a default color (lightgray).
It also sets a custom property of the element (`customProperty`) to `true`
for no reason other than to show that it can.

<code-example path="testing/src/app/shared/highlight.directive.ts" title="src/app/shared/highlight.directive.ts" linenums="false">

</code-example>



It's used throughout the application, perhaps most simply in the `AboutComponent`:

<code-example path="testing/src/app/about.component.ts" title="src/app/about.component.ts" linenums="false">

</code-example>



Testing the specific use of the `HighlightDirective` within the `AboutComponent` requires only the
techniques explored above (in particular the ["Shallow test"](guide/testing#shallow-component-test) approach).

<code-example path="testing/src/app/about.component.spec.ts" region="tests" title="src/app/about.component.spec.ts" linenums="false">

</code-example>



However, testing a single use case is unlikely to explore the full range of a directive's capabilities.
Finding and testing all components that use the directive is tedious, brittle, and almost as unlikely to afford full coverage.

[Isolated unit tests](guide/testing#isolated-unit-tests) might be helpful,
but attribute directives like this one tend to manipulate the DOM.
Isolated unit tests don't touch the DOM and, therefore,
do not inspire confidence in the directive's efficacy.

A better solution is to create an artificial test component that demonstrates all ways to apply the directive.


<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="test-component" title="src/app/shared/highlight.directive.spec.ts (TestComponent)" linenums="false">

</code-example>



<figure>
  <img src='generated/images/guide/testing/highlight-directive-spec.png' alt="HighlightDirective spec in action">
</figure>



<div class="l-sub-section">



The `<input>` case binds the `HighlightDirective` to the name of a color value in the input box.
The initial value is the word "cyan" which should be the background color of the input box.

</div>



Here are some tests of this component:

<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="selected-tests" title="src/app/shared/highlight.directive.spec.ts (selected tests)">

</code-example>



A few techniques are noteworthy:

* The `By.directive` predicate is a great way to get the elements that have this directive _when their element types are unknown_.

* The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/:not">`:not` pseudo-class</a>
in `By.css('h2:not([highlight])')` helps find `<h2>` elements that _do not_ have the directive.
`By.css('*:not([highlight])')` finds _any_ element that does not have the directive.

* `DebugElement.styles` affords access to element styles even in the absence of a real browser, thanks to the `DebugElement` abstraction.
But feel free to exploit the `nativeElement` when that seems easier or more clear than the abstraction.

* Angular adds a directive to the injector of the element to which it is applied.
The test for the default color uses the injector of the second `<h2>` to get its `HighlightDirective` instance
and its `defaultColor`.

* `DebugElement.properties` affords access to the artificial custom property that is set by the directive.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a isolated-unit-tests}


## Isolated Unit Tests

Testing applications with the help of the Angular testing utilities is the main focus of this guide.

However, it's often more productive to explore the inner logic of application classes
with _isolated_  unit tests that don't depend upon Angular.
Such tests are often smaller and  easier to read, write, and maintain.

They don't carry extra baggage:

* Import from the Angular test libraries.
* Configure a module.
* Prepare dependency injection `providers`.
* Call `inject` or `async` or `fakeAsync`.

They follow patterns familiar to test developers everywhere:

* Exhibit standard, Angular-agnostic testing techniques.
* Create instances directly with `new`.
* Substitute test doubles (stubs, spys, and mocks) for the real dependencies.


<div class="callout is-important">



<header>
  Write both kinds of tests
</header>



Good developers write both kinds of tests for the same application part, often in the same spec file.
Write simple _isolated_ unit tests to validate the part in isolation.
Write _Angular_ tests to validate the part as it interacts with Angular,
updates the DOM, and collaborates with the rest of the application.


</div>



{@a isolated-service-tests}


### Services
Services are good candidates for isolated unit testing.
Here are some synchronous and asynchronous unit tests of the `FancyService`
written without assistance from Angular testing utilities.


<code-example path="testing/src/app/bag/bag.no-testbed.spec.ts" region="FancyService" title="src/app/bag/bag.no-testbed.spec.ts">

</code-example>



A rough line count suggests that these isolated unit tests are about 25% smaller than equivalent Angular tests.
That's telling but not decisive.
The benefit comes from reduced setup and code complexity.

Compare these equivalent tests of `FancyService.getTimeoutValue`.

<code-tabs>

  <code-pane title="src/app/bag/bag.no-testbed.spec.ts (Isolated)" path="testing/src/app/bag/bag.no-testbed.spec.ts" region="getTimeoutValue">

  </code-pane>

  <code-pane title="src/app/bag/bag.spec.ts (with Angular testing utilities)" path="testing/src/app/bag/bag.spec.ts" region="getTimeoutValue">

  </code-pane>

</code-tabs>



They have about the same line-count, but the Angular-dependent version
has more moving parts including a couple of utility functions (`async` and `inject`).
Both approaches work and it's not much of an issue if you're using the
Angular testing utilities nearby for other reasons.
On the other hand, why burden simple service tests with added complexity?

Pick the approach that suits you.


{@a services-with-dependencies}


### Services with dependencies

Services often depend on other services that Angular injects into the constructor.
You can test these services _without_ the `TestBed`.
In many cases, it's easier to create and _inject_ dependencies by hand.

The `DependentService` is a simple example:

<code-example path="testing/src/app/bag/bag.ts" region="DependentService" title="src/app/bag/bag.ts" linenums="false">

</code-example>



It delegates its only method, `getValue`, to the injected `FancyService`.

Here are several ways to test it.

<code-example path="testing/src/app/bag/bag.no-testbed.spec.ts" region="DependentService" title="src/app/bag/bag.no-testbed.spec.ts">

</code-example>



The first test creates a `FancyService` with `new` and passes it to the `DependentService` constructor.

However, it's rarely that simple. The injected service can be difficult to create or control.
You can mock the dependency, use a dummy value, or stub the pertinent service method
with a substitute method that's easy to control.

These _isolated_ unit testing techniques are great for exploring the inner logic of a service or its
simple integration with a component class.
Use the Angular testing utilities when writing tests that validate how a service interacts with components
_within the Angular runtime environment_.


{@a isolated-pipe-tests}


### Pipes
Pipes are easy to test without the Angular testing utilities.

A pipe class has one method, `transform`, that manipulates the input
value into a transformed output value.
The `transform` implementation rarely interacts with the DOM.
Most pipes have no dependence on Angular other than the `@Pipe`
metadata and an interface.

Consider a `TitleCasePipe` that capitalizes the first letter of each word.
Here's a naive implementation with a regular expression.

<code-example path="testing/src/app/shared/title-case.pipe.ts" title="src/app/shared/title-case.pipe.ts" linenums="false">

</code-example>



Anything that uses a regular expression is worth testing thoroughly.
Use simple Jasmine to explore the expected cases and the edge cases.


<code-example path="testing/src/app/shared/title-case.pipe.spec.ts" region="excerpt" title="src/app/shared/title-case.pipe.spec.ts">

</code-example>



{@a write-tests}


### Write Angular tests too
These are tests of the pipe _in isolation_.
They can't tell if the `TitleCasePipe` is working properly as applied in the application components.

Consider adding component tests such as this one:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" title="src/app/hero/hero-detail.component.spec.ts (pipe test)">

</code-example>



{@a isolated-component-tests}


### Components

Component tests typically examine how a component class interacts with its own template or with collaborating components.
The Angular testing utilities are specifically designed to facilitate such tests.

Consider this `ButtonComp` component.

<code-example path="testing/src/app/bag/bag.ts" region="ButtonComp" title="src/app/bag/bag.ts (ButtonComp)" linenums="false">

</code-example>



The following Angular test demonstrates that clicking a button in the template leads
to an update of the on-screen message.

<code-example path="testing/src/app/bag/bag.spec.ts" region="ButtonComp" title="src/app/bag/bag.spec.ts (ButtonComp)" linenums="false">

</code-example>



The assertions verify that the data values flow from one HTML control (the `<button>`) to the component and
from the component back to a _different_ HTML control (the `<span>`).
A passing test means the component and its template are wired correctly.

Isolated unit tests can more rapidly probe a component at its API boundary,
exploring many more conditions with less effort.

Here are a set of unit tests that verify the component's outputs in the face of a variety of
component inputs.

<code-example path="testing/src/app/bag/bag.no-testbed.spec.ts" region="ButtonComp" title="src/app/bag/bag.no-testbed.spec.ts (ButtonComp)" linenums="false">

</code-example>



Isolated component tests offer a lot of test coverage with less code and almost no setup.
This is even more of an advantage with complex components, which
may require meticulous preparation with the Angular testing utilities.

On the other hand, isolated unit tests can't confirm that the `ButtonComp` is
properly bound to its template or even data bound at all.
Use Angular tests for that.
<a href="#top" class='to-top'>Back to top</a>

<hr/>



{@a atu-apis}


## Angular testing utility APIs

This section takes inventory of the most useful Angular testing features and summarizes what they do.

The Angular testing utilities include the `TestBed`, the `ComponentFixture`, and a handful of functions that control the test environment.
The [_TestBed_](guide/testing#testbed-api-summary) and [_ComponentFixture_](guide/testing#component-fixture-api-summary) classes are covered separately.

Here's a summary of the stand-alone functions, in order of likely utility:


<table>

  <tr>

    <th>
      Function
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>async</code>
    </td>

    <td>


      Runs the body of a test (`it`) or setup (`beforeEach`) function within a special _async test zone_.
      See [discussion above](guide/testing#async).
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>fakeAsync</code>
    </td>

    <td>


      Runs the body of a test (`it`) within a special _fakeAsync test zone_, enabling
      a linear control flow coding style. See [discussion above](guide/testing#fake-async).
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>tick</code>
    </td>

    <td>


      Simulates the passage of time and the completion of pending asynchronous activities
      by flushing both _timer_ and _micro-task_ queues within the _fakeAsync test zone_.


<div class="l-sub-section">



      The curious, dedicated reader might enjoy this lengthy blog post,
      ["_Tasks, microtasks, queues and schedules_"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/).

</div>



      Accepts an optional argument that moves the virtual clock forward
      by the specified number of milliseconds,
      clearing asynchronous activities scheduled within that timeframe.
      See [discussion above](guide/testing#tick).

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
       <code>inject</code>
    </td>

    <td>


      Injects one or more services from the current `TestBed` injector into a test function.
      See [above](guide/testing#inject).

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>discardPeriodicTasks</code>
    </td>

    <td>


      When a `fakeAsync` test ends with pending timer event _tasks_ (queued `setTimeOut` and `setInterval` callbacks),
      the test fails with a clear error message.

      In general, a test should end with no queued tasks.
      When pending timer tasks are expected, call `discardPeriodicTasks` to flush the _task_ queue
      and avoid the error.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>flushMicrotasks</code>
    </td>

    <td>


      When a `fakeAsync` test ends with pending _micro-tasks_ such as unresolved promises,
      the test fails with a clear error message.

      In general, a test should wait for micro-tasks to finish.
      When pending microtasks are expected, call `flushMicrotasks` to flush the  _micro-task_ queue
      and avoid the error.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>ComponentFixtureAutoDetect</code>
    </td>

    <td>


      A provider token for a service that turns on [automatic change detection](guide/testing#automatic-change-detection).

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>getTestBed</code>
    </td>

    <td>


      Gets the current instance of the `TestBed`.
      Usually unnecessary because the static class methods of the `TestBed` class are typically sufficient.
      The `TestBed` instance exposes a few rarely used members that are not available as
      static methods.

    </td>

  </tr>

</table>



<hr/>



{@a testbed-class-summary}


### _TestBed_ class summary
The `TestBed` class is one of the principal Angular testing utilities.
Its API is quite large and can be overwhelming until you've explored it,
a little at a time. Read the early part of this guide first
to get the basics before trying to absorb the full API.

The module definition passed to `configureTestingModule`
is a subset of the `@NgModule` metadata properties.

<code-example format="." language="javascript">
  type TestModuleMetadata = {
    providers?: any[];
    declarations?: any[];
    imports?: any[];
    schemas?: Array&lt;SchemaMetadata | any[]&gt;;
  };

</code-example>



{@a metadata-override-object}


Each override method takes a `MetadataOverride<T>` where `T` is the kind of metadata
appropriate to the method, that is, the parameter of an `@NgModule`,
`@Component`, `@Directive`, or `@Pipe`.


<code-example format="." language="javascript">
  type MetadataOverride<T> = {
    add?: T;
    remove?: T;
    set?: T;
  };

</code-example>





{@a testbed-methods}
{@a testbed-api-summary}


The `TestBed` API consists of static class methods that either update or reference a _global_ instance of the`TestBed`.

Internally, all static methods cover methods of the current runtime `TestBed` instance,
which is also returned by the `getTestBed()` function.

Call `TestBed` methods _within_ a `beforeEach()` to ensure a fresh start before each individual test.

Here are the most important static methods, in order of likely utility.

<table>

  <tr>

    <th>
      Methods
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>configureTestingModule</code>
    </td>

    <td>


      The testing shims (`karma-test-shim`, `browser-test-shim`)
      establish the [initial test environment](guide/testing) and a default testing module.
      The default testing module is configured with basic declaratives and some Angular service substitutes that every tester needs.

      Call `configureTestingModule` to refine the testing module configuration for a particular set of tests
      by adding and removing imports, declarations (of components, directives, and pipes), and providers.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>compileComponents</code>
    </td>

    <td>


      Compile the testing module asynchronously after you've finished configuring it.
      You **must** call this method if _any_ of the testing module components have a `templateUrl`
      or `styleUrls` because fetching component template and style files is necessarily asynchronous.
      See [above](guide/testing#compile-components).

      After calling `compileComponents`, the `TestBed` configuration is frozen for the duration of the current spec.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>createComponent<T></code>
    </td>

    <td>


      Create an instance of a component of type `T` based on the current `TestBed` configuration.
      After calling `compileComponent`, the `TestBed` configuration is frozen for the duration of the current spec.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>overrideModule</code>
    </td>

    <td>


      Replace metadata for the given `NgModule`. Recall that modules can import other modules.
      The `overrideModule` method can reach deeply into the current testing module to
      modify one of these inner modules.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>overrideComponent</code>
    </td>

    <td>


      Replace metadata for the given component class, which could be nested deeply
      within an inner module.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>overrideDirective</code>
    </td>

    <td>


      Replace metadata for the given directive class, which could be nested deeply
      within an inner module.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>overridePipe</code>
    </td>

    <td>


      Replace metadata for the given pipe class, which could be nested deeply
      within an inner module.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      {@a testbed-get}
      <code>get</code>
    </td>

    <td>


      Retrieve a service from the current `TestBed` injector.

      The `inject` function is often adequate for this purpose.
      But `inject` throws an error if it can't provide the service.

      What if the service is optional?

      The `TestBed.get` method takes an optional second parameter,
      the object to return if Angular can't find the provider
      (`null` in this example):
      <code-example path="testing/src/app/bag/bag.spec.ts" region="testbed-get" title="src/app/bag/bag.spec.ts" linenums="false">

      </code-example>


      After calling `get`, the `TestBed` configuration is frozen for the duration of the current spec.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      {@a testbed-initTestEnvironment}
      <code>initTestEnvironment</code>
    </td>

    <td>


      Initialize the testing environment for the entire test run.

      The testing shims (`karma-test-shim`, `browser-test-shim`) call it for you
      so there is rarely a reason for you to call it yourself.

      You may call this method _exactly once_. If you must change
      this default in the middle of your test run, call `resetTestEnvironment` first.

      Specify the Angular compiler factory, a `PlatformRef`, and a default Angular testing module.
      Alternatives for non-browser platforms are available in the general form
      `@angular/platform-<platform_name>/testing/<platform_name>`.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>resetTestEnvironment</code>
    </td>

    <td>


      Reset the initial test environment, including the default testing module.

    </td>

  </tr>

</table>



A few of the `TestBed` instance methods are not covered by static `TestBed` _class_ methods.
These are rarely needed.


{@a component-fixture-api-summary}


### The _ComponentFixture_

The `TestBed.createComponent<T>`
creates an instance of the component `T`
and returns a strongly typed `ComponentFixture` for that component.

The `ComponentFixture` properties and methods provide access to the component,
its DOM representation, and aspects of its Angular environment.


{@a component-fixture-properties}


### _ComponentFixture_ properties

Here are the most important properties for testers, in order of likely utility.


<table>

  <tr>

    <th>
      Properties
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>componentInstance</code>
    </td>

    <td>


      The instance of the component class created by `TestBed.createComponent`.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>debugElement</code>
    </td>

    <td>


      The `DebugElement` associated with the root element of the component.

      The `debugElement` provides insight into the component and its DOM element during test and debugging.
      It's a critical property for testers. The most interesting members are covered [below](guide/testing#debug-element-details).
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>nativeElement</code>
    </td>

    <td>


      The native DOM element at the root of the component.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>changeDetectorRef</code>
    </td>

    <td>


      The `ChangeDetectorRef` for the component.

      The `ChangeDetectorRef` is most valuable when testing a
      component that has the `ChangeDetectionStrategy.OnPush` method
      or the component's change detection is under your programmatic control.

    </td>

  </tr>

</table>



{@a component-fixture-methods}


### _ComponentFixture_ methods

The _fixture_ methods cause Angular to perform certain tasks on the component tree.
Call these method to trigger Angular behavior in response to simulated user action.

Here are the most useful methods for testers.

<table>

  <tr>

    <th>
      Methods
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>detectChanges</code>
    </td>

    <td>


      Trigger a change detection cycle for the component.

      Call it to initialize the component (it calls `ngOnInit`) and after your
      test code, change the component's data bound property values.
      Angular can't see that you've changed `personComponent.name` and won't update the `name`
      binding until you call `detectChanges`.

      Runs `checkNoChanges`afterwards to confirm that there are no circular updates unless
      called as `detectChanges(false)`;
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>autoDetectChanges</code>
    </td>

    <td>


      Set this to `true` when you want the fixture to detect changes automatically.

      When autodetect is `true`, the test fixture calls `detectChanges` immediately
      after creating the component. Then it listens for pertinent zone events
      and calls `detectChanges` accordingly.
      When your test code modifies component property values directly,
      you probably still have to call `fixture.detectChanges` to trigger data binding updates.

      The default is `false`. Testers who prefer fine control over test behavior
      tend to keep it `false`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>checkNoChanges</code>
    </td>

    <td>


      Do a change detection run to make sure there are no pending changes.
      Throws an exceptions if there are.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>isStable</code>
    </td>

    <td>


      If the fixture is currently _stable_, returns `true`.
      If there are async tasks that have not completed, returns `false`.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>whenStable</code>
    </td>

    <td>


      Returns a promise that resolves when the fixture is stable.

      To resume testing after completion of asynchronous activity or
      asynchronous change detection, hook that promise.
      See [above](guide/testing#when-stable).
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>destroy</code>
    </td>

    <td>


      Trigger component destruction.

    </td>

  </tr>

</table>



{@a debug-element-details}


### _DebugElement_

The `DebugElement` provides crucial insights into the component's DOM representation.

From the test root component's `DebugElement` returned by `fixture.debugElement`,
you can walk (and query) the fixture's entire element and component subtrees.

Here are the most useful `DebugElement` members for testers, in approximate order of utility:


<table>

  <tr>

    <th>
      Member
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>nativeElement</code>
    </td>

    <td>


      The corresponding DOM element in the browser (null for WebWorkers).
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>query</code>
    </td>

    <td>


      Calling `query(predicate: Predicate<DebugElement>)` returns the first `DebugElement`
      that matches the [predicate](guide/testing#query-predicate) at any depth in the subtree.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>queryAll</code>
    </td>

    <td>


      Calling `queryAll(predicate: Predicate<DebugElement>)` returns all `DebugElements`
      that matches the [predicate](guide/testing#query-predicate) at any depth in subtree.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>injector</code>
    </td>

    <td>


      The host dependency injector.
      For example, the root element's component instance injector.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>componentInstance</code>
    </td>

    <td>


      The element's own component instance, if it has one.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>context</code>
    </td>

    <td>


      An object that provides parent context for this element.
      Often an ancestor component instance that governs this element.

      When an element is repeated within `*ngFor`, the context is an `NgForRow` whose `$implicit`
      property is the value of the row instance value.
      For example, the `hero` in `*ngFor="let hero of heroes"`.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>children</code>
    </td>

    <td>


      The immediate `DebugElement` children. Walk the tree by descending through `children`.


<div class="l-sub-section">



      `DebugElement` also has `childNodes`, a list of `DebugNode` objects.
      `DebugElement` derives from `DebugNode` objects and there are often
      more nodes than elements. Testers can usually ignore plain nodes.

</div>


    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>parent</code>
    </td>

    <td>


      The `DebugElement` parent. Null if this is the root element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>name</code>
    </td>

    <td>


      The element tag name, if it is an element.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>triggerEventHandler</code>
    </td>

    <td>


      Triggers the event by its name if there is a corresponding listener
      in the element's `listeners` collection.
      The second parameter is the _event object_ expected by the handler.
      See [above](guide/testing#trigger-event-handler).

      If the event lacks a listener or there's some other problem,
      consider calling `nativeElement.dispatchEvent(eventObject)`.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>listeners</code>
    </td>

    <td>


      The callbacks attached to the component's `@Output` properties and/or the element's event properties.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>providerTokens</code>
    </td>

    <td>


      This component's injector lookup tokens.
      Includes the component itself plus the tokens that the component lists in its `providers` metadata.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>source</code>
    </td>

    <td>


      Where to find this element in the source component template.

    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>references</code>
    </td>

    <td>


      Dictionary of objects associated with template local variables (e.g. `#foo`),
      keyed by the local variable name.

    </td>

  </tr>

</table>



{@a query-predicate}


The `DebugElement.query(predicate)` and `DebugElement.queryAll(predicate)` methods take a
predicate that filters the source element's subtree for matching `DebugElement`.

The predicate is any method that takes a `DebugElement` and returns a _truthy_ value.
The following example finds all `DebugElements` with a reference to a template local variable named "content":

<code-example path="testing/src/app/bag/bag.spec.ts" region="custom-predicate" title="src/app/bag/bag.spec.ts" linenums="false">

</code-example>



The Angular `By` class has three static methods for common predicates:

* `By.all` - return all elements.
* `By.css(selector)` - return elements with matching CSS selectors.
* `By.directive(directive)` - return elements that Angular matched to an instance of the directive class.


<code-example path="testing/src/app/hero/hero-list.component.spec.ts" region="by" title="src/app/hero/hero-list.component.spec.ts" linenums="false">

</code-example>

<a href="#top" class='to-top'>Back to top</a>

<div class='l' class='hr'>

</div>



{@a setup-files}


## Test environment setup files

Unit testing requires some configuration and bootstrapping that is captured in _setup files_.
The setup files for this guide are provided for you when you follow the [Setup](guide/setup) instructions.
The CLI delivers similar files with the same purpose.

Here's a brief description of this guide's setup files:

<div class="l-sub-section">



The deep details of these files and how to reconfigure them for your needs
is a topic beyond the scope of this guide .


</div>



<table width="100%">

  <col width="20%">

  </col>

  <col width="80%">

  </col>

  <tr>

    <th>
      File
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>karma.conf.js</code>
    </td>

    <td>


      The karma configuration file that specifies which plug-ins to use,
      which application and test files to load, which browser(s) to use,
      and how to report test results.

      It loads three other setup files:
      * `systemjs.config.js`
      * `systemjs.config.extras.js`
      * `karma-test-shim.js`
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>karma-test-shim.js</code>
    </td>

    <td>


      This shim prepares karma specifically for the Angular test environment
      and launches karma itself.
      It loads the `systemjs.config.js` file as part of that process.
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>systemjs.config.js</code>
    </td>

    <td>


      [SystemJS](https://github.com/systemjs/systemjs/blob/master/README.md)
      loads the application and test files.
      This script tells SystemJS where to find those files and how to load them.
      It's the same version of `systemjs.config.js` you installed during [setup](guide/testing#setup).
    </td>

  </tr>

  <tr>

    <td style="vertical-align: top">
      <code>systemjs.config.extras.js</code>
    </td>

    <td>


      An optional file that supplements the SystemJS configuration in `systemjs.config.js` with
      configuration for the specific needs of the application itself.

      A stock `systemjs.config.js` can't anticipate those needs.
      You fill the gaps here.

      The sample version for this guide adds the **model barrel**
      to the SystemJs `packages` configuration.
    </td>

  </tr>

  <tr>

    <td colspan="2">

      <code-example path="testing/src/systemjs.config.extras.js" title="systemjs.config.extras.js" linenums="false">

      </code-example>

    </td>

  </tr>

</table>



### npm packages

The sample tests are written to run in Jasmine and karma.
The two "fast path" setups added the appropriate Jasmine and karma npm packages to the
`devDependencies` section of the `package.json`.
They're installed when you run `npm install`.
<a href="#top" class='to-top'>Back to top</a>

<div class='l' class='hr'>

  <div id='faq'>

  </div>



  ## FAQ: Frequently Asked Questions
</div>



<div id='q-spec-file-location'>

</div>



### Why put specs next to the things they test?

It's a good idea to put unit test spec files in the same folder
as the application source code files that they test:

* Such tests are easy to find.
* You see at a glance if a part of your application lacks tests.
* Nearby tests can reveal how a part works in context.
* When you move the source (inevitable), you remember to move the test.
* When you rename the source file (inevitable), you remember to rename the test file.


<hr/>



<div id='q-specs-in-test-folder'>

</div>



### When would I put specs in a test folder?

Application integration specs can test the interactions of multiple parts
spread across folders and modules.
They don't really belong to any part in particular, so they don't have a
natural home next to any one file.

It's often better to create an appropriate folder for them in the `tests` directory.

Of course specs that test the test helpers belong in the `test` folder,
next to their corresponding helper files.
