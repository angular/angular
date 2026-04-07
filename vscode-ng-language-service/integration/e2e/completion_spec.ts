/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';

import {activate, COMPLETION_COMMAND, FOO_TEMPLATE_URI} from './helper';

describe('Angular LS completions', () => {
  beforeAll(async () => {
    await activate(FOO_TEMPLATE_URI);
  });

  it(`does not duplicate HTML completions in external templates`, async () => {
    const position = new vscode.Position(0, 0);
    const completionItem = await vscode.commands.executeCommand<vscode.CompletionList>(
      COMPLETION_COMMAND,
      FOO_TEMPLATE_URI,
      position,
    );
    const regionCompletions = completionItem?.items?.filter((i) => i.label === '#region') ?? [];
    expect(regionCompletions.length).toBe(1);
  });
});
