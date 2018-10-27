#!/usr/bin/env bash
# Generates the data used by the stamping feature in bazel.
# See the section on stamping in docs/BAZEL.md

set -u -e -E -o pipefail

echo "Running: $0" >&2

function onError {
  echo "Failed to execute: $0"
  echo ""
}

# Setup crash trap
trap 'onError' ERR


echo BUILD_SCM_HASH $(git rev-parse HEAD)

if [[ "$(git tag)" == "" ]]; then
  echo "No git tags found, can't stamp the build."
  echo "Either fetch the tags:"
  echo "       git fetch git@github.com:angular/angular.git --tags"
  echo "or build without stamping by giving an empty workspace_status_command:"
  echo "       yarn bazel build --workspace_status_command= ..."
  echo ""
fi

# Only match the latest tag that is a version such as 6.0.0, 6.0.0-rc.5, etc...
# This will ignore non-version tags which would break unit tests expecting a valid version
# number in the package headers
BUILD_SCM_VERSION_RAW=$(git describe --match [0-9].[0-9].[0-9]* --abbrev=7 --tags HEAD)

# Find out if there are any uncommitted local changes
# TODO(i): is it ok to use "--untracked-files=no" to ignore untracked files since they should not affect anything?
if [[ $(git status --untracked-files=no --porcelain) ]]; then LOCAL_CHANGES="true"; else LOCAL_CHANGES="false"; fi
echo BUILD_SCM_LOCAL_CHANGES ${LOCAL_CHANGES}

# Reformat `git describe` version string into a more semver-ish string
#   From:   5.2.0-rc.0-57-g757f886
#   To:     5.2.0-rc.0+57.sha-757f886
#   Or:     5.2.0-rc.0+57.sha-757f886.with-local-changes
BUILD_SCM_VERSION="$(echo ${BUILD_SCM_VERSION_RAW} | sed -E 's/-([0-9]+)-g/+\1.sha-/g')""$( if [[ $LOCAL_CHANGES == "true" ]]; then echo ".with-local-changes"; fi)"
echo BUILD_SCM_VERSION ${BUILD_SCM_VERSION}
