import * as vscode from 'vscode';
import {setTimeout} from 'node:timers/promises';

import {activate, FOO_TEMPLATE_URI, HOVER_COMMAND} from './helper';

describe('Angular LS quick info', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20_000;

  beforeAll(async () => {
    await activate(FOO_TEMPLATE_URI);
  });

  it(`returns quick info from built in extension for class in template`, async () => {
    const position = new vscode.Position(1, 1);
    const hovers = await waitForHover(FOO_TEMPLATE_URI, position);

    expect(hovers.length).toBeGreaterThan(0);
    expect(hovers.some((hover) => hover.range?.contains(position) ?? false)).toBeTrue();

    const hoverTexts = hovers.map((hover) => hoverToText(hover).toLowerCase()).join('\n');
    expect(hoverTexts).toContain('span');
  });
});

async function waitForHover(uri: vscode.Uri, position: vscode.Position): Promise<vscode.Hover[]> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const quickInfo =
      (await vscode.commands.executeCommand<vscode.Hover[]>(HOVER_COMMAND, uri, position)) ?? [];
    if (quickInfo.length > 0) {
      return quickInfo;
    }
    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for hover at ${uri.toString()}`);
}

function hoverToText(hover: vscode.Hover): string {
  if (Array.isArray(hover.contents)) {
    return hover.contents.map((content) => markupLikeToText(content)).join('\n');
  }

  return markupLikeToText(hover.contents);
}

function markupLikeToText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (isValueCarrier(content)) {
    return content.value;
  }

  return '';
}

function isValueCarrier(value: unknown): value is {value: string} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    typeof (value as {value?: unknown}).value === 'string'
  );
}
