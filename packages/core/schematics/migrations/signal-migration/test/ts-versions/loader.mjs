/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {register} from 'node:module';

// Registers the TypeScript version loader.
register('./hooks.mjs', import.meta.url);
