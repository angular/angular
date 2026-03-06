import * as vscode from 'vscode';
import {setTimeout} from 'node:timers/promises';

import {activate, APP_COMPONENT_URI, COLOR_COMMAND, COLOR_PRESENTATION_COMMAND} from './helper';

describe('Angular LS inline styles colors', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30_000;

  beforeAll(async () => {
    await activate(APP_COMPONENT_URI);
  });

  it('returns color infos for inline component styles mapped to source TypeScript URI', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const colors = await waitForColors(APP_COMPONENT_URI);

    expect(colors.length).toBe(1);

    const colorTexts = colors.map((colorInfo) => document.getText(colorInfo.range));
    expect(colorTexts).toEqual(['#ff0000']);

    const expectedColorOffset = document.getText().indexOf('#ff0000');
    const expectedColorStart = document.positionAt(expectedColorOffset);
    expect(colors[0].range.start.isEqual(expectedColorStart)).toBeTrue();
  });

  it('returns color infos isolated to style blocks in a multi-style component', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const sourceText = document.getText();
    const colorLiteralOffset = sourceText.indexOf('#ff0000');
    const secondStyleOffset = sourceText.indexOf('.blue {');
    const templateOffset = sourceText.indexOf('Hello {{ name }}');

    expect(colorLiteralOffset).toBeGreaterThan(-1);
    expect(secondStyleOffset).toBeGreaterThan(-1);
    expect(templateOffset).toBeGreaterThan(-1);

    const colorLiteralPosition = document.positionAt(colorLiteralOffset);
    const secondStylePosition = document.positionAt(secondStyleOffset);
    const templatePosition = document.positionAt(templateOffset);

    const colors = await waitForColors(APP_COMPONENT_URI);

    expect(colors.length).toBe(1);

    const hasFirstBlockColor = colors.some((colorInfo) =>
      colorInfo.range.contains(colorLiteralPosition),
    );
    const hasSecondBlockColor = colors.some((colorInfo) =>
      colorInfo.range.contains(secondStylePosition),
    );
    const leaksIntoTemplate = colors.some((colorInfo) =>
      colorInfo.range.contains(templatePosition),
    );

    expect(hasFirstBlockColor).toBeTrue();
    expect(hasSecondBlockColor).toBeFalse();
    expect(leaksIntoTemplate).toBeFalse();
  });

  it('returns color presentations with normalized text edits for inline style ranges', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const colors = await waitForColors(APP_COMPONENT_URI);
    const swatch = colors.find((colorInfo) => document.getText(colorInfo.range) === '#ff0000');

    expect(swatch).toBeDefined();

    const presentations =
      (await vscode.commands.executeCommand<vscode.ColorPresentation[]>(
        COLOR_PRESENTATION_COMMAND,
        swatch!.color,
        {uri: APP_COMPONENT_URI, range: swatch!.range},
      )) ?? [];

    expect(presentations.length).toBeGreaterThan(0);
    expect(
      presentations.some((presentation) => presentation.textEdit?.range.isEqual(swatch!.range)),
    ).toBeTrue();

    for (const presentation of presentations) {
      expect(presentation.label.length).toBeGreaterThan(0);
      expect(presentation.textEdit).toBeDefined();
      expect(presentation.textEdit!.newText.length).toBeGreaterThan(0);
      expect(presentation.textEdit!.range.isEqual(swatch!.range)).toBeTrue();
    }
  });

  it('does not return color presentations outside inline styles', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const sourceText = document.getText();
    const templateOffset = sourceText.indexOf('Hello {{ name }}');

    expect(templateOffset).toBeGreaterThan(-1);

    const templateStart = document.positionAt(templateOffset);
    const templateRange = new vscode.Range(templateStart, templateStart.translate(0, 5));

    const presentations =
      (await vscode.commands.executeCommand<vscode.ColorPresentation[]>(
        COLOR_PRESENTATION_COMMAND,
        new vscode.Color(1, 0, 0, 1),
        {uri: APP_COMPONENT_URI, range: templateRange},
      )) ?? [];

    expect(presentations.length).toBe(0);
  });
});

async function waitForColors(uri: vscode.Uri): Promise<vscode.ColorInformation[]> {
  const timeoutMs = 20_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const colors =
      (await vscode.commands.executeCommand<vscode.ColorInformation[]>(COLOR_COMMAND, uri)) ?? [];
    if (colors.length > 0) {
      return colors;
    }
    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for colors at ${uri.toString()}`);
}
