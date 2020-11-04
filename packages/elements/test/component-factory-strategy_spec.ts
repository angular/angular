/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, Injector, NgModuleRef, NgZone, SimpleChange, SimpleChanges, Type} from '@angular/core';
import {fakeAsync, tick} from '@angular/core/testing';
import {Subject} from 'rxjs';

import {ComponentNgElementStrategy, ComponentNgElementStrategyFactory} from '../src/component-factory-strategy';
import {NgElementStrategyEvent} from '../src/element-strategy';

describe('ComponentFactoryNgElementStrategy', () => {
  let factory: FakeComponentFactory<typeof FakeComponent>;
  let strategy: ComponentNgElementStrategy;

  let injector: any;
  let componentRef: any;
  let applicationRef: any;
  let ngZone: any;

  let injectables: Map<unknown, unknown>;

  beforeEach(() => {
    factory = new FakeComponentFactory(FakeComponent);
    componentRef = factory.componentRef;

    applicationRef = jasmine.createSpyObj('applicationRef', ['attachView']);

    ngZone = jasmine.createSpyObj('ngZone', ['run']);
    ngZone.run.and.callFake((fn: () => unknown) => fn());

    injector = jasmine.createSpyObj('injector', ['get']);
    injector.get.and.callFake((token: unknown) => {
      if (!injectables.has(token)) {
        throw new Error(`Failed to get injectable from mock injector: ${token}`);
      }
      return injectables.get(token);
    });

    injectables = new Map<unknown, unknown>([
      [ApplicationRef, applicationRef],
      [NgZone, ngZone],
    ]);

    strategy = new ComponentNgElementStrategy(factory, injector);
    ngZone.run.calls.reset();
  });

  it('should create a new strategy from the factory', () => {
    const factoryResolver = jasmine.createSpyObj('factoryResolver', ['resolveComponentFactory']);
    factoryResolver.resolveComponentFactory.and.returnValue(factory);
    injectables.set(ComponentFactoryResolver, factoryResolver);

    const strategyFactory = new ComponentNgElementStrategyFactory(FakeComponent, injector);
    expect(strategyFactory.create(injector)).toBeTruthy();
  });

  describe('before connected', () => {
    it('should allow subscribing to output events', () => {
      const events: NgElementStrategyEvent[] = [];
      strategy.events.subscribe(e => events.push(e));

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
    beforeEach(() => {
      // Set up an initial value to make sure it is passed to the component
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.setInputValue('falsyUndefined', undefined);
      strategy.setInputValue('falsyNull', null);
      strategy.setInputValue('falsyEmpty', '');
      strategy.setInputValue('falsyFalse', false);
      strategy.setInputValue('falsyZero', 0);
      strategy.connect(document.createElement('div'));
    });

    it('should attach the component to the view', () => {
      expect(applicationRef.attachView).toHaveBeenCalledWith(componentRef.hostView);
    });

    it('should detect changes', () => {
      expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

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

    it('should call ngOnChanges with the change', () => {
      expectSimpleChanges(componentRef.instance.simpleChanges[0], {
        fooFoo: new SimpleChange(undefined, 'fooFoo-1', true),
        falsyUndefined: new SimpleChange(undefined, undefined, true),
        falsyNull: new SimpleChange(undefined, null, true),
        falsyEmpty: new SimpleChange(undefined, '', true),
        falsyFalse: new SimpleChange(undefined, false, true),
        falsyZero: new SimpleChange(undefined, 0, true),
      });
    });

    it('should call ngOnChanges with proper firstChange value', fakeAsync(() => {
         strategy.setInputValue('fooFoo', 'fooFoo-2');
         strategy.setInputValue('barBar', 'barBar-1');
         strategy.setInputValue('falsyUndefined', 'notanymore');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         (strategy as any).detectChanges();
         expectSimpleChanges(componentRef.instance.simpleChanges[1], {
           fooFoo: new SimpleChange('fooFoo-1', 'fooFoo-2', false),
           barBar: new SimpleChange(undefined, 'barBar-1', true),
           falsyUndefined: new SimpleChange(undefined, 'notanymore', false),
         });
       }));
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
    let viewChangeDetectorRef: ChangeDetectorRef;

    beforeEach(() => {
      strategy.connect(document.createElement('div'));
      viewChangeDetectorRef = componentRef.injector.get(ChangeDetectorRef);
    });

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

    it('should not detect changes if the input is set to the same value', fakeAsync(() => {
         (componentRef.changeDetectorRef.detectChanges as jasmine.Spy).calls.reset();

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledTimes(1);

         (componentRef.changeDetectorRef.detectChanges as jasmine.Spy).calls.reset();

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(componentRef.changeDetectorRef.detectChanges).not.toHaveBeenCalled();
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

    it('should not call ngOnChanges if the inout is set to the same value', fakeAsync(() => {
         const ngOnChangesSpy = spyOn(componentRef.instance, 'ngOnChanges');

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);

         ngOnChangesSpy.calls.reset();

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(ngOnChangesSpy).not.toHaveBeenCalled();
       }));

    it('should not try to call ngOnChanges if not present on the component', fakeAsync(() => {
         const factory2 = new FakeComponentFactory(FakeComponentWithoutNgOnChanges);
         const strategy2 = new ComponentNgElementStrategy(factory2, injector);
         const changeDetectorRef2 = factory2.componentRef.changeDetectorRef;

         strategy2.connect(document.createElement('div'));
         changeDetectorRef2.detectChanges.calls.reset();

         strategy2.setInputValue('fooFoo', 'fooFoo-1');
         expect(() => tick(16)).not.toThrow();  // scheduler waits 16ms if RAF is unavailable

         // If the strategy would have tried to call `component.ngOnChanges()`, an error would have
         // been thrown and `changeDetectorRef2.detectChanges()` would not have been called.
         expect(changeDetectorRef2.detectChanges).toHaveBeenCalledTimes(1);
       }));

    it('should mark the view for check', fakeAsync(() => {
         expect(viewChangeDetectorRef.markForCheck).not.toHaveBeenCalled();

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable

         expect(viewChangeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);
       }));

    it('should mark the view for check once for multiple input changes', fakeAsync(() => {
         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable

         expect(viewChangeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);
       }));

    it('should mark the view for check twice for changes in different rounds with previous values',
       fakeAsync(() => {
         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable

         expect(viewChangeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);

         strategy.setInputValue('fooFoo', 'fooFoo-2');
         strategy.setInputValue('barBar', 'barBar-2');
         tick(16);  // scheduler waits 16ms if RAF is unavailable

         expect(viewChangeDetectorRef.markForCheck).toHaveBeenCalledTimes(2);
       }));

    it('should mark the view for check even if ngOnChanges is not present on the component',
       fakeAsync(() => {
         const factory2 = new FakeComponentFactory(FakeComponentWithoutNgOnChanges);
         const strategy2 = new ComponentNgElementStrategy(factory2, injector);
         const viewChangeDetectorRef2 = factory2.componentRef.injector.get(ChangeDetectorRef);

         strategy2.connect(document.createElement('div'));
         (viewChangeDetectorRef2.markForCheck as jasmine.Spy).calls.reset();

         strategy2.setInputValue('fooFoo', 'fooFoo-1');
         expect(() => tick(16)).not.toThrow();  // scheduler waits 16ms if RAF is unavailable

         // If the strategy would have tried to call `component.ngOnChanges()`, an error would have
         // been thrown and `viewChangeDetectorRef2.markForCheck()` would not have been called.
         expect(viewChangeDetectorRef2.markForCheck).toHaveBeenCalledTimes(1);
       }));

    it('should not mark the view for check if the input is set to the same value', fakeAsync(() => {
         (viewChangeDetectorRef.markForCheck as jasmine.Spy).calls.reset();

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(viewChangeDetectorRef.markForCheck).toHaveBeenCalledTimes(1);

         (viewChangeDetectorRef.markForCheck as jasmine.Spy).calls.reset();

         strategy.setInputValue('fooFoo', 'fooFoo-1');
         strategy.setInputValue('barBar', 'barBar-1');
         tick(16);  // scheduler waits 16ms if RAF is unavailable
         expect(viewChangeDetectorRef.markForCheck).not.toHaveBeenCalled();
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

    it('should run the callback directly when invoked in element\'s zone', () => {
      expect(strategy['runInZone'](fn)).toEqual('foofoo');
      expect(ngZone.run).not.toHaveBeenCalled();
    });

    it('should run the callback inside the element\'s zone when invoked in a different zone',
       () => {
         expect(Zone.root.run(() => (strategy['runInZone'](fn)))).toEqual('foofoo');
         expect(ngZone.run).toHaveBeenCalledWith(fn);
       });

    it('should run the callback directly when called without zone.js loaded', () => {
      // simulate no zone.js loaded
      (strategy as any)['elementZone'] = null;

      expect(Zone.root.run(() => (strategy['runInZone'](fn)))).toEqual('foofoo');
      expect(ngZone.run).not.toHaveBeenCalled();
    });
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

  ngOnChanges(simpleChanges: SimpleChanges) {
    this.simpleChanges.push(simpleChanges);
  }
}

export class FakeComponentFactory<T extends Type<any>> extends ComponentFactory<T> {
  componentRef: any = jasmine.createSpyObj(
      'componentRef',
      // Method spies.
      ['destroy'],
      // Property spies.
      {
        changeDetectorRef: jasmine.createSpyObj('changeDetectorRef', ['detectChanges']),
        hostView: {},
        injector: jasmine.createSpyObj('injector', {
          get: jasmine.createSpyObj('viewChangeDetectorRef', ['markForCheck']),
        }),
        instance: new this.ComponentClass(),
      });

  get selector(): string {
    return 'fake-component';
  }
  get componentType(): Type<any> {
    return this.ComponentClass;
  }
  get ngContentSelectors(): string[] {
    return ['content-1', 'content-2'];
  }
  get inputs(): {propName: string; templateName: string}[] {
    return [
      {propName: 'fooFoo', templateName: 'fooFoo'},
      {propName: 'barBar', templateName: 'my-bar-bar'},
      {propName: 'falsyUndefined', templateName: 'falsyUndefined'},
      {propName: 'falsyNull', templateName: 'falsyNull'},
      {propName: 'falsyEmpty', templateName: 'falsyEmpty'},
      {propName: 'falsyFalse', templateName: 'falsyFalse'},
      {propName: 'falsyZero', templateName: 'falsyZero'},
    ];
  }
  get outputs(): {propName: string; templateName: string}[] {
    return [
      {propName: 'output1', templateName: 'templateOutput1'},
      {propName: 'output2', templateName: 'templateOutput2'},
    ];
  }

  constructor(private ComponentClass: T) {
    super();
  }

  create(
      injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any,
      ngModule?: NgModuleRef<any>): ComponentRef<any> {
    return this.componentRef;
  }
}

function expectSimpleChanges(actual: SimpleChanges, expected: SimpleChanges) {
  Object.keys(actual).forEach(key => {
    expect(expected[key]).toBeTruthy(`Change included additional key ${key}`);
  });

  Object.keys(expected).forEach(key => {
    expect(actual[key]).toBeTruthy(`Change should have included key ${key}`);
    if (actual[key]) {
      expect(actual[key].previousValue).toBe(expected[key].previousValue, `${key}.previousValue`);
      expect(actual[key].currentValue).toBe(expected[key].currentValue, `${key}.currentValue`);
      expect(actual[key].firstChange).toBe(expected[key].firstChange, `${key}.firstChange`);
    }
  });
}
