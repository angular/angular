/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript/lib/tsserverlibrary';
import * as lsp from 'vscode-languageserver';
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
export declare function readNgCompletionData(item: lsp.CompletionItem): NgCompletionOriginData | null;
/**
 * Convert ts.CompletionEntry to LSP Completion Item.
 * @param entry completion entry
 * @param position position where completion is requested.
 * @param scriptInfo
 */
export declare function tsCompletionEntryToLspCompletionItem(entry: ts.CompletionEntry, position: lsp.Position, scriptInfo: ts.server.ScriptInfo): lsp.CompletionItem;
