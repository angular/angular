/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageService} from '../../language_service';

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
    ngLS = new LanguageService(project, tsLS);
    configFileFs = _configFileFs;
  });

  afterEach(() => {
    configFileFs.clear();
  });

  describe('parse compiler options', () => {
    beforeEach(() => {
      // Need to reset project on each test to reinitialize file watchers.
      const {project: _project, tsLS, service: _service, configFileFs: _configFileFs} = setup();
      project = _project;
      service = _service;
      configFileFs = _configFileFs;
      ngLS = new LanguageService(project, tsLS);
    });

    it('should initialize with angularCompilerOptions from tsconfig.json', () => {
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        enableIvy: true,  // default for ivy is true
        strictTemplates: true,
        strictInjectionParameters: true,
      }));
    });

    it('should reparse angularCompilerOptions on tsconfig.json change', () => {
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        enableIvy: true,  // default for ivy is true
        strictTemplates: true,
        strictInjectionParameters: true,
      }));

      configFileFs.overwriteConfigFile(TSCONFIG, `{
        "angularCompilerOptions": {
          "strictTemplates": false
        }
      }`);

      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: false,
      }));
    });

    it('should parse extended angularCompilerOptions', () => {
      const proj = assertConfiguredProject(project);
      const derived = proj.getConfigFilePath();
      const base = path.join(path.dirname(derived), 'tsconfig-base.json');
      configFileFs.overwriteConfigFile(base, `{
        "angularCompilerOptions": {
          "strictTemplates": false,
          "strictInjectionParameters": false
        }
      }`);
      configFileFs.overwriteConfigFile(derived, `{
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "strictTemplates": true
        }
      }`);
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: true,
        strictInjectionParameters: false,
      }));
    });

    it('should refresh angularCompilerOptions when extended tsconfig is changed', () => {
      const proj = assertConfiguredProject(project);
      const derived = proj.getConfigFilePath();
      const base = path.join(path.dirname(derived), 'tsconfig-base.json');
      configFileFs.overwriteConfigFile(base, `{
        "angularCompilerOptions": {
          "strictTemplates": false,
          "strictInjectionParameters": false
        }
      }`);
      configFileFs.overwriteConfigFile(derived, `{
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "strictTemplates": true
        }
      }`);
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: true,
        strictInjectionParameters: false,
      }));

      configFileFs.overwriteConfigFile(base, `{
        "angularCompilerOptions": {
          "strictInjectionParameters": true,
          "fullTemplateTypeCheck": true
        }
      }`);
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: true,
        strictInjectionParameters: true,
        fullTemplateTypeCheck: true,
      }));
    });

    it('should refresh angularCompilerOptions when extended tsconfig is deleted', () => {
      const proj = assertConfiguredProject(project);
      const derived = proj.getConfigFilePath();
      const base = path.join(path.dirname(derived), 'tsconfig-base.json');
      configFileFs.overwriteConfigFile(base, `{
        "angularCompilerOptions": {
          "strictTemplates": false,
          "strictInjectionParameters": false
        }
      }`);
      configFileFs.overwriteConfigFile(derived, `{
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "strictTemplates": true
        }
      }`);
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: true,
        strictInjectionParameters: false,
      }));

      configFileFs.deleteConfigFile(base);
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: true,
      }));
      expect(ngLS.getCompilerOptions()).not.toEqual(jasmine.objectContaining({
        strictInjectionParameters: false,
      }));
    });

    it('should stop watching previously-extened tsconfig when removed from the project config chain',
       () => {
         const proj = assertConfiguredProject(project);
         const derived = proj.getConfigFilePath();
         const base = path.join(path.dirname(derived), 'tsconfig-base.json');
         configFileFs.overwriteConfigFile(base, `{
           "angularCompilerOptions": {
             "strictTemplates": false,
             "strictInjectionParameters": false
           }
         }`);
         configFileFs.overwriteConfigFile(derived, `{
           "extends": "./tsconfig-base.json",
           "angularCompilerOptions": {
             "strictTemplates": true
           }
         }`);
         expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
           strictTemplates: true,
           strictInjectionParameters: false,
         }));

         // Remove base tsconfig
         configFileFs.overwriteConfigFile(derived, `{
           "angularCompilerOptions": {
             "strictTemplates": true
           }
         }`);
         expect(configFileFs.isBeingWatched(base)).toBeFalse();
       });

    it('should start watching tsconfig when added as an extended tsconfig', () => {
      const proj = assertConfiguredProject(project);
      const derived = proj.getConfigFilePath();
      const base = path.join(path.dirname(derived), 'tsconfig-base.json');
      configFileFs.overwriteConfigFile(base, `{
        "angularCompilerOptions": {
          "strictTemplates": false,
          "strictInjectionParameters": false
        }
      }`);

      // Not yet extending base tsconfig, but should be watching the project config file.
      configFileFs.overwriteConfigFile(derived, `{
        "angularCompilerOptions": {
          "strictTemplates": true
        }
      }`);
      expect(configFileFs.isBeingWatched(base)).toBeFalse();
      expect(configFileFs.isBeingWatched(derived)).toBeTrue();

      // Extend base tsconfig, should be watching it now.
      configFileFs.overwriteConfigFile(derived, `{
        "extends": "./tsconfig-base.json",
        "angularCompilerOptions": {
          "strictTemplates": true
        }
      }`);
      expect(configFileFs.isBeingWatched(base)).toBeTrue();
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
        strictTemplates: true,
        strictInjectionParameters: false,
      }));
    });

    it('should unset angularCompilerOptions when tsconfig is deleted', () => {
      const proj = assertConfiguredProject(project);
      const origOptions = {
        strictTemplates: true,
        strictInjectionParameters: true,
      };
      // First verify options are present.
      expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining(origOptions));
      // Delete the config file and verify options are missing.
      configFileFs.deleteConfigFile(proj.getConfigFilePath());
      expect(ngLS.getCompilerOptions()).not.toEqual(jasmine.objectContaining(origOptions));
    });
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
      expect(p1).toBe(p0);  // last known program should not have changed

      service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);
      const d2 = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
      expect(d2.length).toBe(0);
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1);  // last known program should have changed
    });

    it('should be set after getDefinitionAndBoundSpan()', () => {
      const {position: pos0} = service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);

      const d0 = ngLS.getDefinitionAndBoundSpan(TEST_TEMPLATE, pos0);
      expect(d0).toBeDefined();
      const p0 = getLastKnownProgram(ngLS);

      const d1 = ngLS.getDefinitionAndBoundSpan(TEST_TEMPLATE, pos0);
      expect(d1).toBeDefined();
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0);  // last known program should not have changed

      const {position: pos1} = service.overwrite(TEST_TEMPLATE, `{{ ti¦tle }}`);
      const d2 = ngLS.getDefinitionAndBoundSpan(TEST_TEMPLATE, pos1);
      expect(d2).toBeDefined();
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1);  // last known program should have changed
    });

    it('should be set after getQuickInfoAtPosition()', () => {
      const {position: pos0} = service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);

      const q0 = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, pos0);
      expect(q0).toBeDefined();
      const p0 = getLastKnownProgram(ngLS);

      const q1 = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, pos0);
      expect(q1).toBeDefined();
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0);  // last known program should not have changed

      const {position: pos1} = service.overwrite(TEST_TEMPLATE, `{{ ti¦tle }}`);
      const q2 = ngLS.getQuickInfoAtPosition(TEST_TEMPLATE, pos1);
      expect(q2).toBeDefined();
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1);  // last known program should have changed
    });

    it('should be set after getTypeDefinitionAtPosition()', () => {
      const {position: pos0} = service.overwrite(TEST_TEMPLATE, `<test-c¦omp></test-comp>`);

      const q0 = ngLS.getTypeDefinitionAtPosition(TEST_TEMPLATE, pos0);
      expect(q0).toBeDefined();
      const p0 = getLastKnownProgram(ngLS);

      const d1 = ngLS.getTypeDefinitionAtPosition(TEST_TEMPLATE, pos0);
      expect(d1).toBeDefined();
      const p1 = getLastKnownProgram(ngLS);
      expect(p1).toBe(p0);  // last known program should not have changed

      const {position: pos1} = service.overwrite(TEST_TEMPLATE, `{{ ti¦tle }}`);
      const d2 = ngLS.getTypeDefinitionAtPosition(TEST_TEMPLATE, pos1);
      expect(d2).toBeDefined();
      const p2 = getLastKnownProgram(ngLS);
      expect(p2).not.toBe(p1);  // last known program should have changed
    });
  });
});

function getLastKnownProgram(ngLS: LanguageService): ts.Program {
  const program = ngLS['compilerFactory']['lastKnownProgram'];
  expect(program).toBeDefined();
  return program!;
}

function assertConfiguredProject(project: ts.server.Project): ts.server.ConfiguredProject {
  if (!(project instanceof ts.server.ConfiguredProject)) {
    throw new Error('Project is not a configured project.');
  }
  return project;
}
