/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {makeEntryPointBundle} from '../../src/packages/entry_point_bundle';
import {MockFileSystem} from '../helpers/mock_file_system';

const _ = AbsoluteFsPath.from;

function createMockFileSystem() {
  return new MockFileSystem({
    '/node_modules/test': {
      'package.json':
          '{"module": "./index.js", "es2015": "./es2015/index.js", "typings": "./index.d.ts"}',
      'index.d.ts': 'export * from "./public_api";',
      'index.js': 'export * from "./public_api";',
      'index.metadata.json': '...',
      'public_api.d.ts': `
        export * from "test/secondary";
        export * from "./nested";
        export declare class TestClass {};
      `,
      'public_api.js': `
        export * from "test/secondary";
        export * from "./nested";
        export const TestClass = function() {};
       `,
      'root.d.ts': `
        import * from 'other';
        export declare class RootClass {};
      `,
      'root.js': `
        import * from 'other';
        export const RootClass = function() {};
      `,
      'nested': {
        'index.d.ts': 'export * from "../root";',
        'index.js': 'export * from "../root";',
      },
      'es2015': {
        'index.js': 'export * from "./public_api";',
        'public_api.js': 'export class TestClass {};',
        'root.js': `
          import * from 'other';
          export class RootClass {};
        `,
        'nested': {
          'index.js': 'export * from "../root";',
        },
      },
      'secondary': {
        'package.json':
            '{"module": "./index.js", "es2015": "./es2015/index.js", "typings": "./index.d.ts"}',
        'index.d.ts': 'export * from "./public_api";',
        'index.js': 'export * from "./public_api";',
        'index.metadata.json': '...',
        'public_api.d.ts': 'export declare class SecondaryClass {};',
        'public_api.js': 'export class SecondaryClass {};',
        'es2015': {
          'index.js': 'export * from "./public_api";',
          'public_api.js': 'export class SecondaryClass {};',
        },
      },
    },
    '/node_modules/other': {
      'package.json':
          '{"module": "./index.js", "es2015": "./es2015/index.js", "typings": "./index.d.ts"}',
      'index.d.ts': 'export * from "./public_api";',
      'index.js': 'export * from "./public_api";',
      'index.metadata.json': '...',
      'public_api.d.ts': 'export declare class OtherClass {};',
      'public_api.js': 'export class OtherClass {};',
      'es2015': {
        'index.js': 'export * from "./public_api";',
        'public_api.js': 'export class OtherClass {};',
      },
    },
  });
}

describe('entry point bundle', () => {
  // https://github.com/angular/angular/issues/29939
  it('should resolve JavaScript sources instead of declaration files if they are adjacent', () => {
    const fs = createMockFileSystem();
    const esm5bundle = makeEntryPointBundle(
        fs, '/node_modules/test', './index.js', './index.d.ts', false, 'esm5', 'esm5', true) !;

    expect(esm5bundle.src.program.getSourceFiles().map(sf => sf.fileName))
        .toEqual(jasmine.arrayWithExactContents([
          // Modules from the entry-point itself should be source files
          '/node_modules/test/index.js',
          '/node_modules/test/public_api.js',
          '/node_modules/test/nested/index.js',
          '/node_modules/test/root.js',

          // Modules from a secondary entry-point should be declaration files
          '/node_modules/test/secondary/public_api.d.ts',
          '/node_modules/test/secondary/index.d.ts',

          // Modules resolved from "other" should be declaration files
          '/node_modules/other/public_api.d.ts',
          '/node_modules/other/index.d.ts',
        ].map(p => _(p).toString())));

    expect(esm5bundle.dts !.program.getSourceFiles().map(sf => sf.fileName))
        .toEqual(jasmine.arrayWithExactContents([
          // All modules in the dts program should be declaration files
          '/node_modules/test/index.d.ts',
          '/node_modules/test/public_api.d.ts',
          '/node_modules/test/nested/index.d.ts',
          '/node_modules/test/root.d.ts',
          '/node_modules/test/secondary/public_api.d.ts',
          '/node_modules/test/secondary/index.d.ts',
          '/node_modules/other/public_api.d.ts',
          '/node_modules/other/index.d.ts',
        ].map(p => _(p).toString())));
  });
});
