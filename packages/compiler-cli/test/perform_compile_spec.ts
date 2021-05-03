/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {readConfiguration} from '../src/perform_compile';

import {setup, TestSupport} from './test_support';

describe('perform_compile', () => {
  let support: TestSupport;
  let basePath: string;

  beforeEach(() => {
    support = setup();
    basePath = support.basePath;
  });

  function writeSomeConfigs() {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "extends": "./tsconfig-level-2.json",
          "angularCompilerOptions": {
            "annotateForClosureCompiler": true
          }
        }
      `,
      'tsconfig-level-2.json': `{
          "extends": "./tsconfig-level-3.json",
          "angularCompilerOptions": {
            "skipMetadataEmit": true
          }
        }
      `,
      'tsconfig-level-3.json': `{
          "angularCompilerOptions": {
            "annotateForClosureCompiler": false,
            "annotationsAs": "decorators"
          }
        }
      `,
    });
  }

  it('should merge tsconfig "angularCompilerOptions"', () => {
    writeSomeConfigs();
    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options.annotateForClosureCompiler).toBe(true);
    expect(options.annotationsAs).toBe('decorators');
    expect(options.skipMetadataEmit).toBe(true);
  });

  it(`should return 'enableIvy: true' when enableIvy is not defined in "angularCompilerOptions"`,
     () => {
       writeSomeConfigs();
       const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
       expect(options.enableIvy).toBe(true);
     });

  it(`should return 'enableIvy: false' when enableIvy is disabled in "angularCompilerOptions"`,
     () => {
       writeSomeConfigs();
       support.writeFiles({
         'tsconfig-level-3.json': `{
          "angularCompilerOptions": {
            "enableIvy": false
          }
        }
      `,
       });

       const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
       expect(options.enableIvy).toBe(false);
     });

  it('should override options defined in tsconfig with those defined in `existingOptions`', () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "compilerOptions": {
            "target": "es2020"
          },
          "angularCompilerOptions": {
            "annotateForClosureCompiler": true
          }
        }
      `
    });

    const {options} = readConfiguration(
        path.resolve(basePath, 'tsconfig-level-1.json'),
        {annotateForClosureCompiler: false, target: ts.ScriptTarget.ES2015, enableIvy: false});

    expect(options).toEqual(jasmine.objectContaining({
      enableIvy: false,
      target: ts.ScriptTarget.ES2015,
      annotateForClosureCompiler: false,
    }));
  });

  it('should merge tsconfig "angularCompilerOptions" when extends points to node package', () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "extends": "@angular-ru/tsconfig",
          "angularCompilerOptions": {
            "enableIvy": false
          }
        }
      `,
      'node_modules/@angular-ru/tsconfig/tsconfig.json': `{
          "compilerOptions": {
            "strict": true
          },
          "angularCompilerOptions": {
            "skipMetadataEmit": true
          }
        }
      `,
      'node_modules/@angular-ru/tsconfig/package.json': `{
        "name": "@angular-ru/tsconfig",
        "version": "0.0.0",
        "main": "./tsconfig.json"
      }
    `,
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options).toEqual(jasmine.objectContaining({
      strict: true,
      skipMetadataEmit: true,
      enableIvy: false,
    }));
  });

  it('should merge tsconfig "angularCompilerOptions" when extends points to an extension less non rooted file',
     () => {
       support.writeFiles({
         'tsconfig-level-1.json': `{
            "extends": "@1stg/tsconfig/angular",
            "angularCompilerOptions": {
              "enableIvy": false
            }
          }`,
         'node_modules/@1stg/tsconfig/angular.json': `{
            "compilerOptions": {
              "strict": true
            },
            "angularCompilerOptions": {
              "skipMetadataEmit": true
            }
          }`,
         'node_modules/@1stg/tsconfig/package.json': `{
            "name": "@1stg/tsconfig",
            "version": "0.0.0"
          }`,
       });

       const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
       expect(options).toEqual(jasmine.objectContaining({
         strict: true,
         skipMetadataEmit: true,
         enableIvy: false,
       }));
     });

  it('should merge tsconfig "angularCompilerOptions" when extends points to a non rooted file without json extension',
     () => {
       support.writeFiles({
         'tsconfig-level-1.json': `{
            "extends": "./tsconfig.app",
            "angularCompilerOptions": {
              "enableIvy": false
            }
          }`,
         'tsconfig.app.json': `{
            "compilerOptions": {
              "strict": true
            },
            "angularCompilerOptions": {
              "skipMetadataEmit": true
            }
          }`,
       });

       const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
       expect(options).toEqual(jasmine.objectContaining({
         strict: true,
         skipMetadataEmit: true,
         enableIvy: false,
       }));
     });
});
