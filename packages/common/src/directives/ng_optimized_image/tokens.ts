/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { InjectionToken } from '@angular/core';

/**
 * In SSR scenarios, a preload `<link>` element is generated for priority images.
 * Having a large number of preload tags may negatively affect the performance,
 * so we warn developers (by throwing an error) if the number of preloaded images
 * is above a certain threshold. This const specifies this threshold.
 */
export const DEFAULT_PRELOADED_IMAGES_LIMIT = 5;

/**
 * Helps to keep track of priority images that already have a corresponding
 * preload tag (to avoid generating multiple preload tags with the same URL).
 *
 * This Set tracks the original src passed into the `ngSrc` input not the src after it has been
 * run through the specified `IMAGE_LOADER`.
 */
export const PRELOADED_IMAGES = new InjectionToken<Set<string>>(
    'NG_OPTIMIZED_PRELOADED_IMAGES', {providedIn: 'root', factory: () => new Set<string>()});


/**
 * Helps to keep track of domains that already have a corresponding
 * preconnect link in the document head (to avoid generating multiple
 * preconnect links for the same domain).
 *
 * This Set tracks the domains extracted from the image source
 * facilitating the speculative loading mechanism
 */
export const PRECONNECTED_DOMAINS = new InjectionToken<Set<string>>(
    'NG_OPTIMIZED_PRECONNECTED_DOMAINS', {providedIn: 'root', factory: () => new Set<string>()});
