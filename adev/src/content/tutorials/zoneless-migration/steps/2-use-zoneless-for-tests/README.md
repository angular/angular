# Enable zoneless in your tests

Begin the migration with the tests. This provides actionable results through the
test failures. Enabling zoneless in the tests is also the safest way to
incrementally ensure component compatibility with
`ChangeDetectionStrategy.OnPush`, a requirement in zoneless. You could alternatively
change a component to `ChangeDetectionStrategy.OnPush` and fix any resulting
test failures. However, this change modifies production behavior. If you miss
something, it may result in a production outage.

This step enables zoneless by default for all tests and disables any failing
tests, which will be fixed later.

<hr>

<docs-workflow>

<docs-step title="Enable zoneless for all tests by default">

This tutorial uses the experimental Vitest integration, which includes an option
that adds a set of providers to all tests in the project by default.

In the `options` object within the `angular.json` file, find the test builder
`"builder": "@angular/build:unit-test",`. Add the following `providersFile` entry to the `options` object:

```json
"providersFile": "src/default-test-providers.ts",
```

Open `src/default-test-providers.ts` and add
`provideZonelessChangeDetection()` to the exported array:

```typescript
import {provideZonelessChangeDetection} from '@angular/core';

export default [provideZonelessChangeDetection()];
```

Your project might use a different approach. Common patterns include:

*   A common `TestModule` that you add to the `imports` array of
    `TestBed.configureTestingModule` for every test (or a common providers
    array).
*   For the Karma builder, you can specify a different main entry file than the
    built-in file that the CLI uses (for example, `"main": "test-main.ts"`). In
    this entrypoint, the `initTestEnvironment` call includes a test module with
    common providers for all tests
    ([example](https://github.com/angular/angular/blob/3c9b8d9de5978dad99d49aa0107a70eddc4d1968/adev/test-main.ts#L9-L18)).
    *   You can also initialize the test environment without a separate main
        entry. To do so, call `TestBed.resetTestEnvironment()`, then call
        `TestBed.initTestEnvironment(...)` at the top level of any file that the
        test suite includes.

</docs-step>

<docs-step title="Run the tests and identify failures"> 

With zoneless enabled by default in the test suite, run your tests and identify
any failures:

```shell
ng test
```

One of the two tests in `example.spec.ts` fails. This component is incompatible
with `ChangeDetectionStrategy.OnPush` and therefore doesn't work with zoneless.

</docs-step>

<docs-step title="Re-enable ZoneJS for tests that don't work with zoneless">

Open the `app/example.spec.ts` file. The passing test could continue
to use zoneless change detection. However, add zone-based change detection to all tests in this suite
to quickly resolve failures. In the next step, this guide revisits tests like this to address
each failure individually.

In the `beforeEach` block, add `provideZoneChangeDetection()`—which you import
from `@angular/core`—to the `TestBed` providers:

```typescript
TestBed.configureTestingModule({
  providers: [provideZoneChangeDetection()]
});
```

Run the tests again and verify that they all pass:

```shell
ng test
```

</docs-step>

</docs-workflow>

The following goals have been accomplished:

*   Tests that are incompatible with zoneless have been identified. Ideas for
    necessary fixes are now available.
*   Regressions, or _new_ changes that are incompatible with zoneless, have been
    prevented. New tests are zoneless by default and catch changes that rely on
    ZoneJS.
*   Production code remains unchanged.
