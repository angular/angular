import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {hasNgModuleImport} from './ng-module-imports';

describe('NgModule import utils', () => {

  let host: UnitTestTree;

  beforeEach(() => {
    host = new UnitTestTree(new HostTree());
  });

  describe('hasNgModuleImport', () => {
    it('should properly detect imports', () => {
      host.create('/test.ts', `
      @NgModule({
        imports: [TestModule],
      })
      export class MyModule {}
    `);

      expect(hasNgModuleImport(host, '/test.ts', 'TestModule')).toBe(true);
      expect(hasNgModuleImport(host, '/test.ts', 'NotExistent')).toBe(false);
    });

    it(`should detect imports for NgModule's using a namespaced identifier`, () => {
      host.create('/test.ts', `
      @myImport.NgModule({
        imports: [TestModule],
      })
      export class MyModule {}
    `);

      expect(hasNgModuleImport(host, '/test.ts', 'TestModule')).toBe(true);
      expect(hasNgModuleImport(host, '/test.ts', 'NotExistent')).toBe(false);
    });
  });
});
