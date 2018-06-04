/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import {Observable} from 'rxjs';
import {concatMap} from 'rxjs/operators';

import {Schema as ElementsOptions} from './schema';


const polyfillPath = 'node_modules/document-register-element/build/document-register-element.js';

// tslint:disable:max-line-length
describe('Elements Schematics', () => {
  const schematicRunner = new SchematicTestRunner(
      '@angular/elements', path.join(__dirname, '../test-collection.json'), );
  const defaultOptions: ElementsOptions = {project: 'bar', skipPackageJson: false};

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

  beforeEach((done) => {
    schematicRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
        .pipe(concatMap(
            (tree) => schematicRunner.runExternalSchematicAsync(
                '@schematics/angular', 'application', appOptions, tree)))
        .subscribe((tree: UnitTestTree) => appTree = tree, done.fail, done);
  });

  it('should run the ng-add schematic', () => {
    const tree = schematicRunner.runSchematic('ng-add', defaultOptions, appTree);
    const configText = tree.readContent('/angular.json');
    const config = JSON.parse(configText);
    const scripts = config.projects.elements.architect.build.options.scripts;
    expect(scripts[0].input).toEqual(polyfillPath);
  });
});
