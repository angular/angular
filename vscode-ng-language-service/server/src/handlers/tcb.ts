/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {GetTcbParams, GetTcbResponse} from '../../../common/requests';
import {Session} from '../session';
import {filePathToUri, lspPositionToTsPosition, tsTextSpanToLspRange} from '../utils';

export function onGetTcb(session: Session, params: GetTcbParams): GetTcbResponse | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const response = languageService.getTcb(scriptInfo.fileName, offset);
  if (response === undefined) {
    return null;
  }
  const {fileName: tcfName} = response;
  const tcfScriptInfo = session.projectService.getScriptInfo(tcfName);
  if (!tcfScriptInfo) {
    return null;
  }
  return {
    uri: filePathToUri(tcfName),
    content: response.content,
    selections: response.selections.map((span) => tsTextSpanToLspRange(tcfScriptInfo, span)),
  };
}
