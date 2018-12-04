#!/bin/bash

# Script that re-installs all Angular dependencies using the GitHub build snapshots. We need to
# this after the locked node modules have been installed because otherwise `--frozen-lockfile`
# would complain about outdated lock files.
set -e

# Go to the project root directory
cd $(dirname $0)/../

# Searches for all Angular dependencies in the "package.json" and computes the URL to the github
# snapshot builds for each Angular package. Afterwards it runs `yarn add --force {urls}` in order
# to install the snapshot builds for each package. Note that we need to use `--force` because
# otherwise Yarn will error due to already specified dependencies.
egrep -o '@angular/[^"]+' ./package.json | sed 's/@/github:/' | sed 's/.*/&-builds/' |
  xargs yarn add --force
