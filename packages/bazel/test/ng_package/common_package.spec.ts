/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as shx from 'shelljs';

shx.cd(path.join(process.env['TEST_SRCDIR'] !, 'angular', 'packages', 'common', 'npm_package'));

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
    it('doesn\'t pass require in a way that breaks webpack static analysis',
       () => { expect(shx.cat('locales/fr.js')).not.toContain('factory(require, exports)'); });
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
      'common.umd.js',
      'common.umd.js.map',
      'common.umd.min.js',
      'common.umd.min.js.map',
    ]);
  });

  it('should reference core using global symbol in umd',
     () => { expect(shx.cat('bundles/common.umd.js')).toContain('global.ng.core'); });

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
    ];
    expect(shx.ls('-R', 'fesm5').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
    expect(shx.ls('-R', 'fesm2015').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
  });

  describe('should have module resolution properties in the package.json file for', () => {
    // https://github.com/angular/common-builds/blob/master/package.json
    it('/', () => {
      const actual = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'}));
      expect(actual['main']).toEqual('./bundles/common.umd.js');
    });
    // https://github.com/angular/common-builds/blob/master/http/package.json
    it('/http', () => {
      const actual = JSON.parse(fs.readFileSync('http/package.json', {encoding: 'utf-8'}));
      expect(actual['main']).toEqual('../bundles/common-http.umd.js');
      expect(actual['es2015']).toEqual('../fesm2015/http.js');
      expect(actual['module']).toEqual('../fesm5/http.js');
      expect(actual['typings']).toEqual('./http.d.ts');
    });
    // https://github.com/angular/common-builds/blob/master/testing/package.json
    it('/testing', () => {
      const actual = JSON.parse(fs.readFileSync('testing/package.json', {encoding: 'utf-8'}));
      expect(actual['main']).toEqual('../bundles/common-testing.umd.js');
    });
    // https://github.com/angular/common-builds/blob/master/http/testing/package.json
    it('/http/testing', () => {
      const actual = JSON.parse(fs.readFileSync('http/testing/package.json', {encoding: 'utf-8'}));
      expect(actual['main']).toEqual('../../bundles/common-http-testing.umd.js');
      expect(actual['es2015']).toEqual('../../fesm2015/http/testing.js');
      expect(actual['module']).toEqual('../../fesm5/http/testing.js');
      expect(actual['typings']).toEqual('./testing.d.ts');
    });
  });
});
