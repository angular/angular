# Build and test a documentation update

<!-- markdownLint-disable MD001 -->
<!-- markdownLint-disable MD033 -->

After you have completed your documentation update, you want to run the documentation's end-to-end tests on your local computer. These tests are some of the tests that are run after you open a pull request. You can find end-to-end test failures faster when you run them on your local computer than after you open a pull request.

## Build the documentation on your local computer

Before you test your updated documentation, you want to build it to make sure you test your latest changes.

#### To build the documentation on your local computer

<!-- vale Angular.Google_WordListSuggestions = NO -->

Perform these steps from a command-line tool on your local computer or in the **terminal** pane of your IDE.

<!-- vale Angular.Google_WordListSuggestions = YES -->

1. Navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
2. From your working directory, run this command to navigate to the `aio` directory. The `aio` directory contains Angular's documentation files and tools.

    <code-example language="shell">

    cd aio

    </code-example>

3. Run this command to build the documentation locally.

    <code-example language="shell">

    yarn build

    </code-example>

    This builds the documentation from scratch.

After you build the documentation on your local computer, you can run the angular.io end-to-end test.

## Run the angular.io end-to-end test on your local computer

This procedure runs most, but not all, of the tests that are run after you open a pull request.

#### To run the angular.io end-to-end test on your local computer

On your local computer, in a command line tool or the **Terminal** pane of your IDE:

1.  Run this command from your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Replace `working-branch` with the name of your `working` branch and run this command to check out your `working` branch.

    <code-example format="shell" language="shell">

    git checkout working-branch

    </code-example>

1.  Run this command to navigate to the documentation.

    <code-example format="shell" language="shell">

    cd aio

    </code-example>

1.  Run these commands to run the end-to-end tests.

    <code-example format="shell" language="shell">

    yarn e2e
    yarn docs-test

    </code-example>

1.  Watch for errors that the test might report.

## No errors reported

If the end-to-end tests report no errors and your update has passed [all other reviews](guide/doc-editing#test-your-documentation) required,
your documentation update is ready for a pull request.

After you open your pull request, GitHub tests the code in your pull request.
The tests that GitHub runs include the end-to-end tests that you just ran and other tests that only run in the GitHub repo.
Because of that, even though your update passed the end-to-end tests locally, your update could still report an error after you open a pull request.

## Errors reported

If the end-to-end tests report an error on your local computer, be sure to correct it before you open a pull request.
If the update fails the end-to-end test locally, it is likely to also fail the tests that run after you open a pull request.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-10-12
