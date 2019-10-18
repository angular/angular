/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmptyTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';


describe('update ts migration', () => {
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;
  const pkgJsonPath = '/package.json';
  const typesNodeVersion = '^12.11.1';
  const tsVersion = '~3.6.4';

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    tree = new UnitTestTree(new EmptyTree());
  });

  describe('typescript', () => {
    it(`should not add if it isn't present`, async() => {
      tree.create(pkgJsonPath, JSON.stringify({dependencies: {}, devDependencies: {}}, null, 2));
      await runMigration();
      const packageJson = JSON.parse(tree.readContent(pkgJsonPath));
      expect(packageJson.dependencies.typescript).toBe(undefined);
      expect(packageJson.devDependencies.typescript).toBe(undefined);
    });

    it(`should update dependencies`, async() => {
      tree.create(pkgJsonPath, JSON.stringify({dependencies: {typescript: '~3.5.4'}}, null, 2));
      await runMigration();
      const packageJson = JSON.parse(tree.readContent(pkgJsonPath));
      expect(packageJson.dependencies.typescript).toBe(tsVersion);
    });

    it(`should update devDependencies`, async() => {
      tree.create(pkgJsonPath, JSON.stringify({devDependencies: {typescript: '~3.5.4'}}, null, 2));
      await runMigration();
      const packageJson = JSON.parse(tree.readContent(pkgJsonPath));
      expect(packageJson.devDependencies.typescript).toBe(tsVersion);
    });
  });

  describe('@types/node', () => {
    it(`should not add if it isn't present`, async() => {
      tree.create(pkgJsonPath, JSON.stringify({dependencies: {}, devDependencies: {}}, null, 2));
      await runMigration();
      const packageJson = JSON.parse(tree.readContent(pkgJsonPath));
      expect(packageJson.dependencies['@types/node']).toBe(undefined);
      expect(packageJson.devDependencies['@types/node']).toBe(undefined);
    });

    it(`should update dependencies`, async() => {
      tree.create(pkgJsonPath, JSON.stringify({dependencies: {'@types/node': '^8.9.4'}}, null, 2));
      await runMigration();
      const packageJson = JSON.parse(tree.readContent(pkgJsonPath));
      expect(packageJson.dependencies['@types/node']).toBe(typesNodeVersion);
    });

    it(`should update devDependencies`, async() => {
      tree.create(
          pkgJsonPath, JSON.stringify({devDependencies: {'@types/node': '^8.9.4'}}, null, 2));
      await runMigration();
      const packageJson = JSON.parse(tree.readContent(pkgJsonPath));
      expect(packageJson.devDependencies['@types/node']).toBe(typesNodeVersion);
    });
  });

  function runMigration() {
    return runner.runSchematicAsync('migration-v9-update-typescript', {}, tree).toPromise();
  }
});
