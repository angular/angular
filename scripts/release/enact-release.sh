#!/usr/bin/env bash

# Run this script after running `stage-release.sh` to publish the packages staged to deploy/
# Optionally uses the first argument as the tag for the release (such as "next").
# This script should be run from the root of the material2 repo.


# `npm whoami` errors and dies if you're not logged in,
# so we redirect the stderr output to /dev/null since we don't care.
NPM_USER=$(npm whoami 2> /dev/null)

if [ "${NPM_USER}" != "angular2-material" ]; then
  echo "You must be logged in as 'angular2-material' to publish. Use 'npm login'."
  exit
fi

NPM_TAG="latest"
if [ "$1" ] ; then
  NPM_TAG=${1}
fi

set -ex

for package in ./deploy/* ; do
  npm publish --access public ${package} --tag ${NPM_TAG}
done

# Always log out of npm when publish is complete.
npm logout
