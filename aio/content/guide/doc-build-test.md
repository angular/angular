# Test a documentation update

<!-- markdownLint-disable MD033 -->

After you have completed your documentation update, you want to run the continuous integration/continuous delivery \(CI/CD\) end-to-end tests on your local computer.
This procedure runs most, but not all, of the tests that are performed after you open a pull request.
It's faster to test your update locally than it is to run them in the GitHub workflow.

## To run the angular.io end-to-end test on your local computer

On your local computer, in a command line tool or the **Terminal** pane of your IDE:

1.  Run this command from your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory to navigate to your [working](guide/doc-prepare-to-edit#doc-working-directory) directory.

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

1.  Run this command to start the end-to-end tests.

    <code-example format="shell" language="shell">

    yarn e2e

    </code-example>

1.  Watch for errors that the test might report.

## No errors reported

If end-to-end tests report no errors and you received the "OK" from your reviewers, your documentation update is ready for a pull request.

Note, that after you open your pull request, GitHub runs the CI/CD tests.
The CI/CD tests that GitHub runs include the end-to-end tests that you just ran and other tests that only run in the GitHub repo.
Because of that, even though your update passed the end-to-end tests locally, your update could still report an error after you open a pull request.

## Errors reported

If the end-to-end tests report an error on your local computer, be sure to correct it before you open a pull request.
If the update fails the end-to-end test locally, it is likely to also fail the CI/CD tests after you open a pull request.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-30
