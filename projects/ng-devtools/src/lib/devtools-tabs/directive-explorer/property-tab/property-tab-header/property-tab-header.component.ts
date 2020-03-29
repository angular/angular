import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IndexedNode } from '../../directive-forest/index-forest';

@Component({
  templateUrl: './property-tab-header.component.html',
  selector: 'ng-property-tab-header',
  styleUrls: ['./property-tab-header.component.scss'],
})
export class PropertyTabHeaderComponent {
  @Input() currentSelectedElement: IndexedNode;
  @Output() viewSource = new EventEmitter<void>();
}
