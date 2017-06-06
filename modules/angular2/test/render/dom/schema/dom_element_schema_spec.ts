import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachBindings,
  SpyObject,
  IS_DARTIUM
} from 'angular2/test_lib';

import {DOMElementSchema} from 'angular2/src/render/dom/schema/dom_element_schema';

export function main() {
  // DOMElementSchema can only be used on the JS side where we can safely
  // use reflection for DOM elements
  if (IS_DARTIUM) return;

  describe('DOMElementSchema', () => {

    it('should detect properties on regular elements', () => {
      var entry = new DOMElementSchema('div');

      expect(entry.hasProperty('id')).toBeTruthy();
      expect(entry.hasProperty('title')).toBeTruthy();
      expect(entry.hasProperty('unknown')).toBeFalsy();
    });

    it('should detect properties on custom-like elements', () => {
      var entry = new DOMElementSchema('custom-like');

      expect(entry.hasProperty('id')).toBeTruthy();
      expect(entry.hasProperty('title')).toBeTruthy();
      expect(entry.hasProperty('unknown')).toBeFalsy();
    });

    it('should not re-map property names', () => {
      var entry = new DOMElementSchema('div');

      expect(entry.getMappedPropName('title')).toBeNull();
      expect(entry.getMappedPropName('exotic-unknown')).toBeNull();
    });
  });
}
