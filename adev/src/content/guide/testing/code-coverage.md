# Code coverage

Code coverage reports show you any parts of your code base that might not be properly tested by your unit tests.

## Prerequisites

To generate code coverage reports with Vitest, you must install the `@vitest/coverage-v8` package:

<docs-code-multifile>
  <docs-code header="npm" language="shell">
    npm install --save-dev @vitest/coverage-v8
  </docs-code>
  <docs-code header="yarn" language="shell">
    yarn add --dev @vitest/coverage-v8
  </docs-code>
  <docs-code header="pnpm" language="shell">
    pnpm add -D @vitest/coverage-v8
  </docs-code>
  <docs-code header="bun" language="shell">
    bun add --dev @vitest/coverage-v8
  </docs-code>
</docs-code-multifile>

## Generating a report

To generate a coverage report, add the `--coverage` flag to the `ng test` command:

```shell
ng test --coverage
```

After the tests run, the command creates a new `coverage/` directory in the project. Open the `index.html` file to see a report with your source code and code coverage values.

If you want to create code-coverage reports every time you test, you can set the `coverage` option to `true` in your `angular.json` file:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true
          }
        }
      }
    }
  }
}
```

## Enforcing code coverage thresholds

The code coverage percentages let you estimate how much of your code is tested. If your team decides on a minimum amount to be unit tested, you can enforce this minimum in your configuration.

For example, suppose you want the code base to have a minimum of 80% code coverage. To enable this, add the `coverageThresholds` option to your `angular.json` file:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageThresholds": {
              "statements": 80,
              "branches": 80,
              "functions": 80,
              "lines": 80
            }
          }
        }
      }
    }
  }
}
```

Now, if your coverage drops below 80% when you run your tests, the command will fail.

## Advanced configuration

You can configure several other coverage options in your `angular.json` file:

- `coverageInclude`: Glob patterns of files to include in the coverage report.
- `coverageReporters`: An array of reporters to use (e.g., `html`, `lcov`, `json`).
- `coverageWatermarks`: An object specifying `[low, high]` watermarks for the HTML reporter, which can affect the color-coding of the report.

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "builder": "@angular/build:unit-test",
          "options": {
            "coverage": true,
            "coverageReporters": ["html", "lcov"],
            "coverageWatermarks": {
              "statements": [50, 80],
              "branches": [50, 80],
              "functions": [50, 80],
              "lines": [50, 80]
            }
          }
        }
      }
    }
  }
}
```
