# Running the Angular docs locally

When contributing to the Angular docs, it is helpful to run the docs locally to check your changes as you work.
This guide walks you through the steps of setting up the [Angular repo](https://github.com/angular/angular) locally for the first time.

## Prerequisites

* You need a [GitHub](https://github.com/join) account and a basic [knowledge of git](https://guides.github.com/introduction/git-handbook/).
  If you use Windows, you may find [Git for Windows](https://gitforwindows.org/)
 helpful.
* Make sure you've read the Angular.io [CONTRIBUTING.md](https://github.com/angular/angular/blob/master/CONTRIBUTING.md).
* Familiarity with the [Angular documentation style guide](guide/docs-style-guide).

<hr />

## Getting your own copy of the repo

The following sections show you how to fork the Angular repo in GitHub, get a local copy  you can work on, and how to build and run the docs app locally.

{@a github}

### In GitHub

The two preliminary steps in this section are in GitHub.
After completing these two steps, continue on to the following section which shows you how to use the terminal to complete your local Angular setup.

1. [Fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) the[angular/angular](https://github.com/angular/angular).
1. In your new fork, click the "Clone or Download" button to expand the Clone functionality and click the copy-to-clipboard icon to copy the URL of your fork.

<div class="lightbox">
  <img src="generated/images/guide/docs-running-locally/how-to-clone-repo.png"
    alt="screenshot of clone button on GitHub">
</div>

### In terminal

Switch to your terminal and take the following steps:

1. Clone your fork: `git clone the-angular-repo-you-want-to-clone`, where `the-angular-repo-you-want-to-clone` is the link you copied in GitHub's ["Clone or Download" dialogue](guide/docs-running-locally#github).
1. Go into the `angular` directory: `cd angular`
1. Checkout a new branch where you'll do your work: `git checkout -b yourname-branch-topic`
1. Go into the `aio` directory: `cd aio`
1. Setup `aio` with `yarn`: `yarn setup`
1. Start the app and watch for changes: `yarn serve-and-sync`
1. Open a second tab or window so you can issue git commands as you work.

<div class="alert is-helpful">

As an alternative to running `yarn serve-and-sync`, you can instead run `yarn start` and `yarn docs-watch` in two separate tabs.

</div>

Note that if you already have yarn running and you switch branches, the yarn processes might break.
In this case, `Ctrl`/`Cmd`+`C` and rerun the `yarn` command(s).

### In the browser

If the above steps were successful, you should be able to view your local copy of the docs in your browser.

1. Go to [localhost:4200](http://localhost:4200).

## Where the docs are

Many of the docs on [angular.io](https://www.angular.io) have an _Edit_, and often _View source_, icon at the top right, which opens the file on GitHub.
The path in the repo on GitHub is the same as the path in your local clone and shows you where that file resides.

Groups of docs&mdash;such as the guides or example apps&mdash;share particular locations within the Angular repo.
The following table shows the location of docs by type.


<table>

  <tr>
    <th>Type of doc</th>
    <th>Location</th>
  </tr>
  <tr>
    <td>Guides</td>
    <td><code>aio/content/guide</code></td>
  </tr>
  <tr>
    <td>Getting Started</td>
    <td><code>aio/content/start</code></td>
  </tr>
  <tr>
    <td>Tutorial (Tour of Heroes)</td>
    <td><code>aio/content/tutorial</code></td>
  </tr>
  <tr>
    <td>Example apps</td>
    <td><code>aio/content/examples</code></td>
  </tr>
  <tr>
    <td>API docs</td>
    <td>Go to the API doc in question on angular.io and look near the top in the table to find the source. That's the file you edit in the API docs.</td>
  </tr>

</table>

## Getting your work on GitHub

After working and saving in your editor, go back to the tab/window you opened in terminal for issuing git commands to add, commit, and push with the following git commands:

1. To stage your work: `git add --all`
1. To commit your work:

  ```shell
  git commit -m "docs: the-edits-you-are-adding

  In the body of the commit message, explain why you are making the edits and what they are. This body needs to be at least 100 characters and have a new blank line before and after it.

  "
  ```

  You must commit before you can push up to GitHub.
  If you're fixing a known issue, be sure to [reference it in your commit message](guide/docs-running-locally#fixes-issue).
1. Push your work up to GitHub: `git push`

If this is the first time you're pushing your branch, your branch doesn't exist yet in your fork, so when you try to push, git responds with a message like this:

<code-example language="sh">

fatal: The current branch &lt;your-branch&gt; has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin &lt;your-branch&gt;

</code-example>

In this case, use the command git provides and enter it at the command line, replacing `your-branch` with the name of the branch you're using:

<code-example language="sh">

git push --set-upstream origin &lt;your-branch&gt;

</code-example>


<!-- move this up -->

{@a configuring-remotes}

### Configuring your remote URLs

This section walks you through configuring your git remotes so that you have an `upstream` that points to the Angular repo on GitHub and an `origin` that points to your fork.

To see your remotes, run the following at the command line.

<code-example language="sh">

git remote --v

</code-example>

If the output is as follows, you can skip this section.

<code-example language="sh">

  origin	https://github.com/your-github-name/angular.git (fetch)
  origin	https://github.com/your-github-name/angular.git (push)
  upstream	https://github.com/angular/angular.git (fetch)
  upstream	https://github.com/angular/angular.git (push)

</code-example>

If you don't have an `upstream`, add it with the following command.

<code-example language="sh">

git remote add upstream https://github.com/angular/angular.git

</code-example>

This adds the angular repo as an upstream for your local clone.
With this remote, you can easily keep your clone in sync with the `angular/angular` repo on GitHub by [rebasing](guide/docs-running-locally#how-to-rebase).

Confirm the new remote by running `git remote --v` again.

{@a fixes-issue}

## Referencing an issue in your commit message

If you're fixing an issue, add the issue number preceded by the word `Fixes` so GitHub closes the issue automatically on merge as follows:

<code-example language="sh">

docs: fix typo in hierarchical injectors doc

Fixes #90453. This PR fixes a typo in the introductory section of the hierarchical injectors doc in which Angular was lowercase but should be uppercase.

</code-example>

Here, `#90453`&mdash;with a leading `#` sign&mdash;is the issue number you're fixing.
For alternative keywords to automatically close issues, see [Linking a pull request to an issue using a keyword](https://help.github.com/en/github/managing-your-work-on-github/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword).

For more information on Angular commit messages, see the [Commit messages guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit).

{@a how-to-rebase}

## How to rebase

Rebasing is a technique for getting the latest changes from `upstream`  `master` onto your GitHub fork and into your branch/PR.

Rebasing keeps your copy of the repo up-to-date as more PRs merge into the Angular repo.

To rebase, take the following steps at the command line:

1. On your `master` branch: `git pull upstream master`
1. Still on `master`: `git push origin master`
  This makes your fork's `master` branch on GitHub even with the `master` branch on `angular/angular`.
1. Checkout your feature branch. For example, assume you have a branch called `docs-fix`.
  This means your command to checkout your branch would be: `git checkout docs-fix`
1. On the `docs-fix` branch rebase on `master`: `git rebase master`
1. Push up to GitHub: `git push --force-with-lease`.
  You will need to force-push every time you have pulled changes from the `upstream` `master`.

<div class="alert is-helpful">

Your upstream should be https://github.com/angular/angular.git, which you can see with a `git remote --v`.
For more detail, see [Configuring your remote URLs](guide/docs-running-locally#configuring-remotes).

</div>

## How to squash

When you have multiple commits but want all the changes in one commit, use the `git rebase` command to _squash_ your commits.

The whole command in this workflow is `git rebase -i HEAD~#`.
The `-i` flag means the process runs interactively, that is, it requires input from you in order to complete.
The next part of the command, `HEAD~#`, tells git how many commits you want to include in the squash.

The steps are as follows.

1. On your feature branch: `git rebase -i HEAD~#` where `#` is how many commits you want to squash.
For example, if you have 3 commits to squash into one, the command would be `git rebase -i HEAD~3`.
1. Your default editor opens with a list of your commits at the top.
By default, the word `pick` precedes each commit.
Keep the first commit by leaving the word `pick`.
On the commits you want to squash, replace the word `pick` with `fixup` or `f`.
For example, in the following three commits, the first is "picked" and the second and third are "fixed up".
This means that git will incorporate the second and third commits into the first.

  <code-example language="sh">
  pick 741a0aaf33 docs: fix typo in deployment guide
  fixup 8f3d24ad22 docs: add team member comments
  fixup e37a3d73b1 docs: update example code docregion
  </code-example>

1. Save and exit your editor.
To double check you've squashed correctly, do a `git log` or `git log --oneline` to see the commit log.
Your fixed up commits should no longer be in the list and the commit you picked should be the only one left of your commits on the feature branch.
Though you now only have one commit, that one remaining commit includes all of the work from the squashed, or fixed up, commits.

For more information on interactive mode, see the [Interactive mode section](https://git-scm.com/docs/git-rebase#_interactive_mode) of the [Git rebase](https://git-scm.com/docs/git-rebase) documentation at [git-scm.com](https://git-scm.com/docs).

## How to amend a commit

Amend a commit when you want to change the commit message.

1. On your feature branch: `git commit --amend`
1. Your default editor opens.
  Change your commit message.
  Save and close.
  For more information on the editor git uses, see [Configuring a git editor](#configuring-git-editor).
1. Back at the command line, run `git log` or `git log --oneline` to confirm that your commit message is as you intend.
1. Push up to GitHub: `git push --force-with-lease`.

{@a configuring-git-editor}

### Configuring a git editor

Git infers your default system editor by looking at the `VISUAL` and `EDITOR` environment variables.
In the event you haven't configured an editor, git uses the default of `vi`, a terminal-based editor.
Other popular editors include [nano](https://www.nano-editor.org/), and [Visual Studio Code](https://code.visualstudio.com), but you can use the editor of your choice.

To specify the editor you want to use for git, see the [editor configuration](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration#:~:text=core.editor) section of [The Pro Git Book](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration).

If you'd like to use Visual Studio Code as your default git editor, you must first configure Visual Studio Code to start from the command line.
See [Launching from from the command line](https://code.visualstudio.com/docs/setumac#_launching-from-the-command-line) in the  Visual Studio Code documentation.

## Removing irrelevant commits from your PR

If you have rebased using git's `merge` command only to find that there are irrelevant commits in your PR, try the following `git rebase` workflow.

Before proceding, since your branch is in an undesirable state, consider backing up your work.
Copy and paste it somewhere outside of your project so that when `git` does its work it doesn't overwrite your back up.
Though you could retrieve anything that you have committed, making a back up outside of your project is acceptable, especially if git isn't a regular part of your workflow.

<div class="alert is-helpful">

These instructions assume that your `origin` points to your fork of Angular and your `upstream` points to `angular/angular`.

For more detail on `origin` and `upstream`, see [Configuring your remote URLs](guide/docs-running-locally#configuring-remotes).

</div>

1. On `master`&mdash;**not your messed up branch**: `git pull upstream master`
1. On `master`, to make your fork's `master` branch on GitHub even with the `master` branch on `angular/angular`: `git push origin master`
1. Checkout the messed up branch: `git checkout your-messed-up-branch`
1. **On your messed up branch:** `git rebase origin/master`
1. If you now do a `git log` or `git log --oneline`, you should see that you're only ahead of master by your commits on this branch.
  For example, if you had three commits on your feature branch, you should see now that you are three commits ahead of `master`.

Now you can `git push --force-with-lease`.
After pushing, check your PR to see how many commits you have now and that your work remained in your PR.
If the irrelevant commits are still there, file a [docs issue on GitHub](https://github.com/angular/angular/issues/new/choose).
