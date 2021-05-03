/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

import {setup} from './test_support';

describe('ngc_wrapped', () => {
  it('should work', () => {
    const {read, write, runOneBuild, writeConfig, shouldExist, basePath, typesRoots} = setup();

    write('some_project/index.ts', `
      import {Component} from '@angular/core';
      import {a} from 'ambient_module';
      console.log('works: ', Component);
    `);

    const typesFile = path.resolve(basePath, typesRoots, 'thing', 'index.d.ts');

    write(typesFile, `
      declare module "ambient_module" {
        declare const a = 1;
      }
    `);

    writeConfig({
      srcTargetPath: 'some_project',
      depPaths: [path.dirname(typesFile)],
    });

    // expect no error
    expect(runOneBuild()).toBe(true);

    shouldExist('bazel-bin/some_project/index.js');

    expect(read('bazel-bin/some_project/index.js'))
        .toContain(`console.log('works: ', core_1.Component);`);
  });
});
