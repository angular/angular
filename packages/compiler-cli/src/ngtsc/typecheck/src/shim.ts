/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath, absoluteFromSourceFile} from '../../file_system';
import {ShimGenerator} from '../../shims/api';
import {getSourceFileOrNull, isNonDeclarationTsPath} from '../../util/src/typescript';

export interface TypeCheckShimHost {
  getShimPathFor(file: AbsoluteFsPath): AbsoluteFsPath|null;

  getShimPaths(): ReadonlyArray<AbsoluteFsPath>;

  isShim(sf: ts.SourceFile): boolean;
}

export class TypeCheckShimGenerator implements ShimGenerator, TypeCheckShimHost {
  private typeCheckPaths: Set<AbsoluteFsPath>;

  private constructor(
      private typeCheckPathMap: Map<AbsoluteFsPath, AbsoluteFsPath>,
      private oldProgram: ts.Program|null) {
    this.typeCheckPaths = new Set(typeCheckPathMap.values());
  }

  recognize(fileName: AbsoluteFsPath): boolean { return this.typeCheckPaths.has(fileName); }

  generate(genFileName: AbsoluteFsPath): ts.SourceFile|null {
    let previousSf: ts.SourceFile|null = null;
    if (this.oldProgram !== null) {
      previousSf = getSourceFileOrNull(this.oldProgram, genFileName);
    }

    if (previousSf !== null) {
      return previousSf;
    } else {
      return ts.createSourceFile(
          genFileName, 'export const USED_FOR_NG_TYPE_CHECKING = true;', ts.ScriptTarget.Latest,
          true, ts.ScriptKind.TS);
    }
  }

  getShimPathFor(file: AbsoluteFsPath): AbsoluteFsPath|null {
    return this.typeCheckPathMap.has(file) ? this.typeCheckPathMap.get(file) ! : null;
  }

  getShimPaths(): ReadonlyArray<AbsoluteFsPath> { return Array.from(this.typeCheckPaths); }

  isShim(sf: ts.SourceFile) { return this.typeCheckPaths.has(absoluteFromSourceFile(sf)); }

  static forRootFiles(files: ReadonlyArray<AbsoluteFsPath>, oldProgram: ts.Program|null):
      TypeCheckShimGenerator {
    const typeCheckPaths = new Map<AbsoluteFsPath, AbsoluteFsPath>();
    for (const file of files) {
      if (!isNonDeclarationTsPath(file)) {
        continue;
      }

      typeCheckPaths.set(file, file.replace(/\.ts$/, '.__ng_typecheck__.ts') as AbsoluteFsPath);
    }

    return new TypeCheckShimGenerator(typeCheckPaths, oldProgram);
  }
}
