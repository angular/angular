import { NgModuleFactoryLoader, Type } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ElementsLoader, REGISTER_AS_CUSTOM_ELEMENTS_API } from './elements-loader';
import { ELEMENT_MODULE_PATHS_TOKEN, WithCustomElements } from './element-registry';

const FAKE_MODULE_PATHS = new Map([
  ['element-a-selector', 'element-a-module-path']
]);

describe('ElementsLoader', () => {
  let elementsLoader: ElementsLoader;

  let fakeModuleFactoryLoader;
  let fakeModuleFactory;
  let fakeModuleRef;
  let fakeModule;

  let fakeRegisterAsCustomElements;

  beforeEach(() => {
    fakeModuleFactory = jasmine.createSpyObj('module', ['create']);
    fakeModuleFactoryLoader = new FakeModuleLoader();

    fakeModuleRef = jasmine.createSpyObj('moduleRef', ['instance']);
    fakeModule = new FakeModule();
    fakeModuleRef.instance = fakeModule;

    fakeRegisterAsCustomElements = jasmine.createSpy('registerAsCustomElements');

    // Setup stubs for the fakes - should end up with a module containing a component to register.
    fakeModuleFactoryLoader.load.and.returnValue(Promise.resolve(fakeModuleFactory));
    fakeModuleFactory.create.and.returnValue(fakeModuleRef);
    fakeModule.customElements = [FakeElementAComponent];

    const injector = TestBed.configureTestingModule({
      providers: [
        ElementsLoader,
        { provide: NgModuleFactoryLoader, useValue: fakeModuleFactoryLoader },
        { provide: ELEMENT_MODULE_PATHS_TOKEN, useValue: FAKE_MODULE_PATHS },
        { provide: REGISTER_AS_CUSTOM_ELEMENTS_API, useValue: fakeRegisterAsCustomElements},
      ]
    });

    elementsLoader = injector.get(ElementsLoader);
  });

  it('should be able to register an element', fakeAsync(() => {
    // Verify that the elements loader considered `element-a-selector` to be unregistered.
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeTruthy();

    const hostEl = document.createElement('div');
    hostEl.innerHTML = `<element-a-selector></element-a-selector>`;

    elementsLoader.loadContainingCustomElements(hostEl);
    tick(); // Tick for the module factory loader's async `load` function

    // Factory loader should have been called to load module for `element a`.
    expect(fakeModuleFactoryLoader.load).toHaveBeenCalledWith('element-a-module-path');

    // Registration should have been for FakeElementAComponent, part of FakeModule
    expect(fakeRegisterAsCustomElements)
        .toHaveBeenCalledWith([FakeElementAComponent], jasmine.any(Function));

    // Successful registration means that element a is no longer considered `unregistered`
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
    expect(fakeRegisterAsCustomElements).toHaveBeenCalledTimes(1);
  }));

  it('should throw an error if the registration fails', fakeAsync(() => {
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeTruthy();

    const hostEl = document.createElement('div');
    hostEl.innerHTML = `<element-a-selector></element-a-selector>`;

    // Force registration to fail.
    fakeRegisterAsCustomElements.and.throwError();

    // If registration fails, should catch and throw an error
    expect(() => {
      elementsLoader.loadContainingCustomElements(hostEl);
      tick();
    }).toThrowError();

    // Should not have removed the selector from the list of unregistered elements.
    expect(elementsLoader.unregisteredElements.has('element-a-selector')).toBeTruthy();
  }));
});

class FakeElementAComponent { }

class FakeModule implements WithCustomElements {
  customElements: Type<any>[];
}

class FakeModuleLoader {
  load = jasmine.createSpy('load');
}
