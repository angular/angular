/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
import {AsyncPipe} from './async_pipe';
import {UpperCasePipe} from './uppercase_pipe';
import {LowerCasePipe} from './lowercase_pipe';
import {JsonPipe} from './json_pipe';
import {SlicePipe} from './slice_pipe';
import {DatePipe} from './date_pipe';
import {DecimalPipe, PercentPipe, CurrencyPipe} from './number_pipe';
import {ReplacePipe} from './replace_pipe';
import {I18nPluralPipe} from './i18n_plural_pipe';
import {I18nSelectPipe} from './i18n_select_pipe';
import {CONST_EXPR} from 'angular2/src/facade/lang';

/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` decorator.
 */
export const COMMON_PIPES = CONST_EXPR([
  AsyncPipe,
  UpperCasePipe,
  LowerCasePipe,
  JsonPipe,
  SlicePipe,
  DecimalPipe,
  PercentPipe,
  CurrencyPipe,
  DatePipe,
  ReplacePipe,
  I18nPluralPipe,
  I18nSelectPipe
]);
