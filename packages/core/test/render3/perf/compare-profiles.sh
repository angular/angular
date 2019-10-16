#!/bin/bash
set -u -e -o pipefail

if [[ $# -eq 0 ]] ; then
    echo 'No branch ref provided as argument.  Rerun with a branch or SHA to checkout.'
    exit 1
fi

# Temp file to hold results in.
TMP_FILE=$(mktemp)

# The reference to the current branch to return to.
current_branch=$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')

# The reference to the sha to measure the current_branch against.
base_branch=$1

# Checkout master to get base perf information
git checkout origin/master > /dev/null 2>&1
# TODO(josephperrott): remove yarn install
yarn --silent
node packages/core/test/render3/perf/profile_all.js --write $TMP_FILE

# Checkout the PR ref to get new perf information
git checkout $current_branch > /dev/null 2>&1
# TODO(josephperrott): remove yarn install
yarn --silent
node packages/core/test/render3/perf/profile_all.js --read $TMP_FILE

# Clean up temp file.
rm $TMP_FILE;
