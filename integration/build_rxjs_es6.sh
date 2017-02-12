#!/usr/bin/env bash

# This script builds rxjs from source, with an ES6 target, and with tsickle turned on.
# We need to do this until we work with the RxJS team to get a distribution that works
# with Closure Compiler.
# Note that in nodejs, we still run the standard RxJS distribution. This one is only
# used for the bundle that targets a browser runtime.
# TODO(alexeagle): discuss with Jay Phelps once we have a recommendation

set -e -o pipefail

cd `dirname $0`

rm -rf rxjs
git clone https://github.com/ReactiveX/rxjs.git --depth=200
git -C rxjs/ checkout 5.0.3
cp rxjs.tsconfig.json rxjs/
TSC="node --max-old-space-size=3000 ../dist/tools/@angular/tsc-wrapped/src/main"
$TSC -p rxjs/rxjs.tsconfig.json
