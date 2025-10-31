# Testing with Karma

While Vitest is the default testing framework for new Angular projects, Karma is still a supported and widely used test runner. This guide provides instructions for testing your Angular application using the Karma and Jasmine testing stack.

## Setting Up and Running Tests

For new projects, you can configure Karma during generation by specifying the `testRunner` option:

<docs-code language="shell">
ng new my-karma-app --test-runner=karma
</docs-code>

If you are adding Karma to an existing project, you must first install the necessary dependencies:

<docs-code-multifile>
  <docs-code header="pnpm" language="shell">
    pnpm add -D karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
  </docs-code>
  <docs-code header="npm" language="shell">
    npm install --save-dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter jasmine-core @types/jasmine
  </docs-code>
</docs-code-multifile>

After installing the packages, update your `tsconfig.spec.json` to include the Jasmine types in the `compilerOptions`. This ensures that TypeScript recognizes the global testing functions like `describe` and `it`.

<docs-code language="json" title="tsconfig.spec.json">
{
  // ...
  "compilerOptions": {
    // ...
    "types": [
      "jasmine"
    ]
  },
  // ...
}
</docs-code>

Once your project is configured, run the tests using the [`ng test`](cli/test) command:

<docs-code language="shell">
ng test --runner=karma
</docs-code>

The `ng test` command builds the application in *watch mode* and launches the [Karma test runner](https://karma-runner.github.io).

The console output looks like below:

<docs-code language="shell">

02 11 2022 09:08:28.605:INFO [karma-server]: Karma v6.4.1 server started at http://localhost:9876/
02 11 2022 09:08:28.607:INFO [launcher]: Launching browsers Chrome with concurrency unlimited
02 11 2022 09:08:28.620:INFO [launcher]: Starting browser Chrome
02 11 2022 09:08:31.312:INFO [Chrome]: Connected on socket -LaEYvD2R7MdcS0-AAAB with id 31534482
Chrome: Executed 3 of 3 SUCCESS (0.193 secs / 0.172 secs)
TOTAL: 3 SUCCESS

</docs-code>

The test output is displayed in the browser using [Karma Jasmine HTML Reporter](https://github.com/dfederm/karma-jasmine-html-reporter).

<img alt="Jasmine HTML Reporter in the browser" src="assets/images/guide/testing/initial-jasmine-html-reporter.png">

Click on a test row to re-run just that test or click on a description to re-run the tests in the selected test group ("test suite").

Meanwhile, the `ng test` command is watching for changes. To see this in action, make a small change to a source file and save. The tests run again, the browser refreshes, and the new test results appear.

## Configuration

The Angular CLI takes care of Jasmine and Karma configuration for you. It constructs the full configuration in memory, based on options specified in the `angular.json` file.

### Customizing Karma Configuration

If you want to customize Karma, you can create a `karma.conf.js` by running the following command:

<docs-code language="shell">

ng generate config karma

</docs-code>

HELPFUL: Read more about Karma configuration in the [Karma configuration guide](http://karma-runner.github.io/6.4/config/configuration-file.html).

### Setting the Test Runner in `angular.json`

To explicitly set Karma as the test runner for your project, locate the `test` target in your `angular.json` file and set the `runner` option to `karma`:

<docs-code language="json" title="angular.json">
{
  // ...
  "projects": {
    "your-project-name": {
      // ...
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "runner": "karma",
            // ... other options
          }
        }
      }
    }
  }
}
</docs-code>

## Code coverage enforcement

To enforce a minimum code coverage level, you can use the `check` property in the `coverageReporter` section of your `karma.conf.js` file.

For example, to require a minimum of 80% coverage:

<docs-code language="javascript">
coverageReporter: {
  dir: require('path').join(__dirname, './coverage/<project-name>'),
  subdir: '.',
  reporters: [
    { type: 'html' },
    { type: 'text-summary' }
  ],
  check: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}
</docs-code>

This will cause the test run to fail if the specified coverage thresholds are not met.

Read more on coverage configuration options in the [karma coverage documentation](https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md).

## Testing in continuous integration

To run your Karma tests in a CI environment, use the following command:

<docs-code language="shell">
ng test --no-watch --no-progress --browsers=ChromeHeadless
</docs-code>
