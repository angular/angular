import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlatNode } from '../component-data-source';

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css'],
})
export class BreadcrumbsComponent {
  @Input() parents: FlatNode[];
  @Output() handleSelect = new EventEmitter();
}
