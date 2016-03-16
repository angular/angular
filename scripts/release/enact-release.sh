#!/usr/bin/env bash

# `npm whoami` errors and dies if you're not logged in,
# so we redirect the stderr output to /dev/null since we don't care.
NPM_USER=$(npm whoami 2> /dev/null)

if [ "${NPM_USER}" != "angular2-material" ]; then
  echo "You must be logged in as 'angular2-material' to publish. Use 'npm login'."
  exit
fi

set -ex

for package in ./deploy/*
do
  npm publish ${package}
done
