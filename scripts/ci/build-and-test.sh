#!/usr/bin/env bash
set -ex

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Include sources.
source scripts/ci/sources/mode.sh
source scripts/ci/sources/tunnel.sh

start_tunnel

wait_for_tunnel
if is_lint; then
  npm run tslint  
  npm run ci:forbidden-identifiers
  npm run stylelint
elif is_circular_deps_check; then
  # Build first because madge needs the JavaScript output.
  ng build
  npm run check-circular-deps
elif is_e2e; then
  # Start up the e2e app. This will take some time.
  echo "Starting e2e app"
  MD_APP=e2e ng serve &
  sleep 1

  # Wait until the dist/ directory is created, indicating that the e2e app is ready.
  # Use the presence of `button.js` to determine whether the compiled output is ready to be served.
  echo "Waiting for e2e app to start"
  while [ ! -f ./dist/components/button/button.js ]; do
    sleep 2
    echo -n ".."
  done

  echo "\nInlining resources"
  npm run inline-resources

  # Run the e2e tests on the served e2e app.
  echo "Starting e2e tests"
  ng e2e
elif is_extract_metadata; then
  # Run `tsc` first so that the directory structure in dist/ matches what ngc expects.
  ./node_modules/.bin/tsc -p ./src/demo-app/
  ./node_modules/.bin/ngc -p ./src/demo-app/
else
  # Unit tests
  npm run build
  npm run inline-resources

  karma start test/karma.conf.js --single-run --no-auto-watch --reporters='dots'
fi
teardown_tunnel
