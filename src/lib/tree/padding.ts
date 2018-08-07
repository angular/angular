/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CdkTreeNodePadding, CdkTreeNode, CdkTree} from '@angular/cdk/tree';
import {Directionality} from '@angular/cdk/bidi';
import {Directive, Input, Optional, Renderer2, ElementRef} from '@angular/core';


/**
 * Wrapper for the CdkTree padding with Material design styles.
 */
@Directive({
  selector: '[matTreeNodePadding]',
  providers: [{provide: CdkTreeNodePadding, useExisting: MatTreeNodePadding}]
})
export class MatTreeNodePadding<T> extends CdkTreeNodePadding<T> {

  /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
  @Input('matTreeNodePadding') level: number;

  /** The indent for each level. Default number 40px from material design menu sub-menu spec. */
  @Input('matTreeNodePaddingIndent') indent: number;

  // TODO(andrewseguin): Remove this explicitly set constructor when the compiler knows how to
  // properly build the es6 version of the class. Currently sets ctorParameters to empty due to a
  // fixed bug.
  // https://github.com/angular/tsickle/pull/760 - tsickle PR that fixed this
  // https://github.com/angular/angular/pull/23531 - updates compiler-cli to fixed version
  constructor(_treeNode: CdkTreeNode<T>,
              _tree: CdkTree<T>,
              _renderer: Renderer2,
              _element: ElementRef,
              @Optional() _dir: Directionality) {
      super(_treeNode, _tree, _renderer, _element, _dir);
    }
}
