import {Type, stringify, isFunction} from 'angular2/src/core/facade/lang';

export interface ForwardRefFn { (): any; }

/**
 * Allows to refer to references which are not yet defined.
 *
 * This situation arises when the key which we need te refer to for the purposes of DI is declared,
 * but not yet defined.
 *
 * ## Example:
 *
 * ```
 * class Door {
 *   // Incorrect way to refer to a reference which is defined later.
 *   // This fails because `Lock` is undefined at this point.
 *   constructor(lock:Lock) { }
 *
 *   // Correct way to refer to a reference which is defined later.
 *   // The reference needs to be captured in a closure.
 *   constructor(@Inject(forwardRef(() => Lock)) lock:Lock) { }
 * }
 *
 * // Only at this point the lock is defined.
 * class Lock {
 * }
 * ```
 */
export function forwardRef(forwardRefFn: ForwardRefFn): Type {
  (<any>forwardRefFn).__forward_ref__ = forwardRef;
  (<any>forwardRefFn).toString = function() { return stringify(this()); };
  return (<Type><any>forwardRefFn);
}

/**
 * Lazily retrieve the reference value.
 *
 * See: {@link forwardRef}
 */
export function resolveForwardRef(type: any): any {
  if (isFunction(type) && type.hasOwnProperty('__forward_ref__') &&
      type.__forward_ref__ === forwardRef) {
    return (<ForwardRefFn>type)();
  } else {
    return type;
  }
}
