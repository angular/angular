# Working with Fixup Commits

[Full source](https://github.com/angular/angular/blob/main/contributing-docs/using-fixup-commits.md)

Fixup commits are used to address review feedback without amending original commits, making it easy for reviewers to see what changed.

## Creating a Fixup Commit

```shell
# Fix up the last commit on the branch:
git commit --fixup HEAD

# Fix up a specific commit:
git commit --fixup <COMMIT_SHA>
```

The commit message will be `fixup! <original-commit-subject>`.

### Example

```
feat: first commit
fix: second commit
fixup! feat: first commit    ← this modifies the first commit
```

The fixup commit doesn't have to target the immediately preceding commit — it can fix up any earlier commit on the branch.

## Why Use Fixup Commits

- Reviewers can see exactly what changed since their last review
- No need to re-review all changes on larger PRs
- Angular's merge script automatically squashes fixup commits into the original

## Squashing Manually

Use interactive rebase with `--autosquash`:

```shell
git rebase --autosquash <base-branch>
```

To make autosquash the default:

```shell
git config rebase.autoSquash true
```
