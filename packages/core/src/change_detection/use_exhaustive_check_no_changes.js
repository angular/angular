/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '../di';
export const USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT = false;
export const UseExhaustiveCheckNoChanges = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'exhaustive checkNoChanges' : '',
);
//# sourceMappingURL=use_exhaustive_check_no_changes.js.map
