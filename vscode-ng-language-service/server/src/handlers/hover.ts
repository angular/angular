/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import {getSCSSLanguageService} from 'vscode-css-languageservice';
import {TextDocument} from 'vscode-languageserver-textdocument';

import {Session} from '../session';
import {getSCSSVirtualContent, isInlineStyleNode} from '../embedded_support';
import {lspPositionToTsPosition, getTokenAtPosition, tsTextSpanToLspRange} from '../utils';
import {documentationToMarkdown} from '../text_render';

const scssLS = getSCSSLanguageService();

export function onHover(session: Session, params: lsp.HoverParams): lsp.Hover | null {
  session.debug(
    `onHover: ${params.textDocument.uri} @ ${params.position.line}:${params.position.character}`,
  );
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    session.debug(`onHover: no language service for ${params.textDocument.uri}`);
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const info = languageService.getQuickInfoAtPosition(scriptInfo.fileName, offset);
  if (!info) {
    session.debug(`onHover: no quick info, trying scss fallback`);
    const sf = session.getDefaultProjectForScriptInfo(scriptInfo)?.getSourceFile(scriptInfo.path);
    if (!sf) {
      session.debug(`onHover: no sourceFile for fallback`);
      return null;
    }
    const node = getTokenAtPosition(sf, offset);
    if (!isInlineStyleNode(node)) {
      session.debug(`onHover: not an inline style node`);
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
    const scssHover = scssLS.doHover(virtualScssDoc, params.position, stylesheet);
    session.debug(`onHover: scss fallback returned ${scssHover ? 'hover' : 'no hover'}`);
    return scssHover;
  }
  session.debug(`onHover: returning quick info`);
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
