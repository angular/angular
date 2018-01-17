/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {setup} from './test_support';

describe('ngc_wrapped', () => {

  it('should work', () => {
    const {read, write, runOneBuild, writeConfig, shouldExist, basePath} = setup();

    write('some_project/index.ts', `
      import {Component} from '@angular/core';
      console.log('works: ', Component);
    `);

    writeConfig({
      srcTargetPath: 'some_project',
    });

    // expect no error
    expect(runOneBuild()).toBe(true);

    shouldExist('bazel-bin/some_project/index.js');

    expect(read('bazel-bin/some_project/index.js'))
        .toContain(`console.log('works: ', core_1.Component);`);
  });
});
