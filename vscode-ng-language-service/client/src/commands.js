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
exports.registerCommands = registerCommands;
const vscode = __importStar(require('vscode'));
const initialize_1 = require('../../common/initialize');
const providers_1 = require('./providers');
/**
 * Restart the language server by killing the process then spanwing a new one.
 * @param client language client
 * @param context extension context for adding disposables
 */
function restartNgServer(client) {
  return {
    id: 'angular.restartNgServer',
    isTextEditorCommand: false,
    async execute() {
      await client.stop();
      await client.start();
    },
  };
}
/**
 * Open the current server log file in a new editor.
 */
function openLogFile(client) {
  return {
    id: 'angular.openLogFile',
    isTextEditorCommand: false,
    async execute() {
      var _a;
      const serverOptions =
        (_a = client.initializeResult) === null || _a === void 0 ? void 0 : _a.serverOptions;
      if (!(serverOptions === null || serverOptions === void 0 ? void 0 : serverOptions.logFile)) {
        // Show a MessageItem to help users automatically update the
        // configuration option then restart the server.
        const selection = await vscode.window.showErrorMessage(
          `Angular server logging is off. Please set 'angular.log' and restart the server.`,
          'Enable logging and restart server',
        );
        if (selection) {
          const isGlobalConfig = false;
          await vscode.workspace
            .getConfiguration()
            .update('angular.log', 'verbose', isGlobalConfig);
          // Server will automatically restart because the config is changed
        }
        return;
      }
      const document = await vscode.workspace.openTextDocument(serverOptions.logFile);
      return vscode.window.showTextDocument(document);
    },
  };
}
/**
 * Command getTemplateTcb displays a typecheck block for the template a user has
 * an active selection over, if any.
 * @param ngClient LSP client for the active session
 * @param context extension context to which disposables are pushed
 */
function getTemplateTcb(ngClient, context) {
  const TCB_HIGHLIGHT_DECORATION = vscode.window.createTextEditorDecorationType({
    // See https://code.visualstudio.com/api/references/theme-color#editor-colors
    backgroundColor: new vscode.ThemeColor('editor.selectionHighlightBackground'),
  });
  const tcbProvider = new providers_1.TcbContentProvider();
  const disposable = vscode.workspace.registerTextDocumentContentProvider(
    providers_1.ANGULAR_SCHEME,
    tcbProvider,
  );
  context.subscriptions.push(disposable);
  return {
    id: 'angular.getTemplateTcb',
    isTextEditorCommand: true,
    async execute(textEditor) {
      tcbProvider.clear();
      const response = await ngClient.getTcbUnderCursor(textEditor);
      if (response === undefined) {
        return undefined;
      }
      // Change the scheme of the URI from `file` to `ng` so that the document
      // content is requested from our own `TcbContentProvider`.
      const tcbUri = response.uri.with({
        scheme: providers_1.ANGULAR_SCHEME,
      });
      tcbProvider.update(tcbUri, response.content);
      const editor = await vscode.window.showTextDocument(tcbUri, {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true, // cursor remains in the active editor
      });
      editor.setDecorations(TCB_HIGHLIGHT_DECORATION, response.selections);
    },
  };
}
/**
 * Command goToComponentWithTemplateFile finds components which reference an external template in
 * their `templateUrl`s.
 *
 * @param ngClient LSP client for the active session
 */
function goToComponentWithTemplateFile(ngClient) {
  return {
    id: 'angular.goToComponentWithTemplateFile',
    isTextEditorCommand: true,
    async execute(textEditor) {
      const locations = await ngClient.getComponentsForOpenExternalTemplate(textEditor);
      if (locations === undefined) {
        return;
      }
      vscode.commands.executeCommand(
        'editor.action.goToLocations',
        textEditor.document.uri,
        textEditor.selection.active,
        locations,
        'peek' /** what to do when there are multiple results */,
      );
    },
  };
}
/**
 * Command goToTemplateForComponent finds the template for a component.
 *
 * @param ngClient LSP client for the active session
 */
function goToTemplateForComponent(ngClient) {
  return {
    id: 'angular.goToTemplateForComponent',
    isTextEditorCommand: true,
    async execute(textEditor) {
      const location = await ngClient.getTemplateLocationForComponent(textEditor);
      if (location === null) {
        return;
      }
      vscode.commands.executeCommand(
        'editor.action.goToLocations',
        textEditor.document.uri,
        textEditor.selection.active,
        [location],
        'goto' /** What to do when there are multiple results (there can't be) */,
      );
    },
  };
}
/**
 * Proxy command for opening links in jsdoc comments.
 *
 * This is needed to avoid incorrectly rewriting uris.
 */
function openJsDocLinkCommand() {
  return {
    id: initialize_1.OpenJsDocLinkCommandId,
    isTextEditorCommand: false,
    async execute(args) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      return await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(args.file), {
        selection: new vscode.Range(
          new vscode.Position(
            (_b = (_a = args.position) === null || _a === void 0 ? void 0 : _a.start.line) !==
              null && _b !== void 0
              ? _b
              : 0,
            (_d = (_c = args.position) === null || _c === void 0 ? void 0 : _c.start.character) !==
              null && _d !== void 0
              ? _d
              : 0,
          ),
          new vscode.Position(
            (_f = (_e = args.position) === null || _e === void 0 ? void 0 : _e.end.line) !== null &&
            _f !== void 0
              ? _f
              : 0,
            (_h = (_g = args.position) === null || _g === void 0 ? void 0 : _g.end.character) !==
              null && _h !== void 0
              ? _h
              : 0,
          ),
        ),
      });
    },
  };
}
function applyCodeActionCommand(ngClient) {
  return {
    id: 'angular.applyCompletionCodeAction',
    isTextEditorCommand: false,
    async execute(args) {
      await ngClient.applyWorkspaceEdits(args);
    },
  };
}
/**
 * Register all supported vscode commands for the Angular extension.
 * @param client language client
 * @param context extension context for adding disposables
 */
function registerCommands(client, context) {
  const commands = [
    restartNgServer(client),
    openLogFile(client),
    getTemplateTcb(client, context),
    goToComponentWithTemplateFile(client),
    goToTemplateForComponent(client),
    openJsDocLinkCommand(),
    applyCodeActionCommand(client),
  ];
  for (const command of commands) {
    const disposable = command.isTextEditorCommand
      ? vscode.commands.registerTextEditorCommand(command.id, command.execute)
      : vscode.commands.registerCommand(command.id, command.execute);
    context.subscriptions.push(disposable);
  }
}
//# sourceMappingURL=commands.js.map
