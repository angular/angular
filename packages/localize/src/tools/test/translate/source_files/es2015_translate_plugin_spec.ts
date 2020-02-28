/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵcomputeMsgId, ɵparseTranslation} from '@angular/localize';
import {transformSync} from '@babel/core';

import {Diagnostics} from '../../../src/diagnostics';
import {makeEs2015TranslatePlugin} from '../../../src/translate/source_files/es2015_translate_plugin';

describe('makeEs2015Plugin', () => {
  describe('(no translations)', () => {
    it('should transform `$localize` tags with binary expression', () => {
      const diagnostics = new Diagnostics();
      const input = 'const b = 10;\n$localize`try\\n${40 + b}\\n  me`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('const b = 10;\n"try\\n" + (40 + b) + "\\n  me";');
    });

    it('should strip meta blocks', () => {
      const diagnostics = new Diagnostics();
      const input = 'const b = 10;\n$localize `:description:try\\n${40 + b}\\n  me`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('const b = 10;\n"try\\n" + (40 + b) + "\\n  me";');
    });

    it('should not strip escaped meta blocks', () => {
      const diagnostics = new Diagnostics();
      const input = 'const b = 10;\n$localize `\\:description:try\\n${40 + b}\\n  me`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('const b = 10;\n":description:try\\n" + (40 + b) + "\\n  me";');
    });


    it('should transform nested `$localize` tags', () => {
      const diagnostics = new Diagnostics();
      const input = '$localize`a${1}b${$localize`x${5}y${6}z`}c`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('"a" + 1 + "b" + ("x" + 5 + "y" + 6 + "z") + "c";');
    });

    it('should transform tags inside functions', () => {
      const diagnostics = new Diagnostics();
      const input = 'function foo() { $localize`a${1}b${2}c`; }';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('function foo() {\n  "a" + 1 + "b" + 2 + "c";\n}');
    });

    it('should ignore tags with the wrong name', () => {
      const diagnostics = new Diagnostics();
      const input = 'other`a${1}b${2}c`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('other`a${1}b${2}c`;');
    });

    it('should transform tags with different tag name configured', () => {
      const diagnostics = new Diagnostics();
      const input = 'other`a${1}b${2}c`;';
      const output = transformSync(
          input,
          {plugins: [makeEs2015TranslatePlugin(diagnostics, {}, {localizeName: 'other'})]}) !;
      expect(output.code).toEqual('"a" + 1 + "b" + 2 + "c";');
    });

    it('should ignore tags if the identifier is not global', () => {
      const diagnostics = new Diagnostics();
      const input = 'function foo($localize) { $localize`a${1}b${2}c`; }';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, {})]}) !;
      expect(output.code).toEqual('function foo($localize) {\n  $localize`a${1}b${2}c`;\n}');
    });

    it('should add missing translation to diagnostic errors if missingTranslation is set to "error"',
       () => {
         const diagnostics = new Diagnostics();
         const input = 'const b = 10;\n$localize `try\\n${40 + b}\\n  me`;';
         transformSync(input, {
           plugins: [makeEs2015TranslatePlugin(diagnostics, {}, {missingTranslation: 'error'})]
         }) !;
         expect(diagnostics.hasErrors).toBe(true);
         expect(diagnostics.messages[0]).toEqual({
           type: 'error',
           message:
               `No translation found for "${ɵcomputeMsgId('try\n{$PH}\n  me')}" ("try\n{$PH}\n  me").`
         });
       });

    it('should add missing translation to diagnostic errors if missingTranslation is set to "warning"',
       () => {
         const diagnostics = new Diagnostics();
         const input = 'const b = 10;\n$localize `try\\n${40 + b}\\n  me`;';
         transformSync(input, {
           plugins:
               [makeEs2015TranslatePlugin(diagnostics, {}, {missingTranslation: 'warning'})]
         }) !;
         expect(diagnostics.hasErrors).toBe(false);
         expect(diagnostics.messages[0]).toEqual({
           type: 'warning',
           message:
               `No translation found for "${ɵcomputeMsgId('try\n{$PH}\n  me')}" ("try\n{$PH}\n  me").`
         });
       });

    it('should add missing translation to diagnostic errors if missingTranslation is set to "ignore"',
       () => {
         const diagnostics = new Diagnostics();
         const input = 'const b = 10;\n$localize `try\\n${40 + b}\\n  me`;';
         transformSync(input, {
           plugins:
               [makeEs2015TranslatePlugin(diagnostics, {}, {missingTranslation: 'ignore'})]
         }) !;
         expect(diagnostics.hasErrors).toBe(false);
         expect(diagnostics.messages).toEqual([]);
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
      const input = '$localize `abc`;\n' +
          '$localize `abc${1 + 2 + 3}`;\n' +
          '$localize `abc${1 + 2 + 3}def`;\n' +
          '$localize `abc${1 + 2 + 3}def${4 + 5 + 6}`;\n' +
          '$localize `Hello, ${getName()}!`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, translations)]}) !;
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
      const input = '$localize `abc`;\n' +
          '$localize `abc${1 + 2 + 3}`;\n' +
          '$localize `abc${1 + 2 + 3}def`;\n' +
          '$localize `abc${1 + 2 + 3}def${4 + 5 + 6}`;\n' +
          '$localize `Hello, ${getName()}!`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, translations)]}) !;
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
      const input = '$localize `abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, translations)]}) !;
      expect(output.code)
          .toEqual('"abc" + getName() + "def" + (4 + 5 + 6) + " - Hello, " + (1 + 2 + 3) + "!";');
    });

    it('should translate message parts (removing placeholders)', () => {
      const diagnostics = new Diagnostics();
      const translations = {
        [ɵcomputeMsgId('abc{$PH}def{$PH_1} - Hello, {$PH_2}!')]:
            ɵparseTranslation('abc{$PH} - Hello, {$PH_2}!'),
      };
      const input = '$localize `abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`;';
      const output =
          transformSync(input, {plugins: [makeEs2015TranslatePlugin(diagnostics, translations)]}) !;
      expect(output.code).toEqual('"abc" + (1 + 2 + 3) + " - Hello, " + getName() + "!";');
    });
  });
});
