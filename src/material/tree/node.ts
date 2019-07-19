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
} from '@angular/core';
import {
  CanDisable,
  CanDisableCtor,
  HasTabIndex,
  HasTabIndexCtor,
  mixinDisabled,
  mixinTabIndex,
} from '@angular/material/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

const _MatTreeNodeMixinBase: HasTabIndexCtor & CanDisableCtor & typeof CdkTreeNode =
    mixinTabIndex(mixinDisabled(CdkTreeNode));

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  inputs: ['disabled', 'tabIndex'],
  host: {
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.aria-level]': 'role === "treeitem" ? level : null',
    '[attr.role]': 'role',
    'class': 'mat-tree-node'
  },
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}]
})
export class MatTreeNode<T> extends _MatTreeNodeMixinBase<T>
    implements CanDisable, HasTabIndex {
  @Input() role: 'treeitem' | 'group' = 'treeitem';

  constructor(protected _elementRef: ElementRef<HTMLElement>,
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
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode}
  ]
})
export class MatNestedTreeNode<T> extends CdkNestedTreeNode<T> implements AfterContentInit,
  OnDestroy {
  @Input('matNestedTreeNode') node: T;

  /** Whether the node is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  /** Tabindex for the node. */
  @Input()
  get tabIndex(): number { return this.disabled ? -1 : this._tabIndex; }
  set tabIndex(value: number) {
    // If the specified tabIndex value is null or undefined, fall back to the default value.
    this._tabIndex = value != null ? value : 0;
  }
  private _tabIndex: number;

  constructor(protected _elementRef: ElementRef<HTMLElement>,
              protected _tree: CdkTree<T>,
              protected _differs: IterableDiffers,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree, _differs);
    this.tabIndex = Number(tabIndex) || 0;
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  // TODO(tinayuangao): Remove when the angular issue #23091 is fixed
  ngAfterContentInit() {
    super.ngAfterContentInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
