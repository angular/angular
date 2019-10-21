/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {LanguageService} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {MockTypescriptHost} from './test_utils';

describe('references', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const service = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, service);
  const ngService = createLanguageService(ngHost);

  beforeEach(() => { mockHost.reset(); });

  it('should be able to get template references',
     () => { expect(() => ngService.getTemplateReferences()).not.toThrow(); });

  it('should be able to determine that test.ng is a template reference',
     () => { expect(ngService.getTemplateReferences()).toContain('/app/test.ng'); });

  it('should be able to get template references for an invalid project', () => {
    const moduleCode = `
      import {NgModule} from '@angular/core';
      import {NewClass} from './test.component';

      @NgModule({declarations: [NewClass]}) export class TestModule {}`;
    const classCode = `
      export class NewClass {}

      @Component({})
      export class SomeComponent {}
    `;
    mockHost.addScript('/app/test.module.ts', moduleCode);
    mockHost.addScript('/app/test.component.ts', classCode);
    expect(() => { ngService.getTemplateReferences(); }).not.toThrow();
  });

});
