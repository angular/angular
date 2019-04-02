/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of this package.
 */
export * from './src/common';
export {registerLocaleData as ɵregisterLocaleData} from './src/i18n/locale_data';

import {ɵChangeDetectorStatus} from '@angular/core';

/**
 * @alias core/ɵChangeDetectorStatus
 */
export const ChangeDetectorStatus = ɵChangeDetectorStatus;
// This file only reexports content of the `src` folder. Keep it that way.
