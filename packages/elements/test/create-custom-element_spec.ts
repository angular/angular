/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, DoBootstrap, EventEmitter, Injector, Input, NgModule, Output, destroyPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {browserDetection} from '@angular/platform-browser/testing/src/browser_util';
import {Subject} from 'rxjs';

import {NgElementConstructor, createCustomElement} from '../src/create-custom-element';
import {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from '../src/element-strategy';

type WithFooBar = {
  fooFoo: string,
  barBar: string
};

if (browserDetection.supportsCustomElements) {
  describe('createCustomElement', () => {
    let NgElementCtor: NgElementConstructor<WithFooBar>;
    let strategy: TestStrategy;
    let strategyFactory: TestStrategyFactory;
    let injector: Injector;

    beforeAll(done => {
      destroyPlatform();
      platformBrowserDynamic()
          .bootstrapModule(TestModule)
          .then(ref => {
            injector = ref.injector;
            strategyFactory = new TestStrategyFactory();
            strategy = strategyFactory.testStrategy;

            NgElementCtor = createCustomElement(TestComponent, {injector, strategyFactory});

            // The `@webcomponents/custom-elements/src/native-shim.js` polyfill allows us to create
            // new instances of the NgElement which extends HTMLElement, as long as we define it.
            customElements.define('test-element', NgElementCtor);
          })
          .then(done, done.fail);
    });

    afterAll(() => destroyPlatform());

    it('should use a default strategy for converting component inputs', () => {
      expect(NgElementCtor.observedAttributes).toEqual(['foo-foo', 'barbar']);
    });

    it('should send input values from attributes when connected', () => {
      const element = new NgElementCtor(injector);
      element.setAttribute('foo-foo', 'value-foo-foo');
      element.setAttribute('barbar', 'value-barbar');
      element.connectedCallback();
      expect(strategy.connectedElement).toBe(element);

      expect(strategy.getInputValue('fooFoo')).toBe('value-foo-foo');
      expect(strategy.getInputValue('barBar')).toBe('value-barbar');
    });

    it('should listen to output events after connected', () => {
      const element = new NgElementCtor(injector);
      element.connectedCallback();

      let eventValue: any = null;
      element.addEventListener('some-event', (e: CustomEvent) => eventValue = e.detail);
      strategy.events.next({name: 'some-event', value: 'event-value'});

      expect(eventValue).toEqual('event-value');
    });

    it('should not listen to output events after disconnected', () => {
      const element = new NgElementCtor(injector);
      element.connectedCallback();
      element.disconnectedCallback();
      expect(strategy.disconnectCalled).toBe(true);

      let eventValue: any = null;
      element.addEventListener('some-event', (e: CustomEvent) => eventValue = e.detail);
      strategy.events.next({name: 'some-event', value: 'event-value'});

      expect(eventValue).toEqual(null);
    });

    it('should properly set getters/setters on the element', () => {
      const element = new NgElementCtor(injector);
      element.fooFoo = 'foo-foo-value';
      element.barBar = 'barBar-value';

      expect(strategy.inputs.get('fooFoo')).toBe('foo-foo-value');
      expect(strategy.inputs.get('barBar')).toBe('barBar-value');
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
  // TODO(issue/24571): remove '!'.
  @Input('barbar') barBar !: string;

  @Output() bazBaz = new EventEmitter<boolean>();
  @Output('quxqux') quxQux = new EventEmitter<Object>();
}
@NgModule({
  imports: [BrowserModule],
  declarations: [TestComponent],
  entryComponents: [TestComponent],
})
class TestModule implements DoBootstrap {
  ngDoBootstrap() {}
}

export class TestStrategy implements NgElementStrategy {
  connectedElement: HTMLElement|null = null;
  disconnectCalled = false;
  inputs = new Map<string, any>();

  events = new Subject<NgElementStrategyEvent>();

  connect(element: HTMLElement): void { this.connectedElement = element; }

  disconnect(): void { this.disconnectCalled = true; }

  getInputValue(propName: string): any { return this.inputs.get(propName); }

  setInputValue(propName: string, value: string): void { this.inputs.set(propName, value); }
}

export class TestStrategyFactory implements NgElementStrategyFactory {
  testStrategy = new TestStrategy();

  create(): NgElementStrategy { return this.testStrategy; }
}
