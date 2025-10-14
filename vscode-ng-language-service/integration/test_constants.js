'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.TSCONFIG =
  exports.FOO_COMPONENT_URI =
  exports.FOO_COMPONENT =
  exports.FOO_TEMPLATE_URI =
  exports.FOO_TEMPLATE =
  exports.APP_COMPONENT_MODULE_URI =
  exports.APP_COMPONENT_MODULE =
  exports.BAR_COMPONENT_URI =
  exports.BAR_COMPONENT =
  exports.APP_COMPONENT_URI =
  exports.APP_COMPONENT =
  exports.PRE_STANDALONE_PROJECT_PATH =
  exports.PROJECT_PATH =
  exports.SERVER_PATH =
  exports.PACKAGE_ROOT =
  exports.IS_BAZEL =
    void 0;
exports.makeTempDir = makeTempDir;
const node_fs_1 = require('node:fs');
const node_path_1 = require('node:path');
const node_url_1 = require('node:url');
// TEST_TMPDIR is always set by Bazel.
const tmpDir = (0, node_path_1.join)(process.env['TEST_TMPDIR'], 'vscode-integration-tests-');
function makeTempDir() {
  return (0, node_fs_1.mkdtempSync)(tmpDir);
}
exports.IS_BAZEL = !!process.env['TEST_TARGET'];
exports.PACKAGE_ROOT = exports.IS_BAZEL
  ? (0, node_path_1.resolve)(__dirname, '..')
  : (0, node_path_1.resolve)(__dirname, '../..');
exports.SERVER_PATH = exports.IS_BAZEL
  ? (0, node_path_1.join)(exports.PACKAGE_ROOT, 'server', 'index.js')
  : (0, node_path_1.join)(exports.PACKAGE_ROOT, 'dist', 'npm', 'server', 'index.js');
exports.PROJECT_PATH = (0, node_path_1.join)(exports.PACKAGE_ROOT, 'integration', 'project');
exports.PRE_STANDALONE_PROJECT_PATH = (0, node_path_1.join)(
  exports.PACKAGE_ROOT,
  'integration',
  'pre_standalone_project',
);
exports.APP_COMPONENT = (0, node_path_1.join)(exports.PROJECT_PATH, 'app', 'app.component.ts');
exports.APP_COMPONENT_URI = (0, node_url_1.pathToFileURL)(exports.APP_COMPONENT).href;
exports.BAR_COMPONENT = (0, node_path_1.join)(exports.PROJECT_PATH, 'app', 'bar.component.ts');
exports.BAR_COMPONENT_URI = (0, node_url_1.pathToFileURL)(exports.BAR_COMPONENT).href;
exports.APP_COMPONENT_MODULE = (0, node_path_1.join)(exports.PROJECT_PATH, 'app', 'app.module.ts');
exports.APP_COMPONENT_MODULE_URI = (0, node_url_1.pathToFileURL)(exports.APP_COMPONENT_MODULE).href;
exports.FOO_TEMPLATE = (0, node_path_1.join)(exports.PROJECT_PATH, 'app', 'foo.component.html');
exports.FOO_TEMPLATE_URI = (0, node_url_1.pathToFileURL)(exports.FOO_TEMPLATE).href;
exports.FOO_COMPONENT = (0, node_path_1.join)(exports.PROJECT_PATH, 'app', 'foo.component.ts');
exports.FOO_COMPONENT_URI = (0, node_url_1.pathToFileURL)(exports.FOO_COMPONENT).href;
exports.TSCONFIG = (0, node_path_1.join)(exports.PROJECT_PATH, 'tsconfig.json');
//# sourceMappingURL=test_constants.js.map
