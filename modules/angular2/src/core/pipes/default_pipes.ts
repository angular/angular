import {AsyncPipe} from './async_pipe';
import {UpperCasePipe} from './uppercase_pipe';
import {LowerCasePipe} from './lowercase_pipe';
import {JsonPipe} from './json_pipe';
import {LimitToPipe} from './limit_to_pipe';
import {DatePipe} from './date_pipe';
import {DecimalPipe, PercentPipe, CurrencyPipe} from './number_pipe';

import {CONST_EXPR} from 'angular2/src/core/facade/lang';
import {Binding, OpaqueToken} from 'angular2/di';

const DEFAULT_PIPES_LIST = CONST_EXPR([
  AsyncPipe,
  UpperCasePipe,
  LowerCasePipe,
  JsonPipe,
  LimitToPipe,
  DecimalPipe,
  PercentPipe,
  CurrencyPipe,
  DatePipe
]);

export const DEFAULT_PIPES_TOKEN = CONST_EXPR(new OpaqueToken("Default Pipes"));

export const DEFAULT_PIPES =
    CONST_EXPR(new Binding(DEFAULT_PIPES_TOKEN, {toValue: DEFAULT_PIPES_LIST}));
