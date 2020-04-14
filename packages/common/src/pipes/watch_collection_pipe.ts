/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Pipe, PipeTransform} from '@angular/core';

import {ArrayHarness, DefaultValueHarness, MapHarness, ValueHarness} from './value_harness';

/**
 * @ngModule CommonModule
 * @description
 *
 * Watches and creates a new instance of a collection each time the contents change.
 *
 * This pipe is designed to be used when collection-based values are assigned to template
 * bindings. Template bindings only update when the reference of the binding changes (i.e.
 * when a new variable value is assigned to the binding). This behavior works fine for
 * scalar values (e.g. `null`, `string`, `number`, etc...), however, it will not detect if
 * the inner contents of a variable change. This means that if an array or key/value object
 * is assigned to a template binding then the binding setter will only execute if a new array
 * or key/value object is created.
 *
 * The `watchCollection` pipe fills this hole by shallow-watching the entries within an array
 * or key/value map. If and when those entries change within the collection then the pipe will
 * create a new instance of the collection and pass that on to the binding.
 *
 * This pipe supports both arrays and map values. When assigned, it will examine and
 * compare the contents of the collection to the previous value of the collection
 *
 * The example below shows how to use the `watchCollection` pipe within a component template:
 *
 * @usageNotes
 *
 * ```html
 * <!-- the [values] binding will only update when the
 *      `myValues` binding value changes in reference (when the
 *      value identity changes) -->
 * <inner-comp [values]="myValues"></inner-comp>
 *
 * <!-- the [values] binding will now update each time the contents
 *      of the `myValues` collection will change in entries -->
 * <inner-comp [values]="myValues | watchCollection"></inner-comp>
 * ```
 *
 * @publicApi
 */
@Pipe({name: 'watchCollection', pure: false})
export class WatchCollectionPipe implements PipeTransform {
  private _previousValue: unknown = undefined;
  private _valueHarness: ValueHarness<unknown> = new DefaultValueHarness(undefined);

  /**
   * Returns a new instance of a collection value if an when the contents of the provided `value`
   * collection differ from the previous collection.
   */
  transform<T extends {[key: string]: any}|any[]|null|undefined>(value: T): T {
    if (value === this._previousValue) {
      // Case #1: the collection reference hasn't changed (therefore just update the contents)
      this._valueHarness.update(value);
    } else {
      // Case #2: the reference has changed (therefore create a new harness on that collection)
      this._previousValue = value;

      // if an identity change has occurs this means that the value type could have
      // also changed. For this reason a new watcher instance needs to be created.
      this._valueHarness = createValueHarness(value);
    }

    // if the value harness changes or the contents of the collection have
    // changed then the `.value` identity will have changed. Otherwise the
    // old `value` is returned.
    return this._valueHarness.value as T;
  }
}

/**
 * Returns type-specific instance of `ValueHarness` based on the provided `value`.
 *
 * Depending on the typeof provided `value` param, this function will return one of the following:
 * Case #1: `ArrayHarness` when `value` is array-like
 * Case #2: `MapHarness` when `value` is a key/value map
 * Case #3: `DefaultValueHarness` when `value` is non-collection type
 */
function createValueHarness(value: unknown): ValueHarness<unknown> {
  // Case #1: array
  if (Array.isArray(value)) {
    return new ArrayHarness(value);
  }

  // Case #2: map
  if (value !== null && typeof value === 'object') {
    return new MapHarness(value as {});
  }

  // Case #3: non-collection value
  return new DefaultValueHarness(value);
}
