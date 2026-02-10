/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
import {getCSSLanguageService, getSCSSLanguageService} from 'vscode-css-languageservice';
import * as lsp from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';

import {
  getCSSVirtualContent,
  getSCSSVirtualContent,
  isInlineStyleNode,
  isTemplateStyleNode,
} from '../embedded_support';
import {Session} from '../session';
import {documentationToMarkdown} from '../text_render';
import {
  lspPositionToTsPosition,
  tsFileTextChangesToLspWorkspaceEdit,
  tsTextSpanToLspRange,
} from '../utils';

const scssLS = getSCSSLanguageService();
const cssLS = getCSSLanguageService();
// TODO: Share this or import it if possible, but it's local in session.ts usually.
// For now, duplicating the simple helper or need to find a way to share `defaultPreferences`.

// We need to access private/internal methods of Session if possible, or move them.
// getTokenAtPosition was added to session.ts recently. We should move it to utils or export it.

export function onCompletion(
  session: Session,
  params: lsp.CompletionParams,
): lsp.CompletionItem[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);

  // We need access to session's specific options usually, but we can assume some defaults or read from session if public.
  // Session options provided in constructor are private.
  // We might need to expose them on Session.

  let options: ts.GetCompletionsAtPositionOptions = {};
  const includeCompletionsWithSnippetText =
    session.includeCompletionsWithSnippetText && session.snippetSupport;
  if (
    session.includeAutomaticOptionalChainCompletions ||
    includeCompletionsWithSnippetText ||
    session.includeCompletionsForModuleExports
  ) {
    options = {
      includeAutomaticOptionalChainCompletions: session.includeAutomaticOptionalChainCompletions,
      includeCompletionsWithSnippetText: includeCompletionsWithSnippetText,
      includeCompletionsWithInsertText:
        session.includeAutomaticOptionalChainCompletions || includeCompletionsWithSnippetText,
      includeCompletionsForModuleExports: session.includeCompletionsForModuleExports,
    };
  }

  const completions = languageService.getCompletionsAtPosition(
    scriptInfo.fileName,
    offset,
    options,
  );

  const sf = session.getDefaultProjectForScriptInfo(scriptInfo)?.getSourceFile(scriptInfo.path);
  if (!sf) {
    return null;
  }
  const node = getTokenAtPosition(sf, offset);

  // Check if we are in a template style binding (use CSS LS)
  if (isTemplateStyleNode(node)) {
    const cssCompletions = getTemplateStyleBindingsCompletions(
      session,
      sf,
      scriptInfo,
      params.position,
      completions,
    );
    if (cssCompletions) {
      return cssCompletions;
    }
  }

  if (!completions) {
    if (!isInlineStyleNode(node)) {
      return null;
    }
    const virtualScssDocContents = getSCSSVirtualContent(sf);
    const virtualScssDoc = TextDocument.create(
      params.textDocument.uri.toString(),
      'scss',
      0,
      virtualScssDocContents,
    );
    const stylesheet = scssLS.parseStylesheet(virtualScssDoc);
    const scssCompletions = scssLS.doComplete(virtualScssDoc, params.position, stylesheet);
    return scssCompletions.items;
  }
  return completions.entries.map((e) =>
    tsCompletionEntryToLspCompletionItem(e, params.position, scriptInfo),
  );
}

export function onCompletionResolve(
  session: Session,
  item: lsp.CompletionItem,
): lsp.CompletionItem {
  const data = readNgCompletionData(item);
  if (data === null) {
    return item;
  }

  const {filePath, position} = data;
  const lsInfo = session.getLSAndScriptInfo(filePath);
  if (lsInfo === null) {
    return item;
  }
  const {languageService, scriptInfo} = lsInfo;

  const offset = lspPositionToTsPosition(scriptInfo, position);
  const details = languageService.getCompletionEntryDetails(
    filePath,
    offset,
    item.insertText ?? item.label,
    undefined,
    undefined,
    session.defaultPreferences,
    data.tsData,
  );
  if (details === undefined) {
    return item;
  }

  const {kind, kindModifiers, displayParts, documentation, tags, codeActions} = details;
  const codeActionsDetail = generateCommandAndTextEditsFromCodeActions(
    codeActions ?? [],
    filePath,
    (path: string) => session.projectService.getScriptInfo(path),
  );
  let desc = kindModifiers ? kindModifiers + ' ' : '';
  if (displayParts && displayParts.length > 0) {
    desc += displayParts.map((dp) => dp.text).join('');
  } else {
    desc += kind;
  }
  item.detail = desc;
  item.documentation = {
    kind: lsp.MarkupKind.Markdown,
    value: documentationToMarkdown(
      documentation,
      tags,
      (fileName) => session.getLSAndScriptInfo(fileName)?.scriptInfo,
    ).join('\n'),
  };
  item.additionalTextEdits = codeActionsDetail.additionalTextEdits;
  item.command = codeActionsDetail.command;
  return item;
}

