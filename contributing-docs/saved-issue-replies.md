# Saved Responses for Angular's Issue Tracker

This doc collects canned responses that the Angular team can use to close issues that fall into the
listed resolution categories.

Since GitHub currently doesn't allow us to have a repository-wide or organization-wide list
of [saved replies](https://help.github.com/articles/working-with-saved-replies/), these replies need
to be maintained by individual team members. Since the responses can be modified in the future, all
responses are versioned to simplify the process of keeping the responses up to date.

## Angular: Already Fixed (v3)

```
Thanks for reporting this issue. Luckily it has already been fixed in one of the recent releases. Please update to the most recent version to resolve the problem.

If after upgrade the problem still exists in your application please [open a new issue](https://github.com/angular/angular/issues/new/choose) and follow the instructions in the issue template.
```

## Angular: Don't Understand (v3)

```
I'm sorry but we don't understand the problem you are reporting.

If the problem still exists in your application, please [open a new issue](https://github.com/angular/angular/issues/new/choose) and follow the instructions in the issue template.
```

## Angular: Can't reproduce (v2)

```
I'm sorry but we can't reproduce the problem you are reporting. We require that reported issues have a minimal reproduction that showcases the problem.

If the problem still exists in your application, please [open a new issue](https://github.com/angular/angular/issues/new/choose) and follow the instructions in the issue template that include info on how to create a reproduction using our template.
```

## Angular: Duplicate (v2)

```
Thanks for reporting this issue. However this issue is a duplicate of an existing issue #ISSUE_NUMBER. Please subscribe to that issue for future updates.
```

## Angular: Insufficient Information Provided (v2)

```
Thanks for reporting this issue. However, you didn't provide sufficient information for us to understand and reproduce the problem. Please check out [our submission guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#submit-issue) to understand why we can't act on issues that are lacking important information.

If the problem still exists in your application, please [open a new issue](https://github.com/angular/angular/issues/new/choose) and follow the instructions in the issue template.

```

## Angular: Issue Outside of Angular (v2)

```
I'm sorry but this issue is not caused by Angular. Please contact the author(s) of project PROJECT_NAME or file issue on their issue tracker.
```

## Angular: Behaving as Expected (v1)

```
It appears this behaves as expected. If you still feel there is an issue, please provide further details in a new issue.
```

## Angular: Non-reproducible (v2)

```
I'm sorry but we can't reproduce the problem following the instructions you provided.

If the problem still exists in your application please [open a new issue](https://github.com/angular/angular/issues/new/choose) and follow the instructions in the issue template.
```

## Angular: Obsolete (v2)

```
Thanks for reporting this issue. This issue is now obsolete due to changes in the recent releases. Please update to the most recent Angular version.

If the problem still exists in your application, please [open a new issue](https://github.com/angular/angular/issues/new/choose) and follow the instructions in the issue template.
```

## Angular: Support Request (v1)

```
Hello, we reviewed this issue and determined that it doesn't fall into the bug report or feature request category. This issue tracker is not suitable for support requests, please repost your issue on [StackOverflow](https://stackoverflow.com/) using tag `angular`.

If you are wondering why we don't resolve support issues via the issue tracker, please [check out this explanation](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#question).
```

## Angular: Commit Header

```
It looks like you need to update your commit header to match our requirements. This is different from the PR title. To update the commit header, use the command `git commit --amend` and update the header there.

Once you've finished that update, you will need to force push using `git push [origin name] [branch name] --force`. That should address this.
```

## Angular: Rebase and Squash

```
Please rebase and squash your commits. To do this, make sure to `git fetch upstream` to get the latest changes from the angular repository. Then in your branch run `git rebase upstream/main -i` to do an interactive rebase. This should allow you to fixup or drop any unnecessary commits. After you finish the rebase, force push using `git push [origin name] [branch name] --force`.
```
