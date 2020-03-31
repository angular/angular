import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IndexedNode } from '../directive-forest/index-forest';
import { PropertyTabBodyComponent } from './property-tab-body/property-tab-body.component';

@Component({
  templateUrl: './property-tab.component.html',
  selector: 'ng-property-tab',
})
export class PropertyTabComponent {
  @Input() currentSelectedElement: IndexedNode;
  @Output() viewSource = new EventEmitter<void>();

  @ViewChild(PropertyTabBodyComponent) propertyTabBody: PropertyTabBodyComponent;
}
