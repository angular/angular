/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {transformSync} from '@babel/core';

import {makeEs5Plugin} from '../../../src/inlining/code_transformers/es5_plugin';
import {parseTranslation} from '../../../src/utils/translations';

describe('makeEs5Plugin', () => {
  describe('(no translations)', () => {
    it('should transform `$localize` calls with binary expression', () => {
      const input = 'const b = 10;\n$localize(["try\\n", "\\n  me"], 40 + b);';
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('const b = 10;\n"try\\n" + (40 + b) + "\\n  me";');
    });

    it('should transform nested `$localize` calls', () => {
      const input = '$localize(["a", "b", "c"], 1, $localize(["x", "y", "z"], 5, 6));';
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('"a" + 1 + "b" + ("x" + 5 + "y" + 6 + "z") + "c";');
    });

    it('should transform calls inside functions', () => {
      const input = 'function foo() { $localize(["a", "b", "c"], 1, 2); }';
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('function foo() {\n  "a" + 1 + "b" + 2 + "c";\n}');
    });

    it('should ignore tags with the wrong name', () => {
      const input = 'other(["a", "b", "c"], 1, 2);';
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('other(["a", "b", "c"], 1, 2);');
    });

    it('should transform calls with different function name configured', () => {
      const input = 'other(["a", "b", "c"], 1, 2);';
      const output = transformSync(input, {plugins: [makeEs5Plugin({}, 'other')]}) !;
      expect(output.code).toEqual('"a" + 1 + "b" + 2 + "c";');
    });

    it('should ignore tags if the identifier is not global', () => {
      const input = 'function foo($localize) { $localize(["a", "b", "c"], 1, 2); }';
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code)
          .toEqual('function foo($localize) {\n  $localize(["a", "b", "c"], 1, 2);\n}');
    });

    it('should handle template object helper calls', () => {
      const input = `$localize(__makeTemplateObject(['try', 'me'], ['try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle template object aliased helper calls', () => {
      const input = `$localize(m(['try', 'me'], ['try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle template object inline helper calls', () => {
      const input =
          `$localize((this&&this.__makeTemplateObject||function(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e})(['try', 'me'], ['try', 'me']), 40 + 2);`;
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

    it('should handle cached helper calls', () => {
      const input =
          `$localize(cachedObj||(cachedObj=__makeTemplateObject(['try', 'me'],['try', 'me'])),40 + 2)`;
      const output = transformSync(input, {plugins: [makeEs5Plugin({})]}) !;
      expect(output.code).toEqual('"try" + (40 + 2) + "me";');
    });

  });
});

describe('(with translations)', () => {
  it('should translate message parts (identity translations)', () => {
    const translations = {
      '2674653928643152084': parseTranslation('abc'),
      '7813672378509845446': parseTranslation('abc{$ph_1}'),
      '1830682739855104766': parseTranslation('abc{$ph_1}def'),
      '3400384951036349471': parseTranslation('abc{$ph_1}def{$ph_2}'),
      '8573218635460595868': parseTranslation('Hello, {$ph_1}!'),
    };
    const input = '$localize(["abc"]);\n' +
        '$localize(["abc", ""], 1 + 2 + 3);\n' +
        '$localize(["abc", "def"], 1 + 2 + 3);\n' +
        '$localize(["abc", "def", ""], 1 + 2 + 3, 4 + 5 + 6);\n' +
        '$localize(["Hello, ", "!"], getName());';
    const output = transformSync(input, {plugins: [makeEs5Plugin(translations)]}) !;
    expect(output.code)
        .toEqual(
            '"abc";\n' +
            '"abc" + (1 + 2 + 3) + "";\n' +
            '"abc" + (1 + 2 + 3) + "def";\n' +
            '"abc" + (1 + 2 + 3) + "def" + (4 + 5 + 6) + "";\n' +
            '"Hello, " + getName() + "!";');
  });

  it('should translate message parts (uppercase translations)', () => {
    const translations = {
      '2674653928643152084': parseTranslation('ABC'),
      '7813672378509845446': parseTranslation('ABC{$ph_1}'),
      '1830682739855104766': parseTranslation('ABC{$ph_1}DEF'),
      '3400384951036349471': parseTranslation('ABC{$ph_1}DEF{$ph_2}'),
      '8573218635460595868': parseTranslation('HELLO, {$ph_1}!'),
    };
    const input = '$localize(["abc"]);\n' +
        '$localize(["abc", ""], 1 + 2 + 3);\n' +
        '$localize(["abc", "def"], 1 + 2 + 3);\n' +
        '$localize(["abc", "def", ""], 1 + 2 + 3, 4 + 5 + 6);\n' +
        '$localize(["Hello, ", "!"], getName());';
    const output = transformSync(input, {plugins: [makeEs5Plugin(translations)]}) !;
    expect(output.code)
        .toEqual(
            '"ABC";\n' +
            '"ABC" + (1 + 2 + 3) + "";\n' +
            '"ABC" + (1 + 2 + 3) + "DEF";\n' +
            '"ABC" + (1 + 2 + 3) + "DEF" + (4 + 5 + 6) + "";\n' +
            '"HELLO, " + getName() + "!";');
  });

  it('should translate message parts (reversing placeholders)', () => {
    const translations = {
      '652411571743593484': parseTranslation('abc{$ph_3}def{$ph_2} - Hello, {$ph_1}!'),
    };
    const input = '$localize(["abc", "def", " - Hello, ", "!"], 1 + 2 + 3, 4 + 5 + 6, getName());';
    const output = transformSync(input, {plugins: [makeEs5Plugin(translations)]}) !;
    expect(output.code)
        .toEqual('"abc" + getName() + "def" + (4 + 5 + 6) + " - Hello, " + (1 + 2 + 3) + "!";');
  });

  it('should translate message parts (removing placeholders)', () => {
    const translations = {
      '652411571743593484': parseTranslation('abc{$ph_1} - Hello, {$ph_3}!'),
    };
    const input = '$localize(["abc", "def", " - Hello, ", "!"], 1 + 2 + 3, 4 + 5 + 6, getName());';
    const output = transformSync(input, {plugins: [makeEs5Plugin(translations)]}) !;
    expect(output.code).toEqual('"abc" + (1 + 2 + 3) + " - Hello, " + getName() + "!";');
  });
});
