# Prepare a documentation update for a pull request

This topic describes how to prepare your update to the Angular documentation so that you can open a pull request.
A pull request is how you share your update in a way that allows it to be merged it into the `angular/angular` repo.

<div class="alert is-important">

**IMPORTANT**: <br />
Make sure that you have reviewed your documentation update, removed any lint errors, and confirmed that it passes the end-to-end \(e2e\) tests without errors.

</div>

A pull request shares a branch in `personal/angular`, your forked repo, with the `angular/angular` repo.
After your pull request is approved and merged, the new commits from your branch are added to the main branch in the `angular/angular` repo.
The commits in your branch, and their messages, become part of the `angular/angular` repo.

What does this mean for your pull request?

1.  Your commit messages become part of the documentation of the changes made to Angular.
    Because they become part of the `angular/angular` repo, they must conform to a specific format so that they are easy to read.
    If they aren't correctly formatted, you can fix that before you open your pull request.

1.  You might need to squash the commits that you made while developing your update.
    It's normal to save your changes as intermediate commits while you're developing a large update, but your pull request represents only one change to the `angular/angular` repo.
    Squashing the commits from your working branch into fewer, or just one commit, makes the commits in your pull request match the changes your update makes to the `angular/angular` repo.

## Format commit messages for a pull request

Commits merged to `angular/angular` must have messages that are correctly formatted.
This section describes how to correctly format commit messages.

Remember that the commit message is different from the pull request comment.

### Single line commit messages

The simplest commit message is a single-line of text.
All commit messages in a pull request that updates documentation must begin with `docs:` and be followed by a short description of the change.

The following is an example a valid Angular commit message.

<code-example language="none" hideCopy>

docs: a short summary in present tense without capitalization or ending period

</code-example>

This is an example of a commit command with the single-line commit message from the previous example.

<code-example format="shell" language="shell">

git commit -m "docs: a short summary in present tense without capitalization or ending period"

</code-example>

### Multi-line commit messages

You can include more information by providing a more detailed, multi-line message.
The detailed body text of the message must be separated by a blank line after the summary.
The footer that lists the issue the commit fixes must also be separated from the body text by a blank line.

<code-example language="none" hideCopy>

docs: a short summary in present tense without capitalization or ending period

A description of what was fixed, and why.
This description can be as detailed as necessary and can be written with
appropriate capitalization and punctuation

Fixes &num;34353

</code-example>

This is an example of a commit command with a multi-line commit message from the previous example.

<code-example format="shell" language="shell">

git commit -m "docs: a short summary in present tense without capitalization or ending period

A description of what was fixed, and why.
This description can be as detailed as necessary and can be
written with appropriate capitalization and punctuation.

Fixes &num;34353"

</code-example>

This example is for documentation updates only.
For the complete specification of Angular commit messages, see [Commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit).

### Change a commit message

If the last commit you made has a message that isn't in the correct format, you can update the message.
Changing the message of an earlier commit or of multiple commits is also possible, but requires a more complex procedure.

Run this command to change the commit message of the most recent commit.
The new commit message is formatted as described in the previous procedures.

<code-example format="shell" language="shell">

git commit --amend -m "New commit message"

</code-example>

This command creates a new commit on your local computer that replaces the previous commit.
You must push this new commit before you open your pull request.
If you pushed the original commit to the repo in your GitHub account, run this command to force-push the commit with the new message.

<code-example format="shell" language="shell">

git push --force-with-lease

</code-example>

If you haven't pushed the commit you amended, you can run `git push` with no parameters to push your updated commit.

## Prepare your branch for a pull request

When you created your working branch to update the documentation, you branched off the `main` branch.
Your changes in the working branch were based on the state of the `main` branch at that time you created the branch.

Since you created your working branch, it's quite likely that the `main` branch has been updated.
To make sure that your updates work with the current `main` branch, you should `rebase` your working branch to catch it up to what is current.
You might also need to squash the commits you made in your working branch to combine them for the pull request.

### Rebase your working branch

<!-- markdownLint-disable MD033 -->

Rebasing your working branch changes the starting point of your commits from where the `main` branch was when you started to where it is now.

Before you can rebase your working branch, you must update both your *clone* and your *fork* of the upstream repo.

#### Why you rebase your working branch

Rebasing your working branch to the current state of the `main` branch eliminates conflicts before your working branch is merged back into `main`.
By rebasing your working branch, the commits in your working branch show only those changes that you made to fix the issue.
If you don't rebase your working branch, it can have merge commits.
Merge commits are commits that `git` creates to make up for the changes in the `main` branch since the `working` branch was created.
Merge commits aren't harmful, but they can complicate a future review of the changes.
The following illustrates the rebase process.

This image shows a `working` branch created from commit 5 of the `main` branch and then updated twice.
The numbered circles in these diagrams represent commits.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of a git repo with a working branch created from a main branch" src="generated/images/guide/doc-pr-prep/feature-with-new-branch.png">

