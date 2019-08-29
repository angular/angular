/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '@angular/core';
import {DeprecatedDatePipe} from './date_pipe';
import {DeprecatedCurrencyPipe, DeprecatedDecimalPipe, DeprecatedPercentPipe} from './number_pipe';

export {
  DeprecatedCurrencyPipe,
  DeprecatedDatePipe,
  DeprecatedDecimalPipe,
  DeprecatedPercentPipe,
};


/**
 * A collection of deprecated i18n pipes that require intl api
 *
 * @deprecated from v5
 */
export const COMMON_DEPRECATED_I18N_PIPES: Provider[] =
    [DeprecatedDecimalPipe, DeprecatedPercentPipe, DeprecatedCurrencyPipe, DeprecatedDatePipe];
