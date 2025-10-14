/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {absoluteFromSourceFile} from '../../file_system';
/**
 * An implementation of the `DependencyTracker` dependency graph API.
 *
 * The `FileDependencyGraph`'s primary job is to determine whether a given file has "logically"
 * changed, given the set of physical changes (direct changes to files on disk).
 *
 * A file is logically changed if at least one of three conditions is met:
 *
 * 1. The file itself has physically changed.
 * 2. One of its dependencies has physically changed.
 * 3. One of its resource dependencies has physically changed.
 */
export class FileDependencyGraph {
  nodes = new Map();
  addDependency(from, on) {
    this.nodeFor(from).dependsOn.add(absoluteFromSourceFile(on));
  }
  addResourceDependency(from, resource) {
    this.nodeFor(from).usesResources.add(resource);
  }
  recordDependencyAnalysisFailure(file) {
    this.nodeFor(file).failedAnalysis = true;
  }
  getResourceDependencies(from) {
    const node = this.nodes.get(from);
    return node ? [...node.usesResources] : [];
  }
  /**
   * Update the current dependency graph from a previous one, incorporating a set of physical
   * changes.
   *
   * This method performs two tasks:
   *
   * 1. For files which have not logically changed, their dependencies from `previous` are added to
   *    `this` graph.
   * 2. For files which have logically changed, they're added to a set of logically changed files
   *    which is eventually returned.
   *
   * In essence, for build `n`, this method performs:
   *
   * G(n) + L(n) = G(n - 1) + P(n)
   *
   * where:
   *
   * G(n) = the dependency graph of build `n`
   * L(n) = the logically changed files from build n - 1 to build n.
   * P(n) = the physically changed files from build n - 1 to build n.
   */
  updateWithPhysicalChanges(previous, changedTsPaths, deletedTsPaths, changedResources) {
    const logicallyChanged = new Set();
    for (const sf of previous.nodes.keys()) {
      const sfPath = absoluteFromSourceFile(sf);
      const node = previous.nodeFor(sf);
      if (isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources)) {
        logicallyChanged.add(sfPath);
      } else if (!deletedTsPaths.has(sfPath)) {
        this.nodes.set(sf, {
          dependsOn: new Set(node.dependsOn),
          usesResources: new Set(node.usesResources),
          failedAnalysis: false,
        });
      }
    }
    return logicallyChanged;
  }
  nodeFor(sf) {
    if (!this.nodes.has(sf)) {
      this.nodes.set(sf, {
        dependsOn: new Set(),
        usesResources: new Set(),
        failedAnalysis: false,
      });
    }
    return this.nodes.get(sf);
  }
}
/**
 * Determine whether `sf` has logically changed, given its dependencies and the set of physically
 * changed files and resources.
 */
function isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources) {
  // A file is assumed to have logically changed if its dependencies could not be determined
  // accurately.
  if (node.failedAnalysis) {
    return true;
  }
  const sfPath = absoluteFromSourceFile(sf);
  // A file is logically changed if it has physically changed itself (including being deleted).
  if (changedTsPaths.has(sfPath) || deletedTsPaths.has(sfPath)) {
    return true;
  }
  // A file is logically changed if one of its dependencies has physically changed.
  for (const dep of node.dependsOn) {
    if (changedTsPaths.has(dep) || deletedTsPaths.has(dep)) {
      return true;
    }
  }
  // A file is logically changed if one of its resources has physically changed.
  for (const dep of node.usesResources) {
    if (changedResources.has(dep)) {
      return true;
    }
  }
  return false;
}
//# sourceMappingURL=dependency_tracking.js.map
