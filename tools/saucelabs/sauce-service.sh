#!/usr/bin/env bash

set -u -e -o pipefail

####################################################################################################
# Some helper funtions

@echo() {
  echo "# $*"
}

@warn() {
  @echo "Warning: $*" >&2
}

@fail() {
  @echo "Error! $*" >&2
  exit 1
}

@remove() {
  local f="$1"
  if [[ -f ${f} ]]; then
    @echo "Removing ${f}"
    rm -f "${f}" || @fail "Can not delete ${f} file"
  fi
}

@kill() {
  for p in $1; do
    if kill -0 ${p} >/dev/null 2>&1; then
      kill ${p}
      sleep 2
      if kill -0 ${p} >/dev/null 2>&1; then
        kill -9 ${p}
        sleep 2
      fi
    fi
  done
}

@wait_for() {
  local m="$1"
  local f="$2"
  if [[ ! -f "${f}" ]]; then
    printf "# ${m} (${f})"
    while [[ ! -f "${f}" ]]; do
      printf "."
      sleep 0.5
    done
    printf "\n"
  fi
}

####################################################################################################
# Sauce service functions

readonly SCRIPT_DIR=$(cd $(dirname $0); pwd)
readonly TMP_DIR="/tmp/angular/sauce-service"
mkdir -p ${TMP_DIR}

# Location for the saucelabs log file.
readonly SAUCE_LOG_FILE="${TMP_DIR}/sauce-connect.log"

# Location for the saucelabs ready to connection process id lock file.
readonly SAUCE_PID_FILE="${TMP_DIR}/sauce-connect.pid"

# Location for the saucelabs ready to connect lock file.
readonly SAUCE_READY_FILE="${TMP_DIR}/sauce-connect.lock"

# Location for the saucelabs params file for use by test runner.
readonly SAUCE_PARAMS_JSON_FILE="${TMP_DIR}/sauce-connect-params.json"

# Amount of seconds we wait for sauceconnect to establish a tunnel instance. In order to not
# acquire CI instances for too long if sauceconnect fails, we need a connect timeout.
readonly SAUCE_READY_FILE_TIMEOUT=120

readonly SERVICE_LOCK_FILE="${TMP_DIR}/service.lock"
readonly SERVICE_START_FILE="${TMP_DIR}/service.start"
readonly SERVICE_PID_FILE="${TMP_DIR}/service.pid"
readonly SERVICE_LOG_FILE="${TMP_DIR}/service.log"

