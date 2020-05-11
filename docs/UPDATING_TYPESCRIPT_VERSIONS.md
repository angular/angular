# Playbook for updating TypeScript versions

## Adding support for a TypeScript version

1.  Update `MAX_TS_VERSION` in `packages/compiler-cli/src/typescript_support.ts`
2.  Update `peerDependencies` in `packages/bazel/package.json` and
    `packages/compiler-cli/package.json` to reflect the new TypeScript version
    requirements.
3.  Create tests for versions of TS being added, i.e. tests sources in
    `integration/typings_test_ts39/*` and add a test in
    `integration/BUILD.bazel`
    *  Run the test with the command 
       `yarn bazel test //integration:typings_test_tsXX_test` 
       to ensure code is compatible with the new TS version.


## Removing support for a TypeScript version

1.  Update `MIN_TS_VERSION` in `packages/compiler-cli/src/typescript_support.ts`
2.  Remove tests for versions of TS being dropped, i.e. tests sources in
    `integration/typings_test_ts36/*` and references in
    `integration/BUILD.bazel`
3.  Update `peerDependencies` in `packages/bazel/package.json` and
    `packages/compiler-cli/package.json` to reflect the new TypeScript version
    requirements.
4.  Find references to the TS version to be removed. For example, if removing
    support for TS 3.6 and 3.7, use the following command: `git grep -E
    (typescript|\Wts).*3\.(6|7) > ~/matches.txt`
    * Ignore `yarn.lock` files. You should not edit this by hand.
5.  Update `package.json` files to depend on the updated TS version then run
    `yarn install` (or just `yarn`) to update the `yarn.lock files`
    *   If not done already, you may also need to update `@angular` package
        versions to the one that supports the new TS version. Again, run `yarn`
        to update `yarn.lock` files.
    *   You may also need to update the version of `@angular/components` used in
        `components-repo-unit-tests` if the version being used depends on the TS
        version that you're dropping support for. To do this, update the SHA for
        `COMPONENTS_REPO_COMMIT` in `.circleci/env.sh` and the matching one in
        `.circleci/config.yml`.
6.  Double check any additional references to the old TS versions that were
    found in the `git grep` step and update them if necessary.
    *   This may include things like `scripts/release/post-check` that need to
        be updated to use a newer version of TS
