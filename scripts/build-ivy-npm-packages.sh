#!/usr/bin/env bash

source $(dirname $0)/package-builder.sh

# Build the ivy packages
buildTargetPackages "dist/packages-dist-ivy-aot" "aot" "Ivy AOT"
