/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DiagnosticCategoryLabel, NgCompilerOptions} from '../../../../../core/api';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {createNgCompilerForFile, getClass} from '../../../../testing';
import {factory as missingAttributeDirectiveFactory} from '../../../checks/missing_attribute_directive';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

function enabledOptions(): NgCompilerOptions {
  return {
    strictNullChecks: true,
    extendedDiagnostics: {
      checks: {
        [ExtendedTemplateDiagnosticName.MISSING_ATTRIBUTE_DIRECTIVE]:
          DiagnosticCategoryLabel.Warning,
      },
    },
  };
}

function getDiagnostics(
  source: string,
  options: NgCompilerOptions = enabledOptions(),
): ts.Diagnostic[] {
  const {compiler, sourceFile} = createNgCompilerForFile(source);
  const component = getClass(sourceFile, 'TestCmp');
  const checker = new ExtendedTemplateCheckerImpl(
    compiler.getTemplateTypeChecker(),
    compiler.getCurrentProgram().getTypeChecker(),
    [missingAttributeDirectiveFactory],
    options,
    compiler.getCurrentProgram(),
  );

  return checker.getDiagnosticsForComponent(component);
}

runInEachFileSystem(() => {
  describe('MissingAttributeDirectiveCheck', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(missingAttributeDirectiveFactory.code).toBe(ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE);
      expect(missingAttributeDirectiveFactory.name).toBe(
        ExtendedTemplateDiagnosticName.MISSING_ATTRIBUTE_DIRECTIVE,
      );
    });

    it('should not produce diagnostics unless check is explicitly configured', () => {
      const diags = getDiagnostics(
        `
          import {Component, Directive} from '@angular/core';

          @Directive({selector: 'button[cv-button]', standalone: true})
          export class CvButtonDirective {}

          @Component({
            standalone: true,
            template: '<button cv-button></button>',
          })
          export class TestCmp {}
        `,
        {strictNullChecks: true},
      );

      expect(diags.length).toBe(0);
    });

    it('should produce a warning for missing attribute selector directives', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: 'button[cv-button]', standalone: true})
        export class CvButtonDirective {}

        @Component({
          standalone: true,
          template: '<button cv-button></button>',
        })
        export class TestCmp {}
      `);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('cv-button');
    });

    it('should not produce a warning for missing data-* selector directives', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[data-track]', standalone: true})
        export class DataTrackDirective {}

        @Component({
          standalone: true,
          template: '<div data-track></div>',
        })
        export class TestCmp {}
      `);

      expect(diags.length).toBe(0);
    });

    it('should not produce duplicate warnings for multi-attribute selectors', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[foo][bar]', standalone: true})
        export class FooBarDirective {}

        @Component({
          standalone: true,
          template: '<div foo bar></div>',
        })
        export class TestCmp {}
      `);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE));
    });

    it('should not produce warnings for same-file non-standalone directives that are not exportable', () => {
      const diags = getDiagnostics(`
        import {Component, Directive, NgModule} from '@angular/core';

        @Directive({selector: 'button[cv-button]', standalone: false})
        export class CvButtonDirective {}

        @NgModule({
          declarations: [CvButtonDirective],
        })
        export class InternalModule {}

        @Component({
          standalone: true,
          template: '<button cv-button></button>',
        })
        export class TestCmp {}
      `);

      expect(diags.length).toBe(0);
    });

    it('should reuse matcher data across checker instances for the same program', () => {
      const directiveCount = 250;
      const extraDirectives = Array.from(
        {length: directiveCount},
        (_, i) => `
          @Directive({selector: '[extra-${i}]', standalone: true})
          export class Extra${i}Directive {}
        `,
      ).join('\n');

      const {compiler, sourceFile} = createNgCompilerForFile(`
        import {Component, Directive} from '@angular/core';

        ${extraDirectives}

        @Directive({selector: '[target-dir]', standalone: true})
        export class TargetDirective {}

        @Component({
          standalone: true,
          template: '<div target-dir></div>',
        })
        export class TestCmpA {}

        @Component({
          standalone: true,
          template: '<div target-dir></div>',
        })
        export class TestCmpB {}
      `);

      const baseTemplateTypeChecker = compiler.getTemplateTypeChecker();
      let getDirectiveMetadataCalls = 0;
      const countingTemplateTypeChecker = new Proxy(baseTemplateTypeChecker as object, {
        get(target, prop, receiver): unknown {
          const value = Reflect.get(target, prop, receiver);
          if (typeof value !== 'function') {
            return value;
          }

          if (prop === 'getDirectiveMetadata') {
            return (...args: unknown[]) => {
              getDirectiveMetadataCalls++;
              return Reflect.apply(value, target, args);
            };
          }

          return (...args: unknown[]) => Reflect.apply(value, target, args);
        },
      }) as typeof baseTemplateTypeChecker;

      const program = compiler.getCurrentProgram();
      const checkerA = new ExtendedTemplateCheckerImpl(
        countingTemplateTypeChecker,
        program.getTypeChecker(),
        [missingAttributeDirectiveFactory],
        enabledOptions(),
        program,
      );
      const checkerB = new ExtendedTemplateCheckerImpl(
        countingTemplateTypeChecker,
        program.getTypeChecker(),
        [missingAttributeDirectiveFactory],
        enabledOptions(),
        program,
      );

      const cmpA = getClass(sourceFile, 'TestCmpA');
      const cmpB = getClass(sourceFile, 'TestCmpB');

      const beforeFirst = getDirectiveMetadataCalls;
      const firstDiags = checkerA.getDiagnosticsForComponent(cmpA);
      const afterFirst = getDirectiveMetadataCalls;
      const secondDiags = checkerB.getDiagnosticsForComponent(cmpB);
      const afterSecond = getDirectiveMetadataCalls;

      const firstPassCalls = afterFirst - beforeFirst;
      const secondPassCalls = afterSecond - afterFirst;

      expect(firstDiags.length).toBe(1);
      expect(secondDiags.length).toBe(1);
      expect(firstPassCalls).toBeGreaterThan(directiveCount);
      expect(secondPassCalls).toBeLessThan(Math.max(10, Math.floor(firstPassCalls / 20)));
    });

    it('should produce a warning for missing event-like selector directives', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[foo]', standalone: true})
        export class FooDirective {}

        @Component({
          standalone: true,
          template: '<button (foo)="onFoo()"></button>',
        })
        export class TestCmp {
          onFoo(): void {}
        }
      `);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_ATTRIBUTE_DIRECTIVE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('foo');
    });

    it('should not produce a warning when matching directive is in scope', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: 'button[cv-button]', standalone: true})
        export class CvButtonDirective {}

        @Component({
          standalone: true,
          imports: [CvButtonDirective],
          template: '<button cv-button></button>',
        })
        export class TestCmp {}
      `);

      expect(diags.length).toBe(0);
    });

    it('should not produce a warning for DOM attributes and DOM events', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: '[disabled]', standalone: true})
        export class DisabledDirective {}

        @Directive({selector: '[click]', standalone: true})
        export class ClickDirective {}

        @Component({
          standalone: true,
          template: '<button disabled (click)="onClick()"></button>',
        })
        export class TestCmp {
          onClick(): void {}
        }
      `);

      expect(diags.length).toBe(0);
    });

    it('should not produce warnings for non-standalone components', () => {
      const diags = getDiagnostics(`
        import {Component, Directive} from '@angular/core';

        @Directive({selector: 'button[cv-button]', standalone: true})
        export class CvButtonDirective {}

        @Component({
          standalone: false,
          template: '<button cv-button></button>',
        })
        export class TestCmp {}
      `);

      expect(diags.length).toBe(0);
    });
  });
});
