#!/usr/bin/env bash

source $(dirname $0)/package-builder.sh

# Build the legacy (view engine) npm packages into dist/packages-dist
buildTargetPackages "dist/packages-dist" "legacy" "Production"
