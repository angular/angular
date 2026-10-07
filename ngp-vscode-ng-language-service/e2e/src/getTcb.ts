import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import {waitFor} from './utils';

export async function run() {
  console.log('Running TCB tests...');

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace folder found');
  }

  const appComponentUri = vscode.Uri.file(path.join(workspaceRoot, 'app.ts'));
  const document = await vscode.workspace.openTextDocument(appComponentUri);
  const editor = await vscode.window.showTextDocument(document);

  // Position inside the template (e.g., inside 'track $index' or 'name')
  // Line 34 is @for... let's use line 33 (0-indexed) for $index
  const position = new vscode.Position(33, 20); // $index
  editor.selection = new vscode.Selection(position, position);

  console.log('Executing angular.getTemplateTcb command...');
  await vscode.commands.executeCommand('angular.getTemplateTcb');

  console.log('Waiting for TCB document to open...');
  // Poll for the TCB document to open
  const tcbEditor = await waitFor(
    () => vscode.window.visibleTextEditors.find((e) => e.document.uri.scheme === 'ng'),
    (editor) => !!editor,
  );

  assert.ok(tcbEditor, 'Expected a TCB editor to be open with scheme "ng"');

  const content = tcbEditor.document.getText();
  assert.ok(content.length > 0, 'Expected TCB content to be non-empty');

  // Strict assertions
  assert.ok(
    content.match(/function\s+.*AppComponent/),
    'Expected TCB to contain the component Type Check Function',
  );
  assert.ok(
    content.includes('.routes'),
    'Expected TCB to reference component properties used in the template (routes)',
  );
  assert.ok(
    content.includes('RouterLinkStub'),
    'Expected TCB to reference directive types used in the template (RouterLinkStub)',
  );

  console.log('TCB tests passed!');
}
