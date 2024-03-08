/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext} from '../../di';

import {OutputEmitterRef} from './output_emitter_ref';

/**
 * Options for declaring an output.
 *
 * @developerPreview
 */
export interface OutputOptions {
  alias?: string;
}

/**
 * The `output` function allows declaration of outputs in directives and
 * components.
 *
 * Initializes an output that can emit values to consumers of your
 * directive/component.
 *
 * @usageNotes
 * Initialize an output in your directive by declaring a
 * class field and initializing it with the `output()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   nameChange = output<string>();     // OutputEmitterRef<string>
 *   onClick = output();                // OutputEmitterRef<void>
 * }
 * ```
 *
 * @developerPreview
 */
export function output<T = void>(opts?: OutputOptions): OutputEmitterRef<T> {
  ngDevMode && assertInInjectionContext(output);
  return new OutputEmitterRef<T>();
}
