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

describe('references', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngHost);

  beforeEach(() => {
    mockHost.reset();
  });

  describe('component members', () => {
    it('should get TS references for a member in template', () => {
      const fileName = mockHost.addCode(`
        @Component({
          template: '{{«title»}}'
        })
        export class MyComponent {
          /*1*/title: string;

          setTitle(newTitle: string) {
            this./*2*/title = newTitle;
          }
        }`);
      const content = mockHost.readFile(fileName)!;

      const varName = 'title';
      const marker = mockHost.getReferenceMarkerFor(fileName, varName);

      const references = ngLS.getReferencesAtPosition(fileName, marker.start)!;
      expect(references).toBeDefined();
      expect(references.length).toBe(2);

      for (let i = 0; i < references.length; ++i) {
        const comment = `/*${i + 1}*/`;
        const start = content.indexOf(comment) + comment.length;
        expect(references[i].fileName).toBe(fileName);
        expect(references[i].textSpan.start).toBe(start);
        expect(references[i].textSpan.length).toBe(varName.length);
      }
    });
  });
});
