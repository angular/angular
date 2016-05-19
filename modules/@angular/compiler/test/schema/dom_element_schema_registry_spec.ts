import {
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit
} from '@angular/core/testing/testing_internal';

import {browserDetection} from '@angular/platform-browser/testing';

import {DomElementSchemaRegistry} from '@angular/compiler/src/schema/dom_element_schema_registry';
import {SecurityContext} from '../../core_private';
import {extractSchema} from './schema_extractor';

export function main() {
  describe('DOMElementSchema', () => {
    let registry: DomElementSchemaRegistry;
    beforeEach(() => { registry = new DomElementSchemaRegistry(); });

    it('should detect properties on regular elements', () => {
      expect(registry.hasProperty('div', 'id')).toBeTruthy();
      expect(registry.hasProperty('div', 'title')).toBeTruthy();
      expect(registry.hasProperty('h1', 'align')).toBeTruthy();
      expect(registry.hasProperty('h2', 'align')).toBeTruthy();
      expect(registry.hasProperty('h3', 'align')).toBeTruthy();
      expect(registry.hasProperty('h4', 'align')).toBeTruthy();
      expect(registry.hasProperty('h5', 'align')).toBeTruthy();
      expect(registry.hasProperty('h6', 'align')).toBeTruthy();
      expect(registry.hasProperty('h7', 'align')).toBeFalsy();
      expect(registry.hasProperty('textarea', 'disabled')).toBeTruthy();
      expect(registry.hasProperty('input', 'disabled')).toBeTruthy();
      expect(registry.hasProperty('div', 'unknown')).toBeFalsy();
    });

    it('should detect different kinds of types', () => {
      // inheritance: video => media => *
      expect(registry.hasProperty('video', 'className')).toBeTruthy();   // from *
      expect(registry.hasProperty('video', 'id')).toBeTruthy();          // string
      expect(registry.hasProperty('video', 'scrollLeft')).toBeTruthy();  // number
      expect(registry.hasProperty('video', 'height')).toBeTruthy();      // number
      expect(registry.hasProperty('video', 'autoplay')).toBeTruthy();    // boolean
      expect(registry.hasProperty('video', 'classList')).toBeTruthy();   // object
      // from *; but events are not properties
      expect(registry.hasProperty('video', 'click')).toBeFalsy();
    });

    it('should return true for custom-like elements',
       () => { expect(registry.hasProperty('custom-like', 'unknown')).toBeTruthy(); });

    it('should re-map property names that are specified in DOM facade',
       () => { expect(registry.getMappedPropName('readonly')).toEqual('readOnly'); });

    it('should not re-map property names that are not specified in DOM facade', () => {
      expect(registry.getMappedPropName('title')).toEqual('title');
      expect(registry.getMappedPropName('exotic-unknown')).toEqual('exotic-unknown');
    });

    it('should return security contexts for elements', () => {
      expect(registry.securityContext('iframe', 'srcdoc')).toBe(SecurityContext.HTML);
      expect(registry.securityContext('p', 'innerHTML')).toBe(SecurityContext.HTML);
      expect(registry.securityContext('a', 'href')).toBe(SecurityContext.URL);
      expect(registry.securityContext('a', 'style')).toBe(SecurityContext.STYLE);
      expect(registry.securityContext('ins', 'cite')).toBe(SecurityContext.URL);
      expect(registry.securityContext('base', 'href')).toBe(SecurityContext.RESOURCE_URL);
    });

    it('should detect properties on namespaced elements',
       () => { expect(registry.hasProperty('@svg:g', 'id')).toBeTruthy(); });

    if (browserDetection.isChromeDesktop) {
      it('generate a new schema', () => {
        // console.log(JSON.stringify(registry.properties));
        extractSchema(
          (descriptors) => {
            // Uncomment this line to see:
            // the generated schema which can then be pasted to the DomElementSchemaRegistry
            // console.log(descriptors);
          });
      });
    }

  });
}
