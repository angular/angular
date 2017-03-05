#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


for FILE in ${LOGS_DIR}/*; do
  travisFoldStart "print log file: ${FILE}"
    cat $FILE
  travisFoldEnd "print log file: ${FILE}"
done


# Print return arrows as a log separator
travisFoldReturnArrows
