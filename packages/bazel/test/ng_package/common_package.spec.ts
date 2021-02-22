/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {obsoleteInIvy} from '@angular/private/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as shx from 'shelljs';

/** Runfiles helper from bazel to resolve file name paths.  */
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']!);

// Resolve the "npm_package" directory by using the runfile resolution. Note that we need to
// resolve the "package.json" of the package since otherwise NodeJS would resolve the "main"
// file, which is not necessarily at the root of the "npm_package".
shx.cd(path.dirname(runfiles.resolve('angular/packages/common/npm_package/package.json')));

describe('@angular/common ng_package', () => {
  describe('should have the locales files', () => {
    it('/locales', () => {
      const files = shx.ls('locales').stdout.split('\n');
      expect(files.some(n => n.endsWith('.d.ts'))).toBe(true, `.d.ts files don't exist`);
      expect(files.some(n => n.endsWith('.js'))).toBe(true, `.js files don't exist`);
    });
    it('/locales/extra', () => {
      const files = shx.ls('locales/extra').stdout.split('\n');
      expect(files.some(n => n.endsWith('.d.ts'))).toBe(true, `.d.ts files don't exist`);
      expect(files.some(n => n.endsWith('.js'))).toBe(true, `.js files don't exist`);
    });
    // regression test for https://github.com/angular/angular/issues/23217
    // Note, we don't have an e2e test that covers this
    it('doesn\'t pass require in a way that breaks webpack static analysis', () => {
      expect(shx.cat('locales/fr.js')).not.toContain('factory(require, exports)');
    });
  });

  it('should have right bundle files', () => {
    expect(shx.ls('-R', 'bundles').stdout.split('\n').filter(n => !!n).sort()).toEqual([
      'common-http-testing.umd.js',
      'common-http-testing.umd.js.map',
      'common-http-testing.umd.min.js',
      'common-http-testing.umd.min.js.map',
      'common-http.umd.js',
      'common-http.umd.js.map',
      'common-http.umd.min.js',
      'common-http.umd.min.js.map',
      'common-testing.umd.js',
      'common-testing.umd.js.map',
      'common-testing.umd.min.js',
      'common-testing.umd.min.js.map',
      'common-upgrade.umd.js',
      'common-upgrade.umd.js.map',
      'common-upgrade.umd.min.js',
      'common-upgrade.umd.min.js.map',
      'common.umd.js',
      'common.umd.js.map',
      'common.umd.min.js',
      'common.umd.min.js.map',
    ]);
  });

  it('should reference core using global symbol in umd', () => {
    expect(shx.cat('bundles/common.umd.js')).toContain('global.ng.core');
  });

  it('should have right fesm files', () => {
    const expected = [
      'common.js',
      'common.js.map',
      'http',
      'http.js',
      'http.js.map',
      'http/testing.js',
      'http/testing.js.map',
      'testing.js',
      'testing.js.map',
      'upgrade.js',
      'upgrade.js.map',
    ];
    expect(shx.ls('-R', 'fesm2015').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
  });

  it('should have the correct source map paths', () => {
    expect(shx.grep('sourceMappingURL', 'fesm2015/common.js'))
        .toMatch('//# sourceMappingURL=common.js.map');
    expect(shx.grep('sourceMappingURL', 'fesm2015/http.js'))
        .toMatch('//# sourceMappingURL=http.js.map');
    expect(shx.grep('sourceMappingURL', 'fesm2015/http/testing.js'))
        .toMatch('//# sourceMappingURL=testing.js.map');
    expect(shx.grep('sourceMappingURL', 'fesm2015/testing.js'))
        .toMatch('//# sourceMappingURL=testing.js.map');
    expect(shx.grep('sourceMappingURL', 'fesm2015/upgrade.js'))
        .toMatch('//# sourceMappingURL=upgrade.js.map');
  });

  describe('secondary entry-point', () => {
    obsoleteInIvy(
        `now that we don't need metadata files, we don't need these redirects to help resolve paths to them`)
        .it('should contain a root type definition re-export', () => {
          expect(shx.cat('./testing.d.ts')).toContain(`export * from './testing/testing';`);
        });
  });


  describe('should have module resolution properties in the package.json file for', () => {
    interface PackageJson {
      main: string;
      es2015: string;
      module: string;
      typings: string;
    }
    // https://github.com/angular/common-builds/blob/master/package.json
    it('/', () => {
      const actual =
          JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['main']).toEqual('./bundles/common.umd.js');
    });
    // https://github.com/angular/common-builds/blob/master/http/package.json
    it('/http', () => {
      const actual =
          JSON.parse(fs.readFileSync('http/package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['main']).toEqual('../bundles/common-http.umd.js');
      expect(actual['es2015']).toEqual('../fesm2015/http.js');
      expect(actual['module']).toEqual('../fesm2015/http.js');
      expect(actual['typings']).toEqual('./http.d.ts');
    });
    // https://github.com/angular/common-builds/blob/master/testing/package.json
    it('/testing', () => {
      const actual =
          JSON.parse(fs.readFileSync('testing/package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['main']).toEqual('../bundles/common-testing.umd.js');
    });
    // https://github.com/angular/common-builds/blob/master/http/testing/package.json
    it('/http/testing', () => {
      const actual =
          JSON.parse(fs.readFileSync('http/testing/package.json', {encoding: 'utf-8'})) as
          PackageJson;
      expect(actual['main']).toEqual('../../bundles/common-http-testing.umd.js');
      expect(actual['es2015']).toEqual('../../fesm2015/http/testing.js');
      expect(actual['module']).toEqual('../../fesm2015/http/testing.js');
      expect(actual['typings']).toEqual('./testing.d.ts');
    });
    // https://github.com/angular/common-builds/blob/master/upgrade/package.json
    it('/upgrade', () => {
      const actual =
          JSON.parse(fs.readFileSync('upgrade/package.json', {encoding: 'utf-8'})) as PackageJson;
      expect(actual['main']).toEqual('../bundles/common-upgrade.umd.js');
      expect(actual['es2015']).toEqual('../fesm2015/upgrade.js');
      expect(actual['module']).toEqual('../fesm2015/upgrade.js');
      expect(actual['typings']).toEqual('./upgrade.d.ts');
    });
  });
});
