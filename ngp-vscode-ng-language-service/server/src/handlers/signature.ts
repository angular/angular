/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SignatureHelpParams, SignatureHelp} from 'vscode-languageserver';
import {HandlerContext, getDocumentContext} from './utils.js';

export async function onSignatureHelp(
  params: SignatureHelpParams,
  context: HandlerContext,
): Promise<SignatureHelp | null> {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  return await context.languageService.getSignatureHelp(
    filePath,
    offset,
    params.position,
    fileContent,
    params.context,
  );
}
