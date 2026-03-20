# Unit testing

Testing your Angular application helps you check that it is working as you expect. Unit tests are crucial for catching bugs early, ensuring code quality, and facilitating safe refactoring.

NOTE: This guide covers the default testing setup for new Angular CLI projects, which uses Vitest. If you are migrating an existing project from Karma, see the [Migrating from Karma to Vitest guide](guide/testing/migrating-to-vitest). Karma is still supported; for more information, see the [Karma testing guide](guide/testing/karma).

## Set up for testing

The Angular CLI downloads and installs everything you need to test an Angular application with the [Vitest testing framework](https://vitest.dev). New projects include `vitest` and `jsdom` by default.

Vitest runs your unit tests in a Node.js environment. To simulate the browser's DOM, Vitest uses a library called `jsdom`. This allows for faster test execution by avoiding the overhead of launching a browser. You can swap `jsdom` for an alternative like `happy-dom` by installing it and uninstalling `jsdom`. Currently, `jsdom` and `happy-dom` are the supported DOM emulation libraries.

The project you create with the CLI is immediately ready to test. Run the [`ng test`](cli/test) command:

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

The `ng test` command also watches your files for changes. If you modify a file and save it, the tests will run again.

## Configuration

The Angular CLI handles most of the Vitest configuration for you. You can customize the test behavior by modifying the `test` target options in your `angular.json` file.

### Angular.json options

- `include`: Glob patterns for files to include for testing. Defaults to `['**/*.spec.ts', '**/*.test.ts']`.
- `exclude`: Glob patterns for files to exclude from testing.
- `setupFiles`: A list of paths to global setup files (e.g., polyfills or global mocks) that are executed before your tests.
- `providersFile`: The path to a file that exports a default array of Angular providers for the test environment. This is useful for setting up global test providers which are injected into your tests.
- `coverage`: A boolean to enable or disable code coverage reporting. Defaults to `false`.
- `browsers`: An array of browser names to run tests in a real browser (e.g., `["chromium"]`). Requires a browser provider to be installed. See the [Running tests in a browser](#running-tests-in-a-browser) section for more details.

### Global test setup and providers

The `setupFiles` and `providersFile` options are particularly useful for managing global test configuration.

For example, you could create a `src/test-providers.ts` file to provide `provideHttpClientTesting` to all your tests:

```typescript {header: "src/test-providers.ts"}
import {Provider} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

const testProviders: Provider[] = [provideHttpClient(), provideHttpClientTesting()];

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
            "providersFile": "src/test-providers.ts"
          }
        }
      }
    }
  }
}
```

HELPFUL: When creating new TypeScript files for test setup or providers, like `src/test-providers.ts`, ensure they are included in your project's test TypeScript configuration file (typically `tsconfig.spec.json`). This allows the TypeScript compiler to properly process these files during testing.

### Advanced Vitest configuration

For advanced use cases, you can provide a custom Vitest configuration file using the `configFile` option in `angular.json`.

IMPORTANT: While using a custom configuration enables advanced options, the Angular team does not provide support for the contents of the configuration file or for any third-party plugins. The CLI will also override certain properties (`test.projects`, `test.include`) to ensure proper integration.

You can create a Vitest configuration file (e.g., `vitest-base.config.ts`) and reference it in your `angular.json`:

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

HELPFUL: Read more about Vitest configuration in the [official Vitest documentation](https://vitest.dev/config/).

## Code coverage

You can generate a code coverage report by adding the `--coverage` flag to the `ng test` command. The report is generated in the `coverage/` directory.

For more detailed information, see the [Code coverage guide](guide/testing/code-coverage).

## Running tests in a browser

While the default Node.js environment is faster for most unit tests, you can also run your tests in a real browser. This is useful for tests that rely on browser-specific APIs (like rendering) or for debugging.

To run tests in a browser, you must first install a browser provider. Read more about Vitest's browser mode in the [official documentation](https://vitest.dev/guide/browser).

Once the provider is installed, you can run your tests in the browser by configuring the `browsers` option in `angular.json` or by using the `--browsers` CLI flag. Tests run in a headed browser by default. If the `CI` environment variable is set, headless mode is used instead. To explicitly control headless mode, you can suffix the browser name with `Headless` (e.g., `chromiumHeadless`).

```bash
# Example for Playwright (headed)
ng test --browsers=chromium

# Example for Playwright (headless)
ng test --browsers=chromiumHeadless

# Example for WebdriverIO (headed)
ng test --browsers=chrome

# Example for WebdriverIO (headless)
ng test --browsers=chromeHeadless
```

Choose one of the following browser providers based on your needs:

### Playwright

[Playwright](https://playwright.dev/) is a browser automation library that supports Chromium, Firefox, and WebKit.

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

### WebdriverIO

[WebdriverIO](https://webdriver.io/) is a browser and mobile automation test framework that supports Chrome, Firefox, Safari, and Edge.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-webdriverio webdriverio
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-webdriverio webdriverio
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-webdriverio webdriverio
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-webdriverio webdriverio
  </docs-code>
</docs-code-multifile>

### Preview

The `@vitest/browser-preview` provider is designed for Webcontainer environments like StackBlitz and is not intended for use in CI/CD.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-preview
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-preview
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-preview
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-preview
  </docs-code>
</docs-code-multifile>

HELPFUL: For more advanced browser-specific configuration, see the [Advanced Vitest configuration](#advanced-vitest-configuration) section.

## Other test frameworks

You can also unit test an Angular application with other testing libraries and test runners. Each library and runner has its own installation procedures, configuration, and syntax.

## Testing in continuous integration

A robust test suite is a key part of a continuous integration (CI) pipeline. CI servers let you automate your tests to run on every commit and pull request.

To test your Angular application in a CI server, run the standard test command:

```shell
ng test
```

Most CI servers set a `CI=true` environment variable, which `ng test` detects. This automatically configures your tests to run in a non-interactive, single-run mode.

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
