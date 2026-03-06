/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';
import {setTimeout} from 'node:timers/promises';

import {activate, COMPLETION_COMMAND, FOO_TEMPLATE_URI} from './helper';

function toLabelString(label: string | vscode.CompletionItemLabel): string {
  return typeof label === 'string' ? label : label.label;
}

function hasValidCompletionDocumentation(item: vscode.CompletionItem): boolean {
  const documentation = item.documentation;
  return (
    documentation === undefined ||
    typeof documentation === 'string' ||
    documentation instanceof vscode.MarkdownString
  );
}

describe('Angular LS completions', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20_000;

  beforeAll(async () => {
    await activate(FOO_TEMPLATE_URI);
  });

  it(`does not duplicate HTML completions in external templates`, async () => {
    const position = new vscode.Position(1, 1);
    const completionItem = await waitForCompletionsWithLabel(
      FOO_TEMPLATE_URI,
      position,
      'span',
      '<',
    );
    const spanCompletions = completionItem.items.filter((i) => i.label === 'span');
    expect(spanCompletions.length).toBe(1);

    const identityKeys = spanCompletions.map((completion) => {
      const textEditNewText =
        completion.textEdit !== undefined && 'newText' in completion.textEdit
          ? completion.textEdit.newText
          : '';
      const insertText = typeof completion.insertText === 'string' ? completion.insertText : '';
      return `${completion.label}|${completion.kind ?? ''}|${completion.detail ?? ''}|${insertText}|${textEditNewText}`;
    });
    expect(new Set(identityKeys).size).toBe(1);

    const completion = spanCompletions[0];
    const textEditNewText =
      completion.textEdit !== undefined && 'newText' in completion.textEdit
        ? completion.textEdit.newText
        : undefined;
    const insertionText =
      textEditNewText ??
      (typeof completion.insertText === 'string'
        ? completion.insertText
        : toLabelString(completion.label));
    expect(insertionText.toLowerCase()).toContain('span');
    expect(spanCompletions.every((item) => hasValidCompletionDocumentation(item))).toBeTrue();
  });
});

async function waitForCompletions(
  uri: vscode.Uri,
  position: vscode.Position,
  triggerCharacter?: string,
): Promise<vscode.CompletionList | undefined> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const completions = await vscode.commands.executeCommand<vscode.CompletionList>(
      COMPLETION_COMMAND,
      uri,
      position,
      triggerCharacter,
    );
    if ((completions?.items?.length ?? 0) > 0) {
      return completions;
    }
    await setTimeout(pollMs);
  }

  return undefined;
}

async function waitForCompletionsWithLabel(
  uri: vscode.Uri,
  position: vscode.Position,
  expectedLabel: string,
  triggerCharacter?: string,
): Promise<vscode.CompletionList> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const completions = await waitForCompletions(uri, position, triggerCharacter);
    if (
      completions !== undefined &&
      completions.items.some((item) => item.label === expectedLabel)
    ) {
      return completions;
    }
    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for completion label '${expectedLabel}' at ${uri.toString()}`);
}
