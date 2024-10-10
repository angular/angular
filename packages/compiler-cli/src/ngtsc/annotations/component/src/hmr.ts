/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {R3HmrInitializerMetadata, WrappedNodeExpr} from '@angular/compiler';
import {DeclarationNode, ReflectionHost} from '../../../reflection';
import {relative} from 'path';

/**
 * Extracts the metadata necessary to generate an HMR initializer.
 */
export function extractHmrInitializerMeta(
  clazz: DeclarationNode,
  reflection: ReflectionHost,
  rootDirs: readonly string[],
): R3HmrInitializerMetadata | null {
  if (!reflection.isClass(clazz)) {
    return null;
  }

  // Attempt to generate a project-relative path before falling back to the full path.
  let filePath = clazz.getSourceFile().fileName;
  for (const rootDir of rootDirs) {
    const relativePath = relative(rootDir, filePath);
    if (!relativePath.startsWith('..')) {
      filePath = relativePath;
      break;
    }
  }

  const meta: R3HmrInitializerMetadata = {
    type: new WrappedNodeExpr(clazz.name),
    className: clazz.name.text,
    timestamp: Date.now() + '',
    filePath,
  };

  return meta;
}
