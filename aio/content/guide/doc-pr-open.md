# Opening a documentation pull request

This topic describes how to open the pull request that requests your documentation update to be added to the `angular/angular` repo.

<!-- vale Angular.Google_We = NO -->

These steps are performed in your web browser.

1. Locate the working branch that you want to use for your pull request.
In this example, `test-1` is the name of the working branch. Choose one of these options to open a pull request.
   1.  If you recently pushed the branch that you want to use to the `origin` repo, you might see it listed on the code page of the `angular` repo in your GitHub account.
   This image shows an example of a repo that has had several recent updates.
  
        <img alt="Screenshot of github.com page showing a recent push to the repo" src="generated/images/guide/doc-pr-open/github-recent-push.png">

        In the alert message with your working branch, click **Compare & pull request** to open a pull request and continue to the next step.

   2. You can also select your working branch in the code page of the origin repo.

        <img alt="Screenshot of code page of the origin repo from github.com page showing a branch listing from a repo" src="generated/images/guide/doc-pr-open/github-branch-view.png">

        Click the link text in the **"This branch is"** message to open the **Comparing changes** page.

        <img alt="Screenshot of Comparing Changes page in github.com page showing a difference between branches of a repo" src="generated/images/guide/doc-pr-open/github-branch-diff.png">

        In the **Comparing changes** page, click **Create pull request** to open the new pull request page.

2. In the new pull request page:
   1. Review the title and confirm that it is correctly formatted. It must start with `docs:`, be followed by a space, and then a summary of the change.
   2. Review and complete the form in the comment field. Most documentation updates require responses to the entries noted by an arrow and described below.

      <img alt="Screenshot of pull request form" src="generated/images/guide/doc-pr-open/pr-checklist.png">

      1. **The commit message follows our guidelines**<br>Mark this comment when you're sure your commit messages are in the correct format. Remember that the commit messages and the pull request title are different. For more information about commit message formatting, see [Preparing a documentation update for a pull request](guide/doc-pr-prep) and [Commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit).
      2. **Docs have been added / updated (for bug fixes / features)**<br>Mark this comment to show that documentation has been updated.
      3. **Documentation content changes**<br>Mark this comment to identify this is a documentation pull request. If you also updated other types of content, you can mark those as well.
      4. **What is the current behavior?**<br>Briefly describe what wasn't working or what was incorrect in the documentation before you made the changes in this pull request. Add the issue number here, if the problem is described in an issue.
      5. **What is the new behavior?**<br>Briefly describe what was added to fix the problem.
      6. **Does this PR introduce a breaking change?**<br>For most documentation updates, the answer to this should be `No`.
      7. **Other information**<br>Add any other information that can help reviewers understand your pull request here.

3. Click the arrow next to **Draft pull request** and select whether you want to create a *draft pull request* or a *pull request*.
   1. A *draft pull request* runs the continuous integration (CI) testing, but does not send the pull request to reviewers. You can ask people to review it by sending them the pull request link. You might use this option to see how your pull request passes the CI testing before you send it for review to be merged. Draft pull requests cannot be merged.
   2. A *pull request* runs the continuous integration (CI) testing and sends your pull request to reviewers to review and merge.
   3. Note: you can change *draft pull requests* to *pull requests*.
4. Click **Create the pull request** or **Draft pull request** to open the pull request. After GitHub creates the pull request, the browser opens the new pull request page.
5. After you open the pull request, the continuous integration/continuous delivery (CI/CD) tests start running.

<!-- vale Angular.Google_We = YES -->

## What happens after you open a pull request

In most cases, documentation pull requests that pass the CI/CD test are approved within a few days.

Sometimes, reviewers suggest changes for you to make to improve your pull request.
In those case, review the suggestions and [update the pull request](guide/doc-pr-update) with a comment or an updated file.

### What happens to abandoned pull requests

While it can take a few days to respond to comments, try to respond as quickly as you can.
Pull requests that appear to abandoned or ignored are closed according to this schedule:

* After 14 days of inactivity after the last comment, the author is reminded that the pull request has pending comments.
* After 28 days of inactivity after the last comment, the pull request is closed and not merged.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-30
