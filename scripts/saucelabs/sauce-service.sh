#!/usr/bin/env bash

set -u -e -o pipefail

####################################################################################################
# Required environment variables

if [[ -z "${SAUCE_USERNAME:-}" ]]; then
  echo "SAUCE_USERNAME environment variable required"
  exit 1
fi

if [[ -z "${SAUCE_ACCESS_KEY:-}" ]]; then
  echo "SAUCE_ACCESS_KEY environment variable required"
  exit 1
fi

if [[ -z "${SAUCE_TUNNEL_IDENTIFIER:-}" ]]; then
  echo "SAUCE_TUNNEL_IDENTIFIER environment variable required"
  exit 1
fi

####################################################################################################
# Some helper funtions

@e() {
  echo "# $*"
}

@warn() {
  @e "Warning: $*" >&2
}

@err() {
  @e "Error! $*" >&2
  exit 1
}

@remove() {
  local f=$1
  if [[ -f ${f} ]]; then
    @e "Removing $f"
    rm -f "$f" || @err "Can not delete $f file"
  fi
}

@kill() {
  for p in $1; do
    if kill -0 $p >/dev/null 2>&1; then
      kill $p
      sleep 2
      if kill -0 $p >/dev/null 2>&1;  then
        kill -9 $p
        sleep 2
      fi
    fi
  done
}

@wait_for() {
  local m="$1"
  local f="$2"
  if [[ ! -f "${f}" ]]; then
    printf "# $1 (${f})"
    while [[ ! -f "${f}" ]]; do
      printf "."
      sleep 0.5
    done
    printf "\n"
  fi
}

####################################################################################################
# Sauce service functions

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=linux ;;
    Darwin*)    machine=darwin ;;
    CYGWIN*)    machine=windows ;;
    MINGW*)     machine=windows ;;
    MSYS_NT*)   machine=windows ;;
    *)          machine=linux
                printf "\nUnrecongized uname '${unameOut}'; defaulting to use node for linux.\n" >&2
                printf "Please file an issue to https://github.com/bazelbuild/rules_nodejs/issues if \n" >&2
                printf "you would like to add your platform to the supported rules_nodejs node platforms.\n\n" >&2
                ;;
esac

readonly SCRIPT_DIR=$(cd $(dirname $0); pwd)
readonly TMP_DIR="/tmp/angular/sauce-service"
mkdir -p ${TMP_DIR}

case "${machine}" in
  # Path to sauce connect executable
  linux)
    SAUCE_CONNECT="${SCRIPT_DIR}/../../node_modules/sauce-connect/bin/sc"
    if [[ ! -f ${SAUCE_CONNECT} ]]; then
      # Path in runfiles tree (when running under Bazel)
      SAUCE_CONNECT="../npm/node_modules/sauce-connect/bin/sc"
    fi
    ;;
  *)
    if [[ -z "${SAUCE_CONNECT:-}" ]]; then
      echo "SAUCE_CONNECT environment variable is required on non-linux environments"
      exit 1
    fi
    ;;
esac

# Location for the saucelabs log file.
readonly SAUCE_LOG_FILE="${TMP_DIR}/sauce-connect.log"

# Location for the saucelabs ready to connection process id lock file.
readonly SAUCE_PID_FILE="${TMP_DIR}/sauce-connect.pid"

# Location for the saucelabs ready to connect lock file.
readonly SAUCE_READY_FILE="${TMP_DIR}/sauce-connect.lock"

# Amount of seconds we wait for sauceconnect to establish a tunnel instance. In order to not
# acquire CircleCI instances for too long if sauceconnect failed, we need a connect timeout.
readonly SAUCE_READY_FILE_TIMEOUT=120

# Command arguments that will be passed to sauce-connect.
# By default we disable SSL bumping for all requests. This is because SSL bumping is
# not needed for our test setup and in order to perform the SSL bumping, Saucelabs
# intercepts all HTTP requests in the tunnel VM and modifies them. This can cause
# flakiness as it makes all requests dependent on the SSL bumping middleware.
# See: https://wiki.saucelabs.com/display/DOCS/Troubleshooting+Sauce+Connect#TroubleshootingSauceConnect-DisablingSSLBumping
SAUCE_ARGS=(
  "--no-ssl-bump-domains all"
  "--logfile ${SAUCE_LOG_FILE}"
  "--pidfile ${SAUCE_PID_FILE}"
  "--readyfile ${SAUCE_READY_FILE}"
)
if [[ ! -z "${SAUCE_TUNNEL_IDENTIFIER:-}" ]]; then
  SAUCE_ARGS+=("--tunnel-identifier ${SAUCE_TUNNEL_IDENTIFIER}")
