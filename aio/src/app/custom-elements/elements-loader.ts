import {
  ComponentFactory,
  Inject,
  Injectable,
  InjectionToken,
  NgModuleFactoryLoader,
  NgModuleRef,
} from '@angular/core';
import { ELEMENT_MODULE_PATHS_TOKEN, WithCustomElement } from './element-registry';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';

/** Injection token to provide Angular's custom element class constructor function. */
export const CREATE_NG_ELEMENT_CONSTRUCTOR =
    new InjectionToken('aio/create-ng-element-constructor');

@Injectable()
export class ElementsLoader {
  /** Map of unregistered custom elements and their respective module paths to load. */
  unregisteredElements: Map<string, string>;

  constructor(private moduleFactoryLoader: NgModuleFactoryLoader,
              private moduleRef: NgModuleRef<any>,
              @Inject(CREATE_NG_ELEMENT_CONSTRUCTOR) private createNgElementConstructor,
              @Inject(ELEMENT_MODULE_PATHS_TOKEN) elementModulePaths) {
    this.unregisteredElements = new Map(elementModulePaths);
  }

  /**
   * Queries the provided element for any custom elements that have not yet been registered with
   * the browser. Custom elements that are registered will be removed from the list of unregistered
   * elements so that they will not be queried in subsequent calls.
   */
  loadContainingCustomElements(element: HTMLElement): Observable<any> {
    const selectors: any[] = Array.from(this.unregisteredElements.keys())
        .filter(s => element.querySelector(s));

    if (!selectors.length) { return of([]); }

    // Returns observable that completes when all discovered elements have been registered.
    return fromPromise(Promise.all(selectors.map(s => this.register(s))));
  }

  /** Registers the custom element defined on the WithCustomElement module factory. */
  register(selector: string) {
    const modulePath = this.unregisteredElements.get(selector)!;
    return this.moduleFactoryLoader.load(modulePath).then(elementModuleFactory => {
      if (!this.unregisteredElements.has(selector)) { return; }

      const injector = this.moduleRef.injector;
      const elementModuleRef = elementModuleFactory.create(injector);
      const componentFactory = this.getElementComponentFactory(elementModuleRef);

      const NgElement = this.createNgElementConstructor(componentFactory, injector);
      customElements!.define(selector, NgElement);

      this.unregisteredElements.delete(selector);
    });
  }

  /** Gets the component factory of the custom element defined on the NgModuleRef. */
  private getElementComponentFactory(
      moduleRef: NgModuleRef<WithCustomElement>): ComponentFactory<string> {
    const resolver = moduleRef.componentFactoryResolver;
    const customElement = moduleRef.instance.customElement;

    return resolver.resolveComponentFactory(customElement);
  }
}
