/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as legacySafeNavigationUsageFactory} from '../../../checks/legacy_safe_navigation_usage';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('LegacySafeNavigationUsageCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(legacySafeNavigationUsageFactory.code).toBe(ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE);
      expect(legacySafeNavigationUsageFactory.name).toBe(
        ExtendedTemplateDiagnosticName.LEGACY_SAFE_NAVIGATION_USAGE,
      );
    });

    it('should return a check when nativeOptionalChainingSemantics is not enabled', () => {
      expect(legacySafeNavigationUsageFactory.create({})).toBeDefined();
    });

    it('should return a check when nativeOptionalChainingSemantics is explicitly false', () => {
      expect(
        legacySafeNavigationUsageFactory.create({nativeOptionalChainingSemantics: false}),
      ).toBeDefined();
    });

    it('should NOT return a check when nativeOptionalChainingSemantics is enabled', () => {
      expect(
        legacySafeNavigationUsageFactory.create({nativeOptionalChainingSemantics: true}),
      ).toBeNull();
    });

    it('should produce warning for safe property read in legacy mode', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.bar }}`,
          },
          source: 'export class TestCmp { var1: { bar: string } | null = null; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [legacySafeNavigationUsageFactory],
        {} /* options — no nativeOptionalChainingSemantics */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE));
      expect(diags[0].messageText).toContain('legacy Angular semantics');
    });

    it('should produce warning for safe keyed read', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.['key'] }}`,
          },
          source: 'export class TestCmp { var1: Record<string, string> | null = null; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [legacySafeNavigationUsageFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE));
    });

    it('should produce warning for safe method call', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1?.method() }}`,
          },
          source: 'export class TestCmp { var1: { method(): string } | null = null; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [legacySafeNavigationUsageFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.LEGACY_SAFE_NAVIGATION_USAGE));
    });

    it('should produce multiple warnings for multiple safe reads', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ a?.b }} {{ c?.d }}`,
          },
          source:
            'export class TestCmp { a: {b: string}|null = null; c: {d: string}|null = null; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [legacySafeNavigationUsageFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2);
    });

    it('should not produce warning for regular property read', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `{{ var1.bar }}`,
          },
          source: 'export class TestCmp { var1 = { bar: "hello" }; }',
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [legacySafeNavigationUsageFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });
});
