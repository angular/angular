/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isSignal} from './utils';
/**
 * Mutates the nested property under the provided object and assigns the new value.
 * Supports both plain objects/arrays as well deep mutations within a signal.
 *
 * @param obj The object to assign to.
 * @param keyPath An array of strings representing nested properties to be
 *     assigned.
 * @param newValue The value to assign.
 *
 * Example:
 *
 * ```typescript
 * const obj = {foo: {bar: [1]}};
 * mutateNestedProp(obj, ['foo', 'bar', '0'], 2);
 * obj.foo.bar[0]; // 2
 * ```
 *
 * When no signals are present, this performs a basic property assignment.
 *
 * ```typescript
 * mutateNestedProp(obj, ['foo', 'bar', '0'], 1);
 * // Equivalent to:
 * obj.foo.bar[0] = 1;
 * ```
 *
 * Signals are handled by performing an immutable copy of their contents.
 *
 * ```typescript
 * mutateNestedProp(obj, ['foo', 'bar', '1'], 2);
 * // If `foo` is a signal, equivalent to:
 * obj.foo.set({
 *   ...obj.foo(),
 *   bar: [
 *     ...obj.foo().bar.slice(0, 1),
 *     2,
 *     ...obj.foo().bar.slice(2),
 *   ],
 * });
 * ```
 *
 * The algorithm works by walking the full list of properties and looking for a
 * signal function. If one is found, we apply an immutable update on its contents
 * and call `.set` with the result. If no signals are found, we get the last
 * receiver in the chain and assign the value directly
 * (`receiver[prop] = newValue;`).
 */
export function mutateNestedProp(obj, keyPath, newValue) {
  if (keyPath.length === 0) throw new Error('At least one key is required.');
  const nestedProps = Array.from(getNestedProps(obj, keyPath));
  // Check for nested signals.
  const signalCount = nestedProps.filter((prop) => isSignal(prop.value)).length;
  if (signalCount > 1) throw new Error('Cannot mutate nested signals.');
  // Check for a single signal.
  const signalIndex = nestedProps.findIndex((prop) => isSignal(prop.value));
  if (signalIndex !== -1) {
    const sig = nestedProps[signalIndex];
    const props = nestedProps.slice(signalIndex + 1);
    if (!isWritableSignal(sig.value)) {
      const propPath = nestedProps
        .slice(0, signalIndex + 1)
        .map((prop) => prop.key)
        .join('.');
      throw new Error(`Cannot mutate a readonly signal at \`${propPath}\`.`);
    }
    sig.value.set(immutableUpdate(props, newValue));
    return;
  }
  // No signals in this key path, just assign to the last receiver.
  // First check to ensure there this is not a getter.
  const finalProp = nestedProps[nestedProps.length - 1];
  const descriptor = getInheritedPropertyDescriptor(finalProp.receiver, finalProp.key);
  if (descriptor && descriptor.get && !descriptor.set) {
    throw new Error(`Cannot mutate getter property: ${finalProp.key}`);
  }
  finalProp.receiver[finalProp.key] = newValue;
}
/** Walk the object properties and generate {@link PropertyAccess} objects. */
function* getNestedProps(receiver, keyPath) {
  const keys = Array.from(keyPath);
  while (keys.length !== 0) {
    const key = keys.shift();
    if (Array.isArray(receiver) && parseInt(key) >= receiver.length) {
      throw new Error(`Cannot access index ${key} for array of length ${receiver.length}.`);
    }
    if (!(key in receiver)) {
      throw new Error(`Property \`${key}\` is not defined on the object.`);
    }
    const value = receiver[key];
    yield {
      receiver,
      key,
      value,
    };
    receiver = isSignal(value) ? value() : value;
  }
}
/**
 * Apply an immutable update assigning `newValue` to the list of properties
 * provided. Generates new objects and retains existing properties while
 * overwriting the specific nested property given.
 */
function immutableUpdate(props, newValue) {
  if (props.length === 0) return newValue;
  const [prop, ...remainingProps] = props;
  if (Array.isArray(prop.receiver)) {
    const index = parseInt(prop.key);
    return [
      ...prop.receiver.slice(0, index),
      immutableUpdate(remainingProps, newValue),
      ...prop.receiver.slice(index + 1),
    ];
  } else if (typeof prop.receiver === 'object') {
    assertSafeToImmutablyUpdate(prop.receiver);
    return {
      ...prop.receiver,
      [prop.key]: immutableUpdate(remainingProps, newValue),
    };
  } else {
    throw new Error(`Cannot immutably update type: ${prop.receiver.constructor.name}`);
  }
}
/**
 * Gets the {@link PropertyDescriptor} for the given name, even if inherited from the
 * prototype. This is effectively equivalent to
 * {@link Object.getOwnPropertyDescriptor}, except it is not limited to "own"
 * properties.
 */
function getInheritedPropertyDescriptor(obj, prop) {
  if (obj === null) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
  if (descriptor) return descriptor;
  return getInheritedPropertyDescriptor(Object.getPrototypeOf(obj), prop);
}
/** Assert that a given signal is writable. */
function isWritableSignal(sig) {
  return 'set' in sig;
}
/**
 * Assert that the given object may be safely updated in an immutable fashion.
 *
 * Objects with user-defined prototypes may not be immutably updated because they
 * would lose their prototypes.
 *
 * ```typescript
 * ({...new MyFoo()}).doSomething(); // Doesn't work.
 * ```
 */
function assertSafeToImmutablyUpdate(obj) {
  // `new MyClass()` case.
  if (obj.constructor !== Object) {
    throw new Error(`Cannot immutably update type: ${obj.constructor.name}`);
  }
  // `{ get foo() { return 'foo'; } }` case.
  // Need to check all inherited property descriptors, not just own descriptors.
  for (const prop in obj) {
    const descriptor = getInheritedPropertyDescriptor(obj, prop);
    if (!descriptor) continue;
    if (descriptor.get || descriptor.set) {
      throw new Error('Cannot immutably update object with getters or setters.');
    }
  }
}
//# sourceMappingURL=property-mutation.js.map
