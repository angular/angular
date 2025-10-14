'use strict';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, '__esModule', {value: true});
const path_1 = require('path');
const version_provider_1 = require('../version_provider');
describe('Node Module Resolver', () => {
  const probeLocations = [__dirname];
  it('should be able to resolve tsserver', () => {
    const result = (0, version_provider_1.resolveTsServer)(probeLocations, null);
    expect(result).toBeDefined();
    expect(result.resolvedPath).toMatch(/typescript\/lib\/tsserverlibrary.js$/);
  });
  it('should resolve tsserver from typescript.tsdk provided as fs path', () => {
    // Resolve relative to cwd.
    const absPath = (0, path_1.resolve)('node_modules/typescript/lib');
    expect((0, path_1.isAbsolute)(absPath)).toBeTrue();
    const result = (0, version_provider_1.resolveTsServer)(probeLocations, absPath);
    expect(result.resolvedPath.endsWith('typescript/lib/tsserverlibrary.js')).toBeTrue();
  });
  it('should be able to resolve Angular language service', () => {
    const result = (0, version_provider_1.resolveNgLangSvc)(probeLocations);
    expect(result).toBeDefined();
    expect(result.resolvedPath.endsWith('@angular/language-service/index.js')).toBeTrue();
  });
});
//# sourceMappingURL=version_provider_spec.js.map
