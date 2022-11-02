<a id="top"></a>

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
This sample application is much like the one in the [*Tour of Heroes* tutorial](tutorial).

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

If you require to fine-tune Karma, follow the below steps:

1. Create a `karma.conf.js` in the root folder of the project.

    <code-example format="javascript" language="javascript" header="karma.conf.js">

    module.exports = function (config) {
      config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
          require('karma-jasmine'),
          require('karma-chrome-launcher'),
          require('karma-jasmine-html-reporter'),
          require('karma-coverage'),
          require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
          jasmine: {
            // you can add configuration options for Jasmine here
            // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
            // for example, you can disable the random execution with `random: false`
            // or set a specific seed with `seed: 4321`
          },
          clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        jasmineHtmlReporter: {
          suppressAll: true // removes the duplicated traces
        },
        coverageReporter: {
          dir: require('path').join(__dirname, './coverage/<project-name>'),
          subdir: '.',
          reporters: [
            { type: 'html' },
            { type: 'text-summary' }
          ]
        },
        reporters: ['progress', 'kjhtml'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        restartOnFileChange: true
      });
    };

    </code-example>

1. In the `angular.json`, use the [`karmaConfig`](cli/test) option to configure the Karma builder to use the created configuration file.

  <code-example format="jsonc" language="jsonc">

  "test": {
    "builder": "@angular-devkit/build-angular:karma",
    "options": {
      "karmaConfig": "karma.conf.js",
      "polyfills": ["zone.js", "zone.js/testing"],
      "tsConfig": "src/tsconfig.spec.json",
      "styles": ["src/styles.css"]
    }
  }

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

## Set up continuous integration

One of the best ways to keep your project bug-free is through a test suite, but you might forget to run tests all the time.
Continuous integration \(CI\) servers let you set up your project repository so that your tests run on every commit and pull request.

There are paid CI services like Circle CI and Travis CI, and you can also host your own for free using Jenkins and others.
Although Circle CI and Travis CI are paid services, they are provided free for open source projects.
You can create a public project on GitHub and add these services without paying.
Contributions to the Angular repository are automatically run through a whole suite of Circle CI tests.

This article explains how to configure your project to run Circle CI and Travis CI, and also update your test configuration to be able to run tests in the Chrome browser in either environment.

### Configure project for Circle CI

1.  Create a folder called `.circleci` at the project root.
1.  In the new folder, create a file called `config.yml` with the following content:

    <code-example format="yaml" language="yaml">

    version: 2
    jobs:
      build:
        working_directory: ~/my-project
        docker:
          &hyphen; image: cimg/node:18.12.0-browsers
        steps:
          &hyphen; checkout
          &hyphen; restore_cache:
              key: my-project-{{ checksum "package-lock.json"}}
          &hyphen; run: npm ci
          &hyphen; save_cache:
              key: my-project-{{ checksum "package-lock.json" }}
              paths:
                &hyphen; $HOME/.npm
          &hyphen; run: npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI

    </code-example>

    This configuration caches `node_modules/` and uses [`npm run`](https://docs.npmjs.com/cli/run-script) to run CLI commands, because `@angular/cli` is not installed globally.
    The double hyphen \(`--`\) characters is needed to pass arguments into the `npm` script.

1.  Commit your changes and push them to your repository.
1.  [Sign up for Circle CI](https://circleci.com/docs/2.0/first-steps) and [add your project](https://circleci.com/add-projects).
    Your project should start building.

    *   Learn more about Circle CI from [Circle CI documentation](https://circleci.com/docs/2.0).

### Configure project for Travis CI

1.  Create a file called `.travis.yml` at the project root, with the following content:

    <code-example format="yaml" language="yaml">

    language: node_js
    node_js:
      &hyphen; "18"

    addons:
      chrome: stable

    cache:
      directories:
         &hyphen; ./node_modules

    install:
      &hyphen; npm install

    script:
      &hyphen; npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI

    </code-example>

    This does the same things as the CircleCI configuration, except that Travis doesn't come with Chrome, so use Chromium instead.

1.  Commit your changes and push them to your repository.
1.  [Sign up for Travis CI](https://travis-ci.org/auth) and [add your project](https://travis-ci.org/profile).
    You'll need to push a new commit to trigger a build.

    *   Learn more about Travis CI testing from [Travis CI documentation](https://docs.travis-ci.com).

### Configure project for GitLab CI

1.  Create a file called `.gitlab-ci.yml` at the project root, with the following content:

    <code-example format="yaml" language="yaml">

    image: node:18.12-stretch
    variables:
      FF_USE_FASTZIP: "true"

    cache:
      untracked: true
      policy: push
      key: &dollar;{CI_COMMIT_SHORT_SHA}
      paths:
        &hyphen; node_modules/

    .pull_cached_node_modules:
      cache:
        untracked: true
        key: &dollar;{CI_COMMIT_SHORT_SHA}
        policy: pull

    stages:
      &hyphen; setup
      &hyphen; test

    install:
      stage: setup
      script:
        &hyphen; npm ci

    test:
      stage: test
      extends: .pull_cached_node_modules
      before_script:
        &hyphen; apt-get update
        &hyphen; wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
        &hyphen; apt install -y ./google-chrome*.deb;
        &hyphen; export CHROME_BIN=/usr/bin/google-chrome
      script:
        &hyphen; npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI

    </code-example>

    This configuration caches `node_modules/` in the `install` job and re-uses the cached `node_modules/` in the `test` job.

1.  [Sign up for GitLab CI](https://gitlab.com/users/sign_in) and [add your project](https://gitlab.com/projects/new).
    You'll need to push a new commit to trigger a build.

1.  Commit your changes and push them to your repository.
    *   Learn more about GitLab CI testing from [GitLab CI/CD documentation](https://docs.gitlab.com/ee/ci).

### Configure project for GitHub Actions

1.  Create a folder called `.github/workflows` at root of your project.
1.  In the new folder, create a file called `main.yml` with the following content:

    <code-example format="yaml" language="yaml">

    name: CI Angular app through GitHub Actions
    on: push
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          &hyphen; uses: actions/checkout&commat;v2
          &hyphen; name: Use Node.js 18.x
            uses: actions/setup-node&commat;v1
            with:
              node-version: 18.x

          &hyphen; name: Setup
            run: npm ci

          &hyphen; name: Test
            run: &verbar;
              npm test -- --no-watch --no-progress --browsers=ChromeHeadlessCI

    </code-example>

1.  [Sign up for GitHub](https://github.com/join) and [add your project](https://github.com/new).
    You'll need to push a new commit to trigger a build.

1.  Commit your changes and push them to your repository.
    *   Learn more about GitHub Actions from [GitHub Actions documentation](https://docs.github.com/en/actions)

### Configure CLI for CI testing in Chrome

While the CLI command `ng test` is generally running the CI tests in your environment, you might still need to adjust your configuration to run the Chrome browser tests.

There is a configuration file for the [Karma JavaScript test runner](https://karma-runner.github.io/latest/config/configuration-file.html), which you must adjust to start Chrome without sandboxing.

We'll be using [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli) in these examples.

*   In the Karma configuration file, `karma.conf.js`, add a custom launcher called `ChromeHeadlessCI` below browsers:

    <code-example format="javascript" language="javascript">

    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox'
        ]
      }
    },

    </code-example>

Now, run the following command to use the `--no-sandbox` flag:

<code-example format="shell" language="shell">

ng test --no-watch --no-progress --browsers=ChromeHeadlessCI

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

@reviewed 2022-11-02
