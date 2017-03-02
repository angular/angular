/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

// THIS CHECK SHOULD BE THE FIRST THING IN THIS FILE
// This is to ensure that we catch env issues before we error while requiring other dependencies.
// NOTE: we are getting the value from the parent `angular/angular` package.json not the `/aio` one.
const engines = require('../../package.json').engines;
require('../../tools/check-environment')({
  requiredNpmVersion: engines.npm,
  requiredNodeVersion: engines.node
});
