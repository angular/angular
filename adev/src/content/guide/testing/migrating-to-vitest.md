# Migrating from Karma to Vitest

The Angular CLI uses [Vitest](https://vitest.dev/) as the default unit test runner for new projects. This guide provides instructions for migrating an existing project from Karma and Jasmine to Vitest.

IMPORTANT: Migrating an existing project to Vitest is considered experimental. This process also requires the use of the `application` build system, which is the default for all newly created projects.

## Manual migration steps

Before using the automated refactoring schematic, you must manually update your project to use the Vitest test runner.

### 1. Install dependencies

Install `vitest` and a DOM emulation library. While browser testing is still possible (see [step 5](#5-configure-browser-mode-optional)), Vitest uses a DOM emulation library by default to simulate a browser environment within Node.js for faster test execution. The CLI automatically detects and uses `happy-dom` if it's installed; otherwise, it falls back to `jsdom`. You must have one of these packages installed.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev vitest jsdom
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev vitest jsdom
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D vitest jsdom
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev vitest jsdom
  </docs-code>
</docs-code-multifile>

### 2. Update `angular.json`

In your `angular.json` file, find the `test` target for your project and change the `builder` to `@angular/build:unit-test`.

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
  }
}
```

The `unit-test` builder defaults to `"tsConfig": "tsconfig.spec.json"` and `"buildTarget": "::development"`. You can explicitly set these options if your project requires different values. For example, if the `development` build configuration is missing or you need different options for testing, you can create and use a `testing` or similarly named build configuration for `buildTarget`.

The `@angular/build:karma` builder previously allowed build options (like `polyfills`, `assets`, or `styles`) to be configured directly within the `test` target. The new `@angular/build:unit-test` builder does not support this. If your test-specific build options differ from your existing `development` build configuration, you must move them to a dedicated build target configuration. If your test build options already match your `development` build configuration, no action is needed.

### 3. Handle custom `karma.conf.js` configurations

Custom configurations in `karma.conf.js` are not automatically migrated. Before deleting your `karma.conf.js` file, review it for any custom settings that need to be migrated.

Many Karma options have equivalents in Vitest that can be set in a custom Vitest configuration file (e.g., `vitest.config.ts`) and linked to your `angular.json` via the `runnerConfig` option.

Common migration paths include:

- **Reporters**: Karma reporters must be replaced with Vitest-compatible reporters. These can often be configured directly in your `angular.json` under the `test.options.reporters` property. For more advanced configurations, use a custom `vitest.config.ts` file.
- **Plugins**: Karma plugins may have Vitest equivalents that you will need to find and install. Note that code coverage is a first-class feature in the Angular CLI and can be enabled with `ng test --coverage`.
- **Custom Browser Launchers**: These are replaced by the `browsers` option in `angular.json` and the installation of a browser provider like `@vitest/browser-playwright`.

For other settings, consult the official [Vitest documentation](https://vitest.dev/config/).

### 4. Remove Karma and `test.ts` files

You can now delete `karma.conf.js` and `src/test.ts` from your project and uninstall the Karma-related packages. The following commands are based on the packages installed in a new Angular CLI project; your project may have other Karma-related packages to remove.

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm uninstall karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
  <docs-code header="bun" language="shell">
    bun remove karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
  </docs-code>
</docs-code-multifile>

### 5. Configure browser mode (optional)

If you need to run tests in a real browser, you must install a browser provider and configure your `angular.json`.

**Install a browser provider:**

Choose one of the following browser providers based on your needs:

- **Playwright**: `@vitest/browser-playwright` for Chromium, Firefox, and WebKit.
- **WebdriverIO**: `@vitest/browser-webdriverio` for Chrome, Firefox, Safari, and Edge.
- **Preview**: `@vitest/browser-preview` for Webcontainer environments (like StackBlitz).

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/browser-playwright
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/browser-playwright
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/browser-playwright
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/browser-playwright
  </docs-code>
</docs-code-multifile>

**Update `angular.json` for browser mode:**

Add the `browsers` option to your `test` target's options. The browser name depends on the provider you installed (e.g., `chromium` for Playwright, `chrome` for WebdriverIO).

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "browsers": ["chromium"]
          }
        }
      }
    }
  }
}
```

Headless mode is enabled automatically if the `CI` environment variable is set or if a browser name includes "Headless" (e.g., `ChromeHeadless`). Otherwise, tests will run in a headed browser.

NOTE: Debugging with `ng test --debug` is not supported by browser mode.

## Automated test refactoring with schematics

IMPORTANT: The `refactor-jasmine-vitest` schematic is experimental and may not cover all possible test patterns. Always review the changes made by the schematic.

The Angular CLI provides the `refactor-jasmine-vitest` schematic to automatically refactor your Jasmine tests to use Vitest.

### Overview

The schematic automates the following transformations in your test files (`.spec.ts`):

- Converts `fit` and `fdescribe` to `it.only` and `describe.only`.
- Converts `xit` and `xdescribe` to `it.skip` and `describe.skip`.
- Converts `spyOn` calls to the equivalent `vi.spyOn`.
- Replaces `jasmine.objectContaining` with `expect.objectContaining`.
- Replaces `jasmine.any` with `expect.any`.
- Replaces `jasmine.createSpy` with `vi.fn`.
- Updates `beforeAll`, `beforeEach`, `afterAll`, and `afterEach` to their Vitest equivalents.
- Converts `fail()` to Vitest's `vi.fail()`.
- Adjusts expectations to match Vitest APIs
- Adds TODO comments for code that cannot be automatically converted

The schematic **does not** perform the following actions:

- It does not install `vitest` or other related dependencies.
- It does not change your `angular.json` to use the Vitest builder or migrate any build options (like `polyfills` or `styles`) from the `test` target.
- It does not remove `karma.conf.js` or `test.ts` files.
- It does not handle complex or nested spy scenarios, which may require manual refactoring.

### Running the schematic

Once your project is configured for Vitest, you can run the schematic to refactor your test files.

To refactor **all** test files in your default project, run:

```bash
ng g @schematics/angular:refactor-jasmine-vitest
```

### Options

You can use the following options to customize the schematic's behavior:

| Option                   | Description                                                                                         |
| :----------------------- | :-------------------------------------------------------------------------------------------------- |
| `--project <name>`       | Specify the project to refactor in a multi-project workspace. <br> Example: `--project=my-lib`      |
| `--include <path>`       | Refactor only a specific file or directory. <br> Example: `--include=src/app/app.component.spec.ts` |
| `--file-suffix <suffix>` | Specify a different file suffix for test files. <br> Example: `--file-suffix=.test.ts`              |
| `--add-imports`          | Add explicit `vitest` imports if you have disabled globals in your Vitest configuration.            |
| `--verbose`              | See detailed logging of all transformations applied.                                                |
| `--browser-mode`         | If you intend to run the tests in browser mode.                                                     |

### After migrating

After the schematic completes, it's a good practice to:

1.  **Run your tests**: Execute `ng test` to ensure that all tests still pass after the refactoring.
2.  **Review the changes**: Look over the changes made by the schematic, paying close attention to any complex tests, especially those with intricate spies or mocks, as they may require further manual adjustments.

The `ng test` command builds the application in _watch mode_ and launches the configured runner. Watch mode is enabled by default when using an interactive terminal and not running on CI.

## Configuration

The Angular CLI takes care of the Vitest configuration for you, constructing the full configuration in memory based on options in `angular.json`.

### Custom Vitest configuration

IMPORTANT: While using a custom configuration enables advanced options, the Angular team does not provide direct support for the specific contents of the configuration file or for any third-party plugins used within it. The CLI will also override certain properties (`test.projects`, `test.include`) to ensure proper operation.

You can provide a custom Vitest configuration file to override the default settings. For a full list of available options, see the official [Vitest documentation](https://vitest.dev/config/).

**1. Direct path:**
Provide a direct path to a Vitest configuration file in your `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {"runnerConfig": "vitest.config.ts"}
        }
      }
    }
  }
}
```

**2. Automatic search for base configuration:**
If you set `runnerConfig` to `true`, the builder will automatically search for a shared `vitest-base.config.*` file in your project and workspace roots.

## `zone.js` based helpers are not supported

The zone.js patches are not applied when running tests with Vitest, there for you won't be able use functions like `fakeAsync`, `flush` or `waitForAsync`.
To migrate to Vitest you will also need to migrate your tests to native async and Vitest fake timers. See [an example here](/guide/testing/components-scenarios#async-test-with-a-vitest-fake-timers) for fake timers usages with Vitest.

## Bug reports

Report issues and feature requests on [GitHub](https://github.com/angular/angular-cli/issues).

Please provide a minimal reproduction where possible to aid the team in addressing issues.
