/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition} from '../../../../protocol';

import {ComponentTreeNode} from '../interfaces';

import {IdentityTracker, IndexedNode} from './identity-tracker';
import {Profiler, selectProfilerStrategy} from './profiler';

/**
 *  Class to hook into directive forest.
 *
 *  Exposes latest directive forest state.
 *
 *  Delegates profiling to a Profiler instance.
 *  Delegates forest indexing to IdentityTracker Singleton
 */
export class DirectiveForestHooks {
  private _tracker = IdentityTracker.getInstance();
  private _forest: ComponentTreeNode[] = [];
  private _indexedForest: IndexedNode[] = [];

  profiler: Profiler = selectProfilerStrategy();

  getDirectivePosition(dir: any): ElementPosition | undefined {
    const result = this._tracker.getDirectivePosition(dir);
    if (result === undefined) {
      console.warn('Unable to find position of', dir);
    }
    return result;
  }

  getDirectiveId(dir: any): number | undefined {
    const result = this._tracker.getDirectiveId(dir);
    if (result === undefined) {
      console.warn('Unable to find ID of', result);
    }
    return result;
  }

  getIndexedDirectiveForest(): IndexedNode[] {
    return this._indexedForest;
  }

  getDirectiveForest(): ComponentTreeNode[] {
    return this._forest;
  }

  initialize(): void {
    this.indexForest();
  }

  indexForest(): void {
    const {newNodes, removedNodes, indexedForest, directiveForest} = this._tracker.index();
    this._indexedForest = indexedForest;
    this._forest = directiveForest;
    this.profiler.onIndexForest(newNodes, removedNodes);
  }
}
