#!/usr/bin/env bash


start_tunnel() {
  case "$MODE" in
    e2e*|saucelabs*)
      ./scripts/sauce/sauce_connect_setup.sh
      ;;
    browserstack*)
      ./scripts/browserstack/start_tunnel.sh
      ;;
    *)
      ;;
  esac
}

wait_for_tunnel() {
  case "$MODE" in
    e2e*|saucelabs*)
      ./scripts/sauce/sauce_connect_block.sh
      ;;
    browserstack*)
      ./scripts/browserstack/waitfor_tunnel.sh
      ;;
    *)
      ;;
  esac
  sleep 10
}

teardown_tunnel() {
  case "$MODE" in
    e2e*|saucelabs*)
      ./scripts/sauce/sauce_connect_teardown.sh
      ;;
    browserstack*)
      # ./scripts/browserstack/teardown_tunnel.sh
      ;;
    *)
      ;;
  esac
}

