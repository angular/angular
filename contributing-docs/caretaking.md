# Caretaker

The *caretaker* is a role responsible for merging PRs and syncing into Google's
internal code repository. The caretaker role rotates weekly.

## Responsibilities

- Merging PR (PRs with [`action: merge`](https://github.com/angular/angular/pulls?q=is%3Aopen+is%3Apr+label%3A%22action%3A+merge%22) label)
- Light issue triage [new issues](https://github.com/angular/angular/issues?q=is%3Aopen+is%3Aissue+no%3Alabel).

## Merging the PR

A PR requires the `action: merge` and a `target: *` label to be merged.

The tooling automatically verifies the given PR is ready for merge. If the PR passes the tests, the
tool will automatically merge it based on the applied target label.

To merge a PR run:

```sh
$ pnpm ng-dev pr merge <pr number>
```

## Primitives and blocked merges

Some directories in the Angular codebase have additional protections or rules. For example, code
under `//packages/core/primitives` must be merged and synced into Google separately from other
changes. Attempting to combine changes in `primitives` with other changes results in an error. This
practices makes it significantly easier to rollback or revert changes in the event of a breakage or
outage.

## PRs that require global presubmits

Most PRs are tested against a curated subset of Angular application tests inside Google. However,
if a change is deemed risky or otherwise requires more thorough testing, add the `requires: TGP`
label to the PR. For such PRs, the merge tooling enforces that _all_ affected tests inside Google
have been run (a "global presubmit"). A Googler can alternatively satisfy the merge tooling check by
adding a review comment that starts with `TESTED=` and then put a reason why the PR is sufficiently
tested. The `requires: TGP` label is automatically added to PRs that affect files
matching `separateFilePatterns` in [`.ng-dev/google-sync-config.json`](https://github.com/angular/angular/blob/main/.ng-dev/google-sync-config.json).

An example of specifying a `TESTED=` comment:
```
TESTED=docs only update and does not need a TGP
```

### Recovering from failed `merge-pr` due to conflicts

The `ng-dev pr merge` tool will automatically restore to the previous git state when a merge fails.
