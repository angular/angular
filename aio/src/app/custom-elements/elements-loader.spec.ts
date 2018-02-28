import {
  ComponentFactory,
  ComponentFactoryResolver, ComponentRef, Injector, NgModuleFactory, NgModuleFactoryLoader,
  NgModuleRef,
  Type
} from '@angular/core';
import {TestBed, fakeAsync, tick} from '@angular/core/testing';

import { ElementsLoader } from './elements-loader';
import { ELEMENT_MODULE_PATHS_TOKEN, WithCustomElementComponent } from './element-registry';

const actualCustomElements = window.customElements;

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
         ngModule?: NgModuleRef<any>): ComponentRef<string> {
    return jasmine.createSpyObj('ComponentRef', ['methods']);
  };
}

const FAKE_COMPONENT_FACTORIES = new Map([
  ['element-a-module-path', new FakeComponentFactory('element-a-input')]
]);

describe('ElementsLoader', () => {
  let elementsLoader: ElementsLoader;
  let injectedModuleRef: NgModuleRef<any>;
  let fakeCustomElements;

  // ElementsLoader uses the window's customElements API. Provide a fake for this test.
  beforeEach(() => {
    fakeCustomElements = jasmine.createSpyObj('customElements', ['define', 'whenDefined']);
    window.customElements = fakeCustomElements;
  });
  afterEach(() => {
    window.customElements = actualCustomElements;
  });

  beforeEach(() => {
    const injector = TestBed.configureTestingModule({
      providers: [
        ElementsLoader,
        { provide: NgModuleFactoryLoader, useClass: FakeModuleFactoryLoader },
        { provide: ELEMENT_MODULE_PATHS_TOKEN, useValue: new Map([
          ['element-a-selector', 'element-a-module-path']
        ])},
      ]
    });

    injectedModuleRef = injector.get(NgModuleRef);
    elementsLoader = injector.get(ElementsLoader);
  });

  it('should be able to register an element', fakeAsync(() => {
    // Verify that the elements loader considered `element-a-selector` to be unregistered.
    expect(elementsLoader.elementsToLoad.has('element-a-selector')).toBeTruthy();

    const hostEl = document.createElement('div');
    hostEl.innerHTML = `<element-a-selector></element-a-selector>`;

    elementsLoader.loadContainingCustomElements(hostEl);
    tick();

    const defineArgs = fakeCustomElements.define.calls.argsFor(0);
    expect(defineArgs[0]).toBe('element-a-selector');

    // Verify the right component was loaded/created
    expect(defineArgs[1].observedAttributes[0]).toBe('element-a-input');

    expect(elementsLoader.elementsToLoad.has('element-a-selector')).toBeFalsy();
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
    expect(window.customElements.define).toHaveBeenCalledTimes(1);
  }));
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
  injector: Injector;
  componentFactoryResolver = new FakeComponentFactoryResolver(this.modulePath);
  instance: WithCustomElementComponent = new FakeCustomElementModule();

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
