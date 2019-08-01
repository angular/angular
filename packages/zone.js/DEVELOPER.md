To run tests
------------

Make sure your environment is set up with:

`yarn`

In a separate process, run the WebSockets server:

`yarn ws-server`

Run the browser tests using Karma:

`yarn test`

Run the node.js tests:

`yarn test-node`

Run tslint:

`yarn lint`

Run format with clang-format:

`yarn format`

Run all checks (lint/format/browser test/test-node):

`yarn ci`

Before Commit
------------

Please make sure you pass all following checks before commit

- gulp lint (tslint)
- gulp format:enforce (clang-format)
- gulp promisetest (promise a+ test)
- yarn test (karma browser test)
- gulp test-node (node test)

You can run

`yarn ci`

to do all those checks for you.
You can also add the script into your git pre-commit hook

```
echo -e 'exec npm run ci' > .git/hooks/pre-commit
chmod u+x .git/hooks/pre-commit
```

Webdriver Test
--------------

`zone.js` also supports running webdriver e2e tests.

1. run locally

```
yarn webdriver-start
yarn webdriver-http
yarn webdriver-test
```

2. run locally with sauce connect

```
// export SAUCE_USERNAME and SAUCE_ACCESS_KEY
export SAUCE_USERNAME=XXXX
export SAUCE_ACCESS_KEY=XXX

sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY
yarn webdriver-http
yarn webdriver-sauce-test
```

Releasing
---------

For example, the current version is `0.9.1`, and we want to release a new version `0.10.0`.

- create a new tag in `angular` repo. The `tag` must be `zone.js-<version>`, so in this example we need to create the tag `zone.js-0.10.0`.

```
$ TAG=zone.js-0.10.0
$ git tag $TAG
```

- Create PR to update `changelog` of zone.js, we need to define the previous tag which will be the current version.

```
$ export PREVIOUS_ZONE_TAG=zone.js-0.9.1
$ yarn gulp changelog:zonejs
```

- deploy to npm

To make a `dry-run`, run the following commands.
```
$ VERSION=<version>
$ yarn bazel --output_base=$(mktemp -d) run //packages/zone.js:npm_package.pack --workspace_status_command="echo BUILD_SCM_VERSION $VERSION"
```

If everything looks fine, replace `.pack` with `.publish` to push to the npm registry.