/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver';

import {onSelectionRange} from '../handlers/selection_range';
import {Session} from '../session';

interface MockScriptInfo {
  fileName: string;
  lineOffsetToPosition(line: number, offset: number): number;
  positionToLineOffset(position: number): {line: number; offset: number};
}

function createMockScriptInfo(fileName: string): MockScriptInfo {
  return {
    fileName,
    lineOffsetToPosition(line: number, offset: number): number {
      return line === 1 ? offset - 1 : 0;
    },
    positionToLineOffset(position: number): {line: number; offset: number} {
      return {line: 1, offset: position + 1};
    },
  };
}

function createMockSession(
  selectionByOffset: Map<number, {textSpan: {start: number; length: number}; parent?: unknown}>,
): Session {
  const scriptInfo = createMockScriptInfo('/project/app.html');
  const languageService = {
    getSelectionRangeAtPosition(_fileName: string, position: number) {
      return selectionByOffset.get(position);
    },
  };

  const session = {
    getLSAndScriptInfo(): {languageService: unknown; scriptInfo: unknown} {
      return {
        languageService,
        scriptInfo,
      };
    },
  };

  return session as unknown as Session;
}

describe('onSelectionRange', () => {
  it('returns one result per input position', () => {
    const session = createMockSession(new Map([[0, {textSpan: {start: 0, length: 4}}]]));

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.html'},
      positions: [lsp.Position.create(0, 0), lsp.Position.create(0, 5)],
    });

    expect(result).withContext('Expected non-null result array').not.toBeNull();
    expect(result?.length).withContext('Result length must match request positions length').toBe(2);
  });

  it('uses empty range at position when TS has no selection range', () => {
    const session = createMockSession(new Map());

    const positions = [lsp.Position.create(0, 1), lsp.Position.create(0, 7)];

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.html'},
      positions,
    });

    expect(result).withContext('Expected non-null result array').not.toBeNull();
    expect(result?.length).toBe(2);

    for (let i = 0; i < positions.length; i++) {
      const entry = result?.[i];
      const expected = positions[i];
      expect(entry).withContext(`Missing entry for index ${i}`).toBeDefined();
      expect(entry?.range.start).toEqual(expected);
      expect(entry?.range.end).toEqual(expected);
    }
  });
});
