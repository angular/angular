### *`public-api/`*

This directory contains all of the public api goldens for our npm packages we publish
to NPM.  These are tested on all PRs and commits as part of our bazel tests.

To check or update the public api goldens, run one of the following commands:

```bash
yarn public-api:check
yarn public-api:update
```

