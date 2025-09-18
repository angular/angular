#!/usr/bin/env bash

set -u -e -o pipefail

CI=${CI:-false}

cd "$(dirname "$0")"

# If we aren't running on CircleCI, we do not shard tests because this would be the job of
# Bazel eventually. For now, we just run all tests sequentially when running locally.
if [ -n "${1:-}" ]; then
  readonly RUN_TESTS=$@
else
  readonly RUN_TESTS=$(find $(ls) -maxdepth 0 -type d)
fi

echo "Running integration tests:"
echo ${RUN_TESTS}

# Build the packages-dist directory.
# This should be fast on incremental re-build.
pnpm build


for testDir in ${RUN_TESTS}; do
  [[ -d "$testDir" ]] || continue

  echo ""
  echo "######################################################################"
  echo "Running integration test $testDir"
  echo "######################################################################"

  (
    cd $testDir
    rm -rf dist

    # Ensure the versions of (non-local) dependencies are exact versions (not version ranges) and
    # in-sync between `package.json` and the lockfile.
    # (NOTE: This must be run before `pnpm install`, which updates the lockfile.)
    node ../check-dependencies .

    pnpm install
    pnpm run test || exit 1

    # remove the temporary node modules directory to keep the source folder clean.
    rm -rf node_modules
  )
done
