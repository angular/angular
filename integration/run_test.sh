#!/usr/bin/env bash

set -u -e -o pipefail

readonly basedir="$(dirname "$0")/.."

# Defaults
doBuild=false
trackPayload=false
cache=false

echo running
echo {$1-}

# Parse option args
while [[ ${1-} ]]
do
  case "$1" in
    --build)
      doBuild=true
      shift
      ;;
    --track)
      trackPayload=true
      shift
      ;;
    --cache)
      cache=$2
      shift 2
      ;;
    *)
      testDir=$1
      shift
      ;;
  esac
done

echo doBuild $doBuild
echo trackPayload $trackPayload
echo cache $cache
echo testDir $testDir

# Build the packages (should be fast if already built)
${basedir}/scripts/build-packages-dist.sh

if [[ ! $cache ]]; then
  # No yarn cache was provided so let's set one up

  # Workaround https://github.com/yarnpkg/yarn/issues/2165
  # Yarn will cache file://dist URIs and not update Angular code
  cache=.yarn_local_cache
  function rm_cache {
    rm -rf $cache
  }
  rm_cache
  mkdir $cache
  trap rm_cache EXIT
fi

echo "#################################"
echo "Running integration test $testDir"
echo "#################################"
(
  cd $testDir
  rm -rf dist

  yarn install --cache-folder ../$cache
  yarn test || result=1

  if [[ $doBuild != false ]]; then
    echo $doBuild
    yarn build
  fi
  if [[ $trackPayload != false ]]; then
     trackPayloadSize "$testDir" "dist/*.js" true false "${basedir}/integration/_payload-limits.json"
  fi

  # remove the temporary node modules directory to keep the source folder clean.
  rm -rf node_modules

  exit ${result-0}
)
