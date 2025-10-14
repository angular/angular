'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
const vscode_languageserver_textdocument_1 = require('vscode-languageserver-textdocument');
const embedded_support_1 = require('../embedded_support');
describe('embedded language support', () => {
  describe('isInsideAngularContext', () => {
    it('empty file', () => {
      test('¦', embedded_support_1.isNotTypescriptOrSupportedDecoratorField, false);
    });
    it('just after template', () => {
      test(
        `const foo = {template: '<div></div>'¦}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });
    it('inside template', () => {
      test(
        `const foo = {template: '<div>¦</div>'}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });
    it('just after templateUrl', () => {
      test(
        `const foo = {templateUrl: './abc.html'¦}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });
    it('inside templateUrl', () => {
      test(
        `const foo = {templateUrl: './abc¦.html'}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });
    it('just after styleUrls', () => {
      test(
        `const foo = {styleUrls: ['./abc.css']¦}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });
    it('inside first item of styleUrls', () => {
      test(
        `const foo = {styleUrls: ['./abc.c¦ss', 'def.css']}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });
    it('inside second item of styleUrls', () => {
      test(
        `const foo = {styleUrls: ['./abc.css', 'def¦.css']}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });
    it('inside second item of styleUrls, when first is complicated function', () => {
      test(
        `const foo = {styleUrls: [getCss({strict: true, dirs: ['apple', 'banana']}), 'def¦.css']}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        true,
      );
    });
    it('inside non-string item of styleUrls', () => {
      test(
        `const foo = {styleUrls: [getCss({strict: true¦, dirs: ['apple', 'banana']}), 'def.css']}`,
        embedded_support_1.isNotTypescriptOrSupportedDecoratorField,
        false,
      );
    });
  });
});
function test(fileWithCursor, testFn, expectation) {
  const {cursor, text} = extractCursorInfo(fileWithCursor);
  const vdoc = vscode_languageserver_textdocument_1.TextDocument.create(
    'test.ts',
    'typescript',
    0,
    text,
  );
  vdoc.fileName = 'test.ts';
  const actual = testFn(vdoc, vdoc.positionAt(cursor));
  expect(actual).toBe(expectation);
}
/**
 * Given a text snippet which contains exactly one cursor symbol ('¦'), extract both the offset of
 * that cursor within the text as well as the text snippet without the cursor.
 */
function extractCursorInfo(textWithCursor) {
  const cursor = textWithCursor.indexOf('¦');
  if (cursor === -1 || textWithCursor.indexOf('¦', cursor + 1) !== -1) {
    throw new Error(`Expected to find exactly one cursor symbol '¦'`);
  }
  return {
    cursor,
    text: textWithCursor.substr(0, cursor) + textWithCursor.substr(cursor + 1),
  };
}
//# sourceMappingURL=embedded_support_spec.js.map
