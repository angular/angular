/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/**
 * In SSR scenarios, a preload `<link>` element is generated for priority images.
 * Having a large number of preload tags may negatively affect the performance,
 * so we warn developers (by throwing an error) if the number of preloaded images
 * is above a certain threshold. This const specifies this threshold.
 */
export const DEFAULT_PRELOADED_IMAGES_LIMIT = 5;

/**
 * Helps to keep track of priority images that already have a corresponding preload tag. Each key
 * identifies the rewritten image URL and its CORS mode, since preload tags with different CORS
 * modes are not interchangeable.
 */
export const PRELOADED_IMAGES = new InjectionToken<Set<string>>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'NG_OPTIMIZED_PRELOADED_IMAGES' : '',
  {
    factory: () => new Set<string>(),
  },
);
