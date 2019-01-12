/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SimpleChange, SimpleChanges} from '../interface/simple_change';


type Constructor<T> = new (...args: any[]) => T;

/**
 * Checks an object to see if it's an exact instance of a particular type
 * without traversing the inheritance hierarchy like `instanceof` does.
 * @param obj The object to check
 * @param type The type to check the object against
 */
export function isExactInstanceOf<T>(obj: any, type: Constructor<T>): obj is T {
  return obj != null && typeof obj == 'object' && Object.getPrototypeOf(obj) == type.prototype;
}

/**
 * Checks to see if an object is an instance of {@link OnChangesDirectiveWrapper}
 * @param obj the object to check (generally from `LView`)
 */
export function isOnChangesDirectiveWrapper(obj: any): obj is OnChangesDirectiveWrapper<any> {
  return isExactInstanceOf(obj, OnChangesDirectiveWrapper);
}

/**
 * Removes the `OnChangesDirectiveWrapper` if present.
 *
 * @param obj to unwrap.
 */
export function unwrapOnChangesDirectiveWrapper<T>(obj: T | OnChangesDirectiveWrapper<T>): T {
  return isOnChangesDirectiveWrapper(obj) ? obj.instance : obj;
}

/**
 * A class that wraps directive instances for storage in LView when directives
 * have onChanges hooks to deal with.
 */
export class OnChangesDirectiveWrapper<T = any> {
  seenProps = new Set<string>();
  previous: SimpleChanges = {};
  changes: SimpleChanges|null = null;

  constructor(public instance: T) {}
}

/**
 * Updates the `changes` property on the `wrapper` instance, such that when it's
 * checked in {@link callHooks} it will fire the related `onChanges` hook.
 * @param wrapper the wrapper for the directive instance
 * @param declaredName the declared name to be used in `SimpleChange`
 * @param value The new value for the property
 */
export function recordChange(wrapper: OnChangesDirectiveWrapper, declaredName: string, value: any) {
  const simpleChanges = wrapper.changes || (wrapper.changes = {});

  const firstChange = !wrapper.seenProps.has(declaredName);
  if (firstChange) {
    wrapper.seenProps.add(declaredName);
  }

  const previous = wrapper.previous;
  const previousValue: SimpleChange|undefined = previous[declaredName];
  simpleChanges[declaredName] = new SimpleChange(
      firstChange ? undefined : previousValue && previousValue.currentValue, value, firstChange);
}
