/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {MockTypescriptHost} from './test_utils';

describe('service without angular', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const service = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, service);
  const ngService = createLanguageService(ngHost);
  const TEST_TEMPLATE = '/app/test.ng';
  mockHost.override(TEST_TEMPLATE, '<h1> ~{cursor} </h1>');
  const position = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor').start;

  beforeEach(() => {
    mockHost.reset();
  });

  it('should not crash a get diagnostics', () => {
    expect(() => ngService.getSemanticDiagnostics(TEST_TEMPLATE)).not.toThrow();
  });

  it('should not crash a completion', () => {
    expect(() => ngService.getCompletionsAtPosition(TEST_TEMPLATE, position)).not.toThrow();
  });

  it('should not crash a get definition', () => {
    expect(() => ngService.getDefinitionAndBoundSpan(TEST_TEMPLATE, position)).not.toThrow();
  });

  it('should not crash a hover', () => {
    expect(() => ngService.getQuickInfoAtPosition(TEST_TEMPLATE, position)).not.toThrow();
  });

  it('should not crash with an incomplete class', () => {
    mockHost.addCode('\nexport class');
    expect(() => ngHost.getAnalyzedModules()).not.toThrow();
  });
});
