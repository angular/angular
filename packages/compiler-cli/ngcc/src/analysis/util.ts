/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, isLocalRelativePath, relative} from '../../../src/ngtsc/file_system';
import {DependencyTracker} from '../../../src/ngtsc/incremental/api';

export function isWithinPackage(packagePath: AbsoluteFsPath, filePath: AbsoluteFsPath): boolean {
  const relativePath = relative(packagePath, filePath);
  return isLocalRelativePath(relativePath) && !relativePath.startsWith('node_modules/');
}

class NoopDependencyTracker implements DependencyTracker {
  addDependency(): void {}
  addResourceDependency(): void {}
  recordDependencyAnalysisFailure(): void {}
}

export const NOOP_DEPENDENCY_TRACKER: DependencyTracker = new NoopDependencyTracker();
