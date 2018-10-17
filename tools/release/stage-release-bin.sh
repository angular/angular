#!/bin/bash

# Script that builds and launches the stage release script through Bazel. An additional script is
# needed because environment variables (like $PWD) are not being interpolated within NPM scripts.

# Go to project directory.
cd $(dirname ${0})/../..

# Build and run the stage release script.
bazel run //tools/release:stage-release -- $PWD
