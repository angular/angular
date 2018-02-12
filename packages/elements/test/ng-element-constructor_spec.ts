/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Component, EventEmitter, Inject, Input, NgModule, NgModuleRef, Output, destroyPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {NgElementImpl, NgElementWithProps} from '../src/ng-element';
import {NgElementConstructor, createNgElementConstructor} from '../src/ng-element-constructor';
import {installMockScheduler, patchEnv, restoreEnv, supportsCustomElements} from '../testing/index';

type WithFooBar = {
  fooFoo: string,
  barBar: string
};

if (supportsCustomElements()) {
  describe('NgElementConstructor', () => {
    let moduleRef: NgModuleRef<TestModule>;
    let c: NgElementConstructor<TestComponent, WithFooBar>;

    beforeAll(() => patchEnv());
    beforeAll(done => {
      installMockScheduler(true);

      destroyPlatform();
      platformBrowserDynamic()
          .bootstrapModule(TestModule)
          .then(ref => {
            moduleRef = ref;

            const factory = ref.componentFactoryResolver.resolveComponentFactory(TestComponent);

            c = createNgElementConstructor(factory, ref.injector);

            // The `@webcomponents/custom-elements/src/native-shim.js` polyfill, that we use to
            // enable ES2015 classes transpiled to ES5 constructor functions to be used as Custom
            // Elements in tests, only works if the elements have been registered with
            // `customElements.define()`.
            customElements.define(factory.selector, c);
          })
          .then(done, done.fail);
    });

    afterAll(() => destroyPlatform());
    afterAll(() => restoreEnv());

    describe('observedAttributes', () => {
      it('should be derived from the component\'s inputs', () => {
        expect(c.observedAttributes).toEqual(['foo-foo', 'barbar']);
      });
    });

    describe('constructor()', () => {
      let e: NgElementWithProps<TestComponent, WithFooBar>;

      beforeEach(() => {
        e = new c();
        e.connectedCallback();
      });

      it('should create an `NgElement`', () => {
        // When using the `Object.setPrototypeOf()` shim, we can't check for the `NgElementImpl`
        // prototype. Check for `HTMLElement` instead.
        const ParentClass = (Object as any).setPrototypeOf.$$shimmed ? HTMLElement : NgElementImpl;

        expect(e).toEqual(jasmine.any(ParentClass));
        expect(e.getHost()).toBe(e);
        expect(e.ngElement).toBe(e);
      });

      it('should pass `ApplicationRef` to the element', () => {
        const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);
        const component = e.componentRef !.instance;

        component.fooFoo = 'newFoo';
        component.barBar = 'newBar';
        expect(e.innerHTML).toBe('TestComponent|foo(foo)|bar()');

        appRef.tick();
        expect(e.innerHTML).toBe('TestComponent|foo(newFoo)|bar(newBar)');
      });

      it('should pass `NgModuleRef` injector to the element', () => {
        const component = e.componentRef !.instance;
        expect(component.testValue).toBe('TEST');
      });

      it('should pass appropriate inputs to the element', () => {
        const component = e.componentRef !.instance;

        expect(component.fooFoo).toBe('foo');
        expect(component.barBar).toBeUndefined();

        e.attributeChangedCallback('foo-foo', null, 'newFoo');
        expect(component.fooFoo).toBe('newFoo');

        e.attributeChangedCallback('barbar', null, 'newBar');
        expect(component.barBar).toBe('newBar');
      });

      it('should pass appropriate outputs to the element', () => {
        const bazListener = jasmine.createSpy('bazListener');
        const quxListener = jasmine.createSpy('quxListener');
        const component = e.componentRef !.instance;

        e.addEventListener('bazBaz', bazListener);
        e.addEventListener('quxqux', quxListener);
        component.bazBaz.emit(false);
        component.quxQux.emit({qux: true});

        expect(bazListener).toHaveBeenCalledWith(jasmine.objectContaining({
          type: 'bazBaz',
          detail: false,
        }));
        expect(quxListener).toHaveBeenCalledWith(jasmine.objectContaining({
          type: 'quxqux',
          detail: {qux: true},
        }));
      });

      it('should set up property getters/setters for the inputs', () => {
        const getInputValueSpy =
            spyOn(e as any as NgElementImpl<any>, 'getInputValue').and.callThrough();
        const setInputValueSpy =
            spyOn(e as any as NgElementImpl<any>, 'setInputValue').and.callThrough();

        (e as any).randomProp = 'ignored';
        expect(setInputValueSpy).not.toHaveBeenCalled();
        expect((e as any).randomProp).toBe('ignored');
        expect(getInputValueSpy).not.toHaveBeenCalled();

        e.fooFoo = 'newFoo';
        expect(setInputValueSpy).toHaveBeenCalledWith('fooFoo', 'newFoo');
        expect(e.fooFoo).toBe('newFoo');
        expect(getInputValueSpy).toHaveBeenCalledWith('fooFoo');

        e.barBar = 'newBar';
        expect(setInputValueSpy).toHaveBeenCalledWith('barBar', 'newBar');
        expect(e.barBar).toBe('newBar');
        expect(getInputValueSpy).toHaveBeenCalledWith('barBar');
      });
    });

    // Helpers
    @Component({
      selector: 'test-component-for-ngec',
      template: 'TestComponent|foo({{ fooFoo }})|bar({{ barBar }})',
    })
    class TestComponent {
      @Input() fooFoo: string = 'foo';
      @Input('barbar') barBar: string;

      @Output() bazBaz = new EventEmitter<boolean>();
      @Output('quxqux') quxQux = new EventEmitter<object>();

      constructor(@Inject('TEST_VALUE') public testValue: string) {}
    }

    @NgModule({
      imports: [BrowserModule],
      providers: [
        {provide: 'TEST_VALUE', useValue: 'TEST'},
      ],
      declarations: [TestComponent],
      entryComponents: [TestComponent],
    })
    class TestModule {
      ngDoBootstrap() {}
    }
  });
}
