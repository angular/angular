/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {mkdtempSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// TEST_TMPDIR is always set by Bazel.
const tmpDir = join(process.env['TEST_TMPDIR']!, 'vscode-integration-tests-');
export function makeTempDir(): string {
  return mkdtempSync(tmpDir);
}

export const PACKAGE_ROOT = resolve(__dirname, '..');
export const SERVER_PATH = join(PACKAGE_ROOT, 'server', 'index.js');
export const PROJECT_PATH = join(PACKAGE_ROOT, 'integration', 'project');

export const APP_COMPONENT = join(PROJECT_PATH, 'app', 'app.component.ts');
export const APP_COMPONENT_URI = pathToFileURL(APP_COMPONENT).href;
export const BAR_COMPONENT = join(PROJECT_PATH, 'app', 'bar.component.ts');
export const BAR_COMPONENT_URI = pathToFileURL(BAR_COMPONENT).href;
export const APP_COMPONENT_MODULE = join(PROJECT_PATH, 'app', 'app.module.ts');
export const APP_COMPONENT_MODULE_URI = pathToFileURL(APP_COMPONENT_MODULE).href;
export const FOO_TEMPLATE = join(PROJECT_PATH, 'app', 'foo.component.html');
export const FOO_TEMPLATE_URI = pathToFileURL(FOO_TEMPLATE).href;
export const FOO_COMPONENT = join(PROJECT_PATH, 'app', 'foo.component.ts');
export const FOO_COMPONENT_URI = pathToFileURL(FOO_COMPONENT).href;
export const TSCONFIG = join(PROJECT_PATH, 'tsconfig.json');
