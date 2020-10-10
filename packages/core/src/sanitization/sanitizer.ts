/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineInjectable} from '../di/interface/defs';
import {SecurityContext} from './security';

/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 * @publicApi
 */
export abstract class Sanitizer {
  abstract sanitize(context: SecurityContext, value: {}|string|null): string|null;
  /** @nocollapse */
  static ɵprov = ɵɵdefineInjectable({
    token: Sanitizer,
    providedIn: 'root',
    factory: () => null,
  });
}

/**
 * TrustedSanitizer is used by the views to sanitize potentially dangerous
 * values, using Trusted Types to prove their safety after sanitization.
 *
 * @publicApi
 */
export abstract class TrustedSanitizer {
  abstract sanitize(context: SecurityContext.HTML, value: {}|string|null): string|TrustedHTML|null;
  abstract sanitize(context: SecurityContext.SCRIPT, value: {}|string|null): string|TrustedScript
      |null;
  abstract sanitize(context: SecurityContext.RESOURCE_URL, value: {}|string|null): string
      |TrustedScriptURL|null;
  abstract sanitize(context: SecurityContext, value: {}|string|null): string|null;
  abstract sanitize(context: SecurityContext, value: {}|string|null): string|TrustedHTML
      |TrustedScript|TrustedScriptURL|null;
  /** @nocollapse */
  static ɵprov = ɵɵdefineInjectable({
    token: TrustedSanitizer,
    providedIn: 'root',
    factory: () => null,
  });
}
