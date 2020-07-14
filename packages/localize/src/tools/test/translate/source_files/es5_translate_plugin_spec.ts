/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵcomputeMsgId, ɵparseTranslation} from '@angular/localize';
import {transformSync} from '@babel/core';

import {Diagnostics} from '../../../src/diagnostics';
import {makeEs5TranslatePlugin} from '../../../src/translate/source_files/es5_translate_plugin';

describe('makeEs5Plugin', () => {
  describe('(no translations)', () => {
    it('should transform `$localize` calls with binary expression', () => {
      const diagnostics = new Diagnostics();
      const input = 'const b = 10;\n$localize(["try\\n", "\\n  me"], 40 + b);';
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('const b = 10;\n"try\\n" + (40 + b) + "\\n  me";');
    });

    it('should strip meta blocks', () => {
      const diagnostics = new Diagnostics();
      const input =
          'const b = 10;\n$localize([":description:try\\n", ":placeholder:\\n  me"], 40 + b);';
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('const b = 10;\n"try\\n" + (40 + b) + "\\n  me";');
    });

    it('should not strip escaped meta blocks', () => {
      const diagnostics = new Diagnostics();
      const input =
          `$localize(__makeTemplateObject([':desc:try', 'me'], ['\\\\\\:desc:try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('":desc:try" + (40 + 2) + "me";');
    });

    it('should transform nested `$localize` calls', () => {
      const diagnostics = new Diagnostics();
      const input = '$localize(["a", "b", "c"], 1, $localize(["x", "y", "z"], 5, 6));';
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('"a" + 1 + "b" + ("x" + 5 + "y" + 6 + "z") + "c";');
    });

    it('should transform calls inside functions', () => {
      const diagnostics = new Diagnostics();
      const input = 'function foo() { $localize(["a", "b", "c"], 1, 2); }';
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('function foo() {\n  "a" + 1 + "b" + 2 + "c";\n}');
    });

    it('should ignore tags with the wrong name', () => {
      const diagnostics = new Diagnostics();
      const input = 'other(["a", "b", "c"], 1, 2);';
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('other(["a", "b", "c"], 1, 2);');
    });

    it('should transform calls with different function name configured', () => {
      const diagnostics = new Diagnostics();
      const input = 'other(["a", "b", "c"], 1, 2);';
      const output = transformSync(
          input, {plugins: [makeEs5TranslatePlugin(diagnostics, {}, {localizeName: 'other'})]})!;
      expect(output.code).toEqual('"a" + 1 + "b" + 2 + "c";');
    });

    it('should ignore tags if the identifier is not global', () => {
      const diagnostics = new Diagnostics();
      const input = 'function foo($localize) { $localize(["a", "b", "c"], 1, 2); }';
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code)
          .toEqual('function foo($localize) {\n  $localize(["a", "b", "c"], 1, 2);\n}');
    });

    it('should handle template object helper calls', () => {
      const diagnostics = new Diagnostics();
      const input = `$localize(__makeTemplateObject(['try', 'me'], ['try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle template object aliased helper calls', () => {
      const diagnostics = new Diagnostics();
      const input = `$localize(m(['try', 'me'], ['try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle template object inline helper calls', () => {
      const diagnostics = new Diagnostics();
      const input =
          `$localize((this&&this.__makeTemplateObject||function(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e})(['try', 'me'], ['try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle cached helper calls', () => {
      const diagnostics = new Diagnostics();
      const input =
          `$localize(cachedObj||(cachedObj=__makeTemplateObject(['try', 'me'],['try', 'me'])),40 + 2)`;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle minified code', () => {
      const diagnostics = new Diagnostics();
      const input = `$localize(
        cachedObj||
        (
          cookedParts=['try', 'me'],
          rawParts=['try', 'me'],
          Object.defineProperty?
            Object.defineProperty(cookedParts,"raw",{value:rawParts}):
            cookedParts.raw=rawParts,
          cachedObj=cookedParts
        ),40 + 2)`;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle lazy-load helper calls', () => {
      const diagnostics = new Diagnostics();
      const input = `
      function _templateObject2() {
        var e = _taggedTemplateLiteral([':escaped-colons:Welcome to the i18n app.'], ['\\\\\\:escaped-colons:Welcome to the i18n app.']);
        return _templateObject2 = function() { return e }, e
      }
      function _templateObject() {
        var e = _taggedTemplateLiteral([' Hello ', ':INTERPOLATION:! ']);
        return _templateObject = function() { return e }, e
      }
      function _taggedTemplateLiteral(e, t) {
        return t || (t = e.slice(0)),
               Object.freeze(Object.defineProperties(e, {raw: {value: Object.freeze(t)}}))
      }
      const message = $localize(_templateObject2());
      function foo() {
        console.log($localize(_templateObject(), '\ufffd0\ufffd'));
      }
      `;
      const output = transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, {})]})!;
      expect(output.code).toContain('const message = ":escaped-colons:Welcome to the i18n app."');
      expect(output.code).toContain('console.log(" Hello " + \'\ufffd0\ufffd\' + "! ");');
      expect(output.code).not.toContain('templateObject');
      expect(output.code).not.toContain('templateObject2');
    });

    it('should add diagnostic error with code-frame information if the arguments to `$localize` are missing',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize()';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message: '/app/dist/test.js: `$localize` called without any arguments.\n' +
               '> 1 | $localize()\n' +
               '    | ^^^^^^^^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if the arguments to `$localize` are invalid',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(...x)';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message: '/app/dist/test.js: Unexpected argument to `$localize` (expected an array).\n' +
               '> 1 | $localize(...x)\n' +
               '    |           ^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if the first argument to `$localize` is not an array',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(null, [])';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               '/app/dist/test.js: Unexpected messageParts for `$localize` (expected an array of strings).\n' +
               '> 1 | $localize(null, [])\n' +
               '    |           ^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if raw message parts are not an expression',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(__makeTemplateObject([], ...[]))';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               '/app/dist/test.js: Unexpected `raw` argument to the "makeTemplateObject()" function (expected an expression).\n' +
               '> 1 | $localize(__makeTemplateObject([], ...[]))\n' +
               '    |                                    ^^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if cooked message parts are not an expression',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(__makeTemplateObject(...[], []))';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               '/app/dist/test.js: Unexpected `cooked` argument to the "makeTemplateObject()" function (expected an expression).\n' +
               '> 1 | $localize(__makeTemplateObject(...[], []))\n' +
               '    |                                ^^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if not all cooked message parts are strings',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(__makeTemplateObject(["a", 12, "b"], ["a", "12", "b"]))';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               '/app/dist/test.js: Unexpected messageParts for `$localize` (expected an array of strings).\n' +
               '> 1 | $localize(__makeTemplateObject(["a", 12, "b"], ["a", "12", "b"]))\n' +
               '    |                                ^^^^^^^^^^^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if not all raw message parts are strings',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(__makeTemplateObject(["a", "12", "b"], ["a", 12, "b"]))';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               '/app/dist/test.js: Unexpected messageParts for `$localize` (expected an array of strings).\n' +
               '> 1 | $localize(__makeTemplateObject(["a", "12", "b"], ["a", 12, "b"]))\n' +
               '    |                                                  ^^^^^^^^^^^^^^',
         });
       });

    it('should add diagnostic error with code-frame information if not all substitutions are expressions',
       () => {
         const diagnostics = new Diagnostics();
         const input = '$localize(__makeTemplateObject(["a", "b"], ["a", "b"]), ...[])';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {})], filename: '/app/dist/test.js'});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               '/app/dist/test.js: Invalid substitutions for `$localize` (expected all substitution arguments to be expressions).\n' +
               '> 1 | $localize(__makeTemplateObject(["a", "b"], ["a", "b"]), ...[])\n' +
               '    |                                                         ^^^^^',
         });
       });

    it('should add missing translation to diagnostic errors if missingTranslation is set to "error"',
       () => {
         const diagnostics = new Diagnostics();
         const input = 'const b = 10;\n$localize(["try\\n", "\\n  me"], 40 + b);';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {}, {missingTranslation: 'error'})]});
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message: `No translation found for "${
               ɵcomputeMsgId('try\n{$PH}\n  me')}" ("try\n{$PH}\n  me").`
         });
       });

    it('should add missing translation to diagnostic warnings if missingTranslation is set to "warning"',
       () => {
         const diagnostics = new Diagnostics();
         const input = 'const b = 10;\n$localize(["try\\n", "\\n  me"], 40 + b);';
         transformSync(
             input,
             {plugins: [makeEs5TranslatePlugin(diagnostics, {}, {missingTranslation: 'warning'})]});
         expect(diagnostics.hasErrors).toBe(false);
         expect(diagnostics.messages[0]).toEqual({
           type: 'warning',
           message: `No translation found for "${
               ɵcomputeMsgId('try\n{$PH}\n  me')}" ("try\n{$PH}\n  me").`
         });
       });

    it('should ignore missing translations if missingTranslation is set to "ignore"', () => {
      const diagnostics = new Diagnostics();
      const input = 'const b = 10;\n$localize(["try\\n", "\\n  me"], 40 + b);';
      transformSync(
          input,
          {plugins: [makeEs5TranslatePlugin(diagnostics, {}, {missingTranslation: 'ignore'})]});
      expect(diagnostics.hasErrors).toBe(false);
      expect(diagnostics.messages).toEqual([]);
    });
  });
});

