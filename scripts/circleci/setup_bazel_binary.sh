#!/bin/bash

set -e

bazelBin=$(node -p "require('@bazel/bazelisk/bazelisk.js').getNativeBinary()")

# Provide the bazel binary globally. We don't want to access the binary
# through Node as it could result in limited memory.
sudo chmod a+x ${bazelBin}
sudo ln -fs ${bazelBin} /usr/local/bin/bazel
