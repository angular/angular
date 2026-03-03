/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver/node';
import {uriToFilePath} from '../utils';
import {ServerHost} from '../server_host';
import * as ts from 'typescript/lib/tsserverlibrary';

export function onDidChangeWatchedFiles(
  params: lsp.DidChangeWatchedFilesParams,
  logger: ts.server.Logger,
  host: ServerHost,
) {
  for (const change of params.changes) {
    const filePath = uriToFilePath(change.uri);
    logger.info(`Received file change event for ${filePath} type ${change.type}`);
    host.notifyFileChange(filePath, change.type);
  }
}
