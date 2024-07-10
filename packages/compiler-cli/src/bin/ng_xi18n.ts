#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Must be imported first, because Angular decorators throw on load.
import 'reflect-metadata';

import {NodeJSFileSystem, setFileSystem} from '../ngtsc/file_system';
import {mainXi18n} from '../extract_i18n';

process.title = 'Angular i18n Message Extractor (ng-xi18n)';
const args = process.argv.slice(2);
// We are running the real compiler so run against the real file-system
setFileSystem(new NodeJSFileSystem());
process.exitCode = mainXi18n(args);
