/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LanguageService} from '../language_service';

import {setup, TSCONFIG} from './mock_host';

describe('parse compiler options', () => {
  const {project, tsLS, configFileFs} = setup();
  let ngLs: LanguageService;

  beforeEach(() => {
    ngLs = new LanguageService(project, tsLS);
  });

  afterEach(() => {
    configFileFs.clear();
  });

  it('should initialize with angularCompilerOptions from tsconfig.json', () => {
    expect(ngLs.getCompilerOptions()).toEqual(jasmine.objectContaining({
      enableIvy: true,  // default for ivy is true
      strictTemplates: true,
      strictInjectionParameters: true,
    }));
  });

  it('should reparse angularCompilerOptions on tsconfig.json change', () => {
    expect(ngLs.getCompilerOptions()).toEqual(jasmine.objectContaining({
      enableIvy: true,  // default for ivy is true
      strictTemplates: true,
      strictInjectionParameters: true,
    }));

    configFileFs.overwriteConfigFile(TSCONFIG, `{
       "angularCompilerOptions": {
         "strictTemplates": false
       }
     }`);

    expect(ngLs.getCompilerOptions()).toEqual(jasmine.objectContaining({
      strictTemplates: false,
    }));
  });
});
