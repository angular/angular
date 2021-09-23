/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runfiles} from '@bazel/runfiles';
import * as fs from 'fs';
import * as path from 'path';
import * as shx from 'shelljs';

// Resolve the "npm_package" directory by using the runfile resolution. Note that we need to
// resolve the "package.json" of the package since otherwise NodeJS would resolve the "main"
// file, which is not necessarily at the root of the "npm_package".
shx.cd(path.dirname(runfiles.resolve('angular/packages/common/npm_package/package.json')));

describe('@angular/common ng_package', () => {
  describe('should have the locales files', () => {
    it('/locales', () => {
      const files = shx.ls('locales').stdout.split('\n');
      expect(files.some(n => n.endsWith('.d.ts'))).toBe(true, `.d.ts files don't exist`);
      expect(files.some(n => n.endsWith('.mjs'))).toBe(true, `.mjs files don't exist`);
    });
    it('/locales/extra', () => {
      const files = shx.ls('locales/extra').stdout.split('\n');
      expect(files.some(n => n.endsWith('.d.ts'))).toBe(true, `.d.ts files don't exist`);
      expect(files.some(n => n.endsWith('.mjs'))).toBe(true, `.mjs files don't exist`);
    });
  });

  it('should have right fesm files', () => {
    const expected = [
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
    expect(shx.ls('-R', 'fesm2015').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
    expect(shx.ls('-R', 'fesm2020').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
  });

  it('should have the correct source map paths', () => {
    expect(shx.grep('sourceMappingURL', 'fesm2020/common.mjs'))
        .toMatch('//# sourceMappingURL=common.mjs.map');
    expect(shx.grep('sourceMappingURL', 'fesm2020/http.mjs'))
        .toMatch('//# sourceMappingURL=http.mjs.map');
    expect(shx.grep('sourceMappingURL', 'fesm2020/http/testing.mjs'))
        .toMatch('//# sourceMappingURL=testing.mjs.map');
    expect(shx.grep('sourceMappingURL', 'fesm2020/testing.mjs'))
        .toMatch('//# sourceMappingURL=testing.mjs.map');
    expect(shx.grep('sourceMappingURL', 'fesm2020/upgrade.mjs'))
        .toMatch('//# sourceMappingURL=upgrade.mjs.map');
  });

  describe('should have module resolution properties in the package.json file for', () => {
    interface PackageJson {
      main: string;
      fesm2015: string;
      es2020: string;
      module: string;
      typings: string;
      exports: object;
    }
    // https://github.com/angular/common-builds/blob/master/package.json
    it('/', () => {
      const actual =
          JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'})) as PackageJson;

      expect(actual).toEqual(jasmine.objectContaining({
        module: `./fesm2015/common.mjs`,
        es2020: `./fesm2020/common.mjs`,
        esm2020: `./esm2020/common.mjs`,
        fesm2020: `./fesm2020/common.mjs`,
        fesm2015: `./fesm2015/common.mjs`,
        typings: `./common.d.ts`,
        exports: {
          '.': {
            types: './common.d.ts',
            es2015: './fesm2015/common.mjs',
            node: './fesm2015/common.mjs',
            default: './fesm2020/common.mjs',
          },
          './package.json': {default: './package.json'},
          './http': {
            types: './http/http.d.ts',
            es2015: './fesm2015/http.mjs',
            node: './fesm2015/http.mjs',
            default: './fesm2020/http.mjs',
          },
          './http/testing': {
            types: './http/testing/testing.d.ts',
            es2015: './fesm2015/http/testing.mjs',
            node: './fesm2015/http/testing.mjs',
            default: './fesm2020/http/testing.mjs',
          },
          './testing': {
            types: './testing/testing.d.ts',
            es2015: './fesm2015/testing.mjs',
            node: './fesm2015/testing.mjs',
            default: './fesm2020/testing.mjs',
          },
          './upgrade': {
            types: './upgrade/upgrade.d.ts',
            es2015: './fesm2015/upgrade.mjs',
            node: './fesm2015/upgrade.mjs',
            default: './fesm2020/upgrade.mjs',
          },
          './locales/global/*': {default: './locales/global/*.js'},
          './locales/*': {default: './locales/*.mjs'},
        }
      }));
    });
    // https://github.com/angular/common-builds/blob/master/http/package.json
    it('/http', () => {
      const actual =
          JSON.parse(fs.readFileSync('http/package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['fesm2015']).toEqual('../fesm2015/http.mjs');
      expect(actual['es2020']).toEqual('../fesm2020/http.mjs');
      expect(actual['module']).toEqual('../fesm2015/http.mjs');
      expect(actual['typings']).toEqual('./http.d.ts');
      expect(actual['exports']).toBeUndefined();
    });
    // https://github.com/angular/common-builds/blob/master/testing/package.json
    it('/testing', () => {
      const actual =
          JSON.parse(fs.readFileSync('testing/package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['fesm2015']).toEqual('../fesm2015/testing.mjs');
      expect(actual['es2020']).toEqual('../fesm2020/testing.mjs');
      expect(actual['exports']).toBeUndefined();
    });
    // https://github.com/angular/common-builds/blob/master/http/testing/package.json
    it('/http/testing', () => {
      const actual =
          JSON.parse(fs.readFileSync('http/testing/package.json', {encoding: 'utf-8'})) as
          PackageJson;
      expect(actual['fesm2015']).toEqual('../../fesm2015/http/testing.mjs');
      expect(actual['es2020']).toEqual('../../fesm2020/http/testing.mjs');
      expect(actual['module']).toEqual('../../fesm2015/http/testing.mjs');
      expect(actual['typings']).toEqual('./testing.d.ts');
      expect(actual['exports']).toBeUndefined();
    });
    // https://github.com/angular/common-builds/blob/master/upgrade/package.json
    it('/upgrade', () => {
      const actual =
          JSON.parse(fs.readFileSync('upgrade/package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['fesm2015']).toEqual('../fesm2015/upgrade.mjs');
      expect(actual['es2020']).toEqual('../fesm2020/upgrade.mjs');
      expect(actual['module']).toEqual('../fesm2015/upgrade.mjs');
      expect(actual['typings']).toEqual('./upgrade.d.ts');
      expect(actual['exports']).toBeUndefined();
    });
  });
});
