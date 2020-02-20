// Temporary wrapper script which makes sure that the proper, locally-installed, binary is used when
// running ibazel. Currently ibazel only looks for bazel in the PATH or @bazel/bazel, but not in
// @bazel/bazelisk. See: https://github.com/bazelbuild/bazel-watcher/issues/339
const shelljs = require('shelljs');
const path = require('path');
const ibazelLocalBinary = path.resolve('./node_modules/.bin/ibazel');
const bazelLocalBinary = require('@bazel/bazelisk/bazelisk.js').getNativeBinary();
const args = process.argv.slice(2).join(' ');

shelljs.exec(`${ibazelLocalBinary} -bazel_path ${bazelLocalBinary} ${args}`);
