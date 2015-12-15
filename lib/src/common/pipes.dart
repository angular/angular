/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
library angular2.src.common.pipes;

import "pipes/async_pipe.dart" show AsyncPipe;
import "pipes/uppercase_pipe.dart" show UpperCasePipe;
import "pipes/lowercase_pipe.dart" show LowerCasePipe;
import "pipes/json_pipe.dart" show JsonPipe;
import "pipes/slice_pipe.dart" show SlicePipe;
import "pipes/date_pipe.dart" show DatePipe;
import "pipes/number_pipe.dart" show DecimalPipe, PercentPipe, CurrencyPipe;
export "pipes/async_pipe.dart" show AsyncPipe;
export "pipes/date_pipe.dart" show DatePipe;
export "pipes/json_pipe.dart" show JsonPipe;
export "pipes/slice_pipe.dart" show SlicePipe;
export "pipes/lowercase_pipe.dart" show LowerCasePipe;
export "pipes/number_pipe.dart"
    show NumberPipe, DecimalPipe, PercentPipe, CurrencyPipe;
export "pipes/uppercase_pipe.dart" show UpperCasePipe;

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
