/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable} from '@angular/core';
/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 *
 * Browser support is limited, so this API may not be available in all environments,
 * may contain bugs, and is experimental.
 *
 * @experimental 21.0.0
 */
let PlatformNavigation = class PlatformNavigation {};
PlatformNavigation = __decorate(
  [Injectable({providedIn: 'platform', useFactory: () => window.navigation})],
  PlatformNavigation,
);
export {PlatformNavigation};
//# sourceMappingURL=platform_navigation.js.map
