/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as vscode from 'vscode';
import {DocumentUri, TextDocument} from 'vscode-languageserver-textdocument';

import {
  getInlineStylesVirtualContent,
  getInlineTemplateVirtualContent,
  getSupportedDecoratorFieldAtPosition,
  isNotTypescriptOrSupportedDecoratorField,
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

    it('inside template when file contains preceding string interpolation', () => {
      test(
        `const something = \`${'xyz'}\`;\nconst foo = {template: \`<div>¦</div>\`}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside tagged template in styles array', () => {
      test(
        `const foo = {styles: [scss\`.a { color: re¦d; }\`]}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside tagged template for template property', () => {
      test(
        `const foo = {template: html\`<div>¦</div>\`}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside direct styles assignment', () => {
      test(
        `@Component({styles: '.test¦Class { color: red; }'}) class Cmp {}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });

    it('inside styles array assignment', () => {
      test(
        `@Component({styles: ['.a { color: red; }', '.b { back¦ground: blue; }']}) class Cmp {}`,
        isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });
  });

  describe('virtual content helpers', () => {
    it('extracts only template content', () => {
      const content = getInlineTemplateVirtualContent(
        `@Component({template: '<div>abc</div>', styles: ['.a { color: red; }']}) class Cmp {}`,
      );
      expect(content.includes('<div>abc</div>')).toBe(true);
      expect(content.includes('.a { color: red; }')).toBe(false);
    });

    it('extracts only styles content', () => {
      const content = getInlineStylesVirtualContent(
        `@Component({template: '<div>abc</div>', styles: ['.a { color: red; }', '.b { color: blue; }']}) class Cmp {}`,
      );
      expect(content.includes('.a { color: red; }')).toBe(true);
      expect(content.includes('.b { color: blue; }')).toBe(true);
      expect(content.includes('<div>abc</div>')).toBe(false);
    });

    it('returns styles field at style cursor', () => {
      const {cursor, text} = extractCursorInfo(
        `@Component({styles: ['.a { color: ¦red; }']}) class Cmp {}`,
      );
      const vdoc = TextDocument.create(
        'test.ts' as DocumentUri,
        'typescript',
        0,
        text,
      ) as {} as vscode.TextDocument;
      (vdoc as any).fileName = 'test.ts';
      const field = getSupportedDecoratorFieldAtPosition(vdoc, vdoc.positionAt(cursor));
      expect(field).toBe('styles');
    });
  });
});

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
