#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {buildAngularInMemoryWebApiPackage} from './angular-in-memory-web-api.mjs';
import {performDefaultSnapshotBuild} from './package-builder.mjs';
import {buildZoneJsPackage} from './zone-js-builder.mjs';

// Build the legacy (view engine) npm packages into `dist/packages-dist/`.
performDefaultSnapshotBuild();

// Build the `angular-in-memory-web-api` npm package into `dist/angular-in-memory-web-api-dist/`,
// because it might be needed by other scripts/targets.
buildAngularInMemoryWebApiPackage('dist/angular-in-memory-web-api-dist');

// Build the `zone.js` npm package into `dist/zone.js-dist/`, because it might be needed by other
// scripts/tests.
buildZoneJsPackage('dist/zone.js-dist');
