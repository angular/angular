/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Injector, Input, NgModule, Output, destroyPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {Subject} from 'rxjs/Subject';

import {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from '../src/element-strategy';
import {NgElementConstructor, createNgElementConstructor} from '../src/ng-element-constructor';
import {patchEnv, restoreEnv} from '../testing/index';

type WithFooBar = {
  fooFoo: string,
  barBar: string
};

if (typeof customElements !== 'undefined') {
  describe('createNgElementConstructor', () => {
    let NgElementCtor: NgElementConstructor<WithFooBar>;
    let strategy: TestStrategy;
    let strategyFactory: TestStrategyFactory;
    let injector: Injector;

    beforeAll(() => patchEnv());
    beforeAll(done => {
      destroyPlatform();
      platformBrowserDynamic()
          .bootstrapModule(TestModule)
          .then(ref => {
            injector = ref.injector;
            strategyFactory = new TestStrategyFactory();
            strategy = strategyFactory.testStrategy;

            NgElementCtor = createNgElementConstructor(TestComponent, {injector, strategyFactory});

            // The `@webcomponents/custom-elements/src/native-shim.js` polyfill allows us to create
            // new instances of the NgElement which extends HTMLElement, as long as we define it.
            customElements.define('test-element', NgElementCtor);
          })
          .then(done, done.fail);
    });

    afterAll(() => destroyPlatform());
    afterAll(() => restoreEnv());

    it('should use a default strategy for converting component inputs', () => {
      expect(NgElementCtor.observedAttributes).toEqual(['foo-foo', 'barbar']);
    });

    it('should send input values from attributes when connected', () => {
      const element = new NgElementCtor();
      element.setAttribute('foo-foo', 'value-foo-foo');
      element.setAttribute('barbar', 'value-barbar');
      element.connectedCallback();
      expect(strategy.connectedElement).toBe(element);

      expect(strategy.getPropertyValue('fooFoo')).toBe('value-foo-foo');
      expect(strategy.getPropertyValue('barBar')).toBe('value-barbar');
    });

    it('should listen to output events after connected', () => {
      const element = new NgElementCtor();
      element.connectedCallback();

      let eventValue: any = null;
      element.addEventListener('some-event', (e: CustomEvent) => eventValue = e.detail);
      strategy.events.next({name: 'some-event', value: 'event-value'});

      expect(eventValue).toEqual('event-value');
    });

    it('should not listen to output events after disconnected', () => {
      const element = new NgElementCtor();
      element.connectedCallback();
      element.disconnectedCallback();
      expect(strategy.disconnectCalled).toBe(true);

      let eventValue: any = null;
      element.addEventListener('some-event', (e: CustomEvent) => eventValue = e.detail);
      strategy.events.next({name: 'some-event', value: 'event-value'});

      expect(eventValue).toEqual(null);
    });

    it('should properly set getters/setters on the element', () => {
      const element = new NgElementCtor();
      element.fooFoo = 'foo-foo-value';
      element.barBar = 'barBar-value';

      expect(strategy.inputs.get('fooFoo')).toBe('foo-foo-value');
      expect(strategy.inputs.get('barBar')).toBe('barBar-value');
    });

    describe('with different attribute strategy', () => {
      let NgElementCtorWithChangedAttr: NgElementConstructor<WithFooBar>;
      let element: HTMLElement;

      beforeAll(() => {
        strategyFactory = new TestStrategyFactory();
        strategy = strategyFactory.testStrategy;
        NgElementCtorWithChangedAttr = createNgElementConstructor(TestComponent, {
          injector,
          strategyFactory,
          propertyInputs: ['prop1', 'prop2'],
          attributeToPropertyInputs:
              new Map<string, string>([['attr-1', 'prop1'], ['attr-2', 'prop2']])
        });

        customElements.define('test-element-with-changed-attributes', NgElementCtorWithChangedAttr);
      });

      beforeEach(() => { element = new NgElementCtorWithChangedAttr(); });

      it('should affect which attributes are watched', () => {
        expect(NgElementCtorWithChangedAttr.observedAttributes).toEqual(['attr-1', 'attr-2']);
      });

      it('should send attribute values as inputs when connected', () => {
        const element = new NgElementCtorWithChangedAttr();
        element.setAttribute('attr-1', 'value-1');
        element.setAttribute('attr-2', 'value-2');
        element.setAttribute('attr-3', 'value-3');  // Made-up attribute
        element.connectedCallback();

        expect(strategy.getPropertyValue('prop1')).toBe('value-1');
        expect(strategy.getPropertyValue('prop2')).toBe('value-2');
        expect(strategy.getPropertyValue('prop3')).not.toBe('value-3');
      });
    });
  });
}

// Helpers
@Component({
  selector: 'test-component',
  template: 'TestComponent|foo({{ fooFoo }})|bar({{ barBar }})',
})
class TestComponent {
  @Input() fooFoo: string = 'foo';
  @Input('barbar') barBar: string;

  @Output() bazBaz = new EventEmitter<boolean>();
  @Output('quxqux') quxQux = new EventEmitter<Object>();
}

@NgModule({
  imports: [BrowserModule],
  declarations: [TestComponent],
  entryComponents: [TestComponent],
})
class TestModule {
  ngDoBootstrap() {}
}

export class TestStrategy implements NgElementStrategy {
  connectedElement: HTMLElement|null = null;
  disconnectCalled = false;
  inputs = new Map<string, any>();

  events = new Subject<NgElementStrategyEvent>();

  connect(element: HTMLElement): void { this.connectedElement = element; }

  disconnect(): void { this.disconnectCalled = true; }

  getPropertyValue(propName: string): any { return this.inputs.get(propName); }

  setPropertyValue(propName: string, value: string): void { this.inputs.set(propName, value); }
}

export class TestStrategyFactory implements NgElementStrategyFactory {
  testStrategy = new TestStrategy();

  create(): NgElementStrategy { return this.testStrategy; }
}
