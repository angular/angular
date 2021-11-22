import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IndexedNode } from '../directive-forest/index-forest';
import { FlatNode } from '../property-resolver/element-property-resolver';
import { DirectivePosition } from 'protocol';

@Component({
  templateUrl: './property-tab.component.html',
  selector: 'ng-property-tab',
})
export class PropertyTabComponent {
  @Input() currentSelectedElement: IndexedNode;
  @Output() viewSource = new EventEmitter<void>();
  @Output() inspect = new EventEmitter<{ node: FlatNode; directivePosition: DirectivePosition }>();
}