/**
 * Completions for inline style binding eg: [style]={ backgr...}
 */
function getTemplateStyleBindingsCompletions(
  session: Session,
  sf: ts.SourceFile,
  scriptInfo: ts.server.ScriptInfo,
  position: lsp.Position,
  completions: ts.WithMetadata<ts.CompletionInfo> | undefined,
): lsp.CompletionItem[] | null {
  const virtualCssDocContents = getCSSVirtualContent(sf);
  // If content is found, we might be in a binding
  if (!virtualCssDocContents.trim()) {
    return null;
  }

  const virtualCssDoc = TextDocument.create(
    session.getLSAndScriptInfo(sf.fileName)?.scriptInfo.fileName ?? 'temp',
    'css',
    0,
    virtualCssDocContents,
  );
  const stylesheet = cssLS.parseStylesheet(virtualCssDoc);
  const cssCompletions = cssLS.doComplete(virtualCssDoc, position, stylesheet);

  if (cssCompletions.items.length === 0) {
    return null;
  }

  const processedCssItems = cssCompletions.items.map((item) => {
    try {
      let text: string;
      if (item.textEdit) {
        text = item.textEdit.newText;
      } else {
        text = item.insertText ?? item.label;
      }

      if (text.endsWith(';')) {
        text = text.slice(0, -1);
      }

      let isQuoted = false;
      // Determine the start position of the replacement to check for preceding quotes
      let rangeStart: lsp.Position | undefined;

      if (item.textEdit) {
        if ('range' in item.textEdit) {
          rangeStart = item.textEdit.range.start;
        } else if ('replace' in item.textEdit) {
          rangeStart = item.textEdit.replace.start;
        }
      }

      if (rangeStart) {
        const start = lspPositionToTsPosition(scriptInfo, rangeStart);
        if (start > 0 && start <= sf.text.length) {
          const charBefore = sf.text[start - 1];
          if (charBefore === "'" || charBefore === '"') {
            isQuoted = true;
          }
        }
      }

      // Check if text itself is already quoted
      if (text.startsWith("'") || text.startsWith('"')) {
        isQuoted = true;
      }

      if (!isQuoted) {
        const isProperty = item.kind === lsp.CompletionItemKind.Property;
        if (isProperty) {
          // For properties (keys), quote only if they have a dash (e.g. 'background-color')
          if (text.includes('-')) {
            text = `'${text}'`;
          }
        } else {
          // For values, always quote them (e.g. 'red', 'block'), unless they are variables or something else special.
          // The requirement is "if they are not props from the component".
          // Since these come from CSS LS, they are never component/TS props.
          text = `'${text}'`;
        }
      }

      if (item.textEdit) {
        item.textEdit.newText = text;
      } else {
        item.insertText = text;
      }
      return item;
    } catch (e) {
      return item;
    }
  });

  // Heuristic: If we have CSS Property suggestions, we are likely in a Key position.
  // In Key position, Angular component properties are usually not valid keys.
  // If we have proper CSS completions, prioritize them.
  const isKeyContext = processedCssItems.some((i) => i.kind === lsp.CompletionItemKind.Property);

  if (isKeyContext) {
    return processedCssItems;
  }

  // Value context: Mix CSS values with Angular class members
  const ngItems = completions
    ? completions.entries.map((e) => tsCompletionEntryToLspCompletionItem(e, position, scriptInfo))
    : [];

  return [...processedCssItems, ...ngItems];
}

