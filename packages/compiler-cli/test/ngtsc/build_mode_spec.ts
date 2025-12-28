/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {main} from '../../src/main';
import {getFileSystem} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngc build mode (project references)', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
    });

    it('builds referenced projects with -b and produces .tsbuildinfo', () => {
      // lib1
      env.write(
        'lib1/src/index.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'lib-cmp',
          template: 'lib',
          standalone: true,
        })
        export class LibCmp {}

        export const LIB_VALUE = 1;
        `,
      );
      env.write(
        'lib1/tsconfig.json',
        JSON.stringify(
          {
            extends: '../tsconfig-base.json',
            compilerOptions: {
              composite: true,
              outDir: '../built/lib1',
              rootDir: '.',
              tsBuildInfoFile: '../built/lib1.tsbuildinfo',
            },
            angularCompilerOptions: {
              compilationMode: 'partial',
            },
            include: ['src/**/*.ts'],
          },
          null,
          2,
        ),
      );

      // lib2
      env.write(
        'lib2/src/index.ts',
        `
        import {LIB_VALUE} from 'lib1';
        export const LIB2_VALUE = LIB_VALUE + 1;
        `,
      );
      env.write(
        'lib2/tsconfig.json',
        JSON.stringify(
          {
            extends: '../tsconfig-base.json',
            compilerOptions: {
              composite: true,
              outDir: '../built/lib2',
              rootDir: '.',
              baseUrl: '.',
              // Resolve lib1 from its built declaration output so build ordering matters.
              paths: {
                lib1: ['../built/lib1/src/index.d.ts'],
              },
              tsBuildInfoFile: '../built/lib2.tsbuildinfo',
            },
            references: [{path: '../lib1'}],
            include: ['src/**/*.ts'],
          },
          null,
          2,
        ),
      );

      const errorSpy = jasmine.createSpy('consoleError');
      const exitCode = main(['-b', '/lib2/tsconfig.json'], errorSpy);
      expect(exitCode).toBe(0);
      expect(errorSpy).not.toHaveBeenCalled();

      const fs = getFileSystem();
      expect(fs.exists(fs.resolve('/built/lib1.tsbuildinfo'))).toBeTrue();
      expect(fs.exists(fs.resolve('/built/lib2.tsbuildinfo'))).toBeTrue();

      const lib1Js = fs.readFile(fs.resolve('/built/lib1/src/index.js'));
      expect(lib1Js).toContain('ngDeclareComponent');
    });

    it('produces .tsbuildinfo for single-project incremental builds', () => {
      env.write(
        'index.ts',
        `
        export const X = 123;
        `,
      );

      env.write(
        'tsconfig.json',
        JSON.stringify(
          {
            extends: './tsconfig-base.json',
            compilerOptions: {
              incremental: true,
              tsBuildInfoFile: './built/root.tsbuildinfo',
            },
            files: ['index.ts'],
          },
          null,
          2,
        ),
      );

      const errorSpy = jasmine.createSpy('consoleError');
      const exitCode = main(['-p', '/'], errorSpy);
      expect(exitCode).toBe(0);
      expect(errorSpy).not.toHaveBeenCalled();

      const fs = getFileSystem();
      expect(fs.exists(fs.resolve('/built/root.tsbuildinfo'))).toBeTrue();
    });

    it('fails the build when Angular diagnostics are present', () => {
      env.write(
        'bad/src/index.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'bad-cmp',
          template: '{{ doesNotExist + 1 }}',
          standalone: true,
        })
        export class BadCmp {}
        `,
      );
      env.write(
        'bad/tsconfig.json',
        JSON.stringify(
          {
            extends: '../tsconfig-base.json',
            compilerOptions: {
              composite: true,
              outDir: '../built/bad',
              rootDir: '.',
              tsBuildInfoFile: '../built/bad.tsbuildinfo',
            },
            angularCompilerOptions: {
              strictTemplates: true,
              compilationMode: 'partial',
            },
            include: ['src/**/*.ts'],
          },
          null,
          2,
        ),
      );

      const errorSpy = jasmine.createSpy('consoleError');
      const exitCode = main(['-b', '/bad/tsconfig.json'], errorSpy);
      expect(exitCode).toBe(1);
      expect(errorSpy).toHaveBeenCalled();

      // Ensure TypeScript considers it a diagnostic error.
      const output =
        errorSpy.calls
          .allArgs()
          .map((args) => args.map(String).join(' '))
          .join('\n') || '';
      expect(output).toContain('doesNotExist');
    });
  });
});
