# Make and save changes to a documentation topic

<!-- markdownLint-disable MD001 -->
<!-- markdownLint-disable MD033 -->

This topic describes tasks that you perform while making changes to the documentation.

<div class="alert is-important">

**IMPORTANT**: <br />
Only perform these tasks after you have created a working branch in which to work as described in [Create a working branch for editing](guide/doc-update-start#create-a-working-branch-for-editing).

</div>

## Work in the correct working branch

Before you change any files, make sure that you are working in the correct working branch.

#### To set the correct working branch for editing

Perform these steps from a command-line tool on your local computer.

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.
  
    <code-example language="shell">

    cd personal/angular

    </code-example>

1.  Run this command to check out your working branch.
    Replace `working-branch` with the name of the branch that you created for the documentation issue.

    <code-example language="shell">

    git checkout working-branch

    </code-example>

## Edit the documentation

Review the [Angular documentation style guide](guide/styleguide) before you start editing to understand how to write and format the text in the documentation.

In your working branch, edit the files that need to be changed. Most documentation source files are found in the `aio/content/guide` directory of the `angular` repo.

Angular development tools can render the documentation as you make your changes.

#### To view the rendered documentation while you are editing

<!-- vale Angular.Google_WordListSuggestions = NO -->

Perform these steps from a command-line tool on your local computer or in the **terminal** pane of your IDE.

<!-- vale Angular.Google_WordListSuggestions = YES -->

1.  Navigate to your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
1.  From your working directory, run this command to navigate to the `aio` directory. The `aio` directory contains Angular's documentation files and tools.

    <code-example language="shell">

    cd aio

    </code-example>

1.  Run this command to build the documentation locally.

    <code-example language="shell">

    yarn build

    </code-example>

    This builds the documentation from scratch, but does not serve it.

1.  Run this command to serve and sync the documentation.

    <code-example language="shell">

    yarn start

    </code-example>

    This serves your draft of the angular.io website locally at `http://localhost:4200` and watches for changes to documentation files.
    Each time you save an update to a documentation file, the angular.io website at `http://localhost:4200` is updated.
    You might need to refresh your browser to see the changes after you save them.

### Documentation linting

If you installed Vale on your local computer and your IDE, each time you save a markdown file, Vale reviews it for common errors.
Vale, the documentation linter, reports the errors it finds in the **Problems** pane of Visual Studio Code.
The errors are also reflected in the documentation source code, as close to the problem as possible.

For more information about documentation linting and resolving lint problems, see [Resolve documentation linter messages](guide/docs-lint-errors).

## Save your changes

As you make changes to the documentation source files on your local computer, your changes can be in one of these states.

*  **Made, but not saved**

    This is the state of your changes as you edit a file in your integrated development environment (IDE).

*  **Saved, but not committed**

    After you save changes to a file from the IDE, they are saved to your local computer.
    While the changes have been saved, they have not been recorded as a change by `git`, the version control software.
    Your files are typically in this state as you review your work in progress.

*  **Committed, but not pushed**

    After you commit your changes to `git`, your changes are recorded as a *commit* on your local computer, but they are not saved in the cloud.
    This is the state of your files when you've made some progress and you want to save that progress as a commit.

*  **Committed and pushed**

    After you push your commits to your personal repo in `github.com`, your changes are recorded by `git` and saved to the cloud.
    They are not yet part of the `angular/angular` repo.
    This is the state your files must be in before you can open a pull request for them to become part of the `angular/angular` repo.

*  **Merged into Angular**

    After your pull request is approved and merged, the changes you made are now part of the `angular/angular` repo and appear in the [angular.io](https://angular.io) web site.
    Your documentation update is complete.

This section describes how to save the changes you make to files in your working directory.
If you are new to using `git` and GitHub, review this section carefully to understand how to save your changes as you make them.

### Save your changes to your local computer

How to save changes that you make to a file on your local computer is determined by your IDE.
Refer to your IDE for the specific procedure of saving changes.
This process makes your changes *saved, but not committed*.

### Review your rendered topics

After you save changes to a documentation topic, and before you commit those changes on your local computer, review the rendered topic in a browser.

#### To render your changes in a browser on your local computer

<!-- vale Angular.Google_WordListSuggestions = NO -->

Perform these steps from a command-line tool on your local computer or in the **terminal** pane of your IDE.

<!-- vale Angular.Google_WordListSuggestions = YES -->

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to the `aio` directory in your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
Remember to replace `personal` with your GitHub username.

    <code-example language="shell">

    cd personal/angular/aio

    </code-example>

1.  Run this command to build the documentation using the files on your local computer.

    <code-example language="shell">

    yarn build

    </code-example>

    This command builds the documentation from scratch, but does not serve it for viewing.

1.  Run this command to serve the documentation locally and rebuild it after it changes.

    <code-example language="shell">

    yarn start

    </code-example>

    This command serves the Angular documentation at [`http://localhost:4200`](http://localhost:4200).
    You might need to refresh the browser after the documentation is updated to see the changes in your browser.

After you are satisfied with the changes, commit them on your local computer.

### Commit your changes on your local computer

Perform this procedure after you save the changes on your local computer and you are ready to commit changes on your local computer.

#### To commit your changes on your local computer

<!-- vale Angular.Google_WordListSuggestions = NO -->

Perform these steps from a command-line tool on your local computer or in the **terminal** pane of your IDE.

<!-- vale Angular.Google_WordListSuggestions = YES -->

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to the `aio` directory in your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.
  
    <code-example language="shell">

    cd personal/angular/aio

    </code-example>

1.  Run this command to confirm that you are ready to commit your changes.

    <code-example language="shell">

    git status

    </code-example>

    The `git status` command returns an output like this.

    <!-- Formatting this example as output hides the <file> text. -->
    <code-example language="none" hideCopy>

    On branch working-branch
    Your branch is up to date with 'origin/working-branch
    Changes not staged for commit:
      (use "git add &lt;file&gt;..." to update what will be committed)
      (use "git restore &lt;file&gt;..." to discard changes in working directory)
            modified:   content/guide/doc-build-test.md
            modified:   content/guide/doc-edit-finish.md
            modified:   content/guide/doc-editing.md
            modified:   content/guide/doc-pr-prep.md
            modified:   content/guide/doc-pr-update.md
            modified:   content/guide/doc-prepare-to-edit.md
            modified:   content/guide/doc-select-issue.md
            modified:   content/guide/doc-update-start.md

    no changes added to commit (use "git add" and/or "git commit -a")

    </code-example>

    1.  Confirm that you in the correct working branch.

        If you are not in the correct branch, replace `working-branch` with the name of your working branch and then run `git checkout working-branch` to select the correct branch.

    1.  Review the  modified files in the list.
        Confirm that they are those that you have changed and saved, but not committed.
        The list of modified files varies, depending on what you have edited.

1.  Run this command to add a file that you want to commit.
    Replace `filename` with a filename from the `git status` output.

    <code-example language="shell">

    git add filename

    </code-example>

    You can add multiple files in a single command by using wildcard characters in the filename parameter.
    You can also run this command to add all changed files that are being tracked by `git` to the commit by using `*` filename as this example shows.

    <code-example language="shell">

    git add *

    </code-example>

    <div class="alert is-important">

    **IMPORTANT**: <br />
    Files that are not tracked by `git` are not committed or pushed to your repo on `github.com` and they do not appear in your pull request.

    </div>

1.  Run `git status` again.

    <code-example language="shell">

    git status

    </code-example>

1.  Review the output and confirm the files that are ready to be committed.

    <!-- Formatting this example as output hides the <file> text. -->
    <code-example language="none" hideCopy>

    On branch working-branch
    Your branch is up to date with 'origin/working-branch'.

    Changes to be committed:
      (use "git restore --staged &lt;file&gt;..." to unstage)
      modified:   content/guide/doc-build-test.md
      modified:   content/guide/doc-edit-finish.md
      modified:   content/guide/doc-editing.md
      modified:   content/guide/doc-pr-prep.md
      modified:   content/guide/doc-pr-update.md
      modified:   content/guide/doc-prepare-to-edit.md
      modified:   content/guide/doc-select-issue.md
      modified:   content/guide/doc-update-start.md

    </code-example>

1.  Run this command to commit the changed files to your local computer.
    The commit message that follows the `-m` parameter must start with `docs:` followed by space, and your message.
    Replace `detailed commit message` with a message that describes the changes you made.

    <code-example language="shell">

    git commit -m 'docs: detailed commit message'

    </code-example>

    For more information about Angular commit messages, see [Formatting commit messages for a pull request](guide/doc-pr-prep#format-commit-messages-for-a-pull-request).

Your changes to the documentation are now *committed, but not pushed*.

### Push your commits to the cloud

After you commit the changes to your local computer, this procedure pushes those commits to your `origin` repo in the cloud.

#### To push your changes to your origin repo in the cloud

<!-- vale Angular.Google_WordListSuggestions = NO -->

Perform these steps from a command-line tool on your local computer or in the **terminal** pane of your IDE.

<!-- vale Angular.Google_WordListSuggestions = YES -->

1.  From your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, run this command to navigate to the `aio` directory in your [working directory](guide/doc-prepare-to-edit#doc-working-directory).
    Remember to replace `personal` with your GitHub username.
  
    <code-example language="shell">

    cd personal/angular/aio

    </code-example>

1.  Run this command to confirm that you are using the correct branch.

    <code-example language="shell">

    git status

    </code-example>

    If you aren't in the correct branch, replace `working-branch` with the name of your working branch and run `git checkout working-branch` to select the correct branch.

    Git status also shows whether you have changes on your local computer that have not been pushed to the cloud.

    <code-example language="none" hideCopy>

    On branch working-branch
    Your branch is ahead of 'origin/working-branch' by 1 commit.
      (use "git push" to publish your local commits)

    </code-example>

    This example output says that there is one commit on the local computer that's not in the `working-branch` branch on the `origin` repo.
    The `origin` is the `personal/angular` repo in GitHub.
    The next command pushes that commit to the `origin` repo.

1.  Run this command to push the commits on your local computer to your account on GitHub in the cloud.

    <code-example language="shell">

    git push

    </code-example>

    If this is the first time you've pushed commits from the branch, you can see a message such as this.

    <code-example language="none" hideCopy>

    fatal: The current branch working-branch has no upstream branch.
    To push the current branch and set the remote as upstream, use

        git push --set-upstream origin working-branch

    To have this happen automatically for branches without a tracking
    upstream, see 'push.autoSetupRemote' in 'git help config'.

    </code-example>

    If you get this message, copy the command that the message provides and run it as shown here:

    <code-example language="shell">

    git push --set-upstream origin working-branch

    </code-example>

The changes that you made in the `working-branch` branch on your local computer have been saved on `github.com`.
Your changes to the documentation are now *committed and pushed*.

## Test your documentation

After you update the documentation to fix the issue that you picked, you are ready to test the documentation.
Testing documentation consists of:

* **Documentation linting**

    Each time you open and save a documentation topic, the documentation linter checks for common errors.
    For more information about documentation linting, see [Resolving documentation linter messages](guide/docs-lint-errors).

* **Manual review**

    When your documentation update is complete, have another person review your changes.
    If you have updated technical content, have a subject matter expert on the topic review your update, as well.

* **Automated testing**

    The Angular documentation is tested automatically after you open a pull request.
    It must pass this testing before the pull request can be merged.
    For more information about automated documentation testing, see [Testing a documentation update](/guide/doc-build-test).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-10-12
