#!/usr/bin/env bash

# Build the dist/packages-dist directory in the same fashion as the legacy
# /build.sh script, by building the npm packages with Bazel and copying files.
# This is needed for scripts and tests which are not updated to the Bazel output
# layout (which always matches the input layout).
# Do not add new dependencies on this script, instead adapt scripts to use the
# new layout, and write new tests as Bazel targets.
#
# Ideally integration tests should run under bazel, and just consume the npm
# packages via `deps`. Until that works, we manually build the npm packages and then
# copy the results to the appropriate `dist` location.

set -u -e -o pipefail

cd "$(dirname "$0")"

# basedir is the workspace root
readonly base_dir=$(pwd)/..
# We need to resolve the Bazel binary in the node modules because running Bazel
# through `yarn bazel` causes additional output that throws off command stdout.
readonly bazel_bin=$(yarn bin)/bazel
readonly bin=$(${bazel_bin} info bazel-bin)

function buildTargetPackages() {
  # List of targets to build, e.g. core, common, compiler, etc. Note that we want to
  # remove all carriage return ("\r") characters form the query output because otherwise
  # the carriage return is part of the bazel target name and bazel will complain.
  targets=$(${bazel_bin} query --output=label 'attr("tags", "\[.*release-with-framework.*\]", //packages/...) intersect kind(".*_package", //packages/...)' | tr -d "\r")

  # Path to the output directory into which we copy the npm packages.
  dest_path="$1"

  # Either "legacy" (view engine) or "aot" (ivy)
  compile_mode="$2"

  # Human-readable description of the build.
  desc="$3"

  echo "##################################"
  echo "scripts/build-packages-dist.sh:"
  echo "  building @angular/* npm packages"
  echo "  mode: ${desc}"
  echo "##################################"

  # Use --config=release so that snapshot builds get published with embedded version info
  echo "$targets" | xargs ${bazel_bin} build --config=release --define=compile=${compile_mode}

  [[ -d "${base_dir}/${dest_path}" ]] || mkdir -p ${base_dir}/${dest_path}

  dirs=`echo "$targets" | sed -e 's/\/\/packages\/\(.*\):npm_package/\1/'`

  for pkg in ${dirs}; do
    # Skip any that don't have an "npm_package" target
    src_dir="${bin}/packages/${pkg}/npm_package"
    dest_dir="${base_dir}/${dest_path}/${pkg}"
    if [[ -d ${src_dir} ]]; then
      echo "# Copy artifacts to ${dest_dir}"
      rm -rf ${dest_dir}
      cp -R ${src_dir} ${dest_dir}
      chmod -R u+w ${dest_dir}
    fi
  done
}

