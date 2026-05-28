# End-to-End (E2E) Testing

> [!IMPORTANT]
> Only use the setup guidelines in this file if there is no existing E2E testing framework configured in the workspace, or if the user has explicitly requested to change or set up E2E testing.

## Setting Up and Running E2E Tests

Add supported E2E frameworks to the project using `ng add`:

*   **Cypress:**
    ```shell
    ng add @cypress/schematic
    ```
*   **Playwright:**
    ```shell
    ng add playwright-ng-schematics
    ```
*   **Nightwatch:**
    ```shell
    ng add @nightwatch/schematics
    ```
*   **WebdriverIO:**
    ```shell
    ng add @wdio/schematics
    ```
*   **Puppeteer:**
    ```shell
    ng add @puppeteer/ng-schematics
    ```

Run E2E tests:
```shell
ng e2e [project] [options]
```

### Builder Configuration

E2E runners are configured under the `e2e` target of the application in `angular.json`:
```json
"e2e": {
  "builder": "@cypress/schematic:cypress",
  "options": {
    "devServerTarget": "my-app:serve"
  },
  "configurations": {
    "production": {
      "devServerTarget": "my-app:serve:production"
    }
  }
}
```

## Creating a Custom E2E Builder

For advanced runner integrations (e.g., wrapper execution with custom setup/teardown), implement a custom CLI builder following the [Angular CLI Builder Documentation](https://angular.dev/tools/cli/cli-builder#creating-a-builder).

## Custom & Enterprise Testing Tools

For custom enterprise runners (e.g., Katalon Studio, TestCafe, Selenium), define execution commands in `package.json` scripts.