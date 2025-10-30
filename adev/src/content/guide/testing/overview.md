# Testing

Testing your Angular application helps you check that your application is working as you expect.

NOTE: While Vitest is the default test runner, Karma is still fully supported. For information on testing with Karma, see the [Karma testing guide](guide/testing/karma).

## Set up testing

The Angular CLI downloads and installs everything you need to test an Angular application with the [Vitest testing framework](https://vitest.dev).

The project you create with the CLI is immediately ready to test.
Just run the [`ng test`](cli/test) CLI command:

```shell

ng test

```

The `ng test` command builds the application in _watch mode_ and launches the [Vitest test runner](https://vitest.dev).

The console output looks like below:

```shell

 ✓ src/app/app.component.spec.ts (3)
   ✓ AppComponent should create the app
   ✓ AppComponent should have as title 'my-app'
   ✓ AppComponent should render title
 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  18:18:01
   Duration  2.46s (transform 615ms, setup 2ms, collect 2.21s, tests 5ms)

```

Meanwhile, the `ng test` command is watching for changes.

To see this in action, make a small change to `app.ts` and save.
The tests run again, and the new test results appear in the console.

## Configuration

The Angular CLI takes care of the Vitest configuration for you. It constructs the full configuration in memory, based on options specified in the `angular.json` file.

If you want to customize Vitest, you can create a `vitest-base.config.ts` by running the following command:

```shell

ng generate config vitest

```

IMPORTANT: Using a custom `vitest-base.config.ts` provides powerful customization options. However, the Angular team does not provide support for the specific contents of this file or for any third-party plugins used within it.

HELPFUL: Read more about Vitest configuration in the [Vitest configuration guide](https://vitest.dev/config/).

### Other test frameworks

You can also unit test an Angular application with other testing libraries and test runners.
Each library and runner has its own distinctive installation procedures, configuration, and syntax.

### Test file name and location

Inside the `src/app` folder the Angular CLI generated a test file for the `App` component named `app.spec.ts`.

IMPORTANT: The test file extension **must be `.spec.ts` or `.test.ts`** so that tooling can identify it as a file with tests \(also known as a _spec_ file\).

The `app.ts` and `app.spec.ts` files are siblings in the same folder.
The root file names \(`app`\) are the same for both files.

Adopt these two conventions in your own projects for _every kind_ of test file.

#### Place your spec file next to the file it tests

It's a good idea to put unit test spec files in the same folder
as the application source code files that they test:

- Such tests are painless to find
- You see at a glance if a part of your application lacks tests
- Nearby tests can reveal how a part works in context
- When you move the source \(inevitable\), you remember to move the test
- When you rename the source file \(inevitable\), you remember to rename the test file

#### Place your spec files in a test folder

Application integration specs can test the interactions of multiple parts
spread across folders and modules.
They don't really belong to any part in particular, so they don't have a
natural home next to any one file.

It's often better to create an appropriate folder for them in the `tests` directory.

Of course specs that test the test helpers belong in the `test` folder,
next to their corresponding helper files.

## Testing in continuous integration

One of the best ways to keep your project bug-free is through a test suite, but you might forget to run tests all the time.

Continuous integration \(CI\) servers let you set up your project repository so that your tests run on every commit and pull request.

To test your Angular application in a continuous integration (CI) server, you can typically run the standard test command:

```shell
ng test
```

Most CI servers set a `CI=true` environment variable, which `ng test` detects. This automatically runs your tests in the appropriate non-interactive, single-run mode.

If your CI server does not set this variable, or if you need to force single-run mode manually, you can use the `--no-watch` and `--no-progress` flags:

```shell
ng test --no-watch --no-progress
```

## More information on testing

After you've set up your application for testing, you might find the following testing guides useful.

|                                                                    | Details                                                                           |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| [Code coverage](guide/testing/code-coverage)                       | How much of your app your tests are covering and how to specify required amounts. |
| [Testing services](guide/testing/services)                         | How to test the services your application uses.                                   |
| [Basics of testing components](guide/testing/components-basics)    | Basics of testing Angular components.                                             |
| [Component testing scenarios](guide/testing/components-scenarios)  | Various kinds of component testing scenarios and use cases.                       |
| [Testing attribute directives](guide/testing/attribute-directives) | How to test your attribute directives.                                            |
| [Testing pipes](guide/testing/pipes)                               | How to test pipes.                                                                |
| [Debugging tests](guide/testing/debugging)                         | Common testing bugs.                                                              |
| [Testing utility APIs](guide/testing/utility-apis)                 | Angular testing features.                                                         |
