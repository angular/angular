/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EnvironmentInjector,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  ViewRef,
  input,
  runInInjectionContext,
} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {Subject} from 'rxjs';

import {
  ComponentNgElementStrategy,
  ComponentNgElementStrategyFactory,
} from '../src/component-factory-strategy';
import {NgElementStrategyEvent} from '../src/element-strategy';
import {ComponentFactory} from '@angular/core/src/render3';
import {R3Injector} from '@angular/core/src/di/r3_injector';

describe('ComponentFactoryNgElementStrategy', () => {
  let strategy: ComponentNgElementStrategy<FakeComponent>;

  let injector: jasmine.SpyObj<Injector>;
  let componentRef: jasmine.SpyObj<ComponentRef<any>>;
  let applicationRef: jasmine.SpyObj<ApplicationRef>;
  let ngZone: jasmine.SpyObj<NgZone>;
  let environmentInjector: jasmine.SpyObj<EnvironmentInjector>;

  let injectables: Map<unknown, unknown>;

  beforeEach(() => {
    injector = jasmine.createSpyObj<Injector>('injector', ['get']);
    injector.get.and.callFake((token: unknown) => {
      if (!injectables.has(token)) {
        throw new Error(`Failed to get injectable from mock injector: ${token}`);
      }
      return injectables.get(token);
    });

    componentRef = jasmine.createSpyObj<ComponentRef<any>>(
      'componentRef',
      // Method spies.
      ['destroy', 'setInput'],
      // Property spies.
      {
        changeDetectorRef: jasmine.createSpyObj('changeDetectorRef', ['detectChanges']),
        hostView: jasmine.createSpyObj<ViewRef>('hostView', ['detectChanges']),
        injector,
        instance: runInInjectionContext(injector, () => new FakeComponent()),
      },
    );

    componentRef.setInput.and.callFake(function (this: ComponentRef<any>, name, value) {
      this.instance[name] = value;
    });

    spyOn(ComponentFactory.prototype, 'create').and.returnValue(componentRef);

    spyOnProperty(ComponentFactory.prototype, 'inputs', 'get').and.returnValue([
      {propName: 'fooFoo', templateName: 'fooFoo', isSignal: true},
      {propName: 'barBar', templateName: 'my-bar-bar', isSignal: true},
      {propName: 'falsyUndefined', templateName: 'falsyUndefined', isSignal: true},
      {propName: 'falsyNull', templateName: 'falsyNull', isSignal: true},
      {propName: 'falsyEmpty', templateName: 'falsyEmpty', isSignal: true},
      {propName: 'falsyFalse', templateName: 'falsyFalse', isSignal: true},
      {propName: 'falsyZero', templateName: 'falsyZero', isSignal: true},
    ]);

    spyOnProperty(ComponentFactory.prototype, 'outputs', 'get').and.returnValue([
      {propName: 'output1', templateName: 'templateOutput1'},
      {propName: 'output2', templateName: 'templateOutput2'},
    ]);

    applicationRef = jasmine.createSpyObj<ApplicationRef>('applicationRef', ['attachView']);
    environmentInjector = jasmine.createSpyObj<EnvironmentInjector>('environmentInjector', ['get']);

    ngZone = jasmine.createSpyObj<NgZone>('ngZone', ['run']);
    ngZone.run.and.callFake((fn) => fn());

    injectables = new Map<unknown, unknown>([
      [ApplicationRef, applicationRef],
      [NgZone, ngZone],
      [EnvironmentInjector, environmentInjector],
      [ChangeDetectorRef, jasmine.createSpyObj('viewChangeDetectorRef', ['markForCheck'])],
    ]);

    strategy = new ComponentNgElementStrategy(FakeComponent, injector);
    ngZone.run.calls.reset();
  });

  it('should create a new strategy from the factory', () => {
    const strategyFactory = new ComponentNgElementStrategyFactory(FakeComponent, injector);
    expect(strategyFactory.create(injector)).toBeTruthy();
  });

  describe('before connected', () => {
    it('should allow subscribing to output events', () => {
      const events: NgElementStrategyEvent[] = [];
      strategy.events.subscribe((e) => events.push(e));

      // No events before connecting (since `componentRef` is not even on the strategy yet).
      componentRef.instance.output1.next('output-1a');
      componentRef.instance.output1.next('output-1b');
      componentRef.instance.output2.next('output-2a');
      expect(events).toEqual([]);

      // No events upon connecting (since events are not cached/played back).
      strategy.connect(document.createElement('div'));
      expect(events).toEqual([]);

      // Events emitted once connected.
      componentRef.instance.output1.next('output-1c');
      componentRef.instance.output1.next('output-1d');
      componentRef.instance.output2.next('output-2b');
      expect(events).toEqual([
        {name: 'templateOutput1', value: 'output-1c'},
        {name: 'templateOutput1', value: 'output-1d'},
        {name: 'templateOutput2', value: 'output-2b'},
      ]);
    });
  });

  describe('after connected', () => {
    let host: HTMLElement;
    beforeEach(() => {
      // Set up an initial value to make sure it is passed to the component
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.setInputValue('falsyUndefined', undefined);
      strategy.setInputValue('falsyNull', null);
      strategy.setInputValue('falsyEmpty', '');
      strategy.setInputValue('falsyFalse', false);
      strategy.setInputValue('falsyZero', 0);

      host = document.createElement('div');
      strategy.connect(host);
    });

    it('should attach the component to the view', () => {
      expect(applicationRef.attachView).toHaveBeenCalledWith(componentRef.hostView);
    });

    it('should call the factory with the right arguments', () => {
      expect(ComponentFactory.prototype.create).toHaveBeenCalledOnceWith(
        jasmine.any(R3Injector),
        [],
        host,
        environmentInjector,
      );
    });

    it('should listen to output events', () => {
      const events: NgElementStrategyEvent[] = [];
      strategy.events.subscribe((e) => events.push(e));

      componentRef.instance.output1.next('output-1a');
      componentRef.instance.output1.next('output-1b');
      componentRef.instance.output2.next('output-2a');
      expect(events).toEqual([
        {name: 'templateOutput1', value: 'output-1a'},
        {name: 'templateOutput1', value: 'output-1b'},
        {name: 'templateOutput2', value: 'output-2a'},
      ]);
    });

    it('should initialize the component with initial values', () => {
      expect(strategy.getInputValue('fooFoo')).toBe('fooFoo-1');
      expect(componentRef.instance.fooFoo).toBe('fooFoo-1');
    });

    it('should initialize the component with falsy initial values', () => {
      expect(strategy.getInputValue('falsyUndefined')).toEqual(undefined);
      expect(componentRef.instance.falsyUndefined).toEqual(undefined);
      expect(strategy.getInputValue('falsyNull')).toEqual(null);
      expect(componentRef.instance.falsyNull).toEqual(null);
      expect(strategy.getInputValue('falsyEmpty')).toEqual('');
      expect(componentRef.instance.falsyEmpty).toEqual('');
      expect(strategy.getInputValue('falsyFalse')).toEqual(false);
      expect(componentRef.instance.falsyFalse).toEqual(false);
      expect(strategy.getInputValue('falsyZero')).toEqual(0);
      expect(componentRef.instance.falsyZero).toEqual(0);
    });
  });

  describe('when inputs change and not connected', () => {
    it('should cache the value', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(strategy.getInputValue('fooFoo')).toBe('fooFoo-1');

      // Sanity check: componentRef isn't changed since its not even on the strategy
      expect(componentRef.instance.fooFoo).toBe(undefined);
    });

    it('should not detect changes', fakeAsync(() => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      tick(16); // scheduler waits 16ms if RAF is unavailable
      expect(componentRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();
    }));
  });

  describe('when inputs change and is connected', () => {
    beforeEach(() => {
      strategy.connect(document.createElement('div'));
    });

    it('should be set on the component instance', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(componentRef.instance.fooFoo).toBe('fooFoo-1');
      expect(strategy.getInputValue('fooFoo')).toBe('fooFoo-1');
    });

    it('should call setInput on changes changes', fakeAsync(() => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(componentRef.setInput).toHaveBeenCalledOnceWith('fooFoo', 'fooFoo-1');
    }));

    it('should call setInput once per change', fakeAsync(() => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.setInputValue('barBar', 'barBar-1');
      expect(componentRef.setInput).toHaveBeenCalledTimes(2);
    }));
  });

  describe('disconnect', () => {
    it('should be able to call if not connected', fakeAsync(() => {
      strategy.disconnect();

      // Sanity check: the strategy doesn't have an instance of the componentRef anyways
      expect(componentRef.destroy).not.toHaveBeenCalled();
    }));

    it('should destroy the component after the destroy delay', fakeAsync(() => {
      strategy.connect(document.createElement('div'));
      strategy.disconnect();
      expect(componentRef.destroy).not.toHaveBeenCalled();

      tick(10);
      expect(componentRef.destroy).toHaveBeenCalledTimes(1);
    }));

    it('should be able to call it multiple times but only destroy once', fakeAsync(() => {
      strategy.connect(document.createElement('div'));
      strategy.disconnect();
      strategy.disconnect();
      expect(componentRef.destroy).not.toHaveBeenCalled();

      tick(10);
      expect(componentRef.destroy).toHaveBeenCalledTimes(1);

      strategy.disconnect();
      expect(componentRef.destroy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('runInZone', () => {
    const param = 'foofoo';
    const fn = () => param;

    it("should run the callback directly when invoked in element's zone", () => {
      expect(strategy['runInZone'](fn)).toEqual('foofoo');
      expect(ngZone.run).not.toHaveBeenCalled();
    });

    it("should run the callback inside the element's zone when invoked in a different zone", () => {
      expect(Zone.root.run(() => strategy['runInZone'](fn))).toEqual('foofoo');
      expect(ngZone.run).toHaveBeenCalledWith(fn);
    });

    it('should run the callback directly when called without zone.js loaded', () => {
      // simulate no zone.js loaded
      (strategy as any)['elementZone'] = null;

      expect(Zone.root.run(() => strategy['runInZone'](fn))).toEqual('foofoo');
      expect(ngZone.run).not.toHaveBeenCalled();
    });
  });
});

@Component({})
export class FakeComponent implements OnInit, OnDestroy {
  output1 = new Subject();
  output2 = new Subject();

  static instance?: FakeComponent;

  ngOnInit() {
    FakeComponent.instance = this;
  }

  ngOnDestroy() {
    delete FakeComponent.instance;
  }
}
