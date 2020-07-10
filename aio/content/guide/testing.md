# Testing your application

The Angular CLI downloads and installs everything you need to test an Angular application with the [Jasmine test framework](https://jasmine.github.io/).

To test an Angular CLI project, run the [`ng test`](cli/test) command:

<code-example language="sh" class="code-shell">
  ng test
</code-example>

The `ng test` command builds the app in watch mode and launches the [Karma test runner](https://karma-runner.github.io).

The console output is similar to the following:

<code-example language="sh" class="code-shell">
10% building modules 1/1 modules 0 active
...INFO [karma]: Karma v1.7.1 server started at http://0.0.0.0:9876/
...INFO [launcher]: Launching browser Chrome ...
...INFO [launcher]: Starting browser Chrome
...INFO [Chrome ...]: Connected on socket ...
Chrome ...: Executed 3 of 3 SUCCESS (0.135 secs / 0.205 secs)
</code-example>

The last line of the log shows that Karma ran three tests that your app passed each one.

A Chrome browser also opens and displays the test output in the "Jasmine HTML Reporter" as in the following image.

<div class="lightbox">
  <img src='generated/images/guide/testing/initial-jasmine-html-reporter.png' alt="Jasmine HTML Reporter in the browser">
</div>

You can click on a test row to re-run that individual test.
You can also click on a description to re-run the tests in that test group, or "test suite".

The `ng test` command watches for changes.
This means that when you make a change and save, the tests run again, the browser refreshes, and the new test results appear.

## Editing the testing configuration

The CLI sets up a default testing configuration for Jasmine and Karma.
You can edit many testing options by editing the `karma.conf.js` and the `test.ts` files in the `src/` folder.

The `karma.conf.js` file is a partial Karma configuration file.
The CLI constructs the full runtime configuration in memory, based on the application structure as described by the `angular.json` and `karma.conf.js` configuration files.

<div class="callout is-helpful">

<header>Using other test frameworks</header>

By default, Angular CLI uses the Jasmine test framework and the Karma test runner.
While this guide only covers this default setup, you can change your project to use other test frameworks and test runners.

</div>

{@a test-name-location}

## Finding test files

The CLI includes test files when it generates a new Angular application.
The testing framework identifies test files, or "spec" files, by the extension `spec.ts`.
By convention, the spec files for each component are in the same directory as that component.

For example, the CLI gives the `app.component` spec file the extension `.spec.ts` and places this `app.component.spec.ts` in the `src/app` folder with the `AppComponent`.

The component definition file is `app.component.ts`, and the corresponding test file is `app.component.spec.ts`.

The testing framework does not require that a test be in the same directory as its corresponding component.
However, this convention makes tests easy to find, helps reveal how a component works in context, and reminds you to include the tests when moving or renaming parts of your application.

<hr />

## What's next

For more on testing, you may find the following testing guides helpful.

* [Basics of testing components](guide/testing-components-basics)&mdash;discover the basics of testing Angular components.
* [Component testing scenarios](guide/testing-components-scenarios)&mdash;read about the various kinds of component testing scenarios and use cases.
* [Testing attribute directives](guide/testing-attribute-directives)&mdash;learn about how to test your attribute directives.
* [Testing pipes](guide/testing-pipes)&mdash;find out how to test attribute directives.
* [Testing services](guide/testing-services)&mdash;learn how to test the services your app uses.
* [Debugging tests](guide/testing-attribute-directives)&mdash;uncover common testing bugs.
* [Code coverage](guide/testing-code-coverage)&mdash;find out how much of your app your tests are covering and how to specify required amounts.
* [Testing utility APIs](guide/testing-utility-apis)&mdash;get familiar with Angular testing features.
* [Setting up continuous integration tutorial](guide/continuous-integration)&mdash;see how to set up Circle CI, Travis CI, and how to configure the Angular CLI for for CI testing in Chrome.
