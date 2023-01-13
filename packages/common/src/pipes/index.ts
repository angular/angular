/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
import {LowerCasePipe, TitleCasePipe, UpperCasePipe} from './case_conversion_pipes';
import {DATE_PIPE_DEFAULT_OPTIONS, DATE_PIPE_DEFAULT_TIMEZONE, DatePipe} from './date_pipe';
import {DatePipeConfig} from './date_pipe_config';
import {I18nPluralPipe} from './i18n_plural_pipe';
import {I18nSelectPipe} from './i18n_select_pipe';
import {JsonPipe} from './json_pipe';
import {KeyValue, KeyValuePipe} from './keyvalue_pipe';
import {CurrencyPipe, DecimalPipe, PercentPipe} from './number_pipe';
import {SlicePipe} from './slice_pipe';

export {
  AsyncPipe,
  CurrencyPipe,
  DATE_PIPE_DEFAULT_OPTIONS,
  DATE_PIPE_DEFAULT_TIMEZONE,
  DatePipe,
  DatePipeConfig,
  DecimalPipe,
  I18nPluralPipe,
  I18nSelectPipe,
  JsonPipe,
  KeyValue,
  KeyValuePipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  TitleCasePipe,
  UpperCasePipe,
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
  TitleCasePipe,
  CurrencyPipe,
  DatePipe,
  I18nPluralPipe,
  I18nSelectPipe,
  KeyValuePipe,
];
