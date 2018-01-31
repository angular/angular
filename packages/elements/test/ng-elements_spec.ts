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
import {NgElement} from '../src/ng-element';
import {NgElements} from '../src/ng-elements';
import {AsyncMockScheduler, installMockScheduler, patchEnv, restoreEnv, supportsCustomElements} from '../testing/index';

if (supportsCustomElements()) {
  describe('NgElements', () => {
    const DESTROY_DELAY = 10;
    let uid = 0;
    let mockScheduler: AsyncMockScheduler;
    let moduleRef: NgModuleRef<TestModule>;
    let e: NgElements<TestModule>;

    beforeAll(() => patchEnv());
    beforeAll(done => {
      mockScheduler = installMockScheduler();

      destroyPlatform();
      platformBrowserDynamic()
          .bootstrapModule(TestModule)
          .then(ref => moduleRef = ref)
          .then(done, done.fail);
    });

    afterAll(() => destroyPlatform());
    afterAll(() => restoreEnv());

    beforeEach(() => {
      mockScheduler.reset();

      e = new NgElements(moduleRef, [TestComponentX, TestComponentY]);

      // The `@webcomponents/custom-elements/src/native-shim.js` polyfill, that we use to enable
      // ES2015 classes transpiled to ES5 constructor functions to be used as Custom Elements in
      // tests, only works if the elements have been registered with `customElements.define()`.
      // (Using dummy selectors to ensure that the browser does not automatically upgrade the
      //  inserted elements.)
      e.forEach(ctor => customElements.define(`${ctor.is}-${++uid}`, ctor));
    });

    describe('constructor()', () => {
      it('should set the `moduleRef` property',
         () => { expect(e.moduleRef.instance).toEqual(jasmine.any(TestModule)); });

      it('should create an `NgElementConstructor` for each component', () => {
        const XConstructor = e.get('test-component-for-nges-x') !;
        expect(XConstructor).toEqual(jasmine.any(Function));
        expect(XConstructor.is).toBe('test-component-for-nges-x');
        expect(XConstructor.observedAttributes).toEqual(['x-foo']);

        const YConstructor = e.get('test-component-for-nges-y') !;
        expect(YConstructor).toEqual(jasmine.any(Function));
        expect(YConstructor.is).toBe('test-component-for-nges-y');
        expect(YConstructor.observedAttributes).toEqual(['ybar']);
      });

      it('should throw if there are components with the same selector', () => {
        const duplicateComponents = [TestComponentX, TestComponentX];
        const errorMessage =
            'Defining an Angular custom element with selector \'test-component-for-nges-x\' is not ' +
            'allowed, because one is already defined.';

        expect(() => new NgElements(e.moduleRef, duplicateComponents)).toThrowError(errorMessage);
      });
    });

    describe('detachAll()', () => {
      let root: Element;
      let detachSpies: Map<string, jasmine.Spy>;

      beforeEach(() => {
        root = document.createElement('div');
        root.innerHTML = `
          <div>
            <test-component-for-nges-x id="x1"></test-component-for-nges-x>,
            <ul>
              <li>
                <span></span>
              </li>
              <li>
                <test-component-for-nges-x id="x2"></test-component-for-nges-x>
              </li>
              <li>
                <span>
                  <test-component-for-nges-y id="y1">
                    <test-component-for-nges-x id="x3">PROJECTED_CONTENT</test-component-for-nges-x>
                  </test-component-for-nges-y>
                </span>
              </li>
            </ul>
            <span>
              <test-component-for-nges-x id="x4" x-foo="newFoo"></test-component-for-nges-x>
              <test-component-for-nges-y id="y2" ybar="newBar"></test-component-for-nges-y>
            </span>
          </div>
        `;

        e.upgradeAll(root);

        detachSpies = new Map();
        Array.prototype.forEach.call(
            root.querySelectorAll('test-component-for-nges-x,test-component-for-nges-y'),
            (node: NgElement<any>) => detachSpies.set(node.id, spyOn(node.ngElement !, 'detach')));

        expect(detachSpies.size).toBe(6);
      });

      it('should detach all upgraded elements in the specified sub-tree', () => {
        e.detachAll(root);
        detachSpies.forEach(spy => expect(spy).toHaveBeenCalledWith());
      });

      it('should detach the root node itself (if appropriate)', () => {
        const yNode = root.querySelector('#y1') !;
        const xNode = root.querySelector('#x3') !;

        e.detachAll(yNode);

        detachSpies.forEach((spy, id) => {
          const expectedCallCount = (id === 'y1' || id === 'x3') ? 1 : 0;
          expect(spy.calls.count()).toBe(expectedCallCount);
        });
      });

      // For more info on "shadow-including tree order" see:
      // https://dom.spec.whatwg.org/#concept-shadow-including-tree-order
      it('should detach nodes in reverse "shadow-including tree order"', () => {
        const ids: string[] = [];

        detachSpies.forEach((spy, id) => spy.and.callFake(() => ids.push(id)));
        e.detachAll(root);

        expect(ids).toEqual(['y2', 'x4', 'x3', 'y1', 'x2', 'x1']);
      });

      it('should ignore already detached elements', () => {
        const xNode = root.querySelector('#x1') !;
        const ngElement = (xNode as NgElement<any>).ngElement !;

        // Detach node.
        ngElement.disconnectedCallback();
        mockScheduler.tick(DESTROY_DELAY);

        // Detach the whole sub-tree (including the already detached node).
        e.detachAll(root);

        detachSpies.forEach((spy, id) => {
          const expectedCallCount = (id === 'x1') ? 0 : 1;
          expect(spy.calls.count()).toBe(expectedCallCount, id);
        });
      });

      it('should detach the whole document if no root node is specified', () => {
        e.detachAll();
        detachSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());

        document.body.appendChild(root);

        e.detachAll();
        detachSpies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
      });

      it('should not run change detection after detaching each component', () => {
        const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);
        const tickSpy = spyOn(appRef, 'tick');

        e.detachAll(root);

        expect(tickSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('detectChanges()', () => {
      let xElement: NgElement<TestComponentX>;
      let yElement: NgElement<TestComponentY>;
      let xDetectChangesSpy: jasmine.Spy;
      let yDetectChangesSpy: jasmine.Spy;

      beforeEach(() => {
        const XConstructor = e.get<TestComponentX, {}>('test-component-for-nges-x') !;
        const YConstructor = e.get<TestComponentY, {}>('test-component-for-nges-y') !;

        xElement = new XConstructor();
        yElement = new YConstructor();

        xDetectChangesSpy = spyOn(xElement, 'detectChanges');
        yDetectChangesSpy = spyOn(yElement, 'detectChanges');
      });

      it('should not affect unconnected elements', () => {
        e.detectChanges();

        expect(xDetectChangesSpy).not.toHaveBeenCalled();
        expect(yDetectChangesSpy).not.toHaveBeenCalled();
      });

      it('should call `detectChanges()` on all connected elements', () => {
        xElement.connectedCallback();
        xDetectChangesSpy.calls.reset();
        e.detectChanges();

        expect(xDetectChangesSpy).toHaveBeenCalledTimes(1);
        expect(yDetectChangesSpy).not.toHaveBeenCalled();

        yElement.connectedCallback();
        yDetectChangesSpy.calls.reset();
        e.detectChanges();

        expect(xDetectChangesSpy).toHaveBeenCalledTimes(2);
        expect(yDetectChangesSpy).toHaveBeenCalledTimes(1);
      });

      it('should not affect disconnected elements', () => {
        xElement.connectedCallback();
        yElement.connectedCallback();
        xDetectChangesSpy.calls.reset();
        yDetectChangesSpy.calls.reset();
        e.detectChanges();

        expect(xDetectChangesSpy).toHaveBeenCalledTimes(1);
        expect(yDetectChangesSpy).toHaveBeenCalledTimes(1);

        xElement.disconnectedCallback();
        mockScheduler.tick(DESTROY_DELAY);
        e.detectChanges();

        expect(xDetectChangesSpy).toHaveBeenCalledTimes(1);
        expect(yDetectChangesSpy).toHaveBeenCalledTimes(2);

        yElement.disconnectedCallback();
        mockScheduler.tick(DESTROY_DELAY);
        e.detectChanges();

        expect(xDetectChangesSpy).toHaveBeenCalledTimes(1);
        expect(yDetectChangesSpy).toHaveBeenCalledTimes(2);
      });

      it('should allow scheduling more change detection', () => {
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

      it('should not run global change detection after checking each component', () => {
        const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);
        const tickSpy = spyOn(appRef, 'tick');

        xElement.connectedCallback();
        yElement.connectedCallback();
        tickSpy.calls.reset();

        e.detectChanges();

        expect(tickSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('forEach()', () => {
      it('should allow looping through all `NgElementConstructor`s', () => {
        const selectors = ['test-component-for-nges-x', 'test-component-for-nges-y'];
        const callbackSpy = jasmine.createSpy('callback');
        e.forEach(callbackSpy);

        expect(callbackSpy).toHaveBeenCalledTimes(selectors.length);
        selectors.forEach(
            selector => expect(callbackSpy)
                            .toHaveBeenCalledWith(e.get(selector), selector, jasmine.any(Map)));
      });
    });

    describe('get()', () => {
      it('should return the `ngElementConstructor` for the specified selector (if any)', () => {
        expect(e.get('test-component-for-nges-x')).toEqual(jasmine.any(Function));
        expect(e.get('test-component-for-nges-y')).toEqual(jasmine.any(Function));
        expect(e.get('test-component-for-nges-z')).toBeUndefined();
      });
    });

    describe('register()', () => {
      let defineSpy: jasmine.Spy;

      beforeEach(() => defineSpy = spyOn(window.customElements, 'define'));

      it('should add each `NgElementConstructor` to the `CustomElementRegistry`', () => {
        e.register();

        expect(defineSpy).toHaveBeenCalledTimes(2);
        e.forEach((ctor, selector) => expect(defineSpy).toHaveBeenCalledWith(selector, ctor));
      });

      it('should support specifying a different `CustomElementRegistry`', () => {
        const mockDefineSpy = jasmine.createSpy('mockDefine');

        e.register({ define: mockDefineSpy } as any);

        expect(defineSpy).not.toHaveBeenCalled();
        expect(mockDefineSpy).toHaveBeenCalledTimes(2);
        e.forEach((ctor, selector) => expect(mockDefineSpy).toHaveBeenCalledWith(selector, ctor));
      });

      it('should throw if there is no `CustomElementRegistry`', () => {
        const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'customElements') !;
        const errorMessage = 'Custom Elements are not supported in this environment.';

        try {
          delete window.customElements;

          expect(() => e.register()).toThrowError(errorMessage);
          expect(() => e.register(null as any)).toThrowError(errorMessage);
        } finally {
          Object.defineProperty(window, 'customElements', originalDescriptor);
        }
      });
    });

    describe('markDirty()', () => {
      let detectChangesSpy: jasmine.Spy;

      beforeEach(() => detectChangesSpy = spyOn(e, 'detectChanges'));

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

    describe('upgradeAll()', () => {
      const multiTrim = (input: string | null) => input && input.replace(/\s+/g, '');
      let root: Element;

      beforeEach(() => {
        root = document.createElement('div');
        root.innerHTML = `
          <div>
            DIV(
              <test-component-for-nges-x id="x1"></test-component-for-nges-x>,
              <ul>
                UL(
                  <li>
                    LI(<span>SPAN</span>)
                  </li>,
                  <li>
                    LI(<test-component-for-nges-x id="x2"></test-component-for-nges-x>)
                  </li>,
                  <li>
                    LI(
                      <span>
                        SPAN(
                          <test-component-for-nges-y id="y1">
                            <test-component-for-nges-x id="x3">PROJECTED_CONTENT</test-component-for-nges-x>
                          </test-component-for-nges-y>
                        )
                      </span>
                    )
                  </li>
                )
              </ul>,
              <span>
                SPAN(
                  <test-component-for-nges-x id="x4" x-foo="newFoo"></test-component-for-nges-x>,
                  <test-component-for-nges-y id="y2" ybar="newBar"></test-component-for-nges-y>
                )
              </span>
            )
          </div>
        `;
      });

      it('should upgrade all matching elements in the specified sub-tree', () => {
        e.upgradeAll(root);
        expect(multiTrim(root.textContent)).toBe(multiTrim(`
          DIV(
            TestComponentX(xFoo)(),
            UL(
              LI(SPAN),
              LI(TestComponentX(xFoo)()),
              LI(SPAN(TestComponentY()(TestComponentX(xFoo)(PROJECTED_CONTENT))))
            ),
            SPAN(
              TestComponentX(newFoo)(),
              TestComponentY(newBar)()
            )
          )
        `));
      });

      it('should upgrade the root node itself (if appropriate)', () => {
        const yNode = root.querySelector('#y1') !;
        e.upgradeAll(yNode);
        expect(multiTrim(yNode.textContent))
            .toBe('TestComponentY()(TestComponentX(xFoo)(PROJECTED_CONTENT))');
      });

      // For more info on "shadow-including tree order" see:
      // https://dom.spec.whatwg.org/#concept-shadow-including-tree-order
      it('should upgrade nodes in "shadow-including tree order"', () => {
        const ids: string[] = [];

        e.forEach(
            def => spyOn(def, 'upgrade').and.callFake((node: HTMLElement) => ids.push(node.id)));
        e.upgradeAll(root);

        expect(ids).toEqual(['x1', 'x2', 'y1', 'x3', 'x4', 'y2']);
      });

      it('should ignore already upgraded elements (same component)', () => {
        const xNode = root.querySelector('#x1') as HTMLElement;
        const XConstructor = e.get<TestComponentX, {}>('test-component-for-nges-x') !;

        // Upgrade node to matching `NgElement`.
        expect(XConstructor.is).toBe(xNode.nodeName.toLowerCase());
        const oldNgElement = XConstructor.upgrade(xNode);
        const oldComponent = oldNgElement.componentRef !.instance;

        // Upgrade the whole sub-tree (including the already upgraded node).
        e.upgradeAll(root);

        const newNgElement = (xNode as NgElement<any>).ngElement !;
        const newComponent = newNgElement.componentRef !.instance;
        expect(newNgElement).toBe(oldNgElement);
        expect(newComponent).toBe(oldComponent);
        expect(newComponent).toEqual(jasmine.any(TestComponentX));
      });

      it('should ignore already upgraded elements (different component)', () => {
        const xNode = root.querySelector('#x1') as HTMLElement;
        const YConstructor = e.get<TestComponentY, {}>('test-component-for-nges-y') !;

        // Upgrade node to matching `NgElement`.
        expect(YConstructor.is).not.toBe(xNode.nodeName.toLowerCase());
        const oldNgElement = YConstructor.upgrade(xNode);
        const oldComponent = oldNgElement.componentRef !.instance;

        // Upgrade the whole sub-tree (including the already upgraded node).
        e.upgradeAll(root);

        const newNgElement = (xNode as NgElement<any>).ngElement !;
        const newComponent = newNgElement.componentRef !.instance;
        expect(newNgElement).toBe(oldNgElement);
        expect(newComponent).toBe(oldComponent);
        expect(newComponent).toEqual(jasmine.any(TestComponentY));
      });

      it('should upgrade the whole document if no root node is specified', () => {
        const expectedUpgradedTextContent = multiTrim(`
          DIV(
            TestComponentX(xFoo)(),
            UL(
              LI(SPAN),
              LI(TestComponentX(xFoo)()),
              LI(SPAN(TestComponentY()(TestComponentX(xFoo)(PROJECTED_CONTENT))))
            ),
            SPAN(
              TestComponentX(newFoo)(),
              TestComponentY(newBar)()
            )
          )
        `);

        e.upgradeAll();
        expect(multiTrim(root.textContent)).not.toBe(expectedUpgradedTextContent);

        document.body.appendChild(root);

        e.upgradeAll();
        expect(multiTrim(root.textContent)).toBe(expectedUpgradedTextContent);
      });

      it('should not run global change detection after upgrading each component', () => {
        const appRef = moduleRef.injector.get<ApplicationRef>(ApplicationRef);
        const tickSpy = spyOn(appRef, 'tick');

        e.upgradeAll(root);

        expect(tickSpy).toHaveBeenCalledTimes(1);
      });
    });

    // Helpers
    @Component({
      selector: 'test-component-for-nges-x',
      template: 'TestComponentX({{ xFoo }})(<ng-content></ng-content>)',
    })
    class TestComponentX {
      @Input() xFoo: string = 'xFoo';
      @Output() xBaz = new EventEmitter<boolean>();

      constructor(@Inject('TEST_VALUE') public testValue: string) {}
    }

    @Component({
      selector: 'test-component-for-nges-y',
      template: 'TestComponentY({{ yBar }})(<ng-content></ng-content>)',
    })
    class TestComponentY {
      @Input('ybar') yBar: string;
      @Output('yqux') yQux = new EventEmitter<object>();

      constructor(@Inject('TEST_VALUE') public testValue: string) {}
    }

    @NgModule({
      imports: [BrowserModule],
      providers: [
        {provide: 'TEST_VALUE', useValue: {value: 'TEST'}},
      ],
      declarations: [TestComponentX, TestComponentY],
      entryComponents: [TestComponentX, TestComponentY],
    })
    class TestModule {
      ngDoBootstrap() {}
    }
  });
}
