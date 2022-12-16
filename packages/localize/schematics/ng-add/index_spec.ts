/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EmptyTree, Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {runfiles} from '@bazel/runfiles';
import ts from 'typescript';

interface TsConfig {
  compilerOptions?: ts.CompilerOptions;
}

describe('ng-add schematic', () => {
  const localizeType = '@angular/localize';
  const defaultOptions = {project: 'demo'};
  const schematicRunner = new SchematicTestRunner(
      '@angular/localize', runfiles.resolvePackageRelative('../collection.json'));
  let host: Tree;

  beforeEach(() => {
    host = new EmptyTree();

    host.create('package.json', JSON.stringify({
      'devDependencies': {
        // The default (according to `ng-add` in its package.json) is for `@angular/localize` to be
        // saved to `devDependencies`.
        '@angular/localize': '~0.0.0-PLACEHOLDER',
      },
    }));

    host.create('angular.json', JSON.stringify({
      version: 1,
      projects: {
        'demo': {
          root: '',
          architect: {
            build: {
              builder: '@angular-devkit/build-angular:browser',
              options: {
                tsConfig: './tsconfig.app.json',
              },
            },
            test: {
              builder: '@angular-devkit/build-angular:karma',
              options: {
                tsConfig: './tsconfig.spec.json',
              },
            },
            server: {
              builder: '@angular-devkit/build-angular:server',
              options: {
                tsConfig: './tsconfig.server.json',
              },
            },
            unknown: {
              builder: '@custom-builder/build-angular:unknown',
              options: {
                tsConfig: './tsconfig.unknown.json',
              },
            },
          },
        },
      },
    }));
  });

  it(`should add '@angular/localize' in 'types' in the root level 'tsconfig.json'`, async () => {
    host.create('tsconfig.json', JSON.stringify({
      compilerOptions: {
        types: ['node'],
      },
    }));

    host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
    const {compilerOptions} = host.readJson('tsconfig.json') as TsConfig;
    const types = compilerOptions?.types;
    expect(types).toContain(localizeType);
    expect(types).toHaveSize(2);
  });

  it(`should not add '@angular/localize' in 'types' tsconfig when '@angular/localize/init' is present`,
     async () => {
       host.create('tsconfig.json', JSON.stringify({
         compilerOptions: {
           types: ['node', '@angular/localize/init'],
         },
       }));

       host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
       const {compilerOptions} = host.readJson('tsconfig.json') as TsConfig;
       const types = compilerOptions?.types;
       expect(types).not.toContain(localizeType);
       expect(types).toHaveSize(2);
     });


  it(`should not add '@angular/localize' in 'types' tsconfigs referenced in non official builders`,
     async () => {
       const tsConfig = JSON.stringify({
         compilerOptions: {
           types: ['node'],
         },
       });

       host.create('tsconfig.unknown.json', tsConfig);

       host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
       const {compilerOptions} = host.readJson('tsconfig.unknown.json') as TsConfig;
       const types = compilerOptions?.types;
       expect(types).not.toContain('@angular/localize');
       expect(types).toHaveSize(1);
     });

  it(`should add '@angular/localize' in 'types' tsconfigs referenced in browser builder`,
     async () => {
       const tsConfig = JSON.stringify({
         compilerOptions: {
           types: ['node'],
         },
       });

       host.create('tsconfig.app.json', tsConfig);

       host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
       const {compilerOptions} = host.readJson('tsconfig.app.json') as TsConfig;
       const types = compilerOptions?.types;
       expect(types).toContain('@angular/localize');
       expect(types).toHaveSize(2);
     });


  it(`should add '@angular/localize' in 'types' tsconfigs referenced in karma builder`,
     async () => {
       const tsConfig = JSON.stringify({
         compilerOptions: {
           types: ['node'],
         },
       });

       host.create('tsconfig.spec.json', tsConfig);

       host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
       const {compilerOptions} = host.readJson('tsconfig.spec.json') as TsConfig;
       const types = compilerOptions?.types;
       expect(types).toContain('@angular/localize');
       expect(types).toHaveSize(2);
     });

  it(`should add '@angular/localize' in 'types' tsconfigs referenced in server builder`,
     async () => {
       const tsConfig = JSON.stringify({
         compilerOptions: {},
       });

       host.create('tsconfig.server.json', tsConfig);

       host = await schematicRunner.runSchematicAsync('ng-add', defaultOptions, host).toPromise();
       const {compilerOptions} = host.readJson('tsconfig.server.json') as TsConfig;
       const types = compilerOptions?.types;
       expect(types).toContain('@angular/localize');
       expect(types).toHaveSize(1);
     });

  it('should add package to `dependencies` if `useAtRuntime` is `true`', async () => {
    host = await schematicRunner
               .runSchematicAsync('ng-add', {...defaultOptions, useAtRuntime: true}, host)
               .toPromise();

    const {devDependencies, dependencies} = host.readJson('/package.json') as {
      devDependencies: {[key: string]: string};
      dependencies: {[key: string]: string};
    };
    expect(dependencies?.['@angular/localize']).toBe('~0.0.0-PLACEHOLDER');
    expect(devDependencies?.['@angular/localize']).toBeUndefined();
  });
});
