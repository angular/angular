import {describe, ddescribe, it, iit, expect, beforeEach} from 'angular2/testing_internal';
import {CONST_EXPR, IS_DART} from 'angular2/src/facade/lang';
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

  describe('InjectorFactory.bind', () => {
    it('should bind the context', () => {
      var factory = new MockInjectorFactory();
      expect(InjectorFactory.bind(factory, 'testContext').create()).toBe(Injector.NULL);
      expect(factory.context).toEqual('testContext');
    });
  });

  describe('InjectorFactory.EMPTY', () => {
    it('should return Injector.NULL if no parent is given',
       () => { expect(InjectorFactory.EMPTY.create()).toBe(Injector.NULL); });

    if (IS_DART) {
      it('should be const',
         () => { expect(InjectorFactory.EMPTY).toBe(CONST_EXPR(InjectorFactory.EMPTY)); });
    }
  });
}

class MockInjectorFactory implements InjectorFactory<any> {
  public context: any;
  public parent: Injector;
  create(parent: Injector = null, context: any = null): Injector {
    this.context = context;
    this.parent = parent;
    return Injector.NULL;
  }
}