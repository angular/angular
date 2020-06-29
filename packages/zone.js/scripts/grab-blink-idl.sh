#!/bin/bash

set -e

trap "echo Exit; exit;" SIGINT SIGTERM

CORE_URL="https://src.chromium.org/blink/trunk/Source/core/"
MODULE_URL="https://src.chromium.org/blink/trunk/Source/modules/"

mkdir -p blink-idl/core
mkdir -p blink-idl/modules


echo "Fetching core idl files..."

rm tmp/ -rf
svn co $CORE_URL tmp -q

for IDL in $(find tmp/ -iname '*.idl' -type f -printf '%P\n')
do
    echo "- $IDL"
    mv "tmp/$IDL" blink-idl/core
done

echo "Fetching modules idl files..."

rm tmp/ -rf
svn co $MODULE_URL tmp -q

for IDL in $(find tmp/ -iname '*.idl' -type f -printf '%P\n')
do
    echo "- $IDL"
    mv "tmp/$IDL" blink-idl/modules
done

rm tmp/ -rf
