/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, createEnvironmentInjector, importProvidersFrom, NgModule} from '@angular/core';

describe('environement injector and standalone components', () => {
  it('should see providers from modules imported by standalone components', () => {
    class ModuleService {}

    @NgModule({providers: [ModuleService]})
    class Module {
    }

    @Component({standalone: true, imports: [Module]})
    class StandaloneComponent {
    }

    const envInjector = createEnvironmentInjector(importProvidersFrom(StandaloneComponent));
    expect(envInjector.get(ModuleService)).toBeInstanceOf(ModuleService);
  });

  it('should see providers when exporting a standalone components', () => {
    class ModuleService {}

    @NgModule({providers: [ModuleService]})
    class Module {
    }

    @Component({standalone: true, imports: [Module]})
    class StandaloneComponent {
    }

    @NgModule({imports: [StandaloneComponent], exports: [StandaloneComponent]})
    class AppModule {
    }

    const envInjector = createEnvironmentInjector(importProvidersFrom(AppModule));
    expect(envInjector.get(ModuleService)).toBeInstanceOf(ModuleService);
  });

  it('should not collect duplicate providers', () => {
    class ModuleService {}

    @NgModule({providers: [{provide: ModuleService, useClass: ModuleService, multi: true}]})
    class Module {
    }

    @Component({standalone: true, imports: [Module]})
    class StandaloneComponent1 {
    }

    @Component({standalone: true, imports: [Module]})
    class StandaloneComponent2 {
    }

    @NgModule({
      imports: [StandaloneComponent1, StandaloneComponent2],
      exports: [StandaloneComponent1, StandaloneComponent2]
    })
    class AppModule {
    }

    const envInjector = createEnvironmentInjector(importProvidersFrom(AppModule));
    const services = envInjector.get(ModuleService) as ModuleService[];

    expect(services.length).toBe(1);
  });
});
