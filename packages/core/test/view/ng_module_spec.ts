/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModuleRef} from '@angular/core';
import {InjectableDef, defineInjectable} from '@angular/core/src/di/defs';
import {INJECTOR, Injector} from '@angular/core/src/di/injector';
import {InjectFlags, inject} from '@angular/core/src/di/injector_compatibility';
import {makePropDecorator} from '@angular/core/src/util/decorators';
import {NgModuleDefinition, NgModuleProviderDef, NodeFlags} from '@angular/core/src/view';
import {moduleDef, moduleProvideDef, resolveNgModuleDep} from '@angular/core/src/view/ng_module';
import {createNgModuleRef} from '@angular/core/src/view/refs';
import {tokenKey} from '@angular/core/src/view/util';
import {APP_ROOT} from '../../src/di/scope';

class Foo {}

class MyModule {}

class MyChildModule {}

class NotMyModule {}

class Bar {
  static ngInjectableDef: InjectableDef<Bar> = defineInjectable({
    factory: () => new Bar(),
    providedIn: MyModule,
  });
}

class Baz {
  static ngInjectableDef: InjectableDef<Baz> = defineInjectable({
    factory: () => new Baz(),
    providedIn: NotMyModule,
  });
}

class HasNormalDep {
  constructor(public foo: Foo) {}

  static ngInjectableDef: InjectableDef<HasNormalDep> = defineInjectable({
    factory: () => new HasNormalDep(inject(Foo)),
    providedIn: MyModule,
  });
}

class HasDefinedDep {
  constructor(public bar: Bar) {}

  static ngInjectableDef: InjectableDef<HasDefinedDep> = defineInjectable({
    factory: () => new HasDefinedDep(inject(Bar)),
    providedIn: MyModule,
  });
}

class HasOptionalDep {
  constructor(public baz: Baz|null) {}

  static ngInjectableDef: InjectableDef<HasOptionalDep> = defineInjectable({
    factory: () => new HasOptionalDep(inject(Baz, InjectFlags.Optional)),
    providedIn: MyModule,
  });
}

class ChildDep {
  static ngInjectableDef: InjectableDef<ChildDep> = defineInjectable({
    factory: () => new ChildDep(),
    providedIn: MyChildModule,
  });
}

class FromChildWithOptionalDep {
  constructor(public baz: Baz|null) {}
  static ngInjectableDef: InjectableDef<FromChildWithOptionalDep> = defineInjectable({
    factory: () => new FromChildWithOptionalDep(inject(Baz, InjectFlags.Default)),
    providedIn: MyChildModule,
  });
}

class FromChildWithSkipSelfDep {
  constructor(
      public skipSelfChildDep: ChildDep|null, public selfChildDep: ChildDep|null,
      public optionalSelfBar: Bar|null) {}
  static ngInjectableDef: InjectableDef<FromChildWithSkipSelfDep> = defineInjectable({
    factory: () => new FromChildWithSkipSelfDep(
                 inject(ChildDep, InjectFlags.SkipSelf|InjectFlags.Optional),
                 inject(ChildDep, InjectFlags.Self),
                 inject(Bar, InjectFlags.Self|InjectFlags.Optional), ),
    providedIn: MyChildModule,
  });
}

class UsesInject {
  constructor() { inject(INJECTOR); }
}

function makeProviders(classes: any[], modules: any[]): NgModuleDefinition {
  const providers =
      classes.map((token, index) => ({
                    index,
                    deps: [],
                    flags: NodeFlags.TypeClassProvider | NodeFlags.LazyProvider, token,
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
  return {factory: null, providers, providersByKey, modules, isRoot: true};
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

  it('injects a provided value',
     () => { expect(ref.injector.get(Foo) instanceof Foo).toBeTruthy(); });

  it('injects an InjectableDef value',
     () => { expect(ref.injector.get(Bar) instanceof Bar).toBeTruthy(); });

  it('caches InjectableDef values',
     () => { expect(ref.injector.get(Bar)).toBe(ref.injector.get(Bar)); });

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

  it('does not inject something not scoped to the module',
     () => { expect(ref.injector.get(Baz, null)).toBeNull(); });

  it('injects with the current injector always set',
     () => { expect(() => ref.injector.get(UsesInject)).not.toThrow(); });

  it('calls ngOnDestroy on services created via factory', () => {
    class Module {}

    class Service {
      static destroyed = 0;
      ngOnDestroy(): void { Service.destroyed++; }
    }

    const ref = createNgModuleRef(
        Module, Injector.NULL, [], makeFactoryProviders(
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

  it('only calls ngOnDestroy once per instance', () => {
    class Module {}

    class Service {
      static destroyed = 0;
      ngOnDestroy(): void { Service.destroyed++; }
    }

    class OtherToken {}

    const instance = new Service();
    const ref = createNgModuleRef(
        Module, Injector.NULL, [], makeFactoryProviders(
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
        deps: [], token, value
      };
    }

    it('sets isRoot to `true` when APP_ROOT is `true`', () => {
      const def = moduleDef([createProvider(APP_ROOT, true)]);
      expect(def.isRoot).toBe(true);
    });

    it('sets isRoot to `false` when APP_ROOT is absent', () => {
      const def = moduleDef([]);
      expect(def.isRoot).toBe(false);
    });

    it('sets isRoot to `false` when APP_ROOT is `false`', () => {
      const def = moduleDef([createProvider(APP_ROOT, false)]);
      expect(def.isRoot).toBe(false);
    });
  });
});
