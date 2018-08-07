/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {CdkTreeNodeToggle, CdkTree, CdkTreeNode} from '@angular/cdk/tree';

/**
 * Wrapper for the CdkTree's toggle with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeToggle]',
  host: {
    '(click)': '_toggle($event)',
  },
  providers: [{provide: CdkTreeNodeToggle, useExisting: MatTreeNodeToggle}]
})
export class MatTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
  @Input('matTreeNodeToggleRecursive') recursive: boolean = false;

  // TODO(andrewseguin): Remove this explicitly set constructor when the compiler knows how to
  // properly build the es6 version of the class. Currently sets ctorParameters to empty due to a
  // fixed bug.
  // https://github.com/angular/tsickle/pull/760 - tsickle PR that fixed this
  // https://github.com/angular/angular/pull/23531 - updates compiler-cli to fixed version
  constructor(_tree: CdkTree<T>, _treeNode: CdkTreeNode<T>) {
    super(_tree, _treeNode);
  }
}
