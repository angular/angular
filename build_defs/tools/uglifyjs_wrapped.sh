#!/usr/bin/env bash

# This wrapper adds --preamble-file option to uglifyjs.

set -e

if [[ -z "${RUNFILES}" ]]; then
  case "${0}" in
    /*) self="${0}" ;;
    *) self="${PWD}/${0}" ;;
  esac

  if [[ -n "${TEST_SRCDIR}" ]]; then
    export RUNFILES="${TEST_SRCDIR}/angular"
  elif [[ -d "${self}.runfiles" ]]; then
    export RUNFILES="${self}.runfiles/angular"
  else
    echo "Runfiles directory not found." >&2
    exit 1
  fi
fi

ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --preamble-file)
      shift
      ARGS+=( "--preamble" "$(cat "${1}")" )
      ;;
    *)
      ARGS+=( "${1}" )
      ;;
  esac
  shift
done

"${RUNFILES}/uglifyjs_bin" "${ARGS[@]}"
