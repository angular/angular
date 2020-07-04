/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {dirname, join, resolve} from 'path';
import * as ts from 'typescript';

import {getFileStatus} from './file_system';
import {getModuleReferences} from './parser';

export type ModuleResolver = (specifier: string) => string|null;

/**
 * Reference chains describe a sequence of source files which are connected through imports.
 * e.g. `file_a.ts` imports `file_b.ts`, whereas `file_b.ts` imports `file_c.ts`. The reference
 * chain data structure could be used to represent this import sequence.
 */
export type ReferenceChain<T = ts.SourceFile> = T[];

/** Default extensions that the analyzer uses for resolving imports. */
const DEFAULT_EXTENSIONS = ['ts', 'js', 'd.ts'];

/**
 * Analyzer that can be used to detect import cycles within source files. It supports
 * custom module resolution, source file caching and collects unresolved specifiers.
 */
export class Analyzer {
  private _sourceFileCache = new Map<string, ts.SourceFile>();

  unresolvedModules = new Set<string>();
  unresolvedFiles = new Map<string, string[]>();

  constructor(
      public resolveModuleFn?: ModuleResolver, public extensions: string[] = DEFAULT_EXTENSIONS) {}

  /** Finds all cycles in the specified source file. */
  findCycles(sf: ts.SourceFile, visited = new WeakSet<ts.SourceFile>(), path: ReferenceChain = []):
      ReferenceChain[] {
    const previousIndex = path.indexOf(sf);
    // If the given node is already part of the current path, then a cycle has
    // been found. Add the reference chain which represents the cycle to the results.
    if (previousIndex !== -1) {
      return [path.slice(previousIndex)];
    }
    // If the node has already been visited, then it's not necessary to go check its edges
    // again. Cycles would have been already detected and collected in the first check.
    if (visited.has(sf)) {
      return [];
    }
    path.push(sf);
    visited.add(sf);
    // Go through all edges, which are determined through import/exports, and collect cycles.
    const result: ReferenceChain[] = [];
    for (const ref of getModuleReferences(sf)) {
      const targetFile = this._resolveImport(ref, sf.fileName);
      if (targetFile !== null) {
        result.push(...this.findCycles(this.getSourceFile(targetFile), visited, path.slice()));
      }
    }
    return result;
  }

  /** Gets the TypeScript source file of the specified path. */
  getSourceFile(filePath: string): ts.SourceFile {
    const resolvedPath = resolve(filePath);
    if (this._sourceFileCache.has(resolvedPath)) {
      return this._sourceFileCache.get(resolvedPath)!;
    }
    const fileContent = readFileSync(resolvedPath, 'utf8');
    const sourceFile =
        ts.createSourceFile(resolvedPath, fileContent, ts.ScriptTarget.Latest, false);
    this._sourceFileCache.set(resolvedPath, sourceFile);
    return sourceFile;
  }

  /** Resolves the given import specifier with respect to the specified containing file path. */
  private _resolveImport(specifier: string, containingFilePath: string): string|null {
    if (specifier.charAt(0) === '.') {
      const resolvedPath = this._resolveFileSpecifier(specifier, containingFilePath);
      if (resolvedPath === null) {
        this._trackUnresolvedFileImport(specifier, containingFilePath);
      }
      return resolvedPath;
    }
    if (this.resolveModuleFn) {
      const targetFile = this.resolveModuleFn(specifier);
      if (targetFile !== null) {
        const resolvedPath = this._resolveFileSpecifier(targetFile);
        if (resolvedPath !== null) {
          return resolvedPath;
        }
      }
    }
    this.unresolvedModules.add(specifier);
    return null;
  }

  /** Tracks the given file import as unresolved. */
  private _trackUnresolvedFileImport(specifier: string, originFilePath: string) {
    if (!this.unresolvedFiles.has(originFilePath)) {
      this.unresolvedFiles.set(originFilePath, [specifier]);
    }
    this.unresolvedFiles.get(originFilePath)!.push(specifier);
  }

  /** Resolves the given import specifier to the corresponding source file. */
  private _resolveFileSpecifier(specifier: string, containingFilePath?: string): string|null {
    const importFullPath =
        containingFilePath !== undefined ? join(dirname(containingFilePath), specifier) : specifier;
    const stat = getFileStatus(importFullPath);
    if (stat && stat.isFile()) {
      return importFullPath;
    }
    for (const extension of this.extensions) {
      const pathWithExtension = `${importFullPath}.${extension}`;
      const stat = getFileStatus(pathWithExtension);
      if (stat && stat.isFile()) {
        return pathWithExtension;
      }
    }
    // Directories should be considered last. TypeScript first looks for source files, then
    // falls back to directories if no file with appropriate extension could be found.
    if (stat && stat.isDirectory()) {
      return this._resolveFileSpecifier(join(importFullPath, 'index'));
    }
    return null;
  }
}
