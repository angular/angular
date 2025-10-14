/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {IdentityTracker} from './identity-tracker';
import {selectProfilerStrategy} from './profiler';
/**
 *  Class to hook into directive forest.
 *
 *  Exposes latest directive forest state.
 *
 *  Delegates profiling to a Profiler instance.
 *  Delegates forest indexing to IdentityTracker Singleton
 */
export class DirectiveForestHooks {
  constructor() {
    this._tracker = IdentityTracker.getInstance();
    this._forest = [];
    this._indexedForest = [];
    this.profiler = selectProfilerStrategy();
  }
  getDirectivePosition(dir) {
    const result = this._tracker.getDirectivePosition(dir);
    if (result === undefined) {
      console.warn('Unable to find position of', dir);
    }
    return result;
  }
  getDirectiveId(dir) {
    const result = this._tracker.getDirectiveId(dir);
    if (result === undefined) {
      console.warn('Unable to find ID of', result);
    }
    return result;
  }
  getIndexedDirectiveForest() {
    return this._indexedForest;
  }
  getDirectiveForest() {
    return this._forest;
  }
  initialize() {
    this.indexForest();
  }
  indexForest() {
    const {newNodes, removedNodes, indexedForest, directiveForest} = this._tracker.index();
    this._indexedForest = indexedForest;
    this._forest = directiveForest;
    this.profiler.onIndexForest(newNodes, removedNodes);
  }
}
//# sourceMappingURL=hooks.js.map
