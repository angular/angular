/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';

import {lspPositionToTsPosition, tsTextSpanToLspRange} from './utils';

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
export function tsCompletionEntryToLspCompletionItem(
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
