/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DiagnosticCategoryLabel} from '../../../../../core/api';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as optionalChainNotNullableFactory} from '../../../checks/optional_chain_not_nullable';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('OptionalChainNotNullableCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(optionalChainNotNullableFactory.code).toBe(ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE);
      expect(optionalChainNotNullableFactory.name).toBe(
        ExtendedTemplateDiagnosticName.OPTIONAL_CHAIN_NOT_NULLABLE,
      );
    });

    it('should return a check if `strictNullChecks` is enabled', () => {
      expect(optionalChainNotNullableFactory.create({strictNullChecks: true})).toBeDefined();
    });

    it('should return a check if `strictNullChecks` is not configured but `strict` is enabled', () => {
      expect(optionalChainNotNullableFactory.create({strict: true})).toBeDefined();
    });

    it('should not return a check if `strictNullChecks` is disabled', () => {
      expect(optionalChainNotNullableFactory.create({strictNullChecks: false})).toBeNull();
      expect(optionalChainNotNullableFactory.create({})).toBeNull(); // Defaults disabled.
    });

    it('should not return a check if `strict` is enabled but `strictNullChecks` is disabled', () => {
      expect(
        optionalChainNotNullableFactory.create({strict: true, strictNullChecks: false}),
      ).toBeNull();
    });

    it('should produce optional chain warning for property access', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: { foo: string } = { foo: "bar" }; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE));
      expect(diags[0].messageText).toContain(
        `the '?.' operator can be replaced with the '.' operator`,
      );
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`bar`);
    });

    it('should produce optional chain warning for indexed access', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.['bar'] }}`,
          },
          source: 'export class TestCmp { var1: { foo: string } = { foo: "bar" }; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE));
      expect(diags[0].messageText).toContain(`the '?.' operator can be safely removed`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`var1?.['bar']`);
    });

    it('should produce optional chain warning for method call', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ foo?.() }}`,
          },
          source: 'export class TestCmp { foo: () => string }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE));
      expect(diags[0].messageText).toContain(`the '?.' operator can be safely removed`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`foo?.()`);
    });

    it('should produce optional chain warning for classes with inline TCBs', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup(
        [
          {
            fileName,
            templates: {
              'TestCmp': `{{ var1?.bar }}`,
            },
            source: 'class TestCmp { var1: { foo: string } = { foo: "bar" }; }',
          },
        ],
        {inlining: true},
      );
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`bar`);
    });

    it('should not produce optional chain warning for a nullable type', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: string | null = "text"; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce optional chain warning for the any type', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: any; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce optional chain warning for the unknown type', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: unknown; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce optional chain warning for a type that includes undefined', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: string | undefined = "text"; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should not produce optional chain warning when the left side is a nullable expression', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ func()?.foo }}`,
          },
          source: `
               export class TestCmp {
                 func = (): { foo: string } | null => null;
               }
             `,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });

    it('should respect configured diagnostic category', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: { foo: string } = { foo: "bar" }; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [optionalChainNotNullableFactory],
        {
          strictNullChecks: true,
          extendedDiagnostics: {
            checks: {
              optionalChainNotNullable: DiagnosticCategoryLabel.Error,
            },
          },
        },
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Error);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OPTIONAL_CHAIN_NOT_NULLABLE));
    });
  });
});
