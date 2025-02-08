# End to End Testing

End-to-end or (E2E) testing is a form of testing used to assert your entire application works as expected from start to finish or _"end-to-end"_. E2E testing differs from unit testing in that it is completely decoupled from the underlying implementation details of your code. It is typically used to validate an application in a way that mimics the way a user would interact with it. This page serves as a guide to getting started with end-to-end testing in Angular using the Angular CLI.

## Set Up E2E Testing

The Angular CLI downloads and installs everything you need to run end-to-end tests for your Angular application.

<docs-code language="shell">

ng e2e

</docs-code>

The `ng e2e` command will first check your project for the "e2e" target. If it can't locate it, the CLI will then prompt you which e2e package you would like to use and walk you through the setup.

<docs-code language="shell">

Cannot find "e2e" target for the specified project.
You can add a package that implements these capabilities.

For example:
Cypress: ng add @cypress/schematic
Nightwatch: ng add @nightwatch/schematics
WebdriverIO: ng add @wdio/schematics
Playwright: ng add playwright-ng-schematics
Puppeteer: ng add @puppeteer/ng-schematics

Would you like to add a package with "e2e" capabilities now?
No
❯ Cypress
Nightwatch
WebdriverIO
Playwright
Puppeteer

</docs-code>

If you don't find the test runner you would like to use from the list above, you can manually add a package using `ng add`.

## Running E2E Tests

Now that your application is configured for end-to-end testing we can now run the same command to execute your tests.

<docs-code language="shell">

ng e2e

</docs-code>

Note, their isn't anything "special" about running your tests with any of the integrated e2e packages. The `ng e2e` command is really just running the `e2e` builder under the hood. You can always [create your own custom builder](tools/cli/cli-builder#creating-a-builder) named `e2e` and run it using `ng e2e`.

## More information on end-to-end testing tools

| Testing Tool | Details                                                                                                              |
| :----------- | :------------------------------------------------------------------------------------------------------------------- |
| Cypress      | [Getting started with Cypress](https://docs.cypress.io/guides/end-to-end-testing/writing-your-first-end-to-end-test) |
| Nightwatch   | [Getting started with Nightwatch](https://nightwatchjs.org/guide/writing-tests/introduction.html)                    |
| WebdriverIO  | [Getting started with Webdriver.io](https://webdriver.io/docs/gettingstarted)                                        |
| Playwright   | [Getting started with Playwright](https://playwright.dev/docs/writing-tests)                                         |
| Puppeteer    | [Getting started with Puppeteer](https://pptr.dev)                                                                   |
