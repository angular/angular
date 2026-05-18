import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';

import {factory as isPlatformBrowserInControlFlowFactory} from '../../../checks/is_platform_browser_in_control_flow';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('IsPlatformBrowserInControlFlowCheck', () => {
    function diagnose(template: string) {
      const fileName = absoluteFrom('/main.ts');

      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': template,
          },
          source: `
            import {inject, PLATFORM_ID} from '@angular/core';
            import {isPlatformBrowser, isPlatformServer} from '@angular/common';

            export class TestCmp {
              platformId = inject(PLATFORM_ID);
              isPlatformBrowser = isPlatformBrowser;
              isPlatformServer = isPlatformServer;
              enabled = true;
            }
          `,
        },
      ]);

      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');

      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [isPlatformBrowserInControlFlowFactory],
        {},
      );

      return extendedTemplateChecker.getDiagnosticsForComponent(component);
    }

    it('binds the error code to its extended template diagnostic name', () => {
      expect(isPlatformBrowserInControlFlowFactory.code).toBe(
        ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW,
      );
      expect(isPlatformBrowserInControlFlowFactory.name).toBe(
        ExtendedTemplateDiagnosticName.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW,
      );
    });

    it('should warn when isPlatformBrowser is used inside @if', () => {
      const diags = diagnose(`
        @if (isPlatformBrowser(platformId)) {
          <div>Browser</div>
        }
      `);

      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.HYDRATION_PLATFORM_BROWSER_IN_CONTROL_FLOW));
      expect(diags[0].messageText).toContain('isPlatformBrowser');
    });

    it('should warn when used inside @switch', () => {
      const diags = diagnose(`
        @switch (isPlatformBrowser(platformId)) {
          @case (true) { <div>Browser</div> }
        }
      `);

      expect(diags.length).toBe(1);
    });

    it('should NOT warn when isPlatformBrowser is not used', () => {
      const diags = diagnose(`
        @if (true) {
          <div>No issue</div>
        }
      `);

      expect(diags.length).toBe(0);
    });
  });
});
