/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {NgtscTestEnvironment} from './env';
import {loadStandardTestFiles, getSourceCodeForDiagnostic} from '../../src/ngtsc/testing';

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
          standalone: true,
        })
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      if (diags.length > 0) {
        console.log(
          'DIAGS for should type check error alias as Error:',
          JSON.stringify(
            diags.map((d) =>
              typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText,
            ),
          ),
        );
      }
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
          standalone: true,
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
          standalone: true,
        })
        export class TestCmp {
          CustomError = CustomError; // Expose to template if needed, though with control flow it uses standard TS scope in some regards
        }
      `,
      );

      // Wait, instanceof uses component scope resolution or typescript scope?
      // In @error context, instanceof check condition inside of `if` clause uses standard TS AST!
      // So condition `err instanceof CustomError` IS evaluated in the TCB!
      const diags = env.driveDiagnostics();
      if (diags.length > 0) {
        console.log(
          'DIAGS for should narrowing type using condition when available:',
          JSON.stringify(
            diags.map((d) =>
              typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText,
            ),
          ),
        );
      }
      expect(diags.length).toBe(0);
    });
  });
});
