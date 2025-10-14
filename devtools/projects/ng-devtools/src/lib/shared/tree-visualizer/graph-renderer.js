/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class GraphRenderer {
  constructor() {
    this.nodeClickListeners = [];
    this.nodeMouseoverListeners = [];
    this.nodeMouseoutListeners = [];
  }
  cleanup() {
    this.nodeClickListeners = [];
    this.nodeMouseoverListeners = [];
    this.nodeMouseoutListeners = [];
  }
  dispose() {
    this.cleanup();
  }
  onNodeClick(cb) {
    this.nodeClickListeners.push(cb);
  }
  onNodeMouseover(cb) {
    this.nodeMouseoverListeners.push(cb);
  }
  onNodeMouseout(cb) {
    this.nodeMouseoutListeners.push(cb);
  }
}
//# sourceMappingURL=graph-renderer.js.map
