/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

/**
 * Creates a fake TypeScript source file that can contain content of templates or stylesheets.
 * The fake TypeScript source file then can be passed to TSLint in combination with a rule failure.
 */
export function createHtmlSourceFile(filePath: string, content: string): ts.SourceFile {
  const sourceFile = ts.createSourceFile(filePath, `\`${content}\``, ts.ScriptTarget.ES5);

  // Subtract two characters because the string literal quotes are only needed for parsing
  // and are not part of the actual source file.
  (sourceFile.end as number) = sourceFile.end - 2;

  // Note: This does not affect the way TSLint applies replacements for external resource files.
  // At the time of writing, TSLint loads files manually if the actual rule source file is not
  // equal to the source file of the replacement. This means that the replacements need proper
  // offsets without the string literal quote symbols.
  sourceFile.getFullText = function() {
    return sourceFile.text.substring(1, sourceFile.text.length - 1);
  };

  sourceFile.getText = sourceFile.getFullText;

  // Update the "text" property to be set to the template content without quotes. This is
  // necessary so that the TypeScript line starts map is properly computed.
  sourceFile.text = sourceFile.getFullText();

  return sourceFile;
}
