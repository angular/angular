#!/usr/bin/env bash

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

cd "${RUNFILES}" && "${RUNFILES}/{{karma}}" start "${RUNFILES}/{{config}}" {{args}} "$@"
