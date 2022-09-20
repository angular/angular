/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as imgAltRequiredFactory} from '../../../checks/img_alt_required';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('ImgAltRequiredCheck', () => {
    it('binds the error code to its extended diagnostic name', () => {
      expect(imgAltRequiredFactory.code).toBe(ErrorCode.IMG_ALT_REQUIRED);
      expect(imgAltRequiredFactory.name).toBe(ExtendedTemplateDiagnosticName.IMG_ALT_REQUIRED);
    });

    it('should produce a warning for missing `alt` attribute', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" />',
        },
        source: 'export class TestCmp {}',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.IMG_ALT_REQUIRED));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('img');

      // Should emit missing `alt` diagnostic specifically.
      expect(diags[0].messageText).toContain('attribute is required');
    });

    it('should produce a warning for `alt` attribute with no value', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" alt />',
        },
        source: 'export class TestCmp {}',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.IMG_ALT_REQUIRED));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('alt');

      // Should emit missing `alt` diagnostic specifically.
      expect(diags[0].messageText).toContain('attribute is required');
    });

    it('should *not* produce a warning for an image with a valid `alt` attribute', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" alt="Cool thing" />',
        },
        source: 'export class TestCmp {}',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning for an image with an empty `alt` attribute value', () => {
      // NOTE: `<img alt="" />` is actually useful to signal to the browser that "Yes I thought
      // about adding `alt` text, but actually this image is decorative and can be ignored for a11y
      // purposes". See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-alt

      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" alt="" />',
        },
        source: 'export class TestCmp {}',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning for an image with a bound `alt` attribute', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" [alt]="altText" />',
        },
        source: 'export class TestCmp { protected altText = "Cool thing"; }',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning for an image with a non-nullable `attr.alt` binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" [attr.alt]="altText" />',
        },
        source: 'export class TestCmp { protected altText = "Cool thing"; }',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(0);
    });

    it('should produce a warning for an image with an optional `attr.alt` binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" [attr.alt]="altText" />',
        },
        source: 'export class TestCmp { protected altText? = "Cool thing"; }',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.IMG_ALT_REQUIRED));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('attr.alt');
      expect(diags[0].messageText)
          .toContain('bound type');  // Should emit nullable type diagnostic.
    });

    it('should produce a warning for an image with a nullable `attr.alt` binding', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" [attr.alt]="altText" />',
        },
        source: 'export class TestCmp { protected altText: string | null = "Cool thing"; }',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.IMG_ALT_REQUIRED));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('attr.alt');
      expect(diags[0].messageText)
          .toContain('bound type');  // Should emit nullable type diagnostic.
    });

    it('should *not* produce a warning for an image with a `attr.alt` binding typed as `any`',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([{
           fileName,
           templates: {
             'TestCmp': '<img src="/image.png" [attr.alt]="altText" />',
           },
           source: 'export class TestCmp { protected altText: any = "Cool thing"; }',
         }]);

         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory],
             {} /* options */);

         const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

         expect(diags.length).toBe(0);
       });

    it('should *not* produce a warning for an image with a `attr.alt` binding typed as `unknown`',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([{
           fileName,
           templates: {
             'TestCmp': '<img src="/image.png" [attr.alt]="altText" />',
           },
           source: 'export class TestCmp { protected altText: unknown = "Cool thing"; }',
         }]);

         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory],
             {} /* options */);

         const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

         expect(diags.length).toBe(0);
       });

    it('should ignore `alt` attributes on non-`img` tags', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<div alt></div>',
        },
        source: 'export class TestCmp {}',
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory], {} /* options */);

      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(0);
    });

    it('should respect configured category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<img src="/image.png" />',
        },
        source: 'export class TestCmp {}'
      }]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(), [imgAltRequiredFactory],
          {extendedDiagnostics: {checks: {imgAltRequired: DiagnosticCategoryLabel.Error}}});
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.IMG_ALT_REQUIRED));
    });
  });
});
