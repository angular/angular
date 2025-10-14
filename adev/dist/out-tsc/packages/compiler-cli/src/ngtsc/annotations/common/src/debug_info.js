/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {literal, WrappedNodeExpr} from '@angular/compiler';
import {getProjectRelativePath} from '../../../util/src/path';
export function extractClassDebugInfo(
  clazz,
  reflection,
  compilerHost,
  rootDirs,
  forbidOrphanRendering,
) {
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
//# sourceMappingURL=debug_info.js.map
