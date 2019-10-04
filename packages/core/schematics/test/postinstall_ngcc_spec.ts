/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmptyTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';


describe('postinstall ngcc migration', () => {
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;
  const pkgJsonPath = '/package.json';
  const ngccPostinstall =
      `"postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points"`;

  beforeEach(() => {
    runner = new SchematicTestRunner('test', require.resolve('../migrations.json'));
    tree = new UnitTestTree(new EmptyTree());
  });

  it(`should add postinstall if scripts object is missing`, async() => {
    tree.create(pkgJsonPath, JSON.stringify({}, null, 2));
    await runMigration();
    expect(tree.readContent(pkgJsonPath)).toContain(ngccPostinstall);
  });

  it(`should add postinstall if the script is missing`, async() => {
    tree.create(pkgJsonPath, JSON.stringify({scripts: {}}, null, 2));
    await runMigration();
    expect(tree.readContent(pkgJsonPath)).toContain(ngccPostinstall);
  });

  it(`should prepend to postinstall if script already exists`, async() => {
    tree.create(pkgJsonPath, JSON.stringify({scripts: {postinstall: 'do-something'}}, null, 2));
    await runMigration();
    expect(tree.readContent(pkgJsonPath))
        .toContain(
            `"postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points && do-something"`);
  });

  it(`should not prepend to postinstall if script contains ngcc`, async() => {
    tree.create(pkgJsonPath, JSON.stringify({scripts: {postinstall: 'ngcc --something'}}, null, 2));
    await runMigration();
    expect(tree.readContent(pkgJsonPath)).toContain(`"postinstall": "ngcc --something"`);
    expect(tree.readContent(pkgJsonPath)).not.toContain(ngccPostinstall);
    expect(tree.readContent(pkgJsonPath))
        .not.toContain(
            `ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points`);
  });

  function runMigration() {
    return runner.runSchematicAsync('migration-v9-postinstall-ngcc', {}, tree).toPromise();
  }
});
