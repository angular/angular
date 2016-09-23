/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UNINITIALIZED} from '../change_detection/change_detection_util';
import {BaseError, WrappedError} from '../facade/errors';

import {DebugContext} from './debug_context';



/**
 * An error thrown if application changes model breaking the top-down data flow.
 *
 * This exception is only thrown in dev mode.
 *
 * <!-- TODO: Add a link once the dev mode option is configurable -->
 *
 * ### Example
 *
 * ```typescript
 * @Component({
 *   selector: 'parent',
 *   template: '<child [prop]="parentProp"></child>',
 * })
 * class Parent {
 *   parentProp = 'init';
 * }
 *
 * @Directive({selector: 'child', inputs: ['prop']})
 * class Child {
 *   constructor(public parent: Parent) {}
 *
 *   set prop(v) {
 *     // this updates the parent property, which is disallowed during change detection
 *     // this will result in ExpressionChangedAfterItHasBeenCheckedError
 *     this.parent.parentProp = 'updated';
 *   }
 * }
 * ```
 * @stable
 */
export class ExpressionChangedAfterItHasBeenCheckedError extends BaseError {
  constructor(oldValue: any, currValue: any) {
    let msg =
        `Expression has changed after it was checked. Previous value: '${oldValue}'. Current value: '${currValue}'.`;
    if (oldValue === UNINITIALIZED) {
      msg +=
          ` It seems like the view has been created after its parent and its children have been dirty checked.` +
          ` Has it been created in a change detection hook ?`;
    }
    super(msg);
  }
}

/**
 * Thrown when an exception was raised during view creation, change detection or destruction.
 *
 * This error wraps the original exception to attach additional contextual information that can
 * be useful for debugging.
 * @stable
 */
export class ViewWrappedError extends WrappedError {
  /**
   * DebugContext
   */
  context: DebugContext;

  constructor(originalError: any, context: DebugContext) {
    super(`Error in ${context.source}`, originalError);
    this.context = context;
  }
}

/**
 * Thrown when a destroyed view is used.
 *
 * This error indicates a bug in the framework.
 *
 * This is an internal Angular error.
 * @stable
 */
export class ViewDestroyedError extends BaseError {
  constructor(details: string) { super(`Attempt to use a destroyed view: ${details}`); }
}
