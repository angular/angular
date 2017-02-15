/* tslint:disable component-selector */
import { Component } from '@angular/core';
import { DocMetadataService } from '../nav-engine';

@Component({
  selector: 'doc-title',
  template: '<h1 class="docs-primary-header">{{title}}</h1>'
})
export class DocTitleComponent {
  title: string;
  constructor(metadataService: DocMetadataService) {
    this.title = metadataService.metadata.title;
  }
}
