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
import {
  filePathToUri,
  getMappedDefinitionInfo,
  lspPositionToTsPosition,
  tsTextSpanToLspRange,
} from '../utils';

const EMPTY_RANGE = lsp.Range.create(0, 0, 0, 0);

export function onDefinition(
  session: Session,
  params: lsp.TextDocumentPositionParams,
): lsp.Location[] | lsp.LocationLink[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const definition = languageService.getDefinitionAndBoundSpan(scriptInfo.fileName, offset);
  if (!definition || !definition.definitions) {
    return null;
  }

  const clientSupportsLocationLinks =
    session.clientCapabilities.textDocument?.definition?.linkSupport ?? false;

  if (!clientSupportsLocationLinks) {
    return tsDefinitionsToLspLocations(session, definition.definitions);
  }

  const originSelectionRange = tsTextSpanToLspRange(scriptInfo, definition.textSpan);
  return tsDefinitionsToLspLocationLinks(session, definition.definitions, originSelectionRange);
}

export function onTypeDefinition(
  session: Session,
  params: lsp.TextDocumentPositionParams,
): lsp.Location[] | lsp.LocationLink[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const definitions = languageService.getTypeDefinitionAtPosition(scriptInfo.fileName, offset);
  if (!definitions) {
    return null;
  }

  const clientSupportsLocationLinks =
    session.clientCapabilities.textDocument?.typeDefinition?.linkSupport ?? false;

  if (!clientSupportsLocationLinks) {
    return tsDefinitionsToLspLocations(session, definitions);
  }

  return tsDefinitionsToLspLocationLinks(session, definitions);
}

export function onReferences(
  session: Session,
  params: lsp.TextDocumentPositionParams,
): lsp.Location[] | null {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (lsInfo === null) {
    return null;
  }
  const {languageService, scriptInfo} = lsInfo;
  const offset = lspPositionToTsPosition(scriptInfo, params.position);
  const references = languageService.getReferencesAtPosition(scriptInfo.fileName, offset);
  if (references === undefined) {
    return null;
  }
  return references.map((ref) => {
    const scriptInfo = session.projectService.getScriptInfo(ref.fileName);
    const range = scriptInfo ? tsTextSpanToLspRange(scriptInfo, ref.textSpan) : EMPTY_RANGE;
    const uri = filePathToUri(ref.fileName);
    return {uri, range};
  });
}

function tsDefinitionsToLspLocations(
  session: Session,
  definitions: readonly ts.DefinitionInfo[],
): lsp.Location[] {
  const results: lsp.Location[] = [];
  for (const d of definitions) {
    const scriptInfo = session.projectService.getScriptInfo(d.fileName);

    // Some definitions, like definitions of CSS files, may not be recorded files with a
    // `scriptInfo` but are still valid definitions because they are files that exist. In this
    // case, check to make sure that the text span of the definition is zero so that the file
    // doesn't have to be read; if the span is non-zero, we can't do anything with this
    // definition.
    if (!scriptInfo && d.textSpan.length > 0) {
      continue;
    }

    let mappedInfo = d;
    let range = EMPTY_RANGE;
    if (scriptInfo) {
      const project = session.getDefaultProjectForScriptInfo(scriptInfo);
      mappedInfo = project ? getMappedDefinitionInfo(d, project) : mappedInfo;
      // After the DTS file maps to original source file, the `scriptInfo` should be updated.
      const originalScriptInfo =
        session.projectService.getScriptInfo(mappedInfo.fileName) ?? scriptInfo;
      range = tsTextSpanToLspRange(originalScriptInfo, mappedInfo.textSpan);
    }

    const uri = filePathToUri(mappedInfo.fileName);
    results.push({
      uri,
      range,
    });
  }
  return results;
}

function tsDefinitionsToLspLocationLinks(
  session: Session,
  definitions: readonly ts.DefinitionInfo[],
  originSelectionRange?: lsp.Range,
): lsp.LocationLink[] {
  const results: lsp.LocationLink[] = [];
  for (const d of definitions) {
    const scriptInfo = session.projectService.getScriptInfo(d.fileName);

    // Some definitions, like definitions of CSS files, may not be recorded files with a
    // `scriptInfo` but are still valid definitions because they are files that exist. In this
    // case, check to make sure that the text span of the definition is zero so that the file
    // doesn't have to be read; if the span is non-zero, we can't do anything with this
    // definition.
    if (!scriptInfo && d.textSpan.length > 0) {
      continue;
    }

    let mappedInfo = d;
    let range = EMPTY_RANGE;
    if (scriptInfo) {
      const project = session.getDefaultProjectForScriptInfo(scriptInfo);
      mappedInfo = project ? getMappedDefinitionInfo(d, project) : mappedInfo;
      // After the DTS file maps to original source file, the `scriptInfo` should be updated.
      const originalScriptInfo =
        session.projectService.getScriptInfo(mappedInfo.fileName) ?? scriptInfo;
      range = tsTextSpanToLspRange(originalScriptInfo, mappedInfo.textSpan);
    }

    const targetUri = filePathToUri(mappedInfo.fileName);
    results.push({
      originSelectionRange,
      targetUri,
      targetRange: range,
      targetSelectionRange: range,
    });
  }
  return results;
}
