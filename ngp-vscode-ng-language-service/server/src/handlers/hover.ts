import {HandlerContext, getDocumentContext} from './utils.js';
import {offsetToPosition} from '../../../../packages/compiler-cli/preprocessor/src/tcb_ls_util.js';

export async function onHover(params: any, context: HandlerContext) {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  const result = await context.languageService.getHover(
    filePath,
    offset,
    params.position,
    fileContent,
  );

  if (!result) {
    return null;
  }

  const range = result.span
    ? {
        start: offsetToPosition(fileContent, result.span.start),
        end: offsetToPosition(fileContent, result.span.start + result.span.length),
      }
    : undefined;

  return {
    contents: {
      kind: 'markdown' as const,
      value: result.text,
    },
    range,
  };
}
