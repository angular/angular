/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {StrictRxChain} from './rx-operators';

/**
 * Utility class used to chain RxJS operators.
 *
 * This class is the concrete implementation, but the type used by the user when chaining
 * is StrictRxChain. The strict chain enforces types on the operators to the same level as
 * the prototype-added equivalents.
 */
export class RxChain<T> {
  private constructor(private _context: Observable<T>) { }

  /**
   * Starts a new chain and specifies the initial `this` value.
   * @param context Initial `this` value for the chain.
   */
  static from<O>(context: Observable<O>): StrictRxChain<O> {
    return new RxChain(context);
  }

  /**
   * Invokes an RxJS operator as a part of the chain.
   * @param operator Operator to be invoked.
   * @param args Arguments to be passed to the operator.
   */
  call(operator: Function, ...args: any[]): RxChain<any> {
    this._context = operator.call(this._context, ...args);
    return this;
  }

  /**
   * Subscribes to the result of the chain.
   * @param fn Callback to be invoked when the result emits a value.
   */
  subscribe(fn: (t: T) => void): Subscription {
    return this._context.subscribe(fn);
  }

  /**
   * Returns the result of the chain.
   */
  result(): Observable<T> {
    return this._context;
  }
}
