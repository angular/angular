import {
  ComponentFactory,
  ComponentFactoryResolver, ComponentRef, Injector, NgModuleFactory, NgModuleFactoryLoader,
  NgModuleRef,
  Type
} from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { ElementsLoader } from './elements-loader';
import { ELEMENT_MODULE_PATHS_TOKEN, WithCustomElementComponent } from './element-registry';

class FakeComponentFactory extends ComponentFactory<any> {
  selector: string;
  componentType: Type<any>;
  ngContentSelectors: string[];
  inputs = [{propName: this.identifyingInput, templateName: this.identifyingInput}];
  outputs = [];

  constructor(private identifyingInput: string) { super(); }

  create(injector: Injector,
         projectableNodes?: any[][],
         rootSelectorOrNode?: string | any,
         ngModule?: NgModuleRef<any>): ComponentRef<any> {
    return (jasmine.createSpy('ComponentRef') as any) as ComponentRef<any>;
  };
}

const FAKE_COMPONENT_FACTORIES = new Map([
  ['element-a-module-path', new FakeComponentFactory('element-a-input')],
  ['element-b-module-path', new FakeComponentFactory('element-b-input')],
]);

const SOME_FUNCTION = jasmine.any(Function);

describe('ElementsLoader', () => {
  let elementsLoader: ElementsLoader;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        ElementsLoader,
        { provide: NgModuleFactoryLoader, useClass: FakeModuleFactoryLoader },
        { provide: ELEMENT_MODULE_PATHS_TOKEN, useValue: new Map([
          ['element-a-selector', 'element-a-module-path'],
          ['element-b-selector', 'element-b-module-path']
        ])},
      ]
    });

    elementsLoader = injector.get(ElementsLoader);
  });

  describe('loadContainingCustomElements()', () => {
    let loadCustomElementSpy: jasmine.Spy;

    beforeEach(() => loadCustomElementSpy = spyOn(elementsLoader, 'loadCustomElement'));

    it('should load and register all contained elements', fakeAsync(() => {
      expect(loadCustomElementSpy).not.toHaveBeenCalled();

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-a-selector></element-a-selector>
        <element-b-selector></element-b-selector>
      `;

      elementsLoader.loadContainingCustomElements(hostEl);
      flushMicrotasks();

      expect(loadCustomElementSpy).toHaveBeenCalledTimes(2);
      expect(loadCustomElementSpy).toHaveBeenCalledWith('element-a-selector');
      expect(loadCustomElementSpy).toHaveBeenCalledWith('element-b-selector');
    }));

    it('should load and register only contained elements', fakeAsync(() => {
      expect(loadCustomElementSpy).not.toHaveBeenCalled();

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-b-selector></element-b-selector>
      `;

      elementsLoader.loadContainingCustomElements(hostEl);
      flushMicrotasks();

      expect(loadCustomElementSpy).toHaveBeenCalledTimes(1);
      expect(loadCustomElementSpy).toHaveBeenCalledWith('element-b-selector');
    }));

    it('should wait for all contained elements to load and register', fakeAsync(() => {
      const deferreds: {resolve: () => void, reject: (err: any) => void}[] = [];
      loadCustomElementSpy.and.returnValues(
        new Promise((resolve, reject) => deferreds.push({resolve, reject})),
        new Promise((resolve, reject) => deferreds.push({resolve, reject})),
      );

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-a-selector></element-a-selector>
        <element-b-selector></element-b-selector>
      `;

      const log: any[] = [];
      elementsLoader.loadContainingCustomElements(hostEl).subscribe(
        v => log.push(`emitted: ${v}`),
        e => log.push(`errored: ${e}`),
        () => log.push('completed'),
      );

      flushMicrotasks();
      expect(log).toEqual([]);

      deferreds[0].resolve();
      flushMicrotasks();
      expect(log).toEqual([]);

      deferreds[1].resolve();
      flushMicrotasks();
      expect(log).toEqual(['emitted: undefined', 'completed']);
    }));

    it('should fail if any of the contained elements fails to load and register', fakeAsync(() => {
      const deferreds: {resolve: () => void, reject: (err: any) => void}[] = [];
      loadCustomElementSpy.and.returnValues(
        new Promise((resolve, reject) => deferreds.push({resolve, reject})),
        new Promise((resolve, reject) => deferreds.push({resolve, reject})),
      );

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-a-selector></element-a-selector>
        <element-b-selector></element-b-selector>
      `;

      const log: any[] = [];
      elementsLoader.loadContainingCustomElements(hostEl).subscribe(
        v => log.push(`emitted: ${v}`),
        e => log.push(`errored: ${e}`),
        () => log.push('completed'),
      );

      flushMicrotasks();
      expect(log).toEqual([]);

      deferreds[0].resolve();
      flushMicrotasks();
      expect(log).toEqual([]);

      deferreds[1].reject('foo');
      flushMicrotasks();
      expect(log).toEqual(['errored: foo']);
    }));
  });

  describe('loadCustomElement()', () => {
    const customElementsDescriptor = Object.getOwnPropertyDescriptor(window, 'customElements')!;
    let mockCustomElements: jasmine.SpyObj<typeof window.customElements>;
    let whenDefinedDeferreds: {resolve: () => void, reject: (err: any) => void}[];

    // `loadCustomElement()` uses the `window.customElements` API. Provide a mock for this test.
    beforeEach(() => {
      whenDefinedDeferreds = [];

      mockCustomElements = jasmine.createSpyObj('customElements', ['define', 'whenDefined']);
      mockCustomElements.whenDefined.and.callFake(() =>
        new Promise((resolve, reject) => whenDefinedDeferreds.push({resolve, reject})));

      Object.defineProperty(window, 'customElements', {
        configurable: true,
        enumerable: true,
        value: mockCustomElements,
      });
    });
    afterEach(() => Object.defineProperty(window, 'customElements', customElementsDescriptor));

    it('should be able to load and register an element', fakeAsync(() => {
      elementsLoader.loadCustomElement('element-a-selector');
      flushMicrotasks();

      expect(mockCustomElements.define).toHaveBeenCalledTimes(1);
      expect(mockCustomElements.define).toHaveBeenCalledWith('element-a-selector', SOME_FUNCTION);

      // Verify the right component was loaded/registered.
      const Ctor = mockCustomElements.define.calls.argsFor(0)[1];
      expect(Ctor.observedAttributes).toEqual(['element-a-input']);
    }));

    it('should wait until the element is defined', fakeAsync(() => {
      let state = 'pending';
      elementsLoader.loadCustomElement('element-b-selector').then(() => state = 'resolved');
      flushMicrotasks();

      expect(state).toBe('pending');
      expect(mockCustomElements.whenDefined).toHaveBeenCalledTimes(1);
      expect(mockCustomElements.whenDefined).toHaveBeenCalledWith('element-b-selector');

      whenDefinedDeferreds[0].resolve();
      flushMicrotasks();
      expect(state).toBe('resolved');
    }));

    it('should not load and register the same element more than once', fakeAsync(() => {
      elementsLoader.loadCustomElement('element-a-selector');
      flushMicrotasks();
      expect(mockCustomElements.define).toHaveBeenCalledTimes(1);

      mockCustomElements.define.calls.reset();

      // While loading/registering is still in progress:
      elementsLoader.loadCustomElement('element-a-selector');
      flushMicrotasks();
      expect(mockCustomElements.define).not.toHaveBeenCalled();

      mockCustomElements.define.calls.reset();
      whenDefinedDeferreds[0].resolve();

      // Once loading/registering is already completed:
      let state = 'pending';
      elementsLoader.loadCustomElement('element-a-selector').then(() => state = 'resolved');
      flushMicrotasks();
      expect(state).toBe('resolved');
      expect(mockCustomElements.define).not.toHaveBeenCalled();
    }));

    it('should fail if defining the the custom element fails', fakeAsync(() => {
      let state = 'pending';
      elementsLoader.loadCustomElement('element-b-selector').catch(e => state = `rejected: ${e}`);
      flushMicrotasks();
      expect(state).toBe('pending');

      whenDefinedDeferreds[0].reject('foo');
      flushMicrotasks();
      expect(state).toBe('rejected: foo');
    }));

    it('should be able to load and register an element again if previous attempt failed',
      fakeAsync(() => {
        elementsLoader.loadCustomElement('element-a-selector');
        flushMicrotasks();
        expect(mockCustomElements.define).toHaveBeenCalledTimes(1);

        mockCustomElements.define.calls.reset();

        // While loading/registering is still in progress:
        elementsLoader.loadCustomElement('element-a-selector').catch(() => undefined);
        flushMicrotasks();
        expect(mockCustomElements.define).not.toHaveBeenCalled();

        whenDefinedDeferreds[0].reject('foo');
        flushMicrotasks();
        expect(mockCustomElements.define).not.toHaveBeenCalled();

        // Once loading/registering has already failed:
        elementsLoader.loadCustomElement('element-a-selector');
        flushMicrotasks();
        expect(mockCustomElements.define).toHaveBeenCalledTimes(1);
      })
    );
  });
});

