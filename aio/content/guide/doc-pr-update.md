# Update a documentation pull request

<!-- markdownLint-disable MD001 -->

This topic describes how to respond to test failures and feedback on your pull request.

After you open a pull request, it is tested and reviewed.
After it's approved, the changes are merged into `angular/angular` and they become part of the Angular documentation.

While some pull requests are approved with no further action on your part, most pull requests receive feedback that requires you to make a change.

## Anatomy of a pull request

After you open a pull request, the pull request page records the activity on the pull request as it is reviewed, updated, and approved.
This is an example of the top of a pull request page followed by a description of the information it contains.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="Screenshot of github.com page showing a branch listing from a repo" src="generated/images/guide/doc-pr-update/pull-request-heading.png">

</div>

Above the pull-request tabs is a summary of the pull request that includes:

*   The pull request title and index
*   The status of the pull request:
    open or closed

*   A description of the branch with the changes and the branch to update

The tabs contain different aspects of the pull request.

*   **Conversation**

    All comments and changes to the pull request, system messages, and a summary of the automated tests and approvals.

*   **Commits**

    The log of the commits included in this pull request.

*   **Checks**

    The results of the checks run on the commit.
    This is different from the automated tests that are also run and summarized at the bottom of the **Conversation** tab.

*   **Files changed**

    The changes this request makes to the code.
    In this tab is where you find specific comments to the changes in your pull request.
    You can reply to those comments in this tab, as well.

## Respond to a comment

If your pull request receives comments from a reviewer, you can respond in several ways.

*   Reply to the feedback.

    For example, you can ask for more information or reply with an explanation.

*   Make the changes to the documentation that the reviewer recommends.

    If you update the working branch with the suggested changes, resolve the comment.

*   Make other changes to the documentation.

    After reviewing the feedback, you might see an even better improvement.
    Update the working branch with your improvement and explain why you chose that to your reviewers in a comment.