describe('(with translations)', () => {
  it('should translate message parts (identity translations)', () => {
    const diagnostics = new Diagnostics();
    const translations = {
      [ɵcomputeMsgId('abc')]: ɵparseTranslation('abc'),
      [ɵcomputeMsgId('abc{$PH}')]: ɵparseTranslation('abc{$PH}'),
      [ɵcomputeMsgId('abc{$PH}def')]: ɵparseTranslation('abc{$PH}def'),
      [ɵcomputeMsgId('abc{$PH}def{$PH_1}')]: ɵparseTranslation('abc{$PH}def{$PH_1}'),
      [ɵcomputeMsgId('Hello, {$PH}!')]: ɵparseTranslation('Hello, {$PH}!'),
    };
    const input = '$localize(["abc"]);\n' +
        '$localize(["abc", ""], 1 + 2 + 3);\n' +
        '$localize(["abc", "def"], 1 + 2 + 3);\n' +
        '$localize(["abc", "def", ""], 1 + 2 + 3, 4 + 5 + 6);\n' +
        '$localize(["Hello, ", "!"], getName());';
    const output =
        transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, translations)]})!;
    expect(output.code)
        .toEqual(
            '"abc";\n' +
            '"abc" + (1 + 2 + 3) + "";\n' +
            '"abc" + (1 + 2 + 3) + "def";\n' +
            '"abc" + (1 + 2 + 3) + "def" + (4 + 5 + 6) + "";\n' +
            '"Hello, " + getName() + "!";');
  });

  it('should translate message parts (uppercase translations)', () => {
    const diagnostics = new Diagnostics();
    const translations = {
      [ɵcomputeMsgId('abc')]: ɵparseTranslation('ABC'),
      [ɵcomputeMsgId('abc{$PH}')]: ɵparseTranslation('ABC{$PH}'),
      [ɵcomputeMsgId('abc{$PH}def')]: ɵparseTranslation('ABC{$PH}DEF'),
      [ɵcomputeMsgId('abc{$PH}def{$PH_1}')]: ɵparseTranslation('ABC{$PH}DEF{$PH_1}'),
      [ɵcomputeMsgId('Hello, {$PH}!')]: ɵparseTranslation('HELLO, {$PH}!'),
    };
    const input = '$localize(["abc"]);\n' +
        '$localize(["abc", ""], 1 + 2 + 3);\n' +
        '$localize(["abc", "def"], 1 + 2 + 3);\n' +
        '$localize(["abc", "def", ""], 1 + 2 + 3, 4 + 5 + 6);\n' +
        '$localize(["Hello, ", "!"], getName());';
    const output =
        transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, translations)]})!;
    expect(output.code)
        .toEqual(
            '"ABC";\n' +
            '"ABC" + (1 + 2 + 3) + "";\n' +
            '"ABC" + (1 + 2 + 3) + "DEF";\n' +
            '"ABC" + (1 + 2 + 3) + "DEF" + (4 + 5 + 6) + "";\n' +
            '"HELLO, " + getName() + "!";');
  });

  it('should translate message parts (reversing placeholders)', () => {
    const diagnostics = new Diagnostics();
    const translations = {
      [ɵcomputeMsgId('abc{$PH}def{$PH_1} - Hello, {$PH_2}!')]:
          ɵparseTranslation('abc{$PH_2}def{$PH_1} - Hello, {$PH}!'),
    };
    const input = '$localize(["abc", "def", " - Hello, ", "!"], 1 + 2 + 3, 4 + 5 + 6, getName());';
    const output =
        transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, translations)]})!;
    expect(output.code)
        .toEqual('"abc" + getName() + "def" + (4 + 5 + 6) + " - Hello, " + (1 + 2 + 3) + "!";');
  });

  it('should translate message parts (removing placeholders)', () => {
    const diagnostics = new Diagnostics();
    const translations = {
      [ɵcomputeMsgId('abc{$PH}def{$PH_1} - Hello, {$PH_2}!')]:
          ɵparseTranslation('abc{$PH} - Hello, {$PH_2}!'),
    };
    const input = '$localize(["abc", "def", " - Hello, ", "!"], 1 + 2 + 3, 4 + 5 + 6, getName());';
    const output =
        transformSync(input, {plugins: [makeEs5TranslatePlugin(diagnostics, translations)]})!;
    expect(output.code).toEqual('"abc" + (1 + 2 + 3) + " - Hello, " + getName() + "!";');
  });
});
