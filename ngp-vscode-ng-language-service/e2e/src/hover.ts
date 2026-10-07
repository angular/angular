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

  // Position of 'route' declaration (line 35, character 12) -> 0-indexed line 34
  const routeParamPosition = new vscode.Position(34, 12);
  console.log(`Querying hover for route param at Position(34, 12)...`);
  // Check if Angular LS is ready
  // Poll for hover results to wait for server to start
  const routeParamHovers = await waitFor(
    () =>
      vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        uri,
        routeParamPosition,
      ),
    (hovers) => !!hovers && hovers.length > 0,
  );

  assert.ok(
    routeParamHovers && routeParamHovers.length > 0,
    'Should return at least one hover for route param',
  );
  const routeParamHover = routeParamHovers[0];
  const routeParamValue = (routeParamHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for route param: ${routeParamValue}`);
  assert.ok(routeParamValue.includes('title'), 'Hover should include type info for route param');

  // Position of '$index' (line 35, character 33) -> 0-indexed line 34
  const indexPosition = new vscode.Position(34, 33);
  console.log(`Querying hover for $index at Position(34, 33)...`);
  const indexHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    indexPosition,
  );

  assert.ok(indexHovers && indexHovers.length > 0, 'Should return at least one hover for $index');
  const indexHover = indexHovers[0];
  const indexValue = (indexHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for $index: ${indexValue}`);
  assert.ok(
    indexValue.includes('number') || indexValue.includes('unknown'),
    'Hover should include type info for $index',
  );

  const titlePosition = new vscode.Position(43, 60);
  console.log(`Querying hover for route.title at Position(43, 60)...`);
  const titleHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    titlePosition,
  );

  assert.ok(
    titleHovers && titleHovers.length > 0,
    'Should return at least one hover for route.title',
  );
  const titleHover = titleHovers[0];
  const titleValue = (titleHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for route.title: ${titleValue}`);
  assert.ok(titleValue.includes('string'), 'Hover should include type info for title');

  // Position of 'isSidenavOpen' in click handler (line 36, character 90) -> 0-indexed line 35
  const sidenavPosition = new vscode.Position(39, 20);
  console.log(`Querying hover for isSidenavOpen click at Position(39, 20)...`);
  const sidenavHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    sidenavPosition,
  );

  assert.ok(
    sidenavHovers && sidenavHovers.length > 0,
    'Should return at least one hover for isSidenavOpen click',
  );
  const sidenavHover = sidenavHovers[0];
  const sidenavValue = (sidenavHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for isSidenavOpen click: ${sidenavValue}`);
  assert.ok(
    sidenavValue.includes('signal') || sidenavValue.includes('WritableSignal'),
    'Hover should include type info for click',
  );

  // Position of 'set' in click handler (line 40, character 33) -> 0-indexed line 39
  const methodCallPosition = new vscode.Position(39, 32);
  console.log(`Querying hover for isSidenavOpen.set at Position(39, 32)...`);
  const methodCallHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    methodCallPosition,
  );
  assert.ok(
    methodCallHovers && methodCallHovers.length > 0,
    'Should return at least one hover for isSidenavOpen.set',
  );
  const methodCallHover = methodCallHovers[0];
  const methodCallValue = (methodCallHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for isSidenavOpen.set: ${methodCallValue}`);
  assert.ok(methodCallValue.includes('set(value'), 'Hover should include method type info');

  // SafePropertyRead 'data' in 'route?.data' (line 43, character 33) -> 0-indexed line 42
  const safePropReadPosition = new vscode.Position(42, 32);
  console.log(`Querying hover for route?.data at Position(42, 32)...`);

  // Let's get the TCB and log it!
  await vscode.commands.executeCommand('angular.getTemplateTcb');
  const tcbEditor = await waitFor(
    () => vscode.window.visibleTextEditors.find((e) => e.document.uri.scheme === 'ng'),
    (editor) => !!editor,
  );
  if (tcbEditor) {
    console.log(`[DEBUG] TCB Content:\n${tcbEditor.document.getText()}`);
  }

  const safePropReadHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    safePropReadPosition,
  );
  assert.ok(
    safePropReadHovers && safePropReadHovers.length > 0,
    'Should return at least one hover for route?.data',
  );
  const safePropReadHover = safePropReadHovers[0];
  const safePropReadValue = (safePropReadHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for route?.data: ${safePropReadValue}`);
  assert.ok(
    safePropReadValue.includes('icon: string'),
    'Hover should include object type info for data',
  );

  // Hover over routerLink (line 38, character 15) -> 0-indexed line 37, char 14
  const routerLinkPosition = new vscode.Position(37, 14);
  console.log(`Querying hover for routerLink at Position(37, 14)...`);
  const routerLinkHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    routerLinkPosition,
  );
  assert.ok(
    routerLinkHovers && routerLinkHovers.length > 0,
    'Should return at least one hover for routerLink',
  );
  const routerLinkHover = routerLinkHovers[0];
  const routerLinkValue = (routerLinkHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for routerLink: ${routerLinkValue}`);
  assert.ok(
    routerLinkValue.includes('(property) RouterLinkStub.routerLink'),
    `Hover for routerLink should show property info, got: ${routerLinkValue}`,
  );

  // Test for directive element hover in the same file (at the end)
  const myDirElemPosition = new vscode.Position(48, 5);
  console.log(`Querying hover for my-dir-elem at Position(48, 5)...`);
  const myDirElemHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    myDirElemPosition,
  );
  assert.ok(
    myDirElemHovers && myDirElemHovers.length > 0,
    'Should return at least one hover for my-dir-elem',
  );
  const myDirElemHover = myDirElemHovers[0];
  const myDirElemValue = (myDirElemHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for my-dir-elem: ${myDirElemValue}`);
  assert.ok(
    myDirElemValue.includes('(directive) MyDirElemComponent') ||
      myDirElemValue.includes('(component) MyDirElemComponent'),
    `Hover for my-dir-elem should show component info, got: ${myDirElemValue}`,
  );

  // Test for external template
  const externalHtmlFilePath = path.join(workspaceRoot, 'external.html');
  const externalUri = vscode.Uri.file(externalHtmlFilePath);
  console.log(`Open file: ${externalHtmlFilePath}`);
  const externalDocument = await vscode.workspace.openTextDocument(externalUri);
  await vscode.window.showTextDocument(externalDocument);

  // Position of 'externalTitle' in external.html (line 0, character 20)
  const externalTitlePosition = new vscode.Position(0, 20);
  console.log(`Querying hover for externalTitle at Position(0, 20)...`);

  const externalHovers = await waitFor(
    () =>
      vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        externalUri,
        externalTitlePosition,
      ),
    (hovers) => !!hovers && hovers.length > 0,
  );

  assert.ok(
    externalHovers && externalHovers.length > 0,
    'Should return at least one hover for externalTitle',
  );
  const externalHover = externalHovers[0];
  const externalValue = (externalHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for externalTitle: ${externalValue}`);
  assert.ok(
    externalValue.includes('externalTitle') || externalValue.includes('string'),
    'Hover should include type info for externalTitle',
  );

  // Test for attribute directive hover
  const myAttrPosition = new vscode.Position(49, 9);
  console.log(`Querying hover for myAttr at Position(49, 9)...`);
  const myAttrHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    myAttrPosition,
  );
  assert.ok(myAttrHovers && myAttrHovers.length > 0, 'Should return at least one hover for myAttr');
  const myAttrHover = myAttrHovers[0];
  const myAttrValue = (myAttrHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for myAttr: ${myAttrValue}`);
  assert.ok(
    myAttrValue.includes('(directive) MyAttrDirective'),
    `Hover for myAttr should show directive info, got: ${myAttrValue}`,
  );

  // Test for mat-list-item component hover (matched by attribute) - Inside @for
  const matListItemPosition = new vscode.Position(36, 15);
  console.log(`Querying hover for mat-list-item at Position(36, 15)...`);
  const matListItemHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    matListItemPosition,
  );
  assert.ok(
    matListItemHovers && matListItemHovers.length > 0,
    'Should return at least one hover for mat-list-item inside @for',
  );
  const matListItemHover = matListItemHovers[0];
  const matListItemValue = (matListItemHover.contents[0] as vscode.MarkdownString).value;
  console.log(`Hover value for mat-list-item inside @for: ${matListItemValue}`);

  // Test for mat-list-item component hover (matched by attribute) - Outside @for
  const matListItemOutsidePosition = new vscode.Position(47, 10);
  console.log(`Querying hover for mat-list-item at Position(47, 10)...`);
  const matListItemOutsideHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    matListItemOutsidePosition,
  );
  assert.ok(
    matListItemOutsideHovers && matListItemOutsideHovers.length > 0,
    'Should return at least one hover for mat-list-item outside @for',
  );
  const matListItemOutsideValue = (matListItemOutsideHovers[0].contents[0] as vscode.MarkdownString)
    .value;
  console.log(`Hover value for mat-list-item outside @for: ${matListItemOutsideValue}`);

  // Assertions
  assert.ok(
    matListItemValue.includes('MatListItemStub'),
    `Hover for mat-list-item inside @for should show component info, got: ${matListItemValue}`,
  );
  assert.ok(
    matListItemOutsideValue.includes('MatListItemStub'),
    `Hover for mat-list-item outside @for should show component info, got: ${matListItemOutsideValue}`,
  );

  // Test for regular TS class hover (should yield to built-in TS server)
  // Position of 'AppComponent' at line 62, character 15 -> 0-indexed line 61
  const classPosition = new vscode.Position(61, 15);
  console.log(`Waiting for TS server to settle...`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log(`Querying hover for AppComponent class at Position(61, 15)...`);
  const classHovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    uri,
    classPosition,
  );

  console.log(`Class hover count: ${classHovers ? classHovers.length : 0}`);

  assert.ok(
    !classHovers || classHovers.length <= 1,
    `Expected at most 1 hover for regular TS class, but found ${classHovers ? classHovers.length : 0}`,
  );

  // Scenario: Incremental hover with isolated inline template
  console.log(`Testing incremental hover with isolated inline template...`);

  const incFilePath = path.join(workspaceRoot, 'incremental.ts');
  const incUri = vscode.Uri.file(incFilePath);

  console.log(`Open file: ${incFilePath}`);
  const incDocument = await vscode.workspace.openTextDocument(incUri);
  await vscode.window.showTextDocument(incDocument);

  const incEditor = vscode.window.visibleTextEditors.find((e) =>
    e.document.uri.fsPath.endsWith('incremental.ts'),
  );
  assert.ok(incEditor, 'Should find editor for incremental.ts');

  const incNamePosition = new vscode.Position(4, 27);

  const initialHovers = await waitFor(
    () =>
      vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        incUri,
        incNamePosition,
      ),
    (hovers) => !!hovers && hovers.length > 0,
  );

  const initialValue = (initialHovers[0].contents[0] as vscode.MarkdownString).value;
  console.log(`Initial hover value for name in incremental.ts: ${initialValue}`);
  assert.ok(initialValue.includes('string'), 'Hover should include type string');

  await incEditor.edit((editBuilder) => {
    const line = incEditor.document.lineAt(8);
    editBuilder.replace(line.range, '  name = 123;');
  });

  const updatedHovers = await waitFor(
    () =>
      vscode.commands.executeCommand<vscode.Hover[]>(
        'vscode.executeHoverProvider',
        incUri,
        incNamePosition,
      ),
    (hovers) => {
      if (!hovers || hovers.length === 0) return false;
      const val = (hovers[0].contents[0] as vscode.MarkdownString).value;
      return val.includes('number');
    },
  );

  const updatedValue = (updatedHovers[0].contents[0] as vscode.MarkdownString).value;
  console.log(`Updated hover value for name in incremental.ts: ${updatedValue}`);
  assert.ok(updatedValue.includes('number'), 'Hover should reflect virtual content (number)');
}
