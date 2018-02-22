/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Attribute,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  QueryList
} from '@angular/core';
import {
  CdkNestedTreeNode,
  CdkTree,
  CdkTreeNodeDef,
  CdkTreeNode,
} from '@angular/cdk/tree';
import {MatTreeNodeOutlet} from './outlet';
import {mixinTabIndex, mixinDisabled, CanDisable, HasTabIndex} from '@angular/material/core';


export const _MatTreeNodeMixinBase = mixinTabIndex(mixinDisabled(CdkTreeNode));
export const _MatNestedTreeNodeMixinBase = mixinTabIndex(mixinDisabled(CdkNestedTreeNode));

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  inputs: ['disabled', 'tabIndex'],
  host: {
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.aria-level]': 'level',
    '[attr.role]': 'role',
    'class': 'mat-tree-node'
  },
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}]
})
export class MatTreeNode<T> extends _MatTreeNodeMixinBase<T> implements HasTabIndex, CanDisable {
  @Input() role: 'treeitem' | 'group' = 'treeitem';

  constructor(protected _elementRef: ElementRef,
              protected _tree: CdkTree<T>,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree);

    this.tabIndex = Number(tabIndex) || 0;
  }
}

/**
 * Wrapper for the CdkTree node definition with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeDef]',
  inputs: [
    'when: matTreeNodeDefWhen'
  ],
  providers: [{provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef}]
})
export class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
  @Input('matTreeNode') data: T;
}

/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
@Directive({
  selector: 'mat-nested-tree-node',
  exportAs: 'matNestedTreeNode',
  host: {
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.role]': 'role',
    'class': 'mat-nested-tree-node',
  },
  inputs: ['disabled', 'tabIndex'],
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode}
  ]
})
export class MatNestedTreeNode<T> extends _MatNestedTreeNodeMixinBase<T>
    implements HasTabIndex, CanDisable {

  @Input('matNestedTreeNode') node: T;

  @ContentChildren(MatTreeNodeOutlet) nodeOutlet: QueryList<MatTreeNodeOutlet>;

  constructor(protected _elementRef: ElementRef,
              protected _tree: CdkTree<T>,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree);

    this.tabIndex = Number(tabIndex) || 0;
  }
}
