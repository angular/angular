# Caretaker

Caretaker is responsible for merging PRs into the individual branches and internally at Google.

## Responsibilities

- Draining the queue of PRs ready to be merged. (PRs with [`action: merge`](https://github.com/angular/angular/pulls?q=is%3Aopen+is%3Apr+label%3A%22action%3A+merge%22) label)
- Assigning [new issues](https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Alabel) to individual component authors.

## Merging the PR

A PR needs to have `action: merge` and `target: *` labels to be considered
ready to merge. Merging is performed by running `ng-dev pr merge` with a PR number to merge.

The tooling automatically verifies the given PR is ready for merge. If the PR passes the tests, the
tool will automatically merge it based on the applied target label.

To merge a PR run:

```sh
$ yarn ng-dev pr merge <pr number>
```

## Primitives and Blocked merges

The caretaker may encounter PRs that will fail to merge due to primitives files. Code inside some
paths must be merged and synced separately. For example, anything under `//packages/core/primitives`
has to be merged and synced separately from other changes. Once the latest sync has fully landed,
merging can continue. This is to reduce the risk of challenging rollbacks in the event of a breakage.

## PRs that require TGPs

If a PR is risky or otherwise requires more thorough testing, add the `requires: TGP` label to the PR.
The merge tooling will enforce that a TGP has been run, or alternatively you can add a review comment
that starts with `TESTED=` and then put a reason why the PR is sufficiently tested. This will allow
the PR to be merged. The `requires: TGP` label will be automatically added to PRs that affect files
matching `separateFilePatterns` in [`.ng-dev/google-sync-config.json`](https://github.com/angular/angular/blob/main/.ng-dev/google-sync-config.json).

For example:

```
TESTED=docs only update and does not need a TGP
```

**Note:** the review comment _must_ be made by a googler.

### Recovering from failed `merge-pr` due to conflicts

The `ng-dev pr merge` tool will automatically restore to the previous git state when a merge fails.
