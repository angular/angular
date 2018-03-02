/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Diagnostics, processTargetAndValidateNgCompilerOptions} from '../src/perform_compile';

describe('perform watch', () => {
  describe('option validation', () => {
    it('should enforce renderer2BackPatching is true when generateRenderer2Factories is true',
       () => {
         const {errors} = processTargetAndValidateNgCompilerOptions(
             {generateRenderer2Factories: true, renderer2BackPatching: false});
         expectError(
             '"generateRenderer2Factories" requires "renderer2BackPatching" to be "true"', errors);
       });

    describe('target option', () => {
      it('should require application, library or package', () => {
        const {errors} = processTargetAndValidateNgCompilerOptions({target: 'nonsense'});
        expectError(
            'expected "target" option to be one of "application", "library", "package"', errors);
      });

      describe('application', () => {
        it('should be able just specify the target', () => {
          const {options, errors} =
              processTargetAndValidateNgCompilerOptions({target: 'application'});
          expectNoErrors(errors);
          expect(options).toEqual({
            generateRenderer2Factories: true,
            renderer2BackPatching: true,
            generateCodeForLibraries: true,
            enableLegacyTemplate: false,
            preserveWhitespaces: false,
            skipMetadataEmit: true,
            skipTemplateCodegen: false,
            fullTemplateTypeCheck: true,
          });
        });

        describe('enforcing required options', () => {
          it('should enforce "generateRenderer2Factories" to be "true"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', generateRenderer2Factories: false});
            expectError(
                'target "application" requires "generateRenderer2Factories" to be "true"', errors);
          });

          it('should enforce "renderer2BackPatching" to be "true"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', renderer2BackPatching: false});
            expectError(
                'target "application" requires "renderer2BackPatching" to be "true"', errors);
          });
        });

        describe('non-enforced options', () => {
          it('should allow changing "enableIvy"', () => {
            const {errors} =
                processTargetAndValidateNgCompilerOptions({target: 'application', enableIvy: true});
            expectNoErrors(errors);
          });
          it('should allow changing "generateCodeForLibraries""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', generateCodeForLibraries: false});
            expectNoErrors(errors);
          });
          it('should allow changing "enableLegacyTemplate""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', enableLegacyTemplate: true});
            expectNoErrors(errors);
          });
          it('should allow changing "preserveWhitespaces""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', preserveWhitespaces: true});
            expectNoErrors(errors);
          });
          it('should allow changing "skipMetadataEmit""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', skipMetadataEmit: true});
            expectNoErrors(errors);
          });
          it('should allow changing "skipTemplateCodegen""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', skipTemplateCodegen: true});
            expectNoErrors(errors);
          });
          it('should allow changing "fullTemplateTypeCheck""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'application', fullTemplateTypeCheck: false});
            expectNoErrors(errors);
          });
        });
      });


      describe('library', () => {
        it('should be able just specify the target', () => {
          const {options, errors} = processTargetAndValidateNgCompilerOptions({target: 'library'});
          expectNoErrors(errors);
          expect(options).toEqual({
            generateRenderer2Factories: false,
            renderer2BackPatching: false,
            generateCodeForLibraries: false,
            skipMetadataEmit: false,
            skipTemplateCodegen: true,
            enableLegacyTemplate: false,
            preserveWhitespaces: false,
            fullTemplateTypeCheck: true,
          });
        });

        describe('enforcing required options', () => {
          it('should enforce "generateRenderer2Factories" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', generateRenderer2Factories: true});
            expectError(
                'target "library" requires "generateRenderer2Factories" to be "false"', errors);
          });

          it('should enforce "generateRenderer2Factories" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', renderer2BackPatching: true});
            expectError('target "library" requires "renderer2BackPatching" to be "false"', errors);
          });

          it('should enforce "generateCodeForLibraries" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', generateCodeForLibraries: true});
            expectError(
                'target "library" requires "generateCodeForLibraries" to be "false"', errors);
          });

          it('should enforce "skipMetadataEmit" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', skipMetadataEmit: true});
            expectError('target "library" requires "skipMetadataEmit" to be "false"', errors);
          });

          it('should enforce "skipTemplateCodegen" to be "true"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', skipTemplateCodegen: false});
            expectError('target "library" requires "skipTemplateCodegen" to be "true"', errors);
          });
        });
        describe('non-enforced options', () => {
          it('should allow changing "enableIvy""', () => {
            const {errors} =
                processTargetAndValidateNgCompilerOptions({target: 'library', enableIvy: true});
            expectNoErrors(errors);
          });
          it('should allow changing "preserveWhitespaces""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', preserveWhitespaces: true});
            expectNoErrors(errors);
          });
          it('should allow changing "fullTemplateTypeCheck""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions(
                {target: 'library', fullTemplateTypeCheck: false});
            expectNoErrors(errors);
          });
        });
      });

      describe('package', () => {
        it('should be able just specify the target', () => {
          const {options, errors} = processTargetAndValidateNgCompilerOptions({
            target: 'package',
            flatModuleId: 'some-module',
            flatModuleOutFile: 'index.js',
          });
          expectNoErrors(errors);
          expect(options).toEqual({
            generateRenderer2Factories: false,
            renderer2BackPatching: false,
            generateCodeForLibraries: false,
            enableIvy: false,
            skipMetadataEmit: false,
            skipTemplateCodegen: true,
            enableLegacyTemplate: false,
            preserveWhitespaces: false,
            fullTemplateTypeCheck: true,
            flatModuleId: 'some-module',
            flatModuleOutFile: 'index.js',
          });
        });

        describe('enforcing required options', () => {
          it('should enforce "enableIvy" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              enableIvy: true
            });
            expectError('target "package" requires "enableIvy" to be "false"', errors);
          });
          it('should enforce "generateRenderer2Factories" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              generateRenderer2Factories: true
            });
            expectError(
                'target "package" requires "generateRenderer2Factories" to be "false"', errors);
          });

          it('should enforce "generateRenderer2Factories" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              renderer2BackPatching: true
            });
            expectError('target "package" requires "renderer2BackPatching" to be "false"', errors);
          });

          it('should enforce "generateCodeForLibraries" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              generateCodeForLibraries: true
            });
            expectError(
                'target "package" requires "generateCodeForLibraries" to be "false"', errors);
          });

          it('should enforce "skipMetadataEmit" to be "false"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              skipMetadataEmit: true
            });
            expectError('target "package" requires "skipMetadataEmit" to be "false"', errors);
          });

          it('should enforce "skipTemplateCodegen" to be "true"', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              skipTemplateCodegen: false
            });
            expectError('target "package" requires "skipTemplateCodegen" to be "true"', errors);
          });
        });
        describe('non-enforced options', () => {
          it('should allow changing "preserveWhitespaces""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              preserveWhitespaces: true
            });
            expectNoErrors(errors);
          });
          it('should allow changing "fullTemplateTypeCheck""', () => {
            const {errors} = processTargetAndValidateNgCompilerOptions({
              target: 'package',
              flatModuleId: 'some-module',
              flatModuleOutFile: 'index.js',
              fullTemplateTypeCheck: false
            });
            expectNoErrors(errors);
          });
        });
      });
    });
  });
});

function errorText(errors: Diagnostics): string {
  return errors.length ?
      errors.map(e => ts.flattenDiagnosticMessageText(e.messageText, '  \n')).join('\n  ') :
      'No errors reported';
}

function expectNoErrors(errors: Diagnostics) {
  expect(errors.length).toBe(0, `Unexpected errors: \n  ${errorText(errors)}`);
}

function expectError(msg: string | RegExp, errors: Diagnostics) {
  expect(errors.some(
             v => typeof msg === 'string' ?
                 ts.flattenDiagnosticMessageText(v.messageText, '').indexOf(msg) > 0 :
                 typeof v.messageText === 'string' && msg.test(v.messageText)))
      .toBeTruthy(`Expected to find error ${msg}, received: ${errorText(errors)}`);
}