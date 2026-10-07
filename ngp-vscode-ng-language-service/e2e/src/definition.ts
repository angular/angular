import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import {waitFor} from './utils';

export async function run() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) {
    throw new Error('No workspace root found');
  }

  const testFilePath = path.join(workspaceRoot, 'app.ts');
  const uri = vscode.Uri.file(testFilePath);

  console.log(`Open file: ${testFilePath}`);
  const document = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(document);

  // Test 1: Definition of 'name' in template
  // Line 34 (0-indexed 33): <div>Hello {{ name }}</div>
  // 'n' is at character 18
  const namePosition = new vscode.Position(33, 18);
  console.log(`Querying definition for name at Position(33, 18)...`);

  // Wait for server to be ready
  const nameDefinitions = await waitFor(
    () =>
      vscode.commands.executeCommand<vscode.Location[] | vscode.LocationLink[]>(
        'vscode.executeDefinitionProvider',
        uri,
        namePosition,
      ),
    (defs) => !!defs && defs.length > 0,
  );

  assert.ok(
    nameDefinitions && nameDefinitions.length > 0,
    'Should return at least one definition for name',
  );

  const nameDef = nameDefinitions[0];
  const nameUri = 'uri' in nameDef ? nameDef.uri : nameDef.targetUri;
  const nameRange = 'range' in nameDef ? nameDef.range : nameDef.targetRange;

  console.log(`Definition URI for name: ${nameUri.toString()}`);
  console.log(`Definition Range for name: ${nameRange.start.line}:${nameRange.start.character}`);

  assert.strictEqual(nameUri.fsPath, testFilePath, 'Definition should be in the same file');
  // name is declared on line 63 (0-indexed 62): name = 'Angular LS Test';
  assert.strictEqual(nameRange.start.line, 62, 'Definition line should be 62');

  // Test 2: Definition of 'isSidenavOpen' in click handler
  // Line 40 (0-indexed 39): (click)="isSidenavOpen.set(false)"
  // 'i' is at character 17
  const sidenavPosition = new vscode.Position(39, 17);
  console.log(`Querying definition for isSidenavOpen at Position(39, 17)...`);
  const sidenavDefs = await vscode.commands.executeCommand<
    vscode.Location[] | vscode.LocationLink[]
  >('vscode.executeDefinitionProvider', uri, sidenavPosition);

  assert.ok(
    sidenavDefs && sidenavDefs.length > 0,
    'Should return at least one definition for isSidenavOpen',
  );
  const sidenavDef = sidenavDefs[0];
  const sidenavUri = 'uri' in sidenavDef ? sidenavDef.uri : sidenavDef.targetUri;
  const sidenavRange = 'range' in sidenavDef ? sidenavDef.range : sidenavDef.targetRange;

  assert.strictEqual(sidenavUri.fsPath, testFilePath, 'Definition should be in the same file');
  // isSidenavOpen is declared on line 64 (0-indexed 63): isSidenavOpen = signal(true);
  assert.strictEqual(sidenavRange.start.line, 63, 'Definition line should be 63');

  // Test 3: Definition of 'my-dir-elem' element
  // Line 49 (0-indexed 48): <my-dir-elem></my-dir-elem>
  // 'm' is at character 5
  const myDirElemPosition = new vscode.Position(48, 5);
  console.log(`Querying definition for my-dir-elem at Position(48, 5)...`);
  const myDirElemDefs = await vscode.commands.executeCommand<
    vscode.Location[] | vscode.LocationLink[]
  >('vscode.executeDefinitionProvider', uri, myDirElemPosition);

  assert.ok(
    myDirElemDefs && myDirElemDefs.length > 0,
    'Should return at least one definition for my-dir-elem',
  );
  const myDirElemDef = myDirElemDefs[0];
  const myDirElemUri = 'uri' in myDirElemDef ? myDirElemDef.uri : myDirElemDef.targetUri;
  const myDirElemRange = 'range' in myDirElemDef ? myDirElemDef.range : myDirElemDef.targetRange;

  assert.strictEqual(myDirElemUri.fsPath, testFilePath, 'Definition should be in the same file');
  // MyDirElemComponent starts at class declaration on line 73 (0-indexed 72)
  assert.strictEqual(myDirElemRange.start.line, 72, 'Definition line should be 72');
}
