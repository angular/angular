#!/usr/bin/env bash

source ./scripts/package-builder.sh

# Build the legacy (view engine) npm packages into dist/packages-dist
buildTargetPackages "dist/packages-dist" "legacy" "Production"
