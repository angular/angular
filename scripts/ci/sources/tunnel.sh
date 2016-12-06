#!/usr/bin/env bash


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
      ./scripts/saucelabs/wait-tunnel.sh
      ;;
    browserstack*)
      ./scripts/browserstack/wait-tunnel.sh
      ;;
    *)
      ;;
  esac
  sleep 10
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

