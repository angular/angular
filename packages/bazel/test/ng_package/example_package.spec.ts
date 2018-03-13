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

const UTF8 = {
  encoding: 'utf-8'
};

shx.cd(path.join(
    process.env['TEST_SRCDIR'], 'angular', 'packages', 'bazel', 'test', 'ng_package', 'example',
    'npm_package'));

describe('example ng_package', () => {
  it('should have right bundle files', () => {
    expect(shx.ls('-R', 'bundles').stdout.split('\n').filter(n => !!n).sort()).toEqual([
      'example-secondary.umd.js',
      'example-secondary.umd.js.map',
      'example-secondary.umd.min.js',
      'example-secondary.umd.min.js.map',
      'example.umd.js',
      'example.umd.js.map',
      'example.umd.min.js',
      'example.umd.min.js.map',
    ]);
  });
  // FESMS currently not part of APF v6
  xit('should have right fesm files', () => {
    const expected = [
      'example.js',
      'example.js.map',
      'secondary.js',
      'secondary.js.map',
    ];
    expect(shx.ls('-R', 'esm5').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
    expect(shx.ls('-R', 'esm2015').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
  });
  it('should have right secondary sources', () => {
    const expected = [
      'index.d.ts',
      'package.json',
      'secondary.d.ts',
      'secondary.metadata.json',
      'secondarymodule.d.ts',
    ];
    expect(shx.ls('-R', 'secondary').stdout.split('\n').filter(n => !!n).sort()).toEqual(expected);
  });
  it('should have main entry point package.json properties set', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', UTF8));
    expect(packageJson['main']).toBe('./bundles/example.umd.js');
    expect(packageJson['module']).toBe('./esm5/example.js');
    expect(packageJson['es2015']).toBe('./esm2015/example.js');
    expect(packageJson['typings']).toBe('./example.d.ts');
  });
  it('should have secondary entry point package.json properties set', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join('secondary', 'package.json'), UTF8));
    expect(packageJson['main']).toBe('../bundles/example-secondary.umd.js');
    expect(packageJson['module']).toBe('../esm5/secondary/secondary.js');
    expect(packageJson['es2015']).toBe('../esm2015/secondary/secondary.js');
    expect(packageJson['typings']).toBe('./secondary.d.ts');
  });
});
