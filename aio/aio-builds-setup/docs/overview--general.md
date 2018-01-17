# Overview - General


## Objective
Whenever a PR job is run on Travis, we want to build `angular.io` and upload the build artifacts to
a publicly accessible server so that collaborators (developers, designers, authors, etc) can preview
the changes without having to checkout and build the app locally.


## Source code
In order to make it easier to administer the server and version-control the setup, we are using
[docker](https://www.docker.com) to run a container on a VM. The Dockerfile and all other files
necessary for creating the docker container are stored (and versioned) along with the angular.io
project's source code (currently part of the angular/angular repo) in the `aio-builds-setup/`
directory.


## Setup
The VM is hosted on [Google Compute Engine](https://cloud.google.com/compute/). The host OS is
debian:jessie. For more info how to set up the host VM take a look at the "Setting up the VM"
section in [TOC](_TOC.md).


## Security model
Since we are managing a public server, it is important to take appropriate measures in order to
prevent abuse. For more details on the challenges and the chosen approach take a look at the
[security model](overview--security-model.md).


## The 10000 feet view
This section gives a brief summary of the several operations performed on CI and by the docker
container:


### On CI (Travis)
- Build job completes successfully.
- The CI script checks whether the build job was initiated by a PR against the angular/angular
  master branch.
- The CI script checks whether the PR has touched any files that might affect the angular.io app
  (currently the `aio/` or `packages/` directories, ignoring spec files).
- Optionally, the CI script can check whether the PR can be automatically verified (i.e. if the
  author of the PR is a member of one of the whitelisted GitHub teams or the PR has the specified
  "trusted PR" label).
  **Note:**
  For security reasons, the same checks will be performed on the server as well. This is an optional
  step that can be used in case one wants to apply special logic depending on the outcome of the
  pre-verification. For example:
  1. One might want to deploy automatically verified PRs only. In that case, the pre-verification
     helps avoid the wasted overhead associated with uploads that are going to be rejected (e.g.
     building the artifacts, sending them to the server, running checks on the server, detecting the
     reasons of deployment failure and whether to fail the build, etc).
  2. One might want to apply additional logic (e.g. different tests) depending on whether the PR is
     automatically verified or not).
- The CI script gzips and uploads the build artifacts to the server.

More info on how to set things up on CI can be found [here](misc--integrate-with-ci.md).


### Uploading build artifacts
- nginx receives the upload request.
- nginx checks that the uploaded gzip archive does not exceed the specified max file size, stores it
  in a temporary location and passes the filepath to the Node.js upload-server.
- The upload-server runs several checks to determine whether the request should be accepted and
  whether it should be publicly accessible or stored for later verification (more details can be
  found [here](overview--security-model.md)).
- The upload-server changes the "visibility" of the associated PR, if necessary. For example, if
  builds for the same PR had been previously deployed as non-public and the current build has been
  automatically verified, all previous builds are made public as well.
  If the PR transitions from "non-public" to "public", the upload-server posts a comment on the
  corresponding PR on GitHub mentioning the SHAs and the links where the previews can be found.
- The upload-server verifies that the uploaded file is not trying to overwrite an existing build.
- The upload-server deploys the artifacts to a sub-directory named after the PR number and the first
  few characters of the SHA: `<PR>/<SHA>/`
  (Non-publicly accessible PRs will be stored in a different location, but again derived from the PR
  number and SHA.)
- If the PR is publicly accessible, the upload-server posts a comment on the corresponding PR on
  GitHub mentioning the SHA and the link where the preview can be found.

More info on the possible HTTP status codes and their meaning can be found
[here](overview--http-status-codes.md).


### Updating PR visibility
- nginx receives a natification that a PR has been updated and passes it through to the
  upload-server. This could, for example, be sent by a GitHub webhook every time a PR's labels
  change.
  E.g.: `ngbuilds.io/pr-updated` (payload: `{"number":<PR>,"action":"labeled"}`)
- The request contains the PR number (as `number`) and optionally the action that triggered the
  request (as `action`) in the payload.
- The upload-server verifies the payload and determines whether the `action` (if specified) could
  have led to PR visibility changes. Only requests that omit the `action` field altogether or
  specify an action that can affect visibility are further processed.
  (Currently, the only actions that are considered capable of affecting visibility are `labeled` and
  `unlabeled`.)
- The upload-server re-checks and if necessary updates the PR's visibility.

More info on the possible HTTP status codes and their meaning can be found
[here](overview--http-status-codes.md).


### Serving build artifacts
- nginx receives a request for an uploaded resource on a subdomain corresponding to the PR and SHA.
  E.g.: `pr<PR>-<SHA>.ngbuilds.io/path/to/resource`
- nginx maps the subdomain to the correct sub-directory and serves the resource.
  E.g.: `/<PR>/<SHA>/path/to/resource`

More info on the possible HTTP status codes and their meaning can be found
[here](overview--http-status-codes.md).


### Removing obsolete artifacts
In order to avoid flooding the disk with unnecessary build artifacts, there is a cronjob that runs a
clean-up tasks once a day. The task retrieves all open PRs from GitHub and removes all directories
that do not correspond with an open PR.


### Health-check
The docker service runs a periodic health-check that verifies the running conditions of the
container. This includes verifying the status of specific system services, the responsiveness of
nginx and the upload-server and internet connectivity.
