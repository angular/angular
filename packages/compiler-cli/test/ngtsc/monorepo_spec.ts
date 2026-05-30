/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {absoluteFrom} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('monorepos', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles, absoluteFrom('/app'));
      env.tsconfig();

      // env.tsconfig() will write to /app/tsconfig.json, but list it as extending
      // ./tsconfig-base.json. So that file should exist, and redirect to ../tsconfig-base.json.
      env.write('/app/tsconfig-base.json', JSON.stringify({'extends': '../tsconfig-base.json'}));
    });

    it('should compile a project with a reference above the current dir', () => {
      env.write(
        '/app/index.ts',
        `
        import {Component, NgModule} from '@angular/core';
        import {LibModule} from '../lib/module';

        @Component({
          selector: 'app-cmp',
          template: '<lib-cmp></lib-cmp>',
          standalone: false,
        })
        export class AppCmp {}

        @NgModule({
          declarations: [AppCmp],
          imports: [LibModule],
        })
        export class AppModule {}
      `,
      );
      env.write(
        '/lib/module.ts',
        `
        import {NgModule} from '@angular/core';
        import {LibCmp} from './cmp';

        @NgModule({
          declarations: [LibCmp],
          exports: [LibCmp],
        })
        export class LibModule {}
      `,
      );
      env.write(
        '/lib/cmp.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'lib-cmp',
          template: '...',
          standalone: false,
        })
        export class LibCmp {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('app/index.js');
      expect(jsContents).toContain(`import * as i1 from "../lib/cmp";`);
    });

    it('should compile a project with a reference into the same dir', () => {
      env.write(
        '/app/index.ts',
        `
        import {Component, NgModule} from '@angular/core';
        import {TargetModule} from './target';

        @Component({
          selector: 'app-cmp',
          template: '<target-cmp></target-cmp>',
          standalone: false,
        })
        export class AppCmp {}

        @NgModule({
          declarations: [AppCmp],
          imports: [TargetModule],
        })
        export class AppModule {}
      `,
      );

      env.write(
        '/app/target.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'target-cmp',
          template: '...',
          standalone: false,
        })
        export class TargetCmp {}

        @NgModule({
          declarations: [TargetCmp],
          exports: [TargetCmp],
        })
        export class TargetModule {}
      `,
      );

      env.driveMain();

      const jsContents = env.getContents('app/index.js');

      // Check that the relative import has the leading './'.
      expect(jsContents).toContain(`import * as i1 from "./target";`);
    });
  });
});
