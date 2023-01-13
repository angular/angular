<a id="code-coverage"></a>

# Find out how much code you're testing

The Angular CLI can run unit tests and create code coverage reports.
Code coverage reports show you any parts of your code base that might not be properly tested by your unit tests.

<div class="alert is-helpful">

If you'd like to experiment with the application that this guide describes, <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

To generate a coverage report run the following command in the root of your project.

<code-example format="shell" language="shell">

ng test --no-watch --code-coverage

</code-example>

When the tests are complete, the command creates a new `/coverage` directory in the project.
Open the `index.html` file to see a report with your source code and code coverage values.

If you want to create code-coverage reports every time you test, set the following option in the Angular CLI configuration file, `angular.json`:

<code-example format="json" language="json">

"test": {
  "options": {
    "codeCoverage": true
  }
}

</code-example>

## Code coverage enforcement

The code coverage percentages let you estimate how much of your code is tested.
If your team decides on a set minimum amount to be unit tested, enforce this minimum with the Angular CLI.

For example, suppose you want the code base to have a minimum of 80% code coverage.
To enable this, open the [Karma](https://karma-runner.github.io) test platform configuration file, `karma.conf.js`, and add the `check` property in the `coverageReporter:` key.

<code-example format="javascript" language="javascript">

coverageReporter: {
  dir: require('path').join(__dirname, './coverage/&lt;project-name&gt;'),
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

</code-example>


<div class="alert is-helpful">

Read more about creating and fine tunning Karma configuration in the [testing guide](guide/testing#configuration).

</div>


The `check` property causes the tool to enforce a minimum of 80% code coverage when the unit tests are run in the project.

Read more on coverage configuration options in the [karma coverage documentation](https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-01-17
