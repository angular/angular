#!/usr/bin/env bash

set -ex -o pipefail

if [[ ${TRAVIS} && ${CI_MODE} != "lint" ]]; then
  exit 0;
fi


echo 'travis_fold:start:lint'

gulp lint
gulp check-format

echo 'travis_fold:end:lint'
