import * as vscode from 'vscode';
import {setTimeout} from 'node:timers/promises';

import {activate, APP_COMPONENT_URI, REFERENCE_COMMAND} from './helper';

describe('Angular LS inline styles references', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20_000;

  beforeAll(async () => {
    await activate(APP_COMPONENT_URI);
  });

  it('returns same-block references and documents declaration inclusion behavior for includeDeclaration', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();

    const declarationOffset = content.indexOf('$color:');
    const firstUsageOffset = content.indexOf('$color;', declarationOffset + 1);

    expect(declarationOffset).toBeGreaterThan(-1);
    expect(firstUsageOffset).toBeGreaterThan(-1);

    const position = document.positionAt(firstUsageOffset + 1);
    const referencesWithDeclaration = await waitForReferences(APP_COMPONENT_URI, position, true);
    const referencesWithoutDeclaration = await waitForReferences(
      APP_COMPONENT_URI,
      position,
      false,
    );

    expect(referencesWithDeclaration.length).toBe(2);
    expect(referencesWithoutDeclaration.length).toBe(2);

    const declarationStartPos = document.positionAt(declarationOffset);
    const firstUsagePos = document.positionAt(firstUsageOffset);
    const expectedWithDeclaration = [
      `${declarationStartPos.line}:${declarationStartPos.character}`,
      `${firstUsagePos.line}:${firstUsagePos.character}`,
    ];
    const actualWithDeclaration = referencesWithDeclaration
      .map(toPositionKey)
      .sort((a, b) => a.localeCompare(b));

    expect(actualWithDeclaration).toEqual(
      expectedWithDeclaration.sort((a, b) => a.localeCompare(b)),
    );

    const hasDeclarationReferenceWhenIncluded = referencesWithDeclaration.some(
      (ref) =>
        ref.uri.toString() === APP_COMPONENT_URI.toString() &&
        ref.range.start.line === declarationStartPos.line &&
        ref.range.start.character === declarationStartPos.character,
    );
    expect(hasDeclarationReferenceWhenIncluded).toBeTrue();

    const hasDeclarationReferenceWhenExcluded = referencesWithoutDeclaration.some(
      (ref) =>
        ref.uri.toString() === APP_COMPONENT_URI.toString() &&
        ref.range.start.line === declarationStartPos.line &&
        ref.range.start.character === declarationStartPos.character,
    );
    expect(hasDeclarationReferenceWhenExcluded).toBeTrue();

    const actualWithoutDeclaration = referencesWithoutDeclaration
      .map(toPositionKey)
      .sort((a, b) => a.localeCompare(b));
    expect(actualWithoutDeclaration).toEqual(
      expectedWithDeclaration.sort((a, b) => a.localeCompare(b)),
    );
  });

  it('does not leak references across separate inline style blocks', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();

    const declarationOffset = content.indexOf('$color:');
    const firstUsageOffset = content.indexOf('$color;', declarationOffset + 1);
    const secondUsageOffset = content.indexOf('$color;', firstUsageOffset + 1);

    expect(declarationOffset).toBeGreaterThan(-1);
    expect(secondUsageOffset).toBeGreaterThan(-1);

    const secondUsagePosition = document.positionAt(secondUsageOffset + 1);
    const declarationPos = document.positionAt(declarationOffset);

    const references = await waitForReferences(APP_COMPONENT_URI, secondUsagePosition, true);

    expect(references.length).toBe(1);
    expect(toPositionKey(references[0])).toBe(
      `${document.positionAt(secondUsageOffset).line}:${document.positionAt(secondUsageOffset).character}`,
    );

    const leaksFirstBlockDeclaration = references.some(
      (ref) =>
        ref.uri.toString() === APP_COMPONENT_URI.toString() &&
        ref.range.start.line === declarationPos.line &&
        ref.range.start.character === declarationPos.character,
    );

    expect(leaksFirstBlockDeclaration).toBeFalse();
  });
});

function toPositionKey(reference: vscode.Location): string {
  expect(reference.uri.toString()).toBe(APP_COMPONENT_URI.toString());
  return `${reference.range.start.line}:${reference.range.start.character}`;
}

async function waitForReferences(
  uri: vscode.Uri,
  position: vscode.Position,
  includeDeclaration: boolean,
): Promise<vscode.Location[]> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const references =
      (await vscode.commands.executeCommand<vscode.Location[]>(REFERENCE_COMMAND, uri, position, {
        includeDeclaration,
      })) ?? [];

    if (references.length > 0) {
      return references;
    }

    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for references at ${uri.toString()}`);
}
