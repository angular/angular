#!/usr/bin/env bash

set -u -e -o pipefail

# Clones the Angular Material repository if the repository has not been cloned before. If
# the repository is already cloned, the script refreshes the repository by syncing with
# upstream and resetting to the desired Material commit (see "MATERIAL_REPO_COMMIT" variable).

if [[ ! -d "${MATERIAL_REPO_TMP_DIR}" ]]; then
  # Clone the Material repository if not present through restored cache.
  git clone --branch ${MATERIAL_REPO_BRANCH} ${MATERIAL_REPO_URL} ${MATERIAL_REPO_TMP_DIR}

  # Switch into the cloned repository.
  cd ${MATERIAL_REPO_TMP_DIR}

  # Reset branch to the desired commit.
  git reset --hard ${MATERIAL_REPO_COMMIT}
else
  # Switch into the cached repository.
  cd ${MATERIAL_REPO_TMP_DIR}

  # Only refresh the repository if the current branch HEAD is not
  # matching the desired commit.
  if [[ "$(git rev-parse HEAD)" != "${MATERIAL_REPO_COMMIT}" ]]; then
    # Pull the latest changes of the specified branch.
    git fetch origin ${MATERIAL_REPO_BRANCH}

    # Reset the current branch to the desired commit.
    git reset --hard ${MATERIAL_REPO_COMMIT}
  fi
fi
