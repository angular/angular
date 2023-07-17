# Start to edit a documentation topic

<!-- markdownLint-disable MD001 -->

This topic describes the tasks that you perform when you start to work on a documentation issue.

The documentation in angular.io is built from [markdown](https://en.wikipedia.org/wiki/Markdown) source code files.
The markdown source code files are stored in the `angular` repo that you forked into your GitHub account.

To update the Angular documentation, you need:

*   A clone of `personal/angular`

    You created this when you [created your workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer).
    Before you start editing a topic, [update your clone of `personal/angular`](#update-your-fork-with-the-upstream-repo).

*   A `working` branch that you create from an up-to-date `main` branch.

    Creating your `working` branch is described [later in this topic](#create-a-working-branch-for-editing).

<!-- markdownLint-disable MD033 -->

The procedures in this topic assume that the files on your local computer are organized as illustrated in the following diagram. On your local computer, you should have:

*   Your 'git' workspace directory.
    In this example, the path to your 'git' workspace directory is `github-projects`.

*   Your working directory, which is the directory that you created when you cloned your fork into your `git` workspace.
    In this example, the path to your working directory is `github-projects/personal/angular`, where `personal` is replaced with your GitHub username.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the working directories on a local computer" src="generated/images/guide/doc-update-start/pc-directory-config.png">

</div>

<div class="alert is-important">

**IMPORTANT**: <br />
Remember to replace `personal` with your GitHub username in the commands and examples in this topic.

</div>

The procedures in this topic assume that you are starting from your workspace directory.

## Update your fork with the upstream repo

Before you start editing the documentation files, you want to sync the `main` branch of your fork and its clone with the `main` branch of the upstream `angular/angular` repo.

This procedure updates the your `personal/angular` repo in the cloud and its clone on your local computer, as illustrated here.
The circled numbers correspond to procedure steps.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the git fetch/merge/push process used to update the local computer" src="generated/images/guide/doc-update-start/github-fetch-merge.png">

</div>

#### To update your fork and its clone with the upstream repo

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    This step is not shown in the image.
    Remember to replace `personal` with your GitHub username.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to check out the `main` branch.
    This step is not shown in the image.

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
You create the working branch from the up-to-date `main` branch of `personal/angular` on your local computer.

A working branch keeps your changes to the Angular documentation separate from the published documentation until it is ready.
A working branch also keeps your edits for one issue separate from those of another issue.
Finally, a working branch identifies the changes you made in the pull request that you submit when you're finished.

<div class="alert is-important">

**IMPORTANT**: <br />
Before you edit any Angular documentation, make sure that you are using the correct `working` branch.
You can confirm your current branch by running `git status` from your `working` directory before you start editing.

</div>

#### To create a `working` branch for editing

Perform these steps in a command-line program on your local computer.

1.  [Update your fork of `angular/angular`](#update-your-fork-with-the-upstream-repo).
1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.

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

@reviewed 2022-10-12
