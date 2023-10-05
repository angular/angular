/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {literal, R3ClassDebugInfo, WrappedNodeExpr} from '@angular/compiler';
import * as path from 'path';

import {DeclarationNode, ReflectionHost} from '../../../reflection';

export function extractClassDebugInfo(
    clazz: DeclarationNode, reflection: ReflectionHost, rootDirs: ReadonlyArray<string>,
    forbidOrphanRendering: boolean): R3ClassDebugInfo|null {
  if (!reflection.isClass(clazz)) {
    return null;
  }

  const srcFile = clazz.getSourceFile();
  const srcFileMaybeRelativePath = computeRelativePathIfPossible(srcFile.fileName, rootDirs);

  return {
    type: new WrappedNodeExpr(clazz.name),
    className: literal(clazz.name.getText()),
    filePath: srcFileMaybeRelativePath ? literal(srcFileMaybeRelativePath) : null,
    lineNumber: literal(srcFile.getLineAndCharacterOfPosition(clazz.name.pos).line + 1),
    forbidOrphanRendering,
  };
}

/**
 * Computes a source file path relative to the project root folder if possible, otherwise returns
 * null.
 */
function computeRelativePathIfPossible(filePath: string, rootDirs: ReadonlyArray<string>): string|
    null {
  for (const rootDir of rootDirs) {
    const rel = path.relative(rootDir, filePath);
    if (!rel.startsWith('..')) {
      return rel;
    }
  }

  return null;
}
