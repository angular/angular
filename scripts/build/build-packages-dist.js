#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

const {buildZoneJsPackage} = require('./zone-js-builder');
const {buildDevInfraPackage} = require('./dev-infra-builder');
const {buildTargetPackages} = require('./package-builder');
const {buildAngularInMemoryWebAPIPackage} = require('./angular-in-memory-web-api');


// Build the legacy (view engine) npm packages into `dist/packages-dist/`.
buildTargetPackages('dist/packages-dist', false, 'Production');

// Build the `zone.js` npm package into `dist/zone.js-dist/`, because it might be needed by other
// scripts/tests.
buildZoneJsPackage('dist/zone.js-dist');

// Build the `angular-dev-infra` npm package into `dist/packages-dist/@angular/dev-infra-private`
buildDevInfraPackage();

// Build the `angular-in-memory-web-api` npm package into
// `dist/packages-dist/misc/angular-in-memory-web-api`
buildAngularInMemoryWebAPIPackage();
