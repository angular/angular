/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import fs from 'fs';
import path from 'path';
import shx from 'shelljs';

import {matchesObjectWithOrder} from './test_utils';

// Resolve the "npm_package" directory by using the runfile resolution. Note that we need to
// resolve the "package.json" of the package since otherwise NodeJS would resolve the "main"
// file, which is not necessarily at the root of the "npm_package".
shx.cd(path.dirname(runfiles.resolve('angular/packages/common/npm_package/package.json')));

describe('@angular/common ng_package', () => {
  describe('should have the locales files', () => {
    it('/locales', () => {
      const files = shx.ls('locales').stdout.split('\n');
      expect(files.some((n) => n.endsWith('.d.ts'))).toBe(true, `.d.ts files don't exist`);
      expect(files.some((n) => n.endsWith('.js'))).toBe(true, `.js files don't exist`);
    });
    it('/locales/extra', () => {
      const files = shx.ls('locales/extra').stdout.split('\n');
      expect(files.some((n) => n.endsWith('.d.ts'))).toBe(true, `.d.ts files don't exist`);
      expect(files.some((n) => n.endsWith('.js'))).toBe(true, `.js files don't exist`);
    });
  });

  it('should have right fesm files', () => {
    const expectedFiles = [
      'common.mjs',
      'common.mjs.map',
      'http',
      'http.mjs',
      'http.mjs.map',
      'http/testing.mjs',
      'http/testing.mjs.map',
      'testing.mjs',
      'testing.mjs.map',
      'upgrade.mjs',
      'upgrade.mjs.map',
    ];
    const allFiles = shx
      .ls('-R', 'fesm2022')
      .stdout.split('\n')
      .filter((n) => !!n)
      .sort();
    // The list of files would contain some shared chunks too (e.g. `location-CprIx2Bv.mjs`),
    // so we make sure that the actual list of files properly represent main entrypoints
    // (ignoring extra chunks info).
    const allFilesAsSet = new Set(allFiles);
    for (const expectedFile of expectedFiles) {
      expect(allFilesAsSet.has(expectedFile)).toBe(true);
    }
  });

  it('should have the correct source map paths', () => {
    expect(shx.grep('sourceMappingURL', 'fesm2022/common.mjs')).toMatch(
      '//# sourceMappingURL=common.mjs.map',
    );
    expect(shx.grep('sourceMappingURL', 'fesm2022/http.mjs')).toMatch(
      '//# sourceMappingURL=http.mjs.map',
    );
    expect(shx.grep('sourceMappingURL', 'fesm2022/http/testing.mjs')).toMatch(
      '//# sourceMappingURL=testing.mjs.map',
    );
    expect(shx.grep('sourceMappingURL', 'fesm2022/testing.mjs')).toMatch(
      '//# sourceMappingURL=testing.mjs.map',
    );
    expect(shx.grep('sourceMappingURL', 'fesm2022/upgrade.mjs')).toMatch(
      '//# sourceMappingURL=upgrade.mjs.map',
    );
  });

  describe('should have module resolution properties in the package.json file for', () => {
    interface PackageJson {
      main: string;
      es2022: string;
      module: string;
      typings: string;
      exports: object;
    }
    // https://github.com/angular/common-builds/blob/master/package.json
    it('/', () => {
      const actual = JSON.parse(
        fs.readFileSync('package.json', {encoding: 'utf-8'}),
      ) as PackageJson;

      expect(actual).toEqual(
        jasmine.objectContaining({
          module: `./fesm2022/common.mjs`,
          typings: `./index.d.ts`,
          exports: matchesObjectWithOrder({
            './locales/global/*': {default: './locales/global/*.js'},
            './locales/*': {types: './locales/*.d.ts', default: './locales/*.js'},
            './package.json': {default: './package.json'},
            '.': {
              types: './index.d.ts',
              default: './fesm2022/common.mjs',
            },
            './http': {
              types: './http/index.d.ts',
              default: './fesm2022/http.mjs',
            },
            './http/testing': {
              types: './http/testing/index.d.ts',
              default: './fesm2022/http/testing.mjs',
            },
            './testing': {
              types: './testing/index.d.ts',
              default: './fesm2022/testing.mjs',
            },
            './upgrade': {
              types: './upgrade/index.d.ts',
              default: './fesm2022/upgrade.mjs',
            },
          }),
        }),
      );
    });
    // https://github.com/angular/common-builds/blob/master/http
    it('/http', () => {
      expect(fs.existsSync('http/index.d.ts')).toBe(true);
    });
    // https://github.com/angular/common-builds/blob/master/testing
    it('/testing', () => {
      expect(fs.existsSync('testing/index.d.ts')).toBe(true);
    });
    // https://github.com/angular/common-builds/blob/master/http/testing
    it('/http/testing', () => {
      expect(fs.existsSync('http/testing/index.d.ts')).toBe(true);
    });
    // https://github.com/angular/common-builds/blob/master/upgrade
    it('/upgrade', () => {
      expect(fs.existsSync('upgrade/index.d.ts')).toBe(true);
    });
  });
});
