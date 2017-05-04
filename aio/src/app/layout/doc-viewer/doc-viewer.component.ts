import {
  Component, ComponentFactory, ComponentFactoryResolver, ComponentRef,
  DoCheck, ElementRef, EventEmitter, Injector, Input, OnDestroy,
  Output, ViewEncapsulation
} from '@angular/core';

import { EmbeddedComponents } from 'app/embedded/embedded.module';
import { DocumentContents } from 'app/documents/document.service';
import { Title } from '@angular/platform-browser';
import { TocService } from 'app/shared/toc.service';

interface EmbeddedComponentFactory {
  contentPropertyName: string;
  factory: ComponentFactory<any>;
}

// Initialization prevents flicker once pre-rendering is on
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';

@Component({
  selector: 'aio-doc-viewer',
  template: ''
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.Native
})
export class DocViewerComponent implements DoCheck, OnDestroy {

  private embeddedComponents: ComponentRef<any>[] = [];
  private embeddedComponentFactories: Map<string, EmbeddedComponentFactory> = new Map();
  private hostElement: HTMLElement;

  @Output()
  docRendered = new EventEmitter();

  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    elementRef: ElementRef,
    embeddedComponents: EmbeddedComponents,
    private injector: Injector,
    private titleService: Title,
    private tocService: TocService
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
  set doc(newDoc: DocumentContents) {
    this.ngOnDestroy();
    if (newDoc) {
      this.build(newDoc);
      this.docRendered.emit();
    }
  }

  /**
   * Add doc content to host element and build it out with embedded components
   */
  private build(doc: DocumentContents) {

    // security: the doc.content is always authored by the documentation team
    // and is considered to be safe
    this.hostElement.innerHTML = doc.contents || '';

    if (!doc.contents) { return; }

    this.addTitleAndToc(doc.id);

    // TODO(i): why can't I use for-of? why doesn't typescript like Map#value() iterators?
    this.embeddedComponentFactories.forEach(({ contentPropertyName, factory }, selector) => {
      const embeddedComponentElements = this.hostElement.querySelectorAll(selector);

      // cast due to https://github.com/Microsoft/TypeScript/issues/4947
      for (const element of embeddedComponentElements as any as HTMLElement[]){
        // hack: preserve the current element content because the factory will empty it out
        // security: the source of this innerHTML is always authored by the documentation team
        // and is considered to be safe
        element[contentPropertyName] = element.innerHTML;
        this.embeddedComponents.push(factory.create(this.injector, [], element));
      }
    });
  }

  private addTitleAndToc(docId: string) {
    this.tocService.reset();
    let title = '';
    const titleEl = this.hostElement.querySelector('h1');
    // Only create TOC for docs with an <h1> title
    // If you don't want a TOC, add "no-toc" class to <h1>
    if (titleEl) {
      title = titleEl.innerText.trim();
      if (!/(no-toc|notoc)/i.test(titleEl.className)) {
        this.tocService.genToc(this.hostElement, docId);
        titleEl.insertAdjacentHTML('afterend', '<aio-toc class="embedded"></aio-toc>');
      }
    }
    this.titleService.setTitle(title ? `Angular - ${title}` : 'Angular');
  }

  ngDoCheck() {
    this.embeddedComponents.forEach(comp => comp.changeDetectorRef.detectChanges());
  }

  ngOnDestroy() {
    // destroy these components else there will be memory leaks
    this.embeddedComponents.forEach(comp => comp.destroy());
    this.embeddedComponents.length = 0;
  }

  /**
   * Compute the component content property name by converting the selector to camelCase and appending
   * 'Content', e.g. live-example => liveExampleContent
   */
  private selectorToContentPropertyName(selector: string) {
    return selector.replace(/-(.)/g, (match, $1) => $1.toUpperCase()) + 'Content';
  }
}
