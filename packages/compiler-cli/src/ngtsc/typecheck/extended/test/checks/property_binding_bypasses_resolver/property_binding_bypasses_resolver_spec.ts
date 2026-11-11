/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {NgCompilerOptions} from '../../../../../core/api';
import {ErrorCode, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as propertyBindingBypassesResolverFactory} from '../../../checks/property_binding_bypasses_resolver';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';
import {formatExtendedError} from '@angular/compiler-cli/src/ngtsc/typecheck/extended/api';

runInEachFileSystem(() => {
  describe('PropertyBindingBypassesResolverCheck', () => {
    it('should produce a diagnostic when a property binding writes an attribute that the element resolves', () => {
      const diags = diagnose(`<div [title]="value" (attr.title)="resolve($event)"></div>`);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('title');
      expect(diags[0].messageText).toBe(
        formatExtendedError(
          ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER,
          "The `title` property binding writes the `title` attribute, which the element's " +
            "`(attr.title)` binding resolves. The resolver doesn't receive the binding's value, " +
            "and the binding's later writes can stay in the DOM while the resolved value doesn't " +
            'change. Bind `[attr.title]` instead to make the value a source of the resolver.',
        ),
      );
    });

    it('should produce a diagnostic for an interpolation', () => {
      const diags = diagnose(`<div title="{{value}}" (attr.title)="resolve($event)"></div>`);

      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('title');
    });

    it('should produce a diagnostic for a translated interpolation', () => {
      const diags = diagnose(
        `<div title="Hi {{value}}" i18n-title (attr.title)="resolve($event)"></div>`,
      );

      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.PROPERTY_BINDING_BYPASSES_RESOLVER));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('title');
    });

    it('should produce a diagnostic for an ARIA binding', () => {
      const diags = diagnose(
        `<div [aria-label]="value" (attr.aria-label)="resolve($event)"></div>`,
      );

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('aria-label');
      expect(diags[0].messageText).toContain(
        'The `aria-label` property binding writes the `aria-label` attribute',
      );
    });

    it('should produce a diagnostic for a property that the DOM schema maps to the attribute', () => {
      const ariaDiags = diagnose(
        `<div [ariaLabel]="value" (attr.aria-label)="resolve($event)"></div>`,
      );
      const classDiags = diagnose(`<div [className]="value" (class)="resolve"></div>`);
      const tabIndexDiags = diagnose(
        `<div [tabIndex]="0" (attr.tabindex)="resolve($event)"></div>`,
      );

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain(
        'The `ariaLabel` property binding writes the `aria-label` attribute',
      );
      expect(classDiags.length).toBe(1);
      expect(classDiags[0].messageText).toContain(
        "The `className` property binding writes the `class` attribute, which the element's " +
          '`(class)` binding resolves.',
      );
      expect(classDiags[0].messageText).toContain('Bind `[attr.class]` instead');
      expect(tabIndexDiags.length).toBe(1);
      expect(tabIndexDiags[0].messageText).toContain(
        'The `tabIndex` property binding writes the `tabindex` attribute',
      );
    });

    it('should produce a diagnostic on an element inside <svg>', () => {
      const diags = diagnose(`<svg><g [id]="value" (attr.id)="resolve($event)"></g></svg>`);

      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('id');
    });

    it('should not produce a diagnostic for an attribute binding', () => {
      const diags = diagnose(`<div [attr.title]="value" (attr.title)="resolve($event)"></div>`);

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic for class and style bindings', () => {
      const diags = diagnose(`
        <div [class]="value" [class.active]="value" (class)="resolve"></div>
        <div class="a {{value}}" (attr.class)="resolve($event)"></div>
        <div [style]="value" [style.color]="value" (style)="resolve"></div>
      `);

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic for a binding that a directive input claims', () => {
      const diags = diagnose(`<div dir [title]="value" (attr.title)="resolve($event)"></div>`, {
        title: 'title',
      });

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic without a resolver of the attribute', () => {
      const diags = diagnose(`
        <div [title]="value"></div>
        <div [title]="value" (attr.role)="resolve($event)"></div>
        <div [title]="value" (title)="resolve($event)"></div>
      `);

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic for a name with another spelling', () => {
      const diags = diagnose(`<div [Title]="value" (attr.title)="resolve($event)"></div>`);

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic for a property that writes no attribute', () => {
      const diags = diagnose(
        `<div [textContent]="value" (attr.textContent)="resolve($event)"></div>`,
      );

      expect(diags.length).toBe(0);
    });

    it('should not produce a diagnostic for a property name used as another attribute name', () => {
      const diags = diagnose(`
        <div [className]="value" (attr.className)="resolve($event)"></div>
        <div [tabIndex]="0" (attr.tabIndex)="resolve($event)"></div>
      `);

      expect(diags.length).toBe(0);
    });

    it('should look up the host of each directive once per run', () => {
      const {templateTypeChecker, check} = setUpCheck(`<div dir></div><span dir></span>`);
      const getHostElement = spyOn(templateTypeChecker, 'getHostElement').and.callThrough();

      check();
      check();

      expect(getHostElement.calls.allArgs().map(([node]) => node.name?.text)).toEqual(['Dir']);
    });

    it('should not look up hosts when host bindings are not type-checked', () => {
      const {templateTypeChecker, check} = setUpCheck(
        `<div dir [title]="value" (attr.title)="resolve($event)"></div>`,
        {},
        {typeCheckHostBindings: false},
      );
      const getHostElement = spyOn(templateTypeChecker, 'getHostElement').and.callThrough();

      expect(check().length).toBe(1);
      expect(getHostElement).not.toHaveBeenCalled();
    });

    it('should not produce a diagnostic on <ng-container>', () => {
      const diags = diagnose(
        `<ng-container [title]="value" (attr.title)="resolve($event)"></ng-container>`,
      );

      expect(diags.length).toBe(0);
    });
  });
});

function diagnose(template: string, inputs: Record<string, string> = {}) {
  return setUpCheck(template, inputs).check();
}

function setUpCheck(
  template: string,
  inputs: Record<string, string> = {},
  options: NgCompilerOptions = {},
) {
  const fileName = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup([
    {
      fileName,
      templates: {'TestCmp': template},
      source: `
        export class TestCmp {
          value = '';
          resolve(value: unknown) { return ''; }
        }

        export class Dir {
          title: any;
        }
      `,
      declarations: [{type: 'directive', name: 'Dir', selector: '[dir]', inputs}],
    },
  ]);
  const sf = getSourceFileOrError(program, fileName);
  const component = getClass(sf, 'TestCmp');
  const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
    templateTypeChecker,
    program.getTypeChecker(),
    [propertyBindingBypassesResolverFactory],
    options,
  );
  return {
    templateTypeChecker,
    check: () => extendedTemplateChecker.getDiagnosticsForComponent(component),
  };
}
