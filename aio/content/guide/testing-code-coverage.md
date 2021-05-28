{@a code-coverage}

# Find out how much code you're testing

The CLI can run unit tests and create code coverage reports.
Code coverage reports show you any parts of your code base that may not be properly tested by your unit tests.

<div class="alert is-helpful">

  For a hands-on experience you can <live-example name="testing" stackblitz="specs" noDownload>run tests and explore the test code</live-example> in your browser as your read this guide.

  If you'd like to experiment with the application that this guide describes, you can <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>


To generate a coverage report run the following command in the root of your project.

<code-example language="sh">
  ng test --no-watch --code-coverage
</code-example>

When the tests are complete, the command creates a new `/coverage` folder in the project. Open the `index.html` file to see a report with your source code and code coverage values.

If you want to create code-coverage reports every time you test, you can set the following option in the CLI configuration file, `angular.json`:

```
  "test": {
    "options": {
      "codeCoverage": true
    }
  }
```

## Code coverage enforcement

The code coverage percentages let you estimate how much of your code is tested.
If your team decides on a set minimum amount to be unit tested, you can enforce this minimum with the Angular CLI.

For example, suppose you want the code base to have a minimum of 80% code coverage.
To enable this, open the [Karma](https://karma-runner.github.io) test platform configuration file, `karma.conf.js`, and add the `check` property in the `coverageReporter:` key.

```js
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
```

The `check` property causes the tool to enforce a minimum of 80% code coverage when the unit tests are run in the project.

You can find more information about the different coverage configuration options [here](https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md).
