#!/bin/bash

# Script that re-installs all Angular dependencies using the GitHub build snapshots. We need to
# this after the locked node modules have been installed because otherwise `--frozen-lockfile`
# would complain about outdated lock files.
set -e

# Go to the project root directory
cd $(dirname $0)/../

yarn add \
  $(awk 'match($0, "@angular/(.*)\":", m){print "github:angular/"m[1]"-builds"}' package.json)
