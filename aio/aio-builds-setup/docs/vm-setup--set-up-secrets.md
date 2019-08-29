# VM Setup - Set up secrets


## Overview

Necessary secrets:

1. `GITHUB_TOKEN`
   - Used for:
     - Retrieving open PRs without rate-limiting.
     - Retrieving PR info, such as author, labels, changed files.
     - Retrieving members of the trusted GitHub teams.
     - Posting comments with preview links on PRs.

2. `CIRCLE_CI_TOKEN`
   - Used for:
     - Retrieving build information.
     - Downloading build artifacts.


## Create secrets

1. `GITHUB_TOKEN`
   - Visit https://github.com/settings/tokens.
   - Generate new token with the `public_repo` scope.

2. `CIRCLE_CI_TOKEN`
   - Visit https://circleci.com/gh/angular/angular/edit#api.
   - Create an API token with `Build Artifacts` scope.


## Save secrets on the VM

- `sudo mkdir /aio-secrets`
- `sudo touch /aio-secrets/GITHUB_TOKEN`
- Insert `<github-token>` into `/aio-secrets/GITHUB_TOKEN`.
- `sudo touch /aio-secrets/CIRCLE_CI_TOKEN`
- Insert `<access-token>` into `/aio-secrets/CIRCLE_CI_TOKEN`.
- `sudo chmod 400 /aio-secrets/*`
