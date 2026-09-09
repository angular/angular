/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('ngtsc @boundary type checking', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({fullTemplateTypeCheck: true, strictTemplates: true});
    });

    it('should type check error alias as Error', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal</div>
            } @error (let err) {
              <div>{{ err.message }}</div>
            }
          \`,
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should error when accessing non-existent properties on error alias', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal</div>
            } @error (let err) {
              <div>{{ err.nonExistentProperty }}</div>
            }
          \`,
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        "Property 'nonExistentProperty' does not exist on type 'Error'",
      );
    });

    it('should narrowing type using condition when available', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        class CustomError extends Error {
          customField = 'test';
        }

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal</div>
            } @error (let err; when err instanceof CustomError) {
              <div>{{ err.customField }}</div>
            } @error (let err) {
              <div>Fallback</div>
            }
          \`,
        })
        export class TestCmp {
          CustomError = CustomError; // Expose to template if needed, though with control flow it uses standard TS scope in some regards
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should report an error if there are multiple unconditional @error blocks', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal</div>
            } @error {
              <div>Fallback 1</div>
            } @error {
              <div>Fallback 2</div>
            }
          \`,
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      // It will report two errors: one because the first block isn't the last, and one for the duplicate
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toContain(
        'Unconditional @error block must be the last @error block in the boundary chain',
      );
      expect(diags[1].messageText).toContain(
        '@boundary block can only have one unconditional @error block',
      );
    });

    it('should report an error if an unconditional @error block is not the last block', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        class CustomError extends Error {}

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal</div>
            } @error {
              <div>Fallback</div>
            } @error (let err; when err instanceof CustomError) {
              <div>Custom Error</div>
            }
          \`,
        })
        export class TestCmp {
          CustomError = CustomError;
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        'Unconditional @error block must be the last @error block in the boundary chain',
      );
    });

    it('should error when accessing error alias outside of error block', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal {{ err.message }}</div>
            } @error (let err) {
              <div>{{ err.message }}</div>
            }
          \`,
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain("Property 'err' does not exist on type 'TestCmp'");
    });

    it('should correctly handle nested boundary blocks and shadow error alias', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        class CustomError extends Error {
          customField = 'test';
        }

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              @boundary {
                <div>Inner</div>
              } @error (let err; when err instanceof CustomError) {
                <div>Inner Custom: {{ err.customField }}</div>
              } @error (let err) {
                <div>Inner Fallback: {{ err.message }}</div>
              }
            } @error (let err) {
              <div>Outer Fallback: {{ err.message }}</div>
            }
          \`,
        })
        export class TestCmp {
          CustomError = CustomError;
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should allow multiple error blocks with different conditions', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        class ErrorA extends Error { type = 'a' }
        class ErrorB extends Error { type = 'b' }

        @Component({
          selector: 'test-cmp',
          template: \`
            @boundary {
              <div>Normal</div>
            } @error (let err; when err instanceof ErrorA) {
              <div>A: {{ err.type }}</div>
            } @error (let err; when err instanceof ErrorB) {
              <div>B: {{ err.type }}</div>
            } @error (let err) {
              <div>Generic: {{ err.message }}</div>
            }
          \`,
        })
        export class TestCmp {
          ErrorA = ErrorA;
          ErrorB = ErrorB;
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });
  });
});
