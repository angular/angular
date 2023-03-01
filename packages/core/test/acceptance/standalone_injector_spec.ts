/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, createEnvironmentInjector, EnvironmentInjector, Injector, NgModule, ViewChild, ViewContainerRef} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('standalone injector', () => {
  it('should create one standalone injector for each parent EnvInjector', () => {
    let counter = 0;

    class Service {
      value = counter++;
    }

    @NgModule({providers: [Service]})
    class ModuleWithAService {
    }

    @Component({
      selector: 'standalone',
      standalone: true,
      imports: [ModuleWithAService],
      template: `({{service.value}})`
    })
    class TestComponent {
      constructor(readonly service: Service) {}
    }

    @Component({selector: 'app', template: `<ng-template #insert></ng-template>`})
    class AppComponent {
      @ViewChild('insert', {static: true, read: ViewContainerRef}) vcRef!: ViewContainerRef;

      createComponent(envInjector?: EnvironmentInjector): void {
        this.vcRef.createComponent(TestComponent, {environmentInjector: envInjector});
      }
    }

    const fixture = TestBed.createComponent(AppComponent);
    const currEnvInjector = TestBed.inject(EnvironmentInjector);

    fixture.componentInstance.createComponent(currEnvInjector);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(0)');

    // inserting the same standalone component second time and asserting that no new injector /
    // service instance gets created
    fixture.componentInstance.createComponent(currEnvInjector);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(0)(0)');

    // inserting with a different EnvInjector as a parent should trigger a new service instance
    // creation
    fixture.componentInstance.createComponent(createEnvironmentInjector([], currEnvInjector));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('(0)(0)(1)');
  });

  it('should create a standalone Injector for ComponentRefs that are not inserted anywhere', () => {
    class Service {
      value = 'Service value';
    }

    @NgModule({providers: [Service]})
    class ModuleWithAService {
    }

    @Component({
      selector: 'standalone',
      standalone: true,
      imports: [ModuleWithAService],
      template: `{{service.value}}`
    })
    class DynamicComponent {
      constructor(readonly service: Service) {}
    }

    @Component({})
    class AppComponent {
    }

    const fixture = TestBed.createComponent(AppComponent);

    const cfr = TestBed.inject(ComponentFactoryResolver);
    const cf = cfr.resolveComponentFactory(DynamicComponent);

    const componentRef = cf.create(Injector.NULL);
    componentRef.changeDetectorRef.detectChanges();

    expect(componentRef.location.nativeElement.textContent).toBe('Service value');
  });
});
