/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '../event_emitter';

/**
 * An `OutputEmitter` is created by the `output()` function and can be
 * used to emit values to consumers of your directive or component.
 *
 * Consumers of your directive/component can bind to the output and
 * subscribe to changes via the bound event syntax. For example:
 *
 * ```html
 * <my-comp (valueChange)="processNewValue($event)" />
 * ```
 *
 * @developerPreview
 */
export interface OutputEmitter<T> {
  emit(value: T): void;

  // TODO: Consider exposing `subscribe` for dynamically created components.
  /** @internal */
  subscribe(listener: (v: T) => void): void;
}

/**
 * Options for declaring an output.
 *
 * @developerPreview
 */
export interface OutputOptions {
  alias?: string;
}

/**
 * The `outputs` function allows declaration of outputs in directives and
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
 *   nameChange = output<string>();     // OutputEmitter<string>
 *   onClick = output();                // OutputEmitter<void>
 * }
 * ```
 *
 * @developerPreview
 */
export function output<T = void>(opts?: OutputOptions): OutputEmitter<T> {
  return new EventEmitter();
}
