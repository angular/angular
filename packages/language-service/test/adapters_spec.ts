/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {LSParseConfigHost} from '../src/adapters';

describe('LSParseConfigHost.resolve()', () => {
  it('should collapse absolute paths', () => {
    const p1 = '/foo/bar/baz';
    const p2 = '/foo/bar/baz/tsconfig.json';
    const host = new LSParseConfigHost(ts.sys as ts.server.ServerHost);
    const resolved = host.resolve(p1, p2);
    expect(resolved).toBe('/foo/bar/baz/tsconfig.json');
  });
});
