#!/usr/bin/env node
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {buildZoneJsPackage} = require('./zone-js-builder');
const {buildTargetPackages} = require('./package-builder');


// Build the ivy packages into `dist/packages-dist-ivy-aot/`.
buildTargetPackages('dist/packages-dist-ivy-aot', true, 'Ivy AOT');

// Build the `zone.js` npm package into `dist/zone.js-dist/`, because it might be needed by other
// scripts/tests.
buildZoneJsPackage();
