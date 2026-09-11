/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import * as ts from 'typescript/lib/tsserverlibrary';

import {Session} from '../session';
import {lspPositionToTsPosition, tsTextSpanToLspRange} from '../utils';

/**
 * Handles textDocument/selectionRange requests (the editor's "Expand/Shrink
 * Selection" feature). The Angular language service produces ranges that
 * follow the template AST, so control flow blocks (`@if`, `@for`, `@switch`,
 * ...) and their bodies become selection steps.
 */
export function onSelectionRanges(
  session: Session,
  params: lsp.SelectionRangeParams,
): lsp.SelectionRange[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {scriptInfo, languageService} = lsInfo;
  return params.positions.map((position) => {
    const offset = lspPositionToTsPosition(scriptInfo, position);
    const tsSelectionRange = languageService.getSmartSelectionRange(scriptInfo.fileName, offset);
    return tsSelectionRangeToLsp(tsSelectionRange, scriptInfo);
  });
}

function tsSelectionRangeToLsp(
  selectionRange: ts.SelectionRange,
  scriptInfo: ts.server.ScriptInfo,
): lsp.SelectionRange {
  return {
    range: tsTextSpanToLspRange(scriptInfo, selectionRange.textSpan),
    parent:
      selectionRange.parent !== undefined
        ? tsSelectionRangeToLsp(selectionRange.parent, scriptInfo)
        : undefined,
  };
}
