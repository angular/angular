# Find out how much code you're testing

The Angular CLI can run unit tests and create code coverage reports.
Code coverage reports show you any parts of your code base that might not be properly tested by your unit tests.

To generate a coverage report run the following command in the root of your project.

```shell
ng test --no-watch --coverage
```

When the tests are complete, the command creates a new `/coverage` directory in the project.
Open the `index.html` file to see a report with your source code and code coverage values.

If you want to create code-coverage reports every time you test, set the following option in the Angular CLI configuration file, `angular.json`:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
          "options": {
            "coverage": true
          }
        }
      }
    }
  }
}
```

## Code coverage enforcement

The code coverage percentages let you estimate how much of your code is tested.
If your team decides on a set minimum amount to be unit tested, you can enforce this minimum directly in your Angular CLI configuration.

For example, suppose you want the code base to have a minimum of 80% code coverage.
To enable this, open the `angular.json` file and add the `coverageThresholds` option to your test configuration:

```json
{
  "projects": {
    "your-project-name": {
      "architect": {
        "test": {
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

Now, when you run `ng test`, the tool will throw an error if the coverage drops below 80%.
