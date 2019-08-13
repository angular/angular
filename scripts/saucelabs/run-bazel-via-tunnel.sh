#!/usr/bin/env bash

set -u -e -o pipefail

# Prints out usage information for the script.
function printUsage {
  echo -e "\e[1mrun-bazel-via-tunnel.sh\e[0m - Runs a bazel command using a saucelabs tunnel

  \e[1mUsage:\e[0m $0 --tunnel-id=<tunnel_id> \\
              --username=<saucelabs_username> --key=<saucelabs_key> <bazel command>

  \e[1mExample:\e[0m ./run-bazel-via-tunnel.sh --tunnel-id=<tunnel_id> \\
              --username=<saucelabs_username> --key=<saucelabs_key> \\
              yarn bazel test //src:everything

  Flags:
    --username: The saucelabs username
    --key: The saucelabs access key
    --tunnel-id: An identifier for the saucelabs tunnel";
}

# Ensures a file is created, creating directories for the full path as needed.
function touch-safe {
  for f in "$@"; do
    [ -d $f:h ] || mkdir -p $f:h && command touch $f
  done
}

# The root directory of the git project the script is running in.
readonly GIT_ROOT_DIR=$(git rev-parse --show-toplevel 2> /dev/null)
# Location for the saucelabs log file.
readonly SAUCE_LOG_FILE=/tmp/angular/sauce-connect.log
# Location for the saucelabs ready to connect lock file.
readonly SAUCE_READY_FILE=/tmp/angular/sauce-connect-ready-file.lock
# Location for the saucelabs ready to connection process id lock file.
readonly SAUCE_PID_FILE=/tmp/angular/sauce-connect-pid-file.lock
# Amount of seconds we wait for sauceconnect to establish a tunnel instance. In order to not
# acquire CircleCI instances for too long if sauceconnect failed, we need a connect timeout.
readonly SAUCE_READY_FILE_TIMEOUT=120

# Create saucelabs log file if it doesn't already exist.
touch-safe $SAUCE_LOG_FILE;

# Handle configuration of script from command line flags and arguments
OPTIONS=$(getopt -u -l tunnel-id:,username:,key:,help --options "" -- "$@")
# Exit if flag parsing fails.
if [ $? != 0 ] ; then echo "Failed to parse flags, exiting" && printUsage >&2 ; exit 1 ; fi
set -- $OPTIONS
while true; do
  case "$1" in
    --tunnel-id)
        shift
        SAUCE_TUNNEL_IDENTIFIER=$1
        ;;
    --username)
        shift
        SAUCE_USERNAME=$1
        ;;
    --key)
        shift
        SAUCE_ACCESS_KEY=$1
        ;;
    --help)
        printUsage
        exit 2
        ;;
    --)
        shift
        USER_COMMAND=$@
        break
        ;;
    *)
        shift
        ;;
  esac
done

# Check each required flag and parameter
if [[ -z ${SAUCE_TUNNEL_IDENTIFIER+x} ]]; then
  echo "Missing required flag: --tunnel-id"
  badCommandSyntax=1
fi
if [[ -z ${SAUCE_USERNAME+x} ]]; then
  echo "Missing required flag: --username"
  badCommandSyntax=1
fi
if [[ -z ${SAUCE_ACCESS_KEY+x} ]]; then
  echo "Missing required flag: --key"
  badCommandSyntax=1
fi
if [[ "${USER_COMMAND}" == "" ]]; then
  echo "Missing required bazel command: Bazel command for running in saucelabs tunnel"
  badCommandSyntax=1
elif [[ ! $USER_COMMAND =~ ^(yarn bazel) ]]; then
  echo "The command provided must be a bazel command run via yarn, beginning with \"yarn bazel\""
  badCommandSyntax=1
fi

# If any required flag or parameter were found to be missing or incorrect, exit the script.
if [[ ${badCommandSyntax+x} ]]; then
  echo
  printUsage
  exit 1
fi


