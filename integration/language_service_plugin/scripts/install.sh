#!/usr/bin/env bash

set -ex -o pipefail

cd `dirname $0`
cd ..
source scripts/env.sh

# Setup TypeScripts
for TYPESCRIPT in ${TYPESCRIPTS[@]}
do
  (
    cd typescripts/$TYPESCRIPT
    yarn
  )
done