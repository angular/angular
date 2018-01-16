#!/usr/bin/env bash
# This script replaces 'ngDevMode' by false in @angular/core/render3 source code, so that this code can be eliminated.
# This is a workaround for https://github.com/google/closure-compiler/issues/1601

find built/packages/core/src/render3/* -name '*.js' -exec sed  -i '' -e "s/import '.\/ng_dev_mode';//g" {} \;
find built/packages/core/src/render3/* -name '*.js' -exec sed  -i '' -e 's/ngDevMode/false/g' {} \;
