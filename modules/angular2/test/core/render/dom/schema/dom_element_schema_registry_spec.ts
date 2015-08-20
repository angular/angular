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
} from 'angular2/test_lib';
import {IS_DART} from '../../../../platform';

import {
  DomElementSchemaRegistry
} from 'angular2/src/core/render/dom/schema/dom_element_schema_registry';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

export function main() {
  // DOMElementSchema can only be used on the JS side where we can safely
  // use reflection for DOM elements
  if (IS_DART) return;

  var registry;

  beforeEach(() => { registry = new DomElementSchemaRegistry(); });

  describe('DOMElementSchema', () => {

    it('should detect properties on regular elements', () => {
      var divEl = DOM.createElement('div');
      expect(registry.hasProperty(divEl, 'id')).toBeTruthy();
      expect(registry.hasProperty(divEl, 'title')).toBeTruthy();
      expect(registry.hasProperty(divEl, 'unknown')).toBeFalsy();
    });

    it('should return true for custom-like elements', () => {
      var customLikeEl = DOM.createElement('custom-like');
      expect(registry.hasProperty(customLikeEl, 'unknown')).toBeTruthy();
    });

    it('should not re-map property names that are not specified in DOM facade',
       () => { expect(registry.getMappedPropName('readonly')).toEqual('readOnly'); });

    it('should not re-map property names that are not specified in DOM facade', () => {
      expect(registry.getMappedPropName('title')).toEqual('title');
      expect(registry.getMappedPropName('exotic-unknown')).toEqual('exotic-unknown');
    });
  });
}
