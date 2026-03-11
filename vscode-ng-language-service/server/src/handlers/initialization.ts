/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as lsp from 'vscode-languageserver';
import {Session} from '../session';
import {ServerOptions} from '../../../common/initialize';

export function onInitialize(session: Session, params: lsp.InitializeParams): lsp.InitializeResult {
  session.snippetSupport =
    params.capabilities.textDocument?.completion?.completionItem?.snippetSupport;
  const serverOptions: ServerOptions = {
    logFile: session.logger.getLogFileName(),
  };
  session.clientCapabilities = params.capabilities;
  return {
    capabilities: {
      foldingRangeProvider: true,
      codeLensProvider: {resolveProvider: true},
      textDocumentSync: lsp.TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: ['<', '.', '*', '[', '(', '$', '|', '@'],
      },
      definitionProvider: true,
      typeDefinitionProvider: true,
      referencesProvider: true,
      renameProvider: {
        // Renames should be checked and tested before being executed.
        prepareProvider: true,
      },
      hoverProvider: true,
      signatureHelpProvider: {
        triggerCharacters: ['(', ','],
        retriggerCharacters: [','],
      },
      linkedEditingRangeProvider: true,
      workspace: {
        workspaceFolders: {supported: true},
      },
      codeActionProvider: {
        resolveProvider: true,
        // Now the Angular code action provider only supports `QuickFix`. If leave the
        // `codeActionKinds` empty, all action requests will be sent to the Angular language
        // service, especially for the action before saving the file, the Angular code action
        // provider will try to fix all errors in the whole file, it's expensive.
        //
        // Find more info
        // [here](https://github.com/angular/vscode-ng-language-service/issues/1828)
        codeActionKinds: [lsp.CodeActionKind.QuickFix],
      },
      // Inlay hints provider (LSP 3.17)
      // Provides type annotations for template variables, $event types, etc.
      inlayHintProvider: {
        resolveProvider: true,
      },
    },
    serverOptions,
  };
}
