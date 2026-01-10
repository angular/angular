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

export function activate(context: vscode.ExtensionContext) {
  const client = new AngularLanguageClient(context);

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  registerCommands(client, context);

  // Restart the server on configuration change.
  const disposable = vscode.workspace.onDidChangeConfiguration(
    async (e: vscode.ConfigurationChangeEvent) => {
      if (!e.affectsConfiguration('angular')) {
        return;
      }
      await client.stop();
      await client.start();
    },
  );
  context.subscriptions.push(client, disposable);

  client.start();
}
