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
