# Caretaker

Caretaker is responsible for merging PRs into the individual branches and internally at Google.

## Responsibilities

- Draining the queue of PRs ready to be merged. (PRs with [`PR action: merge`](https://github.com/angular/angular/pulls?q=is%3Aopen+is%3Apr+label%3A%22PR+action%3A+merge%22) label)
- Assigning [new issues](https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Alabel) to individual component authors.

## Merging the PR

A PR needs to have `PR action: merge` and `PR target: *` labels to be considered
ready to merge. Merging is performed by running `merge-pr` with a PR number to merge.

To merge a PR run:

```
$ ./scripts/github/merge-pr 1234
```

The `merge-pr` script will:
- Ensure that all appropriate labels are on the PR.
- Fetches the latest PR code from the `angular/angular` repo.
- It will `cherry-pick` all of the SHAs from the PR into the current corresponding branches `master` and or `?.?.x` (patch).
- It will rewrite commit history by automatically adding `Close #1234` and `(#1234)` into the commit message.

NOTE: The `merge-pr` will land the PR on `master` and or `?.?.x` (patch) as described by `PR target: *` label.

### Recovering from failed `merge-pr` due to conflicts

When running `merge-pr` the script will output the commands which it is about to run.

```
$ ./scripts/github/merge-pr 1234
======================
GitHub Merge PR Steps
======================
   git cherry-pick angular/pr/1234~1..angular/pr/1234
   git filter-branch -f --msg-filter "/home/misko/angular/scripts/github/utils/github.closes 1234" HEAD~1..HEAD
```

If the `cherry-pick` command fails than resolve conflicts and use `git cherry-pick --continue` once ready. After the `cherry-pick` is done cut&paste and run the `filter-branch` command to properly rewrite the messages

## Cherry-picking PRs into patch branch

In addition to merging PRs into the master branch, many PRs need to be also merged into a patch branch.
Follow these steps to get patch branch up to date.

1. Check out the most recent patch branch: `git checkout 4.3.x`
2. Get a list of PRs merged into master: `git log master --oneline -n10`
3. For each PR number in the commit message run: `./scripts/github/merge-pr 1234`
   - The PR will only merge if the `PR target:` matches the branch.

Once all of the PRs are in patch branch, push the all branches and tags to github using `push-upstream` script.


## Pushing merged PRs into github

Use `push-upstream` script to push all of the branch and tags to github.

```
$ ./scripts/github/push-upstream
git push git@github.com:angular/angular.git master:master 4.3.x:4.3.x
Counting objects: 25, done.
Delta compression using up to 6 threads.
Compressing objects: 100% (17/17), done.
Writing objects: 100% (25/25), 2.22 KiB | 284.00 KiB/s, done.
Total 25 (delta 22), reused 8 (delta 7)
remote: Resolving deltas: 100% (22/22), completed with 18 local objects.
To github.com:angular/angular.git
   079d884b6..d1c4a94bb  master -> master
git push --tags -f git@github.com:angular/angular.git patch_sync:patch_sync
Everything up-to-date
```
