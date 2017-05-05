#!/usr/bin/env bash

set -e

find dist/packages-dist -name '*.js.map' -exec node check-embedded-sourcemaps.js {} \;
