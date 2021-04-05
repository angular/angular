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
const {buildTargetPackages} = require('./package-builder');
const {buildZoneJsPackage} = require('./zone-js-builder');


// Build the ivy packages into `dist/packages-dist-ivy-aot/`.
buildTargetPackages('dist/packages-dist-ivy-aot', true, 'Ivy AOT');

// Build the `angular-in-memory-web-api` npm package into
// `dist/angular-in-memory-web-api-dist-ivy-aot/`, because it might be needed by other
// scripts/targets.
//
// NOTE:
// The `-ivy-aot` suffix is only used to differentiate from the packages built by the
// `build-packages-dist.js` script, so that there is no conflict when persisting them to the
// workspace on CI.
buildAngularInMemoryWebApiPackage('dist/angular-in-memory-web-api-dist-ivy-aot');

// Build the `zone.js` npm package into `dist/zone.js-dist-ivy-aot/`, because it might be needed by
// other scripts/tests.
//
// NOTE:
// The `-ivy-aot` suffix is only used to differentiate from the packages built by the
// `build-packages-dist.js` script, so that there is no conflict when persisting them to the
// workspace on CI.
buildZoneJsPackage('dist/zone.js-dist-ivy-aot');
