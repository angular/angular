/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';
import ts from 'typescript';

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
    expect(options.annotateForClosureCompiler).toBeTrue();
    expect(options.annotationsAs).toBe('decorators');
    expect(options.skipMetadataEmit).toBeTrue();
  });

  it(`should return undefined when debug is not defined in "angularCompilerOptions"`, () => {
    writeSomeConfigs();
    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options['debug']).toBeUndefined();
  });

  it(`should return 'debug: false' when debug is disabled in "angularCompilerOptions"`, () => {
    writeSomeConfigs();
    support.writeFiles({
      'tsconfig-level-3.json': `{
          "angularCompilerOptions": {
            "debug": false
          }
        }
      `,
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options['debug']).toBeFalse();
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
      `,
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'), {
      annotateForClosureCompiler: false,
      target: ts.ScriptTarget.ES2015,
      debug: false,
    });

    expect(options).toEqual(
      jasmine.objectContaining({
        debug: false,
        target: ts.ScriptTarget.ES2015,
        annotateForClosureCompiler: false,
      }),
    );
  });

  it('should merge tsconfig "angularCompilerOptions" when extends points to node package', () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "extends": "@angular-ru/tsconfig",
          "angularCompilerOptions": {
            "debug": false
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
    expect(options).toEqual(
      jasmine.objectContaining({
        strict: true,
        skipMetadataEmit: true,
        debug: false,
      }),
    );
  });

  it('should merge tsconfig "angularCompilerOptions" when extends points to an extension less non rooted file', () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
            "extends": "@1stg/tsconfig/angular",
            "angularCompilerOptions": {
              "debug": false
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
    expect(options).toEqual(
      jasmine.objectContaining({
        strict: true,
        skipMetadataEmit: true,
        debug: false,
      }),
    );
  });

  it('should merge tsconfig "angularCompilerOptions" when extends points to a non rooted file without json extension', () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
            "extends": "./tsconfig.app",
            "angularCompilerOptions": {
              "debug": false
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
    expect(options).toEqual(
      jasmine.objectContaining({
        strict: true,
        skipMetadataEmit: true,
        debug: false,
      }),
    );
  });

  it('should merge tsconfig "angularCompilerOptions" when extends is aarray', () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
        "extends": [
          "./tsconfig-level-2.json",
          "./tsconfig-level-3.json",
        ],
        "compilerOptions": {
          "target": "es2020"
        },
        "angularCompilerOptions": {
          "annotateForClosureCompiler": false,
          "debug": false
        }
      }`,
      'tsconfig-level-2.json': `{
        "compilerOptions": {
          "target": "es5",
          "module": "es2015"
        },
        "angularCompilerOptions": {
          "skipMetadataEmit": true,
          "annotationsAs": "decorators"
        }
      }`,
      'tsconfig-level-3.json': `{
        "compilerOptions": {
          "target": "esnext",
          "module": "esnext"
        },
        "angularCompilerOptions": {
          "annotateForClosureCompiler": true,
          "skipMetadataEmit": false
        }
      }`,
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options).toEqual(
      jasmine.objectContaining({
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        debug: false,
        annotationsAs: 'decorators',
        annotateForClosureCompiler: false,
        skipMetadataEmit: false,
      }),
    );
  });

  it(`should not deep merge objects. (Ex: 'paths' and 'extendedDiagnostics')`, () => {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "extends": "./tsconfig-level-2.json",
          "compilerOptions": {
            "paths": {
              "@angular/core": ["/*"]
            }
          },
          "angularCompilerOptions": {
            "extendedDiagnostics": {
              "checks": {
                "textAttributeNotBinding": "suppress"
              }
            }
          }
        }
      `,
      'tsconfig-level-2.json': `{
          "compilerOptions": {
            "strict": false,
            "paths": {
              "@angular/common": ["/*"]
            }
          },
          "angularCompilerOptions": {
            "skipMetadataEmit": true,
            "extendedDiagnostics": {
              "checks": {
                "nullishCoalescingNotNullable": "suppress"
              }
            }
          }
        }
      `,
    });

    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options).toEqual(
      jasmine.objectContaining({
        strict: false,
        skipMetadataEmit: true,
        extendedDiagnostics: {checks: {textAttributeNotBinding: 'suppress'}},
        paths: {'@angular/core': ['/*']},
      }),
    );
  });
});