service-setup-command() {
  if [[ -z "${SAUCE_USERNAME:-}" ]]; then
    @fail "SAUCE_USERNAME environment variable required"
  fi

  if [[ -z "${SAUCE_ACCESS_KEY:-}" ]]; then
    @fail "SAUCE_ACCESS_KEY environment variable required"
  fi

  if [[ -z "${SAUCE_TUNNEL_IDENTIFIER:-}" ]]; then
    @fail "SAUCE_TUNNEL_IDENTIFIER environment variable required"
  fi

  if [[ -z "${SAUCE_CONNECT:-}" ]]; then
    local unameOut="$(uname -s)"
    case "${unameOut}" in
        Linux*)     local machine=linux ;;
        Darwin*)    local machine=darwin ;;
        CYGWIN*)    local machine=windows ;;
        MINGW*)     local machine=windows ;;
        MSYS_NT*)   local machine=windows ;;
        *)          local machine=linux
                    printf "\nUnrecongized uname '${unameOut}'; defaulting to use node for linux.\n" >&2
                    printf "Please file an issue to https://github.com/bazelbuild/rules_nodejs/issues if \n" >&2
                    printf "you would like to add your platform to the supported rules_nodejs node platforms.\n\n" >&2
                    ;;
    esac

    case "${machine}" in
      # Path to sauce connect executable
      linux)
        if [[ -z "${BUILD_WORKSPACE_DIRECTORY:-}" ]]; then
          # Started manually

          readonly connectVersion="sc-4.9.2-linux"
          readonly connectHash="2f8a3f87e1da4dc9a41bc45ec7c3a2ecdba4c72d72b7d0193f04ad66c5809104"

          echo "Downloading Sauce Connect"

          curl https://saucelabs.com/downloads/${connectVersion}.tar.gz -o ${SCRIPT_DIR}/${connectVersion}.tar.gz
          echo "${connectHash}  ${SCRIPT_DIR}/${connectVersion}.tar.gz" | shasum -a 256 -c
          tar -xzf ${SCRIPT_DIR}/${connectVersion}.tar.gz -C ${SCRIPT_DIR}

          SAUCE_CONNECT="${SCRIPT_DIR}/${connectVersion}/bin/sc"
        else
          # Started via `bazel run`
          SAUCE_CONNECT="${BUILD_WORKSPACE_DIRECTORY}/node_modules/sauce-connect/bin/sc"
        fi
        ;;
      *)
        if [[ -z "${SAUCE_CONNECT:-}" ]]; then
          @fail "SAUCE_CONNECT environment variable is required on non-linux environments"
          exit 1
        fi
        ;;
    esac
  fi

  if [[ ! -f ${SAUCE_CONNECT} ]]; then
    @fail "sc binary not found at ${SAUCE_CONNECT}"
  fi

  echo "{ \"SAUCE_USERNAME\": \"${SAUCE_USERNAME}\", \"SAUCE_ACCESS_KEY\": \"${SAUCE_ACCESS_KEY}\", \"SAUCE_TUNNEL_IDENTIFIER\": \"${SAUCE_TUNNEL_IDENTIFIER}\", \"SAUCE_LOCALHOST_ALIAS_DOMAIN\": \"${SAUCE_LOCALHOST_ALIAS_DOMAIN:-}\" }" > ${SAUCE_PARAMS_JSON_FILE}

  # Command arguments that will be passed to sauce-connect.
  # By default we disable SSL bumping for all requests. This is because SSL bumping is
  # not needed for our test setup and in order to perform the SSL bumping, Saucelabs
  # intercepts all HTTP requests in the tunnel VM and modifies them. This can cause
  # flakiness as it makes all requests dependent on the SSL bumping middleware.
  # See: https://wiki.saucelabs.com/display/DOCS/Troubleshooting+Sauce+Connect#TroubleshootingSauceConnect-DisablingSSLBumping
  local sauce_args=(
    "--no-ssl-bump-domains all"
    "--logfile ${SAUCE_LOG_FILE}"
    "--pidfile ${SAUCE_PID_FILE}"
    "--readyfile ${SAUCE_READY_FILE}"
    "--tunnel-identifier ${SAUCE_TUNNEL_IDENTIFIER}"
    "--user ${SAUCE_USERNAME}"
    # Don't add the --api-key here so we don't echo it out in service-pre-start
  )

  if [[ -n "${SAUCE_LOCALHOST_ALIAS_DOMAIN:-}" ]]; then
    # Ensures that requests to the localhost alias domain are always resolved through the tunnel.
    # This environment variable is usually configured on CI, and refers to a domain that has been
    # locally configured in the current machine's hosts file (e.g. `/etc/hosts`). The domain should
    # resolve to the current machine in Saucelabs VMs, so we need to ensure that it is resolved
    # through the tunnel we going to create.
    sauce_args+=("--tunnel-domains ${SAUCE_LOCALHOST_ALIAS_DOMAIN}")
  fi

  @echo "Sauce connect will be started with:"
  echo "  ${SAUCE_CONNECT} ${sauce_args[@]}"
  SERVICE_COMMAND="${SAUCE_CONNECT} ${sauce_args[@]} --api-key ${SAUCE_ACCESS_KEY}"
}

# Called by pre-start & post-stop
service-cleanup() {
  if [[ -f "${SAUCE_PID_FILE}" ]]; then
    local p=$(cat "${SAUCE_PID_FILE}")
    @echo "Stopping Sauce Connect (pid $p)..."
    @kill $p
  fi
  @remove "${SAUCE_PID_FILE}"
  @remove "${SAUCE_READY_FILE}"
  @remove "${SAUCE_PARAMS_JSON_FILE}"
}

# Called before service is setup
service-pre-setup() {
  service-cleanup
}

# Called after service is setup
service-post-setup() {
  @echo "  sauce params : ${SAUCE_PARAMS_JSON_FILE}"
}

# Called before service is started
service-pre-start() {
  return
}

# Called after service is started
service-post-start() {
  if [[ ! -f "${SAUCE_PID_FILE}" ]]; then
    printf "# Waiting for Sauce Connect Proxy process (${SAUCE_PID_FILE})"
    while [[ ! -f "${SAUCE_PID_FILE}" ]]; do
      if ! @serviceStatus >/dev/null 2>&1; then
        printf "\n"
        @serviceStop
        @echo "Service failed to start!"
        service-failed-setup
        exit 1
      fi
      printf "."
      sleep 0.5
    done
    printf "\n"
  fi
  @echo "Sauce Connect Proxy started (pid $(cat "${SAUCE_PID_FILE}"))"
}

# Called if service fails to start
service-failed-setup() {
  if [[ -f "${SERVICE_LOG_FILE}" ]]; then
    @echo "tail ${SERVICE_LOG_FILE}:"
    echo "--------------------------------------------------------------------------------"
    tail "${SERVICE_LOG_FILE}"
    echo "--------------------------------------------------------------------------------"
    echo "^^^^^ ${SERVICE_LOG_FILE} ^^^^^"
  fi
}

