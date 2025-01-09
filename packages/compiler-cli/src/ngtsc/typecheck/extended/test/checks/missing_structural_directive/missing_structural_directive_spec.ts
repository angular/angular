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
import {getClass, setup} from '../../../../testing';
import {factory as missingStructuralDirectiveCheck} from '../../../checks/missing_structural_directive';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('missingStructuralDirectiveCheck', () => {
    it('should produce a warning for missing unknown structural directives in standalone components', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div *foo="exp"></div>`,
          },
          declarations: [
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: true,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_STRUCTURAL_DIRECTIVE));
    });

    it('should produce a warning if ngTemplateOutlet is used without importing the directive', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<ng-container *ngTemplateOutlet="svk; context: myContext"></ng-container>
                        <ng-template #svk let-person="localSk"><span>Ahoj {{ person }}!</span></ng-template>`,
          },
          declarations: [
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: true,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_STRUCTURAL_DIRECTIVE));
    });

    it('should *not* produce a warning for custom structural directives that are imported', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div *foo="exp"></div>`,
          },
          source: `
          export class TestCmp {}
          export class Foo {}
        `,
          declarations: [
            {
              type: 'directive',
              name: 'Foo',
              selector: `[foo]`,
            },
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: true,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // No diagnostic messages are expected.
      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning for non-standalone components', () => {
      const fileName = absoluteFrom('/main.ts');

      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div *foo="exp"></div>`,
          },
          declarations: [
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: false,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // No diagnostic messages are expected.
      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning for non-structural directives in standalone components', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [foo]="exp"></div>`,
          },
          declarations: [
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: true,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // No diagnostic messages are expected.
      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning when known control flow directives are used', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div *ngIf="exp as value">
                          <li *ngFor="let item of items; index as i; trackBy: trackByFn">
                            {{ item.name }}
                          </li>
                          <container-element [ngSwitch]="switch_exp">
                            <div *ngSwitchCase="match_exp"></div>
                            <div *ngSwitchDefault></div>
                          </container-element>
                        </div>`,
          },
          declarations: [
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: true,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // No diagnostic messages are expected.
      expect(diags.length).toBe(0);
    });

    it('should *not* produce a warning for templates with no structural directives', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div></div>`,
          },
          declarations: [
            {
              name: 'TestCmp',
              type: 'directive',
              selector: `[test-cmp]`,
              isStandalone: true,
            },
          ],
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [missingStructuralDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // No diagnostic messages are expected.
      expect(diags.length).toBe(0);
    });
  });
});
