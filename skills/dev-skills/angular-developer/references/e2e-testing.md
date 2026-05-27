# End-to-End (E2E) Testing

## Set Up E2E Testing

Configure E2E testing in an Angular workspace using the `ng e2e` command. If no E2E target is configured in `angular.json`, running `ng e2e` prompts to choose one of the officially integrated frameworks.

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

## Best Practices

*   **Use Resilient Selectors:** Target dedicated attributes (`data-testid`, `data-cy`, or standard ARIA roles) rather than CSS classes or element tags.
*   **Decouple Tests:** Assert against user-visible UI states, DOM elements, and behaviors rather than component internals or Angular-specific framework state.
*   **Manage Asynchronous Behavior:** Use framework-provided waiting APIs (e.g., waiting for network responses or elements to become visible) instead of arbitrary timeouts/sleeps.
