#!/bin/bash
# A script for automatically configuring a user's local dev
# environment to use Remote Build Execution.

# Short cuts to set output as bold and normal
bold=$(tput bold)
normal=$(tput sgr0)

# Determine the root directory of the Angular github repo.
project_directory=$(git rev-parse --show-toplevel 2> /dev/null)
if [[ $? -ne 0 ]]; then
  echo "This command must be run from within the cloned \"angular/angular\" repository"
  exit 1
fi

# Confirm gcloud installed and available as a command.
if [ ! -x "$(command -v gcloud)" ]; then
  echo "gcloud command is not available. Please install gcloud before continuing"
  echo "Please visit: https://cloud.google.com/sdk/install"
  exit 1
fi

# Confirm the user is already logged into gcloud, if they aren't
# attempt to login
echo "Checking gcloud login state"
gcloud auth application-default print-access-token &> /dev/null
if [[ $? -ne 0 ]]; then
  echo "Not currently logged into gcloud. Starting gcloud login now"
  gcloud auth application-default login
  if [[ $? -ne 0 ]]; then
    echo "gcloud login failed. Aborting"
    exit 2
  fi
fi
access_token=$(gcloud auth application-default print-access-token)
current_account=$(curl -s https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=$access_token | jq -r '.email')
if [[ ! $current_account =~ (angular\.io$)|(google\.com$) ]]; then
  echo "Currently an angular.io or google.com account must be used for remote Bazel usage"
  echo "Please login instead using the correct account with the following command, then rerun"
  echo "  gcloud auth application-default login"
  exit 3
fi
echo "Logged in as $current_account";

# The full path to the .bazelrc.user file
bazelrc_user_filepath="$project_directory/.bazelrc.user"
# Create the bazelrc.user file, echo the config flags into the file.
touch $bazelrc_user_filepath

# Prompts to add a flag to the .bazelrc.user file if its not already in place
function add_flag() {
  flag=$1
  read -p "  Add $flag flag? [Y/y]"
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [[ ! $(grep "^$flag$" $bazelrc_user_filepath) ]]; then
      echo "$flag" >> $bazelrc_user_filepath
      echo "Added $flag to .bazelrc.user"
    else
      echo "$flag already in .bazelrc.user"
    fi
  fi
  echo
}

# Add extra line space before config setup.
echo
# Remote HTTP Caching
echo "The ${bold}remote-http-caching${normal} flag enables uploading build results to the http cache,"
echo "but not does enable remote builds"
add_flag "build --config=remote-http-caching"

# Remote builds
echo "The ${bold}remote${normal} flag enables RBE, builds occurs remotely when possible and caching"
echo "occurs in the RBE context"
add_flag "build --config=remote"
