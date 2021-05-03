import {
  Compiler,
  ComponentFactory,
  ComponentFactoryResolver, ComponentRef, Injector, NgModuleFactory,
  NgModuleRef,
  Type,
} from '@angular/core';
import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';

import { ElementsLoader } from './elements-loader';
import { ELEMENT_MODULE_LOAD_CALLBACKS_TOKEN, WithCustomElementComponent } from './element-registry';


interface Deferred {
  resolve(): void;
  reject(err: any): void;
}

describe('ElementsLoader', () => {
  let elementsLoader: ElementsLoader;
  let compiler: Compiler;

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        ElementsLoader,
        {
          provide: ELEMENT_MODULE_LOAD_CALLBACKS_TOKEN, useValue: new Map<
            string, () => Promise<NgModuleFactory<WithCustomElementComponent> | Type<WithCustomElementComponent>>
          >([
          ['element-a-selector', () => Promise.resolve(new FakeModuleFactory('element-a-module'))],
          ['element-b-selector', () => Promise.resolve(new FakeModuleFactory('element-b-module'))],
          ['element-c-selector', () => Promise.resolve(FakeCustomElementModule)]
        ])},
      ]
    });

    elementsLoader = injector.inject(ElementsLoader);
    compiler = injector.inject(Compiler);
  });

  describe('loadContainedCustomElements()', () => {
    let loadCustomElementSpy: jasmine.Spy;

    beforeEach(() => loadCustomElementSpy = spyOn(elementsLoader, 'loadCustomElement'));

    it('should attempt to load and register all contained elements', fakeAsync(() => {
      expect(loadCustomElementSpy).not.toHaveBeenCalled();

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-a-selector></element-a-selector>
        <element-b-selector></element-b-selector>
      `;

      elementsLoader.loadContainedCustomElements(hostEl);
      flushMicrotasks();

      expect(loadCustomElementSpy).toHaveBeenCalledTimes(2);
      expect(loadCustomElementSpy).toHaveBeenCalledWith('element-a-selector');
      expect(loadCustomElementSpy).toHaveBeenCalledWith('element-b-selector');
    }));

    it('should attempt to load and register only contained elements', fakeAsync(() => {
      expect(loadCustomElementSpy).not.toHaveBeenCalled();

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-b-selector></element-b-selector>
      `;

      elementsLoader.loadContainedCustomElements(hostEl);
      flushMicrotasks();

      expect(loadCustomElementSpy).toHaveBeenCalledTimes(1);
      expect(loadCustomElementSpy).toHaveBeenCalledWith('element-b-selector');
    }));

    it('should wait for all contained elements to load and register', fakeAsync(() => {
      const deferreds = returnPromisesFromSpy(loadCustomElementSpy);

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-a-selector></element-a-selector>
        <element-b-selector></element-b-selector>
      `;

      const log: any[] = [];
      elementsLoader.loadContainedCustomElements(hostEl).subscribe(
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
      const deferreds = returnPromisesFromSpy(loadCustomElementSpy);

      const hostEl = document.createElement('div');
      hostEl.innerHTML = `
        <element-a-selector></element-a-selector>
        <element-b-selector></element-b-selector>
      `;

      const log: any[] = [];
      elementsLoader.loadContainedCustomElements(hostEl).subscribe(
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
    let definedSpy: jasmine.Spy;
    let whenDefinedSpy: jasmine.Spy;
    let whenDefinedDeferreds: Deferred[];

    beforeEach(() => {
      // `loadCustomElement()` uses the `window.customElements` API. Provide mocks for these tests.
      definedSpy = spyOn(window.customElements, 'define');
      whenDefinedSpy = spyOn(window.customElements, 'whenDefined');
      whenDefinedDeferreds = returnPromisesFromSpy(whenDefinedSpy);
    });

    it('should be able to load and register an element', fakeAsync(() => {
      elementsLoader.loadCustomElement('element-a-selector');
      flushMicrotasks();

      expect(definedSpy).toHaveBeenCalledTimes(1);
      expect(definedSpy).toHaveBeenCalledWith('element-a-selector', jasmine.any(Function));

      // Verify the right component was loaded/registered.
      const Ctor = definedSpy.calls.argsFor(0)[1];
      expect(Ctor.observedAttributes).toEqual(['element-a-module']);
    }));

    it('should wait until the element is defined', fakeAsync(() => {
      let state = 'pending';
      elementsLoader.loadCustomElement('element-b-selector').then(() => state = 'resolved');
      flushMicrotasks();

      expect(state).toBe('pending');
      expect(whenDefinedSpy).toHaveBeenCalledTimes(1);
      expect(whenDefinedSpy).toHaveBeenCalledWith('element-b-selector');

      whenDefinedDeferreds[0].resolve();
      flushMicrotasks();
      expect(state).toBe('resolved');
    }));

    it('should not load and register the same element more than once', fakeAsync(() => {
      elementsLoader.loadCustomElement('element-a-selector');
      flushMicrotasks();
      expect(definedSpy).toHaveBeenCalledTimes(1);

      definedSpy.calls.reset();

      // While loading/registering is still in progress:
      elementsLoader.loadCustomElement('element-a-selector');
      flushMicrotasks();
      expect(definedSpy).not.toHaveBeenCalled();

      definedSpy.calls.reset();
      whenDefinedDeferreds[0].resolve();

      // Once loading/registering is already completed:
      let state = 'pending';
      elementsLoader.loadCustomElement('element-a-selector').then(() => state = 'resolved');
      flushMicrotasks();
      expect(state).toBe('resolved');
      expect(definedSpy).not.toHaveBeenCalled();
    }));

    it('should fail if defining the custom element fails', fakeAsync(() => {
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
        expect(definedSpy).toHaveBeenCalledTimes(1);

        definedSpy.calls.reset();

        // While loading/registering is still in progress:
        elementsLoader.loadCustomElement('element-a-selector').catch(() => undefined);
        flushMicrotasks();
        expect(definedSpy).not.toHaveBeenCalled();

        whenDefinedDeferreds[0].reject('foo');
        flushMicrotasks();
        expect(definedSpy).not.toHaveBeenCalled();

        // Once loading/registering has already failed:
        elementsLoader.loadCustomElement('element-a-selector');
        flushMicrotasks();
        expect(definedSpy).toHaveBeenCalledTimes(1);
      })
    );

    it('should be able to load and register an element after compiling its NgModule', fakeAsync(() => {
      const compilerSpy = spyOn(compiler, 'compileModuleAsync')
        .and.returnValue(Promise.resolve(new FakeModuleFactory('element-c-module')));

      elementsLoader.loadCustomElement('element-c-selector');
      flushMicrotasks();

      expect(definedSpy).toHaveBeenCalledTimes(1);
      expect(definedSpy).toHaveBeenCalledWith('element-c-selector', jasmine.any(Function));

      expect(compilerSpy).toHaveBeenCalledTimes(1);
      expect(compilerSpy).toHaveBeenCalledWith(FakeCustomElementModule);
    }));
  });
});

// TEST CLASSES/HELPERS

class FakeCustomElementModule implements WithCustomElementComponent {
  customElementComponent: Type<any>;
}

class FakeComponentFactory extends ComponentFactory<any> {
  selector: string;
  componentType: Type<any>;
  ngContentSelectors: string[];
  inputs = [{propName: this.identifyingInput, templateName: this.identifyingInput}];
  outputs = [];

  constructor(private identifyingInput: string) { super(); }

  create(_injector: Injector,
         _projectableNodes?: any[][],
         _rootSelectorOrNode?: string | any,
         _ngModule?: NgModuleRef<any>): ComponentRef<any> {
    return jasmine.createSpy('ComponentRef') as any;
  }
}

class FakeComponentFactoryResolver extends ComponentFactoryResolver {
  constructor(private modulePath: string) { super(); }

  resolveComponentFactory(_component: Type<any>): ComponentFactory<any> {
    return new FakeComponentFactory(this.modulePath);
  }
}

class FakeModuleRef extends NgModuleRef<WithCustomElementComponent> {
  injector = jasmine.createSpyObj('injector', ['get']);
  componentFactoryResolver = new FakeComponentFactoryResolver(this.modulePath);
  instance: WithCustomElementComponent = new FakeCustomElementModule();

  constructor(private modulePath: string) {
    super();

    this.injector.get.and.returnValue(this.componentFactoryResolver);
  }

  destroy() {}
  onDestroy(_callback: () => void) {}
}

class FakeModuleFactory extends NgModuleFactory<any> {
  moduleType: Type<any>;
  moduleRefToCreate = new FakeModuleRef(this.modulePath);

  constructor(private modulePath: string) { super(); }

  create(_parentInjector: Injector | null): NgModuleRef<any> {
    return this.moduleRefToCreate;
  }
}

function returnPromisesFromSpy(spy: jasmine.Spy): Deferred[] {
  const deferreds: Deferred[] = [];
  spy.and.callFake(() => new Promise<void>((resolve, reject) => deferreds.push({resolve, reject})));
  return deferreds;
}
