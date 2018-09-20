#!/usr/bin/env bash

# Generates the data used by the stamping feature in bazel.
# This script is intended to be used as a Bazel workspace_status_command, which
# prints out a set of key-value pairs.
# See https://github.com/angular/angular/blob/master/docs/BAZEL.md for more explanation
set -u -e -E -o pipefail

function onError {
  echo "Failed to execute: $0"
  echo ""
}

# Function that throws an error if the Bazel Angular version does not match the
# required Angular version in the project package.json file.
function checkBazelAngularVersion {
  requiredAngularVersion=$(node -p 'require("./package.json").requiredAngularVersion')
  bazelAngularVersion=$(sed -nr 's/ANGULAR_PACKAGE_VERSION = "(.*)"/\1/p' ./packages.bzl)

  if [[ "${requiredAngularVersion}" != "${bazelAngularVersion}" ]]; then
    echo "ERROR: The required Angular version that has been specified in the 'package.json' file " \
         "does not match the given Angular version in the //:packages.bzl file."
    exit 1
  fi
}

# Setup crash trap
trap 'onError' ERR

if [[ "$(git tag)" == "" ]]; then
  echo "No git tags found, can't stamp the build."
  echo "Either fetch the tags:"
  echo "       git fetch git@github.com:angular/material2.git --tags"
  echo "or build without stamping by giving an empty workspace_status_command:"
  echo "       bazel build --workspace_status_command= ..."
  echo ""
fi

# Check the Bazel Angular version to be in sync with the angular version in the package.json
checkBazelAngularVersion

# Gets a human-readable name for HEAD, e.g. "6.0.0-rc.0-15-g846ddfa"
git_version_raw=$(git describe --abbrev=7 --tags HEAD)

# Find out if there are any uncommitted local changes
if [[ $(git status --untracked-files=no --porcelain) ]]; then
  local_changes_suffix=".with-local-changes";
else
  local_changes_suffix="";
fi

# Reformat `git describe` version string into a more semver-ish string
#   From:   5.2.0-rc.0-57-g757f886
#   To:     5.2.0-rc.0+57.sha-757f886
#   Or:     5.2.0-rc.0+57.sha-757f886.with-local-changes

semver_style_version="$(echo ${git_version_raw} | sed -E 's/-([0-9]+)-g/+\1.sha-/g')"
version_stamp="${semver_style_version}${local_changes_suffix}"
echo "BUILD_SCM_VERSION ${version_stamp}"
