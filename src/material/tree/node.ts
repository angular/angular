/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CDK_TREE_NODE_OUTLET_NODE,
  CdkNestedTreeNode,
  CdkTree,
  CdkTreeNode,
  CdkTreeNodeDef,
} from '@angular/cdk/tree';
import {
  AfterContentInit,
  Attribute,
  Directive,
  ElementRef,
  Input,
  IterableDiffers,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {CanDisable, HasTabIndex, mixinDisabled, mixinTabIndex} from '@angular/material/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';

const _MatTreeNodeBase = mixinTabIndex(mixinDisabled(CdkTreeNode));

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  inputs: ['role', 'disabled', 'tabIndex'],
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}],
  host: {
    'class': 'mat-tree-node',
  },
})
export class MatTreeNode<T, K = T>
  extends _MatTreeNodeBase<T, K>
  implements CanDisable, HasTabIndex, OnInit, OnDestroy
{
  constructor(
    elementRef: ElementRef<HTMLElement>,
    tree: CdkTree<T, K>,
    @Attribute('tabindex') tabIndex: string,
  ) {
    super(elementRef, tree);
    this.tabIndex = Number(tabIndex) || 0;
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}

/**
 * Wrapper for the CdkTree node definition with Material design styles.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
@Directive({
  selector: '[matTreeNodeDef]',
  inputs: ['when: matTreeNodeDefWhen'],
  providers: [{provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef}],
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
  inputs: ['role', 'disabled', 'tabIndex'],
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode},
  ],
  host: {
    'class': 'mat-nested-tree-node',
  },
})
export class MatNestedTreeNode<T, K = T>
  extends CdkNestedTreeNode<T, K>
  implements AfterContentInit, OnDestroy, OnInit
{
  @Input('matNestedTreeNode') node: T;

  /** Whether the node is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /** Tabindex for the node. */
  @Input()
  get tabIndex(): number {
    return this.disabled ? -1 : this._tabIndex;
  }
  set tabIndex(value: number) {
    // If the specified tabIndex value is null or undefined, fall back to the default value.
    this._tabIndex = value != null ? value : 0;
  }
  private _tabIndex: number;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    tree: CdkTree<T, K>,
    differs: IterableDiffers,
    @Attribute('tabindex') tabIndex: string,
  ) {
    super(elementRef, tree, differs);
    this.tabIndex = Number(tabIndex) || 0;
  }

  // This is a workaround for https://github.com/angular/angular/issues/19145
  // In aot mode, the lifecycle hooks from parent class are not called.
  // TODO(tinayuangao): Remove when the angular issue #19145 is fixed
  override ngOnInit() {
    super.ngOnInit();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }
}
