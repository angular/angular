/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import {
  GetTemplateLocationForComponentParams,
  IsInAngularProjectParams,
} from '../../../common/requests';
import {Session} from '../session';
import {
  filePathToUri,
  isAngularCore,
  lspPositionToTsPosition,
  tsTextSpanToLspRange,
  uriToFilePath,
} from '../utils';

export function onGetTemplateLocationForComponent(
  session: Session,
  params: GetTemplateLocationForComponentParams,
): lsp.Location | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const documentSpan = languageService.getTemplateLocationForComponent(scriptInfo.fileName, offset);
  if (documentSpan === undefined) {
    return null;
  }
  const templateScriptInfo = session.projectService.getScriptInfo(documentSpan.fileName);
  if (templateScriptInfo === undefined) {
    return null;
  }
  const range = tsTextSpanToLspRange(templateScriptInfo, documentSpan.textSpan);
  return lsp.Location.create(filePathToUri(documentSpan.fileName), range);
}

export function isInAngularProject(
  session: Session,
  params: IsInAngularProjectParams,
): boolean | null {
  const filePath = uriToFilePath(params.textDocument.uri);
  if (!filePath) {
    return false;
  }
  const lsAndScriptInfo = session.getLSAndScriptInfo(params.textDocument);
  if (!lsAndScriptInfo) {
    // If we cannot get language service / script info, return null to indicate we don't know
    // the answer definitively.
    return null;
  }
  const project = session.getDefaultProjectForScriptInfo(lsAndScriptInfo.scriptInfo);
  if (!project) {
    // If we cannot get project, return null to indicate we don't know
    // the answer definitively.
    return null;
  }
  const angularCore = project.getFileNames().find(isAngularCore);
  return angularCore !== undefined;
}
