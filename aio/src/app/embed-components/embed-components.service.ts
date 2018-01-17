import {
  ComponentFactory, ComponentFactoryResolver, ComponentRef, Inject, Injectable, InjectionToken,
  Injector, NgModuleFactory, NgModuleFactoryLoader, Type
} from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/switchMap';


export interface EmbeddedComponentFactory {
  contentPropertyName: string;
  factory: ComponentFactory<any>;
}

/**
 * A mapping from combined component selectors (keys) to the corresponding components (values). The
 * components can be specified either as a list of embedded components or a path to a module that
 * provides embedded components (i.e. implements `WithEmbeddedComponents`).
 */
export interface EmbeddedComponentsMap {
  [multiSelector: string]: ComponentsOrModulePath;
}

/**
 * Interface expected to be implemented by all modules that contribute components to the
 * `EmbeddedComponentsMap`.
 */
export interface WithEmbeddedComponents {
  embeddedComponents: Type<any>[];
}

/**
 * Either an array of components or the path to a module that implements `WithEmbeddedComponents`.
 */
export type ComponentsOrModulePath = Type<any>[] | string;

/**
 * The injection token for the `EmbeddedComponentsMap`.
 */
export const EMBEDDED_COMPONENTS = new InjectionToken<EmbeddedComponentsMap>('EMBEDDED_COMPONENTS');

/**
 * Embed components into an element. It takes care of indentifying the embedded components, loading
 * the necessary modules and instantiating the components.
 *
 * Embeddable components are identified and loaded based on the info in `EmbeddedComponentsMap`
 * (provided through dependency injection).
 *
 * The caller is responsible for trigering change detection and destroying the components as
 * necessary.
 */
@Injectable()
export class EmbedComponentsService {
  private componentFactoriesReady = new Map<ComponentsOrModulePath, Promise<void>>();
  protected componentFactories = new Map<string, EmbeddedComponentFactory>();

  constructor(
      private injector: Injector,
      private loader: NgModuleFactoryLoader,
      private resolver: ComponentFactoryResolver,
      @Inject(EMBEDDED_COMPONENTS) private embeddedComponentsMap: EmbeddedComponentsMap) { }

  /**
   * Embed components into the specified element:
   * - Load the necessary modules (if any).
   * - Prepare the component factories.
   * - Instantiate the components.
   *
   * Return the list of `ComponentRef`s.
   */
  embedInto(elem: HTMLElement): Observable<ComponentRef<any>[]> {
    const requiredComponents = Object.keys(this.embeddedComponentsMap)
        .filter(selector => elem.querySelector(selector))
        .map(selector => this.embeddedComponentsMap[selector]);

    const factoriesReady = requiredComponents.map(compsOrPath => this.prepareComponentFactories(compsOrPath));

    return !requiredComponents.length
        ? of([])
        : of(undefined)
              .switchMap(() => Promise.all(factoriesReady))
              .switchMap(() => [this.createComponents(elem)]);
  }

  /**
   * Resolve the embedded component factories (which will later be used to instantiate components).
   */
  protected createComponentFactories(components: Type<any>[], resolver: ComponentFactoryResolver): void {
    for (const comp of components) {
      const factory = resolver.resolveComponentFactory(comp);
      const selector = factory.selector;
      const contentPropertyName = this.selectorToContentPropertyName(selector);
      this.componentFactories.set(selector, {contentPropertyName, factory});
    }
  }

  /**
   * Instantiate embedded components for the current contents of `elem`.
   * (Store the original HTML contents of each element on the corresponding property for later
   *  retrieval by the component instance.)
   */
  protected createComponents(elem: HTMLElement): ComponentRef<any>[] {
    const componentRefs: ComponentRef<any>[] = [];

    this.componentFactories.forEach(({contentPropertyName, factory}, selector) => {
      const componentHosts = elem.querySelectorAll(selector);

      // Cast due to https://github.com/Microsoft/TypeScript/issues/4947.
      for (const host of componentHosts as any as HTMLElement[]) {
        // Hack: Preserve the current element content, because the factory will empty it out.
        // Security: The source of this `innerHTML` should always be authored by the documentation
        //           team and is considered to be safe.
        (host as any)[contentPropertyName] = host.innerHTML;
        componentRefs.push(factory.create(this.injector, [], host));
      }
    });

    return componentRefs;
  }

  /**
   * Prepare the component factories for the given components.
   * If necessary, load and instantiate the module first.
   */
  protected prepareComponentFactories(compsOrPath: ComponentsOrModulePath): Promise<void> {
    if (!this.componentFactoriesReady.has(compsOrPath)) {
      const componentsAndResolverPromise = (typeof compsOrPath !== 'string')
          ? Promise.resolve({components: compsOrPath, resolver: this.resolver})
          : this.loader.load(compsOrPath).then((ngModuleFactory: NgModuleFactory<WithEmbeddedComponents>) => {
              const moduleRef = ngModuleFactory.create(this.injector);
              return {
                components: moduleRef.instance.embeddedComponents,
                resolver: moduleRef.componentFactoryResolver,
              };
            });

      const readyPromise = componentsAndResolverPromise
          .then(({components, resolver}) => this.createComponentFactories(components, resolver));

      this.componentFactoriesReady.set(compsOrPath, readyPromise);
    }

    return this.componentFactoriesReady.get(compsOrPath)!;
  }

  /**
   * Compute the component content property name by converting the selector to camelCase and
   * appending `Content`, e.g. `live-example` => `liveExampleContent`.
   */
  protected selectorToContentPropertyName(selector: string): string {
    return selector.replace(/-(.)/g, (match, $1) => $1.toUpperCase()) + 'Content';
  }
}
