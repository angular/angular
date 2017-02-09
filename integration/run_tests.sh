#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

if [ ! -d "rxjs/dist/es6" ]; then
  echo "You must run build the ES2015 version of RxJS for some tests:"
  echo "./integration/build_rxjs_es6.sh"
  exit 1
fi

if [ ! -d "../dist/packages-dist-es2015" ]; then
  echo "You must build the ES2015 distro for some tests:"
  echo "EXPERIMENTAL_ES2015_DISTRO=1 ./build.sh"
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
