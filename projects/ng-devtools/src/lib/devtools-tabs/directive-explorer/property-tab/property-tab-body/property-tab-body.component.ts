import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { Descriptor, DirectivesProperties } from 'protocol';
import { IndexedNode } from '../../directive-forest/index-forest';
import { PropertyViewComponent } from './property-view/property-view.component';

@Component({
  templateUrl: './property-tab-body.component.html',
  selector: 'ng-property-tab-body',
  styleUrls: ['./property-tab-body.component.css'],
})
export class PropertyTabBodyComponent {
  @Input() directivesData: DirectivesProperties | null = null;
  @Input() currentSelectedElement: IndexedNode;

  @Output() copyPropData = new EventEmitter<{ [key: string]: Descriptor }>();

  @ViewChildren(PropertyViewComponent) propertyViews: QueryList<PropertyViewComponent>;

  nameTracking(_: number, item: { key: string }): string {
    return item.key;
  }
}
