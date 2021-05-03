/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SecurityContext} from '@angular/core';
import {inject} from '@angular/core/testing';

import {ElementSchemaRegistry} from '../../src/schema/element_schema_registry';
import {calcPossibleSecurityContexts} from '../../src/template_parser/binding_parser';

{
  describe('BindingParser', () => {
    let registry: ElementSchemaRegistry;

    beforeEach(inject([ElementSchemaRegistry], (_registry: ElementSchemaRegistry) => {
      registry = _registry;
    }));

    describe('possibleSecurityContexts', () => {
      function hrefSecurityContexts(selector: string) {
        return calcPossibleSecurityContexts(registry, selector, 'href', false);
      }

      it('should return a single security context if the selector as an element name', () => {
        expect(hrefSecurityContexts('a')).toEqual([SecurityContext.URL]);
      });

      it('should return the possible security contexts if the selector has no element name', () => {
        expect(hrefSecurityContexts('[myDir]')).toEqual([
          SecurityContext.NONE, SecurityContext.URL, SecurityContext.RESOURCE_URL
        ]);
      });

      it('should exclude possible elements via :not', () => {
        expect(hrefSecurityContexts('[myDir]:not(link):not(base)')).toEqual([
          SecurityContext.NONE, SecurityContext.URL
        ]);
      });

      it('should not exclude possible narrowed elements via :not', () => {
        expect(hrefSecurityContexts('[myDir]:not(link.someClass):not(base.someClass)')).toEqual([
          SecurityContext.NONE, SecurityContext.URL, SecurityContext.RESOURCE_URL
        ]);
      });

      it('should return SecurityContext.NONE if there are no possible elements', () => {
        expect(hrefSecurityContexts('img:not(img)')).toEqual([SecurityContext.NONE]);
      });

      it('should return the union of the possible security contexts if multiple selectors are specified',
         () => {
           expect(calcPossibleSecurityContexts(registry, 'a,link', 'href', false)).toEqual([
             SecurityContext.URL, SecurityContext.RESOURCE_URL
           ]);
         });
    });
  });
}
