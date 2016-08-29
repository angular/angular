/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {Completions, Diagnostic, Diagnostics} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('references', () => {
  let documentRegistry = ts.createDocumentRegistry();
  let mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh);
  let service = ts.createLanguageService(mockHost, documentRegistry);
  let program = service.getProgram();
  let ngHost = new TypeScriptServiceHost(ts, mockHost, service);
  let ngService = createLanguageService(ngHost);
  ngHost.setSite(ngService);

  it('should be able to get template references',
     () => { expect(() => ngService.getTemplateReferences()).not.toThrow(); });

  it('should be able to determine that test.ng is a template reference',
     () => { expect(ngService.getTemplateReferences()).toContain('/app/test.ng'); });
});