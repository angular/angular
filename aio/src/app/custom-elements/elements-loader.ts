import {
  Inject,
  Injectable,
  InjectionToken,
  NgModuleFactory,
  NgModuleFactoryLoader,
  NgModuleRef
} from '@angular/core';
import { ELEMENT_MODULE_PATHS_TOKEN, WithCustomElements } from './element-registry';

/** Injection token to provide Angular's custom element registration function. */
export const REGISTER_AS_CUSTOM_ELEMENTS_API =
    new InjectionToken('aio/register-as-custom-elements');

@Injectable()
export class ElementsLoader {
  /** Map of unregistered custom elements and their respective module paths to load. */
  unregisteredElements: Map<string, string>;

  constructor(private moduleFactoryLoader: NgModuleFactoryLoader,
              private moduleRef: NgModuleRef<any>,
              @Inject(REGISTER_AS_CUSTOM_ELEMENTS_API) private registerAsCustomElements,
              @Inject(ELEMENT_MODULE_PATHS_TOKEN) elementModulePaths) {
    this.unregisteredElements = new Map(elementModulePaths);
  }

  /**
   * Queries the provided element for any custom elements that have not yet been registered with
   * the browser. Custom elements that are registered will be removed from the list of unregistered
   * elements so that they will not be queried in subsequent calls.
   */
  loadContainingCustomElements(element: HTMLElement): Promise<any> {
    const loadPromises = Array.from(this.unregisteredElements.keys())
        .filter(s => element.querySelector(s))
        .map(s => {
          return this.load(s)
              .then(() => this.unregisteredElements.delete(s))
              .catch(err => { throw Error(`Failed to load element ${s} with error ${err}`); });
        });

    return Promise.all(loadPromises);
  }

  /** Loads the element's module and registers it as a custom element. */
  load(selector: string): Promise<any> {
    console.log('Loading', selector);
    const modulePath = this.unregisteredElements.get(selector);
    return this.moduleFactoryLoader.load(modulePath!)
        .then((factory: NgModuleFactory<WithCustomElements>) => {
          const moduleRef = factory.create(this.moduleRef.injector);
          const customElements = moduleRef.instance.customElements;
          const bootstrapFn = () => Promise.resolve(moduleRef);

          return this.registerAsCustomElements(customElements, bootstrapFn);
        });
  }
}
