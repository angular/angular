#!/usr/bin/env bash

cd `dirname $0`
./build.sh
echo "====== RENAMING @angular to @igorminar ======"
find ./dist/packages-dist/ -type f -print0 | xargs -0 sed -i '' 's/\@angular/\@igorminar/g'
