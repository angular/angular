/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleRef, ɵINJECTOR_SCOPE as INJECTOR_SCOPE} from '@angular/core';
import {inject, InjectFlags} from '@angular/core/src/di';
import {Injector} from '@angular/core/src/di/injector';
import {INJECTOR} from '@angular/core/src/di/injector_token';
import {ɵɵdefineInjectable} from '@angular/core/src/di/interface/defs';
import {NgModuleDefinition, NgModuleProviderDef, NodeFlags} from '@angular/core/src/view';
import {moduleDef} from '@angular/core/src/view/ng_module';
import {createNgModuleRef} from '@angular/core/src/view/refs';
import {tokenKey} from '@angular/core/src/view/util';

class Foo {}

class MyModule {}

class MyChildModule {}

class NotMyModule {}

class Bar {
  static ɵprov = ɵɵdefineInjectable({
    token: Bar,
    factory: () => new Bar(),
    providedIn: MyModule,
  });
}

class Baz {
  static ɵprov = ɵɵdefineInjectable({
    token: Baz,
    factory: () => new Baz(),
    providedIn: NotMyModule,
  });
}

class HasNormalDep {
  constructor(public foo: Foo) {}

  static ɵprov = ɵɵdefineInjectable({
    token: HasNormalDep,
    factory: () => new HasNormalDep(inject(Foo)),
    providedIn: MyModule,
  });
}

class HasDefinedDep {
  constructor(public bar: Bar) {}

  static ɵprov = ɵɵdefineInjectable({
    token: HasDefinedDep,
    factory: () => new HasDefinedDep(inject(Bar)),
    providedIn: MyModule,
  });
}

class HasOptionalDep {
  constructor(public baz: Baz|null) {}

  static ɵprov = ɵɵdefineInjectable({
    token: HasOptionalDep,
    factory: () => new HasOptionalDep(inject(Baz, InjectFlags.Optional)),
    providedIn: MyModule,
  });
}

class ChildDep {
  static ɵprov = ɵɵdefineInjectable({
    token: ChildDep,
    factory: () => new ChildDep(),
    providedIn: MyChildModule,
  });
}

class FromChildWithOptionalDep {
  constructor(public baz: Baz|null) {}
  static ɵprov = ɵɵdefineInjectable({
    token: FromChildWithOptionalDep,
    factory: () => new FromChildWithOptionalDep(inject(Baz, InjectFlags.Default)),
    providedIn: MyChildModule,
  });
}

class FromChildWithSkipSelfDep {
  constructor(
      public skipSelfChildDep: ChildDep|null, public selfChildDep: ChildDep|null,
      public optionalSelfBar: Bar|null) {}
  static ɵprov = ɵɵdefineInjectable({
    token: FromChildWithSkipSelfDep,
    factory: () => new FromChildWithSkipSelfDep(
        inject(ChildDep, InjectFlags.SkipSelf|InjectFlags.Optional),
        inject(ChildDep, InjectFlags.Self),
        inject(Bar, InjectFlags.Self|InjectFlags.Optional),
        ),
    providedIn: MyChildModule,
  });
}

class UsesInject {
  constructor() {
    inject(INJECTOR);
  }
}

function makeProviders(classes: any[], modules: any[]): NgModuleDefinition {
  const providers = classes.map((token, index) => ({
                                  index,
                                  deps: [],
                                  flags: NodeFlags.TypeClassProvider | NodeFlags.LazyProvider,
                                  token,
                                  value: token,
                                }));
  return makeModule(modules, providers);
}

function makeFactoryProviders(
    factories: {token: any, factory: Function}[], modules: any[]): NgModuleDefinition {
  const providers = factories.map((factory, index) => ({
                                    index,
                                    deps: [],
                                    flags: NodeFlags.TypeFactoryProvider | NodeFlags.LazyProvider,
                                    token: factory.token,
                                    value: factory.factory,
                                  }));
  return makeModule(modules, providers);
}

function makeModule(modules: any[], providers: NgModuleProviderDef[]): NgModuleDefinition {
  const providersByKey: {[key: string]: NgModuleProviderDef} = {};
  providers.forEach(provider => providersByKey[tokenKey(provider.token)] = provider);
  return {factory: null, providers, providersByKey, modules, scope: 'root'};
}

