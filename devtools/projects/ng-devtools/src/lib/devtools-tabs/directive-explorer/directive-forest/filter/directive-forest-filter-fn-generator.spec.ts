/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  directiveForestFilterFnGenerator,
  tokenizeDirectiveForestFilter,
  parseDirectiveForestFilter,
  ParsedFilter,
} from './directive-forest-filter-fn-generator';

function expectToMatchParsedFilter(target: ParsedFilter, test: ParsedFilter) {
  expect(target).toEqual(test);
}

function expectToMatchParsedElement(target: ParsedFilter, test: ParsedFilter['element']) {
  expect(target.component).toBeUndefined();
  expect(target.directives.length).toEqual(0);
  expect(target.element).toEqual(test);
}

function expectToMatchParsedComponent(target: ParsedFilter, test: ParsedFilter['component']) {
  expect(target.element).toBeUndefined();
  expect(target.directives.length).toEqual(0);
  expect(target.component).toEqual(test);
}

function expectToMatchParsedDirectives(target: ParsedFilter, test: ParsedFilter['directives']) {
  expect(target.element).toBeUndefined();
  expect(target.component).toBeUndefined();
  expect(target.directives).toEqual(test);
}

describe('directive-forest-filter-fn-generator', () => {
  describe('tokenizeDirectiveForestFilter', () => {
    it('should tokenize an empty string', () => {
      const tokens = tokenizeDirectiveForestFilter('');
      expect(tokens).toEqual([]);
    });

    it('should tokenize a component', () => {
      const tokens = tokenizeDirectiveForestFilter('app-component');
      expect(tokens).toEqual([{type: 'text', value: 'app-component', idx: 0}]);
    });

    it('should tokenize a directive', () => {
      const tokens = tokenizeDirectiveForestFilter('[FooDirective]');
      expect(tokens).toEqual([
        {type: 'opening_bracket', value: '[', idx: 0},
        {type: 'text', value: 'FooDirective', idx: 1},
        {type: 'closing_bracket', value: ']', idx: 13},
      ]);
    });

    it('should tokenize multiple directives', () => {
      const tokens = tokenizeDirectiveForestFilter('[Foo][Bar]');
      expect(tokens).toEqual([
        {type: 'opening_bracket', value: '[', idx: 0},
        {type: 'text', value: 'Foo', idx: 1},
        {type: 'closing_bracket', value: ']', idx: 4},
        {type: 'opening_bracket', value: '[', idx: 5},
        {type: 'text', value: 'Bar', idx: 6},
        {type: 'closing_bracket', value: ']', idx: 9},
      ]);
    });

    it('should tokenize a component multiple directives', () => {
      const tokens = tokenizeDirectiveForestFilter('app-cmp[Foo][Bar]');
      expect(tokens).toEqual([
        {type: 'text', value: 'app-cmp', idx: 0},
        {type: 'opening_bracket', value: '[', idx: 7},
        {type: 'text', value: 'Foo', idx: 8},
        {type: 'closing_bracket', value: ']', idx: 11},
        {type: 'opening_bracket', value: '[', idx: 12},
        {type: 'text', value: 'Bar', idx: 13},
        {type: 'closing_bracket', value: ']', idx: 16},
      ]);
    });

    it('should tokenize an element', () => {
      const tokens = tokenizeDirectiveForestFilter('<app-element />');
      expect(tokens).toEqual([
        {type: 'chevron_left', value: '<', idx: 0},
        {type: 'text', value: 'app-element', idx: 1},
        {type: 'space', value: ' ', idx: 12},
        {type: 'slash', value: '/', idx: 13},
        {type: 'chevron_right', value: '>', idx: 14},
      ]);
    });
  });

  describe('parseDirectiveForestFilter', () => {
    it('should parse an empty string to an empty tokens array', () => {
      const tokens = tokenizeDirectiveForestFilter('');
      const parsed = parseDirectiveForestFilter(tokens);

      expect(parsed.component).toBeUndefined();
      expect(parsed.directives.length).toEqual(0);
    });

    it('should parse a standard string', () => {
      const tokens = tokenizeDirectiveForestFilter('app-random-component');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedComponent(parsed, {
        idx: 0,
        value: 'app-random-component',
      });
    });

    it('should parse a directive', () => {
      const tokens = tokenizeDirectiveForestFilter('[AppDirective]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedDirectives(parsed, [
        {
          idx: 1,
          value: 'AppDirective',
        },
      ]);
    });

    it('should parse multiple directives ([b][c] format)', () => {
      const tokens = tokenizeDirectiveForestFilter('[FooDir][BarDir]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedDirectives(parsed, [
        {
          idx: 1,
          value: 'FooDir',
        },
        {
          idx: 9,
          value: 'BarDir',
        },
      ]);
    });

    it('should parse multiple directives ([b c] format)', () => {
      const tokens = tokenizeDirectiveForestFilter('[FooDir BarDir]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedDirectives(parsed, [
        {
          idx: 1,
          value: 'FooDir',
        },
        {
          idx: 8,
          value: 'BarDir',
        },
      ]);
    });

    it('should parse a component + directive', () => {
      const tokens = tokenizeDirectiveForestFilter('app-component[AppDirective]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-component',
        },
        directives: [
          {
            idx: 14,
            value: 'AppDirective',
          },
        ],
      });
    });

    it('should parse a component + multiple directives (a[b][c] format)', () => {
      const tokens = tokenizeDirectiveForestFilter('app-foo[BarDir][BazDir]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-foo',
        },
        directives: [
          {
            idx: 8,
            value: 'BarDir',
          },
          {
            idx: 16,
            value: 'BazDir',
          },
        ],
      });
    });

    it('should parse a component + multiple directives (a[b c] format)', () => {
      const tokens = tokenizeDirectiveForestFilter('app-foo[BarDir BazDir]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-foo',
        },
        directives: [
          {
            idx: 8,
            value: 'BarDir',
          },
          {
            idx: 15,
            value: 'BazDir',
          },
        ],
      });
    });

    it('should parse a component with empty directive brackets (app-foo[)', () => {
      const tokens = tokenizeDirectiveForestFilter('app-foo[');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-foo',
        },
        directives: [],
      });
    });

    it('should parse a component with empty directive brackets (app-foo[])', () => {
      const tokens = tokenizeDirectiveForestFilter('app-foo[]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-foo',
        },
        directives: [],
      });
    });

    it('should parse a component with empty directive brackets (app-foo])', () => {
      const tokens = tokenizeDirectiveForestFilter('app-foo[]');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-foo',
        },
        directives: [],
      });
    });

    it('should parse a component and a directive without closing bracket (app-foo[Foo)', () => {
      const tokens = tokenizeDirectiveForestFilter('app-foo[Foo');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedFilter(parsed, {
        component: {
          idx: 0,
          value: 'app-foo',
        },
        directives: [
          {
            idx: 8,
            value: 'Foo',
          },
        ],
      });
    });

    it('should parse an element', () => {
      const tokens = tokenizeDirectiveForestFilter('<app-element />');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedElement(parsed, {
        idx: 1,
        value: 'app-element',
      });
    });

    it('should parse an incomplete element', () => {
      const tokens = tokenizeDirectiveForestFilter('<app-ele');
      const parsed = parseDirectiveForestFilter(tokens);

      expectToMatchParsedElement(parsed, {
        idx: 1,
        value: 'app-ele',
      });
    });
  });

  describe('directiveForestFilterFnGenerator', () => {
    it('should NOT match an empty string input', () => {
      const filterFn = directiveForestFilterFnGenerator('');
      const matches = filterFn('app-foo-component');

      expect(matches.length).toEqual(0);
    });

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
      const filterFn = directiveForestFilterFnGenerator('[Baz][BarDir]');
      const matches = filterFn('app-foo-cmp[BarDirective][BazDirective]');

      expect(matches.length).toEqual(2);

      const [barDir, baz] = matches;

      expect(barDir.startIdx).toEqual(12);
      expect(barDir.endIdx).toEqual(18);

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

    it('should match a component + directive (reversed order)', () => {
      const filterFn = directiveForestFilterFnGenerator('[Bar]app-foo');
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

    it('should be able to distinguish between a component and a directive with the same name', () => {
      const filterFn = directiveForestFilterFnGenerator('[app-foo]');
      const matches = filterFn('app-foo[app-foo]');

      expect(matches.length).toEqual(1);

      const [match] = matches;

      expect(match.startIdx).toEqual(8);
      expect(match.endIdx).toEqual(15);
    });

    it('should match an element', () => {
      const filterFn = directiveForestFilterFnGenerator('<app-element />');
      const matches = filterFn('<app-element />');

      expect(matches.length).toEqual(1);

      const [match] = matches;

      expect(match.startIdx).toEqual(1);
      expect(match.endIdx).toEqual(12);
    });

    it('should match an element without a slash', () => {
      const filterFn = directiveForestFilterFnGenerator('<app-element>');
      const matches = filterFn('<app-element />');

      expect(matches.length).toEqual(1);

      const [match] = matches;

      expect(match.startIdx).toEqual(1);
      expect(match.endIdx).toEqual(12);
    });

    it('should match an incomplete element', () => {
      const filterFn = directiveForestFilterFnGenerator('<app-ele');
      const matches = filterFn('<app-ele');

      expect(matches.length).toEqual(1);

      const [match] = matches;

      expect(match.startIdx).toEqual(1);
      expect(match.endIdx).toEqual(8);
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

    it('should handle gracefully some gibberish cases', () => {
      expect(() => directiveForestFilterFnGenerator('[')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('[]')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('][')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('<')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('<>')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('><')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('<<[[]][[][>></')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('[foo[bar[baz')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator(']foo]bar]baz')).not.toThrowError();

      expect(() => directiveForestFilterFnGenerator('<app-foo[Bar][Baz]/>')).not.toThrowError();

      expect(() =>
        directiveForestFilterFnGenerator('app-foo-cmp<element  [Foo][Bar][[/><baz '),
      ).not.toThrowError();
    });
  });
});
