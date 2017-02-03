import { Component,  DoCheck, ElementRef, Injector, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DocBuilderService } from '../nav-engine';
import { Doc } from '../model';

// TODO: Ask Igor why we're doing this
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';

@Component({
  selector: 'aio-doc-viewer',
  template: ''
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.Native
})
export class DocViewerComponent implements DoCheck, OnDestroy {

  private currentDoc: Doc;
  private hostElement: HTMLElement;

  constructor(
    elementRef: ElementRef,
    private injector: Injector,
    private builder: DocBuilderService) {
      this.hostElement = elementRef.nativeElement;
      // Security: the initialDocViewerContent comes from the prerendered DOM as is considered to be secure
      this.hostElement.innerHTML = initialDocViewerContent;
    }

  @Input()
  set doc(newDoc: Doc) {
    // TODO: don't change anything if the doc metadata is actually the same as current?
    this.ngOnDestroy();
    if (newDoc) {
      window.scrollTo(0, 0);
      this.currentDoc = this.builder.build(this.hostElement, this.injector, newDoc);
    }
  }

  ngDoCheck() {
    if (this.currentDoc) { this.currentDoc.detectChanges(); }
  }

  ngOnDestroy() {
    // destroy components otherwise there will be memory leaks
    if (this.currentDoc) {
      this.currentDoc.destroy();
      this.currentDoc = undefined;
    }
  }
}
