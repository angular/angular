#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// The build script used to be here but has been moved to `scripts/build/` in PR
// https://github.com/angular/angular/pull/35780. This is a temporary placeholder script for people
// that are not aware of the change and expect to find the script here.
//
// TODO: This script can be removed early May 2020.
'use strict';

const {red} = require('chalk');
const {relative, resolve} = require('path');


const absoluteScriptPath = resolve(`${__dirname}/build/build-packages-dist.js`);
const relativeScriptPath = relative(process.cwd(), absoluteScriptPath);

console.error(red('ERROR: The build script has been moved to \'scripts/build/\'.'));
console.error(red(`       Run: node ${relativeScriptPath}`));

process.exit(1);
