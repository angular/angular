import * as vscode from 'vscode';

import {APP_COMPONENT} from '../test_constants';

import {activate} from './helper';

const DEFINITION_COMMAND = 'vscode.executeDefinitionProvider';
const APP_COMPONENT_URI = vscode.Uri.file(APP_COMPONENT);

describe('Angular LS', () => {
  beforeAll(async () => {
    await activate(APP_COMPONENT_URI);
  });

  it(`returns definition for variable in template`, async () => {
    // vscode Position is zero-based
    //   template: `<h1>Hello {{ name }}</h1>`,
    //                           ^-------- here
    const position = new vscode.Position(4, 26);
    // For a complete list of standard commands, see
    // https://code.visualstudio.com/api/references/commands
    const definitions = await vscode.commands.executeCommand<vscode.LocationLink[]>(
      DEFINITION_COMMAND,
      APP_COMPONENT_URI,
      position,
    );
    expect(definitions?.length).toBe(1);
    const def = definitions![0];
    expect(def.targetUri.fsPath).toBe(APP_COMPONENT); // in the same document
    const {start, end} = def.targetRange;
    // Should start and end on line 6
    expect(start.line).toBe(8);
    expect(end.line).toBe(8);
    expect(start.character).toBe(2);
    expect(end.character).toBe(start.character + `name`.length);
  });
});
