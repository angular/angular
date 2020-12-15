import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlatNode } from '../directive-forest/component-data-source';

@Component({
  selector: 'ng-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent {
  @Input() parents: FlatNode[];
  @Output() handleSelect = new EventEmitter();
  @Output() mouseOverNode = new EventEmitter();
  @Output() mouseLeaveNode = new EventEmitter();
}
