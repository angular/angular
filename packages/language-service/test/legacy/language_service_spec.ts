/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import ts from 'typescript';

import {LanguageService} from '../../src/language_service';

import {MockConfigFileFs, MockService, setup, TEST_TEMPLATE, TSCONFIG} from './mock_host';

describe('language service adapter', () => {
  let project: ts.server.Project;
  let service: MockService;
  let ngLS: LanguageService;
  let configFileFs: MockConfigFileFs;

  beforeAll(() => {
    const {project: _project, tsLS, service: _service, configFileFs: _configFileFs} = setup();
    project = _project;
    service = _service;
    ngLS = new LanguageService(project, tsLS, {});
    configFileFs = _configFileFs;
  });

  afterEach(() => {
    configFileFs.clear();
  });

  describe('parse compiler options', () => {
    it('should initialize with angularCompilerOptions from tsconfig.json', () => {
      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          strictTemplates: true,
          strictInjectionParameters: true,
        }),
      );
    });

    it('should reparse angularCompilerOptions on tsconfig.json change', () => {
      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          strictTemplates: true,
          strictInjectionParameters: true,
        }),
      );

      configFileFs.overwriteConfigFile(TSCONFIG, {
        angularCompilerOptions: {
          strictTemplates: false,
        },
      });

      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          strictTemplates: false,
        }),
      );
    });

    it('should always enable strictTemplates if forceStrictTemplates is true', () => {
      const {project, tsLS, configFileFs} = setup();
      const ngLS = new LanguageService(project, tsLS, {
        forceStrictTemplates: true,
      });

      // First make sure the default for strictTemplates is true
      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          strictTemplates: true,
          strictInjectionParameters: true,
        }),
      );

      // Change strictTemplates to false
      configFileFs.overwriteConfigFile(TSCONFIG, {
        angularCompilerOptions: {
          strictTemplates: false,
        },
      });

      // Make sure strictTemplates is still true because forceStrictTemplates
      // is enabled.
      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          strictTemplates: true,
        }),
      );
    });

    it('should always disable block syntax if enableBlockSyntax is false', () => {
      const {project, tsLS} = setup();
      const ngLS = new LanguageService(project, tsLS, {
        enableBlockSyntax: false,
      });

      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          '_enableBlockSyntax': false,
        }),
      );
    });

    it('should always disable let declarations if enableLetSyntax is false', () => {
      const {project, tsLS} = setup();
      const ngLS = new LanguageService(project, tsLS, {
        enableLetSyntax: false,
      });

      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          '_enableLetSyntax': false,
        }),
      );
    });

    it('should pass the @angular/core version along to the compiler', () => {
      const {project, tsLS} = setup();
      const ngLS = new LanguageService(project, tsLS, {
        angularCoreVersion: '17.2.11-rc.8',
      });

      expect(ngLS.getCompilerOptions()).toEqual(
        jasmine.objectContaining({
          '_angularCoreVersion': '17.2.11-rc.8',
        }),
      );
    });
  });

  describe('compiler options diagnostics', () => {
    it('suggests turning on strict flag', () => {
      configFileFs.overwriteConfigFile(TSCONFIG, {
        angularCompilerOptions: {},
      });
      const diags = ngLS.getCompilerOptionsDiagnostics();
      const diag = diags.find(isSuggestStrictTemplatesDiag);
      expect(diag).toBeDefined();
      expect(diag!.category).toBe(ts.DiagnosticCategory.Suggestion);
      expect(diag!.file?.getSourceFile().fileName).toBe(TSCONFIG);
    });

    it('does not suggest turning on strict mode is strictTemplates flag is on', () => {
      configFileFs.overwriteConfigFile(TSCONFIG, {
        angularCompilerOptions: {
          strictTemplates: true,
        },
      });
      const diags = ngLS.getCompilerOptionsDiagnostics();
      const diag = diags.find(isSuggestStrictTemplatesDiag);
      expect(diag).toBeUndefined();
    });

    it('does not suggest turning on strict mode is fullTemplateTypeCheck flag is on', () => {
      configFileFs.overwriteConfigFile(TSCONFIG, {
        angularCompilerOptions: {
          fullTemplateTypeCheck: true,
        },
      });
      const diags = ngLS.getCompilerOptionsDiagnostics();
      const diag = diags.find(isSuggestStrictTemplatesDiag);
      expect(diag).toBeUndefined();
    });

    function isSuggestStrictTemplatesDiag(diag: ts.Diagnostic) {
      return diag.code === ngErrorCode(ErrorCode.SUGGEST_STRICT_TEMPLATES);
    }
  });

  describe('last known program', () => {
    beforeEach(() => {
      service.reset();
    });

    it('should be set after getSemanticDiagnostics()', () => {
      const d0 = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(d0.length).toBe(0);
      const p0 = getLastKnownProgram(ngLS);

      const d1 = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(d1.length).toBe(0);
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0); // last known program should not have changed

      service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);
      const d2 = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(d2.length).toBe(0);
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1); // last known program should have changed
    });

    it('should be set after getDefinitionAndBoundSpan()', () => {
      const {position: pos0} = service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);

      const d0 = ngLS.getDefinitionAndBoundSpan(TEST_TEMPLATE, pos0);
      expect(d0).toBeDefined();
      const p0 = getLastKnownProgram(ngLS);

      const d1 = ngLS.getDefinitionAndBoundSpan(TEST_TEMPLATE, pos0);
      expect(d1).toBeDefined();
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0); // last known program should not have changed

      const {position: pos1} = service.overwrite(TEST_TEMPLATE, `{{ ti¦tle }}`);
      const d2 = ngLS.getDefinitionAndBoundSpan(TEST_TEMPLATE, pos1);
      expect(d2).toBeDefined();
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1); // last known program should have changed
    });

    it('should be set after getQuickInfoAtPosition()', () => {
      const {position: pos0} = service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);

      const q0 = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, pos0);
      expect(q0).toBeDefined();
      const p0 = getLastKnownProgram(ngLS);

      const q1 = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, pos0);
      expect(q1).toBeDefined();
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0); // last known program should not have changed

      const {position: pos1} = service.overwrite(TEST_TEMPLATE, `{{ ti¦tle }}`);
      const q2 = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, pos1);
      expect(q2).toBeDefined();
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1); // last known program should have changed
    });

    it('should be set after getTypeDefinitionAtPosition()', () => {
      const {position: pos0} = service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);

      const q0 = ngLS.getTypeDefinitionAtPosition(TEST_TEMPLATE, pos0);
      expect(q0).toBeDefined();
      const p0 = getLastKnownProgram(ngLS);

      const d1 = ngLS.getTypeDefinitionAtPosition(TEST_TEMPLATE, pos0);
      expect(d1).toBeDefined();
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0); // last known program should not have changed

      const {position: pos1} = service.overwrite(TEST_TEMPLATE, `{{ ti¦tle }}`);
      const d2 = ngLS.getTypeDefinitionAtPosition(TEST_TEMPLATE, pos1);
      expect(d2).toBeDefined();
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1); // last known program should have changed
    });
  });
});

function getLastKnownProgram(ngLS: LanguageService): ts.Program {
  const program = ngLS['compilerFactory']['compiler']?.getCurrentProgram();
  expect(program).toBeDefined();
  return program!;
}
