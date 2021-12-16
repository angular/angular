#!/bin/bash

# --- begin runfiles.bash initialization v2 ---
# Copy-pasted from the Bazel Bash runfiles library v2. We need to copy the runfile
# helper code as we want to resolve Bazel targets through the runfiles (in order to
# make the dev-server work on windows where runfiles are not symlinked). The runfile
# helpers expose a bash function called "rlocation" that can be used to resolve targets.
set -uo pipefail; f=bazel_tools/tools/bash/runfiles/runfiles.bash
source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" 2>/dev/null || \
source "$0.runfiles/$f" 2>/dev/null || \
source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
{ echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
# --- end runfiles.bash initialization v2 ---

# If we do not run the devserver as part of a test, we always enforce runfile
# resolution when invoking the devserver NodeJS binary. This is necessary as
# runfile trees are disabled as part of this repository. The devserver NodeJS
# binary would not find a relative runfile tree directory and error out.
if [[ -z "${TEST_SRCDIR:-""}" ]]; then
  export RUNFILES_MANIFEST_ONLY="1"
fi

# Resolve the path of the dev-server binary. Note: usually we either need to
# resolve the "nodejs_binary" executable with different file extensions on
# windows, but since we already run this launcher as part of a "sh_binary", we
# can safely execute another shell script from the current shell.
devserverBin=$(rlocation "angular/devtools/tools/dev-server/dev-server_bin.sh")

# Start the devserver with the given arguments. The arguments will be
# substituted based on the rule attributes.
${devserverBin} TEMPLATED_args "$@"
