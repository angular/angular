# Experimental unit testing system

The Angular CLI provides an experimental unit test system that can use [Vitest](https://vitest.dev/) as a test runner.

IMPORTANT: This experimental unit testing system requires the use of the `application` build system.
The `application` build system is the default for all newly created projects.

## Set up testing

The Angular CLI includes the test system within a new project but must be configured before it can be used.

The project you create with the CLI is setup to use the `karma` test system by default.
To change to the experimental unit test system, update the `test` target as follows:

<docs-code language="json">
"test": {
  "builder": "@angular/build:unit-test",
  "options": {
    "tsConfig": "tsconfig.spec.json",
    "runner": "vitest",
    "buildTarget": "::development",
  }
}
</docs-code>

The `buildTarget` operates similarly to the option available to the development server.
The `build` target configures build options for the tests.
If the `development` build configuration is missing for a project or you need
different options for testing, you can create and use a `testing` or similarly named build configuration.

To execute the application's testing, just run the [`ng test`](cli/test) CLI command as before:

<docs-code language="shell">

ng test

</docs-code>

The `ng test` command builds the application in *watch mode*, and launches the configured runner.

The console output looks like below:

<docs-code language="shell">
 ✓ spec-app-app.spec.js (2 tests) 31ms
   ✓ App > should create the app 22ms
   ✓ App > should render title 8ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  14:24:15
   Duration  1.16s (transform 628ms, setup 703ms, collect 64ms, tests 31ms, environment 188ms, prepare 33ms)
</docs-code>

Watch mode is enabled by default when using an interactive terminal and not running on CI.

## Configuration

The Angular CLI takes care of the Vitest configuration for you. It constructs the full configuration in memory, based on options specified in the `angular.json` file.
Directly customizing the underlying test runner configuration is currently not supported.

## Bug reports

Report issues and feature requests on [GitHub](https://github.com/angular/angular-cli/issues).

Please provide a minimal reproduction where possible to aid the team in addressing issues.