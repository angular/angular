/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fork} from 'child_process';
import * as fs from 'fs';
import {
  createMessageConnection,
  IPCMessageReader,
  IPCMessageWriter,
  MessageConnection,
} from 'vscode-jsonrpc/node';
import * as lsp from 'vscode-languageserver-protocol';
import {URI} from 'vscode-uri';

import {PROJECT_PATH, SERVER_PATH} from '../test_constants';

export interface ServerOptions {
  includeAutomaticOptionalChainCompletions?: boolean;
  includeCompletionsWithSnippetText?: boolean;
  angularCoreVersion?: string;
}

export function createConnection(serverOptions: ServerOptions): MessageConnection {
  const argv: string[] = [
    '--node-ipc',
    '--tsProbeLocations',
    SERVER_PATH,
    '--ngProbeLocations',
    [SERVER_PATH, PROJECT_PATH].join(','),
  ];
  if (serverOptions.includeAutomaticOptionalChainCompletions) {
    argv.push('--includeAutomaticOptionalChainCompletions');
  }
  if (serverOptions.includeCompletionsWithSnippetText) {
    argv.push('--includeCompletionsWithSnippetText');
  }
  if (serverOptions.angularCoreVersion) {
    argv.push('--angularCoreVersion', serverOptions.angularCoreVersion);
  }
  const server = fork(SERVER_PATH, argv, {
    cwd: PROJECT_PATH,
    // uncomment to debug server process
    // execArgv: ['--inspect-brk=9330']
  });
  server.on('close', (code: number) => {
    if (code !== null && code !== 0) {
      throw new Error(`Server exited with code: ${code}`);
    }
  });
  const connection = createMessageConnection(
    new IPCMessageReader(server),
    new IPCMessageWriter(server),
  );
  connection.onDispose(() => {
    server.kill();
  });

  // Handle workspace/configuration requests from the server
  // This provides default empty configuration for all requested sections
  connection.onRequest(lsp.ConfigurationRequest.type, (params) => {
    // Return empty objects for each requested section
    // This allows the server to use its default configuration
    return params.items.map(() => ({}));
  });
  return connection;
}

export function initializeServer(client: MessageConnection): Promise<lsp.InitializeResult> {
  return client.sendRequest(lsp.InitializeRequest.type, {
    /**
     * The process id of the parent process that started the server. It is
     * always the current process.
     */
    processId: process.pid,
    rootUri: `file://${PROJECT_PATH}`,
    capabilities: {
      textDocument: {
        completion: {
          completionItem: {
            snippetSupport: true,
          },
        },
        moniker: {},
        definition: {linkSupport: true},
        typeDefinition: {linkSupport: true},
        inlayHint: {
          dynamicRegistration: false,
        },
      },
      workspace: {
        configuration: true,
      },
    },
    /**
     * Options are 'off' | 'messages' | 'verbose'.
     * To debug test failure, set to 'verbose'.
     */
    trace: 'off',
    workspaceFolders: null,
  });
}

export function openTextDocument(client: MessageConnection, filePath: string, newText?: string) {
  let languageId = 'unknown';
  if (filePath.endsWith('ts')) {
    languageId = 'typescript';
  } else if (filePath.endsWith('html')) {
    languageId = 'html';
  }
  client.sendNotification(lsp.DidOpenTextDocumentNotification.type, {
    textDocument: {
      uri: convertPathToFileUrl(filePath),
      languageId,
      version: 1,
      text: newText ?? fs.readFileSync(filePath, 'utf-8'),
    },
  });
}

export function convertPathToFileUrl(filePath: string): string {
  return URI.file(filePath).toString();
}

export function createTracer(): lsp.Tracer {
  return {
    log(messageOrDataObject: string | any, data?: string) {
      if (typeof messageOrDataObject === 'string') {
        const message = messageOrDataObject;
        console.log(`[Trace - ${new Date().toLocaleTimeString()}] ${message}`);
        if (data) {
          console.log(data);
        }
      } else {
        const dataObject = messageOrDataObject;
        console.log(
          `[Trace - ${new Date().toLocaleTimeString()}] ` + JSON.stringify(dataObject, null, 2),
        );
      }
    },
  };
}
