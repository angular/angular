/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

// Generate a "random" seed, suitable to be used for pseudo-randomizing jasmine tests.
module.exports = {
  generateSeed: caller => {
    const seed = process.env.JASMINE_RANDOM_SEED || String(Math.random()).slice(-5);
    // tslint:disable-next-line: no-console
    console.log(`[${caller}] Jasmine random seed: ${seed}`);
    return seed;
  },
};
