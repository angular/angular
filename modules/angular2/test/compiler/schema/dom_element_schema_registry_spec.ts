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
} from 'angular2/testing_internal';
import {IS_DART} from 'angular2/src/core/facade/lang';

import {DomElementSchemaRegistry} from 'angular2/src/compiler/schema/dom_element_schema_registry';

export function main() {
  // DOMElementSchema can only be used on the JS side where we can safely
  // use reflection for DOM elements
  if (IS_DART) return;

  var registry: DomElementSchemaRegistry;

  beforeEach(() => { registry = new DomElementSchemaRegistry(); });

  describe('DOMElementSchema', () => {

    it('should detect properties on regular elements', () => {
      expect(registry.hasProperty('div', 'id')).toBeTruthy();
      expect(registry.hasProperty('div', 'title')).toBeTruthy();
      expect(registry.hasProperty('div', 'unknown')).toBeFalsy();
    });

    it('should return true for custom-like elements',
       () => { expect(registry.hasProperty('custom-like', 'unknown')).toBeTruthy(); });

    it('should not re-map property names that are not specified in DOM facade',
       () => { expect(registry.getMappedPropName('readonly')).toEqual('readOnly'); });

    it('should not re-map property names that are not specified in DOM facade', () => {
      expect(registry.getMappedPropName('title')).toEqual('title');
      expect(registry.getMappedPropName('exotic-unknown')).toEqual('exotic-unknown');
    });
  });
}
