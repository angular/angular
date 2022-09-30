# Start to edit a documentation topic

This topic describes the tasks that you perform when you start to work on a documentation issue.

The documentation in angular.io is built from [markdown](https://en.wikipedia.org/wiki/Markdown) source code files.
The markdown source code files are stored in the `angular` repo that you forked into your GitHub account.
To keep track of the changes that you make as you update a topic, you must first perform these `git` tasks before you start.

All edits that you make to the Angular documentation are made:

*   In the clone of `personal/angular`, not in your clone of `angular/angular`
*   In a `working` branch that you create from the `main` branch

Before you start editing the Angular documentation, you want to:

1.  [Update your clone of `angular/angular`](#update-your-clone-of-the-upstream-repo).
1.  [Update `personal/angular`, your fork of `angular/angular`](#update-your-fork-with-the-upstream-repo).
1.  Create a working branch from the `main` branch.

<!-- markdownLint-disable MD033 -->

The procedures in this topic assume that the files on your local computer are organized as illustrated in the following diagram.

<div class="lightbox">

<img alt="An image of the working directories on a personal computer" src="generated/images/guide/doc-update-start/pc-directory-config-img.png">

</div>

<div class="alert is-important">

**IMPORTANT**: <br />
Remember to replace `personal` with your GitHub user name in the commands and examples in this topic.

</div>

*   These procedures assume that you have a single `workspace` directory such that:
    *   The local clone of the upstream repo, `angular/angular`, is in the `angular` subdirectory of the `angular` subdirectory of the workspace directory.
    *   The local clone of the origin repo, `personal/angular`, is in the `angular` subdirectory of the `personal` subdirectory of the workspace directory.
        This is your `working` directory while you edit the documentation.

*   The procedures assume that you are starting from your workspace directory.

## Update your clone of the upstream repo

The upstream repo is the `angular/angular` repo.
As it is updated, your clone of that repo on your local computer falls out of sync.
Before you start updating a topic, you want your clone of `angular/angular` to be in sync and up-to-date.

This procedure updates your **clone** of the `angular/angular` repo on your local computer so it is in sync with the current code, as illustrated here.
The circled number in the illustration corresponds to the procedure step.

<div class="lightbox">

<img alt="An image of the git pull process used to update the local computer" src="generated/images/guide/doc-update-start/github-sync-upstream.png">

</div>

### To update your clone of the upstream repo

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace directory](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer), run this command to navigate to the clone of the upstream repo.

    <code-example format="shell" language="shell">

    cd angular/angular

    </code-example>

1.  Run this command to check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1.  Run this command to update the `main` branch in the [working directory](guide/doc-prepare-to-edit#doc-working-directory) on your local computer with any changes in the upstream, `angular/angular` repo.

    <code-example format="shell" language="shell">

    git pull

    </code-example>

The `main` branch of the clone on your local computer and the upstream repo on `github.com` are now in sync.

## Update your fork with the upstream repo

After you update your clone of the upstream repo, you can update your fork and its clone.

You want to sync the `main` branch of your fork with the `main` branch of the upstream `angular/angular` repo before you create any new working branches.

This procedure updates the clone of your `personal/angular` fork on your local computer, as illustrated here.
The circled numbers correspond to procedure steps.

<div class="lightbox">

<img alt="An image of the git fetch/merge/push process used to update the local computer" src="generated/images/guide/doc-update-start/github-fetch-merge.png">

</div>

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

1.  Run this command to update the `main` branch in the working directory on your local computer from the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git fetch upstream
    git merge upstream/main

    </code-example>

1.  Run this command to update your `personal/angular` repo on `github.com` with the latest from the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git push

    </code-example>

The `main` branch on your local computer is now in sync with your origin repo on `github.com`.
They have been updated with any changes that have been made to the upstream `angular/angular` repo since the last time you updated your fork.

## Create a working branch for editing

All your edits to the Angular documentation are made in a `working` branch in the clone of `personal/angular` on your local computer.
You create the working branch from the `main` branch of `personal/angular` on your local computer that you just synced with `angular/angular`.

A working branch keeps your changes to the Angular documentation separate from the published documentation until it is ready.
A working branch also keeps your edits for one issue separate from those of another issue.
Finally, a working branch identifies the changes you made in the pull request that you submit when you're finished.

<div class="alert is-important">

**IMPORTANT**: <br />
Before you edit Angular documentation, make sure that you are using the correct `working` branch.
You can confirm your current branch by running `git status` from your `working` directory before you start editing.

</div>

### To create a `working` branch for editing

Perform these steps in a command-line program on your local computer.

1.  Make sure the clones on your local computer are up to date.
    1.  [Update your clone of `angular/angular`](#update-your-clone-of-the-upstream-repo).
    1.  [Update your fork of `angular/angular`](#update-your-fork-with-the-upstream-repo).
1.  From your [workspace directory](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer), run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub user name.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1.  Run this command to create your working branch.
    Replace `working-branch` with the name of your working branch.

    Name your working branch something that relates to your editing task, for example, if you are resolving `issue #12345`, you might name the branch, `issue-12345`.
    If you are improving error messages, you might name it, `error-message-improvements`.
    A branch name can have alphanumeric characters, hyphens, underscores, and slashes, but it can't have any spaces or other special characters.

    <code-example format="shell" language="shell">

    git checkout -b working-branch

    </code-example>

1.  Run this command to make a copy of your working branch in your repo on `github.com` in the cloud.
    Remember to replace `working-branch` with the name of your working branch.

    <code-example format="shell" language="shell">

    git push --set-upstream origin working-branch

    </code-example>

## Edit the documentation

After you create a working branch, you're ready to start editing and creating topics.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-30
