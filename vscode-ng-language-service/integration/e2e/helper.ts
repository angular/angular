import {setTimeout} from 'node:timers/promises';
import * as vscode from 'vscode';

import {
  APP_COMPONENT,
  DIAGNOSTICS_TEST_COMPONENT,
  DIAGNOSTICS_TEST_TEMPLATE,
  FOO_TEMPLATE,
} from '../test_constants';

export const COMPLETION_COMMAND = 'vscode.executeCompletionItemProvider';
export const HOVER_COMMAND = 'vscode.executeHoverProvider';
export const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
export const APP_COMPONENT_URI = vscode.Uri.file(APP_COMPONENT);
export const FOO_TEMPLATE_URI = vscode.Uri.file(FOO_TEMPLATE);
export const DIAGNOSTICS_TEST_COMPONENT_URI = vscode.Uri.file(DIAGNOSTICS_TEST_COMPONENT);
export const DIAGNOSTICS_TEST_TEMPLATE_URI = vscode.Uri.file(DIAGNOSTICS_TEST_TEMPLATE);

export async function activate(uri: vscode.Uri): Promise<void> {
  await vscode.window.showTextDocument(uri);
  // This is needed for stabilization and to reduce flakes.
  // The timeout gives the language server time to warm up.
  await setTimeout(3_000);
}

/**
 * Get Angular diagnostics (source === 'ngtsc') for the given URI.
 * Should be called after `activate()` which gives the LS time to warm up.
 */
export function getAngularDiagnostics(uri: vscode.Uri): vscode.Diagnostic[] {
  return vscode.languages.getDiagnostics(uri).filter((d) => d.source === 'ngtsc');
}
