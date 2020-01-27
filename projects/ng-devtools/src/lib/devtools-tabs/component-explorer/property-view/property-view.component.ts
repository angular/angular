import { Component, Input } from '@angular/core';
import { Descriptor, MessageBus, Events, DirectiveID, NestedProp, PropType } from 'protocol';
import { FlatTreeControl } from '@angular/cdk/tree';
import { PropertyDataSource, FlatNode } from './property-data-source';

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

  toggle(node: FlatNode) {
    if (this.treeControl.isExpanded(node)) {
      this.treeControl.collapse(node);
      return;
    }
    this.expand(node);
  }

  expand(node: FlatNode) {
    const { prop } = node;
    if (!prop.descriptor.expandable) {
      return;
    }
    this.treeControl.expand(node);
  }

  getExpandedProperties() {
    return getExpandedDirectiveProperties(this.dataSource.data);
  }
}

const getExpandedDirectiveProperties = (data: FlatNode[]): NestedProp[] => {
  const getChildren = (prop: Descriptor) => {
    if ((prop.type === PropType.Object || prop.type === PropType.Array) && prop.value) {
      return Object.keys(prop.value).map(k => {
        return {
          name: prop.type === PropType.Array ? parseInt(k, 10) : k,
          children: getChildren(prop.value[k]),
        };
      });
    }
    return [];
  };

  const getExpandedProperties = (props: { [name: string]: Descriptor }) => {
    return Object.keys(props).map(name => {
      return {
        name,
        children: getChildren(props[name]),
      };
    });
  };

  const parents: {[name: string]: Descriptor} = {};

  for (const node of data) {
    let prop = node.prop;
    while (prop.parent) {
      prop = prop.parent;
    }
    parents[prop.name] = prop.descriptor;
  }

  return getExpandedProperties(parents);
};
