/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵdefineInjectable} from '../di/interface/defs';
import {SecurityContext} from './security';

/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 * @publicApi
 */
export abstract class Sanitizer {
  abstract sanitize(context: SecurityContext, value: {} | string | null): string | null;
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: Sanitizer,
    providedIn: 'root',
    factory: () => null,
  });
}
