/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const trim = (input: string): string => input.replace(/\s+/g, ' ').trim();

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ModuleWithProviders generic type transform', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should add a generic type for static methods on exported classes', () => {
      env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule()
        export class TestModule {
          static forRoot() {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('import * as i0 from "@angular/core";');
      expect(dtsContents).toContain('static forRoot(): i0.ModuleWithProviders<TestModule>;');
    });

    it('should not add a generic type for non-static methods', () => {
      env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule()
        export class TestModule {
          forRoot() {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('import * as i0 from "@angular/core";');
      expect(dtsContents).toContain('forRoot(): { ngModule: typeof TestModule; };');
      expect(dtsContents).not.toContain('static forRoot()');
    });

    it('should add a generic type for exported functions', () => {
      env.write('test.ts', `
        import {NgModule} from '@angular/core';

        export function forRoot() {
          return {
            ngModule: TestModule,
          };
        }

        @NgModule()
        export class TestModule {}
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('import * as i0 from "@angular/core";');
      expect(dtsContents)
          .toContain('export declare function forRoot(): i0.ModuleWithProviders<TestModule>;');
    });

    it('should not add a generic type when already present', () => {
      env.write('test.ts', `
        import {NgModule, ModuleWithProviders} from '@angular/core';

        export class TestModule {
          forRoot(): ModuleWithProviders<InternalTestModule> {
            return {
              ngModule: TestModule,
            };
          }
        }

        @NgModule()
        export class InternalTestModule {}
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('forRoot(): ModuleWithProviders<InternalTestModule>;');
    });

    it('should add a generic type when missing the generic type parameter', () => {
      env.write('test.ts', `
        import {NgModule, ModuleWithProviders} from '@angular/core';

        @NgModule()
        export class TestModule {
          static forRoot(): ModuleWithProviders {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('static forRoot(): i0.ModuleWithProviders<TestModule>;');
    });

    it('should add a generic type when missing the generic type parameter (qualified name)', () => {
      env.write('test.ts', `
        import * as ng from '@angular/core';

        @ng.NgModule()
        export class TestModule {
          static forRoot(): ng.ModuleWithProviders {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('static forRoot(): i0.ModuleWithProviders<TestModule>;');
    });

    it('should add a generic type and add an import for external references', () => {
      env.write('test.ts', `
        import {ModuleWithProviders} from '@angular/core';
        import {InternalTestModule} from './internal';

        export class TestModule {
          static forRoot(): ModuleWithProviders {
            return {
              ngModule: InternalTestModule,
            };
          }
        }
      `);
      env.write('internal.ts', `
        import {NgModule} from '@angular/core';

        @NgModule()
        export class InternalTestModule {}
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('import * as i1 from "./internal";');
      expect(dtsContents)
          .toContain('static forRoot(): i0.ModuleWithProviders<i1.InternalTestModule>;');
    });

    it('should not add a generic type if the return type is not ModuleWithProviders', () => {
      env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule()
        export class TestModule {
          static forRoot(): { ngModule: typeof TestModule } {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('static forRoot(): { ngModule: typeof TestModule; };');
    });

    it('should not add a generic type if the return type is not ModuleWithProviders from @angular/core',
       () => {
         env.write('test.ts', `
        import {NgModule} from '@angular/core';
        import {ModuleWithProviders} from './mwp';

        @NgModule()
        export class TestModule {
          static forRoot(): ModuleWithProviders {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);
         env.write('mwp.ts', `
      export type ModuleWithProviders = { ngModule: any };
      `);

         env.driveMain();

         const dtsContents = trim(env.getContents('test.d.ts'));
         expect(dtsContents).toContain('static forRoot(): ModuleWithProviders;');
       });

    it('should not add a generic type when the "ngModule" property is not a reference', () => {
      env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule()
        export class TestModule {
          static forRoot() {
            return {
              ngModule: 'test',
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).toContain('static forRoot(): { ngModule: string; };');
    });

    it('should not add a generic type when the class is not exported', () => {
      env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule()
        class TestModule {
          static forRoot() {
            return {
              ngModule: TestModule,
            };
          }
        }
      `);

      env.driveMain();

      // The TestModule class is not exported so doesn't even show up in the declaration file
      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents).not.toContain('static forRoot()');
    });

    it('should add a generic type only when ngModule/providers are present', () => {
      env.write('test.ts', `
        import {NgModule, ModuleWithProviders} from '@angular/core';

        @NgModule()
        export class TestModule {
          static hasNgModuleAndProviders() {
            return {
              ngModule: TestModule,
              providers: [],
            };
          }
          static hasNgModuleAndFoo() {
            return {
              ngModule: TestModule,
              foo: 'test',
            };
          }
        }
      `);

      env.driveMain();

      const dtsContents = trim(env.getContents('test.d.ts'));
      expect(dtsContents)
          .toContain('static hasNgModuleAndProviders(): i0.ModuleWithProviders<TestModule>;');
      expect(dtsContents)
          .toContain('static hasNgModuleAndFoo(): { ngModule: typeof TestModule; foo: string; };');
    });
  });
});
