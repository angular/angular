import { Component, Input } from '@angular/core';
import { Descriptor, MessageBus, Events, DirectiveID, NestedProp } from 'protocol';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PropertyDataSource, FlatNode } from './property-data-source';
import { getExpandedDirectiveProperties } from './property-expanded-directive-properties';

@Component({
  selector: `ng-property-view`,
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
})
export class PropertyViewComponent {
  @Input() set data(data: { [prop: string]: Descriptor }) {
    if (this.dataSource) {
      this.dataSource.update(data);
      return;
    }
    this.dataSource = new PropertyDataSource(data, this.treeControl, this.entityID, this.messageBus);
  }
  @Input() messageBus: MessageBus<Events>;
  @Input() entityID: DirectiveID;
  @Input() name: string;

  dataSource: PropertyDataSource;

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  hasChild = (_: number, node: FlatNode) => node.expandable;

  toggle(node: FlatNode): void {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      return;
    }
    this.expand(node);
  }

  expand(node: FlatNode): void {
    const { prop } = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this.treeControl.expand(node);
  }

  getExpandedProperties(): NestedProp[] {
    return getExpandedDirectiveProperties(this.dataSource.data);
  }
}
