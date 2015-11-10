/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
library angular2.src.common.pipes.common_pipes;

import "async_pipe.dart" show AsyncPipe;
import "uppercase_pipe.dart" show UpperCasePipe;
import "lowercase_pipe.dart" show LowerCasePipe;
import "json_pipe.dart" show JsonPipe;
import "slice_pipe.dart" show SlicePipe;
import "date_pipe.dart" show DatePipe;
import "number_pipe.dart" show DecimalPipe, PercentPipe, CurrencyPipe;

const COMMON_PIPES = const [
  AsyncPipe,
  UpperCasePipe,
  LowerCasePipe,
  JsonPipe,
  SlicePipe,
  DecimalPipe,
  PercentPipe,
  CurrencyPipe,
  DatePipe
];
