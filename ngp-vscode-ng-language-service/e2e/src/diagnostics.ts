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

  await runCleanStateTest(workspaceRoot);
  await runSingleDiagnosticTest(workspaceRoot);
  await runMultipleDiagnosticsTest(workspaceRoot);
  await runDiagnosticsSideFileTest(workspaceRoot);
}

async function runCleanStateTest(workspaceRoot: string) {
  const testFilePath = path.join(workspaceRoot, 'diagnostics_clean_test.ts');
  const uri = vscode.Uri.file(testFilePath);

  const fileContent = `
    import {Component} from '@angular/core';
    @Component({
      selector: 'app-diag-clean-test',
      template: '<div>Hello World</div>',
      standalone: true,
    })
    export class AppDiagCleanTestComponent {}
  `;

  console.log(`Creating clean file: ${testFilePath}`);
  await fs.writeFile(testFilePath, fileContent);

  try {
    console.log(`Open clean file: ${testFilePath}`);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Checking for no diagnostics...`);
    const diagnostics = vscode.languages.getDiagnostics(uri);
    const filteredDiagnostics = diagnostics.filter(
      (d) => !d.message.includes('_t1') && !d.message.includes('Identifier expected'),
    );
    console.log(`Found diagnostics: ${diagnostics.map((d) => d.message).join(', ')}`);
    console.log(`Filtered diagnostics: ${filteredDiagnostics.map((d) => d.message).join(', ')}`);
    assert.strictEqual(
      filteredDiagnostics.length,
      0,
      `Should return zero diagnostics for clean file after filtering noise, but found: ${filteredDiagnostics.map((d) => d.message).join(', ')}`,
    );
    console.log('Clean state test passed!');
  } finally {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await cleanupFile(testFilePath);
  }
}

async function runSingleDiagnosticTest(workspaceRoot: string) {
  const testFilePath = path.join(workspaceRoot, 'diagnostics_single_test.ts');
  const uri = vscode.Uri.file(testFilePath);

  const fileContent = `
    import {Component} from '@angular/core';
    @Component({
      selector: 'app-diag-single-test',
      template: '<div>{{ nonExistentProp }}</div>',
      standalone: true,
    })
    export class AppDiagSingleTestComponent {}
  `;

  console.log(`Creating file with single error: ${testFilePath}`);
  await fs.writeFile(testFilePath, fileContent);

  try {
    console.log(`Open file: ${testFilePath}`);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Making dummy edit...');
    await vscode.window.activeTextEditor?.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), '// Dummy comment\n');
    });
    await document.save();

    console.log(`Waiting for diagnostics...`);
    const diagnostics = await waitFor(
      () => vscode.languages.getDiagnostics(uri),
      (diags) => diags.length > 0,
      {timeout: 10000},
    );

    assert.ok(diagnostics.length > 0, 'Should return at least one diagnostic');
    const found = diagnostics.find((d) => d.message.includes('nonExistentProp'));
    assert.ok(found, 'Should find a diagnostic mentioning nonExistentProp');
    console.log('Single diagnostic test passed!');
  } finally {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await cleanupFile(testFilePath);
  }
}

async function runMultipleDiagnosticsTest(workspaceRoot: string) {
  const testFilePath = path.join(workspaceRoot, 'diagnostics_multi_test.ts');
  const uri = vscode.Uri.file(testFilePath);

  const fileContent = `
    import {Component} from '@angular/core';
    @Component({
      selector: 'app-diag-multi-test',
      template: '<div>{{ prop1 }}</div><div>{{ prop2 }}</div>',
      standalone: true,
    })
    export class AppDiagMultiTestComponent {}
  `;

  console.log(`Creating file with multiple errors: ${testFilePath}`);
  await fs.writeFile(testFilePath, fileContent);

  try {
    console.log(`Open file: ${testFilePath}`);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Making dummy edit...');
    await vscode.window.activeTextEditor?.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), '// Dummy comment\n');
    });
    await document.save();

    console.log(`Waiting for diagnostics...`);
    const diagnostics = await waitFor(
      () => vscode.languages.getDiagnostics(uri),
      (diags) => diags.length >= 2,
      {timeout: 10000},
    );

    assert.ok(diagnostics.length >= 2, 'Should return at least two diagnostics');
    const found1 = diagnostics.find((d) => d.message.includes('prop1'));
    const found2 = diagnostics.find((d) => d.message.includes('prop2'));
    assert.ok(found1, 'Should find a diagnostic mentioning prop1');
    assert.ok(found2, 'Should find a diagnostic mentioning prop2');
    console.log('Multiple diagnostics test passed!');
  } finally {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await cleanupFile(testFilePath);
  }
}

async function runDiagnosticsSideFileTest(workspaceRoot: string) {
  const tsFilePath = path.join(workspaceRoot, 'app_diag_side_test.ts');
  const htmlFilePath = path.join(workspaceRoot, 'app_diag_side_test.html');
  const tsUri = vscode.Uri.file(tsFilePath);
  const htmlUri = vscode.Uri.file(htmlFilePath);

  const appTsContent = `
    import {Component} from '@angular/core';
    @Component({
      selector: 'app-diag-side-test',
      templateUrl: './app_diag_side_test.html',
      standalone: true,
    })
    export class AppDiagSideTestComponent {}
  `;
  const templateContent = '<div>{{ nonExistentProp }}</div>';

  console.log(`Creating side-file test files`);
  await Promise.all([
    fs.writeFile(tsFilePath, appTsContent),
    fs.writeFile(htmlFilePath, templateContent),
  ]);

  try {
    console.log(`Open file: ${tsFilePath}`);
    const document = await vscode.workspace.openTextDocument(tsUri);
    await vscode.window.showTextDocument(document);

    const htmlDoc = await vscode.workspace.openTextDocument(htmlUri);
    await vscode.window.showTextDocument(htmlDoc);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Making dummy edit to trigger analysis...');
    const dummyEdit = new vscode.WorkspaceEdit();
    dummyEdit.insert(tsUri, new vscode.Position(0, 0), '// Dummy comment\n');
    await vscode.workspace.applyEdit(dummyEdit);
    await document.save();

    console.log(`Waiting for diagnostics on HTML file...`);
    const htmlDiagnostics = await waitFor(
      () => vscode.languages.getDiagnostics(htmlUri),
      (diags) => diags.length > 0,
      {timeout: 10000},
    );

    assert.ok(htmlDiagnostics.length > 0, 'Should return at least one diagnostic for HTML file');
    assert.ok(
      htmlDiagnostics.some((d) => d.message.includes('nonExistentProp')),
      'Should find a diagnostic mentioning nonExistentProp on HTML file',
    );

    // Now fix the error by changing template or adding property.
    const fixedTsContent = `
      import {Component} from '@angular/core';
      @Component({
        selector: 'app-diag-side-test',
        templateUrl: './app_diag_side_test.html',
        standalone: true,
      })
      export class AppDiagSideTestComponent {
        nonExistentProp = 'hello';
      }
    `;

    console.log('Applying fix to TS file...');
    const fixEdit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length),
    );
    fixEdit.replace(tsUri, fullRange, fixedTsContent);
    await vscode.workspace.applyEdit(fixEdit);
    await document.save();

    // Show HTML document and trigger re-evaluation
    const htmlEditor = await vscode.window.showTextDocument(htmlDoc);
    await htmlEditor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), ' ');
    });
    await htmlDoc.save();

    console.log(`Waiting for diagnostics on HTML file to clear...`);
    const clearedDiagnostics = await waitFor(
      () => vscode.languages.getDiagnostics(htmlUri),
      (diags) => diags.length === 0,
      {timeout: 10000},
    );

    assert.strictEqual(clearedDiagnostics.length, 0, 'Should clear diagnostics for HTML file');
    console.log('Side-file diagnostic test passed!');
  } finally {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await Promise.all([cleanupFile(tsFilePath), cleanupFile(htmlFilePath)]);
  }
}

async function cleanupFile(filePath: string) {
  console.log(`Cleaning up file: ${filePath}`);
  await fs.rm(filePath, {force: true});
}