# Command arguments that will be passed to sauce-connect.
# By default we disable SSL bumping for all requests. This is because SSL bumping is
# not needed for our test setup and in order to perform the SSL bumping, Saucelabs
# intercepts all HTTP requests in the tunnel VM and modifies them. This can cause
# flakiness as it makes all requests dependent on the SSL bumping middleware.
# See: https://wiki.saucelabs.com/display/DOCS/Troubleshooting+Sauce+Connect#TroubleshootingSauceConnect-DisablingSSLBumping
sauceArgs="--no-ssl-bump-domains all"
sauceArgs="${sauceArgs} --logfile ${SAUCE_LOG_FILE}"
sauceArgs="${sauceArgs} --readyfile ${SAUCE_READY_FILE}"
sauceArgs="${sauceArgs} --pidfile ${SAUCE_PID_FILE}"
sauceArgs="${sauceArgs} --tunnel-identifier ${SAUCE_TUNNEL_IDENTIFIER}"
sauceArgs="${sauceArgs} -u ${SAUCE_USERNAME}"

#########################
# Open saucelabs tunnel #
#########################


${GIT_ROOT_DIR}/node_modules/sauce-connect/bin/sc -k $SAUCE_ACCESS_KEY ${sauceArgs} &


########################################
# Wait for saucelabs tunnel to connect #
########################################
counter=0

while [[ ! -f ${SAUCE_READY_FILE} ]]; do
  counter=$((counter + 1))

  # Counter needs to be multiplied by two because the while loop only sleeps a half second.
  # This has been made in favor of better progress logging (printing dots every half second)
  if [ $counter -gt $[${SAUCE_READY_FILE_TIMEOUT} * 2] ]; then
    echo "Timed out after ${SAUCE_READY_FILE_TIMEOUT} seconds waiting for tunnel ready file."
    echo "Printing logfile output:"
    echo ""
    cat ${SAUCE_LOG_FILE}
    exit 5
  fi

  printf "."
  sleep 0.5
done

#########################
# Execute Bazel command #
#########################

# Prevent immediate exit for Bazel test failures
set +e

(
  cd $GIT_ROOT_DIR && \
  # Run bazel command with saucelabs specific environment variables passed to the action
  # The KARMA_WEB_TEST_MODE and SAUCE_TUNNEL_IDENTIFIER environment variables provide
  # envirnment variables to be read in the karma configuration file to set correct
  # configurations for karma saucelabs and browser configs.
  # Usage of these envirnment variables can be seen in this repo in
  # /karma-js.conf.js and /browser-providers.conf.js
  eval "$USER_COMMAND --define=KARMA_WEB_TEST_MODE=SL_REQUIRED \
                      --action_env=SAUCE_USERNAME=$SAUCE_USERNAME \
                      --action_env=SAUCE_ACCESS_KEY=$SAUCE_ACCESS_KEY \
                      --action_env=SAUCE_READY_FILE=$SAUCE_READY_FILE \
                      --action_env=SAUCE_PID_FILE=$SAUCE_PID_FILE \
                      --action_env=SAUCE_TUNNEL_IDENTIFIER=$SAUCE_TUNNEL_IDENTIFIER"
)
BAZEL_EXIT_CODE=$?
echo "Exit code for bazel command was: $BAZEL_EXIT_CODE"

# Reenable immediate exit for failure exit code
set -e

##############################
# Close the saucelabs tunnel #
##############################

if [[ ! -f ${SAUCE_PID_FILE} ]]; then
  echo "Could not find Saucelabs tunnel PID file. Cannot stop tunnel.."
  exit 1
fi

echo "Shutting down Sauce Connect tunnel"

# The process id for the sauce-connect instance is stored inside of the pidfile.
tunnelProcessId=$(cat ${SAUCE_PID_FILE})

# Kill the process by using the PID that has been read from the pidfile. Note that
# we cannot use killall because CircleCI base container images don't have it installed.
kill ${tunnelProcessId}

while (ps -p ${tunnelProcessId} &> /dev/null); do
  printf "."
  sleep .5
done

echo ""
echo "Sauce Connect tunnel has been shut down"

exit $BAZEL_EXIT_CODE
