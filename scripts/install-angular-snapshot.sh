#!/bin/bash

# Script that modifies the project `package.json` by setting the version for all Angular
# dependencies to the Github snapshot builds. Afterwards, if the `--only-save` flag is not set,
# the script will also run NPM to install the new versions.

set -e

# Go to the project root directory
cd $(dirname $0)/../

searchRegex='(@angular\/(.*))":\s+".*"'
searchReplace='\1": "github:angular\/\2-builds"'

# Replace the Angular versions in `package.json` with their corresponding
# build snapshots so that we only have to run `npm install` once.
sed -i -r "s/${searchRegex}/${searchReplace}/g" package.json

if [[ ${*} != *--only-save* ]]; then
  npm install
fi
