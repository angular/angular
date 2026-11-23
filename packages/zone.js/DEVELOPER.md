## To run tests

_Note_: some of these tests no longer run. Be sure to check that CI is green.

Make sure your environment is set up with:

`pnpm`

In a separate process, run the WebSockets server:

`pnpm ws-server`

Run the browser tests using Karma:

`pnpm test`

Run the node.js tests:

`pnpm test-node`

Run tslint:

`pnpm lint`

Run format with prettier:

`pnpm format`

Run all checks (lint/format/browser test/test-node):

`pnpm ci`

## Before Commit

Please make sure you pass all following checks before commit

- pnpm lint (tslint and format)
- pnpm promisetest (promise a+ test)
- pnpm bazel test //packages/zone.js/... (all tests)

## Webdriver Test

`zone.js` also supports running webdriver e2e tests.

1. run locally

```
pnpm webdriver-start
pnpm webdriver-http
pnpm webdriver-test
```

## Releasing

Releasing `zone.js` is handled via the release script (run from the root of the repo):

```bash
pnpm zonejs:release
```

Follow the interactive prompts to either create a PR or cut a release.

Releasing is a two step process:

1. **Create a PR for release**: updates the version in `packages/zone.js/package.json`, generates the `packages/zone.js/CHANGELOG.md` with all changes since the last zone.js release, runs a dry-run build, creates and pushes the release branch, and provides a PR link.
2. **Cut a release (publish)**: once the PR is merged, check out the merged release commit, build the package with release config, publish to npm, and tag and push the `zone.js-<version>` release tag.
