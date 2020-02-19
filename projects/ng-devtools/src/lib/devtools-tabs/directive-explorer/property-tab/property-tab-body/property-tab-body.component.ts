import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Descriptor, DirectiveID, DirectivesProperties, Events, MessageBus } from 'protocol';
import { IndexedNode } from '../../directive-forest/index-forest';

@Component({
  templateUrl: './property-tab-body.component.html',
  selector: 'ng-property-tab-body',
  styleUrls: ['./property-tab-body.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyTabBodyComponent {
  @Input() messageBus: MessageBus<Events>;
  @Input() directivesData: DirectivesProperties | null = null;
  @Input() currentSelectedElement: IndexedNode;

  @Output() copyPropData = new EventEmitter<{ [key: string]: Descriptor }>();

  nameTracking(_: number, item: { key: string }): string {
    return item.key;
  }

  getEntityID(name: string): DirectiveID {
    const idx: DirectiveID = {
      element: this.currentSelectedElement.id,
    };
    const cmp = this.currentSelectedElement.component;
    if (cmp && cmp.name === name) {
      return idx;
    }
    idx.directive = this.currentSelectedElement.directives.findIndex(d => d.name === name);
    return idx;
  }
}
