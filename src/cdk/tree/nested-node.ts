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
  OnDestroy,
  QueryList,
} from '@angular/core';
import {takeUntil} from 'rxjs/operators';

import {CdkTree, CdkTreeNode} from './tree';
import {CdkTreeNodeOutlet} from './outlet';
import {getTreeControlFunctionsMissingError} from './tree-errors';

/**
 * Nested node is a child of `<cdk-tree>`. It works with nested tree.
 * By using `cdk-nested-tree-node` component in tree node template, children of the parent node will
 * be added in the `cdkTreeNodeOutlet` in tree node template.
 * For example:
 *   ```html
 *   <cdk-mested-tree-node>
 *     {{node.name}}
 *     <ng-template cdkTreeNodeOutlet></ng-template>
 *   </cdk-tree-node>
 *   ```
 * The children of node will be automatically added to `cdkTreeNodeOutlet`, the result dom will be
 * like this:
 *   ```html
 *   <cdk-nested-tree-node>
 *     {{node.name}}
 *      <cdk-nested-tree-node>{{child1.name}}</cdk-tree-node>
 *      <cdk-nested-tree-node>{{child2.name}}</cdk-tree-node>
 *   </cdk-tree-node>
 *   ```
 */
@Directive({
  selector: 'cdk-nested-tree-node',
  exportAs: 'cdkNestedTreeNode',
  host: {
    '[attr.aria-expanded]': 'isExpanded',
    '[attr.role]': 'role',
    'class': 'cdk-tree-node cdk-nested-tree-node',
  },
  providers: [{provide: CdkTreeNode, useExisting: CdkNestedTreeNode}]
})
export class CdkNestedTreeNode<T> extends CdkTreeNode<T> implements AfterContentInit, OnDestroy {
  /** The children data dataNodes of current node. They will be placed in `CdkTreeNodeOutlet`. */
  protected _children: T[];

  /** The children node placeholder. */
  @ContentChildren(CdkTreeNodeOutlet) nodeOutlet: QueryList<CdkTreeNodeOutlet>;

  constructor(protected _elementRef: ElementRef,
              protected _tree: CdkTree<T>) {
    super(_elementRef, _tree);
  }

  ngAfterContentInit() {
    if (!this._tree.treeControl.getChildren) {
      throw getTreeControlFunctionsMissingError();
    }
    this._tree.treeControl.getChildren(this.data).pipe(takeUntil(this._destroyed))
        .subscribe(result => {
          if (result && result.length) {
            // In case when nodeOutlet is not in the DOM when children changes, save it in the node
            // and add to nodeOutlet when it's available.
            this._children = result as T[];
            this._addChildrenNodes();
          }
        });
    this.nodeOutlet.changes.pipe(takeUntil(this._destroyed))
        .subscribe((_) => this._addChildrenNodes());
  }

  ngOnDestroy() {
    this._clear();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Add children dataNodes to the NodeOutlet */
  protected _addChildrenNodes(): void {
    this._clear();
    if (this.nodeOutlet.length && this._children && this._children.length) {
      this._children.forEach((child, index) => {
        this._tree.insertNode(child, index, this.nodeOutlet.first.viewContainer);
      });
    }
  }

  /** Clear the children dataNodes. */
  protected _clear(): void {
    if (this.nodeOutlet && this.nodeOutlet.first) {
      this.nodeOutlet.first.viewContainer.clear();
    }
  }
}
