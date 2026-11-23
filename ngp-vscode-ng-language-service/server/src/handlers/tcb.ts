/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fileURLToPath} from 'node:url';
import {HandlerContext} from './utils.js';

export async function onGetTcb(params: any, context: HandlerContext) {
  if (!params.textDocument?.uri?.startsWith('file:')) {
    return null;
  }

  const filePath = fileURLToPath(params.textDocument.uri);
  const result = await context.languageService.getTcb(filePath, params.position);
  if (!result) {
    return null;
  }

  return {
    uri: params.textDocument.uri,
    content: result.code,
    selections: result.selections,
  };
}
