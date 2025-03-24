/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {literal, R3ClassDebugInfo, WrappedNodeExpr} from '@angular/compiler';
import ts from 'typescript';

import {DeclarationNode, ReflectionHost} from '../../../reflection';
import {getProjectRelativePath} from '../../../util/src/path';

export function extractClassDebugInfo(
  clazz: DeclarationNode,
  reflection: ReflectionHost,
  compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
  rootDirs: ReadonlyArray<string>,
  forbidOrphanRendering: boolean,
): R3ClassDebugInfo | null {
  if (!reflection.isClass(clazz)) {
    return null;
  }

  const srcFile = clazz.getSourceFile();
  const srcFileMaybeRelativePath = getProjectRelativePath(srcFile.fileName, rootDirs, compilerHost);

  return {
    type: new WrappedNodeExpr(clazz.name),
    className: literal(clazz.name.getText()),
    filePath: srcFileMaybeRelativePath ? literal(srcFileMaybeRelativePath) : null,
    lineNumber: literal(srcFile.getLineAndCharacterOfPosition(clazz.name.pos).line + 1),
    forbidOrphanRendering,
  };
}
