#!/usr/bin/env bash

source ./scripts/package-builder.sh

# Build the ivy packages
buildTargetPackages "dist/packages-dist-ivy-aot" "aot" "Ivy AOT"
