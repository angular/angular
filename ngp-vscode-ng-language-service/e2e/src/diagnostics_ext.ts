import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs/promises';
import {waitFor} from './utils';

export async function run() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace root found');
  }

  const extTsFilePath = path.join(workspaceRoot, 'diagnostics_ext_test.ts');
  const extTsUri = vscode.Uri.file(extTsFilePath);
  const extHtmlFilePath = path.join(workspaceRoot, 'diagnostics_ext_test.html');
  const extHtmlUri = vscode.Uri.file(extHtmlFilePath);

  const extTsContent = `
    import {Component} from '@angular/core';
    @Component({
      selector: 'app-diag-ext-test',
      templateUrl: './diagnostics_ext_test.html',
      standalone: true,
    })
    export class AppDiagExtTestComponent {
      name: string = "hello";
    }
  `;

  const extHtmlContent = `<div>{{ nonExistentProp }}</div>`;

  console.log(`Creating files: ${extHtmlFilePath}, ${extTsFilePath}`);
  await Promise.all([
    fs.writeFile(extHtmlFilePath, extHtmlContent),
    fs.writeFile(extTsFilePath, extTsContent),
  ]);

  try {
    console.log(`Open external test TS file: ${extTsFilePath}`);
    const tsDoc = await vscode.workspace.openTextDocument(extTsUri);
    await vscode.window.showTextDocument(tsDoc);

    // Wait for server to analyze TS file
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Open external test HTML file: ${extHtmlFilePath}`);
    const htmlDoc = await vscode.workspace.openTextDocument(extHtmlUri);
    await vscode.window.showTextDocument(htmlDoc);

    console.log(`Waiting for diagnostics on HTML file...`);
    const diagnostics = await waitFor(
      () => vscode.languages.getDiagnostics(extHtmlUri),
      (diags) => diags.length > 0,
      {timeout: 10000},
    );

    assert.ok(diagnostics.length > 0, 'Should return at least one diagnostic');

    const found = diagnostics.find((d) => d.message.includes('nonExistentProp'));
    assert.ok(
      found,
      `Should find a diagnostic mentioning nonExistentProp. Available diagnostics: ${diagnostics.map((d) => d.message).join(', ')}`,
    );

    console.log(`Found expected diagnostic: ${found.message}`);
    assert.strictEqual(found.range.start.line, 0, 'Diagnostic should be on line 0 (template)');
  } finally {
    console.log(`Cleaning up files...`);
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');

    await Promise.all([fs.rm(extTsFilePath, {force: true}), fs.rm(extHtmlFilePath, {force: true})]);
  }
}
