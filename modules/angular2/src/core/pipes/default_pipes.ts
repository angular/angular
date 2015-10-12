import {AsyncPipe} from './async_pipe';
import {UpperCasePipe} from './uppercase_pipe';
import {LowerCasePipe} from './lowercase_pipe';
import {JsonPipe} from './json_pipe';
import {SlicePipe} from './slice_pipe';
import {DatePipe} from './date_pipe';
import {DecimalPipe, PercentPipe, CurrencyPipe} from './number_pipe';

import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Provider, OpaqueToken} from 'angular2/src/core/di';

const DEFAULT_PIPES_LIST = CONST_EXPR([
  AsyncPipe,
  UpperCasePipe,
  LowerCasePipe,
  JsonPipe,
  SlicePipe,
  DecimalPipe,
  PercentPipe,
  CurrencyPipe,
  DatePipe
]);

export const DEFAULT_PIPES_TOKEN: OpaqueToken = CONST_EXPR(new OpaqueToken("Default Pipes"));

export const DEFAULT_PIPES: Provider =
    CONST_EXPR(new Provider(DEFAULT_PIPES_TOKEN, {useValue: DEFAULT_PIPES_LIST}));
