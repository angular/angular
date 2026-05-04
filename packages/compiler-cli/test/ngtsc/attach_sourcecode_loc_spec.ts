/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setEnableTemplateSourceLocations} from '@angular/compiler';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('attachSourcecodeLoc phase', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      setEnableTemplateSourceLocations(true);
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    afterEach(() => {
      setEnableTemplateSourceLocations(false);
    });

    it('should attach the sourcecode location as a data attribute', () => {
      env.write(
        `test.ts`,
        `
          import {Component} from '@angular/core';

          @Component({
            template: \`<div><span>Hello</span></div>\`,
          })
          class Comp {}
         `,
      );
      env.driveMain();
      const content = env.getContents('test.js');

      // The div
      expect(content).toContain(`["data-sourcecode-loc", "test.ts;l=5-5;c=24-53"]`);
      // The span
      expect(content).toContain(`["data-sourcecode-loc", "test.ts;l=5-5;c=29-47"]`);
    });
  });
});
