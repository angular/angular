/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  Component,
  ComponentRef,
  Directive,
  EnvironmentInjector,
  Injector,
  Input,
  NgZone,
  Output,
  OutputEmitterRef,
  SimpleChange,
  SimpleChanges,
  createComponent,
  inject,
} from '@angular/core';

import {TestBed} from '@angular/core/testing';
import {Subject, filter, firstValueFrom} from 'rxjs';

import {
  ComponentNgElementStrategy,
  ComponentNgElementStrategyFactory,
} from '../src/component-factory-strategy';
import {NgElementStrategyEvent} from '../src/element-strategy';

import type {} from 'zone.js';

describe('ComponentFactoryNgElementStrategy', () => {
  let strategy: ComponentNgElementStrategy;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);
    const strategyFactory = new ComponentNgElementStrategyFactory(TestComponent, injector);
    strategy = strategyFactory.create(injector);
  });

  async function whenStable(): Promise<void> {
    const appRef = injector.get(ApplicationRef);
    await firstValueFrom(appRef.isStable.pipe(filter((stable) => stable)));
    return;
  }

  it('should create a new strategy from the factory', () => {
    const strategyFactory = new ComponentNgElementStrategyFactory(TestComponent, injector);
    expect(strategyFactory.create(injector)).toBeTruthy();
  });

  describe('before connected', () => {
    it('should allow subscribing to output events', () => {
      const events: NgElementStrategyEvent[] = [];
      strategy.events.subscribe((e) => events.push(e));

      // No events upon connecting (since events are not cached/played back).
      strategy.connect(document.createElement('div'));
      expect(events).toEqual([]);

      // Events emitted once connected.
      const componentRef = getComponentRef(strategy)!;
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
    let componentRef: ComponentRef<TestComponent>;

    beforeEach(() => {
      // Set up an initial value to make sure it is passed to the component
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.setInputValue('falsyUndefined', undefined);
      strategy.setInputValue('falsyNull', null);
      strategy.setInputValue('falsyEmpty', '');
      strategy.setInputValue('falsyFalse', false);
      strategy.setInputValue('falsyZero', 0);
      strategy.connect(document.createElement('div'));
      componentRef = getComponentRef(strategy)!;
      expect(componentRef).not.toBeNull();
    });

    it('should attach the component to the view', () => {
      expect((TestBed.inject(ApplicationRef) as any).allViews).toContain(componentRef.hostView);
    });

    it('should detect changes', () => {
      expect(componentRef.instance.cdCalls).toBe(2);
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

    it('should listen to output() emitters', () => {
      const events: NgElementStrategyEvent[] = [];
      strategy.events.subscribe((e) => events.push(e));

      componentRef.instance.output3.emit('output-a');
      componentRef.instance.output3.emit('output-b');
      expect(events).toEqual([
        {name: 'templateOutput3', value: 'output-a'},
        {name: 'templateOutput3', value: 'output-b'},
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

    // Disabled: this is not actually how `NgOnChanges` works. The test appears to encode correct
    // behavior, but the `ngOnChanges` implementation has a bug.
    xit('should call ngOnChanges with proper firstChange value', async () => {
      strategy.setInputValue('fooFoo', 'fooFoo-2');
      strategy.setInputValue('barBar', 'barBar-1');
      strategy.setInputValue('falsyUndefined', 'notanymore');
      await whenStable();
      expectSimpleChanges(componentRef.instance.simpleChanges[1], {
        fooFoo: new SimpleChange('fooFoo-1', 'fooFoo-2', false),
        barBar: new SimpleChange(undefined, 'barBar-1', true),
        falsyUndefined: new SimpleChange(undefined, 'notanymore', false),
      });
    });
  });

  describe('when inputs change and not connected', () => {
    it('should cache the value', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(strategy.getInputValue('fooFoo')).toBe('fooFoo-1');

      // Sanity check: componentRef doesn't exist.
      expect(getComponentRef(strategy)).toBeNull();
    });

    it('should not detect changes', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      // Sanity check: componentRef doesn't exist.
      expect(getComponentRef(strategy)).toBeNull();
    });
  });

  describe('when inputs change and is connected', () => {
    let componentRef: ComponentRef<TestComponent>;

    beforeEach(async () => {
      strategy.connect(document.createElement('div'));
      componentRef = getComponentRef(strategy)!;
      expect(componentRef).not.toBeNull();
      await whenStable();
      expect(componentRef.instance.cdCalls).toBe(2);

      componentRef.instance.cdCalls = 0;
    });

    it('should be set on the component instance', () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(componentRef.instance.fooFoo).toBe('fooFoo-1');
      expect(strategy.getInputValue('fooFoo')).toBe('fooFoo-1');
    });

    it('should detect changes', async () => {
      expect(componentRef.instance.cdCalls).toBe(0);
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      await whenStable();
      // Connect detected changes automatically
      expect(componentRef.instance.cdCalls).toBe(1);
    });

    it('should detect changes even when updated during CD', async () => {
      @Component({
        standalone: true,
        template: ``,
      })
      class DriverCmp {
        ngAfterViewChecked(): void {
          // This runs within the Angular zone, within change detection.
          NgZone.assertInAngularZone();

          // Because we're inside the zone, setting the input won't cause a fresh tick() to be
          // scheduled (the scheduler knows we're in the zone and in fact that a tick() is in
          // progress). However, setting the input should cause the view to be marked for _refresh_
          // as well as dirty, allowing CD to revisit this view and pick up the change.
          strategy.setInputValue('fooFoo', 'fooFoo-2');
        }
      }

      const appRef = TestBed.inject(ApplicationRef);
      const cmpRef = createComponent(DriverCmp, {environmentInjector: appRef.injector});
      appRef.attachView(cmpRef.hostView);

      // Wait for CD of the application, which needs to check `TestComponent` twice since it only
      // becomes dirty after `DriverCmp.ngAfterViewChecked`.
      await whenStable();
      expect(componentRef.instance.fooFoo).toBe('fooFoo-2');
      expect(componentRef.instance.cdCalls).toBe(2);
    });

    // Disabled: when `setInputValue()` is called from outside the zone (like in this test), CD will
    // be forced to run after each `setInputValue()` call, thanks to `setInputValue()` running
    // `NgZone.run()`.
    //
    // Previously, this test spied on `.detectChanges()` and therefore did not detect that this was
    // happening, since the CD triggered from `ApplicationRef.tick()` didn't go through
    // `.detectChanges()`.
    xit('should detect changes once for multiple input changes', async () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      expect(componentRef.instance.cdCalls).toBe(0);
      strategy.setInputValue('barBar', 'barBar-1');
      await whenStable();
      expect(componentRef.instance.cdCalls).toBe(1);
    });

    it('should call ngOnChanges', async () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      await whenStable();
      expectSimpleChanges(componentRef.instance.simpleChanges[0], {
        fooFoo: new SimpleChange(undefined, 'fooFoo-1', true),
      });
    });

    // Disabled: as in "should detect changes once for multiple input changes" above, CD runs after
    // each `setInputValue`, with `ngOnChanges` delivered for each one.
    xit('should call ngOnChanges once for multiple input changes', async () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.setInputValue('barBar', 'barBar-1');
      await whenStable();
      expectSimpleChanges(componentRef.instance.simpleChanges[0], {
        fooFoo: new SimpleChange(undefined, 'fooFoo-1', true),
        barBar: new SimpleChange(undefined, 'barBar-1', true),
      });
    });

    // Disabled: as in "should detect changes once for multiple input changes" above, CD runs after
    // each `setInputValue`, with `ngOnChanges` delivered for each one.
    xit('should call ngOnChanges twice for changes in different rounds with previous values', async () => {
      strategy.setInputValue('fooFoo', 'fooFoo-1');
      strategy.setInputValue('barBar', 'barBar-1');
      await whenStable();
      expectSimpleChanges(componentRef.instance.simpleChanges[0], {
        fooFoo: new SimpleChange(undefined, 'fooFoo-1', true),
        barBar: new SimpleChange(undefined, 'barBar-1', true),
      });

      strategy.setInputValue('fooFoo', 'fooFoo-2');
      strategy.setInputValue('barBar', 'barBar-2');
      await whenStable();
      expectSimpleChanges(componentRef.instance.simpleChanges[1], {
        fooFoo: new SimpleChange('fooFoo-1', 'fooFoo-2', false),
        barBar: new SimpleChange('barBar-1', 'barBar-2', false),
      });
    });
  });

  describe('disconnect', () => {
    it('should be able to call if not connected', () => {
      expect(() => strategy.disconnect()).not.toThrow();

      // Sanity check: componentRef doesn't exist.
      expect(getComponentRef(strategy)).toBeNull();
    });

    it('should destroy the component after the destroy delay', async () => {
      strategy.connect(document.createElement('div'));
      const componentRef = getComponentRef(strategy)!;
      let destroyed = false;
      componentRef.onDestroy(() => (destroyed = true));

      strategy.disconnect();
      expect(destroyed).toBeFalse();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(destroyed).toBeTrue();
    });
  });

  describe('runInZone', () => {
    const param = 'foofoo';

    it("should run the callback directly when invoked in element's zone", () => {
      expect(
        strategy['runInZone'](() => {
          expect(Zone.current.name).toBe('angular');
          return param;
        }),
      ).toEqual('foofoo');
    });

    it("should run the callback inside the element's zone when invoked in a different zone", () => {
      expect(
        Zone.root.run(() =>
          strategy['runInZone'](() => {
            expect(Zone.current.name).toBe('angular');
            return param;
          }),
        ),
      ).toEqual('foofoo');
    });

    xit('should run the callback directly when called without zone.js loaded', () => {
      // simulate no zone.js loaded
      (strategy as any)['elementZone'] = null;

      expect(
        Zone.root.run(() =>
          strategy['runInZone'](() => {
            return param;
          }),
        ),
      ).toEqual('foofoo');
    });
  });
});

