/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementPosition} from '../../../../protocol';
import {ComponentTreeNode, DirectiveInstance} from '../shared/interfaces';
import {getProfiler} from '../profiling/profiler';
import {IdentityTracker, IndexedNode, IndexingOutput} from './identity-tracker/identity-tracker';

// Global reference.
let directiveForestManager: DirectiveForestManager;

/**
 * Exposes latest directive forest state.
 * Delegates forest indexing to IdentityTracker Singleton.
 */
export class DirectiveForestManager {
  private _tracker = IdentityTracker.getInstance();
  private _forest: ComponentTreeNode[] = [];
  private _indexedForest: IndexedNode[] = [];
  private _indexForestCbs: ((output: IndexingOutput) => void)[] = [];

  getDirectivePosition(dir: DirectiveInstance): ElementPosition | undefined {
    const result = this._tracker.getDirectivePosition(dir);
    if (result === undefined) {
      console.warn('Unable to find position of', dir);
    }
    return result;
  }

  getDirectiveId(dir: DirectiveInstance): number | undefined {
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
    const output = this._tracker.index();
    this._indexedForest = output.indexedForest;
    this._forest = output.directiveForest;

    for (const cb of this._indexForestCbs) {
      cb(output);
    }
  }

  /**
   * Listen to forest indexing event.
   *
   * @param cb
   * @returns An unlisten function.
   */
  onIndexForest(cb: (output: IndexingOutput) => void) {
    this._indexForestCbs.push(cb);

    return () => {
      const idx = this._indexForestCbs.indexOf(cb);
      if (idx > -1) {
        this._indexForestCbs.splice(idx, 1);
      }
    };
  }
}

/**
 * Get the directive forest manager.
 * Initializes the manager if it wasn't requested before.
 */
export function getDirectiveForestManager(): DirectiveForestManager {
  if (directiveForestManager) {
    return directiveForestManager;
  } else {
    directiveForestManager = new DirectiveForestManager();
  }

  directiveForestManager.onIndexForest(({newNodes, removedNodes}) => {
    getProfiler().onIndexForest(newNodes, removedNodes);
  });
  directiveForestManager.initialize();

  return directiveForestManager;
}
