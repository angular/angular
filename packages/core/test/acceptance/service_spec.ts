/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, InjectionToken, OnDestroy, Service, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('@Service decorator', () => {
  it('should be able to declare a class as an @Service', () => {
    @Service()
    class MyService {
      readonly value = 'MyService';
    }

    @Component({template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    const fixture = TestBed.createComponent(MyComp);
    expect(fixture.componentInstance.service.value).toBe('MyService');
  });

  it('should be able to provide an alternate implementation using `factory`', () => {
    @Service({factory: () => ({value: 'alternate'})})
    class MyService {
      readonly value = 'MyService';
    }

    @Component({template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    const fixture = TestBed.createComponent(MyComp);
    expect(fixture.componentInstance.service.value).toBe('alternate');
  });

  it('should be able to provide an alternate implementation using `factory` when `autoProvided` is set to true', () => {
    @Service({autoProvided: true, factory: () => ({value: 'alternate'})})
    class MyService {
      readonly value = 'MyService';
    }

    @Component({template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    const fixture = TestBed.createComponent(MyComp);
    expect(fixture.componentInstance.service.value).toBe('alternate');
  });

  it('should be able to inject dependencies inside the factory function', () => {
    const token = new InjectionToken<string>('token');

    @Service({factory: () => ({value: inject(token)})})
    class MyService {
      readonly value = 'MyService';
    }

    @Component({template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    TestBed.configureTestingModule({
      providers: [
        {
          provide: token,
          useValue: 'injectedValue',
        },
      ],
    });

    const fixture = TestBed.createComponent(MyComp);
    expect(fixture.componentInstance.service.value).toBe('injectedValue');
  });

  it('should not provide a service automatically if `autoProvided` is set to `false`', () => {
    @Service({autoProvided: false})
    class MyService {}

    @Component({template: ''})
    class App {
      readonly service = inject(MyService);
    }

    expect(() => TestBed.createComponent(App)).toThrowError(/No provider found for `MyService`/);
  });

  it('should be able to provide a service with `autoProvided: false`', () => {
    @Service({autoProvided: false})
    class MyService {
      readonly value = 'initial';
    }

    @Component({template: ''})
    class App {
      readonly service = inject(MyService);
    }

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MyService,
          useValue: {
            value: 'provided',
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance.service.value).toBe('provided');
  });

  it('should be able to override a service', () => {
    @Service()
    class MyService {
      readonly value = 'MyService';
    }

    @Service()
    class AlternateService {
      readonly value = 'AlternateService';
    }

    @Component({selector: 'my-comp', template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    @Component({
      template: '<my-comp/>',
      imports: [MyComp],
      providers: [{provide: MyService, useClass: AlternateService}],
    })
    class App {
      @ViewChild(MyComp) childInstance!: MyComp;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.childInstance.service.value).toBe('AlternateService');
  });

  it('should be able to override a service that has a factory', () => {
    @Service({factory: () => ({value: 'factory'})})
    class MyService {
      readonly value = 'MyService';
    }

    @Service()
    class AlternateService {
      readonly value = 'AlternateService';
    }

    @Component({selector: 'my-comp', template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    @Component({
      template: '<my-comp/>',
      imports: [MyComp],
      providers: [{provide: MyService, useClass: AlternateService}],
    })
    class App {
      @ViewChild(MyComp) childInstance!: MyComp;
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.childInstance.service.value).toBe('AlternateService');
  });

  it('should invoke ngOnDestroy on services', () => {
    let calls = 0;

    @Service()
    class MyService implements OnDestroy {
      ngOnDestroy(): void {
        calls++;
      }
    }

    @Component({template: ''})
    class MyComp {
      readonly service = inject(MyService);
    }

    const fixture = TestBed.createComponent(MyComp);
    fixture.detectChanges();
    fixture.destroy();
    TestBed.resetTestingModule();

    expect(calls).toBe(1);
  });
});
