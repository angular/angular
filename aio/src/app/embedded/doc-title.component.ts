/* tslint:disable component-selector */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'doc-title',
  template: '<h1 class="docs-primary-header">{{title}}</h1>'
})
export class DocTitleComponent {
  @Input() title: string;
}
