/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ɵ$localize as $localize,
  ɵLocalizeFn as LocalizeFn,
  ɵTranslateFn as TranslateFn,
} from '../index';

export {$localize, LocalizeFn, TranslateFn};

// Attach $localize to the global context, as a side-effect of this module.
(globalThis as any).$localize = $localize;
