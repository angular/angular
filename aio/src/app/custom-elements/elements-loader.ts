import {
  Inject,
  Injectable,
  NgModuleFactoryLoader,
  NgModuleRef,
} from '@angular/core';
import { ELEMENT_MODULE_PATHS_TOKEN } from './element-registry';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { createNgElementConstructor } from '@angular/elements';

@Injectable()
export class ElementsLoader {
  /** Map of unregistered custom elements and their respective module paths to load. */
  elementsToLoad: Map<string, string>;

  constructor(private moduleFactoryLoader: NgModuleFactoryLoader,
              private moduleRef: NgModuleRef<any>,
              @Inject(ELEMENT_MODULE_PATHS_TOKEN) elementModulePaths) {
    this.elementsToLoad = new Map(elementModulePaths);
  }

  /**
   * Queries the provided element for any custom elements that have not yet been registered with
   * the browser. Custom elements that are registered will be removed from the list of unregistered
   * elements so that they will not be queried in subsequent calls.
   */
  loadContainingCustomElements(element: HTMLElement): Observable<null> {
    const selectors: any[] = Array.from(this.elementsToLoad.keys())
        .filter(s => element.querySelector(s));

    if (!selectors.length) { return of(null); }

    // Returns observable that completes when all discovered elements have been registered.
    return fromPromise(Promise.all(selectors.map(s => this.register(s))).then(result => null));
  }

  /** Registers the custom element defined on the WithCustomElement module factory. */
  private register(selector: string) {
    const modulePath = this.elementsToLoad.get(selector)!;
    return this.moduleFactoryLoader.load(modulePath).then(elementModuleFactory => {
      if (!this.elementsToLoad.has(selector)) { return; }

      const elementModuleRef = elementModuleFactory.create(this.moduleRef.injector);
      const CustomElementComponent = elementModuleRef.instance.customElementComponent;
      const NgElement =
          createNgElementConstructor(CustomElementComponent, {injector: elementModuleRef.injector});

      customElements!.define(selector, NgElement);
      this.elementsToLoad.delete(selector);

      return customElements.whenDefined(selector);
    });
  }
}