Remember that pull requests that do not receive a response to a review comment are considered abandoned and closed.
For more information about abandoned pull requests, see [What happens to abandoned pull requests](guide/doc-pr-open#what-happens-to-abandoned-pull-requests).

### Update a file in the pull request

Follow this procedure to change a file in the pull request or to add a new file to the pull request.

1.  In your `git` workspace, in your working directory, checkout your working branch.
1.  Update the documentation to respond to the feedback you received.
    The procedures used to [revise a documentation topic](guide/doc-editing) are also used to update the documentation while there's an open pull request.

1.  Test your update locally as described in [Testing a documentation update](guide/doc-build-test).
1.  After your updates have been tested, commit your changes and push the new commits to the working branch of your repo on your `origin` server.
1.  After you update the working branch on your `origin` server, the fork of the `angular/angular` repo in your GitHub account, your pull request updates automatically.
1.  After the pull request updates, the automated tests are restarted and the reviewers are notified.

Repeat this process as needed to address the feedback you get from reviews of the pull request.

## Clean up the branch

If you added commits to address review feedback, you might be requested to clean up your working branch.
If some of the commits you made address only review feedback from your reviewers, they can probably be squashed.
Squashing commits combines the changes made in multiple commits into a single commit.

<!-- markdownLint-disable MD033 -->

#### To squash commits in your working branch

Perform these steps from a command-line tool on your local computer.

1.  In your [workspace](guide/doc-prepare-to-edit#create-a-git-workspace-on-your-local-computer) directory, in your [working directory](guide/doc-prepare-to-edit#doc-working-directory), checkout your working branch.
1.  Run this command to view the commits in your working branch.

    <code-example format="shell" language="shell">

    git log --pretty=format:"%h %as %an %Cblue%s %Cgreen%D"

    </code-example>

1.  In the output of the previous `git log` command, find the entry that contains `upstream/main`.
    It should be near the top of the list.

    1.  **Confirm that entry also contains `origin/main` and `main`**

        If it doesn't, you must resync the clone on your local computer and your `personal/angular` repo with the `upstream` repo.
        After you resync the repos, [rebase the working branch](guide/doc-pr-prep#rebase-your-working-branch) before you continue.

    1.  **Confirm that all commits for your update are after the entry that contains `upstream/main`**

        Remember that the log output is displayed with the most recent commit first.
        Your commits should all be on top of the entry that contains `upstream/main` in the log output.
        If you have commits that are listed after the entry that contains `upstream/main`, somehow your commits in the working branch got mixed up.
        You must fix the branch before you try to squash any commits.

1.  Count the lines that are on top of the entry that contains `upstream/main`.
    For example, in this log output, the working branch name is `update-doc-contribution` and there are five commit entries that are on top of the entry that contains `upstream/main`.

    <div class="lightbox">

    <!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
    <a href="generated/images/guide/doc-pr-update/git-log-output-large.png"><img alt="Screenshot of git log output" src="generated/images/guide/doc-pr-update/git-log-output.png"></a>

    </div>

1.  Run this command to squash the commits that occurred after the entry that contains `upstream/main`.
    In your command, replace the `5` after `HEAD` with the number of commits on top of the entry that contains `upstream/main`.

    <code-example format="shell" language="shell">

    git rebase -i HEAD~5

    </code-example>

1.  This command opens your default editor with entries for the commits that you selected in the `git rebase` command.

    <div class="lightbox">

    <!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
    <img alt="Screenshot of git rebase editor screen" src="generated/images/guide/doc-pr-update/git-squash-edit.png">

    </div>

1.  To squash the commits, edit the commands in the file that's presented in the editor.
    The commands in the editor are listed from oldest to newest, which is the opposite order from how they are listed by the `git log` command.
    The possible command options are listed in the editor below the commands.
    To squash the commits for your pull request, you only need: `pick` and `squash`.

1.  Review the commands in the editor and change them to match your intention.

    The commands are processed from top to bottom, that is from oldest commit to the most recent.\
    To merge all commits in this branch for this pull request, change the `pick` commands to `squash` for all commits except for the first one.
    This text shows how this looks for this example.

    <code-example language="none" hideCopy>

    pick bb0ff71891 docs: update of documentation contrib. guide
    squash c040d76685 docs: more content for doc updates
    squash 472585c43f docs: fix links that were broken by renamed files
    squash 3e6f4c73ac docs: add more info about open PR
    squash 8e50fad064 docs: more pr docs

    </code-example>

    With this edit, `git rebase` picks the first commit and combines the later commits into the first one.

    The commit message of the commit with the `pick` command, is the commit message used for the resulting commit.
    Make sure that it in the correct format and starts with `docs:`.
    If you need to change the commit message, you can edit it in the editor.

1.  After you update the commands, save and exit the editor.
    The `git rebase` commit processes the commands and updates the commit log in your workspace.
    In this example, the rebase command combined the five commits to create a single commit in your working branch.
    This is the commit log after the rebase command completes.

    <div class="lightbox">

    <!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
    <a href="generated/images/guide/doc-pr-update/git-log-after-squash-large.png"><img alt="Screenshot of commit log after git rebase command" src="generated/images/guide/doc-pr-update/git-log-after-squash.png"></a>

    </div>

1.  The `git rebase` command changes the commit log in your local computer so it is now different from the one in your online repo.
    To update your online repo, you must force your push of changes from your local computer using this command.

    <code-example format="shell" language="shell">

    git push --force-with-lease

    </code-example>

    This action is also called a *force push* because it changes the commit log that was stored in your GitHub account.
    Normally, when you run `git push`, you add new commits to the online repo.
    When other people have forked a repo, a force push can have undesired effects for them.
    This force-push is to your forked repo, which should not be shared, so it should be OK.

1.  After your force push updates the online repo, your pull request restarts the automated tests and notifies the reviewers of the update.

## Next steps

Repeat these update steps as necessary to respond to all the feedback you receive.

After you address all the feedback and your pull request has been approved, it is merged into `angular/angular`.
The changes in your pull request should appear in the documentation shortly afterwards.

After your pull request is merged into `angular/angular`, you can [clean up your workspace](guide/doc-edit-finish).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-10-12
