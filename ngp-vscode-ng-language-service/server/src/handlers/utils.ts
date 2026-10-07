/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Position, TextDocuments, Connection} from 'vscode-languageserver';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {fileURLToPath} from 'node:url';
import {LanguageService} from '../../../../packages/compiler-cli/preprocessor/language-service/src/language_service.js';
import {positionToOffset} from '../../../../packages/compiler-cli/preprocessor/src/tcb_ls_util.js';

export interface HandlerContext {
  workspaceRoot: string;
  languageService: LanguageService;
  connection: Connection;
  documents: TextDocuments<TextDocument>;
}

export interface DocumentContext {
  filePath: string;
  fileContent: string;
  offset: number;
}

export function getDocumentContext(
  context: HandlerContext,
  uri: string,
  position: Position,
): DocumentContext | null {
  if (!uri.startsWith('file:')) {
    return null;
  }

  const filePath = fileURLToPath(uri);
  const doc = context.documents.get(uri);
  if (doc) {
    return {
      filePath,
      fileContent: doc.getText(),
      offset: doc.offsetAt(position),
    };
  }

  let fileContent: string;
  try {
    fileContent = context.languageService.hybridCompiler.getFileContent(filePath);
  } catch {
    return null;
  }

  const offset = positionToOffset(fileContent, position);
  return {filePath, fileContent, offset};
}
