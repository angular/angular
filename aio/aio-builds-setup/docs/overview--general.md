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
- Build job completes successfully (i.e. build succeeds and tests pass).
- The CI script checks whether the build job was initiated by a PR against the angular/angular
  master branch.
- The CI script checks whether the PR has touched any files inside the angular.io project directory
  (currently `aio/`).
- The CI script checks whether the author of the PR is a member of one of the whitelisted GitHub
  teams (and therefore allowed to upload).
  **Note:**
  For security reasons, the same checks will be performed on the server as well. This is an optional
  step with the purpose of:
  1. Avoiding the wasted overhead associated with uploads that are going to be rejected (e.g.
     building the artifacts, sending them to the server, running checks on the server, etc).
  2. Avoiding failing the build (due to an error response from the server) or requiring additional
     logic for detecting the reasons of the failure.
- The CI script gzip and upload the build artifacts to the server.

More info on how to set things up on CI can be found [here](misc--integrate-with-ci.md).


### Uploading build artifacts
- nginx receives upload request.
- nginx checks that the uploaded gzip archive does not exceed the specified max file size, stores it
  in a temporary location and passes the filepath to the Node.js upload-server.
- The upload-server verifies that the uploaded file is not trying to overwrite an existing build,
  and runs several checks to determine whether the request should be accepted (more details can be
  found [here](overview--security-model.md)).
- The upload-server deploys the artifacts to a sub-directory named after the PR number and SHA:
  `<PR>/<SHA>/`
- The upload-server posts a comment on the corresponding PR on GitHub mentioning the SHA and the
  the link where the preview can be found.


### Serving build artifacts
- nginx receives a request for an uploaded resource on a subdomain corresponding to the PR and SHA.
  E.g.: `pr<PR>-<SHA>.ngbuilds.io/path/to/resource`
- nginx maps the subdomain to the correct sub-directory and serves the resource.
  E.g.: `/<PR>/<SHA>/path/to/resource`


### Removing obsolete artifacts
In order to avoid flooding the disk with unnecessary build artifacts, there is a cronjob that runs a
clean-up tasks once a day. The task retrieves all open PRs from GitHub and removes all directories
that do not correspond with an open PR.


### Health-check
The docker service runs a periodic health-check that verifies the running conditions of the
container. This includes verifying the status of specific system services, the responsiveness of
nginx and the upload-server and internet connectivity.
