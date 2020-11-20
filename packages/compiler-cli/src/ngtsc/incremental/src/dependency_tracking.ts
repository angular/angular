/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {DependencyTracker} from '../api';

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
export class FileDependencyGraph<T extends {fileName: string} = ts.SourceFile> implements
    DependencyTracker<T> {
  private nodes = new Map<T, FileNode>();

  addDependency(from: T, on: T): void {
    this.nodeFor(from).dependsOn.add(on.fileName);
  }

  addResourceDependency(from: T, resource: AbsoluteFsPath): void {
    this.nodeFor(from).usesResources.add(resource);
  }

  recordDependencyAnalysisFailure(file: T): void {
    this.nodeFor(file).failedAnalysis = true;
  }

  getResourceDependencies(from: T): AbsoluteFsPath[] {
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
  updateWithPhysicalChanges(
      previous: FileDependencyGraph<T>, changedTsPaths: Set<string>, deletedTsPaths: Set<string>,
      changedResources: Set<AbsoluteFsPath>): Set<string> {
    const logicallyChanged = new Set<string>();

    for (const sf of previous.nodes.keys()) {
      const node = previous.nodeFor(sf);
      if (isLogicallyChanged(sf, node, changedTsPaths, deletedTsPaths, changedResources)) {
        logicallyChanged.add(sf.fileName);
      } else if (!deletedTsPaths.has(sf.fileName)) {
        this.nodes.set(sf, {
          dependsOn: new Set(node.dependsOn),
          usesResources: new Set(node.usesResources),
          failedAnalysis: false,
        });
      }
    }

    return logicallyChanged;
  }

  private nodeFor(sf: T): FileNode {
    if (!this.nodes.has(sf)) {
      this.nodes.set(sf, {
        dependsOn: new Set<string>(),
        usesResources: new Set<AbsoluteFsPath>(),
        failedAnalysis: false,
      });
    }
    return this.nodes.get(sf)!;
  }
}

/**
 * Determine whether `sf` has logically changed, given its dependencies and the set of physically
 * changed files and resources.
 */
function isLogicallyChanged<T extends {fileName: string}>(
    sf: T, node: FileNode, changedTsPaths: ReadonlySet<string>, deletedTsPaths: ReadonlySet<string>,
    changedResources: ReadonlySet<AbsoluteFsPath>): boolean {
  // A file is assumed to have logically changed if its dependencies could not be determined
  // accurately.
  if (node.failedAnalysis) {
    return true;
  }

  // A file is logically changed if it has physically changed itself (including being deleted).
  if (changedTsPaths.has(sf.fileName) || deletedTsPaths.has(sf.fileName)) {
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

interface FileNode {
  dependsOn: Set<string>;
  usesResources: Set<AbsoluteFsPath>;
  failedAnalysis: boolean;
}
