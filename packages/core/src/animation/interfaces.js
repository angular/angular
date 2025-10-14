/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '../di/injection_token';
/**
 * A [DI token](api/core/InjectionToken) that enables or disables all enter and leave animations.
 */
export const ANIMATIONS_DISABLED = new InjectionToken(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AnimationsDisabled' : '',
  {
    providedIn: 'root',
    factory: () => false,
  },
);
/**
 * A [DI token](api/core/InjectionToken) that configures the maximum animation timeout
 * before element removal. The default value mirrors from Chrome's cross document
 * navigation view transition timeout. It's intended to prevent people from accidentally
 * forgetting to call the removal function in their callback. Also serves as a delay
 * for when stylesheets are pruned.
 *
 * @publicApi 20.2
 */
export const MAX_ANIMATION_TIMEOUT = new InjectionToken(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'MaxAnimationTimeout' : '',
  {
    providedIn: 'root',
    factory: () => MAX_ANIMATION_TIMEOUT_DEFAULT,
  },
);
const MAX_ANIMATION_TIMEOUT_DEFAULT = 4000;
//# sourceMappingURL=interfaces.js.map
