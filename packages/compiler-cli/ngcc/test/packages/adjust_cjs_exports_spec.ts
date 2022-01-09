/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {adjustElementAccessExports} from '../../src/packages/adjust_cjs_umd_exports';

describe('adjustElementAccessExports', () => {
  it('should replace exports using element access syntax', () => {
    expectChanged(`exports['Foo']`, `exports. Foo  `);
    expectChanged(
        `exports['Foo']; exports['Bar']; exports['Baz'];`,
        `exports. Foo  ; exports. Bar  ; exports. Baz  ;`);
    expectChanged(
        `function(exports) { exports['Foo'] = Foo; }`,
        `function(exports) { exports. Foo   = Foo; }`);
    expectChanged(
        `function(exports) { exports['ɵFoo'] = Foo; }`,
        `function(exports) { exports. ɵFoo   = Foo; }`);
  });

  it('should not replace invalid identifier names', () => {
    expectUnchanged(`exports['']`);
    expectUnchanged(`exports['let']`);
    expectUnchanged(`exports['var']`);
    expectUnchanged(`exports['const']`);
  });

  it('should not replace export syntax in comments and strings', () => {
    expectUnchanged(`/* exports['Foo'] = Foo; */`);
    expectUnchanged(`"exports['Foo'] = Foo;"`);
    expectChanged(
        `/* exports['Foo'] = Foo; */ exports['Foo'] = Foo;`,
        `/* exports['Foo'] = Foo; */ exports. Foo   = Foo;`);
  });
});

function expectChanged(input: string, expected: string) {
  const result = adjustElementAccessExports(input);
  expect(result).toEqual(expected);
}

function expectUnchanged(input: string) {
  const result = adjustElementAccessExports(input);
  expect(result).toEqual(input);
}
