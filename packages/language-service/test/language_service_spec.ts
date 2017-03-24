/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {Completions, LanguageService} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('service without angular', () => {
  let mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh);
  mockHost.forgetAngular();
  let service = ts.createLanguageService(mockHost);
  let ngHost = new TypeScriptServiceHost(mockHost, service);
  let ngService = createLanguageService(ngHost);
  const fileName = '/app/test.ng';
  let position = mockHost.getMarkerLocations(fileName) !['h1-content'];

  it('should not crash a get template references',
     () => expect(() => ngService.getTemplateReferences()));
  it('should not crash a get dianostics',
     () => expect(() => ngService.getDiagnostics(fileName)).not.toThrow());
  it('should not crash a completion',
     () => expect(() => ngService.getCompletionsAt(fileName, position)).not.toThrow());
  it('should not crash a get defintion',
     () => expect(() => ngService.getDefinitionAt(fileName, position)).not.toThrow());
  it('should not crash a hover', () => expect(() => ngService.getHoverAt(fileName, position)));
});