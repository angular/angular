#!/bin/bash
# A script for automatically configuring a user's local dev
# environment to use Remote Build Execution.

# Determine the root directory of the Angular github repo.
project_directory=$(git rev-parse --show-toplevel 2> /dev/null);
if [[ $? -ne 0 ]]; then
  echo "This command must be run from within the cloned \"angular/angular\" repository.";
  exit 1;
fi

# Confirm gcloud installed and available as a command.
if [ ! -x "$(command -v gcloud)" ]; then
  echo "gcloud command is not available. Please install gcloud before continuing.";
  exit 1;
fi

# Confirm the parameter provided to the script is a directory
if [[ ! -d $1 ]]; then
  echo -e "Invalid command syntax.

  \e[1mUsage:\e[0m $0 <ServiceAccountKeyLocation>

  \e[1mExample:\e[0m ./setup-rbe ~/my_key_storage_directory/

  The directory provided will be used to store the GCP service account key
  for the angular-local-dev service account. This key will then be used to
  authenticate for usage of the Remote Build Execution system and Remote Caching.
";
  exit 1;
fi
credentials_directory=$(readlink -f $1)
if [[ ! -d $credentials_directory ]]; then
  echo "The specified directory does not exist. Please create the directory and rerun.";
  exit 1;
fi

# Create the service account key in the provided directory.
echo "Checking provided directory for a service account key.";
json_key_filepath="$credentials_directory/angular-local-dev-key.json";
if [[ -f $json_key_filepath ]]; then
  echo "Angular Local Dev key already exists, reusing this key.";
else
  # Confirm the user is already logged into gcloud, if they aren't
  # attempt to login
  echo "Checking gcloud login state.";
  gcloud auth print-identity-token &> /dev/null;
  if [[ $? -ne 0 ]]; then
    echo "Not currently logged into gcloud. Starting gcloud login now.";
    gcloud auth login;
    if [[ $? -ne 0 ]]; then
      echo "gcloud login failed. Aborting.";
      exit 2;
    fi
  fi
  gcloud iam service-accounts keys create $json_key_filepath \
    --iam-account angular-local-dev@internal-200822.iam.gserviceaccount.com \
    --quiet --project internal-200822;
  if [[ $? -ne 0 ]]; then
    echo "Downloading service account key failed. Aborting.";
    exit 2;
  fi
fi

# The full path to the .bazelrc.user file
bazelrc_user_filepath="$project_directory/.bazelrc.user";
# Create the bazelrc.user file, echo the config flags into the file.
touch $bazelrc_user_filepath;
echo "build --config=remote-http-caching" >> $bazelrc_user_filepath;
echo "build --google_credentials=$json_key_filepath" >> $bazelrc_user_filepath;
