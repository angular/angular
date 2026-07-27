/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {type CheckTypeFailure, computeCheckType} from '../src/check_type';

function check(
  text: string,
  references?: unknown[],
  owningPackage: string | null = null,
): string | null {
  return computeCheckType({text, ...(references !== undefined ? {references} : {})}, owningPackage)
    .checkType;
}

describe('computeCheckType', () => {
  it('should report the reason rejected declared type text cannot be used', () => {
    const failureFor = (text: string): CheckTypeFailure | null => {
      const result = computeCheckType({text}, null);
      return result.checkType === null ? result.failure : null;
    };

    expect(failureFor('')).toBe('emptyTypeText');
    expect(failureFor('string | '.repeat(64) + 'string')).toBe('typeTextTooLong');
    expect(failureFor('(value: string) => void')).toBe('unsupportedTypeText');
    expect(failureFor('MyItem[]')).toBe('unusableTypeReference');
    expect(failureFor('string')).toBeNull();
  });

  describe('tier 1: self-contained type text', () => {
    it('should accept primitive and built-in types', () => {
      expect(check('boolean')).toBe('boolean');
      expect(check('number | null')).toBe('number | null');
      expect(check('string | undefined')).toBe('string | undefined');
      expect(check('  string  ')).toBe('string');
      expect(check('unknown')).toBe('unknown');
      expect(check('bigint')).toBe('bigint');
    });

    it('should accept literal types and unions', () => {
      expect(check("'a' | 'b'")).toBe("'a' | 'b'");
      expect(check('"on" | "off"')).toBe('"on" | "off"');
      expect(check('1 | 2 | -1')).toBe('1 | 2 | -1');
      expect(check('true | false')).toBe('true | false');
      expect(check("'multi word' | 'ünïcödé'")).toBe("'multi word' | 'ünïcödé'");
    });

    it('should accept array syntax and tuples built from primitive types', () => {
      expect(check('string[]')).toBe('string[]');
      expect(check('readonly string[]')).toBe('readonly string[]');
      expect(check('[number, number]')).toBe('[number, number]');
    });

    it('should accept identifier property names in inline object types', () => {
      expect(check('{value: string}')).toBe('{value: string}');
      expect(check('{value?: {nested: number}}')).toBe('{value?: {nested: number}}');
      expect(check('{string: number; Array: boolean}')).toBeNull();
      // Object property names do not change the allowed punctuation. Semicolons remain invalid.
      expect(check('{string: number, Array: boolean}')).toBe('{string: number, Array: boolean}');
    });

    it('should reject named types without references', () => {
      expect(check('Foo')).toBeNull();
      expect(check('MyItem[]')).toBeNull();
      expect(check('Foo.Bar')).toBeNull();
      expect(check('Array<Foo>')).toBeNull();
      expect(check('{value: Foo}')).toBeNull();
    });

    it('should reject qualified names even when every identifier is otherwise allowed', () => {
      expect(check('Array.Array')).toBeNull();
      expect(check('Map.Set<string>')).toBeNull();
    });

    it('should reject function and constructor types', () => {
      expect(check('(x: string) => void')).toBeNull();
      expect(check('new () => HTMLElement')).toBeNull();
      expect(check('{value(): string}')).toBeNull();
      expect(check('{[key: string]: number}')).toBeNull();
    });

    it('should reject statement and comment injection attempts', () => {
      expect(check('string; })(); alert(1)')).toBeNull();
      expect(check('string /* smuggle */')).toBeNull();
      expect(check('string // smuggle')).toBeNull();
      expect(check('string = 1')).toBeNull();
      expect(check('import("evil").X')).toBeNull(); // `/` not needed: `import` is not whitelisted
      expect(check('string!')).toBeNull();
      expect(check('@decorator string')).toBeNull();
    });

    it('should reject suspicious string literal contents', () => {
      expect(check("'unterminated")).toBeNull();
      expect(check("'escape\\'d'")).toBeNull();
      expect(check('`tpl${string}`')).toBeNull();
      expect(check("'line\nbreak'")).toBeNull();
      expect(check("'para" + '\u2028' + "sep'")).toBeNull(); // line separator in string
    });

    it('should reject non-ASCII and zero-width characters outside strings', () => {
      expect(check('string\u200B' + '')).toBeNull(); // zero-width space
      expect(check('\uFF53tring')).toBeNull(); // fullwidth 's'
      expect(check('string' + '\u2028' + '| number')).toBeNull(); // line separator
    });

    it('should reject empty, oversized and unbalanced text', () => {
      expect(check('')).toBeNull();
      expect(check('   ')).toBeNull();
      expect(check('string | '.repeat(64) + 'string')).toBeNull();
      expect(check('Array<string')).toBeNull();
      expect(check('string)')).toBeNull();
    });

    it('should reject whitelist-safe text that is not valid TypeScript type syntax', () => {
      expect(check('string |')).toBeNull();
      expect(check('Array<>')).toBeNull();
      expect(check('number, string')).toBeNull();
    });

    it('should reject non-object or textless type values', () => {
      expect(computeCheckType(undefined, null).checkType).toBeNull();
      expect(computeCheckType('string', null).checkType).toBeNull();
      expect(computeCheckType({}, null).checkType).toBeNull();
      expect(computeCheckType({text: 42}, null).checkType).toBeNull();
    });
  });

  describe('tier 2: referenced named types', () => {
    it('should substitute an exactly-covering reference with an import type query', () => {
      expect(
        check('ButtonVariant', [{name: 'ButtonVariant', package: '@my/lib', start: 0, end: 13}]),
      ).toBe('import("@my/lib").ButtonVariant');
    });

    it('should validate reference spans against the original type text before trimming output', () => {
      expect(
        check(' ButtonVariant ', [{name: 'ButtonVariant', package: '@my/lib', start: 1, end: 14}]),
      ).toBe('import("@my/lib").ButtonVariant');
    });

    it('should substitute references inside larger type expressions', () => {
      expect(
        check('MyItem[] | null', [{name: 'MyItem', package: 'my-lib', start: 0, end: 6}]),
      ).toBe('import("my-lib").MyItem[] | null');
      expect(
        check('Array<MyItem>', [
          {name: 'Array', package: 'global:', start: 0, end: 5},
          {name: 'MyItem', package: 'my-lib', start: 6, end: 12},
        ]),
      ).toBe('Array<import("my-lib").MyItem>');
      expect(check('{value: Foo}', [{name: 'Foo', package: 'my-lib', start: 8, end: 11}])).toBe(
        '{value: import("my-lib").Foo}',
      );
    });

    it('should never substitute a reference in property-name position', () => {
      expect(check('{Foo: string}', [{name: 'Foo', package: 'my-lib', start: 1, end: 4}])).toBe(
        '{Foo: string}',
      );
    });

    it('should substitute multiple references back to front', () => {
      expect(
        check('A | B', [
          {name: 'A', package: 'pkg-a', start: 0, end: 1},
          {name: 'B', package: 'pkg-b', start: 4, end: 5},
        ]),
      ).toBe('import("pkg-a").A | import("pkg-b").B');
    });

    it('should use explicit global references without generating imports', () => {
      expect(
        check('CustomEvent<{value: string}>', [
          {name: 'CustomEvent', package: 'global:', start: 0, end: 11},
        ]),
      ).toBe('CustomEvent<{value: string}>');
      expect(check('Event', [{name: 'Event', package: 'global:'}])).toBe('Event');
    });

    it('should fall back to the owning package when an indexed reference has none', () => {
      expect(check('MyItem', [{name: 'MyItem', start: 0, end: 6}], '@my/elements')).toBe(
        'import("@my/elements").MyItem',
      );
    });

    it('should preserve a validated reference module subpath', () => {
      expect(
        check('ButtonVariant', [
          {
            name: 'ButtonVariant',
            package: '@my/lib',
            module: './types/button.js',
            start: 0,
            end: 13,
          },
        ]),
      ).toBe('import("@my/lib/types/button.js").ButtonVariant');
    });

    it('should return null when neither reference nor owning package name a module', () => {
      expect(check('MyItem', [{name: 'MyItem', start: 0, end: 6}], null)).toBeNull();
    });

    it('should return null when a named identifier is not covered', () => {
      // Only Foo has a reference. Bar is unresolved.
      expect(check('Foo | Bar', [{name: 'Foo', package: 'pkg', start: 0, end: 3}])).toBeNull();
    });

    it('should return null for span mismatches', () => {
      expect(check('MyItem', [{name: 'MyItem', package: 'pkg', start: 0, end: 5}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: 'pkg', start: 1, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'Other', package: 'pkg', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: 'pkg', start: 0.5, end: 6}])).toBeNull();
    });

    it('should return null for invalid specifiers or names', () => {
      expect(check('MyItem', [{name: 'MyItem', package: '../evil', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: '.', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: '..', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: '...', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: 'pkg.', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: '_pkg', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: '@scope/.', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: 'a"b', start: 0, end: 6}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: 'a b', start: 0, end: 6}])).toBeNull();
      expect(
        check('MyItem', [{name: 'MyItem', package: 'pkg/subpath', start: 0, end: 6}]),
      ).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: '/abs', start: 0, end: 6}])).toBeNull();
    });

    it('should accept safe scoped and unscoped package names', () => {
      expect(check('MyItem', [{name: 'MyItem', package: 'my.pkg-name_2', start: 0, end: 6}])).toBe(
        'import("my.pkg-name_2").MyItem',
      );
      expect(
        check('MyItem', [{name: 'MyItem', package: '@my-scope/pkg_name', start: 0, end: 6}]),
      ).toBe('import("@my-scope/pkg_name").MyItem');
    });

    it('should ignore references pointing inside string literals', () => {
      // Foo is string content and needs no type reference.
      expect(check("'Foo'", [{name: 'Foo', package: 'pkg', start: 1, end: 4}])).toBe("'Foo'");
    });

    it('should not substitute references covering allowed identifiers', () => {
      expect(check('string', [{name: 'string', package: 'pkg', start: 0, end: 6}])).toBe('string');
    });

    it('should handle qualified names conservatively', () => {
      // `Foo.Bar`: `Bar` can never be covered as a standalone reference span of `Foo.Bar`.
      expect(check('Foo.Bar', [{name: 'Foo', package: 'pkg', start: 0, end: 3}])).toBeNull();
    });

    it('should reject qualified names produced by reference substitution', () => {
      expect(
        check('Foo.Array', [
          {name: 'Foo', package: 'pkg', start: 0, end: 3},
          {name: 'Array', package: 'global:', start: 4, end: 9},
        ]),
      ).toBeNull();
    });
  });

  describe('tier 2: index-less references', () => {
    it('should accept an index-less reference covering the whole type text', () => {
      expect(check('ButtonVariant', [{name: 'ButtonVariant', package: '@my/lib'}])).toBe(
        'import("@my/lib").ButtonVariant',
      );
    });

    it('should accept an index-less reference with surrounding whitespace in the text', () => {
      expect(check('  ButtonVariant ', [{name: 'ButtonVariant', package: '@my/lib'}])).toBe(
        'import("@my/lib").ButtonVariant',
      );
    });

    it('should fall back to the owning package when an index-less reference has none', () => {
      expect(check('MyItem', [{name: 'MyItem'}], '@my/elements')).toBe(
        'import("@my/elements").MyItem',
      );
      expect(check('MyItem', [{name: 'MyItem'}], null)).toBeNull();
    });

    it('should reject index-less references to names nested in compound type text', () => {
      // References within compound types require exact start and end offsets.
      expect(check('ButtonVariant | null', [{name: 'ButtonVariant', package: 'pkg'}])).toBeNull();
      expect(check('MyItem[]', [{name: 'MyItem', package: 'pkg'}])).toBeNull();
      expect(check('CustomEvent<Detail>', [{name: 'Detail', package: 'pkg'}])).toBeNull();
      expect(
        check('First | Second', [
          {name: 'First', package: 'first-pkg'},
          {name: 'Second', package: 'second-pkg'},
        ]),
      ).toBeNull();
      // Mixing references with and without offsets also rejects the type.
      expect(
        check('First | Second', [
          {name: 'First', package: 'first-pkg'},
          {name: 'Second', package: 'second-pkg', start: 8, end: 14},
        ]),
      ).toBeNull();
      expect(check("'MyItem' | MyItem", [{name: 'MyItem', package: 'pkg'}])).toBeNull();
    });

    it('should accept compound type text when every nested name is covered by indices', () => {
      expect(
        check('First | Second', [
          {name: 'First', package: 'first-pkg', start: 0, end: 5},
          {name: 'Second', package: 'second-pkg', start: 8, end: 14},
        ]),
      ).toBe('import("first-pkg").First | import("second-pkg").Second');
    });

    it('should reject absent, mismatched and repeated index-less names', () => {
      expect(check('Other', [{name: 'MyItem', package: 'pkg'}])).toBeNull();
      expect(check('[MyItem, MyItem]', [{name: 'MyItem', package: 'pkg'}])).toBeNull();
    });

    it('should keep string-literal-only text self-contained regardless of references', () => {
      // MyItem is string content and needs no type reference.
      expect(check("'MyItem'", [{name: 'MyItem', package: 'pkg'}])).toBe("'MyItem'");
    });

    it('should return null when only one of start/end is present', () => {
      expect(check('MyItem', [{name: 'MyItem', package: 'pkg', start: 0}])).toBeNull();
      expect(check('MyItem', [{name: 'MyItem', package: 'pkg', end: 6}])).toBeNull();
    });

    it('should accept an indexed global reference in generic type text', () => {
      expect(check('Array<string>', [{name: 'Array', package: 'global:', start: 0, end: 5}])).toBe(
        'Array<string>',
      );
    });
  });
});
