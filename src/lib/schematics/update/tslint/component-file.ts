/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export type ExternalResource = ts.SourceFile;

/**
 * Creates a fake TypeScript source file that can contain content of templates or stylesheets.
 * The fake TypeScript source file then can be passed to TSLint in combination with a rule failure.
 */
export function createComponentFile(filePath: string, content: string): ExternalResource {
  const sourceFile = ts.createSourceFile(filePath, `\`${content}\``, ts.ScriptTarget.ES5);
  const _getFullText = sourceFile.getFullText;

  sourceFile.getFullText = function() {
    const text = _getFullText.apply(sourceFile);
    return text.substring(1, text.length - 1);
  }.bind(sourceFile);

  return sourceFile;
}
