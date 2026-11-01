/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {getSourceCodeForDiagnostic, loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment, TsConfigOptions} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('ngtsc extended template checks', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    it('should produce invalid banana in box warning', () => {
      env.write(
        'test.ts',
        `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                template: '<div ([notARealThing])="bar"></div>',
              })
              class TestCmp {
                bar: string = "text";
              }
            `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('([notARealThing])="bar"');
    });

    it('should produce invalid banana in box warning with external html file', () => {
      env.write(
        'test.ts',
        `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                templateUrl: './test.html',
              })
              class TestCmp {
                bar: string = "text";
              }
            `,
      );

      env.write(
        'test.html',
        `
              <div ([notARealThing])="bar"></div>
            `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('([notARealThing])="bar"');
    });

    it(`should produce nullish coalescing not nullable warning`, () => {
      env.tsconfig({strictTemplates: true}, {strict: true}); // TODO: remove when #70090 is merged
      env.write(
        'test.ts',
        `
              import {Component} from '@angular/core';
              @Component({
                selector: 'test',
                template: '{{ bar ?? "foo" }}',
              })
              export class TestCmp {
                bar: string = "text";
              }
            `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NULLISH_COALESCING_NOT_NULLABLE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('bar ?? "foo"');
    });

    describe('unstable track expressions', () => {
      function writeComponent(template: string, external = false) {
        env.write(
          'test.ts',
          `
            import {Component, signal} from '@angular/core';
            @Component({
              ${external ? "templateUrl: './test.html'" : `template: '${template}'`},
            })
            export class TestCmp {
              readonly users = signal([{id: 1}]);
            }
          `,
        );
        if (external) {
          env.write('test.html', template);
        }
      }

      for (const external of [false, true]) {
        for (const expression of [
          '{id: user.id}',
          '[user.id]',
          '(({id: user.id}))',
          '(([user.id]))',
        ]) {
          it(`reports ${expression} in ${external ? 'external' : 'inline'} templates`, () => {
            env.tsconfig({
              strictTemplates: true,
              extendedDiagnostics: {checks: {unstableTrackExpression: 'warning'}},
            });
            writeComponent(`@for (user of users(); track ${expression}) { {{user.id}} }`, external);
            const diagnostics = env.driveDiagnostics(0);
            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].code).toBe(ngErrorCode(ErrorCode.UNSTABLE_TRACK_EXPRESSION));
            expect(diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
            expect(getSourceCodeForDiagnostic(diagnostics[0])).toBe(expression);
            expect(
              diagnostics[0].file!.fileName.endsWith(external ? '/test.html' : '/test.ts'),
            ).toBeTrue();
          });
        }
      }

      for (const category of ['warning', 'error', 'suppress'] as const) {
        it(`honors ${category} with defaultCategory error`, () => {
          env.tsconfig({
            strictTemplates: true,
            extendedDiagnostics: {
              defaultCategory: 'error',
              checks: {unstableTrackExpression: category},
            },
          });
          writeComponent('@for (user of users(); track [user.id]) {}');
          const diagnostics = env.driveDiagnostics(category === 'error' ? 1 : 0);
          if (category === 'suppress') {
            expect(diagnostics).toEqual([]);
          } else {
            expect(diagnostics.length).toBe(1);
            expect(diagnostics[0].code).toBe(ngErrorCode(ErrorCode.UNSTABLE_TRACK_EXPRESSION));
            expect(diagnostics[0].category).toBe(
              category === 'error' ? ts.DiagnosticCategory.Error : ts.DiagnosticCategory.Warning,
            );
          }
        });
      }

      const unconfiguredOptions: TsConfigOptions[] = [
        {strictTemplates: false},
        {strictTemplates: true},
        {strictTemplates: true, extendedDiagnostics: {}},
        {strictTemplates: true, extendedDiagnostics: {defaultCategory: 'warning' as const}},
        {strictTemplates: true, extendedDiagnostics: {defaultCategory: 'error' as const}},
        {strictTemplates: true, extendedDiagnostics: {defaultCategory: 'suppress' as const}},
      ];
      for (const options of unconfiguredOptions) {
        it(`preserves compilation without opt-in: ${JSON.stringify(options)}`, () => {
          env.tsconfig(options);
          writeComponent(
            '@for (user of users(); track {id: user.id}) {} @for (user of users(); track [user.id]) {}',
          );
          expect(env.driveDiagnostics(0)).toEqual([]);
          env.driveMain();
          expect(env.getContents('test.js')).toContain('repeaterCreate');
        });
      }

      it('preserves the existing configuration error when strictTemplates is disabled', () => {
        env.tsconfig({
          strictTemplates: false,
          extendedDiagnostics: {checks: {unstableTrackExpression: 'warning'}},
        });
        writeComponent('@for (user of users(); track [user.id]) {}');
        const diagnostics = env.driveDiagnostics(1);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(
          ngErrorCode(ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_IMPLIES_STRICT_TEMPLATES),
        );
      });

      it('does not change emitted JavaScript when enabled', () => {
        writeComponent('@for (user of users(); track {id: user.id}) { {{user.id}} }');
        env.driveMain();
        const before = env.getContents('test.js');
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {checks: {unstableTrackExpression: 'warning'}},
        });
        const diagnostics = env.driveDiagnostics(0);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(ngErrorCode(ErrorCode.UNSTABLE_TRACK_EXPRESSION));
        expect(env.getContents('test.js')).toBe(before);
      });
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
        expect(diagnostics[0]).toEqual(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
            category: ts.DiagnosticCategory.Warning,
          }),
        );
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
          extendedDiagnostics: {}, // No configured diagnostics.
        });

        env.write('test.ts', warningComponent);

        const diagnostics = env.driveDiagnostics(0 /* expectedExitCode */);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0]).toEqual(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
            category: ts.DiagnosticCategory.Warning,
          }),
        );
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
        expect(diagnostics[0]).toEqual(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
            category: ts.DiagnosticCategory.Error,
          }),
        );
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
        expect(diagnostics[0]).toEqual(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
            category: ts.DiagnosticCategory.Warning,
          }),
        );
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
        expect(diagnostics[0]).toEqual(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.INVALID_BANANA_IN_BOX),
            category: ts.DiagnosticCategory.Error,
          }),
        );
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
        expect(diagnostics[0]).toEqual(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.CONFIG_EXTENDED_DIAGNOSTICS_UNKNOWN_CATEGORY_LABEL),
            category: ts.DiagnosticCategory.Error,
          }),
        );
      });
    });
  });
});
