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
 * Handles the textDocument/linkedEditingRange request.
 *
 * Returns linked editing ranges for synchronized editing of HTML tag pairs.
 * When the cursor is on an element tag name, returns both the opening and closing
 * tag name spans so they can be edited simultaneously.
 */
export function onLinkedEditingRange(
  session: Session,
  params: lsp.LinkedEditingRangeParams,
): lsp.LinkedEditingRanges | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const linkedEditingRanges = languageService.getLinkedEditingRangeAtPosition(
    scriptInfo.fileName,
    offset,
  );

  if (!linkedEditingRanges || linkedEditingRanges.ranges.length === 0) {
    return null;
  }

  const ranges: lsp.Range[] = linkedEditingRanges.ranges.map((span) =>
    tsTextSpanToLspRange(scriptInfo, span),
  );

  return {
    ranges,
    wordPattern: linkedEditingRanges.wordPattern,
  };
}
