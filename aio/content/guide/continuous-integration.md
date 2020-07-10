# Setting up continuous integration

Continuous integration (CI) services run your project's tests on every commit and change request, which helps minimize bugs in your project.

You can select one of several CI services.
Popular choices for GitHub users include CircleCI and Travis CI, which are paid services that offer a free option for open source projects.
You can also host your own CI using services such as Jenkins.

The following sections show you how to configure your project to run Circle CI and Travis CI, as well as update your test configuration to run tests in the Chrome browser.

## Configuring Circle CI

1. Create a folder called `.circleci` at the project root.

1. In the new folder, create a file called `config.yml` with the following content:

  ```
  version: 2
  jobs:
    build:
      working_directory: ~/my-project
      docker:
        - image: circleci/node:10-browsers
      steps:
        - checkout
        - restore_cache:
            key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
        - run: npm install
        - save_cache:
            key: my-project-{{ .Branch }}-{{ checksum "package-lock.json" }}
            paths:
              - "node_modules"
        - run: npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI
        - run: npm run e2e -- --protractor-config=e2e/protractor-ci.conf.js
  ```

  This configuration caches `node_modules/` and uses [`npm run`](https://docs.npmjs.com/cli/run-script) to run CLI commands, because `@angular/cli` is not installed globally.
  These commands use the double dash (`--`) to pass arguments into the `npm` script.

1. Commit your changes and push them to your repository on GitHub.

1. [Sign up for Circle CI](https://circleci.com/docs/2.0/first-steps/#section=getting-started) and add your project.
Your project should start building.

For more information, see the [Circle CI documentation](https://circleci.com/docs/2.0/).

## Configuring Travis CI

Travis CI automatically builds and tests the changes you make to your code and lets you know if those changes are successful.

1. Create a file called `.travis.yml` at the project root, with the following content:

  ```
  dist: trusty
  sudo: false

  language: node_js
  node_js:
    - "10"

  addons:
    apt:
      sources:
        - google-chrome
      packages:
        - google-chrome-stable

  cache:
    directories:
       - ./node_modules

  install:
    - npm install

  script:
    - npm run test -- --no-watch --no-progress --browsers=ChromeHeadlessCI
    - npm run e2e -- --protractor-config=e2e/protractor-ci.conf.js
  ```

1. Commit your changes and push them to your repository.

1. [Sign up for Travis CI](https://travis-ci.org) and [add your project](https://travis-ci.org/getting_started).
To trigger a build, push a new commit or use the Travis dashboard UI.

For more information about Travis CI testing, see the [Travis CI documentation](https://docs.travis-ci.com/).

## Configuring the CLI for CI testing in Chrome

You can  adjust your configuration to run the Chrome browser tests when running the Angular CLI commands `ng test` and `ng e2e`.


An Angular project typically contains configuration files for both unit tests (with the [Karma test runner](https://karma-runner.github.io/latest/config/configuration-file.html)) and end-to-end tests (with [Protractor](https://www.protractortest.org/#/api-overview)).
You can control the browser in which your tests run by modifying these files as below. These configurations include the `--headless` flag to run Chrome without bringing up the browser's full user interface.

These examples also use the `--no-sandbox` flag, which
[disables Chrome's sandboxing feature](https://developers.google.com/web/tools/puppeteer/troubleshooting#setting_up_chrome_linux_sandbox). This flag should only be used when testing code that you *completely trust*.
The setup to run headless Chrome with sandboxing enabled will vary based
on your CI environment.

These examples use [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome#cli).

1. In the Karma configuration file, `karma.conf.js`, add a custom launcher called ChromeHeadlessCI below browsers:

  ```
  browsers: ['Chrome'],
  customLaunchers: {
    ChromeHeadlessCI: {
      base: 'ChromeHeadless',
      flags: ['--no-sandbox']
    }
  },
  ```

1. In the root folder of your e2e tests project, create a new file named `protractor-ci.conf.js`. This new file extends the original `protractor.conf.js`.

  ```
  const config = require('./protractor.conf').config;

  config.capabilities = {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--no-sandbox']
    }
  };

  exports.config = config;
  ```

Now you can run the following commands to use the `--no-sandbox` flag:

<code-example language="sh" class="code-shell">
  ng test --no-watch --no-progress --browsers=ChromeHeadlessCI
  ng e2e --protractor-config=e2e/protractor-ci.conf.js
</code-example>

<div class="alert is-helpful">

   **Note:** If you're using Windows, you may want to include the `--disable-gpu` flag. See [crbug.com/737678](https://crbug.com/737678) for more information.

</div>


