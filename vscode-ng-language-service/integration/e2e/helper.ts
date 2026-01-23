import {setTimeout} from 'node:timers/promises';
import * as vscode from 'vscode';

import {APP_COMPONENT, FOO_TEMPLATE} from '../test_constants';

export const COMPLETION_COMMAND = 'vscode.executeCompletionItemProvider';
export const HOVER_COMMAND = 'vscode.executeHoverProvider';
export const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
export const APP_COMPONENT_URI = vscode.Uri.file(APP_COMPONENT);
export const FOO_TEMPLATE_URI = vscode.Uri.file(FOO_TEMPLATE);

export async function activate(uri: vscode.Uri): Promise<void> {
  await vscode.window.showTextDocument(uri);
  // This is needed for stabilization and to reduce flakes.
  // The timeout gives the language server time to warm up.
  await setTimeout(3_000);
}
