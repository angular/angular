/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const fs = require('fs');
const PKG = 'angular/packages/compiler-cli/integrationtest/bazel/ng_module';
describe('flat module index', () => {
  describe('child metadata', () => {
    it('should have contents', () => {
      const metadata = fs.readFileSync(
          require.resolve(`${PKG}/_test_module.bundle_index.metadata.json`), {encoding: 'utf-8'});
      expect(metadata).toContain('"__symbolic":"module"');
      expect(metadata).toContain('"__symbolic":"reference","module":"@angular/core"');
      expect(metadata).toContain('"origins":{"Child":"./child","ɵa":"./parent"}');
      expect(metadata).toContain('"importAs":"some_npm_module"');
    });
  });
  describe('child typings', () => {
    it('should have contents', () => {
      const dts = fs.readFileSync(
          require.resolve(`${PKG}/_test_module.bundle_index.d.ts`), {encoding: 'utf-8'});

      expect(dts).toContain('export * from \'./index\';');
      expect(dts).toContain('export { Parent as ɵa } from \'./parent\';');
    });
  });
});