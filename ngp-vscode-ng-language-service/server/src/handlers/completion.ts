import {CompletionParams, CompletionList, CompletionItem} from 'vscode-languageserver';
import {HandlerContext, getDocumentContext} from './utils.js';

export async function onCompletion(
  params: CompletionParams,
  context: HandlerContext,
): Promise<CompletionList | CompletionItem[] | null> {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  return await context.languageService.getCompletionsAtPosition(
    filePath,
    offset,
    params.position,
    fileContent,
  );
}

export async function onCompletionResolve(
  item: CompletionItem,
  context: HandlerContext,
): Promise<CompletionItem> {
  const data = item.data as
    {filePath?: string; position?: {line: number; character: number}; offset?: number} | undefined;
  if (data?.filePath && data?.position) {
    let fileContent: string;
    try {
      fileContent = context.languageService.hybridCompiler.getFileContent(data.filePath);
    } catch {
      return item;
    }
    const offset = data.offset ?? 0;
    const resolved = await context.languageService.getCompletionEntryDetails(
      data.filePath,
      offset,
      data.position,
      fileContent,
      item,
    );
    if (resolved) {
      return resolved;
    }
  }
  return item;
}