fi
if [[ ! -z "${SAUCE_USERNAME:-}" ]]; then
  SAUCE_ARGS+=("--user ${SAUCE_USERNAME}")
fi
# Don't add the --api-key here as we don't echo it out in service-pre-start

readonly SERVICE_LOCK_FILE="${TMP_DIR}/service.lock"
readonly SERVICE_START_FILE="${TMP_DIR}/service.start"
readonly SERVICE_PID_FILE="${TMP_DIR}/service.pid"
readonly SERVICE_LOG_FILE="${TMP_DIR}/service.log"
readonly SERVICE_COMMAND="${SAUCE_CONNECT} ${SAUCE_ARGS[@]} --api-key ${SAUCE_ACCESS_KEY}"

# Called by pre-start & post-stop
service-cleanup() {
  if [[ -f "${SAUCE_PID_FILE}" ]]; then
    local p=$(cat "${SAUCE_PID_FILE}")
    @e "Stopping Sauce Connect (pid $p)..."
    @kill $p
  fi
  @remove "${SAUCE_PID_FILE}"
  @remove "${SAUCE_READY_FILE}"
}

# Called before service is setup
service-pre-setup() {
  service-cleanup
  @e "Starting Sauce Connect Proxy..."
  echo "${SAUCE_CONNECT} \\"
  printf '  %s \\\n' "${SAUCE_ARGS[@]}" 
}

# Called after service is started
service-post-start() {
  @wait_for "Waiting for Sauce Connect Proxy process" "${SAUCE_PID_FILE}"
  @e "Sauce Connect Proxy started (pid $(cat "${SAUCE_PID_FILE}"))"
}

# Called if service fails to start
service-failed-start() {
  if [[ -f "${SERVICE_LOG_FILE}" ]]; then
    echo "================================================================================"
    echo "${SERVICE_LOG_FILE}:"
    echo $(cat "${SERVICE_LOG_FILE}")
  fi
}

# Called by ready-wait action
service-ready-wait() {
  if [[ ! -f "${SAUCE_PID_FILE}" ]]; then
    @err "Sauce Connect not running"
  fi
  if [[ ! -f "${SAUCE_READY_FILE}" ]]; then
    # Wait for saucelabs tunnel to connect
    printf "# Waiting for saucelabs tunnel to connect (${SAUCE_READY_FILE})"
    counter=0
    while [[ ! -f "${SAUCE_READY_FILE}" ]]; do
      counter=$((counter + 1))

      # Counter needs to be multiplied by two because the while loop only sleeps a half second.
      # This has been made in favor of better progress logging (printing dots every half second)
      if [ $counter -gt $[${SAUCE_READY_FILE_TIMEOUT} * 2] ]; then
        @e "Timed out after ${SAUCE_READY_FILE_TIMEOUT} seconds waiting for tunnel ready file."
        if [[ -f "${SAUCE_LOG_FILE}" ]]; then
          echo "================================================================================"
          echo "${SAUCE_LOG_FILE}:"
          cat "${SAUCE_LOG_FILE}"
        fi
        exit 5
      fi

      printf "."
      sleep 0.5
    done
    printf "\n"
    @e "Saucelabs tunnel connected"
  else
    @e "Saucelabs tunnel already connected"
  fi
}

# Called before service is stopped
service-pre-stop() {
  return
}

# Called after service is stopped
service-post-stop() {
  service-cleanup
}

####################################################################################################
# Generic service functions
# This uses functions setup above but nothing below should be specific to saucelabs

@serviceLock() {
  # Check is Lock File exists, if not create it and set trap on exit
  printf "# Waiting for service action lock (${SERVICE_LOCK_FILE})"
  while true; do
    if { set -C; 2>/dev/null >"${SERVICE_LOCK_FILE}"; }; then
      trap "rm -f \"${SERVICE_LOCK_FILE}\"" EXIT
      printf "\n"
      break
    fi
    printf "."
    sleep 0.5
  done
  @e "Acquired service action lock"
}

