/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChange} from '../../change_detection/change_detection_util';
import {OnChanges, SimpleChanges} from '../../metadata/lifecycle_hooks';
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
 *   features: [NgOnChangesFeature]
 * });
 * ```
 */
export function NgOnChangesFeature<T>(definition: DirectiveDef<T>): void {
  const declaredToMinifiedInputs = definition.declaredInputs;
  const proto = definition.type.prototype;
  for (const declaredName in declaredToMinifiedInputs) {
    if (declaredToMinifiedInputs.hasOwnProperty(declaredName)) {
      const minifiedKey = declaredToMinifiedInputs[declaredName];
      const privateMinKey = PRIVATE_PREFIX + minifiedKey;

      // Walk the prototype chain to see if we find a property descriptor
      // That way we can honor setters and getters that were inherited.
      let originalProperty: PropertyDescriptor|undefined = undefined;
      let checkProto = proto;
      while (!originalProperty && checkProto &&
             Object.getPrototypeOf(checkProto) !== Object.getPrototypeOf(Object.prototype)) {
        originalProperty = Object.getOwnPropertyDescriptor(checkProto, minifiedKey);
        checkProto = Object.getPrototypeOf(checkProto);
      }

      const getter = originalProperty && originalProperty.get;
      const setter = originalProperty && originalProperty.set;

      // create a getter and setter for property
      Object.defineProperty(proto, minifiedKey, {
        get: getter ||
            (setter ? undefined : function(this: OnChangesExpando) { return this[privateMinKey]; }),
        set<T>(this: OnChangesExpando, value: T) {
          let simpleChanges = this[PRIVATE_PREFIX];
          if (!simpleChanges) {
            simpleChanges = {};
            // Place where we will store SimpleChanges if there is a change
            Object.defineProperty(this, PRIVATE_PREFIX, {value: simpleChanges, writable: true});
          }

          const isFirstChange = !this.hasOwnProperty(privateMinKey);
          const currentChange = simpleChanges[declaredName];

          if (currentChange) {
            currentChange.currentValue = value;
          } else {
            simpleChanges[declaredName] =
                new SimpleChange(this[privateMinKey], value, isFirstChange);
          }

          if (isFirstChange) {
            // Create a place where the actual value will be stored and make it non-enumerable
            Object.defineProperty(this, privateMinKey, {value, writable: true});
          } else {
            this[privateMinKey] = value;
          }

          if (setter) setter.call(this, value);
        },
        // Make the property configurable in dev mode to allow overriding in tests
        configurable: !!ngDevMode
      });
    }
  }

  // If an onInit hook is defined, it will need to wrap the ngOnChanges call
  // so the call order is changes-init-check in creation mode. In subsequent
  // change detection runs, only the check wrapper will be called.
  if (definition.onInit != null) {
    definition.onInit = onChangesWrapper(definition.onInit);
  }

  definition.doCheck = onChangesWrapper(definition.doCheck);
}

// This option ensures that the ngOnChanges lifecycle hook will be inherited
// from superclasses (in InheritDefinitionFeature).
(NgOnChangesFeature as DirectiveDefFeature).ngInherit = true;

function onChangesWrapper(delegateHook: (() => void) | null) {
  return function(this: OnChangesExpando) {
    const simpleChanges = this[PRIVATE_PREFIX];
    if (simpleChanges != null) {
      this.ngOnChanges(simpleChanges);
      this[PRIVATE_PREFIX] = null;
    }
    if (delegateHook) delegateHook.apply(this);
  };
}
