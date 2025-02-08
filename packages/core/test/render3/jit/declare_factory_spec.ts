/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Injector,
  ɵcreateInjector,
  ɵInjectorProfilerContext,
  ɵsetInjectorProfilerContext,
  ɵɵFactoryTarget,
  ɵɵngDeclareFactory,
} from '@angular/core';
import {ɵɵdefineInjector} from '@angular/core/src/di';
import {setCurrentInjector} from '@angular/core/src/di/injector_compatibility';

describe('Factory declaration jit compilation', () => {
  let previousInjector: Injector | null | undefined;
  let previousInjectorProfilerContext: ɵInjectorProfilerContext;
  beforeEach(() => {
    const injector = ɵcreateInjector(TestInjector);
    previousInjector = setCurrentInjector(injector);
    previousInjectorProfilerContext = ɵsetInjectorProfilerContext({injector, token: null});
  });
  afterEach(() => {
    setCurrentInjector(previousInjector);
    previousInjectorProfilerContext = ɵsetInjectorProfilerContext(previousInjectorProfilerContext);
  });

  it('should compile a simple factory declaration', () => {
    const factory = TestClass.ɵfac as Function;
    expect(factory.name).toEqual('TestClass_Factory');
    const instance = factory();
    expect(instance).toBeInstanceOf(TestClass);
  });

  it('should compile a factory declaration with dependencies', () => {
    const factory = DependingClass.ɵfac as Function;
    expect(factory.name).toEqual('DependingClass_Factory');
    const instance = factory();
    expect(instance).toBeInstanceOf(DependingClass);
    expect(instance.testClass).toBeInstanceOf(TestClass);
  });

  it('should compile a factory declaration that has inheritance', () => {
    const factory = ChildClass.ɵfac as Function;
    const instance = factory();
    expect(instance).toBeInstanceOf(ChildClass);
    expect(instance.testClass).toBeInstanceOf(TestClass);
  });

  it('should compile a factory declaration with an invalid dependency', () => {
    const factory = InvalidDepsClass.ɵfac as Function;
    expect(() => factory()).toThrowError(/not compatible/);
  });
});

class TestClass {
  static ɵfac = ɵɵngDeclareFactory({type: TestClass, deps: [], target: ɵɵFactoryTarget.Injectable});
}

class DependingClass {
  constructor(readonly testClass: TestClass) {}
  static ɵfac = ɵɵngDeclareFactory({
    type: DependingClass,
    deps: [{token: TestClass}],
    target: ɵɵFactoryTarget.Injectable,
  });
}

class ChildClass extends DependingClass {
  static override ɵfac = ɵɵngDeclareFactory({
    type: ChildClass,
    deps: null,
    target: ɵɵFactoryTarget.Injectable,
  });
}

class InvalidDepsClass {
  static ɵfac = ɵɵngDeclareFactory({
    type: InvalidDepsClass,
    deps: 'invalid',
    target: ɵɵFactoryTarget.Injectable,
  });
}

class TestInjector {
  static ɵinj = ɵɵdefineInjector({
    providers: [TestClass, DependingClass, ChildClass],
  });
}
