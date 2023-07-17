/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OnChanges} from '../../interface/lifecycle_hooks';
import {SimpleChange, SimpleChanges} from '../../interface/simple_change';
import {assertString} from '../../util/assert';
import {EMPTY_OBJ} from '../../util/empty';
import {DirectiveDef, DirectiveDefFeature} from '../interfaces/definition';

/**
 * The NgOnChangesFeature decorates a component with support for the ngOnChanges
 * lifecycle hook, so it should be included in any component that implements
 * that hook.
 *
 * If the component or directive uses inheritance, the NgOnChangesFeature MUST
 * be included as a feature AFTER {@link InheritDefinitionFeature}, otherwise
 * inherited properties will not be propagated to the ngOnChanges lifecycle
 * hook.
 *
 * Example usage:
 *
 * ```
 * static ɵcmp = defineComponent({
 *   ...
 *   inputs: {name: 'publicName'},
 *   features: [NgOnChangesFeature]
 * });
 * ```
 *
 * @codeGenApi
 */
export function ɵɵNgOnChangesFeature<T>(): DirectiveDefFeature {
  return NgOnChangesFeatureImpl;
}

export function NgOnChangesFeatureImpl<T>(definition: DirectiveDef<T>) {
  if (definition.type.prototype.ngOnChanges) {
    definition.setInput = ngOnChangesSetInput;
  }
  return rememberChangeHistoryAndInvokeOnChangesHook;
}

// This option ensures that the ngOnChanges lifecycle hook will be inherited
// from superclasses (in InheritDefinitionFeature).
/** @nocollapse */
// tslint:disable-next-line:no-toplevel-property-access
(ɵɵNgOnChangesFeature as DirectiveDefFeature).ngInherit = true;

/**
 * This is a synthetic lifecycle hook which gets inserted into `TView.preOrderHooks` to simulate
 * `ngOnChanges`.
 *
 * The hook reads the `NgSimpleChangesStore` data from the component instance and if changes are
 * found it invokes `ngOnChanges` on the component instance.
 *
 * @param this Component instance. Because this function gets inserted into `TView.preOrderHooks`,
 *     it is guaranteed to be called with component instance.
 */
function rememberChangeHistoryAndInvokeOnChangesHook(this: OnChanges) {
  const simpleChangesStore = getSimpleChangesStore(this);
  const current = simpleChangesStore?.current;

  if (current) {
    const previous = simpleChangesStore!.previous;
    if (previous === EMPTY_OBJ) {
      simpleChangesStore!.previous = current;
    } else {
      // New changes are copied to the previous store, so that we don't lose history for inputs
      // which were not changed this time
      for (let key in current) {
        previous[key] = current[key];
      }
    }
    simpleChangesStore!.current = null;
    this.ngOnChanges(current);
  }
}


function ngOnChangesSetInput<T>(
    this: DirectiveDef<T>, instance: T, value: any, publicName: string, privateName: string): void {
  const declaredName = (this.declaredInputs as {[key: string]: string})[publicName];
  ngDevMode && assertString(declaredName, 'Name of input in ngOnChanges has to be a string');
  const simpleChangesStore = getSimpleChangesStore(instance) ||
      setSimpleChangesStore(instance, {previous: EMPTY_OBJ, current: null});
  const current = simpleChangesStore.current || (simpleChangesStore.current = {});
  const previous = simpleChangesStore.previous;
  const previousChange = previous[declaredName];
  current[declaredName] = new SimpleChange(
      previousChange && previousChange.currentValue, value, previous === EMPTY_OBJ);

  (instance as any)[privateName] = value;
}

const SIMPLE_CHANGES_STORE = '__ngSimpleChanges__';

function getSimpleChangesStore(instance: any): null|NgSimpleChangesStore {
  return instance[SIMPLE_CHANGES_STORE] || null;
}

function setSimpleChangesStore(instance: any, store: NgSimpleChangesStore): NgSimpleChangesStore {
  return instance[SIMPLE_CHANGES_STORE] = store;
}

/**
 * Data structure which is monkey-patched on the component instance and used by `ngOnChanges`
 * life-cycle hook to track previous input values.
 */
interface NgSimpleChangesStore {
  previous: SimpleChanges;
  current: SimpleChanges|null;
}
