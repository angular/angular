#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {performDefaultSnapshotBuild} from './package-builder.mjs';
import {buildZoneJsPackage} from './zone-js-builder.mjs';


performDefaultSnapshotBuild();

// Build the `zone.js` npm package into `dist/zone.js-dist/`, because it might be needed by other
// scripts/tests.
buildZoneJsPackage('dist/zone.js-dist');
