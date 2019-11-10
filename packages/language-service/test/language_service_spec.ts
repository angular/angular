/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {MockTypescriptHost} from './test_utils';

describe('service without angular', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts']);
  const service = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, service);
  const ngService = createLanguageService(ngHost);
  const fileName = '/app/test.ng';
  const position = mockHost.getLocationMarkerFor(fileName, 'h1-content').start;

  beforeEach(() => { mockHost.reset(); });

  it('should not crash a get template references',
     () => { expect(() => ngService.getTemplateReferences()).not.toThrow(); });
  it('should not crash a get diagnostics',
     () => { expect(() => ngService.getDiagnostics(fileName)).not.toThrow(); });

  it('should not crash a completion',
     () => { expect(() => ngService.getCompletionsAt(fileName, position)).not.toThrow(); });

  it('should not crash a get definition',
     () => { expect(() => ngService.getDefinitionAt(fileName, position)).not.toThrow(); });

  it('should not crash a hover',
     () => { expect(() => ngService.getHoverAt(fileName, position)).not.toThrow(); });

  it('should not crash with an incomplete class', () => {
    mockHost.addCode('\nexport class');
    expect(() => ngHost.getAnalyzedModules()).not.toThrow();
  });
});
