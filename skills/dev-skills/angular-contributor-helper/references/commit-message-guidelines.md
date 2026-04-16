# Commit Message Format

[Full source](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md)

Each commit message has a **header**, an optional **body**, and an optional **footer**.

```
<type>(<scope>): <short summary>

<body>

<footer>
```

## Header

```
<type>(<scope>): <short summary>
```

- `<type>` and `<summary>` are mandatory, `(<scope>)` is optional.

### Type

| Type         | Description                                             |
| ------------ | ------------------------------------------------------- |
| **build**    | Build system or external dependency changes             |
| **ci**       | CI configuration changes                                |
| **docs**     | Documentation only changes                              |
| **feat**     | A new feature                                           |
| **fix**      | A bug fix                                               |
| **perf**     | A performance improvement                               |
| **refactor** | Code change that neither fixes a bug nor adds a feature |
| **test**     | Adding or correcting tests                              |

### Scope

The scope is the npm package name affected. Supported scopes:

`animations`, `benchpress`, `common`, `compiler`, `compiler-cli`, `core`, `dev-infra`, `devtools`, `docs-infra`, `elements`, `forms`, `http`, `language-service`, `language-server`, `localize`, `migrations`, `platform-browser`, `platform-browser-dynamic`, `platform-server`, `router`, `service-worker`, `upgrade`, `vscode-extension`, `zone.js`

Exceptions:

- `dev-infra`: changes in `/scripts` and `/tools`
- `docs-infra`: infrastructure changes to the docs-app in `/adev` (for content edits, use `docs:` without scope)
- `migrations`: changes to `ng update` migrations
- `devtools`: changes in the browser extension
- none/empty string: useful for `test` and `refactor` across all packages (e.g. `test: add missing unit tests`) and for docs not related to a specific package (e.g. `docs: fix typo in tutorial`)

### Summary

- Imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period at the end

## Body

- Mandatory for all commits except `docs` type.
- Must be at least 20 characters.
- Imperative, present tense.
- Explain the motivation — _why_ you are making the change.

## Footer

Used for breaking changes, deprecations, and issue references.

Breaking change section must start with `BREAKING CHANGE: ` followed by a summary, a blank line, and a detailed description with **migration instructions**:

```
BREAKING CHANGE: <summary>

<description + migration instructions>

Fixes #<issue number>
```

Deprecation section must start with `DEPRECATED: ` followed by what is deprecated, a blank line, and a detailed description with **recommended update path**:

```
DEPRECATED: <what is deprecated>

<description + recommended update path>

Closes #<pr number>
```

## Revert Commits

Start with `revert: ` followed by the original commit header. Body must contain `This reverts commit <SHA>` and the reason for reverting.
