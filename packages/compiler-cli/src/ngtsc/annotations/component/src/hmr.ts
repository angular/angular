/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {R3HmrInitializerMetadata, WrappedNodeExpr} from '@angular/compiler';
import {DeclarationNode, ReflectionHost} from '../../../reflection';
import {getProjectRelativePath} from '../../common';
import ts from 'typescript';

/**
 * Extracts the metadata necessary to generate an HMR initializer.
 */
export function extractHmrInitializerMeta(
  clazz: DeclarationNode,
  reflection: ReflectionHost,
  compilerHost: Pick<ts.CompilerHost, 'getCanonicalFileName'>,
  rootDirs: readonly string[],
): R3HmrInitializerMetadata | null {
  if (!reflection.isClass(clazz)) {
    return null;
  }

  const sourceFile = clazz.getSourceFile();
  const filePath =
    getProjectRelativePath(sourceFile, rootDirs, compilerHost) ||
    compilerHost.getCanonicalFileName(sourceFile.fileName);

  const meta: R3HmrInitializerMetadata = {
    type: new WrappedNodeExpr(clazz.name),
    className: clazz.name.text,
    timestamp: Date.now() + '',
    filePath,
  };

  return meta;
}
