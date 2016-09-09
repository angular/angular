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
 * This module provides a set of common Pipes.
 */
import {AsyncPipe} from './async_pipe';
import {DatePipe} from './date_pipe';
import {I18nPluralPipe} from './i18n_plural_pipe';
import {I18nSelectPipe} from './i18n_select_pipe';
import {JsonPipe} from './json_pipe';
import {LowerCasePipe} from './lowercase_pipe';
import {CurrencyPipe, DecimalPipe, PercentPipe} from './number_pipe';
import {SlicePipe} from './slice_pipe';
import {UpperCasePipe} from './uppercase_pipe';

export {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
  I18nSelectPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe
};

/**
 * A collection of Angular pipes that are likely to be used in each and every application.
 */
export const COMMON_PIPES = [
  AsyncPipe,
  UpperCasePipe,
  LowerCasePipe,
  JsonPipe,
  SlicePipe,
  DecimalPipe,
  PercentPipe,
  CurrencyPipe,
  DatePipe,
  I18nPluralPipe,
  I18nSelectPipe,
];
