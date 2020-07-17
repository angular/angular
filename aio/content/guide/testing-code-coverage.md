# Generate code coverage reports

To find out how much code you're testing, run the following command in the root of your CLI generated project.

<code-example language="sh" class="code-shell">
  ng test --no-watch --code-coverage
</code-example>

This command compiles the app, runs the tests, and concludes with a summary of how much of the code the tests executed.
The following example is the coverage summary from a minimal app:

```sh
=========================== Coverage summary ========================
Statements   : 100% ( 6/6 )
Branches     : 100% ( 0/0 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 5/5 )
=====================================================================
```

This output means that the tests executed 100% of the code.

In addition to the command line output, this command produces a graphical user interface (GUI) for viewing coverage results.
To view the GUI version, open `coverage/your-project/index.html` in the browser.

In the browser, you can click on the directories and files to see exactly which code the tests executed.

<div class="lightbox">
  <img src="generated/images/guide/testing-code-coverage/code-coverage-browser.png" alt="Browser version of code coverage summary">
</div>

Notice that the summary data for statements, branches, functions, and lines is the same as the CLI output.
However, this UI provides the added advantage of a more granular, sortable view with the ability of inspecting the code line-by-line.

The following image shows that the test suite executed lines 8 and 9 in the `app.component.ts` one and three times respectively.


<div class="lightbox">
  <img src="generated/images/guide/testing-code-coverage/code-coverage-details.png" alt="Browser version of code coverage summary">
</div>

Notice that in this more granular level, that the summary at the top about statements, branches, and so on are in context of this particular file.

## Create code coverage reports automatically

To create code coverage reports every time you test, set the `codeCoverage` option to `true` in the CLI configuration file, `angular.json`:

```
  "test": {
    "options": {
      "codeCoverage": true
    }
  }
```

## Set code coverage minimums

To require a minimum amount of code coverage, add the following to the `coverageIstanbulReporter` key in the [Karma](https://karma-runner.github.io) test platform configuration file, `karma.conf.js`.

<!-- Do we add this or do replace what's already in the default karma.conf.js? -->

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

<!-- What is coverageIstanbulReporter? What's the story behind the unique name? -->

In this example, the `thresholds` property requires that the tests execute a minimum of 80% of the code in your project.
