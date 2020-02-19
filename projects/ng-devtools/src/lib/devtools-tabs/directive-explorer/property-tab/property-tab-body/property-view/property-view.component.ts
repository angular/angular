import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Descriptor, MessageBus, Events, DirectivePosition, NestedProp } from 'protocol';
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode, Property, PropertyDataSource } from './property-data-source';
import { getExpandedDirectiveProperties } from './property-expanded-directive-properties';

@Component({
  selector: `ng-property-view`,
  templateUrl: './property-view.component.html',
  styleUrls: ['./property-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @Input() entityID: DirectivePosition;
  @Input() name: string;

  dataSource: PropertyDataSource;

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  );

  hasChild = (_: number, node: FlatNode): boolean => node.expandable;

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

  updateValue({ key, newValue }, node): void {
    const directiveId = this.entityID;
    const keyPath = this._constructPathOfKeysToPropertyValue(node.prop);
    this.messageBus.emit('updateState', [{ directiveId, keyPath, newValue }]);
    node.prop.descriptor.value = newValue;
  }

  private _constructPathOfKeysToPropertyValue(nodePropToGetKeysFor: Property, keys: string[] = []): string[] {
    keys.unshift(nodePropToGetKeysFor.name);
    const parentNodeProp = nodePropToGetKeysFor.parent;
    if (parentNodeProp) {
      this._constructPathOfKeysToPropertyValue(parentNodeProp, keys);
    }
    return keys;
  }
}
