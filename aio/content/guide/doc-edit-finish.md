# Finish up a documentation pull request

<!-- markdownLint-disable MD001 -->

This topic describes how to keep your workspace tidy after your pull request is merged and closed.

## Review the commit log of the upstream repo

This procedure confirms that your commit is now in the `main` branch of the `angular/angular` repo.

#### To review the commit log on <code>github.com</code> for your commit

In a web browser, open [`https://https://github.com/angular/angular/commits/main`](https://github.com/angular/angular/commits/main).

1.  Review the commit list.
    1.  Find the entry with your GitHub username, commit message, and pull request number of your commit.
        The commit number might not match the commit from your working branch because of how commits are merged.

    1.  If you see your commit listed, your commit has been merged into `angular/angular` and you can continue cleaning up your workspace.

    1.  If you don't see your commit in the list, you might need to wait before you retry this step.
        Do not continue cleaning your workspace until you see your commit listed in or after the log entry that contains `origin/main`.

    1.  If you see your commit listed above the log entry that contains `origin/main`, then you might need to update your clone of the `angular/angular` repo again.

## Update your fork from the upstream repo

After you see that the commit from your pull request has been merged into the upstream `angular/angular` repo, update your fork.

This procedure updates your clone of `personal/angular` on your local computer and then, the repo in the cloud.

#### To update your fork with the upstream repo

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.

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

1.  In the output of the previous `git log` command, find the entry with your GitHub username, commit message, and pull request number of your commit.
    The commit number might not match the commit from your working branch because of how commits are merged.

    You should find the commit from your pull request in or near the log entry that contains `upstream/main`.

If you find the commit from your pull request in the correct place, you can continue to delete your working branch.

## Delete the working branch

After you confirm that your pull request is merged into `angular/angular` and appears in the `main` branch of your fork, you can delete the `working` branch.

Because your working branch was merged into the `main` branch of your fork, and the pull request has been closed, you no longer need the `working` branch.
It might be tempting to keep it around, just in case, but it is probably not necessary.
If you keep all your old working branches, your repository can collect unnecessary clutter.

#### To delete your working branch

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.

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

@reviewed 2022-10-12
