/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createComponent,
  createEnvironmentInjector,
  EnvironmentInjector,
  NgModule,
  ViewChild,
  ViewContainerRef,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('standalone injector', () => {
  it('should create one standalone injector for each parent EnvInjector', () => {
    let counter = 0;

    class Service {
      value = counter++;
    }

    @NgModule({providers: [Service]})
    class ModuleWithAService {}

    @Component({
      selector: 'standalone',
      imports: [ModuleWithAService],
      template: `({{service.value}})`,
    })
    class TestComponent {
      constructor(readonly service: Service) {}
    }

    @Component({
      selector: 'app',
      template: `<ng-template #insert></ng-template>`,
      standalone: false,
    })
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
    class ModuleWithAService {}

    @Component({
      selector: 'standalone',
      imports: [ModuleWithAService],
      template: `{{service.value}}`,
    })
    class DynamicComponent {
      constructor(readonly service: Service) {}
    }

    @Component({
      standalone: false,
    })
    class AppComponent {}

    const fixture = TestBed.createComponent(AppComponent);

    const environmentInjector = createEnvironmentInjector(
      [Service],
      TestBed.inject(EnvironmentInjector),
    );
    const componentRef = createComponent(DynamicComponent, {environmentInjector});
    componentRef.changeDetectorRef.detectChanges();

    expect(componentRef.location.nativeElement.textContent).toBe('Service value');
  });
});
