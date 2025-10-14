'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
exports.createConnection = createConnection;
exports.initializeServer = initializeServer;
exports.openTextDocument = openTextDocument;
exports.convertPathToFileUrl = convertPathToFileUrl;
exports.createTracer = createTracer;
const child_process_1 = require('child_process');
const fs = __importStar(require('fs'));
const node_1 = require('vscode-jsonrpc/node');
const lsp = __importStar(require('vscode-languageserver-protocol'));
const vscode_uri_1 = require('vscode-uri');
const test_constants_1 = require('../test_constants');
function createConnection(serverOptions) {
  const argv = [
    '--node-ipc',
    '--tsProbeLocations',
    test_constants_1.SERVER_PATH,
    '--ngProbeLocations',
    [test_constants_1.SERVER_PATH, test_constants_1.PROJECT_PATH].join(','),
  ];
  if (!serverOptions.ivy) {
    argv.push('--viewEngine');
  }
  if (serverOptions.includeAutomaticOptionalChainCompletions) {
    argv.push('--includeAutomaticOptionalChainCompletions');
  }
  if (serverOptions.includeCompletionsWithSnippetText) {
    argv.push('--includeCompletionsWithSnippetText');
  }
  if (serverOptions.angularCoreVersion) {
    argv.push('--angularCoreVersion', serverOptions.angularCoreVersion);
  }
  const server = (0, child_process_1.fork)(test_constants_1.SERVER_PATH, argv, {
    cwd: test_constants_1.PROJECT_PATH,
    // uncomment to debug server process
    // execArgv: ['--inspect-brk=9330']
  });
  server.on('close', (code) => {
    if (code !== null && code !== 0) {
      throw new Error(`Server exited with code: ${code}`);
    }
  });
  const connection = (0, node_1.createMessageConnection)(
    new node_1.IPCMessageReader(server),
    new node_1.IPCMessageWriter(server),
  );
  connection.onDispose(() => {
    server.kill();
  });
  return connection;
}
function initializeServer(client) {
  return client.sendRequest(lsp.InitializeRequest.type, {
    /**
     * The process id of the parent process that started the server. It is
     * always the current process.
     */
    processId: process.pid,
    rootUri: `file://${test_constants_1.PROJECT_PATH}`,
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
function openTextDocument(client, filePath, newText) {
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
      text: newText !== null && newText !== void 0 ? newText : fs.readFileSync(filePath, 'utf-8'),
    },
  });
}
function convertPathToFileUrl(filePath) {
  return vscode_uri_1.URI.file(filePath).toString();
}
function createTracer() {
  return {
    log(messageOrDataObject, data) {
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
//# sourceMappingURL=test_utils.js.map
