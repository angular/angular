const path = require('canonical-path');

// Bazel sets the environment variable BUILD_WORKSPACE_DIRECTORY when calling bazel run,
// which points to the root of the source tree. When running create-example we want to
// point to the source tree. In build and test cases we want to point to the output tree.
exports.PROJECT_ROOT = process.env.BUILD_WORKSPACE_DIRECTORY || path.resolve(__dirname, '../../../');
exports.EXAMPLES_BASE_PATH = path.resolve(this.PROJECT_ROOT, 'aio', 'content', 'examples');
exports.SHARED_PATH = path.resolve(this.PROJECT_ROOT, 'aio', 'tools', 'examples', 'shared');

exports.EXAMPLE_CONFIG_FILENAME = 'example-config.json';
exports.STACKBLITZ_CONFIG_FILENAME = 'stackblitz.json';
exports.BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH = process.env.BAZEL_EXAMPLE_BOILERPLATE_OUTPUT_PATH || process.env.TEST_TMPDIR;
