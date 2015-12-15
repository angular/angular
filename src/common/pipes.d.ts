/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
import { AsyncPipe } from './pipes/async_pipe';
import { UpperCasePipe } from './pipes/uppercase_pipe';
import { SlicePipe } from './pipes/slice_pipe';
export { AsyncPipe } from './pipes/async_pipe';
export { DatePipe } from './pipes/date_pipe';
export { JsonPipe } from './pipes/json_pipe';
export { SlicePipe } from './pipes/slice_pipe';
export { LowerCasePipe } from './pipes/lowercase_pipe';
export { NumberPipe, DecimalPipe, PercentPipe, CurrencyPipe } from './pipes/number_pipe';
export { UpperCasePipe } from './pipes/uppercase_pipe';
/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` or `@View` decorators.
 */
export declare const COMMON_PIPES: (typeof AsyncPipe | typeof UpperCasePipe | typeof SlicePipe)[];