@Directive({
  standalone: true,
  selector: '[cdTracker]',
})
export class CdTrackerDir {
  parent = inject(TestComponent);

  ngDoCheck(): void {
    this.parent.cdCalls++;
  }
}

@Component({
  selector: 'fake-component',
  standalone: true,
  imports: [CdTrackerDir],
  template: `
    <ng-container cdTracker></ng-container>
    <ng-content select="content-1"></ng-content>
    <ng-content select="content-2"></ng-content>
  `,
})
export class TestComponent {
  @Output('templateOutput1') output1 = new Subject();
  @Output('templateOutput2') output2 = new Subject();
  @Output('templateOutput3') output3 = new OutputEmitterRef();

  @Input() fooFoo: unknown;
  @Input({alias: 'my-bar-bar'}) barBar: unknown;
  @Input() falsyUndefined: unknown;
  @Input() falsyNull: unknown;
  @Input() falsyEmpty: unknown;
  @Input() falsyFalse: unknown;
  @Input() falsyZero: unknown;

  // Keep track of the simple changes passed to ngOnChanges
  simpleChanges: SimpleChanges[] = [];

  ngOnChanges(simpleChanges: SimpleChanges) {
    this.simpleChanges.push(simpleChanges);
  }

  cdCalls = 0;
}

function expectSimpleChanges(actual: SimpleChanges, expected: SimpleChanges) {
  Object.keys(actual).forEach((key) => {
    expect(expected[key]).toBeTruthy(`Change included additional key ${key}`);
  });

  Object.keys(expected).forEach((key) => {
    expect(actual[key]).toBeTruthy(`Change should have included key ${key}`);
    if (actual[key]) {
      expect(actual[key].previousValue).toBe(expected[key].previousValue, `${key}.previousValue`);
      expect(actual[key].currentValue).toBe(expected[key].currentValue, `${key}.currentValue`);
      expect(actual[key].firstChange).toBe(expected[key].firstChange, `${key}.firstChange`);
    }
  });
}

function getComponentRef(strategy: ComponentNgElementStrategy): ComponentRef<TestComponent> | null {
  return (strategy as any).componentRef;
}
