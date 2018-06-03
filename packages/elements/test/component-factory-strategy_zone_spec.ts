/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, Injector, NgZone} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';

import {ComponentNgElementStrategy} from '../src/component-factory-strategy';
import {ComponentNgElementZoneStrategy, ComponentNgElementZoneStrategyFactory} from '../src/component-factory-strategy-zone';
import {FakeComponent, FakeComponentFactory} from './component-factory-strategy_spec';

describe('ComponentNgElementZoneStrategyFactory', () => {
  let factory: FakeComponentFactory;
  let strategy: ComponentNgElementZoneStrategy;

  let injector: any;
  let componentRef: any;
  let applicationRef: any;
  let factoryResolver: any;
  let ngZone: any;

  beforeEach(() => {
    factory = new FakeComponentFactory();
    componentRef = factory.componentRef;

    applicationRef = jasmine.createSpyObj('applicationRef', ['attachView']);

    ngZone = jasmine.createSpyObj('ngZone', ['run']);
    ngZone.run.and.callFake((fn: any) => { return fn(); });

    injector = jasmine.createSpyObj('injector', ['get']);
    injector.get.and.callFake(function(identify: any) {
      const name = identify && identify.name;
      if (name === 'ApplicationRef') {
        return applicationRef;
      } else if (name === 'NgZone') {
        return ngZone;
      } else if (name === 'ComponentFactoryResolver') {
        return factoryResolver;
      }
    });
    strategy = new ComponentNgElementZoneStrategy(factory, injector);
  });

  it('should create a new strategy from the factory', () => {
    factoryResolver = jasmine.createSpyObj('factoryResolver', ['resolveComponentFactory']);
    factoryResolver.resolveComponentFactory.and.returnValue(factory);

    const strategyFactory = new ComponentNgElementZoneStrategyFactory(FakeComponent, injector);
    expect(strategyFactory.create(injector)).toBeTruthy();
  });

  it('should connect already in NgZone', () => {
    const parent = spyOn(ComponentNgElementStrategy.prototype, 'connect');
    const isInAngularZone =
        spyOn(NgZone, 'isInAngularZone').and.callFake(function() { return true; });
    ngZone.run.calls.reset();
    strategy.connect(document.createElement('div'));
    expect(parent).toHaveBeenCalled();
    expect(ngZone.run).not.toHaveBeenCalled();
  });

  it('should connect not already in NgZone', () => {
    const parent = spyOn(ComponentNgElementStrategy.prototype, 'connect');
    const isInAngularZone =
        spyOn(NgZone, 'isInAngularZone').and.callFake(function() { return false; });
    ngZone.run.calls.reset();
    strategy.connect(document.createElement('div'));
    expect(parent).toHaveBeenCalled();
    expect(ngZone.run).toHaveBeenCalled();
  });

  describe('after connected not in NgZone', () => {
    beforeEach(() => {
      const isInAngularZone =
          spyOn(NgZone, 'isInAngularZone').and.callFake(function() { return false; });
      strategy.connect(document.createElement('div'));
      ngZone.run.calls.reset();
    });

    it('should disconnect', () => {
      const parent = spyOn(ComponentNgElementStrategy.prototype, 'disconnect');
      strategy.disconnect();
      expect(parent).toHaveBeenCalled();
      expect(ngZone.run).toHaveBeenCalled();
    });

    it('should setInputValue', () => {
      const parent = spyOn(ComponentNgElementStrategy.prototype, 'setInputValue');
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(parent).toHaveBeenCalled();
      expect(ngZone.run).toHaveBeenCalled();
    });

    it('should getInputValue', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      ngZone.run.calls.reset();
      const value = strategy.getInputValue('fooFoo');
      expect(ngZone.run).toHaveBeenCalled();
      expect(value).toEqual('fooFoo-1');
    });
  });

});