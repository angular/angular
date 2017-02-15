import {
  Component, ComponentFactory, ComponentFactoryResolver, ComponentRef,
  DoCheck, ElementRef, Injector, Input, OnDestroy, ViewEncapsulation
} from '@angular/core';

import { Doc, DocMetadata, DocMetadataService, NavNode } from '../nav-engine';
import { EmbeddedComponents } from '../embedded';

interface EmbeddedComponentFactory {
  contentPropertyName: string;
  factory: ComponentFactory<any>;
}

// Initialization prevents flicker once pre-rendering is on
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';

@Component({
  selector: 'aio-doc-viewer',
  template: '',
  providers: [ DocMetadataService ],
  styles: [ `
    :host >>> doc-title.not-found h1 {
      color: white;
      background-color: red;
    }
  `]
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.Native
})
export class DocViewerComponent implements DoCheck, OnDestroy {

  private displayedDoc: DisplayedDoc;
  private embeddedComponentFactories: Map<string, EmbeddedComponentFactory> = new Map();
  private hostElement: HTMLElement;

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    elementRef: ElementRef,
    embeddedComponents: EmbeddedComponents,
    private docMetadataService: DocMetadataService,
    private injector: Injector
    ) {
    this.hostElement = elementRef.nativeElement;
    // Security: the initialDocViewerContent comes from the prerendered DOM and is considered to be secure
    this.hostElement.innerHTML = initialDocViewerContent;

    for (const component of embeddedComponents.components) {
      const factory = componentFactoryResolver.resolveComponentFactory(component);
      const selector = factory.selector;
      const contentPropertyName = this.selectorToContentPropertyName(selector);
      this.embeddedComponentFactories.set(selector, { contentPropertyName, factory });
    }
  }

  @Input()
  set doc(newDoc: Doc) {
    this.ngOnDestroy();
    if (newDoc) {
      this.docMetadataService.metadata = newDoc.metadata;
      window.scrollTo(0, 0);
      this.build(newDoc);
    }
  }

  /**
   * Add doc content to host element and build it out with embedded components
   */
  private build(doc: Doc) {

    const displayedDoc = this.displayedDoc = new DisplayedDoc(doc);

    // security: the doc.content is always authored by the documentation team
    // and is considered to be safe
    this.hostElement.innerHTML = doc.content || '';

    if (!doc.content) { return; }

    // TODO(i): why can't I use for-of? why doesn't typescript like Map#value() iterators?
    this.embeddedComponentFactories.forEach(({ contentPropertyName, factory }, selector) => {
      const embeddedComponentElements = this.hostElement.querySelectorAll(selector);

      // cast due to https://github.com/Microsoft/TypeScript/issues/4947
      for (const element of embeddedComponentElements as any as HTMLElement[]){
        // hack: preserve the current element content because the factory will empty it out
        // security: the source of this innerHTML is always authored by the documentation team
        // and is considered to be safe
        element[contentPropertyName] = element.innerHTML;
        displayedDoc.addEmbeddedComponent(factory.create(this.injector, [], element));
      }
    });
  }

  ngDoCheck() {
    if (this.displayedDoc) { this.displayedDoc.detectChanges(); }
  }

  ngOnDestroy() {
    // destroy components otherwise there will be memory leaks
    if (this.displayedDoc) {
      this.displayedDoc.destroy();
      this.displayedDoc = undefined;
    }
  }

  /**
   * Compute the component content property name by converting the selector to camelCase and appending
   * 'Content', e.g. live-example => liveExampleContent
   */
  private selectorToContentPropertyName(selector: string) {
    return selector.replace(/-(.)/g, (match, $1) => $1.toUpperCase()) + 'Content';
  }
}

class DisplayedDoc {

  metadata: DocMetadata;

  private embeddedComponents: ComponentRef<any>[] = [];

  constructor(doc: Doc) {
    // ignore doc.content ... don't need to keep it around
    this.metadata = doc.metadata;
  }

  addEmbeddedComponent(component: ComponentRef<any>) {
    this.embeddedComponents.push(component);
  }

  detectChanges() {
    this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
  }

  destroy() {
    // destroy components otherwise there will be memory leaks
    this.embeddedComponents.forEach(comp => comp.destroy());
    this.embeddedComponents.length = 0;
  }
}
