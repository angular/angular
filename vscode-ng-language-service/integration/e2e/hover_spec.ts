import * as vscode from 'vscode';

import {activate, FOO_TEMPLATE_URI, HOVER_COMMAND} from './helper';

// This hover tests appear to be the only flaky ones in the suite. Disable until they can
// consistently pass.
xdescribe('Angular Ivy LS quick info', () => {
  beforeAll(async () => {
    await activate(FOO_TEMPLATE_URI);
  });

  it(`returns quick info from built in extension for class in template`, async () => {
    const position = new vscode.Position(1, 8);
    const quickInfo = await vscode.commands.executeCommand<vscode.Hover[]>(
      HOVER_COMMAND,
      FOO_TEMPLATE_URI,
      position,
    );
    expect(quickInfo?.length).toBe(1);
  });
});
