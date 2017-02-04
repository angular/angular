import { Injectable, ComponentFactory, ComponentFactoryResolver, ComponentRef, Injector } from '@angular/core';

import { Doc, DocMetadata } from '../model';
import { EmbeddedComponents } from '../embedded';

interface EmbeddedComponentFactory {
  contentPropertyName: string;
  factory: ComponentFactory<any>;
}

@Injectable()
export class DocBuilderService {

  private embeddedComponentFactories: Map<string, EmbeddedComponentFactory> = new Map();

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    embeddedComponents: EmbeddedComponents) {

    for (const component of embeddedComponents.components) {
      const factory = componentFactoryResolver.resolveComponentFactory(component);
      const selector = factory.selector;
      const contentPropertyName = this.selectorToContentPropertyName(selector);
      this.embeddedComponentFactories.set(selector, { contentPropertyName, factory });
    }
  }

  /**
   * Add doc content to host element and build it out with embedded components
   * nb: mutates doc instance, setting its embeddedComponents
   */
  build(hostElement: HTMLElement, injector: Injector, doc: Doc) {

    // security: the doc.content is always authored by the documentation team
    // and is considered to be safe
    hostElement.innerHTML = doc.content || '';

    if (!doc.content) { return doc; }

    // TODO(i): why can't I use for-of? why doesn't typescript like Map#value() iterators?
    this.embeddedComponentFactories.forEach((ecf, selector) => {
      const { contentPropertyName, factory } = ecf;
      const embeddedComponentElements = hostElement.querySelectorAll(selector);

      // cast due to https://github.com/Microsoft/TypeScript/issues/4947
      for (const element of embeddedComponentElements as any as HTMLElement[]){
        // hack: preserve the current element content because the factory will empty it out
        // security: the source of this innerHTML is always authored by the documentation team
        // and is considered to be safe
        element[contentPropertyName] = element.innerHTML;
        doc.addEmbeddedComponent(factory.create(injector, [], element));
      }
    });

    return doc;
  }

  /**
   * Compute the component content property name by converting the selector to camelCase and appending
   * 'Content', e.g. live-example => liveExampleContent
   */
  selectorToContentPropertyName(selector: string) {
    return selector.replace(/-(.)/g, (match, $1) => $1.toUpperCase()) + 'Content';
  }

}
