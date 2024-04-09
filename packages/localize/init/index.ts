/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵ$localize, ɵLocalizeFn as LocalizeFn, ɵTranslateFn as TranslateFn} from '@angular/localize';

export {LocalizeFn, TranslateFn};

// Attach $localize to the global context, as a side-effect of this module.
(globalThis as any).$localize = ɵ$localize;

// Doing an explicit re-export for docs purposes.
export const $localize = ɵ$localize;
