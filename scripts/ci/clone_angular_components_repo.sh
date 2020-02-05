#!/usr/bin/env bash
set -u -e -o pipefail

# Clones the `angular/components` repository if the repository has not been cloned before.
# If the repository has been already cloned, the script refreshes the repository by syncing
# with the upstream remote, and resetting to the commit specified in the `COMPONENTS_REPO_COMMIT`
# environment variable.

if [[ ! -d "${COMPONENTS_REPO_TMP_DIR}" ]]; then
  # Clone the repository if not present through restored cache.
  git clone --branch ${COMPONENTS_REPO_BRANCH} ${COMPONENTS_REPO_URL} ${COMPONENTS_REPO_TMP_DIR}

  # Switch into the cloned repository.
  cd ${COMPONENTS_REPO_TMP_DIR}

  # Reset branch to the desired commit.
  git reset --hard ${COMPONENTS_REPO_COMMIT}
else
  # Switch into the cached repository.
  cd ${COMPONENTS_REPO_TMP_DIR}

  # Only refresh the repository if the current branch HEAD is not
  # matching the desired commit.
  if [[ "$(git rev-parse HEAD)" != "${COMPONENTS_REPO_COMMIT}" ]]; then
    # Pull the latest changes of the specified branch.
    git fetch origin ${COMPONENTS_REPO_BRANCH}

    # Reset the current branch to the desired commit.
    git reset --hard ${COMPONENTS_REPO_COMMIT}
  fi
fi
