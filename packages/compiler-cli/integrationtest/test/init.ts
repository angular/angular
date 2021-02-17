/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// import zone.js from npm here because integration test will load zone.js
// from built npm_package instead of source
import 'zone.js/node';
import 'zone.js/testing';
// Only needed to satisfy the check in core/src/util/decorators.ts
// TODO(alexeagle): maybe remove that check?
require('reflect-metadata');
