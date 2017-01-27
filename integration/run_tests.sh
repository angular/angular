#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

if [ ! -d "rxjs/dist/es6" ]; then
  echo "You must run build_rxjs_es6.sh before running tests"
  exit 1
fi

for testDir in $(ls | grep -v rxjs | grep -v node_modules) ; do
  [[ -d "$testDir" ]] || continue
  echo "#################################"
  echo "Running integration test $testDir"
  echo "#################################"
  (
    cd $testDir
    # Workaround for https://github.com/yarnpkg/yarn/issues/2256
    rm -f yarn.lock
    ../../node_modules/.bin/yarn
    ../../node_modules/.bin/yarn test || exit 1
  )
done
