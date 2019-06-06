/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom} from '../../file_system';
import {getSourceFileOrNull, resolveModuleName} from '../../util/src/typescript';
import {Reference} from './references';

export interface ReferenceResolver {
  resolve(decl: ts.Declaration, importFromHint: string|null, fromFile: string):
      Reference<ts.Declaration>;
}

/**
 * Used by `RouterEntryPointManager` and `NgModuleRouteAnalyzer` (which is in turn is used by
 * `NgModuleDecoratorHandler`) for resolving the module source-files references in lazy-loaded
 * routes (relative to the source-file containing the `NgModule` that provides the route
 * definitions).
 */
export class ModuleResolver {
  constructor(
      private program: ts.Program, private compilerOptions: ts.CompilerOptions,
      private host: ts.CompilerHost) {}

  resolveModuleName(module: string, containingFile: ts.SourceFile): ts.SourceFile|null {
    const resolved =
        resolveModuleName(module, containingFile.fileName, this.compilerOptions, this.host);
    if (resolved === undefined) {
      return null;
    }
    return getSourceFileOrNull(this.program, absoluteFrom(resolved.resolvedFileName));
  }
}
