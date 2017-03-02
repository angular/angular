#!/bin/bash

set -u -e -o pipefail

# override test failure so that we perform this file regardless and not abort in env.sh
TRAVIS_TEST_RESULT=0

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


for FILE in ${LOGS_DIR}/*; do
  travisFoldStart "print log file: ${FILE}"
    cat $FILE
  travisFoldEnd "print log file: ${FILE}"
done


# Print return arrows as a log separator
travisFoldReturnArrows
