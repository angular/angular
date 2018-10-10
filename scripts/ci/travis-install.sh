#!/bin/bash

# Script that installs the project node module dependencies within Travis. The script also ensures that the cached
# node modules are in sync with the lock file and also checks that if the lock file is in sync with the
# project `package.json` file.

# Go to the project root directory
cd $(dirname $0)/../..

# Yarn's integrity check command throws in the following scenarios:
#   1) Cached node modules are not in sync with lock file
#   2) Lock file is not in sync with `package.json`

# In case the integrity check passes, we just use the cached/locked node modules. If it fails, we want to purge the
# node modules and run Yarn with `--frozen-lockfile`. Running with a frozen lockfile ensures that outdated/cached node
# modules will be refreshed to **match** the actual lock file. Otherwise, if the `package.json` does not match with
# the lock file, Yarn automatically throws an error due to the `--frozen-lockfile` option.
if ! (yarn check --integrity &> /dev/null); then
  echo "Cached node modules are not in sync. Purging and refreshing..."
  rm -rf ./node_modules/
  yarn install --frozen-lockfile --non-interactive
else
  echo "Cached node modules have been checked and are in sync with the lock file."
fi