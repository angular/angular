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

  // Subtract two characters because the string literal quotes are only needed for parsing
  // and are not part of the actual source file.
  sourceFile.end = sourceFile.end - 2;

  // Note: This does not affect the way TSLint applies replacements for external resource files.
  // At the time of writing, TSLint loads files manually if the actual rule source file is not
  // equal to the source file of the replacement. This means that the replacements need proper
  // offsets without the string literal quote symbols.
  sourceFile.getFullText = function() {
    return sourceFile.text.substring(1, sourceFile.text.length - 1);
  };

  sourceFile.getText = sourceFile.getFullText;

  return sourceFile;
}
