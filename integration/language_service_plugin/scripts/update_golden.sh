#!/usr/bin/env bash

set -ex -o pipefail

cd `dirname $0`
cd ..

UPDATE_GOLDEN=true scripts/test.sh