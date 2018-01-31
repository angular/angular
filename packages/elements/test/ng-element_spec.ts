/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ApplicationRef, Component, ComponentFactory, DoCheck, EventEmitter, Inject, Injector, Input, NgModule, NgModuleRef, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges, destroyPlatform} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NgElementImpl, NgElementInput, NgElementOutput} from '../src/ng-element';
import {NgElementApplicationContext} from '../src/ng-element-application-context';
import {scheduler} from '../src/utils';
import {AsyncMockScheduler, installMockScheduler, patchEnv, restoreEnv, supportsCustomElements} from '../testing/index';

type WithFooBar = {
  foo: string,
  bar: string
};

if (supportsCustomElements()) {
  describe('NgElement', () => {
    const DESTROY_DELAY = 10;
    const disconnectSync = (elem: NgElementImpl<any>) => {
      elem.disconnectedCallback();
      mockScheduler.tick(DESTROY_DELAY);
    };

    let mockScheduler: AsyncMockScheduler;
    let moduleRef: NgModuleRef<TestModule>;
    let nodeName: string;
    let e: NgElementImpl<TestComponent>&WithFooBar;
    let host: HTMLElement;

    beforeAll(() => patchEnv());
    afterAll(() => restoreEnv());

    [true, false].forEach(instantiateDirectly => {
      [true, false].forEach(useItselfAsHost => {
        const methodStr = instantiateDirectly ? 'directly' : 'with `document.createElement()`';
        const hostStr = useItselfAsHost ? 'itself' : 'another element';
        const description = `(instantiated ${methodStr} with ${hostStr} as host)`;

        describe(description, () => {
          beforeEach(done => {
            mockScheduler = installMockScheduler();

            destroyPlatform();
            platformBrowserDynamic()
                .bootstrapModule(TestModule)
                .then(ref => {
                  moduleRef = ref;
                  nodeName = useItselfAsHost ? 'TEST-COMPONENT-FOR-NGE' : 'TEST-HOST';
                  e = instantiateDirectly ? new TestNgElement() :
                                            document.createElement(TestNgElement.is) as any;

                  if (!useItselfAsHost) {
                    e.setHost(document.createElement('test-host'));
                  }

                  host = e.getHost();
                })
                .then(done, done.fail);
          });

          afterEach(() => destroyPlatform());

          it('should be an HTMLElement', () => { expect(e).toEqual(jasmine.any(HTMLElement)); });

          it(`should have ${useItselfAsHost ? 'itself' : 'another element'} as host`,
             () => { expect(host.nodeName).toBe(nodeName); });

          describe('attributeChangedCallback()', () => {
            let markDirtySpy: jasmine.Spy;

            beforeEach(() => markDirtySpy = spyOn(e, 'markDirty'));

            it('should update the corresponding property when unconnected', () => {
              expect(e.foo).toBeUndefined();
              expect(e.bar).toBeUndefined();

              e.attributeChangedCallback('foo', null, 'newFoo');
              e.attributeChangedCallback('b-a-r', null, 'newBar');

              expect(e.foo).toBe('newFoo');
              expect(e.bar).toBe('newBar');

              expect(markDirtySpy).not.toHaveBeenCalled();
            });

            it('should update the corresponding property (when connected)', () => {
              e.connectedCallback();

              expect(e.foo).toBe('foo');
              expect(e.bar).toBeUndefined();

              e.attributeChangedCallback('foo', null, 'newFoo');
              e.attributeChangedCallback('b-a-r', null, 'newBar');

              expect(e.foo).toBe('newFoo');
              expect(e.bar).toBe('newBar');

              expect(markDirtySpy).toHaveBeenCalledTimes(2);
            });

            it('should update the component instance (when connected)', () => {
              e.connectedCallback();
              const component = e.componentRef !.instance;

              expect(component.foo).toBe('foo');
              expect(component.bar).toBeUndefined();

              e.attributeChangedCallback('foo', null, 'newFoo');
              e.attributeChangedCallback('b-a-r', null, 'newBar');

              expect(component.foo).toBe('newFoo');
              expect(component.bar).toBe('newBar');

              expect(markDirtySpy).toHaveBeenCalledTimes(2);
            });

            it('should mark as dirty (when connected)', () => {
              e.connectedCallback();
              e.attributeChangedCallback('foo', null, 'newFoo');
              e.attributeChangedCallback('b-a-r', null, 'newBar');

              expect(markDirtySpy).toHaveBeenCalledTimes(2);
            });

            it('should not mark as dirty if the new value equals the old one', () => {
              e.connectedCallback();

              e.attributeChangedCallback('foo', null, 'newFoo');
              e.attributeChangedCallback('b-a-r', null, 'newBar');
              markDirtySpy.calls.reset();

              e.attributeChangedCallback('foo', null, 'newFoo');
              e.attributeChangedCallback('b-a-r', null, 'newBar');
              expect(markDirtySpy).not.toHaveBeenCalled();
            });

            it('should throw when disconnected', () => {
              const errorMessage =
                  'Calling \'setInputValue()\' on disconnected component \'TestComponent\' is not allowed.';

              e.connectedCallback();
              disconnectSync(e);

              const fn = () => e.attributeChangedCallback('foo', null, 'newFoo');

              expect(fn).toThrowError(errorMessage);
              expect(markDirtySpy).not.toHaveBeenCalled();
            });

            it('should throw when called with unknown attribute', () => {
              const fn = () => e.attributeChangedCallback('unknown', null, 'newUnknown');
              const errorMessage =
                  'Calling \'attributeChangedCallback()\' with unknown attribute \'unknown\' ' +
                  'on component \'TestComponent\' is not allowed.';

              expect(fn).toThrowError(errorMessage);
              expect((e as any).unknown).toBeUndefined();
              expect(markDirtySpy).not.toHaveBeenCalled();

              e.connectedCallback();

              expect(fn).toThrowError(errorMessage);
              expect((e as any).unknown).toBeUndefined();
              expect(markDirtySpy).not.toHaveBeenCalled();

              e.disconnectedCallback();

              expect(fn).toThrowError(errorMessage);
              expect((e as any).unknown).toBeUndefined();
              expect(markDirtySpy).not.toHaveBeenCalled();
            });
          });

          describe('connectedCallback()', () => {
            let detectChangesSpy: jasmine.Spy;

            beforeEach(() => detectChangesSpy = spyOn(e, 'detectChanges').and.callThrough());

            it('should create the component', () => {
              expect(e.componentRef).toBeNull();

              e.connectedCallback();

              const componentRef = e.componentRef !;
              expect(componentRef).not.toBeNull();
              expect(componentRef.instance).toEqual(jasmine.any(TestComponent));
              expect(host.textContent).toContain('TestComponent');
            });

            it('should instantiate the component inside the Angular zone', () => {
              e.connectedCallback();

              expect(NgZone.isInAngularZone()).toBe(false);
              expect(e.componentRef !.instance.createdInNgZone).toBe(true);
            });

            it('should use the provided injector as parent', () => {
              e.connectedCallback();

              expect(e.componentRef !.instance.testValue).toBe('TEST');
              expect(e.componentRef !.injector).not.toBe(moduleRef.injector);
            });

            it('should project any content', () => {
              host.innerHTML = 'rest-1' +
                  '<span class="baz">baz-1</span>' +
                  '<span class="not-baz">rest-2</span>' +
                  '<div class="baz">baz-2</div>';

              e.connectedCallback();

              expect(host.textContent)
                  .toBe('TestComponent|foo(foo)|bar()|baz(baz-1baz-2)|rest(rest-1rest-2)');
            });

            it('should initialize component inputs with already set property values', () => {
              e.foo = 'newFoo';
              e.bar = 'newBar';
              e.connectedCallback();

              expect(e.componentRef !.instance.foo).toBe('newFoo');
              expect(e.componentRef !.instance.bar).toBe('newBar');
            });

            it('should use the most recent property value', () => {
              e.foo = 'newFoo';
              e.foo = 'newerFoo';
              e.foo = 'newestFoo';
              e.connectedCallback();

              expect(e.componentRef !.instance.foo).toBe('newestFoo');
            });

            it('should initialize component inputs from attributes (if properties are not set)',
               () => {
                 host.setAttribute('foo', 'newFoo');
                 host.setAttribute('b-a-r', 'newBar');
                 host.setAttribute('bar', 'ignored');
                 host.setAttribute('bA-r', 'ignored');
                 e.connectedCallback();

                 expect(e.componentRef !.instance.foo).toBe('newFoo');
                 expect(e.componentRef !.instance.bar).toBe('newBar');
               });

            it('should prioritize properties over attributes (if both have been set)', () => {
              host.setAttribute('foo', 'newFoo');
              host.setAttribute('b-a-r', 'newBar');
              e.bar = 'newerBar';
              e.connectedCallback();

              expect(e.componentRef !.instance.foo).toBe('newFoo');
              expect(e.componentRef !.instance.bar).toBe('newerBar');
            });

            it('should not ignore undefined as an input value', () => {
              host.setAttribute('foo', 'newFoo');
              e.foo = 'newerFoo';
              e.foo = undefined as any;
              e.connectedCallback();

              expect(e.componentRef !.instance.foo).toBeUndefined();
            });

            it('should convert component output emissions to custom events', () => {
              const listeners = {
                bazOnNgElement: jasmine.createSpy('bazOnNgElement'),
                BAZOnNgElement: jasmine.createSpy('BAZOnNgElement'),
                quxOnNgElement: jasmine.createSpy('quxOnNgElement'),
                'q-u-xOnNgElement': jasmine.createSpy('q-u-xOnNgElement'),
                bazOnHost: jasmine.createSpy('bazOnHost'),
                BAZOnHost: jasmine.createSpy('BAZOnHost'),
                quxOnHost: jasmine.createSpy('quxOnHost'),
                'q-u-xOnHost': jasmine.createSpy('q-u-xOnHost'),
              };

              // Only events `baz` and `q-u-x` exist (regardless of pre-/post-connected phase).
              e.addEventListener('baz', listeners.bazOnNgElement);
              e.addEventListener('BAZ', listeners.BAZOnNgElement);
              host.addEventListener('qux', listeners.quxOnHost);
              host.addEventListener('q-u-x', listeners['q-u-xOnHost']);
              e.connectedCallback();
              host.addEventListener('baz', listeners.bazOnHost);
              host.addEventListener('BAZ', listeners.BAZOnHost);
              e.addEventListener('qux', listeners.quxOnNgElement);
              e.addEventListener('q-u-x', listeners['q-u-xOnNgElement']);

              Object.keys(listeners).forEach(
                  (k: keyof typeof listeners) => expect(listeners[k]).not.toHaveBeenCalled());

              e.componentRef !.instance.baz.emit(false);
              e.componentRef !.instance.qux.emit({qux: true});

              ['BAZOnNgElement', 'BAZOnHost', 'quxOnNgElement', 'quxOnHost'].forEach(
                  (k: keyof typeof listeners) => expect(listeners[k]).not.toHaveBeenCalled());

              expect(listeners.bazOnNgElement).toHaveBeenCalledTimes(1);
              expect(listeners.bazOnNgElement).toHaveBeenCalledWith(jasmine.objectContaining({
                type: 'baz',
                detail: false,
              }));
              expect(listeners.bazOnHost).toHaveBeenCalledTimes(1);
              expect(listeners.bazOnHost).toHaveBeenCalledWith(jasmine.objectContaining({
                type: 'baz',
                detail: false,
              }));

              expect(listeners['q-u-xOnNgElement']).toHaveBeenCalledTimes(1);
              expect(listeners['q-u-xOnNgElement']).toHaveBeenCalledWith(jasmine.objectContaining({
                type: 'q-u-x',
                detail: {qux: true},
              }));
              expect(listeners['q-u-xOnHost']).toHaveBeenCalledTimes(1);
              expect(listeners['q-u-xOnHost']).toHaveBeenCalledWith(jasmine.objectContaining({
                type: 'q-u-x',
                detail: {qux: true},
              }));
            });

            it('should run output event listeners outside the Angular zone', () => {
              const expectOutsideNgZone = () => expect(NgZone.isInAngularZone()).toBe(false);
              const listeners = {
                bazOnNgElement:
                    jasmine.createSpy('bazOnNgElement').and.callFake(expectOutsideNgZone),
                bazOnHost: jasmine.createSpy('bazOnHost').and.callFake(expectOutsideNgZone),
              };

              e.addEventListener('baz', listeners.bazOnNgElement);
              e.connectedCallback();
              host.addEventListener('baz', listeners.bazOnHost);

              const ngZone = moduleRef.injector.get<NgZone>(NgZone);
              ngZone.run(() => e.componentRef !.instance.baz.emit(true));

              expect(listeners.bazOnNgElement).toHaveBeenCalledTimes(1);
              expect(listeners.bazOnHost).toHaveBeenCalledTimes(1);
            });

            it('should trigger change detection', () => {
              expect(detectChangesSpy).not.toHaveBeenCalled();

              e.connectedCallback();
              expect(detectChangesSpy).toHaveBeenCalledWith();
            });

            it('should wire up the component for change detection', () => {
              const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);
              const expectedContent1 = 'TestComponent|foo(foo)|bar()|baz()|rest()';
              const expectedContent2 = 'TestComponent|foo(foo)|bar(newBar)|baz()|rest()';

              e.connectedCallback();
              const detectChangesSpy =
                  spyOn(e.componentRef !.changeDetectorRef, 'detectChanges').and.callThrough();

              expect(host.textContent).toBe(expectedContent1);

              e.componentRef !.instance.bar = 'newBar';
              appRef.tick();

              expect(detectChangesSpy).toHaveBeenCalledWith();
              expect(host.textContent).toBe(expectedContent2);
            });

            it('should set `ngElement` on both itself and the host (if not the same)', () => {
              expect(e.ngElement).toBeFalsy();
              expect((host as typeof e).ngElement).toBeFalsy();

              e.connectedCallback();

              expect(e.ngElement).toBe(e);
              expect((host as typeof e).ngElement).toBe(e);
            });

            it('should emit an `onConnected` event', () => {
              const onConnectedSpy = jasmine.createSpy('onConnectedSpy');

              e.onConnected.subscribe(onConnectedSpy);
              e.connectedCallback();

              expect(onConnectedSpy).toHaveBeenCalledTimes(1);
            });

            it('should throw if the host is already upgraded (ignoreUpgraded: false)', () => {
              (host as typeof e).ngElement = {
                componentRef: {componentType: class FooComponent{}}
              } as any;
              const errorMessage =
                  `Upgrading '${nodeName}' element to component 'TestComponent' is not allowed, ` +
                  'because the element is already upgraded to component \'FooComponent\'.';

              expect(() => e.connectedCallback()).toThrowError(errorMessage);
              expect(e.componentRef).toBeNull();

              expect(() => e.connectedCallback(false)).toThrowError(errorMessage);
              expect(e.componentRef).toBeNull();

              expect(detectChangesSpy).not.toHaveBeenCalled();
            });

            it('should do nothing if the host is already upgraded (ignoreUpgraded: true)', () => {
              (host as typeof e).ngElement = {} as any;

              expect(() => e.connectedCallback(true)).not.toThrow();
              expect(e.componentRef).toBeNull();

              expect(detectChangesSpy).not.toHaveBeenCalled();
            });

            it('should do nothing if already connected', () => {
              e.connectedCallback();

              const componentRef = e.componentRef;
              detectChangesSpy.calls.reset();

              e.connectedCallback();

              expect(e.componentRef).toBe(componentRef);
              expect(detectChangesSpy).not.toHaveBeenCalled();
            });

            it('should cancel a scheduled destruction (and do nothing)', () => {
              const onDisconnectedSpy = jasmine.createSpy('onDisconnected');

              e.onDisconnected.subscribe(onDisconnectedSpy);
              e.connectedCallback();
              e.disconnectedCallback();
              e.disconnectedCallback();

              const componentRef = e.componentRef;
              detectChangesSpy.calls.reset();

              mockScheduler.tick(DESTROY_DELAY - 1);
              e.connectedCallback();
              mockScheduler.tick(DESTROY_DELAY);

              expect(e.componentRef).toBe(componentRef);
              expect(detectChangesSpy).not.toHaveBeenCalled();
              expect(onDisconnectedSpy).not.toHaveBeenCalled();
            });

            it('should throw when disconnected', () => {
              const errorMessage =
                  'Calling \'connectedCallback()\' on disconnected component \'TestComponent\' is not allowed.';

              e.connectedCallback();
              disconnectSync(e);
              detectChangesSpy.calls.reset();

              expect(() => e.connectedCallback()).toThrowError(errorMessage);
              expect(e.ngElement).toBeNull();
              expect(detectChangesSpy).not.toHaveBeenCalled();
            });
          });

          describe('detach()', () => {
            it('should delegate to `disconnectedCallback()`', () => {
              const disconnectedCallbackSpy = spyOn(e, 'disconnectedCallback');

              expect(disconnectedCallbackSpy).not.toHaveBeenCalled();

              e.detach();
              expect(disconnectedCallbackSpy).toHaveBeenCalledWith();
            });
          });

          describe('detectChanges()', () => {
            it('should throw when unconnected', () => {
              const errorMessage =
                  'Calling \'detectChanges()\' on unconnected component \'TestComponent\' is not allowed.';
              expect(() => e.detectChanges()).toThrowError(errorMessage);
            });

            it('should allow scheduling more change detection', () => {
              e.connectedCallback();

              const detectChangesSpy = spyOn(e, 'detectChanges').and.callThrough();

              e.markDirty();
              e.markDirty();
              mockScheduler.flushBeforeRender();

              expect(detectChangesSpy).toHaveBeenCalledTimes(1);

              detectChangesSpy.calls.reset();
              e.markDirty();
              e.detectChanges();
              e.markDirty();
              mockScheduler.flushBeforeRender();

              expect(detectChangesSpy).toHaveBeenCalledTimes(3);
            });

            it('should call `ngOnChanges()` (if implemented and there are changes)', () => {
              e.connectedCallback();

              const compRef = e.componentRef !;
              const ngOnChangesSpy = spyOn(compRef.instance, 'ngOnChanges');

              e.foo = 'newFoo';
              e.detectChanges();

              expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);
            });

            it('should call `ngOnChanges()` inside the Angular zone', () => {
              e.connectedCallback();

              const compRef = e.componentRef !;
              const ngOnChangesSpy =
                  spyOn(compRef.instance, 'ngOnChanges')
                      .and.callFake(() => expect(NgZone.isInAngularZone()).toBe(true));

              e.foo = 'newFoo';
              e.detectChanges();

              expect(NgZone.isInAngularZone()).toBe(false);
              expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);
            });

            it('should not call `ngOnChanges()` if the component does not implement it', () => {
              const ngOnChanges = TestComponent.prototype.ngOnChanges;

              try {
                TestComponent.prototype.ngOnChanges = null as any;
                e.connectedCallback();
              } finally {
                TestComponent.prototype.ngOnChanges = ngOnChanges;
              }

              const compRef = e.componentRef !;
              const ngOnChangesSpy = spyOn(compRef.instance, 'ngOnChanges');

              e.foo = 'newFoo';
              e.detectChanges();

              expect(ngOnChangesSpy).not.toHaveBeenCalled();
            });

            it('should not call `ngOnChanges()` if there are no changes', () => {
              e.connectedCallback();

              const compRef = e.componentRef !;
              const ngOnChangesSpy = spyOn(compRef.instance, 'ngOnChanges');

              e.detectChanges();

              expect(ngOnChangesSpy).not.toHaveBeenCalled();
            });

            it('should reset the "pending changes" flag', () => {
              e.connectedCallback();

              const compRef = e.componentRef !;
              const ngOnChangesSpy = spyOn(compRef.instance, 'ngOnChanges');

              e.foo = 'newFoo';
              e.detectChanges();

              expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);

              ngOnChangesSpy.calls.reset();
              e.detectChanges();

              expect(ngOnChangesSpy).not.toHaveBeenCalled();
            });

            it('should call `detectChanges()` on the component (after `ngOnChanges()`)', () => {
              e.connectedCallback();

              const compRef = e.componentRef !;
              const ngOnChangesSpy =
                  spyOn(compRef.instance, 'ngOnChanges')
                      .and.callFake(() => expect(cdDetectChangesSpy).not.toHaveBeenCalled());
              const cdDetectChangesSpy =
                  spyOn(compRef.changeDetectorRef, 'detectChanges').and.callThrough();

              e.foo = 'newFoo';
              e.detectChanges();

              expect(ngOnChangesSpy).toHaveBeenCalledTimes(1);
              expect(cdDetectChangesSpy).toHaveBeenCalledWith();
            });

            it('should call `detectChanges()` inside the Angular zone', () => {
              e.connectedCallback();

              const compRef = e.componentRef !;
              const originalCdDetectChanges = compRef.changeDetectorRef.detectChanges;
              const cdDetectChangesSpy =
                  spyOn(compRef.changeDetectorRef, 'detectChanges').and.callFake(() => {
                    expect(NgZone.isInAngularZone()).toBe(true);
                    originalCdDetectChanges.call(compRef.changeDetectorRef);
                  });

              e.foo = 'newFoo';
              e.detectChanges();

              expect(NgZone.isInAngularZone()).toBe(false);
              expect(cdDetectChangesSpy).toHaveBeenCalledWith();
            });

            it('should do nothing when disconnected', () => {
              e.connectedCallback();
              disconnectSync(e);

              const cdDetectChangesSpy = spyOn(e.componentRef !.changeDetectorRef, 'detectChanges');

              e.detectChanges();

              expect(cdDetectChangesSpy).not.toHaveBeenCalled();
            });
          });

          describe('disconnectedCallback()', () => {
            it('should throw when unconnected', () => {
              const errorMessage =
                  'Calling \'disconnectedCallback()\' on unconnected component \'TestComponent\' ' +
                  'is not allowed.';

              expect(() => disconnectSync(e)).toThrowError(errorMessage);
            });

            it('should not be immediately disconnected', () => {
              const errorMessage =
                  'Calling \'setInputValue()\' on disconnected component \'TestComponent\' is not allowed.';

              e.connectedCallback();
              e.disconnectedCallback();

              expect(() => e.foo = 'newFoo').not.toThrow();
              expect(e.componentRef !.instance.foo).toBe('newFoo');

              mockScheduler.tick(DESTROY_DELAY);

              expect(() => e.foo = 'newerFoo').toThrowError(errorMessage);
            });

            it('should do nothing when already disconnected', () => {
              e.connectedCallback();
              disconnectSync(e);

              const destroySpy = spyOn(e.componentRef !, 'destroy');
              const onDisconnectedSpy = jasmine.createSpy('onDisconnectedSpy');
              e.onDisconnected.subscribe(onDisconnectedSpy);

              disconnectSync(e);

              expect(destroySpy).not.toHaveBeenCalled();
              expect(onDisconnectedSpy).not.toHaveBeenCalled();
            });

            it('should do nothing when already scheduled for destruction', () => {
              e.connectedCallback();
              e.disconnectedCallback();

              const destroySpy = spyOn(e.componentRef !, 'destroy');
              const onDisconnectedSpy = jasmine.createSpy('onDisconnectedSpy');
              e.onDisconnected.subscribe(onDisconnectedSpy);

              mockScheduler.reset();
              disconnectSync(e);
              disconnectSync(e);

              expect(destroySpy).not.toHaveBeenCalled();
              expect(onDisconnectedSpy).not.toHaveBeenCalled();
            });

            describe('after some delay', () => {
              it('should destroy the component', () => {
                e.connectedCallback();
                const destroySpy = spyOn(e.componentRef !, 'destroy');

                e.disconnectedCallback();
                expect(destroySpy).not.toHaveBeenCalled();

                mockScheduler.tick(DESTROY_DELAY - 1);
                expect(destroySpy).not.toHaveBeenCalled();

                mockScheduler.tick(1);
                expect(destroySpy).toHaveBeenCalledWith();
              });

              it('should destroy the component inside the Angular zone', () => {
                e.connectedCallback();
                const destroySpy =
                    spyOn(e.componentRef !, 'destroy')
                        .and.callFake(() => expect(NgZone.isInAngularZone()).toBe(true));

                disconnectSync(e);

                expect(NgZone.isInAngularZone()).toBe(false);
                expect(destroySpy).toHaveBeenCalledWith();
              });

              it('should stop converting component output emissions to custom events', () => {
                const listenerForConnected = jasmine.createSpy('listenerForConnected');
                const listenerForDisconnected = jasmine.createSpy('listenerForDisconnected');

                e.connectedCallback();

                const component = e.componentRef !.instance;
                const emit = () => {
                  component.baz.emit(false);
                  component.qux.emit({qux: true});
                };

                e.addEventListener('baz', listenerForConnected);
                e.addEventListener('q-u-x', listenerForConnected);
                host.addEventListener('baz', listenerForConnected);
                host.addEventListener('q-u-x', listenerForConnected);
                emit();

                expect(listenerForConnected).toHaveBeenCalledTimes(useItselfAsHost ? 2 : 4);

                listenerForConnected.calls.reset();
                disconnectSync(e);

                e.addEventListener('baz', listenerForDisconnected);
                e.addEventListener('q-u-x', listenerForDisconnected);
                host.addEventListener('baz', listenerForDisconnected);
                host.addEventListener('q-u-x', listenerForDisconnected);
                emit();

                expect(listenerForConnected).not.toHaveBeenCalled();
                expect(listenerForDisconnected).not.toHaveBeenCalled();
              });

              it('should unset `ngElement` on both itself and the host (if not the same)', () => {
                e.connectedCallback();
                disconnectSync(e);

                expect(e.ngElement).toBeNull();
                expect((host as typeof e).ngElement).toBeNull();
              });

              it('should empty the host', () => {
                host.innerHTML = 'not empty';

                e.connectedCallback();
                disconnectSync(e);

                expect(host.innerHTML).toBe('');
              });

              it('should emit an `onDisconnected` event', () => {
                const onDisconnectedSpy = jasmine.createSpy('onDisconnectedSpy');
                e.onDisconnected.subscribe(onDisconnectedSpy);

                e.connectedCallback();
                expect(onDisconnectedSpy).not.toHaveBeenCalled();

                e.disconnectedCallback();
                expect(onDisconnectedSpy).not.toHaveBeenCalled();

                mockScheduler.tick(DESTROY_DELAY - 1);
                expect(onDisconnectedSpy).not.toHaveBeenCalled();

                mockScheduler.tick(1);
                expect(onDisconnectedSpy).toHaveBeenCalledTimes(1);
              });
            });
          });

          describe('getHost()', () => {
            it('should return the current host (regardless of the lifecycle phase)', () => {
              expect(e.getHost()).toBe(host);

              const newHost = document.createElement('new-test-host');

              e.setHost(newHost);
              expect(e.getHost()).toBe(newHost);

              e.connectedCallback();
              expect(e.getHost()).toBe(newHost);

              e.disconnectedCallback();
              expect(e.getHost()).toBe(newHost);
            });
          });

          describe('getInputValue()', () => {
            it('should return the corresponding property when unconnected', () => {
              expect(e.getInputValue('foo')).toBeUndefined();
              expect(e.getInputValue('bar')).toBeUndefined();

              e.foo = 'newFoo';
              e.bar = 'newBar';

              expect(e.getInputValue('foo')).toBe('newFoo');
              expect(e.getInputValue('bar')).toBe('newBar');
            });

            it('should return the corresponding component property (when connected)', () => {
              e.connectedCallback();
              const component = e.componentRef !.instance;

              expect(e.getInputValue('foo')).toBe('foo');
              expect(e.getInputValue('bar')).toBeUndefined();

              e.foo = 'newFoo';
              e.bar = 'newBar';

              expect(e.getInputValue('foo')).toBe('newFoo');
              expect(e.getInputValue('bar')).toBe('newBar');

              component.foo = 'newerFoo';
              component.bar = 'newerBar';

              expect(e.getInputValue('foo')).toBe('newerFoo');
              expect(e.getInputValue('bar')).toBe('newerBar');
            });

            it('should throw when disconnected', () => {
              const errorMessage =
                  'Calling \'getInputValue()\' on disconnected component \'TestComponent\' is not allowed.';

              e.connectedCallback();
              disconnectSync(e);

              expect(() => e.getInputValue('foo')).toThrowError(errorMessage);
            });
          });

          describe('markDirty()', () => {
            let detectChangesSpy: jasmine.Spy;

            beforeEach(() => {
              e.connectedCallback();
              detectChangesSpy = spyOn(e, 'detectChanges');
            });

            it('should schedule change detection', () => {
              e.markDirty();
              expect(detectChangesSpy).not.toHaveBeenCalled();

              mockScheduler.flushBeforeRender();
              expect(detectChangesSpy).toHaveBeenCalledWith();
            });

            it('should not schedule change detection if already scheduled', () => {
              e.markDirty();
              e.markDirty();
              e.markDirty();
              mockScheduler.flushBeforeRender();

              expect(detectChangesSpy).toHaveBeenCalledTimes(1);
            });
          });

          describe('setHost()', () => {
            it('should set the host (when unconnected)', () => {
              const newHost = document.createElement('new-test-host');
              e.setHost(newHost);
              expect(e.getHost()).toBe(newHost);
            });

            it('should throw when connected', () => {
              const errorMessage =
                  'Calling \'setHost()\' on connected component \'TestComponent\' is not allowed.';

              e.connectedCallback();

              expect(() => e.setHost({} as any)).toThrowError(errorMessage);
              expect(e.getHost()).toBe(host);
            });

            it('should throw when disconnected', () => {
              const errorMessage =
                  'Calling \'setHost()\' on disconnected component \'TestComponent\' is not allowed.';

              e.connectedCallback();
              disconnectSync(e);

              expect(() => e.setHost({} as any)).toThrowError(errorMessage);
              expect(e.getHost()).toBe(host);
            });
          });

          describe('setInputValue()', () => {
            let markDirtySpy: jasmine.Spy;

            beforeEach(() => markDirtySpy = spyOn(e, 'markDirty'));

            it('should update the corresponding property when unconnected', () => {
              expect(e.foo).toBeUndefined();
              expect(e.bar).toBeUndefined();

              e.setInputValue('foo', 'newFoo');
              e.setInputValue('bar', 'newBar');

              expect(e.foo).toBe('newFoo');
              expect(e.bar).toBe('newBar');

              expect(markDirtySpy).not.toHaveBeenCalled();
            });

            it('should update the corresponding component property (when connected)', () => {
              e.connectedCallback();
              const component = e.componentRef !.instance;

              expect(component.foo).toBe('foo');
              expect(component.bar).toBeUndefined();

              e.setInputValue('foo', 'newFoo');
              e.setInputValue('bar', 'newBar');

              expect(component.foo).toBe('newFoo');
              expect(component.bar).toBe('newBar');
            });

            it('should mark as dirty (when connected)', () => {
              e.connectedCallback();

              e.setInputValue('foo', 'newFoo');
              expect(markDirtySpy).toHaveBeenCalledTimes(1);

              e.setInputValue('bar', 'newBar');
              expect(markDirtySpy).toHaveBeenCalledTimes(2);
            });

            it('should not mark as dirty if the new value equals the old one', () => {
              e.connectedCallback();

              e.setInputValue('foo', 'newFoo');
              expect(markDirtySpy).toHaveBeenCalledTimes(1);

              e.setInputValue('foo', 'newFoo');
              expect(markDirtySpy).toHaveBeenCalledTimes(1);

              e.setInputValue('foo', NaN as any);
              expect(markDirtySpy).toHaveBeenCalledTimes(2);

              e.setInputValue('foo', NaN as any);
              expect(markDirtySpy).toHaveBeenCalledTimes(2);
            });

            it('should record an input change', () => {
              e.connectedCallback();
              const component = e.componentRef !.instance;

              e.setInputValue('foo', 'newFoo');
              e.detectChanges();

              expect(component.lastChanges).toEqual({
                foo: new SimpleChange(undefined, 'newFoo', true),
              });

              e.setInputValue('foo', 'newerFoo');
              e.setInputValue('bar', 'newBar');
              e.detectChanges();

              expect(component.lastChanges).toEqual({
                foo: new SimpleChange('newFoo', 'newerFoo', false),
                bar: new SimpleChange(undefined, 'newBar', true),
              });
            });

            it('should aggregate multiple recorded changes (retaining `firstChange`)', () => {
              e.connectedCallback();
              const component = e.componentRef !.instance;

              e.setInputValue('foo', 'newFoo');
              e.setInputValue('foo', 'newerFoo');
              e.setInputValue('foo', 'newestFoo');
              e.detectChanges();

              expect(component.lastChanges).toEqual({
                foo: new SimpleChange(undefined, 'newestFoo', true),
              });

              e.setInputValue('foo', 'newesterFoo');
              e.setInputValue('foo', 'newestestFoo');
              e.detectChanges();

              expect(component.lastChanges).toEqual({
                foo: new SimpleChange('newestFoo', 'newestestFoo', false),
              });
            });

            it('should throw when disconnected', () => {
              const errorMessage =
                  'Calling \'setInputValue()\' on disconnected component \'TestComponent\' is not allowed.';

              e.connectedCallback();
              disconnectSync(e);

              expect(() => e.setInputValue('foo', 'newFoo')).toThrowError(errorMessage);
            });
          });

          describe('component lifecycle hooks', () => {
            let log: string[];

            beforeEach(() => {
              log = [];

              ['AfterContentChecked', 'AfterContentInit', 'AfterViewChecked', 'AfterViewInit',
               'DoCheck', 'OnChanges', 'OnDestroy', 'OnInit',
              ]
                  .forEach(
                      hook => spyOn(TestComponent.prototype, `ng${hook}` as keyof TestComponent)
                                  .and.callFake(
                                      () => log.push(`${hook}(${NgZone.isInAngularZone()})`)));
            });

            it('should be run on initialization (with initial input changes)', () => {
              e.bar = 'newBar';
              e.connectedCallback();

              expect(log).toEqual([
                // Initialization and local change detection, due to `detectChanges()` (from
                // `connectedCallback()`).
                'OnChanges(true)',
                'OnInit(true)',
                'DoCheck(true)',
                'AfterContentInit(true)',
                'AfterContentChecked(true)',
                'AfterViewInit(true)',
                'AfterViewChecked(true)',
                // Global change detection, due to `ngZone.run()` (from `connectedCallback()`).
                'DoCheck(true)',
                'AfterContentChecked(true)',
                'AfterViewChecked(true)',
              ]);
            });

            it('should be run on initialization (without initial input changes)', () => {
              e.connectedCallback();

              expect(log).toEqual([
                // Initialization and local change detection, due to `detectChanges()` (from
                // `connectedCallback()`).
                'OnInit(true)',
                'DoCheck(true)',
                'AfterContentInit(true)',
                'AfterContentChecked(true)',
                'AfterViewInit(true)',
                'AfterViewChecked(true)',
                // Global change detection, due to `ngZone.run()` (from `connectedCallback()`).
                'DoCheck(true)',
                'AfterContentChecked(true)',
                'AfterViewChecked(true)',
              ]);
            });

            it('should be run on explicit change detection (with input changes)', () => {
              e.connectedCallback();
              log.length = 0;

              e.bar = 'newBar';
              e.detectChanges();

              expect(log).toEqual([
                // Local change detection, due to `detectChanges()`.
                'OnChanges(true)',
                'DoCheck(true)',
                'AfterContentChecked(true)',
                'AfterViewChecked(true)',
                // Global change detection, due to `ngZone.run()` (from `detectChanges()`).
                'DoCheck(true)',
                'AfterContentChecked(true)',
                'AfterViewChecked(true)',
              ]);
            });

            it('should be run on explicit change detection (without input changes)', () => {
              e.connectedCallback();
              log.length = 0;

              e.detectChanges();

              expect(log).toEqual([
                // Local change detection, due to `detectChanges()`.
                'DoCheck(true)',
                'AfterContentChecked(true)',
                'AfterViewChecked(true)',
                // Global change detection, due to `ngZone.run()` (from `detectChanges()`).
                'DoCheck(true)',
                'AfterContentChecked(true)',
                'AfterViewChecked(true)',
              ]);
            });

            it('should be run on implicit change detection (with input changes)', () => {
              const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);

              e.connectedCallback();
              log.length = 0;

              e.bar = 'newBar';
              appRef.tick();

              expect(NgZone.isInAngularZone()).toBe(false);
              expect(log).toEqual([
                // Since inputs are updated outside of Angular
                // `appRef` doesn't know about them (so no `ngOnChanges()`).
                'DoCheck(false)',
                'AfterContentChecked(false)',
                'AfterViewChecked(false)',
              ]);
            });

            it('should be run on implicit change detection (without input changes)', () => {
              const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);

              e.connectedCallback();
              log.length = 0;

              appRef.tick();

              expect(NgZone.isInAngularZone()).toBe(false);
              expect(log).toEqual([
                'DoCheck(false)',
                'AfterContentChecked(false)',
                'AfterViewChecked(false)',
              ]);
            });

            it('should be run on destruction', () => {
              e.connectedCallback();
              log.length = 0;

              disconnectSync(e);

              expect(log).toEqual([
                'OnDestroy(true)',
              ]);
            });

            it('should not be run after destruction', () => {
              const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);

              e.connectedCallback();
              disconnectSync(e);
              log.length = 0;

              appRef.tick();

              expect(log).toEqual([]);
            });
          });
        });
      });
    });

    // Helpers
    @Component({
      selector: 'test-component-for-nge',
      template: 'TestComponent|' +
          'foo({{ foo }})|' +
          'bar({{ bar }})|' +
          'baz(<ng-content select=".baz"></ng-content>)|' +
          'rest(<ng-content></ng-content>)',
    })
    class TestComponent implements AfterContentChecked,
        AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy, OnInit {
      @Input() foo: string = 'foo';
      @Input('b-a-r') bar: string;
      createdInNgZone = NgZone.isInAngularZone();
      lastChanges: SimpleChanges;

      @Output() baz = new EventEmitter<boolean>();
      @Output('q-u-x') qux = new EventEmitter<object>();

      constructor(@Inject('TEST_VALUE') public testValue: string) {}

      ngOnChanges(changes: SimpleChanges) { this.lastChanges = changes; }

      ngAfterContentChecked() {}
      ngAfterContentInit() {}
      ngAfterViewChecked() {}
      ngAfterViewInit() {}
      ngDoCheck() {}
      ngOnDestroy() {}
      ngOnInit() {}
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

    class TestNgElement extends NgElementImpl<TestComponent> {
      static is = 'test-component-for-nge';
      static observedAttributes = ['foo', 'b-a-r'];

      get foo() { return this.getInputValue('foo'); }
      set foo(v) { this.setInputValue('foo', v); }

      get bar() { return this.getInputValue('bar'); }
      set bar(v) { this.setInputValue('bar', v); }

      constructor() {
        const appContext = new NgElementApplicationContext(moduleRef.injector);
        const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(TestComponent);

        const inputs = factory.inputs.map(({propName, templateName}) => ({
                                            propName,
                                            attrName: templateName,
                                          }));
        const outputs = factory.outputs.map(({propName, templateName}) => ({
                                              propName,
                                              eventName: templateName,
                                            }));

        super(appContext, factory, inputs, outputs);
      }
    }

    // The `@webcomponents/custom-elements/src/native-shim.js` polyfill, that we use to enable
    // ES2015 classes transpiled to ES5 constructor functions to be used as Custom Elements in
    // tests, only works if the elements have been registered with `customElements.define()`.
    customElements.define(TestNgElement.is, TestNgElement);
  });
}
