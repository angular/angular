/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

export function makeCompilerHostFromProject(project: ts.server.Project): ts.CompilerHost {
  const compilerHost: ts.CompilerHost = {
    fileExists(fileName: string): boolean {
      return project.fileExists(fileName);
    },
    readFile(fileName: string): string |
        undefined {
          return project.readFile(fileName);
        },
    directoryExists(directoryName: string): boolean {
      return project.directoryExists(directoryName);
    },
    getCurrentDirectory(): string {
      return project.getCurrentDirectory();
    },
    getDirectories(path: string): string[] {
      return project.getDirectories(path);
    },
    getSourceFile(
        fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void,
        shouldCreateNewSourceFile?: boolean): ts.SourceFile |
        undefined {
          const path = project.projectService.toPath(fileName);
          return project.getSourceFile(path);
        },
    getSourceFileByPath(
        fileName: string, path: ts.Path, languageVersion: ts.ScriptTarget,
        onError?: (message: string) => void, shouldCreateNewSourceFile?: boolean): ts.SourceFile |
        undefined {
          return project.getSourceFile(path);
        },
    getCancellationToken(): ts.CancellationToken {
      return {
        isCancellationRequested() {
          return project.getCancellationToken().isCancellationRequested();
        },
        throwIfCancellationRequested() {
          if (this.isCancellationRequested()) {
            throw new ts.OperationCanceledException();
          }
        },
      };
    },
    getDefaultLibFileName(options: ts.CompilerOptions): string {
      return project.getDefaultLibFileName();
    },
    writeFile(
        fileName: string, data: string, writeByteOrderMark: boolean,
        onError?: (message: string) => void, sourceFiles?: readonly ts.SourceFile[]) {
      return project.writeFile(fileName, data);
    },
    getCanonicalFileName(fileName: string): string {
      return project.projectService.toCanonicalFileName(fileName);
    },
    useCaseSensitiveFileNames(): boolean {
      return project.useCaseSensitiveFileNames();
    },
    getNewLine(): string {
      return project.getNewLine();
    },
    readDirectory(
        rootDir: string, extensions: readonly string[], excludes: readonly string[]|undefined,
        includes: readonly string[], depth?: number): string[] {
      return project.readDirectory(rootDir, extensions, excludes, includes, depth);
    },
    resolveModuleNames(
        moduleNames: string[], containingFile: string, reusedNames: string[]|undefined,
        redirectedReference: ts.ResolvedProjectReference|undefined, options: ts.CompilerOptions):
        (ts.ResolvedModule | undefined)[] {
          return project.resolveModuleNames(
              moduleNames, containingFile, reusedNames, redirectedReference);
        },
    resolveTypeReferenceDirectives(
        typeReferenceDirectiveNames: string[], containingFile: string,
        redirectedReference: ts.ResolvedProjectReference|undefined, options: ts.CompilerOptions):
        (ts.ResolvedTypeReferenceDirective | undefined)[] {
          return project.resolveTypeReferenceDirectives(
              typeReferenceDirectiveNames, containingFile, redirectedReference);
        },
  };

  if (project.trace) {
    compilerHost.trace = function trace(s: string) {
      project.trace!(s);
    };
  }
  if (project.realpath) {
    compilerHost.realpath = function realpath(path: string): string {
      return project.realpath!(path);
    };
  }
  return compilerHost;
}
