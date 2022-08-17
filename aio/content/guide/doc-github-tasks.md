# Common GitHub tasks to edit angular.io

<!-- markdownLint-disable MD001 -->
<!-- markdownLint-disable MD033 -->

These are some of the common `git` tasks that you perform while editing Angular documentation.

The procedures in this topic assume that the files on your local computer are organized as illustrated in the following diagram.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the working directories on a local computer" src="generated/images/guide/doc-github-tasks/pc-directory-config.png">

</div>

<div class="alert is-important">

**IMPORTANT**: <br />
Remember to replace `personal` with your GitHub username in the commands and examples in this topic.

</div>

*   The procedures assume that your working directories are in a single `workspace` directory such that
    *   The local `working` directory of the upstream repo, `angular/angular` is in the `angular` subdirectory of the `angular` subdirectory of the `workspace` directory
    *   The local `working` directory of the origin repo, `personal/angular` is in the `angular` subdirectory of the `personal` subdirectory of the `workspace` directory
*   The procedures assume that you are starting from your `workspace` directory

## Update your clone of the upstream repo

The upstream repo is the `angular/angular` repo.
As it is updated, such as by merging pull requests, your clone falls behind.
To keep your clone of `angular/angular` up-to-date, you want to follow this procedure daily.

This procedure updates your **clone** of the `angular/angular` repo on your local computer so it has the current code, as illustrated here.
The circled number correspond to the procedure step.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the git pull process used to update the local computer" src="generated/images/guide/doc-github-tasks/github-sync-upstream.png">

</div>

#### To update your clone of the upstream repo

1.  From your `workspace` directory, navigate to the `working` directory of the upstream repo.

    <code-example format="shell" language="shell">

    cd angular/angular

    </code-example>

1.  Check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1.  Update the `main` branch in the `working` directory on your local computer with any changes in the upstream `angular/angular` repo.

    <code-example format="shell" language="shell">

    git pull

    </code-example>

The `main` branch of the clone on your local computer and the upstream repo on `github.com` are now in sync.
Now would be a good time to update your fork as well.

## Update your fork with the upstream repo

You want to sync the `main` branch of your fork with the `main` branch of the upstream, `angular/angular` repo at least daily.
This is good thing to do at the beginning of each day.
Sync your fork after you update your clone of the upstream repo and before you start working on the Angular documentation.

This procedure updates your **fork** of the `angular/angular` repo on your local computer so it has the current code, as illustrated here.
The circled numbers correspond to procedure steps.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the git fetch/merge/push process used to update the local computer" src="generated/images/guide/doc-github-tasks/github-fetch-merge.png">

</div>

#### To update your fork with the upstream repo

1.  From your workspace directory, navigate to your working directory.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Check out the `main` branch.

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

The `main` branch on your local computer and your *origin* repo on `github.com` are now in sync.
They have been updated with any changes to the upstream `angular/angular` repo that were made since the last time you updated your fork.

## Create a working branch for editing

Almost all your editing on the Angular documentation is done:

*   In the clone of your fork of `angular/angular`, not in your clone of `angular/angular`
*   In a `working` or `feature` branch made from the `main` branch

If this isn't clear, see [More about branches](#more-about-branches).

Before you start editing the Angular documentation, you want to:

