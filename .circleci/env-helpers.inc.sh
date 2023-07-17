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
  setSecretVar $1 "$2";
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

  local assignmentStatement="export $1=\"${2:-}\";"

  echo "${assignmentStatement}" >> $BASH_ENV;
  eval "${assignmentStatement}"

  # Restore original shell options.
  eval "$originalShellOptions";
}


# Create a function to set an environment variable, when called.
#
# Use this function for creating setter for public environment variables that require expensive or
# time-consuming computaions and may not be needed. When needed, you can call this function to set
# the environment variable (which will be available through `$BASH_ENV` from that point onwards).
#
# Arguments:
# - `<name>`: The name of the environment variable. The generated setter function will be
#   `setPublicVar_<name>`.
# - `<code>`: The code to run to compute the value for the variable. Since this code should be
#   executed lazily, it must be properly escaped. For example:
#   ```sh
#   # DO NOT do this:
#   createPublicVarSetter MY_VAR "$(whoami)";  # `whoami` will be evaluated eagerly
#
#   # DO this isntead:
#   createPublicVarSetter MY_VAR "\$(whoami)";  # `whoami` will NOT be evaluated eagerly
#   ```
#
# Usage: `createPublicVarSetter <name> <code>`
#
# Example:
# ```sh
# createPublicVarSetter MY_VAR 'echo "FOO"';
# echo $MY_VAR;  # Not defined
#
# setPublicVar_MY_VAR;
# source $BASH_ENV;
# echo $MY_VAR;  # FOO
# ```
function createPublicVarSetter() {
  echo "setPublicVar_$1() { setPublicVar $1 \"$2\"; }" >> $BASH_ENV;
}
