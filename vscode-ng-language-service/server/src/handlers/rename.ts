/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';

import {Session} from '../session';
import {filePathToUri, lspPositionToTsPosition, tsTextSpanToLspRange} from '../utils';

export function onRenameRequest(
  session: Session,
  params: lsp.RenameParams,
): lsp.WorkspaceEdit | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const project = session.getDefaultProjectForScriptInfo(scriptInfo);
  if (project === null || session.renameDisabledProjects.has(project)) {
    return null;
  }

  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const renameLocations = languageService.findRenameLocations(
    scriptInfo.fileName,
    offset,
    /*findInStrings*/ false,
    /*findInComments*/ false,
  );
  if (renameLocations === undefined) {
    return null;
  }

  const changes = renameLocations.reduce(
    (changes, location) => {
      let uri: lsp.URI = filePathToUri(location.fileName);
      if (changes[uri] === undefined) {
        changes[uri] = [];
      }
      const fileEdits = changes[uri];

      const lsInfo = session.getLSAndScriptInfo(location.fileName);
      if (lsInfo === null) {
        return changes;
      }
      const range = tsTextSpanToLspRange(lsInfo.scriptInfo, location.textSpan);
      fileEdits.push({range, newText: params.newName});
      return changes;
    },
    {} as {[uri: string]: lsp.TextEdit[]},
  );

  return {changes};
}

export function onPrepareRename(
  session: Session,
  params: lsp.PrepareRenameParams,
): {range: lsp.Range; placeholder: string} | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const project = session.getDefaultProjectForScriptInfo(scriptInfo);
  if (project === null || session.renameDisabledProjects.has(project)) {
    return null;
  }

  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const renameInfo = languageService.getRenameInfo(scriptInfo.fileName, offset);
  if (!renameInfo.canRename) {
    return null;
  }
  const range = tsTextSpanToLspRange(scriptInfo, renameInfo.triggerSpan);
  return {
    range,
    placeholder: renameInfo.displayName,
  };
}
