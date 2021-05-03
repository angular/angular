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

```
$ yarn ng-dev pr merge <pr number>
```

### Recovering from failed `merge-pr` due to conflicts

The `ng-dev pr merge` tool will automatically restore to the previous git state when a merge fails.
