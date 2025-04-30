/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  directiveForestFilterFnGenerator,
  directiveForestFilterParser,
  FilterToken,
} from './directive-forest-filter-fn-generator';

function expectTokenToEqual(target: FilterToken, test: FilterToken) {
  expect(target).toEqual(test);
}

describe('directive-forest-filter-fn-generator', () => {
  describe('directiveForestParser', () => {
    it('should parse an empty string to an empty tokens array', () => {
      const tokens = directiveForestFilterParser('');

      expect(tokens.length).toEqual(0);
    });

    it('should parse a standard string', () => {
      const tokens = directiveForestFilterParser('app-random-component');

      expect(tokens.length).toEqual(1);

      expectTokenToEqual(tokens[0], {
        start: 0,
        end: 20,
        token: 'app-random-component',
        type: 'generic',
      });
    });

    it('should parse a directive', () => {
      const tokens = directiveForestFilterParser('[AppDirective]');

      expect(tokens.length).toEqual(1);

      expectTokenToEqual(tokens[0], {
        start: 1,
        end: 13,
        token: 'AppDirective',
        type: 'directive',
      });
    });

    it('should parse multiple directives ([b][c] format)', () => {
      const tokens = directiveForestFilterParser('[FooDir][BarDir]');

      expect(tokens.length).toEqual(2);

      const [fooToken, barToken] = tokens;

      expectTokenToEqual(fooToken, {
        start: 1,
        end: 7,
        token: 'FooDir',
        type: 'directive',
      });
      expectTokenToEqual(barToken, {
        start: 9,
        end: 15,
        token: 'BarDir',
        type: 'directive',
      });
    });

    it('should parse multiple directives ([b c] format)', () => {
      const tokens = directiveForestFilterParser('[FooDir BarDir]');

      expect(tokens.length).toEqual(2);

      const [fooToken, barToken] = tokens;

      expectTokenToEqual(fooToken, {
        start: 1,
        end: 7,
        token: 'FooDir',
        type: 'directive',
      });
      expectTokenToEqual(barToken, {
        start: 8,
        end: 14,
        token: 'BarDir',
        type: 'directive',
      });
    });

    it('should parse a component + directive', () => {
      const tokens = directiveForestFilterParser('app-component[AppDirective]');

      expect(tokens.length).toEqual(2);

      const [cmpToken, dirToken] = tokens;

      expectTokenToEqual(cmpToken, {
        start: 0,
        end: 13,
        token: 'app-component',
        type: 'component',
      });
      expectTokenToEqual(dirToken, {
        start: 14,
        end: 26,
        token: 'AppDirective',
        type: 'directive',
      });
    });

    it('should parse a component + multiple directives (a[b][c] format)', () => {
      const tokens = directiveForestFilterParser('app-foo[BarDir][BazDir]');

      expect(tokens.length).toEqual(3);

      const [cmpToken, dirBarToken, dirBazToken] = tokens;

      expectTokenToEqual(cmpToken, {
        start: 0,
        end: 7,
        token: 'app-foo',
        type: 'component',
      });
      expectTokenToEqual(dirBarToken, {
        start: 8,
        end: 14,
        token: 'BarDir',
        type: 'directive',
      });
      expectTokenToEqual(dirBazToken, {
        start: 16,
        end: 22,
        token: 'BazDir',
        type: 'directive',
      });
    });

    it('should parse a component + multiple directives (a[b c] format)', () => {
      const tokens = directiveForestFilterParser('app-foo[BarDir BazDir]');

      expect(tokens.length).toEqual(3);

      const [cmpToken, dirBarToken, dirBazToken] = tokens;

      expectTokenToEqual(cmpToken, {
        start: 0,
        end: 7,
        token: 'app-foo',
        type: 'component',
      });
      expectTokenToEqual(dirBarToken, {
        start: 8,
        end: 14,
        token: 'BarDir',
        type: 'directive',
      });
      expectTokenToEqual(dirBazToken, {
        start: 15,
        end: 21,
        token: 'BazDir',
        type: 'directive',
      });
    });
  });

  describe('directiveForestFilterFnGenerator', () => {
    it('should match a standard string input', () => {
      const filterFn = directiveForestFilterFnGenerator('-foo-comp');
      const matches = filterFn('app-foo-component');

      expect(matches.length).toEqual(1);
      expect(matches[0].startIdx).toEqual(3);
      expect(matches[0].endIdx).toEqual(12);
    });

    it('should match the string fully', () => {
      const filterFn = directiveForestFilterFnGenerator('app-foo-cmp');
      const matches = filterFn('app-foo-cmp');

      expect(matches.length).toEqual(1);
      expect(matches[0].startIdx).toEqual(0);
      expect(matches[0].endIdx).toEqual(11);
    });

    it('should match a directive', () => {
      const filterFn = directiveForestFilterFnGenerator('[BarDir]');
      const matches = filterFn('app-foo-cmp[BarDirective]');

      expect(matches.length).toEqual(1);
      expect(matches[0].startIdx).toEqual(12);
      expect(matches[0].endIdx).toEqual(18);
    });

    it('should match multiple directives', () => {
      const filterFn = directiveForestFilterFnGenerator('[Bar][Baz]');
      const matches = filterFn('app-foo-cmp[BarDirective][BazDirective]');

      expect(matches.length).toEqual(2);

      const [bar, baz] = matches;

      expect(bar.startIdx).toEqual(12);
      expect(bar.endIdx).toEqual(15);

      expect(baz.startIdx).toEqual(26);
      expect(baz.endIdx).toEqual(29);
    });

    it('should match multiple directives irrespetive of order', () => {
      const filterFn = directiveForestFilterFnGenerator('[Baz][Bar]');
      const matches = filterFn('app-foo-cmp[BarDirective][BazDirective]');

      expect(matches.length).toEqual(2);

      const [bar, baz] = matches;

      expect(bar.startIdx).toEqual(12);
      expect(bar.endIdx).toEqual(15);

      expect(baz.startIdx).toEqual(26);
      expect(baz.endIdx).toEqual(29);
    });

    it('should match a component + directive', () => {
      const filterFn = directiveForestFilterFnGenerator('app-foo[Bar]');
      const matches = filterFn('app-foo-cmp[BarDirective]');

      expect(matches.length).toEqual(2);

      const [foo, bar] = matches;

      expect(foo.startIdx).toEqual(0);
      expect(foo.endIdx).toEqual(7);

      expect(bar.startIdx).toEqual(12);
      expect(bar.endIdx).toEqual(15);
    });

    it('should match a component + multiple directive', () => {
      const filterFn = directiveForestFilterFnGenerator('app-foo[Bar][BazDirective]');
      const matches = filterFn('app-foo-cmp[BarDirective][BazDirective]');

      expect(matches.length).toEqual(3);

      const [foo, bar, baz] = matches;

      expect(foo.startIdx).toEqual(0);
      expect(foo.endIdx).toEqual(7);

      expect(bar.startIdx).toEqual(12);
      expect(bar.endIdx).toEqual(15);

      expect(baz.startIdx).toEqual(26);
      expect(baz.endIdx).toEqual(38);
    });

    it(`should NOT match, if a component matches but the directive doesn't`, () => {
      const filterFn = directiveForestFilterFnGenerator('app-foo[Baz]');
      const matches = filterFn('app-foo-cmp[BarDirective]');

      expect(matches.length).toEqual(0);
    });

    it(`should NOT match, if a directive matches but the component doesn't`, () => {
      const filterFn = directiveForestFilterFnGenerator('app-baz[Bar]');
      const matches = filterFn('app-foo-cmp[BarDirective]');

      expect(matches.length).toEqual(0);
    });

    it(`should NOT match, if some of the directives doesn't match`, () => {
      const filterFn = directiveForestFilterFnGenerator('app-foo-cmp[Bar][Qux]');
      const matches = filterFn('app-foo-cmp[BarDirective][BazDirective]');

      expect(matches.length).toEqual(0);
    });
  });
});
