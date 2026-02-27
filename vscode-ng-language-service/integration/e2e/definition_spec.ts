import * as vscode from 'vscode';
import {setTimeout} from 'node:timers/promises';

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
    const definitions = await waitForDefinitionResults(APP_COMPONENT_URI, position);
    expect(definitions.length).toBe(1);
    const def = definitions[0];
    const targetUri = 'targetUri' in def ? def.targetUri : def.uri;
    const targetRange = 'targetRange' in def ? def.targetRange : def.range;
    expect(targetUri.fsPath).toBe(APP_COMPONENT); // in the same document
    const {start, end} = targetRange;
    // `name` property is currently on line 23 in app.component.ts
    expect(start.line).toBe(23);
    expect(end.line).toBe(23);
    expect(start.character).toBe(2);
    expect(end.character).toBe(start.character + `name`.length);
  });
});

async function waitForDefinitionResults(
  uri: vscode.Uri,
  position: vscode.Position,
): Promise<Array<vscode.Location | vscode.LocationLink>> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const definitions =
      (await vscode.commands.executeCommand<Array<vscode.Location | vscode.LocationLink>>(
        DEFINITION_COMMAND,
        uri,
        position,
      )) ?? [];

    if (definitions.length > 0) {
      return definitions;
    }

    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for definitions at ${uri.toString()}`);
}
