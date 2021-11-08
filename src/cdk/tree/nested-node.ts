/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  QueryList,
} from '@angular/core';
import {isObservable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodeOutlet} from './outlet';
import {CdkTree, CdkTreeNode} from './tree';
import {getTreeControlFunctionsMissingError} from './tree-errors';

/**
 * Nested node is a child of `<cdk-tree>`. It works with nested tree.
 * By using `cdk-nested-tree-node` component in tree node template, children of the parent node will
 * be added in the `cdkTreeNodeOutlet` in tree node template.
 * The children of node will be automatically added to `cdkTreeNodeOutlet`.
 */
@Directive({
  selector: 'cdk-nested-tree-node',
  exportAs: 'cdkNestedTreeNode',
  inputs: ['role', 'disabled', 'tabIndex'],
  providers: [
    {provide: CdkTreeNode, useExisting: CdkNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: CdkNestedTreeNode},
  ],
  host: {
    'class': 'cdk-nested-tree-node',
  },
})
export class CdkNestedTreeNode<T, K = T>
  extends CdkTreeNode<T, K>
  implements AfterContentInit, OnDestroy, OnInit
{
  /** Differ used to find the changes in the data provided by the data source. */
  private _dataDiffer: IterableDiffer<T>;

  /** The children data dataNodes of current node. They will be placed in `CdkTreeNodeOutlet`. */
  protected _children: T[];

  /** The children node placeholder. */
  @ContentChildren(CdkTreeNodeOutlet, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  nodeOutlet: QueryList<CdkTreeNodeOutlet>;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    tree: CdkTree<T, K>,
    protected _differs: IterableDiffers,
  ) {
    super(elementRef, tree);
  }

  ngAfterContentInit() {
    this._dataDiffer = this._differs.find([]).create(this._tree.trackBy);
    if (!this._tree.treeControl.getChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTreeControlFunctionsMissingError();
    }
    const childrenNodes = this._tree.treeControl.getChildren(this.data);
    if (Array.isArray(childrenNodes)) {
      this.updateChildrenNodes(childrenNodes as T[]);
    } else if (isObservable(childrenNodes)) {
      childrenNodes
        .pipe(takeUntil(this._destroyed))
        .subscribe(result => this.updateChildrenNodes(result));
    }
    this.nodeOutlet.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this.updateChildrenNodes());
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    this._clear();
    super.ngOnDestroy();
  }

  /** Add children dataNodes to the NodeOutlet */
  protected updateChildrenNodes(children?: T[]): void {
    const outlet = this._getNodeOutlet();
    if (children) {
      this._children = children;
    }
    if (outlet && this._children) {
      const viewContainer = outlet.viewContainer;
      this._tree.renderNodeChanges(this._children, this._dataDiffer, viewContainer, this._data);
    } else {
      // Reset the data differ if there's no children nodes displayed
      this._dataDiffer.diff([]);
    }
  }

  /** Clear the children dataNodes. */
  protected _clear(): void {
    const outlet = this._getNodeOutlet();
    if (outlet) {
      outlet.viewContainer.clear();
      this._dataDiffer.diff([]);
    }
  }

  /** Gets the outlet for the current node. */
  private _getNodeOutlet() {
    const outlets = this.nodeOutlet;

    // Note that since we use `descendants: true` on the query, we have to ensure
    // that we don't pick up the outlet of a child node by accident.
    return outlets && outlets.find(outlet => !outlet._node || outlet._node === this);
  }
}
