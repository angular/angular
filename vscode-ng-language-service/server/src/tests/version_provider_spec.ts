/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isAbsolute, resolve} from 'path';

import {resolveNgLangSvc, resolveTsServer} from '../version_provider';

describe('Node Module Resolver', () => {
  const probeLocations = [__dirname];

  it('should be able to resolve tsserver', () => {
    const result = resolveTsServer(probeLocations, null);
    expect(result).toBeDefined();
    expect(result.resolvedPath).toMatch(/typescript\/lib\/tsserverlibrary.js$/);
  });

  it('should resolve tsserver from typescript.tsdk provided as fs path', () => {
    // Resolve relative to cwd.
    const absPath = resolve('node_modules/typescript/lib');
    expect(isAbsolute(absPath)).toBeTrue();
    const result = resolveTsServer(probeLocations, absPath);
    expect(result.resolvedPath.endsWith('typescript/lib/tsserverlibrary.js')).toBeTrue();
  });

  it('should be able to resolve Angular language service', () => {
    const result = resolveNgLangSvc(probeLocations);
    expect(result).toBeDefined();
    expect(result.resolvedPath.endsWith('@angular/language-service/index.js')).toBeTrue();
  });
});
