/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Observable} from 'rxjs';
import {take, filter} from 'rxjs/operators';
import {BaseTreeControl} from './base-tree-control';

/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl<T> extends BaseTreeControl<T> {

  /** Construct with nested tree function getChildren. */
  constructor(public getChildren: (dataNode: T) => (Observable<T[]> | T[] | undefined | null)) {
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
    const allNodes = this.dataNodes.reduce((accumulator: T[], dataNode) =>
        [...accumulator, ...this.getDescendants(dataNode), dataNode], []);
    this.expansionModel.select(...allNodes);
  }

  /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
  getDescendants(dataNode: T): T[] {
    const descendants: T[] = [];

    this._getDescendants(descendants, dataNode);
    // Remove the node itself
    return descendants.splice(1);
  }

  /** A helper function to get descendants recursively. */
  protected _getDescendants(descendants: T[], dataNode: T): void {
    descendants.push(dataNode);
    const childrenNodes = this.getChildren(dataNode);
    if (Array.isArray(childrenNodes)) {
      childrenNodes.forEach((child: T) => this._getDescendants(descendants, child));
    } else if (childrenNodes instanceof Observable) {
      // TypeScript as of version 3.5 doesn't seem to treat `Boolean` like a function that
      // returns a `boolean` specifically in the context of `filter`, so we manually clarify that.
      childrenNodes.pipe(take(1), filter(Boolean as () => boolean))
          .subscribe(children => {
            for (const child of children) {
              this._getDescendants(descendants, child);
            }
          });
    }
  }
}
