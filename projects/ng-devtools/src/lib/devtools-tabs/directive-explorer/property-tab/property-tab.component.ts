import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IndexedNode } from '../directive-forest/index-forest';
import { Descriptor, DirectivesProperties, Events, MessageBus } from 'protocol';
import { PropertyTabBodyComponent } from './property-tab-body/property-tab-body.component';

@Component({
  templateUrl: './property-tab.component.html',
  selector: 'ng-property-tab',
})
export class PropertyTabComponent {
  @Input() currentSelectedElement: IndexedNode;
  @Input() directivesData: DirectivesProperties | null = null;

  @Output() viewSource = new EventEmitter<void>();
  @Output() copyPropData = new EventEmitter<{ [key: string]: Descriptor }>();

  @ViewChild(PropertyTabBodyComponent) propertyTabBody: PropertyTabBodyComponent;
}
