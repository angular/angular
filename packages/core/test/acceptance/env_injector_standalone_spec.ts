/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  importProvidersFrom,
  InjectionToken,
  NgModule,
} from '../../src/core';
import {TestBed} from '../../testing';

import {internalImportProvidersFrom} from '../../src/di/provider_collection';

describe('environment injector and standalone components', () => {
  it('should see providers from modules imported by standalone components', () => {
    class ModuleService {}

    @NgModule({providers: [ModuleService]})
    class Module {}

    @Component({imports: [Module]})
    class StandaloneComponent {}

    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector(
      internalImportProvidersFrom(false, StandaloneComponent),
      parentEnvInjector,
    );
    expect(envInjector.get(ModuleService)).toBeInstanceOf(ModuleService);
  });

  it('should see providers when exporting a standalone components', () => {
    class ModuleService {}

    @NgModule({providers: [ModuleService]})
    class Module {}

    @Component({imports: [Module]})
    class StandaloneComponent {}

    @NgModule({imports: [StandaloneComponent], exports: [StandaloneComponent]})
    class AppModule {}

    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector(
      [importProvidersFrom(AppModule)],
      parentEnvInjector,
    );
    expect(envInjector.get(ModuleService)).toBeInstanceOf(ModuleService);
  });

  it('should not collect duplicate providers', () => {
    class ModuleService {}

    @NgModule({providers: [{provide: ModuleService, useClass: ModuleService, multi: true}]})
    class Module {}

    @Component({imports: [Module]})
    class StandaloneComponent1 {}

    @Component({imports: [Module]})
    class StandaloneComponent2 {}

    @NgModule({
      imports: [StandaloneComponent1, StandaloneComponent2],
      exports: [StandaloneComponent1, StandaloneComponent2],
    })
    class AppModule {}

    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector(
      [importProvidersFrom(AppModule)],
      parentEnvInjector,
    );
    const services = envInjector.get(ModuleService) as ModuleService[];

    expect(services.length).toBe(1);
  });

  it('should support nested arrays of providers', () => {
    const A = new InjectionToken('A');
    const B = new InjectionToken('B');
    const C = new InjectionToken('C');
    const MULTI = new InjectionToken('D');

    const providers = [
      {provide: MULTI, useValue: 1, multi: true},
      {provide: A, useValue: 'A'}, //
      [
        {provide: B, useValue: 'B'},
        [
          {provide: C, useValue: 'C'},
          {provide: MULTI, useValue: 2, multi: true},
        ],
      ],
    ];
    const parentEnvInjector = TestBed.inject(EnvironmentInjector);
    const envInjector = createEnvironmentInjector(providers, parentEnvInjector);
    expect(envInjector.get(A)).toBe('A');
    expect(envInjector.get(B)).toBe('B');
    expect(envInjector.get(C)).toBe('C');
    expect(envInjector.get(MULTI)).toEqual([1, 2]);
  });
});
