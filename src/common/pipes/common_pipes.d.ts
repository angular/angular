/**
 * @module
 * @description
 * This module provides a set of common Pipes.
 */
import { AsyncPipe } from './async_pipe';
import { UpperCasePipe } from './uppercase_pipe';
import { SlicePipe } from './slice_pipe';
/**
 * A collection of Angular core pipes that are likely to be used in each and every
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in pipes in the `pipes`
 * property of the `@Component` or `@View` decorators.
 */
export declare const COMMON_PIPES: (typeof AsyncPipe | typeof UpperCasePipe | typeof SlicePipe)[];
