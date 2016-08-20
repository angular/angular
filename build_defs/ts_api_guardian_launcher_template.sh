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

if [[ "{{mode}}" == "out" ]]; then
  # For out, we need to write to execroot
  # We use a WORKSPACE file to determine workspace root
  WORKSPACE="${0}"

  while [[ ${#WORKSPACE} > 1 ]] && ! [[ -h "${WORKSPACE}/WORKSPACE" ]]; do
    WORKSPACE="$(dirname "${WORKSPACE}")"
  done
  if [[ -z "${WORKSPACE}" ]] || [[ "${WORKSPACE}" == .* ]]; then
    echo "Cannot locate execroot." >&2
    exit 1
  fi

  GOLDEN_DIR="${WORKSPACE}/{{golden_dir}}"
else
  # For verify, we can just use the copy in runfiles
  GOLDEN_DIR="{{golden_dir}}"
fi

# entry_points are relative to RUNFILES, so we have to cd to there
cd ${RUNFILES}

"./{{ts_api_guardian}}" \
    --rootDir {{root_dir}} --{{mode}}Dir "${GOLDEN_DIR}" --color {{arguments}} {{entry_points}}
