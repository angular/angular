import type * as vscode from 'vscode';

import {
  InlineStylesDocCache,
  createFallbackColorPresentations,
  normalizeColorPresentations,
  selectColorPresentations,
} from '../inline_styles_support';

describe('inline styles support helpers', () => {
  it('normalizes provider presentations to the requested range', () => {
    const range = makeRange(1, 2, 1, 7);
    const provider = [{label: 'rgb(1 2 3)'} as vscode.ColorPresentation];

    const actual = normalizeColorPresentations(provider, range);

    expect(actual.length).toBe(1);
    expect(actual[0].textEdit?.range).toEqual(range);
  });

  it('uses provider presentation when available', () => {
    const range = makeRange(0, 0, 0, 3);
    const color = makeColor(1, 0, 0, 1);
    const provider = [{label: 'from-provider'} as vscode.ColorPresentation];

    const actual = selectColorPresentations(provider, color, range);

    expect(actual.length).toBe(1);
    expect(actual[0].textEdit?.newText).toBe('from-provider');
  });

  it('falls back when provider returns no presentations', () => {
    const range = makeRange(0, 0, 0, 3);
    const color = makeColor(200 / 255, 200 / 255, 200 / 255, 0.5);

    const actual = selectColorPresentations([], color, range);

    expect(actual.length).toBe(1);
    expect(actual[0].textEdit?.newText).toContain('rgb(');
  });

  it('reuses cached inline styles document for same source version and invalidates', () => {
    const cache = new InlineStylesDocCache();
    const sourceUri = 'file:///tmp/source.ts';
    const doc = {
      uri: {toString: () => 'untitled:InlineStyles-1'} as vscode.Uri,
      version: 1,
    } as vscode.TextDocument;

    cache.set(sourceUri, 7, doc);
    const first = cache.get(sourceUri, 7);
    const miss = cache.get(sourceUri, 8);

    expect(first).toBe(doc);
    expect(miss).toBeNull();

    cache.invalidate(sourceUri);
    const afterInvalidate = cache.get(sourceUri, 7);
    expect(afterInvalidate).toBeNull();
  });

  it('creates fallback color presentation with text edit', () => {
    const range = makeRange(3, 1, 3, 9);
    const color = makeColor(2 / 255, 2 / 255, 2 / 255, 1);

    const actual = createFallbackColorPresentations(color, range);

    expect(actual.length).toBe(1);
    expect(actual[0].textEdit).toBeDefined();
    expect(actual[0].textEdit?.range).toEqual(range);
  });
});

function makeRange(
  startLine: number,
  startCharacter: number,
  endLine: number,
  endCharacter: number,
): vscode.Range {
  return {
    start: {line: startLine, character: startCharacter} as vscode.Position,
    end: {line: endLine, character: endCharacter} as vscode.Position,
  } as vscode.Range;
}

function makeColor(red: number, green: number, blue: number, alpha: number): vscode.Color {
  return {red, green, blue, alpha} as vscode.Color;
}
