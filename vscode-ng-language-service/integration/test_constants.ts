import {join, resolve} from 'path';

import {convertPathToFileUrl} from './lsp/test_utils';

export const IS_BAZEL = !!process.env['TEST_TARGET'];
export const PACKAGE_ROOT = IS_BAZEL ? resolve(__dirname, '..') : resolve(__dirname, '../..');
export const SERVER_PATH = IS_BAZEL
  ? join(PACKAGE_ROOT, 'server', 'index.js')
  : join(PACKAGE_ROOT, 'dist', 'npm', 'server', 'index.js');
export const PROJECT_PATH = join(PACKAGE_ROOT, 'integration', 'project');
export const PRE_STANDALONE_PROJECT_PATH = join(
  PACKAGE_ROOT,
  'integration',
  'pre_standalone_project',
);

export const APP_COMPONENT = join(PROJECT_PATH, 'app', 'app.component.ts');
export const APP_COMPONENT_URI = convertPathToFileUrl(APP_COMPONENT);
export const BAR_COMPONENT = join(PROJECT_PATH, 'app', 'bar.component.ts');
export const BAR_COMPONENT_URI = convertPathToFileUrl(BAR_COMPONENT);
export const APP_COMPONENT_MODULE = join(PROJECT_PATH, 'app', 'app.module.ts');
export const APP_COMPONENT_MODULE_URI = convertPathToFileUrl(APP_COMPONENT_MODULE);
export const FOO_TEMPLATE = join(PROJECT_PATH, 'app', 'foo.component.html');
export const FOO_TEMPLATE_URI = convertPathToFileUrl(FOO_TEMPLATE);
export const FOO_COMPONENT = join(PROJECT_PATH, 'app', 'foo.component.ts');
export const FOO_COMPONENT_URI = convertPathToFileUrl(FOO_COMPONENT);
export const TSCONFIG = join(PROJECT_PATH, 'tsconfig.json');
