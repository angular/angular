#!/usr/bin/env bash

set -u -e -o pipefail

# Ensure that the temporary directory does not exist.
rm -rf ${MATERIAL_REPO_TMP_DIR}

# Clone the Material repository into the given temporary directory.
git clone --depth 1 --branch ${MATERIAL_REPO_BRANCH} ${MATERIAL_REPO_URL} \
  ${MATERIAL_REPO_TMP_DIR}
