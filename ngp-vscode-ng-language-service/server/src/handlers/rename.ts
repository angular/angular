/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  PrepareRenameParams,
  RenameParams,
  WorkspaceEdit,
  TextEdit,
  Range,
} from 'vscode-languageserver';
import {HandlerContext, getDocumentContext} from './utils.js';

export async function onPrepareRename(
  params: PrepareRenameParams,
  context: HandlerContext,
): Promise<Range | {range: Range; placeholder: string} | null> {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  const info = await context.languageService.getRenameInfo(
    filePath,
    offset,
    params.position,
    fileContent,
  );

  if (info && info.canRename && info.range) {
    return {
      range: info.range,
      placeholder: info.displayName ?? '',
    };
  }

  return null;
}

export async function onRename(
  params: RenameParams,
  context: HandlerContext,
): Promise<WorkspaceEdit | null> {
  const docContext = getDocumentContext(context, params.textDocument.uri, params.position);
  if (!docContext) {
    return null;
  }

  const {filePath, fileContent, offset} = docContext;
  const locations = await context.languageService.findRenameLocations(
    filePath,
    offset,
    params.position,
    fileContent,
  );

  if (!locations || locations.length === 0) {
    return null;
  }

  const changes: {[uri: string]: TextEdit[]} = {};
  for (const loc of locations) {
    changes[loc.uri] ??= [];
    changes[loc.uri].push({
      range: loc.range,
      newText: params.newName,
    });
  }

  return {changes};
}
