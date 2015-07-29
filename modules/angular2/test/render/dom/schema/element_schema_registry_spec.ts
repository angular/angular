import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachBindings,
  SpyObject,
} from 'angular2/test_lib';

import {HashElementSchema} from 'angular2/src/render/dom/schema/element_schema_entry';
import {ElementSchemaRegistryImpl} from 'angular2/src/render/dom/schema/element_schema_registry';

export function main() {
  describe('ElementSchemaRegistryImpl', () => {

    it('should detect properties from entries', () => {
      var registry =
          new ElementSchemaRegistryImpl([new HashElementSchema('foo-bar', {'id': 'id'})]);
      expect(registry.hasProperty('foo-bar', 'id')).toBeTruthy();
      expect(registry.hasProperty('foo-bar', 'unknown')).toBeFalsy();
    });

    it('should detect properties from extended entries', () => {
      var registry = new ElementSchemaRegistryImpl([
        new HashElementSchema('foo-bar', {'id': 'id'}),
        new HashElementSchema('bar-baz', {}, 'foo-bar')
      ]);
      expect(registry.hasProperty('bar-baz', 'id')).toBeTruthy();
      expect(registry.hasProperty('bar-baz', 'unknown')).toBeFalsy();
    });

    it('should handle properties re-mapping from entries', () => {
      var registry =
          new ElementSchemaRegistryImpl([new HashElementSchema('foo-bar', {'id': 'myId'})]);
      expect(registry.getMappedPropName('foo-bar', 'id')).toEqual('myId');
      expect(registry.getMappedPropName('foo-bar', 'unknown')).toEqual('unknown');
    });

    it('should handle properties re-mapping from extended entries', () => {
      var registry = new ElementSchemaRegistryImpl([
        new HashElementSchema('foo-bar', {'id': 'myId'}),
        new HashElementSchema('bar-baz', {}, 'foo-bar')
      ]);
      expect(registry.getMappedPropName('bar-baz', 'id')).toEqual('myId');
      expect(registry.getMappedPropName('bar-baz', 'unknown')).toEqual('unknown');
    });

    it('should use property re-mapping from the top-level entry', () => {
      var registry = new ElementSchemaRegistryImpl([
        new HashElementSchema('foo-bar', {'id': 'myId'}),
        new HashElementSchema('bar-baz', {'id': 'topId'}, 'foo-bar'),
        new HashElementSchema('baz-foo', {}, 'bar-baz')
      ]);
      expect(registry.getMappedPropName('baz-foo', 'id')).toEqual('topId');
      expect(registry.getMappedPropName('baz-foo', 'unknown')).toEqual('unknown');
    });

    it('should throw for unknown entries', () => {
      var registry = new ElementSchemaRegistryImpl([]);
      expect(() => { registry.hasProperty('div', 'someProp'); })
          .toThrowError("Missing schema entry for 'div'");
    });
  })
}
