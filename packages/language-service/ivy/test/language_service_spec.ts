/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getFileSystem, setFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import * as path from 'path';
import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageService} from '../language_service';

import {setup} from './mock_host';

describe('parseNgCompilerOptions', () => {
  const {project, service, tsLS, host: fs} = setup();
  const ORIG_FS = getFileSystem();
  let ngLS: LanguageService;

  beforeAll(() => {
    setFileSystem(fs);
  });

  afterAll(() => {
    setFileSystem(ORIG_FS);
  });

  beforeEach(() => {
    service.reset();
    fs.clear();
    ngLS = new LanguageService(project, tsLS);
  });

  it('should read angularCompilerOptions in tsconfig.json', () => {
    expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
      enableIvy: true,  // default for ivy is true
      strictTemplates: true,
      strictInjectionParameters: true,
    }));
  });

  it('should refresh angularCompilerOptions when tsconfig is changed', () => {
    const proj = assertConfiguredProject(project);
    const config = proj.getConfigFilePath();
    fs.writeConfigFile(config, `{
      "angularCompilerOptions": {
        "strictTemplates": true
      }
    }`);
    expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
      strictTemplates: true,
    }));
    fs.writeConfigFile(config, `{
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
    const extended = proj.getConfigFilePath();
    const base = path.join(path.dirname(extended), 'tsconfig-base.json');
    fs.writeConfigFile(base, `{
      "angularCompilerOptions": {
        "strictTemplates": false,
        "strictInjectionParameters": false
      }
    }`);
    fs.writeConfigFile(extended, `{
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
    const extended = proj.getConfigFilePath();
    const base = path.join(path.dirname(extended), 'tsconfig-base.json');
    fs.writeConfigFile(base, `{
      "angularCompilerOptions": {
        "strictTemplates": false,
        "strictInjectionParameters": false
      }
    }`);
    fs.writeConfigFile(extended, `{
      "extends": "./tsconfig-base.json",
      "angularCompilerOptions": {
        "strictTemplates": true
      }
    }`);
    expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
      strictTemplates: true,
      strictInjectionParameters: false,
    }));

    fs.writeConfigFile(base, `{
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
    const extended = proj.getConfigFilePath();
    const base = path.join(path.dirname(extended), 'tsconfig-base.json');
    fs.writeConfigFile(base, `{
      "angularCompilerOptions": {
        "strictTemplates": false,
        "strictInjectionParameters": false
      }
    }`);
    fs.writeConfigFile(extended, `{
      "extends": "./tsconfig-base.json",
      "angularCompilerOptions": {
        "strictTemplates": true
      }
    }`);
    expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
      strictTemplates: true,
      strictInjectionParameters: false,
    }));

    fs.deleteFile(base);
    expect(ngLS.getCompilerOptions()).toEqual(jasmine.objectContaining({
      strictTemplates: true,
    }));
    expect(ngLS.getCompilerOptions()).not.toEqual(jasmine.objectContaining({
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
    fs.deleteFile(proj.getConfigFilePath());
    expect(ngLS.getCompilerOptions()).not.toEqual(jasmine.objectContaining(origOptions));
  });
});

function assertConfiguredProject(project: ts.server.Project): ts.server.ConfiguredProject {
  if (!(project instanceof ts.server.ConfiguredProject)) {
    throw new Error('Project is not a configured project.');
  }
  return project;
}
