import {describe, ddescribe, it, iit, expect, beforeEach} from 'angular2/testing_internal';
import {Injector, InjectorFactory} from 'angular2/core';

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

  describe('InjectorFactory.EMPTY', () => {
    it('should return Injector.NULL if no parent is given',
       () => { expect(InjectorFactory.EMPTY.create()).toBe(Injector.NULL); });


  });
}
