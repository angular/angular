/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵ$localize as $localize, ɵ_global as _global, ɵLocalizeFn as LocalizeFn, ɵTranslateFn as TranslateFn} from '@angular/localize';

export {$localize, LocalizeFn, TranslateFn};

// Attach $localize to the global context, as a side-effect of this module.
_global.$localize = $localize;
