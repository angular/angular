/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DefinitionParams, Definition, LocationLink} from 'vscode-languageserver';
import {HandlerContext, getDocumentContext} from './utils.js';

export async function onDefinition(params: DefinitionParams, context: HandlerContext) {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  const result = await context.languageService.getDefinition(
    filePath,
    offset,
    params.position,
    fileContent,
  );

  return result as Definition | LocationLink[] | null;
}
