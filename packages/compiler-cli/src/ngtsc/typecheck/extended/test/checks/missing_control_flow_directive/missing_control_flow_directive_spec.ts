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
import {
  factory as missingControlFlowDirectiveCheck,
  KNOWN_CONTROL_FLOW_DIRECTIVES,
} from '../../../checks/missing_control_flow_directive';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('MissingControlFlowDirectiveCheck', () => {
    KNOWN_CONTROL_FLOW_DIRECTIVES.forEach((correspondingImport, directive) => {
      ['div', 'ng-template', 'ng-container', 'ng-content'].forEach((element) => {
        it(
          `should produce a warning when the '${directive}' directive is not imported ` +
            `(when used on the '${element}' element)`,
          () => {
            const fileName = absoluteFrom('/main.ts');
            const {program, templateTypeChecker} = setup([
              {
                fileName,
                templates: {
                  'TestCmp': `<${element} *${directive}="exp"></${element}>`,
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
              [missingControlFlowDirectiveCheck],
              {} /* options */,
            );
            const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
            expect(diags.length).toBe(1);
            expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
            expect(diags[0].code).toBe(ngErrorCode(ErrorCode.MISSING_CONTROL_FLOW_DIRECTIVE));
            expect(diags[0].messageText).toContain(`The \`*${directive}\` directive was used`);
            expect(diags[0].messageText).toContain(
              `neither the \`${correspondingImport.directive}\` directive nor the \`CommonModule\` was imported. `,
            );
            expect(diags[0].messageText).toContain(
              `Use Angular's built-in control flow ${correspondingImport?.builtIn}`,
            );
            expect(getSourceCodeForDiagnostic(diags[0])).toBe(directive);
          },
        );

        it(
          `should *not* produce a warning when the '${directive}' directive is not imported ` +
            `into a non-standalone component scope (when used on the '${element}' element)`,
          () => {
            const fileName = absoluteFrom('/main.ts');
            const {program, templateTypeChecker} = setup([
              {
                fileName,
                templates: {
                  'TestCmp': `<${element} *${directive}="exp"></${element}>`,
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
              [missingControlFlowDirectiveCheck],
              {} /* options */,
            );
            const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
            // No diagnostic messages are expected.
            expect(diags.length).toBe(0);
          },
        );

        it(
          `should *not* produce a warning when the '${directive}' directive is imported ` +
            `(when used on the '${element}' element)`,
          () => {
            const className = directive.charAt(0).toUpperCase() + directive.substr(1);
            const fileName = absoluteFrom('/main.ts');
            const {program, templateTypeChecker} = setup([
              {
                fileName,
                templates: {
                  'TestCmp': `<${element} *${directive}="exp"></${element}>`,
                },
                source: `
                export class TestCmp {}
                export class ${className} {}
              `,
                declarations: [
                  {
                    type: 'directive',
                    name: className,
                    selector: `[${directive}]`,
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
              [missingControlFlowDirectiveCheck],
              {strictNullChecks: true} /* options */,
            );
            const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
            // No diagnostic messages are expected.
            expect(diags.length).toBe(0);
          },
        );
      });
    });

    it(`should *not* produce a warning for other missing structural directives`, () => {
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
        [missingControlFlowDirectiveCheck],
        {strictNullChecks: true} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      // No diagnostic messages are expected.
      expect(diags.length).toBe(0);
    });
  });
});
