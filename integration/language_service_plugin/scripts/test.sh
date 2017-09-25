#!/usr/bin/env bash

set -ex -o pipefail

cd `dirname $0`
cd ..
source scripts/env.sh

HOST="node tools/typescript_host.js"
VALIDATE="node tools/typescript_validator.js"

# Ensure the languages service can load correctly in node before typescript loads it.
# This verifies its dependencies and emits any exceptions, both of which are  only  
# emitted to the typescript logs (not the validated output).
node tools/load_test.js

for TYPESCRIPT in ${TYPESCRIPTS[@]}
do
  SERVER="node typescripts/$TYPESCRIPT/node_modules/typescript/lib/tsserver.js"
  for FIXTURE_BASE in ${FIXTURES[@]}
  do
    FIXTURE=fixtures/$FIXTURE_BASE.json
    EXPECTED=fixtures/$FIXTURE_BASE-expected-$TYPESCRIPT.json
    if [[ ${UPDATE_GOLDEN} == true ]]; then
      $HOST --file $FIXTURE --pwd $(pwd) | $SERVER | $VALIDATE --golden > $EXPECTED
    else
      $HOST --file $FIXTURE --pwd $(pwd) | $SERVER | $VALIDATE --expect $EXPECTED
    fi
  done
done