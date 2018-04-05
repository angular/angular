
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {TNode} from './interfaces/node';

/** Called when directives inject each other (creating a circular dependency) */
export function throwCyclicDependencyError(token: any): never {
  throw new Error(`Cannot instantiate cyclic dependency! ${token}`);
}

/** Called when there are multiple component selectors that match a given node */
export function throwMultipleComponentError(tNode: TNode): never {
  throw new Error(`Multiple components match node with tagname ${tNode.tagName}`);
}

/** Throws an ExpressionChangedAfterChecked error if checkNoChanges mode is on. */
export function throwErrorIfNoChangesMode(
    creationMode: boolean, checkNoChangesMode: boolean, oldValue: any, currValue: any): never|void {
  if (checkNoChangesMode) {
    let msg =
        `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: '${oldValue}'. Current value: '${currValue}'.`;
    if (creationMode) {
      msg +=
          ` It seems like the view has been created after its parent and its children have been dirty checked.` +
          ` Has it been created in a change detection hook ?`;
    }
    // TODO: include debug context
    throw new Error(msg);
  }
}
