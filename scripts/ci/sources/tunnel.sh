#!/usr/bin/env bash

# Load the retry-call utility function.
source ./scripts/retry-call.sh

# Variable the specifies how often the wait script should be invoked if it fails.
WAIT_RETRIES=2

start_tunnel() {
  case "$MODE" in
    e2e*|saucelabs*)
      ./scripts/saucelabs/start-tunnel.sh
      ;;
    browserstack*)
      ./scripts/browserstack/start-tunnel.sh
      ;;
    *)
      ;;
  esac
}

wait_for_tunnel() {
  case "$MODE" in
    e2e*|saucelabs*)
      retryCall ${WAIT_RETRIES} ./scripts/saucelabs/wait-tunnel.sh
      ;;
    browserstack*)
      retryCall ${WAIT_RETRIES} ./scripts/browserstack/wait-tunnel.sh
      ;;
    *)
      ;;
  esac
}

teardown_tunnel() {
  case "$MODE" in
    e2e*|saucelabs*)
      ./scripts/saucelabs/stop-tunnel.sh
      ;;
    browserstack*)
      ./scripts/browserstack/stop-tunnel.sh
      ;;
    *)
      ;;
  esac
}

