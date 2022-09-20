/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Injector} from '@angular/core';

/**
 * Represents the `NgOptimizedImage` configuration that can be provided using the
 * `NG_OPTIMIZED_IMAGE_CONFIG` DI token.
 *
 * @see `NG_OPTIMIZED_IMAGE_CONFIG`
 *
 * @publicApi
 * @developerPreview
 */
export interface NgOptimizedImageConfig {
  /**
   * Configures a set of origins that should be excluded from the preconnect check
   * performed by the `NgOptimizedImage` directive for priority images to find
   * corresponding `<link rel="preconnect">` tags on a page.
   */
  preconnectCheckBlocklist?: string[];
}

/**
 * A token that can be used to configure `NgOptimizedImage` directives.
 *
 * @see `NgOptimizedImageConfig`
 *
 * @publicApi
 * @developerPreview
 */
export const NG_OPTIMIZED_IMAGE_CONFIG =
    new InjectionToken<NgOptimizedImageConfig>(ngDevMode ? 'NG_OPTIMIZED_IMAGE_CONFIG' : '');

export function getDirectiveConfig(injector: Injector) {
  return injector.get(NG_OPTIMIZED_IMAGE_CONFIG, null) ?? {};
}
