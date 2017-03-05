# VM Setup - Set up secrets


## Overview

Necessary secrets:

1. `GITHUB_TOKEN`
   - Used for:
     - Retrieving open PRs without rate-limiting.
     - Retrieving PR author.
     - Retrieving members of the `angular-core` team.
     - Posting comments with preview links on PRs.

2. `PREVIEW_DEPLOYMENT_TOKEN`
   - Used for:
     - Decoding the JWT tokens received with `/create-build` requests.

**Note:**
`TEST_GITHUB_TOKEN` and `TEST_PREVIEW_DEPLOYMENT_TOKEN` can also be created similar to their
non-TEST counterparts and they will be loaded when running `aio-verify-setup`, but it is currently
not clear if/how they can be used in tests.


## Create secrets

1. `GITHUB_TOKEN`
   - Visit https://github.com/settings/tokens.
   - Generate new token with the `public_repo` scope.

2. `PREVIEW_DEPLOYMENT_TOKEN`
   - Just generate a hard-to-guess character sequence.
   - Add it to `.travis.yml` under `addons -> jwt -> secure`.
     Can be added automatically with: `travis encrypt --add addons.jwt PREVIEW_DEPLOYMENT_TOKEN=<access-key>`

**Note:**
Due to [travis-ci/travis-ci#7223](https://github.com/travis-ci/travis-ci/issues/7223) it is not
currently possible to use the JWT addon (as described above) for anything other than the
`SAUCE_ACCESS_KEY` variable. You can get creative, though...

**WARNING**
TO avoid arbitrary uploads, make sure the `PREVIEW_DEPLOYMENT_TOKEN` is NOT printed in the Travis log.


## Save secrets on the VM

- `sudo mkdir /aio-secrets`
- `sudo touch /aio-secrets/GITHUB_TOKEN`
- Insert `<github-token>` into `/aio-secrets/GITHUB_TOKEN`.
- `sudo touch /aio-secrets/PREVIEW_DEPLOYMENT_TOKEN`
- Insert `<access-token>` into `/aio-secrets/PREVIEW_DEPLOYMENT_TOKEN`.
- `sudo chmod 400 /aio-secrets/*`
