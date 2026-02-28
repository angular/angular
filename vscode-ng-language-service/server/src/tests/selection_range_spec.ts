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
  getSnapshot(): {getLength(): number; getText(start: number, end: number): string};
  path?: string;
}

function createMockScriptInfo(fileName: string, text: string = ''): MockScriptInfo {
  return {
    fileName,
    path: fileName,
    lineOffsetToPosition(line: number, offset: number): number {
      return line === 1 ? offset - 1 : 0;
    },
    positionToLineOffset(position: number): {line: number; offset: number} {
      return {line: 1, offset: position + 1};
    },
    getSnapshot() {
      return {
        getLength() {
          return text.length;
        },
        getText(start: number, end: number) {
          return text.substring(start, end);
        },
      };
    },
  };
}

function createMockSession(
  selectionByOffset: Map<number, {textSpan: {start: number; length: number}; parent?: unknown}>,
  options?: {fileName?: string; text?: string},
): Session {
  const scriptInfo = createMockScriptInfo(
    options?.fileName ?? '/project/app.html',
    options?.text ?? '',
  );
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

  it('delegates to HTML/CSS selection ranges for html documents when Angular has no range', () => {
    const html = '<div style="color: red"></div>';
    const session = createMockSession(new Map(), {
      fileName: '/project/app.html',
      text: html,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.html'},
      positions: [lsp.Position.create(0, 19)],
    });

    expect(result).withContext('Expected one delegated range').not.toBeNull();
    expect(result?.length).toBe(1);

    const delegated = result?.[0];
    expect(delegated).toBeDefined();
    expect(delegated?.range.start.character)
      .withContext('Delegated innermost range should start at CSS declaration content')
      .toBe(12);
    expect(delegated?.range.end.character)
      .withContext('Delegated innermost range should end at red token')
      .toBe(22);
  });

  it('delegates CSS token stop for [style.color] string literal content', () => {
    const tsTemplate = `@Component({template: \`<div [style.color]="'rgb(255, 255, 255)'"></div>\`})`;
    const cursorOffset = tsTemplate.indexOf('255, 255, 255');
    const session = createMockSession(new Map(), {
      fileName: '/project/app.ts',
      text: tsTemplate,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.ts'},
      positions: [lsp.Position.create(0, cursorOffset)],
    });

    expect(result).withContext('Expected one delegated range').not.toBeNull();
    expect(result?.length).toBe(1);
    expect(result?.[0]).toBeDefined();
    expect(result?.[0].range.start.character)
      .withContext('Expected first CSS token stop at first 255')
      .toBe(cursorOffset);
    expect(result?.[0].range.end.character)
      .withContext('Expected first CSS token stop to select `255`')
      .toBe(cursorOffset + 3);
  });

  it('delegates CSS token stop for [style] object-literal value content', () => {
    const tsTemplate = `@Component({template: \`<div [style]="{'padding': '20px', 'margin': '10px'}"></div>\`})`;
    const cursorOffset = tsTemplate.indexOf('20px');
    const session = createMockSession(new Map(), {
      fileName: '/project/app.ts',
      text: tsTemplate,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.ts'},
      positions: [lsp.Position.create(0, cursorOffset)],
    });

    expect(result).withContext('Expected one delegated range').not.toBeNull();
    expect(result?.length).toBe(1);
    expect(result?.[0]).toBeDefined();
    expect(result?.[0].range.start.character)
      .withContext('Expected delegated stop at 20px value start')
      .toBe(cursorOffset);
    expect(result?.[0].range.end.character)
      .withContext('Expected delegated stop to select `20px`')
      .toBe(cursorOffset + 4);
  });

  it('delegates key token stop for [ngStyle] object-literal key content', () => {
    const tsTemplate = `@Component({template: \`<div [ngStyle]="{'border': '1px solid red'}"></div>\`})`;
    const cursorOffset = tsTemplate.indexOf('border');
    const session = createMockSession(new Map(), {
      fileName: '/project/app.ts',
      text: tsTemplate,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.ts'},
      positions: [lsp.Position.create(0, cursorOffset)],
    });

    expect(result).withContext('Expected one delegated range').not.toBeNull();
    expect(result?.length).toBe(1);
    expect(result?.[0]).toBeDefined();
    expect(result?.[0].range.start.character)
      .withContext('Expected delegated stop at border key start')
      .toBe(cursorOffset);
    expect(result?.[0].range.end.character)
      .withContext('Expected delegated stop to select `border`')
      .toBe(cursorOffset + 6);
  });

  it('delegates CSS token stop for [style] double-quoted object literal values', () => {
    const tsTemplate = `@Component({template: \`<div [style]='{"padding": "24px"}'></div>\`})`;
    const cursorOffset = tsTemplate.indexOf('24px');
    const session = createMockSession(new Map(), {
      fileName: '/project/app.ts',
      text: tsTemplate,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.ts'},
      positions: [lsp.Position.create(0, cursorOffset)],
    });

    expect(result).withContext('Expected one delegated range').not.toBeNull();
    expect(result?.length).toBe(1);
    expect(result?.[0]).toBeDefined();
    expect(result?.[0].range.start.character)
      .withContext('Expected delegated stop at 24px value start')
      .toBe(cursorOffset);
    expect(result?.[0].range.end.character)
      .withContext('Expected delegated stop to select `24px`')
      .toBe(cursorOffset + 4);
  });

  it('does not apply CSS delegation to non-style bindings', () => {
    const tsTemplate = `@Component({template: \`<div [title]="'rgb(255, 255, 255)'"></div>\`})`;
    const cursorOffset = tsTemplate.indexOf('255, 255, 255');
    const session = createMockSession(new Map(), {
      fileName: '/project/app.ts',
      text: tsTemplate,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.ts'},
      positions: [lsp.Position.create(0, cursorOffset)],
    });

    expect(result).withContext('Expected one range result').not.toBeNull();
    expect(result?.length).toBe(1);
    // With no Angular chain in this mock and no style-context delegation,
    // handler should keep the empty-position fallback.
    expect(result?.[0].range.start.character).toBe(cursorOffset);
    expect(result?.[0].range.end.character).toBe(cursorOffset);
  });

  it('delegates CSS token stop for multiline [ngStyle] object-literal values', () => {
    const tsTemplate = `@Component({template: \`<div [ngStyle]="{
      'padding': '10px',
      'margin': '8px'
    }"></div>\`})`;
    const cursorOffset = tsTemplate.indexOf('10px');
    const session = createMockSession(new Map(), {
      fileName: '/project/app.ts',
      text: tsTemplate,
    });

    const result = onSelectionRange(session, {
      textDocument: {uri: 'file:///project/app.ts'},
      positions: [lsp.Position.create(0, cursorOffset)],
    });

    expect(result).withContext('Expected one delegated range').not.toBeNull();
    expect(result?.length).toBe(1);
    expect(result?.[0]).toBeDefined();
    expect(result?.[0].range.start.character).toBe(cursorOffset);
    expect(result?.[0].range.end.character).toBe(cursorOffset + 4);
  });
});
