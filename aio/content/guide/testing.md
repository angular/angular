{@a top}
# Testing

This guide offers tips and techniques for unit and integration testing Angular applications.

The guide presents tests of a sample application created with the [Angular CLI](cli). This sample application is much like the one created in the [_Tour of Heroes_ tutorial](tutorial).
The sample application and all tests in this guide are available for inspection and experimentation:

- <live-example embedded-style>Sample app</live-example>
- <live-example stackblitz="specs">Tests</live-example>

<hr>

## Setup

The Angular CLI downloads and install everything you need to test an Angular application with the [Jasmine test framework](https://jasmine.github.io/).

The project you create with the CLI is immediately ready to test.
Just run the [`ng test`](cli/test) CLI command:

<code-example language="sh" class="code-shell">
  ng test
</code-example>

The `ng test` command builds the app in _watch mode_,
and launches the [karma test runner](https://karma-runner.github.io).

The console output looks a bit like this:

<code-example language="sh" class="code-shell">
10% building modules 1/1 modules 0 active
...INFO [karma]: Karma v1.7.1 server started at http://0.0.0.0:9876/
...INFO [launcher]: Launching browser Chrome ...
...INFO [launcher]: Starting browser Chrome
...INFO [Chrome ...]: Connected on socket ...
Chrome ...: Executed 3 of 3 SUCCESS (0.135 secs / 0.205 secs)
</code-example>

The last line of the log is the most important.
It shows that Karma ran three tests that all passed.

A chrome browser also opens and displays the test output in the "Jasmine HTML Reporter" like this.

<figure>
  <img src='generated/images/guide/testing/initial-jasmine-html-reporter.png' alt="Jasmine HTML Reporter in the browser">
</figure>

Most people find this browser output easier to read than the console log.
You can click on a test row to re-run just that test or click on a description to re-run the tests in the selected test group ("test suite").

Meanwhile, the `ng test` command is watching for changes.

To see this in action, make a small change to `app.component.ts` and save.
The tests run again, the browser refreshes, and the new test results appear.

#### Configuration

The CLI takes care of Jasmine and karma configuration for you.

You can fine-tune many options by editing the `karma.conf.js` and
the `test.ts` files in the `src/` folder.

The `karma.conf.js` file is a partial karma configuration file.
The CLI constructs the full runtime configuration in memory,based on application structure specified in the `angular.json` file, supplemented by `karma.conf.js`.

Search the web for more details about Jasmine and karma configuration.

#### Other test frameworks

You can also unit test an Angular app with other testing libraries and test runners.
Each library and runner has its own distinctive installation procedures, configuration, and syntax.

Search the web to learn more.

#### Test file name and location

Look inside the `src/app` folder.

The CLI generated a test file for the `AppComponent` named `app.component.spec.ts`.

<div class="alert is-important">

The test file extension **must be `.spec.ts`** so that tooling can identify it as a file with tests (AKA, a _spec_ file).

</div>

The `app.component.ts` and `app.component.spec.ts` files are siblings in the same folder.
The root file names (`app.component`) are the same for both files.

Adopt these two conventions in your own projects for _every kind_ of test file.

{@a ci}

## Set up continuous integration

One of the best ways to keep your project bug free is through a test suite, but it's easy to forget to run tests all the time. 
Continuous integration (CI) servers let you set up your project repository so that your tests run on every commit and pull request.

There are paid CI services like Circle CI and Travis CI, and you can also host your own for free using Jenkins and others. 
Although Circle CI and Travis CI are paid services, they are provided free for open source projects. 
You can create a public project on GitHub and add these services without paying. 
Contributions to the Angular repo are automatically run through a whole suite of Circle CI and Travis CI tests.

This article explains how to configure your project to run Circle CI and Travis CI, and also update your test configuration to be able to run tests in the Chrome browser in either environment.


### Configure project for Circle CI

Step 1: Create a folder called `.circleci` at the project root.

Step 2: In the new folder, create a file called `config.yml` with the following content:

```
version: 2
jobs:
  build:
    working_directory: ~/my-project
    docker:
      - image: circleci/node:8-browsers
    steps:
      - checkout
      - restore_cache:
          key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
      - run: npm install
      - save_cache:
          key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
          paths:
            - "node_modules"
      - run: npm run test -- --single-run --no-progress --browser=ChromeHeadlessCI
      - run: npm run e2e -- --no-progress --config=protractor-ci.conf.js
```

This configuration caches `node_modules/` and uses [`npm run`](https://docs.npmjs.com/cli/run-script) to run CLI commands, because `@angular/cli` is not installed globally. 
The double dash (`--`) is needed to pass arguments into the `npm` script.

Step 3: Commit your changes and push them to your repository.

Step 4: [Sign up for Circle CI](https://circleci.com/docs/2.0/first-steps/) and [add your project](https://circleci.com/add-projects). 
Your project should start building.

* Learn more about Circle CI from [Circle CI documentation](https://circleci.com/docs/2.0/).

### Configure project for Travis CI

Step 1: Create a file called `.travis.yml` at the project root, with the following content:

```
dist: trusty
sudo: false

language: node_js
node_js:
  - "8"
  
addons:
  apt:
    sources:
      - google-chrome
    packages:
      - google-chrome-stable

cache:
  directories:
     - ./node_modules

install:
  - npm install

script:
  - npm run test -- --single-run --no-progress --browser=ChromeHeadlessCI
  - npm run e2e -- --no-progress --config=protractor-ci.conf.js
```

This does the same things as the Circle CI configuration, except that Travis doesn't come with Chrome, so we use Chromium instead.

Step 2: Commit your changes and push them to your repository.

Step 3: [Sign up for Travis CI](https://travis-ci.org/auth) and [add your project](https://travis-ci.org/profile). 
You'll need to push a new commit to trigger a build.

* Learn more about Travis CI testing from [Travis CI documentation](https://docs.travis-ci.com/).

### Configure CLI for CI testing in Chrome

When the CLI commands `ng test` and `ng e2e` are generally running the CI tests in your environment, you might still need to adjust your configuration to run the Chrome browser tests.

There are configuration files for both the [Karma JavaScript test runner](https://karma-runner.github.io/latest/config/configuration-file.html) 
and [Protractor](https://www.protractortest.org/#/api-overview) end-to-end testing tool, 
which  you must adjust to start Chrome without sandboxing.

We'll be using [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli) in these examples.

* In the Karma configuration file, `karma.conf.js`, add a custom launcher called ChromeNoSandbox below browsers:
```
browsers: ['Chrome'],
customLaunchers: {
  ChromeHeadlessCI: {
    base: 'ChromeHeadless',
    flags: ['--no-sandbox']
  }
},
```

* Create a new file, `protractor-ci.conf.js`, in the root folder of your project, which extends the original `protractor.conf.js`:
```
const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: ['--headless', '--no-sandbox']
  }
};

exports.config = config;
```

Now you can run the following commands to use the `--no-sandbox` flag:

<code-example language="sh" class="code-shell">
  ng test --single-run --no-progress --browser=ChromeHeadlessCI
  ng e2e --no-progress --config=protractor-ci.conf.js
</code-example>

<div class="alert is-helpful">

   **Note:** Right now, you'll also want to include the `--disable-gpu` flag if you're running on Windows. See [crbug.com/737678](https://crbug.com/737678).

</div>

{@a code-coverage}

## Enable code coverage reports

The CLI can run unit tests and create code coverage reports. 
Code coverage reports show you  any parts of our code base that may not be properly tested by your unit tests.

To generate a coverage report run the following command in the root of your project.

<code-example language="sh" class="code-shell">
  ng test --watch=false --code-coverage
</code-example>

When  the tests are complete, the command creates a new `/coverage` folder in the project. Open the `index.html` file to see a report with your source code and code coverage values.

If you want to create code-coverage reports every time you test, you can set the following option in the CLI configuration file, `angular.json`:

```
  "test": {
    "options": {
      "codeCoverage": true
    }
  }
```

### Code coverage enforcement

The code coverage percentages let you estimate how much of your code is tested.  
If your team decides on a set minimum amount to be unit tested, you can enforce this minimum with the Angular CLI. 

For example, suppose you want the code base to have a minimum of 80% code coverage. 
To enable this, open the [Karma](https://karma-runner.github.io) test platform configuration file, `karma.conf.js`, and add the following in the `coverageIstanbulReporter:` key.

```
coverageIstanbulReporter: {
  reports: [ 'html', 'lcovonly' ],
  fixWebpackSourcePaths: true,
  thresholds: {
    statements: 80,
    lines: 80,
    branches: 80,
    functions: 80
  }
}
```

The `thresholds` property causes the tool to enforce a minimum of 80% code coverage when the unit tests are run in the project.

## Service Tests

Services are often the easiest files to unit test.
Here are some synchronous and asynchronous unit tests of the `ValueService`
written without assistance from Angular testing utilities.

<code-example path="testing/src/app/demo/demo.spec.ts" region="ValueService" header="app/demo/demo.spec.ts"></code-example>

{@a services-with-dependencies}

#### Services with dependencies

Services often depend on other services that Angular injects into the constructor.
In many cases, it easy to create and _inject_ these dependencies by hand while
calling the service's constructor.

The `MasterService` is a simple example:

<code-example path="testing/src/app/demo/demo.ts" region="MasterService" header="app/demo/demo.ts" linenums="false"></code-example>

`MasterService` delegates its only method, `getValue`, to the injected `ValueService`.

Here are several ways to test it.

<code-example path="testing/src/app/demo/demo.spec.ts" region="MasterService" header="app/demo/demo.spec.ts"></code-example>

The first test creates a `ValueService` with `new` and passes it to the `MasterService` constructor.

However, injecting the real service rarely works well as most dependent services are difficult to create and control.

Instead you can mock the dependency, use a dummy value, or create a
[spy](https://jasmine.github.io/2.0/introduction.html#section-Spies)
on the pertinent service method.

<div class="alert is-helpful">

Prefer spies as they are usually the easiest way to mock services.

</div>

These standard testing techniques are great for unit testing services in isolation.

However, you almost always inject service into application classes using Angular
dependency injection and you should have tests that reflect that usage pattern.
Angular testing utilities make it easy to investigate how injected services behave.

#### Testing services with the _TestBed_

Your app relies on Angular [dependency injection (DI)](guide/dependency-injection)
to create services.
When a service has a dependent service, DI finds or creates that dependent service.
And if that dependent service has its own dependencies, DI finds-or-creates them as well.

As service _consumer_, you don't worry about any of this.
You don't worry about the order of constructor arguments or how they're created.

As a service _tester_, you must at least think about the first level of service dependencies
but you _can_ let Angular DI do the service creation and deal with constructor argument order
when you use the `TestBed` testing utility to provide and create services.

{@a testbed}

#### Angular _TestBed_

The `TestBed` is the most important of the Angular testing utilities.
The `TestBed` creates a dynamically-constructed Angular _test_ module that emulates
an Angular [@NgModule](guide/ngmodules).

The `TestBed.configureTestingModule()` method takes a metadata object that can have most of the properties of an [@NgModule](guide/ngmodules).

To test a service, you set the `providers` metadata property with an
array of the services that you'll test or mock.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-before-each"
  header="app/demo/demo.testbed.spec.ts (provide ValueService in beforeEach">
</code-example>

Then inject it inside a test by calling `TestBed.get()` with the service class as the argument.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-inject-it">
</code-example>

Or inside the `beforeEach()` if you prefer to inject the service as part of your setup.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="value-service-inject-before-each">
</code-example>

When testing a service with a dependency, provide the mock in the `providers` array.

In the following example, the mock is a spy object.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="master-service-before-each" linenums="false">
</code-example>

The test consumes that spy in the same way it did earlier.

<code-example
  path="testing/src/app/demo/demo.testbed.spec.ts"
  region="master-service-it">
</code-example>

{@a no-before-each}
#### Testing without _beforeEach()_

Most test suites in this guide call `beforeEach()` to set the preconditions for each `it()` test
and rely on the `TestBed` to create classes and inject services.

There's another school of testing that never calls `beforeEach()` and prefers to create classes explicitly rather than use the `TestBed`.

Here's how you might rewrite one of the `MasterService` tests in that style.

Begin by putting re-usable, preparatory code in a _setup_ function instead of `beforeEach()`.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-setup"
  header="app/demo/demo.spec.ts (setup)" linenums="false">
</code-example>

The `setup()` function returns an object literal
with the variables, such as `masterService`, that a test might reference.
You don't define _semi-global_ variables (e.g., `let masterService: MasterService`)
in the body of the `describe()`.

Then each test invokes `setup()` in its first line, before continuing
with steps that manipulate the test subject and assert expectations.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-test" linenums="false">
</code-example>

Notice how the test uses
[_destructuring assignment_](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
to extract the setup variables that it needs.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="no-before-each-setup-call">
</code-example>

Many developers feel this approach is cleaner and more explicit than the
traditional `beforeEach()` style.

Although this testing guide follows the tradition style and
the default [CLI schematics](https://github.com/angular/angular-cli)
generate test files with `beforeEach()` and `TestBed`,
feel free to adopt _this alternative approach_ in your own projects.

#### Testing HTTP services

Data services that make HTTP calls to remote servers typically inject and delegate
to the Angular [`HttpClient`](guide/http) service for XHR calls.

You can test a data service with an injected `HttpClient` spy as you would
test any service with a dependency.
<code-example
  path="testing/src/app/model/hero.service.spec.ts"
  region="test-with-spies"
  header="app/model/hero.service.spec.ts (tests with spies)">
</code-example>

<div class="alert is-important">

The `HeroService` methods return `Observables`. You must
_subscribe_ to an observable to (a) cause it to execute and (b)
assert that the method succeeds or fails.

The `subscribe()` method takes a success (`next`) and fail (`error`) callback.
Make sure you provide _both_ callbacks so that you capture errors.
Neglecting to do so produces an asynchronous uncaught observable error that
the test runner will likely attribute to a completely different test.

</div>

#### _HttpClientTestingModule_

Extended interactions between a data service and the `HttpClient` can be complex
and difficult to mock with spies.

The `HttpClientTestingModule` can make these testing scenarios more manageable.

While the _code sample_ accompanying this guide demonstrates `HttpClientTestingModule`,
this page defers to the [Http guide](guide/http#testing-http-requests),
which covers testing with the `HttpClientTestingModule` in detail.

<div class="alert is-helpful">

This guide's sample code also demonstrates testing of the _legacy_ `HttpModule`
in `app/model/http-hero.service.spec.ts`.

</div>


## Component Test Basics

A component, unlike all other parts of an Angular application,
combines an HTML template and a TypeScript class.
The component truly is the template and the class _working together_.
and to adequately test a component, you should test that they work together
as intended.

Such tests require creating the component's host element in the browser DOM,
as Angular does, and investigating the component class's interaction with
the DOM as described by its template.

The Angular `TestBed` facilitates this kind of testing as you'll see in the sections below.
But in many cases, _testing the component class alone_, without DOM involvement,
can validate much of the component's behavior in an easier, more obvious way.

### Component class testing

Test a component class on its own as you would test a service class.

Consider this `LightswitchComponent` which toggles a light on and off
(represented by an on-screen message) when the user clicks the button.

<code-example
  path="testing/src/app/demo/demo.ts"
  region="LightswitchComp"
  header="app/demo/demo.ts (LightswitchComp)" linenums="false">
</code-example>

You might decide only to test that the `clicked()` method
toggles the light's _on/off_ state and sets the message appropriately.

This component class has no dependencies.
To test a service with no dependencies, you create it with `new`, poke at its API,
and assert expectations on its public state.
Do the same with the component class.

<code-example
  path="testing/src/app/demo/demo.spec.ts"
  region="Lightswitch"
  header="app/demo/demo.spec.ts (Lightswitch tests)" linenums="false">
</code-example>

Here is the `DashboardHeroComponent` from the _Tour of Heroes_ tutorial.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="class"
  header="app/dashboard/dashboard-hero.component.ts (component)" linenums="false">
</code-example>

It appears within the template of a parent component,
which binds a _hero_ to the `@Input` property and
listens for an event raised through the _selected_ `@Output` property.

You can test that the class code works without creating the `DashboardHeroComponent`
or its parent component.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="class-only"
  header="app/dashboard/dashboard-hero.component.spec.ts (class tests)" linenums="false">
</code-example>

When a component has dependencies, you may wish to use the `TestBed` to both
create the component and its dependencies.

The following `WelcomeComponent` depends on the `UserService` to know the name of the user to greet.

<code-example
  path="testing/src/app/welcome/welcome.component.ts"
  region="class"
  header="app/welcome/welcome.component.ts" linenums="false">
</code-example>

You might start by creating a mock of the `UserService` that meets the minimum needs of this component.

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="mock-user-service"
  header="app/welcome/welcome.component.spec.ts (MockUserService)" linenums="false">
</code-example>

Then provide and inject _both the_ **component** _and the service_ in the `TestBed` configuration.

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="class-only-before-each"
  header="app/welcome/welcome.component.spec.ts (class-only setup)" linenums="false">
</code-example>

Then exercise the component class, remembering to call the [lifecycle hook methods](guide/lifecycle-hooks) as Angular does when running the app.

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="class-only-tests"
  header="app/welcome/welcome.component.spec.ts (class-only tests)" linenums="false">
</code-example>

### Component DOM testing

Testing the component _class_ is as easy as testing a service.

But a component is more than just its class.
A component interacts with the DOM and with other components.
The _class-only_ tests can tell you about class behavior.
They cannot tell you if the component is going to render properly,
respond to user input and gestures, or integrate with its parent and child components.

None of the _class-only_ tests above can answer key questions about how the
components actually behave on screen.

- Is `Lightswitch.clicked()` bound to anything such that the user can invoke it?
- Is the `Lightswitch.message` displayed?
- Can the user actually select the hero displayed by `DashboardHeroComponent`?
- Is the hero name displayed as expected (i.e, in uppercase)?
- Is the welcome message displayed by the template of `WelcomeComponent`?

These may not be troubling questions for the simple components illustrated above.
But many components have complex interactions with the DOM elements
described in their templates, causing HTML to appear and disappear as
the component state changes.

To answer these kinds of questions, you have to create the DOM elements associated
with the components, you must examine the DOM to confirm that component state
displays properly at the appropriate times, and you must simulate user interaction
with the screen to determine whether those interactions cause the component to
behave as expected.

To write these kinds of test, you'll use additional features of the `TestBed`
as well as other testing helpers.

#### CLI-generated tests

The CLI creates an initial test file for you by default when you ask it to
generate a new component.

For example, the following CLI command generates a `BannerComponent` in the `app/banner` folder (with inline template and styles):

<code-example language="sh" class="code-shell">
ng generate component banner --inline-template --inline-style --module app
</code-example>

It also generates an initial test file for the component, `banner-external.component.spec.ts`, that looks like this:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v1"
  header="app/banner/banner-external.component.spec.ts (initial)" linenums="false">
</code-example>

#### Reduce the setup

Only the last three lines of this file actually test the component
and all they do is assert that Angular can create the component.

The rest of the file is boilerplate setup code anticipating more advanced tests that _might_ become necessary if the component evolves into something substantial.

You'll learn about these advanced test features below.
For now, you can radically reduce this test file to a more manageable size:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v2"
  header="app/banner/banner-initial.component.spec.ts (minimal)" linenums="false">
</code-example>

In this example, the metadata object passed to `TestBed.configureTestingModule`
simply declares `BannerComponent`, the component to test.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="configureTestingModule">
</code-example>

<div class="alert is-helpful">

There's no need to declare or import anything else.
The default test module is pre-configured with
something like the `BrowserModule` from `@angular/platform-browser`.

Later you'll call `TestBed.configureTestingModule()` with
imports, providers, and more declarations to suit your testing needs.
Optional `override` methods can further fine-tune aspects of the configuration.

</div>

{@a create-component}

#### _createComponent()_

After configuring `TestBed`, you call its `createComponent()` method.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="createComponent">
</code-example>

`TestBed.createComponent()` creates an instance of the `BannerComponent`,
adds a corresponding element to the test-runner DOM,
and returns a [`ComponentFixture`](#component-fixture).

<div class="alert is-important">

Do not re-configure `TestBed` after calling `createComponent`.

The `createComponent` method freezes the current `TestBed`definition,
closing it to further configuration.

You cannot call any more `TestBed` configuration methods, not `configureTestingModule()`,
nor `get()`, nor any of the `override...` methods.
If you try, `TestBed` throws an error.

</div>

{@a component-fixture}

#### _ComponentFixture_

The [ComponentFixture](api/core/testing/ComponentFixture) is a test harness for interacting with the created component and its corresponding element.

Access the component instance through the fixture and confirm it exists with a Jasmine expectation:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="componentInstance">
</code-example>

#### _beforeEach()_

You will add more tests as this component evolves.
Rather than duplicate the `TestBed` configuration for each test,
you refactor to pull the setup into a Jasmine `beforeEach()` and some supporting variables:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v3"
  linenums="false">
</code-example>

Now add a test that gets the component's element from `fixture.nativeElement` and
looks for the expected text.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-2">
</code-example>

{@a native-element}

#### _nativeElement_

The value of `ComponentFixture.nativeElement` has the `any` type.
Later you'll encounter the `DebugElement.nativeElement` and it too has the `any` type.

Angular can't know at compile time what kind of HTML element the `nativeElement` is or
if it even is an HTML element.
The app might be running on a _non-browser platform_, such as the server or a
[Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API),
where the element may have a diminished API or not exist at all.

The tests in this guide are designed to run in a browser so a
`nativeElement` value will always be an `HTMLElement` or
one of its derived classes.

Knowing that it is an `HTMLElement` of some sort, you can use
the standard HTML `querySelector` to dive deeper into the element tree.

Here's another test that calls `HTMLElement.querySelector` to get the paragraph element and look for the banner text:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-3">
</code-example>

{@a debug-element}

#### _DebugElement_

The Angular _fixture_ provides the component's element directly through the `fixture.nativeElement`.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="nativeElement">
</code-example>

This is actually a convenience method, implemented as `fixture.debugElement.nativeElement`.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="debugElement-nativeElement">
</code-example>

There's a good reason for this circuitous path to the element.

The properties of the `nativeElement` depend upon the runtime environment.
You could be running these tests on a _non-browser_ platform that doesn't have a DOM or
whose DOM-emulation doesn't support the full `HTMLElement` API.

Angular relies on the `DebugElement` abstraction to work safely across _all supported platforms_.
Instead of creating an HTML element tree, Angular creates a `DebugElement` tree that wraps the _native elements_ for the runtime platform.
The `nativeElement` property unwraps the `DebugElement` and returns the platform-specific element object.

Because the sample tests for this guide are designed to run only in a browser,
a `nativeElement` in these tests is always an `HTMLElement`
whose familiar methods and properties you can explore within a test.

Here's the previous test, re-implemented with `fixture.debugElement.nativeElement`:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-4">
</code-example>

The `DebugElement` has other methods and properties that
are useful in tests, as you'll see elsewhere in this guide.

You import the `DebugElement` symbol from the Angular core library.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="import-debug-element">
</code-example>

{@a by-css}
#### _By.css()_

Although the tests in this guide all run in the browser,
some apps might run on a different platform at least some of the time.

For example, the component might render first on the server as part of a strategy to make the application launch faster on poorly connected devices. The server-side renderer might not support the full HTML element API.
If it doesn't support `querySelector`, the previous test could fail.

The `DebugElement` offers query methods that work for all supported platforms.
These query methods take a _predicate_ function that returns `true` when a node in the `DebugElement` tree matches the selection criteria.

You create a _predicate_ with the help of a `By` class imported from a
library for the runtime platform. Here's the `By` import for the browser platform:

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="import-by">
</code-example>

The following example re-implements the previous test with
`DebugElement.query()` and the browser's `By.css` method.

<code-example
  path="testing/src/app/banner/banner-initial.component.spec.ts"
  region="v4-test-5">
</code-example>

Some noteworthy observations:

- The `By.css()` static method selects `DebugElement` nodes
  with a [standard CSS selector](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Selectors 'CSS selectors').
- The query returns a `DebugElement` for the paragraph.
- You must unwrap that result to get the paragraph element.

When you're filtering by CSS selector and only testing properties of a browser's _native element_, the `By.css` approach may be overkill.

It's often easier and more clear to filter with a standard `HTMLElement` method
such as `querySelector()` or `querySelectorAll()`,
as you'll see in the next set of tests.

<hr>

## Component Test Scenarios

The following sections, comprising most of this guide, explore common
component testing scenarios

### Component binding

The current `BannerComponent` presents static title text in the HTML template.

After a few changes, the `BannerComponent` presents a dynamic title by binding to
the component's `title` property like this.

<code-example
  path="testing/src/app/banner/banner.component.ts"
  region="component"
  header="app/banner/banner.component.ts" linenums="false">
</code-example>

Simple as this is, you decide to add a test to confirm that component
actually displays the right content where you think it should.

#### Query for the _&lt;h1&gt;_

You'll write a sequence of tests that inspect the value of the `<h1>` element
that wraps the _title_ property interpolation binding.

You update the `beforeEach` to find that element with a standard HTML `querySelector`
and assign it to the `h1` variable.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="setup"
  header="app/banner/banner.component.spec.ts (setup)" linenums="false">
</code-example>

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
an asynchronous activity (e.g., AJAX) completes.

The `TestBed.createComponent` does _not_ trigger change detection.
a fact confirmed in the revised test:

<code-example
  path="testing/src/app/banner/banner.component.spec.ts" region="test-w-o-detect-changes" linenums="false">
</code-example>

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

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="import-ComponentFixtureAutoDetect" header="app/banner/banner.component.detect-changes.spec.ts (import)" linenums="false"></code-example>

Then add it to the `providers` array of the testing module configuration:

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect" header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect)" linenums="false"></code-example>

Here are three tests that illustrate how automatic change detection works.

<code-example path="testing/src/app/banner/banner.component.detect-changes.spec.ts" region="auto-detect-tests" header="app/banner/banner.component.detect-changes.spec.ts (AutoDetect Tests)" linenums="false"></code-example>

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

<hr>

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

<hr>

### Component with external files

The `BannerComponent` above is defined with an _inline template_ and _inline css_, specified in the `@Component.template` and `@Component.styles` properties respectively.

Many components specify _external templates_ and _external css_ with the
`@Component.templateUrl` and `@Component.styleUrls` properties respectively,
as the following variant of `BannerComponent` does.

<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  region="metadata"
  header="app/banner/banner-external.component.ts (metadata)" linenums="false">
</code-example>

This syntax tells the Angular compiler to read the external files during component compilation.

That's not a problem when you run the CLI `ng test` command because it
_compiles the app before running the tests_.

However, if you run the tests in a **non-CLI environment**,
tests of this component may fail.
For example, if you run the `BannerComponent` tests in a web coding environment such as [plunker](https://plnkr.co/), you'll see a message like this one:

<code-example language="sh" class="code-shell" hideCopy>
Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.
</code-example>

You get this test failure message when the runtime environment
compiles the source code _during the tests themselves_.

To correct the problem, call `compileComponents()` as explained [below](#compile-components).

{@a component-with-dependency}

### Component with a dependency

Components often have service dependencies.

The `WelcomeComponent` displays a welcome message to the logged in user.
It knows who the user is based on a property of the injected `UserService`:

<code-example path="testing/src/app/welcome/welcome.component.ts" header="app/welcome/welcome.component.ts" linenums="false"></code-example>

The `WelcomeComponent` has decision logic that interacts with the service, logic that makes this component worth testing.
Here's the testing module configuration for the spec file, `app/welcome/welcome.component.spec.ts`:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="config-test-module" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

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

This particular test suite supplies a minimal mock of the `UserService` that satisfies the needs of the `WelcomeComponent`
and its tests:

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="user-service-stub"
  header="app/welcome/welcome.component.spec.ts" linenums="false">
</code-example>

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

{@a testbed-get}

#### _TestBed.get()_

You _may_ also be able to get the service from the root injector via `TestBed.get()`.
This is easier to remember and less verbose.
But it only works when Angular injects the component with the service instance in the test's root injector.

In this test suite, the _only_ provider of `UserService` is the root testing module,
so it is safe to call `TestBed.get()` as follows:

<code-example
  path="testing/src/app/welcome/welcome.component.spec.ts"
  region="inject-from-testbed"
  header="TestBed injector">
</code-example>

<div class="alert is-helpful">

For a use case in which `TestBed.get()` does not work,
see the [_Override component providers_](#component-override) section that
explains when and why you must get the service from the component's injector instead.

</div>

{@a service-from-injector}

#### Always get the service from an injector

Do _not_ reference the `userServiceStub` object
that's provided to the testing module in the body of your test.
**It does not work!**
The `userService` instance injected into the component is a completely _different_ object,
a clone of the provided `userServiceStub`.

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="stub-not-injected" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

{@a welcome-spec-setup}

#### Final setup and tests

Here's the complete `beforeEach()`, using `TestBed.get()`:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="setup" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

And here are some tests:

<code-example path="testing/src/app/welcome/welcome.component.spec.ts" region="tests" header="app/welcome/welcome.component.spec.ts" linenums="false"></code-example>

The first is a sanity test; it confirms that the stubbed `UserService` is called and working.

<div class="alert is-helpful">

The second parameter to the Jasmine matcher (e.g., `'expected name'`) is an optional failure label.
If the expectation fails, Jasmine displays appends this label to the expectation failure message.
In a spec with multiple expectations, it can help clarify what went wrong and which expectation failed.

</div>

The remaining tests confirm the logic of the component when the service returns different values.
The second test validates the effect of changing the user name.
The third test checks that the component displays the proper message when there is no logged-in user.

<hr>

{@a component-with-async-service}

### Component with async service

In this sample, the `AboutComponent` template hosts a `TwainComponent`.
The `TwainComponent` displays Mark Twain quotes.

<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="template"
  header="app/twain/twain.component.ts (template)" linenums="false">
</code-example>

Note that value of the component's `quote` property passes through an `AsyncPipe`.
That means the property returns either a `Promise` or an `Observable`.

In this example, the `TwainComponent.getQuote()` method tells you that
the `quote` property returns an `Observable`.

<code-example
  path="testing/src/app/twain/twain.component.ts"
  region="get-quote"
  header="app/twain/twain.component.ts (getQuote)" linenums="false">
</code-example>

The `TwainComponent` gets quotes from an injected `TwainService`.
The component starts the returned `Observable` with a placeholder value (`'...'`),
before the service can returns its first quote.

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
  header="app/twain/twain.component.spec.ts (setup)" linenums="false">
</code-example>

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

To use `fakeAsync()` functionality, you need to import `zone-testing`, for details, please read [setup guide](guide/setup#appendix-test-using-fakeasyncasync).

The following test confirms the expected behavior when the service returns an `ErrorObservable`.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="error-test">
</code-example>

Note that the `it()` function receives an argument of the following form.

```javascript
fakeAsync(() => { /* test body */ })`
```

The `fakeAsync()` function enables a linear coding style by running the test body in a special `fakeAsync test zone`.
The test body appears to be synchronous.
There is no nested syntax (like a `Promise.then()`) to disrupt the flow of control.

{@a tick}

#### The _tick()_ function

You do have to call `tick()` to advance the (virtual) clock.

Calling `tick()` simulates the passage of time until all pending asynchronous activities finish.
In this case, it waits for the error handler's `setTimeout()`;

The `tick()` function accepts milliseconds as parameter (defaults to 0 if not provided). The parameter represents how much the virtual clock advances. For example, if you have a `setTimeout(fn, 100)` in a `fakeAsync()` test, you need to use tick(100) to trigger the fn callback.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-tick">
</code-example>

The `tick()` function is one of the Angular testing utilities that you import with `TestBed`.
It's a companion to `fakeAsync()` and you can only call it within a `fakeAsync()` body.

#### Comparing dates inside fakeAsync()

`fakeAsync()` simulates passage of time, which allows you to calculate the difference between dates inside `fakeAsync()`.

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-date">
</code-example>

#### jasmine.clock with fakeAsync()

Jasmine also provides a `clock` feature to mock dates. Angular automatically runs tests that are run after
`jasmine.clock().install()` is called inside a `fakeAsync()` method until `jasmine.clock().uninstall()` is called. `fakeAsync()` is not needed and throws an error if nested.

By default, this feature is disabled. To enable it, set a global flag before import `zone-testing`.

If you use the Angular CLI, configure this flag in `src/test.ts`.

```
(window as any)['__zone_symbol__fakeAsyncPatchLock'] = true;
import 'zone.js/dist/zone-testing';
```

<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-clock">
</code-example>

#### Using the RxJS scheduler inside fakeAsync()

You can also use RxJS scheduler in `fakeAsync()` just like using `setTimeout()` or `setInterval()`, but you need to import `zone.js/dist/zone-patch-rxjs-fake-async` to patch RxJS scheduler.
<code-example
  path="testing/src/app/demo/async-helper.spec.ts"
  region="fake-async-test-rxjs">
</code-example>

#### Support more macroTasks

By default `fakeAsync()` supports the following `macroTasks`.

- setTimeout
- setInterval
- requestAnimationFrame
- webkitRequestAnimationFrame
- mozRequestAnimationFrame

If you run other `macroTask` such as `HTMLCanvasElement.toBlob()`, `Unknown macroTask scheduled in fake async test` error will be thrown.

<code-tabs>
  <code-pane
    path="testing/src/app/shared/canvas.component.spec.ts"
    header="src/app/shared/canvas.component.spec.ts" linenums="false">
  </code-pane>
  <code-pane
    path="testing/src/app/shared/canvas.component.ts"
    header="src/app/shared/canvas.component.ts" linenums="false">
  </code-pane>
</code-tabs>

If you want to support such case, you need to define the `macroTask` you want to support in `beforeEach()`.
For example:

```javascript
beforeEach(() => {
  window['__zone_symbol__FakeAsyncTestMacroTask'] = [
    {
      source: 'HTMLCanvasElement.toBlob',
      callbackArgs: [{ size: 200 }]
    }
  ];
});

it('toBlob should be able to run in fakeAsync', fakeAsync(() => {
    const canvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    let blob = null;
    canvas.toBlob(function(b) {
      blob = b;
    });
    tick();
    expect(blob.size).toBe(200);
  })
);
```

#### Async observables

You might be satisfied with the test coverage of these tests.

But you might be troubled by the fact that the real service doesn't quite behave this way.
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

The async observable was produced by an `asyncData` helper
The `asyncData` helper is a utility function that you'll have to write yourself.
Or you can copy this one from the sample code.

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

To flush the first quote from the observable, you call `tick()`.
Then call `detectChanges()` to tell Angular to update the screen.

Then you can assert that the quote element displays the expected text.

{@a async}

#### Async test with _async()_

To use `async()` functionality, you need to import `zone-testing`, for details, please read [setup guide](guide/setup#appendix-test-using-fakeasyncasync).

The `fakeAsync()` utility function has a few limitations.
In particular, it won't work if the test body makes an `XHR` call.

`XHR` calls within a test are rare so you can generally stick with `fakeAsync()`.
But if you ever do need to call `XHR`, you'll want to know about `async()`.

<div class="alert is-helpful">

The `TestBed.compileComponents()` method (see [below](#compile-components)) calls `XHR`
to read external template and css files during "just-in-time" compilation.
Write tests that call `compileComponents()` with the `async()` utility.

</div>

Here's the previous `fakeAsync()` test, re-written with the `async()` utility.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="async-test">
</code-example>

The `async()` utility hides some asynchronous boilerplate by arranging for the tester's code
to run in a special _async test zone_.
You don't need to pass Jasmine's `done()` into the test and call `done()` because it is `undefined` in promise or observable callbacks.

But the test's asynchronous nature is revealed by the call to `fixture.whenStable()`,
which breaks the linear flow of control.

When using an `intervalTimer()` such as `setInterval()` in `async()`, remember to cancel the timer with `clearInterval()` after the test, otherwise the `async()` never ends.

{@a when-stable}

#### _whenStable_

The test must wait for the `getQuote()` observable to emit the next quote.
Instead of calling `tick()`, it calls `fixture.whenStable()`.

The `fixture.whenStable()` returns a promise that resolves when the JavaScript engine's
task queue becomes empty.
In this example, the task queue becomes empty when the observable emits the first quote.

The test resumes within the promise callback, which calls `detectChanges()` to
update the quote element with the expected text.

{@a jasmine-done}

#### Jasmine _done()_

While the `async()` and `fakeAsync()` functions greatly
simplify Angular asynchronous testing,
you can still fall back to the traditional technique
and pass `it` a function that takes a
[`done` callback](https://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support).

You can't call `done()` in `async()` or `fakeAsync()` functions, because the `done parameter`
is `undefined`.

Now you are responsible for chaining promises, handling errors, and calling `done()` at the appropriate moments.

Writing test functions with `done()`, is more cumbersome than `async()`and `fakeAsync()`.
But it is occasionally necessary when code involves the `intervalTimer()` like `setInterval`.

Here are two more versions of the previous test, written with `done()`.
The first one subscribes to the `Observable` exposed to the template by the component's `quote` property.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="quote-done-test" linenums="false">
</code-example>

The RxJS `last()` operator emits the observable's last value before completing, which will be the test quote.
The `subscribe` callback calls `detectChanges()` to
update the quote element with the test quote, in the same manner as the earlier tests.

In some tests, you're more interested in how an injected service method was called and what values it returned,
than what appears on screen.

A service spy, such as the `qetQuote()` spy of the fake `TwainService`,
can give you that information and make assertions about the state of the view.

<code-example
  path="testing/src/app/twain/twain.component.spec.ts"
  region="spy-done-test" linenums="false">
</code-example>

<hr>

{@a marble-testing}
### Component marble tests

The previous `TwainComponent` tests simulated an asynchronous observable response
from the `TwainService` with the `asyncData` and `asyncError` utilities.

These are short, simple functions that you can write yourself.
Unfortunately, they're too simple for many common scenarios.
An observable often emits multiple times, perhaps after a significant delay.
A component may coordinate multiple observables
with overlapping sequences of values and errors.

**RxJS marble testing** is a great way to test observable scenarios,
both simple and complex.
You've likely seen the [marble diagrams](http://rxmarbles.com/)
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
  header="app/twain/twain.component.marbles.spec.ts (import marbles)" linenums="false">
</code-example>

Here's the complete test for getting a quote:

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="get-quote-test" linenums="false">
</code-example>

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
  region="test-quote-marbles" linenums="false">
</code-example>

The marble library constructs the corresponding observable, which the
test sets as the `getQuote` spy's return value.

When you're ready to activate the marble observables,
you tell the `TestScheduler` to _flush_ its queue of prepared tasks like this.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="test-scheduler-flush" linenums="false">
</code-example>

This step serves a purpose analogous to `tick()` and `whenStable()` in the
earlier `fakeAsync()` and `async()` examples.
The balance of the test is the same as those examples.

#### Marble error testing

Here's the marble testing version of the `getQuote()` error test.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="error-test" linenums="false">
</code-example>

It's still an async test, calling `fakeAsync()` and `tick()`, because the component itself
calls `setTimeout()` when processing errors.

Look at the marble observable definition.

<code-example
  path="testing/src/app/twain/twain.component.marbles.spec.ts"
  region="error-marbles" linenums="false">
</code-example>

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
[official documentation](https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md).

<hr>

{@a component-with-input-output}

### Component with inputs and outputs

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
  header="app/dashboard/dashboard.component.html (excerpt)" linenums="false">
</code-example>

The `DashboardHeroComponent` appears in an `*ngFor` repeater, which sets each component's `hero` input property
to the looping value and listens for the component's `selected` event.

Here's the component's full definition:

{@a dashboard-hero-component}

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.ts"
  region="component"
  header="app/dashboard/dashboard-hero.component.ts (component)" linenums="false">
</code-example>

While testing a component this simple has little intrinsic value, it's worth knowing how.
You can use one of these approaches:

- Test it as used by `DashboardComponent`.
- Test it as a stand-alone component.
- Test it as used by a substitute for `DashboardComponent`.

A quick look at the `DashboardComponent` constructor discourages the first approach:

<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (constructor)" linenums="false">
</code-example>

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
  header="app/dashboard/dashboard-hero.component.spec.ts (setup)" linenums="false">
</code-example>

Note how the setup code assigns a test hero (`expectedHero`) to the component's `hero` property,
emulating the way the `DashboardComponent` would set it
via the property binding in its repeater.

The following test verifies that the hero name is propagated to the template via a binding.

<code-example
  path="testing/src/app/dashboard/dashboard-hero.component.spec.ts"
  region="name-test">
</code-example>

Because the [template](#dashboard-hero-component) passes the hero name through the Angular `UpperCasePipe`,
the test must match the element value with the upper-cased name.

<div class="alert is-helpful">

This small test demonstrates how Angular tests can verify a component's visual
representation&mdash;something not possible with
[component class tests](#component-class-testing)&mdash;at
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
  header="testing/index.ts (click helper)" linenums="false">
</code-example>

The first parameter is the _element-to-click_. If you wish, you can pass a
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

<hr>

{@a component-inside-test-host}

### Component inside a test host

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
  linenums="false">
</code-example>

This test host binds to `DashboardHeroComponent` as the `DashboardComponent` would
but without the noise of the `Router`, the `HeroService`, or the `*ngFor` repeater.

The test host sets the component's `hero` input property with its test hero.
It binds the component's `selected` event with its `onSelected` handler,
which records the emitted hero in its `selectedHero` property.

Later, the tests will be able to easily check `selectedHero` to verify that the
`DashboardHeroComponent.selected` event emitted the expected hero.

The setup for the _test-host_ tests is similar to the setup for the stand-alone tests:

<code-example path="testing/src/app/dashboard/dashboard-hero.component.spec.ts" region="test-host-setup" header="app/dashboard/dashboard-hero.component.spec.ts (test host setup)" linenums="false"></code-example>

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
  header="app/dashboard/dashboard-hero.component.spec.ts (test-host)" linenums="false">
</code-example>

Only the selected event test differs. It confirms that the selected `DashboardHeroComponent` hero
really does find its way up through the event binding to the host component.

<hr>

{@a routing-component}

### Routing component

A _routing component_ is a component that tells the `Router` to navigate to another component.
The `DashboardComponent` is a _routing component_ because the user can
navigate to the `HeroDetailComponent` by clicking on one of the _hero buttons_ on the dashboard.

Routing is pretty complicated.
Testing the `DashboardComponent` seemed daunting in part because it involves the `Router`,
which it injects together with the `HeroService`.

<code-example
  path="testing/src/app/dashboard/dashboard.component.ts"
  region="ctor"
  header="app/dashboard/dashboard.component.ts (constructor)" linenums="false">
</code-example>

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
  header="app/dashboard/dashboard.component.spec.ts (spies)" linenums="false">
</code-example>

The following test clicks the displayed hero and confirms that
`Router.navigateByUrl` is called with the expected url.

<code-example
  path="testing/src/app/dashboard/dashboard.component.spec.ts"
  region="navigate-test"
  header="app/dashboard/dashboard.component.spec.ts (navigate test)" linenums="false">
</code-example>

{@a routed-component-w-param}

### Routed components

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

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ctor" header="app/hero/hero-detail.component.ts (constructor)" linenums="false"></code-example>

The `HeroDetail` component needs the `id` parameter so it can fetch
the corresponding hero via the `HeroDetailService`.
The component has to get the `id` from the `ActivatedRoute.paramMap` property
which is an `Observable`.

It can't just reference the `id` property of the `ActivatedRoute.paramMap`.
The component has to _subscribe_ to the `ActivatedRoute.paramMap` observable and be prepared
for the `id` to change during its lifetime.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="ng-on-init" header="app/hero/hero-detail.component.ts (ngOnInit)" linenums="false"></code-example>

<div class="alert is-helpful">

The [Router](guide/router#route-parameters) guide covers `ActivatedRoute.paramMap` in more detail.

</div>

Tests can explore how the `HeroDetailComponent` responds to different `id` parameter values
by manipulating the `ActivatedRoute` injected into the component's constructor.

You know how to spy on the `Router` and a data service.

You'll take a different approach with `ActivatedRoute` because

- `paramMap` returns an `Observable` that can emit more than one value
  during a test.
- You need the router helper function, `convertToParamMap()`, to create a `ParamMap`.
- Other _routed components_ tests need a test double for `ActivatedRoute`.

These differences argue for a re-usable stub class.

#### _ActivatedRouteStub_

The following `ActivatedRouteStub` class serves as a test double for `ActivatedRoute`.

<code-example
  path="testing/src/testing/activated-route-stub.ts"
  region="activated-route-stub"
  header="testing/activated-route-stub.ts (ActivatedRouteStub)" linenums="false">
</code-example>

Consider placing such helpers in a `testing` folder sibling to the `app` folder.
This sample puts `ActivatedRouteStub` in `testing/activated-route-stub.ts`.

<div class="alert is-helpful">

Consider writing a more capable version of this stub class with
the [_marble testing library_](#marble-testing).

</div>

{@a tests-w-test-double}

#### Testing with _ActivatedRouteStub_

Here's a test demonstrating the component's behavior when the observed `id` refers to an existing hero:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-good-id" header="app/hero/hero-detail.component.spec.ts (existing id)" linenums="false"></code-example>

<div class="alert is-helpful">

The `createComponent()` method and `page` object are discussed [below](#page-object).
Rely on your intuition for now.

</div>

When the `id` cannot be found, the component should re-route to the `HeroListComponent`.

The test suite setup provided the same router spy [described above](#routing-component) which spies on the router without actually navigating.

This test expects the component to try to navigate to the `HeroListComponent`.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="route-bad-id" header="app/hero/hero-detail.component.spec.ts (bad id)" linenums="false"></code-example>

While this app doesn't have a route to the `HeroDetailComponent` that omits the `id` parameter, it might add such a route someday.
The component should do something reasonable when there is no `id`.

In this implementation, the component should create and display a new hero.
New heroes have `id=0` and a blank `name`. This test confirms that the component behaves as expected:

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="route-no-id"
  header="app/hero/hero-detail.component.spec.ts (no id)" linenums="false">
</code-example>

<hr>

### Nested component tests

Component templates often have nested components, whose templates
may contain more components.

The component tree can be very deep and, most of the time, the nested components
play no role in testing the component at the top of the tree.

The `AppComponent`, for example, displays a navigation bar with anchors and their `RouterLink` directives.

<code-example
  path="testing/src/app/app.component.html"
  header="app/app.component.html" linenums="false">
</code-example>

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
Use them, alone or in combination, to stay focused on the testing the primary component.

{@a stub-component}

##### Stubbing unneeded components

In the first technique, you create and declare stub versions of the components
and directive that play little or no role in the tests.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="component-stubs"
  header="app/app.component.spec.ts (stub declaration)" linenums="false">
</code-example>

The stub selectors match the selectors for the corresponding real components.
But their templates and classes are empty.

Then declare them in the `TestBed` configuration next to the
components, directives, and pipes that need to be real.

<code-example
  path="testing/src/app/app.component.spec.ts"
  region="testbed-stubs"
  header="app/app.component.spec.ts (TestBed stubs)" linenums="false">
</code-example>

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
  header="app/app.component.spec.ts (NO_ERRORS_SCHEMA)" linenums="false">
</code-example>

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
  header="app/app.component.spec.ts (mixed setup)" linenums="false">
</code-example>

The Angular compiler creates the `BannerComponentStub` for the `<app-banner>` element
and applies the `RouterLinkStubDirective` to the anchors with the `routerLink` attribute,
but it ignores the `<app-welcome>` and `<router-outlet>` tags.

<hr>

{@a routerlink}
### Components with _RouterLink_

The real `RouterLinkDirective` is quite complicated and entangled with other components
and directives of the `RouterModule`.
It requires challenging setup to mock and use in tests.

The `RouterLinkDirectiveStub` in this sample code replaces the real directive
with an alternative version designed to validate the kind of anchor tag wiring
seen in the `AppComponent` template.

<code-example
  path="testing/src/testing/router-link-directive-stub.ts"
  region="router-link"
  header="testing/router-link-directive-stub.ts (RouterLinkDirectiveStub)" linenums="false">
</code-example>

The URL bound to the `[routerLink]` attribute flows in to the directive's `linkParams` property.

The `host` metadata property wires the click event of the host element
(the `<a>` anchor elements in `AppComponent`) to the stub directive's `onClick` method.

Clicking the anchor should trigger the `onClick()` method,
which sets the stub's telltale `navigatedTo` property.
Tests inspect `navigatedTo` to confirm that clicking the anchor
set the expected route definition.

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
  header="app/app.component.spec.ts (test setup)" linenums="false">
</code-example>

Three points of special interest:

1.  You can locate the anchor elements with an attached directive using `By.directive`.

1.  The query returns `DebugElement` wrappers around the matching elements.

1.  Each `DebugElement` exposes a dependency injector with the
    specific instance of the directive attached to that element.

The `AppComponent` links to validate are as follows:

<code-example
  path="testing/src/app/app.component.html"
  region="links"
  header="app/app.component.html (navigation links)" linenums="false">
</code-example>

{@a app-component-tests}

Here are some tests that confirm those links are wired to the `routerLink` directives
as expected:

<code-example path="testing/src/app/app.component.spec.ts" region="tests" header="app/app.component.spec.ts (selected tests)" linenums="false"></code-example>

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

<hr>

{@a page-object}

### Use a _page_ object

The `HeroDetailComponent` is a simple view with a title, two hero fields, and two buttons.

<figure>
  <img src='generated/images/guide/testing/hero-detail.component.png' alt="HeroDetailComponent in action">
</figure>

But there's plenty of template complexity even in this simple form.

<code-example
  path="testing/src/app/hero/hero-detail.component.html" header="app/hero/hero-detail.component.html" linenums="false">
</code-example>

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
  header="app/hero/hero-detail.component.spec.ts (Page)" linenums="false">
</code-example>

Now the important hooks for component manipulation and inspection are neatly organized and accessible from an instance of `Page`.

A `createComponent` method creates a `page` object and fills in the blanks once the `hero` arrives.

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="create-component"
  header="app/hero/hero-detail.component.spec.ts (createComponent)" linenums="false">
</code-example>

The [_HeroDetailComponent_ tests](#tests-w-test-double) in an earlier section demonstrate how `createComponent` and `page`
keep the tests short and _on message_.
There are no distractions: no waiting for promises to resolve and no searching the DOM for element values to compare.

Here are a few more `HeroDetailComponent` tests to reinforce the point.

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="selected-tests"
  header="app/hero/hero-detail.component.spec.ts (selected tests)" linenums="false">
</code-example>

<hr>

{@a compile-components}
### Calling _compileComponents()_
<div class="alert is-helpful">

You can ignore this section if you _only_ run tests with the CLI `ng test` command
because the CLI compiles the application before running the tests.

</div>

If you run tests in a **non-CLI environment**, the tests may fail with a message like this one:

<code-example language="sh" class="code-shell" hideCopy>
Error: This test module uses the component BannerComponent
which is using a "templateUrl" or "styleUrls", but they were never compiled.
Please call "TestBed.compileComponents" before your test.
</code-example>

The root of the problem is at least one of the components involved in the test
specifies an external template or CSS file as
the following version of the `BannerComponent` does.

<code-example
  path="testing/src/app/banner/banner-external.component.ts"
  header="app/banner/banner-external.component.ts (external template & css)" linenums="false">
</code-example>

The test fails when the `TestBed` tries to create the component.

<code-example
  path="testing/src/app/banner/banner.component.spec.ts"
  region="configure-and-create"
  header="app/banner/banner.component.spec.ts (setup that fails)"
  avoid linenums="false">
</code-example>

Recall that the app hasn't been compiled.
So when you call `createComponent()`, the `TestBed` compiles implicitly.

That's not a problem when the source code is in memory.
But the `BannerComponent` requires external files
that the compile must read from the file system,
an inherently _asynchronous_ operation.

If the `TestBed` were allowed to continue, the tests would run and fail mysteriously
before the compiler could finished.

The preemptive error message tells you to compile explicitly with `compileComponents()`.

#### _compileComponents()_ is async

You must call `compileComponents()` within an asynchronous test function.

<div class="alert is-critical">

If you neglect to make the test function async
(e.g., forget to use `async()` as described below),
you'll see this error message

<code-example language="sh" class="code-shell" hideCopy>
Error: ViewDestroyedError: Attempt to use a destroyed view
</code-example>

</div>

A typical approach is to divide the setup logic into two separate `beforeEach()` functions:

1.  An async `beforeEach()` that compiles the components
1.  A synchronous `beforeEach()` that performs the remaining setup.

To follow this pattern, import the `async()` helper with the other testing symbols.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="import-async">
</code-example>

#### The async _beforeEach_

Write the first async `beforeEach` like this.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="async-before-each"
  header="app/banner/banner-external.component.spec.ts (async beforeEach)" linenums="false">
</code-example>

The `async()` helper function takes a parameterless function with the body of the setup.

The `TestBed.configureTestingModule()` method returns the `TestBed` class so you can chain
calls to other `TestBed` static methods such as `compileComponents()`.

In this example, the `BannerComponent` is the only component to compile.
Other examples configure the testing module with multiple components
and may import application modules that hold yet more components.
Any of them could be require external files.

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
  header="app/banner/banner-external.component.spec.ts (synchronous beforeEach)" linenums="false">
</code-example>

You can count on the test runner to wait for the first asynchronous `beforeEach` to finish before calling the second.

#### Consolidated setup

You can consolidate the two `beforeEach()` functions into a single, async `beforeEach()`.

The `compileComponents()` method returns a promise so you can perform the
synchronous setup tasks _after_ compilation by moving the synchronous code
into a `then(...)` callback.

<code-example
  path="testing/src/app/banner/banner-external.component.spec.ts"
  region="one-before-each"
  header="app/banner/banner-external.component.spec.ts (one beforeEach)" linenums="false">
</code-example>

#### _compileComponents()_ is harmless

There's no harm in calling `compileComponents()` when it's not required.

The component test file generated by the CLI calls `compileComponents()`
even though it is never required when running `ng test`.

The tests in this guide only call `compileComponents` when necessary.

<hr>

{@a import-module}

### Setup with module imports

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
  header="app/hero/hero-detail.component.spec.ts (FormsModule setup)" linenums="false">
</code-example>

<div class="alert is-helpful">

Notice that the `beforeEach()` is asynchronous and calls `TestBed.compileComponents`
because the `HeroDetailComponent` has an external template and css file.

As explained in [_Calling compileComponents()_](#compile-components) above,
these tests could be run in a non-CLI environment
where Angular would have to compile them in the browser.

</div>

#### Import a shared module

Because many app components need the `FormsModule` and the `TitleCasePipe`, the developer created
a `SharedModule` to combine these and other frequently requested parts.

The test configuration can use the `SharedModule` too as seen in this alternative setup:

<code-example
  path="testing/src/app/hero/hero-detail.component.spec.ts"
  region="setup-shared-module"
  header="app/hero/hero-detail.component.spec.ts (SharedModule setup)" linenums="false">
</code-example>

It's a bit tighter and smaller, with fewer import statements (not shown).

{@a feature-module-import}

#### Import a feature module

The `HeroDetailComponent` is part of the `HeroModule` [Feature Module](guide/feature-modules) that aggregates more of the interdependent pieces
including the `SharedModule`.
Try a test configuration that imports the `HeroModule` like this one:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-hero-module" header="app/hero/hero-detail.component.spec.ts (HeroModule setup)" linenums="false"></code-example>

That's _really_ crisp. Only the _test doubles_ in the `providers` remain. Even the `HeroDetailComponent` declaration is gone.

In fact, if you try to declare it, Angular will throw an error because
`HeroDetailComponent` is declared in both the `HeroModule` and the `DynamicTestModule`
created by the `TestBed`.

<div class="alert is-helpful">

Importing the component's feature module can be the easiest way to configure tests
when there are many mutual dependencies within the module and
the module is small, as feature modules tend to be.

</div>

<hr>

{@a component-override}

### Override component providers

The `HeroDetailComponent` provides its own `HeroDetailService`.

<code-example path="testing/src/app/hero/hero-detail.component.ts" region="prototype" header="app/hero/hero-detail.component.ts (prototype)" linenums="false"></code-example>

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

<code-example path="testing/src/app/hero/hero-detail.service.ts" region="prototype" header="app/hero/hero-detail.service.ts (prototype)" linenums="false"></code-example>

The [previous test configuration](#feature-module-import) replaces the real `HeroService` with a `TestHeroService`
that intercepts server requests and fakes their responses.

</div>

What if you aren't so lucky. What if faking the `HeroService` is hard?
What if `HeroDetailService` makes its own server requests?

The `TestBed.overrideComponent` method can replace the component's `providers` with easy-to-manage _test doubles_
as seen in the following setup variation:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="setup-override" header="app/hero/hero-detail.component.spec.ts (Override setup)" linenums="false"></code-example>

Notice that `TestBed.configureTestingModule` no longer provides a (fake) `HeroService` because it's [not needed](#spy-stub).

{@a override-component-method}

#### The _overrideComponent_ method

Focus on the `overrideComponent` method.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-component-method" header="app/hero/hero-detail.component.spec.ts (overrideComponent)" linenums="false"></code-example>

It takes two arguments: the component type to override (`HeroDetailComponent`) and an override metadata object.
The [override metadata object](#metadata-override-object) is a generic defined as follows:

<code-example format="." language="javascript">
  type MetadataOverride<T> = {
    add?: Partial<T>;
    remove?: Partial<T>;
    set?: Partial<T>;
  };
</code-example>

A metadata override object can either add-and-remove elements in metadata properties or completely reset those properties.
This example resets the component's `providers` metadata.

The type parameter, `T`, is the kind of metadata you'd pass to the `@Component` decorator:

<code-example format="." language="javascript">
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

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="hds-spy" header="app/hero/hero-detail.component.spec.ts (HeroDetailServiceSpy)" linenums="false"></code-example>

{@a override-tests}

#### The override tests

Now the tests can control the component's hero directly by manipulating the spy-stub's `testHero`
and confirm that service methods were called.

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="override-tests" header="app/hero/hero-detail.component.spec.ts (override tests)" linenums="false"></code-example>

{@a more-overrides}

#### More overrides

The `TestBed.overrideComponent` method can be called multiple times for the same or different components.
The `TestBed` offers similar `overrideDirective`, `overrideModule`, and `overridePipe` methods
for digging into and replacing parts of these other classes.

Explore the options and combinations on your own.

<hr>

{@a attribute-directive}

## Attribute Directive Testing

An _attribute directive_ modifies the behavior of an element, component or another directive.
Its name reflects the way the directive is applied: as an attribute on a host element.

The sample application's `HighlightDirective` sets the background color of an element
based on either a data bound color or a default color (lightgray).
It also sets a custom property of the element (`customProperty`) to `true`
for no reason other than to show that it can.

<code-example path="testing/src/app/shared/highlight.directive.ts" header="app/shared/highlight.directive.ts" linenums="false"></code-example>

It's used throughout the application, perhaps most simply in the `AboutComponent`:

<code-example path="testing/src/app/about/about.component.ts" header="app/about/about.component.ts" linenums="false"></code-example>

Testing the specific use of the `HighlightDirective` within the `AboutComponent` requires only the
techniques explored above (in particular the ["Shallow test"](#nested-component-tests) approach).

<code-example path="testing/src/app/about/about.component.spec.ts" region="tests" header="app/about/about.component.spec.ts" linenums="false"></code-example>

However, testing a single use case is unlikely to explore the full range of a directive's capabilities.
Finding and testing all components that use the directive is tedious, brittle, and almost as unlikely to afford full coverage.

_Class-only tests_ might be helpful,
but attribute directives like this one tend to manipulate the DOM.
Isolated unit tests don't touch the DOM and, therefore,
do not inspire confidence in the directive's efficacy.

A better solution is to create an artificial test component that demonstrates all ways to apply the directive.

<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="test-component" header="app/shared/highlight.directive.spec.ts (TestComponent)" linenums="false"></code-example>

<figure>
  <img src='generated/images/guide/testing/highlight-directive-spec.png' alt="HighlightDirective spec in action">
</figure>

<div class="alert is-helpful">

The `<input>` case binds the `HighlightDirective` to the name of a color value in the input box.
The initial value is the word "cyan" which should be the background color of the input box.

</div>

Here are some tests of this component:

<code-example path="testing/src/app/shared/highlight.directive.spec.ts" region="selected-tests" header="app/shared/highlight.directive.spec.ts (selected tests)"></code-example>

A few techniques are noteworthy:

- The `By.directive` predicate is a great way to get the elements that have this directive _when their element types are unknown_.

- The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/:not">`:not` pseudo-class</a>
  in `By.css('h2:not([highlight])')` helps find `<h2>` elements that _do not_ have the directive.
  `By.css('*:not([highlight])')` finds _any_ element that does not have the directive.

- `DebugElement.styles` affords access to element styles even in the absence of a real browser, thanks to the `DebugElement` abstraction.
  But feel free to exploit the `nativeElement` when that seems easier or more clear than the abstraction.

- Angular adds a directive to the injector of the element to which it is applied.
  The test for the default color uses the injector of the second `<h2>` to get its `HighlightDirective` instance
  and its `defaultColor`.

- `DebugElement.properties` affords access to the artificial custom property that is set by the directive.

<hr>

## Pipe Testing

Pipes are easy to test without the Angular testing utilities.

A pipe class has one method, `transform`, that manipulates the input
value into a transformed output value.
The `transform` implementation rarely interacts with the DOM.
Most pipes have no dependence on Angular other than the `@Pipe`
metadata and an interface.

Consider a `TitleCasePipe` that capitalizes the first letter of each word.
Here's a naive implementation with a regular expression.

<code-example path="testing/src/app/shared/title-case.pipe.ts" header="app/shared/title-case.pipe.ts" linenums="false"></code-example>

Anything that uses a regular expression is worth testing thoroughly.
Use simple Jasmine to explore the expected cases and the edge cases.

<code-example path="testing/src/app/shared/title-case.pipe.spec.ts" region="excerpt" header="app/shared/title-case.pipe.spec.ts"></code-example>

{@a write-tests}

#### Write DOM tests too

These are tests of the pipe _in isolation_.
They can't tell if the `TitleCasePipe` is working properly as applied in the application components.

Consider adding component tests such as this one:

<code-example path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe" header="app/hero/hero-detail.component.spec.ts (pipe test)"></code-example>

<hr>

{@a test-debugging}

## Test debugging

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

<hr>

{@a atu-apis}

## Testing Utility APIs

This section takes inventory of the most useful Angular testing features and summarizes what they do.

The Angular testing utilities include the `TestBed`, the `ComponentFixture`, and a handful of functions that control the test environment.
The [_TestBed_](#testbed-api-summary) and [_ComponentFixture_](#component-fixture-api-summary) classes are covered separately.

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
      See [discussion above](#async).

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>fakeAsync</code>
    </td>

    <td>

      Runs the body of a test (`it`) within a special _fakeAsync test zone_, enabling
      a linear control flow coding style. See [discussion above](#fake-async).

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>tick</code>
    </td>

    <td>

      Simulates the passage of time and the completion of pending asynchronous activities
      by flushing both _timer_ and _micro-task_ queues within the _fakeAsync test zone_.

      <div class="alert is-helpful">

      The curious, dedicated reader might enjoy this lengthy blog post,
      ["_Tasks, microtasks, queues and schedules_"](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/).

      </div>

      Accepts an optional argument that moves the virtual clock forward
      by the specified number of milliseconds,
      clearing asynchronous activities scheduled within that timeframe.
      See [discussion above](#tick).

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
       <code>inject</code>
    </td>

    <td>

      Injects one or more services from the current `TestBed` injector into a test function.
      It cannot inject a service provided by the component itself.
      See discussion of the [debugElement.injector](#get-injected-services).

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>discardPeriodicTasks</code>
    </td>

    <td>

      When a `fakeAsync()` test ends with pending timer event _tasks_ (queued `setTimeOut` and `setInterval` callbacks),
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

      When a `fakeAsync()` test ends with pending _micro-tasks_ such as unresolved promises,
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

      A provider token for a service that turns on [automatic change detection](#automatic-change-detection).

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

<hr>

{@a testbed-class-summary}

#### _TestBed_ class summary

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
    add?: Partial<T>;
    remove?: Partial<T>;
    set?: Partial<T>;
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
      See [above](#compile-components).

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

      The `TestBed.get()` method takes an optional second parameter,
      the object to return if Angular can't find the provider
      (`null` in this example):

      <code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="testbed-get-w-null" header="app/demo/demo.testbed.spec.ts" linenums="false"></code-example>

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
</table

A few of the `TestBed` instance methods are not covered by static `TestBed` _class_ methods.
These are rarely needed.

{@a component-fixture-api-summary}

#### The _ComponentFixture_

The `TestBed.createComponent<T>`
creates an instance of the component `T`
and returns a strongly typed `ComponentFixture` for that component.

The `ComponentFixture` properties and methods provide access to the component,
its DOM representation, and aspects of its Angular environment.

{@a component-fixture-properties}

#### _ComponentFixture_ properties

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
      It's a critical property for testers. The most interesting members are covered [below](#debug-element-details).

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

#### _ComponentFixture_ methods

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
      See [above](#when-stable).

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

#### _DebugElement_

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
      that matches the [predicate](#query-predicate) at any depth in the subtree.

    </td>
  </tr>

  <tr>
    <td style="vertical-align: top">
      <code>queryAll</code>
    </td>

    <td>

      Calling `queryAll(predicate: Predicate<DebugElement>)` returns all `DebugElements`
      that matches the [predicate](#query-predicate) at any depth in subtree.

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

      <div class="alert is-helpful">

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
      See [above](#trigger-event-handler).

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

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="custom-predicate" header="app/demo/demo.testbed.spec.ts" linenums="false"></code-example>

The Angular `By` class has three static methods for common predicates:

- `By.all` - return all elements.
- `By.css(selector)` - return elements with matching CSS selectors.
- `By.directive(directive)` - return elements that Angular matched to an instance of the directive class.

<code-example path="testing/src/app/hero/hero-list.component.spec.ts" region="by" header="app/hero/hero-list.component.spec.ts" linenums="false"></code-example>

<hr>

{@a faq}

## Frequently Asked Questions

{@a q-spec-file-location}

#### Why put spec file next to the file it tests?

It's a good idea to put unit test spec files in the same folder
as the application source code files that they test:

- Such tests are easy to find.
- You see at a glance if a part of your application lacks tests.
- Nearby tests can reveal how a part works in context.
- When you move the source (inevitable), you remember to move the test.
- When you rename the source file (inevitable), you remember to rename the test file.

<hr>

{@a q-specs-in-test-folder}

#### When would I put specs in a test folder?

Application integration specs can test the interactions of multiple parts
spread across folders and modules.
They don't really belong to any part in particular, so they don't have a
natural home next to any one file.

It's often better to create an appropriate folder for them in the `tests` directory.

Of course specs that test the test helpers belong in the `test` folder,
next to their corresponding helper files.

{@a q-e2e}

#### Why not rely on E2E tests of DOM integration?

The component DOM tests described in this guide often require extensive setup and
advanced techniques whereas the [unit tests](#component-class-testing)
are comparatively simple.

#### Why not defer DOM integration tests to end-to-end (E2E) testing?

E2E tests are great for high-level validation of the entire system.
But they can't give you the comprehensive test coverage that you'd expect from unit tests.

E2E tests are difficult to write and perform poorly compared to unit tests.
They break easily, often due to changes or misbehavior far removed from the site of breakage.

E2E tests can't easily reveal how your components behave when things go wrong,
such as missing or bad data, lost connectivity, and remote service failures.

E2E tests for apps that update a database,
send an invoice, or charge a credit card require special tricks and back-doors to prevent
accidental corruption of remote resources.
It can even be hard to navigate to the component you want to test.

Because of these many obstacles, you should test DOM interaction
with unit testing techniques as much as possible.
