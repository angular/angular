/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '@angular/core';
/**
 * A DI token for the router service.
 *
 * @publicApi
 */
export const ROUTER_CONFIGURATION = new InjectionToken(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'router config' : '',
  {
    providedIn: 'root',
    factory: () => ({}),
  },
);
//# sourceMappingURL=router_config.js.map
