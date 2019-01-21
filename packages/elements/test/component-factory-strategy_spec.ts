/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentRef, Injector, NgModuleRef, SimpleChange, SimpleChanges, Type} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {Subject} from 'rxjs';

import {ComponentNgElementStrategy, ComponentNgElementStrategyFactory} from '../src/component-factory-strategy';
import {NgElementStrategyEvent} from '../src/element-strategy';

describe('ComponentFactoryNgElementStrategy', () => {
  let factory: FakeComponentFactory;
  let strategy: ComponentNgElementStrategy;

  let injector: any;
  let componentRef: any;
  let applicationRef: any;

  beforeEach(() => {
    factory = new FakeComponentFactory();
    componentRef = factory.componentRef;

    applicationRef = jasmine.createSpyObj('applicationRef', ['attachView']);
    injector = jasmine.createSpyObj('injector', ['get']);
    injector.get.and.returnValue(applicationRef);

    strategy = new ComponentNgElementStrategy(factory, injector);
  });

  it('should create a new strategy from the factory', () => {
    const factoryResolver = jasmine.createSpyObj('factoryResolver', ['resolveComponentFactory']);
    factoryResolver.resolveComponentFactory.and.returnValue(factory);
    injector.get.and.returnValue(factoryResolver);

    const strategyFactory = new ComponentNgElementStrategyFactory(FakeComponent, injector);
    expect(strategyFactory.create(injector)).toBeTruthy();
  });

  describe('after connected', () => {
    beforeEach(() => {
      // Set up an initial value to make sure it is passed to the component
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.connect(document.createElement('div'));
    });

    it('should attach the component to the view',
       () => { expect(applicationRef.attachView).toHaveBeenCalledWith(componentRef.hostView); });

    it('should detect changes',
       () => { expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalled(); });

    it('should listen to output events', () => {
      const events: NgElementStrategyEvent[] = [];
      strategy.events.subscribe(e => events.push(e));

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

    it('should call ngOnChanges with the change', () => {
      expectSimpleChanges(
          componentRef.instance.simpleChanges[0],
          {fooFoo: new SimpleChange(undefined, 'fooFoo-1', false)});
    });
  });

  it('should not call ngOnChanges if not present on the component', () => {
    factory.componentRef.instance = new FakeComponentWithoutNgOnChanges();

    // Should simply succeed without problems (did not try to call ngOnChanges)
    strategy.connect(document.createElement('div'));
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
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(componentRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();
       }));
  });

  describe('when inputs change and is connected', () => {
    beforeEach(() => { strategy.connect(document.createElement('div')); });

    it('should be set on the component instance', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(componentRef.instance.fooFoo).toBe('fooFoo-1');
      expect(strategy.getInputValue('fooFoo')).toBe('fooFoo-1');
    });

    it('should detect changes', fakeAsync(() => {
         // Connect detected changes automatically
         expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(1);

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(2);
       }));

    it('should detect changes once for multiple input changes', fakeAsync(() => {
         // Connect detected changes automatically
         expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(1);

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(2);
       }));

    it('should call ngOnChanges', fakeAsync(() => {
         strategy.setInputValue('fooFoo', 'fooFoo-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expectSimpleChanges(
             componentRef.instance.simpleChanges[0],
             {fooFoo: new SimpleChange(undefined, 'fooFoo-1', true)});
       }));

    it('should call ngOnChanges once for multiple input changes', fakeAsync(() => {
         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expectSimpleChanges(componentRef.instance.simpleChanges[0], {
           fooFoo: new SimpleChange(undefined, 'fooFoo-1', true),
           barBar: new SimpleChange(undefined, 'barBar-1', true)
         });
       }));

    it('should call ngOnChanges twice for changes in different rounds with previous values',
       fakeAsync(() => {
         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expectSimpleChanges(componentRef.instance.simpleChanges[0], {
           fooFoo: new SimpleChange(undefined, 'fooFoo-1', true),
           barBar: new SimpleChange(undefined, 'barBar-1', true)
         });

         strategy.setInputValue('fooFoo', 'fooFoo-2');
         strategy.setInputValue('barBar', 'barBar-2');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expectSimpleChanges(componentRef.instance.simpleChanges[1], {
           fooFoo: new SimpleChange('fooFoo-1', 'fooFoo-2', false),
           barBar: new SimpleChange('barBar-1', 'barBar-2', false)
         });
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
});

export class FakeComponentWithoutNgOnChanges {
  output1 = new Subject();
  output2 = new Subject();
}

export class FakeComponent {
  output1 = new Subject();
  output2 = new Subject();

  // Keep track of the simple changes passed to ngOnChanges
  simpleChanges: SimpleChanges[] = [];

  ngOnChanges(simpleChanges: SimpleChanges) { this.simpleChanges.push(simpleChanges); }
}

export class FakeComponentFactory extends ComponentFactory<any> {
  componentRef: any = jasmine.createSpyObj(
      'componentRef', ['instance', 'changeDetectorRef', 'hostView', 'destroy']);

  constructor() {
    super();
    this.componentRef.instance = new FakeComponent();
    this.componentRef.changeDetectorRef =
        jasmine.createSpyObj('changeDetectorRef', ['detectChanges']);
  }

  get selector(): string { return 'fake-component'; }
  get componentType(): Type<any> { return FakeComponent; }
  get ngContentSelectors(): string[] { return ['content-1', 'content-2']; }
  get inputs(): {propName: string; templateName: string}[] {
    return [
      {propName: 'fooFoo', templateName: 'fooFoo'},
      {propName: 'barBar', templateName: 'my-bar-bar'},
    ];
  }

  get outputs(): {propName: string; templateName: string}[] {
    return [
      {propName: 'output1', templateName: 'templateOutput1'},
      {propName: 'output2', templateName: 'templateOutput2'},
    ];
  }

  create(
      injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any,
      ngModule?: NgModuleRef<any>): ComponentRef<any> {
    return this.componentRef;
  }
}

function expectSimpleChanges(actual: SimpleChanges, expected: SimpleChanges) {
  Object.keys(actual).forEach(
      key => { expect(expected[key]).toBeTruthy(`Change included additional key ${key}`); });

  Object.keys(expected).forEach(key => {
    expect(actual[key]).toBeTruthy(`Change should have included key ${key}`);
    if (actual[key]) {
      expect(actual[key].previousValue).toBe(expected[key].previousValue);
      expect(actual[key].currentValue).toBe(expected[key].currentValue);
      expect(actual[key].firstChange).toBe(expected[key].firstChange);
    }
  });
}
