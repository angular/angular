#!/usr/bin/env bash

set -ex -o pipefail

cd `dirname $0`
cd ..
source scripts/env.sh

HOST="node tools/typescript_host.js"
VALIDATE="node tools/typescript_validator.js"

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