import * as vscode from 'vscode';

import {APP_COMPONENT, FOO_TEMPLATE} from '../test_constants';

export const COMPLETION_COMMAND = 'vscode.executeCompletionItemProvider';
export const HOVER_COMMAND = 'vscode.executeHoverProvider';
export const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
export const APP_COMPONENT_URI = vscode.Uri.file(APP_COMPONENT);
export const FOO_TEMPLATE_URI = vscode.Uri.file(FOO_TEMPLATE);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function activate(uri: vscode.Uri) {
  // set default timeout to 30 seconds
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30_000;
  await vscode.window.showTextDocument(uri);
  await waitForDefinitionsToBeAvailable(20);
}

async function waitForDefinitionsToBeAvailable(maxSeconds: number) {
  let tries = 0;
  while (tries < maxSeconds) {
    const position = new vscode.Position(4, 25);
    // For a complete list of standard commands, see
    // https://code.visualstudio.com/api/references/commands
    const definitions = await vscode.commands.executeCommand<vscode.LocationLink[]>(
      DEFINITION_COMMAND,
      APP_COMPONENT_URI,
      position,
    );
    if (definitions && definitions.length > 0) {
      return;
    }
    tries++;
    await sleep(1000);
  }
}
