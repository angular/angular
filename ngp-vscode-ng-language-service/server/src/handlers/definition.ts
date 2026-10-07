import {DefinitionParams, Definition, LocationLink} from 'vscode-languageserver';
import {HandlerContext, getDocumentContext} from './utils.js';

export {HandlerContext};

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
