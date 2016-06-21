import {describe, ddescribe, it, iit, expect, beforeEach} from 'angular2/testing_internal';
import {Injector, MapInjectorFactory} from 'angular2/core';
import {MapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('MapInjector', () => {
    it('should throw if not found', () => {
      expect(() => new MapInjectorFactory().create().get('someToken'))
          .toThrowError('No provider for someToken!');
    });

    it('should return the default value', () => {
      expect(new MapInjectorFactory().create().get('someToken', 'notFound')).toEqual('notFound');
    });

    it('should return a value from the map', () => {
      expect(new MapInjectorFactory(MapWrapper.createFromPairs([['someToken', 'someValue']]))
                 .create()
                 .get('someToken'))
          .toEqual('someValue');
    });

    it('should return the injector', () => {
      var injector = new MapInjectorFactory().create();
      expect(injector.get(Injector)).toBe(injector);
    });

    it('should delegate to the parent', () => {
      var parent =
          new MapInjectorFactory(MapWrapper.createFromPairs([['someToken', 'someValue']])).create();
      expect(new MapInjectorFactory().create(parent).get('someToken')).toEqual('someValue');
    });
  });
}
