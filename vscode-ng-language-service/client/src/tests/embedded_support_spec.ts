/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type * as vscode from 'vscode';
import {DocumentUri, TextDocument} from 'vscode-languageserver-textdocument';

import {
  isNotTypescriptOrSupportedDecoratorField,
  isNotTypescriptOrSupportedDecoratorRange,
} from '../embedded_support';

describe('embedded language support', () => {
  describe('isInsideAngularContext', () => {
    it('empty file', () => {
      test('¦', isNotTypescriptOrSupportedDecoratorField, false);
    });

    it('just after template', () => {
      test(
        `const foo = {template: '<div></div>'¦}`,
        isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });

    it('inside template', () => {
      test(
        `const foo = {template: '<div>¦</div>'}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('just after templateUrl', () => {
      test(
        `const foo = {templateUrl: './abc.html'¦}`,
        isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });

    it('inside templateUrl', () => {
      test(
        `const foo = {templateUrl: './abc¦.html'}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('just after styleUrls', () => {
      test(
        `const foo = {styleUrls: ['./abc.css']¦}`,
        isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });

    it('inside first item of styleUrls', () => {
      test(
        `const foo = {styleUrls: ['./abc.c¦ss', 'def.css']}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside second item of styleUrls', () => {
      test(
        `const foo = {styleUrls: ['./abc.css', 'def¦.css']}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside second item of styleUrls, when first is complicated function', () => {
      test(
        `const foo = {styleUrls: [getCss({strict: true, dirs: ['apple', 'banana']}), 'def¦.css']}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside non-string item of styleUrls', () => {
      test(
        `const foo = {styleUrls: [getCss({strict: true¦, dirs: ['apple', 'banana']}), 'def.css']}`,
        isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });
  });

  describe('isNotTypescriptOrSupportedDecoratorRange', () => {
    it('returns true for non-TypeScript documents', () => {
      const vdoc = TextDocument.create(
        'test.html' as DocumentUri,
        'html',
        0,
        '<div></div>',
      ) as {} as vscode.TextDocument;
      (vdoc as any).fileName = 'test.html';
      const range = makeRange(vdoc, 0, 5);
      expect(isNotTypescriptOrSupportedDecoratorRange(vdoc, range)).toBeTrue();
    });

    it('returns true when range start is in supported decorator field', () => {
      const source = `const cmp = {template: '<div>foo</div>'};`;
      const vdoc = TextDocument.create(
        'test.ts' as DocumentUri,
        'typescript',
        0,
        source,
      ) as {} as vscode.TextDocument;
      (vdoc as any).fileName = 'test.ts';

      const start = source.indexOf('foo');
      const end = source.indexOf('const');
      const range = makeRange(vdoc, start, end);
      expect(isNotTypescriptOrSupportedDecoratorRange(vdoc, range)).toBeTrue();
    });

    it('returns false when both endpoints are outside supported decorator fields', () => {
      const source = `const cmp = {template: '<div>foo</div>'};\nconst x = 1;`;
      const vdoc = TextDocument.create(
        'test.ts' as DocumentUri,
        'typescript',
        0,
        source,
      ) as {} as vscode.TextDocument;
      (vdoc as any).fileName = 'test.ts';

      const start = source.indexOf('const x');
      const end = source.indexOf('= 1') + 3;
      const range = makeRange(vdoc, start, end);
      expect(isNotTypescriptOrSupportedDecoratorRange(vdoc, range)).toBeFalse();
    });
  });
});

function makeRange(document: vscode.TextDocument, start: number, end: number): vscode.Range {
  return {
    start: document.positionAt(start),
    end: document.positionAt(end),
  } as vscode.Range;
}

function test(
  fileWithCursor: string,
  testFn: (doc: vscode.TextDocument, position: vscode.Position) => boolean,
  expectation: boolean,
): void {
  const {cursor, text} = extractCursorInfo(fileWithCursor);

  const vdoc = TextDocument.create(
    'test.ts' as DocumentUri,
    'typescript',
    0,
    text,
  ) as {} as vscode.TextDocument;
  (vdoc as any).fileName = 'test.ts';
  const actual = testFn(vdoc, vdoc.positionAt(cursor));
  expect(actual).toBe(expectation);
}

/**
 * Given a text snippet which contains exactly one cursor symbol ('¦'), extract both the offset of
 * that cursor within the text as well as the text snippet without the cursor.
 */
function extractCursorInfo(textWithCursor: string): {cursor: number; text: string} {
  const cursor = textWithCursor.indexOf('¦');
  if (cursor === -1 || textWithCursor.indexOf('¦', cursor + 1) !== -1) {
    throw new Error(`Expected to find exactly one cursor symbol '¦'`);
  }

  return {
    cursor,
    text: textWithCursor.substr(0, cursor) + textWithCursor.substr(cursor + 1),
  };
}
