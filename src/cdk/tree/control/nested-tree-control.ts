/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable} from 'rxjs/Observable';
import {take} from 'rxjs/operators/take';
import {BaseTreeControl} from './base-tree-control';

/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl<T> extends BaseTreeControl<T> {

  /** Construct with nested tree function getChildren. */
  constructor(public getChildren: (dataNode: T) => Observable<T[]>) {
    super();
  }

  /**
   * Expands all dataNodes in the tree.
   *
   * To make this working, the `dataNodes` variable of the TreeControl must be set to all root level
   * data nodes of the tree.
   */
  expandAll(): void {
    this.expansionModel.clear();
    let toBeExpanded = <any>[];
    this.dataNodes.forEach(dataNode => toBeExpanded.push(...this.getDescendants(dataNode)));
    this.expansionModel.select(...toBeExpanded);
  }

  /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
  getDescendants(dataNode: T): T[] {
    const descendants = [];
    this._getDescendants(descendants, dataNode);
    return descendants;
  }

  /** A helper function to get descendants recursively. */
  protected _getDescendants(descendants: T[], dataNode: T): void {
    descendants.push(dataNode);
    this.getChildren(dataNode).pipe(take(1)).subscribe(children => {
      if (children && children.length > 0) {
        children.forEach((child: T) => this._getDescendants(descendants, child));
      }
    });
  }
}