# Called by ready-wait action
service-ready-wait() {
  if [[ ! -f "${SAUCE_PID_FILE}" ]]; then
    @fail "Sauce Connect not running"
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
        @echo "Timed out after ${SAUCE_READY_FILE_TIMEOUT} seconds waiting for tunnel ready file."
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
    @echo "Saucelabs tunnel connected"
  else
    @echo "Saucelabs tunnel already connected"
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
  @echo "Acquired service action lock"
}

@serviceStatus() {
  if [ -f "${SERVICE_PID_FILE}" ] && [ ! -z "$(cat "${SERVICE_PID_FILE}")" ]; then
    local p=$(cat "${SERVICE_PID_FILE}")

    if kill -0 $p >/dev/null 2>&1; then
      @echo "Service is running (pid $p)"
      return 0
    else
      @echo "Service is not running (process PID $p not exists)"
      return 1
    fi
  else
    @echo "Service is not running"
    return 2
  fi
}

@serviceSetup() {
  if @serviceStatus >/dev/null 2>&1; then
    @echo "Service already running (pid $(cat "${SERVICE_PID_FILE}"))"
    return 0
  fi

  @echo "Setting up service..."
  @remove "${SERVICE_PID_FILE}"
  @remove "${SERVICE_START_FILE}"
  touch "${SERVICE_LOG_FILE}" >/dev/null 2>&1 || @fail "Can not create ${SERVICE_LOG_FILE} file"
  @echo "  service pid  : ${SERVICE_PID_FILE}"
  @echo "  service logs : ${SERVICE_LOG_FILE}"
  service-pre-setup
  service-setup-command

  (
    (
      if [[ -z "${SERVICE_COMMAND:-}" ]]; then
        @fail "No SERVICE_COMMAND is set"
      fi
      @wait_for "Waiting for start file" "${SERVICE_START_FILE}"
      ${SERVICE_COMMAND}
    ) >>"${SERVICE_LOG_FILE}" 2>&1
  ) &
  echo $! >"${SERVICE_PID_FILE}"

  if @serviceStatus >/dev/null 2>&1; then
    @echo "Service setup (pid $(cat "${SERVICE_PID_FILE}"))"
    service-post-setup
  else
    @echo "Error setting up Service!"
    service-failed-setup
    exit 1
  fi

  return $?
}

@serviceStart() {
  if @serviceStatus >/dev/null 2>&1; then
    @echo "Service already setup (pid $(cat "${SERVICE_PID_FILE}"))"
  else
    @serviceSetup
  fi
  if [[ -f "${SERVICE_START_FILE}" ]]; then
    @echo "Service already started"
  else
    @echo "Starting service..."
    service-pre-start
    touch "${SERVICE_START_FILE}" >/dev/null 2>&1 || @err "Can not create ${SERVICE_START_FILE} file"
    service-post-start
    @echo "Service started"
  fi
}

@serviceStop() {
  if @serviceStatus >/dev/null 2>&1; then
    touch "${SERVICE_PID_FILE}" >/dev/null 2>&1 || @fail "Can not touch ${SERVICE_PID_FILE} file"

    service-pre-stop
    @echo "Stopping service (pid $(cat "${SERVICE_PID_FILE}"))..."
    @kill $(cat "${SERVICE_PID_FILE}")

    if @serviceStatus >/dev/null 2>&1; then
      @fail "Error stopping Service! Service already running with PID $(cat "${SERVICE_PID_FILE}")"
    else
      @echo "Service stopped"
      @remove "${SERVICE_PID_FILE}"
      @remove "${SERVICE_START_FILE}"
      service-post-stop
    fi

    return 0
  else
    @warn "Service is not running"
    @remove "${SERVICE_PID_FILE}"
    @remove "${SERVICE_START_FILE}"
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
  @echo "tail ${SERVICE_LOG_FILE}:"
  tail -f "${SERVICE_LOG_FILE}"
}

@serviceLog() {
  @echo "cat ${SERVICE_LOG_FILE}:"
  echo "--------------------------------------------------------------------------------"
  cat "${SERVICE_LOG_FILE}"
  echo "--------------------------------------------------------------------------------"
  echo "^^^^^ ${SERVICE_LOG_FILE} ^^^^^"
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
      service-setup-command
      if [[ -z "${SERVICE_COMMAND:-}" ]]; then
        @fail "No SERVICE_COMMAND is set"
      fi
      ${SERVICE_COMMAND}
    )
    ;;
  log)
    @serviceLog
    ;;
  tail)
    @serviceTail
    ;;
  *)
    @echo "Actions: [setup|start|start-read-wait|ready-wait|stop|restart|status|run|tail]"
    exit 1
    ;;
esac
