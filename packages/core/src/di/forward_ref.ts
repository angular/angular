/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';
import {stringify} from '../util';



/**
 * An interface that a function passed into {@link resolveForwardRef} has to implement.
 *
 * @experimental
 */
export interface ForwardRefFn<T> {
  (): T;
  __forward_ref__: Function;
}


/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared,
 * but not yet defined. It is also used when the `token` which we use when creating a query is not
 * yet defined.
 *
 * ### Example
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
 * @experimental
 */
export function forwardRef<T>(typeFactory: () => T): ForwardRefFn<T> {
  const forwardRefFn = <ForwardRefFn<T>>typeFactory;
  forwardRefFn.__forward_ref__ = forwardRef;
  forwardRefFn.toString = function() { return stringify(this()); };
  return forwardRefFn;
}

/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
 *
 * See: {@link forwardRef}
 * @experimental
 */
export function resolveForwardRef<T>(type: T | ForwardRefFn<T>): T {
  return _isForwardRefFn(type) ? type() : type;
}

function _isForwardRefFn<T>(t: any): t is ForwardRefFn<T> {
  return typeof t === 'function' && t.__forward_ref__ === forwardRef;
}
