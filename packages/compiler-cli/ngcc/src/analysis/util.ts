/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath, relative} from '../../../src/ngtsc/file_system';
import {DependencyTracker} from '../../../src/ngtsc/incremental/api';

export function isWithinPackage(packagePath: AbsoluteFsPath, sourceFile: ts.SourceFile): boolean {
  const relativePath = relative(packagePath, absoluteFromSourceFile(sourceFile));
  return !relativePath.startsWith('..') && !relativePath.startsWith('node_modules/');
}

class NoopDependencyTracker implements DependencyTracker {
  addDependency(): void {}
  addResourceDependency(): void {}
  addTransitiveDependency(): void {}
  addTransitiveResources(): void {}
}

export const NOOP_DEPENDENCY_TRACKER: DependencyTracker = new NoopDependencyTracker();