</div>

This image shows the `main` branch after it was updated twice as the `working` branch was updated.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of a git repo with a working branch and an updated main branch" src="generated/images/guide/doc-pr-prep/feature-branch-w-update.png">

</div>

If the working branch was merged, a merge commit would be needed.
This image illustrates the result.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of a git repo with a working branch and merged into the main branch" src="generated/images/guide/doc-pr-prep/feature-branch-w-merge.png">

</div>

To make it easy for future contributors, the Angular team tries to keep the commit log as a linear sequence of changes.
Incorporating merge commits includes changes that are the result of the merge along with what the author or developer changed. This makes it harder for future developers and authors to tell how the content evolved.

To create a linear sequence of changes, you might need to update your `working` branch and update your changes. To add your updates to the current state of the `main` branch and prevent a merge commit, you rebase the `working` branch.

Rebasing is how `git` updates your working branch to make it look like you created it from commit `9`.
To do this, it updates the commits in the `working` branch.
After rebasing the `working` branch, its commits now start from the last commit of the `main` branch.

This image shows the rebased `working` branch with is updated commits.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of a git repo with an updated working branch" src="generated/images/guide/doc-pr-prep/feature-branch-w-rebase.png">

</div>

When the rebased `working` branch is merged to main, its commits can now be appended to the `main` branch with no extra merge commits.

This image shows the linear, `main` branch after merging the updated and rebased `working` branch.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of a git repo with an updated working branch" src="generated/images/guide/doc-pr-prep/feature-branch-merged.png">

</div>

#### To update your fork of the upstream repo

You want to sync the `main` branch of your origin repo with the `main` branch of the upstream `angular/angular` before you open a pull request.

This procedure updates your origin repo, the `personal/angular` repo, on your local computer so it has the current code, as illustrated here.
The circled numbers correspond to procedure steps.
The last step of this procedure then pushes the update to the fork of the `angular` in your GitHub account.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the git fetch/merge/push process used to update the local computer" src="generated/images/guide/doc-pr-prep/github-fetch-merge.png">

</div>

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

1.  Update the `main` branch in the `working` directory on your local computer from the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git fetch upstream
    git merge upstream/main

    </code-example>

1.  Update your `personal/angular` repo on `github.com` with the latest from the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git push

    </code-example>

The `main` branch on your local computer and your origin repo on `github.com` are now in sync.
They have been updated with any changes to the upstream `angular/angular` repo that were made since the last time you updated your fork.

#### To rebase your working branch

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to check out your `working` branch.
    Replace `working-branch` with the name of your `working` branch.

    <code-example format="shell" language="shell">

    git checkout working-branch

    </code-example>

1.  Run this command to rebase your branch to add the commits from your `working` branch to the current content in the `main` branch.

    <code-example format="shell" language="shell">

    git rebase main

    </code-example>

1.  Run this command to update your `working` branch in the repo in your GitHub account.

    <code-example format="shell" language="shell">

    git push --force-with-lease

    </code-example>

### Review the commits in your working branch

After you rebase your `working` branch, your commits should be after those of the current `main` branch.

#### To review the commits that you've added to the `working` branch

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to confirm that you are using the correct `working` branch.
    If you aren't in the correct branch, replace `working-branch` with the name of your `working` branch and run `git checkout working-branch` to select the correct branch.

    <code-example format="shell" language="shell">

    git status

    </code-example>

1.  Review the message from the previous `git status` command.
    If you aren't in the correct branch, replace `working-branch` with the name of your `working` branch and run `git checkout working-branch` to select the correct branch.

1.  Run this command to get a list of the commits in your `working` branch.

    <code-example format="shell" language="shell">

    git log --pretty=format:"%h %as %an %Cblue%s %Cgreen%D"

    </code-example>

    This command returns the log of commits in the `working` branch with the most recent commit at the top of the list.

1.  In the output of the previous `git log` command, find the entry that contains `upstream/main`.
    It should be near the top of the list.

    1.  **Confirm that the entry that contains `upstream/main` also contains `origin/main` and `main`**

        If it doesn't, you must resync your clone and your fork of `angular/angular`, and then rebase the branch before you continue.

    1.  **Confirm that all commits for your update are after the entry that contains `upstream/main`**

        Remember that the log output is displayed with the most recent commit first. Your commits should all be on top of the entry that contains `upstream/main` in the log output.
        If any of your commits are listed after the entry that contains `upstream/main`, somehow your commits in the `working` branch got mixed up. You must fix the branch before you open a pull request.

    1.  **Confirm that your commit messages are in the correct format**

        The commit message format is tested by the automated tests and it must be in the correct format before the pull request can be approved.

    1.  **Confirm that your commits and their messages reflect the changes your update makes to Angular**

        If you have more commits than changes, you might need to squash them into fewer commits before your pull request is approved.

## Next step

After you confirm that your updates and your `working` branch are correct, you are ready to [open a pull request](guide/doc-pr-open).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-10-12
