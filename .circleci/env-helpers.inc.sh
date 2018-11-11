####################################################################################################
# Helpers for defining environment variables for CircleCI.
#
# In CircleCI, each step runs in a new shell. The way to share ENV variables across steps is to
# export them from `$BASH_ENV`, which is automatically sourced at the beginning of every step (for
# the default `bash` shell).
#
# See also https://circleci.com/docs/2.0/env-vars/#using-bash_env-to-set-environment-variables.
####################################################################################################

# Set and print an environment variable.
#
# Use this function for setting environment variables that are public, i.e. it is OK for them to be
# visible to anyone through the CI logs.
#
# Usage: `setPublicVar <name> <value>`
function setPublicVar() {
  setSecretVar $1 $2;
  echo "$1=$2";
}

# Set (without printing) an environment variable.
#
# Use this function for setting environment variables that are secret, i.e. should not be visible to
# everyone through the CI logs.
#
# Usage: `setSecretVar <name> <value>`
function setSecretVar() {
  # WARNING: Secrets (e.g. passwords, access tokens) should NOT be printed.
  # (Keep original shell options to restore at the end.)
  local -r originalShellOptions=$(set +o);
  set +x -eu -o pipefail;

  echo "export $1=\"${2:-}\";" >> $BASH_ENV;

  # Restore original shell options.
  eval "$originalShellOptions";
}