function getTokenAtPosition(sourceFile: ts.SourceFile, position: number): ts.Node {
  let current: ts.Node = sourceFile;
  while (true) {
    const child = current
      .getChildren(sourceFile)
      .find((c) => c.getStart(sourceFile) <= position && c.getEnd() > position);
    if (!child || child.kind === ts.SyntaxKind.EndOfFileToken) {
      return current;
    }
    current = child;
  }
}
// TODO: Move this to `@angular/language-service`.
enum CompletionKind {
  attribute = 'attribute',
  block = 'block',
  htmlAttribute = 'html attribute',
  property = 'property',
  component = 'component',
  directive = 'directive',
  element = 'element',
  event = 'event',
  key = 'key',
  method = 'method',
  pipe = 'pipe',
  type = 'type',
  reference = 'reference',
  variable = 'variable',
  entity = 'entity',
  enumMember = 'enum member',
}

/**
 * Information about the origin of an `lsp.CompletionItem`, which is stored in the
 * `lsp.CompletionItem.data` property.
 *
 * On future requests for details about a completion item, this information allows the language
 * service to determine the context for the original completion request, in order to return more
 * detailed results.
 */
export interface NgCompletionOriginData {
  /**
   * Used to validate the type of `lsp.CompletionItem.data` is correct, since that field is type
   * `any`.
   */
  kind: 'ngCompletionOriginData';

  filePath: string;
  position: lsp.Position;

  tsData?: ts.CompletionEntryData;
}

/**
 * Extract `NgCompletionOriginData` from an `lsp.CompletionItem` if present.
 */
export function readNgCompletionData(item: lsp.CompletionItem): NgCompletionOriginData | null {
  if (item.data === undefined) {
    return null;
  }

  // Validate that `item.data.kind` is actually the right tag, and narrow its type in the process.
  const data: NgCompletionOriginData | {kind?: never} = item.data;
  if (data.kind !== 'ngCompletionOriginData') {
    return null;
  }

  return data;
}

/**
 * Convert Angular's CompletionKind to LSP CompletionItemKind.
 * @param kind Angular's CompletionKind
 */
function ngCompletionKindToLspCompletionItemKind(kind: CompletionKind): lsp.CompletionItemKind {
  switch (kind) {
    case CompletionKind.attribute:
    case CompletionKind.htmlAttribute:
    case CompletionKind.property:
    case CompletionKind.event:
      return lsp.CompletionItemKind.Property;
    case CompletionKind.directive:
    case CompletionKind.component:
    case CompletionKind.element:
    case CompletionKind.key:
      return lsp.CompletionItemKind.Class;
    case CompletionKind.method:
      return lsp.CompletionItemKind.Method;
    case CompletionKind.pipe:
      return lsp.CompletionItemKind.Function;
    case CompletionKind.type:
      return lsp.CompletionItemKind.Interface;
    case CompletionKind.reference:
    case CompletionKind.variable:
      return lsp.CompletionItemKind.Variable;
    case CompletionKind.block:
      return lsp.CompletionItemKind.Keyword;
    case CompletionKind.enumMember:
      return lsp.CompletionItemKind.EnumMember;
    case CompletionKind.entity:
    default:
      return lsp.CompletionItemKind.Text;
  }
}

/**
 * Convert ts.CompletionEntry to LSP Completion Item.
 * @param entry completion entry
 * @param position position where completion is requested.
 * @param scriptInfo
 */
function tsCompletionEntryToLspCompletionItem(
  entry: ts.CompletionEntry,
  position: lsp.Position,
  scriptInfo: ts.server.ScriptInfo,
): lsp.CompletionItem {
  const item = lsp.CompletionItem.create(entry.name);
  // Even though `entry.kind` is typed as ts.ScriptElementKind, it's
  // really Angular's CompletionKind. This is because ts.ScriptElementKind does
  // not sufficiently capture the HTML entities.
  // This is a limitation of being a tsserver plugin.
  const kind = entry.kind as unknown as CompletionKind;
  item.kind = ngCompletionKindToLspCompletionItemKind(kind);
  item.detail = entry.kind;
  item.sortText = entry.sortText;
  // Text that actually gets inserted to the document. It could be different
  // from 'entry.name'. For example, a method name could be 'greet', but the
  // insertText is 'greet()'.
  const insertText = entry.insertText || entry.name;
  item.textEdit = createTextEdit(scriptInfo, entry, position, insertText);

  // If the user enables the config `includeAutomaticOptionalChainCompletions`, the `insertText`
  // range will include the dot. the `insertText` should be assigned to the `filterText` to filter
  // the completion items.
  item.filterText = entry.insertText;
  if (entry.isSnippet) {
    item.insertTextFormat = lsp.InsertTextFormat.Snippet;
  }

  item.data = {
    kind: 'ngCompletionOriginData',
    filePath: scriptInfo.fileName,
    position,
    tsData: entry.data,
  } as NgCompletionOriginData;
  return item;
}

