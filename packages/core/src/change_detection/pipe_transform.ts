/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * An interface that is implemented by pipes in order to perform a transformation.
 * Angular invokes the `transform` method with the value of a binding
 * as the first argument, and any parameters as the second argument in list form.
 *
 * @usageNotes
 *
 * In the following example, `TruncatePipe` returns the shortened value with an added ellipses.
 *
 * <code-example path="core/ts/pipes/simple_truncate.ts" header="simple_truncate.ts"></code-example>
 *
 * Invoking `{{ 'It was the best of times' | truncate }}` in a template will produce `It was...`.
 *
 * In the following example, `TruncatePipe` takes parameters that sets the truncated length and the
 * string to append with.
 *
 * <code-example path="core/ts/pipes/truncate.ts" header="truncate.ts"></code-example>
 *
 * Invoking `{{ 'It was the best of times' | truncate:4:'....' }}` in a template will produce `It
 * was the best....`.
 *
 * @publicApi
 */
export interface PipeTransform {
  transform(value: any, ...args: any[]): any;
}
