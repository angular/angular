import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IndexedNode } from '../directive-forest/index-forest';
import { Descriptor, DirectivesProperties, Events, MessageBus } from 'protocol';

@Component({
  templateUrl: './property-tab.component.html',
  selector: 'ng-property-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyTabComponent {
  @Input() messageBus: MessageBus<Events>;
  @Input() currentSelectedElement: IndexedNode;
  @Input() directivesData: DirectivesProperties | null = null;

  @Output() viewSource = new EventEmitter<void>();
  @Output() copyPropData = new EventEmitter<{ [key: string]: Descriptor }>();
}
