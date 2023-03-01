# HTTP client - Test requests

As for any external dependency, you must mock the HTTP backend so your tests can simulate interaction with a remote server.
The `@angular/common/http/testing` library makes it straightforward to set up such mocking.

## HTTP testing library

Angular's HTTP testing library is designed for a pattern of testing in which the app executes code and makes requests first.
The test then expects that certain requests have or have not been made, performs assertions against those requests, and finally provides responses by "flushing" each expected request.

At the end, tests can verify that the app made no unexpected requests.

<div class="alert is-helpful">

You can run <live-example stackblitz="specs">these sample tests</live-example> in a live coding environment.

The tests described in this guide are in `src/testing/http-client.spec.ts`.
There are also tests of an application data service that call `HttpClient` in `src/app/heroes/heroes.service.spec.ts`.

</div>

## Setup for testing

To begin testing calls to `HttpClient`, import the `HttpClientTestingModule` and the mocking controller, `HttpTestingController`, along with the other symbols your tests require.

<code-example header="app/testing/http-client.spec.ts (imports)" path="http/src/testing/http-client.spec.ts" region="imports"></code-example>

Then add the `HttpClientTestingModule` to the `TestBed` and continue with the setup of the *service-under-test*.

<code-example header="app/testing/http-client.spec.ts(setup)" path="http/src/testing/http-client.spec.ts" region="setup"></code-example>

Now requests made in the course of your tests hit the testing backend instead of the normal backend.

This setup also calls `TestBed.inject()` to inject the `HttpClient` service and the mocking controller so they can be referenced during the tests.

## Expect and answer requests

Now you can write a test that expects a GET Request to occur and provides a mock response.

<code-example header="app/testing/http-client.spec.ts (HttpClient.get)" path="http/src/testing/http-client.spec.ts" region="get-test"></code-example>

The last step, verifying that no requests remain outstanding, is common enough for you to move it into an `afterEach()` step:

<code-example path="http/src/testing/http-client.spec.ts" region="afterEach"></code-example>

### Custom request expectations

If matching by URL isn't sufficient, it's possible to implement your own matching function.
For example, you could look for an outgoing request that has an authorization header:

<code-example path="http/src/testing/http-client.spec.ts" region="predicate"></code-example>

As with the previous `expectOne()`, the test fails if 0 or 2+ requests satisfy this predicate.

### Handle more than one request

If you need to respond to duplicate requests in your test, use the `match()` API instead of `expectOne()`.
It takes the same arguments but returns an array of matching requests.
Once returned, these requests are removed from future matching and you are responsible for flushing and verifying them.

<code-example path="http/src/testing/http-client.spec.ts" region="multi-request"></code-example>

## Test for errors

You should test the app's defenses against HTTP requests that fail.

Call `request.flush()` with an error message, as seen in the following example.

<code-example path="http/src/testing/http-client.spec.ts" region="404"></code-example>

Alternatively, call `request.error()` with a `ProgressEvent`.

<code-example path="http/src/testing/http-client.spec.ts" region="network-error"></code-example>

@reviewed 2022-11-14