describe('NgModuleRef_ injector', () => {
  let ref: NgModuleRef<any>;
  let childRef: NgModuleRef<any>;
  beforeEach(() => {
    ref = createNgModuleRef(
        MyModule, Injector.NULL, [], makeProviders([MyModule, Foo, UsesInject], [MyModule]));
    childRef = createNgModuleRef(
        MyChildModule, ref.injector, [], makeProviders([MyChildModule], [MyChildModule]));
  });

  it('injects a provided value', () => {
    expect(ref.injector.get(Foo) instanceof Foo).toBeTruthy();
  });

  it('injects an injectable value', () => {
    expect(ref.injector.get(Bar) instanceof Bar).toBeTruthy();
  });

  it('caches injectable values', () => {
    expect(ref.injector.get(Bar)).toBe(ref.injector.get(Bar));
  });

  it('injects provided deps properly', () => {
    const instance = ref.injector.get(HasNormalDep);
    expect(instance instanceof HasNormalDep).toBeTruthy();
    expect(instance.foo).toBe(ref.injector.get(Foo));
  });

  it('injects defined deps properly', () => {
    const instance = ref.injector.get(HasDefinedDep);
    expect(instance instanceof HasDefinedDep).toBeTruthy();
    expect(instance.bar).toBe(ref.injector.get(Bar));
  });

  it('injects optional deps properly', () => {
    const instance = ref.injector.get(HasOptionalDep);
    expect(instance instanceof HasOptionalDep).toBeTruthy();
    expect(instance.baz).toBeNull();
  });

  it('injects skip-self and self deps across injectors properly', () => {
    const instance = childRef.injector.get(FromChildWithSkipSelfDep);
    expect(instance instanceof FromChildWithSkipSelfDep).toBeTruthy();
    expect(instance.skipSelfChildDep).toBeNull();
    expect(instance.selfChildDep instanceof ChildDep).toBeTruthy();
    expect(instance.optionalSelfBar).toBeNull();
  });

  it('does not inject something not scoped to the module', () => {
    expect(ref.injector.get(Baz, null)).toBeNull();
  });

  it('injects with the current injector always set', () => {
    expect(() => ref.injector.get(UsesInject)).not.toThrow();
  });

  it('calls ngOnDestroy on services created via factory', () => {
    class Module {}

    class Service {
      static destroyed = 0;
      ngOnDestroy(): void {
        Service.destroyed++;
      }
    }

    const ref = createNgModuleRef(
        Module, Injector.NULL, [],
        makeFactoryProviders(
            [{
              token: Service,
              factory: () => new Service(),
            }],
            [Module]));

    expect(ref.injector.get(Service)).toBeDefined();
    expect(Service.destroyed).toBe(0);
    ref.destroy();
    expect(Service.destroyed).toBe(1);
  });

  it('calls ngOnDestroy on scoped providers', () => {
    class Module {}

    class Service {
      static destroyed = 0;

      ngOnDestroy(): void {
        Service.destroyed++;
      }

      static ɵprov = ɵɵdefineInjectable({
        token: Service,
        factory: () => new Service(),
        providedIn: 'root',
      });
    }

    const ref = createNgModuleRef(Module, Injector.NULL, [], makeFactoryProviders([], [Module]));

    expect(ref.injector.get(Service)).toBeDefined();
    expect(Service.destroyed).toBe(0);
    ref.destroy();
    expect(Service.destroyed).toBe(1);
  });

  it('only calls ngOnDestroy once per instance', () => {
    class Module {}

    class Service {
      static destroyed = 0;
      ngOnDestroy(): void {
        Service.destroyed++;
      }
    }

    class OtherToken {}

    const instance = new Service();
    const ref = createNgModuleRef(
        Module, Injector.NULL, [],
        makeFactoryProviders(
            [
              {
                token: Service,
                factory: () => instance,
              },
              {
                token: OtherToken,
                factory: () => instance,
              }
            ],
            [Module]));

    expect(ref.injector.get(Service)).toBe(instance);
    expect(ref.injector.get(OtherToken)).toBe(instance);
    expect(Service.destroyed).toBe(0);
    ref.destroy();
    expect(Service.destroyed).toBe(1);
  });

  describe('moduleDef', () => {
    function createProvider(token: any, value: any) {
      return {
        index: 0,
        flags: NodeFlags.TypeValueProvider | NodeFlags.LazyProvider,
        deps: [],
        token,
        value
      };
    }

    it('sets scope to `root` when INJECTOR_SCOPE is `root`', () => {
      const def = moduleDef([createProvider(INJECTOR_SCOPE, 'root')]);
      expect(def.scope).toBe('root');
    });

    it('sets scope to `platform` when INJECTOR_SCOPE is `platform`', () => {
      const def = moduleDef([createProvider(INJECTOR_SCOPE, 'platform')]);
      expect(def.scope).toBe('platform');
    });

    it('sets scope to `null` when INJECTOR_SCOPE is absent', () => {
      const def = moduleDef([]);
      expect(def.scope).toBe(null);
    });

    it('sets scope to `null` when INJECTOR_SCOPE is `null`', () => {
      const def = moduleDef([createProvider(INJECTOR_SCOPE, null)]);
      expect(def.scope).toBe(null);
    });
  });
});
