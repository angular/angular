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

/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` or `@View` decorators.
 */
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
