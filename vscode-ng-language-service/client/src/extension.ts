/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';

import {AngularLanguageClient} from './client';
import {registerCommands} from './commands';
import {shouldRestartOnConfigurationChange} from './config_change';

export function activate(context: vscode.ExtensionContext) {
  const client = new AngularLanguageClient(context);
  context.subscriptions.push(client);

  const startServer = async () => {
    registerCommands(client, context);

    // Restart the server on configuration changes that affect startup/session state.
    const disposable = vscode.workspace.onDidChangeConfiguration(
      async (e: vscode.ConfigurationChangeEvent) => {
        if (!shouldRestartOnConfigurationChange(e)) {
          return;
        }
        await client.stop();
        await client.start();
      },
    );
    context.subscriptions.push(disposable);

    await client.start();
  };

  // If the workspace is untrusted, operate in limited mode:
  // Do NOT start the language server or register commands.
  if (!vscode.workspace.isTrusted) {
    const trustDisposable = vscode.workspace.onDidGrantWorkspaceTrust(async () => {
      await startServer();
    });
    context.subscriptions.push(trustDisposable);
    return;
  }

  startServer();
}
