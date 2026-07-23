/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  forwardRef,
  InjectionToken,
  Injector,
  ɵcreateInjector,
  ɵInjectorProfilerContext,
  ɵsetCurrentInjector,
  ɵsetInjectorProfilerContext,
  ɵɵdefineInjector,
  ɵɵInjectableDeclaration,
  ɵɵngDeclareInjectable,
  ɵɵngDeclareInjector,
} from '../../../src/core';
import {RetrievingInjector} from '../../../src/di/injector_compatibility';

describe('Injectable declaration jit compilation', () => {
  let previousInjector: RetrievingInjector | null | undefined;
  let previousInjectorProfilerContext: ɵInjectorProfilerContext;
  beforeEach(() => {
    const injector = new RetrievingInjector(ɵcreateInjector(TestInjector));
    previousInjector = ɵsetCurrentInjector(injector) as RetrievingInjector;
    previousInjectorProfilerContext = ɵsetInjectorProfilerContext({
      injector: injector.injector,
      token: null,
    });
  });
  afterEach(() => {
    ɵsetCurrentInjector(previousInjector);
    previousInjectorProfilerContext = ɵsetInjectorProfilerContext(previousInjectorProfilerContext);
  });

  it('should compile a minimal injectable declaration that delegates to `ɵfac`', () => {
    const provider = Minimal.ɵprov as ɵɵInjectableDeclaration<Minimal>;
    expect((provider.token as any).name).toEqual('Minimal');
    expect(provider.factory).toBe(Minimal.ɵfac);
    const instance = provider.factory();
    expect(instance).toBeInstanceOf(Minimal);
  });

  it('should compile a simple `useClass` injectable declaration', () => {
    const provider = UseClass.ɵprov as ɵɵInjectableDeclaration<UseClass>;
    expect((provider.token as any).name).toEqual('UseClass');
    const instance = provider.factory();
    expect(instance).toBeInstanceOf(UseClass);
  });

  it('should compile a simple `useFactory` injectable declaration', () => {
    const provider = UseFactory.ɵprov as ɵɵInjectableDeclaration<UseFactory>;
    expect((provider.token as any).name).toEqual('UseFactory');
    const instance = provider.factory();
    expect(instance).toBeInstanceOf(UseFactory);
    expect(instance.msg).toEqual('from factory');
  });

  it('should compile a simple `useValue` injectable declaration', () => {
    const provider = UseValue.ɵprov as ɵɵInjectableDeclaration<string>;
    expect((provider.token as any).name).toEqual('UseValue');
    const instance = provider.factory();
    expect(instance).toEqual('a value');
  });

  it('should compile a simple `useExisting` injectable declaration', () => {
    const provider = UseExisting.ɵprov as ɵɵInjectableDeclaration<string>;
    expect((provider.token as any).name).toEqual('UseExisting');
    const instance = provider.factory();
    expect(instance).toEqual('existing');
  });

  it('should compile a `useClass` injectable declaration with dependencies', () => {
    const provider = DependingClass.ɵprov as ɵɵInjectableDeclaration<DependingClass>;
    expect((provider.token as any).name).toEqual('DependingClass');
    const instance = provider.factory();
    expect(instance).toBeInstanceOf(DependingClass);
    expect(instance.testClass).toBeInstanceOf(UseClass);
  });

  it('should compile a `useFactory` injectable declaration with dependencies', () => {
    const provider = DependingFactory.ɵprov as ɵɵInjectableDeclaration<DependingFactory>;
    expect((provider.token as any).name).toEqual('DependingFactory');
    const instance = provider.factory();
    expect(instance).toBeInstanceOf(DependingFactory);
    expect(instance.testClass).toBeInstanceOf(UseClass);
  });

  it('should unwrap a `ForwardRef` `useClass` injectable declaration', () => {
    class TestClass {
      static ɵprov = ɵɵngDeclareInjectable({
        type: TestClass,
        useClass: forwardRef(function () {
          return FutureClass;
        }),
      });
    }
    class FutureClass {
      static ɵfac = () => new FutureClass();
    }
    const provider = TestClass.ɵprov as ɵɵInjectableDeclaration<FutureClass>;
    const instance = provider.factory();
    expect(instance).toBeInstanceOf(FutureClass);
  });

  it('should unwrap a `ForwardRef` `providedIn` injectable declaration', () => {
    const expected = {};
    class TestClass {
      static ɵprov = ɵɵngDeclareInjectable({
        type: TestClass,
        providedIn: forwardRef(() => FutureModule),
        useValue: expected,
      });
    }
    class FutureModule {
      static ɵinj = ɵɵngDeclareInjector({type: FutureModule});
    }

    const injector = ɵcreateInjector(FutureModule);
    const actual = injector.get(TestClass);
    expect(actual).toBe(expected);
  });
});

class Minimal {
  static ɵfac = () => new Minimal();
  static ɵprov = ɵɵngDeclareInjectable({type: Minimal});
}

class UseClass {
  static ɵprov = ɵɵngDeclareInjectable({type: UseClass, useClass: UseClass});
}

class UseFactory {
  constructor(readonly msg: string) {}
  static ɵprov = ɵɵngDeclareInjectable({
    type: UseFactory,
    useFactory: () => new UseFactory('from factory'),
  });
}

class UseValue {
  constructor(readonly msg: string) {}
  static ɵprov = ɵɵngDeclareInjectable({type: UseValue, useValue: 'a value'});
}

const UseExistingToken = new InjectionToken('UseExistingToken');

class UseExisting {
  static ɵprov = ɵɵngDeclareInjectable({type: UseExisting, useExisting: UseExistingToken});
}

class DependingClass {
  constructor(readonly testClass: UseClass) {}
  static ɵprov = ɵɵngDeclareInjectable({
    type: DependingClass,
    useClass: DependingClass,
    deps: [{token: UseClass}],
  });
}

class DependingFactory {
  constructor(readonly testClass: UseClass) {}
  static ɵprov = ɵɵngDeclareInjectable({
    type: DependingFactory,
    useFactory: (dep: UseClass) => new DependingFactory(dep),
    deps: [{token: UseClass}],
  });
}

class TestInjector {
  static ɵinj = ɵɵdefineInjector({
    providers: [
      UseClass,
      UseFactory,
      UseValue,
      UseExisting,
      DependingClass,
      {provide: UseExistingToken, useValue: 'existing'},
    ],
  });
}
