#!/usr/bin/env bash

set -eux -o pipefail
# -e: exits if a command fails
# -u: errors if an variable is referenced before being set
# -x: shows the commands that get run
# -o pipefail: causes a pipeline to produce a failure return code if any command errors

if [ -x "$(command -v ../../node_modules/.bin/bazel)" ]; then
  BAZEL=../../node_modules/.bin/bazel
elif [ -x "$(command -v bazel)" ]; then
  BAZEL=bazel
fi

${BAZEL} test --config=saucelabs --define=SAUCE_BROWSER=SL_CHROME //test/e2e:prodserver_sauce_test
${BAZEL} test --config=saucelabs --define=SAUCE_BROWSER=SL_CHROMELEGACY //test/e2e:prodserver_sauce_test
${BAZEL} test --config=saucelabs --define=SAUCE_BROWSER=SL_IE10 //test/e2e:prodserver_sauce_test
${BAZEL} test --config=saucelabs --define=SAUCE_BROWSER=SL_IE11 //test/e2e:prodserver_sauce_test
${BAZEL} test --config=saucelabs --define=SAUCE_BROWSER=SL_EDGE //test/e2e:prodserver_sauce_test
