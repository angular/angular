#!/usr/bin/env bash

set -e -o pipefail

cd `dirname $0`

if [ ! -d "rxjs/dist/es6" ]; then
  echo "You must run build the ES2015 version of RxJS for some tests:"
  echo "./integration/build_rxjs_es6.sh"
  exit 1
fi

# Workaround https://github.com/yarnpkg/yarn/issues/2165
# Yarn will cache file://dist URIs and not update Angular code
readonly cache=.yarn_local_cache
function rm_cache {
  rm -rf $cache
}
rm_cache
mkdir $cache
trap rm_cache EXIT

for testDir in $(ls | grep -v rxjs | grep -v node_modules) ; do
  [[ -d "$testDir" ]] || continue
  echo "#################################"
  echo "Running integration test $testDir"
  echo "#################################"
  (
    cd $testDir
    # Workaround for https://github.com/yarnpkg/yarn/issues/2256
    rm -f yarn.lock
    yarn install --cache-folder ../$cache
    yarn test || exit 1
  )
done
