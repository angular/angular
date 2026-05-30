/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('@Service decorator', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    // More thorough compilation tests are in `packages/compiler-cli/test/compliance/test_cases/service_decorator`.
    it('should compile an @Service class', () => {
      env.write(
        'test.ts',
        `
          import {Service} from '@angular/core';

          @Service()
          export class TestService {}
        `,
      );
      env.driveMain();

      const jsContents = env.getContents('test.js');
      const dtsContents = env.getContents('test.d.ts');
      expect(jsContents).not.toContain('__decorate');
      expect(jsContents).toContain('TestService.ɵfac =');
      expect(jsContents).toContain('TestService.ɵprov =');
      expect(dtsContents).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<TestService, never>;');
      expect(dtsContents).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<TestService>;');
    });

    it('should report if an @Service class has another Angular decorator', () => {
      env.write(
        'test.ts',
        `
          import {Service, Pipe} from '@angular/core';

          @Service()
          @Pipe({name: 'foo'})
          export class TestService {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot apply more than one Angular decorator on an @Service class.',
      );
    });

    it('should report if an @Service class uses constructor-based DI from its own constructor', () => {
      env.write(
        'test.ts',
        `
          import {Service, ApplicationRef} from '@angular/core';

          @Service()
          export class TestService {
            constructor(appRef: ApplicationRef) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        '@Service class cannot use constructor dependency injection. Use the `inject` function instead.',
      );
    });

    it('should report if an @Service class uses constructor-based DI from an inherited constructor', () => {
      env.write(
        'grandparent.ts',
        `
          import {Injectable, ApplicationRef} from '@angular/core';

          @Injectable()
          export class GrandparentService {
            constructor(appRef: ApplicationRef) {}
          }
        `,
      );

      env.write(
        'parent.ts',
        `
          import {Injectable} from '@angular/core';
          import {GrandparentService} from './grandparent';

          @Injectable()
          export class ParentService extends GrandparentService {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Service} from '@angular/core';
          import {ParentService} from './parent';

          @Service()
          export class TestService extends ParentService {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        '@Service class cannot use constructor dependency injection. Use the `inject` function instead.',
      );
    });
  });
});
