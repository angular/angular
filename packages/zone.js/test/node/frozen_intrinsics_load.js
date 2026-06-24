/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
'use strict';

// This file is run as a subprocess by the frozen-intrinsics jest spec:
//   node --frozen-intrinsics frozen_intrinsics_load.js
//
// A zero exit code means zone.js/node loaded without throwing under frozen
// intrinsics. Any thrown TypeError (e.g. "Cannot assign to read only property")
// would produce a non-zero exit and fail the test.
const path = require('path');
const bundlePath = path.resolve(
  __dirname,
  '../../../../dist/bin/packages/zone.js/npm_package/bundles/zone-node.umd.js',
);
require(bundlePath);