@serviceStatus() {
  if [ -f "${SERVICE_PID_FILE}" ] && [ ! -z "$(cat "${SERVICE_PID_FILE}")" ]; then
    local p=$(cat "${SERVICE_PID_FILE}")

    if kill -0 $p >/dev/null 2>&1; then
      @e "Service is running (pid $p)"
      return 0
    else
      @e "Service is not running (process PID $p not exists)"
      return 1
    fi
  else
    @e "Service is not running"
    return 2
  fi
}

@serviceSetup() {
  if @serviceStatus >/dev/null 2>&1; then
    @e "Service already running (pid $(cat "${SERVICE_PID_FILE}"))"
    return 0
  fi

  @e "Setting up service..."
  @remove "${SERVICE_PID_FILE}"
  @remove "${SERVICE_START_FILE}"
  touch "${SERVICE_LOG_FILE}" >/dev/null 2>&1 || @err "Can not create ${SERVICE_LOG_FILE} file"
  @e "  service pid  : ${SERVICE_PID_FILE}"
  @e "  service logs : ${SERVICE_LOG_FILE}"
  service-pre-setup

  (
    (
      @wait_for "Waiting for start file" "${SERVICE_START_FILE}"
      ${SERVICE_COMMAND}
    ) >>"${SERVICE_LOG_FILE}" 2>&1 
  ) &
  echo $! >"${SERVICE_PID_FILE}"

  if @serviceStatus >/dev/null 2>&1; then
    @e "Service setup (pid $(cat "${SERVICE_PID_FILE}"))"
  else
    @e "Error setting up Service!"
    service-failed-start
    exit 1
  fi

  return $?
}

@serviceStart() {
  if ! @serviceStatus >/dev/null 2>&1; then
    @serviceSetup
  else
    @e "Service already setup (pid $(cat "${SERVICE_PID_FILE}"))"
  fi
  if [[ -f "${SERVICE_START_FILE}" ]]; then
    @e "Service already started"
  else
    @e "Starting service..."
    touch "${SERVICE_START_FILE}" >/dev/null 2>&1 || @err "Can not create ${SERVICE_START_FILE} file"
    service-post-start
    @e "Service started"
  fi
}

@serviceStop() {
  if @serviceStatus >/dev/null 2>&1; then
    touch "${SERVICE_PID_FILE}" >/dev/null 2>&1 || @err "Can not touch ${SERVICE_PID_FILE} file"

    service-pre-stop
    @e "Stopping sevice (pid $(cat "${SERVICE_PID_FILE}"))..."
    @kill $(cat "${SERVICE_PID_FILE}")

    if @serviceStatus >/dev/null 2>&1; then
      @err "Error stopping Service! Service already running with PID $(cat "${SERVICE_PID_FILE}")"
    else
      @e "Service stopped"
      @remove "${SERVICE_PID_FILE}"
      @remove "${SERVICE_START_FILE}"
      service-post-stop
    fi

    return 0
  else
    @warn "Service is not running"
    service-post-stop
  fi
}

@serviceStartReadyWait() {
  @serviceStart
  @serviceReadyWait
}

@serviceReadyWait() {
  service-ready-wait
}

@serviceRestart() {
  @serviceStop
  @serviceStart
}

@serviceTail() {
  tail -f "${SERVICE_LOG_FILE}"
}

case "${1:-}" in
  setup)
    @serviceLock
    @serviceSetup
    ;;
  start)
    @serviceLock
    @serviceStart
    ;;
  start-ready-wait)
    @serviceLock
    @serviceStartReadyWait
    ;;
  ready-wait)
    @serviceLock
    @serviceReadyWait
    ;;
  stop)
    @serviceLock
    @serviceStop
    ;;
  restart)
    @serviceLock
    @serviceRestart
    ;;
  status)
    @serviceLock
    @serviceStatus
    ;;
  run)
    (
      ${SERVICE_COMMAND}
    )
    ;;
  tail)
    @serviceTail
    ;;
  *)
    @e "Actions: [setup|start|start-read-wait|ready-wait|stop|restart|status|run|tail]"
    exit 1
    ;;
esac
