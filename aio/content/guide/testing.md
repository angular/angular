<a id="top"></a>

{@searchKeywords test testing karma jasmine coverage}

# Testing

Testing your Angular application helps you check that your application is working as you expect.

## Prerequisites

Before writing tests for your Angular application, you should have a basic understanding of the following concepts:

*   [Angular fundamentals](guide/architecture)
*   [JavaScript](https://javascript.info/)
*   HTML
*   CSS
*   [Angular CLI](cli)

The testing documentation offers tips and techniques for unit and integration testing Angular applications through a sample application created with the [Angular CLI](cli).
This sample application is much like the one in the [*Tour of Heroes* tutorial](tutorial/tour-of-heroes).

<div class="alert is-helpful">

If you'd like to experiment with the application that this guide describes, <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

<a id="setup"></a>

## Set up testing

The Angular CLI downloads and installs everything you need to test an Angular application with [Jasmine testing framework](https://jasmine.github.io).

The project you create with the CLI is immediately ready to test.
Just run the [`ng test`](cli/test) CLI command:

<code-example format="shell" language="shell">

ng test

</code-example>

The `ng test` command builds the application in *watch mode*,
and launches the [Karma test runner](https://karma-runner.github.io).

The console output looks the below:

<code-example format="shell" language="shell">

02 11 2022 09:08:28.605:INFO [karma-server]: Karma v6.4.1 server started at http://localhost:9876/
02 11 2022 09:08:28.607:INFO [launcher]: Launching browsers Chrome with concurrency unlimited
02 11 2022 09:08:28.620:INFO [launcher]: Starting browser Chrome
02 11 2022 09:08:31.312:INFO [Chrome]: Connected on socket -LaEYvD2R7MdcS0-AAAB with id 31534482
Chrome: Executed 3 of 3 SUCCESS (0.193 secs / 0.172 secs)
TOTAL: 3 SUCCESS

</code-example>

The last line of the log shows that Karma ran three tests that all passed.

The test output is displayed in the browser using [Karma Jasmine HTML Reporter](https://github.com/dfederm/karma-jasmine-html-reporter).

<div class="lightbox">

<img alt="Jasmine HTML Reporter in the browser" src="generated/images/guide/testing/initial-jasmine-html-reporter.png">

</div>

Click on a test row to re-run just that test or click on a description to re-run the tests in the selected test group \("test suite"\).

Meanwhile, the `ng test` command is watching for changes.

To see this in action, make a small change to `app.component.ts` and save.
The tests run again, the browser refreshes, and the new test results appear.

## Configuration

The Angular CLI takes care of Jasmine and Karma configuration for you. It constructs the full configuration in memory, based on options specified in the `angular.json` file.

If you want to customize Karma, you can create a `karma.conf.js` by running the following command:

<code-example format="shell" language="shell">

ng generate config karma

</code-example>

<div class="alert is-helpful">

Read more about Karma configuration in the [Karma configuration guide](http://karma-runner.github.io/6.4/config/configuration-file.html).

</div>

### Other test frameworks

You can also unit test an Angular application with other testing libraries and test runners.
Each library and runner has its own distinctive installation procedures, configuration, and syntax.

### Test file name and location

Inside the `src/app` folder the Angular CLI generated a test file for the `AppComponent` named `app.component.spec.ts`.

<div class="alert is-important">

The test file extension **must be `.spec.ts`** so that tooling can identify it as a file with tests \(also known as a *spec* file\).

</div>

The `app.component.ts` and `app.component.spec.ts` files are siblings in the same folder.
The root file names \(`app.component`\) are the same for both files.

Adopt these two conventions in your own projects for *every kind* of test file.

<a id="q-spec-file-location"></a>

#### Place your spec file next to the file it tests

It's a good idea to put unit test spec files in the same folder
as the application source code files that they test:

*   Such tests are painless to find
*   You see at a glance if a part of your application lacks tests
*   Nearby tests can reveal how a part works in context
*   When you move the source \(inevitable\), you remember to move the test
*   When you rename the source file \(inevitable\), you remember to rename the test file

<a id="q-specs-in-test-folder"></a>

#### Place your spec files in a test folder

Application integration specs can test the interactions of multiple parts
spread across folders and modules.
They don't really belong to any part in particular, so they don't have a
natural home next to any one file.

It's often better to create an appropriate folder for them in the `tests` directory.

Of course specs that test the test helpers belong in the `test` folder,
next to their corresponding helper files.

<a id="ci"></a>

## Testing in continuous integration

One of the best ways to keep your project bug-free is through a test suite, but you might forget to run tests all the time.

Continuous integration \(CI\) servers let you set up your project repository so that your tests run on every commit and pull request.

To test your Angular CLI application in Continuous integration \(CI\) run the following command:

<code-example format="shell" language="shell">

ng test --no-watch --no-progress

</code-example>


## More information on testing

After you've set up your application for testing, you might find the following testing guides useful.

|                                                                    | Details |
|:---                                                                |:---     |
| [Code coverage](guide/testing-code-coverage)                       | How much of your app your tests are covering and how to specify required amounts. |
| [Testing services](guide/testing-services)                         | How to test the services your application uses.                                   |
| [Basics of testing components](guide/testing-components-basics)    | Basics of testing Angular components.                                             |
| [Component testing scenarios](guide/testing-components-scenarios)  | Various kinds of component testing scenarios and use cases.                       |
| [Testing attribute directives](guide/testing-attribute-directives) | How to test your attribute directives.                                            |
| [Testing pipes](guide/testing-pipes)                               | How to test pipes.                                                                |
| [Debugging tests](guide/test-debugging)                            | Common testing bugs.                                                              |
| [Testing utility APIs](guide/testing-utility-apis)                 | Angular testing features.                                                         |

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-01-17
