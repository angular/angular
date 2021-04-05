#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {buildAngularInMemoryWebApiPackage} = require('./angular-in-memory-web-api');
const {buildDevInfraPackage} = require('./dev-infra-builder');
const {buildTargetPackages} = require('./package-builder');
const {buildZoneJsPackage} = require('./zone-js-builder');


// Build the legacy (view engine) npm packages into `dist/packages-dist/`.
buildTargetPackages('dist/packages-dist', false, 'Production');

// Build the `angular-dev-infra` npm package into `dist/packages-dist/`.
buildDevInfraPackage('dist/packages-dist');

// Build the `angular-in-memory-web-api` npm package into `dist/packages-dist/misc/`, because it
// might be needed by other scripts/targets.
buildAngularInMemoryWebApiPackage('dist/packages-dist/misc');

// Build the `zone.js` npm package into `dist/zone.js-dist/`, because it might be needed by other
// scripts/tests.
buildZoneJsPackage('dist/zone.js-dist');
