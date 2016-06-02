import {describe, ddescribe, it, iit, expect, beforeEach} from 'angular2/testing_internal';
import {Injector, MapInjector} from 'angular2/core';
import {MapWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('Injector.NULL', () => {
    it('should throw if no arg is given', () => {expect(() => Injector.NULL.get('someToken'))
                                                     .toThrowError('No provider for someToken!')});

    it('should throw if THROW_IF_NOT_FOUND is given',
       () => {expect(() => Injector.NULL.get('someToken', Injector.THROW_IF_NOT_FOUND))
                  .toThrowError('No provider for someToken!')});

    it('should return the default value',
       () => { expect(Injector.NULL.get('someToken', 'notFound')).toEqual('notFound'); });
  });

  describe('MapInjector', () => {
    it('should throw if not found', () => {
      expect(() => new MapInjector(null, new Map<any, any>()).get('someToken'))
          .toThrowError('No provider for someToken!');
    });

    it('should return the default value', () => {
      expect(new MapInjector(null, new Map<any, any>()).get('someToken', 'notFound'))
          .toEqual('notFound');
    });

    it('should return a value from the map', () => {
      expect(new MapInjector(null, MapWrapper.createFromPairs([['someToken', 'someValue']]))
                 .get('someToken'))
          .toEqual('someValue');
    });

    it('should return the injector', () => {
      var injector = new MapInjector(null, new Map<any, any>());
      expect(injector.get(Injector)).toBe(injector);
    });

    it('should delegate to the parent', () => {
      var parent = new MapInjector(null, MapWrapper.createFromPairs([['someToken', 'someValue']]));
      expect(new MapInjector(parent, new Map<any, any>()).get('someToken')).toEqual('someValue');
    });

  });
}
