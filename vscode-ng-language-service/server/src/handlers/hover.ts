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
import {documentationToMarkdown} from '../text_render';

export function onHover(session: Session, params: lsp.HoverParams): lsp.Hover | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const info = languageService.getQuickInfoAtPosition(scriptInfo.fileName, offset);
  if (!info) {
    return null;
  }
  const {kind, kindModifiers, textSpan, displayParts, documentation, tags} = info;
  let desc = kindModifiers ? kindModifiers + ' ' : '';
  if (displayParts && displayParts.length > 0) {
    // displayParts does not contain info about kindModifiers
    // but displayParts does contain info about kind
    desc += displayParts.map((dp) => dp.text).join('');
  } else {
    desc += kind;
  }
  const contents: lsp.MarkedString[] = [
    {
      language: 'typescript',
      value: desc,
    },
  ];
  const mds = documentationToMarkdown(
    documentation,
    tags,
    (fileName: string) => session.getLSAndScriptInfo(fileName)?.scriptInfo,
  );
  contents.push(mds.join('\n'));
  return {
    contents,
    range: tsTextSpanToLspRange(scriptInfo, textSpan),
  };
}
