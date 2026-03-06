import {setTimeout} from 'node:timers/promises';
import * as vscode from 'vscode';

import {APP_COMPONENT, FOO_TEMPLATE} from '../test_constants';

export const COMPLETION_COMMAND = 'vscode.executeCompletionItemProvider';
export const HOVER_COMMAND = 'vscode.executeHoverProvider';
export const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
export const REFERENCE_COMMAND = 'vscode.executeReferenceProvider';
export const COLOR_COMMAND = 'vscode.executeDocumentColorProvider';
export const COLOR_PRESENTATION_COMMAND = 'vscode.executeColorPresentationProvider';
export const DOCUMENT_SYMBOL_COMMAND = 'vscode.executeDocumentSymbolProvider';
export const SELECTION_RANGE_COMMAND = 'vscode.executeSelectionRangeProvider';
export const DOCUMENT_HIGHLIGHT_COMMAND = 'vscode.executeDocumentHighlights';
export const CODE_ACTION_COMMAND = 'vscode.executeCodeActionProvider';
export const PREPARE_RENAME_COMMAND = 'vscode.prepareRename';
export const RENAME_COMMAND = 'vscode.executeDocumentRenameProvider';
export const APP_COMPONENT_URI = vscode.Uri.file(APP_COMPONENT);
export const FOO_TEMPLATE_URI = vscode.Uri.file(FOO_TEMPLATE);

export async function activate(uri: vscode.Uri): Promise<void> {
  await vscode.window.showTextDocument(uri);
  await waitForAngularReady(uri);
}

async function waitForAngularReady(uri: vscode.Uri): Promise<void> {
  const timeoutMs = 20_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const symbols =
        (await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
          DOCUMENT_SYMBOL_COMMAND,
          uri,
        )) ?? [];

      if (symbols.length > 0) {
        return;
      }
    } catch {
      // The language server may still be initializing, retry until timeout.
    }

    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for Angular LS readiness for ${uri.toString()}`);
}
