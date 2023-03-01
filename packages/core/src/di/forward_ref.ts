/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {getClosureSafeProperty} from '../util/property';
import {stringify} from '../util/stringify';



/**
 * An interface that a function passed into {@link forwardRef} has to implement.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref_fn'}
 * @publicApi
 */
export interface ForwardRefFn {
  (): any;
}

const __forward_ref__ = getClosureSafeProperty({__forward_ref__: getClosureSafeProperty});

/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined. It is also used when the `token` which we use when creating
 * a query is not yet defined.
 *
 * @usageNotes
 * ### Example
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
 * @publicApi
 */
export function forwardRef(forwardRefFn: ForwardRefFn): Type<any> {
  (<any>forwardRefFn).__forward_ref__ = forwardRef;
  (<any>forwardRefFn).toString = function() {
    return stringify(this());
  };
  return (<Type<any>><any>forwardRefFn);
}

/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
 *
 * @see `forwardRef`
 * @publicApi
 */
export function resolveForwardRef<T>(type: T): T {
  return isForwardRef(type) ? type() : type;
}

/** Checks whether a function is wrapped by a `forwardRef`. */
export function isForwardRef(fn: any): fn is() => any {
  return typeof fn === 'function' && fn.hasOwnProperty(__forward_ref__) &&
      fn.__forward_ref__ === forwardRef;
}
