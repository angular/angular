/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';

import {Session} from '../session';
import {lspPositionToTsPosition, tsTextSpanToLspRange} from '../utils';

/**
 * Handle the `textDocument/selectionRange` LSP request.
 *
 * Selection ranges provide smart selection expansion: select text → expand to element →
 * expand to parent → expand to block.
 */
export function onSelectionRange(
  session: Session,
  params: lsp.SelectionRangeParams,
): lsp.SelectionRange[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }

  const {languageService, scriptInfo} = lsInfo;
  const results: lsp.SelectionRange[] = [];

  for (const position of params.positions) {
    const offset = lspPositionToTsPosition(scriptInfo, position);
    const selectionRange = languageService.getSelectionRangeAtPosition(scriptInfo.fileName, offset);

    if (selectionRange) {
      const lspRange = convertSelectionRange(selectionRange, scriptInfo);
      if (lspRange) {
        results.push(lspRange);
      }
    }
  }

  return results.length > 0 ? results : null;
}

/**
 * Convert a TypeScript SelectionRange to an LSP SelectionRange.
 */
function convertSelectionRange(
  tsRange: {
    textSpan: {start: number; length: number};
    parent?: {textSpan: {start: number; length: number}; parent?: any};
  },
  scriptInfo: any,
): lsp.SelectionRange | undefined {
  const range = tsTextSpanToLspRange(scriptInfo, tsRange.textSpan);
  if (!range) {
    return undefined;
  }

  let parent: lsp.SelectionRange | undefined;
  if (tsRange.parent) {
    parent = convertSelectionRange(tsRange.parent, scriptInfo);
  }

  return {
    range,
    parent,
  };
}
