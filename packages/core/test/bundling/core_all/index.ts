/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as core from '../../../src/core';

// We need to something with the "core" import in order to ensure
// that all symbols from core are preserved in the bundle.
console.error(core);
