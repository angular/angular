/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OnChanges} from '../../interface/lifecycle_hooks';
import {SimpleChange, SimpleChanges} from '../../interface/simple_change';
import {EMPTY_OBJ} from '../empty';
import {DirectiveDef, DirectiveDefFeature} from '../interfaces/definition';

const PRIVATE_PREFIX = '__ngOnChanges_';

type OnChangesExpando = OnChanges & {
  __ngOnChanges_: SimpleChanges|null|undefined;
  // tslint:disable-next-line:no-any Can hold any value
  [key: string]: any;
};

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
 * static ngComponentDef = defineComponent({
 *   ...
 *   inputs: {name: 'publicName'},
 *   features: [NgOnChangesFeature()]
 * });
 * ```
 */
export function NgOnChangesFeature<T>(): DirectiveDefFeature {
  // This option ensures that the ngOnChanges lifecycle hook will be inherited
  // from superclasses (in InheritDefinitionFeature).
  (NgOnChangesFeatureImpl as DirectiveDefFeature).ngInherit = true;
  return NgOnChangesFeatureImpl;
}

function NgOnChangesFeatureImpl<T>(definition: DirectiveDef<T>): void {
  if (definition.type.prototype.ngOnChanges) {
    definition.setInput = ngOnChangesSetInput;
    definition.onChanges = wrapOnChanges();
  }
}

function wrapOnChanges() {
  return function(this: OnChanges) {
    const simpleChangesStore = getSimpleChangesStore(this);
    const current = simpleChangesStore && simpleChangesStore.current;

    if (current) {
      simpleChangesStore !.previous = current;
      simpleChangesStore !.current = null;
      this.ngOnChanges(current);
    }
  };
}

function ngOnChangesSetInput<T>(
    this: DirectiveDef<T>, instance: T, value: any, publicName: string, privateName: string): void {
  const simpleChangesStore = getSimpleChangesStore(instance) ||
      setSimpleChangesStore(instance, {previous: EMPTY_OBJ, current: null});
  const current = simpleChangesStore.current || (simpleChangesStore.current = {});
  const previous = simpleChangesStore.previous;

  const declaredName = (this.declaredInputs as{[key: string]: string})[publicName];
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

interface NgSimpleChangesStore {
  previous: SimpleChanges;
  current: SimpleChanges|null;
}