1.  [Update your clone of `angular/angular`](#update-your-clone-of-the-upstream-repo).
1.  [Update your fork of `angular/angular`](#update-your-fork-with-the-upstream-repo).
1.  Create a working branch from the `main` branch.

A working branch gives you a way to keep track of the changes that you make to the Angular documentation.
You also need a separate branch to submit those changes in a pull request.
Creating a working branch also keeps your changes for one update separate from those of another.

<div class="alert is-informational">

**NOTE**: <br />
Before you edit Angular documentation, make sure that you are using the correct `working` branch.
You can confirm your current branch by running `git status` from your `working` directory before you start editing.

</div>

#### To create a `working` branch for editing

1.  [Update your clone of `angular/angular`](#update-your-clone-of-the-upstream-repo).
1.  [Update your fork of `angular/angular`](#update-your-fork-with-the-upstream-repo).
1.  From your `workspace` directory, navigate to your `working` directory.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Check out the `main` branch.

    <code-example format="shell" language="shell">

    git checkout main

    </code-example>

1.  Create your new branch.
    Replace `new-branch` with the name of your new branch.

    Name the branch something that relates to your editing task, for example, if you are resolving `issue #12345`, you might name the branch, `issue-12345`.
    If you are improving error messages, you might name it, `error-message-improvements`.
    A branch name can have alphanumeric characters, hyphens, underscores, and slashes, but it can't have any spaces or other special characters.

    <code-example format="shell" language="shell">

    git checkout -b new-branch

    </code-example>

1.  Push the new branch to your repo on `github.com` so you have a copy of it in the cloud.
    Remember to replace `new-branch` with the name of your new branch.

    <code-example format="shell" language="shell">

    git push --set-upstream origin new-branch

    </code-example>

## Save your changes

This section describes how to save the changes you make to files in the working directory of your fork of the Angular repo.
If you are new to using git and GitHub, review this section carefully to understand how to save your changes as you make them.

As you make changes to files in the working directory of your fork of the Angular repo, your changes can be:

* **Made but not saved**

    This is the state of your changes as you edit a file in your integrated development environment \(IDE\).
    This is the state of your changes as you're making them in your IDE.

* **Saved but not committed**

    After you save changes to a file from the IDE, they are saved to your local computer.
    While the changes have been saved, they have not been recorded as a change by `git`, the version control software.
    Your files are typically in this state as you review your work in progress.

* **Committed but not pushed**

    After you commit your changes to `git`, your changes are recorded as a *commit* on your local computer, but they are not saved in the cloud.
    This is the state of your files when you've reached a milestone and save your progress locally.

* **Committed and pushed**

    After you push your commits to your personal repo in `github.com`, your changes have been recorded by `git` and saved to the cloud. They are not yet part of the `angular/angular` repo.
    This is the state your files need to be in before you can open a pull request for it to become part of the `angular/angular` repo.

* **Merged into Angular**

    After your pull request is approved and merged, the changes you made are now part of the `angular/angular` repo.

### Save your changes to your local computer

How to save changes to a file on your local computer is determined by your IDE.
Refer to your IDE for the specific procedure of saving changes.

### Commit your changes on your local computer

Follow this procedure after you save changes on your local computer and you are ready to commit changes to `git` on your local computer.

#### To commit your changes on your local computer

1.  From your workspace directory, navigate to your working directory.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Confirm you are using the correct branch.
    If you aren't in the correct branch, run `git checkout branch-name` to select the correct branch.

    <code-example format="shell" language="shell">

    git status

    </code-example>

1.  Review the list of files to add to the commit is correct.

    <code-example format="shell" language="shell">

    git status

    </code-example>

1.  Add the files you want to commit.

    <code-example format="shell" language="shell">

    git add filename

    </code-example>

    You can add multiple files in a single command by using wildcard characters in the filename parameter.
    You can also add all changed files that are already being tracked by `git` to the commit by using `--all` option as this example shows.

    <code-example format="shell" language="shell">

    git add --all

    </code-example>

1.  Commit the changes to the local computer.
    Replace `detailed-commit-comment` with a specific comment that describes the changes you made.

    <code-example format="shell" language="shell">

    git commit -m 'docs: detailed-commit-comment'

    </code-example>

### Push your changes to your GitHub account in the cloud

After you have committed changes to your local computer, this procedure saves your commits to your GitHub account in the cloud.

#### To push your changes to your GitHub account in the cloud

1.  From your `workspace` directory, navigate to your `working` directory.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Confirm you are using the correct branch.
    If you aren't in the correct branch, run `git checkout branch-name` to select the correct branch.

    <code-example format="shell" language="shell">

    git status

    </code-example>

1.  Push the commits on your local computer to your account on GitHub in the cloud.

    <code-example format="shell" language="shell">

    git push

    </code-example>

    If this is the first time you've pushed commits from the branch, you can see a message such as this.

    <code-example format="shell" language="shell">

    fatal: The current branch my-new-branch has no upstream branch.
    To push the current branch and set the remote as upstream, use

        git push --set-upstream origin my-new-branch

    To have this happen automatically for branches without a tracking
    upstream, see 'push.autoSetupRemote' in 'git help config'.

    </code-example>

    If you get this message, copy the command that the message provides and run it as shown here:

    <code-example format="shell" language="shell">

    git push --set-upstream origin my-new-branch

    </code-example>

### Open pull requests to merge a change into `angular/angular`

For information about preparing your changes to open a pull request, see [Preparing documentation for a pull request](guide/doc-pr-prep).

## Keep your branch up-to-date

If your changes to the documentation take more than a day, the `angular/angular` repo can change while you're editing.
Before you can merge your changes, they must be made on top of the current code.
You must update your working branch after you've made all your changes and before you open a pull request.
You might also want to keep your working branch updated as you're editing.
Either way, the procedure to update your branch is the same.

#### To keep your branch up-to-date

1.  [Update your clone of `angular/angular`](#update-your-clone-of-the-upstream-repo).
1.  [Update your fork of `angular/angular`](#update-your-fork-with-the-upstream-repo).
1.  From your workspace directory, navigate to your working directory.

    <code-example format="shell" language="shell">

    cd personal/angular

    </code-example>

1.  Confirm that you are using the correct branch.
    If you aren't in the correct branch, run `git checkout branch-name` to select the correct branch.

    <code-example format="shell" language="shell">

    git status

    </code-example>

    If you have any un-commited changes, [Commit your changes on your local computer](#commit-your-changes-on-your-local-computer) before you continue.

1.  Rebase your branch to add the changes in your branch to the current content in the `main` branch.

    <code-example format="shell" language="shell">

    git rebase main

    </code-example>

1.  Update the branch in your repo in the cloud.

    <code-example format="shell" language="shell">

    git push --force-with-lease

    </code-example>

## More about branches

`git` is a version control system that tracks the changes made to the files in a repo.
It does this by maintaining a lists of changes called `commits`.
A commit is a list of all the things that changed in a repo since the last commit.

### What are branches

A `branch` is a list of commits.
The `main` branch is the list of commits that reflects the current state of the project.

When a repo is created, the first commit is usually to the `main` branch and contains the files used in the creation of the repo.
The change list in that commit contains the names and the contents of the files that were added to create the repo.

The next time files in the repo are added or changed, another commit is created to describe what has changed.

After a five commits, the `main` branch can be imagined as the following diagram.
The diagram shows a series of changes that are recorded as commits, each represented as a circle and identified by a unique number.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="A row of circles, each numbered 1 through 5 and connected by a horizontal line" src="generated/images/guide/doc-github-tasks/main-branch.png">

</div>

In this example, the result of all the changes in commits one through five is the current state of the repo.

### Creating a working branch

In `angular/angular`, the `main` branch contains all the changes that have been made to the Angular project since it began to get it to where it is today.
The list of commits in the `main` branch have all been reviewed and tested.

When you update the documentation, you might need to make several changes before have exactly what you want.
You don't want to open a pull request to merge your changes into `main` until you have had a chance to test and review them.

To do this you create a new `working` branch in which to work.
This example names the new `working` branch.

<code-example format="shell" language="shell">

&num; From the working directory of your personal/angular repo
git checkout main;        &num; start from the main branch
git checkout -b working;  &num; create a new branch named "working"

</code-example>

The `working` branch starts with all the changes that have already been made in the `main` branch.
From this, you can make your own changes.
After making two commits in the `working` branch, the branches in the repo can be imagined as this illustration.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="A row of circles, each numbered 3 through 5 connected by a horizontal line with a line coming vertically out of circle 5 to create a branch" src="generated/images/guide/doc-github-tasks/feature-with-new-branch.png">

</div>

### Merging your work into the main branch

If the changes you made in the two commits from the previous section have what you want to use.
That is, you have reviewed and tested those changes.
You can open a pull request to merge those new changes into the `main` branch.

If no changes have been made to the `main` branch since you created your branch, the merge is called `fast-forwarding`.
In a `fast-forward` merge the two commits you added to the `working` branch are added to the `main` branch.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="A row of circles, each numbered 3 through 7 connected by a horizontal line with a line coming vertically out of circle 5 to create a branch" src="generated/images/guide/doc-github-tasks/feature-branch-ff.png">

</div>

After the `working` branch has been merged with the `main` branch, the `main` branch now includes the two commits you made in the `working` branch.
Because both branches include commits 1-7, they now have the same content.

### Merging your work into a changed main branch

Being able to `fast-foward` a merge is simple.
Unfortunately, in a repo like `angular/angular` that has many contributors, the main branch is changing frequently.
A more likely scenario is illustrated here, where the `main` branch changed while you're working on your changes in the `working` branch.
The resulting branches could be imagined as the following illustration.
While you were working on commits six and seven, others had contributed commits eight and nine.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="A row of circles, each numbered 3 through 9 connected by a horizontal line with a line coming vertically out of circle 5 to create a branch" src="generated/images/guide/doc-github-tasks/feature-branch-w-update.png">

</div>

The commits six and seven can't be used to fast-forward.
Remember that a commit is a list of changes.
Commit six is the list of changes from commit five plus the first edit you made.
Commit seven is the list of changes from your commit six plus the changes you made in response to your review comments.
In any case, the commits from your `working` branch can't be added to the commit nine in the main branch.
The commits from the `working` branch don't include the changes from commits eight and nine, so they could be lost.

You cam choose to merge the changes in the two branches or to rebase the commits in your `working` branch.
Merging creates a `merge` commit to reconcile the changes necessary to represent the net result of both branches.
While merging isn't bad, it makes it hard to undo the individual changes.

@reviewed 2022-09-30
