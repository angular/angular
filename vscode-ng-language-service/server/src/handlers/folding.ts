/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import {getLanguageService as getHTMLLanguageService} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode-languageserver-textdocument';

import {Session} from '../session';
import {getHTMLVirtualContent} from '../embedded_support';
import {tsTextSpanToLspRange} from '../utils';

const htmlLS = getHTMLLanguageService();

export function onFoldingRanges(
  session: Session,
  params: lsp.FoldingRangeParams,
): lsp.FoldingRange[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {scriptInfo, languageService} = lsInfo;
  const angularOutliningSpans = languageService.getOutliningSpans(scriptInfo.fileName);
  const angularFoldingRanges = angularOutliningSpans.map((outliningSpan) => {
    const range = tsTextSpanToLspRange(scriptInfo, {
      start: outliningSpan.textSpan.start,
      length: outliningSpan.textSpan.length,
    });
    // We do not want to fold the line containing the closing of the block because then the
    // closing character (and line) would get hidden in the folding range. We only want to fold
    // the inside and leave the start/end lines visible.
    const endLine = Math.max(range.end.line - 1, range.start.line);
    return lsp.FoldingRange.create(range.start.line, endLine);
  });

  if (!params.textDocument.uri?.endsWith('ts')) {
    return angularFoldingRanges;
  }
  const sf = session.getDefaultProjectForScriptInfo(scriptInfo)?.getSourceFile(scriptInfo.path);
  if (sf === undefined) {
    return null;
  }
  const virtualHtmlDocContents = getHTMLVirtualContent(sf);
  const virtualHtmlDoc = TextDocument.create(
    params.textDocument.uri.toString(),
    'html',
    0,
    virtualHtmlDocContents,
  );

  return [...htmlLS.getFoldingRanges(virtualHtmlDoc), ...angularFoldingRanges];
}
