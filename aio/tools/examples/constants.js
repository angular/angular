const path = require('canonical-path');

// Bazel sets the environment variable BUILD_WORKSPACE_DIRECTORY when calling bazel run,
// which points to the root of the source tree. In the create example case we want to
// point to the source tree rather than the output tree.
exports.EXAMPLES_BASE_PATH = process.env.BUILD_WORKSPACE_DIRECTORY
    ? path.resolve(process.env.BUILD_WORKSPACE_DIRECTORY, 'aio', 'content', 'examples')
    : path.resolve(__dirname, '../../content/examples');

exports.EXAMPLE_CONFIG_FILENAME = 'example-config.json';
exports.SHARED_PATH = path.resolve(__dirname, 'shared');
exports.STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';
exports.BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH = process.env.BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH || 'bazel-test-dist';
