#!/usr/bin/env bash
set -u -e -o pipefail

# The path of the .bazelrc.user file to update should be passed as first parameter to this script.
# This allows to setup RBE for both the Angular repo and the Material repo.
bazelrc_user="$1"

echo "Writing RBE configuration to ${bazelrc_user}"

touch ${bazelrc_user}
echo -e 'build --config=remote\n' >> ${bazelrc_user}
echo -e 'build:remote --remote_accept_cached=true\n' >> ${bazelrc_user}
echo "Reading from remote cache for bazel remote jobs."
if [[ "$CI_PULL_REQUEST" == "false" ]]; then
  echo -e 'build:remote --remote_upload_local_results=true\n' >> ${bazelrc_user}
  echo "Uploading local build results to remote cache."
else
  echo -e 'build:remote --remote_upload_local_results=false\n' >> ${bazelrc_user}
  echo "Not uploading local build results to remote cache."
fi
