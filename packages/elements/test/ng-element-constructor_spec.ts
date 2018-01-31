/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Component, ComponentFactory, EventEmitter, Inject, Input, NgModule, NgModuleRef, NgZone, Output, destroyPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {Subscription} from 'rxjs/Subscription';

import {NgElementImpl, NgElementWithProps} from '../src/ng-element';
import {NgElementApplicationContext} from '../src/ng-element-application-context';
import {NgElementConstructorInternal, createNgElementConstructor} from '../src/ng-element-constructor';
import {installMockScheduler, patchEnv, restoreEnv, supportsCustomElements} from '../testing/index';

type WithFooBar = {
  fooFoo: string,
  barBar: string
};

if (supportsCustomElements()) {
  describe('NgElementConstructor', () => {
    let moduleRef: NgModuleRef<TestModule>;
    let c: NgElementConstructorInternal<TestComponent, WithFooBar>;

    beforeAll(() => patchEnv());
    beforeAll(done => {
      installMockScheduler(true);

      destroyPlatform();
      platformBrowserDynamic()
          .bootstrapModule(TestModule)
          .then(ref => {
            moduleRef = ref;

            const appContext = new NgElementApplicationContext(ref.injector);
            const factory = ref.componentFactoryResolver.resolveComponentFactory(TestComponent);

            c = createNgElementConstructor(appContext, factory);

            // The `@webcomponents/custom-elements/src/native-shim.js` polyfill, that we use to
            // enable ES2015 classes transpiled to ES5 constructor functions to be used as Custom
            // Elements in tests, only works if the elements have been registered with
            // `customElements.define()`.
            customElements.define(c.is, c);
          })
          .then(done, done.fail);
    });

    afterAll(() => destroyPlatform());
    afterAll(() => restoreEnv());

    describe('is', () => {
      it('should be derived from the component\'s selector',
         () => { expect(c.is).toBe('test-component-for-ngec'); });

      it('should be a valid custom element name', () => {
        const buildTestFn = (selector: string) => {
          const mockAppContext = {} as NgElementApplicationContext;
          const mockFactory = { selector } as ComponentFactory<any>;
          return () => createNgElementConstructor(mockAppContext, mockFactory);
        };
        const buildError = (selector: string) =>
            `Using '${selector}' as a custom element name is not allowed. ` +
            'See https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name for more info.';

        const validNames = [
          'foo-bar',
          'baz-',
          'q-u-x',
          'this_is-fine.too',
          'this_is-fine.3',
          'this.is-φίνε.4',
          'tΉΪς.is-Φine.5',
        ];
        const invalidNames = [
          'foo',
          'BAR',
          'baz-Qux',
          'φine-not',
          'not:fine-at:all',
          '.no-no',
          '[nay-nay]',
          'close-but,not-quite',
          ':not(my-element)',
          // Blacklisted:
          'color-profile',
          'font-face-format',
          'missing-glyph',
        ];

        validNames.forEach(name => expect(buildTestFn(name)).not.toThrowError(buildError(name)));
        invalidNames.forEach(name => expect(buildTestFn(name)).toThrowError(buildError(name)));
      });
    });

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

    describe('upgrade()', () => {
      let host: HTMLElement;
      let e: NgElementWithProps<TestComponent, WithFooBar>;

      beforeEach(() => {
        host = document.createElement('div');
        e = c.upgrade(host);
      });

      it('should create an `NgElement`', () => {
        // When using the `Object.setPrototypeOf()` shim, we can't check for the `NgElementImpl`
        // prototype. Check for `HTMLElement` instead.
        const ParentClass = (Object as any).setPrototypeOf.$$shimmed ? HTMLElement : NgElementImpl;

        expect(e).toEqual(jasmine.any(ParentClass));
      });

      it('should immediatelly instantiate the underlying component', () => {
        expect(e.ngElement).toBe(e);
        expect(e.getHost().innerHTML).toBe('TestComponent|foo(foo)|bar()');
      });

      it('should use the specified host', () => {
        expect(e.getHost()).toBe(host);
        expect((host as typeof e).ngElement).toBe(e);
      });

      it('should throw if the host is already upgraded (ignoreUpgraded: false)', () => {
        const errorMessage =
            'Upgrading \'DIV\' element to component \'TestComponent\' is not allowed, ' +
            'because the element is already upgraded to component \'TestComponent\'.';

        expect(() => c.upgrade(host)).toThrowError(errorMessage);
        expect(() => c.upgrade(host, false)).toThrowError(errorMessage);
      });

      it('should do nothing if the host is already upgraded (ignoreUpgraded: true)', () => {
        const compRef = e.componentRef !;

        expect(() => c.upgrade(host, true)).not.toThrow();
        expect((host as typeof e).ngElement).toBe(e);
        expect((host as typeof e).ngElement !.componentRef).toBe(compRef);
      });
    });

    describe('onConnected', () => {
      let onConnectedSpy: jasmine.Spy;
      let subscription: Subscription;

      beforeEach(() => {
        onConnectedSpy = jasmine.createSpy('onConnected');
        subscription = c.onConnected.subscribe(onConnectedSpy);
      });

      afterEach(() => subscription.unsubscribe());

      it('should emit every time an `NgElement` is connected', () => {
        const e1 = new c();
        expect(onConnectedSpy).not.toHaveBeenCalled();

        e1.connectedCallback();
        expect(onConnectedSpy).toHaveBeenCalledTimes(1);
        expect(onConnectedSpy).toHaveBeenCalledWith(e1);

        onConnectedSpy.calls.reset();
        const e2 = c.upgrade(document.createElement('div'));
        expect(onConnectedSpy).toHaveBeenCalledTimes(1);
        expect(onConnectedSpy).toHaveBeenCalledWith(e2);

        onConnectedSpy.calls.reset();
        (e1 as any as NgElementImpl<TestComponent>).onConnected.emit('ignored' as any);
        expect(onConnectedSpy).toHaveBeenCalledTimes(1);
        expect(onConnectedSpy).toHaveBeenCalledWith(e1);

        onConnectedSpy.calls.reset();
        (e2 as any as NgElementImpl<TestComponent>).onConnected.emit('ignored' as any);
        expect(onConnectedSpy).toHaveBeenCalledTimes(1);
        expect(onConnectedSpy).toHaveBeenCalledWith(e2);
      });
    });

    describe('onDisconnected', () => {
      let onDisconnectedSpy: jasmine.Spy;
      let subscription: Subscription;

      beforeEach(() => {
        onDisconnectedSpy = jasmine.createSpy('onDisconnected');
        subscription = c.onDisconnected.subscribe(onDisconnectedSpy);
      });

      afterEach(() => subscription.unsubscribe());

      it('should emit every time an `NgElement` is disconnected', () => {
        const e1 = new c();
        e1.connectedCallback();
        expect(onDisconnectedSpy).not.toHaveBeenCalled();

        e1.disconnectedCallback();
        expect(onDisconnectedSpy).toHaveBeenCalledTimes(1);
        expect(onDisconnectedSpy).toHaveBeenCalledWith(e1);

        onDisconnectedSpy.calls.reset();
        const e2 = c.upgrade(document.createElement('div'));
        expect(onDisconnectedSpy).not.toHaveBeenCalled();

        e2.disconnectedCallback();
        expect(onDisconnectedSpy).toHaveBeenCalledTimes(1);
        expect(onDisconnectedSpy).toHaveBeenCalledWith(e2);

        onDisconnectedSpy.calls.reset();
        (e1 as any as NgElementImpl<TestComponent>).onDisconnected.emit('ignored' as any);
        expect(onDisconnectedSpy).toHaveBeenCalledTimes(1);
        expect(onDisconnectedSpy).toHaveBeenCalledWith(e1);

        onDisconnectedSpy.calls.reset();
        (e2 as any as NgElementImpl<TestComponent>).onDisconnected.emit('ignored' as any);
        expect(onDisconnectedSpy).toHaveBeenCalledTimes(1);
        expect(onDisconnectedSpy).toHaveBeenCalledWith(e2);
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
