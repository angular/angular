/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
          require.resolve(`${PKG}/flat_module_filename.metadata.json`), {encoding: 'utf-8'});
      expect(metadata).toContain('"__symbolic":"module"');
      expect(metadata).toContain('"__symbolic":"reference","module":"@angular/core"');
      expect(metadata).toContain(
          '"origins":{"Child":"./child","ɵangular_packages_compiler_cli_integrationtest_bazel_ng_module_test_module_a":"./parent"}');
      expect(metadata).toContain('"importAs":"some_npm_module"');
    });
  });
  describe('child typings', () => {
    it('should have contents', () => {
      const dts =
          fs.readFileSync(require.resolve(`${PKG}/flat_module_filename.d.ts`), {encoding: 'utf-8'});

      expect(dts).toContain('export * from \'./index\';');
      expect(dts).toContain(
          'export { Parent as ɵangular_packages_compiler_cli_integrationtest_bazel_ng_module_test_module_a } from \'./parent\';');
    });
  });
});
