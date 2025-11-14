# Unit testing

Testing your Angular application helps you check that it is working as you expect. Unit tests are crucial for catching bugs early, ensuring code quality, and facilitating safe refactoring.

NOTE: This guide focuses on the default testing setup for new Angular CLI projects. If you are migrating an existing project from Karma to Vitest, see the [Migrating from Karma to Vitest guide](guide/testing/migrating-to-vitest). While Vitest is the default test runner, Karma is still fully supported. For information on testing with Karma, see the [Karma testing guide](guide/testing/karma).

## Set up for testing

The Angular CLI downloads and installs everything you need to test an Angular application with the [Vitest testing framework](https://vitest.dev). By default, new projects include `vitest` and `jsdom`.

Vitest runs your unit tests in a Node.js environment, using `jsdom` to emulate the DOM. This allows for faster test execution by avoiding the overhead of launching a browser. You can also use `happy-dom` as an alternative by installing it and removing `jsdom`. The CLI will automatically detect and use `happy-dom` if it is present.

The project you create with the CLI is immediately ready to test. Just run the [`ng test`](cli/test) CLI command:

```shell
ng test
```

The `ng test` command builds the application in _watch mode_ and launches the [Vitest test runner](https://vitest.dev).

The console output looks like this:

```shell
 ✓ src/app/app.spec.ts (3)
   ✓ AppComponent should create the app
   ✓ AppComponent should have as title 'my-app'
   ✓ AppComponent should render title
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:18:01
   Duration  2.46s (transform 615ms, setup 2ms, collect 2.21s, tests 5ms)
```

The `ng test` command also watches for changes. To see this in action, make a small change to `app.ts` and save it. The tests run again, and the new results appear in the console.

## Configuration

The Angular CLI handles most of the Vitest configuration for you. For many common use cases, you can adjust the test behavior by modifying options directly in your `angular.json` file.

### Built-in configuration options

You can change the following options in the `test` target of your `angular.json` file:

- `include`: Glob patterns for files to include for testing. Defaults to `['**/*.spec.ts', '**/*.test.ts']`.
- `exclude`: Glob patterns for files to exclude from testing.
- `setupFiles`: A list of paths to global setup files (e.g., polyfills or global mocks) that are executed before your tests.
- `providersFile`: The path to a file that exports a default array of Angular providers for the test environment. This is useful for setting up global test providers which are injected into your tests.
- `coverage`: A boolean to enable or disable code coverage reporting. Defaults to `false`.
- `browsers`: An array of browser names to run tests in (e.g., `["chromium"]`). Requires a browser provider to be installed.

For example, you could create a `src/test-providers.ts` file to provide `provideHttpClientTesting` to all your tests:

```typescript
import { Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const testProviders: Provider[] = [
  provideHttpClient(),
  provideHttpClientTesting(),
];

export default testProviders;
```

You would then reference this file in your `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "include": ["src/**/*.spec.ts"],
            "setupFiles": ["src/test-setup.ts"],
            "providersFile": "src/test-providers.ts",
            "coverage": true,
            "browsers": ["chromium"]
          }
        }
      }
    }
  }
}
```

### Advanced: Custom Vitest configuration

For advanced use cases, you can provide a custom Vitest configuration file.

IMPORTANT: While using a custom configuration enables advanced options, the Angular team does not provide direct support for the specific contents of the configuration file or for any third-party plugins used within it. The CLI will also override certain properties (`test.projects`, `test.include`) to ensure proper operation.

You can create a Vitest configuration file (e.g., `vitest-base.config.ts`) and reference it in your `angular.json` using the `runnerConfig` option.

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runnerConfig": "vitest-base.config.ts"
          }
        }
      }
    }
  }
}
```

You can also generate a base configuration file using the CLI:

```shell
ng generate config vitest
```

This creates a `vitest-base.config.ts` file that you can customize.

HELPFUL: Read more about Vitest configuration in the [Vitest configuration guide](https://vitest.dev/config/).

## Code coverage

You can generate code coverage reports by adding the `--coverage` flag to the `ng test` command. The report is generated in the `coverage/` directory.

For more detailed information on prerequisites, enforcing coverage thresholds, and advanced configuration, see the [Code coverage guide](guide/testing/code-coverage).

## Running tests in a browser

While the default Node.js environment is faster for most unit tests, you can also run your tests in a real browser. This is useful for tests that rely on browser-specific APIs (like rendering) or for debugging.

To run tests in a browser, you must first install a browser provider.
Choose one of the following browser providers based on your needs:

- **Playwright**: `@vitest/browser-playwright` for Chromium, Firefox, and WebKit.
- **WebdriverIO**: `@vitest/browser-webdriverio` for Chrome, Firefox, Safari, and Edge.
- **Preview**: `@vitest/browser-preview` for Webcontainer environments (like StackBlitz).

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-playwright playwright
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-playwright playwright
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-playwright playwright
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-playwright playwright
  </docs-code>
</docs-code-multifile>

Once the provider is installed, you can run your tests in the browser using the `--browsers` flag:

```bash
# Example for Playwright
ng test --browsers=chromium

# Example for WebdriverIO
ng test --browsers=chrome
```

Headless mode is enabled automatically if the `CI` environment variable is set. Otherwise, tests will run in a headed browser.

## Other test frameworks

You can also unit test an Angular application with other testing libraries and test runners. Each library and runner has its own distinctive installation procedures, configuration, and syntax.

## Testing in continuous integration

A robust test suite is a key part of a continuous integration (CI) pipeline. CI servers let you set up your project repository so that your tests run on every commit and pull request.

To test your Angular application in a continuous integration (CI) server, you can typically run the standard test command:

```shell
ng test
```

Most CI servers set a `CI=true` environment variable, which `ng test` detects. This automatically runs your tests in the appropriate non-interactive, single-run mode.

If your CI server does not set this variable, or if you need to force single-run mode manually, you can use the `--no-watch` and `--no-progress` flags:

```shell
ng test --no-watch --no-progress
```

## More information on testing

After you've set up your application for testing, you might find the following testing guides useful.

|                                                                    | Details                                                                           |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [Code coverage](guide/testing/code-coverage)                       | How much of your app your tests are covering and how to specify required amounts. |
| [Testing services](guide/testing/services)                         | How to test the services your application uses.                                   |
| [Basics of testing components](guide/testing/components-basics)    | Basics of testing Angular components.                                             |
| [Component testing scenarios](guide/testing/components-scenarios)  | Various kinds of component testing scenarios and use cases.                       |
| [Testing attribute directives](guide/testing/attribute-directives) | How to test your attribute directives.                                            |
| [Testing pipes](guide/testing/pipes)                               | How to test pipes.                                                                |
| [Debugging tests](guide/testing/debugging)                         | Common testing bugs.                                                              |
| [Testing utility APIs](guide/testing/utility-apis)                 | Angular testing features.                                                         |
