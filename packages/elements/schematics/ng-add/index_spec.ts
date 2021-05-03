/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as path from 'path';

import {Schema as ElementsOptions} from './schema';

// tslint:disable:max-line-length
describe('Elements Schematics', () => {
  const schematicRunner = new SchematicTestRunner(
      '@angular/elements',
      path.join(__dirname, '../test-collection.json'),
  );
  const defaultOptions: ElementsOptions = {project: 'elements', skipPackageJson: false};

  let appTree: UnitTestTree;

  // tslint:disable-next-line:no-any
  const workspaceOptions: any = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  };

  // tslint:disable-next-line:no-any
  const appOptions: any = {
    name: 'elements',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
  };

  beforeEach(async () => {
    appTree = await schematicRunner
                  .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
                  .toPromise();
    appTree =
        await schematicRunner
            .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree)
            .toPromise();
  });

  it('should run the ng-add schematic', async () => {
    const tree =
        await schematicRunner.runSchematicAsync('ng-add', defaultOptions, appTree).toPromise();
    expect(tree.readContent('/projects/elements/src/polyfills.ts'))
        .toContain(`import 'document-register-element';`);
  });

  it('should add polyfill as a dependency in package.json', async () => {
    const tree =
        await schematicRunner.runSchematicAsync('ng-add', defaultOptions, appTree).toPromise();
    const pkgJsonText = tree.readContent('/package.json');
    const pkgJson = JSON.parse(pkgJsonText) as {dependencies: any};
    const {dependencies} = pkgJson;
    expect(dependencies['document-register-element']).toBeDefined();
  });
});
