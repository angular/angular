/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, ɵcreateInjector, ɵɵFactoryTarget, ɵɵngDeclareFactory} from '@angular/core';
import {ɵɵdefineInjector} from '@angular/core/src/di';
import {setCurrentInjector} from '@angular/core/src/di/injector_compatibility';

describe('Factory declaration jit compilation', () => {
  let previousInjector: Injector|null|undefined;
  beforeEach(() => previousInjector = setCurrentInjector(ɵcreateInjector(TestInjector)));
  afterEach(() => setCurrentInjector(previousInjector));

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
  static override ɵfac =
      ɵɵngDeclareFactory({type: ChildClass, deps: null, target: ɵɵFactoryTarget.Injectable});
}

class TestInjector {
  static ɵinj = ɵɵdefineInjector({
    providers: [TestClass, DependingClass, ChildClass],
  });
}
