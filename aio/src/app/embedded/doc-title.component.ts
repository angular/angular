/* tslint:disable component-selector */
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { DocumentService } from 'app/documents/document.service';

@Component({
  selector: 'doc-title',
  template: '<h1 class="docs-primary-header">{{title | async}}</h1>'
})
export class DocTitleComponent {
  title: Observable<string>;
  constructor(docs: DocumentService) {
    this.title = docs.currentDocument.map(doc => doc.title);
  }
}
