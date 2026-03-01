import {setTimeout} from 'node:timers/promises';
import * as vscode from 'vscode';

import {APP_COMPONENT, FOO_TEMPLATE, MARKDOWN_FENCES} from '../test_constants';

export const COMPLETION_COMMAND = 'vscode.executeCompletionItemProvider';
export const HOVER_COMMAND = 'vscode.executeHoverProvider';
export const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
export const APP_COMPONENT_URI = vscode.Uri.file(APP_COMPONENT);
export const FOO_TEMPLATE_URI = vscode.Uri.file(FOO_TEMPLATE);
export const MARKDOWN_FENCES_URI = vscode.Uri.file(MARKDOWN_FENCES);

const ACTIVATE_TIMEOUT_MS = 10_000;
const ACTIVATE_POLL_MS = 100;

export async function activate(uri: vscode.Uri): Promise<void> {
  await vscode.window.showTextDocument(uri);
  const expectedUri = uri.toString();
  const deadline = Date.now() + ACTIVATE_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const activeUri = vscode.window.activeTextEditor?.document.uri.toString();
    if (activeUri === expectedUri) {
      break;
    }

    await setTimeout(ACTIVATE_POLL_MS);
  }

  const activeUri = vscode.window.activeTextEditor?.document.uri.toString();
  if (activeUri !== expectedUri) {
    throw new Error(
      `Failed to activate document ${expectedUri}. Active editor: ${activeUri ?? 'none'}`,
    );
  }

  // This is needed for stabilization and to reduce flakes.
  // The timeout gives the language server time to warm up.
  await setTimeout(3_000);
}