function createTextEdit(
  scriptInfo: ts.server.ScriptInfo,
  entry: ts.CompletionEntry,
  position: lsp.Position,
  insertText: string,
) {
  if (entry.replacementSpan === undefined) {
    return lsp.TextEdit.insert(position, insertText);
  } else {
    /**
     * The Angular Language Service does not return `InsertReplaceEdit`.
     * There is no need to allow the developer to choose how to insert the completion.
     *
     * For example, `<button (c|) />`.
     *                       ^^__________Insert edit
     *                       ^^ ^________Replace edit
     *
     * If the LS returns the `InsertReplaceEdit` as shown above, selecting "Insert" by the developer
     * results in `(click)="")`, and selecting "Replace" results in `(click)=""`.
     *
     * Now in the vscode, the default `editor.suggest.insertMode` value for HTML is `Replace`, for
     * ts is `Insert`, So this leads to a bug in the ts file.
     *
     * Fixes https://github.com/angular/vscode-ng-language-service/issues/2137
     */
    return lsp.TextEdit.replace(
      tsTextSpanToLspRange(scriptInfo, entry.replacementSpan),
      insertText,
    );
  }
}

/**
 * In the completion item, the `additionalTextEdits` can only be included the changes about the
 * current file, the other changes should be inserted by the vscode command.
 *
 * For example, when the user selects a component in an HTML file, the extension inserts the
 * selector in the HTML file and auto-generates the import declaration in the TS file.
 *
 * The code is copied from
 * [here](https://github.com/microsoft/vscode/blob/4608b378a8101ff273fa5db36516da6022f66bbf/extensions/typescript-language-features/src/languageFeatures/completions.ts#L304)
 */
function generateCommandAndTextEditsFromCodeActions(
  codeActions: ts.CodeAction[],
  currentFilePath: string,
  getScriptInfo: (path: string) => ts.server.ScriptInfo | undefined,
): {command?: lsp.Command; additionalTextEdits?: lsp.TextEdit[]} {
  if (codeActions.length === 0) {
    return {};
  }

  // Try to extract out the additionalTextEdits for the current file.
  // Also check if we still have to apply other workspace edits and commands
  // using a vscode command
  const additionalTextEdits: lsp.TextEdit[] = [];
  const commandTextEditors: lsp.WorkspaceEdit[] = [];

  for (const tsAction of codeActions) {
    const currentFileChanges = tsAction.changes.filter(
      (change) => change.fileName === currentFilePath,
    );
    const otherWorkspaceFileChanges = tsAction.changes.filter(
      (change) => change.fileName !== currentFilePath,
    );

    if (currentFileChanges.length > 0) {
      // Apply all edits in the current file using `additionalTextEdits`
      const additionalWorkspaceEdit = tsFileTextChangesToLspWorkspaceEdit(
        currentFileChanges,
        getScriptInfo,
      ).changes;
      if (additionalWorkspaceEdit !== undefined) {
        for (const edit of Object.values(additionalWorkspaceEdit)) {
          additionalTextEdits.push(...edit);
        }
      }
    }

    if (otherWorkspaceFileChanges.length > 0) {
      commandTextEditors.push(
        tsFileTextChangesToLspWorkspaceEdit(otherWorkspaceFileChanges, getScriptInfo),
      );
    }
  }

  let command: lsp.Command | undefined = undefined;
  if (commandTextEditors.length > 0) {
    // Create command that applies all edits not in the current file.
    command = {
      title: '',
      command: 'angular.applyCompletionCodeAction',
      arguments: [commandTextEditors],
    };
  }

  return {
    command,
    additionalTextEdits: additionalTextEdits.length ? additionalTextEdits : undefined,
  };
}
