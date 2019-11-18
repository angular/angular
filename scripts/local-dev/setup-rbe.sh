#!/bin/bash
# A script for automatically configuring a user's local dev
# environment to use Remote Build Execution.
# Short cuts to set output as bold and normal
bold=$(tput bold)
normal=$(tput sgr0)

###########################################################
#                Setup/Confirm Environment                #
###########################################################
# The full path location of the script
full_script_path="$(pwd)/$(dirname ${BASH_SOURCE[0]})"
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

# The full path to the .bazelrc.user file
bazelrc_user_filepath="$project_directory/.bazelrc.user"

###########################################################
#                    Action Functions                     #
###########################################################
# Log into gcloud
function gcloud_login() {
  gcloud auth application-default login
  if [[ $? -ne 0 ]]; then
    echo "gcloud login failed. Aborting"
    exit 2
  fi
}

# Confirm the user is already logged into gcloud, if they aren't
# attempt to login.  After login, confirm the logged in account
# is from the correct domain.
function confirm_gcloud_login() {
  echo "Checking gcloud login state"
  gcloud auth application-default print-access-token &> /dev/null
  if [[ $? -ne 0 ]]; then
    echo "Not currently logged into gcloud. Starting gcloud login now"
    gcloud_login
  fi
  access_token=$(gcloud auth application-default print-access-token)
  current_account=$(curl -s https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=$access_token | node $full_script_path/get-email)
  if [[ ! $current_account =~ (angular\.io$)|(google\.com$) ]]; then
    echo "Logged in as $current_account";
    echo "An angular.io or google.com account must be used for remote Bazel usage."
    echo "Please login instead using an account from one of these domains."
    read -p "Rerun login command now? [Y/y]"
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      gcloud_login
      confirm_gcloud_login
      return
    else
      echo "Exiting..."
      exit 3
    fi
  fi
  echo "Logged in as $current_account";
}

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

###########################################################
#                  RBE Setup Script                       #
###########################################################
# Create the bazelrc.user file, echo the config flags into the file.
touch $bazelrc_user_filepath

# Ensure default credentials are valid.
confirm_gcloud_login

# Add extra line space before config setup.
echo
# Remote builds
echo "The ${bold}remote${normal} flag enables RBE, builds run remotely when possible and caching"
echo "occurs in the RBE context"
add_flag "build --config=remote"
