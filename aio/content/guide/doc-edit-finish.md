# Finishing up a documentation pull request

This topic describes the steps to take to keep your workspace tidy after your pull request is merged and closed.

## Update your clone of the upstream repo

Update your clone of the upstream repo to pick up your pull request and all other changes that were merged into `angular/angular` since it was last updated.

<!-- markdownLint-disable MD033 -->

### To update your clone of the upstream repo

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to the clone of the upstream repo.

    <code-example format="shell" language="shell">

    cd angular/angular

    </code-example>

1.  Run this command to check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1.  Run this command to update the `main` branch in the clone on your local computer to sync it with the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git pull

    </code-example>

The `main` branch of the clone on your local computer and the upstream repo on `github.com` are now in sync.

## Review the commit log of the upstream repo

This procedure confirms that your commit is now in the `main` branch of the `angular/angular` repo.

### To review the commit log for your commit

Perform these steps from a command-line tool on your local computer.

1.  In your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to the clone of the upstream repo.

    <code-example format="shell" language="shell">

    cd angular/angular

    </code-example>

1.  Run this command to view the commit log from the `main` branch.

    <code-example format="shell" language="shell">

    git log --pretty=format:"%h %as %an %Cblue%s %Cgreen%D"

    </code-example>

1.  Review the output of the previous `git log` command.
    1.  Find the entry with your GitHub user name, commit message, and pull request number of your commit.
        The commit number might not match the commit from your working branch because of how commits are merged.

    1.  Find the log entry that contains `origin/main`.
    1.  If you see your commit listed after the log entry that contains `origin/main`, your commit has been merged into `angular/angular` and you can continue cleaning up your workspace.
    1.  If you don't see your commit in the list, you might need to wait before you retry this step.
        Do not continue cleaning your workspace until you see your commit listed in or after the log entry that contains `origin/main`.

    1.  If you see your commit listed above the log entry that contains `origin/main`, then you might need to update your clone of the `angular/angular` repo again.

## Update your fork with the upstream repo

After you see that the commit from your pull request has been merged into the `angular/angular` repo, update your fork.

This procedure updates `personal/angular`, the clone of your **fork** of the `angular/angular` repo on your local computer.

### To update your fork with the upstream repo

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working](guide/doc-prepare-to-edit#doc-working-directory) directory.
    Remember to replace `personal` with your GitHub user name.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1. Run this command to update the `main` branch in the `working` directory on your local computer from the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git fetch upstream
    git merge upstream/main

    </code-example>

1.  Run this command to update your `personal/angular` repo on `github.com` with the latest from the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git push

    </code-example>

1. Run this command to review the commit log of your fork.

    The `main` branch on your local computer and your origin repo on `github.com` are now in sync with the upstream `angular/angular` repo.
    Run this command to list the recent commits.

    <code-example format="shell" language="shell">

    git log --pretty=format:"%h %as %an %Cblue%s %Cgreen%D"

    </code-example>

1.  In the output of the previous `git log` command, find the entry with your GitHub user name, commit message, and pull request number of your commit.
    The commit number might not match the commit from your working branch because of how commits are merged.

    You should find the commit from your pull request in or near the log entry that contains `upstream/main`.

If you find the commit from your pull request in the correct place, you can continue to delete your working branch.

## Delete the working branch

After the commit from your pull request is merged into `angular/angular` and appears in the `main` branch of your fork, you can delete the `working` branch.
Because your working branch was merged into the `main` branch of your fork, and the pull request has been closed, you no longer need the `working` branch.
If you never delete your old working branches, your repository ends up with unnecessary clutter.

### To delete your working branch

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working](guide/doc-prepare-to-edit#doc-working-directory) directory.
    Remember to replace `personal` with your GitHub user name.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1.  Run this command to delete the working branch used in the pull request from your local computer.
    Replace `working-branch-name` with the name of your working branch.

    <code-example format="shell" language="shell">

    git branch -d working-branch-name

    </code-example>

1.  Run this command to delete the working branch from your `personal/angular` repo on `github.com`.
    Replace `working-branch-name` with the name of your working branch.

    <code-example format="shell" language="shell">

     git push -d origin working-branch-name

    </code-example>

## Next step

After you delete the working branch for your last issue, you're ready to [select another issue to resolve](guide/doc-select-issue).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-30
