/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {getSourceCodeForDiagnostic, loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});

runInEachFileSystem(() => {
  describe('ngtsc extended template checks', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({_extendedTemplateDiagnostics: true, strictTemplates: true});
    });

    it('should produce invalid banana in box warning', () => {
      env.write('test.ts', `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                template: '<div ([notARealThing])="bar"></div>',
              })
              class TestCmp {
                bar: string = "text";
              }
            `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('([notARealThing])="bar"');
    });

    it('should produce invalid banana in box warning with external html file', () => {
      env.write('test.ts', `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                templateUrl: './test.html',
              })
              class TestCmp {
                bar: string = "text";
              }
            `);

      env.write('test.html', `
              <div ([notARealThing])="bar"></div>
            `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('([notARealThing])="bar"');
    });

    it('should not produce extended diagnostics if flag is disabled', () => {
      env.tsconfig({_extendedTemplateDiagnostics: false});
      env.write('test.ts', `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                template: '<div ([notARealThing])="bar"></div>',
              })
              class TestCmp {
                bar: string = "text";
              }
            `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should throw error if _extendedTemplateDiagnostics option is enabled and strictTemplates disabled',
       () => {
         env.tsconfig({_extendedTemplateDiagnostics: true, strictTemplates: false});
         env.write('test.ts', `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                template: '<div ([notARealThing])="bar"></div>',
              })
              class TestCmp {
                bar: string = "text";
              }
            `);

         const diags = env.driveDiagnostics();
         expect(diags.length).toBe(1);
         expect(diags[0].messageText)
             .toMatch(
                 /Error: The '_extendedTemplateDiagnostics' option requires 'strictTemplates' to also be enabled./);
       });

    it(`should produce nullish coalescing not nullable warning`, () => {
      env.write('test.ts', `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                template: '{{ bar ?? "foo" }}',
              })
              export class TestCmp {
                bar: string = "text";
              }
            `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('bar ?? "foo"');
    });
  });
});
