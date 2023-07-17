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
      env.tsconfig({strictTemplates: true});
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

    describe('handles diagnostic configuration', () => {
      // Component definition which emits one warning.
      const warningComponent = `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-component',
          // Invalid banana in box (should be \`[(foo)]="bar"\`).
          template: '<div ([foo])="bar"></div>',
        })
        class TestComponent {
          bar = 'test';
        }
      `;

      it('by enabling extended template diagnostics when `strictTemplates` is enabled', () => {
        env.tsconfig({strictTemplates: true});

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(jasmine.objectContaining({
          code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
          category: ts.DiagnosticCategory.Warning,
        }));
      });

      it('by disabling extended template diagnostics when `strictTemplates` is disabled', () => {
        env.tsconfig({strictTemplates: false});

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
        expect(diagnostics).toEqual([]);
      });

      it('by emitting unconfigured diagnostics as is', () => {
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {},  // No configured diagnostics.
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(jasmine.objectContaining({
          code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
          category: ts.DiagnosticCategory.Warning,
        }));
      });

      it('by emitting diagnostics with the default category', () => {
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {
            defaultCategory: 'error',
          },
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(1 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(jasmine.objectContaining({
          code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
          category: ts.DiagnosticCategory.Error,
        }));
      });

      it('by emitting diagnostics configured as `warning`', () => {
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {
            checks: {
              invalidBananaInBox: 'warning',
            },
          },
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(jasmine.objectContaining({
          code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
          category: ts.DiagnosticCategory.Warning,
        }));
      });

      it('by promoting diagnostics configured as `error`', () => {
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {
            checks: {
              invalidBananaInBox: 'error',
            },
          },
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(1 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(jasmine.objectContaining({
          code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
          category: ts.DiagnosticCategory.Error,
        }));
      });

      it('by suppressing diagnostics configured as `suppress`', () => {
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {
            checks: {
              invalidBananaInBox: 'suppress',
            },
          },
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
        expect(diagnostics).toEqual([]);
      });

      it('by throwing an error when given a bad category', () => {
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {
            defaultCategory: 'not-a-category',
          },
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(1 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(jasmine.objectContaining({
          code: ngErrorCode(ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL),
          category: ts.DiagnosticCategory.Error,
        }));
      });
    });
  });
});
