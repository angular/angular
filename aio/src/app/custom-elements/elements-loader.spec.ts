import {
  ComponentFactory,
  ComponentFactoryResolver, ComponentRef, Injector, NgModuleFactory, NgModuleFactoryLoader,
  NgModuleRef,
  Type
} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';

import { ElementsLoader, CREATE_NG_ELEMENT_CONSTRUCTOR } from './elements-loader';
import { ELEMENT_MODULE_PATHS_TOKEN, WithCustomElement } from './element-registry';

const actualCustomElements = window.customElements;

class FakeComponentFactory extends ComponentFactory<any> {
  selector: string;
  componentType: Type<any>;
  ngContentSelectors: string[];
  inputs = [];
  outputs = [];

  create(injector: Injector,
         projectableNodes?: any[][],
         rootSelectorOrNode?: string | any,
         ngModule?: NgModuleRef<any>): ComponentRef<string> {
    return jasmine.createSpyObj('ComponentRef', ['methods']);
  };
}

const FAKE_COMPONENT_FACTORIES = new Map([
  ['element-a-module-path', new FakeComponentFactory()]
]);

describe('ElementsLoader', () => {
  let elementsLoader: ElementsLoader;

  let fakeCreateNgElementConstructor;
  let injectedModuleRef: NgModuleRef<any>;

  // ElementsLoader uses the window's customElements API. Provide a fake for this test.
  beforeEach(() => {
    window.customElements = jasmine.createSpyObj('customElements', ['define']);
  });
  afterEach(() => {
    window.customElements = actualCustomElements;
  });

  beforeEach(() => {
    fakeCreateNgElementConstructor = jasmine.createSpy('createNgElementConstructor');

    const injector = TestBed.configureTestingModule({
      providers: [
        ElementsLoader,
        { provide: NgModuleFactoryLoader, useClass: FakeModuleFactoryLoader },
        { provide: ELEMENT_MODULE_PATHS_TOKEN, useValue: new Map([
          ['element-a-selector', 'element-a-module-path']
        ])},
        { provide: CREATE_NG_ELEMENT_CONSTRUCTOR, useValue: fakeCreateNgElementConstructor},
      ]
    });

    injectedModuleRef = injector.get(NgModuleRef);
    elementsLoader = injector.get(ElementsLoader);
  });

  it('should be able to register an element', fakeAsync(() => {
    // Verify that the elements loader considered `element-a-selector` to be unregistered.
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeTruthy();

    const hostEl = document.createElement('div');
    hostEl.innerHTML = `<element-a-selector></element-a-selector>`;

    const fakeCreatedClass = {};
    fakeCreateNgElementConstructor.and.returnValue(fakeCreatedClass);
    elementsLoader.loadContainingCustomElements(hostEl);
    tick();

    const expectedComponentFactory = FAKE_COMPONENT_FACTORIES.get('element-a-module-path');
    expect(fakeCreateNgElementConstructor)
        .toHaveBeenCalledWith(expectedComponentFactory, injectedModuleRef.injector);
    expect(window.customElements.define)
        .toHaveBeenCalledWith('element-a-selector', fakeCreatedClass);
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeFalsy();
  }));

  it('should only register an element one time', fakeAsync(() => {
    const hostEl = document.createElement('div');
    hostEl.innerHTML = `<element-a-selector></element-a-selector>`;

    elementsLoader.loadContainingCustomElements(hostEl);
    tick(); // Tick for the module factory loader's async `load` function

    // Call again to to check how many times registerAsCustomElements was called.
    elementsLoader.loadContainingCustomElements(hostEl);
    tick(); // Tick for the module factory loader's async `load` function

    // Should have only been called once, since the second load would not query for element-a
    expect(fakeCreateNgElementConstructor).toHaveBeenCalledTimes(1);
  }));

  it('should throw an error if the registration fails', fakeAsync(() => {
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeTruthy();

    const hostEl = document.createElement('div');
    hostEl.innerHTML = `<element-a-selector></element-a-selector>`;

    // Force registration to fail.
    fakeCreateNgElementConstructor.and.throwError();

    // If registration fails, should catch and throw an error
    expect(() => {
      elementsLoader.loadContainingCustomElements(hostEl);
      tick();
    }).toThrowError();

    // Should not have removed the selector from the list of unregistered elements.
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeTruthy();
  }));
});

// TEST CLASSES/HELPERS

class FakeCustomElementModule implements WithCustomElement {
  customElement: Type<any>;
}

class FakeComponentFactoryResolver extends ComponentFactoryResolver {
  constructor(private modulePath) { super(); }

  resolveComponentFactory(component: Type<any>): ComponentFactory<any> {
    return FAKE_COMPONENT_FACTORIES.get(this.modulePath)!;
  }
}

class FakeModuleRef extends NgModuleRef<WithCustomElement> {
  injector: Injector;
  componentFactoryResolver = new FakeComponentFactoryResolver(this.modulePath);
  instance: WithCustomElement = new FakeCustomElementModule();

  constructor(private modulePath) { super(); }

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
