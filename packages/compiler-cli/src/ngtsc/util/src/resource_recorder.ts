
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

/**
 * Implement this interface to record what resources a source file depends upon.
 */
export interface ResourceDependencyRecorder {
  recordResourceDependency(file: ts.SourceFile, resourcePath: string): void;
}

export class NoopResourceDependencyRecorder implements ResourceDependencyRecorder {
  recordResourceDependency(): void {}
}
