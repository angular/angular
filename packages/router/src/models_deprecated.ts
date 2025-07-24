/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// This file contains re-exports of deprecated interfaces in `models.ts`
// The public API re-exports everything from this file, which can be patched
// locally in g3 to prevent regressions after cleanups complete.

export {DeprecatedGuard, DeprecatedResolve} from './models';
