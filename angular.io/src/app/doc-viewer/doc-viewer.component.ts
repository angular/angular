import { Component, Input, ElementRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'aio-doc-viewer',
  template: ''
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.Native
})
export class DocViewerComponent {

  @Input()
  set doc(currentDoc) {
    if (currentDoc) {
      this.element.nativeElement.innerHTML = currentDoc.content;
    }
  }

  constructor(private element: ElementRef) { }

}
