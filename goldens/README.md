### *`public-api/`*

This directory contains all of the public api goldens for our npm packages we publish
to NPM.  These are tested on all PRs and commits as part of the our bazel tests.

To check or update the public api goldens, run one of the following commands:

```bash
yarn public-api:check
yarn public-api:update
```

### *`packages-circular-deps.json`*

This golden file contains a list of all circular dependencies in the project. As part of the
lint CI job we compare the current circular dependencies against this golden to ensure that
we don't add more cycles. If cycles have been fixed, this file is also updated so that we can
slowly burn down the number of cycles in the project.

To check or update the golden, run the following commands:

```bash
yarn ts-circular-deps:check
yarn ts-circular-deps:approve
```
