/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath} from '../file_system';

/**
 * Generates a single shim file for the entire program.
 */
export interface TopLevelShimGenerator {
  /**
   * Whether this shim should be emitted during TypeScript emit.
   */
  readonly shouldEmit: boolean;

  /**
   * Create a `ts.SourceFile` representing the shim, with the correct filename.
   */
  makeTopLevelShim(): ts.SourceFile;
}

/**
 * Generates a shim file for each original `ts.SourceFile` in the user's program, with a file
 * extension prefix.
 */
export interface PerFileShimGenerator {
  /**
   * The extension prefix which will be used for the shim.
   *
   * Knowing this allows the `ts.CompilerHost` implementation which is consuming this shim generator
   * to predict the shim filename, which is useful when a previous `ts.Program` already includes a
   * generated version of the shim.
   */
  readonly extensionPrefix: string;

  /**
   * Whether shims produced by this generator should be emitted during TypeScript emit.
   */
  readonly shouldEmit: boolean;

  /**
   * Generate the shim for a given original `ts.SourceFile`, with the given filename.
   */
  generateShimForFile(
      sf: ts.SourceFile, genFilePath: AbsoluteFsPath,
      priorShimSf: ts.SourceFile|null): ts.SourceFile;
}

/**
 * Maintains a mapping of which symbols in a .ngfactory file have been used.
 *
 * .ngfactory files are generated with one symbol per defined class in the source file, regardless
 * of whether the classes in the source files are NgModules (because that isn't known at the time
 * the factory files are generated). A `FactoryTracker` supports removing factory symbols which
 * didn't end up being NgModules, by tracking the ones which are.
 */
export interface FactoryTracker {
  readonly sourceInfo: Map<string, FactoryInfo>;

  track(sf: ts.SourceFile, moduleInfo: ModuleInfo): void;
}

export interface FactoryInfo {
  sourceFilePath: string;
  moduleSymbols: Map<string, ModuleInfo>;
}

export interface ModuleInfo {
  name: string;
  hasId: boolean;
}
