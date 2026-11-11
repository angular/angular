/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as outputShadowedByAttributeResolverFactory} from '../../../checks/output_shadowed_by_attribute_resolver';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';
import {formatExtendedError} from '@angular/compiler-cli/src/ngtsc/typecheck/extended/api';

runInEachFileSystem(() => {
  describe('OutputShadowedByAttributeResolverCheck', () => {
    it('should produce a diagnostic when a (class) binding shadows a directive output named class', () => {
      const diags = diagnose(`<div dir (class)="resolve"></div>`, {classEvent: 'class'});

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('class');
      expect(diags[0].messageText).toBe(
        formatExtendedError(
          ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
          "The `(class)` binding resolves the element's classes, so it doesn't listen to the " +
            '`class` output of `Dir`. Rename the output to listen to it.',
        ),
      );
    });

    it('should produce a diagnostic when an (attr.class) binding shadows a directive output named attr.class', () => {
      const diags = diagnose(`<div dir (attr.class)="resolve($event)"></div>`, {
        classEvent: 'attr.class',
      });

      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('attr.class');
      expect(diags[0].messageText).toBe(
        formatExtendedError(
          ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
          "The `(attr.class)` binding resolves the element's classes, so it doesn't listen to " +
            'the `attr.class` output of `Dir`. Rename the output to listen to it.',
        ),
      );
    });

    it('should not produce a diagnostic when no directive output is named class', () => {
      const diags = diagnose(`<div dir (class)="resolve"></div>`, {classEvent: 'change'});

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic when the directive output has the name of the other form', () => {
      const classDiags = diagnose(`<div dir (attr.class)="resolve($event)"></div>`, {
        classEvent: 'class',
      });
      const attrClassDiags = diagnose(`<div dir (class)="resolve"></div>`, {
        classEvent: 'attr.class',
      });

      expect(classDiags.length).toBe(0);
      expect(attrClassDiags.length).toBe(0);
    });

    it('should produce a diagnostic when an (attr.role) binding shadows a directive output named attr.role', () => {
      const diags = diagnose(`<div dir (attr.role)="resolve($event)"></div>`, {
        classEvent: 'attr.role',
      });

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('attr.role');
      expect(diags[0].messageText).toBe(
        formatExtendedError(
          ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
          "The `(attr.role)` binding resolves the element's `role` attribute, so it doesn't " +
            'listen to the `attr.role` output of `Dir`. Rename the output to listen to it.',
        ),
      );
    });

    it('should produce a diagnostic when a (style) binding shadows a directive output named style', () => {
      const diags = diagnose(`<div dir (style)="resolve"></div>`, {classEvent: 'style'});

      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('style');
      expect(diags[0].messageText).toBe(
        formatExtendedError(
          ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER,
          "The `(style)` binding resolves the element's `style` attribute, so it doesn't " +
            'listen to the `style` output of `Dir`. Rename the output to listen to it.',
        ),
      );
    });

    it('should not produce a diagnostic when an (attr.style) binding meets a directive output named style', () => {
      const diags = diagnose(`<div dir (attr.style)="resolve($event)"></div>`, {
        classEvent: 'style',
      });

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic when an (attr.role) binding meets a directive output named role', () => {
      const diags = diagnose(`<div dir (attr.role)="resolve($event)"></div>`, {
        classEvent: 'role',
      });

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic on <ng-container>', () => {
      const diags = diagnose(`<ng-container dir (class)="resolve($event)" />`, {
        classEvent: 'class',
      });

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic on <ng-container> inside <svg>', () => {
      const diags = diagnose(
        `<svg><ng-container dir (class)="resolve($event)"></ng-container></svg>`,
        {classEvent: 'class'},
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic on <ng-container> inside <math>', () => {
      const diags = diagnose(
        `<math><ng-container dir (class)="resolve($event)"></ng-container></math>`,
        {classEvent: 'class'},
      );

      expect(diags.length).toBe(0);
    });

    it('should produce a diagnostic on an element inside <svg>', () => {
      const diags = diagnose(`<svg><g dir (class)="resolve"></g></svg>`, {
        classEvent: 'class',
      });

      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.OUTPUT_SHADOWED_BY_ATTRIBUTE_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('class');
      expect(diags[0].messageText).toContain('the `class` output of `Dir`');
    });
  });
});

function diagnose(template: string, outputs: Record<string, string>) {
  const fileName = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup([
    {
      fileName,
      templates: {'TestCmp': template},
      source: `
        export class TestCmp {
          resolve(value: unknown) { return ''; }
        }

        export class Dir {
          classEvent: any;
        }
      `,
      declarations: [{type: 'directive', name: 'Dir', selector: '[dir]', outputs}],
    },
  ]);
  const sf = getSourceFileOrError(program, fileName);
  const component = getClass(sf, 'TestCmp');
  const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
    templateTypeChecker,
    program.getTypeChecker(),
    [outputShadowedByAttributeResolverFactory],
    {} /* options */,
  );
  return extendedTemplateChecker.getDiagnosticsForComponent(component);
}
