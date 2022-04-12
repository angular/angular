# Testing services

To check that your services are working as you intend, you can write tests specifically for them.

<div class="alert is-helpful">

If you'd like to experiment with the application that this guide describes, <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

Services are often the smoothest files to unit test.
Here are some synchronous and asynchronous unit tests of the `ValueService` written without assistance from Angular testing utilities.

<code-example header="app/demo/demo.spec.ts" path="testing/src/app/demo/demo.spec.ts" region="ValueService"></code-example>

<a id="services-with-dependencies"></a>

## Services with dependencies

Services often depend on other services that Angular injects into the constructor.
In many cases, you can create and *inject* these dependencies by hand while calling the service's constructor.

The `MasterService` is a simple example:

<code-example header="app/demo/demo.ts" path="testing/src/app/demo/demo.ts" region="MasterService"></code-example>

`MasterService` delegates its only method, `getValue`, to the injected `ValueService`.

Here are several ways to test it.

<code-example header="app/demo/demo.spec.ts" path="testing/src/app/demo/demo.spec.ts" region="MasterService"></code-example>

The first test creates a `ValueService` with `new` and passes it to the `MasterService` constructor.

However, injecting the real service rarely works well as most dependent services are difficult to create and control.

Instead, mock the dependency, use a dummy value, or create a [spy](https://jasmine.github.io/tutorials/your_first_suite#section-Spies) on the pertinent service method.

<div class="alert is-helpful">

Prefer spies as they are usually the best way to mock services.

</div>

These standard testing techniques are great for unit testing services in isolation.

However, you almost always inject services into application classes using Angular dependency injection and you should have tests that reflect that usage pattern.
Angular testing utilities make it straightforward to investigate how injected services behave.

## Testing services with the `TestBed`

Your application relies on Angular [dependency injection (DI)](guide/dependency-injection) to create services.
When a service has a dependent service, DI finds or creates that dependent service.
And if that dependent service has its own dependencies, DI finds-or-creates them as well.

As service *consumer*, you don't worry about any of this.
You don't worry about the order of constructor arguments or how they're created.

As a service *tester*, you must at least think about the first level of service dependencies but you *can* let Angular DI do the service creation and deal with constructor argument order when you use the `TestBed` testing utility to provide and create services.

<a id="testbed"></a>

## Angular `TestBed`

The `TestBed` is the most important of the Angular testing utilities.
The `TestBed` creates a dynamically-constructed Angular *test* module that emulates an Angular [@NgModule](guide/ngmodules).

The `TestBed.configureTestingModule()` method takes a metadata object that can have most of the properties of an [@NgModule](guide/ngmodules).

To test a service, you set the `providers` metadata property with an array of the services that you'll test or mock.

<code-example header="app/demo/demo.testbed.spec.ts (provide ValueService in beforeEach)" path="testing/src/app/demo/demo.testbed.spec.ts" region="value-service-before-each"></code-example>

Then inject it inside a test by calling `TestBed.inject()` with the service class as the argument.

<div class="alert is-helpful">

**NOTE**: <br />
`TestBed.get()` was deprecated as of Angular version 9.
To help minimize breaking changes, Angular introduces a new function called `TestBed.inject()`, which you should use instead.
For information on the removal of `TestBed.get()`, see its entry in the [Deprecations index](guide/deprecations#index).

</div>

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="value-service-inject-it"></code-example>

Or inside the `beforeEach()` if you prefer to inject the service as part of your setup.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="value-service-inject-before-each"> </code-example>

When testing a service with a dependency, provide the mock in the `providers` array.

In the following example, the mock is a spy object.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="master-service-before-each"></code-example>

The test consumes that spy in the same way it did earlier.

<code-example path="testing/src/app/demo/demo.testbed.spec.ts" region="master-service-it"></code-example>

<a id="no-before-each"></a>

## Testing without `beforeEach()`

Most test suites in this guide call `beforeEach()` to set the preconditions for each `it()` test and rely on the `TestBed` to create classes and inject services.

There's another school of testing that never calls `beforeEach()` and prefers to create classes explicitly rather than use the `TestBed`.

Here's how you might rewrite one of the `MasterService` tests in that style.

Begin by putting re-usable, preparatory code in a *setup* function instead of `beforeEach()`.

<code-example header="app/demo/demo.spec.ts (setup)" path="testing/src/app/demo/demo.spec.ts" region="no-before-each-setup"></code-example>

The `setup()` function returns an object literal with the variables, such as `masterService`, that a test might reference.
You don't define *semi-global* variables \(for example, `let masterService: MasterService`\) in the body of the `describe()`.

Then each test invokes `setup()` in its first line, before continuing with steps that manipulate the test subject and assert expectations.

<code-example path="testing/src/app/demo/demo.spec.ts" region="no-before-each-test"></code-example>

Notice how the test uses [*destructuring assignment*](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) to extract the setup variables that it needs.

<code-example path="testing/src/app/demo/demo.spec.ts" region="no-before-each-setup-call"></code-example>

Many developers feel this approach is cleaner and more explicit than the traditional `beforeEach()` style.

Although this testing guide follows the traditional style and the default [CLI schematics](https://github.com/angular/angular-cli) generate test files with `beforeEach()` and `TestBed`, feel free to adopt *this alternative approach* in your own projects.

## Testing HTTP services

Data services that make HTTP calls to remote servers typically inject and delegate to the Angular [`HttpClient`](guide/http) service for XHR calls.

You can test a data service with an injected `HttpClient` spy as you would test any service with a dependency.

<code-example header="app/model/hero.service.spec.ts (tests with spies)" path="testing/src/app/model/hero.service.spec.ts" region="test-with-spies"></code-example>

<div class="alert is-important">

The `HeroService` methods return `Observables`.
You must *subscribe* to an observable to \(a\) cause it to execute and \(b\) assert that the method succeeds or fails.

The `subscribe()` method takes a success \(`next`\) and fail \(`error`\) callback.
Make sure you provide *both* callbacks so that you capture errors.
Neglecting to do so produces an asynchronous uncaught observable error that the test runner will likely attribute to a completely different test.

</div>

## `HttpClientTestingModule`

Extended interactions between a data service and the `HttpClient` can be complex and difficult to mock with spies.

The `HttpClientTestingModule` can make these testing scenarios more manageable.

While the *code sample* accompanying this guide demonstrates `HttpClientTestingModule`, this page defers to the [Http guide](guide/http#testing-http-requests), which covers testing with the `HttpClientTestingModule` in detail.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
