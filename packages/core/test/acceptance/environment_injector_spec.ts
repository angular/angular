/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, createComponent, createEnvironmentInjector, ENVIRONMENT_INITIALIZER, EnvironmentInjector, inject, InjectFlags, InjectionToken, INJECTOR, Injector, NgModuleRef, ViewContainerRef} from '@angular/core';
import {R3Injector} from '@angular/core/src/di/r3_injector';
import {RuntimeError, RuntimeErrorCode} from '@angular/core/src/errors';
import {TestBed} from '@angular/core/testing';

describe('environment injector', () => {
  it('should create and destroy an environment injector', () => {
    class Service {}

    let destroyed = false;
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector([Service], parentEnvInjector) as R3Injector;
    envInjector.onDestroy(() => destroyed = true);

    const service = envInjector.get(Service);
    expect(service).toBeInstanceOf(Service);

    envInjector.destroy();
    expect(destroyed).toBeTrue();
  });

  it('should see providers from a parent EnvInjector', () => {
    class Service {}

    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector =
        createEnvironmentInjector([], createEnvironmentInjector([Service], parentEnvInjector));
    expect(envInjector.get(Service)).toBeInstanceOf(Service);
  });

  it('should shadow providers from the parent EnvInjector', () => {
    const token = new InjectionToken('token');

    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector(
        [{provide: token, useValue: 'child'}],
        createEnvironmentInjector([{provide: token, useValue: 'parent'}], parentEnvInjector));
    expect(envInjector.get(token)).toBe('child');
  });

  it('should expose the Injector token', () => {
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector([], parentEnvInjector);
    expect(envInjector.get(Injector)).toBe(envInjector);
    expect(envInjector.get(INJECTOR)).toBe(envInjector);
  });

  it('should expose the EnvInjector token', () => {
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector([], parentEnvInjector);
    expect(envInjector.get(EnvironmentInjector)).toBe(envInjector);
  });

  it('should expose the same object as both the Injector and EnvInjector token', () => {
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector([], parentEnvInjector);
    expect(envInjector.get(Injector)).toBe(envInjector.get(EnvironmentInjector));
  });

  it('should expose the NgModuleRef token', () => {
    class Service {}
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector([Service], parentEnvInjector);

    const ngModuleRef = envInjector.get(NgModuleRef);

    expect(ngModuleRef).toBeInstanceOf(NgModuleRef);
    // NgModuleRef proxies to an Injector holding supplied providers
    expect(ngModuleRef.injector.get(Service)).toBeInstanceOf(Service);
    // There is no actual instance of @NgModule-annotated class
    expect(ngModuleRef.instance).toBeNull();
  });

  it('should expose the ComponentFactoryResolver token bound to env injector with specified providers',
     () => {
       class Service {}

       @Component({selector: 'test-cmp'})
       class TestComponent {
         constructor(readonly service: Service) {}
       }

       const parentEnvInjector = TestBed.inject(EnvironmentInjector);
       const environmentInjector = createEnvironmentInjector([Service], parentEnvInjector);
       const cRef = createComponent(TestComponent, {environmentInjector});

       expect(cRef.instance.service).toBeInstanceOf(Service);
     });

  it('should support the ENVIRONMENT_INITIALIZER multi-token', () => {
    let initialized = false;
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    createEnvironmentInjector(
        [{
          provide: ENVIRONMENT_INITIALIZER,
          useValue: () => initialized = true,
          multi: true,
        }],
        parentEnvInjector);

    expect(initialized).toBeTrue();
  });

  it('should throw when the ENVIRONMENT_INITIALIZER is not a multi-token', () => {
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const providers = [{
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => {},
    }];
    expect(() => createEnvironmentInjector(providers, parentEnvInjector))
        .toThrowMatching((e: RuntimeError) => e.code === RuntimeErrorCode.INVALID_MULTI_PROVIDER);
  });

  it('should adopt environment-scoped providers', () => {
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const injector = createEnvironmentInjector([], parentEnvInjector);
    const EnvScopedToken = new InjectionToken('env-scoped token', {
      providedIn: 'environment' as any,
      factory: () => true,
    });
    expect(injector.get(EnvScopedToken, false)).toBeTrue();
  });

  describe('runInContext()', () => {
    it('should return the function\'s return value', () => {
      const injector = TestBed.inject(EnvironmentInjector);
      const returnValue = injector.runInContext(() => 3);
      expect(returnValue).toBe(3);
    });

    it('should work with an NgModuleRef injector', () => {
      const ref = TestBed.inject(NgModuleRef);
      const returnValue = ref.injector.runInContext(() => 3);
      expect(returnValue).toBe(3);
    });

    it('should return correct injector reference', () => {
      const ngModuleRef = TestBed.inject(NgModuleRef);
      const ref1 = ngModuleRef.injector.runInContext(() => inject(Injector));
      const ref2 = ngModuleRef.injector.get(Injector);
      expect(ref1).toBe(ref2);
    });

    it('should make inject() available', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');
      const injector = createEnvironmentInjector(
          [{provide: TOKEN, useValue: 'from injector'}], TestBed.inject(EnvironmentInjector));

      const result = injector.runInContext(() => inject(TOKEN));
      expect(result).toEqual('from injector');
    });

    it('should properly clean up after the function returns', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');
      const injector = TestBed.inject(EnvironmentInjector);
      injector.runInContext(() => {});
      expect(() => inject(TOKEN, InjectFlags.Optional)).toThrow();
    });

    it('should properly clean up after the function throws', () => {
      const TOKEN = new InjectionToken<string>('TOKEN');
      const injector = TestBed.inject(EnvironmentInjector);
      expect(() => injector.runInContext(() => {
        throw new Error('crashes!');
      })).toThrow();
      expect(() => inject(TOKEN, InjectFlags.Optional)).toThrow();
    });

    it('should set the correct inject implementation', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'from root',
      });

      @Component({
        standalone: true,
        template: '',
        providers: [{provide: TOKEN, useValue: 'from component'}],
      })
      class TestCmp {
        envInjector = inject(EnvironmentInjector);

        tokenFromComponent = inject(TOKEN);
        tokenFromEnvContext = this.envInjector.runInContext(() => inject(TOKEN));

        // Attempt to inject ViewContainerRef within the environment injector's context. This should
        // not be available, so the result should be `null`.
        vcrFromEnvContext =
            this.envInjector.runInContext(() => inject(ViewContainerRef, InjectFlags.Optional));
      }

      const instance = TestBed.createComponent(TestCmp).componentInstance;
      expect(instance.tokenFromComponent).toEqual('from component');
      expect(instance.tokenFromEnvContext).toEqual('from root');
      expect(instance.vcrFromEnvContext).toBeNull();
    });

    it('should be reentrant', () => {
      const TOKEN = new InjectionToken<string>('TOKEN', {
        providedIn: 'root',
        factory: () => 'from root',
      });

      const parentInjector = TestBed.inject(EnvironmentInjector);
      const childInjector =
          createEnvironmentInjector([{provide: TOKEN, useValue: 'from child'}], parentInjector);

      const results = parentInjector.runInContext(() => {
        const fromParentBefore = inject(TOKEN);
        const fromChild = childInjector.runInContext(() => inject(TOKEN));
        const fromParentAfter = inject(TOKEN);
        return {fromParentBefore, fromChild, fromParentAfter};
      });

      expect(results.fromParentBefore).toEqual('from root');
      expect(results.fromChild).toEqual('from child');
      expect(results.fromParentAfter).toEqual('from root');
    });

    it('should not function on a destroyed injector', () => {
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
      injector.destroy();
      expect(() => injector.runInContext(() => {})).toThrow();
    });
  });
});