// TEST CLASSES/HELPERS

class FakeCustomElementModule implements WithCustomElementComponent {
  customElementComponent: Type<any>;
}

class FakeComponentFactoryResolver extends ComponentFactoryResolver {
  constructor(private modulePath) { super(); }

  resolveComponentFactory(component: Type<any>): ComponentFactory<any> {
    return FAKE_COMPONENT_FACTORIES.get(this.modulePath)!;
  }
}

class FakeModuleRef extends NgModuleRef<WithCustomElementComponent> {
  injector = jasmine.createSpyObj('injector', ['get']);
  componentFactoryResolver = new FakeComponentFactoryResolver(this.modulePath);
  instance: WithCustomElementComponent = new FakeCustomElementModule();

  constructor(private modulePath) {
    super();

    this.injector.get.and.returnValue(this.componentFactoryResolver);
  }

  destroy() {}
  onDestroy(callback: () => void) {}
}

class FakeModuleFactory extends NgModuleFactory<any> {
  moduleType: Type<any>;
  moduleRefToCreate = new FakeModuleRef(this.modulePath);

  constructor(private modulePath) { super(); }

  create(parentInjector: Injector | null): NgModuleRef<any> {
    return this.moduleRefToCreate;
  }
}

class FakeModuleFactoryLoader extends NgModuleFactoryLoader {
  load(modulePath: string): Promise<NgModuleFactory<any>> {
    const fakeModuleFactory = new FakeModuleFactory(modulePath);
    return Promise.resolve(fakeModuleFactory);
  }
}
