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

const APP_COMPONENT = '/app/app.component.ts';
const TEST_TEMPLATE = '/app/test.ng';

describe('references', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngHost);

  beforeEach(() => {
    mockHost.reset();
  });

  for (const templateStrategy of ['inline', 'external'] as const) {
    describe(`template: ${templateStrategy}`, () => {
      describe('component members', () => {
        it('should get TS references for a member in template', () => {
          const fileName = overrideTemplate('{{«title»}}');
          const marker = mockHost.getReferenceMarkerFor(fileName, 'title');
          const references = ngLS.getReferencesAtPosition(fileName, marker.start)!;

          expect(references).toBeDefined();
          expect(references.length).toBe(2);

          for (let i = 0; i < references.length; ++i) {
            // The first reference is declared as a class member.
            // The second is in `setTitle`.
            const ref = references[i];
            expect(getSource(ref)).toBe('title');
            if (i == 0) {
              // The first reference is the member declaration, so it should
              // have a context span pointing to the whole declaration.
              expect(getSource(ref, 'contextSpan')).toBe('title = \'Tour of Heroes\';');
            }
          }
        });
      });
    });

    // TODO: override parsing-cases#TemplateReference for inline templates.
    const overrideTemplate = (template: string): string => {
      if (templateStrategy === 'inline') {
        mockHost.overrideInlineTemplate(APP_COMPONENT, template);
        return APP_COMPONENT;
      } else {
        mockHost.override(TEST_TEMPLATE, template);
        return TEST_TEMPLATE;
      }
    };
  }

  /**
   * Gets the source code of a reference entry. By default the reference
   * `textSpan` is checked, but this can be overridden by specifying `spanKind`.
   */
  function getSource(
      reference: ts.ReferenceEntry, spanKind: 'textSpan'|'contextSpan' = 'textSpan'): string {
    const span = reference[spanKind]!;
    const fileName = reference.fileName;
    const content = mockHost.readFile(fileName)!;
    return content.substring(span.start, span.start + span.length);
  }
});
