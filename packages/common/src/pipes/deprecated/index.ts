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
 * This module provides a set of deprecated i18n pipes that will be
 * removed in Angular v6 in favor of the new i18n pipes that don't use the intl api.
 * @deprecated
 */
import {DeprecatedDatePipe} from './date_pipe';
import {DeprecatedCurrencyPipe, DeprecatedDecimalPipe, DeprecatedPercentPipe} from './number_pipe';

export {
  DeprecatedCurrencyPipe,
  DeprecatedDatePipe,
  DeprecatedDecimalPipe,
  DeprecatedPercentPipe,
};


/**
 * A collection of deprecated i18n pipes that are likely to be used in each and every application.
 */
export const COMMON_DEPRECATED_I18N_PIPES =
    [DeprecatedDecimalPipe, DeprecatedPercentPipe, DeprecatedCurrencyPipe, DeprecatedDatePipe];
