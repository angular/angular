/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';

import {Session} from '../session';
import {lspRangeToTsPositions, tsTextSpanToLspRange} from '../utils';

export function onDocumentColor(
  session: Session,
  params: lsp.DocumentColorParams,
): lsp.ColorInformation[] {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return [];
  }

  const {languageService, scriptInfo} = lsInfo;
  if (!('getDocumentColors' in languageService)) {
    return [];
  }

  const colors = languageService.getDocumentColors(scriptInfo.fileName);
  return colors.map((c) => ({
    color: {
      red: c.color.red,
      green: c.color.green,
      blue: c.color.blue,
      alpha: c.color.alpha,
    },
    range: tsTextSpanToLspRange(scriptInfo, c.range),
  }));
}

export function onColorPresentation(
  session: Session,
  params: lsp.ColorPresentationParams,
): lsp.ColorPresentation[] {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return [];
  }

  const {languageService, scriptInfo} = lsInfo;
  if (!('getColorPresentations' in languageService)) {
    return [];
  }

  const [start, end] = lspRangeToTsPositions(scriptInfo, params.range);
  const range = {start, length: end - start};

  const presentations = languageService.getColorPresentations(
    scriptInfo.fileName,
    params.color,
    range,
  );

  return presentations.map((p) => ({label: p.label}));
}
