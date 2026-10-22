/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ReferenceParams, Location} from 'vscode-languageserver';
import {HandlerContext, getDocumentContext} from './utils.js';

export async function onReferences(
  params: ReferenceParams,
  context: HandlerContext,
): Promise<Location[] | null> {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  return await context.languageService.getReferencesAtPosition(
    filePath,
    offset,
    params.position,
    fileContent,
  );
}
